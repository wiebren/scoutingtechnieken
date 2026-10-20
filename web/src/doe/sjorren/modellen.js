// The twelve pioneering structures as plain data (no three.js here): poles with their ends and diameter, the
// lashings between them, guy lines, pegs and anchors, a few other things (planks, barrels, a flag), and the build
// order in steps. bouwwerk.js shows the steps and the parts list; scene3d.js turns this into a 3D model.
//
// Units are metres; y is up, x to the right, z towards the viewer. Every part has the step it appears in (`stap`,
// counted from 1) and may have a step it disappears in (`tot`): a structure that is lashed lying on the ground and
// then raised has its lying poles until the raise. Those lying copies are `kopie` and are not counted twice in the
// parts list. Sizes and choices: scratchpad/bouwwerken.md and notities/technieken/sjorren-uitwerking.md (TKN §2.3,
// Scoutwiki, V.I.S. II Pionieren 1934).

export const DIK = 0.12;
export const MIDDEL = 0.10;
export const DUN = 0.07;

// -- small vector helpers on [x, y, z]
export const plus = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const min = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const keer = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const punt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const lengte = (a) => Math.hypot(a[0], a[1], a[2]);
export const eenheid = (a) => keer(a, 1 / (lengte(a) || 1));
export const kruis = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const mid = (a, b) => keer(plus(a, b), 0.5);
const RAD = Math.PI / 180;

/** What a kind of lashing, line or anchor is, and the blad that explains it (the link appears when that blad exists). */
export const SOORTEN = {
  kruis: { naam: 'Kruissjorring', blad: 'kruissjorring', uitleg: 'Twee palen die (bijna) haaks kruisen.' },
  diagonaal: { naam: 'Diagonaalsjorring', blad: 'diagonaalsjorring', uitleg: 'Palen die schuin kruisen of uit elkaar willen springen, zoals een schoor.' },
  acht: { naam: 'Achtsjorring', blad: 'achtsjorring', uitleg: 'Drie palen samen: de kop van een driepoot. Het touw gaat in achten om de palen.' },
  vork: { naam: 'Vorksjorring', blad: 'vorksjorring', uitleg: 'Twee palen in een scherpe hoek, de kop van een bok. Ze kunnen een beetje scharnieren.' },
  steiger: { naam: 'Steigersjorring', blad: 'steigersjorring', uitleg: 'Palen in elkaars verlengde, met een spalk ernaast. Wiggen trekken het touw strak.' },
  woel: { naam: 'Woelsjorring', blad: 'woelsjorring', uitleg: 'Zet een vloer vast op de liggers: een stokje draait het touw strak.' },
  slinger: { naam: 'Slingersjorring', blad: 'slingersjorring', uitleg: 'Verbindt de haringen van een anker, zodat ze samen trekken.' },
  wig: { naam: 'Wiggen', blad: 'wig', uitleg: 'Van boven naar beneden tussen paal en touw geslagen: ze trekken alle slagen van de steigersjorring strak.' },
  mastworp: { naam: 'Mastworp', blad: 'mastworp', uitleg: 'Zet een tui of touw vast om een paal.' },
  ton: { naam: 'Ton vastsjorren', blad: 'bouw-vlot', uitleg: 'Een touw om de ton en de balk erboven, zodat de ton niet wegdrijft.' },
  boom: { naam: 'Vast aan de boom', blad: 'boombescherming', uitleg: 'Het touw om de boom, met boombescherming (jute) ertussen tegen het schuren.' },
  jute: { naam: 'Boombescherming', blad: 'boombescherming', uitleg: 'Jute, een oude slaapmat of een brede band om de stam, zodat het touw de bast niet kapot schuurt.' },
  tui: { naam: 'Tui', blad: 'tuien', uitleg: 'Een gespannen lijn naar een anker in de grond: houdt het bouwwerk overeind.' },
  haring: { naam: 'Haring', blad: 'piket', uitleg: 'Schuin in de grond, met de kop van de trekkracht af.' },
  anker: { naam: 'Haringen in serie', blad: 'haringen-in-serie', uitleg: 'Meer haringen achter elkaar, met touw verbonden: ze verdelen de trek over meer grond.' },
  brugtouw: { naam: 'Brugtouw', blad: 'bouw-apenbrug', uitleg: 'Het looptouw en de handtouwen: strak gespannen, met weinig rek.' },
  kabel: { naam: 'Tokkeltouw', blad: 'veilig-touwbanen', uitleg: 'Statisch touw dat bijna niet rekt, van relais naar relais, met genoeg doorhang. Blijf uit de buurt als het gespannen is.' },
  sling: { naam: 'Relais', blad: 'veilig-touwbanen', uitleg: 'Een vast punt: boombescherming, een hijsband om de stam en een sluiting met de werklast erop, waar het touw aan komt.' },
  rem: { naam: 'Rem', blad: 'veilig-touwbanen', uitleg: 'Een blok op het touw met een elastiek naar een anker: de tokkelaar stopt zacht voor de boom.' },
  zak: { naam: 'Testzak', blad: 'veilig-touwbanen', uitleg: 'Eerst test je de baan met een zware zak aan de katrol, pas daarna met iemand in een klimgordel.' },
  draagtouw: { naam: 'Draagtouw', blad: 'bouw-familieschommel', uitleg: 'Twee touwen per eind, in een V naar de liggers: de stam kan alleen in zijn lengte schommelen.' },
  stam: { naam: 'Stam ophangen', blad: 'bouw-familieschommel', uitleg: 'Een paar slagen om de stam en een mastworp: zo zitten de draagtouwen vast zonder te schuiven.' },
  lijn: { naam: 'Touw', blad: null, uitleg: '' },
  // the touwbanen (./modellen-touwbanen.js)
  vierloper: { naam: 'Vierloper', blad: 'vierlopertakel', uitleg: 'Twee blokken met elk twee schijven: je spant het touw met een kwart van de kracht. Daarna zet je het touw vast en haal je de takel eraf.' },
  ophang: { naam: 'Ophangtouw', blad: 'rondtorn', uitleg: 'Een rondtorn met twee halve steken om de boom (met jute), aan de paal een mastworp of een losse lus.' },
  liaan: { naam: 'Liaan', blad: 'bouw-lianenbrug', uitleg: 'Een kort touw aan het boventouw, met een knoop aan het eind om vast te pakken.' },
  klimnet: { naam: 'Klimnet', blad: 'bouw-klimnet', uitleg: 'Een stevig net aan de bovenbalk, de onderkant schuin uitgetrokken naar haringen.' },
  klimtouw: { naam: 'Klimtouw', blad: 'bouw-klimnet', uitleg: 'Een dik touw met knopen om de 40 cm, om in te klimmen.' },
  web: { naam: 'Spinnenweb', blad: 'bouw-spinnenweb', uitleg: 'Dun touw tussen twee bomen, met evenveel gaten als spelers.' },
  kruiptouw: { naam: 'Kruiptouw', blad: 'bouw-kruipgang', uitleg: 'Een touw zigzag tussen korte paaltjes, laag boven de grond: eronderdoor zonder het te raken.' },
  // the other bouwwerken (./modellen-extra.js)
  scharnier: { naam: 'Scharnier', blad: 'beweegbare-verbinding', uitleg: 'Een losse strop om de as en het deel dat beweegt: hij houdt ze bij elkaar, maar laat ze draaien. Kijk hem vaak na: touw dat draait, schuurt.' },
  rond: { naam: 'Rondsjorring', blad: 'rondsjorring', uitleg: 'Twee palen naast elkaar: slagen om beide palen, zonder woelen.' },
  trektouw: { naam: 'Trektouw', blad: 'beweegbare-verbinding', uitleg: 'Hiermee zet je het deel dat beweegt in gang. Trek rustig en op commando, en zet het vast als je loslaat.' },
  stuurtouw: { naam: 'Stuurtouw', blad: 'bouw-lopende-bok', uitleg: 'Vier touwen aan de kop van de bok: trek je aan de ene kant, dan komt de poot aan de andere kant los.' },
  hangtouw: { naam: 'Draagtouw', blad: 'bouw-hangbrug', uitleg: 'Een dik kunststof touw over de portalen, met ruime doorhang. Een takel erachter spant het, een anker houdt het.' },
  hanger: { naam: 'Hanger', blad: 'bouw-hangbrug', uitleg: 'Een kort touw van het draagtouw naar een dwarsligger eronder: zo hangt het dek aan de draagtouwen.' },
  hijstouw: { naam: 'Hijstouw', blad: 'oprichten-takel', uitleg: 'Het touw waarmee je het bouwwerk overeind trekt, over een katrol in een hulpbok of driepoot.' },
  binnenband: { naam: 'Binnenband', blad: 'bouw-katapult', uitleg: 'Een oude fietsbinnenband, om de staander geknoopt: hij rekt als je de zak naar achteren trekt.' },
  ligvlak: { naam: 'Ligvlak', blad: 'bouw-brancard', uitleg: 'Begin met een mastworp, haal het touw steeds om en om rond beide palen, trek het strak en eindig met een mastworp.' },
  lint: { naam: 'Afzetlint', blad: 'bouw-zweefmolen', uitleg: 'Een lint rondom, op paaltjes: binnen het lint komt niemand als de molen draait.' },
  dektouw: { naam: 'Dektouw', blad: 'marlsteek', uitleg: 'Een touw langs de rand van het dek, met een marlsteek om elke dwarsligger: zo zit ook elke dwarsligger zonder hanger vast.' },
  marl: { naam: 'Marlsteek', blad: 'marlsteek', uitleg: 'Een halve steek om de dwarsligger, steeds met hetzelfde touw: zo hangt het hele dek aan één touw.' },
  ophangtouw: { naam: 'Ophangtouw', blad: 'beweegbare-verbinding', uitleg: 'Draagt het deel dat beweegt, vanaf een strop of ring waar het om kan draaien.' },
};

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
    /** What follows belongs to the moving part `naam` (null: fixed again); a new step starts fixed. */
    beweeg(naam) { nu = { ...nu }; if (naam) nu.beweeg = naam; else delete nu.beweeg; },
    /** A pole from a to b with diameter d. */
    paal(a, bb, d, rol = '') { m.palen.push({ a, b: bb, d, rol, ...nu }); return m.palen.length - 1; },
    /** A pole from a, in direction r, of length L. */
    paalL(a, r, L, d, rol) { return b.paal(a, plus(a, keer(eenheid(r), L)), d, rol); },
    sjor(soort, palen, extra = {}) { m.sjor.push({ soort, palen, ...nu, ...extra }); return m.sjor.length - 1; },
    lijn(punten, soort = 'tui', extra = {}) { m.lijnen.push({ punten, soort, ...nu, ...extra }); },
    /** A peg at ground point p, its head leaning away from the pull (weg: horizontal direction); returns its head. */
    haring(p, weg, extra = {}) {
      const w = eenheid([weg[0], 0, weg[2]]);
      const kop = plus(p, plus(keer(w, 0.1), [0, 0.32, 0]));
      m.haringen.push({ p, kop, ...nu, ...extra });
      return kop;
    },
    ding(soort, extra) { m.dingen.push({ soort, ...nu, ...extra }); return m.dingen.length - 1; },
    /**
     * An anchor of pegs in series along `richting` from ground point p: rows of 1, 2, 3 pegs (or the given rows),
     * each row tied to the feet of the next with a slingersjorring. Returns the head of the first peg.
     */
    anker(p, richting, rijen = [3, 2, 1]) {
      // rows of pegs in series, the most pegs in front (nearest the load, where the pull is largest): 3-2-1. Each
      // peg of a row is tied to a peg of the next row so that every peg carries; a strop over the front row takes
      // the load. Returns the point where the load rope ends: the middle of that strop.
      const r = eenheid([richting[0], 0, richting[2]]); const zij = [-r[2], 0, r[0]];
      let vorige = []; let voorste = null;
      rijen.forEach((n, i) => {
        const rij = [];
        for (let j = 0; j < n; j++) {
          const q = plus(plus(p, keer(r, i * 0.75)), keer(zij, (j - (n - 1) / 2) * 0.32));
          const kop = b.haring(q, r, { soort: rijen.length > 1 ? 'anker' : 'haring' });
          rij.push({ q, kop });
        }
        if (!voorste) voorste = rij;
        vorige.forEach((v, j) => {
          const doel = rij[vorige.length > 1 ? Math.round((j * (rij.length - 1)) / (vorige.length - 1)) : 0];
          b.sjor('slinger', [], { van: v.kop, naar: plus(doel.q, [0, 0.04, 0]) });
        });
        vorige = rij;
      });
      if (voorste.length === 1) return voorste[0].kop;
      const koppen = voorste.map((x) => plus(x.kop, keer(r, -0.03)));
      b.lijn(koppen, 'lijn', { dik: 0.006, naam: 'strop over de voorste haringen' });
      return plus(keer(koppen.reduce((a, c) => plus(a, c), [0, 0, 0]), 1 / koppen.length), keer(r, -0.06));
    },
  };
  return b;
}

