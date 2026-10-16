// The alpien noodsein to hear and see: six signals a minute, one every ten seconds, then a minute quiet, and again
// (blad alpien-noodsein). The answer is three a minute. A whistle and a lamp at the same time, in real time; a bar
// shows where you are in the two minutes. It goes on until you stop it, or leave the card.
import { h } from '../dom.js';
import { geluid, speel } from './klank.js';
import { keuze, schakel } from './knoppen.js';
import './vorm.css';
import './noodsein.css';

const SEIN = 1;                  // seconds a signal lasts: one blast on the whistle, one flash of the lamp
const RONDE = 120;               // a minute of signals and a minute quiet

const PER_MINUUT = { nood: 6, antwoord: 3 };   // the noodsein, and the answer to it

export default function noodsein() {
  let soort = 'nood';
  let metGeluid = true;
  let metLicht = true;
  let stop = null;

  const lamp = h('div.doe-lamp.ns-lamp', { 'aria-hidden': 'true' });
  const knop = h('button.knop.hoofd', { type: 'button', onclick: () => (stop ? stoppen() : start()) });
  const regel = h('p.ns-regel');
  const klok = h('p.ns-klok', { 'aria-hidden': 'true' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const tekens = h('div.ns-tekens');
  const nu = h('div.ns-nu');
  const balk = h('div.ns-balk', { 'aria-hidden': 'true' },
    h('div.ns-minuut', tekens), h('div.ns-minuut.stil', h('span', 'een minuut stil')), nu);
  const schaal = h('div.ns-schaal', { 'aria-hidden': 'true' }, h('span', '0 s'), h('span', '1 min'), h('span', '2 min'));

  const el = h('div.doe-noodsein',
    h('div.ns-kies',
      h('div.chips', { role: 'group', 'aria-label': 'Welk sein?' }, keuze([['nood', 'Noodsein'], ['antwoord', 'Antwoord']], soort, (s) => {
        soort = s;
        toonSoort();
        if (stop) start();
      })),
      h('div.chips', { role: 'group', 'aria-label': 'Hoe seinen?' },
        schakel('Geluid', metGeluid, (aan) => { metGeluid = aan; if (stop) start(); }),
        schakel('Licht', metLicht, (aan) => { metLicht = aan; lamp.hidden = !aan; lamp.classList.remove('aan'); if (stop && !aan && !metGeluid) start(); }))),
    regel,
    h('div.ns-speler', lamp, h('div.ns-bediening', h('div.knop-rij', knop), klok)),
    balk, schaal, melding);
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape' && stop) { e.preventDefault(); stoppen(); } });

  function toonSoort() {
    const perMinuut = PER_MINUUT[soort];
    const om = 60 / perMinuut;
    regel.replaceChildren(soort === 'nood' ? 'Het noodsein: ' : 'Het antwoord: ', h('strong', `${perMinuut} keer per minuut`),
      ` (elke ${om} seconden), dan een minuut stil, en weer opnieuw.`);
    tekens.replaceChildren(...Array.from({ length: perMinuut }, (_, k) => h('span.ns-teken', { style: `left: ${(k * om / 60) * 100}%` })));
  }

  function tijdlijn() {
    const om = 60 / PER_MINUUT[soort];
    return Array.from({ length: PER_MINUUT[soort] }, (_, k) => ({ van: k * om, tot: k * om + SEIN, nr: k }));
  }

  function start() {
    if (!metGeluid && !metLicht) { stoppen(); melding.textContent = 'Zet het geluid of het licht aan.'; return; }
    if (stop) { const s = stop; stop = null; s(); }
    melding.textContent = metGeluid && !geluid() ? 'Deze browser maakt geen geluid; kijk naar het licht.' : '';
    rondje();
    knop.textContent = '■ Stop';
  }

  function rondje() {
    const stukken = tijdlijn();
    const per = stukken.length;
    const om = 60 / per;
    let wasStil = false;
    stop = speel(stukken, {
      el, metGeluid, hz: 2300, triller: 110, volume: 0.16, duur: RONDE,
      opStand: (aan, stuk) => {
        if (metLicht) lamp.classList.toggle('aan', aan);
        [...tekens.children].forEach((t, k) => t.classList.toggle('nu', aan && k === stuk?.nr));
        if (aan) melding.textContent = `Sein ${stuk.nr + 1} van ${per}`;
      },
      opTik: (t) => {
        nu.style.left = `${(t / RONDE) * 100}%`;
        if (t < 60) {
          const volgende = Math.floor(t / om) + 1;
          klok.textContent = volgende < per ? `Volgend sein over ${Math.ceil(volgende * om - t)} s` : `Stil over ${Math.ceil(60 - t)} s`;
        } else {
          klok.textContent = `Stil: nog ${Math.ceil(RONDE - t)} s`;
          if (!wasStil) { wasStil = true; melding.textContent = 'Een minuut stil.'; }
        }
      },
      opKlaar: () => {
        stop = null;
        if (el.isConnected) rondje();
      },
    });
  }

  function stoppen() {
    if (stop) { const s = stop; stop = null; s(); }
    knop.textContent = '▶ Start';
    klok.textContent = '';
    nu.style.left = '0%';
    melding.textContent = 'Gestopt.';
  }

  knop.textContent = '▶ Start';
  toonSoort();
  return el;
}
