// Drawings for kamperen. See ../plaatjes.js and ./basis.js. Our own drawings, after the facts in the notes
// (notities/technieken/touw-kamp-natuur.md §3 and kamperen-uitwerking.md); the colours of tent cloth, grass, water
// and wood are in ./kamperen.css.
import { r1, svg, tekst } from './basis.js';

// -- small pieces the drawings share

/**
 * A label with a thin line to what it names: text at (tx, ty), dot at (px, py). The line starts at the side of the
 * text nearest to the dot; the text has a halo in the colour of the card, so lines may cross it.
 */
const wijs = (tx, ty, t, px, py, anker = 'start') => {
  const breed = t.length * 6.1;
  const x0 = anker === 'start' ? tx : anker === 'end' ? tx - breed : tx - breed / 2;
  const x1 = x0 + breed;
  const [lx, ly] = px < x0 ? [x0 - 3, ty - 4] : px > x1 ? [x1 + 3, ty - 4] : [px, py > ty ? ty + 3 : ty - 12];
  return `<path d="M${r1(lx)} ${r1(ly)}L${px} ${py}" class="lijn haar"/><circle cx="${px}" cy="${py}" r="1.8" class="vol"/>${tekst(tx, ty, t, { anker, maat: 11, klasse: 'kp-halo' })}`;
};
/** The ground: a strip of grass from x1 to x2 with its top at y. */
const grond = (x1, x2, y, diep = 14) =>
  `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="${diep}" class="kp-gras"/><path d="M${x1} ${y}H${x2}" class="lijn"/>`;
/** A tent peg in the ground at (x, y), its head leaning `graden` away from upright (positive: the head to the right). */
const haring = (x, y, graden = 0, lang = 14) => {
  const rad = (graden * Math.PI) / 180;
  const [dx, dy] = [Math.sin(rad) * lang, Math.cos(rad) * lang];
  return `<path d="M${r1(x + dx * 0.35)} ${r1(y - dy * 0.35)}L${r1(x - dx * 0.65)} ${r1(y + dy * 0.65)}" class="kp-haring"/>`;
};
/** A guy line from (x1, y1) to a peg at (x2, y2). */
const scheerlijn = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" class="kp-touw"/>`;
/** A tree seen from the side: trunk from the ground at (x, y), crown around (x, y - h). */
const boom = (x, y, h = 120, r = 34) =>
  `<path d="M${x} ${y}V${y - h + r * 0.6}" class="kp-stam"/><circle cx="${x}" cy="${y - h}" r="${r}" class="kp-kruin"/>`;
/** A wind arrow from (x, y), `lang` long, pointing right (or left when lang < 0). */
const wind = (x, y, lang, t = 'wind') => {
  const kop = lang > 0 ? -7 : 7;
  return `<path d="M${x} ${y}h${lang}m${kop} -5l${-kop} 5l${kop} 5" class="kp-wind"/>${tekst(x + lang / 2, y - 6, t, { maat: 10, klasse: 'blauw-tekst' })}`;
};

// -- tents

/** A patrol tent from the front: two walls, a roof, the pole in the doorway, guy lines. */
function patrouilletent() {
  let uit = grond(0, 340, 180);
  uit += scheerlijn(78, 112, 18, 182) + scheerlijn(262, 112, 322, 182) + haring(18, 182, -35) + haring(322, 182, 35);
  uit += scheerlijn(120, 76, 48, 182) + scheerlijn(220, 76, 292, 182) + haring(48, 182, -35) + haring(292, 182, 35);
  uit += '<path d="M78 112L170 40L262 112Z" class="kp-doek2"/>';
  uit += '<path d="M78 112H262V180H78Z" class="kp-doek"/>';
  uit += '<path d="M150 112L170 64L190 112V180H150Z" class="kp-binnen"/>';
  uit += '<path d="M170 40V180" class="kp-paal"/>';
  uit += wijs(196, 24, 'nok', 172, 40);
  uit += wijs(128, 30, 'staander', 170, 60, 'end');
  uit += wijs(264, 66, 'dak', 236, 92);
  uit += wijs(282, 150, 'wand', 254, 152);
  uit += wijs(6, 98, 'scheerlijn', 50, 140);
  uit += wijs(6, 206, 'haring', 18, 186);
  uit += wijs(120, 206, 'deur', 158, 170, 'end');
  return svg(340, 214, 'Een patrouilletent van voren: dak, wanden, staander in de deur, scheerlijnen en haringen', uit);
}

/** A boat tent on a vlet, from the side: from the bow up to the mast, then along the sail on the boom to the stern;
 *  sandbags along the edge, and at anchor. */
function dektent() {
  let uit = '<path d="M28 116 Q160 140 312 122 L304 158 Q170 166 46 160Z" class="vol"/>';
  uit += '<path d="M28 116 Q160 140 312 122" class="lijn"/>';
  uit += '<path d="M110 22 L30 116" class="lijn dun"/>';
  uit += '<path d="M34 118 L110 68 H298 L308 122 Q160 138 34 118Z" class="kp-doek2"/>';
  uit += '<path d="M110 68 H298" class="lijn"/><path d="M110 18 V68" class="kp-paal"/>';
  for (const x of [70, 120, 170, 220, 270]) {
    const t = (308 - x) / 274; // along the lower edge of the cloth, from the stern
    const y = (1 - t) ** 2 * 122 + 2 * t * (1 - t) * 138 + t ** 2 * 118;
    uit += `<rect x="${x - 6}" y="${Math.round(y - 4)}" width="12" height="8" rx="3" class="vol-licht"/>`;
  }
  uit += '<path d="M30 120 Q16 140 6 176" class="lijn dun stil"/>';
  uit += '<rect x="0" y="150" width="340" height="50" class="kp-water"/><path d="M0 150 Q40 144 80 150 T160 150 T240 150 T340 150" class="kp-water-lijn"/>';
  return svg(340, 200, 'Een dektent op een vlet, van opzij: het doek loopt van de boeg naar de mast en dan over het opgedoekte grootzeil naar achter, met zandzakjes langs de rand; de boot ligt voor anker', uit);
}

/** A bell tent: round, one pole in the middle, low walls, guy lines all around. */
function belltent() {
  let uit = grond(0, 340, 178);
  for (const [x1, x2] of [[70, 14], [104, 52], [236, 288], [270, 326]]) uit += scheerlijn(x1, 118, x2, 180) + haring(x2, 180, x2 < 170 ? -35 : 35);
  uit += '<path d="M70 118L170 34L270 118Z" class="kp-doek2"/>';
  uit += '<path d="M70 118Q170 128 270 118V178Q170 186 70 178Z" class="kp-doek"/>';
  uit += '<path d="M170 30V112" class="kp-paal"/>';
  uit += '<path d="M146 178V128Q170 92 194 128V178Z" class="kp-binnen"/>';
  uit += wijs(192, 22, 'één paal in het midden', 172, 48);
  uit += wijs(282, 152, 'lage wand', 256, 150);
  uit += wijs(6, 72, 'scheerlijnen rondom', 44, 130);
  return svg(340, 206, 'Een bell-tent: rond, met één paal in het midden, lage wanden en scheerlijnen rondom', uit);
}

