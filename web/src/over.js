// Instellingen: the theme (licht, donker or like the device), what the app is, installing it, what changed
// (Updates), where the content comes from, and what the app keeps on this device. Behind the gear. Address: #/over
import { UPDATES } from './data/updates.js';
import { h, vul } from './dom.js';
import { icoon } from './iconen.js';
import { meld, melderBewaard, vergeetMelder } from './melden.js';
import { aantalAfgevinkt, thema, volgAfgevinkt, wisAfgevinkt, zetThema, zetUpdatesGezien } from './opslag.js';

const datum = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
const extern = (url, tekst) => h('a', { href: url, target: '_blank', rel: 'noopener' }, tekst, icoon('extern', 'icoon klein'));
/** The handleiding next to the app: published, the app is in app/ beside it (scripts/pages.mjs); in dev it is web/site/. */
const HANDLEIDING = import.meta.env.PROD ? '../handleiding/' : 'site/handleiding/';

/** @param installeer opens the install dialog (src/main.js) */
export function overView({ installeer }) {
  const gegevens = h('div');
  const wisDialoog = h('dialog.dialoog', { 'aria-labelledby': 'wis-titel' },
    h('h2', { id: 'wis-titel' }, 'Alles uitvinken?'),
    h('p', 'Dan wis je alles wat je bij de insignes hebt afgevinkt, op dit toestel. Dat kun je niet terugdraaien.'),
    h('div.knoppen',
      h('button.knop', { type: 'button', onclick: () => wisDialoog.close() }, 'Annuleren'),
      h('button.knop.hoofd', { type: 'button', onclick: () => { wisAfgevinkt(); wisDialoog.close(); } }, 'Wissen')));

  const tekenGegevens = () => {
    const n = aantalAfgevinkt();
    vul(gegevens,
      h('p', 'Wat je afvinkt bij de insignes en welk niveau je kiest, bewaart de app alleen op dit toestel, in je browser. Het gaat nergens anders heen. Je hebt ook geen account nodig.'),
      h('p', 'Alleen een melding gaat het internet op, en alleen als je hem zelf verstuurt. Vul je daar je naam in, dan onthoudt de app die op dit toestel voor de volgende melding.'),
      h('p', n ? `Je hebt nu ${n} ${n === 1 ? 'ding' : 'dingen'} afgevinkt.` : 'Je hebt nog niets afgevinkt.'),
      n > 0 && h('button.knop', { type: 'button', onclick: () => wisDialoog.showModal() }, 'Alles uitvinken'),
      melderBewaard() && [
        h('p', 'De app onthoudt nu je naam van je laatste melding.'),
        h('button.knop', { type: 'button', onclick: () => { vergeetMelder(); tekenGegevens(); } }, 'Vergeet mijn naam')]);
  };
  tekenGegevens();
  volgAfgevinkt(tekenGegevens);

  // licht, donker or automatisch: one choice, as a row of chips
  const themaKeuzes = [['auto', 'Automatisch'], ['licht', 'Licht'], ['donker', 'Donker']];
  const themaChips = themaKeuzes.map(([waarde, tekst]) => h('button.chip', {
    type: 'button', 'aria-pressed': String(thema() === waarde),
    onclick: () => { zetThema(waarde); for (const [k, c] of themaChips.entries()) c.setAttribute('aria-pressed', String(themaKeuzes[k][0] === waarde)); },
  }, tekst));

  const el = h('div.view.enkel',
    h('section.paneel',
      h('header.balk', h('div.balk-rij', h('h1', 'Instellingen'))),
      h('div.scroll', h('div.smal',
        h('section.over-blok',
          h('h2', 'Thema'),
          h('div.chips', { role: 'group', 'aria-label': 'Thema' }, themaChips),
          h('p.stil', 'Automatisch doet wat je toestel doet: licht als je toestel licht staat, donker als het donker staat.')),
        h('section.over-blok',
          h('h2', 'Melden'),
          h('p', 'Klopt er iets niet, werkt een oefening niet goed, of mis je iets? Laat het weten. Op elk onderwerp staat onderaan ook een knop om het te melden.'),
          h('button.knop.hoofd', { type: 'button', onclick: () => meld() }, 'Meld iets')),
        h('section.over-blok',
          h('h2', 'Scoutingtechnieken'),
          h('p', 'Technieken opzoeken en leren: knopen en sjorringen, kaart en kompas, tochttechnieken, seinen en geheimschriften, vuur, buitenkoken, kamperen, natuur, weer en veiligheid. Voor scouts, leiding en iedereen die het wil kunnen.'),
          h('p', 'Hoe alles werkt, en tips voor leiding, staat in de ', extern(HANDLEIDING, 'handleiding'), '.'),
          h('p', 'Varen en de lelievlet hebben een eigen app: ', extern('https://scoutvaardig.nl/lelievlet/', 'Lelievlet 3D'), '.'),
          h('p', 'Tik in het menu een of meer niveaus aan: 1, 2 of 3, net als bij de insignes. Extra is alles wat in geen insigne zit. Zoeken, Oefenen en Insignes laten dan alleen zien wat daarbij hoort. Staat er niets aan? Dan zie je alles.'),
          h('p.melding', 'De knopen hebben voor nu een eenvoudige tekening. De stappen om ze te leggen komen later, uit een apart project.')),
        h('section.over-blok',
          h('h2', 'Installeren'),
          h('p', 'Zet de app op je beginscherm of in je dock. Hij opent dan in een eigen venster en werkt ook zonder internet: in het bos, op een hike.'),
          h('button.knop.hoofd', { type: 'button', onclick: installeer }, 'Installeer als app')),
        UPDATES.length > 0 && h('section.over-blok',
          h('h2', 'Updates'),
          UPDATES.map((u) => h('div.update', h('h3', datum(u.datum)), h('ul', u.punten.map((p) => h('li', p)))))),
        h('section.over-blok',
          h('h2', 'Waar het vandaan komt'),
          h('p', 'De uitleg staat in eigen woorden. Hij komt uit boeken, sites en eisen van scouting en daarbuiten. Regels en eerste hulp volgen de officiële bron, met de datum erbij.'),
          h('ul',
            h('li', 'De indeling bij Insignes volgt het insignepakket van Scouting Nederland (2025). De afbeeldingen van de insignes zijn van Scouting Nederland; de eisen zelf staan op ', extern('https://activiteitenbank.scouting.nl/insignes-en-badges/nieuwe-insignes', 'scouting.nl'), '.'),
            h('li', 'Eerste hulp: wat iets is, wat je als eerste doet en wanneer je hulp haalt, volgens de Nederlandse Richtlijnen Eerste Hulp 2026. De rest staat in de ', extern('https://www.rodekruis.nl/ehbo-app/', 'EHBO-app van het Rode Kruis'), ', en leer je op een cursus.'),
            h('li', 'Weer, windkracht en onweer: KNMI. Natuurbrandrisico en brand: brandweer.nl. Sterren: de Yale Bright Star Catalogue.'),
            h('li', 'Kaarten: het Kadaster (TOPraster, CC BY 4.0), © OpenStreetMap-bijdragers, OpenSeaMap en Waymarked Trails. De bron staat onder elk beeld. De legenda is nagetekend naar die van het Kadaster (CC BY 4.0).'),
            h('li', 'Namen en uitleg ook uit ', extern('https://nl.scoutwiki.org/', 'Scoutpedia'), ' (CC BY-NC-SA 4.0) en oude scoutingboeken. Een paar knooptekeningen zijn nagetekend naar foto’s en tekeningen op Wikimedia Commons. Alles staat in de handleiding, bij Bronnen en licentie.')),
          h('p', 'De app en de teksten erin staan onder ', extern('https://creativecommons.org/licenses/by-nc-sa/4.0/deed.nl', 'CC BY-NC-SA 4.0'),
            ': delen en bewerken mag, niet commercieel, met naamsvermelding en onder dezelfde licentie.')),
        h('section.over-blok', h('h2', 'Je gegevens'), gegevens)))),
    wisDialoog);

  return {
    el,
    update() { if (UPDATES.length) zetUpdatesGezien(UPDATES[0].datum); tekenGegevens(); },   // a report may have kept a name since
    titel: () => 'Instellingen',
  };
}
