// A pioneering structure from modellen.js as a small 3D scene (three.js, loaded only with this piece): wooden poles
// with end grain, a lashing at every joint that has the shape of its kind, guy lines to pegs, a ground that fades
// into the page, soft light and a shadow. All parts of one build step and one material are merged into one mesh, so
// a structure is a few dozen draw calls. Drag to turn, pinch or scroll to zoom, arrow keys and + and −; it renders
// only when something changes, caps the pixel ratio at 2, follows the size of its box, and frees the GPU when gone.
// A model may have parts that move (model.beweging: a hinge that turns, or a part that slides, set from 0 to 1 by a
// slider): those parts sit in a group of their own that turns as a whole; a rope from a moving part to a fixed
// point (`volgt`) is drawn again when the part moves.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, HemisphereLight, DirectionalLight, Mesh, Group,
  MeshLambertMaterial, MeshBasicMaterial, BufferGeometry, Float32BufferAttribute, CanvasTexture, SRGBColorSpace,
  RepeatWrapping, PCFShadowMap, DoubleSide, Vector3, IcosahedronGeometry, Quaternion,
} from 'three';
import { plus, min, keer, punt, lengte, eenheid, kruis, SOORTEN } from './modellen.js';

const TAU = Math.PI * 2;
const RR = 0.005;             // sjortouw of 10 mm; a lashing takes rope of about a tenth of the radius of its poles (rrVoor)
/** The rope radius for a lashing on poles of radius r: 8–12 mm rope on poles of 8–15 cm. */
const rrVoor = (r) => Math.min(0.0065, Math.max(0.0035, r * 0.11));

// -- geometry, collected per material and step in plain arrays and merged into one BufferGeometry ---------------

class Bak {
  constructor() { this.p = []; this.n = []; this.uv = []; this.c = []; this.i = []; }
  get aantal() { return this.p.length / 3; }
  v(p, n, u, v, c) { this.p.push(p[0], p[1], p[2]); this.n.push(n[0], n[1], n[2]); this.uv.push(u, v); this.c.push(c[0], c[1], c[2]); return this.aantal - 1; }
  geo() {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new Float32BufferAttribute(this.uv, 2));
    g.setAttribute('color', new Float32BufferAttribute(this.c, 3));
    g.setIndex(this.i);
    g.computeBoundingSphere();
    return g;
  }
}

/** Two unit vectors perpendicular to w and to each other. */
function basis(w) {
  const a = Math.abs(w[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = eenheid(kruis(w, a));
  return [u, kruis(w, u)];
}

/** A cylinder from a to b (radius r1 at a, r2 at b), its sides mapped on the grain of the wood atlas, with end caps. */
function cilinder(bak, a, b, r1, r2, seg, kleur, { kappen = true, kapKleur = kleur, uvZij = [0, 0.5, 1, 1] } = {}) {
  const w = eenheid(min(b, a)); const [u, v] = basis(w);
  const start = bak.aantal;
  const helling = (r1 - r2) / (lengte(min(b, a)) || 1);
  for (let i = 0; i <= seg; i++) {
    const t = (i / seg) * TAU; const d = plus(keer(u, Math.cos(t)), keer(v, Math.sin(t)));
    const n = eenheid(plus(d, keer(w, helling)));
    const uu = uvZij[0] + (uvZij[2] - uvZij[0]) * (i / seg);
    bak.v(plus(a, keer(d, r1)), n, uu, uvZij[1], kleur);
    bak.v(plus(b, keer(d, r2)), n, uu, uvZij[3], kleur);
  }
  for (let i = 0; i < seg; i++) {
    const k = start + i * 2;
    bak.i.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
  }
  if (!kappen) return;
  for (const [c, r, nn] of [[a, r1, keer(w, -1)], [b, r2, w]]) {
    const m = bak.v(c, nn, 0.25, 0.25, kapKleur);
    for (let i = 0; i <= seg; i++) {
      const t = (i / seg) * TAU; const d = plus(keer(u, Math.cos(t)), keer(v, Math.sin(t)));
      bak.v(plus(c, keer(d, r)), nn, 0.25 + Math.cos(t) * 0.23, 0.25 + Math.sin(t) * 0.23, kapKleur);
    }
    for (let i = 0; i < seg; i++) {
      if (nn === w) bak.i.push(m, m + 1 + i, m + 2 + i); else bak.i.push(m, m + 2 + i, m + 1 + i);
    }
  }
}

/** A box around centre c with half sizes h along the axes x, y, z (unit vectors); the wood grain runs along x. */
function doos(bak, c, h, x, y, z, kleur) {
  const neg = (a) => keer(a, -1);
  // each face: its normal, two axes in the face, and the half sizes along those
  const vlakken = [
    [y, x, z, h[1], h[0], h[2]], [neg(y), x, neg(z), h[1], h[0], h[2]],
    [z, x, y, h[2], h[0], h[1]], [neg(z), x, neg(y), h[2], h[0], h[1]],
    [x, z, y, h[0], h[2], h[1]], [neg(x), neg(z), y, h[0], h[2], h[1]],
  ];
  for (const [n, s, t, hn, hs, ht] of vlakken) {
    const m = plus(c, keer(n, hn)); const k = bak.aantal;
    for (const [i, j] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      bak.v(plus(plus(m, keer(s, i * hs)), keer(t, j * ht)), n, 0.05 + 0.9 * (j + 1) / 2, 0.55 + 0.4 * (i + 1) / 2, kleur);
    }
    // wind so the face looks along n
    if (punt(kruis(s, t), n) > 0) bak.i.push(k, k + 1, k + 2, k, k + 2, k + 3); else bak.i.push(k, k + 2, k + 1, k, k + 3, k + 2);
  }
}

/** Points through pts, made round with a Catmull-Rom curve (k points per segment). */
function glad(pts, gesloten, k = 3) {
  const n = pts.length; if (n < 3) return pts;
  const get = (i) => (gesloten ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const uit = [];
  const tot = gesloten ? n : n - 1;
  for (let i = 0; i < tot; i++) {
    const p0 = get(i - 1); const p1 = get(i); const p2 = get(i + 1); const p3 = get(i + 2);
    for (let j = 0; j < k; j++) {
      const t = j / k; const t2 = t * t; const t3 = t2 * t;
      uit.push([0, 1, 2].map((q) => 0.5 * ((2 * p1[q]) + (-p0[q] + p2[q]) * t + (2 * p0[q] - 5 * p1[q] + 4 * p2[q] - p3[q]) * t2 + (-p0[q] + 3 * p1[q] - 3 * p2[q] + p3[q]) * t3)));
    }
  }
  if (!gesloten) uit.push(pts[n - 1]);
  return uit;
}

/** A rope along pts: a tube of radius r with `seg` sides; u runs along the rope (for the twist of the strands). */
function buis(bak, ruw, r, gesloten, kleur, seg = 5) {
  const pts = [];
  for (const p of ruw) if (!pts.length || lengte(min(p, pts[pts.length - 1])) > 1e-4) pts.push(p);
  if (gesloten && pts.length > 2) pts.push(pts[0]);
  const n = pts.length; if (n < 2) return;
  const T = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)]; const b = pts[Math.min(n - 1, i + 1)];
    if (gesloten && (i === 0 || i === n - 1)) return eenheid(min(pts[1], pts[n - 2]));
    return eenheid(min(b, a));
  });
  let N = basis(T[0])[0];
  let s = 0;
  const start = bak.aantal;
  for (let i = 0; i < n; i++) {
    if (i) { s += lengte(min(pts[i], pts[i - 1])); N = eenheid(min(N, keer(T[i], punt(N, T[i])))); }
    const B = kruis(T[i], N);
    for (let j = 0; j <= seg; j++) {
      const t = (j / seg) * TAU; const d = plus(keer(N, Math.cos(t)), keer(B, Math.sin(t)));
      bak.v(plus(pts[i], keer(d, r)), d, s / 0.045, j / seg, kleur);
    }
  }
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < seg; j++) {
      const a = start + i * (seg + 1) + j; const b = a + seg + 1;
      bak.i.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
}

/** A rounded rectangle (superellipse) around c in the plane of a1, a2, half sizes h1, h2. */
function ovaal(c, a1, a2, h1, h2, n = 18, macht = 0.4) {
  const uit = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU; const co = Math.cos(t); const si = Math.sin(t);
    uit.push(plus(c, plus(keer(a1, h1 * Math.sign(co) * Math.abs(co) ** macht), keer(a2, h2 * Math.sign(si) * Math.abs(si) ** macht))));
  }
  return uit;
}

/** Convex hull (monotone chain) of 2D points. */
function omhulsel(ps) {
  const p = [...ps].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const x = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const onder = []; for (const q of p) { while (onder.length >= 2 && x(onder[onder.length - 2], onder[onder.length - 1], q) <= 0) onder.pop(); onder.push(q); }
  const boven = []; for (const q of [...p].reverse()) { while (boven.length >= 2 && x(boven[boven.length - 2], boven[boven.length - 1], q) <= 0) boven.pop(); boven.push(q); }
  return [...onder.slice(0, -1), ...boven.slice(0, -1)];
}

