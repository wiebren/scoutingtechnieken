// Semafoor (or the old Vreede-stelsel) with a figure whose arms you set yourself. Drag a hand round, tap where a
// flag should go, or use the buttons; the piece says what letter the arms make. Sein een woord: make the letters of
// a word one by one. Lees het teken: the figure shows a letter and you pick which. As the reader sees it: the arm on
// your left is the seiner's right arm. Data and figure: ./lib/seinpop.js (NAV §4b; Vreede: reference/boeken).
import { h } from '../../dom.js';
import { WOORDEN, willekeurig } from '../codes.js';
import { keuze } from '../knoppen.js';
import {
  BREED, HOOG, SCHOUDERS, SEMAFOOR, SEMAFOOR_CIJFER, SEMAFOOR_TEKEN, VREEDE, VREEDE_HOEK, VREEDE_STANDEN,
  armen, inWoorden, pop, semafoorLetter, vreedeNaam, vreedeStand,
} from './lib/seinpop.js';
import '../vorm.css';
import './semafoor.css';

const NS = 'http://www.w3.org/2000/svg';
const SEMAFOOR_WOORDEN = WOORDEN;
const VREEDE_WOORDEN = WOORDEN.filter((w) => !w.includes('X'));

export default function semafoor({ stelsel = 'semafoor', modus: beginModus = 'seinen' } = {}) {
  const vreede = stelsel === 'vreede';
  let modus = beginModus;
  // semafoor: an angle per arm; vreede: a stand (0-4) per arm. links = the arm on your left.
  const stand = vreede ? { links: 0, rechts: 0 } : { links: 180, rechts: 180 };
  let woord = null;              // { tekst, i } in Sein een woord
  let vraag = null;              // { letter, klaar } in Lees het teken
  let goed = 0;
  let gevraagd = 0;
  let sleep = null;              // the arm being dragged

  const hoek = (arm) => (vreede ? VREEDE_HOEK[arm][stand[arm]] : stand[arm]);
  const letterNu = () => (vreede ? VREEDE[stand.links][stand.rechts] : semafoorLetter(stand.links, stand.rechts));
  const naam = (l) => (!l ? null : l === 'rust' ? 'rust' : vreede ? vreedeNaam(l) : SEMAFOOR_TEKEN[l]?.naam.toLowerCase() ?? l);

  // -- the figure you move
  const figuur = document.createElementNS(NS, 'svg');
  figuur.setAttribute('viewBox', `0 0 ${BREED} ${HOOG}`);
  figuur.setAttribute('class', 'sf-figuur');
  figuur.setAttribute('role', 'img');
  const lezer = h('p.doe-sr', { 'aria-live': 'polite' });
  const uitkomst = h('p.sf-uitkomst', { 'aria-hidden': 'true' });
  const standTekst = h('p.doe-stil');

  /** Buttons to turn an arm: for those who cannot drag, and for the keyboard. */
  const draai = (arm, stap) => {
    if (vreede) stand[arm] = (stand[arm] + stap + 5) % 5;
    else stand[arm] = (stand[arm] + stap * 45 + 360) % 360;
    teken(true);
  };
  const armKnoppen = (arm, label) => h('div.sf-arm', { role: 'group', 'aria-label': label },
    h('span.sf-armnaam', label),
    h('button.knop.klein', { type: 'button', 'aria-label': `${label} ${vreede ? 'een stand terug' : 'tegen de klok in'}`, onclick: () => draai(arm, -1) }, vreede ? '−' : '↺'),
    h('button.knop.klein', { type: 'button', 'aria-label': `${label} ${vreede ? 'een stand verder' : 'met de klok mee'}`, onclick: () => draai(arm, 1) }, vreede ? '+' : '↻'));
  const bediening = h('div.sf-bediening',
    armKnoppen('links', vreede ? 'Rechterarm (rood)' : 'Rechterarm'),
    armKnoppen('rechts', 'Linkerarm'),
    h('button.knop.klein', { type: 'button', onclick: () => { stand.links = vreede ? 0 : 180; stand.rechts = vreede ? 0 : 180; teken(true); } }, 'Rust'));

  // -- Sein een woord
  const woordRij = h('p.sf-woord', { 'aria-hidden': 'true' });
  const woordMelding = h('p.doe-melding', { 'aria-live': 'polite' });
  const hint = h('p.doe-stil');
  const eigen = h('input.doe-veld.sf-eigen', { type: 'text', maxlength: 12, autocomplete: 'off', spellcheck: 'false', placeholder: 'of typ een woord',
    'aria-label': 'Een eigen woord om te seinen', onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); nieuwWoord(eigen.value); } } });
  const woordPaneel = h('div.sf-paneel',
    woordRij, woordMelding, hint,
    h('div.knop-rij',
      h('button.knop.klein', { type: 'button', onclick: () => toonHint() }, 'Hoe?'),
      h('button.knop.klein', { type: 'button', onclick: () => nieuwWoord() }, 'Ander woord')),
    h('div.sf-eigenrij', eigen, h('button.knop.klein', { type: 'button', onclick: () => nieuwWoord(eigen.value) }, 'Sein dit')));

  // -- Lees het teken
  const leesFiguur = document.createElementNS(NS, 'svg');
  leesFiguur.setAttribute('viewBox', `0 0 ${BREED} ${HOOG}`);
  leesFiguur.setAttribute('class', 'sf-figuur');
  leesFiguur.setAttribute('role', 'img');
  const opties = h('div.sf-opties', { role: 'group', 'aria-label': 'Welke letter is dit?' });
  const leesMelding = h('p.doe-melding', { 'aria-live': 'polite' });
  const score = h('p.doe-stil');
  const volgende = h('button.knop.klein', { type: 'button', onclick: () => nieuweVraag(true) }, 'Volgende');
  const leesPaneel = h('div.sf-lees', leesFiguur,
    h('div.sf-paneel', h('p', 'Welke letter seint deze seiner?'), opties, leesMelding, h('div.knop-rij', volgende), score));
  leesPaneel.addEventListener('keydown', (e) => {
    const k = Number(e.key);
    if (k >= 1 && k <= 4 && !vraag?.klaar) { e.preventDefault(); opties.children[k - 1]?.click(); }
  });

  const zelf = h('div.sf-zelf', h('div.sf-links', figuur, bediening), h('div.sf-paneel', uitkomst, standTekst, lezer, woordPaneel));
  const el = h('div.doe-semafoor',
    h('div.chips', { role: 'group', 'aria-label': 'Wat wil je doen?' },
      keuze([['seinen', 'Zelf seinen'], ['woord', 'Sein een woord'], ['lezen', 'Lees het teken']], modus, zetModus)),
    zelf, leesPaneel,
    h('p.doe-stil', 'Je kijkt naar de seiner: zijn rechterarm zie je links.'));

  // -- drawing and reading the figure
  function teken(dooriemand) {
    figuur.innerHTML = pop({ links: hoek('links'), rechts: hoek('rechts'), soort: stelsel, greep: true });
    const l = letterNu();
    const n = naam(l);
    const cijfer = !vreede && SEMAFOOR_CIJFER[l];
    uitkomst.replaceChildren(n ? (l.length <= 2 ? h('span.sf-letter', n) : h('span.sf-teken', n)) : h('span.sf-geen', 'geen letter'),
      cijfer ? h('span.doe-stil', ` (na het cijferteken: ${cijfer})`) : '');
    standTekst.textContent = vreede ? `Rechterarm: stand ${stand.links} (${VREEDE_STANDEN[stand.links]}), linkerarm: stand ${stand.rechts} (${VREEDE_STANDEN[stand.rechts]}).`
      : `Vlaggen: ${inWoorden(stand.links)} en ${inWoorden(stand.rechts)}.`;
    figuur.setAttribute('aria-label', `De seiner. ${standTekst.textContent}`);
    if (dooriemand) lezer.textContent = `${n ? `Dit is ${n}` : 'Dit is geen letter'}. ${standTekst.textContent}`;
    if (modus === 'woord' && woord) controleerWoord(l);
  }

  function punt(e) {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(figuur.getScreenCTM().inverse());
    return [p.x, p.y];
  }

  /** Point an arm at (x, y): the nearest of its positions. */
  function richt(arm, [x, y]) {
    const [sx, sy] = SCHOUDERS[arm];
    const midden = [(SCHOUDERS.links[0] + SCHOUDERS.rechts[0]) / 2, sy];
    const [ox, oy] = vreede ? [sx, sy] : midden;
    const g = ((Math.atan2(x - ox, -(y - oy)) * 180) / Math.PI + 360) % 360;
    if (vreede) {
      const hoeken = VREEDE_HOEK[arm];
      let beste = 0;
      hoeken.forEach((a, i) => { if (verschil(a, g) < verschil(hoeken[beste], g)) beste = i; });
      stand[arm] = beste;
    } else stand[arm] = (Math.round(g / 45) * 45) % 360;
  }
  const verschil = (a, b) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

  function kiesArm([x, y]) {
    if (vreede) return x < (SCHOUDERS.links[0] + SCHOUDERS.rechts[0]) / 2 ? 'links' : 'rechts';
    const handen = [...figuur.querySelectorAll('.sp-greep')].map((c) => [c.dataset.arm, Number(c.getAttribute('cx')), Number(c.getAttribute('cy'))]);
    handen.sort((a, b) => Math.hypot(a[1] - x, a[2] - y) - Math.hypot(b[1] - x, b[2] - y));
    return handen[0][0];
  }

  figuur.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const p = punt(e);
    sleep = kiesArm(p);
    figuur.setPointerCapture(e.pointerId);
    const voor = stand[sleep];
    richt(sleep, p);
    if (stand[sleep] !== voor) teken(false);
  });
  figuur.addEventListener('pointermove', (e) => {
    if (!sleep) return;
    const voor = stand[sleep];
    richt(sleep, punt(e));
    if (stand[sleep] !== voor) teken(false);
  });
  const los = () => { if (sleep) { sleep = null; teken(true); } };
  figuur.addEventListener('pointerup', los);
  figuur.addEventListener('pointercancel', los);

  // -- Sein een woord
  function nieuwWoord(eigenWoord) {
    const lijst = vreede ? VREEDE_WOORDEN : SEMAFOOR_WOORDEN;
    let tekst = (eigenWoord ?? '').normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 12);
    if (vreede) tekst = tekst.replace(/X/g, 'KS');
    if (!tekst) do tekst = willekeurig(lijst); while (tekst === woord?.tekst);
    woord = { tekst, i: 0 };
    eigen.value = '';
    hint.textContent = '';
    woordMelding.textContent = `Sein ${tekst}. Begin met de ${tekst[0]}.`;
    toonWoord();
    if (letterNu() === doel()) controleerWoord(letterNu());
  }
  const doel = () => {
    const l = woord.tekst[woord.i];
    return vreede && (l === 'I' || l === 'J') ? 'IJ' : l;
  };
  function toonWoord() {
    woordRij.replaceChildren(...[...woord.tekst].map((l, i) => h('span', { class: i < woord.i ? 'klaar' : i === woord.i ? 'nu' : '' }, l)));
  }
  function controleerWoord(l) {
    if (woord.i >= woord.tekst.length || l !== doel()) return;
    woord.i++;
    hint.textContent = '';
    toonWoord();
    woordMelding.textContent = woord.i >= woord.tekst.length ? `Goed! Je hebt ${woord.tekst} geseind.` : `Goed! Nu de ${woord.tekst[woord.i]}.`;
  }
  function toonHint() {
    if (!woord || woord.i >= woord.tekst.length) return;
    const l = woord.tekst[woord.i];
    if (vreede) {
      const [r, k] = vreedeStand(l);
      hint.textContent = `${vreedeNaam(VREEDE[r][k])}: rechterarm in stand ${r} (${VREEDE_STANDEN[r]}), linkerarm in stand ${k} (${VREEDE_STANDEN[k]}).`;
    } else {
      const a = armen(SEMAFOOR[l]);
      hint.textContent = `${l}: één vlag ${inWoorden(a.links)}, de andere ${inWoorden(a.rechts)}.`;
    }
  }

  // -- Lees het teken
  const alleLetters = () => (vreede ? VREEDE.flat().filter((l) => l !== 'rust') : Object.keys(SEMAFOOR));
  function nieuweVraag(focus) {
    let letter;
    do letter = willekeurig(alleLetters()); while (letter === vraag?.letter);
    vraag = { letter, klaar: false };
    const [l, r] = vreede ? (() => { const [a, b] = vreedeStand(letter === 'IJ' ? 'I' : letter); return [VREEDE_HOEK.links[a], VREEDE_HOEK.rechts[b]]; })()
      : (() => { const a = armen(SEMAFOOR[letter]); return [a.links, a.rechts]; })();
    leesFiguur.innerHTML = pop({ links: l, rechts: r, soort: stelsel });
    const [sr, sl] = vreede ? vreedeStand(letter === 'IJ' ? 'I' : letter) : [];
    leesFiguur.setAttribute('aria-label', vreede ? `Een seiner: rechterarm ${VREEDE_STANDEN[sr]}, linkerarm ${VREEDE_STANDEN[sl]}. Welke letter?`
      : `Een seiner: vlaggen ${inWoorden(l)} en ${inWoorden(r)}. Welke letter?`);
    const anderen = alleLetters().filter((x) => x !== letter).sort(() => Math.random() - 0.5).slice(0, 3);
    const keus = [letter, ...anderen].sort(() => Math.random() - 0.5);
    opties.replaceChildren(...keus.map((x, i) => h('button.knop.sf-optie', { type: 'button', 'data-letter': x, 'aria-keyshortcuts': String(i + 1),
      onclick: (e) => kies(x, e.currentTarget) }, vreedeNaam(x))));
    leesMelding.textContent = '';
    leesMelding.classList.remove('fout');
    volgende.hidden = true;
    if (focus) opties.firstChild.focus();
  }
  function kies(x, knop) {
    if (vraag.klaar) return;
    vraag.klaar = true;
    gevraagd++;
    [...opties.children].find((k) => k.dataset.letter === vraag.letter).classList.add('goed');
    if (x === vraag.letter) { goed++; leesMelding.classList.remove('fout'); leesMelding.textContent = `Goed! Dit is de ${vreedeNaam(vraag.letter)}.`; }
    else { knop.classList.add('fout'); leesMelding.classList.add('fout'); leesMelding.textContent = `Niet goed: dit is de ${vreedeNaam(vraag.letter)}.`; }
    for (const k of opties.children) k.setAttribute('aria-disabled', 'true');
    score.textContent = `${goed} van ${gevraagd} goed.`;
    volgende.hidden = false;
    volgende.focus();
  }

  function zetModus(m) {
    modus = m;
    zelf.hidden = m === 'lezen';
    leesPaneel.hidden = m !== 'lezen';
    woordPaneel.hidden = m !== 'woord';
    if (m === 'woord' && !woord) nieuwWoord();
    if (m === 'lezen' && !vraag) nieuweVraag(false);
  }

  teken(false);
  zetModus(modus);
  return el;
}
