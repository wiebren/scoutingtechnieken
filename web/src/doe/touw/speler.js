// How you make something with rope, step by step, as a picture that moves: a stappenbalk to go through it (also in
// between two steps) and "Speel af" to play it. The pieces here (takeling.js, eindsplits.js) give the drawing at each
// point; this draws it and says the step.
import { h } from '../../dom.js';
import { actie, acties, zetActie } from '../knoppen.js';
import { stappenBalk } from '../stappen.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './touw.css';

const klem = (x, a, b) => Math.min(b, Math.max(a, x));

/**
 * @param stappen the names of the steps on the balk
 * @param teksten what to do in each step (one per step)
 * @param tekening (w) => the inside of the SVG at point w (0 = the first step done, 1.5 = half way to the third)
 * @param viewBox of the SVG
 * @param label what it is about, for a screen reader
 * @param tempo milliseconds per step when it plays
 */
export function speler({ stappen, teksten, tekening, viewBox, label, tempo = 2600 }) {
  const eind = stappen.length - 1;
  let w = 0; let speel = 0; let gezegd = '';

  const svg = s('svg', { viewBox, class: 'plaatje tg-svg', role: 'img' });
  const stap = h('p.kd-vraag', { 'aria-live': 'polite' });
  const balk = stappenBalk({ stappen, vloeiend: true, label, zet: (v) => { stop(); zet(v); } });
  const speelKnop = actie('Speel af', 'start', () => (speel ? stop() : speelAf()), { hoofd: true, klein: true });
  const verminder = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function zet(v) {
    w = klem(v, 0, eind);
    balk.zet(w);
    svg.innerHTML = `<g class="tw">${tekening(w)}</g>`;
    const tekst = teksten[Math.min(eind, Math.ceil(w - 0.001))];
    if (tekst !== gezegd) { stap.textContent = tekst; svg.setAttribute('aria-label', tekst); gezegd = tekst; }
  }

  function stop() {
    if (speel) cancelAnimationFrame(speel);
    speel = 0; zetActie(speelKnop, 'Speel af', 'start');
  }

  function speelAf() {
    if (verminder()) { zet(w >= eind ? 0 : Math.floor(w + 0.001) + 1); return; }   // no movement: the next step
    if (w >= eind) w = 0;
    let vorige = null;
    zetActie(speelKnop, 'Stop', 'stop');
    const tik = (nu) => {
      if (!svg.isConnected) { speel = 0; return; }
      if (vorige != null) zet(w + (nu - vorige) / tempo);
      vorige = nu;
      if (w < eind) speel = requestAnimationFrame(tik); else stop();
    };
    speel = requestAnimationFrame(tik);
  }

  zet(0);
  return h('div.tg', svg, h('div.kd-tekst', stap, h('div.doe-label', h('span', 'Stap voor stap'), balk.el), acties(speelKnop)));
}
