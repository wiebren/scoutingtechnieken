// The geheimschriften of the Codeermachine, without a page, so they can be tried in node. Each code turns text into
// code and back (`codeer`, `decodeer`), with the keys it needs (`sleutels`), and can show how it works
// (`rooster`: a small table of cells). The werking of each code is in notities/technieken/navigatie-en-seinen.md
// §5 (NAV). The tekenalfabetten give a list of letters (`tekens`) that the machine draws (./tekens.js, ./seinpop.js,
// ./vlaggen.js).
import { MORSE, kaal, letterOp, naarGetallen, vanGetallen, verschuif } from '../../codes.js';

export const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const isLetter = (ch) => ch.length === 1 && ABC.includes(ch);
/** Only the letters, as capitals: "Kom je?" is KOMJE. */
export const letters = (t) => kaal(t).replace(/[^A-Z]/g, '');
const woorden = (t) => kaal(t).split(/\s+/).map((w) => w.replace(/[^A-Z]/g, '')).filter(Boolean);

/** Swap every letter by an alphabet: naar[i] for ABC[i]. Capitals stay capitals; the rest stays as it is. */
function vervang(tekst, naar) {
  return [...tekst].map((ch) => {
    const k = kaal(ch);
    const i = ABC.indexOf(k);
    if (k.length !== 1 || i < 0) return ch;
    return ch === ch.toLowerCase() ? naar[i].toLowerCase() : naar[i];
  }).join('');
}
const omgekeerd = (alfabet) => { const uit = Array(26); [...alfabet].forEach((l, i) => { uit[ABC.indexOf(l)] = ABC[i]; }); return uit.join(''); };

/** The two strips of a letter-for-letter code, with the letter `nu` lit. */
const stroken = (naar, nu = -1, kop = ['gewoon', 'geheim']) => ({
  links: kop,
  rijen: [[...ABC].map((l, i) => ({ t: l, nu: i === nu })), [...naar].map((l, i) => ({ t: l, nu: i === nu, geheim: true }))],
});
const laatste = (tekst) => ABC.indexOf(letters(tekst).at(-1) ?? '');

/** A keyword without its repeats: WIMPEL, KAMPVUUR is KAMPVUR. */
export const zonderDubbel = (woord) => [...new Set(letters(woord))].join('');

// -- the codes

const verschuiving = {
  naam: 'Verschuivingscode', groep: 'vervangen',
  sleutels: [{ id: 'n', soort: 'getal', naam: 'Verschuiving', min: 1, max: 25, standaard: 3 }],
  codeer: (t, { n }) => verschuif(t, n),
  decodeer: (c, { n }) => verschuif(c, -n),
  rooster: (t, { n }) => stroken([...ABC].map((_, i) => letterOp(i + n)).join(''), laatste(t)),
};

const rot13 = {
  naam: 'Rot13', groep: 'vervangen', zelfde: true,
  codeer: (t) => verschuif(t, 13), decodeer: (c) => verschuif(c, 13),
  rooster: (t) => stroken([...ABC].map((_, i) => letterOp(i + 13)).join(''), laatste(t)),
};

const ATBASH = [...ABC].reverse().join('');
const atbash = {
  naam: 'Omgekeerd alfabet', groep: 'vervangen', zelfde: true,
  codeer: (t) => vervang(t, ATBASH), decodeer: (c) => vervang(c, ATBASH),
  rooster: (t) => stroken(ATBASH, laatste(t)),
};

/** Codewoord: the keyword and then the rest of the alphabet, in two rows of 13; a letter swaps with the one above or under it. */
export function codewoordRijen(woord) {
  const alfabet = zonderDubbel(woord) + [...ABC].filter((l) => !letters(woord).includes(l)).join('');
  return [alfabet.slice(0, 13), alfabet.slice(13)];
}
function codewoordAlfabet(woord) {
  const [boven, onder] = codewoordRijen(woord);
  const naar = Array(26);
  for (let i = 0; i < 13; i++) { naar[ABC.indexOf(boven[i])] = onder[i]; naar[ABC.indexOf(onder[i])] = boven[i]; }
  return naar.join('');
}
const codewoord = {
  naam: 'Codewoord', groep: 'vervangen', zelfde: true,
  sleutels: [{ id: 'woord', soort: 'woord', naam: 'Codewoord', standaard: 'WIMPEL' }],
  codeer: (t, { woord }) => vervang(t, codewoordAlfabet(woord)),
  decodeer: (c, { woord }) => vervang(c, codewoordAlfabet(woord)),
  rooster: (t, { woord }) => {
    const l = letters(t).at(-1);
    return { rijen: codewoordRijen(woord).map((rij) => [...rij].map((x) => ({ t: x, nu: x === l }))) };
  },
};

