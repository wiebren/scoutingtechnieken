// The exercises of Kraak de code (../kraak.js), without a page, so they can be tried in node (../codes.test.mjs):
// which sentences go in which code, the keys to pick from, the key line and the hint, the table to look things up in,
// and how an answer is lined up with what is right. The codes themselves are those of ./geheim.js, so a message is
// written exactly as the Codeermachine writes it.
import { MORSE, WOORDEN, ZINNEN, kaal, letterOp, willekeurig } from '../../codes.js';
import { ABC, CODES, letters, standaardSleutels } from './geheim.js';

/** More short sentences for on camp, besides those of ../../codes.js: only letters and spaces. */
const MEER = [
  'Het vuur is bijna uit', 'Wacht bij de brug', 'Zing mee bij het vuur', 'Sjor de palen goed vast', 'Breng een zaklamp mee',
  'De kaart ligt in de tent', 'Kom snel naar de poort', 'Zet de tent op', 'Hijs de vlag', 'Bouw een toren', 'Zoek het spoor',
  'Neem water mee', 'Kook de soep', 'Volg de rivier', 'Tot morgen bij de eik', 'Om negen uur naar bed',
];
/** No X: an X fills up the last row in some codes. */
export const ZINNEN_ALLE = [...ZINNEN, ...MEER].filter((z) => !letters(z).includes('X'));
export const WOORDEN_ALLE = WOORDEN.map((w) => w.toLowerCase());

const ABC_LIJST = [...ABC];
const KLINKERS = 'De klinkers (a, e, i, o en u) zijn weggelaten.';
const OPVULLING = 'De X’en aan het eind vullen alleen op.';

/**
 * Per code: `max` letters of a sentence (or `woord`: one word; `som`: reckon the woordwaarde), the keys to pick from
 * (`sleutels`), the key line and the hint (`sleutel(s)`, `hint(s, geheim)`), a table to look things up in (`hulp`:
 * { naam of its chip, and `rooster(s)` a table as the Codeermachine draws it, `lijst()` pairs of a letter and its
 * code, or `tekens` a tekenalfabet }), and for Zet in code how a code is cut into pieces to compare (`terug`, a key of
 * STUKKEN). `tekens`: the code is drawn. `opvulling`: X'en at the end do not count. `past(zin, s)`: whether a
 * sentence works with this key.
 */
