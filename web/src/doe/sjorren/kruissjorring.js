// A kruissjorring, step by step (../touw/speler.js): the mastworp on the standing pole, three slagen, three
// woelslagen round them, the mastworp on the balk. The drawing at each point is kruissjorringStand() in
// ../../plaatjes/sjorren.js, which also draws the finished lashing of the blad.
import { kruissjorringStand } from '../../plaatjes/sjorren.js';
import { speler } from '../touw/speler.js';

const STAPPEN = ['Mastworp', 'Slagen', 'Woelen', 'Afmaken'];
const TEKST = [
  'Stap 1: maak een mastworp om de staande paal, net onder de dwarsbalk. Hij komt binnen in de sjorring te zitten: daar begin je de slagen.',
  'Stap 2: leg drie slagen: voor de dwarsbalk langs en achter de staande paal om. Op de dwarsbalk komt elke slag aan de binnenkant van de vorige, op de staande paal aan de buitenkant. Trek elke slag strak.',
  'Stap 3: woel drie keer: leg het touw tussen de palen door, om de slagen heen. Zo trek je de slagen samen. Trek elke woelslag hard aan.',
  'Stap 4: maak het af met een mastworp om de dwarsbalk, vlak naast de laatste woelslag. Klaar.',
];

export default function kruissjorring() {
  return speler({ stappen: STAPPEN, teksten: TEKST, tekening: (w) => kruissjorringStand(w), viewBox: '80 60 180 180',
    label: 'Een kruissjorring leggen', tempo: 4200 });
}