/** A closed 2D polygon resampled to m points at equal distances. */
function herbemonster(poly, m) {
  const n = poly.length; const lens = []; let tot = 0;
  for (let i = 0; i < n; i++) { const a = poly[i]; const b = poly[(i + 1) % n]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]); lens.push(l); tot += l; }
  const uit = []; let i = 0; let acc = 0;
  for (let k = 0; k < m; k++) {
    const d = (k / m) * tot;
    while (acc + lens[i] < d && i < n - 1) { acc += lens[i]; i++; }
    const t = lens[i] ? (d - acc) / lens[i] : 0; const a = poly[i]; const b = poly[(i + 1) % n];
    uit.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return uit;
}

// -- the poles of a model, and where their axes meet ------------------------------------------------------------

function paalInfo(p) { const as = min(p.b, p.a); const L = lengte(as); return { ...p, r: p.d / 2, dir: keer(as, 1 / L), L }; }

/** The closest points on the axes (infinite lines) of two poles. */
function dichtst(A, B) {
  const w0 = min(A.a, B.a); const a = punt(A.dir, A.dir); const b = punt(A.dir, B.dir); const c = punt(B.dir, B.dir);
  const d = punt(A.dir, w0); const e = punt(B.dir, w0); const nn = a * c - b * b;
  const s = Math.abs(nn) < 1e-9 ? 0 : (b * e - c * d) / nn; const t = Math.abs(nn) < 1e-9 ? e / c : (a * e - b * d) / nn;
  return [plus(A.a, keer(A.dir, s)), plus(B.a, keer(B.dir, t))];
}

/** Where the axis of a pole passes the plane through c with normal w. */
function snijpunt(P, c, w) { const t = punt(min(c, P.a), w) / (punt(P.dir, w) || 1e-6); return plus(P.a, keer(P.dir, t)); }

/** A helix of `slagen` turns round the hull of some circles in the plane through c with normal w: a band of rope. */
function band(c, w, cirkels, slagen, { rr = RR, m = 16 } = {}) {
  const [e1, e2] = basis(w);
  const pts2 = [];
  for (const k of cirkels) {
    const q = min(k.q, c); const x = punt(q, e1); const y = punt(q, e2);
    for (let i = 0; i < 16; i++) { const t = (i / 16) * TAU; pts2.push([x + Math.cos(t) * (k.r + rr), y + Math.sin(t) * (k.r + rr)]); }
  }
  const lus = herbemonster(omhulsel(pts2), m);
  const spoed = rr * 2.1; const uit = [];
  for (let t = 0; t <= slagen * m; t++) {
    const [x, y] = lus[t % m]; const off = (t / m - slagen / 2) * spoed;
    uit.push(plus(c, plus(plus(keer(e1, x), keer(e2, y)), keer(w, off))));
  }
  return { pad: uit, hoog: slagen * spoed, lus, e1, e2 };
}

/** Frapping (woelen) between two circles of a band: loops through the gap, round all the turns. */
function woelen(c, w, k1, k2, hoog, n = 2, rr = RR) {
  const g = keer(plus(k1.q, k2.q), 0.5); const dij = eenheid(min(k2.q, k1.q)); const m = eenheid(kruis(w, dij));
  const uit = [];
  for (let i = 0; i < n; i++) {
    const o = plus(g, keer(dij, (i - (n - 1) / 2) * rr * 2.1));
    uit.push({ pad: ovaal(o, w, m, hoog / 2 + 2.6 * rr, Math.max(k1.r, k2.r) + 2.6 * rr, 12, 0.35), dicht: true });
  }
  return uit;
}

/** A mastworp round a pole at point p: two turns crossing over each other, and a short end. */
function ring(P, p, rr = RR) {
  const t = punt(min(p, P.a), P.dir); const c = plus(P.a, keer(P.dir, t));
  const [u, v] = basis(P.dir); const R = P.r + rr; const uit = []; const m = 11;
  for (let i = 0; i <= 2 * m; i++) {
    const a = (i / m) * TAU; const off = (i / (2 * m) - 0.5) * rr * 4.4;
    uit.push(plus(c, plus(plus(keer(u, Math.cos(a) * R), keer(v, Math.sin(a) * R)), keer(P.dir, off))));
  }
  uit.push(plus(plus(c, keer(u, R + rr)), keer(P.dir, rr * 4)), plus(plus(c, keer(u, R + rr * 2)), keer(P.dir, rr * 10)));
  return uit;
}

/**
 * The rope of one lashing: a list of paths ({ pad, dicht }), and extra wood (the woelhout). The shape tells the kind:
 * a kruissjorring has square turns round the crossing, a diagonaalsjorring an X, an achtsjorring weaves in eights,
 * a vork- or steigersjorring is a band round both poles, and every lashing that has it gets its woelslagen.
 */
