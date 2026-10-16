// The interactive pieces of a card ("Probeer het"): a compass to turn, a rose to point at, a sum to slide. A blad
// names one with `doe: 'kompas'`; scripts/check.mjs checks that it exists. Each lives in its own module here and is
// loaded when a card that has it opens, so the rest of the app stays small.
//
// A module exports `default function (opties) => HTMLElement`, builds its own element with h() (../dom.js), and
// brings its own CSS (import './naam.css'), in the colours of the theme (style.css, :root). Listeners on window or
// document check `el.isConnected` and remove themselves once the card is gone. It works with touch, mouse and the
// keyboard, and stays readable for a screen reader (a line of text says what the picture shows). The pieces of
// most categories live in their own folder here, with their own list in <folder>/index.js.
//
// An entry is { titel, laad, opties?, bekijk? }. `bekijk: true` marks a piece that is to look at or to reckon with,
// not an exercise: a viewer (the bouwwerken in 3D, the sterrenkaart), a calculator or converter, a planner, a
// checklist, a demonstration where nothing can go wrong. Oefenen lists only the exercises (where the scout answers,
// chooses, places or estimates and hears whether it is right); the cards show every piece, and
// #/oefenen?doe=<naam> opens any of them.

import route from './route/index.js';
import tocht from './tocht/index.js';
import seinen from './seinen/index.js';
import waarnemen from './waarnemen/index.js';
import weer from './weer/index.js';
import vuur from './vuur/index.js';
import kamperen from './kamperen/index.js';
import natuur from './natuur/index.js';
import sjorren from './sjorren/index.js';
import kompas3d from './kompas3d/index.js';

export const DOE = {
  kompas: { titel: 'Draai het kompas', laad: () => import('./kompas.js'), bekijk: true },
  'kompas-aanwijzen': { titel: 'Wijs de delen van het kompas aan', laad: () => import('./kompaswijzen.js') },
  'kompas-koers': { titel: 'Loop een koers', laad: () => import('./kompas.js'), opties: { opdracht: 'koers' } },
  'kompas-peilen': { titel: 'Peil een doel', laad: () => import('./kompas.js'), opties: { opdracht: 'peilen' } },
  'kompas-terug': { titel: 'Terug op je spoor', laad: () => import('./kompas.js'), opties: { opdracht: 'terug' } },
  'kompas-telefoon': { titel: 'Je telefoon als kompas', laad: () => import('./kompas.js'), opties: { sensor: true }, bekijk: true },
  'kaart-greep-3': { titel: 'Haal een koers van de kaart', laad: () => import('./kaartkompas.js'), opties: { greep: 3 } },
  'kaart-greep-4': { titel: 'Zet een peiling op de kaart', laad: () => import('./kaartkompas.js'), opties: { greep: 4 } },
  'windroos-8': { titel: 'Oefen de acht windrichtingen', laad: () => import('./windroos.js'), opties: { n: 8 } },
  'windroos-16': { titel: 'Oefen de zestien windrichtingen', laad: () => import('./windroos.js'), opties: { n: 16 } },
  'windroos-32': { titel: 'Oefen de 32 streken', laad: () => import('./windroos.js'), opties: { n: 32 } },
  schaal: { titel: 'Reken met de schaal', laad: () => import('./schaal.js'), bekijk: true },
  kronkelweg: { titel: 'Meet de kronkelweg', laad: () => import('./kronkelweg.js') },
  rdkaart: { titel: 'Lees coördinaten op de kaart', laad: () => import('./rdkaart.js') },
  kaarthoekmeter: { titel: 'Lees af met de kaarthoekmeter', laad: () => import('./kaarthoekmeter.js') },
  morse: { titel: 'Sein en luister morse', laad: () => import('./morse.js') },
  verschuivingscode: { titel: 'Codeer met een verschuiving', laad: () => import('./geheimschrift.js'), opties: { soort: 'verschuiving' } },
  'a-is-1': { titel: 'Letters worden getallen', laad: () => import('./geheimschrift.js'), opties: { soort: 'a-is-1' } },
  spelalfabet: { titel: 'Spel je naam', laad: () => import('./spelalfabet.js') },
  onweer: { titel: 'Tel flits en donder', laad: () => import('./onweer.js'), bekijk: true },
  passen: { titel: 'Tel je passen', laad: () => import('./passen.js'), bekijk: true },
  noodsein: { titel: 'Geef het alpiene noodsein', laad: () => import('./noodsein.js'), bekijk: true },
  beaufort: { titel: 'Hoe hard waait het?', laad: () => import('./beaufort.js'), bekijk: true },
  declinatie: { titel: 'Kies een plaats en een jaar', laad: () => import('./declinatie.js'), bekijk: true },
  'drie-noorden': { titel: 'De drie noorden per plaats', laad: () => import('./declinatie.js'), bekijk: true },
  horloge: { titel: 'Zoek het zuiden met je horloge', laad: () => import('./horloge.js') },
  hoogte: { titel: 'Van hoogtelijnen naar een profiel', laad: () => import('./hoogte.js'), bekijk: true },
  vuurdriehoek: { titel: 'Maak het vuur uit', laad: () => import('./vuurdriehoek.js'), bekijk: true },
  driehoek: { titel: 'Duw tegen de palen', laad: () => import('./driehoek.js'), bekijk: true },
  coordinaten: { titel: 'Reken een plek om', laad: () => import('./coordinaten.js'), bekijk: true },
  'coordinaten-graden': { titel: 'Schrijf een plek op drie manieren', laad: () => import('./coordinaten.js'), opties: { nadruk: 'graden' }, bekijk: true },
  'coordinaten-utm': { titel: 'Van graden naar UTM', laad: () => import('./coordinaten.js'), opties: { nadruk: 'utm' }, bekijk: true },
  tochtplanner: { titel: 'Zet een tocht uit op de kaart', laad: () => import('./tochtplanner.js'), bekijk: true },
  legenda: { titel: 'De legenda van de topokaart', laad: () => import('./legenda.js') },
  'kaart-orienteren': { titel: 'Leg de kaart goed', laad: () => import('./kaartkompas.js'), opties: { greep: 'orienteren' } },
  ...route,
  ...tocht,
  ...seinen,
  ...waarnemen,
  ...weer,
  ...vuur,
  ...kamperen,
  ...natuur,
  ...sjorren,
  ...kompas3d,
};
