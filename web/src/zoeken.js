// Zoeken: the bladen by category, or found by name. Three steps: with nothing chosen the categories stand as
// tiles; a category lists its groepen; a groep lists its bladen. A category with one groep lists its bladen at once.
// Typing searches all bladen (or one category, when one is chosen). As Zoeken in vlet, without the boat.
// Address: #/zoeken?q=&c=&g=&blad=
// Lists show only the bladen of the niveaus chosen in the menu (src/niveaukeuze.js); what falls outside is counted
// under the list, with a button to show it too. A link to a blad opens it either way.
import { BLAD, BLADEN } from './data/bladen/index.js';
import { CATEGORIE, CATEGORIEEN, groepNaam } from './data/categorieen.js';
import { alles, inKeuze, inWoorden } from './data/niveaus.js';
import { bladTekens, tegelVoet } from './bladtekens.js';
import { h, vul } from './dom.js';
import { groepIcoon } from './groepiconen.js';
import { icoon } from './iconen.js';
import { niveauKeuze, volgAfgevinkt } from './opslag.js';
import { ga, href, terug } from './router.js';
import { splitView } from './splitview.js';
import { zoek } from './zoek.js';

const meer = (n) => (n === 1 ? '1 onderwerp' : `${n} onderwerpen`);

const eersteRegel = (b) => (b.waarvoor ?? (Array.isArray(b.uitleg) ? b.uitleg[0] : b.uitleg) ?? b.ook?.join(' · ') ?? '').replace(/^- /, '');

