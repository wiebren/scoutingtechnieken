// What the app keeps on this device, in localStorage: what you have ticked off in the insignelaag, the niveaus
// you have chosen in the menu, the theme, and which updates you have seen. Nothing leaves the device. Storage may be missing
// (a private window): the app works without it, it just forgets.

import { ALLE } from './data/niveaus.js';

const SLEUTEL = { afgevinkt: 'scoutingtechnieken.afgevinkt.v1', updates: 'scoutingtechnieken.updates.v1', niveaus: 'scoutingtechnieken.niveaus.v1', thema: 'scoutingtechnieken.thema.v1', gekregen: 'scoutingtechnieken.gekregen.v1' };

const lees = (key, standaard) => { try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? standaard; } catch { return standaard; } };
const schrijf = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* it works without */ } };

// -- afgevinkt: a blad by its id ("kan ik"), a requirement without a blad by its key (src/data/insignes.js)
let afgevinkt = new Set(lees(SLEUTEL.afgevinkt, []));
const volgers = new Set();
const bewaar = () => { schrijf(SLEUTEL.afgevinkt, [...afgevinkt]); for (const fn of volgers) fn(); };

export const isAfgevinkt = (key) => afgevinkt.has(key);
export function zetAfgevinkt(key, aan) { if (aan) afgevinkt.add(key); else afgevinkt.delete(key); bewaar(); }
export function wisAfgevinkt() { afgevinkt = new Set(); bewaar(); }
export const aantalAfgevinkt = () => afgevinkt.size;
/** Call fn whenever something is ticked or unticked, here or in another tab; returns a function that stops it. */
export function volgAfgevinkt(fn) { volgers.add(fn); return () => volgers.delete(fn); }
// -- gekregen: the insignes you have received, by insigne and niveau ('knopen:1'); their followers are those of afgevinkt
let gekregen = new Set(lees(SLEUTEL.gekregen, []));
export const isGekregen = (insigne, niveau) => gekregen.has(`${insigne}:${niveau}`);
export function zetGekregen(insigne, niveau, aan) {
  if (aan) gekregen.add(`${insigne}:${niveau}`); else gekregen.delete(`${insigne}:${niveau}`);
  schrijf(SLEUTEL.gekregen, [...gekregen]);
  for (const fn of volgers) fn();
}
export const aantalGekregen = () => gekregen.size;
addEventListener('storage', (e) => {
  if (e.key === SLEUTEL.gekregen) { gekregen = new Set(lees(SLEUTEL.gekregen, [])); for (const fn of volgers) fn(); return; }
  if (e.key !== SLEUTEL.afgevinkt) return;
  afgevinkt = new Set(lees(SLEUTEL.afgevinkt, []));
  for (const fn of volgers) fn();
});

// -- the niveaus chosen in the menu (src/data/niveaus.js): a Set of '1', '2', '3', 'extra'; empty (the start) shows
// everything
const leesNiveaus = () => {
  const keys = lees(SLEUTEL.niveaus, []);
  return new Set(Array.isArray(keys) ? keys.filter((k) => ALLE.includes(k)) : []);
};
let niveaus = leesNiveaus();
const niveauVolgers = new Set();
export const niveauKeuze = () => niveaus;
export function zetNiveauKeuze(keys) {
  niveaus = new Set(keys.filter((k) => ALLE.includes(k)));
  schrijf(SLEUTEL.niveaus, [...niveaus]);
  for (const fn of niveauVolgers) fn(niveaus);
}
/** Call fn whenever the choice changes, here or in another tab. */
export function volgNiveauKeuze(fn) { niveauVolgers.add(fn); }
addEventListener('storage', (e) => {
  if (e.key !== SLEUTEL.niveaus) return;
  niveaus = leesNiveaus();
  for (const fn of niveauVolgers) fn(niveaus);
});

// -- updates: the newest date seen, so Over can show there is something new
export const updatesGezien = () => lees(SLEUTEL.updates, '');
export const zetUpdatesGezien = (datum) => schrijf(SLEUTEL.updates, datum);

// -- the theme: 'auto' follows the device, 'licht' and 'donker' force one (data-theme on <html>, style.css). index.html
// sets it before the first paint with the same key, so the page does not flash.
const KLEUR_BALK = { licht: '#ffffff', donker: '#18201b' };
const THEMAS = ['auto', 'licht', 'donker'];
export const thema = () => { const t = lees(SLEUTEL.thema, 'auto'); return THEMAS.includes(t) ? t : 'auto'; };
function pasThemaToe(t) {
  const root = document.documentElement;
  if (t === 'auto') delete root.dataset.theme; else root.dataset.theme = t === 'donker' ? 'dark' : 'light';
  // the browser bar: both meta tags (one per media query) get the forced colour, or their own back
  for (const m of document.querySelectorAll('meta[name="theme-color"]')) {
    m.dataset.eigen ??= m.content;
    m.content = t === 'auto' ? m.dataset.eigen : KLEUR_BALK[t];
  }
}
export function zetThema(t) { schrijf(SLEUTEL.thema, t); pasThemaToe(t); }
pasThemaToe(thema());
addEventListener('storage', (e) => { if (e.key === SLEUTEL.thema) pasThemaToe(thema()); });
