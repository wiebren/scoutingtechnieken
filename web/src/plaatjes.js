// Drawings for the cards, made here as SVG: no licences to look after, sharp at any size, and in the colours of
// the theme (style.css, .plaatje). A blad names one with `plaatje: 'windroos-16'`; scripts/check.mjs checks that
// it exists. They are strings, not elements, so the check can run them without a browser. The drawings of kaart
// and kompas are here; the other categories each have their own file in ./plaatjes/.

import { pol, r1, svg, tekst } from './plaatjes/basis.js';
import tocht from './plaatjes/tocht.js';
import waarnemen from './plaatjes/waarnemen.js';
import seinen from './plaatjes/seinen.js';
import geheimschrift from './plaatjes/geheimschrift.js';
import vuur from './plaatjes/vuur.js';
import koken from './plaatjes/koken.js';
import gereedschap from './plaatjes/gereedschap.js';
import kamperen from './plaatjes/kamperen.js';
import natuur from './plaatjes/natuur.js';
import weer from './plaatjes/weer.js';
import veiligheid from './plaatjes/veiligheid.js';
import touw from './plaatjes/touw.js';
import sjorren from './plaatjes/sjorren.js';

/** The 32 Dutch points of the compass, clockwise from north; "t" is "ten" (NtO: noord ten oosten). */
export const STREKEN = ['N', 'NtO', 'NNO', 'NOtN', 'NO', 'NOtO', 'ONO', 'OtN', 'O', 'OtZ', 'OZO', 'ZOtO', 'ZO', 'ZOtZ', 'ZZO', 'ZtO',
  'Z', 'ZtW', 'ZZW', 'ZWtZ', 'ZW', 'ZWtW', 'WZW', 'WtZ', 'W', 'WtN', 'WNW', 'NWtW', 'NW', 'NWtN', 'NNW', 'NtW'];

/** A wind rose with 8, 16 or 32 points, each with its name and the main ones with their degrees. */
function windroos(n) {
  const c = 175; const stap = 360 / n;
  let uit = `<circle cx="${c}" cy="${c}" r="112" class="vlak"/><circle cx="${c}" cy="${c}" r="112" class="lijn dun"/>`;
  for (let i = 0; i < 32; i++) {
    const g = i * 11.25;
    if (g % stap) continue;
    const hoofd = g % 90 === 0; const half = g % 45 === 0;
    const lengte = hoofd ? 104 : half ? 84 : g % 22.5 === 0 ? 66 : 50;
    const breed = hoofd ? 11 : half ? 8 : 5;
    const [px, py] = pol(c, c, lengte, g); const [lx, ly] = pol(c, c, breed, g - 90); const [rx, ry] = pol(c, c, breed, g + 90);
    uit += `<path d="M${lx} ${ly} L${px} ${py} L${c} ${c}Z" class="${hoofd ? 'accent' : 'vol'}"/><path d="M${rx} ${ry} L${px} ${py} L${c} ${c}Z" class="${hoofd ? 'accent-licht' : 'vol-licht'}"/>`;
    const naam = STREKEN[i];
    const [tx, ty] = pol(c, c, n === 32 && !half ? 128 : 134, g);
    const grootte = hoofd ? 17 : half ? 13 : n === 32 && g % 22.5 ? 8.5 : 10.5;
    uit += `<text x="${tx}" y="${ty}" class="tekst${hoofd ? ' vet' : ''}" font-size="${grootte}" text-anchor="middle" dominant-baseline="central">${naam}</text>`;
    if (half && n === 8) {
      const [gx, gy] = pol(c, c, g % 180 === 90 ? 162 : 152, g);       // beside O and W: clear of the letter
      uit += `<text x="${gx}" y="${gy}" class="tekst stil" font-size="9" text-anchor="middle" dominant-baseline="central">${g}°</text>`;
    }
  }
  return svg(350, 350, `Windroos met ${n} windrichtingen`, uit);
}

/** A baseplate compass with its parts named. */
function kompas() {
  const labels = [
    [258, 34, 'richtingspijl', 150, 46],
    [258, 96, 'roos met gradenring', 198, 136],
    [258, 146, 'naald (rood is noord)', 152, 150],
    [258, 196, 'noordlijnen', 174, 192],
    [258, 240, 'oriëntatiepijl', 150, 208],
    [258, 284, 'huis (draait)', 183, 233],
    [258, 330, 'plaat met liniaal', 112, 300],
  ];
  let uit = '<rect x="62" y="16" width="176" height="340" rx="22" class="vlak"/><rect x="62" y="16" width="176" height="340" rx="22" class="lijn"/>';
  for (let i = 0; i <= 10; i++) uit += `<path d="M${74} ${248 + i * 9.6}h${i % 5 ? 6 : 12}" class="lijn dun"/>`;
  uit += '<path d="M150 30 L162 58 H156 V100 H144 V58 H138Z" class="accent"/>';
  uit += '<circle cx="150" cy="176" r="66" class="vlak2"/><circle cx="150" cy="176" r="66" class="lijn"/><circle cx="150" cy="176" r="54" class="lijn dun"/>';
  for (let g = 0; g < 360; g += 10) {
    const [ax, ay] = pol(150, 176, 66, g); const [bx, by] = pol(150, 176, g % 30 ? 61 : 57, g);
    uit += `<path d="M${ax} ${ay} L${bx} ${by}" class="lijn dun"/>`;
  }
  for (const [g, t] of [[0, 'N'], [90, 'O'], [180, 'Z'], [270, 'W']]) {
    const [x, y] = pol(150, 176, 47, g);
    uit += `<text x="${x}" y="${y}" class="tekst vet" font-size="11" text-anchor="middle" dominant-baseline="central">${t}</text>`;
  }
  for (const dx of [-24, -12, 12, 24]) uit += `<path d="M${150 + dx} ${132} V${220}" class="lijn dun stil"/>`;
  uit += '<path d="M150 214 L162 196 H138Z" class="lijn" fill="none"/>';
  uit += '<path d="M150 128 L158 176 L142 176Z" class="rood"/><path d="M150 224 L158 176 L142 176Z" class="vol"/>';
  for (const [tx, ty, t, px, py] of labels) {
    uit += `<path d="M${tx - 6} ${ty} L${px} ${py}" class="lijn dun stil"/><circle cx="${px}" cy="${py}" r="2.5" class="vol"/>`;
    uit += `<text x="${tx}" y="${ty}" class="tekst" font-size="12" dominant-baseline="central">${t}</text>`;
  }
  return svg(400, 372, 'Plaatkompas met de namen van de onderdelen', uit);
}

/** The three norths, the angles between them drawn much larger than they are. */
function drieNoorden() {
  const voet = [150, 210];
  const pijl = (g, lengte) => pol(voet[0], voet[1], lengte, g);
  const [wx, wy] = pijl(0, 170); const [mx, my] = pijl(16, 160); const [kx, ky] = pijl(-9, 150);
  let uit = `<path d="M${voet[0]} ${voet[1]} L${wx} ${wy}" class="lijn dik"/><path d="M${wx} ${wy - 12} l3 8 h8 l-6.5 5 l2.5 8 l-7 -5 l-7 5 l2.5 -8 l-6.5 -5 h8z" class="accent"/>`;
  uit += `<path d="M${voet[0]} ${voet[1]} L${mx} ${my}" class="lijn dik rood-lijn"/><path d="M${mx} ${my} l-10 14 h8z" class="rood" transform="rotate(16 ${mx} ${my})"/>`;
  uit += `<path d="M${voet[0]} ${voet[1]} L${kx} ${ky}" class="lijn dik blauw-lijn"/><rect x="${kx - 7}" y="${ky - 14}" width="14" height="14" class="blauw" transform="rotate(-9 ${kx} ${ky})"/>`;
  uit += `<text x="${wx}" y="${wy - 22}" class="tekst vet" font-size="13" text-anchor="middle">ware noorden</text>`;
  uit += `<text x="${mx + 8}" y="${my + 4}" class="tekst vet" font-size="13">magnetisch noorden</text>`;
  uit += `<text x="${kx - 10}" y="${ky + 4}" class="tekst vet" font-size="13" text-anchor="end">kaartnoorden</text>`;
  uit += `<text x="175" y="240" class="tekst stil" font-size="11" text-anchor="middle">De hoeken zijn veel groter getekend dan ze zijn.</text>`;
  return svg(350, 252, 'De drie noorden: ware noorden, magnetisch noorden en kaartnoorden', uit);
}

/** Reading an RD coordinate: first along the bottom to the right (into the house), then up (the stairs). */
function rdRooster() {
  const x0 = 60; const y0 = 250; const km = 180;
  let uit = `<rect x="${x0}" y="${y0 - km}" width="${km}" height="${km}" class="vlak"/>`;
  for (let i = 1; i < 10; i++) uit += `<path d="M${x0 + (i * km) / 10} ${y0} v${-km}M${x0} ${y0 - (i * km) / 10} h${km}" class="lijn haar"/>`;
  uit += `<path d="M${x0 - 20} ${y0}H${x0 + km + 20}M${x0 - 20} ${y0 - km}H${x0 + km + 20}M${x0} ${y0 + 20}V${y0 - km - 20}M${x0 + km} ${y0 + 20}V${y0 - km - 20}" class="lijn"/>`;
  const px = x0 + 0.4 * km; const py = y0 - 0.7 * km;
  uit += `<path d="M${x0} ${y0 - 3}H${px - 4}" class="lijn dik accent-lijn"/><path d="M${px} ${y0 - 3}V${py + 6}" class="lijn dik blauw-lijn"/>`;
  uit += `<path d="M${px - 9} ${y0 - 9} l9 6 l-9 6" class="lijn accent-lijn" fill="none"/><path d="M${px - 6} ${py + 15} l6 -9 l6 9" class="lijn blauw-lijn" fill="none"/>`;
  uit += `<circle cx="${px}" cy="${py}" r="6" class="rood"/>`;
  uit += `<text x="${x0}" y="${y0 + 36}" class="tekst" font-size="12" text-anchor="middle">155</text><text x="${x0 + km}" y="${y0 + 36}" class="tekst" font-size="12" text-anchor="middle">156</text>`;
  uit += `<text x="${x0 - 26}" y="${y0}" class="tekst" font-size="12" text-anchor="end" dominant-baseline="central">463</text><text x="${x0 - 26}" y="${y0 - km}" class="tekst" font-size="12" text-anchor="end" dominant-baseline="central">464</text>`;
  uit += `<text x="${(x0 + px) / 2}" y="${y0 - 14}" class="tekst vet accent-tekst" font-size="12" text-anchor="middle">1. huisje in</text>`;
  uit += `<text x="${px + 10}" y="${(y0 + py) / 2}" class="tekst vet blauw-tekst" font-size="12">2. trapje op</text>`;
  uit += `<text x="${px + 10}" y="${py - 10}" class="tekst vet" font-size="13">155.400 – 463.700</text>`;
  return svg(320, 300, 'Een RD-coördinaat aflezen: eerst naar rechts, dan omhoog', uit);
}

