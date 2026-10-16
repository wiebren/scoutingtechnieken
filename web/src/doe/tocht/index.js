// The interactive pieces of tocht, merged into DOE in ../index.js. Same shape:
// { naam: { titel, laad, opties?, bekijk? } }.
const quiz = () => import('./tekenquiz.js');
const koers = () => import('./koers.js');

export default {
  'spoortekens-bp-quiz': { titel: 'Ken je de tekens van Baden-Powell?', laad: quiz, opties: { set: 'bp' } },
  'spoortekens-quiz': { titel: 'Herken de spoortekens', laad: quiz, opties: { set: 'uitgebreid' } },
  'spoortekens-natuur-quiz': { titel: 'Lees de tekens van gras, steen en tak', laad: quiz, opties: { set: 'natuur' } },
  'wandelmarkering-quiz': { titel: 'Wat zegt de markering?', laad: quiz, opties: { set: 'markering' } },
  'helikopter-meten': { titel: 'Meet en loop een helikopterroute', laad: koers, opties: { soort: 'helikopter' } },
  'vector-meten': { titel: 'Meet en loop een vectorroute', laad: koers, opties: { soort: 'vector' } },
  'vector-draai-meten': { titel: 'Vectoren met een draaiende noordpijl', laad: koers, opties: { soort: 'vector-draai' } },
  'blinde-lijn-meten': { titel: 'Loop een blinde lijn', laad: koers, opties: { soort: 'blind' } },
  'vliegkoers-lopen': { titel: 'Loop een vliegkoers', laad: koers, opties: { soort: 'vliegkoers' } },
  'kompasroute-lopen': { titel: 'Loop een kompasroute', laad: koers, opties: { soort: 'kompasroute' } },
  reflectortocht: { titel: 'Zoek de reflectoren in het donker', laad: () => import('./reflector.js') },
  doolhof: { titel: 'Los het doolhof op, dan wordt het een stripkaart', laad: () => import('./doolhof.js') },
  'coordinatenroute-zoeken': { titel: 'Zoek de coördinaten van de route', laad: () => import('./coordinaten.js'), opties: { soort: 'coordinaten' } },
  'kruispeiling-zoeken': { titel: 'Vind de post met een kruispeiling', laad: () => import('./coordinaten.js'), opties: { soort: 'kruispeiling' } },
  'passer-zoeken': { titel: 'Vind de post met de passer', laad: () => import('./coordinaten.js'), opties: { soort: 'passer' } },
  'oleaat-leggen': { titel: 'Leg de oleaat op de kaart', laad: () => import('./oleaat.js') },
};
