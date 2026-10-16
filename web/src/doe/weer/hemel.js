// The hemelrekenaar: where the sun, the moon and the stars stand, seen from a place in the Netherlands at a moment,
// and the clock of the Netherlands (wintertijd and zomertijd). Own code after the usual short formulas, as SunCalc
// (Vladimir Agafonkin, BSD-2) and Meeus (Astronomical Algorithms) use them, all for the equinox of the date: the sun
// and the moon to about a tenth of a degree, rising and setting and new moon to a minute or a few (checked against
// PyEphem for 2026). Plenty for finding north; not for an eclipse.
//
// Time is a number: milliseconds since 1970 in UTC (Date.now()). Directions are in degrees from north, clockwise
// (90 = oost); heights in degrees above the horizon.

const RAD = Math.PI / 180;
const DAG = 864e5;
const E = RAD * 23.4397;                                   // the tilt of the earth's axis

export const norm = (g) => ((g % 360) + 360) % 360;

/** Days since 1 January 2000, 12:00 UTC. */
const dagen = (t) => t / DAG - 0.5 + 2440588 - 2451545;

const rechteKlimming = (l, b) => Math.atan2(Math.sin(l) * Math.cos(E) - Math.tan(b) * Math.sin(E), Math.cos(l));
const declinatie = (l, b) => Math.asin(Math.sin(b) * Math.cos(E) + Math.cos(b) * Math.sin(E) * Math.sin(l));

/** The local sidereal time as an angle in radians: the right ascension (of the date) that stands in the south now. */
export const sterrentijd = (t, lengte) => RAD * (280.46062 + 360.98564737 * dagen(t)) + RAD * lengte;

/** The sun on the sky: right ascension and declination (radians). */
function zonOpHemel(t) {
  const d = dagen(t);
  const M = RAD * (357.5291 + 0.98560028 * d);
  const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const L = M + C + RAD * (102.9372 + 0.0000471 * d) + Math.PI;     // the perihelion moves on 1.72 degrees a century
  return { ra: rechteKlimming(L, 0), dec: declinatie(L, 0), afstand: 149598000, lengte: L };
}

/**
 * The moon on the sky: right ascension, declination (radians) and distance (km). The biggest terms of the series in
 * Meeus, Astronomical Algorithms ch. 47 (evection, variation and the rest down to 0.03 degrees): with only the first
 * term, as SunCalc has it, the moon is up to 2.5 degrees out and new moon up to 7 hours.
 */
function maanOpHemel(t) {
  const d = dagen(t);
  const L = RAD * (218.316 + 13.176396 * d);              // mean longitude
  const M = RAD * (134.963 + 13.064993 * d);              // mean anomaly
  const F = RAD * (93.272 + 13.22935 * d);                // argument of latitude
  const D = RAD * (297.850 + 12.190749 * d);              // mean elongation from the sun
  const S = RAD * (357.529 + 0.985600 * d);               // mean anomaly of the sun
  const l = L + RAD * (6.289 * Math.sin(M) + 1.274 * Math.sin(2 * D - M) + 0.658 * Math.sin(2 * D)
    + 0.214 * Math.sin(2 * M) - 0.186 * Math.sin(S) - 0.114 * Math.sin(2 * F) + 0.059 * Math.sin(2 * D - 2 * M)
    + 0.057 * Math.sin(2 * D - S - M) + 0.053 * Math.sin(2 * D + M) + 0.046 * Math.sin(2 * D - S)
    - 0.041 * Math.sin(S - M) - 0.035 * Math.sin(D) - 0.030 * Math.sin(S + M));
  const b = RAD * (5.128 * Math.sin(F) + 0.281 * Math.sin(M + F) + 0.278 * Math.sin(M - F) + 0.173 * Math.sin(2 * D - F)
    + 0.055 * Math.sin(2 * D - M + F) + 0.046 * Math.sin(2 * D - M - F));
  const afstand = 385001 - 20905 * Math.cos(M) - 3699 * Math.cos(2 * D - M) - 2956 * Math.cos(2 * D) - 570 * Math.cos(2 * M);
  return { ra: rechteKlimming(l, b), dec: declinatie(l, b), afstand, lengte: l };
}

