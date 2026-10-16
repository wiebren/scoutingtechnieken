// Drawings for vuur. See ../plaatjes.js and ./basis.js; the colours (vk-*) are in ./vuur.css. The small parts (a
// log, a flame, an arrow) are exported too: the drawings of koken and gereedschap use them.
import { r1, svg, tekst } from './basis.js';

/** A log from the side, from (x1, y1) to (x2, y2), d thick. */
export const blok = (x1, y1, x2, y2, d = 10) =>
  `<path d="M${x1} ${y1}L${x2} ${y2}" class="vk-hout-rand" stroke-width="${d + 2.4}"/><path d="M${x1} ${y1}L${x2} ${y2}" class="vk-hout" stroke-width="${d}"/>`;
/** A log seen from its end: a disc with a growth ring. */
export const kop = (cx, cy, r) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" class="vk-kop"/><circle cx="${cx}" cy="${cy}" r="${r1(r * 0.5)}" class="vk-jaar"/>`;
/** A flame standing on (cx, voet), h high and w wide. */
export function vlam(cx, voet, h = 40, w = 26) {
  const b = w / 2;
  return `<path d="M${cx} ${voet - h} C${cx - b * 0.9} ${voet - h * 0.55} ${cx - b * 1.15} ${voet - h * 0.25} ${cx - b * 0.75} ${voet - h * 0.06} C${cx - b * 0.45} ${voet + 2} ${cx + b * 0.45} ${voet + 2} ${cx + b * 0.75} ${voet - h * 0.06} C${cx + b * 1.15} ${voet - h * 0.25} ${cx + b * 0.9} ${voet - h * 0.55} ${cx} ${voet - h}Z" class="vk-vlam"/>`
    + `<path d="M${cx} ${voet - h * 0.55} C${cx - b * 0.5} ${voet - h * 0.3} ${cx - b * 0.55} ${voet - h * 0.1} ${cx} ${voet - 1} C${cx + b * 0.55} ${voet - h * 0.1} ${cx + b * 0.5} ${voet - h * 0.3} ${cx} ${voet - h * 0.55}Z" class="vk-vlam-binnen"/>`;
}
/** Glowing coals: a few small blobs around (cx, cy). */
export function kolen(cx, cy, n = 6, breed = 40) {
  let uit = '';
  for (let i = 0; i < n; i++) {
    const x = r1(cx - breed / 2 + (breed * (i + 0.5)) / n); const y = r1(cy + (i % 2 ? -2 : 1.5));
    uit += `<ellipse cx="${x}" cy="${y}" rx="${r1(breed / n / 1.7)}" ry="3.6" class="vk-kool"/>`;
  }
  return uit;
}
/** An arrow from (x1, y1) to (x2, y2), blue (wind, air) or red (heat). */
export function pijl(x1, y1, x2, y2, { warm = false } = {}) {
  const hoek = Math.atan2(y2 - y1, x2 - x1); const l = 9;
  const [ax, ay] = [x2 - l * Math.cos(hoek - 0.45), y2 - l * Math.sin(hoek - 0.45)];
  const [bx, by] = [x2 - l * Math.cos(hoek + 0.45), y2 - l * Math.sin(hoek + 0.45)];
  return `<path d="M${x1} ${y1}L${r1((x2 + (ax + bx) / 2) / 2)} ${r1((y2 + (ay + by) / 2) / 2)}" class="${warm ? 'vk-warm' : 'vk-pijl'}"/>`
    + `<path d="M${x2} ${y2}L${r1(ax)} ${r1(ay)}L${r1(bx)} ${r1(by)}Z" class="${warm ? 'vk-warm-kop' : 'vk-pijl-kop'}"/>`;
}
/** A label with a thin line to what it names. */
export const label = (x, y, t, nx, ny, anker = 'start') =>
  `<path d="M${nx} ${ny}L${anker === 'start' ? x - 3 : anker === 'end' ? x + 3 : x} ${y - 4}" class="vk-wijs"/>` + tekst(x, y, t, { maat: 10.5, anker });
/** The ground: a band of earth from y down. */
export const grond = (y, w) => `<rect x="0" y="${y}" width="${w}" height="16" class="vk-grond"/><path d="M0 ${y}H${w}" class="lijn dun stil"/>`;
/** Tinder: a little heap of yellow wisps. */
export const tondel = (cx, voet, w = 22) =>
  `<path d="M${cx - w / 2} ${voet}Q${cx - w / 4} ${voet - 12} ${cx} ${voet - 9}Q${cx + w / 4} ${voet - 14} ${cx + w / 2} ${voet}Z" class="vk-tondel"/>`;
/** A pot from the side, standing on (cx, bodem). */
export const pan = (cx, bodem, w = 46, h = 26) =>
  `<path d="M${cx - w / 2} ${bodem - h}H${cx + w / 2}L${cx + w / 2 - 3} ${bodem}H${cx - w / 2 + 3}Z" class="vk-metaal"/><path d="M${cx - w / 2 - 5} ${bodem - h}H${cx + w / 2 + 5}" class="vk-metaal-lijn"/>`;

