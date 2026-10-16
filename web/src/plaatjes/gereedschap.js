// Drawings for gereedschap. See ../plaatjes.js and ./basis.js; the parts and the colours (vk-*) come from ./vuur.js
// and ./vuur.css. The bloedcirkel is in ../plaatjes.js.
import { svg, tekst } from './basis.js';
import { blok, fout, goed, grond, kop, label, pijl } from './vuur.js';

/** A simple mitten of a hand, its palm at (x, y), turned by `hoek` degrees. */
const hand = (x, y, hoek = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${hoek})"><path d="M-20 -8Q-22 -22 -6 -22H14Q24 -22 24 -12V8Q24 18 12 18H-10Q-22 18 -20 6Z" class="vk-hand"/><path d="M-20 0Q-34 -2 -34 -12Q-30 -18 -18 -12" class="vk-hand"/></g>`;

/** An open pocket knife from the side, with the names of its parts. */
function zakmes() {
  let uit = `<rect x="40" y="104" width="156" height="38" rx="15" fill="#c8302b" stroke="#7a1a16" stroke-width="1.4"/>`;
  uit += `<rect x="182" y="102" width="14" height="42" rx="3" class="vk-staal"/>`;
  uit += `<path d="M192 106H318Q346 108 356 116Q334 136 298 140H198Z" class="vk-staal"/>`;
  uit += `<path d="M200 140H298Q334 136 356 116" class="vk-snede"/>`;
  uit += `<path d="M214 112q8 6 16 0" fill="none" stroke="#56636b" stroke-width="1.6"/><circle cx="190" cy="123" r="4" class="vk-metaal"/>`;
  uit += label(330, 82, 'punt', 352, 112, 'start') + label(262, 82, 'rug', 262, 104) + label(258, 172, 'snede', 262, 142);
  uit += label(214, 82, 'nagelgleuf', 222, 110, 'end') + label(110, 172, 'heft', 110, 142) + label(176, 172, 'slot of ring', 188, 146);
  // on the light steel the label stays dark in both themes
  uit += tekst(290, 126, 'lemmet', { maat: 10.5, klasse: 'vet' }).replace('class="tekst vet"', 'class="tekst vet" style="fill: #1c1f21"');
  return svg(380, 190, 'Een open zakmes van opzij: het heft, het slot of de ring bij het scharnier, en het lemmet met de rug, de snede, de punt en de nagelgleuf', uit);
}

/** Handing over a knife: hold it by the back of the blade, edge away, handle to the other. */
function mesDoorgeven() {
  let uit = `<path d="M150 106H262Q284 106 284 120Q284 134 262 134H150Z" fill="#c8302b" stroke="#7a1a16" stroke-width="1.4"/>`;
  uit += `<path d="M150 106H66Q46 112 40 122Q60 134 84 136H150Z" class="vk-staal"/><path d="M150 136H84Q60 134 40 122" class="vk-snede"/>`;
  uit += hand(100, 96, 0) + hand(262, 150, 180);
  uit += pijl(160, 60, 236, 60) + tekst(198, 50, 'geef het heft aan', { maat: 10.5 });
  uit += tekst(90, 64, 'jij', { maat: 11, klasse: 'vet' }) + tekst(276, 190, 'de ander', { maat: 11, klasse: 'vet' });
  uit += label(60, 176, 'snede omlaag, van jullie af', 70, 140, 'start');
  return svg(320, 200, 'Een mes doorgeven: jij houdt het mes bij de rug van het lemmet vast, met de snede omlaag, van jullie allebei af; de ander pakt het heft', uit);
}

