// The trail signs (spoortekens) and the waymarks of Dutch walking routes, each drawn in a box of 100 × 100 as the
// inside of an SVG. Plain strings without a DOM, so the drawings of the cards (../../plaatjes/tocht.js) and the quiz
// (./tekenquiz.js) share them. The classes (tk-krijt, tk-tak, ...) are in ../../plaatjes/tocht.css, which the app
// loads everywhere.
//
// Sources: Baden-Powell, Scouting for Boys (1908), Camp Fire Yarn 3 [NAV §3a]; the larger set and the natural signs
// from Scoutpedia, Spoortekens [NAV §3b]; the waymarks from Wandelnet and nl.wikipedia, Lange-afstand-wandelpad
// [VAK WNET, tocht-uitwerking.md].

const r = (n) => Math.round(n * 10) / 10;

/** A line with an arrowhead at (x2, y2). */
export function pijl(x1, y1, x2, y2, { klasse = 'tk-krijt', punt = 16, open = false } = {}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p = (d) => [r(x2 - punt * Math.cos(a + d)), r(y2 - punt * Math.sin(a + d))];
  const [lx, ly] = p(0.5); const [rx, ry] = p(-0.5);
  return `<path d="M${x1} ${y1}L${x2} ${y2}" class="${klasse}"/>`
    + (open ? `<path d="M${lx} ${ly}L${x2} ${y2}L${rx} ${ry}" class="${klasse}"/>` : `<path d="M${lx} ${ly}L${x2} ${y2}L${rx} ${ry}Z" class="${klasse} tk-punt"/>`);
}
const lijn = (d, klasse = 'tk-krijt') => `<path d="${d}" class="${klasse}"/>`;
const cirkel = (x, y, rr, klasse = 'tk-krijt') => `<circle cx="${x}" cy="${y}" r="${rr}" class="${klasse}"/>`;
const tkst = (x, y, t, maat = 22) => `<text x="${x}" y="${y}" class="tk-tekst" font-size="${maat}" text-anchor="middle" dominant-baseline="central">${t}</text>`;

/** A tuft of grass seen from above: the roots at (x, y), the blades tied together and laid towards `hoek` (0 = up). */
function grasdot(x, y, hoek, schaal = 1) {
  const wortel = [0, 50, 100, 150, 200, 250, 300].map((g) => {
    const a = (g * Math.PI) / 180; return `<path d="M0 0L${r(8 * Math.cos(a))} ${r(8 * Math.sin(a))}" class="tk-gras"/>`;
  }).join('');
  const sprieten = [-7, -3.5, 0, 3.5, 7].map((d) => `<path d="M0 ${d}Q14 ${d * 0.5} 24 ${d * 0.15}L36 ${d * 0.6}" class="tk-gras"/>`).join('');
  return `<g transform="translate(${x} ${y}) rotate(${hoek - 90}) scale(${schaal})">${wortel}${sprieten}<rect x="20" y="-5" width="6" height="10" rx="2" class="tk-knoop"/></g>`;
}
const steen = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" class="tk-steen"/>`;
const tak = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" class="tk-tak"/>`;

// -- Baden-Powell, 1908: the five signs on the ground or a wall, and the same at night
export const BP = [
  { id: 'bp-weg', vorm: 'een pijl', naam: 'Deze weg volgen', en: 'Road to be followed', teken: pijl(14, 80, 86, 20, { punt: 22 }) },
  { id: 'bp-brief', vorm: 'een vierkant met een 3 erin en een pijl eruit', naam: 'Brief verstopt, drie passen in de richting van de pijl', en: 'Letter hidden three paces from here in the direction of the arrow',
    teken: lijn('M8 32h36v36h-36z') + tkst(26, 50, '3') + pijl(44, 50, 92, 50, { punt: 16 }) },
  { id: 'bp-niet', vorm: 'een kruis', naam: 'Deze weg niet volgen', en: 'This path not to be followed', teken: lijn('M18 18L82 82M82 18L18 82') },
  { id: 'bp-huis', vorm: 'een cirkel met een stip in het midden', naam: 'Ik ben naar huis', en: 'I have gone home', teken: cirkel(50, 50, 34) + cirkel(50, 50, 6, 'tk-vul') },
  { id: 'bp-handtekening', vorm: 'een 3 naast een wolvenkop', naam: 'Getekend: nummer 3 van de patrouille Wolven', en: '(Signed) scout 3 of the Wolves',
    teken: tkst(16, 54, '3', 30)
      + lijn('M34 30L44 52L40 70L54 84L68 70L64 52L74 30L62 42H46Z')
      + cirkel(49, 58, 2.5, 'tk-vul') + cirkel(59, 58, 2.5, 'tk-vul') + cirkel(54, 78, 3, 'tk-vul') },
];

