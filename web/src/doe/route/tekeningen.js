// The notations drawn: every technique of notaties.js as SVG (or a list) in the colours of the theme, with the
// current junction marked when "waar ben ik" is on, and the key (sleutel) with small example drawings.
import { h } from '../../dom.js';
import { s, pol } from './svg.js';
import { TECHNIEKEN, tijdHoek, WEG_TELT } from './notaties.js';
import { SOORTEN } from './netwerk.js';

const p = (n) => Math.round(n * 10) / 10;
const lijn = (x1, y1, x2, y2, cls) => s('path', { d: `M${p(x1)} ${p(y1)}L${p(x2)} ${p(y2)}`, class: cls });

/** An arrow from (x1,y1) to (x2,y2) with a head. */
function pijl(x1, y1, x2, y2, cls, kop = 7) {
  const g = (Math.atan2(x2 - x1, -(y2 - y1)) * 180) / Math.PI;
  const [lx, ly] = pol(x2, y2, kop, g + 152); const [rx, ry] = pol(x2, y2, kop, g - 152);
  const [bx, by] = pol(x2, y2, kop * 0.75, g + 180);
  return s('g', { class: cls }, lijn(x1, y1, bx, by, 'rw-pijl-lijn'),
    s('path', { d: `M${p(x2)} ${p(y2)}L${p(lx)} ${p(ly)}L${p(rx)} ${p(ry)}z`, class: 'rw-pijl-kop' }));
}

/** A road on a junction drawing, in the style of its kind (see the legend). */
function weg(x1, y1, x2, y2, soort) {
  if (soort === 'verhard') return s('g', {}, lijn(x1, y1, x2, y2, 'rw-w-verhard-buiten'), lijn(x1, y1, x2, y2, 'rw-w-verhard-binnen'));
  return lijn(x1, y1, x2, y2, `rw-w-${soort}`);
}

/** A map sign for a landmark, around 0,0. */
export function bakenTeken(soort) {
  switch (soort) {
    case 'huis': return s('rect', { x: -4.5, y: -4.5, width: 9, height: 9, class: 'rw-kt-vol' });
    case 'kerk': return s('g', {}, s('circle', { cx: 0, cy: 1.5, r: 4.5, class: 'rw-kt-vol' }), lijn(0, -3, 0, -10, 'rw-kt-lijn'), lijn(-3, -7, 3, -7, 'rw-kt-lijn'));
    case 'boom': return s('g', {}, s('circle', { cx: 0, cy: 0, r: 5, class: 'rw-kt-open' }), s('circle', { cx: 0, cy: 0, r: 1.3, class: 'rw-kt-vol' }));
    case 'bankje': return s('g', {}, s('rect', { x: -6, y: -2.5, width: 12, height: 4, class: 'rw-kt-open' }), lijn(-4.5, 1.5, -4.5, 4.5, 'rw-kt-lijn'), lijn(4.5, 1.5, 4.5, 4.5, 'rw-kt-lijn'));
    case 'wegwijzer': return s('path', { d: 'M0 6V-1M0 -1L-5 -6M0 -1L5 -6', class: 'rw-kt-lijn' });
    case 'hek': return s('g', {}, lijn(-7, 0, 7, 0, 'rw-kt-lijn'), ...[-6, -2, 2, 6].map((x) => lijn(x, -3.5, x, 3.5, 'rw-kt-lijn')));
    default: return s('g');
  }
}
export const BAKEN_NAAM = { huis: 'huis', kerk: 'kerk', boom: 'boom (grote eik)', bankje: 'bankje', wegwijzer: 'wegwijzer', hek: 'hek' };

