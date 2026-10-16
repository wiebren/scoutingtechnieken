// Walking along a path, shared by the 3D world and the map from above: the walker faces the way of the stretch it
// is on (turning there quickly), and at the end turns to `eindKoers`. Without motion it jumps to the end.
import { peiling, draai } from './netwerk.js';

const EASE = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const SNELHEID = 32;                       // units per second

/** Animate: opFrame({ pos, koers }) for every frame; resolves at the end. levend() false stops it. */
export function animeerPad(punten, beginKoers, eindKoers, { beweging, opFrame, levend }) {
  const delen = []; let totaal = 0;
  for (let i = 1; i < punten.length; i++) { const l = Math.hypot(punten[i].x - punten[i - 1].x, punten[i].y - punten[i - 1].y); delen.push(l); totaal += l; }
  const richting = delen.map((_, i) => peiling(punten[i], punten[i + 1]));
  const eind = eindKoers ?? richting[richting.length - 1] ?? beginKoers;
  const laatste = { pos: { ...punten[punten.length - 1] }, koers: eind };
  if (!beweging || totaal < 0.01) { opFrame(laatste); return Promise.resolve(); }
  const loopDuur = Math.min(2400, Math.max(650, (totaal / SNELHEID) * 1000));
  const draaiEind = Math.abs(draai(richting[richting.length - 1] ?? eind, eind)) > 2 ? 350 : 0;
  const duur = loopDuur + draaiEind;
  return new Promise((klaar) => {
    const t0 = performance.now();
    let koers = beginKoers;
    let vorige = t0;
    const frame = (nu) => {
      if (!levend()) { klaar(); return; }
      const dt = Math.min(0.1, (nu - vorige) / 1000); vorige = nu;
      const tl = Math.min(1, (nu - t0) / loopDuur);
      let d = EASE(tl) * totaal; let i = 0;
      while (i < delen.length - 1 && d > delen[i]) { d -= delen[i]; i++; }
      const f = delen[i] ? Math.min(1, d / delen[i]) : 1;
      const a = punten[i]; const b = punten[i + 1];
      const pos = { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
      if (nu - t0 < loopDuur) {
        // turn towards the stretch, fast but not at once
        const doel = richting[i]; const rest = draai(koers, doel);
        koers += rest * Math.min(1, dt * 9);
      } else {
        const te = Math.min(1, (nu - t0 - loopDuur) / Math.max(1, draaiEind));
        const van = richting[richting.length - 1];
        koers = van + draai(van, eind) * EASE(te);
      }
      opFrame({ pos, koers });
      if (nu - t0 < duur) requestAnimationFrame(frame); else { opFrame(laatste); klaar(); }
    };
    requestAnimationFrame(frame);
  });
}
