// A conversation over the portofoon, to fill in with the right dienstuitdrukking. The words and what they mean come
// from the Handboek C2000 Brandweer, bijlage C Radioprocedures (reference/vakbronnen/BRONNEN.md); the
// netcontrolestation of the brandweer (the meldkamer) is the leiding here, and you are a post on a hike.
import { h } from '../../dom.js';
import { actie, acties } from '../knoppen.js';
import '../vorm.css';
import './portofoon.css';

export const WOORDEN = ['HIER', 'OVER', 'UIT', 'BEGREPEN', 'CORRECT', 'HERHAAL', 'HERSTEL', 'IK SPEL', 'CIJFERS', 'WACHT'];

/** [wie, de zin met ___, het woord, waarom]. Wie: 'leiding' or 'post'. */
const GESPREK = [
  ['post', 'Leiding, ___ Post 3, over.', 'HIER', 'Je roept: eerst wie je roept, dan HIER, dan je eigen naam. HIER betekent: dit bericht komt van het station dat ik nu noem.'],
  ['leiding', 'Post 3, hier Leiding, geef bericht, over.', null, null],
  ['post', 'Leiding, hier Post 3, wij zijn bij de brug, ___', 'OVER', 'OVER: ik ben klaar met praten en ik verwacht antwoord. Laat dan de knop los.'],
  ['leiding', 'Post 3, hier Leiding, loop naar … krrr … over.', null, null],
  ['post', 'Leiding, hier Post 3, ___, over.', 'HERHAAL', 'HERHAAL: je hebt het niet goed gehoord en vraagt het nog eens te zeggen.'],
  ['leiding', 'Post 3, hier Leiding, loop naar de molen, over.', null, null],
  ['post', 'Leiding, hier Post 3, ___, over.', 'BEGREPEN', 'BEGREPEN: ik heb je bericht begrepen.'],
  ['post', 'Leiding, hier Post 3, wij lopen naar de kerk, ___ naar de molen, over.', 'HERSTEL', 'HERSTEL: er ging iets fout in wat je zei; je gaat verder vanaf het laatste woord dat goed was.'],
  ['leiding', 'Post 3, hier Leiding, jullie lopen naar de molen, over.', null, null],
  ['post', 'Leiding, hier Post 3, ___, over.', 'CORRECT', 'CORRECT: wat je zegt, klopt. (Een fout van jezelf verbeter je met HERSTEL.)'],
  ['post', 'Leiding, hier Post 3, wij vonden een rugzak met de naam Bram, ___ Bravo Romeo Alfa Mike, over.', 'IK SPEL', 'IK SPEL: nu komt een woord letter voor letter, in het spelalfabet.'],
  ['post', 'Leiding, hier Post 3, wij zijn met ___ één twee, over.', 'CIJFERS', 'CIJFERS: nu komt een getal, en je zegt elk cijfer apart: één twee, niet twaalf.'],
  ['leiding', 'Post 3, hier Leiding, ___, uit.', 'WACHT', 'WACHT: wacht tot je weer wordt opgeroepen. Je zegt niets tot de leiding jou weer roept.'],
  ['leiding', 'Post 3, hier Leiding, kom terug naar het kamp, over.', null, null],
  ['post', 'Leiding, hier Post 3, begrepen, over.', null, null],
  ['leiding', 'Post 3, hier Leiding, ___.', 'UIT', 'UIT: klaar, en er komt geen antwoord. Bij C2000 zegt alleen de meldkamer UIT; bij een hike is dat de leiding. Zeg nooit ‘over en uit’: OVER en UIT kunnen niet allebei.'],
];

export default function portofoon() {
  let stap = 0;
  let fouten = 0;
  const log = h('ol.pf-log', { 'aria-live': 'polite' });
  const woorden = h('div.pf-woorden', { role: 'group', 'aria-label': 'Welk woord hoort op de streep?' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const opnieuw = actie('Opnieuw', 'opnieuw', () => begin(), { klein: true });

  const regel = (wie, tekst, invul) => {
    const delen = tekst.split('___');
    return h('li', { class: wie },
      h('span.pf-wie', wie === 'post' ? 'Post 3 (jij)' : 'Leiding'),
      h('p.pf-zin', delen[0], delen.length > 1 ? h('mark', { class: invul ? 'ingevuld' : '' }, invul ?? '___') : null, delen[1] ?? ''));
  };

  function verder() {
    // show the lines up to the next blank
    while (stap < GESPREK.length && !GESPREK[stap][2]) {
      const [wie, tekst] = GESPREK[stap];
      log.append(regel(wie, tekst));
      stap++;
    }
    if (stap >= GESPREK.length) {
      woorden.hidden = true;
      melding.classList.remove('fout');
      melding.textContent = fouten ? `Klaar! Met ${fouten} ${fouten === 1 ? 'fout' : 'fouten'} onderweg.` : 'Klaar, en alles in één keer goed!';
      return;
    }
    const [wie, tekst] = GESPREK[stap];
    const huidig = regel(wie, tekst);
    huidig.classList.add('nu');
    log.append(huidig);
    huidig.scrollIntoView?.({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function kies(woord, knop) {
    const [wie, tekst, juist, waarom] = GESPREK[stap];
    if (woord !== juist) {
      fouten++;
      knop.classList.add('fout');
      melding.classList.add('fout');
      melding.textContent = `${woord} past hier niet. Probeer een ander woord.`;
      return;
    }
    for (const k of woorden.children) k.classList.remove('fout');
    log.lastChild.replaceWith(regel(wie, tekst, juist));
    melding.classList.remove('fout');
    melding.textContent = waarom;
    stap++;
    verder();
  }

  function begin() {
    stap = 0;
    fouten = 0;
    log.replaceChildren();
    melding.textContent = 'Kies voor elke streep het goede woord.';
    melding.classList.remove('fout');
    woorden.hidden = false;
    for (const k of woorden.children) k.classList.remove('fout');
    verder();
  }

  woorden.append(...WOORDEN.map((w) => h('button.knop.klein.pf-woord', { type: 'button', onclick: (e) => kies(w, e.currentTarget) }, w)));
  const el = h('div.doe-portofoon', log, melding, woorden, acties(opnieuw),
    h('p.doe-stil', 'Druk de zendknop in, wacht één seconde en praat dan pas. Rustig en duidelijk, nooit schreeuwen.'));
  begin();
  return el;
}