/** A feather stick: curls cut from the stick, left on it. */
function veerstok() {
  const voet = 196;
  let uit = grond(voet, 290) + `<rect x="70" y="${voet - 20}" width="100" height="20" rx="3" class="vk-hout-vol"/>`;
  uit += `<rect x="111" y="26" width="18" height="${voet - 46}" rx="4" class="vk-hout-vol"/>`;
  // each curl stays on the stick where the cut stopped (below) and its loose end curls up and out
  for (let i = 0; i < 6; i++) {
    const y = 102 + i * 13;
    uit += `<path d="M111 ${y}q-14 -4 -18 -18q-2 -8 6 -8q6 2 2 8" fill="none" style="stroke: var(--vk-kop)" stroke-width="3.4" stroke-linecap="round"/>`;
    uit += `<path d="M129 ${y + 6}q14 -4 18 -18q2 -8 -6 -8q-6 2 -2 8" fill="none" style="stroke: var(--vk-kop)" stroke-width="3.4" stroke-linecap="round"/>`;
  }
  uit += pijl(176, 50, 176, 110) + tekst(186, 72, 'van je af', { anker: 'start', maat: 10.5 }) + tekst(186, 86, 'naar beneden', { anker: 'start', maat: 10.5 });
  uit += label(80, 140, 'krullen', 98, 130, 'end');
  return svg(290, 214, 'Een veerstok: een droog stokje rechtop op een blok, met dunne krullen die van boven naar beneden zijn gesneden en er nog aan zitten', uit);
}

/** An axe head from the side, its edge down-left, its eye at (x, y). */
const bijlkop = (x, y) => `<path d="M${x - 10} ${y - 12}H${x + 12}V${y + 12}H${x - 10}L${x - 34} ${y + 28}Q${x - 44} ${y + 6} ${x - 34} ${y - 18}Z" class="vk-staal"/>`
  + `<path d="M${x - 34} ${y + 28}Q${x - 44} ${y + 6} ${x - 34} ${y - 18}" class="vk-snede"/>`;

/** Handing over an axe: in its cover if it has one; else hold the head, edge away, and offer the handle. */
function bijlDoorgeven() {
  let uit = blok(96, 104, 280, 104, 13) + bijlkop(90, 104);
  uit += hand(92, 86, 0) + hand(256, 124, 180);
  uit += pijl(150, 54, 226, 54) + tekst(188, 44, 'geef de steel aan', { maat: 10.5 });
  uit += tekst(70, 54, 'jij', { maat: 11, klasse: 'vet' }) + tekst(270, 166, 'de ander', { maat: 11, klasse: 'vet' });
  uit += label(28, 168, 'snede van jullie af', 54, 128, 'start');
  return svg(320, 180, 'Een bijl doorgeven: jij houdt de kop vast met de snede van jullie af, de ander pakt de steel; heeft de bijl een hoes, dan doe je die eerst om', uit);
}

/** The right length of an axe: the head in your hand, arm stretched, the handle reaches into your armpit. */
function bijlLengte() {
  const voet = 206;
  let uit = grond(voet, 320);
  uit += `<circle cx="90" cy="48" r="16" class="vol"/><path d="M90 64V140M90 140L72 ${voet}M90 140L108 ${voet}M90 80L80 120" class="lijn dik stil"/>`;
  uit += `<path d="M90 80H214" class="lijn dik stil"/>`;
  uit += blok(100, 88, 214, 88, 8) + `<g transform="translate(224 88) rotate(90)">${bijlkop(0, 0)}</g>`;
  uit += `<circle cx="214" cy="84" r="8" class="vk-hand"/>`;
  uit += label(200, 150, 'steel tot in je oksel', 104, 92, 'start') + label(214, 30, 'kop in je hand', 216, 74, 'middle');
  uit += tekst(160, 228, 'arm gestrekt', { maat: 10, klasse: 'stil' });
  return svg(320, 236, 'De goede lengte van een bijl: houd de kop met gestrekte arm vast; de steel reikt dan tot in je oksel', uit);
}

