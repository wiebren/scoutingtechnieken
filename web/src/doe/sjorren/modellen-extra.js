// More bouwwerken in 3D (bladen in ../../data/bladen/sjorren-bouwwerken.js), in the same shape as ./modellen.js and
// built with its helpers. Merged into the models in ./modellen-alle.js.
//
// Some of these move: a model may have `beweging` = { label, vanaf (the step from which the slider is shown), start
// (0–1), delen: { naam: { punt, as, hoek: [van, tot] } or { schuif: [dx, dy, dz] } }, waarde(t) (text for a screen
// reader) }. A part with `beweeg: naam` moves with that part (scene3d.js turns it as a whole); a rope with
// `volgt: [naam or null per point]` runs from a moving part to a fixed point and is drawn again as it moves.
// Sizes and choices: scratchpad/bouwwerken-extra.md and notities/technieken/sjorren-uitwerking.md ("Bouwwerken
// (ronde 2)"); dimensions marked [I] there are our own reading of a drawing.
import { DIK, MIDDEL, DUN, plus, min, keer, punt, lengte, eenheid, kruis } from './modellen.js';

const RAD = Math.PI / 180;
const mid = (a, b) => keer(plus(a, b), 0.5);

/** Collects the parts of a model (as in ./modellen.js); `beweeg(naam)` puts what comes next in a moving part. */
function bouwer() {
  const m = { palen: [], sjor: [], lijnen: [], haringen: [], dingen: [], stappen: [] };
  let nu = { stap: 1, tot: null, kopie: false };
  const b = {
    m,
    stap(naam, tekst, { tot = null, kopie = false } = {}) {
      m.stappen.push({ naam, tekst });
      nu = { stap: m.stappen.length, tot, kopie };
    },
    /** What follows belongs to the moving part `naam` (null: fixed again); a new step starts fixed. */
    beweeg(naam) { nu = { ...nu }; if (naam) nu.beweeg = naam; else delete nu.beweeg; },
    /** Change the end step or the copy flag of what follows, within the step. */
    zet(extra) { nu = { ...nu, ...extra }; },
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

const P = (m, i) => m.palen[i];
/** A point on pole p at height y. */
const opHoogte = (p, y) => { const r = eenheid(min(p.b, p.a)); return plus(p.a, keer(r, (y - p.a[1]) / r[1])); };

/** The two legs of a bok (as in ./modellen.js): feet in one plane, passing each other at the crossing. */
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

/** Poles lying side by side on the ground along `richting` from p. */
function liggend(b, p, richting, L, d, n = 2, tussen = 0.03) {
  const r = eenheid(richting); const zij = [-r[2], 0, r[0]];
  const uit = [];
  for (let i = 0; i < n; i++) {
    const z = (i - (n - 1) / 2) * (d + tussen);
    const a = plus(plus(p, keer(zij, z)), [0, d / 2, 0]);
    uit.push(b.paal(a, plus(a, keer(r, L)), d, 'liggend'));
  }
  return uit;
}

/**
 * Where a new pole along `dir` (radius rn) lies against pole p at its point q: one radius each apart, on the side of
 * `kant`. Returns the point on the axis of the new pole.
 */
function tegen(p, q, dir, rn, kant) {
  let n = eenheid(kruis(eenheid(min(p.b, p.a)), eenheid(dir)));
  if (punt(n, kant) < 0) n = keer(n, -1);
  return plus(q, keer(n, p.d / 2 + rn + 0.003));
}

/** A pole through a and c, made L long with the extra length shared over both ends. */
function door(b, a, c, L, d, rol) {
  const r = eenheid(min(c, a)); const l = lengte(min(c, a));
  return b.paal(plus(a, keer(r, -(L - l) / 2)), plus(c, keer(r, (L - l) / 2)), d, rol);
}

/** A point turned round the z axis through c by `graden` (in the x-y plane). */
function draaiZ(p, c, graden) {
  const a = graden * RAD; const x = p[0] - c[0]; const y = p[1] - c[1];
  return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a), p[2]];
}

// ---------------------------------------------------------------------------------------------------------------
// Katapult: a blijde (traction trebuchet); the reuzenkatapult, a big slingshot of binnenbanden, has a page of its own

const katapult = () => blijde();
const reuzenkatapult = () => binnenbandKatapult();

function blijde() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL; const ZA = 0.75;
  b.stap('Bokken', 'Bouw twee bokken van palen van 3 m, elk met een vorksjorring zo’n 70 cm onder de toppen. Zet ze 1,5 m uit elkaar, evenwijdig aan de schietrichting.');
  const bokken = [-1, 1].map((s) => {
    const vorm = bokVorm([0, 0, s * ZA], [1, 0, 0], 1.0, 2.0, 3, d);
    const poten = vorm.poten.map((p) => b.paal(p.a, p.b, d, 'poot'));
    b.sjor('vork', poten, { p: vorm.C, naam: 'de kop van een bok' });
    return { s, vorm, poten };
  });
  b.stap('Onderstel', 'Sjor laag aan elke bok een langsligger van 3 m, en leg er voor en achter een dwarsligger van 2 m overheen. Acht kruissjorringen: zo staat het onderstel als een kist.');
  const langs = bokken.map((bk) => {
    const c = plus([0, 0.45, bk.s * ZA], keer(bk.vorm.diep, bk.s * (d / 2 + d / 2 + 0.005)));
    const l = b.paal(plus(c, [-1.5, 0, 0]), plus(c, [1.5, 0, 0]), d, 'langsligger');
    for (const p of bk.poten) b.sjor('kruis', [p, l], { naam: 'langsligger aan poot' });
    return l;
  });
  const yl = P(m, langs[0]).a[1];
  const dwars = [-1.35, 1.35].map((x) => {
    const w = b.paal([x, yl + d, -1.05], [x, yl + d, 1.05], d, 'dwarsligger');
    for (const l of langs) b.sjor('kruis', [l, w], { naam: 'dwarsligger op langsligger' });
    return w;
  });
  b.stap('As', 'Leg een dikke as van 2 m in de twee vorken en sjor hem aan elke bok vast met een kruissjorring. Om deze as draait straks de arm.');
  const yAs = bokken[0].vorm.vorkY(DIK / 2);
  const as = b.paal([0, yAs, -1.0], [0, yAs, 1.0], DIK, 'as');
  for (const bk of bokken) b.sjor('kruis', [bk.poten[1], as], { naam: 'as in de vork' });

  // the arm: 4,5 m, a quarter at the short end (front, +x); it turns round the as. At rest the long end lies low at
  // the back; it stops when the short end hits the aanslag on the back legs.
  const G = [0, yAs, 0]; const off = DIK / 2 + d / 2 + 0.003; const kort = 1.15; const lang = 3.35;
  const RUST = 32;
  // the stop: find the angle at which a beam against the back legs touches the short arm 0,95 m from the as
  const achter = bokken.map((bk) => P(m, bk.poten[0]));
  const raakt = (graden) => {
    const a = graden * RAD; const dir = [Math.cos(a), Math.sin(a), 0]; const op = [-Math.sin(a), Math.cos(a), 0];
    // the beam's axis: beside the arm on the side it turns towards (clockwise), against the back leg
    const q = plus(plus(G, keer(op, off)), keer(dir, 0.95));
    const c = plus(q, keer([dir[1], -dir[0], 0], d / 2 + DUN / 2 + 0.003));
    const leg = achter[0]; const u = eenheid(min(leg.b, leg.a)); const n = eenheid([u[1], -u[0], 0]);
    return { c, f: punt(min(c, leg.a), n) - (d / 2 + DUN / 2 + 0.003) };
  };
  let lo = -135; let hi = -85;
  for (let i = 0; i < 40; i++) { const h = (lo + hi) / 2; if (raakt(h).f > 0) hi = h; else lo = h; }
  const STOP = (lo + hi) / 2; const aanslagC = raakt(STOP).c;

  b.stap('Aanslag', 'Sjor achter tussen de achterste poten een aanslag: een balk van 2 m met kruissjorringen, met een jutezak eromheen. Daar slaat de arm straks tegenaan, zodat de bal naar voren vliegt.');
  const aanslag = b.paal([aanslagC[0], aanslagC[1], -1.0], [aanslagC[0], aanslagC[1], 1.0], DUN, 'aanslag');
  for (const bk of bokken) b.sjor('kruis', [bk.poten[0], aanslag], { naam: 'aanslag aan de achterste poot' });

  b.stap('Arm', 'Leg de werparm van 4,5 m over de as, met een kwart aan de korte kant voor. Bind hem met een losse strop om arm en as: zo blijft hij op zijn plek, maar kan hij draaien.');
  b.beweeg('arm');
  const armPunt = (x, y = 0) => draaiZ([x, yAs + off + y, 0], G, RUST);
  const arm = b.paal(armPunt(-lang), armPunt(kort), d, 'werparm');
  b.sjor('scharnier', [arm, as], { vorm: 'diagonaal', naam: 'werparm op de as' });
  b.stap('Touw', 'Zet aan het lange eind een emmer of bakje vast, en aan het korte eind het trektouw. Het trektouw loopt omlaag door een katrol op de voorste dwarsligger en dan onder de blijde door naar achteren, naar de trekkers.');
  b.beweeg('arm');
  b.ding('pan', { p: armPunt(-lang + 0.25, d / 2 + 0.075), r: 0.12, hoog: 0.15 });
  b.ding('koord', { p: armPunt(-lang + 0.25, d / 2 + 0.17), r: 0.075 });
  b.sjor('mastworp', [arm], { p: armPunt(kort - 0.12), naam: 'trektouw aan de arm' });
  b.beweeg(null);
  const katrol = [1.35, yl + d + d / 2 + 0.07, 0];
  b.ding('katrol', { p: katrol });
  b.sjor('mastworp', [dwars[1]], { p: [1.35, yl + d, 0.12], naam: 'katrol aan de dwarsligger' });
  const vast = armPunt(kort - 0.12, -d / 2);
  b.lijn([vast, plus(katrol, [0.04, 0.03, 0]), plus(katrol, [-0.02, -0.05, 0]), [-5.0, 0.8, 0], [-5.6, 0.03, 0.4]], 'trektouw',
    { dik: 0.007, naam: 'trektouw', volgt: ['arm', null, null, null, null] });
  b.stap('Schieten', 'Leg een zachte bal in het bakje. Iedereen staat achter de blijde, het schietveld voor de blijde is afgezet en leeg. Op het commando trekken de trekkers het touw in één keer hard naar achteren: de arm zwaait omhoog en slaat tegen de aanslag, en de bal vliegt naar voren.');
  return {
    naam: 'Blijde', ...m, grond: 'gras', zicht: { theta: 0.95, phi: 1.12 },
    extra: ['1 emmer of bakje', 'zachte ballen (sponsballen, tennisballen)', '1 katrol', '1 trektouw van ±10 m', 'een jutezak om de aanslag'],
    beweging: {
      label: 'Trek aan het trektouw', vanaf: 6, start: 0,
      delen: { arm: { punt: G, as: [0, 0, 1], hoek: [0, STOP - RUST] } },
      waarde: (t) => (t < 0.03 ? 'de arm ligt klaar' : t > 0.97 ? 'de arm slaat tegen de aanslag' : 'de arm zwaait omhoog'),
    },
  };
}

