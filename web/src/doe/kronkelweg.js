// Measure a winding road on the map with a string. A drawn map at 1:25.000 or 1:50.000 with a road from A to B. Lay
// the string along the road: tap or drag along it from A, the string follows; it is done when it reaches B. Then
// pull it straight against the ruler, read its length in cm and reckon it over with the scale. The answer counts
// within 10% of the real road; the feedback says whether the string, the reading or the sum went wrong.
import { h } from '../dom.js';
import './vorm.css';
import './kronkelweg.css';

const NS = 'http://www.w3.org/2000/svg';
const CM = 40;                                  // units a cm on the map
const M = 12;                                   // margin round the map
const KB = 12 * CM; const KH = 7 * CM;           // the map: 12 by 7 cm
const LY = M + KH + 34;                         // the top of the ruler
const B = KB + 2 * M; const H = LY + 46;
const VANG = 14;                                // this close to B, the string is tied to B
const MARGE = 0.1;                              // 10%

const r1 = (n) => Math.round(n * 10) / 10;
const getal = (n, max = 1) => n.toLocaleString('nl-NL', { maximumFractionDigits: max });
const afstand = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const lengte = (pts) => pts.reduce((som, p, i) => (i ? som + afstand(p, pts[i - 1]) : 0), 0);
const meters = (m) => (m < 1000 ? `${getal(Math.round(m / 10) * 10, 0)} m` : `${getal(m / 1000, 2)} km`);

function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...kids.flat());
  return el;
}

/** A smooth line through the points (Catmull-Rom), as many short pieces. */
function glad(pts, n = 14) {
  const uit = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]; const p1 = pts[i]; const p2 = pts[i + 1]; const p3 = pts[i + 2] ?? pts[i + 1];
    for (let k = 1; k <= n; k++) {
      const t = k / n; const t2 = t * t; const t3 = t2 * t;
      uit.push([0, 1].map((a) => 0.5 * (2 * p1[a] + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t2 + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t3)));
    }
  }
  return uit;
}

/** A winding road from A to B on the map, 6 to 11 cm long, with bends you cannot cut. */
function maakWeg() {
  for (;;) {
    const ax = M + 30 + Math.random() * 60; const bx = M + KB - 30 - Math.random() * 60;
    const ay = M + 50 + Math.random() * (KH - 100); const by = M + 50 + Math.random() * (KH - 100);
    const n = 4 + Math.floor(Math.random() * 3);
    const zwaai = 45 + Math.random() * 45;
    const pts = [[ax, ay]];
    for (let i = 1; i < n; i++) {
      const t = i / n;
      pts.push([ax + (bx - ax) * t + (Math.random() - 0.5) * 30, ay + (by - ay) * t + (i % 2 ? 1 : -1) * zwaai * (0.6 + Math.random() * 0.6)]);
    }
    pts.push([bx, by]);
    const weg = glad(pts);
    const cm = lengte(weg) / CM;
    const binnen = weg.every(([x, y]) => x > M + 14 && x < M + KB - 14 && y > M + 14 && y < M + KH - 14);
    if (binnen && cm >= 6 && cm <= 11.2 && cm / (afstand(weg[0], weg.at(-1)) / CM) > 1.25) return weg;
  }
}

