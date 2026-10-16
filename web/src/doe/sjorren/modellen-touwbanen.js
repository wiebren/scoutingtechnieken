// The 3D models of the touwbanen (bladen in ../../data/bladen/sjorren-touwbanen.js), in the same shape as ./modellen.js
// and built with its helpers. Merged into the models in ./modellen-alle.js; a name here replaces one in ./modellen.js.
//
// `apenbrug` is replaced: Dutch sources call two ropes above each other an apenbrug (Scoutpedia Touwbrug, Indianenbrug;
// SGV), so this one has a looptouw and a handtouw. The old three-rope model is the `vtouwbrug` (Scoutpedia's
// "V-vormige touwbrug"). Sizes and choices: scratchpad/bouwwerken-extra.md §1 and
// notities/technieken/sjorren-uitwerking.md, section "Touwbanen (ronde 2)".
//
// `bouwer`, `bokVorm` and `opHoogte` are copies of the private helpers of ./modellen.js (it exports only the vector
// helpers, the sizes and SOORTEN); keep them the same.
import { MODELLEN, DIK, MIDDEL, DUN, plus, min, keer, lengte, eenheid } from './modellen.js';

const RAD = Math.PI / 180;

/** Collects the parts of a model; `stap()` sets the step (and the end step) for what comes next. */
function bouwer() {
  const m = { palen: [], sjor: [], lijnen: [], haringen: [], dingen: [], stappen: [] };
  let nu = { stap: 1, tot: null, kopie: false };
  const b = {
    m,
    stap(naam, tekst, { tot = null, kopie = false } = {}) {
      m.stappen.push({ naam, tekst });
      nu = { stap: m.stappen.length, tot, kopie };
    },
    paal(a, bb, d, rol = '') { m.palen.push({ a, b: bb, d, rol, ...nu }); return m.palen.length - 1; },
    paalL(a, r, L, d, rol) { return b.paal(a, plus(a, keer(eenheid(r), L)), d, rol); },
    sjor(soort, palen, extra = {}) { m.sjor.push({ soort, palen, ...nu, ...extra }); return m.sjor.length - 1; },
    lijn(punten, soort = 'tui', extra = {}) { m.lijnen.push({ punten, soort, ...nu, ...extra }); },
    haring(p, weg, extra = {}) {
      const w = eenheid([weg[0], 0, weg[2]]);
      const kop = plus(p, plus(keer(w, 0.1), [0, 0.32, 0]));
      m.haringen.push({ p, kop, ...nu, ...extra });
      return kop;
    },
    ding(soort, extra) { m.dingen.push({ soort, ...nu, ...extra }); return m.dingen.length - 1; },
    anker(p, richting, rijen = [1, 2, 3]) {
      const r = eenheid([richting[0], 0, richting[2]]); const zij = [-r[2], 0, r[0]];
      let vorige = []; let eerste = null;
      rijen.forEach((n, i) => {
        const rij = [];
        for (let j = 0; j < n; j++) {
          const q = plus(plus(p, keer(r, i * 0.75)), keer(zij, (j - (n - 1) / 2) * 0.32));
          const kop = b.haring(q, r, { soort: rijen.length > 1 ? 'anker' : 'haring' });
          rij.push({ q, kop });
        }
        if (!eerste) eerste = rij[0].kop;
        for (const v of vorige) {
          const doel = rij.reduce((x, y) => (lengte(min(y.q, v.q)) < lengte(min(x.q, v.q)) ? y : x));
          b.sjor('slinger', [], { van: v.kop, naar: plus(doel.q, [0, 0.04, 0]) });
        }
        vorige = rij;
      });
      return eerste;
    },
  };
  return b;
}

/** The two legs of an A (a bok), as in ./modellen.js: feet at m ± breed·half, crossing at kruisY, legs of length L. */
function bokVorm(m, breed, half, kruisY, L, d) {
  const r = d / 2; const diep = [-breed[2], 0, breed[0]];
  const C = plus(m, [0, kruisY, 0]);
  const poten = [-1, 1].map((s) => {
    const voet = plus(m, keer(breed, s * half));
    const doel = plus(C, keer(diep, s * r));
    return { a: voet, b: plus(voet, keer(eenheid(min(doel, voet)), L)) };
  });
  const vorkY = (rb) => C[1] + ((r + rb) * 1.15 * kruisY) / half;
  return { poten, C, diep, vorkY };
}

/** A point on pole (a, b) at height y. */
const opHoogte = (p, y) => { const r = eenheid(min(p.b, p.a)); return plus(p.a, keer(r, (y - p.a[1]) / r[1])); };

// -- shared pieces of the touwbanen

/** A rope from a to e that hangs `zak` in the middle. */
function hangt(a, e, zak, n = 12) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n; const p = plus(a, keer(min(e, a), t));
    p[1] -= zak * Math.sin(Math.PI * t);
    pts.push(p);
  }
  return pts;
}

/** Two trees at x = ±X (radius r), and where a rope at height y touches each, on the side of the other tree. */
function tweeBomen(b, X, r = 0.3, hoog = 8) {
  const bomen = [-1, 1].map((s) => ({ s, c: [s * X, 0, 0], r }));
  for (const t of bomen) b.ding('boom', { p: t.c, r, hoog });
  const raak = (t, y, z = 0) => [t.c[0] - t.s * Math.sqrt(Math.max(0, r * r - z * z)), y, z];
  return { bomen, raak };
}

/** A rope round a tree at height y (a rondtorn with two halve steken), with jute under it. */
function aanBoom(b, t, y, naam, { jute = true } = {}) {
  if (jute) b.ding('jute', { p: [t.c[0], y, t.c[2]], r: t.r, hoog: 0.3 });
  b.sjor('boom', [], { p: [t.c[0], y, t.c[2]], boom: { r: t.r + 0.012, c: t.c }, naam });
}

/**
 * A vierloper between a tree and a rope at height y: a sling with a karabiner round the tree, a block on it, a
 * second block 1,3 m along the rope towards the middle, four parts between them and the haalkant to the ground.
 */
function vierloper(b, t, y) {
  b.ding('sling', { p: [t.c[0], y, t.c[2]], r: t.r });
  const x1 = t.c[0] - t.s * (t.r + 0.14); const x2 = x1 - t.s * 1.3;
  b.ding('katrol', { p: [x1, y + 0.08, 0.06] });
  b.ding('katrol', { p: [x2, y + 0.08, 0.06] });
  // one rope: from the hondsend at the first block, four parts between the blocks, then the haalkant to the ground
  const yv = y + 0.08; const z = 0.06;
  b.lijn([[x1, yv - 0.03, z], [x2, yv - 0.03, z], [x2, yv - 0.01, z], [x1, yv - 0.01, z], [x1, yv + 0.01, z], [x2, yv + 0.01, z],
    [x2, yv + 0.03, z], [x1, yv + 0.03, z], [x1 - t.s * 0.5, 0.9, 0.7], [x1 - t.s * 0.9, 0.05, 1.0]], 'vierloper', { dik: 0.004, naam: 'vier parten en de haalkant' });
  b.lijn([[x2, yv - 0.04, z], [x2, y + 0.01, 0.02]], 'lijn', { dik: 0.005 });
}