/** Chopping a log through with a V: alternate cuts from left and right at about 45 degrees. */
function vHakken() {
  const [y1, y2] = [100, 150];
  let uit = `<rect x="40" y="${y2}" width="240" height="40" rx="4" class="vk-hout-vol" opacity="0.6"/>`;
  uit += `<path d="M20 ${y1}H135L160 ${y1 + 26}L185 ${y1}H300V${y2}H20Z" class="vk-hout-vol"/>`;
  uit += `<path d="M135 ${y1}L160 ${y1 + 26}L185 ${y1}" class="vk-hout-rand" stroke-width="2"/>`;
  uit += kop(300, 125, 25);
  uit += pijl(96, 46, 142, 92, { warm: true }) + pijl(224, 46, 178, 92, { warm: true });
  uit += tekst(90, 40, '1', { maat: 13, klasse: 'vet' }) + tekst(230, 40, '2', { maat: 13, klasse: 'vet' });
  uit += `<path d="M118 ${y1}A24 24 0 0 1 136 ${y1 - 16}" class="vk-wijs"/>` + tekst(112, 86, '45°', { maat: 10.5, anker: 'end' });
  uit += `<path d="M135 ${y1 - 10}V${y1 - 4}M185 ${y1 - 10}V${y1 - 4}M135 ${y1 - 7}H185" class="lijn dun"/>`;
  uit += `<path d="M310 ${y1}H322M310 ${y2}H322M316 ${y1}V${y2}" class="lijn dun"/>`;
  uit += tekst(160, 216, 'de V zo breed als het hout dik is', { maat: 10.5, klasse: 'stil' });
  uit += tekst(160, 172, 'hakblok', { maat: 10, klasse: 'stil' });
  return svg(340, 226, 'Een stammetje doorhakken met een V: om en om een slag schuin van links en van rechts, ongeveer 45 graden, de V zo breed als het hout dik is', uit);
}

/** A bow saw with the names of its parts. */
function beugelzaag() {
  let uit = `<path d="M54 142V126Q60 52 170 52Q280 52 292 126V142" fill="none" stroke="#1f6fb2" stroke-width="7" stroke-linecap="round"/>`;
  uit += `<path d="M50 142H296" stroke="#c7d0d6" stroke-width="7"/>`;
  let tanden = 'M56 145';
  for (let x = 56; x < 292; x += 6) tanden += `l3 5l3 -5`;
  uit += `<path d="${tanden}" class="vk-metaal-lijn" stroke-width="1"/>`;
  uit += `<rect x="30" y="130" width="34" height="22" rx="8" fill="#2b2b2b"/><rect x="58" y="110" width="8" height="26" rx="2" fill="#e0b400"/>`;
  uit += label(170, 34, 'beugel', 170, 50, 'middle') + label(220, 186, 'zaagblad met tanden', 220, 152, 'middle');
  uit += label(108, 102, 'spanklem', 66, 116, 'start') + label(26, 186, 'handvat', 40, 152, 'start');
  return svg(320, 200, 'Een beugelzaag: een gebogen beugel die het zaagblad met tanden strak spant, met een handvat en een spanklem', uit);
}

/** A fixed knife lying along the x axis from (x, y): the grip behind, the blade ahead, the edge down. */
const mes = (x, y, hoek = 0, greep = 62, lemmet = 74) => `<g transform="translate(${x} ${y}) rotate(${hoek})">`
  + `<rect x="${-greep}" y="-7" width="${greep}" height="14" rx="6" fill="#c8302b" stroke="#7a1a16" stroke-width="1.2"/>`
  + `<path d="M0 -7H${lemmet - 22}Q${lemmet - 8} -6 ${lemmet} 0Q${lemmet - 12} 8 ${lemmet - 28} 8H0Z" class="vk-staal"/>`
  + `<path d="M0 8H${lemmet - 28}Q${lemmet - 12} 8 ${lemmet} 0" class="vk-snede"/></g>`;