/** The night sign: sticks with a wisp of grass round them, laid in the same shapes, to feel with your hand. */
export const BP_NACHT = tak(16, 82, 84, 18) + tak(84, 18, 64, 22) + tak(84, 18, 80, 38)
  + [[33, 66], [50, 50], [67, 34]].map(([x, y]) => `<path d="M${x - 6} ${y - 4}q6 -6 12 0q-6 6 -12 0" class="tk-gras"/><path d="M${x - 5} ${y + 3}q5 -8 10 -6" class="tk-gras"/>`).join('');

// -- the larger set, as Scoutpedia gives it (drawn after its meanings, not copied). Scoutpedia calls both the two
// circles and the ring of seven "Eindspoor", so they share one meaning: the quiz never offers one against the other.
export const UITGEBREID = [
  { id: 'sp-weg', vorm: 'een pijl', naam: 'Deze weg volgen', teken: pijl(50, 90, 50, 10, { punt: 22 }) },
  { id: 'sp-rennen', vorm: 'een pijl met twee punten', naam: 'Sneller lopen, rennen', teken: lijn('M50 92V12') + lijn('M30 34L50 12L70 34M30 56L50 34L70 56', 'tk-krijt') },
  { id: 'sp-links', vorm: 'een pijl met een hoek naar links', naam: 'Linksaf', teken: lijn('M66 90V40H18') + lijn('M36 24L16 40L36 56') },
  { id: 'sp-rechts', vorm: 'een pijl met een hoek naar rechts', naam: 'Rechtsaf', teken: lijn('M34 90V40H82') + lijn('M64 24L84 40L64 56') },
  { id: 'sp-niet', vorm: 'een kruis', naam: 'Niet doorgaan', teken: lijn('M18 18L82 82M82 18L18 82') },
  { id: 'sp-einde', vorm: 'twee cirkels in elkaar', naam: 'Einde van het spoor', teken: cirkel(50, 50, 36) + cirkel(50, 50, 14) },
  { id: 'sp-thuis', vorm: 'zeven cirkels in een ring met één in het midden', naam: 'Einde van het spoor', teken: Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * 2 * Math.PI; return cirkel(r(50 + 32 * Math.sin(a)), r(50 - 32 * Math.cos(a)), 8);
  }).join('') + cirkel(50, 50, 8) },
  { id: 'sp-begin', vorm: 'drie cirkels, van groot naar klein', naam: 'Begin van het spoor (naar de kleinste cirkel)', teken: cirkel(24, 50, 16) + cirkel(56, 50, 11) + cirkel(80, 50, 6) },
  { id: 'sp-dwaal', vorm: 'een zigzag die omkeert en terug wijst', naam: 'Dwaalspoor: vals spoor', teken: lijn('M26 92L42 72L26 52L42 32Q50 12 64 20Q72 26 70 40') + pijl(70, 40, 70, 80, { punt: 18 }) },
  { id: 'sp-splitsen', vorm: 'een pijl die zich splitst, met drie streepjes links en twee rechts', naam: 'We splitsen: drie naar links, twee naar rechts', teken: lijn('M50 92V54') + pijl(50, 54, 22, 22, { punt: 16, open: true }) + pijl(50, 54, 78, 22, { punt: 16, open: true }) + tkst(24, 68, 'III', 18) + tkst(76, 68, 'II', 18) },
  { id: 'sp-verstopt', vorm: 'een vierkant met een 3 en een pijl', naam: 'Drie passen verder ligt iets verstopt', teken: lijn('M8 32h36v36h-36z') + tkst(26, 50, '3') + pijl(44, 50, 92, 50, { punt: 16 }) },
  { id: 'sp-verstopt-hoog', vorm: 'een rechthoek met een schuine streep, drie en twee streepjes, en een pijl', naam: 'Drie meter verder en twee meter hoog zit iets verstopt', teken: lijn('M8 26h44v48h-44zM8 74L52 26') + tkst(21, 38, 'III', 13) + tkst(40, 62, 'II', 13) + pijl(52, 50, 94, 50, { punt: 15 }) },
  { id: 'sp-binnen30', vorm: 'een cirkel met 30 erin', naam: 'Binnen 30 meter is iets verstopt', teken: cirkel(50, 50, 36) + tkst(50, 51, '30', 26) },
  { id: 'sp-gevaar', vorm: 'een driehoek', naam: 'Gevaar', teken: lijn('M50 14L88 84H12Z') },
  { id: 'sp-hindernis', vorm: 'een pijl met twee schuine dwarsstrepen', naam: 'Hindernis: eroverheen', teken: pijl(50, 92, 50, 10, { punt: 20 }) + lijn('M30 64L70 48M30 50L70 34') },
  { id: 'sp-kamp-bewoond', vorm: 'een driehoek met een kleine driehoek erin, en een pijl', naam: 'Bewoond kamp, die kant op', teken: lijn('M30 22L56 72H4Z') + lijn('M30 46L42 72H18Z') + pijl(62, 50, 96, 50, { punt: 13 }) },
  { id: 'sp-kamp-leeg', vorm: 'een lege driehoek en een pijl', naam: 'Leeg kamp, die kant op', teken: lijn('M30 22L56 72H4Z') + pijl(62, 50, 96, 50, { punt: 13 }) },
  { id: 'sp-water', vorm: 'een cirkel met golfjes en een pijl', naam: 'Drinkbaar water, die kant op', teken: cirkel(32, 50, 26) + lijn('M14 44q6 -6 12 0t12 0t12 0M14 56q6 -6 12 0t12 0t12 0') + pijl(62, 50, 96, 50, { punt: 13 }) },
  { id: 'sp-water-niet', vorm: 'een cirkel met golfjes, doorgestreept, en een pijl', naam: 'Water niet drinken', teken: cirkel(32, 50, 26) + lijn('M14 44q6 -6 12 0t12 0t12 0M14 56q6 -6 12 0t12 0t12 0') + lijn('M10 78L56 22', 'tk-krijt tk-rood-krijt') + pijl(62, 50, 96, 50, { punt: 13 }) },
  { id: 'sp-vriend', vorm: 'drie punthaken naar rechts', naam: 'Vriendschap', teken: lijn('M14 30L34 50L14 70M40 30L60 50L40 70M66 30L86 50L66 70') },
  { id: 'sp-vijand', vorm: 'twee punthaken met de punten naar buiten', naam: 'Vijandschap', teken: lijn('M40 28L18 50L40 72M60 28L82 50L60 72') },
];

