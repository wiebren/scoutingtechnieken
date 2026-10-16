// The interactive pieces of vuur, koken and gereedschap, merged into DOE in ../index.js. Same shape:
// { naam: { titel, laad, opties?, bekijk? } }. The quiz and the order puzzle take their questions from ./vragen.js. The
// safety pieces (veilig*.js) serve vuur, gereedschap and sjorren: a check to tick off, a rope to tension, material to
// check, and a quiz about knives.
export default {
  'vuur-bouwen': { titel: 'Bouw een vuur en steek het aan', laad: () => import('./bouwen.js') },
  'vuur-kiezen': { titel: 'Welk vuur is dit, en waarvoor?', laad: () => import('./quiz.js'), opties: { set: 'vuur' } },
  'hout-kiezen': { titel: 'Welk hout?', laad: () => import('./quiz.js'), opties: { set: 'hout' } },
  'vuur-doven': { titel: 'Maak het vuur echt uit', laad: () => import('./doven.js') },
  'mag-ik-stoken': { titel: 'Mag ik vandaag stoken?', laad: () => import('./magstoken.js'), bekijk: true },
  stokbrood: { titel: 'Bak een stokbrood', laad: () => import('./stokbrood.js') },
  'dutch-oven': { titel: 'Leg de kolen op en onder de pan', laad: () => import('./dutchoven.js'), bekijk: true },
  'brander-brandstof': { titel: 'Welke brander, welke brandstof?', laad: () => import('./quiz.js'), opties: { set: 'branders' } },
  'afwas-volgorde': { titel: 'De afwas in de goede volgorde', laad: () => import('./volgorde.js'), opties: { set: 'afwas' } },
  'welke-greep': { titel: 'Welke greep?', laad: () => import('./quiz.js'), opties: { set: 'grepen' } },
  bloedcirkel: { titel: 'Is je bloedcirkel vrij?', laad: () => import('./bloedcirkel.js') },
  'v-hakken': { titel: 'Hak een stammetje door', laad: () => import('./vhakken.js') },
  slijphoek: { titel: 'Slijp op de goede hoek', laad: () => import('./slijphoek.js') },
  'stookplek-check': { titel: 'Is je stookplek klaar?', laad: () => import('./veiligcheck.js'), opties: { set: 'stookplek' }, bekijk: true },
  'pionier-check': { titel: 'Check je pionierobject', laad: () => import('./veiligcheck.js'), opties: { set: 'pionieren' }, bekijk: true },
  'touwbaan-spannen': { titel: 'Span het touw: hoeveel trekt het aan de ankers?', laad: () => import('./veiligspannen.js'), bekijk: true },
  'materiaal-keuren': { titel: 'Goed, of afkeuren?', laad: () => import('./veiligkeuren.js') },
  'mes-mee': { titel: 'Mag je mes mee?', laad: () => import('./veiligquiz.js'), opties: { set: 'mes-mee' } },
  'schijf-quiz': { titel: 'Past het in de Schijf van Vijf?', laad: () => import('./quiz.js'), opties: { set: 'schijf' } },
  seizoenkalender: { titel: 'Wat is er in het seizoen?', laad: () => import('./seizoen.js'), bekijk: true },
};
