// The codes behind the pieces, without a page: morse, the verschuivingscode, A=1 and the spelalfabet. Kept apart
// from the pieces so the Codeermachine and the Seinspeler (src/oefenen.js) can use them too, and so they can be
// tried in node.

/** Morse after ITU-R M.1677-1, as notities/technieken/navigatie-en-seinen.md §4a has it: the letters and cijfers. */
export const MORSE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--',
  N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.', 0: '-----',
};

/** SOS is one sign, without the room between the letters (blad morse). */
export const SOS = '...---...';

/** Capitals without accents: é is E. The ij stays two letters. */
export const kaal = (tekst) => tekst.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

/** A morse code as the bladen write it: a dot ·, a dash –. */
export const symbolen = (code) => code.replaceAll('.', '·').replaceAll('-', '–');

/** Text in morse: words, each a list of { teken, code }, and the characters morse has no sign for here. */
export function naarMorse(tekst) {
  const zonder = new Set();
  const woorden = kaal(tekst).split(/\s+/).map((woord) => [...woord].flatMap((t) => {
    if (MORSE[t]) return [{ teken: t, code: MORSE[t] }];
    zonder.add(t);
    return [];
  })).filter((w) => w.length);
  return { woorden, zonder: [...zonder] };
}

/** Morse as one line of text: the letters apart, a / between the words. */
export const morseTekst = (woorden) => woorden.map((w) => w.map((l) => symbolen(l.code)).join(' ')).join(' / ');

/**
 * When the tone is on, in seconds from the start: [{ van, tot, teken }], `teken` counting the letters over all
 * words. A dot is one unit, a dash three; between the parts of a letter one, between letters three, between
 * words seven (ITU). At `wpm` words a minute a unit is 1.2 / wpm seconds ("PARIS" is 50 units).
 */
export function morseTijdlijn(woorden, wpm) {
  const eenheid = 1.2 / wpm;
  const stukken = [];
  let t = 0;
  let nr = 0;
  woorden.forEach((woord, wi) => woord.forEach((letter, li) => {
    [...letter.code].forEach((s, si) => {
      if (stukken.length) t += eenheid * (si ? 1 : li ? 3 : 7);
      const duur = eenheid * (s === '.' ? 1 : 3);
      stukken.push({ van: t, tot: t + duur, teken: nr });
      t += duur;
    });
    nr++;
  }));
  return stukken;
}

// -- the verschuivingscode: every letter n places on, Z goes round to A

const ALFABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const letterOp = (i) => ALFABET[((i % 26) + 26) % 26];

/** Shift every letter n places (back with a negative n); capitals stay capitals, the rest stays as it is. */
export function verschuif(tekst, n) {
  return [...tekst].map((ch) => {
    const k = kaal(ch);
    const i = ALFABET.indexOf(k);
    if (k.length !== 1 || i < 0) return ch;
    const uit = letterOp(i + n);
    return ch === ch.toLowerCase() ? uit.toLowerCase() : uit;
  }).join('');
}

// -- A=1: the place of the letter in the alphabet, with a streepje between the numbers of one word

/** Text in numbers: SCOUT is 19-3-15-21-20, words apart with a space. Cijfers cannot be written in it. */
export function naarGetallen(tekst) {
  const zonder = new Set();
  let uit = '';
  let vorigeGetal = false;
  for (const ch of tekst) {
    const k = kaal(ch);
    const i = k.length === 1 ? ALFABET.indexOf(k) : -1;
    if (i >= 0) { uit += (vorigeGetal ? '-' : '') + (i + 1); vorigeGetal = true; }
    else if (/\d/.test(ch)) zonder.add(ch);
    else { uit += /\s/.test(ch) ? ' ' : ch; vorigeGetal = false; }
  }
  return { tekst: uit.replace(/ +/g, ' '), zonder: [...zonder] };
}

/** Numbers back to letters: a streepje between letters, a space or / between words; what is not 1 to 26 is a ?. */
export function vanGetallen(code) {
  return code.replace(/\d+/g, (g) => (Number(g) >= 1 && Number(g) <= 26 ? ALFABET[g - 1].toLowerCase() : '?'))
    .replace(/(?<=[a-z?])\s*[-–]\s*(?=[a-z?])/g, '')
    .replace(/\s*\/\s*/g, ' ');
}

// -- the spelalfabet (blad spelalfabet): NAVO, with what the Dutch hulpdiensten (C2000) write instead

export const SPELALFABET = {
  A: 'Alfa', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo', F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett',
  K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar', P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango',
  U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu',
};
export const C2000 = { J: 'Juliet', W: 'Whisky' };

/** A word from the alphabet, as someone might type it: both spellings count, X-ray with or without the streepje. */
export const isSpelwoord = (letter, invoer) => {
  const plat = (w) => kaal(w).replace(/[^A-Z]/g, '');
  return [SPELALFABET[letter], C2000[letter]].some((w) => w && plat(w) === plat(invoer));
};

// -- for the raadspelletjes

/** Short sentences to send to each other on a camp: only letters and spaces, so every code can write them. */
export const ZINNEN = [
  'Om acht uur bij het kampvuur', 'Zoek de schat bij de grote eik', 'Neem je kompas mee', 'Volg de pijlen naar het bos',
  'Het wachtwoord is bosuil', 'Verzamelen bij de vlaggenmast', 'Morgen gaan we op hike', 'De leiding slaapt nog',
  'Vanavond is er een dropping', 'Pak je slaapzak in', 'Wie kan er een mastworp', 'Na de lunch gaan we pionieren',
];

/** Short words to listen to in morse. */
export const WOORDEN = ['TENT', 'VUUR', 'BOS', 'KAMP', 'TOUW', 'KNOOP', 'HIKE', 'BEVER', 'WELP', 'KAART', 'SPOOR', 'FLUIT', 'VLAG', 'TOCHT', 'EIK', 'MAST'];

export const willekeurig = (lijst) => lijst[Math.floor(Math.random() * lijst.length)];