/** Light bends in the air: near the horizon you see a thing about half a degree higher than it is. */
function breking(h) {
  const x = Math.max(h, 0);
  return 0.0002967 / Math.tan(x + 0.00312536 / (x + 0.08901179));
}

/**
 * Right ascension (hours) and declination (degrees) to the sky of a place: height and direction, in degrees.
 * `zien` adds the bending of the light, as you see it.
 */
export function naarHorizon(raUren, decGraden, t, breedte, lengte, zien = true) {
  const { ra, dec } = vanJ2000(raUren * 15 * RAD, decGraden * RAD, t);
  return horizon(ra, dec, sterrentijd(t, lengte), breedte, zien);
}

/**
 * From the positions of a star catalogue (J2000) to those of the date: the axis of the earth turns slowly, 1.4
 * degrees a century along the ecliptic (the precession). About a third of a degree since 2000.
 */
function vanJ2000(ra, dec, t) {
  const l = Math.atan2(Math.sin(ra) * Math.cos(E) + Math.tan(dec) * Math.sin(E), Math.cos(ra));
  const b = Math.asin(Math.sin(dec) * Math.cos(E) - Math.cos(dec) * Math.sin(E) * Math.sin(ra));
  const p = l + RAD * 1.39697 * (dagen(t) / 36525);
  return { ra: rechteKlimming(p, b), dec: declinatie(p, b) };
}

function horizon(ra, dec, st, breedte, zien) {
  const H = st - ra;
  const phi = breedte * RAD;
  let h = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
  if (zien) h += breking(h);
  const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
  return { hoogte: h / RAD, richting: norm(az / RAD + 180), uurhoek: H };
}

/** Where the sun is: { hoogte, richting } in degrees. */
export function zon(t, breedte, lengte, zien = true) {
  const c = zonOpHemel(t);
  return horizon(c.ra, c.dec, sterrentijd(t, lengte), breedte, zien);
}

/** Where the moon is: { hoogte, richting }, with the parallax: the moon is close, so it stands a little lower. */
export function maan(t, breedte, lengte, zien = true) {
  const c = maanOpHemel(t);
  const p = horizon(c.ra, c.dec, sterrentijd(t, lengte), breedte, false);
  let h = p.hoogte * RAD;
  h -= Math.asin(6378 / c.afstand) * Math.cos(h);
  if (zien) h += breking(h);
  return { hoogte: h / RAD, richting: p.richting };
}

/**
 * How the moon looks: `fase` 0 new moon, 0.25 eerste kwartier, 0.5 full, 0.75 laatste kwartier; `verlicht` the lit
 * part (0..1); `wassend`; and `kant`: the direction of the lit side on the sky, in degrees from straight up towards
 * the left as you look at the moon (90 = lit on the left, 270 = lit on the right), for a place and a time.
 */
export function maanfase(t, breedte = 52.1, lengte = 5.4) {
  const s = zonOpHemel(t);
  const m = maanOpHemel(t);
  const phi = Math.acos(Math.sin(s.dec) * Math.sin(m.dec) + Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra));
  const inc = Math.atan2(s.afstand * Math.sin(phi), m.afstand - s.afstand * Math.cos(phi));
  const hoek = Math.atan2(Math.cos(s.dec) * Math.sin(s.ra - m.ra),
    Math.sin(s.dec) * Math.cos(m.dec) - Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra));
  // the age as the difference in ecliptic longitude, so that new moon is the conjunction even when the moon stands
  // a few degrees above or below the sun
  const fase = norm((m.lengte - s.lengte) / RAD) / 360;
  // the lit side relative to straight up: the position angle of the lit limb minus the parallactic angle
  const H = sterrentijd(t, lengte) - m.ra;
  const p = breedte * RAD;
  const q = Math.atan2(Math.sin(H), Math.tan(p) * Math.cos(m.dec) - Math.sin(m.dec) * Math.cos(H));
  return { fase, verlicht: (1 + Math.cos(inc)) / 2, wassend: fase < 0.5, kant: norm((hoek - q) / RAD) };
}

/** A synodic month: from new moon to new moon, in days. */
export const MAANMAAND = 29.530589;

