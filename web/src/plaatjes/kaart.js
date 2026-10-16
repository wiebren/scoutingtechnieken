// Small drawings of kaart and kompas for the tiles of a blad with `soorten` (src/bladkaart.js): one thing each,
// without labels, on a 160 × 120 field. The large drawings of kaart and kompas are in src/plaatjes.js. Extra
// colours (skin, mirror, sun, moon) are in ./kaart.css.
import { pol, r1, svg } from './basis.js';

const W = 160;
const H = 120;

/** A compass needle around (cx, cy): red to the north (at `graden`), grey to the south. */
function naald(cx, cy, lengte, breed, graden = 0) {
  const [nx, ny] = pol(cx, cy, lengte, graden); const [zx, zy] = pol(cx, cy, lengte, graden + 180);
  const [lx, ly] = pol(cx, cy, breed, graden - 90); const [rx, ry] = pol(cx, cy, breed, graden + 90);
  return `<path d="M${nx} ${ny} L${rx} ${ry} L${lx} ${ly}Z" class="rood"/><path d="M${zx} ${zy} L${rx} ${ry} L${lx} ${ly}Z" class="vol"/>`;
}

/** A turning housing: a ring with degree marks, an inner ring, and the needle. */
function huis(cx, cy, r, { lijnen = true } = {}) {
  let uit = `<circle cx="${cx}" cy="${cy}" r="${r}" class="vlak2"/><circle cx="${cx}" cy="${cy}" r="${r}" class="lijn"/>`;
  uit += `<circle cx="${cx}" cy="${cy}" r="${r1(r * 0.8)}" class="lijn dun"/>`;
  for (let g = 0; g < 360; g += 30) {
    const [ax, ay] = pol(cx, cy, r, g); const [bx, by] = pol(cx, cy, r * (g % 90 ? 0.9 : 0.82), g);
    uit += `<path d="M${ax} ${ay} L${bx} ${by}" class="lijn dun"/>`;
  }
  if (lijnen) {
    const d = r1(r * 0.35); const h = r1(r * 0.62);
    uit += `<path d="M${cx - d} ${cy - h} V${cy + h} M${cx + d} ${cy - h} V${cy + h}" class="lijn haar"/>`;
    uit += `<path d="M${cx} ${r1(cy + r * 0.62)} L${r1(cx + r * 0.22)} ${r1(cy + r * 0.32)} H${r1(cx - r * 0.22)}Z" class="lijn dun" fill="none"/>`;
  }
  return uit + naald(cx, cy, r * 0.74, r * 0.14);
}

/** A baseplate compass, upright: the plate with its ruler, the arrow of travel and the housing. */
function plaatkompas() {
  let uit = '<rect x="52" y="4" width="56" height="112" rx="8" class="vlak"/><rect x="52" y="4" width="56" height="112" rx="8" class="lijn"/>';
  uit += '<path d="M80 10 L86 22 H82.5 V32 H77.5 V22 H74Z" class="accent"/>';
  for (let i = 0; i <= 8; i++) uit += `<path d="M52 ${r1(84 + i * 3.6)} h${i % 4 ? 3.5 : 7}" class="lijn dun"/>`;
  uit += huis(80, 62, 24);
  return svg(W, H, 'Een plaatkompas: een doorzichtige plaat met een liniaal, een richtingspijl en een draaibaar huis met de naald', uit);
}

/** A mirror compass opened flat: the lid with the mirror, the sighting line and the notch above the plate. */
function klapspiegelkompas() {
  let uit = '';
  // the lid, folded open: a notch at the top, a mirror with a line down the middle
  uit += '<path d="M56 6 H73 L80 14 L87 6 H104 V50 H56Z" class="vlak"/><path d="M56 6 H73 L80 14 L87 6 H104 V50 H56Z" class="lijn"/>';
  uit += '<rect x="61" y="17" width="38" height="29" rx="2" class="kk-spiegel"/><rect x="61" y="17" width="38" height="29" rx="2" class="lijn dun"/>';
  uit += '<path d="M66 40 L76 22 M73 42 L83 24" class="kk-glans"/><path d="M80 14 V46" class="lijn"/>';
  // the hinge, and the plate with the housing
  uit += '<rect x="54" y="50" width="52" height="5" rx="2" class="vol-licht"/>';
  uit += '<rect x="54" y="55" width="52" height="61" rx="6" class="vlak"/><rect x="54" y="55" width="52" height="61" rx="6" class="lijn"/>';
  uit += '<path d="M80 56 V64" class="lijn dun"/>';
  for (let i = 0; i <= 6; i++) uit += `<path d="M54 ${r1(90 + i * 3.6)} h${i % 3 ? 3.5 : 6}" class="lijn dun"/>`;
  uit += huis(81, 88, 19);
  return svg(W, H, 'Een spiegelkompas met een klep: een plaatkompas met een spiegel en een vizier in de klep', uit);
}