function sjorring(s, P) {
  const paden = []; const hout = [];
  const voeg = (pad, dicht = false) => paden.push({ pad, dicht });
  // a kind of its own may borrow the shape of another (a loose strop as a hinge looks like a diagonaalsjorring)
  const soort = s.vorm ?? s.soort;
  const straal = s.palen.length ? Math.min(...s.palen.map((i) => P[i].r)) : s.r ? 0.06 : 0.03;
  const rr = rrVoor(soort === 'ton' ? P[s.palen[0]].r : straal);
  if (soort === 'kruis' || soort === 'diagonaal') {
    const A = P[s.palen[0]]; const B = P[s.palen[1]];
    const [pA, pB] = dichtst(A, B);
    let n = min(pB, pA); let hh = lengte(n);
    if (hh < 1e-4) { n = eenheid(kruis(A.dir, B.dir)); hh = 0; } else n = keer(n, 1 / hh);
    const u = A.dir; const bv = B.dir; const rA = A.r; const rB = B.r;
    const Q = (b, uu, nn) => plus(plus(plus(pA, keer(bv, b)), keer(u, uu)), keer(n, nn));
    const terug = -(rA + rr); const sq = 0.72;
    if (soort === 'kruis') {
      const pad = [];
      for (let k = 0; k < 3; k++) {
        const sb = rA + rr * (1.05 + 2.05 * k); const t = rB + rr * (1.05 + 2.05 * k); const top = hh + rB + rr;
        const over = (b, van) => [Q(b, van * t, hh), Q(b, van * t * sq, hh + (rB + rr) * sq), Q(b, 0, top), Q(b, -van * t * sq, hh + (rB + rr) * sq), Q(b, -van * t, hh)];
        const achter = (uu, van) => [Q(van * sb, uu, 0), Q(van * sb * sq, uu, terug * sq), Q(0, uu, terug), Q(-van * sb * sq, uu, terug * sq), Q(-van * sb, uu, 0)];
        pad.push(...over(-sb, 1), ...achter(-t, -1), ...over(sb, -1), ...achter(t, 1));
      }
      voeg(pad);
      const S = rA + rr * 6.4; const T = rB + rr * 6.4; const nf = (rA + hh - rB) / 2;
      for (let j = 0; j < 2; j++) {
        const c = plus(pA, keer(n, nf + (j - 0.5) * rr * 1.6));
        voeg(ovaal(c, bv, u, S + j * rr * 1.6, T + j * rr * 1.6, 12, 0.3), true);
      }
      voeg(ring(A, Q(0, -(rB + rr * 7.6), 0), rr));
      // the end mastworp on the outside: towards the nearer end of B (on a ladder: outside the bomen)
      const naarEind = punt(min(pB, keer(plus(B.a, B.b), 0.5)), bv) >= 0 ? 1 : -1;
      voeg(ring(B, plus(pB, keer(bv, naarEind * (rA + rr * 7.6))), rr));
    } else {
      const d1 = eenheid(plus(u, bv)); const e1 = eenheid(min(u, bv));
      const L = (rA + rB) * 1.05 + rr; const top = hh + rB + rr;
      for (const [d, e] of [[d1, e1], [e1, d1]]) {
        const pad = [];
        for (let k = 0; k < 3; k++) {
          const c = plus(pA, keer(d, (k - 1) * rr * 2.2));
          pad.push(...ovaal(plus(c, keer(n, (top + terug) / 2)), e, n, L, (top - terug) / 2, 12, 0.45));
        }
        voeg(pad);
      }
      const nf = (rA + hh - rB) / 2; const S = (rA + rB) * 1.25 + rr * 3;
      for (let j = 0; j < 2; j++) voeg(ovaal(plus(pA, keer(n, nf + (j - 0.5) * rr * 1.6)), d1, e1, S + j * rr * 2, S * 0.75 + j * rr * 2, 12, 0.3), true);
      voeg(ring(A, Q(0, -(L + rr * 4), 0), rr));
    }
  } else if (soort === 'acht' || soort === 'vork') {
    const palen = s.palen.map((i) => P[i]);
    let w = [0, 0, 0];
    for (const p of palen) w = plus(w, punt(p.dir, palen[0].dir) < 0 ? keer(p.dir, -1) : p.dir);
    w = eenheid(w);
    const c = s.p;
    const cirkels = palen.map((p) => ({ q: snijpunt(p, c, w), r: p.r }));
    const b = band(c, w, cirkels, soort === 'acht' ? 5 : 4, { rr });
    voeg(glad(b.pad, false, 1));
    // woelslagen between neighbours (in the order round the band)
    const paren = cirkels.length === 2 ? [[0, 1]] : [[0, 1], [1, 2], [2, 0]];
    for (const [i, j] of paren) for (const x of woelen(c, w, cirkels[i], cirkels[j], b.hoog, 3, rr)) voeg(x.pad, true);
    voeg(ring(palen[0], plus(c, keer(w, -(b.hoog / 2 + rr * 3))), rr));
    if (s.nok != null) {
      // a third pole lying across the fork (the ridge of an eetshelter): the eights also go over it
      const N = P[s.nok]; const q = snijpunt(N, c, N.dir);
      const op = eenheid(min(q, c)); const zij = eenheid(kruis(N.dir, op));
      const hb = keer(plus(q, c), 0.5);
      const sep = Math.max(...cirkels.map((k) => Math.abs(punt(min(k.q, c), zij)))) + palen[0].r;
      for (let k = 0; k < 3; k++) {
        voeg(ovaal(plus(hb, keer(N.dir, (k - 1) * rr * 2.1)), op, zij, lengte(min(q, c)) / 2 + N.r + rr, sep + rr * (1 + k * 0.4), 14, 0.5), true);
      }
    }
  } else if (soort === 'acht-liggend') {
    // three poles side by side: over, under, over, round the last, back under, over, under, round the first
    const palen = s.palen.map((i) => P[i]);
    const w = palen[0].dir; const c = snijpunt(palen[0], s.p, w);
    const qs = palen.map((p) => snijpunt(p, c, w));
    const [e1] = basis(w); const op = [0, 1, 0]; const zij = eenheid(min(qs[qs.length - 1], qs[0]));
    const R = palen[0].r + rr; const pad = [];
    const at = (q, z, off) => plus(plus(q, keer(op, z)), keer(w, off));
    for (let cyc = 0; cyc < 3; cyc++) {
      const o = (cyc - 1) * rr * 4.4;
      qs.forEach((q, i) => {
        if (i) pad.push(at(keer(plus(q, qs[i - 1]), 0.5), 0, o));
        pad.push(at(q, (i % 2 ? -R : R), o));
      });
      pad.push(at(plus(qs[qs.length - 1], keer(zij, R)), 0, o + rr * 1.1));
      for (let i = qs.length - 1; i >= 0; i--) {
        pad.push(at(qs[i], (i % 2 ? R : -R), o + rr * 2.2));
        if (i) pad.push(at(keer(plus(qs[i], qs[i - 1]), 0.5), 0, o + rr * 2.2));
      }
      pad.push(at(plus(qs[0], keer(zij, -R)), 0, o + rr * 3.3));
    }
    voeg(glad(pad, false, 3));
    const cirkels = palen.map((p, i) => ({ q: qs[i], r: p.r }));
    for (let i = 0; i < qs.length - 1; i++) for (const x of woelen(c, w, cirkels[i], cirkels[i + 1], rr * 13, 2, rr)) voeg(x.pad, true);
    voeg(ring(palen[0], plus(c, keer(w, -rr * 10)), rr));
    void e1;
  } else if (soort === 'steiger') {
    const [M, S] = s.palen.map((i) => P[i]); const w = M.dir; const c = s.p;
    const b = band(c, w, [{ q: snijpunt(M, c, w), r: M.r }, { q: snijpunt(S, c, w), r: S.r }], 7, { rr });
    voeg(glad(b.pad, false, 1));
  } else if (soort === 'woel') {
    const [Lg, Rb] = s.palen.map((i) => P[i]); const w = Lg.dir; const c = s.p;
    const qL = snijpunt(Lg, c, w); const qR = snijpunt(Rb, c, w);
    const b = band(qL, w, [{ q: qL, r: Lg.r }, { q: qR, r: Rb.r }], 3, { m: 18, rr });
    voeg(glad(b.pad, false, 1));
    // the woelhout: twisted in the loop, then laid along the rib and tied
    const op = plus(qR, [0, Rb.r + 0.014, 0]);
    hout.push({ a: plus(op, keer(w, 0.02)), b: plus(op, keer(w, 0.3)), r: 0.009 });
  } else if (soort === 'ton') {
    const [Lb] = s.palen.map((i) => P[i]); const w = [1, 0, 0];
    for (const dx of [-0.22, 0.22]) {
      const c = plus(s.p, [dx, 0, 0]);
      const b = band(c, w, [{ q: c, r: s.tonR }, { q: snijpunt(Lb, c, w), r: Lb.r }], 3, { m: 26, rr });
      voeg(glad(b.pad, false, 1));
    }
  } else if (soort === 'stam') {
    // the ropes round the end of the log: a few turns
    const b = band(s.p, [1, 0, 0], [{ q: s.p, r: s.r }], 3, { m: 28, rr });
    voeg(glad(b.pad, false, 1));
  } else if (soort === 'boom') {
    const w = [0, 1, 0]; const c = s.p;
    const cirkels = [{ q: [s.boom.c[0], c[1], s.boom.c[2]], r: s.boom.r }, ...s.palen.map((i) => ({ q: snijpunt(P[i], c, w), r: P[i].r }))];
    const b = band(c, w, cirkels, 4, { m: 30, rr });
    voeg(glad(b.pad, false, 1));
  } else if (soort === 'slinger') {
    const a = s.van; const e = s.naar; const as = eenheid(min(e, a)); const [u, v] = basis(as);
    for (const k of [-1, 0, 1]) voeg([plus(a, keer(u, k * rr * 1.6)), plus(e, keer(u, k * rr * 1.6))]);
    const mid = keer(plus(a, e), 0.5); const pad = [];
    for (let i = 0; i <= 4 * 12; i++) {
      const t = (i / 12) * TAU; const off = (i / 48 - 0.5) * rr * 9;
      pad.push(plus(mid, plus(plus(keer(u, Math.cos(t) * rr * 3.2), keer(v, Math.sin(t) * rr * 3.2)), keer(as, off))));
    }
    voeg(pad);
  } else if (soort === 'mastworp') {
    voeg(ring(P[s.palen[0]], s.p, rr));
  }
  return { paden, hout, rr };
}

// -- textures --------------------------------------------------------------------------------------------------

function rng(seed) { let x = seed >>> 0 || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 10000) / 10000; }; }

/** The wood: grain in the top half (along the pole), end grain with rings in the bottom left. */
function houtTextuur() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const x = c.getContext('2d'); const r = rng(7);
  x.fillStyle = '#c99d6c'; x.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 90; i++) {
    const px = r() * 256; const breed = 0.6 + r() * 2.2;
    x.strokeStyle = `rgba(${90 + r() * 40},${55 + r() * 25},${30 + r() * 15},${0.18 + r() * 0.3})`;
    x.lineWidth = breed; x.beginPath(); x.moveTo(px, 0);
    for (let y = 0; y <= 128; y += 16) x.lineTo(px + Math.sin(y * 0.05 + i) * 2.5, y);
    x.stroke();
  }
  for (let i = 0; i < 14; i++) { x.fillStyle = 'rgba(80,50,25,0.35)'; x.beginPath(); x.ellipse(r() * 256, r() * 128, 1.5 + r() * 2, 4 + r() * 5, 0, 0, TAU); x.fill(); }
  // end grain
  x.fillStyle = '#e2c79c'; x.fillRect(0, 128, 128, 128);
  for (let k = 1; k < 13; k++) {
    x.strokeStyle = `rgba(150,105,60,${0.25 + 0.25 * (k % 2)})`; x.lineWidth = 1.6;
    x.beginPath(); x.arc(64 + r() * 2, 192 + r() * 2, k * 4.9, 0, TAU); x.stroke();
  }
  x.strokeStyle = 'rgba(120,80,40,0.35)'; x.lineWidth = 1.2;
  x.beginPath(); x.moveTo(64, 192); x.lineTo(64 + 50, 192 - 18); x.stroke();
  x.fillStyle = '#c99d6c'; x.fillRect(128, 128, 128, 128);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 4;
  return t;
}

/** Rope: light twisted strands, coloured by the vertex colour (so a lashing can light up). */
function touwTextuur() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const x = c.getContext('2d');
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, 64, 64);
  for (let i = -2; i < 4; i++) {
    const g = x.createLinearGradient(0, 0, 32, 32);
    g.addColorStop(0, '#e4e4e4'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(1, '#cfcfcf');
    x.fillStyle = g; x.beginPath();
    x.moveTo(i * 21.3, 0); x.lineTo(i * 21.3 + 12, 0); x.lineTo(i * 21.3 + 12 + 64, 64); x.lineTo(i * 21.3 + 64, 64); x.fill();
  }
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.wrapS = RepeatWrapping; t.wrapT = RepeatWrapping;
  return t;
}