/** The same rope run over a stretch of water: a strip of water between x0 and x1. */
const water = (b, x0, x1) => b.ding('water', { x0, x1 });

// ---------------------------------------------------------------------------------------------------------------
// The models

/**
 * Apenbrug: a looptouw and a handtouw above it. Between two trees, the handtouw tensioned with a vierloper (insigne
 * Pionieren N3), or free-standing on two X-pijlers: the looptouw over a ligger low down, the handtouw in the crossing
 * (Scoutpedia Indianenbrug, "Vrijstaand").
 */
function apenbrug(variant = 'bomen') {
  const b = bouwer(); const { m } = b;
  water(b, -2.2, 2.2);
  if (variant === 'pijlers') {
    const X = 4; const L = 3; const d = MIDDEL; const kY = 2.1;
    b.stap('Palen', 'Zet aan elke kant van het water twee palen van 3 m als een grote X, dwars op de brug. Ze kruisen op zo’n 2,1 m.');
    const kruizen = [-1, 1].map((s) => {
      const x = s * X; const C = [x, kY, 0];
      const poten = [-1, 1].map((k) => {
        const voet = [x, 0, -k * 0.8];
        return b.paalL(voet, min(plus(C, [k * d / 2, 0, 0]), voet), L, d, 'poot');
      });
      return { s, x, C, poten };
    });
    b.stap('Kruising', 'Sjor elke X waar de palen kruisen met een diagonaalsjorring. In die kruising komt straks het handtouw te liggen.');
    for (const k of kruizen) b.sjor('diagonaal', k.poten, { naam: 'de kruising van de X' });
    b.stap('Ligger', 'Sjor op zo’n 90 cm een ligger van 2 m over beide poten, aan de kant van het anker (kruissjorringen). Over de ligger loopt het looptouw.');
    const yL = 0.9;
    for (const k of kruizen) {
      const buiten = k.x + k.s * (d / 2) * (yL / kY);
      const c = [buiten + k.s * (d / 2 + d / 2 + 0.004), yL, 0];
      k.ligger = c;
      const balk = b.paal(plus(c, [0, 0, -1]), plus(c, [0, 0, 1]), d, 'ligger');
      for (const p of k.poten) b.sjor('kruis', [p, balk], { naam: 'ligger aan poot' });
    }
    b.stap('Ankers', 'Zet achter elke X, zo’n 3 m verder, een anker van haringen in serie (1-2-3) met slingersjorringen.');
    const ank = kruizen.map((k) => b.anker([k.x + k.s * 3, 0, 0], [k.s, 0, 0], [1, 2, 3]));
    b.stap('Looptouw', 'Leg het looptouw van anker naar anker over de twee liggers. Zet het aan het ene anker vast en span het aan het andere met een spanknoop: strak, maar niet snaarstrak.');
    const yl = yL + d / 2 + 0.012;
    const lA = [kruizen[0].ligger[0], yl, 0]; const lB = [kruizen[1].ligger[0], yl, 0];
    b.lijn([ank[0], lA, ...hangt(lA, lB, 0.22).slice(1, -1), lB, ank[1]], 'brugtouw', { dik: 0.016, naam: 'looptouw' });
    b.stap('Handtouw', 'Leg het handtouw in de kruisingen van de X’en, ook van anker naar anker, en span het op dezelfde manier. Het hangt zo’n 1,2 m boven het looptouw.');
    const yh = kY + 0.11;
    const hA = [kruizen[0].x, yh, 0]; const hB = [kruizen[1].x, yh, 0];
    b.lijn([ank[0], hA, ...hangt(hA, hB, 0.25).slice(1, -1), hB, ank[1]], 'brugtouw', { dik: 0.013, naam: 'handtouw' });
    b.stap('Testen', 'Test de brug met een zware zak, dan met iemand van de leiding. Kijk de ankers na en spreek af: één tegelijk op de brug.');
    b.ding('zak', { p: [0.6, yl - 0.22 - 0.3, 0] });
    b.lijn([[0.6, yl - 0.22, 0], [0.6, yl - 0.22 - 0.1, 0]], 'lijn', { dik: 0.006 });
    return { naam: 'Apenbrug op pijlers', ...m, grond: 'gras', extra: ['1 looptouw en 1 handtouw, elk ±16 m, met weinig rek'] };
  }
  const X = 5.2; const { bomen, raak } = tweeBomen(b, X, 0.3);
  const yl = 1.0; const yh = 2.25;
  b.stap('Bomen', 'Kies twee dikke, levende bomen (minstens 30 cm doorsnee), niet vlak aan de waterkant: daar wortelt een boom slecht. Leg jute of een oude slaapmat om de stam waar de touwen komen.');
  for (const t of bomen) for (const y of [yl, yh]) b.ding('jute', { p: [t.c[0], y, 0], r: t.r, hoog: 0.3 });
  b.stap('Looptouw', 'Zet het looptouw aan de eerste boom vast op zo’n 1 m, met een rondtorn met twee halve steken, en leg het naar de tweede boom.');
  aanBoom(b, bomen[0], yl, 'looptouw aan de eerste boom', { jute: false });
  b.lijn(hangt(raak(bomen[0], yl), raak(bomen[1], yl), 0.25), 'brugtouw', { dik: 0.016, naam: 'looptouw' });
  b.stap('Vierloper', 'Span het looptouw met een vierloper: het ene blok aan een sling om de boom, het andere aan het looptouw (met een prusik). Trek aan de haalkant: je trekt een kwart van de kracht. Niet snaarstrak!', { tot: 4 });
  vierloper(b, bomen[1], yl);
  b.stap('Vastzetten', 'Zet het looptouw om de tweede boom vast met een spanknoop en minstens drie halve steken. Haal dan de vierloper eraf: de spanning blijft niet op de takel staan.');
  aanBoom(b, bomen[1], yl, 'looptouw aan de tweede boom', { jute: false });
  b.stap('Handtouw', 'Span het handtouw op dezelfde manier, zo’n 1,2 m boven het looptouw: op borsthoogte als je op het looptouw staat.');
  for (const t of bomen) aanBoom(b, t, yh, 'handtouw aan de boom', { jute: false });
  b.lijn(hangt(raak(bomen[0], yh), raak(bomen[1], yh), 0.3), 'brugtouw', { dik: 0.013, naam: 'handtouw' });
  b.stap('Testen', 'Test de brug met een zware zak, dan met iemand van de leiding. Kijk de knopen en de bomen na en spreek af: één tegelijk op de brug.');
  b.ding('zak', { p: [0.6, yl - 0.25 - 0.3, 0] });
  b.lijn([[0.6, yl - 0.25, 0], [0.6, yl - 0.25 - 0.1, 0]], 'lijn', { dik: 0.006 });
  return { naam: 'Apenbrug tussen bomen', ...m, grond: 'gras', kader: 'alles', extra: ['1 looptouw en 1 handtouw, elk ±15 m, met weinig rek', 'een vierloper, een sling en een schroefkarabiner', 'jute of oude slaapmatten'] };
}
apenbrug.varianten = [['bomen', 'Tussen twee bomen'], ['pijlers', 'Vrijstaand op pijlers']];
apenbrug.variantKop = 'Bouw:';
apenbrug.variantLabel = 'Kies hoe je hem bouwt';