export const OPGAVEN = {
  verschuiving: { max: 26, sleutels: { n: Array.from({ length: 25 }, (_, i) => i + 1) }, terug: 'letters',
    sleutel: ({ n }) => `Verschuiving ${n}: A werd ${letterOp(n)}.`,
    hint: ({ n }) => `Draai de binnenste schijf tot de ${letterOp(n)} onder de A staat. Zoek elke geheime letter op de binnenste schijf en lees de letter erbuiten.` },
  rot13: { max: 26, terug: 'letters', hulp: { naam: 'De stroken', rooster: () => CODES.rot13.rooster('') },
    hint: () => 'Elke letter is 13 plaatsen verschoven: A werd N, en N werd A. Terug gaat precies zo.' },
  atbash: { max: 26, terug: 'letters', hulp: { naam: 'De stroken', rooster: () => CODES.atbash.rooster('') },
    hint: () => 'Het alfabet is omgedraaid: A werd Z, B werd Y, C werd X. Terug gaat precies zo.' },
  codewoord: { max: 26, sleutels: { woord: ['WIMPEL', 'KAMPVUUR', 'BEVER', 'TOUW', 'HOUTVUUR'] }, terug: 'letters',
    hulp: { naam: 'De twee rijen', rooster: (s) => CODES.codewoord.rooster('', s) },
    sleutel: ({ woord }) => `Codewoord: ${woord}`,
    hint: () => 'Schrijf het codewoord zonder dubbele letters op, met de rest van het alfabet erachter, in twee rijen van 13. Elke letter werd de letter erboven of eronder.' },
  vigenere: { max: 16, sleutels: { woord: ['BALOE', 'UIL', 'VOS', 'KAMP', 'BOS'] }, terug: 'letters',
    hulp: { naam: 'De getallen', rooster: () => ({ links: ['letter', 'schuift'], rijen: [ABC_LIJST.map((l) => ({ t: l })), ABC_LIJST.map((_, i) => ({ t: String(i), geheim: true }))] }) },
    sleutel: ({ woord }) => `Sleutelwoord: ${woord}`,
    hint: () => 'Schrijf het sleutelwoord steeds opnieuw onder de geheime letters. A is 0, B is 1, C is 2 … Schuif elke letter zoveel plaatsen terug als de letter eronder zegt.' },
  sms: { max: 18, terug: 'sms', hulp: { naam: 'De toetsen', rooster: () => CODES.sms.rooster('') },
    hint: () => 'Het cijfer is de toets, en hoe vaak het er staat zegt welke letter op die toets: 222 is de derde letter op de 2, de C.' },
  polybius: { max: 18, terug: 'paren', hulp: { naam: 'Het vierkant', rooster: () => CODES.polybius.rooster('') }, past: (z) => !letters(z).includes('J'),
    hint: () => 'Elke letter is twee cijfers: eerst de rij, dan de kolom van het vierkant. I en J delen een vakje.' },
  bacon: { woord: true, terug: 'bacon', hulp: { naam: 'De tabel', lijst: () => ABC_LIJST.map((l) => [l, CODES.bacon.codeer(l)]) },
    hint: () => 'Elk groepje van vijf is een letter. Lees A als 0 en B als 1 en tel in tweeën: AAAAA is A, AAAAB is B, AAABA is C, AAABB is D.' },
  binair: { woord: true, terug: 'binair', hulp: { naam: 'De tabel', lijst: () => ABC_LIJST.map((l) => [l, CODES.binair.codeer(l)]) },
    hint: () => 'Elke hoofdletter begint met 010. De laatste vijf cijfers zijn de plaats in het alfabet, in nullen en enen. Van rechts tellen ze 1, 2, 4, 8 en 16: 00011 is 1 + 2 = 3, de C.' },
  woordwaarde: { woord: true, som: true, hulp: { naam: 'A=1 tot Z=26', lijst: () => ABC_LIJST.map((l, i) => [l, String(i + 1)]) },
    hint: () => 'Elke letter is zijn plaats in het alfabet: A = 1, B = 2, tot Z = 26. Tel ze op.' },
  leet: { max: 26, terug: 'tekens', hulp: { naam: 'De cijfers', lijst: () => [['A', '4'], ['B', '8'], ['E', '3'], ['G', '6'], ['I', '1'], ['O', '0'], ['S', '5'], ['T', '7'], ['Z', '2']] },
    hint: () => 'Elk cijfer lijkt op een letter: 4 is een A, 3 een E, 0 een O.' },
  achterstevoren: { max: 26, sleutels: { hoe: ['woord', 'alles', 'volgorde'] }, terug: 'letters', past: (z) => z.trim().includes(' '),
    sleutel: ({ hoe }) => ({ woord: 'Elk woord is apart omgedraaid.', alles: 'De hele zin is omgedraaid.', volgorde: 'De volgorde van de woorden is omgedraaid.' })[hoe],
    hint: () => 'Lees van achter naar voren.' },
  husselen: { max: 30, hint: () => 'De eerste en de laatste letter van elk woord staan nog goed. De letters ertussen staan door elkaar.' },
  blokmethode: { max: 16, terug: 'letters', opvulling: true,
    hint: (s, geheim) => { const n = geheim.split(' ').length; return `Een vierkant van ${n} bij ${n}. Elk groepje is een kolom: zet ze naast elkaar en lees rij voor rij. ${OPVULLING}`; } },
  jaartal: { max: 20, sleutels: { jaar: ['1979', '1953', '1964', '1987', '1938'] }, terug: 'letters', opvulling: true,
    sleutel: ({ jaar }) => `Jaartal: ${jaar}`,
    hint: ({ jaar }) => `Teken rijen van ${[...jaar].join(', ')} letters, en dan weer opnieuw. Elk groepje is een kolom, van links naar rechts. Schrijf elk groepje van boven naar beneden in zijn kolom, en sla de rijen over die te kort zijn voor die kolom. Lees daarna rij voor rij. ${OPVULLING}` },
  kolom: { max: 20, sleutels: { woord: ['KAMP', 'BOS', 'HIKE', 'WELP', 'VLAG'] }, terug: 'letters', opvulling: true,
    sleutel: ({ woord }) => `Sleutelwoord: ${woord}`,
    hint: ({ woord }) => `Schrijf ${woord} op: elke rij heeft ${woord.length} letters. Elk groepje is een kolom. Het eerste groepje hoort onder de letter die het eerst in het alfabet komt, het tweede onder de volgende. Lees daarna rij voor rij. ${OPVULLING}` },
  zigzag: { max: 20, sleutels: { rijen: [2, 3] }, terug: 'letters',
    sleutel: ({ rijen }) => `Rijen: ${rijen}`,
    hint: ({ rijen }) => `De zin ging in een zigzag over ${rijen} regels, op en neer. Het eerste groepje is de bovenste regel, het laatste de onderste.` },
  stoorwoord: { max: 22, sleutels: { woord: ['UIL', 'VOS', 'DAS', 'MEES', 'SPECHT'] },
    sleutel: ({ woord }) => `Stoorwoord: ${woord}`,
    hint: () => 'Streep het stoorwoord overal weg. Wat overblijft is de boodschap, zonder spaties.',
    past: (z, s) => !letters(z).includes(s.woord) && CODES.stoorwoord.decodeer(CODES.stoorwoord.codeer(z, s), s) === letters(z).toLowerCase() },
  zonder: { max: 26, sleutels: { wat: ['klinkers', 'klinkers', 'allebei'] },
    sleutel: ({ wat }) => (wat === 'klinkers' ? KLINKERS : `${KLINKERS} De spaties ook.`),
    hint: () => 'Zeg de medeklinkers hardop en raad wat ertussen hoort. Het gaat over iets op kamp.' },
  ptaal: { max: 26, terug: 'letters', hint: () => 'Na elke klinker kwam een p en dezelfde klinker nog eens: kamp werd kapamp. Haal die weg.' },
  rozenkruisers: { max: 14, tekens: true, hulp: { naam: 'De sleutel', tekens: 'rozenkruisers' },
    hint: () => 'Elk teken is het stukje rooster om het vakje van een letter, met een stip voor de tweede helft van het alfabet.' },
  blokjes: { max: 14, tekens: true, hulp: { naam: 'De sleutel', tekens: 'blokjes' },
    hint: () => 'Elk teken is het stukje rooster om een vakje met drie letters. Geen stip is de eerste letter, één stip de tweede, twee stippen de derde.' },
  braille: { max: 14, tekens: true, hulp: { naam: 'De sleutel', tekens: 'braille' },
    hint: () => 'Elke letter is een blokje van twee bij drie puntjes. De letters A tot en met J hebben alleen puntjes in de bovenste twee rijen.' },
  morse: { max: 14, terug: 'morse', hulp: { naam: 'De morsetabel', lijst: () => ABC_LIJST.map((l) => [l, MORSE[l].replaceAll('.', '·').replaceAll('-', '–')]) },
    hint: () => 'Een spatie staat tussen de letters, een / tussen de woorden. Lees met de morseboom: bij een punt ga je naar links, bij een streep naar rechts.' },
  semafoor: { max: 12, tekens: true, hulp: { naam: 'De sleutel', tekens: 'semafoor' },
    hint: () => 'Kijk naar de armen: elke stand van de twee armen is een letter.' },
  rooster: { max: 18, hint: () => 'Leg in gedachten het sjabloon op het rooster. Lees de letters die in de gaten vallen, van links naar rechts en van boven naar beneden.' },
};