function grondTextuur() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, '#fff'); g.addColorStop(0.6, '#fff'); g.addColorStop(1, '#000');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

function bordTextuur(tekst) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 120;
  const x = c.getContext('2d');
  x.fillStyle = '#b98a56'; x.fillRect(0, 0, 512, 120);
  for (let i = 0; i < 6; i++) { x.fillStyle = `rgba(90,55,25,${0.1 + i * 0.02})`; x.fillRect(0, i * 20 + 8, 512, 1.5); }
  x.fillStyle = '#3a2412'; x.font = '800 64px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(tekst, 256, 64);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace;
  return t;
}

// -- colours ------------------------------------------------------------------------------------------------------

const lin = (hex) => { const c = new Color(hex); return [c.r, c.g, c.b]; };
const TOUW = { draagtouw: lin('#e6d3a8'), sjor: lin('#f3ead2'), tui: lin('#ecd3a3'), brugtouw: lin('#e6d3a8'), kabel: lin('#e9643a'), rem: lin('#2f6fd0'), lijn: lin('#f4f1e8'), ketting: lin('#3d3f44'), binnenband: lin('#2a2c30'), lint: lin('#d9452f') };

/**
 * Build the scene for `model` in the element `plek`.
 * @param opties.beweging whether parts may drop in (prefers-reduced-motion off)
 * @param opties.kleuren { achter, accent, donker } from the CSS tokens
 * @param opties.opKies (index or -1) => void, when a part is tapped
 * @param opties.opZicht () => void, after the view turned (to update the label)
 */
