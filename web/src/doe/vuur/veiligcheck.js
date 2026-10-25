// A safety check to tick off, phase by phase: before a pionierobject is used (the checklist of Scouting Nederland,
// Veiligheid bij pionieren 2019, and of Jong Nederland 2016, in our own words), or before a fire is lit (the
// infoblad Veilig en verantwoord stoken 2026; putting it out is on the blad vuur-doven). The phases are steps in order, on the shared stappenbalk; each phase
// is a list of ticks with why. It ends with what is still open, and who gives the go-ahead.
import { h } from '../../dom.js';
import { actie, acties } from '../knoppen.js';
import { stappenBalk } from '../stappen.js';
import '../vorm.css';
import './veilig.css';

// [phase, short name under its dot, [[what, why], ...]]
const SETS = {
  pionieren: {
    label: 'De veiligheidscheck van een pionierobject, fase voor fase',
    klaar: 'Alles nagelopen. De leiding kijkt het nog één keer na en geeft het vrij: pas dan gaat er iemand op.',
    open: 'nog niet gebruiken',
    fasen: [
      ['Voorbereiden', 'Voor­bereiden', [
        ['Er is een schets en een materiaallijst.', 'Dan weet iedereen wat je bouwt en wat je nodig hebt.'],
        ['Het past bij jullie leeftijd en kunnen.', 'Begin met iets eenvoudigs; groot en moeilijk komt later.'],
        ['Iedereen kent de sjorringen en knopen die nodig zijn.', 'Een verkeerde of slappe sjorring is het zwakke punt.'],
        ['Hout en touw zijn nagekeken, en er is genoeg.', 'Een rotte paal of rafelig touw breekt het eerst.'],
        ['Afgesproken: wie doet wat, en hoeveel mensen er straks tegelijk op mogen.', 'Dat aantal bepaal je vooraf, niet als iedereen er al op staat.'],
        ['De plek is geschikt: zachte grond, ruimte voor tuien en ankers.', 'Op zachte grond kom je minder hard neer als je valt.'],
      ]],
      ['Bouwen', 'Bouwen', [
        ['Er is steeds leiding bij die het overzicht houdt.', 'Iemand moet zien wat er gebeurt, ook als iedereen druk is.'],
        ['Hoog werk bouw je liggend en takel je overeind.', 'Wie toch hoog moet werken, is gezekerd met klimmateriaal.'],
        ['Er komen schoren of tuien in.', 'Driehoeken en tuien houden het recht; zonder zakt het scheef of valt het om.'],
        ['Elke verbinding heeft de juiste sjorring of knoop.', 'Kruisen de palen haaks of schuin? Dat bepaalt de sjorring.'],
        ['De EHBO-kist en een telefoon liggen klaar.', 'Als er iets gebeurt, wil je niet eerst gaan zoeken.'],
      ]],
      ['Controleren', 'Contro­leren', [
        ['Het staat stabiel: duw ertegen, er wiebelt of schuift niets.', 'Wat nu al beweegt, beweegt straks met mensen erop veel meer.'],
        ['Tuien en ankers zitten vast.', 'Trek aan elke tui: hij is strak en het anker geeft niet mee.'],
        ['Elke sjorring zit strak.', 'Een sjorring die je met de hand kunt verschuiven, leg je opnieuw.'],
        ['Getest met een flinke last zonder mensen erop, zoals een zware zak zand.', 'Breekt er iets, dan breekt het nu, en niet onder iemand.'],
        ['Onder een hoog bouwwerk ligt zand of een andere zachte laag.', 'Dat dempt een val.'],
      ]],
      ['Gebruiken', 'Gebrui­ken', [
        ['Er is altijd leiding bij die toezicht houdt.', 'Het wordt nooit zonder toezicht gebruikt.'],
        ['Er gaan niet meer mensen tegelijk op dan afgesproken.', 'Wie wacht, wacht op een vaste plek ernaast.'],
        ['Blijft het staan, dan kijk je het geregeld na.', 'Sjorringen en tuien kunnen losser gaan zitten: zet ze dan opnieuw strak.'],
      ]],
      ['Afbreken', 'Afbreken', [
        ['Afbreken onder toezicht, stap voor stap.', 'Ook bij het afbreken kan iets vallen of omslaan.'],
        ['Palen en touwen meteen opruimen.', 'Anders struikelt iemand erover.'],
        ['Hout en touw nakijken en droog opbergen.', 'Dan is het de volgende keer weer goed.'],
      ]],
    ],
  },
  stookplek: {
    label: 'De check van een stookplek, voor en na het vuur',
    klaar: 'Alles klaar. Steek aan met de leiding erbij, en laat het vuur nooit alleen.',
    open: 'nog niet aansteken',
    fasen: [
      ['De plek', 'De plek', [
        ['Op zand of in een stookton.', 'Niet op gras of bladeren: die vatten vlam.'],
        ['Geen takken boven het vuur.', 'Hete lucht en vonken gaan omhoog.'],
        ['Niets brandbaars in de buurt, ook niet te dicht bij tenten of gebouwen.', 'Vonken kunnen wegwaaien.'],
        ['Een vrije weg om weg te komen.', 'Als het misgaat, moet iedereen snel weg kunnen.'],
      ]],
      ['Klaarzetten', 'Klaar­zetten', [
        ['Emmers water, en zand met een schep.', 'Om een vuurtje dat overslaat meteen te doven.'],
        ['Een branddeken of vuurzweep.', 'Voor brandend gras of een brandende jas.'],
        ['Schoon water om brandwonden te koelen.', 'Bij een brandwond moet je meteen kunnen koelen.'],
        ['Een telefoon bij de hand.', 'Komt het vuur buiten de stookplek? Bel dan meteen 112.'],
      ]],
      ['Afspraken', 'Afspraken', [
        ['Leiding blijft bij het vuur.', 'Een vuur is nooit alleen, ook niet even.'],
        ['Niet rennen of spelen bij het vuur, en er gaat niets in wat er niet in hoort.', 'Alleen schoon, droog hout.'],
        ['Geen kleding van nylon of fleece vlak bij het vuur.', 'Kunststof brandt snel en smelt vast aan je huid.'],
        ['Aanmaken met aanmaakblokjes of tondel, nooit met spiritus of brandgel.', 'Die geven een steekvlam.'],
        ['Je weet hoe je het vuur straks helemaal uitmaakt.', 'Uit is pas uit als je de resten met je hand kunt aanraken.'],
      ]],
    ],
  },
};

