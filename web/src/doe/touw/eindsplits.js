// An eindsplits, step by step (./speler.js): the strands unlaid, laid in a crown, the crown pulled tight, the strands
// tucked back into the rope against the lay, the ends cut off. The drawing at each point is eindsplitsStand() in
// ../../plaatjes/touw.js, which also draws the four steps of the drawing touw-eindsplits.
import { eindsplitsStand } from '../../plaatjes/touw.js';
import { speler } from './speler.js';

const STAPPEN = ['Uitdraaien', 'Kruisknoop', 'Aantrekken', 'Terugsteken', 'Afknippen'];
const TEKST = [
  'Stap 1: draai aan het eind de strengen een stukje uit elkaar.',
  'Stap 2: leg ze in een kruisknoop: elke streng over de volgende, en onder de bocht van de vorige door.',
  'Stap 3: trek de kruisknoop strak. De drie eindjes hangen langs het touw naar beneden.',
  'Stap 4: steek elke streng terug in het touw, tegen de slag in: over een streng, onder de volgende door. Doe dat drie keer of meer.',
  'Stap 5: knip de eindjes af, maar laat een klein puntje zitten. Rol de splits tussen je handen. Klaar.',
];

export default function eindsplits() {
  return speler({ stappen: STAPPEN, teksten: TEKST, tekening: (w) => eindsplitsStand(w, 150, 116, 262), viewBox: '0 0 300 262',
    label: 'Een eindsplits maken' });
}
