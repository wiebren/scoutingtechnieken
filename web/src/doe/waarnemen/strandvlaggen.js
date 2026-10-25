// Welke vlag is dit? A beach flag on its pole, and six meanings to choose from (Reddingsbrigade Nederland, the set of 2025).
import { h } from '../../dom.js';
import { actie, acties } from '../knoppen.js';
import { STRANDVLAGGEN, strandvlag } from '../../plaatjes/veiligheid.js';
import { schud } from './hulp.js';
import './wn.css';
import './strandvlaggen.css';

export default function strandvlaggen() {
  let rij = []; let nu = null;
  let goed = 0; let gedaan = 0;

  const vlag = h('div.sv-vlag', { role: 'img' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const score = h('p.wn-score');
  const knoppen = STRANDVLAGGEN.map((v) => h('button.knop.sv-keuze', { type: 'button', 'data-k': v.id, onclick: () => kies(v.id) }, v.kort));
  const verder = actie('Volgende vlag', 'verder', nieuw, { hoofd: true, klein: true, hidden: true });
  const el = h('div.wn.naast.doe-strandvlaggen', vlag,
    h('div.wn-tekst', h('p', 'Wat betekent deze vlag?'), h('div.sv-keuzes', { role: 'group', 'aria-label': 'Betekenis' }, knoppen), acties(verder), melding, score));

  function kies(k) {
    if (!verder.hidden) return;
    gedaan += 1; if (k === nu.id) goed += 1;
    knoppen.forEach((b) => { b.disabled = true; b.classList.toggle('juist', b.dataset.k === nu.id); b.classList.toggle('mis', b.dataset.k === k && k !== nu.id); });
    melding.classList.toggle('fout', k !== nu.id);
    melding.textContent = `${k === nu.id ? 'Goed!' : 'Nee.'} ${nu.naam}: ${nu.uitleg}`;
    score.textContent = `${goed} van de ${gedaan} goed.`;
    verder.hidden = false;
    verder.focus({ preventScroll: true });
  }

  function nieuw() {
    if (!rij.length) rij = schud(STRANDVLAGGEN.filter((v) => v !== nu));
    nu = rij.pop();
    vlag.innerHTML = strandvlag(nu.id, 'Een strandvlag. Welke betekenis heeft hij?');
    vlag.setAttribute('aria-label', `Een ${nu.naam.toLowerCase()} aan een paal.`);
    knoppen.forEach((b) => { b.disabled = false; b.classList.remove('juist', 'mis'); });
    melding.textContent = ''; verder.hidden = true;
  }

  nieuw();
  return el;
}
