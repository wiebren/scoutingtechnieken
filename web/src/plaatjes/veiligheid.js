// Drawings for veiligheid. See ../plaatjes.js and ./basis.js. Flags, lights and fire keep their real colours in
// both themes; the rest uses the .plaatje classes in style.css and the vh- classes in ./veiligheid.css.
import { pol, svg, tekst } from './basis.js';

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
    d += tekst(90, 170, 'dagen tot weken na de beet', { maat: 9.5, klasse: 'stil' }) + tekst(290, 170, 'de ring wordt groter', { maat: 9.5, klasse: 'vet' });
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
};

