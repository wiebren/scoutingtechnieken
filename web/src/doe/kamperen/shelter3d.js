// A shelter of branches in 3D (opties.soort: 'afdak', 'a-frame' or 'bladhut'), built step by step as in its blad.
// A slider (or "Speel af") goes from the empty place to the finished shelter: poles, then the branches one by one,
// then the leaves in rows from the bottom up. Drag the picture (or use the arrow keys) to look at it from another
// side. The same small hand-made projection as the frietbuil (frietbuil3d.js), no 3D library. Metres; x runs from
// the high side to the low side, y across, z up. Facts: the bladen afdak-shelter, a-frame-shelter and bladhut (TKN §9).
import { h } from '../../dom.js';
import { actie, acties, zetActie } from '../knoppen.js';
import { stappenBalk } from '../stappen.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './kamp.css';
import './frietbuil.css';
import './shelter.css';

const W = 400; const H = 280;
const AFSTAND = 11;                     // the eye's distance, for a little perspective

const klem = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const zacht = (x) => x * x * (3 - 2 * x);
const plus = (a, b) => a.map((v, i) => v + b[i]);
const min = (a, b) => a.map((v, i) => v - b[i]);
const keer = (a, k) => a.map((v) => v * k);
const lengte = (a) => Math.hypot(...a);
const eenheid = (a) => keer(a, 1 / (lengte(a) || 1));
const tussen = (a, b, f) => a.map((v, i) => v + (b[i] - v) * f);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const kruis = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// -- the pieces a shelter is drawn with

/** A stick from a to b, `dik` metres thick. */
const stok = (a, b, dik, extra = {}) => ({ soort: 'stok', a, b, dik, ...extra });
/** A flat piece; `kleur` is blad, bed or zak; `gat` an optional hole in it. */
const vlak = (pts, kleur, extra = {}) => ({ soort: 'vlak', pts, kleur, ...extra });

/** A stick with its foot on the ground that is put up: at e = 0 it points along `van`, at e = 1 it reaches `top`. */
function zetOp(voet, top, van, e) {
  const naar = min(top, voet); const L = lengte(naar);
  return plus(voet, keer(eenheid(tussen(keer(eenheid(van), L), naar, zacht(e))), L));
}

/**
 * The leaves on one side of a roof, laid in rows from the bottom edge b1–b2 up to the top edge t1–t2, so that each
 * row lies over the one below it, like roof tiles. p: how far (0..1). The lower edge of a row is a little ragged.
 */
function bladRijen(b1, b2, t1, t2, p, groep, rijen = 5) {
  const uit = [];
  for (let k = 0; k < rijen; k++) {
    const e = klem(p * rijen - k);
    if (e <= 0) break;
    const s0 = k / rijen; const s1 = Math.min(1, s0 + (1.35 / rijen) * zacht(e));
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const laag = tussen(b1, b2, i / 8); const hoog = tussen(t1, t2, i / 8);
      const af = min(laag, hoog);
      pts.push(plus(tussen(laag, hoog, s0), lengte(af) > 0.01 ? keer(eenheid(af), i % 2 ? 0.05 : 0) : [0, 0, 0]));
    }
    pts.push(tussen(b2, t2, s1), tussen(b1, t1, s1));
    uit.push(vlak(pts, 'blad', { groep, laag: 1 + k * 0.01 }));
  }
  return uit;
}

/** Across a heap of leaves (q from -1 to 1): with rond 0 the A of the frame, with rond 1 a hump that runs out
 *  onto the ground, as in the drawing shelter-bladhut. */
const dwars = (q, rond) => (1 - Math.abs(q)) + ((1 - q * q) - (1 - Math.abs(q))) * rond;

/**
 * The round heap of leaves on a bladhut, from the front x0 to the foot x1: high (h) and wide (w) at the front, lower
 * and narrower towards the foot. With rond 0 it is the A-shape of the frame; with rond 1 it is round across and along.
 * In front of x0 it rounds off over `voor` metres to a smaller front (`klein` of the size), where the entrance is.
 * Only the side you look at is drawn (eenzijdig), so the heap hides what is under it.
 */