function binnenbandKatapult() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL;
  b.stap('Raam', 'Leg op de grond een raam: twee langsliggers van 3 m en daaroverheen voor en achter een dwarsligger van 2 m. Vier kruissjorringen.');
  const langs = [-0.75, 0.75].map((z) => b.paal([-1.5, d / 2, z], [1.5, d / 2, z], d, 'langsligger'));
  const dwars = [-1.3, 1.3].map((x) => {
    const w = b.paal([x, d * 1.5, -1.0], [x, d * 1.5, 1.0], d, 'dwarsligger');
    for (const l of langs) b.sjor('kruis', [l, w], { naam: 'dwarsligger op langsligger' });
    return w;
  });
  b.stap('Staanders', 'Zet voorin twee staanders van 2 m tegen de voorste dwarsligger en sjor ze vast met kruissjorringen.');
  const zs = 0.6; const xs = 1.3 + d;
  const st = [-1, 1].map((s) => {
    const p = b.paal([xs, 0, s * zs], [xs, 2.0, s * zs], d, 'staander');
    b.sjor('kruis', [p, dwars[1]], { naam: 'staander aan dwarsligger' });
    return p;
  });
  b.stap('Schoren', 'Zet naast elke staander een schoor van 3,5 m naar de achterste dwarsligger, met diagonaalsjorringen aan beide kanten. De banden trekken de staanders naar achteren: de schoren houden ze tegen.');
  for (const [s, i] of [[-1, 0], [1, 1]]) {
    const z = s * (zs + d / 2 + DUN / 2 + 0.003);
    const top = [xs, 1.25, z];
    // the low end lies on the back dwarsligger, one radius each above its axis
    let y = 0.2 + d * 1.5;
    for (let k = 0; k < 3; k++) {
      const hoek = Math.atan2(top[1] - y, top[0] + 1.3);
      y = d * 1.5 + (d / 2 + DUN / 2 + 0.003) / Math.cos(hoek);
    }
    const laag = [-1.3, y, z];
    const sch = door(b, laag, top, 3.5, DUN, 'schoor');
    b.sjor('diagonaal', [st[i], sch], { naam: 'schoor aan staander' });
    b.sjor('diagonaal', [dwars[0], sch], { naam: 'schoor op dwarsligger' });
  }
  b.stap('Banden', 'Knoop drie oude fietsbinnenbanden tussen de staanders, op ongeveer 1 m hoogte, met in het midden een zak of lap waar de bal in komt.');
  const zak = [xs - 0.06, 1.08, 0];
  const banden = [1.0, 1.08, 1.16];
  for (const y of banden) {
    for (const s of [-1, 1]) b.sjor('mastworp', [st[s < 0 ? 0 : 1]], { p: [xs, y, s * zs], naam: 'binnenband om de staander' });
    b.lijn([[xs - d / 2, y, -zs + 0.02], [zak[0], y, -0.11], [zak[0], y, 0.11], [xs - d / 2, y, zs - 0.02]], 'binnenband',
      { dik: 0.011, naam: 'binnenband', volgt: [null, 'zak', 'zak', null] });
  }
  b.beweeg('zak');
  b.ding('zeil', { punten: [[zak[0], 1.2, -0.12], [zak[0], 1.2, 0.12], [zak[0], 0.96, 0.12], [zak[0], 0.96, -0.12]], normaal: eenheid([-1, 0.3, 0]) });
  b.ding('koord', { p: [zak[0] - 0.08, 1.08, 0], r: 0.07 });
  b.beweeg(null);
  b.stap('Schieten', 'Eén scout trekt de zak met de bal naar achteren, tussen de langsliggers door, en laat los. Iedereen anders staat achter de katapult; het schietveld ervoor is afgezet.');
  return {
    naam: 'Katapult met binnenbanden', ...m, grond: 'gras', zicht: { theta: 1.0, phi: 1.1 },
    extra: ['3 oude fietsbinnenbanden', 'een zak of lap voor de bal', 'zachte ballen'],
    beweging: {
      label: 'Trek de zak naar achteren', vanaf: 4, start: 0,
      delen: { zak: { schuif: [-1.5, -0.2, 0] } },
      waarde: (t) => `${Math.round(t * 150)} cm naar achteren`,
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Wip: two bokken side by side, an as across their dwarsliggers, the wipbalk on the as

function wip() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL; const ZB = 0.4; const yD = 0.75;
  b.stap('Palen', 'Leg voor elke bok twee palen van 3 m naast elkaar.', { tot: 3, kopie: true });
  const lig = [-1, 1].map((s) => liggend(b, [-1.5, 0, s * 1.3], [1, 0, 0], 3, d, 2, 0.04));
  b.stap('Vork', 'Leg op elk paar een vorksjorring, zo’n 50 cm onder de toppen.', { tot: 3, kopie: true });
  lig.forEach((pr, i) => b.sjor('vork', pr, { p: [1.0, 0, (i ? 1 : -1) * 1.3], naam: 'liggend' }));
  b.stap('Bokken', 'Zet de bokken overeind, 80 cm uit elkaar, en sjor aan de binnenkant van elke bok een dwarsligger van 2 m op 75 cm hoogte (kruissjorringen).');
  const bokken = [-1, 1].map((s) => {
    const vorm = bokVorm([0, 0, s * ZB], [1, 0, 0], 0.9, 2.4, 3, d);
    const poten = vorm.poten.map((p) => b.paal(p.a, p.b, d, 'poot'));
    b.sjor('vork', poten, { p: vorm.C, naam: 'de kop van een bok' });
    const c = plus([0, yD, s * ZB], keer(vorm.diep, -s * (d / 2 + d / 2 + 0.005)));
    const dw = b.paal(plus(c, [-1, 0, 0]), plus(c, [1, 0, 0]), d, 'dwarsligger');
    for (const p of poten) b.sjor('kruis', [p, dw], { naam: 'dwarsligger aan poot' });
    return { s, vorm, poten, dw };
  });
  b.stap('Liggers', 'Verbind de bokken onderaan met twee liggers van 1,5 m, voor en achter, met kruissjorringen. Nu staan ze als één geheel.');
  for (const k of [0, 1]) {
    const leg = P(m, bokken[0].poten[k]); const q = opHoogte(leg, 0.3);
    const c = tegen(leg, q, [0, 0, 1], d / 2, [k ? 1 : -1, 0, 0]);
    const l = b.paal([c[0], c[1], -0.75], [c[0], c[1], 0.75], d, 'ligger');
    for (const bk of bokken) b.sjor('kruis', [bk.poten[k], l], { naam: 'ligger aan poot' });
  }
  b.stap('Tuien', 'Zet aan de kop van elke bok twee tuien met een mastworp, schuin naar buiten naar haringen. Een bok valt anders opzij om.');
  for (const bk of bokken) {
    const top = plus(bk.vorm.C, [0, 0.18, 0]);
    b.sjor('mastworp', [bk.poten[0]], { p: top, naam: 'tuien aan de kop' });
    for (const x of [-1.6, 1.6]) {
      const kop = b.haring([x, 0, bk.s * 3.0], [x, 0, bk.s * 2]);
      b.lijn([top, kop], 'tui');
    }
  }
  b.stap('As', 'Leg een korte, dikke as van 1,2 m dwars over de twee dwarsliggers. Klosjes aan weerszijden houden hem op zijn plek; hij ligt los, zodat hij kan rollen.');
  const yAs = yD + d / 2 + DIK / 2;
  for (const bk of bokken) {
    const z = P(m, bk.dw).a[2];
    for (const x of [-1, 1]) b.ding('plank', { p: [x * (DIK / 2 + 0.045), yD + d / 2 + 0.025, z], lang: 0.08, breed: 0.09, dik: 0.05 });
  }
  b.beweeg('wip');
  const as = b.paal([0, yAs, -0.6], [0, yAs, 0.6], DIK, 'as');
  b.stap('Wipbalk', 'Leg de wipbalk van 4 m precies in het midden op de as en sjor hem vast met een kruissjorring: balk en as kantelen samen. Sjor bij elk eind een handgreep.');
  b.beweeg('wip');
  const yB = yAs + DIK / 2 + d / 2;
  const balk = b.paal([-2, yB, 0], [2, yB, 0], d, 'wipbalk');
  b.sjor('kruis', [as, balk], { naam: 'wipbalk op de as' });
  for (const x of [-1.5, 1.5]) {
    const g = b.paal([x, yB - 0.15, d / 2 + DUN / 2 + 0.003], [x, yB + 0.65, d / 2 + DUN / 2 + 0.003], DUN, 'handgreep');
    b.sjor('kruis', [balk, g], { naam: 'handgreep aan de wipbalk' });
  }
  b.beweeg(null);
  b.stap('Banden', 'Leg onder elk eind een oude autoband: die vangt de klap op, en je voeten en vingers komen er niet tussen.');
  for (const x of [-1.85, 1.85]) b.ding('band', { p: [x, 0.1, 0], r: 0.27, dik: 0.1 });
  const kant = (t) => (t < 0.5 ? 'links' : 'rechts');
  return {
    naam: 'Wip', ...m, grond: 'gras', zicht: { theta: 0.5, phi: 1.15 },
    extra: ['2 oude autobanden', '4 klosjes'],
    beweging: {
      label: 'Laat de wip gaan', vanaf: 7, start: 0,
      delen: { wip: { punt: [0, yAs, 0], as: [0, 0, 1], hoek: [20, -20] } },
      waarde: (t) => (Math.abs(t - 0.5) < 0.04 ? 'de wipbalk ligt recht' : `${kant(t)} omlaag`),
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Hangbrug: two portalen, two sagging draagtouwen with a vierloper and an anker behind each, the deck on hangers

function hangbrug() {
  const b = bouwer(); const { m } = b;
  const XP = 4.2; const ZS = 0.75; const d = DIK; const rr = MIDDEL;
  b.ding('water', { x0: -3, x1: 3 });
  b.stap('Staanders', 'Zet op elke oever twee dikke staanders van 4 m, 1,5 m uit elkaar en een halve meter ingegraven. (Vaak bouw je een portaal liggend en zet je het daarna overeind.)');
  const portalen = [-1, 1].map((s) => ({ s, st: [-1, 1].map((k) => b.paal([s * XP, 0, k * ZS], [s * XP, 4, k * ZS], d, 'staander (ingegraven)')) }));
  b.stap('Regels', 'Sjor aan de kant van het water een bovenregel op 3,6 m en een onderregel op 1 m, met kruissjorringen. Over de bovenregel gaan straks de draagtouwen; op de onderregel stap je de brug op.');
  const xr = (s) => s * (XP - (d / 2 + rr / 2 + 0.003));
  for (const p of portalen) {
    p.boven = b.paal([xr(p.s), 3.6, -1.1], [xr(p.s), 3.6, 1.1], rr, 'bovenregel');
    p.onder = b.paal([xr(p.s), 1.0, -1.1], [xr(p.s), 1.0, 1.1], rr, 'onderregel');
    for (const st of p.st) { b.sjor('kruis', [st, p.boven], { naam: 'bovenregel aan staander' }); b.sjor('kruis', [st, p.onder], { naam: 'onderregel aan staander' }); }
  }
  b.stap('Schoren', 'Zet aan de buitenkant van elk portaal een kruis van twee schoren van 3 m, met diagonaalsjorringen aan de staanders en waar ze kruisen. Zo trekt het portaal niet scheef.');
  for (const p of portalen) {
    const sch = [0, 1].map((k) => {
      const x = p.s * (XP + d / 2 + DUN / 2 + 0.003 + k * DUN);
      return door(b, [x, 1.25, (k ? 1 : -1) * ZS], [x, 3.35, (k ? -1 : 1) * ZS], 3, DUN, 'kruisschoor');
    });
    b.sjor('diagonaal', [p.st[0], sch[0]], { naam: 'schoor aan staander' }); b.sjor('diagonaal', [p.st[1], sch[0]], { naam: 'schoor aan staander' });
    b.sjor('diagonaal', [p.st[1], sch[1]], { naam: 'schoor aan staander' }); b.sjor('diagonaal', [p.st[0], sch[1]], { naam: 'schoor aan staander' });
    b.sjor('diagonaal', sch, { naam: 'waar de schoren kruisen' });
  }
  b.stap('Tuien', 'Zet elke staander met een tui opzij vast aan een haring. Naar achteren houden de draagtouwen het portaal.');
  for (const p of portalen) {
    p.st.forEach((st, i) => {
      const k = i ? 1 : -1; const top = [p.s * XP, 3.85, k * ZS];
      b.sjor('mastworp', [st], { p: top, naam: 'tui aan de staander' });
      b.lijn([top, b.haring([p.s * (XP + 0.6), 0, k * 3.6], [0, 0, k])], 'tui');
    });
  }
  b.stap('Ankers', 'Zet achter elk portaal, zo’n 4,5 m verder, twee zware ankers: haringen in serie (1-2-3) met slingersjorringen.');
  const zt = 0.62;
  const ankers = portalen.map((p) => [-1, 1].map((k) => b.anker([p.s * (XP + 4.5), 0, k * zt], [p.s, 0, 0], [1, 2, 3])));
  b.stap('Draagtouwen', 'Leg twee dikke draagtouwen over de bovenregels. Span ze achter elk portaal met een vierloper naar het anker, en laat ze ruim doorhangen: hoe strakker, hoe harder ze aan de ankers trekken.');
  const ytop = 3.6 + rr / 2 + 0.012; const ymid = 2.25;
  const yDraag = (x) => ytop - (ytop - ymid) * (1 - (x / xr(1)) ** 2);
  for (const [i, k] of [[0, -1], [1, 1]]) {
    const z = k * zt; const pts = [];
    const takel = portalen.map((p, j) => {
      const top = [xr(p.s), ytop, z]; const kop = ankers[j][i];
      const B1 = plus(top, keer(min(kop, top), 0.42)); const B2 = plus(top, keer(min(kop, top), 0.72));
      return { top, kop, B1, B2 };
    });
    pts.push(takel[0].B1, takel[0].top);
    for (let n = 1; n < 16; n++) { const x = xr(-1) + (2 * xr(1) * n) / 16; pts.push([x, yDraag(x), z]); }
    pts.push(takel[1].top, takel[1].B1);
    b.lijn(pts, 'hangtouw', { dik: 0.009, naam: 'draagtouw' });
    for (const t of takel) {
      b.ding('katrol', { p: t.B1 }); b.ding('katrol', { p: t.B2 });
      const zij = eenheid(kruis(min(t.B2, t.B1), [0, 0, 1]));
      // four parts of rope between the blocks; one of them stands for the whole takel when you tap it
      for (const o of [-0.045, -0.015, 0.015, 0.045]) b.lijn([plus(t.B1, keer(zij, o)), plus(t.B2, keer(zij, o))], o === 0.015 ? 'vierloper' : 'lijn', { dik: 0.004, naam: 'vierloper' });
      b.lijn([t.B2, t.kop], 'lijn', { dik: 0.006, naam: 'strop naar het anker' });
    }
  }
  b.stap('Dek', 'Leg de dwarsliggers voor het dek klaar: dunne palen van 1,5 m, om de 30 cm.');
  const yDek = (x) => 1.1 - 0.15 * (1 - (x / 3.75) ** 2);
  const sporten = [];
  for (let i = 0; i <= 25; i++) {
    const x = -3.75 + i * 0.3; const y = yDek(x);
    sporten.push({ x, y, i: b.paal([x, y, -0.75], [x, y, 0.75], DUN, 'dwarsligger') });
  }
  b.stap('Hangers', 'Hang elke derde dwarsligger met korte touwen aan de draagtouwen: een mastworp om de dwarsligger, boven een paar halve steken om het draagtouw. Test de brug met zandzakken voor iemand eroverheen gaat.');
  for (const sp of sporten) {
    if (sp.i % 3 !== 1 && sp !== sporten[0] && sp !== sporten[sporten.length - 1]) continue;
    for (const k of [-1, 1]) {
      const z = k * zt;
      b.sjor('mastworp', [sp.i], { p: [sp.x, sp.y, z], naam: 'hanger aan de dwarsligger' });
      b.lijn([[sp.x, yDraag(sp.x) - 0.01, z], [sp.x, sp.y + DUN / 2, z]], 'hanger', { dik: 0.005, naam: 'hanger' });
    }
  }
  return {
    naam: 'Hangbrug', ...m, grond: 'gras', zicht: { theta: 0.55, phi: 1.2 },
    extra: ['2 draagtouwen van ±20 m (kunststof, 16–20 mm)', '2 vierlopers (4 blokken met 2 schijven)', '±20 korte touwen als hangers'],
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Zandlopertoren: two driepoten pushed into each other, built lying and raised with a takel in a hulpdriepoot

function zandlopertoren() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL; const R = 1.4; const L = 3.5; const tot = 3.1; const o = 0.065;
  const yL = Math.sqrt(tot ** 2 - R ** 2); const yU = yL - 0.5; const H = yU + yL;
  const hoeken = [60, 180, 300];
  const rad = (g) => [Math.cos(g * RAD), 0, Math.sin(g * RAD)];
  const tang = (g) => [-Math.sin(g * RAD), 0, Math.cos(g * RAD)];
  const xe = R * Math.cos(60 * RAD);                    // the two feet the tower tilts over
  // the hulpdriepoot stands behind the foot, on the side the tower is pulled towards (away from its lying top), ±10 m
  // from that top; the hijstouw runs from the top over its katrol down to a takel at an anker behind it
  const XH = xe - 5;
  /** The tower turned over its feet by `graden` towards +x (0 = upright, 90 = lying), a little lifted when lying. */
  const T = (graden) => (p) => { const q = draaiZ([p[0], p[1], p[2]], [xe, 0, 0], -graden); q[1] += 0.06 * (graden / 90); return q; };

  // one copy of the tower (or a part of it), in pose T; returns what the next part needs
  function toren(Tp, { onder = true, boven = true, midden = true, platform = false, ring = true } = {}, z = {}) {
    const pl = (a, c, dd, rol) => b.paal(Tp(a), Tp(c), dd, rol);
    if (onder) {
      z.onder = hoeken.map((g) => {
        const voet = plus(keer(rad(g), R), keer(tang(g), -o)); const kop = plus([0, yL, 0], keer(tang(g), -o));
        return { a: voet, b: plus(voet, keer(eenheid(min(kop, voet)), L)) };
      });
      z.oi = z.onder.map((p) => pl(p.a, p.b, d, 'poot onder'));
      b.sjor('acht', z.oi, { p: Tp([0, yL, 0]), naam: 'de kop van de onderste driepoot' });
      if (ring) zijden(z.onder, z.oi, 0.3, 2.5, 'voetdriehoek');
    }
    if (boven) {
      z.boven = hoeken.map((g) => {
        const lash = plus([0, yU, 0], keer(tang(g), o)); const top = plus(plus(keer(rad(g), R), [0, H, 0]), keer(tang(g), o));
        const r = eenheid(min(top, lash));
        return { a: plus(lash, keer(r, -(L - tot))), b: top };
      });
      z.bi = z.boven.map((p) => pl(p.a, p.b, d, 'poot boven'));
      b.sjor('acht', z.bi, { p: Tp([0, yU, 0]), naam: 'de kop van de bovenste driepoot' });
      if (ring) zijden(z.boven, z.bi, H - 0.3, 2.5, 'leuning');
    }
    if (midden) for (let k = 0; k < 3; k++) b.sjor('kruis', [z.oi[k], z.bi[k]], { naam: 'waar de driepoten kruisen' });
    if (platform) z.platform = zijden(z.boven, z.bi, H - 1.0, 2, 'platformpaal');
    return z;

    function zijden(poten, idx, y, lengteP, rol) {
      const uit = [];
      for (let k = 0; k < 3; k++) {
        const p1 = opHoogte(poten[k], y); const p2 = opHoogte(poten[(k + 1) % 3], y);
        const mm = mid(p1, p2); const naar = eenheid([mm[0], 0, mm[2]]);
        const c = plus(mm, keer(naar, d + 0.003)); const r = eenheid(min(p2, p1));
        const i = pl(plus(c, keer(r, -lengteP / 2)), plus(c, keer(r, lengteP / 2)), d, rol);
        b.sjor('kruis', [idx[k], i], { naam: `${rol} aan poot` }); b.sjor('kruis', [idx[(k + 1) % 3], i], { naam: `${rol} aan poot` });
        uit.push(c);
      }
      return uit;
    }
  }
  // where the hijstouw is tied: high on the leg that is on top while the tower lies
  const vast = plus(plus(keer(rad(180), R * (1 - 0.45 / tot)), [0, H - 0.45 * (yL / tot), 0]), [0.05, 0, 0]);
  const katrol = [XH + 0.12, 3.2, 0];
  const B1 = [XH - 2.2, 1.25, 0]; const B2 = [XH - 3.1, 0.62, 0];
  /** The hijstouw in pose Tp: from the top over the katrol down to the takel; while hoisting also a tegenhoudtouw on
   *  the far side and two ropes to keep it in balance sideways. */
  const hijs = (Tp, { opzij = false, tegen = false } = {}) => {
    const p = Tp(vast);
    b.lijn([p, plus(katrol, [0, 0.06, 0]), plus(katrol, [-0.07, 0, 0]), B1], 'hijstouw', { dik: 0.008, naam: 'hijstouw over de katrol' });
    if (opzij) for (const k of [-1, 1]) b.lijn([p, [p[0] + 0.5, 1.0, k * 4.5]], 'hijstouw', { dik: 0.007, naam: 'touw opzij, voor het evenwicht' });
    if (tegen) b.lijn([p, [xe + H + 2.5, 1.0, 0], [xe + H + 3.0, 0.03, 0.4]], 'hijstouw', { dik: 0.007, naam: 'tegenhoudtouw aan de andere kant' });
  };

  const LIG = 90;
  b.stap('Driepoot', 'Bouw een driepoot van drie palen van 3,5 m met een achtsjorring, en sjor onderaan een driehoek van palen van 2,5 m (kruissjorringen). Leg hem op zijn kant.', { tot: 5, kopie: true });
  const z1 = toren(T(LIG), { boven: false, midden: false });
  b.stap('In elkaar', 'Bouw net zo’n tweede driepoot, met de driehoek als leuning aan de bovenkant. Steek één poot door de kop van de eerste en schuif de twee in elkaar: de tweede staat straks op zijn kop.', { tot: 5, kopie: true });
  toren(T(LIG), { onder: false, midden: false }, z1);
  b.stap('Sjorringen', 'Sjor de palen vast waar ze elkaar kruisen. Ze kruisen in een scherpe hoek, maar hier gebruik je toch een kruissjorring. Bind ook de uiteinden van elke driepoot vast aan de palen van de andere.', { tot: 5, kopie: true });
  toren(T(LIG), { onder: false, boven: false }, z1);
  b.stap('Hulpdriepoot', 'Zet achter de voet van de toren, aan de kant tegenover de top, een hulpdriepoot met een katrol in de kop: zo’n 10 m van de top. Daarachter komt een anker met een takel. Zet de hijstouwen vast aan de bovenkant van de zandloper en leid het lange touw over de katrol omlaag naar de takel.');
  {
    const C = [XH, 3.35, 0];
    const poten = [0, 120, 240].map((g) => {
      const v = [XH + Math.cos(g * RAD) * 1.3, 0, Math.sin(g * RAD) * 1.3]; const t = tang(g);
      const doel = plus(C, keer(t, o));
      return b.paalL(plus(v, keer(t, o)), min(doel, plus(v, keer(t, o))), 4, d, 'poot hulpdriepoot');
    });
    b.sjor('acht', poten, { p: C, naam: 'de kop van de hulpdriepoot' });
    // the hulpdriepoot goes away again before the last step; it is in the parts list as an extra line
    for (const i of [0, 1, 2]) Object.assign(P(m, poten[i]), { tot: 8, kopie: true });
    Object.assign(m.sjor[m.sjor.length - 1], { tot: 8, kopie: true });
    b.zet({ tot: 8 });
    b.ding('katrol', { p: katrol });
    // the takel (a vierloper) between the hijstouw and an anker behind the hulpdriepoot
    b.ding('katrol', { p: B1 }); b.ding('katrol', { p: B2 });
    const zij = eenheid(kruis(min(B2, B1), [0, 0, 1]));
    for (const o of [-0.045, -0.015, 0.015, 0.045]) b.lijn([plus(B1, keer(zij, o)), plus(B2, keer(zij, o))], o === 0.015 ? 'vierloper' : 'lijn', { dik: 0.004, naam: 'takel' });
    b.lijn([plus(B1, [0.02, -0.04, 0]), [XH - 1.4, 1.0, 0.7], [XH - 1.0, 0.03, 1.1]], 'lijn', { dik: 0.006, naam: 'haalpart van de takel' });
    const ak = b.anker([XH - 3.7, 0, 0], [-1, 0, 0], [1, 2, 3]);
    b.lijn([B2, ak], 'lijn', { dik: 0.006, naam: 'strop naar het anker' });
    b.zet({ tot: 5, kopie: true });
    hijs(T(LIG));
  }
  b.stap('Hijsen', 'Haal de takel aan: het hijstouw over de katrol trekt de top omhoog, naar de kant van de hulpdriepoot. Twee ploegen houden de toren met touwen opzij in evenwicht, en een tegenhoudtouw aan de andere kant voorkomt dat hij doorschiet. Niemand staat onder de toren of tussen de toren en de hulpdriepoot.', { tot: 6, kopie: true });
  toren(T(45)); hijs(T(45), { opzij: true, tegen: true });
  b.stap('Rechtop', 'Zet hem een eerste keer helemaal rechtop: staat hij recht, en is de bovenkant ongeveer waterpas? Laat hem dan weer zakken om bij te stellen.', { tot: 7, kopie: true });
  toren(T(0)); hijs(T(0), { tegen: true });
  b.stap('Platform', 'Bouw met de toren weer liggend het platform: een driehoek van palen van 2 m, zo’n meter onder de top, met planken erop. Maak de touwladder en de tuien vast.', { tot: 8, kopie: true });
  toren(T(LIG), { platform: true }); hijs(T(LIG));
  b.stap('Klaar', 'Hijs de toren definitief rechtop en zet de drie tuien vast aan ankers. Wie op het platform staat, is gezekerd.');
  const zf = toren(T(0), { platform: true });
  // planks on the platform triangle (60°, 180°, 300° corners), and the touwladder from its side at +x
  const yp = H - 1.0 + d + 0.02; const rp = R * ((H - 1.0 - yU) / yL);
  for (let i = 0; i < 5; i++) {
    const zz = -0.42 + i * 0.21; const xa = -rp + 0.15 + (Math.abs(zz) / Math.sin(60 * RAD)) * 0.5 * 1.0; const xb = rp * 0.5 + 0.06;
    b.ding('plank', { p: [(xa + xb) / 2, yp, zz], lang: Math.max(0.3, xb - xa), breed: 0.19, dik: 0.03 });
  }
  const xl = rp * 0.5 + d + 0.06;
  for (const k of [-0.16, 0.16]) b.lijn([[xl, yp, k], [xl + 0.05, 0.02, k]], 'lijn', { dik: 0.008, naam: 'touwladder' });
  for (let y = 0.35; y < yp - 0.1; y += 0.3) b.ding('plank', { p: [xl + 0.05 * (1 - y / yp), y, 0], lang: 0.04, breed: 0.36, dik: 0.03 });
  for (const g of hoeken) {
    const top = plus(plus(keer(rad(g), R * (1 - 0.15 / tot)), [0, H - 0.15 * (yL / tot), 0]), keer(tang(g), o));
    const idx = zf.bi[hoeken.indexOf(g)];
    b.sjor('mastworp', [idx], { p: top, naam: 'tui aan de top' });
    b.lijn([top, b.anker(keer(rad(g), 6.5), rad(g), [1, 2])], 'tui');
  }
  return {
    naam: 'Zandlopertoren', ...m, grond: 'gras', zicht: { theta: 0.35, phi: 1.2 },
    extra: ['voor de hulpdriepoot: 3 palen van 4 m en een achtsjorring', 'een vierloper en een anker achter de hulpdriepoot', '±10 lichte planken voor het platform', '1 touwladder', '1 katrol', '3 hijstouwen van 15–25 m', '3 tuien'],
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Ophaalbrug: a ladder deck hinged on a stam at the bank, a galg with a wipbalk and a contragewicht

function ophaalbrug() {
  const b = bouwer(); const { m } = b;
  const XH = -3.19; const LD = 4.0; const ZL = 0.55; const OPEN = 65;
  b.ding('water', { x0: -2.7, x1: 0.4 });
  b.stap('Dek', 'Maak het dek als een brede ladder: twee liggers van 4 m en dwarsliggers van 1,5 m erop, om de 30 cm.');
  b.beweeg('dek');
  const yl = DIK + MIDDEL / 2;
  const liggers = [-1, 1].map((k) => b.paal([XH - 0.12, yl, k * ZL], [XH - 0.12 + LD, yl, k * ZL], MIDDEL, 'ligger'));
  const sporten = [];
  for (let x = XH + 0.15; x <= XH + LD - 0.2; x += 0.3) sporten.push(b.paal([x, yl + MIDDEL / 2 + DUN / 2, -0.75], [x, yl + MIDDEL / 2 + DUN / 2, 0.75], DUN, 'dwarsligger'));
  b.stap('Sjorringen', 'Sjor elke dwarsligger met een kruissjorring aan beide liggers.');
  b.beweeg('dek');
  for (const sp of sporten) for (const l of liggers) b.sjor('kruis', [l, sp], { naam: 'dwarsligger aan ligger' });
  b.stap('Scharnier', 'Leg op de oever een dikke stam (de drempel) en sla er paaltjes achter. Leg het dek met het korte eind erop en bind elke ligger met een losse strop aan de stam: zo kan het dek omhoog draaien. Aan de overkant ligt het op een tweede stam.');
  const drempel = b.paal([XH, DIK / 2, -1.0], [XH, DIK / 2, 1.0], DIK, 'drempel');
  for (const k of [-0.8, 0.8]) b.haring([XH - 0.16, 0, k], [-1, 0, 0]);
  const ver = b.paal([XH + LD - 0.32, DIK / 2, -1.0], [XH + LD - 0.32, DIK / 2, 1.0], DIK, 'drempel overkant');
  for (const k of [-0.8, 0.8]) b.haring([XH + LD - 0.16, 0, k], [1, 0, 0]);
  void ver;
  b.beweeg('dek');
  for (const l of liggers) b.sjor('scharnier', [l, drempel], { vorm: 'diagonaal', naam: 'ligger op de drempel' });
  b.stap('Galg', 'Zet achter de drempel de galg: twee dikke staanders van 5 m, ingegraven, met een bovenregel op 4,6 m (kruissjorringen) en aan de achterkant een kruis van schoren.');
  const xs = XH - (DIK / 2 + MIDDEL / 2 + 0.003);
  const st = [-1, 1].map((k) => b.paal([xs, 0, k * 1.0], [xs, 5, k * 1.0], DIK, 'staander (ingegraven)'));
  const yr = 4.6;
  const regel = b.paal([XH, yr, -1.3], [XH, yr, 1.3], MIDDEL, 'bovenregel');
  for (const s of st) b.sjor('kruis', [s, regel], { naam: 'bovenregel aan staander' });
  const sch = [0, 1].map((k) => {
    const x = xs - (DIK / 2 + DUN / 2 + 0.003 + k * DUN);
    return door(b, [x, 2.3, (k ? 1 : -1)], [x, 4.1, (k ? -1 : 1)], 3, DUN, 'kruisschoor');
  });
  b.sjor('diagonaal', [st[0], sch[0]], { naam: 'schoor aan staander' }); b.sjor('diagonaal', [st[1], sch[0]], { naam: 'schoor aan staander' });
  b.sjor('diagonaal', [st[1], sch[1]], { naam: 'schoor aan staander' }); b.sjor('diagonaal', [st[0], sch[1]], { naam: 'schoor aan staander' });
  b.sjor('diagonaal', sch, { naam: 'waar de schoren kruisen' });
  b.stap('Tuien', 'Zet de galg vast met vier tuien: twee schuin naar voren, twee naar achteren.');
  st.forEach((s, i) => {
    const k = i ? 1 : -1; const top = [xs, 4.85, k];
    b.sjor('mastworp', [s], { p: top, naam: 'tuien aan de staander' });
    b.lijn([top, b.haring([XH + 0.2, 0, k * 3.4], [0.3, 0, k])], 'tui');
    b.lijn([top, b.haring([XH - 3.6, 0, k * 1.8], [-1, 0, k * 0.4])], 'tui');
  });
  b.stap('Wipbalk', 'Leg een wipbalk van 6 m over de bovenregel, met 4 m naar voren boven het dek en 2 m naar achteren. Bind hem met een losse strop aan de regel, zodat hij kan kantelen.');
  b.beweeg('balans');
  const yw = yr + MIDDEL + 0.003;
  const wip = b.paal([XH - 2.0, yw, 0], [XH + LD - 0.15, yw, 0], MIDDEL, 'wipbalk');
  b.sjor('scharnier', [wip, regel], { vorm: 'diagonaal', naam: 'wipbalk op de bovenregel' });
  b.stap('Gewicht', 'Bind aan het achtereind een contragewicht: een bundel houtblokken of zandzakken. Maak het wat lichter dan het dek, dan zakt de brug vanzelf rustig dicht. Maak er een trektouw aan vast en beleg dat aan een haring.');
  b.beweeg('balans');
  const xg = XH - 1.72;
  b.sjor('mastworp', [wip], { p: [xg, yw, 0], naam: 'contragewicht aan de wipbalk' });
  for (const [dz, dy] of [[-0.1, 0], [0.1, 0], [0, -0.16]]) b.ding('stam', { p: [xg, yw - MIDDEL / 2 - 0.09 + dy, dz], r: 0.09, lang: 0.5 });
  b.beweeg(null);
  const hk = b.haring([XH - 2.7, 0, 0.25], [-1, 0, 0]);
  b.lijn([[XH - 1.95, yw - MIDDEL / 2, 0], [XH - 2.3, 1.0, 0.15], hk], 'trektouw', { dik: 0.007, naam: 'trektouw', volgt: ['balans', null, null] });
  b.stap('Touwen', 'Hang aan de voorkant van de wipbalk twee touwen naar de uiteinden van de liggers. Trek je de achterkant omlaag, dan gaat de brug omhoog.');
  b.beweeg('balans');
  const voor = [XH + LD - 0.3, yw, 0];
  b.sjor('mastworp', [wip], { p: voor, naam: 'touwen aan de wipbalk' });
  b.beweeg('dek');
  for (const [i, k] of [[0, -1], [1, 1]]) {
    const eind = [XH + LD - 0.3, yl, k * ZL];
    b.sjor('mastworp', [liggers[i]], { p: eind, naam: 'touw aan de ligger' });
    b.beweeg(null);
    b.lijn([[voor[0], yw - MIDDEL / 2, 0], [eind[0], yl + MIDDEL / 2, k * ZL]], 'ophangtouw', { dik: 0.007, naam: 'touw van wipbalk naar dek', volgt: ['balans', 'dek'] });
    b.beweeg('dek');
  }
  b.beweeg(null);
  return {
    naam: 'Ophaalbrug', ...m, grond: 'gras', kader: 'alles', zicht: { theta: 0.9, phi: 1.15 },
    extra: ['een contragewicht: houtblokken of zandzakken', '1 trektouw', '2 touwen van wipbalk naar dek'],
    beweging: {
      label: 'Trek de brug op', vanaf: 8, start: 0,
      delen: {
        dek: { punt: [XH, DIK / 2, 0], as: [0, 0, 1], hoek: [0, OPEN] },
        balans: { punt: [XH, yr, 0], as: [0, 0, 1], hoek: [0, OPEN] },
      },
      waarde: (t) => (t < 0.03 ? 'de brug ligt' : `de brug staat ${Math.round(t * OPEN)} graden open`),
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Zweefmolen: a fixed mast with tuien, a square raam of palen hung from a strop that turns round the top

function zweefmolen() {
  const b = bouwer(); const { m } = b;
  const H = 6; const yR = 0.8;
  b.stap('Mast', 'Graaf een dikke paal van 6 m een halve meter in. Dat is de mast; die draait zelf niet.');
  const mast = b.paal([0, 0, 0], [0, H, 0], DIK, 'mast (ingegraven)');
  b.stap('Tuien', 'Zet vlak onder de top vier tuien met een mastworp vast en span ze naar haringen, zo ver van de mast als hij hoog is.');
  const top = [0, H - 0.15, 0];
  b.sjor('mastworp', [mast], { p: top, naam: 'tuien aan de top' });
  for (const g of [45, 135, 225, 315]) {
    const r = [Math.cos(g * RAD), 0, Math.sin(g * RAD)];
    b.lijn([top, b.haring(keer(r, 5.6), r)], 'tui');
  }
  b.stap('Raam', 'Maak rond de mast een raam: twee lange zitpalen van 5,5 m aan weerszijden van de mast, en twee korte dwarspalen ertussen, met een klein beetje speling om de mast (kruissjorringen). Je bouwt het op de grond.');
  b.beweeg('molen');
  const zz = DIK / 2 + MIDDEL / 2 + 0.02;
  const zit = [-1, 1].map((k) => b.paal([-2.75, yR, k * zz], [2.75, yR, k * zz], MIDDEL, 'zitpaal'));
  for (const s of [-1, 1]) {
    const x = s * (DIK / 2 + DUN / 2 + 0.04);
    const dw = b.paal([x, yR + MIDDEL / 2 + DUN / 2 + 0.003, -0.42], [x, yR + MIDDEL / 2 + DUN / 2 + 0.003, 0.42], DUN, 'dwarspaal');
    for (const z of zit) b.sjor('kruis', [z, dw], { naam: 'dwarspaal op zitpaal' });
  }
  b.stap('Ophangen', 'Leg om de mast een kraag van strakke slagen touw, en daarboven een losse strop die om de mast kan draaien. Hang het raam met vier touwen aan die strop, zo’n 80 cm boven de grond.');
  b.sjor('mastworp', [mast], { p: [0, H - 0.62, 0], naam: 'kraag onder de draaistrop' });
  b.beweeg('molen');
  const ys = H - 0.5;
  b.sjor('scharnier', [mast], { vorm: 'mastworp', p: [0, ys, 0], naam: 'draaistrop om de mast' });
  for (const sx of [-1, 1]) for (const k of [-1, 1]) {
    const onder = [sx * 2.3, yR + MIDDEL / 2, k * zz];
    b.sjor('mastworp', [zit[k < 0 ? 0 : 1]], { p: onder, naam: 'ophangtouw aan de zitpaal' });
    b.lijn([[sx * 0.07, ys, k * 0.04], onder], 'ophangtouw', { dik: 0.007, naam: 'ophangtouw' });
  }
  b.stap('Zitjes', 'Maak bij elk eind een zitje op de zitpaal. Wie erop zit, draagt een gordel die aan de paal vastzit.');
  b.beweeg('molen');
  for (const x of [-2.45, 2.45]) for (const z of zit) b.ding('plank', { p: [x, yR + MIDDEL / 2 + 0.02, P(m, z).a[2]], lang: 0.4, breed: 0.28, dik: 0.035 });
  b.stap('Afzetten', 'Zet een lint rond de molen, ruim buiten de zitjes. Binnen het lint komt niemand als de molen draait; alleen de leiding duwt, in wandeltempo.');
  const n = 10; const rl = 4.2; const pts = [];
  for (let i = 0; i <= n; i++) {
    const g = (i / n) * 360 + 18; const q = [Math.cos(g * RAD) * rl, 0, Math.sin(g * RAD) * rl];
    if (i < n) b.paal(q, plus(q, [0, 1.0, 0]), 0.05, 'paaltje voor het lint');
    pts.push(plus(q, [0, 0.9, 0]));
  }
  b.lijn(pts, 'lint', { dik: 0.008, naam: 'afzetlint' });
  return {
    naam: 'Zweefmolen', ...m, grond: 'gras', zicht: { theta: 0.6, phi: 1.12 },
    extra: ['4 ophangtouwen', '4 zitjes en gordels', 'afzetlint'],
    beweging: {
      label: 'Draai de molen', vanaf: 4, start: 0,
      delen: { molen: { punt: [0, 0, 0], as: [0, 1, 0], hoek: [0, 360] } },
      waarde: (t) => `${Math.round(t * 360)} graden gedraaid`,
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Draaibrug: one mast with tuien; a ladder deck turns round its foot and hangs from its top

function draaibrug() {
  const b = bouwer(); const { m } = b;
  const H = 6; const LD = 5;
  b.ding('water', { x0: 1.0, x1: 4.2 });
  b.stap('Mast', 'Graaf op de oever een dikke paal van 6 m een halve meter in, met een katrol of ring in de top.');
  const mast = b.paal([0, 0, 0], [0, H, 0], DIK, 'mast (ingegraven)');
  b.ding('katrol', { p: [0.1, H - 0.1, 0] });
  b.stap('Tuien', 'Zet drie tuien met een mastworp vast vlak onder de top, naar haringen aan de kant van het land. Waar de brug draait, komt geen tui.');
  const top = [0, H - 0.3, 0];
  b.sjor('mastworp', [mast], { p: top, naam: 'tuien aan de top' });
  for (const g of [135, 225, 315]) {
    const r = [Math.cos(g * RAD), 0, Math.sin(g * RAD)];
    b.lijn([top, b.haring(keer(r, 5.2), r)], 'tui');
  }
  b.stap('Dek', 'Maak het dek: twee liggers van 5 m met dwarsliggers van 1,5 m erop, om de 35 cm. Je bouwt het op de oever.');
  b.beweeg('dek');
  const yl = DIK + MIDDEL / 2; const ZL = 0.55;
  const liggers = [-1, 1].map((k) => b.paal([0, yl, k * ZL], [LD, yl, k * ZL], MIDDEL, 'ligger'));
  const ys = yl + MIDDEL / 2 + DUN / 2;
  const sporten = [b.paal([DIK / 2 + DUN / 2 + 0.003, ys, -0.75], [DIK / 2 + DUN / 2 + 0.003, ys, 0.75], DUN, 'dwarsligger')];
  for (let x = 0.45; x < LD - 0.1; x += 0.35) sporten.push(b.paal([x, ys, -0.75], [x, ys, 0.75], DUN, 'dwarsligger'));
  b.stap('Sjorringen', 'Sjor elke dwarsligger met kruissjorringen aan de liggers.');
  b.beweeg('dek');
  for (const sp of sporten) for (const l of liggers) b.sjor('kruis', [l, sp], { naam: 'dwarsligger aan ligger' });
  b.stap('Strop', 'Leg het dek met de eerste dwarsligger tegen de voet van de mast, en bind die met een losse strop om de mast: hier draait de brug om.');
  b.beweeg('dek');
  b.sjor('scharnier', [mast, sporten[0]], { vorm: 'diagonaal', naam: 'dek aan de voet van de mast' });
  b.stap('Ophangen', 'Hang het andere eind met twee touwen aan de top, over de katrol of door de ring. Trek het zo strak dat het dek vrij van de grond kan draaien.');
  b.beweeg('dek');
  for (const [i, k] of [[0, -1], [1, 1]]) {
    const eind = [LD - 0.25, yl, k * ZL];
    b.sjor('mastworp', [liggers[i]], { p: eind, naam: 'ophangtouw aan de ligger' });
    b.lijn([[0, H - 0.12, 0], plus(eind, [0, MIDDEL / 2, 0])], 'ophangtouw', { dik: 0.007, naam: 'ophangtouw' });
  }
  b.stap('Draaien', 'Draai de brug met twee stuurtouwen vanaf de oever over het water, tot hij op de overkant ligt. Pas dan gaat er iemand op, één tegelijk.');
  for (const k of [-1, 1]) {
    b.lijn([[LD - 0.1, yl, k * (ZL + 0.06)], [-0.6, 0.95, k * 3.2], [-0.9, 0.03, k * 3.5]], 'trektouw', { dik: 0.006, naam: 'stuurtouw', volgt: ['dek', null, null] });
  }
  return {
    naam: 'Draaibrug', ...m, grond: 'gras', kader: 'alles', zicht: { theta: 0.7, phi: 1.1 },
    extra: ['1 katrol of ring', '2 ophangtouwen', '2 stuurtouwen'],
    beweging: {
      label: 'Draai de brug over het water', vanaf: 7, start: 0,
      delen: { dek: { punt: [0, 0, 0], as: [0, 1, 0], hoek: [-90, 0] } },
      waarde: (t) => (t > 0.97 ? 'de brug ligt over het water' : t < 0.03 ? 'de brug ligt langs de oever' : `${Math.round(t * 90)} graden gedraaid`),
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Gepionierde hudo: a zitbalk and a rugleuning on two X's of palen over the kuil, zeilen round it

function hudo() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL; const ZV = 0.62;
  b.stap('Kuil', 'Graaf de kuil op een plek die de leiding heeft gekozen: ver van water en keuken. Leg de uitgegraven grond ernaast, om de kuil later weer dicht te gooien.');
  b.ding('kuil', { p: [-0.08, 0, 0], lang: 0.6, breed: 0.45, hoop: [-1.1, 0.08, 0.95] });
  b.stap('Palen', 'Zet aan elke kant twee schuine palen die elkaar kruisen: een voorpaal van 2,5 m die naar achteren helt, en een achterpaal van 2 m die naar voren helt. Diagonaalsjorring waar ze kruisen.');
  const zijden = [-1, 1].map((k) => {
    const voor = b.paalL([0.55, 0, k * ZV], [-1.1, 1.9, 0], 2.5, d, 'voorpaal');
    const achter = b.paalL([-0.6, 0, k * (ZV - d - 0.003)], [0.5, 1.9, 0], 2.0, d, 'achterpaal');
    b.sjor('diagonaal', [voor, achter], { naam: 'waar de palen kruisen' });
    return { voor, achter };
  });
  b.stap('Zitbalk', 'Sjor op zo’n 45 cm hoogte een dikke zitbalk van 1,5 m over de twee voorpalen, met kruissjorringen. Je zit erop met je achterste boven de kuil.');
  const pv = P(m, zijden[0].voor);
  const cz = tegen(pv, opHoogte(pv, 0.45), [0, 0, 1], DIK / 2, [0.6, 1, 0]);
  const zitbalk = b.paal([cz[0], cz[1], -0.75], [cz[0], cz[1], 0.75], DIK, 'zitbalk');
  for (const z of zijden) b.sjor('kruis', [z.voor, zitbalk], { naam: 'zitbalk aan voorpaal' });
  b.stap('Leuning', 'Sjor op ongeveer 1 m een rugleuning van 1,5 m aan de voorkant van de achterpalen.');
  const pa = P(m, zijden[0].achter);
  const cl = tegen(pa, opHoogte(pa, 1.0), [0, 0, 1], d / 2, [1, 0, 0]);
  const leuning = b.paal([cl[0], cl[1], -0.75], [cl[0], cl[1], 0.75], d, 'rugleuning');
  for (const z of zijden) b.sjor('kruis', [z.achter, leuning], { naam: 'rugleuning aan achterpaal' });
  b.stap('Zeilen', 'Zet er vier paaltjes omheen en span aan drie kanten een zeil, met de open kant van het kamp af. Hang een schepje en wc-papier binnen handbereik.');
  const hoek = [[0.85, -1.0], [0.85, 1.0], [-1.0, 1.0], [-1.0, -1.0]];
  for (const [x, z] of hoek) b.paal([x, 0, z], [x, 1.7, z], DUN, 'paaltje');
  // a standing zeil: its normal lies flat, at right angles to the side
  const zeil = (a, c) => b.ding('zeil', { punten: [[a[0], 1.6, a[1]], [c[0], 1.6, c[1]], [c[0], 0.08, c[1]], [a[0], 0.08, a[1]]], normaal: eenheid([c[1] - a[1], 0.3, a[0] - c[0]]) });
  zeil(hoek[0], hoek[3]); zeil(hoek[3], hoek[2]); zeil(hoek[2], hoek[1]);
  return { naam: 'Hudo', ...m, grond: 'gras', zicht: { theta: 1.35, phi: 1.12 }, extra: ['3 zeilen of een groot zeil', 'een schep en wc-papier'] };
}

// ---------------------------------------------------------------------------------------------------------------
// Lopende bok (A-frame lopen): a bok with a dwarsbalk to stand on, walked along by four stuurtouwen

function lopendeBok() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL;
  b.stap('Palen', 'Leg twee palen van 3 m naast elkaar.', { tot: 3, kopie: true });
  const lig = liggend(b, [-1.5, 0, 0], [1, 0, 0], 3, d, 2, 0.04);
  b.stap('Vork', 'Leg een vorksjorring zo’n 40 cm onder de toppen.', { tot: 3, kopie: true });
  b.sjor('vork', lig, { p: [1.1, 0, 0], naam: 'liggend' });
  b.stap('Bok', 'Zet de poten uit elkaar en sjor ongeveer 50 cm boven de voeten een dwarsbalk van 2 m: twee kruissjorringen. Daar komt straks iemand op te staan.');
  const vorm = bokVorm([0, 0, 0], [1, 0, 0], 0.9, 2.45, 3, d);
  b.beweeg('bok');
  const poten = vorm.poten.map((p) => b.paal(p.a, p.b, d, 'poot'));
  b.sjor('vork', poten, { p: vorm.C, naam: 'de kop van de bok' });
  const c = plus([0, 0.5, 0], keer(vorm.diep, d / 2 + d / 2 + 0.005));
  const balk = b.paal(plus(c, [-1, 0, 0]), plus(c, [1, 0, 0]), d, 'dwarsbalk');
  for (const p of poten) b.sjor('kruis', [p, balk], { naam: 'dwarsbalk aan poot' });
  b.stap('Touwen', 'Zet vier lange touwen met een mastworp vast aan de kop. Zet de bok rechtop: vier scouts houden elk een touw, twee aan elke kant, en houden ze strak.');
  const top = plus(vorm.C, [0, 0.16, 0]);
  b.beweeg('bok');
  b.sjor('mastworp', [poten[1]], { p: top, naam: 'stuurtouwen aan de kop' });
  b.beweeg(null);
  for (const x of [-1.7, 1.7]) for (const z of [-3.0, 3.0]) {
    const hand = [x, 1.0, z];
    b.lijn([top, hand], 'stuurtouw', { dik: 0.007, naam: 'stuurtouw', volgt: ['bok', null] });
    b.ding('knoop', { p: hand });
  }
  b.stap('Lopen', 'Eén scout gaat op de dwarsbalk staan. Trekken de twee aan de ene kant, dan komt de poot aan de andere kant los en kan hij een stap naar voren zetten. Dan de andere kant. Rustig, stap voor stap.');
  const voet = (i) => P(m, poten[i]).a;
  return {
    naam: 'Lopende bok', ...m, grond: 'gras', kader: 'alles', zicht: { theta: 0.25, phi: 1.2 },
    extra: ['4 lange touwen als stuurtouw'],
    beweging: {
      label: 'Trek aan de touwen links of rechts', vanaf: 4, start: 0.5,
      delen: { bok: { punt: [voet(1), voet(0)], as: [0, 0, 1], hoek: [-7, 7] } },
      waarde: (t) => (Math.abs(t - 0.5) < 0.04 ? 'beide poten op de grond' : t < 0.5 ? 'de linkerpoot komt los' : 'de rechterpoot komt los'),
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Brancard: two draagpalen, two spreiders, a ligvlak of rope

function brancard() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL; const Z = 0.3;
  b.stap('Palen', 'Leg twee lange draagpalen van 2,5 m naast elkaar, ongeveer op schouderbreedte.');
  const yP = DUN + d / 2;
  const palen = [-1, 1].map((k) => b.paal([-1.25, yP, k * Z], [1.25, yP, k * Z], d, 'draagpaal'));
  b.stap('Spreiders', 'Sjor aan het hoofd- en voeteneind een korte dwarspaal onder de draagpalen, met kruissjorringen. Zo blijven ze uit elkaar als je tilt.');
  for (const x of [-0.9, 0.9]) {
    const sp = b.paal([x, DUN / 2, -0.45], [x, DUN / 2, 0.45], DUN, 'spreider');
    for (const p of palen) b.sjor('kruis', [p, sp], { naam: 'spreider aan draagpaal' });
  }
  b.stap('Ligvlak', 'Maak een touw vast met een mastworp en haal het steeds om en om rond de twee palen, dicht naast elkaar. Trek het goed strak en eindig weer met een mastworp. Test de brancard met rugzakken voor er iemand op gaat liggen.');
  const yt = yP + d / 2 + 0.006; const pts = [];
  for (let i = 0; i <= 22; i++) { const x = -0.75 + i * (1.5 / 22); pts.push([x, yt, (i % 2 ? 1 : -1) * Z]); }
  b.sjor('mastworp', [palen[0]], { p: [-0.79, yP, -Z], naam: 'begin van het ligvlak' });
  b.sjor('mastworp', [palen[0]], { p: [0.79, yP, -Z], naam: 'eind van het ligvlak' });
  b.lijn(pts, 'ligvlak', { dik: 0.006, naam: 'ligvlak' });
  return { naam: 'Brancard', ...m, grond: 'gras', zicht: { theta: 0.5, phi: 0.9 }, extra: ['±25 m touw voor het ligvlak', 'een deken of slaapmat erop'] };
}

// ---------------------------------------------------------------------------------------------------------------
// Vikingschip: four frames, a middendeel with the mast holders, two pointed stevens, the mast with a ra

function vikingschip() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL; const XM = 1.7; const ZS = 0.75; const yOnder = 0.16;
  /** A frame in the plane x = xf: bottom and top along z, the sides on the side s, the X on the side s too. */
  function frame(xf, s) {
    const onder = b.paal([xf, yOnder, -0.9], [xf, yOnder, 0.9], d, 'frame: onderkant');
    const xz = xf + s * (d + 0.003);
    const zij = [-1, 1].map((k) => b.paal([xz, 0, k * ZS], [xz, 1.8, k * ZS], d, 'frame: zijkant'));
    const boven = b.paal([xf, 1.6, -1.5], [xf, 1.6, 1.5], d, 'frame: bovenkant');
    for (const z of zij) { b.sjor('kruis', [z, onder], { naam: 'hoek van het frame' }); b.sjor('kruis', [z, boven], { naam: 'hoek van het frame' }); }
    const xs = (k) => xz + s * (d / 2 + DUN / 2 + 0.003 + k * DUN);
    const sch = [0, 1].map((k) => door(b, [xs(k), 0.3, (k ? 1 : -1) * ZS], [xs(k), 1.4, (k ? -1 : 1) * ZS], 2.4, DUN, 'frame: schoor'));
    for (const z of zij) for (const x of sch) b.sjor('diagonaal', [z, x], { naam: 'schoor in het frame' });
    b.sjor('diagonaal', sch, { naam: 'waar de schoren kruisen' });
    return { onder, zij, boven, xz };
  }
  b.stap('Frames', 'Drie ploegen bouwen vier gelijke frames: een onderkant en twee zijkanten van 1,8 m, een bovenkant van 3 m, en een kruis van twee palen van 2,4 m. Sjor ze liggend en zet ze daarna rechtop.');
  const fA = frame(-XM, 1); const fB = frame(XM, -1);
  const gap = d + 0.003;
  const fV = frame(-XM - gap, -1); const fT = frame(XM + gap, 1);
  b.stap('Middendeel', 'Verbind de twee middelste frames met vier palen van 3,6 m: twee over de onderkant en één langs elke zijkant. Sjor midden onderin een paal van 1,2 m en recht erboven een paal van 3 m: daar komt de mast tussen.');
  const yo = yOnder + d + 0.003;
  const bodem = [-1, 1].map((k) => {
    const p = b.paal([-1.8, yo, k * 0.45], [1.8, yo, k * 0.45], d, 'langsligger');
    for (const f of [fA, fB]) b.sjor('kruis', [f.onder, p], { naam: 'langsligger op het frame' });
    return p;
  });
  const flank = [-1, 1].map((k) => {
    const p = b.paal([-1.8, 1.35, k * (ZS + d + 0.003)], [1.8, 1.35, k * (ZS + d + 0.003)], d, 'langsligger');
    for (const f of [fA, fB]) b.sjor('kruis', [f.zij[k < 0 ? 0 : 1], p], { naam: 'langsligger aan het frame' });
    return p;
  });
  const laag = b.paal([0, yo + d + 0.003, -0.6], [0, yo + d + 0.003, 0.6], d, 'masthouder (laag)');
  for (const p of bodem) b.sjor('kruis', [p, laag], { naam: 'masthouder op de langsligger' });
  const hoog = b.paal([0, 1.35 + d + 0.003, -1.5], [0, 1.35 + d + 0.003, 1.5], d, 'masthouder (hoog)');
  for (const p of flank) b.sjor('kruis', [p, hoog], { naam: 'masthouder op de langsligger' });
  b.stap('Stevens', 'Maak de voor- en achtersteven: zet een rechte paal van 3 m op de punt en sjor vanaf elke hoek van het frame een paal van 3 m naar die paal. Een schuine paal van 1,8 m aan elke kant laat de steven omhoog lopen.');
  for (const [f, e] of [[fV, -1], [fT, 1]]) {
    const xu = f.xz + e * 2.45;
    const recht = b.paal([xu, 0, 0], [xu, 3.0, 0], d, 'stevenpaal');
    for (const k of [-1, 1]) {
      const zi = f.zij[k < 0 ? 0 : 1];
      const hoekPaal = (h0, h1) => {
        const a = [f.xz, h0, k * (ZS + d + 0.003)]; const c = [xu, h1, k * (d + 0.003)];
        const r = eenheid(min(c, a));
        const p = b.paal(plus(a, keer(r, -0.12)), plus(a, keer(r, 3.0 - 0.12)), d, 'stevenpaal schuin');
        b.sjor('kruis', [zi, p], { naam: 'stevenpaal aan het frame' }); b.sjor('kruis', [recht, p], { naam: 'stevenpaal aan de punt' });
        return { p, a, c };
      };
      const lo = hoekPaal(0.25, 1.15); const hi = hoekPaal(1.55, 2.55);
      // the slanting 1,8 m paal: from the low one near the frame up to the high one near the point
      const q1 = plus(lo.a, keer(min(lo.c, lo.a), 0.36)); const q2 = plus(hi.a, keer(min(hi.c, hi.a), 0.55));
      let n = eenheid(kruis(eenheid(min(lo.c, lo.a)), min(q2, q1))); if (n[2] * k < 0) n = keer(n, -1);
      const off = keer(n, d / 2 + DUN / 2 + 0.003);
      const sch = door(b, plus(q1, off), plus(q2, off), 1.8, DUN, 'schuine paal');
      b.sjor('diagonaal', [lo.p, sch], { naam: 'schuine paal in de steven' }); b.sjor('diagonaal', [hi.p, sch], { naam: 'schuine paal in de steven' });
    }
  }
  b.stap('Samenvoegen', 'Zet de drie delen tegen elkaar en bind de frames die tegen elkaar staan boven- en onderaan vast. Kijk of het schip recht staat.');
  for (const [f1, f2] of [[fA, fV], [fB, fT]]) {
    b.sjor('rond', [f1.onder, f2.onder], { vorm: 'steiger', p: [mid(P(m, f1.onder).a, P(m, f2.onder).a)[0], yOnder, 0], naam: 'frames aan elkaar (onder)' });
    b.sjor('rond', [f1.boven, f2.boven], { vorm: 'steiger', p: [mid(P(m, f1.boven).a, P(m, f2.boven).a)[0], 1.6, 0], naam: 'frames aan elkaar (boven)' });
  }
  const xm = d / 2 + DIK / 2 + 0.003;
  b.stap('Mast', 'Sjor op de grond de ra van 3,6 m aan de mast van minstens 5 m.', { tot: 6, kopie: true });
  const mastLig = b.paal([-3.2, DIK / 2, 3.0], [1.8, DIK / 2, 3.0], DIK, 'mast');
  const raLig = b.paal([1.25, DIK + d / 2 + 0.003, 1.2], [1.25, DIK + d / 2 + 0.003, 4.8], d, 'ra');
  b.sjor('kruis', [mastLig, raLig], { naam: 'ra aan de mast' });
  b.stap('Rechtop', 'Spreek één tilcommando af en zet de mast met z’n allen rechtop, tussen de twee masthouders. Sjor hem aan beide vast. Daarna klimt, zit of speelt er niemand op of in het schip.');
  const mast = b.paal([xm, 0, 0], [xm, 5, 0], DIK, 'mast');
  b.sjor('kruis', [laag, mast], { naam: 'mast aan de masthouder' }); b.sjor('kruis', [hoog, mast], { naam: 'mast aan de masthouder' });
  const ra = b.paal([xm + DIK / 2 + d / 2 + 0.003, 4.45, -1.8], [xm + DIK / 2 + d / 2 + 0.003, 4.45, 1.8], d, 'ra');
  b.sjor('kruis', [mast, ra], { naam: 'ra aan de mast' });
  return { naam: 'Vikingschip', ...m, grond: 'gras', zicht: { theta: 0.75, phi: 1.12 }, extra: ['afzetlint voor de bouwplaats'] };
}

// ---------------------------------------------------------------------------------------------------------------
// Bouwen zonder touw: a Leonardobrug. Each long pole lies on two dwarsbalken with its ends and under one with its middle

function zonderTouw() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL; const n = 4; const D = 1.25; const s = d;
  b.ding('water', { x0: -1.0, x1: 1.0 });
  const c = (k) => d / 2 + 2 * s * k * (n - k);
  const x = (k) => (k - n / 2) * D;
  const dwars = (k) => b.paal([x(k), c(k), -1.0], [x(k), c(k), 1.0], d, 'dwarsbalk');
  const lang = (k) => {
    // from dwarsbalk k−1 (on top) under dwarsbalk k (in the middle) to dwarsbalk k+1 (on top)
    const a = [x(k - 1), c(k - 1) + s, 0]; const e = [x(k + 1), c(k + 1) + s, 0];
    const z = k % 2 ? 0.42 : 0.72; const r = eenheid(min(e, a)); const l = lengte(min(e, a));
    for (const zz of [-z, z]) b.paal(plus([a[0], a[1], zz], keer(r, -(3 - l) / 2)), plus([e[0], e[1], zz], keer(r, (3 - l) / 2)), d, 'langspaal');
  };
  b.stap('Begin', 'Leg op de oever een dwarsbalk. Leg twee lange palen met hun eind erop, schuif er halverwege een tweede dwarsbalk overheen en aan het eind een derde eronder.');
  dwars(0); lang(1); dwars(1); dwars(2);
  b.stap('Verder', 'Leg het volgende paar lange palen: met hun eind op de tweede dwarsbalk, onder de derde door, en zo verder. Elke paal ligt met zijn uiteinden op een dwarsbalk en met zijn midden eronder.');
  lang(2); dwars(3);
  b.stap('Overkant', 'Het laatste paar komt op de overkant uit. Hoe zwaarder je erop drukt, hoe vaster alles klemt: wrijving en gewicht houden de brug bij elkaar.');
  lang(3); dwars(4);
  b.stap('Testen', 'Leg er eerst iets zwaars op, zoals een zak zand, en kijk of er iets schuift. Pas dan gaat er iemand over, één tegelijk en heel rustig.');
  return { naam: 'Leonardobrug', ...m, grond: 'gras', zicht: { theta: 0.5, phi: 1.15 }, extra: ['geen touw!'] };
}

export default {
  katapult, reuzenkatapult, wip, hangbrug, zandlopertoren, ophaalbrug, zweefmolen, draaibrug, hudo,
  'lopende-bok': lopendeBok, brancard, vikingschip, 'zonder-touw': zonderTouw,
};
