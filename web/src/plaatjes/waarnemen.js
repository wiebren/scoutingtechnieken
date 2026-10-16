// Drawings for waarnemen. See ../plaatjes.js and ./basis.js. Colours come from the .plaatje classes in style.css and
// the wn- classes in ./waarnemen.css.
import { r1, svg, tekst } from './basis.js';

/** A double-headed measuring arrow from x1,y1 to x2,y2 with a label in the middle (dx, dy moves the label). */
function maat(x1, y1, x2, y2, label, { dx = 0, dy = -5, maat: m = 10 } = {}) {
  const hoek = Math.atan2(y2 - y1, x2 - x1);
  const punt = (x, y, a) => {
    const [ax, ay] = [x + 6 * Math.cos(a + 0.45), y + 6 * Math.sin(a + 0.45)];
    const [bx, by] = [x + 6 * Math.cos(a - 0.45), y + 6 * Math.sin(a - 0.45)];
    return `M${r1(ax)} ${r1(ay)} L${x} ${y} L${r1(bx)} ${r1(by)}`;
  };
  return `<path d="M${x1} ${y1} L${x2} ${y2} ${punt(x1, y1, hoek)} ${punt(x2, y2, hoek + Math.PI)}" class="lijn rood-lijn"/>`
    + tekst(r1((x1 + x2) / 2 + dx), r1((y1 + y2) / 2 + dy), label, { maat: m, klasse: 'rood-tekst vet' });
}

/** A footprint pointing up around 0,0 (as in the piece spoorlezen), as a string; links mirrors it. */
function voet(x, y, draai, links, teen, hiel) {
  return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${draai}) scale(${links ? -1 : 1} 1)">`
    + '<path d="M-5 -14 Q-7 -20 -3 -23 Q3 -25 6 -19 Q7 -10 5 -4 Q4 4 4 9 Q3 15 -1 15 Q-5 15 -5 9 Q-5 2 -6 -4 Q-6 -10 -5 -14Z" class="wn-voet"/>'
    + `<ellipse cx="0.5" cy="-16" rx="5" ry="6" class="wn-diep" fill-opacity="${teen}"/><ellipse cx="-0.5" cy="9.5" rx="4" ry="4.5" class="wn-diep" fill-opacity="${hiel}"/>`
    + [-4, -1, 2, 5].map((tx, i) => `<circle cx="${r1(tx * 0.9)}" cy="${r1(-25 + Math.abs(i - 1.5) * 1.2)}" r="1.4" class="wn-teen"/>`).join('')
    + '</g>';
}

