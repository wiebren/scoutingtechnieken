// Drawings for natuur. See ../plaatjes.js and ./basis.js. Everything is drawn here from the descriptions in the notes
// (TKN §6) and the sources in notities/technieken/natuur-uitwerking.md, so there are no licences to look after.
// Leaves, prints, birds and mushrooms are also used by the pieces in src/doe/natuur/ (the key and the quizzes):
// they import BOMEN, PRENTEN, VOGELS and the helpers below, so a tree looks the same on its card and in a quiz.
import { r1, svg, tekst } from './basis.js';

// -- helpers --------------------------------------------------------------------------------------------------------

const smooth = (a, b, t) => { const x = Math.min(1, Math.max(0, (t - a) / (b - a))); return x * x * (3 - 2 * x); };
const lijn = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`).join('');
const g = (x, y, hoek, inhoud, schaal = 1) => `<g transform="translate(${r1(x)} ${r1(y)})${hoek ? ` rotate(${hoek})` : ''}${schaal !== 1 ? ` scale(${schaal})` : ''}">${inhoud}</g>`;
/** Name in bold and a few short lines under a drawing of `w` wide, starting at y. */
const onder = (w, y, naam, regels = []) => tekst(w / 2, y, naam, { maat: 13, klasse: 'vet' })
  + regels.map((r, i) => tekst(w / 2, y + 16 + i * 14, r, { maat: 10.5, klasse: 'stil' })).join('');
/** A tooth of a saw: rises slowly, drops fast, so it points to the tip. u in [0, 1). */
const zaagtand = (u) => (u < 0.72 ? u / 0.72 : (1 - u) / 0.28);

/**
 * A simple leaf with its base at (0, 0), pointing up. The outline is t^a (1-t)^b along the length, so a small a gives a
 * broad base and a small b a blunt tip. rand: gaaf, golf, zaag, dubbel, karteel, stekel; n teeth per side, diep their
 * size. lob: { n, diep, punt } lobes (an oak). hart: [left, right] how far the base hangs below the stalk (a lime is
 * lopsided). deuk: a notch in the tip (an alder). Returns the path, the midrib and side veins, and the stalk.
 */
export function blad({ lengte: L, breedte: W, a = 0.6, b = 1, rand = 'gaaf', n = 14, diep = 2, lob = null, hart = [0, 0],
  deuk = 0, steel = 0, nerven = 6, klasse = 'blad' }) {
  const tmax = a / (a + b); const norm = tmax ** a * (1 - tmax) ** b;
  const w = (t) => (t <= 0 || t >= 1 ? 0 : (t ** a * (1 - t) ** b) / norm);
  const N = 160;
  const breedteOp = (t) => {
    let hw = (w(t) * W) / 2;
    if (lob) {
      const s = Math.abs(2 * ((lob.n * t + (lob.fase ?? 0.75)) % 1) - 1);
      const gg = lob.punt ? 2 * s - s * s : (1 - Math.cos(Math.PI * s)) / 2;
      hw *= 1 - lob.diep * gg * smooth(0.03, 0.22, t) * (1 - smooth(0.86, 1, t));
    }
    const rust = smooth(0.03, 0.2, t) * (1 - smooth(0.9, 1, t));
    const u = (n * t) % 1;
    if (rand === 'zaag') hw += diep * rust * zaagtand(u);
    else if (rand === 'dubbel') hw += diep * rust * (zaagtand(u) + 0.45 * zaagtand((3 * n * t) % 1));
    else if (rand === 'karteel') hw += diep * rust * Math.sqrt(Math.sin(Math.PI * u));
    else if (rand === 'golf') hw += diep * rust * (0.5 - 0.5 * Math.cos(2 * Math.PI * u));
    else if (rand === 'stekel') {
      const v = (u + 0.5) % 1;
      hw = hw * (0.84 + 0.16 * Math.cos(2 * Math.PI * v)) + diep * rust * Math.max(0, 1 - Math.min(v, 1 - v) / 0.07);
    }
    return hw;
  };
  const yOp = (t, k) => {
    let y = -t * L;
    const h = hart[k > 0 ? 1 : 0];
    if (h) y += h * L * (1 - smooth(0, 0.32, t)) * Math.min(1, w(t) * 1.6);
    if (deuk) y += deuk * L * smooth(0.78, 1, t) * (1 - Math.min(1, w(t) * 1.3));
    return y;
  };
  const rechts = []; const links = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N; const hw = breedteOp(t);
    rechts.push([hw, yOp(t, 1)]); links.push([-hw, yOp(t, -1)]);
  }
  const d = `${lijn([...rechts, ...links.reverse()])}Z`;
  const top = -L * (deuk ? 1 - deuk * 1.1 : 0.96);
  let nerf = `M0 ${steel} V${r1(top)}`;
  for (let i = 1; i <= nerven; i++) {
    const t = 0.08 + (0.8 * i) / (nerven + 1); const hw0 = (w(t) * W) / 2 * (lob ? 0.8 : 0.72);
    const t2 = t + 0.09 + 0.25 * hw0 / L;
    // Stay inside the outline: in a bay between two lobes the leaf is narrower than its outline function.
    const hw = Math.min(hw0, 0.85 * breedteOp(Math.min(t2, 0.99)));
    const y2 = -(t + ((t2 - t) * hw) / hw0) * L;
    nerf += `M0 ${r1(-t * L)} L${r1(hw)} ${r1(y2)}M0 ${r1(-t * L)} L${r1(-hw)} ${r1(y2)}`;
  }
  return `<path d="${d}" class="${klasse}"/><path d="${nerf}" class="nerf nt-nerf"/>`;
}

/**
 * A leaf with lobes like a hand (a maple, a plane), its stalk attaching at (0, 0). lobben: [[angle, length, width]]
 * for the right half and the middle (degrees clockwise from up, lengths as part of r); they are mirrored. A soft
 * maximum (p) rounds the bays between the lobes: a high p makes them sharp.
 */
export function handBlad({ r: R, lobben, p = 7, rmin = 0.3, tand = 0, tn = 0, voet = 140, steel = 0, klasse = 'blad' }) {
  const alle = lobben.flatMap(([a, l, b]) => (a === 0 ? [[a, l, b]] : [[a, l, b], [-a, l, b]]));
  const r = (th) => {
    let som = (rmin * (1 - smooth(voet, 180, Math.abs(th)))) ** p;
    for (const [a, l, b] of alle) {
      const d = Math.abs(th - a);
      if (d < b) som += (l * (1 - d / b) ** 0.75) ** p;
    }
    let rr = som ** (1 / p);
    if (tand) rr *= 1 + tand * zaagtand(((th + 180) * tn / 360) % 1) * smooth(0.15, 0.4, rr);
    return rr * R;
  };
  const pts = [];
  for (let i = 1; i < 360; i++) {
    const th = -180 + i; const rr = r(th); const rad = (th * Math.PI) / 180;
    pts.push([rr * Math.sin(rad), -rr * Math.cos(rad)]);
  }
  let nerf = `M0 ${steel} V0`;
  for (const [a, l] of alle) {
    const rad = (a * Math.PI) / 180;
    nerf += `M0 0 L${r1(0.9 * l * R * Math.sin(rad))} ${r1(-0.9 * l * R * Math.cos(rad))}`;
  }
  return `<path d="M0 0${lijn(pts).replace('M', 'L')}Z" class="${klasse}"/><path d="${nerf}" class="nerf nt-nerf"/>`;
}

/** A feather-like compound leaf: a stalk with pairs of leaflets and one at the end. */
function geveerd({ paren, blaadje, lengte, hoek = 58, eind = true, steel = 20 }) {
  let uit = `<path d="M0 ${steel} V${-lengte}" class="nerf"/>`;
  for (let i = 0; i < paren; i++) {
    const y = -lengte * (0.08 + (0.86 * i) / paren);
    uit += g(0, y, hoek, blad(blaadje)) + g(0, y, -hoek, blad(blaadje));
  }
  if (eind) uit += g(0, -lengte, 0, blad(blaadje));
  return uit;
}

/** Leaflets like the fingers of a hand, from one point (horse chestnut). */
function handSamengesteld({ blaadjes, steel = 40 }) {
  let uit = `<path d="M0 ${steel} V0" class="nerf"/>`;
  for (const [hoek, opties] of blaadjes) uit += g(0, 0, hoek, blad({ ...opties, steel: 0 }));
  return uit;
}

// -- needles, cones and fruit -------------------------------------------------------------------------------------

/** A twig from (0, 0) to (len, 0) with needles along it; soort: den, spar, lariks, douglas, taxus. */
function naaldtak(soort, len = 200) {
  let uit = `<path d="M0 0 L${len} 0" class="nt-tak"/>`;
  const naald = (x, hoek, l, klasse = 'nt-naald') => {
    const rad = (hoek * Math.PI) / 180; const ex = x + l * Math.cos(rad); const ey = l * Math.sin(rad);
    const mx = x + 0.5 * l * Math.cos(rad) + 1.5 * Math.sign(hoek); const my = 0.5 * l * Math.sin(rad);
    return `<path d="M${r1(x)} 0 Q${r1(mx)} ${r1(my)} ${r1(ex)} ${r1(ey)}" class="${klasse}"/>`;
  };
  if (soort === 'den') {
    for (let x = 6, i = 0; x < len - 4; x += 13, i++) {
      const k = i % 2 ? 1 : -1;
      uit += naald(x, k * 30, 58) + naald(x, k * 46, 54);
    }
  } else if (soort === 'spar') {
    for (let x = 4; x < len - 2; x += 4) uit += naald(x, -52, 15) + naald(x, 52, 15);
    for (let x = 8; x < len - 4; x += 9) uit += naald(x, -20, 9, 'nt-naald dun');
  } else if (soort === 'lariks') {
    for (let x = 14; x < len - 10; x += 34) {
      uit += `<circle cx="${x}" cy="0" r="3.4" class="nt-knop"/>`;
      for (let j = -6; j <= 6; j++) uit += naald(x, -90 + j * 10 + 25, 20);
    }
    for (let x = len - 22; x < len; x += 4) uit += naald(x, -40, 10) + naald(x, 40, 10);
  } else if (soort === 'douglas') {
    for (let x = 4, i = 0; x < len - 2; x += 7, i++) uit += naald(x, -62 - (i % 3) * 6, 22 + (i % 2) * 3) + naald(x + 3, 62 + (i % 3) * 6, 22 + ((i + 1) % 2) * 3);
  } else if (soort === 'taxus') {
    for (let x = 5; x < len - 2; x += 7.5) uit += naald(x, -72, 20, 'nt-naald plat') + naald(x, 72, 20, 'nt-naald plat');
  }
  return uit;
}

/** A cone hanging or standing, its base at (0, 0), lengte along -y. drietand: the bracts of a douglas. */
function kegel(lengte, breedte, { rijen = 9, drietand = false, rond = false } = {}) {
  let uit = ''; let tanden = '';
  const ry = lengte / rijen * 0.75;
  for (let i = rijen - 1; i >= 0; i--) {
    const t = (i + 0.5) / rijen; const y = -t * lengte;
    const bb = breedte * (rond ? Math.sin(Math.PI * t) ** 0.6 : Math.sin(Math.PI * (0.12 + 0.88 * t)) ** 0.7);
    const k = 3; const stap = bb / k;
    for (let j = 0; j < k; j++) {
      const x = -bb / 2 + stap * (j + 0.5) + (i % 2 ? stap / 4 : -stap / 4);
      uit += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(stap * 0.62)}" ry="${r1(ry)}" class="nt-schub"/>`;
      // The bract sticks out from under the scale toward the tip of the cone, its end split in three.
      if (drietand && j !== 1) {
        const y0 = y - ry * 0.4; const y1 = y - ry * 1.5;
        tanden += `<path d="M${r1(x)} ${r1(y0)} V${r1(y1 - ry * 0.25)} M${r1(x - 2.6)} ${r1(y1 - ry * 0.15)} L${r1(x)} ${r1(y1 + ry * 0.35)} L${r1(x + 2.6)} ${r1(y1 - ry * 0.15)}" class="nt-drietand"/>`;
      }
    }
  }
  return `<path d="M0 0 V${r1(-lengte * 0.06)}" class="nt-tak"/>${uit}${tanden}`;
}

const eikel = (dik = false) => (dik
  ? '<ellipse cx="0" cy="12" rx="9" ry="10" class="nt-noot"/><path d="M-11 6 Q0 -2 11 6 V9 H-11Z" class="nt-nap"/>'
  : '<ellipse cx="0" cy="13" rx="7" ry="11" class="nt-noot"/><path d="M-8 5 Q0 -4 8 5 V8 H-8Z" class="nt-nap"/>');

/** Two seeds with a wing each, the wings `hoek` degrees apart (a maple). */
function helikopter(hoek) {
  const vleugel = (rot) => g(0, 0, rot, '<path d="M0 0 C6 -8 12 -30 6 -46 C0 -50 -6 -40 -5 -26 C-4 -14 -4 -6 0 0Z" class="nt-vleugel"/><ellipse cx="0" cy="-4" rx="5" ry="6" class="nt-zaadje"/>');
  return `<path d="M0 0 V24" class="nt-steeltje"/>${vleugel(-hoek / 2)}${vleugel(hoek / 2)}`;
}

/** A hanging catkin from (0, 0) along +y. */
function katje(lengte, { klasse = 'nt-katje', dik = 5 } = {}) {
  let uit = '';
  for (let y = 2; y < lengte; y += dik * 0.9) uit += `<ellipse cx="${r1(Math.sin(y / 9) * 1.5)}" cy="${r1(y)}" rx="${dik}" ry="${r1(dik * 0.8)}" class="${klasse}"/>`;
  return `<path d="M0 -6 V2" class="nt-steeltje"/>${uit}`;
}

/** Berries on short stalks around (0, 0): [[dx, dy]]. */
const bessen = (lijst, r, klasse) => lijst.map(([x, y]) => `<path d="M0 -14 L${x} ${y}" class="nt-steeltje"/>`).join('')
  + lijst.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" class="${klasse}"/><circle cx="${r1(x - r * 0.35)}" cy="${r1(y - r * 0.35)}" r="${r1(r * 0.25)}" class="nt-glans"/>`).join('');

/** A spiny husk: count spines, length of a spine; open shows nuts inside. */
function bolster(r, { stekels = 40, lang = 6, klasse = 'nt-bolster', dun = false } = {}) {
  let uit = '';
  for (let i = 0; i < stekels; i++) {
    const a = (i / stekels) * 2 * Math.PI; const r0 = r - 1;
    uit += `<path d="M${r1(r0 * Math.sin(a))} ${r1(-r0 * Math.cos(a))} L${r1((r + lang) * Math.sin(a + 0.05))} ${r1(-(r + lang) * Math.cos(a + 0.05))}" class="nt-stekel${dun ? ' dun' : ''}"/>`;
  }
  return `${uit}<circle cx="0" cy="0" r="${r}" class="${klasse}"/>`;
}

// -- trees ----------------------------------------------------------------------------------------------------------

/**
 * The trees of TKN §6.1 (zomer- and wintereik are drawn together as 'eiken' in ../plaatjes.js). blad: the leaf at
 * the origin, its base at (0, 0); vak: the box around it (for an icon); vrucht: fruit, cone or twig at the origin;
 * regels: what to look at, under the drawing.
 */