// -- natural signs: grass, stones, sticks and matches; the arrow under each shows the way to walk
export const NATUUR = [
  { id: 'nt-grasdot', vorm: 'een plukje gras, aan de punten samengeknoopt en neergelegd', naam: 'Deze weg: geknoopte grasdot, de punten wijzen', teken: grasdot(50, 78, 0, 1.6) },
  { id: 'nt-stenen-weg', vorm: 'twee stenen op elkaar met een kleine steen ernaast', naam: 'Deze weg: twee stenen op elkaar, een kleine ernaast', teken: steen(44, 62, 24, 17) + steen(42, 46, 15, 11) + steen(82, 64, 9, 7) },
  { id: 'nt-stenen-stop', vorm: 'drie stenen op elkaar gestapeld', naam: 'Niet doorgaan: drie stenen op elkaar', teken: steen(50, 72, 26, 14) + steen(50, 52, 19, 11) + steen(50, 36, 12, 8) },
  { id: 'nt-tak', vorm: 'een tak schuin in de grond', naam: 'Deze weg: tak schuin in de grond, zonder steuntakken', teken: lijn('M8 82H92', 'tk-grond') + tak(26, 82, 80, 26) },
  { id: 'nt-tak-afstand', vorm: 'een schuine tak met twee steuntakken eronder', naam: 'Deze weg, twee keer de afgesproken afstand: tak met twee steuntakken', teken: lijn('M8 82H92', 'tk-grond') + tak(22, 82, 78, 24) + tak(56, 82, 50, 54) + tak(70, 82, 62, 42) },
  { id: 'nt-stop-gras', vorm: 'drie grasplukjes dwars over het pad', naam: 'Niet doorgaan: drie grasdotjes dwars op de weg', teken: lijn('M24 10V90M76 10V90', 'tk-grond') + [24, 50, 76].map((y) => grasdot(34, y, 90, 0.85)).join('') },
  { id: 'nt-lucifer', vorm: 'een lucifer in de schors van een boom', naam: 'Deze weg: lucifer in de schors, het kopje wijst', teken: `<rect x="18" y="8" width="64" height="84" rx="10" class="tk-schors"/>`
    + lijn('M30 20v26M44 30v30M58 16v20M70 50v30M36 62v22', 'tk-schorslijn') + `<path d="M28 58L70 40" class="tk-lucifer"/><circle cx="72" cy="39" r="5" class="tk-kopje"/>` },
];