/** Cutting away from you, from above: the knife moves away, your other hand behind it, nobody in its path. */
function vanJeAf() {
  let uit = `<ellipse cx="0" cy="110" rx="34" ry="70" class="vol-licht"/>` + tekst(12, 114, 'jij', { anker: 'start', maat: 12, klasse: 'vet' });
  uit += blok(70, 118, 300, 118, 9) + hand(96, 118, 0);
  uit += mes(206, 110, 0, 52, 70) + hand(176, 106, 0);
  uit += pijl(196, 70, 286, 70) + tekst(240, 60, 'snijd van je af', { maat: 11, klasse: 'vet' });
  uit += `<path d="M280 110H330" class="lijn rood-lijn" stroke-width="2" stroke-dasharray="5 4"/>`;
  uit += label(316, 156, 'niemand in de baan', 306, 114, 'end');
  uit += label(40, 186, 'andere hand achter het mes', 96, 136, 'start');
  return svg(330, 196, 'Van je af snijden, van boven gezien: je houdt het hout met je andere hand achter het mes vast, het mes beweegt van je af, en er staat niemand in de baan van het mes', uit);
}

/** Batoning: the blade on the end of a block, a stick to tap the spine, the other hand pushes the tip down. */
function batonneren() {
  const voet = 196;
  let uit = `<rect x="70" y="${voet - 16}" width="200" height="22" rx="3" class="vk-hout-vol" opacity="0.6"/>`;
  uit += `<rect x="124" y="112" width="74" height="${voet - 16 - 112}" class="vk-hout-vol"/><ellipse cx="161" cy="112" rx="37" ry="7" class="vk-kop"/>`;
  uit += `<path d="M160 116L162 152" class="vk-hout-rand" stroke-width="1.6"/>`;
  uit += mes(110, 102, 0, 66, 126) + hand(76, 102, 0);
  uit += blok(214, 34, 168, 86, 10) + pijl(238, 44, 196, 86, { warm: true });
  uit += pijl(236, 84, 236, 104, { warm: true });
  uit += label(250, 30, 'slaghout', 214, 40, 'start');
  uit += label(250, 124, 'punt omlaag', 238, 106, 'start');
  uit += label(26, 160, 'kopse kant', 140, 116, 'start');
  uit += tekst(170, 212, 'hakblok', { maat: 10.5, klasse: 'stil' });
  return svg(340, 218, 'Batonneren: het lemmet staat op de kopse kant van een blokje, je slaat met een stuk hout op de rug van het lemmet en duwt de punt die uitsteekt omlaag, tot het hout splijt', uit);
}

/** A try stick: the cuts one after another, from the curls to the point. */
function oefenstok() {
  const [y1, y2] = [72, 92];
  let uit = `<path d="M14 ${y1}H296L332 ${(y1 + y2) / 2}L296 ${y2}H14Z" class="vk-hout-vol"/>`;
  for (let i = 0; i < 4; i++) uit += `<path d="M${40 + i * 10} ${y1}q-4 -12 4 -16q8 -2 6 6" fill="none" style="stroke: var(--vk-kop)" stroke-width="2.6" stroke-linecap="round"/>`;
  uit += `<rect x="92" y="${y1}" width="52" height="8" class="vk-kop"/>`;
  uit += `<path d="M168 ${y1}V${y2}M176 ${y1}V${y2}" class="vk-hout-rand" stroke-width="2.6"/>`;
  uit += `<path d="M212 ${y1 - 0.6}V${y1 + 9}L236 ${y1 - 0.6}Z" class="vlak"/><path d="M212 ${y1}V${y1 + 9}L236 ${y1}" class="vk-hout-rand" stroke-width="1.2"/>`;
  uit += `<path d="M296 ${y1}L332 ${(y1 + y2) / 2}L296 ${y2}" class="vk-kop" opacity="0.6"/>`;
  uit += label(52, 36, 'krullen', 50, 54, 'middle') + label(118, 126, 'vlakke kant', 118, y1 + 6, 'middle');
  uit += label(172, 36, 'groef rondom', 172, y1 - 2, 'middle') + label(224, 126, 'inkeping', 220, y1 + 6, 'middle');
  uit += label(314, 36, 'punt', 314, y1 + 6, 'middle');
  return svg(340, 136, 'Een oefenstok met alle sneden na elkaar: krullen, een vlakke kant, een groef rondom, een inkeping en een punt', uit);
}

