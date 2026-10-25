// Lay out a camp site: a field of 10 by 8 squares of 10 metres, with a stream, a tap, trees, a hollow and the
// path in. Choose what to place (tents, kitchen, fire, HUDO, washing-up place, waste) and tap a square; "Kijk het
// na" gives each thing a green or red edge and says why. The rules are the ones the notes give a reason for: HUDO
// at least 60 m from water (Leave No Trace), no fire under branches (SN-VB), no tent in a hollow or under trees,
// and the smoke and the smell blowing away from the tents.
import { h } from '../../dom.js';
import { actie, acties } from '../knoppen.js';
import '../vorm.css';
import './kamp.css';
import './indelen.css';

const K = 10; const R = 8;                     // columns, rows; a square is 10 by 10 m
const LETTERS = 'ABCDEFGHIJ';

// the terrain: what is on each square
const TERREIN = (() => {
  const t = Array.from({ length: R }, () => Array(K).fill('gras'));
  for (let k = 0; k < K; k++) t[R - 1][k] = 'water';
  t[R - 2][7] = 'water'; t[R - 2][8] = 'water';
  for (const [r, k] of [[0, 8], [0, 9], [1, 9], [0, 7]]) t[r][k] = 'boom';
  for (const [r, k] of [[5, 3], [5, 4], [4, 4]]) t[r][k] = 'laagte';
  for (let k = 0; k < 3; k++) t[3][k] = 'pad';
  t[3][3] = 'kraan';
  return t;
})();
const TERREIN_NAAM = { gras: 'gras', water: 'de beek', boom: 'bomen', laagte: 'een laagte', pad: 'het pad naar binnen', kraan: 'de waterkraan' };

const DINGEN = [
  { id: 'tent', naam: 'tent', aantal: 3 },
  { id: 'keuken', naam: 'keuken', aantal: 1 },
  { id: 'vuur', naam: 'vuur', aantal: 1 },
  { id: 'hudo', naam: 'HUDO', aantal: 1 },
  { id: 'afwas', naam: 'afwas', aantal: 1 },
  { id: 'afval', naam: 'afval', aantal: 1 },
];

const afstand = ([r1, k1], [r2, k2]) => Math.hypot(r1 - r2, k1 - k2) * 10;      // metres, centre to centre
const totWater = (plek) => {
  let min = Infinity;
  for (let r = 0; r < R; r++) for (let k = 0; k < K; k++) if (TERREIN[r][k] === 'water') min = Math.min(min, afstand(plek, [r, k]));
  return min;
};
const naast = (plek, soort) => {
  const [r, k] = plek;
  for (let dr = -1; dr <= 1; dr++) for (let dk = -1; dk <= 1; dk++) if (TERREIN[r + dr]?.[k + dk] === soort) return true;
  return false;
};
// the wind comes from the west (left): benedenwinds(a, b) is true when b lies downwind of a, i.e. east of it on about
// the same rows
const benedenwinds = ([r1, k1], [r2, k2]) => k2 > k1 && Math.abs(r1 - r2) <= 1;