function bladHoop(x0, x1, h, w, rond, voor, klein) {
  const vorm = (u) => (1 - u) + (Math.sqrt(Math.max(0, 1 - u * u)) - (1 - u)) * rond;      // along: round at the top
  const maat = (v) => 1 - (1 - klein) * (1 - Math.sqrt(1 - v * v));
  // u < 0: the rounded front, u from -1 (the front) to 0 (x0); u > 0: the body, to the foot at u = 1
  const punt = (u, q) => {
    const op = dwars(q, rond);
    if (u < 0) { const m = maat(-u); return [x0 + voor * u, w * m * q, Math.max(0.03, h * m * op)]; }
    const g = vorm(u);
    return [x0 + (x1 - x0) * u, w * g * q, Math.max(0.03, h * g * op)];
  };
  const ringen = [-1, -2 / 3, -1 / 3, ...Array.from({ length: 11 }, (_, i) => i / 10)];
  const uit = []; const NQ = 12;
  for (let i = 0; i < ringen.length - 1; i++) {
    for (let j = 0; j < NQ; j++) {
      const [u0, u1] = [ringen[i], ringen[i + 1]]; const [q0, q1] = [j / (NQ / 2) - 1, (j + 1) / (NQ / 2) - 1];
      const pts = [punt(u0, q0), punt(u0, q1), punt(u1, q1), punt(u1, q0)];
      const m = keer(pts.reduce(plus), 1 / 4);
      let n = normaal(pts);
      if (dot(n, [m[0] - (x0 + x1) / 2, m[1], m[2]]) < 0) n = keer(n, -1);
      uit.push(vlak(pts, 'blad', { eenzijdig: n, klasse: 'hoop' }));
    }
  }
  return uit;
}

/** A sleeping bag on the ground from x0 to x1 (along x), or across from y = x0 to x1 at x = dwars; the head at the start. */
function slaapzak(x0, x1, z, op, dwars = null) {
  const p = (x, y) => (dwars == null ? [x, y, z] : [dwars + y, x, z]);
  return [
    vlak([p(x0, 0.3), p(x1 - 0.1, 0.2), p(x1, 0), p(x1 - 0.1, -0.2), p(x0, -0.3), p(x0 - 0.12, 0)], 'zak', { op, binnen: true }),
    { soort: 'bol', p: p(x0 - 0.02, 0).map((v, i) => (i === 2 ? z + 0.1 : v)), r: 0.11, op, binnen: true },
  ];
}

/** How far each step is at t: one number per step after the first, 1 when done, 0 when not begun. */
const fasen = (stappen, t) => stappen.slice(1).map((st, i) => klem((t - stappen[i].t) / (st.t - stappen[i].t)));
const metTijd = (stappen) => stappen.map((st, i) => ({ ...st, t: i / (stappen.length - 1) }));

// -- the shelters