/** The moment of the last new moon before t (to about an hour). */
export function vorigeNieuweMaan(t) {
  let x = t - maanfase(t).fase * MAANMAAND * DAG;
  for (let i = 0; i < 4; i++) {
    let f = maanfase(x).fase;
    if (f > 0.5) f -= 1;
    x -= f * MAANMAAND * DAG;
  }
  return x;
}

/** The names of the phases, from new moon round. */
export const FASEN = ['nieuwe maan', 'wassende sikkel', 'eerste kwartier', 'wassende maan', 'volle maan', 'afnemende maan', 'laatste kwartier', 'afnemende sikkel'];

/** The name of a phase 0..1: the four main phases get a day either side, the rest is in between. */
export function faseNaam(fase) {
  const dag = fase * MAANMAAND;
  const punt = [0, 0.25, 0.5, 0.75, 1].findIndex((f) => Math.abs(dag - f * MAANMAAND) <= 1.1);
  if (punt >= 0) return FASEN[(punt * 2) % 8];
  return FASEN[Math.floor(fase * 4) * 2 + 1];
}

// -- the clock of the Netherlands: CET in winter, CEST from the last Sunday of March to the last Sunday of October,
//    switching at 1:00 UTC (the EU rule). Independent of the clock of the device.

const laatsteZondag = (j, m) => {
  const d = new Date(Date.UTC(j, m + 1, 0));
  return Date.UTC(j, m, d.getUTCDate() - d.getUTCDay(), 1);
};
/** Is it zomertijd in the Netherlands at t? */
export const zomertijd = (t) => {
  const j = new Date(t).getUTCFullYear();
  return t >= laatsteZondag(j, 2) && t < laatsteZondag(j, 9);
};
/** Hours ahead of UTC in the Netherlands at t: 1 or 2. */
export const verschilNL = (t) => (zomertijd(t) ? 2 : 1);

/** The moment (UTC ms) for a date in the Netherlands (year, month 0-11, day) and minutes on the clock. */
export function momentNL(j, m, d, minuten) {
  const zonder = Date.UTC(j, m, d, 0, minuten);
  return zonder - verschilNL(zonder - 2 * 36e5) * 36e5;
}

/** The clock and calendar in the Netherlands at t: { j, m, d, minuten, zomer, dagVanJaar }. */
export function klokNL(t) {
  const zomer = zomertijd(t);
  const x = new Date(t + (zomer ? 2 : 1) * 36e5);
  const j = x.getUTCFullYear(); const m = x.getUTCMonth(); const d = x.getUTCDate();
  return { j, m, d, minuten: x.getUTCHours() * 60 + x.getUTCMinutes(), zomer,
    dagVanJaar: Math.round((Date.UTC(j, m, d) - Date.UTC(j, 0, 1)) / DAG) + 1 };
}

/** "5:07" from minutes. */
export const klok = (min) => {
  const m = Math.round(((min % 1440) + 1440) % 1440);
  return `${Math.floor(m / 60) % 24}:${String(m % 60).padStart(2, '0')}`;
};

const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
/** "21 juni". */
export const datumTekst = (m, d) => `${d} ${MAANDEN[m]}`;
/** Month and day of a day of the year (1..365) in a year that is not a leap year. */
export function uitDagVanJaar(dag, j = 2026) {
  const x = new Date(Date.UTC(j, 0, dag));
  return { j: x.getUTCFullYear(), m: x.getUTCMonth(), d: x.getUTCDate() };
}

/**
 * When something crosses a height on a day in the Netherlands: `hoogteVan(t)` gives its height, `drempel` the height
 * of rising and setting. Returns { op, onder } as moments (or null when it does not happen that day), and the
 * highest point { t, hoogte }. Searched in steps of ten minutes and then halved down to seconds.
 */
