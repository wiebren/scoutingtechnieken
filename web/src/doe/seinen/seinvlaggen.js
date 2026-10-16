// The seinvlaggen of the Internationaal Seinboek to learn (./lib/vlaggen.js, from the sister project vlet). Welke
// letter: a flag and four letters to pick from. Wat betekent hij: a flag and four meanings. Spel een woord: your
// word as a hoist of flags, top down; a letter that comes again takes a vervangwimpel, because each flag is on board
// only once.
import { h } from '../../dom.js';
import { kaal, willekeurig } from '../codes.js';
import { keuze } from '../knoppen.js';
import { LETTERVLAG, LETTERVLAGGEN, OVERIGE_WIMPELS, breedte, vlag } from './lib/vlaggen.js';
import '../vorm.css';
import './seinvlaggen.css';

const svgVan = (o, hoog, label) => {
  const w = breedte(o, hoog);
  return `<svg viewBox="-1 -1 ${w + 2} ${hoog + 2}" width="${w + 2}" height="${hoog + 2}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${vlag(o, 0, 0, hoog)}</svg>`;
};
// the quiz on meanings leaves out R: on its own it has no meaning
const MET_BETEKENIS = LETTERVLAGGEN.filter((v) => !['R'].includes(v.id));

export default function seinvlaggen({ modus: beginModus = 'letter' } = {}) {
  let modus = beginModus;
  let vraag = null;
  let goed = 0;
  let gevraagd = 0;

  // -- the quiz
  const plaat = h('div.sv-plaat');
  const vraagTekst = h('p.sv-vraag');
  const opties = h('div.sv-opties', { role: 'group' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const score = h('p.doe-stil');
  const volgende = h('button.knop.klein', { type: 'button', onclick: () => nieuweVraag(true) }, 'Volgende');
  const quiz = h('div.sv-quiz', plaat, h('div.sv-paneel', vraagTekst, opties, melding, h('div.knop-rij', volgende), score));
  quiz.addEventListener('keydown', (e) => {
    const k = Number(e.key);
    if (k >= 1 && k <= 4 && !vraag?.klaar) { e.preventDefault(); opties.children[k - 1]?.click(); }
  });

  function nieuweVraag(focus) {
    const lijst = modus === 'betekenis' ? MET_BETEKENIS : LETTERVLAGGEN;
    let v;
    do v = willekeurig(lijst); while (v === vraag?.v);
    vraag = { v, klaar: false };
    plaat.innerHTML = svgVan(v.ontwerp, 110, `Een seinvlag: ${v.ziet}`);
    const anderen = lijst.filter((x) => x !== v).sort(() => Math.random() - 0.5).slice(0, 3);
    const keus = [v, ...anderen].sort(() => Math.random() - 0.5);
    vraagTekst.textContent = modus === 'betekenis' ? 'Wat betekent deze vlag als hij alleen hangt?' : 'Welke letter is deze vlag?';
    opties.setAttribute('aria-label', vraagTekst.textContent);
    opties.className = modus === 'betekenis' ? 'sv-opties lang' : 'sv-opties';
    opties.replaceChildren(...keus.map((x, i) => h('button.knop.sv-optie', { type: 'button', 'data-id': x.id, 'aria-keyshortcuts': String(i + 1),
      onclick: (e) => kies(x, e.currentTarget) }, modus === 'betekenis' ? x.betekenis : h('span', h('b', x.id), ' ', x.spelwoord))));
    melding.textContent = '';
    melding.classList.remove('fout');
    volgende.hidden = true;
    if (focus) opties.firstChild.focus();
  }

  function kies(x, knop) {
    if (vraag.klaar) return;
    vraag.klaar = true;
    gevraagd++;
    const v = vraag.v;
    [...opties.children].find((k) => k.dataset.id === v.id).classList.add('goed');
    const uitleg = `Vlag ${v.id} (${v.spelwoord}), ${v.ziet}: ${v.betekenis.charAt(0).toLowerCase()}${v.betekenis.slice(1)}`;
    if (x === v) { goed++; melding.classList.remove('fout'); melding.textContent = `Goed! ${uitleg}`; }
    else { knop.classList.add('fout'); melding.classList.add('fout'); melding.textContent = `Niet goed. ${uitleg}`; }
    for (const k of opties.children) k.setAttribute('aria-disabled', 'true');
    score.textContent = `${goed} van ${gevraagd} goed.`;
    volgende.hidden = false;
    volgende.focus();
  }

  // -- Spel een woord
  const invoer = h('input.doe-veld', { type: 'text', value: 'Scouting', maxlength: 14, autocomplete: 'off', spellcheck: 'false', oninput: () => spel() });
  const hijs = h('ol.sv-hijs');
  const spelUitleg = h('p.doe-stil', { 'aria-live': 'polite' });
  const spellen = h('div.sv-paneel',
    h('label.doe-label', 'Typ een woord', invoer),
    h('p.doe-stil', 'Zo hangen de vlaggen onder elkaar aan de lijn, de eerste letter bovenaan.'),
    hijs, spelUitleg);

  function spel() {
    const letters = [...kaal(invoer.value).replace(/[^A-Z]/g, '')].slice(0, 14);
    const gezien = [];
    let vervangen = false;
    let teVer = false;
    hijs.replaceChildren(...letters.map((l, i) => {
      // count the lettervlaggen only: a vervangwimpel is not one of them
      const eerder = gezien.indexOf(l);
      if (eerder < 0 || eerder >= 3) gezien.push(l);
      if (eerder >= 0 && eerder < 3) {
        vervangen = true;
        const w = OVERIGE_WIMPELS[eerder];
        return h('li', { html: svgVan(w.ontwerp, 34, `${w.naam}: herhaalt de ${eerder + 1}e lettervlag, de ${l}`) }, h('span', `${l}: ${w.naam.toLowerCase()}`));
      }
      if (eerder >= 0) teVer = true;
      return h('li', { html: svgVan(LETTERVLAG[l].ontwerp, 34, `Vlag ${l}, ${LETTERVLAG[l].spelwoord}`) }, h('span', `${l} ${LETTERVLAG[l].spelwoord}`));
    }));
    hijs.setAttribute('aria-label', `De vlaggen voor ${letters.join('')}`);
    spelUitleg.textContent = [
      vervangen && 'Aan boord heb je van elke vlag er maar één. Komt een letter terug, dan hang je een vervangwimpel: de eerste herhaalt de bovenste vlag, de tweede de tweede vlag, de derde de derde.',
      teVer && 'Een letter die terugkomt na de derde vlag kun je niet vervangen: dan heb je een tweede set vlaggen nodig.',
    ].filter(Boolean).join(' ');
  }

  const el = h('div.doe-seinvlaggen',
    h('div.chips', { role: 'group', 'aria-label': 'Wat wil je doen?' },
      keuze([['letter', 'Welke letter?'], ['betekenis', 'Wat betekent hij?'], ['spellen', 'Spel een woord']], modus, zetModus)),
    quiz, spellen);

  function zetModus(m) {
    const was = modus;
    modus = m;
    quiz.hidden = m === 'spellen';
    spellen.hidden = m !== 'spellen';
    if (m !== 'spellen' && (m !== was || !vraag)) { goed = 0; gevraagd = 0; score.textContent = ''; nieuweVraag(false); }
    if (m === 'spellen') spel();
  }

  zetModus(modus);
  return el;
}

