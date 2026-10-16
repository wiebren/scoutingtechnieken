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

/** The foot of a tile (a category or a groep): left the niveaus that its bladen have (1, 2, 3, + for extra; the
 *  ones it doesn't have stay empty), right a tick with how many of them you have ticked off, "3/12". */
export function tegelVoet(bladen) {
  const ids = bladen.map((b) => b.id);
  const heeft = new Set(ids.flatMap((id) => niveausVan(id)));
  const klaar = ids.filter((id) => isAfgevinkt(id)).length;
  const keuzes = [['1', '1'], ['2', '2'], ['3', '3'], ['extra', '+']];
  const woorden = `${keuzes.filter(([k]) => heeft.has(k)).map(([k]) => (k === 'extra' ? 'extra' : `niveau ${k}`)).join(', ') || 'geen niveau'}; ${klaar} van ${ids.length} afgevinkt`;
  return h('span.tegel-voet',
    h('span.wegwijs', `(${woorden})`),
    h('span.niveau-stippen', { 'aria-hidden': 'true' },
      keuzes.map(([k, kort]) => h('span.niveau-stip', { 'data-niveau': k, class: heeft.has(k) ? null : 'uit' }, kort))),
    h('span.tegel-vink', { 'aria-hidden': 'true', class: klaar ? 'iets' : null },
      h('span.rij-vink', { class: klaar ? null : 'leeg' }, icoon('vink', 'icoon')), `${klaar}/${ids.length}`));
}
