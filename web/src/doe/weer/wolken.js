// Clouds: "Sleutel" asks how high and what shape, and gives the genus; "Raad" shows a drawing, and you choose its
// name out of four. The drawings and the heights are those of the cloud cards (src/plaatjes/weer.js, after the KNMI).
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { WOLKEN, wolkTekening } from '../../plaatjes/weer.js';
import '../vorm.css';
import './wolken.css';

const WOLK = Object.fromEntries(WOLKEN.map((w) => [w.id, w]));

// the key: first the height, then what it looks like
const SLEUTEL = [
  { id: 'hoog', vraag: 'Hoog: dun en wit, van ijs', vormen: [
    ['Witte vezels en haakjes, als veren', 'cirrus'],
    ['Heel kleine korreltjes, zonder schaduw', 'cirrocumulus'],
    ['Een dunne melkwitte sluier, soms een kring om de zon', 'cirrostratus'],
  ] },
  { id: 'midden', vraag: 'Middelhoog', vormen: [
    ['Bolletjes in rijen, met een grijze onderkant', 'altocumulus'],
    ['Een grijze laag; de zon zie je als door matglas', 'altostratus'],
    ['Een dik donkergrijs dek, en het regent lang', 'nimbostratus'],
  ] },
  { id: 'laag', vraag: 'Laag en grijs', vormen: [
    ['Grote grijze plukken, lichter en donkerder', 'stratocumulus'],
    ['Egaal grijs en laag, als mist die los is van de grond', 'stratus'],
  ] },
  { id: 'stapel', vraag: 'Gestapeld: groeit omhoog', vormen: [
    ['Losse bloemkolen met een platte onderkant', 'cumulus'],
    ['Een enorme toren met een plat aambeeld bovenop; buien, onweer', 'cumulonimbus'],
  ] },
];

const schud = (lijst) => {
  for (let i = lijst.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [lijst[i], lijst[j]] = [lijst[j], lijst[i]]; }
  return lijst;
};

export default function wolken() {
  let modus = 'sleutel';
  let goed = 0; let gehad = 0; let vorige = null;
  const plek = h('div.wk-plek');

  const beeld = (id, metNaam) => h('figure.wk-beeld', { html: wolkTekening(id, metNaam) });

  function sleutel(laag = null) {
    const stap1 = h('div.wk-stap', h('p.wk-vraag', '1. Hoe hoog is de wolk?'),
      h('div.chips', { role: 'group', 'aria-label': 'Hoe hoog' }, keuze(SLEUTEL.map((x) => [x, x.vraag]), laag, (x) => sleutel(x))));
    if (!laag) { plek.replaceChildren(stap1); return; }
    const uitkomst = h('div.wk-uitkomst', { 'aria-live': 'polite' });
    const stap2 = h('div.wk-stap', h('p.wk-vraag', '2. Hoe ziet hij eruit?'),
      h('div.wk-vormen', laag.vormen.map(([tekst, id]) => h('button.knop.klein.wk-vorm', { type: 'button', onclick: (e) => {
        stap2.querySelectorAll('.wk-vorm').forEach((k) => k.setAttribute('aria-pressed', String(k === e.currentTarget)));
        const w = WOLK[id];
        uitkomst.replaceChildren(beeld(id, true),
          h('p', h('strong', w.naam), w.ook ? ` (${w.ook})` : '', `: ${w.laag === 'verticaal' ? 'een stapelwolk' : `${w.laag}`}, ${w.hoogte}.`));
      } }, tekst))));
    plek.replaceChildren(stap1, stap2, uitkomst);
  }

  function raad() {
    let vraag;
    do vraag = WOLKEN[Math.floor(Math.random() * WOLKEN.length)]; while (vraag === vorige);
    vorige = vraag;
    // three others, preferably of the same height, so you have to look
    const zelfde = schud(WOLKEN.filter((w) => w !== vraag && w.laag === vraag.laag));
    const rest = schud(WOLKEN.filter((w) => w !== vraag && w.laag !== vraag.laag));
    const opties = schud([vraag, ...[...zelfde, ...rest].slice(0, 3)]);
    const melding = h('p.doe-melding', { 'aria-live': 'polite' });
    const verder = h('button.knop.klein.hoofd', { type: 'button', hidden: true, onclick: raad }, 'Volgende');
    const knoppen = opties.map((w) => h('button.knop.klein.wk-optie', { type: 'button', onclick: () => {
      gehad += 1; if (w === vraag) goed += 1;
      knoppen.forEach((k, i) => { k.disabled = true; if (opties[i] === vraag) k.classList.add('goed'); else if (opties[i] === w) k.classList.add('fout'); });
      melding.classList.toggle('fout', w !== vraag);
      melding.textContent = `${w === vraag ? 'Goed!' : `Nee, dit is ${vraag.naam}.`} ${vraag.naam}: ${vraag.kenmerk}. ${goed} van de ${gehad} goed.`;
      verder.hidden = false; verder.focus();
    } }, w.naam));
    plek.replaceChildren(beeld(vraag.id, false), h('p.doe-sr', 'Welke wolk is dit?'), h('div.wk-opties', knoppen), melding, h('div.knop-rij', verder));
  }

  const modi = h('div.chips', { role: 'group', 'aria-label': 'Sleutel of raden' },
    keuze([['sleutel', 'Welke wolk zie ik?'], ['raad', 'Raad de wolk']], modus, (m) => { modus = m; if (m === 'raad') raad(); else sleutel(); }));
  sleutel();
  return h('div.doe-wolken', modi, plek, h('p.doe-stil', 'Indeling en hoogtes naar het KNMI (bron: KNMI).'));
}
