// Wegen and wegeninformatie, drawn again from the Kadaster legenda TOP25raster (CC BY 4.0). See ./index.js.
// One unit is about 1.2 px of the legenda, so a road of 3.5 px there is 3 units here.
const RAND = '#222';
const ROOD = '#f4342d';
const BLAUW = '#0097d3';
const LETTER = 'font-family="Arial,Helvetica,sans-serif" text-anchor="middle"';

/** A band across the full width, centred on y = c. */
const band = (c, d, kleur, x = 0, w = 64) => `<rect x="${x}" y="${c - d / 2}" width="${w}" height="${d}" fill="${kleur}"/>`;
/** A road with one carriageway: a casing with the fill inside. */
const weg = (vul, rand = RAND, d = 3.2, binnen = 1.9, c = 12) => band(c, d, rand) + band(c, binnen, vul);
/** A road with separate carriageways: two lanes with a line of the casing colour between them. */
const gescheiden = (vul, c = 12) => band(c, 5.6, RAND) + band(c - 1.3, 1.9, vul) + band(c + 1.3, 1.9, vul);
/** The canal of the bridge pictures, running from top to bottom between x1 and x2. */
const vaart = (x1, x2, h) => `<rect x="${x1}" y="-1" width="${x2 - x1}" height="${h + 2}" fill="#addaf0" stroke="#1ea8da" stroke-width="0.8"/>`;
/** A road on a bridge over the canal: black casing and a grey shadow over the water. */
const brug = (c) => weg(ROOD, RAND, 3.2, 1.9, c) + band(c, 5, '#6f8e9b', 21.9, 21.9) + band(c, 3.6, '#111', 21.9, 21.9) + band(c, 1.9, ROOD, 21.9, 21.9);
/** A road number in its coloured box. */
const nummer = (tekst, vul, inkt, w = 24, rand = '#333') =>
  `<rect x="${32 - w / 2}" y="6" width="${w}" height="12" fill="${vul}" stroke="${rand}" stroke-width="0.7"/>` +
  `<text x="32" y="15.4" ${LETTER} font-size="9.5" fill="${inkt}">${tekst}</text>`;
/** A small blue square with a white letter. */
const blauw = (tekst, w, hh, fs) =>
  `<rect x="${32 - w / 2}" y="${12 - hh / 2}" width="${w}" height="${hh}" fill="${BLAUW}"/>` +
  `<text x="32" y="${12 + fs * 0.36}" ${LETTER} font-size="${fs}" font-weight="bold" fill="#fff">${tekst}</text>`;
/** A start- / landingsbaan: a long strip with a second one at an angle on top. */
const baan = (vul, rand) =>
  `<rect x="0.4" y="14.1" width="63.2" height="4.2" fill="${vul}" stroke="${rand}" stroke-width="0.8"/>` +
  `<path d="M0.4 14.1L42.9 6.9L43.8 10.3L9.3 14.1Z" fill="${vul}" stroke="${rand}" stroke-width="0.8" stroke-linejoin="round"/>`;

