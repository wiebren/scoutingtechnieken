// The seinvlaggen of the Internationaal Seinboek to learn (./lib/vlaggen.js, from the sister project vlet). Welke
// letter: a flag and four letters to pick from. Wat betekent hij: a flag and four meanings. Welk cijfer: a
// cijferwimpel (or the onderscheidingswimpel) and four names, or a name and four wimpels. Spel een woord: your word
// or number as a hoist of flags, top down; a flag that comes again takes a vervangwimpel, because each flag is on
// board only once (the rule of Pub. 102, ch. 1 sec. 5 §6: see hijsVan).
import { h } from '../../dom.js';
import { kaal, willekeurig } from '../codes.js';
import { actie, acties, keuze } from '../knoppen.js';
import { CIJFERWIMPELS, LETTERVLAG, LETTERVLAGGEN, OVERIGE_WIMPELS, breedte, vlag } from './lib/vlaggen.js';
import '../vorm.css';
import './seinvlaggen.css';

const svgVan = (o, hoog, label) => {
  const w = breedte(o, hoog);
  return `<svg viewBox="-1 -1 ${w + 2} ${hoog + 2}" width="${w + 2}" height="${hoog + 2}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${vlag(o, 0, 0, hoog)}</svg>`;
};
// the quiz on meanings leaves out R: on its own it has no meaning
const MET_BETEKENIS = LETTERVLAGGEN.filter((v) => !['R'].includes(v.id));

/** What a cijferwimpel looks like, from the mast outwards (the designs in ./lib/vlaggen.js). */
const CIJFER_ZIET = {
  1: 'wit met een rode bol', 2: 'blauw met een witte bol', 3: 'rood, wit en blauw naast elkaar', 4: 'rood met een wit kruis',
  5: 'geel en blauw naast elkaar', 6: 'zwart boven, wit onder', 7: 'geel boven, rood onder', 8: 'wit met een rood kruis',
  9: 'verdeeld in vier vlakken: wit en zwart boven, rood en geel onder', 0: 'geel, rood en geel naast elkaar',
};
const OW = OVERIGE_WIMPELS.find((w) => w.id === 'ow');
// the ten cijferwimpels and the onderscheidingswimpel, for Welk cijfer?
const WIMPELS = [
  ...CIJFERWIMPELS.map((c) => ({ id: c.id, ontwerp: c.ontwerp, naam: `Cijfer ${c.id}`, ziet: CIJFER_ZIET[c.id] })),
  { id: 'ow', ontwerp: OW.ontwerp, naam: 'Onderscheidings\u00ADwimpel', ziet: 'rood en wit, vijf banen naast elkaar' },
];
const CIJFERWIMPEL = Object.fromEntries(CIJFERWIMPELS.map((c) => [c.id, c]));

/**
 * The hoist for a word or number: each sign with the flag it takes. Pub. 102 (ch. 1 sec. 5 §6): a substitute
 * repeats the first, second or third flag, counting from the top, of the class (letters or numerals) right above
 * it, and each substitute may be used only once in a group. "1100" is 1, first substitute, 0, third substitute. A
 * sign that comes again and cannot be substituted that way gets teVer: you need a second set of flags.
 */