export const BOMEN = {
  zomereik: {
    naam: 'Zomereik', vak: [-42, -128, 84, 136],
    blad: () => blad({ lengte: 120, breedte: 66, a: 0.85, b: 0.9, lob: { n: 4.5, diep: 0.45 }, hart: [0.07, 0.07], steel: 4, nerven: 4 }),
    vrucht: () => '<path d="M0 -30 V10" class="nt-steeltje"/>' + g(-6, 10, 15, eikel()) + g(6, 10, -15, eikel()),
    regels: ['blad bijna zonder steel, met oortjes', 'eikels aan een lange steel'],
  },
  wintereik: {
    naam: 'Wintereik', vak: [-40, -120, 80, 150],
    blad: () => blad({ lengte: 104, breedte: 60, a: 0.8, b: 0.9, lob: { n: 5, diep: 0.32 }, steel: 22, nerven: 5 }),
    vrucht: () => '<path d="M0 -10 V2" class="nt-steeltje"/>' + g(-6, 0, 25, eikel()) + g(6, 0, -25, eikel()) + g(0, 8, 0, eikel()),
    regels: ['blad met een steel', 'eikels zonder steel'],
  },
  'amerikaanse-eik': {
    naam: 'Amerikaanse eik', vak: [-62, -175, 124, 200],
    blad: () => blad({ lengte: 160, breedte: 120, a: 0.75, b: 0.8, lob: { n: 3.6, diep: 0.62, punt: true, fase: 0.9 }, steel: 22, nerven: 4 }),
    vrucht: () => g(-10, 0, 10, eikel(true)) + g(14, 0, -10, eikel(true)) + '<path d="M2 -16 V-4" class="nt-steeltje"/>',
    regels: ['lobben met een spitse punt', 'dikke eikel in een plat napje'],
  },
  beuk: {
    naam: 'Beuk', vak: [-45, -130, 90, 152],
    blad: () => blad({ lengte: 120, breedte: 72, a: 0.7, b: 0.85, rand: 'golf', n: 7, diep: 2.5, steel: 14, nerven: 7 }),
    vrucht: () => {
      let uit = '';
      for (const k of [-1, 1]) uit += g(0, 0, k * 32, '<path d="M0 0 C-10 -6 -12 -26 -4 -34 C2 -30 6 -12 0 0Z" class="nt-bolster-hout"/>');
      for (const k of [-1, 1]) uit += g(0, 0, k * 90, '<path d="M0 0 C-8 -6 -10 -22 -3 -28 C2 -24 5 -10 0 0Z" class="nt-bolster-hout"/>');
      uit += '<path d="M-7 -8 L-1 -30 L4 -8Z" class="nt-noot"/><path d="M2 -6 L9 -27 L13 -5Z" class="nt-noot"/>';
      return `<path d="M0 0 V16" class="nt-steeltje"/>${uit}`;
    },
    regels: ['ovaal blad met een golvende rand', 'twee nootjes in een stekelig napje'],
  },
  'ruwe-berk': {
    naam: 'Ruwe berk', vak: [-42, -100, 84, 122],
    blad: () => blad({ lengte: 90, breedte: 70, a: 0.32, b: 1.35, rand: 'dubbel', n: 9, diep: 2.6, steel: 18, nerven: 5 }),
    vrucht: () => stam(-30, 0) + g(2, -30, 8, katje(50, { dik: 3.6 })) + g(20, -34, -6, katje(44, { dik: 3.6 })),
    regels: ['driehoekig, dubbel gezaagd blad', 'witte stam, hangende katjes'],
  },
  'zachte-berk': {
    naam: 'Zachte berk', vak: [-42, -100, 84, 122],
    blad: () => blad({ lengte: 84, breedte: 68, a: 0.45, b: 1.05, rand: 'zaag', n: 10, diep: 2.6, steel: 16, nerven: 5 }),
    vrucht: () => {
      let uit = '<path d="M-40 30 Q0 0 40 -40" class="nt-tak dun"/>';
      for (let i = 0; i < 9; i++) { const x = -34 + i * 8.5; const y = 26 - i * 7.6; uit += `<path d="M${x} ${y} l-3 -5 M${x + 2} ${y - 1} l2 -5" class="nt-haar"/>`; }
      return uit + tekst(0, 46, 'behaarde twijg', { maat: 10, klasse: 'stil' });
    },
    regels: ['blad eironder, minder spits', 'twijgen zacht behaard, niet hangend'],
  },
  'grove-den': {
    naam: 'Grove den', vak: [-20, -110, 210, 130],
    blad: () => g(0, 0, -20, naaldtak('den', 170)),
    vrucht: () => g(0, 0, 160, kegel(46, 26)),
    regels: ['lange naalden, altijd met twee bij elkaar', 'kleine kegel; oranje schors bovenin'],
  },
  fijnspar: {
    naam: 'Fijnspar', vak: [-10, -90, 210, 120],
    blad: () => g(0, 0, -20, naaldtak('spar', 180)),
    vrucht: () => g(0, 0, 180, kegel(96, 30, { rijen: 14 })),
    regels: ['korte, prikkende naalden rondom', 'lange hangende kegel'],
  },
  lariks: {
    naam: 'Lariks', vak: [-10, -90, 210, 120],
    blad: () => g(0, 0, -20, naaldtak('lariks', 180)),
    vrucht: () => `<path d="M-30 20 L30 20" class="nt-tak"/>${g(-12, 18, 0, kegel(26, 22, { rijen: 5, rond: true }))}${g(14, 18, 0, kegel(22, 19, { rijen: 5, rond: true }))}`,
    regels: ['zachte naalden in bosjes', 'in de winter kaal; kleine rechtopstaande kegels'],
  },
  douglasspar: {
    naam: 'Douglasspar', vak: [-10, -90, 210, 120],
    blad: () => g(0, 0, -20, naaldtak('douglas', 180)),
    vrucht: () => g(0, 0, 180, kegel(78, 30, { rijen: 10, drietand: true })),
    regels: ['zachte naalden, ruiken naar citroen', 'kegel met drietandjes tussen de schubben'],
  },
  'gewone-es': {
    naam: 'Gewone es', vak: [-100, -200, 200, 228],
    blad: () => geveerd({ paren: 4, lengte: 150, hoek: 62, steel: 20, blaadje: { lengte: 64, breedte: 22, a: 0.7, b: 1.1, rand: 'zaag', n: 12, diep: 1.4, nerven: 3 } }),
    vrucht: () => {
      let uit = '<path d="M0 -20 V0" class="nt-steeltje"/>';
      for (const [hoek, l] of [[-28, 40], [-10, 46], [8, 44], [26, 38]]) uit += g(0, 0, 180 + hoek, `<path d="M0 0 C5 -10 5 -${l - 8} 0 -${l} C-5 -${l - 8} -4 -10 0 0Z" class="nt-vleugel"/><ellipse cx="0" cy="-5" rx="2.6" ry="6" class="nt-zaadje"/>`);
      return uit + '<path d="M-30 -48 V-30" class="nt-tak dun"/><path d="M-34 -48 q4 -10 8 0 z" class="nt-zwarteknop"/>';
    },
    regels: ['geveerd blad, blaadjes tegenover elkaar', 'zwarte knoppen, zaadjes met één vleugel'],
  },
  'gewone-esdoorn': {
    naam: 'Gewone esdoorn', vak: [-82, -105, 164, 140],
    blad: () => handBlad({ r: 82, lobben: [[0, 1, 34], [52, 0.92, 32], [108, 0.56, 30]], p: 6, rmin: 0.4, tand: 0.07, tn: 46, steel: 30 }),
    vrucht: () => helikopter(70),
    regels: ['blad als een hand met vijf lobben', 'helikoptertjes in een V'],
  },
  'noorse-esdoorn': {
    naam: 'Noorse esdoorn', vak: [-82, -105, 164, 140],
    blad: () => handBlad({ r: 80, lobben: [[0, 1, 22], [-18, 0.78, 10], [18, 0.78, 10], [54, 0.95, 22], [36, 0.7, 9], [72, 0.72, 9], [110, 0.6, 20], [128, 0.45, 8]], p: 5, rmin: 0.42, steel: 30 }),
    vrucht: () => helikopter(165),
    regels: ['lobben met lange spitse punten; melksap', 'vleugels bijna in een rechte lijn'],
  },
  plataan: {
    naam: 'Plataan', vak: [-88, -100, 176, 130],
    blad: () => handBlad({ r: 86, lobben: [[0, 1, 30], [56, 0.9, 30], [112, 0.5, 30]], p: 9, rmin: 0.55, tand: 0.1, tn: 14, voet: 120, steel: 26 }),
    vrucht: () => `<path d="M0 -40 Q4 0 -2 30 M-2 30 Q-8 44 -12 50" class="nt-steeltje"/>${g(-2, 30, 0, bolster(9, { stekels: 30, lang: 2.5, klasse: 'nt-bolletje', dun: true }))}${g(-13, 52, 0, bolster(8, { stekels: 28, lang: 2.5, klasse: 'nt-bolletje', dun: true }))}`,
    regels: ['blad als een esdoorn, maar om en om', 'schors bladdert af; bolletjes aan een lange steel'],
  },
  linde: {
    naam: 'Linde', vak: [-50, -105, 100, 130],
    blad: () => blad({ lengte: 96, breedte: 86, a: 0.3, b: 1.25, rand: 'zaag', n: 18, diep: 1.6, hart: [0.2, 0.08], steel: 22, nerven: 5 }),
    vrucht: () => g(0, 0, 28, '<path d="M-2 -44 V-36" class="nt-steeltje"/><path d="M-4 -40 C6 -36 8 0 4 22 C0 26 -6 24 -6 18 C-8 -2 -12 -32 -4 -40Z" class="nt-schutblad"/><path d="M-2 -10 Q4 14 10 30 M10 30 l-7 6 M10 30 l1 9 M10 30 l8 4" class="nt-steeltje"/><circle cx="3" cy="37" r="3.6" class="nt-nootje"/><circle cx="11" cy="40" r="3.6" class="nt-nootje"/><circle cx="18" cy="35" r="3.6" class="nt-nootje"/>'),
    regels: ['scheef hartvormig blad', 'nootjes aan een tongvormig schutblad'],
  },
  schietwilg: {
    naam: 'Schietwilg', vak: [-20, -150, 40, 170],
    blad: () => blad({ lengte: 140, breedte: 26, a: 0.8, b: 1.1, rand: 'zaag', n: 26, diep: 0.9, steel: 10, nerven: 8, klasse: 'blad nt-zilver' }),
    vrucht: () => knotwilg(),
    regels: ['lang, smal, zilverig blad', 'langs het water; vaak geknot'],
  },
  populier: {
    naam: 'Populier', vak: [-50, -100, 100, 150],
    blad: () => blad({ lengte: 88, breedte: 92, a: 0.18, b: 1.15, rand: 'karteel', n: 12, diep: 2.2, steel: 42, nerven: 4 }),
    vrucht: () => {
      let uit = g(0, -20, 0, katje(60, { dik: 4.5, klasse: 'nt-katje-groen' }));
      for (const [x, y] of [[-14, 0], [12, 16], [-10, 30], [15, 40], [-16, 48]]) uit += `<path d="M${x} ${y} c-6 -2 -6 -9 0 -9 c2 -5 8 -5 9 0 c6 0 6 7 0 9z" class="nt-pluis"/>`;
      return uit;
    },
    regels: ['driehoekig blad op een lange platte steel', 'in mei en juni pluis als sneeuw'],
  },
  'zwarte-els': {
    naam: 'Zwarte els', vak: [-45, -95, 90, 120],
    blad: () => blad({ lengte: 84, breedte: 76, a: 0.85, b: 0.4, rand: 'dubbel', n: 9, diep: 1.8, deuk: 0.1, steel: 18, nerven: 5 }),
    vrucht: () => `<path d="M0 -36 V-10 M0 -26 L-14 -6 M0 -26 L14 -8" class="nt-steeltje"/>${g(0, -10, 180, kegel(20, 13, { rijen: 4, rond: true }))}${g(-14, -6, 170, kegel(18, 12, { rijen: 4, rond: true }))}${g(14, -8, 190, kegel(19, 12, { rijen: 4, rond: true }))}`,
    regels: ['rond blad met een ingedeukte top', 'kleine houten dennenappeltjes'],
  },
  haagbeuk: {
    naam: 'Haagbeuk', vak: [-40, -115, 80, 135],
    blad: () => blad({ lengte: 104, breedte: 58, a: 0.6, b: 1.2, rand: 'dubbel', n: 15, diep: 2, steel: 10, nerven: 12 }),
    vrucht: () => {
      let uit = '<path d="M0 -40 V24" class="nt-steeltje"/>';
      for (const [y, k] of [[-28, -1], [-18, 1], [-6, -1], [6, 1], [18, -1]]) {
        uit += g(0, y, k * 60, '<path d="M0 0 L-7 -10 L-3 -26 L0 -14 L3 -30 L5 -14 L10 -22 L7 -8Z" class="nt-schutblad"/><ellipse cx="0" cy="-2" rx="3" ry="3.6" class="nt-nootje"/>');
      }
      return uit;
    },
    regels: ['dubbel gezaagd en geplooid blad', 'nootjes aan een blaadje met drie slippen'],
  },
  paardenkastanje: {
    naam: 'Paardenkastanje', vak: [-110, -130, 220, 175],
    blad: () => handSamengesteld({ steel: 42, blaadjes: [[0, 1], [-32, 0.92], [32, 0.92], [-64, 0.76], [64, 0.76], [-96, 0.56], [96, 0.56]].map(([h, s]) => [h, { lengte: 118 * s, breedte: 46 * s, a: 1.5, b: 0.6, rand: 'dubbel', n: 13, diep: 1.6, nerven: 6 }]) }),
    vrucht: () => {
      let uit = '';
      for (const k of [-1, 1]) {
        uit += g(k * 6, 0, k * 26, '<path d="M0 22 C-22 20 -26 -8 -12 -20 L-4 -4 Z" class="nt-bolster"/>');
        for (const [x, y] of [[-20, 6], [-16, -10], [-22, -2]]) uit += `<path d="M${k * x} ${y} l${k * -6} -3" class="nt-stekel"/>`;
      }
      return `${uit}<circle cx="0" cy="2" r="15" class="nt-kastanje"/><ellipse cx="0" cy="10" rx="9" ry="5" class="nt-kastanje-vlek"/>`;
    },
    regels: ['vijf tot zeven blaadjes uit één punt', 'bolster met een paar stekels; niet eetbaar'],
  },
  'tamme-kastanje': {
    naam: 'Tamme kastanje', vak: [-34, -175, 68, 195],
    blad: () => blad({ lengte: 166, breedte: 50, a: 0.85, b: 1, rand: 'zaag', n: 17, diep: 4.4, steel: 16, nerven: 12 }),
    vrucht: () => `${bolster(24, { stekels: 70, lang: 9 })}<path d="M-14 -2 Q-12 -16 0 -18 Q-2 -8 -14 -2Z M14 -2 Q12 -16 0 -18 Q2 -8 14 -2Z" class="nt-kastanje"/><path d="M-12 -2 Q0 -24 12 -2 Q0 6 -12 -2Z" class="nt-kastanje"/>`,
    regels: ['lang blad met puntige tanden', 'bolster vol fijne stekels; wel eetbaar'],
  },
  lijsterbes: {
    naam: 'Lijsterbes', vak: [-88, -170, 176, 200],
    blad: () => geveerd({ paren: 6, lengte: 140, hoek: 70, steel: 20, blaadje: { lengte: 46, breedte: 15, a: 0.8, b: 1, rand: 'zaag', n: 10, diep: 1.2, nerven: 0 } }),
    vrucht: () => bessen([[-20, 6], [-10, -2], [0, 8], [12, -2], [22, 6], [-14, 16], [4, 20], [16, 14], [-4, -8], [8, -10], [-24, -6], [26, -6]], 5.2, 'nt-bes-oranje'),
    regels: ['geveerd blad, bladeren om en om', 'trossen oranjerode bessen'],
  },
  hulst: {
    naam: 'Hulst', vak: [-40, -100, 80, 118],
    blad: () => blad({ lengte: 86, breedte: 54, a: 0.9, b: 0.9, rand: 'stekel', n: 4.5, diep: 9, steel: 8, nerven: 4, klasse: 'blad nt-glanzend' }),
    vrucht: () => bessen([[-8, 0], [6, -4], [0, 10], [12, 8]], 6, 'nt-bes-rood'),
    regels: ['glanzend stekelig blad, altijd groen', 'rode bessen: giftig'],
  },
  taxus: {
    naam: 'Taxus', vak: [-10, -60, 210, 90],
    blad: () => g(0, 0, -15, naaldtak('taxus', 180)),
    vrucht: () => `<path d="M-30 -10 L30 -10" class="nt-tak"/>${[-14, 12].map((x) => `<path d="M${x} -10 V-2" class="nt-steeltje"/><ellipse cx="${x}" cy="7" rx="7" ry="8.5" class="nt-arillus"/><ellipse cx="${x}" cy="13" rx="3" ry="2.4" class="nt-zaad-donker"/>`).join('')}`,
    regels: ['platte donkere naalden in twee rijen', 'rode besjes, geen kegels; giftig'],
  },
  'gewone-vlier': {
    naam: 'Gewone vlier', vak: [-90, -190, 180, 202],
    blad: () => geveerd({ paren: 2, lengte: 118, hoek: 62, steel: 10, blaadje: { lengte: 70, breedte: 30, a: 0.7, b: 1.1, rand: 'zaag', n: 12, diep: 1.5, nerven: 4 } }),
    vrucht: () => {
      let uit = '<path d="M0 30 V0 M0 0 L-26 -14 M0 0 L-10 -18 M0 0 L10 -18 M0 0 L26 -14" class="nt-steeltje"/>';
      for (const [cx, cy] of [[-26, -14], [-10, -18], [10, -18], [26, -14]]) {
        for (let i = 0; i < 7; i++) { const a = (i / 7) * 2 * Math.PI; uit += `<path d="M${cx} ${cy} L${r1(cx + 8 * Math.cos(a))} ${r1(cy - 4 - 4 * Math.sin(a))}" class="nt-steeltje dun"/><circle cx="${r1(cx + 8 * Math.cos(a))}" cy="${r1(cy - 4 - 4 * Math.sin(a))}" r="2.6" class="nt-bes-zwart"/>`; }
      }
      return uit;
    },
    regels: ['geveerd blad, vijf of zeven blaadjes', 'witte schermen, dan zwarte besjes'],
  },
};

