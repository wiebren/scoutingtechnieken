// Put up a dome tent: the steps in the right order. "Oefen" shuffles the steps and you tap the next one; a wrong
// one says why it cannot come yet. "Bekijk" goes through the steps on a stappenbalk (../stappen.js). The drawing
// follows the steps that are done, so the tent grows as you go. Facts: TKN §3.1 (tent opzetten), SN-K niveau 1.
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { s } from '../kompasdelen.js';
import { stappenBalk } from '../stappen.js';
import '../vorm.css';
import './kamp.css';

// rang: steps with the same rang may come in either order
// kort: the name under its dot on the stappenbalk of "Bekijk", with soft hyphens so a narrow column breaks it well
const STAPPEN = [
  { id: 'plek', kort: 'Plek', rang: 1, tekst: 'Kies een vlakke plek en haal stenen en takjes weg',
    waarom: 'Eerst de plek kiezen en schoonmaken: alles wat je daarna neerlegt, ligt er anders bovenop.' },
  { id: 'grondzeil', kort: 'Grond\u00adzeil', rang: 2, tekst: 'Leg het losse grondzeil neer (als je dat hebt)',
    waarom: 'Het grondzeil komt onder de tent. Leg het neer vóór de tent erop ligt.' },
  { id: 'binnen', kort: 'Binnen\u00adtent', rang: 3, tekst: 'Leg de binnentent erop, met de deur uit de wind',
    waarom: 'De binnentent komt op het grondzeil, en pas als hij goed ligt gaan de stokken erin.' },
  { id: 'stokken', kort: 'Stok\u00adken', rang: 4, tekst: 'Steek de stokken in elkaar en zet de tent ermee op',
    waarom: 'De stokken gaan in de binnentent. Die moet dan wel eerst liggen.' },
  { id: 'haringen', kort: 'Ha\u00adrin\u00adgen', rang: 4, tekst: 'Zet de hoeken vast met haringen',
    waarom: 'De haringen gaan door de hoeken van de binnentent. Die moet dan wel eerst liggen.' },
  { id: 'buiten', kort: 'Buiten\u00adtent', rang: 5, tekst: 'Gooi de buitentent eroverheen en maak hem vast',
    waarom: 'De buitentent gaat over de staande binnentent heen. Zet die eerst op en vast.' },
  { id: 'lijnen', kort: 'Scheer\u00adlijnen', rang: 6, tekst: 'Zet de scheerlijnen vast en span alles strak',
    waarom: 'De scheerlijnen zitten aan de buitentent. Die moet er dus eerst overheen.' },
];

const schud = (lijst) => {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [uit[i], uit[j]] = [uit[j], uit[i]]; }
  return uit;
};

/** The tent as far as it is: `klaar` is a Set of the step ids that are done. */
function tekening(klaar) {
  const g = s('g');
  g.append(s('rect', { x: 0, y: 150, width: 320, height: 40, class: 'kd-gras' }), s('path', { d: 'M0 150H320', class: 'kd-touw' }));
  if (!klaar.has('plek')) {
    for (const [x, r] of [[90, 5], [150, 4], [214, 6], [250, 3.5]]) g.append(s('circle', { cx: x, cy: 150 - r + 1, r, class: 'kd-steen' }));
    g.append(s('path', { d: 'M120 149l22 -5M186 149l18 -6', class: 'kd-dood' }));
  }
  if (klaar.has('grondzeil')) g.append(s('path', { d: 'M86 151H234', stroke: 'var(--blauw)', 'stroke-width': 5 }));
  const staat = klaar.has('stokken');
  if (klaar.has('binnen')) {
    g.append(staat
      ? s('path', { d: 'M92 150C96 80 224 80 228 150Z', fill: 'color-mix(in srgb, var(--inkt) 20%, var(--paneel))', stroke: 'var(--inkt)', 'stroke-width': 1.2 })
      : s('path', { d: 'M90 150Q160 138 230 150Z', fill: 'color-mix(in srgb, var(--inkt) 20%, var(--paneel))', stroke: 'var(--inkt)', 'stroke-width': 1.2 }));
    if (staat) g.append(s('path', { d: 'M92 150C100 70 220 70 228 150', fill: 'none', stroke: 'var(--accent)', 'stroke-width': 3, 'stroke-linecap': 'round' }));
  }
  if (klaar.has('haringen')) for (const x of [88, 232]) g.append(s('path', { d: `M${x} 144L${x + (x < 160 ? 3 : -3)} 160`, stroke: 'var(--inkt)', 'stroke-width': 3, 'stroke-linecap': 'round' }));
  if (klaar.has('buiten')) {
    g.append(s('path', { d: 'M76 150C80 56 240 56 244 150Z', class: 'kd-tent', opacity: 0.92 }));
    g.append(s('path', { d: 'M148 150V112Q160 98 172 112V150Z', fill: 'color-mix(in srgb, var(--inkt) 25%, var(--paneel))' }));
  }
  if (klaar.has('lijnen')) {
    for (const [x1, y1, x2] of [[96, 96, 30], [224, 96, 290]]) {
      g.append(s('path', { d: `M${x1} ${y1}L${x2} 152`, class: 'kd-touw' }),
        s('path', { d: `M${x2 + (x2 < 160 ? -4 : 4)} 146L${x2 + (x2 < 160 ? 3 : -3)} 160`, stroke: 'var(--inkt)', 'stroke-width': 3, 'stroke-linecap': 'round' }));
    }
  }
  return g;
}

