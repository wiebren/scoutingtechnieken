// Point at the parts of a mushroom: the piece names a part, you tap it in the drawing (or pick it with the keyboard).
import { h } from '../../dom.js';
import { PADDENSTOEL_DELEN, paddenstoelMetDelen } from '../../plaatjes/natuur.js';
import { schud } from './gedeeld.js';
import '../vorm.css';
import './natuur.css';

export default function delen() {
  let rij = []; let vraag = null; let goed = 0; let gehad = 0; let wacht = false;
  const vraagTekst = h('p.nt-vraag');
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const houder = h('div.pd-plaat', { html: `<svg viewBox="-100 -6 200 192" class="plaatje pd-svg" role="group" aria-label="Een paddenstoel met zijn delen">${paddenstoelMetDelen()}</svg>` });
  const groepen = [...houder.querySelectorAll('[data-deel]')];
  for (const gr of groepen) {
    const deel = gr.dataset.deel;
    gr.setAttribute('tabindex', '0');
    gr.setAttribute('role', 'button');
    gr.setAttribute('aria-label', PADDENSTOEL_DELEN[deel]);
    gr.classList.add('pd-deel');
    gr.addEventListener('click', () => antwoord(deel, gr));
    gr.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); antwoord(deel, gr); } });
  }

  function volgende() {
    if (!rij.length) rij = schud(Object.keys(PADDENSTOEL_DELEN));
    vraag = rij.pop(); wacht = false;
    for (const gr of groepen) gr.classList.remove('goed', 'fout');
    vraagTekst.textContent = `Tik op ${PADDENSTOEL_DELEN[vraag]}.`;
  }

  function antwoord(deel, gr) {
    if (wacht) return;                              // right answer given, the next question is coming
    gehad += 1;
    if (deel === vraag) {
      goed += 1; wacht = true;
      gr.classList.add('goed');
      melding.classList.remove('fout');
      melding.textContent = `Goed: dat is ${PADDENSTOEL_DELEN[deel]}. ${goed} van de ${gehad} goed.`;
      setTimeout(() => { if (houder.isConnected) volgende(); }, 900);
    } else {
      gr.classList.add('fout');
      melding.classList.add('fout');
      melding.textContent = `Nee, dat is ${PADDENSTOEL_DELEN[deel]}. Probeer het nog eens.`;
    }
  }

  volgende();
  return h('div.doe-nt-delen', vraagTekst, houder, melding);
}