/** Splitting: the block upright on a chopping block, the axe in the middle or along a crack. */
function kloven() {
  const voet = 204;
  let uit = `<rect x="60" y="${voet - 22}" width="200" height="26" rx="3" class="vk-hout-vol" opacity="0.6"/>`;
  uit += `<rect x="120" y="122" width="80" height="${voet - 22 - 122}" class="vk-hout-vol"/><ellipse cx="160" cy="122" rx="40" ry="9" class="vk-kop"/><ellipse cx="160" cy="122" rx="18" ry="4" class="vk-jaar"/>`;
  uit += `<path d="M160 126L156 150L161 172" class="vk-hout-rand" stroke-width="1.6" fill="none"/>`;
  uit += blok(172, 72, 266, 28, 8);
  uit += `<path d="M148 64H176V80L184 106H140L148 80Z" class="vk-staal"/><path d="M140 106H184" class="vk-snede"/>`;
  uit += pijl(214, 70, 214, 106, { warm: true });
  uit += tekst(14, 30, 'in het midden,', { anker: 'start', maat: 10.5 }) + tekst(14, 44, 'of langs een scheur', { anker: 'start', maat: 10.5 });
  uit += `<path d="M60 50L156 128" class="vk-wijs"/>`;
  uit += tekst(160, 222, 'op een hakblok, niet op de grond', { maat: 10.5, klasse: 'stil' });
  return svg(320, 230, 'Kloven: het blok staat rechtop op een hakblok, en de bijl komt in het midden of langs een scheur op de kopse kant', uit);
}

/** Five axes side by side, roughly to scale: from the hand axe to the splitting axe. */
function soortenBijlen() {
  const voet = 214;
  const bijl = (x, lang, { krom = false, zwaar = false } = {}) => {
    const top = voet - lang;
    const steel = krom ? `M${x} ${voet}Q${x + 6} ${voet - lang * 0.45} ${x} ${voet - lang * 0.7}T${x + 2} ${top}` : `M${x} ${voet}L${x} ${top}`;
    let s = `<path d="${steel}" class="vk-hout-rand" stroke-width="8.4" fill="none"/><path d="${steel}" class="vk-hout" stroke-width="6" fill="none"/>`;
    s += zwaar
      ? `<path d="M${x + 16} ${top - 10}V${top + 20}L${x - 28} ${top + 28}Q${x - 34} ${top + 5} ${x - 28} ${top - 18}Z" class="vk-staal"/><path d="M${x - 28} ${top + 28}Q${x - 34} ${top + 5} ${x - 28} ${top - 18}" class="vk-snede"/>`
      : bijlkop(x, top + 2);
    return s;
  };
  let uit = `<path d="M0 ${voet}H360" class="lijn dun stil"/>`;
  uit += bijl(50, 70) + bijl(118, 120) + bijl(186, 180, { krom: true }) + bijl(254, 180) + bijl(322, 160, { zwaar: true });
  const naam = [[38, 'handbijl'], [106, 'driekwart'], [174, 'aks'], [242, 'velbijl'], [312, 'kloofbijl']];
  for (const [x, n] of naam) uit += tekst(x, voet + 18, n, { maat: 11 });
  uit += tekst(106, voet + 31, 'bijl', { maat: 11 });
  return svg(360, 252, 'Vijf soorten bijlen naast elkaar, ongeveer op schaal: een korte handbijl, een driekwart bijl, een aks met een gebogen steel, een velbijl met een rechte steel, en een kloofbijl met een zware kop', uit);
}