/** How a code is cut into pieces to compare, for Zet in code; `letters` and `tekens` are one character a piece. */
export const STUKKEN = {
  letters: (t) => [...letters(t)],
  tekens: (t) => [...kaal(t)].filter((x) => /[A-Z0-9]/.test(x)),
  sms: (t) => t.replace(/[^0-9]+/g, ' ').replace(/(\d)(?!\1)(?=\d)/g, '$1 ').trim().split(/\s+/).filter(Boolean),
  paren: (t) => t.replace(/\D/g, '').match(/\d{1,2}/g) ?? [],
  bacon: (t) => t.toUpperCase().replace(/[^AB]/g, '').match(/[AB]{1,5}/g) ?? [],
  binair: (t) => t.replace(/[^01]/g, '').match(/[01]{1,8}/g) ?? [],
  morse: (t) => t.replace(/[·•*]/g, '.').replace(/[–—_−]/g, '-').split(/[\s/]+/).filter(Boolean),
};

/** The letters of an answer to Kraak de code, to compare with the sentence: J is I in Polybius, no filling at the end. */
export function antwoordLetters(id, tekst, lengte) {
  let l = [...letters(tekst)];
  if (id === 'polybius') l = l.map((x) => (x === 'J' ? 'I' : x));
  if (OPGAVEN[id]?.opvulling && lengte != null) while (l.length > lengte && l.at(-1) === 'X') l = l.slice(0, -1);
  return l;
}