/** Vigenère: the letters of the keyword, over and over, say how far each letter shifts (A 0, B 1, ...). */
function vigenere(tekst, woord, richting) {
  const sleutel = letters(woord) || 'A';
  let k = 0;
  return [...tekst].map((ch) => {
    const l = kaal(ch);
    if (!isLetter(l)) return ch;
    const uit = letterOp(ABC.indexOf(l) + richting * ABC.indexOf(sleutel[k++ % sleutel.length]));
    return ch === ch.toLowerCase() ? uit.toLowerCase() : uit;
  }).join('');
}
const vigenereCode = {
  naam: 'Vigenère', groep: 'vervangen',
  sleutels: [{ id: 'woord', soort: 'woord', naam: 'Sleutelwoord', standaard: 'BALOE' }],
  codeer: (t, { woord }) => vigenere(t, woord, 1),
  decodeer: (c, { woord }) => vigenere(c, woord, -1),
  rooster: (t, { woord }) => {
    const l = letters(t).slice(-12);
    const s = letters(woord) || 'A';
    const begin = letters(t).length - l.length;
    const sl = [...l].map((_, i) => s[(begin + i) % s.length]);
    return {
      links: ['gewoon', 'sleutel', 'geheim'],
      rijen: [[...l].map((x) => ({ t: x })), sl.map((x) => ({ t: x, stil: true })), [...l].map((x, i) => ({ t: letterOp(ABC.indexOf(x) + ABC.indexOf(sl[i])), geheim: true }))],
    };
  },
};

const aIs1 = {
  naam: 'A=1', groep: 'cijfers',
  codeer: (t) => naarGetallen(t).tekst,
  decodeer: (c) => vanGetallen(c),
  rooster: (t) => ({ links: ['letter', 'getal'], rijen: [[...ABC].map((l) => ({ t: l, nu: l === letters(t).at(-1) })), [...ABC].map((l, i) => ({ t: String(i + 1), nu: l === letters(t).at(-1), geheim: true }))] }),
};

/** Text code with letters apart (a space) and words apart (" / "), from a code per letter. */
const perLetter = (t, fn) => woorden(t).map((w) => [...w].map(fn).join(' ')).join(' / ');
/** Back again: words split on /, letters on spaces (or a streepje), each through fn; what fn does not know is a ?. */
const terugPerLetter = (c, fn) => c.split('/').map((w) => w.trim().split(/[\s,-]+/).filter(Boolean).map((x) => fn(x) ?? '?').join('')).filter(Boolean).join(' ').toLowerCase();