/** A bit of white birch bark with black diamonds. */
function stam(x, y) {
  return `<rect x="${x - 8}" y="${y - 30}" width="16" height="70" rx="3" class="nt-berkenstam"/><path d="M${x - 8} ${y - 14} l6 3 l-6 3 Z M${x + 8} ${y + 4} l-7 3 l7 4 Z M${x - 8} ${y + 22} l5 2 l-5 3Z" class="nt-ruit"/>`;
}

/** A pollard willow: a thick trunk with a head of straight rods. */
function knotwilg() {
  let uit = '<path d="M-12 50 L-10 0 Q0 -8 10 0 L12 50Z" class="nt-stam"/>';
  for (let i = -4; i <= 4; i++) uit += `<path d="M${i * 2} -2 Q${i * 6} -30 ${i * 11} -56" class="nt-twijg"/>`;
  return uit;
}

/** The plaatje of a tree: its leaf on the left, its fruit on the right, what to look at underneath. */
function boomPlaat(id, { bladX = 110, bladY = 200, vruchtX = 262, vruchtY = 110, schaal = 1, vs = 1.6 } = {}) {
  const b = BOMEN[id];
  const binnen = g(bladX, bladY, 0, b.blad(), schaal) + g(vruchtX, vruchtY, 0, b.vrucht(), vs);
  return svg(340, 272, `${b.naam}: ${b.regels.join('; ')}`.replace(/"/g, ''), binnen + onder(340, 232, b.naam, b.regels));
}

/** Only the leaf of a tree, in a square: for the key and the quiz. */
export function bladIcoon(id) {
  const b = BOMEN[id];
  const [x, y, w, h] = b.vak; const m = Math.max(w, h) + 12;
  return `<svg class="plaatje nt-icoon" viewBox="${r1(x + w / 2 - m / 2)} ${r1(y + h / 2 - m / 2)} ${m} ${m}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${b.blad()}</svg>`;
}

const BOOM_PLAATJES = {
  'boom-amerikaanse-eik': () => boomPlaat('amerikaanse-eik', { bladY: 198 }),
  'boom-beuk': () => boomPlaat('beuk', { bladY: 190, vruchtY: 120 }),
  'boom-ruwe-berk': () => boomPlaat('ruwe-berk', { bladY: 170, vruchtX: 270, vruchtY: 80 }),
  'boom-zachte-berk': () => boomPlaat('zachte-berk', { bladY: 170, vruchtX: 255, vruchtY: 120, vs: 1.2 }),
  'boom-grove-den': () => boomPlaat('grove-den', { bladX: 20, bladY: 170, vruchtX: 280, vruchtY: 70 }),
  'boom-fijnspar': () => boomPlaat('fijnspar', { bladX: 16, bladY: 170, vruchtX: 290, vruchtY: 50 }),
  'boom-lariks': () => boomPlaat('lariks', { bladX: 16, bladY: 170, vruchtX: 285, vruchtY: 90 }),
  'boom-douglasspar': () => boomPlaat('douglasspar', { bladX: 16, bladY: 170, vruchtX: 290, vruchtY: 56 }),
  'boom-gewone-es': () => boomPlaat('gewone-es', { bladX: 116, bladY: 214, vruchtX: 270, vruchtY: 110 }),
  'boom-gewone-esdoorn': () => boomPlaat('gewone-esdoorn', { bladX: 110, bladY: 150, vruchtX: 270, vruchtY: 120 }),
  'boom-noorse-esdoorn': () => boomPlaat('noorse-esdoorn', { bladX: 110, bladY: 150, vruchtX: 258, vruchtY: 120, vs: 1.4 }),
  'boom-plataan': () => boomPlaat('plataan', { bladX: 110, bladY: 150, vruchtX: 275, vruchtY: 80 }),
  'boom-linde': () => boomPlaat('linde', { bladX: 115, bladY: 170, vruchtX: 265, vruchtY: 110 }),
  'boom-schietwilg': () => boomPlaat('schietwilg', { bladX: 120, bladY: 190, vruchtX: 255, vruchtY: 130 }),
  'boom-populier': () => boomPlaat('populier', { bladX: 115, bladY: 160, vruchtX: 265, vruchtY: 90 }),
  'boom-zwarte-els': () => boomPlaat('zwarte-els', { bladX: 115, bladY: 175, vruchtX: 262, vruchtY: 120 }),
  'boom-haagbeuk': () => boomPlaat('haagbeuk', { bladX: 115, bladY: 190, vruchtX: 262, vruchtY: 120 }),
  'boom-paardenkastanje': () => boomPlaat('paardenkastanje', { bladX: 125, bladY: 160, vruchtX: 286, vruchtY: 160 }),
  'boom-tamme-kastanje': () => boomPlaat('tamme-kastanje', { bladX: 120, bladY: 200, vruchtX: 262, vruchtY: 115 }),
  'boom-lijsterbes': () => boomPlaat('lijsterbes', { bladX: 110, bladY: 212, vruchtX: 272, vruchtY: 110 }),
  'boom-hulst': () => boomPlaat('hulst', { bladX: 120, bladY: 180, vruchtX: 262, vruchtY: 110 }),
  'boom-taxus': () => boomPlaat('taxus', { bladX: 14, bladY: 150, vruchtX: 285, vruchtY: 100 }),
  'boom-gewone-vlier': () => boomPlaat('gewone-vlier', { bladX: 115, bladY: 200, vruchtX: 270, vruchtY: 110 }),
};

/** Words for leaves: simple and compound, the edge, lobes. */
function bladvormen() {
  // naam may be split over two lines with '|'
  const vak = (x, y, inhoud, naam, sub) => {
    const regels = naam.split('|');
    return g(x, y, 0, inhoud) + regels.map((r, i) => tekst(x, y + 30 + i * 13, r, { maat: 10.5, klasse: 'vet' })).join('')
      + tekst(x, y + 31 + regels.length * 13, sub, { maat: 10, klasse: 'stil' });
  };
  let uit = '';
  uit += vak(60, 120, blad({ lengte: 90, breedte: 52, a: 0.7, b: 0.85, steel: 12, nerven: 5 }), 'enkelvoudig, gaaf', 'beuk');
  uit += vak(180, 120, blad({ lengte: 90, breedte: 48, a: 0.6, b: 1.1, rand: 'zaag', n: 14, diep: 2.2, steel: 12, nerven: 5 }), 'gezaagd', 'haagbeuk, linde');
  uit += vak(300, 120, blad({ lengte: 96, breedte: 58, a: 0.75, b: 0.9, lob: { n: 4.5, diep: 0.5 }, steel: 6, nerven: 4 }), 'gelobd', 'eik');
  uit += vak(60, 300, handBlad({ r: 52, lobben: [[0, 1, 34], [52, 0.92, 32], [108, 0.56, 30]], p: 6, rmin: 0.4, tand: 0.07, tn: 40, steel: 16 }), 'handvormig gelobd', 'esdoorn, plataan');
  uit += vak(180, 300, geveerd({ paren: 3, lengte: 84, hoek: 60, steel: 14, blaadje: { lengte: 32, breedte: 13, a: 0.7, b: 1.1, nerven: 0 } }), 'geveerd', 'es, lijsterbes, vlier');
  uit += vak(300, 300, handSamengesteld({ steel: 18, blaadjes: [[0, 1], [-34, 0.9], [34, 0.9], [-68, 0.72], [68, 0.72]].map(([h, s]) => [h, { lengte: 62 * s, breedte: 24 * s, a: 1.5, b: 0.6, nerven: 0 }]) }), 'handvormig|samengesteld', 'paardenkastanje');
  uit += '<path d="M10 182 H350" class="lijn haar"/>';
  return svg(360, 366, 'Bladvormen: enkelvoudig gaaf, gezaagd, gelobd, handvormig gelobd, geveerd en handvormig samengesteld', uit);
}

// -- plants ---------------------------------------------------------------------------------------------------------

/** A stinging nettle: a square stem with toothed leaves in pairs, hanging strings of flowers, the stinging hairs. */
function brandnetel() {
  let uit = '<path d="M120 250 V30" class="nt-stengel"/>';
  for (let i = 0; i < 5; i++) {
    const y = 226 - i * 44; const s = 1 - i * 0.14; const k = i % 2 ? 0 : 6;
    for (const kant of [-1, 1]) {
      uit += g(120, y, kant * (58 + k), blad({ lengte: 82 * s, breedte: 44 * s, a: 0.45, b: 1.15, rand: 'zaag', n: 11, diep: 3 * s, hart: [0.06, 0.06], steel: 16 * s, nerven: 4 }));
      if (i < 4) for (let j = 0; j < 3; j++) uit += `<path d="M${120 + kant * 6} ${y - 4} q${kant * (10 + j * 6)} ${14 + j * 4} ${kant * (6 + j * 7)} ${34 + j * 6}" class="nt-bloemdraad"/>`;
    }
  }
  for (let y = 40; y < 250; y += 9) uit += `<path d="M118 ${y} l-4 -3 M122 ${y + 4} l4 -3" class="nt-brandhaar"/>`;
  // a stinging hair, enlarged
  uit += `<circle cx="282" cy="96" r="54" class="vlak"/><circle cx="282" cy="96" r="54" class="lijn dun"/>
    <path d="M250 136 Q282 128 314 136 L314 150 H250Z" class="nt-huid"/><path d="M276 136 L280 62 L284 62 L288 136Z" class="nt-haar-groot"/>
    <circle cx="282" cy="58" r="5" class="nt-haar-kop"/>`;
  uit += tekst(282, 170, 'brandhaar, uitvergroot:', { maat: 10.5, klasse: 'stil' }) + tekst(282, 184, 'het kopje breekt af', { maat: 10.5, klasse: 'stil' }) + tekst(282, 198, 'en prikt in je huid', { maat: 10.5, klasse: 'stil' });
  return svg(360, 262, 'Grote brandnetel: rechte stengel met getande bladeren in paren, hangende bloemdraden, en een brandhaar uitvergroot', uit);
}

/** Giant hogweed next to a person: 2 to 5 metres, an umbel up to 50 cm, a hollow stem with purple spots. */
function berenklauw() {
  let uit = '<path d="M0 252 H360" class="lijn dun"/>';
  // the plant: about 3.5 m against a person of 1.6 m (40 px per metre)
  uit += '<path d="M150 252 C148 180 152 120 150 112" class="nt-stengel-dik"/>';
  for (let y = 236; y > 120; y -= 13) uit += `<ellipse cx="${150 + ((y * 3) % 5) - 2}" cy="${y}" rx="2.2" ry="3.2" class="nt-paars"/>`;
  for (const [x, y, k, l] of [[150, 232, -1, 62], [150, 214, 1, 66], [150, 184, -1, 50], [150, 160, 1, 44]]) {
    uit += g(x, y, k * 62, `<path d="M0 0 V${-l * 0.35}" class="nt-steel-groen"/>${g(0, -l * 0.35, 0, blad({ lengte: l, breedte: l * 0.7, a: 0.6, b: 1, rand: 'zaag', n: 7, diep: 2.5, lob: { n: 2.5, diep: 0.45, punt: true }, nerven: 3 }))}`);
  }
  // the umbel, 50 cm wide = 20 px... drawn a little larger to see it
  for (let i = -6; i <= 6; i++) {
    const ex = 150 + i * 6; const ey = 82 + Math.abs(i) * 1.6;
    uit += `<path d="M150 112 L${ex} ${ey}" class="nt-steel-groen dun"/>`;
    for (let j = -2; j <= 2; j++) uit += `<circle cx="${r1(ex + j * 2.4)}" cy="${r1(ey - 2 + Math.abs(j) * 0.8)}" r="1.9" class="nt-bloem-wit"/>`;
  }
  // a person of 1.6 m
  uit += '<circle cx="300" cy="197" r="7" class="vol"/><path d="M300 204 V230 M300 230 L292 252 M300 230 L308 252 M300 210 L289 226 M300 210 L311 226" class="lijn dik nt-mens"/>';
  // the measure
  uit += '<path d="M66 252 V112 M60 252 H72 M60 112 H72" class="lijn dun"/>' + tekst(58, 186, '± 3,5 m', { maat: 10.5, anker: 'end' });
  uit += tekst(316, 214, '1,60 m', { maat: 10.5, anker: 'start', klasse: 'stil' });
  uit += tekst(200, 70, 'scherm tot 50 cm', { maat: 10.5, anker: 'start', klasse: 'stil' }) + tekst(206, 130, 'holle stengel,', { maat: 10.5, anker: 'start', klasse: 'stil' }) + tekst(206, 144, 'paarse vlekken', { maat: 10.5, anker: 'start', klasse: 'stil' }) + '<path d="M204 132 L158 140" class="lijn dun"/>';
  return svg(360, 262, 'Reuzenberenklauw naast een mens: wel 2 tot 5 meter hoog, met een holle stengel met paarse vlekken en een groot wit scherm', uit);
}

/** Daslook and two poisonous look-alikes, side by side. */
function daslook() {
  let uit = '<path d="M0 214 H360" class="lijn haar"/>';
  // daslook: each leaf on its own thin stalk from the ground; a round umbel of white stars
  for (const [x, h, k] of [[44, 120, -14], [64, 132, 6], [82, 112, 20]]) uit += g(x, 214, k, blad({ lengte: h * 0.7, breedte: 30, a: 1, b: 1, steel: 0, nerven: 0 }) .replace('<path d="M0 0', `<path d="M0 ${-h * 0.32}`), 1) + `<path d="M${x} 214 L${r1(x + Math.sin((k * Math.PI) / 180) * h * 0.32)} ${r1(214 - Math.cos((k * Math.PI) / 180) * h * 0.32)}" class="nt-steel-groen"/>`;
  uit += '<path d="M62 214 Q60 140 62 80" class="nt-steel-groen"/>';
  for (let i = 0; i < 9; i++) { const a = -80 + i * 20; const ex = 62 + 18 * Math.sin((a * Math.PI) / 180); const ey = 80 - 14 * Math.cos((a * Math.PI) / 180); uit += `<path d="M62 80 L${r1(ex)} ${r1(ey)}" class="nt-steel-groen dun"/>${ster(ex, ey, 4)}`; }
  uit += onderAan(64, 'Daslook', ['elk blad op een', 'eigen steeltje;', 'ruikt naar knoflook']);
  // lelietje-van-dalen: two leaves wrapped round one stem; white bells on a stalk
  uit += g(180, 214, -8, blad({ lengte: 130, breedte: 46, a: 0.9, b: 1, steel: 0, nerven: 0, klasse: 'blad nt-glanzend' }));
  uit += g(186, 214, 10, blad({ lengte: 118, breedte: 40, a: 0.9, b: 1, steel: 0, nerven: 0, klasse: 'blad nt-glanzend' }));
  uit += '<path d="M182 214 V196 Q180 200 182 214" class="nt-schede"/><path d="M182 214 Q200 150 214 112" class="nt-steel-groen"/>';
  for (let i = 0; i < 5; i++) { const x = 205 + i * 2.2; const y = 128 + i * 15; uit += `<path d="M${x} ${y} q6 2 8 8" class="nt-steel-groen dun"/><path d="M${x + 4} ${y + 8} q4 -4 8 0 v4 q-4 3 -8 0z" class="nt-bloem-wit"/>`; }
  uit += onderAan(184, 'Lelietje-van-dalen', ['twee bladeren om', 'één stengel; geen', 'knoflookgeur; giftig']);
  // herfsttijloos: a tuft of glossy leaves without stalks (spring); the purple flower comes in autumn
  for (const [k, l] of [[-16, 110], [-6, 128], [5, 124], [15, 104]]) uit += g(300, 214, k, blad({ lengte: l, breedte: 26, a: 0.5, b: 0.9, steel: 0, nerven: 0, klasse: 'blad nt-glanzend' }));
  uit += onderAan(298, 'Herfsttijloos', ['bladeren in een', 'bundel, zonder', 'steel; zeer giftig']);
  return svg(360, 276, 'Daslook naast lelietje-van-dalen en herfsttijloos: drie planten die op elkaar lijken', uit);
}
const ster = (x, y, r) => {
  let d = '';
  for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; const rr = i % 2 ? r * 0.4 : r; d += `${i ? 'L' : 'M'}${r1(x + rr * Math.sin(a))} ${r1(y - rr * Math.cos(a))}`; }
  return `<path d="${d}Z" class="nt-bloem-wit"/>`;
};
const onderAan = (x, naam, regels) => tekst(x, 232, naam, { maat: 11.5, klasse: 'vet' }) + regels.map((r, i) => tekst(x, 246 + i * 12, r, { maat: 9.5, klasse: 'stil' })).join('');

/** Four poisonous plants in small: foxglove, cuckoo-pint berries, bittersweet, autumn crocus. */
function giftigePlanten() {
  let uit = '<path d="M0 200 H360" class="lijn haar"/>';
  // vingerhoedskruid
  uit += '<path d="M45 200 V40" class="nt-steel-groen"/>';
  for (let i = 0; i < 9; i++) { const y = 52 + i * 15; const k = i % 2 ? 1 : -1; uit += g(45 + k * 3, y, k * 100, '<path d="M0 0 L4 -2 L22 -6 Q26 0 22 6 L4 2Z" class="nt-paarsbloem"/>'); }
  uit += g(45, 200, -50, blad({ lengte: 54, breedte: 20, a: 0.8, b: 1, nerven: 0 })) + g(45, 200, 50, blad({ lengte: 54, breedte: 20, a: 0.8, b: 1, nerven: 0 }));
  uit += onderAan2(45, 'Vingerhoeds-|kruid');
  // gevlekte aronskelk: a club of red berries
  uit += '<path d="M135 200 V112" class="nt-steel-groen"/>';
  for (let i = 0; i < 18; i++) { const x = 135 + ((i % 3) - 1) * 6.5 + (Math.floor(i / 3) % 2) * 3 - 1.5; const y = 72 + Math.floor(i / 3) * 7.5; uit += `<circle cx="${r1(x)}" cy="${y}" r="4" class="nt-bes-rood"/>`; }
  uit += '<path d="M133 200 Q128 190 122 182" class="nt-steel-groen"/>' + g(122, 182, -25, blad({ lengte: 62, breedte: 36, a: 0.25, b: 1.1, hart: [0.22, 0.22], nerven: 0 }));
  uit += onderAan2(135, 'Gevlekte|aronskelk');
  // bitterzoet: purple stars with a yellow cone, red berries
  uit += '<path d="M200 200 C210 150 240 120 262 70" class="nt-steel-groen"/>';
  for (const [x, y] of [[226, 120], [246, 98]]) uit += bloemStertje(x, y);
  uit += g(258, 110, 0, bessen([[-6, 6], [4, 12], [12, 4]], 4.4, 'nt-bes-rood'));
  uit += g(214, 160, 70, blad({ lengte: 40, breedte: 20, a: 0.4, b: 1, nerven: 0 }));
  uit += onderAan2(232, 'Bitterzoet');
  // herfsttijloos in autumn: a purple flower without leaves
  uit += '<path d="M320 200 V140" class="nt-bloemsteel"/>';
  for (const k of [-1, 0, 1]) uit += g(320, 144, k * 16, '<path d="M0 0 C-10 -14 -8 -44 0 -52 C8 -44 10 -14 0 0Z" class="nt-paarsbloem"/>');
  uit += onderAan2(320, 'Herfsttijloos');
  return svg(360, 246, 'Vier giftige planten: vingerhoedskruid, gevlekte aronskelk, bitterzoet en herfsttijloos', uit);
}
const onderAan2 = (x, naam) => naam.split('|').map((r, i) => tekst(x, 218 + i * 13, r, { maat: 10.5, klasse: 'vet' })).join('');
const bloemStertje = (x, y) => {
  let d = '';
  for (let i = 0; i < 5; i++) { const a = (i * 2 * Math.PI) / 5; d += `M${x} ${y} L${r1(x + 9 * Math.sin(a - 0.3))} ${r1(y - 9 * Math.cos(a - 0.3))} L${r1(x + 9 * Math.sin(a + 0.3))} ${r1(y - 9 * Math.cos(a + 0.3))}Z`; }
  return `<path d="${d}" class="nt-paarsbloem"/><path d="M${x - 2} ${y + 2} L${x} ${y - 6} L${x + 2} ${y + 2}Z" class="nt-geel"/>`;
};

// -- prints ---------------------------------------------------------------------------------------------------------

const teen = (x, y, rx, ry, rot = 0) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}/>`;
const klauw = (x, y, l, rot = 0, b = 3) => `<path d="M${x - b} ${y} L${x} ${y - l} L${x + b} ${y}Z"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}/>`;
const spiegel = (f) => f(1) + f(-1);
const helft = (d) => `<path d="${d}"/><path d="${d}" transform="scale(-1 1)"/>`;

/**
 * Prints of the animals of TKN §6.3, front at the top, drawn in their own units: h is the length of the drawing in
 * those units, cm the real length where a source gives one (natuur-uitwerking.md), so they can be drawn to scale.
 */
export const PRENTEN = {
  vos: {
    naam: 'Vos', h: 94, cm: 5, maat: 'ongeveer 5 cm',
    teken: () => '<path d="M-17 34 Q-20 14 0 10 Q20 14 17 34 Q0 44 -17 34Z"/>'
      + spiegel((k) => teen(k * 10, -14, 8.5, 12) + teen(k * 29, 4, 8, 11, k * 18) + klauw(k * 11, -26, 22, k * 4) + klauw(k * 32, -7, 18, k * 22)),
  },
  hond: {
    naam: 'Hond', h: 80, maat: 'verschilt per hond',
    teken: () => '<path d="M-25 34 Q-28 8 0 2 Q28 8 25 34 Q12 29 0 36 Q-12 29 -25 34Z"/>'
      + spiegel((k) => teen(k * 11, -17, 10, 12.5) + teen(k * 31, -1, 9.5, 12, k * 25) + klauw(k * 12, -29, 11, k * 6, 3.5) + klauw(k * 37, -12, 10, k * 30, 3.5)),
  },
  wolf: {
    naam: 'Wolf', h: 88, cm: 10, maat: 'ongeveer 10 cm',
    teken: () => '<path d="M-22 38 Q-25 10 0 5 Q25 10 22 38 Q10 33 0 40 Q-10 33 -22 38Z"/>'
      + spiegel((k) => teen(k * 10.5, -21, 9.5, 13) + teen(k * 28, -4, 9, 12, k * 15) + klauw(k * 11, -33, 15, k * 4) + klauw(k * 31, -15, 13, k * 18)),
  },
  das: {
    naam: 'Das', h: 80, cm: 5, maat: 'ongeveer 5 cm lang, iets breder',
    teken: () => '<path d="M-31 22 Q-33 0 -12 -2 Q0 4 12 -2 Q33 0 31 22 Q0 34 -31 22Z"/>'
      + [[-30, -12, -22], [-15, -21, -10], [0, -24, 0], [15, -21, 10], [30, -12, 22]].map(([x, y, r]) => teen(x, y, 6.5, 8.5, r) + klauw(x, y - 7, 22, r, 2.6)).join(''),
  },
  ree: {
    naam: 'Ree', h: 76, cm: 4.5, maat: 'tot 4,5 cm',
    teken: () => helft('M2 -38 C20 -26 24 4 19 28 Q12 38 3 33 Z'),
  },
  edelhert: {
    naam: 'Edelhert', h: 80, cm: 12, maat: 'tot 12 cm',
    teken: () => helft('M2 -40 C24 -30 30 6 25 30 Q15 40 3 35 Z'),
  },
  'wild-zwijn': {
    naam: 'Wild zwijn', h: 76, cm: 12, maat: 'tot 12 cm, met de bijhoeven',
    teken: () => helft('M2 -34 C15 -28 19 -4 16 14 Q10 22 3 18 Z') + spiegel((k) => teen(k * 22, 32, 6, 9, k * -10)),
  },
  haas: {
    naam: 'Haas', h: 76, cm: 4, maat: 'ongeveer 4 cm',
    teken: () => '<path d="M0 -38 C16 -38 18 -10 15 14 C13 32 6 38 0 38 C-6 38 -13 32 -15 14 C-18 -10 -16 -38 0 -38Z" class="nt-harig"/>'
      + teen(-8, -26, 4.5, 7) + teen(-2.5, -31, 4.5, 7) + teen(3, -31, 4.5, 7) + teen(8.5, -26, 4.5, 7),
  },
  konijn: {
    naam: 'Konijn', h: 70, cm: 2.5, maat: 'ongeveer 2½ cm',
    teken: () => '<path d="M0 -35 C15 -35 17 -10 14 12 C12 28 6 35 0 35 C-6 35 -12 28 -14 12 C-17 -10 -15 -35 0 -35Z" class="nt-harig"/>'
      + teen(-8, -23, 4.5, 7) + teen(-2.5, -28, 4.5, 7) + teen(3, -28, 4.5, 7) + teen(8.5, -23, 4.5, 7),
  },
  eekhoorn: {
    naam: 'Eekhoorn', h: 80, maat: 'achterpoot vijf lange tenen',
    teken: () => '<path d="M-14 20 Q-16 4 0 0 Q16 4 14 20 Q0 30 -14 20Z"/><ellipse cx="0" cy="34" rx="7" ry="5"/>'
      + [[-26, -2, -38], [-13, -20, -14], [0, -26, 0], [13, -20, 14], [24, 4, 50]].map(([x, y, r]) => teen(x, y, 3.6, 11, r) + klauw(x + Math.sin((r * Math.PI) / 180) * 12, y - Math.cos((r * Math.PI) / 180) * 12, 7, r, 1.6)).join(''),
  },
  egel: {
    naam: 'Egel', h: 70, maat: 'klein, als een handje',
    teken: () => '<path d="M-16 20 Q-20 0 0 -2 Q20 0 16 20 Q0 32 -16 20Z"/>'
      + [[-24, -2, -40], [-12, -18, -14], [0, -22, 0], [12, -18, 14], [24, -2, 40]].map(([x, y, r]) => teen(x, y, 5, 8, r) + klauw(x + Math.sin((r * Math.PI) / 180) * 8, y - Math.cos((r * Math.PI) / 180) * 8, 6, r, 2)).join(''),
  },
  marter: {
    naam: 'Marter', h: 74, maat: 'vijf tenen met nagels',
    teken: () => '<path d="M-20 26 Q-24 6 -8 4 L0 10 L8 4 Q24 6 20 26 Q0 34 -20 26Z"/>'
      + [[-27, -2, -30, 5], [-13, -16, -10, 6], [0, -20, 0, 6], [13, -16, 10, 6], [27, -2, 30, 6]].map(([x, y, r, s]) => teen(x, y, s, s * 1.3, r) + klauw(x + Math.sin((r * Math.PI) / 180) * 8, y - Math.cos((r * Math.PI) / 180) * 8, 9, r, 2)).join(''),
  },
};

/** One print, centred at (x, y): `hoog` px for its drawing (or k px per cm, when it has a size). */
export function prent(id, x, y, { hoog = 80, perCm = 0 } = {}) {
  const p = PRENTEN[id];
  const schaal = perCm && p.cm ? (p.cm * perCm) / p.h : hoog / p.h;
  return `<g class="nt-prent" transform="translate(${r1(x)} ${r1(y)}) scale(${r1(schaal * 1000) / 1000})">${p.teken()}</g>`;
}

/** A print on its own, for the quiz: a patch of mud with the print. */
export function prentIcoon(id) {
  // A haas and a konijn only differ in size: show them next to a matchbox (2½ by 4 cm), to scale.
  const binnen = id === 'haas' || id === 'konijn'
    ? `<rect x="12" y="24" width="45" height="72" rx="3" class="nt-doosje"/>${prent(id, 84, 60, { perCm: 18 })}`
    : prent(id, 60, 60, { hoog: 88 });
  return `<svg class="plaatje nt-icoon" viewBox="0 0 120 120" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="116" height="116" rx="14" class="nt-modder"/>${binnen}</svg>`;
}

const modder = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" class="nt-modder"/>`;
const cmBalk = (x, y, perCm, cm) => {
  let uit = `<path d="M${x} ${y} H${x + perCm * cm}" class="lijn"/>`;
  for (let i = 0; i <= cm; i++) uit += `<path d="M${x + i * perCm} ${y - (i % 5 ? 3 : 6)} V${y}" class="lijn dun"/>`;
  return uit + tekst(x + perCm * cm + 6, y + 4, `${cm} cm`, { maat: 10, anker: 'start', klasse: 'stil' });
};