export function zoekenView() {
  let params = {};
  const zonder = (key) => Object.fromEntries(Object.entries(params).filter(([k]) => k !== key));
  const linkNaar = (id) => href('zoeken', { ...params, blad: id });
  const sv = splitView({
    leeg: 'Kies een onderwerp uit de lijst.',
    opTerug: () => terug('zoeken', zonder('blad')),
    linkNaar,
  });

  const veld = h('input.zoekveld', {
    type: 'search', placeholder: 'Zoek een knoop, sein of techniek', 'aria-label': 'Zoek', enterkeyhint: 'search',
    autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
    oninput: () => ga('zoeken', { ...params, q: veld.value.trim() ? veld.value : '' }, { vervang: true }),
    onkeydown: (e) => { if (e.key === 'Enter') veld.blur(); },              // a phone puts the keyboard away
  });
  const filter = h('div.filter');
  vul(sv.lijstBalk, h('div.balk-rij', h('h1', 'Zoeken')), h('div.zoekrij', icoon('zoeken', 'icoon zoekicoon'), veld), filter);

  const rij = (b, sub) => h('a.rij', { href: linkNaar(b.id), 'data-blad': b.id },
    h('span.rij-naam', b.naam), bladTekens(b.id), sub && h('span.rij-sub', sub), icoon('verder', 'icoon rij-pijl'));

  // the niveaus chosen in the menu; `ookBuiten` shows the rest as well, until another list is opened
  let ookBuiten = false;
  const zichtbaar = (b) => ookBuiten || inKeuze(b.id, niveauKeuze());
  const gefilterd = () => !ookBuiten && !alles(niveauKeuze());
  /** Under a list: how many are left out by the choice of niveau, and a button to show them. */
  const buiten = (n) => n > 0 && gefilterd() && h('div.buiten-lijst',
    h('p', `Nog ${meer(n)} bij andere niveaus.`),
    h('button.knop.klein', { type: 'button', onclick: () => { ookBuiten = true; tekenLijst(); } }, 'Toon ze ook'));

  function tegels() {
    const keuze = niveauKeuze();
    const getoond = BLADEN.filter(zichtbaar).length;
    return [
      h('p.intro', `Zoek op naam, of kies een categorie. Er staan nu ${BLADEN.length} onderwerpen in, en er komen er nog meer bij.`,
        getoond < BLADEN.length && ` ${inWoorden(keuze)}: ${meer(getoond)}.`),
      h('ul.tegels', CATEGORIEEN.map((c) => {
        const aantal = BLADEN.filter((b) => b.categorie === c.id && zichtbaar(b)).length;
        return h('li', h('a.tegel', { href: href('zoeken', { c: c.id }), 'data-familie': c.kleur, class: aantal ? null : 'leeg' },
          h('span.tegel-icoon', icoon(c.icoon)), h('span.tegel-naam', c.naam),
          h('span.tegel-aantal', meer(aantal))));
      })),
    ];
  }

  const leegTekst = (alle) => (alle.length ? 'Hier staat niets op de niveaus die je hebt gekozen.' : 'Hier staat nog niets in.');
  /** A category with one groep shows its bladen at once: no step in between. */
  const metGroepen = (c) => c.groepen.length > 1;

  /** A category: its groepen, each with how many bladen and the first few names. */
  function groepLijst(c) {
    const alle = BLADEN.filter((b) => b.categorie === c.id);
    const bladen = alle.filter(zichtbaar);
    const open = BLAD[params.blad];
    const rijen = c.groepen.map(([g, naam]) => {
      const hier = bladen.filter((b) => b.groep === g);
      const sub = hier.length ? hier.slice(0, 4).map((b) => b.naam).join(' · ') + (hier.length > 4 ? ' …' : '')
        : alle.some((b) => b.groep === g) ? 'Niets op je niveau' : 'Nog leeg';
      // a tile, as the categories on the first page: an icon, the name, a few of its onderwerpen, and at the foot the
      // niveaus in it and how many you have ticked off
      return h('li', h('a.tegel.groep-tegel', {
        href: href('zoeken', { c: c.id, g, ...(open?.groep === g && open.categorie === c.id ? { blad: open.id } : {}) }),
        class: hier.length ? null : 'leeg', 'aria-current': open?.categorie === c.id && open.groep === g ? 'true' : null,
        'data-familie': c.kleur,
      }, h('span.tegel-icoon', groepIcoon(c.id, g)), h('span.tegel-naam', naam), h('span.tegel-sub', sub),
        hier.length > 0 && tegelVoet(hier)));
    });
    return [h('p.toon-alles', h('a', { href: href('zoeken', { c: c.id, g: 'alles' }) }, 'Toon alles')),
      h('ul.tegels.groep-tegels', rijen), buiten(alle.length - bladen.length)];
  }

  /** Every blad of a category in one list, per groep under a heading ("Toon alles"). */
  function alleBladen(c) {
    const alle = BLADEN.filter((b) => b.categorie === c.id);
    const bladen = alle.filter(zichtbaar);
    const secties = c.groepen.map(([g, naam]) => {
      const hier = bladen.filter((b) => b.groep === g);
      return hier.length > 0 && h('section.groep', h('h2.groep-kop', naam), h('div.rijen', hier.map((b) => rij(b, eersteRegel(b)))));
    });
    return [secties.some(Boolean) ? secties : h('p.leeg', leegTekst(alle)), buiten(alle.length - bladen.length)];
  }

  /** The bladen of one groep, or of a whole category without groepen. */
  function bladLijst(c, groep) {
    const alle = BLADEN.filter((b) => b.categorie === c.id && (!groep || b.groep === groep));
    const bladen = alle.filter(zichtbaar);
    return [bladen.length ? h('div.rijen', bladen.map((b) => rij(b, eersteRegel(b)))) : h('p.leeg', leegTekst(alle)),
      buiten(alle.length - bladen.length)];
  }

  function resultaten(q, c) {
    const alle = zoek(q, { categorie: c?.id });
    const hits = alle.filter(zichtbaar);
    const sub = (b) => (c ? groepNaam(b.categorie, b.groep) : `${CATEGORIE[b.categorie].naam} › ${groepNaam(b.categorie, b.groep)}`);
    if (!alle.length) {
      return [h('p.leeg', `Niets gevonden voor „${q}”${c ? ` in ${c.naam}` : ''}.`),
        c && h('p', h('a.knop', { href: href('zoeken', { q }) }, 'Zoek in alle categorieën'))];
    }
    return [
      hits.length ? h('div.rijen', hits.map((b) => rij(b, sub(b))))
        : h('p.leeg', `Niets gevonden voor „${q}” op de niveaus die je hebt gekozen.`),
      buiten(alle.length - hits.length),
    ];
  }

  /** The way back up: Alle categorieën › category › groep; the back link goes one step up. */
  function vulFilter(c, g, q) {
    if (!c) { vul(filter); return; }
    const groep = !q && g && (g === 'alles' || c.groepen.some(([k]) => k === g)) ? g : null;
    const omhoog = groep ? { href: href('zoeken', { c: c.id }), naam: c.naam } : { href: href('zoeken', { q }), naam: 'Alle categorieën' };
    vul(filter,
      h('div.kruimel',
        h('a.kruimel-terug', { href: omhoog.href }, icoon('terug', 'icoon klein'), omhoog.naam),
        h('span.kruimel-hier', { 'data-familie': c.kleur },
          groep && groep !== 'alles' ? groepIcoon(c.id, groep, 'icoon klein') : icoon(c.icoon, 'icoon klein'),
          groep === 'alles' ? `${c.naam}: alles` : groep ? groepNaam(c.id, groep) : c.naam)));
  }

  let getoond = null;
  function update(p) {
    params = p;
    const q = (p.q ?? '').trim();
    const c = CATEGORIE[p.c] ?? null;
    if (document.activeElement !== veld && veld.value !== (p.q ?? '')) veld.value = p.q ?? '';
    const nu = { q, c: c?.id, g: p.g };
    if (!getoond || nu.q !== getoond.q || nu.c !== getoond.c || nu.g !== getoond.g) {
      // another category, or from browsing to searching: start at the top; another letter typed: stay
      const anders = !getoond || nu.c !== getoond.c || nu.g !== getoond.g || !nu.q !== !getoond.q;
      if (getoond && (nu.c !== getoond.c || nu.g !== getoond.g || !nu.q !== !getoond.q)) ookBuiten = false;
      getoond = nu;
      tekenLijst();
      if (anders) sv.lijstInhoud.scrollTop = 0;
    }
    sv.toonBlad(BLAD[p.blad] ?? null);
    markeer();
  }

  /** The list and the chips, for the place in `getoond`; the scroll position stays. */
  function tekenLijst() {
    const { q, c: cid, g } = getoond;
    const c = CATEGORIE[cid] ?? null;
    vulFilter(c, g, q);
    vul(sv.lijstInhoud, q ? resultaten(q, c) : !c ? tegels() : g === 'alles' ? alleBladen(c)
      : g && c.groepen.some(([k]) => k === g) ? bladLijst(c, g) : metGroepen(c) ? groepLijst(c) : bladLijst(c));
    markeer();
  }

  function markeer() {
    for (const a of sv.lijstInhoud.querySelectorAll('[data-blad]')) {
      if (a.dataset.blad === params.blad) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      a.href = linkNaar(a.dataset.blad);
    }
  }

  // ticked off on a card, at the insignes or in another tab: the ticks in the list follow
  volgAfgevinkt(() => { if (getoond) tekenLijst(); });

  return {
    el: sv.el,
    update,
    titel: (p) => BLAD[p.blad]?.naam ?? (p.g && p.g !== 'alles' && CATEGORIE[p.c] ? groepNaam(p.c, p.g) : null) ?? CATEGORIE[p.c]?.naam ?? 'Zoeken',
    sluitKaart: () => sv.open && sv.el.querySelector('.kaartbalk .terug').click(),
    focusZoek: () => { veld.focus(); veld.select(); },
    herteken: () => { ookBuiten = false; if (getoond) tekenLijst(); },
  };
}
