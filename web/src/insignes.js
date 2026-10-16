// Insignes: the insignelaag, a lens on the bladen (notities/onderwerpen.md, De insignelaag). Choose an insigne and
// a niveau, and you see the bladen that belong to it, which you can tick off as "kan ik" - kept on this device
// only. Only the niveaus chosen in the menu are shown (all three when only Extra is chosen); a link to another
// niveau still opens it. Per niveau you go from nothing ticked, to some, to all of it (a hopman's hat: ask your
// leiding to show it), to having the insigne (a star), which you set yourself. Address: #/insignes?i=&n=&blad=
import { BLAD } from './data/bladen/index.js';
import { afvinkbaar, INSIGNE, insigneBeeld, INSIGNES, NIVEAUS } from './data/insignes.js';
import { insigneNiveaus } from './data/niveaus.js';
import { h, vul } from './dom.js';
import { icoon } from './iconen.js';
import { isAfgevinkt, isGekregen, niveauKeuze, volgAfgevinkt, zetAfgevinkt, zetGekregen } from './opslag.js';
import { href, terug } from './router.js';
import { splitView } from './splitview.js';

const BRON = 'https://activiteitenbank.scouting.nl/insignes-en-badges/nieuwe-insignes';
// the app of Scouting Nederland in which leiding ticks off eisen and hands out insignes; not every group uses it (yet)
const SCOUTBADGER = 'https://www.scoutbadger.nl/';
const scoutBadger = (tekst) => h('p.scoutbadger', tekst, ' ', h('a', { href: SCOUTBADGER, target: '_blank', rel: 'noopener' }, 'ScoutBadger', icoon('extern', 'icoon klein')), '.');

/** Ticked and total in a niveau; a blad that is in two delen counts once. */
function voortgang(insigne, niveau) {
  const keys = [...new Set(afvinkbaar(insigne, niveau).map((a) => a.blad ?? a.eis))];
  return { klaar: keys.filter(isAfgevinkt).length, totaal: keys.length };
}

/** The badge, as decoration: the name or the niveau always stands beside it. */
export const badge = (id, niveau, cls = 'badge') => h(`img.${cls}`, { src: insigneBeeld(id, niveau), alt: '', width: 240, height: 208, decoding: 'async' });

/** Where you are with a niveau: 'niet' (nothing ticked), 'bezig', 'alles' (all ticked), 'gekregen' (you have it). */
function stand(insigne, niveau) {
  if (isGekregen(insigne.id, niveau)) return 'gekregen';
  const { klaar, totaal } = voortgang(insigne, niveau);
  return totaal && klaar === totaal ? 'alles' : klaar ? 'bezig' : 'niet';
}
const STAND_TEKST = { niet: 'nog niet begonnen', bezig: 'mee bezig', alles: 'je kunt alles', gekregen: 'insigne gekregen' };

/** A bar per niveau, full once you can do it all, with the hat or the star after it. */
const balkje = (niveau, { klaar, totaal }, st = 'bezig') => h('span.balkje-rij', { 'data-stand': st, 'data-niveau': niveau },
  h('span.balkje', { 'data-niveau': niveau, title: `Niveau ${niveau}: ${klaar} van ${totaal}, ${STAND_TEKST[st]}` },
    h('span.balkje-vul', { style: `width: ${st === 'gekregen' || !totaal ? (st === 'gekregen' ? 100 : 0) : (100 * klaar) / totaal}%` })),
  st === 'alles' && icoon('hoed', 'icoon balkje-teken'), st === 'gekregen' && icoon('ster', 'icoon balkje-teken is-ster'));

/** The niveaus to show, from the choice in the menu. */
const getoondeNiveaus = () => { const nrs = insigneNiveaus(niveauKeuze()); return NIVEAUS.filter(({ niveau }) => nrs.includes(niveau)); };
/** The niveau in the address, or the first one shown. */
const niveauUit = (n) => (NIVEAUS.some((x) => String(x.niveau) === n) ? Number(n) : getoondeNiveaus()[0].niveau);

