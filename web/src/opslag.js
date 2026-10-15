// What the app keeps on this device, in localStorage: what you have ticked off in the insignelaag, and which
// updates you have seen. Nothing leaves the device. Storage may be missing (a private window): the app works
// without it, it just forgets.

const SLEUTEL = { afgevinkt: 'scoutingtechnieken.afgevinkt.v1', updates: 'scoutingtechnieken.updates.v1' };

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
/** Call fn whenever something is ticked or unticked, here or in another tab. */
export function volgAfgevinkt(fn) { volgers.add(fn); }
addEventListener('storage', (e) => {
  if (e.key !== SLEUTEL.afgevinkt) return;
  afgevinkt = new Set(lees(SLEUTEL.afgevinkt, []));
  for (const fn of volgers) fn();
});

// -- updates: the newest date seen, so Over can show there is something new
export const updatesGezien = () => lees(SLEUTEL.updates, '');
export const zetUpdatesGezien = (datum) => schrijf(SLEUTEL.updates, datum);
