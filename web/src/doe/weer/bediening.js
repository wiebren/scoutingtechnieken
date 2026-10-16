// What the sky pieces share: a place in the Netherlands, a date and a time to choose, and the button for now. They
// all work on one state { plaats, j, dag, minuten } (dag = day of the year, minuten = on the clock in the
// Netherlands) and call `opnieuw()` after a change.
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { datumTekst, klok, klokNL, momentNL, PLAATS, PLAATSEN, uitDagVanJaar } from './hemel.js';
import '../vorm.css';
import './hemel.css';

/**
 * A state for today, now, in Amersfoort; `minuten` overrides the time. With `nacht` the night counts from the
 * evening: at 1:00 it is still the night of yesterday, at 25:00.
 */
export function beginStaat({ minuten, plaats = 'amersfoort', nacht = false } = {}) {
  const staat = { plaats };
  zetNu(staat, { nacht });
  if (minuten != null) staat.minuten = minuten;
  return staat;
}

/** The moment of the state, in UTC milliseconds; with `minuten` another time on the same day. */
export function moment(staat, minuten = staat.minuten) {
  const { j, m, d } = uitDagVanJaar(staat.dag, staat.j);
  return momentNL(j, m, d, minuten);
}

/** The date of the state: { j, m, d, tekst }. */
export function datum(staat) {
  const x = uitDagVanJaar(staat.dag, staat.j);
  return { ...x, tekst: datumTekst(x.m, x.d) };
}

export const plaatsVan = (staat) => PLAATS[staat.plaats];

const dagenIn = (j) => ((j % 4 === 0 && j % 100 !== 0) || j % 400 === 0 ? 366 : 365);

/** Chips for the place. */
export function plaatsKeuze(staat, opnieuw) {
  return h('div.chips.hm-plaatsen', { role: 'group', 'aria-label': 'Plaats' },
    keuze(PLAATSEN.map((p) => [p.id, p.naam]), staat.plaats, (id) => { staat.plaats = id; opnieuw(); }));
}

/** A slider for the date through the year. Returns { el, zet() } so a caller can update it after "nu". */
export function datumSchuif(staat, opnieuw, label = 'Datum') {
  const uit = h('output');
  const schuif = h('input.doe-schuif', { type: 'range', min: 1, max: dagenIn(staat.j), step: 1, value: staat.dag,
    oninput: () => { staat.dag = Number(schuif.value); zet(); opnieuw(); } });
  function zet() {
    schuif.max = dagenIn(staat.j);
    schuif.value = staat.dag;
    uit.textContent = datum(staat).tekst;
    schuif.setAttribute('aria-valuetext', uit.textContent);
  }
  zet();
  return { el: h('label.doe-label.hm-schuif', h('span', `${label}: `, uit), schuif), zet };
}

/** A slider for the time of day, from `van` to `tot` minutes; past midnight counts on (24:00 + ...). */
export function tijdSchuif(staat, opnieuw, { van = 0, tot = 1435, stap = 5, label = 'Tijd' } = {}) {
  const uit = h('output');
  const schuif = h('input.doe-schuif', { type: 'range', min: van, max: tot, step: stap, value: staat.minuten,
    oninput: () => { staat.minuten = Number(schuif.value); zet(); opnieuw(); } });
  function zet() {
    schuif.value = staat.minuten;
    uit.textContent = klok(staat.minuten);
    schuif.setAttribute('aria-valuetext', `${uit.textContent}${klokNL(moment(staat)).zomer ? ' zomertijd' : ' wintertijd'}`);
  }
  zet();
  return { el: h('label.doe-label.hm-schuif', h('span', `${label}: `, uit), schuif), zet };
}

/** Set the state to now (or today with the time left alone); `nacht` as in beginStaat. */
export function zetNu(staat, { tijd = true, nacht = false } = {}) {
  const nu = klokNL(Date.now());
  const gisteren = nacht && nu.minuten < 12 * 60 && nu.dagVanJaar > 1;
  staat.j = nu.j; staat.dag = nu.dagVanJaar - (gisteren ? 1 : 0);
  if (tijd) staat.minuten = nu.minuten + (gisteren ? 24 * 60 : 0);
}

/** "wintertijd" or "zomertijd" for the state. */
export const tijdNaam = (staat) => (klokNL(moment(staat)).zomer ? 'zomertijd' : 'wintertijd');