/** A point on pole (a, b) at height y. */
const opHoogte = (p, y) => { const r = eenheid(min(p.b, p.a)); return plus(p.a, keer(r, (y - p.a[1]) / r[1])); };
/** A point on pole (a, b) at distance t from a. */
const langs = (p, t) => plus(p.a, keer(eenheid(min(p.b, p.a)), t));

/**
 * The two legs of an A (a bok): feet at m ± breed·half, crossing at height kruisY above m, legs of length L that pass
 * each other a radius in front of and behind the plane (along diep = breed turned 90° in the ground plane).
 * Returns the legs (as {a, b}), the crossing point C, and the height at which a beam of radius rb rests in the fork.
 */
function bokVorm(m, breed, half, kruisY, L, d) {
  const r = d / 2; const diep = [-breed[2], 0, breed[0]];
  const C = plus(m, [0, kruisY, 0]);
  // the feet stand in one plane; the legs lean a little apart so that they pass each other at the crossing
  const poten = [-1, 1].map((s) => {
    const voet = plus(m, keer(breed, s * half));
    const doel = plus(C, keer(diep, s * r));
    return { a: voet, b: plus(voet, keer(eenheid(min(doel, voet)), L)) };
  });
  const vorkY = (rb) => C[1] + ((r + rb) * 1.15 * kruisY) / half;
  return { poten, C, diep, vorkY };
}

/** Two legs lying side by side on the ground along `richting` from p (feet at p), a spacer between them. */
function liggend(b, p, richting, L, d, n = 2, tussen = 0.03, hoog = 0) {
  const r = eenheid(richting); const zij = [-r[2], 0, r[0]];
  const uit = [];
  for (let i = 0; i < n; i++) {
    const z = (i - (n - 1) / 2) * (d + tussen);
    const a = plus(plus(p, keer(zij, z)), [0, d / 2, 0]);
    const eind = plus(plus(a, keer(r, L)), [0, hoog, 0]);
    uit.push(b.paal(a, eind, d, 'liggend'));
  }
  return uit;
}

function lijst(m, i) { return m.palen[i]; }

// ---------------------------------------------------------------------------------------------------------------
// The models

function driepoot() {
  const b = bouwer(); const { m } = b;
  const L = 3; const d = MIDDEL; const voetR = 1.1; const totKruis = 2.6;
  const kruisY = Math.sqrt(totKruis ** 2 - voetR ** 2);
  const C = [0, kruisY, 0];

  b.stap('Palen', 'Leg drie palen van 3 m naast elkaar, met de onderkanten gelijk. Een hulppaaltje eronder geeft ruimte voor het touw.', { tot: 3, kopie: true });
  const ligPalen = [];
  for (let i = 0; i < 3; i++) {
    const z = (i - 1) * (d + 0.02);
    ligPalen.push(b.paal([-1.6, d / 2, z], [1.4, d / 2 + 0.07, z], d, 'liggend'));
  }
  b.paal([0.75, DUN / 2, -0.5], [0.75, DUN / 2, 0.5], DUN, 'hulppaaltje');
  b.stap('Achtsjorring', 'Leg de achtsjorring: begin met een mastworp om een buitenste paal, leg zes tot acht slagen in achten over en onder de palen, woel twee keer (begin aan de kant van de mastworp) en eindig met een mastworp op de andere buitenste paal.', { tot: 3, kopie: true });
  b.sjor('acht-liggend', ligPalen, { p: [1.0, 0, 0], naam: 'om de drie palen, liggend' });

  b.stap('Overeind', 'Zet de driepoot overeind en zet de poten uit elkaar. De sjorring komt nu strak.');
  const poten = [90, 210, 330].map((g) => {
    const voet = [Math.cos(g * RAD) * voetR, 0, Math.sin(g * RAD) * voetR];
    const tang = [-Math.sin(g * RAD), 0, Math.cos(g * RAD)];
    const doel = plus(C, keer(tang, 0.065));
    return b.paalL(plus(voet, keer(tang, 0.065)), min(doel, plus(voet, keer(tang, 0.065))), L, d, 'poot');
  });
  b.sjor('acht', poten, { p: C, naam: 'de kop van de driepoot' });

  b.stap('Balkjes', 'Leg drie balkjes van 2 m tussen de poten, vlak boven de grond.');
  const y = 0.4;
  const balk = [];
  for (let i = 0; i < 3; i++) {
    const p1 = opHoogte(lijst(m, poten[i]), y); const p2 = opHoogte(lijst(m, poten[(i + 1) % 3]), y);
    const midden = mid(p1, p2); const uit = eenheid([midden[0], 0, midden[2]]);
    const c = plus(midden, keer(uit, d / 2 + DUN / 2));
    const r = eenheid(min(p2, p1));
    balk.push(b.paal(plus(c, keer(r, -1)), plus(c, keer(r, 1)), DUN, 'balkje'));
  }
  b.stap('Sjorringen', 'Sjor elk balkje met een kruissjorring aan de twee poten. Nu zitten er driehoeken in elke kant: de driepoot kan niet meer openzakken.');
  for (let i = 0; i < 3; i++) {
    b.sjor('kruis', [poten[i], balk[i]], { naam: 'balkje aan poot' });
    b.sjor('kruis', [poten[(i + 1) % 3], balk[i]], { naam: 'balkje aan poot' });
  }
  return { naam: 'Driepoot', ...m, grond: 'gras' };
}

function bok() {
  const b = bouwer(); const { m } = b;
  const L = 4; const d = MIDDEL;
  b.stap('Palen', 'Leg twee palen van 4 m naast elkaar, met een houten haring ertussen zodat ze een beetje uit elkaar liggen.', { tot: 3, kopie: true });
  const lig = liggend(b, [-2, 0, 0], [1, 0, 0], L, d, 2, 0.04);
  b.stap('Vork', 'Leg de vorksjorring zo’n 40 cm onder de toppen: mastworp, slagen om beide palen, dan woelen tussen de palen door, en weer een mastworp.', { tot: 3, kopie: true });
  b.sjor('vork', lig, { p: [1.6, 0, 0], naam: 'om de twee palen, liggend' });

  b.stap('Overeind', 'Zet de bok overeind en zet de poten uit elkaar: ze kruisen in de vork.');
  const vorm = bokVorm([0, 0, 0], [1, 0, 0], 1.0, 3.5, L, d);
  const [p1, p2] = vorm.poten.map((p) => b.paal(p.a, p.b, d, 'poot'));
  b.sjor('vork', [p1, p2], { p: vorm.C, naam: 'de kop van de bok' });

  b.stap('Balk', 'Leg een dwarsbalk van 2,5 m laag over beide poten. Zo wordt de bok een driehoek en kunnen de poten niet uitglijden.');
  const y = 0.5;
  const c = plus([0, y, 0], keer(vorm.diep, d / 2 + MIDDEL / 2 + 0.005));
  const balk = b.paal(plus(c, [-1.25, 0, 0]), plus(c, [1.25, 0, 0]), MIDDEL, 'dwarsbalk');
  b.stap('Sjorringen', 'Sjor de dwarsbalk met twee kruissjorringen aan de poten.');
  b.sjor('kruis', [p1, balk], { naam: 'dwarsbalk aan poot' });
  b.sjor('kruis', [p2, balk], { naam: 'dwarsbalk aan poot' });

  b.stap('Haringen', 'Sla voor en achter de bok een haring, zo’n 4 m van de voet, schuin van de bok af.');
  const kopV = b.haring([0, 0, 4], [0, 0, 1]); const kopA = b.haring([0, 0, -4], [0, 0, -1]);
  b.stap('Tuien', 'Zet twee tuien met een mastworp vast boven de vork en span ze naar de haringen. Nu valt de bok niet voor- of achterover.');
  const top = plus(vorm.C, [0, 0.2, 0]);
  b.sjor('mastworp', [p2], { p: top, naam: 'tui aan de kop' });
  b.lijn([top, kopV], 'tui'); b.lijn([top, kopA], 'tui');
  return { naam: 'Bok', ...m, grond: 'gras' };
}

function poort() {
  const b = bouwer(); const { m } = b;
  const L = 5; const d = DIK; const X = 1.75;
  b.stap('Palen', 'Leg voor elke bok twee palen van 5 m naast elkaar.', { tot: 3, kopie: true });
  const ligL = liggend(b, [-X - 0.15, 0, -2.5], [0, 0, 1], L, d, 2, 0.04);
  const ligR = liggend(b, [X + 0.15, 0, -2.5], [0, 0, 1], L, d, 2, 0.04);
  b.stap('Vork', 'Leg op elk paar een vorksjorring, ruim een halve meter onder de toppen.', { tot: 3, kopie: true });
  b.sjor('vork', ligL, { p: [-X - 0.15, 0, 1.9], naam: 'liggend' });
  b.sjor('vork', ligR, { p: [X + 0.15, 0, 1.9], naam: 'liggend' });

  b.stap('Bokken', 'Zet de twee bokken overeind, dwars op het pad, en sjor laag een dwarsbalk van 2 m aan elke bok (kruissjorringen).');
  const bokken = [-1, 1].map((s) => {
    const vorm = bokVorm([s * X, 0, 0], [0, 0, 1], 1.0, 4.2, L, d);
    const poten = vorm.poten.map((p) => b.paal(p.a, p.b, d, 'poot'));
    b.sjor('vork', poten, { p: vorm.C, naam: 'de kop van een bok' });
    const y = 0.6;
    const c = plus([s * X, y, 0], keer(vorm.diep, -(d / 2 + MIDDEL / 2 + 0.005)));
    const balk = b.paal(plus(c, [0, 0, -1.0]), plus(c, [0, 0, 1.0]), MIDDEL, 'dwarsbalk');
    b.sjor('kruis', [poten[0], balk], { naam: 'dwarsbalk aan poot' });
    b.sjor('kruis', [poten[1], balk], { naam: 'dwarsbalk aan poot' });
    return { vorm, poten };
  });

  b.stap('Bovenregel', 'Leg de bovenregel van 5 m in de vorken en zet hem aan elke bok vast met een kruissjorring.');
  const yb = bokken[0].vorm.vorkY(MIDDEL / 2);
  const regel = b.paal([-2.5, yb, 0], [2.5, yb, 0], MIDDEL, 'bovenregel');
  for (const bk of bokken) b.sjor('kruis', [bk.poten[1], regel], { naam: 'bovenregel in de vork' });

  b.stap('Schoren', 'Zet in elke bovenhoek een schoor van 3 m van halverwege de bok naar de bovenregel, met een diagonaalsjorring aan beide einden. Zo ontstaan driehoeken en zakt de poort niet scheef.');
  for (const [s, bk] of [[-1, bokken[0]], [1, bokken[1]]]) {
    const poot = lijst(m, bk.poten[0]);
    // from the leg at 2,6 m to the bovenregel 1,4 m in from the bok: a long brace, sticking out past both lashings
    const a = plus(opHoogte(poot, 2.6), [-s * 0.02, 0, d / 2 + DUN / 2]);
    const eind = [s * (X - 1.4), yb, MIDDEL / 2 + DUN / 2];
    const r = eenheid(min(eind, a)); const l = lengte(min(eind, a));
    const schoor = b.paal(plus(a, keer(r, -(3 - l) / 2)), plus(eind, keer(r, (3 - l) / 2)), DUN, 'knieschoor');
    b.sjor('diagonaal', [bk.poten[0], schoor], { naam: 'knieschoor aan bok' });
    b.sjor('diagonaal', [regel, schoor], { naam: 'knieschoor aan bovenregel' });
  }

  b.stap('Tuien', 'Span vanaf de kop van elke bok een tui opzij naar een haring. Hang dan het naambord op.');
  for (const [s, bk] of [[-1, bokken[0]], [1, bokken[1]]]) {
    const top = plus(bk.vorm.C, [0, 0.12, 0]);
    b.sjor('mastworp', [bk.poten[0]], { p: top, naam: 'tui aan de kop' });
    const kop = b.haring([s * (X + 4.2), 0, 0], [s, 0, 0]);
    b.lijn([top, kop], 'tui');
  }
  const bordY = yb - 0.75;
  b.ding('bord', { p: [0, bordY, 0.03], breed: 2.2, hoog: 0.5, tekst: 'WELKOM' });
  for (const x of [-0.9, 0.9]) b.lijn([[x, yb, 0], [x, bordY + 0.25, 0.03]], 'lijn', { dik: 0.006 });
  return { naam: 'Kamppoort', ...m, grond: 'gras', extra: ['1 naambord (plank)'] };
}

