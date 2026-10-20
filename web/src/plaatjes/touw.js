// Drawings for touw en knopen: each knot as it looks when it is done, not the steps (those come from the knopen side
// project later, with the same ABOK numbers). See ../plaatjes.js and ./basis.js; the colours are in ./touw.css.
//
// All knots are drawn with one helper, `knoop()`, so they look like one family. A rope is a smooth line through a
// few points; it is drawn as a thick band with a dark edge, a body and a lighter core. Where two parts cross, the
// part that lies on top is drawn again over the other, so you always see which one goes over. Which one that is
// comes from `z` in the points: at a crossing the part with the higher z is on top (each crossing is listed by
// `kruisingen()`, which scripts can use to check a drawing). A pole or a ring is a "rope" of its own (soort 'paal',
// 'ring'), so a turn around a pole goes behind it where its z is lower than the pole's (0).
import { r1, svg, tekst } from './basis.js';

// ---- the rope helper ----

/** Points along a centripetal Catmull-Rom curve through the control points [x, y, z?]; z is interpolated. */
function bocht(punten, dicht) {
  const p = punten.map(([x, y, z = 0]) => ({ x, y, z }));
  const n = p.length;
  const uit = [];
  const knik = (a, b) => Math.max(Math.hypot(b.x - a.x, b.y - a.y) ** 0.5, 1e-3);
  const laatste = dicht ? n : n - 1;
  for (let i = 0; i < laatste; i++) {
    const p1 = p[i]; const p2 = p[(i + 1) % n];
    const p0 = dicht ? p[(i - 1 + n) % n] : i > 0 ? p[i - 1] : { x: 2 * p1.x - p2.x, y: 2 * p1.y - p2.y };
    const p3 = dicht ? p[(i + 2) % n] : i + 2 < n ? p[i + 2] : { x: 2 * p2.x - p1.x, y: 2 * p2.y - p1.y };
    const t0 = 0; const t1 = t0 + knik(p0, p1); const t2 = t1 + knik(p1, p2); const t3 = t2 + knik(p2, p3);
    const stappen = Math.max(4, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / 2.5));
    for (let k = 0; k < stappen; k++) {
      const t = t1 + ((t2 - t1) * k) / stappen;
      const m = (a, b, ta, tb) => ({ x: ((tb - t) * a.x + (t - ta) * b.x) / (tb - ta), y: ((tb - t) * a.y + (t - ta) * b.y) / (tb - ta) });
      const a1 = m(p0, p1, t0, t1); const a2 = m(p1, p2, t1, t2); const a3 = m(p2, p3, t2, t3);
      const b1 = m(a1, a2, t0, t2); const b2 = m(a2, a3, t1, t3);
      const c = m(b1, b2, t1, t2);
      uit.push({ x: c.x, y: c.y, z: p1.z + ((p2.z - p1.z) * k) / stappen });
    }
  }
  if (dicht) uit.push({ ...uit[0] });
  else uit.push({ x: p[n - 1].x, y: p[n - 1].y, z: p[n - 1].z });
  let s = 0;
  uit.forEach((q, i) => { if (i) s += Math.hypot(q.x - uit[i - 1].x, q.y - uit[i - 1].y); q.s = s; });
  return uit;
}

/** Where segment a1-a2 crosses b1-b2: the fractions along both, or null. */
function snij(a1, a2, b1, b2) {
  const dx = a2.x - a1.x; const dy = a2.y - a1.y; const ex = b2.x - b1.x; const ey = b2.y - b1.y;
  const d = dx * ey - dy * ex;
  if (Math.abs(d) < 1e-9) return null;
  const u = ((b1.x - a1.x) * ey - (b1.y - a1.y) * ex) / d;
  const v = ((b1.x - a1.x) * dy - (b1.y - a1.y) * dx) / d;
  const e = 1e-7;
  return u > -e && u < 1 + e && v > -e && v < 1 + e ? [u, v] : null;
}

const STANDAARD_DIK = { paal: 26, tros: 24, kikker: 18, ton: 110, kern: 24, ring: 7, garen: 3.2 };

/** The strands of a drawing, sampled. */
function strengen(def) {
  return def.strengen.map((st, nr) => {
    const dik = st.dik ?? STANDAARD_DIK[st.soort] ?? 11;
    const q = bocht(st.p, st.dicht);
    return { ...st, nr, dik, q, lengte: q.at(-1).s, soort: st.soort ?? 'a' };
  });
}

/** Every crossing in a drawing: which strands, where along each (s), and which one is on top. */
export function kruisingen(def, al = strengen(def)) {
  const uit = [];
  for (const A of al) for (const B of al) {
    if (B.nr < A.nr) continue;
    const zelf = A === B;
    for (let i = 0; i < A.q.length - 1; i++) {
      const a1 = A.q[i]; const a2 = A.q[i + 1];
      for (let j = zelf ? i + 2 : 0; j < B.q.length - 1; j++) {
        const b1 = B.q[j]; const b2 = B.q[j + 1];
        if (zelf) {
          const afstand = Math.abs(b1.s - a1.s);
          if (afstand < 1.6 * A.dik || (A.dicht && A.lengte - afstand < 1.6 * A.dik)) continue;
        }
        if (Math.max(a1.x, a2.x) < Math.min(b1.x, b2.x) || Math.max(b1.x, b2.x) < Math.min(a1.x, a2.x)) continue;
        if (Math.max(a1.y, a2.y) < Math.min(b1.y, b2.y) || Math.max(b1.y, b2.y) < Math.min(a1.y, a2.y)) continue;
        const r = snij(a1, a2, b1, b2);
        if (!r) continue;
        const [u, v] = r;
        const sa = a1.s + u * (a2.s - a1.s); const sb = b1.s + v * (b2.s - b1.s);
        if (uit.some((k) => k.a === A.nr && k.b === B.nr && Math.abs(k.sa - sa) < 2 && Math.abs(k.sb - sb) < 2)) continue;
        const za = a1.z + u * (a2.z - a1.z); const zb = b1.z + v * (b2.z - b1.z);
        const hoek = Math.abs(((a2.x - a1.x) * (b2.y - b1.y) - (a2.y - a1.y) * (b2.x - b1.x))
          / (Math.hypot(a2.x - a1.x, a2.y - a1.y) * Math.hypot(b2.x - b1.x, b2.y - b1.y)));
        uit.push({ a: A.nr, b: B.nr, sa, sb, za, zb, sin: hoek, x: a1.x + u * (a2.x - a1.x), y: a1.y + u * (a2.y - a1.y) });
      }
    }
  }
  if (def.afwisselend) wissel(uit, al);
  return uit;
}

/** For an alternating knot (Turkse knoop, karaaksteek): over, under, over, ... along each strand in turn. */
function wissel(lijst, al) {
  const langs = [];
  for (const k of lijst) { langs.push({ k, st: k.a, s: k.sa, kant: 'a' }); langs.push({ k, st: k.b, s: k.sb, kant: 'b' }); }
  for (const st of al) {
    const hier = langs.filter((l) => l.st === st.nr).sort((x, y) => x.s - y.s);
    let boven = st.afwisselendBegin ?? true;
    const al1 = hier.find((l) => l.k.boven !== undefined);
    if (al1) boven = (al1.k.boven === al1.kant) === (hier.indexOf(al1) % 2 === 0);
    hier.forEach((l, i) => {
      const hierBoven = i % 2 === 0 ? boven : !boven;
      if (l.k.boven === undefined) l.k.boven = hierBoven ? l.kant : l.kant === 'a' ? 'b' : 'a';
    });
  }
  for (const k of lijst) { k.za = k.boven === 'a' ? 1 : -1; k.zb = -k.za; }
}

/** The part of a strand from s1 to s2 (s may wrap around on a closed strand). */
function stuk(st, s1, s2) {
  const q = st.q; const L = st.lengte;
  if (st.dicht && (s1 < 0 || s2 > L)) {
    if (s1 < 0) return [...stuk(st, s1 + L, L), ...stuk(st, 0, s2).slice(1)];
    return [...stuk(st, s1, L), ...stuk(st, 0, s2 - L).slice(1)];
  }
  s1 = Math.max(0, s1); s2 = Math.min(L, s2);
  const punt = (s) => {
    let i = q.findIndex((p) => p.s >= s);
    if (i <= 0) return q[Math.max(i, 0)];
    const a = q[i - 1]; const b = q[i]; const f = (s - a.s) / (b.s - a.s || 1);
    return { x: a.x + f * (b.x - a.x), y: a.y + f * (b.y - a.y) };
  };
  return [punt(s1), ...q.filter((p) => p.s > s1 && p.s < s2), punt(s2)];
}

const pad = (pts) => `M${pts.map((p) => `${r1(p.x)} ${r1(p.y)}`).join('L')}`;

/** A piece of rope: edge, body and core (a pole and a ring have their own look, in ./touw.css). For a piece that
 *  lies on the same rope below (over a crossing, or in front of a pole), `binnen` is the same piece a little longer:
 *  body and core run on over the rope below, which hides the seam where the edge stops. */
function band(st, pts, metEind = { begin: false, eind: false }, binnen = pts) {
  const k = st.soort;
  const d = pad(binnen);
  let uit = `<path d="${pad(pts)}" class="tw-rand ${k}" stroke-width="${st.dik}"/><path d="${d}" class="tw-lijf ${k}" stroke-width="${r1(st.dik - (st.dik > 6 ? 3 : 1.4))}"/>`;
  if (k !== 'garen') uit += `<path d="${d}" class="tw-kern ${k}" stroke-width="${r1(st.dik * (k === 'paal' ? 0.12 : 0.28))}"/>`;
  if (metEind.begin && st.begin === 'eind') uit += tamp(st, pts[0], pts[Math.min(3, pts.length - 1)]);
  if (metEind.eind && st.eind === 'eind') uit += tamp(st, pts.at(-1), pts[Math.max(pts.length - 4, 0)]);
  return uit;
}

/** A working end: rounded, with a whipping just behind the tip, so you see where the rope stops. */
function tamp(st, p, terug) {
  const k = st.soort; const r = st.dik / 2;
  const dx = p.x - terug.x; const dy = p.y - terug.y; const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l; const uy = dy / l;
  let uit = `<circle cx="${r1(p.x)}" cy="${r1(p.y)}" r="${r1(r)}" class="tw-rand-vul ${k}"/><circle cx="${r1(p.x)}" cy="${r1(p.y)}" r="${r1(r - 1.5)}" class="tw-lijf-vul ${k}"/>`;
  if (st.dik >= 8) {
    for (const terugAf of [0.9, 1.5]) {
      const cx = p.x - ux * r * terugAf; const cy = p.y - uy * r * terugAf;
      uit += `<path d="M${r1(cx - uy * r)} ${r1(cy + ux * r)}L${r1(cx + uy * r)} ${r1(cy - ux * r)}" class="tw-takel ${k}"/>`;
    }
  }
  return uit;
}

/** A thin line with an arrowhead, for the direction you pull in. */
export function pijl([x1, y1], [x2, y2], klasse = '') {
  const l = Math.hypot(x2 - x1, y2 - y1); const ux = (x2 - x1) / l; const uy = (y2 - y1) / l;
  const a = [x2 - ux * 8 - uy * 4.5, y2 - uy * 8 + ux * 4.5]; const b = [x2 - ux * 8 + uy * 4.5, y2 - uy * 8 - ux * 4.5];
  return `<path d="M${r1(x1)} ${r1(y1)}L${r1(x2 - ux * 4)} ${r1(y2 - uy * 4)}" class="tw-pijl ${klasse}"/><path d="M${r1(a[0])} ${r1(a[1])}L${r1(x2)} ${r1(y2)}L${r1(b[0])} ${r1(b[1])}Z" class="tw-pijlpunt ${klasse}"/>`;
}

/** A name with a thin line to what it names. */
function label({ t, x, y, naar, anker = 'middle', maat = 11 }) {
  let uit = '';
  if (naar) {
    const [nx, ny] = naar;
    uit += `<path d="M${r1(x)} ${r1(y + (ny > y ? 3 : -8))}L${r1(nx)} ${r1(ny)}" class="tw-wijs"/><circle cx="${r1(nx)}" cy="${r1(ny)}" r="1.8" class="tw-wijs-punt"/>`;
  }
  return uit + tekst(x, y, t, { maat, anker, klasse: 'stil' });
}

