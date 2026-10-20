// The card of a blad, as Zoeken and Insignes show it: the name and its other names, the uitleg, what it is for,
// what to watch out for, where to read on (EHBO: the Rode Kruis app, not steps of our own), related bladen, and
// where it is in the insignelaag, and at the foot its sources (src/data/referenties.js, with the ABOK number of a
// knot). The source of a rule (`letterlijk`) is shown with it: there it matters where it comes from and how recent it
// is. Elsewhere `bron` is for us (a key of the notes) and stays out of sight.
import { BEELDEN, BRONNEN } from './data/beelden.js';
import { DOE } from './doe/index.js';
import { abokLink, abokPagina } from './data/abok.js';
import { BLAD } from './data/bladen/index.js';
import { CATEGORIE, groepNaam } from './data/categorieen.js';
import { REFERENTIES } from './data/referenties.js';
import { termLinks } from './termlinks.js';
import { inLaag, insigneBeeld } from './data/insignes.js';
import { inKeuze, niveausVan } from './data/niveaus.js';
import { h } from './dom.js';
import { icoon } from './iconen.js';
import { meld } from './melden.js';
import { isAfgevinkt, niveauKeuze, volgAfgevinkt, zetAfgevinkt } from './opslag.js';
import { href } from './router.js';

/** Text as paragraphs: a string, or a list of them; lines starting with "- " are put together in a list. `links`
 *  turns our own words into text with links (src/termlinks.js); a quote stays as it is. */
export function alinea(tekst, links = (t) => t) {
  const regels = Array.isArray(tekst) ? tekst : [tekst];
  const uit = [];
  // a line that is a quote („…”, a rule taken over word for word) looks like one, apart from our own words
  const citaat = (t) => t.startsWith('„');
  // in the quote block the marks around a whole line are left off: the block already says it is quoted
  const zonderTekens = (t) => t.replace(/^„([^„”]*)”([.,;:]?(?:\s*\([^()]*\))?)$/, '$1$2');
  for (const regel of regels) {
    if (regel.startsWith('- ')) {
      const item = regel.slice(2);
      const vorige = uit.at(-1);
      const lijst = vorige?.tagName === 'UL' && vorige.classList.contains('citaten') === citaat(item) ? vorige
        : uit[uit.push(h(citaat(item) ? 'ul.citaten' : 'ul')) - 1];
      lijst.append(h('li', citaat(item) ? zonderTekens(item) : links(item)));
    } else uit.push(citaat(regel) ? h('p.citaat', zonderTekens(regel)) : h('p', links(regel)));
  }
  return uit;
}

/** Credits that link where the licence asks for it: OpenStreetMap to its copyright page, a CC licence to its text,
 *  and the layers on top to where they come from. */
