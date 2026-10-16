// The Codeermachine: type on one side and the other side follows, for every code in ./lib/geheim.js. Gewone tekst on
// the left, the code on the right (under each other on a phone). Each code shows how it works: the strips, the
// square or the rows it uses, lit as you type. The tekenalfabetten draw their letters, and have a keyboard of
// tekens to type a message in code back into letters. `code` picks the code to start with, so the piece can open on
// the right code on each blad; you can always pick another.
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { CODES, standaardSleutels } from './lib/geheim.js';
import { TEKENSCHRIFT } from './lib/tekens.js';
import { BREED, HOOG, SEMAFOOR, armen, pop } from './lib/seinpop.js';
import { LETTERVLAG, breedte, vlag } from './lib/vlaggen.js';
import '../vorm.css';
import './codeermachine.css';

const GROEPEN = [['vervangen', 'Vervangen'], ['cijfers', 'Cijfers en roosters'], ['verwisselen', 'Verwisselen'], ['verbergen', 'Verbergen'], ['tekens', 'Tekenalfabetten'], ['seinen', 'Seinen als code']];
const ABC = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

/** One letter of a tekenalfabet as an <svg> string, about `maat` px high. */
function teken(soort, letter, maat) {
  const svg = (w, hh, inhoud) => `<svg viewBox="0 0 ${w} ${hh}" height="${maat}" width="${Math.round((maat * w) / hh)}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${inhoud}</svg>`;
  if (soort === 'semafoor') { const a = armen(SEMAFOOR[letter]); return svg(BREED, HOOG, pop({ links: a.links, rechts: a.rechts })); }
  if (soort === 'vlaggen') { const o = LETTERVLAG[letter].ontwerp; return svg(breedte(o, 40) + 2, 42, vlag(o, 1, 1, 40)); }
  return svg(40, 40, TEKENSCHRIFT[soort].teken(letter));
}