function vlaggenmast() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL;
  b.stap('Palen', 'Leg twee palen van 4 m in elkaars verlengde en een spalk van 3 m ernaast (een derde van de hele lengte). Je bouwt de mast liggend; hier staat hij al.');
  const onder = b.paal([0, 0, 0], [0, 4, 0], d, 'mast');
  const boven = b.paal([0, 4, 0], [0, 8, 0], d, 'mast (top)');
  const spalk = b.paal([d, 2.5, 0], [d, 5.5, 0], d, 'spalk');
  b.stap('Sjorringen', 'Leg vier steigersjorringen: twee op elke paal, een bij het eind van de spalk en een bij de naad. Begin met een mastworp om beide palen, leg 6 tot 8 slagen en knoop af met een platte knoop.');
  for (const [paal, y] of [[onder, 2.7], [onder, 3.75], [boven, 4.25], [boven, 5.3]]) b.sjor('steiger', [paal, spalk], { p: [d / 2, y, 0], naam: 'mast aan spalk' });
  b.stap('Wiggen', 'Sla bij elke sjorring twee wiggen tussen paal en touw, van boven naar beneden. Ze trekken alle slagen strak en kunnen er niet uit vallen.');
  for (const y of [2.7, 3.75, 4.25, 5.3]) b.ding('wiggen', { p: [d / 2, y, 0], as: [0, 1, 0], r: d });
  b.stap('Ankers', 'Zet drie ankers op zo’n 6 m van de voet, op gelijke afstand rondom: twee haringen achter elkaar, verbonden met een slingersjorring.');
  const koppen = [90, 210, 330].map((g) => {
    const r = [Math.cos(g * RAD), 0, Math.sin(g * RAD)];
    return b.anker(keer(r, 6), r, [1, 1]);
  });
  b.stap('Tuien', 'Zet drie tuien met een mastworp vast vlak onder de top, en de katrol of ring met de vlaglijn in de top (dat doe je terwijl de mast nog ligt). Zet de mast overeind en span de tuien gelijk aan.');
  const top = [0, 7.0, 0];
  b.sjor('mastworp', [boven], { p: top, naam: 'tuien aan de top' });
  for (const kop of koppen) b.lijn([top, kop], 'tui');
  b.stap('Vlag', 'Hijs de vlag aan de vlaglijn, die over een katrol of ring in de top loopt.');
  b.ding('katrol', { p: [-0.08, 7.92, 0] });
  b.lijn([[-0.1, 7.9, 0], [-0.1, 1.2, 0]], 'lijn', { dik: 0.006 });
  b.lijn([[-0.06, 7.9, 0], [-0.06, 1.2, 0]], 'lijn', { dik: 0.006 });
  b.ding('vlag', { p: [-0.1, 7.75, 0], breed: 1.35, hoog: 0.9 });
  return { naam: 'Vlaggenmast', ...m, grond: 'gras', extra: ['1 vlaglijn met katrol of ring', '1 vlag', '8 wiggen'] };
}

function ladder() {
  const b = bouwer(); const { m } = b;
  const rBoom = 0.26; const L = 3; const helling = 75 * RAD;
  const voetZ = rBoom + MIDDEL / 2 + L * Math.cos(helling);
  const topY = L * Math.sin(helling);
  b.ding('boom', { p: [0, 0, 0], r: rBoom, hoog: 7 });
  b.stap('Bomen', 'Leg twee palen van 3 m evenwijdig naast elkaar, 45 cm uit elkaar. (Je bouwt de ladder liggend; hier zie je hem al op zijn plek.)');
  const x = 0.225;
  const zTop = Math.sqrt(rBoom ** 2 - x ** 2) + MIDDEL / 2 + 0.01;
  const bomen = [-x, x].map((xx) => b.paal([xx, 0, voetZ], [xx, topY, zTop], MIDDEL, 'boom van de ladder'));
  b.stap('Sporten', 'Leg acht sporten van 80 cm op de bomen, om de 30 cm, de onderste op 40 cm.');
  const boom = lijst(m, bomen[0]); const r = eenheid(min(boom.b, boom.a));
  const n = eenheid(kruis(r, [1, 0, 0])); // the side away from the tree
  const voor = n[2] > 0 ? n : keer(n, -1);
  const sporten = [];
  for (let i = 0; i < 8; i++) {
    const t = 0.4 + i * 0.3;
    const c = plus(plus([0, 0, voetZ], keer(r, t)), keer(voor, MIDDEL / 2 + DUN / 2));
    sporten.push(b.paal(plus(c, [-0.4, 0, 0]), plus(c, [0.4, 0, 0]), DUN, 'sport'));
  }
  b.stap('Sjorringen', 'Sjor elke sport met een kruissjorring aan beide bomen: zestien sjorringen.');
  for (const s of sporten) for (const bm of bomen) b.sjor('kruis', [bm, s], { naam: 'sport aan boom' });
  b.stap('Vastzetten', 'Zet de ladder tegen de boom en bind de top vast, met jute om de boom tegen het schuren.');
  b.ding('jute', { p: [0, topY - 0.12, 0], r: rBoom, hoog: 0.34 });
  b.sjor('boom', [...bomen], { p: [0, topY - 0.12, 0], boom: { r: rBoom + 0.012, c: [0, 0, 0] }, naam: 'top van de ladder aan de boom' });
  return { naam: 'Ladder', ...m, grond: 'gras', extra: ['jute of een oude slaapmat als boombescherming'] };
}

/**
 * A table with two benches, on three kinds of legs (the scout chooses): loose legs (two A-shaped ends), two bokken,
 * or two driepoten. A driepoot stands firm in every direction, so that table needs no schoor in the length.
 */
function tafel(variant = 'los') {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL; const X = 1.0;
  let eind;
  if (variant === 'bokken') {
    b.stap('Bokken', 'Maak voor elk eind een bok: twee palen van 2 m met een vorksjorring, de poten 1,7 m uit elkaar. De koppen kruisen boven de tafel.');
    eind = [-1, 1].map((s) => {
      const vorm = bokVorm([s * X, 0, 0], [0, 0, 1], 0.85, 1.6, 2, d);
      const poten = vorm.poten.map((p) => b.paal(p.a, p.b, d, 'poot'));
      b.sjor('vork', poten, { p: vorm.C, naam: 'de kop van een bok' });
      return { x: s * X, s, poten };
    });
  } else if (variant === 'driepoten') {
    b.stap('Driepoten', 'Maak voor elk eind een driepoot van palen van 2 m met een achtsjorring: twee poten aan de kopse kant, de derde schuin naar buiten.');
    eind = [-1, 1].map((s) => {
      const C = [s * X, 1.6, 0];
      const voeten = [[s * X, 0, -0.85], [s * X, 0, 0.85], [s * (X + 0.9), 0, 0]];
      const poten = voeten.map((v) => {
        const r = eenheid([v[0] - C[0], 0, v[2] - C[2]]); const tang = [-r[2], 0, r[0]];
        const doel = plus(C, keer(tang, 0.065));
        return b.paalL(v, min(doel, v), 2, d, 'poot');
      });
      b.sjor('acht', poten, { p: C, naam: 'de kop van een driepoot' });
      return { x: s * X, s, poten: poten.slice(0, 2), derde: poten[2] };
    });
  } else {
    b.stap('Poten', 'Zet de twee kopse kanten neer: elk twee poten van 1 m, schuin naar elkaar toe.');
    eind = [-1, 1].map((s) => {
      const x = s * X;
      const poten = [-1, 1].map((k) => b.paal([x, 0, k * 0.7], [x, 0.9, k * 0.25], d, 'poot'));
      return { x, s, poten };
    });
  }
  const los = variant !== 'bokken' && variant !== 'driepoten';
  const lt = los ? 1 : 1.5;
  b.stap('Dragers', `Leg aan de buitenkant van elk eind een tafeldrager (${los ? '1' : '1,5'} m, op 72 cm) en een bankdrager (2 m, op 42 cm) over de poten.`);
  for (const e of eind) {
    const off = e.s * (d / 2 + d / 2 + 0.004);
    e.tafel = b.paal([e.x + off, 0.72, -lt / 2], [e.x + off, 0.72, lt / 2], d, 'tafeldrager');
    e.bank = b.paal([e.x + off, 0.42, -1.0], [e.x + off, 0.42, 1.0], d, 'bankdrager');
  }
  b.stap('Sjorringen', 'Sjor de dragers met kruissjorringen aan de poten: acht in totaal.');
  for (const e of eind) for (const p of e.poten) { b.sjor('kruis', [p, e.tafel], { naam: 'tafeldrager aan poot' }); b.sjor('kruis', [p, e.bank], { naam: 'bankdrager aan poot' }); }
  if (variant !== 'driepoten') {
    b.stap('Schoor', 'Sjor een schoor van 2,5 m schuin onder de tafel van het ene eind naar het andere, met diagonaalsjorringen. Dan wiebelt de tafel niet in de lengte.');
    const pA = opHoogte(lijst(m, eind[0].poten[1]), 0.12); const pB = opHoogte(lijst(m, eind[1].poten[1]), 0.62);
    const off = [0, 0, -(d / 2 + DUN / 2)];
    const a = plus(pA, off); const c = plus(pB, off); const r = eenheid(min(c, a));
    const l = lengte(min(c, a));
    const schoor = b.paal(plus(a, keer(r, -(2.5 - l) / 2)), plus(c, keer(r, (2.5 - l) / 2)), DUN, 'schoor');
    b.sjor('diagonaal', [eind[0].poten[1], schoor], { naam: 'schoor aan poot' });
    b.sjor('diagonaal', [eind[1].poten[1], schoor], { naam: 'schoor aan poot' });
  }
  b.stap('Planken', variant === 'driepoten'
    ? 'Leg drie steigerplanken als tafelblad en één als bank aan elke kant. Een schoor in de lengte is niet nodig: de driepoten staan uit zichzelf al stevig.'
    : 'Leg drie steigerplanken als tafelblad en één als bank aan elke kant. Bind ze vast zodat ze niet schuiven.');
  for (const z of [-0.2, 0, 0.2]) b.ding('plank', { p: [0, 0.72 + d / 2 + 0.016, z], lang: 2.5, breed: 0.2, dik: 0.032 });
  for (const z of [-0.78, 0.78]) b.ding('plank', { p: [0, 0.42 + d / 2 + 0.016, z], lang: 2.5, breed: 0.2, dik: 0.032 });
  return { naam: 'Tafel met banken', ...m, grond: 'gras', extra: ['5 steigerplanken van 2,5 m'] };
}
tafel.varianten = [['los', 'Losse poten'], ['bokken', 'Op twee bokken'], ['driepoten', 'Op twee driepoten']];

function kampkeuken() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL; const X = 0.7; const Z = 0.5;
  b.stap('Palen', 'Zet vier staanders van 1,5 m op de hoeken van een rechthoek van 1,4 bij 1 m.');
  const st = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) st.push({ sx, sz, i: b.paal([sx * X, 0, sz * Z], [sx * X, 1.5, sz * Z], d, 'staander') });
  b.stap('Liggers', 'Sjor aan de lange kanten twee langsliggers op 75 cm, en aan de korte kanten twee dwarsliggers wat lager: acht kruissjorringen.');
  const yl = 0.75;
  const langs = [-1, 1].map((sz) => b.paal([-1.0, yl, sz * (Z + d)], [1.0, yl, sz * (Z + d)], d, 'langsligger'));
  const dwars = [-1, 1].map((sx) => b.paal([sx * (X + d), 0.5, -0.75], [sx * (X + d), 0.5, 0.75], d, 'dwarsligger'));
  for (const s of st) {
    b.sjor('kruis', [s.i, langs[s.sz < 0 ? 0 : 1]], { naam: 'langsligger aan staander' });
    b.sjor('kruis', [s.i, dwars[s.sx < 0 ? 0 : 1]], { naam: 'dwarsligger aan staander' });
  }
  b.stap('Schoren', 'Zet in elke kant een schoor met twee diagonaalsjorringen, onder de vloer, zodat de vuurtafel niet scheef zakt.');
  for (const sz of [-1, 1]) {
    // on the inside of the staanders and under the vloer, so it touches both staanders and keeps clear of the floor
    const z = sz * (Z - d / 2 - DUN / 2);
    const a = [-sz * X, 0.1, z]; const c = [sz * X, 0.64, z];
    const r = eenheid(min(c, a)); const l = lengte(min(c, a));
    const schoor = b.paal(plus(a, keer(r, -(2 - l) / 2)), plus(c, keer(r, (2 - l) / 2)), DUN, 'schoor');
    b.sjor('diagonaal', [st.find((s) => s.sx === -sz && s.sz === sz).i, schoor], { naam: 'schoor aan staander' });
    b.sjor('diagonaal', [st.find((s) => s.sx === sz && s.sz === sz).i, schoor], { naam: 'schoor aan staander' });
  }
  // and one in each short side, also inside and under the vloer, leaning the other way than the long ones there
  for (const sx of [-1, 1]) {
    const x = sx * (X - d / 2 - DUN / 2);
    const a = [x, 0.1, sx * Z]; const c = [x, 0.64, -sx * Z];
    const r = eenheid(min(c, a)); const l = lengte(min(c, a));
    const schoor = b.paal(plus(a, keer(r, -(1.5 - l) / 2)), plus(c, keer(r, (1.5 - l) / 2)), DUN, 'schoor');
    b.sjor('diagonaal', [st.find((s) => s.sx === sx && s.sz === sx).i, schoor], { naam: 'schoor aan staander' });
    b.sjor('diagonaal', [st.find((s) => s.sx === sx && s.sz === -sx).i, schoor], { naam: 'schoor aan staander' });
  }
  b.stap('Vloer', 'Leg een vloer van dunne palen dwars over de langsliggers.');
  const yv = yl + d / 2 + DUN / 2;
  for (let i = 0; i < 12; i++) {
    const x = -0.6 + 0.04 + i * (1.12 / 11) - 0.02;
    b.paal([x, yv, -0.72], [x, yv, 0.72], DUN, 'vloer');
  }
  b.stap('Zand', 'Leg er een dikke laag zand of plaggen op, met een opstaande rand. Daarop stook je: de sjorringen zitten eronder en kunnen niet doorbranden.');
  b.ding('zand', { p: [0, yv + DUN / 2 + 0.06, 0], lang: 1.3, breed: 1.2, dik: 0.12 });
  b.stap('Galg', 'Graaf twee kookstaanders van 3 m een halve meter in, sjor ze aan de dwarsliggers en zet elk met een schoor naar een haring vast. Leg er bovenop een kookbalk van 2 m: kruissjorringen.');
  const ks = [-1, 1].map((sx) => b.paal([sx * (X + d + d), -0.5, 0], [sx * (X + d + d), 2.5, 0], d, 'kookstaander (ingegraven)'));
  ks.forEach((k, i) => b.sjor('kruis', [k, dwars[i]], { naam: 'kookstaander aan dwarsligger' }));
  ks.forEach((k, i) => {
    // a schoor from a haring in front up to the kookstaander, so the galg cannot tip forward or back
    const sx = i ? 1 : -1; const x = sx * (X + d + d + d / 2 + DUN / 2 + 0.003);
    const a = [x, 0.03, 0.95]; const c = [x, 1.5, 0];
    const r = eenheid(min(c, a)); const l = lengte(min(c, a));
    const schoor = b.paal(plus(a, keer(r, -0.08)), plus(a, keer(r, l + 0.17)), DUN, 'schoor');
    b.sjor('diagonaal', [k, schoor], { naam: 'schoor aan de kookstaander' });
    b.haring([x, 0, 1.08], [0, 0, 1]);
  });
  const kb = b.paal([-1.0, 1.95, d], [1.0, 1.95, d], d, 'kookbalk');
  ks.forEach((k) => b.sjor('kruis', [k, kb], { naam: 'kookbalk aan kookstaander' }));
  b.stap('Vuur', 'Stook het vuur op het zand en hang de pan aan een ketting aan de kookbalk. Zo hoog dat de kleinste kok in de pan kan kijken.');
  const zandTop = yv + DUN / 2 + 0.12;
  b.ding('vuur', { p: [0, zandTop, 0] });
  b.ding('pan', { p: [0, zandTop + 0.62, d], r: 0.15, hoog: 0.17 });
  b.lijn([[0, 1.95 - d / 2, d], [0, zandTop + 0.62 + 0.085, d]], 'ketting', { dik: 0.008 });
  return { naam: 'Kampkeuken met vuurtafel', ...m, grond: 'gras', extra: ['zand of plaggen voor op de vloer', 'een ketting met haak'] };
}

