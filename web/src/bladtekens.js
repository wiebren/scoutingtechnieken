// In a list: after the name of a blad its niveaus (1, 2, 3 in the insigne colours; extra gets none) and a tick when you
// have ticked it off ("Ik kan dit", src/opslag.js). A screen reader gets the same in words.
import { niveausVan } from './data/niveaus.js';
import { h } from './dom.js';
import { icoon } from './iconen.js';
import { isAfgevinkt } from './opslag.js';

/** The marks of a blad (or of several: the niveaus of all of them, and the tick only when all are ticked). */
export function bladTekens(ids) {
  const lijst = [].concat(ids);
  const niveaus = [...new Set(lijst.flatMap((id) => niveausVan(id)))].filter((n) => n !== 'extra').sort();
  const kan = lijst.length > 0 && lijst.every((id) => isAfgevinkt(id));
  if (!niveaus.length && !kan) return null;
  const woorden = [niveaus.length && `niveau ${niveaus.join(' en ')}`, kan && 'afgevinkt'].filter(Boolean).join(', ');
  return h('span.rij-tekens', { title: woorden },
    h('span.wegwijs', `(${woorden})`),
    niveaus.map((n) => h('span.niveau-stip', { 'data-niveau': n, 'aria-hidden': 'true' }, n)),
    // the tick always has its place, empty when not ticked, so the niveaus stand in the same spot in every row
    h('span.rij-vink', { 'aria-hidden': 'true', class: kan ? null : 'leeg' }, kan && icoon('vink', 'icoon')));
}
