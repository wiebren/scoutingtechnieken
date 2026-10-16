// Oefen een 112-melding: a situation on a hike with what you see around you, and then the call: the 112-centrale
// asks what you need and where; you are put through, and the meldkamer asks where exactly, what happened and how
// many are hurt. Each time you pick what you say; the best answer is the one help can act on. Built on the KNRM
// poster "Alarmeren doe je zó!", Rijksoverheid (wat gebeurt er als ik 112 bel) and the Pooltochten-boekje.
import { h } from '../../dom.js';
import { schud } from './hulp.js';
import './wn.css';
import './melding112.css';

const SITUATIES = [
  {
    titel: 'Gevallen in het bos',
    wat: 'Jullie lopen een hike door de bossen bij Ermelo. Sanne klimt in een boom, valt, en reageert niet meer als je haar aanspreekt. Ze ademt wel.',
    zie: ['Een ANWB-paddenstoel met nummer 22547', 'Een bordje: Fietspad Drie – Speulde', 'Op je telefoon een kaart-app met je plek'],
    dienst: 'ambulance', plaats: 'Ermelo',
    waar: [
      ['Op het fietspad van Drie naar Speulde, bij ANWB-paddenstoel 22547.', true, 'Precies: een herkenningspunt met een nummer kan de meldkamer opzoeken.'],
      ['In het bos, bij een grote boom.', false, 'Er zijn heel veel bossen en bomen. Noem iets dat ze kunnen vinden: een nummer, een weg, een bordje.'],
      ['Ik weet het niet, ergens bij Ermelo.', false, 'Kijk om je heen: de paddenstoel en het bordje vertellen precies waar je bent.'],
    ],
    gebeurd: [
      ['Een meisje van 13 is uit een boom gevallen, ongeveer 3 meter. Ze reageert niet, maar ze ademt.', true, 'Kort en duidelijk: wat er gebeurde, en hoe het met haar gaat.'],
      ['Er is iets heel ergs gebeurd, kom snel!', false, 'De meldkamer moet weten wat er aan de hand is om de goede hulp te sturen.'],
      ['We waren aan het klimmen en toen viel ze en nu ligt ze daar en ik schrok heel erg…', false, 'Begrijpelijk, maar probeer het kort te houden: wat is er gebeurd, hoe is het nu met haar.'],
    ],
    hoeveel: 'één',
  },
  {
    titel: 'Brand op de heide',
    wat: 'Op de terugweg zie je rook boven de heide. Er brandt een stuk heide naast de weg, en de wind blaast het vuur jullie kant op. Je loopt eerst dwars weg van de brand, naar de weg.',
    zie: ['Langs de weg een hectometerpaaltje: N302, 34,2', 'De auto’s rijden richting Harderwijk', 'Een ANWB-wegwijzer naar Leuvenum'],
    dienst: 'brandweer', plaats: 'Harderwijk',
    waar: [
      ['Aan de N302 bij hectometerpaaltje 34,2, rijrichting Harderwijk. De brand is op de heide naast de weg.', true, 'Goed: het wegnummer, het paaltje en de rijrichting wijzen de plek precies aan.'],
      ['Op de heide bij Harderwijk.', false, 'Er is veel heide bij Harderwijk. Het hectometerpaaltje langs de weg zegt precies waar je bent.'],
      ['Volg de rook maar.', false, 'Rook zie je van ver, maar de brandweer moet weten langs welke weg ze moeten komen.'],
    ],
    gebeurd: [
      ['Er brandt een stuk heide, zo groot als een voetbalveld, en het vuur gaat met de wind mee naar het oosten. Er zijn geen mensen in gevaar, wij staan veilig aan de weg.', true, 'Precies wat de brandweer wil weten: hoe groot, welke kant op, en of er mensen in gevaar zijn.'],
      ['Er is brand!', false, 'Zeg ook wat er brandt, hoe groot het is en welke kant het op gaat.'],
      ['Ik denk dat iemand een sigaret heeft weggegooid, dat is toch verboden?', false, 'Hoe het kwam, is nu niet belangrijk. Vertel wat je ziet.'],
    ],
    hoeveel: 'geen',
  },
  {
    titel: 'Aangereden in het dorp',
    wat: 'Jullie lopen door een dorp. Een fietser wordt aangereden door een auto en ligt op straat. Hij is wakker, maar zijn been staat raar en hij bloedt.',
    zie: ['Een straatnaambord: Dorpsstraat', 'Op de gevel ernaast: nummer 14', 'Een plaatsnaambord: Nunspeet'],
    dienst: 'ambulance', plaats: 'Nunspeet',
    waar: [
      ['Dorpsstraat 14 in Nunspeet, op de weg voor het huis.', true, 'Een adres is het allerbeste: straat, huisnummer en plaats.'],
      ['In de grote straat van het dorp.', false, 'Welke straat, en welk dorp? Kijk naar de bordjes en de huisnummers.'],
      ['Bij de bakker.', false, 'Er zijn veel bakkers. Een adres is beter.'],
    ],
    gebeurd: [
      ['Een fietser is aangereden door een auto. Hij is wakker, zijn been staat raar en hij bloedt.', true, 'Duidelijk: wat er gebeurde en wat je ziet.'],
      ['Een ongeluk.', false, 'Zeg wat voor ongeluk, en hoe het met de gewonde is.'],
      ['De auto reed veel te hard, het kenteken is…', false, 'Dat is later belangrijk voor de politie, maar eerst: hoe is het met de gewonde?'],
    ],
    hoeveel: 'één',
  },
  {
    titel: 'Door het ijs',
    wat: 'Het heeft gevroren. In het park zakt een jongen door het ijs van de vijver. Hij houdt zich vast aan de rand van het wak. Jullie gaan niet zelf het ijs op.',
    zie: ['Een bord bij de ingang: Stadspark Zuid', 'Een straatnaambord: Parklaan', 'Een bankje met een plaatje: aangeboden door de gemeente Zwolle'],
    dienst: 'brandweer', ook: 'ambulance', plaats: 'Zwolle',
    waar: [
      ['In het Stadspark Zuid aan de Parklaan in Zwolle, in de vijver bij de ingang.', true, 'Goed: het park, de straat ernaast en waar in het park.'],
      ['In een park.', false, 'Welk park, in welke plaats? De borden vertellen het je.'],
      ['Bij het bankje.', false, 'Er staan veel bankjes. Noem het park, de straat en de plaats.'],
    ],
    gebeurd: [
      ['Een jongen is door het ijs gezakt en houdt zich vast aan de rand. Hij is bij bewustzijn.', true, 'Precies: wat er gebeurde en hoe het met hem is.'],
      ['Er ligt iemand in het water, hij gaat dood!', false, 'Blijf rustig, en vertel wat je ziet.'],
      ['Het ijs is veel te dun.', false, 'Zeg wat er met iemand gebeurd is.'],
    ],
    hoeveel: 'één',
  },
];
const DIENSTEN = [['ambulance', 'Ambulance'], ['brandweer', 'Brandweer'], ['politie', 'Politie']];

