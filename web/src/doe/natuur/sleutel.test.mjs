// Run in web/: node src/doe/natuur/sleutel.test.mjs
// Walks the boomsleutel for each of the trees, answering every question from the tree's own traits (written down
// here independently of the key), and checks that exactly one answer fits at every step and that the walk ends at
// that tree. Also checks: every node reachable, every tree reached exactly once, every boom/icoon id exists.
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('./sleutel.js', import.meta.url), 'utf8');
const m = src.match(/const SLEUTEL = (\{[\s\S]*?\n\});/);
const SLEUTEL = eval(`(${m[1]})`);
const { BLAD } = await import('../../data/bladen/index.js');

// Traits (from the blad texts and general botany).
const T = {
  lariks: { naald: 'bosje', zacht: true },
  'grove-den': { naald: 'twee' },
  fijnspar: { naald: 'los', zacht: false, kegels: true },
  douglasspar: { naald: 'los', zacht: true, kegels: true },
  taxus: { naald: 'los', zacht: true, kegels: false },
  paardenkastanje: { samen: 'hand', stand: 'tegenover' },
  'gewone-es': { samen: 'geveerd', stand: 'tegenover', zwarteKnop: true },
  lijsterbes: { samen: 'geveerd', stand: 'om', oranjeBes: true },
  robinia: { samen: 'geveerd', stand: 'om', doorns: true, peul: true },
  'gewone-vlier': { samen: 'geveerd', stand: 'tegenover', witMerg: true },
  plataan: { vorm: 'handlobben', stand: 'om', schorsBladdert: true },
  'gewone-esdoorn': { vorm: 'handlobben', stand: 'tegenover', melksap: false },
  'noorse-esdoorn': { vorm: 'handlobben', stand: 'tegenover', melksap: true },
  'amerikaanse-eik': { vorm: 'gelobd', lobpunt: 'spits', stand: 'om' },
  zomereik: { vorm: 'gelobd', lobpunt: 'rond', bladsteel: false, stand: 'om' },
  wintereik: { vorm: 'gelobd', lobpunt: 'rond', bladsteel: true, stand: 'om' },
  meidoorn: { vorm: 'gelobd', lobpunt: 'getand', doorns: true, stand: 'om' },
  hulst: { vorm: 'stekelig', stand: 'om' },
  'tamme-kastanje': { vorm: 'lang', rand: 'grove tanden', stand: 'om' },
  schietwilg: { vorm: 'lang', rand: 'fijn gezaagd', stand: 'om' },
  'ruwe-berk': { vorm: 'driehoek', stamWit: true, twijgBehaard: false, stand: 'om' },
  'zachte-berk': { vorm: 'driehoek', stamWit: true, twijgBehaard: true, stand: 'om' },
  populier: { vorm: 'driehoek', stamWit: false, stand: 'om' },
  linde: { vorm: 'hart', stand: 'om' },
  'zwarte-els': { vorm: 'rond', elzenproppen: true, top: 'plat', stand: 'om' },
  'grauwe-els': { vorm: 'eirond', elzenproppen: true, top: 'spits', onderGrijs: true, stand: 'om' },
  beuk: { vorm: 'ovaal', rand: 'gaaf', stand: 'om' },
  haagbeuk: { vorm: 'ovaal', rand: 'dubbel gezaagd', voetScheef: false, stand: 'om' },
  iep: { vorm: 'ovaal', rand: 'dubbel gezaagd', voetScheef: true, stand: 'om' },
};
const naald = (t) => 'naald' in t;
// One predicate per option, in the order of the key.
const P = {
  start: [naald, (t) => !naald(t)],
  naald: [(t) => t.naald === 'bosje', (t) => t.naald === 'twee', (t) => t.naald === 'los'],
  los: [(t) => !t.zacht, (t) => t.zacht],
  zacht: [(t) => t.kegels, (t) => !t.kegels],
  loof: [(t) => !t.samen, (t) => !!t.samen],
  samengesteld: [(t) => t.samen === 'hand', (t) => t.samen === 'geveerd'],
  geveerd: [(t) => !!t.zwarteKnop, (t) => !!t.oranjeBes && t.stand === 'om', (t) => !!t.peul && t.stand === 'om', (t) => !!t.witMerg],
  enkel: [(t) => t.vorm === 'handlobben', (t) => t.vorm === 'gelobd', (t) => t.vorm === 'stekelig', (t) => t.vorm === 'lang',
    (t) => ['driehoek', 'hart', 'rond', 'eirond', 'ovaal'].includes(t.vorm)],
  hand: [(t) => t.stand === 'om' && t.schorsBladdert, (t) => t.stand === 'tegenover'],
  esdoorn: [(t) => t.melksap, (t) => !t.melksap],
  eik: [(t) => t.lobpunt === 'spits', (t) => t.lobpunt === 'rond', (t) => t.lobpunt === 'getand' && t.doorns],
  eik2: [(t) => !t.bladsteel, (t) => t.bladsteel],
  lang: [(t) => t.rand === 'grove tanden', (t) => t.rand === 'fijn gezaagd'],
  gewoon: [(t) => t.vorm === 'driehoek', (t) => t.vorm === 'hart', (t) => !!t.elzenproppen, (t) => t.vorm === 'ovaal' && !t.elzenproppen],
  els: [(t) => t.top === 'plat', (t) => t.top === 'spits' && t.onderGrijs],
  driehoek: [(t) => t.stamWit, (t) => !t.stamWit],
  berk: [(t) => !t.twijgBehaard, (t) => t.twijgBehaard],
  ovaal: [(t) => t.rand === 'gaaf', (t) => t.rand === 'dubbel gezaagd' && !t.voetScheef, (t) => t.rand === 'dubbel gezaagd' && t.voetScheef],
};