export default {
  lichaamsmaten: () => {
    // a hand with the span, a forearm with the el, and a figure with arms spread
    const hand = '<path d="M40 150 Q30 120 34 96 Q36 86 44 92 L50 118 L52 70 Q54 60 62 64 L64 112 L68 58 Q72 50 79 56 L78 112 L86 66 Q92 60 97 68 L92 120 L104 92 Q112 84 115 94 L102 140 Q96 160 80 166 Q56 170 40 150Z" class="wn-huid"/>';
    const handMaat = maat(30, 110, 113, 92, 'span', { dx: -50, dy: 4 });
    const duim = maat(98, 105, 112, 105, 'duim', { dx: 24, dy: 4, maat: 9 });
    const arm = '<path d="M150 70 Q156 64 164 70 L172 150 Q174 160 166 164 L160 166 Q150 166 150 156 Z" class="wn-huid"/><circle cx="158" cy="64" r="9" class="wn-huid"/>';
    const armMaat = maat(182, 60, 182, 160, 'el', { dx: 10, dy: 3 });
    const cx = 268;
    const pop = `<circle cx="${cx}" cy="58" r="11" class="wn-huid"/>`
      + `<path d="M${cx} 70 V128 M${cx} 128 L${cx - 12} 178 M${cx} 128 L${cx + 12} 178 M${cx - 62} 84 H${cx + 62}" class="lijn dik"/>`;
    const span = maat(cx - 62, 98, cx + 62, 98, 'spanwijdte', { dx: 36, dy: 13 });
    const lengte = maat(cx + 82, 46, cx + 82, 178, 'lengte', { dx: -5, dy: 34 }).replace('text-anchor="middle"', 'text-anchor="end"');
    return svg(380, 200, 'Je eigen maten: de span van je hand, de breedte van je duim, de el van elleboog tot pols, en je spanwijdte, die ongeveer even lang is als jijzelf',
      hand + handMaat + duim + arm + armMaat + pop + span + lengte
      + tekst(cx, 196, 'spanwijdte ≈ lengte', { maat: 10, klasse: 'stil' }));
  },

  napoleonmethode: () => {
    const persoon = (x, kijkt) => `<circle cx="${x}" cy="62" r="8" class="vol"/><path d="M${x} 70 V108 M${x} 108 L${x - 7} 140 M${x} 108 L${x + 7} 140 M${x} 78 L${x + 9 * kijkt} 66 L${x + 3 * kijkt} 57" class="lijn dik"/>`
      + `<path d="M${x - 2 * kijkt} 56 L${x + 12 * kijkt} 56" class="lijn dik accent-lijn"/>`;
    // 1: across the water
    let a = '<rect x="0" y="0" width="185" height="150" class="wn-lucht"/>'
      + '<path d="M0 140 H40 L44 146 H150 L154 140 H185 V150 H0Z" class="wn-oever"/><path d="M44 146 H150 L150 150 H44Z" class="wn-water"/>'
      + persoon(28, 1)
      + '<path d="M38 59 L152 141" class="lijn dun accent-lijn" stroke-dasharray="4 3"/>'
      + maat(44, 132, 152, 132, 'breedte', { dy: -5 })
      + tekst(92, 20, '1. Rand van je hand op de overkant', { maat: 10.5 });
    // 2: a quarter turn, the same line now lands on your own side
    let b = '<rect x="195" y="0" width="185" height="150" class="wn-lucht"/>'
      + '<path d="M195 140 H380 V150 H195Z" class="wn-oever"/>'
      + persoon(223, 1)
      + '<path d="M233 59 L347 141" class="lijn dun accent-lijn" stroke-dasharray="4 3"/>'
      + '<path d="M347 134 v12" class="lijn dik rood-lijn"/>'
      + maat(223, 132, 347, 132, 'even ver', { dy: -5 })
      + tekst(287, 20, '2. Kwartslag gedraaid: tel je passen', { maat: 10.5 });
    return svg(380, 150, 'De Napoleonmethode: met je hand tegen je voorhoofd kijk je naar de overkant. Draai je een kwartslag, dan wijst dezelfde lijn een punt aan op jouw kant dat even ver is', a + b);
  },

  situatieschets: () => {
    let d = '<rect x="0" y="0" width="380" height="260" class="vlak2"/>';
    // roads, a bit wobbly as drawn by hand
    d += '<path d="M20 230 Q120 226 200 230 T360 228" class="wn-weg"/>';                 // the main road at the station
    d += '<path d="M200 230 Q198 170 204 120 Q208 80 200 30" class="wn-weg"/>';          // north from the station
    d += '<path d="M204 120 Q260 116 300 122 Q330 126 350 110" class="wn-weg"/>';        // to the right at the church
    d += '<path d="M300 122 Q304 90 320 64" class="wn-weg wn-pad"/>';                    // the path to the camp
    d += '<path d="M130 176 Q170 170 204 172" class="wn-weg"/>';                         // a side road, not taken
    d += '<path d="M232 90 Q240 140 236 200 Q234 230 250 258" class="wn-beek"/>';        // a beek with a bridge
    // the route
    d += '<path d="M200 228 Q198 170 204 120 Q260 116 300 122 Q304 90 318 66" class="wn-route"/>';
    // landmarks
    d += '<rect x="170" y="234" width="40" height="16" class="vlak lijn"/>' + tekst(190, 246, 'station', { maat: 9 });
    d += '<path d="M176 124 v-16 h10 v16 z M181 108 v-10 M177 102 h8" class="lijn"/>' + tekst(166, 120, 'kerk', { maat: 9, anker: 'end' });
    d += '<path d="M226 112 h16 M226 126 h16" class="lijn dik"/>' + tekst(250, 108, 'brug', { maat: 9, anker: 'start' });
    d += '<path d="M292 140 v-12 M286 128 h12" class="lijn"/>' + tekst(300, 150, 'wegwijzer 12345', { maat: 8.5, anker: 'start' });
    d += '<rect x="304" y="34" width="56" height="30" rx="4" class="accent-licht"/>' + tekst(332, 47, 'kamp-', { maat: 9, klasse: 'vet' }) + tekst(332, 58, 'terrein', { maat: 9, klasse: 'vet' });
    // notes
    d += tekst(40, 196, 'uit het station', { maat: 9, anker: 'start', klasse: 'stil' }) + tekst(40, 207, 'rechtdoor naar het noorden', { maat: 9, anker: 'start', klasse: 'stil' });
    d += tekst(110, 90, 'bij de kerk rechts', { maat: 9, klasse: 'stil' });
    d += tekst(268, 82, 'na 300 m links', { maat: 9, klasse: 'stil' }) + tekst(268, 93, 'het zandpad op', { maat: 9, klasse: 'stil' });
    // north arrow
    d += '<path d="M40 50 L48 26 L56 50 L48 44Z" class="vol"/>' + tekst(48, 20, 'N', { maat: 12, klasse: 'vet' });
    return svg(380, 260, 'Een situatieschets van het station naar het kampterrein: de wegen die je neemt, de afslagen, en de kerk, de brug en een wegwijzer als herkenningspunten, met een noordpijl', d);
  },

  routeschets: () => {
    const kol = [[0, 42, 'Tijd'], [42, 108, 'Beschrijving'], [108, 150, 'Afstand'], [150, 192, 'Totaal'], [192, 236, 'Richting'], [236, 380, 'Tekening']];
    let d = '<rect x="0" y="0" width="380" height="290" class="vlak"/>';
    d += '<rect x="0.5" y="0.5" width="379" height="34" class="vlak2 lijn dun"/>';
    d += tekst(8, 14, 'Start: RD 155.20 – 463.10   Door: Sam   Datum: 4-5   Kompas: Recta, oost-om   Schaal: 1:10.000', { maat: 7.6, anker: 'start' });
    d += tekst(8, 27, 'Lees van onder naar boven', { maat: 7.6, anker: 'start', klasse: 'stil' });
    d += '<rect x="0.5" y="34.5" width="379" height="18" class="vlak2 lijn dun"/>';
    for (const [a, b, n] of kol) {
      d += tekst(r1((a + b) / 2), 47, n, { maat: 8.5, klasse: 'vet' });
      if (a) d += `<path d="M${a + 0.5} 34 V290" class="lijn dun"/>`;
    }
    d += '<rect x="0.5" y="0.5" width="379" height="289" class="lijn dun"/><path d="M0 170.5 H380" class="lijn dik"/>';
    // row 1 (bottom): start, walking up
    const r1rij = [
      [280, '10:05', 'start bij paal', '0', '0', '12°'],
      [230, '', 'bruggetje', '350', '350', '—'],
      [190, '10:20', 'wegwijzer 4521', '450', '800', '84°'],
    ];
    const r2rij = [
      [158, '10:20', 'verder', '0', '800', '84°'],
      [110, '', 'bosrand, regen', '300', '1100', '355°'],
      [64, '10:40', 'kapel', '500', '1600', '—'],
    ];
    for (const [y, t, b, a, tot, r] of [...r1rij, ...r2rij]) {
      d += tekst(21, y, t, { maat: 8 }) + tekst(75, y, b, { maat: 7.6 }) + tekst(129, y, a, { maat: 8 }) + tekst(171, y, tot, { maat: 8 }) + tekst(214, y, r, { maat: 8 });
    }
    // the drawing: row 1 goes up and then to the right, off the paper; row 2 carries on
    d += '<path d="M262 280 L268 232 L270 196 Q300 190 368 186" class="wn-route"/><circle cx="262" cy="280" r="3" class="accent"/>';
    d += '<path d="M262 236 h14 M262 229 h14" class="lijn dun"/>';
    d += '<path d="M248 162 Q300 160 330 158 L334 112 L330 70" class="wn-route"/><rect x="324" y="58" width="12" height="10" class="vol"/>';
    d += '<path d="M336 112 Q350 100 372 106" class="lijn dun stil" stroke-dasharray="3 3"/>';
    d += '<path d="M362 270 l5 -14 l5 14 l-5 -4z" class="vol"/>' + tekst(367, 252, 'N', { maat: 8, klasse: 'vet' });
    return svg(380, 290, 'Een routeschetsformulier: een kop met startpunt, maker, datum, kompas en schaal, en zes kolommen: tijd, beschrijving, afstand, totale afstand, kompasrichting en de tekening van de route. Twee rijen, van onder naar boven gelezen', d);
  },

  voetsporen: () => {
    const sporen = [
      ['lopen', 'gewone stappen, hele voet', 48, 8, 0.5, 0.5, 0],
      ['rennen', 'lange stappen, diepe tenen', 82, 4, 0.95, 0.2, 0],
      ['achteruit', 'korte stappen, tenen naar binnen, diepe hielen', 30, -11, 0.3, 0.95, 180],
    ];
    let d = '<rect x="0" y="0" width="380" height="238" rx="6" class="wn-zand"/>';
    sporen.forEach(([naam, uitleg, pas, hoek, teen, hiel, om], k) => {
      const x = 65 + k * 125;
      const n = Math.floor(175 / pas) + 1;
      for (let i = 0; i < n; i++) {
        const y = 200 - i * pas; const links = i % 2 === 0;
        d += voet(x + (links ? -7 : 7) * (om ? -1 : 1), y, om + (links ? -hoek : hoek), links, teen, hiel);
        if (naam === 'rennen') d += [[-6, 26], [3, 30], [8, 24]].map(([sx, sy]) => `<circle cx="${r1(x + (links ? -7 : 7) + sx)}" cy="${r1(y + sy)}" r="1.3" class="wn-korrel"/>`).join('');
      }
      d += `<path d="M${x + 30} 200 V150 M${x + 25} 158 L${x + 30} 148 L${x + 35} 158" class="lijn dik accent-lijn"/>`;
      d += tekst(x, 252, naam, { maat: 12, klasse: 'vet' }) + tekst(x, 265, uitleg.length > 26 ? uitleg.slice(0, uitleg.indexOf(',')) : uitleg, { maat: 8.5, klasse: 'stil' });
    });
    return svg(380, 270, 'Drie sporen die alle drie naar boven gaan. Lopen: gewone stappen, de hele voet even diep. Rennen: lange stappen, diepe tenen, opgeschopt zand. Achteruit: korte stappen, de tenen wijzen naar beneden en naar binnen, diepe hielen', d);
  },
  'schetsen-rooster': () => {
    // the Winterhike grid: what you draw (columns) by how much detail (rows), each with a tiny example
    const kol = ['gebouw', 'van bovenaf', 'landschap'];
    const rij = ['weinig', 'middel', 'veel'];
    const [X0, Y0, W, H] = [56, 24, 108, 74];
    const huis = (vul) => `<path d="M24 44 V22 L45 8 L66 22 V44 Z" class="${vul}"/>`;
    const ramen = '<path d="M30 26 h8 v7 h-8z M52 26 h8 v7 h-8z M41 32 h8 v12 h-8z" class="lijn dun"/>';
    const skyline = 'M4 34 L14 30 L18 22 L22 30 L34 28 L38 14 L40 4 L42 14 L46 28 L62 26 L66 20 L72 26 L86 30';
    const vb = {
      'gebouw-weinig': huis('vol'),
      'gebouw-middel': huis('vlak lijn') + ramen,
      'gebouw-veel': huis('vlak lijn') + ramen + '<path d="M24 44 V22 L45 8 L45 44 Z" class="vol-licht" opacity="0.6"/><circle cx="76" cy="36" r="3" class="vol"/><path d="M76 39 v6" class="lijn"/><path d="M70 12 q4 -6 10 -2 q6 -2 6 4 h-16z" class="vol-licht"/>',
      'van bovenaf-weinig': '<path d="M6 40 H84 M44 40 V6" class="lijn dik stil"/><path d="M44 38 V10" class="lijn rood-lijn" stroke-dasharray="4 3"/><path d="M50 22 h6 M53 19 v6" class="lijn"/>',
      'van bovenaf-middel': '<rect x="10" y="10" width="26" height="18" class="vlak lijn"/><rect x="44" y="18" width="20" height="24" class="vlak lijn"/><path d="M76 20 l4 -12 l4 12 l-4 -3z" class="vol"/><path d="M10 40 h20 M10 37 v6 M30 37 v6" class="lijn dun"/>',
      'van bovenaf-veel': '<rect x="10" y="10" width="26" height="18" class="rood" opacity="0.55"/><rect x="44" y="18" width="20" height="24" class="vol-licht"/><path d="M4 44 Q40 30 86 38" class="lijn blauw-lijn" stroke-width="4"/><circle cx="74" cy="12" r="6" class="accent-licht"/><circle cx="20" cy="38" r="4" class="accent-licht"/>',
      'landschap-weinig': `<path d="${skyline} V44 H4 Z" class="vol"/><path d="M4 44 H86" class="lijn"/>`,
      'landschap-middel': `<path d="${skyline}" class="lijn"/><path d="M4 44 H86 M30 44 L40 30 M50 44 L42 30 M58 40 h20 M60 36 v8 M68 36 v8 M76 36 v8" class="lijn dun"/>`,
      'landschap-veel': `<path d="${skyline} V44 H4 Z" class="accent-licht" opacity="0.5"/><path d="${skyline}" class="lijn"/><path d="M4 44 H86 M30 44 L40 30 M50 44 L42 30" class="lijn dun"/><path d="M10 10 q4 -6 10 -2 q6 -2 6 4 h-16z" class="vol-licht"/><ellipse cx="66" cy="40" rx="5" ry="3" class="vol"/><ellipse cx="78" cy="41" rx="5" ry="3" class="vol"/>`,
    };
    const namen = {
      'gebouw-weinig': 'contourschets', 'gebouw-middel': 'aangezichtsschets', 'gebouw-veel': 'fotoschets',
      'van bovenaf-weinig': 'situatieschets', 'van bovenaf-middel': 'plattegrond', 'van bovenaf-veel': 'luchtfotoschets',
      'landschap-weinig': 'horizonschets', 'landschap-middel': 'recognografisch', 'landschap-veel': 'panoramaschets',
    };
    let d = '';
    kol.forEach((k, i) => { d += tekst(X0 + i * W + W / 2, 15, k, { maat: 10.5, klasse: 'vet' }); });
    rij.forEach((r, j) => {
      d += tekst(X0 - 6, Y0 + j * H + H / 2 + 4, r, { maat: 10, anker: 'end', klasse: 'stil' });
      kol.forEach((k, i) => {
        const [x, y] = [X0 + i * W, Y0 + j * H];
        d += `<rect x="${x + 2}" y="${y + 2}" width="${W - 4}" height="${H - 4}" rx="6" class="vlak2"/>`;
        d += `<g transform="translate(${x + 9} ${y + 6})">${vb[`${k}-${r}`]}</g>`;
        d += tekst(x + W / 2, y + H - 9, namen[`${k}-${r}`], { maat: 9.5 });
      });
    });
    return svg(380, 250, 'Soorten schetsen in een rooster: een gebouw, van bovenaf of een landschap, met weinig, middel of veel detail. Bijvoorbeeld een contourschets, een situatieschets en een horizonschets met weinig detail, en een fotoschets, luchtfotoschets en panoramaschets met veel', d);
  },

  'spoor-ouderdom': () => {
    // one big footprint with the clues that tell its age
    let d = '<rect x="0" y="0" width="380" height="230" rx="6" class="wn-zand"/>';
    d += `<g transform="translate(110 118) scale(3.6)">${voet(0, 0, 0, false, 0.45, 0.45).replace(/^<g transform="[^"]*">/, '<g>')}</g>`;
    // raindrops in the toe area
    for (const [x, y] of [[100, 70], [116, 62], [108, 88], [124, 82], [96, 100]]) d += `<circle cx="${x}" cy="${y}" r="2.6" class="wn-druppel"/>`;
    // a leaf blown into the middle
    d += '<path d="M104 126 Q116 112 128 122 Q118 136 104 126Z" class="wn-blaadje"/><path d="M104 126 L126 122" class="lijn dun wn-zandlijn"/>';
    // a tyre track over the heel
    d += '<path d="M40 168 L230 118 L236 138 L46 188 Z" class="wn-band"/>';
    for (let i = 0; i < 12; i++) { const x = 52 + i * 15; const y = 183 - i * 3.95; d += `<path d="M${r1(x)} ${r1(y)} l4 -10 l4 10" class="wn-profiel"/>`; }
    // labels
    const label = (x1, y1, x2, y2, regels) => `<path d="M${x1} ${y1} L${x2 - 4} ${y2 - 4}" class="lijn dun wn-zandlijn"/>`
      + regels.map((r, i) => tekst(x2, y2 + i * 12, r, { maat: 10, anker: 'start', klasse: i ? 'wn-op-zand' : 'vet wn-op-zand' })).join('');
    d += label(126, 72, 220, 40, ['regendruppels in de afdruk:', 'het spoor is van vóór de bui']);
    d += label(128, 122, 220, 100, ['een blaadje erin:', 'het heeft gewaaid sinds']);
    d += label(200, 136, 240, 192, ['een fietsband eroverheen:', 'die fiets kwam later']);
    return svg(380, 230, 'Een voetafdruk in het zand. Er zitten regendruppels in, dus het spoor is van voor de bui. Er ligt een blaadje in, dus het heeft gewaaid sinds. Een fietsband loopt eroverheen, dus die fiets kwam later', d);
  },

  'spoor-kwijt': () => {
    // the track stops: from the last print, search in an arc ahead until you find it again
    let d = '<rect x="0" y="0" width="380" height="220" rx="6" class="wn-zand"/>';
    d += '<path d="M120 0 Q150 120 110 220 M250 0 Q220 110 270 220" class="wn-gras-rand"/>';
    const prenten = [[190, 206], [176, 186], [190, 166], [176, 146], [190, 126]];
    prenten.forEach(([x, y], i) => { d += voet(x, y, 0, i % 2 === 0, 0.5, 0.5).replace('rotate(0)', 'rotate(0) scale(0.75)'); });
    d += '<circle cx="190" cy="126" r="18" class="lijn wn-zoek"/>';
    d += '<path d="M130 112 A60 60 0 0 1 250 112" class="lijn wn-zoek" stroke-dasharray="6 4"/><path d="M244 104 l6 8 l3 -10" class="lijn wn-zoek"/>';
    d += voet(206, 52, 12, false, 0.5, 0.5).replace('rotate(12)', 'rotate(12) scale(0.75)') + voet(194, 30, 12, true, 0.5, 0.5).replace('rotate(12)', 'rotate(12) scale(0.75)');
    d += '<circle cx="200" cy="42" r="24" class="lijn wn-zoek"/>';
    d += tekst(214, 140, 'laatste afdruk', { maat: 10, anker: 'start', klasse: 'vet wn-op-zand' });
    d += tekst(262, 96, 'loop in een boog', { maat: 10, anker: 'start', klasse: 'vet wn-op-zand' }) + tekst(262, 108, 'vooruit', { maat: 10, anker: 'start', klasse: 'vet wn-op-zand' });
    d += tekst(230, 30, 'weer gevonden', { maat: 10, anker: 'start', klasse: 'vet wn-op-zand' });
    d += tekst(20, 200, 'zandpad', { maat: 9.5, anker: 'start', klasse: 'wn-op-zand' });
    return svg(380, 220, 'Een spoor in het zand houdt op. Vanaf de laatste afdruk loop je in een boog vooruit, tot je het spoor verderop weer vindt', d);
  },
};
