// Drawings for tocht. See ../plaatjes.js and ./basis.js.
//
// Most notations show the same example route, so a scout can lay them side by side: from the start you walk north
// to crossing 1 and turn right; at 2 (a road to the right) straight on; at 3 left; at 4 (a fork) half right, to the
// end. The trail signs come from ../doe/tocht/tekens.js, which the quiz uses too.
import { pol, r1, svg, tekst } from './basis.js';
import { BP, BP_NACHT, MARKERING, NATUUR, pijl, UITGEBREID } from '../doe/tocht/tekens.js';

// -- the example route on a small map of 300 × 200
const WEGEN = ['M60 196V18', 'M8 130H292', 'M150 130V196', 'M240 130V60', 'M240 60L202 18', 'M240 60L282 18'];
const PADEN = ['M8 60H60', 'M100 196V164H128'];
const ROUTE = 'M60 192V130H240V60L276 24';
const KRUISPUNTEN = [[60, 130], [150, 130], [240, 130], [240, 60]];
/** Per crossing: the heading you arrive with, the other roads and the one you take, all in degrees from north. */
const VOORBEELD = [
  { koers: 0, wegen: [270, 0, 90], keuze: 90 },
  { koers: 90, wegen: [90, 180], keuze: 90 },
  { koers: 90, wegen: [0, 90], keuze: 0 },
  { koers: 0, wegen: [315, 45], keuze: 45 },
];
const rel = (g, koers) => ((g - koers) % 360 + 360) % 360;

/** The map of the example route, at (x, y) and scale. */
function voorbeeldKaart(x = 0, y = 0, schaal = 1, { route = true, nummers = true } = {}) {
  let uit = `<g transform="translate(${x} ${y}) scale(${schaal})"><rect x="0" y="0" width="300" height="200" rx="8" class="tw-paneel"/>`;
  uit += '<path d="M200 140h60v40h-60z" class="tw-bos"/><path d="M90 30h50v60h-50z" class="tw-bos"/>';
  uit += WEGEN.map((d) => `<path d="${d}" class="tw-weg smal"/>`).join('') + PADEN.map((d) => `<path d="${d}" class="tw-pad"/>`).join('');
  if (route) uit += `<path d="${ROUTE}" class="tw-route"/>` + pijl(258, 42, 278, 22, { klasse: 'tw-route', punt: 10 }) + '<circle cx="60" cy="192" r="5" class="rood"/>';
  if (nummers) {
    const plek = [[44, 116], [150, 114], [256, 146], [224, 72]];
    uit += plek.map(([px, py], i) => `<circle cx="${px}" cy="${py}" r="8" class="vlak"/><circle cx="${px}" cy="${py}" r="8" class="lijn dun"/>${tekst(px, py + 3.5, i + 1, { maat: 10, klasse: 'vet' })}`).join('');
  }
  return `${uit}</g>`;
}

/** A thick north arrow at (x, y), pointing at `hoek`, with an N; `dubbel` draws it with a double shaft. */
function noordpijl(x, y, hoek = 0, lengte = 40, { dubbel = false, letter = true } = {}) {
  const h = lengte / 2;
  const schacht = dubbel ? `<path d="M-3 ${h}V${-h + 10}M3 ${h}V${-h + 10}" class="tw-noord"/>` : `<path d="M0 ${h}V${-h + 10}" class="tw-noord dik"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${hoek})">${schacht}<path d="M-8 ${-h + 12}L0 ${-h - 2}L8 ${-h + 12}Z" class="tw-noord tk-punt"/>${
    letter ? `<text x="0" y="${-h - 8}" class="tekst vet" font-size="11" text-anchor="middle" transform="rotate(${-hoek} 0 ${-h - 12})">N</text>` : ''}</g>`;
}

/** A crossing seen from above, the road you come from at the bottom; takken and keuze relative to straight on. */
function kruispunt(cx, cy, R, takken, keuze, { noord = null, pen = true } = {}) {
  let uit = '';
  for (const g of [180, ...takken]) { const [x, y] = pol(cx, cy, R, g); uit += `<path d="M${cx} ${cy}L${x} ${y}" class="tw-weg"/>`; }
  if (pen) {
    const [sx, sy] = pol(cx, cy, R * 0.8, 180); const [ex, ey] = pol(cx, cy, R * 0.85, keuze);
    uit += `<path d="M${sx} ${sy}L${cx} ${cy}" class="tw-pen"/>${pijl(cx, cy, ex, ey, { klasse: 'tw-pen', punt: 10 })}`;
  }
  if (noord != null) uit += noordpijl(cx + R * 0.95, cy - R * 1.12, noord, 22);
  return uit;
}

/** A bolletje-pijltje sign: the dot is the crossing, the arrow the road to take, stubs the roads you leave. */
function bolletjePijltje(cx, cy, keuze, laten, lengte = 24) {
  let uit = laten.map((g) => { const [x, y] = pol(cx, cy, lengte * 0.5, g); return `<path d="M${cx} ${cy}L${x} ${y}" class="tw-pen"/>`; }).join('');
  const [ex, ey] = pol(cx, cy, lengte, keuze);
  uit += pijl(cx, cy, ex, ey, { klasse: 'tw-pen', punt: 9 });
  return `${uit}<circle cx="${cx}" cy="${cy}" r="5" class="telefoon"/>`;
}

/** A stripkaart from (x, bottom) up to (x, top): stappen = [{ links, rechts }] at equal distances. */
function strip(x, onder, boven, stappen, { lengte = 18, nummers = true } = {}) {
  let uit = `<path d="M${x} ${onder}V${boven}" class="tw-pen"/><circle cx="${x}" cy="${onder}" r="5" class="telefoon"/>`;
  const stap = (onder - boven) / (stappen.length + 1);
  stappen.forEach(({ links = 0, rechts = 0, tekstL, tekstR }, i) => {
    const y = r1(onder - stap * (i + 1));
    const kant = (n, z) => (n === 1 ? [`M${x} ${y}h${z * lengte}`] : n === 2 ? [`M${x} ${y}l${z * lengte} ${-lengte * 0.55}`, `M${x} ${y}l${z * lengte} ${lengte * 0.55}`] : []);
    uit += [...kant(links, -1), ...kant(rechts, 1)].map((d) => `<path d="${d}" class="tw-pen"/>`).join('');
    if (nummers) uit += tekst(x + (rechts ? -lengte - 14 : lengte + 14), y + 4, i + 1, { maat: 10, klasse: 'stil' });
    if (tekstL) uit += tekst(x - 10, y - 5, tekstL, { maat: 12, anker: 'end', klasse: 'vet' });
    if (tekstR) uit += tekst(x + 10, y - 5, tekstR, { maat: 12, anker: 'start' });
  });
  return `${uit}<path d="M${x - lengte * 1.6} ${boven}H${x + lengte * 1.6}" class="tw-pen"/>`;
}
const STRIP_VOORBEELD = [{ links: 2 }, { rechts: 1 }, { rechts: 1 }, { links: 1 }];

/** A face whose eyes look at `kijk` ('links', 'op', 'rechts'), or with one eye shut ('dicht-links', ...). */
function gezicht(cx, cy, kijk, { smiley = false } = {}) {
  let uit = `<circle cx="${cx}" cy="${cy}" r="22" class="tw-gezicht"/>`;
  const dx = { links: -3.5, op: 0, rechts: 3.5 }[kijk] ?? 0; const dy = kijk === 'op' ? -3.5 : 0;
  for (const z of [-1, 1]) {
    const ox = cx + z * 8; const oy = cy - 5;
    const dicht = (kijk === 'dicht-links' && z === -1) || (kijk === 'dicht-rechts' && z === 1);
    uit += dicht ? `<ellipse cx="${ox}" cy="${oy}" rx="5" ry="6.5" class="tw-oog-dicht"/>`
      : `<ellipse cx="${ox}" cy="${oy}" rx="5" ry="6.5" class="tw-oogwit"/><circle cx="${ox + dx}" cy="${oy + dy}" r="2.6" class="tw-pupil"/>`;
  }
  if (smiley) uit += `<path d="M${cx - 9} ${cy + 8}q9 7 18 0" class="tw-pen dun"/>`;
  return uit;
}

/** Tiles in a grid, each a sign with a caption of one or two lines (split at |). */
function tegels(lijst, kolommen, titel, { cel = 92, hoog = 112, teken = 64 } = {}) {
  const rijen = Math.ceil(lijst.length / kolommen);
  let uit = '';
  lijst.forEach(({ inhoud, kort }, i) => {
    const x = (i % kolommen) * cel; const y = Math.floor(i / kolommen) * hoog;
    uit += `<rect x="${x + 3}" y="${y + 3}" width="${cel - 6}" height="${hoog - 6}" rx="8" class="vlak2"/>`;
    uit += `<g transform="translate(${x + (cel - teken) / 2} ${y + 8}) scale(${teken / 100})">${inhoud}</g>`;
    kort.split('|').forEach((regel, k) => { uit += tekst(x + cel / 2, y + teken + 24 + k * 12, regel, { maat: 9.5 }); });
  });
  return svg(cel * kolommen, hoog * rijen, titel, uit);
}

const KORT = {
  'bp-weg': 'deze weg', 'bp-brief': 'brief, 3 passen|die kant op', 'bp-niet': 'niet deze weg', 'bp-huis': 'naar huis',
  'bp-handtekening': 'nr. 3 van|de Wolven',
  'sp-weg': 'deze weg', 'sp-rennen': 'rennen', 'sp-links': 'linksaf', 'sp-rechts': 'rechtsaf', 'sp-niet': 'niet doorgaan',
  'sp-einde': 'einde spoor', 'sp-thuis': 'einde: naar huis', 'sp-begin': 'begin spoor', 'sp-dwaal': 'dwaalspoor',
  'sp-splitsen': 'gesplitst:|3 links, 2 rechts', 'sp-verstopt': 'verstopt,|3 passen', 'sp-verstopt-hoog': 'verstopt, 3 m ver|en 2 m hoog',
  'sp-binnen30': 'verstopt|binnen 30 m', 'sp-gevaar': 'gevaar', 'sp-hindernis': 'hindernis:|eroverheen',
  'sp-kamp-bewoond': 'bewoond kamp', 'sp-kamp-leeg': 'leeg kamp', 'sp-water': 'drinkwater', 'sp-water-niet': 'water niet|drinken',
  'sp-vriend': 'vriendschap', 'sp-vijand': 'vijandschap',
  'nt-grasdot': 'grasdot:|punten wijzen', 'nt-stenen-weg': 'kleine steen|wijst de weg', 'nt-stenen-stop': 'drie op elkaar:|niet doorgaan',
  'nt-tak': 'schuine tak|wijst de weg', 'nt-tak-afstand': 'twee steuntakken:|2× de afstand', 'nt-stop-gras': 'drie dwars:|niet doorgaan',
  'nt-lucifer': 'lucifer: kopje|wijst de weg',
};
const metKort = (lijst) => lijst.map((t) => ({ inhoud: t.teken, kort: KORT[t.id] ?? t.naam }));

// -- the example route in the notations ------------------------------------------------------------------------

function kruispuntenroute({ noord = false } = {}) {
  let uit = '';
  VOORBEELD.forEach(({ koers, wegen, keuze }, i) => {
    const cx = 45 + i * 90; const cy = 64;
    uit += `<rect x="${cx - 42}" y="4" width="84" height="116" rx="8" class="vlak2"/>`;
    uit += kruispunt(cx, cy, 32, wegen.map((g) => rel(g, koers)), rel(keuze, koers), { noord: noord ? rel(0, koers) : null });
    uit += tekst(cx - 32, 22, i + 1, { maat: 13, klasse: 'vet' });
  });
  return svg(360, 124, noord ? 'Kruispunten-noordpijlroute: vier kruispunten, elk met een dikke noordpijl en een dunne looppijl'
    : 'Kruispuntenroute: vier kruispunten, steeds van onderen binnen, de pijl wijst de weg', uit);
}

function bolletjePijltjeRoute() {
  let uit = voorbeeldKaart(30, 0);
  VOORBEELD.forEach(({ koers, wegen, keuze }, i) => {
    const cx = 75 + i * 70; const cy = 250;
    uit += bolletjePijltje(cx, cy, rel(keuze, koers), wegen.filter((g) => g !== keuze).map((g) => rel(g, koers)));
    uit += tekst(cx, 290, i + 1, { maat: 11, klasse: 'stil' });
  });
  uit += pijl(40, 304, 320, 304, { klasse: 'tw-pen dun', punt: 7 }) + tekst(180, 300, 'lees van links naar rechts', { maat: 10, klasse: 'stil' });
  return svg(360, 312, 'Bolletje-pijltje: de kaart met de route, en daaronder vier tekens. 1: rechtsaf, 2: rechtdoor met een weg rechts, 3: linksaf, 4: schuin rechts', uit);
}

