// RD coordinates on a real map: the Soester Duinen at 1:25.000 (the same sample as the bladen show). "Waar ben ik?"
// puts a cross where you tap and reads its coordinate, the way the blad does: first the house in (to the right from
// the km-line), then the stairs up. "Zoek het punt" gives a coordinate to find, and says how far off a tap was.
import { BEELDEN, BRONNEN } from '../data/beelden.js';
import { h } from '../dom.js';
import './rdkaart.css';

const NS = 'http://www.w3.org/2000/svg';
const KAART = BEELDEN['top25-soester-duinen'];
const W = 800; const H = 560;                   // the image, in pixels
// The image covers RD x 148.300-150.300 and y 462.100-463.500, north up: 2,5 m a pixel (the notes, Beelden).
const LINKS = 148300; const BOVEN = 463500; const PX = 2.5;
const STAP = 10;                                // metres: as close as a kaarthoekmeter reads
const GOED = 50;                                // metres off that still counts as found

const rd = (n) => n.toLocaleString('nl-NL');                            // 149.350, as the blad writes it
const coordinaat = ({ x, y }) => `${rd(x)} – ${rd(y)}`;
const meters = (m) => (m < 1000 ? `${rd(m)} m` : `${(m / 1000).toLocaleString('nl-NL', { maximumFractionDigits: 2 })} km`);
const rond = (m) => Math.round(m / STAP) * STAP;
const binnen = (n, min, max) => Math.min(Math.max(n, min), max);
/** A spot on the map as an RD coordinate, rounded to 10 m and kept on the map. */
const naarRd = (px, py) => ({ x: binnen(rond(LINKS + px * PX), LINKS, LINKS + W * PX), y: binnen(rond(BOVEN - py * PX), BOVEN - H * PX, BOVEN) });
const naarPx = ({ x, y }) => [(x - LINKS) / PX, (BOVEN - y) / PX];

function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...kids.flat());
  return el;
}

