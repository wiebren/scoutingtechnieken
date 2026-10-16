// Drawings for geheimschrift. See ../plaatjes.js and ./basis.js. The letters of the tekenalfabetten are drawn by
// ../doe/seinen/lib/tekens.js, so the Codeermachine draws them the same.
import { pol, r1, svg, tekst } from './basis.js';
import { BRAILLE, TEKENSCHRIFT } from '../doe/seinen/lib/tekens.js';

const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const plaats = (inhoud, x, y, s = 1) => `<g transform="translate(${x} ${y})${s !== 1 ? ` scale(${s})` : ''}">${inhoud}</g>`;

/** The key of the Rozenkruisers: two # with A-I and J-R (with a dot), two X with S-V and W-Z (with a dot). */
function rozenkruisersSleutel() {
  const rooster = (x, y, letters, stip) => {
    const c = 34;
    let uit = `<path d="M${x + c} ${y} V${y + 3 * c} M${x + 2 * c} ${y} V${y + 3 * c} M${x} ${y + c} H${x + 3 * c} M${x} ${y + 2 * c} H${x + 3 * c}" class="gt-lijn"/>`;
    [...letters].forEach((l, i) => {
      const [cx, cy] = [x + (i % 3) * c + c / 2, y + Math.floor(i / 3) * c + c / 2];
      uit += tekst(cx - (stip ? 6 : 0), cy + 5, l, { maat: 14, klasse: 'vet' }) + (stip ? `<circle cx="${cx + 7}" cy="${cy}" r="3" class="gt-stip"/>` : '');
    });
    return uit;
  };
  const kruis = (x, y, letters, stip) => {
    const s = 96;
    const m = [x + s / 2, y + s / 2];
    let uit = `<path d="M${x} ${y} L${x + s} ${y + s} M${x + s} ${y} L${x} ${y + s}" class="gt-lijn"/>`;
    const plek = [[m[0], y + 20], [x + 20, m[1]], [x + s - 20, m[1]], [m[0], y + s - 20]];
    [...letters].forEach((l, i) => {
      const [cx, cy] = plek[i];
      const verticaal = i === 0 || i === 3;
      uit += tekst(cx - (stip && verticaal ? 6 : 0), cy + 5 - (stip && !verticaal ? 7 : 0), l, { maat: 14, klasse: 'vet' })
        + (stip ? `<circle cx="${cx + (verticaal ? 7 : 0)}" cy="${cy + (verticaal ? 0 : 8)}" r="3" class="gt-stip"/>` : '');
    });
    return uit;
  };
  const voorbeeld = [...'SCOUT'].map((l, i) => plaats(TEKENSCHRIFT.rozenkruisers.teken(l), 96 + i * 36, 262, 0.8)).join('');
  return svg(360, 300, 'De sleutel van het Rozenkruisersgeheimschrift: A tot I en J tot R met een stip in twee vierkante roosters, S tot V en W tot Z met een stip in twee kruisen. Daaronder het woord SCOUT',
    rooster(20, 14, 'ABCDEFGHI', false) + rooster(190, 14, 'JKLMNOPQR', true) + kruis(24, 138, 'STUV', false) + kruis(194, 138, 'WXYZ', true)
    + tekst(48, 284, 'SCOUT', { maat: 14, klasse: 'vet' }) + voorbeeld);
}