function uitkijktoren() {
  const b = bouwer(); const { m } = b;
  const d = DIK; const H = 4.5; const S = 1.0; const rr = MIDDEL;
  b.stap('Palen', 'Vier staanders van 4,5 m op de hoeken van een vierkant van 2 bij 2 m, net een meter langer dan de leuning hoog is. (Echt bouw je de zijkanten liggend en takel je de toren overeind; hier staat hij al.)');
  const st = {};
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) st[`${sx}${sz}`] = b.paal([sx * S, 0, sz * S], [sx * S, H, sz * S], d, 'staander');
  const ring = (y, naam) => {
    const off = S + d / 2 + rr / 2;
    for (const sz of [-1, 1]) {
      const p = b.paal([-1.25, y, sz * off], [1.25, y, sz * off], rr, naam);
      for (const sx of [-1, 1]) b.sjor('kruis', [st[`${sx}${sz}`], p], { naam: `${naam} aan staander` });
    }
    for (const sx of [-1, 1]) {
      const p = b.paal([sx * off, y + rr, -1.25], [sx * off, y + rr, 1.25], rr, naam);
      for (const sz of [-1, 1]) b.sjor('kruis', [st[`${sx}${sz}`], p], { naam: `${naam} aan staander` });
    }
  };
  b.stap('Ring 1', 'Sjor vlak boven de grond een ring van vier regels van 2,5 m: acht kruissjorringen.');
  ring(0.3, 'regel');
  b.stap('Ring 2', 'Sjor op 2,5 m de ring die het platform draagt.');
  ring(2.5, 'platformregel');
  b.stap('Schoren', 'Zet in elke zijkant een kruis van twee schoren van 3 m, met diagonaalsjorringen aan de staanders en waar ze elkaar kruisen. Driehoeken in elk vlak: dan staat de toren stijf.');
  const zijden = [
    { as: [1, 0, 0], n: [0, 0, 1] }, { as: [1, 0, 0], n: [0, 0, -1] },
    { as: [0, 0, 1], n: [1, 0, 0] }, { as: [0, 0, 1], n: [-1, 0, 0] },
  ];
  for (const z of zijden) {
    const kant = (s) => plus(keer(z.as, s * S), keer(z.n, S));
    const stA = st[key(kant(-1))]; const stB = st[key(kant(1))];
    const y0 = 0.5; const y1 = 2.3;
    const schoren = [0, 1].map((k) => {
      const off = d / 2 + DUN / 2 + k * DUN;
      const a = plus(plus(kant(k ? 1 : -1), [0, y0, 0]), keer(z.n, off));
      const c = plus(plus(kant(k ? -1 : 1), [0, y1, 0]), keer(z.n, off));
      const r = eenheid(min(c, a)); const l = lengte(min(c, a));
      return b.paal(plus(a, keer(r, -(3 - l) / 2)), plus(c, keer(r, (3 - l) / 2)), DUN, 'kruisschoor');
    });
    b.sjor('diagonaal', [stA, schoren[0]], { naam: 'schoor aan staander' });
    b.sjor('diagonaal', [stB, schoren[0]], { naam: 'schoor aan staander' });
    b.sjor('diagonaal', [stB, schoren[1]], { naam: 'schoor aan staander' });
    b.sjor('diagonaal', [stA, schoren[1]], { naam: 'schoor aan staander' });
    b.sjor('diagonaal', [schoren[0], schoren[1]], { naam: 'waar de schoren kruisen' });
  }
  b.stap('Leuning', 'Sjor op 3,5 m nog een ring als leuning, een meter boven de vloer.');
  ring(3.5, 'leuning');
  b.stap('Vloer', 'Leg de vloer van dunne palen dicht naast elkaar op de platformregels.');
  const yv = 2.5 + rr / 2 + DUN / 2;
  for (let i = 0; i < 24; i++) {
    const x = -0.88 + i * (1.76 / 23);
    b.paal([x, yv, -1.25], [x, yv, 1.25], DUN, 'vloer');
  }
  b.stap('Ladder', 'Zet een gesjorde ladder van 3 m tegen de voorkant, tot net boven de vloer.');
  {
    const zTop = S + d / 2 + rr + 0.06; const yTop = 2.85; const L = 3;
    const zVoet = zTop + Math.sqrt(L * L - yTop * yTop);
    const bomen = [-0.225, 0.225].map((x) => b.paal([x, 0, zVoet], [x, yTop, zTop], MIDDEL, 'boom van de ladder'));
    const r = eenheid(min([0, yTop, zTop], [0, 0, zVoet]));
    const voor = eenheid(kruis([1, 0, 0], r));
    const v = voor[2] > 0 ? voor : keer(voor, -1);
    for (let i = 0; i < 8; i++) {
      const c = plus(plus([0, 0, zVoet], keer(r, 0.4 + i * 0.3)), keer(v, MIDDEL / 2 + DUN / 2));
      const s = b.paal(plus(c, [-0.4, 0, 0]), plus(c, [0.4, 0, 0]), DUN, 'sport');
      for (const bm of bomen) b.sjor('kruis', [bm, s], { naam: 'sport aan de ladder' });
    }
  }
  b.stap('Ankers', 'Zet vier ankers, schuin van de hoeken af: haringen in serie (3-2-1), met slingersjorringen verbonden.');
  const koppen = {};
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const r = eenheid([sx, 0, sz]);
    koppen[`${sx}${sz}`] = b.anker(keer(r, 6.2), r, [3, 2, 1]);
  }
  b.stap('Tuien', 'Zet aan elke staander, vlak boven de leuning, een tui met een mastworp vast en span hem naar zijn anker. Daar zit de staander vast in de ring, dus daar kan de tui aan trekken.');
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const top = [sx * S, 3.85, sz * S];
    b.sjor('mastworp', [st[`${sx}${sz}`]], { p: top, naam: 'tui aan de staander' });
    b.lijn([plus(top, keer(eenheid([sx, 0, sz]), d / 2)), koppen[`${sx}${sz}`]], 'tui');
  }
  return { naam: 'Uitkijktoren', ...m, grond: 'gras' };

  function key(p) { return `${Math.sign(Math.round(p[0] * 10))}${Math.sign(Math.round(p[2] * 10))}`; }
}

function apenbrug() {
  const b = bouwer(); const { m } = b;
  const X = 4; const L = 3; const d = MIDDEL;
  b.ding('water', { x0: -2.4, x1: 2.4 });
  b.stap('Palen', 'Zet aan elke kant van het water twee palen van 3 m als een grote X, dwars op de brug.');
  const kruizen = [-1, 1].map((s) => {
    const x = s * X; const C = [x, 1.3, 0];
    const poten = [-1, 1].map((k) => {
      const voet = [x, 0, -k * 0.8];
      const doel = plus(C, [k * d / 2, 0, 0]);
      return b.paalL(voet, min(doel, voet), L, d, 'poot');
    });
    return { s, x, C, poten };
  });
  b.stap('Kruising', 'Sjor elke X waar de palen kruisen met een diagonaalsjorring: de palen kruisen schuin.');
  for (const k of kruizen) b.sjor('diagonaal', k.poten, { naam: 'de kruising van de X' });
  b.stap('Balken', 'Sjor laag een dwarsbalk van 2 m over beide poten (kruissjorringen), aan de kant van het anker.');
  for (const k of kruizen) {
    const c = [k.x + k.s * (d / 2 * 1.25 + DUN / 2), 0.3, 0];
    const balk = b.paal(plus(c, [0, 0, -1]), plus(c, [0, 0, 1]), DUN, 'dwarsbalk');
    for (const p of k.poten) b.sjor('kruis', [p, balk], { naam: 'dwarsbalk aan poot' });
  }
  b.stap('Ankers', 'Zet achter elke X, zo’n 3 m verder, een anker van haringen in serie (3-2-1) met slingersjorringen.');
  const ank = kruizen.map((k) => b.anker([k.x + k.s * 3, 0, 0], [k.s, 0, 0], [3, 2, 1]));
  b.stap('Looptouw', 'Span het looptouw van anker naar anker. Het ligt in de kruisingen van de X’en.');
  const yl = 1.3 + 0.13;
  const looptouw = (z) => {
    const pts = [ank[0], [kruizen[0].x, yl, z]];
    for (let i = 1; i < 10; i++) { const t = i / 10; pts.push([-X + 2 * X * t, yl - 0.28 * Math.sin(Math.PI * t), z]); }
    pts.push([kruizen[1].x, yl, z], ank[1]);
    return pts;
  };
  b.lijn(looptouw(0), 'brugtouw', { dik: 0.016, naam: 'looptouw' });
  b.stap('Handtouw', 'Span de twee handtouwen over de toppen van de X’en, ook naar de ankers. Span met spierkracht en een spanknoop, nooit met een auto of lier.');
  for (const k of [0, 1]) {
    const topA = lijst(m, kruizen[0].poten[k]).b; const topB = lijst(m, kruizen[1].poten[k]).b;
    const pts = [ank[0], topA];
    for (let i = 1; i < 10; i++) { const t = i / 10; const p = plus(topA, keer(min(topB, topA), t)); p[1] -= 0.2 * Math.sin(Math.PI * t); pts.push(p); }
    pts.push(topB, ank[1]);
    b.lijn(pts, 'brugtouw', { dik: 0.013, naam: 'handtouw' });
    b.sjor('mastworp', [kruizen[0].poten[k]], { p: plus(topA, keer(eenheid(min(lijst(m, kruizen[0].poten[k]).a, topA)), 0.1)), naam: 'handtouw aan de top' });
    b.sjor('mastworp', [kruizen[1].poten[k]], { p: plus(topB, keer(eenheid(min(lijst(m, kruizen[1].poten[k]).a, topB)), 0.1)), naam: 'handtouw aan de top' });
  }
  return { naam: 'Apenbrug', ...m, grond: 'gras', extra: ['1 looptouw en 2 handtouwen, elk ±16 m, met weinig rek'] };
}