/** The keys of an old telephone: 2 is ABC, 7 is PQRS, 9 is WXYZ. */
export const TOETSEN = { 2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ' };
const sms = {
  naam: 'SMS-code', groep: 'cijfers',
  codeer: (t) => perLetter(t, (l) => { const [k, v] = Object.entries(TOETSEN).find(([, x]) => x.includes(l)); return k.repeat(v.indexOf(l) + 1); }),
  // 7777222 is 7777 222: a new key starts a new letter
  decodeer: (c) => terugPerLetter(c.replace(/(\d)(?!\1)(?=\d)/g, '$1 '), (x) => (/^(\d)\1*$/.test(x) ? TOETSEN[x[0]]?.[x.length - 1] : null)),
  rooster: (t) => {
    const l = letters(t).at(-1);
    return { toetsen: true, rijen: [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((rij) => rij.map((k) => ({ t: TOETSEN[k] ? `${k} ${TOETSEN[k]}` : k, nu: TOETSEN[k]?.includes(l) }))) };
  },
};

/** Polybius: a 5 x 5 square without the J (I and J share a box); a letter is its row and then its column. */
const POLY = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
const polybius = {
  naam: 'Polybius', groep: 'cijfers',
  codeer: (t) => perLetter(t.replace(/j/gi, 'i'), (l) => { const i = POLY.indexOf(l === 'J' ? 'I' : l); return `${Math.floor(i / 5) + 1}${(i % 5) + 1}`; }),
  decodeer: (c) => terugPerLetter(c.replace(/(\d)(\d)(?=\d)/g, '$1$2 '), (x) => (/^[1-5][1-5]$/.test(x) ? POLY[(x[0] - 1) * 5 + (x[1] - 1)] : null)),
  rooster: (t) => {
    const l = letters(t).at(-1)?.replace('J', 'I');
    return { boven: ['1', '2', '3', '4', '5'], links: ['1', '2', '3', '4', '5'],
      rijen: [0, 1, 2, 3, 4].map((r) => [...POLY.slice(r * 5, r * 5 + 5)].map((x) => ({ t: x === 'I' ? 'I/J' : x, nu: x === l }))) };
  },
};

/** Bacon: every letter is five times A or B, the place in the alphabet counted in twos (A is AAAAA, B AAAAB). */
const baconVan = (l) => ABC.indexOf(l).toString(2).padStart(5, '0').replace(/0/g, 'A').replace(/1/g, 'B');
const bacon = {
  naam: 'Bacon-code', groep: 'cijfers',
  codeer: (t) => perLetter(t, baconVan),
  decodeer: (c) => terugPerLetter(c.toUpperCase().replace(/([AB]{5})(?=[AB])/g, '$1 '), (x) => (/^[AB]{5}$/.test(x) ? ABC[parseInt(x.replace(/A/g, '0').replace(/B/g, '1'), 2)] : null)),
  rooster: (t) => {
    const l = letters(t).at(-1);
    const toon = l ? [l] : ['A', 'B', 'C'];
    return { rijen: toon.map((x) => [{ t: x }, ...[...baconVan(x)].map((y) => ({ t: y, geheim: true }))]) };
  },
};

/** Binair: the computer code (ASCII) of the capital, in eight bits. */
const binair = {
  naam: 'Binaire code', groep: 'cijfers',
  codeer: (t) => perLetter(t, (l) => l.charCodeAt(0).toString(2).padStart(8, '0')),
  decodeer: (c) => terugPerLetter(c.replace(/([01]{8})(?=[01])/g, '$1 '), (x) => { const n = parseInt(x, 2); return /^[01]{8}$/.test(x) && n >= 65 && n <= 90 ? String.fromCharCode(n) : null; }),
};

/** Woordwaarde: the letters as A=1 and added up, per word and for the whole text. One way only. */
const woordwaarde = {
  naam: 'Woordwaarde', groep: 'cijfers', eenRichting: 'Een som kun je niet terugrekenen naar woorden: er zijn heel veel woorden met dezelfde waarde.',
  codeer: (t) => {
    const w = woorden(t);
    if (!w.length) return '';
    const som = (x) => [...x].reduce((s, l) => s + ABC.indexOf(l) + 1, 0);
    const regels = w.map((x) => `${x} = ${[...x].map((l) => ABC.indexOf(l) + 1).join(' + ')} = ${som(x)}`);
    if (w.length > 1) regels.push(`Samen: ${w.reduce((s, x) => s + som(x), 0)}`);
    return regels.join('\n');
  },
};

// -- verwisselen: the same letters, in another order

const achterstevoren = {
  naam: 'Achterstevoren', groep: 'verwisselen', zelfde: true,
  sleutels: [{ id: 'hoe', soort: 'keuze', naam: 'Wat draai je om?', standaard: 'woord', opties: [['woord', 'Elk woord'], ['alles', 'De hele zin'], ['volgorde', 'De volgorde van de woorden']] }],
  codeer: (t, { hoe }) => (hoe === 'alles' ? [...t].reverse().join('')
    : hoe === 'volgorde' ? t.trim().split(/\s+/).reverse().join(' ')
      : t.split(/(\s+)/).map((w) => (/\s/.test(w) ? w : [...w].reverse().join(''))).join('')),
  decodeer(c, s) { return this.codeer(c, s); },
};

/** Blokmethode: the letters in a square, row by row, filled up with X; read column by column. */
function blok(tekst) {
  const l = letters(tekst);
  const n = Math.max(2, Math.ceil(Math.sqrt(l.length)));
  const vol = l.padEnd(n * n, 'X');
  return Array.from({ length: n }, (_, r) => [...vol.slice(r * n, r * n + n)]);
}
const kolommen = (rijen) => rijen[0].map((_, k) => rijen.map((r) => r[k]).filter(Boolean).join(''));
const blokmethode = {
  naam: 'Blokmethode', groep: 'verwisselen',
  codeer: (t) => (letters(t) ? kolommen(blok(t)).join(' ') : ''),
  decodeer: (c) => {
    const l = letters(c);
    const n = Math.round(Math.sqrt(l.length));
    if (n * n !== l.length) return { fout: 'Het aantal letters moet precies een vierkant vullen: 4, 9, 16, 25, 36 …' };
    return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (__, k) => l[k * n + r]).join('')).join('').toLowerCase();
  },
  rooster: (t) => (letters(t) ? { rijen: blok(t).map((r) => r.map((x, k) => ({ t: x, stil: false, kolom: k }))), kolomKleur: true } : null),
};

