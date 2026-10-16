// The three norths, for a place and a year: the ware noorden straight up, the magnetisch noorden and the
// kaartnoorden (the lines of the RD grid) beside it, the angles drawn seven times as large but named with their real
// size. Under it, in words, what that means when you take a course from the map to the compass and back.
import { h } from '../dom.js';
import './declinatie.css';

const NS = 'http://www.w3.org/2000/svg';
const X = 180; const Y = 228;                  // the foot of the three arrows
const KEER = 7;                                 // how much larger the angles are drawn
const NU = 2026.79;                             // 15 October 2026, when the numbers below were asked
const JAAR = 2026;

// NOAA WMM-2025 for 15 October 2026 (asked again 16-10-2026), see notities/technieken/kaart-en-kompas.md §7. `dec` is
// the declination, east positive; `per` how much it grows a year; `kaart` the ware noorden against the kaartnoorden,
// east positive (the meridian convergence of RD, from the RD formulas in geo.js). The largest declination in the
// Netherlands is in the east of Groningen (Nieuweschans), not at Eemshaven (3,35°).
const PLAATSEN = [
  { naam: 'Cadzand', dec: 2.32, per: 0.16, kaart: 1.58 },
  { naam: 'Amsterdam', dec: 2.76, per: 0.16, kaart: 0.39 },
  { naam: 'Amersfoort', dec: 2.91, per: 0.16, kaart: 0 },
  { naam: 'Vaalserberg', dec: 3.09, per: 0.15, kaart: -0.5 },
  { naam: 'Enschede', dec: 3.35, per: 0.15, kaart: -1.19 },
  { naam: 'Groningen', dec: 3.27, per: 0.16, kaart: -0.94 },
  { naam: 'Nieuweschans', dec: 3.46, per: 0.16, kaart: -1.44 },
];

// The declination in Amersfoort in the past (IGRF, the same sheet), up to now. It did not grow evenly, so this is
// closer than going back from now in a straight line. Elsewhere it is taken to have been as much higher or lower
// as it is now; after now it grows by `per` a year.
const VERLOOP = [[2000, -1.2], [2010, 0.15], [2020, 1.8], [NU, 2.91]];

/** The declination in a place in a year: in October, as the numbers of now. */
function declinatieIn(plaats, jaar) {
  const t = jaar + (NU - JAAR);
  if (t >= NU) return plaats.dec + plaats.per * (t - NU);
  const i = Math.max(1, VERLOOP.findIndex(([j]) => j >= t));
  const [[j0, d0], [j1, d1]] = [VERLOOP[i - 1], VERLOOP[i]];
  return d0 + ((d1 - d0) * (t - j0)) / (j1 - j0) + plaats.dec - VERLOOP.at(-1)[1];
}

/** When the declination went through nought in a place, as a year with a fraction. */
function nulJaar(plaats) {
  for (let t = 2000; t < 2035; t += 0.01) if (declinatieIn(plaats, t + JAAR - NU) >= 0) return t;
  return null;
}

const pol = (r, g) => [X + r * Math.sin((g * Math.PI) / 180), Y - r * Math.cos((g * Math.PI) / 180)];
const p = (n) => Math.round(n * 10) / 10;
const getal = (n) => p(Math.abs(n)).toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
/** An angle with its side: "2,9° oost", or "0°" when it rounds to nothing. */
const kant = (n) => (Math.abs(n) < 0.05 ? '0°' : `${getal(n)}° ${n > 0 ? 'oost' : 'west'}`);

function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...kids.flat());
  return el;
}

