/* ============================================================
   EDIT EVERYTHING HERE — names, date, venue, timings, phone
   ============================================================ */
const CONFIG = {
  coupleTitle: "Nitin & Khushi — Wedding",
  // Wedding start (India time, +05:30). Format: YYYY-MM-DDTHH:MM:SS+05:30
  start: "2026-12-03T18:00:00+05:30",
  end:   "2026-12-04T02:00:00+05:30",

  venueName: "Saiganj, Bharwari",
  // Used for the Google Map + directions. Replace with a hall/lawn name or
  // exact pin text (e.g. "Shree Ram Garden, Bharwari, Kausambi") for a sharper pin.
  mapQuery: "Saiganj, Bharwari, Kausambi, Uttar Pradesh 212201",

  // WhatsApp number with country code, digits only (e.g. "919876543210"). Leave "" to hide button.
  whatsapp: "",

  // NOTE: timings below are SAMPLE — change to your real schedule.
  icons: ["🥂","🐎","💐","🍽️","🔥","🌸"],
  timeline: [
    { t: "3 Dec · 4:00 PM", h: "Guest Arrival",        d: "Welcome drinks & refreshments" },
    { t: "3 Dec · 6:00 PM", h: "Baraat Aagman",        d: "The groom’s procession arrives with music & dance" },
    { t: "3 Dec · 7:30 PM", h: "Jaimala",              d: "The exchange of garlands" },
    { t: "3 Dec · 8:30 PM", h: "Wedding Dinner",       d: "Join us for a festive feast" },
    { t: "3 Dec · 10:30 PM", h: "Vivah · Saat Phere",  d: "The sacred wedding rituals" },
    { t: "4 Dec · Morning", h: "Vidaai",               d: "A tearful, blessed farewell" }
  ]
};

/* ============================================================ */
const $ = s => document.querySelector(s);
const enc = encodeURIComponent;

/* ---------- map + links ---------- */
$("#vName").textContent = CONFIG.venueName;
$("#mapFrame").src = `https://www.google.com/maps?q=${enc(CONFIG.mapQuery)}&z=15&output=embed`;
$("#dirBtn").href = `https://www.google.com/maps/dir/?api=1&destination=${enc(CONFIG.mapQuery)}&travelmode=driving`;
$("#mapBtn").href = `https://www.google.com/maps/search/?api=1&query=${enc(CONFIG.mapQuery)}`;
if (CONFIG.whatsapp) {
  const w = $("#wa"); w.hidden = false;
  w.href = `https://wa.me/${CONFIG.whatsapp}?text=${enc("Namaste! We are happy to attend Nitin & Khushi’s wedding on 3rd December 2026. 🙏")}`;
}

/* ---------- timeline ---------- */
$("#timeline").innerHTML = CONFIG.timeline.map(e =>
  `<li class="reveal"><span class="ic">${CONFIG.icons[CONFIG.timeline.indexOf(e)]||"✦"}</span><span class="when">${e.t}</span><h4>${e.h}</h4><p>${e.d}</p></li>`).join("");

