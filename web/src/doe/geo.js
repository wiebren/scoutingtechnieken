// Coordinates: RD <-> WGS84 with the approximation formulas of Schreutelkamp and Strang van Hees (good to about a
// metre in the Netherlands), WGS84 -> UTM with the Krüger series, and reading and writing degrees in the three ways
// people write them. Plain functions, no DOM, so they can be checked in node.

const RD_NAAR_GRADEN = {
  lat: [[0, 1, 3235.65389], [2, 0, -32.58297], [0, 2, -0.2475], [2, 1, -0.84978], [0, 3, -0.0655], [2, 2, -0.01709],
    [1, 0, -0.00738], [4, 0, 0.0053], [2, 3, -0.00039], [4, 1, 0.00033], [1, 1, -0.00012]],
  lon: [[1, 0, 5260.52916], [1, 1, 105.94684], [1, 2, 2.45656], [3, 0, -0.81885], [1, 3, 0.05594], [3, 1, -0.05607],
    [0, 1, 0.01199], [3, 2, -0.00256], [1, 4, 0.00128], [0, 2, 0.00022], [2, 0, -0.00022], [5, 0, 0.00026]],
};
// [power of dφ, power of dλ, coefficient]
const GRADEN_NAAR_RD = {
  x: [[0, 1, 190094.945], [1, 1, -11832.228], [2, 1, -114.221], [0, 3, -32.391], [1, 0, -0.705], [3, 1, -2.34],
    [1, 3, -0.608], [0, 2, -0.008], [2, 3, 0.148]],
  y: [[1, 0, 309056.544], [0, 2, 3638.893], [2, 0, 73.077], [1, 2, -157.984], [3, 0, 59.788], [0, 1, 0.433],
    [2, 2, -6.439], [1, 1, -0.032], [0, 4, 0.092], [1, 4, -0.054]],
};
const [LAT0, LON0, X0, Y0] = [52.1551744, 5.38720621, 155000, 463000];
const reeks = (termen, a, b) => termen.reduce((som, [p, q, c]) => som + c * a ** p * b ** q, 0);

/** RD (x, y in metres) to WGS84 degrees. */
export function rdNaarGraden(x, y) {
  const [dx, dy] = [(x - X0) * 1e-5, (y - Y0) * 1e-5];
  return { lat: LAT0 + reeks(RD_NAAR_GRADEN.lat, dx, dy) / 3600, lon: LON0 + reeks(RD_NAAR_GRADEN.lon, dx, dy) / 3600 };
}

/** WGS84 degrees to RD metres. */
export function gradenNaarRd(lat, lon) {
  const [df, dl] = [0.36 * (lat - LAT0), 0.36 * (lon - LON0)];
  return { x: X0 + reeks(GRADEN_NAAR_RD.x, df, dl), y: Y0 + reeks(GRADEN_NAAR_RD.y, df, dl) };
}

/** Roughly the area where RD means something: the Netherlands with a margin. */
export const inNederland = ({ x, y }) => x > -7000 && x < 300000 && y > 289000 && y < 629000;

/** WGS84 to UTM: { zone, band, oost, noord } in metres (Krüger series, WGS84 ellipsoid); `zone` forces a zone. */
export function gradenNaarUtm(lat, lon, zone = Math.floor((lon + 180) / 6) + 1) {
  const band = 'CDEFGHJKLMNPQRSTUVWXX'[Math.floor((lat + 80) / 8)] ?? '?';
  const a = 6378137; const f = 1 / 298.257223563; const k0 = 0.9996;
  const n = f / (2 - f); const A = (a / (1 + n)) * (1 + n ** 2 / 4 + n ** 4 / 64);
  const al = [n / 2 - (2 * n ** 2) / 3 + (5 * n ** 3) / 16, (13 * n ** 2) / 48 - (3 * n ** 3) / 5, (61 * n ** 3) / 240];
  const rad = Math.PI / 180;
  const fi = lat * rad; const dl = (lon - (zone * 6 - 183)) * rad;
  const e2 = (2 * Math.sqrt(n)) / (1 + n);
  const t = Math.sinh(Math.atanh(Math.sin(fi)) - e2 * Math.atanh(e2 * Math.sin(fi)));
  const xi = Math.atan(t / Math.cos(dl)); const eta = Math.atanh(Math.sin(dl) / Math.sqrt(1 + t * t));
  let E = eta; let N = xi;
  al.forEach((c, i) => { const j = 2 * (i + 1); E += c * Math.cos(j * xi) * Math.sinh(j * eta); N += c * Math.sin(j * xi) * Math.cosh(j * eta); });
  // south of the equator the northing counts from 10 000 km, so it stays positive
  return { zone, band, oost: 500000 + k0 * A * E, noord: k0 * A * N + (lat < 0 ? 1e7 : 0) };
}

const twee = (n) => String(n).padStart(2, '0');

