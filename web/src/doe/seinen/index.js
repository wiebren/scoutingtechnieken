// The interactive pieces of seinen and geheimschrift, merged into DOE in ../index.js. Same shape: { naam: { titel,
// laad, opties?, bekijk? } }. The Codeermachine opens on another code per blad (code-<id>; the ids and names of CODES in
// ./lib/geheim.js, written out here so that list stays out of the main bundle). Only the codes a blad opens on are
// listed: the verschuiving and A=1 have their own piece (../geheimschrift.js), and the seinvlaggen are learned in
// ./seinvlaggen.js; the machine itself still has every code.

const codeermachine = () => import('./codeermachine.js');
const CODE_NAMEN = {
  rot13: 'Rot13', atbash: 'Omgekeerd alfabet', codewoord: 'Codewoord', vigenere: 'Vigenère',
  sms: 'SMS-code', polybius: 'Polybius', bacon: 'Bacon-code', binair: 'Binaire code', woordwaarde: 'Woordwaarde',
  leet: 'Cijfers voor letters', achterstevoren: 'Achterstevoren', husselen: 'Letters husselen', stoorwoord: 'Stoorwoord', blokmethode: 'Blokmethode', jaartal: 'Jaartalgeheimschrift',
  kolom: 'Kolomtranspositie', zigzag: 'Zigzagcode', ptaal: 'P-taal', zonder: 'Zonder klinkers of spaties',
  rozenkruisers: 'Rozenkruisers', blokjes: 'Blokjesgeheimschrift', braille: 'Braille', morse: 'Morse', semafoor: 'Semafoor',
};

export default {
  semafoor: { titel: 'Zet de armen van de seiner', laad: () => import('./semafoor.js') },
  'semafoor-woord': { titel: 'Sein een woord in semafoor', laad: () => import('./semafoor.js'), opties: { modus: 'woord' } },
  vreede: { titel: 'Sein met Vreede', laad: () => import('./semafoor.js'), opties: { stelsel: 'vreede' } },
  seinvlaggen: { titel: 'Ken je de seinvlaggen?', laad: () => import('./seinvlaggen.js') },
  'seinvlaggen-spellen': { titel: 'Spel een woord in vlaggen', laad: () => import('./seinvlaggen.js'), opties: { modus: 'spellen' } },
  'morse-koch': { titel: 'Leer morse op het gehoor', laad: () => import('./morsetrainer.js') },
  morseboom: { titel: 'Tik morse in de boom', laad: () => import('./morseboom.js') },
  'morse-hulpwoorden': { titel: 'Woorden met een o', laad: () => import('./hulpwoord.js'), bekijk: true },
  'morse-sos': { titel: 'Sein SOS', laad: () => import('../morse.js'), opties: { tekst: 'SOS' } },
  fluitsignalen: { titel: 'Luister naar de fluit', laad: () => import('./fluit.js') },
  portofoon: { titel: 'Praat over de portofoon', laad: () => import('./portofoon.js') },
  codeermachine: { titel: 'Codeermachine', laad: codeermachine },
  ...Object.fromEntries(Object.entries(CODE_NAMEN).map(([id, naam]) => [`code-${id}`, { titel: `Codeermachine: ${naam}`, laad: codeermachine, opties: { code: id } }])),
  codeschijf: { titel: 'Draai de codeschijf', laad: () => import('./codeschijf.js') },
  roostercode: { titel: 'Leg het sjabloon erop', laad: () => import('./roostercode.js') },
  'onzichtbare-inkt': { titel: 'Maak de inkt zichtbaar', laad: () => import('./inkt.js'), bekijk: true },
};