/** A dome tent: two poles crossing over the top; it stands by itself. */
function koepeltent() {
  let uit = grond(0, 340, 172);
  uit += scheerlijn(82, 118, 30, 174) + scheerlijn(258, 118, 310, 174) + haring(30, 174, -35) + haring(310, 174, 35);
  uit += '<path d="M56 172C64 60 276 60 284 172Z" class="kp-doek"/>';
  uit += '<path d="M56 172C90 74 220 50 262 160" class="kp-stok"/><path d="M78 160C120 50 250 74 284 172" class="kp-stok"/>';
  uit += '<path d="M142 172V128Q170 96 198 128V172Z" class="kp-binnen"/>';
  uit += wijs(200, 28, 'twee stokken kruisen', 170, 90);
  uit += wijs(6, 84, 'scheerlijn', 62, 140);
  uit += wijs(298, 124, 'apsis', 266, 150);
  return svg(340, 200, 'Een koepeltent: twee stokken die elkaar bovenop kruisen; de tent staat vanzelf', uit);
}

/** A tunnel tent from the side: hoops in a row, pulled taut at both ends. */
function tunneltent() {
  let uit = grond(0, 340, 170);
  uit += scheerlijn(46, 160, 12, 172) + scheerlijn(66, 128, 18, 172) + haring(12, 172, -35) + haring(18, 172, -35);
  uit += scheerlijn(300, 160, 330, 172) + scheerlijn(284, 132, 324, 172) + haring(330, 172, 35) + haring(324, 172, 35);
  uit += '<path d="M40 170C52 96 96 70 150 66C208 62 256 82 300 170Z" class="kp-doek"/>';
  for (const [x, top] of [[96, 80], [158, 66], [228, 80]]) uit += `<path d="M${x} 170V${top}" class="kp-stok"/>`;
  uit += '<path d="M54 170C60 140 72 118 86 104V170Z" class="kp-binnen"/>';
  uit += wijs(180, 34, 'bogen naast elkaar', 158, 70);
  uit += wijs(334, 198, 'aan beide kanten strak afspannen', 306, 156, 'end');
  return svg(340, 206, 'Een tunneltent van opzij: bogen naast elkaar, aan beide uiteinden strak afgespannen', uit);
}

/** A small light tent with a rucksack beside it, for size. */
function trekkerstent() {
  let uit = grond(0, 340, 160);
  uit += scheerlijn(60, 160, 34, 162) + scheerlijn(108, 98, 40, 162) + haring(34, 162, -35) + haring(40, 162, -35);
  uit += '<path d="M60 160C80 120 100 96 116 92C170 90 230 120 268 160Z" class="kp-doek"/>';
  uit += '<path d="M116 92V160" class="kp-stok"/>';
  uit += '<path d="M282 160V112Q282 102 292 102H310Q320 102 320 112V160Z" class="kp-rugzak"/><path d="M286 124H316" class="lijn dun"/>';
  uit += wijs(132, 40, 'één of twee stokken', 116, 94);
  uit += wijs(180, 194, 'laag, klein en licht', 190, 132, 'middle');
  uit += tekst(301, 184, 'rugzak', { maat: 10, klasse: 'stil' });
  return svg(340, 206, 'Een kleine lichte trekkerstent, met een rugzak ernaast om de maat te zien', uit);
}

/** A party tent: a steel frame with a roof, no walls, every leg anchored. */
function partytent() {
  let uit = grond(0, 340, 170);
  uit += '<path d="M60 70L170 30L280 70Z" class="kp-doek2"/><path d="M60 70H280V84H60Z" class="kp-doek"/>';
  for (const x of [66, 128, 212, 274]) uit += `<path d="M${x} 84V170" class="kp-frame"/>`;
  uit += scheerlijn(60, 76, 14, 172) + scheerlijn(280, 76, 326, 172) + haring(14, 172, -35) + haring(326, 172, 35);
  uit += '<rect x="56" y="156" width="20" height="14" rx="2" class="kp-gewicht"/><rect x="264" y="156" width="20" height="14" rx="2" class="kp-gewicht"/>';
  uit += wijs(196, 22, 'dak op een stalen frame', 188, 42);
  uit += wijs(90, 198, 'elke poot vast: haringen of gewichten', 70, 160);
  return svg(340, 206, 'Een partytent: een dak op een stalen frame, met elke poot vastgezet', uit);
}

/** The parts of a double-skinned dome tent, from the front. */
function tentOnderdelen() {
  let uit = grond(0, 360, 200);
  uit += scheerlijn(86, 120, 30, 202) + haring(30, 202, -35);
  uit += '<path d="M70 200C76 70 250 50 300 120L330 200Z" class="kp-doek"/>';
  uit += '<path d="M96 196C104 100 214 92 238 196Z" class="kp-binnen"/>';
  uit += '<path d="M90 198H244" class="kp-grondzeil"/>';
  uit += '<path d="M70 200C90 80 240 64 258 186" class="kp-stok"/>';
  uit += '<path d="M150 74q14 -10 28 0" class="lijn dun"/>';
  uit += '<rect x="56" y="150" width="7" height="12" rx="2" class="vol" transform="rotate(34 59 156)"/>';
  uit += tekst(167, 166, 'binnentent', { maat: 11, klasse: 'kp-halo' });
  uit += wijs(190, 24, 'ventilatie', 164, 68);
  uit += wijs(262, 52, 'buitentent', 240, 84);
  uit += wijs(6, 60, 'stok', 105, 130);
  uit += wijs(250, 226, 'grondzeil', 220, 198);
  uit += wijs(322, 140, 'apsis', 290, 170);
  uit += wijs(6, 226, 'haring', 28, 205);
  uit += wijs(6, 132, 'lijnspanner', 58, 154);
  uit += wijs(110, 226, 'luchtspleet', 90, 162, 'end');
  return svg(360, 236, 'De delen van een koepeltent: buitentent, binnentent, stok, grondzeil, apsis, ventilatie, scheerlijn met lijnspanner en haring', uit);
}

/** Four kinds of tent pegs, side by side, with the ground they suit. */
function haringen() {
  let uit = '';
  const soorten = [
    [40, 'pen', 'M34 30h12M40 30V170', 'harde grond'],
    [116, 'hoekharing', 'M104 30h22M110 30V160L116 170L122 160V30', 'gras, heide'],
    [196, 'Y-haring', 'M182 30h28M188 30V162L196 170L204 162V30M196 30V162', 'bijna overal'],
    [276, 'zandharing', 'M258 30h36M262 30V150L276 170L290 150V30', 'zand, sneeuw'],
  ];
  for (const [x, naam, d, grond] of soorten) {
    uit += `<path d="${d}" class="kp-haring-groot"/>`;
    uit += tekst(x, 192, naam, { maat: 11, klasse: 'vet' }) + tekst(x, 208, grond, { maat: 10, klasse: 'stil' });
  }
  return svg(320, 218, 'Vier soorten haringen: een pen voor harde grond, een hoekharing voor gras en heide, een Y-haring voor bijna overal en een brede zandharing voor zand en sneeuw', uit);
}

/**
 * A guy line and its peg: the peg slants with its head away from the tent, square to the line. The line here is a
 * long, low one (about 20 degrees), so the peg leans about 20 degrees too; with a 45-degree line it would lean 45.
 */
function scheerlijnHaring() {
  let uit = grond(0, 340, 150, 60);
  uit += '<path d="M0 150V50Q70 50 110 150Z" class="kp-doek"/>';
  uit += '<path d="M62 78L262 150" class="kp-touw dik"/>';
  uit += '<rect x="166" y="110" width="18" height="9" rx="2" class="vol" transform="rotate(20 175 114)"/>';
  // the peg, square to the line: its axis is (0.339, -0.941), the line runs along (0.941, 0.339)
  uit += '<path d="M266.1 138.7L248.4 187.6" class="kp-haring-groot"/>';
  uit += '<path d="M252.6 146.6L256 137.2L265.4 140.6" class="lijn dun"/>';
  uit += tekst(240, 128, '90°', { maat: 11, anker: 'end', klasse: 'vet kp-halo' });
  uit += wijs(120, 36, 'scheerlijn in het verlengde van de naad', 100, 92);
  uit += wijs(130, 140, 'lijnspanner', 172, 116, 'end');
  uit += wijs(334, 110, 'kop van de tent af', 266, 140, 'end');
  uit += tekst(334, 204, 'lijn haaks op de haring', { maat: 10, anker: 'end', klasse: 'kp-halo' });
  return svg(340, 210, 'Een scheerlijn met lijnspanner naar een haring die schuin in de grond staat, met de kop van de tent af, zo dat de lijn er haaks op staat', uit);
}

