// Insignes: the insignelaag, a lens on the bladen (notities/onderwerpen.md, De insignelaag). Choose an insigne and
// a niveau, and you see the bladen that belong to it, which you can tick off as "kan ik" - kept on this device
// only. Address: #/insignes?i=&n=&blad=
import { BLAD } from './data/bladen/index.js';
import { afvinkbaar, INSIGNE, INSIGNES, NIVEAUS } from './data/insignes.js';
import { h, vul } from './dom.js';
import { icoon } from './iconen.js';
import { isAfgevinkt, volgAfgevinkt, zetAfgevinkt } from './opslag.js';
import { href, terug } from './router.js';
import { splitView } from './splitview.js';

const BRON = 'https://activiteitenbank.scouting.nl/insignes-en-badges/nieuwe-insignes';

/** Ticked and total in a niveau; a blad that is in two delen counts once. */
function voortgang(insigne, niveau) {
  const keys = [...new Set(afvinkbaar(insigne, niveau).map((a) => a.blad ?? a.eis))];
  return { klaar: keys.filter(isAfgevinkt).length, totaal: keys.length };
}

const balkje = (niveau, { klaar, totaal }) => h('span.balkje', { 'data-niveau': niveau, title: `Niveau ${niveau}: ${klaar} van ${totaal}` },
  h('span.balkje-vul', { style: `width: ${totaal ? (100 * klaar) / totaal : 0}%` }));

export function insignesView() {
  let params = {};
  const zonder = (key) => Object.fromEntries(Object.entries(params).filter(([k]) => k !== key));
  const linkNaar = (id) => href('insignes', { ...params, blad: id });
  const sv = splitView({
    leeg: 'Kies een onderwerp uit het niveau.',
    opTerug: () => terug('insignes', zonder('blad')),
    linkNaar,
  });

  function overzicht() {
    vul(sv.lijstBalk, h('div.balk-rij', h('h1', 'Insignes')));
    vul(sv.lijstInhoud,
      h('p.intro', 'Het insignepakket van Scouting Nederland als bril op de technieken. Kies een insigne en een niveau: je ziet wat erbij hoort, en vinkt af wat je kunt.'),
      h('ul.insigne-tegels', INSIGNES.map((i) => h('li', h('a.insigne-tegel', { href: href('insignes', { i: i.id, n: 1 }) },
        h('span.insigne-naam', i.naam),
        !i.compleet && h('span.label', 'in opbouw'),
        h('span.balkjes', NIVEAUS.map(({ niveau }) => balkje(niveau, voortgang(i, niveau)))))))),
      voetnoot());
  }

  function voetnoot() {
    return h('p.voetnoot', 'De indeling volgt het insignepakket van Scouting Nederland (2025), in eigen woorden. De officiële eisen staan in de ',
      h('a', { href: BRON, target: '_blank', rel: 'noopener' }, 'activiteitenbank van Scouting Nederland'), '.');
  }

  function insigne(i, niveau) {
    const n = i.niveaus[niveau];
    vul(sv.lijstBalk,
      h('div.kruimel', h('a.kruimel-terug', { href: href('insignes') }, icoon('terug', 'icoon klein'), 'Insignes')),
      h('div.balk-rij', h('h1', i.naam)),
      h('div.niveaus', { role: 'tablist', 'aria-label': 'Niveau' }, NIVEAUS.map(({ niveau: nr, naam }) => h('a.niveau-tab', {
        href: href('insignes', { i: i.id, n: nr }), role: 'tab', 'aria-selected': String(nr === niveau), 'data-niveau': nr, 'data-vervang': true,
      }, naam))));

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
      totaal > 0 && h('div.voortgang', { 'data-niveau': niveau }, balkje(niveau, { klaar, totaal }), h('span', `${klaar} van ${totaal} kan ik`)),
      n?.delen.length ? n.delen.map((d, di) => h('section.groep', h('h2.groep-kop', d.titel),
        h('div.rijen', d.bladen.filter((id) => BLAD[id]).map((id) => vink(id, BLAD[id].naam, true)),
          (d.zonderBlad ?? []).map((tekst, j) => vink(`${i.id}:${niveau}:${di}:${j}`, tekst, false)))))
        : h('p.leeg', 'Voor dit niveau staat er nog niets in de app.'),
      voetnoot());
  }

  let getoond = null;
  function teken() {
    const i = INSIGNE[params.i];
    const niveau = NIVEAUS.some((n) => String(n.niveau) === params.n) ? Number(params.n) : 1;
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
    const bar = sv.lijstInhoud.querySelector('.voortgang');
    const i = INSIGNE[params.i];
    if (i && bar) {
      const niveau = Number(params.n) || 1;
      const v = voortgang(i, niveau);
      bar.replaceWith(h('div.voortgang', { 'data-niveau': niveau }, balkje(niveau, v), h('span', `${v.klaar} van ${v.totaal} kan ik`)));
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
    titel: (p) => BLAD[p.blad]?.naam ?? (INSIGNE[p.i] ? `${INSIGNE[p.i].naam}, niveau ${p.n ?? 1}` : 'Insignes'),
    sluitKaart: () => sv.open && sv.el.querySelector('.kaartbalk .terug').click(),
    herteken: () => { vorige = null; update(params); },
  };
}
