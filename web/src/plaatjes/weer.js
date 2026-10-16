// Drawings for weer. See ../plaatjes.js and ./basis.js. The clouds follow the ten genera of the WMO, with the heights
// and Dutch names of the KNMI (CC0, "bron: KNMI"); WOLKEN is shared with the cloud quiz (src/doe/weer/wolken.js).
import { pol, r1, svg, tekst } from './basis.js';

// -- clouds ---------------------------------------------------------------------------------------------------------

/** A heap of round puffs with a flat base: cumulus and the like. bollen = [[dx, dy, r]] from the middle of the base. */
function stapel(x, y, bollen, { klasse = 'wolk', basis = true } = {}) {
  let uit = bollen.map(([dx, dy, r]) => `<circle cx="${r1(x + dx)}" cy="${r1(y + dy)}" r="${r}" class="${klasse}"/>`).join('');
  if (basis) {
    const links = Math.min(...bollen.map(([dx, , r]) => dx - r * 0.7)); const rechts = Math.max(...bollen.map(([dx, , r]) => dx + r * 0.7));
    uit += `<rect x="${r1(x + links)}" y="${r1(y - 10)}" width="${r1(rechts - links)}" height="10" class="${klasse}"/>`;
    uit += `<path d="M${r1(x + links + 4)} ${y - 1}H${r1(x + rechts - 4)}" class="wolk-voet"/>`;
  }
  return uit;
}

const grond = (w, h) => `<path d="M0 ${h - 18} Q${w * 0.3} ${h - 26} ${w * 0.55} ${h - 19} T${w} ${h - 21} V${h} H0Z" class="w-grond"/>`;
const boompje = (x, y, s = 1) => `<path d="M${x} ${y} v${-8 * s}" class="w-stam"/><circle cx="${x}" cy="${r1(y - 13 * s)}" r="${r1(7 * s)}" class="w-boom"/>`;
const regen = (x0, x1, y0, y1, stap = 9, klasse = 'w-regen') => {
  let uit = '';
  for (let x = x0; x <= x1; x += stap) uit += `<path d="M${x} ${y0 + ((x * 7) % 9)} l-4 ${y1 - y0 - 10}" class="${klasse}"/>`;
  return uit;
};
const zon = (x, y, r = 13, klasse = 'w-zon') => {
  let uit = `<circle cx="${x}" cy="${y}" r="${r}" class="${klasse}"/>`;
  if (klasse === 'w-zon') for (let g = 0; g < 360; g += 45) {
    const [ax, ay] = pol(x, y, r + 4, g); const [bx, by] = pol(x, y, r + 9, g);
    uit += `<path d="M${ax} ${ay} L${bx} ${by}" class="w-straal"/>`;
  }
  return uit;
};

/** The inside of a cloud picture of 300 by 180: the sky, the ground and the cloud. */
const WOLK_TEKENING = {
  cirrus: () => {
    let uit = '';
    // thin hooked streaks, high up: "paardenstaarten"
    for (const [x, y, l, k] of [[40, 40, 90, 1], [120, 28, 110, 1.2], [70, 74, 70, 0.8], [190, 58, 80, 1], [215, 22, 60, 0.7]]) {
      uit += `<path d="M${x} ${y + 14 * k} C${x + l * 0.3} ${y + 12 * k} ${x + l * 0.6} ${y + 4 * k} ${x + l} ${y - 6 * k} q4 -6 10 -4" class="w-veeg"/>`;
      uit += `<path d="M${x + 12} ${y + 18 * k} C${x + l * 0.4} ${y + 16 * k} ${x + l * 0.7} ${y + 10 * k} ${x + l - 6} ${y + 2 * k}" class="w-veeg dun"/>`;
    }
    return uit;
  },
  cirrocumulus: () => {
    let uit = '';
    // many tiny grains in rows, without shadow
    for (let r = 0; r < 6; r++) for (let k = 0; k < 18; k++) {
      const x = 46 + k * 12 + r * 5 + ((k * 13) % 5); const y = 26 + r * 9 + ((k * 7) % 4);
      if ((k + r) % 7 === 3) continue;
      uit += `<ellipse cx="${x}" cy="${y}" rx="4.4" ry="3" class="wolk"/>`;
    }
    return uit;
  },
  cirrostratus: () => `${zon(150, 70, 11)}<rect x="0" y="0" width="300" height="140" rx="12" class="w-sluier"/>`
    + '<circle cx="150" cy="70" r="44" class="w-halo"/>',
  altocumulus: () => {
    let uit = '';
    // the flock of sheep: rounded clumps with a grey underside, in rows
    for (let r = 0; r < 3; r++) for (let k = 0; k < 7; k++) {
      const x = 30 + k * 40 + (r % 2) * 18; const y = 44 + r * 22;
      uit += `<ellipse cx="${x}" cy="${y + 3}" rx="16" ry="8" class="w-grijs"/><ellipse cx="${x}" cy="${y}" rx="15" ry="8" class="wolk"/>`;
    }
    return uit;
  },
  altostratus: () => `<rect x="0" y="0" width="300" height="118" class="w-laag"/>${zon(190, 58, 12, 'w-zon-mat')}`
    + '<rect x="0" y="0" width="300" height="118" class="w-matglas"/><path d="M0 118 Q80 110 150 117 T300 114" class="w-rand"/>',
  nimbostratus: () => `<rect x="0" y="0" width="300" height="104" class="w-donker"/><path d="M0 104 Q40 112 80 102 T160 106 T240 101 T300 106 V96 H0Z" class="w-donker"/>${regen(8, 296, 108, 160, 8)}`,
  stratocumulus: () => {
    // one low lumpy layer: rounded grey clumps side by side, lighter and darker, here and there a gap
    let uit = '';
    for (let k = 0; k < 8; k++) {
      const x = 8 + k * 41; const y = 70 + (k % 3) * 5; const rx = 26 + (k % 2) * 4;
      uit += `<ellipse cx="${x}" cy="${y + 6}" rx="${rx}" ry="17" class="w-donker"/>`;
      uit += `<ellipse cx="${x}" cy="${y}" rx="${rx - 2}" ry="15" class="${k % 3 === 1 ? 'w-licht' : 'w-grijs'}"/>`;
    }
    return uit;
  },
  stratus: () => `<rect x="0" y="0" width="300" height="122" class="w-laag"/><path d="M0 122 Q75 130 150 124 T300 126 V118 H0Z" class="w-laag"/>`
    + regen(10, 290, 126, 150, 14, 'w-motregen'),
  cumulus: () => stapel(90, 100, [[-30, -12, 16], [-10, -28, 22], [14, -34, 24], [34, -18, 18], [-46, -6, 10], [48, -6, 11]])
    + stapel(222, 70, [[-14, -12, 13], [4, -20, 16], [20, -10, 12]]),
  cumulonimbus: () => {
    // the tower: a heap of puffs that grows up and spreads out at the top into the anvil; dark underneath, rain, a flash
    let uit = '<path d="M40 30 Q150 6 276 24 Q250 36 214 40 L196 44 L108 44 L92 40 Q62 38 40 30Z" class="wolk"/>';
    uit += stapel(150, 126, [[-50, -14, 20], [-28, -34, 26], [0, -40, 30], [30, -32, 26], [52, -14, 20], [-20, -64, 24], [18, -66, 24], [0, -82, 22], [-6, -96, 18], [10, -100, 16]]);
    uit += '<path d="M98 124 Q150 132 204 124 V116 Q150 122 98 116Z" class="w-donker"/>';
    uit += regen(104, 198, 130, 162, 7);
    uit += '<path d="M176 128 l-10 14 h7 l-8 14 l16 -18 h-7 l8 -10z" class="w-flits"/>';
    return uit;
  },
};

/** The ten genera: id, name, other names, family, height and what to look at. */
export const WOLKEN = [
  { id: 'cirrus', naam: 'Cirrus', ook: 'vederwolk, windveren', laag: 'hoog', hoogte: '6–12 km', kenmerk: 'dunne witte vezels en haakjes' },
  { id: 'cirrocumulus', naam: 'Cirrocumulus', ook: 'heel kleine schapenwolkjes', laag: 'hoog', hoogte: '6–12 km', kenmerk: 'heel kleine korreltjes zonder schaduw' },
  { id: 'cirrostratus', naam: 'Cirrostratus', ook: 'sluierwolk', laag: 'hoog', hoogte: '6–12 km', kenmerk: 'dunne melkwitte sluier, soms een kring om de zon' },
  { id: 'altocumulus', naam: 'Altocumulus', ook: 'schapenwolken', laag: 'middelhoog', hoogte: '2–6 km', kenmerk: 'bolletjes in rijen, met een grijze onderkant' },
  { id: 'altostratus', naam: 'Altostratus', ook: 'matglaslucht', laag: 'middelhoog', hoogte: '2–6 km', kenmerk: 'grijze laag, de zon als achter matglas' },
  { id: 'nimbostratus', naam: 'Nimbostratus', ook: 'regenlucht', laag: 'middelhoog', hoogte: '2–6 km', kenmerk: 'dik donkergrijs dek, het regent lang' },
  { id: 'stratocumulus', naam: 'Stratocumulus', ook: 'de gewoonste lage wolk', laag: 'laag', hoogte: 'onder 2 km', kenmerk: 'grote grijze plukken, lichter en donkerder' },
  { id: 'stratus', naam: 'Stratus', ook: 'laaghangende bewolking', laag: 'laag', hoogte: 'onder 2 km', kenmerk: 'egaal grijs en laag, soms motregen' },
  { id: 'cumulus', naam: 'Cumulus', ook: 'stapelwolk', laag: 'verticaal', hoogte: 'begint laag', kenmerk: 'losse bloemkolen met een platte onderkant' },
  { id: 'cumulonimbus', naam: 'Cumulonimbus', ook: 'buienwolk, onweerswolk', laag: 'verticaal', hoogte: 'tot boven 12 km', kenmerk: 'hoge toren met een aambeeld, buien en onweer' },
];