/** The inside of a knot drawing (without the <svg> around it), so a drawing can hold several knots. */
function knoopBinnen(def) {
  const al = strengen(def);
  const lijst = kruisingen(def, al);
  const isPaal = (st) => ['paal', 'tros', 'kikker', 'ton', 'kern'].includes(st.soort);
  const palen = al.filter(isPaal);
  const touwen = al.filter((st) => !isPaal(st));
  // A piece of a strand from s1 to s2: as the whole strand, or with round caps that sit on the same rope below.
  const deel = (st, s1, s2, los) => {
    if (!los) return band(st, stuk(st, s1, s2), { begin: s1 <= 0, eind: s2 >= st.lengte });
    const verleng = (e) => stuk(st, s1 - (s1 > 0 || st.dicht ? e : 0), s2 + (s2 < st.lengte || st.dicht ? e : 0));
    return band(st, verleng(0.8), { begin: !st.dicht && s1 <= 0, eind: !st.dicht && s2 >= st.lengte }, verleng(2.5));
  };
  // Over every crossing, the part on top again; the highest last, so a crossing near another stays right. A pole
  // needs none: what goes behind it is drawn before it, what goes in front after it.
  const boven = lijst.filter((k) => !isPaal(al[k.a]) && !isPaal(al[k.b])).map((k) => (k.za >= k.zb
    ? { st: al[k.a], s: k.sa, z: k.za, onder: al[k.b], sin: k.sin }
    : { st: al[k.b], s: k.sb, z: k.zb, onder: al[k.a], sin: k.sin }));
  boven.sort((x, y) => x.z - y.z);
  const opnieuw = ({ st, s, onder, sin }) => {
    const half = Math.min((onder.dik / 2 + 2) / Math.max(sin, 0.3) + 1, 60);
    return deel(st, s - half, s + half, true);
  };

  let uit = def.voor ?? '';
  if (!palen.length) {
    for (const st of touwen) uit += deel(st, 0, st.lengte, false);
    for (const b of boven) uit += opnieuw(b);
  } else {
    // With a pole: first what lies behind it (z < 0), then the pole, then the rest.
    const stukken = touwen.map((st) => [st, achterVoor(st)]);
    for (const [st, runs] of stukken) for (const r of runs) if (r.achter) uit += deel(st, r.s1, r.s2, r.s1 > 0);
    for (const b of boven) if (b.z < 0) uit += opnieuw(b);
    for (const st of palen) uit += deel(st, 0, st.lengte, false);
    for (const [st, runs] of stukken) for (const r of runs) if (!r.achter) uit += deel(st, r.s1, r.s2, r.s1 > 0);
    for (const b of boven) if (b.z >= 0) uit += opnieuw(b);
  }
  uit += def.na ?? '';
  for (const l of def.labels ?? []) uit += label(l);
  return `<g class="tw">${uit}</g>`;
}

/**
 * A knot drawing. Soorten 'paal', 'tros', 'kikker' and 'ton' are objects: a rope with z < 0 goes behind them.
 * @param def {w, h, titel, strengen: [{p: [[x, y, z?], ...], soort?: 'a'|'b'|'c'|'paal'|'tros'|'kikker'|'ton'|'ring'|'garen', dik?, dicht?,
 *   begin?: 'eind'|'staand', eind?: 'eind'|'staand'}], labels?: [{t, x, y, naar?}], voor?, na?, afwisselend?}
 *   `voor` is drawn under the ropes, `na` on top of them (SVG strings).
 */
export function knoop(def) {
  return svg(def.w, def.h, def.titel, knoopBinnen(def));
}

/** The runs of a strand behind a pole (z < 0) and in front of it, split where z passes 0. */
function achterVoor(st) {
  const q = st.q; const runs = [];
  let begin = 0; let achter = q[0].z < 0;
  for (let i = 1; i < q.length; i++) {
    const nu = q[i].z < 0;
    if (nu === achter) continue;
    const f = q[i - 1].z / (q[i - 1].z - q[i].z);
    const s = q[i - 1].s + f * (q[i].s - q[i - 1].s);
    runs.push({ s1: begin, s2: s, achter }); begin = s; achter = nu;
  }
  runs.push({ s1: begin, s2: st.lengte, achter });
  return runs;
}


// ---- helpers for the drawings of rope itself (afwerken, touwkunde) ----

/** A plain piece of rope along a curve, without crossings. */
export function stukTouw(punten, soort = 'a', dik = 11, { begin, eind, dicht } = {}) {
  const st = { soort, dik, begin, eind, dicht };
  return band(st, bocht(punten, dicht), { begin: true, eind: true });
}

/** A straight piece of laid rope from x1 to x2 at height y: the band and the lines between the strands. `slag` 1
 *  gives the usual right-hand lay (seen lying down: \), -1 the other way (/). */
export function geslagen(x1, x2, y, dik, soort = 'a', slag = 1, { eind } = {}) {
  let uit = band({ soort, dik, eind }, [{ x: x1, y }, { x: x2, y }], { begin: false, eind: true });
  const stap = dik * 0.62; const schuin = dik * 0.42 * slag; const h = dik / 2 - 1.6;
  for (let x = x1 + stap / 2; x < x2 - Math.abs(schuin) - 1; x += stap) {
    const a = slag > 0 ? x : x + Math.abs(schuin);
    uit += `<path d="M${r1(a)} ${r1(y - h)}L${r1(a + schuin)} ${r1(y + h)}" class="tw-slag ${soort}"/>`;
  }
  return uit;
}

/**
 * A rope coiled up to hang (the drawing touw-opschieten): loops of the same size, a few turns round the bundle, and a
 * bight of the end through the eye above, to hang it by. The top of the bight is at (150, 12), the bottom at about
 * y 200; place it elsewhere with a transform. Without `begin`, the start of the rope is left out (to draw it on).
 */
export function opgeschotenBos({ begin = true } = {}) {
  // the bight goes through the eye, behind the tops of the loops
  let uit = stukTouw([[147, 66], [141, 40], [142, 20], [150, 12], [158, 20], [159, 40], [153, 66]], 'a', 7);
  // the start of the rope, out from under the loops at the bottom
  if (begin) uit += stukTouw([[140, 192], [124, 192], [112, 194], [100, 198]], 'a', 6, { eind: 'eind' });
  for (let i = 0; i < 6; i++) {
    const dx = (i - 2.5) * 5; const breed = 28 + (i % 3) * 3; const onder = 186 + ((i * 7) % 4) * 4;
    uit += stukTouw([[150, 50], [161, 58], [164, 80], [172 + dx / 2, 112], [150 + dx + breed, 160], [150 + dx + breed * 0.7, onder - 10],
      [150 + dx, onder], [150 + dx - breed * 0.7, onder - 10], [150 + dx - breed, 160], [128 + dx / 2, 112], [136, 80], [139, 58]], 'a', 6, { dicht: true });
  }
  // the turns round the bundle, the end going up behind them
  for (const y of [72, 80, 88, 96]) uit += stukTouw([[129, y - 2], [150, y + 2], [171, y - 2]], 'a', 8);
  return uit;
}

// ---- the eindsplits, at any point of making it (the drawing shows four, the piece in src/doe/touw/ all) ----
// A small 3D model: the rope stands up, its three strands turn round it (right-hand laid). Above the top the strands
// are unlaid, laid in a crown and pulled tight; then each is tucked back down, against the lay, over one strand of
// the rope and under the next. Seen a little from above, drawn back to front in short pieces (as apenvuistBol).

const ES_SLAG = 60;                            // the rope's lay: the height of one full turn of a strand
const ES_RS = 7.5; const ES_DIK = 15;          // a strand: how far its middle is from the axis, how thick it is
const ES_KANT = (32 * Math.PI) / 180;          // seen from this far above
const ES_DIEP = 96;                            // how far down the tucks go
const ES_TEGEN = 0.3;                          // how much the tucks turn against the lay
const ES_REST = 16; const ES_STOMP = 4;        // what sticks out after tucking; what stays after cutting
const glad = (x) => x * x * (3 - 2 * x);
const tussen01 = (x) => Math.min(1, Math.max(0, x));
const rad = (g) => (g * Math.PI) / 180;
const meng = (a, b, f) => a.map((v, i) => v + (b[i] - v) * f);
const lengte3 = (p) => p.slice(1).reduce((som, q, i) => som + Math.hypot(q[0] - p[i][0], q[1] - p[i][1], q[2] - p[i][2]), 0);
/** [r, angle, h] round the axis of the rope to [x, h, z]. */
const rond = ([r, a, h]) => [r * Math.cos(a), h, r * Math.sin(a)];
const esHoek = (k) => rad(115 + 120 * k);     // where strand k comes out of the top of the rope
const touwHoek = (k, h) => esHoek(k) - (2 * Math.PI * h) / ES_SLAG;

/** A path of points every `stap` along it. */
function verdeel3(p, stap = 2) {
  const uit = [p[0]];
  for (let i = 1; i < p.length; i++) {
    const n = Math.max(1, Math.ceil(Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1], p[i][2] - p[i - 1][2]) / stap));
    for (let k = 1; k <= n; k++) uit.push(meng(p[i - 1], p[i], k / n));
  }
  return uit;
}
/** A smooth path through the points (Catmull-Rom). */
function vloeiend3(p, n = 6) {
  const uit = [];
  for (let i = 0; i < p.length - 1; i++) {
    const [a, b, c, d] = [p[Math.max(0, i - 1)], p[i], p[i + 1], p[Math.min(p.length - 1, i + 2)]];
    for (let k = 0; k < n; k++) {
      const t = k / n;
      uit.push([0, 1, 2].map((j) => 0.5 * (2 * b[j] + (c[j] - a[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t * t + (3 * b[j] - a[j] - 3 * c[j] + d[j]) * t ** 3)));
    }
  }
  return [...uit, p.at(-1)];
}
/** A path cut in two after length l. */
function knip3(p, l) {
  for (let i = 1; i < p.length; i++) {
    const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1], p[i][2] - p[i - 1][2]);
    if (d < l) { l -= d; continue; }
    const m = meng(p[i - 1], p[i], l / d);
    return [[...p.slice(0, i), m], [m, ...p.slice(i)]];
  }
  return [p, []];
}

// The strands, in [r, degrees from where the strand comes out, h]: unlaid; in a loose crown (each lies over the next
// and its end goes down under that one's bight); pulled tight, the ends hanging down along the rope.
const ES_UIT = [ES_RS + ES_DIK / 2 + 2, -135, -3];   // where an end leaves the tight crown
const ES_LOS = [[ES_RS, 0, 0], [ES_RS + 3, -5, 14], [ES_RS + 7, -10, 28], [ES_RS + 12, -14, 42], [ES_RS + 17, -18, 56], [ES_RS + 22, -21, 70], [ES_RS + 27, -24, 84], [ES_RS + 30, -25, 91], [ES_RS + 32, -26, 98]];
const ES_KROON = [[ES_RS, 0, 0], [ES_RS + 4, -5, 12], [ES_RS + 16, -35, 20], [ES_RS + 20, -75, 16], [ES_RS + 10, -115, 8], [ES_RS + 13, -138, 1], [ES_RS + 15, -142, -12], [ES_RS + 18, -146, -30], [ES_RS + 22, -150, -62]];
/** Where strand k goes when tucked: down against the lay, its distance from the axis going out over a strand of the rope and in under the next. */
function esSteek(k) {
  const a0 = esHoek(k) + rad(ES_UIT[1]); const om = 2 * Math.PI;
  const tot = Math.min(...[0, 1, 2].map((j) => ((((a0 - touwHoek(j, ES_UIT[2])) % om) + om) % om)));   // to the first strand it meets
  const uit = [];
  for (let d = 0; d <= ES_DIEP + 0.01; d += 1.5) {
    const kruising = ((d * (1 + ES_TEGEN) * om) / ES_SLAG - tot) / (om / 3);   // 0, 2, ...: under; 1, 3, ...: over
    const r = ES_RS + 3.5 - 6 * Math.cos(Math.PI * kruising);
    uit.push(rond([ES_UIT[0] + (r - ES_UIT[0]) * glad(tussen01(d / 8)), a0 - (ES_TEGEN * om * d) / ES_SLAG, ES_UIT[2] - d]));
  }
  return uit;
}
const ES_STEEK = lengte3(esSteek(0)); const ES_EIND = ES_STEEK + ES_REST;
const ES_STRAK = [[ES_RS, 0, 0], [ES_RS * 0.6, -20, 6], [ES_RS * 0.5, -60, 10], [ES_RS + 3, -98, 10], [ES_RS + ES_DIK / 2, -118, 7], ES_UIT,
  [ES_UIT[0] + 0.5, -136, ES_UIT[2] - 10], [ES_UIT[0] + 1, -138, ES_UIT[2] - ES_EIND / 2], [ES_UIT[0] + 2, -140, ES_UIT[2] - ES_EIND]];

