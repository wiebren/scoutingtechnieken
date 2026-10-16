// The interactive pieces of sjorren en pionieren, merged into DOE in ../index.js. Same shape:
// { naam: { titel, laad, opties?, bekijk? } }.
// The bouwwerken are one piece (bouwwerk.js) with a different model (modellen.js) each, made by `bouw` in
// ./index-touwbanen.js; they are to look at, not exercises (`bekijk`).
import extra from './index-extra.js';
import touwbanen, { bouw } from './index-touwbanen.js';

export default {
  'bouwwerk-driepoot': bouw('Bekijk de driepoot in 3D', 'driepoot'),
  'bouwwerk-bok': bouw('Bekijk de bok in 3D', 'bok'),
  'bouwwerk-poort': bouw('Bekijk de kamppoort in 3D', 'poort'),
  'bouwwerk-vlaggenmast': bouw('Bekijk de vlaggenmast in 3D', 'vlaggenmast'),
  'bouwwerk-ladder': bouw('Bekijk de ladder in 3D', 'ladder'),
  'bouwwerk-tafel': bouw('Bekijk de tafel met banken in 3D', 'tafel'),
  'bouwwerk-kampkeuken': bouw('Bekijk de kampkeuken in 3D', 'kampkeuken'),
  'bouwwerk-uitkijktoren': bouw('Bekijk de uitkijktoren in 3D', 'uitkijktoren'),
  'bouwwerk-apenbrug': bouw('Bekijk de apenbrug in 3D', 'apenbrug'),
  'bouwwerk-schragenbrug': bouw('Bekijk de schragenbrug in 3D', 'schragenbrug'),
  'bouwwerk-schommel': bouw('Bekijk de schommel in 3D', 'schommel'),
  'bouwwerk-familieschommel': bouw('Bekijk de familieschommel in 3D', 'familieschommel'),
  'bouwwerk-vlot': bouw('Bekijk het vlot in 3D', 'vlot'),
  'bouwwerk-mini': bouw('Bekijk een mini-pionierbouwwerk in 3D', 'mini'),
  'bouwwerk-eetshelter': bouw('Bekijk de eetshelter in 3D', 'eetshelter'),
  'bouwwerk-klimrek': bouw('Bekijk het klimrek in 3D', 'klimrek'),
  'bouwwerk-stormbaan': bouw('Bekijk de stormbaan in 3D', 'stormbaan'),
  'bouwwerk-kabelbaan': bouw('Bekijk de kabelbaan in 3D', 'kabelbaan'),
  'bouwwerk-reuzenrad': bouw('Bekijk het reuzenrad in 3D', 'reuzenrad'),
  ...touwbanen,
  ...extra,
};