function stripkaartRoute() {
  const uit = voorbeeldKaart(0, 30, 0.8) + strip(300, 250, 20, STRIP_VOORBEELD)
    + tekst(120, 20, 'de route op de kaart', { maat: 11, klasse: 'stil' }) + tekst(300, 270, 'begin', { maat: 10, klasse: 'stil' });
  return svg(360, 280, 'Stripkaart van de voorbeeldroute: begin onderaan bij het bolletje. 1: twee wegen links laten liggen, 2 en 3: één rechts, 4: één links, dan de eindstreep', uit);
}

function noordpijlRoute() { return kruispuntenroute({ noord: true }); }

function aangezichtsKruispunt() {
  let uit = '<rect x="0" y="0" width="300" height="220" rx="10" class="vlak2"/>';
  uit += kruispunt(150, 120, 100, [270, 0, 90], 90, { pen: false });
  uit += '<path d="M60 40h50v42h-50z" class="tw-huis"/><path d="M54 42L85 18L116 42Z" class="tw-huis"/>';
  for (const [x, y] of [[210, 40], [236, 54], [262, 38], [240, 176], [270, 198]]) uit += `<circle cx="${x}" cy="${y}" r="13" class="tw-boom"/>`;
  uit += '<path d="M184 150h22v6h-22zM186 156v8M204 156v8" class="lijn"/>';
  uit += '<path d="M110 172V140M110 140l-16 -10M110 140l16 -10" class="lijn dik"/>';
  uit += `<path d="M150 210V120" class="tw-pen"/>${pijl(150, 120, 236, 120, { klasse: 'tw-pen', punt: 12 })}`;
  uit += tekst(68, 100, 'boerderij', { maat: 10 }) + tekst(196, 178, 'bankje', { maat: 10 }) + tekst(86, 186, 'wegwijzer', { maat: 10 });
  return svg(300, 220, 'Aangezichtskruispunt: het kruispunt met een boerderij, bomen, een bankje en een wegwijzer erbij; de pijl gaat rechtsaf', uit);
}

function ogenroute() {
  const kijk = ['rechts', 'op', 'links', 'rechts'];
  const dicht = ['dicht-rechts', null, 'dicht-links', 'dicht-rechts'];
  let uit = '';
  kijk.forEach((k, i) => {
    const cx = 50 + i * 86;
    uit += gezicht(cx, 36, k) + gezicht(cx, 106, dicht[i] ?? 'open', { smiley: true });
    uit += tekst(cx, 148, ['rechtsaf', 'rechtdoor', 'linksaf', 'rechtsaf'][i], { maat: 11 });
  });
  uit += tekst(4, 12, 'ogen kijken', { maat: 10, anker: 'start', klasse: 'stil' }) + tekst(4, 80, 'één oog zwart', { maat: 10, anker: 'start', klasse: 'stil' });
  return svg(350, 156, 'Ogenroute van de voorbeeldroute: bovenaan kijken de ogen naar rechts, omhoog, links, rechts; onderaan is het rechteroog zwart, beide open, het linkeroog zwart, het rechteroog zwart', uit);
}

function kralentocht() {
  const kralen = ['rood', 'groen', 'lila', 'rood'];
  let uit = '<path d="M14 50a12 12 0 1 1 24 0H330" class="tw-touw"/>';
  kralen.forEach((k, i) => { uit += `<circle cx="${80 + i * 62}" cy="50" r="13" class="tw-kraal-${k}"/>${tekst(80 + i * 62, 82, i + 1, { maat: 11, klasse: 'stil' })}`; });
  uit += tekst(26, 82, 'begin', { maat: 10, klasse: 'stil' });
  [['lila', 'linksaf'], ['groen', 'rechtdoor'], ['rood', 'rechtsaf']].forEach(([k, t], i) => {
    uit += `<circle cx="${60 + i * 100}" cy="114" r="8" class="tw-kraal-${k}"/>${tekst(74 + i * 100, 118, t, { maat: 11, anker: 'start' })}`;
  });
  return svg(340, 130, 'Kralentocht: een touw met een lus als begin en vier kralen: rood, groen, lila, rood. Sleutel: lila linksaf, groen rechtdoor, rood rechtsaf', uit);
}

/** A knot on a rope at x: a halve steek, an achtknoop or a paalsteek (with its fixed loop hanging down). */
function knoop(x, y, soort) {
  if (soort === 'halve steek') return `<ellipse cx="${x}" cy="${y}" rx="7" ry="8" class="tw-touw-knoop"/><path d="M${x - 5} ${y - 5}l10 10" class="tw-touw-lijn"/>`;
  if (soort === 'achtknoop') return `<ellipse cx="${x - 6}" cy="${y}" rx="7" ry="7.5" class="tw-touw-knoop"/><ellipse cx="${x + 6}" cy="${y}" rx="7" ry="7.5" class="tw-touw-knoop"/><path d="M${x - 10} ${y + 5}L${x + 10} ${y - 5}" class="tw-touw-lijn"/>`;
  return `<path d="M${x - 5} ${y + 4}q-8 26 5 26t5 -26" class="tw-touw"/><ellipse cx="${x}" cy="${y}" rx="8" ry="8" class="tw-touw-knoop"/>`;
}

function knopenroute() {
  const knopen = ['achtknoop', 'halve steek', 'paalsteek', 'achtknoop'];
  let uit = '<path d="M14 44a12 12 0 1 1 24 0H336" class="tw-touw"/>';
  knopen.forEach((k, i) => { uit += knoop(84 + i * 64, 44, k) + tekst(84 + i * 64, 90, i + 1, { maat: 11, klasse: 'stil' }); });
  uit += tekst(26, 76, 'begin', { maat: 10, klasse: 'stil' });
  [['paalsteek', 'linksaf'], ['halve steek', 'rechtdoor'], ['achtknoop', 'rechtsaf']].forEach(([k, t], i) => {
    uit += knoop(40 + i * 108, 116, k) + tekst(56 + i * 108, 120, t, { maat: 11, anker: 'start' });
  });
  return svg(350, 150, 'Knopenroute: een touw met een lus als begin en vier knopen: achtknoop, halve steek, paalsteek, achtknoop. Sleutel: paalsteek linksaf, halve steek rechtdoor, achtknoop rechtsaf', uit);
}

function breukenroute() {
  let uit = kruispunt(110, 110, 80, [270, 0, 90], 90, { pen: true });
  [[270, '1'], [0, '2'], [90, '3'], [180, '4']].forEach(([g, n]) => {
    const [x, y] = pol(110, 110, 96, g);
    uit += `<circle cx="${x}" cy="${y}" r="11" class="vlak"/><circle cx="${x}" cy="${y}" r="11" class="lijn dun"/>${tekst(x, y + 4, n, { maat: 12, klasse: 'vet' })}`;
  });
  uit += '<path d="M60 150a60 60 0 0 1 4 -78" class="tw-blauw" stroke-width="1.6"/>' + pijl(58, 96, 64, 72, { klasse: 'tw-blauw', punt: 7 });
  uit += tekst(290, 70, '3/4', { maat: 28, klasse: 'vet' }) + tekst(290, 92, '4 wegen, de 3e', { maat: 10, klasse: 'stil' }) + tekst(290, 104, 'met de klok mee', { maat: 10, klasse: 'stil' });
  uit += tekst(290, 150, 'de hele route:', { maat: 10, klasse: 'stil' }) + tekst(290, 172, '3/4 · 1/3 · 1/3 · 2/3', { maat: 14, klasse: 'vet' });
  return svg(370, 220, 'Breukenroute: op kruispunt 1 zijn er vier wegen, met de klok mee geteld, te beginnen na de weg waar je vandaan komt. 3/4 is de derde: rechtsaf', uit);
}

/** An analog clock at (cx, cy), turned by `draai` degrees. */
function klok(cx, cy, R, uur, min, draai = 0) {
  const ug = (uur % 12) * 30 + min * 0.5; const mg = min * 6;
  let uit = `<circle cx="0" cy="0" r="${R}" class="vlak"/><circle cx="0" cy="0" r="${R}" class="lijn"/>`;
  for (let i = 0; i < 12; i++) { const [x1, y1] = pol(0, 0, R - 2, i * 30); const [x2, y2] = pol(0, 0, R - (i % 3 ? 6 : 10), i * 30); uit += `<path d="M${x1} ${y1}L${x2} ${y2}" class="lijn${i % 3 ? ' dun' : ''}"/>`; }
  const [ux, uy] = pol(0, 0, R * 0.5, ug); const [mx, my] = pol(0, 0, R * 0.82, mg);
  uit += `<path d="M0 0L${ux} ${uy}" class="tw-pen dik"/><path d="M0 0L${mx} ${my}" class="tw-blauw"/><circle r="3.5" class="telefoon"/>`;
  return `<g transform="translate(${cx} ${cy}) rotate(${draai})">${uit}</g>`;
}

function tijdenroute() {
  let uit = klok(80, 92, 56, 6, 49) + tekst(80, 170, '06:49', { maat: 18, klasse: 'vet' });
  uit += pijl(150, 92, 196, 92, { klasse: 'tw-pen dun', punt: 8 }) + tekst(173, 82, 'draai', { maat: 10, klasse: 'stil' });
  uit += klok(270, 92, 56, 6, 49, -204.5) + noordpijl(338, 70, 0, 30);
  uit += tekst(270, 170, 'kleine wijzer op noord:', { maat: 10, klasse: 'stil' }) + tekst(270, 184, 'de grote wijst naar het oosten', { maat: 10, klasse: 'stil' });
  return svg(350, 192, 'Tijdenroute: de tijd 06:49 op een klok. Draai de klok tot de kleine wijzer naar het noorden wijst; de grote wijzer wijst dan naar het oosten, ongeveer 90 graden', uit);
}

/** The example of the compass routes: four legs, degrees and metres. */
const BENEN = [[40, 300], [110, 450], [200, 250], [300, 350]];
const PX_PER_100M = 20;

function schaalstok(x, y) {
  return `<path d="M${x} ${y}h${PX_PER_100M * 2}M${x} ${y - 4}v8M${x + PX_PER_100M} ${y - 3}v6M${x + PX_PER_100M * 2} ${y - 4}v8" class="lijn"/>${tekst(x + PX_PER_100M, y + 14, '200 m', { maat: 9.5 })}`;
}

function helikopterroute() {
  const c = [170, 120];
  let uit = noordpijl(c[0], c[1] - 46, 0, 92, { dubbel: false });
  BENEN.forEach(([g, m], i) => {
    const [x, y] = pol(c[0], c[1], (m / 100) * PX_PER_100M, g);
    uit += pijl(c[0], c[1], x, y, { klasse: 'tw-pen', punt: 9 });
    const [tx, ty] = pol(c[0], c[1], (m / 100) * PX_PER_100M + 13, g);
    uit += tekst(tx, ty + 4, i + 1, { maat: 13, klasse: 'vet' });
  });
  uit += `<circle cx="${c[0]}" cy="${c[1]}" r="4" class="telefoon"/>` + schaalstok(16, 220);
  return svg(340, 236, 'Helikopterroute: vanuit één punt een dikke noordpijl en vier genummerde pijlen. 1 op 40 graden, 2 op 110, 3 op 200, 4 op 300 graden; hoe langer de pijl, hoe verder', uit);
}

function vectorroute() {
  let uit = tekst(4, 14, 'vaste noordpijl', { maat: 11, anker: 'start', klasse: 'stil' });
  uit += noordpijl(85, 52, 0, 32, { dubbel: true }) + '<path d="M85 70V226" class="tw-pen dun"/>';
  BENEN.forEach(([g, m], i) => {
    const y = 84 + i * 40;
    const [x2, y2] = pol(85, y, (m / 100) * PX_PER_100M * 0.6, g);
    uit += pijl(85, y, x2, y2, { klasse: 'tw-pen', punt: 8 }) + `<circle cx="85" cy="${y}" r="3" class="telefoon"/>`;
    uit += tekst(85 + (g > 180 ? 16 : -16), y + 4, i + 1, { maat: 11, klasse: 'stil' });
  });
  uit += tekst(356, 14, 'draaiende noordpijl', { maat: 11, anker: 'end', klasse: 'stil' });
  const draai = [-30, 70, 160, -110];
  BENEN.forEach(([g], i) => {
    const cx = 220 + (i % 2) * 90; const cy = 70 + Math.floor(i / 2) * 100;
    const [nx, ny] = pol(cx, cy, 22, draai[i]);
    uit += noordpijl(nx, ny, draai[i], 44, { dubbel: true, letter: false });
    const [x2, y2] = pol(cx, cy, 30, draai[i] + g);
    uit += pijl(cx, cy, x2, y2, { klasse: 'tw-blauw', punt: 8 }) + `<circle cx="${cx}" cy="${cy}" r="4" class="telefoon"/>`;
    uit += tekst(cx - 34, cy - 30, i + 1, { maat: 12, klasse: 'vet' });
  });
  return svg(360, 240, 'Vectorroute in twee vormen. Links een lijn met vier pijlen en bovenaan een dubbele noordpijl; de pijl het dichtst bij de noordpijl is de eerste. Rechts vier tekens met elk een eigen, gedraaide noordpijl en een looppijl', uit);
}

