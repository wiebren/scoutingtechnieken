// A wind rose to learn the points by: 8, 16 or 32 of them. "Bekijk" names them all, and a tap on one says it in full
// with its degrees. Then only N is named: "Wijs aan" asks for a name and you tap that point; "Benoem" lights a point
// up and you choose its name from four. Each answer shows its degrees. With
// 32 points a point is too small to hit, so a tap counts by its angle: the point nearest to it, and a finger can
// slide to another before it lets go.
import { h } from '../dom.js';
import { STREKEN } from '../plaatjes.js';
import './vorm.css';
import './windroos.css';

const NS = 'http://www.w3.org/2000/svg';
const C = 180;                                  // the middle of the rose, in the middle of the picture

const pol = (r, g) => [C + r * Math.sin((g * Math.PI) / 180), C - r * Math.cos((g * Math.PI) / 180)];
const p = (n) => Math.round(n * 10) / 10;
const graden = (g) => `${g.toLocaleString('nl-NL')}°`;                  // 202,5° and 11,25°, with a comma
const LANG = { N: 'noord', O: 'oost', Z: 'zuid', W: 'west' };
/** The name written out: ZZW is zuidzuidwest, NOtN noordoost ten noorden. */
const voluit = (naam) => {
  const [voor, na] = naam.split('t');
  return [...voor].map((l) => LANG[l]).join('') + (na ? ` ten ${LANG[na]}en` : '');
};
const schud = (lijst) => {
  for (let i = lijst.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [lijst[i], lijst[j]] = [lijst[j], lijst[i]]; }
  return lijst;
};

function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...kids.flat());
  return el;
}