/** A vendel tent from the side: a long roof on two tall poles, loose walls, guy lines. */
function vendeltent() {
  let uit = grond(0, 340, 170);
  uit += scheerlijn(40, 96, 10, 172) + haring(10, 172, -35) + scheerlijn(300, 96, 330, 172) + haring(330, 172, 35);
  uit += '<path d="M40 96L110 40H230L300 96Z" class="kp-doek2"/>';
  uit += '<path d="M40 96H300V170H40Z" class="kp-doek"/>';
  uit += '<path d="M40 104H300" class="lijn dun"/>';
  uit += '<path d="M150 170V128Q170 112 190 128V170Z" class="kp-binnen"/>';
  uit += '<path d="M110 36V170M230 36V170" class="kp-paal"/>';
  uit += wijs(130, 22, 'hoge middenpalen', 110, 46, 'end');
  uit += wijs(250, 22, 'los dak', 266, 70);
  uit += wijs(6, 120, 'losse wanden', 62, 140);
  uit += '<path d="M40 190H300m-6 -4l6 4l-6 4M40 190m6 -4l-6 4l6 4" class="lijn dun"/>';
  uit += tekst(170, 204, '5 tot 12 meter lang, zo’n 5 meter breed', { maat: 10, klasse: 'stil' });
  return svg(340, 210, 'Een vendeltent van opzij: een los dak op hoge middenpalen, losse wanden en scheerlijnen, 5 tot 12 meter lang', uit);
}

/** Taking a peg out: hook a second peg through its eye and pull along the peg, not on the line. */
function haringEruit() {
  let uit = grond(0, 340, 120, 60);
  // the peg in the ground, head to the right, leaning 25 degrees
  uit += '<path d="M196 104L172 160" class="kp-haring-groot"/><circle cx="198" cy="99" r="5" class="lijn"/>';
  // the slack guy line to the tent at the left, crossed out
  uit += '<path d="M194 102Q120 124 20 70" class="kp-touw"/>';
  uit += '<path d="M96 100l12 12m0 -12l-12 12" class="kp-kruis"/>';
  uit += tekst(102, 136, 'niet aan de lijn trekken', { maat: 10, klasse: 'kp-halo' });
  // the second peg through the eye, and the pull along the axis of the first
  uit += '<path d="M176 92L222 104" class="kp-haring-groot"/>';
  uit += '<path d="M206 82L222 46m-9 4l9 -4l2 10" class="kp-pijl"/>';
  uit += wijs(334, 40, 'trek in de richting van de haring', 216, 62, 'end');
  uit += wijs(334, 150, 'tweede haring door het oog', 220, 103, 'end');
  return svg(340, 180, 'Een haring eruit halen: haak een tweede haring door het oog en trek in de richting van de haring, niet aan de scheerlijn', uit);
}

/** Airing a tent: doors and vents open so the wind blows through, the sleeping bag outside on a line. */
function tentLuchten() {
  let uit = grond(0, 340, 170);
  uit += '<path d="M30 170C38 66 200 66 208 170Z" class="kp-doek"/>';
  uit += '<path d="M70 170V122Q119 84 168 122V170Z" class="kp-binnen"/>';
  uit += '<path d="M70 122Q119 84 168 122" class="lijn dik"/>';
  uit += '<path d="M106 82q13 -8 26 0" class="lijn"/>';
  for (const y of [132, 152]) uit += `<path d="M0 ${y}H226m-7 -5l7 5l-7 5" class="kp-wind"/>`;
  uit += '<path d="M119 76v-24m-5 6l5 -6l5 6" class="kp-wind"/>';
  uit += '<path d="M244 64H336" class="kp-touw"/><path d="M244 60V170M336 60V170" class="kp-paal"/>';
  uit += '<path d="M262 64H318V124Q290 132 262 124Z" class="kp-slaapzak"/>';
  uit += wijs(40, 30, 'ventilatie open', 124, 60);
  uit += wijs(6, 196, 'deuren open: de wind waait erdoor', 60, 150);
  uit += wijs(334, 40, 'slaapzak buiten luchten', 300, 90, 'end');
  return svg(340, 206, 'Een tent luchten: de deuren en de ventilatie open, zodat de wind erdoor waait, en de slaapzak buiten aan een lijn', uit);
}

/** Tent care: hang the tent loosely to dry, and count what goes in the bag. */
function tentDrogen() {
  let uit = '<path d="M10 180H330" class="lijn"/>';
  uit += '<path d="M20 40H230" class="kp-touw dik"/><path d="M20 36V180M230 36V180" class="kp-paal"/>';
  uit += '<path d="M44 40H206L198 150Q162 140 125 152Q88 140 52 150Z" class="kp-doek"/>';
  uit += '<path d="M80 40L76 146M125 40V150M170 40L174 146" class="lijn dun"/>';
  for (const [x, y] of [[70, 162], [130, 166], [186, 160]]) uit += `<path d="M${x} ${y}q-3 5 0 7q3 -2 0 -7z" class="kp-druppel"/>`;
  uit += '<rect x="262" y="120" width="56" height="60" rx="8" class="kp-rugzak"/>';
  for (const x of [272, 280, 288]) uit += `<path d="M${x} 116V96" class="kp-haring"/>`;
  uit += '<path d="M298 118V84M306 118V88" class="kp-stok"/>';
  uit += wijs(125, 22, 'losjes ophangen tot hij echt droog is', 125, 70, 'middle');
  uit += wijs(334, 200, 'tellen: stokken, haringen, lijnen', 290, 170, 'end');
  return svg(340, 210, 'Tentonderhoud: het tentdoek losjes over een lijn tot het helemaal droog is, en de tentzak met haringen en stokken nageteld', uit);
}

/**
 * The plan of a frietbuil: a sheet of 3 × 3 m with the lines to tape (thick), the top B, the three pegs A, and the
 * two corner flaps that fold in as groundsheet. Dotted: the extra tape for a door (cut from B to C, hang up C).
 * 60 px is 1 m. The sheet in 3D is the piece `frietbuil-3d`.
 */