/** Four saws: fret saw, bow saw, folding saw and pull saw. */
function soortenZagen() {
  const tanden = (x1, x2, y) => { let d = `M${x1} ${y}`; for (let x = x1; x < x2 - 4; x += 5) d += 'l2.5 4l2.5 -4'; return `<path d="${d}" class="vk-metaal-lijn" stroke-width="0.9"/>`; };
  let uit = '';
  // fret saw: a deep frame, a thin blade, a handle in line
  uit += `<path d="M22 74V32Q22 24 30 24H118Q126 24 126 32V74" fill="none" class="vk-metaal-lijn" stroke-width="3.4"/><path d="M22 74H128" class="vk-metaal-lijn" stroke-width="1"/>` + tanden(22, 126, 75);
  uit += `<rect x="128" y="68" width="30" height="12" rx="5" class="vk-hout-vol"/>`;
  uit += tekst(84, 104, 'figuurzaag', { maat: 11 });
  // bow saw
  uit += `<path d="M196 74Q200 18 262 18Q324 18 328 74" fill="none" stroke="#1f6fb2" stroke-width="5" stroke-linecap="round"/><path d="M194 74H330" stroke="#c7d0d6" stroke-width="5"/>` + tanden(196, 328, 77);
  uit += `<rect x="182" y="66" width="20" height="16" rx="6" fill="#2b2b2b"/>` + tekst(262, 104, 'beugelzaag', { maat: 11 });
  // folding saw: a handle and a curved blade, half folded out
  uit += `<rect x="20" y="158" width="74" height="16" rx="6" class="vk-hout-vol"/><circle cx="90" cy="166" r="3" class="vk-metaal"/>`;
  uit += `<path d="M90 162Q130 150 158 128L162 134Q134 160 92 170Z" class="vk-staal"/>`;
  uit += tekst(84, 196, 'klapzaag', { maat: 11 });
  // pull saw: a long handle and a thin straight blade; it cuts when you pull
  uit += `<rect x="194" y="158" width="58" height="14" rx="5" class="vk-hout-vol"/><path d="M252 158H330V170H252Z" class="vk-staal"/>` + tanden(252, 330, 170);
  uit += pijl(318, 140, 266, 140) + tekst(292, 132, 'trek', { maat: 10.5, klasse: 'stil' });
  uit += tekst(262, 196, 'trekzaag', { maat: 11 });
  return svg(350, 204, 'Vier soorten zagen: een figuurzaag met een diepe beugel en een dun zaagje, een beugelzaag, een klapzaag met een gebogen blad dat in het handvat klapt, en een trekzaag die zaagt als je trekt', uit);
}

/** Sharpening an axe with a file: push from the head towards the edge, lift it on the way back. */
function bijlVijlen() {
  let uit = blok(20, 104, 120, 104, 14);
  uit += `<path d="M110 84H136L232 70Q246 104 232 138L136 124H110Z" class="vk-staal"/><path d="M232 70Q246 104 232 138" class="vk-snede"/>`;
  uit += `<path d="M176 78V130" class="vk-metaal-lijn" stroke-dasharray="3 3" opacity="0.6"/>`;
  uit += `<g transform="rotate(-8 190 104)"><rect x="150" y="96" width="96" height="12" rx="2" fill="#6d767c" stroke="#3b4247" stroke-width="1"/><rect x="246" y="94" width="40" height="16" rx="6" class="vk-hout-vol"/></g>`;
  uit += pijl(170, 160, 236, 160) + tekst(204, 180, 'duwen: van de kop naar de snede', { maat: 10.5 });
  uit += `<path d="M236 46Q204 32 170 46" class="lijn stil" stroke-dasharray="4 3"/>` + tekst(204, 28, 'terug: optillen', { maat: 10.5, klasse: 'stil' });
  uit += label(60, 150, 'kop vastzetten', 120, 120, 'middle');
  return svg(320, 190, 'Een bijl slijpen met een vijl: zet de bijl vast en duw de vijl van de kop naar de snede; op de terugweg til je hem op', uit);
}