/** A hill in contour lines, with its profile underneath: close together is steep. */
function hoogtelijnen() {
  const cx = 150; const cy = 100;
  const ringen = [[110, 72, 0], [84, 54, 6], [62, 40, 12], [44, 28, 16], [30, 19, 19], [18, 11, 21]];
  let uit = '';
  for (const [rx, ry, dx] of ringen) uit += `<ellipse cx="${cx + dx}" cy="${cy}" rx="${rx}" ry="${ry}" class="hoogte"/>`;
  uit += `<text x="${cx + 21}" y="${cy - 16}" class="tekst bruin-tekst" font-size="10" text-anchor="middle">15 m</text>`;
  uit += `<path d="M30 ${cy}H270" class="lijn dun stil" stroke-dasharray="4 4"/>`;
  // the profile along the dashed line: heights 0..15 m at the crossings
  const xs = ringen.flatMap(([rx, , dx]) => [cx + dx - rx, cx + dx + rx]);
  const links = ringen.map(([rx, , dx], i) => [cx + dx - rx, i]); const rechts = ringen.map(([rx, , dx], i) => [cx + dx + rx, i]).reverse();
  const basis = 290; const per = 13;
  const punten = [[30, -0.6], ...links, [cx + 21, 6.4], ...rechts, [270, -0.6]].map(([x, h]) => `${x},${r1(basis - (h + 0.6) * per)}`);
  uit += `<polyline points="${punten.join(' ')}" class="profiel"/><path d="M30 ${basis}H270" class="lijn"/>`;
  for (const x of xs) uit += `<path d="M${x} ${cy}V${basis}" class="lijn haar"/>`;
  uit += `<text x="40" y="${basis - 70}" class="tekst stil" font-size="11">flauw</text><text x="232" y="${basis - 70}" class="tekst stil" font-size="11">steil</text>`;
  return svg(300, 304, 'Een heuvel in hoogtelijnen, met het profiel eronder', uit);
}

/** Finding the Pole Star from the Plough: five times the distance between the two pointer stars. */
function poolster() {
  // the Plough (Grote Beer) and the Pole Star, roughly as they stand on an autumn evening
  const ster = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" class="ster"/>`;
  // the bowl: Merak and Dubhe at the front, Phecda and Megrez at the back, where the handle starts
  const merak = [180, 262]; const dubhe = [192, 228]; const megrez = [152, 222]; const phecda = [146, 258];
  const steel = [megrez, [118, 212], [92, 206], [60, 214]];
  let uit = '<rect width="320" height="300" rx="14" class="nacht"/>';
  const lijn = (punten) => `<polyline points="${punten.map((p) => p.join(',')).join(' ')}" class="sterlijn"/>`;
  uit += lijn([phecda, merak, dubhe, megrez, phecda]) + lijn(steel);
  // through the two front stars, five times their distance beyond Dubhe
  const d = [dubhe[0] - merak[0], dubhe[1] - merak[1]];
  const p = [r1(dubhe[0] + 5 * d[0]), r1(dubhe[1] + 5 * d[1])];
  uit += `<path d="M${dubhe[0]} ${dubhe[1]} L${p[0]} ${p[1]}" class="wijslijn"/>`;
  for (const [x, y] of [merak, dubhe, megrez, phecda, ...steel.slice(1)]) uit += ster(x, y, 4);
  uit += ster(p[0], p[1], 6);
  uit += `<text x="${p[0] - 12}" y="${p[1] + 4}" class="sterlabel vet" font-size="13" text-anchor="end">Poolster</text>`;
  uit += `<text x="40" y="286" class="sterlabel" font-size="11">Grote Beer (steelpan)</text>`;
  uit += `<text x="${dubhe[0] + 26}" y="${(dubhe[1] + p[1]) / 2}" class="sterlabel" font-size="11">5 ×</text>`;
  return svg(320, 300, 'De Poolster vinden vanuit de Grote Beer', uit);
}

/** A ruler in centimetres with the scale bars of 1:25.000, 1:50.000 and 1:100.000 under it: the same 1 km is 4, 2
 *  and 1 cm long. */
function lijnschaal() {
  const x0 = 20; const cm = 31;                                      // 10 cm on 350 units
  let uit = `<rect x="${x0 - 6}" y="10" width="${10 * cm + 12}" height="40" rx="5" class="vlak2"/>`;
  for (let mm = 0; mm <= 100; mm++) {
    const x = r1(x0 + (mm * cm) / 10); const lang = mm % 10 ? (mm % 5 ? 6 : 10) : 15;
    uit += `<path d="M${x} 10 v${lang}" class="lijn ${mm % 10 ? 'haar' : 'dun'}"/>`;
    if (!(mm % 10)) uit += `<text x="${x}" y="40" class="tekst" font-size="10" text-anchor="middle">${mm / 10}</text>`;
  }
  uit += `<text x="${x0 + 10 * cm}" y="62" class="tekst stil" font-size="9" text-anchor="end">cm</text>`;
  const balk = (y, schaal, perKm, stappen, label) => {
    let b = `<text x="${x0}" y="${y - 8}" class="tekst vet" font-size="11">${schaal}</text>`;
    const stap = (perKm * cm) / stappen.per;
    for (let i = 0; i < stappen.n; i++) {
      b += `<rect x="${r1(x0 + i * stap)}" y="${y}" width="${r1(stap)}" height="7" class="${i % 2 ? 'vlak' : 'vol'}"/>`;
    }
    b += `<rect x="${x0}" y="${y}" width="${r1(stappen.n * stap)}" height="7" class="lijn dun"/>`;
    stappen.labels.forEach(([i, t]) => { b += `<text x="${r1(x0 + i * stap)}" y="${y + 19}" class="tekst" font-size="9" text-anchor="middle">${t}</text>`; });
    return b + `<text x="${x0 + 10 * cm}" y="${y - 8}" class="tekst stil" font-size="10" text-anchor="end">${label}</text>`;
  };
  uit += balk(96, '1:25.000', 4, { per: 4, n: 8, labels: [[0, '0'], [2, '500 m'], [4, '1 km'], [8, '2 km']] }, '4 cm = 1 km');
  uit += balk(146, '1:50.000', 2, { per: 2, n: 10, labels: [[0, '0'], [2, '1 km'], [6, '3 km'], [10, '5 km']] }, '2 cm = 1 km');
  uit += balk(196, '1:100.000', 1, { per: 1, n: 10, labels: [[0, '0'], [5, '5 km'], [10, '10 km']] }, '1 cm = 1 km');
  return svg(350, 222, 'Een liniaal met de lijnschaal van 1:25.000, 1:50.000 en 1:100.000', uit);
}

/** A made-up piece of a luchtvaartkaart: an airfield with its CTR, an obstacle with its height in feet, a radio
 *  beacon, and the ground in a few strokes. Not a real place. */
function luchtkaart() {
  let uit = '<rect width="340" height="250" rx="12" class="lucht-land"/>';
  uit += '<path d="M0 182 C60 170 90 196 150 186 S260 150 340 166 V188 C270 174 220 206 150 208 S50 196 0 204Z" class="lucht-water"/>';
  uit += '<path d="M222 40 c18 -8 40 -4 46 10 c6 14 -8 30 -28 30 c-18 0 -30 -26 -18 -40Z" class="lucht-stad"/>';
  uit += '<path d="M0 120 L340 92" class="lucht-weg"/>';
  // the CTR around the airfield, with its limits
  uit += '<path d="M70 60 L176 44 L196 140 L88 158Z" class="lucht-ctr"/>';
  uit += '<text x="82" y="78" class="lucht-label vet" font-size="10">CTR</text><text x="82" y="90" class="lucht-label" font-size="9">SFC – 1500 ft</text>';
  // the airfield: a circle with its runway
  uit += '<circle cx="134" cy="102" r="12" class="lucht-veld"/><path d="M126 110 L142 94" class="lucht-baan"/>';
  uit += '<text x="150" y="122" class="lucht-label vet" font-size="9">vliegveld</text>';
  // an obstacle: a mast with its height above sea level, in feet
  uit += '<path d="M268 132 L274 116 L280 132" class="lucht-obstakel"/><circle cx="274" cy="128" r="1.6" class="lucht-punt"/>';
  uit += '<text x="274" y="146" class="lucht-label" font-size="9" text-anchor="middle">482</text><text x="286" y="122" class="lucht-label" font-size="8.5">mast</text>';
  // a radio beacon (VOR): a hexagon with a compass rose
  uit += '<circle cx="60" cy="226" r="16" class="lucht-roos"/><path d="M54 216 h12 l6 10 l-6 10 h-12 l-6 -10Z" class="lucht-vor"/>';
  uit += '<text x="82" y="230" class="lucht-label" font-size="9">baken (VOR)</text>';
  uit += '<text x="240" y="66" class="lucht-label" font-size="9">stad</text>';
  return svg(340, 250, 'Een verzonnen stukje luchtvaartkaart: vliegveld met CTR, een mast met zijn hoogte in voet en een baken', uit);
}

/** A spiegelkompas (Recta DP, Suunto MB-6) from the side: you look over the top at your goal, and see the housing
 *  in the mirror under it at the same time. */