/* ---------- calendar ---------- */
const fmt = d => new Date(d).toISOString().replace(/[-:]|\.\d{3}/g, "");
const details = `Wedding of Nitin Chaurasiya & Khushi Chaurasiya.\nVenue: ${CONFIG.mapQuery}`;
$("#gcal").href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${enc(CONFIG.coupleTitle)}&dates=${fmt(CONFIG.start)}/${fmt(CONFIG.end)}&details=${enc(details)}&location=${enc(CONFIG.mapQuery)}`;
const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Wedding//EN","BEGIN:VEVENT",
  `UID:nitin-khushi-${fmt(CONFIG.start)}@wedding`,`DTSTAMP:${fmt(new Date())}`,
  `DTSTART:${fmt(CONFIG.start)}`,`DTEND:${fmt(CONFIG.end)}`,
  `SUMMARY:${CONFIG.coupleTitle}`,`LOCATION:${CONFIG.mapQuery}`,
  `DESCRIPTION:Wedding of Nitin Chaurasiya & Khushi Chaurasiya`,"END:VEVENT","END:VCALENDAR"].join("\r\n");
$("#ics").href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));

/* ---------- share ---------- */
$("#share").addEventListener("click", async () => {
  const data = { title: "Nitin & Khushi's Wedding", text: "You're invited! 3rd Dec 2026 💍", url: location.href };
  try { navigator.share ? await navigator.share(data) : (await navigator.clipboard.writeText(location.href), $("#share").textContent = "Link copied ✓"); } catch (e) {}
});

/* ---------- countdown ---------- */
const target = new Date(CONFIG.start).getTime();
const pad = n => String(n).padStart(2, "0");
function tick() {
  let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
  [["#cd", Math.floor(s / 86400)], ["#ch", Math.floor(s % 86400 / 3600)], ["#cm", Math.floor(s % 3600 / 60)], ["#cs", s % 60]].forEach(([id, v]) => {
    const el = $(id), t = pad(v);
    if (el.textContent !== t) { el.textContent = t; el.classList.remove("tickpop"); void el.offsetWidth; el.classList.add("tickpop"); }
  });
}
tick(); setInterval(tick, 1000);

/* ---------- scroll reveal ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .15 });
document.querySelectorAll(".block").forEach(b => b.querySelectorAll(".reveal").forEach((el, i) => {
  if (!el.closest(".timeline")) el.style.transitionDelay = Math.min(i, 5) * .12 + "s";
}));
document.querySelectorAll(".reveal").forEach(el => {
  if (!el.closest(".hero")) io.observe(el);
});
document.querySelectorAll(".map,.venue-card,.count").forEach(el => el.classList.add("zoom"));

/* hero bokeh + intro twinkles */
const bk = $("#bokehs");
for (let i = 0; i < 16; i++) {
  const s = document.createElement("span"), z = 10 + Math.random() * 26;
  s.style.cssText = `left:${Math.random()*100}%;top:${10+Math.random()*80}%;width:${z}px;height:${z}px;--d:${5+Math.random()*6}s;animation-delay:${-Math.random()*8}s`;
  bk.appendChild(s);
}
for (let i = 0; i < 26; i++) {
  const s = document.createElement("i"); s.className = "tw";
  s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*2.4}s;transform:scale(${.5+Math.random()})`;
  $("#intro").appendChild(s);
}

/* scroll: progress bar, parallax, timeline fill */
const tl = $("#timeline"), bar = $("#progress"), mb = $("#mandalaBg");
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (max > 0 ? y / max * 100 : 0) + "%";
  if (y < innerHeight * 1.2) mb.style.translate = `0 ${y * .25}px`;
  const r = tl.getBoundingClientRect(), p = (innerHeight * .65 - r.top) / r.height;
  tl.style.setProperty("--fill", Math.max(0, Math.min(1, p)) * 100 + "%");
}
addEventListener("scroll", onScroll, { passive: true }); onScroll();
function revealHero() {
  document.querySelectorAll(".hero .reveal").forEach((el, i) =>
    setTimeout(() => el.classList.add("in"), 250 + i * 260));
}

/* ---------- opening sequence ---------- */
let opened = false;
function openInvite() {
  if (opened) return; opened = true;
  const intro = $("#intro");
  intro.classList.add("open");
  petals(true);
  setTimeout(() => { document.body.classList.remove("locked"); document.body.classList.add("opened"); revealHero(); }, 2600);
  setTimeout(() => intro.classList.add("fade"), 3300);
  setTimeout(() => intro.classList.add("done"), 4300);
}
$("#seal").addEventListener("click", openInvite);
$("#intro").addEventListener("click", openInvite);