/** A small sighting compass from the side: the housing slid out of its box, the mirror folded down under it. */
function spiegelpeilkompas() {
  let uit = '';
  // the line of sight over the top, from the eye
  uit += '<path d="M30 44 H154" class="lijn stil" stroke-dasharray="4 3"/>';
  uit += '<path d="M8 44 Q19 34 30 44 Q19 54 8 44Z" class="vlak"/><path d="M8 44 Q19 34 30 44 Q19 54 8 44Z" class="lijn dun"/><circle cx="22" cy="44" r="3.2" class="vol"/>';
  // the box, with its sights on top, and the cord
  uit += '<rect x="86" y="48" width="50" height="20" rx="3" class="vlak2"/><rect x="86" y="48" width="50" height="20" rx="3" class="lijn"/>';
  uit += '<path d="M90 48 V44 M132 48 V44" class="lijn"/>';
  uit += '<path d="M136 60 C150 62 152 84 140 96 C132 104 120 104 112 100" class="lijn dun stil" fill="none"/>';
  // the housing, slid out to the left: the edge of the dial and the needle
  uit += '<rect x="44" y="51" width="42" height="14" rx="2" class="vlak"/><rect x="44" y="51" width="42" height="14" rx="2" class="lijn"/>';
  for (let x = 48; x < 84; x += 4) uit += `<path d="M${x} 51 v3" class="lijn dun"/>`;
  uit += '<path d="M60 56 v8 M68 55 v10" class="rood-lijn" stroke-width="2.4"/>';
  // the mirror under the housing, and what you see in it
  uit += '<path d="M76 67 L40 99" class="kk-spiegel-rand"/><path d="M76 67 L40 99" class="lijn"/>';
  uit += '<path d="M50 65 V90 L30 49" class="blauw-lijn" fill="none" stroke-width="1.3" stroke-dasharray="3 2.5"/>';
  return svg(W, H, 'Een spiegelpeilkompas van opzij: het huis is uit het doosje geschoven, eronder klapt een spiegel uit; je mikt over de bovenkant en ziet de naald in de spiegel', uit);
}

/** A lensatic compass opened flat, from above: the lid with its sighting wire, the case with the floating card,
 *  the rear sight with its lens, and the thumb loop. */
function lensatisch() {
  const [cx, cy] = [80, 64];
  let uit = '';
  // the lid, up: an open frame with a wire down the middle
  uit += `<rect x="${cx - 15}" y="4" width="30" height="32" rx="3" class="vol"/><rect x="${cx - 11}" y="8" width="22" height="24" rx="1" class="vlak"/>`;
  uit += `<path d="M${cx} 8 V32" class="lijn"/><rect x="${cx - 6}" y="36" width="12" height="4" class="vol"/>`;
  // the case, with the card that turns with the needle
  uit += `<circle cx="${cx}" cy="${cy}" r="26" class="vol"/><circle cx="${cx}" cy="${cy}" r="21" class="vlak2"/>`;
  for (let g = 0; g < 360; g += 15) {
    const [ax, ay] = pol(cx, cy, 21, g + 25); const [bx, by] = pol(cx, cy, g % 45 ? 18 : 15, g + 25);
    uit += `<path d="M${ax} ${ay} L${bx} ${by}" class="lijn dun"/>`;
  }
  uit += naald(cx, cy, 13, 2.6, 25);
  // the fixed line to read off, under the wire
  uit += `<path d="M${cx} ${cy - 26} V${cy - 19}" class="lijn dik"/>`;
  // the thumb loop on the side
  uit += `<path d="M${cx + 24} ${cy - 8} A 10 10 0 1 1 ${cx + 24} ${cy + 8}" class="lijn dik" fill="none"/>`;
  // the rear sight, folded down: a slit at the end, and the lens to read the card
  uit += `<rect x="${cx - 6}" y="${cy + 26}" width="12" height="4" class="vol"/><rect x="${cx - 11}" y="${cy + 30}" width="22" height="24" rx="3" class="vol"/>`;
  uit += `<circle cx="${cx}" cy="${cy + 40}" r="7" class="kk-spiegel"/><circle cx="${cx}" cy="${cy + 40}" r="7" class="lijn dun"/>`;
  uit += `<path d="M${cx} ${cy + 49} V${cy + 54}" class="lijn"/>`;
  return svg(W, H, 'Een lensatisch kompas: een klep met een draad om te mikken, een kast met een draaiende roos, en een lensje om af te lezen', uit);
}

