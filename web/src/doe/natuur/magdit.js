// "Mag dit hier?": situations in a natuurgebied of Staatsbosbeheer or Natuurmonumenten, and three answers: mag, mag
// niet, of eerst melden of toestemming vragen. The answers follow the rules on the card (Buitencode and toegangsregels
// of Staatsbosbeheer, gebiedsregels of Natuurmonumenten, as read on 16-10-2026).
import { h } from '../../dom.js';
import { schud } from './gedeeld.js';
import '../vorm.css';
import './natuur.css';

const ANTWOORDEN = [['mag', 'Mag'], ['niet', 'Mag niet'], ['vragen', 'Eerst melden of toestemming vragen']];

const SITUATIES = [
  { tekst: 'Je plukt langs het pad een bakje bramen, om zelf op te eten. (Staatsbosbeheer)', antwoord: 'mag',
    uitleg: 'Wildplukken mag bij Staatsbosbeheer op kleine schaal, voor eigen gebruik en op eigen risico. Voor bramen: ongeveer één bakje van 250 gram.' },
  { tekst: 'Je plukt een vuilniszak vol bramen om jam van te maken en te verkopen. (Staatsbosbeheer)', antwoord: 'niet',
    uitleg: 'Alleen op kleine schaal en voor jezelf. Een zak vol om te verkopen is dat niet.' },
  { tekst: 'Je groep doet om tien uur ’s avonds een spel in het bos. (Staatsbosbeheer)', antwoord: 'vragen',
    uitleg: 'De meeste gebieden zijn open van zonsopgang tot zonsondergang. Een activiteit meld je ruim van tevoren bij de boswachter, en ’s avonds kan dat alleen als het mag.' },
  { tekst: 'Je wilt een geocache verstoppen in het bos. (Staatsbosbeheer)', antwoord: 'vragen',
    uitleg: 'Voor een geocache of een GPS-route door een gebied heb je eerst toestemming van de boswachter nodig.' },
  { tekst: 'Je loopt met je groep van 25 scouts een tocht door een gebied van Natuurmonumenten.', antwoord: 'vragen',
    uitleg: 'Bij Natuurmonumenten heb je gebiedstoestemming nodig als je groep groter is dan 20 personen.' },
  { tekst: 'Je loopt een stukje van het pad af, de heide op, om een vogel beter te zien.', antwoord: 'niet',
    uitleg: 'Blijf op de wegen en paden: zo stoor je planten en dieren zo weinig mogelijk.' },
  { tekst: 'Je fietst over een pad met het bord „Vrij wandelen op wegen en paden”.', antwoord: 'niet',
    uitleg: 'Dat bord betekent: alleen wandelen. Fietsen mag waar staat „Vrije toegang op wegen en paden”, of op een fietspad.' },
  { tekst: 'Je laat je hond los rennen in het bos, waar geen bord over honden staat.', antwoord: 'niet',
    uitleg: 'Honden zijn bijna overal welkom, maar aan de lijn. Los mag alleen waar een bord dat zegt.' },
  { tekst: 'Je laat je hond los lopen op een plek waar een bord zegt dat honden daar los mogen.', antwoord: 'mag',
    uitleg: 'Sommige gebieden hebben een losloopgebied. Daar mag je hond los, als hij komt wanneer je hem roept. Kom je andere mensen tegen, houd hem dan bij je.' },
  { tekst: 'Een stuk heide is afgezet met een bord: broedgebied, geen toegang. Je wilt er even in om een nest te zoeken.', antwoord: 'niet',
    uitleg: 'Soms is een deel van een gebied afgesloten om de dieren rust te geven, bijvoorbeeld in het broedseizoen. Daar ga je niet in, ook niet even: staat er een bord of hek, dan kun je er een boete voor krijgen.' },
  { tekst: 'Je zoekt met een metaaldetector naar oude munten. (Staatsbosbeheer)', antwoord: 'niet',
    uitleg: 'Metaaldetectors en magneetvissen zijn niet toegestaan.' },
  { tekst: 'Je maakt een klein vuurtje om thee te zetten.', antwoord: 'niet',
    uitleg: 'Vuur stoken mag in een natuurgebied bijna nooit, en zonder toestemming van de eigenaar nooit. Neem een thermosfles mee.' },
  { tekst: 'Je bouwt een hut van takken die op de grond liggen.', antwoord: 'vragen',
    uitleg: 'Bouwen mag in een natuurgebied niet zomaar: daar heb je toestemming van de eigenaar voor nodig. Op je eigen kampterrein of in een speelbos mag het vaak wel.' },
  { tekst: 'Je wandelt overdag met je ouders over de paden, en neemt je afval weer mee.', antwoord: 'mag',
    uitleg: 'Precies zoals de Buitencode het vraagt: „Respecteer de natuur: maak geen lawaai en neem je afval mee.”' },
  { tekst: 'Je zet een wildcamera aan een boom, om te zien welke dieren er langskomen. (Staatsbosbeheer)', antwoord: 'vragen',
    uitleg: 'Daar heb je toestemming van de eigenaar voor nodig, en die krijg je zelden. Mensen filmen mag niet.' },
];

export default function magDitHier() {
  let stapel = []; let goed = 0; let gehad = 0;
  const plek = h('div.nt-plek');

  function volgende() {
    if (!stapel.length) stapel = schud(SITUATIES);
    const s = stapel.pop();
    const melding = h('p.doe-melding', { 'aria-live': 'polite' });
    const uitleg = h('p.nt-meer', { hidden: true }, s.uitleg);
    const verder = h('button.knop.klein.hoofd', { type: 'button', hidden: true, onclick: volgende }, 'Volgende');
    const knoppen = ANTWOORDEN.map(([waarde, tekst]) => h('button.knop.klein.nt-optie', { type: 'button', onclick: () => {
      gehad += 1;
      const raak = waarde === s.antwoord;
      if (raak) goed += 1;
      knoppen.forEach((k, i) => {
        k.disabled = true;
        if (ANTWOORDEN[i][0] === s.antwoord) k.classList.add('goed');
        else if (ANTWOORDEN[i][0] === waarde) k.classList.add('fout');
      });
      melding.classList.toggle('fout', !raak);
      melding.textContent = `${raak ? 'Goed!' : `Nee: ${ANTWOORDEN.find(([w]) => w === s.antwoord)[1].toLowerCase()}.`} ${goed} van de ${gehad} goed.`;
      uitleg.hidden = false;
      verder.hidden = false;
      verder.focus();
    } }, tekst));
    plek.replaceChildren(h('div.md-kaart', h('p.md-situatie', s.tekst), h('div.nt-opties.md-opties', knoppen), melding, uitleg, h('div.knop-rij', verder)));
  }

  volgende();
  return h('div.doe-nt-magdit', plek,
    h('p.doe-stil', 'Elk gebied kan eigen regels hebben. Het bord bij de ingang gaat voor.'));
}