export default function windroos({ n = 16 } = {}) {
  const stap = 360 / n;
  const punten = Array.from({ length: n }, (_, i) => ({ i, g: i * stap, naam: STREKEN[(i * 32) / n] }));
  let modus = 'bekijk';          // 'bekijk': all named; 'wijs': a name is asked, point at it; 'benoem': a point lights up, name it
  let vraag = null;              // the index of the point asked
  let antwoord = null;           // the index answered, null while asking
  let cursor = 0;                // the point under the finger, the mouse or the arrow keys
  let toonCursor = false;
  let goed = 0; let gevraagd = 0;

  // -- the picture: each point a kite of two halves, the main ones longest, with its name hidden until answered
  const roos = s('g');
  roos.append(s('circle', { cx: C, cy: C, r: 178, class: 'wr-grond' }), s('circle', { cx: C, cy: C, r: 138, class: 'wr-ring' }));
  const groepen = punten.map(({ g, naam }) => {
    const rang = g % 90 === 0 ? 0 : g % 45 === 0 ? 1 : g % 22.5 === 0 ? 2 : 3;
    const lengte = [132, 108, 88, 72][rang]; const breed = [12, 9, 6.5, 4.5][rang];
    const [px, py] = pol(lengte, g); const [lx, ly] = pol(breed, g - 90); const [rx, ry] = pol(breed, g + 90);
    const [t1x, t1y] = pol(138, g); const [t2x, t2y] = pol(rang < 2 ? 148 : 144, g);
    const [tx, ty] = pol(rang === 3 ? 158 : 162, g);
    const tekst = s('text', { x: p(tx), y: p(ty), class: `wr-naam${rang ? '' : ' hoofd'}`, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-size': [17, 14, 13, 11][rang] }, naam);
    return s('g', { class: `wr-punt${rang ? '' : ' hoofd'}${naam === 'N' ? ' noord' : ''}` },
      s('path', { d: `M${p(t1x)} ${p(t1y)}L${p(t2x)} ${p(t2y)}`, class: 'wr-streep' }),
      s('path', { d: `M${p(lx)} ${p(ly)}L${p(px)} ${p(py)}L${C} ${C}z`, class: 'wr-links' }),
      s('path', { d: `M${p(rx)} ${p(ry)}L${p(px)} ${p(py)}L${C} ${C}z`, class: 'wr-rechts' }),
      tekst);
  });
  roos.append(...groepen, s('circle', { cx: C, cy: C, r: 4, class: 'wr-as' }));
  const svg = s('svg', { viewBox: '0 0 360 360', class: 'wr-svg', role: 'img' }, roos);

  // -- the words beside it
  const chip = (wat, tekst) => h('button.chip', { type: 'button', 'aria-pressed': String(modus === wat), onclick: () => zetModus(wat) }, tekst);
  const MODI = ['bekijk', 'wijs', 'benoem'];
  const chips = [chip('bekijk', 'Bekijk'), chip('wijs', 'Wijs aan'), chip('benoem', 'Benoem')];
  const vraagRegel = h('p.wr-vraag', { 'aria-live': 'polite' });
  const keuzeVak = h('div.wr-keuzes');
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const stand = h('p.doe-sr', { 'aria-live': 'polite' });          // where the arrow keys point, for a screen reader
  const score = h('p.wr-score');
  const volgende = h('button.knop.klein.hoofd', { type: 'button', hidden: true, onclick: () => nieuweVraag() }, 'Volgende');

  const el = h('div.doe-windroos',
    h('div.wr-beeld', svg),
    h('div.wr-tekst',
      h('div.chips', { role: 'group', 'aria-label': 'Kies wat je oefent' }, chips),
      vraagRegel, keuzeVak, melding, stand, score,
      h('div.knop-rij', volgende)));

  // -- drawing
  function teken() {
    const klaar = antwoord != null;
    groepen.forEach((gr, i) => {
      gr.classList.toggle('kandidaat', (modus === 'bekijk' || (modus === 'wijs' && !klaar)) && toonCursor && i === cursor);
      gr.classList.toggle('licht', modus === 'benoem' && !klaar && i === vraag);
      gr.classList.toggle('goed', klaar && i === vraag);
      gr.classList.toggle('fout', klaar && i === antwoord && antwoord !== vraag);
      gr.classList.toggle('genoemd', modus === 'bekijk' || i === 0 || (klaar && (i === vraag || i === antwoord)));
    });
    score.replaceChildren(...(gevraagd ? [h('span', 'Goed: ', h('strong', `${goed} van ${gevraagd}`))] : []));
    svg.classList.toggle('wijzen', modus === 'wijs' && !klaar);
    svg.classList.toggle('bekijken', modus === 'bekijk');
  }

  /** In Bekijk: the point tapped or chosen with the arrows, in full and with its degrees. */
  function toon(i) {
    cursor = i; toonCursor = true;
    const v = punten[i];
    melding.textContent = `${v.naam}: ${voluit(v.naam)}, op ${graden(v.g)}.`;
    teken();
  }

  function zetModus(wat) {
    modus = wat;
    chips.forEach((c, k) => c.setAttribute('aria-pressed', String(MODI[k] === wat)));
    goed = 0; gevraagd = 0;
    if (wat === 'bekijk') bekijk(); else nieuweVraag();
  }

  function bekijk() {
    vraag = null; antwoord = null; toonCursor = false;
    melding.classList.remove('fout'); melding.textContent = ''; stand.textContent = '';
    volgende.hidden = true; keuzeVak.replaceChildren();
    vraagRegel.replaceChildren('Tik op een richting: dan zie je hoe hij voluit heet, en op hoeveel graden hij ligt.');
    svg.setAttribute('tabindex', '0');
    svg.setAttribute('aria-label', `Windroos met ${n} richtingen, met hun namen. Kies een richting met de pijltjes.`);
    teken();
  }

  function nieuweVraag() {
    // N is named on the rose, so it is never asked
    let i;
    do i = 1 + Math.floor(Math.random() * (n - 1)); while (i === vraag && n > 2);
    vraag = i; antwoord = null; toonCursor = false;
    const v = punten[vraag];
    melding.classList.remove('fout'); melding.textContent = ''; stand.textContent = '';
    volgende.hidden = true;
    if (modus === 'wijs') {
      vraagRegel.replaceChildren('Waar is ', h('strong', v.naam), '?');
      svg.setAttribute('tabindex', '0');
      svg.setAttribute('aria-label', `Windroos met ${n} richtingen, alleen N staat erbij. Tik de richting aan, of kies met de pijltjes en druk op Enter.`);
      keuzeVak.replaceChildren();
    } else {
      vraagRegel.replaceChildren('Welke richting licht op?');
      svg.removeAttribute('tabindex');
      svg.setAttribute('aria-label', `Windroos met ${n} richtingen. De richting die oplicht, staat op ${graden(v.g)}.`);
      // the wrong ones are close by: one, two or three points away, and never N, which is named on the rose
      const buren = [...new Set([1, -1, 2, -2, 3, -3].map((d) => (vraag + d + n) % n))].filter((j) => j !== vraag && j !== 0);
      const keuzes = schud([vraag, ...schud(buren).slice(0, 3)]);
      keuzeVak.replaceChildren(...keuzes.map((j) => h('button.knop.wr-keuze', { type: 'button', 'data-i': j, onclick: () => beantwoord(j) }, punten[j].naam)));
    }
    teken();
  }

  function beantwoord(i) {
    if (antwoord != null || vraag == null) return;
    antwoord = i; gevraagd++;
    const v = punten[vraag]; const a = punten[i];
    if (i === vraag) goed++;
    const juist = `${v.naam} (${voluit(v.naam)}) ligt op ${graden(v.g)}.`;
    melding.classList.toggle('fout', i !== vraag);
    melding.textContent = i === vraag ? `Goed! ${juist}`
      : `Niet goed: ${modus === 'wijs' ? 'je wees' : 'je koos'} ${a.naam}, en die ligt op ${graden(a.g)}. ${juist}`;
    for (const knop of keuzeVak.children) {
      const j = Number(knop.dataset.i);
      knop.disabled = true;
      knop.classList.toggle('goed', j === vraag);
      knop.classList.toggle('fout', j === i && i !== vraag);
      knop.append(h('span.wr-graden', graden(punten[j].g)));
    }
    stand.textContent = '';
    volgende.hidden = false;
    if (modus === 'benoem') volgende.focus();
    teken();
  }

  // -- pointing with a finger or the mouse: the point nearest to the angle, chosen when the finger lets go
  let sleept = false;
  const puntVan = (e) => {
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 360 - C; const y = ((e.clientY - r.top) / r.height) * 360 - C;
    const hoek = (Math.atan2(x, -y) * 180) / Math.PI;
    return { i: Math.round((((hoek % 360) + 360) % 360) / stap) % n, afstand: Math.hypot(x, y) };
  };
  const binnen = ({ afstand }) => afstand >= 14 && afstand <= 178;     // the very middle has no direction
  svg.addEventListener('pointerdown', (e) => {
    if (modus === 'bekijk') { const plek = puntVan(e); if (binnen(plek)) toon(plek.i); return; }
    if (modus !== 'wijs' || antwoord != null) return;
    const plek = puntVan(e);
    if (!binnen(plek)) return;
    sleept = true; cursor = plek.i; toonCursor = true;
    svg.setPointerCapture(e.pointerId);
    e.preventDefault();
    teken();
  });
  svg.addEventListener('pointermove', (e) => {
    if (modus !== 'wijs' || antwoord != null || (!sleept && e.pointerType !== 'mouse')) return;
    const plek = puntVan(e);
    if (!sleept && !binnen(plek)) { toonCursor = false; teken(); return; }
    if (binnen(plek)) cursor = plek.i;
    toonCursor = true;
    teken();
  });
  svg.addEventListener('pointerup', () => { if (sleept) { sleept = false; beantwoord(cursor); } });
  svg.addEventListener('pointercancel', () => { sleept = false; toonCursor = false; teken(); });
  svg.addEventListener('pointerleave', (e) => { if (!sleept && e.pointerType === 'mouse' && modus !== 'bekijk') { toonCursor = false; teken(); } });
  svg.addEventListener('keydown', (e) => {
    if (modus === 'bekijk') {
      const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
      if (d) { e.preventDefault(); toon(toonCursor ? (cursor + d + n) % n : 0); }
      return;
    }
    if (modus !== 'wijs') return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (antwoord != null) nieuweVraag();
      else if (toonCursor) beantwoord(cursor);
      return;
    }
    const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
    if (!d || antwoord != null) return;
    e.preventDefault();
    cursor = (cursor + d + n) % n;
    toonCursor = true;
    stand.textContent = `Aangewezen: ${graden(punten[cursor].g)}`;
    teken();
  });

  bekijk();
  return el;
}
