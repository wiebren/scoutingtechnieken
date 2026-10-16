// Passen tellen: how many dubbelpassen you take on 100 m (each time your left foot comes down), and from there
// passen to metres and back. Tel mee counts along while you walk; after 100 m that count becomes your own number.
// The number is kept on this device, like the rest of what the app remembers (src/opslag.js).
import { h } from '../dom.js';
import './vorm.css';
import './passen.css';

const SLEUTEL = 'scoutingtechnieken.passen.v1';
const VOORBEELD = 65;
const lees = () => { try { return Number(JSON.parse(localStorage.getItem(SLEUTEL) ?? 'null')) || null; } catch { return null; } };
const bewaar = (n) => { try { localStorage.setItem(SLEUTEL, JSON.stringify(n)); } catch { /* it works without */ } };
const getal = (n, cijfers = 0) => n.toLocaleString('nl-NL', { maximumFractionDigits: cijfers });

export default function passen() {
  let per100 = lees();
  const geijkt = () => per100 != null;
  const aantal = () => per100 ?? VOORBEELD;
  let geteld = 0;

  // -- your number
  const ijk = h('input.doe-veld.ps-getal', { type: 'number', min: 20, max: 200, step: 1, inputmode: 'numeric', value: aantal(),
    'aria-label': 'Dubbelpassen op 100 meter', oninput: () => { const n = Number(ijk.value); if (n >= 20 && n <= 200) zetIjking(n, false); } });
  const stapKnop = (d) => h('button.knop.klein', { type: 'button', 'aria-label': d < 0 ? 'Eén minder' : 'Eén meer', onclick: () => zetIjking(aantal() + d, true) }, d < 0 ? '−' : '+');
  const ijkTekst = h('p.doe-stil', { 'aria-live': 'polite' });

  // -- reckoning, both ways
  const pasVeld = h('input.doe-veld.ps-getal', { type: 'number', min: 0, step: 1, inputmode: 'numeric', value: 250, oninput: () => reken('passen') });
  const meterVeld = h('input.doe-veld.ps-getal', { type: 'number', min: 0, step: 10, inputmode: 'numeric', oninput: () => reken('meters') });
  const rekenTekst = h('p.doe-stil', { 'aria-live': 'polite' });

  // -- counting along
  const telTekst = h('p.ps-geteld', { 'aria-live': 'polite' });
  const linksKnop = h('button.knop.hoofd.ps-links', { type: 'button', onclick: () => tel(1) }, h('span', 'Links'), h('small', 'tik bij elke linkervoet'));
  const minKnop = h('button.knop.klein', { type: 'button', onclick: () => tel(-1) }, '−1');
  const opnieuw = h('button.knop.klein', { type: 'button', onclick: () => { geteld = 0; toonGeteld(); } }, 'Opnieuw');
  const honderd = h('button.knop.klein', { type: 'button', onclick: () => { if (geteld >= 20) { zetIjking(geteld, true); telTekst.textContent = `Je ${geteld} dubbelpassen op 100 m zijn bewaard.`; } } }, 'Dit was 100 m');

  const el = h('div.doe-passen',
    h('section.ps-blok',
      h('h4', 'Jouw passen'),
      h('div.ps-rij', h('span', 'Op 100 m doe ik'), stapKnop(-1), ijk, stapKnop(1), h('span', 'dubbelpassen.')),
      ijkTekst),
    h('section.ps-blok',
      h('h4', 'Reken'),
      h('div.ps-reken',
        h('label.doe-label', 'Dubbelpassen', pasVeld),
        h('span.ps-pijl', { 'aria-hidden': 'true' }, '⇄'),
        h('label.doe-label', 'Meters', meterVeld)),
      rekenTekst),
    h('section.ps-blok',
      h('h4', 'Tel mee'),
      h('p.doe-stil', 'Loop een stuk waarvan je zeker weet dat het 100 m is, bijvoorbeeld van het ene hectometerpaaltje langs de weg naar het volgende. Tik bij elke linkervoet.'),
      h('div.ps-tel', linksKnop, telTekst),
      h('div.knop-rij', minKnop, opnieuw, honderd)),
    h('p.doe-stil', 'Heuvelop, in zand en in het donker worden je passen korter.'));

  function zetIjking(n, inVeld) {
    per100 = Math.max(20, Math.min(200, Math.round(n)));
    bewaar(per100);
    if (inVeld) ijk.value = per100;
    toonIjking();
    reken('passen');
    toonGeteld();
  }

  function toonIjking() {
    const pas = 100 / aantal();
    ijkTekst.textContent = `${geijkt() ? '' : `${VOORBEELD} is een voorbeeld: tel je eigen passen. `}Eén dubbelpas is dan ${getal(pas, 2)} m, één gewone pas ongeveer ${getal(pas / 2, 2)} m.`;
  }

  function reken(van) {
    const m = 100 / aantal();
    if (van === 'passen') {
      const p = Number(pasVeld.value);
      meterVeld.value = pasVeld.value === '' ? '' : Math.round(p * m);
      rekenTekst.textContent = pasVeld.value === '' ? '' : `${getal(p)} dubbelpassen is ongeveer ${getal(Math.round(p * m))} m.`;
    } else {
      const meters = Number(meterVeld.value);
      pasVeld.value = meterVeld.value === '' ? '' : Math.round(meters / m);
      rekenTekst.textContent = meterVeld.value === '' ? '' : `Voor ${getal(meters)} m tel je ongeveer ${getal(Math.round(meters / m))} dubbelpassen.`;
    }
  }

  function tel(d) {
    geteld = Math.max(0, geteld + d);
    toonGeteld();
  }

  function toonGeteld() {
    telTekst.replaceChildren(h('strong', String(geteld)), ` ${geteld === 1 ? 'dubbelpas' : 'dubbelpassen'}: ongeveer ${getal(Math.round(geteld * 100 / aantal()))} m`);
    honderd.disabled = geteld < 20;
    minKnop.disabled = geteld === 0;
  }

  toonIjking();
  reken('passen');
  toonGeteld();
  return el;
}