/** Findings per placed thing: [{ plek, soort: 'goed' | 'fout' | 'matig', tekst }]. */
function nakijken(geplaatst) {
  const uit = [];
  const van = (id) => geplaatst.filter((g) => g.id === id);
  const op = (g) => TERREIN[g.plek[0]][g.plek[1]];
  for (const g of geplaatst) {
    const Naam = `${g.naam[0].toUpperCase()}${g.naam.slice(1)}`;
    if (op(g) === 'water') uit.push({ g, soort: 'fout', tekst: `${Naam}: dat staat in de beek.` });
    else if (g.id !== 'tent' && (op(g) === 'pad' || op(g) === 'kraan')) uit.push({ g, soort: 'fout', tekst: `${Naam} op het pad of op de kraan: daar moet iedereen langs kunnen.` });
  }
  for (const t of van('tent')) {
    if (op(t) === 'laagte') uit.push({ g: t, soort: 'fout', tekst: 'Tent in de laagte: bij regen loopt het water hierheen.' });
    else if (op(t) === 'pad' || op(t) === 'kraan') uit.push({ g: t, soort: 'fout', tekst: 'Tent op het pad of bij de kraan: daar loopt iedereen langs, en je scheerlijnen worden struikeldraden.' });
    else if (op(t) === 'boom' || naast(t.plek, 'boom')) uit.push({ g: t, soort: 'fout', tekst: 'Tent onder of vlak naast de bomen: bij wind kunnen er (dode) takken vallen.' });
    else if (totWater(t.plek) <= 10) uit.push({ g: t, soort: 'fout', tekst: 'Tent vlak aan de beek: op de oever is de grond zacht, en het water kan stijgen.' });
  }
  for (const v of van('vuur')) {
    if (op(v) === 'boom' || naast(v.plek, 'boom')) uit.push({ g: v, soort: 'fout', tekst: 'Vuur onder of bij de bomen: geen vuur onder overhangende takken.' });
    for (const t of van('tent')) {
      if (afstand(v.plek, t.plek) <= 15) { uit.push({ g: v, soort: 'fout', tekst: 'Vuur vlak naast een tent: vonken branden gaatjes in tentdoek.' }); break; }
    }
    if (van('tent').some((t) => benedenwinds(v.plek, t.plek) && afstand(v.plek, t.plek) <= 40)) {
      uit.push({ g: v, soort: 'matig', tekst: 'De wind komt uit het westen: de rook van dit vuur waait over de tenten. Zet het vuur liever ten oosten van de tenten.' });
    }
  }
  for (const hu of van('hudo')) {
    const w = totWater(hu.plek);
    if (w < 60) uit.push({ g: hu, soort: 'fout', tekst: `HUDO op ${Math.round(w)} m van de beek: houd minstens 60 m afstand van water.` });
    const dichtbij = geplaatst.find((g) => ['keuken', 'afwas', 'tent'].includes(g.id) && afstand(hu.plek, g.plek) < 20);
    if (dichtbij) uit.push({ g: hu, soort: 'fout', tekst: `HUDO vlak bij de ${dichtbij.naam}: zet hem aan de rand, uit de buurt van de keuken en de tenten.` });
    if (van('tent').some((t) => benedenwinds(hu.plek, t.plek) && afstand(hu.plek, t.plek) <= 40)) {
      uit.push({ g: hu, soort: 'matig', tekst: 'De wind waait van de HUDO naar de tenten: dat ruik je. Kies een plek ten oosten van de tenten, of verder weg.' });
    }
  }
  for (const k of van('keuken')) {
    const kraan = afstand(k.plek, [3, 3]);
    if (kraan > 30) uit.push({ g: k, soort: 'matig', tekst: `De keuken staat ${Math.round(kraan)} m van de kraan: dat is veel sjouwen met water.` });
    if (op(k) === 'laagte') uit.push({ g: k, soort: 'fout', tekst: 'Keuken in de laagte: bij regen sta je in de modder.' });
  }
  for (const a of van('afwas')) {
    if (totWater(a.plek) <= 10) uit.push({ g: a, soort: 'fout', tekst: 'Afwas vlak aan de beek: afwaswater hoort niet in het water. Gebruik een afvoerputje, verder van de beek.' });
    const k = van('keuken')[0];
    if (k && afstand(a.plek, k.plek) > 30) uit.push({ g: a, soort: 'matig', tekst: 'De afwasplek ligt ver van de keuken: handiger dichtbij.' });
  }
  for (const a of van('afval')) {
    if (van('tent').some((t) => afstand(a.plek, t.plek) <= 15)) uit.push({ g: a, soort: 'matig', tekst: 'Afval vlak naast een tent: dat ruikt, en het trekt dieren. Zet het wat verder weg, goed dicht.' });
  }
  for (const g of geplaatst) if (!uit.some((f) => f.g === g)) uit.push({ g, soort: 'goed', tekst: `${g.naam[0].toUpperCase()}${g.naam.slice(1)}: goede plek.` });
  return uit;
}

