// The tekenalfabetten of the geheimschriften: each letter becomes a small drawing. Rozenkruisers (pigpen),
// blokjesgeheimschrift and braille, as SVG elements in a box of 40 x 40 (no <svg> around them), so that the
// drawings (src/plaatjes/geheimschrift.js) and the Codeermachine draw them the same. Classes (gt-*) are in
// src/plaatjes/geheimschrift.css, which the app always loads.

const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const MAAT = 40;

const lijn = (punten) => `<polyline points="${punten.map((p) => p.join(',')).join(' ')}" class="gt-lijn"/>`;
const stip = (x, y, r = 3.4) => `<circle cx="${x}" cy="${y}" r="${r}" class="gt-stip"/>`;

/** The piece of a #-rooster around cell (r, c): only the sides it shares with another cell are drawn. */
function hokje(r, c) {
  const [a, b] = [7, 33];
  let uit = '';
  if (r > 0) uit += lijn([[a, a], [b, a]]);
  if (r < 2) uit += lijn([[a, b], [b, b]]);
  if (c > 0) uit += lijn([[a, a], [a, b]]);
  if (c < 2) uit += lijn([[b, a], [b, b]]);
  return uit;
}

/** The piece of an X around one of its four corners, and where its dot goes. */
const KRUIS = {
  boven: { vorm: [[6, 9], [20, 31], [34, 9]], stip: [20, 15] },
  links: { vorm: [[9, 6], [31, 20], [9, 34]], stip: [15, 20] },
  rechts: { vorm: [[31, 6], [9, 20], [31, 34]], stip: [25, 20] },
  onder: { vorm: [[6, 31], [20, 9], [34, 31]], stip: [20, 25] },
};
const KRUIS_PLEK = ['boven', 'links', 'rechts', 'onder'];

/** Rozenkruisers: A-I in a # without a dot, J-R with one, S-V in an X, W-Z in an X with a dot. */
function rozenkruisers(letter) {
  const i = ABC.indexOf(letter);
  if (i < 0) return '';
  if (i < 18) {
    const j = i % 9;
    return hokje(Math.floor(j / 3), j % 3) + (i >= 9 ? stip(20, 20) : '');
  }
  const k = KRUIS[KRUIS_PLEK[(i - 18) % 4]];
  return lijn(k.vorm) + (i >= 22 ? stip(...k.stip) : '');
}

/** Blokjesgeheimschrift: ABC in the first box, DEF in the second, ...; no dot is the first letter, one the second, two the third. */
function blokjes(letter) {
  const i = ABC.indexOf(letter);
  if (i < 0) return '';
  const vak = Math.floor(i / 3);
  const stippen = i % 3;
  return hokje(Math.floor(vak / 3), vak % 3) + (stippen === 1 ? stip(20, 20) : stippen === 2 ? stip(14.5, 20) + stip(25.5, 20) : '');
}

/** Braille: the dots 1-2-3 down the left, 4-5-6 down the right. */
export const BRAILLE = {
  A: '1', B: '12', C: '14', D: '145', E: '15', F: '124', G: '1245', H: '125', I: '24', J: '245', K: '13', L: '123', M: '134',
  N: '1345', O: '135', P: '1234', Q: '12345', R: '1235', S: '234', T: '2345', U: '136', V: '1236', W: '2456', X: '1346', Y: '13456', Z: '1356',
};
const PUNT = { 1: [14, 8], 2: [14, 20], 3: [14, 32], 4: [26, 8], 5: [26, 20], 6: [26, 32] };
function braille(letter) {
  const op = BRAILLE[letter];
  if (!op) return '';
  return Object.entries(PUNT).map(([n, [x, y]]) => (op.includes(n) ? stip(x, y, 4.2) : `<circle cx="${x}" cy="${y}" r="3.2" class="gt-leeg"/>`)).join('');
}

/** The tekenalfabetten by name: naam, and teken(letter) for the drawing of one letter. */
export const TEKENSCHRIFT = {
  rozenkruisers: { naam: 'Rozenkruisersgeheimschrift', teken: rozenkruisers },
  blokjes: { naam: 'Blokjesgeheimschrift', teken: blokjes },
  braille: { naam: 'Braille', teken: braille },
};

/** One letter as its own little <svg>, `maat` px. */
export const tekenSvg = (soort, letter, maat = MAAT, label = letter) =>
  `<svg class="gt-teken" viewBox="0 0 ${MAAT} ${MAAT}" width="${maat}" height="${maat}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${TEKENSCHRIFT[soort].teken(letter)}</svg>`;