/** A green tick and a red cross, to mark the right and the wrong way in a comparison. */
export const goed = (x, y) => `<path d="M${x - 9} ${y}l6 7 12 -14" class="lijn accent-lijn" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
export const fout = (x, y) => `<path d="M${x - 8} ${y - 8}l16 16M${x + 8} ${y - 8}l-16 16" class="lijn rood-lijn" stroke-width="3.2" stroke-linecap="round"/>`;

/** The pyramid fire from the side: tinder, a small tent of kindling and a bigger one of wood, open to the wind. */
function piramidevuur() {
  const [cx, voet] = [160, 186];
  let uit = grond(voet, 320);
  // the big tent, with a gap on the windward (left) side
  for (const x of [82, 104, 198, 218, 238]) uit += blok(x, voet, cx + (x - cx) * 0.1, 62, 6);
  // the small tent of kindling
  for (const x of [132, 144, 172, 184, 192]) uit += `<path d="M${x} ${voet}L${cx + (x - cx) * 0.1} 112" class="vk-hout" stroke-width="2.6"/>`;
  uit += tondel(cx, voet, 30);
  uit += pijl(24, 168, 86, 168) + tekst(26, 158, 'wind', { anker: 'start', maat: 10.5, klasse: 'stil' });
  uit += label(244, 70, 'brandhout', 192, 104) + label(244, 120, 'aanmaakhout', 182, 150) + label(244, 166, 'tondel', 172, 180);
  uit += tekst(108, 210, 'opening aan de windkant', { maat: 10, klasse: 'stil' });
  return svg(320, 220, 'Piramidevuur van opzij: tondel in het midden, een klein tentje van aanmaakhout, een groter tentje van brandhout, met een opening aan de kant van de wind', uit);
}

/** A log cabin: layers of two logs, crosswise; from the side one layer shows two ends, the next a long log. */
function stapel({ lagen, breed, dikte, krimp = 0, cx = 160, voet = 190, vanBoven = false }) {
  let uit = ''; let y = voet;
  for (let i = 0; i < lagen; i++) {
    const d = typeof dikte === 'function' ? dikte(i) : dikte;
    const b = breed - krimp * i;
    y -= d + 1;
    if (i % 2 === 0) uit += kop(cx - b / 2 + d / 2, y + d / 2, d / 2) + kop(cx + b / 2 - d / 2, y + d / 2, d / 2);
    else uit += blok(cx - b / 2 - 6, y + d / 2, cx + b / 2 + 6, y + d / 2, d - 2);
  }
  return { uit, top: y, vanBoven };
}

function blokhutvuur() {
  const voet = 190;
  let uit = grond(voet, 320);
  // the small pyramid inside, seen between the layers
  for (const x of [138, 150, 170, 182]) uit += `<path d="M${x} ${voet}L${160 + (x - 160) * 0.15} 118" class="vk-hout" stroke-width="2.6"/>`;
  uit += tondel(160, voet, 24);
  const { uit: s } = stapel({ lagen: 6, breed: 150, dikte: 16 });
  uit += s;
  uit += label(258, 96, 'kruislings', 228, 112) + label(258, 132, 'gestapeld', 236, 146) + label(250, 214, 'vuurtje', 172, 184);
  return svg(320, 222, 'Blokhutvuur van opzij: blokken kruislings op elkaar, als een blokhut, met een piramidevuurtje in het midden', uit);
}

function zwitserseMethode() {
  const voet = 196;
  let uit = grond(voet, 320);
  const { uit: s, top } = stapel({ lagen: 7, breed: 150, dikte: (i) => 22 - i * 2.6, krimp: 8, voet });
  uit += s;
  uit += tondel(160, top - 1, 30) + `<rect x="150" y="${top - 12}" width="20" height="9" rx="2" class="vk-tondel"/>`;
  uit += vlam(160, top - 6, 38, 28);
  uit += pijl(262, top + 12, 262, voet - 24, { warm: true }) + tekst(270, top + 52, 'brandt', { anker: 'start', maat: 10.5 }) + tekst(270, top + 66, 'naar', { anker: 'start', maat: 10.5 }) + tekst(270, top + 80, 'beneden', { anker: 'start', maat: 10.5 });
  uit += label(56, top + 14, 'dun', 84, top + 14, 'end') + label(56, voet - 12, 'dik', 76, voet - 12, 'end');
  uit += tekst(70, top - 22, 'aanmaakblokje en', { maat: 10, klasse: 'stil' }) + tekst(70, top - 9, 'aanmaakhout bovenop', { maat: 10, klasse: 'stil' });
  return svg(320, 220, 'Zwitserse methode: dikke blokken onderop, steeds dunner naar boven, bovenop aanmaakhout en een aanmaakblokje; je steekt het bovenop aan en het brandt naar beneden', uit);
}

function pagodevuur() {
  const voet = 200;
  let uit = grond(voet, 320);
  for (const x of [128, 142, 178, 192]) uit += `<path d="M${x} ${voet}L${160 + (x - 160) * 0.12} 96" class="vk-hout" stroke-width="3"/>`;
  uit += tondel(160, voet, 24);
  const { uit: s } = stapel({ lagen: 8, breed: 230, dikte: 17, krimp: 22, voet });
  uit += s;
  uit += tekst(160, 34, 'steeds smaller naar boven', { maat: 10, klasse: 'stil' }) + tekst(160, 222, 'grote blokken, trapsgewijs', { maat: 10, klasse: 'stil' });
  return svg(320, 230, 'Pagodevuur: grote blokken kruislings en trapsgewijs gestapeld, steeds smaller naar boven, om een piramidevuur heen', uit);
}

/** The star fire from above: logs like spokes with their ends in the glow; push them in as they burn. */
function stervuur() {
  const [cx, cy] = [160, 118];
  let uit = `<circle cx="${cx}" cy="${cy}" r="30" class="vk-kool" opacity="0.35"/>` + kolen(cx, cy, 5, 36) + vlam(cx, cy + 6, 26, 22);
  for (const g of [10, 82, 154, 226, 298]) {
    const rad = (g * Math.PI) / 180;
    const [x1, y1] = [r1(cx + 22 * Math.sin(rad)), r1(cy - 22 * Math.cos(rad))]; const [x2, y2] = [r1(cx + 104 * Math.sin(rad)), r1(cy - 104 * Math.cos(rad))];
    uit += blok(x2, y2, x1, y1, 14);
    const [p1, p2] = [[r1(cx + 120 * Math.sin(rad + 0.22)), r1(cy - 120 * Math.cos(rad + 0.22))], [r1(cx + 86 * Math.sin(rad + 0.22)), r1(cy - 86 * Math.cos(rad + 0.22))]];
    if (g === 82 || g === 226) uit += pijl(p1[0], p1[1], p2[0], p2[1], { warm: true });
  }
  uit += tekst(cx, 236, 'van boven: schuif de blokken naar het midden als ze opbranden', { maat: 10, klasse: 'stil' });
  return svg(320, 246, 'Stervuur van boven: vijf blokken als spaken van een wiel met hun punten in het vuur; je schuift ze naar binnen als ze opbranden', uit);
}

/** The hunter's fire from above: two logs in a narrow V, the fire between, pots on top, wider towards the wind. */
function jagersvuur() {
  let uit = blok(70, 70, 266, 96, 22) + blok(70, 170, 266, 144, 22);
  uit += kolen(170, 120, 7, 120) + vlam(110, 128, 26, 24) + vlam(150, 126, 22, 20);
  uit += `<circle cx="196" cy="120" r="22" class="vk-metaal"/><circle cx="246" cy="120" r="17" class="vk-metaal"/>`;
  uit += pijl(10, 120, 52, 120) + tekst(12, 108, 'wind', { anker: 'start', maat: 10.5, klasse: 'stil' });
  uit += tekst(8, 204, 'wijder aan de windkant', { anker: 'start', maat: 10, klasse: 'stil' }) + tekst(294, 204, 'pannen op de balken', { anker: 'end', maat: 10, klasse: 'stil' });
  return svg(300, 214, 'Jagersvuur van boven: twee dikke balken naast elkaar, wijder aan de kant van de wind, met het vuur ertussen en pannen op de balken', uit);
}

/** The keyhole fire from above: a round part to burn, a slot for coals to cook over. */
function sleutelgatvuur() {
  const stenen = [];
  for (let g = 40; g <= 320; g += 20) { const rad = (g * Math.PI) / 180; stenen.push([r1(110 + 62 * Math.cos(rad)), r1(116 + 62 * Math.sin(rad))]); }
  for (let x = 176; x <= 266; x += 18) stenen.push([x, 82], [x, 150]);
  stenen.push([282, 98], [282, 116], [282, 134]);
  let uit = `<path d="M60 116a50 50 0 1 1 100 -28H272V144H160a50 50 0 0 1 -100 -28Z" class="vk-grond"/>`;
  uit += stenen.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.5" class="vol-licht"/>`).join('');
  uit += vlam(100, 130, 34, 30) + vlam(124, 126, 26, 22) + kolen(220, 117, 6, 90);
  uit += `<circle cx="226" cy="116" r="20" class="vk-metaal" opacity="0.9"/>`;
  uit += tekst(110, 196, 'stoken', { maat: 10.5 }) + tekst(226, 182, 'koken op de kolen', { maat: 10.5 });
  uit += pijl(156, 106, 186, 110, { warm: true });
  return svg(300, 206, 'Sleutelgatvuur van boven: een rond deel waar je stookt, en een smalle gleuf waar je de kolen in schuift en kookt', uit);
}