export default function rdkaart() {
  let modus = 'waar';            // 'waar': tap and read the coordinate; 'zoek': find the coordinate asked
  let plek = { x: 149300, y: 462800 };          // the cross, in RD; it starts in the middle
  let doel = null;               // the coordinate to find
  let klaar = false;             // whether the tap for this doel has been judged
  let goed = 0; let gevraagd = 0;

  // -- the map with a drawing over it, in the pixels of the image
  const randen = s('g', { class: 'rk-randen' });
  // the numbers of the km-lines, as at the edge of a real map: x = 149 and 150 stand, y = 463 lies
  for (const [x, t] of [[280, '149'], [680, '150']]) randen.append(s('text', { x, y: 6, 'dominant-baseline': 'hanging', 'text-anchor': 'middle' }, t));
  randen.append(s('text', { x: 6, y: 200, dy: -6 }, '463'));
  const trap = s('g', { class: 'rk-trap' });
  const juist = s('g', { class: 'rk-juist' });
  const kruis = s('g', { class: 'rk-kruis' });
  for (const k of ['halo', 'lijn']) {
    kruis.append(s('circle', { r: 13, class: k }), s('path', { d: 'M-26 0H-7M7 0H26M0 -26V-7M0 7V26', class: k }));
  }
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'rk-svg', role: 'img', tabindex: '0' }, randen, trap, juist, kruis);
  const beeld = h('div.rk-kaart',
    h('img', { src: KAART.src, alt: KAART.alt, width: W, height: H, draggable: 'false', decoding: 'async' }), svg);

  // -- the words under it
  const chip = (wat, tekst) => h('button.chip', { type: 'button', 'aria-pressed': String(modus === wat), onclick: () => zetModus(wat) }, tekst);
  const chips = [chip('waar', 'Waar ben ik?'), chip('zoek', 'Zoek het punt')];
  const opdracht = h('p.rk-opdracht');
  const uitkomst = h('p.rk-uitkomst', { 'aria-live': 'polite' });
  const uitleg = h('p.rk-uitleg');
  const score = h('p.rk-score');
  const volgende = h('button.knop.klein.hoofd', { type: 'button', hidden: true, onclick: () => nieuwDoel() }, 'Volgende');

  const el = h('div.doe-rdkaart',
    h('div.chips', { role: 'group', 'aria-label': 'Kies wat je oefent' }, chips),
    opdracht,
    h('figure.rk-figuur', beeld, h('figcaption.rk-bron', BRONNEN.kadaster)),
    uitkomst, uitleg, score,
    h('div.knop-rij', volgende));

  // -- drawing
  function teken() {
    const [px, py] = naarPx(plek);
    kruis.setAttribute('transform', `translate(${px} ${py})`);
    kruis.classList.toggle('stil', modus === 'zoek' && klaar);

    // first along the km-line below to the right, from the km-line on the left; then up. Lines off the map still
    // count: the km-line 462 lies under its bottom edge.
    trap.replaceChildren();
    if (modus === 'waar') {
      const [kx, ky] = naarPx({ x: Math.floor(plek.x / 1000) * 1000, y: Math.floor(plek.y / 1000) * 1000 });
      trap.append(s('path', { d: `M${kx} ${ky}H${px}`, class: 'rk-huisje' }), s('path', { d: `M${px} ${ky}V${py}`, class: 'rk-trapje' }));
    }

    juist.classList.toggle('toon', modus === 'zoek' && klaar);
    if (modus === 'zoek' && doel) {
      const [dx, dy] = naarPx(doel);
      juist.replaceChildren(
        s('path', { d: `M${px} ${py}L${dx} ${dy}`, class: 'rk-mis' }),
        s('circle', { cx: dx, cy: dy, r: GOED / PX, class: 'rk-zone' }),
        s('circle', { cx: dx, cy: dy, r: 5, class: 'rk-stip' }));
    }

    score.replaceChildren(...(modus === 'zoek' && gevraagd ? [h('span', 'Gevonden: ', h('strong', `${goed} van ${gevraagd}`))] : []));
    if (modus === 'waar') {
      const kmX = Math.floor(plek.x / 1000); const kmY = Math.floor(plek.y / 1000);
      uitkomst.replaceChildren('Het kruisje staat op ', h('strong', coordinaat(plek)), '.');
      uitleg.textContent = `In het vakje ${kmX} – ${kmY}: ${rd(plek.x - kmX * 1000)} m rechts van lijn ${kmX} en ${rd(plek.y - kmY * 1000)} m boven lijn ${kmY}.`;
    }
  }

  function zetModus(wat) {
    modus = wat;
    chips.forEach((c, k) => c.setAttribute('aria-pressed', String(['waar', 'zoek'][k] === wat)));
    if (wat === 'waar') {
      doel = null; klaar = false; volgende.hidden = true;
      opdracht.textContent = 'Tik op de kaart, of schuif het kruisje met de pijltjes (met Shift 100 m).';
      svg.setAttribute('aria-label', 'Kaart van de Soester Duinen met een kruisje. De pijltjes schuiven het kruisje 10 m, met Shift 100 m.');
      teken();
    } else {
      goed = 0; gevraagd = 0;
      nieuwDoel();
    }
  }

  function nieuwDoel() {
    // somewhere on the map, not right at its edge
    doel = naarRd(40 + Math.random() * (W - 80), 40 + Math.random() * (H - 80));
    klaar = false;
    volgende.hidden = true;
    opdracht.replaceChildren('Zoek ', h('strong', coordinaat(doel)), ' op de kaart en tik erop.');
    svg.setAttribute('aria-label', `Kaart van de Soester Duinen. Zoek ${coordinaat(doel)}: schuif het kruisje met de pijltjes, 10 m per stap of met Shift 100 m, en druk op Enter.`);
    uitkomst.textContent = '';
    uitleg.textContent = 'Tip: de staande lijnen zijn x = 149 en 150 km, de liggende lijn bovenin y = 463 km. De liggende lijn onderin is geen km-lijn: daar grenzen de kaartbladen 32 A en 32 C aan elkaar.';
    uitkomst.className = 'rk-uitkomst';
    teken();
  }

  function beoordeel() {
    if (modus !== 'zoek' || klaar) return;
    klaar = true; gevraagd++;
    const dx = doel.x - plek.x; const dy = doel.y - plek.y;
    const af = rond(Math.hypot(dx, dy));
    const gevonden = af <= GOED;
    if (gevonden) goed++;
    uitkomst.className = `rk-uitkomst ${gevonden ? 'goed' : 'fout'}`;
    uitkomst.textContent = gevonden ? (af ? `Goed! Je zat er ${meters(af)} naast.` : 'Goed! Precies raak.')
      : `Je zat er ${meters(af)} naast. Het punt ligt ${[
        dx && `${meters(Math.abs(dx))} naar het ${dx > 0 ? 'oosten' : 'westen'}`,
        dy && `${meters(Math.abs(dy))} naar het ${dy > 0 ? 'noorden' : 'zuiden'}`].filter(Boolean).join(' en ')}.`;
    uitleg.textContent = `Jij koos ${coordinaat(plek)}. Het groene rondje is ${GOED} m om het punt heen: daarbinnen telt het als gevonden.`;
    volgende.hidden = false;
    teken();
  }

  // -- tapping, and pulling the cross along; in Zoek it counts when the finger lets go
  let sleept = false;
  const zet = (e) => {
    const r = svg.getBoundingClientRect();
    plek = naarRd(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H);
    teken();
  };
  svg.addEventListener('pointerdown', (e) => {
    if (modus === 'zoek' && klaar) return;
    sleept = true;
    svg.setPointerCapture(e.pointerId);
    e.preventDefault();
    zet(e);
  });
  svg.addEventListener('pointermove', (e) => { if (sleept) zet(e); });
  svg.addEventListener('pointerup', () => { if (sleept) { sleept = false; beoordeel(); } });
  svg.addEventListener('pointercancel', () => { sleept = false; });
  svg.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (modus !== 'zoek') return;
      e.preventDefault();
      if (klaar) nieuwDoel(); else beoordeel();
      return;
    }
    const r = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (!r || (modus === 'zoek' && klaar)) return;
    e.preventDefault();
    const stap = e.shiftKey ? 100 : STAP;
    const [px, py] = naarPx({ x: plek.x + r[0] * stap, y: plek.y + r[1] * stap });
    plek = naarRd(px, py);
    teken();
  });

  zetModus('waar');
  return el;
}
