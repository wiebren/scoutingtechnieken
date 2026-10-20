// The road network under every route technique: one small, seeded network of junctions and roads, and a route
// through it. Every technique (notaties.js) is a different way of writing down the same route, which is the "rode
// draad" of NAV §2: one network, many notations. Plain JS without the DOM, so node can test it (scripts in the
// report). Coordinates in metres-ish units: x to the east, y to the north; directions in degrees from north,
// clockwise; a turn is negative to the left and positive to the right.

export const GRID = 6;            // junctions per side, before some are removed
export const AFSTAND = 60;        // between two neighbours on the grid
const MIN_HOEK = 42;              // the smallest angle between two roads at a junction (so no road can be mistaken)

/** A small seeded random generator (mulberry32): the same seed gives the same network and route. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const norm = (g) => ((g % 360) + 360) % 360;
/** The turn from one direction to another, -180..180: negative is to the left. */
export const draai = (van, naar) => { const d = norm(naar - van); return d > 180 ? d - 360 : d; };
export const hoekVerschil = (a, b) => Math.abs(draai(a, b));
/** The direction from point a to point b. */
export const peiling = (a, b) => norm((Math.atan2(b.x - a.x, b.y - a.y) * 180) / Math.PI);
export const afstand = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
export const punt = (p, r, g) => ({ x: p.x + r * Math.sin((g * Math.PI) / 180), y: p.y + r * Math.cos((g * Math.PI) / 180) });

// -- the kinds of road. "breed" is the width in the 3D world; a narrow path (smal) does not count as a road.
export const SOORTEN = {
  verhard: { naam: 'verharde weg', kort: 'weg', breed: 5.2, onverhard: false },
  fietspad: { naam: 'fietspad', kort: 'fietspad', breed: 3, onverhard: false },
  zandpad: { naam: 'zandpad', kort: 'zandpad', breed: 3.8, onverhard: true },
  bospad: { naam: 'bospad', kort: 'bospad', breed: 2.6, onverhard: true },
};
export const SMAL_BREED = 0.8;

// names for the streets: a first part and an ending that fits the kind of road
const VOOR = ['Eiken', 'Beuken', 'Heide', 'Dennen', 'Berken', 'Linden', 'Wilgen', 'Elzen', 'Vossen', 'Hazen', 'Uilen',
  'Valken', 'Mos', 'Varen', 'Bramen', 'Molen', 'Kerk', 'Hooi', 'Akker', 'Venne', 'Dassen', 'Egel', 'Herten', 'Schapen',
  'Bijen', 'Hulst', 'Veen', 'Esdoorn', 'Lijster', 'Merel', 'Spechten', 'Kievit', 'Reiger', 'Zwaluw', 'Eekhoorn', 'Kastanje',
  'Iepen', 'Populieren', 'Lariks', 'Vlinder', 'Mieren', 'Zonne', 'Bosbes', 'Klaver', 'Gagel', 'Ree'];
const ACHTER = { verhard: ['weg', 'laan', 'straat'], fietspad: ['fietspad'], zandpad: ['weg', 'dreef', 'zandweg'], bospad: ['pad'] };

// the landmarks at junctions, with how often they occur
export const BAKENS = {
  boom: { naam: 'grote eik', lidwoord: 'de', kans: 0.26 },
  huis: { naam: 'huis', lidwoord: 'het', kans: 0.2 },
  bankje: { naam: 'bankje', lidwoord: 'het', kans: 0.2 },
  wegwijzer: { naam: 'wegwijzer', lidwoord: 'de', kans: 0.14 },
  hek: { naam: 'hek', lidwoord: 'het', kans: 0.12 },
  kerk: { naam: 'kerk', lidwoord: 'de', kans: 0.08 },
};