export default function declinatie() {
  let plaats = PLAATSEN[2];
  let jaar = Math.min(2035, Math.max(2000, new Date().getFullYear()));

  // -- the picture: three arrows, three arcs between them, and their names
  const BOGEN = [['dec', 54], ['kk', 92], ['mc', 128]];     // declinatie, kaart to kompas, ware to kaart; their radius
  const bogen = BOGEN.map(([cls]) => s('path', { class: `dn-boog ${cls}` }));
  const boogTeksten = BOGEN.map(([cls]) => s('text', { class: `dn-boogtekst ${cls}`, 'dominant-baseline': 'central' }));
  const kaartLijn = s('path', { class: 'dn-pijl kaart' });
  const kaartTeken = s('rect', { width: 12, height: 12, class: 'dn-teken kaart' });
  const magLijn = s('path', { class: 'dn-pijl mag' });
  const magTeken = s('path', { d: 'M0 0l-6 13h12z', class: 'dn-teken mag' });
  const [wx, wy] = pol(200, 0);
  const ster = (x, y) => s('path', { d: `M${x} ${y - 13}l3 8h8l-6.5 5l2.5 8l-7-5l-7 5l2.5-8l-6.5-5h8z`, class: 'dn-teken ware' });
  // the names in a row underneath: at the tips they run into each other when the arrows are close
  const legenda = s('g', { class: 'dn-legenda' },
    ster(14, 260), s('text', { x: 29, y: 260, class: 'dn-naam ware', 'dominant-baseline': 'central' }, 'ware noorden'),
    s('path', { d: 'M128 252l-6 13h12z', class: 'dn-teken mag' }), s('text', { x: 140, y: 260, class: 'dn-naam mag', 'dominant-baseline': 'central' }, 'magnetisch'),
    s('rect', { x: 237, y: 254, width: 12, height: 12, class: 'dn-teken kaart' }), s('text', { x: 255, y: 260, class: 'dn-naam kaart', 'dominant-baseline': 'central' }, 'kaartnoorden'));

  const svg = s('svg', { viewBox: '0 0 360 272', class: 'dn-svg', role: 'img',
    'aria-label': `De drie noorden. De hoeken ertussen zijn ${KEER} keer zo groot getekend als ze zijn.` },
    bogen,
    s('path', { d: `M${X} ${Y}L${wx} ${wy}`, class: 'dn-pijl ware' }), ster(wx, wy),
    kaartLijn, kaartTeken, magLijn, magTeken, boogTeksten,
    s('circle', { cx: X, cy: Y, r: 3.5, class: 'dn-voet' }),
    s('text', { x: 4, y: 12, class: 'dn-klein' }, `hoeken ${KEER} × zo groot getekend`), legenda);

  // -- the words beside it
  const chips = PLAATSEN.map((pl) => h('button.chip', { type: 'button', 'aria-pressed': String(pl === plaats),
    onclick: () => { plaats = pl; teken(); } }, pl.naam));
  const jaarIn = h('input.dn-schuif', { type: 'range', min: 2000, max: 2035, step: 1, value: jaar,
    oninput: () => { jaar = Number(jaarIn.value); teken(); } });
  const jaarUit = h('output.dn-jaartal');
  const stand = h('ul.dn-stand', { 'aria-live': 'polite' });
  const regel = h('p.dn-regel');
  const nul = h('p.dn-nul', { 'aria-live': 'polite' });
  const noot = h('p.dn-noot');

  const el = h('div.doe-declinatie',
    h('div.dn-beeld', svg),
    h('div.dn-tekst',
      h('div.chips', { role: 'group', 'aria-label': 'Kies een plaats' }, chips),
      h('label.dn-jaar', h('span.dn-label', 'Jaar'), jaarIn, jaarUit),
      stand, regel, nul, noot));

  // -- drawing
  function pijl(lijn, teken, g, lengte) {
    const [x, y] = pol(lengte, g * KEER);
    lijn.setAttribute('d', `M${X} ${Y}L${p(x)} ${p(y)}`);
    teken.setAttribute('transform', `translate(${p(x)} ${p(y)}) rotate(${p(g * KEER)})${teken.tagName === 'rect' ? ' translate(-6 -6)' : ''}`);
  }

  /** An arc between two arrows, its size beside the arrows on the right, at the height of the arc. */
  function zetBoog(i, van, tot, waarde, hoeken) {
    const leeg = Math.abs(waarde) < 0.05;
    bogen[i].setAttribute('visibility', leeg ? 'hidden' : 'visible');
    boogTeksten[i].setAttribute('visibility', leeg ? 'hidden' : 'visible');
    if (leeg) return;
    const r = BOGEN[i][1];
    const [x1, y1] = pol(r, van * KEER); const [x2, y2] = pol(r, tot * KEER);
    bogen[i].setAttribute('d', `M${p(x1)} ${p(y1)}A${r} ${r} 0 0 ${tot > van ? 1 : 0} ${p(x2)} ${p(y2)}`);
    const y = Y - r * Math.cos((((van + tot) / 2) * KEER * Math.PI) / 180);
    const rechts = Math.max(...hoeken.map((g) => X + (Y - y) * Math.tan((g * KEER * Math.PI) / 180)));
    boogTeksten[i].setAttribute('x', p(rechts + 8));
    boogTeksten[i].setAttribute('y', p(y));
    boogTeksten[i].textContent = `${getal(waarde)}°`;
  }

  function teken() {
    const dec = declinatieIn(plaats, jaar);                    // the magnetisch noorden against the ware
    const raster = -plaats.kaart;                               // the kaartnoorden against the ware
    const kompas = dec - raster;                                // the magnetisch noorden against the kaartnoorden
    chips.forEach((c, i) => c.setAttribute('aria-pressed', String(PLAATSEN[i] === plaats)));
    jaarUit.textContent = jaar;
    jaarIn.setAttribute('aria-valuetext', String(jaar));

    pijl(magLijn, magTeken, dec, 176);
    pijl(kaartLijn, kaartTeken, raster, 150);
    const hoeken = [0, dec, raster];
    zetBoog(0, 0, dec, dec, hoeken);
    zetBoog(1, raster, dec, kompas, hoeken);
    zetBoog(2, 0, raster, raster, hoeken);

    stand.replaceChildren(
      h('li.dec', 'Declinatie, van ware naar magnetisch noorden: ', h('strong', kant(dec))),
      h('li.kk', 'Van kaartnoorden naar magnetisch noorden: ', h('strong', kant(kompas))),
      h('li.mc', 'Van ware noorden naar kaartnoorden: ', h('strong', kant(raster)),
        Math.abs(raster) < 0.05 ? ' (hier vallen ze samen)' : ''));

    // From map to compass: the needle points `kompas` degrees east of the lines of the map, so the same direction
    // has a number that much smaller on the compass than on the map (and larger when it points west of them).
    const op = kompas > 0;
    const verschil = `${getal(kompas)}°`;
    if (Math.abs(kompas) < 0.05) regel.replaceChildren('Kompas en kaart wijzen hier hetzelfde noorden aan: je hoeft niets te verbeteren.');
    else if (Math.abs(kompas) < 0.5) regel.replaceChildren(`Kompas en kaart verschillen hier ${verschil}: minder dan een halve graad. Dat zie je op je kompas niet; je hoeft niets te verbeteren.`);
    else {
      const op120 = Math.round(120 - kompas);
      regel.replaceChildren(
        `De naald wijst ${verschil} ${op ? 'oostelijker' : 'westelijker'} dan de lijnen op de kaart. Dus:`,
        h('br'), 'Van kaart naar kompas: ', h('strong', `${op ? 'trek' : 'tel'} ${verschil} ${op ? 'eraf' : 'erbij'}`), '.',
        h('br'), 'Van kompas naar kaart: ', h('strong', `${op ? 'tel' : 'trek'} ${verschil} ${op ? 'erbij' : 'eraf'}`), '.',
        h('br'), h('span.dn-voorbeeld', `Meet je op de kaart 120°, zet dan ${op120}° op je kompas.`));
    }

    // the year the needle pointed to the ware noorden here, while the slider is on it or next to it
    const n = nulJaar(plaats);
    const bijNul = n != null && Math.abs(jaar + (NU - JAAR) - n) < 1;
    nul.hidden = !bijNul;
    nul.textContent = bijNul ? `Rond ${Math.round(n)} ging de declinatie in ${plaats.naam} door nul: de naald wees toen precies naar het ware noorden. Daarvoor wees hij westelijk; dat staat nog in oudere boeken.` : '';
    noot.textContent = `${dec < 0 && !bijNul ? `In ${jaar} wees de naald hier nog westelijk van het ware noorden. ` : ''}`
      + `De getallen van ${JAAR} kloppen tot op ongeveer 0,4°. Hoe verder ervandaan, hoe minder precies.`;
  }

  teken();
  return el;
}
