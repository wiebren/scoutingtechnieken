// A morse trainer after the method of Koch (NAV §4a): you hear the letters at full speed from the start, begin with
// two, and get a new one when you have 90 % right. A round is twenty letters: listen, then type the letter or tap it.
// The lesson you are at is kept on this device. The order of the letters is the one LCWO uses (lcwo.net).
import { h } from '../../dom.js';
import { MORSE, morseTijdlijn, naarMorse, symbolen } from '../codes.js';
import { geluid, speel } from '../klank.js';
import '../vorm.css';
import './morsetrainer.css';

export const KOCH = [...'KMURESNAPTLWIJZFOYVG5Q92H38B47C1D60X'];
const RONDE = 20;
const DOOR = 0.9;
const SLEUTEL = 'scoutingtechnieken.morse-koch.v1';

const lees = () => { try { return JSON.parse(localStorage.getItem(SLEUTEL) ?? 'null') ?? {}; } catch { return {}; } };
const schrijf = (v) => { try { localStorage.setItem(SLEUTEL, JSON.stringify(v)); } catch { /* it works without */ } };

export default function morsetrainer() {
  const bewaard = lees();
  let les = Math.min(Math.max(Number(bewaard.les) || 2, 2), KOCH.length);
  let wpm = Math.min(Math.max(Number(bewaard.wpm) || 15, 8), 25);
  let ronde = null;              // { nr, goed, letter, wacht, fouten: {} }
  let stop = null;

  const tekens = () => KOCH.slice(0, les);
  const nieuw = () => KOCH[les - 1];

  const lesTekst = h('p.mt-les');
  const rij = h('div.mt-tekens', { 'aria-hidden': 'true' });
  const lamp = h('div.doe-lamp.mt-lamp', { 'aria-hidden': 'true' });
  const groot = h('p.mt-groot', { 'aria-live': 'polite' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const voortgang = h('div.mt-voortgang', { 'aria-hidden': 'true' });
  const toetsen = h('div.mt-toetsen', { role: 'group', 'aria-label': 'Welke letter hoorde je?' });
  const startKnop = h('button.knop.hoofd', { type: 'button', onclick: () => (ronde ? stopRonde('Gestopt.') : start()) });
  const hoorKnop = h('button.knop', { type: 'button', onclick: () => hoorNieuw() });
  const terug = h('button.knop.klein', { type: 'button', 'aria-label': 'Een les terug', onclick: () => zetLes(les - 1) }, '−');
  const verder = h('button.knop.klein', { type: 'button', 'aria-label': 'Een les verder', onclick: () => zetLes(les + 1) }, '+');
  const snelheidTekst = h('strong');
  const snelheid = h('input.doe-schuif', { type: 'range', min: 8, max: 25, step: 1, value: wpm,
    oninput: () => { wpm = Number(snelheid.value); snelheidTekst.textContent = `${wpm} woorden per minuut`; bewaar(); } });

  const el = h('div.doe-morsetrainer',
    h('div.mt-kop', lesTekst, h('div.knop-rij', terug, verder)),
    rij,
    h('div.mt-speler', lamp, h('div.mt-midden', groot, voortgang)),
    toetsen, melding,
    h('div.knop-rij', startKnop, hoorKnop),
    h('label.doe-label', h('span', 'Snelheid van de tekens: ', snelheidTekst), snelheid),
    h('p.doe-stil', 'Tip: tel geen punten en strepen, maar luister naar het ritme van de hele letter. Op een toetsenbord kun je ook de letter typen.'));

  function bewaar() { schrijf({ les, wpm }); }

  function toonLes() {
    lesTekst.replaceChildren(h('strong', `Les ${les - 1}`), ` · ${les} tekens, nieuw: `, h('b.mt-nieuw', nieuw()), ` ${symbolen(MORSE[nieuw()])}`);
    rij.replaceChildren(...tekens().map((t) => h('span', { class: t === nieuw() ? 'mt-is-nieuw' : '' }, h('b', t), h('small', symbolen(MORSE[t])))));
    toetsen.replaceChildren(...tekens().map((t) => h('button.knop.mt-toets', { type: 'button', 'data-t': t, onclick: () => antwoord(t) }, t)));
    hoorKnop.textContent = `▶ Hoor de ${nieuw()}`;
    terug.disabled = les <= 2;
    verder.disabled = les >= KOCH.length;
    zetKnoppen();
  }

  function zetLes(n) {
    if (ronde) stopRonde('');
    les = Math.min(Math.max(n, 2), KOCH.length);
    bewaar();
    toonLes();
    melding.textContent = '';
    groot.textContent = '';
    voortgang.replaceChildren();
  }

  function zetKnoppen() {
    startKnop.textContent = ronde ? '■ Stop' : '▶ Start een ronde';
    toetsen.classList.toggle('uit', !ronde);
  }

  function speelTeken(t, klaar) {
    if (stop) { const s = stop; stop = null; s(); }
    stop = speel(morseTijdlijn(naarMorse(t).woorden, wpm), {
      el, hz: 650,
      opStand: (aan) => lamp.classList.toggle('aan', aan),
      opKlaar: () => { stop = null; klaar?.(); },
    });
  }

  function hoorNieuw() {
    if (ronde) return;
    if (!geluid()) { melding.textContent = 'Deze browser maakt geen geluid; kijk naar het licht.'; }
    const t = nieuw();
    groot.textContent = t;
    let keer = 0;
    const nogEens = () => { if (++keer < 3 && el.isConnected && !ronde) setTimeout(() => speelTeken(t, nogEens), 500); };
    speelTeken(t, nogEens);
  }

  // -- a round
  const toets = (e) => {
    if (!el.isConnected) { document.removeEventListener('keydown', toets); return; }
    if (!ronde || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { stopRonde('Gestopt.'); return; }
    if (e.key === ' ' && ronde.letter) { e.preventDefault(); speelTeken(ronde.letter); return; }
    const t = e.key.toUpperCase();
    if (t.length === 1 && MORSE[t]) { e.preventDefault(); antwoord(t); }
  };

  function start() {
    melding.textContent = geluid() ? '' : 'Deze browser maakt geen geluid; kijk naar het licht.';
    melding.classList.remove('fout');
    ronde = { nr: 0, goed: 0, letter: null, wacht: false, fouten: {} };
    voortgang.replaceChildren(...Array.from({ length: RONDE }, () => h('span')));
    document.addEventListener('keydown', toets);
    zetKnoppen();
    volgende();
  }

  function volgende() {
    if (!ronde || !el.isConnected) return;
    if (ronde.nr >= RONDE) { einde(); return; }
    // the new letter comes a little more often, so it gets learned
    const lijst = tekens();
    const t = Math.random() < 0.3 ? nieuw() : lijst[Math.floor(Math.random() * lijst.length)];
    ronde.letter = t;
    ronde.wacht = true;
    groot.textContent = '?';
    speelTeken(t);
  }

  function antwoord(t) {
    if (!ronde?.wacht) return;
    ronde.wacht = false;
    const juist = ronde.letter;
    const vakje = voortgang.children[ronde.nr];
    ronde.nr++;
    for (const k of toetsen.children) k.classList.toggle('goed', k.dataset.t === juist);
    if (t === juist) {
      ronde.goed++;
      vakje.className = 'goed';
      groot.textContent = juist;
      melding.classList.remove('fout');
      melding.textContent = `Goed: ${juist}`;
      setTimeout(() => { for (const k of toetsen.children) k.classList.remove('goed'); volgende(); }, 650);
    } else {
      ronde.fouten[juist] = (ronde.fouten[juist] ?? 0) + 1;
      vakje.className = 'fout';
      groot.textContent = juist;
      melding.classList.add('fout');
      melding.textContent = `Het was ${juist} (${symbolen(MORSE[juist])}), niet ${t}.`;
      speelTeken(juist, () => setTimeout(() => { for (const k of toetsen.children) k.classList.remove('goed'); volgende(); }, 700));
    }
  }

  function einde() {
    const deel = ronde.goed / RONDE;
    const fouten = Object.entries(ronde.fouten).sort((a, b) => b[1] - a[1]).map(([t]) => t);
    const procent = Math.round(deel * 100);
    stopRonde('');
    melding.classList.toggle('fout', deel < DOOR);
    if (deel >= DOOR && les < KOCH.length) {
      zetLes(les + 1);
      melding.textContent = `${procent} % goed! Je bent door: het nieuwe teken is de ${nieuw()}. Luister er eerst even naar.`;
    } else if (deel >= DOOR) {
      melding.textContent = `${procent} % goed, en je kent alle tekens. Zet de snelheid hoger!`;
    } else {
      melding.textContent = `${procent} % goed. Bij 90 % mag je door.${fouten.length ? ` Let vooral op: ${fouten.slice(0, 3).join(', ')}.` : ''}`;
    }
  }

  function stopRonde(tekst) {
    if (stop) { const s = stop; stop = null; s(); }
    document.removeEventListener('keydown', toets);
    ronde = null;
    lamp.classList.remove('aan');
    for (const k of toetsen.children) k.classList.remove('goed');
    if (tekst) { melding.classList.remove('fout'); melding.textContent = tekst; }
    zetKnoppen();
  }

  snelheidTekst.textContent = `${wpm} woorden per minuut`;
  toonLes();
  groot.textContent = '';
  melding.textContent = `Je begint met twee tekens: ${KOCH[0]} (${symbolen(MORSE[KOCH[0]])}) en ${KOCH[1]} (${symbolen(MORSE[KOCH[1]])}). Druk op Start.`;
  if (les > 2) melding.textContent = `Je was bij les ${les - 1}.`;
  return el;
}