/** A thumb compass on a thumb: a small plate with a capsule, held by a strap. */
function duimkompas() {
  let uit = '';
  // the thumb, from below, with its nail at the tip
  uit += '<path d="M60 120 V54 Q60 28 79 28 Q98 28 98 54 V120Z" class="kk-huid"/>';
  uit += '<path d="M69 40 Q69 33 79 33 Q89 33 89 40 V50 Q79 54 69 50Z" class="kk-nagel"/>';
  // the plate on top of it (see-through), pointed at the front, with the capsule
  uit += '<path d="M66 6 L124 18 V88 Q124 96 116 96 H60 Q52 96 52 88 V20 Q52 9 66 6Z" class="kk-plaat"/>';
  uit += '<path d="M66 6 L124 18 V88 Q124 96 116 96 H60 Q52 96 52 88 V20 Q52 9 66 6Z" class="lijn"/>';
  uit += '<path d="M66 6 L66 14" class="accent-lijn" stroke-width="2.5"/>';
  for (let i = 0; i <= 5; i++) uit += `<path d="M124 ${60 + i * 5} h-${i % 5 ? 3.5 : 6}" class="lijn dun"/>`;
  uit += huis(96, 48, 20, { lijnen: false });
  // the strap around the thumb
  uit += '<rect x="56" y="99" width="46" height="10" rx="3" class="accent-licht"/><rect x="56" y="99" width="46" height="10" rx="3" class="lijn dun"/>';
  return svg(W, H, 'Een duimkompas: een klein plaatje met een kompas, met een bandje om je duim', uit);
}

/** A digital compass: a phone with a compass app, and a watch beside it. */
function digitaalKompas() {
  let uit = '<rect x="30" y="6" width="58" height="108" rx="9" class="telefoon"/><rect x="34" y="16" width="50" height="88" rx="3" class="vlak"/>';
  const [cx, cy, r] = [59, 50, 20];
  uit += `<circle cx="${cx}" cy="${cy}" r="${r}" class="vlak2"/><circle cx="${cx}" cy="${cy}" r="${r}" class="lijn dun"/>`;
  for (let g = 0; g < 360; g += 30) {
    const [ax, ay] = pol(cx, cy, r, g - 40); const [bx, by] = pol(cx, cy, r - (g % 90 ? 3 : 6), g - 40);
    uit += `<path d="M${ax} ${ay} L${bx} ${by}" class="lijn dun"/>`;
  }
  const [nx, ny] = pol(cx, cy, r - 10, -40);
  uit += `<text x="${nx}" y="${ny}" class="tekst vet rood-tekst" font-size="8" text-anchor="middle" dominant-baseline="central">N</text>`;
  uit += `<path d="M${cx} ${cy - r - 7} L${cx + 4} ${cy - r - 1} H${cx - 4}Z" class="accent"/>`;
  uit += `<text x="${cx}" y="88" class="tekst vet" font-size="12" text-anchor="middle">40°</text>`;
  // a watch with a compass on its face
  uit += '<rect x="113" y="30" width="22" height="60" rx="4" class="vol-licht"/>';
  uit += '<circle cx="124" cy="60" r="17" class="telefoon"/><circle cx="124" cy="60" r="13" class="vlak"/>';
  uit += naald(124, 60, 10, 2.6, -40);
  return svg(W, H, 'Een digitaal kompas: een kompas-app op een telefoon, en een horloge met een kompas', uit);
}

