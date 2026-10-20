// A determineersleutel for the 25 trees of TKN §6.1 and the four of VIA08 §4.3 (iep, grauwe els, robinia, meidoorn): a question with two to five answers, each answer the next
// question or a tree. You can go back a step, and the trail of answers stays in view, so you see why you ended up
// at a tree. It works on the leaf, so it is a summer key.
import { h } from '../../dom.js';
import { BLAD } from '../../data/bladen/index.js';
import { PLAATJES } from '../../plaatjes.js';
import { bladIcoon } from '../../plaatjes/natuur.js';
import { beeld, bladLink } from './gedeeld.js';
import '../vorm.css';
import './natuur.css';

/** naar: the next question; boom: the end; icoon: the tree whose leaf shows the answer. */
const SLEUTEL = {
  start: { vraag: 'Heeft de boom naalden of bladeren?', opties: [
    { tekst: 'Naalden', naar: 'naald', icoon: 'grove-den' },
    { tekst: 'Bladeren', naar: 'loof', icoon: 'beuk' }] },
  naald: { vraag: 'Hoe zitten de naalden aan de twijg?', opties: [
    { tekst: 'In bosjes van twintig of meer, op korte zijtakjes', boom: 'lariks' },
    { tekst: 'Steeds met twee bij elkaar', boom: 'grove-den' },
    { tekst: 'Los, één voor één', naar: 'los', icoon: 'fijnspar' }] },
  los: { vraag: 'Hoe voelen de naalden?', opties: [
    { tekst: 'Stijf en prikkend; vierkant, elk op een houtig pootje', boom: 'fijnspar' },
    { tekst: 'Zacht en plat', naar: 'zacht', icoon: 'douglasspar' }] },
  zacht: { vraag: 'Wat hangt er aan de boom?', opties: [
    { tekst: 'Kegels met drietandjes tussen de schubben; de naalden ruiken naar citroen', boom: 'douglasspar' },
    { tekst: 'Geen kegels, wel rode besjes; donkere naalden in twee nette rijen', boom: 'taxus' }] },
  loof: { vraag: 'Is het blad één geheel, of bestaat het uit losse blaadjes aan één steel?', opties: [
    { tekst: 'Eén geheel (enkelvoudig)', naar: 'enkel', icoon: 'beuk' },
    { tekst: 'Losse blaadjes aan één steel (samengesteld)', naar: 'samengesteld', icoon: 'gewone-es' }] },
  samengesteld: { vraag: 'Hoe zitten de blaadjes aan de steel?', opties: [
    { tekst: 'Allemaal uit één punt, als een hand', boom: 'paardenkastanje' },
    { tekst: 'In twee rijen langs de steel (geveerd)', naar: 'geveerd', icoon: 'lijsterbes' }] },
  geveerd: { vraag: 'Hoe zitten de bladeren aan de twijg, en wat zie je nog meer?', opties: [
    { tekst: 'Tegenover elkaar, 7 tot 13 blaadjes; dikke zwarte knoppen; zaadjes met één vleugel, in trossen', boom: 'gewone-es' },
    { tekst: 'Om en om; smalle, gezaagde blaadjes; witte bloemschermen of trossen oranjerode bessen', boom: 'lijsterbes' },
    { tekst: 'Om en om; ovale blaadjes met een gladde rand; twee doorns bij elk blad; platte peulen', boom: 'robinia' },
    { tekst: 'Tegenover elkaar, 5 of 7 blaadjes; platte witte schermen of zwarte besjes; wit merg in de takjes; vaak een struik', boom: 'gewone-vlier' }] },
  enkel: { vraag: 'Hoe ziet het blad eruit?', opties: [
    { tekst: 'Als een hand, met vijf punten (handvormig gelobd)', naar: 'hand', icoon: 'gewone-esdoorn' },
    { tekst: 'Met diepe bochten in de rand (gelobd)', naar: 'eik', icoon: 'zomereik' },
    { tekst: 'Dik, glanzend en stekelig; blijft in de winter groen', boom: 'hulst' },
    { tekst: 'Veel langer dan breed', naar: 'lang', icoon: 'schietwilg' },
    { tekst: 'Geen van deze: een gewoon blad', naar: 'gewoon', icoon: 'linde' }] },
  hand: { vraag: 'Hoe zitten de bladeren aan de twijg, en hoe ziet de stam eruit?', opties: [
    { tekst: 'Om en om; de schors bladdert af in grote stukken', boom: 'plataan' },
    { tekst: 'Tegenover elkaar; de schors bladdert niet af', naar: 'esdoorn', icoon: 'gewone-esdoorn' }] },
  esdoorn: { vraag: 'Breek een bladsteel af. Komt er wit melksap uit?', opties: [
    { tekst: 'Ja; de lobben lopen uit in lange, spitse punten', boom: 'noorse-esdoorn' },
    { tekst: 'Nee; de rand is grof gekarteld', boom: 'gewone-esdoorn' }] },
  eik: { vraag: 'Hoe lopen de lobben uit?', opties: [
    { tekst: 'In een spitse punt; een groot blad, tot ruim 20 cm', boom: 'amerikaanse-eik' },
    { tekst: 'Rond', naar: 'eik2', icoon: 'zomereik' },
    { tekst: 'Met een paar tandjes; een klein blad, tot 5 cm; doorns aan de twijgen', boom: 'meidoorn' }] },
  eik2: { vraag: 'Heeft het blad een steel?', opties: [
    { tekst: 'Bijna geen steel, met twee oortjes aan de voet; eikels aan een lange steel', boom: 'zomereik' },
    { tekst: 'Een duidelijke steel; eikels zonder steel op de tak', boom: 'wintereik' }] },
  lang: { vraag: 'Hoe ziet de rand eruit?', opties: [
    { tekst: 'Grote, scherpe tanden met een puntje; het blad is wel 20 cm', boom: 'tamme-kastanje' },
    { tekst: 'Fijn gezaagd; smal, zilverig aan de onderkant; vaak bij het water', boom: 'schietwilg' }] },
  gewoon: { vraag: 'Welke vorm heeft het blad?', opties: [
    { tekst: 'Driehoekig of ruitvormig', naar: 'driehoek', icoon: 'ruwe-berk' },
    { tekst: 'Hartvormig, met een scheve voet', boom: 'linde' },
    { tekst: 'Rond tot eirond; aan de twijgen kleine houten dennenappeltjes (elzenproppen)', naar: 'els', icoon: 'zwarte-els' },
    { tekst: 'Ovaal, met een punt; geen elzenproppen', naar: 'ovaal', icoon: 'beuk' }] },
  els: { vraag: 'Hoe ziet de top van het blad eruit?', opties: [
    { tekst: 'Plat of een beetje ingedeukt; het blad is kaal, jong kleverig', boom: 'zwarte-els' },
    { tekst: 'Spits; de onderkant is grijs en behaard', boom: 'grauwe-els' }] },
  driehoek: { vraag: 'Hoe ziet de stam eruit?', opties: [
    { tekst: 'Wit', naar: 'berk', icoon: 'ruwe-berk' },
    { tekst: 'Grijs of bruin; het blad hangt aan een lange, platte steel en ritselt', boom: 'populier' }] },
  berk: { vraag: 'Voel aan de jonge twijgen.', opties: [
    { tekst: 'Kaal en ruw van kleine wratjes; ze hangen naar beneden', boom: 'ruwe-berk' },
    { tekst: 'Zacht behaard; ze steken schuin omhoog', boom: 'zachte-berk' }] },
  ovaal: { vraag: 'Hoe ziet de rand eruit?', opties: [
    { tekst: 'Glad of golvend, met fijne haartjes; de stam is glad en grijs', boom: 'beuk' },
    { tekst: 'Dubbel gezaagd; het blad is geplooid als een harmonica; de voet is recht', boom: 'haagbeuk' },
    { tekst: 'Dubbel gezaagd; de voet is scheef: de ene helft begint lager aan de steel', boom: 'iep' }] },
};