// -- one junction from above, you come in from below
function kruispunt(it, nr, { noord = false } = {}) {
  const c = 50; const cy = 54; const R = 44;
  const g = s('g');
  g.append(weg(c, 100, c, cy, it.inSoort));
  it.wegen.forEach((w) => { const [x, y] = pol(c, cy, R, w.draai); g.append(weg(c, cy, x, y, w.soort)); });
  if (it.baken) {
    const [bx, by] = pol(c, cy, 25, it.baken.draai);
    g.append(s('g', { transform: `translate(${p(bx)} ${p(by)})` }, bakenTeken(it.baken.soort)));
  }
  const keuze = it.wegen[it.pijl];
  const [x1, y1] = pol(c, cy, 6, keuze.draai); const [x2, y2] = pol(c, cy, 40, keuze.draai);
  g.append(pijl(x1, y1, x2, y2, noord ? 'rw-pijl dun' : 'rw-pijl', noord ? 7 : 9));
  if (noord) {
    // the north arrow: thick, in the corner, turned to where north is on this drawing
    g.append(s('g', { transform: `translate(84 16) rotate(${p(it.noord)})` },
      s('path', { d: 'M0 -12L6 4L0 1L-6 4z', class: 'rw-noord' }),
      s('text', { x: 0, y: 13, class: 'rw-noord-n', 'text-anchor': 'middle', transform: `rotate(${p(-it.noord)} 0 9)` }, 'N')));
  }
  g.append(s('text', { x: 6, y: 14, class: 'rw-nr' }, String(nr)));
  return s('svg', { viewBox: '0 0 100 100', class: 'rw-tegel-svg', 'aria-hidden': 'true' }, g);
}

function bolletje(it) {
  const c = 30; const g = s('g');
  it.draaien.forEach((d, i) => {
    if (i === it.pijl) return;
    const [x, y] = pol(c, c, 16, d); g.append(lijn(c, c, x, y, 'rw-stomp'));
  });
  const [x, y] = pol(c, c, 25, it.draaien[it.pijl]);
  g.append(pijl(c, c, x, y, 'rw-pijl inkt', 7), s('circle', { cx: c, cy: c, r: 5, class: 'rw-bol' }));
  return s('svg', { viewBox: '0 0 60 60', class: 'rw-bp-svg', 'aria-hidden': 'true' }, g);
}

// a bolletje with a stick in a wind direction: up is north
const STOK = { N: 0, O: 90, Z: 180, W: 270 };
function windBolletje(x, y, letter) {
  const [sx, sy] = pol(x, y, 11, STOK[letter]);
  return s('g', {}, lijn(x, y, sx, sy, 'rw-stok'), s('circle', { cx: x, cy: y, r: 4, class: 'rw-bol' }));
}
function windGroep(it) {
  const letters = [...it.streek];
  const breed = letters.length * 26 + it.streepjes * 9 + (it.laatste ? 22 : 0) + 12;
  const g = s('g');
  letters.forEach((l, i) => g.append(windBolletje(16 + i * 26, 22, l)));
  // the reading arrow under the bolletjes
  g.append(pijl(8, 44, 8 + letters.length * 26, 44, 'rw-pijl inkt leespijl', 5));
  const x0 = letters.length * 26 + 10;
  for (let i = 0; i < it.streepjes; i++) g.append(lijn(x0 + i * 9, 12, x0 + i * 9, 34, 'rw-streepje'));
  if (it.laatste) {
    const fx = x0 + it.streepjes * 9 + 6;
    g.append(lijn(fx, 36, fx, 8, 'rw-stok'), s('path', { d: `M${fx} 8l12 5l-12 5z`, class: 'rw-vlag' }));
  }
  return s('svg', { viewBox: `0 0 ${breed} 52`, width: breed, height: 52, class: 'rw-wr-svg', 'aria-hidden': 'true' }, g);
}

