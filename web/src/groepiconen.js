// Line icons for the groepen of the categories (the tiles of a category in Zoeken), in the style of src/iconen.js:
// a 24 grid, currentColor, a few plain shapes each, no emblem or logo of an organisation. A groep without an icon
// gets the icon of its category.
import { CATEGORIE } from './data/categorieen.js';
import { icoon, svgIcoon } from './iconen.js';

const VOL = 'fill="currentColor" stroke="none"';   // a filled shape: dots, the squares of a flag
const stip = (x, y, r = 1.3) => `<circle cx="${x}" cy="${y}" r="${r}" ${VOL}/>`;

export const GROEPICONEN = {
  // touw
  'touw/eindknopen': '<path d="M3.5 3.5C7 5.5 10 9 12 11.5c2 2.3 4 3 4 5a4 4 0 0 1-8 0c0-2.5 2.5-3.5 4-5 1.5-1.5 3.5-2.5 3.5-4.5a3.5 3.5 0 0 0-7 0c0 1.5.8 2.4 1.7 3.2"/><path d="M13.6 12.6c2.2 1.6 4.6 4 6.9 8.9"/>',
  'touw/lussen': '<path d="M8 2.5l2.6 3.5M13.4 9.7l3.2 4.3c.9 1.3 1.4 2.4 1.4 3.6a6 4 0 0 1-12 0c0-1.2.5-2.3 1.4-3.6L16 2.5"/>',
  'touw/steken': '<rect x="9" y="2.5" width="6" height="19" rx="1.5"/><path d="M9 9.5l6-2.5M9 15.5 15 13"/><path d="M2.5 10H9M15 12.5h6.5"/>',
  'touw/verbindingen': '<path d="M2.5 6H13a3.5 3.5 0 0 1 3.4 4.31M15.78 11.63A3.5 3.5 0 0 1 13 13H2.5"/><path d="M21.5 11H11a3.5 3.5 0 0 0-2.78 1.37M7.6 13.69A3.5 3.5 0 0 0 11 18h10.5"/>',
  'touw/klem': '<path d="M2.5 6.5h19"/><path d="M9 4v5M12 4v5M15 4v5"/><path d="M10.5 9c0 6-2 9.5 1.5 11.5 3.5-2 1.5-5.5 1.5-11.5"/>',
  'touw/beleggen': '<path d="M2.5 13c3.5 0 5-2.2 9.5-2.2s6 2.2 9.5 2.2"/><path d="M8.5 12v4.5M15.5 12v4.5M5 16.5h14"/><path d="M6 5.5l12 9M18 5.5l-12 9"/>',
  'touw/sier': '<path d="M8 20c1.5-3 4-6 6.5-9 2-2.5 3.5-3.5 5-2.5 2 1.5.5 7-4.5 9-2.5 1-4.5 1-7 0-5-2-6.5-7.5-4.5-9 1.5-1 3 0 5 2.5 2.5 3 5 6 6.5 9"/><path d="M6.5 7.5C7 4.5 9.5 3 12 3s5 1.5 5.5 4.5"/>',
  'touw/afwerken': '<path d="M9 2.5V16M15 2.5V16"/><path d="M9 9.5h6M9 12.5h6M9 15.5h6"/><path d="M10 16.5 9 21.5M12 16.5v5M14 16.5l1 5"/>',
  'touw/touwkunde': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="8.6" r="3.1"/><circle cx="9" cy="13.9" r="3.1"/><circle cx="15" cy="13.9" r="3.1"/>',
  // sjorren
  'sjorren/sjorringen': '<rect x="5" y="2.5" width="6.5" height="19" rx="3.25"/><rect x="12.5" y="2.5" width="6.5" height="19" rx="3.25"/><path d="M3.5 10.5h17M3.5 13.5h17"/>',
  'sjorren/takels': '<circle cx="12" cy="9" r="4.5"/><circle cx="12" cy="9" r="1"/><path d="M12 2.5v2"/><path d="M7.5 9v12.5M16.5 9v8"/><path d="M14 17h5v4.5h-5z"/>',
  'sjorren/verankeren': '<path d="M2.5 15.5h19"/><path d="M7 8.5l3 13"/><path d="M8 10.5 21 3"/><path d="M4.5 18.5l-1 1.5M14 18.5l-1 1.5M18.5 18.5l-1 1.5"/>',
  'sjorren/materiaal': '<circle cx="7.5" cy="16" r="4"/><circle cx="16.5" cy="16" r="4"/><circle cx="12" cy="8" r="4"/>' + stip(7.5, 16, 1) + stip(16.5, 16, 1) + stip(12, 8, 1),
  'sjorren/constructies': '<path d="M5.5 21.5 8.5 7.5M18.5 21.5l-3-14M6 7.5h12"/><path d="M7.2 14.5h9.6M7.2 14.5l9.6 7M16.8 14.5l-9.6 7"/><path d="M12 7.5V2.5l3.5 1.5L12 5.5"/>',
  'sjorren/touwbanen': '<path d="M3 4v17.5M21 4v17.5"/><path d="M3 6.5c6 4 12 4 18 0M3 15c6 4 12 4 18 0"/><path d="M8 9.2v8.3M12 10v8.3M16 9.2v8.3"/>',
  'sjorren/krachten': '<path d="M3.5 20.5h17L12 9.5z"/><path d="M12 2v5M9.6 4.8 12 7.2l2.4-2.4"/>',
  'sjorren/veilig': '<path d="M2.5 17.5h19"/><path d="M5 17.5V15a7 7 0 0 1 14 0v2.5"/><path d="M10 8.3V13M14 8.3V13"/>',
  // kaart
  'kaart/kaarten': '<path d="M6.5 6.5 11 4.5l4.5 2 4.5-2v11"/><path d="M3 9.5l4.5-2 4.5 2 4.5-2v12l-4.5 2-4.5-2L3 21.5z"/><path d="M7.5 7.5v12M12 9.5v12"/>',
  'kaart/kaartlezen': '<path d="M4 17c-1.5-3.5.5-9 5.5-11s10 0 11 4.5-2 9-7.5 9.5S5 19.5 4 17z"/><path d="M8.5 14.5c-.5-2.5 1-5 4-5.5s5 1 5 3.5-2 4-4.5 4-4-.5-4.5-2z"/>' + stip(13, 12.5, 1),
  'kaart/noorden': '<path d="M12 2.5 15.5 9h-7z"/><path d="M8.5 21v-8l7 8v-8"/>',
  'kaart/kompas': '<rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="12" cy="14" r="4.5"/><path d="M12 10.5l1.4 3.5-1.4 3.5-1.4-3.5z"/><path d="M12 5v2.5"/>',
  'kaart/coordinaten': '<path d="M4 3v17h17"/><path d="M4 9h10v11" stroke-dasharray="1.8 2.6"/>' + stip(14, 9, 2),
  'kaart/gps': '<path d="M12 21.5s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10.5" r="2.5"/>',
  'kaart/zonderkompas': '<circle cx="17.5" cy="6" r="2.5"/><path d="M17.5 1.8v.7M21.7 6h-.7M20.5 3l-.5.5M14.5 3l.5.5M20.5 9l-.5-.5"/><path d="M2.5 20.5h19M10 20.5V9"/><path d="M3.5 20.5H10" stroke-width="3"/>',
  // tocht
  'tocht/sporen': '<ellipse cx="12" cy="18.3" rx="7.5" ry="3"/><ellipse cx="12" cy="11.8" rx="5" ry="2.6"/><ellipse cx="12" cy="6.2" rx="3" ry="2.2"/>',
  'tocht/spoortekens': '<path d="M2.5 12h9M8 8.5l3.5 3.5L8 15.5"/><circle cx="17.5" cy="12" r="4"/>' + stip(17.5, 12, 1.2),
  'tocht/kruispunt': '<circle cx="12" cy="18.5" r="2.5"/><path d="M12 16v-5l6.5-6.5M18.5 4.5H14M18.5 4.5V9"/><path d="M12 11 5 5.5"/>',
  'tocht/lijn': '<rect x="7" y="2.5" width="10" height="19" rx="1"/><path d="M12 2.5v19M12 7h3M12 12H9M12 16.5h3"/>',
  'tocht/metkaart': '<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M6 16c2.5-.5 4.5-2 6-5" stroke-dasharray="1.8 2.4"/><path d="M14 7.5l3.5 3.5M17.5 7.5 14 11"/>',
  'tocht/metkompas': '<circle cx="12" cy="12" r="9"/><path d="M12 5.5l2.2 6.5-2.2 6.5-2.2-6.5z"/><path d="M10 12h4"/>',
  'tocht/rally': '<path d="M5 21.5V3"/><path d="M5 4h14v9H5"/>'
    + `<path d="M5 4h4.67v4.5H5zM14.33 4H19v4.5h-4.67zM9.67 8.5h4.66V13H9.67z" ${VOL}/>`,
  'tocht/spelregels': '<rect x="5" y="4" width="14" height="17.5" rx="1.5"/><path d="M9 2.5h6v3H9z"/><path d="M8.5 11l1.3 1.3 2.2-2.4M14 11.5h2M8.5 16l1.3 1.3 2.2-2.4M14 16.5h2"/>',
  'tocht/media': '<path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h3L9 5h6l1.5 2h3A1.5 1.5 0 0 1 21 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z"/><circle cx="12" cy="13" r="3.5"/>',
  'tocht/vormen': '<path d="M7.5 2.5c1.8 0 2.6 2.3 2.4 4.6S9 11 7.4 11 4.9 9.4 5.1 7.1 5.7 2.5 7.5 2.5z"/><path d="M5.6 13.2h3.8l-.3 1.8a1.7 1.7 0 0 1-3.2 0z"/>'
    + '<path d="M16.5 8.5c1.8 0 2.4 4.6 2.4 4.6s-.7 3.9-2.5 3.9-2.4-1.6-2.3-3.9.6-4.6 2.4-4.6z"/><path d="M14.6 19.2h3.8l-.3 1.8a1.7 1.7 0 0 1-3.2 0z"/>',
  // waarnemen
  'waarnemen/schatten': '<path d="M3 16.5 16.5 3 21 7.5 7.5 21z"/><path d="M7 12.5l2 2M9.8 9.7l1.4 1.4M12.5 7l2 2"/>',
  'waarnemen/schetsen': '<path d="M15 4l5 5L9 20H4v-5z"/><path d="M12.5 6.5l5 5"/>',
  'waarnemen/water': '<path d="M3 14.5c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 19c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/><path d="M4 7.5h16M7 4.5l-3 3 3 3M17 4.5l3 3-3 3"/>',
  'waarnemen/spoorzoeken': '<path d="M10.3 3.5C8.3 4.6 7 8.8 7 12.8s1.4 6.2 2.9 6.2 1.6-3 1.6-6.2-.6-6.2-1.2-9.3z"/><path d="M13.7 3.5c2 1.1 3.3 5.3 3.3 9.3s-1.4 6.2-2.9 6.2-1.6-3-1.6-6.2.6-6.2 1.2-9.3z"/>',
  'waarnemen/kim': '<path d="M2.5 19.5h19"/><rect x="3.5" y="10.5" width="6" height="6" rx="1"/><circle cx="16.5" cy="8.5" r="3"/><path d="M12 16.5l3-5 3 5z"/>',
  // seinen
  'seinen/morse': '<path d="M3 8h6M15 8h6M10 16h6" stroke-width="2.6"/>' + stip(12, 8, 1.6) + stip(4.5, 16, 1.6) + stip(19.5, 16, 1.6),
  'seinen/semafoor': '<circle cx="12" cy="6.5" r="2"/><path d="M12 9v6.5l-2.5 6M12 15.5l2.5 6"/><path d="M12 10.5 6 6.5M12 10.5l6-4"/>'
    + '<path d="M6 6.5 3 2.5M3 2.5l3.5.3-.8 3.2M18 6.5l3-4M21 2.5l-3.5.3.8 3.2"/>',
  'seinen/vlaggen': '<path d="M4 2.5v19"/><path d="M4 4h12v7H4M4 13h12v7H4"/>' + `<path d="M4 4h12L4 11z" ${VOL}/><path d="M10 13h6v7h-6z" ${VOL}/>`,
  'seinen/historisch': '<path d="M12 21.5V3"/><path d="M12 5.5l6.5-2.5M12 11 5.5 14"/><path d="M8 21.5h8"/><circle cx="12" cy="3" r=".9"/>',
  'seinen/nood': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M5.6 5.6l3.6 3.6M18.4 5.6l-3.6 3.6M5.6 18.4l3.6-3.6M18.4 18.4l-3.6-3.6"/>',
  'seinen/spelalfabet': '<path d="M3.5 4.5h17v11.5h-9l-4.5 4v-4H3.5z"/><path d="M7 13l2.2-6 2.2 6M7.7 11h3"/><path d="M14 8.5h3M14 11.5h3"/>',
  'seinen/gebaren': '<circle cx="14.5" cy="14" r="5.5"/><path d="M14.5 8.5H3v4h6.3"/>' + stip(14.5, 14, 1.3),
  'seinen/portofoon': '<rect x="7" y="7.5" width="10" height="14" rx="2"/><path d="M9.5 7.5v-5"/><path d="M9.5 11.5h5M9.5 14.5h5"/>',
  // geheimschrift
  'geheimschrift/vervangen': '<path d="M2.5 16 5.5 8l3 8M3.6 13.3h3.8"/><path d="M10.5 12h3.5M12.5 10l2 2-2 2"/><path d="M17 8v8h2.5a2 2 0 0 0 0-4H17h2a2 2 0 0 0 0-4z"/>',
  'geheimschrift/cijfers': '<rect x="3.5" y="3.5" width="17" height="17" rx="1"/><path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17"/>' + `<path d="M9.2 9.2h5.6v5.6H9.2z" ${VOL}/>`,
  'geheimschrift/verwisselen': '<path d="M4 7.5h15M16 4.5l3 3-3 3M20 16.5H5M8 13.5l-3 3 3 3"/>',
  'geheimschrift/verbergen': '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/><path d="M4 20 20 4"/>',
  'geheimschrift/tekens': '<path d="M3.5 3.5v6h6M14.5 3.5v6h6v-6M3.5 14.5l3 6 3-6M14.5 14.5h6v6h-6"/>' + stip(17.5, 6, 1.1) + stip(6.5, 16.7, 1.1),
  'geheimschrift/seinen': '<path d="M3 4.5h18"/><path d="M6 4.5v13M10 4.5v9M14 4.5v15M18 4.5v10"/>' + stip(6, 9, 1.6) + stip(6, 13, 1.6) + stip(10, 10, 1.6) + stip(14, 8, 1.6) + stip(14, 15, 1.6) + stip(18, 11, 1.6),
  // vuur
  'vuur/driehoek': '<path d="M12 2.5 21.5 20h-19z"/><path d="M12 17.5c-1.8 0-3-1.2-3-2.8 0-1.9 1.7-2.8 2-4.9 1.2.8 1.9 2 1.9 3.1.5-.4.8-.9.8-1.5.9.7 1.3 1.9 1.3 3.3 0 1.6-1.2 2.8-3 2.8z"/>',
  'vuur/aanmaken': '<path d="M4 20 13 11"/><circle cx="14.3" cy="9.7" r="1.9"/><path d="M17.5 8c1.2-1 1.8-2.3 1.4-4 1.5.8 2.4 2.2 2.1 3.8-.3 1.8-2 2.6-3.5 2.2"/>',
  'vuur/soorten': '<path d="M3 20.5h18M5 14.8h14"/><circle cx="6.5" cy="17.65" r="1.6"/><circle cx="17.5" cy="17.65" r="1.6"/><circle cx="8.5" cy="12" r="1.6"/><circle cx="15.5" cy="12" r="1.6"/><path d="M12 11.5c-1.8 0-3-1.2-3-2.8 0-1.9 1.7-2.8 2-4.9 1.2.8 1.9 2 1.9 3.1.5-.4.8-.9.8-1.5.9.7 1.3 1.9 1.3 3.3 0 1.6-1.2 2.8-3 2.8z"/>',
  'vuur/hout': '<path d="M7 7.5h11.5a2.5 4.5 0 0 1 0 9H7"/><ellipse cx="7" cy="12" rx="2.5" ry="4.5"/><path d="M7 11.2v1.6"/><path d="M13 7.5 15 3.5"/><path d="M11 12h5"/>',
  'vuur/doven': '<path d="M4 10h12l-1.6 11H5.6z"/><path d="M4 10c0-7 12-7 12 0"/><path d="M19.5 12.5s-1.8 2-1.8 3.3a1.8 1.8 0 0 0 3.6 0c0-1.3-1.8-3.3-1.8-3.3z"/>',
  'vuur/regels': '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/><path d="M12 17c-2 0-3.3-1.3-3.3-3 0-2 1.8-3 2.2-5.2 1.3.9 2 2.2 2 3.3.5-.4.9-1 .9-1.6 1 .8 1.5 2 1.5 3.5 0 1.7-1.3 3-3.3 3z"/>',
  // koken
  'koken/houtvuur': '<path d="M4 21.5V4M20 21.5V4M2.5 5.5h19"/><path d="M12 5.5v3"/><path d="M8 8.5h8v2a4 3.5 0 0 1-8 0z"/><path d="M10 21.5c-1-1.6 0-3.2 2-4.7 2 1.5 3 3.1 2 4.7"/>',
  'koken/branders': '<rect x="7" y="13.5" width="10" height="8" rx="2"/><path d="M10 13.5v-2h4v2M5.5 9.5h13"/><path d="M9 6.5V5M12 6.5V3.5M15 6.5V5"/>',
  'koken/ovens': '<path d="M4 11h16v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M3.5 11c0-2 3.5-3.2 8.5-3.2s8.5 1.2 8.5 3.2"/><path d="M10.5 7.8V6h3v1.8M7 20v1.5M17 20v1.5"/>' + stip(6.5, 4.5, 1) + stip(17.5, 4.5, 1) + stip(9, 3, 1) + stip(15, 3, 1),
  'koken/water': '<path d="M12 2.5s-6.5 7.2-6.5 12a6.5 6.5 0 0 0 13 0c0-4.8-6.5-12-6.5-12z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
  'koken/eten': '<path d="M12 7.5c-1.5-1-5.5-1.5-7 1.5S4.5 17.5 7 20c1.5 1.5 3.5 1.5 5 .5 1.5 1 3.5 1 5-.5 2.5-2.5 3.5-8 2-11s-5.5-2.5-7-1.5z"/><path d="M12 7.5c0-2 .5-3.5 2-5"/><path d="M12.8 5c1.5-1.5 3.5-1.5 4.7-.8-1 1.5-3 2-4.7.8z"/>',
  'koken/hygiene': '<path d="M3 9h10a3.5 3.5 0 0 1 3.5 3.5v1"/><path d="M3 5.5V12.5"/><path d="M8 9V6M5.5 6h5"/><path d="M16.5 16.5s-1.8 2-1.8 3.2a1.8 1.8 0 0 0 3.6 0c0-1.2-1.8-3.2-1.8-3.2z"/>',
  // gereedschap
  'gereedschap/mes': '<rect x="2.5" y="14" width="12" height="5" rx="2.5"/><path d="M12.5 14 21 5.5c.5 4-2.5 8-6 8.5"/>' + stip(5, 16.5, 0.9),
  'gereedschap/bijl': '<path d="M14.5 2.5v19"/><path d="M14.5 4.5h-4c-1.5 0-3.5-1-4.8-2-1.3 3.5-1.3 7.5 0 11 1.3-1 3.3-2 4.8-2h4"/>',
  'gereedschap/zaag': '<g transform="rotate(-35 12 12)"><path d="M14 9 2 12.5v2.5h12"/><path d="M3 15l.8 1.4.8-1.4.8 1.4.8-1.4.8 1.4.8-1.4.8 1.4.8-1.4.8 1.4.8-1.4.8 1.4.8-1.4"/><path d="M14 7h5.5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H14z"/><path d="M16.5 10h2.5v4h-2.5z"/></g>',
  'gereedschap/onderhoud': '<rect x="2.5" y="15.5" width="19" height="5" rx="1"/><path d="M5 12.5 18 5.5c1.5 2 1 4-1 5L6 13.5z"/><path d="M5 12.5 2.5 14"/>',
  'gereedschap/sierwerk': '<ellipse cx="15.5" cy="8.5" rx="3.5" ry="5.3" transform="rotate(45 15.5 8.5)"/><path d="M12.6 11.4 5 19a1.5 1.5 0 0 1-2-2l7.6-7.6"/>',
  'gereedschap/regels': '<path d="M12 3 21.5 20h-19z"/><path d="M12 9.5v5"/>' + stip(12, 17.3, 1.1),
  // kamperen
  'kamperen/tenten': '<path d="M2.5 19.5h19"/><path d="M4 19.5C4 12 7.5 6 12 6s8 6 8 13.5"/><path d="M12 6c-1.8 4-2.5 9-2.5 13.5M12 6c1.8 4 2.5 9 2.5 13.5"/>',
  'kamperen/onderkomen': '<path d="M2.5 20.5h19"/><path d="M3.5 20.5 18 6.5V20.5"/><path d="M18 6.5 21 4"/><path d="M7.5 18l4 .6M10.5 15l4 .6M13.5 12l3.5.6"/>',
  'kamperen/slapen': '<path d="M7 7a5 5 0 0 1 10 0v12a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 7 19z"/><ellipse cx="12" cy="7" rx="2.6" ry="2.2"/><path d="M12 11.5v10"/>',
  'kamperen/terrein': '<path d="M2.5 11.5h19M2.5 17h19"/><path d="M5 21.5V8l1.2-1.5L7.5 8v13.5M11 21.5V8l1.2-1.5L13.5 8v13.5M17 21.5V8l1.2-1.5L19.5 8v13.5"/>',
  'kamperen/keuken': '<path d="M7 14.5c-2.5 0-4-2-4-4s2-4 4-4c.5-2 2.5-3.5 5-3.5s4.5 1.5 5 3.5c2 0 4 2 4 4s-1.5 4-4 4"/><path d="M7 11.5V21h10v-9.5M7 17.5h10"/>',
  'kamperen/sporen': '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 14h9l1-14"/><path d="M10 11v6M14 11v6"/>',
  'kamperen/regels': '<rect x="3.5" y="3.5" width="17" height="10" rx="1"/><path d="M12 13.5v8M8.5 21.5h7M7 7h10M7 10h6.5"/>',
  'kamperen/uitrusting': '<path d="M6.5 9a5.5 5.5 0 0 1 11 0v11a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20z"/><path d="M10 3.8V2.5h4v1.3"/><path d="M9 14h6v4.5H9zM6.5 11h11"/>',
  // natuur
  'natuur/bomen': '<path d="M12 21.5v-8M12 16.5l-2.5-2M12 15l2.5-2"/><path d="M12 2.5a5 5 0 0 0-4.8 6.4A4 4 0 0 0 9 16.5h6a4 4 0 0 0 1.8-7.6A5 5 0 0 0 12 2.5z"/>',
  'natuur/planten': '<path d="M12 21.5V4"/><path d="M12 11.5c-4 0-6.5-2-6.5-5.5 3.5 0 6.5 1.8 6.5 5.5zM12 17c4 0 6.5-2 6.5-5.5-3.5 0-6.5 1.8-6.5 5.5z"/>',
  'natuur/dieren': '<path d="M12 12c-3 0-5.5 3.7-5.5 6.2C6.5 20 7.9 21 9.3 21s1.7-.8 2.7-.8 1.3.8 2.7.8 2.8-1 2.8-2.8c0-2.5-2.5-6.2-5.5-6.2z"/><ellipse cx="4.8" cy="10.5" rx="1.8" ry="2.4"/><ellipse cx="9" cy="5.8" rx="1.9" ry="2.5"/><ellipse cx="15" cy="5.8" rx="1.9" ry="2.5"/><ellipse cx="19.2" cy="10.5" rx="1.8" ry="2.4"/>',
  'natuur/vogels': '<path d="M17.5 6.2 21 7.4l-3.3 1"/><path d="M17.5 6.2A3.2 3.2 0 0 0 11.8 8c0 2-1.3 3-3.3 4.2L3 16.5h6c5.2 0 8.8-3 8.7-8.1"/><path d="M8.5 12.5c2 0 4 .6 5 2.2M10 16.3 9 20.5M13 15.8l.6 4.7"/>' + stip(15.6, 7.3, 0.8),
  'natuur/insecten': '<ellipse cx="12" cy="14.5" rx="4.5" ry="6"/><circle cx="12" cy="6.5" r="2.3"/><path d="M12 8.5v12M7.5 11.5 4 9.5M7.5 14.5H3.5M7.8 17.8l-3 2.2M16.5 11.5l3.5-2M16.5 14.5h4M16.2 17.8l3 2.2M10.8 4.6 9.5 2.5M13.2 4.6l1.3-2.1"/>',
  'natuur/paddenstoelen': '<path d="M2.5 12a9.5 7.5 0 0 1 19 0z"/><path d="M9.5 12v7.5A1.5 1.5 0 0 0 11 21h2a1.5 1.5 0 0 0 1.5-1.5V12"/>' + stip(8, 8.5, 1.2) + stip(13, 6.5, 1.2) + stip(16.5, 9.5, 1.2),
  'natuur/materialen': '<path d="M4 10.5h16l-2 10.5H6z"/><path d="M4.7 14.2h14.6M5.4 17.6h13.2M9 10.5l.8 10.5M15 10.5l-.8 10.5M12 10.5V21"/><path d="M7 10.5a5 6 0 0 1 10 0"/>',
  'natuur/mens': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-3 3-3 15 0 18M12 3c3 3 3 15 0 18"/>',
  // weer
  'weer/wolken': '<path d="M6.5 16.5h11a4.2 4.2 0 0 0 .4-8.4 6 6 0 0 0-11.6 1.6 3.4 3.4 0 0 0 .2 6.8z"/><path d="M5 20.5h9M17 20.5h2"/>',
  'weer/wind': '<path d="M3 8.5h11a3 3 0 1 0-3-3M3 12.5h15.5a3 3 0 1 1-3 3M3 16.5h7"/>',
  'weer/voorspellen': '<circle cx="12" cy="12" r="9"/><path d="M12 12l4-4.5"/><path d="M6.5 14.5l-1.3.6M6.2 10l-1.3-.6M9 6.5 8.2 5.3M15 6.5l.8-1.2M17.8 10l1.3-.6M17.5 14.5l1.3.6"/>' + stip(12, 12, 1.3) + '<path d="M9 17.5h6"/>',
  'weer/onweer': '<path d="M7 15.5h-.5A4 4 0 0 1 6 7.5a6 6 0 0 1 11.5 1A3.5 3.5 0 0 1 18 15.5"/><path d="M12.5 11 9.5 16h4l-3 5.5"/>',
  'weer/zonmaan': '<circle cx="8" cy="8" r="3"/><path d="M8 2v1.5M2 8h1.5M3.8 3.8l1 1M12.2 3.8l-1 1M3.8 12.2l1-1"/><path d="M20.5 16.5a6 6 0 1 1-6-7.5 4.8 4.8 0 0 0 6 7.5z"/>',
  'weer/sterren': '<path d="M3 7l5 1.5 4.5.5 3.5 3.5-.5 5 5.5 1.5 1-5.5-6-1"/>' + stip(3, 7) + stip(8, 8.5) + stip(12.5, 9) + stip(16, 12.5) + stip(15.5, 17.5) + stip(21, 19) + stip(22, 13.5),
  // veiligheid
  'veiligheid/oppad': '<path d="M8.5 3 4.5 5.5V21h6v-7h3v7h6V5.5L15.5 3 12 9z"/><path d="M4.5 16.5h6M13.5 16.5h6"/>',
  'veiligheid/brand': '<rect x="8" y="8" width="8" height="13.5" rx="2.5"/><path d="M10.5 8V5.5h3V8M13.5 5.5h3l2.5 2.5M11 5.5V3.5h2.5"/><path d="M8 13h8"/>',
  'veiligheid/ehbo': '<rect x="2" y="8.5" width="20" height="7" rx="3.5" transform="rotate(-45 12 12)"/><rect x="9.2" y="9.2" width="5.6" height="5.6" rx="1" transform="rotate(-45 12 12)"/>',
};

/** The icon of a groep as an <svg> element (as icoon()); the icon of its category when the groep has none. */
export function groepIcoon(categorie, groep, klasse = 'icoon') {
  const paden = GROEPICONEN[`${categorie}/${groep}`];
  return paden ? svgIcoon(paden, klasse) : icoon(CATEGORIE[categorie]?.icoon, klasse);
}