const AFDAK = (() => {
  // the cross pole lies at BX, against the trunks, in the crook (oksel) of a side branch of each tree
  const BALK = 1.35; const BX = -0.17; const YB = 1.3; const VOET = -1.75; const N = 9; const DIK = 0.28;
  const n = eenheid([-BALK, 0, BX - VOET]);
  const dak = { id: 'dak', n, m: [(VOET + BX) / 2, 0, BALK / 2] };
  return {
    label: 'Afdak van takken',
    doel: [-0.25, 0, 0.75], rand: 3, schaal: 56, begin: [-0.55, 0.35],
    wind: [-3.25, -2.55],
    kanten: ['van de dichte kant (in de wind)', 'van de open kant'],
    zichten: [['Open kant', 1.35, 0.22], ['Opzij', 0, 0.3], ['Dichte kant', -1.4, 0.35], ['Bovenaf', 0.3, 1.38]],
    stappen: metTijd([
      { naam: 'Plek', tekst: 'Zoek twee bomen dicht bij elkaar, op een plek waar je mag bouwen. Gebruik alleen dood hout.' },
      { naam: 'Dwars­paal', tekst: 'Stap 1: leg een stevige paal dwars tussen de twee bomen, in de oksels van twee zijtakken: daar waar een tak uit de stam komt. Daar ligt hij vast.' },
      { naam: 'Takken', tekst: 'Stap 2: zet aan één kant takken schuin tegen de dwarspaal, dicht naast elkaar. Die kant komt naar de wind.' },
      { naam: 'Blad erop', tekst: 'Stap 3: bedek de takken met een dikke laag blad, gras of dennentakken. Begin onderaan: dan vallen de lagen over elkaar, net als dakpannen.' },
      { naam: 'Vuurtje', tekst: 'Stap 4: aan de open kant kan een vuurtje, als het mag. Dat geeft zijn warmte onder het dak.' },
    ]),
    klaar: 'Klaar: de dichte kant staat naar de wind. Je zit of ligt onder het dak, met het vuur aan de open kant.',
    delen([balk, takken, blad, vuur]) {
      const uit = []; const labels = [];
      for (const y of [-YB, YB]) {
        uit.push(stok([0, y, 0], [0, y, 2.45], 0.24, { kleur: 'boom' }),
          stok([-0.05, y, BALK - 0.22], [-0.62, y * 1.04, BALK + 0.38], 0.09, { kleur: 'boom' }),
          stok([0, y * 1.02, 2.1], [0.3, y * 1.12, 2.48], 0.07, { kleur: 'boom' }));
      }
      if (balk > 0) {
        const z = BALK + (1 - zacht(balk)) * 0.9;
        uit.push(stok([BX, -YB - 0.28, z], [BX, YB + 0.28, z], 0.09, { op: klem(balk * 3) }));
        if (blad < 0.4) labels.push([[BX, 0, z + 0.5], 'dwarspaal']);
      }
      for (let i = 0; i < N; i++) {
        const e = klem((takken - i / (N + 2)) * ((N + 2) / 3));
        if (e <= 0) continue;
        const y = -1.12 + (2.24 * i) / (N - 1);
        const voet = [VOET, y, 0];
        const top = plus(voet, keer(min([BX, y, BALK + 0.06], voet), 1.1));
        uit.push(stok(voet, zetOp(voet, top, [0, 0, 1], e), 0.055, { groep: dak, laag: 0, op: klem(e * 5) }));
      }
      // the leaves: first a cover in rows from the bottom up, then it grows into a thick layer
      const dek = klem(blad * 1.6); const dikte = DIK * zacht(klem((blad - 0.6) / 0.4));
      const b = (y) => [VOET - 0.04, y, 0.04]; const tp = (y) => [BX + 0.06, y, BALK + 0.12];
      uit.push(...bladRijen(b(-YB), b(YB), tp(-YB), tp(YB), dek, dak));
      if (dikte > 0.01) {
        const bo = (y) => [VOET - 0.04 - dikte * 1.25, y, 0.04]; const to = (y) => plus(tp(y), keer(n, dikte));
        uit.push(...bladRijen(bo(-YB), bo(YB), to(-YB), to(YB), 1, dak).map((d) => ({ ...d, laag: d.laag + 1 })));
        // the ends of the layer: at both trees and along the top
        for (const y of [-YB, YB]) uit.push(vlak([b(y), tp(y), to(y), bo(y)], 'blad'));
        uit.push(vlak([tp(-YB), tp(YB), to(YB), to(-YB)], 'blad'));
      }
      if (vuur > 0) {
        const op = klem(vuur * 2);
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * 2 * Math.PI;
          uit.push({ soort: 'bol', p: [1.45 + 0.24 * Math.cos(a), 0.24 * Math.sin(a), 0.04], r: 0.06, kleur: 'steen', op, plat: true });
        }
        uit.push({ soort: 'vuur', p: [1.45, 0, 0], grootte: 0.35 * zacht(klem(vuur * 1.5)), op });
        uit.push(...slaapzak(-0.85, 0.85, 0.02, klem((vuur - 0.5) * 2), -0.7));
      }
      return { delen: uit, labels };
    },
  };
})();