/** A bolletjesroute token: a dot with a stick to N, O, Z or W. */
function bolletje(cx, cy, richting) {
  const g = { N: 0, O: 90, Z: 180, W: 270 }[richting];
  const [x, y] = pol(cx, cy, 12, g);
  return `<path d="M${cx} ${cy}L${x} ${y}" class="tw-pen"/><circle cx="${cx}" cy="${cy}" r="4.5" class="telefoon"/>`;
}
/** A stack of tokens, read from the bottom up. */
const stapel = (cx, onder, richtingen) => richtingen.map((rr, i) => bolletje(cx, onder - i * 30, rr)).join('');

function bolletjesroute() {
  let uit = tekst(10, 16, 'de tekens', { maat: 10, anker: 'start', klasse: 'stil' });
  ['N', 'O', 'Z', 'W'].forEach((rr, i) => { uit += bolletje(30 + i * 44, 50, rr) + tekst(30 + i * 44, 82, rr, { maat: 12, klasse: 'vet' }); });
  uit += '<path d="M190 10V180" class="lijn haar"/>' + tekst(204, 16, 'samen, van onder naar boven', { maat: 10, anker: 'start', klasse: 'stil' });
  uit += stapel(225, 130, ['Z', 'O']) + tekst(225, 162, 'ZO', { maat: 12, klasse: 'vet' });
  uit += stapel(290, 140, ['N', 'N', 'W']) + tekst(290, 162, 'NNW', { maat: 12, klasse: 'vet' });
  uit += pijl(330, 150, 330, 40, { klasse: 'tw-pen dun', punt: 7 });
  return svg(350, 180, 'Bolletjesroute: een bolletje met een streepje naar boven is noord, naar rechts oost, naar onder zuid, naar links west. Gestapeld en van onder naar boven gelezen: zuid en dan oost is ZO; noord, noord, west is NNW', uit);
}

function bolletjeWindrichting() {
  let uit = tekst(6, 14, 'rondje = kompasroos, boven is noord', { maat: 10, anker: 'start', klasse: 'stil' });
  VOORBEELD.forEach(({ keuze }, i) => {
    const cx = 48 + i * 86; const cy = 62;
    uit += `<circle cx="${cx}" cy="${cy}" r="22" class="lijn"/><path d="M${cx} ${cy - 22}v-6" class="lijn"/>${tekst(cx, cy - 32, 'N', { maat: 9, klasse: 'stil' })}`;
    const [x, y] = pol(cx, cy, 22, keuze); const [x2, y2] = pol(cx, cy, 38, keuze);
    uit += pijl(x, y, x2, y2, { klasse: 'tw-pen', punt: 8 }) + `<circle cx="${cx}" cy="${cy}" r="4" class="telefoon"/>` + tekst(cx, 106, i + 1, { maat: 11, klasse: 'stil' });
  });
  uit += '<path d="M0 120H350" class="lijn haar"/>' + tekst(6, 138, 'met bolletjes en streepjes', { maat: 10, anker: 'start', klasse: 'stil' });
  uit += bolletje(40, 180, 'N') + bolletje(76, 180, 'O') + pijl(30, 204, 90, 204, { klasse: 'tw-pen dun', punt: 7 });
  uit += '<path d="M120 170v20M136 170v20M152 170v20" class="tw-pen"/>';
  uit += tekst(180, 178, 'noordoost (N + O),', { maat: 11, anker: 'start' }) + tekst(180, 194, 'tot de 3e kruising', { maat: 11, anker: 'start' });
  return svg(350, 216, 'Bolletje-pijltje met windrichting in twee vormen. Boven: rondjes als kompasroos met een pijl, 1 en 2 oost, 3 noord, 4 noordoost. Onder: bolletjes met een stokje, N en dan O, gelezen in de richting van het pijltje, dus noordoost, en drie streepjes: houd die richting tot de derde kruising', uit);
}

function kruispuntenPijltjes() {
  let uit = '';
  VOORBEELD.forEach(({ koers, wegen, keuze }, i) => {
    const cx = 45 + i * 90; const cy = 60; const draai = i === 2 ? 90 : 0;
    let k = '';
    for (const g of [180, ...wegen.map((w) => rel(w, koers))]) { const [x, y] = pol(0, 0, 30, g); k += `<path d="M0 0L${x} ${y}" class="tw-pen dun"/>`; }
    const [bx, by] = pol(0, 0, 30, 180); const [px, py] = pol(0, 0, 30, rel(keuze, koers)); const [qx, qy] = pol(0, 0, 18, rel(keuze, koers));
    k += `<circle cx="${bx}" cy="${by}" r="4.5" class="telefoon"/>${pijl(qx, qy, px, py, { klasse: 'tw-pen', punt: 9 })}`;
    uit += `<g transform="translate(${cx} ${cy}) rotate(${draai})">${k}</g>` + tekst(cx, 116, i + 1, { maat: 11, klasse: 'stil' });
  });
  return svg(360, 124, 'Kruispunten-pijltjesroute: elk kruispunt in dunne lijnen, een bolletje op de weg waar je vandaan komt en een pijlpunt op de weg die je neemt. Kruispunt 3 staat gedraaid', uit);
}

function hierogliefen() {
  let uit = noordpijl(24, 58, 0, 40);
  uit += bolletje(62, 70, 'O') + strip(110, 110, 20, [{ rechts: 1 }, { links: 1 }, { rechts: 1 }], { lengte: 12, nummers: false });
  uit += stapel(170, 90, ['Z', 'W']) + strip(220, 110, 14, [{ links: 1 }, { rechts: 1 }, { rechts: 1 }, { links: 1 }], { lengte: 12, nummers: false });
  uit += '<path d="M268 92L290 52L312 92Z" class="lijn"/>' + tekst(290, 86, '1', { maat: 16, klasse: 'vet' });
  uit += tekst(85, 132, 'oost, 3 kruispunten', { maat: 10, klasse: 'stil' }) + tekst(195, 132, 'zuidwest, 4', { maat: 10, klasse: 'stil' }) + tekst(290, 132, 'aanwijzing 1', { maat: 10, klasse: 'stil' });
  return svg(330, 140, 'Hiërogliefenroute: een noordpijl; het bolletje-teken voor oost met drie streepjes: oostwaarts tot na het derde kruispunt; dan de tekens voor zuidwest met vier streepjes; dan een driehoek met 1: lees aanwijzing 1', uit);
}

function quizroute() {
  let uit = kruispunt(90, 110, 70, [270, 0, 90], 0, { pen: false });
  [[270, 'A'], [0, 'B'], [90, 'C']].forEach(([g, l]) => { const [x, y] = pol(90, 110, 84, g); uit += tekst(x, y + 6, l, { maat: 17, klasse: 'vet' }); });
  uit += '<path d="M90 200V110" class="tw-pen"/>';
  uit += tekst(200, 70, 'Hoeveel poten', { maat: 13, anker: 'start' }) + tekst(200, 88, 'heeft een spin?', { maat: 13, anker: 'start' });
  uit += tekst(200, 118, 'A  6', { maat: 13, anker: 'start' }) + tekst(200, 136, 'B  8', { maat: 13, anker: 'start' }) + tekst(200, 154, 'C  10', { maat: 13, anker: 'start' });
  return svg(320, 200, 'Kruispunten-quizroute: een kruispunt met de wegen A links, B rechtdoor en C rechts, en de vraag hoeveel poten een spin heeft. Het goede antwoord is B: rechtdoor', uit);
}

function aangezichtsstripkaart() {
  let uit = '<rect x="0" y="0" width="240" height="300" rx="10" class="vlak2"/><path d="M120 292V14" class="tw-weg"/>';
  uit += '<path d="M120 236L30 200M120 236L36 262" class="tw-weg smal"/><path d="M120 178H226" class="tw-weg smal"/><path d="M120 120H226" class="tw-pad"/><path d="M120 62L30 30" class="tw-weg smal"/>';
  uit += '<path d="M150 198h26v22h-26z" class="tw-huis"/><path d="M146 199L163 186L180 199Z" class="tw-huis"/>';
  for (const [x, y] of [[60, 150], [80, 110], [56, 90], [180, 40], [200, 66], [190, 250]]) uit += `<circle cx="${x}" cy="${y}" r="11" class="tw-boom"/>`;
  uit += '<path d="M150 150q10 -6 20 0t20 0" class="tw-water-lijn"/>' + '<circle cx="120" cy="290" r="6" class="telefoon"/>';
  return svg(240, 300, 'Aangezichtsstripkaart: de route loopt recht omhoog; de zijwegen staan als echte wegen getekend, met een huis, bomen en een beekje erbij', uit);
}

function vliegkoers() {
  const uit = strip(170, 220, 20, [{ links: 1, rechts: 1, tekstL: '320°', tekstR: '50 m' }, { links: 1, rechts: 1, tekstL: '175°', tekstR: '85 m' }, { links: 1, rechts: 1, tekstL: '60°', tekstR: '30 m' }], { nummers: false, lengte: 22 });
  return svg(340, 232, 'Vliegkoers: van onder naar boven. Eerst 320 graden, 50 meter; dan 175 graden, 85 meter; dan 60 graden, 30 meter, en dan de eindstreep', uit);
}

function stroomschema() {
  const blok = (x, y, w, t, rond = false) => `<rect x="${x - w / 2}" y="${y - 14}" width="${w}" height="28" rx="${rond ? 14 : 4}" class="vlak"/><rect x="${x - w / 2}" y="${y - 14}" width="${w}" height="28" rx="${rond ? 14 : 4}" class="lijn"/>${tekst(x, y + 4, t, { maat: 11 })}`;
  const ruit = (x, y, t) => `<path d="M${x} ${y - 26}L${x + 80} ${y}L${x} ${y + 26}L${x - 80} ${y}Z" class="vlak"/><path d="M${x} ${y - 26}L${x + 80} ${y}L${x} ${y + 26}L${x - 80} ${y}Z" class="lijn"/>${tekst(x, y + 4, t, { maat: 11 })}`;
  const pl = (x1, y1, x2, y2) => pijl(x1, y1, x2, y2, { klasse: 'tw-pen dun', punt: 7 });
  let uit = blok(110, 20, 140, 'start: loop het pad op', true) + pl(110, 34, 110, 58);
  uit += ruit(110, 86, 'zie je een kerktoren?') + pl(190, 86, 236, 86) + tekst(212, 80, 'ja', { maat: 10, klasse: 'stil' });
  uit += blok(290, 86, 108, 'loop erheen') + pl(110, 112, 110, 140) + tekst(118, 128, 'nee', { maat: 10, anker: 'start', klasse: 'stil' });
  uit += ruit(110, 168, 'staat er een bankje?') + pl(190, 168, 236, 168) + tekst(212, 162, 'ja', { maat: 10, klasse: 'stil' });
  uit += blok(290, 168, 108, 'linksaf') + pl(110, 194, 110, 222) + tekst(118, 210, 'nee', { maat: 10, anker: 'start', klasse: 'stil' });
  uit += blok(110, 236, 140, 'rechtsaf');
  return svg(350, 254, 'Stroomschema: start. Zie je een kerktoren? Ja: loop erheen. Nee: staat er een bankje? Ja: linksaf. Nee: rechtsaf', uit);
}

function metrokaart() {
  let uit = '<path d="M20 60H200L260 120V200" class="tw-metro-a"/><path d="M80 210V140L140 80H330" class="tw-metro-b"/><path d="M20 160H330" class="tw-metro-c"/>';
  // [x, y, name, start or end, where the label goes: 'r' right above (default), 'l' left above, 'o' left below]
  const stations = [[20, 60, 'Kerk', true], [110, 60, 'Molen'], [200, 60, 'Brug'], [260, 160, 'Ven', false, 'o'], [260, 200, 'Hek'], [80, 160, 'Boom'], [80, 210, 'Bank'], [140, 80, 'Toren'], [330, 80, 'Veer', false, 'l'], [20, 160, 'Hut'], [330, 160, 'Kamp', true, 'l']];
  for (const [x, y, n, rol, plek = 'r'] of stations) {
    uit += `<circle cx="${x}" cy="${y}" r="${rol ? 8 : 6}" class="tw-station"/>`;
    uit += tekst(x + (plek === 'r' ? 10 : -10), y + (plek === 'o' ? 20 : -10), n, { maat: 11, anker: plek === 'r' ? 'start' : 'end', klasse: rol ? 'vet' : '' });
  }
  return svg(350, 230, 'Metrokaart: drie lijnen in rood, blauw en groen met stations als kruispunten. Begin bij Kerk, eindig bij Kamp; de kaart klopt niet op schaal', uit);
}

