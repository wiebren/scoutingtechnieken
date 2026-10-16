// Drawings for seinen. See ../plaatjes.js and ./basis.js. The figure that signals, the flags and the morseboom are
// shared with the pieces and live in ../doe/seinen/lib/ (pure strings, small).
import { pol, r1, svg, tekst } from './basis.js';
import { MORSE } from '../doe/codes.js';
import { BOOM_BREED, BOOM_HOOG, boom } from '../doe/seinen/lib/boom.js';
import { BREED, HOOG, SEMAFOOR, SEMAFOOR_TEKEN, VREEDE, VREEDE_HOEK, armen, pop, vreedeNaam } from '../doe/seinen/lib/seinpop.js';
import { CIJFERWIMPELS, LETTERVLAG, LETTERVLAGGEN, OVERIGE_WIMPELS, breedte, vlag } from '../doe/seinen/lib/vlaggen.js';

/** A morse code drawn: dots as round dots, dashes as bars three times as long, from (x, y) on the middle line. */
export function morseTekens(code, x, y, eenheid = 4) {
  let uit = '';
  let at = x;
  for (const s of code) {
    if (s === '.') { uit += `<circle cx="${at + eenheid / 2 + 0.5}" cy="${y}" r="${eenheid / 2 + 0.6}" class="mo-teken"/>`; at += eenheid + 1; }
    else { uit += `<rect x="${at}" y="${y - eenheid / 2}" width="${eenheid * 3}" height="${eenheid}" rx="${eenheid / 2}" class="mo-teken"/>`; at += eenheid * 3; }
    at += eenheid;
  }
  return uit;
}

