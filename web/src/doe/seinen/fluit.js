// The fluitsignalen of Baden-Powell (Scouting for Boys, 1908; NAV §4f): hear each one, with its rhythm drawn as
// bars, and then guess what a signal means. The whistle is a tone with a trill, like a pea whistle (klank.js).
import { h } from '../../dom.js';
import { willekeurig } from '../codes.js';
import { geluid, speel } from '../klank.js';
import { keuze } from '../knoppen.js';
import '../vorm.css';
import './fluit.css';

/** A rhythm: [aan, uit] pairs in seconds. */
const reeks = (n, aan, uit) => Array.from({ length: n }, () => [aan, uit]);
export const FLUITSIGNALEN = [
  { id: 'stilte', naam: 'Eén lange stoot', betekent: 'Stilte, let op: er komt een bevel.', ritme: [[1.6, 0]] },
  { id: 'uitzwermen', naam: 'Een reeks lange, langzame stoten', betekent: 'Uitzwermen: ga verder weg, of ga vooruit.', ritme: reeks(4, 1.1, 0.8) },
  { id: 'verzamelen', naam: 'Een reeks korte, scherpe stoten', betekent: 'Verzamelen: kom hier bij elkaar.', ritme: reeks(7, 0.13, 0.13) },
  { id: 'alarm', naam: 'Kort en lang om de beurt', betekent: 'Alarm: kijk uit, wees klaar.', ritme: [[0.18, 0.25], [0.9, 0.25], [0.18, 0.25], [0.9, 0.25], [0.18, 0.25], [0.9, 0]] },
  { id: 'leiders', naam: 'Drie kort en één lang', betekent: 'Patrouilleleiders: kom hier.', ritme: [[0.18, 0.2], [0.18, 0.2], [0.18, 0.35], [1.2, 0]] },
];

function tijdlijn(ritme) {
  const stukken = [];
  let t = 0;
  for (const [aan, uit] of ritme) { stukken.push({ van: t, tot: t + aan }); t += aan + uit; }
  return stukken;
}

/** The rhythm as bars, a second is 40 px. */
function balkjes(ritme) {
  const s = 40;
  let x = 2;
  const delen = ritme.map(([aan, uit]) => { const r = `<rect x="${x}" y="6" width="${Math.max(aan * s, 4)}" height="14" rx="5"/>`; x += (aan + uit) * s; return r; });
  return `<svg class="fl-ritme" viewBox="0 0 ${Math.ceil(x + 4)} 26" width="${Math.ceil(x + 4)}" height="26" aria-hidden="true">${delen.join('')}</svg>`;
}

export default function fluit() {
  let stop = null;
  let vraag = null;
  let goed = 0;
  let gevraagd = 0;
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });

  function blaas(sein, knop, klaar) {
    if (stop) { const s = stop; stop = null; s(); }
    el.querySelectorAll('.fl-speel.aan').forEach((k) => k.classList.remove('aan'));
    if (!geluid()) melding.textContent = 'Deze browser maakt geen geluid.';
    knop?.classList.add('aan');
    stop = speel(tijdlijn(sein.ritme), { el, hz: 2300, triller: 110, volume: 0.16, opKlaar: () => { stop = null; knop?.classList.remove('aan'); klaar?.(); } });
  }

  // -- the list
  const lijst = h('ul.fl-lijst', FLUITSIGNALEN.map((s) => {
    const knop = h('button.knop.klein.fl-speel', { type: 'button', 'aria-label': `Speel: ${s.naam}`, onclick: () => blaas(s, knop) }, '▶');
    return h('li', knop, h('div', h('strong', s.naam), h('span', ` ${s.betekent}`), h('span', { html: balkjes(s.ritme) })));
  }));

  // -- the quiz
  const opties = h('div.fl-opties', { role: 'group', 'aria-label': 'Wat betekent dit signaal?' });
  const score = h('p.doe-stil');
  const nogEens = h('button.knop', { type: 'button', onclick: () => vraag && blaas(vraag) }, '▶ Nog eens');
  const volgende = h('button.knop.hoofd', { type: 'button', onclick: () => nieuweVraag() }, '▶ Volgend signaal');
  const raden = h('div.fl-paneel', h('p', 'Luister. Wat betekent dit signaal?'), h('div.knop-rij', volgende, nogEens), opties, score);

  function nieuweVraag() {
    let s;
    do s = willekeurig(FLUITSIGNALEN); while (s === vraag);
    vraag = s;
    vraag.klaar = false;
    melding.textContent = '';
    melding.classList.remove('fout');
    opties.replaceChildren(...[...FLUITSIGNALEN].sort(() => Math.random() - 0.5).map((x) => h('button.knop.fl-optie', { type: 'button', 'data-id': x.id,
      onclick: (e) => kies(x, e.currentTarget) }, x.betekent)));
    blaas(s);
  }

  function kies(x, knop) {
    if (!vraag || vraag.klaar) return;
    vraag.klaar = true;
    gevraagd++;
    [...opties.children].find((k) => k.dataset.id === vraag.id).classList.add('goed');
    if (x === vraag) { goed++; melding.textContent = `Goed! ${vraag.naam}: ${vraag.betekent}`; }
    else { knop.classList.add('fout'); melding.classList.add('fout'); melding.textContent = `Niet goed. Het was: ${vraag.naam.toLowerCase()}. ${vraag.betekent}`; }
    score.textContent = `${goed} van ${gevraagd} goed.`;
    volgende.focus();
  }

  const el = h('div.doe-fluit',
    h('div.chips', { role: 'group', 'aria-label': 'Wat wil je doen?' }, keuze([['luisteren', 'Luister'], ['raden', 'Raad het signaal']], 'luisteren', (m) => {
      lijst.hidden = m !== 'luisteren';
      raden.hidden = m !== 'raden';
      melding.textContent = '';
    })),
    lijst, raden, melding);
  raden.hidden = true;
  return el;
}