export default function melding112() {
  let sit = null;
  let stap = 0;
  let punten = 0;
  let rij = [];

  const kop = h('h4.m1-titel');
  const verhaal = h('p');
  const zie = h('ul.m1-zie');
  const gesprek = h('div.m1-gesprek', { 'aria-live': 'polite' });
  const keuzes = h('div.m1-keuzes', { role: 'group', 'aria-label': 'Wat zeg je?' });
  const verder = h('button.knop.klein', { type: 'button', onclick: nieuw }, 'Andere situatie');
  const el = h('div.wn.doe-melding112',
    h('p.doe-stil', 'Dit is een oefening: er wordt niet echt gebeld. Bel 112 nooit om te oefenen.'),
    h('div.m1-situatie', kop, verhaal, h('p.m1-zie-kop', 'Wat je om je heen ziet:'), zie),
    gesprek, keuzes, h('div.knop-rij', verder));

  const zeg = (wie, tekst, klasse = '') => gesprek.append(h(`p.m1-zin.${wie}${klasse ? `.${klasse}` : ''}`, h('strong', wie === 'centrale' ? 'Centralist: ' : wie === 'jij' ? 'Jij: ' : ''), tekst));

  function vraag(tekst, opties, na) {
    zeg('centrale', tekst);
    keuzes.replaceChildren(...schud(opties).map(([zin, goed, uitleg]) => h('button.knop.m1-keuze', { type: 'button', onclick: () => {
      keuzes.replaceChildren();
      zeg('jij', zin);
      if (goed) punten += 1;
      zeg('uitleg', `${goed ? '✓' : '✗'} ${uitleg}`, goed ? 'goed' : 'fout');
      na();
    } }, zin)));
    keuzes.querySelector('button')?.focus({ preventScroll: true });
  }

  function volgende() {
    stap += 1;
    if (stap === 1) {
      const goed = (k) => k === sit.dienst || k === sit.ook;
      vraag('112, welke hulpdienst heeft u nodig, en in welke plaats?', DIENSTEN.map(([k, n]) => [`${n}, in ${sit.plaats}.`, goed(k),
        goed(k) ? `Goed. Nu word je doorverbonden met de meldkamer van die dienst.${sit.ook ? ' Bij iemand door het ijs komen de brandweer en de ambulance allebei.' : ''}`
          : `Hier is de ${sit.dienst}${sit.ook ? ` of de ${sit.ook}` : ''} het eerst nodig. Twijfel je, zeg dan wat er is: de centralist helpt kiezen.`]), () => {
        zeg('centrale', 'Ik verbind u door. Blijf aan de lijn.', 'stil');
        volgende();
      });
    } else if (stap === 2) {
      vraag(`Meldkamer ${sit.dienst}. Waar bent u precies?`, sit.waar, volgende);
    } else if (stap === 3) {
      vraag('Wat is er gebeurd?', sit.gebeurd, volgende);
    } else if (stap === 4) {
      vraag('Hoeveel gewonden zijn er?', [
        [sit.hoeveel === 'geen' ? 'Geen gewonden, voor zover ik zie.' : 'Eén gewonde.', true, 'Kort en duidelijk.'],
        ['Ik weet het niet, ik heb niet gekeken.', false, 'Kijk als het veilig kan, dan weet de meldkamer hoeveel hulp er moet komen.'],
      ], volgende);
    } else if (stap === 5) {
      vraag('Er komt hulp. Wat doet u nu?', [
        ['Ik zet mijn telefoon op de luidspreker en blijf aan de lijn. Ik doe wat u zegt.', true, 'Goed: zo heb je je handen vrij, en de meldkamer kan je helpen tot de hulp er is.'],
        ['Ik hang op en ga helpen.', false, 'Hang pas op als de meldkamer dat zegt. Zet de luidspreker aan, dan kun je tegelijk helpen.'],
        ['Ik bel mijn ouders even.', false, 'Blijf aan de lijn met de meldkamer. Je ouders of de leiding bel je later, of laat iemand anders bellen.'],
      ], volgende);
    } else {
      zeg('centrale', 'De hulp is onderweg.', 'stil');
      gesprek.append(h('p.m1-eind', `${punten} van de 5 goed. ${punten === 5 ? 'Een heldere melding!' : 'Lees de uitleg bij wat beter kon, en probeer het nog eens.'}`));
    }
  }

  function nieuw() {
    if (!rij.length) rij = schud(SITUATIES.filter((x) => x !== sit));
    sit = rij.pop();
    stap = 0; punten = 0;
    kop.textContent = sit.titel;
    verhaal.textContent = sit.wat;
    zie.replaceChildren(...sit.zie.map((z) => h('li', z)));
    gesprek.replaceChildren();
    zeg('stil', 'Je belt 112 (in het echt: met de telefoon op de luidspreker)…', 'stil');
    volgende();
  }

  nieuw();
  return el;
}
