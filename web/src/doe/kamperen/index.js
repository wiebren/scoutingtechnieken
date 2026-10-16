// The interactive pieces of kamperen, merged into DOE in ../index.js. Same shape:
// { naam: { titel, laad, opties?, bekijk? } }.
export default {
  'tentplek-kiezen': { titel: 'Kies een plek voor je tent', laad: () => import('./tentplek.js') },
  'tent-opzetten': { titel: 'Zet de tent op, stap voor stap', laad: () => import('./tentopzetten.js') },
  'haring-zetten': { titel: 'Zet de haring goed', laad: () => import('./haring.js') },
  'tarp-kiezen': { titel: 'Welke tarp bij dit weer?', laad: () => import('./tarp.js') },
  'warm-genoeg': { titel: 'Slaap je warm genoeg?', laad: () => import('./slaapzak.js'), bekijk: true },
  'kamp-indelen': { titel: 'Deel het kampterrein in', laad: () => import('./indelen.js') },
  'geen-sporen-quiz': { titel: 'Wat doe jij?', laad: () => import('./sporen.js') },
  'rugzak-inpakken': { titel: 'Pak je rugzak in', laad: () => import('./rugzak.js') },
  'paklijst-afvinken': { titel: 'Vink je paklijst af', laad: () => import('./paklijst.js'), bekijk: true },
  'frietbuil-3d': { titel: 'Vouw een frietbuil', laad: () => import('./frietbuil3d.js'), bekijk: true },
  'paklijst-dagtas': { titel: 'Vink je dagtas af', laad: () => import('./paklijst.js'), opties: { lijst: 'dagtas' }, bekijk: true },
};