/** Buikschuif: one thick rope. Between two trees with a vierloper, or over two driepoten to ankers (AB 11626). */
function buikschuif(variant = 'bomen') {
  const b = bouwer(); const { m } = b;
  water(b, -2.4, 2.4);
  if (variant === 'driepoten') {
    const L = 2.5; const d = MIDDEL; const voetR = 1.0; const X = 3.6;
    const kruisY = Math.sqrt(2.0 ** 2 - voetR ** 2);
    b.stap('Driepoten', 'Zet aan elke kant van het water een driepoot van palen van 2,5 m, met een achtsjorring bovenaan. Eén poot staat naar het water toe, twee naar het anker.');
    const pijlers = [-1, 1].map((s) => {
      const C = [s * X, kruisY, 0];
      const poten = [0, 120, 240].map((g0) => {
        const g = s < 0 ? g0 : 180 - g0;
        const voet = [s * X + Math.cos(g * RAD) * voetR, 0, Math.sin(g * RAD) * voetR];
        const tang = [-Math.sin(g * RAD), 0, Math.cos(g * RAD)];
        const v = plus(voet, keer(tang, 0.065));
        return b.paalL(v, min(plus(C, keer(tang, 0.065)), v), L, d, 'poot');
      });
      b.sjor('acht', poten, { p: C, naam: 'de kop van de driepoot' });
      return { s, C, poten };
    });
    b.stap('Balkjes', 'Sjor onderaan drie balkjes van 2 m tussen de poten van elke driepoot (kruissjorringen). Dan kunnen de poten niet uit elkaar zakken als er iemand aan het touw hangt.');
    for (const pj of pijlers) {
      for (let i = 0; i < 3; i++) {
        const A = pj.poten[i]; const B = pj.poten[(i + 1) % 3];
        const p1 = opHoogte(m.palen[A], 0.4); const p2 = opHoogte(m.palen[B], 0.4);
        const midden = keer(plus(p1, p2), 0.5); const uit = eenheid([midden[0] - pj.C[0], 0, midden[2]]);
        const c = plus(midden, keer(uit, d / 2 + DUN / 2)); const r = eenheid(min(p2, p1));
        const balk = b.paal(plus(c, keer(r, -1)), plus(c, keer(r, 1)), DUN, 'balkje');
        b.sjor('kruis', [A, balk], { naam: 'balkje aan poot' }); b.sjor('kruis', [B, balk], { naam: 'balkje aan poot' });
      }
    }
    b.stap('Ankers', 'Zet achter elke driepoot een stevig anker van haringen in serie (1-2-3), in het verlengde van het touw.');
    const ank = pijlers.map((pj) => b.anker([pj.s * (X + 3.4), 0, 0], [pj.s, 0, 0], [1, 2, 3]));
    b.stap('Touw', 'Leg een dik touw van anker naar anker over de koppen van de driepoten. Zet het aan het ene anker vast en span het aan het andere met een spanknoop of een vierloper, met wat doorhang.');
    const top = pijlers.map((pj) => plus(pj.C, [0, 0.13, 0]));
    b.lijn([ank[0], top[0], ...hangt(top[0], top[1], 0.35).slice(1, -1), top[1], ank[1]], 'brugtouw', { dik: 0.019, naam: 'buikschuiftouw' });
    b.stap('Testen', 'Test het touw met een zware zak in het midden, kijk dan de driepoten en ankers na. Ga één voor één, en kijk tussendoor de ankers na.');
    b.ding('zak', { p: [0, top[0][1] - 0.35 - 0.36, 0] });
    b.lijn([[0, top[0][1] - 0.35, 0], [0, top[0][1] - 0.35 - 0.14, 0]], 'lijn', { dik: 0.006 });
    return { naam: 'Buikschuif over twee driepoten', ...m, grond: 'gras', extra: ['1 dik kunststof touw van ±20 m', 'een vierloper of een spanknoop'] };
  }
  const { bomen, raak } = tweeBomen(b, 5.2, 0.32);
  const y = 1.6;
  b.stap('Bomen', 'Kies twee dikke, levende bomen, niet vlak aan de waterkant. Leg jute om de stam waar het touw komt.');
  for (const t of bomen) b.ding('jute', { p: [t.c[0], y, 0], r: t.r, hoog: 0.3 });
  b.stap('Touw', 'Zet een dik touw aan de eerste boom vast met een rondtorn met twee halve steken, en leg het naar de tweede boom.');
  aanBoom(b, bomen[0], y, 'touw aan de eerste boom', { jute: false });
  b.lijn(hangt(raak(bomen[0], y), raak(bomen[1], y), 0.35), 'brugtouw', { dik: 0.019, naam: 'buikschuiftouw' });
  b.stap('Vierloper', 'Span het touw met een vierloper tussen de tweede boom en het touw. Laat het wat doorhangen: met iemand in het midden trekt een strak touw enorm aan de bomen.', { tot: 4 });
  vierloper(b, bomen[1], y);
  b.stap('Vastzetten', 'Zet het touw om de tweede boom vast met een spanknoop en minstens drie halve steken, en haal de vierloper eraf.');
  aanBoom(b, bomen[1], y, 'touw aan de tweede boom', { jute: false });
  b.stap('Testen', 'Test met een zware zak in het midden, dan met iemand van de leiding. Eén voor één eroverheen, en kijk tussendoor de knopen en bomen na.');
  b.ding('zak', { p: [0, y - 0.35 - 0.36, 0] });
  b.lijn([[0, y - 0.35, 0], [0, y - 0.35 - 0.14, 0]], 'lijn', { dik: 0.006 });
  return { naam: 'Buikschuif tussen bomen', ...m, grond: 'gras', kader: 'alles', extra: ['1 dik kunststof touw van ±16 m', 'een vierloper, een sling en een schroefkarabiner', 'jute of een oude slaapmat'] };
}
buikschuif.varianten = [['bomen', 'Tussen twee bomen'], ['driepoten', 'Over twee driepoten']];
buikschuif.variantKop = 'Bouw:';
buikschuif.variantLabel = 'Kies hoe je hem bouwt';