function schragenbrug() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL; const XS = 1.5; const yd = 0.8;
  b.ding('water', { x0: -3, x1: 3 });
  const schragen = [];
  b.stap('Poten', 'Zet in het water twee schragen neer: elk twee poten van 2,5 m, onderaan wat verder uit elkaar dan bovenaan.');
  for (const s of [-1, 1]) {
    const x = s * XS;
    const poten = [-1, 1].map((k) => b.paal([x, 0, k * 1.0], [x, 2.45, k * 0.7], d, 'poot'));
    schragen.push({ s, x, poten });
  }
  b.stap('Balken', 'Sjor aan elke schraag een draagbalk op 80 cm en een onderbalk op 25 cm, met kruissjorringen.');
  for (const sc of schragen) {
    sc.draag = b.paal([sc.x - d, yd, -1.25], [sc.x - d, yd, 1.25], d, 'draagbalk');
    sc.onder = b.paal([sc.x - d, 0.25, -1.25], [sc.x - d, 0.25, 1.25], d, 'onderbalk');
    for (const p of sc.poten) { b.sjor('kruis', [p, sc.draag], { naam: 'draagbalk aan poot' }); b.sjor('kruis', [p, sc.onder], { naam: 'onderbalk aan poot' }); }
  }
  b.stap('Schoren', 'Zet onder de draagbalk een kruis van twee schoren in elke schraag, met diagonaalsjorringen aan de poten en in het midden.');
  for (const sc of schragen) {
    const schoren = [-1, 1].map((k, i) => {
      const off = d / 2 + DUN / 2 + i * DUN;
      const a = [sc.x + off, 0.33, k * 0.96]; const c = [sc.x + off, 0.72, -k * 0.9];
      const r = eenheid(min(c, a)); const l = lengte(min(c, a));
      return b.paal(plus(a, keer(r, -(2.5 - l) / 2)), plus(c, keer(r, (2.5 - l) / 2)), DUN, 'kruisschoor');
    });
    b.sjor('diagonaal', [sc.poten[0], schoren[0]], { naam: 'schoor aan poot' });
    b.sjor('diagonaal', [sc.poten[1], schoren[0]], { naam: 'schoor aan poot' });
    b.sjor('diagonaal', [sc.poten[1], schoren[1]], { naam: 'schoor aan poot' });
    b.sjor('diagonaal', [sc.poten[0], schoren[1]], { naam: 'schoor aan poot' });
    b.sjor('diagonaal', schoren, { naam: 'waar de schoren kruisen' });
  }
  b.stap('Dorpels', 'Leg op elke oever een dorpel van 2 m dwars op de brug en zet hem vast met haringen.');
  const dorpels = [-1, 1].map((s) => {
    const x = s * 4.7;
    const p = b.paal([x, d / 2, -1.0], [x, d / 2, 1.0], d, 'dorpel');
    for (const z of [-0.8, 0.8]) b.haring([x - s * 0.12, 0, z], [-s, 0, 0]);
    return { x, p };
  });
  b.stap('Liggers', 'Leg de liggers van 4 m van oever naar schraag naar schraag naar oever, twee naast elkaar, en sjor ze vast met kruissjorringen.');
  const yl = yd + d;
  // the end spans rest on the dorpel and on the draagbalk, and stick out a little past both
  const eind = (s) => {
    const p1 = [s * XS, yl, 0]; const p2 = [s * 4.7, d + d / 2, 0]; const r = eenheid(min(p2, p1));
    return [plus(p1, keer(r, -0.25)), plus(p2, keer(r, 0.35))];
  };
  const [ea, eb] = eind(-1); const [fa, fb] = eind(1);
  const spans = [
    { a: eb, b: ea, z: 0.55, steun: [dorpels[0].p, schragen[0].draag] },
    { a: [-1.75, yl, 0], b: [1.75, yl, 0], z: 0.45, steun: [schragen[0].draag, schragen[1].draag] },
    { a: fa, b: fb, z: 0.55, steun: [schragen[1].draag, dorpels[1].p] },
  ];
  for (const sp of spans) {
    sp.liggers = [-1, 1].map((k) => b.paal(plus(sp.a, [0, 0, k * sp.z]), plus(sp.b, [0, 0, k * sp.z]), d, 'ligger'));
    for (const l of sp.liggers) for (const s of sp.steun) b.sjor('kruis', [s, l], { naam: 'ligger op draagbalk' });
  }
  b.stap('Vloer', 'Leg de vloer: dunne palen van 1,5 m dwars over de liggers, dicht naast elkaar.');
  const vloerY = (x) => {
    const sp = x < -1.5 ? spans[0] : x > 1.5 ? spans[2] : spans[1];
    const t = (x - sp.a[0]) / (sp.b[0] - sp.a[0]);
    return sp.a[1] + t * (sp.b[1] - sp.a[1]) + d / 2 + DUN / 2;
  };
  for (let x = -4.6; x <= 4.6; x += 0.1) {
    const y = vloerY(x);
    b.paal([x, y, -0.75], [x, y, 0.75], DUN, 'vloer');
  }
  b.stap('Ribben', 'Leg langs elke rand een opsluitrib op de vloer en zet die met woelsjorringen aan de ligger vast: touw om rib en ligger, een stokje erdoor en strak draaien.');
  for (const sp of spans) {
    for (const k of [-1, 1]) {
      const z = k * 0.62;
      const a = [...sp.a]; const e = [...sp.b];
      a[1] = vloerY(a[0] + 0.05 * Math.sign(e[0] - a[0])) + DUN; e[1] = vloerY(e[0] - 0.05 * Math.sign(e[0] - a[0])) + DUN;
      const r = eenheid(min(e, a));
      const rib = b.paal(plus([a[0], a[1], z], keer(r, 0.1)), plus([e[0], e[1], z], keer(r, -0.1)), DUN, 'opsluitrib');
      const ligger = sp.liggers[k < 0 ? 0 : 1];
      for (const t of [0.25, 0.5, 0.75]) {
        const p = plus(plus(a, keer(min(e, a), t)), [0, 0, z]);
        b.sjor('woel', [ligger, rib], { p, naam: 'opsluitrib aan ligger' });
      }
    }
  }
  b.stap('Leuning', 'Span aan beide kanten een leuningtouw over de toppen van de poten, naar haringen op de oevers.');
  for (const k of [-1, 1]) {
    const tops = schragen.map((sc) => opHoogte(lijst(m, sc.poten[k < 0 ? 0 : 1]), 2.0));
    const kopA = b.haring([-5.6, 0, k * 0.9], [-1, 0, 0]); const kopB = b.haring([5.6, 0, k * 0.9], [1, 0, 0]);
    b.lijn([kopA, tops[0], plus(mid(tops[0], tops[1]), [0, -0.12, 0]), tops[1], kopB], 'tui', { naam: 'leuningtouw', dik: 0.011 });
    schragen.forEach((sc, i) => b.sjor('mastworp', [sc.poten[k < 0 ? 0 : 1]], { p: tops[i], naam: 'leuningtouw aan poot' }));
  }
  return { naam: 'Schragenbrug', ...m, grond: 'gras', extra: ['2 leuningtouwen van ±13 m', 'een woelhoutje per woelsjorring'] };
}

function schommel() {
  const b = bouwer(); const { m } = b;
  const L = 5; const d = DIK; const X = 2.0;
  b.stap('Palen', 'Leg voor elke bok twee palen van 5 m naast elkaar.', { tot: 3, kopie: true });
  const ligA = liggend(b, [-X - 0.2, 0, -2.5], [0, 0, 1], L, d, 2, 0.04);
  const ligB = liggend(b, [X + 0.2, 0, -2.5], [0, 0, 1], L, d, 2, 0.04);
  b.stap('Vork', 'Leg op elk paar een vorksjorring, zo’n 45 cm onder de toppen.', { tot: 3, kopie: true });
  b.sjor('vork', ligA, { p: [-X - 0.2, 0, 2.05], naam: 'liggend' });
  b.sjor('vork', ligB, { p: [X + 0.2, 0, 2.05], naam: 'liggend' });
  b.stap('Bokken', 'Zet de bokken overeind met de poten in de richting waarin je schommelt, en sjor laag een dwarsbalk van 3 m aan elke bok (kruissjorringen).');
  const bokken = [-1, 1].map((s) => {
    const vorm = bokVorm([s * X, 0, 0], [0, 0, 1], 1.5, 4.05, L, d);
    const poten = vorm.poten.map((p) => b.paal(p.a, p.b, d, 'poot'));
    b.sjor('vork', poten, { p: vorm.C, naam: 'de kop van een bok' });
    const c = plus([s * X, 0.5, 0], keer(vorm.diep, s * (d / 2 + MIDDEL / 2 + 0.005)));
    const balk = b.paal(plus(c, [0, 0, -1.5]), plus(c, [0, 0, 1.5]), MIDDEL, 'dwarsbalk');
    for (const p of poten) b.sjor('kruis', [p, balk], { naam: 'dwarsbalk aan poot' });
    return { vorm, poten };
  });
  b.stap('Balk', 'Leg de bovenbalk van 5 m in de twee vorken en zet hem aan elke bok vast met een kruissjorring.');
  const yb = bokken[0].vorm.vorkY(d / 2);
  const balk = b.paal([-2.5, yb, 0], [2.5, yb, 0], d, 'bovenbalk');
  for (const bk of bokken) b.sjor('kruis', [bk.poten[1], balk], { naam: 'bovenbalk in de vork' });
  b.stap('Ankers', 'Zet aan beide kanten, in het verlengde van de bovenbalk, een anker van haringen in serie (3-2-1).');
  const ank = [-1, 1].map((s) => b.anker([s * 6.5, 0, 0], [s, 0, 0], [3, 2, 1]));
  b.stap('Tuien', 'Span vanaf elk eind van de bovenbalk een tui naar het anker. Dan kan het geheel niet opzij kantelen.');
  [-1, 1].forEach((s, i) => {
    const p = [s * 2.35, yb, 0];
    b.sjor('mastworp', [balk], { p, naam: 'tui aan de bovenbalk' });
    b.lijn([p, ank[i]], 'tui');
  });
  b.stap('Zitting', 'Hang twee touwen aan de bovenbalk en maak er een zitplank aan op 50 cm. Test hem eerst goed voor iemand erop gaat.');
  for (const x of [-0.42, 0.42]) {
    b.sjor('mastworp', [balk], { p: [x, yb, 0], naam: 'schommeltouw aan de bovenbalk' });
    b.lijn([[x, yb - d / 2, 0], [x, 0.53, 0]], 'lijn', { dik: 0.011, naam: 'schommeltouw' });
  }
  b.ding('plank', { p: [0, 0.52, 0], lang: 1.0, breed: 0.26, dik: 0.04 });
  return { naam: 'Schommel', ...m, grond: 'gras', extra: ['2 schommeltouwen', '1 zitplank van 1 m'] };
}

function vlot() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL; const tonR = 0.29; const tonL = 0.88;
  b.ding('meer', {});
  b.stap('Raam', 'Leg twee langsbalken van 3,5 m op vier dwarsbalken van 2,5 m. (Echt bouw je het vlot ondersteboven op de kant en keer je het om; hier ligt het al in het water.)');
  const yL = 0.04 + tonR + d / 2;
  const langs = [-1, 1].map((s) => b.paal([-1.75, yL, s * 0.75], [1.75, yL, s * 0.75], d, 'langsbalk'));
  const dwars = [-1.3, -0.25, 0.25, 1.3].map((x) => b.paal([x, yL - d, -1.25], [x, yL - d, 1.25], d, 'dwarsbalk'));
  b.stap('Sjorringen', 'Sjor elke kruising met een kruissjorring: acht in totaal.');
  for (const l of langs) for (const w of dwars) b.sjor('kruis', [w, l], { naam: 'langsbalk op dwarsbalk' });
  b.stap('Schoren', 'Leg in elk eindvak een schoor van 2 m schuin van hoek naar hoek over de langsbalken en sjor hem met diagonaalsjorringen. Zonder schoren trekt het raam in het water scheef.');
  const yS = yL + d / 2 + DUN / 2;
  for (const sx of [-1, 1]) {
    const a = [sx * 0.62, yS, -sx * 0.75]; const c = [sx * 1.6, yS, sx * 0.75];
    const r = eenheid(min(c, a)); const l = lengte(min(c, a));
    const schoor = b.paal(plus(a, keer(r, -(2 - l) / 2)), plus(c, keer(r, (2 - l) / 2)), DUN, 'schoor');
    b.sjor('diagonaal', [langs[0], schoor], { naam: 'schoor aan langsbalk' });
    b.sjor('diagonaal', [langs[1], schoor], { naam: 'schoor aan langsbalk' });
  }
  b.stap('Tonnen', 'Leg onder elke hoek een ton van 200 liter, tussen twee dwarsbalken, en sjor hem met een touw rond de ton vast aan de langsbalk. Vier tonnen dragen samen ruim 400 kg.');
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const c = [sx * 0.75, 0.04, sz * 0.75];
    const t = b.ding('ton', { p: c, r: tonR, lang: tonL });
    b.sjor('ton', [langs[sz < 0 ? 0 : 1]], { p: c, ton: t, tonR, naam: 'ton aan langsbalk' });
  }
  b.stap('Vloer', 'Leg in het middenvak een vloer van steigerplanken dwars over de langsbalken en bind ze vast. Daar zit of sta je.');
  for (const x of [-0.44, -0.22, 0, 0.22, 0.44]) b.ding('plank', { p: [x, yL + d / 2 + 0.016, 0], lang: 0.2, breed: 1.9, dik: 0.032 });
  return { naam: 'Vlot', ...m, grond: 'water', extra: ['4 tonnen (vaten) van 200 liter, goed dicht', '5 steigerplanken van 2 m'] };
}