/** One cloud as a drawing; `metNaam` puts the name and the height under it. */
export function wolkTekening(id, metNaam = true) {
  const w = WOLKEN.find((x) => x.id === id);
  let uit = '<rect width="300" height="180" rx="12" class="w-lucht"/>';
  uit += WOLK_TEKENING[id]() + grond(300, 180);
  uit += boompje(40, 166) + boompje(56, 168, 0.8) + boompje(262, 165, 0.9);
  if (metNaam) {
    const t = `${w.naam} · ${w.hoogte}`;
    const breed = Math.round(t.length * 6.2 + 20);
    uit += `<rect x="${150 - breed / 2}" y="150" width="${breed}" height="24" rx="12" class="w-kaartje"/>`;
    uit += tekst(150, 166, t, { maat: 10.5, klasse: 'vet' });
  }
  return svg(300, 180, metNaam ? `${w.naam} (${w.ook || w.laag}): ${w.kenmerk}` : 'Een wolk; welke is het?', uit);
}

/** The clouds by height: low, middle and high, with cumulus and cumulonimbus growing up through them. */
function wolkenlagen() {
  const y = (km) => r1(392 - km * 28);                             // 0 km at 392, 13 km at 28
  let uit = `<rect x="44" y="20" width="330" height="${y(0) - 20}" rx="10" class="w-lucht"/>`;
  uit += `<rect x="44" y="${y(12)}" width="330" height="${y(6) - y(12)}" class="w-band"/>`;
  uit += `<rect x="44" y="${y(2)}" width="330" height="${y(0) - y(2)}" class="w-band"/>`;
  for (const km of [0, 2, 4, 6, 8, 10, 12]) uit += `<path d="M40 ${y(km)}h6" class="lijn dun"/>` + tekst(36, y(km) + 4, `${km} km`, { maat: 9.5, anker: 'end', klasse: 'stil' });
  for (const [km, t] of [[9, 'hoog'], [4, 'middelhoog'], [1, 'laag']]) uit += tekst(368, y(km) + 4, t, { maat: 10, anker: 'end', klasse: 'stil vet' });
  // high: cirrus, cirrocumulus, cirrostratus
  uit += `<path d="M54 ${y(9.6)} C70 ${y(9.7)} 84 ${y(10)} 98 ${y(10.5)} q4 -6 9 -3" class="w-veeg"/><path d="M58 ${y(9.3)} C76 ${y(9.4)} 88 ${y(9.7)} 96 ${y(10)}" class="w-veeg dun"/>`;
  uit += tekst(78, y(8.8), 'Ci', { maat: 10, klasse: 'vet' });
  for (let k = 0; k < 8; k++) uit += `<ellipse cx="${262 + k * 7}" cy="${y(10.3) + (k % 2) * 4}" rx="3" ry="2" class="wolk"/>`;
  uit += tekst(286, y(9.6), 'Cc', { maat: 10, klasse: 'vet' });
  uit += `<rect x="252" y="${y(8.2)}" width="68" height="10" rx="5" class="w-sluier"/>` + tekst(286, y(7.5), 'Cs', { maat: 10, klasse: 'vet' });
  // middle: altocumulus, altostratus, nimbostratus
  for (let k = 0; k < 4; k++) uit += `<ellipse cx="${66 + k * 15}" cy="${y(4.6)}" rx="7" ry="4" class="wolk"/>`;
  uit += tekst(88, y(3.9), 'Ac', { maat: 10, klasse: 'vet' });
  uit += `<rect x="246" y="${y(4.9)}" width="62" height="12" rx="4" class="w-laag"/>` + tekst(277, y(3.9) + 4, 'As', { maat: 10, klasse: 'vet' });
  uit += `<rect x="246" y="${y(3.4)}" width="56" height="${y(0.8) - y(3.4)}" rx="6" class="w-donker"/>` + regen(250, 298, y(0.8), y(0) + 4, 8);
  uit += tekst(274, y(2.2), 'Ns', { maat: 10, klasse: 'vet op-donker' });
  // low: stratocumulus, stratus
  uit += stapel(72, y(1.1), [[-14, -2, 7], [-2, -4, 8], [10, -2, 7], [20, -1, 6]], { klasse: 'w-grijs', basis: false }) + tekst(74, y(0.35), 'Sc', { maat: 10, klasse: 'vet' });
  uit += `<rect x="98" y="${y(0.9)}" width="28" height="8" rx="3" class="w-laag"/>` + tekst(112, y(0.35), 'St', { maat: 10, klasse: 'vet' });
  // vertical: cumulus and the cumulonimbus with its anvil up to the top
  uit += stapel(224, y(1.2), [[-8, -6, 7], [2, -11, 9], [11, -5, 6]]) + tekst(224, y(0.35), 'Cu', { maat: 10, klasse: 'vet' });
  const toren = Array.from({ length: 13 }, (_, k) => [k % 2 ? 8 : -8, -k * 22 - 6, 30 - k * 0.7]);
  uit += `<path d="M106 ${y(11.6)} Q166 ${y(12.5)} 230 ${y(11.7)} Q200 ${y(10.9)} 186 ${y(10.2)} L146 ${y(10.2)} Q132 ${y(10.9)} 106 ${y(11.6)}Z" class="wolk"/>`;
  uit += stapel(166, y(1.2), [[-26, -10, 16], [26, -10, 16], ...toren]);
  uit += tekst(166, y(6.4), 'Cb', { maat: 11, klasse: 'vet' });
  return svg(380, 404, 'De wolken naar hoogte: laag onder 2 km (stratus, stratocumulus), middelhoog 2 tot 6 km (altocumulus, altostratus, nimbostratus), hoog 6 tot 12 km (cirrus, cirrocumulus, cirrostratus); cumulus en cumulonimbus groeien omhoog door de lagen', uit);
}

// -- wind -----------------------------------------------------------------------------------------------------------

/** Wind from the south-west: the arrow of the vane points into the wind, its tail blows away with it. */
function windrichting() {
  const c = [170, 146];
  let uit = `<circle cx="${c[0]}" cy="${c[1]}" r="118" class="vlak2"/><circle cx="${c[0]}" cy="${c[1]}" r="118" class="lijn dun"/>`;
  for (const [g, t] of [[0, 'N'], [90, 'O'], [180, 'Z'], [270, 'W'], [45, 'NO'], [135, 'ZO'], [225, 'ZW'], [315, 'NW']]) {
    const [x, y] = pol(c[0], c[1], 102, g);
    uit += `<text x="${x}" y="${y}" class="tekst${g % 90 ? ' stil' : ' vet'}" font-size="${g % 90 ? 11 : 15}" text-anchor="middle" dominant-baseline="central">${t}</text>`;
  }
  // the wind: two arrows coming in from the south-west, beside the ZW
  for (const d of [-40, 40]) {
    const [sx, sy] = pol(c[0], c[1], 150, 225 + d / 4); const [ex, ey] = pol(c[0], c[1], 84, 225 + d / 2.2);
    const hoek = 45;
    const [a1, b1] = pol(ex, ey, 11, hoek + 180 - 35); const [a2, b2] = pol(ex, ey, 11, hoek + 180 + 35);
    uit += `<path d="M${sx} ${sy} L${ex} ${ey}" class="w-windpijl"/><path d="M${a1} ${b1} L${ex} ${ey} L${a2} ${b2}" class="w-windpijl"/>`;
  }
  // the vane: the arrow in front points to the south-west, the broad tail behind it catches the wind
  const [px, py] = pol(c[0], c[1], 54, 225); const [qx, qy] = pol(c[0], c[1], 50, 45);
  uit += `<path d="M${px} ${py} L${qx} ${qy}" class="lijn dik"/>`;
  const [a1, b1] = pol(px, py, 16, 45 - 22); const [a2, b2] = pol(px, py, 16, 45 + 22);
  uit += `<path d="M${px} ${py} L${a1} ${b1} L${a2} ${b2}Z" class="rood"/>`;
  const staart = [pol(qx, qy, 14, 315), pol(qx, qy, 14, 135)];
  const terug = [pol(staart[1][0], staart[1][1], 22, 225), pol(staart[0][0], staart[0][1], 22, 225)];
  uit += `<path d="M${staart[0].join(' ')} L${staart[1].join(' ')} L${terug[0].join(' ')} L${terug[1].join(' ')}Z" class="vol-licht"/>`;
  uit += `<path d="M${staart[0].join(' ')} L${staart[1].join(' ')} L${terug[0].join(' ')} L${terug[1].join(' ')}Z" class="lijn dun"/>`;
  uit += `<circle cx="${c[0]}" cy="${c[1]}" r="4" class="vol"/>`;
  uit += tekst(170, 286, 'Zuidwestenwind: hij komt uit het zuidwesten.', { maat: 12, klasse: 'vet' });
  uit += tekst(170, 302, 'De pijl van de windvaan wijst waar de wind vandaan komt.', { maat: 10.5, klasse: 'stil' });
  return svg(340, 312, 'Zuidwestenwind: de wind komt uit het zuidwesten. De pijl van de windvaan wijst naar waar de wind vandaan komt; de staart waait mee.', uit);
}