/** What was typed, in metres: 1850, 1.850, 1,85 km, 1,85 (a small number is taken as km). NaN if no number. */
function leesMeters(tekst) {
  const t = String(tekst).toLowerCase().replace(/\s/g, '');
  const km = t.endsWith('km');
  let n = t.replace(/k?m$/, '');
  if (/^\d{1,3}(\.\d{3})+$/.test(n)) n = n.replace(/\./g, '');          // 1.850: a thousands dot
  n = Number(n.replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return NaN;
  return km || n < 30 ? n * 1000 : n;
}
const leesCm = (tekst) => { const n = Number(String(tekst).replace(/\s|cm/gi, '').replace(',', '.')); return Number.isFinite(n) && n > 0 ? n : NaN; };

export default function kronkelweg() {
  let deler; let weg; let touw; let halen; let klaar; let strak; let nagekeken; let cursor = null; let anim = 0;

  const kaart = s('g'); const wegG = s('g'); const touwLijn = s('polyline', { class: 'kw-touw' });
  const knoop = s('circle', { r: 4.5, class: 'kw-knoop' }); const cursorG = s('g', { class: 'kw-cursor', visibility: 'hidden' },
    s('path', { d: 'M-10 0h7M3 0h7M0 -10v7M0 3v7' }));
  const liniaal = s('g');
  const svg = s('svg', { viewBox: `0 0 ${B} ${H}`, class: 'kw-svg', tabindex: '0', role: 'application' },
    kaart, wegG, liniaal, touwLijn, knoop, cursorG);

  const opdracht = h('p.kw-opdracht');
  const stand = h('p.doe-sr', { 'aria-live': 'polite' });
  const terug = h('button.knop.klein', { type: 'button', onclick: () => haalTerug() }, 'Stukje terug');
  const opnieuw = h('button.knop.klein', { type: 'button', onclick: () => { if (!strak) { touw = [weg[0]]; halen = []; klaar = false; teken(); } } }, 'Touwtje opnieuw');
  const trek = h('button.knop.klein.hoofd', { type: 'button', disabled: true, onclick: () => trekStrak() }, 'Trek het touwtje strak');
  const leggen = h('div.knop-rij', terug, opnieuw, trek);

  const cmVeld = h('input.doe-veld.kw-getal', { type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false' });
  const mVeld = h('input.doe-veld.kw-getal', { type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false' });
  for (const v of [cmVeld, mVeld]) v.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); kijkNa(); } });
  const schaalTekst = h('strong');
  const naKijken = h('button.knop.hoofd', { type: 'button', onclick: () => kijkNa() }, 'Kijk na');
  const antwoord = h('div.kw-antwoord', { hidden: true },
    h('div.kw-velden',
      h('label.doe-label', h('span', 'Het touwtje is (cm)'), cmVeld),
      h('label.doe-label', h('span', 'De weg is in het echt (m)'), mVeld)),
    h('div.knop-rij', naKijken));
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const uitleg = h('p.kw-uitleg');
  const nieuw = h('button.knop', { type: 'button', onclick: () => begin() }, 'Nieuwe weg');

  const el = h('div.doe-kronkelweg', opdracht, h('div.kw-beeld', svg), leggen, antwoord, melding, uitleg, stand, h('div.knop-rij', nieuw));

  // -- drawing
  function tekenKaart() {
    const km = (deler === 25000 ? 4 : 2) * CM;
    kaart.replaceChildren(s('rect', { x: M, y: M, width: KB, height: KH, rx: 4, class: 'kw-grond' }),
      s('path', { d: `M${M + 40} ${M + 30}q70 -20 110 20t-30 70q-60 20 -80 -30z`, class: 'kw-bos' }),
      s('path', { d: `M${M + 300} ${M + 170}q60 -30 110 0t-10 80q-70 20 -100 -30z`, class: 'kw-bos' }),
      s('path', { d: `M${M + 200} ${M + KH}C${M + 210} ${M + 200} ${M + 260} ${M + 120} ${M + 250} ${M}`, class: 'kw-sloot' }));
    for (let x = M + km; x < M + KB; x += km) kaart.append(s('path', { d: `M${x} ${M}v${KH}`, class: 'kw-raster' }));
    for (let y = M + KH - km; y > M; y -= km) kaart.append(s('path', { d: `M${M} ${y}h${KB}`, class: 'kw-raster' }));
    kaart.append(s('rect', { x: M + KB - 128, y: M + KH - 32, width: 120, height: 26, rx: 3, class: 'kw-schaalvak' }),
      s('text', { x: M + KB - 68, y: M + KH - 13, class: 'kw-schaal', 'text-anchor': 'middle' }, `1:${getal(deler, 0)}`));
    // the ruler: 0 to 12 cm, a tick each mm
    liniaal.replaceChildren(s('rect', { x: M - 6, y: LY, width: KB + 12, height: 34, rx: 4, class: 'kw-liniaal' }));
    for (let mm = 0; mm <= 120; mm++) {
      const x = r1(M + (mm * CM) / 10);
      liniaal.append(s('path', { d: `M${x} ${LY}v${mm % 10 ? (mm % 5 ? 5 : 8) : 12}`, class: mm % 10 ? 'kw-streep dun' : 'kw-streep' }));
      if (!(mm % 10)) liniaal.append(s('text', { x, y: LY + 26, class: 'kw-cijfer', 'text-anchor': 'middle' }, String(mm / 10)));
    }
    liniaal.append(s('text', { x: M + CM / 2, y: LY + 26, class: 'kw-klein', 'text-anchor': 'middle' }, 'cm'));
  }

  function tekenWeg() {
    const d = `M${weg.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L')}`;
    const [a, b] = [weg[0], weg.at(-1)];
    wegG.replaceChildren(s('path', { d, class: 'kw-weg-rand' }), s('path', { d, class: 'kw-weg' }));
    for (const [[x, y], t] of [[a, 'A'], [b, 'B']]) {
      wegG.append(s('circle', { cx: r1(x), cy: r1(y), r: 7, class: 'kw-punt' }),
        s('text', { x: r1(x), y: r1(y - 13), class: 'kw-naam', 'text-anchor': 'middle' }, t));
    }
  }

  function teken() {
    touwLijn.setAttribute('points', touw.map(([x, y]) => `${r1(x)},${r1(y)}`).join(' '));
    const [kx, ky] = touw.at(-1);
    knoop.setAttribute('cx', r1(kx)); knoop.setAttribute('cy', r1(ky));
    trek.disabled = !klaar || strak;
    terug.disabled = strak || !halen.length;
    opnieuw.disabled = strak || touw.length < 2;
    if (cursor && !strak) { cursorG.setAttribute('visibility', 'visible'); cursorG.setAttribute('transform', `translate(${r1(cursor[0])} ${r1(cursor[1])})`); }
    else cursorG.setAttribute('visibility', 'hidden');
    if (!strak) {
      opdracht.textContent = klaar
        ? 'Het touwtje ligt van A tot B. Ligt het goed in alle bochten? Trek het dan strak langs de liniaal.'
        : 'Leg een touwtje langs de weg, van A naar B. Tik of sleep langs de weg: het touwtje volgt. Leg in elke bocht een paar punten.';
    }
  }

  function begin() {
    cancelAnimationFrame(anim);
    deler = Math.random() < 0.5 ? 25000 : 50000;
    weg = maakWeg(); touw = [weg[0]]; halen = []; klaar = false; strak = false; nagekeken = false; cursor = null;
    schaalTekst.textContent = `1:${getal(deler, 0)}`;
    for (const v of [cmVeld, mVeld]) { v.value = ''; v.disabled = false; }
    antwoord.hidden = true; leggen.hidden = false; naKijken.disabled = false;
    melding.textContent = ''; melding.classList.remove('fout'); uitleg.textContent = '';
    svg.setAttribute('aria-label', `Een kaart van 1:${getal(deler, 0)} met een kronkelige weg van A naar B en een liniaal in centimeters. Pijltjes zetten een kruisje, Enter legt het touwtje daarheen, Backspace haalt een stukje terug.`);
    tekenKaart(); tekenWeg(); teken();
  }

  // -- laying the string
  function legAan(p) {
    if (klaar || strak) return;
    touw.push(p);
    if (afstand(p, weg.at(-1)) <= VANG) { touw[touw.length - 1] = weg.at(-1); klaar = true; stand.textContent = 'Het touwtje ligt bij B.'; }
  }
  function haalTerug() {
    if (strak || !halen.length) return;
    touw.length = halen.pop(); klaar = false;
    stand.textContent = 'Een stukje touw teruggehaald.';
    teken();
  }

  const plek = (e) => {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    return [Math.min(M + KB, Math.max(M, q.x)), Math.min(M + KH, Math.max(M, q.y))];
  };
  let sleept = false;
  svg.addEventListener('pointerdown', (e) => {
    if (strak || klaar || e.button > 0) return;
    const p = plek(e);
    cursor = null; sleept = true; halen.push(touw.length);
    svg.setPointerCapture(e.pointerId); e.preventDefault();
    legAan(p); teken();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!sleept || klaar) return;
    const p = plek(e);
    if (afstand(p, touw.at(-1)) >= 7) { legAan(p); teken(); }
  });
  const los = () => {
    if (!sleept) return;
    sleept = false;
    if (!klaar) stand.textContent = `Het eind van het touwtje ligt ${getal(afstand(touw.at(-1), weg.at(-1)) / CM)} cm van B.`;
  };
  svg.addEventListener('pointerup', los);
  svg.addEventListener('pointercancel', los);
  svg.addEventListener('keydown', (e) => {
    if (strak) return;
    if (e.key === 'Backspace') { e.preventDefault(); haalTerug(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && cursor && !klaar) {
      e.preventDefault(); halen.push(touw.length); legAan(cursor); teken();
      if (!klaar) stand.textContent = `Touwtje gelegd. Het eind ligt ${getal(afstand(touw.at(-1), weg.at(-1)) / CM)} cm van B.`;
      return;
    }
    const r = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!r || klaar) return;
    e.preventDefault();
    const stap = e.shiftKey ? 40 : 8;
    const van = cursor ?? touw.at(-1);
    cursor = [Math.min(M + KB, Math.max(M, van[0] + r[0] * stap)), Math.min(M + KH, Math.max(M, van[1] + r[1] * stap))];
    teken();
  });
  svg.addEventListener('blur', () => { if (cursor) { cursor = null; teken(); } });

  // -- pulling it straight: each point of the string slides to its place along the ruler
  function trekStrak() {
    if (!klaar || strak) return;
    strak = true; cursor = null;
    const van = touw.map((p) => [...p]);
    let som = 0;
    const naar = touw.map((p, i) => { if (i) som += afstand(p, touw[i - 1]); return [M + som, LY - 7]; });
    const klaarMet = () => {
      touw = naar; teken();
      leggen.hidden = true; antwoord.hidden = false;
      opdracht.replaceChildren('Lees op de liniaal af hoe lang het touwtje is. Reken het om met de schaal van de kaart: ', schaalTekst, '.');
      stand.textContent = 'Het touwtje ligt strak langs de liniaal, met het begin bij 0.';
      cmVeld.focus({ preventScroll: true });
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { klaarMet(); return; }
    const start = performance.now();
    const stap = (nu) => {
      if (!svg.isConnected || !strak) return;
      const t = Math.min(1, (nu - start) / 900); const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      touw = van.map((p, i) => [p[0] + (naar[i][0] - p[0]) * e, p[1] + (naar[i][1] - p[1]) * e]);
      teken();
      if (t < 1) anim = requestAnimationFrame(stap); else klaarMet();
    };
    anim = requestAnimationFrame(stap);
  }

  // -- checking
  function kijkNa() {
    if (!strak || nagekeken) return;
    const gc = leesCm(cmVeld.value); const gm = leesMeters(mVeld.value);
    if (Number.isNaN(gm)) { melding.classList.add('fout'); melding.textContent = 'Schrijf eerst op hoe lang de weg in het echt is, in meters.'; mVeld.focus(); return; }
    nagekeken = true; naKijken.disabled = true;
    for (const v of [cmVeld, mVeld]) v.disabled = true;
    const perCm = deler / 100;                           // metres a cm
    const touwCm = lengte(touw) / CM; const wegCm = lengte(weg) / CM;
    const echt = wegCm * perCm; const recht = (afstand(weg[0], weg.at(-1)) / CM) * perCm;
    const goed = Math.abs(gm - echt) <= MARGE * echt;
    const zinnen = [];
    if (!Number.isNaN(gc) && Math.abs(gc - touwCm) > Math.max(0.2, 0.05 * touwCm)) {
      zinnen.push(`Je touwtje is ${getal(touwCm)} cm: kijk waar het eind op de liniaal staat.`);
    }
    if (Math.abs(touwCm - wegCm) > MARGE * wegCm) {
      zinnen.push(touwCm < wegCm ? `Je touwtje (${getal(touwCm)} cm) is korter dan de weg (${getal(wegCm)} cm): je hebt bochten afgesneden. Leg meer punten in de bochten.`
        : `Je touwtje (${getal(touwCm)} cm) is langer dan de weg (${getal(wegCm)} cm): het slingert naast de weg.`);
    }
    const cm = Number.isNaN(gc) ? touwCm : gc;
    if (!goed && Math.abs(gm - cm * perCm) > MARGE * cm * perCm) {
      const ander = deler === 25000 ? 500 : 250;
      zinnen.push(Math.abs(gm - cm * ander) <= MARGE * cm * ander ? `Je rekende met ${ander} m per cm. Maar deze kaart is 1:${getal(deler, 0)}: 1 cm is ${perCm} m.`
        : `Op 1:${getal(deler, 0)} is 1 cm in het echt ${getal(deler, 0)} cm, dat is ${perCm} m. Dus ${getal(cm)} cm × ${perCm} m = ${meters(cm * perCm)}.`);
    }
    melding.classList.toggle('fout', !goed);
    melding.textContent = goed ? `Goed! De weg is ongeveer ${meters(echt)}.${zinnen.length ? ` ${zinnen.join(' ')}` : ''}`
      : `Nog niet: de weg is ongeveer ${meters(echt)}. ${zinnen.join(' ')}`.trim();
    uitleg.textContent = `De weg is op de kaart ${getal(wegCm)} cm. Op 1:${getal(deler, 0)} is dat ${getal(wegCm)} × ${perCm} m = ${meters(echt)}. In een rechte lijn van A naar B is het maar ${meters(recht)}: met de liniaal alleen meet je een kronkelweg veel te kort. De groene streepjeslijn boven je touwtje is de echte lengte van de weg. Binnen 10% is goed.`;
    // show the road beside the string, to compare
    liniaal.append(s('path', { d: `M${M} ${LY - 15}h${r1(wegCm * CM)}`, class: 'kw-echt' }));
    nieuw.focus({ preventScroll: true });
  }

  begin();
  return el;
}