const BRON_LINKS = {
  '© OpenStreetMap-bijdragers': 'https://www.openstreetmap.org/copyright',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/deed.nl',
  'Waymarked Trails': 'https://hiking.waymarkedtrails.org/',
  'OpenSeaMap': 'https://www.openseamap.org/',
};
const bronPatroon = new RegExp(Object.keys(BRON_LINKS).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
function bronMetLinks(tekst) {
  const uit = [];
  let i = 0;
  for (const m of tekst.matchAll(bronPatroon)) {
    uit.push(tekst.slice(i, m.index), h('a', { href: BRON_LINKS[m[0]], target: '_blank', rel: 'noopener' }, m[0]));
    i = m.index + m[0].length;
  }
  return [...uit, tekst.slice(i)];
}

/** One picture with its caption and where it comes from; a tap opens it at full size. */
function figuur({ beeld, bij }) {
  const b = BEELDEN[beeld];
  return h('figure.beeld', { class: b.smal ? 'smal' : null },
    h('a.beeld-open', { href: b.src, target: '_blank', rel: 'noopener', title: 'Groot openen' },
      h('img', { src: b.src, alt: b.alt, width: b.w, height: b.h, loading: 'lazy', decoding: 'async' })),
    h('figcaption', bij && h('span', bij), h('span.beeld-bron', bronMetLinks(BRONNEN[b.bron]))));
}

/** The pictures of a blad: one under the other, or - when each has a titel - one at a time, with chips. */
function beelden(lijst) {
  if (!lijst.every((b) => b.titel)) return lijst.map(figuur);
  const plek = h('div.beeld-plek', figuur(lijst[0]));
  const chips = lijst.map((b, i) => h('button.chip', { type: 'button', 'aria-pressed': String(i === 0), onclick: () => {
    chips.forEach((c, j) => c.setAttribute('aria-pressed', String(i === j)));
    plek.replaceChildren(figuur(b));
  } }, b.titel));
  return h('div.beelden', h('div.chips', { role: 'group', 'aria-label': 'Kies een beeld' }, chips), plek);
}

/** The drawings are a chunk of their own (several hundred kB of SVG), loaded with the first card that has one. */
let PLAATJES = null;
let plaatjesLaden = null;
function metPlaatjes(teken) {
  if (PLAATJES) teken();
  else {
    plaatjesLaden ??= import('./plaatjes.js').then((m) => { PLAATJES = m.PLAATJES; });
    plaatjesLaden.then(teken).catch(() => { plaatjesLaden = null; dispatchEvent(new Event('laadfout')); });
  }
}
function plaatje(naam) {
  const fig = h('figure.figuur');
  metPlaatjes(() => { fig.innerHTML = PLAATJES[naam](); });
  return fig;
}

/** The kinds of a thing side by side (`soorten: [{ naam, plaatje, blad?, bij }]`): a small drawing, the name and a
 *  line each. A kind with a blad of its own is a link to it; the others are not. The drawing is decoration there:
 *  the name and the line say what it shows. */
function soorten(lijst, label, linkNaar) {
  const plekken = [];
  const tegels = lijst.map((s) => {
    const plek = h('span.soort-plaatje');
    plekken.push([plek, s.plaatje]);
    const naam = h('span.soort-naam', h('span', s.naam));
    const link = s.blad && BLAD[s.blad];
    if (link) naam.append(icoon('verder', 'icoon klein'));
    return h('li', h(link ? 'a.soort' : 'div.soort', { href: link ? linkNaar(s.blad) : null }, plek, naam, s.bij && h('span.soort-bij', s.bij)));
  });
  metPlaatjes(() => {
    for (const [plek, naam] of plekken) {
      plek.innerHTML = PLAATJES[naam]();
      plek.firstElementChild?.setAttribute('aria-hidden', 'true');
    }
  });
  return h('ul.soorten', { 'aria-label': label }, tegels);
}

/** A line on a card opened outside the niveaus chosen in the menu (a link still opens it); src/main.js shows or
 *  hides it when the choice changes. */
function buitenNiveau(id) {
  const nrs = niveausVan(id).filter((k) => k !== 'extra');
  const tekst = nrs.length
    ? `Dit hoort bij niveau ${nrs.length > 1 ? `${nrs.slice(0, -1).join(', ')} en ${nrs.at(-1)}. Die niveaus staan` : `${nrs[0]}. Dat niveau staat`} in het menu niet aan.`
    : 'Dit hoort bij Extra: het zit in geen insigne. Extra staat in het menu niet aan.';
  return h('p.buiten-niveau', { 'data-blad': id, hidden: inKeuze(id, niveauKeuze()) }, tekst);
}

/** An interactive piece (src/doe/), loaded when the card opens. */
function doe(naam) {
  const d = DOE[naam];
  const plek = h('div.doe-plek', h('p.leeg', 'Even laden…'));
  d.laad().then((m) => plek.replaceChildren(m.default(d.opties ?? {})))
    .catch(() => { plek.replaceChildren(h('p.leeg', 'Dit laadt niet. Probeer het later nog eens.')); dispatchEvent(new Event('laadfout')); });
  return h('section.doe', h('h3', d.titel), plek);
}

/** One source: a web page by its name, a book as "Titel — Auteur (jaar), blz. N"; a link when it can be read online. */
export function bron(r) {
  const tekst = r.boek
    ? [h('cite', r.boek), r.auteur && ` — ${r.auteur}`, r.jaar && ` (${r.jaar})`, r.nr && `, nr. ${r.nr}`, r.blz && `, blz. ${r.blz}`, r.par && `, ${r.par}`]
    : [r.naam];
  return r.url ? h('a', { href: r.url, target: '_blank', rel: 'noopener' }, tekst, icoon('extern', 'icoon klein')) : tekst;
}

/** The sources of a blad, small at the foot of the card; the ABOK number of a knot is one of them (a link to that page
 *  of the scan). Not "Lees verder" (`verwijs`): these are where the facts come from. A page that is already under
 *  "Lees verder" is not shown twice. */
function bronnen(blad) {
  const alVerwezen = new Set((blad.verwijs ?? []).map((v) => v.url));
  const lijst = (REFERENTIES[blad.id] ?? []).filter((r) => !alVerwezen.has(r.url));
  if (blad.abok) {
    lijst.unshift({ boek: 'The Ashley Book of Knots', auteur: 'Clifford W. Ashley', jaar: 1944, nr: blad.abok, blz: abokPagina(blad.abok), url: abokLink(blad.abok) });
  }
  return lijst.length > 0 && h('section.bronnen', h('h3', 'Bronnen'), h('ul', lijst.map((r) => h('li', bron(r)))));
}

/**
 * @param blad the blad
 * @param linkNaar (id) => the address of another blad in the same view
 */
/** "Ik kan dit" ("Ik ken dit" on a blad about knowing, `ken`), with the insignes the blad is in: the same tick as there (by the blad's id), so it shows there too. */
function kanIk(blad) {
  const box = h('input', { type: 'checkbox', checked: isAfgevinkt(blad.id), onchange: () => zetAfgevinkt(blad.id, box.checked) });
  const el = h('label.vink.kan-ik', box, h('span.vinkje', icoon('vink')), h('span', blad.ken ? 'Ik ken dit' : 'Ik kan dit'));
  const stop = volgAfgevinkt(() => { if (!el.isConnected) { stop(); return; } box.checked = isAfgevinkt(blad.id); });
  return el;
}

export function bladKaart(blad, { linkNaar }) {
  const categorie = CATEGORIE[blad.categorie];
  const ook = [...(blad.ook ?? [])];
  const leeg = !blad.uitleg && !blad.waarvoor;
  const laag = inLaag(blad.id);
  const naar = (blad.naar ?? []).filter((n) => n.blad && BLAD[n.blad]);
  const links = termLinks(blad.id, linkNaar);

  return h('article.blad', { 'data-familie': categorie.kleur },
    h('p.pad', h('a', { href: href('zoeken', { c: categorie.id }) }, categorie.naam), ' › ',
      h('a', { href: href('zoeken', { c: categorie.id, g: blad.groep }) }, groepNaam(categorie.id, blad.groep))),
    h('h2', { tabindex: '-1' }, blad.naam),
    buitenNiveau(blad.id),
    blad.waarvoor && h('section.waarvoor', h('h3', 'Waarvoor'), h('p', links(blad.waarvoor))),
    blad.uitleg && h('section.uitleg', blad.waarvoor && h('h3', 'Uitleg'), alinea(blad.uitleg, links)),
    blad.soorten?.length > 0 && soorten(blad.soorten, blad.naam, linkNaar),
    blad.plaatje && plaatje(blad.plaatje),
    blad.beelden?.length > 0 && beelden(blad.beelden),
    blad.doe && doe(blad.doe),
    blad.tabel && h('div.tabel-wrap', h('table',
      h('thead', h('tr', blad.tabel.kop.map((k) => h('th', { scope: 'col' }, k)))),
      h('tbody', blad.tabel.rijen.map((rij) => h('tr', rij.map((cel, i) => (i === 0 ? h('th', { scope: 'row' }, cel) : h('td', cel)))))))),
    leeg && h('p.nognie', categorie.nogNiet ?? 'De uitleg hiervan komt nog.'),
    blad.letOp && h('aside.letop', h('strong', 'Let op'), h('p', blad.letOp.startsWith('„') ? blad.letOp : links(blad.letOp)), blad.letOpPlaatje && plaatje(blad.letOpPlaatje)),
    blad.verwijs?.length > 0 && h('aside.verwijs',
      h('strong', blad.categorie === 'veiligheid' && blad.groep === 'ehbo' ? 'Wat je moet doen, stap voor stap' : 'Lees verder'),
      blad.categorie === 'veiligheid' && blad.groep === 'ehbo'
        && h('p', 'Deze app is geen EHBO-app. Het hele stappenplan staat in een echte EHBO-app, en je leert het op een EHBO-cursus.'),
      h('ul', blad.verwijs.map((v) => h('li', h('a', { href: v.url, target: '_blank', rel: 'noopener' }, v.naam, icoon('extern', 'icoon klein')))))),
    naar.length > 0 && h('section.zieook', h('h3', 'Zie ook'),
      h('ul.chips', naar.map((n) => h('li', h('a.chip', { href: linkNaar(n.blad) }, BLAD[n.blad].naam))))),
    laag.length > 0 && h('section.inlaag', h('h3', 'Bij de insignes'), kanIk(blad),
      h('ul.chips', laag.map(({ insigne, niveau }) => h('li', h('a.chip.niveau', { href: href('insignes', { i: insigne.id, n: niveau }), 'data-niveau': niveau },
        h('img.chip-badge', { src: insigneBeeld(insigne.id, niveau), alt: '', width: 240, height: 208 }),
        insigne.naam, h('span.niveau-nr', niveau)))))),
    // other names and the sources: at the foot, small
    (ook.length || blad.en) && h('dl.namen',
      ook.length > 0 && [h('dt', 'Ook'), h('dd', ook.join(' · '))],
      blad.en && [h('dt', 'Engels'), h('dd', { lang: 'en' }, blad.en)]),
    bronnen(blad),
    blad.letterlijk && blad.bron && h('p.bron', 'Bron: ', blad.bron, blad.bronDatum && ` (${blad.bronDatum})`),
    h('p.meld-link', h('button', { type: 'button', onclick: () => meld({ blad: blad.id }) }, 'Klopt er iets niet? Meld het')));
}