/** Zeewind by day: the land warms up, the air over it rises, and air from the sea flows in at the ground. */
function zeewind() {
  let uit = '<rect width="340" height="220" rx="12" class="w-lucht"/>';
  uit += zon(296, 34, 14);
  uit += '<path d="M0 160 H150 V220 H0Z" class="w-zee"/><path d="M150 160 Q190 150 240 156 T340 150 V220 H150Z" class="w-land"/>';
  uit += tekst(70, 196, 'zee: blijft koel', { maat: 11, klasse: 'vet' }) + tekst(250, 196, 'land: wordt warm', { maat: 11, klasse: 'vet' });
  // the circle of air: up over the land, back over the sea high up, down over the sea, in along the ground
  uit += '<path d="M90 146 H210" class="w-luchtpijl"/><path d="M200 139 L212 146 L200 153" class="w-luchtpijl" fill="none"/>';
  uit += '<path d="M240 140 V70" class="w-luchtpijl warm"/><path d="M233 80 L240 68 L247 80" class="w-luchtpijl warm" fill="none"/>';
  uit += '<path d="M220 54 H100" class="w-luchtpijl dun"/><path d="M110 47 L98 54 L110 61" class="w-luchtpijl dun" fill="none"/>';
  uit += '<path d="M70 66 V130" class="w-luchtpijl dun"/><path d="M63 120 L70 132 L77 120" class="w-luchtpijl dun" fill="none"/>';
  uit += stapel(250, 54, [[-12, -4, 9], [0, -10, 11], [12, -4, 8]]);
  uit += tekst(150, 134, 'zeewind', { maat: 12, klasse: 'vet blauw-tekst' }) + tekst(252, 100, 'warme lucht stijgt', { maat: 10, anker: 'start', klasse: 'stil' });
  return svg(340, 220, 'Zeewind overdag: het land wordt warmer dan de zee, de lucht boven het land stijgt op, en aan de grond stroomt lucht van zee naar het land', uit);
}

/** Buys Ballot: with your back to the wind, low pressure is on your left. Seen from above. */
function buysBallot() {
  const ik = [170, 170];
  let uit = '';
  // the wind comes from behind (from the bottom of the picture)
  for (const dx of [-60, 0, 60]) uit += `<path d="M${ik[0] + dx} 300 V${dx ? 214 : 210}" class="w-windpijl"/><path d="M${ik[0] + dx - 7} ${dx ? 224 : 220} L${ik[0] + dx} ${dx ? 212 : 208} L${ik[0] + dx + 7} ${dx ? 224 : 220}" class="w-windpijl" fill="none"/>`;
  // the walker from above: shoulders, head, arms out
  uit += `<path d="M${ik[0] - 52} ${ik[1]} H${ik[0] + 52}" class="lijn dik"/><ellipse cx="${ik[0]}" cy="${ik[1]}" rx="22" ry="11" class="vol-licht"/><circle cx="${ik[0]}" cy="${ik[1] - 2}" r="9" class="vol"/>`;
  uit += `<path d="M${ik[0] - 4} ${ik[1] - 12} L${ik[0]} ${ik[1] - 18} L${ik[0] + 4} ${ik[1] - 12}" class="lijn" fill="none"/>`;
  // L ahead on the left, H on the right
  uit += '<circle cx="74" cy="78" r="34" class="w-laagdruk"/>' + tekst(74, 88, 'L', { maat: 30, klasse: 'vet rood-tekst' });
  uit += '<circle cx="272" cy="170" r="34" class="w-hoogdruk"/>' + tekst(272, 180, 'H', { maat: 30, klasse: 'vet blauw-tekst' });
  uit += tekst(74, 132, 'lage druk', { maat: 11 }) + tekst(272, 222, 'hoge druk', { maat: 11 });
  uit += tekst(170, 326, 'wind in je rug', { maat: 11, klasse: 'stil' });
  uit += tekst(170, 20, 'Noordelijk halfrond', { maat: 11, klasse: 'stil vet' });
  return svg(340, 336, 'De wet van Buys Ballot, van boven gezien: sta met de wind in je rug, dan ligt de lage druk links (wat naar voren) en de hoge druk rechts', uit);
}

// -- weer voorspellen ------------------------------------------------------------------------------------------------

/** The front symbols of the weather map: warm, cold, occluded and stationary, with H and L. */
function fronten() {
  const lijn = (y, klasse) => `<path d="M16 ${y} H196" class="${klasse}"/>`;
  const bolletjes = (y, x0, klasse, n = 5, stap = 42) => Array.from({ length: n }, (_, i) => `<path d="M${x0 + i * stap} ${y} a9 9 0 0 1 18 0Z" class="${klasse}"/>`).join('');
  const puntjes = (y, x0, klasse, n = 5, stap = 42, omlaag = false) => Array.from({ length: n }, (_, i) => `<path d="M${x0 + i * stap} ${y} l9 ${omlaag ? 13 : -13} l9 ${omlaag ? -13 : 13}Z" class="${klasse}"/>`).join('');
  let uit = '';
  uit += lijn(40, 'w-front warm') + bolletjes(40, 22, 'w-warm', 5, 36);
  uit += tekst(208, 44, 'warmtefront', { anker: 'start', maat: 12, klasse: 'vet' });
  uit += lijn(96, 'w-front koud') + puntjes(96, 22, 'w-koud', 5, 36);
  uit += tekst(208, 100, 'koufront', { anker: 'start', maat: 12, klasse: 'vet' });
  uit += lijn(152, 'w-front occlusie') + bolletjes(152, 22, 'w-occlusie', 3, 72) + puntjes(152, 58, 'w-occlusie', 2, 72);
  uit += tekst(208, 156, 'occlusie', { anker: 'start', maat: 12, klasse: 'vet' });
  uit += '<path d="M16 208 H52 M88 208 H124 M160 208 H196" class="w-front warm"/><path d="M52 208 H88 M124 208 H160" class="w-front koud"/>';
  uit += '<path d="M25 208 a9 9 0 0 0 18 0Z M97 208 a9 9 0 0 0 18 0Z M169 208 a9 9 0 0 0 18 0Z" class="w-warm"/><path d="M61 208 l9 -13 l9 13Z M133 208 l9 -13 l9 13Z" class="w-koud"/>';
  uit += tekst(208, 212, 'stilliggend front', { anker: 'start', maat: 12, klasse: 'vet' });
  uit += tekst(170, 238, 'De tekens wijzen waar het front heen trekt.', { maat: 10.5, klasse: 'stil' });
  return svg(340, 248, 'De fronten op de weerkaart: warmtefront rood met halve bolletjes, koufront blauw met driehoekjes, occlusie paars met allebei, stilliggend front om en om rood en blauw. De tekens wijzen waar het front heen trekt.', uit);
}

/** The cloud sequence of a warm front, in a cut through the air: the warm air slides up over the cold air. */
function warmtefront() {
  let uit = '<rect width="340" height="230" rx="12" class="w-lucht"/>';
  // the front surface: a long slope from the ground on the left up to the right
  uit += '<path d="M20 196 L330 48 V196Z" class="w-koudelucht"/><path d="M20 196 L330 48" class="w-front warm"/>';
  uit += tekst(282, 170, 'koude lucht', { maat: 11, klasse: 'blauw-tekst vet' }) + tekst(100, 66, 'warme lucht schuift omhoog', { maat: 11, klasse: 'rood-tekst vet' });
  // the clouds along the slope: Ns at the front, then As, Cs, Ci far ahead and high
  uit += `<path d="M20 196 L20 140 Q40 118 76 126 L96 150 Z" class="w-donker"/>${regen(26, 94, 160, 196, 8)}`;
  uit += tekst(52, 142, 'Ns', { maat: 11, klasse: 'vet op-donker' });
  uit += '<path d="M96 146 Q140 108 176 112 L170 122 Q130 120 104 152Z" class="w-laag"/>' + tekst(140, 128, 'As', { maat: 11, klasse: 'vet' });
  uit += '<rect x="182" y="84" width="74" height="8" rx="4" class="w-sluier"/>' + tekst(218, 106, 'Cs', { maat: 11, klasse: 'vet' });
  uit += '<path d="M262 50 C278 50 292 44 304 36 q4 -5 9 -3 M270 58 C284 58 296 52 306 46" class="w-veeg"/>' + tekst(286, 76, 'Ci', { maat: 11, klasse: 'vet' });
  // you, on the ground, with the front coming towards you from the left
  uit += '<path d="M0 196 H340 V230 H0Z" class="w-grond"/>';
  uit += '<circle cx="296" cy="206" r="5" class="vol"/>' + tekst(296, 224, 'jij', { maat: 10.5 });
  uit += '<path d="M140 214 H200" class="lijn"/><path d="M192 208 L202 214 L192 220" class="lijn" fill="none"/>';
  uit += tekst(132, 218, 'het front trekt', { maat: 10, anker: 'end', klasse: 'stil' });
  return svg(340, 230, 'De wolkenreeks van een warmtefront, doorgesneden: eerst cirrus, dan cirrostratus, altostratus en tot slot nimbostratus met regen', uit);
}

/** A barometer: the hand shows the air pressure now, the setting hand where it stood earlier. */
function barometer() {
  const c = [170, 150]; const r = 112;
  const hoek = (hpa) => -135 + ((hpa - 960) / 100) * 270;            // 960 .. 1060 hPa over 270 degrees
  let uit = `<circle cx="${c[0]}" cy="${c[1]}" r="${r + 10}" class="vol-licht"/><circle cx="${c[0]}" cy="${c[1]}" r="${r}" class="vlak"/>`;
  for (let p = 960; p <= 1060; p += 5) {
    const [ax, ay] = pol(c[0], c[1], r - 4, hoek(p)); const [bx, by] = pol(c[0], c[1], r - (p % 20 ? 11 : 18), hoek(p));
    uit += `<path d="M${ax} ${ay} L${bx} ${by}" class="lijn ${p % 20 ? 'dun' : ''}"/>`;
    if (!(p % 20)) { const [tx, ty] = pol(c[0], c[1], r - 32, hoek(p)); uit += `<text x="${tx}" y="${ty}" class="tekst" font-size="11" text-anchor="middle" dominant-baseline="central">${p}</text>`; }
  }
  uit += tekst(c[0], c[1] + 42, 'hPa', { maat: 11, klasse: 'stil' });
  const [lx, ly] = pol(c[0], c[1], r - 54, hoek(975)); const [hx, hy] = pol(c[0], c[1], r - 54, hoek(1045));
  uit += tekst(lx, ly + 4, 'laag', { maat: 11, klasse: 'vet rood-tekst' }) + tekst(hx, hy + 4, 'hoog', { maat: 11, klasse: 'vet blauw-tekst' });
  // the setting hand at 1016 (earlier), the hand at 1008 (now): it has fallen
  const [sx, sy] = pol(c[0], c[1], r - 8, hoek(1016));
  uit += `<path d="M${c[0]} ${c[1]} L${sx} ${sy}" class="accent-lijn" stroke-width="2.5"/>`;
  const [wx, wy] = pol(c[0], c[1], r - 14, hoek(1008)); const [vx, vy] = pol(c[0], c[1], 18, hoek(1008) + 180);
  uit += `<path d="M${vx} ${vy} L${wx} ${wy}" class="lijn dik"/><circle cx="${c[0]}" cy="${c[1]}" r="6" class="vol"/>`;
  const [ux, uy] = pol(c[0], c[1], r + 22, hoek(1012));
  uit += `<path d="M${pol(c[0], c[1], r + 16, hoek(1015)).join(' ')} A${r + 16} ${r + 16} 0 0 0 ${pol(c[0], c[1], r + 16, hoek(1009)).join(' ')}" class="rood-lijn" fill="none" stroke-width="2.5"/>`;
  uit += tekst(ux, uy - 4, 'gedaald', { maat: 10.5, klasse: 'vet rood-tekst' });
  uit += tekst(c[0], 292, 'Groen: waar hij stond. Dikke wijzer: nu.', { maat: 11, klasse: 'stil' });
  return svg(340, 300, 'Een barometer: de groene wijzer staat waar de luchtdruk eerder stond, 1016 hPa; de dikke wijzer staat nu op 1008. De luchtdruk is gedaald.', uit);
}