/** The reflector fire from the side: a slanted wall of logs behind the fire sends the heat back. */
function reflectorvuur() {
  const voet = 186;
  let uit = grond(voet, 320);
  uit += blok(250, voet, 236, 70, 5) + blok(268, voet, 254, 70, 5);
  for (let i = 0; i < 7; i++) uit += kop(r1(246 - i * 2), r1(voet - 9 - i * 16.5), 8.5);
  for (const x of [176, 186, 204, 214]) uit += `<path d="M${x} ${voet}L${195 + (x - 195) * 0.15} 130" class="vk-hout" stroke-width="3"/>`;
  uit += vlam(195, voet - 2, 50, 34);
  uit += pijl(222, 122, 120, 104, { warm: true }) + pijl(224, 150, 124, 150, { warm: true });
  // you, sitting
  uit += `<circle cx="70" cy="122" r="11" class="vol"/><path d="M70 133V160M70 160H96V${voet}M70 142L92 150" class="lijn dik stil"/>`;
  uit += label(262, 60, 'scherm van blokken', 252, 74, 'end');
  return svg(320, 210, 'Reflectorvuur van opzij: achter het vuur een schuin scherm van blokken tussen palen, dat de warmte terugkaatst naar wie ervoor zit', uit);
}

/** The trench fire from above: a long trench, pans across, the wind blowing into it. */
function greppelvuur() {
  let uit = `<rect x="58" y="94" width="230" height="40" rx="8" class="vk-gat"/>`;
  uit += kolen(170, 114, 10, 200) + vlam(84, 120, 22, 18) + vlam(110, 118, 18, 14);
  for (const x of [150, 204, 254]) uit += `<circle cx="${x}" cy="114" r="${x === 204 ? 26 : 22}" class="vk-metaal"/>`;
  uit += pijl(8, 114, 52, 114) + tekst(10, 102, 'wind', { anker: 'start', maat: 10.5, klasse: 'stil' });
  uit += tekst(172, 168, 'van boven: de pannen staan op de rand', { maat: 10, klasse: 'stil' });
  return svg(300, 180, 'Greppelvuur van boven: een lange greppel met het vuur erin, pannen op de rand, en de wind die erin blaast', uit);
}

/** The Dakota fire hole in section: a fire pit and a slanted air tunnel to its bottom. */
function dakotavuur() {
  const top = 74;
  let uit = `<rect x="0" y="${top}" width="320" height="146" class="vk-grond"/><path d="M0 ${top}H320" class="lijn dun stil"/>`;
  uit += `<path d="M178 ${top}V196H226V${top}Z" class="vk-gat"/>`;
  uit += `<path d="M72 ${top}L100 ${top}L186 190L178 196L164 ${top + 104}Z" class="vk-gat"/>`;
  uit += `<path d="M72 ${top}H100L182 182" class="lijn dun stil" fill="none"/>`;
  uit += kolen(202, 190, 4, 40) + vlam(202, 188, 70, 36);
  uit += blok(166, top - 4, 238, top - 4, 6) + pan(202, top - 7, 52, 26);
  uit += pijl(46, 40, 92, 86) + pijl(120, 110, 166, 168);
  uit += pijl(244, 150, 244, 96, { warm: true });
  uit += tekst(24, 30, 'verse lucht', { anker: 'start', maat: 10.5, klasse: 'stil' }) + tekst(252, 128, 'hete lucht', { anker: 'start', maat: 10.5, klasse: 'stil' }) + tekst(252, 142, 'stijgt op', { anker: 'start', maat: 10.5, klasse: 'stil' });
  return svg(320, 214, 'Dakotavuur in doorsnede: het vuur brandt in een kuil; een schuine tunnel voert verse lucht naar de bodem; de pan staat bovenop', uit);
}

