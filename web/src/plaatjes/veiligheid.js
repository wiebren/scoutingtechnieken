// Drawings for veiligheid. See ../plaatjes.js and ./basis.js. Flags, lights and fire keep their real colours in
// both themes; the rest uses the .plaatje classes in style.css and the vh- classes in ./veiligheid.css.
import { pol, r1, svg, tekst } from './basis.js';

let teller = 0;

/** The beach flags of Reddingsbrigade Nederland (the set of 2025: reddingsbrigade.nl, Vlaggen voor vlaggenmast and
 * Vlaggen voor vlaggenstokken): what they look like and what they mean. Also used by the piece. */
export const STRANDVLAGGEN = [
  { id: 'roodgeel', naam: 'Rood-gele vlag', kort: 'Lifeguards: hier zwemmen', uitleg: 'de reddingspost is open en lifeguards houden toezicht. Tussen twee rood-gele vlaggen aan de waterlijn letten ze extra op: daar zwem je het veiligst. Watersport mag daar niet.' },
  { id: 'geel', naam: 'Gele vlag', kort: 'Gevaarlijk zwemmen', uitleg: 'het water is gevaarlijk, door wind, golven of stroming. Zwemmen wordt afgeraden. Kun je niet goed zwemmen, blijf dan uit het water.' },
  { id: 'rood', naam: 'Rode vlag', kort: 'Niet zwemmen', uitleg: 'niet zwemmen, het is zeer gevaarlijk. Ook niet pootjebaden of watersporten.' },
  { id: 'oranje', naam: 'Oranje vlag', kort: 'Geen luchtbedden', uitleg: 'geen luchtbedden, opblaasbootjes of andere drijfdingen: de wind waait van het land de zee op en blaast je weg van de kust.' },
  { id: 'paars', naam: 'Paarse vlag', kort: 'Kwallen of vies water', uitleg: 'er zijn gevaarlijke zeedieren, zoals kwallen, of het water is vervuild. Zwemmen wordt afgeraden.' },
  { id: 'blok', naam: 'Zwart-wit geblokte vlag', kort: 'Voor watersport', uitleg: 'tussen twee van deze vlaggen aan de waterlijn is het voor watersporters, zoals surfers. Zwem daar niet.' },
];

/** One beach flag on its pole, as an SVG string, 200 by 220. */
export function strandvlag(id, titel) {
  const doek = (vulling) => `<path d="M60 30 Q100 22 150 32 Q148 62 150 92 Q100 82 60 90 Z" fill="${vulling}"/>`;
  const rand = '<path d="M60 30 Q100 22 150 32 Q148 62 150 92 Q100 82 60 90 Z" fill="none" stroke="#333" stroke-width="1.2"/>';
  let d = '';
  if (id === 'roodgeel') d = doek('#f1c40f') + '<path d="M60 30 Q100 22 150 32 Q149 47 149.5 62 Q100 54 60 60 Z" fill="#d7262b"/>' + rand;
  else if (id === 'geel') d = doek('#f1c40f') + rand;
  else if (id === 'rood') d = doek('#d7262b') + rand;
  else if (id === 'blok') {
    d = doek('#ffffff');
    for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) if ((r + k) % 2 === 0) d += `<rect x="${60 + k * 22.5}" y="${28 + r * 30}" width="22.5" height="30" fill="#1b1b1b"/>`;
    const id2 = `vh-vlag-${(teller += 1)}`;
    d = `<clipPath id="${id2}"><path d="M60 30 Q100 22 150 32 Q148 62 150 92 Q100 82 60 90 Z"/></clipPath><g clip-path="url(#${id2})">${d}</g>${rand}`;
  } else if (id === 'oranje') d = doek('#f07c1e') + rand;
  else if (id === 'paars') d = doek('#7b3fa0') + rand;
  return `<svg class="plaatje vh-strandvlag" viewBox="0 0 200 220" role="img" aria-label="${titel}" xmlns="http://www.w3.org/2000/svg">`
    + '<rect x="56" y="22" width="4" height="190" rx="2" fill="#6d6d6d"/><circle cx="58" cy="21" r="4" fill="#8a8a8a"/>'
    + `<path d="M20 212 H180" stroke="#c9a95f" stroke-width="6" stroke-linecap="round"/>${d}</svg>`;
}

/** Signs that get worse from left to right, in three steps, the last one red (for onderkoeling, oververhitting). */
function signalen(id, stappen, titel) {
  let d = '';
  stappen.forEach(([kop, regels, kleur], i) => {
    const x = 4 + i * 126;
    d += `<path d="M${x} 6 H${x + 110} L${x + 120} 66 L${x + 110} 126 H${x} ${i ? `L${x + 10} 66` : ''} Z" class="vh-stap-${kleur}"/>`;
    d += tekst(x + 60, 42, kop, { maat: 12, klasse: 'vet' });
    d += regels.map((r, j) => tekst(x + 60, 66 + j * 14, r, { maat: 9 })).join('');
  });
  return svg(380, 132, titel, d).replace('class="plaatje"', `class="plaatje vh-${id}"`);
}