function mini() {
  const b = bouwer(); const { m } = b;
  // drawn at ten times its real size, so the string (metselkoord) and the sticks keep their real proportions; the
  // parts list gives the real sizes (schaal 0,1)
  const d = DUN; const L = 3; const X = 1.2;
  b.stap('Stokjes', 'Leg de stokjes klaar: vier van 30 cm voor de poten, twee van 20 cm als dwarsbalk en een van 30 cm als bovenbalk. Satéprikkers of dun rondhout van 6 tot 8 mm, schaal 1 op 10.', { tot: 2, kopie: true });
  [[-1.5, 1.2], [-1.5, 1.32], [-1.5, 1.44], [-1.5, 1.56], [-1.0, 1.8], [-1.0, 1.92], [-1.5, 2.1]].forEach(([x, z], i) => {
    const l = i === 4 || i === 5 ? 2 : 3;
    b.paal([x, d / 2, z], [x + l, d / 2, z], d, 'stokje');
  });
  b.stap('Bokjes', 'Maak twee bokjes: twee stokjes met een vorksjorring van metselkoord, de poten uit elkaar.');
  const bokken = [-1, 1].map((s) => {
    const vorm = bokVorm([s * X, 0, 0], [0, 0, 1], 0.9, 2.3, L, d);
    const poten = vorm.poten.map((p) => b.paal(p.a, p.b, d, 'poot'));
    b.sjor('vork', poten, { p: vorm.C, naam: 'de kop van een bokje' });
    return { s, vorm, poten };
  });
  b.stap('Dwarsbalkjes', 'Sjor laag een dwarsbalkje aan elk bokje, met twee kruissjorringen.');
  for (const bk of bokken) {
    const c = plus([bk.s * X, 0.4, 0], keer(bk.vorm.diep, bk.s * (d + 0.004)));
    const balk = b.paal(plus(c, [0, 0, -1]), plus(c, [0, 0, 1]), d, 'dwarsbalkje');
    for (const p of bk.poten) b.sjor('kruis', [p, balk], { naam: 'dwarsbalkje aan poot' });
  }
  b.stap('Bovenbalk', 'Leg de bovenbalk in de vorken en sjor hem vast. Moet het model blijven staan? Een druppel lijm op elke knoop.');
  const yb = bokken[0].vorm.vorkY(d / 2);
  const balk = b.paal([-1.5, yb, 0], [1.5, yb, 0], d, 'bovenbalk');
  for (const bk of bokken) b.sjor('kruis', [bk.poten[1], balk], { naam: 'bovenbalk in de vork' });
  b.ding('koord', { p: [2.4, 0.26, 1.3], r: 0.26 });
  b.ding('liniaal', { p: [0, 0.012, -1.9], lang: 3.0, breed: 0.32 });
  return { naam: 'Mini-pionieren', ...m, grond: 'tafel', schaal: 0.1, extra: ['metselkoord', 'een druppel lijm per knoop, als het model moet blijven staan'] };
}

function eetshelter() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL; const L = 3; const X = 1.3;
  b.stap('Palen', 'Zet aan elke kant twee palen van 3 m als een A, en leg de nokbalk van 3 m over de twee koppen. (Echt sjor je de drie palen liggend en zet je het geheel daarna overeind.)');
  const eind = [-1, 1].map((s) => {
    const vorm = bokVorm([s * X, 0, 0], [0, 0, 1], 1.3, 2.3, L, d);
    return { s, vorm, poten: vorm.poten.map((p) => b.paal(p.a, p.b, d, 'poot')) };
  });
  const yn = eind[0].vorm.vorkY(d / 2);
  const nok = b.paal([-1.5, yn, 0], [1.5, yn, 0], d, 'nokbalk');
  b.stap('Achtsjorringen', 'Leg aan elke kant een achtsjorring om de twee poten en de nokbalk, die haaks op de poten ligt.');
  for (const e of eind) b.sjor('acht', e.poten, { p: e.vorm.C, nok, naam: 'twee poten en de nokbalk' });
  b.stap('Dragers', 'Sjor aan elke kant een tafeldrager (2 m, op 72 cm) en een bankdrager (2,5 m, op 42 cm) over de poten.');
  for (const e of eind) {
    const off = e.s * (d / 2 + d / 2);
    e.tafel = b.paal([e.s * X + off, 0.72, -1.0], [e.s * X + off, 0.72, 1.0], d, 'tafeldrager');
    e.bank = b.paal([e.s * X + off, 0.42, -1.25], [e.s * X + off, 0.42, 1.25], d, 'bankdrager');
  }
  b.stap('Sjorringen', 'Zet de dragers vast met kruissjorringen: acht in totaal.');
  for (const e of eind) for (const p of e.poten) { b.sjor('kruis', [p, e.tafel], { naam: 'tafeldrager aan poot' }); b.sjor('kruis', [p, e.bank], { naam: 'bankdrager aan poot' }); }
  b.stap('Tafel', 'Leg het tafelblad en de banken: dunne palen van 3 m, even lang als de nokbalk.');
  for (let i = 0; i < 5; i++) { const z = -0.28 + i * 0.14; const y = 0.72 + d / 2 + DUN / 2; b.paal([-1.5, y, z], [1.5, y, z], DUN, 'tafelblad'); }
  for (const z of [-0.78, -0.7, 0.7, 0.78]) { const y = 0.42 + d / 2 + DUN / 2; b.paal([-1.5, y, z], [1.5, y, z], DUN, 'bank'); }
  b.stap('Zeil', 'Span een zeil over de nokbalk en zet de hoeken met scheerlijnen en haringen vast. Twee tuien in de lengte houden het geheel recht.');
  const top = yn + d / 2 + 0.01;
  b.ding('zeil', { punten: [[-1.7, top, 0], [1.7, top, 0], [1.7, 1.05, 1.85], [-1.7, 1.05, 1.85]] });
  b.ding('zeil', { punten: [[-1.7, top, 0], [1.7, top, 0], [1.7, 1.05, -1.85], [-1.7, 1.05, -1.85]] });
  for (const x of [-1.7, 1.7]) for (const z of [-1.85, 1.85]) {
    const kop = b.haring([x * 1.15, 0, z * 1.4], [Math.sign(x), 0, Math.sign(z)]);
    b.lijn([[x, 1.05, z], kop], 'tui', { naam: 'scheerlijn' });
  }
  for (const s of [-1, 1]) {
    const kop = b.haring([s * 3.6, 0, 0], [s, 0, 0]);
    b.sjor('mastworp', [nok], { p: [s * 1.42, yn, 0], naam: 'tui aan de nokbalk' });
    b.lijn([[s * 1.42, yn, 0], kop], 'tui');
  }
  return { naam: 'Eetshelter', ...m, grond: 'gras', extra: ['een zeil van ±3,5 × 4 m', '4 scheerlijnen'] };
}

function klimrek() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL; const L = 3; const X = 1.5;
  b.stap('Bokken', 'Zet twee bokken van palen van 3 m neer, 3 m uit elkaar, elk met een vorksjorring en laag een dwarsbalk van 2 m (kruissjorringen), zodat de poten niet uit elkaar kunnen. Laag houden: de kop komt op ruim 2 m.');
  const bokken = [-1, 1].map((s) => {
    const vorm = bokVorm([s * X, 0, 0], [0, 0, 1], 0.9, 2.15, L, d);
    const poten = vorm.poten.map((p) => b.paal(p.a, p.b, d, 'poot'));
    b.sjor('vork', poten, { p: vorm.C, naam: 'de kop van een bok' });
    // low down, on the outside: keeps the legs of the bok from spreading
    const c = plus([s * X, 0.25, 0], keer(vorm.diep, s * (d / 2 + d / 2 + 0.005)));
    const balk = b.paal(plus(c, [0, 0, -1.0]), plus(c, [0, 0, 1.0]), d, 'dwarsbalk');
    for (const p of poten) b.sjor('kruis', [p, balk], { naam: 'dwarsbalk aan poot' });
    return { s, vorm, poten };
  });
  b.stap('Nokbalk', 'Leg een nokbalk van 3,5 m in de vorken en sjor hem vast met kruissjorringen.');
  const yn = bokken[0].vorm.vorkY(d / 2);
  const nok = b.paal([-1.75, yn, 0], [1.75, yn, 0], d, 'nokbalk');
  for (const bk of bokken) b.sjor('kruis', [bk.poten[1], nok], { naam: 'nokbalk in de vork' });
  b.stap('Klimbalken', 'Sjor aan beide kanten drie klimbalken van 3,5 m over de poten, op 50, 100 en 150 cm: twaalf kruissjorringen.');
  for (const k of [0, 1]) {
    for (const y of [0.5, 1.0, 1.5]) {
      const p0 = opHoogte(lijst(m, bokken[0].poten[k]), y);
      const z = p0[2] + Math.sign(p0[2]) * (d / 2 + d / 2);
      const balk = b.paal([-1.75, y, z], [1.75, y, z], d, 'klimbalk');
      for (const bk of bokken) b.sjor('kruis', [bk.poten[k], balk], { naam: 'klimbalk aan poot' });
    }
  }
  b.stap('Schoren', 'Zet aan de binnenkant van elke zijde een schoor van 4 m met diagonaalsjorringen. Zo zakt het rek niet scheef in de lengte.');
  for (const k of [0, 1]) {
    const pA = opHoogte(lijst(m, bokken[0].poten[k]), 0.2); const pB = opHoogte(lijst(m, bokken[1].poten[k]), 1.85);
    const off = [0, 0, -Math.sign(pA[2]) * (d / 2 + DUN / 2)];
    const a = plus(pA, off); const c = plus(pB, off); const r = eenheid(min(c, a)); const l = lengte(min(c, a));
    const schoor = b.paal(plus(a, keer(r, -(4 - l) / 2)), plus(c, keer(r, (4 - l) / 2)), DUN, 'schoor');
    b.sjor('diagonaal', [bokken[0].poten[k], schoor], { naam: 'schoor aan poot' });
    b.sjor('diagonaal', [bokken[1].poten[k], schoor], { naam: 'schoor aan poot' });
  }
  b.stap('Valzand', 'Leg zand of houtsnippers onder het rek, en laat de leiding het controleren voor iemand erop klimt.');
  b.ding('zand', { p: [0, 0.025, 0], lang: 4.6, breed: 3.4, dik: 0.05, rand: false });
  return { naam: 'Klimrek', ...m, grond: 'gras', extra: ['zand of houtsnippers onder het rek'] };
}