/** Blokjesgeheimschrift: nine boxes with three letters each; the dots say which of the three. */
function blokjesSleutel() {
  const c = 62;
  const [x, y] = [14, 14];
  let uit = `<path d="M${x + c} ${y} V${y + 3 * c} M${x + 2 * c} ${y} V${y + 3 * c} M${x} ${y + c} H${x + 3 * c} M${x} ${y + 2 * c} H${x + 3 * c}" class="gt-lijn"/>`;
  for (let v = 0; v < 9; v++) {
    const drie = ABC.slice(v * 3, v * 3 + 3);
    uit += tekst(x + (v % 3) * c + c / 2, y + Math.floor(v / 3) * c + c / 2 + 6, drie, { maat: 15, klasse: 'vet' });
  }
  const [vx, vy] = [222, 24];
  uit += tekst(vx, vy, 'M, N en O:', { maat: 12, anker: 'start' });
  [...'MNO'].forEach((l, i) => { uit += plaats(TEKENSCHRIFT.blokjes.teken(l), vx + i * 44, vy + 10) + tekst(vx + i * 44 + 20, vy + 66, l, { maat: 13, klasse: 'vet' }); });
  uit += tekst(vx, vy + 96, 'geen stip: 1e letter', { maat: 11.5, anker: 'start', klasse: 'stil' }) + tekst(vx, vy + 112, 'één stip: 2e letter', { maat: 11.5, anker: 'start', klasse: 'stil' })
    + tekst(vx, vy + 128, 'twee stippen: 3e', { maat: 11.5, anker: 'start', klasse: 'stil' });
  return svg(360, 212, 'De sleutel van het blokjesgeheimschrift: ABC in het eerste vakje, DEF in het tweede, tot YZ in het negende. Geen stip is de eerste letter van het vakje, één stip de tweede, twee stippen de derde', uit);
}

function brailleAlfabet() {
  const [kol, w, h] = [7, 50, 66];
  let uit = '';
  [...ABC].forEach((l, i) => {
    const x = (i % kol) * w + 6;
    const y = Math.floor(i / kol) * h + 4;
    uit += plaats(TEKENSCHRIFT.braille.teken(l), x, y) + tekst(x + 20, y + 56, l, { maat: 13, klasse: 'vet' });
  });
  return svg(kol * w + 6, Math.ceil(26 / kol) * h + 4, `Het braillealfabet: ${[...ABC].map((l) => `${l} punt ${BRAILLE[l].split('').join(' ')}`).join(', ')}`, uit);
}

function polybiusVierkant() {
  const c = 40;
  const [x, y] = [64, 30];
  const letters = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
  let uit = '';
  for (let i = 0; i < 5; i++) {
    uit += tekst(x + i * c + c / 2, y - 8, String(i + 1), { maat: 13, klasse: 'vet accent-tekst' });
    uit += tekst(x - 14, y + i * c + c / 2 + 5, String(i + 1), { maat: 13, klasse: 'vet accent-tekst' });
  }
  [...letters].forEach((l, i) => {
    const [cx, cy] = [x + (i % 5) * c, y + Math.floor(i / 5) * c];
    uit += `<rect x="${cx}" y="${cy}" width="${c}" height="${c}" class="${l === 'S' ? 'accent-licht' : 'vlak'}"/><rect x="${cx}" y="${cy}" width="${c}" height="${c}" class="lijn dun"/>`;
    uit += tekst(cx + c / 2, cy + c / 2 + 5, l === 'I' ? 'I/J' : l, { maat: l === 'I' ? 12 : 15, klasse: 'vet' });
  });
  uit += tekst(x + 5 * c + 12, y + 3 * c + c / 2 + 5, '← S = 43', { maat: 12, anker: 'start', klasse: 'stil' });
  return svg(360, y + 5 * c + 10, 'Het vierkant van Polybius: vijf rijen en vijf kolommen. Een letter is zijn rij en dan zijn kolom; S is 43. I en J delen een vakje', uit);
}

/** Scytale: a strip wound round a stick, written along the stick; unwound, the letters are mixed up. */
function scytale() {
  const woord = 'KOMMORGENOM';
  let uit = `<rect x="20" y="30" width="250" height="44" rx="10" class="sc-stok"/>`;
  for (let i = 0; i < 9; i++) uit += `<path d="M${36 + i * 26} 28 l20 48" class="sc-strook"/>`;
  [...'KOMMORGEN'].forEach((l, i) => { uit += tekst(46 + i * 26, 56, l, { maat: 13, klasse: 'vet' }); });
  uit += tekst(290, 56, '→', { maat: 16, klasse: 'stil' });
  uit += tekst(20, 100, 'Afgewikkeld staan de letters door elkaar:', { maat: 11.5, anker: 'start', klasse: 'stil' });
  const los = 'K·?·O·?·M·?·M·?·O';
  [...los.replace(/·/g, '')].forEach((l, i) => {
    uit += `<rect x="${20 + i * 34}" y="110" width="30" height="24" rx="2" class="vlak2"/>` + tekst(35 + i * 34, 127, l === '?' ? '…' : l, { maat: 13, klasse: l === '?' ? 'stil' : 'vet' });
  });
  return svg(330, 144, `Een scytale: een strook papier om een stok gewonden, de boodschap in de lengte van de stok geschreven (${woord.slice(0, 9)}). Afgewikkeld staan tussen de letters van de boodschap de letters van de volgende rijen`, uit);
}