export function insignesView() {
  let params = {};
  const zonder = (key) => Object.fromEntries(Object.entries(params).filter(([k]) => k !== key));
  const linkNaar = (id) => href('insignes', { ...params, blad: id });
  const sv = splitView({
    leeg: 'Kies een onderwerp uit de lijst.',
    opTerug: () => terug('insignes', zonder('blad')),
    linkNaar,
  });

  function overzicht() {
    vul(sv.lijstBalk, h('div.balk-rij', h('h1', 'Insignes')));
    vul(sv.lijstInhoud,
      h('p.intro', 'Hier staan de insignes van Scouting Nederland. Kies een insigne en een niveau. Je ziet dan wat je moet kunnen, en waar je erover kunt lezen. Vink af wat je al kunt.'),
      scoutBadger('Wat je hier afvinkt, is voor jezelf. Het blijft op dit toestel. Gebruikt je groep de insigne-app van Scouting Nederland? Dan houdt je leiding je insignes bij in'),
      h('ul.insigne-tegels', INSIGNES.map((i) => h('li', h('a.insigne-tegel', { href: href('insignes', { i: i.id, n: getoondeNiveaus()[0].niveau }) },
        badge(i.id, getoondeNiveaus()[0].niveau, 'insigne-tegel-badge'),
        h('span.insigne-naam', i.naam),
        !i.compleet && h('span.label', 'in opbouw'),
        h('span.balkjes', getoondeNiveaus().map(({ niveau }) => balkje(niveau, voortgang(i, niveau), stand(i, niveau)))))))),
      voetnoot());
  }

  function voetnoot() {
    return h('p.voetnoot', 'De eisen staan hier in eigen woorden. Ze volgen het insignepakket van Scouting Nederland (2025). De officiële eisen staan in de ',
      h('a', { href: BRON, target: '_blank', rel: 'noopener' }, 'activiteitenbank van Scouting Nederland'), '.');
  }

  function insigne(i, niveau) {
    const n = i.niveaus[niveau];
    vul(sv.lijstBalk,
      h('div.kruimel', h('a.kruimel-terug', { href: href('insignes') }, icoon('terug', 'icoon klein'), 'Insignes')),
      h('div.balk-rij.insigne-kop', badge(i.id, niveau, 'insigne-kop-badge'), h('h1', i.naam)),
      h('div.niveaus', { role: 'tablist', 'aria-label': 'Niveau' }, NIVEAUS.filter((x) => x.niveau === niveau || getoondeNiveaus().includes(x)).map(({ niveau: nr, naam }) => h('a.niveau-tab', {
        href: href('insignes', { i: i.id, n: nr }), role: 'tab', 'aria-selected': String(nr === niveau), 'data-niveau': nr, 'data-vervang': true,
      }, badge(i.id, nr, 'niveau-tab-badge'), naam,
        stand(i, nr) === 'alles' && icoon('hoed', 'icoon niveau-tab-teken'), stand(i, nr) === 'gekregen' && icoon('ster', 'icoon niveau-tab-teken is-ster')))));

    const { klaar, totaal } = voortgang(i, niveau);
    const vink = (key, label, link) => h('div.vinkrij',
      h('label.vink', h('input', { type: 'checkbox', checked: isAfgevinkt(key), 'data-key': key, 'aria-label': `${label}: kan ik`,
        onchange: (e) => zetAfgevinkt(key, e.target.checked) }),
        h('span.vinkje', icoon('vink'))),
      link ? h('a.rij', { href: linkNaar(key), 'data-blad': key }, h('span.rij-naam', label), icoon('verder', 'icoon rij-pijl'))
        : h('span.rij.zonder', h('span.rij-naam', label)));

    vul(sv.lijstInhoud,
      i.over && niveau === 1 && h('p.intro', i.over),
      n?.kort && h('p.niveau-kort', { 'data-niveau': niveau }, n.kort),
      !i.compleet && h('p.melding', 'Dit insigne is nog in opbouw: hier staan alleen de onderwerpen die al in de app zitten.'),
      totaal > 0 && standBlok(i, niveau),
      n?.delen.length ? n.delen.map((d, di) => h('section.groep', h('h2.groep-kop', d.titel),
        h('div.rijen', d.bladen.filter((id) => BLAD[id]).map((id) => vink(id, BLAD[id].naam, true)),
          (d.zonderBlad ?? []).map((tekst, j) => vink(`${i.id}:${niveau}:${di}:${j}`, tekst, false)))))
        : h('p.leeg', 'Voor dit niveau staat er nog niets in de app.'),
      voetnoot());
  }

  /** The bar with how far you are, and once you can do it all: ask your leiding, and then: you have it. */
  function standBlok(i, niveau) {
    const { klaar, totaal } = voortgang(i, niveau);
    const st = stand(i, niveau);
    const krijg = (aan) => () => zetGekregen(i.id, niveau, aan);
    return h('div.insigne-stand', { 'data-niveau': niveau, 'data-stand': st },
      h('div.voortgang', balkje(niveau, { klaar, totaal }, st), h('span', `${klaar}/${totaal}`)),
      st === 'alles' && h('div.stand-kaart',
        icoon('hoed', 'icoon stand-teken'),
        h('div', h('p', h('strong', 'Je kunt alles voor dit insigne.'), ' Vraag je leiding of je het mag laten zien.'),
          h('p.scoutbadger', 'Gebruikt je groep ', h('a', { href: SCOUTBADGER, target: '_blank', rel: 'noopener' }, 'ScoutBadger', icoon('extern', 'icoon klein')), '? Dan zet je leiding het daarin.'),
          h('button.knop.hoofd.klein', { type: 'button', onclick: krijg(true) }, icoon('ster', 'icoon klein'), 'Ik heb hem gekregen'))),
      st === 'gekregen' && h('div.stand-kaart.gekregen',
        badge(i.id, niveau, 'stand-badge'), icoon('ster', 'icoon stand-ster is-ster'),
        h('div', h('p', h('strong', 'Gekregen!')),
          h('button.knop-link', { type: 'button', onclick: krijg(false) }, 'Toch niet'))),
      (st === 'niet' || st === 'bezig') && alGekregen(i, niveau));
  }

  /** "Heb je dit insigne al?" is a question: a tap asks it, with Ja and Nee to answer. */
  function alGekregen(i, niveau) {
    const plek = h('div.al-gekregen');
    const vraag = () => vul(plek, h('button.knop-link', { type: 'button', onclick: open }, 'Heb je dit insigne al?'));
    function open() {
      const nee = h('button.knop.klein', { type: 'button', onclick: () => { vraag(); plek.querySelector('button')?.focus(); } }, 'Nee');
      vul(plek, h('div.al-vraag', { role: 'group', 'aria-label': 'Heb je dit insigne al gekregen?' },
        h('p', h('strong', 'Heb je dit insigne al gekregen?'), ' Dat kan ook als je nog niet alles hebt afgevinkt.'),
        h('div.knop-rij', nee,
          h('button.knop.klein.hoofd', { type: 'button', onclick: () => zetGekregen(i.id, niveau, true) }, icoon('ster', 'icoon klein'), 'Ja, ik heb hem'))));
      nee.focus();
    }
    vraag();
    return plek;
  }

  let getoond = null;
  function teken() {
    const i = INSIGNE[params.i];
    const niveau = niveauUit(params.n);
    const sleutel = i ? `${i.id}:${niveau}` : '';
    const scrollNaarBoven = sleutel !== getoond;
    getoond = sleutel;
    const scroll = sv.lijstInhoud.scrollTop;
    if (i) insigne(i, niveau); else overzicht();
    sv.lijstInhoud.scrollTop = scrollNaarBoven ? 0 : scroll;
  }

  function markeer() {
    for (const a of sv.lijstInhoud.querySelectorAll('a[data-blad]')) {
      if (a.dataset.blad === params.blad) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      a.href = linkNaar(a.dataset.blad);
    }
  }

  // ticking (here, or in another tab) sets the boxes and the progress bar, without drawing the list again: the
  // focus stays on the box that was just ticked
  volgAfgevinkt(() => {
    for (const box of sv.lijstInhoud.querySelectorAll('input[data-key]')) box.checked = isAfgevinkt(box.dataset.key);
    const blok = sv.lijstInhoud.querySelector('.insigne-stand');
    const i = INSIGNE[params.i];
    if (i && blok) {
      const niveau = niveauUit(params.n);
      blok.replaceWith(standBlok(i, niveau));
      // the hat or the star on the tabs
      for (const tab of sv.lijstBalk.querySelectorAll('.niveau-tab')) {
        const st = stand(i, Number(tab.dataset.niveau));
        tab.querySelector('.niveau-tab-teken')?.remove();
        if (st === 'alles' || st === 'gekregen') tab.append(st === 'alles' ? icoon('hoed', 'icoon niveau-tab-teken') : icoon('ster', 'icoon niveau-tab-teken is-ster'));
      }
    } else if (!i) teken();
  });

  let vorige = null;
  function update(p) {
    params = p;
    const sleutel = `${p.i ?? ''}:${p.n ?? ''}`;
    if (sleutel !== vorige) { vorige = sleutel; teken(); }
    sv.toonBlad(BLAD[p.blad] ?? null);
    markeer();
  }

  return {
    el: sv.el,
    update,
    titel: (p) => BLAD[p.blad]?.naam ?? (INSIGNE[p.i] ? `${INSIGNE[p.i].naam}, niveau ${niveauUit(p.n)}` : 'Insignes'),
    sluitKaart: () => sv.open && sv.el.querySelector('.kaartbalk .terug').click(),
    herteken: () => { vorige = null; update(params); },
  };
}