export default {
  id: 'wegen', titel: 'Wegen',
  tekens: [
    { naam: 'autosnelweg', teken: gescheiden('#8862a1') },
    { naam: 'hoofdweg met gescheiden rijbanen', teken: gescheiden(ROOD) },
    { naam: 'hoofdweg', teken: weg(ROOD) },
    { naam: 'regionale weg met gescheiden rijbanen', teken: gescheiden('#fdb12a') },
    { naam: 'regionale weg', teken: weg('#fdb12a') },
    { naam: 'lokale weg met gescheiden rijbanen', teken: gescheiden('#ffff14') },
    { naam: 'lokale weg', teken: weg('#ffff14') },
    { naam: 'weg met losse of slechte verharding', teken: weg('#cbbf26') },
    { naam: 'onverharde weg', teken: weg('#cfcfcf', '#666', 3.4, 1.8) },
    { naam: 'straat/overige weg', teken: weg('#fff', '#666', 3.2, 1.4) },
    { naam: 'voetgangersgebied', teken:
      '<rect y="10" width="64" height="4" fill="#777"/><rect x="12.6" y="3.4" width="4.2" height="7.4" fill="#777"/>' +
      '<rect y="10.7" width="64" height="2.6" fill="#ffe9db"/><rect x="13.3" y="3.4" width="2.8" height="8.6" fill="#ffe9db"/>' },
    { naam: 'verhard fietspad', teken:
      band(12, 3, '#5d3d29', 0, 32.8) + band(12, 1.2, '#de9b72', 0, 32.8) +
      '<path d="M32.8 12H64" stroke="#111" stroke-width="0.9"/><path d="M34.5 12H64" stroke="#c37f56" stroke-width="0.9" stroke-dasharray="3.4 3.4"/>' },
    { naam: 'fietspad met losse of slechte verharding', teken:
      '<path d="M0 10.9H32.8M0 13.1H32.8" stroke="#666" stroke-width="0.7"/>' +
      '<path d="M4.2 12H32.8" stroke="#d9925f" stroke-width="1.5" stroke-dasharray="5.9 8.4"/>' +
      '<path d="M36 12H64" stroke="#c37f56" stroke-width="0.9" stroke-dasharray="3.4 3.8"/>' },
    { naam: 'pad, voetpad', teken: '<path d="M0 12H64" stroke="#4f4f4e" stroke-width="0.85" stroke-dasharray="3.2 1"/>' },
    { naam: 'weg in aanleg', teken: weg('#f8b99c', '#5a5a5a', 3.4, 2) },
    { naam: 'viaduct', h: 28, teken:
      // left: the road across goes over the other one, its ramps shown by ticks
      `<rect x="15.2" y="1" width="3.2" height="26" fill="#8a1712"/><rect x="15.85" y="1" width="1.9" height="26" fill="${ROOD}"/>` +
      '<path d="M3.4 11.6H14.2M19.4 11.6H31M3.4 16.4H14.2M19.4 16.4H31" stroke="#222" stroke-width="1.6" stroke-dasharray="0.6 1.1"/>' +
      weg(ROOD, RAND, 3.2, 1.9, 14) +
      // right: the other road goes over this one, the viaduct marked by a dotted outline
      '<ellipse cx="46.7" cy="14" rx="11" ry="5.9" fill="none" stroke="#222" stroke-width="0.7" stroke-dasharray="1 1.3"/>' +
      `<rect x="45.1" y="0.5" width="3.2" height="27" fill="${RAND}"/><rect x="45.75" y="0.5" width="1.9" height="27" fill="${ROOD}"/>` },
    { naam: 'aquaduct', h: 28, teken: weg(ROOD, RAND, 3.2, 1.9, 14) + vaart(24.4, 40.4, 28) },
    { naam: 'tunnel', h: 28, teken: weg(ROOD, RAND, 3.2, 1.9, 14) + vaart(24.4, 40.4, 28) +
      '<path d="M24.4 12.6H40.4M24.4 15.4H40.4" stroke="#3d4a50" stroke-width="0.7" stroke-dasharray="2.4 1.6"/>' },
    { naam: 'vaste brug', h: 28, teken: vaart(21.9, 43.8, 28) + brug(14) },
    { naam: 'beweegbare brug', h: 28, teken: vaart(21.9, 43.8, 28) + brug(14) + '<rect x="31.2" y="12.2" width="3.4" height="3.6" fill="#111"/>' },
    { naam: 'brug op pijlers', h: 28, teken: vaart(21.9, 43.8, 28) +
      '<path d="M15.2 10.6V17.4M32.8 10.6V17.4M49.6 10.6V17.4" stroke="#111" stroke-width="1.3"/>' + weg(ROOD, '#111', 3.4, 1.9, 14) },
    // wegeninformatie
    { naam: 'wegnummering: autosnelweg (A)', teken: nummer('A28', '#e85138', '#fff') },
    { naam: 'wegnummering: niet-autosnelweg (N)', teken: nummer('N34', '#fff010', '#111') },
    { naam: 'wegnummering: Europese weg (E)', teken: nummer('E35', '#008f35', '#fff') },
    { naam: 'wegnummering: stadsroute (S)', teken: nummer('S101', '#fff', '#111', 26, '#666') },
    { naam: 'parkeerplaats', teken: blauw('P', 5.4, 6.4, 6) },
    { naam: 'tankstation', teken: blauw('T', 5.4, 6.4, 6) },
    { naam: 'afritnummer', teken: blauw('3', 7, 9.6, 9) },
    { naam: 'aantal rijstroken', teken: weg(ROOD) +
      `<circle cx="32" cy="12" r="5.9" fill="#fff" stroke="#888" stroke-width="0.5"/><text x="32" y="14.7" ${LETTER} font-size="7.5" fill="#222">4</text>` },
    { naam: 'kilometerpaal', teken: weg(ROOD) + '<circle cx="32" cy="10.4" r="1.3" fill="#999"/>' },
    { naam: 'wegafsluiting', teken: weg(ROOD) + '<rect x="31.6" y="10" width="0.9" height="4" fill="#111"/>' },
    { naam: 'verharde start- / landingsbaan', teken: baan('#fff', '#555') },
    { naam: 'onverharde start- / landingsbaan', teken: baan('#e3edb3', '#759553') },
  ],
};
