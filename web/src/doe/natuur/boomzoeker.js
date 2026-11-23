// Find a tree by what you see: a question per feature (needles or leaves, how the needles sit, the shape of the
// leaf, its edge, how the leaves sit on the twig, the fruit, the bark, thorns, winter), each with chips. Tap what you
// see, in any order, and skip what you do not know; the trees that still fit stay below. A chip says how many trees
// it would leave, and one that leaves none cannot be chosen. A few pairs stay together to the end (the two birches,
// the two esdoorns): then the lines under the trees tell them apart. The trees are the 29 of the key (sleutel.js);
// the features come from the key and from the cards (TKN §6.1, VIA08 §4.3). Part of the bomen quiz (quiz.js), as its
// third mode "Zoeken".
import { h } from '../../dom.js';
import { BLAD } from '../../data/bladen/index.js';
import { BOMEN, bladIcoon } from '../../plaatjes/natuur.js';
import { actie, acties } from '../knoppen.js';
import { beeld, bladLink } from './gedeeld.js';

const VRAGEN = [
  { id: 'soort', vraag: 'Naalden of bladeren?', opties: [
    ['naald', 'Naalden'], ['enkel', 'Eén blad aan een steel'], ['samen', 'Losse blaadjes aan één steel']] },
  { id: 'naalden', vraag: 'Hoe zitten de naalden aan de twijg?', opties: [
    ['twee', 'Steeds met twee bij elkaar'], ['bosjes', 'In bosjes'], ['prik', 'Los, stijf en prikkend'], ['zacht', 'Los, zacht en plat']] },
  { id: 'vorm', vraag: 'Welke vorm heeft het blad?', opties: [
    ['gelobd', 'Diepe bochten in de rand'], ['hand', 'Als een hand'], ['geveerd', 'Blaadjes in twee rijen'], ['hart', 'Hartvormig'],
    ['driehoek', 'Driehoekig'], ['rond', 'Rond of eirond'], ['ovaal', 'Ovaal, met een punt'], ['lang', 'Veel langer dan breed'],
    ['stekel', 'Dik en stekelig']] },
  { id: 'rand', vraag: 'Hoe ziet de rand van het blad eruit?', opties: [
    ['glad', 'Glad'], ['gezaagd', 'Fijn gezaagd'], ['getand', 'Grote tanden of punten'], ['golvend', 'Golvend'], ['stekelig', 'Met stekels']] },
  { id: 'stand', vraag: 'Hoe zitten de bladeren aan de twijg?', opties: [['tegenover', 'Twee tegenover elkaar'], ['omenom', 'Om en om']] },
  { id: 'vrucht', vraag: 'Wat hangt eraan, of ligt eronder?', opties: [
    ['eikel-lang', 'Eikels aan een lange steel'], ['eikel-kort', 'Eikels zonder of met een korte steel'], ['noot', 'Nootjes'], ['bolster', 'Een stekelige bolster'], ['bes', 'Besjes'], ['kegel', 'Kegels of proppen'],
    ['vleugel', 'Zaadjes met een vleugel'], ['katje', 'Katjes'], ['peul', 'Peulen'], ['bol', 'Bolletjes aan een steel'], ['pluis', 'Pluis']] },
  { id: 'schors', vraag: 'Hoe ziet de stam eruit?', opties: [
    ['glad', 'Glad'], ['ruw', 'Ruw of gebarsten'], ['wit', 'Wit'], ['bladdert', 'Bladdert af in stukken'], ['oranje', 'Oranje bovenin']] },
  { id: 'doorns', vraag: 'Zitten er doorns aan de twijgen?', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  { id: 'winter', vraag: 'Hoe staat hij er in de winter bij?', opties: [['groen', 'Groen'], ['kaal', 'Kaal']] },
];

// What each tree has. A list: any of these fits (a young stam is smoother than an old one). A feature a tree does not
// have (the edge of a needle) is left out, so choosing it leaves that tree out.
const kaal = { doorns: 'nee', winter: 'kaal' };
const BOOM = {
  zomereik: { ...kaal, soort: 'enkel', vorm: 'gelobd', rand: 'glad', stand: 'omenom', vrucht: 'eikel-lang', schors: 'ruw' },
  wintereik: { ...kaal, soort: 'enkel', vorm: 'gelobd', rand: 'glad', stand: 'omenom', vrucht: 'eikel-kort', schors: 'ruw' },
  'amerikaanse-eik': { ...kaal, soort: 'enkel', vorm: 'gelobd', rand: 'getand', stand: 'omenom', vrucht: 'eikel-kort', schors: ['glad', 'ruw'] },
  beuk: { ...kaal, soort: 'enkel', vorm: 'ovaal', rand: 'golvend', stand: 'omenom', vrucht: ['noot', 'bolster'], schors: 'glad' },
  'ruwe-berk': { ...kaal, soort: 'enkel', vorm: 'driehoek', rand: 'gezaagd', stand: 'omenom', vrucht: 'katje', schors: 'wit' },
  'zachte-berk': { ...kaal, soort: 'enkel', vorm: ['driehoek', 'rond'], rand: 'gezaagd', stand: 'omenom', vrucht: 'katje', schors: 'wit' },
  'grove-den': { soort: 'naald', naalden: 'twee', vrucht: 'kegel', schors: ['ruw', 'oranje'], doorns: 'nee', winter: 'groen' },
  fijnspar: { soort: 'naald', naalden: 'prik', vrucht: 'kegel', schors: 'ruw', doorns: 'nee', winter: 'groen' },
  lariks: { ...kaal, soort: 'naald', naalden: 'bosjes', vrucht: 'kegel', schors: 'ruw' },
  douglasspar: { soort: 'naald', naalden: 'zacht', vrucht: 'kegel', schors: 'ruw', doorns: 'nee', winter: 'groen' },
  taxus: { soort: 'naald', naalden: 'zacht', vrucht: 'bes', schors: 'bladdert', doorns: 'nee', winter: 'groen' },
  'gewone-es': { ...kaal, soort: 'samen', vorm: 'geveerd', rand: 'gezaagd', stand: 'tegenover', vrucht: 'vleugel', schors: ['glad', 'ruw'] },
  'gewone-esdoorn': { ...kaal, soort: 'enkel', vorm: 'hand', rand: 'getand', stand: 'tegenover', vrucht: 'vleugel', schors: ['glad', 'ruw'] },
  'noorse-esdoorn': { ...kaal, soort: 'enkel', vorm: 'hand', rand: ['glad', 'getand'], stand: 'tegenover', vrucht: 'vleugel', schors: 'ruw' },
  plataan: { ...kaal, soort: 'enkel', vorm: 'hand', rand: ['glad', 'getand'], stand: 'omenom', vrucht: 'bol', schors: 'bladdert' },
  linde: { ...kaal, soort: 'enkel', vorm: 'hart', rand: 'gezaagd', stand: 'omenom', vrucht: 'noot', schors: ['glad', 'ruw'] },
  schietwilg: { ...kaal, soort: 'enkel', vorm: 'lang', rand: 'gezaagd', stand: 'omenom', vrucht: ['katje', 'pluis'], schors: 'ruw' },
  populier: { ...kaal, soort: 'enkel', vorm: 'driehoek', rand: 'gezaagd', stand: 'omenom', vrucht: ['katje', 'pluis'], schors: 'ruw' },
  'zwarte-els': { ...kaal, soort: 'enkel', vorm: 'rond', rand: 'gezaagd', stand: 'omenom', vrucht: ['kegel', 'katje'], schors: 'ruw' },
  'grauwe-els': { ...kaal, soort: 'enkel', vorm: ['rond', 'ovaal'], rand: 'gezaagd', stand: 'omenom', vrucht: ['kegel', 'katje'], schors: 'glad' },
  haagbeuk: { ...kaal, soort: 'enkel', vorm: 'ovaal', rand: 'gezaagd', stand: 'omenom', vrucht: ['noot', 'vleugel'], schors: 'glad' },
  iep: { ...kaal, soort: 'enkel', vorm: 'ovaal', rand: 'gezaagd', stand: 'omenom', vrucht: 'vleugel', schors: 'ruw' },
  paardenkastanje: { ...kaal, soort: 'samen', vorm: 'hand', rand: 'gezaagd', stand: 'tegenover', vrucht: ['bolster', 'noot'], schors: 'ruw' },
  'tamme-kastanje': { ...kaal, soort: 'enkel', vorm: 'lang', rand: 'getand', stand: 'omenom', vrucht: ['bolster', 'noot'], schors: 'ruw' },
  lijsterbes: { ...kaal, soort: 'samen', vorm: 'geveerd', rand: 'gezaagd', stand: 'omenom', vrucht: 'bes', schors: 'glad' },
  robinia: { soort: 'samen', vorm: 'geveerd', rand: 'glad', stand: 'omenom', vrucht: 'peul', schors: 'ruw', doorns: 'ja', winter: 'kaal' },
  meidoorn: { soort: 'enkel', vorm: 'gelobd', rand: 'getand', stand: 'omenom', vrucht: 'bes', schors: ['glad', 'ruw'], doorns: 'ja', winter: 'kaal' },
  hulst: { soort: 'enkel', vorm: 'stekel', rand: 'stekelig', stand: 'omenom', vrucht: 'bes', schors: 'glad', doorns: 'nee', winter: 'groen' },
  'gewone-vlier': { ...kaal, soort: 'samen', vorm: 'geveerd', rand: 'gezaagd', stand: 'tegenover', vrucht: 'bes', schors: 'ruw' },
};

const heeft = (id, vraag, waarde) => [BOOM[id][vraag]].flat().includes(waarde);
const past = (id, keuzes, behalve = null) => Object.entries(keuzes).every(([v, w]) => v === behalve || heeft(id, v, w));

export function boomZoeker() {
  const keuzes = {};                   // vraag → the chosen answer
  const vragenVak = h('div.nt-zoek-vragen');
  const stand = h('p.nt-vraag', { 'aria-live': 'polite' });
  const boven = h('p.doe-stil.nt-zoek-boven');          // the count at the top too, for a long page on a phone
  const uitkomst = h('ul.nt-raster.nt-zoek-bomen');
  const opnieuw = actie('Begin opnieuw', 'opnieuw', () => { for (const k of Object.keys(keuzes)) delete keuzes[k]; teken(); }, { klein: true });

  function teken() {
    // a question about the leaf does not count for needles, nor one about needles for leaves
    const naald = keuzes.soort === 'naald'; const blad = keuzes.soort && !naald;
    const weg = naald ? ['vorm', 'rand', 'stand'] : blad ? ['naalden'] : [];
    vragenVak.replaceChildren(...VRAGEN.filter((v) => !weg.includes(v.id)).map((v) => {
      const chips = v.opties.map(([w, tekst]) => {
        const aan = keuzes[v.id] === w;
        const n = Object.keys(BOOM).filter((id) => past(id, keuzes, v.id) && heeft(id, v.id, w)).length;
        return h('button.chip', { type: 'button', 'aria-pressed': String(aan), disabled: !aan && !n,
          onclick: () => { if (aan) delete keuzes[v.id]; else keuzes[v.id] = w; teken(); } },
        tekst, h('span.nt-tel', { 'aria-label': `, ${n} ${n === 1 ? 'boom' : 'bomen'}` }, String(n)));
      });
      return h('div.nt-zoek-vraag', h('p.nt-zoek-kop', v.vraag), h('div.chips', { role: 'group', 'aria-label': v.vraag }, chips));
    }));

    const over = Object.keys(BOOM).filter((id) => past(id, keuzes));
    stand.textContent = over.length === 1 ? `Dit is waarschijnlijk de ${BOMEN[over[0]].naam.toLowerCase()}.`
      : Object.keys(keuzes).length ? `Nog ${over.length} bomen over.` : `Tik aan wat je ziet. Weet je iets niet, sla het dan over. Alle ${over.length} bomen:`;
    uitkomst.replaceChildren(...over.map((id) => h('li', beeld(bladIcoon(id)), h('span.nt-naam', BOMEN[id].naam),
      over.length <= 3 && h('span.doe-stil', BOMEN[id].regels.join('; ')),
      over.length <= 3 && BLAD[id] && bladLink(id, `Lees meer over de ${BOMEN[id].naam.toLowerCase()}`))));
    boven.textContent = over.length === 1 ? 'Gevonden! Kijk onderaan.' : `Nog ${over.length} van de ${Object.keys(BOOM).length} bomen over. Ze staan onderaan.`;
    opnieuw.hidden = !Object.keys(keuzes).length;
  }

  teken();
  return h('div.nt-zoek', boven, vragenVak, stand, uitkomst, acties(opnieuw));
}