/** Jaartalgeheimschrift: each cijfer of the year is how many letters go on that row (a 0 counts as 10). */
const rijLengtes = (jaar) => [...String(jaar).replace(/\D/g, '')].map((d) => Number(d) || 10);
function jaartalRijen(tekst, jaar) {
  const l = letters(tekst);
  const lengtes = rijLengtes(jaar);
  if (!lengtes.length || !l) return [];
  const rijen = [];
  let i = 0;
  for (let r = 0; i < l.length; r++) {
    const n = lengtes[r % lengtes.length];
    rijen.push([...l.slice(i, i + n).padEnd(n, 'X')]);
    i += n;
  }
  return rijen;
}
const jaartal = {
  naam: 'Jaartalgeheimschrift', groep: 'verwisselen',
  sleutels: [{ id: 'jaar', soort: 'woord', naam: 'Jaartal', standaard: '1979', cijfers: true }],
  codeer: (t, { jaar }) => {
    const rijen = jaartalRijen(t, jaar);
    return rijen.length ? kolommen(rijen.map((r) => [...r, ...Array(10 - r.length).fill('')])).filter(Boolean).join(' ') : '';
  },
  decodeer: (c, { jaar }) => {
    const groepen = kaal(c).split(/\s+/).map(letters).filter(Boolean);
    const totaal = groepen.join('').length;
    const lengtes = rijLengtes(jaar);
    if (!lengtes.length) return { fout: 'Typ een jaartal.' };
    const rijen = [];
    for (let som = 0, r = 0; som < totaal; r++) { const n = lengtes[r % lengtes.length]; rijen.push(n); som += n; }
    if (rijen.reduce((a, b) => a + b, 0) !== totaal) return { fout: 'Dit aantal letters past niet bij dit jaartal.' };
    const uit = rijen.map((n) => Array(n).fill('?'));
    const alles = groepen.join('');
    let i = 0;
    for (let k = 0; k < 10; k++) for (const rij of uit) if (k < rij.length) rij[k] = alles[i++] ?? '?';
    return uit.map((r) => r.join('')).join('').toLowerCase();
  },
  rooster: (t, { jaar }) => {
    const rijen = jaartalRijen(t, jaar);
    if (!rijen.length) return null;
    const lengtes = rijLengtes(jaar);
    return { links: rijen.map((_, r) => String(lengtes[r % lengtes.length] % 10)), kolomKleur: true,
      rijen: rijen.map((r) => [...r.map((x, k) => ({ t: x, kolom: k })), ...Array(Math.max(...lengtes) - r.length).fill({ t: '', leeg: true })]) };
  },
};

