// A kaarthoekmeter on a real map: the Soester Duinen at 1:25.000 (the map of rdkaart.js). The card is the one of the
// drawing on the blad (../plaatjes/kaarthoekmeter.js), at the scale of the map: 1 mm on the card is 10 px of the
// image, so its 1:25.000 side is one km-square, 400 px. Pull it (or nudge it with the arrows) until the corner of
// the right scale lies on the red cross, read where the km-lines west and south of the cross cross the scales, and
// type the coordinate. The card stays square to the grid: for coordinates it never needs to turn.
import { BEELDEN, BRONNEN } from '../data/beelden.js';
import { h } from '../dom.js';
import { HOEK, kaartje } from '../plaatjes/kaarthoekmeter.js';
import { actie, acties } from './knoppen.js';
import './vorm.css';
import './kaarthoekmeter.css';

const NS = 'http://www.w3.org/2000/svg';
const KAARTBEELD = BEELDEN['top25-soester-duinen'];
const W = 800; const H = 560;                   // the image, in pixels
// The image covers RD x 148.300-150.300 and y 462.100-463.500, north up: 2,5 m a pixel (the notes, Beelden).
const LINKS = 148300; const BOVEN = 463500; const PX = 2.5;
const MM = 10;                                  // pixels a mm on the card: 1:25.000 is 25 m a mm
const STAP = 10;                                // metres: the cross lies on 10 m, as close as the card reads
const MARGE = 20;                               // metres off that still counts: between two ticks of 20 m
const VANG = 10;                                // pixels: this close to the cross, the corner drops onto it
const HOEKX = HOEK[25].x * MM; const HOEKY = HOEK[25].y * MM;   // the corner of the 1:25.000 scale on the card

const rd = (n) => n.toLocaleString('nl-NL');
const coordinaat = ({ x, y }) => `${rd(x)} – ${rd(y)}`;
const naarPx = ({ x, y }) => [(x - LINKS) / PX, (BOVEN - y) / PX];
const binnen = (n, min, max) => Math.min(Math.max(n, min), max);

function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...kids.flat());
  return el;
}

/** What was typed, in metres: 149.350, 149,35, 149350 and 149 (only the km-line) all work. NaN if it is no number. */
export function leesGetal(tekst) {
  const t = String(tekst).replace(/\s/g, '').replace(',', '.');
  if (/^\d+$/.test(t)) return Number(t) < 1000 ? Number(t) * 1000 : Number(t);
  if (/^\d{1,3}\.\d+$/.test(t)) return Math.round(Number(t) * 1000);           // in km
  return /^\d+\.\d+$/.test(t) ? Math.round(Number(t)) : NaN;                   // in metres
}

/** How one number of the answer went: { goed, tekst }. `as` is 'x' or 'y'. */
export function oordeel(echt, gegeven, as) {
  const km = Math.floor(echt / 1000); const m = echt - km * 1000;
  const waar = as === 'x' ? { lijn: 'links van', fout: 'rechts van', schaal: 'bovenste' } : { lijn: 'onder', fout: 'boven', schaal: 'rechter' };
  if (Number.isNaN(gegeven)) return { goed: false, tekst: `Bij ${as} staat geen getal dat ik kan lezen. Schrijf het zo: ${as === 'x' ? '149.350' : '463.120'}.` };
  if (Math.abs(gegeven - echt) <= MARGE) return { goed: true };
  const gkm = Math.floor(gegeven / 1000); const gm = gegeven - gkm * 1000;
  const bij = (n) => Math.abs(gm - n) <= MARGE;
  if (gkm === km + 1 && bij(m)) {
    return { goed: false, tekst: `Bij ${as} nam je lijn ${km + 1}: die ligt ${waar.fout} het kruisje. Neem de km-lijn ${waar.lijn} het kruisje, lijn ${km}.` };
  }
  if (gkm === km && bij(1000 - m)) {
    return { goed: false, tekst: `Bij ${as} mat je vanaf lijn ${km + 1}, ${waar.fout} het kruisje. Tel vanaf de km-lijn ${waar.lijn} het kruisje, lijn ${km}.` };
  }
  if (gkm === km && m > MARGE && bij(2 * m)) {
    return { goed: false, tekst: `Bij ${as} las je de binnenste hoek af, die van 1:50.000. Die schaal is half zo lang, dus je krijgt het dubbele. Deze kaart is 1:25.000: neem de buitenste hoek.` };
  }
  if (gkm === km) {
    const af = Math.abs(gm - m);
    const streep = Math.abs(af - 100) <= MARGE ? ' Dat is één genummerde streep: tel ze nog eens vanaf de hoek.' : ' Een genummerde streep is 100 m, een klein streepje 20 m.';
    return { goed: false, tekst: `Bij ${as} zat je er ${rd(af)} m naast.${streep}` };
  }
  return { goed: false, tekst: `Bij ${as} klopt de km-lijn niet: ${waar.lijn} het kruisje ligt lijn ${km}.` };
}