/** A gyrocompass: a fast spinning rotor in its rings; its axis turns to true north. */
function gyrokompas() {
  const [cx, cy] = [74, 56];
  let uit = `<path d="M${cx - 16} 112 L${cx - 6} 98 H${cx + 6} L${cx + 16} 112Z" class="vol-licht"/><path d="M${cx} 98 V${cy + 40}" class="lijn"/>`;
  uit += `<circle cx="${cx}" cy="${cy}" r="40" class="lijn"/>`;
  uit += `<ellipse cx="${cx}" cy="${cy}" rx="40" ry="11" class="lijn dun"/>`;
  // the rotor: a heavy wheel on an axle, spinning fast
  uit += `<ellipse cx="${cx}" cy="${cy}" rx="9" ry="25" class="vlak2"/><ellipse cx="${cx}" cy="${cy}" rx="9" ry="25" class="lijn"/>`;
  uit += `<path d="M${cx - 40} ${cy} H${cx + 40}" class="lijn dik"/>`;
  uit += `<path d="M${cx - 18} ${cy - 22} A 14 26 0 0 0 ${cx - 18} ${cy + 22}" class="accent-lijn" fill="none" stroke-width="2"/>`;
  uit += `<path d="M${cx - 18} ${cy + 22} l-1 -8 l7 4Z" class="accent"/>`;
  // the axle points to true north
  uit += `<path d="M${cx + 42} ${cy} H${cx + 66}" class="lijn"/><path d="M${cx + 74} ${cy} L${cx + 64} ${cy - 6} V${cy + 6}Z" class="accent"/>`;
  uit += `<text x="${cx + 70}" y="${cy - 14}" class="tekst vet" font-size="13" text-anchor="middle">N</text>`;
  return svg(W, H, 'Een gyrokompas: een snel draaiend wiel in ringen; de as draait zich naar het ware noorden', uit);
}

/** The watch method: the hour hand to the sun; south is midway between the hand and the 1 (winter time). */
function horloge() {
  const [cx, cy, r] = [84, 60, 34];
  const draai = 195; // the dial turned so that 16:00 points at the sun (up left)
  let uit = `<rect x="${cx - 14}" y="0" width="28" height="${H}" rx="4" class="vol-licht"/>`;
  uit += `<circle cx="${cx}" cy="${cy}" r="${r + 4}" class="vol"/><circle cx="${cx}" cy="${cy}" r="${r}" class="vlak"/>`;
  for (let u = 1; u < 12; u++) {
    const [ax, ay] = pol(cx, cy, r - 2, u * 30 + draai); const [bx, by] = pol(cx, cy, r - (u % 3 ? 6 : 9), u * 30 + draai);
    uit += `<path d="M${ax} ${ay} L${bx} ${by}" class="lijn${u % 3 ? ' dun' : ''}"/>`;
  }
  // the 12 with a double mark (the minute hand points at it: it is 16:00)
  uit += `<path d="M${pol(cx, cy, r - 2, draai + 4).join(' ')} L${pol(cx, cy, r - 9, draai + 4).join(' ')} M${pol(cx, cy, r - 2, draai - 4).join(' ')} L${pol(cx, cy, r - 9, draai - 4).join(' ')}" class="lijn"/>`;
  const [ex, ey] = pol(cx, cy, r - 15, 30 + draai);
  uit += `<text x="${ex}" y="${ey}" class="tekst vet accent-tekst" font-size="8" text-anchor="middle" dominant-baseline="central">1</text>`;
  // south midway between the hour hand and the 1, north the other way
  const [zx, zy] = pol(cx, cy, r + 14, 270); const [nx, ny] = pol(cx, cy, r + 14, 90);
  uit += `<path d="M${pol(cx, cy, r - 4, 270).join(' ')} L${pol(cx, cy, r - 4, 90).join(' ')}" class="lijn stil" stroke-dasharray="3 2.5"/>`;
  uit += `<text x="${zx}" y="${zy}" class="tekst vet" font-size="11" text-anchor="middle" dominant-baseline="central">Z</text>`;
  uit += `<text x="${nx}" y="${ny}" class="tekst vet rood-tekst" font-size="11" text-anchor="middle" dominant-baseline="central">N</text>`;
  // the hands at 16:00, and the sun the hour hand points at
  uit += `<path d="M${cx} ${cy} L${pol(cx, cy, r - 6, draai).join(' ')}" class="lijn"/>`;
  uit += `<path d="M${cx} ${cy} L${pol(cx, cy, r - 12, 120 + draai).join(' ')}" class="lijn dik"/><circle cx="${cx}" cy="${cy}" r="2.5" class="vol"/>`;
  const [sx, sy] = pol(cx, cy, r + 26, 120 + draai);
  uit += `<path d="M${pol(cx, cy, r + 6, 120 + draai).join(' ')} L${pol(cx, cy, r + 16, 120 + draai).join(' ')}" class="lijn stil" stroke-dasharray="2 2"/>`;
  uit += `<circle cx="${sx}" cy="${sy}" r="8" class="kk-zon"/>`;
  return svg(W, H, 'Een horloge met de kleine wijzer naar de zon; het zuiden ligt midden tussen die wijzer en de 1', uit);
}

