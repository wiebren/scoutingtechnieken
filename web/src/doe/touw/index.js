// The interactive pieces of touw, merged into DOE in ../index.js. Same shape:
// { naam: { titel, laad, opties?, bekijk? } }.
export default {
  'eindsplits-maken': { titel: 'Maak een eindsplits, stap voor stap', laad: () => import('./eindsplits.js'), bekijk: true },
  'touw-terugslag': { titel: 'Zo slaat een gespannen touw terug', laad: () => import('./terugslag.js'), bekijk: true },
  'takeling-leggen': { titel: 'Leg een takeling, stap voor stap', laad: () => import('./takeling.js'), bekijk: true },
};