/** The A-frame-shelter and the bladhut: the same build, the bladhut small and under a very thick layer of leaves. */
function aFrame({ bladhut }) {
  // the bok: two legs from (0, ±a, 0) to (0, ∓b, c); the ridge lies where they cross
  const [a, b, c] = bladhut ? [0.42, 0.14, 1.08] : [0.78, 0.2, 1.48];
  const HOOG = (c * a) / (a + b); const L = bladhut ? 2.4 : 3.2; const BREED = bladhut ? 0.52 : 0.92;
  const RIB = bladhut ? 7 : 8; const DIK = bladhut ? 0.5 : 0.18;    // a bladhut has a far thicker layer
  const hoog = (x) => HOOG * (1 - x / L); const breed = (x) => BREED * (1 - x / L);
  // the two roof sides: outward normal and middle, so that the branches and the leaves on them are drawn in order
  const zijde = (k) => {
    const P = [0, 0, HOOG]; const G = [0, k * BREED, 0]; const F = [L, 0, 0];
    const n = eenheid(kruis(min(G, P), min(F, P)));
    return { id: `zijde${k}`, n: n[1] * k > 0 ? n : keer(n, -1), m: [L / 3, (k * BREED) / 3, HOOG / 3] };
  };
  const ZIJ = { 1: zijde(1), '-1': zijde(-1) };
  const stappen = bladhut ? metTijd([
    { naam: 'Plek', tekst: 'Een bladhut bouw je als een A-frame-shelter, maar veel kleiner: net groot genoeg voor jou. Verzamel dood hout en heel veel droog blad.' },
    { naam: 'Bok en nok', tekst: 'Stap 1: zet twee palen gekruist tegen elkaar, een kleine bok. Leg de nokpaal erop, met de andere kant op de grond.' },
    { naam: 'Takken', tekst: 'Stap 2: zet aan beide kanten takken schuin tegen de nokpaal. Houd de hut klein: hoe kleiner, hoe minder lucht je hoeft op te warmen.' },
    { naam: 'Blad­bed', tekst: 'Stap 3: leg binnen een dikke laag droog blad op de grond. De grond trekt namelijk meer warmte weg dan de lucht.' },
    { naam: 'Dikke laag', tekst: 'Stap 4: leg er een heel dikke laag blad overheen, een halve meter of meer: veel dikker dan op een A-frame-shelter. Tussen het blad zit lucht, en die lucht houdt je warmte vast.' },
  ]) : metTijd([
    { naam: 'Plek', tekst: 'Zoek een vlakke plek waar je mag bouwen. Verzamel dood hout: twee palen, een lange nokpaal en veel takken.' },
    { naam: 'Bok', tekst: 'Stap 1: zet twee palen gekruist tegen elkaar. Bind ze vast waar ze kruisen. Dat heet een bok.' },
    { naam: 'Nok­paal', tekst: 'Stap 2: leg de nokpaal met één kant op de bok, en met de andere kant op de grond. Dat is de bovenkant van het dak.' },
    { naam: 'Takken', tekst: 'Stap 3: zet aan beide kanten takken schuin tegen de nokpaal.' },
    { naam: 'Blad erop', tekst: 'Stap 4: leg er een dikke laag blad overheen. Begin onderaan: dan vallen de lagen over elkaar, net als dakpannen.' },
  ]);
  return {
    label: bladhut ? 'Bladhut' : 'A-frame-shelter',
    doel: [L / 2 - 0.15, 0, HOOG / 2.6], rand: bladhut ? 2.1 : 2.7, schaal: bladhut ? 92 : 72, begin: [-0.6, 0.3],
    wind: [L + (bladhut ? 1.15 : 1.4), L + (bladhut ? 0.65 : 0.8)],
    kanten: ['van de ingang (hoog en open)', 'van het voeteneinde (laag, in de wind)'],
    zichten: [['Ingang', -1.25, 0.16], ['Opzij', 0, 0.3], ['Voeteneinde', 1.45, 0.4], ['Bovenaf', -0.3, 1.38]],
    stappen,
    klaar: bladhut ? 'Klaar: kruip erin met je voeten eerst, en stop de ingang bijna dicht met blad. Je ligt op het bladbed, onder een dikke laag blad. Zo blijf je warm, ook zonder vuur.'
      : 'Klaar: de hut is aan twee kanten dicht. Je ligt erin met je hoofd aan de hoge kant. De lage kant staat naar de wind.',
    delen(f) {
      // bladhut: bok and nok are one step (the first half, the second half); then branches, bed, leaves
      const [bok, nok, takken, bed, blad] = bladhut
        ? [klem(f[0] * 2), klem(f[0] * 2 - 1), f[1], f[2], f[3]] : [f[0], f[1], f[2], 0, f[3]];
      const uit = []; const labels = [];
      const bedekt = bladhut && blad > 0.55;                  // under the thick layer the poles do not stick out
      if (bok > 0) {
        for (const k of [1, -1]) {
          const voet = [0, k * a, 0];
          const top = zetOp(voet, [0, -k * b, c], [0, k, 0.05], klem(bok * 1.3 - (k > 0 ? 0 : 0.3)));
          const kruist = tussen(voet, top, a / (a + b));      // where the legs cross: under the roof below it
          uit.push(stok(voet, kruist, 0.07, { binnen: true }), stok(kruist, top, 0.07, { binnen: bedekt }));
        }
        if (blad < 0.3) labels.push([[0, 0, c + 0.22], 'bok']);
      }
      if (nok > 0) {
        const uit0 = bladhut ? 0.12 : 0.3;                       // how far the ridge pole sticks out in front of the bok
        const voet = [L + 0.05, 0, 0]; const top = [-uit0, 0, HOOG * (1 + uit0 / L) + 0.04];
        uit.push(stok(voet, zetOp(voet, top, [-1, 0, 0.04], nok), 0.08, { op: klem(nok * 4), binnen: bedekt }));
        if (blad < 0.3 && nok > 0.8) labels.push([[L * 0.45, 0, hoog(L * 0.45) + 0.28], 'nokpaal']);
      }
      for (let i = 0; i < RIB; i++) {
        const x = 0.16 + (i * (L - 0.6)) / (RIB - 1);
        for (const k of [1, -1]) {
          const j = 2 * i + (k > 0 ? 0 : 1); const n = 2 * RIB;
          const e = klem((takken - j / (n + 3)) * ((n + 3) / 4));
          if (e <= 0) continue;
          const voet = [x, k * (breed(x) + 0.05), 0]; const top = [x, -k * 0.08, hoog(x) + 0.06];
          uit.push(stok(voet, zetOp(voet, top, [0, 0, 1], e), bladhut ? 0.045 : 0.05, { groep: ZIJ[k], laag: 0, op: klem(e * 5) }));
        }
      }
      if (bed > 0) {
        const z = 0.11 * zacht(bed); const x1 = L * 0.82;
        uit.push(vlak([[0.04, BREED * 0.86, z], [x1, breed(x1) * 0.86, z], [x1 + 0.12, 0, z], [x1, -breed(x1) * 0.86, z], [0.04, -BREED * 0.86, z]], 'bed', { op: klem(bed * 3), binnen: true }));
        if (blad < 0.2) labels.push([[L * 0.4, 0, 0.3], 'bladbed']);
      }
      // the leaves: first a cover in rows, that then grows thick; on a bladhut into a round heap
      const dek = klem(blad * 2); const dikte = DIK * zacht(klem(blad * 2 - 1));
      const hoop = bladhut && dikte > 0.03;                  // the heap hides the roof sides when you look from outside
      for (const k of [1, -1]) {
        const zij = hoop ? { ...ZIJ[k], dicht: true } : ZIJ[k];
        uit.push(...bladRijen([-0.06, k * (BREED + 0.06), 0.03], [L + 0.1, 0, 0.03], [-0.06, 0, HOOG + 0.08], [L + 0.1, 0, 0.03], dek, zij));
        if (!bladhut && dikte > 0.01) {
          const x0 = -0.06;
          const F = [L + 0.1 + dikte * 0.6, 0, 0.03];
          uit.push(...bladRijen([x0, k * (BREED + 0.06 + dikte * 1.1), 0.03], F, [x0, 0, HOOG + 0.08 + dikte], F, 1, ZIJ[k])
            .map((d) => ({ ...d, laag: d.laag + 1 })));
        }
      }
      if (dikte > 0.01) {
        // The front: a band of leaves round the entrance, as thick as the layer. A bladhut has a smaller entrance, just
        // between the legs of the bok. The leaves lie on the frame: in front no further than the bok, behind not much
        // past the foot of the ridge pole.
        const [gy, gz] = bladhut ? [a + 0.05, HOOG * 0.82] : [BREED + 0.06, HOOG + 0.08];
        const Hv = HOOG + 0.08 + dikte; const Wv = BREED + 0.06 + dikte * 1.1;
        const rond = bladhut ? dikte / DIK : 0;
        // on a bladhut the heap rounds off in front, to a smaller front with the entrance in it
        const voor = bladhut ? dikte * 0.7 : 0; const klein = 1 - (bladhut ? 0.25 * (dikte / DIK) : 0);
        const xv = -0.06; const x0 = xv + voor;              // the heap rounds off from x0 back to the front at xv
        const boog = [];
        for (let i = 0; i <= 16; i++) {
          const q = i / 8 - 1;
          boog.push([xv, Wv * klein * q, Math.max(0.03, Hv * klein * dwars(q, rond))]);
        }
        uit.push(vlak(boog, 'blad', { gat: [[xv, gy, 0.03], [xv, 0, gz], [xv, -gy, 0.03]],
          groep: { id: 'voor', n: [-1, 0, 0], m: [xv, 0, HOOG / 3] }, laag: 0 }));
        if (hoop) uit.push(...bladHoop(x0, L + 0.1 + dikte * 0.6, Hv, Wv, rond, voor, klein));
      }
      if (blad > 0.85) uit.push(...slaapzak(0.3, bladhut ? 1.75 : 2.05, bladhut ? 0.12 : 0.02, (blad - 0.85) / 0.15));
      return { delen: uit, labels };
    },
  };
}