/** Kolomtranspositie: rows as long as the keyword, read the columns in the alphabetical order of its letters. */
function volgorde(woord) {
  const w = letters(woord) || 'A';
  return [...w].map((l, i) => [l, i]).sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] < b[0] ? -1 : 1)).map(([, i]) => i);
}
function kolomRijen(tekst, woord) {
  const k = (letters(woord) || 'A').length;
  const l = letters(tekst);
  const n = Math.ceil(l.length / k);
  const vol = l.padEnd(n * k, 'X');
  return Array.from({ length: n }, (_, r) => [...vol.slice(r * k, r * k + k)]);
}
const kolom = {
  naam: 'Kolomtranspositie', groep: 'verwisselen',
  sleutels: [{ id: 'woord', soort: 'woord', naam: 'Sleutelwoord', standaard: 'KAMP' }],
  codeer: (t, { woord }) => { if (!letters(t)) return ''; const k = kolommen(kolomRijen(t, woord)); return volgorde(woord).map((i) => k[i]).join(' '); },
  decodeer: (c, { woord }) => {
    const l = letters(c);
    const k = (letters(woord) || 'A').length;
    if (l.length % k) return { fout: `Het aantal letters moet precies in rijen van ${k} passen: zoveel letters heeft het sleutelwoord.` };
    const n = l.length / k;
    const kol = Array(k);
    volgorde(woord).forEach((i, j) => { kol[i] = l.slice(j * n, j * n + n); });
    return Array.from({ length: n }, (_, r) => kol.map((x) => x[r]).join('')).join('').toLowerCase();
  },
  rooster: (t, { woord }) => {
    if (!letters(t)) return null;
    const w = letters(woord) || 'A';
    const plek = volgorde(woord);
    return { kolomKleur: true,
      boven: [...w].map((l, i) => `${l} ${plek.indexOf(i) + 1}`),
      rijen: kolomRijen(t, woord).map((r) => r.map((x, k) => ({ t: x, kolom: k }))) };
  },
};

/** Rail fence (zigzag): the letters go down and up over a few rows; read row by row. */
function zigzag(n, r) {
  const rij = [];
  for (let i = 0, k = 0, stap = 1; i < n; i++) { rij.push(k); if (r > 1) { if (k === 0) stap = 1; else if (k === r - 1) stap = -1; k += stap; } }
  return rij;
}
const hekwerk = {
  naam: 'Zigzagcode', groep: 'verwisselen',
  sleutels: [{ id: 'rijen', soort: 'getal', naam: 'Rijen', min: 2, max: 5, standaard: 3 }],
  codeer: (t, { rijen }) => {
    const l = letters(t);
    const z = zigzag(l.length, rijen);
    return Array.from({ length: rijen }, (_, r) => [...l].filter((_, i) => z[i] === r).join('')).filter(Boolean).join(' ');
  },
  decodeer: (c, { rijen }) => {
    const l = letters(c);
    const z = zigzag(l.length, rijen);
    const uit = Array(l.length);
    let j = 0;
    for (let r = 0; r < rijen; r++) z.forEach((x, i) => { if (x === r) uit[i] = l[j++]; });
    return uit.join('').toLowerCase();
  },
  rooster: (t, { rijen }) => {
    const l = letters(t).slice(0, 24);
    if (!l) return null;
    const z = zigzag(l.length, rijen);
    return { rijen: Array.from({ length: rijen }, (_, r) => [...l].map((x, i) => (z[i] === r ? { t: x, rij: r } : { t: '', leeg: true }))), rijKleur: true };
  },
};

/** Letters husselen: the first and last letter of each word stay, the rest goes in another order. One way only. */
function hussel(woord) {
  if (woord.length < 4) return woord;
  const midden = [...woord.slice(1, -1)];
  for (let p = 0; p < 6; p++) {
    for (let i = midden.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [midden[i], midden[j]] = [midden[j], midden[i]]; }
    if (midden.join('') !== woord.slice(1, -1)) break;
  }
  return woord[0] + midden.join('') + woord.at(-1);
}
const husselen = {
  naam: 'Letters husselen', groep: 'verwisselen', eenRichting: 'Terug moet je het zelf lezen. Typ opnieuw voor een andere hussel.',
  codeer: (t) => t.replace(/\p{L}+/gu, hussel),
};

/** Stoorwoord: an agreed word put in between, here and there. Back: take every stoorwoord out again. */
const stoorwoord = {
  naam: 'Stoorwoord', groep: 'verbergen',
  sleutels: [{ id: 'woord', soort: 'woord', naam: 'Stoorwoord', standaard: 'UIL' }],
  codeer: (t, { woord }) => {
    const l = letters(t);
    const w = letters(woord) || 'X';
    if (!l) return '';
    let uit = '';
    // a stoorwoord after every 2 to 4 letters, the same each time for the same text
    let tel = 0;
    for (let i = 0; i < l.length; i++) {
      uit += l[i];
      tel++;
      if (tel >= 2 + ((i * 7 + l.length) % 3) && i < l.length - 1) { uit += w; tel = 0; }
    }
    return uit;
  },
  decodeer: (c, { woord }) => letters(c).replaceAll(letters(woord) || 'X', '').toLowerCase(),
};