/** The sentences a code can take. */
export function zinnenVoor(id) {
  const o = OPGAVEN[id];
  return o.woord ? WOORDEN_ALLE : ZINNEN_ALLE.filter((z) => letters(z).length <= o.max);
}

/**
 * A new message for a code: { zin, s (the keys), geheim (the code; for the rooster the letters, ../kraak.js makes the
 * square) }. Not the sentence of `vorige`; `kort`: at most 16 letters, for Zet in code.
 */
export function nieuweOpgave(id, vorige, kort) {
  const o = OPGAVEN[id];
  const c = CODES[id];
  // the tekenalfabetten draw the letters, and the roostercode hides them in a square: their code is the letters
  const codeer = (zin, s) => (c?.codeer ? c.codeer(zin, s) : letters(zin));
  const alle = zinnenVoor(id);
  const korte = alle.filter((z) => letters(z).length <= 16);
  const lijst = kort && korte.length > 3 ? korte : alle;
  for (let p = 0; p < 80; p++) {
    const zin = willekeurig(lijst);
    if (zin === vorige?.zin) continue;
    const s = { ...(c ? standaardSleutels(c) : {}), ...Object.fromEntries(Object.entries(o.sleutels ?? {}).map(([k, v]) => [k, willekeurig(v)])) };
    if (o.past && !o.past(zin, s)) continue;
    return { zin, s, geheim: codeer(zin, s) };
  }
  const s = c ? standaardSleutels(c) : {};
  return { zin: lijst[0], s, geheim: codeer(lijst[0], s) };
}

/** The woordwaarde of a word: the letters as A=1 to Z=26, added up. */
export const woordwaarde = (w) => [...letters(w)].reduce((s, l) => s + ABC.indexOf(l) + 1, 0);

/**
 * Line up an answer with what is right (two lists of pieces), with as few changes as possible: which pieces of the
 * answer are wrong or too many (`fout`, by place), and how many are missing before a place (`mist`; the place after
 * the last for the end). `aantal`: all of them together.
 */
export function vergelijk(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  const fout = new Set();
  const mist = new Map();
  let [i, j] = [a.length, b.length];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
      if (a[i - 1] !== b[j - 1]) fout.add(i - 1);
      i--; j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) { fout.add(i - 1); i--; }
    else { mist.set(i, (mist.get(i) ?? 0) + 1); j--; }
  }
  return { fout, mist, aantal: fout.size + [...mist.values()].reduce((s, n) => s + n, 0) };
}