function spiegelkompas() {
  let uit = '';
  // the line of sight over the top, to a tree
  uit += '<path d="M44 66 H300" class="lijn stil" stroke-dasharray="5 4"/>';
  uit += '<rect x="304" y="92" width="7" height="38" class="vol"/><circle cx="307" cy="78" r="22" class="accent-licht"/><circle cx="307" cy="78" r="22" class="lijn dun"/>';
  // the eye
  uit += '<path d="M18 66 Q32 52 46 66 Q32 80 18 66Z" class="vlak"/><path d="M18 66 Q32 52 46 66 Q32 80 18 66Z" class="lijn dun"/><circle cx="36" cy="66" r="4.5" class="vol"/>';
  // the box with the housing slid out, and the mirror folded down under the housing
  uit += '<rect x="160" y="70" width="58" height="22" rx="3" class="vlak2"/><rect x="160" y="70" width="58" height="22" rx="3" class="lijn"/>';
  uit += '<rect x="108" y="74" width="52" height="12" rx="2" class="vlak"/><rect x="108" y="74" width="52" height="12" rx="2" class="lijn"/>';
  uit += '<path d="M126 74 v12 M134 72 v16" class="rood-lijn" stroke-width="2.5"/>';
  uit += '<path d="M150 88 L112 126" class="lijn dik"/>';
  // what you see in the mirror: from the housing down, and to your eye
  uit += '<path d="M130 86 V108 L48 72" class="blauw-lijn" fill="none" stroke-width="1.5" stroke-dasharray="4 3"/>';
  const label = (x, y, t, anker = 'start') => `<text x="${x}" y="${y}" class="tekst" font-size="11" text-anchor="${anker}">${t}</text>`;
  uit += label(172, 58, 'over de bovenkant mik je', 'middle') + label(307, 150, 'je doel', 'middle');
  uit += label(32, 96, 'je oog', 'middle') + label(196, 108, 'het doosje', 'middle');
  uit += label(134, 152, 'de spiegel: daarin zie je', 'middle') + label(134, 166, 'het huis met de naald', 'middle');
  return svg(340, 176, 'Een spiegelkompas van opzij: je mikt over de bovenkant en ziet het kompashuis in de spiegel eronder', uit);
}

/** An oak leaf, lobed, along a midrib from its foot (x, y) upwards; zomereik with two little ears at the foot. */
function eikenblad(x, y, lengte, steel, oortjes) {
  const punten = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const breed = Math.sin(Math.PI * Math.min(1, t * 1.08)) ** 0.7 * lengte * 0.3 * (0.72 + 0.28 * Math.cos(2 * Math.PI * 4.5 * t));
    // the ears of the zomereik: two small round lobes right at the foot
    punten.push([t, Math.max(oortjes && t < 0.12 ? lengte * 0.11 * Math.sin((Math.PI * t) / 0.12) : 0, breed)]);
  }
  const voet = y - steel;
  const zijde = (k) => punten.map(([t, b]) => `${r1(x + k * b)} ${r1(voet - t * lengte)}`);
  const rechts = zijde(1); const links = zijde(-1).reverse();
  return `<path d="M${x} ${voet} L${rechts.join(' L')} L${links.join(' L')}Z" class="blad"/>`
    + `<path d="M${x} ${y} V${r1(voet - lengte * 0.96)}" class="nerf"/>`;
}

const eikel = (x, y, schuin = 0) => `<g transform="rotate(${schuin} ${x} ${y})"><ellipse cx="${x}" cy="${y + 13}" rx="7" ry="11" class="eikel"/><path d="M${x - 8} ${y + 5} Q${x} ${y - 4} ${x + 8} ${y + 5} V${y + 8} H${x - 8}Z" class="napje"/></g>`;

/** Zomereik and wintereik side by side: where the stalk is, on the leaves or on the acorns. */
function eiken() {
  let uit = '';
  // zomereik: leaf with hardly any stalk, with ears; acorns on a long stalk
  uit += eikenblad(70, 190, 120, 3, true);
  uit += '<path d="M136 120 V176" class="nerf"/>' + eikel(129, 172, 15) + eikel(143, 172, -15);
  // wintereik: leaf on a clear stalk; acorns right on the twig
  uit += eikenblad(240, 190, 104, 22, false);
  uit += '<path d="M304 112 V140" class="nerf"/>' + eikel(298, 128, 25) + eikel(310, 128, -25) + eikel(304, 138, 0);
  const label = (x, y, t, vet) => `<text x="${x}" y="${y}" class="tekst${vet ? ' vet' : ''}" font-size="${vet ? 13 : 10.5}" text-anchor="middle">${t}</text>`;
  uit += label(100, 222, 'Zomereik', true) + label(100, 238, 'blad bijna zonder steel, met oortjes') + label(100, 252, 'eikels aan een lange steel');
  uit += label(262, 222, 'Wintereik', true) + label(262, 238, 'blad met een steel') + label(262, 252, 'eikels zonder steel');
  return svg(340, 262, 'Zomereik en wintereik naast elkaar', uit);
}

/** The bloedcirkel from above: arm and tool stretched out, turned round; nobody inside. */
function bloedcirkel() {
  const c = 150;
  let uit = `<circle cx="${c}" cy="${c}" r="112" class="cirkel"/><circle cx="${c}" cy="${c}" r="112" class="rood-lijn" fill="none" stroke-width="2" stroke-dasharray="7 5"/>`;
  // you, from above: shoulders and head, the arm with the axe stretched out
  uit += `<ellipse cx="${c}" cy="${c}" rx="24" ry="13" class="vol-licht"/><circle cx="${c}" cy="${c}" r="10" class="vol"/>`;
  uit += `<path d="M${c + 20} ${c} H${c + 72}" class="lijn dik"/><path d="M${c + 70} ${c} H${c + 104}" stroke="#8b5a2b" stroke-width="5" stroke-linecap="round"/>`;
  uit += `<path d="M${c + 98} ${c - 12} h12 v24 h-12z" class="vol"/>`;
  // someone outside, waiting
  uit += `<circle cx="${c - 128}" cy="${c - 96}" r="9" class="accent"/><text x="${c - 128}" y="${c - 74}" class="tekst" font-size="10.5" text-anchor="middle">wacht</text>`;
  uit += `<text x="${c}" y="${c + 48}" class="tekst stil" font-size="11" text-anchor="middle">arm + bijl, rondgedraaid</text>`;
  return svg(300, 300, 'De bloedcirkel van bovenaf: zo ver als je arm met de bijl reikt, rondom; niemand erin', uit);
}


/** One number of the bladindeling: 40 by 25 km in eight sheets of 1:25.000, two halves of 1:50.000. */
function kaartbladen() {
  const [x0, y0, w, hh] = [30, 34, 280, 175];
  let uit = `<rect x="${x0}" y="${y0}" width="${w}" height="${hh}" class="vlak2"/>`;
  const letters = [['A', 'B', 'E', 'F'], ['C', 'D', 'G', 'H']];
  letters.forEach((rij, r) => rij.forEach((l, k) => {
    uit += `<rect x="${x0 + (k * w) / 4}" y="${y0 + (r * hh) / 2}" width="${w / 4}" height="${hh / 2}" class="lijn dun"/>`;
    uit += tekst(x0 + (k + 0.5) * (w / 4), y0 + (r + 0.5) * (hh / 2) + 6, `32 ${l}`, { maat: 15, klasse: 'vet' });
  }));
  uit += `<path d="M${x0 + w / 2} ${y0 - 6} V${y0 + hh + 6}" class="lijn dik accent-lijn"/>`;
  uit += `<rect x="${x0}" y="${y0}" width="${w}" height="${hh}" class="lijn"/>`;
  uit += tekst(x0 + w / 4, y0 - 12, '32 W (1:50.000)', { klasse: 'accent-tekst vet' }) + tekst(x0 + (3 * w) / 4, y0 - 12, '32 O (1:50.000)', { klasse: 'accent-tekst vet' });
  uit += `<circle cx="${x0 + w / 4 + 22}" cy="${y0 + 64}" r="4.5" class="rood"/>` + tekst(x0 + w / 4 + 22, y0 + 80, 'Amersfoort', { maat: 9.5 });
  uit += tekst(x0 + w / 8, y0 + hh + 22, '10 km', { maat: 10, klasse: 'stil' }) + tekst(x0 + w + 8, y0 + hh / 4 + 4, '12,5 km', { maat: 10, anker: 'start', klasse: 'stil' });
  return svg(370, 238, 'Bladindeling: vak 32 in acht bladen 1:25.000, A B E F boven en C D G H onder, en twee bladen 1:50.000, 32 W en 32 O', uit);
}

/** The magnetic field dives into the ground: about 67 degrees in the Netherlands. */
function inclinatie() {
  const [x, y] = [90, 70];
  const hoek = 67; const r = 150;
  const ex = r1(x + r * Math.cos((hoek * Math.PI) / 180)); const ey = r1(y + r * Math.sin((hoek * Math.PI) / 180));
  let uit = `<rect x="0" y="${y}" width="340" height="150" class="vlak2"/><path d="M0 ${y} H340" class="lijn"/>`;
  uit += tekst(326, y + 20, 'noord →', { anker: 'end', klasse: 'stil' }) + tekst(14, y + 20, 'de grond', { anker: 'start', klasse: 'stil', maat: 10 });
  uit += `<path d="M${x} ${y} L${ex} ${ey}" class="blauw-lijn" stroke-width="2.5" stroke-dasharray="7 4"/>`;
  uit += tekst(ex + 8, ey - 4, 'magnetisch veld', { anker: 'start', klasse: 'blauw-tekst' });
  const ax = r1(x + 52 * Math.cos((hoek * Math.PI) / 180)); const ay = r1(y + 52 * Math.sin((hoek * Math.PI) / 180));
  uit += `<path d="M${x + 52} ${y} A52 52 0 0 1 ${ax} ${ay}" class="lijn stil" fill="none"/>` + tekst(x + 66, y + 34, '67°', { klasse: 'vet', anker: 'start', maat: 13 });
  // a needle that wants to dip, on its pivot above the ground
  uit += `<g transform="rotate(${hoek / 3} 230 40)"><path d="M230 40 L280 40 L230 46Z" class="rood"/><path d="M230 40 L180 40 L230 46Z" class="vol-licht"/></g><circle cx="230" cy="42" r="3" class="vol"/>`;
  uit += tekst(230, 18, 'de noordkant van de naald wil omlaag', { maat: 10.5 });
  return svg(340, 230, 'Het magnetisch veld duikt in Nederland onder ongeveer 67 graden de grond in; de noordkant van de naald wil omlaag', uit);
}