function kies(r, lijst) { return lijst[Math.floor(r() * lijst.length)]; }
function kiesGewogen(r, paren) {
  const som = paren.reduce((s, [, w]) => s + w, 0);
  let x = r() * som;
  for (const [v, w] of paren) { x -= w; if (x <= 0) return v; }
  return paren[paren.length - 1][0];
}
function schud(r, lijst) {
  for (let i = lijst.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [lijst[i], lijst[j]] = [lijst[j], lijst[i]]; }
  return lijst;
}

// does segment p1-p2 cross q1-q2 (not counting shared end points)?
function kruist(p1, p2, q1, q2) {
  const o = (a, b, c) => Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
  return o(p1, p2, q1) * o(p1, p2, q2) < 0 && o(q1, q2, p1) * o(q1, q2, p2) < 0;
}
/** The distance from point p to the segment a-b. */
export function afstandTotLijn(p, a, b) {
  const dx = b.x - a.x; const dy = b.y - a.y; const l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/**
 * A network: { knopen: [{id, x, y, wegen: [wegId]}], wegen: [{id, a, b, soort, naam, straat}], paadjes, bakens }.
 * A knoop with three or more roads is a junction; with one it is a dead end (or a road that leaves the map, `rand`).
 */
export function maakNetwerk(seed) {
  const r = rng(seed * 7919 + 17);
  const knopen = []; const wegen = [];
  const nieuweKnoop = (x, y, extra = {}) => { const k = { id: knopen.length, x, y, wegen: [], ...extra }; knopen.push(k); return k; };
  const nieuweWeg = (a, b, extra = {}) => {
    const w = { id: wegen.length, a: a.id, b: b.id, actief: true, ...extra };
    wegen.push(w); a.wegen.push(w.id); b.wegen.push(w.id); return w;
  };
  const ander = (w, k) => knopen[w.a === k.id ? w.b : w.a];
  const weg = (w) => wegen[w];

  // 1. a grid with jitter, so roads meet at skewed angles
  const rooster = [];
  for (let rij = 0; rij < GRID; rij++) for (let kol = 0; kol < GRID; kol++) {
    const j = AFSTAND * 0.27;
    rooster.push(nieuweKnoop(kol * AFSTAND + (r() * 2 - 1) * j, rij * AFSTAND + (r() * 2 - 1) * j, { kol, rij }));
  }
  const op = (kol, rij) => rooster[rij * GRID + kol];

  // 2. neighbours, and now and then a diagonal (which makes five-way junctions and sharp angles)
  for (let rij = 0; rij < GRID; rij++) for (let kol = 0; kol < GRID; kol++) {
    if (kol + 1 < GRID && r() > 0.16) nieuweWeg(op(kol, rij), op(kol + 1, rij));
    if (rij + 1 < GRID && r() > 0.16) nieuweWeg(op(kol, rij), op(kol, rij + 1));
    if (kol + 1 < GRID && rij + 1 < GRID && r() < 0.2) {
      if (r() < 0.5) nieuweWeg(op(kol, rij), op(kol + 1, rij + 1), { diagonaal: true });
      else nieuweWeg(op(kol + 1, rij), op(kol, rij + 1), { diagonaal: true });
    }
  }

  const verwijder = (w) => {
    w.actief = false;
    for (const k of [knopen[w.a], knopen[w.b]]) k.wegen = k.wegen.filter((id) => id !== w.id);
  };
  const bundel = (k) => k.wegen.map((id) => ({ w: weg(id), g: peiling(k, ander(weg(id), k)) })).sort((p, q) => p.g - q.g);

  // 3. no two roads at a junction closer than MIN_HOEK: drop a diagonal, or else the longer road
  for (let ronde = 0, klaar = false; !klaar && ronde < 50; ronde++) {
    klaar = true;
    for (const k of knopen) {
      const b = bundel(k);
      for (let i = 0; i < b.length && b.length > 1; i++) {
        const p = b[i]; const q = b[(i + 1) % b.length];
        if (hoekVerschil(p.g, q.g) < MIN_HOEK) {
          const lengte = (w) => afstand(knopen[w.a], knopen[w.b]) + (w.diagonaal ? 1000 : 0);
          verwijder(lengte(p.w) > lengte(q.w) ? p.w : q.w);
          klaar = false; break;
        }
      }
    }
  }

  // 4. keep the largest connected part
  const deel = new Map();
  for (const k of knopen) {
    if (deel.has(k.id) || !k.wegen.length) continue;
    const stapel = [k]; deel.set(k.id, k.id);
    while (stapel.length) { const x = stapel.pop(); for (const id of x.wegen) { const y = ander(weg(id), x); if (!deel.has(y.id)) { deel.set(y.id, k.id); stapel.push(y); } } }
  }
  const tel = new Map(); for (const v of deel.values()) tel.set(v, (tel.get(v) ?? 0) + 1);
  const groot = [...tel.entries()].sort((p, q) => q[1] - p[1])[0][0];
  for (const k of knopen) if (deel.get(k.id) !== groot) { for (const id of [...k.wegen]) verwijder(weg(id)); k.los = true; }

  // a short road to nowhere (a dead end, or a road that leaves the map) in a free direction, if it crosses nothing
  const stomp = (k, g, lengte, extra) => {
    const b = bundel(k);
    if (b.some((p) => hoekVerschil(p.g, g) < MIN_HOEK)) return null;
    const eind = punt(k, lengte, g);
    for (const w of wegen) if (w.actief && kruist(k, eind, knopen[w.a], knopen[w.b])) return null;
    for (const x of knopen) if (!x.los && x !== k && afstandTotLijn(x, k, eind) < 14) return null;
    const e = nieuweKnoop(eind.x, eind.y, extra);
    return nieuweWeg(k, e, { stomp: true });
  };
  const grootsteGat = (k) => {
    const b = bundel(k);
    if (!b.length) return { g: r() * 360, gat: 360 };
    let best = null;
    b.forEach((p, i) => { const q = b[(i + 1) % b.length]; const gat = b.length === 1 ? 360 : norm(q.g - p.g); if (!best || gat > best.gat) best = { g: norm(p.g + gat / 2), gat }; });
    return best;
  };

  const levend = () => knopen.filter((k) => !k.los && k.wegen.length);
  const midden = { x: ((GRID - 1) * AFSTAND) / 2, y: ((GRID - 1) * AFSTAND) / 2 };

  // 5. roads that leave the map at the edge, so the edge does not look like the end of the world
  for (const k of levend()) {
    if (k.kol == null || !(k.kol === 0 || k.rij === 0 || k.kol === GRID - 1 || k.rij === GRID - 1)) continue;
    if (r() < 0.55) stomp(k, norm(peiling(midden, k) + (r() * 2 - 1) * 25), 70, { rand: true });
  }
  // 6. every bend becomes a junction with a dead end, and some junctions get one more road
  for (const k of levend()) {
    if (k.rand || k.doodlopend) continue;
    if (k.wegen.length === 2 || (k.wegen.length === 3 && r() < 0.22)) {
      const { g, gat } = grootsteGat(k);
      if (gat >= 2 * MIN_HOEK + 4) stomp(k, norm(g + (r() * 2 - 1) * Math.min(14, gat / 2 - MIN_HOEK - 1)), 20 + r() * 12, { doodlopend: true });
    }
  }
  // a bend that could not get a dead end stays a bend: the route never stops there (see maakRoute)

  // 7. narrow paths (olifantenpaadjes) at some junctions: you see them, but they do not count as a road
  const paadjes = [];
  for (const k of levend()) {
    if (k.wegen.length < 3 || r() > 0.28) continue;
    const { g, gat } = grootsteGat(k);
    if (gat < 80) continue;
    const eind = punt(k, 24, g);
    if (wegen.some((w) => w.actief && kruist(k, eind, knopen[w.a], knopen[w.b]))) continue;
    paadjes.push({ id: paadjes.length, knoop: k.id, x: eind.x, y: eind.y, peiling: g });
  }

  // 8. streets: roads that go straight on through a junction belong together and share a kind and a name
  const ouder = new Map(wegen.map((w) => [w.id, w.id]));
  const wortel = (id) => { while (ouder.get(id) !== id) id = ouder.get(id); return id; };
  for (const k of levend()) {
    const b = bundel(k); const gebruikt = new Set();
    const paren = [];
    for (let i = 0; i < b.length; i++) for (let j = i + 1; j < b.length; j++) paren.push([hoekVerschil(b[i].g, b[j].g), b[i].w, b[j].w]);
    paren.sort((p, q) => q[0] - p[0]);
    for (const [hoek, p, q] of paren) {
      if (hoek < 160 || gebruikt.has(p.id) || gebruikt.has(q.id)) continue;
      gebruikt.add(p.id); gebruikt.add(q.id); ouder.set(wortel(p.id), wortel(q.id));
    }
  }
  const straten = new Map();
  for (const w of wegen) if (w.actief) { const s = wortel(w.id); if (!straten.has(s)) straten.set(s, []); straten.get(s).push(w); }
  const voor = schud(r, [...VOOR]);
  const buren = new Map();                      // streets that meet somewhere must not share a name
  for (const k of levend()) {
    const s = [...new Set(k.wegen.map((id) => wortel(id)))];
    for (const a of s) for (const b of s) if (a !== b) { if (!buren.has(a)) buren.set(a, new Set()); buren.get(a).add(b); }
  }
  const naamVan = new Map(); let n = 0;
  for (const [s, lijst] of straten) {
    const alleenStomp = lijst.every((w) => w.stomp);
    const soort = alleenStomp ? kiesGewogen(r, [['zandpad', 0.5], ['bospad', 0.4], ['verhard', 0.1]])
      : kiesGewogen(r, [['verhard', 0.32], ['zandpad', 0.34], ['fietspad', 0.14], ['bospad', 0.2]]);
    const bezet = new Set([...(buren.get(s) ?? [])].map((b) => naamVan.get(b)?.voor));
    let v = voor[n++ % voor.length];
    for (let t = 0; bezet.has(v) && t < voor.length; t++) v = voor[n++ % voor.length];
    const naam = v + kies(r, ACHTER[soort]);
    naamVan.set(s, { voor: v, naam });
    for (const w of lijst) { w.soort = soort; w.naam = naam; w.straat = s; }
  }

  // 9. landmarks in a corner of some junctions, never two kerken next to each other
  const bakens = []; let kerken = 0;
  for (const k of levend()) {
    if (k.wegen.length < 3 || r() > 0.5) continue;
    const b = bundel(k);
    const gaten = b.map((p, i) => { const q = b[(i + 1) % b.length]; return { g: norm(p.g + norm(q.g - p.g) / 2), gat: norm(q.g - p.g) }; })
      .filter((x) => x.gat >= 70 && !paadjes.some((p) => p.knoop === k.id && hoekVerschil(p.peiling, x.g) < 30));
    if (!gaten.length) continue;
    let soort = kiesGewogen(r, Object.entries(BAKENS).map(([s, d]) => [s, d.kans]));
    if (soort === 'kerk' && kerken >= 2) soort = 'huis';
    if (soort === 'kerk') kerken++;
    const gat = kies(r, gaten);
    const ver = { huis: 13, kerk: 16, boom: 14, bankje: 7, wegwijzer: 4.5, hek: 9 }[soort];
    bakens.push({ soort, knoop: k.id, peiling: gat.g, ...punt(k, ver, gat.g), draai: r() * 360 });
  }

  // the indexes: only what is still there
  const net = { seed, knopen, wegen, paadjes, bakens, ander: (w, k) => ander(w, k) };
  net.levend = levend();
  net.wegenLijst = wegen.filter((w) => w.actief);
  return net;
}

export const isKruispunt = (k) => k.wegen.length >= 3;

// -- what a turn is called. A turn of 20–40° could be "straight on" or "to the side": a route never asks for a road
// that someone could read both ways (see eenduidig).
export function soortDraai(d) {
  const a = Math.abs(d);
  if (a <= 20) return 'rechtdoor';
  if (a < 40) return null;
  return d < 0 ? 'links' : 'rechts';
}
const mogelijk = (d) => {
  const a = Math.abs(d); const kant = d < 0 ? 'links' : 'rechts';
  return a <= 20 ? ['rechtdoor'] : a < 40 ? ['rechtdoor', kant] : [kant];
};
/** The words for a turn: rechtdoor, schuin links, links, scherp links. */
export function draaiWoord(d) {
  const a = Math.abs(d); const kant = d < 0 ? 'links' : 'rechts';
  if (a <= 20) return 'rechtdoor';
  if (a <= 70) return `schuin ${kant}`;
  if (a <= 115) return kant;
  return `scherp ${kant}`;
}

const WIND8 = ['noord', 'noordoost', 'oost', 'zuidoost', 'zuid', 'zuidwest', 'west', 'noordwest'];
export const wind8 = (g) => WIND8[Math.round(norm(g) / 45) % 8];
export const WIND16 = ['N', 'NNO', 'NO', 'ONO', 'O', 'OZO', 'ZO', 'ZZO', 'Z', 'ZZW', 'ZW', 'WZW', 'W', 'WNW', 'NW', 'NNW'];
export const wind16 = (g) => WIND16[Math.round(norm(g) / 22.5) % 16];
/** "het zuiden", "het noordoosten". */
export const vanHet = (g) => `het ${wind8(g)}en`;

/**
 * The roads at junction k when you arrive from knoop `van`: every road except the one you came by, sorted from
 * left to right, each with its direction, its turn and its kind.
 */
export function wegenBij(net, k, van, inWeg) {
  const koers = peiling(van, k);
  return k.wegen.filter((id) => id !== inWeg).map((id) => {
    const w = net.wegen[id]; const naar = net.ander(w, k);
    const g = peiling(k, naar);
    return { weg: id, naar: naar.id, peiling: g, draai: draai(koers, g), soort: w.soort, naam: w.naam, doodlopend: !!(naar.doodlopend || naar.rand) };
  }).sort((p, q) => p.draai - q.draai);
}

/** Can the road at index i be told apart from the others by left / straight on / right alone? */
export function eenduidig(wegen, i) {
  const s = soortDraai(wegen[i].draai);
  return !!s && wegen.every((w, j) => j === i || !mogelijk(w.draai).includes(s));
}

/**
 * A route of `lengte` junctions: you start halfway along a road, walk to junction 1, choose a road at each
 * junction, and after the last one the post (the end) is halfway along the road you took. No junction twice, never
 * into a dead end, and at every junction the road to take can be told by left / straight on / right alone, so
 * every technique can write it down without doubt.
 */
export function maakRoute(net, seed, lengte = 8) {
  const r = rng(seed * 104729 + 3);
  const kandidaten = [];
  for (const w of net.wegenLijst) {
    for (const [a, b] of [[w.a, w.b], [w.b, w.a]]) {
      const ka = net.knopen[a]; const kb = net.knopen[b];
      if (isKruispunt(kb) && afstand(ka, kb) > 30 && !ka.rand) kandidaten.push({ weg: w.id, van: a, naar: b });
    }
  }
  schud(r, kandidaten);
  for (const start of kandidaten.slice(0, 120)) {
    const bezocht = new Set([start.van, start.naar]);
    const stappen = [];
    let pogingen = 0;
    const zoek = (vanId, kId, inWeg) => {
      if (++pogingen > 4000) return false;
      const k = net.knopen[kId]; const van = net.knopen[vanId];
      const wegen = wegenBij(net, k, van, inWeg);
      const opties = wegen.map((w, i) => ({ w, i })).filter(({ w, i }) => eenduidig(wegen, i) && !bezocht.has(w.naar)
        && !w.doodlopend && (stappen.length + 1 === lengte ? afstand(k, net.knopen[w.naar]) > 24 : isKruispunt(net.knopen[w.naar])));
      // straight on now and then, turns more often: that is where a technique has something to say
      const gewogen = opties.map((o) => ({ ...o, z: r() * (soortDraai(o.w.draai) === 'rechtdoor' ? 0.55 : 1) })).sort((p, q) => q.z - p.z);
      for (const { w, i } of gewogen) {
        stappen.push({ knoop: kId, van: vanId, inWeg, koers: peiling(van, k), wegen, gekozen: i });
        if (stappen.length === lengte) return true;
        bezocht.add(w.naar);
        if (zoek(kId, w.naar, w.weg)) return true;
        bezocht.delete(w.naar);
        stappen.pop();
      }
      return false;
    };
    if (zoek(start.van, start.naar, start.weg)) {
      const laatste = stappen[stappen.length - 1];
      const eindWeg = laatste.wegen[laatste.gekozen];
      const k = net.knopen[laatste.knoop]; const n = net.knopen[eindWeg.naar];
      const ka = net.knopen[start.van]; const kb = net.knopen[start.naar];
      return {
        seed, lengte,
        start: { ...start, x: (ka.x + kb.x) / 2, y: (ka.y + kb.y) / 2, koers: peiling(ka, kb) },
        stappen,
        eind: { weg: eindWeg.weg, x: (k.x + n.x) / 2, y: (k.y + n.y) / 2, koers: eindWeg.peiling },
      };
    }
  }
  return null;
}

/** A network and a route for a seed; a network that gives no route of this length tries the next seed. */
export function maakAlles(seed, lengte) {
  for (let s = seed, t = 0; t < 40; s++, t++) {
    const net = maakNetwerk(s);
    const route = maakRoute(net, s, lengte);
    if (route) return { net, route, seed: s };
  }
  throw new Error('geen route');
}

/** The landmark at a junction, if any. */
export const bakenBij = (net, knoopId) => net.bakens.find((b) => b.knoop === knoopId) ?? null;

/** A street name with its article: het Heidepad, de Eikenlaan. */
export const deNaam = (naam) => `${/pad$/.test(naam) ? 'het' : 'de'} ${naam}`;
/** A kind of junction with its article: het kruispunt, de T-splitsing, de zijweg naar links; with an adjective: het volgende kruispunt. */
export const metLidwoord = (type, bijv = '') => {
  const het = type === 'kruispunt';
  return `${het ? 'het' : 'de'} ${bijv ? `${bijv} ` : ''}${type}`;
};

/**
 * What kind of junction: Y-splitsing, zijweg naar links or rechts (a road goes on straight, one branches off),
 * T-splitsing (no road straight on), kruispunt, vijfsprong, zessprong.
 */
export function kruispuntNaam(stap) {
  const n = stap.wegen.length + 1;
  if (n === 3) {
    if (stap.wegen.every((w) => Math.abs(w.draai) < 75)) return 'Y-splitsing';
    const zij = stap.wegen.find((w) => soortDraai(w.draai) !== 'rechtdoor');
    if (stap.wegen.some((w) => soortDraai(w.draai) === 'rechtdoor')) return `zijweg naar ${zij.draai < 0 ? 'links' : 'rechts'}`;
    return 'T-splitsing';
  }
  if (n === 4) return 'kruispunt';
  if (n === 5) return 'vijfsprong';
  return 'zessprong';
}

/** The text line for a screen reader (and for everyone): where you are and which roads there are. */
export function waarRegel(stap, i, totaal) {
  const wegen = stap.wegen.map((w) => `${draaiWoord(w.draai)} (${wind8(w.peiling)})`).join(', ');
  return `Kruispunt ${i + 1} van ${totaal}. Je komt van ${vanHet(stap.koers + 180)}. Wegen: ${wegen}.`;
}