/** Tubes ({ p: [x, h, z][], eind }) drawn back to front: rope seen from ES_KANT above, the top of the axis at x, y. */
function esBuizen(buizen, x, y) {
  const zie = ([px, h, z]) => ({ x: x + px, y: y - h * Math.cos(ES_KANT) + z * Math.sin(ES_KANT), d: z * Math.cos(ES_KANT) + h * Math.sin(ES_KANT) });
  const pt = (px, py) => `${r1(px)} ${r1(py)}`;
  const norm = (u, v) => { const dx = v.x - u.x; const dy = v.y - u.y; const l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
  const h = ES_DIK / 2; const lijf = h - 1.5; const rand = h - 0.75;
  const stukken = [];
  for (const { p, eind } of buizen) {
    const q = p.map(zie);
    for (let i = 0; i < q.length - 1; i++) {
      const A = q[i]; const B = q[i + 1];
      const [ax, ay] = norm(q[Math.max(0, i - 1)], B); const [bx, by] = norm(A, q[Math.min(q.length - 1, i + 2)]);
      const zij = (f) => `M${pt(A.x + ax * f, A.y + ay * f)}L${pt(B.x + bx * f, B.y + by * f)}`;
      stukken.push({ d: (A.d + B.d) / 2, svg: `<path d="${zij(lijf)}L${pt(B.x - bx * lijf, B.y - by * lijf)}L${pt(A.x - ax * lijf, A.y - ay * lijf)}Z" class="tw-lijf-vul tw-naad a"/>`
        + `<path d="${zij(rand)}${zij(-rand)}" class="tw-rand a" stroke-width="1.5" stroke-linecap="round"/>`
        + `<path d="M${pt(A.x, A.y)}L${pt(B.x, B.y)}" class="tw-kern a" stroke-width="${r1(ES_DIK * 0.22)}" stroke-linecap="round"/>` });
    }
    if (eind) {
      const E = q.at(-1);
      stukken.push({ d: E.d + 0.01, svg: `<circle cx="${r1(E.x)}" cy="${r1(E.y)}" r="${r1(h)}" class="tw-rand-vul a"/><circle cx="${r1(E.x)}" cy="${r1(E.y)}" r="${r1(lijf)}" class="tw-lijf-vul a"/>` });
    }
  }
  return stukken.sort((a, b) => a.d - b.d).map((s) => s.svg).join('');
}

/**
 * The eindsplits at point w (0 = the strands unlaid, 1 = the crown laid, 2 = pulled tight, 3 = tucked back, 4 = the
 * ends cut off), on a rope standing at x, its top at y, down to onder. Returns the inside of a drawing.
 */
export function eindsplitsStand(w, x, y, onder) {
  const diep = (onder - y) / Math.cos(ES_KANT);
  const touw = [0, 1, 2].map((k) => {
    const p = []; for (let h = -diep; h <= 0.01; h += 2.5) p.push(rond([ES_RS, touwHoek(k, h), h]));
    return { p };
  });
  const steek = glad(tussen01(w - 2)); const knip = tussen01(w - 3); const val = tussen01((knip - 0.2) / 0.8);
  let vallen = '';
  const strengen = [0, 1, 2].map((k) => {
    const pose = (punten) => punten.map(([r, a, h]) => rond([r, esHoek(k) + rad(a), h]));
    let p;
    // laying the crown: one strand after the other
    if (w <= 1) p = vloeiend3(pose(ES_LOS.map((q, i) => meng(q, ES_KROON[i], glad(tussen01(w * 1.6 - k * 0.3))))));
    else if (w <= 2) p = vloeiend3(pose(ES_KROON.map((q, i) => meng(q, ES_STRAK[i], glad(w - 1)))));
    else {
      // tucking: the end goes first along where it is tucked, the rest of the strand hangs from where it came out
      const [in_] = knip3(esSteek(k), ES_STEEK * steek);
      const F = in_.at(-1); const rest = ES_EIND - lengte3(in_);
      const [ux, , uz] = rond([1, Math.atan2(F[2], F[0]), 0]); const a = Math.min(rest, 6) / 6;
      const H = [F[0] + ux * 5 * a, F[1] - 3 * a, F[2] + uz * 5 * a];
      p = [...vloeiend3(pose(ES_STRAK.slice(0, 6))), ...in_.slice(1), H, ...(rest > 6 ? [[H[0] + ux * 2, H[1] - rest + 6, H[2] + uz * 2]] : [])];
    }
    p = verdeel3(p);
    if (knip > 0) {
      // cut: a stub stays, the rest drops away
      const [blijft, los] = knip3(p, lengte3(p) - ES_REST + ES_STOMP);
      if (val < 1 && los.length > 1) {
        vallen += `<g transform="translate(0 ${r1(150 * val * val)})" opacity="${r1(1 - val * val)}">${esBuizen([{ p: los, eind: true }], x, y)}</g>`;
      }
      return { p: blijft };
    }
    return { p, eind: true };
  });
  return esBuizen([...touw, ...strengen], x, y) + vallen;
}

// ---- the drawings ----

// Platte knoop and oudewijvenknoop: the same two ropes, the same shape; only four crossings differ. Laid out like the
// public-domain drawings Square knot.svg and Granny knot.svg on Wikimedia Commons (CountingPine), crossings checked
// against them: in the platte knoop both parts of a rope go over (or both under) the bight of the other.
const PLAT_A = [[10, 120], [98, 120], [122, 121], [158, 140], [186, 160], [212, 150], [218, 120], [218, 64], [212, 34], [186, 24], [158, 44], [122, 63], [98, 64], [58, 64]];
const PLAT_B = [[306, 120], [218, 120], [194, 120], [158, 140], [130, 160], [104, 150], [98, 120], [98, 64], [104, 34], [130, 24], [158, 44], [194, 64], [218, 64], [258, 64]];
const metZ = (punten, z) => punten.map(([x, y], i) => [x, y, z[i]]);
const platLabels = [
  { t: 'staand part', x: 40, y: 150, naar: [30, 122] },
  { t: 'werkend eind', x: 52, y: 36, naar: [64, 62] },
];

/** Points moved: x' = ax*x + bx*y + cx, y' = ay*x + by*y + cy (to turn, mirror or shrink a drawing). */
const zet = (punten, [ax, bx, cx, ay, by, cy]) => punten.map(([x, y, z]) => [r1(ax * x + bx * y + cx), r1(ay * x + by * y + cy), z]);

// Schootsteek: the thin rope (A) comes in under the bight of the thick one (B), wraps around both legs of the bight
// and goes out under itself; both short ends on the same side. Traced from the public-domain photo
// "Schotstek rechts.jpg" (Markus Bärlocher, Wikimedia Commons).
const SCHOOT_A = [[318, 100, -1], [274, 100, -1], [243, 104, 0], [200, 124, 1], [161, 144, 1], [134, 154, 1], [100, 160, 0.5], [60, 152, 0],
  [40, 130, -1], [38, 108, -1], [40, 80, -1], [42, 66, -1], [50, 40, 0], [73, 28, 0.5], [110, 28, 1], [140, 40, 1], [151, 60, 1], [158, 90, 0.5],
  [161, 118, 0], [161, 144, -1], [159, 168, 1], [158, 214, 1]];
/** A quarter turn to the left, for the paalsteek. */
const KWART = [0, 1, 40, -1, 0, 330];
const SCHOOT_B = [[5, 66, 0], [42, 66, 1], [107, 64, 0], [151, 58, -1], [192, 52, 0], [236, 54, 0.5], [263, 80, 1], [269, 100, 1], [264, 130, 0.5],
  [243, 162, 0], [202, 174, 0], [170, 172, -0.5], [158, 169, -1], [134, 158, -1], [110, 142, 0], [90, 128, 0.5], [42, 112, 1], [25, 108, 1]];

/** The mastworp around a lying pole at y = 96 (see touw-mastworp), from the working end to the standing part. */
const MASTWORP = [[150, 12, 1], [150, 40, 1], [150, 96, 1], [150, 118, 1], [140, 132, 0.4], [127, 137, 0], [114, 132, -0.4], [106, 118, -1], [104, 96, -1],
        [106, 74, -1], [114, 58, -0.4], [126, 53, 0], [137, 60, 1], [150, 80, 2], [170, 104, 2], [190, 122, 1], [204, 134, 0.4], [214, 136, 0],
        [223, 126, -0.4], [227, 112, -1], [227, 80, -1], [222, 64, -0.4], [208, 54, 0], [190, 58, 0.6], [174, 72, 1], [170, 96, 1], [170, 150, 1], [170, 210, 1]];

/** The achtknoop, from the standing part to the end: half of it up to the middle, the other half the same turned
 *  half round, so both loops are alike and the two ends lie on one line. */
const ACHT_HELFT = [[6, 80, 0], [60, 80, 1], [96, 80, 1], [120, 72, 0], [146, 50, -1], [180, 40, 0], [212, 52, 0.5], [224, 80, 1], [212, 108, 0.5],
  [184, 120, 0], [162, 110, -1]];
const ACHT = [...ACHT_HELFT, [150, 80, 0], ...ACHT_HELFT.toReversed().map(([x, y, z]) => [300 - x, 160 - y, -z])];

/** Mastworp met voorslag around a lying pole at y = 96, from the working end to the standing part. */
const VOORSLAG = [[128, 10, 1], [128, 40, 1], [128, 96, 1], [128, 118, 1], [122, 132, 0.4], [112, 136, 0], [104, 128, -0.4], [102, 110, -1], [102, 82, -1],
  [106, 64, -0.4], [112, 56, 0], [118, 60, 0.6], [124, 70, 1.5], [128, 76, 2], [150, 98, 2], [170, 118, 2], [180, 128, 1], [186, 136, 0.4], [192, 138, 0],
  [188, 122, -0.6], [176, 104, -1], [158, 80, -1], [146, 64, -0.4], [140, 56, 0], [146, 60, 0.6], [152, 68, 1.5], [170, 86, 2], [190, 108, 2],
  [204, 126, 1], [210, 135, 0.4], [218, 138, 0], [220, 124, -0.6], [212, 100, -1], [196, 72, -1], [186, 58, -0.4], [178, 54, 0], [172, 62, 0.6],
  [170, 80, 1], [170, 96, 1], [170, 118, 1], [171, 140, 1], [178, 172, 1], [194, 208, 1]];

/** Vissersknoop: one rope with its overhand knot around the other (which runs along y = 72): a round turn around it,
 *  and the end back through that turn, out alongside the other rope. */
const VISSER = [[6, 100, 0], [60, 100, 0], [140, 100, 0], [172, 100, 1], [200, 100, 0], [222, 100, -1], [236, 92, 0], [240, 80, 1], [234, 64, 1],
  [218, 52, 0.5], [198, 50, 0], [180, 58, -0.5], [170, 72, -1], [168, 88, -1], [172, 100, -1], [182, 114, 0], [200, 122, 0], [214, 116, 0.5],
  [222, 100, 1], [230, 90, 0], [240, 84, -1], [256, 82, -0.5], [272, 82, 0], [300, 82, 0]];

/** A rope path laid double: the two sides of the path at distance d, as points [x, y, z] (z as on the path). For a
 *  knot tied with the rope doubled, such as the dubbele achtknoop. */
function dubbel(punten, d) {
  const q = bocht(punten, false);
  const links = []; const rechts = [];
  for (let i = 0; i < q.length; i += 2) {
    const a = q[Math.max(i - 1, 0)]; const b = q[Math.min(i + 1, q.length - 1)];
    const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / l; const ny = (b.x - a.x) / l;
    links.push([r1(q[i].x + nx * d), r1(q[i].y + ny * d), r1(q[i].z * 100) / 100]);
    rechts.push([r1(q[i].x - nx * d), r1(q[i].y - ny * d), r1(q[i].z * 100) / 100]);
  }
  return [links, rechts];
}

/**
 * An apenvuist around c, of rope dik thick: three sets of three turns, each set round its own axis, seen a little from
 * above and from the side. The turns lie on a rounded cube (|x|^4 + |y|^4 + |z|^4 = R^4), as the knot does when it is
 * pulled tight: on each face the strands of one set lie straight and side by side, and bend only at the edge. The knot
 * helper above lays ropes in a plane; this one has a back and many crossings close together, so the turns are cut into
 * short pieces and painted from back to front, with the core of the ball between the back and the front. Where two sets
 * cross on the front, the set after a set lies over it: the second over the first, the third over the second, the
 * first over the third.
 */
function apenvuistBol(c, R, dik) {
  const rad = (g) => (g * Math.PI) / 180;
  const [a, b] = [rad(35), rad(-28)];
  const draai = ([x, y, z]) => {
    const x1 = x * Math.cos(a) + z * Math.sin(a); const z1 = -x * Math.sin(a) + z * Math.cos(a);
    return [x1, y * Math.cos(b) - z1 * Math.sin(b), y * Math.sin(b) + z1 * Math.cos(b)];
  };
  const maat = (p) => p.reduce((s, v) => s + v ** 4, 0);
  const N = 60; const uit = dik * 1.05;
  const slagen = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[0, 1, 0], [0, 0, 1], [1, 0, 0]], [[0, 0, 1], [1, 0, 0], [0, 1, 0]]]
    .flatMap(([e, u, v], set) => [-uit, 0, uit].map((d) => ({ set, q: Array.from({ length: N }, (_, i) => {
      // the turn lies in the plane at d along the axis: from the axis out along the direction t, to the surface
      const t = (2 * Math.PI * i) / N; const richting = [0, 1, 2].map((k) => Math.cos(t) * u[k] + Math.sin(t) * v[k]);
      const op = (s) => [0, 1, 2].map((k) => d * e[k] + s * richting[k]);
      let binnen = 0; let buiten = 2 * R;
      for (let j = 0; j < 30; j++) { const m = (binnen + buiten) / 2; if (maat(op(m)) > R ** 4) buiten = m; else binnen = m; }
      const p = op(binnen); const [x, y, z] = draai(p);
      return { x: c[0] + x, y: c[1] - y, z, zicht: draai(p.map((w) => w ** 3))[2] > 0 };
    }) })));
  const voorkant = slagen.flatMap(({ set, q }) => q.filter((p) => p.zicht).map((p) => ({ ...p, set })));
  // the core: the outline of the cube, a bit smaller (the hull of points all over it)
  const omtrek = [];
  for (let i = 1; i < 24; i++) for (let j = 0; j < 48; j++) {
    const th = (Math.PI * i) / 24; const ph = (2 * Math.PI * j) / 48;
    const p = [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)]; const f = (0.8 * R) / maat(p) ** 0.25;
    const [x, y] = draai(p.map((w) => w * f)); omtrek.push([c[0] + x, c[1] - y]);
  }
  omtrek.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const draait = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
  const helft = (pts) => pts.reduce((h, p) => { while (h.length > 1 && draait(h.at(-2), h.at(-1), p) <= 0) h.pop(); h.push(p); return h; }, []);
  const kern = [...helft(omtrek).slice(0, -1), ...helft(omtrek.toReversed()).slice(0, -1)];
  const h = dik / 2; const lijf = h - 1.5; const rand = h - 0.75;
  const norm = (u, v) => { const dx = v.x - u.x; const dy = v.y - u.y; const l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
  const pt = (x, y) => `${r1(x)} ${r1(y)}`;
  const stukken = [{ z: 0, svg: `<path d="M${kern.map(([x, y]) => pt(x, y)).join('L')}Z" class="tw-rand-vul a"/>` }];
  // a piece of the back well inside the core is not seen
  const achterKern = (p) => kern.every((k, i) => { const l = kern[(i + 1) % kern.length]; return draait(k, l, [p.x, p.y]) / Math.hypot(l[0] - k[0], l[1] - k[1]) > h; });
  for (const { set, q } of slagen) for (let i = 0; i < N; i++) {
    const A = q[i]; const B = q[(i + 1) % N]; const zicht = A.zicht && B.zicht;
    if (!zicht && achterKern(A) && achterKern(B)) continue;
    let boven = 0;   // on the front: under (-1) or over (1) the nearest other set
    if (zicht) {
      let dichtst = dik;
      for (const o of voorkant) {
        const afstand = Math.hypot(o.x - (A.x + B.x) / 2, o.y - (A.y + B.y) / 2);
        if (o.set !== set && afstand < dichtst) { dichtst = afstand; boven = o.set === (set + 1) % 3 ? -1 : 1; }
      }
    }
    const [ax, ay] = norm(q[(i - 1 + N) % N], B); const [bx, by] = norm(A, q[(i + 2) % N]);
    const zij = (f) => `M${pt(A.x + ax * f, A.y + ay * f)}L${pt(B.x + bx * f, B.y + by * f)}`;
    const zijTerug = (f) => `L${pt(B.x - bx * f, B.y - by * f)}L${pt(A.x - ax * f, A.y - ay * f)}`;
    stukken.push({ z: (zicht ? 1000 : -1000) + (A.z + B.z) / 2 + 100 * boven,
      svg: `<path d="${zij(lijf)}${zijTerug(lijf)}Z" class="tw-lijf-vul tw-naad a"/><path d="${zij(rand)}${zij(-rand)}" class="tw-rand a" stroke-width="1.5" stroke-linecap="round"/>`
        + `<path d="M${pt(A.x, A.y)}L${pt(B.x, B.y)}" class="tw-kern a" stroke-width="${r1(dik * 0.28)}" stroke-linecap="round"/>` });
  }
  return stukken.sort((x, y) => x.z - y.z).map((st) => st.svg).join('');
}