/** Chip carving and kohlrosing on a board: little triangles cut out, and thin lines filled with dark colour. */
function chipCarving() {
  let uit = `<rect x="16" y="20" width="308" height="104" rx="6" class="vk-kop"/>`;
  const driehoek = (x, y, op) => {
    const [a, b, c] = op ? [[x, y - 18], [x - 18, y + 14], [x + 18, y + 14]] : [[x, y + 18], [x - 18, y - 14], [x + 18, y - 14]];
    const m = [x, y + (op ? 3 : -3)];
    const p = (q, r, f) => `<path d="M${q[0]} ${q[1]}L${r[0]} ${r[1]}L${m[0]} ${m[1]}Z" fill="#5e3b1a" opacity="${f}"/>`;
    return p(a, b, 0.55) + p(b, c, 0.8) + p(c, a, 0.35);
  };
  for (let i = 0; i < 4; i++) uit += driehoek(42 + i * 28, 56, i % 2 === 0) + driehoek(42 + i * 28, 92, i % 2 === 1);
  uit += `<path d="M184 34H312M184 110H312" stroke="#2a1d14" stroke-width="1.8"/><circle cx="248" cy="72" r="26" fill="none" stroke="#2a1d14" stroke-width="1.8"/>`;
  for (let g = 0; g < 360; g += 60) uit += `<ellipse cx="248" cy="58" rx="5" ry="13" transform="rotate(${g} 248 72)" fill="none" stroke="#2a1d14" stroke-width="1.8"/>`;
  uit += `<path d="M170 28V116" class="lijn dun stil" stroke-dasharray="3 3"/>`;
  uit += tekst(84, 144, 'chip carving: schilfers eruit', { maat: 10.5 });
  uit += tekst(248, 144, 'kohlrosing: lijnen, donker gevuld', { maat: 10.5 });
  return svg(340, 152, 'Chip carving en kohlrosing op een plankje: links kleine driehoekjes die als schilfers uit het hout zijn gesneden, rechts dunne lijnen die met donker poeder zijn gevuld', uit);
}

/** Knives and the law: a folding knife longer than 28 cm open is forbidden; one cutting edge or more than one. */
function mesWet() {
  let uit = `<rect x="20" y="40" width="130" height="18" rx="7" fill="#c8302b" stroke="#7a1a16" stroke-width="1.2"/>`;
  uit += `<path d="M150 40H272Q300 42 312 50Q290 62 262 60H150Z" class="vk-staal"/><path d="M150 60H262Q290 62 312 50" class="vk-snede"/>`;
  uit += `<path d="M20 70V82M312 70V82M20 76H312" class="lijn dun"/>` + tekst(166, 96, 'opengeklapt langer dan 28 cm: verboden', { maat: 10.5 });
  uit += `<path d="M20 112H320" class="lijn dun stil" stroke-dasharray="4 4"/>`;
  uit += `<rect x="20" y="138" width="54" height="14" rx="6" class="vk-hout-vol"/><path d="M74 138H130Q146 140 154 146Q140 154 124 154H74Z" class="vk-staal"/><path d="M74 154H124Q140 154 154 146" class="vk-snede"/>`;
  uit += goed(150, 124) + tekst(86, 180, 'één snijkant', { maat: 11, klasse: 'vet' }) + tekst(86, 194, 'gewoon mes', { maat: 10.5 });
  uit += `<rect x="190" y="138" width="54" height="14" rx="6" class="vk-hout-vol"/><path d="M244 136L312 145L244 154Z" class="vk-staal"/><path d="M244 136L312 145L244 154" class="vk-snede"/>`;
  uit += fout(314, 124) + tekst(256, 180, 'twee snijkanten', { maat: 11, klasse: 'vet' }) + tekst(256, 194, 'dolk: wapen', { maat: 10.5 });
  return svg(340, 202, 'Messen en de wet: een opvouwbaar mes dat opengeklapt langer is dan 28 centimeter is verboden; een mes met één snijkant is een gewoon mes, een mes met twee snijkanten, zoals een dolk, is een wapen', uit);
}

export default {
  zakmes,
  'mes-doorgeven': mesDoorgeven,
  veerstok,
  'bijl-doorgeven': bijlDoorgeven,
  'bijl-lengte': bijlLengte,
  'v-hakken': vHakken,
  beugelzaag,
  'van-je-af': vanJeAf,
  batonneren,
  oefenstok,
  kloven,
  'soorten-bijlen': soortenBijlen,
  'soorten-zagen': soortenZagen,
  'bijl-vijlen': bijlVijlen,
  'chip-carving': chipCarving,
  'mes-wet': mesWet,
};
