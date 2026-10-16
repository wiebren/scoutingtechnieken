// Find the Pole Star yourself, on the real sky looking north from the Netherlands. With the Steelpan: tap the two
// stars at the front of the pan, the line goes five times as far, and there you tap the Pole Star. With Cassiopeia,
// when the Steelpan stands low behind the trees: the Pole Star stands between the two, about halfway. Straight
// below the Pole Star, on the horizon, is north; its height is about your latitude.
import { h } from '../../dom.js';
import { keuze, schakel } from '../knoppen.js';
import { p, s } from '../kompasdelen.js';
import { momentNL, PLAATS } from './hemel.js';
import { BEELD, kleur, NAMEN, posities, STERREN, straal } from './sterren.js';
import '../vorm.css';
import './hemel.css';
import './sterren.css';

const B = 360; const H = 400;
const MIDDEN = 195;                            // where the Pole Star is, in the middle; the horizon falls near the bottom
const SCHAAL = 142;
const plaats = PLAATS.amersfoort;
const POOLSTER = Number(Object.keys(NAMEN).find((i) => NAMEN[i] === 'Poolster'));
const DUBHE = Number(Object.keys(NAMEN).find((i) => NAMEN[i] === 'Dubhe'));
const MERAK = Number(Object.keys(NAMEN).find((i) => NAMEN[i] === 'Merak'));
const CAS = new Set(BEELD.cassiopeia.lijnen.flat());

const NACHTEN = [
  { id: 'herfst', naam: 'Herfstavond', m: 9, d: 15, minuten: 21 * 60 + 30 },
  { id: 'winter', naam: 'Winteravond', m: 0, d: 15, minuten: 20 * 60 },
  { id: 'voorjaar', naam: 'Voorjaarsavond', m: 3, d: 15, minuten: 22 * 60 + 30 },
  { id: 'zomer', naam: 'Zomernacht', m: 6, d: 15, minuten: 23 * 60 + 45 },
];

/**
 * Height and direction to the picture, looking north with the Pole Star in the middle. A gnomonic projection: every
 * straight line on the sky (a great circle) is straight in the picture too, so the line through the pointers still
 * leads to the Pole Star. Behind you returns null.
 */
const H0 = plaats.breedte * (Math.PI / 180);
function naar({ hoogte, richting }) {
  const h = hoogte * (Math.PI / 180); const a = richting * (Math.PI / 180);
  const v = [Math.cos(h) * Math.sin(a), Math.cos(h) * Math.cos(a), Math.sin(h)];        // east, north, up
  const d = v[1] * Math.cos(H0) + v[2] * Math.sin(H0);
  if (d < 0.2) return [NaN, NaN];
  const x = v[0] / d; const y = (-v[1] * Math.sin(H0) + v[2] * Math.cos(H0)) / d;
  return [B / 2 + x * SCHAAL, MIDDEN - y * SCHAAL];
}
const HORIZON = MIDDEN + Math.tan(H0) * SCHAAL;