/** Kikker beleggen from above, with the cleat at y = 84: the line straight from the boat to the far side of the base,
 *  once round it, an eight over the horns, and then `slot` (the last half hitch, from the near side); see
 *  touw-kikker-beleggen. */
function kikker(slot, titel, labels = []) {
  const begin = [[6, 180, 1], [100, 141, 1], [170, 111, 0.5], [198, 98, 0.2], [206, 92, 0], [208, 84, -1], [204, 71, 0], [194, 67, 0.5], [160, 67, 0.5], [126, 67, 0.5], [116, 71, 0],
    [112, 84, -1], [116, 94, 0],
    [130, 96, 1], [160, 84, 2], [194, 70, 2], [218, 60, 1.5], [234, 58, 1], [244, 68, 0.5], [242, 84, -1], [234, 102, 0], [218, 108, 0.5],
    [194, 98, 1.5], [160, 84, 3], [126, 70, 2], [102, 60, 1], [86, 60, 0.5], [76, 72, 0], [78, 84, -1], [84, 102, 0], [100, 112, 0.5]];
  return {
    w: 280, h: 184, titel, voor: '<rect x="128" y="72" width="64" height="24" rx="8" class="tw-metaal"/>',
    strengen: [{ p: [[78, 84], [242, 84]], soort: 'kikker', dik: 18 }, { p: [...begin, ...slot], dik: 9, begin: 'staand', eind: 'eind' }],
    labels: [{ t: 'kikker', x: 272, y: 30, anker: 'end' }, { t: 'naar de boot', x: 60, y: 176, anker: 'start' }, ...labels],
  };
}

/** A pole across the drawing at height y. */
const paal = (y, x1 = 8, x2 = 312, dik = 30) => ({ p: [[x1, y], [x2, y]], soort: 'paal', dik });

