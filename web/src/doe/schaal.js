// The scale to reckon with: a length on the map and the distance in the real world, each with its field and its
// slider, and changing one changes the other. Under it the ruler of a compass with that length on it and the
// scale bar of the map, so 4 cm at 1:25.000 is seen to be a kilometre, and how long you walk it.
import { h } from '../dom.js';
import './vorm.css';
import './schaal.css';

const NS = 'http://www.w3.org/2000/svg';
const SCHALEN = [25000, 50000, 100000];
const MAX_CM = 20;                              // the ruler: about as far as you measure on a map in one go
const SNELHEID = 4;                             // km per hour with a rugzak, as the blad tocht-uitzetten says
const X0 = 14; const PER_CM = 16.5;             // the ruler in the picture: 20 cm from 14 to 344

const p = (n) => Math.round(n * 10) / 10;
const getal = (n, max = 2, groep = true) => n.toLocaleString('nl-NL', { maximumFractionDigits: max, useGrouping: groep });
/** A distance as you say it: 750 m, 1,75 km. */
const afstand = (m) => (Math.round(m) < 1000 ? `${getal(Math.round(m), 0)} m` : `${getal(Math.round(m) / 1000, 3)} km`);
/** What someone types: 1,75 or 1.75, without the unit. */
const lees = (tekst) => {
  const t = tekst.replace(/\s/g, '').replace(',', '.');
  return /^(\d+\.?\d*|\.\d+)$/.test(t) ? Number(t) : null;
};
/** How long the walk takes, in whole minutes, and from an hour on in fives. */
function looptijd(m) {
  const min = (m / 1000 / SNELHEID) * 60;
  if (min < 1) return 'minder dan een minuut';
  if (min < 60) return `ongeveer ${Math.round(min)} min`;
  const rond = Math.round(min / 5) * 5;
  return `ongeveer ${rond % 60 ? `${Math.floor(rond / 60)} uur ${rond % 60} min` : `${rond / 60} uur`}`;
}

function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...kids.flat());
  return el;
}