// -- stripkaart: from the bolletje at the bottom up to the long bar at the top
const STAP_Y = 34;
function tickHoeken(n, kant) {
  const reeks = { 1: [90], 2: [120, 60], 3: [130, 90, 50], 4: [135, 105, 75, 45], 5: [140, 115, 90, 65, 40] }[n] ?? [];
  return reeks.map((a) => (kant === 'links' ? -a : a));
}
function stripkaart(codes, hier, toon) {
  const K = codes.items.length; const H = K * STAP_Y + 64; const x = 60;
  const g = s('g');
  const yVan = (i) => H - 24 - (i + 1) * STAP_Y;
  g.append(lijn(x, H - 24, x, 18, 'rw-strip'), s('circle', { cx: x, cy: H - 24, r: 5.5, class: 'rw-bol' }), lijn(x - 28, 18, x + 28, 18, 'rw-strip'));
  codes.items.forEach((it, i) => {
    const y = yVan(i);
    const groep = s('g', { class: `rw-stap${toon && i === hier ? ' hier' : ''}${toon && i < hier ? ' gehad' : ''}` });
    if (toon && i === hier) groep.append(s('circle', { cx: x, cy: y, r: 9, class: 'rw-hier-ring' }));
    // the leftmost road is the most backward tick on the left, the rightmost the most backward on the right
    tickHoeken(it.links.length, 'links').forEach((a, j) => { const [ex, ey] = pol(x, y, 24, a); groep.append(lijn(x, y, ex, ey, `rw-tick${it.links[j].onverhard ? ' onverhard' : ''}`)); });
    tickHoeken(it.rechts.length, 'rechts').forEach((a, j) => { const [ex, ey] = pol(x, y, 24, a); groep.append(lijn(x, y, ex, ey, `rw-tick${it.rechts[it.rechts.length - 1 - j].onverhard ? ' onverhard' : ''}`)); });
    g.append(groep);
  });
  return s('svg', { viewBox: `0 0 120 ${H}`, class: 'rw-strip-svg', 'aria-hidden': 'true', style: `max-height:${H}px` }, g);
}

// -- ogen and smileys
function ogen(it, variant) {
  const g = s('g');
  const kijk = { links: [-4.5, 0], rechtdoor: [0, -5], rechts: [4.5, 0] }[it.kijk];
  if (variant === 'smiley') {
    g.append(s('circle', { cx: 32, cy: 30, r: 26, class: 'rw-gezicht' }),
      s('path', { d: 'M19 38q13 11 26 0', class: 'rw-mond' }));
    for (const [x, kant] of [[23, 'links'], [41, 'rechts']]) {
      if (it.kijk === kant) g.append(s('circle', { cx: x, cy: 23, r: 5.5, class: 'rw-oog-dicht' }));
      else g.append(s('circle', { cx: x, cy: 23, r: 5.5, class: 'rw-oog' }), s('circle', { cx: x, cy: 23, r: 2, class: 'rw-pupil' }));
    }
  } else {
    for (const x of [21, 43]) g.append(s('ellipse', { cx: x, cy: 30, rx: 9.5, ry: 12, class: 'rw-oog' }), s('circle', { cx: x + kijk[0], cy: 30 + kijk[1], r: 4.2, class: 'rw-pupil' }));
  }
  return s('svg', { viewBox: '0 0 64 60', class: 'rw-oog-svg', 'aria-hidden': 'true' }, g);
}

// -- a cord with beads or knots, from the loop at the top down
export function knoopTeken(soort) {
  switch (soort) {
    case 'paalsteek': return s('g', {}, s('ellipse', { cx: 9, cy: 2, rx: 9, ry: 6, class: 'rw-touw' }), s('circle', { cx: 0, cy: -3, r: 3.6, class: 'rw-knoop' }));
    case 'halve steek': return s('g', {}, s('path', { d: 'M0 -7C10 -7 10 5 0 5C-6 5 -6 -1 0 -1', class: 'rw-touw' }), s('circle', { cx: 0, cy: -1, r: 3, class: 'rw-knoop' }));
    case 'achtknoop': return s('g', {}, s('path', { d: 'M0 -9C9 -9 9 0 0 0C-9 0 -9 9 0 9C9 9 9 0 0 0C-9 0 -9 -9 0 -9', class: 'rw-touw' }));
    default: return s('g');
  }
}
function koord(codes, soort, hier, toon, woorden) {
  const K = codes.items.length; const dy = soort === 'kralen' ? 26 : 34; const H = 36 + K * dy + 16;
  const g = s('g');
  g.append(s('ellipse', { cx: 30, cy: 14, rx: 8, ry: 10, class: 'rw-touw' }), lijn(30, 24, 30, H - 6, 'rw-touw'));
  codes.items.forEach((it, i) => {
    const y = 36 + i * dy + dy / 2;
    const groep = s('g', { class: `rw-stap${toon && i === hier ? ' hier' : ''}${toon && i < hier ? ' gehad' : ''}` });
    if (toon && i === hier) groep.append(s('circle', { cx: 30, cy: y, r: 15, class: 'rw-hier-ring' }));
    if (soort === 'kralen') {
      groep.append(s('circle', { cx: 30, cy: y, r: 10, class: `rw-kraal ${it.kleur}` }));
      if (woorden) groep.append(s('text', { x: 48, y: y + 4, class: 'rw-klein' }, it.kleur));
    } else {
      groep.append(s('g', { transform: `translate(30 ${y})` }, knoopTeken(it.knoop)));
      if (woorden) groep.append(s('text', { x: 52, y: y + 4, class: 'rw-klein' }, it.knoop));
    }
    g.append(groep);
  });
  return s('svg', { viewBox: `0 0 ${woorden ? 130 : 60} ${H}`, class: 'rw-koord-svg', 'aria-hidden': 'true', style: `max-height:${H}px` }, g);
}