function frietbuil() {
  const [x0, y0, m] = [70, 34, 60];
  const p = (u, v) => [x0 + u * m, y0 + (3 - v) * m];          // u to the right, v up, in metres from B
  const [B, A1, A2, A3, C] = [p(0, 0), p(3, 3), p(0, 2), p(2, 0), p(1, 1)];
  const pad = (...pt) => `M${pt.map(([x, y]) => `${x} ${y}`).join('L')}`;
  /** A dimension line from (x1, y1) to (x2, y2) with end ticks, and its text at (tx, ty). */
  const maat = (x1, y1, x2, y2, t, tx, ty, anker = 'middle') => {
    const [dx, dy] = x1 === x2 ? [4, 0] : [0, 4];
    return `<path d="M${x1} ${y1}L${x2} ${y2}M${x1 - dx} ${y1 - dy}L${x1 + dx} ${y1 + dy}M${x2 - dx} ${y2 - dy}L${x2 + dx} ${y2 + dy}" class="lijn dun stil"/>${tekst(tx, ty, t, { anker, klasse: 'stil' })}`;
  };
  const letter = ([x, y], t) => `<circle cx="${x}" cy="${y}" r="8.5" class="kp-letter"/>${tekst(x, y + 4, t, { klasse: 'vet' })}`;
  let uit = '';
  // the sheet: the part that becomes the roof, and the two flaps that become the groundsheet
  uit += `<path d="${pad(B, A3, A1, A2)}Z" class="kp-folie"/>`;
  uit += `<path d="${pad(A2, p(0, 3), A1)}Z" class="kp-folie-flap"/><path d="${pad(A3, p(3, 0), A1)}Z" class="kp-folie-flap"/>`;
  uit += `<path d="${pad(p(0, 0), p(3, 0), p(3, 3), p(0, 3))}Z" class="lijn dun" />`;
  uit += tekst(124, 57, 'grondzeil', { klasse: 'kp-op-folie vet' });
  uit += tekst(229, 166, 'grond-', { klasse: 'kp-op-folie vet' }) + tekst(229, 179, 'zeil', { klasse: 'kp-op-folie vet' });
  // the dotted line for a door between the two side points, then the tape
  uit += `<path d="${pad(A2, A3)}" class="kp-stippel"/>`;
  uit += `<path d="${pad(A2, B, A3, A1, A2)}M${B[0]} ${B[1]}L${A1[0]} ${A1[1]}" class="kp-tape"/>`;
  // dimensions
  uit += maat(70, 18, 250, 18, '3 m', 160, 13);
  uit += maat(282, 34, 282, 214, '3 m', 288, 128, 'start');
  uit += maat(42, 34, 42, 94, '1 m', 28, 68);
  uit += maat(190, 246, 250, 246, '1 m', 220, 260);
  // the points
  uit += `<circle cx="${B[0]}" cy="${B[1]}" r="3.5" class="kp-punt"/><circle cx="${A1[0]}" cy="${A1[1]}" r="3.5" class="kp-punt"/>`;
  uit += `<circle cx="${A2[0]}" cy="${A2[1]}" r="3.5" class="kp-punt"/><circle cx="${A3[0]}" cy="${A3[1]}" r="3.5" class="kp-punt"/>`;
  uit += letter([57, 227], 'B') + letter([263, 22], 'A') + letter([57, 94], 'A') + letter([190, 228], 'A') + letter(C, 'C');
  // legend
  uit += '<path d="M14 284H40" class="kp-tape"/>' + tekst(46, 288, 'plakband', { anker: 'start' });
  uit += '<path d="M128 284H154" class="kp-stippel donker"/>' + tekst(160, 288, 'extra plakband voor een deur', { anker: 'start' });
  uit += tekst(14, 308, 'B top, aan een touw omhoog · A haring in de grond', { anker: 'start', klasse: 'stil' });
  return svg(340, 318, 'Plattegrond van een frietbuil: een vierkant plastic van 3 bij 3 meter. B is de hoek linksonder, de top. Er zijn drie punten A: de hoek rechtsboven, een punt op de linkerrand 1 meter onder de hoek, en een punt op de onderrand 1 meter van de hoek. Plakband van B naar elke A en van de hoek A naar de twee andere A’s. Een stippellijn tussen de twee zijpunten A is extra plakband als je een deur wilt; waar die de diagonaal kruist, ligt C. De twee hoekdriehoeken buiten het plakband zijn het grondzeil', uit);
}

/** Warm in your sleeping bag: hat, dry clothes, the bag shaken up, a good mat between you and the cold ground. */
function warmSlapen() {
  let uit = grond(0, 340, 150, 40);
  uit += '<path d="M34 144Q34 104 74 104H292Q318 104 318 126V144Z" class="kp-slaapzak"/>';
  uit += '<path d="M28 144H324V152H28Z" class="kp-mat"/>';
  uit += '<circle cx="74" cy="122" r="12" class="kp-slaper"/><path d="M62 118Q74 98 86 118Z" class="kp-muts"/>';
  for (const x of [110, 170, 230]) uit += `<path d="M${x} 158v20m-5 -6l5 6l5 -6" class="kp-koude"/>`;
  uit += wijs(6, 40, 'muts op', 70, 106);
  uit += wijs(120, 40, 'droge slaapkleren en sokken', 130, 112);
  uit += wijs(334, 80, 'slaapzak opgeschud', 260, 112, 'end');
  uit += wijs(6, 194, 'goed matje', 40, 150);
  uit += tekst(334, 194, 'de koude grond trekt warmte weg', { maat: 10, anker: 'end', klasse: 'blauw-tekst kp-halo' });
  return svg(340, 204, 'Warm slapen: een muts op, droge slaapkleren, de slaapzak opgeschud, en een goed matje tussen jou en de koude grond', uit);
}

/** A waste point: separate bags in a frame, off the ground, closed. */
function afvalpunt() {
  let uit = '<path d="M10 190H330" class="lijn"/>';
  uit += '<path d="M24 190V60M316 190V60M20 60H320M24 150H316" class="kp-paal"/>';
  const zakken = [[56, 'plastic en blik'], [128, 'papier'], [200, 'glas'], [272, 'rest']];
  for (const [x, t] of zakken) {
    uit += `<path d="M${x - 24} 64H${x + 24}L${x + 28} 144Q${x} 150 ${x - 28} 144Z" class="kp-zak"/><path d="M${x - 6} 64l6 -8l6 8" class="lijn"/>`;
    t.split(' en ').forEach((regel, i, alle) => { uit += tekst(x, 110 + (i - (alle.length - 1) / 2) * 13, i ? `en ${regel}` : regel, { maat: 10, klasse: 'kp-halo' }); });
  }
  uit += wijs(170, 22, 'zakken dicht', 134, 58, 'middle');
  uit += tekst(170, 172, 'van de grond: een vos of wild zwijn kan er niet bij', { maat: 10, klasse: 'stil' });
  return svg(340, 200, 'Een afvalpunt op kamp: aparte zakken voor plastic en blik, papier, glas en restafval, dicht en van de grond', uit);
}

/** Protecting a tree: jute between the bark and the rope. */
function boomJute() {
  let uit = grond(0, 340, 190);
  uit += '<path d="M150 190V20M190 20V190" class="lijn"/><rect x="150" y="20" width="40" height="170" class="kp-schors"/>';
  uit += '<rect x="144" y="88" width="52" height="44" rx="4" class="kp-jute"/>';
  for (const y of [98, 108, 118]) uit += `<path d="M144 ${y}H196" class="kp-touw dik"/>`;
  uit += '<path d="M196 108L330 128" class="kp-touw dik"/>';
  uit += wijs(6, 70, 'jute rond de stam', 146, 96);
  uit += wijs(334, 150, 'touw over de jute', 260, 117, 'end');
  uit += tekst(334, 176, 'nooit touw direct op de schors', { maat: 10, anker: 'end', klasse: 'stil kp-halo' });
  return svg(340, 210, 'Een boom beschermen: een lap jute rond de stam, en het touw over de jute heen', uit);
}

