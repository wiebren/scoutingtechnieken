// Semafoor (or the old Vreede-stelsel) with a figure whose arms you set yourself. Drag a hand round, tap where a
// flag should go, or use the buttons; the piece says what letter the arms make. Sein een woord: make the letters of
// a word one by one. Sein een bericht (semafoor only): the procedure of the blad semafoor-procedure. Lees het teken:
// the figure shows a letter and you pick which. As the reader sees it: the arm on your left is the seiner's right
// arm. Data and figure: ./lib/seinpop.js (NAV §4b; Vreede: reference/boeken).
import { h } from '../../dom.js';
import { WOORDEN, willekeurig } from '../codes.js';
import { actie, acties, keuze } from '../knoppen.js';
import {
  BREED, HOOG, SCHOUDERS, SEMAFOOR, SEMAFOOR_CIJFER, SEMAFOOR_TEKEN, VREEDE, VREEDE_HOEK, VREEDE_STANDEN,
  armen, inWoorden, pop, semafoorLetter, vreedeNaam, vreedeStand,
} from './lib/seinpop.js';
import '../vorm.css';
import './semafoor.css';

const NS = 'http://www.w3.org/2000/svg';
const SEMAFOOR_WOORDEN = WOORDEN;
const VREEDE_WOORDEN = WOORDEN.filter((w) => !w.includes('X'));

// -- Sein een bericht, as the blad semafoor-procedure teaches it (NAV §4b: TSA, IMP-Sein): ask for aandacht (wave
// both flags between schuin omhoog and schuin omlaag, that is between U and N), sein the words with rust between
// them, put right a mistake the piece plants (annuleren for one sign, eight times E for a whole word), then read the
// answer of the other one and say C: begrepen. A sign counts when the arms arrive at it, so the signs you pass on
// the way do no harm. No word starts with U or N (they would look like the waving) and no word has a letter twice
// in a row; a new word (`anders`) does not start with E.
const BERICHTEN = [
  { woorden: ['KOM', 'HIER'], anders: [1, 'SNEL'] },
  { woorden: ['BRUG', 'DICHT'], anders: [0, 'HEK'] },
  { woorden: ['WACHT', 'HIER'], anders: [0, 'BLIJF'] },
  { woorden: ['ETEN', 'OM', 'ZES'], anders: [2, 'ACHT'] },
];
const ANTWOORDEN = [['PRIMA'], ['GOED', 'ZO'], ['WE', 'KOMEN'], ['OK', 'DANK']];
const STAPPEN = ['Vraag aandacht', 'Sein het bericht, met rust tussen de woorden', 'Herstel de fout', 'Lees het antwoord', 'Sein C: begrepen'];
const STAP_NR = { aandacht: 0, seinen: 1, annuleer: 2, woordfout: 2, ontvangen: 3, lezen: 3, c: 4 };
const GOLVEN = 4;              // aandacht: arrive at U or N this many times (twice there and back)
const E_FOUT = 8;              // a whole word wrong: eight times E

/** A letter one arm off from `letter`: what the receiver reads when the wind pushes a flag aside. */
function verschoven(letter) {
  const a = armen(SEMAFOOR[letter]);
  const buren = [];
  for (const arm of ['links', 'rechts']) for (const d of [-45, 45]) {
    const b = { ...a, [arm]: (a[arm] + d + 360) % 360 };
    const l = semafoorLetter(b.links, b.rechts);
    if (l && l.length === 1 && l !== letter) buren.push(l);
  }
  return willekeurig(buren.length ? buren : Object.keys(SEMAFOOR).filter((x) => x !== letter));
}
const tekenStand = (s) => (s === 'rust' ? { links: 180, rechts: 180 } : armen(SEMAFOOR[s] ?? SEMAFOOR_TEKEN[s].vlaggen));