/** All prints with a known size, to scale. */
function prenten() {
  const k = 9;
  let uit = modder(6, 6, 348, 288);
  const rij = (y, dy, ids, xs) => ids.map((id, i) => prent(id, xs[i], y, { perCm: k }) + tekst(xs[i], y + dy, PRENTEN[id].naam, { maat: 11, klasse: 'vet' })).join('');
  uit += rij(54, 44, ['konijn', 'haas', 'ree', 'vos', 'das'], [36, 96, 160, 232, 306]);
  uit += rij(172, 66, ['wolf', 'edelhert', 'wild-zwijn'], [64, 176, 290]);
  uit += cmBalk(18, 278, k, 10);
  return svg(360, 300, 'Pootafdrukken op ware verhouding: konijn, haas, ree, vos, das, wolf, edelhert en wild zwijn', uit);
}

/** Vos and hond side by side: the X between the pads, and the track: a line or a zigzag. */
function prentVos() {
  let uit = modder(6, 6, 348, 250);
  uit += prent('vos', 90, 82, { hoog: 108 }) + prent('hond', 270, 82, { hoog: 96 });
  uit += '<path d="M66 50 L114 112 M114 50 L66 112" class="nt-kruis"/>';
  uit += tekst(90, 156, 'Vos: smal, druppelvorm', { maat: 11, klasse: 'vet' }) + tekst(90, 170, 'er past een X tussen', { maat: 10, klasse: 'stil' });
  uit += tekst(270, 156, 'Hond: rond, als een wolkje', { maat: 11, klasse: 'vet' }) + tekst(270, 170, 'tenen dicht op het kussen', { maat: 10, klasse: 'stil' });
  for (let i = 0; i < 6; i++) uit += prent('vos', 30 + i * 22, 214, { hoog: 14 });
  for (let i = 0; i < 6; i++) uit += prent('hond', 214 + i * 22, 206 + (i % 2) * 18 + Math.sin(i) * 3, { hoog: 13 });
  uit += tekst(90, 244, 'een lijn: rechtdoor', { maat: 10, klasse: 'stil' }) + tekst(270, 244, 'zigzag: snuffelt rond', { maat: 10, klasse: 'stil' });
  return svg(360, 262, 'Prent van een vos naast die van een hond, en hun sporen: de vos in een rechte lijn, de hond zigzag', uit);
}

/** A print large, with what to look at, in a patch of mud. */
function prentGroot(id, regels, extra = '') {
  const p = PRENTEN[id];
  return svg(300, 230, `Prent van een ${p.naam.toLowerCase()}: ${regels.join(', ')}`,
    modder(6, 6, 288, 218) + prent(id, 150, 92, { hoog: 128 }) + extra
    + tekst(150, 188, `${p.naam}: ${p.maat}`, { maat: 12, klasse: 'vet' }) + regels.map((r, i) => tekst(150, 204 + i * 13, r, { maat: 10, klasse: 'stil' })).join(''));
}