export default function veiligCheck({ set = 'pionieren' } = {}) {
  const { label, klaar, open: nogNiet, fasen } = SETS[set];
  const vinkjes = fasen.map((f) => f[2].map(() => false));
  let fase = 0;

  const lijst = h('ul.vg-lijst');
  const kop = h('p.vg-kop');
  const stand = h('p.vg-stand', { 'aria-live': 'polite' });
  const vorige = actie('Vorige', 'terug', () => naar(fase - 1), { klein: true });
  const volgende = actie('Volgende', 'verder', () => naar(fase + 1), { hoofd: true, klein: true });
  const opnieuw = actie('Opnieuw', 'opnieuw', () => { vinkjes.forEach((v) => v.fill(false)); naar(0); }, { klein: true });
  const balk = stappenBalk({ stappen: fasen.map((f) => f[1]), label, zet: (w) => { fase = Math.round(w); teken(); } });

  function naar(i) {
    fase = Math.max(0, Math.min(fasen.length - 1, i));
    balk.zet(fase);
    teken();
  }

  function teken() {
    const [naam, , items] = fasen[fase];
    kop.textContent = `${fase + 1}. ${naam}`;
    lijst.replaceChildren(...items.map(([wat, waarom], i) => {
      const id = `vg-${set}-${fase}-${i}`;
      const box = h('input', { type: 'checkbox', id, checked: vinkjes[fase][i], onchange: () => { vinkjes[fase][i] = box.checked; tel(); } });
      return h('li', h('label', { for: id }, box, h('span', h('span.vg-wat', wat), h('span.vg-waarom', waarom))));
    }));
    vorige.disabled = fase === 0;
    volgende.hidden = fase === fasen.length - 1;
    tel();
  }

  function tel() {
    const hier = vinkjes[fase].filter(Boolean).length;
    const open = vinkjes.flat().filter((v) => !v).length;
    stand.className = 'vg-stand';
    if (!open) {
      stand.classList.add('goed');
      stand.textContent = klaar;
    } else if (fase === fasen.length - 1) {
      stand.classList.add('open');
      const welke = fasen.map((f, i) => [f[0], vinkjes[i].filter((v) => !v).length]).filter(([, n]) => n);
      stand.textContent = `Nog ${open} ${open === 1 ? 'punt' : 'punten'} open (${welke.map(([n, k]) => `${n.toLowerCase()} ${k}`).join(', ')}). Zolang er iets open staat: ${nogNiet}.`;
    } else {
      stand.textContent = `${hier} van ${vinkjes[fase].length} afgevinkt in deze fase.`;
    }
  }

  teken();
  return h('div.doe-vg', balk.el, kop, lijst, acties(vorige, volgende, opnieuw), stand);
}