/** A sundial of your own, from above: the stick, the tips of its shadow, and the shortest one to the north. */
function zonnewijzer() {
  const [cx, cy] = [80, 86];
  let uit = '';
  const tips = [[-48, 66], [-28, 54], [-12, 49], [0, 48], [14, 49], [30, 55], [48, 67]];
  for (const [g, l] of tips) {
    const [x, y] = pol(cx, cy, l, g);
    uit += `<path d="M${cx} ${cy} L${x} ${y}" class="${g ? 'lijn dun stil' : 'lijn dik'}"/><circle cx="${x}" cy="${y}" r="${g ? 2.4 : 3.4}" class="${g ? 'vol' : 'accent'}"/>`;
  }
  const [nx, ny] = pol(cx, cy, 48, 0);
  uit += `<text x="${nx + 9}" y="${ny - 4}" class="tekst vet rood-tekst" font-size="12" text-anchor="start">N</text>`;
  // the stick, seen from above, and the sun in the south
  uit += `<circle cx="${cx}" cy="${cy}" r="5" class="kk-stok"/><circle cx="${cx}" cy="${cy}" r="5" class="lijn dun"/>`;
  uit += `<circle cx="${cx}" cy="${cy + 23}" r="8" class="kk-zon"/>`;
  return svg(W, H, 'Een zelfgemaakte zonnewijzer van boven: een stok, de puntjes van zijn schaduw, en de kortste schaduw wijst naar het noorden', uit);
}

/** A moon compass: two card discs turned on each other, with the phase of the moon in a window. */
function maankompas() {
  const [cx, cy] = [72, 62];
  let uit = `<circle cx="${cx}" cy="${cy}" r="50" class="vlak2"/><circle cx="${cx}" cy="${cy}" r="50" class="lijn"/>`;
  for (const [g, t] of [[0, 'N'], [90, 'O'], [180, 'Z'], [270, 'W']]) {
    const [x, y] = pol(cx, cy, 43, g);
    uit += `<text x="${x}" y="${y}" class="tekst vet${g ? '' : ' rood-tekst'}" font-size="10" text-anchor="middle" dominant-baseline="central">${t}</text>`;
  }
  uit += `<circle cx="${cx}" cy="${cy}" r="35" class="vlak"/><circle cx="${cx}" cy="${cy}" r="35" class="lijn"/>`;
  for (let u = 0; u < 24; u++) {
    const [ax, ay] = pol(cx, cy, 35, u * 15 + 20); const [bx, by] = pol(cx, cy, u % 6 ? 31 : 28, u * 15 + 20);
    uit += `<path d="M${ax} ${ay} L${bx} ${by}" class="lijn dun"/>`;
  }
  // the window with the first quarter (lit on the right), and the pointer
  uit += `<rect x="${cx - 11}" y="${cy - 6}" width="22" height="22" rx="3" class="nacht"/>`;
  uit += `<path d="M${cx} ${cy - 2} A 7 7 0 0 1 ${cx} ${cy + 12}Z" class="kk-maan"/>`;
  uit += `<path d="M${cx} ${cy - 10} L${cx + 4} ${cy - 24} L${cx - 4} ${cy - 24}Z" class="accent" transform="rotate(20 ${cx} ${cy})"/>`;
  // the moon in the sky
  uit += '<circle cx="140" cy="24" r="13" class="lijn haar"/><path d="M140 11 A 13 13 0 0 1 140 37Z" class="kk-maan"/>';
  return svg(W, H, 'Een maankompas: twee kartonnen schijven op elkaar, met de maanstand in een venstertje', uit);
}

export default {
  'soort-plaatkompas': plaatkompas,
  'soort-klapspiegelkompas': klapspiegelkompas,
  'soort-spiegelpeilkompas': spiegelpeilkompas,
  'soort-lensatisch-kompas': lensatisch,
  'soort-duimkompas': duimkompas,
  'soort-digitaal-kompas': digitaalKompas,
  'soort-gyrokompas': gyrokompas,
  'soort-horloge': horloge,
  'soort-zonnewijzer': zonnewijzer,
  'soort-maankompas': maankompas,
};