/** Zigzagcode over three rows. */
function zigzag() {
  const tekstje = 'OPHIKEMORGEN';
  const r = [0, 1, 2, 1];
  let lijn = '';
  let letters = '';
  [...tekstje].forEach((l, i) => {
    const [x, y] = [24 + i * 28, 22 + r[i % 4] * 30];
    lijn += `${i ? 'L' : 'M'}${x} ${y} `;
    letters += `<circle cx="${x}" cy="${y}" r="11" class="vlak"/><circle cx="${x}" cy="${y}" r="11" class="lijn dun"/>` + tekst(x, y + 5, l, { maat: 13, klasse: 'vet' });
  });
  const rijen = [0, 1, 2].map((k) => [...tekstje].filter((_, i) => r[i % 4] === k).join(''));
  const uit = `<path d="${lijn}" class="lijn stil"/>${letters}`
    + tekst(24, 122, `Rij voor rij: ${rijen.join(' ')}`, { maat: 13, anker: 'start', klasse: 'vet' });
  return svg(360, 132, `De zigzagcode met drie rijen: OP HIKE MORGEN zigzag over drie rijen geschreven, en rij voor rij gelezen: ${rijen.join(' ')}`, uit);
}

/** A shopping list that hides KAMP: the number says which letter of the word to take. */
function boodschappenlijstje() {
  const regels = [['1', 'krentenbol', 0], ['2', 'tandpasta', 1], ['3', 'tomaten', 2], ['4', 'soepstengels', 3]];
  let uit = `<rect x="40" y="8" width="210" height="156" rx="4" class="bl-papier"/>`;
  uit += tekst(58, 34, 'Boodschappen', { maat: 14, anker: 'start', klasse: 'vet' });
  regels.forEach(([n, woord, k], i) => {
    const y = 64 + i * 26;
    const voor = woord.slice(0, k);
    uit += `<text x="58" y="${y}" class="tekst" font-size="14">${n} ${voor}<tspan class="accent-tekst vet">${woord[k]}</tspan>${woord.slice(k + 1)}</text>`;
  });
  uit += tekst(274, 90, '→ KAMP', { maat: 15, anker: 'start', klasse: 'vet accent-tekst' });
  return svg(360, 172, 'Een boodschappenlijstje met een geheime boodschap: 1 krentenbol, 2 tandpasta, 3 tomaten, 4 soepstengels. Het getal zegt welke letter je neemt: K, A, M, P. Er staat KAMP', uit);
}

/** The meetlat: on every centimetre a letter of the message, the rest is filling. */
function meetlat() {
  const geheim = 'ZOEKBIJEIK';
  const vulsel = 'RQTAXLWNSPU';
  const cm = 30;
  let uit = `<rect x="20" y="56" width="${10 * cm + 10}" height="34" rx="3" class="ml-lat"/>`;
  for (let i = 0; i <= 50; i++) {
    const x = 25 + (i * cm) / 5;
    uit += `<line x1="${x}" y1="56" x2="${x}" y2="${56 + (i % 5 ? 8 : 16)}" class="lijn dun"/>`;
    if (i % 5 === 0) uit += tekst(x, 86, String(i / 5), { maat: 10, klasse: 'ml-getal' });
  }
  for (let i = 0; i <= 20; i++) {
    const opCm = i % 2 === 0 && i > 0;
    uit += tekst(25 + (i * cm) / 2, 44, opCm ? geheim[i / 2 - 1] : vulsel[Math.floor(i / 2)], { maat: 14, klasse: opCm ? 'vet accent-tekst' : 'stil' });
  }
  uit += tekst(20, 114, 'Op elke centimeter: ZOEK BIJ EIK', { maat: 13, anker: 'start', klasse: 'vet' });
  return svg(360, 124, 'De meetlat: een rij letters langs een liniaal. Alleen de letters op de centimeterstreepjes tellen: ZOEK BIJ EIK', uit);
}

