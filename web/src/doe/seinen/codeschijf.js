// A codeschijf to turn: the outer ring is the gewone alphabet, the inner ring the geheime. Drag the inner disc round
// (or use the arrow keys or the buttons); every letter outside then lines up with its code inside. Under it, type a
// text and read it in code. The verschuivingscode of NAV §5a; the codewiel is the tool for it.
import { h } from '../../dom.js';
import { letterOp, verschuif } from '../codes.js';
import '../vorm.css';
import './codeschijf.css';

const NS = 'http://www.w3.org/2000/svg';
const ABC = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const STAP = 360 / 26;
const [C, RB, RI] = [160, 136, 100];
const r1 = (n) => Math.round(n * 10) / 10;
const pol = (r, g) => [r1(C + r * Math.sin((g * Math.PI) / 180)), r1(C - r * Math.cos((g * Math.PI) / 180))];

export default function codeschijf() {
  let n = 3;
  let draai = -n * STAP;         // the angle of the inner disc, in degrees
  let sleep = null;

  const schijf = document.createElementNS(NS, 'svg');
  schijf.setAttribute('viewBox', '0 0 320 320');
  schijf.setAttribute('class', 'cs-schijf');
  schijf.setAttribute('tabindex', '0');
  schijf.setAttribute('role', 'slider');
  schijf.setAttribute('aria-valuemin', '0');
  schijf.setAttribute('aria-valuemax', '25');
  schijf.setAttribute('aria-label', 'Codeschijf: draai de binnenste schijf');

  let buiten = `<circle cx="${C}" cy="${C}" r="${RB + 18}" class="cs-buiten"/>`;
  ABC.forEach((l, i) => {
    const [x, y] = pol(RB, i * STAP);
    const [a, b] = [pol(RB - 18, (i + 0.5) * STAP), pol(RB + 18, (i + 0.5) * STAP)];
    buiten += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="cs-streep"/>`
      + `<text x="${x}" y="${y}" class="cs-letter" text-anchor="middle" dominant-baseline="central">${l}</text>`;
  });
  let binnen = `<circle cx="${C}" cy="${C}" r="${RI + 18}" class="cs-binnen"/>`;
  ABC.forEach((l, i) => {
    const [x, y] = pol(RI, i * STAP);
    binnen += `<text x="${x}" y="${y}" class="cs-letter geheim" text-anchor="middle" dominant-baseline="central" transform="rotate(${r1(i * STAP)} ${x} ${y})">${l}</text>`;
  });
  binnen += `<circle cx="${C}" cy="${C}" r="34" class="cs-as"/><path d="M${C} ${C - RI + 34} L${C - 7} ${C - RI + 48} L${C + 7} ${C - RI + 48}Z" class="cs-wijzer"/>`;
  schijf.innerHTML = `${buiten}<g class="cs-draai">${binnen}</g><text x="${C}" y="${C + 5}" class="cs-midden" text-anchor="middle">${''}</text>`
    + `<rect x="${C - 15}" y="${C - RB - 14}" width="30" height="${RB - RI + 28}" rx="10" class="cs-venster"/>`;
  const draaiGroep = schijf.querySelector('.cs-draai');
  const midden = schijf.querySelector('.cs-midden');

  const uitleg = h('p.cs-uitleg', { 'aria-live': 'polite' });
  const gewoon = h('input.doe-veld', { type: 'text', value: 'Kom naar het kampvuur', maxlength: 80, spellcheck: 'false', oninput: () => toon() });
  const geheim = h('p.cs-geheim');

  function zet(nieuw) {
    n = ((nieuw % 26) + 26) % 26;
    draai = sleep ? draai : -n * STAP;
    draaiGroep.setAttribute('transform', `rotate(${r1(draai)} ${C} ${C})`);
    schijf.setAttribute('aria-valuenow', String(n));
    schijf.setAttribute('aria-valuetext', `Verschuiving ${n}: A wordt ${letterOp(n)}`);
    midden.textContent = `+${n}`;
    toon();
  }

  function toon() {
    uitleg.replaceChildren('Verschuiving ', h('strong', String(n)), `: A wordt ${letterOp(n)}, B wordt ${letterOp(n + 1)}, Z wordt ${letterOp(n + 25)}.`);
    geheim.textContent = verschuif(gewoon.value, n);
  }

  const hoekVan = (e) => {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(schijf.getScreenCTM().inverse());
    return (Math.atan2(p.x - C, -(p.y - C)) * 180) / Math.PI;
  };
  schijf.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    schijf.focus({ preventScroll: true });
    schijf.setPointerCapture(e.pointerId);
    sleep = { van: hoekVan(e), draai };
  });
  schijf.addEventListener('pointermove', (e) => {
    if (!sleep) return;
    let d = hoekVan(e) - sleep.van;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    draai = sleep.draai + d;
    sleep = { van: hoekVan(e), draai };
    draaiGroep.setAttribute('transform', `rotate(${r1(draai)} ${C} ${C})`);
    const nieuw = ((Math.round(-draai / STAP) % 26) + 26) % 26;
    if (nieuw !== n) { n = nieuw; midden.textContent = `+${n}`; toon(); }
  });
  const los = () => { if (!sleep) return; sleep = null; draai = -n * STAP + Math.round((draai + n * STAP) / 360) * 360; zet(n); };
  schijf.addEventListener('pointerup', los);
  schijf.addEventListener('pointercancel', los);
  schijf.addEventListener('keydown', (e) => {
    const stap = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    if (stap) { e.preventDefault(); draai -= stap * STAP; zet(n + stap); }
  });

  const el = h('div.doe-codeschijf',
    schijf, uitleg,
    h('div.knop-rij.cs-knoppen',
      h('button.knop.klein', { type: 'button', 'aria-label': 'Eén terug', onclick: () => { draai += STAP; zet(n - 1); } }, '↺ terug'),
      h('button.knop.klein', { type: 'button', 'aria-label': 'Eén verder', onclick: () => { draai -= STAP; zet(n + 1); } }, 'verder ↻')),
    h('label.doe-label', 'Gewone tekst', gewoon),
    h('div.doe-label', 'Met de schijf wordt het', geheim),
    h('p.doe-stil', 'Maak hem zelf: twee rondjes karton, de kleinste erop, en een splitpen door het midden.'));

  zet(n);
  return el;
}