/** A small map with roads and paths, for oleaat, blinde vlek, hoofdpijnkaart and vlieglijn. */
const KAARTJE_WEGEN = ['M10 40H290', 'M10 150H290', 'M60 10V190', 'M180 10V190', 'M60 95H180', 'M180 95L290 70', 'M120 150V190', 'M250 40V150'];
const KAARTJE_PADEN = ['M120 40V95', 'M60 150L20 190', 'M180 150L250 110'];
const KAARTJE_ROUTE = 'M60 190V95H180V40H250V150';
function kaartje(x, y, { route = true, vlak = true } = {}) {
  let uit = `<g transform="translate(${x} ${y})">`;
  if (vlak) uit += '<rect x="0" y="0" width="300" height="200" rx="6" class="tw-paneel"/><path d="M200 108h40v36h-40z" class="tw-bos"/><path d="M76 108h90v36h-90z" class="tw-bos"/><path d="M196 52q30 -6 44 10t-10 30q-30 6 -36 -12z" class="tw-water"/>';
  uit += KAARTJE_WEGEN.map((d) => `<path d="${d}" class="tw-weg smal"/>`).join('') + KAARTJE_PADEN.map((d) => `<path d="${d}" class="tw-pad"/>`).join('');
  if (route) uit += `<path d="${KAARTJE_ROUTE}" class="tw-route"/><circle cx="60" cy="190" r="5" class="rood"/>`;
  return `${uit}</g>`;
}

function oleaat() {
  let uit = kaartje(0, 25, { route: false }) + tekst(150, 16, 'de kaart', { maat: 15, klasse: 'stil' });
  uit += '<g transform="translate(330 22) rotate(6)"><rect x="0" y="0" width="208" height="182" rx="4" class="tw-vel"/>';
  uit += '<path d="M8 168V73H128V18H198V128" class="tw-route"/><circle cx="8" cy="168" r="4.5" class="rood"/>';
  uit += `${noordpijl(160, 150, 0, 40)}</g>` + tekst(434, 16, 'de oleaat', { maat: 15, klasse: 'stil' });
  return svg(560, 236, 'Oleaat: links een kaart zonder route, rechts een doorzichtig vel met alleen de route en een noordpijl. Leg het vel op de kaart tot de lijn precies over de wegen valt', uit);
}

function blindeVlek() {
  const uit = kaartje(0, 0) + '<path d="M150 70q10 -30 40 -20q20 -20 46 0q30 -4 30 24q24 14 4 36q4 26 -26 26q-16 20 -40 4q-30 10 -38 -14q-30 -6 -16 -32q-14 -20 0 -24z" class="tw-wolk"/>';
  return svg(300, 200, 'Blinde vlek: een kaart met de route, waarop een wolk een deel van de wegen bedekt. Onder de wolk moet je zelf bedenken hoe de wegen lopen', uit);
}

function hoofdpijnkaart() {
  const uit = `<rect x="0" y="0" width="320" height="220" rx="6" class="tw-paneel"/>${kaartje(10, 10, { route: false, vlak: false })}<g class="tw-geest" transform="translate(24 20) rotate(4 150 100)">${kaartje(0, 0, { route: false, vlak: false })}</g>`;
  return svg(320, 220, 'Hoofdpijnkaart: dezelfde kaart twee keer over elkaar gedrukt, een beetje verschoven en gedraaid. Zoek welke wegen echt zijn', uit);
}

function vlieglijn() {
  let uit = kaartje(0, 0, { route: false }) + '<path d="M40 180L262 24" class="tw-route" stroke-dasharray="10 6"/>';
  uit += '<circle cx="40" cy="180" r="6" class="rood"/><circle cx="262" cy="24" r="6" class="rood"/>' + tekst(28, 172, 'A', { maat: 13, klasse: 'vet' }) + tekst(276, 22, 'B', { maat: 13, klasse: 'vet' }) + noordpijl(280, 160, 0, 36);
  return svg(300, 200, 'Vlieglijn: een rechte lijn van A naar B over de kaart. Je zoekt zelf de paden die er zo dicht mogelijk bij blijven', uit);
}

/** A piece of RD grid, 3 by 2 km, for the coordinate routes. */
function rooster(x0, y0, km = 80) {
  let uit = `<rect x="${x0}" y="${y0}" width="${km * 3}" height="${km * 2}" class="tw-paneel"/>`;
  for (let i = 0; i <= 3; i++) uit += `<path d="M${x0 + i * km} ${y0}v${km * 2}" class="lijn dun"/>${tekst(x0 + i * km, y0 + km * 2 + 14, 112 + i, { maat: 10 })}`;
  for (let j = 0; j <= 2; j++) uit += `<path d="M${x0} ${y0 + j * km}h${km * 3}" class="lijn dun"/>${tekst(x0 - 6, y0 + (2 - j) * km + 4, 398 + j, { maat: 10, anker: 'end' })}`;
  return uit;
}
const rd = (x0, y0, km, x, y) => [r1(x0 + (x - 112) * km), r1(y0 + (400 - y) * km)];

function coordinatenroute() {
  const x0 = 40; const y0 = 10; const km = 80;
  let uit = rooster(x0, y0, km);
  const punten = [['A', 112.30, 398.25], ['B', 113.52, 398.64], ['C', 114.40, 399.70]];
  const p = punten.map(([n, x, y]) => [n, ...rd(x0, y0, km, x, y)]);
  uit += `<path d="M${p.map(([, x, y]) => `${x} ${y}`).join('L')}" class="tw-route" stroke-dasharray="7 5"/>`;
  const [bx, by] = rd(x0, y0, km, 113, 398);
  uit += `<path d="M${bx} ${by}H${p[1][1]}V${p[1][2]}" class="tw-blauw" stroke-width="2"/>`;
  uit += tekst(bx + 11, by + 14, 'huisje in', { maat: 11, anker: 'start', klasse: 'blauw-tekst vet' }) + regels(p[1][1] + 4, r1((by + p[1][2]) / 2) - 2, 'trapje|op', { maat: 11, anker: 'start', klasse: 'blauw-tekst vet' });
  uit += p.map(([n, x, y]) => `<circle cx="${x}" cy="${y}" r="5" class="rood"/>${tekst(x - 8, y - 7, n, { maat: 12, anker: 'end', klasse: 'vet' })}`).join('');
  uit += ['A  112.30 – 398.25', 'B  113.52 – 398.64', 'C  114.40 – 399.70'].map((r, i) => tekst(x0, 210 + i * 16, r, { maat: 12, anker: 'start' })).join('');
  return svg(300, 252, 'Coördinatenroute: een stuk RD-raster met de lijnen 112 tot 115 en 398 tot 400. A, B en C zijn coördinaten; bij B staat hoe je hem vindt: eerst naar rechts langs lijn 398 tot 52, dan omhoog tot 64', uit);
}

function kruispeiling() {
  const x0 = 40; const y0 = 10; const km = 80;
  let uit = rooster(x0, y0, km);
  const pt = { w: [112.20, 398.40], x: [114.60, 399.60], y: [112.50, 399.80], z: [114.20, 398.20] };
  const p = Object.fromEntries(Object.entries(pt).map(([k, [x, y]]) => [k, rd(x0, y0, km, x, y)]));
  uit += `<path d="M${p.w.join(' ')}L${p.x.join(' ')}M${p.y.join(' ')}L${p.z.join(' ')}" class="tw-blauw" stroke-width="2"/>`;
  // where the two lines cross
  const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = [p.w, p.x, p.y, p.z];
  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
  const sx = r1(x1 + t * (x2 - x1)); const sy = r1(y1 + t * (y2 - y1));
  uit += Object.entries(p).map(([k, [x, y]]) => `<circle cx="${x}" cy="${y}" r="4" class="telefoon"/>${tekst(x + 8, y - 6, k, { maat: 12, anker: 'start', klasse: 'vet' })}`).join('');
  uit += `<circle cx="${sx}" cy="${sy}" r="9" class="tw-route"/><circle cx="${sx}" cy="${sy}" r="3" class="rood"/>`;
  uit += tekst(8, 212, 'Trek w–x en y–z. Waar ze elkaar snijden,', { maat: 12, anker: 'start' }) + tekst(8, 228, 'ligt de post.', { maat: 12, anker: 'start' });
  return svg(300, 236, 'Kruispeiling met vier coördinaten: de lijn van w naar x en de lijn van y naar z snijden elkaar; daar ligt de volgende post', uit);
}

function passerroute() {
  let uit = kaartje(0, 0, { route: false });
  const doel = [205, 118];
  const punten = [[60, 40, 'A'], [290, 60], [120, 190]].map(([x, y, n], i) => [x, y, n ?? 'BC'[i - 1], r1(Math.hypot(x - doel[0], y - doel[1]))]);
  for (const [x, y, n, rr] of punten) {
    uit += `<circle cx="${x}" cy="${y}" r="${rr}" class="tw-cirkel"/><circle cx="${x}" cy="${y}" r="4.5" class="telefoon"/>`;
    // 80 px is 500 m
    uit += tekst(x + 8, y - 6, `${n} ${Math.round((rr * 6.25) / 10) * 10} m`, { maat: 11, anker: x > 250 ? 'end' : 'start', klasse: 'vet' });
  }
  uit += `<circle cx="${doel[0]}" cy="${doel[1]}" r="8" class="tw-route"/>`;
  uit += '<path d="M204 190h80M204 185v10M244 187v6M284 185v10" class="lijn"/>' + tekst(244, 182, '500 m', { maat: 10 });
  return svg(300, 200, 'Passerroute: drie punten op de kaart, elk met een afstand in meters, en een schaalstok. De cirkels met die straal snijden elkaar in één punt: de volgende post', uit);
}

// -- rally: a grid of roads, 4 × 3 crossings
const RX = [40, 120, 200, 280]; const RY = [40, 110, 180];
function rallyWegen({ onverhard = [], gat = null } = {}) {
  let uit = '<rect x="0" y="0" width="320" height="220" rx="6" class="tw-paneel"/>';
  // gat = [y, x1, x2]: that stretch of road y is missing
  for (const y of RY) uit += gat?.[0] === y ? `<path d="M20 ${y}H${gat[1]}M${gat[2]} ${y}H300" class="tw-weg smal"/>` : `<path d="M20 ${y}H300" class="tw-weg smal"/>`;
  for (const x of RX) uit += `<path d="M${x} 20V200" class="tw-weg smal"/>`;
  return uit + onverhard.map((d) => `<path d="${d}" class="tw-pad"/>`).join('');
}

function rallyPijlenPunten() {
  let uit = rallyWegen();
  uit += '<path d="M40 200V110H200V40H280V180H200" class="tw-route"/>';
  uit += '<circle cx="80" cy="110" r="5" class="telefoon"/>' + tekst(80, 100, '1', { maat: 12, klasse: 'vet' });
  uit += pijl(230, 40, 262, 40, { klasse: 'tw-pen', punt: 9 }) + tekst(246, 30, '2', { maat: 12, klasse: 'vet' });
  uit += '<circle cx="240" cy="180" r="5" class="telefoon"/>' + tekst(240, 198, '3', { maat: 12, klasse: 'vet' });
  uit += tekst(40, 214, 'start', { maat: 10, klasse: 'stil' });
  return svg(320, 220, 'Pijlen en punten: punt 1, pijl 2 en punt 3 in volgorde, steeds de kortste weg. De pijl rijd je helemaal en in zijn richting', uit);
}

function rallyIngetekendeLijn() {
  const uit = rallyWegen({ onverhard: ['M120 110L200 180'] }) + '<path d="M40 200V110H120L200 180H280V40" class="tw-route"/>' + tekst(40, 214, 'start', { maat: 10, klasse: 'stil' });
  return svg(320, 220, 'Ingetekende lijn: de route staat als lijn op de kaart; rijd precies die wegen, ook het onverharde stuk', uit);
}

function rallyGrens() {
  let uit = rallyWegen();
  uit += '<path d="M14 184L110 100L190 30L216 6" class="tw-grens"/>' + tekst(30, 150, 'grens', { maat: 11, klasse: 'vet' });
  uit += '<path d="M40 200V180H120V110H200V40H280V20" class="tw-route"/>';
  return svg(320, 220, 'Grensbenadering: rijd zo dicht mogelijk langs de paarse grenslijn zonder eroverheen te gaan, zodat het stuk tussen route en grens zo klein mogelijk blijft', uit);
}

function rallyBarricades() {
  // no road along the top between 120 and 200, so there is one shortest way round the barricade
  let uit = rallyWegen({ gat: [40, 120, 200] });
  uit += '<path d="M40 200V110H280V40" class="tw-pen" stroke-dasharray="6 5"/>';
  uit += '<path d="M160 100v20" class="tw-pen dik"/>' + tekst(160, 94, '1', { maat: 12, klasse: 'vet' });
  uit += '<path d="M40 200V110H120V180H200V110H280V40" class="tw-route"/>';
  return svg(320, 220, 'Ingetekende lijn met een barricade: de gestippelde lijn is de route, het dikke streepje 1 is afgesloten. De rode route rijdt er zo kort mogelijk omheen en gaat dan verder over de lijn', uit);
}