/** The morse table: A-Z and 0-9 in three columns. */
function morseTabel() {
  const tekens = Object.keys(MORSE).filter((t) => /[A-Z]/.test(t)).concat(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']);
  // the longest code (0, five strepen) is 95 wide: a column of 126 holds it after its letter
  const [kol, rij] = [126, 29];
  let uit = '';
  tekens.forEach((t, i) => {
    const k = Math.floor(i / 12);
    const r = i % 12;
    const x = k * kol;
    const y = r * rij;
    if (r % 2 === 0) uit += `<rect x="${x + 2}" y="${y + 2}" width="${kol - 4}" height="${rij}" rx="4" class="vlak2"/>`;
    uit += tekst(x + 16, y + rij / 2 + 7, t, { maat: 16, klasse: 'vet' }) + morseTekens(MORSE[t], x + 30, y + rij / 2 + 2, 5);
  });
  return svg(3 * kol, 12 * rij + 6, 'De morsetabel: alle letters en cijfers in punten en strepen', uit);
}

/** Timing: "AN E" on a strip of units: a dot 1, a dash 3, within a letter 1, between letters 3, between words 7. */
function morseTijd() {
  const delen = [['.', 'A'], [' ', '1'], ['-', 'A'], ['  ', '3'], ['-', 'N'], [' ', '1'], ['.', 'N'], ['   ', '7'], ['.', 'E']];
  const lengte = { '.': 1, '-': 3, ' ': 1, '  ': 3, '   ': 7 };
  const e = 16;
  const x0 = 12;
  let x = x0;
  let uit = '';
  for (let i = 0; i <= 21; i++) uit += `<line x1="${x0 + i * e}" y1="54" x2="${x0 + i * e}" y2="${i % 5 ? 59 : 62}" class="lijn haar"/>`;
  uit += `<line x1="${x0}" y1="54" x2="${x0 + 21 * e}" y2="54" class="lijn haar"/>`;
  for (const [s, wat] of delen) {
    const w = lengte[s] * e;
    if (s === '.' || s === '-') {
      uit += `<rect x="${x + 1}" y="30" width="${w - 2}" height="18" rx="4" class="mo-aan"/>`;
      uit += tekst(x + w / 2, 43, s === '.' ? '1' : '3', { maat: 11, klasse: 'mo-optekst vet' });
    } else {
      uit += tekst(x + w / 2, 84, wat, { maat: 12, klasse: 'vet' });
      uit += `<path d="M${x + 2} 66 L${x + 2} 70 L${x + w - 2} 70 L${x + w - 2} 66" class="lijn stil"/>`;
    }
    x += w;
  }
  uit += tekst(x0 + 2.5 * e, 20, 'A', { maat: 14, klasse: 'vet' }) + tekst(x0 + 7.5 * e, 20, 'N', { maat: 14, klasse: 'vet' }) + tekst(x0 + 20.5 * e, 20, 'E', { maat: 14, klasse: 'vet' });
  uit += tekst(x0, 106, 'Punt 1 · streep 3', { maat: 11, anker: 'start', klasse: 'stil' })
    + tekst(x0, 121, 'Stilte: in een letter 1 · tussen letters 3 · tussen woorden 7', { maat: 11, anker: 'start', klasse: 'stil' });
  return svg(360, 128, 'Hoe lang alles duurt in morse, gemeten in punten, met als voorbeeld de woorden AN en E', uit);
}

/** A grid of figures: lijst = [[label, links, rechts]]. */
function popRooster(lijst, { kolommen, schaal, soort = 'semafoor', titel }) {
  const [w, h] = [BREED * schaal, HOOG * schaal + 18];
  let uit = '';
  lijst.forEach(([label, links, rechts], i) => {
    const x = (i % kolommen) * w;
    const y = Math.floor(i / kolommen) * h;
    uit += pop({ links, rechts, x, y, schaal, soort }) + tekst(x + w / 2, y + h - 4, label, { maat: label.length > 7 ? 10.5 : 13, klasse: 'vet' });
  });
  return svg(kolommen * w, Math.ceil(lijst.length / kolommen) * h, titel, uit);
}

const semafoorLijst = () => [
  ...Object.entries(SEMAFOOR).map(([l, v]) => { const a = armen(v); return [l, a.links, a.rechts]; }),
  ...['rust', 'cijfers', 'annuleren'].map((t) => { const a = armen(SEMAFOOR_TEKEN[t].vlaggen); return [SEMAFOOR_TEKEN[t].naam.replace('Rust en spatie', 'Rust'), a.links, a.rechts]; }),
];

function semafoorCijfers() {
  const zet = (v) => { const a = armen(v); return [a.links, a.rechts]; };
  return popRooster([
    ['Cijferteken', ...zet(SEMAFOOR_TEKEN.cijfers.vlaggen)], ['A = 1', ...zet(SEMAFOOR.A)], ['E = 5', ...zet(SEMAFOOR.E)], ['K = 0', ...zet(SEMAFOOR.K)], ['J: letters', ...zet(SEMAFOOR.J)],
  ], { kolommen: 5, schaal: 0.6, titel: 'Cijfers in semafoor: eerst het cijferteken, dan A tot en met I voor 1 tot 9 en K voor 0; J betekent: nu weer letters' });
}

/** Vreede: 5 x 5, the marked right arm (on your left) down the side, the left arm along the top. */
function vreedeTabel() {
  const s = 0.5;
  const [w, h] = [BREED * s, HOOG * s + 14];
  const [x0, y0] = [44, 30];
  let uit = tekst(x0 + 2.5 * w, 12, 'linkerarm, stand 0 tot 4 →', { maat: 11, klasse: 'stil' });
  for (let k = 0; k < 5; k++) uit += tekst(x0 + k * w + w / 2, 26, String(k), { maat: 12, klasse: 'vet stil' });
  for (let r = 0; r < 5; r++) {
    uit += tekst(32, y0 + r * h + h / 2 + 4, String(r), { maat: 12, klasse: 'vet stil' });
    for (let k = 0; k < 5; k++) {
      const x = x0 + k * w;
      const y = y0 + r * h;
      if ((r + k) % 2 === 0) uit += `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" rx="5" class="vlak2"/>`;
      uit += pop({ links: VREEDE_HOEK.links[r], rechts: VREEDE_HOEK.rechts[k], x, y, schaal: s, soort: 'vreede' });
      uit += tekst(x + w / 2, y + h - 4, VREEDE[r][k] === 'rust' ? 'rust' : vreedeNaam(VREEDE[r][k]), { maat: 12, klasse: 'vet' });
    }
  }
  uit += `<text x="12" y="${y0 + 2.5 * h}" class="tekst stil" font-size="11" text-anchor="middle" transform="rotate(-90 12 ${y0 + 2.5 * h})">rechterarm (rood), stand 0 tot 4</text>`;
  return svg(x0 + 5 * w + 4, y0 + 5 * h + 4, 'Het seinstelsel Vreede: elke letter is een stand van de rechterarm en een stand van de linkerarm', uit);
}

function seinvlaggenAlfabet() {
  const [kol, w, h] = [5, 72, 78];
  let uit = '';
  LETTERVLAGGEN.forEach((v, i) => {
    const x = (i % kol) * w;
    const y = Math.floor(i / kol) * h;
    const fh = 40;
    uit += vlag(v.ontwerp, x + (w - breedte(v.ontwerp, fh)) / 2, y + 6, fh);
    uit += tekst(x + w / 2, y + 62, v.id, { maat: 13, klasse: 'vet' }) + tekst(x + w / 2, y + 74, v.spelwoord, { maat: 9.5, klasse: 'stil' });
  });
  return svg(kol * w, Math.ceil(LETTERVLAGGEN.length / kol) * h, 'De 26 lettervlaggen van het Internationaal Seinboek', uit);
}

function cijferwimpels() {
  const [w, h, fh] = [180, 42, 24];
  let uit = '';
  CIJFERWIMPELS.forEach((c, i) => {
    const x = (i % 2) * w;
    const y = Math.floor(i / 2) * h;
    uit += vlag(c.ontwerp, x + 6, y + 8, fh) + tekst(x + 76, y + 25, `Cijfer ${c.id}`, { maat: 12, anker: 'start' });
  });
  OVERIGE_WIMPELS.forEach((c, i) => {
    const y = 5 * h + 10 + i * h;
    uit += vlag(c.ontwerp, 6 + (60 - breedte(c.ontwerp, fh)), y + 8, fh) + tekst(76, y + 25, c.naam, { maat: 12, anker: 'start' });
  });
  return svg(2 * w, 9 * h + 14, 'De tien cijferwimpels, de drie vervangwimpels en de onderscheidingswimpel', uit);
}

/** The ground-air code: laid out on the ground, at least 3 m long, as big and as bright as you can. */
function grondLucht() {
  const tekens = [
    ['V', 'hulp nodig', 'M8 10 L22 46 L36 10'],
    ['X', 'medische hulp', 'M8 10 L36 46 M36 10 L8 46'],
    ['N', 'nee', 'M8 46 L8 10 L36 46 L36 10'],
    ['Y', 'ja', 'M8 10 L22 28 L36 10 M22 28 L22 46'],
    ['↑', 'wij gaan deze kant op', 'M22 46 L22 10 M10 22 L22 10 L34 22'],
  ];
  let uit = '';
  tekens.forEach(([l, wat, d], i) => {
    const x = i * 72;
    uit += `<rect x="${x + 4}" y="4" width="64" height="62" rx="6" class="gl-grond"/>`;
    uit += `<path d="${d}" transform="translate(${x + 14} 7)" class="gl-teken"/>`;
    uit += tekst(x + 36, 84, l === '↑' ? 'pijl' : l, { maat: 13, klasse: 'vet' });
    const woorden = wat.split(' ');
    const half = Math.ceil(woorden.length / 2);
    if (woorden.length > 2) uit += tekst(x + 36, 99, woorden.slice(0, half).join(' '), { maat: 10.5 }) + tekst(x + 36, 111, woorden.slice(half).join(' '), { maat: 10.5 });
    else uit += tekst(x + 36, 99, wat, { maat: 10.5 });
  });
  return svg(360, 116, 'De grond-luchtcode: V hulp nodig, X medische hulp, N nee, Y ja, een pijl: wij gaan deze kant op', uit);
}

/** Helikopter: Y (both arms up) yes, we need help; N (one arm up, one down) no. */
function helikopter() {
  const uit = pop({ links: 315, rechts: 45, x: 10, y: 0, vlaggen: false }) + pop({ links: 315, rechts: 135, x: 190, y: 0, vlaggen: false })
    + tekst(70, 138, 'Y: ja, hulp nodig', { maat: 13, klasse: 'vet' }) + tekst(250, 138, 'N: nee, geen hulp', { maat: 13, klasse: 'vet' });
  return svg(320, 146, 'Seinen naar een helikopter: Y met beide armen schuin omhoog betekent ja, wij hebben hulp nodig; N met één arm schuin omhoog en één schuin omlaag betekent nee', uit);
}

/** Aiming a signal mirror: the sun on the mirror, the spot of light between two fingers, on to the plane. */
function seinspiegel() {
  const uit = `<circle cx="34" cy="34" r="16" class="ss-zon"/>`
    + [0, 45, 90, 135, 180, 225, 270, 315].map((g) => { const r = (g * Math.PI) / 180; return `<line x1="${34 + 21 * Math.cos(r)}" y1="${34 + 21 * Math.sin(r)}" x2="${34 + 27 * Math.cos(r)}" y2="${34 + 27 * Math.sin(r)}" class="ss-straal"/>`; }).join('')
    + `<line x1="48" y1="44" x2="98" y2="104" class="ss-licht"/>`
    + `<rect x="86" y="98" width="30" height="20" rx="3" transform="rotate(-20 101 108)" class="ss-spiegel"/>`
    + `<line x1="112" y1="102" x2="306" y2="40" class="ss-licht"/>`
    + `<path d="M196 88 C 194 70, 192 60, 196 52 M206 86 C 208 70, 210 58, 214 48" class="ss-vinger"/>`
    + `<path d="M296 34 l26 -6 l-6 6 l8 4 l-10 0 l-4 6 l-2 -6 l-14 2 Z" class="ss-vliegtuig"/>`
    + tekst(101, 136, 'spiegel', { maat: 11, klasse: 'stil' }) + tekst(205, 104, 'twee vingers als vizier', { maat: 11, klasse: 'stil' })
    + tekst(300, 62, 'vliegtuig', { maat: 11, klasse: 'stil' }) + tekst(34, 72, 'zon', { maat: 11, klasse: 'stil' });
  return svg(340, 144, 'Een seinspiegel richten: de zon schijnt op de spiegel, je kijkt over je twee vingers naar het vliegtuig en kantelt de spiegel tot de lichtvlek op je vingers valt', uit);
}

// -- small helpers for the drawings below

/** An arrowhead with its tip at (x, y), pointing at angle g (clockwise from up). */
const kop = (x, y, g, k = 'accent') => {
  const [ax, ay] = pol(x, y, -6, g);
  const [bx, by] = pol(ax, ay, 3.5, g + 90);
  const [cx, cy] = pol(ax, ay, 3.5, g - 90);
  return `<polygon points="${r1(x)},${r1(y)} ${bx},${by} ${cx},${cy}" class="${k}"/>`;
};
/** A straight arrow from (x1, y1) to (x2, y2); `beide` puts a head on both ends. */
function pijl(x1, y1, x2, y2, { beide = false } = {}) {
  const g = (Math.atan2(x2 - x1, -(y2 - y1)) * 180) / Math.PI;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="lijn accent-lijn"/>` + kop(x2, y2, g) + (beide ? kop(x1, y1, g + 180) : '');
}
/** An arc round (cx, cy) from angle a to angle b (clockwise), with a head on both ends: something that swings. */
function zwaai(cx, cy, r, a, b) {
  const [x1, y1] = pol(cx, cy, r, a);
  const [x2, y2] = pol(cx, cy, r, b);
  return `<path d="M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}" class="lijn accent-lijn"/>` + kop(x2, y2, b + 90) + kop(x1, y1, a - 90);
}
/** An arm of the figure as a dashed shadow: where it also goes. From the shoulder on your left (-1) or right (1). */
const spookArm = (kant, g) => { const sx = 60 + kant * 9; const [x, y] = pol(sx, 46, 27, g); return `<line x1="${sx}" y1="46" x2="${x}" y2="${y}" class="sp-spook"/>`; };

/** The hand signals of Baden-Powell (Scouting for Boys, 1908): one arm, the other down. */
function handsignalen() {
  const s = 0.62;
  const [w, h] = [120, HOOG * s + 34];
  const omlaag = 172;
  const tekens = [
    ['Stop', '', { links: 0 }],
    ['Ik hoor je', 'hand op hoofdhoogte', { links: 300 }],
    ['Uitzwermen', 'hoog, langzaam zwaaien', { links: 0, extra: spookArm(-1, 330) + spookArm(-1, 30) + zwaai(51, 46, 34, 326, 34) }],
    ['Verzamelen', 'hoog, snel zwaaien', { links: 0, extra: spookArm(-1, 330) + spookArm(-1, 30) + zwaai(51, 46, 34, 326, 34) + zwaai(51, 46, 40, 330, 30) }],
    ['Die kant op', 'wijzen', { links: 270, extra: pijl(20, 46, 0, 46) }],
    ['Rennen', 'snel op en neer', { links: 330, extra: spookArm(-1, 300) + pijl(26, 30, 26, 2, { beide: true }) }],
    ['Nee, laat maar', 'hand voor je gezicht', { links: null, extra: '<path d="M51 46 L43 59 L56 34" class="sp-arm gebogen"/>' + pijl(40, 27, 80, 27, { beide: true }) }],
  ];
  let uit = '';
  tekens.forEach(([naam, hoe, { links, extra = '' }], i) => {
    // three in a row, the last one in the middle
    const x = i === 6 ? w : (i % 3) * w;
    const y = Math.floor(i / 3) * h;
    uit += pop({ links, rechts: omlaag, x: x + (w - BREED * s) / 2, y: y + 4, schaal: s, vlaggen: false, extra });
    uit += tekst(x + w / 2, y + HOOG * s + 14, naam, { maat: 11.5, klasse: 'vet' });
    if (hoe) uit += tekst(x + w / 2, y + HOOG * s + 27, hoe, { maat: 9.5, klasse: 'stil' });
  });
  return svg(3 * w, 3 * h, 'De handsignalen van Baden-Powell: hand recht omhoog is stop; hand op hoofdhoogte is ik hoor je; hoog en langzaam zwaaien is uitzwermen; hoog en snel zwaaien is verzamelen; wijzen is die kant op; de hand snel op en neer is rennen; de hand voor je gezicht heen en weer is nee, laat maar', uit);
}

/** The formations of the stomme bevelen, seen from above: where the leiding stands and where the group goes. */
function formaties() {
  const [w, h] = [120, 128];
  const kind = (x, y) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="5" class="vol"/>`;
  const leiding = (x, y) => `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" rx="2" class="accent"/>`;
  const vormen = [
    ['In een kring', 'hand omhoog, rondjes', () => Array.from({ length: 8 }, (_, k) => pol(60, 50, 26, k * 45 + 22.5)).map(([x, y]) => kind(x, y)).join('') + leiding(60, 12)],
    ['In een lijn', 'twee handen opzij', () => Array.from({ length: 6 }, (_, k) => kind(25 + k * 14, 60)).join('') + leiding(60, 18)],
    ['Estafette', 'twee handen vooruit', () => [0, 1, 2].map((c) => [0, 1, 2, 3].map((r) => kind(36 + c * 24, 44 + r * 14)).join('')).join('') + leiding(60, 18)],
    ['In een U', 'handen gevouwen', () => [[30, 40], [30, 54], [30, 68], [44, 80], [60, 82], [76, 80], [90, 68], [90, 54], [90, 40]].map(([x, y]) => kind(x, y)).join('') + leiding(60, 18)],
    ['Achter elkaar', 'handen langs je lijf', () => Array.from({ length: 5 }, (_, k) => kind(60, 38 + k * 12)).join('') + leiding(60, 16)],
  ];
  let uit = '';
  vormen.forEach(([naam, hoe, teken], i) => {
    const x = i < 3 ? i * w : 60 + (i - 3) * w;
    const y = i < 3 ? 0 : h;
    uit += `<g transform="translate(${x} ${y})"><rect x="4" y="2" width="${w - 8}" height="94" rx="8" class="vlak2"/>${teken()}</g>`;
    uit += tekst(x + w / 2, y + 110, naam, { maat: 11.5, klasse: 'vet' }) + tekst(x + w / 2, y + 123, hoe, { maat: 9.5, klasse: 'stil' });
  });
  uit += `<rect x="6" y="${2 * h + 6}" width="10" height="10" rx="2" class="accent"/>` + tekst(20, 2 * h + 15, 'de leiding', { maat: 10, anker: 'start', klasse: 'stil' })
    + `<circle cx="96" cy="${2 * h + 11}" r="5" class="vol"/>` + tekst(105, 2 * h + 15, 'de groep, van boven gezien', { maat: 10, anker: 'start', klasse: 'stil' });
  return svg(3 * w, 2 * h + 22, 'Stomme bevelen, van boven gezien: in een kring, in een lijn naast elkaar, in estafette-opstelling, in een U, en achter elkaar in één rij, steeds met het gebaar van de leiding erbij', uit);
}

/** The group of three: three fires in a triangle, three blasts, three heaps of stones. */
function groepVanDrie() {
  const vuur = (x, y) => `<path d="M${x} ${y} c-9 0 -11 -9 -6 -16 c1 5 4 6 5 3 c-1 -6 2 -11 6 -14 c-1 6 4 9 6 14 c3 6 -1 13 -11 13Z" class="dr-vuur"/>`
    + `<path d="M${x - 9} ${y + 2} L${x + 9} ${y + 2}" class="lijn dik stil"/>`;
  const hoop = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="5" class="vol"/><ellipse cx="${x}" cy="${y - 7}" rx="8" ry="4.5" class="vol-licht"/><ellipse cx="${x}" cy="${y - 13}" rx="5" ry="3.5" class="vol"/>`;
  let uit = '<rect x="4" y="4" width="112" height="86" rx="8" class="vlak2"/><rect x="124" y="4" width="112" height="86" rx="8" class="vlak2"/><rect x="244" y="4" width="112" height="86" rx="8" class="vlak2"/>';
  uit += vuur(60, 36) + vuur(36, 78) + vuur(84, 78) + `<path d="M60 40 L36 80 L84 80Z" class="lijn haar"/>`;
  uit += [0, 1, 2].map((k) => `<rect x="${136 + k * 32}" y="40" width="24" height="12" rx="6" class="mo-aan"/>`).join('') + tekst(180, 74, '3 stoten, rust, …', { maat: 10, klasse: 'stil' });
  uit += hoop(272, 70) + hoop(300, 70) + hoop(328, 70);
  uit += tekst(60, 106, 'drie vuren', { maat: 11.5, klasse: 'vet' }) + tekst(60, 119, 'in een driehoek', { maat: 9.5, klasse: 'stil' })
    + tekst(180, 106, 'drie fluitstoten', { maat: 11.5, klasse: 'vet' }) + tekst(180, 119, 'of drie flitsen', { maat: 9.5, klasse: 'stil' })
    + tekst(300, 106, 'drie steenhopen', { maat: 11.5, klasse: 'vet' }) + tekst(300, 119, 'op een rij', { maat: 9.5, klasse: 'stil' });
  return svg(360, 124, 'Het noodsein van drie: drie vuren in een driehoek, drie fluitstoten of lichtflitsen, drie steenhopen', uit);
}

/** Distress at sea you can give yourself: arms up and down, N over C, a red flare. */
function noodWater() {
  const s = 0.72;
  let uit = '<rect x="4" y="4" width="112" height="112" rx="8" class="vlak2"/><rect x="124" y="4" width="112" height="112" rx="8" class="vlak2"/><rect x="244" y="4" width="112" height="112" rx="8" class="vlak2"/>';
  const extra = spookArm(-1, 225) + spookArm(1, 135) + spookArm(-1, 315) + spookArm(1, 45) + pijl(23, 30, 23, 62, { beide: true }) + pijl(97, 30, 97, 62, { beide: true });
  uit += pop({ links: 270, rechts: 90, x: 60 - (BREED * s) / 2, y: 18, schaal: s, vlaggen: false, extra });
  const n = LETTERVLAG.N.ontwerp;
  const c = LETTERVLAG.C.ontwerp;
  uit += `<line x1="148" y1="12" x2="148" y2="108" class="lijn dik stil"/>` + vlag(n, 150, 16, 36) + vlag(c, 150, 60, 36)
    + tekst(212, 38, 'N', { maat: 13, klasse: 'vet' }) + tekst(212, 82, 'C', { maat: 13, klasse: 'vet' });
  uit += `<ellipse cx="318" cy="30" rx="22" ry="12" class="dr-rook"/><ellipse cx="300" cy="22" rx="14" ry="9" class="dr-rook"/>`
    + `<rect x="294" y="64" width="12" height="44" rx="3" class="dr-fakkel"/><path d="M300 64 c-10 -4 -10 -16 -2 -24 c0 6 6 6 4 0 c8 6 9 18 -2 24Z" class="dr-vlam"/>`;
  uit += tekst(60, 136, 'armen op en neer', { maat: 11.5, klasse: 'vet' }) + tekst(180, 136, 'N boven C', { maat: 11.5, klasse: 'vet' })
    + tekst(300, 136, 'rode fakkel', { maat: 11.5, klasse: 'vet' }) + tekst(300, 149, 'of oranje rook', { maat: 9.5, klasse: 'stil' });
  return svg(360, 154, 'Noodseinen op het water: langzaam beide gestrekte armen op en neer bewegen, de seinvlaggen N boven C, een rode fakkel of oranje rook', uit);
}

/** De Lange: count the strokes; rechts is 5, links is 1. The m (13) is two to the right and three to the left. */
function deLange() {
  const slagen = [['rechts', 5, 'e'], ['rechts', 10, 'j'], ['links', 11, 'k'], ['links', 12, 'l'], ['links', 13, 'm']];
  let uit = tekst(10, 18, 'De m is de 13e letter:', { maat: 12, anker: 'start', klasse: 'vet' });
  slagen.forEach(([kant, tel, letter], i) => {
    const x = 10 + i * 68;
    const rechts = kant === 'rechts';
    uit += `<rect x="${x}" y="30" width="60" height="44" rx="8" class="${rechts ? 'accent' : 'vlak2'}"/>`
      + tekst(x + 30, 50, `slag ${kant}`, { maat: 9.5, klasse: rechts ? 'dl-op-accent vet' : 'vet' })
      + tekst(x + 30, 66, rechts ? '+5' : '+1', { maat: 12, klasse: rechts ? 'dl-op-accent vet' : 'vet' })
      + tekst(x + 30, 94, String(tel), { maat: 13, klasse: 'vet' }) + tekst(x + 30, 110, letter, { maat: 14, klasse: i === 4 ? 'vet accent-tekst' : 'stil' });
  });
  uit += tekst(10, 132, 'Tel mee met e, j, o, t, ij: dan ben je er sneller.', { maat: 11, anker: 'start', klasse: 'stil' });
  return svg(360, 140, 'Seinstelsel De Lange: de m is de dertiende letter. Twee slagen rechts tellen 5 en 10, dat is e en j; drie slagen links tellen 11, 12, 13: k, l, m', uit);
}

/** The width morseTekens takes for a code. */
const morseBreed = (code, e) => [...code].reduce((b, t) => b + (t === '.' ? 2 * e + 1 : 4 * e), 0) - e;

/** A procedure sign is one sign: A R with room between the letters, and AR as one. */
function morseAaneen() {
  const e = 6;
  const x0 = 120;
  const wA = morseBreed('.-', e);
  let uit = tekst(10, 32, 'A R', { maat: 15, anker: 'start', klasse: 'vet' }) + tekst(10, 46, 'twee letters', { maat: 10, anker: 'start', klasse: 'stil' });
  uit += morseTekens('.-', x0, 32, e) + morseTekens('.-.', x0 + wA + 3 * e, 32, e);
  uit += `<path d="M${x0 + wA + 1} 44 L${x0 + wA + 1} 48 L${x0 + wA + 3 * e - 1} 48 L${x0 + wA + 3 * e - 1} 44" class="lijn stil"/>` + tekst(x0 + wA + 1.5 * e, 60, '3', { maat: 10, klasse: 'stil' });
  uit += tekst(10, 92, 'AR', { maat: 15, anker: 'start', klasse: 'vet accent-tekst' }) + tekst(10, 106, 'één teken', { maat: 10, anker: 'start', klasse: 'stil' });
  uit += morseTekens('.-.-.', x0, 92, e);
  uit += tekst(x0 + morseBreed('.-.-.', e) + 14, 96, '= einde bericht', { maat: 11, anker: 'start', klasse: 'stil' });
  return svg(360, 116, 'Een proceduresein sein je als één teken. A R als twee letters heeft een pauze van 3 punten tussen de letters; AR als proceduresein heeft die pauze niet', uit);
}

/** The cijfers: 1 to 5 begin with punten, 6 to 0 with strepen, always five tekens. */
function morseCijfers() {
  const e = 5;
  let uit = '';
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].forEach((c, i) => {
    const x = i < 5 ? 0 : 180;
    const y = (i % 5) * 26 + 4;
    if ((i % 5) % 2 === 0) uit += `<rect x="${x + 2}" y="${y}" width="176" height="26" rx="4" class="vlak2"/>`;
    uit += tekst(x + 20, y + 19, c, { maat: 16, klasse: 'vet' }) + morseTekens(MORSE[c], x + 44, y + 13, e);
  });
  uit += tekst(90, 150, 'eerst punten', { maat: 11, klasse: 'stil' }) + tekst(270, 150, 'eerst strepen', { maat: 11, klasse: 'stil' });
  return svg(360, 156, 'De cijfers in morse: altijd vijf tekens. 1 tot en met 5 beginnen met punten, 6 tot en met 0 met strepen', uit);
}

/** A privacycode (subtoon) only shuts what you hear: who has no code, or the same one, hears you anyway. */
function privacycode() {
  const portofoon = (x, scherm, hoort) => `<line x1="${x + 26}" y1="28" x2="${x + 26}" y2="10" class="lijn dik"/>`
    + `<rect x="${x + 10}" y="26" width="34" height="58" rx="6" class="pf-kast"/><rect x="${x + 13}" y="32" width="28" height="13" rx="2" class="vlak"/>`
    + tekst(x + 27, 42, scherm, { maat: 8, klasse: 'vet' })
    + [0, 1, 2].map((k) => `<line x1="${x + 18}" y1="${54 + k * 6}" x2="${x + 36}" y2="${54 + k * 6}" class="lijn haar"/>`).join('')
    + (hoort === null ? '' : tekst(x + 27, 102, hoort ? 'hoort het' : 'hoort niets', { maat: 10.5, klasse: hoort ? 'vet' : 'stil' }));
  let uit = portofoon(4, '8 · 5', null) + tekst(31, 102, 'zendt', { maat: 10.5, klasse: 'vet accent-tekst' });
  uit += [0, 1, 2].map((k) => `<path d="M${64 + k * 7} ${30 - k * 3} q6 14 0 28" class="lijn accent-lijn"/>`).join('');
  uit += portofoon(96, '8 · 5', true) + portofoon(186, '8', true) + portofoon(276, '8 · 12', false);
  uit += tekst(123, 116, 'zelfde code', { maat: 9.5, klasse: 'stil' }) + tekst(213, 116, 'geen code', { maat: 9.5, klasse: 'stil' }) + tekst(303, 116, 'andere code', { maat: 9.5, klasse: 'stil' });
  uit += tekst(4, 136, 'Kanaal 8, privacycode 5. Wie geen code heeft, hoort alles.', { maat: 11, anker: 'start', klasse: 'stil' });
  return svg(360, 142, 'Een privacycode werkt alleen bij het luisteren: een portofoon op kanaal 8 met code 5 zendt; met dezelfde code hoor je het, zonder code hoor je het ook, alleen met een andere code hoor je het niet', uit);
}

export default {
  'morse-tabel': morseTabel,
  'morse-tijd': morseTijd,
  morseboom: () => svg(BOOM_BREED, BOOM_HOOG, 'De morseboom: vanaf de top gaat een punt naar links en een streep naar rechts', boom('')),
  'semafoor-alfabet': () => popRooster(semafoorLijst(), { kolommen: 5, schaal: 0.6, titel: 'Het semafooralfabet: alle letters, rust, het cijferteken en annuleren, zoals jij de seiner ziet' }),
  'semafoor-cijfers': semafoorCijfers,
  'vreede-tabel': vreedeTabel,
  'seinvlaggen-alfabet': seinvlaggenAlfabet,
  cijferwimpels,
  'grond-luchtcode': grondLucht,
  'helikopter-ja-nee': helikopter,
  seinspiegel,
  handsignalen,
  'stomme-bevelen': formaties,
  'groep-van-drie': groepVanDrie,
  'noodseinen-water': noodWater,
  'de-lange-tellen': deLange,
  'morse-aaneen': morseAaneen,
  'morse-cijfers': morseCijfers,
  privacycode,
};