const SOORTEN = { afdak: AFDAK, 'a-frame': aFrame({ bladhut: false }), bladhut: aFrame({ bladhut: true }) };

/** The projection for a view (yaw, pitch in radians): world point → [x, y, depth] on the screen, and k (the scale). */
function kijker(M, draai, hoek) {
  const [cd, sd, ch, sh] = [Math.cos(draai), Math.sin(draai), Math.cos(hoek), Math.sin(hoek)];
  return ([x, y, z]) => {
    const [px, py, pz] = [x - M.doel[0], y - M.doel[1], z - M.doel[2]];
    const X = px * cd + py * sd; const Y = -px * sd + py * cd;
    const op = pz * ch + Y * sh; const diep = Y * ch - pz * sh;
    const k = AFSTAND / (AFSTAND + diep);
    return [W / 2 + X * M.schaal * k, H * 0.58 - op * M.schaal * k, diep, k];
  };
}

const r = (n) => Math.round(n * 10) / 10;
const pad = (pts) => `M${pts.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}`;

/** The normal of a flat piece (Newell's method, so a ragged edge does not matter). */
function normaal(pts) {
  const n = [0, 0, 0];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]; const q = pts[(i + 1) % pts.length];
    n[0] += (p[1] - q[1]) * (p[2] + q[2]); n[1] += (p[2] - q[2]) * (p[0] + q[0]); n[2] += (p[0] - q[0]) * (p[1] + q[1]);
  }
  return eenheid(n);
}

