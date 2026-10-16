// A short quiz of eight questions from a set in ./vragen.js: a question, sometimes a drawing, four answers. After each
// answer it says why; at the end how many were right, and you can go again with other questions.
import { h } from '../../dom.js';
import { PLAATJES } from '../../plaatjes.js';
import { QUIZ } from './vragen.js';
import '../vorm.css';
import './vuur.css';

const RONDE = 8;
export const schud = (lijst) => {
  const l = [...lijst];
  for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
  return l;
};

export default function quiz({ set }) {
  const alle = QUIZ[set];
  let ronde = []; let nr = 0; let goed = 0;
  let opVerder = () => volgende();

  const teller = h('p.vk-uitleg.vk-stand');
  const plaatje = h('div.vk-plaatje');
  const vraag = h('p.vk-vraag', { 'aria-live': 'polite' });
  const keuzes = h('div.vk-keuzes');
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const verder = h('button.knop.klein.hoofd', { type: 'button', hidden: true, onclick: () => opVerder() });
  const el = h('div.doe-vk', teller, plaatje, vraag, keuzes, melding, h('div.knop-rij', verder));

  function begin() {
    ronde = schud(alle).slice(0, Math.min(RONDE, alle.length)).map((v) => {
      const antwoord = v.keuzes[0];
      const anders = v.uit ? schud(v.uit.filter((x) => x !== antwoord)).slice(0, 3) : v.keuzes.slice(1);
      return { ...v, antwoord, keuzes: schud([antwoord, ...anders]) };
    });
    nr = 0; goed = 0;
    opVerder = () => volgende();
    toon();
  }

  function toon() {
    const v = ronde[nr];
    teller.textContent = `Vraag ${nr + 1} van ${ronde.length}`;
    plaatje.innerHTML = v.plaatje ? PLAATJES[v.plaatje]() : '';
    plaatje.hidden = !v.plaatje;
    vraag.textContent = v.vraag;
    melding.textContent = ''; melding.classList.remove('fout');
    verder.hidden = true;
    keuzes.replaceChildren(...v.keuzes.map((k) => h('button.knop', { type: 'button', onclick: (e) => kies(k, e.currentTarget) }, k)));
  }

  function kies(k, knop) {
    const v = ronde[nr];
    const juist = k === v.antwoord;
    if (juist) goed++;
    for (const b of keuzes.children) {
      b.disabled = true;
      if (b.textContent === v.antwoord) b.classList.add('goed');
    }
    if (!juist) knop.classList.add('fout');
    melding.classList.toggle('fout', !juist);
    melding.textContent = `${juist ? 'Goed!' : `Niet goed: het is ${v.antwoord}.`} ${v.uitleg ?? ''}`;
    verder.textContent = nr + 1 < ronde.length ? 'Volgende' : 'Klaar';
    verder.hidden = false;
    verder.focus();
  }

  function volgende() {
    if (nr + 1 < ronde.length) { nr++; toon(); return; }
    teller.textContent = '';
    plaatje.innerHTML = '';
    vraag.textContent = `${goed} van de ${ronde.length} goed.`;
    keuzes.replaceChildren();
    melding.classList.remove('fout');
    melding.textContent = goed === ronde.length ? 'Alles goed!' : goed >= ronde.length - 2 ? 'Bijna alles goed.' : 'Lees de onderwerpen nog eens na, en probeer het opnieuw.';
    verder.textContent = 'Nog een keer';
    opVerder = () => begin();
  }

  begin();
  return el;
}
