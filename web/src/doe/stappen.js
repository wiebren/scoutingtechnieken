// The steps of a piece as one control: numbered dots on a line, the name of each step under its dot, and the line
// filled up to where you are. Tap a dot (or its name) to go there; drag along the line to go through the steps; the
// arrow keys go one step, Home and End to the first and the last. With `vloeiend` the value may lie between two steps
// (1.5 is half way from step 2 to step 3), for a piece that shows the movement in between; otherwise it snaps.
// For a screen reader it is one slider, with the name of the step as its value. Use it wherever a piece has steps
// in order (build, fold, set up), instead of chips that look like a free choice.
import { h } from '../dom.js';
import './stappen.css';

/**
 * @param stappen the names of the steps, in order
 * @param waarde where to start, 0 = the first step
 * @param vloeiend whether a value between two steps is allowed (dragging), or every value snaps to a step
 * @param label what the steps are about, for a screen reader ("Van plat naar staand")
 * @param zet (waarde) => void, when the scout moves it (not when zet() below is called)
 * @returns {{ el: HTMLElement, zet: (waarde: number) => void, waarde: () => number }}
 */
export function stappenBalk({ stappen, waarde = 0, vloeiend = false, label = 'Stappen', zet: opZet = () => {} }) {
  const n = stappen.length;
  const max = n - 1;
  let nu = klem(waarde);

  const vulling = h('span.stb-vulling');
  const punten = stappen.map((naam, i) => h('span.stb-punt', { 'data-i': i, 'aria-hidden': 'true' },
    h('span.stb-nr', String(i + 1)), h('span.stb-naam', naam)));
  const el = h('div.stappenbalk', {
    role: 'slider', tabindex: '0', 'aria-label': label, 'aria-valuemin': '1', 'aria-valuemax': String(n),
    style: `--stb-n: ${n}`,
  }, h('span.stb-lijn', vulling), punten);

  function klem(v) { return Math.max(0, Math.min(max, v)); }
  function toon() {
    const stap = Math.round(nu);
    vulling.style.width = `${(max ? nu / max : 0) * 100}%`;
    punten.forEach((p, i) => {
      p.classList.toggle('klaar', i <= nu + 0.001);
      p.classList.toggle('nu', i === stap);
    });
    el.setAttribute('aria-valuenow', String(stap + 1));
    el.setAttribute('aria-valuetext', `Stap ${stap + 1} van ${n}: ${stappen[stap].replaceAll('\u00ad', '')}`);
  }
  function naar(v, { melden = true } = {}) {
    const nieuw = klem(v);
    if (nieuw === nu) return;
    nu = nieuw;
    toon();
    if (melden) opZet(nu);
  }

  // dragging along the line: the line runs from the middle of the first column to the middle of the last
  const waardeBij = (x) => {
    const r = el.getBoundingClientRect();
    const kolom = r.width / n;
    return ((x - r.left - kolom / 2) / (r.width - kolom)) * max;
  };
  let sleept = false;
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    sleept = true;
    el.setPointerCapture(e.pointerId);
    const v = waardeBij(e.clientX);
    naar(vloeiend ? v : Math.round(v));
  });
  el.addEventListener('pointermove', (e) => {
    if (!sleept) return;
    const v = waardeBij(e.clientX);
    naar(vloeiend ? v : Math.round(v));
  });
  const los = () => {
    if (!sleept) return;
    sleept = false;
    // a drag ends on a step when the piece only knows whole steps; a smooth one stays where it was let go
    if (!vloeiend) naar(Math.round(nu));
  };
  el.addEventListener('pointerup', los);
  el.addEventListener('pointercancel', los);

  el.addEventListener('keydown', (e) => {
    const stap = Math.round(nu);
    const doel = { ArrowRight: stap + 1, ArrowUp: stap + 1, ArrowLeft: stap - 1, ArrowDown: stap - 1, Home: 0, End: max }[e.key];
    if (doel === undefined) return;
    e.preventDefault();
    // from between two steps, a key goes to the next whole step in that direction
    const tussen = Math.abs(nu - stap) > 0.001;
    naar(tussen && (e.key === 'ArrowRight' || e.key === 'ArrowUp') ? Math.ceil(nu)
      : tussen && (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ? Math.floor(nu) : doel);
  });

  toon();
  return { el, zet: (v) => naar(v, { melden: false }), waarde: () => nu };
}
