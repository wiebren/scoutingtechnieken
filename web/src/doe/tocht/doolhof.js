// Doolhofroute: find the way through a maze from the entrance (bottom) to the exit (top), cell by cell. Once you are
// out, the way is pulled straight into a stripkaart: every side passage you passed becomes a dash, left or right,
// and a corner without a side passage disappears. That is exactly what a stripkaart is.
import { h } from '../../dom.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './doolhof.css';

const N = 7;                         // cells per side
const CEL = 40; const RAND = 10;
const STAP = { N: [0, -1], O: [1, 0], Z: [0, 1], W: [-1, 0] };
const TEGEN = { N: 'Z', Z: 'N', O: 'W', W: 'O' };
const VOLGORDE = ['N', 'O', 'Z', 'W'];       // clockwise
const sleutel = (x, y) => `${x},${y}`;

/** A maze by randomised Prim: lots of short side passages, as a stripkaart likes. open[key] = set of directions. */
function maakDoolhof() {
  const open = {};
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) open[sleutel(x, y)] = new Set();
  const binnen = new Set([sleutel(3, N - 1)]);
  const rand = [];
  const voegRand = (x, y) => { for (const r of VOLGORDE) { const [dx, dy] = STAP[r]; const nx = x + dx; const ny = y + dy; if (nx >= 0 && ny >= 0 && nx < N && ny < N && !binnen.has(sleutel(nx, ny))) rand.push([x, y, r]); } };
  voegRand(3, N - 1);
  while (rand.length) {
    const [x, y, r] = rand.splice(Math.floor(Math.random() * rand.length), 1)[0];
    const [dx, dy] = STAP[r]; const nx = x + dx; const ny = y + dy;
    if (binnen.has(sleutel(nx, ny))) continue;
    open[sleutel(x, y)].add(r); open[sleutel(nx, ny)].add(TEGEN[r]);
    binnen.add(sleutel(nx, ny)); voegRand(nx, ny);
  }
  const uitgang = Math.floor(Math.random() * N);
  open[sleutel(3, N - 1)].add('Z'); open[sleutel(uitgang, 0)].add('N');
  return { open, ingang: [3, N - 1], uitgang: [uitgang, 0] };
}

/** The way out (cells), found by a search; a perfect maze has only one. */
function oplossing({ open, ingang, uitgang }) {
  const vorige = { [sleutel(...ingang)]: null }; const rij = [ingang];
  while (rij.length) {
    const [x, y] = rij.shift();
    if (x === uitgang[0] && y === uitgang[1]) break;
    for (const r of open[sleutel(x, y)]) {
      const [dx, dy] = STAP[r]; const n = [x + dx, y + dy];
      if (n[0] < 0 || n[1] < 0 || n[0] >= N || n[1] >= N || sleutel(...n) in vorige) continue;
      vorige[sleutel(...n)] = [x, y]; rij.push(n);
    }
  }
  const pad = []; let c = uitgang;
  while (c) { pad.unshift(c); c = vorige[sleutel(...c)]; }
  return pad;
}

/** Walk the way and note at each cell the passages you leave: left of the one you take, or right of it. */
function naarStrip(doolhof, pad) {
  const stappen = [];
  const richting = (a, b) => VOLGORDE.find((r) => STAP[r][0] === b[0] - a[0] && STAP[r][1] === b[1] - a[1]);
  let koers = 'N';                                       // you walk in from the bottom
  pad.forEach((cel, i) => {
    const uit = i < pad.length - 1 ? richting(cel, pad[i + 1]) : 'N';
    const k = VOLGORDE.indexOf(koers);
    // the passages of this cell, from left to right as you walk: left, straight on, right
    const volgorde = [VOLGORDE[(k + 3) % 4], koers, VOLGORDE[(k + 1) % 4]];
    const deuren = volgorde.filter((r) => doolhof.open[sleutel(...cel)].has(r));
    const plek = deuren.indexOf(uit);
    const links = plek < 0 ? 0 : plek; const rechts = plek < 0 ? 0 : deuren.length - 1 - plek;
    if (links || rechts) stappen.push({ cel, links, rechts });
    koers = uit;
  });
  return stappen;
}