/** Ree, edelhert and wild zwijn to scale: two halves of a hoof, and the dew claws of a boar. */
function prentHoeven() {
  const k = 11;
  let uit = modder(6, 6, 348, 246);
  uit += prent('ree', 62, 100, { perCm: k }) + prent('edelhert', 178, 100, { perCm: k }) + prent('wild-zwijn', 296, 100, { perCm: k });
  uit += tekst(62, 178, 'Ree', { maat: 11.5, klasse: 'vet' }) + tekst(62, 192, 'smal en spits', { maat: 10, klasse: 'stil' }) + tekst(62, 205, 'tot 4,5 cm', { maat: 10, klasse: 'stil' });
  uit += tekst(178, 178, 'Edelhert', { maat: 11.5, klasse: 'vet' }) + tekst(178, 192, 'groter, ronder', { maat: 10, klasse: 'stil' }) + tekst(178, 205, 'tot 12 cm', { maat: 10, klasse: 'stil' });
  uit += tekst(296, 178, 'Wild zwijn', { maat: 11.5, klasse: 'vet' }) + tekst(296, 192, 'bijhoeven breder', { maat: 10, klasse: 'stil' }) + tekst(296, 205, 'dan de hoef', { maat: 10, klasse: 'stil' });
  uit += cmBalk(20, 236, k, 5);
  return svg(360, 258, 'Hoefprenten op ware verhouding: ree, edelhert en wild zwijn met zijn bijhoeven', uit);
}

/** Haas and konijn with a matchbox, and the Y the hopping leaves. */
function prentHaas() {
  const k = 16;
  let uit = modder(6, 6, 348, 250);
  uit += `<rect x="20" y="30" width="${2.5 * k}" height="${4 * k}" rx="3" class="nt-doosje"/>` + tekst(40, 108, 'luciferdoosje', { maat: 9.5, klasse: 'stil' });
  uit += prent('haas', 100, 62, { perCm: k }) + prent('konijn', 168, 72, { perCm: k });
  uit += tekst(100, 116, 'Haas', { maat: 10.5, klasse: 'vet' }) + tekst(100, 130, '4 cm', { maat: 10, klasse: 'stil' }) + tekst(168, 116, 'Konijn', { maat: 10.5, klasse: 'vet' }) + tekst(168, 130, '2½ cm', { maat: 10, klasse: 'stil' });
  // the hop: two hind feet ahead side by side, two front feet behind one after the other
  const sprong = (x, y) => prent('haas', x - 9, y, { hoog: 26 }) + prent('haas', x + 9, y, { hoog: 26 }) + prent('konijn', x, y + 34, { hoog: 15 }) + prent('konijn', x - 1, y + 54, { hoog: 15 });
  uit += sprong(268, 30) + sprong(268, 130);
  uit += '<path d="M318 210 V40 M312 52 L318 40 L324 52" class="lijn"/>';
  uit += tekst(130, 170, 'De achterpoten komen', { maat: 10.5, klasse: 'stil' }) + tekst(130, 184, 'vóór de voorpoten neer:', { maat: 10.5, klasse: 'stil' }) + tekst(130, 198, 'een Y, de open kant', { maat: 10.5, klasse: 'stil' }) + tekst(130, 212, 'wijst waar hij heen ging', { maat: 10.5, klasse: 'stil' });
  return svg(360, 262, 'Prent van een haas en een konijn naast een luciferdoosje, en het spoor van huppen: twee grote prenten naast elkaar voor twee kleine', uit);
}

/** The eekhoorn: front foot four toes, hind foot five, landing in fours. */
function prentEekhoorn() {
  let uit = modder(6, 6, 348, 230);
  // the front foot: four toes (about 40 units long)
  const voor = (x, y, schaal) => `<g class="nt-prent" transform="translate(${r1(x)} ${r1(y)}) scale(${schaal})"><path d="M-12 16 Q-14 2 0 0 Q14 2 12 16 Q0 24 -12 16Z"/>`
    + [[-18, -6, -30], [-7, -18, -8], [7, -18, 8], [18, -6, 30]].map(([tx, ty, r]) => teen(tx, ty, 3.6, 8, r)).join('') + '</g>';
  uit += prent('eekhoorn', 90, 90, { hoog: 120 });
  uit += voor(200, 104, 0.9);
  uit += tekst(90, 176, 'achterpoot: vijf tenen', { maat: 10.5, klasse: 'stil' }) + tekst(200, 176, 'voorpoot: vier', { maat: 10.5, klasse: 'stil' });
  for (const [x, y] of [[300, 60], [300, 150]]) uit += prent('eekhoorn', x - 12, y - 14, { hoog: 22 }) + prent('eekhoorn', x + 12, y - 14, { hoog: 22 }) + voor(x - 7, y + 12, 0.3) + voor(x + 7, y + 12, 0.3);
  uit += tekst(300, 206, 'sprongen in viertallen', { maat: 10, klasse: 'stil' });
  return svg(360, 242, 'Prenten van een eekhoorn: achterpoot met vijf lange tenen, voorpoot met vier, en het spoor in groepjes van vier', uit);
}

/** Feeding signs: cones gnawed by a squirrel, a mouse and a woodpecker, and hazelnuts. */
function vraatsporen() {
  let uit = '';
  const spil = (x, rafel) => {
    let s = `<path d="M${x - 4} 150 Q${x - 3} 100 ${x - 4} 60 L${x + 4} 60 Q${x + 3} 100 ${x + 4} 150Z" class="nt-spil"/>`;
    for (let y = 66; y < 148; y += 6) s += rafel ? `<path d="M${x - 4} ${y} l${-3 - (y % 4)} ${-2 - (y % 3)} M${x + 4} ${y + 3} l${3 + (y % 5)} -2" class="nt-rafel"/>` : `<path d="M${x - 4} ${y} h8" class="nt-rafel dun"/>`;
    return s + g(x, 56, 0, kegel(18, 18, { rijen: 3, rond: true }));
  };
  uit += g(40, 150, 0, kegel(92, 32, { rijen: 13 })) + tekst(40, 176, 'heel', { maat: 11, klasse: 'vet' });
  uit += spil(120, true) + tekst(120, 176, 'eekhoorn', { maat: 11, klasse: 'vet' }) + tekst(120, 190, 'rafelig', { maat: 10, klasse: 'stil' });
  uit += spil(200, false) + tekst(200, 176, 'muis', { maat: 11, klasse: 'vet' }) + tekst(200, 190, 'netjes kaal', { maat: 10, klasse: 'stil' });
  let sp = g(280, 150, 0, kegel(84, 30, { rijen: 12 }));
  for (let i = 0; i < 9; i++) sp += `<path d="M${270 + (i % 3) * 10} ${74 + i * 8} l${i % 2 ? 10 : -10} -4" class="nt-rafel dik"/>`;
  uit += sp + tekst(280, 176, 'specht', { maat: 11, klasse: 'vet' }) + tekst(280, 190, 'schubben uitgehakt', { maat: 10, klasse: 'stil' });
  // hazelnuts
  uit += '<path d="M64 222 a14 12 0 0 1 28 0 z" class="nt-hazel"/><path d="M98 226 a14 12 0 0 0 28 0 z" class="nt-hazel"/>' + tekst(96, 254, 'eekhoorn: in tweeën', { maat: 10, klasse: 'stil' });
  uit += '<ellipse cx="250" cy="226" rx="15" ry="13" class="nt-hazel"/><circle cx="254" cy="222" r="5" class="nt-gat"/>' + tekst(250, 254, 'muis: rond gaatje', { maat: 10, klasse: 'stil' });
  return svg(330, 264, 'Vraatsporen: een kegel heel, door een eekhoorn rafelig afgeknaagd, door een muis netjes, door een specht uitgehakt; een hazelnoot in tweeën en een met een rond gaatje', uit);
}

// -- birds ----------------------------------------------------------------------------------------------------------

/** The beak of a bird at (sx, sy), facing right. */
function snavelPad(soort, sx, sy) {
  const SNAVELS = {
    dun: `M${sx} ${sy - 2.5} L${sx + 9} ${sy + 0.5} L${sx} ${sy + 2.5}Z`,
    kegel: `M${sx - 1} ${sy - 5} Q${sx + 9} ${sy - 1} ${sx + 9} ${sy + 1} Q${sx + 7} ${sy + 4} ${sx - 1} ${sy + 5}Z`,
    merel: `M${sx} ${sy - 3.5} L${sx + 13} ${sy + 0.5} L${sx} ${sy + 3.5}Z`,
    kraai: `M${sx - 1} ${sy - 6} Q${sx + 12} ${sy - 5} ${sx + 20} ${sy + 1} Q${sx + 10} ${sy + 4} ${sx - 1} ${sy + 5}Z`,
    duif: `M${sx} ${sy - 2} Q${sx + 7} ${sy - 1} ${sx + 8} ${sy + 1.5} L${sx} ${sy + 2.5}Z`,
    haak: `M${sx - 1} ${sy - 5} Q${sx + 10} ${sy - 5} ${sx + 10} ${sy + 4} Q${sx + 6} ${sy + 1} ${sx - 1} ${sy + 4}Z`,
    specht: `M${sx} ${sy - 3.5} L${sx + 17} ${sy} L${sx} ${sy + 3.5}Z`,
    parkiet: `M${sx - 2} ${sy - 6} Q${sx + 10} ${sy - 6} ${sx + 9} ${sy + 6} Q${sx + 4} ${sy + 2} ${sx - 2} ${sy + 5}Z`,
  };
  return SNAVELS[soort];
}

let vogelNr = 0;
/**
 * A perched bird facing right, in a box of 140 by 116, in the colours that tell it apart. kleur: rug, buik, kop, kap,
 * wang, keel, borst, vleugel, streep (wing bars), staart, snavel, oog; vorm: staart length and angle, snavel type,
 * schaal; extra: das (the tie of a great tit), spikkels, nekvlek, nekband, rood (under the tail), rechtop.
 */
function vogel(v) {
  const id = `ntv${++vogelNr}`;
  const s = v.schaal ?? 1;
  const [cx, cy, rx, ry, rot] = [68, 64, 34 * (v.dik ?? 1), 21 * (v.dik ?? 1), v.rechtop ? -58 : -24];
  const kop = v.rechtop ? [92, 22, 14 * (v.kopmaat ?? 1)] : [100, 40, 15 * (v.kopmaat ?? 1)];
  const [kx, ky, kr] = kop;
  const lijfE = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})"/>`;
  let uit = `<defs><clipPath id="${id}l">${lijfE}</clipPath><clipPath id="${id}k"><circle cx="${kx}" cy="${ky}" r="${kr}"/></clipPath></defs>`;
  // tail
  const sl = v.staartLang ?? 34; const sh = v.staartHoek ?? (v.rechtop ? 100 : 145);
  const rad = (sh * Math.PI) / 180; const tx = cx - 22 * Math.cos((rot * Math.PI) / 180); const ty = cy + 6 - 22 * Math.sin((rot * Math.PI) / 180);
  const ex = tx + sl * Math.cos(rad); const ey = ty + sl * Math.sin(rad); const bw = v.staartBreed ?? 7;
  const nx = -Math.sin(rad) * bw; const ny = Math.cos(rad) * bw;
  uit += `<path d="M${r1(tx + nx * 0.6)} ${r1(ty + ny * 0.6)} L${r1(ex + nx)} ${r1(ey + ny)} L${r1(ex - nx)} ${r1(ey - ny)} L${r1(tx - nx * 0.6)} ${r1(ty - ny * 0.6)}Z" fill="${v.staart ?? v.vleugel ?? v.rug}" class="nt-vogellijn"/>`;
  // legs
  const px = cx + 2; const py = v.rechtop ? cy + 22 : cy + 18;
  uit += `<path d="M${px - 4} ${py} L${px - 6} 104 M${px + 5} ${py} L${px + 4} 104 M${px - 12} 104 H${px + 10}" class="nt-poot" stroke="${v.poot ?? '#6b5a4a'}"/>`;
  // body, belly, breast
  uit += `<g>${lijfE.replace('/>', ` fill="${v.rug}" class="nt-vogellijn"/>`)}</g>`;
  uit += `<g clip-path="url(#${id}l)">`;
  if (v.buik) uit += `<ellipse cx="${cx + 10}" cy="${cy + 16}" rx="${rx * 0.95}" ry="${ry * 0.95}" transform="rotate(${rot} ${cx} ${cy})" fill="${v.buik}"/>`;
  if (v.borst) uit += `<ellipse cx="${cx + 26}" cy="${cy + 2}" rx="${rx * 0.5}" ry="${ry * 0.9}" transform="rotate(${rot} ${cx} ${cy})" fill="${v.borst}"/>`;
  if (v.das) uit += `<path d="M${cx + 30} ${cy - 18} Q${cx + 18} ${cy + 6} ${cx} ${cy + 24}" stroke="#141414" stroke-width="8" fill="none"/>`;
  if (v.spikkels) for (let i = 0; i < 26; i++) { const sx = cx - 24 + ((i * 37) % 56); const sy = cy - 8 + ((i * 23) % 30); uit += `<circle cx="${sx}" cy="${sy}" r="${v.spikkels.r ?? 1.6}" fill="${v.spikkels.kleur}"/>`; }
  if (v.rood) uit += `<ellipse cx="${cx - 26}" cy="${cy + 14}" rx="9" ry="7" fill="${v.rood}"/>`;
  uit += '</g>';
  // wing
  if (v.vleugel) {
    const wx = cx - 4; const wy = cy - 2;
    uit += `<path d="M${wx + 26} ${wy - 8} C${wx + 8} ${wy - 18} ${wx - 22} ${wy - 6} ${wx - 32} ${wy + 14} C${wx - 14} ${wy + 14} ${wx + 18} ${wy + 10} ${wx + 26} ${wy - 8}Z" fill="${v.vleugel}" class="nt-vogellijn" transform="rotate(${v.rechtop ? -30 : 0} ${cx} ${cy})"/>`;
    if (v.vlek) uit += `<path d="M${wx + 4} ${wy - 6} l14 -4 l2 8 l-14 4z" fill="${v.vlek}" transform="rotate(${v.rechtop ? -30 : 0} ${cx} ${cy})"/>`;
    for (const [i, kleur] of (v.streep ?? []).entries()) uit += `<path d="M${wx + 8 - i * 7} ${wy - 6 + i * 4} q-6 8 -4 16" stroke="${kleur}" stroke-width="2.6" fill="none" transform="rotate(${v.rechtop ? -30 : 0} ${cx} ${cy})"/>`;
  }
  // neck and head
  uit += `<path d="M${kx - kr * 0.8} ${ky + kr * 0.5} L${cx + 14} ${cy - 2} L${cx + 26} ${cy + 4} L${kx + kr * 0.4} ${ky + kr * 0.9}Z" fill="${v.nek ?? v.kop ?? v.rug}"/>`;
  uit += `<circle cx="${kx}" cy="${ky}" r="${kr}" fill="${v.kop ?? v.rug}" class="nt-vogellijn"/>`;
  uit += `<g clip-path="url(#${id}k)">`;
  if (v.kap) uit += `<ellipse cx="${kx - 2}" cy="${ky - kr * 0.75}" rx="${kr * 1.15}" ry="${kr * 0.72}" fill="${v.kap}"/>`;
  if (v.wang) uit += `<ellipse cx="${kx - 1}" cy="${ky + 3}" rx="${kr * 0.62}" ry="${kr * 0.45}" fill="${v.wang}"/>`;
  if (v.keel) uit += `<ellipse cx="${kx + kr * 0.5}" cy="${ky + kr * 0.85}" rx="${kr * 0.5}" ry="${kr * 0.5}" fill="${v.keel}"/>`;
  if (v.oogstreep) uit += `<path d="M${kx - kr} ${ky - 1} L${kx + kr} ${ky - 3}" stroke="${v.oogstreep}" stroke-width="3"/>`;
  if (v.nekrood) uit += `<ellipse cx="${kx - kr * 0.85}" cy="${ky - 2}" rx="4" ry="6" fill="${v.nekrood}"/>`;
  uit += '</g>';
  if (v.nekband) uit += `<path d="M${r1(kx - kr * 0.95)} ${r1(ky + kr * 0.4)} q${r1(kr * 0.5)} ${r1(kr * 0.75)} ${r1(kr * 1.25)} ${r1(kr * 0.75)}" stroke="${v.nekband}" stroke-width="3" fill="none"/>`;
  if (v.nekvlek) uit += `<ellipse cx="${kx - kr * 0.5}" cy="${ky + kr * 1.05}" rx="5" ry="3" fill="${v.nekvlek}"/>`;
  // eye and beak
  const ox = kx + kr * 0.35; const oy = ky - kr * 0.12;
  uit += `<circle cx="${r1(ox)}" cy="${r1(oy)}" r="${v.oog ? 2.6 : 2.3}" fill="${v.oog ?? '#111'}"/>${v.oog ? `<circle cx="${r1(ox)}" cy="${r1(oy)}" r="1.1" fill="#111"/>` : `<circle cx="${r1(ox + 0.8)}" cy="${r1(oy - 0.8)}" r="0.7" fill="#fff"/>`}`;
  const sx = kx + kr * 0.92; const sy = ky + kr * 0.05;
  uit += `<path d="${snavelPad(v.snavel ?? 'dun', sx, sy)}" fill="${v.snavelKleur ?? '#2a2a2a'}" class="nt-vogellijn"/>`;
  return `<g transform="translate(70 104) scale(${s}) translate(-70 -104)">${uit}</g>`;
}