function rallyBolPijl() {
  const kop = ['nr', 'totaal', 'tussen', 'situatie'];
  let uit = kop.map((k, i) => tekst([20, 70, 130, 230][i], 16, k, { maat: 10, klasse: 'vet' })).join('') + '<path d="M0 24H300" class="lijn dun"/>';
  const rijen = [
    ['1', '0,40', '0,40', '<path d="M0 30V-30M0 0H30" class="tw-pen dun"/>', [[0, 26], [0, 0], [26, 0]]],
    ['2', '1,15', '0,75', '<path d="M0 30V-30M0 -4H22" class="tw-pen dun"/><path d="M0 0L-26 -14" class="tw-pen dun" stroke-dasharray="4 3"/><rect x="20" y="-8" width="8" height="8" class="tw-blok"/>', [[0, 26], [0, -26]]],
    ['3', '1,90', '0,75', '<path d="M0 30V0L-28 -12M0 0L22 -22" class="tw-pen dun"/>', [[0, 26], [0, 0], [20, -20]]],
  ];
  rijen.forEach(([nr, tot, tus, wegen, route], i) => {
    const y = 64 + i * 70;
    uit += tekst(20, y + 4, nr, { maat: 12, klasse: 'vet' }) + tekst(70, y + 4, tot, { maat: 11 }) + tekst(130, y + 4, tus, { maat: 11 });
    const [a, b] = route.slice(-2);
    uit += `<g transform="translate(230 ${y})">${wegen}<path d="M${route.slice(0, -1).map((q) => q.join(' ')).join('L')}" class="tw-pen"/>`
      + `${pijl(a[0], a[1], b[0], b[1], { klasse: 'tw-pen', punt: 9 })}<circle cx="${route[0][0]}" cy="${route[0][1]}" r="4.5" class="telefoon"/></g>`;
    uit += `<path d="M0 ${y + 34}H300" class="lijn haar"/>`;
  });
  return svg(300, 270, 'Bol-pijl met afstanden: per situatie het nummer, de afstand vanaf de vorige tijdcontrole en vanaf de vorige situatie in kilometers, en de tekening van de bol naar de punt van de pijl. Doorgetrokken is verhard, gestippeld onverhard; een weg met een blokje mag je niet in', uit);
}

// -- trails and signs
function lintjesroute() {
  let uit = '<rect x="0" y="0" width="300" height="200" rx="8" class="vlak2"/>' + kruispunt(150, 110, 100, [300, 40], 40, { pen: false });
  const boom = (x, y, lint) => `<rect x="${x - 4}" y="${y - 6}" width="8" height="30" class="tw-stam"/><circle cx="${x}" cy="${y - 16}" r="18" class="tw-kroon"/>${lint ? `<path d="M${x - 4} ${y + 4}h8v5h-8zM${x + 3} ${y + 7}l9 10l-4 2l-6 -8" class="tw-lint"/>` : ''}`;
  uit += boom(232, 60, true) + boom(70, 52, false) + boom(110, 170, false) + boom(220, 160, false);
  uit += tekst(254, 98, 'lintje!', { maat: 11, klasse: 'vet', anker: 'start' });
  return svg(300, 200, 'Lintjesroute: op een splitsing hangt een rood lintje aan een boom langs de weg rechts. Die weg moet je hebben', uit);
}

function steenman() {
  let uit = '<path d="M10 180H190" class="lijn stil"/>';
  const stenen = [[100, 168, 50, 13], [96, 145, 40, 11], [104, 124, 32, 10], [98, 105, 25, 9], [101, 88, 18, 8], [99, 73, 11, 7]];
  for (const [x, y, rx, ry] of stenen) uit += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" class="tw-steen"/>`;
  return svg(200, 190, 'Een steenman: een stapel stenen, breed onderaan en smal bovenaan, langs een pad', uit);
}

function overzicht() {
  let uit = voorbeeldKaart(0, 0, 0.7);
  uit += tekst(222, 14, 'bolletje-pijltje', { maat: 10, anker: 'start', klasse: 'stil' });
  VOORBEELD.forEach(({ koers, wegen, keuze }, i) => { uit += bolletjePijltje(236 + i * 34, 50, rel(keuze, koers), wegen.filter((g) => g !== keuze).map((g) => rel(g, koers)), 18); });
  uit += tekst(222, 92, 'breuken', { maat: 10, anker: 'start', klasse: 'stil' }) + tekst(222, 112, '3/4 · 1/3 · 1/3 · 2/3', { maat: 13, anker: 'start', klasse: 'vet' });
  uit += tekst(222, 138, 'ogen', { maat: 10, anker: 'start', klasse: 'stil' });
  ['rechts', 'op', 'links', 'rechts'].forEach((k, i) => { uit += `<g transform="translate(${238 + i * 34} 160) scale(0.62)">${gezicht(0, 0, k)}</g>`; });
  uit += strip(40, 300, 156, STRIP_VOORBEELD, { lengte: 14, nummers: false }) + tekst(40, 150, 'strip', { maat: 10, klasse: 'stil' });
  uit += tekst(100, 196, 'kralen', { maat: 10, anker: 'start', klasse: 'stil' }) + '<path d="M100 220H220" class="tw-touw"/>';
  ['rood', 'groen', 'lila', 'rood'].forEach((k, i) => { uit += `<circle cx="${118 + i * 28}" cy="220" r="9" class="tw-kraal-${k}"/>`; });
  uit += tekst(240, 196, 'tijden', { maat: 10, anker: 'start', klasse: 'stil' }) + tekst(240, 216, '06:49 · 02:27', { maat: 12, anker: 'start', klasse: 'vet' }) + tekst(240, 234, '02:11 · 00:08', { maat: 12, anker: 'start', klasse: 'vet' });
  uit += tekst(100, 262, 'helikopter: 0° · 90° · 90° · 0° · 45°', { maat: 11, anker: 'start' }) + tekst(100, 282, 'beschrijving: op de kruising rechtsaf, …', { maat: 11, anker: 'start' });
  return svg(370, 306, 'Dezelfde route op de kaart en in acht notaties: bolletje-pijltje, breuken, ogen, een stripkaart, kralen, tijden, een helikopterroute en een beschrijving', uit);
}

// -- rules, compass routes and tochtvormen

/** A check mark (good) or a cross (wrong) at (x, y). */
const goed = (x, y) => `<path d="M${x - 9} ${y}l6 7l13 -15" class="tw-goed"/>`;
const fout = (x, y) => `<path d="M${x - 8} ${y - 8}l16 16M${x + 8} ${y - 8}l-16 16" class="tw-fout"/>`;
/** A tree seen from the side, at the foot (x, y). */
const zijboom = (x, y, r = 16) => `<rect x="${x - 3.5}" y="${y - 24}" width="7" height="24" class="tw-stam"/><circle cx="${x}" cy="${y - 24 - r * 0.8}" r="${r}" class="tw-kroon"/>`;
/** A walker seen from above, walking up: rucksack, shoulders, head. */
const wandelaar = (x, y) => `<rect x="${x - 8}" y="${y + 2}" width="16" height="10" rx="3" class="tw-rugzak"/><ellipse cx="${x}" cy="${y}" rx="11" ry="5" class="tw-jas"/><circle cx="${x}" cy="${y - 1}" r="4.5" class="telefoon"/>`;
/** Short text in a few lines, split at |. */
const regels = (x, y, t, opties = {}, stap = 12) => t.split('|').map((r, k) => tekst(x, y + k * stap, r, opties)).join('');

function spiegelkruispunten() {
  const spiegel = (g) => (360 - g) % 360;
  let uit = tekst(80, 16, 'in je boekje', { maat: 12, klasse: 'vet' }) + tekst(240, 16, 'in het echt', { maat: 12, klasse: 'vet' }) + tekst(160, 16, 'spiegel', { maat: 10, klasse: 'blauw-tekst' });
  [[[270, 0, 90], 90, 'linksaf', 'rechtsaf'], [[315, 45], 45, 'schuin links', 'schuin rechts']].forEach(([wegen, keuze, boek, echt], i) => {
    const cy = 82 + i * 118;
    for (const [cx, spiegelen, t] of [[80, true, `getekend: ${boek}`], [240, false, `je loopt: ${echt}`]]) {
      uit += `<rect x="${cx - 62}" y="${cy - 50}" width="124" height="110" rx="8" class="vlak2"/>`;
      uit += kruispunt(cx, cy, 38, spiegelen ? wegen.map(spiegel) : wegen, spiegelen ? spiegel(keuze) : keuze);
      uit += tekst(cx, cy + 54, t, { maat: 11 });
    }
  });
  uit += '<path d="M160 24V262" class="tw-spiegel"/>';
  return svg(320, 266, 'Spiegelkruispuntenroute: links de kruispunten zoals ze in je boekje staan, gespiegeld; rechts hoe ze echt liggen. Getekend linksaf is rechtsaf, getekend schuin links is schuin rechts', uit);
}

function wiskunderoute() {
  let uit = tekst(8, 22, 'Post 3: A.x – B.y', { maat: 14, anker: 'start', klasse: 'vet' });
  ['A = 7 × 16 + 1', 'x = 100 − 48', 'B = 400 − 2', 'y = 8 × 8'].forEach((r, i) => { uit += tekst(8, 48 + i * 19, r, { maat: 12, anker: 'start' }); });
  uit += pijl(50, 122, 50, 146, { klasse: 'tw-pen dun', punt: 7 }) + tekst(8, 166, '113.52 – 398.64', { maat: 14, anker: 'start', klasse: 'vet' });
  const x0 = 180; const y0 = 34; const km = 40;
  uit += rooster(x0, y0, km);
  const [px, py] = rd(x0, y0, km, 113.52, 398.64);
  uit += `<path d="M${rd(x0, y0, km, 113, 398).join(' ')}H${px}V${py}" class="tw-blauw" stroke-width="2"/><circle cx="${px}" cy="${py}" r="5" class="rood"/>${tekst(px + 8, py - 6, 'post 3', { maat: 11, anker: 'start', klasse: 'vet' })}`;
  return svg(310, 176, 'Wiskunderoute: post 3 staat op A.x – B.y. Reken de sommen uit: A is 113, x is 52, B is 398 en y is 64. Zo wordt het 113.52 – 398.64, en die zoek je op de kaart', uit);
}

function gradenloop() {
  const c = [140, 118]; const R = 92;
  let uit = '<rect x="0" y="0" width="300" height="236" rx="10" class="vlak2"/>';
  for (const g of [185, 25, 95, 140, 285]) { const [x, y] = pol(c[0], c[1], R, g); uit += `<path d="M${c[0]} ${c[1]}L${x} ${y}" class="tw-weg"/>`; }
  const [ax, ay] = pol(c[0], c[1], R * 0.9, 185); const [bx, by] = pol(c[0], c[1], R * 0.9, 140);
  uit += `<path d="M${ax} ${ay}L${c[0]} ${c[1]}L${bx} ${by}" class="tw-route"/>`;
  const [nx, ny] = pol(c[0], c[1], 34, 0); const [hx, hy] = pol(c[0], c[1], 34, 124);
  uit += `<path d="M${c[0]} ${c[1]}V${c[1] - 56}" class="lijn dun"/><path d="M${nx} ${ny}A34 34 0 0 1 ${hx} ${hy}" class="tw-blauw" stroke-width="1.6"/>`;
  const [kx, ky] = pol(c[0], c[1], 82, 124);
  uit += pijl(c[0], c[1], kx, ky, { klasse: 'tw-blauw', punt: 9 });
  const [lx, ly] = pol(c[0], c[1], 48, 62); uit += tekst(lx, ly + 4, '124°', { maat: 11, klasse: 'blauw-tekst vet' });
  uit += tekst(10, 22, 'Kruispunt 4: 124°', { maat: 13, anker: 'start', klasse: 'vet' }) + noordpijl(272, 44, 0, 36);
  uit += regels(196, 196, 'deze weg ligt|het dichtst bij 124°', { maat: 11, anker: 'start' });
  return svg(300, 236, 'Gradenloop: op het kruispunt zet je 124 graden op je kompas. Van de vier wegen loopt die naar het zuidoosten, op ongeveer 140 graden, het dichtst bij die richting: die neem je', uit);
}

function kompasschieten() {
  const S = [40, 206];
  const [ax, ay] = pol(S[0], S[1], 126, 50); const [bx, by] = pol(S[0], S[1], 252, 50);
  let uit = `<path d="M${S[0]} ${S[1]}L${bx} ${by}" class="tw-blauw" stroke-width="1.6" stroke-dasharray="6 5"/>`;
  for (const [x, y] of [[96, 60], [210, 150], [60, 120], [270, 100], [150, 200]]) uit += `<circle cx="${x}" cy="${y}" r="10" class="tw-boom tw-geest"/>`;
  uit += `<circle cx="${r1(ax)}" cy="${r1(ay)}" r="13" class="tw-boom"/><circle cx="${r1(bx)}" cy="${r1(by)}" r="13" class="tw-boom"/>`;
  const [nx, ny] = pol(S[0], S[1], 30, 0); const [hx, hy] = pol(S[0], S[1], 30, 50);
  uit += `<path d="M${S[0]} ${S[1]}V${S[1] - 46}" class="lijn dun"/><path d="M${nx} ${ny}A30 30 0 0 1 ${hx} ${hy}" class="tw-blauw" stroke-width="1.6"/><circle cx="${S[0]}" cy="${S[1]}" r="6" class="telefoon"/>`;
  uit += tekst(S[0] + 12, S[1] - 36, '50°', { maat: 11, anker: 'start', klasse: 'blauw-tekst vet' });
  uit += tekst(58, 212, '1  koers 50°: kies een boom', { maat: 11, anker: 'start' });
  uit += regels(r1(ax) + 18, r1(ay) + 10, '2  loop erheen|en schiet opnieuw', { maat: 11, anker: 'start' }, 13);
  uit += tekst(r1(bx) - 18, r1(by) + 4, '3  de volgende', { maat: 11, anker: 'end' }) + noordpijl(296, 168, 0, 34);
  return svg(320, 220, 'Kompasschieten: je zet 50 graden op je kompas en kiest een boom in die richting. Je loopt erheen, schiet daar opnieuw en kiest de volgende boom, tot je er bent', uit);
}

