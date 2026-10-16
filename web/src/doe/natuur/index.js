// The interactive pieces of natuur, merged into DOE in ../index.js. Same shape:
// { naam: { titel, laad, opties?, bekijk? } }.
export default {
  bomenquiz: { titel: 'Welke boom is dit?', laad: () => import('./quiz.js'), opties: { soort: 'bomen' } },
  boomsleutel: { titel: 'Zoek de naam van een boom', laad: () => import('./sleutel.js'), bekijk: true },
  prentenquiz: { titel: 'Welk dier liep hier?', laad: () => import('./quiz.js'), opties: { soort: 'prenten' } },
  vogelquiz: { titel: 'Welke vogel is dit?', laad: () => import('./quiz.js'), opties: { soort: 'vogels' } },
  'paddenstoel-aanwijzen': { titel: 'Wijs de delen aan', laad: () => import('./delen.js') },
  'mag-dit-hier': { titel: 'Mag dit hier?', laad: () => import('./magdit.js') },
};