// -- zon en maan -----------------------------------------------------------------------------------------------------

/** The moon from above, going round the earth with the sun far to the right; and how each phase looks from here. */
function maanfasen() {
  const c = [176, 150]; const R = 78;
  let uit = '';
  // sunlight from the right
  for (const y of [60, 100, 200, 240]) uit += `<path d="M372 ${y} H346" class="w-zonlicht"/><path d="M352 ${y - 4} L344 ${y} L352 ${y + 4}" class="w-zonlicht" fill="none"/>`;
  uit += tekst(358, 40, 'zonlicht', { maat: 10.5, klasse: 'stil' });
  uit += `<circle cx="${c[0]}" cy="${c[1]}" r="${R}" class="lijn haar" stroke-dasharray="3 4"/>`;
  uit += `<circle cx="${c[0]}" cy="${c[1]}" r="16" class="blauw"/><path d="M${c[0]} ${c[1] - 16} a16 16 0 0 0 0 32Z" class="w-nachtkant"/>`;
  uit += tekst(c[0], c[1] + 30, 'aarde', { maat: 10, klasse: 'stil' });
  // eight moons round the orbit: new moon between earth and sun (right), full moon on the far side (left);
  // the orbit runs anticlockwise seen from the north
  const namen = ['nieuwe maan', 'wassende sikkel', 'eerste kwartier', 'wassende maan', 'volle maan', 'afnemende maan', 'laatste kwartier', 'afnemende sikkel'];
  namen.forEach((naam, i) => {
    const g = 90 - i * 45;                                     // degrees clockwise from up: 90 = right (towards the sun)
    const [x, y] = pol(c[0], c[1], R, g);
    uit += `<circle cx="${x}" cy="${y}" r="11" class="w-maan-donker"/><path d="M${x} ${y - 11} a11 11 0 0 1 0 22Z" class="w-maan"/>`;
    const [tx, ty] = pol(c[0], c[1], R + 18, g);
    const anker = Math.abs(tx - c[0]) < 20 ? 'middle' : tx < c[0] ? 'end' : 'start';
    uit += tekst(tx, ty + (Math.abs(tx - c[0]) < 20 ? (ty < c[1] ? -2 : 10) : 4), naam, { maat: 10, anker });
  });
  uit += `<path d="M${c[0] + 30} ${c[1] - 40} A50 50 0 0 0 ${c[0] - 30} ${c[1] - 40}" class="lijn stil" fill="none"/><path d="M${c[0] - 26} ${c[1] - 50} L${c[0] - 31} ${c[1] - 40} L${c[0] - 20} ${c[1] - 38}" class="lijn stil" fill="none"/>`;
  return svg(380, 300, 'De maan draait in ongeveer een maand om de aarde. De helft naar de zon is altijd verlicht; hoeveel je daarvan ziet, is de maanstand: van nieuwe maan via eerste kwartier naar volle maan en via laatste kwartier terug.', uit);
}

/** The phases as you see them from the Netherlands, in a row: lit on the right while waxing, on the left while waning. */
function maanstanden() {
  let uit = '';
  const namen = [['nieuwe', 'maan'], ['wassende', 'sikkel'], ['eerste', 'kwartier'], ['wassende', 'maan'], ['volle', 'maan'], ['afnemende', 'maan'], ['laatste', 'kwartier'], ['afnemende', 'sikkel']];
  namen.forEach(([a, b], i) => {
    const x = 24 + i * 41.7; const y = 30; const r = 16;
    const f = i / 8;                                            // the phase 0..1
    const k = Math.cos(2 * Math.PI * f);                        // 1 at new, -1 at full: the width of the terminator
    const rechts = f < 0.5;
    uit += `<circle cx="${x}" cy="${y}" r="${r}" class="w-maan-donker"/>`;
    if (i !== 0) {
      const boog = `a${r} ${r} 0 0 ${rechts ? 1 : 0} 0 ${2 * r}`;
      const terug = `a${r1(Math.abs(k) * r)} ${r} 0 0 ${(rechts ? k > 0 : k < 0) ? 0 : 1} 0 ${-2 * r}`;
      uit += `<path d="M${x} ${y - r} ${boog} ${terug}Z" class="w-maan"/>`;
    }
    uit += tekst(x, 62, a, { maat: 8.5 }) + tekst(x, 73, b, { maat: 8.5 });
  });
  uit += '<path d="M24 92 H184" class="accent-lijn" stroke-width="2"/><path d="M178 86 L186 92 L178 98" class="accent-lijn" fill="none" stroke-width="2"/>';
  uit += tekst(104, 108, 'wassend: rechts licht', { maat: 10.5, klasse: 'vet accent-tekst' });
  uit += '<path d="M190 92 H316" class="lijn stil" stroke-width="2"/><path d="M308 86 L316 92 L308 98" class="lijn stil" fill="none" stroke-width="2"/>';
  uit += tekst(254, 108, 'afnemend: links licht', { maat: 10.5, klasse: 'vet' });
  return svg(340, 118, 'De maanstanden zoals je ze vanuit Nederland ziet: wassend is de rechterkant verlicht, afnemend de linkerkant', uit);
}

/** The path of the sun over the sky on the longest day, at the equinox and on the shortest day, seen from 52 degrees north. */
function zonnebaan() {
  const breedte = 52.1 * (Math.PI / 180);
  const x = (az) => r1(20 + ((az - 30) / 300) * 300);               // 30..330 degrees over the width
  const y = (h) => r1(200 - h * 2.6);
  let uit = `<rect x="0" y="0" width="340" height="200" rx="12" class="w-lucht"/><path d="M0 200 H340 V236 H0Z" class="w-grond"/>`;
  for (const [az, t] of [[45, 'NO'], [90, 'O'], [135, 'ZO'], [180, 'Z'], [225, 'ZW'], [270, 'W'], [315, 'NW']]) {
    uit += `<path d="M${x(az)} 200 v6" class="lijn dun"/>` + tekst(x(az), 222, t, { maat: t.length > 1 ? 10 : 12, klasse: t.length > 1 ? 'stil' : 'vet' });
  }
  const banen = [[23.44, '21 juni', 'w-baan zomer'], [0, '21 maart, 23 sept.', 'w-baan lente'], [-23.44, '21 december', 'w-baan winter']];
  for (const [d, label, klasse] of banen) {
    const dec = d * (Math.PI / 180); const punten = [];
    for (let uur = -12; uur <= 12; uur += 0.1) {
      const H = uur * 15 * (Math.PI / 180);
      const h = Math.asin(Math.sin(breedte) * Math.sin(dec) + Math.cos(breedte) * Math.cos(dec) * Math.cos(H));
      if (h < 0) continue;
      const az = (Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(breedte) - Math.tan(dec) * Math.cos(breedte)) * 180) / Math.PI + 180;
      if (az < 30 || az > 330) continue;
      punten.push(`${x(az)},${y((h * 180) / Math.PI)}`);
    }
    uit += `<polyline points="${punten.join(' ')}" class="${klasse}"/>`;
    const top = (90 - 52.1 + d);
    uit += zon(x(180), y(top), 6, 'w-zon-klein') + tekst(x(180) + 12, y(top) - 6, `${label}: ${Math.round(top)}°`, { maat: 10, anker: 'start', klasse: 'vet' });
  }
  return svg(340, 236, 'De baan van de zon in Nederland: op 21 juni op in het noordoosten, 61 graden hoog in het zuiden, onder in het noordwesten; in maart en september op in het oosten en onder in het westen; op 21 december op in het zuidoosten, maar 14 graden hoog, onder in het zuidwesten', uit);
}

// -- weer bijhouden ---------------------------------------------------------------------------------------------------