export default function shelter3d({ soort = 'afdak' } = {}) {
  const M = SOORTEN[soort] ?? AFDAK;
  let t = 0;
  let [draai, hoek] = M.begin;
  let speel = 0; let sleep = null;
  let gezegd = '';

  const plekVan = (tt) => tt * (M.stappen.length - 1);
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'kd-svg fb-svg', role: 'img', tabindex: '0', 'aria-roledescription': '3D-beeld' });
  const stap = h('p.kd-vraag', { 'aria-live': 'polite' });
  const zicht = h('p.doe-stil.fb-zicht', { 'aria-live': 'polite' });
  const balk = stappenBalk({ stappen: M.stappen.map((st) => st.naam), vloeiend: true, label: `${M.label} bouwen, stap voor stap`,
    zet: (w) => { stop(); zet(w / (M.stappen.length - 1)); } });
  const speelKnop = actie('Speel af', 'start', () => (speel ? stop() : speelAf()), { hoofd: true, klein: true });
  const zichtKnop = ([tekst, d, a]) => h('button.chip', { type: 'button', onclick: () => { draai = d; hoek = a; teken(); zeg(); } }, tekst);
  const verminder = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function kant() {
    const cx = Math.sin(draai);
    let w;
    if (Math.abs(cx) > 0.8) w = cx < 0 ? M.kanten[0] : M.kanten[1];
    else if (Math.abs(cx) < 0.4) w = 'van opzij';
    else w = `schuin ${(cx < 0 ? M.kanten[0] : M.kanten[1]).replace(/ \(.*\)$/, '')}`;
    return hoek > 1.15 ? `bijna van bovenaf, ${w}` : w;
  }

  function teken() {
    const P = kijker(M, draai, hoek);
    const oog = [Math.sin(draai) * Math.cos(hoek), -Math.cos(draai) * Math.cos(hoek), Math.sin(hoek)];
    const licht = eenheid([-0.45, 0.35, 0.82]);
    const { delen, labels } = M.delen(fasen(M.stappen, t));
    const g = s('g');

    // the ground: a disc of grass with a few lines, and the wind
    const [dx] = M.doel; const R = M.rand;
    const rand = []; for (let i = 0; i < 48; i++) { const a = (i / 48) * 2 * Math.PI; rand.push(P([dx + R * Math.cos(a), R * Math.sin(a), 0])); }
    g.append(s('path', { d: `${pad(rand)}Z`, class: 'fb-grond' }));
    for (let k = -Math.floor(R); k <= Math.floor(R); k++) {
      const half = Math.sqrt(R * R - k * k);
      g.append(s('path', { d: pad([P([dx + k, -half, 0]), P([dx + k, half, 0])]), class: 'fb-raster' }),
        s('path', { d: pad([P([dx - half, k, 0]), P([dx + half, k, 0])]), class: 'fb-raster' }));
    }
    const [w0x, w1x] = M.wind; const rich = Math.sign(w1x - w0x);
    const wp = P([w1x + rich * 0.25, 0, 0.02]); const wl = P([w1x, 0.2, 0.02]); const wr = P([w1x, -0.2, 0.02]);
    g.append(s('path', { d: `${pad([P([w0x, 0, 0.02]), P([w1x, 0, 0.02])])}M${r(wl[0])} ${r(wl[1])}L${r(wp[0])} ${r(wp[1])}L${r(wr[0])} ${r(wr[1])}Z`, class: 'fb-wind' }));
    const wt = P([(w0x + w1x) / 2, 0, 0.32]);
    g.append(s('text', { x: r(wt[0]), y: r(wt[1]), class: 'fb-label blauw', 'text-anchor': 'middle' }, 'wind'));

    // what stands up, back to front; the pieces of one roof side together, inner first when you look from outside
    const maak = (d) => {
      const stijl = d.op != null && d.op < 1 ? `opacity:${r(d.op)}` : null;
      if (d.soort === 'stok') {
        const [a, b] = [P(d.a), P(d.b)]; const dik = Math.max(1.6, d.dik * M.schaal * (a[3] + b[3]) / 2);
        return s('g', { class: `sh-stok${d.kleur ? ` ${d.kleur}` : ''}`, style: stijl },
          s('path', { d: pad([a, b]), 'stroke-width': r(dik) }),
          s('path', { d: pad([a, b]), class: 'sh-glans', 'stroke-width': r(dik * 0.35) }));
      }
      if (d.soort === 'vlak') {
        const n = normaal(d.pts);
        const f = Math.abs(dot(n, licht));
        const pad2 = `${pad(d.pts.map(P))}Z${d.gat ? `${pad(d.gat.map(P))}Z` : ''}`;
        return s('path', { d: pad2, class: `sh-vlak ${d.kleur}${d.klasse ? ` ${d.klasse}` : ''}`, 'fill-rule': 'evenodd',
          style: `fill: color-mix(in srgb, var(--sh-licht) ${Math.round(8 + 42 * f)}%, var(--sh-${d.kleur}))${stijl ? `;${stijl}` : ''}` });
      }
      if (d.soort === 'bol') {
        const [x, y, , k] = P(d.p);
        return s('circle', { cx: r(x), cy: r(y), r: r(d.r * M.schaal * k), class: d.kleur === 'steen' ? 'sh-steen' : 'fb-hoofd', style: stijl });
      }
      // a fire: flames that always face you
      const [x, y, , k] = P(d.p); const q = d.grootte * M.schaal * k;
      return s('g', { style: stijl },
        s('path', { d: `M${r(x - q * 0.45)} ${r(y)}Q${r(x - q * 0.5)} ${r(y - q * 0.6)} ${r(x - q * 0.1)} ${r(y - q)}Q${r(x + q * 0.05)} ${r(y - q * 0.5)} ${r(x + q * 0.2)} ${r(y - q * 0.75)}Q${r(x + q * 0.55)} ${r(y - q * 0.4)} ${r(x + q * 0.45)} ${r(y)}Z`, class: 'sh-vuur' }),
        s('path', { d: `M${r(x - q * 0.2)} ${r(y)}Q${r(x - q * 0.2)} ${r(y - q * 0.35)} ${r(x)} ${r(y - q * 0.55)}Q${r(x + q * 0.25)} ${r(y - q * 0.3)} ${r(x + q * 0.2)} ${r(y)}Z`, class: 'sh-vuur-hart' }));
    };
    const diepte = (d) => {
      const pts = d.soort === 'stok' ? [d.a, d.b] : d.soort === 'vlak' ? d.pts : [d.p];
      return pts.reduce((som, p) => som + P(p)[2], 0) / pts.length;
    };
    // A roof side you see from inside goes first, then what is under the roof, then the rest back to front. A roof
    // side you see from outside hides what is inside; its pieces go inner first, so the leaves lie over the branches.
    const groepen = new Map(); const binnenkant = []; const binnen = []; const rest = [];
    for (const d of delen) {
      if (d.eenzijdig && dot(d.eenzijdig, oog) <= 0) continue;
      if (d.plat) { g.append(maak(d)); continue; }
      if (!d.groep) { (d.binnen ? binnen : rest).push([diepte(d), [d]]); continue; }
      if (!groepen.has(d.groep.id)) groepen.set(d.groep.id, { g: d.groep, delen: [] });
      groepen.get(d.groep.id).delen.push(d);
    }
    for (const { g: gr, delen: dd } of groepen.values()) {
      const buiten = dot(gr.n, oog) > 0;
      if (buiten && gr.dicht) continue;                         // hidden under the heap
      dd.sort((x, y) => (buiten ? x.laag - y.laag : y.laag - x.laag));
      (buiten ? rest : binnenkant).push([P(gr.m)[2], dd]);
    }
    for (const lijst of [binnenkant, binnen, rest]) lijst.sort((x, y) => y[0] - x[0]).forEach(([, dd]) => dd.forEach((d) => g.append(maak(d))));

    for (const [p, tekst] of labels) {
      const [x, y] = P(p);
      g.append(s('text', { x: r(x), y: r(y), class: 'fb-label', 'text-anchor': 'middle' }, tekst));
    }
    svg.replaceChildren(g);
    svg.setAttribute('aria-label', `${M.label} in 3D, ${Math.round(t * 100)} procent gebouwd, je kijkt ${kant()}.`);
  }

  function stapTekst() {
    if (t <= 0.001) return M.stappen[0].tekst;
    if (t >= 0.999) return M.klaar;
    return M.stappen.find((st, i) => i > 0 && t <= st.t + 0.001).tekst;
  }

  /** Says the step (when it changed) and the side you look from. */
  function zeg() {
    const tekst = stapTekst();
    if (tekst !== gezegd) { stap.textContent = tekst; gezegd = tekst; }
    zicht.textContent = `Je kijkt ${kant()}.`;
  }

  function zet(nt) {
    t = klem(nt);
    balk.zet(plekVan(t));
    teken(); zeg();
  }

  function stop() {
    if (speel) cancelAnimationFrame(speel);
    speel = 0; zetActie(speelKnop, 'Speel af', 'start');
  }

  function speelAf() {
    if (verminder()) {                // no movement: jump to the next step
      const volgende = M.stappen.find((st) => st.t > t + 0.001);
      zet(volgende ? volgende.t : 0);
      return;
    }
    if (t >= 0.999) t = 0;
    let vorige = null;
    const duur = 2200 * (M.stappen.length - 1);
    zetActie(speelKnop, 'Stop', 'stop');
    const tik = (nu) => {
      if (!svg.isConnected) { speel = 0; return; }
      if (vorige != null) zet(t + (nu - vorige) / duur);
      vorige = nu;
      if (t < 1) speel = requestAnimationFrame(tik); else stop();
    };
    speel = requestAnimationFrame(tik);
  }

  // turn the view: drag (pointer capture, so no listeners on window) or arrow keys
  svg.addEventListener('pointerdown', (e) => {
    sleep = { x: e.clientX, y: e.clientY, d: draai, a: hoek };
    svg.setPointerCapture(e.pointerId);
    svg.classList.add('sleept');
  });
  svg.addEventListener('pointermove', (e) => {
    if (!sleep) return;
    const breedte = svg.getBoundingClientRect().width || W;
    draai = sleep.d - ((e.clientX - sleep.x) / breedte) * Math.PI * 1.4;
    hoek = klem(sleep.a + ((e.clientY - sleep.y) / breedte) * 2.2, 0.12, 1.4);
    teken();
  });
  const los = () => { if (sleep) { sleep = null; svg.classList.remove('sleept'); zeg(); } };
  svg.addEventListener('pointerup', los);
  svg.addEventListener('pointercancel', los);
  svg.addEventListener('keydown', (e) => {
    const stap15 = Math.PI / 12;
    if (e.key === 'ArrowLeft') draai += stap15;
    else if (e.key === 'ArrowRight') draai -= stap15;
    else if (e.key === 'ArrowUp') hoek = klem(hoek + stap15 / 1.5, 0.12, 1.4);
    else if (e.key === 'ArrowDown') hoek = klem(hoek - stap15 / 1.5, 0.12, 1.4);
    else return;
    e.preventDefault();
    teken(); zeg();
  });

  zet(0);
  return h('div.kd.naast.doe-shelter',
    h('div.fb-beeld', svg, h('p.doe-stil.fb-hint', 'Sleep het beeld om rond te kijken (of gebruik de pijltjestoetsen).')),
    h('div.kd-tekst',
      stap,
      h('div.doe-label', h('span', 'Stap voor stap'), balk.el),
      h('div.knop-rij.fb-zichten', M.zichten.map(zichtKnop)),
      acties(speelKnop),
      zicht));
}