/** One circle in degrees, mils and gon. */
function gradenstelsels() {
  const c = 200;
  let uit = `<circle cx="${c}" cy="${c}" r="70" class="vlak2"/>`;
  const ringen = [[92, ['0°', '90°', '180°', '270°'], 'accent-tekst'], [130, ['0', '1600', '3200', '4800'], 'blauw-tekst'], [170, ['0', '100', '200', '300'], 'bruin-tekst']];
  for (const [r, waarden, klasse] of ringen) {
    uit += `<circle cx="${c}" cy="${c}" r="${r - 8}" class="lijn haar"/>`;
    waarden.forEach((w, i) => {
      const [x, y] = pol(c, c, r, i * 90);
      uit += `<text x="${x}" y="${y}" class="tekst vet ${klasse}" font-size="11" text-anchor="middle" dominant-baseline="central">${w}</text>`;
    });
  }
  for (const [g, t] of [[0, 'N'], [90, 'O'], [180, 'Z'], [270, 'W']]) {
    const [x, y] = pol(c, c, 54, g);
    uit += `<text x="${x}" y="${y}" class="tekst vet" font-size="15" text-anchor="middle" dominant-baseline="central">${t}</text>`;
  }
  uit += tekst(14, 394, 'graden (360)', { anker: 'start', klasse: 'accent-tekst vet' }) + tekst(c, 394, 'mils (6400)', { klasse: 'blauw-tekst vet' }) + tekst(386, 394, 'gon (400)', { anker: 'end', klasse: 'bruin-tekst vet' });
  return svg(400, 404, 'Een cirkel in graden (360), mils (6400) en gon (400)', uit);
}

/** Round a lake at right angles: out, along, back with the same number of steps. */
function obstakelOmlopen() {
  let uit = '<path d="M120 70 C160 52 210 60 214 92 C220 128 196 158 150 160 C104 162 86 132 92 104 C96 86 104 76 120 70Z" class="blauw" opacity="0.35"/>';
  uit += tekst(150, 114, 'meer', { klasse: 'blauw-tekst vet' });
  uit += '<path d="M150 250 V20" class="lijn stil" stroke-dasharray="5 5"/>';
  uit += '<path d="M150 214 H250 V30 H150" class="accent-lijn" stroke-width="3" fill="none" stroke-linejoin="round"/>';
  uit += '<path d="M150 30 V12" class="accent-lijn" stroke-width="3"/><path d="M144 18 L150 8 L156 18" class="accent-lijn" stroke-width="3" fill="none"/>';
  uit += '<circle cx="150" cy="250" r="5" class="vol"/>' + tekst(150, 270, 'start, op je koers');
  uit += tekst(200, 232, '90° rechts: 60 passen', { maat: 10.5 }) + tekst(258, 124, 'je koers', { anker: 'start', maat: 10.5 }) + tekst(258, 138, 'tot voorbij', { anker: 'start', maat: 10.5 });
  uit += tekst(204, 48, '90° links: 60 passen', { maat: 10.5 });
  return svg(340, 280, 'Met haakse hoeken om een meer: 90 graden opzij en passen tellen, langs het meer, en terug met evenveel passen', uit);
}

/** Aiming off: aim to the left of the bridge, and you know to turn right at the ditch. */
function ernaastMikken() {
  let uit = '<path d="M10 60 H330" class="blauw-lijn" stroke-width="6"/>' + tekst(320, 50, 'sloot', { anker: 'end', klasse: 'blauw-tekst' });
  uit += '<rect x="218" y="50" width="26" height="20" class="vol-licht"/><rect x="218" y="50" width="26" height="20" class="lijn dun"/>' + tekst(231, 90, 'brug');
  uit += '<path d="M231 250 L231 70" class="lijn stil" stroke-dasharray="5 5"/>';
  uit += '<path d="M231 250 L170 66" class="accent-lijn" stroke-width="3"/><path d="M170 66 H212" class="accent-lijn" stroke-width="3"/><path d="M204 60 L214 66 L204 72" class="accent-lijn" stroke-width="3" fill="none"/>';
  uit += '<circle cx="231" cy="250" r="5" class="vol"/>' + tekst(231, 270, 'jij');
  uit += tekst(150, 150, 'mik expres links ernaast', { anker: 'end', klasse: 'accent-tekst vet' }) + tekst(150, 32, 'bij de sloot: rechtsaf', { klasse: 'accent-tekst vet' });
  uit += tekst(252, 170, 'precies mikken:', { anker: 'start', maat: 10, klasse: 'stil' }) + tekst(252, 184, 'links of rechts?', { anker: 'start', maat: 10, klasse: 'stil' });
  return svg(340, 280, 'Bewust ernaast mikken: mik links van de brug, dan weet je bij de sloot dat je rechtsaf moet', uit);
}

/** The shadow stick from above: the first mark is west, the second east, north is square to that. */
function schaduwstok() {
  const stok = [170, 200]; const een = [100, 96]; const twee = [214, 96];
  let uit = `<path d="M${stok[0]} ${stok[1]} L${een[0]} ${een[1]}" class="lijn stil" stroke-width="5" opacity="0.35"/><path d="M${stok[0]} ${stok[1]} L${twee[0]} ${twee[1]}" class="lijn stil" stroke-width="5" opacity="0.35"/>`;
  uit += `<circle cx="${stok[0]}" cy="${stok[1]}" r="7" class="vol"/>` + tekst(stok[0], stok[1] + 24, 'de stok');
  uit += `<circle cx="${een[0]}" cy="${een[1]}" r="8" class="vol-licht"/><circle cx="${twee[0]}" cy="${twee[1]}" r="8" class="vol-licht"/>`;
  uit += tekst(een[0], een[1] + 26, '1e steentje', { maat: 10.5 }) + tekst(twee[0], twee[1] + 26, 'na een kwartier', { maat: 10.5 });
  uit += `<path d="M${een[0] + 12} ${een[1]} H${twee[0] - 14}" class="accent-lijn" stroke-width="2.5"/><path d="M${twee[0] - 22} ${een[1] - 6} L${twee[0] - 12} ${een[1]} L${twee[0] - 22} ${een[1] + 6}" class="accent-lijn" stroke-width="2.5" fill="none"/>`;
  uit += tekst(een[0] - 14, een[1] + 4, 'W', { anker: 'end', maat: 15, klasse: 'vet' }) + tekst(twee[0] + 14, twee[1] + 4, 'O', { anker: 'start', maat: 15, klasse: 'vet' });
  uit += `<path d="M157 82 V30" class="rood-lijn" stroke-width="2.5"/><path d="M151 38 L157 26 L163 38" class="rood-lijn" stroke-width="2.5" fill="none"/>` + tekst(157, 18, 'N', { maat: 15, klasse: 'vet' });
  return svg(320, 240, 'De schaduwstok van bovenaf: het eerste steentje ligt west, het tweede oost; het noorden staat er haaks op', uit);
}

/** A home-made compass: a magnetised needle on a slice of cork, floating in a bowl of water. */
function kurkkompas() {
  let uit = '<path d="M40 90 Q170 70 300 90 L280 170 Q170 196 60 170Z" class="vlak2"/><path d="M40 90 Q170 70 300 90 L280 170 Q170 196 60 170Z" class="lijn"/>';
  uit += '<path d="M48 104 Q170 92 292 104" class="blauw-lijn" stroke-width="2"/>';
  uit += '<ellipse cx="170" cy="100" rx="38" ry="9" class="kurk"/>';
  uit += '<path d="M112 96 L228 96" class="lijn dik"/><circle cx="114" cy="96" r="3" class="vlak"/><circle cx="114" cy="96" r="3" class="lijn dun"/>';
  uit += tekst(240, 70, 'naald, gestreken met een magneet', { maat: 10.5 }) + tekst(170, 132, 'kurk drijft op water', { maat: 10.5, klasse: 'stil' });
  uit += tekst(100, 70, 'oog', { maat: 10.5, klasse: 'stil' });
  return svg(340, 200, 'Een kompas van een naald op een plakje kurk, drijvend in een bakje water', uit);
}

/** Three satellites, three distances: where the circles meet, you are. */
function gpsWerking() {
  const jij = [180, 150];
  const sats = [[60, 50], [300, 60], [190, 270]];
  let uit = '';
  for (const [x, y] of sats) {
    const r = r1(Math.hypot(x - jij[0], y - jij[1]));
    uit += `<circle cx="${x}" cy="${y}" r="${r}" class="blauw-lijn" fill="none" stroke-dasharray="6 4" stroke-width="1.4"/>`;
  }
  for (const [x, y] of sats) uit += `<rect x="${x - 9}" y="${y - 6}" width="18" height="12" rx="2" class="vol"/><path d="M${x - 20} ${y} h40" class="lijn dik stil"/>`;
  uit += `<circle cx="${jij[0]}" cy="${jij[1]}" r="7" class="rood"/>` + tekst(jij[0] + 14, jij[1] - 10, 'jij', { anker: 'start', klasse: 'vet', maat: 13 });
  return svg(360, 320, 'Drie satellieten, drie afstanden: waar de drie cirkels samenkomen, ben jij', uit);
}