/** Postman walk: an apenbrug whose boventouw hangs slack (Scoutpedia Indianenbrug). */
function postmanwalk() {
  const b = bouwer(); const { m } = b;
  const { bomen, raak } = tweeBomen(b, 4.2, 0.28);
  const yl = 0.7; const yh = 2.0;
  b.stap('Bomen', 'Twee dikke bomen, met jute om de stam waar de touwen komen.');
  for (const t of bomen) for (const y of [yl, yh]) b.ding('jute', { p: [t.c[0], y, 0], r: t.r, hoog: 0.3 });
  b.stap('Looptouw', 'Span het looptouw op zo’n 70 cm, zoals bij een apenbrug: aan de ene boom vast, aan de andere gespannen.');
  for (const t of bomen) aanBoom(b, t, yl, 'looptouw aan de boom', { jute: false });
  b.lijn(hangt(raak(bomen[0], yl), raak(bomen[1], yl), 0.15), 'brugtouw', { dik: 0.016, naam: 'looptouw' });
  b.stap('Boventouw', 'Zet het boventouw aan beide bomen vast, maar laat het slap hangen: een meter langer dan de afstand. Onderweg houd je het zelf strak door er een lus van in je handen te nemen.');
  for (const t of bomen) aanBoom(b, t, yh, 'boventouw aan de boom', { jute: false });
  b.lijn(hangt(raak(bomen[0], yh), raak(bomen[1], yh), 1.05, 16), 'brugtouw', { dik: 0.013, naam: 'boventouw (slap)' });
  return { naam: 'Postman walk', ...m, grond: 'gras', kader: 'alles', extra: ['1 looptouw van ±12 m', '1 boventouw van ±13 m', 'jute'] };
}

/** Lianenbrug: a looptouw and a high boventouw with short ropes hanging from it (Scoutpedia Touwbrug). */
function lianenbrug() {
  const b = bouwer(); const { m } = b;
  const { bomen, raak } = tweeBomen(b, 4.2, 0.3);
  const yl = 0.55; const yb = 3.0;
  b.stap('Bomen', 'Twee dikke bomen met jute op twee hoogtes: laag voor het looptouw, hoog voor het boventouw. Het hoge touw zet de leiding vast, vanaf een ladder.');
  for (const t of bomen) for (const y of [yl, yb]) b.ding('jute', { p: [t.c[0], y, 0], r: t.r, hoog: 0.3 });
  b.stap('Looptouw', 'Span het looptouw op zo’n 55 cm.');
  for (const t of bomen) aanBoom(b, t, yl, 'looptouw aan de boom', { jute: false });
  const lt = hangt(raak(bomen[0], yl), raak(bomen[1], yl), 0.15);
  b.lijn(lt, 'brugtouw', { dik: 0.016, naam: 'looptouw' });
  b.stap('Boventouw', 'Span op zo’n 3 m een boventouw. Daar hangen straks de lianen aan.');
  for (const t of bomen) aanBoom(b, t, yb, 'boventouw aan de boom', { jute: false });
  const xs = [raak(bomen[0], yb)[0], raak(bomen[1], yb)[0]];
  const zak = 0.18;
  const bovenY = (x) => yb - zak * Math.sin(Math.PI * (x - xs[0]) / (xs[1] - xs[0]));
  b.lijn(hangt(raak(bomen[0], yb), raak(bomen[1], yb), zak), 'brugtouw', { dik: 0.013, naam: 'boventouw' });
  b.stap('Lianen', 'Hang om de 70 cm een kort touw aan het boventouw, met een knoop of lus aan het eind op zo’n 1,2 m boven het looptouw. Je loopt over het looptouw en grijpt de ene liaan na de andere.');
  for (let x = -2.8; x <= 2.81; x += 0.7) {
    const tot = yl - 0.15 * Math.sin(Math.PI * (x - xs[0]) / (xs[1] - xs[0])) + 1.2;
    b.lijn([[x, bovenY(x) - 0.01, 0], [x, tot, 0]], 'liaan', { dik: 0.009, naam: 'liaan' });
    b.ding('knoop', { p: [x, tot - 0.02, 0] });
  }
  return { naam: 'Lianenbrug', ...m, grond: 'gras', kader: 'alles', extra: ['1 looptouw en 1 boventouw van ±12 m', '9 korte touwen van ±1,5 m (lianen)', 'jute'] };
}

