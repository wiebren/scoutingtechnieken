// Pack a rucksack: choose a thing and put it in a part of the pack (lid, top, middle against your back, middle at
// the front, bottom). A dot shows where the weight ends up; "Kijk het na" says what is in a good place and what is
// not. The rule: heavy things in the middle, close to your back; the sleeping bag at the bottom; what you need on
// the way at the top or in the lid. Facts: TKN §3.5 and kamperen-uitwerking.md (DEUTER, EE).
import { h } from '../../dom.js';
import { actie, acties } from '../knoppen.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './kamp.css';
import './rugzak.css';

// the parts of the pack: a box in the drawing, and where its weight sits (x from the back, y from the bottom, 0-1)
const VAKKEN = [
  { id: 'deksel', naam: 'deksel', waar: 'in het deksel', x: 60, y: 14, w: 108, h: 30, zx: 0.5, zy: 0.95 },
  { id: 'boven', naam: 'bovenin', waar: 'bovenin', x: 56, y: 50, w: 116, h: 54, zx: 0.5, zy: 0.78 },
  { id: 'rug', naam: 'midden, tegen je rug', waar: 'in het midden, tegen je rug', x: 56, y: 110, w: 56, h: 84, zx: 0.2, zy: 0.55 },
  { id: 'voor', naam: 'midden, aan de buitenkant', waar: 'in het midden, aan de buitenkant', x: 116, y: 110, w: 58, h: 84, zx: 0.8, zy: 0.55 },
  { id: 'onder', naam: 'onderin', waar: 'onderin', x: 56, y: 200, w: 120, h: 50, zx: 0.5, zy: 0.15 },
];

// gewicht: 3 heavy, 2 middle, 1 light; goed: the parts where it belongs
const DINGEN = [
  { id: 'slaapzak', naam: 'slaapzak', gewicht: 1, goed: ['onder'], waarom: 'De slaapzak heb je pas ’s avonds nodig, en hij is licht en zacht: onderin.' },
  { id: 'tent', naam: 'tent', gewicht: 3, goed: ['rug'], waarom: 'De tent is zwaar: in het midden, dicht tegen je rug.' },
  { id: 'eten', naam: 'eten en pan', gewicht: 3, goed: ['rug'], waarom: 'Eten, pan en brander zijn zwaar: in het midden, tegen je rug.' },
  { id: 'water', naam: 'water', gewicht: 3, goed: ['rug'], waarom: 'Water is zwaar: dicht tegen je rug. Een fles die je onderweg pakt, kan in een zijvak.' },
  { id: 'kleding', naam: 'kleding', gewicht: 1, goed: ['voor', 'onder'], waarom: 'Kleding is licht: om het zware heen, aan de buitenkant of onderin.' },
  { id: 'regenjas', naam: 'regenjas', gewicht: 1, goed: ['boven', 'deksel'], waarom: 'De regenjas moet je snel kunnen pakken: bovenin.' },
  { id: 'ehbo', naam: 'EHBO-set', gewicht: 1, goed: ['boven', 'deksel'], waarom: 'De EHBO-set moet je snel kunnen vinden: bovenin of in het deksel.' },
  { id: 'kaart', naam: 'kaart en snack', gewicht: 1, goed: ['deksel'], waarom: 'Kaart, kompas en iets te eten pak je steeds: in het deksel.' },
];