/** Quipu: digits as knots, read from the top: 0 a halve knoop, 1 an achtknoop, 2-9 a long knot with that many turns. */
function quipu() {
  const cijfers = [['0', 0], ['2', 2], ['1', 1], ['5', 5], ['1', 1], ['9', 9]];
  let uit = `<line x1="20" y1="30" x2="340" y2="30" class="qu-koord dik"/>`;
  const knoop = (x, y, n) => {
    if (n === 0) return `<circle cx="${x}" cy="${y}" r="6" class="qu-knoop"/>`;
    if (n === 1) return `<path d="M${x} ${y - 10} C ${x + 10} ${y - 6}, ${x - 10} ${y + 6}, ${x} ${y + 10} C ${x + 10} ${y + 6}, ${x - 10} ${y - 6}, ${x} ${y - 10}" class="qu-acht"/>`;
    let s = '';
    for (let k = 0; k < n; k++) s += `<ellipse cx="${x}" cy="${y - (n - 1) * 3 + k * 6}" rx="6.5" ry="3" class="qu-knoop"/>`;
    return s;
  };
  cijfers.forEach(([c, n], i) => {
    const x = 56 + Math.floor(i / 2) * 104 + (i % 2) * 0;
    const y = i % 2 === 0 ? 66 : 112;
    if (i % 2 === 0) uit += `<line x1="${x}" y1="30" x2="${x}" y2="150" class="qu-koord"/>`;
    uit += knoop(x, y, n) + tekst(x + 26, y + 5, c, { maat: 14, anker: 'start', klasse: 'vet' });
  });
  ['B (02)', 'O (15)', 'S (19)'].forEach((l, i) => { uit += tekst(56 + i * 104, 170, l, { maat: 12, klasse: 'vet accent-tekst' }); });
  return svg(360, 180, 'Een quipu: aan een koord hangen draden met knopen. Elke draad is een letter als getal (A is 01): 0 is een halve knoop, 1 een achtknoop, 2 tot 9 een lange knoop met evenveel slagen als het cijfer. Hier staat BOS: 02, 15, 19', uit);
}