export default function kaarthoekmeter() {
  let doel = null;                              // the cross, in RD
  let hoek = [0, 0];                            // the corner of the 1:25.000 scale, in pixels of the image
  let klaar = false;                            // whether this cross has been judged
  let goed = 0; let gevraagd = 0;
  // on a phone the scale is small: show the part of the map around the cross larger (the same 10:7 shape)
  let groot = matchMedia('(max-width: 600px)').matches;
  let vak = { x: 0, y: 0, b: W, h: H };          // the part of the image the svg shows

  // -- the map, the card on it, and over both the cross, the readings and the numbers of the km-lines
  const kaartje = s('g', { class: 'kh-kaartje' });
  kaartje.innerHTML = kaartjeSvg();
  const kruis = s('g', { class: 'kh-kruis' });
  for (const k of ['halo', 'lijn']) kruis.append(s('circle', { r: 11, class: k }), s('path', { d: 'M-24 0H-6M6 0H24M0 -24V-6M0 6V24', class: k }));
  const lezing = s('g', { class: 'kh-lezing' });
  // the numbers of the km-lines, as at the edge of a real map; they stay at the edge of what is shown
  const randen = s('g', { class: 'kh-randen' });
  const randX = [[280, '149'], [680, '150']].map(([x, t]) => s('text', { x: x + 6, 'dominant-baseline': 'hanging' }, t));
  const rand463 = s('text', { y: 200, dy: -6 }, '463');
  randen.append(...randX, rand463);
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'kh-svg', role: 'img', tabindex: '0' },
    s('image', { href: KAARTBEELD.src, width: W, height: H, preserveAspectRatio: 'none' }), kaartje, kruis, lezing, randen);
  const beeld = h('div.kh-kaart', svg);

  // -- moving the card by hand: four buttons, for a finger that wants it precise
  const schuif = (dx, dy, wat) => h('button.knop.klein.kh-pijl', { type: 'button', 'aria-label': `Schuif de kaarthoekmeter ${wat}`,
    onclick: () => { zet([hoek[0] + dx, hoek[1] + dy], false); meldPlek(); } }, ({ links: '←', omhoog: '↑', omlaag: '↓', rechts: '→' })[wat]);
  const pijlen = h('div.kh-pijlen', { role: 'group', 'aria-label': 'Schuif de kaarthoekmeter 10 m' },
    schuif(-4, 0, 'links'), schuif(0, -4, 'omhoog'), schuif(0, 4, 'omlaag'), schuif(4, 0, 'rechts'));
  const plekTekst = h('p.doe-stil.kh-plek', { 'aria-live': 'polite' });
  const vergroot = h('button.chip', { type: 'button', 'aria-pressed': String(groot),
    onclick: () => { groot = !groot; vergroot.setAttribute('aria-pressed', String(groot)); kiesVak(); if (!klaar) { hoek = binnenVak(hoek); teken(); meldPlek(); } } }, 'Groter');

  // -- the answer
  const veld = (as, uitleg) => {
    const input = h('input.doe-veld.kh-getal', { type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false',
      placeholder: as === 'x' ? '149.350' : '463.120', onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); if (klaar) nieuwDoel(); else kijkNa(); } } });
    return [input, h('label.doe-label', h('span', h('strong', as), ` ${uitleg}`), input)];
  };
  const [xVeld, xLabel] = veld('x', '(eerst: naar rechts)');
  const [yVeld, yLabel] = veld('y', '(dan: omhoog)');
  const naKijken = actie('Kijk na', 'vink', () => kijkNa(), { hoofd: true, klein: true });
  const volgende = actie('Volgende', 'verder', () => nieuwDoel(), { hoofd: true, klein: true, hidden: true });
  const uitkomst = h('p.kh-uitkomst', { 'aria-live': 'polite' });
  const uitleg = h('p.kh-uitleg');
  const score = h('p.kh-score');

  const el = h('div.doe-kaarthoekmeter',
    h('p.kh-opdracht', 'Leg het hoekpunt van de buitenste schaal (1:25.000) op het rode kruisje: trek de kaarthoekmeter, of schuif hem met de pijltjes. Lees af waar de km-lijnen links van en onder het kruisje de schalen kruisen, en schrijf de coördinaat op.'),
    h('figure.kh-figuur', beeld, h('figcaption.kh-bron', BRONNEN.kadaster)),
    h('div.kh-onder', pijlen, vergroot, plekTekst),
    h('div.kh-velden', xLabel, yLabel),
    acties(naKijken, volgende),
    uitkomst, uitleg, score);

  // -- drawing
  /** The part of the map to show: all of it, or (groot) 480 × 336 px with the cross and the km-lines west and south of it. */
  function kiesVak() {
    if (!groot) vak = { x: 0, y: 0, b: W, h: H };
    else {
      const [dx, dy] = naarPx(doel);
      const [lx, ly] = naarPx({ x: Math.floor(doel.x / 1000) * 1000, y: Math.floor(doel.y / 1000) * 1000 });
      const b = 480; const hh = 336;
      vak = { x: binnen(Math.round((lx - 30 + dx + 50 - b) / 2), 0, W - b), y: binnen(Math.round((dy - 50 + ly + 40 - hh) / 2), 0, H - hh), b, h: hh };
    }
    svg.setAttribute('viewBox', `${vak.x} ${vak.y} ${vak.b} ${vak.h}`);
    for (const t of randX) t.setAttribute('y', vak.y + 6);
    rand463.setAttribute('x', vak.x + 6);
  }

  /** Where the card starts: its corner low on the right of what is shown, on 10 m; or p, if that is in view. */
  function binnenVak(p) {
    if (p && p[0] >= vak.x && p[0] <= vak.x + vak.b && p[1] >= vak.y && p[1] <= vak.y + vak.h) return p;
    return [4 * Math.round((vak.x + vak.b * 0.86) / 4), 4 * Math.round((vak.y + vak.h * 0.72) / 4)];
  }

  function teken() {
    kaartje.setAttribute('transform', `translate(${hoek[0] - HOEKX} ${hoek[1] - HOEKY})`);
    const [dx, dy] = naarPx(doel);
    kruis.setAttribute('transform', `translate(${dx} ${dy})`);
    lezing.replaceChildren();
    if (klaar) {
      // where the km-lines west and south of the cross cross the scales; the line south can lie under the map
      const [lx, ly] = naarPx({ x: Math.floor(doel.x / 1000) * 1000, y: Math.floor(doel.y / 1000) * 1000 });
      lezing.append(s('circle', { cx: lx, cy: dy, r: 15, class: 'kh-x' }), s('circle', { cx: dx, cy: ly, r: 15, class: 'kh-y' }));
    }
    score.replaceChildren(...(gevraagd ? [h('span', 'Goed: ', h('strong', `${goed} van ${gevraagd}`))] : []));
  }

  const opKruis = () => { const [dx, dy] = naarPx(doel); return hoek[0] === dx && hoek[1] === dy; };
  /** Put the corner at p (pixels), on the map; `vang` drops it onto the cross when it is close. */
  function zet(p, vang = true) {
    hoek = [binnen(Math.round(p[0]), 0, W), binnen(Math.round(p[1]), 0, H)];
    const [dx, dy] = naarPx(doel);
    if (vang && Math.hypot(hoek[0] - dx, hoek[1] - dy) <= VANG) hoek = [dx, dy];
    teken();
  }
  /** Say where the corner is, for whoever does not see it; after a move, not during a drag. */
  function meldPlek() {
    if (opKruis()) { plekTekst.textContent = 'Het hoekpunt ligt op het kruisje.'; return; }
    const [dx, dy] = naarPx(doel);
    const oost = Math.round((hoek[0] - dx) * PX); const noord = Math.round((dy - hoek[1]) * PX);
    plekTekst.textContent = `Het hoekpunt ligt ${[
      oost && `${rd(Math.abs(oost))} m ${oost > 0 ? 'rechts' : 'links'}`,
      noord && `${rd(Math.abs(noord))} m ${noord > 0 ? 'boven' : 'onder'}`].filter(Boolean).join(' en ')} het kruisje.`;
  }

  function nieuwDoel() {
    // a cross with a km-line west and south of it on the map: x right of line 149, y above line 463 (462 is off it)
    let px;
    do px = 292 + Math.floor(Math.random() * 118) * 4; while (Math.abs(px - 680) < 40);   // 4 px: on 10 m; not hard against line 150
    const py = 16 + Math.floor(Math.random() * 43) * 4;
    doel = { x: LINKS + px * PX, y: BOVEN - py * PX };
    klaar = false;
    for (const v of [xVeld, yVeld]) { v.value = ''; v.disabled = false; }
    naKijken.hidden = false; volgende.hidden = true;
    uitkomst.textContent = ''; uitkomst.className = 'kh-uitkomst';
    uitleg.textContent = 'De staande km-lijnen zijn 149 en 150, de liggende lijn bovenin is 463. Schrijf x en y in km met een punt, zoals 149.350.';
    svg.setAttribute('aria-label', `${KAARTBEELD.alt}, met een rood kruisje en een kaarthoekmeter. De pijltjes schuiven de kaarthoekmeter 10 m, met Shift 100 m.`);
    kiesVak();
    hoek = binnenVak();
    teken();
    meldPlek();
  }

  function kijkNa() {
    if (klaar) return;
    const gx = leesGetal(xVeld.value); const gy = leesGetal(yVeld.value);
    // an empty field is not a wrong answer yet (Enter in x would otherwise judge before y is typed): ask for it
    const leeg = [xVeld, yVeld].find((v) => !v.value.trim());
    if (leeg) {
      uitkomst.className = 'kh-uitkomst';
      uitkomst.textContent = leeg === yVeld && xVeld.value.trim() ? 'Schrijf nu ook y op.' : 'Schrijf eerst x en y op.';
      leeg.focus(); return;
    }
    klaar = true; gevraagd++;
    const ox = oordeel(doel.x, gx, 'x'); const oy = oordeel(doel.y, gy, 'y');
    const om = !ox.goed && !oy.goed && Math.abs(gx - doel.y) <= MARGE && Math.abs(gy - doel.x) <= MARGE;
    const lag = opKruis();
    if (ox.goed && oy.goed) goed++;
    uitkomst.className = `kh-uitkomst ${ox.goed && oy.goed ? 'goed' : 'fout'}`;
    uitkomst.textContent = ox.goed && oy.goed ? `Goed! Het kruisje staat op ${coordinaat(doel)}.`
      : om ? 'Je hebt x en y omgedraaid: eerst x (naar rechts), dan y (omhoog). In Nederland is x altijd het kleinste getal.'
        : [ox.tekst, oy.tekst].filter(Boolean).join(' ') + (lag ? '' : ' Leg het hoekpunt precies op het kruisje.');
    // lay the card right and show the reading
    hoek = naarPx(doel);
    const kmX = Math.floor(doel.x / 1000); const mX = doel.x - kmX * 1000;
    const kmY = Math.floor(doel.y / 1000); const mY = doel.y - kmY * 1000;
    uitleg.textContent = `Lijn ${kmX} kruist de bovenste schaal bij ${rd(mX / 10)}: ${mX} m. Lijn ${kmY} kruist de rechter schaal bij ${rd(mY / 10)}: ${mY} m. Samen: ${coordinaat(doel)}.`;
    for (const v of [xVeld, yVeld]) v.disabled = true;
    naKijken.hidden = true; volgende.hidden = false;
    teken();
    plekTekst.textContent = '';
    volgende.focus();
  }

  // -- pulling the card along: it follows the finger from where it was taken, not jumping to it
  let greep = null;
  const plek = (e) => { const r = svg.getBoundingClientRect(); return [vak.x + ((e.clientX - r.left) / r.width) * vak.b, vak.y + ((e.clientY - r.top) / r.height) * vak.h]; };
  svg.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    const [x, y] = plek(e);
    greep = { x, y, hoek };
    svg.setPointerCapture(e.pointerId);
    svg.classList.add('sleept');
    e.preventDefault();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!greep) return;
    const [x, y] = plek(e);
    zet([greep.hoek[0] + x - greep.x, greep.hoek[1] + y - greep.y]);
  });
  const los = () => { if (!greep) return; greep = null; svg.classList.remove('sleept'); meldPlek(); };
  svg.addEventListener('pointerup', los);
  svg.addEventListener('pointercancel', los);
  svg.addEventListener('keydown', (e) => {
    const r = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!r) return;
    e.preventDefault();
    const stap = e.shiftKey ? 40 : 4;
    zet([hoek[0] + r[0] * stap, hoek[1] + r[1] * stap], false);
    meldPlek();
  });

  nieuwDoel();
  return el;
}

/** The card at 10 px a mm, with its top left corner at 0,0: the group is moved by its corner. */
function kaartjeSvg() {
  return kaartje(MM, 0, 0, { fijn: true, doorzicht: 0.38 });
}