/** A fire at working height: a lashed table with a thick layer of sand on top. */
function tafelvuur() {
  const voet = 200;
  let uit = grond(voet, 320);
  uit += blok(84, voet, 92, 104, 8) + blok(236, voet, 228, 104, 8) + blok(112, voet, 116, 110, 6) + blok(208, voet, 204, 110, 6);
  for (let i = 0; i < 7; i++) uit += kop(98 + i * 21, 112, 9);
  uit += `<path d="M78 103H242L234 84H86Z" class="vk-zand"/>`;
  for (const [x, y] of [[92, 112], [228, 112]]) uit += `<path d="M${x - 9} ${y - 9}l18 18M${x + 9} ${y - 9}l-18 18" class="vk-touw"/>`;
  for (const x of [146, 156, 172, 180]) uit += `<path d="M${x} 85L${163 + (x - 163) * 0.15} 54" class="vk-hout" stroke-width="2.8"/>`;
  uit += vlam(163, 84, 34, 28);
  uit += label(258, 92, 'zand', 238, 92) + label(258, 128, 'gesjord', 236, 116) + label(258, 160, 'palen', 232, 150);
  uit += pijl(30, voet, 30, 92) + pijl(30, 92, 30, voet) + tekst(38, 150, 'werk-', { anker: 'start', maat: 10 }) + tekst(38, 162, 'hoogte', { anker: 'start', maat: 10 });
  return svg(320, 222, 'Tafelvuur: een gesjorde tafel van palen met een dikke laag zand, en daarop het vuur, op werkhoogte', uit);
}

/** The Swedish torch: a standing log cut from the top, burning inside; from above, the cuts as a star. */
function zweedseFakkel() {
  const voet = 204;
  let uit = grond(voet, 320);
  uit += `<rect x="96" y="70" width="88" height="${voet - 70}" rx="6" class="vk-hout-vol"/>`;
  uit += `<path d="M118 70V170M140 70V176M162 70V170" class="vk-hout-rand" stroke-width="3"/>`;
  uit += `<ellipse cx="140" cy="70" rx="44" ry="8" class="vk-kop"/>`;
  uit += vlam(122, 72, 22, 16) + vlam(140, 70, 34, 22) + vlam(158, 72, 22, 16);
  uit += pan(140, 48, 54, 28);
  // from above
  const [kx, ky] = [252, 104];
  uit += kop(kx, ky, 34);
  for (let g = 0; g < 180; g += 45) {
    const rad = (g * Math.PI) / 180;
    uit += `<path d="M${r1(kx - 30 * Math.cos(rad))} ${r1(ky - 30 * Math.sin(rad))}L${r1(kx + 30 * Math.cos(rad))} ${r1(ky + 30 * Math.sin(rad))}" class="lijn dik"/>`;
  }
  uit += tekst(kx, 160, 'van boven:', { maat: 10, klasse: 'stil' }) + tekst(kx, 173, 'ingezaagd in 8', { maat: 10, klasse: 'stil' });
  uit += label(84, 188, 'heel', 96, 188, 'end') + label(84, 120, 'zaagsneden', 116, 120, 'end');
  return svg(320, 226, 'Zweedse fakkel: een rechtopstaande stam, van boven ingezaagd tot een eind boven de grond, die van binnenuit brandt met een pan erop', uit);
}

/** The Latvian fire: a block split in four, the inner edges cut off, tied together again. */
function letsVuur() {
  const voet = 204;
  let uit = grond(voet, 320);
  uit += `<rect x="92" y="78" width="96" height="${voet - 78}" rx="6" class="vk-hout-vol"/>`;
  uit += `<path d="M140 78V${voet}" class="vk-hout-rand" stroke-width="2"/>`;
  uit += `<rect x="141" y="${voet - 24}" width="47" height="24" class="vk-gat"/>`;
  uit += `<path d="M90 110H190M90 170H190" class="vk-touw"/>`;
  uit += blok(108, 74, 172, 74, 6) + vlam(140, 70, 26, 18) + pan(140, 64, 54, 28);
  uit += label(206, 110, 'vastgebonden', 190, 110) + label(206, 192, 'luchtgat', 186, 192) + label(206, 64, 'stokjes onder de pan', 172, 72);
  // from above
  const [kx, ky] = [48, 120];
  uit += `<circle cx="${kx}" cy="${ky}" r="30" class="vk-kop"/><path d="M${kx - 30} ${ky}H${kx + 30}M${kx} ${ky - 30}V${ky + 30}" class="lijn"/><circle cx="${kx}" cy="${ky}" r="9" class="vk-gat"/>`;
  uit += tekst(kx, 168, 'van boven', { maat: 10, klasse: 'stil' });
  return svg(320, 226, 'Lets vuur: een blok in vier gekloofd, de binnenste punten eraf, weer samengebonden; in het midden een schoorsteen, onderaan een luchtgat', uit);
}

/** A tin can stove: holes at the bottom, twigs inside, the pot on top. */
function blikvuur() {
  const voet = 200;
  let uit = grond(voet, 300);
  uit += `<rect x="104" y="104" width="92" height="${voet - 104}" rx="4" class="vk-metaal"/>`;
  for (let y = 120; y < voet - 30; y += 14) uit += `<path d="M106 ${y}H194" class="vk-metaal-lijn" opacity="0.4"/>`;
  for (const x of [118, 136, 154, 172]) uit += `<circle cx="${x + 4}" cy="${voet - 14}" r="5" class="vk-gat"/>`;
  uit += vlam(150, 106, 36, 46);
  uit += `<path d="M110 104L118 84M190 104L182 84" class="vk-metaal-lijn"/>` + pan(150, 84, 64, 32);
  uit += pijl(48, voet - 14, 98, voet - 14) + tekst(30, voet - 26, 'lucht', { anker: 'start', maat: 10.5, klasse: 'stil' });
  uit += label(214, 150, 'dunne takjes', 186, 150) + label(214, 186, 'gaten', 182, 186);
  return svg(300, 222, 'Blikvuurtje: een groot blik met gaten onderin voor de lucht, gevuld met dunne takjes, met de pan erop op een draadje', uit);
}