export default function doolhof() {
  let dh; let goed; let pad; let klaar;

  const muren = s('g', { class: 'dh-muren' });
  const spoor = s('path', { class: 'dh-spoor' });
  const nummers = s('g');
  const ik = s('circle', { r: 9, class: 'dh-ik' });
  const W = N * CEL + 2 * RAND;
  const svg = s('svg', { viewBox: `0 0 ${W} ${W + 14}`, class: 'dh-svg', tabindex: '0', role: 'application' }, muren, spoor, nummers, ik);
  const strip = s('svg', { class: 'dh-strip', role: 'img', viewBox: '0 0 120 300' });
  const stripVak = h('div.dh-stripvak', { hidden: true }, h('p.doe-stil', 'Rechtgetrokken: de stripkaart'), strip);
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const stand = h('p.doe-sr', { 'aria-live': 'polite' });
  const opnieuw = h('button.knop', { type: 'button', onclick: () => begin() }, 'Nieuw doolhof');
  const toon = h('button.knop', { type: 'button', onclick: () => { pad = [...goed]; teken(); uit(); } }, 'Toon de weg');

  const el = h('div.doe-doolhof',
    h('p.doe-stil', 'Zoek de weg van de ingang onderaan naar de uitgang bovenaan. Tik of sleep van vak naar vak, of gebruik de pijltjes. Terug kan ook.'),
    h('div.dh-vakken', h('div.dh-doolhof', svg), stripVak),
    melding, stand, h('div.knop-rij', toon, opnieuw));

  const midden = ([x, y]) => [RAND + x * CEL + CEL / 2, RAND + y * CEL + CEL / 2];

  function tekenMuren() {
    muren.replaceChildren();
    let d = '';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const o = dh.open[sleutel(x, y)]; const x0 = RAND + x * CEL; const y0 = RAND + y * CEL;
      if (!o.has('N')) d += `M${x0} ${y0}h${CEL}`;
      if (!o.has('W')) d += `M${x0} ${y0}v${CEL}`;
      if (y === N - 1 && !o.has('Z')) d += `M${x0} ${y0 + CEL}h${CEL}`;
      if (x === N - 1 && !o.has('O')) d += `M${x0 + CEL} ${y0}v${CEL}`;
    }
    muren.append(s('path', { d }));
    const [ix, iy] = midden(dh.ingang); const [ux, uy] = midden(dh.uitgang);
    muren.append(s('text', { x: ix, y: iy + CEL / 2 + 14, 'text-anchor': 'middle', class: 'dh-label' }, 'in'),
      s('text', { x: ux, y: uy - CEL / 2 - 1, 'text-anchor': 'middle', class: 'dh-label' }, 'uit'));
  }

  function teken() {
    spoor.setAttribute('d', `M${midden(dh.ingang)[0]} ${midden(dh.ingang)[1] + CEL / 2}L${pad.map((c) => midden(c).join(' ')).join('L')}${klaar ? `L${midden(dh.uitgang)[0]} ${RAND - 6}` : ''}`);
    const [x, y] = midden(pad.at(-1)); ik.setAttribute('cx', x); ik.setAttribute('cy', y);
  }

  function stap(r) {
    if (klaar) return;
    const cel = pad.at(-1);
    if (!dh.open[sleutel(...cel)].has(r)) { stand.textContent = 'Daar zit een muur.'; return; }
    const [dx, dy] = STAP[r]; const n = [cel[0] + dx, cel[1] + dy];
    if (n[1] < 0) { if (cel[0] === dh.uitgang[0]) uit(); return; }
    if (n[1] >= N) return;
    const vorige = pad.at(-2);
    if (vorige && vorige[0] === n[0] && vorige[1] === n[1]) pad.pop(); else pad.push(n);
    stand.textContent = `Vak ${n[0] + 1} van links, ${N - n[1]} van onder. Open: ${[...dh.open[sleutel(...n)]].map((d) => ({ N: 'boven', O: 'rechts', Z: 'onder', W: 'links' })[d]).join(', ')}.`;
    teken();
    if (n[0] === dh.uitgang[0] && n[1] === dh.uitgang[1]) uit();
  }

  function uit() {
    klaar = true; pad = [...goed]; teken();
    const stappen = naarStrip(dh, goed);
    // numbers in the maze where a dash comes from
    nummers.replaceChildren(...stappen.map(({ cel }, i) => { const [x, y] = midden(cel); return s('text', { x: x + 11, y: y - 8, class: 'dh-nr', 'text-anchor': 'middle' }, String(i + 1)); }));
    // the stripkaart, from the bottom up
    const hoog = 40 + (stappen.length + 1) * 34; const x = 60;
    strip.setAttribute('viewBox', `0 0 120 ${hoog}`);
    strip.replaceChildren(s('path', { d: `M${x} ${hoog - 16}V16`, class: 'dh-strip-lijn' }), s('circle', { cx: x, cy: hoog - 16, r: 5, class: 'dh-strip-stip' }), s('path', { d: `M${x - 30} 16H${x + 30}`, class: 'dh-strip-lijn' }));
    stappen.forEach(({ links, rechts }, i) => {
      const y = hoog - 16 - (i + 1) * 34;
      const kant = (n, z) => (n === 1 ? [`M${x} ${y}h${z * 18}`] : Array.from({ length: n }, (_, k) => `M${x} ${y}l${z * 18} ${(k - (n - 1) / 2) * 14}`));
      strip.append(s('path', { d: [...kant(links, -1), ...kant(rechts, 1)].join(''), class: 'dh-strip-lijn' }),
        s('text', { x: rechts ? x - 28 : x + 28, y: y + 4, class: 'dh-nr', 'text-anchor': 'middle' }, String(i + 1)));
    });
    const tekst = stappen.map((st, i) => `${i + 1}: ${[st.links && `${st.links} links`, st.rechts && `${st.rechts} rechts`].filter(Boolean).join(' en ')}`).join('; ');
    strip.setAttribute('aria-label', `Stripkaart van onder naar boven. Laten liggen: ${tekst}.`);
    stripVak.hidden = false;
    melding.textContent = `Uit het doolhof! Rechts zie je dezelfde weg als stripkaart: ${stappen.length} plekken met een zijgang. Een bocht zonder zijgang zie je niet meer.`;
    toon.disabled = true;
  }

  function begin() {
    dh = maakDoolhof(); goed = oplossing(dh); pad = [dh.ingang]; klaar = false;
    nummers.replaceChildren(); stripVak.hidden = true; toon.disabled = false; melding.textContent = '';
    svg.setAttribute('aria-label', `Doolhof van ${N} bij ${N} vakken. Je staat bij de ingang, onderaan in het midden. Gebruik de pijltjes.`);
    tekenMuren(); teken();
  }

  // tapping or dragging into a neighbouring cell
  let sleept = false;
  const celVan = (e) => {
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W; const y = ((e.clientY - r.top) / r.height) * (W + 14);
    return [Math.floor((x - RAND) / CEL), Math.floor((y - RAND) / CEL)];
  };
  const naar = (e) => {
    const [cx, cy] = celVan(e); const nu = pad.at(-1);
    const dx = cx - nu[0]; const dy = cy - nu[1];
    if (Math.abs(dx) + Math.abs(dy) !== 1) return;
    stap(VOLGORDE.find((r) => STAP[r][0] === dx && STAP[r][1] === dy));
  };
  svg.addEventListener('pointerdown', (e) => { sleept = true; svg.setPointerCapture(e.pointerId); naar(e); });
  svg.addEventListener('pointermove', (e) => { if (sleept) naar(e); });
  svg.addEventListener('pointerup', () => { sleept = false; });
  svg.addEventListener('pointercancel', () => { sleept = false; });
  svg.addEventListener('keydown', (e) => {
    const r = { ArrowUp: 'N', ArrowRight: 'O', ArrowDown: 'Z', ArrowLeft: 'W' }[e.key];
    if (!r) return;
    e.preventDefault(); stap(r);
  });

  begin();
  return el;
}