/** Degrees written three ways. `taal` 'nl' writes O for oost, 'geo' writes E as geocaching does. */
export function schrijfGraden(lat, lon) {
  const ns = lat >= 0 ? 'N' : 'Z'; const oo = lon >= 0 ? 'O' : 'W'; const ee = lon >= 0 ? 'E' : 'W';
  const dms = (g) => {
    let d = Math.floor(Math.abs(g)); let m = Math.floor((Math.abs(g) - d) * 60);
    let s = Math.round(((Math.abs(g) - d) * 60 - m) * 600) / 10;
    if (s >= 60) { s -= 60; m += 1; }
    if (m >= 60) { m -= 60; d += 1; }
    return `${d}° ${twee(m)}′ ${s.toFixed(1).padStart(4, '0')}″`;
  };
  const ddm = (g, breed) => {
    let d = Math.floor(Math.abs(g)); let m = Math.round((Math.abs(g) - d) * 60000) / 1000;
    if (m >= 60) { m -= 60; d += 1; }
    return `${String(d).padStart(breed, '0')}° ${m.toFixed(3).padStart(6, '0')}`;
  };
  return {
    dd: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    dms: `${ns} ${dms(lat)} ${oo} ${dms(lon)}`,
    ddm: `${ns === 'Z' ? 'S' : 'N'} ${ddm(lat, 2)} ${ee} ${ddm(lon, 3)}`,
  };
}

/**
 * Reads degrees in any of the three ways: "52.15517, 5.38721", "N 52° 09′ 18.6″ O 5° 23′ 13.9″",
 * "N 52° 09.310 E 005° 23.232"; a comma may be the decimal sign ("52,1 5,3"). A Z or S makes the breedte south, a W
 * the lengte west, and a minus sign works too. Returns { lat, lon } or null.
 */
export function leesGraden(tekst) {
  const getallen = [...tekst.matchAll(/(-?)(\d+(?:[.,]\d+)?)/g)].map((m) => ({ min: m[1] === '-', n: Number(m[2].replace(',', '.')) }));
  // single letters only, so "noorderbreedte" or "Oost" do not count as a hemisphere
  const letters = [...tekst.toUpperCase().matchAll(/(?<![A-Z])([NZSOEW])(?![A-Z])/g)].map((m) => ({ l: m[1] }));
  let delen;
  if (getallen.length === 2) delen = [[getallen[0]], [getallen[1]]];
  else if (getallen.length === 4) delen = [getallen.slice(0, 2), getallen.slice(2)];
  else if (getallen.length === 6) delen = [getallen.slice(0, 3), getallen.slice(3)];
  else return null;
  // minutes and seconds are whole parts under 60; only the degrees may have a sign
  if (delen.some((deel) => deel.slice(1).some((g) => g.n >= 60 || g.min))) return null;
  const naarGraden = ([d, m = { n: 0 }, s = { n: 0 }]) => (d.min ? -1 : 1) * (d.n + m.n / 60 + s.n / 3600);
  let [lat, lon] = delen.map(naarGraden);
  // Z or S can only belong to the breedte, W only to the lengte, wherever it stands
  for (const { l } of letters) {
    if (l === 'Z' || l === 'S') lat = -Math.abs(lat);
    else if (l === 'W') lon = -Math.abs(lon);
  }
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon };
}

/** RD written the usual way, 155.000 – 463.000. */
export const schrijfRd = ({ x, y }) => `${Math.round(x).toLocaleString('nl-NL')} – ${Math.round(y).toLocaleString('nl-NL')}`;

/** Reads RD: two numbers in metres, with or without thousands dots ("155.000 463.000", "155000, 463000"). */
export function leesRd(tekst) {
  const getallen = [...tekst.matchAll(/\d{1,3}(?:\.\d{3})+|\d+/g)].map((m) => Number(m[0].replaceAll('.', '')));
  if (getallen.length !== 2) return null;
  const [x, y] = getallen;
  return { x, y };
}

/**
 * Reads UTM: "31U 628830 5804225". The band letter may be left out (then the northern hemisphere); a band from C to
 * M means the southern one. Returns { zone, oost, noord, zuid } or null when a number cannot be UTM.
 */
export function leesUtm(tekst) {
  const m = tekst.toUpperCase().match(/(\d{1,2})\s*([C-HJ-NP-X])?\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)/);
  if (!m) return null;
  const [zone, oost, noord] = [Number(m[1]), Number(m[3].replace(',', '.')), Number(m[4].replace(',', '.'))];
  if (zone < 1 || zone > 60 || oost < 100000 || oost > 900000 || noord > 1e7) return null;
  return { zone, oost, noord, zuid: !!m[2] && m[2] < 'N' };
}

/** UTM to WGS84, by turning gradenNaarUtm around with Newton steps: exact enough here. */
export function utmNaarGraden({ zone, oost, noord, zuid = false }) {
  let lat = zuid ? (noord - 1e7) / 111200 : noord / 111200; let lon = zone * 6 - 183;
  for (let i = 0; i < 8; i++) {
    const u = gradenNaarUtm(lat, lon, zone);
    const d = 1e-5; const ua = gradenNaarUtm(lat + d, lon, zone); const ub = gradenNaarUtm(lat, lon + d, zone);
    const [j11, j12, j21, j22] = [(ua.oost - u.oost) / d, (ub.oost - u.oost) / d, (ua.noord - u.noord) / d, (ub.noord - u.noord) / d];
    const [fe, fn] = [oost - u.oost, noord - u.noord];
    const det = j11 * j22 - j12 * j21;
    lat += (j22 * fe - j12 * fn) / det; lon += (-j21 * fe + j11 * fn) / det;
  }
  return { lat, lon };
}