/** A camping post from above: three small tents within 10 metres of the post. */
function kampeerpaal() {
  let uit = '<rect x="4" y="4" width="332" height="212" rx="8" class="kp-gras"/>';
  uit += '<circle cx="150" cy="110" r="90" class="kp-cirkel"/>';
  uit += '<circle cx="150" cy="110" r="6" class="kp-paalkop"/>';
  uit += '<path d="M150 110H240" class="lijn dun"/>' + tekst(195, 104, '10 m', { maat: 10, klasse: 'vet kp-halo' });
  for (const [x, y, r] of [[110, 70, -20], [190, 150, 15], [96, 150, 40]]) uit += `<rect x="${x - 15}" y="${y - 10}" width="30" height="20" rx="4" class="kp-vak" transform="rotate(${r} ${x} ${y})"/>`;
  uit += tekst(150, 132, 'paal', { maat: 10, klasse: 'stil kp-halo' });
  uit += tekst(326, 40, 'hoogstens 3 tentjes', { maat: 11, anker: 'end', klasse: 'vet kp-halo' });
  uit += tekst(326, 58, 'binnen 10 m van de paal', { maat: 10, anker: 'end', klasse: 'stil kp-halo' });
  uit += tekst(326, 176, 'geen vuur, geen wc', { maat: 10, anker: 'end', klasse: 'stil kp-halo' });
  uit += tekst(326, 192, 'vaak hoogstens 72 uur', { maat: 10, anker: 'end', klasse: 'stil kp-halo' });
  return svg(340, 220, 'Een paalkampeerplek van boven: hoogstens drie kleine tentjes binnen 10 meter van de paal', uit);
}

// -- shelters

/** Three ways to put up a tarp. */
function tarpOpstellingen() {
  let uit = '';
  // A-frame from the front, looking along the ridge line: the pole (or tree) behind, the tarp over the line,
  // sloping down on both sides
  uit += '<path d="M6 120H114" class="lijn"/><path d="M60 24V120" class="kp-paal"/>';
  uit += '<path d="M60 36L20 118H100Z" class="kp-zeil"/><circle cx="60" cy="36" r="2.5" class="vol"/>';
  uit += tekst(60, 142, 'A-frame', { maat: 11, klasse: 'vet' });
  // lean-to from the side: one edge high, the other low into the wind
  uit += '<path d="M124 120H232" class="lijn"/><path d="M212 30V120" class="kp-paal"/><path d="M130 118L212 40" class="kp-zeil-lijn"/>';
  uit += '<path d="M212 36L230 120" class="kp-touw"/>';
  uit += '<path d="M128 70h22m-6 -4l6 4l-6 4" class="kp-wind"/>';
  uit += tekst(176, 142, 'afdak', { maat: 11, klasse: 'vet' });
  // diamond / kite: one corner high, the opposite one low into the wind
  uit += '<path d="M240 120H346" class="lijn"/><path d="M330 30V120" class="kp-paal"/>';
  uit += '<path d="M328 36L272 74L252 118L318 110Z" class="kp-zeil"/>';
  uit += '<path d="M240 98h12m-6 -4l6 4l-6 4" class="kp-wind"/>';
  uit += tekst(296, 142, 'vlieger', { maat: 11, klasse: 'vet' });
  return svg(352, 152, 'Drie tarpopstellingen: A-frame, afdak en vlieger', uit);
}

/** A lean-to from the side: a cross pole, sticks and leaves sloping down into the wind, the fire on the open side. */
function afdak() {
  let uit = grond(0, 340, 170);
  uit += boom(84, 170, 130, 30);
  uit += '<path d="M90 88L232 170H210L92 102Z" class="kp-bladdek"/>';
  for (const d of [0, 8, 16]) uit += `<path d="M90 92L${222 - d} 170" class="kp-tak"/>`;
  uit += '<circle cx="90" cy="92" r="6" class="kp-paalkop"/>';
  uit += '<path d="M22 166l10 -16l10 16z" class="kp-vlam"/><path d="M14 168h36" class="kp-tak"/>';
  uit += wind(320, 104, -54, 'wind');
  uit += wijs(124, 44, 'dwarspaal tussen twee bomen', 92, 86);
  uit += wijs(334, 196, 'takken en blad, de rug in de wind', 196, 150, 'end');
  uit += wijs(6, 196, 'vuur aan de open kant', 32, 168);
  return svg(340, 206, 'Een afdak van opzij: takken en blad schuin van een dwarspaal naar de grond, met de rug in de wind en de open kant naar het vuur', uit);
}

/** An A-frame shelter: a ridge pole from a fork to the ground, sticks on both sides. */
function aFrame() {
  let uit = grond(0, 340, 170);
  uit += '<path d="M56 170L82 84M108 170L82 84" class="kp-paal"/><path d="M82 84L300 170" class="kp-paal"/>';
  for (let i = 1; i < 9; i++) {
    const x = 82 + i * 24; const y = 84 + (i * 24 * 86) / 218;
    const breed = 30 * (1 - i / 10);
    uit += `<path d="M${r1(x)} ${r1(y)}L${r1(x - breed)} 170M${r1(x)} ${r1(y)}L${r1(x + breed * 0.4)} 170" class="kp-tak"/>`;
  }
  uit += wijs(110, 40, 'nokpaal op een bok', 84, 86);
  uit += wijs(334, 196, 'takken aan twee kanten, dan blad erover', 200, 150, 'end');
  return svg(340, 206, 'Een A-frame-shelter: een nokpaal van een bok naar de grond, met takken aan beide kanten', uit);
}

/** A debris hut in cross-section: a narrow frame under a thick layer of leaves. */
function bladhut() {
  let uit = grond(0, 340, 176, 24);
  uit += '<path d="M40 176Q170 -10 300 176Z" class="kp-bladdek"/>';
  // leaves inside the heap, not in the frame
  for (let x = 58; x < 290; x += 17) {
    for (let y = 30; y < 170; y += 15) {
      const t = (x - 40) / 260; const boven = (1 - t) ** 2 * 176 + 2 * t * (1 - t) * -10 + t ** 2 * 176;
      const jx = x + ((y * 7) % 9) - 4;
      if (y < boven + 8 || Math.abs(jx - 170) < ((y - 98) * 52) / 78 + 10) continue;
      uit += `<ellipse cx="${jx}" cy="${y}" rx="5" ry="2.5" transform="rotate(${(x * 3 + y * 7) % 180} ${jx} ${y})" class="kp-blaadje"/>`;
    }
  }
  uit += '<path d="M118 176L170 98L222 176" class="kp-tak dik"/>';
  uit += '<path d="M126 176L170 110L214 176Z" class="kp-binnen"/>';
  uit += '<path d="M134 170Q170 160 206 170V176H134Z" class="kp-blaadje"/>';
  uit += '<ellipse cx="170" cy="158" rx="22" ry="8" class="kp-slaper"/>';
  uit += wijs(252, 34, 'dikke laag blad', 236, 96);
  uit += wijs(6, 34, 'smal frame van takken', 150, 128);
  uit += wijs(300, 214, 'ook blad onder je', 190, 172, 'end');
  return svg(340, 222, 'Een bladhut in doorsnede: een smal frame onder een dikke laag blad, met ook blad onder de slaper', uit);
}

/** A hammock between two trees, with wide straps and a tarp above. */
function hangmat() {
  let uit = grond(0, 340, 180);
  uit += boom(40, 180, 150, 30) + boom(300, 180, 150, 30);
  uit += '<path d="M40 40H300" class="kp-touw"/>';
  uit += '<path d="M96 40H244L262 62H78Z" class="kp-zeil-licht"/><path d="M78 62L44 68M262 62L296 68" class="kp-touw"/>';
  uit += '<rect x="34" y="70" width="12" height="9" class="kp-band"/><rect x="294" y="70" width="12" height="9" class="kp-band"/>';
  uit += '<path d="M46 75L96 104Q170 150 244 104L294 75" class="kp-touw dik"/>';
  uit += '<path d="M96 104Q170 150 244 104Q170 124 96 104Z" class="kp-zeil"/>';
  uit += '<path d="M46 75H86" class="lijn haar"/><path d="M76 75a30 30 0 0 1 -1.4 6" class="lijn dun"/>';
  uit += tekst(52, 106, 'zo’n 30°', { maat: 10, anker: 'start', klasse: 'kp-halo' });
  uit += wijs(170, 24, 'tarp boven de hangmat', 170, 50, 'middle');
  uit += wijs(6, 212, 'brede boomband', 40, 80);
  return svg(340, 220, 'Een hangmat tussen twee bomen met brede boombanden, onder een tarp', uit);
}

