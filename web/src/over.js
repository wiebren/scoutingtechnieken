// Over: what the app is, installing it, what changed (Updates), where the content comes from, and what the app
// keeps on this device. Address: #/over
import { UPDATES } from './data/updates.js';
import { h, vul } from './dom.js';
import { icoon } from './iconen.js';
import { aantalAfgevinkt, volgAfgevinkt, wisAfgevinkt, zetUpdatesGezien } from './opslag.js';

const datum = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
const extern = (url, tekst) => h('a', { href: url, target: '_blank', rel: 'noopener' }, tekst, icoon('extern', 'icoon klein'));

/** @param installeer opens the install dialog (src/main.js) */
export function overView({ installeer }) {
  const gegevens = h('div');
  const wisDialoog = h('dialog.dialoog', { 'aria-labelledby': 'wis-titel' },
    h('h2', { id: 'wis-titel' }, 'Alles uitvinken?'),
    h('p', 'Wat je bij de insignes hebt afgevinkt, wordt van dit toestel gewist. Dat kun je niet terugdraaien.'),
    h('div.knoppen',
      h('button.knop', { type: 'button', onclick: () => wisDialoog.close() }, 'Annuleren'),
      h('button.knop.hoofd', { type: 'button', onclick: () => { wisAfgevinkt(); wisDialoog.close(); } }, 'Wissen')));

  const tekenGegevens = () => {
    const n = aantalAfgevinkt();
    vul(gegevens,
      h('p', 'Wat je afvinkt bij de insignes blijft op dit toestel, in je browser. Er gaat niets naar een server, en er is geen account.'),
      h('p', n ? `Je hebt nu ${n} ${n === 1 ? 'ding' : 'dingen'} afgevinkt.` : 'Je hebt nog niets afgevinkt.'),
      n > 0 && h('button.knop', { type: 'button', onclick: () => wisDialoog.showModal() }, 'Alles uitvinken'));
  };
  tekenGegevens();
  volgAfgevinkt(tekenGegevens);

  const el = h('div.view.enkel',
    h('section.paneel',
      h('header.balk', h('div.balk-rij', h('h1', 'Over'))),
      h('div.scroll', h('div.smal',
        h('section.over-blok',
          h('h2', 'Scoutingtechnieken'),
          h('p', 'Technieken opzoeken en leren: knopen en sjorringen, kaart en kompas, tochttechnieken, seinen en geheimschriften, vuur, buitenkoken, kamperen, natuur, weer en veiligheid. Voor scouts, leiding en iedereen die het wil kunnen.'),
          h('p', 'Varen en de lelievlet hebben een eigen app: ', extern('https://github.com/wiebren/lelievlet', 'Lelievlet 3D'), '.'),
          h('p.melding', 'Dit is een eerste opzet. Veel onderwerpen staan er nog niet in, en het oefenen komt nog.')),
        h('section.over-blok',
          h('h2', 'Installeren'),
          h('p', 'Zet de app op je beginscherm of in je dock. Hij opent dan in een eigen venster en werkt ook zonder internet: in het bos, op een hike.'),
          h('button.knop.hoofd', { type: 'button', onclick: installeer }, 'Installeer als app')),
        h('section.over-blok',
          h('h2', 'Updates'),
          UPDATES.map((u) => h('div.update', h('h3', datum(u.datum)), h('ul', u.punten.map((p) => h('li', p)))))),
        h('section.over-blok',
          h('h2', 'Waar het vandaan komt'),
          h('p', 'De uitleg is in eigen woorden, uit boeken, sites en eisen van scouting en daarbuiten. Regels en eerste hulp volgen de officiële bron, met de datum erbij.'),
          h('ul',
            h('li', 'De indeling bij Insignes volgt het insignepakket van Scouting Nederland (2025). De eisen zelf en de insignes staan op ', extern('https://activiteitenbank.scouting.nl/insignes-en-badges/nieuwe-insignes', 'scouting.nl'), '.'),
            h('li', 'Eerste hulp: alleen wat iets is en wanneer je hulp haalt. Wat je moet doen staat in de ', extern('https://www.rodekruis.nl/ehbo-app/', 'EHBO-app van het Rode Kruis'), '.'),
            h('li', 'Windkracht en onweer: KNMI. Natuurbrandrisico: brandweer.nl.')),
          h('p', 'De app en de teksten erin staan onder ', extern('https://creativecommons.org/licenses/by-nc-sa/4.0/deed.nl', 'CC BY-NC-SA 4.0'),
            ': delen en bewerken mag, niet commercieel, met naamsvermelding en onder dezelfde licentie.')),
        h('section.over-blok', h('h2', 'Je gegevens'), gegevens)))),
    wisDialoog);

  return {
    el,
    update() { zetUpdatesGezien(UPDATES[0].datum); },
    titel: () => 'Over',
  };
}