export function maakScene(plek, model, { beweging, kleuren, opKies }) {
  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  const canvas = renderer.domElement;
  canvas.className = 'bw-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  plek.prepend(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(45, 4 / 3, 0.05, 200);
  const hemi = new HemisphereLight(0xffffff, 0x556644, 1.0);
  const zon = new DirectionalLight(0xfff4e0, 1.7);
  zon.castShadow = true; zon.shadow.mapSize.set(1024, 1024); zon.shadow.radius = 3; zon.shadow.bias = -0.0004; zon.shadow.normalBias = 0.02;
  scene.add(hemi, zon, zon.target);

  // -- the parts, merged per material and step
  const P = model.palen.map(paalInfo);
  const textuur = { hout: houtTextuur(), touw: touwTextuur(), grond: grondTextuur() };
  const MAT = {
    hout: new MeshLambertMaterial({ map: textuur.hout, vertexColors: true }),
    touw: new MeshLambertMaterial({ map: textuur.touw, vertexColors: true }),
    effen: new MeshLambertMaterial({ vertexColors: true }),
    gloed: new MeshBasicMaterial({ vertexColors: true }),
    vlag: new MeshLambertMaterial({ vertexColors: true, side: DoubleSide }),
  };
  const bakken = new Map();
  // the moving part (model.beweging) the part being built belongs to, if any: it goes in a mesh of its own
  let nuBeweeg = null;
  const bakVoor = (mat, stap, tot) => {
    const k = `${mat}|${stap}|${tot ?? ''}|${nuBeweeg ?? ''}`;
    if (!bakken.has(k)) bakken.set(k, { mat, stap, tot, beweeg: nuBeweeg, bak: new Bak() });
    return bakken.get(k).bak;
  };
  const r = rng(11);
  const tint = (k = 1) => { const t = (0.88 + r() * 0.2) * k; return [t, t * 0.98, t * 0.95]; };

  for (const p of P) {
    const seg = p.d >= 0.1 ? 10 : 7;
    nuBeweeg = p.beweeg ?? null;
    // a pole that stands in the ground (ingegraven) is drawn from where it comes out: the ground is see-through
    let [a, e] = [p.a, p.b];
    const boven = (q, r) => { const t2 = (0 - q[1]) / (r[1] - q[1]); return plus(q, keer(min(r, q), t2)); };
    if (a[1] < 0 && e[1] > 0) a = boven(a, e); else if (e[1] < 0 && a[1] > 0) e = boven(e, a);
    const t = tint(); cilinder(bakVoor('hout', p.stap, p.tot), a, e, p.r, p.r * 0.94, seg, t, { kapKleur: t });
  }
  nuBeweeg = null;

  // the parts you can tap: lashings, lines, pegs, wedges. Each knows its vertex ranges (to colour it) and where it is
  const delen = [];
  const deel = (soort, x, info) => { delen.push({ soort, naam: x.naam ?? '', stap: x.stap, tot: x.tot, kopie: !!x.kopie, beweeg: x.beweeg ?? null, ...info }); };
  const pakken = (bak, f) => { const a = bak.aantal; f(); return { bak, van: a, tot: bak.aantal }; };
  // ropes from a moving part to a fixed point: their own mesh, drawn again whenever the part moves
  const losseLijnen = [];

  for (const s of model.sjor) {
    nuBeweeg = s.beweeg ?? null;
    const { paden, hout, rr } = sjorring(s, P);
    const bak = bakVoor('touw', s.stap, s.tot);
    const reeks = [pakken(bak, () => { for (const { pad, dicht } of paden) buis(bak, pad, rr, dicht, TOUW.sjor); })];
    if (hout.length) { const hb = bakVoor('hout', s.stap, s.tot); reeks.push(pakken(hb, () => { for (const h of hout) cilinder(hb, h.a, h.b, h.r, h.r, 6, tint(0.8)); })); }
    const alle = paden.flatMap((x) => x.pad);
    const c = keer(alle.reduce((a, b) => plus(a, b), [0, 0, 0]), 1 / alle.length);
    const straal = Math.min(0.5, Math.max(0.08, ...alle.map((q) => lengte(min(q, c)))));
    deel(s.soort === 'acht-liggend' ? 'acht' : s.soort, s, { reeks, punt: c, straal });
  }
  for (const l of model.lijnen) {
    const mat = l.soort === 'ketting' ? 'effen' : 'touw';
    const dik = l.dik ?? (l.soort === 'tui' ? 0.0045 : 0.004);
    const kleur = TOUW[l.soort] ?? TOUW.lijn; const seg = l.soort === 'ketting' ? 4 : 5;
    // every kind of rope with a blad can be tapped (tui, brugtouw, kabel, ... and the kinds models add)
    const tik = !!SOORTEN[l.soort]?.blad;
    if (l.volgt?.some(Boolean)) {
      const bak = new Bak();
      const x = { l, bak, dik, kleur, seg, deel: null };
      buis(bak, l.punten, dik, false, kleur, seg);
      losseLijnen.push(x);
      bakken.set(`los|${losseLijnen.length}`, { mat, stap: l.stap, tot: l.tot, beweeg: null, bak });
      if (tik) { deel(l.soort, l, { reeks: [{ bak, van: 0, tot: bak.aantal }], lijn: l.punten }); x.deel = delen[delen.length - 1]; }
      continue;
    }
    nuBeweeg = l.beweeg ?? null;
    const bak = bakVoor(mat, l.stap, l.tot);
    // a rope that hangs in a curve is made round; one over posts keeps its corners
    const pts = l.soort === 'brugtouw' ? glad(l.punten, false, 3) : l.punten;
    const reeks = [pakken(bak, () => buis(bak, pts, dik, false, kleur, seg))];
    if (tik) deel(l.soort, l, { reeks, lijn: l.punten });
  }
  for (const hr of model.haringen) {
    nuBeweeg = hr.beweeg ?? null;
    const bak = bakVoor('hout', hr.stap, hr.tot);
    const reeks = [pakken(bak, () => cilinder(bak, plus(hr.p, [0, -0.05, 0]), hr.kop, 0.028, 0.025, 6, tint(0.72), { kapKleur: tint(0.95) }))];
    deel(hr.soort ?? 'haring', hr, { reeks, punt: keer(plus(hr.p, hr.kop), 0.5), straal: 0.12 });
  }
  const extra = [];
  for (const d of model.dingen) { nuBeweeg = d.beweeg ?? null; bouwDing(d); }
  nuBeweeg = null;

  function bouwDing(d) {
    const x = [1, 0, 0]; const y = [0, 1, 0]; const z = [0, 0, 1];
    if (d.soort === 'plank') {
      doos(bakVoor('hout', d.stap, d.tot), d.p, [d.lang / 2, d.dik / 2, d.breed / 2], x, y, z, tint(1.08));
    } else if (d.soort === 'bord') {
      const bak = bakVoor('hout', d.stap, d.tot);
      doos(bak, d.p, [d.breed / 2, d.hoog / 2, 0.015], x, y, z, tint(1));
      const g = new BufferGeometry();
      const [cx, cy, cz] = d.p; const hx = d.breed / 2 - 0.02; const hy = d.hoog / 2 - 0.02; const zz = cz + 0.0165;
      g.setAttribute('position', new Float32BufferAttribute([cx - hx, cy - hy, zz, cx + hx, cy - hy, zz, cx + hx, cy + hy, zz, cx - hx, cy + hy, zz], 3));
      g.setAttribute('normal', new Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
      g.setAttribute('uv', new Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
      g.setIndex([0, 1, 2, 0, 2, 3]);
      const mesh = new Mesh(g, new MeshLambertMaterial({ map: bordTextuur(d.tekst) }));
      mesh.castShadow = true; extra.push({ mesh, stap: d.stap, tot: d.tot, beweeg: d.beweeg ?? null });
    } else if (d.soort === 'wiggen') {
      const bak = bakVoor('hout', d.stap, d.tot);
      const reeks = [pakken(bak, () => {
        for (const k of [-1, 1]) {
          const c = plus(d.p, [0, 0.03, k * (d.r * 0.55 + 0.008)]);
          doos(bak, c, [0.01, 0.06, 0.009], [1, 0, 0], [0, 1, 0], [0, 0, 1], tint(0.8));
        }
      })];
      deel('wig', d, { reeks, punt: d.p, straal: 0.1 });
    } else if (d.soort === 'katrol' && d.rem) {
      const bak = bakVoor('effen', d.stap, d.tot);
      const reeks = [pakken(bak, () => doos(bak, d.p, [0.08, 0.05, 0.05], x, y, z, lin('#b3261e')))];
      deel('rem', { ...d, naam: 'remblok' }, { reeks, punt: d.p, straal: 0.15 });
    } else if (d.soort === 'katrol') {
      cilinder(bakVoor('effen', d.stap, d.tot), plus(d.p, [0, 0, -0.02]), plus(d.p, [0, 0, 0.02]), 0.05, 0.05, 12, lin('#8a8f96'));
    } else if (d.soort === 'vlag') {
      if (d.paal) cilinder(bakVoor('effen', d.stap, d.tot), [d.p[0], 0, d.p[2]], [d.p[0], d.p[1] + 0.05, d.p[2]], 0.02, 0.02, 6, lin('#f2f0ea'));
      const bak = bakVoor('vlag', d.stap, d.tot);
      const nx = 10; const ny = 3; const k0 = bak.aantal;
      const kl = [lin('#c8281e'), lin('#f4f2ec'), lin('#21468b')];
      for (let j = 0; j <= ny * 2; j++) for (let i = 0; i <= nx; i++) {
        const u = i / nx; const v = j / (ny * 2);
        const p = [d.p[0] - u * d.breed, d.p[1] - v * d.hoog, d.p[2] + Math.sin(u * 5) * 0.06 * u];
        bak.v(p, [0, 0, 1], u, v, kl[Math.min(2, Math.floor(v * 3))]);
      }
      for (let j = 0; j < ny * 2; j++) for (let i = 0; i < nx; i++) {
        const a = k0 + j * (nx + 1) + i; const b = a + nx + 1;
        bak.i.push(a, b, a + 1, a + 1, b, b + 1);
      }
    } else if (d.soort === 'boom') {
      const bak = bakVoor('effen', 1, null);
      cilinder(bak, d.p, plus(d.p, [0, d.hoog * 0.75, 0]), d.r, d.r * 0.55, 12, lin('#6e5236'), { kapKleur: lin('#9c7a52') });
      const ico = new IcosahedronGeometry(1, 1); const pos = ico.attributes.position; const nor = ico.attributes.normal;
      for (const [ox, oy, oz, sc, kl] of [[0, d.hoog * 0.78, 0, 1.9, '#3f7a35'], [1.0, d.hoog * 0.66, 0.5, 1.4, '#4a8a3c'], [-0.9, d.hoog * 0.7, -0.6, 1.5, '#3b7031'], [0.2, d.hoog * 0.95, -0.4, 1.2, '#4f9142']]) {
        const k0 = bak.aantal; const c = lin(kl);
        for (let i = 0; i < pos.count; i++) {
          bak.v([d.p[0] + ox + pos.getX(i) * sc, d.p[1] + oy + pos.getY(i) * sc * 0.85, d.p[2] + oz - 0.6 + pos.getZ(i) * sc], [nor.getX(i), nor.getY(i), nor.getZ(i)], 0, 0, c);
        }
        for (let i = 0; i < pos.count; i += 3) bak.i.push(k0 + i, k0 + i + 1, k0 + i + 2);
      }
      ico.dispose();
    } else if (d.soort === 'jute') {
      const bak = bakVoor('effen', d.stap, d.tot);
      const reeks = [pakken(bak, () => cilinder(bak, plus(d.p, [0, -d.hoog / 2, 0]), plus(d.p, [0, d.hoog / 2, 0]), d.r + 0.006, d.r + 0.006, 16, lin('#b89a64'), { kappen: false }))];
      deel('jute', { ...d, naam: 'jute om de stam' }, { reeks, punt: d.p, straal: 0.25 });
    } else if (d.soort === 'zand') {
      const bak = bakVoor('effen', d.stap, d.tot);
      doos(bak, d.p, [d.lang / 2, d.dik / 2, d.breed / 2], x, y, z, lin(d.rand === false ? '#d8c08f' : '#c9ad78'));
      for (const s of d.rand === false ? [] : [-1, 1]) {
        doos(bak, plus(d.p, [0, d.dik / 2 + 0.03, s * (d.breed / 2 - 0.05)]), [d.lang / 2, 0.035, 0.05], x, y, z, lin('#6f7a45'));
        doos(bak, plus(d.p, [s * (d.lang / 2 - 0.05), d.dik / 2 + 0.03, 0]), [0.05, 0.035, d.breed / 2 - 0.1], x, y, z, lin('#6f7a45'));
      }
    } else if (d.soort === 'vuur') {
      const bak = bakVoor('effen', d.stap, d.tot);
      for (const [a, b] of [[[-0.25, 0.04, -0.1], [0.2, 0.04, 0.12]], [[-0.2, 0.04, 0.15], [0.22, 0.06, -0.12]], [[0, 0.1, -0.22], [0.02, 0.1, 0.22]]]) {
        cilinder(bak, plus(d.p, a), plus(d.p, b), 0.035, 0.03, 6, lin('#4a3424'), { kapKleur: lin('#2a1d14') });
      }
      const g = bakVoor('gloed', d.stap, d.tot);
      for (const [ox, oz, h, kl] of [[0, 0, 0.42, '#ff8a1e'], [0.07, 0.05, 0.3, '#ffc13b'], [-0.08, -0.04, 0.32, '#ff6a14'], [0.02, -0.08, 0.22, '#ffe08a']]) {
        cilinder(g, plus(d.p, [ox, 0.05, oz]), plus(d.p, [ox * 0.6, 0.05 + h, oz * 0.6]), 0.09, 0.004, 7, lin(kl), { kappen: false });
      }
    } else if (d.soort === 'pan') {
      const bak = bakVoor('effen', d.stap, d.tot);
      cilinder(bak, plus(d.p, [0, -d.hoog / 2, 0]), plus(d.p, [0, d.hoog / 2, 0]), d.r, d.r * 1.04, 16, lin('#3a3d42'), { kapKleur: lin('#5b4632') });
    } else if (d.soort === 'zeil') {
      // a tarp from the ridge (first two corners) down to the sides, sagging a little between them
      const bak = bakVoor('vlag', d.stap, d.tot); const [p0, p1, p2, p3] = d.punten;
      const nx = 8; const ny = 5; const k0 = bak.aantal; const kl = lin('#6f7d4a');
      const lerp = (a, c, t) => plus(a, keer(min(c, a), t));
      for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
        const u = i / nx; const v = j / ny;
        const p = lerp(lerp(p0, p1, u), lerp(p3, p2, u), v);
        p[1] -= Math.sin(Math.PI * u) * Math.sin(Math.PI * v) * 0.06;
        bak.v(p, d.normaal ?? [0, 1, 0], u, v, kl);
      }
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const a = k0 + j * (nx + 1) + i; const b = a + nx + 1;
        bak.i.push(a, b, a + 1, a + 1, b, b + 1);
      }
    } else if (d.soort === 'koord' || d.soort === 'zak' || d.soort === 'knoop') {
      const bak = bakVoor('effen', d.stap, d.tot);
      const ico = new IcosahedronGeometry(1, d.soort === 'knoop' ? 0 : 1); const pos = ico.attributes.position; const nor = ico.attributes.normal;
      const sc = d.soort === 'koord' ? [d.r, d.r * 0.9, d.r] : d.soort === 'zak' ? [0.2, 0.28, 0.2] : [0.022, 0.022, 0.022];
      const kl = lin(d.soort === 'koord' ? '#e9dcb8' : d.soort === 'zak' ? '#8a6a44' : '#f4f1e8');
      const reeks = [pakken(bak, () => {
        const k0 = bak.aantal;
        for (let i = 0; i < pos.count; i++) bak.v([d.p[0] + pos.getX(i) * sc[0], d.p[1] + pos.getY(i) * sc[1], d.p[2] + pos.getZ(i) * sc[2]], [nor.getX(i), nor.getY(i), nor.getZ(i)], 0, 0, kl);
        for (let i = 0; i < pos.count; i += 3) bak.i.push(k0 + i, k0 + i + 1, k0 + i + 2);
      })];
      ico.dispose();
      if (d.soort === 'zak') deel('zak', { ...d, naam: 'zware zak om te testen' }, { reeks, punt: d.p, straal: 0.3 });
    } else if (d.soort === 'liniaal') {
      const bak = bakVoor('effen', d.stap, d.tot);
      doos(bak, d.p, [d.lang / 2, 0.012, d.breed / 2], x, y, z, lin('#e8d36a'));
      for (let i = 0; i <= 30; i++) {
        const lang = i % 10 === 0 ? 0.12 : i % 5 === 0 ? 0.08 : 0.05;
        doos(bak, [d.p[0] - d.lang / 2 + 0.05 + i * ((d.lang - 0.1) / 30), d.p[1] + 0.013, d.p[2] - d.breed / 2 + lang / 2], [0.006, 0.002, lang / 2], x, y, z, lin('#3a3320'));
      }
    } else if (d.soort === 'sling') {
      const bak = bakVoor('effen', d.stap, d.tot);
      const reeks = [pakken(bak, () => {
        cilinder(bak, plus(d.p, [0, -0.03, 0]), plus(d.p, [0, 0.03, 0]), d.r + 0.016, d.r + 0.016, 18, lin('#e2701e'), { kappen: false });
        cilinder(bak, plus(d.p, [d.r + 0.03, -0.05, 0]), plus(d.p, [d.r + 0.03, 0.05, 0]), 0.012, 0.012, 6, lin('#9aa0a8'));
      })];
      deel('sling', { ...d, naam: 'sling en schroefkarabiner' }, { reeks, punt: d.p, straal: 0.3 });
    } else if (d.soort === 'stam') {
      const bak = bakVoor('effen', d.stap, d.tot);
      const a = plus(d.p, [-d.lang / 2, 0, 0]); const e = plus(d.p, [d.lang / 2, 0, 0]);
      cilinder(bak, a, e, d.r, d.r * 0.92, 14, lin('#6b5440'), { kapKleur: lin('#d8b98a') });
    } else if (d.soort === 'ton') {
      const bak = bakVoor('effen', d.stap, d.tot);
      const a = plus(d.p, [-d.lang / 2, 0, 0]); const b = plus(d.p, [d.lang / 2, 0, 0]);
      cilinder(bak, a, b, d.r, d.r, 18, lin('#2f6fa8'), { kapKleur: lin('#285f90') });
      for (const t of [0.3, 0.7]) {
        const c = plus(a, [d.lang * t, 0, 0]);
        cilinder(bak, plus(c, [-0.015, 0, 0]), plus(c, [0.015, 0, 0]), d.r + 0.01, d.r + 0.01, 18, lin('#244f78'));
      }
    } else if (d.soort === 'band') {
      // an old car tyre lying flat: a ring of rubber round p (radius r, thickness dik)
      const bak = bakVoor('effen', d.stap, d.tot); const ringPts = [];
      for (let i = 0; i < 20; i++) { const t = (i / 20) * TAU; ringPts.push(plus(d.p, [Math.cos(t) * d.r, 0, Math.sin(t) * d.r])); }
      buis(bak, ringPts, d.dik, true, lin('#2c2e33'), 8);
    } else if (d.soort === 'kuil') {
      // a hole in the ground: a dark patch, and the dug-out soil beside it
      const bak = bakVoor('effen', d.stap, d.tot);
      doos(bak, plus(d.p, [0, 0.004, 0]), [d.lang / 2, 0.004, d.breed / 2], x, y, z, lin('#3b2c1f'));
      if (d.hoop) doos(bak, d.hoop, [0.35, 0.08, 0.3], x, y, z, lin('#7a5a3c'));
    }
  }

  // -- the ground: grass (or water), fading into the page; a strip of water under a bridge
  let grond; let water = null;
  const lo = [Infinity, Infinity, Infinity]; const hi = [-Infinity, -Infinity, -Infinity];
  const neem = (q) => { for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], q[i]); hi[i] = Math.max(hi[i], q[i]); } };
  for (const p of P) if (!p.kopie) { neem(p.a); neem(p.b); }
  for (const h of model.haringen) neem(h.p);
  for (const d of model.dingen) if (d.p) neem(d.p);
  const midden = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
  const omvang = Math.max(1.5, hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
  {
    const R = Math.max(omvang * 1.15, 5);
    const pos = []; const nor = []; const uv = []; const idx = []; const n = 48;
    pos.push(midden[0], 0, midden[2]); nor.push(0, 1, 0); uv.push(0.5, 0.5);
    for (let i = 0; i <= n; i++) { const t = (i / n) * TAU; pos.push(midden[0] + Math.cos(t) * R, 0, midden[2] + Math.sin(t) * R); nor.push(0, 1, 0); uv.push(0.5 + Math.cos(t) * 0.5, 0.5 - Math.sin(t) * 0.5); }
    for (let i = 0; i < n; i++) idx.push(0, i + 2, i + 1);
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    grond = new Mesh(g, new MeshLambertMaterial({ alphaMap: textuur.grond, transparent: true, depthWrite: false }));
    grond.receiveShadow = true; grond.renderOrder = -2;
    scene.add(grond);
    const strook = model.dingen.find((d) => d.soort === 'water');
    if (strook) {
      const wg = new BufferGeometry(); const z = R * 0.8; const y = 0.012;
      wg.setAttribute('position', new Float32BufferAttribute([strook.x0, y, -z, strook.x1, y, -z, strook.x1, y, z, strook.x0, y, z], 3));
      wg.setAttribute('normal', new Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
      wg.setAttribute('uv', new Float32BufferAttribute([0, 0.5, 1, 0.5, 1, 0.5, 0, 0.5], 2));
      wg.setIndex([0, 2, 1, 0, 3, 2]);
      water = new Mesh(wg, new MeshLambertMaterial({ transparent: true, opacity: 0.85, depthWrite: false, alphaMap: textuur.grond }));
      water.receiveShadow = true; water.renderOrder = -1;
      scene.add(water);
    }
  }

  // -- the meshes, in a group per step (so a new step can drop in); a moving part in a group of its own inside that
  const stapGroep = new Map();
  const groepVoor = (stap) => { if (!stapGroep.has(stap)) { const g = new Group(); stapGroep.set(stap, g); scene.add(g); } return stapGroep.get(stap); };
  const draaiGroepen = new Map();     // name of the moving part → its groups (one per step)
  const ouderVoor = (stap, beweeg) => {
    if (!beweeg) return groepVoor(stap);
    const k = `${stap}|${beweeg}`;
    if (!draaiGroepen.has(k)) { const g = new Group(); g.userData = { beweeg }; groepVoor(stap).add(g); draaiGroepen.set(k, g); }
    return draaiGroepen.get(k);
  };
  const meshVan = new Map();
  for (const x of bakken.values()) {
    if (!x.bak.i.length) continue;
    const mesh = new Mesh(x.bak.geo(), MAT[x.mat]);
    // rope is too thin to need a shadow pass of its own: the poles carry the shadow
    mesh.castShadow = x.mat !== 'gloed' && x.mat !== 'touw'; mesh.receiveShadow = x.mat === 'hout' || x.mat === 'effen';
    mesh.userData = { stap: x.stap, tot: x.tot };
    ouderVoor(x.stap, x.beweeg).add(mesh);
    meshVan.set(x.bak, mesh);
  }
  for (const e of extra) { e.mesh.userData = { stap: e.stap, tot: e.tot }; ouderVoor(e.stap, e.beweeg).add(e.mesh); }
  // the original colours, to put back after lighting a part up
  const origineel = new Map();
  for (const mesh of meshVan.values()) origineel.set(mesh, mesh.geometry.attributes.color.array.slice());

  // -- the moving parts: model.beweging.delen = { naam: { punt, as, hoek: [van, tot] } (turns round the axis `as`
  // through `punt`, in degrees; two points [p1, p2]: below 0° it turns round p1, above round p2, like a bok that rocks
  // from one foot onto the other) or { schuif: [dx, dy, dz] } (slides) }. t runs from 0 to 1.
  const delenBeweging = model.beweging ?? null;
  const stand = new Map();           // name → { q, pos }: where the part is now
  const tv = new Vector3(); const tas = new Vector3();
  function zetStand(t) {
    for (const [naam, spec] of Object.entries(delenBeweging?.delen ?? {})) {
      const q = new Quaternion(); const pos = new Vector3();
      if (spec.schuif) pos.set(...spec.schuif).multiplyScalar(t);
      else if (spec.baan) {
        // goes round with a turning part but keeps hanging straight down (a seat on a wheel): only the point `aan`
        // it hangs from turns round `punt`, the part itself does not turn
        const graden = spec.hoek[0] + (spec.hoek[1] - spec.hoek[0]) * t;
        const rq = new Quaternion().setFromAxisAngle(tas.set(...spec.as).normalize(), (graden * Math.PI) / 180);
        const aan = new Vector3(...spec.aan); const p = new Vector3(...spec.punt);
        pos.copy(aan).sub(p).applyQuaternion(rq).add(p).sub(aan);
      }
      else {
        const graden = spec.hoek[0] + (spec.hoek[1] - spec.hoek[0]) * t;
        const p = Array.isArray(spec.punt[0]) ? spec.punt[graden < 0 ? 0 : 1] : spec.punt;
        q.setFromAxisAngle(tas.set(...spec.as).normalize(), (graden * Math.PI) / 180);
        // turn round p: x → q·(x − p) + p
        tv.set(...p); pos.copy(tv).sub(tv.clone().applyQuaternion(q));
      }
      stand.set(naam, { q, pos });
    }
    for (const g of draaiGroepen.values()) {
      const s = stand.get(g.userData.beweeg); if (!s) continue;
      g.quaternion.copy(s.q); g.position.copy(s.pos);
    }
    // the ropes from a moving part to a fixed point: new points, the same number of vertices (so the colours stay)
    for (const x of losseLijnen) {
      const pts = x.l.punten.map((p, i) => verplaats(x.l.volgt[i], p));
      const bak = new Bak(); buis(bak, pts, x.dik, false, x.kleur, x.seg);
      const mesh = meshVan.get(x.bak); if (!mesh) continue;
      const g = mesh.geometry;
      if (bak.aantal === g.attributes.position.count) {
        g.attributes.position.array.set(bak.p); g.attributes.normal.array.set(bak.n); g.attributes.uv.array.set(bak.uv);
        g.attributes.position.needsUpdate = true; g.attributes.normal.needsUpdate = true; g.attributes.uv.needsUpdate = true;
        g.computeBoundingSphere();
      }
      if (x.deel) x.deel.lijn = pts;
    }
  }
  /** Where point p of a part of the moving part `naam` is now (a fixed point when naam is empty). */
  function verplaats(naam, p) {
    const s = naam ? stand.get(naam) : null;
    if (!s) return p;
    tv.set(p[0], p[1], p[2]).applyQuaternion(s.q).add(s.pos);
    return [tv.x, tv.y, tv.z];
  }
  /** Where a part you can tap is now: its point, or the middle of its line. */
  const plekVan = (d) => (d.punt ? verplaats(d.beweeg, d.punt) : midpunt(d.lijn.map((q) => verplaats(d.beweeg, q))));
  if (delenBeweging) zetStand(delenBeweging.start ?? 0);

  // -- camera: turn round a point, never under the ground
  // frame the poles (the structure itself); pegs and guy lines far out may fall outside the first view
  const pmin = [Infinity, Infinity, Infinity]; const pmax = [-Infinity, -Infinity, -Infinity];
  const kaderPunten = P.filter((p) => !p.kopie).flatMap((p) => [p.a, p.b]);
  // a long structure along lines (a kabelbaan) is framed with its lines and things too
  if (model.kader === 'alles') for (const l of model.lijnen) kaderPunten.push(...l.punten);
  for (const q of kaderPunten) for (let i = 0; i < 3; i++) { pmin[i] = Math.min(pmin[i], q[i]); pmax[i] = Math.max(pmax[i], q[i]); }
  const pm = [0, 1, 2].map((i) => (pmin[i] + pmax[i]) / 2);
  const straalBol = Math.max(1.2, Math.hypot(pmax[0] - pmin[0], pmax[1] - pmin[1], pmax[2] - pmin[2]) / 2);
  const doel = new Vector3(pm[0], Math.max(0.5, pm[1] * 0.85), pm[2]);
  const vast = doel.clone();
  // the point to turn round follows the poles that are shown: lying poles at the start are low and near the middle
  let doelNaar = null;
  function richtOp(n) {
    const lo = [Infinity, Infinity, Infinity]; const hi = [-Infinity, -Infinity, -Infinity];
    for (const p of P) {
      if (p.stap > n || (p.tot && n >= p.tot)) continue;
      for (const q of [p.a, p.b]) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], q[i]); hi[i] = Math.max(hi[i], q[i]); }
    }
    if (!Number.isFinite(lo[0])) return vast.clone();
    // only when what is shown is much lower than the whole (lying on the ground): look down at it
    if (hi[1] > (pmax[1] - pmin[1]) * 0.5) return vast.clone();
    return new Vector3((lo[0] + hi[0]) / 2, Math.max(0.15, hi[1] * 0.5), (lo[2] + hi[2]) / 2);
  }
  let breedte = 4; let hoogte = 3;
  const begin = { theta: model.zicht?.theta ?? 0.62, phi: model.zicht?.phi ?? 1.12, afstand: 1 };
  const zicht = { ...begin };
  /** The distance at which the corners of the frame box all fit in the first view (with a margin). */
  function pasAfstand() {
    const tv = Math.tan(((camera.fov * Math.PI) / 180) / 2) * 0.86; const th = tv * camera.aspect;
    const st = Math.sin(begin.theta); const ct = Math.cos(begin.theta); const sp = Math.sin(begin.phi); const cp = Math.cos(begin.phi);
    const terug = [sp * st, cp, sp * ct];                       // from the target towards the camera
    const rechts = [ct, 0, -st]; const op = kruis(terug, rechts).map((x) => -x);
    let d = 1;
    for (const x of [pmin[0], pmax[0]]) for (const y of [pmin[1], pmax[1]]) for (const z of [pmin[2], pmax[2]]) {
      const v = [x - doel.x, y - doel.y, z - doel.z];
      const diep = punt(v, terug);
      d = Math.max(d, diep + Math.abs(punt(v, rechts)) / th, diep + Math.abs(punt(v, op)) / tv);
    }
    return d;
  }
  const grenzen = () => {
    const ver = pasAfstand();
    return { min: Math.max(1.0, straalBol * 0.35), max: ver * 2.2 };
  };
  function plaatsCamera() {
    const g = grenzen();
    zicht.afstand = Math.min(g.max, Math.max(g.min, zicht.afstand));
    // above the ground: the camera height doel.y + afstand·cos(phi) stays above 0.25 m
    const phiMax = Math.min(1.62, Math.acos(Math.max(-1, Math.min(1, (0.25 - doel.y) / zicht.afstand))));
    zicht.phi = Math.min(phiMax, Math.max(0.12, zicht.phi));
    const s = Math.sin(zicht.phi);
    camera.position.set(doel.x + zicht.afstand * s * Math.sin(zicht.theta), doel.y + zicht.afstand * Math.cos(zicht.phi), doel.z + zicht.afstand * s * Math.cos(zicht.theta));
    camera.lookAt(doel);
    camera.near = Math.max(0.03, zicht.afstand / 200); camera.far = zicht.afstand + omvang * 4 + 20;
    camera.updateProjectionMatrix();
  }
  // the sun and its shadow cover the model
  zon.position.set(midden[0] - omvang * 0.6, omvang * 1.4 + 3, midden[2] + omvang * 0.45);
  zon.target.position.set(midden[0], 0, midden[2]);
  {
    const sc = zon.shadow.camera; const R = omvang * 0.85 + 1;
    sc.left = -R; sc.right = R; sc.top = R; sc.bottom = -R; sc.near = 0.5; sc.far = omvang * 4 + 10; sc.updateProjectionMatrix();
  }

  // -- colours of the theme
  function kleur(k) {
    scene.background = new Color(k.achter);
    const gras = new Color(k.donker ? '#4f6a3e' : '#9dbb78');
    const blauw = new Color(k.donker ? '#2f5f86' : '#6fa7cf');
    const tafel = new Color(k.donker ? '#6e5338' : '#cfab7c');
    grond.material.color.copy(model.grond === 'water' ? blauw : model.grond === 'tafel' ? tafel : gras);
    if (water) water.material.color.copy(blauw);
    hemi.color.set(k.donker ? '#c8d4ff' : '#ffffff'); hemi.groundColor.set(k.donker ? '#2b3524' : '#6b7a52');
    hemi.intensity = k.donker ? 1.0 : 1.05; zon.intensity = k.donker ? 1.6 : 1.75;
    accent.set(k.accent);
    if (gemarkeerd.length) zetMarkering(gemarkeerd);
    vraag();
  }
  const accent = new Color();

  // -- which step is shown
  let stapNu = model.stappen.length;
  let val = null;           // the step that is dropping in, and since when
  function toonStap(n, { animeer = false } = {}) {
    const vorige = stapNu; stapNu = n;
    for (const [stap, g] of stapGroep) {
      g.visible = stap <= n;
      for (const m of g.children) {
        m.visible = stap <= n && !(m.userData.tot && n >= m.userData.tot);
        if (m.userData.beweeg) for (const k of m.children) k.visible = !(k.userData.tot && n >= k.userData.tot);
      }
      g.position.y = 0;
    }
    val = animeer && beweging && n === vorige + 1 && stapGroep.has(n) ? { stap: n, t0: performance.now() } : null;
    const nieuwDoel = richtOp(n);
    if (beweging && animeer && nieuwDoel.distanceTo(doel) > 0.01) doelNaar = { van: doel.clone(), naar: nieuwDoel, t0: performance.now() };
    else { doel.copy(nieuwDoel); doelNaar = null; }
    vraag();
  }
  const zichtbaar = (d) => d.stap <= stapNu && !(d.tot && stapNu >= d.tot);

  // -- lighting parts up
  let gemarkeerd = [];
  function zetMarkering(lijst) {
    for (const [mesh, kl] of origineel) { const a = mesh.geometry.attributes.color; a.array.set(kl); a.needsUpdate = true; }
    gemarkeerd = lijst;
    for (const i of lijst) {
      for (const { bak, van, tot } of delen[i].reeks) {
        const mesh = meshVan.get(bak); if (!mesh) continue;
        const a = mesh.geometry.attributes.color;
        for (let v = van; v < tot; v++) a.setXYZ(v, accent.r, accent.g, accent.b);
        a.needsUpdate = true;
      }
    }
    vraag();
  }

  // -- rendering, only on change
  let raf = 0; let weg = false; let label = null;
  const tmp = new Vector3();
  function naarScherm(p) {
    tmp.set(p[0], p[1], p[2]).project(camera);
    return { x: (tmp.x + 1) / 2 * breedte, y: (1 - tmp.y) / 2 * hoogte, z: tmp.z };
  }
  function teken(nu) {
    raf = 0;
    if (weg) return;
    if (val) {
      const t = Math.min(1, (nu - val.t0) / 420); const g = stapGroep.get(val.stap);
      if (g) g.position.y = (1 - (1 - (1 - t) ** 3)) * 0.35;
      if (t >= 1) { if (g) g.position.y = 0; val = null; }
    }
    if (doelNaar) {
      const t = Math.min(1, (nu - doelNaar.t0) / 500); const e = 1 - (1 - t) ** 3;
      doel.lerpVectors(doelNaar.van, doelNaar.naar, e);
      if (t >= 1) doelNaar = null;
    }
    plaatsCamera();
    renderer.render(scene, camera);
    if (label) {
      const s = naarScherm(plekVan(label.deel));
      label.el.hidden = s.z > 1 || s.x < 0 || s.y < 0 || s.x > breedte || s.y > hoogte;
      label.el.style.transform = `translate(${Math.round(s.x)}px, ${Math.round(s.y)}px)`;
    }
    if (val || doelNaar) raf = requestAnimationFrame(teken);
  }
  function vraag() { if (!raf && !weg) raf = requestAnimationFrame(teken); }

  const ro = new ResizeObserver(() => {
    if (weg) return;
    const w = plek.clientWidth; const h = plek.clientHeight;
    if (!w || !h || (w === breedte && h === hoogte)) return;
    const eerste = breedte === 4;
    breedte = w; hoogte = h;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (eerste) { begin.afstand = pasAfstand(); zicht.afstand = begin.afstand; }
    vraag();
  });
  ro.observe(plek);

  // -- turning and zooming: one finger or the mouse turns, two fingers or the wheel zoom
  const wijzers = new Map(); let sleep = null;
  const draai = (dx, dy) => { zicht.theta -= dx * 0.0085; zicht.phi -= dy * 0.0085; vraag(); };
  const zoom = (f) => { zicht.afstand *= f; vraag(); };
  canvas.addEventListener('pointerdown', (e) => {
    try { canvas.setPointerCapture(e.pointerId); } catch { /* the pointer is already gone */ }
    wijzers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    sleep = wijzers.size === 1 ? { x: e.clientX, y: e.clientY, t: performance.now(), ver: 0 } : null;
  });
  canvas.addEventListener('pointermove', (e) => {
    const oud = wijzers.get(e.pointerId); if (!oud) return;
    const nieuw = { x: e.clientX, y: e.clientY };
    if (wijzers.size === 1) {
      draai(nieuw.x - oud.x, nieuw.y - oud.y);
      if (sleep) sleep.ver += Math.abs(nieuw.x - oud.x) + Math.abs(nieuw.y - oud.y);
    } else if (wijzers.size === 2) {
      const [a, b] = [...wijzers.entries()].map(([id, q]) => (id === e.pointerId ? nieuw : q));
      const [a0, b0] = [...wijzers.values()];
      const d0 = Math.hypot(a0.x - b0.x, a0.y - b0.y); const d1 = Math.hypot(a.x - b.x, a.y - b.y);
      if (d0 > 0 && d1 > 0) zoom(d0 / d1);
    }
    wijzers.set(e.pointerId, nieuw);
  });
  const los = (e) => {
    const was = wijzers.has(e.pointerId); wijzers.delete(e.pointerId);
    if (was && e.type === 'pointerup' && sleep && sleep.ver < 8 && performance.now() - sleep.t < 600) {
      const b = canvas.getBoundingClientRect();
      opKies(raak(e.clientX - b.left, e.clientY - b.top));
    }
    if (!wijzers.size || e.type !== 'pointerup') sleep = null;
  };
  canvas.addEventListener('pointerup', los);
  canvas.addEventListener('pointercancel', los);
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); zoom(Math.exp(Math.max(-1, Math.min(1, e.deltaY * 0.0015)))); }, { passive: false });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  /** The part under a tap at (x, y) in pixels in the canvas, or -1: the nearest on the screen, within a finger. */
  function raak(x, y) {
    let beste = -1; let score = Infinity;
    delen.forEach((d, i) => {
      if (!zichtbaar(d)) return;
      let afst; let marge;
      if (d.lijn) {
        afst = Infinity; marge = 16;
        const pts = d.lijn.map((q) => naarScherm(verplaats(d.beweeg, q)));
        for (let k = 0; k < pts.length - 1; k++) {
          const a = pts[k]; const b = pts[k + 1]; if (a.z > 1 || b.z > 1) continue;
          const dx = b.x - a.x; const dy = b.y - a.y; const l2 = dx * dx + dy * dy || 1;
          const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / l2));
          afst = Math.min(afst, Math.hypot(x - a.x - t * dx, y - a.y - t * dy));
        }
      } else {
        const pc = verplaats(d.beweeg, d.punt);
        const s = naarScherm(pc); if (s.z > 1) return;
        const rand = naarScherm(plus(pc, keer([camera.matrixWorld.elements[0], camera.matrixWorld.elements[1], camera.matrixWorld.elements[2]], d.straal)));
        marge = Math.max(18, Math.hypot(rand.x - s.x, rand.y - s.y));
        afst = Math.hypot(x - s.x, y - s.y);
      }
      const sc = afst / marge;
      if (sc < 1 && sc < score) { score = sc; beste = i; }
    });
    return beste;
  }

  toonStap(stapNu);
  plaatsCamera();

  return {
    delen,
    toonStap,
    kleur,
    /** Light up these parts (indices into delen); the label (an element) goes with the first one. */
    markeer(lijst, labelEl = null) {
      zetMarkering(lijst);
      label = labelEl && lijst.length ? { el: labelEl, deel: delen[lijst[0]] } : null;
      if (labelEl && !label) labelEl.hidden = true;
      vraag();
    },
    draai(dx, dy) { draai(dx, dy); },
    zoom,
    herstel() { Object.assign(zicht, begin); doel.copy(richtOp(stapNu)); doelNaar = null; vraag(); },
    /** Move the moving parts (model.beweging) to t, from 0 to 1. */
    beweeg(t) { if (!delenBeweging || weg) return; zetStand(Math.max(0, Math.min(1, t))); vraag(); },
    stats() { const i = renderer.info.render; return { calls: i.calls, triangles: i.triangles, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures }; },
    dispose() {
      weg = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        o.geometry?.dispose();
        const m = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        for (const x of m) { x.map?.dispose(); x.alphaMap?.dispose(); x.dispose(); }
      });
      for (const t of Object.values(textuur)) t.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };

  function midpunt(pts) {
    let tot = 0; const l = [];
    for (let i = 0; i < pts.length - 1; i++) { const d = lengte(min(pts[i + 1], pts[i])); l.push(d); tot += d; }
    let acc = 0;
    for (let i = 0; i < l.length; i++) { if (acc + l[i] >= tot / 2) { const t = (tot / 2 - acc) / l[i]; return plus(pts[i], keer(min(pts[i + 1], pts[i]), t)); } acc += l[i]; }
    return pts[0];
  }
}