const plaatjeVan = (boom) => PLAATJES[boom === 'zomereik' || boom === 'wintereik' ? 'eiken' : `boom-${boom}`]?.() ?? bladIcoon(boom);

export default function sleutel() {
  const pad = [];                                   // [{ vraag, antwoord }] so far
  let nu = 'start';
  const spoor = h('ol.nt-spoor', { 'aria-label': 'Je antwoorden tot nu toe' });
  const plek = h('div.nt-plek');
  const melding = h('p.doe-sr', { 'aria-live': 'polite' });
  const terug = h('button.knop.klein', { type: 'button', onclick: () => { const vorige = pad.pop(); if (vorige) { nu = vorige.vraag; toon(); } } }, 'Terug');
  const opnieuw = h('button.knop.klein', { type: 'button', onclick: () => { pad.length = 0; nu = 'start'; toon(); } }, 'Opnieuw');

  function kies(optie) {
    pad.push({ vraag: nu, antwoord: optie.tekst });
    nu = optie.boom ? { boom: optie.boom } : optie.naar;
    toon();
    plek.querySelector('.nt-vraag')?.focus({ preventScroll: true });
  }

  function toon() {
    spoor.replaceChildren(...pad.map((p) => h('li', p.antwoord)));
    spoor.hidden = !pad.length;
    terug.disabled = !pad.length;
    if (typeof nu === 'object') {
      const blad = BLAD[nu.boom];
      plek.replaceChildren(h('div.nt-uitkomst',
        h('p.nt-vraag', { tabindex: '-1' }, 'Dit is waarschijnlijk:'),
        h('p.nt-boomnaam', blad.naam),
        beeld(plaatjeVan(nu.boom), 'plaat'),
        h('p', bladLink(nu.boom, `Lees alles over de ${blad.naam.toLowerCase()}`))));
      melding.textContent = `Uitkomst: ${blad.naam}.`;
      return;
    }
    const v = SLEUTEL[nu];
    plek.replaceChildren(h('div.nt-sleutel',
      h('p.nt-vraag', { tabindex: '-1' }, v.vraag),
      h('div.nt-antwoorden', v.opties.map((o) => {
        const icoon = o.boom ?? o.icoon;
        return h('button.nt-antwoord', { type: 'button', onclick: () => kies(o) },
          icoon ? beeld(bladIcoon(icoon), 'klein') : null, h('span', o.tekst));
      }))));
    melding.textContent = `Vraag ${pad.length + 1}: ${v.vraag}`;
  }

  toon();
  return h('div.doe-nt-sleutel', spoor, plek, melding, h('div.knop-rij', terug, opnieuw),
    h('p.doe-stil', 'De plaatjes bij de antwoorden zijn voorbeelden: kijk vooral naar wat er staat.'));
}