/** A sleeping bag on a mat inside a waterproof bivvy bag, outside without a tent. */
function bivakzak() {
  let uit = grond(0, 340, 140, 30);
  uit += '<path d="M30 140Q30 104 70 104H290Q316 104 316 128V140Z" class="kp-zeil"/>';
  uit += '<path d="M44 136Q44 112 74 112H282Q302 112 302 128V136Z" class="kp-slaapzak"/>';
  uit += '<path d="M28 140H318V146H28Z" class="kp-mat"/>';
  uit += '<circle cx="76" cy="122" r="11" class="kp-slaper"/>';
  uit += wijs(334, 40, 'bivakzak: waterdicht, ademend', 250, 104, 'end');
  uit += wijs(36, 70, 'slaapzak', 120, 116);
  uit += wijs(220, 190, 'matje', 200, 145, 'end');
  return svg(340, 200, 'Slapen in een bivakzak: de slaapzak op een matje in een waterdichte hoes', uit);
}

// -- sleeping

/** The temperature labels of a sleeping bag, on a scale (an example bag). */
function slaapzakTemperatuur() {
  const x = (t) => r1(30 + (20 - t) * 9);        // 20 °C at the left, -12 °C at the right
  let uit = `<rect x="${x(20)}" y="60" width="${x(5) - x(20)}" height="26" class="kp-warm"/>`;
  uit += `<rect x="${x(5)}" y="60" width="${x(0) - x(5)}" height="26" class="kp-koel"/>`;
  uit += `<rect x="${x(0)}" y="60" width="${x(-12) - x(0)}" height="26" class="kp-koud"/>`;
  uit += `<rect x="${x(20)}" y="60" width="${x(-12) - x(20)}" height="26" class="lijn"/>`;
  for (let t = 20; t >= -12; t -= 2) uit += `<path d="M${x(t)} 86v${t % 10 ? 4 : 8}" class="lijn dun"/>`;
  for (const t of [20, 10, 0, -10]) uit += tekst(x(t), 108, `${t} °C`, { maat: 10, klasse: 'stil' });
  uit += `<path d="M${x(5)} 40V60" class="lijn"/>${tekst(x(5), 34, 'comfort 5 °C', { maat: 11, klasse: 'vet' })}`;
  uit += `<path d="M${x(0)} 46V60" class="lijn"/>${tekst(x(0) + 4, 42, 'limiet 0 °C', { maat: 11, anker: 'start', klasse: 'vet' })}`;
  uit += tekst(x(12.5), 78, 'lekker warm', { maat: 10 });
  uit += tekst(x(-6), 78, 'te koud', { maat: 10 });
  uit += tekst(170, 132, 'Voorbeeld: een slaapzak met comfort 5 °C en limiet 0 °C.', { maat: 10, klasse: 'stil' });
  return svg(340, 142, 'De temperaturen op een slaapzak: tot de comforttemperatuur is het warm, tussen comfort en limiet koud, onder de limiet te koud', uit);
}

/** Three layers of clothing, from the skin out. */
function laagjes() {
  let uit = '';
  const lagen = [
    [30, 'kp-laag3', 'buitenlaag', 'houdt wind en regen tegen'],
    [62, 'kp-laag2', 'tussenlaag', 'houdt warmte vast (fleece, wol)'],
    [94, 'kp-laag1', 'basislaag', 'voert zweet af (wol, synthetisch)'],
  ];
  for (const [inzet, klasse] of lagen) {
    const d = inzet / 2;
    uit += `<path d="M${40 + d} ${34 + d}L${84 + d / 2} ${20 + d}H${156 - d / 2}L${200 - d} ${34 + d}L${226 - d * 1.4} ${84 + d / 3}L${200 - d} ${96}V${190 - d / 4}H${40 + d}V96L${14 + d * 1.4} ${84 + d / 3}Z" class="${klasse}"/>`;
  }
  lagen.forEach(([, , naam, wat], i) => {
    const y = 60 + i * 50;
    uit += `<path d="M${180 - i * 22} ${y + 18}H246" class="lijn haar"/>`;
    uit += tekst(250, y + 14, naam, { maat: 12, anker: 'start', klasse: 'vet' }) + tekst(250, y + 30, wat, { maat: 10, anker: 'start', klasse: 'stil' });
  });
  return svg(420, 200, 'Drie laagjes kleding: een basislaag die zweet afvoert, een tussenlaag die warmte vasthoudt en een buitenlaag tegen wind en regen', uit);
}

/** A rucksack from the side, with where things go. */
function rugzakZones() {
  let uit = '<path d="M110 30Q110 18 124 18H186Q204 18 206 34L214 200Q214 214 200 214H118Q104 214 104 200Z" class="kp-rugzak"/>';
  uit += '<path d="M98 40Q86 120 98 206" class="kp-band-lijn"/>';
  uit += '<path d="M108 58H210M106 150H212" class="lijn dun"/><path d="M110 36H204" class="lijn dun"/>';
  uit += '<rect x="112" y="64" width="40" height="80" rx="6" class="kp-zwaar"/>';
  uit += tekst(132, 100, 'zwaar', { maat: 11, klasse: 'vet' });
  uit += '<circle cx="132" cy="118" r="5" class="lijn"/><path d="M127 118h10M132 113v10" class="lijn dun"/>';
  uit += wijs(226, 30, 'deksel: kaart, kompas, snack', 190, 28);
  uit += wijs(226, 70, 'bovenin: regenjas, EHBO-set', 196, 50);
  uit += wijs(226, 112, 'midden: zwaar tegen je rug,', 152, 100);
  uit += tekst(226, 128, 'tussen je schouderbladen', { maat: 11, anker: 'start' });
  uit += wijs(226, 182, 'onderin: slaapzak', 190, 182);
  uit += tekst(70, 120, 'rug', { maat: 11, klasse: 'stil' });
  return svg(420, 226, 'Een rugzak van opzij: onderin de slaapzak, zwaar in het midden tegen je rug, bovenin de regenjas en de EHBO-set, in het deksel kleine spullen', uit);
}

// -- the camp site

