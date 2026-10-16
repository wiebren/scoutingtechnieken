// The interactive pieces of waarnemen and of veiligheid, merged into DOE in ../index.js. Same shape:
// { naam: { titel, laad, opties?, bekijk? } }. Shared bits (SVG helper, pointer to SVG coordinates, scene colours) are in
// ./hulp.js and ./wn.css.
export default {
  // Waarnemen en schatten
  'zicht-afstand': { titel: 'Wat zie je op welke afstand?', laad: () => import('./zichtafstand.js') },
  duimsprong: { titel: 'Laat je duim springen', laad: () => import('./duimsprong.js') },
  driehoekmethode: { titel: 'Meet over de rivier', laad: () => import('./driehoekmethode.js') },
  'boomhoogte-potlood': { titel: 'Laat de boom omvallen', laad: () => import('./boomhoogte.js'), opties: { methode: 'potlood' } },
  'boomhoogte-stok': { titel: 'Loop achteruit met je stok', laad: () => import('./boomhoogte.js'), opties: { methode: 'stok' } },
  'boomhoogte-schaduw': { titel: 'Meet twee schaduwen', laad: () => import('./boomhoogte.js'), opties: { methode: 'schaduw' } },
  'tijd-afstand': { titel: 'Reken met tijd en afstand', laad: () => import('./tijdafstand.js'), bekijk: true },
  dwarsprofiel: { titel: 'Peil de beek', laad: () => import('./dwarsprofiel.js'), bekijk: true },
  stroomsnelheid: { titel: 'Klok de drijver', laad: () => import('./stroomsnelheid.js') },
  'schets-horizon': { titel: 'Eén landschap, drie schetsen', laad: () => import('./landschapsschets.js'), opties: { soort: 'horizon' }, bekijk: true },
  'schets-recognografisch': { titel: 'Eén landschap, drie schetsen', laad: () => import('./landschapsschets.js'), opties: { soort: 'recognografisch' }, bekijk: true },
  'schets-panorama': { titel: 'Eén landschap, drie schetsen', laad: () => import('./landschapsschets.js'), opties: { soort: 'panorama' }, bekijk: true },
  'spoor-lezen': { titel: 'Wat vertelt dit spoor?', laad: () => import('./spoorlezen.js') },
  kim: { titel: "Speel Kim's spel", laad: () => import('./kim.js'), opties: { soort: 'noemen' } },
  'kim-weg': { titel: 'Wat is er weg?', laad: () => import('./kim.js'), opties: { soort: 'weg' } },
  'kim-veranderd': { titel: 'Wat is er veranderd?', laad: () => import('./kim.js'), opties: { soort: 'veranderd' } },

  // Veiligheid en EHBO
  '112-melding': { titel: 'Oefen een 112-melding', laad: () => import('./melding112.js') },
  '112-of-huisarts': { titel: '112, huisarts of zelf?', laad: () => import('./huisartsof112.js') },
  strandvlaggen: { titel: 'Welke vlag is dit?', laad: () => import('./strandvlaggen.js') },
  'natuurbrand-vluchten': { titel: 'Welke kant vlucht je op?', laad: () => import('./natuurbrand.js') },
  tekencheck: { titel: 'Zoek de teken', laad: () => import('./tekencheck.js') },
  'ehbo-set': { titel: 'Pak de EHBO-set in', laad: () => import('./ehboset.js') },
  blusmiddel: { titel: 'Kies het blusmiddel', laad: () => import('./blusmiddel.js') },
};