let fouten = 0;
const fout = (s) => { fouten += 1; console.log('FOUT', s); };
for (const [node, v] of Object.entries(SLEUTEL)) {
  if (!P[node]) fout(`no predicates for node ${node}`);
  else if (P[node].length !== v.opties.length) fout(`node ${node}: ${v.opties.length} options, ${P[node].length} predicates`);
  for (const o of v.opties) {
    if (o.naar && !SLEUTEL[o.naar]) fout(`${node}: naar ${o.naar} missing`);
    if (o.boom && !BLAD[o.boom]) fout(`${node}: boom ${o.boom} is not a blad`);
    if (!o.naar === !o.boom) fout(`${node}: option needs exactly one of naar/boom`);
  }
}
// Reachability and every tree exactly once.
const gezien = new Set(); const bomen = [];
(function loop(n) { if (gezien.has(n)) fout(`node ${n} reached twice`); gezien.add(n);
  for (const o of SLEUTEL[n].opties) o.boom ? bomen.push(o.boom) : loop(o.naar); })('start');
for (const n of Object.keys(SLEUTEL)) if (!gezien.has(n)) fout(`node ${n} unreachable`);
const dubbel = bomen.filter((b, i) => bomen.indexOf(b) !== i);
if (dubbel.length) fout(`trees reached twice: ${dubbel}`);
const bomenBladen = (await import('../../data/bladen/natuur.js')).default.filter((b) => b.groep === 'bomen' && BLAD[b.id]?.plaatje && !['bladvormen'].includes(b.id)).map((b) => b.id);
for (const b of bomenBladen) if (!bomen.includes(b)) fout(`tree blad ${b} is not in the key`);
for (const b of bomen) if (!T[b]) fout(`no traits for ${b}`);
// Walk each tree.
for (const [boom, t] of Object.entries(T)) {
  let n = 'start'; const pad = [];
  for (let stap = 0; stap < 20; stap++) {
    const passend = SLEUTEL[n].opties.filter((o, i) => P[n][i](t));
    if (passend.length !== 1) { fout(`${boom} at ${n}: ${passend.length} options fit`); break; }
    pad.push(passend[0].tekst);
    if (passend[0].boom) { if (passend[0].boom !== boom) fout(`${boom} ends at ${passend[0].boom}`); break; }
    n = passend[0].naar;
  }
}
console.log(`Determineersleutel: ${Object.keys(T).length} trees walked, ${bomen.length} ends in the key, ${fouten} errors`);
process.exit(fouten ? 1 : 0);
