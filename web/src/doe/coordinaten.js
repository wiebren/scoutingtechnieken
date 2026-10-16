// One place in three systems: type it in RD, in degrees (any of the three ways) or in UTM, and the other two follow.
// Two known places to start from, and "Waar ben ik?" with the location of the phone (asked only on a tap, and it
// stays on the device).
import { h } from '../dom.js';
import { gradenNaarRd, gradenNaarUtm, inNederland, leesGraden, leesRd, leesUtm, rdNaarGraden, schrijfGraden, schrijfRd, utmNaarGraden } from './geo.js';
import './vorm.css';
import './coordinaten.css';

const PLEKKEN = [
  ['De toren van Amersfoort', { lat: 52.1551744, lon: 5.38720621 }],
  ['De Dam in Amsterdam', utmNaarGraden({ zone: 31, oost: 628830, noord: 5804225 })],
];

export default function coordinaten({ nadruk = null } = {}) {
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const veld = (label, placeholder) => {
    const input = h('input.doe-veld', { type: 'text', inputmode: 'text', autocomplete: 'off', spellcheck: 'false', placeholder });
    return [input, h('label.doe-label', h('span', label), input)];
  };
  const [rd, rdLabel] = veld('RD (x – y, in meters)', '155.000 – 463.000');
  const [gr, grLabel] = veld('Graden (op elke manier)', '52.15517, 5.38721');
  const [utm, utmLabel] = veld('UTM (zone, oost, noord)', '31U 637294 5762927');
  const schrijfwijzen = h('dl.co-graden');

  function toon(plek, bron) {
    const r = gradenNaarRd(plek.lat, plek.lon);
    const u = gradenNaarUtm(plek.lat, plek.lon);
    const g = schrijfGraden(plek.lat, plek.lon);
    if (bron !== rd) rd.value = inNederland(r) ? schrijfRd(r) : '';
    if (bron !== gr) gr.value = g.dd;
    if (bron !== utm) utm.value = `${u.zone}${u.band} ${Math.round(u.oost)} ${Math.round(u.noord)}`;
    schrijfwijzen.replaceChildren(
      h('dt', 'Decimale graden'), h('dd', g.dd),
      h('dt', 'Graden, minuten, seconden'), h('dd', g.dms),
      h('dt', 'Graden en minuten (geocaching)'), h('dd', g.ddm));
    melding.classList.toggle('fout', !inNederland(r));
    melding.textContent = inNederland(r)
      ? `UTM-zone ${u.zone}: ${u.zone === 31 ? 'het westen van Nederland, tot ongeveer Apeldoorn' : u.zone === 32 ? 'het oosten van Nederland, vanaf ongeveer Apeldoorn' : 'buiten Nederland'}.`
      : 'Deze plek ligt buiten Nederland: daar werkt RD niet.';
  }

  rd.addEventListener('input', () => {
    const r = leesRd(rd.value);
    if (!r || !inNederland(r)) { melding.classList.add('fout'); melding.textContent = 'Typ twee getallen in meters: eerst x, dan y. In Nederland is x kleiner dan y.'; return; }
    toon(rdNaarGraden(r.x, r.y), rd);
  });
  gr.addEventListener('input', () => {
    const g = leesGraden(gr.value);
    if (!g) { melding.classList.add('fout'); melding.textContent = 'Typ eerst de breedte, dan de lengte: 52.15517, 5.38721 of N 52° 09.310 E 005° 23.232.'; return; }
    toon(g, gr);
  });
  utm.addEventListener('input', () => {
    const u = leesUtm(utm.value);
    if (!u) { melding.classList.add('fout'); melding.textContent = 'Typ de zone, dan oost en noord in meters: 31U 628830 5804225. Oost ligt tussen 100000 en 900000.'; return; }
    toon(utmNaarGraden(u), utm);
  });

  const knoppen = PLEKKEN.map(([naam, plek]) => h('button.chip', { type: 'button', onclick: () => toon(plek, null) }, naam));
  if ('geolocation' in navigator) {
    knoppen.push(h('button.chip', { type: 'button', onclick: () => {
      melding.classList.remove('fout'); melding.textContent = 'Even zoeken…';
      navigator.geolocation.getCurrentPosition(
        (p) => { toon({ lat: p.coords.latitude, lon: p.coords.longitude }, null); melding.textContent += ` Je telefoon zegt: op ${Math.round(p.coords.accuracy)} m nauwkeurig.`; },
        () => { melding.classList.add('fout'); melding.textContent = 'Je plek is niet gevonden. Mag de browser je locatie gebruiken?'; },
        { enableHighAccuracy: true, timeout: 15000 });
    } }, 'Waar ben ik?'));
  }

  const velden = { rd: rdLabel, graden: grLabel, utm: utmLabel };
  const volgorde = nadruk ? [velden[nadruk], ...Object.values(velden).filter((v) => v !== velden[nadruk])] : Object.values(velden);
  toon(PLEKKEN[0][1], null);
  return h('div.doe-coordinaten',
    h('div.chips', { role: 'group', 'aria-label': 'Kies een plek' }, knoppen),
    h('div.co-velden', volgorde), schrijfwijzen, melding,
    h('p.doe-stil', 'Omgerekend met formules die RD benaderen: tot op ongeveer een meter precies. Je plek blijft op je telefoon.'));
}