// -- a clock with the time on it
export function klok(hh, mm, { r = 18, noordHulp = false } = {}) {
  const c = r + 2; const g = s('g');
  g.append(s('circle', { cx: c, cy: c, r, class: 'rw-klok' }));
  for (let i = 0; i < 12; i++) { const [x1, y1] = pol(c, c, r - 1, i * 30); const [x2, y2] = pol(c, c, r - (i % 3 ? 3 : 5), i * 30); g.append(lijn(x1, y1, x2, y2, 'rw-klok-streep')); }
  const uur = ((hh % 12) * 30 + mm * 0.5); const min = mm * 6;
  const draai = noordHulp ? -uur : 0;              // turned so the small hand points up (north)
  const k = s('g', { transform: `rotate(${p(draai)} ${c} ${c})` });
  const [ux, uy] = pol(c, c, r * 0.5, uur); const [mx, my] = pol(c, c, r * 0.82, min);
  k.append(lijn(c, c, ux, uy, 'rw-wijzer-klein'), lijn(c, c, mx, my, 'rw-wijzer-groot'), s('circle', { cx: c, cy: c, r: 1.6, class: 'rw-bol' }));
  g.append(k);
  return s('svg', { viewBox: `0 0 ${2 * c} ${2 * c}`, width: 2 * c, height: 2 * c, class: 'rw-klok-svg', 'aria-hidden': 'true' }, g);
}

const stapKlas = (i, hier, toon) => `${toon && i === hier ? '.hier' : ''}${toon && i < hier ? '.gehad' : ''}`;

/**
 * The notation as an element. `hier`: the index of the current junction (or the route length when done); `toon`:
 * mark it. `variant`: 'smiley' for the ogenroute; `woorden`: write colours and knots in words.
 */
export function tekenNotatie(techniek, codes, { hier = 0, toon = false, variant = 'ogen', woorden = false } = {}) {
  const items = codes.items;
  const groep = toon ? codes.perStap[Math.min(hier, codes.perStap.length - 1)] : -1;
  const klaar = hier >= codes.perStap.length;
  const label = (tekst) => ({ role: 'img', 'aria-label': tekst });
  switch (techniek) {
    case 'kruispunten': case 'noordpijl':
      return h('ol.rw-tegels', items.map((it, i) => h(`li.rw-tegel${stapKlas(i, hier, toon)}`, label(`Kruispunt ${i + 1}`), kruispunt(it, i + 1, { noord: techniek === 'noordpijl' }))));
    case 'bolletje-pijltje':
      return h('ol.rw-bp', items.map((it, i) => h(`li.rw-bp-item${stapKlas(i, hier, toon)}`, label(`Teken ${i + 1}`), bolletje(it))));
    case 'windrichting':
      return h('ol.rw-wr', items.map((it, i) => h(`li.rw-wr-item${toon && i === groep && !klaar ? '.hier' : ''}${toon && (i < groep || klaar) ? '.gehad' : ''}`,
        label(`Aanwijzing ${i + 1}: ${it.streek}, ${it.streepjes} streepje${it.streepjes === 1 ? '' : 's'}${it.laatste ? ', dan de post' : ''}`), windGroep(it))));
    case 'stripkaart':
      return h('div.rw-strip', label(`Stripkaart met ${items.length} kruispunten`), stripkaart(codes, hier, toon));
    case 'ogen':
      return h('ol.rw-ogen', items.map((it, i) => h(`li.rw-oog-item${stapKlas(i, hier, toon)}`, label(`Gezichtje ${i + 1}`), ogen(it, variant), h('span.rw-nr-tekst', String(i + 1)))));
    case 'kralen': case 'knopen':
      return h('div.rw-koord', label(`Touw met ${items.length} ${techniek === 'kralen' ? 'kralen' : 'knopen'}`), koord(codes, techniek, hier, toon, woorden));
    case 'tijden':
      return h('ol.rw-tijden', items.map((it, i) => h(`li.rw-tijd${stapKlas(i, hier, toon)}`, h('span.rw-nr-tekst', `${i + 1}`), h('strong', it.tijd), klok(it.h, it.m))));
    case 'rll':
      return h('ol.rw-rll', items.map((it, i) => h(`li${stapKlas(i, hier, toon)}`, it.laten.flatMap((l, j) => [j ? ' · ' : '', `${l.naam} `, h('strong', l.kant)]))));
    case 'beschrijving':
      return h('div.rw-tekst', h('p', codes.intro, ' ', items.map((it, i) => [h(`span.rw-zin${stapKlas(i, hier, toon)}`, it.zin), ' ']), codes.slot));
    default: return h('p', '?');
  }
}