/** Evenwichtsbalk: fixed in the forks of two low bokjes, hanging from two trees, or hanging over water (AB 6162). */
function evenwichtsbalk(variant = 'vast') {
  const b = bouwer(); const { m } = b;
  if (variant === 'vast') {
    b.stap('Bokjes', 'Zet twee lage bokjes van palen van 1 m neer, 2,4 m uit elkaar, elk met een vorksjorring.');
    const ev = [-1.2, 1.2].map((x) => {
      const vorm = bokVorm([x, 0, 0], [0, 0, 1], 0.45, 0.4, 1.0, MIDDEL);
      const poten = vorm.poten.map((p) => b.paal(p.a, p.b, MIDDEL, 'poot'));
      b.sjor('vork', poten, { p: vorm.C, naam: 'de kop van een bokje' });
      return { vorm, poten };
    });
    b.stap('Balk', 'Leg een paal van 4 m in de vorken en zet hem aan elk bokje vast met een kruissjorring. Laag houden: hooguit een halve meter.');
    const ye = ev[0].vorm.vorkY(MIDDEL / 2);
    const evb = b.paal([-2, ye, 0], [2, ye, 0], MIDDEL, 'evenwichtsbalk');
    for (const bk of ev) b.sjor('kruis', [bk.poten[1], evb], { naam: 'evenwichtsbalk in de vork' });
    return { naam: 'Evenwichtsbalk', ...m, grond: 'gras' };
  }
  const opWater = variant === 'water';
  if (opWater) water(b, -2.9, 2.9);
  const { bomen } = tweeBomen(b, 3.2, 0.3);
  const yb = opWater ? 0.6 : 0.4; const yt = 2.0;
  b.stap('Bomen', opWater
    ? 'Twee dikke bomen aan weerszijden van het water, met jute om de stam. Het water is diep genoeg om in te vallen, zonder rommel op de bodem.'
    : 'Twee dikke bomen, zo’n 6 m uit elkaar, met jute om de stam.');
  for (const t of bomen) b.ding('jute', { p: [t.c[0], yt, 0], r: t.r, hoog: 0.3 });
  b.stap('Balk', `Hang een paal van 4 m aan elk eind met een touw aan een boom: een mastworp om de balk, een rondtorn om de boom. De balk hangt op ${opWater ? 'zo’n 60 cm boven het water' : 'zo’n 40 cm'} en zwaait als je erop staat.`);
  const balk = b.paal([-2, yb, 0], [2, yb, 0], MIDDEL, 'evenwichtsbalk');
  for (const t of bomen) {
    const xe = t.s * 1.85;
    b.sjor('mastworp', [balk], { p: [xe, yb, 0], naam: 'ophangtouw aan de balk' });
    aanBoom(b, t, yt, 'ophangtouw aan de boom', { jute: false });
    b.lijn([[xe, yb + MIDDEL / 2, 0], [t.c[0] - t.s * t.r, yt, 0]], 'ophang', { dik: 0.009, naam: 'ophangtouw' });
  }
  if (!opWater) {
    b.stap('Handtouw', 'Wil je het makkelijker maken, span dan een handtouw zo’n 1,3 m boven de balk. Zonder handtouw is het een echte evenwichtsoefening.');
    const yh = yb + 1.3;
    for (const t of bomen) aanBoom(b, t, yh, 'handtouw aan de boom');
    b.lijn(hangt([bomen[0].c[0] + bomen[0].r, yh, 0], [bomen[1].c[0] - bomen[1].r, yh, 0], 0.12), 'brugtouw', { dik: 0.013, naam: 'handtouw' });
  }
  return { naam: opWater ? 'Evenwichtsbalk boven water' : 'Zwevende evenwichtsbalk', ...m, grond: 'gras', extra: opWater ? ['2 ophangtouwen', 'jute', 'zwemvesten'] : ['2 ophangtouwen', '1 handtouw (als je wilt)', 'jute'] };
}
evenwichtsbalk.varianten = [['vast', 'Vast op bokjes'], ['zwevend', 'Zwevend'], ['water', 'Boven water']];
evenwichtsbalk.variantKop = 'Balk:';
evenwichtsbalk.variantLabel = 'Kies de balk';

/** A horizontal ladder of 4 m (two bomen 45–55 cm apart, sporten every 35 cm) at height y; returns its bomen. */
function ladderLiggend(b, y, z0, z1, { sjor = true } = {}) {
  const bomen = [z0, z1].map((z) => b.paal([-2, y, z], [2, y, z], MIDDEL, 'boom van de ladder'));
  const sporten = [];
  for (let x = -1.4; x <= 1.41; x += 0.35) {
    const yS = y + MIDDEL / 2 + DUN / 2;
    sporten.push(b.paal([x, yS, z0 - 0.15], [x, yS, z1 + 0.15], DUN, 'sport'));
  }
  if (sjor) for (const s of sporten) for (const bm of bomen) b.sjor('kruis', [bm, s], { naam: 'sport aan boom' });
  return { bomen, sporten };
}

/** Hangladder: a horizontal ladder to swing along underneath, on two bokken (fixed) or on four ropes from two trees. */
function hangladder(variant = 'bokken') {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL;
  if (variant === 'bomen') {
    const { bomen } = tweeBomen(b, 2.9, 0.3);
    const y = 2.1; const yt = 3.4; const z = 0.25;
    b.stap('Ladder', 'Sjor op de grond een ladder van twee palen van 4 m en sporten om de 35 cm, met kruissjorringen. Ronde stelen (bezemstelen) zijn fijn om vast te pakken.');
    const { bomen: lb } = ladderLiggend(b, y, -z, z);
    b.stap('Ophangen', 'Hang de ladder aan vier touwen aan twee bomen, op een hoogte waar je met gestrekte armen net bij kunt. Hij beweegt mee als je slingert: dat maakt het lastig.');
    for (const t of bomen) {
      for (const zz of [-0.08, 0.08]) aanBoom(b, t, yt + (zz > 0 ? 0.25 : 0), 'ophangtouw aan de boom', { jute: zz < 0 });
      for (const [i, zz] of [[0, -z], [1, z]]) {
        const xe = t.s * 1.85;
        b.sjor('mastworp', [lb[i]], { p: [xe, y, zz], naam: 'ophangtouw aan de ladder' });
        b.lijn([[xe, y + d / 2, zz], [t.c[0] - t.s * t.r, yt + (i ? 0.25 : 0), zz * 0.3]], 'ophang', { dik: 0.009, naam: 'ophangtouw' });
      }
    }
    b.ding('jute', { p: [bomen[0].c[0], yt + 0.25, 0], r: 0.3, hoog: 0.3 });
    b.ding('jute', { p: [bomen[1].c[0], yt + 0.25, 0], r: 0.3, hoog: 0.3 });
    b.stap('Valzand', 'Leg zand of houtsnippers onder de ladder, en laat er iemand naast lopen die kan opvangen.');
    b.ding('zand', { p: [0, 0.025, 0], lang: 5.2, breed: 2.6, dik: 0.05, rand: false });
    return { naam: 'Hangladder aan touwen', ...m, grond: 'gras', extra: ['4 ophangtouwen', 'jute', 'zand of houtsnippers'] };
  }
  const L = 3; const X = 1.4;
  b.stap('Bokken', 'Zet twee bokken van palen van 3 m neer, 2,8 m uit elkaar, elk met een vorksjorring op zo’n 2,4 m en een dwarsbalk laag tussen de poten.');
  const bokken = [-1, 1].map((s) => {
    const vorm = bokVorm([s * X, 0, 0], [0, 0, 1], 0.9, 2.4, L, d);
    const poten = vorm.poten.map((p) => b.paal(p.a, p.b, d, 'poot'));
    b.sjor('vork', poten, { p: vorm.C, naam: 'de kop van een bok' });
    const c = plus([s * X, 0.4, 0], keer(vorm.diep, s * (d / 2 + d / 2 + 0.005)));
    const balk = b.paal(plus(c, [0, 0, -1.1]), plus(c, [0, 0, 1.1]), d, 'dwarsbalk');
    for (const p of poten) b.sjor('kruis', [p, balk], { naam: 'dwarsbalk aan poot' });
    return { vorm, poten };
  });
  b.stap('Bomen', 'Sjor op zo’n 2 m aan beide kanten een paal van 4 m over de poten van de twee bokken (kruissjorringen): de bomen van de ladder.');
  const y = 2.0;
  const zs = [0, 1].map((k) => { const p0 = opHoogte(m.palen[bokken[0].poten[k]], y); return p0[2] + Math.sign(p0[2]) * d; });
  const bomenL = zs.map((z) => b.paal([-2, y, z], [2, y, z], d, 'boom van de ladder'));
  bomenL.forEach((bm, k) => { for (const bk of bokken) b.sjor('kruis', [bk.poten[k], bm], { naam: 'ladderboom aan poot' }); });
  b.stap('Sporten', 'Leg om de 35 cm een sport over de twee bomen en sjor elke sport aan beide bomen met een kruissjorring.');
  for (let x = -1.05; x <= 1.06; x += 0.35) {
    const yS = y + d / 2 + DUN / 2;
    const s = b.paal([x, yS, zs[0] - 0.12], [x, yS, zs[1] + 0.12], DUN, 'sport');
    for (const bm of bomenL) b.sjor('kruis', [bm, s], { naam: 'sport aan boom' });
  }
  b.stap('Schoren', 'Zet aan elke kant een schoor van 4 m schuin van bok naar bok, met diagonaalsjorringen. Anders zakt het rek in de lengte scheef.');
  for (const k of [0, 1]) {
    const pA = opHoogte(m.palen[bokken[0].poten[k]], 0.2); const pB = opHoogte(m.palen[bokken[1].poten[k]], 1.7);
    const off = [0, 0, -Math.sign(pA[2]) * (d / 2 + DUN / 2)];
    const a = plus(pA, off); const c = plus(pB, off); const r = eenheid(min(c, a)); const l = lengte(min(c, a));
    const schoor = b.paal(plus(a, keer(r, -(4 - l) / 2)), plus(c, keer(r, (4 - l) / 2)), DUN, 'schoor');
    b.sjor('diagonaal', [bokken[0].poten[k], schoor], { naam: 'schoor aan poot' });
    b.sjor('diagonaal', [bokken[1].poten[k], schoor], { naam: 'schoor aan poot' });
  }
  b.stap('Valzand', 'Leg zand of houtsnippers onder de ladder, en laat de leiding alles nakijken voor iemand gaat slingeren.');
  b.ding('zand', { p: [0, 0.025, 0], lang: 5, breed: 2.8, dik: 0.05, rand: false });
  return { naam: 'Hangladder op bokken', ...m, grond: 'gras', extra: ['zand of houtsnippers'] };
}
hangladder.varianten = [['bokken', 'Vast op bokken'], ['bomen', 'Hangend aan touwen']];
hangladder.variantKop = 'Ladder:';
hangladder.variantLabel = 'Kies de ladder';