function stormbaan() {
  const b = bouwer(); const { m } = b;
  b.stap('Kruipgang', 'Begin met een kruipgang: twee lage bokjes (de poten kruisen bijna haaks, dus een kruissjorring) met een nokbalk, en een zeil eroverheen dat aan de zijkanten met haringen laag bij de grond vastzit.');
  const bokjes = [-6.8, -4.2].map((x) => {
    const vorm = bokVorm([x, 0, 0], [0, 0, 1], 0.6, 0.65, 1.5, DUN);
    const poten = vorm.poten.map((p) => b.paal(p.a, p.b, DUN, 'poot'));
    b.sjor('kruis', poten, { naam: 'waar de poten van een bokje kruisen' });
    return { vorm, poten };
  });
  const yk = bokjes[0].vorm.vorkY(DUN / 2);
  const nok = b.paal([-7.0, yk, 0], [-4.0, yk, 0], DUN, 'nokbalk');
  for (const bk of bokjes) b.sjor('kruis', [bk.poten[1], nok], { naam: 'nokbalk in de vork' });
  const t = yk + DUN / 2 + 0.01;
  b.ding('zeil', { punten: [[-7.1, t, 0], [-3.9, t, 0], [-3.9, 0.12, 1.0], [-7.1, 0.12, 1.0]] });
  b.ding('zeil', { punten: [[-7.1, t, 0], [-3.9, t, 0], [-3.9, 0.12, -1.0], [-7.1, 0.12, -1.0]] });
  for (const x of [-7.1, -5.5, -3.9]) for (const z of [-1.1, 1.1]) b.haring([x, 0, z], [0, 0, Math.sign(z)]);

  b.stap('Balken', 'Dan drie balken: eroverheen, eronderdoor, en weer eroverheen. Elke balk hangt met kruissjorringen tussen twee staanders die een halve meter diep zijn ingegraven.');
  [[-2.8, 1.0], [-1.6, 0.55], [-0.4, 1.0]].forEach(([x, y]) => {
    const st = [-1, 1].map((s) => b.paal([x, -0.5, s * 1.1], [x, 1.5, s * 1.1], MIDDEL, 'staander (ingegraven)'));
    const balk = b.paal([x + MIDDEL, y, -1.4], [x + MIDDEL, y, 1.4], MIDDEL, 'balk');
    for (const s of st) b.sjor('kruis', [s, balk], { naam: 'balk aan staander' });
  });

  b.stap('Wand', 'Een wand om tegenop te klimmen: liggende palen tegen twee ingegraven staanders, een klimtouw met knopen, en aan de achterkant twee schoren.');
  const xw = 1.5;
  const st = [-1, 1].map((s) => b.paal([xw, -0.5, s * 1.0], [xw, 2.4, s * 1.0], DIK, 'staander (ingegraven)'));
  for (let i = 0; i < 8; i++) {
    const y = 0.3 + i * 0.25;
    const p = b.paal([xw - DIK / 2 - DUN / 2, y, -1.25], [xw - DIK / 2 - DUN / 2, y, 1.25], DUN, 'wandpaal');
    for (const s of st) b.sjor('kruis', [s, p], { naam: 'wandpaal aan staander' });
  }
  const yt = 0.3 + 7 * 0.25;
  b.lijn([[xw - 0.12, yt, 0], [xw - 0.16, 0.05, 0]], 'lijn', { dik: 0.013, naam: 'klimtouw' });
  for (let i = 0; i < 4; i++) b.ding('knoop', { p: [xw - 0.13 - i * 0.008, yt - 0.4 - i * 0.4, 0] });
  for (const [s, si] of [[-1, 0], [1, 1]]) {
    // beside the staander, from the ground behind the wall up to 2 m
    const zS = s * (1.0 + DIK / 2 + DUN / 2);
    const a = [xw + 1.6, 0.03, zS]; const c = [xw, 2.0, zS];
    const r = eenheid(min(c, a));
    const schoor = b.paal(a, plus(a, keer(r, lengte(min(c, a)) + 0.25)), DUN, 'schoor');
    b.sjor('diagonaal', [st[si], schoor], { naam: 'schoor aan staander' });
    b.haring([xw + 1.72, 0, s * 1.0], [1, 0, 0]);
  }

  b.stap('Evenwicht', 'Tot slot een evenwichtsbalk: een paal van 4 m in de vorken van twee lage bokjes (kruissjorring waar de poten kruisen), vastgezet met kruissjorringen. En de finish.');
  const ev = [4.0, 6.4].map((x) => {
    const vorm = bokVorm([x, 0, 0], [0, 0, 1], 0.45, 0.4, 1.0, MIDDEL);
    const poten = vorm.poten.map((p) => b.paal(p.a, p.b, MIDDEL, 'poot'));
    b.sjor('kruis', poten, { naam: 'waar de poten van een bokje kruisen' });
    return { vorm, poten };
  });
  const ye = ev[0].vorm.vorkY(MIDDEL / 2);
  const evb = b.paal([3.2, ye, 0], [7.2, ye, 0], MIDDEL, 'evenwichtsbalk');
  for (const bk of ev) b.sjor('kruis', [bk.poten[1], evb], { naam: 'evenwichtsbalk in de vork' });
  b.ding('vlag', { p: [7.8, 1.6, 0.9], breed: 0.6, hoog: 0.4, paal: true });
  return { naam: 'Stormbaan', ...m, grond: 'gras', zicht: { theta: 0.5, phi: 1.0 }, extra: ['een zeil voor de kruipgang', 'een klimtouw'] };
}

function kabelbaan() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL; const cx = 1.5; const S = 0.7; const yp = 2.4; const XB = 22;
  b.ding('boom', { p: [0, 0, 0], r: 0.34, hoog: 9 });
  b.ding('boom', { p: [XB, 0, 0], r: 0.3, hoog: 7.5 });
  b.stap('Platform', 'Bouw naast de eerste boom een stevig platform: vier staanders van 4 m, een ring vlak boven de grond en een ring op 2,4 m die de vloer draagt.');
  const st = {};
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) st[`${sx}${sz}`] = b.paal([cx + sx * S, 0, sz * S], [cx + sx * S, 4, sz * S], d, 'staander');
  const ring = (y, naam, zonder = null) => {
    const off = S + d;
    for (const sz of [-1, 1]) {
      const p = b.paal([cx - 1.0, y, sz * off], [cx + 1.0, y, sz * off], d, naam);
      for (const sx of [-1, 1]) b.sjor('kruis', [st[`${sx}${sz}`], p], { naam: `${naam} aan staander` });
    }
    for (const sx of [-1, 1]) {
      if (zonder === sx) continue;
      const p = b.paal([cx + sx * off, y + d, -1.0], [cx + sx * off, y + d, 1.0], d, naam);
      for (const sz of [-1, 1]) b.sjor('kruis', [st[`${sx}${sz}`], p], { naam: `${naam} aan staander` });
    }
  };
  ring(0.3, 'regel'); ring(yp, 'platformregel');
  b.stap('Schoren', 'Zet in drie zijden een kruis van schoren met diagonaalsjorringen. Het platform mag niet wiebelen.');
  const kruisIn = (as, n) => {
    const hoek = (s) => plus([cx, 0, 0], plus(keer(as, s * S), keer(n, S)));
    const key = (p) => `${Math.sign(Math.round((p[0] - cx) * 10))}${Math.sign(Math.round(p[2] * 10))}`;
    const A = st[key(hoek(-1))]; const B = st[key(hoek(1))];
    const sch = [0, 1].map((k) => {
      const off = d / 2 + DUN / 2 + k * DUN;
      const a = plus(plus(hoek(k ? 1 : -1), [0, 0.45, 0]), keer(n, off));
      const c = plus(plus(hoek(k ? -1 : 1), [0, yp - 0.15, 0]), keer(n, off));
      const r = eenheid(min(c, a)); const l = lengte(min(c, a));
      return b.paal(plus(a, keer(r, -(2.5 - l) / 2)), plus(c, keer(r, (2.5 - l) / 2)), DUN, 'kruisschoor');
    });
    b.sjor('diagonaal', [A, sch[0]], { naam: 'schoor aan staander' }); b.sjor('diagonaal', [B, sch[0]], { naam: 'schoor aan staander' });
    b.sjor('diagonaal', [B, sch[1]], { naam: 'schoor aan staander' }); b.sjor('diagonaal', [A, sch[1]], { naam: 'schoor aan staander' });
    b.sjor('diagonaal', sch, { naam: 'waar de schoren kruisen' });
  };
  kruisIn([1, 0, 0], [0, 0, 1]); kruisIn([0, 0, 1], [-1, 0, 0]); kruisIn([0, 0, 1], [1, 0, 0]);
  b.stap('Vloer', 'Leg de vloer, sjor een leuning op 3,4 m (open aan de kant van de baan) en zet een gesjorde ladder tegen de achterkant.');
  const yv = yp + d / 2 + DUN / 2;
  for (let i = 0; i < 16; i++) { const x = cx - 0.6 + i * (1.2 / 15); b.paal([x, yv, -1.0], [x, yv, 1.0], DUN, 'vloer'); }
  ring(3.4, 'leuning', 1);
  {
    const zTop = -(S + d + d / 2 + 0.06); const yTop = yp + 0.45; const L = 3;
    const zVoet = zTop - Math.sqrt(L * L - yTop * yTop);
    const bomen = [-0.225, 0.225].map((x) => b.paal([cx + x, 0, zVoet], [cx + x, yTop, zTop], d, 'boom van de ladder'));
    const r = eenheid(min([0, yTop, zTop], [0, 0, zVoet]));
    let v = eenheid(kruis([1, 0, 0], r)); if (v[2] > 0) v = keer(v, -1);
    for (let i = 0; i < 8; i++) {
      const c = plus(plus([cx, 0, zVoet], keer(r, 0.4 + i * 0.3)), keer(v, d / 2 + DUN / 2));
      const sp = b.paal(plus(c, [-0.4, 0, 0]), plus(c, [0.4, 0, 0]), DUN, 'sport');
      for (const bm of bomen) b.sjor('kruis', [bm, sp], { naam: 'sport aan de ladder' });
    }
  }
  b.stap('Relais', 'Maak aan beide bomen een vast punt (relais): boombescherming, een hijsband om de stam en een sluiting met de werklast erop. Boven zit het relais ruim boven stahoogte op het platform.');
  const yA = 4.4; const yB = 1.9;
  b.ding('jute', { p: [0, yA, 0], r: 0.34, hoog: 0.3 });
  b.ding('sling', { p: [0, yA, 0], r: 0.34 });
  b.ding('jute', { p: [XB, yB, 0], r: 0.3, hoog: 0.3 });
  b.ding('sling', { p: [XB, yB, 0], r: 0.3 });
  b.stap('Touw', 'Span het statische touw (geen klimtouw: dat rekt) van relais naar relais, met genoeg doorhang. Span nooit met een auto of lier, en nooit over een weg of pad.');
  const pts = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push([0.4 + (XB - 0.8) * t, yA + (yB - yA) * t - 0.55 * Math.sin(Math.PI * t), 0]); }
  b.lijn(pts, 'kabel', { dik: 0.012, naam: 'tokkeltouw (statisch touw)' });
  b.stap('Rem', 'Zorg voor een rem aan het eind: een blok op het touw met een elastiek naar een anker, zodat je zacht stopt. Eronder een zachte landing.');
  const xr = XB - 2.6; const tR = (xr - 0.4) / (XB - 0.8); const yr = yA + (yB - yA) * tR - 0.55 * Math.sin(Math.PI * tR);
  b.ding('katrol', { p: [xr, yr, 0], rem: true });
  const kop = b.anker([XB + 1.6, 0, 1.4], [1, 0, 0.6], [2, 1]);
  b.lijn([[xr, yr - 0.04, 0], [XB - 0.4, yB - 0.5, 0.5], kop], 'rem', { dik: 0.011, naam: 'remelastiek' });
  b.ding('zand', { p: [XB - 3.2, 0.02, 0], lang: 4.5, breed: 2.2, dik: 0.04, rand: false });
  b.stap('Testen', 'Test de baan eerst met een zware zak aan de tokkelkatrol, nooit meteen met iemand. Wie tokkelt heeft een klimgordel en blijft van opklimmen tot afstappen gezekerd, onder toezicht van leiding die er verstand van heeft.');
  const xt = 8.0; const tt = (xt - 0.4) / (XB - 0.8); const yt = yA + (yB - yA) * tt - 0.55 * Math.sin(Math.PI * tt);
  b.ding('katrol', { p: [xt, yt - 0.05, 0] });
  b.lijn([[xt, yt - 0.1, 0], [xt, yt - 0.9, 0]], 'lijn', { dik: 0.01, naam: 'sling' });
  b.ding('zak', { p: [xt, yt - 1.15, 0] });
  return { naam: 'Kabelbaan', ...m, grond: 'gras', kader: 'alles', zicht: { theta: 0.75, phi: 1.15 }, extra: ['statisch touw (±60 m), hijsbanden en sluitingen met werklast, een tokkelkatrol', 'klimgordels en zekeringsmateriaal (gekeurd)', 'een rem met elastiek, en een zware zak om te testen'] };
}