export default function semafoor({ stelsel = 'semafoor', modus: beginModus = 'seinen' } = {}) {
  const vreede = stelsel === 'vreede';
  let modus = beginModus;
  // semafoor: an angle per arm; vreede: a stand (0-4) per arm. links = the arm on your left.
  const stand = vreede ? { links: 0, rechts: 0 } : { links: 180, rechts: 180 };
  let woord = null;              // { tekst, i, vorig } in Sein een woord
  let bericht = null;            // Sein een bericht: see nieuwBericht()
  let berichtFout = Math.random() < 0.5 ? 'letter' : 'woord';   // the mistake to plant; takes turns
  let speelt = 0;                // the answer being played (a newer number stops an older one)
  let wachtTimer = 0;
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
    acties(
      actie('Hoe?', 'oog', () => toonHint(), { klein: true }),
      actie('Ander woord', 'opnieuw', () => nieuwWoord(), { klein: true })),
    h('div.sf-eigenrij', eigen, actie('Sein dit', 'start', () => nieuwWoord(eigen.value), { klein: true })));

  // -- Sein een bericht
  const stappenLijst = h('ol.sf-stappen', { 'aria-label': 'De stappen' });
  const briefje = h('div.sf-briefje', { 'aria-hidden': 'true' });
  const band = h('p.sf-band');
  const berichtMelding = h('p.doe-melding', { 'aria-live': 'polite' });
  const berichtHint = h('p.doe-stil');
  const anderFiguur = document.createElementNS(NS, 'svg');
  anderFiguur.setAttribute('viewBox', `0 0 ${BREED} ${HOOG}`);
  anderFiguur.setAttribute('class', 'sf-figuur sf-klein');
  anderFiguur.setAttribute('role', 'img');
  const anderTekst = h('p.doe-stil');
  const anderBand = h('p.sf-band');
  const ontvang = actie('Ontvang het antwoord', 'start', () => speelAntwoord(), { klein: true });
  const nogEens = actie('Nog eens', 'opnieuw', () => speelAntwoord(), { klein: true });
  const ander = h('div.sf-ander', anderFiguur, h('div.sf-paneel', h('p', h('b', 'De ander')), anderTekst, anderBand, acties(ontvang, nogEens)));
  const berichtPaneel = h('div.sf-paneel',
    stappenLijst,
    h('div', h('p.doe-stil', 'Jouw bericht:'), briefje),
    band, berichtMelding, berichtHint, ander,
    acties(
      actie('Hoe?', 'oog', () => toonBerichtHint(), { klein: true }),
      actie('Ander bericht', 'opnieuw', () => nieuwBericht(), { klein: true })));

  // -- Lees het teken
  const leesFiguur = document.createElementNS(NS, 'svg');
  leesFiguur.setAttribute('viewBox', `0 0 ${BREED} ${HOOG}`);
  leesFiguur.setAttribute('class', 'sf-figuur');
  leesFiguur.setAttribute('role', 'img');
  const opties = h('div.sf-opties', { role: 'group', 'aria-label': 'Welke letter is dit?' });
  const leesMelding = h('p.doe-melding', { 'aria-live': 'polite' });
  const score = h('p.doe-stil');
  const volgende = actie('Volgende', 'verder', () => nieuweVraag(true), { klein: true });
  const leesPaneel = h('div.sf-lees', leesFiguur,
    h('div.sf-paneel', h('p', 'Welke letter seint deze seiner?'), opties, acties(volgende), leesMelding, score));
  leesPaneel.addEventListener('keydown', (e) => {
    const k = Number(e.key);
    if (k >= 1 && k <= 4 && !vraag?.klaar) { e.preventDefault(); opties.children[k - 1]?.click(); }
  });

  const zelf = h('div.sf-zelf', h('div.sf-links', figuur, bediening), h('div.sf-paneel', uitkomst, standTekst, lezer, woordPaneel, berichtPaneel));
  const el = h('div.doe-semafoor',
    h('div.chips', { role: 'group', 'aria-label': 'Wat wil je doen?' },
      keuze([['seinen', 'Zelf seinen'], ['woord', 'Een woord'], ...(vreede ? [] : [['bericht', 'Een bericht']]), ['lezen', 'Aflezen']], modus, zetModus)),
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
    if (modus === 'bericht' && bericht) controleerBericht(l);
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
    woord = { tekst, i: 0, vorig: null };
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
  /**
   * A letter counts when the arms arrive at it, as in Sein een bericht: letting go of a drag, or a button that
   * changes nothing, is not a new sign. So a double letter (VUUR, KNOOP) is the same with the hand and with the
   * buttons: the arms go somewhere else and come back.
   */
  function controleerWoord(l) {
    if (l === woord.vorig) return;
    woord.vorig = l;
    if (woord.i >= woord.tekst.length || l !== doel()) return;
    woord.i++;
    hint.textContent = '';
    toonWoord();
    if (woord.i >= woord.tekst.length) { woordMelding.textContent = `Goed! Je hebt ${woord.tekst} geseind.`; return; }
    const volgend = woord.tekst[woord.i];
    woordMelding.textContent = doel() !== l ? `Goed! Nu de ${volgend}.`
      : vreede ? `Goed! Nu nog een ${volgend}: ga eerst terug naar rust, dan weer naar de ${volgend}.`
        : `Goed! Nu nog een ${volgend}: draai een arm even weg en weer terug, zodat de ontvanger twee tekens ziet.`;
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
    if (woord.i > 0 && woord.vorig === doel()) hint.textContent += vreede ? ' Je staat er al: ga eerst terug naar rust en dan weer hierheen.' : ' Je staat er al: draai een arm even weg en weer terug.';
  }

  // -- Sein een bericht
  function nieuwBericht() {
    speelt++;
    clearTimeout(wachtTimer);
    let keus;
    do keus = willekeurig(BERICHTEN); while (keus.woorden === bericht?.bron);
    const fout = berichtFout;
    berichtFout = fout === 'letter' ? 'woord' : 'letter';
    // the letter the wind blows aside: never the first of a word
    const w = Math.floor(Math.random() * keus.woorden.length);
    const i = 1 + Math.floor(Math.random() * (keus.woorden[w].length - 1));
    bericht = {
      bron: keus.woorden, woorden: [...keus.woorden], fout, anders: keus.anders, plek: [w, i], geplant: false, mis: null, oud: null,
      stap: 'aandacht', gedaan: new Set(), w: 0, i: 0, rust: false, golf: null, golven: 0, e: 0,
      band: [[]], antwoord: willekeurig(ANTWOORDEN), vorig: letterNu(),
    };
    anderFiguur.innerHTML = pop({ ...tekenStand('rust'), soort: 'semafoor' });
    anderFiguur.setAttribute('aria-label', 'De ander staat in rust.');
    anderTekst.textContent = '';
    meld(`Sein ${bericht.woorden.join(' ')}. Vraag eerst aandacht: zwaai beide vlaggen van schuin omhoog naar schuin omlaag en terug.`);
    toonBericht();
  }

  function meld(tekst, fout = false) {
    berichtMelding.textContent = tekst;
    berichtMelding.classList.toggle('fout', fout);
  }
  /** Say what step went wrong, but only when the arms stay on that sign: not for a sign passed on the way. */
  function waarschuw(tekst, l) {
    clearTimeout(wachtTimer);
    wachtTimer = setTimeout(() => { if (el.isConnected && modus === 'bericht' && bericht?.vorig === l) meld(tekst, true); }, 700);
  }

  function controleerBericht(l) {
    const b = bericht;
    if (l === b.vorig) return;
    b.vorig = l;
    clearTimeout(wachtTimer);
    if (!l) return;
    const doel = b.woorden[b.w][b.i];
    if (b.stap === 'aandacht') {
      if (l === 'U' || l === 'N') {
        if (l !== b.golf) { b.golf = l; b.golven++; }
        if (b.golven < GOLVEN) meld(`Zwaai door: nog ${GOLVEN - b.golven} keer.`);
        else { b.gedaan.add(0); b.stap = 'seinen'; meld(`Goed: de ontvanger kijkt naar je. Sein nu ${b.woorden[0]}. Begin met de ${doel}.`); }
      } else if (l === doel) waarschuw('Vraag eerst aandacht: zwaai beide vlaggen van schuin omhoog naar schuin omlaag en terug.', l);
    } else if (b.stap === 'seinen') {
      const nieuwWoord = b.i === 0 && b.w > 0 && !b.rust;
      if (l === 'rust' && nieuwWoord) { b.rust = true; b.band.push([]); meld(`Rust: de ontvanger weet dat het woord af is. Sein nu ${b.woorden[b.w]}.`); }
      else if (l === doel && nieuwWoord) waarschuw('Ga eerst naar rust: zo ziet de ontvanger dat er een nieuw woord komt.', l);
      else if (l === doel) neemLetter(l);
    } else if (b.stap === 'annuleer') {
      if (l === 'annuleren') { b.band.at(-1).pop(); b.stap = 'seinen'; b.gedaan.add(2); meld(`Goed: de ontvanger vergeet de ${b.mis}. Sein de ${doel} nog eens.`); }
      else if (l === doel) waarschuw(`Eerst annuleren: de ontvanger heeft de ${b.mis} nog staan.`, l);
      else if (l === 'E' && ++b.e >= 2) waarschuw('Acht keer E is voor een heel woord. Voor één fout teken sein je annuleren.', l);
    } else if (b.stap === 'woordfout') {
      if (l === 'E' && ++b.e < E_FOUT) meld(`E: ${b.e} van de ${E_FOUT}.`);
      else if (l === 'E') {
        b.band.pop();
        b.band.push([]);
        b.stap = 'seinen';
        b.gedaan.add(2);
        meld(`Goed: de ontvanger schrapt ${b.oud}. Sein nu ${b.woorden[b.w]}.`);
      } else if (l === 'annuleren') waarschuw('Annuleren haalt maar één teken weg. Het hele woord is fout: sein acht keer de E.', l);
      else if (l === doel) waarschuw(`Eerst acht keer de E (je hebt er ${b.e}). Dan weet de ontvanger dat het woord fout is.`, l);
    } else if (b.stap === 'ontvangen' || b.stap === 'lezen') {
      if (l === 'C') waarschuw(b.stap === 'lezen' ? 'Wacht tot het hele antwoord binnen is. Daarna sein je C.' : 'Ontvang eerst het antwoord van de ander. Daarna sein je C.', l);
    } else if (b.stap === 'c' && l === 'C') {
      b.gedaan.add(4);
      b.stap = 'klaar';
      meld(`Goed! De ander seinde ${b.antwoord.join(' ')}. Met C zeg je dat je het begrepen hebt. Het bericht is rond.`);
    }
    toonBericht();
  }

  /** The right letter: on the band it goes, unless this is where the piece plants a mistake. */
  function neemLetter(l) {
    const b = bericht;
    const woordNu = b.woorden[b.w];
    if (b.fout === 'letter' && !b.geplant && b.w === b.plek[0] && b.i === b.plek[1]) {
      b.geplant = true;
      b.mis = verschoven(l);
      b.band.at(-1).push({ l: b.mis, fout: true });
      b.stap = 'annuleer';
      b.e = 0;
      meld(`Oei, de wind blies je vlag opzij: de ontvanger las een ${b.mis} in plaats van een ${l}. Herstel dat ene teken.`, true);
      return;
    }
    b.band.at(-1).push({ l });
    b.i++;
    if (b.i < woordNu.length) { meld(`Goed! Nu de ${woordNu[b.i]}.`); return; }
    if (b.fout === 'woord' && !b.geplant && b.w === b.anders[0]) {
      b.geplant = true;
      b.oud = woordNu;
      b.woorden[b.w] = b.anders[1];
      b.i = 0;
      b.rust = true;
      for (const x of b.band.at(-1)) x.fout = true;
      b.stap = 'woordfout';
      b.e = 0;
      meld(`De leiding roept: niet ${woordNu}, maar ${b.anders[1]}! Dit hele woord is nu fout. Herstel het.`, true);
      return;
    }
    if (b.w < b.woorden.length - 1) { b.w++; b.i = 0; b.rust = false; meld(`Goed! Ga naar rust en sein dan ${b.woorden[b.w]}.`); return; }
    b.gedaan.add(1);
    b.stap = 'ontvangen';
    anderFiguur.innerHTML = pop({ ...tekenStand('C'), soort: 'semafoor' });
    anderFiguur.setAttribute('aria-label', 'De ander seint C.');
    anderTekst.textContent = 'Hij seint C: begrepen.';
    meld('Je bericht is over. De ontvanger seint C: hij heeft het begrepen. Nu seint hij jou een antwoord.');
    ander.hidden = false;          // before focus: a button in a hidden block takes no focus
    ontvang.hidden = false;
    ontvang.focus();
  }

  /** The other one asks for aandacht and signs his answer; at the end you say C. */
  function speelAntwoord() {
    const b = bericht;
    const nr = ++speelt;
    b.stap = 'lezen';
    const reeks = [];
    for (let k = 0; k < GOLVEN; k++) reeks.push(['aandacht', k % 2 ? 'N' : 'U']);
    b.antwoord.forEach((w, j) => { if (j) reeks.push(['tussen', 'rust']); for (const l of w) reeks.push(['letter', l]); });
    reeks.push(['einde', 'rust']);
    let k = 0;
    const volgende = () => {
      if (nr !== speelt || !el.isConnected) return;
      if (k >= reeks.length) {
        b.gedaan.add(3);
        b.stap = 'c';
        meld(letterNu() === 'C' ? 'Heb je het gelezen? Sein dan C: ga even naar rust en zet je vlaggen weer op C.' : 'Heb je het gelezen? Sein dan C: begrepen.');
        toonBericht();
        return;
      }
      const [fase, s] = reeks[k++];
      const a = tekenStand(s);
      anderFiguur.innerHTML = pop({ ...a, soort: 'semafoor' });
      anderFiguur.setAttribute('aria-label', s === 'rust' ? 'De ander staat in rust.' : `De ander: vlaggen ${inWoorden(a.links)} en ${inWoorden(a.rechts)}.`);
      anderTekst.textContent = { aandacht: 'Hij vraagt aandacht.', tussen: 'Rust: er komt een nieuw woord.', einde: 'Rust: klaar.', letter: 'Hij seint.' }[fase];
      setTimeout(volgende, fase === 'aandacht' ? 450 : s === 'rust' ? 900 : 1300);
    };
    meld('Kijk naar de ander. Hij vraagt eerst aandacht en seint dan zijn antwoord.');
    toonBericht();
    volgende();
  }

  function toonBericht() {
    const b = bericht;
    const nu = STAP_NR[b.stap];
    stappenLijst.replaceChildren(...STAPPEN.map((s, k) => h('li', { class: b.gedaan.has(k) ? 'klaar' : k === nu ? 'nu' : '', 'aria-current': k === nu ? 'step' : null }, s)));
    const verzonden = b.gedaan.has(1);
    briefje.replaceChildren(...b.woorden.map((w, j) => h('p.sf-woord', [...w].map((l, k) => h('span', {
      class: verzonden || j < b.w || (j === b.w && k < b.i) ? 'klaar' : (b.stap === 'seinen' || b.stap === 'annuleer') && j === b.w && k === b.i ? 'nu' : '' }, l)))));
    const gelezen = b.band.filter((w) => w.length);
    band.replaceChildren(h('span.doe-stil', 'De ontvanger leest: '),
      ...(gelezen.length ? gelezen.flatMap((w, j) => [j ? ' ' : '', ...w.map((x) => (x.fout ? h('span.sf-mis', x.l) : x.l))]) : [h('span.doe-stil', 'nog niets')]));
    ander.hidden = !verzonden;
    ontvang.hidden = b.stap !== 'ontvangen';
    nogEens.hidden = b.stap !== 'c';
    anderBand.textContent = b.stap === 'klaar' ? `Hij seinde: ${b.antwoord.join(' ')}` : '';
    if (berichtHint.dataset.stap !== b.stap) berichtHint.textContent = '';
  }

  function toonBerichtHint() {
    const b = bericht;
    if (!b) return;
    const vlaggen = (s) => { const a = tekenStand(s); return `één vlag ${inWoorden(a.links)}, de andere ${inWoorden(a.rechts)}`; };
    const doel = b.woorden[b.w]?.[b.i];
    berichtHint.dataset.stap = b.stap;
    berichtHint.textContent = {
      aandacht: `Zwaai van U (${vlaggen('U')}) naar N (${vlaggen('N')}) en terug, twee keer.`,
      seinen: b.i === 0 && b.w > 0 && !b.rust ? 'Rust: beide vlaggen omlaag, gekruist voor je benen. Gebruik de knop Rust.' : `${doel}: ${vlaggen(doel)}.`,
      annuleer: `Annuleren: ${vlaggen('annuleren')}. Daarna sein je de ${doel} nog eens.`,
      woordfout: `E: ${vlaggen('E')}. Draai een arm even weg en weer terug, tot je acht keer E hebt geseind. Daarna sein je ${b.woorden[b.w]}.`,
      ontvangen: 'Druk op Ontvang het antwoord en kijk naar de ander.',
      lezen: 'Kijk naar de ander. Na het zwaaien komen de letters; bij rust begint een nieuw woord.',
      c: `C: ${vlaggen('C')}.`,
      klaar: 'Klaar! Kies Ander bericht om nog eens te oefenen.',
    }[b.stap];
  }

  // -- Lees het teken
  const alleLetters =() => (vreede ? VREEDE.flat().filter((l) => l !== 'rust') : Object.keys(SEMAFOOR));
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
    berichtPaneel.hidden = m !== 'bericht';
    if (m !== 'bericht') { speelt++; clearTimeout(wachtTimer); }
    if (m === 'woord' && !woord) nieuwWoord();
    if (m === 'bericht' && !bericht) nieuwBericht();
    else if (m === 'bericht') { bericht.vorig = letterNu(); if (bericht.stap === 'lezen') speelAntwoord(); }
    if (m === 'lezen' && !vraag) nieuweVraag(false);
  }

  teken(false);
  zetModus(modus);
  return el;
}
