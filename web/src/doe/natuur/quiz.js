// The recognising quiz of natuur: a drawing (a leaf, a print, a bird) and four names to choose from, or all of them
// side by side to learn first. opties.soort: bomen, prenten or vogels. The drawings are the ones of the cards
// (src/plaatjes/natuur.js), so what you learn on a card is what you are asked here.
import { h } from '../../dom.js';
import { BLAD } from '../../data/bladen/index.js';
import { BOMEN, bladIcoon, PRENTEN, prentIcoon, VOGELS, vogelIcoon } from '../../plaatjes/natuur.js';
import { keuze } from '../knoppen.js';
import { beeld, bladLink, schud } from './gedeeld.js';
import '../vorm.css';
import './natuur.css';

const PRENT_BLAD = { haas: 'haas-en-konijn', konijn: 'haas-en-konijn', hond: 'vos' };
/** Pairs never offered together: a single drawing does not tell them apart (the cards say so; ree and edelhert
 * differ mainly in size, and the quiz draws every hoof print at the same height). */
const APART = [['wolf', 'hond'], ['ruwe-berk', 'zachte-berk'], ['ree', 'edelhert']];
const samenApart = (a, b) => APART.some(([x, y]) => (a === x && b === y) || (a === y && b === x));

/** The kenmerk of a bird, from the table on the card Tuinvogels. */
const vogelKenmerk = (naam) => BLAD.tuinvogels?.tabel.rijen.find(([n]) => n === naam)?.[1] ?? '';

const SOORTEN = {
  bomen: {
    vraag: 'Van welke boom is dit blad?',
    items: () => Object.entries(BOMEN).map(([id, b]) => ({ id, naam: b.naam, svg: bladIcoon(id), info: b.regels.join('; '), blad: id })),
  },
  prenten: {
    vraag: 'Van welk dier is deze prent?',
    items: () => Object.entries(PRENTEN).map(([id, p]) => ({ id, naam: p.naam, svg: prentIcoon(id), info: p.maat, blad: PRENT_BLAD[id] ?? id })),
  },
  vogels: {
    vraag: 'Welke vogel is dit?',
    items: () => Object.entries(VOGELS).map(([id, v]) => ({ id, naam: v.naam, svg: vogelIcoon(id), info: vogelKenmerk(v.naam) })),
  },
};

export default function quiz({ soort = 'bomen' } = {}) {
  const s = SOORTEN[soort];
  const items = s.items();
  let modus = 'raad';
  let stapel = []; let goed = 0; let gehad = 0;
  const plek = h('div.nt-plek');

  function volgende() {
    if (!stapel.length) stapel = schud(items);
    const vraag = stapel.pop();
    const opties = schud([vraag, ...schud(items.filter((i) => i.naam !== vraag.naam && !samenApart(i.id, vraag.id))).slice(0, 3)]);
    const melding = h('p.doe-melding', { 'aria-live': 'polite' });
    const meer = h('p.doe-stil.nt-meer', { hidden: true });
    const verder = h('button.knop.klein.hoofd', { type: 'button', hidden: true, onclick: volgende }, 'Volgende');
    const knoppen = opties.map((o) => h('button.knop.klein.nt-optie', { type: 'button', onclick: () => {
      gehad += 1;
      const raak = o === vraag;
      if (raak) goed += 1;
      knoppen.forEach((k, i) => {
        k.disabled = true;
        if (opties[i] === vraag) k.classList.add('goed');
        else if (opties[i] === o) k.classList.add('fout');
      });
      melding.classList.toggle('fout', !raak);
      melding.textContent = `${raak ? 'Goed!' : `Nee, dit is: ${vraag.naam}.`} ${goed} van de ${gehad} goed.`;
      meer.replaceChildren(vraag.info ? `${vraag.naam}: ${vraag.info}. ` : '', vraag.blad && BLAD[vraag.blad] ? bladLink(vraag.blad, `Lees meer over ${BLAD[vraag.blad].naam.toLowerCase()}`) : '');
      meer.hidden = false;
      verder.hidden = false;
      verder.focus();
    } }, o.naam));
    plek.replaceChildren(h('div.nt-raad',
      beeld(vraag.svg, 'groot'),
      h('div.nt-raad-kant', h('p.nt-vraag', s.vraag), h('div.nt-opties', knoppen), melding, meer, h('div.knop-rij', verder))));
  }

  function bekijk() {
    plek.replaceChildren(h('ul.nt-raster', items.map((i) => h('li', beeld(i.svg), h('span.nt-naam', i.naam),
      soort === 'prenten' && h('span.doe-stil', i.info)))));
  }

  const toon = () => (modus === 'raad' ? volgende() : bekijk());
  toon();
  return h('div.doe-nt-quiz',
    h('div.chips', { role: 'group', 'aria-label': 'Raden of bekijken' }, keuze([['raad', 'Raad'], ['bekijk', 'Bekijk ze allemaal']], modus, (m) => { modus = m; toon(); })),
    plek,
    soort === 'vogels' && h('p.doe-stil', 'De vogels zijn niet op schaal getekend. Zien het mannetje en het vrouwtje er anders uit? Dan is het mannetje getekend.'),
    soort === 'prenten' && h('p.doe-stil', 'Echte prenten zijn bijna nooit zo scherp. Vaak zie je maar een deel. Of de prenten van de voor- en de achterpoot liggen door elkaar.'));
}