/** The Finnish log fire: two long logs on top of each other, held by stakes, burning between them. */
function finsLogvuur() {
  const voet = 182;
  let uit = grond(voet, 320);
  uit += blok(40, voet - 12, 240, voet - 12, 22) + blok(40, voet - 37, 240, voet - 37, 22);
  for (const x of [40, 56, 140, 236, 252]) if (x !== 140) uit += blok(x, voet + 4, x, voet - 66, 5);
  for (const x of [80, 120, 160, 200]) uit += vlam(x, voet - 22, 18, 14);
  uit += tekst(140, 206, 'van opzij: paaltjes houden de bovenste stam op zijn plek', { maat: 10, klasse: 'stil' });
  const [kx, ky] = [288, 120];
  uit += kop(kx, ky + 22, 13) + kop(kx, ky - 4, 13) + vlam(kx, ky + 11, 12, 30);
  return svg(320, 214, 'Fins logvuur: twee lange stammen op elkaar, tussen paaltjes, met het vuur ertussen; rechts van voren', uit);
}

/** Wind and fire from above: an opening to the wind, smoke and sparks blowing away, no tent there. */
function windEnVuur() {
  const [cx, cy] = [130, 110];
  let uit = `<circle cx="${cx}" cy="${cy}" r="34" class="vk-grond"/>` + kolen(cx, cy, 5, 36) + vlam(cx, cy + 8, 24, 24);
  uit += `<path d="M${cx - 34} ${cy}A34 34 0 1 1 ${cx - 24} ${cy + 24}" class="lijn" stroke-dasharray="4 4"/>`;
  for (const y of [70, 110, 150]) uit += pijl(10, y, 70, y);
  uit += tekst(12, 58, 'wind', { anker: 'start', maat: 10.5, klasse: 'stil' });
  uit += `<path d="M170 96C200 80 220 108 250 92S290 84 306 96" class="vk-rook"/><path d="M168 118C198 106 222 130 252 116S292 112 308 122" class="vk-rook"/>`;
  for (const [x, y] of [[214, 102], [238, 124], [262, 100], [284, 116]]) uit += `<circle cx="${x}" cy="${y}" r="2.4" class="vk-kool"/>`;
  uit += tekst(250, 64, 'rook en vonken', { maat: 10.5 });
  uit += `<path d="M232 196L262 156L292 196Z" class="vol-licht"/><path d="M226 150L298 202M298 150L226 202" class="rood-lijn" stroke-width="3"/>`;
  uit += tekst(262, 216, 'geen tent', { maat: 10.5, klasse: 'rood-tekst' });
  uit += `<path d="M30 190h56M34 182h48M38 174h40" class="vk-hout" stroke-width="7"/>` + tekst(58, 214, 'brandhout', { maat: 10.5 });
  uit += tekst(cx - 4, cy - 46, 'opening', { maat: 10, klasse: 'stil', anker: 'end' });
  return svg(320, 226, 'Wind en vuur, van boven gezien: de opening van het vuur zit aan de windkant; rook en vonken waaien met de wind mee, en daar staat geen tent; het brandhout ligt aan de windkant', uit);
}

/** The bow drill: a bow turns the spindle on a board; the dust in the notch starts to glow. */
function vuurboog() {
  const voet = 196;
  let uit = grond(voet, 320);
  uit += `<path d="M60 ${voet - 14}H250V${voet}H60Z" class="vk-hout-vol"/>`;
  uit += `<path d="M146 ${voet - 14}L156 ${voet}H166L174 ${voet - 14}Z" class="vk-gat"/>` + kolen(160, voet + 4, 3, 22);
  uit += `<rect x="154" y="66" width="12" height="${voet - 14 - 66}" rx="3" class="vk-kop"/>`;
  uit += `<path d="M132 52H190V66H132Z" class="vk-hout-vol"/>`;
  uit += `<path d="M48 120Q160 92 286 120" class="vk-hout" stroke-width="7"/><path d="M50 122L154 112M166 116L284 122" class="vk-touw" stroke-width="1.6"/><path d="M154 110q6 6 12 0M154 116q6 6 12 0" class="vk-touw" stroke-width="1.6"/>`;
  uit += pijl(88, 92, 48, 92) + pijl(232, 92, 272, 92);
  uit += label(200, 40, 'drukblok', 186, 54) + label(196, 156, 'boor', 168, 156) + label(258, 140, 'boog', 262, 120) + label(256, 180, 'plankje', 236, 186) + label(160, 222, 'gloeiend houtstof in de inkeping', 158, 202, 'middle');
  return svg(320, 228, 'Vuurboog: een boog met een touw draait een boor heen en weer op een plankje; een drukblok houdt de boor bovenop vast; in de inkeping gaat het houtstof gloeien', uit);
}

/** The safe fireplace from above: clear ground, the fire extinguishers ready, a way out. */
function stookplek() {
  const [cx, cy] = [150, 118];
  let uit = `<circle cx="${cx}" cy="${cy}" r="64" class="vk-zand"/><circle cx="${cx}" cy="${cy}" r="64" class="lijn dun stil" stroke-dasharray="5 4"/>`;
  uit += kolen(cx, cy, 5, 34) + vlam(cx, cy + 8, 24, 22);
  // the extinguishers on one side
  uit += `<path d="M246 64h22l-3 26h-16z" class="vk-water"/><path d="M246 64h22l-3 26h-16z" class="lijn dun"/>` + tekst(257, 104, 'water', { maat: 10 });
  uit += `<path d="M246 130h22l-3 26h-16z" class="vk-zand"/><path d="M246 130h22l-3 26h-16z" class="lijn dun"/>` + tekst(257, 170, 'zand', { maat: 10 });
  uit += `<rect x="244" y="184" width="28" height="18" rx="3" class="rood"/>` + tekst(258, 216, 'branddeken', { maat: 10 });
  uit += `<path d="M30 70l18 -18M48 52l6 6-6 6-6-6z" class="lijn"/>` + tekst(42, 86, 'schep', { maat: 10 });
  uit += pijl(92, 150, 40, 176) + tekst(40, 194, 'vluchtweg', { maat: 10.5 });
  uit += tekst(cx, 40, 'geen takken boven het vuur', { maat: 10.5, klasse: 'stil' });
  uit += tekst(cx, 204, 'niets brandbaars in de kring', { maat: 10.5, klasse: 'stil' });
  return svg(300, 226, 'Een veilige stookplek van boven: het vuur op zand, niets brandbaars eromheen, water, zand, een branddeken en een schep klaar, en een vluchtweg', uit);
}