/** The birds of the Tuinvogeltelling and TKN §6.4, as vogel() draws them. */
export const VOGELS = {
  koolmees: { naam: 'Koolmees', rug: '#7f9150', buik: '#f1cf2f', kop: '#161616', wang: '#ffffff', vleugel: '#6c7f8c', streep: ['#f4f4f4'], staart: '#55646e', das: true, schaal: 0.9 },
  huismus: { naam: 'Huismus', rug: '#9c6a3b', buik: '#cfcac0', kop: '#a9a397', kap: '#7f858c', keel: '#1b1b1b', wang: '#e2ddd2', vleugel: '#7c4e26', streep: ['#f2f0ea'], staart: '#6d5038', snavel: 'kegel', snavelKleur: '#333', schaal: 0.9 },
  pimpelmees: { naam: 'Pimpelmees', rug: '#8ba45a', buik: '#f2d64a', kop: '#ffffff', kap: '#2f7fc6', oogstreep: '#1f2f5e', keel: '#1f2f5e', vleugel: '#3a86c9', streep: ['#f4f4f4'], staart: '#3b7bc0', schaal: 0.8 },
  merel: { naam: 'Merel', rug: '#161616', vleugel: '#1e1e1e', staart: '#111', snavel: 'merel', snavelKleur: '#f19a17', oog: '#e8a817', staartLang: 44, poot: '#3a3330' },
  vink: { naam: 'Vink', rug: '#8c6c50', buik: '#e8b39b', borst: '#d98a6f', kop: '#d98a6f', kap: '#6a88aa', vleugel: '#262626', streep: ['#f5f5f5', '#f5f5f5'], staart: '#2e2e2e', snavel: 'kegel', snavelKleur: '#8d97a3', schaal: 0.9 },
  kauw: { naam: 'Kauw', rug: '#26272b', kop: '#26272b', kap: '#18181b', wang: '#8d9097', nek: '#7d8087', vleugel: '#1e1f23', staart: '#1b1b1f', snavel: 'kraai', snavelKleur: '#151515', oog: '#e9eef2', poot: '#222' },
  houtduif: { naam: 'Houtduif', rug: '#8e97a7', borst: '#b88fa1', kop: '#8792a3', nekvlek: '#ffffff', vleugel: '#7d879a', streep: ['#f4f4f4'], staart: '#5f6676', snavel: 'duif', snavelKleur: '#e6b24a', kopmaat: 0.8, dik: 1.12, poot: '#c4566a' },
  spreeuw: { naam: 'Spreeuw', rug: '#1f1b28', kop: '#1f1b28', vleugel: '#2a2236', staart: '#1a1622', spikkels: { kleur: '#f3f0e6', r: 1.5 }, snavel: 'merel', snavelKleur: '#2d2a2a', staartLang: 24, poot: '#b9707a' },
  ekster: { naam: 'Ekster', rug: '#121212', buik: '#ffffff', kop: '#121212', vleugel: '#121212', vlek: '#ffffff', staart: '#1b3a2a', staartLang: 58, staartHoek: 158, snavel: 'kraai', snavelKleur: '#111', poot: '#222' },
  roodborst: { naam: 'Roodborst', rug: '#7d6b4c', buik: '#e9e4da', borst: '#e5772a', kop: '#7d6b4c', wang: '#e5772a', keel: '#e5772a', vleugel: '#6f5e42', staart: '#6a5a40', schaal: 0.85, dik: 1.08 },
  'turkse-tortel': { naam: 'Turkse tortel', rug: '#cbb6a0', kop: '#d4c2b0', nekband: '#1a1a1a', vleugel: '#b9a28a', staart: '#a89079', staartLang: 44, snavel: 'duif', snavelKleur: '#2a2a2a', kopmaat: 0.8, poot: '#c4566a' },
  'zwarte-kraai': { naam: 'Zwarte kraai', rug: '#141414', kop: '#141414', vleugel: '#1b1b1b', staart: '#111', snavel: 'kraai', snavelKleur: '#0e0e0e', dik: 1.1, poot: '#111' },
  gaai: { naam: 'Gaai (Vlaamse gaai)', rug: '#c3a08f', kop: '#d3b4a4', kap: '#d9d0c8', keel: '#f2ece6', vleugel: '#1d1d1d', vlek: '#3a7fd0', staart: '#141414', snavel: 'merel', snavelKleur: '#222', oogstreep: '#111' },
  winterkoning: { naam: 'Winterkoning', rug: '#8a6440', buik: '#c8a98a', kop: '#8a6440', vleugel: '#7a5634', streep: ['#5a3c22', '#5a3c22'], staart: '#6f4e30', staartLang: 22, staartHoek: 220, staartBreed: 5, schaal: 0.7, oogstreep: '#d9c3a6' },
  'grote-bonte-specht': { naam: 'Grote bonte specht', rug: '#151515', buik: '#ece8e0', kop: '#ffffff', kap: '#151515', wang: '#ffffff', nekrood: '#d3202a', vleugel: '#151515', vlek: '#ffffff', rood: '#d3202a', staart: '#151515', snavel: 'specht', snavelKleur: '#3a3a3a', rechtop: true, staartLang: 30, poot: '#555' },
  boomklever: { naam: 'Boomklever', rug: '#6f86a3', buik: '#e7b88a', kop: '#6f86a3', wang: '#ffffff', oogstreep: '#111', vleugel: '#5e7593', staart: '#5e7593', staartLang: 18, snavel: 'specht', snavelKleur: '#3a3a3a', schaal: 0.85 },
  tjiftjaf: { naam: 'Tjiftjaf', rug: '#8c8e5a', buik: '#ebe7c9', kop: '#8c8e5a', oogstreep: '#e8e2b0', vleugel: '#7c7e4d', staart: '#717346', schaal: 0.7, poot: '#2a2a2a' },
  zanglijster: { naam: 'Zanglijster', rug: '#8a6b46', buik: '#f3e8d0', kop: '#8a6b46', wang: '#e8d9b8', vleugel: '#7a5d3c', staart: '#7a5d3c', spikkels: { kleur: '#4a3420', r: 2 }, snavel: 'merel', snavelKleur: '#5a4a3a' },
  buizerd: { naam: 'Buizerd', rug: '#6b4a2e', buik: '#e9dcc7', borst: '#8a6542', kop: '#6b4a2e', vleugel: '#5a3c24', staart: '#7b5a3a', spikkels: { kleur: '#7a5434', r: 2.2 }, snavel: 'haak', snavelKleur: '#333', rechtop: true, staartLang: 26, dik: 1.15, poot: '#e8c040' },
  heggenmus: { naam: 'Heggenmus', rug: '#8a6440', buik: '#9aa0a8', borst: '#7e8590', kop: '#7e8590', vleugel: '#7a5432', streep: ['#3e2a18'], staart: '#6f4e30', schaal: 0.85 },
  halsbandparkiet: { naam: 'Halsbandparkiet', rug: '#5cb83a', buik: '#8fd66a', kop: '#6cc84a', nekband: '#141414', vleugel: '#4aa52c', staart: '#3f9a2a', staartLang: 54, staartBreed: 4, staartHoek: 140, snavel: 'parkiet', snavelKleur: '#d8262e' },
};

/** A bird on a twig, for the quiz and the cards. */
export function vogelIcoon(id) {
  return `<svg class="plaatje nt-icoon" viewBox="-4 0 152 116" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="-2" y="2" width="148" height="112" rx="14" class="nt-lucht"/><path d="M4 106 Q70 98 140 108" class="nt-tak"/>${vogel(VOGELS[id])}</svg>`;
}

/** The top ten of the Tuinvogeltelling 2026, small, in order. */
function tuinvogels() {
  const top = ['koolmees', 'huismus', 'pimpelmees', 'merel', 'vink', 'kauw', 'houtduif', 'spreeuw', 'ekster', 'roodborst'];
  let uit = '';
  top.forEach((id, i) => {
    const x = (i % 5) * 72 + 2; const y = Math.floor(i / 5) * 118 + 4;
    uit += `<g transform="translate(${x} ${y}) scale(0.48)"><rect x="-2" y="2" width="148" height="112" rx="14" class="nt-lucht"/><path d="M4 106 Q70 98 140 108" class="nt-tak"/>${vogel(VOGELS[id])}</g>`;
    uit += tekst(x + 35, y + 74, `${i + 1}. ${VOGELS[id].naam}`, { maat: 10 });
  });
  return svg(362, 238, 'De top tien van de Tuinvogeltelling 2026: koolmees, huismus, pimpelmees, merel, vink, kauw, houtduif, spreeuw, ekster en roodborst', uit);
}

/** What to look at: size against a sparrow, a blackbird, a pigeon and a crow, and the shape of the bill. */
function vogelsKijken() {
  let uit = '<rect x="2" y="2" width="366" height="132" rx="12" class="nt-lucht"/><path d="M8 130 H362" class="nt-tak dun"/>';
  let x = 8;
  for (const [id, sch, naam] of [['huismus', 0.45, 'mus'], ['merel', 0.6, 'merel'], ['houtduif', 0.78, 'duif'], ['zwarte-kraai', 0.95, 'kraai']]) {
    uit += `<g transform="translate(${r1(x)} ${r1(130 - 108 * sch)}) scale(${sch})">${vogel({ ...VOGELS[id], schaal: 1 })}</g>`;
    uit += tekst(r1(x + 70 * sch), 148, naam, { maat: 11, klasse: 'vet' });
    x += 140 * sch - 8;
  }
  [['dun', 'insecten', 'dun en spits'], ['kegel', 'zaadjes', 'kort en dik'], ['haak', 'vlees', 'een haak'], ['specht', 'hout', 'een beitel']].forEach(([soort, wat, hoe], i) => {
    const cx = 50 + i * 88;
    uit += `<circle cx="${cx - 6}" cy="186" r="14" fill="#8a8d93"/><circle cx="${cx - 1}" cy="182" r="2" fill="#111"/><path d="${snavelPad(soort, cx + 6, 186)}" fill="#3a3a3a"/>`;
    uit += tekst(cx, 220, wat, { maat: 10.5, klasse: 'vet' }) + tekst(cx, 234, hoe, { maat: 10, klasse: 'stil' });
  });
  return svg(370, 244, 'Vogels herkennen: grootte vergeleken met mus, merel, duif en kraai; en de vorm van de snavel', uit);
}

// -- insects, ticks -------------------------------------------------------------------------------------------------

/** A tick from above: eight legs, a small head, the body; vol: fed with blood. */
const teekFig = (vol = false) => {
  let poten = '';
  for (const k of [-1, 1]) for (let i = 0; i < 4; i++) poten += `<path d="M${k * 6} ${-6 + i * 4} q${k * 10} ${-6 + i * 3} ${k * 16} ${-2 + i * 7}" class="nt-teekpoot"/>`;
  return vol
    ? `${poten}<ellipse cx="0" cy="8" rx="15" ry="18" class="nt-teek-vol"/><path d="M-3 -10 L0 -16 L3 -10Z" class="nt-teek-kop"/>`
    : `${poten}<path d="M-3 -12 L0 -18 L3 -12Z" class="nt-teek-kop"/><ellipse cx="0" cy="2" rx="8" ry="11" class="nt-teek-lijf"/><ellipse cx="0" cy="-5" rx="6" ry="5" class="nt-teek-schild"/>`;
};
function teek() {
  let uit = '';
  uit += g(52, 74, 0, teekFig(), 0.35) + tekst(52, 120, 'nimf', { maat: 11, klasse: 'vet' }) + tekst(52, 134, 'als een maanzaadje', { maat: 10, klasse: 'stil' });
  uit += g(150, 74, 0, teekFig(), 1) + tekst(150, 120, 'volwassen', { maat: 11, klasse: 'vet' }) + tekst(150, 134, 'een paar millimeter', { maat: 10, klasse: 'stil' });
  uit += g(258, 66, 0, teekFig(true), 1.2) + tekst(258, 120, 'vol bloed', { maat: 11, klasse: 'vet' }) + tekst(258, 134, 'dik en grijs', { maat: 10, klasse: 'stil' });
  uit += tekst(160, 160, 'acht poten: een spinachtige, geen insect', { maat: 10.5, klasse: 'stil' });
  return svg(320, 172, 'Teken: een nimf zo klein als een maanzaadje, een volwassen teek van een paar millimeter, en een teek vol bloed', uit);
}

