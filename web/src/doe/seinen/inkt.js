// Onzichtbare inkt (NAV §5d): a message written in milk or lemon juice cannot be seen until you warm the paper. Here
// you "warm" it by rubbing over it with your finger or the mouse (pressed down); the letters slowly turn brown. In
// real life the leiding helps: hold the paper above a lamp or iron it, never above a flame.
import { h } from '../../dom.js';
import { willekeurig } from '../codes.js';
import '../vorm.css';
import './inkt.css';

const BOODSCHAPPEN = ['De schat ligt onder de grote steen', 'Om negen uur bij de brug', 'Het wachtwoord is egel', 'Volg de rode linten naar het meer'];

export default function inkt() {
  let warm = [];                 // per letter, 0 to 1
  let tekens = [];
  let neer = false;
  let tik = 0;

  const papier = h('p.ik-papier', { role: 'img', 'aria-label': 'Een wit papiertje. Er lijkt niets op te staan.' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });

  function nieuw() {
    const zin = willekeurig(BOODSCHAPPEN.filter((b) => b !== papier.dataset.zin));
    papier.dataset.zin = zin;
    tekens = [...zin].map((ch) => h('span', ch));
    warm = tekens.map(() => 0);
    papier.replaceChildren(...tekens);
    papier.setAttribute('aria-label', 'Een wit papiertje. Er lijkt niets op te staan.');
    melding.textContent = '';
    kleur();
  }

  function kleur() {
    tekens.forEach((t, i) => t.style.setProperty('--w', warm[i].toFixed(2)));
    const zichtbaar = warm.filter((w) => w > 0.6).length / Math.max(warm.length, 1);
    if (zichtbaar > 0.85 && !melding.textContent) {
      melding.textContent = `Je kunt het lezen: ${papier.dataset.zin}.`;
      papier.setAttribute('aria-label', `Op het papier staat: ${papier.dataset.zin}`);
    }
  }

  /** Warm the letters near (x, y). */
  function verwarm(x, y) {
    tekens.forEach((t, i) => {
      const r = t.getBoundingClientRect();
      const d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y);
      if (d < 46) warm[i] = Math.min(1, warm[i] + 0.06 * (1 - d / 46));
    });
    kleur();
  }

  papier.addEventListener('pointerdown', (e) => { neer = true; papier.setPointerCapture(e.pointerId); verwarm(e.clientX, e.clientY); });
  papier.addEventListener('pointermove', (e) => { if (neer || e.pointerType === 'mouse' && e.buttons) verwarm(e.clientX, e.clientY); });
  const los = () => { neer = false; };
  papier.addEventListener('pointerup', los);
  papier.addEventListener('pointercancel', los);

  /** For the keyboard and for who cannot rub: warm all of it, bit by bit. */
  function strijk() {
    clearInterval(tik);
    tik = setInterval(() => {
      if (!el.isConnected) { clearInterval(tik); return; }
      warm = warm.map((w) => Math.min(1, w + 0.05 + Math.random() * 0.04));
      kleur();
      if (warm.every((w) => w >= 1)) clearInterval(tik);
    }, 60);
  }

  const el = h('div.doe-inkt',
    papier,
    h('p.doe-stil', 'Wrijf met je vinger of de muis (ingedrukt) over het papier om het te verwarmen.'),
    h('div.knop-rij',
      h('button.knop.klein', { type: 'button', onclick: () => strijk() }, 'Strijk het hele papier'),
      h('button.knop.klein', { type: 'button', onclick: () => { clearInterval(tik); nieuw(); } }, 'Nieuw papiertje')),
    melding);
  nieuw();
  return el;
}