/** A home-made weather station: a thermometer in the shade, a rain gauge, a barometer and hygrometer, a vane and cups. */
function weerstation() {
  let uit = '<rect width="340" height="186" rx="12" class="w-lucht"/><path d="M0 172 H340 V190 H0Z" class="w-grond"/>';
  // the thermometer on a post in the shade of a tree
  uit += '<ellipse cx="44" cy="174" rx="40" ry="5" class="w-schaduw"/><path d="M28 172 V70" class="w-stam" stroke-width="7"/>';
  uit += '<circle cx="28" cy="52" r="30" class="w-boom"/><circle cx="56" cy="62" r="20" class="w-boom"/>';
  uit += '<path d="M62 172 V96" class="lijn"/><rect x="56" y="104" width="12" height="54" rx="6" class="vlak"/><rect x="56" y="104" width="12" height="54" rx="6" class="lijn dun"/>';
  uit += '<path d="M62 152 V122" class="rood-lijn" stroke-width="3" stroke-linecap="round"/><circle cx="62" cy="152" r="5" class="rood"/>';
  for (let y = 112; y <= 144; y += 8) uit += `<path d="M66 ${y} h3" class="lijn haar"/>`;
  // the rain gauge: a funnel on a tube, a little water in it, a scale in mm
  uit += '<path d="M112 116 H148 L136 128 H124Z" class="vol-licht"/><path d="M112 116 H148 L136 128 H124Z" class="lijn dun"/>';
  uit += '<rect x="122" y="128" width="16" height="44" class="vlak"/><rect x="122" y="156" width="16" height="16" class="w-water"/><rect x="122" y="128" width="16" height="44" class="lijn dun"/>';
  for (let y = 132; y <= 168; y += 6) uit += `<path d="M138 ${y} h-4" class="lijn haar"/>`;
  // barometer and hygrometer: two dials on a post
  uit += '<path d="M215 172 V150" class="lijn"/><rect x="186" y="112" width="58" height="38" rx="6" class="vlak2"/><rect x="186" y="112" width="58" height="38" rx="6" class="lijn dun"/>';
  for (const [x, t, g] of [[201, 'hPa', -30], [229, '%', 40]]) {
    const [hx, hy] = pol(x, 131, 9, g);
    uit += `<circle cx="${x}" cy="131" r="13" class="vlak"/><circle cx="${x}" cy="131" r="13" class="lijn dun"/><path d="M${x} 131 L${hx} ${hy}" class="lijn"/>`;
    uit += tekst(x, 142, t, { maat: 6.5, klasse: 'stil' });
  }
  // the mast with the cups of the wind meter on top and the vane under them
  uit += '<path d="M296 172 V44" class="lijn dik"/><path d="M276 44 H316" class="lijn"/>';
  uit += '<path d="M270 44 a6 6 0 0 0 12 0Z M310 44 a6 6 0 0 0 12 0Z" class="vol"/><circle cx="296" cy="40" r="5" class="vol"/>';
  uit += '<path d="M268 84 H322" class="lijn"/><path d="M268 84 L278 78 V90Z" class="rood"/><path d="M316 76 L326 76 L330 92 L320 92Z" class="vol-licht"/>';
  const label = (x, a, b) => tekst(x, 204, a, { maat: 10, klasse: 'vet' }) + tekst(x, 217, b, { maat: 9.5, klasse: 'stil' });
  uit += label(50, 'thermometer', 'in de schaduw') + label(130, 'regenmeter', '1 mm = 1 l per m²') + label(215, 'barometer', 'en hygrometer') + label(296, 'windmeter', 'en windvaan');
  return svg(340, 224, 'Een eigen weerstation: een thermometer in de schaduw, een regenmeter met een trechter, een barometer en een hygrometer, en een mast met een windmeter en een windvaan', uit);
}

/** A page of a weather log, and the cloud cover in eighths. */
function weerlogboek() {
  const kol = [[14, 'dag'], [52, '°C'], [86, 'luchtdruk'], [160, 'wind'], [220, 'wolken'], [276, 'neerslag']];
  let uit = '<rect x="4" y="4" width="332" height="138" rx="8" class="vlak"/><rect x="4" y="4" width="332" height="138" rx="8" class="lijn dun"/>';
  for (const [x, t] of kol) uit += tekst(x, 24, t, { maat: 10, anker: 'start', klasse: 'vet' });
  uit += '<path d="M10 32 H330" class="lijn dun"/>';
  /** A circle with k eighths filled: the cloud cover. */
  const achtsten = (x, y, r, k) => {
    let c = `<circle cx="${x}" cy="${y}" r="${r}" class="vlak"/>`;
    if (k >= 8) c += `<circle cx="${x}" cy="${y}" r="${r}" class="vol"/>`;
    else if (k > 0) { const [ex, ey] = pol(x, y, r, k * 45); c += `<path d="M${x} ${y} V${r1(y - r)} A${r} ${r} 0 ${k > 4 ? 1 : 0} 1 ${ex} ${ey}Z" class="vol"/>`; }
    return c + `<circle cx="${x}" cy="${y}" r="${r}" class="lijn dun"/>`;
  };
  const rijen = [['ma', '14', '1021', '→', 'ZW 3', 2, '–'], ['di', '12', '1012', '↓', 'Z 4', 6, '2 mm'], ['wo', '10', '1004', '↓', 'ZW 6', 8, '9 mm']];
  rijen.forEach(([dag, temp, druk, gaat, wind, wolken, regen], i) => {
    const y = 54 + i * 28;
    uit += tekst(14, y, dag, { anker: 'start' }) + tekst(52, y, temp, { anker: 'start' }) + tekst(86, y, `${druk} ${gaat}`, { anker: 'start' });
    uit += tekst(160, y, wind, { anker: 'start' }) + achtsten(230, y - 4, 8, wolken) + tekst(276, y, regen, { anker: 'start' });
    if (i < 2) uit += `<path d="M10 ${y + 10} H330" class="lijn haar"/>`;
  });
  uit += tekst(14, 132, 'Voorspelling voor do: regen, harde wind. Klopte het?', { maat: 10, anker: 'start', klasse: 'stil' });
  // the scale of eighths
  for (let k = 0; k <= 8; k++) { const x = 26 + k * 36; uit += achtsten(x, 170, 10, k) + tekst(x, 194, String(k), { maat: 10 }); }
  uit += tekst(26, 212, 'onbewolkt', { maat: 9.5, klasse: 'stil' }) + tekst(314, 212, 'helemaal dicht', { maat: 9.5, klasse: 'stil', anker: 'end' });
  uit += tekst(170, 212, 'bewolking in achtsten', { maat: 10, klasse: 'vet' });
  return svg(340, 220, 'Een bladzijde uit een weerlogboek met per dag de temperatuur, de luchtdruk en of die daalt, de wind, de bewolking en de neerslag. Daaronder de bewolking in achtsten: 0 is onbewolkt, 8 is helemaal dicht.', uit);
}

/** Avondrood, in a cut from west to east: clear in the west, so the low sun shines red under the clouds overhead. */
function avondrood() {
  let uit = '<rect width="340" height="200" rx="12" class="w-lucht"/>';
  uit += '<path d="M0 176 V128 Q70 118 130 140 Q180 160 250 176Z" class="w-avondgloed"/>';
  uit += '<circle cx="34" cy="166" r="16" class="w-zon-laag"/>';
  // the cloud deck from overhead to the east, lit red underneath
  uit += '<path d="M120 70 Q160 46 210 58 Q260 38 340 52 V96 Q300 104 260 96 Q210 108 170 98 Q140 100 120 90 Z" class="w-grijs"/>';
  uit += '<path d="M120 90 Q140 100 170 98 Q210 108 260 96 Q300 104 340 96 V104 Q300 112 260 104 Q210 116 170 106 Q140 108 118 96Z" class="w-avondrood"/>';
  // the light of the low sun, under the clouds
  for (const [x, y] of [[170, 106], [240, 104], [310, 106]]) uit += `<path d="M50 160 L${x} ${y}" class="w-zonstraal"/>`;
  uit += '<path d="M0 176 H340 V200 H0Z" class="w-grond"/>';
  uit += '<circle cx="200" cy="170" r="5" class="vol"/>' + tekst(200, 192, 'jij', { maat: 10.5 });
  uit += tekst(14, 140, 'W', { maat: 13, anker: 'start', klasse: 'vet' }) + tekst(326, 140, 'O', { maat: 13, anker: 'end', klasse: 'vet' });
  uit += tekst(60, 116, 'helder', { maat: 11, klasse: 'vet' });
  uit += '<path d="M40 24 H190" class="lijn stil"/><path d="M182 18 L192 24 L182 30" class="lijn stil" fill="none"/>';
  uit += tekst(198, 28, 'het weer trekt meestal', { maat: 10, anker: 'start', klasse: 'stil' }) + tekst(198, 40, 'van west naar oost', { maat: 10, anker: 'start', klasse: 'stil' });
  return svg(340, 200, 'Avondrood: in het westen is het helder, daar gaat de zon onder. Het licht schijnt onder de wolken door en kleurt ze van onderen rood. Omdat het weer meestal uit het westen komt, blijft het vaak droog.', uit);
}

/** The three colours of the KNMI warnings. */
function knmiCodes() {
  const codes = [['geel', 'w-code-geel', 'kans op', 'gevaarlijk weer'], ['oranje', 'w-code-oranje', 'grote kans,', 'grote gevolgen'], ['rood', 'w-code-rood', 'weeralarm:', 'extreem weer']];
  let uit = '';
  codes.forEach(([naam, klasse, a, b], i) => {
    const x = 6 + i * 112;
    uit += `<rect x="${x}" y="6" width="104" height="96" rx="10" class="${klasse}"/>`;
    uit += `<text x="${x + 52}" y="38" class="${klasse}-tekst vet" font-size="13" text-anchor="middle">code</text>`;
    uit += `<text x="${x + 52}" y="58" class="${klasse}-tekst vet" font-size="18" text-anchor="middle">${naam}</text>`;
    uit += `<text x="${x + 52}" y="80" class="${klasse}-tekst" font-size="10.5" text-anchor="middle">${a}</text><text x="${x + 52}" y="93" class="${klasse}-tekst" font-size="10.5" text-anchor="middle">${b}</text>`;
  });
  uit += tekst(170, 124, 'Elke soort weer een eigen waarschuwing:', { maat: 10.5, klasse: 'stil' });
  uit += tekst(170, 139, 'windstoten · onweer · zware regen · sneeuw · gladheid', { maat: 10, klasse: 'stil' });
  uit += tekst(170, 153, 'mist · hitte · kou · waterhozen', { maat: 10, klasse: 'stil' });
  return svg(340, 160, 'De waarschuwingen van het KNMI: code geel, kans op gevaarlijk weer; code oranje, grote kans op gevaarlijk weer met grote gevolgen; code rood, een weeralarm bij extreem weer.', uit);
}