/** A phone with a compass app: the dial turns, the top of the phone is the direction you read; a figure 8 to set it. */
function telefoonkompas() {
  const [cx, cy, r] = [110, 146, 54];
  const koers = 312;
  let uit = '<rect x="44" y="12" width="132" height="268" rx="22" class="telefoon"/><rect x="52" y="34" width="116" height="224" rx="6" class="vlak"/>';
  uit += '<rect x="96" y="20" width="28" height="6" rx="3" class="vlak2"/>';
  // the dial, turned so that the heading is at the top
  uit += `<circle cx="${cx}" cy="${cy}" r="${r}" class="vlak2"/><circle cx="${cx}" cy="${cy}" r="${r}" class="lijn dun"/>`;
  for (let g = 0; g < 360; g += 10) {
    const [ax, ay] = pol(cx, cy, r, g - koers); const [bx, by] = pol(cx, cy, r - (g % 30 ? 5 : 9), g - koers);
    uit += `<path d="M${ax} ${ay} L${bx} ${by}" class="lijn ${g % 30 ? 'dun' : ''}"/>`;
  }
  for (const [g, naam] of [[0, 'N'], [90, 'O'], [180, 'Z'], [270, 'W']]) {
    const [x, y] = pol(cx, cy, r - 19, g - koers);
    uit += `<text x="${x}" y="${y}" class="tekst vet${g ? '' : ' rood-tekst'}" font-size="12" text-anchor="middle" dominant-baseline="central">${naam}</text>`;
  }
  const [nx, ny] = pol(cx, cy, r + 4, -koers);
  uit += `<circle cx="${nx}" cy="${ny}" r="3.5" class="rood"/>`;
  // the fixed mark at the top and the line along the phone
  uit += `<path d="M${cx} ${cy - r - 14} L${cx + 6} ${cy - r - 4} H${cx - 6}Z" class="accent"/>`;
  uit += `<path d="M${cx} ${cy - 26} V${cy + 26} M${cx - 26} ${cy} H${cx + 26}" class="lijn haar"/>`;
  uit += tekst(cx, 232, `${koers}° NW`, { maat: 22, klasse: 'vet' });
  // the labels
  uit += `<path d="M${cx + 8} ${cy - r - 9} L214 66" class="lijn dun stil"/>`;
  uit += tekst(218, 58, 'de bovenkant van je', { anker: 'start' }) + tekst(218, 72, 'telefoon wijst naar 312°', { anker: 'start' });
  uit += `<path d="M${nx + 4} ${ny - 2} L214 116" class="lijn dun stil"/>`;
  uit += tekst(218, 114, 'het noorden', { anker: 'start', klasse: 'rood-tekst' }) + tekst(218, 128, '(de roos draait mee)', { anker: 'start', klasse: 'stil' });
  // the figure 8 to set it
  const acht = (u) => [r1(250 + 28 * Math.sin(u) * Math.cos(u)), r1(184 + 28 * Math.sin(u))];
  uit += `<path d="M${Array.from({ length: 61 }, (_, i) => acht((i * Math.PI) / 30).join(' ')).join(' L')}Z" class="accent-lijn" fill="none" stroke-width="2.5"/>`;
  const [[px, py], [qx, qy]] = [acht(2.05), acht(2.2)];
  const hoek = r1((Math.atan2(qy - py, qx - px) * 180) / Math.PI);
  uit += `<path d="M-7 -6 L1 0 L-7 6" transform="translate(${qx} ${qy}) rotate(${hoek})" class="accent-lijn" fill="none" stroke-width="2.5"/>`;
  uit += tekst(218, 236, 'draai hem een paar keer', { anker: 'start' }) + tekst(218, 250, 'in een 8 om hem bij te', { anker: 'start' }) + tekst(218, 264, 'stellen', { anker: 'start' });
  return svg(360, 292, 'Een telefoon met een kompas-app: de roos draait mee, bovenaan lees je 312 graden af. Ernaast een 8: zo stel je hem bij.', uit);
}

/** NAP: the zero of all heights in the Netherlands, with a peilmerk; the extremes are not to scale. */
function nap() {
  const nul = 112;
  let uit = '<path d="M0 ' + (nul + 6) + ' Q15 ' + (nul + 1) + ' 30 ' + (nul + 6) + ' T60 ' + (nul + 6) + ' T90 ' + (nul + 6) + ' V200 H0Z" class="water"/>';
  // dike, polder below NAP, a town, a hill (not to scale)
  uit += `<path d="M90 200 V${nul + 6} L112 ${nul - 26} H124 L150 ${nul + 46} H226 L250 ${nul + 10} H300 Q330 ${nul - 10} 352 ${nul - 70} Q366 ${nul - 92} 380 ${nul - 96} V200Z" class="vlak2"/>`;
  uit += `<path d="M90 ${nul + 6} L112 ${nul - 26} H124 L150 ${nul + 46} H226 L250 ${nul + 10} H300 Q330 ${nul - 10} 352 ${nul - 70} Q366 ${nul - 92} 380 ${nul - 96}" class="lijn"/>`;
  uit += `<path d="M0 ${nul} H380" class="accent-lijn" stroke-width="2" stroke-dasharray="7 4"/>`;
  uit += tekst(8, nul - 8, 'NAP = 0 m', { anker: 'start', klasse: 'accent-tekst vet', maat: 12 });
  uit += tekst(46, nul + 32, 'zee', { klasse: 'stil' }) + tekst(118, nul - 32, 'dijk', { klasse: 'stil' });
  uit += tekst(188, nul + 40, 'polder: onder NAP', { maat: 10.5 });
  uit += `<path d="M188 ${nul + 4} V${nul + 26}" class="lijn dun stil"/><path d="M184 ${nul + 22} L188 ${nul + 28} L192 ${nul + 22}" class="lijn dun stil"/>`;
  // a wall with a peilmerk
  uit += `<rect x="262" y="${nul - 40}" width="26" height="${50}" class="vlak"/><rect x="262" y="${nul - 40}" width="26" height="50" class="lijn dun"/>`;
  uit += `<circle cx="275" cy="${nul - 22}" r="4.5" class="brons"/>` + `<path d="M271 ${nul - 24} L242 ${nul - 44}" class="lijn dun stil"/>`;
  uit += tekst(238, nul - 58, 'peilmerk:', { anker: 'end', maat: 10.5 }) + tekst(238, nul - 46, 'een bronzen bout', { anker: 'end', maat: 10.5 });
  uit += tekst(334, 22, 'Vaalserberg', { anker: 'end', maat: 10.5 }) + tekst(334, 34, 'ruim 322 m boven NAP', { anker: 'end', maat: 10.5, klasse: 'stil' });
  uit += tekst(188, 186, 'laagste punt: 6,76 m onder NAP', { maat: 10.5, klasse: 'stil' });
  uit += tekst(372, 196, 'niet op schaal', { anker: 'end', maat: 9.5, klasse: 'stil' });
  return svg(380, 204, 'NAP is de nul van alle hoogtes in Nederland. Een polder ligt eronder, de Vaalserberg ruim 322 meter erboven. Overal zitten bronzen peilmerken.', uit);
}

/** A small compass: housing, north mark and the needle turned `naald` degrees from up. */
function kleinKompas(cx, cy, naald) {
  const [nx, ny] = pol(cx, cy, 26, naald); const [zx, zy] = pol(cx, cy, 26, naald + 180);
  const [lx, ly] = pol(cx, cy, 5, naald - 90); const [rx, ry] = pol(cx, cy, 5, naald + 90);
  return `<circle cx="${cx}" cy="${cy}" r="34" class="vlak"/><circle cx="${cx}" cy="${cy}" r="34" class="lijn"/>`
    + `<path d="M${cx} ${cy - 34} V${cy - 28}" class="lijn"/>`
    + `<path d="M${nx} ${ny} L${lx} ${ly} L${rx} ${ry}Z" class="rood"/><path d="M${zx} ${zy} L${lx} ${ly} L${rx} ${ry}Z" class="vol"/>`;
}

/** Deviatie: the same compass far from iron and next to a fence: the needle is pulled away. */
function deviatie() {
  let uit = kleinKompas(80, 70, 0) + kleinKompas(250, 70, 24);
  for (let x = 300; x <= 360; x += 15) uit += `<path d="M${x} 30 V118" class="lijn dik stil"/>`;
  uit += '<path d="M292 46 H368 M292 96 H368" class="lijn stil" stroke-width="2"/>';
  uit += `<path d="M250 36 V22" class="accent-lijn" stroke-width="1.5" stroke-dasharray="3 3"/>`;
  uit += tekst(80, 132, 'ver van ijzer', { maat: 11.5 }) + tekst(80, 147, 'de naald wijst naar het noorden', { maat: 10.5, klasse: 'stil' });
  uit += tekst(250, 132, 'naast een hek', { maat: 11.5 }) + tekst(250, 147, 'het ijzer trekt de naald opzij', { maat: 10.5, klasse: 'stil' });
  uit += tekst(330, 22, 'hek', { maat: 10.5, klasse: 'stil' });
  return svg(380, 158, 'Links een kompas ver van ijzer: de naald wijst naar het noorden. Rechts hetzelfde kompas naast een ijzeren hek: de naald staat scheef.', uit);
}

/** Two bearings to two towers; the lines back from the towers cross where you are. */
function insnijding() {
  const jij = [176, 168]; const A = [312, 54]; const B = [54, 82];
  const richting = ([x, y]) => Math.round((((Math.atan2(x - jij[0], -(y - jij[1])) * 180) / Math.PI) + 360) % 360);
  const verleng = ([x, y], f) => [r1(x + (jij[0] - x) * f), r1(y + (jij[1] - y) * f)];
  let uit = '<rect x="10" y="10" width="360" height="220" rx="6" class="vlak2"/>';
  for (const x of [70, 150, 230, 310]) uit += `<path d="M${x} 10 V230" class="blauw-lijn" stroke-width="0.8" opacity="0.6"/>`;
  for (const [t, naam] of [[A, 'A'], [B, 'B']]) {
    const [ex, ey] = verleng(t, 1.35);
    uit += `<path d="M${t[0]} ${t[1]} L${ex} ${ey}" class="rood-lijn" stroke-width="2" stroke-dasharray="7 4"/>`;
    uit += `<path d="M${t[0] - 6} ${t[1] + 8} L${t[0]} ${t[1] - 12} L${t[0] + 6} ${t[1] + 8}Z" class="vol"/>`;
    uit += tekst(t[0] + (naam === 'A' ? -14 : 14), t[1] - 2, `toren ${naam}`, { anker: naam === 'A' ? 'end' : 'start', maat: 11 });
  }
  uit += `<circle cx="${jij[0]}" cy="${jij[1]}" r="7" class="accent"/>` + tekst(jij[0] - 12, jij[1] + 4, 'hier sta jij', { anker: 'end', klasse: 'vet', maat: 12 });
  const [ra, rb] = [richting(A), richting(B)];
  uit += tekst(368, 214, `naar A: ${ra}°, terug ${(ra + 180) % 360}°`, { anker: 'end', maat: 10.5, klasse: 'stil' });
  uit += tekst(18, 214, `naar B: ${rb}°, terug ${(rb + 180) % 360}°`, { anker: 'start', maat: 10.5, klasse: 'stil' });
  return svg(380, 240, `Twee peilingen: naar toren A ${ra} graden, naar toren B ${rb} graden. Vanaf elke toren trek je de terugkoers; waar de lijnen kruisen, sta jij.`, uit);
}