export default function indelen() {
  let gekozen = 'tent';
  let geplaatst = [];              // [{ id, naam, plek: [r, k] }]
  let nagekeken = false;

  const cellen = [];
  const veld = h('div.ki-veld', { role: 'grid', 'aria-label': 'Het kampterrein, 10 bij 8 vakken van 10 meter. De wind komt uit het westen.' });
  for (let r = 0; r < R; r++) {
    const rij = h('div.ki-rij', { role: 'row' });
    for (let k = 0; k < K; k++) {
      const cel = h('button.ki-cel', { type: 'button', role: 'gridcell', class: `ki-${TERREIN[r][k]}`, onclick: () => zet(r, k), onkeydown: (e) => pijl(e, r, k) });
      cellen.push(cel); rij.append(cel);
    }
    veld.append(rij);
  }
  const wind = h('p.ki-wind', { 'aria-hidden': 'true' }, '→ wind uit het westen');
  const keuzeRij = h('div.chips', { role: 'group', 'aria-label': 'Wat zet je neer?' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const lijst = h('ul.kd-lijst', { 'aria-live': 'polite' });
  const kijk = actie('Kijk het na', 'vink', () => naKijken(), { hoofd: true, klein: true });
  const leeg = actie('Haal alles weg', 'wis', () => { geplaatst = []; nagekeken = false; lijst.replaceChildren(); teken(); }, { klein: true });

  const over = (id) => DINGEN.find((d) => d.id === id).aantal - geplaatst.filter((g) => g.id === id).length;

  function teken() {
    keuzeRij.replaceChildren(...DINGEN.map((d) => h('button.chip', { type: 'button', 'aria-pressed': String(d.id === gekozen),
      onclick: () => { gekozen = d.id; teken(); } }, d.naam, h('span.chip-aantal', String(over(d.id))))));
    const fouten = nagekeken ? nakijken(geplaatst) : [];
    cellen.forEach((cel, i) => {
      const r = Math.floor(i / K); const k = i % K;
      const hier = geplaatst.find((g) => g.plek[0] === r && g.plek[1] === k);
      cel.textContent = hier ? hier.naam : TERREIN[r][k] === 'kraan' ? 'kraan' : '';
      cel.classList.toggle('bezet', !!hier);
      const oordeel = hier && fouten.filter((f) => f.g === hier).map((f) => f.soort);
      cel.classList.toggle('goed', !!oordeel && oordeel.includes('goed'));
      cel.classList.toggle('fout', !!oordeel && oordeel.includes('fout'));
      cel.classList.toggle('matig', !!oordeel && !oordeel.includes('fout') && oordeel.includes('matig'));
      cel.setAttribute('aria-label', `${LETTERS[k]}${r + 1}: ${TERREIN_NAAM[TERREIN[r][k]]}${hier ? `, hier staat: ${hier.naam}` : ''}`);
    });
    kijk.disabled = !geplaatst.length;
  }

  function zet(r, k) {
    const hier = geplaatst.find((g) => g.plek[0] === r && g.plek[1] === k);
    nagekeken = false; lijst.replaceChildren(); melding.classList.remove('fout');
    if (hier) {
      geplaatst = geplaatst.filter((g) => g !== hier);
      gekozen = hier.id;
      melding.textContent = `${hier.naam} weggehaald van ${LETTERS[k]}${r + 1}.`;
    } else if (over(gekozen) > 0) {
      const d = DINGEN.find((x) => x.id === gekozen);
      geplaatst.push({ id: d.id, naam: d.naam, plek: [r, k] });
      melding.textContent = `${d.naam} op ${LETTERS[k]}${r + 1}.`;
      if (!over(gekozen)) gekozen = DINGEN.find((x) => over(x.id) > 0)?.id ?? gekozen;
    } else {
      melding.textContent = `Alle ${DINGEN.find((x) => x.id === gekozen).naam === 'tent' ? 'tenten' : 'dingen van deze soort'} staan al. Tik op iets dat al staat om het weg te halen.`;
    }
    teken();
  }

  function pijl(e, r, k) {
    const d = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key];
    if (!d) return;
    e.preventDefault();
    const nr = Math.max(0, Math.min(R - 1, r + d[0])); const nk = Math.max(0, Math.min(K - 1, k + d[1]));
    cellen[nr * K + nk].focus();
  }

  function naKijken() {
    nagekeken = true;
    const uit = nakijken(geplaatst);
    const nogOver = DINGEN.filter((d) => over(d.id) > 0).map((d) => d.naam);
    const slecht = uit.filter((f) => f.soort !== 'goed');
    lijst.replaceChildren(...slecht.map((f) => h('li', { class: f.soort }, f.tekst)));
    melding.classList.toggle('fout', slecht.some((f) => f.soort === 'fout'));
    melding.textContent = slecht.length ? `${slecht.filter((f) => f.soort === 'fout').length} fout, ${slecht.filter((f) => f.soort === 'matig').length} kan beter.`
      : nogOver.length ? `Wat er staat, staat goed. Nog neer te zetten: ${nogOver.join(', ')}.` : 'Alles staat op een goede plek. Mooi ingedeeld!';
    teken();
  }

  teken();
  return h('div.kd.naast.doe-indelen',
    h('div', wind, veld, h('p.ki-legenda', ...[['water', 'beek'], ['boom', 'bomen'], ['laagte', 'laagte'], ['pad', 'pad'], ['kraan', 'kraan']]
      .map(([k, t]) => h('span.ki-item', h(`span.ki-l.ki-${k}`), t)), h('span.ki-item', '· een vak is 10 m'))),
    h('div.kd-tekst', h('p', 'Kies wat je neerzet en tik op een vak. Tik op iets dat al staat om het weg te halen.'), keuzeRij, acties(kijk, leeg), melding, lijst));
}
