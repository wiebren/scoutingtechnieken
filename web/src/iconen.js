// Line icons on a 24 grid, drawn in currentColor: the four pages of the navigation and the fourteen categories.
// Plain shapes only: no emblem or logo of an organisation.

const PADEN = {
  // navigation
  zoeken: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/>',
  insignes: '<path d="M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z"/><path d="M12 8l1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4z"/>',
  oefenen: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="0.6"/>',
  over: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  // categories
  touw: '<ellipse cx="11" cy="10" rx="7.5" ry="4.5"/><ellipse cx="11" cy="10" rx="3.8" ry="2"/><path d="M18.5 10v4.5c0 2.5-2 4.5-4.5 4.5H11"/>',
  sjorren: '<path d="M5 20.5 19 3.5M5 3.5l14 17"/><path d="M9.6 9.4l4.8 5.2M14.4 9.4l-4.8 5.2"/>',
  kaart: '<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/>',
  tocht: '<circle cx="5.5" cy="18.5" r="2"/><path d="M7.5 18.5H13a3.25 3.25 0 0 0 0-6.5h-3a3.25 3.25 0 0 1 0-6.5h7.5"/><path d="M15 3l2.5 2.5L15 8"/>',
  waarnemen: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  seinen: '<path d="M5 21.5V3"/><path d="M5 4h13l-3 4 3 4H5"/>',
  geheimschrift: '<circle cx="7.5" cy="12" r="4"/><path d="M11.5 12H21M18 12v3M21 12v2.5"/>',
  vuur: '<path d="M12 21.5c-3.9 0-6.5-2.6-6.5-6 0-4 3.6-6 4.2-10.5 2.6 1.7 4 4.4 4 6.6 1-.8 1.6-2 1.7-3.2 2 1.6 3.1 4.2 3.1 7.1 0 3.4-2.6 6-6.5 6z"/>',
  koken: '<path d="M4 10h16v4.5a5.5 5.5 0 0 1-5.5 5.5h-5A5.5 5.5 0 0 1 4 14.5z"/><path d="M2 10h2M20 10h2M9 6.5c0-1.2 1.2-1.3 1.2-2.5M13.5 6.5c0-1.2 1.2-1.3 1.2-2.5"/>',
  gereedschap: '<path d="M4.5 20.5 15 10"/><path d="M13 5.5 18.5 11c1.6-.4 2.8-1.6 3-3.4C19.4 7.5 17.2 6 16.4 3.5 15 3.8 13.6 4.3 13 5.5z"/>',
  kamperen: '<path d="M2.5 20h19M4.5 20 12 5l7.5 15"/><path d="M12 13l-2.5 7M12 13l2.5 7"/><path d="M12 5 10.5 2.5M12 5l1.5-2.5"/>',
  natuur: '<path d="M5 19.5C5 11 10 5 20 4c0 9.5-5.5 15.5-13.5 15.5z"/><path d="M4 21c3.5-5 7-8.5 11.5-12"/>',
  weer: '<path d="M7 19h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.2A3.4 3.4 0 0 0 7 19z"/><path d="M16 3.5v1.5M20.5 5.5l-1 1M22 9.5h-1.5"/>',
  veiligheid: '<path d="M12 2.8 19.5 6v5.6c0 4.5-3.2 8.2-7.5 9.6-4.3-1.4-7.5-5.1-7.5-9.6V6z"/><path d="M12 8.5v7M8.5 12h7"/>',
  // the app's own mark, as on its icon (scripts/icons.mjs)
  windroos: '<path d="M12 1.5l1.9 8.6 8.6 1.9-8.6 1.9-1.9 8.6-1.9-8.6L1.5 12l8.6-1.9z" fill="currentColor" stroke="none"/>',
  // small
  terug: '<path d="M15 5l-7 7 7 7"/>',
  verder: '<path d="M9 5l7 7-7 7"/>',
  sluit: '<path d="M6 6l12 12M18 6 6 18"/>',
  extern: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  vink: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
};

/** An icon as an <svg> element; `klasse` for its size and colour in CSS. */
export function icoon(naam, klasse = 'icoon') {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', klasse);
  svg.innerHTML = PADEN[naam] ?? '';
  return svg;
}
