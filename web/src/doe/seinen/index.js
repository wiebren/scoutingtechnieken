// The interactive pieces of seinen and geheimschrift, merged into DOE in ../index.js. Same shape: { naam: { titel,
// laad, opties?, bekijk? } }. Each geheimschrift blad has an exercise in its own code (code-<id>, ./kraak.js: Kraak de
// code, mostly also Zet in code), with the Codeermachine on that code behind the last chip; the ids and names of CODES
// in ./lib/geheim.js are written out here so that list stays out of the main bundle. Only the codes a blad opens on
// are listed: the verschuiving and A=1 have their own piece (../geheimschrift.js), and the seinvlaggen are learned in
// ./seinvlaggen.js; the machine itself still has every code.

const codeermachine = () => import('./codeermachine.js');
const kraak = () => import('./kraak.js');
const CODE_NAMEN = {
  rot13: 'Rot13', atbash: 'Omgekeerd alfabet', codewoord: 'Codewoord', vigenere: 'Vigenère',
  sms: 'SMS-code', polybius: 'Polybius', bacon: 'Bacon-code', binair: 'Binaire code', woordwaarde: 'Woordwaarde',
  leet: 'Cijfers voor letters', achterstevoren: 'Achterstevoren', husselen: 'Letters husselen', stoorwoord: 'Stoorwoord', blokmethode: 'Blokmethode', jaartal: 'Jaartalgeheimschrift',
  kolom: 'Kolomtranspositie', zigzag: 'Zigzagcode', ptaal: 'P-taal', zonder: 'Zonder klinkers of spaties',
  rozenkruisers: 'Rozenkruisers', blokjes: 'Blokjesgeheimschrift', braille: 'Braille', morse: 'Morse', semafoor: 'Semafoor',
};

export default {
  semafoor: { titel: 'Zet de armen van de seiner', laad: () => import('./semafoor.js') },
  'semafoor-bericht': { titel: 'Sein een bericht in semafoor', laad: () => import('./semafoor.js'), opties: { modus: 'bericht' } },
  vreede: { titel: 'Sein met Vreede', laad: () => import('./semafoor.js'), opties: { stelsel: 'vreede' } },
  seinvlaggen: { titel: 'Ken je de seinvlaggen?', laad: () => import('./seinvlaggen.js') },
  'seinvlaggen-cijfers': { titel: 'Ken je de cijferwimpels?', laad: () => import('./seinvlaggen.js'), opties: { modus: 'cijfer' } },
  'morse-koch': { titel: 'Leer morse op het gehoor', laad: () => import('./morsetrainer.js') },
  morseboom: { titel: 'Tik morse in de boom', laad: () => import('./morseboom.js') },
  'morse-hulpwoorden': { titel: 'Woorden met een o', laad: () => import('./hulpwoord.js'), bekijk: true },
  'morse-sos': { titel: 'Sein SOS', laad: () => import('../morse.js'), opties: { tekst: 'SOS' } },
  fluitsignalen: { titel: 'Luister naar de fluit', laad: () => import('./fluit.js') },
  portofoon: { titel: 'Praat over de portofoon', laad: () => import('./portofoon.js') },
  // the Codeermachine on its own turns text into code and back, with nothing to get wrong: a tool (bekijk). The
  // pieces of the codes, the codeschijf and the roostercode give a message to crack, and have their tool on a chip.
  codeermachine: { titel: 'Codeermachine', laad: codeermachine, bekijk: true },
  ...Object.fromEntries(Object.entries(CODE_NAMEN).map(([id, naam]) => [`code-${id}`,
    { titel: id === 'woordwaarde' ? 'Reken de woordwaarde uit' : `Kraak de code: ${naam}`, laad: kraak, opties: { code: id } }])),
  codeschijf: { titel: 'Kraak de code met de codeschijf', laad: kraak, opties: { code: 'verschuiving', hulpmiddel: 'codeschijf' } },
  roostercode: { titel: 'Kraak de code met het sjabloon', laad: kraak, opties: { code: 'rooster', hulpmiddel: 'roostercode' } },
  'onzichtbare-inkt': { titel: 'Maak de inkt zichtbaar', laad: () => import('./inkt.js'), bekijk: true },
};