/** How wood burns: the water goes first, then the wood gives off gas that burns in flames, and the charcoal glows. */
function houtBrandt() {
  const [y1, y2] = [112, 152];
  let uit = `<rect x="30" y="${y1}" width="140" height="${y2 - y1}" class="vk-hout-vol"/>`;
  uit += `<rect x="170" y="${y1}" width="50" height="${y2 - y1}" class="vk-kop"/><path d="M170 ${y1}V${y2}" class="vk-hout-rand" stroke-width="1.2"/>`;
  uit += `<rect x="220" y="${y1}" width="80" height="${y2 - y1}" rx="4" fill="#2a1d14" stroke="#5e3b1a" stroke-width="1.2"/>`;
  for (const [x, y] of [[236, 124], [260, 140], [284, 122], [248, 146], [290, 142]]) uit += `<ellipse cx="${x}" cy="${y}" rx="7" ry="3.4" class="vk-kool"/>`;
  uit += vlam(244, y1 + 2, 50, 30) + vlam(278, y1 + 2, 64, 34);
  for (const x of [182, 196, 210]) uit += `<path d="M${x} ${y1 - 4}q-5 -8 0 -14q5 -6 0 -12" class="vk-rook"/>`;
  uit += label(110, 196, 'hout: eerst moet het water eruit', 110, y2 + 2, 'middle');
  uit += label(172, 74, 'damp en houtgas komen vrij', 186, 92, 'end');
  uit += label(236, 30, 'vlammen: brandend gas', 268, 58, 'end');
  uit += label(262, 182, 'houtskool gloeit', 262, y2 + 2, 'middle');
  return svg(330, 206, 'Hoe een stuk hout brandt, van opzij: links nog hout waar eerst het water uit moet, in het midden komen damp en houtgas vrij, rechts branden de vlammen van het houtgas en gloeit de houtskool', uit);
}

/** Tinder from nature: birch bark, dry grass, wood shavings, cattail fluff and the tinder fungus. */
function tondelSoorten() {
  const voet = 112;
  // birch bark: a curled white strip with dark marks
  let uit = `<g transform="rotate(-10 36 96)"><rect x="10" y="90" width="50" height="14" rx="2" fill="#f3efe4" stroke="#8a7f6a" stroke-width="1.4"/>`
    + `<path d="M60 90q10 0 10 8q0 8 -8 7q-6 -1 -5 -6" fill="#f3efe4" stroke="#8a7f6a" stroke-width="1.4"/>`
    + `<path d="M16 95h7M30 99h8M44 94h6M22 101h5" stroke="#3b3a36" stroke-width="1.3" stroke-linecap="round"/></g>`;
  // dry grass: a bundle of yellow blades
  for (const [dx, h] of [[-10, 34], [-5, 42], [0, 46], [5, 40], [10, 32], [-2, 38], [3, 30]]) uit += `<path d="M${104 + dx * 0.3} ${voet}Q${104 + dx} ${voet - h * 0.6} ${104 + dx * 1.8} ${voet - h}" style="fill: none; stroke: var(--vk-tondel)" stroke-width="2" stroke-linecap="round"/>`;
  // wood shavings: a few curls
  for (const [x, y] of [[156, 100], [176, 92], [170, 108]]) uit += `<path d="M${x - 12} ${y + 6}q6 -16 18 -10q8 6 0 12q-6 2 -6 -4" fill="none" style="stroke: var(--vk-kop)" stroke-width="3.2" stroke-linecap="round"/>`;
  // cattail: a brown cigar on a stalk, a tuft of fluff
  uit += `<path d="M236 ${voet}V40" style="stroke: color-mix(in srgb, var(--fam-natuur) 70%, #6b5a2b)" stroke-width="3" stroke-linecap="round"/>`;
  uit += `<rect x="229" y="56" width="14" height="36" rx="7" fill="#6b4428" stroke="#3d2614" stroke-width="1"/>`;
  uit += `<path d="M244 66q10 -4 14 4q-6 2 -4 8q-6 -4 -10 -2" fill="#efe6d2" stroke="#a89878" stroke-width="0.8"/>`;
  // tinder fungus: a hoof on a piece of trunk
  uit += `<rect x="290" y="34" width="22" height="${voet - 34}" class="vk-hout-vol"/>`;
  uit += `<path d="M290 60Q262 62 262 80Q270 86 290 84Z" fill="#8d8473" stroke="#4e483d" stroke-width="1.2"/><path d="M266 76q12 2 24 0M264 70q14 2 26 -1" fill="none" stroke="#4e483d" stroke-width="0.8"/>`;
  uit += `<path d="M0 ${voet}H340" class="lijn dun stil"/>`;
  uit += tekst(36, 134, 'berkenschors', { maat: 10.5 }) + tekst(104, 134, 'droog gras', { maat: 10.5 }) + tekst(170, 134, 'houtkrullen', { maat: 10.5 });
  uit += tekst(236, 134, 'lisdodde', { maat: 10.5 }) + tekst(300, 134, 'tondelzwam', { maat: 10.5 });
  return svg(340, 144, 'Tondel uit de natuur: een krul berkenschors, een bosje droog gras, houtkrullen, een bruine sigaar van de lisdodde met pluis, en een tondelzwam op een stam', uit);
}