/** An insect from the side: abdomen with bands, thorax, head, wings. */
function insect({ lijf, banden, borst, kop, harig = false, lang = 30, taille = false, vleugel = true, poot = '#3a3a3a', pootPunt = null }) {
  let uit = '';
  for (let i = 0; i < 3; i++) {
    const x = -8 + i * 10;
    uit += `<path d="M${x} 6 l${-4 + i * 2} 12 l-3 4" stroke="${poot}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    if (pootPunt) uit += `<path d="M${x - 4 + i * 2} 18 l-3 4" stroke="${pootPunt}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  }
  const ax = -lang / 2 - (taille ? 14 : 10);
  uit += `<ellipse cx="${ax}" cy="2" rx="${lang / 2}" ry="${lang / 3.2}" fill="${lijf}"/>`;
  banden.forEach(([dx, w, kleur]) => { uit += `<path d="M${ax + dx} ${2 - lang / 3.4} q${w / 2} ${lang / 3.4} 0 ${lang / 1.7} h${w} q${w / 2} ${-lang / 3.4} 0 ${-lang / 1.7}z" fill="${kleur}"/>`; });
  uit += `<ellipse cx="${ax}" cy="2" rx="${lang / 2}" ry="${lang / 3.2}" fill="none" class="nt-insectlijn"/>`;
  if (taille) uit += '<path d="M-14 2 H-8" stroke="#222" stroke-width="3"/>';
  uit += `<circle cx="0" cy="0" r="9" fill="${borst}" class="nt-insectlijn"/>`;
  if (harig) for (let a = 0; a < 360; a += 30) { const r = (a * Math.PI) / 180; uit += `<path d="M${r1(9 * Math.cos(r))} ${r1(9 * Math.sin(r))} l${r1(3 * Math.cos(r))} ${r1(3 * Math.sin(r))}" stroke="${borst}" stroke-width="1.2"/>`; }
  uit += `<circle cx="13" cy="1" r="6" fill="${kop}" class="nt-insectlijn"/><path d="M16 -3 q6 -10 12 -10 M15 -4 q3 -10 8 -12" class="nt-spriet"/>`;
  if (vleugel) uit += `<path d="M-2 -6 C-14 -22 -36 -20 -40 -10 C-30 -6 -14 -6 -2 -6Z" class="nt-insectvleugel"/>`;
  return uit;
}
function wespBijHommel() {
  let uit = '';
  uit += g(80, 70, 0, insect({ lijf: '#f2c919', banden: [[2, 4, '#1a1a1a'], [9, 4, '#1a1a1a'], [16, 4, '#1a1a1a']], borst: '#1a1a1a', kop: '#f2c919', taille: true, lang: 30 }), 1.5);
  uit += tekst(70, 132, 'Wesp', { maat: 12, klasse: 'vet' }) + tekst(70, 146, 'glad, fel geel-zwart', { maat: 10, klasse: 'stil' }) + tekst(70, 159, 'smal middel', { maat: 10, klasse: 'stil' });
  uit += g(206, 70, 0, insect({ lijf: '#c98a3a', banden: [[3, 4, '#3a2a1a'], [10, 4, '#3a2a1a'], [17, 4, '#3a2a1a']], borst: '#8a6a40', kop: '#3a2a1a', harig: true, lang: 28 }), 1.35);
  uit += tekst(196, 132, 'Honingbij', { maat: 12, klasse: 'vet' }) + tekst(196, 146, 'bruin met banden', { maat: 10, klasse: 'stil' }) + tekst(196, 159, 'angel blijft achter', { maat: 10, klasse: 'stil' });
  uit += g(326, 70, 0, insect({ lijf: '#1c1c1c', banden: [[2, 6, '#f2d23a'], [16, 8, '#f8f6f0']], borst: '#f2d23a', kop: '#1c1c1c', harig: true, lang: 34 }), 1.4);
  uit += tekst(318, 132, 'Hommel', { maat: 12, klasse: 'vet' }) + tekst(318, 146, 'rond en harig', { maat: 10, klasse: 'stil' }) + tekst(318, 159, 'steekt bijna nooit', { maat: 10, klasse: 'stil' });
  return svg(380, 170, 'Wesp, honingbij en hommel naast elkaar', uit);
}
function hoornaars() {
  let uit = '';
  uit += g(110, 70, 0, insect({ lijf: '#2a2420', banden: [[10, 6, '#e8862a'], [3, 2, '#e8c040']], borst: '#141414', kop: '#e8862a', taille: true, lang: 32, poot: '#2a2420', pootPunt: '#f0d040' }), 1.6);
  uit += tekst(90, 136, 'Aziatische hoornaar', { maat: 12, klasse: 'vet' }) + tekst(90, 150, 'bijna zwart, één brede oranje band', { maat: 10, klasse: 'stil' }) + tekst(90, 163, 'gele punten aan de poten', { maat: 10, klasse: 'stil' });
  uit += g(296, 70, 0, insect({ lijf: '#e8c51e', banden: [[-12, 8, '#6b3a1e'], [4, 3, '#2a1a10'], [12, 3, '#2a1a10']], borst: '#7a2e1a', kop: '#d9a63a', taille: true, lang: 36, poot: '#8a3a1e' }), 1.6);
  uit += tekst(276, 136, 'Europese hoornaar', { maat: 12, klasse: 'vet' }) + tekst(276, 150, 'groter, vooral geel achterlijf', { maat: 10, klasse: 'stil' }) + tekst(276, 163, 'roodbruine poten', { maat: 10, klasse: 'stil' });
  return svg(370, 174, 'Aziatische hoornaar naast de Europese hoornaar', uit);
}
function processierups() {
  let uit = '<path d="M60 250 C66 180 62 100 70 0 L130 0 C124 100 128 180 136 250Z" class="nt-stam"/>';
  for (let y = 20; y < 240; y += 16) uit += `<path d="M${74 + (y % 3) * 6} ${y} q8 6 2 14 M${108 + (y % 4) * 4} ${y + 6} q-6 6 0 12" class="nt-schors"/>`;
  uit += '<path d="M96 70 C70 74 66 120 86 132 C104 140 122 126 120 98 C118 78 110 68 96 70Z" class="nt-spinsel"/>';
  for (let i = 0; i < 9; i++) {
    const t = i / 8; const x = 100 + 200 * t; const y = 210 - 30 * Math.sin(t * 3); const k = i * 1.3;
    uit += g(x - 30 * (i === 0), y, -10 + k, '<ellipse cx="0" cy="0" rx="10" ry="4.5" class="nt-rups"/>' + [-6, -2, 2, 6].map((dx) => `<path d="M${dx} -4 l-2 -5 M${dx} -4 l2 -5" class="nt-rupshaar"/>`).join(''));
  }
  uit += tekst(240, 70, 'nest van spinsel', { maat: 10.5, anker: 'start', klasse: 'stil' }).replace('x="240"', 'x="136"') + '<path d="M134 66 L118 92" class="lijn dun"/>';
  uit += tekst(240, 170, 'rupsen in een rij', { maat: 10.5, klasse: 'stil' });
  return svg(340, 262, 'Eikenprocessierups: een nest van spinsel op de stam van een eik, en rupsen die in een rij achter elkaar lopen', uit);
}

// -- mushrooms ------------------------------------------------------------------------------------------------------

/** A mushroom with a cap, gills, a stem with or without a ring, a bulb or a sac. Parts carry data-deel for the quiz. */
function paddenstoel({ hoed, plaat = '#f6f3ea', steel = '#f3efe4', ring = true, knol = 'knol', stippen = null, breed = 60, hoog = 26, steelH = 70 }) {
  const top = 30; const voet = top + hoog + steelH;
  let uit = `<g data-deel="zwamvlok"><rect x="${-breed}" y="${voet + 8}" width="${breed * 2}" height="30" fill="transparent"/><path d="M${-breed * 0.9} ${voet + 14} q${breed * 0.3} -6 ${breed * 0.5} 2 M${breed * 0.2} ${voet + 16} q${breed * 0.3} 4 ${breed * 0.7} -4 M-10 ${voet + 18} q4 8 -6 14 M10 ${voet + 18} q-2 8 8 12" class="nt-zwamvlok"/></g>`;
  uit += `<g data-deel="steel"><path d="M-9 ${top + hoog} L-11 ${voet - 6} L11 ${voet - 6} L9 ${top + hoog}Z" fill="${steel}" class="nt-padlijn"/></g>`;
  if (knol === 'beurs') uit += `<g data-deel="knol"><path d="M-14 ${voet - 14} C-22 ${voet + 2} -10 ${voet + 12} 0 ${voet + 12} C10 ${voet + 12} 22 ${voet + 2} 14 ${voet - 14} L11 ${voet - 6} C4 ${voet - 2} -4 ${voet - 2} -11 ${voet - 6}Z" fill="${steel}" class="nt-padlijn"/><path d="M-14 ${voet - 14} q-4 -2 -6 4 M14 ${voet - 14} q4 -2 6 4" class="nt-padlijn" fill="none"/></g>`;
  else if (knol === 'knol') uit += `<g data-deel="knol"><ellipse cx="0" cy="${voet - 2}" rx="16" ry="11" fill="${steel}" class="nt-padlijn"/></g>`;
  if (ring) { const y1 = top + hoog + 12; uit += `<g data-deel="ring"><path d="M-9 ${y1} C-14 ${y1 + 3} -19 ${y1 + 11} -17 ${y1 + 17} Q0 ${y1 + 21} 17 ${y1 + 17} C19 ${y1 + 11} 14 ${y1 + 3} 9 ${y1}Z" fill="${steel}" class="nt-padlijn"/></g>`; }
  let lamellen = '';
  for (let x = -breed + 8; x <= breed - 8; x += 5) lamellen += `M${x} ${top + hoog - 1} L${r1(x * 0.18)} ${top + hoog + 7}`;
  uit += `<g data-deel="plaatjes"><path d="M${-breed + 2} ${top + hoog - 2} Q0 ${top + hoog + 14} ${breed - 2} ${top + hoog - 2}Z" fill="${plaat}" class="nt-padlijn"/><path d="${lamellen}" class="nt-lamel"/></g>`;
  uit += `<g data-deel="hoed"><path d="M${-breed} ${top + hoog} C${-breed} ${top - 4} ${-breed * 0.45} ${top - hoog * 0.4} 0 ${top - hoog * 0.4} C${breed * 0.45} ${top - hoog * 0.4} ${breed} ${top - 4} ${breed} ${top + hoog} Q0 ${top + hoog - 8} ${-breed} ${top + hoog}Z" fill="${hoed}" class="nt-padlijn"/>`;
  if (stippen) for (const [x, y, r] of [[-30, 14, 4], [-12, 6, 5], [8, 4, 4], [26, 10, 5], [42, 22, 3.5], [-44, 26, 3.5], [-20, 24, 3], [18, 22, 3.5]]) uit += `<ellipse cx="${x}" cy="${top + y - 12}" rx="${r}" ry="${r * 0.7}" fill="${stippen}"/>`;
  uit += '</g>';
  return uit;
}
export const PADDENSTOEL_DELEN = { hoed: 'de hoed', plaatjes: 'de plaatjes', ring: 'de ring', steel: 'de steel', knol: 'de knol in een beurs', zwamvlok: 'de zwamvlok (de schimmeldraden in de grond)' };
/** The parts of a mushroom, with the ground: also the picture of the quiz (src/doe/natuur/delen.js). */
export const paddenstoelMetDelen = () => `<path d="M-90 146 H90" class="nt-grondlijn"/>${paddenstoel({ hoed: '#c9b48a', knol: 'beurs' })}`;

function paddenstoelDelen() {
  const labels = [['hoed', 0, 36, 50], ['plaatjes', 0, 64, 52], ['ring', 0, 84, 16], ['steel', 0, 104, 9], ['knol', 0, 130, 17], ['zwamvlok', 0, 158, 46]];
  let uit = g(110, 4, 0, paddenstoelMetDelen());
  for (const [deel, , y, tx] of labels) {
    uit += `<path d="M${110 + tx} ${y} L210 ${y}" class="lijn dun"/>` + tekst(216, y + 4, PADDENSTOEL_DELEN[deel].replace(' (de schimmeldraden in de grond)', ''), { maat: 11, anker: 'start' });
  }
  uit += tekst(216, 176, 'draden in de grond', { maat: 10, anker: 'start', klasse: 'stil' });
  return svg(340, 190, 'De delen van een paddenstoel: hoed, plaatjes, ring, steel, knol in een beurs en de zwamvlok in de grond', uit);
}
function vliegenzwam() {
  return svg(240, 200, 'Vliegenzwam: rode hoed met witte vlokken, witte plaatjes, ring en knol', `<path d="M10 172 H230" class="nt-grondlijn"/>${g(120, 30, 0, paddenstoel({ hoed: '#d52a1e', stippen: '#fbf8ef', knol: 'knol' }))}`);
}
function knolamaniet() {
  return svg(240, 200, 'Groene knolamaniet: olijfgroene hoed, witte plaatjes, hangende ring en een knol in een beurs', `<path d="M10 172 H230" class="nt-grondlijn"/>${g(120, 30, 0, paddenstoel({ hoed: '#a7ad62', knol: 'beurs' }))}`);
}
function cantharel() {
  let uit = '<path d="M10 172 H230" class="nt-grondlijn"/>';
  uit += '<path d="M60 70 C70 52 170 52 180 70 C176 80 150 82 134 96 L130 168 Q120 174 110 168 L106 96 C90 82 64 80 60 70Z" class="nt-cantharel"/>';
  for (let x = -40; x <= 40; x += 8) uit += `<path d="M${120 + x} 76 Q${120 + x * 0.5} 90 ${120 + x * 0.12} 130" class="nt-lijst"/>`;
  uit += '<path d="M60 70 C70 52 170 52 180 70 C160 64 80 64 60 70Z" class="nt-cantharel-top"/>';
  return svg(240, 200, 'Cantharel: dooiergele trechter met lage, gevorkte lijsten die doorlopen op de steel', uit);
}

// -- materials, people and nature ----------------------------------------------------------------------------------

/** Twisting a cord from two strands: fold, twist the top one away, lay it over toward you, again. */
function twijnen() {
  let uit = '';
  const streng = (d, k = '') => `<path d="${d}" class="nt-vezel${k}"/>`;
  // 1: fold a bundle of fibres
  uit += streng('M30 40 Q20 70 30 110') + streng('M30 40 Q40 70 52 110', ' b') + tekst(40, 134, '1. dubbelvouwen', { maat: 10.5, klasse: 'vet' });
  // 2: twist the top strand away from you
  uit += streng('M130 40 Q118 70 126 110') + streng('M130 40 Q140 70 150 110', ' b');
  uit += '<path d="M152 70 a10 6 0 1 1 -2 12" class="lijn"/><path d="M146 84 l5 -3 l-1 6" class="lijn"/>' + tekst(140, 134, '2. draai er één', { maat: 10.5, klasse: 'vet' }) + tekst(140, 148, 'van je af', { maat: 10, klasse: 'stil' });
  // 3: lay it over the other one, toward you
  uit += streng('M230 40 Q238 60 222 80 Q214 96 228 112', ' b') + streng('M230 40 Q220 62 236 84 Q244 100 238 112');
  uit += '<path d="M252 92 q-14 8 -28 0" class="lijn"/><path d="M228 96 l-5 -4 l6 -2" class="lijn"/>' + tekst(240, 134, '3. leg hem over de', { maat: 10.5, klasse: 'vet' }) + tekst(240, 148, 'ander, naar je toe', { maat: 10, klasse: 'stil' });
  // the cord
  let koord = '';
  for (let y = 40; y < 112; y += 9) koord += `<path d="M322 ${y} q10 4 0 9" class="nt-vezel b"/><path d="M332 ${y + 4.5} q-10 4 0 9" class="nt-vezel"/>`;
  uit += koord + tekst(328, 134, '4. herhaal', { maat: 10.5, klasse: 'vet' });
  return svg(370, 158, 'Touw twijnen: vouw vezels dubbel, draai de bovenste streng van je af en leg hem over de andere naar je toe; herhaal', uit);
}

/** Wattle and daub: stakes, woven rods, clay pressed on. */
function vlechtwerk() {
  let uit = '<rect x="20" y="20" width="300" height="12" class="nt-hout"/><rect x="20" y="208" width="300" height="12" class="nt-hout"/>';
  for (let x = 40; x <= 300; x += 40) uit += `<rect x="${x - 4}" y="32" width="8" height="176" class="nt-hout"/>`;
  for (let i = 0; i < 16; i++) {
    const y = 40 + i * 10.6; let d = `M24 ${y}`;
    for (let x = 40; x <= 300; x += 40) d += ` Q${x - 20} ${y + ((x / 40 + i) % 2 ? 5 : -5)} ${x} ${y}`;
    uit += `<path d="${d} L316 ${y}" class="nt-teen"/>`;
  }
  uit += '<path d="M180 32 L320 32 L320 208 L210 208 C200 160 224 120 196 90 C186 70 196 50 180 32Z" class="nt-leem"/>';
  uit += tekst(100, 240, 'staken en wilgentenen', { maat: 10.5, klasse: 'stil' }) + tekst(262, 240, 'leem met stro erop', { maat: 10.5, klasse: 'stil' });
  return svg(340, 252, 'Vlechtwerk met leem: rechtopstaande staken, wilgentenen om en om ertussen gevlochten, en leem erop gesmeerd', uit);
}

/** Basket: the cross of the base, the uprights, weaving round. */
function mand() {
  let uit = '';
  // base from above
  for (const a of [0, 45, 90, 135]) uit += g(80, 90, a, '<path d="M-56 0 H56" class="nt-teen dik"/>');
  for (let r = 10; r < 44; r += 5) uit += `<circle cx="80" cy="90" r="${r}" class="nt-teen"/>`;
  uit += tekst(80, 164, '1. bodem: kruis, rondjes', { maat: 10.5, klasse: 'vet' });
  // basket from the side
  uit += '<path d="M190 136 Q260 152 330 136 L346 40 Q260 56 174 40Z" class="nt-mand-binnen"/>';
  for (let x = 0; x <= 8; x++) uit += `<path d="M${194 + x * 17} 140 L${178 + x * 20.8} 36" class="nt-teen dik"/>`;
  for (let i = 0; i < 9; i++) { const y = 128 - i * 10.5; const xl = 190 - i * 1.7; const xr = 330 + i * 1.7; uit += `<path d="M${xl} ${y} Q260 ${y + 14} ${xr} ${y}" class="nt-teen"/>`; }
  uit += tekst(260, 164, '2. staanders, 3. vlechten', { maat: 10.5, klasse: 'vet' });
  return svg(360, 176, 'Mand vlechten: een bodem met een kruis en rondjes, staanders omhoog, en tenen om en om rondgevlochten', uit);
}

/** Natural dyes: what gives which colour. */
function kleurstoffen() {
  const lijst = [['#d99a2b', 'uienschillen', 'geel, oranjebruin'], ['#7a5230', 'walnotenbolsters', 'bruin'], ['#c8b636', 'brandnetel', 'groengeel'], ['#c2457a', 'rode biet', 'roze (verbleekt)'], ['#6d5aa8', 'rode kool', 'paars tot blauw'], ['#4a3060', 'vlierbes, braam', 'blauwpaars']];
  let uit = '';
  lijst.forEach(([kleur, wat, uitk], i) => {
    const x = 60 + (i % 3) * 120; const y = 46 + Math.floor(i / 3) * 100;
    uit += `<path d="M${x - 30} ${y - 22} h60 v34 q-30 12 -60 0z" fill="${kleur}" class="nt-lap"/>` + tekst(x, y + 30, wat, { maat: 11, klasse: 'vet' }) + tekst(x, y + 44, uitk, { maat: 10, klasse: 'stil' });
  });
  return svg(360, 200, 'Natuurlijke kleurstoffen: uienschillen geel, walnotenbolsters bruin, brandnetel groengeel, rode biet roze, rode kool paars, vlierbes blauwpaars', uit);
}

/** Light pollution: a lamp that shines everywhere, and one that shines only down. */
function lichtvervuiling() {
  let uit = '<rect x="0" y="0" width="360" height="230" rx="14" class="nt-nacht"/>';
  for (const [x, y] of [[30, 30], [80, 18], [140, 40], [200, 22], [250, 46], [310, 26], [330, 70], [180, 70], [100, 64]]) uit += `<circle cx="${x}" cy="${y}" r="${x > 180 ? 1.8 : 0.9}" class="nt-ster"/>`;
  // left: a bare globe, light all round
  uit += '<path d="M90 214 V100" class="nt-paal"/><circle cx="90" cy="92" r="12" class="nt-lamp"/>';
  uit += '<path d="M90 92 L20 30 L160 30 Z M90 92 L10 214 L170 214Z" class="nt-licht"/>';
  for (let i = 0; i < 6; i++) { const a = (i / 6) * 2 * Math.PI; uit += `<circle cx="${r1(90 + 26 * Math.cos(a))}" cy="${r1(86 + 22 * Math.sin(a))}" r="2.2" class="nt-mot"/>`; }
  uit += tekst(90, 226, 'licht alle kanten op', { maat: 10.5 }).replace('class="tekst', 'class="tekst nt-nachttekst');
  // right: shielded, down, warm
  uit += '<path d="M270 214 V100" class="nt-paal"/><path d="M252 100 H288 L282 92 H258Z" class="nt-kap"/><path d="M262 100 L240 214 H300 L278 100Z" class="nt-licht warm"/>';
  uit += tekst(270, 226, 'afgeschermd, naar beneden', { maat: 10.5 }).replace('class="tekst', 'class="tekst nt-nachttekst');
  return svg(360, 234, 'Lichtvervuiling: een bollamp die alle kanten op schijnt en insecten lokt, en een afgeschermde lamp die alleen naar beneden schijnt, met warm licht', uit);
}

/** White umbel: rays from (x, y) up to a flat top, r wide each side, with little flowers. */
function scherm(x, y, r, hoog = 26) {
  let uit = '';
  for (let i = -4; i <= 4; i++) {
    const ex = x + (i * r) / 4; const ey = y - hoog + Math.abs(i) * 1.4;
    uit += `<path d="M${x} ${y} L${r1(ex)} ${r1(ey)}" class="nt-steel-groen dun"/>`;
    for (let j = -1; j <= 1; j++) uit += `<circle cx="${r1(ex + j * 2.6)}" cy="${r1(ey - 2 + Math.abs(j))}" r="1.9" class="nt-bloem-wit"/>`;
  }
  return uit;
}

/** Gevlekte scheerling next to fluitenkruid and gewone berenklauw: look at the stem. */
function scheerlingVergelijk() {
  let uit = '';
  const fijnBlad = () => geveerd({ paren: 4, lengte: 64, hoek: 64, steel: 0, blaadje: { lengte: 20, breedte: 9, a: 0.6, b: 1, rand: 'zaag', n: 5, diep: 1.6, nerven: 0 } });
  // gevlekte scheerling: a bare, bluish stem with purple spots; finely divided leaf
  uit += scherm(60, 54, 30) + '<path d="M60 206 V54" class="nt-stengel-blauw"/>';
  for (const [y, dx] of [[70, -1], [84, 1.5], [100, -1.5], [118, 1], [132, -1], [150, 1.5], [168, -1], [186, 1]]) uit += `<ellipse cx="${60 + dx}" cy="${y}" rx="2" ry="3.4" class="nt-paars"/>`;
  uit += g(60, 150, 58, fijnBlad());
  uit += onderAan3(60, 'Gevlekte scheerling', ['kaal, blauwig, met', 'paarse vlekken;', 'ruikt naar muizen']);
  // fluitenkruid: green, grooved, hairy low down; no spots
  uit += scherm(180, 54, 26) + '<path d="M180 206 V54" class="nt-stengel"/><path d="M178.6 200 V60 M181.4 200 V60" class="nt-groef"/>';
  for (let y = 160; y < 204; y += 6) uit += `<path d="M178 ${y} l-4 -3 M182 ${y + 3} l4 -3" class="nt-haar"/>`;
  uit += g(180, 140, 58, fijnBlad());
  uit += onderAan3(180, 'Fluitenkruid', ['groen, gegroefd,', 'onderaan behaard;', 'geen vlekken']);
  // gewone berenklauw: thick, rough with hairs; a big coarse lobed leaf
  uit += scherm(300, 54, 34) + '<path d="M300 206 V54" class="nt-stengel-dik"/>';
  for (let y = 62; y < 204; y += 7) uit += `<path d="M296 ${y} l-4 -3 M304 ${y + 3} l4 -3" class="nt-haar"/>`;
  uit += g(300, 160, 55, blad({ lengte: 66, breedte: 52, a: 0.6, b: 1, rand: 'zaag', n: 7, diep: 2.4, lob: { n: 2.5, diep: 0.45, punt: true }, steel: 0, nerven: 3 }));
  uit += onderAan3(300, 'Gewone berenklauw', ['ruw behaard;', 'groot, grof', 'gelobd blad']);
  return svg(360, 272, 'Gevlekte scheerling naast fluitenkruid en gewone berenklauw: kijk naar de stengel. Scheerling is kaal en blauwig met paarse vlekken, fluitenkruid gegroefd en onderaan behaard, berenklauw ruw behaard met een groot gelobd blad', uit);
}
const onderAan3 = (x, naam, regels) => tekst(x, 226, naam, { maat: 11, klasse: 'vet' }) + regels.map((r, i) => tekst(x, 240 + i * 12, r, { maat: 9.5, klasse: 'stil' })).join('');

/** A herbarium: pressing between newspaper under books, then a sheet with the plant and a label. */
function herbarium() {
  let uit = '';
  // 1: the press, from the side
  uit += '<rect x="20" y="142" width="140" height="10" rx="2" class="nt-hout"/>';
  for (let i = 0; i < 4; i++) uit += `<rect x="${24 + i}" y="${132 - i * 7}" width="${132 - 2 * i}" height="6" rx="1" class="nt-krant"/>`;
  uit += g(150, 122, 100, blad({ lengte: 34, breedte: 16, a: 0.7, b: 1, steel: 6, nerven: 0 }));
  uit += '<rect x="30" y="92" width="120" height="16" rx="2" class="nt-boek"/><rect x="40" y="74" width="104" height="18" rx="2" class="nt-boek b"/>';
  uit += '<path d="M90 40 V64 M83 56 L90 66 L97 56" class="lijn"/>';
  uit += tekst(90, 176, '1. plat tussen kranten,', { maat: 10.5, klasse: 'vet' }) + tekst(90, 190, 'met boeken erop', { maat: 10, klasse: 'stil' }) + tekst(90, 203, 'elke dag droog papier', { maat: 10, klasse: 'stil' });
  // 2: the sheet
  uit += '<rect x="196" y="12" width="136" height="168" rx="3" class="nt-vel"/>';
  uit += '<path d="M240 150 Q244 100 250 34" class="nt-steel-groen"/>';
  for (const [y, k, l] of [[132, -1, 30], [112, 1, 30], [92, -1, 26], [72, 1, 24], [54, -1, 20]]) uit += g(244 + (150 - y) * 0.06, y, k * 55, blad({ lengte: l, breedte: l * 0.45, a: 0.7, b: 1, rand: 'zaag', n: 6, diep: 1, steel: 3, nerven: 0 }));
  uit += '<rect x="226" y="98" width="20" height="6" class="nt-plakband" transform="rotate(-20 236 101)"/><rect x="232" y="140" width="22" height="6" class="nt-plakband" transform="rotate(15 243 143)"/>';
  uit += '<rect x="270" y="130" width="56" height="44" rx="2" class="nt-etiket"/>';
  ['naam:', 'waar:', 'wanneer:', 'door:'].forEach((r, i) => { uit += tekst(274, 141 + i * 10, r, { maat: 7.5, anker: 'start' }) + `<path d="M${i === 2 ? 306 : 296} ${141 + i * 10} H322" class="lijn haar"/>`; });
  uit += tekst(264, 196, '2. opplakken, met een etiket', { maat: 10.5, klasse: 'vet' });
  return svg(352, 212, 'Een herbarium maken: de plant plat tussen kranten met boeken erop, en daarna op een vel geplakt met een etiket: naam, waar, wanneer en door wie', uit);
}

/** Droppings, not to scale: what the shape tells you. Each one is drawn round (0, 0) and placed in a column. */
function uitwerpselen() {
  let uit = '<rect x="4" y="4" width="352" height="112" rx="12" class="nt-zand"/>';
  let konijn = '';
  for (const [x, y] of [[-12, 8], [0, 10], [12, 8], [-6, -2], [6, -1], [0, -11], [18, 16], [-18, 18]]) konijn += `<circle cx="${x}" cy="${y}" r="6" class="nt-keutel"/>`;
  let ree = '';
  for (const [x, y, r] of [[-12, -10, 20], [2, -4, -30], [-6, 8, 70], [10, 12, 10], [-18, 12, -60], [16, -14, 40]]) ree += g(x, y, r, '<path d="M0 -6 C4 -6 5 -2 5 2 C5 6 3 8 0 8 C-3 8 -5 6 -5 2 C-5 -2 -4 -6 0 -9Z" class="nt-keutel donker"/>');
  const vos = '<path d="M-30 12 C-32 -4 -14 -10 0 -6 C10 -4 14 -12 22 -10 C30 -8 30 2 22 4 C14 6 10 12 0 12 C-10 14 -26 20 -30 12Z" class="nt-keutel grijs"/><path d="M22 -10 C26 -16 30 -18 34 -22" class="nt-keutel-punt"/><path d="M-16 2 l8 2 M-2 6 l7 -1 M10 0 l6 3" class="nt-botje"/>';
  const marter = '<path d="M-28 14 C-28 4 -16 2 -8 4 C2 6 6 -2 14 -4 C22 -6 26 -12 30 -20" class="nt-keutel-lang"/>';
  const egel = '<path d="M-24 4 C-26 -4 -12 -6 0 -4 C12 -2 22 -4 24 2 C24 8 12 10 0 8 C-10 8 -22 10 -24 4Z" class="nt-keutel zwart"/><path d="M-8 0 l3 2 M4 1 l3 -1 M14 2 l2 2" class="nt-glimmer"/>';
  [['Konijn', 'rond, hoopjes', konijn], ['Ree', 'met puntje', ree], ['Vos', 'gedraaide punt', vos], ['Marter', 'lang en dun', marter], ['Egel', 'zwart, glanst', egel]].forEach(([naam, wat, tek], i) => {
    const x = 38 + i * 71;
    uit += g(x, 66, 0, tek) + tekst(x, 136, naam, { maat: 11, klasse: 'vet' }) + tekst(x, 150, wat, { maat: 9.5, klasse: 'stil' });
  });
  uit += tekst(180, 172, 'niet op schaal; kijk, maar pak niets met je handen', { maat: 10, klasse: 'stil' });
  return svg(360, 180, 'Uitwerpselen, niet op schaal: konijn rond en in hoopjes, ree met een puntje, vos met een gedraaide punt en haren, marter lang en dun, egel zwart en glanzend', uit);
}

/** An owl pellet, whole and picked apart. */
function braakbal() {
  let uit = '<rect x="4" y="4" width="332" height="132" rx="12" class="nt-zand"/>';
  // the pellet: grey felt with a bone sticking out
  uit += '<ellipse cx="80" cy="72" rx="46" ry="30" class="nt-braakbal"/>';
  for (let i = 0; i < 14; i++) { const a = (i / 14) * 2 * Math.PI; const x = 80 + 30 * Math.cos(a); const y = 72 + 18 * Math.sin(a); uit += `<path d="M${r1(x)} ${r1(y)} q4 -3 8 0" class="nt-vilt"/>`; }
  uit += '<path d="M112 60 L128 50 M128 50 l3 -3 M128 50 l4 1" class="nt-bot"/><path d="M58 88 L48 98" class="nt-bot"/>';
  uit += tekst(80, 158, 'braakbal: haar en botjes', { maat: 10.5, klasse: 'vet' });
  // what is inside: a small skull with long front teeth, a jaw, some bones
  uit += '<path d="M190 70 C190 50 214 42 236 46 C252 48 262 58 262 68 C262 76 254 80 244 80 L214 82 C200 82 190 80 190 70Z" class="nt-bot-vlak"/>';
  uit += '<circle cx="232" cy="62" r="7" class="nt-oogkas"/><path d="M194 76 Q188 84 192 92" class="nt-tand"/><path d="M204 106 Q198 110 199 116" class="nt-tand"/><path d="M190 70 C186 74 186 82 190 86" class="nt-bot"/>';
  uit += '<path d="M200 104 C204 96 236 96 250 100 L252 106 C236 104 214 106 204 110Z" class="nt-bot-vlak"/><path d="M200 104 C196 108 196 114 200 116" class="nt-bot"/>';
  for (const [x, y, r] of [[286, 54, 20], [300, 80, -15], [282, 104, 60], [312, 108, 5]]) uit += g(x, y, r, '<path d="M-12 0 H12" class="nt-bot dik"/><circle cx="-12" cy="0" r="3" class="nt-bot-vlak"/><circle cx="12" cy="0" r="3" class="nt-bot-vlak"/>');
  uit += tekst(250, 158, 'erin: schedeltjes,', { maat: 10.5, klasse: 'vet' }) + tekst(250, 172, 'kaakjes en botjes', { maat: 10.5, klasse: 'vet' });
  return svg(340, 180, 'Een braakbal van een uil: een grijs balletje van haar met botjes; uitgeplozen vind je schedeltjes met lange voortanden, kaakjes en pijpbeentjes', uit);
}

/** A plaster cast in three steps. */
function gipsafdruk() {
  let uit = '';
  // 1: a ring round the print, from above
  uit += modder(8, 20, 100, 100) + prent('vos', 58, 70, { hoog: 50 }) + '<circle cx="58" cy="70" r="38" class="nt-ring"/>';
  uit += tekst(58, 142, '1. ring eromheen', { maat: 10.5, klasse: 'vet' });
  // 2: pour the plaster in, from the side
  uit += '<rect x="122" y="92" width="110" height="28" class="nt-grond"/><path d="M146 80 V100 M208 80 V100" class="nt-ring"/><rect x="148" y="86" width="58" height="12" class="nt-gips"/>';
  uit += '<path d="M200 30 L222 34 L218 58 L198 56Z" class="nt-beker"/><path d="M200 52 Q190 64 182 86" class="nt-gipsstraal"/>';
  uit += tekst(178, 142, '2. gips erin, 2 cm dik', { maat: 10.5, klasse: 'vet' }) + tekst(178, 156, 'een half uur laten harden', { maat: 10, klasse: 'stil' });
  // 3: the cast: the print stands out
  uit += '<ellipse cx="298" cy="70" rx="44" ry="40" class="nt-gips"/>' + prent('vos', 298, 70, { hoog: 50 }).replace('class="nt-prent"', 'class="nt-prent nt-gipsprent"');
  uit += tekst(298, 142, '3. uitgraven', { maat: 10.5, klasse: 'vet' }) + tekst(298, 156, 'de prent staat bol', { maat: 10, klasse: 'stil' });
  return svg(360, 166, 'Een gipsafdruk maken: zet een ring om de prent, giet er gips in en graaf het na een half uur uit; de prent staat dan bol', uit);
}

export default {
  ...BOOM_PLAATJES,
  bladvormen,
  'plant-brandnetel': brandnetel,
  'plant-berenklauw': berenklauw,
  'daslook-dubbelgangers': daslook,
  'giftige-planten': giftigePlanten,
  'scheerling-vergelijk': scheerlingVergelijk,
  herbarium,
  prenten,
  'prent-vos': prentVos,
  'prent-das': () => prentGroot('das', ['vijf tenen in een boog, lange nagels', 'breed voetkussen, als een berenpootje']),
  'prent-hoeven': prentHoeven,
  'prent-haas': prentHaas,
  'prent-eekhoorn': prentEekhoorn,
  'prent-egel': () => prentGroot('egel', ['vijf tenen met korte nagels']),
  'prent-marter': () => prentGroot('marter', ['nagels zichtbaar; een kat trekt ze in']),
  'prent-wolf': () => prentGroot('wolf', ['als een grote hond, langer dan breed', 'loopt lang rechtdoor']),
  uitwerpselen,
  braakbal,
  gipsafdruk,
  vraatsporen,
  tuinvogels,
  'vogels-kijken': vogelsKijken,
  teek,
  'wesp-bij-hommel': wespBijHommel,
  hoornaars,
  processierups,
  'paddenstoel-delen': paddenstoelDelen,
  vliegenzwam,
  knolamaniet,
  cantharel,
  twijnen,
  vlechtwerk,
  mand,
  kleurstoffen,
  lichtvervuiling,
};