export const TEKENINGEN = {
  // Mastworp around a lying pole, both ends hanging: the riding turn (the diagonal) crosses over both, and both come
  // out from under it. As Mastworp.svg and Webeleinenstek1.svg on Wikimedia Commons, and ABOK #1245.
  'touw-mastworp': {
    w: 320, h: 214, titel: 'Mastworp om een liggende paal: twee slagen om de paal, en de schuine slag in het midden ligt over beide einden heen.',
    strengen: [
      paal(96),
      { p: MASTWORP, begin: 'eind', eind: 'staand' },
    ],
    labels: [{ t: 'werkend eind', x: 206, y: 24, naar: [156, 30] }, { t: 'staand part', x: 232, y: 196, naar: [176, 186] }, { t: 'paal', x: 286, y: 70, naar: [286, 84] }],
  },
  // Halve steek: around the pole, then the end once around its own standing part and under itself (an overhand
  // knot around the standing part; Scoutpedia "Halve steek", ABOK #50).
  'touw-halve-steek': {
    w: 320, h: 196, titel: 'Halve steek: het touw gaat om de paal, en het eind gaat één keer om het staande part en onder zichzelf door.',
    strengen: [
      { p: [[60, 6], [60, 190]], soort: 'paal', dik: 26 },
      { p: [[314, 70, 1], [200, 70, 1], [162, 70, 1], [130, 70, -1], [100, 70, 0], [60, 70, 1], [44, 76, 0.5], [38, 92, 0], [46, 106, -0.5], [60, 111, -1],
        [82, 112, 0], [118, 112, 1], [146, 108, 0.5], [161, 92, 0], [163, 70, -1], [157, 51, 0], [142, 44, 0.5], [129, 53, 1], [130, 70, 1],
        [123, 94, 0], [118, 112, -1], [112, 132, -1], [104, 152, -1]], begin: 'staand', eind: 'eind' },
    ],
    labels: [{ t: 'staand part', x: 262, y: 52, naar: [262, 66] }, { t: 'werkend eind', x: 128, y: 180, naar: [105, 150] }, { t: 'paal', x: 42, y: 178, anker: 'end', naar: [50, 162] }],
  },
  // Achtknoop: an alternating figure of eight, four crossings (ABOK #570).
  'touw-achtknoop': {
    w: 300, h: 160, titel: 'Achtknoop: het eind maakt een acht om het staande part heen; een dikke stop aan het eind van het touw.',
    strengen: [
      { p: ACHT, begin: 'staand', eind: 'eind' },
    ],
    labels: [{ t: 'staand part', x: 40, y: 112, naar: [30, 82] }, { t: 'werkend eind', x: 260, y: 112, naar: [270, 82] }],
  },
  'touw-schootsteek': {
    w: 320, h: 222, titel: 'Schootsteek: het dunne touw gaat door de bocht van het dikke, om beide benen van de bocht heen en onder zichzelf door.',
    strengen: [
      { p: SCHOOT_B, soort: 'a', dik: 16, begin: 'staand', eind: 'eind' },
      { p: SCHOOT_A, soort: 'b', dik: 10, begin: 'staand', eind: 'eind' },
    ],
    labels: [{ t: 'bocht in het dikke touw', x: 250, y: 200, naar: [262, 132] }],
  },
  // Paalsteek: the bight of the end around the standing part, the small loop of the standing part around both legs of
  // that bight (as in the schootsteek), with the standing part hanging from the top. Crossings as the blad tells it:
  // in the small loop the part toward the end lies on top, the end comes up through it from below, goes behind the
  // standing part and back down. The short end lies inside the eye: the standard bowline, not the cowboy one.
  'touw-paalsteek': {
    w: 250, h: 262, titel: 'Paalsteek: een vaste lus. Het eind komt door het kleine lusje omhoog, gaat om het staande part heen en weer terug door het lusje.',
    strengen: [
      { p: [[120, 2, 0], [120, 28, 0], [120, 46, 1], [122, 62, 0], [130, 82, -1], [146, 100, -1], [160, 114, -1], [172, 124, -0.5], [178, 138, 0],
        [170, 151, 0.5], [160, 154, 1], [128, 156, 1], [96, 155, 1], [80, 148, 0.5], [72, 128, 0], [78, 104, -0.5], [96, 88, -1], [114, 84, 0],
        [130, 84, 1], [146, 85, 0], [160, 86, -1], [176, 90, -0.5], [192, 102, 0], [200, 128, 0], [200, 182, 0], [188, 228, 0], [152, 252, 0],
        [110, 250, 0], [86, 228, 0], [86, 196, 0], [96, 172, 0], [96, 155, -1], [96, 120, 0], [96, 88, 1], [98, 62, 0], [106, 44, -0.5], [122, 37, -1],
        [142, 40, -0.5], [157, 54, 0], [160, 86, 1], [160, 114, 1], [160, 154, -1], [160, 176, 0], [160, 196, 0]], begin: 'staand', eind: 'eind' },
    ],
    labels: [{ t: 'staand part', x: 128, y: 14, anker: 'start' }, { t: 'lus', x: 168, y: 232 }, { t: 'werkend eind', x: 36, y: 248, naar: [146, 194] },
      { t: 'lusje', x: 34, y: 120, naar: [70, 128] }],
  },
  // Dubbele paalsteek (ABOK #1080): the paalsteek above with the rope doubled up to and around the lusje. The bight
  // comes up through the lusje and lies round the standing parts as the collar; the two strands of the doubled rope
  // each make a loop below.
  'touw-dubbele-paalsteek': () => {
    const p = TEKENINGEN['touw-paalsteek'].strengen[0].p;
    const [binnen, buiten] = dubbel(p.slice(0, 24), 5.5);
    const lusA = [[208, 152, 0], [220, 196, 0], [212, 236, 0], [172, 256, 0], [120, 254, 0], [92, 232, 0], [90, 200, 0], [96, 178, 0]];
    const lusB = [[160, 180, 0], [158, 210, 0], [170, 232, 0], [190, 230, 0], [198, 204, 0], [196, 160, 0]];
    return knoop({
      w: 260, h: 262, titel: 'Dubbele paalsteek: een paalsteek met het touw dubbel. De bocht komt door het lusje omhoog en ligt om de twee staande parten heen; onder hangen twee lussen.',
      strengen: [{ p: [...buiten, ...lusA, ...p.slice(31, 42), ...lusB, ...binnen.toReversed()] }],
      labels: [{ t: 'twee staande parten', x: 132, y: 14, anker: 'start' }, { t: 'bocht', x: 36, y: 40, naar: [104, 46] },
        { t: 'lusje, dubbel', x: 68, y: 186, anker: 'end', naar: [78, 150] }, { t: 'twee lussen', x: 8, y: 256, anker: 'start' }],
    });
  },
  // Rondtorn met twee halve steken: the rope goes twice around the pole (a round turn) and then makes two half
  // hitches around its own standing part, which together are a mastworp around it (ABOK #1720).
  'touw-rondtorn': {
    w: 300, h: 218, titel: 'Rondtorn met twee halve steken: twee keer om de paal, en dan met twee halve steken om het eigen staande part.',
    strengen: [
      paal(40, 8, 292, 26),
      { p: [[120, 216, 0], [120, 170, 0], [120, 110, 0], [120, 70, 0.5], [120, 40, 1], [121, 22, 0.5], [128, 13, 0], [135, 21, -0.5], [136, 40, -1],
        [138, 60, -0.5], [144, 68, 0], [150, 60, 0.5], [152, 40, 1], [153, 22, 0.5], [160, 13, 0], [167, 21, -0.5], [168, 40, -1], [170, 60, -0.5],
        [178, 84, 0], [188, 120, 0.5], [190, 146, 1],
        ...zet(MASTWORP.slice(0, -1).reverse(), [0, 0.55, 120 - 96 * 0.55, 0.55, 0, 150 - 165 * 0.55])], begin: 'staand', eind: 'eind' },
    ],
    labels: [{ t: 'rondtorn', x: 232, y: 16, naar: [172, 24] }, { t: 'twee halve steken', x: 214, y: 196, naar: [150, 168] }, { t: 'staand part', x: 108, y: 212, anker: 'end', naar: [115, 198] }],
  },
  // Timmersteek, as in the public-domain figure "EB1911 - Knot - Fig. 20 - Timber Hitch" (Encyclopaedia Britannica
  // 1911) and ABOK #1665: the standing part goes down behind the log, round it and up the front; above the log the
  // end goes once round the standing part and is then twisted round its own part (the piece that just came up the
  // front), not round the standing part. Pulling clamps the twists against the wood.
  'touw-timmersteek': {
    w: 300, h: 196, titel: 'Timmersteek: het touw gaat om de balk, het eind om het staande part, en dan een paar keer om zijn eigen part gedraaid.',
    strengen: [
      { p: [[8, 112], [292, 112]], soort: 'paal', dik: 58 },
      { p: (() => {
        const p = [[136, 4, 0], [136, 50, 0], [136, 70, 0], [136, 86, -1], [136, 112, -1], [136, 140, -1], [138, 152, -0.6], [148, 161, 0], [160, 160, 0.5],
          [168, 150, 1], [170, 140, 1], [170, 112, 1], [170, 86, 1], [170, 66, 1], [167, 54, 0.6], [157, 46, 0.2], [136, 44, -1], [122, 48, -0.4],
          [118, 58, 0], [124, 66, 0.5], [136, 68, 1], [152, 70, 1], [162, 74, 0.6]];
        // twists round the part at x = 170: behind it (z 0.5 < 1), round, and over it (z 2); after the last one behind
        // it, the end comes out on the right and points down
        for (const y of [78, 102]) p.push([170, y, 0.5], [182, y + 3, 0.6], [186, y + 8, 0.8], [180, y + 12, 1.6], [170, y + 13, 2],
          [158, y + 16, 1.2], [154, y + 21, 0.6], [162, y + 23, 0.5]);
        p.push([170, 126, 0.5], [182, 130, 0.6], [190, 140, 1], [200, 154, 1.2]);
        return p;
      })(), dik: 10, begin: 'staand', eind: 'eind' },
    ],
    labels: [{ t: 'balk', x: 262, y: 160, naar: [262, 136] }, { t: 'staand part', x: 196, y: 20, naar: [140, 24] },
      { t: 'eind om zijn eigen part gedraaid', x: 6, y: 188, anker: 'start', naar: [154, 100] }],
  },
  // Slipsteek: a half hitch whose end goes through as a bight; a pull on the short end pulls it loose.
  'touw-slipsteek': {
    w: 320, h: 196, titel: 'Slipsteek: een halve steek waarbij het eind dubbel (als bocht) onder zichzelf door gaat; trek je aan het korte eind, dan schiet hij los.',
    strengen: [
      { p: [[60, 6], [60, 190]], soort: 'paal', dik: 26 },
      { p: [[314, 70, 1], [200, 70, 1], [162, 70, 1], [130, 70, -1], [100, 70, 0], [60, 70, 1], [44, 76, 0.5], [38, 92, 0], [46, 106, -0.5], [60, 111, -1],
        [82, 112, 0], [104, 112, 1], [118, 112, 1], [146, 108, 0.5], [161, 92, 0], [163, 70, -1], [157, 51, 0], [142, 44, 0.5], [129, 53, 1], [130, 70, 1],
        [124, 94, 0], [119, 112, -1], [116, 132, -0.5], [110, 150, 0], [98, 154, 0], [92, 142, -0.5], [101, 112, -1], [104, 92, 0.5], [106, 70, 1], [110, 46, 0.5], [114, 30, 0]],
        begin: 'staand', eind: 'eind' },
    ],
    labels: [{ t: 'staand part', x: 262, y: 52, naar: [262, 66] }, { t: 'trek hier: los', x: 200, y: 24, anker: 'start', naar: [116, 36] }, { t: 'paal', x: 42, y: 178, anker: 'end', naar: [50, 162] }],
  },
  // Mastworp met voorslag: a mastworp with an extra riding turn; both cross the standing part, and the pull goes
  // along the pole to the side of those turns (ABOK #1735, #1736; Theo Slijkerman, knoopenzo.nl, derdehandsteek).
  'touw-mastworp-voorslag': {
    w: 320, h: 214, titel: 'Mastworp met voorslag: twee schuine slagen over het staande part en een halve steek aan de andere kant. Trek schuin, naar de kant van de twee slagen.',
    strengen: [paal(96), { p: VOORSLAG, begin: 'eind', eind: 'staand' }],
    labels: [{ t: 'werkend eind', x: 76, y: 22, naar: [124, 26] }, { t: 'trek', x: 252, y: 196, anker: 'start' }],
    na: pijl([206, 182], [240, 206]),
  },
  // Derdehandsteek: the same knot (De zeilsport, Van Kampen 1923, p. 94: "draaireepsteek, ook wel genoemd
  // derdehandsteek of mastworp met voorslag"), here on a rope, where a derdehand (a tackle) is hooked to it.
  'touw-derdehandsteek': {
    w: 320, h: 214, titel: 'Derdehandsteek: een mastworp met voorslag op een dikke tros, om er bijvoorbeeld een takel aan te hangen. Trek schuin, naar de kant van de twee slagen.',
    strengen: [{ p: [[8, 96], [312, 96]], soort: 'tros', dik: 30 }, { p: VOORSLAG, begin: 'eind', eind: 'staand' }],
    labels: [{ t: 'tros', x: 286, y: 70, naar: [286, 84] }, { t: 'trek', x: 252, y: 196, anker: 'start' }],
    na: pijl([206, 182], [240, 206]),
  },
  // Constrictorknoop: a mastworp in which the end also goes under the first turn: an overhand knot under the riding
  // turn (ABOK #1249).
  'touw-constrictorknoop': {
    w: 300, h: 214, titel: 'Constrictorknoop: als een mastworp, maar het eind gaat ook onder de eerste slag door, zodat er een knoopje onder de schuine slag zit.',
    strengen: [
      paal(96, 8, 292),
      { p: [[170, 212, 1], [170, 150, 1], [170, 96, 1], [172, 74, 0.8], [182, 58, 0.4], [196, 52, 0], [212, 58, -0.4], [222, 76, -1], [222, 112, -1],
        [216, 130, -0.4], [206, 138, 0], [198, 132, 0.6], [186, 116, 2], [170, 101, 2], [150, 80, 2], [134, 64, 1], [126, 56, 0.4], [116, 52, 0],
        [106, 58, -0.4], [102, 76, -1], [102, 112, -1], [106, 128, -0.4], [116, 138, 0], [128, 130, 0.4], [146, 116, 0.5], [170, 112, 0.5],
        [186, 114, 0.5], [230, 110, 0.6], [262, 106, 0.6]], begin: 'staand', eind: 'eind' },
    ],
    labels: [{ t: 'eind', x: 266, y: 136, naar: [256, 108] }, { t: 'staand part', x: 216, y: 196, naar: [174, 190] }],
  },
  'touw-dubbele-schootsteek': {
    w: 320, h: 222, titel: 'Dubbele schootsteek: als de schootsteek, maar het dunne touw gaat twee keer om de bocht heen en twee keer onder zichzelf door.',
    strengen: [
      { p: [[5, 66, 0], [42, 66, 1], [107, 64, 0], [151, 58, -1], [170, 55, 0], [188, 53, 1], [208, 52, 0], [230, 53, -1], [246, 58, 0], [263, 80, 1],
        [269, 100, 1], [264, 130, 0.5], [246, 158, -0.5], [232, 167, -1], [214, 173, 0], [198, 174, 0.6], [184, 173, 1], [172, 171, 0], [159, 169, -1],
        [134, 158, -1], [110, 142, 0], [90, 128, 0.5], [42, 112, 1], [25, 108, 1]], soort: 'a', dik: 16, begin: 'staand', eind: 'eind' },
      { p: [...SCHOOT_A.slice(0, -1), [162, 182, 0.6], [174, 188, 0.2], [184, 176, -1], [186, 150, -1], [186, 120, -1], [188, 84, -1], [188, 53, -1],
        [192, 34, -0.3], [208, 24, 0.4], [224, 32, 0.8], [230, 52, 1], [232, 80, 0], [232, 109, -0.8], [233, 140, 0.4], [232, 166, 1], [234, 208, 1]],
        soort: 'b', dik: 10, begin: 'staand', eind: 'eind' },
    ],
    labels: [{ t: 'twee slagen om de bocht', x: 112, y: 12, naar: [150, 30] }],
  },
  // Vissersknoop: two ropes side by side, each with an overhand knot around the other; the two knots are the
  // same, turned half round (ABOK #1414).
  'touw-vissersknoop': {
    w: 320, h: 172, titel: 'Vissersknoop: twee touwen naast elkaar, elk met een knoopje om het andere touw. Trek je aan de lange einden, dan schuiven de knoopjes tegen elkaar.',
    strengen: [
      { p: VISSER, soort: 'a', dik: 10, begin: 'staand', eind: 'eind' },
      { p: zet(VISSER, [-1, 0, 320, 0, -1, 172]), soort: 'b', dik: 10, begin: 'staand', eind: 'eind' },
    ],
  },
  // Chirurgenknoop: a platte knoop whose first half has one wrap extra (three crossings where the platte knoop has
  // one); the second half as in the platte knoop.
  'touw-chirurgenknoop': {
    w: 316, h: 178, titel: 'Chirurgenknoop: een platte knoop waarvan de eerste helft een slag extra heeft, zodat hij niet terugschiet.',
    strengen: [
      { p: [[10, 120, 1], [98, 120, 1], [122, 122, 0], [140, 140, -1], [150, 147, 0], [158, 140, 1], [166, 133, 0], [176, 140, -1], [190, 158, 0],
        [212, 150, 0.5], [218, 120, 1], [218, 64, 1], [212, 34, 0.5], [186, 24, 0], [158, 44, -1], [122, 63, 0], [98, 64, 1], [58, 64, 1]], soort: 'a', dik: 12, begin: 'staand', eind: 'eind' },
      { p: [[306, 120, -1], [218, 120, -1], [194, 122, 0], [176, 140, 1], [166, 147, 0], [158, 140, -1], [150, 133, 0], [140, 140, 1], [126, 158, 0],
        [104, 150, -0.5], [98, 120, -1], [98, 64, -1], [104, 34, -0.5], [130, 24, 0], [158, 44, 1], [194, 64, 0], [218, 64, -1], [258, 64, -1]], soort: 'b', dik: 12, begin: 'staand', eind: 'eind' },
    ],
    labels: [{ t: 'extra slag', x: 158, y: 174, naar: [158, 152] }],
  },
  // Karaaksteek: the flat carrick bend, over and under in turn everywhere; the short ends diagonally opposite. Traced
  // from the public-domain figure "Chambers 1908 Carrick Bend.png" (Chambers's Twentieth Century Dictionary, 1908;
  // Wikimedia Commons): rope A comes in from the left, goes round the right-hand loop and leaves lower left; rope B
  // comes in lower right, goes round the left-hand loop and leaves upper right. A goes under the first time it meets
  // its own diagonal, as in that figure; the rest follows from over-and-under (ABOK #1439).
  'touw-karaaksteek': {
    w: 316, h: 140, afwisselend: true,
    titel: 'Karaaksteek: twee touwen die om en om over en onder elkaar door gaan. De korte einden komen schuin tegenover elkaar uit.',
    strengen: [
      { p: zet([[50, 57], [90, 61], [125, 66], [163, 73], [190, 84], [220, 98], [250, 106], [278, 106], [300, 98], [313, 82], [315, 62], [306, 42],
        [288, 28], [262, 22], [238, 26], [218, 38], [200, 52], [180, 64], [160, 77], [138, 91], [115, 102], [92, 111], [70, 116]], [1.04, 0, -50.08, 0, 1.04, -0.48]),
        soort: 'a', dik: 11, begin: 'staand', eind: 'eind' },
      { p: zet([[354, 124], [320, 108], [298, 96], [278, 82], [258, 66], [240, 50], [222, 36], [200, 24], [170, 19], [140, 26], [118, 44], [108, 68],
        [112, 92], [128, 108], [155, 114], [185, 110], [208, 99], [230, 84], [255, 68], [280, 52], [302, 38], [322, 27], [338, 20]], [1.04, 0, -50.08, 0, 1.04, -0.48]),
        soort: 'b', dik: 11, begin: 'staand', eind: 'eind' },
    ],
  },
  // Dubbele achtknoop: the achtknoop laid with the rope double; the bight at the end is the eye, on the line of the
  // standing part.
  'touw-dubbele-achtknoop': (() => {
    const [heen, terug] = dubbel(zet([...ACHT.slice(0, -1), [262, 80, 0]], [1.15, 0, -2, 0, 1.15, -12]), 5.5);
    const staart = terug.reverse().filter(([x], i, al) => i < al.length - 12 || x > 40);
    return {
      w: 368, h: 172, titel: 'Dubbele achtknoop: een achtknoop met het touw dubbel; de bocht aan het eind is de vaste lus.',
      strengen: [{ p: [...heen, [314, 89, 0], [330, 98, 0], [348, 94, 0], [356, 80, 0], [348, 66, 0], [330, 62, 0], [314, 71, 0], ...staart], dik: 10, begin: 'staand', eind: 'eind' }],
      labels: [{ t: 'lus', x: 356, y: 128, anker: 'end', naar: [346, 99] }, { t: 'staand part', x: 40, y: 126, naar: [26, 92] }],
    };
  })(),
  // Bunny-ears: the dubbele achtknoop, with the bight split into two ears; what is left of the bight lies round the
  // neck of the knot.
  'touw-bunny-ears': (() => {
    const [heen, terug] = dubbel(zet([...ACHT.slice(0, -1), [262, 80, 0]], [1.15, 0, -2, 0, 1.15, -12]), 5.5);
    const staart = terug.reverse().filter(([x], i, al) => i < al.length - 12 || x > 40);
    return {
      w: 400, h: 172, titel: 'Bunny-ears: een achtknoop op de bocht met twee lussen, de oren. Wat van de bocht over is, ligt om de hals van de knoop.',
      strengen: [{ p: [...heen, [316, 92, 0], [340, 116, 0], [364, 130, 0], [380, 120, 0], [374, 102, 0], [346, 92, 0], [322, 88, -1],
        [300, 98, 0], [290, 86, 1], [290, 70, 1], [300, 58, 0], [322, 68, -1],
        [346, 64, 0], [374, 54, 0], [380, 36, 0], [364, 26, 0], [340, 40, 0], [316, 66, 0], ...staart], dik: 10, begin: 'staand', eind: 'eind' }],
      labels: [{ t: 'twee oren', x: 392, y: 160, anker: 'end', naar: [372, 126] }, { t: 'rest van de bocht', x: 262, y: 22, anker: 'end', naar: [290, 62] },
        { t: 'staand part', x: 40, y: 126, naar: [26, 92] }],
    };
  })(),
  // Vlinderknoop, as it comes off the hand (Animated Knots, hand method): two turns, the turn at the fingertips taken
  // over the other two and back under them; that bight is the loop.
  'touw-vlinderknoop': {
    w: 316, h: 196, titel: 'Vlinderknoop: een vaste lus midden in het touw. Beide einden en de lus kun je belasten.',
    strengen: [{ p: zet([[-98, 20, 1], [-40, 20, 1], [0, 20, 1], [40, 20, 1], [46, 16, 0], [46, 10, 0], [40, 8, -1], [0, -4, -1], [-40, -16, -1], [-48, -19, 0],
      [-38, -19, 1], [-29, -4, 2], [-26, 20, 2], [-24, 28, 2], [-22, 42, 1.5], [-16, 52, 1], [-10, 44, 0.5], [-10, 28, 0.5], [-10, 20, 0.5], [-11, 4, 0.5],
      [-13, -30, 0.5], [-13, -62, 0.5], [-8, -86, 0.5], [0, -92, 0.5], [8, -86, 0.5], [13, -62, 0.5], [13, -30, 0.5], [11, 4, 0.5], [10, 20, 0.5], [10, 28, 0.5],
      [10, 44, 0.5], [16, 52, 1], [22, 42, 1.5], [24, 28, 2], [26, 20, 2], [29, -4, 2], [38, -19, 1], [48, -19, 0], [40, -16, -2], [0, 6, -2], [-40, 28, -2],
      [-48, 30, 0], [-40, 28, 1], [0, 28, 1], [40, 28, 1], [98, 28, 1]], [1.6, 0, 158, 0, 1.25, 122]), dik: 10, begin: 'staand', eind: 'staand' }],
    labels: [{ t: 'lus', x: 186, y: 22, naar: [170, 30] }],
  },
  // Werpankersteek: the rondtorn, then the end round the standing part (in front of it) and under both turns, so it
  // wraps the standing part; then a half hitch. As described by Van Kampen, De zeilsport (1923), p. 94.
  'touw-werpankersteek': {
    w: 300, h: 218, titel: 'Werpankersteek: twee slagen om de paal, het eind om het staande part en onder beide slagen door, en dan een halve steek.',
    strengen: [
      paal(40, 8, 292, 26),
      { p: [[120, 216, 0], [120, 170, 0], [120, 110, 0], [120, 70, 0.5], [120, 40, 1], [121, 22, 0.5], [128, 13, 0], [135, 21, -0.5], [136, 40, -1],
        [138, 60, -0.5], [144, 68, 0], [150, 60, 0.5], [152, 40, 1], [153, 22, 0.5], [160, 13, 0], [167, 21, -0.5], [168, 40, -1], [170, 60, -0.5],
        [176, 74, 0], [150, 84, 0.5], [120, 87, 1], [98, 80, 0.5], [90, 64, 0], [96, 46, 0.3], [110, 41, 0.5], [120, 40, 0.5], [152, 40, 0.5],
        [176, 41, 0.5], [192, 48, 0.5], [202, 66, 0.5], [200, 92, 0.5], [184, 108, 0.2], [150, 111, -0.3], [120, 111, -1], [102, 118, 0], [104, 130, 0.5],
        [120, 132, 1], [136, 126, 1], [146, 112, -1], [152, 100, -1]], begin: 'staand', eind: 'eind' },
    ],
    labels: [{ t: 'onder beide slagen door', x: 230, y: 16, naar: [184, 42] }, { t: 'halve steek', x: 222, y: 150, naar: [140, 128] }, { t: 'staand part', x: 108, y: 212, anker: 'end', naar: [115, 198] }],
  },
  // Prusikknoop, from the side of the legs: three turns above and three below, the legs coming out in the middle;
  // the bridge that joins them lies on the back.
  'touw-prusikknoop': {
    w: 280, h: 206, titel: 'Prusikknoop: een lus van dun touw drie keer om het dikke touw; de twee benen van de lus komen in het midden uit.',
    strengen: [
      { p: [[150, 0], [150, 206]], soort: 'tros', dik: 26 },
      { p: [[220, 95, 0], [186, 95, 0.5], [170, 97, 0.5], [165, 100, 0], [158, 99, -1], [142, 92, -1], [133, 88, 0], [140, 88, 1], [160, 88, 1], [167, 88, 0],
        [158, 83, -1], [142, 78, -1], [133, 76, 0], [140, 76, 1], [160, 76, 1], [167, 76, 0], [158, 71, -1], [142, 66, -1], [133, 64, 0], [140, 64, 1],
        [160, 64, 1], [167, 64, 0], [158, 72, -1], [158, 128, -1], [167, 136, 0], [160, 136, 1], [140, 136, 1], [133, 136, 0], [142, 131, -1], [158, 127, -1],
        [167, 124, 0], [160, 124, 1], [140, 124, 1], [133, 124, 0], [142, 119, -1], [158, 115, -1], [167, 112, 0], [160, 112, 1], [140, 112, 1], [133, 112, 0],
        [142, 108, -1], [158, 104, -1], [165, 104, 0], [170, 105, 0.5], [186, 105, 0.5], [220, 105, 0], [244, 108, 0], [252, 100, 0], [244, 92, 0]],
        soort: 'b', dik: 7, dicht: true },
    ],
    labels: [{ t: 'dik touw', x: 104, y: 24, naar: [138, 30] }, { t: 'prusiklus', x: 236, y: 132, naar: [230, 108] }],
  },
  // Trompetsteek: the rope in an S of three parts; at each end a small loop in the standing part lies over the bight
  // next to it. The right half is the left half turned round.
  'touw-trompetsteek': {
    w: 320, h: 180, titel: 'Trompetsteek: het touw in een S van drie parten, met aan elk eind een lusje van het staande part om de bocht heen.',
    strengen: [{ p: (() => {
      const links = [[6, 70, 0], [60, 70, 0], [82, 70, -1], [100, 70, -1], [112, 76, -1], [115, 92, -1], [112, 112, -1], [104, 126, 0], [88, 130, 0.5], [78, 118, 1],
        [76, 108, 1], [77, 90, 1], [82, 70, 1], [90, 54, 0.5], [104, 50, 0], [120, 56, 0], [140, 66, 0], [160, 70, 0]];
      const midden = [[206, 70, 1], [225, 70, 0], [243, 70, -1], [256, 72, -0.5], [266, 80, 0], [262, 88, 0], [243, 90, -1], [225, 90, 0], [206, 90, 1], [160, 90, 0],
        [114, 90, 1], [95, 90, 0], [77, 90, -1], [64, 94, 0], [58, 100, 0], [64, 108, 0], [77, 110, -1], [95, 110, 0], [113, 110, 1], [160, 110, 0]];
      return [...links, ...midden, ...zet(links, [-1, 0, 320, 0, -1, 180]).reverse().slice(1)];
    })(), dik: 10, begin: 'staand', eind: 'staand' }],
  },
  // Kikker beleggen, seen from above: the line comes straight from the boat, goes once round the base (under both
  // horns, close to it), then an eight over the horns, and the last turn as a half hitch over the far horn, laid so
  // that it lies across the cleat like the eight; the end comes out under it.
  'touw-kikker-beleggen': kikker([[126, 108, 3], [166, 94, 4], [206, 78, 4], [230, 68, 3], [248, 64, 2], [258, 74, 1], [256, 88, -1], [246, 102, 0],
    [230, 98, 1], [220, 84, 2], [212, 75, 2.5], [200, 66, 3], [186, 54, 3], [172, 42, 3]],
  'Kikker beleggen (van boven): eerst één keer rond de voet, dan een acht over de hoorns, en de laatste slag als halve steek die ook schuin ligt, als een acht.'),
  // The same with the last half hitch laid the wrong way round: it lies along the cleat instead of across it.
  'touw-kikker-fout': kikker([[126, 116, 1], [170, 122, 1], [214, 124, 1], [244, 118, 1], [258, 102, 0.5], [258, 82, -1], [248, 68, 1], [234, 66, 1.5],
    [226, 78, 1.5], [222, 94, 1.5], [219, 108, 1.5], [216, 124, 0.3], [211, 140, 1], [206, 154, 1]],
  'Zo niet: de laatste halve steek is verkeerd om gelegd. Hij ligt langs de kikker in plaats van schuin, en vormt geen acht.',
  [{ t: 'ligt recht, geen acht', x: 274, y: 172, anker: 'end', naar: [238, 120] }]),
  // Scheerlijnknoop: the mastworp met voorslag above, mirrored and tied around the line's own standing part, with
  // the loop around a peg. The two turns lie inside the loop, toward the peg.
  'touw-scheerlijnknoop': {
    w: 320, h: 222, titel: 'Scheerlijnknoop: de lijn gaat om de haring, en het eind maakt twee slagen om de lijn binnen de lus en één erbuiten. Schuif hem om de lijn strak te zetten.',
    voor: '<path d="M4 206H316" class="lijn stil"/>',
    strengen: [
      { p: [[28, 70], [28, 214]], soort: 'paal', dik: 12 },
      { p: [[316, 96, 0], [240, 96, 0], [150, 96, 0], [80, 96, 0], [44, 98, 0.5], [28, 102, 1], [16, 112, 0], [18, 124, -0.5], [28, 128, -1], [46, 132, 0],
        [90, 142, 0], [128, 138, 0.6], [146, 126, 1], ...zet(VOORSLAG, [-1, 0, 320, 0, 1, 0]).reverse().slice(3)], dik: 9, begin: 'staand', eind: 'eind' },
    ],
    labels: [{ t: 'naar de tent', x: 312, y: 84, anker: 'end' }, { t: 'haring', x: 48, y: 196, anker: 'start' }],
  },
  // Marlsteek: the line runs along the boom; at every turn it goes round, first over the lengthwise line and then
  // under it (Scoutpedia, "Marlsteek"), so each turn clamps.
  'touw-marlsteek': {
    w: 320, h: 170, titel: 'Marlsteek: bij elke slag om de giek gaat de lijn eerst over de lijn in de lengte en dan eronder door.',
    strengen: [
      { p: [[8, 96], [312, 96]], soort: 'paal', dik: 56 },
      { p: (() => {
        const p = [[4, 96, 1]];
        for (const x of [64, 150, 236]) p.push([x - 20, 96, 1], [x - 8, 96, 1], [x + 6, 96, 1], [x + 16, 98, 1], [x + 18, 112, 1], [x + 17, 126, 0.5], [x + 12, 134, 0],
          [x + 5, 128, -0.5], [x + 1, 100, -1], [x - 4, 72, -0.5], [x - 8, 62, 0], [x - 12, 70, 0.5], [x - 8, 96, 2], [x - 5, 110, 1.5], [x + 1, 114, 1],
          [x + 6, 108, 0.6], [x + 6, 96, 0.5], [x + 8, 86, 0.8], [x + 20, 82, 1], [x + 34, 88, 1]);
        p.push([300, 92, 1]);
        return p;
      })(), dik: 8, begin: 'staand', eind: 'eind' },
    ],
    labels: [{ t: 'giek met opgerold zeil', x: 160, y: 162 }],
  },
  // Apenvuist, a little from above and from the side: three sets of three turns at right angles, the second set round
  // the first, the third through the first and round the second (apenvuistBol).
  'touw-apenvuist': {
    w: 300, h: 200, titel: 'Apenvuist: een bol van drie keer drie slagen. Elke set van drie slagen ligt dwars op de andere twee en houdt ze vast.',
    voor: stukTouw([[140, 110], [186, 150], [228, 176], [300, 200]], 'a', 16, { eind: 'staand' }) + apenvuistBol([130, 92], 42, 20),
    strengen: [],
    labels: [{ t: 'drie keer drie slagen', x: 296, y: 22, anker: 'end', naar: [178, 50] }, { t: 'staand part', x: 268, y: 150, naar: [240, 182] }],
  },
  // Werplijnknoop: a long bight with the end wound round both its legs, and through the eye that is left.
  'touw-werplijnknoop': (() => {
    const slagen = [];
    for (let i = 0; i < 10; i++) { const x = 66 + 17 * i; slagen.push([x, 84, 0], [x + 4, 100, 1], [x + 8, 116, 0], [x + 12, 100, -1]); }
    return {
      w: 320, h: 160, titel: 'Werplijnknoop: het eind is een stuk of tien keer strak om een lange bocht gewikkeld en door het oog gestoken.',
      strengen: [
        { p: [[58, 100], [246, 100]], soort: 'kern', dik: 24 },
        { p: [[4, 100, 0], [48, 100, 0], [64, 100, -1]], dik: 11, begin: 'staand' },
        { p: [[226, 95, -1], [244, 93, 0], [262, 87, 0], [282, 91, 0], [290, 104, 0], [278, 117, 0], [258, 113, 0], [242, 107, 0], [226, 106, -1]], dik: 11 },
        { p: [...slagen, [236, 84, 0], [250, 78, 0.5], [268, 88, 1], [271, 102, 0], [272, 115, -1], [272, 138, -1]], dik: 11, eind: 'eind' },
      ],
      labels: [{ t: 'oog', x: 316, y: 78, anker: 'end' }, { t: 'staand part', x: 6, y: 130, anker: 'start' }],
    };
  })(),
  // Tonsteek, as the barrel hitch: the barrel stands on the rope; the half knot on top is opened, so that one half
  // goes round the front of the barrel and the other round the back; the two ends go up to the hook.
  'touw-tonsteek': {
    w: 320, h: 214, titel: 'Tonsteek (barrel hitch): de ton staat op het touw, het touw gaat om de ton heen, en beide einden gaan naar de haak.',
    strengen: [
      { p: [[160, 54], [160, 206]], soort: 'ton', dik: 120 },
      { p: [[154, 4, 0.5], [130, 40, 0.5], [100, 74, 0.5], [96, 86, 0], [110, 92, -1], [210, 104, -1], [226, 112, 0], [228, 150, 0.3], [226, 196, 0], [212, 204, -1],
        [110, 204, -1], [94, 196, 0], [92, 150, 0.3], [94, 108, 0.6], [104, 100, 1], [160, 98, 1], [216, 98, 1], [226, 92, 0.6], [222, 70, 0.5], [190, 36, 0.5],
        [166, 4, 0.5]], dik: 10 },
    ],
    labels: [{ t: 'naar de haak', x: 176, y: 14, anker: 'start' }, { t: 'ton', x: 270, y: 160, naar: [222, 160] }],
  },
  // Turkse knoop: a 3-lead, 4-bight Turk's head laid flat: one rope, over and under in turn all the way round.
  'touw-turkse-knoop': {
    w: 300, h: 200, afwisselend: true, titel: 'Turkse knoop: één touw dat drie keer rond gaat en om en om over en onder zichzelf door loopt.',
    strengen: [{ p: Array.from({ length: 96 }, (_, i) => {
      const t = (i / 96) * 6 * Math.PI; const r = 56 + 22 * Math.cos((4 * t) / 3);
      return [r1(150 + r * Math.sin(t)), r1(100 - r * Math.cos(t)), 0];
    }), dicht: true, dik: 10 }],
  },
  // Vriendschapsknoop (kruisknoop), laid loose, after Budworth, Knopen: one end goes up as a tall bight and down as the
  // bight below, the rope goes round as the lus om je nek, then makes a bight to the right and one to the left, and the
  // other end comes out to the right.
  'touw-vriendschapsknoop': {
    w: 250, h: 312, titel: 'Vriendschapsknoop, losjes gelegd: boven de lus om je nek, daaronder bochten die om en om over en onder elkaar door lopen. Trek je hem aan, dan zie je aan de voorkant een vierkantje.',
    strengen: [{ p: [
      [63, 309, 0], [63, 274, 0], [63, 248, -1], [62, 237, -1], [62, 217, 0], [61, 196, 1], [62, 179, 0], [64, 165, 1], [68, 146, 0], [76, 134, 0],
      [88, 130, 0], [102, 135, 0], [108, 149, 0], [109, 166, -1], [108, 182, 0], [107, 197, -1], [106, 217, 0], [105, 237, -1], [105, 252, 0],
      [107, 270, 0], [120, 281, 0], [135, 277, 0], [145, 265, 0], [147, 243, 1], [147, 217, 0], [146, 197, 1], [143, 179, 0], [141, 164, -1],
      [139, 146, 0], [140, 116, 0], [141, 85, 0], [133, 41, 0], [109, 12, 0], [76, 8, 0], [45, 25, 0], [32, 63, 0], [33, 109, 0], [36, 142, 0],
      [43, 160, 0], [53, 165, 0], [63, 166, -1], [76, 164, 0], [107, 163, 1], [142, 161, 1], [164, 161, 0], [179, 164, 0], [187, 179, 0],
      [180, 193, 0], [164, 197, 0], [146, 197, -1], [127, 197, 0], [107, 197, 1], [85, 197, 0], [63, 196, -1], [45, 193, 0], [28, 193, 0],
      [18, 204, 0], [22, 223, 0], [39, 236, 0], [63, 237, 1], [85, 235, 0], [106, 235, 1], [127, 234, 0], [146, 238, -1], [168, 243, 0],
      [204, 256, 0], [237, 274, 0]], dik: 12 }],
    labels: [{ t: 'om je nek', x: 86, y: 60 }, { t: 'losjes gelegd:', x: 244, y: 286, anker: 'end' }, { t: 'trek nog aan', x: 244, y: 300, anker: 'end' }],
  },
  // Knopenbord: a board with some of the knots above, small.
  'touw-knopenbord': () => {
    const vakken = [['touw-achtknoop', 'achtknoop'], ['touw-platte-knoop', 'platte knoop'], ['touw-karaaksteek', 'karaaksteek'],
      ['touw-schootsteek', 'schootsteek'], ['touw-turkse-knoop', 'Turkse knoop'], ['touw-apenvuist', 'apenvuist']];
    let uit = '<rect x="6" y="6" width="308" height="218" rx="6" class="tw-hout-licht"/>';
    for (const [x, y] of [[18, 18], [302, 18], [18, 212], [302, 212]]) uit += `<circle cx="${x}" cy="${y}" r="3" class="tw-metaal"/>`;
    vakken.forEach(([naam, t], i) => {
      const def = TEKENINGEN[naam]; const kx = 12 + (i % 3) * 100; const ky = 14 + Math.floor(i / 3) * 106;
      const f = Math.min(88 / def.w, 72 / def.h);
      uit += `<g transform="translate(${r1(kx + (96 - def.w * f) / 2)} ${r1(ky + (78 - def.h * f) / 2)}) scale(${r1(f * 1000) / 1000})">${knoopBinnen({ ...def, labels: [] })}</g>`;
      uit += tekst(kx + 48, ky + 94, t, { maat: 10, klasse: 'tw-bordtekst' });
    });
    return svg(320, 230, 'Een knopenbord: een plank met knopen en hun namen.', uit);
  },
  // Fluitkoord: the parts of the traditional Dutch whistle lanyard (Scoutpedia, "Fluitkoord"), as a sketch.
  'touw-fluitkoord': () => {
    let uit = '';
    const y = 70;
    uit += stukTouw([[14, y], [64, y]], 'garen', 8);
    for (let x = 18; x < 62; x += 8) uit += `<path d="M${x} ${y - 3}l4 3l-4 3" class="tw-lijn tw-patroon"/>`;
    uit += stukTouw([[64, y], [124, y]], 'garen', 14);
    for (let x = 70; x < 122; x += 10) uit += `<ellipse cx="${x + 4}" cy="${y}" rx="4.5" ry="6" class="tw-lijn tw-patroon"/>`;
    uit += stukTouw([[124, y], [184, y]], 'garen', 12);
    for (let x = 128; x < 182; x += 7) uit += `<path d="M${x} ${y - 5}v10" class="tw-lijn tw-patroon"/><path d="M${x + 3.5} ${y - 5}v10" class="tw-lijn tw-patroon dun"/>`;
    uit += stukTouw([[184, y], [244, y]], 'garen', 12);
    for (let x = 186; x < 242; x += 8) uit += `<path d="M${x} ${y + 5}l6 -10" class="tw-lijn tw-patroon"/>`;
    uit += stukTouw([[244, y], [272, y]], 'garen', 9);
    for (let x = 246; x < 270; x += 3) uit += `<path d="M${x} ${y - 4}v8" class="tw-lijn tw-patroon dun"/>`;
    uit += stukTouw([[272, y], [284, y], [292, 84], [292, 100]], 'garen', 5);
    uit += '<path d="M282 102h22v12a6 6 0 0 1 -6 6h-10a6 6 0 0 1 -6 -6z" class="tw-metaal"/><circle cx="293" cy="110" r="3" class="tw-metaal-licht"/>';
    const namen = [[39, 'vlechting', 1], [94, 'bootsmansplatting', 0], [154, 'ronde kroonplatting', 1], [214, 'spiraalplatting', 0], [258, 'bezetting', 1]];
    for (const [x, t, boven] of namen) {
      const ty = boven ? 34 : 112;
      uit += `<path d="M${x} ${boven ? ty + 4 : ty - 12}L${x} ${boven ? y - 10 : y + 10}" class="tw-wijs"/>` + tekst(x, ty, t, { maat: 10.5, klasse: 'stil' });
    }
    return svg(320, 130, 'Fluitkoord, schets: van links naar rechts een vlechting, een bootsmansplatting, een ronde kroonplatting, een spiraalplatting en een bezetting, met de fluit.', `<g class="tw">${uit}</g>`);
  },
  // Zeilmakerstakeling: the same wrapping, with the twine also laid over it along the grooves between the strands.
  'touw-zeilmakerstakeling': () => {
    let uit = geslagen(8, 250, 96, 34, 'a');
    for (let x = 194; x <= 234; x += 4.4) uit += stukTouw([[x, 79], [x + 0.6, 96], [x, 113]], 'garen', 4.4);
    for (const x of [192, 213]) uit += stukTouw([[x, 78], [x + 14.3, 114]], 'garen', 3.4) + stukTouw([[x + 14.3, 114], [x + 21, 114]], 'garen', 2.4);
    uit += label({ t: 'garen in de groef', x: 150, y: 46, naar: [200, 84] }) + label({ t: 'wikkeling', x: 266, y: 50, naar: [228, 80] });
    return svg(300, 140, 'Zeilmakerstakeling: een takeling waarbij het garen ook over de wikkeling heen in de groeven tussen de strengen ligt.', `<g class="tw">${uit}</g>`);
  },
  // Afbranden: a synthetic rope end melted into a smooth cap; not with natural rope.
  'touw-afbranden': () => {
    let uit = geslagen(8, 200, 80, 30, 'b');
    uit += '<path d="M198 65h6a15 15 0 0 1 0 30h-6z" class="tw-smelt"/>';
    uit += '<path d="M212 150c-14 -10 -10 -24 -2 -36c2 10 10 12 8 4c8 8 12 20 2 32z" class="tw-vlam"/><path d="M212 146c-6 -6 -4 -14 0 -20c2 8 6 10 4 4c4 6 4 12 -4 16z" class="tw-vlam-binnen"/>';
    uit += label({ t: 'kunststof touw', x: 80, y: 124 }) + label({ t: 'gesmolten dopje', x: 270, y: 50, naar: [214, 72] }) + tekst(270, 136, 'smelten,', { maat: 10, klasse: 'stil' }) + tekst(270, 150, 'niet branden', { maat: 10, klasse: 'stil' });
    return svg(320, 160, 'Afbranden: het eind van kunststof touw kort bij een vlam dichtgesmolten tot een glad dopje.', `<g class="tw">${uit}</g>`);
  },
  // Eindsplits, as on Scoutwiki ("Eindsplits"): the strands unlaid, laid in a crown, pulled tight, and tucked back
  // into the rope against the lay, the ends cut off.
  'touw-eindsplits': () => {
    const stappen = [[0, 50, 'uitdraaien'], [1, 150, 'kruisknoop'], [2, 252, 'aantrekken'], [4, 350, 'terugsteken']];
    let uit = '';
    stappen.forEach(([w, x, t], i) => { uit += eindsplitsStand(w, x, 112, 250) + tekst(x, 268, `${i + 1} ${t}`, { maat: 11, klasse: 'stil' }); });
    return svg(400, 274, 'Eindsplits in vier stappen: draai de strengen uit elkaar, leg ze in een kruisknoop, trek die strak, en steek de strengen terug in het touw, tegen de slag in. Knip de eindjes af.', `<g class="tw">${uit}</g>`);
  },
  // Oogsplits: an eye in the end of the rope; the strands of the end are tucked into the standing part.
  'touw-oogsplits': () => {
    let uit = stukTouw([[176, 132], [214, 132], [252, 118], [268, 86], [254, 52], [218, 40], [184, 52], [168, 82], [166, 112], [160, 128]], 'a', 24);
    uit += geslagen(8, 176, 136, 26, 'a');
    uit += geslagen(96, 182, 134, 32, 'a', -1);
    uit += label({ t: 'oog', x: 216, y: 92 }) + label({ t: 'splits', x: 130, y: 182, naar: [140, 148] }) + label({ t: 'staand part', x: 46, y: 182, naar: [40, 146] });
    return svg(300, 196, 'Oogsplits: een vaste lus in het eind van het touw. De strengen van het eind zijn in het staande part gevlochten.', `<g class="tw">${uit}</g>`);
  },
  // Touwslaan: the draaier turns three hooks, each twisting its bundle into a strand; behind the klos the strands lay
  // up into rope, the other way round (nl.wikipedia, "Touwslager").
  'touw-touwslaan': () => {
    let uit = '<rect x="16" y="40" width="22" height="120" rx="3" class="tw-hout"/><path d="M27 100h-18v34" class="tw-metaal-lijn"/><circle cx="9" cy="136" r="4" class="tw-metaal"/>';
    for (const y of [64, 100, 136]) uit += `<path d="M38 ${y}h10a5 5 0 1 1 0 10" class="tw-metaal-lijn"/>`;
    const naar = { 64: 90, 100: 100, 136: 110 };
    for (const y of [64, 100, 136]) uit += stukTouw([[53, y + 5], [120, (y + 5 + naar[y]) / 2 - (y - 100) * 0.1], [184, naar[y]]], 'a', 8);
    uit += '<path d="M182 76L206 88V112L182 124Z" class="tw-hout-licht"/><path d="M182 90h10M182 100h12M182 110h10" class="tw-nerf"/>';
    uit += geslagen(206, 286, 100, 22, 'a');
    uit += '<path d="M286 100h10a5 5 0 1 0 0 -10" class="tw-metaal-lijn"/><rect x="298" y="78" width="16" height="44" rx="3" class="tw-hout"/>';
    for (const y of [64, 136]) uit += `<path d="M58 ${y - 14}a10 10 0 1 1 -2 22" class="tw-pijl"/>`;
    uit += pijl([210, 140], [180, 140]);
    uit += label({ t: 'draaier', x: 27, y: 28 }) + label({ t: 'klos', x: 194, y: 160 }) + label({ t: 'strengen', x: 112, y: 30, naar: [118, 80] }) + label({ t: 'touw', x: 250, y: 74 });
    return svg(320, 172, 'Touwslaan: drie haken draaien elk een bundel garen tot een streng; achter de klos draaien de strengen samen tot touw.', `<g class="tw">${uit}</g>`);
  },
  // Marlpriem and splitsijzer (a fid).
  'touw-marlpriem': () => {
    let uit = '<path d="M40 44L270 58L40 72Z" class="tw-metaal"/><path d="M40 52L250 58" class="tw-metaal-licht-lijn"/><circle cx="30" cy="58" r="12" class="tw-metaal"/><circle cx="30" cy="58" r="5.5" class="vlak"/>';
    uit += '<path d="M40 112L270 130L40 148Z" class="tw-hout"/><path d="M60 122L230 130M60 138L230 132" class="tw-nerf"/>';
    uit += label({ t: 'marlpriem (staal)', x: 160, y: 30 }) + label({ t: 'splitspen (hout)', x: 160, y: 168 });
    return svg(300, 180, 'Een marlpriem, een stalen priem, en een houten splitspen. Daarmee duw je de strengen van een touw uit elkaar.', `<g class="tw">${uit}</g>`);
  },
  // Natuurlijk of kunststof: a natural rope frays into fibres; a synthetic one can be melted shut.
  'touw-natuur-kunststof': () => {
    let uit = geslagen(8, 196, 56, 28, 'a');
    for (let i = 0; i < 14; i++) { const y = 44 + i * 1.8; const h = (i - 6.5) * 2.4; uit += `<path d="M194 ${r1(y)}q14 ${r1(h * 0.3)} ${r1(26 + (i % 3) * 6)} ${r1(h)}" class="tw-vezel"/>`; }
    uit += geslagen(8, 196, 140, 28, 'b');
    uit += '<path d="M194 126h6a14 14 0 0 1 0 28h-6z" class="tw-smelt"/>';
    uit += label({ t: 'natuurtouw: rafelt uit', x: 112, y: 22 }) + label({ t: 'kunststof: smelt je dicht', x: 112, y: 182 });
    return svg(300, 194, 'Natuurtouw rafelt uit tot pluizige vezels; kunststof touw kun je dichtsmelten.', `<g class="tw">${uit}</g>`);
  },
  // Opbouw: fibres, yarn, strand, rope; and below: rope in wantslag and in kabelslag.
  'touw-opbouw': () => {
    let uit = '';
    for (let i = 0; i < 5; i++) uit += `<path d="M10 ${40 + i * 4}q12 -4 24 0t24 0" class="tw-vezel"/>`;
    uit += geslagen(84, 140, 48, 7, 'a');
    uit += geslagen(166, 222, 48, 13, 'a');
    uit += geslagen(248, 312, 48, 24, 'a');
    for (const x of [62, 144, 226]) uit += pijl([x, 48], [x + 16, 48]);
    for (const [x, t] of [[34, 'vezels'], [112, 'garen'], [194, 'streng'], [280, 'touw']]) uit += tekst(x, 82, t, { maat: 10, klasse: 'stil' });
    uit += geslagen(10, 140, 140, 24, 'a');
    uit += geslagen(170, 312, 140, 44, 'a', -1);
    uit += tekst(75, 178, 'wantslag: strengen', { maat: 10, klasse: 'stil' }) + tekst(241, 178, 'kabelslag: drie touwen', { maat: 10, klasse: 'stil' });
    return svg(320, 190, 'Opbouw van geslagen touw: vezels worden garen, garen strengen, strengen touw (wantslag). Drie touwen samen, de andere kant op geslagen, is kabelslag.', `<g class="tw">${uit}</g>`);
  },
  // Onderhoud: hang rope up, dry; not on the ground.
  'touw-onderhoud': () => {
    // opgeschoten, on a wooden peg in a board on the wall: the bight round the peg
    let uit = '<rect x="20" y="14" width="124" height="14" rx="2" class="tw-hout-licht"/>';
    uit += `<g transform="translate(-37 22) scale(0.78)">${opgeschotenBos()}</g>`;
    uit += '<circle cx="80" cy="30" r="5.5" class="tw-hout"/><circle cx="80" cy="30" r="2.2" class="tw-hout-licht"/>';
    uit += '<rect x="170" y="172" width="140" height="22" class="tw-zand"/>';
    uit += stukTouw([[182, 170], [210, 162], [246, 170], [280, 164], [300, 170]], 'a', 8);
    uit += '<path d="M222 96l40 40M262 96l-40 40" class="tw-kruis"/>';
    uit += label({ t: 'opgeschoten, droog ophangen', x: 82, y: 204 }) + label({ t: 'niet op de grond', x: 242, y: 84 });
    return svg(320, 212, 'Touw opgeschoten en droog opgehangen aan een houten pen, niet op de grond laten liggen: zand slijt het touw van binnenuit.', `<g class="tw">${uit}</g>`);
  },
  // Controleren: what to look for along the rope.
  'touw-controleren': () => {
    let uit = geslagen(8, 312, 92, 30, 'a');
    for (let i = 0; i < 9; i++) uit += `<path d="M${54 + i * 4} ${i % 2 ? 77 : 107}l${i % 3 - 1} ${i % 2 ? -9 : 9}" class="tw-vezel"/>`;
    uit += '<ellipse cx="160" cy="92" rx="16" ry="11" class="tw-glans"/>';
    uit += '<rect x="232" y="76" width="40" height="32" class="vlak"/>' + stukTouw([[232, 82], [272, 80]], 'a', 9) + stukTouw([[232, 92], [272, 94]], 'a', 9) + stukTouw([[232, 102], [272, 106]], 'a', 9);
    uit += label({ t: 'rafels', x: 70, y: 52, naar: [70, 76] }) + label({ t: 'harde, glimmende plek', x: 160, y: 138, naar: [160, 104] }) + label({ t: 'opendraaien en binnenin kijken', x: 230, y: 52, naar: [252, 76] });
    return svg(320, 150, 'Touw controleren: let op rafels, harde of glimmende plekken, dunne of slappe plekken, en kijk ook binnenin.', `<g class="tw">${uit}</g>`);
  },
  // Breeksterkte en werklast: of the breaking strength you only use a small part, often a tenth.
  'touw-breeksterkte': () => {
    let uit = '';
    for (let i = 0; i < 10; i++) uit += `<rect x="${20 + i * 28}" y="44" width="24" height="26" rx="3" class="${i === 0 ? 'accent' : 'vlak2'}"/><rect x="${20 + i * 28}" y="44" width="24" height="26" rx="3" class="lijn dun"/>`;
    uit += `<path d="M20 84H296" class="tw-pijl"/><path d="M20 78v12M296 78v12" class="tw-pijl"/>`;
    uit += tekst(158, 102, 'breeksterkte: hierbij breekt een nieuw touw', { maat: 10.5, klasse: 'stil' });
    uit += label({ t: 'werklast: vaak een tiende', x: 32, y: 26, anker: 'start' });
    return svg(316, 116, 'Breeksterkte en werklast: van de kracht waarbij het touw breekt, laat je het maar een klein deel dragen, vaak een tiende.', `<g class="tw">${uit}</g>`);
  },

  // Opschieten, hung up: the rope in loops of about the same size, a few turns round the bundle below the top, and a
  // bight of the end through the eye above those turns, to hang it by. The start of the rope hangs out at the bottom.
  'touw-opschieten': () => {
    let uit = opgeschotenBos();
    uit += label({ t: 'bocht door het oog', x: 126, y: 30, anker: 'end', naar: [140, 34] }) + label({ t: 'ophangen', x: 176, y: 14, anker: 'start', naar: [158, 18] })
      + label({ t: 'slagen om de bos', x: 210, y: 92, anker: 'start', naar: [172, 86] }) + label({ t: 'lussen even groot', x: 210, y: 156, anker: 'start', naar: [186, 156] })
      + label({ t: 'begin van het touw', x: 102, y: 172, anker: 'end', naar: [108, 195] });
    return svg(320, 206, 'Touw opschieten: in lussen van dezelfde grootte, een paar slagen om de bos, en een bocht van het eind door het oog erboven om hem aan op te hangen.', `<g class="tw">${uit}</g>`);
  },
  // Vrachtrijdersteek: a slipped loop in the standing part, the end round the anchor, back through the loop, pulled.
  'touw-vrachtrijdersteek': (() => {
    const [rechts, links] = dubbel([[208, 116, 0.5], [206, 100, 1], [214, 90, 0], [229, 84, -1], [244, 84, -1], [262, 90, -1]], 5);
    return {
      w: 320, h: 222, titel: 'Vrachtrijdersteek: een lus in het touw, het eind om het vaste punt en terug door de lus. De lus werkt als een katrol.',
      strengen: [
        { p: [[200, 198], [312, 198]], soort: 'paal', dik: 14 },
        { p: [[4, 100, 0], [100, 100, 0], [158, 100, 0], [186, 100, 1], [198, 100, 0], [206, 100, -1], [220, 96, 0], [229, 84, 1], [232, 72, 0], [226, 58, 0],
          [210, 50, 0], [194, 56, 0], [189, 72, 0], [187, 86, -0.6], [186, 100, -1], [186, 116, -0.5], [194, 128, 0], [201, 126, 0.3], ...links,
          [278, 82, 0], [296, 86, 0], [300, 100, 0], [288, 110, 0], [272, 104, 0], ...rechts.reverse(), [214, 132, 0], [222, 160, 0], [236, 182, 0.5],
          [242, 198, 1], [250, 214, 0.5], [262, 214, 0], [268, 206, -0.5], [270, 198, -1], [272, 182, 0], [282, 150, 0], [290, 124, 0], [292, 108, -1],
          [292, 94, 0], [292, 80, 1], [298, 66, 0.5], [310, 72, 0], [312, 110, 0], [312, 150, 0]], dik: 9, begin: 'staand', eind: 'eind' },
      ],
      labels: [{ t: 'lus', x: 274, y: 40, naar: [282, 82] }, { t: 'vast punt', x: 196, y: 214, anker: 'end' }, { t: 'trek', x: 306, y: 170, anker: 'end' }, { t: 'staand part', x: 8, y: 88, anker: 'start' }],
      na: pijl([316, 132], [316, 166]),
    };
  })(),
  'touw-platte-knoop': {
    w: 316, h: 178, titel: 'Platte knoop: twee touwen met elk een bocht door de bocht van het andere; beide eindjes van een touw liggen aan dezelfde kant.',
    strengen: [
      { p: metZ(PLAT_A, [1, 1, 0, -1, 0, 0.5, 1, 1, 0.5, 0, -1, 0, 1, 1]), soort: 'a', dik: 13, begin: 'staand', eind: 'eind' },
      { p: metZ(PLAT_B, [-1, -1, 0, 1, 0, -0.5, -1, -1, -0.5, 0, 1, 0, -1, -1]), soort: 'b', dik: 13, begin: 'staand', eind: 'eind' },
    ],
    labels: platLabels,
  },
  'touw-oudewijvenknoop': {
    w: 316, h: 178, titel: 'Oudewijvenknoop: dezelfde vorm als de platte knoop, maar de eindjes van een touw liggen aan verschillende kanten van de bocht van het andere.',
    strengen: [
      { p: metZ(PLAT_A, [1, 1, 0, -1, 0, 0.5, 1, -1, -0.5, 0, 1, 0, -1, -1]), soort: 'a', dik: 13, begin: 'staand', eind: 'eind' },
      { p: metZ(PLAT_B, [-1, -1, 0, 1, 0, -0.5, -1, 1, 0.5, 0, -1, 0, 1, 1]), soort: 'b', dik: 13, begin: 'staand', eind: 'eind' },
    ],
    labels: platLabels,
  },
};

export default Object.fromEntries(Object.entries(TEKENINGEN).map(([naam, def]) => [naam, typeof def === 'function' ? def : () => knoop(def)]));