/** Lighting with one match, seen from above: your back to the wind, at the opening on the windward side. */
function aanstekenWind() {
  const [cx, cy] = [196, 104];
  let uit = `<circle cx="${cx}" cy="${cy}" r="58" class="vk-grond"/>`;
  // the tent of wood from above: sticks pointing to the middle, open on the left
  for (let g = 0; g < 360; g += 24) {
    if (g > 140 && g < 220) continue;
    const r = (g * Math.PI) / 180;
    uit += blok(r1(cx + 50 * Math.cos(r)), r1(cy + 50 * Math.sin(r)), r1(cx + 10 * Math.cos(r)), r1(cy + 10 * Math.sin(r)), 4);
  }
  uit += tondel(cx, cy + 6, 24);
  // you, from above: shoulders and head, your hand with the match at the opening
  uit += `<ellipse cx="96" cy="${cy}" rx="16" ry="34" class="vol-licht"/><circle cx="108" cy="${cy}" r="11" class="vol"/>`;
  uit += `<path d="M104 ${cy + 26}Q140 ${cy + 26} 160 ${cy + 8}" class="lijn dik stil"/><path d="M160 ${cy + 8}l14 -8" stroke="#c9a227" stroke-width="2.4" stroke-linecap="round"/>` + vlam(176, cy + 1, 12, 8);
  for (const y of [60, 104, 148]) uit += pijl(8, y, 62, y);
  uit += tekst(10, 48, 'wind', { anker: 'start', maat: 10.5, klasse: 'stil' });
  uit += label(66, 184, 'rug naar de wind', 90, 140, 'middle');
  uit += label(196, 192, 'opening aan de windkant', 150, 130, 'middle');
  uit += tekst(196, 26, 'van boven', { maat: 10.5, klasse: 'stil' });
  return svg(300, 202, 'Aansteken met een lucifer, van boven gezien: de wind komt van links, jij zit met je rug naar de wind bij de opening van het vuur en steekt de tondel aan', uit);
}

/** Making char cloth in three steps: smoke from the hole, the smoke stops, black but whole. */
function charclothBlik() {
  const blik = (x, y) => `<rect x="${x - 22}" y="${y - 30}" width="44" height="30" rx="3" class="vk-metaal"/><path d="M${x - 24} ${y - 30}H${x + 24}" class="vk-metaal-lijn" stroke-width="3"/><circle cx="${x}" cy="${y - 31}" r="1.6" class="vk-gat"/>`;
  let uit = `<path d="M0 112H360" class="lijn dun stil"/>`;
  uit += kolen(60, 110, 6, 70) + blik(60, 104) + `<path d="M60 70q-6 -8 0 -16q6 -8 0 -16" class="vk-rook"/>`;
  uit += blik(180, 112);
  for (const [x, y, d] of [[270, 84, 0], [300, 92, 12], [282, 102, -8]]) uit += `<rect x="${x}" y="${y}" width="26" height="18" rx="2" transform="rotate(${d} ${x + 13} ${y + 9})" fill="#1d1b19" style="stroke: var(--stil)" stroke-width="1"/>`;
  uit += tekst(60, 136, '1. rook uit het gaatje', { maat: 10.5 });
  uit += tekst(180, 136, '2. rook stopt: eraf,', { maat: 10.5 }) + tekst(180, 150, 'dicht laten afkoelen', { maat: 10.5 });
  uit += tekst(296, 136, '3. zwart, maar heel', { maat: 10.5 });
  return svg(360, 160, 'Charcloth maken in drie stappen: een blikje met een gaatje op het vuur, waar rook uit komt; als de rook stopt haal je het eraf en laat je het dicht afkoelen; dan zijn de lapjes zwart, maar heel', uit);
}

/** Dry or wet: a dry twig snaps, a wet or living one bends; dry wood sounds clear. */
function droogNatHout() {
  let uit = `<path d="M170 20V178" class="lijn dun stil" stroke-dasharray="4 4"/>`;
  uit += tekst(85, 30, 'droog', { maat: 13, klasse: 'vet' }) + tekst(255, 30, 'nat of levend', { maat: 13, klasse: 'vet' });
  // a twig snapped in two, a little burst at the break
  uit += blok(28, 92, 80, 70, 5) + blok(90, 70, 142, 92, 5);
  uit += `<path d="M85 54v-10M74 58l-6 -8M96 58l6 -8" class="lijn rood-lijn" stroke-width="2" stroke-linecap="round"/>` + tekst(85, 112, 'breekt met een knap', { maat: 11 });
  // a twig bent in a bow
  uit += `<path d="M200 92Q255 34 310 92" class="vk-hout-rand" stroke-width="7.4" fill="none"/><path d="M200 92Q255 34 310 92" class="vk-hout" stroke-width="5" fill="none"/>` + tekst(255, 112, 'buigt', { maat: 11 });
  // two blocks knocked together
  const blokje = (x) => `<rect x="${x}" y="134" width="30" height="20" rx="2" class="vk-hout-vol"/>`;
  uit += blokje(50) + blokje(90) + `<path d="M84 128v-8M78 130l-4 -6M90 130l4 -6" class="lijn" stroke-width="1.6" stroke-linecap="round"/>` + tekst(85, 172, 'klinkt helder, voelt licht', { maat: 11 });
  uit += blokje(220) + blokje(260) + `<path d="M254 128v-5" class="lijn stil" stroke-width="1.6" stroke-linecap="round"/>` + tekst(255, 172, 'klinkt dof, voelt zwaar', { maat: 11 });
  return svg(340, 184, 'Droog of nat hout: een droog takje breekt met een knap, een nat of levend takje buigt; twee droge blokken klinken helder en voelen licht, natte klinken dof en voelen zwaar', uit);
}

/** Clean or smoky: a loose fire of dry, thin wood burns bright; wet, thick or packed wood smokes. */
function rookVergelijk() {
  const voet = 150;
  let uit = grond(voet, 340) + `<path d="M170 20V${voet}" class="lijn dun stil" stroke-dasharray="4 4"/>`;
  for (const x of [52, 64, 104, 116]) uit += blok(x, voet, 84 + (x - 84) * 0.1, 92, 4);
  uit += vlam(84, voet - 2, 62, 40) + `<path d="M86 60q-4 -8 0 -14q4 -6 0 -12" class="vk-rook" opacity="0.35"/>` + goed(140, 40);
  uit += blok(218, voet - 8, 300, voet - 8, 16) + blok(222, voet - 26, 296, voet - 26, 16);
  uit += `<g opacity="0.55">${vlam(258, voet - 32, 18, 16)}</g>`;
  for (const [x, d] of [[244, 0], [260, 8], [276, -6]]) uit += `<path d="M${x} ${voet - 40}c-14 -12 14 -22 0 -36c-12 -12 12 -20 0 -34" class="vk-rook" stroke-width="7" opacity="0.6" transform="translate(${d} 0)"/>`;
  uit += fout(318, 40);
  uit += tekst(84, 172, 'droog, dun, los gestapeld:', { maat: 10.5 }) + tekst(84, 186, 'heldergeel, weinig rook', { maat: 10.5 });
  uit += tekst(258, 172, 'nat, te dik of te strak:', { maat: 10.5 }) + tekst(258, 186, 'veel rook', { maat: 10.5 });
  return svg(340, 194, 'Schoon stoken: links een los vuurtje van droog, dun hout met heldergele vlammen en weinig rook; rechts dikke, natte blokken strak op elkaar, met een klein vlammetje en veel rook', uit);
}