export default function tentopzetten() {
  let modus = 'oefen';
  let klaar = new Set();          // oefen: the steps done
  let volgorde = [];              // oefen: in the order tapped
  let fouten = 0;
  let stand = 0;                  // bekijk: the step on the stappenbalk; that one and those before it are done

  const beeld = s('g');
  const svg = s('svg', { viewBox: '0 64 320 126', class: 'kd-svg', role: 'img' }, beeld);
  const vraag = h('p.kd-vraag');
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const gedaan = h('ol.kd-lijst');
  const keuzes = h('div.kd-keuzes');
  const opnieuw = h('button.knop.klein.hoofd', { type: 'button', hidden: true, onclick: () => begin() }, 'Nog een keer');
  const balk = stappenBalk({ stappen: STAPPEN.map((x) => x.kort), label: 'De tent opzetten, stap voor stap',
    zet: (w) => { stand = w; teken(); } });
  const bijschrift = h('p', { 'aria-live': 'polite' });
  const oefenVak = h('div.kd-tekst', vraag, keuzes, melding, gedaan, h('div.knop-rij', opnieuw));
  const bekijkVak = h('div.kd-tekst', { hidden: true }, bijschrift);
  const balkVak = h('div.kd-stappen', { hidden: true }, balk.el);
  const chips = keuze([['oefen', 'Zet in volgorde'], ['bekijk', 'Bekijk de stappen']], modus, (m) => { modus = m; begin(); });

  function teken() {
    if (modus === 'bekijk') {
      const tot = new Set(STAPPEN.slice(0, stand + 1).map((x) => x.id));
      beeld.replaceChildren(tekening(tot));
      bijschrift.textContent = `${stand + 1}. ${STAPPEN[stand].tekst}.`;
      svg.setAttribute('aria-label', `Tent na stap ${stand + 1} van ${STAPPEN.length}`);
      return;
    }
    beeld.replaceChildren(tekening(klaar));
    svg.setAttribute('aria-label', `De tent tot nu toe: ${klaar.size} van ${STAPPEN.length} stappen gedaan`);
    gedaan.replaceChildren(...volgorde.map((x) => h('li.goed', x.tekst)));
    const over = STAPPEN.filter((x) => !klaar.has(x.id));
    if (!over.length) {
      vraag.textContent = fouten ? `De tent staat! Met ${fouten} keer een verkeerde stap.` : 'De tent staat! Alles in één keer goed.';
      keuzes.replaceChildren();
      opnieuw.hidden = false;
      opnieuw.focus({ preventScroll: true });
      return;
    }
    vraag.textContent = klaar.size ? 'En dan?' : 'Wat doe je eerst?';
  }

  function kies(stap, knop) {
    const laagste = Math.min(...STAPPEN.filter((x) => !klaar.has(x.id)).map((x) => x.rang));
    if (stap.rang > laagste) {
      fouten++;
      melding.classList.add('fout');
      melding.textContent = `Nog niet. ${stap.waarom}`;
      knop.classList.add('kd-fout');
      setTimeout(() => knop.classList.remove('kd-fout'), 900);
      return;
    }
    klaar.add(stap.id);
    volgorde.push(stap);
    melding.classList.remove('fout');
    melding.textContent = `Goed: ${stap.tekst.toLowerCase()}.`;
    knop.remove();
    keuzes.querySelector('button')?.focus({ preventScroll: true });
    teken();
  }

  function begin() {
    oefenVak.hidden = modus !== 'oefen';
    bekijkVak.hidden = modus !== 'bekijk';
    balkVak.hidden = modus !== 'bekijk';
    klaar = new Set(); volgorde = []; fouten = 0; stand = 0; balk.zet(0);
    melding.textContent = ''; melding.classList.remove('fout');
    opnieuw.hidden = true;
    keuzes.replaceChildren(...schud(STAPPEN).map((stap) => {
      const knop = h('button.knop.klein', { type: 'button', onclick: () => kies(stap, knop) }, stap.tekst);
      return knop;
    }));
    teken();
  }

  begin();
  return h('div.kd.naast.doe-tentopzetten',
    h('div', svg),
    balkVak,
    h('div.kd-tekst.kd-rechts', h('div.chips', { role: 'group', 'aria-label': 'Kies wat je doet' }, chips), oefenVak, bekijkVak,
      h('p.kd-score', 'Zo gaat het bij een koepeltent met de binnentent eerst. Bij sommige tenten gaat de buitentent eerst: kijk ook in de handleiding van je eigen tent.')));
}
