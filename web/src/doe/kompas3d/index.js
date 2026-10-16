// The interactive pieces of kompas3d, merged into DOE in ../index.js. Same shape:
// { naam: { titel, laad, opties?, bekijk? } }.
// Kompasschieten first person in the world of the tochten (schieten.js on kijker.js): with the spiegelpeilkompas or
// the plaatkompas; and a bearing (or two) taken there and set out on the map of the same world (peilkaart.js).
export default {
  'spiegelkompas-schieten': { titel: 'Peil met het spiegelpeilkompas', laad: () => import('./schieten.js'), opties: { kompas: 'spiegel' } },
  'kompas-schieten-plaat': { titel: 'Kompasschieten met het plaatkompas', laad: () => import('./schieten.js'), opties: { kompas: 'plaat' } },
  'peilen-en-kaart': { titel: 'Peil en zet uit op de kaart', laad: () => import('./peilkaart.js') },
};