/** Klimnet with a klimtouw and a bel: a bovenbalk on two bokken, the net pulled out at an angle to haringen. */
function klimnet() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL; const L = 4; const X = 1.6;
  b.stap('Bokken', 'Zet twee bokken van palen van 4 m neer, 3,2 m uit elkaar, met een vorksjorring op zo’n 2,7 m en laag een dwarsbalk (kruissjorringen).');
  const bokken = [-1, 1].map((s) => {
    const vorm = bokVorm([s * X, 0, 0], [0, 0, 1], 1.2, 2.7, L, d);
    const poten = vorm.poten.map((p) => b.paal(p.a, p.b, d, 'poot'));
    b.sjor('vork', poten, { p: vorm.C, naam: 'de kop van een bok' });
    const c = plus([s * X, 0.45, 0], keer(vorm.diep, s * (d / 2 + d / 2 + 0.005)));
    const balk = b.paal(plus(c, [0, 0, -1.25]), plus(c, [0, 0, 1.25]), d, 'dwarsbalk');
    for (const p of poten) b.sjor('kruis', [p, balk], { naam: 'dwarsbalk aan poot' });
    return { vorm, poten };
  });
  b.stap('Bovenbalk', 'Leg een bovenbalk van 4 m in de vorken, met kruissjorringen, en span aan elk eind een tui in het verlengde naar een haring.');
  const yb = bokken[0].vorm.vorkY(d / 2);
  const balk = b.paal([-2, yb, 0], [2, yb, 0], d, 'bovenbalk');
  for (const bk of bokken) b.sjor('kruis', [bk.poten[1], balk], { naam: 'bovenbalk in de vork' });
  for (const s of [-1, 1]) {
    const p = [s * 1.9, yb, 0];
    b.sjor('mastworp', [balk], { p, naam: 'tui aan de bovenbalk' });
    b.lijn([p, b.haring([s * 5.2, 0, 0], [s, 0, 0])], 'tui');
  }
  b.stap('Net', 'Hang een stevig net aan de bovenbalk en trek de onderkant schuin uit naar haringen. Een schuin net klimt makkelijker en je valt er niet zo diep van.');
  const zN = 1.9; const yO = 0.3; const xs = [-1.2, -0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9, 1.2];
  const top = (x) => [x, yb - d / 2 - 0.01, 0.03]; const onder = (x) => [x, yO, zN];
  // the whole net as one rope: down and up the verticals, then to and fro along the rows (the edges come with it)
  const net = [];
  xs.forEach((x, i) => net.push(...(i % 2 ? [onder(x), top(x)] : [top(x), onder(x)])));
  for (let k = 7; k >= 1; k--) {
    const t = k / 8; const l = plus(top(-1.2), keer(min(onder(-1.2), top(-1.2)), t)); const r = plus(top(1.2), keer(min(onder(1.2), top(1.2)), t));
    net.push(...(k % 2 ? [r, l] : [l, r]));
  }
  b.lijn(net, 'klimnet', { dik: 0.007, naam: 'klimnet' });
  for (const x of [-1.2, 0, 1.2]) b.sjor('mastworp', [balk], { p: [x, yb, 0], naam: 'net aan de bovenbalk' });
  for (const x of [-1.2, 0, 1.2]) b.lijn([onder(x), b.haring([x, 0, zN + 0.5], [0, 0, 1])], 'tui', { naam: 'net naar de haring' });
  b.stap('Klimtouw', 'Hang aan de andere kant een dik klimtouw met knopen om de 40 cm, en een bel aan de bovenbalk: wie boven is, luidt de bel.');
  b.sjor('mastworp', [balk], { p: [0.5, yb, 0], naam: 'klimtouw aan de bovenbalk' });
  b.lijn([[0.5, yb - d / 2, -0.03], [0.5, 0.12, -0.05]], 'klimtouw', { dik: 0.014, naam: 'klimtouw' });
  for (let y = yb - 0.55; y > 0.3; y -= 0.4) b.ding('knoop', { p: [0.5, y, -0.04] });
  b.lijn([[0.85, yb - d / 2, -0.02], [0.85, yb - 0.2, -0.02]], 'lijn', { dik: 0.004 });
  b.ding('pan', { p: [0.85, yb - 0.25, -0.02], r: 0.05, hoog: 0.08 });
  b.stap('Valzand', 'Leg zand of houtsnippers onder het net en het touw. Spreek af hoeveel er tegelijk op het net mogen, en klim nooit zonder toezicht.');
  b.ding('zand', { p: [0, 0.025, 0.3], lang: 4.4, breed: 4.4, dik: 0.05, rand: false });
  return { naam: 'Klimnet met klimtouw', ...m, grond: 'gras', extra: ['een stevig net van ±2,5 × 3 m (vrachtnet)', '1 dik klimtouw met knopen', 'een bel', 'zand of houtsnippers'] };
}

