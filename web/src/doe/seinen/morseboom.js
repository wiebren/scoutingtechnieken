// Tik zelf morse, and watch the morseboom light up: a short press on the seinsleutel is a punt, a long one a streep.
// Stop a moment and the letter is done; it goes into the line under the tree. The buttons Punt and Streep (and the
// keys . and -) do the same without timing. On the focused sleutel, the space bar and Enter are the sleutel.
import { h } from '../../dom.js';
import { symbolen } from '../codes.js';
import { geluid } from '../klank.js';
import { actie, acties } from '../knoppen.js';
import { BOOM_BREED, BOOM_HOOG, boom, letterVan } from './lib/boom.js';
import '../vorm.css';
import './morseboom.css';

const NS = 'http://www.w3.org/2000/svg';
const KORT = 0.22;               // seconds: shorter is a punt, longer a streep
const KLAAR = 1.1;               // seconds of quiet that end a letter

export default function morseboom() {
  let pad = '';
  let zin = '';
  let neer = 0;                  // when the sleutel went down
  let toon = null;               // the tone while the sleutel is down
  let wacht = 0;                 // the timer that ends a letter

  const tekening = document.createElementNS(NS, 'svg');
  tekening.setAttribute('viewBox', `0 0 ${BOOM_BREED} ${BOOM_HOOG}`);
  tekening.setAttribute('class', 'mb-tekening');
  tekening.setAttribute('aria-hidden', 'true');
  const nu = h('p.mb-nu', { 'aria-live': 'polite' });
  const regel = h('p.mb-zin', { 'aria-label': 'Wat je seinde' });
  const sleutel = h('button.mb-sleutel', { type: 'button', 'aria-label': 'Seinsleutel: kort indrukken is een punt, lang een streep' }, 'tik');

  const el = h('div.doe-morseboom',
    tekening, nu,
    h('div.mb-invoer',
      sleutel,
      h('div.mb-knoppen',
        h('button.knop', { type: 'button', onclick: () => voegToe('.') }, '· Punt'),
        h('button.knop', { type: 'button', onclick: () => voegToe('-') }, '– Streep'))),
    acties(
      actie('Sluit de letter af', 'vink', () => klaar(), { klein: true }),
      actie('Wis', 'wis', () => { pad = ''; zin = ''; clearTimeout(wacht); toon(); teken(); }, { klein: true })),
    regel,
    h('p.doe-stil', 'Kort tikken is een punt, lang (even vasthouden) een streep. Wacht even en de letter is klaar.'));

  function teken() {
    tekening.innerHTML = boom(pad);
    const l = letterVan(pad);
    nu.textContent = pad ? `${symbolen(pad)}  ${l ? `= ${l}` : pad.length >= 4 ? '= geen letter' : ''}` : 'Begin bovenaan: tik een punt of een streep.';
    regel.textContent = zin || ' ';
  }

  function voegToe(s) {
    clearTimeout(wacht);
    if (pad.length >= 4) pad = '';
    pad += s;
    teken();
    wacht = setTimeout(() => { if (el.isConnected) klaar(); }, KLAAR * 1000);
  }

  function klaar() {
    clearTimeout(wacht);
    if (!pad) { zin += zin && !zin.endsWith(' ') ? ' ' : ''; teken(); return; }
    const l = letterVan(pad);
    zin = (zin + (l ?? '?')).slice(-40);
    nu.textContent = l ? `${symbolen(pad)} = ${l}` : `${symbolen(pad)} is geen letter.`;
    pad = '';
    tekening.innerHTML = boom('');
    regel.textContent = zin;
  }

  // -- the sleutel: how long it is down says punt or streep
  const toonAan = () => {
    const a = geluid();
    if (!a) return () => {};
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.frequency.value = 650;
    g.gain.setValueAtTime(0, a.currentTime);
    g.gain.linearRampToValueAtTime(0.22, a.currentTime + 0.005);
    osc.connect(g).connect(a.destination);
    osc.start();
    // never longer than a few seconds, even when the card goes away with the sleutel still down
    osc.stop(a.currentTime + 4);
    return () => { g.gain.setTargetAtTime(0, a.currentTime, 0.005); try { osc.stop(a.currentTime + 0.05); } catch { /* already stopped */ } };
  };
  toon = () => {};
  const omlaag = () => {
    if (neer) return;
    clearTimeout(wacht);
    neer = performance.now();
    sleutel.classList.add('neer');
    toon = toonAan();
  };
  const omhoog = () => {
    if (!neer) return;
    const duur = (performance.now() - neer) / 1000;
    neer = 0;
    sleutel.classList.remove('neer');
    toon();
    toon = () => {};
    voegToe(duur < KORT ? '.' : '-');
  };
  sleutel.addEventListener('pointerdown', (e) => { e.preventDefault(); sleutel.setPointerCapture(e.pointerId); omlaag(); });
  sleutel.addEventListener('pointerup', omhoog);
  sleutel.addEventListener('pointercancel', omhoog);
  sleutel.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); omlaag(); } });
  sleutel.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); omhoog(); } });
  sleutel.addEventListener('contextmenu', (e) => e.preventDefault());
  el.addEventListener('keydown', (e) => {
    if (e.target === sleutel || e.target.closest('input, textarea')) return;
    if (e.key === '.' || e.key === ',') { e.preventDefault(); voegToe('.'); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); voegToe('-'); }
  });

  teken();
  return el;
}
