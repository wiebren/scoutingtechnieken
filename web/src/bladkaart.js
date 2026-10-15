// The card of a blad, as Zoeken and Insignes show it: the name and its other names, the uitleg, what it is for,
// what to watch out for, where to read on (EHBO: the Rode Kruis app, not steps of our own), related bladen, and
// where it is in the insignelaag. The source is shown for rules (`letterlijk`): there it matters where it comes
// from and how recent it is. Elsewhere `bron` is for us (a key of the notes) and stays out of sight.
import { BLAD } from './data/bladen/index.js';
import { CATEGORIE, groepNaam } from './data/categorieen.js';
import { inLaag } from './data/insignes.js';
import { h } from './dom.js';
import { icoon } from './iconen.js';
import { href } from './router.js';

/** Text as paragraphs: a string, or a list of them; lines starting with "- " are put together in a list. */
export function alinea(tekst) {
  const regels = Array.isArray(tekst) ? tekst : [tekst];
  const uit = [];
  for (const regel of regels) {
    if (regel.startsWith('- ')) {
      const lijst = uit.at(-1)?.tagName === 'UL' ? uit.at(-1) : uit[uit.push(h('ul')) - 1];
      lijst.append(h('li', regel.slice(2)));
    } else uit.push(h('p', regel));
  }
  return uit;
}

/**
 * @param blad the blad
 * @param linkNaar (id) => the address of another blad in the same view
 */
export function bladKaart(blad, { linkNaar }) {
  const categorie = CATEGORIE[blad.categorie];
  const ook = [...(blad.ook ?? [])];
  const leeg = !blad.uitleg && !blad.waarvoor;
  const laag = inLaag(blad.id);
  const naar = (blad.naar ?? []).filter((n) => n.blad && BLAD[n.blad]);

  return h('article.blad', { 'data-familie': categorie.kleur },
    h('p.pad', h('a', { href: href('zoeken', { c: categorie.id }) }, categorie.naam), ' › ',
      h('a', { href: href('zoeken', { c: categorie.id, g: blad.groep }) }, groepNaam(categorie.id, blad.groep))),
    h('h2', { tabindex: '-1' }, blad.naam),
    (ook.length || blad.en || blad.abok) && h('dl.namen',
      ook.length > 0 && [h('dt', 'Ook'), h('dd', ook.join(' · '))],
      blad.en && [h('dt', 'Engels'), h('dd', { lang: 'en' }, blad.en)],
      blad.abok && [h('dt', 'ABOK'), h('dd', `#${blad.abok}`)]),
    blad.waarvoor && h('section.waarvoor', h('h3', 'Waarvoor'), h('p', blad.waarvoor)),
    blad.uitleg && h('section.uitleg', blad.waarvoor && h('h3', 'Uitleg'), alinea(blad.uitleg)),
    blad.tabel && h('div.tabel-wrap', h('table',
      h('thead', h('tr', blad.tabel.kop.map((k) => h('th', { scope: 'col' }, k)))),
      h('tbody', blad.tabel.rijen.map((rij) => h('tr', rij.map((cel, i) => (i === 0 ? h('th', { scope: 'row' }, cel) : h('td', cel)))))))),
    leeg && h('p.nognie', categorie.nogNiet ?? 'De uitleg hiervan komt nog.'),
    blad.letOp && h('aside.letop', h('strong', 'Let op'), h('p', blad.letOp)),
    blad.verwijs?.length > 0 && h('aside.verwijs',
      h('strong', blad.categorie === 'veiligheid' && blad.groep === 'ehbo' ? 'Wat je moet doen, stap voor stap' : 'Lees verder'),
      blad.categorie === 'veiligheid' && blad.groep === 'ehbo'
        && h('p', 'Deze app geeft geen stappenplannen voor eerste hulp. Gebruik daarvoor een echte EHBO-app, en volg een cursus.'),
      h('ul', blad.verwijs.map((v) => h('li', h('a', { href: v.url, target: '_blank', rel: 'noopener' }, v.naam, icoon('extern', 'icoon klein')))))),
    naar.length > 0 && h('section.zieook', h('h3', 'Zie ook'),
      h('ul.chips', naar.map((n) => h('li', h('a.chip', { href: linkNaar(n.blad) }, BLAD[n.blad].naam))))),
    laag.length > 0 && h('section.inlaag', h('h3', 'In het insignepakket'),
      h('ul.chips', laag.map(({ insigne, niveau }) => h('li', h('a.chip.niveau', { href: href('insignes', { i: insigne.id, n: niveau }), 'data-niveau': niveau },
        insigne.naam, h('span.niveau-nr', niveau)))))),
    blad.letterlijk && blad.bron && h('p.bron', 'Bron: ', blad.bron, blad.bronDatum && ` (${blad.bronDatum})`));
}