export function opEnOnder(hoogteVan, j, m, d, drempel) {
  const begin = momentNL(j, m, d, 0);
  const eind = momentNL(j, m, d, 24 * 60);
  const stap = 10 * 6e4;
  let op = null; let onder = null; let top = { t: begin, hoogte: -90 };
  let vt = begin; let vh = hoogteVan(vt) - drempel;
  for (let x = begin + stap; x <= eind + 1; x += stap) {
    const hx = hoogteVan(x) - drempel;
    if (hx + drempel > top.hoogte) top = { t: x, hoogte: hx + drempel };
    if ((vh < 0) !== (hx < 0)) {
      let a = vt; let b = x; let ha = vh;
      for (let i = 0; i < 12; i++) {
        const c = (a + b) / 2; const hc = hoogteVan(c) - drempel;
        if ((ha < 0) === (hc < 0)) { a = c; ha = hc; } else b = c;
      }
      if (vh < 0 && op === null) op = (a + b) / 2;
      else if (vh >= 0 && onder === null) onder = (a + b) / 2;
    }
    vt = x; vh = hx;
  }
  // the top more precisely: the best of the ten-minute steps, then a few halvings around it
  let a = top.t - stap; let b = top.t + stap;
  for (let i = 0; i < 20; i++) {
    const c1 = a + (b - a) / 3; const c2 = b - (b - a) / 3;
    if (hoogteVan(c1) < hoogteVan(c2)) a = c1; else b = c2;
  }
  const tt = (a + b) / 2;
  return { op, onder, top: { t: tt, hoogte: hoogteVan(tt) } };
}

/** Sunrise, sunset and the highest point of the sun on a day at a place (the top edge on the horizon). */
export function zonOpOnder(j, m, d, breedte, lengte) {
  return opEnOnder((t) => zon(t, breedte, lengte, false).hoogte, j, m, d, -0.833);
}

/** Moonrise and moonset on a day at a place. */
export function maanOpOnder(j, m, d, breedte, lengte) {
  // as SunCalc: the centre without parallax against +0.133 degrees, which comes to the same within a minute or so
  return opEnOnder((t) => {
    const c = maanOpHemel(t);
    return horizon(c.ra, c.dec, sterrentijd(t, lengte), breedte, false).hoogte;
  }, j, m, d, 0.133);
}

/** Places to choose, from north-east to south-west, with their latitude and longitude. */
export const PLAATSEN = [
  { id: 'groningen', naam: 'Groningen', breedte: 53.22, lengte: 6.57 },
  { id: 'den-helder', naam: 'Den Helder', breedte: 52.96, lengte: 4.76 },
  { id: 'amersfoort', naam: 'Amersfoort', breedte: 52.16, lengte: 5.39 },
  { id: 'vlissingen', naam: 'Vlissingen', breedte: 51.44, lengte: 3.57 },
  { id: 'maastricht', naam: 'Maastricht', breedte: 50.85, lengte: 5.69 },
];
export const PLAATS = Object.fromEntries(PLAATSEN.map((p) => [p.id, p]));

/** The sixteen directions in Dutch, for a direction in degrees. */
const ZESTIEN = ['N', 'NNO', 'NO', 'ONO', 'O', 'OZO', 'ZO', 'ZZO', 'Z', 'ZZW', 'ZW', 'WZW', 'W', 'WNW', 'NW', 'NNW'];
export const windstreek = (g) => ZESTIEN[Math.round(norm(g) / 22.5) % 16];
const VOLUIT = { N: 'noorden', O: 'oosten', Z: 'zuiden', W: 'westen', NO: 'noordoosten', ZO: 'zuidoosten', ZW: 'zuidwesten', NW: 'noordwesten' };
/** "het noordoosten" for the eight main ones, "het OZO" otherwise. */
export const richtingTekst = (g) => {
  const s = windstreek(g);
  return VOLUIT[s] ? `het ${VOLUIT[s]}` : s;
};

/**
 * The lit part of the moon as an SVG path, for a phase 0..1, seen from the northern half of the earth with the moon
 * upright: lit on the right while waxing, on the left while waning. Draw the dark disc under it.
 */
export function maanPad(cx, cy, r, fase) {
  const f = ((fase % 1) + 1) % 1;
  const k = Math.cos(2 * Math.PI * f);
  if (k > 0.999) return '';
  const rechts = f < 0.5;
  const rond = (n) => Math.round(n * 100) / 100;
  return `M${rond(cx)} ${rond(cy - r)}a${rond(r)} ${rond(r)} 0 0 ${rechts ? 1 : 0} 0 ${rond(2 * r)}`
    + `a${rond(Math.abs(k) * r)} ${rond(r)} 0 0 ${(rechts ? k > 0 : k < 0) ? 0 : 1} 0 ${rond(-2 * r)}Z`;
}
