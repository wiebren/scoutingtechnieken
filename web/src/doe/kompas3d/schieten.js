// Kompasschieten, first person (the view: kijker.js). Two tasks, switched with chips:
// - peilen (greep 2): aim at a landmark, turn the housing until red is in the arrow, read the degrees at the index;
// - koers lopen (greep 1): set a course on the housing, turn yourself until red is in the arrow, and say what lies
//   on that line.
// opties.kompas: 'spiegel' (the spiegelpeilkompas: aim over the sight notch, the needle in the mirror) or 'plaat'
// (the plaatkompas held flat: look along the direction arrow). The plaatkompas gets a little more room (kijker.js
// SOORT), as on the blad: it is less precise from the hand. opties.opdracht: 'peilen' or 'koers' to start with.
import { h } from '../../dom.js';
import { actie, acties, keuze, schakel } from '../knoppen.js';
import { BAKENS, maakVeld, zijde } from './veld.js';
import { maakKijker, opruimen, SOORT } from './kijker.js';

export default function kompasSchieten({ kompas = 'spiegel', opdracht = 'peilen', stil = false } = {}) {
  const S = SOORT[kompas] ?? SOORT.spiegel;
  if (!SOORT[kompas]) kompas = 'spiegel';
  const id = `k3s-${Math.random().toString(36).slice(2, 8)}`;
  let veld = maakVeld(1 + Math.floor(Math.random() * 99999));
  let modus = opdracht === 'koers' ? 'koers' : 'peilen';
  let doel = null; let opgelost = false;
  const kijker = maakKijker({ kompas, veld, stil });

  // -- the parts
  const opdrachtRegel = h('p.k3-opdracht');
  const stappen = h('ol.k3-stappen');
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const invoer = h('input.doe-veld.k3-invoer', { type: 'text', inputmode: 'numeric', maxlength: '3', autocomplete: 'off', id: `${id}-lees`,
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); leesAf(); } } });
  const peilAntwoord = h('div.k3-antwoord',
    h('label.doe-label', { for: `${id}-lees` }, h('span', 'Wat lees je af bij de index?'), h('span.k3-graden', invoer, h('span', { 'aria-hidden': 'true' }, '°'))),
    actie('Lees af', 'vink', () => leesAf(), { hoofd: true }));
  const koersAntwoord = h('div.k3-antwoord.k3-kies', h('p.doe-stil', S.kijkVraag),
    h('div.chips', { role: 'group', 'aria-label': S.kijkVraag },
      Object.entries(BAKENS).map(([soort, b]) => h('button.chip', { type: 'button', onclick: () => kiesBaken(soort) }, b.naam)),
      h('button.chip', { type: 'button', onclick: () => kiesBaken(null) }, 'niets')));

  const el = h('div.k3',
    h('div.k3-kop',
      h('div.chips', { role: 'group', 'aria-label': 'Wat ga je doen?' },
        keuze([['peilen', 'Peilen'], ['koers', 'Koers lopen']], modus, (m) => { modus = m; nieuweTaak(); })),
      schakel('Namen', true, (v) => kijker.zetNamen(v))),
    opdrachtRegel, stappen,
    kijker.el, kijker.bediening,
    peilAntwoord, koersAntwoord,
    acties(
      actie('Nieuwe opdracht', 'opnieuw', () => nieuweTaak(), { klein: true }),
      actie('Ander landschap', 'opnieuw', () => { veld = maakVeld(1 + Math.floor(Math.random() * 99999)); kijker.zetVeld(veld); nieuweTaak(); }, { klein: true })),
    melding, kijker.stand,
    h('p.doe-stil.k3-hulp', S.hulp));

  // -- the tasks
  function nieuweTaak() {
    const vorig = doel?.soort;
    const kandidaten = veld.bakens.filter((b) => b.soort !== vorig);
    doel = kandidaten[Math.floor(Math.random() * kandidaten.length)];
    opgelost = false;
    melding.textContent = ''; melding.classList.remove('fout');
    invoer.value = '';
    // start a good way off, so there is something to do
    kijker.zetHuis(doel.peiling + (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 100));
    kijker.zetKoers(doel.peiling + (Math.random() < 0.5 ? -1 : 1) * (35 + Math.random() * 90));
    peilAntwoord.hidden = modus !== 'peilen';
    koersAntwoord.hidden = modus !== 'koers';
    const naam = BAKENS[doel.soort].de;
    if (modus === 'peilen') {
      opdrachtRegel.textContent = `Peil ${naam}.`;
      stappen.replaceChildren(
        h('li', S.richtNaar(naam)),
        h('li', `Draai het huis tot de rode punt van de naald ${S.huisje} staat (rood in het huisje).`),
        h('li', `Lees de graden af ${S.index}.`));
    } else {
      opdrachtRegel.textContent = `Loop een koers van ${doel.peiling}°.`;
      stappen.replaceChildren(
        h('li', `Draai het huis tot ${doel.peiling}° bij de index staat.`),
        h('li', `Draai nu jezelf (niet het huis) tot de rode punt van de naald ${S.huisje} staat.`),
        h('li', `${S.kijkVraag} Daar loop je naartoe.`));
    }
  }

  function zeg(tekst, goed) { melding.textContent = tekst; melding.classList.toggle('fout', !goed); }

  function leesAf() {
    if (opgelost) { nieuweTaak(); return; }
    const naam = BAKENS[doel.soort].de;
    const fout = kijker.richtFout(doel) ?? kijker.naaldFout('huis');
    if (fout) { zeg(fout, false); return; }
    const t = invoer.value.trim();
    if (!/^\d{1,3}$/.test(t) || Number(t) > 360) { zeg('Vul in hoeveel graden je bij de index leest, een getal van 0 tot 360.', false); invoer.focus(); return; }
    const g = Number(t) % 360; const huis = kijker.huis();
    if (Math.abs(zijde(g, huis)) <= S.tol.lees) {
      opgelost = true;
      zeg(`Goed! ${naam[0].toUpperCase()}${naam.slice(1)} ligt op ${doel.peiling}°, en jij las ${g}° af.${Math.abs(zijde(g, doel.peiling)) > 1 ? ' Een paar graden verschil is met het oog heel goed.' : ''}`, true);
      return;
    }
    if (Math.abs(zijde(g, huis + 180)) <= 4) { zeg(`Je las aan de verkeerde kant van het huis. Lees ${S.index}.`, false); return; }
    if (S.tientallen && g < 36 && Math.abs(zijde(g * 10, huis)) <= 10) { zeg(`De cijfers op het huis zijn tientallen: ${g} betekent ${g * 10}°. Tel de streepjes erbij: elk streepje is 2°.`, false); return; }
    zeg(S.tientallen
      ? 'Bij de index staat een ander getal. Zoek het cijfer links van de index, maak er tientallen van, en tel de streepjes erbij: elk streepje is 2°.'
      : 'Bij de index staat een ander getal. Zoek het getal links van de index en tel de streepjes erbij: elk streepje is 2°.', false);
  }

  function kiesBaken(soort) {
    if (opgelost) { nieuweTaak(); return; }
    const k = doel.peiling; const huis = kijker.huis();
    if (Math.abs(zijde(huis, k)) > S.tol.naald) {
      zeg(Math.abs(zijde(huis, k + 180)) <= 4
        ? `Het huis staat precies verkeerd om. Zet ${k}° bij de index.`
        : `Zet eerst de koers op het huis: draai het tot ${k}° bij de index staat. Nu staat er ongeveer ${Math.round(huis) % 360}°.`, false);
      return;
    }
    const nf = kijker.naaldFout('jij');
    if (nf) { zeg(nf, false); return; }
    const echt = kijker.inVizier(S.tol.kijk);
    if ((echt?.soort ?? null) === soort) {
      opgelost = true;
      zeg(`Goed! Op ${k}° ligt ${BAKENS[doel.soort].de}. Loop erheen, en kijk onderweg of het huis niet verdraaid is.`, true);
    } else {
      zeg(echt ? `${S.kijkNog}: daar staat ${BAKENS[echt.soort].de}.` : `${S.kijkNog}: daar staat niets bijzonders.`, false);
    }
  }

  opruimen(el, () => kijker.dispose());
  nieuweTaak();
  return el;
}