/** The zonkracht: how high the sun stands counts, not how warm it is; and the four steps of the KNMI scale. */
function zonkrachtSchaal() {
  let uit = '<rect x="0" y="0" width="340" height="112" rx="12" class="w-lucht"/><path d="M0 100 H340 V112 H0Z" class="w-grond"/>';
  // a low sun and a high sun over the same spot
  uit += '<path d="M60 100 A110 110 0 0 1 280 100" class="lijn haar" fill="none" stroke-dasharray="3 4"/>';
  uit += zon(78, 66, 10) + zon(170, 22, 10);
  uit += '<path d="M78 66 L160 100" class="w-zonstraal"/><path d="M170 22 L170 100" class="w-zonstraal sterk"/>';
  uit += tekst(70, 92, 'laag: zwakker', { maat: 10, klasse: 'vet' }) + tekst(246, 30, 'hoog: sterker', { maat: 10, klasse: 'vet' });
  uit += '<path d="M206 26 H186" class="lijn"/><path d="M192 21 L184 26 L192 31" class="lijn" fill="none"/>';
  // the scale 1..10 in four steps
  const x = (k) => 20 + (k - 1) * 30;
  const stappen = [[1, 2, 'w-zk1', 'vrijwel', 'geen'], [3, 4, 'w-zk2', 'matig', ''], [5, 6, 'w-zk3', 'sterk', ''], [7, 10, 'w-zk4', 'zeer sterk', '(7 en hoger)']];
  for (const [van, tot, klasse, a, b] of stappen) {
    uit += `<rect x="${x(van)}" y="128" width="${(tot - van + 1) * 30}" height="22" class="${klasse}"/>`;
    const midden = x(van) + ((tot - van + 1) * 30) / 2;
    uit += tekst(midden, 168, a, { maat: 10, klasse: 'vet' }) + (b ? tekst(midden, 180, b, { maat: 9.5, klasse: 'stil' }) : '');
  }
  for (let k = 1; k <= 10; k++) uit += tekst(x(k) + 15, 143, k === 10 ? '10+' : String(k), { maat: 10, klasse: 'vet w-zk-getal' });
  uit += `<rect x="20" y="128" width="300" height="22" class="lijn dun"/>`;
  return svg(340, 186, 'De zonkracht: hoe hoger de zon staat, hoe sterker. Daaronder de schaal van het KNMI: 1 en 2 vrijwel geen, 3 en 4 matig, 5 en 6 sterk, 7 en hoger zeer sterk.', uit);
}

// -- sterren ---------------------------------------------------------------------------------------------------------

/**
 * The Southern Cross with its pointers, as you see it standing upright above the south pole of the sky, from 22
 * degrees south. Drawn round the pole with the true distance to it, so "four and a half times" holds on the picture.
 * Positions J2000 from the Bright Star Catalogue.
 */
function zuiderkruis() {
  const RAD = Math.PI / 180;
  const fi = -22 * RAD; const st = 12.45 * 15 * RAD;                 // the sky when the Cross stands highest
  const naar = (raUren, dec) => {
    const H = st - raUren * 15 * RAD; const d = dec * RAD;
    const h = Math.asin(Math.sin(fi) * Math.sin(d) + Math.cos(fi) * Math.cos(d) * Math.cos(H));
    const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(fi) - Math.tan(d) * Math.cos(fi)) + Math.PI;
    const v = [Math.cos(h) * Math.sin(az), Math.cos(h) * Math.cos(az), Math.sin(h)];      // east, north, up
    const c = [0, -Math.cos(22 * RAD), Math.sin(22 * RAD)];                              // the south pole of the sky
    const rho = Math.acos(v[0] * c[0] + v[1] * c[1] + v[2] * c[2]);                     // degrees from the pole stay true
    const k = rho / Math.sin(rho);
    const x = -v[0] * k;                                                                  // west to the right
    const y = (v[1] * Math.sin(22 * RAD) + v[2] * Math.cos(22 * RAD)) * k;               // up, square to c
    return [r1(150 + x * 300), r1(196 - y * 300)];
  };
  const acrux = naar(12.443, -63.10); const gacrux = naar(12.519, -57.11);
  const mimosa = naar(12.795, -59.69); const delta = naar(12.252, -58.75); const eps = naar(12.356, -60.40);
  const alfaCen = naar(14.660, -60.83); const betaCen = naar(14.064, -60.37);
  const horizon = r1(196 + 22 * RAD * 300);
  let uit = `<rect width="300" height="${horizon + 40}" rx="14" class="nacht"/>`;
  // the long axis on, about four and a half times, to the pole of the sky (in the middle of the picture)
  const eind = [150, 196];
  uit += `<path d="M${acrux.join(' ')} L${eind.join(' ')}" class="wijslijn"/>`;
  uit += `<polyline points="${gacrux.join(',')} ${acrux.join(',')}" class="sterlijn"/><polyline points="${delta.join(',')} ${mimosa.join(',')}" class="sterlijn"/>`;
  uit += `<path d="M${eind[0]} ${eind[1] + 6} V${horizon}" class="w-lood"/>`;
  uit += `<path d="M0 ${horizon} H300 V${horizon + 40} H0Z" class="w-nachtgrond"/>`;
  for (const [p, r] of [[acrux, 4.6], [gacrux, 4], [mimosa, 4.4], [delta, 3.2], [eps, 2.4], [alfaCen, 5.4], [betaCen, 4.8]]) uit += `<circle cx="${p[0]}" cy="${p[1]}" r="${r}" class="ster"/>`;
  uit += `<circle cx="${eind[0]}" cy="${eind[1]}" r="4" class="w-pool"/>`;
  uit += `<text x="${eind[0] + 8}" y="${eind[1] + 4}" class="sterlabel" font-size="10.5">zuidpool van de hemel</text>`;
  uit += `<text x="${gacrux[0] + 10}" y="${gacrux[1] - 4}" class="sterlabel vet" font-size="11">Zuiderkruis</text>`;
  uit += `<text x="${(alfaCen[0] + betaCen[0]) / 2}" y="${Math.max(alfaCen[1], betaCen[1]) + 18}" class="sterlabel" font-size="10" text-anchor="middle">de wijzers</text>`;
  uit += `<text x="${eind[0]}" y="${horizon + 24}" class="w-zuid" font-size="15" text-anchor="middle">Z</text>`;
  uit += `<text x="${eind[0] + 10}" y="${(eind[1] + horizon) / 2 + 4}" class="sterlabel" font-size="10">recht naar beneden</text>`;
  return svg(300, horizon + 40, 'Het Zuiderkruis aan de zuidelijke hemel: verleng de lange as van het kruis ongeveer 4,5 keer, dan ben je bij de zuidpool van de hemel. Recht daaronder, op de horizon, is het zuiden. Links staan de twee heldere wijzers.', uit);
}

/** A little random-looking but fixed: the same sky every time. */
const stip = (n) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };

/** The same sky over a town and over a dark place without a moon: only in the dark you see the Milky Way. */
function melkweg() {
  let uit = '<rect x="0" y="0" width="166" height="190" rx="12" class="w-stadlucht"/><rect x="174" y="0" width="166" height="190" rx="12" class="nacht"/>';
  // the band of the Milky Way, slanting over the dark half: a few soft layers
  uit += '<path d="M190 190 Q240 110 300 60 Q320 40 340 30 V70 Q316 84 300 100 Q262 140 236 190Z" class="w-melkweg"/>';
  uit += '<path d="M206 190 Q248 124 302 76 Q322 58 340 48 V58 Q320 70 304 86 Q258 132 224 190Z" class="w-melkweg"/>';
  uit += '<path d="M244 110 Q262 96 270 104 Q258 116 246 118Z" class="w-stofwolk"/>';
  for (let i = 0; i < 150; i++) {
    const x = 180 + stip(i) * 154; const y = 6 + stip(i + 500) * 150; const r = stip(i + 900) < 0.12 ? 1.6 : stip(i + 900) < 0.4 ? 1.1 : 0.6;
    uit += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" class="ster"/>`;
  }
  // over the town: only the brightest
  for (const [x, y, r] of [[40, 40, 1.8], [120, 30, 1.6], [88, 86, 1.5], [30, 110, 1.3], [140, 100, 1.4]]) uit += `<circle cx="${x}" cy="${y}" r="${r}" class="ster"/>`;
  uit += '<path d="M0 190 V156 h14 v-20 h12 v20 h10 v-34 h16 v34 h12 v-14 h18 v14 h10 v-26 h14 v26 h14 v-12 h16 v12 h18 V190Z" class="w-silhouet"/>';
  uit += '<path d="M174 190 V170 q10 -14 20 -2 q8 -16 20 -4 q12 -18 26 0 q10 -10 20 2 q12 -14 26 0 q10 -8 20 2 q8 -6 14 -4 V190Z" class="w-silhouet"/>';
  uit += tekst(83, 210, 'in de stad', { maat: 11, klasse: 'vet' }) + tekst(257, 210, 'op een donkere plek', { maat: 11, klasse: 'vet' });
  uit += tekst(257, 224, 'zonder maan', { maat: 10, klasse: 'stil' });
  return svg(340, 230, 'Links de nachthemel boven een stad: je ziet maar een paar sterren. Rechts dezelfde hemel op een donkere plek zonder maan: veel meer sterren, en de Melkweg als een lichte band.', uit);
}