export function hijsVan(tekens) {
  const uit = [];
  const aanBoord = new Set();     // flags on the line already
  const vervangers = new Set();   // substitutes used
  let soort = null;
  let reeks = [];                 // the signs of the class right above, from the top
  for (const t of tekens) {
    const s = /\d/.test(t) ? 'cijfer' : 'letter';
    if (s !== soort) { soort = s; reeks = []; }
    let item = { t, soort };
    if (aanBoord.has(t)) {
      const p = reeks.findIndex((x) => x.t === t && x.vervang === undefined);
      if (p >= 0 && p < 3 && !vervangers.has(p)) { vervangers.add(p); item = { t, soort, vervang: p }; }
      else item.teVer = true;
    } else aanBoord.add(t);
    reeks.push(item);
    uit.push(item);
  }
  return uit;
}
const RANG = ['eerste', 'tweede', 'derde'];

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
  const volgende = actie('Volgende', 'verder', () => nieuweVraag(true), { klein: true });
  const quiz = h('div.sv-quiz', plaat, h('div.sv-paneel', vraagTekst, opties, acties(volgende), melding, score));
  quiz.addEventListener('keydown', (e) => {
    const k = Number(e.key);
    if (k >= 1 && k <= 4 && !vraag?.klaar) { e.preventDefault(); opties.children[k - 1]?.click(); }
  });

  function nieuweVraag(focus) {
    if (modus === 'cijfer') { nieuweWimpelVraag(focus); return; }
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

  /** Welk cijfer: a wimpel and four names, or (zoek) a name and four wimpels. */
  function nieuweWimpelVraag(focus) {
    let v;
    do v = willekeurig(WIMPELS); while (v === vraag?.v);
    const zoek = Math.random() < 0.5;
    vraag = { v, klaar: false };
    const naam = (x) => (x.id === 'ow' ? 'de onderscheidingswimpel' : `het cijfer ${x.id}`);
    if (zoek) {
      plaat.replaceChildren(h('span.sv-groot', { class: v.id === 'ow' ? 'lang' : '' }, v.id === 'ow' ? 'Onderscheidings\u00ADwimpel' : v.id));
      vraagTekst.textContent = `Welke wimpel is ${naam(v)}?`;
    } else {
      plaat.innerHTML = svgVan(v.ontwerp, 70, `Een wimpel: ${v.ziet}`);
      vraagTekst.textContent = 'Welke wimpel is dit?';
    }
    const anderen = WIMPELS.filter((x) => x !== v).sort(() => Math.random() - 0.5).slice(0, 3);
    const keus = [v, ...anderen].sort(() => Math.random() - 0.5);
    opties.setAttribute('aria-label', vraagTekst.textContent);
    opties.className = zoek ? 'sv-opties wimpels' : 'sv-opties';
    opties.replaceChildren(...keus.map((x, i) => h('button.knop.sv-optie', { type: 'button', 'data-id': x.id, 'aria-keyshortcuts': String(i + 1),
      onclick: (e) => kies(x, e.currentTarget) }, zoek ? h('span', { html: svgVan(x.ontwerp, 30, x.ziet) }) : x.naam)));
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
    const uitleg = modus !== 'cijfer' ? `Vlag ${v.id} (${v.spelwoord}), ${v.ziet}: ${v.betekenis.charAt(0).toLowerCase()}${v.betekenis.slice(1)}`
      : v.id === 'ow' ? `De onderscheidingswimpel is ${v.ziet}. Halverwege de lijn zegt hij ‘ik zie je sein’, helemaal boven ‘ik heb het begrepen’.`
        : `De cijferwimpel ${v.id} is ${v.ziet}.`;
    if (x === v) { goed++; melding.classList.remove('fout'); melding.textContent = `Goed! ${uitleg}`; }
    else { knop.classList.add('fout'); melding.classList.add('fout'); melding.textContent = `Niet goed. ${uitleg}`; }
    for (const k of opties.children) k.setAttribute('aria-disabled', 'true');
    score.textContent = `${goed} van ${gevraagd} goed.`;
    volgende.hidden = false;
    volgende.focus();
  }

  // -- Spel een woord
  const invoer = h('input.doe-veld', { type: 'text', value: 'Scouting', maxlength: 14, autocomplete: 'off', spellcheck: 'false', oninput: () => spel() });
  const voorbeeld = (tekst) => h('button.chip', { type: 'button', onclick: () => { invoer.value = tekst; spel(); } }, tekst);
  const hijs = h('ol.sv-hijs');
  const spelUitleg = h('p.doe-stil', { 'aria-live': 'polite' });
  const spellen = h('div.sv-paneel',
    h('label.doe-label', 'Typ een woord of een getal', invoer),
    h('div.chips', { role: 'group', 'aria-label': 'Voorbeelden' }, voorbeeld('Banaan'), voorbeeld('1100'), voorbeeld('L2330')),
    h('p.doe-stil', 'Zo hangen de vlaggen onder elkaar aan de lijn, de eerste bovenaan.'),
    hijs, spelUitleg);

  function spel() {
    const tekens = [...kaal(invoer.value).replace(/[^A-Z0-9]/g, '')].slice(0, 14);
    const lijst = hijsVan(tekens);
    hijs.replaceChildren(...lijst.map(({ t, soort, vervang, teVer }) => {
      if (vervang !== undefined) {
        const w = OVERIGE_WIMPELS[vervang];
        const wat = soort === 'cijfer' ? 'cijferwimpel' : 'lettervlag';
        return h('li', { html: svgVan(w.ontwerp, 34, `${w.naam}: herhaalt de ${RANG[vervang]} ${wat} van boven, de ${t}`) }, h('span', `${t}: ${w.naam.toLowerCase()}`));
      }
      const extra = teVer ? ' (tweede set)' : '';
      if (soort === 'cijfer') return h('li', { html: svgVan(CIJFERWIMPEL[t].ontwerp, 34, `Cijferwimpel ${t}${extra}`) }, h('span', `${t}: cijferwimpel${extra}`));
      return h('li', { html: svgVan(LETTERVLAG[t].ontwerp, 34, `Vlag ${t}, ${LETTERVLAG[t].spelwoord}${extra}`) }, h('span', `${t} ${LETTERVLAG[t].spelwoord}${extra}`));
    }));
    hijs.setAttribute('aria-label', `De vlaggen voor ${tekens.join('')}`);
    spelUitleg.textContent = [
      lijst.some((x) => x.vervang !== undefined) && 'Aan boord heb je van elke vlag er maar één. Komt een letter of cijfer terug, dan hang je een vervangwimpel. Die herhaalt een vlag uit het rijtje letters of cijfers direct erboven: de eerste vervangwimpel de bovenste van dat rijtje, de tweede de tweede, de derde de derde. Elke vervangwimpel mag maar één keer in een sein.',
      lijst.some((x) => x.teVer) && 'Komt een teken terug dat je niet zo kunt vervangen, dan heb je een tweede set vlaggen nodig.',
    ].filter(Boolean).join(' ');
  }

  const el = h('div.doe-seinvlaggen',
    h('div.chips', { role: 'group', 'aria-label': 'Wat wil je doen?' },
      keuze([['letter', 'Welke letter?'], ['betekenis', 'Wat betekent hij?'], ['cijfer', 'Welk cijfer?'], ['spellen', 'Woord spellen']], modus, zetModus)),
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