function reuzenrad() {
  const b = bouwer(); const { m } = b;
  // the onderstel after the drawing of the Scouting Reuzenrad (knoopenzo.nl, SRR-006-a): on each side two upright
  // staanders beside a dorpel on the ground, braced with schoren, with a regel on which the as lies
  const H = 3.15; const R = 2.5; const Z = 0.45; const zj = 1.45; const xs = 0.35;
  b.stap('Onderstel', 'Leg aan beide kanten een dikke dorpel van 3,5 m op de grond. Zet ernaast twee staanders van 4,5 m rechtop, een stukje in de grond, en sjor ze met kruissjorringen aan de dorpel.');
  const kanten = [-1, 1].map((s) => {
    const z = s * zj;
    const dorpel = b.paal([-1.75, DIK / 2, z + s * DIK], [1.75, DIK / 2, z + s * DIK], DIK, 'dorpel');
    const staanders = [-1, 1].map((k) => b.paal([k * xs, -0.4, z], [k * xs, 4.1, z], DIK, 'staander'));
    for (const st of staanders) b.sjor('kruis', [st, dorpel], { naam: 'staander aan dorpel' });
    return { s, z, dorpel, staanders };
  });
  b.stap('Schoren', 'Zet de staanders vast met schoren van de dorpel naar de staanders, een regel waar straks de as op ligt, een regel bovenaan, en aan de buitenkant een lange schoor naar een haring. Driehoeken in elke richting.');
  for (const k of kanten) {
    const { s, z } = k;
    const buiten = z + s * (DIK / 2 + MIDDEL / 2 + 0.004);
    for (const kx of [-1, 1]) {
      // the foot lies against the outer side of the dorpel, the top against the staander: the schoor leans in a little
      const a = [kx * 1.55, DIK / 2 + 0.03, z + s * (DIK + DIK / 2 + MIDDEL / 2 + 0.004)]; const c = [kx * (xs + 0.02), 2.3, buiten];
      const r = eenheid(min(c, a)); const l = lengte(min(c, a));
      const schoor = b.paal(plus(a, keer(r, -0.12)), plus(a, keer(r, 3 - 0.12)), MIDDEL, 'schoor');
      b.sjor('diagonaal', [k.dorpel, schoor], { naam: 'schoor aan de dorpel' });
      b.sjor('diagonaal', [k.staanders[kx < 0 ? 0 : 1], schoor], { naam: 'schoor aan staander' });
    }
    // the regel the as rests on (inside), and one at the top (outside)
    const binnen = z - s * (DIK / 2 + MIDDEL / 2 + 0.004);
    k.asRegel = b.paal([-0.75, H - DIK / 2 - MIDDEL / 2, binnen], [0.75, H - DIK / 2 - MIDDEL / 2, binnen], MIDDEL, 'regel voor de as');
    const top = b.paal([-0.75, 3.75, buiten], [0.75, 3.75, buiten], MIDDEL, 'bovenregel');
    for (const st of k.staanders) { b.sjor('kruis', [st, k.asRegel], { naam: 'regel aan staander' }); b.sjor('kruis', [st, top], { naam: 'bovenregel aan staander' }); }
    const voet = [0, 0, z + s * 2.1]; const kop = [0, 3.75 - 0.02, buiten + s * (MIDDEL / 2 + MIDDEL / 2 + 0.004)];
    const r = eenheid(min(kop, voet));
    const schoor = b.paal(plus(voet, keer(r, -0.1)), plus(voet, keer(r, lengte(min(kop, voet)) + 0.3)), MIDDEL, 'schoor');
    b.sjor('diagonaal', [top, schoor], { naam: 'schoor aan de bovenregel' });
    b.haring([0, 0, z + s * 2.25], [0, 0, s]);
  }
  const C = [0, H, 0]; const RV = R - 0.35;
  b.stap('Spaken', 'Maak twee raamwerken. Elk heeft vier palen van 5 m die elkaar in het midden kruisen: acht spaken. Ze gaan om beurten links en rechts langs de plek van de as.');
  b.beweeg('rad');
  // spoke j points at angle j·45°; the four poles of a frame lie against each other, and pass the axle on alternate sides
  const ramen = [-1, 1].map((s) => {
    const spaken = []; const hoek = [];
    for (let j = 0; j < 4; j++) {
      const a = (j * 45) * RAD; const as = [Math.cos(a), Math.sin(a), 0]; const zij = [-as[1], as[0], 0];
      const mm = plus([0, H, s * (Z + j * MIDDEL)], keer(zij, (j % 2 ? -1 : 1) * (DIK / 2 + MIDDEL / 2)));
      spaken.push(b.paal(plus(mm, keer(as, -R)), plus(mm, keer(as, R)), MIDDEL, 'spaak'));
      hoek[j] = plus(mm, keer(as, RV)); hoek[j + 4] = plus(mm, keer(as, -RV));
    }
    return { s, spaken, hoek, spaak: (k) => spaken[k % 4] };
  });
  b.stap('Velgen', 'Sjor in elk raamwerk acht dunne palen van 2 m als velg rond de spaken, 35 cm van de uiteinden: diagonaalsjorringen.');
  b.beweeg('rad');
  for (const rw of ramen) {
    for (let k = 0; k < 8; k++) {
      // against the outer side of the two spokes it joins; every other velg one pole further out, so they pass
      const zv = (i) => rw.s * (Z + (i % 4) * MIDDEL + MIDDEL / 2 + DUN / 2 + 0.004 + (k % 2) * DUN);
      const za = [rw.hoek[k][0], rw.hoek[k][1], zv(k)]; const k2 = (k + 1) % 8; const zc = [rw.hoek[k2][0], rw.hoek[k2][1], zv(k2)];
      const r = eenheid(min(zc, za));
      const v = b.paal(plus(za, keer(r, -0.18)), plus(zc, keer(r, 0.18)), DUN, 'velg');
      b.sjor('diagonaal', [rw.spaak(k), v], { naam: 'velg aan spaak' });
      b.sjor('diagonaal', [rw.spaak(k + 1), v], { naam: 'velg aan spaak' });
    }
  }
  b.stap('Liggers', 'Verbind de twee raamwerken met vier spaakliggers aan de schuine spaken, vlak bij de uiteinden, met kruissjorringen.');
  b.beweeg('rad');
  const liggers = [];
  for (const k of [1, 3, 5, 7]) {
    const a = (k * 45) * RAD; const dir = [Math.cos(a), Math.sin(a), 0];
    const pa = lijst(m, ramen[0].spaak(k)); const as = eenheid(min(pa.b, pa.a));
    const zij = eenheid(kruis(as, [0, 0, 1]));
    // near the tip of the spoke, beside it, lying across both frames
    const mid = keer(plus(pa.a, pa.b), 0.5);
    const tip = plus(mid, keer(as, punt(dir, as) > 0 ? R - 0.15 : -(R - 0.15)));
    const c = plus(tip, keer(zij, MIDDEL + 0.004));
    const l = b.paal([c[0], c[1], -(Z + 0.6)], [c[0], c[1], Z + 0.6], MIDDEL, 'spaakligger');
    for (const rw of ramen) b.sjor('kruis', [rw.spaak(k), l], { naam: 'spaakligger aan spaak' });
    liggers.push({ l, c, k });
  }
  b.stap('As', 'Steek de as door het midden en sjor elke spaak eraan vast. Leg de as aan beide kanten op de regel tussen de staanders, met een losse strop eromheen, zodat het rad kan draaien.');
  b.beweeg('rad');
  const as = b.paal([0, H, -1.85], [0, H, 1.85], DIK, 'as');
  for (const rw of ramen) for (const sp of rw.spaken) b.sjor('kruis', [as, sp], { naam: 'spaak aan de as' });
  b.beweeg(null);
  for (const k of kanten) b.sjor('scharnier', [k.asRegel, as], { vorm: 'kruis', naam: 'de as op de regel' });
  b.stap('Bakjes', 'Hang aan elke spaakligger een schommeltje: plaats voor vier mensen. Draai het rad eerst leeg en daarna met zandzakken, voor iemand erin gaat.');
  const bakjes = {};
  liggers.forEach((lg, i) => {
    const naam = `bakje${i}`; b.beweeg(naam);
    bakjes[naam] = { punt: C, as: [0, 0, 1], hoek: [0, 360], baan: true, aan: lg.c };
    const y = lg.c[1] - 0.55;
    for (const z of [-0.3, 0.3]) b.lijn([[lg.c[0], lg.c[1] - MIDDEL / 2, z], [lg.c[0], y + 0.02, z]], 'lijn', { dik: 0.008, naam: 'touw van het bakje' });
    b.ding('plank', { p: [lg.c[0], y, 0], lang: 0.3, breed: 0.72, dik: 0.035 });
  });
  b.beweeg(null);
  return {
    naam: 'Reuzenrad', ...m, grond: 'gras', zicht: { theta: 0.35, phi: 1.2 }, extra: ['4 zitplankjes met touw'],
    // the wheel turns round the as; the seats go round with it but keep hanging straight down
    beweging: {
      label: 'Draai het rad', vanaf: 7, start: 0,
      delen: { rad: { punt: C, as: [0, 0, 1], hoek: [0, 360] }, ...bakjes },
      waarde: (t) => `het rad is ${Math.round(t * 360)} graden gedraaid`,
    },
  };
}

/**
 * Familieschommel (the "dubbel" drawing of the activiteitenbank): a long frame of two liggers on a driepoot in the
 * middle and a pair of long crossed poles on each side; a boomstam hangs under it on two V's of rope and swings
 * along its length, with the family on it.
 */
function familieschommel() {
  const b = bouwer(); const { m } = b;
  const d = MIDDEL; const H = 4.6; const yl = 1.9; const Z = 0.6;
  b.stap('Driepoot', 'Sjor een driepoot van palen van 5 m met een achtsjorring en zet hem midden op de plek: één poot voor, twee achter.');
  const zf = (Z + d) / (1 - yl / H);
  const C = [0, H, 0];
  const voeten = [[0, 0, zf], [-1.0, 0, -zf], [1.0, 0, -zf]];
  const poten = voeten.map((v) => {
    const r = eenheid([v[0], 0, v[2]]); const tang = [-r[2], 0, r[0]];
    const doel = plus(C, keer(tang, 0.065));
    return b.paalL(v, min(doel, v), 5, d, 'poot van de driepoot');
  });
  b.sjor('acht', poten, { p: C, naam: 'de kop van de driepoot' });
  b.stap('Liggers', 'Sjor twee lange liggers van 6 m op borsthoogte (±1,9 m) aan de poten van de driepoot, een aan de voorkant en een aan de achterkant: kruissjorringen.');
  const liggers = [-1, 1].map((s) => b.paal([-3, yl, s * Z], [3, yl, s * Z], d, 'ligger'));
  b.sjor('kruis', [poten[0], liggers[1]], { naam: 'ligger aan de driepoot' });
  b.sjor('kruis', [poten[1], liggers[0]], { naam: 'ligger aan de driepoot' });
  b.sjor('kruis', [poten[2], liggers[0]], { naam: 'ligger aan de driepoot' });
  b.stap('Scharen', 'Zet aan elke kant twee lange schuine palen van 5 m als een grote schaar: de toppen dragen de liggers vlak bij hun eind, de voeten staan onder het midden in de grond. Diagonaalsjorringen aan de ligger en waar ze kruisen.');
  for (const s of [-1, 1]) {
    // the two poles of one side: from a foot under the middle up past the ligger near its far end
    const z1 = s * (Z + d); const z2 = s * (Z + d * 1.72);
    const paal = (k, z) => {
      const voet = [-k * 1.3, 0, z]; const kruisL = [k * 2.4, yl, z];
      return b.paalL(voet, min(kruisL, voet), 5, d, 'schuine paal');
    };
    const p1 = paal(1, z1); const p2 = paal(-1, z2);
    b.sjor('diagonaal', [liggers[s < 0 ? 0 : 1], p1], { naam: 'schuine paal aan ligger' });
    b.sjor('diagonaal', [liggers[s < 0 ? 0 : 1], p2], { naam: 'schuine paal aan ligger' });
    b.sjor('diagonaal', [p1, p2], { naam: 'waar de schuine palen kruisen' });
  }
  b.stap('Dwarsliggers', 'Leg aan beide einden een dwarsligger van 2 m over de twee liggers en sjor hem vast met kruissjorringen. Nu is het raam een stijf geheel.');
  for (const x of [-2.9, 2.9]) {
    const dw = b.paal([x, yl + d, -1.0], [x, yl + d, 1.0], d, 'dwarsligger');
    for (const l of liggers) b.sjor('kruis', [l, dw], { naam: 'dwarsligger op ligger' });
  }
  b.stap('Stam', 'Hang de boomstam aan elk eind aan twee touwen in een V naar de twee liggers, zo laag dat je er makkelijk op zit. Door de V kan de stam alleen in zijn lengte heen en weer: dat is het schommelen.');
  const yS = 0.55; const rS = 0.17;
  b.ding('stam', { p: [0, yS, 0], r: rS, lang: 5.4 });
  for (const x of [-2.35, 2.35]) {
    const onder = [x, yS + rS + 0.01, 0];
    for (const z of [-Z, Z]) b.lijn([[x, yl - d / 2, z], onder], 'draagtouw', { dik: 0.008, naam: 'draagtouw' });
    b.sjor('stam', [], { p: [x, yS, 0], r: rS, naam: 'draagtouwen om de stam' });
  }
  return { naam: 'Familieschommel', ...m, grond: 'gras', zicht: { theta: 0.55, phi: 1.12 }, extra: ['1 boomstam van ±5,5 m, ±35 cm dik', '4 draagtouwen'] };
}

export const MODELLEN = { driepoot, bok, poort, vlaggenmast, ladder, tafel, kampkeuken, uitkijktoren, apenbrug, schragenbrug, schommel, vlot, mini, eetshelter, klimrek, stormbaan, kabelbaan, reuzenrad, familieschommel };

/** The parts list of a model: poles by length and thickness, lashings by kind, lines, pegs, and the extras. */
export function onderdelen(model) {
  const palen = new Map();
  for (const p of model.palen) {
    if (p.kopie) continue;
    const L = lengte(min(p.b, p.a)); const l = L < 1.25 ? Math.round(L * 10) / 10 : Math.round(L * 2) / 2;
    const dik = p.d >= DIK ? 'dik' : p.d >= MIDDEL ? 'middel' : 'dun';
    const k = `${l}|${dik}`;
    palen.set(k, (palen.get(k) ?? 0) + 1);
  }
  const paalRegels = [...palen.entries()].sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
    .map(([k, n]) => {
      const [l, dik] = k.split('|');
      // a model at a smaller scale (mini-pionieren): sticks in centimetres
      if (model.schaal) return `${n} × stokje van ${Math.round(parseFloat(l) * model.schaal * 100)} cm`;
      return `${n} × paal van ${String(l).replace('.', ',')} m (${dik})`;
    });
  const sjor = new Map();
  for (const s of model.sjor) {
    if (s.kopie) continue;
    const naam = (SOORTEN[s.soort === 'acht-liggend' ? 'acht' : s.soort]).naam.toLowerCase();
    sjor.set(naam, (sjor.get(naam) ?? 0) + 1);
  }
  const sjorRegels = [...sjor.entries()].map(([naam, n]) => `${n} × ${naam}`);
  const tuien = model.lijnen.filter((l) => l.soort === 'tui' && !l.naam).length;
  const haringen = model.haringen.length;
  return [
    ...paalRegels,
    ...sjorRegels,
    tuien ? `${tuien} × tui` : null,
    haringen ? `${haringen} × haring` : null,
    ...(model.extra ?? []),
  ].filter(Boolean);
}