/** What moves over the night sky: the ISS glides, a plane blinks, a star stands still. */
function issBaan() {
  let uit = '<rect width="340" height="210" rx="12" class="nacht"/>';
  for (let i = 0; i < 40; i++) uit += `<circle cx="${r1(10 + stip(i + 40) * 320)}" cy="${r1(8 + stip(i + 80) * 150)}" r="${stip(i + 120) < 0.2 ? 1.2 : 0.7}" class="ster"/>`;
  // the ISS: a steady light along a smooth arc, which fades where it enters the shadow of the earth
  const punten = Array.from({ length: 9 }, (_, i) => { const t = i / 8; return [r1(24 + t * 250), r1(150 - Math.sin(t * Math.PI * 0.9) * 110)]; });
  uit += `<polyline points="${punten.map((p) => p.join(',')).join(' ')}" class="w-issbaan"/>`;
  punten.forEach(([x, y], i) => { if (i < 8) uit += `<circle cx="${x}" cy="${y}" r="${i < 6 ? 2.6 : 2.6 - (i - 5) * 0.8}" class="w-iss" opacity="${i < 6 ? 1 : 1 - (i - 5) * 0.3}"/>`; });
  uit += `<text x="${punten[3][0]}" y="${punten[3][1] - 12}" class="sterlabel vet" font-size="11" text-anchor="middle">ISS</text>`;
  uit += tekst(90, 176, 'glijdt rustig en snel, knippert niet', { maat: 10, klasse: 'w-nachttekst' });
  uit += tekst(262, 108, 'verdwijnt soms ineens', { maat: 10, klasse: 'w-nachttekst' });
  // a plane: blinking white, and red and green lights at the wing tips
  uit += '<path d="M200 186 L318 156" class="w-vliegbaan"/>';
  uit += '<circle cx="292" cy="162" r="2.2" class="w-rood-licht"/><circle cx="300" cy="166" r="2.2" class="w-groen-licht"/><circle cx="296" cy="164" r="3" class="ster"/>';
  for (const g of [0, 60, 120, 180, 240, 300]) { const [a, b] = pol(296, 164, 5, g); const [c, d] = pol(296, 164, 9, g); uit += `<path d="M${a} ${b} L${c} ${d}" class="w-knipper"/>`; }
  uit += tekst(330, 198, 'vliegtuig: knippert, rood en groen', { maat: 10, anker: 'end', klasse: 'w-nachttekst' });
  // a star: stays where it is
  uit += '<circle cx="312" cy="36" r="3.2" class="ster"/>' + tekst(302, 40, 'ster: staat stil', { maat: 10, anker: 'end', klasse: 'w-nachttekst' });
  return svg(340, 210, 'Wat beweegt er aan de nachthemel? Het ISS schuift rustig en snel in een boog over de hemel, zonder te knipperen, en verdwijnt soms ineens. Een vliegtuig knippert, met een rood en een groen lichtje. Een ster staat stil.', uit);
}

/** An evening sky in the west after sunset: the planets stand on the line along which the sun and the moon go. */
function planetenAvond() {
  let uit = '<rect width="340" height="210" rx="12" class="nacht"/>';
  // the twilight: lighter and warmer towards the horizon, brightest where the sun went down
  uit += '<path d="M0 190 V120 Q170 96 340 120 V190Z" class="w-schemer"/><path d="M0 190 V150 Q206 118 340 150 V190Z" class="w-schemergloed"/>';
  uit += '<path d="M60 190 Q206 140 340 176 V190Z" class="w-avondgloed-nacht"/>';
  for (let i = 0; i < 30; i++) uit += `<circle cx="${r1(10 + stip(i + 300) * 320)}" cy="${r1(8 + stip(i + 340) * 100)}" r="${stip(i + 380) < 0.2 ? 1.3 : 0.7}" class="ster"/>`;
  // the line of the sun (the ecliptic), rising steeply from where the sun went down
  uit += '<path d="M206 190 L84 10" class="w-ecliptica"/>';
  const op = (t) => [r1(206 - t * 122), r1(190 - t * 180)];
  const venus = op(0.17); const maan = op(0.42); const jupiter = op(0.7);
  uit += `<circle cx="${venus[0]}" cy="${venus[1]}" r="9" class="w-gloed"/><circle cx="${venus[0]}" cy="${venus[1]}" r="4.4" class="w-planeet"/>`;
  uit += `<circle cx="${maan[0]}" cy="${maan[1]}" r="9" class="w-maan-donker"/><path d="M${maan[0]} ${maan[1] - 9} a9 9 0 0 1 0 18 a5 9 0 0 0 0 -18Z" class="w-maan"/>`;
  uit += `<circle cx="${jupiter[0]}" cy="${jupiter[1]}" r="3.2" class="w-planeet"/>`;
  uit += `<text x="${venus[0] + 12}" y="${venus[1] + 4}" class="w-nachttekst vet" font-size="11">Venus, de avondster</text>`;
  uit += `<text x="${maan[0] + 14}" y="${maan[1] + 4}" class="w-nachttekst" font-size="10.5">maan</text>`;
  uit += `<text x="${jupiter[0] + 10}" y="${jupiter[1] + 4}" class="w-nachttekst" font-size="10.5">Jupiter</text>`;
  uit += '<path d="M0 190 V178 q20 -8 40 -2 q30 -10 60 0 q40 -8 80 0 q40 -10 80 -2 q40 -6 80 2 V190Z" class="w-silhouet"/>';
  uit += '<rect y="188" width="340" height="22" rx="0" class="w-silhouet"/>';
  uit += `<text x="206" y="204" class="w-nachttekst vet" font-size="12" text-anchor="middle">W</text>`;
  uit += `<text x="104" y="24" class="w-nachttekst" font-size="10">de lijn van</text><text x="110" y="36" class="w-nachttekst" font-size="10">zon en maan</text>`;
  return svg(340, 210, 'Een voorbeeld van de avondhemel in het westen, kort na zonsondergang: Venus staat laag en fel, hoger de maan en Jupiter. Ze staan allemaal op de schuine lijn waar ook de zon langs gaat.', uit);
}

// -- added later: how clouds form, the far side of the moon, tides, eclipses, northern lights, the solar system, meteors

/** Warm air rises from the ground, cools, and at the condensation level the vapour turns into a cumulus. */
function wolkOntstaan() {
  const B = 320; const H = 230; const niveau = 96;
  let uit = `<rect width="${B}" height="${H}" rx="12" class="w-lucht"/>` + grond(B, H) + zon(40, 36);
  uit += `<path d="M8 ${niveau} H${B - 8}" class="w-niveau"/>`;
  uit += stapel(196, niveau, [[-30, -14, 18], [-8, -30, 24], [18, -22, 20], [36, -10, 13], [-44, -6, 10]]);
  // rising bubbles of warm air from the sunny field
  for (const [x, y0, y1] of [[170, 196, 112], [208, 196, 116], [244, 194, 128]]) {
    uit += `<path d="M${x} ${y0} C${x - 8} ${(y0 + y1) / 2 + 20} ${x + 8} ${(y0 + y1) / 2 - 10} ${x} ${y1}" class="w-luchtpijl warm"/><path d="M${x - 5} ${y1 + 8} L${x} ${y1} L${x + 5} ${y1 + 8}" class="w-luchtpijl warm"/>`;
  }
  uit += tekst(12, niveau - 6, 'condensatieniveau', { maat: 10.5, anker: 'start', klasse: 'vet' });
  uit += tekst(12, niveau + 14, 'hierboven wordt de damp', { maat: 10, anker: 'start' }) + tekst(12, niveau + 26, 'kleine druppeltjes', { maat: 10, anker: 'start' });
  uit += tekst(20, 166, 'warme lucht stijgt op', { maat: 10.5, anker: 'start', klasse: 'vet' }) + tekst(20, 179, 'en koelt af', { maat: 10.5, anker: 'start' });
  uit += tekst(206, 222, 'de zon verwarmt de grond', { maat: 10, klasse: 'vet' });
  return svg(B, H, 'Hoe een stapelwolk ontstaat: de zon verwarmt de grond, warme lucht stijgt op en koelt af. Op het condensatieniveau wordt de waterdamp kleine druppeltjes: daar begint de wolk, met een platte onderkant.', uit);
}

/** The moon going round the earth, always with the same side (marked) towards us. */
function maanAchterkant() {
  const c = [160, 130]; const R = 86;
  let uit = `<circle cx="${c[0]}" cy="${c[1]}" r="${R}" class="lijn haar" stroke-dasharray="3 4"/>`;
  uit += `<circle cx="${c[0]}" cy="${c[1]}" r="18" class="blauw"/>` + tekst(c[0], c[1] + 34, 'aarde', { maat: 10, klasse: 'stil' });
  for (const g of [0, 90, 180, 270, 45, 135, 225, 315]) {
    const [x, y] = pol(c[0], c[1], R, g); const klein = g % 90 !== 0; const r = klein ? 9 : 14;
    uit += `<circle cx="${x}" cy="${y}" r="${r}" class="w-maan"/><circle cx="${x}" cy="${y}" r="${r}" class="lijn dun"/>`;
    // the same face: a dark patch on the side towards the earth
    const [vx, vy] = pol(x, y, r * 0.45, g + 180);
    uit += `<circle cx="${vx}" cy="${vy}" r="${r1(r * 0.42)}" class="w-maanzee"/>`;
  }
  uit += `<path d="M${c[0] + 52} ${c[1] - 76} A92 92 0 0 0 ${c[0] - 52} ${c[1] - 76}" class="lijn stil" fill="none"/><path d="M${c[0] - 44} ${c[1] - 84} L${c[0] - 54} ${c[1] - 76} L${c[0] - 42} ${c[1] - 70}" class="lijn stil" fill="none"/>`;
  uit += tekst(c[0], 250, 'de donkere vlek wijst steeds naar de aarde', { maat: 11, klasse: 'vet' });
  return svg(320, 258, 'De maan op acht plekken van zijn rondje om de aarde. De donkere vlek, de kant die wij zien, wijst steeds naar de aarde: de maan draait in één rondje ook één keer om zichzelf.', uit);
}

