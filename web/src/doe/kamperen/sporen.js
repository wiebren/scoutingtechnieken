// Laat geen sporen na: ten situations on camp and on a hike, each with two or three choices. The answer says which
// of the seven principles it is about, and why. Facts: TKN §3.3 (via NPS-LNT) and kamperen-uitwerking.md.
import { h } from '../../dom.js';
import { actie, acties, zetActie } from '../knoppen.js';
import '../vorm.css';
import './kamp.css';

const PRINCIPES = ['', 'Bereid je goed voor', 'Loop en kampeer op stevige grond', 'Ruim je afval goed op', 'Laat liggen wat je vindt',
  'Beperk de sporen van vuur', 'Laat wilde dieren met rust', 'Houd rekening met anderen'];

const VRAGEN = [
  { p: 3, vraag: 'Na de lunch heb je een klokhuis en een snoeppapiertje over. Wat doe je ermee?',
    keuzes: ['Het papiertje mee, het klokhuis in de bosjes', 'Allebei mee, in je afvalzak', 'Allebei begraven'], goed: 1,
    uitleg: 'Ook etensresten neem je mee. Ze vergaan langzamer dan je denkt, en dieren leren zo dat er bij mensen eten te halen is.' },
  { p: 2, vraag: 'Het pad is één grote modderpoel. Hoe loop je verder?',
    keuzes: ['Over het gras naast het pad', 'Over het pad, door de modder'], goed: 1,
    uitleg: 'Blijf op het pad, ook als het nat is. Loopt iedereen ernaast, dan wordt het pad steeds breder en gaan de planten in de berm kapot.' },
  { p: 4, vraag: 'Langs het pad staan prachtige wilde bloemen. Je wilt er iets mee voor op de kamptafel.',
    keuzes: ['Een bosje plukken', 'Eén bloem plukken', 'Er een foto van maken'], goed: 2,
    uitleg: 'Laat liggen en staan wat je vindt: bloemen, stenen, veren. Dan kan de volgende ze ook zien, en de bloem kan zaad maken.' },
  { p: 5, vraag: 'Je hebt hout nodig voor een klein kookvuur, op een plek waar dat mag. Waar haal je het?',
    keuzes: ['Takken van een levende boom', 'Dunne dode takken van de grond', 'Een omgevallen stam, in stukken gehakt'], goed: 1,
    uitleg: 'Gebruik dood hout dat al op de grond ligt, en niet dikker dan je met je handen breekt. Levende bomen laat je met rust, en dikke stammen zijn een huis voor insecten en paddenstoelen.' },
  { p: 6, vraag: 'Een vos komt ’s avonds vlak bij het kamp kijken. Hij lijkt honger te hebben.',
    keuzes: ['Wat brood neerleggen, ver van de tenten', 'Je eten en afval opbergen'], goed: 1,
    uitleg: 'Voer wilde dieren nooit. Ze worden er ziek van, en ze leren dat ze bij mensen eten kunnen halen. Berg eten en afval zo op dat ze er niet bij kunnen.' },
  { p: 7, vraag: 'Jullie kampvuur is gezellig, maar op het veld naast jullie kampeert een andere groep. Het is al laat.',
    keuzes: ['Doorzingen tot het vuur uit is', 'Zachter doen'], goed: 1,
    uitleg: 'Houd rekening met anderen: met je geluid, en met ruimte op het pad.' },
  { p: 3, vraag: 'Op een hike moet je poepen, en er is nergens een wc. Wat doe je?',
    keuzes: ['Achter een boom, met een blaadje erover', 'In een kuiltje van 20 cm, 60 meter van water en paden', 'In een kuiltje van 20 cm, vlak bij de beek'], goed: 1,
    uitleg: 'Een kuiltje, minstens 60 meter van water, paden en het kamp, en daarna dicht met de aarde. Nooit bij water: dan komt het in het water terecht. En vraag de leiding of het daar mag.' },
  { p: 1, vraag: 'Morgen gaan jullie op hike in een natuurgebied. Wat kijk je vooraf na?',
    keuzes: ['De route en het weer', 'De route, het weer en de regels van het gebied', 'De route en waar je onderweg kunt eten'], goed: 1,
    uitleg: 'Wie goed voorbereid is, hoeft onderweg minder te improviseren: geen vuurtje waar het niet mag, geen kortere route dwars door de natuur.' },
  { p: 2, vraag: 'Jullie zoeken een plek voor de tenten. Er is een kale, platgetrapte plek en een stuk vol bloeiende planten.',
    keuzes: ['De kale, platgetrapte plek', 'Het stuk met de planten'], goed: 0,
    uitleg: 'Kampeer op een plek die al gebruikt is, of op stevige grond. Dan blijft de schade op één plek, en de rest kan groeien.' },
  { p: 3, vraag: 'Na het eten blijft er een teil afwaswater over, met rijst erin.',
    keuzes: ['Door een zeef, dan in de beek', 'Door een zeef, dan in het afvoerputje', 'Zo in het afvoerputje, met rijst en al'], goed: 1,
    uitleg: 'Zeef de etensresten eruit en neem die mee als afval. Het water gaat in het afvoerputje, of verspreid, ver van beken en sloten. Zeep hoort niet in het water.' },
];