// -- waymarks on a post: a LAW (white over red) or a streekpad (yellow over red)
function paal(binnen) {
  return `<rect x="20" y="0" width="60" height="100" class="tk-paal"/><path d="M20 0V100M80 0V100" class="tk-paalrand"/>${binnen}`;
}
const streep = (y, kleur) => `<rect x="30" y="${y}" width="40" height="11" class="tk-${kleur}"/>`;
function markering(boven, soort) {
  if (soort === 'rechtdoor') return paal(streep(36, boven) + streep(50, 'rood'));
  if (soort === 'aankondiging') return paal(streep(18, boven) + streep(32, 'rood') + streep(56, boven) + streep(70, 'rood'));
  // two bars crossing in the middle of the post: the colour of the route over red
  if (soort === 'kruis') return paal(`<g transform="rotate(45 50 50)">${streep(44.5, boven)}</g><g transform="rotate(-45 50 50)">${streep(44.5, 'rood')}</g>`);
  const z = soort === 'links' ? -1 : 1;
  const x = (n) => 50 + z * n;
  // an arrow in the colours of the route: the upper half white or yellow, the lower half red
  return paal(`<path d="M${x(-22)} 37H${x(8)}V30L${x(24)} 47H${x(-22)}Z" class="tk-${boven}"/><path d="M${x(-22)} 47H${x(24)}L${x(8)} 64V57H${x(-22)}Z" class="tk-rood"/>`);
}
export const MARKERING = (route = 'law') => {
  const boven = route === 'law' ? 'wit' : 'geel';
  const kleur = boven;
  return [
    { id: `${route}-rechtdoor`, vorm: `twee strepen boven elkaar, ${kleur} boven rood`, naam: 'Goede weg, ga zo door', teken: markering(boven, 'rechtdoor') },
    { id: `${route}-links`, vorm: `een pijl naar links, ${kleur} en rood`, naam: 'Hier linksaf', teken: markering(boven, 'links') },
    { id: `${route}-rechts`, vorm: `een pijl naar rechts, ${kleur} en rood`, naam: 'Hier rechtsaf', teken: markering(boven, 'rechts') },
    { id: `${route}-aankondiging`, vorm: 'het gewone teken twee keer boven elkaar', naam: 'Let op: er komt een afslag', teken: markering(boven, 'aankondiging') },
    { id: `${route}-kruis`, vorm: `een kruis van een ${boven === 'wit' ? 'witte' : 'gele'} en een rode streep`, naam: 'Verkeerde weg, niet deze kant op', teken: markering(boven, 'kruis') },
  ];
};

/** One sign as a whole SVG, for a tile. */
export const tegel = (teken, label = '') =>
  `<svg class="tk" viewBox="0 0 100 100" role="img"${label ? ` aria-label="${label}"` : ' aria-hidden="true"'} xmlns="http://www.w3.org/2000/svg">${teken}</svg>`;