/** Kruipgang: under a zeil on two low bokjes, or under a zigzag of rope between short posts. */
function kruipgang(variant = 'zeil') {
  const b = bouwer(); const { m } = b;
  if (variant === 'touw') {
    b.stap('Paaltjes', 'Sla twee rijen korte paaltjes in de grond, 1,2 m uit elkaar en om de meter een paaltje. Er blijft zo’n 60 cm boven de grond.');
    const rij = [-0.6, 0.6].map((z) => [-2, -1, 0, 1, 2].map((x) => b.paal([x, 0, z], [x, 0.6, z], DUN, 'paaltje (ingeslagen)')));
    b.stap('Touw', 'Span een touw zigzag van paaltje naar paaltje op 30 tot 40 cm, met een mastworp om elk paaltje. Wie eronderdoor kruipt, mag het touw niet raken.');
    const pts = [];
    for (let i = 0; i < 5; i++) {
      const k = i % 2; const x = -2 + i; const z = k ? 0.6 : -0.6;
      const y = 0.35; pts.push([x, y, z]);
      b.sjor('mastworp', [rij[k][i]], { p: [x, y, z], naam: 'touw om het paaltje' });
    }
    b.lijn(pts, 'kruiptouw', { dik: 0.007, naam: 'kruiptouw' });
    const pts2 = [];
    for (let i = 0; i < 5; i++) {
      const k = (i + 1) % 2; const x = -2 + i; const z = k ? 0.6 : -0.6;
      const y = 0.4; pts2.push([x, y, z]);
      b.sjor('mastworp', [rij[k][i]], { p: [x, y, z], naam: 'touw om het paaltje' });
    }
    b.lijn(pts2, 'kruiptouw', { dik: 0.007, naam: 'kruiptouw' });
    return { naam: 'Kruipgang onder touw', ...m, grond: 'gras', extra: ['2 touwen van ±8 m'] };
  }
  b.stap('Bokjes', 'Zet twee lage bokjes van dunne palen van 1,5 m neer, 2,6 m uit elkaar, met een vorksjorring op zo’n 65 cm.');
  const bokjes = [-1.3, 1.3].map((x) => {
    const vorm = bokVorm([x, 0, 0], [0, 0, 1], 0.6, 0.65, 1.5, DUN);
    const poten = vorm.poten.map((p) => b.paal(p.a, p.b, DUN, 'poot'));
    b.sjor('vork', poten, { p: vorm.C, naam: 'de kop van een bokje' });
    return { vorm, poten };
  });
  b.stap('Nokbalk', 'Leg een nokbalk van 3 m in de vorken, met kruissjorringen.');
  const yk = bokjes[0].vorm.vorkY(DUN / 2);
  const nok = b.paal([-1.5, yk, 0], [1.5, yk, 0], DUN, 'nokbalk');
  for (const bk of bokjes) b.sjor('kruis', [bk.poten[1], nok], { naam: 'nokbalk in de vork' });
  b.stap('Zeil', 'Leg een zeil over de nok en zet het aan de zijkanten laag bij de grond vast met haringen. Je kruipt er op je buik onderdoor.');
  const t = yk + DUN / 2 + 0.01;
  b.ding('zeil', { punten: [[-1.6, t, 0], [1.6, t, 0], [1.6, 0.12, 1.0], [-1.6, 0.12, 1.0]] });
  b.ding('zeil', { punten: [[-1.6, t, 0], [1.6, t, 0], [1.6, 0.12, -1.0], [-1.6, 0.12, -1.0]] });
  for (const x of [-1.6, 0, 1.6]) for (const z of [-1.1, 1.1]) b.haring([x, 0, z], [0, 0, Math.sign(z)]);
  return { naam: 'Kruipgang onder een zeil', ...m, grond: 'gras', extra: ['een zeil van ±3 × 2,5 m'] };
}
kruipgang.varianten = [['zeil', 'Onder een zeil'], ['touw', 'Onder touw']];
kruipgang.variantKop = 'Kruipgang:';
kruipgang.variantLabel = 'Kies de kruipgang';

/** Balken over–onder–over: three balken between pairs of ingegraven staanders (as in the stormbaan). */
function balkenhindernis() {
  const b = bouwer(); const { m } = b;
  b.stap('Staanders', 'Graaf drie paar staanders van 1,5 m een halve meter diep in, 1,2 m uit elkaar.');
  const rijen = [[-1.2, 1.0], [0, 0.55], [1.2, 1.0]].map(([x, y]) => ({ x, y, st: [-1, 1].map((s) => b.paal([x, 0, s * 1.1], [x, 1.5, s * 1.1], MIDDEL, 'staander (ingegraven)')) }));
  b.stap('Balken', 'Sjor er drie balken van 3 m aan met kruissjorringen: hoog, laag, hoog. Erover, eronderdoor, en weer erover.');
  for (const r of rijen) {
    const balk = b.paal([r.x + MIDDEL, r.y, -1.4], [r.x + MIDDEL, r.y, 1.4], MIDDEL, 'balk');
    for (const s of r.st) b.sjor('kruis', [s, balk], { naam: 'balk aan staander' });
  }
  return { naam: 'Balken over en onder', ...m, grond: 'gras' };
}