function doorsteek() {
  let uit = '<path d="M150 214V20" class="tw-blauw" stroke-width="1.6" stroke-dasharray="6 5"/>';
  uit += '<path d="M78 118q-2 -40 72 -42q78 0 76 42q2 40 -76 40q-74 0 -72 -40z" class="tw-water"/>' + tekst(150, 122, 'ven', { maat: 11, klasse: 'blauw-tekst' });
  uit += '<path d="M150 192L196 170Q252 140 240 96Q228 64 160 58" class="tw-pen dun" stroke-dasharray="3 4"/>' + pijl(170, 58, 160, 58, { klasse: 'tw-pen dun', punt: 6 });
  uit += '<circle cx="150" cy="58" r="6" class="accent"/><circle cx="150" cy="200" r="6" class="telefoon"/>';
  uit += tekst(150, 228, 'A', { maat: 13, klasse: 'vet' }) + tekst(150, 14, 'B', { maat: 13, klasse: 'vet' });
  uit += tekst(160, 214, '1  de koers naar B', { maat: 11, anker: 'start' });
  uit += regels(138, 40, '2  je maatje loopt om|en gaat óp de lijn staan', { maat: 11, anker: 'end' }, 13);
  uit += regels(248, 126, '3  jij loopt om|naar je maatje|en gaat verder', { maat: 11, anker: 'start' }, 13);
  return svg(340, 236, 'Doorsteek met een maatje: je koers van A naar B gaat door een ven. Je maatje loopt eromheen en gaat aan de overkant precies op de lijn staan; jij wijst hem bij. Dan loop jij om naar hem toe en gaat verder op de koers', uit);
}

function rallyPuntenVrij() {
  const paneel = (x, titel, binnen) => tekst(x + 80, 14, titel, { maat: 12, klasse: 'vet' }) + `<g transform="translate(${x} 22) scale(0.5)">${rallyWegen()}${binnen}<text x="40" y="214" class="tekst stil" font-size="18" text-anchor="middle">start</text></g>`;
  const punt = (x, y, n) => `<circle cx="${x}" cy="${y}" r="14" class="vlak"/><circle cx="${x}" cy="${y}" r="14" class="lijn dik"/><text x="${x}" y="${y + 7}" class="tekst vet" font-size="19" text-anchor="middle">${n}</text>`;
  let uit = paneel(0, 'punten vrij', '<path d="M40 200V110H120V180H280V40H200V75" class="tw-route" stroke-width="7"/>' + punt(80, 110, 1) + punt(240, 180, 2) + punt(200, 75, 3));
  uit += paneel(170, 'punten speciaal', '<path d="M40 200V180H120V40H240" class="tw-route" stroke-width="7"/>' + punt(80, 180, 1) + punt(160, 110, 2) + punt(240, 40, 3) + punt(280, 145, 4)
    + '<rect x="58" y="118" width="44" height="36" rx="5" class="vlak"/><rect x="58" y="118" width="44" height="36" rx="5" class="lijn dik"/><text x="80" y="145" class="tekst vet" font-size="26" text-anchor="middle">3</text>');
  uit += regels(80, 152, 'de weg ertussen|kies je zelf', { maat: 10.5 }) + regels(250, 152, 'op 1 vind je een 3: door|naar 3; 2 sluit de weg af', { maat: 10.5 });
  return svg(330, 178, 'Punten vrij: rijd de punten 1, 2 en 3 in volgorde, de weg ertussen kies je zelf. Punten speciaal: op punt 1 vind je het getal 3, dus ga je over de kortste weg naar punt 3; punt 2 sluit de weg af', uit);
}

function watTeltAlsPad() {
  let uit = '<rect x="0" y="0" width="150" height="150" rx="8" class="tw-bos"/><rect x="45" y="0" width="60" height="150" class="tw-zand"/>';
  uit += wandelaar(62, 86) + wandelaar(88, 86) + goed(128, 22);
  uit += '<rect x="160" y="0" width="150" height="150" rx="8" class="tw-bos"/><path d="M235 0q-8 40 2 75t-4 75" class="tw-zandpad"/>';
  uit += wandelaar(235, 64) + wandelaar(237, 112) + fout(288, 20);
  uit += regels(75, 170, 'twee naast elkaar|met een rugzak: telt', { maat: 11 }) + regels(235, 170, 'maar één tegelijk:|telt niet', { maat: 11 });
  return svg(310, 196, 'Wat telt als pad: links een pad waar twee mensen met een rugzak naast elkaar lopen, dat telt als weg. Rechts een smal paadje waar er maar één tegelijk door kan, dat telt niet, tenzij je routeboekje het anders zegt', uit);
}

function stripkaartRegels() {
  const SIT = [
    ['A', { links: 1 }, [270, 0], 0, 'zijweg links:|rechtdoor'],
    ['B', { links: 1 }, [270, 90], 90, 'T-splitsing:|rechtsaf'],
    ['C', { links: 1 }, [0, 90], 90, 'zijweg rechts:|rechtsaf'],
    ['D', { links: 1, rechts: 1 }, [270, 0, 90], 0, 'kruising:|rechtdoor'],
    ['E', { links: 2 }, [270, 0, 90], 90, 'kruising:|rechtsaf'],
    ['F', { links: 1 }, [270, 0, 90], null, 'twee over:|fout gelopen!'],
  ];
  let uit = '';
  SIT.forEach(([letter, { links = 0, rechts = 0 }, wegen, keuze, onder], i) => {
    const cx = 55 + (i % 3) * 110; const top = Math.floor(i / 3) * 172;
    uit += `<rect x="${cx - 52}" y="${top + 3}" width="104" height="166" rx="8" class="vlak2"/>` + tekst(cx - 42, top + 22, letter, { maat: 13, anker: 'start', klasse: 'vet' });
    const y = top + 36;
    const kant = (n, z) => (n === 1 ? `M${cx} ${y}h${z * 16}` : n === 2 ? `M${cx} ${y}l${z * 16} -9M${cx} ${y}l${z * 16} 9` : '');
    uit += `<path d="M${cx} ${top + 56}V${top + 14}${kant(links, -1)}${kant(rechts, 1)}" class="tw-pen"/>`;
    const cy = top + 104;
    uit += kruispunt(cx, cy, 34, wegen, keuze ?? 0, { pen: keuze != null });
    if (keuze == null) {
      uit += `<path d="M${cx} ${cy + 27}V${cy}" class="tw-pen"/>`;
      for (const g of [0, 90]) { const [x2, y2] = pol(cx, cy, 30, g); uit += pijl(cx, cy, x2, y2, { klasse: 'tw-route', punt: 8 }); }
      uit += tekst(cx + 24, cy - 14, '?', { maat: 20, klasse: 'vet rood-tekst' });
    }
    uit += regels(cx, top + 152, onder, { maat: 10.5 });
  });
  return svg(330, 344, 'Regels van de stripkaart, steeds één streepje links tenzij anders. A: zijweg links, je gaat rechtdoor. B: T-splitsing, je gaat rechtsaf. C: zijweg rechts, rechtdoor is de meest linkse weg, dus je gaat rechtsaf. D: streepje links en rechts op een kruising, rechtdoor. E: twee streepjes links in een V op een kruising, rechtsaf. F: één streepje op een kruising laat twee wegen over: je bent fout gelopen', uit);
}

function rallyKaartleesregels() {
  const vak = (x, y, binnen, onder, ok) => `<rect x="${x}" y="${y}" width="160" height="134" rx="8" class="vlak2"/><g transform="translate(${x} ${y})">${binnen}${ok ? goed(140, 20) : fout(142, 18)}${regels(80, 108, onder, { maat: 10.5 })}</g>`;
  let uit = vak(0, 0, '<path d="M8 56H152" class="tw-weg breed"/>' + '<path d="M20 48H96A9 9 0 0 1 96 66H86" class="tw-route"/>' + pijl(86, 66, 62, 66, { klasse: 'tw-route', punt: 9 }), 'keren mag niet,|tenzij het gevraagd wordt', false);
  uit += vak(170, 0, '<path d="M8 56H152" class="tw-weg"/><circle cx="80" cy="56" r="11" class="vlak"/><circle cx="80" cy="56" r="11" class="lijn dik"/><path d="M80 49v14M74 54h12" class="lijn dik"/>'
    + '<path d="M14 64H120" class="tw-route"/>' + pijl(120, 64, 146, 64, { klasse: 'tw-route', punt: 9 }), 'een kaartteken op de weg:|de weg loopt gewoon door', true);
  uit += vak(0, 144, '<path d="M24 88V30H124V62M24 62H124" class="tw-weg smal"/><circle cx="24" cy="88" r="5" class="telefoon"/><circle cx="124" cy="62" r="5" class="telefoon"/>'
    + '<path d="M24 88V62H120" class="tw-route"/><path d="M30 86V36H118V58" class="tw-pen dun" stroke-dasharray="4 4"/>' + tekst(12, 92, 'A', { maat: 11, klasse: 'vet' }) + tekst(136, 66, 'B', { maat: 11, klasse: 'vet' }), 'zelf kiezen? neem|de kortste route', true);
  uit += vak(170, 144, '<rect x="16" y="20" width="44" height="44" rx="4" class="tw-bord-blauw"/><path d="M38 60V34" class="tw-bord-wit"/><path d="M27 32H49" class="tw-bord-rood"/>' + goed(52, 80)
    + '<rect x="72" y="18" width="76" height="50" rx="4" class="tw-bord-licht"/>' + ['uitgezonderd', 'bestemmings-', 'verkeer'].map((r, k) => `<text x="110" y="${33 + k * 12}" class="tw-bord-tekst" font-size="9.5" text-anchor="middle">${r}</text>`).join('') + fout(130, 80),
  'doodlopend: mag wel;|bestemmingsverkeer: niet', true).replace(goed(140, 20), '');
  return svg(330, 280, 'Kaartleesregels uit de rally. Keren mag niet, tenzij het gevraagd wordt. Een kaartteken op de weg onderbreekt de weg niet. Moet je zelf kiezen, neem dan de kortste route. Een bord doodlopende weg sluit een weg niet af, een weg voor bestemmingsverkeer wel', uit);
}

function herstelcodes() {
  const haai = (x, y) => `<path d="M${x - 9} ${y}l3 6l3 -6l3 6l3 -6l3 6l3 -6z" class="tw-haai"/>`;
  const TEGELS = [
    ['HK', 'hier keren', '<path d="M55 86V8" class="tw-weg breed"/><path d="M48 84V32A7 7 0 0 1 62 32V48" class="tw-route"/>' + pijl(62, 48, 62, 72, { klasse: 'tw-route', punt: 9 })],
    ['1R', '1e weg rechts', '<path d="M40 86V8M40 60H104M40 26H104" class="tw-weg smal"/><path d="M40 84V60H76" class="tw-route"/>' + pijl(76, 60, 98, 60, { klasse: 'tw-route', punt: 9 })],
    ['2R', '2e weg rechts', '<path d="M40 86V8M40 60H104M40 26H104" class="tw-weg smal"/><path d="M40 84V26H76" class="tw-route"/>' + pijl(76, 26, 98, 26, { klasse: 'tw-route', punt: 9 })],
    ['ER', 'einde weg rechts', '<path d="M55 86V30M8 30H102" class="tw-weg smal"/><path d="M55 84V30H80" class="tw-route"/>' + pijl(80, 30, 100, 30, { klasse: 'tw-route', punt: 9 })],
    ['VR', 'voorrangsweg rechts', '<path d="M55 86V30" class="tw-weg smal"/><path d="M6 30H104" class="tw-weg"/>' + haai(55, 40) + '<path d="M55 84V34H80" class="tw-route"/>' + pijl(80, 34, 100, 34, { klasse: 'tw-route', punt: 9 })],
    ['VO', 'voorrangsweg|oversteken', '<path d="M55 86V8" class="tw-weg smal"/><path d="M6 46H104" class="tw-weg"/>' + haai(55, 56) + '<path d="M55 84V30" class="tw-route"/>' + pijl(55, 30, 55, 8, { klasse: 'tw-route', punt: 9 })],
  ];
  let uit = '';
  TEGELS.forEach(([code, betekenis, teken], i) => {
    const x = (i % 3) * 110; const y = Math.floor(i / 3) * 128;
    uit += `<rect x="${x + 3}" y="${y + 3}" width="104" height="122" rx="8" class="vlak2"/><g transform="translate(${x} ${y})">${teken}</g>`;
    uit += tekst(x + 55, y + 104, code, { maat: 15, klasse: 'vet' }) + regels(x + 55, y + 117, betekenis, { maat: 9.5 }, 10);
  });
  return svg(330, 256, 'Herstelcodes als tekening: HK hier keren; 1R de eerste weg rechts; 2R de tweede weg rechts; ER aan het einde van de weg rechtsaf; VR rechtsaf de voorrangsweg op; VO de voorrangsweg oversteken', uit);
}

