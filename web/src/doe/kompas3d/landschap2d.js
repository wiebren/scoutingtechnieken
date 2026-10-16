// The landscape without WebGL: a flat panorama in SVG, the horizon with the four landmarks as silhouettes, placed
// by their bearing the same way the 3D camera would (a pinhole: x = f·tan(angle)). Same shape as landschap3d.js:
// zet(), maat(), dispose(). A switched theme makes it again.
import { s } from '../kompasdelen.js';
import { BAKENS, zijde } from './veld.js';

const RAD = Math.PI / 180;
let teller = 0;

/** The four sails of the mill, a thin bar each, turned a little, round the axle at 0,-21.5. */
function wieken() {
  let d = '';
  for (let a = 22; a < 360; a += 90) {
    const c = Math.cos(a * RAD); const sn = Math.sin(a * RAD);
    const pt = (u, v) => `${(u * c - v * sn).toFixed(2)} ${(-21.5 + u * sn + v * c).toFixed(2)}`;
    d += `M${pt(0, -0.4)}L${pt(12, -0.4)}L${pt(12, 1.8)}L${pt(3, 1.8)}L${pt(3, 0.4)}L${pt(0, 0.4)}Z`;
  }
  return d;
}

/** Silhouettes in metres: x to the right, y up (negated when drawn), foot at 0,0. */
const VORMEN = {
  kerk: 'M-4 0V-28H4V0ZM-4.2 -28L0 -46L4.2 -28ZM4 0V-11H17V0ZM4 -11L10.5 -18L17 -11Z',
  molen: 'M-6.5 0L-3.4 -20H3.4L6.5 0ZM-4.2 -20Q0 -25 4.2 -20Z' + wieken(),
  eik: 'M-0.7 0V-6H0.7V0ZM0 -15.5C5.5 -15.5 7.5 -11 6.5 -8C5.5 -5 -5.5 -5 -6.5 -8C-7.5 -11 -5.5 -15.5 0 -15.5Z',
  watertoren: 'M-4.6 0L-4 -28H4L4.6 0ZM-9 -28H9V-37H-9ZM-9.4 -37L0 -41L9.4 -37Z',
};
const KLEUR = {
  licht: { lucht: '#a9cdea', horizon: '#e4eff3', gras: '#8cb85e', silhouet: '#3b4a42' },
  donker: { lucht: '#2a3d66', horizon: '#9a8fa8', gras: '#5f8a44', silhouet: '#1c2420' },
};

export function maakLandschap2d(plek, veld, { donker = false, opRender = () => {} } = {}) {
  const svg = s('svg', { class: 'k3-plat', 'aria-hidden': 'true', preserveAspectRatio: 'none' });
  const id = `k3-lucht-${++teller}`;
  const verloop = s('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 });
  const stopBoven = s('stop', { offset: '0' }); const stopOnder = s('stop', { offset: '1' });
  verloop.append(stopBoven, stopOnder);
  const lucht = s('rect', { x: 0, y: 0, width: 1, height: 1, fill: `url(#${id})` });
  const gras = s('rect', { x: 0, width: 1, height: 1 });
  const dingen = veld.bakens.map((b) => s('path', { d: VORMEN[b.soort] }));
  svg.append(s('defs', {}, verloop), lucht, gras, ...dingen);
  plek.prepend(svg);

  let breed = 0; let hoog = 0; let horizon = 0; let f = 1; let koers = 0; let rafId = 0; let weg = false;
  function kleur(d) {
    const K = d ? KLEUR.donker : KLEUR.licht;
    stopBoven.setAttribute('stop-color', K.lucht); stopOnder.setAttribute('stop-color', K.horizon);
    gras.setAttribute('fill', K.gras);
    for (const p of dingen) p.setAttribute('fill', K.silhouet);
  }
  kleur(donker);

  function teken() {
    rafId = 0;
    if (weg || !breed) return;
    opRender(veld.bakens.map((b, i) => {
      const hoek = zijde(b.peiling, koers);
      const zichtbaar = Math.abs(hoek) < 80;
      const x = breed / 2 + f * Math.tan(hoek * RAD); const schaal = f / b.afstand;
      dingen[i].setAttribute('visibility', zichtbaar ? 'visible' : 'hidden');
      if (zichtbaar) dingen[i].setAttribute('transform', `translate(${x.toFixed(1)} ${horizon}) scale(${schaal.toFixed(3)})`);
      return { x, y: horizon - (BAKENS[b.soort].hoogte + 4) * schaal, zichtbaar: zichtbaar && x > -40 && x < breed + 40 };
    }));
  }
  const vraag = () => { if (!rafId && !weg) rafId = requestAnimationFrame(teken); };

  return {
    zet(k) { koers = k; vraag(); },
    maat(w, h, luchtPx, hfov) {
      if (!w || !h) return;
      breed = w; hoog = h; horizon = luchtPx; f = (w / 2) / Math.tan((hfov / 2) * RAD);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      lucht.setAttribute('width', w); lucht.setAttribute('height', horizon);
      gras.setAttribute('y', horizon); gras.setAttribute('width', w); gras.setAttribute('height', Math.max(0, hoog - horizon));
      vraag();
    },
    dispose() { weg = true; if (rafId) cancelAnimationFrame(rafId); svg.remove(); },
  };
}
