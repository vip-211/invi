/* ============================================================
   Background music (shared by both invitation sites)
   - If "music.mp3" exists next to index.html, it plays that (loop).
   - Otherwise it plays a soft built-in ambience (drone + bell notes).
   - Starts on the guest's first tap (browsers require a tap), and a
     round button (bottom-left) lets them pause / resume.
   ============================================================ */
(function () {
  const script = document.currentScript;
  const dark = (script && script.dataset.theme) === "dark";
  const FILE = (script && script.dataset.file) || "music.mp3";
  const LOW = (script && script.dataset.low) === "1";   // lower, calmer pitch

  /* ---------- button ---------- */
  const css = document.createElement("style");
  css.textContent = `
  #musicBtn{position:fixed;left:12px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:70;width:46px;height:46px;border-radius:50%;
    display:grid;place-items:center;cursor:pointer;border:1px solid ${dark ? "rgba(244,200,112,.75)" : "#c9a45c"};
    background:${dark ? "rgba(30,8,4,.85)" : "rgba(255,250,240,.94)"};box-shadow:0 4px 16px rgba(0,0,0,${dark ? ".5" : ".22"});backdrop-filter:blur(6px);
    color:${dark ? "#f4c870" : "#46563b"};transition:transform .2s}
  #musicBtn:active{transform:scale(.92)}
  #musicBtn .eq{display:flex;gap:3px;align-items:flex-end;height:18px}
  #musicBtn .eq i{width:3px;height:6px;border-radius:2px;background:currentColor;transition:height .3s}
  #musicBtn.playing .eq i{animation:eqb .9s ease-in-out infinite}
  #musicBtn.playing .eq i:nth-child(2){animation-delay:-.3s}
  #musicBtn.playing .eq i:nth-child(3){animation-delay:-.6s}
  #musicBtn.playing .eq i:nth-child(4){animation-delay:-.15s}
  #musicBtn.off::after{content:"";position:absolute;width:26px;height:2px;background:currentColor;transform:rotate(-45deg);border-radius:2px}
  @keyframes eqb{0%,100%{height:5px}50%{height:18px}}
  @media (prefers-reduced-motion:reduce){#musicBtn.playing .eq i{animation:none;height:12px}}`;
  document.head.appendChild(css);

  const btn = document.createElement("button");
  btn.id = "musicBtn"; btn.type = "button";
  btn.setAttribute("aria-label", "Play or pause music");
  btn.innerHTML = '<span class="eq"><i></i><i></i><i></i><i></i></span>';
  document.body.appendChild(btn);

  /* ---------- state ---------- */
  let mode = null;            // "file" | "synth"
  let wantOn = true;          // guest's choice
  let started = false;
  try { if (localStorage.getItem("music") === "off") wantOn = false; } catch (e) {}
  function setUI(on) { btn.classList.toggle("playing", on); btn.classList.toggle("off", !on); }
  setUI(false); btn.classList.add("off");

  /* ---------- file player ---------- */
  let audio = null;
  function fileStart() {
    return new Promise(res => {
      audio = new Audio(FILE); audio.loop = true; audio.preload = "auto"; audio.volume = 0;
      let settled = false;
      audio.addEventListener("error", () => { if (!settled) { settled = true; res(false); } }, { once: true });
      audio.addEventListener("canplay", () => {
        if (settled) return; settled = true;
        audio.play().then(() => { fade(audio, .65); res(true); }).catch(() => res(false));
      }, { once: true });
      audio.load();
      setTimeout(() => { if (!settled) { settled = true; res(false); } }, 4000);
    });
  }
  function fade(a, to) { const t = setInterval(() => { a.volume = Math.max(0, Math.min(1, a.volume + (to > a.volume ? .03 : -.03))); if (Math.abs(a.volume - to) < .04) { a.volume = to; clearInterval(t); } }, 60); }

  /* ---------- built-in ambience ---------- */
  let ctx = null, master = null, timer = null, nodes = [];
  const SA = LOW ? 110 : 130.81;                                   // A2 / C3
  const SCALE = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3].map(r => r * SA * 4); // pentatonic, 2 octaves up
  function synthStart() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = ctx || new AC();
    ctx.resume && ctx.resume();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(.9, ctx.currentTime + 3);

    // echo
    const delay = ctx.createDelay(1.5); delay.delayTime.value = .42;
    const fb = ctx.createGain(); fb.gain.value = .38;
    const wet = ctx.createGain(); wet.gain.value = .5;
    delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);
    const bus = ctx.createGain(); bus.connect(master); bus.connect(delay);

    // tanpura-like drone: Sa – Pa – Sa – low Sa
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1100; lp.connect(master);
    [[SA, .07], [SA * 1.5, .05], [SA * 2, .05], [SA / 2, .06]].forEach(([f, g], i) => {
      [-3, 3].forEach(det => {
        const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f; o.detune.value = det;
        const gg = ctx.createGain(); gg.gain.value = g;
        const lfo = ctx.createOscillator(); lfo.frequency.value = .08 + i * .03;
        const lg = ctx.createGain(); lg.gain.value = g * .55;
        lfo.connect(lg); lg.connect(gg.gain);
        o.connect(gg); gg.connect(lp); o.start(); lfo.start(); nodes.push(o, lfo);
      });
    });

    // bell notes, gentle random walk on the scale
    let idx = 2;
    function bell() {
      if (!ctx || ctx.state === "closed") return;
      idx = Math.max(0, Math.min(SCALE.length - 1, idx + [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)]));
      const f = SCALE[idx], t = ctx.currentTime, len = 3.2;
      [[1, .09], [2.01, .035], [3.02, .018]].forEach(([m, g]) => {
        const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f * m;
        const e = ctx.createGain(); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + .012);
        e.gain.exponentialRampToValueAtTime(.0001, t + len / m);
        o.connect(e); e.connect(bus); o.start(t); o.stop(t + len);
      });
      timer = setTimeout(bell, 1800 + Math.random() * 2600);
    }
    bell();
    return true;
  }
  function synthStop() {
    clearTimeout(timer);
    if (!ctx) return;
    try { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(0, ctx.currentTime + .6); } catch (e) {}
    const c = ctx, n = nodes; ctx = null; nodes = [];
    setTimeout(() => { n.forEach(o => { try { o.stop(); } catch (e) {} }); try { c.close(); } catch (e) {} }, 800);
  }

  /* ---------- control ---------- */
  async function play() {
    if (mode === null) mode = (await fileStart()) ? "file" : "synth";
    if (mode === "file") { audio.play().then(() => fade(audio, .65)).catch(() => {}); setUI(true); }
    else { setUI(synthStart()); }
  }
  function pause() {
    if (mode === "file" && audio) { fade(audio, 0); setTimeout(() => audio.pause(), 700); }
    else synthStop();
    setUI(false);
  }
  btn.addEventListener("click", e => {
    e.stopPropagation();
    wantOn = !btn.classList.contains("playing");
    try { localStorage.setItem("music", wantOn ? "on" : "off"); } catch (e) {}
    started = true;
    wantOn ? play() : pause();
  });

  // start on the first tap anywhere (needed by browsers)
  function firstTap(e) {
    if (started || (e.target && e.target.closest && e.target.closest("#musicBtn"))) return;
    started = true;
    document.removeEventListener("click", firstTap, true);
    document.removeEventListener("touchend", firstTap, true);
    if (wantOn) play();
  }
  document.addEventListener("click", firstTap, true);
  document.addEventListener("touchend", firstTap, true);

  // be polite: pause when the tab is hidden
  document.addEventListener("visibilitychange", () => {
    if (!started || !wantOn) return;
    if (document.hidden) { if (btn.classList.contains("playing")) { pause(); btn.dataset.resume = "1"; } }
    else if (btn.dataset.resume) { delete btn.dataset.resume; play(); }
  });
})();
