// A quiz for trail signs and waymarks: "Wat betekent dit teken?" (a sign, four meanings) or "Welk teken is het?"
// (a meaning, four signs). The wrong answers always mean something else, so two signs with the same meaning (the
// arrow of Baden-Powell and the arrow of the larger set, a LAW and a streekpad) never compete. For a screen reader
// the signs are described by their shape (`vorm` in ./tekens.js).
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { BP, MARKERING, NATUUR, tegel, UITGEBREID } from './tekens.js';
import '../vorm.css';
import './tekenquiz.css';

const SETS = {
  bp: () => BP,
  uitgebreid: () => UITGEBREID,
  natuur: () => NATUUR,
  alle: () => [...BP, ...UITGEBREID, ...NATUUR],
  markering: () => [...MARKERING('law'), ...MARKERING('streekpad')],
};

const schud = (lijst) => {
  const l = [...lijst];
  for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
  return l;
};

export default function tekenquiz({ set = 'uitgebreid' } = {}) {
  const tekens = SETS[set]();
  let modus = 'betekenis';          // 'betekenis': a sign is shown; 'teken': a meaning is shown
  let vraag = null; let vorige = null; let klaar = false; let opties = [];
  let goed = 0; let gevraagd = 0;

  const vraagRegel = h('p.tq-vraag');
  const beeld = h('div.tq-beeld');
  const keuzes = h('div.tq-keuzes');
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const score = h('p.doe-stil.tq-score');
  const volgende = h('button.knop.klein.hoofd', { type: 'button', hidden: true, onclick: () => nieuw() }, 'Volgende');
  const chips = keuze([['betekenis', 'Wat betekent het?'], ['teken', 'Welk teken is het?']], modus, (m) => { modus = m; goed = 0; gevraagd = 0; nieuw(); });

  const el = h('div.doe-tekenquiz',
    h('div.chips', { role: 'group', 'aria-label': 'Kies hoe je oefent' }, chips),
    vraagRegel, beeld, keuzes, melding, h('div.tq-voet', score, volgende));

  function nieuw() {
    let v;
    do v = tekens[Math.floor(Math.random() * tekens.length)]; while (tekens.length > 1 && v === vorige);
    vraag = v; vorige = v; klaar = false;
    // three others with another meaning, each meaning once
    const gezien = new Set([v.naam]);
    const anderen = schud(tekens).filter((t) => !gezien.has(t.naam) && gezien.add(t.naam)).slice(0, 3);
    opties = schud([v, ...anderen]);
    melding.textContent = ''; melding.classList.remove('fout');
    volgende.hidden = true;
    if (modus === 'betekenis') {
      vraagRegel.textContent = 'Wat betekent dit teken?';
      beeld.hidden = false;
      beeld.innerHTML = tegel(v.teken, `Het teken: ${v.vorm}`);
      keuzes.className = 'tq-keuzes tekst';
      keuzes.replaceChildren(...opties.map((o) => h('button.knop.tq-keuze', { type: 'button', onclick: (e) => antwoord(o, e.currentTarget) }, o.naam)));
    } else {
      vraagRegel.replaceChildren('Welk teken betekent: ', h('strong', v.naam), '?');
      beeld.hidden = true; beeld.replaceChildren();
      keuzes.className = 'tq-keuzes tegels';
      keuzes.replaceChildren(...opties.map((o) => h('button.tq-tegel', { type: 'button', 'aria-label': o.vorm, html: tegel(o.teken), onclick: (e) => antwoord(o, e.currentTarget) })));
    }
    score.textContent = gevraagd ? `Goed: ${goed} van ${gevraagd}` : '';
  }

  function antwoord(o, knop) {
    if (klaar) return;
    klaar = true; gevraagd++;
    const juist = o === vraag || o.naam === vraag.naam;
    if (juist) goed++;
    for (const [i, k] of [...keuzes.children].entries()) {
      const optie = opties[i];
      k.disabled = true;
      if (optie.naam === vraag.naam) k.classList.add('goed');
      if (k === knop && !juist) k.classList.add('fout');
      if (modus === 'teken') k.append(h('span.tq-onder', optie.naam));
    }
    melding.classList.toggle('fout', !juist);
    melding.textContent = juist ? `Goed! ${vraag.naam}.`
      : modus === 'betekenis' ? `Niet goed. Dit teken (${vraag.vorm}) betekent: ${vraag.naam}.`
        : `Niet goed. Jij koos ${o.vorm}: dat betekent ${o.naam.toLowerCase()}. Het goede teken is ${vraag.vorm}.`;
    score.textContent = `Goed: ${goed} van ${gevraagd}`;
    volgende.hidden = false;
    volgende.focus({ preventScroll: true });
  }

  nieuw();
  return el;
}