/** Spring tide and neap tide: the water of the earth stretched towards the moon, with the sun on the left. */
function getijden() {
  let uit = '';
  const paneel = (x0, moonG, rx, ry, kop, onder) => {
    const c = [x0 + 100, 92];
    let u = `<rect x="${x0 + 4}" y="4" width="192" height="170" rx="10" class="vlak2"/>`;
    u += `<circle cx="${x0 + 22}" cy="${c[1]}" r="12" class="w-zon"/>` + tekst(x0 + 22, c[1] + 26, 'zon', { maat: 9.5, klasse: 'stil' });
    for (const y of [80, 92, 104]) u += `<path d="M${x0 + 38} ${y} H${x0 + 50}" class="w-zonlicht"/>`;
    u += `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${rx}" ry="${ry}" class="w-getij" transform="rotate(${moonG - 90} ${c[0]} ${c[1]})"/>`;
    u += `<circle cx="${c[0]}" cy="${c[1]}" r="16" class="blauw"/>`;
    const [mx, my] = pol(c[0], c[1], 62, moonG);
    u += `<circle cx="${mx}" cy="${my}" r="8" class="w-maan"/><circle cx="${mx}" cy="${my}" r="8" class="lijn dun"/>`;
    u += tekst(c[0], 154, kop, { maat: 12, klasse: 'vet' }) + tekst(c[0], 168, onder, { maat: 10, klasse: 'stil' });
    return u;
  };
  uit += paneel(0, 90, 30, 20, 'springtij', 'nieuwe of volle maan');
  uit += paneel(200, 0, 24, 21, 'doodtij', 'eerste of laatste kwartier');
  uit += tekst(200, 192, 'niet op schaal; het water rond de aarde is heel erg overdreven', { maat: 9.5, klasse: 'stil' });
  return svg(400, 198, 'Links springtij: zon, aarde en maan op één lijn, het water wordt flink naar twee kanten uitgerekt. Rechts doodtij: de maan staat haaks op de zon en het water wordt minder uitgerekt. Niet op schaal.', uit);
}

/** A solar eclipse (the moon's shadow on the earth) and a lunar eclipse (the moon in the earth's shadow). */
function verduistering() {
  let uit = '';
  const rij = (y, eerst, kop, onder) => {
    let u = `<rect x="4" y="${y}" width="352" height="112" rx="10" class="vlak2"/>`;
    const m = y + 64;
    u += `<circle cx="14" cy="${m}" r="30" class="w-zon"/>` + tekst(14, m + 44, 'zon', { maat: 10, klasse: 'stil' });
    if (eerst === 'maan') {
      u += `<path d="M190 ${m - 7} L292 ${m - 2} L292 ${m + 2} L190 ${m + 7}Z" class="w-schaduw"/>`;
      u += `<circle cx="190" cy="${m}" r="7" class="w-maan-donker"/><circle cx="300" cy="${m}" r="20" class="blauw"/>`;
      u += tekst(190, m + 24, 'maan', { maat: 10.5 }) + tekst(300, m + 36, 'aarde', { maat: 10.5 });
    } else {
      u += `<path d="M190 ${m - 18} L320 ${m - 8} L320 ${m + 8} L190 ${m + 18}Z" class="w-schaduw"/>`;
      u += `<circle cx="190" cy="${m}" r="20" class="blauw"/><circle cx="300" cy="${m}" r="7" class="w-bloedmaan"/>`;
      u += tekst(190, m + 36, 'aarde', { maat: 10.5 }) + tekst(300, m + 24, 'maan', { maat: 10.5 });
    }
    u += tekst(56, y + 20, kop, { maat: 12, anker: 'start', klasse: 'vet' }) + tekst(56, y + 34, onder, { maat: 10, anker: 'start', klasse: 'stil' });
    return u;
  };
  uit += rij(4, 'maan', 'zonsverduistering', 'nieuwe maan: de schaduw van de maan valt op de aarde');
  uit += rij(122, 'aarde', 'maansverduistering', 'volle maan: de maan in de schaduw van de aarde');
  return svg(360, 238, 'Boven een zonsverduistering: de maan staat tussen de zon en de aarde en zijn schaduw valt op de aarde. Onder een maansverduistering: de aarde staat tussen de zon en de maan, en de maan schuift door de schaduw van de aarde en wordt rood. Niet op schaal.', uit);
}

/** Northern lights over a dark landscape, looking north. */
function noorderlicht() {
  let uit = '<rect width="320" height="200" rx="12" class="nacht"/>';
  for (let i = 0; i < 40; i++) uit += `<circle cx="${r1(8 + stip(i + 700) * 304)}" cy="${r1(6 + stip(i + 760) * 120)}" r="${stip(i + 820) < 0.2 ? 1.2 : 0.7}" class="ster"/>`;
  // curtains: vertical rays, red at the top, green lower down
  for (let i = 0; i < 26; i++) {
    const x = 30 + i * 10 + Math.sin(i * 0.8) * 6; const voet = 132 - Math.sin(i * 0.45) * 22; const hoog = 50 + stip(i + 900) * 40;
    uit += `<path d="M${r1(x)} ${r1(voet)} V${r1(voet - hoog)}" class="w-aurora"/><path d="M${r1(x)} ${r1(voet - hoog)} V${r1(voet - hoog - 22)}" class="w-aurora rood"/>`;
  }
  uit += '<path d="M0 200 V160 q16 -10 30 -4 l6 -14 l6 14 q20 -8 40 0 q30 -10 60 -2 l5 -12 l5 12 q26 -6 50 2 q30 -10 60 -2 q30 -6 58 0 V200Z" class="w-silhouet"/>';
  uit += '<text x="160" y="190" class="w-nachttekst vet" font-size="12" text-anchor="middle">N</text>';
  return svg(320, 200, 'Noorderlicht boven een donker landschap, kijkend naar het noorden: groene stralen als een gordijn, met rood erboven.', uit);
}

/** The eight planets in a row, sizes to scale, distances not. */
function zonnestelsel() {
  const P = [['Mercurius', 2440, 'w-pl-grijs'], ['Venus', 6052, 'w-pl-geel'], ['Aarde', 6371, 'blauw'], ['Mars', 3390, 'w-pl-rood'],
    ['Jupiter', 69911, 'w-pl-jupiter'], ['Saturnus', 58232, 'w-pl-geel'], ['Uranus', 25362, 'w-pl-ijs'], ['Neptunus', 24622, 'w-pl-blauw']];
  const xs = [50, 72, 94, 116, 158, 220, 272, 316];
  let uit = '<path d="M0 0 H6 A120 120 0 0 1 6 150 H0Z" class="w-zon"/>';
  P.forEach(([naam, km, klasse], i) => {
    const r = Math.max(1.6, r1((km / 69911) * 26)); const x = xs[i]; const y = 70;
    if (naam === 'Saturnus') uit += `<ellipse cx="${x}" cy="${y}" rx="${r1(r * 2)}" ry="${r1(r * 0.45)}" class="w-ring"/>`;
    uit += `<circle cx="${x}" cy="${y}" r="${r}" class="${klasse}"/>`;
    const onder = i % 2 === 0 && i !== 4;
    uit += `<path d="M${x} ${y + r + 3} V${onder ? 120 : 104}" class="lijn haar"/>` + tekst(x, onder ? 132 : 116, naam, { maat: 10 });
  });
  uit += tekst(200, 150, 'grootte op schaal, afstand niet', { maat: 10, klasse: 'stil' });
  return svg(350, 156, 'De acht planeten op een rij, met de zon links: Mercurius, Venus, Aarde en Mars zijn klein, Jupiter, Saturnus met zijn ring, Uranus en Neptunus zijn reuzen. De grootte is op schaal, de afstand niet.', uit);
}

/** A meteor shower: the trails all seem to come from one point, the radiant. */
function vallendeSterren() {
  let uit = '<rect width="320" height="200" rx="12" class="nacht"/>';
  for (let i = 0; i < 50; i++) uit += `<circle cx="${r1(8 + stip(i + 1000) * 304)}" cy="${r1(6 + stip(i + 1060) * 170)}" r="${stip(i + 1120) < 0.2 ? 1.2 : 0.7}" class="ster"/>`;
  const rad = [170, 104];
  uit += `<circle cx="${rad[0]}" cy="${rad[1]}" r="16" class="w-radiant"/>`;
  for (const [g, a, l] of [[20, 30, 55], [70, 36, 70], [110, 40, 55], [150, 34, 45], [180, 30, 36], [245, 40, 60], [290, 36, 80], [335, 30, 60], [100, 90, 40]]) {
    const [x1, y1] = pol(rad[0], rad[1], a, g); const [x2, y2] = pol(rad[0], rad[1], a + l, g);
    uit += `<path d="M${x1} ${y1} L${x2} ${y2}" class="w-meteoor"/><circle cx="${x2}" cy="${y2}" r="1.6" class="ster"/>`;
  }
  uit += `<path d="M${rad[0] - 12} ${rad[1] - 12} L58 186" class="w-radiantlijn"/><rect x="8" y="176" width="150" height="20" rx="4" class="w-nachtvlak"/><text x="14" y="190" class="w-nachttekst vet" font-size="11">hier lijken ze vandaan te komen</text>`;
  return svg(320, 200, 'Een meteorenzwerm: de sporen van de vallende sterren lijken allemaal uit één punt aan de hemel te komen, de radiant.', uit);
}

export default {
  weerstation,
  weerlogboek,
  avondrood,
  'knmi-codes': knmiCodes,
  'zonkracht-schaal': zonkrachtSchaal,
  zuiderkruis,
  melkweg,
  'iss-baan': issBaan,
  'planeten-avond': planetenAvond,
  ...Object.fromEntries(WOLKEN.map((w) => [`wolk-${w.id}`, () => wolkTekening(w.id)])),
  wolkenlagen,
  windrichting,
  zeewind,
  'buys-ballot': buysBallot,
  fronten,
  warmtefront,
  barometer,
  maanfasen,
  maanstanden,
  zonnebaan,
  'wolk-ontstaan': wolkOntstaan,
  'maan-achterkant': maanAchterkant,
  getijden,
  verduistering,
  noorderlicht,
  zonnestelsel,
  'vallende-sterren': vallendeSterren,
};