/** Muurtje: a wand of thin poles on two ingegraven staanders, a klimtouw over the top, schoren behind. */
function muurtje() {
  const b = bouwer(); const { m } = b;
  const xw = 0;
  b.stap('Staanders', 'Graaf twee dikke staanders van 2,5 m een halve meter diep in, 2 m uit elkaar.');
  const st = [-1, 1].map((s) => b.paal([xw, 0, s * 1.0], [xw, 2.4, s * 1.0], DIK, 'staander (ingegraven)'));
  b.stap('Wand', 'Sjor aan de voorkant acht dunne palen van 2,5 m dicht boven elkaar, met kruissjorringen: een wand van zo’n 2 m hoog.');
  for (let i = 0; i < 8; i++) {
    const y = 0.3 + i * 0.25;
    const p = b.paal([xw - DIK / 2 - DUN / 2, y, -1.25], [xw - DIK / 2 - DUN / 2, y, 1.25], DUN, 'wandpaal');
    for (const s of st) b.sjor('kruis', [s, p], { naam: 'wandpaal aan staander' });
  }
  b.stap('Schoren', 'Zet aan de achterkant twee schoren, met een diagonaalsjorring aan de staander en de voet tegen een haring. Zo valt de wand niet achterover.');
  for (const [s, si] of [[-1, 0], [1, 1]]) {
    const zS = s * (1.0 + DIK / 2 + DUN / 2);
    const a = [xw + 1.6, 0.03, zS]; const c = [xw, 2.0, zS];
    const r = eenheid(min(c, a));
    const schoor = b.paal(a, plus(a, keer(r, lengte(min(c, a)) + 0.25)), DUN, 'schoor');
    b.sjor('diagonaal', [st[si], schoor], { naam: 'schoor aan staander' });
    b.haring([xw + 1.72, 0, s * 1.0], [1, 0, 0]);
  }
  b.stap('Klimtouw', 'Leg een klimtouw met knopen over de bovenste paal en zet het achter de wand vast aan een anker. Help elkaar omhoog, en klim aan de achterkant langs de schoren weer naar beneden: niet springen.');
  const yt = 0.3 + 7 * 0.25;
  const kop = b.anker([xw + 2.4, 0, 0], [1, 0, 0], [1, 1]);
  b.lijn([[xw - 0.16, 0.05, 0], [xw - 0.12, yt + 0.06, 0], [xw + 0.06, yt + 0.1, 0], kop], 'klimtouw', { dik: 0.013, naam: 'klimtouw' });
  for (let i = 0; i < 4; i++) b.ding('knoop', { p: [xw - 0.13 - i * 0.008, yt - 0.4 - i * 0.4, 0] });
  b.stap('Valzand', 'Leg zand of houtsnippers voor en achter de wand.');
  b.ding('zand', { p: [0, 0.025, 0], lang: 4, breed: 2.8, dik: 0.05, rand: false });
  return { naam: 'Muurtje met klimtouw', ...m, grond: 'gras', extra: ['een klimtouw met knopen', 'zand of houtsnippers'] };
}

/** Wokkel: a paal with sporten at turning angles, hung in strops from two trees so it rolls when you climb along it. */
function wokkel() {
  const b = bouwer(); const { m } = b;
  const { bomen } = tweeBomen(b, 2.9, 0.3);
  const y = 0.9; const yt = 1.7; const d = MIDDEL;
  b.stap('As', 'Leg een paal van 4,5 m klaar: de as van de wokkel.');
  const as = b.paal([-2.25, y, 0], [2.25, y, 0], d, 'as');
  b.stap('Sporten', 'Sjor acht korte sporten van 90 cm aan de as met kruissjorringen, elke sport een achtste slag verder gedraaid dan de vorige: samen een wenteltrap.');
  for (let i = 0; i < 8; i++) {
    const x = -1.6 + i * (3.2 / 7); const th = i * 45 * RAD;
    const dir = [0, Math.cos(th), Math.sin(th)]; const n = [0, -Math.sin(th), Math.cos(th)];
    const c = plus([x, y, 0], keer(n, d / 2 + DUN / 2));
    const s = b.paal(plus(c, keer(dir, -0.45)), plus(c, keer(dir, 0.45)), DUN, 'sport');
    b.sjor('kruis', [as, s], { naam: 'sport aan de as' });
  }
  b.stap('Ophangen', 'Hang de as aan elk eind in een lus van touw aan een boom (rondtorn om de stam, met jute). De lus zit los om de as, zodat de wokkel kan draaien.');
  for (const t of bomen) {
    aanBoom(b, t, yt, 'ophangtouw aan de boom');
    const xe = t.s * 2.05; const tp = [t.c[0] - t.s * t.r, yt, 0]; const r = d / 2 + 0.012;
    b.lijn([tp, [xe, y + r * 0.7, r * 0.7], [xe, y, r], [xe, y - r, 0], [xe, y, -r], [xe, y + r * 0.7, -r * 0.7], tp], 'ophang', { dik: 0.008, naam: 'lus om de as' });
  }
  return { naam: 'Wokkel', ...m, grond: 'gras', extra: ['2 ophangtouwen', 'jute'] };
}

/** Spinnenweb: a web of thin rope between two trees, with as many gaps as players (AB 10158). */
function spinnenweb() {
  const b = bouwer(); const { m } = b;
  const { bomen, raak } = tweeBomen(b, 1.75, 0.28);
  const yo = 0.2; const yb = 1.95; const C = [0, 1.05, 0];
  b.stap('Raam', 'Span tussen twee bomen een touw boven (op zo’n 2 m) en een touw onder (net boven de grond).');
  for (const t of bomen) for (const y of [yo, yb]) aanBoom(b, t, y, 'touw aan de boom');
  b.lijn([raak(bomen[0], yb), raak(bomen[1], yb)], 'web', { dik: 0.007, naam: 'bovenste touw' });
  b.lijn([raak(bomen[0], yo), raak(bomen[1], yo)], 'web', { dik: 0.007, naam: 'onderste touw' });
  b.stap('Web', 'Knoop er met dun touw een web in: spaken van het midden naar het raam, en ringen eromheen. Maak evenveel gaten als er spelers zijn, groot en klein.');
  const xL = raak(bomen[0], 1)[0]; const xR = raak(bomen[1], 1)[0];
  const randen = [[xL, 0.6], [xL, 1.5], [-0.8, yb], [0.35, yb], [xR, 1.65], [xR, 0.75], [0.6, yo], [-0.55, yo]];
  const spaken = randen.map(([x, y]) => [x, y, 0]);
  for (const p of spaken) b.lijn([C, p], 'web', { dik: 0.005, naam: 'spaak van het web' });
  for (const f of [0.3, 0.62]) {
    const ring = spaken.map((p) => plus(C, keer(min(p, C), f * (0.9 + 0.2 * Math.sin(p[0] * 3)))));
    b.lijn([...ring, ring[0]], 'web', { dik: 0.005, naam: 'ring van het web' });
  }
  return { naam: 'Spinnenweb', ...m, grond: 'gras', kader: 'alles', extra: ['2 touwen van ±5 m voor het raam', 'dun touw of sisal voor het web'] };
}

/** The three-rope bridge on two X-pijlers that was the apenbrug of ./modellen.js. */
function vtouwbrug() {
  return { ...MODELLEN.apenbrug(), naam: 'V-touwbrug' };
}

export default {
  apenbrug, vtouwbrug, buikschuif, postmanwalk, lianenbrug, evenwichtsbalk, hangladder, klimnet, kruipgang,
  balkenhindernis, muurtje, wokkel, spinnenweb,
};