/* ---------- falling petals / sparkles ---------- */
const pc = $("#petals"), px = pc.getContext("2d");
let P = [], W, H, burst = 0;
function size() { W = pc.width = innerWidth; H = pc.height = innerHeight; }
addEventListener("resize", size); size();
function mk(y) {
  const gold = Math.random() < .35;
  return { x: Math.random() * W, y: y ?? -20, r: 3 + Math.random() * 5, vy: .5 + Math.random() * 1.2,
    vx: (Math.random() - .5) * .6, a: Math.random() * 6, va: (Math.random() - .5) * .04,
    c: gold ? "rgba(214,178,100,.85)" : (Math.random() < .5 ? "rgba(236,170,160,.8)" : "rgba(250,216,205,.85)") };
}
function petals(big) { if (big) burst = 55; }
function loop() {
  px.clearRect(0, 0, W, H);
  if (burst > 0 && Math.random() < .9) { P.push(mk(), mk()); burst--; }
  else if (P.length < 14 && Math.random() < .03) P.push(mk());
  P = P.filter(p => p.y < H + 20);
  for (const p of P) {
    p.y += p.vy; p.x += p.vx + Math.sin(p.a) * .5; p.a += p.va + .02;
    px.save(); px.translate(p.x, p.y); px.rotate(p.a); px.fillStyle = p.c;
    px.beginPath(); px.ellipse(0, 0, p.r, p.r * .55, 0, 0, 7); px.fill(); px.restore();
  }
  requestAnimationFrame(loop);
}
loop();

/* ---------- scratch heart ---------- */
(function () {
  const cv = $("#scratch"), ctx = cv.getContext("2d", { willReadFrequently: true });
  const heart = new Path2D("M50 88C20 62 2 44 2 26 2 12 13 2 27 2c10 0 19 6 23 14 4-8 13-14 23-14 14 0 25 10 25 24 0 18-18 36-48 62z");
  let dpr, w, h, done = false, down = false, last = null;

  function paint() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const r = cv.getBoundingClientRect(); w = r.width; h = r.height;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr * w / 100, 0, 0, dpr * h / 90, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createRadialGradient(40, 28, 4, 50, 45, 60);
    g.addColorStop(0, "#c4cfb2"); g.addColorStop(.5, "#8a9c78"); g.addColorStop(1, "#5f7152");
    ctx.fillStyle = g; ctx.fill(heart);
    ctx.save(); ctx.clip(heart);
    for (let i = 0; i < 260; i++) {                    // glitter
      ctx.fillStyle = Math.random() < .5 ? "rgba(255,255,255,.55)" : "rgba(235,214,150,.7)";
      ctx.beginPath(); ctx.arc(Math.random() * 100, Math.random() * 90, Math.random() * .6 + .15, 0, 7); ctx.fill();
    }
    ctx.restore();
    ctx.lineWidth = 1; ctx.strokeStyle = "#c9a45c"; ctx.stroke(heart);
  }
  paint();

  function pos(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr]; }
  function scratch(e) {
    if (done) return;
    const [x, y] = pos(e);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = ctx.lineJoin = "round"; ctx.lineWidth = 34 * dpr / 2;
    ctx.beginPath(); ctx.moveTo(...(last || [x, y])); ctx.lineTo(x, y); ctx.stroke(); ctx.restore();
    last = [x, y];
  }
  function check() {
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data; let clear = 0, total = 0;
    for (let i = 3; i < d.length; i += 64) { total++; if (d[i] < 20) clear++; }
    // heart fills ~65% of canvas box; consider revealed when ~38% of box is clear
    if (clear / total > .38) finish();
  }
  function finish() {
    done = true; cv.classList.add("gone"); document.querySelector(".heart-text").classList.add("pop"); $("#scratchHint").textContent = "See you there! 💚";
    petals(true);
  }
  cv.addEventListener("pointerdown", e => { down = true; last = null; cv.setPointerCapture(e.pointerId); scratch(e); });
  cv.addEventListener("pointermove", e => { if (down) scratch(e); });
  const up = () => { down = false; last = null; if (!done) check(); };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
})();