function natuurspoor() {
  let uit = '<rect x="0" y="0" width="300" height="210" rx="8" class="vlak2"/>' + kruispunt(150, 120, 104, [305, 40], 40, { pen: false });
  uit += zijboom(28, 96) + zijboom(104, 200) + zijboom(232, 64) + zijboom(36, 160, 14) + zijboom(278, 202, 14);
  // a pine cone lying by the right-hand path, under oaks
  uit += '<ellipse cx="205" cy="84" rx="6" ry="9" transform="rotate(30 205 84)" class="tw-kegel"/><path d="M201 78l8 3M200 84l9 3M201 90l7 2" class="tw-kegel-lijn"/>';
  uit += tekst(218, 100, 'dennenappel', { maat: 11, anker: 'start', klasse: 'vet' }) + regels(218, 114, 'onder eiken:|die kant op', { maat: 10.5, anker: 'start' });
  return svg(300, 210, 'Natuurspoor: op een splitsing in een eikenbos ligt een dennenappel bij het pad rechts. Die hoort daar niet, dus dat pad moet je hebben', uit);
}

function lantaarnpaalroute() {
  let uit = '<path d="M10 196H130" class="lijn stil"/><rect x="58" y="34" width="9" height="162" class="tw-metaal"/><path d="M62 38q0 -20 34 -20" class="tw-metaal-lijn"/><path d="M84 14h28l-4 9h-20z" class="tw-metaal"/>';
  uit += '<rect x="44" y="104" width="37" height="22" rx="3" class="tw-plaatje"/>' + tekst(62.5, 120, '58', { maat: 14, klasse: 'vet' });
  uit += '<rect x="150" y="26" width="140" height="150" rx="8" class="vlak2"/>' + tekst(166, 50, 'je lijst', { maat: 12, anker: 'start', klasse: 'stil' });
  ['47', '52', '58', '61', '64'].forEach((n, i) => {
    const y = 76 + i * 22;
    uit += tekst(170, y, n, { maat: 14, anker: 'start', klasse: i === 2 ? 'vet' : i < 2 ? 'stil' : '' });
    if (i < 2) uit += `<path d="M166 ${y - 5}h28" class="lijn"/>`;
  });
  uit += tekst(204, 120, '← nu', { maat: 12, anker: 'start', klasse: 'vet' });
  return svg(300, 200, 'Lantaarnpaalroute: een lantaarnpaal met nummerplaatje 58, en je lijst met nummers: 47 en 52 heb je gehad, nu zoek je 58, daarna 61 en 64', uit);
}

function adresSpeurtocht() {
  let uit = '<rect x="0" y="0" width="300" height="220" rx="8" class="vlak2"/>' + kruispunt(150, 140, 110, [315, 45], 45, { pen: false });
  const [rx, ry] = pol(150, 140, 96, 45);
  uit += `<path d="M150 214V140L${rx} ${ry}" class="tw-route"/>`;
  const bord = (x, y, t, w) => `<path d="M${x} ${y + 8}v26" class="lijn dik"/><rect x="${x - w / 2}" y="${y - 8}" width="${w}" height="17" rx="2" class="tw-bord-blauw"/><text x="${x}" y="${y + 4}" class="tw-bord-wit-tekst" font-size="10" text-anchor="middle">${t}</text>`;
  uit += bord(98, 112, 'Heksenpad', 64) + bord(214, 154, 'Tovenaarslaan', 84);
  uit += zijboom(262, 60) + '<rect x="254" y="44" width="16" height="14" rx="2" class="tw-plaatje"/>' + tekst(262, 55, '7', { maat: 11, klasse: 'vet' });
  uit += '<rect x="8" y="10" width="118" height="46" rx="4" class="vlak"/><rect x="8" y="10" width="118" height="46" rx="4" class="lijn"/>';
  uit += regels(16, 28, 'Breng terug naar:|Tovenaarslaan 7', { maat: 11, anker: 'start' }, 16);
  return svg(300, 220, 'Adres-speurtocht: op een splitsing in het bos staan straatnaambordjes, Heksenpad en Tovenaarslaan. Je moet naar Tovenaarslaan 7, dus je neemt de Tovenaarslaan en zoekt de boom met nummer 7', uit);
}

function spoorLeggen() {
  const vak = (x, binnen) => `<g transform="translate(${x} 0)"><rect x="0" y="0" width="150" height="150" rx="8" class="tw-bos"/><path d="M60 150V60H150" class="tw-asfalt"/>${binnen}</g>`;
  let uit = vak(0, '<path d="M60 120V78" class="tw-krijt-weg" stroke-dasharray="9 6"/><path d="M50 86L60 72L70 86" class="tw-krijt-weg" stroke-dasharray="7 6"/><path d="M52 150V40M68 150V40" class="tw-band"/>' + fout(130, 22));
  uit += vak(160, '<path d="M96 104L132 104" class="tk-tak"/><path d="M118 94L132 104L118 114" class="tk-tak"/>' + goed(132, 22));
  uit += regels(75, 170, 'krijt op de rijbaan:|stukgereden', { maat: 11 }) + regels(235, 170, 'takken in de berm, aan de|kant waar je heen gaat', { maat: 11 });
  return svg(310, 196, 'Een spoor leggen: links een krijtpijl midden op de weg, waar banden overheen rijden: die is snel weg. Rechts een pijl van takken in de berm, aan de kant van de weg die je neemt: die blijft liggen', uit);
}

function gpsRoute() {
  let uit = '<rect x="10" y="8" width="96" height="184" rx="14" class="telefoon"/><rect x="16" y="24" width="84" height="150" rx="4" class="vlak"/>';
  uit += tekst(58, 46, 'WP 3', { maat: 13, klasse: 'vet' }) + pijl(58, 118, 82, 84, { klasse: 'tw-blauw', punt: 12 }) + tekst(58, 152, '240 m', { maat: 17, klasse: 'vet' });
  uit += '<rect x="122" y="8" width="190" height="184" rx="8" class="tw-paneel"/><path d="M150 112h80v60h-80z" class="tw-bos"/>';
  uit += '<path d="M134 178H250M240 178V44M136 112H240M240 48H306" class="tw-weg smal"/>';
  uit += '<path d="M140 178H240V48H272" class="tw-route"/><path d="M140 178L280 48" class="tw-blauw" stroke-width="1.6" stroke-dasharray="6 5"/>';
  uit += '<circle cx="140" cy="178" r="5" class="telefoon"/><path d="M280 48v-18l12 5l-12 5" class="rood"/>' + tekst(286, 64, 'WP 3', { maat: 11, klasse: 'vet' });
  uit += regels(150, 26, 'hemelsbreed 240 m;|de paden zoek je zelf', { maat: 10.5, anker: 'start' });
  return svg(320, 200, 'GPS-route: het scherm zegt dat waypoint 3 240 meter verderop ligt, schuin rechts vooruit. Hemelsbreed loopt de lijn door een bos; je loopt over de paden eromheen', uit);
}

function draaiomTocht() {
  let uit = '<rect x="0" y="0" width="300" height="190" rx="8" class="vlak2"/>' + kruispunt(150, 110, 110, [270, 90], 90, { pen: false });
  uit += '<path d="M150 186V110H240" class="tw-route"/>' + pijl(236, 110, 262, 110, { klasse: 'tw-route', punt: 10 });
  uit += '<path d="M118 136V86" class="lijn dik"/><rect x="88" y="66" width="60" height="26" rx="3" class="vlak"/><rect x="88" y="66" width="60" height="26" rx="3" class="lijn"/>' + pijl(138, 79, 98, 79, { klasse: 'tw-pen', punt: 9 });
  uit += regels(10, 28, 'de pijl wijst links,|dus ga je rechts', { maat: 12, anker: 'start' }, 15);
  return svg(300, 190, 'Draaiom-tocht: op een T-splitsing wijst de pijl naar links. Je draait de aanwijzing om en gaat rechtsaf', uit);
}

function vijfMaalTwintig() {
  const groepen = [['stripkaart', 'accent'], ['bolletje-pijltje', 'blauw'], ['kompasroute', 'rood'], ['oleaat', 'tw-paars'], ['fotoroute', 'tw-bruin']];
  let uit = '<path d="M16 70H324" class="lijn"/>';
  groepen.forEach(([naam, kleur], g) => {
    for (let k = 0; k < 4; k++) { const i = g * 4 + k; uit += `<circle cx="${r1(20 + i * 15.8)}" cy="70" r="6" class="${kleur}"/>`; }
    uit += tekst(r1(20 + (g * 4 + 1.5) * 15.8), g % 2 ? 42 : 26, naam, { maat: 10.5, klasse: 'vet' });
    if (g) uit += `<path d="M${r1(20 + (g * 4 - 0.5) * 15.8)} 56v28" class="lijn dik"/>`;
  });
  uit += tekst(20, 96, '1', { maat: 10, klasse: 'stil' }) + tekst(320, 96, '20', { maat: 10, klasse: 'stil' }) + tekst(170, 112, 'de dikke streepjes: daar wissel je van techniek', { maat: 10.5 });
  return svg(340, 120, '5 × 20: twintig kruispunten in vijf technieken, elk vier kruispunten: stripkaart, bolletje-pijltje, kompasroute, oleaat en fotoroute. Bij elk streepje wissel je van techniek', uit);
}

function tochtafstanden() {
  const PX = 16;                                  // per km
  let uit = '';
  [['eerst: minstens 5 km', 5, 'zo’n 1 u 15 min'], ['dan: minstens 15 km', 15, 'zo’n 3 u 45 min']].forEach(([t, km, tijd], i) => {
    const y = 26 + i * 52;
    uit += tekst(10, y, t, { maat: 12, anker: 'start', klasse: 'vet' }) + tekst(290, y, tijd, { maat: 11, anker: 'end' }) + `<rect x="10" y="${y + 8}" width="${km * PX}" height="16" rx="4" class="accent"/>`;
  });
  uit += tekst(10, 130, 'daarna: meer dagen achter elkaar', { maat: 12, anker: 'start', klasse: 'vet' });
  ['dag 1', 'dag 2', '…'].forEach((d, i) => { uit += `<rect x="${10 + i * 92}" y="138" width="86" height="16" rx="4" class="${i < 2 ? 'accent-licht' : 'vol-licht'}"/>` + tekst(53 + i * 92, 151, d, { maat: 10.5 }); });
  for (let k = 0; k <= 15; k += 5) uit += `<path d="M${10 + k * PX} 172v5" class="lijn"/>` + tekst(10 + k * PX, 188, `${k} km`, { maat: 9.5, klasse: 'stil', anker: k ? 'middle' : 'start' });
  uit += '<path d="M10 172H250" class="lijn dun"/>' + tekst(10, 206, 'bij 4 km per uur, zonder pauzes en zonder zoeken', { maat: 10.5, anker: 'start', klasse: 'stil' });
  return svg(300, 212, 'Hoe ver loop je: eerst minstens 5 kilometer, zo’n 1 uur en 15 minuten lopen; dan minstens 15 kilometer, zo’n 3 uur en 45 minuten; daarna meer dagen achter elkaar. Gerekend met 4 kilometer per uur, zonder pauzes', uit);
}

function logboek() {
  let uit = '<rect x="4" y="4" width="312" height="212" rx="6" class="vlak"/><rect x="4" y="4" width="312" height="212" rx="6" class="lijn"/>';
  for (let y = 54; y < 212; y += 20) uit += `<path d="M10 ${y}H310" class="lijn haar"/>`;
  uit += '<path d="M52 8V212" class="lijn rood-lijn"/>' + tekst(60, 34, 'Hike zaterdag 10 okt · de Wolven', { maat: 13, anker: 'start', klasse: 'vet' });
  [['10.05', 'vertrek: 113.52 – 398.64'], ['', 'stripkaart, 3,2 km, zonnig, 14 °C'], ['10.55', 'post 1: 114.10 – 399.02'], ['', 'ree gezien bij de beek'], ['', 'opdracht: hoogte van de toren geschat'],
    ['11.20', 'vertrek post 1, oleaat'], ['12.10', 'post 2: lunch …']].forEach(([tijd, t], i) => {
    const y = 50 + i * 20;
    if (tijd) uit += tekst(46, y, tijd, { maat: 11, anker: 'end', klasse: 'vet' });
    uit += tekst(60, y, t, { maat: 11, anker: 'start' });
  });
  return svg(320, 220, 'Een bladzijde uit een hikelogboek: per regel de tijd, de post met coördinaten, de routetechniek en de afstand, het weer, wat je zag en de opdracht op de post', uit);
}