const schud = (lijst) => {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [uit[i], uit[j]] = [uit[j], uit[i]]; }
  return uit;
};

export default function sporen() {
  let rij = schud(VRAGEN);
  let nr = 0; let goed = 0; let beantwoord = false;

  const teller = h('p.kd-score');
  const vraag = h('p.kd-vraag', { 'aria-live': 'polite' });
  const keuzes = h('div.kd-keuzes');
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const principe = h('p.kd-score');
  const volgende = actie('Volgende', 'verder', () => verder(), { hoofd: true, klein: true, hidden: true });

  let volgorde = [];             // the choices of this question in the order shown, as indices into v.keuzes

  function toon() {
    const v = rij[nr];
    beantwoord = false;
    volgorde = schud(v.keuzes.map((_, i) => i));
    teller.textContent = `Vraag ${nr + 1} van ${rij.length}`;
    vraag.textContent = v.vraag;
    melding.textContent = ''; melding.classList.remove('fout');
    principe.textContent = '';
    keuzes.replaceChildren(...volgorde.map((i) => h('button.knop.klein', { type: 'button', onclick: () => kies(i) }, v.keuzes[i])));
    volgende.hidden = true;
  }

  function kies(i) {
    if (beantwoord) return;
    beantwoord = true;
    const v = rij[nr];
    if (i === v.goed) goed++;
    [...keuzes.children].forEach((k, plek) => {
      const j = volgorde[plek];
      k.disabled = true;
      k.classList.toggle('kd-goed', j === v.goed);
      k.classList.toggle('kd-fout', j === i && i !== v.goed);
    });
    melding.classList.toggle('fout', i !== v.goed);
    melding.textContent = `${i === v.goed ? 'Goed!' : 'Niet goed.'} ${v.uitleg}`;
    principe.textContent = `Principe ${v.p}: ${PRINCIPES[v.p]}`;
    if (nr + 1 < rij.length) zetActie(volgende, 'Volgende', 'verder'); else zetActie(volgende, 'Klaar', 'vink');
    volgende.hidden = false;
    volgende.focus({ preventScroll: true });
  }

  function verder() {
    if (nr >= rij.length) { rij = schud(VRAGEN); nr = 0; goed = 0; toon(); return; }
    if (nr + 1 < rij.length) { nr++; toon(); return; }
    nr = rij.length;
    teller.textContent = '';
    vraag.textContent = `Klaar: ${goed} van ${rij.length} goed.`;
    keuzes.replaceChildren();
    melding.textContent = goed === rij.length ? 'Alles goed. Jij laat geen sporen na.' : 'Kijk nog eens naar de zeven principes, en probeer het opnieuw.';
    melding.classList.remove('fout');
    principe.textContent = '';
    zetActie(volgende, 'Opnieuw', 'opnieuw');
  }

  toon();
  return h('div.kd-tekst.doe-sporen', teller, vraag, keuzes, acties(volgende), melding, principe);
}