/** Waypoint, route and track side by side. */
function gpsTrack() {
  const paneel = (x, titel, inhoud, onder) => `<rect x="${x}" y="10" width="116" height="120" rx="8" class="vlak2"/>${inhoud}`
    + tekst(x + 58, 150, titel, { klasse: 'vet', maat: 12 }) + tekst(x + 58, 165, onder, { maat: 10, klasse: 'stil' });
  const vlag = (x, y) => `<path d="M${x} ${y} V${y - 26}" class="lijn"/><path d="M${x} ${y - 26} l16 6 l-16 6Z" class="rood"/><circle cx="${x}" cy="${y}" r="3" class="vol"/>`;
  let uit = paneel(4, 'waypoint', vlag(62, 86), 'één punt');
  const route = [[146, 108], [176, 52], [222, 88], [236, 34]];
  uit += paneel(132, 'route', `<path d="M${route.map((q) => q.join(' ')).join(' L')}" class="accent-lijn" stroke-width="2" stroke-dasharray="6 4" fill="none"/>`
    + route.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" class="accent"/>`).join(''), 'vooraf gepland');
  const track = Array.from({ length: 24 }, (_, i) => [r1(274 + i * 3.9 + Math.sin(i * 1.3) * 3), r1(108 - i * 3.2 + Math.cos(i * 0.9) * 7)]);
  uit += paneel(260, 'track', `<path d="M${track.map((q) => q.join(' ')).join(' L')}" class="rood-lijn" stroke-width="2" fill="none"/>`
    + track.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" class="rood"/>`).join(''), 'echt gelopen');
  return svg(380, 172, 'Een waypoint is één punt, een route een reeks punten die je vooraf plant, een track het spoor dat je echt gelopen hebt.', uit);
}

/** The GPS points straight at the goal, through everything; you walk the paths around. */
function gpsRechteLijn() {
  let uit = '<rect x="10" y="10" width="360" height="190" rx="6" class="vlak2"/>';
  uit += '<ellipse cx="196" cy="104" rx="66" ry="40" class="water"/>' + tekst(196, 108, 'ven', { klasse: 'stil' });
  uit += '<path d="M44 176 C70 150 90 160 116 150 C126 106 110 60 160 46 C220 30 270 40 300 56 C320 66 326 50 336 40" class="lijn" stroke-width="5" stroke-linecap="round" opacity="0.25"/>';
  uit += '<path d="M44 176 C70 150 90 160 116 150 C126 106 110 60 160 46 C220 30 270 40 300 56 C320 66 326 50 336 40" class="lijn dun stil" stroke-dasharray="2 3"/>';
  uit += '<path d="M44 176 L330 44" class="accent-lijn" stroke-width="2.5"/><path d="M318 44 L332 43 L324 55" class="accent-lijn" stroke-width="2.5" fill="none"/>';
  uit += '<circle cx="44" cy="176" r="7" class="accent"/>' + tekst(56, 192, 'jij', { anker: 'start', klasse: 'vet' });
  uit += '<path d="M334 40 l-6 -14 h12Z" class="rood"/>' + tekst(322, 34, 'punt', { anker: 'end', klasse: 'vet' });
  uit += tekst(264, 138, 'de GPS wijst recht', { maat: 10.5, klasse: 'accent-tekst' }) + tekst(264, 151, 'door alles heen', { maat: 10.5, klasse: 'accent-tekst' });
  uit += tekst(100, 40, 'jij loopt over het pad', { maat: 10.5, klasse: 'stil' });
  return svg(380, 210, 'De GPS wijst in een rechte lijn naar het punt, dwars door het ven. Jij loopt eromheen over het pad.', uit);
}

// A rough outline of the Netherlands (mainland, without the islands), in degrees: enough to show where things are.
const NEDERLAND = [[51.37, 3.37], [51.27, 3.8], [51.35, 4.25], [51.45, 4.45], [51.43, 4.85], [51.42, 5.05], [51.25, 5.25],
  [51.18, 5.6], [51.05, 5.85], [50.88, 5.65], [50.75, 5.7], [50.75, 6.02], [50.92, 6.08], [51.07, 5.98], [51.25, 6.17],
  [51.5, 6.2], [51.85, 5.95], [51.83, 6.4], [51.98, 6.83], [52.22, 7.07], [52.45, 7.0], [52.65, 7.05], [53.0, 7.2],
  [53.23, 7.2], [53.32, 7.0], [53.45, 6.85], [53.43, 6.2], [53.4, 5.6], [53.2, 5.4], [52.93, 5.03], [52.96, 4.73],
  [52.6, 4.6], [52.1, 4.25], [51.98, 4.05], [51.82, 3.85], [51.6, 3.65], [51.45, 3.5]];

/** UTM zones 31 and 32 over the Netherlands: the edge is 6° oost, about at Apeldoorn. */
function utmZones() {
  const kaart = ([lat, lon]) => [r1(50 + (lon - 3.3) * 100 * Math.cos((52 * Math.PI) / 180)), r1(10 + (53.55 - lat) * 100)];
  const [x6] = kaart([52, 6]);
  let uit = `<rect x="0" y="0" width="${x6}" height="300" class="accent-licht" opacity="0.35"/><rect x="${x6}" y="0" width="${380 - x6}" height="300" class="vlak2"/>`;
  uit += `<path d="M${NEDERLAND.map((q) => kaart(q).join(' ')).join(' L')}Z" class="vlak"/><path d="M${NEDERLAND.map((q) => kaart(q).join(' ')).join(' L')}Z" class="lijn"/>`;
  uit += `<path d="M${x6} 0 V300" class="rood-lijn" stroke-width="2" stroke-dasharray="7 4"/>`;
  const [ax, ay] = kaart([52.21, 5.97]);
  uit += `<circle cx="${ax}" cy="${ay}" r="4" class="vol"/>` + tekst(ax - 8, ay + 4, 'Apeldoorn', { anker: 'end', maat: 10.5 });
  uit += tekst(100, 284, 'zone 31U', { klasse: 'vet', maat: 13 }) + tekst(310, 284, 'zone 32U', { klasse: 'vet', maat: 13 });
  uit += tekst(x6 - 6, 14, '6° oost', { anker: 'end', maat: 10.5, klasse: 'rood-tekst' });
  return svg(380, 300, 'Nederland ligt in UTM-zone 31U. Het deel ten oosten van 6 graden oost, ongeveer vanaf Apeldoorn, ligt in zone 32U.', uit);
}

/** Breedte and lengte on a globe: from the equator up to 52°, from Greenwich east to 5°. */
function breedteLengte() {
  const [cx, cy, r] = [150, 150, 120]; const [lat0, lon0] = [25 * Math.PI / 180, 15 * Math.PI / 180];
  const proj = (lat, lon) => {
    const [f, l] = [lat * Math.PI / 180, lon * Math.PI / 180];
    const x = Math.cos(f) * Math.sin(l - lon0);
    const y = Math.cos(lat0) * Math.sin(f) - Math.sin(lat0) * Math.cos(f) * Math.cos(l - lon0);
    const z = Math.sin(lat0) * Math.sin(f) + Math.cos(lat0) * Math.cos(f) * Math.cos(l - lon0);
    return [r1(cx + r * x), r1(cy - r * y), z];
  };
  const lijn = (punten, cls) => {
    let d = ''; let aan = false;
    for (const [x, y, z] of punten) { if (z < 0) { aan = false; continue; } d += `${aan ? 'L' : 'M'}${x} ${y}`; aan = true; }
    return `<path d="${d}" class="${cls}" fill="none"/>`;
  };
  const reeks = (n, f) => Array.from({ length: n + 1 }, (_, i) => f(i / n));
  let uit = `<circle cx="${cx}" cy="${cy}" r="${r}" class="vlak2"/><circle cx="${cx}" cy="${cy}" r="${r}" class="lijn"/>`;
  for (let lat = -60; lat <= 60; lat += 30) if (lat) uit += lijn(reeks(90, (t) => proj(lat, -180 + 360 * t)), 'lijn haar');
  for (let lon = -60; lon <= 90; lon += 30) if (lon) uit += lijn(reeks(90, (t) => proj(-90 + 180 * t, lon)), 'lijn haar');
  uit += lijn(reeks(120, (t) => proj(0, -180 + 360 * t)), 'lijn');
  uit += lijn(reeks(90, (t) => proj(-90 + 180 * t, 0)), 'lijn');
  uit += lijn(reeks(40, (t) => proj(52 * t, 5)), 'accent-lijn breed');
  uit += lijn(reeks(20, (t) => proj(52, 5 * t)), 'rood-lijn breed');
  const [px, py] = proj(52, 5);
  uit += `<circle cx="${px}" cy="${py}" r="5.5" class="rood"/>`;
  const [ex, ey] = proj(0, -38); const [gx, gy] = proj(-30, 0);
  uit += tekst(ex, ey + 15, 'evenaar', { maat: 10.5, klasse: 'stil' }) + tekst(gx + 4, gy, 'Greenwich', { anker: 'start', maat: 10.5, klasse: 'stil' });
  uit += tekst(312, 96, 'Nederland', { anker: 'start', klasse: 'vet', maat: 12 }) + `<path d="M${px + 6} ${py - 2} L308 92" class="lijn dun stil"/>`;
  uit += tekst(312, 128, '52° noorderbreedte:', { anker: 'start', maat: 10.5, klasse: 'accent-tekst' }) + tekst(312, 141, 'vanaf de evenaar', { anker: 'start', maat: 10.5, klasse: 'accent-tekst' });
  uit += tekst(312, 166, '5° oosterlengte:', { anker: 'start', maat: 10.5, klasse: 'rood-tekst' }) + tekst(312, 179, 'vanaf Greenwich', { anker: 'start', maat: 10.5, klasse: 'rood-tekst' });
  return svg(420, 300, 'De aarde met de evenaar en de meridiaan van Greenwich. Nederland ligt op ongeveer 52 graden noorderbreedte en 5 graden oosterlengte.', uit);
}

/** A multicache: from stop to stop, each gives what you need for the next. */
function multicache() {
  const stops = [[40, 110, 'start', 'coördinaat'], [140, 50, 'stop 1', 'tel de ramen'], [240, 120, 'stop 2', 'reken het uit'], [336, 56, 'de doos', '']];
  let uit = '';
  for (let i = 1; i < stops.length; i++) {
    const [[ax, ay], [bx, by]] = [stops[i - 1], stops[i]];
    uit += `<path d="M${ax} ${ay} Q${(ax + bx) / 2} ${Math.min(ay, by) - 30} ${bx} ${by}" class="accent-lijn" stroke-width="2" stroke-dasharray="6 4" fill="none"/>`;
  }
  for (const [x, y, naam, wat] of stops) {
    uit += naam === 'de doos'
      ? `<rect x="${x - 15}" y="${y - 11}" width="30" height="22" rx="3" class="accent"/><path d="M${x - 15} ${y - 3} H${x + 15}" class="lijn dun" stroke="var(--op-accent)"/>`
      : `<circle cx="${x}" cy="${y}" r="10" class="vlak"/><circle cx="${x}" cy="${y}" r="10" class="lijn"/><text x="${x}" y="${y + 4}" class="tekst vet" font-size="11" text-anchor="middle">?</text>`;
    uit += tekst(x, y + 28, naam, { klasse: 'vet' }) + (wat ? tekst(x, y + 42, wat, { maat: 10, klasse: 'stil' }) : '');
  }
  return svg(380, 170, 'Een multicache: bij de start krijg je een coördinaat, op elke stop een aanwijzing voor de volgende, tot de doos.', uit);
}

/** A kaarthoekmeter on a km square: corner on the point, the scales left and down, read where the km-lines cross. */
function kaarthoekmeter() {
  const [x0, y0, km] = [80, 250, 200];                       // the square 155-156 / 463-464, 2 units a 10 m
  const [px, py] = [x0 + 0.4 * km, y0 - 0.7 * km];           // 155.400 - 463.700
  const st = km / 10;                                        // 100 m
  let uit = `<rect x="${x0}" y="${y0 - km}" width="${km}" height="${km}" class="vlak2"/>`;
  uit += `<path d="M${x0 - 16} ${y0}H${x0 + km + 16}M${x0 - 16} ${y0 - km}H${x0 + km + 16}M${x0} ${y0 + 16}V${y0 - km - 16}M${x0 + km} ${y0 + 16}V${y0 - km - 16}" class="lijn"/>`;
  uit += tekst(x0, y0 + 30, '155', { maat: 12 }) + tekst(x0 + km, y0 + 30, '156', { maat: 12 });
  uit += tekst(x0 - 20, y0 + 4, '463', { maat: 12, anker: 'end' }) + tekst(x0 - 20, y0 - km + 4, '464', { maat: 12, anker: 'end' });
  // the card: a strip to the left of the point (0-500 m) and one down from it (0-800 m)
  const kaartje = `M${px} ${py}H${px - 5.5 * st}V${py + 18}H${px - 18}V${py + 8.5 * st}H${px}Z`;
  uit += `<path d="${kaartje}" class="vlak" opacity="0.85"/><path d="${kaartje}" class="lijn dun"/>`;
  for (let i = 0; i <= 5; i++) {
    uit += `<path d="M${px - i * st} ${py}v${i % 5 ? 6 : 9}" class="lijn dun"/>`;
    if (i < 5) for (let j = 1; j < 10; j++) uit += `<path d="M${r1(px - (i + j / 10) * st)} ${py}v3" class="lijn haar"/>`;
    if (i) uit += tekst(px - i * st, py + 16, String(i), { maat: 8.5 });
  }
  for (let i = 0; i <= 8; i++) {
    uit += `<path d="M${px} ${py + i * st}h${i % 5 ? -6 : -9}" class="lijn dun"/>`;
    if (i < 8) for (let j = 1; j < 10; j++) uit += `<path d="M${px} ${r1(py + (i + j / 10) * st)}h-3" class="lijn haar"/>`;
    if (i) uit += tekst(px - 12, py + i * st + 3, String(i), { maat: 8.5 });
  }
  uit += `<circle cx="${x0}" cy="${py}" r="6" class="accent" opacity="0.5"/><circle cx="${px}" cy="${y0}" r="6" class="blauw" opacity="0.5"/>`;
  uit += `<circle cx="${px}" cy="${py}" r="4.5" class="rood"/>`;
  uit += `<path d="M${px + 6} ${py - 6} L${px + 30} ${py - 30}" class="lijn dun stil"/>` + tekst(px + 34, py - 32, 'het punt', { anker: 'start' });
  uit += `<path d="M${px - 60} ${py + 18} L${px - 70} ${py + 46}" class="lijn dun stil"/>` + tekst(px - 72, py + 58, 'kaarthoekmeter', { anker: 'middle', maat: 10.5, klasse: 'stil' });
  uit += tekst(x0 - 4, py - 15, 'lijn 155 → 400 m', { anker: 'start', maat: 10.5, klasse: 'accent-tekst vet' });
  uit += tekst(px + 8, y0 - 8, 'lijn 463 → 700 m', { anker: 'start', maat: 10.5, klasse: 'blauw-tekst vet' });
  uit += tekst(190, 300, '155.400 – 463.700', { maat: 14, klasse: 'vet' });
  return svg(380, 312, 'Een kaarthoekmeter met zijn hoek op het punt, de schalen naar links en naar beneden. Lijn 155 kruist de liggende schaal bij 400 meter, lijn 463 de staande bij 700 meter: het punt ligt op 155.400 – 463.700.', uit);
}

/** A winding road measured with a string: lay it along, then pull it straight along the ruler. */
function afstandMeten() {
  // the road is 7,2 cm long at 41,6 units a cm (measured with getTotalLength), so the string on the ruler matches it
  const weg = 'M30 112 C60 70 92 120 120 84 S170 40 196 74 S244 124 268 70';
  const cm = 41.6; const lengte = 7.2;
  let uit = '<rect x="8" y="30" width="384" height="104" rx="6" class="vlak2"/>';
  uit += `<path d="${weg}" class="lijn" stroke-width="8" stroke-linecap="round" opacity="0.18"/>`;
  uit += `<path d="${weg}" class="accent-lijn" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  uit += '<circle cx="30" cy="112" r="4.5" class="rood"/><circle cx="268" cy="70" r="4.5" class="rood"/>';
  uit += tekst(14, 20, '1. leg een touwtje langs de weg, met een merkje bij begin en eind', { anker: 'start', maat: 11, klasse: 'vet' });
  uit += tekst(14, 160, '2. trek het strak langs de liniaal', { anker: 'start', maat: 11, klasse: 'vet' });
  const [x0, y0] = [16, 180];
  uit += `<rect x="${x0 - 8}" y="${y0}" width="${r1(9 * cm + 16)}" height="30" rx="4" class="vlak"/><rect x="${x0 - 8}" y="${y0}" width="${r1(9 * cm + 16)}" height="30" rx="4" class="lijn dun"/>`;
  for (let i = 0; i <= 90; i++) uit += `<path d="M${r1(x0 + (i * cm) / 10)} ${y0}v${i % 10 ? (i % 5 ? 4 : 6) : 9}" class="lijn ${i % 10 ? 'haar' : 'dun'}"/>`;
  for (let i = 0; i <= 9; i++) uit += tekst(r1(x0 + i * cm), y0 + 22, String(i), { maat: 9 });
  uit += `<path d="M${x0} ${y0 - 6}H${r1(x0 + lengte * cm)}" class="accent-lijn" stroke-width="2.5" stroke-linecap="round"/>`;
  uit += `<circle cx="${x0}" cy="${y0 - 6}" r="4" class="rood"/><circle cx="${r1(x0 + lengte * cm)}" cy="${y0 - 6}" r="4" class="rood"/>`;
  uit += tekst(200, 234, '7,2 cm op 1:25.000 = 7,2 × 250 m = 1,8 km', { maat: 11.5, klasse: 'accent-tekst vet' });
  return svg(400, 244, 'Een kronkelige weg meten: leg een touwtje langs de weg, trek het strak langs de liniaal en lees 7,2 centimeter af. Op 1:25.000 is dat 1,8 kilometer.', uit);
}

/** Your spot on the map: what you see around you, found on the map; your thumb keeps the place. */
function positieBepalen() {
  const jij = [140, 120];
  let uit = '<rect x="10" y="10" width="260" height="200" rx="6" class="vlak2"/>';
  uit += '<path d="M10 16 Q10 10 16 10 H120 C110 40 90 64 60 76 C40 84 22 86 10 88Z" class="accent-licht" opacity="0.7"/>';
  uit += tekst(40, 38, 'bos', { maat: 10.5, klasse: 'stil' });
  uit += '<path d="M10 176 C80 172 180 156 270 150" class="blauw-lijn" stroke-width="2.5" fill="none"/>' + tekst(262, 142, 'sloot', { anker: 'end', maat: 10.5, klasse: 'blauw-tekst' });
  uit += `<path d="M${jij[0]} 10 V210" class="lijn" stroke-width="4" opacity="0.35"/><path d="M40 ${jij[1] - 36} L${jij[0]} ${jij[1]} L270 ${jij[1] - 4}" class="lijn" stroke-dasharray="5 3" fill="none"/>`;
  uit += '<path d="M188 10 L256 210" class="lijn dun"/><rect x="198" y="38" width="5" height="5" class="vol"/><rect x="232" y="138" width="5" height="5" class="vol"/>';
  uit += tekst(214, 86, 'hoogspanning', { anker: 'start', maat: 9.5, klasse: 'stil' });
  uit += '<circle cx="240" cy="30" r="7" class="rood"/>' + tekst(228, 34, 'toren', { anker: 'end', maat: 10.5 });
  uit += `<circle cx="${jij[0]}" cy="${jij[1]}" r="6" class="accent"/>`;
  // the thumb, from below, its nail on your spot
  const duim = `M${jij[0] - 13} 210 V${jij[1] + 22} Q${jij[0] - 13} ${jij[1] + 6} ${jij[0]} ${jij[1] + 6} Q${jij[0] + 13} ${jij[1] + 6} ${jij[0] + 13} ${jij[1] + 22} V210`;
  uit += `<path d="${duim}" class="vlak"/><path d="${duim}" class="lijn"/>`;
  uit += `<path d="M${jij[0] - 7} ${jij[1] + 26} Q${jij[0]} ${jij[1] + 12} ${jij[0] + 7} ${jij[1] + 26}" class="lijn dun stil"/>`;
  uit += tekst(jij[0] + 18, 200, 'duim op je plek', { anker: 'start', maat: 10.5 });
  const regels = ['een kruising ✓', 'bos linksvoor ✓', 'toren rechtsvoor ✓', 'sloot achter je ✓', 'leiding rechts ✓'];
  regels.forEach((t, i) => { uit += tekst(282, 34 + i * 22, t, { anker: 'start', maat: 10.5 }); });
  uit += tekst(282, 164, 'alles klopt:', { anker: 'start', maat: 11, klasse: 'accent-tekst vet' }) + tekst(282, 179, 'hier sta jij', { anker: 'start', maat: 11, klasse: 'accent-tekst vet' });
  return svg(390, 220, 'Een georiënteerde kaart met een kruising, bos, een toren, een sloot en een hoogspanningsleiding. Alles wat je om je heen ziet, klopt met de kaart bij de kruising: daar sta jij. Je duim houdt die plek vast.', uit);
}

/** Geocaching: the coordinate on your phone, and the box with its logbook, hidden at the foot of a tree. */
function geocache() {
  let uit = '<rect x="20" y="16" width="104" height="186" rx="16" class="telefoon"/><rect x="27" y="34" width="90" height="150" rx="4" class="vlak"/>';
  uit += tekst(72, 56, 'N 52° 09.310', { maat: 10.5, klasse: 'vet' }) + tekst(72, 71, 'E 005° 23.232', { maat: 10.5, klasse: 'vet' });
  uit += '<path d="M72 88 V140" class="accent-lijn" stroke-width="4" stroke-linecap="round"/><path d="M60 102 L72 86 L84 102" class="accent-lijn" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  uit += tekst(72, 166, 'nog 12 m', { maat: 13, klasse: 'vet' });
  // a tree with the box between its roots
  uit += '<path d="M226 10 V150 C226 166 214 176 196 182 L284 184 C262 176 246 166 246 150 V10Z" class="kurk"/>';
  uit += '<path d="M150 194 H350" class="lijn stil"/>';
  uit += '<rect x="290" y="160" width="46" height="32" rx="3" class="vol"/><rect x="286" y="152" width="54" height="10" rx="2" class="vol-licht"/><rect x="286" y="152" width="54" height="10" rx="2" class="lijn dun"/>';
  uit += '<rect x="158" y="146" width="30" height="38" rx="2" class="vlak"/><rect x="158" y="146" width="30" height="38" rx="2" class="lijn dun"/>';
  for (let i = 0; i < 4; i++) uit += `<path d="M163 ${156 + i * 7} h20" class="lijn haar"/>`;
  uit += '<path d="M192 182 L210 140" class="rood-lijn" stroke-width="3" stroke-linecap="round"/>';
  uit += tekst(174, 138, 'logboek', { maat: 10.5 }) + tekst(313, 146, 'de cache', { maat: 10.5, klasse: 'vet' });
  uit += tekst(250, 212, 'naam erin, en terug zoals hij lag', { maat: 10.5, klasse: 'stil' });
  return svg(360, 220, 'Geocaching: je telefoon wijst naar de coördinaat, nog 12 meter. Bij een boom vind je de cache, een doosje met een logboek; je schrijft je naam erin en legt hem terug zoals hij lag.', uit);
}

/** Hiding a geocache: not within 161 m of another one, and the coordinate averaged from a few measurements. */
function geocacheRegels() {
  const [cx, cy, r] = [92, 104, 70];
  let uit = `<circle cx="${cx}" cy="${cy}" r="${r}" class="cirkel"/><circle cx="${cx}" cy="${cy}" r="${r}" class="rood-lijn" fill="none" stroke-dasharray="6 4" stroke-width="1.5"/>`;
  uit += `<rect x="${cx - 9}" y="${cy - 7}" width="18" height="14" rx="2" class="vol"/>` + tekst(cx, cy + 24, 'cache', { maat: 10 });
  uit += `<path d="M${cx + 9} ${cy} H${cx + r}" class="lijn dun"/>` + tekst(cx + 38, cy - 6, '161 m', { maat: 11, klasse: 'vet' });
  uit += `<path d="M${cx - 6} ${cy - 44} l12 12 m0 -12 l-12 12" class="rood-lijn" stroke-width="2.5"/>` + tekst(cx, cy - 50, 'te dichtbij', { maat: 10, klasse: 'rood-tekst' });
  uit += `<path d="M${cx + r + 8} ${cy - 54} l6 7 l12 -14" class="accent-lijn" stroke-width="2.5" fill="none"/>` + tekst(cx + r + 16, cy - 62, 'ver genoeg', { maat: 10, klasse: 'accent-tekst' });
  uit += tekst(cx, 196, 'niet binnen 161 m', { maat: 11, klasse: 'vet' }) + tekst(cx, 210, 'van een andere cache', { maat: 10.5, klasse: 'stil' });
  // the measurements, scattered, and their average
  const [mx, my] = [290, 104];
  const metingen = [[-18, -8], [10, -20], [22, 6], [-6, 18], [-20, 12], [14, 16], [4, -6]];
  uit += `<rect x="${mx - 66}" y="${my - 66}" width="132" height="132" rx="8" class="vlak2"/>`;
  for (const [dx, dy] of metingen) uit += `<circle cx="${mx + dx}" cy="${my + dy}" r="3.5" class="vol"/>`;
  const gx = mx + metingen.reduce((a, [d]) => a + d, 0) / metingen.length; const gy = my + metingen.reduce((a, [, d]) => a + d, 0) / metingen.length;
  uit += `<path d="M${r1(gx - 9)} ${r1(gy)} h18 M${r1(gx)} ${r1(gy - 9)} v18" class="accent-lijn" stroke-width="2.5"/>`;
  uit += tekst(mx, 196, 'meet een paar keer', { maat: 11, klasse: 'vet' }) + tekst(mx, 210, 'en neem het midden', { maat: 10.5, klasse: 'stil' });
  return svg(380, 218, 'Een nieuwe geocache leg je niet binnen 161 meter van een andere. De coördinaat meet je een paar keer; het midden van je metingen is het preciest.', uit);
}

/** Moss on a tree, seen from above: it grows on the dampest side, the shade in the north or the rain from the southwest. */
function natuurtekens() {
  const [cx, cy, r] = [150, 120, 56];
  let uit = `<circle cx="${cx}" cy="${cy}" r="${r}" class="kurk"/>`;
  for (const k of [40, 26, 13]) uit += `<circle cx="${cx + 3}" cy="${cy - 2}" r="${k}" class="lijn haar"/>`;
  const mos = (van, tot) => {
    const [ax, ay] = pol(cx, cy, r, van); const [bx, by] = pol(cx, cy, r, tot);
    return `<path d="M${ax} ${ay} A${r} ${r} 0 0 1 ${bx} ${by}" class="accent-lijn" stroke-width="12" stroke-linecap="round" fill="none"/>`;
  };
  uit += mos(-30, 30) + mos(200, 250);
  uit += `<path d="M${cx} ${cy - r - 18} V${cy - r - 46}" class="lijn"/><path d="M${cx - 6} ${cy - r - 38} L${cx} ${cy - r - 48} L${cx + 6} ${cy - r - 38}" class="lijn" fill="none"/>` + tekst(cx, cy - r - 54, 'N', { klasse: 'vet', maat: 13 });
  const [sx, sy] = pol(cx, cy, r + 22, 225);
  uit += tekst(cx + 22, cy - r - 16, 'schaduw', { anker: 'start', maat: 10.5 });
  uit += tekst(sx - 4, sy + 12, 'regen uit het zuidwesten', { anker: 'middle', maat: 10.5 });
  uit += tekst(250, 104, 'mos groeit aan', { anker: 'start', maat: 10.5 }) + tekst(250, 118, 'de natste kant:', { anker: 'start', maat: 10.5 });
  uit += tekst(250, 132, 'dat kan elke', { anker: 'start', maat: 10.5 }) + tekst(250, 146, 'kant zijn', { anker: 'start', maat: 10.5 });
  uit += tekst(250, 170, 'geen kompas', { anker: 'start', maat: 11, klasse: 'rood-tekst vet' });
  return svg(360, 236, 'Een boom van bovenaf met mos aan twee kanten: aan de noordkant door de schaduw en aan de zuidwestkant door de regen. Mos wijst dus geen vaste richting.', uit);
}

export const PLAATJES = {
  'windroos-8': () => windroos(8),
  'windroos-16': () => windroos(16),
  'windroos-32': () => windroos(32),
  kompas,
  'drie-noorden': drieNoorden,
  'rd-rooster': rdRooster,
  hoogtelijnen,
  poolster,
  lijnschaal,
  luchtkaart,
  spiegelkompas,
  eiken,
  bloedcirkel,
  kaartbladen,
  inclinatie,
  gradenstelsels,
  'obstakel-omlopen': obstakelOmlopen,
  'ernaast-mikken': ernaastMikken,
  schaduwstok,
  kurkkompas,
  'gps-werking': gpsWerking,
  telefoonkompas,
  nap,
  deviatie,
  insnijding,
  'gps-track': gpsTrack,
  'gps-rechte-lijn': gpsRechteLijn,
  'utm-zones': utmZones,
  'breedte-lengte': breedteLengte,
  multicache,
  kaarthoekmeter,
  'afstand-meten': afstandMeten,
  'positie-bepalen': positieBepalen,
  geocache,
  'geocache-regels': geocacheRegels,
  natuurtekens,
  ...tocht,
  ...waarnemen,
  ...seinen,
  ...geheimschrift,
  ...vuur,
  ...koken,
  ...gereedschap,
  ...kamperen,
  ...natuur,
  ...weer,
  ...veiligheid,
  ...touw,
  ...sjorren,
};