function bewerkteKaart() {
  let uit = kaartje(0, 0, { route: false });
  uit += '<rect x="194" y="104" width="86" height="72" class="tw-plak"/>' + tekst(237, 144, 'afgeplakt', { maat: 10.5, klasse: 'stil' });
  const post = (x, y, n, klasse = 'tw-post') => `<circle cx="${x}" cy="${y}" r="10" class="${klasse}"/>${tekst(x + 14, y - 8, n, { maat: 11, anker: 'start', klasse: 'vet' })}`;
  uit += '<path d="M60 178l10 17h-20z" class="tw-post"/>' + post(120, 95, '1') + post(180, 40, '2a', 'tw-post keuze') + post(60, 40, '2b', 'tw-post keuze') + post(250, 95, '3');
  uit += '<path d="M290 40l3.5 7.5l8 .8l-6 5.4l1.8 8l-7.3 -4.2l-7.3 4.2l1.8 -8l-6 -5.4l8 -.8z" class="tw-bonus"/>';
  uit += '<circle cx="120" cy="170" r="9" class="tw-post"/><circle cx="120" cy="170" r="5" class="tw-post"/>';
  const ly = 222;
  uit += '<circle cx="12" cy="218" r="7" class="tw-post"/>' + tekst(24, ly, 'verplicht', { maat: 10.5, anker: 'start' });
  uit += '<circle cx="92" cy="218" r="7" class="tw-post keuze"/>' + tekst(104, ly, '1 van de 2', { maat: 10.5, anker: 'start' });
  uit += '<path d="M178 211l2.5 5l5.5 .6l-4 3.7l1.2 5.4l-5.2 -2.8l-5.2 2.8l1.2 -5.4l-4 -3.7l5.5 -.6z" class="tw-bonus"/>' + tekst(192, ly, 'bonus', { maat: 10.5, anker: 'start' });
  uit += '<path d="M238 211l7 12h-14z" class="tw-post"/>' + tekst(250, ly, 'start', { maat: 10.5, anker: 'start' });
  uit += '<circle cx="12" cy="240" r="7" class="tw-post"/><circle cx="12" cy="240" r="3.5" class="tw-post"/>' + tekst(24, 244, 'finish', { maat: 10.5, anker: 'start' });
  return svg(300, 250, 'Bewerkte kaart met keuzeposten: een kaart met een afgeplakt stuk, een start, verplichte posten 1 en 3, een keuze tussen post 2a en 2b, een bonuspost en een finish', uit);
}

// -- the tochtvormen added later: voetjes, dobbelsteen, radiovossenjacht

/** One chalk footprint at (x, y), walking towards `hoek` (degrees from north); `links` mirrors it. */
function voetje(x, y, hoek, links) {
  const m = links ? -1 : 1;
  const tenen = [[-4, -15, 2.4], [-0.6, -16.2, 2], [2.5, -15.4, 1.8], [5, -13.8, 1.6], [6.6, -11.6, 1.4]]
    .map(([tx, ty, r]) => `<circle cx="${r1(tx * m)}" cy="${ty}" r="${r}" class="tw-voetje"/>`).join('');
  const zool = `<ellipse cx="${r1(1 * m)}" cy="-5" rx="6" ry="7.5" class="tw-voetje"/><ellipse cx="${r1(-0.6 * m)}" cy="3" rx="4" ry="6" class="tw-voetje"/><ellipse cx="0" cy="9" rx="4.6" ry="5" class="tw-voetje"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${hoek}) scale(0.85)">${zool}${tenen}</g>`;
}

function voetjes() {
  let uit = '<rect x="0" y="0" width="300" height="210" rx="8" class="vlak2"/>' + kruispunt(150, 110, 104, [270, 0, 90], 90, { pen: false });
  // up the road from the south, then right at the crossing
  [[146, 196, 0, true], [154, 172, 0, false], [146, 148, 0, true], [154, 124, 20, false], [168, 106, 70, true], [190, 114, 90, false],
    [214, 106, 90, true], [238, 114, 90, false], [262, 106, 90, true]].forEach(([x, y, g, l]) => { uit += voetje(x, y, g, l); });
  uit += tekst(206, 82, 'de tenen wijzen', { maat: 11, anker: 'start', klasse: 'vet' }) + tekst(206, 96, 'de weg', { maat: 11, anker: 'start', klasse: 'vet' });
  return svg(300, 210, 'Voetjestocht: gekleurde krijtvoetjes lopen de weg op naar een kruispunt en draaien daar naar rechts. Waar de tenen heen wijzen, ga je heen', uit);
}

/** A die face with 1-6 pips, at (x, y), size z. */
function dobbelsteen(x, y, z, n) {
  const a = z * 0.27; const plek = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] }[n];
  return `<rect x="${x - z / 2}" y="${y - z / 2}" width="${z}" height="${z}" rx="${z * 0.18}" class="tw-dobbel"/>${
    plek.map(([px, py]) => `<circle cx="${r1(x + px * a)}" cy="${r1(y + py * a)}" r="${r1(z * 0.09)}" class="tw-oog"/>`).join('')}`;
}

function dobbelsteenTocht() {
  const betekenis = ['rechtsaf', 'linksaf', 'rechtdoor', 'terug', 'opdracht', 'zelf kiezen'];
  const richting = [90, 270, 0, 180, null, null];
  let uit = '';
  betekenis.forEach((t, i) => {
    const cx = 56 + (i % 3) * 114; const cy = 50 + Math.floor(i / 3) * 112;
    uit += dobbelsteen(cx - 18, cy, 46, i + 1);
    const ax = cx + 34;
    if (richting[i] === 180) {
      uit += `<path d="M${ax - 7} ${cy + 18}V${cy - 6}a7 7 0 0 1 14 0" class="tw-pen"/>` + pijl(ax + 7, cy - 6, ax + 7, cy + 18, { klasse: 'tw-pen', punt: 8 });
    } else if (richting[i] != null) {
      const [ex, ey] = pol(ax, cy, 18, richting[i]);
      uit += `<path d="M${ax} ${cy + 18}V${cy}" class="tw-pen"/>` + pijl(ax, cy, ex, ey, { klasse: 'tw-pen', punt: 8 });
    } else uit += tekst(cx + 34, cy + 9, i === 4 ? '!' : '?', { maat: 26, klasse: 'vet' });
    uit += tekst(cx, cy + 46, `${i + 1}: ${t}`, { maat: 12, klasse: 'vet' });
  });
  return svg(340, 214, 'Dobbelsteentocht: wat elk getal betekent bij Jong Nederland. 1 rechtsaf, 2 linksaf, 3 rechtdoor, 4 terug, 5 een opdracht, 6 jullie kiezen zelf', uit);
}

function radiovos() {
  let uit = '<rect x="0" y="0" width="320" height="220" rx="8" class="tw-paneel"/><path d="M30 26h120v70h-120z M190 120h110v80h-110z" class="tw-bos"/>';
  uit += '<path d="M0 170 Q120 150 200 180 T320 160" class="tw-weg smal"/><path d="M90 0 V220" class="tw-pad"/>';
  const vos = [204, 82];
  const punten = [[40, 182, 'A'], [292, 196, 'B'], [276, 22, 'C']];
  for (const [x, y, n] of punten) {
    const dx = vos[0] - x; const dy = vos[1] - y; const l = Math.hypot(dx, dy);
    uit += `<path d="M${x} ${y}L${r1(x + (dx / l) * (l + 34))} ${r1(y + (dy / l) * (l + 34))}" class="tw-peillijn"/>`;
    uit += `<path d="M${x} ${y - 9}l8 14h-16z" class="tw-peilpunt"/>` + tekst(x + (x < 160 ? -12 : 13), y + 4, n, { maat: 13, klasse: 'vet', anker: x < 160 ? 'end' : 'start' });
  }
  uit += `<circle cx="${vos[0]}" cy="${vos[1]}" r="11" class="tw-vos"/><path d="M${vos[0]} ${vos[1] - 11}v-14 M${vos[0] - 6} ${vos[1] - 22}h12" class="tw-pen dun"/>`;
  uit += tekst(vos[0] + 16, vos[1] - 14, 'de vos', { maat: 12, anker: 'start', klasse: 'vet' });
  uit += tekst(12, 212, 'peilpunt', { maat: 10, anker: 'start', klasse: 'stil' });
  return svg(320, 220, 'Radiovossenjacht met een kruispeiling: vanaf drie plekken, A, B en C, peil je de richting van het signaal en teken je een lijn op de kaart. Waar de lijnen elkaar snijden, zit de vos', uit);
}

export default {
  'tocht-overzicht': overzicht,
  'tocht-kruispuntenroute': () => kruispuntenroute(),
  'tocht-noordpijlroute': noordpijlRoute,
  'tocht-aangezichtskruispunt': aangezichtsKruispunt,
  'tocht-bolletje-pijltje': bolletjePijltjeRoute,
  'tocht-bolletje-windrichting': bolletjeWindrichting,
  'tocht-bolletjesroute': bolletjesroute,
  'tocht-kruispunten-pijltjes': kruispuntenPijltjes,
  'tocht-ogenroute': ogenroute,
  'tocht-kralentocht': kralentocht,
  'tocht-knopenroute': knopenroute,
  'tocht-breukenroute': breukenroute,
  'tocht-tijdenroute': tijdenroute,
  'tocht-helikopterroute': helikopterroute,
  'tocht-vectorroute': vectorroute,
  'tocht-hierogliefen': hierogliefen,
  'tocht-quizroute': quizroute,
  'tocht-stripkaart': stripkaartRoute,
  'tocht-aangezichtsstripkaart': aangezichtsstripkaart,
  'tocht-vliegkoers': vliegkoers,
  'tocht-stroomschema': stroomschema,
  'tocht-metrokaart': metrokaart,
  'tocht-oleaat': oleaat,
  'tocht-blinde-vlek': blindeVlek,
  'tocht-hoofdpijnkaart': hoofdpijnkaart,
  'tocht-vlieglijn': vlieglijn,
  'tocht-coordinatenroute': coordinatenroute,
  'tocht-kruispeiling': kruispeiling,
  'tocht-passerroute': passerroute,
  'tocht-rally-bolpijl': rallyBolPijl,
  'tocht-rally-pijlen-punten': rallyPijlenPunten,
  'tocht-rally-ingetekende-lijn': rallyIngetekendeLijn,
  'tocht-rally-grens': rallyGrens,
  'tocht-rally-barricades': rallyBarricades,
  'tocht-lintjesroute': lintjesroute,
  'tocht-steenman': steenman,
  'tocht-spoortekens-bp': () => tegels([...metKort(BP), { inhoud: BP_NACHT, kort: "'s nachts: takken|met gras, voelbaar" }], 3,
    'De tekens van Baden-Powell uit 1908: deze weg, brief drie passen die kant op, niet deze weg, naar huis, een handtekening, en het teken voor de nacht van takken met gras', { cel: 120, hoog: 124, teken: 76 }),
  'tocht-spoortekens': () => tegels(metKort(UITGEBREID), 4, 'De uitgebreide set spoortekens, elk met zijn betekenis'),
  'tocht-spoortekens-natuur': () => tegels(metKort(NATUUR), 4, 'Spoortekens van gras, stenen, takken en lucifers'),
  'tocht-wandelmarkering': () => tegels([...MARKERING('law'), ...MARKERING('streekpad')].map((t, i) => ({ inhoud: t.teken, kort: `${i < 5 ? 'LAW' : 'streekpad'}|${['goede weg', 'linksaf', 'rechtsaf', 'afslag komt', 'verkeerd'][i % 5]}` })), 5,
    'Wandelmarkeringen op een paal: een LAW in wit en rood, een streekpad in geel en rood. Goede weg, linksaf, rechtsaf, een afslag komt eraan, en verkeerde weg', { cel: 74, hoog: 108, teken: 58 }),
  'tocht-spiegelkruispunten': spiegelkruispunten,
  'tocht-wiskunderoute': wiskunderoute,
  'tocht-gradenloop': gradenloop,
  'tocht-kompasschieten': kompasschieten,
  'tocht-doorsteek': doorsteek,
  'tocht-rally-punten-vrij': rallyPuntenVrij,
  'tocht-wat-telt-als-pad': watTeltAlsPad,
  'tocht-stripkaart-regels': stripkaartRegels,
  'tocht-rally-kaartleesregels': rallyKaartleesregels,
  'tocht-herstelcodes': herstelcodes,
  'tocht-natuurspoor': natuurspoor,
  'tocht-lantaarnpaalroute': lantaarnpaalroute,
  'tocht-adres-speurtocht': adresSpeurtocht,
  'tocht-spoor-leggen': spoorLeggen,
  'tocht-gps-route': gpsRoute,
  'tocht-draaiom': draaiomTocht,
  'tocht-vijf-maal-twintig': vijfMaalTwintig,
  'tocht-tochtafstanden': tochtafstanden,
  'tocht-logboek': logboek,
  'tocht-bewerkte-kaart': bewerkteKaart,
  'tocht-voetjes': voetjes,
  'tocht-dobbelsteen': dobbelsteenTocht,
  'tocht-radiovos': radiovos,
};