/** Keeping coals until the morning: under a thick layer of ash, then uncover and blow on them. */
function kolenAs() {
  const voet = 130;
  let uit = grond(voet, 340) + `<path d="M170 20V${voet + 16}" class="lijn dun stil" stroke-dasharray="4 4"/>`;
  uit += `<path d="M34 ${voet}Q84 ${voet - 52} 134 ${voet}Z" class="vol-licht"/>` + kolen(84, voet - 5, 5, 46);
  uit += `<path d="M84 ${voet - 4}V${voet - 30}" class="lijn dun stil"/>` + tekst(84, 56, 'dikke laag as erop:', { maat: 10.5 }) + tekst(84, 70, 'weinig lucht, kolen smeulen', { maat: 10.5 });
  uit += tekst(84, 158, "'s avonds", { maat: 12, klasse: 'vet' });
  uit += kolen(256, voet - 4, 6, 70) + `<path d="M196 ${voet}q8 -14 18 -10q4 4 2 10Z" class="vol-licht"/>`;
  for (const x of [238, 252, 266, 280]) uit += `<path d="M${x - 8} ${voet - 10}L${x + 8} ${voet - 32}" class="vk-hout" stroke-width="2.4"/>`;
  uit += pijl(196, voet - 22, 226, voet - 14);
  uit += tekst(256, 56, 'as weg, voorzichtig blazen,', { maat: 10.5 }) + tekst(256, 70, 'dun aanmaakhout erop', { maat: 10.5 });
  uit += tekst(256, 158, "'s ochtends", { maat: 12, klasse: 'vet' });
  return svg(340, 166, "Kolen tot de ochtend: 's avonds een dikke laag as over de gloeiende kolen, zodat ze met weinig lucht smeulen; 's ochtends de as weg, voorzichtig aanblazen en meteen dun aanmaakhout erop", uit);
}

/** A wildfire from above: the wind drives the fire front on; you get away at right angles to it, towards the road,
 *  not ahead of it. */
function natuurbrandVluchten() {
  const w = 340; const h = 250;
  let uit = `<rect x="0" y="0" width="${w}" height="${h}" class="vk-grond"/>`;
  uit += `<rect x="0" y="22" width="${w}" height="24" class="vlak2"/><path d="M0 22H${w}M0 46H${w}" class="lijn dun stil"/>`;
  uit += `<path d="M6 34H${w - 6}" class="lijn dun stil" stroke-dasharray="10 8"/>` + tekst(w - 8, 16, 'weg', { maat: 10.5, anker: 'end', klasse: 'vet' });
  // what has burnt already, and the front
  uit += `<path d="M0 60H86Q100 100 90 140T98 236H0Z" class="vk-gat" style="opacity: 0.45"/>`;
  for (const [x, y] of [[150, 80], [262, 70], [160, 226], [282, 222], [330, 196], [236, 206]]) uit += `<circle cx="${x}" cy="${y}" r="11" class="blad"/>`;
  for (const [x, y] of [[90, 74], [98, 104], [92, 134], [90, 164], [98, 194], [100, 226]]) uit += vlam(x, y, 26, 18);
  for (const y of [96, 156, 214]) uit += pijl(112, y, 142, y, { warm: true });
  uit += pijl(14, 120, 52, 120) + tekst(33, 112, 'wind', { maat: 10.5, klasse: 'vet' });
  // you: not ahead of the fire, but across, to the road
  const [jx, jy] = [196, 150];
  uit += `<path d="M${jx + 12} ${jy}H312" class="lijn rood-lijn" stroke-width="2.2" stroke-dasharray="6 5"/>` + fout(322, jy);
  uit += `<path d="M${jx} ${jy - 12}V58" class="lijn accent-lijn" stroke-width="2.6"/><path d="M${jx - 7} 64L${jx} 52L${jx + 7} 64Z" class="accent"/>` + goed(jx + 20, 66);
  uit += `<circle cx="${jx}" cy="${jy}" r="8" class="vol"/>` + tekst(jx - 12, jy + 4, 'jij', { maat: 10.5, anker: 'end', klasse: 'vet' });
  uit += tekst(jx + 12, 98, 'haaks op de brand,', { maat: 10.5, anker: 'start' }) + tekst(jx + 12, 112, 'naar de weg', { maat: 10.5, anker: 'start' });
  uit += tekst(262, 128, 'niet voor de', { maat: 10.5, klasse: 'rood-tekst' }) + tekst(262, 142, 'brand uit', { maat: 10.5, klasse: 'rood-tekst' });
  return svg(w, h, 'Wegkomen bij een natuurbrand, van boven gezien: de wind drijft het vuurfront voor zich uit. Loop niet voor de brand uit in de richting waarin hij gaat, maar haaks op de brand, als het kan naar de openbare weg', uit);
}

export default {
  piramidevuur,
  blokhutvuur,
  'zwitserse-methode': zwitserseMethode,
  pagodevuur,
  stervuur,
  jagersvuur,
  sleutelgatvuur,
  reflectorvuur,
  greppelvuur,
  dakotavuur,
  tafelvuur,
  'zweedse-fakkel': zweedseFakkel,
  'lets-vuur': letsVuur,
  blikvuur,
  'fins-logvuur': finsLogvuur,
  'wind-en-vuur': windEnVuur,
  vuurboog,
  stookplek,
  'hout-brandt': houtBrandt,
  'tondel-soorten': tondelSoorten,
  'aansteken-wind': aanstekenWind,
  'charcloth-blik': charclothBlik,
  'droog-nat-hout': droogNatHout,
  'rook-vergelijk': rookVergelijk,
  'kolen-as': kolenAs,
  'natuurbrand-vluchten': natuurbrandVluchten,
};