export default function poolsterZoeken() {
  let manier = 'steelpan';
  let nacht = NACHTEN[2];
  let figuren = false;
  let stap = 0;                 // steelpan: 0 tap the pointers, 1 tap the Pole Star, 2 done; cassiopeia: 0 tap the W, 1 the Pole Star, 2 done
  let getikt = new Set();
  let pos = [];
  let fouten = 0;

  const lucht = s('rect', { x: 0, y: 0, width: B, height: H, rx: 14, class: 'hm-nacht' });
  const lijnen = s('g');
  const hulp = s('g');
  const stippen = s('g');
  const ringen = s('g');
  const bomen = s('path', { class: 'pz-bomen' });
  const merk = s('g');
  const svg = s('svg', { viewBox: `0 0 ${B} ${H}`, class: 'hm-svg pz-svg', role: 'img', 'aria-label': 'De hemel boven het noorden, met bomen aan de horizon. Tik op de sterren.' },
    lucht, lijnen, hulp, stippen, ringen, bomen, merk);
  const opdracht = h('p.pz-opdracht');
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });

  function boomrand() {
    // a row of trees along the horizon; in the cassiopeia-way a high wood in the north-west, where the Steelpan
    // stands low on an autumn evening
    let d = `M0 ${H}V${HORIZON}`;
    for (let x = 0; x <= B; x += 12) {
      const f = manier === 'cassiopeia' ? Math.min(1, Math.max(0, (226 - x) / 60)) : 0;     // the wood, sloping down to the right
      const bos = f > 0.4;
      const hoog = manier === 'cassiopeia' ? 46 + f * 104 : 22;
      const piek = bos ? 0.86 + 0.14 * Math.abs(Math.sin(x * 0.11)) : 0.55 + 0.45 * Math.abs(Math.sin(x * 0.11) * Math.cos(x * 0.037));
      d += `L${x} ${p(HORIZON - hoog * piek)}L${x + 6} ${p(HORIZON - hoog * (bos ? 0.8 : 0.3))}`;
    }
    return `${d}L${B} ${HORIZON}V${H}Z`;
  }

  function teken() {
    const t = momentNL(2026, nacht.m, nacht.d, nacht.minuten);
    pos = posities(t, plaats.breedte, plaats.lengte);
    stippen.replaceChildren(...pos.map((q, i) => {
      if (q.hoogte < 0 || STERREN[i].mag > 4.3) return null;
      const [x, y] = naar(q);
      if (!(x > -5 && x < B + 5 && y > -5)) return null;
      return s('circle', { cx: p(x), cy: p(y), r: p(straal(STERREN[i].mag, 1.05)), fill: kleur(STERREN[i].bv) });
    }).filter(Boolean));
    // the figures, if you want them
    const lijn = (a, b, klasse = 'hm-sterlijn') => { const [x1, y1] = naar(pos[a]); const [x2, y2] = naar(pos[b]); return s('path', { d: Number.isNaN(x1 + x2) ? '' : `M${p(x1)} ${p(y1)}L${p(x2)} ${p(y2)}`, class: klasse }); };
    lijnen.replaceChildren();
    for (const id of ['grote-beer', 'kleine-beer', 'cassiopeia']) {
      if (!figuren && !(id === 'cassiopeia' && manier === 'cassiopeia' && stap > 0)) continue;
      for (const keten of BEELD[id].lijnen) for (let n = 1; n < keten.length; n++) lijnen.append(lijn(keten[n - 1], keten[n], id === 'cassiopeia' && manier === 'cassiopeia' && stap > 0 ? 'hm-sterlijn licht' : 'hm-sterlijn'));
    }
    bomen.setAttribute('d', boomrand());

    // what you have done
    ringen.replaceChildren(...[...getikt].map((i) => { const [x, y] = naar(pos[i]); return s('circle', { cx: p(x), cy: p(y), r: 9, class: 'sk-keuze' }); }));
    hulp.replaceChildren();
    if (manier === 'steelpan' && stap >= 1) {
      const [mx, my] = naar(pos[MERAK]); const [dx, dy] = naar(pos[DUBHE]);
      const [ex, ey] = [dx + 5 * (dx - mx), dy + 5 * (dy - my)];
      hulp.append(s('path', { d: `M${p(mx)} ${p(my)}L${p(ex)} ${p(ey)}`, class: 'pz-wijslijn' }));
      for (let k = 1; k <= 5; k++) { const [kx, ky] = [dx + k * (dx - mx), dy + k * (dy - my)]; hulp.append(s('circle', { cx: p(kx), cy: p(ky), r: 2, class: 'pz-tel' })); }
    }
    if (manier === 'cassiopeia' && stap >= 1) {
      const g = [...CAS]; const [gx, gy] = naar(pos[g[2]]);
      const [dx, dy] = naar(pos[DUBHE]);
      hulp.append(s('path', { d: `M${p(gx)} ${p(gy)}L${p(dx)} ${p(dy)}`, class: 'pz-wijslijn' }));
    }
    merk.replaceChildren();
    if (stap === 2) {
      const [px, py] = naar(pos[POOLSTER]);
      merk.append(s('path', { d: `M${p(px)} ${p(py + 8)}V${HORIZON}`, class: 'pz-lood' }),
        s('text', { x: p(px), y: HORIZON + 18, class: 'pz-noord', 'text-anchor': 'middle' }, 'N'),
        s('text', { x: p(px + 10), y: p(py + 4), class: 'hm-sternaam' }, 'Poolster'),
        s('text', { x: p(px + 8), y: p((py + HORIZON) / 2), class: 'hm-sternaam' }, `${Math.round(pos[POOLSTER].hoogte)}° hoog`));
    }
    const doel = { steelpan: ['Tik de twee sterren aan de voorkant van de pan: de kant zonder steel.', 'Tel vijf keer de afstand tussen die twee, verder langs de lijn. Tik de Poolster.', ''],
      cassiopeia: ['Stel: de Steelpan staat laag, achter de bomen. Tik een ster van de W: Cassiopeia.', 'De Poolster staat tussen de W en de Steelpan in, ongeveer halverwege. Tik hem.', ''] }[manier];
    opdracht.textContent = doel[stap] || 'Recht onder de Poolster, op de horizon, is het noorden.';
  }

  function tik(e) {
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * B; const y = ((e.clientY - r.top) / r.height) * H;
    let beste = null;
    pos.forEach((q, i) => {
      if (q.hoogte < 0 || STERREN[i].mag > 4.3) return;
      const [sx, sy] = naar(q);
      const d = Math.hypot(sx - x, sy - y);
      if (d < 16 && (!beste || d - straal(STERREN[i].mag) < beste.d)) beste = { i, d: d - straal(STERREN[i].mag) };
    });
    if (!beste || stap === 2) return;
    const i = beste.i;
    melding.classList.remove('fout');
    if (manier === 'steelpan' && stap === 0) {
      if (i === DUBHE || i === MERAK) {
        getikt.add(i);
        if (getikt.has(DUBHE) && getikt.has(MERAK)) { stap = 1; melding.textContent = 'Goed: Dubhe en Merak, de wijzers. Volg de gele lijn.'; } else melding.textContent = 'Goed, en nu de andere van de voorkant.';
      } else fout(i);
    } else if (manier === 'cassiopeia' && stap === 0) {
      if (CAS.has(i)) { stap = 1; getikt = new Set(); melding.textContent = 'Ja, dat is de W van Cassiopeia.'; } else fout(i);
    } else if (stap === 1) {
      if (i === POOLSTER) { stap = 2; getikt = new Set([POOLSTER]); melding.textContent = `Gevonden! Hij staat ${Math.round(pos[POOLSTER].hoogte)}° hoog: ongeveer de breedtegraad van Nederland.`; } else fout(i);
    }
    teken();
  }

  function fout(i) {
    fouten += 1;
    melding.classList.add('fout');
    const naam = NAMEN[i];
    melding.textContent = (naam ? `Dat is ${naam}. ` : 'Die niet. ')
      + (fouten >= 2 && !figuren ? 'Zet "Toon de figuren" aan als hulp.' : stap === 1 ? 'De Poolster is niet heel fel; hij staat alleen.' : 'Kijk nog eens.');
  }

  /** Show the answer of this step (also the way without a mouse). */
  function laatZien() {
    if (stap === 2) return;
    if (stap === 0 && manier === 'steelpan') { getikt = new Set([DUBHE, MERAK]); stap = 1; melding.textContent = 'Dit zijn ze: Dubhe en Merak, de wijzers.'; }
    else if (stap === 0) { stap = 1; melding.textContent = 'Daar staat de W van Cassiopeia (geel).'; }
    else { stap = 2; getikt = new Set([POOLSTER]); melding.textContent = `Daar staat hij, ${Math.round(pos[POOLSTER].hoogte)}° hoog.`; }
    melding.classList.remove('fout');
    teken();
  }

  function opnieuw() { stap = 0; getikt = new Set(); fouten = 0; melding.textContent = ''; melding.classList.remove('fout'); teken(); }

  svg.addEventListener('click', tik);
  const nachtKeuze = h('div.chips', { role: 'group', 'aria-label': 'Welke nacht' },
    keuze(NACHTEN.map((n) => [n, n.naam]), nacht, (n) => { nacht = n; opnieuw(); }));
  const manierKeuze = h('div.chips', { role: 'group', 'aria-label': 'Hoe' },
    keuze([['steelpan', 'Met de Steelpan'], ['cassiopeia', 'Met Cassiopeia']], manier, (m) => {
      manier = m;
      nacht = NACHTEN[m === 'cassiopeia' ? 0 : 2];
      nachtKeuze.querySelectorAll('.chip').forEach((c, k) => c.setAttribute('aria-pressed', String(NACHTEN[k] === nacht)));
      opnieuw();
    }));

  teken();
  return h('div.doe-poolster', manierKeuze, nachtKeuze,
    h('div.pz-beeld', svg),
    opdracht, melding,
    h('div.knop-rij', schakel('Toon de figuren', figuren, (a) => { figuren = a; teken(); }), h('button.knop.klein', { type: 'button', onclick: laatZien }, 'Laat zien'), h('button.knop.klein', { type: 'button', onclick: opnieuw }, 'Opnieuw')),
    h('p.hm-noot', 'Zo zie je de hemel als je naar het noorden kijkt, vanuit Amersfoort, op de 15e van de maand. Met een muis of vinger: tik op een ster.'));
}
