// Zoeken: the bladen by category, or found by name. With nothing chosen the categories stand as tiles; a
// category shows its bladen per groep, with the groepen as chips; typing searches all bladen (or one category,
// when one is chosen). As Zoeken in vlet, without the boat. Address: #/zoeken?q=&c=&g=&blad=
import { BLAD, BLADEN } from './data/bladen/index.js';
import { CATEGORIE, CATEGORIEEN, groepNaam } from './data/categorieen.js';
import { h, vul } from './dom.js';
import { icoon } from './iconen.js';
import { ga, href, terug } from './router.js';
import { splitView } from './splitview.js';
import { zoek } from './zoek.js';

const eersteRegel = (b) => b.waarvoor ?? (Array.isArray(b.uitleg) ? b.uitleg[0] : b.uitleg) ?? b.ook?.join(' · ') ?? '';

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
    h('span.rij-naam', b.naam), sub && h('span.rij-sub', sub), icoon('verder', 'icoon rij-pijl'));

  function tegels() {
    return [
      h('p.intro', `Zoek op naam, of kies een categorie. Er staan nu ${BLADEN.length} onderwerpen in; de rest komt erbij.`),
      h('ul.tegels', CATEGORIEEN.map((c) => {
        const aantal = BLADEN.filter((b) => b.categorie === c.id).length;
        return h('li', h('a.tegel', { href: href('zoeken', { c: c.id }), 'data-familie': c.kleur },
          h('span.tegel-icoon', icoon(c.icoon)), h('span.tegel-naam', c.naam),
          h('span.tegel-aantal', aantal === 1 ? '1 onderwerp' : `${aantal} onderwerpen`)));
      })),
    ];
  }

  function categorieLijst(c, groep) {
    const bladen = BLADEN.filter((b) => b.categorie === c.id);
    const groepen = c.groepen.filter(([g]) => !groep || g === groep);
    const secties = groepen.map(([g, naam]) => {
      const hier = bladen.filter((b) => b.groep === g);
      if (!hier.length && !groep) return null;
      return h('section.groep', h('h2.groep-kop', naam),
        hier.length ? h('div.rijen', hier.map((b) => rij(b, eersteRegel(b)))) : h('p.leeg', 'Hier staat nog niets in.'));
    });
    return secties.some(Boolean) ? secties : h('p.leeg', 'Hier staat nog niets in.');
  }

  function resultaten(q, c) {
    const hits = zoek(q, { categorie: c?.id });
    if (!hits.length) {
      return [h('p.leeg', `Niets gevonden voor “${q}”${c ? ` in ${c.naam}` : ''}.`),
        c && h('p', h('a.knop', { href: href('zoeken', { q }) }, 'Zoek in alle categorieën'))];
    }
    return h('div.rijen', hits.map((b) => rij(b, c ? groepNaam(b.categorie, b.groep) : `${CATEGORIE[b.categorie].naam} › ${groepNaam(b.categorie, b.groep)}`)));
  }

  function vulFilter(c, g, q) {
    if (!c) { vul(filter); return; }
    const aantal = (k) => BLADEN.filter((b) => b.categorie === c.id && b.groep === k).length;
    vul(filter,
      h('div.kruimel',
        h('a.kruimel-terug', { href: href('zoeken', { q }) }, icoon('terug', 'icoon klein'), 'Alle categorieën'),
        h('span.kruimel-hier', { 'data-familie': c.kleur }, icoon(c.icoon, 'icoon klein'), c.naam)),
      !q && h('div.chips.scrollend', { role: 'group', 'aria-label': 'Groepen' },
        h('a.chip', { href: href('zoeken', { c: c.id }), 'aria-pressed': String(!g), 'data-vervang': true }, 'Alles'),
        c.groepen.map(([k, naam]) => h('a.chip', {
          href: href('zoeken', { c: c.id, g: k }), 'aria-pressed': String(g === k), 'data-vervang': true, class: aantal(k) ? null : 'leeg',
        }, naam, h('span.chip-aantal', aantal(k))))));
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
      const anders = !getoond || nu.c !== getoond.c || !nu.q !== !getoond.q;
      getoond = nu;
      vulFilter(c, p.g, q);
      vul(sv.lijstInhoud, q ? resultaten(q, c) : c ? categorieLijst(c, p.g) : tegels());
      if (anders) sv.lijstInhoud.scrollTop = 0;
    }
    sv.toonBlad(BLAD[p.blad] ?? null);
    for (const a of sv.lijstInhoud.querySelectorAll('[data-blad]')) {
      if (a.dataset.blad === p.blad) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      a.href = linkNaar(a.dataset.blad);
    }
  }

  return {
    el: sv.el,
    update,
    titel: (p) => BLAD[p.blad]?.naam ?? CATEGORIE[p.c]?.naam ?? 'Zoeken',
    sluitKaart: () => sv.open && sv.el.querySelector('.kaartbalk .terug').click(),
    focusZoek: () => { veld.focus(); veld.select(); },
  };
}
