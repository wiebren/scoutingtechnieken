// The interactive pieces of route, merged into DOE in ../index.js. Same shape:
// { naam: { titel, laad, opties?, bekijk? } }.
// All of them are the route walker (route.js): one road network, walked with a different technique each.
const laad = () => import('./route.js');
const loop = (titel, techniek) => ({ titel, laad, opties: { techniek } });

export default {
  'route-kruispunten': loop('Loop een kruispuntenroute', 'kruispunten'),
  'route-bolletje-pijltje': loop('Loop een bolletje-pijltjeroute', 'bolletje-pijltje'),
  'route-bolletje-windrichting': loop('Loop bolletje-pijltje met windrichting', 'windrichting'),
  'route-noordpijl': loop('Loop een kruispunten-noordpijlroute', 'noordpijl'),
  'route-stripkaart': loop('Loop een stripkaart', 'stripkaart'),
  'route-ogen': loop('Loop een ogenroute', 'ogen'),
  'route-kralen': loop('Loop een kralentocht', 'kralen'),
  'route-knopen': loop('Loop een knopenroute', 'knopen'),
  'route-tijden': loop('Loop een tijdenroute', 'tijden'),
  'route-beschrijving': loop('Loop een beschrijvende route', 'beschrijving'),
  'route-rll': loop('Loop een RLL-LLL-tocht', 'rll'),
  'route-vertaler': loop('Eén route, elke techniek', 'vertaler'),
};
