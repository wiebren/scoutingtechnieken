// The interactive pieces of weer, merged into DOE in ../index.js. Same shape:
// { naam: { titel, laad, opties?, bekijk? } }.
// The sky pieces (zon, maan, sterren) share the hemelrekenaar in ./hemel.js; Kaart en kompas uses some of them too.
export default {
  wolken: { titel: 'Welke wolk is dat?', laad: () => import('./wolken.js') },
  windrichting: { titel: 'Waar komt de wind vandaan?', laad: () => import('./windrichting.js') },
  'onweer-plek': { titel: 'Het onweert: waar ga je heen?', laad: () => import('./onweer-plek.js') },
  'hemel-nu': { titel: 'Wat werkt er nu?', laad: () => import('./hemel-nu.js'), bekijk: true },
  'zon-op-onder': { titel: 'Waar komt de zon op?', laad: () => import('./zon-op-onder.js'), bekijk: true },
  maanfase: { titel: 'Draai de dagen, zie de maan', laad: () => import('./maanfase.js') },
  maankompas: { titel: 'Zoek het noorden met de maan', laad: () => import('./maankompas.js') },
  zonnewijzer: { titel: 'Vind het noorden met de schaduw', laad: () => import('./zonnewijzer.js') },
  schaduwstok: { titel: 'Leg twee steentjes', laad: () => import('./zonnewijzer.js'), opties: { soort: 'schaduwstok' } },
  sterrenkaart: { titel: 'De draaiende sterrenkaart', laad: () => import('./sterrenkaart.js'), bekijk: true },
  'poolster-zoeken': { titel: 'Zoek de Poolster', laad: () => import('./poolster-zoeken.js') },
  'sterrenkaart-grote-beer': { titel: 'Zoek de Grote Beer', laad: () => import('./sterrenkaart.js'), opties: { beeld: 'grote-beer' }, bekijk: true },
  'sterrenkaart-kleine-beer': { titel: 'Zoek de Kleine Beer', laad: () => import('./sterrenkaart.js'), opties: { beeld: 'kleine-beer' }, bekijk: true },
  'sterrenkaart-cassiopeia': { titel: 'Zoek Cassiopeia', laad: () => import('./sterrenkaart.js'), opties: { beeld: 'cassiopeia' }, bekijk: true },
  'sterrenkaart-orion': { titel: 'Zoek Orion', laad: () => import('./sterrenkaart.js'), opties: { beeld: 'orion' }, bekijk: true },
  'sterrenkaart-grote-hond': { titel: 'Zoek Sirius in de Grote Hond', laad: () => import('./sterrenkaart.js'), opties: { beeld: ['grote-hond', 'orion'] }, bekijk: true },
  'sterrenkaart-zomerdriehoek': { titel: 'Zoek de Zomerdriehoek', laad: () => import('./sterrenkaart.js'), opties: { beeld: ['lier', 'zwaan', 'arend'] }, bekijk: true },
  'sterrenkaart-leeuw': { titel: 'Zoek de Leeuw', laad: () => import('./sterrenkaart.js'), opties: { beeld: 'leeuw' }, bekijk: true },
  'sterrenkaart-tweelingen': { titel: 'Zoek de Tweelingen', laad: () => import('./sterrenkaart.js'), opties: { beeld: ['tweelingen', 'orion'] }, bekijk: true },
  'sterrenkaart-stier': { titel: 'Zoek de Stier en de Plejaden', laad: () => import('./sterrenkaart.js'), opties: { beeld: ['stier', 'orion'] }, bekijk: true },
  sterrenbeelden: { titel: 'Welk sterrenbeeld is dit?', laad: () => import('./sterrenbeelden.js') },
  'zon-maan-aarde': { titel: 'Springtij en doodtij: waar staat de maan?', laad: () => import('./zon-maan-aarde.js'), opties: { over: 'getij' } },
  'zon-maan-verduistering': { titel: 'Verduistering: waar staat de maan?', laad: () => import('./zon-maan-aarde.js'), opties: { over: 'verduistering' } },
};