export default function rugzak() {
  let gekozen = DINGEN[0].id;
  let waar = {};                     // ding id -> vak id
  let nagekeken = false;

  const inhoud = {};                 // vak id -> <text> with what is in it
  const vakken = VAKKEN.map((v) => {
    const t = s('text', { x: v.x + v.w / 2, y: v.y + v.h / 2, 'text-anchor': 'middle', class: 'rz-inhoud' });
    inhoud[v.id] = t;
    const vak = s('g', { class: 'rz-vak', role: 'button', tabindex: '0', 'aria-label': v.naam },
      s('rect', { x: v.x, y: v.y, width: v.w, height: v.h, rx: 8 }), t);
    vak.addEventListener('click', () => leg(v.id));
    vak.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); leg(v.id); } });
    return vak;
  });
  const zwaartepunt = s('circle', { r: 7, class: 'rz-punt', visibility: 'hidden' });
  const svg = s('svg', { viewBox: '0 0 240 266', class: 'kd-svg rz-svg' },
    s('path', { d: 'M50 20Q50 8 64 8H166Q182 8 182 24L186 248Q186 260 172 260H62Q48 260 48 248Z', class: 'rz-zak' }),
    s('path', { d: 'M36 40Q24 140 36 250', class: 'rz-rug' }),
    s('text', { x: 18, y: 150, class: 'kd-label', transform: 'rotate(-90 18 150)', 'text-anchor': 'middle' }, 'je rug'),
    vakken, zwaartepunt);

  const keuzeRij = h('div.chips', { role: 'group', 'aria-label': 'Wat pak je in?' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const meter = h('p.kd-score', { 'aria-live': 'polite' });
  const lijst = h('ul.kd-lijst');
  const kijk = actie('Kijk het na', 'vink', () => { nagekeken = true; teken(); }, { hoofd: true, klein: true });
  const leeg = actie('Haal alles eruit', 'wis', () => { waar = {}; nagekeken = false; gekozen = DINGEN[0].id; melding.textContent = ''; teken(); }, { klein: true });

  function leg(vak) {
    if (!gekozen) { melding.textContent = 'Kies eerst wat je inpakt.'; return; }
    waar = { ...waar, [gekozen]: vak };
    nagekeken = false;
    const d = DINGEN.find((x) => x.id === gekozen);
    melding.textContent = `${d.naam[0].toUpperCase()}${d.naam.slice(1)}: ${VAKKEN.find((v) => v.id === vak).waar}.`;
    gekozen = DINGEN.find((x) => !waar[x.id])?.id ?? null;
    teken();
  }

  function teken() {
    keuzeRij.replaceChildren(...DINGEN.map((d) => h('button.chip', { type: 'button', 'aria-pressed': String(d.id === gekozen),
      class: waar[d.id] ? 'rz-gedaan' : null, onclick: () => { gekozen = d.id; teken(); } }, d.naam)));
    for (const v of VAKKEN) {
      const hier = DINGEN.filter((d) => waar[d.id] === v.id);
      const t = inhoud[v.id];
      t.replaceChildren(...hier.map((d, i) => s('tspan', { x: v.x + v.w / 2, dy: i ? 12 : -((hier.length - 1) * 6) + 4,
        class: nagekeken ? (d.goed.includes(v.id) ? 'rz-goed' : 'rz-fout') : '' }, d.naam)));
      vakken[VAKKEN.indexOf(v)].setAttribute('aria-label', `${v.naam}${hier.length ? `: ${hier.map((d) => d.naam).join(', ')}` : ', leeg'}`);
    }
    // where the weight is: the weighted mean of the parts
    const gelegd = DINGEN.filter((d) => waar[d.id]);
    const totaal = gelegd.reduce((n, d) => n + d.gewicht, 0);
    if (totaal) {
      const zx = gelegd.reduce((n, d) => n + d.gewicht * VAKKEN.find((v) => v.id === waar[d.id]).zx, 0) / totaal;
      const zy = gelegd.reduce((n, d) => n + d.gewicht * VAKKEN.find((v) => v.id === waar[d.id]).zy, 0) / totaal;
      zwaartepunt.setAttribute('cx', 56 + zx * 118); zwaartepunt.setAttribute('cy', 250 - zy * 236);
      zwaartepunt.setAttribute('visibility', 'visible');
      const ver = zx > 0.45 ? 'Het gewicht zit ver van je rug: de rugzak trekt je naar achteren.' : '';
      const laag = zy < 0.38 ? 'Het gewicht zit laag: de rugzak hangt aan je schouders en zwiept.' : zy > 0.72 ? 'Het gewicht zit hoog: je wordt wiebelig.' : '';
      meter.textContent = `Zwaartepunt (de rode stip): ${ver || laag ? `${ver} ${laag}`.trim() : 'dicht bij je rug, op schouderbladhoogte. Zo draagt hij goed.'}`;
    } else {
      zwaartepunt.setAttribute('visibility', 'hidden');
      meter.textContent = '';
    }
    if (nagekeken) {
      const fout = DINGEN.filter((d) => waar[d.id] && !d.goed.includes(waar[d.id]));
      const open = DINGEN.filter((d) => !waar[d.id]);
      lijst.replaceChildren(...fout.map((d) => h('li.fout', d.waarom)),
        ...(open.length ? [h('li.matig', `Nog niet ingepakt: ${open.map((d) => d.naam).join(', ')}.`)] : []),
        ...(!fout.length && !open.length ? [h('li.goed', 'Alles zit op een goede plek. Trek de riemen aan: eerst de heupband, dan de schouderbanden.')] : []));
    } else lijst.replaceChildren();
    svg.setAttribute('aria-label', `Een rugzak van opzij met vijf vakken. ${meter.textContent}`);
  }

  teken();
  return h('div.kd.naast.doe-rugzak', svg,
    h('div.kd-tekst', h('p', 'Kies wat je inpakt, en tik op het vak waar het in gaat.'), keuzeRij, acties(kijk, leeg), melding, meter, lijst));
}