/** An example plan of a camp site, from above. */
function kampplattegrond() {
  let uit = '<rect x="4" y="4" width="352" height="252" rx="8" class="kp-gras"/><rect x="4" y="4" width="352" height="252" rx="8" class="lijn"/>';
  uit += '<path d="M4 226Q120 210 200 230T356 222V256H4Z" class="kp-water"/>' + tekst(300, 246, 'beek', { maat: 10, klasse: 'blauw-tekst' });
  uit += '<path d="M4 120H60Q90 120 90 150V226" class="kp-pad"/>' + tekst(24, 114, 'pad', { maat: 10, klasse: 'stil' });
  for (const [cx, cy] of [[300, 40], [330, 70], [270, 30]]) uit += `<circle cx="${cx}" cy="${cy}" r="18" class="kp-kruin"/>`;
  const vak = (x, y, w, hh, t, klasse = 'kp-vak') => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="4" class="${klasse}"/>${tekst(x + w / 2, y + hh / 2 + 4, t, { maat: 10 })}`;
  uit += vak(110, 24, 46, 30, 'tent') + vak(166, 24, 46, 30, 'tent') + vak(222, 64, 46, 30, 'tent');
  uit += vak(110, 96, 70, 40, 'keuken', 'kp-vak2');
  uit += vak(196, 128, 50, 26, 'afwas', 'kp-vak2');
  uit += '<circle cx="152" cy="178" r="14" class="kp-vuur"/>' + tekst(152, 204, 'vuur', { maat: 10 });
  uit += vak(18, 30, 52, 28, 'HUDO', 'kp-vak3');
  uit += vak(18, 160, 54, 28, 'afval', 'kp-vak3');
  uit += '<circle cx="116" cy="160" r="6" class="blauw"/>' + tekst(116, 150, 'kraan', { maat: 10, klasse: 'blauw-tekst' });
  uit += vak(262, 120, 80, 70, 'speelveld', 'kp-veld');
  uit += wind(330, 108, -40, 'wind');
  uit += '<path d="M340 16v24m-6 -16l6 -8l6 8" class="lijn"/>' + tekst(340, 52, 'N', { maat: 10, klasse: 'vet' });
  return svg(360, 260, 'Voorbeeld van een kampplattegrond: tenten, keuken, afwasplek, vuur, HUDO, afval, kraan, speelveld, beek en de windrichting', uit);
}

/** A HUDO in cross-section: a narrow pit, a beam to sit on, a spade and earth, water and soap. */
function hudo() {
  let uit = grond(0, 340, 120, 90);
  uit += '<path d="M120 120V196H200V120Z" class="kp-kuil"/>';
  uit += '<path d="M120 172H200V196H120Z" class="kp-aarde"/>';
  uit += '<path d="M104 116H216" class="kp-paal"/><path d="M110 120V96M210 120V96" class="kp-paal"/>';
  uit += '<path d="M232 120Q250 96 268 120Z" class="kp-aarde"/><path d="M262 120L284 60" class="kp-steel"/><path d="M256 122l14 6l6 -14z" class="vol"/>';
  uit += '<rect x="34" y="84" width="34" height="36" rx="4" class="kp-jerrycan"/><path d="M44 84v-6h14" class="lijn"/>';
  uit += '<rect x="74" y="110" width="16" height="10" rx="3" class="vol-licht"/>';
  uit += wijs(6, 30, 'water en zeep', 50, 84);
  uit += wijs(160, 80, 'zitbalk, elke dag schoon', 160, 114, 'middle');
  uit += wijs(334, 40, 'schep en aarde', 276, 80, 'end');
  uit += wijs(214, 210, 'na elke keer een laagje aarde', 180, 184, 'end');
  return svg(340, 218, 'Een HUDO in doorsnede: een kuil met een zitbalk, een schep en aarde, en water en zeep om je handen te wassen', uit);
}

/** A soakaway for washing-up water in cross-section. */
function afvoerputje() {
  let uit = grond(0, 340, 90, 120);
  uit += '<path d="M110 90V190H230V90Z" class="kp-kuil"/>';
  for (let i = 0; i < 40; i++) {
    const x = 118 + ((i * 29) % 104); const y = 110 + ((i * 17) % 76);
    uit += `<circle cx="${x}" cy="${y}" r="${4 + (i % 3)}" class="kp-grind"/>`;
  }
  uit += '<path d="M104 90H236" class="kp-zeef"/>';
  uit += '<g transform="rotate(35 160 46)"><path d="M146 34h28l-4 24h-20z" class="kp-emmer"/><path d="M148 34q12 -12 24 0" class="lijn dun"/></g>';
  uit += '<path d="M178 46q8 20 0 42" class="kp-water-lijn"/>';
  uit += wijs(6, 40, 'afwaswater', 150, 46);
  uit += wijs(334, 74, 'zeef: etensresten eruit', 228, 90, 'end');
  uit += wijs(334, 140, 'grof grind', 222, 150, 'end');
  uit += wijs(6, 206, 'water zakt weg in de grond', 110, 186);
  return svg(340, 214, 'Een afvoerputje in doorsnede: een kuil met grof grind, met een zeef erop die de etensresten tegenhoudt', uit);
}

/** A pioneered camp kitchen: worktop, cooker on a firm level place, the roof high enough, the gas apart. */
function kampkeuken() {
  let uit = grond(0, 360, 190);
  uit += '<path d="M40 190V40M230 190V40" class="kp-paal"/><path d="M30 40H240" class="kp-paal"/>';
  uit += '<path d="M24 40L136 18L248 40" class="kp-zeil-lijn"/>';
  uit += '<path d="M40 120H230" class="kp-paal"/><rect x="40" y="112" width="190" height="8" class="kp-blad-hout"/>';
  uit += '<path d="M60 150L210 150M40 190L80 120M230 190L190 120" class="kp-tak"/>';
  uit += '<rect x="150" y="96" width="60" height="16" rx="2" class="vol"/><circle cx="166" cy="96" r="3" class="rood"/><circle cx="194" cy="96" r="3" class="rood"/>';
  uit += '<path d="M60 112v-14h40v14" class="lijn"/>';
  uit += '<rect x="290" y="132" width="26" height="58" rx="10" class="kp-gasfles"/><path d="M303 132v-8" class="lijn"/>';
  uit += '<path d="M303 124C300 70 240 70 210 104" class="kp-slang"/>';
  uit += '<rect x="250" y="168" width="28" height="22" rx="3" class="kp-vak3"/>';
  uit += wijs(250, 12, 'dak ver boven het kooktoestel', 210, 30, 'end');
  uit += wijs(6, 92, 'stevig, waterpas werkblad', 70, 113);
  uit += wijs(236, 216, 'afval', 262, 180, 'end');
  uit += wijs(356, 232, 'gasfles rechtop, apart', 303, 172, 'end');
  return svg(360, 240, 'Een gepionierde kampkeuken: een stevig waterpas werkblad, het kooktoestel met het dak er ver boven, de gasfles rechtop apart, een afvalpunt', uit);
}

/** A gas bottle: upright, outside, the hose checked with soapy water. */
function gasfles() {
  let uit = '<path d="M10 200H330" class="lijn"/>';
  uit += '<rect x="40" y="70" width="70" height="130" rx="26" class="kp-gasfles"/><path d="M62 70V54H88V70" class="lijn"/>';
  uit += '<rect x="66" y="40" width="18" height="14" rx="3" class="vol"/>';
  uit += '<path d="M84 46C140 40 170 130 240 130" class="kp-slang"/>';
  uit += '<rect x="240" y="118" width="70" height="20" rx="3" class="vol"/>';
  for (const [x, y, r] of [[118, 54, 5], [126, 46, 3.5], [112, 44, 3]]) uit += `<circle cx="${x}" cy="${y}" r="${r}" class="lijn dun"/>`;
  uit += wijs(150, 24, 'lek zoeken: zeepsop, geen vlam', 122, 48);
  uit += wijs(124, 104, 'rechtop, in de schaduw', 106, 120);
  uit += wijs(170, 176, 'slang heel en goed vast', 186, 111);
  return svg(340, 210, 'Een gasfles rechtop in de schaduw, met de slang naar het kooktoestel; een lek zoek je met zeepsop, nooit met een vlam', uit);
}

/** A small hole for a poo, away from water. */
function kuiltje() {
  let uit = grond(0, 340, 110, 70);
  uit += '<path d="M60 110V146Q60 152 66 152H94Q100 152 100 146V110Z" class="kp-kuil"/>';
  uit += '<path d="M48 110q-6 -14 6 -18q12 -2 12 14Z" class="kp-aarde"/>';
  uit += '<path d="M112 110V152" class="lijn"/><path d="M108 110h8M108 152h8" class="lijn"/>';
  uit += tekst(120, 136, '15–20 cm', { maat: 11, anker: 'start', klasse: 'vet' });
  uit += '<path d="M160 90H290m-6 -4l6 4l-6 4M160 90m6 -4l-6 4l6 4" class="lijn"/>';
  uit += tekst(225, 82, 'minstens 60 m', { maat: 11, klasse: 'vet' });
  uit += '<path d="M290 110Q310 100 340 108V180H290Z" class="kp-water"/>';
  uit += tekst(316, 100, 'water', { maat: 10, klasse: 'blauw-tekst' });
  uit += tekst(80, 30, 'kuiltje', { maat: 12, klasse: 'vet' }) + tekst(80, 46, 'daarna dicht met de aarde', { maat: 10, klasse: 'stil' });
  return svg(340, 186, 'Een kuiltje van 15 tot 20 cm diep, minstens 60 meter van water', uit);
}

/** The seven principles of Leave No Trace as seven tiles. */
function geenSporen() {
  const tegels = [
    ['1', 'Bereid je voor', '<path d="M-12 -8h24v18h-24z" class="kp-vak"/><path d="M-8 -2h16M-8 4h10" class="lijn dun"/>'],
    ['2', 'Stevige grond', '<path d="M-14 8h28" class="lijn dik"/><path d="M-8 8l8 -16l8 16" class="kp-doek"/>'],
    ['3', 'Afval mee', '<path d="M-9 -6h18l-2 18h-14z" class="kp-vak3"/><path d="M-11 -6h22" class="lijn"/>'],
    ['4', 'Laat liggen', '<path d="M0 12V-2" class="kp-stam"/><circle cx="0" cy="-6" r="8" class="kp-kruin"/>'],
    ['5', 'Klein vuur', '<path d="M-6 10l6 -16l6 16z" class="kp-vlam"/><path d="M-12 12h24" class="kp-tak"/>'],
    ['6', 'Dieren met rust', '<ellipse cx="0" cy="4" rx="11" ry="7" class="vol"/><circle cx="10" cy="-4" r="5" class="vol"/>'],
    ['7', 'Denk aan anderen', '<circle cx="-6" cy="-4" r="5" class="vol"/><circle cx="7" cy="-4" r="5" class="vol"/><path d="M-13 12q7 -12 14 0M0 12q7 -12 14 0" class="vol"/>'],
  ];
  let uit = '';
  tegels.forEach(([nr, naam, beeld], i) => {
    const kol = i % 4; const rij = Math.floor(i / 4);
    const x = 8 + kol * 86 + (rij ? 43 : 0); const y = 8 + rij * 96;
    uit += `<rect x="${x}" y="${y}" width="78" height="86" rx="8" class="vlak2"/>`;
    uit += `<circle cx="${x + 14}" cy="${y + 14}" r="9" class="accent"/>${tekst(x + 14, y + 18, nr, { maat: 11, klasse: 'vet kp-op-accent' })}`;
    uit += `<g transform="translate(${x + 39} ${y + 40})">${beeld}</g>`;
    uit += tekst(x + 39, y + 76, naam, { maat: 9.5 });
  });
  return svg(352, 200, 'De zeven principes van Laat geen sporen na als zeven tegels', uit);
}

/** Cooking under cover: never in the tent you sleep in; a kitchen tent with open sides, the roof far above the flame. */
function kooktent() {
  let uit = grond(0, 360, 186);
  // left: a sleeping tent with a stove inside, crossed out
  uit += '<path d="M14 186L62 96L110 186Z" class="kp-doek"/><path d="M62 96V186" class="lijn dun"/>';
  uit += '<rect x="70" y="172" width="22" height="10" rx="2" class="vol"/><path d="M76 172q5 -12 10 0" class="kp-vlam"/>';
  uit += '<path d="M20 104L104 182M104 104L20 182" class="kp-kruis"/>';
  uit += tekst(62, 210, 'niet in je slaaptent', { maat: 11, klasse: 'vet' });
  // right: a kitchen tent, roof on poles, sides open
  uit += '<path d="M150 186V70M330 186V70" class="kp-paal"/><path d="M140 72L240 40L340 72Z" class="kp-zeil"/>';
  uit += '<path d="M160 132H320" class="kp-paal"/><rect x="160" y="126" width="160" height="7" class="kp-blad-hout"/><path d="M170 186V133M310 186V133" class="kp-tak"/>';
  uit += '<rect x="214" y="112" width="40" height="14" rx="2" class="vol"/><path d="M226 112q8 -16 16 0" class="kp-vlam"/>';
  uit += '<path d="M206 126V102M262 126V102M206 102H216M252 102H262" class="lijn"/>';
  uit += '<path d="M234 64V100" class="lijn stil" stroke-dasharray="3 3"/><path d="M230 68L234 62L238 68M230 96L234 102L238 96" class="lijn stil"/>';
  uit += '<path d="M290 186l4 -24h20l4 24Z" class="kp-emmer"/><rect x="176" y="150" width="20" height="26" rx="2" class="kp-blusdeken"/>';
  uit += wijs(356, 30, 'dak ver boven de vlam', 236, 82, 'end');
  uit += wijs(132, 24, 'zijkanten open', 150, 96, 'end');
  uit += wijs(134, 102, 'spatscherm', 207, 108, 'end');
  uit += wijs(146, 228, 'blusdeken', 186, 170, 'start');
  uit += wijs(356, 228, 'emmer water of zand', 304, 172, 'end');
  return svg(360, 236, 'Links een slaaptent met een brander erin, doorgestreept: kook nooit in de tent waar je slaapt. Rechts een keukentent met open zijkanten, het dak ver boven de vlam, een spatscherm om de brander, een blusdeken en een emmer water of zand', uit);
}

export default {
  'tent-patrouille': patrouilletent,
  'tent-bell': belltent,
  'tent-koepel': koepeltent,
  'tent-tunnel': tunneltent,
  'tent-trekker': trekkerstent,
  'tent-party': partytent,
  'tent-dektent': dektent,
  'tent-onderdelen': tentOnderdelen,
  'tent-haringen': haringen,
  'tent-scheerlijn': scheerlijnHaring,
  'tarp-opstellingen': tarpOpstellingen,
  'shelter-afdak': afdak,
  'shelter-a-frame': aFrame,
  'shelter-bladhut': bladhut,
  'kamp-hangmat': hangmat,
  'kamp-bivakzak': bivakzak,
  'slaapzak-temperatuur': slaapzakTemperatuur,
  'kleding-laagjes': laagjes,
  'rugzak-zones': rugzakZones,
  'kamp-plattegrond': kampplattegrond,
  'kamp-hudo': hudo,
  'kamp-afvoerputje': afvoerputje,
  'kamp-keuken': kampkeuken,
  'kamp-kooktent': kooktent,
  'kamp-gasfles': gasfles,
  'kamp-kuiltje': kuiltje,
  'geen-sporen-zeven': geenSporen,
  'tent-vendel': vendeltent,
  'tent-haring-eruit': haringEruit,
  'tent-luchten': tentLuchten,
  'tent-drogen': tentDrogen,
  'kamp-frietbuil': frietbuil,
  'warm-slapen': warmSlapen,
  'kamp-afvalpunt': afvalpunt,
  'boom-jute': boomJute,
  'kamp-paal': kampeerpaal,
};