export default function codeermachine({ code: beginCode = 'verschuiving' } = {}) {
  let id = CODES[beginCode] ? beginCode : 'verschuiving';
  let sleutels = standaardSleutels(CODES[id]);
  let laatst = 'gewoon';         // which side was typed in last: the other follows
  let metLetters = false;        // the keyboard of tekens shows the letters too

  const kies = h('select.doe-veld.cm-kies', { 'aria-label': 'Kies een code', onchange: () => zetCode(kies.value) },
    GROEPEN.map(([g, naam]) => h('optgroup', { label: naam },
      Object.entries(CODES).filter(([, c]) => c.groep === g).map(([cid, c]) => h('option', { value: cid, selected: cid === id }, c.naam)))));
  const sleutelPlek = h('div.cm-sleutels');
  const gewoon = h('textarea.doe-veld', { rows: 3, maxlength: 300, spellcheck: 'false', oninput: () => { laatst = 'gewoon'; werkBij(); } }, 'Kom om acht uur naar het kampvuur');
  const geheim = h('textarea.doe-veld.cm-geheim', { rows: 3, maxlength: 2000, spellcheck: 'false', oninput: () => { laatst = 'geheim'; werkBij(); } });
  const tekenVeld = h('div.cm-tekenveld', { role: 'img' });
  const geheimLabel = h('span', { id: `cm-geheim-${Math.random().toString(36).slice(2, 8)}` });
  geheim.setAttribute('aria-labelledby', geheimLabel.id);
  const geheimKant = h('div.doe-label', geheimLabel, geheim, tekenVeld);
  const opmerking = h('p.doe-stil', { 'aria-live': 'polite' });
  const kopieer = h('button.knop.klein', { type: 'button', onclick: () => kopieren() }, 'Kopieer de code');
  const wissel = h('button.knop.klein', { type: 'button', onclick: () => { gewoon.value = ''; geheim.value = ''; laatst = 'gewoon'; werkBij(); gewoon.focus(); } }, 'Wis');
  const toetsenbord = h('div.cm-toetsen', { role: 'group', 'aria-label': 'Typ in tekens' });
  const toetsPlek = h('div.cm-toetsplek',
    h('div.cm-toetskop', h('span', 'Typ een boodschap in tekens:'), h('div.chips', h('button.chip', { type: 'button', 'aria-pressed': 'false',
      onclick: (e) => { metLetters = !metLetters; e.currentTarget.setAttribute('aria-pressed', String(metLetters)); bouwToetsen(); } }, 'Toon de letters'))),
    toetsenbord);
  const hoe = h('div.cm-hoe');

  const el = h('div.doe-codeermachine',
    h('label.doe-label', 'Code', kies),
    sleutelPlek,
    h('div.cm-velden', h('label.doe-label', 'Gewone tekst', gewoon), geheimKant),
    opmerking,
    h('div.knop-rij', kopieer, wissel),
    toetsPlek,
    hoe);

  // -- the keys of the code
  function bouwSleutels() {
    const c = CODES[id];
    sleutelPlek.replaceChildren(...(c.sleutels ?? []).map((s) => {
      if (s.soort === 'getal') {
        const waarde = h('strong', String(sleutels[s.id]));
        const schuif = h('input.doe-schuif', { type: 'range', min: s.min, max: s.max, step: 1, value: sleutels[s.id],
          oninput: () => { sleutels[s.id] = Number(schuif.value); waarde.textContent = schuif.value; werkBij(); } });
        return h('label.doe-label', h('span', `${s.naam}: `, waarde), schuif);
      }
      if (s.soort === 'keuze') {
        return h('div.doe-label', h('span', s.naam), h('div.chips', { role: 'group', 'aria-label': s.naam },
          keuze(s.opties, sleutels[s.id], (v) => { sleutels[s.id] = v; werkBij(); })));
      }
      const veld = h('input.doe-veld.cm-woord', { type: 'text', value: sleutels[s.id], maxlength: 16, autocomplete: 'off', spellcheck: 'false',
        inputmode: s.cijfers ? 'numeric' : null, oninput: () => { sleutels[s.id] = veld.value || s.standaard; werkBij(); } });
      return h('label.doe-label', s.naam, veld);
    }));
  }

  function zetCode(nieuw) {
    id = nieuw;
    sleutels = standaardSleutels(CODES[id]);
    kies.value = id;
    bouwSleutels();
    bouwToetsen();
    laatst = 'gewoon';
    werkBij();
  }

  // -- the keyboard of tekens, for the tekenalfabetten
  function bouwToetsen() {
    const c = CODES[id];
    toetsPlek.hidden = !c.tekens;
    if (!c.tekens) return;
    toetsenbord.replaceChildren(
      ...ABC.map((l) => h('button.cm-toets', { type: 'button', 'aria-label': l, onclick: () => typ(l), html: teken(c.teken, l, 34) }, metLetters ? h('span', l) : null)),
      h('button.cm-toets.breed', { type: 'button', onclick: () => typ(' ') }, 'spatie'),
      h('button.cm-toets.breed', { type: 'button', 'aria-label': 'Haal de laatste letter weg', onclick: () => typ(null) }, '⌫'));
  }
  function typ(l) {
    gewoon.value = l === null ? gewoon.value.slice(0, -1) : gewoon.value + l.toLowerCase();
    laatst = 'gewoon';
    werkBij();
  }

  // -- the two sides
  function werkBij() {
    const c = CODES[id];
    geheimLabel.textContent = c.tekens ? `In ${c.naam.toLowerCase()}` : c.eenRichting ? 'Zo wordt het' : 'Geheime tekst';
    geheim.hidden = !!c.tekens;
    tekenVeld.hidden = !c.tekens;
    geheim.readOnly = !!c.eenRichting;
    kopieer.hidden = !!c.tekens;
    let tekst = '';
    if (c.tekens) {
      const lijst = c.tekens(gewoon.value);
      tekenVeld.replaceChildren(...lijst.map((l) => (l ? h('span.cm-tekentje', { html: teken(c.teken, l, c.teken === 'semafoor' ? 64 : 40) }) : h('span.cm-spatie'))));
      tekenVeld.setAttribute('aria-label', `${gewoon.value} in ${c.naam}`);
      opmerking.textContent = lijst.length ? '' : 'Typ iets, of tik op de tekens hieronder.';
    } else if (laatst === 'gewoon' || c.eenRichting) {
      geheim.value = c.codeer(gewoon.value, sleutels);
      opmerking.textContent = c.eenRichting ?? (c.zelfde ? 'Bij deze code gaan coderen en ontcijferen hetzelfde.' : '');
      tekst = gewoon.value;
    } else {
      const terug = c.decodeer(geheim.value, sleutels);
      if (typeof terug === 'object') { opmerking.textContent = terug.fout; } else { gewoon.value = terug; opmerking.textContent = terug.includes('?') ? 'Een ? is een stukje code dat geen letter is.' : ''; }
      tekst = gewoon.value;
    }
    toonHoe(c, c.tekens ? gewoon.value : tekst);
  }

  // -- how it works: a small table of cells, or the key of a tekenalfabet
  function toonHoe(c, tekst) {
    if (c.tekens) {
      hoe.replaceChildren(h('p.cm-hoekop', 'De sleutel'), h('div.cm-sleutel', ABC.map((l) => h('span', { html: teken(c.teken, l, c.teken === 'semafoor' ? 52 : 34) }, h('b', l)))));
      hoe.hidden = c.teken === 'vlaggen' || c.teken === 'semafoor';
      return;
    }
    const r = c.rooster?.(tekst, sleutels);
    hoe.hidden = !r;
    if (!r) return;
    const tabel = h('table.cm-rooster', { class: [r.toetsen && 'toetsen', r.kolomKleur && 'kolomkleur', r.rijKleur && 'rijkleur'].filter(Boolean).join(' ') },
      r.boven && h('thead', h('tr', r.links && h('th'), r.boven.map((b) => h('th', { scope: 'col' }, b)))),
      h('tbody', r.rijen.map((rij, i) => h('tr',
        r.links && h('th', { scope: 'row' }, r.links[i]),
        rij.map((cel) => h('td', {
          class: [cel.nu && 'nu', cel.geheim && 'geheim', cel.stil && 'stil', cel.leeg && 'cm-leeg'].filter(Boolean).join(' ') || null,
          'data-k': cel.kolom ?? cel.rij ?? null,
        }, cel.t))))));
    hoe.replaceChildren(h('p.cm-hoekop', 'Zo werkt het'), h('div.cm-rooster-wrap', tabel));
  }

  async function kopieren() {
    try { await navigator.clipboard.writeText(geheim.value); opmerking.textContent = 'De code staat op het klembord.'; }
    catch { geheim.select(); opmerking.textContent = 'Kopiëren lukte niet; de code is geselecteerd.'; }
  }

  bouwSleutels();
  bouwToetsen();
  werkBij();
  return el;
}
