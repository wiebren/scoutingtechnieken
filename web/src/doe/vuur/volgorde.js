// Put the steps in order: the steps stand shuffled; tap them in the order you would do them. A wrong one shakes
// its head and says what comes first; the right ones move to your list.
import { h } from '../../dom.js';
import { actie, acties } from '../knoppen.js';
import { schud } from './quiz.js';
import { VOLGORDE } from './vragen.js';
import '../vorm.css';
import './vuur.css';

export default function volgorde({ set }) {
  const { vraag, stappen, klaar } = VOLGORDE[set];
  let gedaan = 0; let fouten = 0;

  const lijst = h('ol.vk-volgorde', { 'aria-label': 'Jouw volgorde' });
  const over = h('div.vk-volgorde', { role: 'group', 'aria-label': 'Nog te kiezen' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const opnieuw = actie('Opnieuw', 'opnieuw', () => begin(), { klein: true });
  const el = h('div.doe-vk', h('p.vk-vraag', vraag), lijst, h('p.vk-uitleg', 'Kies de volgende stap:'), over, acties(opnieuw), melding);

  function begin() {
    gedaan = 0; fouten = 0;
    lijst.replaceChildren();
    melding.textContent = ''; melding.classList.remove('fout');
    over.replaceChildren(...schud(stappen.map((t, i) => ({ t, i }))).map(({ t, i }) =>
      h('button.knop', { type: 'button', 'data-i': i, onclick: (e) => kies(i, e.currentTarget) }, t)));
    over.previousElementSibling.hidden = false;
  }

  function kies(i, knop) {
    if (i !== gedaan) {
      fouten++;
      knop.classList.add('fout');
      melding.classList.add('fout');
      melding.textContent = `Nog niet. Wat moet er gebeuren vóór „${stappen[i].toLowerCase()}”?`;
      setTimeout(() => knop.classList.remove('fout'), 900);
      return;
    }
    knop.remove();
    lijst.append(h('li', h('span.nr', `${gedaan + 1}.`), h('span.knop.goed', stappen[i])));
    gedaan++;
    melding.classList.remove('fout');
    if (gedaan === stappen.length) {
      melding.textContent = `${klaar}${fouten ? ` (${fouten} keer mis gekozen)` : ''}`;
      over.previousElementSibling.hidden = true;
      opnieuw.focus();
    } else {
      melding.textContent = `Goed: stap ${gedaan} is „${stappen[i].toLowerCase()}”.`;
      over.querySelector('button')?.focus();
    }
  }

  begin();
  return el;
}
