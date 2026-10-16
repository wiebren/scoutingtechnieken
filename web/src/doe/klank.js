// Sound and light for the seinen: a timeline of tones (morse, a whistle) played with WebAudio, and a callback at
// the same moments for a lamp on the screen. The AudioContext is made on the first tap or key (a browser plays no
// sound before one) and kept for the next. Used by morse.js and noodsein.js, and meant for the Seinspeler.

let ctx = null;

/** The AudioContext, made or woken up. Call it from a tap or a key; null when the browser has no WebAudio. */
export function geluid() {
  const AC = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  if (!AC) return null;
  try {
    ctx ??= new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  } catch { return null; }
  return ctx;
}

/**
 * Play a timeline: stukken = [{ van, tot, ... }] in seconds from the start, sorted, the tone on from van to tot.
 * opStand(aan, stuk) is called whenever the tone goes on or off (stuk: the last one begun), opTik(t) every frame
 * and opKlaar() at `duur` (default: the end of the last stuk). Without `metGeluid` it is only the lamp. It stops
 * by itself once `el` is no longer in the page. Returns stop().
 *
 * @param opties.hz the pitch; `triller` makes it warble like a pea whistle, by that many Hz
 */
export function speel(stukken, { el, metGeluid = true, hz = 600, volume = 0.25, triller = 0, duur, opStand, opTik, opKlaar } = {}) {
  const a = metGeluid ? geluid() : null;
  const eind = duur ?? stukken.reduce((m, s) => Math.max(m, s.tot), 0);
  // the lamp follows the clock of the sound when it runs, so the two cannot drift apart
  const audioKlok = a?.state === 'running';
  const begin = (audioKlok ? a.currentTime : performance.now() / 1000) + 0.08;
  const nu = () => (audioKlok ? a.currentTime : performance.now() / 1000) - begin;

  const knopen = [];
  if (a) {
    const start = audioKlok ? begin : a.currentTime + 0.08;
    const omhulsel = a.createGain();
    omhulsel.gain.value = 0;
    omhulsel.connect(a.destination);
    const toon = a.createOscillator();
    toon.frequency.value = hz;
    toon.connect(omhulsel);
    knopen.push(toon, omhulsel);
    if (triller) {
      const lfo = a.createOscillator();
      const diepte = a.createGain();
      lfo.frequency.value = 28;
      diepte.gain.value = triller;
      lfo.connect(diepte).connect(toon.frequency);
      lfo.start(start);
      lfo.stop(start + eind + 0.1);
      knopen.push(lfo, diepte);
    }
    // a few milliseconds up and down, or every tone begins and ends with a click
    const r = 0.005;
    for (const s of stukken) {
      omhulsel.gain.setValueAtTime(0, start + s.van);
      omhulsel.gain.linearRampToValueAtTime(volume, start + s.van + r);
      omhulsel.gain.setValueAtTime(volume, start + s.tot - r);
      omhulsel.gain.linearRampToValueAtTime(0, start + s.tot);
    }
    toon.start(start);
    toon.stop(start + eind + 0.1);
  }

  let i = -1;
  let wasAan = null;
  let wasI = null;
  let frame = 0;
  let gestopt = false;

  function stap() {
    if (el && !el.isConnected) { stop(); return; }
    const t = nu();
    if (t >= eind) { stop(); opKlaar?.(); return; }
    while (i + 1 < stukken.length && stukken[i + 1].van <= t) i++;
    const aan = i >= 0 && t < stukken[i].tot;
    if (aan !== wasAan || i !== wasI) { wasAan = aan; wasI = i; opStand?.(aan, stukken[i] ?? null); }
    opTik?.(t);
    frame = requestAnimationFrame(stap);
  }

  function stop() {
    if (gestopt) return;
    gestopt = true;
    cancelAnimationFrame(frame);
    if (a) {
      const t = a.currentTime;
      const [, omhulsel] = knopen;
      omhulsel.gain.cancelScheduledValues(t);
      omhulsel.gain.setTargetAtTime(0, t, 0.005);
      for (const k of knopen) try { k.stop?.(t + 0.05); } catch { /* already stopped */ }
      setTimeout(() => knopen.forEach((k) => k.disconnect()), 120);
    }
    opStand?.(false, null);
  }

  frame = requestAnimationFrame(stap);
  return stop;
}
