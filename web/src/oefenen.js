// Oefenen: the exercises of the bladen in one place, per category, and each one opened on its own at full width.
// The list comes from the bladen themselves (`doe`), so a new exercise shows up here by itself; a piece marked
// `bekijk` in src/doe/ (a viewer, a calculator, a checklist) stays on its card and out of the list. The list follows
// the niveaus chosen in the menu: a piece is in it when one of its bladen is. A link opens any piece, `bekijk` or not.
// Addresses: #/oefenen and #/oefenen?doe=kompas-koers
import { BLADEN } from './data/bladen/index.js';
import { CATEGORIE, CATEGORIEEN } from './data/categorieen.js';
import { alles, inKeuze } from './data/niveaus.js';
import { h, vul } from './dom.js';
import { DOE } from './doe/index.js';
import { icoon } from './iconen.js';
import { meld } from './melden.js';
import { niveauKeuze } from './opslag.js';
import { href } from './router.js';

/** Every piece a blad shows, by name, each with those bladen; a piece belongs to the category of its first blad. */
function alleStukken() {
  const stukken = new Map();
  for (const b of BLADEN) {
    if (!b.doe || !DOE[b.doe]) continue;
    if (!stukken.has(b.doe)) stukken.set(b.doe, { naam: b.doe, categorie: b.categorie, bladen: [] });
    stukken.get(b.doe).bladen.push(b);
  }
  return stukken;
}

/** Per category the exercises: the pieces without `bekijk`. */
function perCategorie(stukken) {
  const oefeningen = [...stukken.values()].filter((s) => !DOE[s.naam].bekijk);
  return CATEGORIEEN.map((c) => ({ categorie: c, stukken: oefeningen.filter((s) => s.categorie === c.id) }))
    .filter((g) => g.stukken.length > 0);
}

const bladLink = (b) => href('zoeken', { c: b.categorie, blad: b.id });

export function oefenenView() {
  const alle = alleStukken();
  const groepen = perCategorie(alle);
  const stuk = (naam) => alle.get(naam);

  // the niveaus chosen in the menu; `ookBuiten` shows the rest as well, until the choice changes
  let ookBuiten = false;
  const inhoud = h('div.smal');
  const lijst = h('div.scroll', inhoud);
  function tekenLijst() {
    const keuze = niveauKeuze();
    const toon = (s) => ookBuiten || s.bladen.some((b) => inKeuze(b.id, keuze));
    const getoond = groepen.map((g) => ({ ...g, stukken: g.stukken.filter(toon) })).filter((g) => g.stukken.length > 0);
    const aantal = getoond.reduce((n, g) => n + g.stukken.length, 0);
    const weg = groepen.reduce((n, g) => n + g.stukken.length, 0) - aantal;
    vul(inhoud,
      h('p.intro', `${aantal} ${aantal === 1 ? 'oefening' : 'oefeningen'} om jezelf te testen: een route lopen, een morseletter raden, een wolk herkennen, een vuur bouwen. Elk hoort bij een onderwerp in Zoeken. Daar staat de uitleg, en daar vind je ook wat je alleen bekijkt of uitrekent, zoals de bouwwerken in 3D en de sterrenkaart.`),
      getoond.map(({ categorie, stukken }) => h('section.oef-groep', { 'data-familie': categorie.kleur },
        h('h2.oef-kop', icoon(categorie.icoon, 'icoon'), categorie.naam),
        h('ul.oef-lijst', stukken.map((s) => h('li', h('a.oef-stuk', { href: href('oefenen', { doe: s.naam }) },
          h('strong', DOE[s.naam].titel),
          h('span', s.bladen.map((b) => b.naam).join(' · ')))))))),
      weg > 0 && !ookBuiten && !alles(keuze) && h('div.buiten-lijst',
        h('p', `Nog ${weg} bij andere niveaus.`),
        h('button.knop.klein', { type: 'button', onclick: () => { ookBuiten = true; tekenLijst(); } }, 'Toon ze ook')));
  }
  tekenLijst();

  const kop = h('h1');
  const plek = h('div.doe-plek');
  const lees = h('ul.chips');
  const los = h('div.scroll', h('div.smal.oef-los', h('section.doe', plek), h('section.zieook', h('h3', 'Lees erover'), lees),
    h('p.meld-link', h('button', { type: 'button', onclick: () => meld({ doe: open }) }, 'Werkt dit niet goed? Meld het'))));
  const balk = h('header.balk', h('div.balk-rij', kop));
  const terug = h('div.kruimel', h('a.kruimel-terug', { href: href('oefenen') }, icoon('terug', 'icoon klein'), 'Oefenen'));
  const paneel = h('section.paneel', balk, lijst);
  const el = h('div.view.enkel', paneel);
  let open = null;

  function update({ doe } = {}) {
    const s = doe && stuk(doe);
    if (!s) {
      open = null;
      kop.textContent = 'Oefenen';
      terug.remove();
      plek.replaceChildren();               // the piece cleans up after itself once it is out of the page
      los.replaceWith(lijst);
      if (!lijst.isConnected) paneel.append(lijst);
      return;
    }
    balk.prepend(terug);
    kop.textContent = DOE[s.naam].titel;
    lees.replaceChildren(...s.bladen.map((b) => h('li', h('a.chip', { href: bladLink(b), 'data-familie': CATEGORIE[b.categorie].kleur }, b.naam))));
    if (open !== s.naam) {
      open = s.naam;
      const d = DOE[s.naam];
      plek.replaceChildren(h('p.leeg', 'Even laden…'));
      d.laad().then((m) => { if (open === s.naam) plek.replaceChildren(m.default(d.opties ?? {})); })
        .catch(() => { if (open === s.naam) plek.replaceChildren(h('p.leeg', 'Dit laadt niet. Probeer het later nog eens.')); dispatchEvent(new Event('laadfout')); });
    }
    lijst.replaceWith(los);
    if (!los.isConnected) paneel.append(los);
    los.scrollTop = 0;
  }

  return { el, update, herteken: () => { ookBuiten = false; tekenLijst(); }, titel: ({ doe } = {}) => (doe && stuk(doe) ? DOE[doe].titel : 'Oefenen') };
}