/** The codeschijf, standing still at a verschuiving of 3. */
function codeschijf(n = 3) {
  const [c, rb, ro] = [180, 150, 112];
  let uit = `<circle cx="${c}" cy="${c}" r="${rb + 20}" class="vlak2"/><circle cx="${c}" cy="${c}" r="${rb + 20}" class="lijn"/>`
    + `<circle cx="${c}" cy="${c}" r="${ro + 18}" class="vlak"/><circle cx="${c}" cy="${c}" r="${ro + 18}" class="lijn"/>`;
  [...ABC].forEach((l, i) => {
    const g = (i * 360) / 26;
    const [x, y] = pol(c, c, rb, g);
    const [xi, yi] = pol(c, c, ro, g);
    uit += `<text x="${x}" y="${y}" class="tekst vet" font-size="16" text-anchor="middle" dominant-baseline="central">${l}</text>`;
    uit += `<text x="${xi}" y="${yi}" class="tekst vet blauw-tekst" font-size="15" text-anchor="middle" dominant-baseline="central">${ABC[(i + n) % 26]}</text>`;
    const [a, b] = [pol(c, c, ro + 18, g + 180 / 26), pol(c, c, rb + 20, g + 180 / 26)];
    uit += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="lijn haar"/>`;
  });
  uit += `<circle cx="${c}" cy="${c}" r="5" class="vol"/>` + tekst(c, c + 30, `A wordt ${ABC[n]}`, { maat: 13, klasse: 'stil' });
  return svg(360, 360, `Een codeschijf: twee schijven met het alfabet. De binnenste is ${n} plaatsen gedraaid, dus A wordt ${ABC[n]}`, uit);
}

/** Spiegelschrift: a word written backwards, and in the mirror it reads right. */
function spiegelschrift() {
  const uit = `<text x="90" y="62" class="tekst vet" font-size="30" text-anchor="middle" transform="translate(180 0) scale(-1 1)">KOM HIER</text>`
    + `<rect x="178" y="14" width="6" height="70" rx="2" class="sp-spiegel"/>`
    + `<text x="270" y="62" class="tekst vet" font-size="30" text-anchor="middle">KOM HIER</text>`
    + tekst(90, 104, 'op papier', { maat: 12, klasse: 'stil' }) + tekst(270, 104, 'in de spiegel', { maat: 12, klasse: 'stil' });
  return svg(360, 112, 'Spiegelschrift: links staat KOM HIER gespiegeld op papier, rechts zie je het in de spiegel gewoon staan', uit);
}

/** The boekcode: 12-4-3 is bladzijde 12, regel 4, woord 3. */
function boekcode() {
  // the words of each line as widths; on line 4 the third word is the one
  const regels = [[30, 22, 40, 18, 26], [24, 34, 16, 30, 28], [36, 20, 26, 22, 30], [22, 28, 0, 18, 24], [30, 18, 34, 26, 20], [26, 32, 20, 36]];
  let uit = '<path d="M20 14 Q100 6 178 16 L178 170 Q100 160 20 168Z" class="vlak2"/><path d="M182 16 Q260 6 340 14 L340 168 Q260 160 182 170Z" class="vlak2"/>'
    + '<path d="M20 14 Q100 6 178 16 L178 170 Q100 160 20 168Z M182 16 Q260 6 340 14 L340 168 Q260 160 182 170Z" class="lijn"/>';
  regels.forEach((woorden, r) => {
    const y = 38 + r * 20;
    let x = 36;
    uit += tekst(28, y + 4, String(r + 1), { maat: 9, klasse: 'stil' });
    woorden.forEach((b, w) => {
      if (r === 3 && w === 2) {
        uit += `<rect x="${x - 3}" y="${y - 10}" width="44" height="18" rx="4" class="accent-licht"/>` + tekst(x + 19, y + 4, 'schat', { maat: 12, klasse: 'vet' });
        x += 46;
      } else {
        uit += `<line x1="${x}" y1="${y}" x2="${r1(x + b * 0.7)}" y2="${y}" class="lijn dik stil bk-woord"/>`;
        x = r1(x + b * 0.7 + 6);
      }
    });
  });
  for (let r = 0; r < 6; r++) uit += `<line x1="198" y1="${38 + r * 20}" x2="${320 - (r % 3) * 14}" y2="${38 + r * 20}" class="lijn dik stil bk-woord"/>`;
  uit += tekst(100, 160, '12', { maat: 11, klasse: 'vet' }) + tekst(260, 160, '13', { maat: 11, klasse: 'vet' });
  uit += tekst(20, 194, '12-4-3: bladzijde 12, regel 4, woord 3', { maat: 12.5, anker: 'start', klasse: 'vet' });
  return svg(360, 202, 'De boekcode: 12-4-3 wijst naar bladzijde 12, regel 4, het derde woord. Hier is dat het woord schat', uit);
}

export default {
  spiegelschrift,
  'rozenkruisers-sleutel': rozenkruisersSleutel,
  'blokjes-sleutel': blokjesSleutel,
  'braille-alfabet': brailleAlfabet,
  'polybius-vierkant': polybiusVierkant,
  scytale,
  'zigzagcode': zigzag,
  boodschappenlijstje,
  meetlat,
  quipu,
  codeschijf: () => codeschijf(3),
  boekcode,
};