export default function schaal() {
  let deler = 25000;             // the number after 1:
  let cm = 4;                    // on the map
  let meters = 1000;             // in the real world
  let vast = 'kaart';            // the side typed last: it stays put when the scale changes
  let eenheid = 'km';            // of the field "in het echt"

  // -- the fields and sliders
  const kaartVeld = h('input.doe-veld.sc-getal', { type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false' });
  const kaartSchuif = h('input.doe-schuif', { type: 'range', min: 0, max: MAX_CM, step: 0.1, 'aria-label': 'Op de kaart, in cm' });
  const echtVeld = h('input.doe-veld.sc-getal', { type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false' });
  const eenheidKeus = h('select.doe-veld.sc-eenheid', { 'aria-label': 'Eenheid' }, h('option', { value: 'm' }, 'm'), h('option', { value: 'km' }, 'km'));
  const echtSchuif = h('input.doe-schuif', { type: 'range', min: 0, 'aria-label': 'In het echt' });

  const chips = SCHALEN.map((d) => h('button.chip', { type: 'button', 'aria-pressed': String(d === deler), onclick: () => zetSchaal(d) }, `1:${getal(d, 0)}`));
  const som = h('p.sc-som');
  const uitkomst = h('p.sc-uitkomst', { 'aria-live': 'polite' });
  const lopen = h('p.sc-lopen');

  // -- the picture: a ruler in cm with the length on it, and the scale bar of the map under it
  const liniaal = s('g');
  liniaal.append(s('rect', { x: X0 - 8, y: 4, width: MAX_CM * PER_CM + 16, height: 34, rx: 5, class: 'sc-liniaal' }));
  for (let halve = 0; halve <= MAX_CM * 2; halve++) {
    const x = p(X0 + (halve * PER_CM) / 2);
    liniaal.append(s('path', { d: `M${x} 4v${halve % 2 ? 6 : 11}`, class: 'sc-streep' }));
    if (halve % 4 === 0) liniaal.append(s('text', { x, y: 30, class: 'sc-cijfer', 'text-anchor': 'middle' }, String(halve / 2)));
  }
  liniaal.append(s('text', { x: X0 + MAX_CM * PER_CM, y: 30, dx: 10, class: 'sc-klein', 'text-anchor': 'start' }, 'cm'));
  const balk = s('rect', { x: X0, y: 44, height: 12, rx: 3, class: 'sc-balk' });
  const greep = s('circle', { cy: 50, r: 7, class: 'sc-greep' });
  const balkTekst = s('text', { y: 72, class: 'sc-balktekst', 'text-anchor': 'middle' });
  const lijnschaal = s('g');
  const svg = s('svg', { viewBox: '0 0 380 122', class: 'sc-svg', role: 'img' }, liniaal, balk, greep, balkTekst, lijnschaal);

  const el = h('div.doe-schaal',
    h('div.chips', { role: 'group', 'aria-label': 'Kies de schaal van de kaart' }, chips),
    h('div.sc-velden',
      h('div.sc-veld',
        h('label.doe-label', h('span', 'Op de kaart (cm)'), h('span.sc-invoer', kaartVeld)),
        kaartSchuif),
      h('div.sc-veld',
        h('label.doe-label', h('span', 'In het echt'), h('span.sc-invoer', echtVeld, eenheidKeus)),
        echtSchuif)),
    h('div.sc-beeld', svg),
    uitkomst, som, lopen,
    h('p.sc-noot', 'Kies je een andere schaal, dan blijft staan wat je het laatst hebt ingevuld.'));

  // -- drawing
  const toonVeld = (veld, n, max) => { veld.value = getal(n, max, false); veld.removeAttribute('aria-invalid'); };

  function teken(behalve) {
    if (behalve !== kaartVeld) toonVeld(kaartVeld, cm, 2);
    if (behalve !== echtVeld) toonVeld(echtVeld, eenheid === 'km' ? meters / 1000 : Math.round(meters), eenheid === 'km' ? 3 : 0);
    eenheidKeus.value = eenheid;
    kaartSchuif.value = Math.min(cm, MAX_CM);
    kaartSchuif.setAttribute('aria-valuetext', `${getal(cm)} cm`);
    echtSchuif.max = (MAX_CM * deler) / 100;
    echtSchuif.step = deler / 1000;                                 // a millimetre on the map
    echtSchuif.value = Math.min(meters, (MAX_CM * deler) / 100);
    echtSchuif.setAttribute('aria-valuetext', afstand(meters));

    const tot = X0 + Math.min(cm, MAX_CM) * PER_CM;
    balk.setAttribute('width', p(tot - X0));
    greep.setAttribute('cx', p(tot));
    balkTekst.textContent = cm > MAX_CM ? `${afstand(meters)} →` : afstand(meters);
    balkTekst.setAttribute('x', p(Math.min(Math.max(tot, X0 + 30), X0 + MAX_CM * PER_CM - 30)));

    // the scale bar: a block for each kilometre, numbered as far apart as fits
    const kmCm = 100000 / deler; const elke = { 25000: 1, 50000: 2, 100000: 5 }[deler];
    lijnschaal.replaceChildren();
    for (let km = 0; km * kmCm < MAX_CM; km++) {
      lijnschaal.append(s('rect', { x: p(X0 + km * kmCm * PER_CM), y: 86, width: p(kmCm * PER_CM), height: 7, class: km % 2 ? 'sc-blok licht' : 'sc-blok' }));
    }
    for (let km = 0; km * kmCm <= MAX_CM; km += elke) {
      lijnschaal.append(s('text', { x: p(X0 + km * kmCm * PER_CM), y: 108, class: 'sc-cijfer', 'text-anchor': 'middle' }, String(km)));
    }
    lijnschaal.append(s('text', { x: X0 + MAX_CM * PER_CM, y: 108, dx: 10, class: 'sc-klein', 'text-anchor': 'start' }, 'km'));
    svg.setAttribute('aria-label', `Liniaal met ${getal(cm)} cm, op 1:${getal(deler, 0)} ${afstand(meters)}.`);

    uitkomst.replaceChildren(h('strong', `${getal(cm)} cm`), ' op de kaart is ', h('strong', afstand(meters)), ' in het echt.');
    som.textContent = `Op 1:${getal(deler, 0)} is 1 cm ${afstand(deler / 100)}, dus ${getal(cm)} × ${getal(deler / 100, 0)} m = ${getal(Math.round(meters), 0)} m.`;
    lopen.replaceChildren('Lopen: ', h('strong', looptijd(meters)), ` bij ${SNELHEID} km/u. Dat is een gewoon tempo met een rugzak; pauzes en heuvels komen erbij.`);
  }

  function zetKaart(n, behalve) { cm = Math.max(0, n); meters = (cm * deler) / 100; vast = 'kaart'; eenheid = meters >= 1000 ? 'km' : 'm'; teken(behalve); }
  function zetEcht(m, behalve) { meters = Math.max(0, m); cm = (meters * 100) / deler; vast = 'echt'; teken(behalve); }

  function zetSchaal(d) {
    deler = d;
    chips.forEach((c, k) => c.setAttribute('aria-pressed', String(SCHALEN[k] === d)));
    if (vast === 'kaart') { meters = (cm * deler) / 100; eenheid = meters >= 1000 ? 'km' : 'm'; } else cm = (meters * 100) / deler;
    teken();
  }

  kaartVeld.addEventListener('input', () => {
    const n = lees(kaartVeld.value);
    if (n == null) kaartVeld.setAttribute('aria-invalid', 'true'); else zetKaart(n, kaartVeld);
  });
  echtVeld.addEventListener('input', () => {
    const n = lees(echtVeld.value);
    if (n == null) echtVeld.setAttribute('aria-invalid', 'true'); else zetEcht(eenheid === 'km' ? n * 1000 : n, echtVeld);
  });
  // tidy up what was typed once you leave the field: 1.5 becomes 1,5
  kaartVeld.addEventListener('change', () => teken());
  echtVeld.addEventListener('change', () => teken());
  eenheidKeus.addEventListener('change', () => { eenheid = eenheidKeus.value; teken(); });
  kaartSchuif.addEventListener('input', () => zetKaart(Number(kaartSchuif.value)));
  echtSchuif.addEventListener('input', () => { const m = Number(echtSchuif.value); eenheid = m >= 1000 ? 'km' : 'm'; zetEcht(m); });

  // -- the length can be pulled along the ruler too, a millimetre at a time; below it a finger scrolls the page
  let sleept = false;
  const cmVan = (e) => {
    const r = svg.getBoundingClientRect();
    return Math.round(Math.min(Math.max((((e.clientX - r.left) / r.width) * 380 - X0) / PER_CM, 0), MAX_CM) * 10) / 10;
  };
  svg.addEventListener('pointerdown', (e) => {
    const r = svg.getBoundingClientRect();
    if (((e.clientY - r.top) / r.height) * 122 > 64) return;
    sleept = true; svg.setPointerCapture(e.pointerId); zetKaart(cmVan(e));
  });
  svg.addEventListener('pointermove', (e) => { if (sleept) zetKaart(cmVan(e)); });
  svg.addEventListener('pointerup', () => { sleept = false; });
  svg.addEventListener('pointercancel', () => { sleept = false; });

  teken();
  return el;
}