// People in the EHBO drawings: thick lines in the colour of their clothes, the helper blue, the one who needs help
// green.
const HUID = '#e9b98f';
const HELPER = '#3c78c8';
const GEWONDE = '#3f8f5a';
/** A person, or a part of one: lines through the points [[x, y], …] and, when given, a head. */
function mens(hoofd, delen, { kleur = HELPER, dikte = 5, r = 8 } = {}) {
  const d = delen.map((p) => `M${p.map(([x, y]) => `${x} ${y}`).join(' L')}`).join(' ');
  return `<path d="${d}" stroke="${kleur}" stroke-width="${dikte}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
    + (hoofd ? `<circle cx="${hoofd[0]}" cy="${hoofd[1]}" r="${r}" fill="${HUID}"/>` : '');
}

/** Three tiles side by side, each a small drawing round (0, 0), a name and a line (as in weren-kleren-smeren). */
function drieTegels(tegels, titel) {
  let d = '';
  tegels.forEach(([naam, onder, ikoon], i) => {
    const x = 4 + i * 126;
    d += `<rect x="${x}" y="4" width="120" height="132" rx="10" class="vlak2"/>`;
    d += `<g transform="translate(${x + 60} 54)">${ikoon}</g>`;
    d += tekst(x + 60, 112, naam, { maat: 12, klasse: 'vet' }) + tekst(x + 60, 127, onder, { maat: 9.5 });
  });
  return svg(380, 140, titel, d);
}

/** Numbered steps side by side: [drawing in a cell from (0, 0), line, line]; the cell is (380 - gaps) / n wide. */
function stappen(lijst, hoog, titel) {
  const n = lijst.length; const w = (380 - 4 * (n - 1)) / n;
  let d = '';
  lijst.forEach(([teken, regel1, regel2], i) => {
    const x = r1(i * (w + 4));
    d += `<rect x="${x}" y="0" width="${r1(w)}" height="${hoog}" rx="8" class="vlak2"/>`;
    d += `<g transform="translate(${x} 0)">${teken}</g>`;
    d += `<circle cx="${x + 13}" cy="13" r="9" class="vh-nummer"/>` + tekst(x + 13, 17, String(i + 1), { maat: 11, klasse: 'vet' });
    d += tekst(r1(x + w / 2), hoog - 21, regel1, { maat: 9.5 }) + tekst(r1(x + w / 2), hoog - 8, regel2, { maat: 9.5 });
  });
  return svg(380, hoog, titel, d);
}

/** A forearm lying across, from x0 to x1, its top at y (about 30 thick). */
const onderarm = (x0, x1, y) => `<path d="M${x0} ${y + 2} Q${(x0 + x1) / 2} ${y - 3} ${x1} ${y} L${x1} ${y + 30} Q${(x0 + x1) / 2} ${y + 32} ${x0} ${y + 36} Z" class="vh-huid"/>`;
/** Turns of a bandage over an arm: slanted bands from x0, `n` of them `stap` apart, from y to y + h. */
const slagen = (x0, n, stap, y, h, klasse = 'vh-zwachtel') => Array.from({ length: n }, (_, k) => {
  const x = x0 + k * stap;
  return `<path d="M${x} ${y} L${x + 9} ${y - 1} L${x + 13} ${y + h} L${x + 4} ${y + h + 1} Z" class="${klasse}"/>`;
}).join('');
/** A reef knot with two short ends, seen from above. */
const knoopje = (x, y) => `<path d="M${x} ${y} q8 2 14 10 M${x} ${y} q11 -3 17 2" class="vh-slip"/><circle cx="${x}" cy="${y}" r="4.5" class="vh-zwachtel"/>`;
/** A roll of bandage, end on. */
const rol = (x, y, r = 7) => `<circle cx="${x}" cy="${y}" r="${r}" class="vh-zwachtel"/><circle cx="${x}" cy="${y}" r="${r * 0.4}" class="lijn dun stil"/>`;

export default {
  strandvlaggen: () => {
    let d = '';
    STRANDVLAGGEN.forEach((v, i) => {
      const x = (i % 3) * 127; const y = Math.floor(i / 3) * 150;
      const binnen = strandvlag(v.id, v.naam).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
      d += `<g transform="translate(${x + 4} ${y}) scale(0.6)">${binnen}</g>`;
      d += tekst(x + 64, y + 140, v.kort, { maat: v.kort.length > 20 ? 8.4 : 9.5, klasse: 'vet' });
    });
    return svg(380, 300, 'De vlaggen op het strand: rood-geel voor lifeguards, geel voor gevaarlijk zwemmen, rood voor niet zwemmen, oranje voor geen luchtbedden, paars voor gevaarlijke zeedieren of vies water, en zwart-wit geblokt voor watersport', d);
  },

  colonne: () => {
    let d = '<rect x="0" y="0" width="380" height="170" fill="#0f1b2d"/>'
      + '<path d="M0 118 H380 V170 H0Z" fill="#2b2f36"/><path d="M0 118 H380" stroke="#8a8f99" stroke-width="2"/>'
      + '<path d="M0 150 H40 M70 150 H110 M140 150 H180 M210 150 H250 M280 150 H320 M350 150 H380" stroke="#c9ccd2" stroke-width="2.5"/>'
      + '<path d="M0 96 Q60 86 120 94 T260 90 T380 96 V118 H0Z" fill="#1d3324"/>';
    const xs = [300, 255, 210, 165, 120, 75];
    xs.forEach((x, i) => {
      d += `<g transform="translate(${x} 128)"><circle cx="0" cy="-36" r="6" fill="#c9b8a6"/><path d="M0 -30 V-12 M0 -12 L-6 4 M0 -12 L6 4 M0 -26 L-7 -14 M0 -26 L7 -14" stroke="#c9b8a6" stroke-width="3" stroke-linecap="round"/>`
        + '<path d="M-5 -28 h10 v14 h-10z" fill="#e6f000" opacity="0.9"/></g>';
      if (i === 0) d += `<circle cx="${x + 9}" cy="${128 - 20}" r="4" fill="#ffffff"/><circle cx="${x + 9}" cy="${128 - 20}" r="14" fill="#ffffff" opacity="0.25"/>`;
      if (i === xs.length - 1) d += `<circle cx="${x - 9}" cy="${128 - 20}" r="4" fill="#ff3b30"/><circle cx="${x - 9}" cy="${128 - 20}" r="14" fill="#ff3b30" opacity="0.3"/>`;
    });
    d += '<path d="M330 70 h30 m-8 -6 l8 6 l-8 6" stroke="#e8eef8" stroke-width="2" fill="none"/>';
    d += `<text x="${xs[0] + 9}" y="78" font-size="11" text-anchor="middle" fill="#e8eef8" font-weight="700">wit licht</text>`;
    d += `<text x="${xs[xs.length - 1] - 9}" y="78" font-size="11" text-anchor="middle" fill="#e8eef8" font-weight="700">rood licht</text>`;
    d += '<text x="190" y="24" font-size="11" text-anchor="middle" fill="#e8eef8">op de rijbaan: achter elkaar, in colonne</text>';
    return `<svg class="plaatje" viewBox="0 0 380 170" role="img" aria-label="Een groep loopt 's nachts achter elkaar op de rand van de rijbaan, met hesjes aan. De voorste draagt een wit licht, de achterste een rood licht." xmlns="http://www.w3.org/2000/svg">${d}</svg>`;
  },

  'ijs-reiken': () => {
    let d = '<rect x="0" y="0" width="380" height="200" class="vh-lucht"/>'
      + '<path d="M0 130 H380 V200 H0Z" class="vh-ijs"/>'
      + '<path d="M0 118 Q40 112 92 120 L100 130 H0Z" class="vh-oever"/>'
      + '<ellipse cx="255" cy="152" rx="42" ry="13" class="vh-wak"/>'
      // the one in the hole, arms on the edge
      + '<circle cx="255" cy="138" r="8" fill="#e9b98f"/><path d="M247 146 L232 150 M263 146 L276 150" stroke="#3c78c8" stroke-width="5" stroke-linecap="round"/>'
      // the helper on the bank, lying low, reaching with a long branch
      + '<g transform="translate(64 118)"><circle cx="0" cy="-8" r="7" fill="#e9b98f"/><path d="M-36 -2 L-6 -4" stroke="#d23b3b" stroke-width="8" stroke-linecap="round"/></g>'
      + '<path d="M62 112 Q150 128 236 150" class="vh-tak"/>'
      + '<path d="M120 96 l14 14 m0 -14 l-14 14" stroke="#d23b3b" stroke-width="3"/>'
      + tekst(127, 90, 'niet het ijs op', { maat: 10, klasse: 'rood-tekst vet' })
      + tekst(160, 182, 'reik een tak, een touw of een jas aan', { maat: 10.5, klasse: 'vet' })
      + tekst(300, 30, 'en bel 112', { maat: 11, klasse: 'vet' });
    return svg(380, 200, 'Iemand is door het ijs gezakt. Een helper blijft op de kant, gaat laag liggen en reikt een lange tak aan. Niet zelf het ijs op, en bel 112', d);
  },

  vluchtplan: () => {
    let d = '<rect x="0" y="0" width="380" height="260" class="vh-buiten"/>';
    // the building: a hall, two rooms, a kitchen, a corridor
    d += '<rect x="30" y="30" width="250" height="190" class="vlak lijn dik"/>';
    d += '<path d="M30 120 H120 M120 30 V220 M120 150 H180 M180 150 V220 M200 30 V120 M200 120 H280" class="lijn"/>';
    d += tekst(75, 78, 'lokaal', { maat: 11 }) + tekst(75, 172, 'lokaal', { maat: 11 }) + tekst(160, 78, 'zaal', { maat: 11 }) + tekst(240, 78, 'keuken', { maat: 11 }) + tekst(230, 172, 'gang', { maat: 11 });
    // doors: gaps with a swing
    const deur = (x, y, w, h) => `<path d="M${x} ${y} h${w} v${h} h${-w}z" class="vlak"/>`;
    d += deur(118, 55, 4, 22) + deur(118, 160, 4, 22) + deur(205, 118, 24, 4) + deur(150, 148, 22, 4);
    // the exits: green signs
    const uit = (x, y) => `<rect x="${x - 10}" y="${y - 7}" width="20" height="14" rx="2" fill="#11904a"/><path d="M${x - 5} ${y} h8 m-3 -3 l3 3 l-3 3" stroke="#ffffff" stroke-width="1.6" fill="none"/>`;
    d += '<path d="M280 180 v24" class="vh-gat"/>' + uit(296, 192);
    d += '<path d="M60 220 h26" class="vh-gat"/>' + uit(73, 236);
    // escape routes
    d += '<path d="M75 92 Q100 100 120 70 Q150 100 160 130 Q196 140 230 190 Q260 194 284 192" class="vh-route"/>';
    d += '<path d="M75 186 L73 214" class="vh-route"/>';
    // fire extinguisher
    d += '<rect x="186" y="96" width="8" height="16" rx="3" fill="#d23b3b"/><path d="M190 96 v-4 h5" class="lijn"/>' + tekst(178, 116, 'blusser', { maat: 8.5, anker: 'end' });
    // meeting point outside
    d += '<circle cx="340" cy="60" r="16" fill="#11904a"/><path d="M332 54 h16 M334 60 h12 M336 66 h8" stroke="#ffffff" stroke-width="2"/>' + tekst(340, 92, 'verzamelplek', { maat: 9.5, klasse: 'vet' });
    d += tekst(330, 248, 'nooduitgang', { maat: 9, klasse: 'stil' });
    return svg(380, 260, 'Een plattegrond van een clubhuis met de vluchtroutes naar twee nooduitgangen met groene bordjes, de plek van de brandblusser en de verzamelplek buiten', d);
  },

  'vlam-in-de-pan': () => {
    let d = '<rect x="0" y="0" width="380" height="190" class="vlak2"/>';
    // stove and pan with fire
    d += '<rect x="20" y="150" width="200" height="12" rx="3" class="vol"/><path d="M60 150 h80" stroke="#333" stroke-width="3"/>';
    d += '<path d="M50 120 h140 l-8 30 h-124 z" fill="#5b6066"/><path d="M190 128 h50" stroke="#3a3d42" stroke-width="7" stroke-linecap="round"/>';
    d += '<path d="M64 120 Q70 80 88 98 Q96 60 112 92 Q124 54 136 94 Q150 72 158 102 Q168 88 176 120 Z" fill="#f08a1c"/><path d="M84 120 Q96 96 108 108 Q118 88 128 110 Q140 98 150 120Z" fill="#ffd34d"/>';
    // the lid, held as a shield, sliding over the pan from the front
    d += '<g transform="rotate(-24 120 92)"><ellipse cx="120" cy="92" rx="66" ry="10" fill="#9aa3ab" stroke="#5d656c" stroke-width="1.5"/><rect x="112" y="78" width="16" height="6" rx="3" fill="#3a3d42"/></g>';
    d += '<path d="M200 60 q-20 6 -34 22" class="lijn dik accent-lijn"/><path d="M168 74 l-3 10 l10 -3" class="lijn dik accent-lijn"/>';
    d += tekst(214, 50, 'vuur uit, deksel erop', { maat: 11, anker: 'start', klasse: 'vet accent-tekst' });
    // no water
    d += '<g transform="translate(300 118)"><path d="M-16 -30 h32 l-4 44 h-24 z" fill="#b9dcf0" stroke="#3a6ea5" stroke-width="1.5"/><path d="M-24 -38 L24 22 M24 -38 L-24 22" stroke="#d7262b" stroke-width="5" stroke-linecap="round"/></g>';
    d += tekst(300, 166, 'nooit water', { maat: 11, klasse: 'vet rood-tekst' });
    return svg(380, 190, 'Vlam in de pan: zet het vuur uit en schuif een deksel over de pan, als een schild voor je. Nooit water erop', d);
  },
  'stop-verdwaald': () => {
    const tegels = [
      ['S', 'Stop', 'blijf staan', '<path d="M-14 -6 h28 v-10 l-4 -2 v8 M-14 -6 v-14 l4 -2 v14 M-8 -6 v-18 l4 -1 v19 M-2 -6 v-18 l4 -1 v19 M-14 -6 Q-14 14 0 14 Q14 14 14 -6" class="lijn"/>'],
      ['T', 'Denk na', 'waar was het goed?', '<circle cx="0" cy="-4" r="15" class="lijn"/>' + tekst(0, 4, '?', { maat: 22, klasse: 'vet accent-tekst' })],
      ['O', 'Kijk rond', 'kaart, borden, mensen', '<path d="M-18 -4 Q0 -20 18 -4 Q0 12 -18 -4Z" class="lijn"/><circle cx="0" cy="-4" r="6" class="accent"/>'],
      ['P', 'Plan', 'kies dan pas', '<rect x="-16" y="-18" width="32" height="28" rx="2" class="vlak2 lijn"/><path d="M-10 6 Q-4 -6 4 -2 T12 -14" class="lijn rood-lijn" stroke-dasharray="3 2"/><circle cx="12" cy="-14" r="2.5" class="rood"/>'],
    ];
    let d = '';
    tegels.forEach(([letter, naam, onder, ikoon], i) => {
      const x = 4 + i * 94;
      d += `<rect x="${x}" y="4" width="88" height="132" rx="10" class="vlak2"/>`;
      d += tekst(x + 44, 32, letter, { maat: 24, klasse: 'vet accent-tekst' });
      d += `<g transform="translate(${x + 44} 70)">${ikoon}</g>`;
      d += tekst(x + 44, 108, naam, { maat: 12, klasse: 'vet' }) + tekst(x + 44, 124, onder, { maat: 9 });
    });
    return svg(380, 140, 'STOP als je verdwaald bent: Stop, blijf staan. Denk na: waar was het nog goed? Kijk rond: kaart, borden, mensen. Plan: kies dan pas wat je doet', d);
  },

  'zichtbaar-nacht': () => {
    // a dark road at night, a car's light from the left; one walker in dark clothes, one with a vest and bands
    let d = '<rect x="0" y="0" width="380" height="180" class="nacht"/>'
      + '<path d="M0 130 H380 V180 H0Z" fill="#2b2f36"/><path d="M0 130 H380" stroke="#8a8f99" stroke-width="2"/>'
      + '<path d="M58 118 L380 70 V150 L58 132Z" fill="#fff6c8" opacity="0.16"/>'
      + '<path d="M8 112 h44 l6 10 v12 h-56 v-12z" fill="#3c4250"/><circle cx="56" cy="124" r="4" fill="#fff6c8"/>';
    const loper = (x, kleur, hesje) => `<g transform="translate(${x} 132)"><circle cx="0" cy="-58" r="8" fill="${kleur}"/>`
      + `<path d="M0 -50 V-22 M0 -22 L-8 0 M0 -22 L8 0 M0 -44 L-10 -26 M0 -44 L10 -26" stroke="${kleur}" stroke-width="5" stroke-linecap="round"/>`
      + (hesje ? '<path d="M-7 -48 h14 v24 h-14z" fill="#e6f000"/><path d="M-7 -40 h14 M-7 -32 h14" stroke="#ffffff" stroke-width="2.4"/>'
        + '<path d="M-10 -10 l4 1 M10 -10 l-4 1" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><circle cx="-11" cy="-40" r="2.5" fill="#ff3b30"/>' : '')
      + '</g>';
    d += loper(190, '#232a36', false) + loper(300, '#3a3f4a', true);
    d += '<text x="190" y="28" font-size="11" text-anchor="middle" fill="#e8eef8" font-weight="700">donkere kleren</text>'
      + '<text x="190" y="42" font-size="10" text-anchor="middle" fill="#c9d2df">zie je pas heel laat</text>'
      + '<text x="300" y="28" font-size="11" text-anchor="middle" fill="#e8eef8" font-weight="700">hesje en reflectie</text>'
      + '<text x="300" y="42" font-size="10" text-anchor="middle" fill="#c9d2df">zie je van ver</text>';
    return `<svg class="plaatje" viewBox="0 0 380 180" role="img" aria-label="Twee wandelaars 's nachts langs de weg in het licht van een auto. Wie donkere kleren draagt, zie je pas heel laat. Wie een hesje met reflecterende banden en een lampje draagt, zie je van ver." xmlns="http://www.w3.org/2000/svg">${d}</svg>`;
  },

  'regel-van-drie': () => {
    const tegels = [
      ['3 minuten', 'zonder lucht', '<path d="M-18 -10 h22 q8 0 8 -6 t-8 -6 M-18 0 h30 q8 0 8 6 t-8 6 M-18 -5 h12" class="lijn blauw-lijn" stroke-width="2.4" stroke-linecap="round"/>'],
      ['3 uur', 'zonder beschutting', '<path d="M-20 12 L0 -20 L20 12Z" class="accent-licht"/><path d="M-20 12 L0 -20 L20 12 M0 -20 V12 M-26 12 H26" class="lijn"/>'],
      ['3 dagen', 'zonder water', '<path d="M0 -22 Q16 0 12 8 A12 12 0 0 1 -12 8 Q-16 0 0 -22Z" class="blauw"/>'],
      ['3 weken', 'zonder eten', '<circle cx="-4" cy="2" r="13" class="rood"/><circle cx="6" cy="2" r="13" class="rood"/><path d="M1 -10 q2 -8 8 -10" class="lijn" stroke-width="2"/>'],
    ];
    let d = '';
    tegels.forEach(([tijd, wat, ikoon], i) => {
      const x = 4 + i * 94;
      d += `<rect x="${x}" y="4" width="88" height="112" rx="10" class="vlak2"/>`;
      d += `<g transform="translate(${x + 44} 40)">${ikoon}</g>`;
      d += tekst(x + 44, 84, tijd, { maat: 12.5, klasse: 'vet' }) + tekst(x + 44, 101, wat, { maat: 9.5 });
    });
    d += '<path d="M20 130 H356 M348 124 l8 6 l-8 6" class="lijn stil"/>' + tekst(20, 146, 'eerst', { maat: 10, anker: 'start', klasse: 'stil' }) + tekst(360, 146, 'als laatste', { maat: 10, anker: 'end', klasse: 'stil' });
    return svg(380, 152, 'De regel van drie: 3 minuten zonder lucht, 3 uur zonder beschutting, 3 dagen zonder water, 3 weken zonder eten. Wat links staat, komt eerst', d);
  },

  'weren-kleren-smeren': () => {
    const zon = (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="#f5b300"/>` + [0, 45, 90, 135, 180, 225, 270, 315].map((g) => {
      const a = (g * Math.PI) / 180; return `<path d="M${(x + 12 * Math.cos(a)).toFixed(1)} ${(y + 12 * Math.sin(a)).toFixed(1)} L${(x + 17 * Math.cos(a)).toFixed(1)} ${(y + 17 * Math.sin(a)).toFixed(1)}" stroke="#f5b300" stroke-width="2.4" stroke-linecap="round"/>`;
    }).join('');
    const tegels = [
      ['weren', 'zoek de schaduw', '<path d="M-26 -14 Q0 -36 26 -14Z" class="rood"/><path d="M0 -24 V22 M-30 22 H30" class="lijn"/><path d="M-22 -14 L-30 22 H30 L22 -14Z" class="vol-licht" opacity="0.5"/>'],
      ['kleren', 'shirt, pet, zonnebril', '<path d="M-20 -8 L-10 -16 H10 L20 -8 L14 -2 L10 -6 V22 H-10 V-6 L-14 -2Z" class="accent-licht"/><path d="M-20 -8 L-10 -16 H10 L20 -8 L14 -2 L10 -6 V22 H-10 V-6 L-14 -2Z" class="lijn"/><path d="M-12 -26 Q0 -36 12 -26 H18 v3 H-12Z" class="vol"/>'],
      ['smeren', 'factor 30 of meer', '<path d="M-10 -24 h20 l4 44 h-28z" class="vlak lijn"/><rect x="-6" y="-30" width="12" height="6" class="vol"/>' + tekst(0, 4, '30', { maat: 12, klasse: 'vet' })],
    ];
    let d = '';
    tegels.forEach(([naam, onder, ikoon], i) => {
      const x = 4 + i * 126;
      d += `<rect x="${x}" y="4" width="120" height="132" rx="10" class="vlak2"/>` + zon(x + 102, 24);
      d += `<g transform="translate(${x + 56} 62)">${ikoon}</g>`;
      d += tekst(x + 60, 110, naam, { maat: 13, klasse: 'vet' }) + tekst(x + 60, 126, onder, { maat: 9.5 });
    });
    return svg(380, 140, 'Tegen de zon: weren, zoek de schaduw. Kleren: een shirt, een pet en een zonnebril. Smeren: zonnebrand met factor 30 of meer', d);
  },

  mui: () => {
    // a beach from above: breaking waves, and a gap where a rip current flows out; how you get out of it
    let d = '<rect x="0" y="0" width="380" height="180" class="water"/><path d="M0 180 Q190 168 380 180 V240 H0Z" class="vh-zand"/>';
    for (const y of [70, 100, 130, 156]) {
      d += `<path d="M0 ${y} q12 -5 24 0 t24 0 t24 0 t24 0 t24 0 t24 0" class="vh-golf"/>`;
      d += `<path d="M232 ${y} q12 -5 24 0 t24 0 t24 0 t24 0 t24 0 t24 0" class="vh-golf"/>`;
    }
    // the rip: arrows out to sea in the gap
    for (const x of [178, 200, 222]) d += `<path d="M${x} 170 V44" class="vh-mui"/><path d="M${x - 6} 52 l6 -10 l6 10" class="vh-mui"/>`;
    d += '<path d="M168 40 Q200 14 232 40" class="vh-mui"/>';
    // the swimmer: carried out, then parallel to the beach, then in with the waves
    d += '<circle cx="200" cy="96" r="6" class="vh-zwemmer"/>';
    d += '<path d="M208 96 H280 M272 90 l8 6 l-8 6" class="vh-pad"/><path d="M286 104 V164 M280 156 l6 8 l6 -8" class="vh-pad"/>';
    // flags
    d += '<rect x="40" y="186" width="2" height="30" fill="#6d6d6d"/><path d="M42 186 h16 v6 h-16z" fill="#d7262b"/><path d="M42 192 h16 v6 h-16z" fill="#f1c40f"/>';
    d += '<rect x="120" y="184" width="2" height="30" fill="#6d6d6d"/><path d="M122 184 h16 v6 h-16z" fill="#d7262b"/><path d="M122 190 h16 v6 h-16z" fill="#f1c40f"/>';
    d += tekst(80, 230, 'zwem tussen de vlaggen', { maat: 9.5, klasse: 'vh-op-zand' });
    d += tekst(200, 24, 'mui: stroming de zee in', { maat: 10.5, klasse: 'vet' });
    d += tekst(232, 88, 'evenwijdig aan het strand', { maat: 10, anker: 'start', klasse: 'vet' });
    d += tekst(294, 134, 'met de golven', { maat: 10, anker: 'start', klasse: 'vet' }) + tekst(294, 146, 'naar de kant', { maat: 10, anker: 'start', klasse: 'vet' });
    d += tekst(110, 50, 'niet tegenin', { maat: 10, klasse: 'rood-tekst vet' });
    return svg(380, 240, 'Een strand van bovenaf. Waar de golven een gat hebben, stroomt een mui de zee in. Zwem er niet tegenin: laat je meevoeren, zwem evenwijdig aan het strand de mui uit, en dan met de golven naar de kant. Zwem tussen de rood-gele vlaggen', d);
  },

  'drenkeling-werpen': () => {
    let d = '<rect x="0" y="0" width="380" height="190" class="vh-lucht"/><path d="M0 120 H380 V190 H0Z" class="water"/>'
      + '<path d="M0 112 Q50 108 110 114 L118 124 L104 190 H0Z" class="vh-oever"/>';
    // the helper on the bank, throwing
    d += '<g transform="translate(70 112)"><circle cx="0" cy="-52" r="8" fill="#e9b98f"/><path d="M0 -44 V-18 M0 -18 L-7 0 M0 -18 L7 0 M0 -40 L-10 -26 M0 -40 L12 -54" stroke="#3c78c8" stroke-width="5" stroke-linecap="round"/></g>';
    d += '<path d="M84 56 Q180 0 262 128" class="lijn stil" stroke-dasharray="5 4"/>';
    // the ring buoy in the water, near the one who needs help
    d += '<circle cx="262" cy="136" r="11" fill="none" stroke="#f07c1e" stroke-width="7"/><circle cx="262" cy="136" r="11" fill="none" stroke="#ffffff" stroke-width="7" stroke-dasharray="4 13"/>';
    d += '<circle cx="290" cy="132" r="8" fill="#e9b98f"/><path d="M282 140 L270 136 M298 140 L306 132" stroke="#d23b3b" stroke-width="5" stroke-linecap="round"/>';
    d += tekst(150, 18, 'gooi iets dat drijft', { maat: 11, klasse: 'vet' });
    d += tekst(56, 132, 'blijf op de kant', { maat: 10, klasse: 'vet' });
    d += tekst(330, 30, 'en bel 112', { maat: 11, klasse: 'vet' });
    d += tekst(260, 176, 'ga alleen het water in als het echt niet anders kan', { maat: 9.5, klasse: 'stil' });
    return svg(380, 190, 'Iemand ligt in het water. Een helper blijft op de kant en gooit een reddingsboei, of iets anders dat drijft. Bel 112. Ga alleen zelf het water in als het echt niet anders kan', d);
  },

  'rook-laag': () => {
    let d = '<rect x="0" y="0" width="380" height="180" class="vlak2"/>'
      + '<path d="M0 20 H380 M0 160 H380" class="lijn dik"/>'
      + '<path d="M0 20 H380 V86 Q330 94 280 84 Q220 96 160 86 Q100 96 40 86 Q20 92 0 86Z" class="vh-rook"/>';
    // the door behind, closed
    d += '<rect x="14" y="64" width="34" height="96" class="vh-deur"/><circle cx="42" cy="114" r="2.5" class="vol"/>';
    // the one crawling under the smoke
    d += '<g transform="translate(170 160)"><circle cx="30" cy="-40" r="8" fill="#e9b98f"/><path d="M22 -34 L-14 -30 M-14 -30 L-28 -14 L-40 -2 M-14 -30 L-22 -4 M14 -34 L30 -14 M10 -33 L18 -10" stroke="#3c78c8" stroke-width="6" stroke-linecap="round" fill="none"/></g>';
    d += '<path d="M226 136 h40 m-8 -6 l8 6 l-8 6" class="lijn accent-lijn"/>';
    // exit
    d += '<rect x="322" y="64" width="40" height="96" class="vh-buitendeur"/><rect x="326" y="44" width="32" height="14" rx="2" fill="#11904a"/><path d="M334 51 h12 m-4 -4 l4 4 l-4 4" stroke="#ffffff" stroke-width="1.6" fill="none"/>';
    d += tekst(190, 46, 'rook: blijf eronder', { maat: 11, klasse: 'vet vh-op-rook' });
    d += tekst(31, 178, 'deur dicht', { maat: 9.5, klasse: 'stil' });
    d += tekst(110, 112, 'laag bij de vloer', { maat: 10.5, klasse: 'vet' });
    d += tekst(342, 178, 'naar buiten', { maat: 9.5, klasse: 'stil' });
    return svg(380, 180, 'Brand: de rook hangt boven in de gang. Blijf eronder, laag bij de vloer, en ga naar de buitendeur. Doe deuren achter je dicht', d);
  },

  bloedneus: () => {
    // two sitting figures seen from the side, facing right: leaning forward (good) and head back (not)
    const pop = (x, romp, hoofd) => {
      const rad = (g) => (g * Math.PI) / 180;
      const [sx, sy] = [x + 46 * Math.sin(rad(romp)), 118 - 46 * Math.cos(rad(romp))];
      const h = rad(romp + hoofd);
      const [cx, cy] = [sx + 17 * Math.sin(h), sy - 17 * Math.cos(h)];
      const [nx, ny] = [cx + 13 * Math.cos(h), cy + 13 * Math.sin(h)];
      const f = (n) => n.toFixed(1);
      return `<rect x="${x - 20}" y="122" width="40" height="36" rx="4" class="vol-licht"/>`
        + `<path d="M${x} 118 L${f(sx)} ${f(sy)} M${x} 118 H${x + 30} V156" stroke="#3c78c8" stroke-width="7" stroke-linecap="round" fill="none"/>`
        + `<circle cx="${f(cx)}" cy="${f(cy)}" r="12" fill="#e9b98f"/>`
        + `<path d="M${f(nx - 2 * Math.sin(h))} ${f(ny - 3 * Math.cos(h))} l${f(5 * Math.cos(h))} ${f(5 * Math.sin(h))} l${f(-5 * Math.cos(h) - 3 * Math.sin(h))} ${f(-5 * Math.sin(h) + 3 * Math.cos(h))}" fill="#e9b98f"/>`
        + `<path d="M${f(sx)} ${f(sy + 4)} L${f(nx + 4)} ${f(ny + 4)}" stroke="#3c78c8" stroke-width="5" stroke-linecap="round"/>`
        + `<circle cx="${f(nx + 3)}" cy="${f(ny + 2)}" r="3.6" fill="#e9b98f" stroke="#a8745a"/>`;
    };
    let d = '<rect x="0" y="0" width="380" height="200" class="vlak2"/>';
    d += pop(86, 28, 18) + pop(270, -18, -38);
    d += '<path d="M318 30 l34 34 M352 30 l-34 34" class="lijn rood-lijn" stroke-width="3"/>';
    d += tekst(100, 182, 'voorover, neus dichtknijpen', { maat: 10.5, klasse: 'vet accent-tekst' });
    d += tekst(280, 182, 'niet achterover', { maat: 10.5, klasse: 'vet rood-tekst' });
    return svg(380, 200, 'Bij een bloedneus: ga zitten, buig voorover en knijp je neus dicht. Niet met je hoofd achterover', d);
  },

  splinter: () => {
    // a close-up of skin, cut through: the splinter went in at an angle; pull it out the way it went in
    let d = '<rect x="0" y="0" width="380" height="170" class="vlak2"/>'
      + '<path d="M0 80 Q190 70 380 80 V170 H0Z" class="vh-huid"/><path d="M0 80 Q190 70 380 80" class="vh-huidrand"/>';
    d += '<path d="M196 74 L236 50 L240 56 L200 80Z" class="vh-splinter"/><path d="M150 102 L196 74 L200 80 L156 108Z" class="vh-splinter-onder"/>';
    // the tweezers holding the end
    d += '<path d="M238 52 L320 18 M240 56 L324 26" class="lijn dik"/>';
    d += '<path d="M150 58 L200 28 M190 27 l10 1 l-5 9" class="lijn accent-lijn" stroke-width="2.4"/>';
    d += tekst(92, 26, 'trek in de lengte,', { maat: 10.5, klasse: 'vet accent-tekst' }) + tekst(92, 39, 'zoals hij erin ging', { maat: 10.5, klasse: 'vet accent-tekst' });
    d += tekst(110, 140, 'het stuk onder de huid', { maat: 10, klasse: 'vh-op-huid' });
    d += tekst(330, 12, 'splinterpincet', { maat: 9.5, klasse: 'stil' });
    return svg(380, 170, 'Een splinter zit schuin in de huid. Pak het uiteinde met een splinterpincet en trek hem eruit in de lengte, zoals hij erin ging', d);
  },

  'blaren-voet': () => {
    // a foot from the side and a sole from below, with the places where shoes rub
    let d = '<rect x="0" y="0" width="380" height="190" class="vlak2"/>';
    d += '<path d="M20 150 Q18 120 40 108 L70 60 Q76 46 92 48 L100 52 Q108 90 140 112 Q190 126 210 140 Q218 154 200 160 L40 162 Q22 160 20 150Z" class="vh-huid"/>';
    d += '<path d="M248 30 Q228 40 232 80 Q236 110 246 130 Q250 168 280 170 Q306 170 306 136 Q304 100 316 72 Q324 36 296 22 Q270 14 248 30Z" class="vh-huid"/>';
    for (const [x, y, r] of [[26, 140, 10], [196, 148, 9], [262, 38, 9], [296, 34, 8], [284, 80, 11], [276, 150, 12]]) d += `<circle cx="${x}" cy="${y}" r="${r}" class="vh-plek"/>`;
    d += tekst(26, 176, 'hiel', { maat: 10, klasse: 'vet' }) + tekst(196, 178, 'tenen', { maat: 10, klasse: 'vet' });
    d += tekst(340, 40, 'tenen', { maat: 10, anker: 'start', klasse: 'vet' }) + '<path d="M306 36 H336" class="lijn dun"/>';
    d += tekst(330, 84, 'bal van', { maat: 10, anker: 'start', klasse: 'vet' }) + tekst(330, 96, 'de voet', { maat: 10, anker: 'start', klasse: 'vet' }) + '<path d="M296 82 H326" class="lijn dun"/>';
    d += tekst(330, 154, 'hiel', { maat: 10, anker: 'start', klasse: 'vet' }) + '<path d="M289 152 H326" class="lijn dun"/>';
    d += tekst(110, 22, 'van opzij', { maat: 9.5, klasse: 'stil' }) + tekst(276, 12, 'van onderen', { maat: 9.5, klasse: 'stil' });
    return svg(380, 190, 'Een voet van opzij en van onderen. Blaren komen waar je schoen schuurt: op de hiel, op en tussen de tenen en op de bal van de voet', d);
  },

  'brandwond-koelen': () => {
    let d = '<rect x="0" y="0" width="380" height="190" class="vlak2"/>';
    // tap and stream, falling just above the burn
    d += '<path d="M60 20 H150 V36 H134 V44 H118 V36 H60Z" class="vol"/>';
    d += '<path d="M126 44 Q124 80 128 108" class="vh-straal"/>';
    // the forearm, with the burn a little lower down the slope; the water runs over it
    d += '<path d="M40 112 Q140 104 330 132 L326 158 Q140 136 40 140Z" class="vh-huid"/>';
    d += '<ellipse cx="190" cy="128" rx="24" ry="8" class="vh-brand"/>';
    d += '<path d="M134 112 Q170 116 214 124 Q250 130 280 146" class="vh-straal dun"/>';
    d += tekst(250, 34, 'lauw, zacht stromend', { maat: 11, klasse: 'vet blauw-tekst' }) + tekst(250, 48, 'water, 10 tot 20 minuten', { maat: 11, klasse: 'vet blauw-tekst' });
    d += tekst(80, 84, 'straal erboven,', { maat: 10, klasse: 'vet' }) + tekst(80, 96, 'niet erop', { maat: 10, klasse: 'vet' });
    d += tekst(220, 104, 'brandwond', { maat: 10, klasse: 'stil' });
    return svg(380, 190, 'Een brandwond koelen: laat lauw, zacht stromend kraanwater net boven de wond op de huid vallen, zodat het over de wond loopt. 10 tot 20 minuten', d);
  },

  'onderkoeling-signalen': () => signalen('onderkoeling', [
    ['koud en nat', ['je rilt, je huid', 'is koud en bleek'], 'blauw'],
    ['erger', ['moe en traag,', 'onhandig'], 'blauw'],
    ['ernstig', ['het rillen stopt,', 'je wordt suf: 112'], 'rood'],
  ], 'Onderkoeling herkennen: eerst ril je en is je huid koud en bleek; dan word je moe en traag; stopt het rillen en word je suf, bel dan 112'),

  'oververhitting-signalen': () => signalen('oververhitting', [
    ['te warm', ['hoofdpijn, duizelig,', 'misselijk'], 'oranje'],
    ['niet beter', ['na 20 min. koelen:', 'spoed: huisarts'], 'oranje'],
    ['hitteberoerte', ['suf, verward, wankel:', 'bel 112'], 'rood'],
  ], 'Oververhitting herkennen: hoofdpijn, duizelig en misselijk. Niet beter na 20 minuten koelen: spoedcontact met de huisarts. Suf, verward of wankel: een hitteberoerte, bel 112'),

  'bevriezing-plekken': () => {
    let d = '<rect x="0" y="0" width="380" height="210" class="vlak2"/>';
    const cx = 150;
    d += `<g class="vh-lijf"><circle cx="${cx}" cy="38" r="20"/><circle cx="${cx - 21}" cy="40" r="6"/><circle cx="${cx + 21}" cy="40" r="6"/>`
      + `<path d="M${cx - 26} 62 H${cx + 26} L${cx + 46} 128 L${cx + 36} 132 L${cx + 22} 92 L${cx + 20} 196 H${cx + 2} L${cx} 136 L${cx - 2} 196 H${cx - 20} L${cx - 22} 92 L${cx - 36} 132 L${cx - 46} 128 Z"/></g>`;
    d += `<path d="M${cx - 4} 38 l4 8 h-5" class="lijn dun"/>`;
    for (const [x, y, r] of [[cx - 21, 40, 9], [cx + 21, 40, 9], [cx, 44, 7], [cx - 42, 134, 10], [cx + 42, 134, 10], [cx - 11, 198, 10], [cx + 11, 198, 10]]) d += `<circle cx="${x}" cy="${y}" r="${r}" class="vh-plek-koud"/>`;
    d += `<path d="M${cx + 30} 40 H250 M${cx + 8} 46 L250 64 M${cx + 52} 134 H250 M${cx + 22} 198 H250" class="lijn dun"/>`;
    d += tekst(256, 44, 'oren', { maat: 11, anker: 'start', klasse: 'vet' }) + tekst(256, 68, 'neus', { maat: 11, anker: 'start', klasse: 'vet' });
    d += tekst(256, 138, 'vingers', { maat: 11, anker: 'start', klasse: 'vet' }) + tekst(256, 202, 'tenen', { maat: 11, anker: 'start', klasse: 'vet' });
    return svg(380, 210, 'Waar je huid bij strenge kou het eerst bevriest: oren, neus, vingers en tenen', d);
  },

  'tekenbeet-ring': () => {
    let d = '<rect x="0" y="0" width="380" height="180" class="vlak2"/>';
    const huid = (x) => `<rect x="${x}" y="12" width="168" height="140" rx="14" class="vh-huid"/>`;
    d += huid(6) + huid(206);
    d += '<circle cx="90" cy="82" r="3" class="vh-beet"/><circle cx="90" cy="82" r="14" class="vh-ring"/>';
    d += '<circle cx="290" cy="82" r="3" class="vh-beet"/><circle cx="290" cy="82" r="54" class="vh-ring"/><circle cx="290" cy="82" r="38" class="vh-ring-licht"/>';
    d += '<path d="M182 82 h18 m-6 -5 l6 5 l-6 5" class="lijn stil"/>';
    d += tekst(90, 170, 'dagen tot 3 maanden na de beet', { maat: 9.5, klasse: 'stil' }) + tekst(290, 170, 'de ring wordt groter', { maat: 9.5, klasse: 'vet' });
    return svg(380, 180, 'Na een tekenbeet kan er een rode, gelige of blauwrode vlek of ring om de plek komen, die groter wordt. Ga dan naar de huisarts', d);
  },

  vuurvijfhoek: () => {
    // five corners; the three of the vuurdriehoek (top and the two upper ones) joined by a dashed triangle
    const [cx, cy, r] = [190, 128, 82];
    const hoek = [0, 72, 144, 216, 288].map((g) => pol(cx, cy, r, g));
    let d = `<path d="M${hoek.map(([x, y]) => `${x} ${y}`).join(' L')} Z" class="vh-vijfhoek"/>`;
    d += `<path d="M${hoek[0][0]} ${hoek[0][1]} L${hoek[1][0]} ${hoek[1][1]} L${hoek[4][0]} ${hoek[4][1]} Z" class="vh-driehoek"/>`;
    d += tekst(cx, 91, 'vuurdriehoek', { maat: 9.5, klasse: 'vet accent-tekst' });
    d += hoek.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="5" class="${i === 2 || i === 3 ? 'vol' : 'accent'}"/>`).join('');
    // a flame in the middle
    d += `<g transform="translate(${cx} 172)"><path d="M-24 0 Q-30 -26 -12 -40 Q-14 -24 -4 -22 Q-8 -46 10 -58 Q8 -36 20 -30 Q30 -18 24 0 Z" fill="#f08a1c"/>`
      + '<path d="M-12 0 Q-14 -14 -4 -22 Q-2 -12 4 -12 Q4 -26 12 -32 Q18 -14 12 0 Z" fill="#ffd34d"/></g>';
    const labels = [
      [cx, 20, 'middle', 'Brandstof', 'iets dat kan branden'],
      [282, 98, 'start', 'Zuurstof', 'meestal uit de lucht'],
      [248, 212, 'start', 'Mengverhouding', 'goed gemengd'],
      [132, 212, 'end', 'Kettingreactie', 'houdt het vuur gaande'],
      [98, 98, 'end', 'Warmte', 'heet genoeg'],
    ];
    d += labels.map(([x, y, anker, kop, sub]) => tekst(x, y, kop, { maat: 12, anker, klasse: 'vet' }) + tekst(x, y + 13, sub, { maat: 9.5, anker, klasse: 'stil' })).join('');
    return svg(380, 236, 'De vuurvijfhoek: brandstof, zuurstof en warmte, de drie van de vuurdriehoek, en daarbij de mengverhouding en de kettingreactie. Pas als alle vijf er zijn, brandt het', d);
  },

  'stoffen-branden': () => {
    // three strips of cloth held in a flame with tongs: cotton flares up, wool hardly catches, synthetics melt and drip
    const stuk = (x, klasse, kop, sub) => {
      let g = `<rect x="${x}" y="0" width="120" height="190" rx="8" class="vlak2"/>`;
      g += `<path d="M${x + 60} 8 V30 M${x + 54} 8 L${x + 58} 30 M${x + 66} 8 L${x + 62} 30" class="lijn"/>`;
      g += `<rect x="${x + 38}" y="30" width="44" height="66" rx="2" class="${klasse}"/>`;
      g += tekst(x + 60, 162, kop, { maat: 11.5, klasse: 'vet' }) + tekst(x + 60, 177, sub, { maat: 9.5, klasse: 'stil' });
      return g;
    };
    let d = stuk(6, 'vh-katoen', 'katoen', 'vat snel vlam') + stuk(130, 'vh-wol', 'wol', 'vat moeilijk vlam') + stuk(254, 'vh-kunststof', 'polyester, nylon', 'smelt en druppelt');
    // cotton: a big flame over the lower half
    d += '<path d="M38 100 Q30 70 46 58 Q46 74 54 72 Q50 50 64 40 Q66 60 74 60 Q90 70 84 100 Z" fill="#f08a1c"/><path d="M50 100 Q48 84 58 76 Q60 86 66 84 Q70 74 74 70 Q80 86 74 100Z" fill="#ffd34d"/>';
    // wool: only a little glow and a wisp of smoke
    d += '<path d="M182 98 Q186 88 190 96 Q194 86 198 98 Z" fill="#f08a1c"/><path d="M192 84 q-6 -10 2 -18 q8 -8 0 -18" class="lijn dun stil"/>';
    // synthetics: the bottom melts away, a small flame, and hot drops falling
    d += '<path d="M292 96 Q300 104 306 96 Q312 108 318 96 Q324 102 336 96 V100 Q314 112 292 100 Z" class="vh-kunststof"/>';
    d += '<path d="M296 98 Q300 84 308 90 Q312 78 320 92 Q326 86 332 98 Z" fill="#f08a1c"/>';
    d += '<path d="M306 116 q-3 6 0 8 q3 -2 0 -8Z M318 128 q-3 6 0 8 q3 -2 0 -8Z M310 140 q-3 6 0 8 q3 -2 0 -8Z" class="vh-druppel"/>';
    return svg(380, 190, 'Een strookje stof in een vlam. Katoen vat snel vlam. Wol vat moeilijk vlam en smeult hooguit even. Polyester en nylon vatten moeilijker vlam, maar smelten en druppelen: die hete druppels geven brandwonden', d);
  },
  // ---- EHBO, round 2 (VIA08 hfst. 5, following NREH 2026) ----

  'bloeding-drukken': () => {
    let d = '<rect x="0" y="0" width="380" height="200" class="vlak2"/>';
    d += '<rect x="30" y="150" width="270" height="10" rx="4" class="vh-mat"/>';
    // the helper, kneeling on the far side, arms straight down onto the wound
    d += mens([206, 60], [[[268, 148], [238, 148], [228, 112], [212, 76]], [[214, 82], [206, 104], [202, 126]], [[210, 82], [198, 106], [194, 126]]], { dikte: 6, r: 10 });
    // the one who bleeds, on their back, a blanket over the chest
    d += mens([58, 136], [[[74, 140], [168, 141]], [[168, 141], [216, 142], [266, 142]], [[168, 140], [214, 136], [262, 137]], [[88, 138], [118, 146], [146, 146]]], { kleur: GEWONDE, dikte: 8, r: 10 });
    d += '<path d="M70 150 Q72 126 96 126 L150 126 Q164 128 164 150 Z" class="vh-deken"/>';
    // the cloth on the wound, a little blood, the hands on top
    d += '<path d="M182 130 Q178 140 186 146 M214 132 Q222 140 214 147" class="vh-bloed"/>';
    d += '<rect x="182" y="126" width="34" height="14" rx="3" class="vh-doek"/>';
    d += `<circle cx="194" cy="128" r="6" fill="${HUID}"/><circle cx="203" cy="128" r="6" fill="${HUID}"/>`;
    d += '<path d="M244 64 l-26 50" class="lijn accent-lijn" stroke-width="2"/><path d="M220 104 l-2 10 l8 -6" class="lijn accent-lijn" stroke-width="2"/>';
    d += tekst(250, 34, 'druk hard op de wond,', { maat: 11, anker: 'start', klasse: 'vet accent-tekst' })
      + tekst(250, 48, 'met een doek ertussen', { maat: 11, anker: 'start', klasse: 'vet accent-tekst' })
      + tekst(250, 62, 'minstens 3 minuten', { maat: 10, anker: 'start' });
    d += tekst(70, 32, 'bel 112', { maat: 13, klasse: 'vet rood-tekst' });
    d += tekst(110, 180, 'laten liggen en warm houden', { maat: 10.5, klasse: 'vet' });
    return svg(380, 200, 'Een hevige bloeding aan het been: de gewonde ligt op zijn rug met een deken over zich heen. Een helper knielt ernaast en drukt met twee handen en gestrekte armen hard op een doek op de wond, minstens 3 minuten. Bel 112', d);
  },

  'flauwte-voorkomen': () => drieTegels([
    ['handen haken', 'en uit elkaar trekken',
      `<path d="M-46 18 L-10 2 M46 18 L10 2" stroke="${HUID}" stroke-width="10" stroke-linecap="round"/>`
      + `<path d="M-12 2 Q-2 -14 6 -2 M12 2 Q2 18 -6 6" stroke="${HUID}" stroke-width="6" fill="none" stroke-linecap="round"/>`
      + '<path d="M-26 -18 h-20 m6 -5 l-6 5 l6 5 M26 -18 h20 m-6 -5 l6 5 l-6 5" class="lijn accent-lijn" stroke-width="2"/>'],
    ['benen kruisen', 'en knijpen',
      mens(null, [[[-8, -30], [10, 0], [10, 34]], [[8, -30], [-10, 0], [-10, 34]]], { dikte: 8 })
      + '<path d="M-34 0 h12 m-5 -5 l5 5 l-5 5 M34 0 h-12 m5 -5 l-5 5 l5 5" class="lijn accent-lijn" stroke-width="2"/>'],
    ['helpt dat niet?', 'ga liggen',
      '<rect x="-50" y="18" width="100" height="6" rx="3" class="vh-mat"/>'
      + mens([-40, 8], [[[-30, 10], [12, 10]], [[12, 10], [48, 10]], [[-22, 10], [0, 14]]], { kleur: GEWONDE, dikte: 7 })],
  ], 'Voel je dat je flauwvalt? Haak je handen in elkaar en trek ze uit elkaar, kruis je benen en knijp ze tegen elkaar. Helpt dat niet, ga dan liggen'),

  'shock-liggen': () => {
    let d = '<rect x="0" y="0" width="380" height="190" class="vlak2"/>';
    d += '<rect x="20" y="132" width="250" height="12" rx="5" class="vh-mat"/>';
    d += mens([44, 118], [[[60, 122], [150, 122]], [[150, 122], [200, 124], [250, 124]], [[150, 121], [198, 118], [248, 119]]], { kleur: GEWONDE, dikte: 9, r: 11 });
    d += '<path d="M56 132 Q58 100 86 100 L236 104 Q258 106 260 132 Z" class="vh-deken"/>';
    d += '<path d="M120 60 L130 98 M226 160 L210 140" class="lijn stil"/>';
    d += tekst(120, 52, 'iets eroverheen', { maat: 11, klasse: 'vet' }) + tekst(240, 174, 'iets eronder', { maat: 11, klasse: 'vet' });
    // a cup, crossed out
    d += '<g transform="translate(322 104)"><path d="M-14 -20 h28 l-4 34 h-20 z" class="vlak lijn"/><path d="M-24 -30 L24 22 M24 -30 L-24 22" class="lijn rood-lijn" stroke-width="4" stroke-linecap="round"/></g>';
    d += tekst(322, 146, 'niets eten', { maat: 10.5, klasse: 'vet rood-tekst' }) + tekst(322, 160, 'of drinken', { maat: 10.5, klasse: 'vet rood-tekst' });
    d += tekst(300, 30, 'bel 112', { maat: 13, klasse: 'vet rood-tekst' });
    return svg(380, 190, 'Iemand in shock ligt op zijn rug, met iets eronder en een deken eroverheen tegen de kou. Niets eten of drinken, en bel 112', d);
  },

  'oog-vuiltje': () => {
    let d = '<rect x="0" y="0" width="380" height="200" class="vlak2"/>';
    // a right eye seen from the front: the nose is on the left
    d += '<path d="M64 104 Q190 22 316 98 Q190 182 64 104 Z" class="vh-oogwit"/>';
    d += '<circle cx="196" cy="100" r="40" class="vh-iris"/><circle cx="196" cy="100" r="16" class="vh-pupil"/><circle cx="186" cy="90" r="5" fill="#ffffff" opacity="0.8"/>';
    d += '<ellipse cx="76" cy="104" rx="9" ry="6" class="vh-traanvlees"/>';
    d += '<path d="M64 104 Q190 22 316 98 Q190 182 64 104 Z" class="lijn"/>';
    // a speck on the white, swept to the inner corner; one on the coloured part, left alone
    d += '<circle cx="130" cy="114" r="3.5" class="vol"/><path d="M122 112 Q106 108 92 106" class="lijn accent-lijn" stroke-width="2" stroke-dasharray="4 3"/><path d="M98 101 l-7 5 l8 3" class="lijn accent-lijn" stroke-width="2"/>';
    d += '<circle cx="214" cy="82" r="3.5" class="vol"/><circle cx="214" cy="82" r="10" class="lijn rood-lijn" stroke-width="2"/>';
    d += tekst(20, 108, 'neus', { maat: 10, klasse: 'stil' });
    d += '<path d="M130 120 L118 160" class="lijn dun"/>' + tekst(118, 174, 'op het wit: veeg het', { maat: 10.5, klasse: 'vet accent-tekst' }) + tekst(118, 187, 'naar de hoek bij de neus', { maat: 10.5, klasse: 'vet accent-tekst' });
    d += '<path d="M222 76 L262 30" class="lijn dun"/>' + tekst(300, 18, 'op het gekleurde deel:', { maat: 10.5, klasse: 'vet rood-tekst' }) + tekst(300, 31, 'blijf eraf', { maat: 10.5, klasse: 'vet rood-tekst' });
    d += tekst(300, 178, 'niet wrijven', { maat: 11, klasse: 'vet' });
    return svg(380, 200, 'Een oog van voren. Zit een vuiltje op het wit, veeg het dan voorzichtig naar de ooghoek bij de neus. Zit het op het gekleurde deel, blijf er dan af. Niet wrijven', d);
  },

  'tand-kroon': () => {
    let d = '<rect x="0" y="0" width="380" height="190" class="vlak2"/>';
    // a front tooth, lying on its side: the crown on the left, the root to the right
    d += '<g transform="rotate(-12 150 100)">'
      + '<path d="M150 82 Q206 80 252 96 Q262 100 252 104 Q206 120 150 118 Z" class="vh-wortel"/>'
      + '<path d="M150 82 Q120 76 90 84 Q80 100 90 116 Q120 124 150 118 Z" class="vh-tand"/>'
      + '<path d="M150 82 Q144 100 150 118" class="lijn dun stil"/></g>';
    // two fingers holding the crown
    d += `<ellipse cx="114" cy="80" rx="16" ry="10" fill="${HUID}" stroke="#a8745a"/><ellipse cx="124" cy="132" rx="16" ry="10" fill="${HUID}" stroke="#a8745a"/>`;
    d += tekst(100, 30, 'pak hem bij de kroon', { maat: 11, klasse: 'vet accent-tekst' }) + '<path d="M100 36 L108 66" class="lijn dun"/>';
    d += tekst(222, 160, 'niet aan de wortel', { maat: 11, klasse: 'vet rood-tekst' }) + '<path d="M222 148 L218 106" class="lijn dun"/>';
    // a glass of milk
    d += '<g transform="translate(326 100)"><path d="M-22 -40 h44 l-5 72 h-34 z" class="vlak lijn"/><path d="M-20.5 -18 h41 l-3.5 50 h-34 z" class="vh-melk"/>'
      + '<path d="M-6 6 Q0 2 6 6 Q8 14 4 18 Q0 16 -4 18 Q-8 14 -6 6Z" class="vh-tand"/></g>';
    d += tekst(326, 152, 'niet terug te zetten?', { maat: 9.5 }) + tekst(326, 165, 'bewaar hem in melk', { maat: 10.5, klasse: 'vet' }) + tekst(326, 178, 'nooit droog', { maat: 9.5 });
    return svg(380, 190, 'Een tand die eruit is: pak hem bij de kroon, het deel waarmee je bijt, en niet bij de wortel. Kun je hem niet terugzetten, bewaar hem dan in melk, nooit droog', d);
  },

  'stroom-uit': () => drieTegels([
    ['stekker eruit', 'als dat kan',
      '<rect x="-46" y="-30" width="40" height="40" rx="8" class="vlak lijn"/><circle cx="-26" cy="-10" r="12" class="lijn"/><circle cx="-31" cy="-10" r="2.5" class="vol"/><circle cx="-21" cy="-10" r="2.5" class="vol"/>'
      + '<path d="M8 -16 h16 v12 h-16 z M4 -12 h-6 M4 -8 h-6" class="lijn" stroke-width="2"/><path d="M24 -10 Q40 -10 40 14 Q40 30 22 30" class="lijn"/>'
      + '<path d="M-2 20 h-18 m5 -5 l-5 5 l5 5" class="lijn accent-lijn" stroke-width="2" transform="scale(-1 1)"/>'],
    ['stroom uit', 'in de meterkast',
      '<rect x="-40" y="-32" width="80" height="62" rx="4" class="vlak lijn"/>'
      + [-24, -8, 8, 24].map((x, i) => `<rect x="${x - 5}" y="-16" width="10" height="26" rx="2" class="lijn"/><rect x="${x - 3}" y="${i === 1 ? -2 : -14}" width="6" height="10" rx="1" class="${i === 1 ? 'accent' : 'vol'}"/>`).join('')
      + '<path d="M-8 18 v10" class="lijn accent-lijn" stroke-width="2"/>'],
    ['hoogspanning:', 'blijf weg, bel 112',
      '<path d="M0 -36 L38 28 H-38 Z" fill="#f5b300" stroke="#1b1b1b" stroke-width="3" stroke-linejoin="round"/><path d="M4 -16 L-8 6 H2 L-4 22 L10 -2 H0 Z" fill="#1b1b1b"/>'],
  ], 'Een ongeluk met stroom: trek de stekker eruit, of zet de stroom uit in de meterkast. Bij hoogspanning blijf je weg en bel je 112'),

  'verkeersongeluk-stappen': () => drieTegels([
    ['hesje aan', 'en van de rijbaan af',
      '<path d="M-14 -34 L-24 -30 L-30 28 H30 L24 -30 L14 -34 Q0 -18 -14 -34 Z" fill="#e6f000" stroke="#7a7f00" stroke-width="1.4"/>'
      + '<path d="M-28 4 H28 M-29 16 H29" stroke="#c9ccd2" stroke-width="5"/>'],
    ['waarschuw', 'ander verkeer',
      '<path d="M0 -36 L36 24 H-36 Z" fill="none" stroke="#d7262b" stroke-width="7" stroke-linejoin="round"/><path d="M0 -14 L16 14 H-16 Z" class="vol-licht"/><path d="M-30 30 h60" class="lijn dik"/>'],
    ['motor uit', 'sleutel 5 meter weg',
      '<rect x="-46" y="-26" width="22" height="34" rx="9" class="vol"/><circle cx="-35" cy="-14" r="4" class="vlak"/><path d="M-35 8 v14 h5 m-5 -6 h4" class="lijn dik"/>'
      + '<path d="M-14 0 H40 M-8 -6 l-6 6 l6 6 M34 -6 l6 6 l-6 6" class="lijn accent-lijn" stroke-width="2"/>' + tekst(13, -8, '5 m', { maat: 13, klasse: 'vet accent-tekst' })],
  ], 'Bij een verkeersongeluk: trek een hesje aan en ga van de rijbaan af. Waarschuw ander verkeer, met een gevarendriehoek. Zet de motor uit en leg de sleutel minstens 5 meter van de auto'),

  'vergiftiging-wegen': () => drieTegels([
    ['ingeslikt', 'mond spoelen, uitspugen',
      '<path d="M-36 -26 h26 l-4 50 h-18 z" class="vlak lijn"/><path d="M-34.5 -10 h23 l-3 32 h-17 z" class="water"/>'
      + '<path d="M4 -10 Q22 -10 28 6" class="lijn accent-lijn" stroke-width="2"/><path d="M22 4 l6 4 l2 -8" class="lijn accent-lijn" stroke-width="2"/>'
      + '<path d="M30 18 q-4 7 0 9 q4 -2 0 -9Z M38 26 q-4 7 0 9 q4 -2 0 -9Z" class="blauw"/>'],
    ['ingeademd', 'naar de frisse lucht',
      '<path d="M-48 -8 q8 -10 16 0 t16 0 M-48 4 q8 -10 16 0 t16 0 M-48 16 q8 -10 16 0 t16 0" class="lijn stil" stroke-width="2.4"/>'
      + '<path d="M-10 4 H14 M8 -2 l6 6 l-6 6" class="lijn accent-lijn" stroke-width="2"/>'
      + '<path d="M36 34 V8" stroke="#8a5a2b" stroke-width="5"/><circle cx="36" cy="-6" r="18" class="vh-boom"/>'],
    ['op de huid', '45 minuten spoelen',
      '<path d="M-40 -34 H6 V-22 H-6 V-16 H-18 V-22 H-40Z" class="vol"/><path d="M-12 -16 Q-13 0 -10 14" class="vh-straal"/>'
      + `<path d="M-44 20 Q0 10 48 22 L46 36 Q0 26 -44 34Z" fill="${HUID}"/>`],
  ], 'Vergiftiging. Ingeslikt: laat de mond spoelen en uitspugen. Ingeademd: naar de frisse lucht. Op de huid: spoel 45 minuten met lauw water'),

  // Bandages: each kind finished, as a tile, and the snelverband step by step.
  'verband-snel': () => svg(160, 120, 'Een snelverband om een onderarm, met de knoop naast het kompres',
    onderarm(6, 154, 40) + '<rect x="50" y="34" width="56" height="48" rx="3" class="vh-kompres"/>' + slagen(46, 7, 8.5, 37, 44) + knoopje(124, 38)),
  'verband-wonddruk': () => {
    // the turns go over the pad on the wound, so they bulge up in the middle
    let d = onderarm(6, 154, 44);
    for (let k = 0; k < 10; k++) {
      const x = 40 + k * 7; const t = Math.max(0, 1 - ((x + 6 - 80) / 30) ** 2);
      const y = r1(42 - 12 * Math.sqrt(t));
      d += `<path d="M${x} ${y} L${x + 9} ${y - 1} L${x + 13} 84 L${x + 4} 85 Z" class="vh-elastisch"/>`;
    }
    d += '<path d="M80 2 v18 M74 14 l6 6 l6 -6" class="lijn accent-lijn" stroke-width="2"/>';
    return svg(160, 120, 'Een wonddrukverband: een stevig pakje op het kompres op de wond, en daar strak een zwachtel omheen', d);
  },
  'verband-steun': () => {
    let d = `<path d="M54 0 H82 L86 62 Q92 76 120 84 L148 92 Q156 100 146 106 L66 108 Q50 104 54 86 Z" class="vh-huid"/>`;
    // turns round the ankle, and the figure of eight over the instep and under the foot
    d += '<path d="M52 30 L84 28 L85 38 L53 41 Z M53 41 L85 38 L86 48 L54 52 Z M54 52 L86 48 L87 58 L55 62 Z" class="vh-elastisch"/>';
    d += '<path d="M86 58 L118 104 L106 106 L76 62 Z M56 64 L112 84 L106 94 L54 76 Z" class="vh-elastisch"/>';
    d += '<path d="M104 80 L122 84 L118 104 L100 104 Z" class="vh-elastisch"/>';
    return svg(160, 120, 'Een steunverband om een verstuikte enkel: een elastische zwachtel om de enkel en in een acht over de voet', d);
  },
  'verband-vinger': () => {
    let d = `<path d="M40 118 V70 Q40 58 52 58 H108 Q120 58 120 70 V118 Z" fill="${HUID}"/>`;
    for (const [x, top] of [[66, 22], [86, 18], [106, 26]]) d += `<rect x="${x - 7}" y="${top}" width="14" height="${70 - top}" rx="7" fill="${HUID}"/>`;
    d += `<path d="M40 86 Q24 74 22 58 Q26 52 32 58 Q40 70 46 74" fill="${HUID}"/>`;
    // the index finger, bandaged: a cap over the top and turns round it
    d += '<rect x="38" y="12" width="18" height="52" rx="9" class="vh-zwachtel"/>';
    d += '<path d="M39 30 L55 24 M39 40 L55 34 M39 50 L55 44 M39 60 L55 54" class="lijn dun stil"/>';
    return svg(160, 120, 'Een vingerverband: een zwachtel over de top van de vinger en daarna in slagen om de vinger', d);
  },
  mitella: () => {
    let d = mens([80, 16], [[[80, 28], [80, 36]]], { kleur: GEWONDE, dikte: 8, r: 12 });
    d += '<path d="M48 40 Q80 32 112 40 L114 118 H46 Z" class="vh-shirt"/>';
    // the hurt arm: upper arm down, forearm across the chest, a little up
    d += mens(null, [[[50, 42], [46, 84], [100, 70]]], { kleur: GEWONDE, dikte: 12 });
    d += `<circle cx="104" cy="68" r="6" fill="${HUID}"/>`;
    // the triangular cloth under the forearm, up round the neck, knotted on the good shoulder
    d += '<path d="M38 70 L40 96 L112 78 L108 60 Z" class="vh-doek"/><path d="M38 70 Q44 44 60 36 Q80 26 100 34 L108 60" class="vh-mitella-slip"/>';
    d += knoopje(104, 40);
    return svg(160, 120, 'Een mitella: een driekante doek als draagdoek onder de onderarm, om de nek en geknoopt op de goede schouder', d);
  },
  'snelverband-stappen': () => stappen([
    ['<rect x="22" y="40" width="48" height="44" rx="3" class="vh-kompres"/>' + rol(34, 50) + rol(58, 50)
      + '<path d="M38 66 l16 12 M54 66 l-16 12" class="lijn rood-lijn" stroke-width="2.4"/>', 'pak de rolletjes,', 'niet het kompres'],
    [`<circle cx="12" cy="40" r="7" fill="${HUID}"/><circle cx="80" cy="40" r="7" fill="${HUID}"/>` + rol(19, 42, 5) + rol(73, 42, 5)
      + '<path d="M22 44 L34 64 M70 44 L58 64" class="vh-slip"/><rect x="30" y="62" width="32" height="30" rx="2" class="vh-kompres"/>'
      + '<path d="M30 28 h-14 m4 -4 l-4 4 l4 4 M62 28 h14 m-4 -4 l4 4 l-4 4" class="lijn accent-lijn" stroke-width="2"/>', 'uit elkaar trekken:', 'hij klapt open'],
    [onderarm(0, 92, 52) + '<rect x="36" y="48" width="26" height="40" rx="2" class="vh-kompres"/>' + slagen(28, 1, 0, 48, 40)
      + '<path d="M41 88 Q36 104 20 108" class="vh-slip"/>' + rol(16, 108, 5), 'op de wond, dan', 'om en om wikkelen'],
    [onderarm(0, 92, 52) + '<rect x="34" y="48" width="28" height="40" rx="2" class="vh-kompres"/>' + slagen(26, 5, 8, 49, 38) + knoopje(76, 52), 'knoop naast', 'de wond, niet erop'],
  ], 152, 'Een snelverband aanleggen. 1: pak de twee rolletjes, raak het kompres niet aan. 2: trek ze uit elkaar, dan klapt het kompres open. 3: leg het meteen op de wond en wikkel de einden er om en om overheen. 4: knoop ze vast naast de wond, niet erop'),

  // Moving someone out of danger, in the order of NREH 2026.
  'verplaats-ondersteunen': () => svg(160, 120, 'Iemand ondersteunen die nog kan hinkelen: hij slaat een arm om je schouders, jij een arm om zijn middel',
    mens([100, 18], [[[100, 28], [100, 70]], [[100, 70], [92, 112]], [[100, 70], [108, 112]], [[100, 36], [112, 46], [106, 34]]])
    + mens([60, 20], [[[62, 30], [64, 72]], [[64, 72], [60, 112]], [[64, 72], [54, 92], [66, 100]]], { kleur: GEWONDE })
    + mens(null, [[[100, 38], [80, 56], [66, 60]]])
    + mens(null, [[[62, 36], [86, 28], [104, 32]]], { kleur: GEWONDE })),
  'verplaats-rautek': () => svg(160, 120, 'De Rautekgreep: de helper staat achter de gewonde, de armen onder zijn oksels door, en sleept hem achteruit lopend weg',
    mens([62, 20], [[[56, 62], [60, 32]], [[56, 62], [46, 84], [52, 112]], [[56, 62], [70, 84], [64, 112]]])
    + mens([70, 50], [[[74, 62], [100, 102]], [[100, 102], [152, 106]], [[100, 102], [150, 112]], [[76, 66], [90, 78], [80, 84]]], { kleur: GEWONDE })
    + mens(null, [[[60, 38], [74, 66], [86, 80]]])
    + '<path d="M40 116 H8 M14 110 l-6 6 l6 6" class="lijn accent-lijn" stroke-width="2"/>'),
  'verplaats-slepen': () => svg(160, 120, 'Slepen: lukt niets anders, trek de gewonde dan aan zijn kleren weg uit het gevaar',
    mens([58, 96], [[[68, 100], [112, 102]], [[112, 102], [154, 104]], [[112, 102], [152, 108]]], { kleur: GEWONDE })
    + mens([46, 36], [[[28, 70], [40, 44]], [[28, 70], [20, 110]], [[28, 70], [38, 110]], [[40, 48], [60, 74], [72, 98]]])
    + '<path d="M40 14 H8 M14 8 l-6 6 l6 6" class="lijn accent-lijn" stroke-width="2"/>'),
  'rautekgreep-stappen': () => stappen([
    [mens([42, 104], [[[54, 106], [92, 106]], [[92, 106], [120, 108]], [[92, 106], [118, 112]]], { kleur: GEWONDE })
      + mens([24, 42], [[[16, 84], [22, 54]], [[16, 84], [26, 112], [6, 112]], [[22, 60], [38, 84], [48, 98]]]), 'kniel achter', 'het hoofd'],
    [mens([30, 30], [[[24, 76], [28, 42]], [[24, 76], [16, 112], [4, 112]], [[24, 76], [48, 76], [50, 112]]])
      + mens([56, 58], [[[58, 70], [76, 110]], [[76, 110], [120, 112]], [[76, 110], [118, 116]], [[60, 76], [72, 88], [62, 94]]], { kleur: GEWONDE })
      + mens(null, [[[28, 48], [56, 76], [66, 90]]]), 'zet hem rechtop,', 'pak één onderarm'],
    [mens([58, 20], [[[52, 62], [56, 32]], [[52, 62], [42, 84], [48, 112]], [[52, 62], [66, 84], [60, 112]]])
      + mens([66, 50], [[[70, 62], [96, 102]], [[96, 102], [122, 106]], [[96, 102], [120, 112]], [[72, 66], [86, 78], [76, 84]]], { kleur: GEWONDE })
      + mens(null, [[[56, 38], [70, 66], [82, 80]]])
      + '<path d="M36 118 H8 M14 112 l-6 6 l6 6" class="lijn accent-lijn" stroke-width="2"/>', 'kom overeind en', 'loop achteruit'],
  ], 160, 'De Rautekgreep. 1: kniel achter het hoofd van de gewonde. 2: zet hem rechtop tegen je aan, steek je armen onder zijn oksels door en pak één van zijn onderarmen voor zijn borst. 3: kom overeind en sleep hem achteruit lopend uit het gevaar'),

  zijligging: () => {
    // seen from above: lying on the side, the front of the body towards the bottom of the drawing
    let d = '<rect x="0" y="0" width="380" height="200" class="vlak2"/>';
    const o = { kleur: GEWONDE, dikte: 11 };
    d += mens(null, [[[100, 100], [100, 154], [62, 156]]], o); // the bottom arm, on the ground, bent
    d += mens(null, [[[200, 92], [322, 94]]], o); // the bottom leg, straight
    d += mens(null, [[[90, 92], [204, 92]]], { kleur: GEWONDE, dikte: 18 }); // the body
    d += mens(null, [[[204, 98], [228, 144], [296, 146]]], o); // the top leg, bent at hip and knee
    d += mens(null, [[[108, 96], [138, 128], [82, 116]]], o); // the top arm, the hand under the cheek
    d += `<circle cx="66" cy="96" r="18" fill="${HUID}"/><circle cx="80" cy="116" r="6" fill="${HUID}"/><circle cx="58" cy="156" r="6" fill="${HUID}"/>`;
    d += '<path d="M52 108 q8 6 16 4" class="lijn dun"/>';
    d += tekst(66, 34, 'hoofd licht achterover,', { maat: 10.5, klasse: 'vet' }) + tekst(66, 47, 'mond naar beneden', { maat: 10.5, klasse: 'vet' }) + '<path d="M66 54 V74" class="lijn dun"/>';
    d += tekst(196, 190, 'hand onder de wang', { maat: 10.5, klasse: 'vet' }) + '<path d="M160 180 L86 122" class="lijn dun"/>';
    d += tekst(300, 172, 'bovenste been gebogen:', { maat: 10.5, klasse: 'vet' }) + tekst(300, 185, 'zo rolt hij niet door', { maat: 10.5 }) + '<path d="M270 162 L256 150" class="lijn dun"/>';
    d += tekst(270, 60, 'onderste been gestrekt', { maat: 10.5, klasse: 'vet' }) + '<path d="M270 66 L282 86" class="lijn dun"/>';
    d += tekst(372, 18, 'van bovenaf', { maat: 9.5, anker: 'end', klasse: 'stil' });
    return svg(380, 200, 'De zijligging van bovenaf: op de zij, het hoofd licht achterover met de mond naar beneden, de bovenste hand onder de wang, de onderste arm gebogen op de grond, het onderste been gestrekt en het bovenste gebogen, zodat hij niet doorrolt', d);
  },
};