// -- the key: the rules in words and, where it helps, small drawings
function legendaLijnen() {
  return h('ul.rw-legenda', Object.entries(SOORTEN).map(([soort, d]) => h('li',
    s('svg', { viewBox: '0 0 40 12', width: 40, height: 12, 'aria-hidden': 'true' }, weg(2, 6, 38, 6, soort)), d.naam)));
}
function legendaBakens() {
  return h('ul.rw-legenda', Object.entries(BAKEN_NAAM).map(([soort, naam]) => h('li',
    s('svg', { viewBox: '-10 -11 20 20', width: 20, height: 20, 'aria-hidden': 'true' }, bakenTeken(soort)), naam)));
}
export function sleutel(techniek, variant) {
  const t = TECHNIEKEN[techniek];
  const regels = techniek === 'ogen' && variant === 'smiley' ? t.sleutelSmiley : t.sleutel;
  const extra = [];
  if (t.legenda?.includes('lijnen')) extra.push(legendaLijnen());
  if (t.legenda?.includes('bakens')) extra.push(legendaBakens());
  if (techniek === 'kralen') extra.push(h('ul.rw-legenda', [['lila', 'linksaf'], ['groen', 'rechtdoor'], ['rood', 'rechtsaf']].map(([k, b]) =>
    h('li', s('svg', { viewBox: '0 0 20 20', width: 20, height: 20, 'aria-hidden': 'true' }, s('circle', { cx: 10, cy: 10, r: 8, class: `rw-kraal ${k}` })), `${k}: ${b}`))));
  if (techniek === 'knopen') extra.push(h('ul.rw-legenda', [['paalsteek', 'linksaf'], ['halve steek', 'rechtdoor'], ['achtknoop', 'rechtsaf']].map(([k, b]) =>
    h('li', s('svg', { viewBox: '-14 -12 30 24', width: 30, height: 24, 'aria-hidden': 'true' }, knoopTeken(k)), `${k}: ${b}`))));
  if (techniek === 'tijden') extra.push(h('div.rw-klok-uitleg', klok(3, 0, { r: 22 }), h('span', '03:00 → kleine wijzer op noord →'), klok(3, 0, { r: 22, noordHulp: true }), h('span', 'grote wijzer wijst west')));
  if (techniek === 'ogen') {
    const voorbeelden = [['links', 'linksaf'], ['rechtdoor', 'rechtdoor'], ['rechts', 'rechtsaf']];
    extra.push(h('ul.rw-legenda', voorbeelden.map(([k, b]) => h('li', h('span.rw-mini-oog', ogen({ kijk: k }, variant)), b))));
  }
  return h('details.rw-sleutel', h('summary', 'Zo lees je het'), h('ul', [...regels, WEG_TELT].map((r) => h('li', r))), extra);
}