// -- gesproken en vervormd

const KLINKER = /(ij|aa|ee|oo|uu|ie|oe|eu|ui|ei|ou|au|[aeiouy])/gi;
const ptaal = {
  naam: 'P-taal', groep: 'seinen',
  codeer: (t) => t.replace(KLINKER, (k) => `${k}p${k.toLowerCase()}`),
  decodeer: (c) => c.replace(/(ij|aa|ee|oo|uu|ie|oe|eu|ui|ei|ou|au|[aeiouy])p\1/gi, '$1'),
};

const LEET = { A: '4', B: '8', E: '3', G: '6', I: '1', O: '0', S: '5', T: '7', Z: '2' };
const TEEL = Object.fromEntries(Object.entries(LEET).map(([l, c]) => [c, l]));
const leet = {
  naam: 'Cijfers voor letters', groep: 'cijfers',
  codeer: (t) => [...t].map((ch) => LEET[kaal(ch)] ?? ch).join(''),
  decodeer: (c) => [...c].map((ch) => TEEL[ch]?.toLowerCase() ?? ch).join(''),
};

const zonder = {
  naam: 'Zonder klinkers of spaties', groep: 'verbergen', eenRichting: 'Terug moet je het zelf raden: dat is juist de puzzel.',
  sleutels: [{ id: 'wat', soort: 'keuze', naam: 'Wat laat je weg?', standaard: 'klinkers', opties: [['klinkers', 'Klinkers'], ['spaties', 'Spaties'], ['allebei', 'Allebei']] }],
  codeer: (t, { wat }) => {
    let uit = t;
    if (wat !== 'spaties') uit = uit.replace(/[aeiouáéíóúäëïöüàèìòù]/gi, '');
    if (wat !== 'klinkers') uit = uit.replace(/\s+/g, '');
    return uit.replace(/ {2,}/g, ' ');
  },
};

// -- seinen als code

const MORSE_TERUG = Object.fromEntries(Object.entries(MORSE).map(([l, c]) => [c, l]));
const morse = {
  naam: 'Morse', groep: 'seinen',
  codeer: (t) => kaal(t).split(/\s+/).map((w) => [...w].filter((l) => MORSE[l]).map((l) => MORSE[l].replaceAll('.', '·').replaceAll('-', '–')).join(' '))
    .filter(Boolean).join(' / '),
  decodeer: (c) => c.split('/').map((w) => w.trim().split(/\s+/).filter(Boolean)
    .map((x) => MORSE_TERUG[x.replace(/[·•*]/g, '.').replace(/[–—_−]/g, '-')] ?? '?').join('')).filter(Boolean).join(' ').toLowerCase(),
};

/** A tekenalfabet: the code is a list of letters to draw, and '' for a space between words. */
const tekenCode = (naam, teken, groep = 'tekens') => ({
  naam, groep, teken,
  tekens: (t) => kaal(t).trim().split(/\s+/).map((w) => [...w].filter(isLetter)).filter((w) => w.length).flatMap((w, i) => (i ? ['', ...w] : w)),
});

/** Every code of the machine, by id, in the order of the chips. */
export const CODES = {
  verschuiving, rot13, atbash, codewoord, vigenere: vigenereCode,
  'a-is-1': aIs1, sms, polybius, bacon, binair, woordwaarde, leet,
  achterstevoren, husselen, blokmethode, jaartal, kolom, zigzag: hekwerk,
  stoorwoord, zonder, ptaal,
  rozenkruisers: tekenCode('Rozenkruisers', 'rozenkruisers'),
  blokjes: tekenCode('Blokjesgeheimschrift', 'blokjes'),
  braille: tekenCode('Braille', 'braille'),
  morse,
  semafoor: tekenCode('Semafoor', 'semafoor', 'seinen'),
  vlaggen: tekenCode('Seinvlaggen', 'vlaggen', 'seinen'),
};

/** The keys of a code with their standard values. */
export const standaardSleutels = (code) => Object.fromEntries((code.sleutels ?? []).map((s) => [s.id, s.standaard]));
