// Peil in the terrain, set out on the map, and find where you stand (blad achterwaartse-insnijding). You stand
// somewhere in the world of the tochten (kijker.js, with the plaatkompas) and do not know where.
// 1. Peil a landmark (greep 2) and write down what you read.
// 2. On the map of the same world (north up, blue north-south lines, the landmarks, not you): work out the
//    terugkoers (the bearing ± 180°, as the blad says), set it on the housing, lay the edge of the compass on the
//    landmark, turn the whole compass until the north lines run with the north-south lines (orientation arrow up),
//    and draw the line: it runs from the landmark towards you (greep 4).
// 3. 'twee': do it again for a second landmark 60-120° away; where the lines cross, you stand. 'een': you stand on a
//    junction on the line; which one?
// Then tap where you think you are, and see where you were and what went wrong with each line.
import { h } from '../../dom.js';
import { keuze, schakel } from '../knoppen.js';
import { kompasDelen, s, p } from '../kompasdelen.js';
import { wegenLaag } from '../route/kaart2d.js';
import { BAKENS, maakVeld, zijde, graden } from './veld.js';
import { maakKijker, opruimen, houdKnop, SOORT } from './kijker.js';
import '../kompas.css';
import '../route/route.css';
import './peilkaart.css';

const S = SOORT.plaat;
const SCHAAL = 1.1;                       // the compass on the map: its plate is about 325 m long
const HOEK = [-66, 120];                  // the point of the plate (its left edge, near the bottom) on the landmark
const RAD = Math.PI / 180;
const TOL_LIJN = 4;                       // a line within this many degrees is good
const TOL_PLEK = 22;                      // metres
const afstand = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** Landmarks to use: 'twee' two of them 60-120° apart (closest to square first); 'een' the one whose line to you
 *  passes no other junction (so "which junction?" has one answer). */
function kiesDoelen(veld, modus) {
  const bs = veld.bakens;
  if (modus === 'twee') {
    const paren = [];
    for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
      const d = Math.abs(zijde(bs[i].peiling, bs[j].peiling));
      paren.push({ paar: [bs[i], bs[j]], d, goed: d >= 60 && d <= 120 });
    }
    const goed = paren.filter((x) => x.goed);
    const keus = goed.length ? goed[Math.floor(Math.random() * goed.length)] : paren.sort((a, b) => Math.abs(a.d - 90) - Math.abs(b.d - 90))[0];
    return Math.random() < 0.5 ? keus.paar : [...keus.paar].reverse();
  }
  const stand = veld.stand;
  const vrij = (b) => {
    // the smallest distance from another junction to the line through the landmark and you
    const ux = Math.sin(b.peiling * RAD); const uy = Math.cos(b.peiling * RAD);
    return Math.min(...veld.net.levend.filter((k) => k.wegen.length >= 3 && afstand(k, stand) > 5)
      .map((k) => Math.abs((k.x - stand.x) * uy - (k.y - stand.y) * ux)));
  };
  const lijst = bs.map((b) => ({ b, v: vrij(b) })).sort((a, c) => c.v - a.v);
  const ruim = lijst.filter((x) => x.v > 30);
  return [(ruim.length ? ruim[Math.floor(Math.random() * ruim.length)] : lijst[0]).b];
}

export default function peilkaart({ modus: start = 'twee', stil = false } = {}) {
  let modus = start === 'een' ? 'een' : 'twee';
  let veld = maakVeld(1 + Math.floor(Math.random() * 99999));
  let doelen = []; let metingen = []; let i = 0; let fase = 'peil';
  let kaartHuis = 0; let plaatHoek = 0; let tik = null; let cursor = null;
  const timers = new Set();
  const kijker = maakKijker({ kompas: 'plaat', veld, stil });
  const id = `pk-${Math.random().toString(36).slice(2, 8)}`;

  // -- the words
  const opdrachtRegel = h('p.k3-opdracht');
  const stappen = h('ol.k3-stappen');
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const kaartStand = h('p.doe-sr', { 'aria-live': 'polite' });
  const uitslag = h('div.pk-uitslag', { hidden: true });

  // -- step 1: in the terrain
  const lees = h('input.doe-veld.k3-invoer', { type: 'text', inputmode: 'numeric', maxlength: '3', autocomplete: 'off', id: `${id}-lees`,
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); naarKaart(); } } });
  const peilDeel = h('div.pk-deel',
    kijker.el, kijker.bediening,
    h('div.k3-antwoord',
      h('label.doe-label', { for: `${id}-lees` }, h('span', 'Wat lees je af bij de index? Schrijf het op.'), h('span.k3-graden', lees, h('span', { 'aria-hidden': 'true' }, '°'))),
      h('button.knop.hoofd', { type: 'button', onclick: () => naarKaart() }, 'Naar de kaart')),
    kijker.stand);

  // -- step 2: the map
  const vak = { x0: 0, y0: 0, w: 1, h: 1 };          // the map in world metres (y north)
  const kaartLaag = s('g'); const lijnenLaag = s('g'); const echtLaag = s('g'); const tikLaag = s('g');
  const { plaat, huis } = kompasDelen({ liniaal: false });
  const kompasGroep = s('g', { class: 'pk-kompas' }, plaat);
  const svg = s('svg', { class: 'pk-kaart', role: 'application', tabindex: '0',
    'aria-label': 'De kaart, noorden boven. Pijltjes links en rechts draaien het hele kompas, met Shift tien graden.' },
    kaartLaag, lijnenLaag, echtLaag, kompasGroep, tikLaag);
  const terug = h('input.doe-veld.k3-invoer', { type: 'text', inputmode: 'numeric', maxlength: '3', autocomplete: 'off', id: `${id}-terug`,
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); zetTerug(); } } });
  const kaartKnoppen = h('div.pk-knoppen',
    h('div.k3-antwoord',
      h('label.doe-label', { for: `${id}-terug` }, h('span', 'Terugkoers'), h('span.k3-graden', terug, h('span', { 'aria-hidden': 'true' }, '°'))),
      h('button.knop.klein', { type: 'button', onclick: () => zetTerug() }, 'Zet op het huis')),
    h('div.k3-bediening',
      h('div.k3-groep', { role: 'group', 'aria-label': 'Draai het hele kompas' }, h('span.k3-groep-label', 'Kompas'),
        houdKnop(timers, 'Draai het hele kompas tegen de klok in', '↺', () => zetPlaat(plaatHoek - 1)),
        houdKnop(timers, 'Draai het hele kompas met de klok mee', '↻', () => zetPlaat(plaatHoek + 1))),
      h('div.k3-groep', { role: 'group', 'aria-label': 'Draai het huis' }, h('span.k3-groep-label', 'Huis'),
        houdKnop(timers, 'Draai het huis tegen de klok in', '↺', () => zetKaartHuis(kaartHuis + 1)),
        houdKnop(timers, 'Draai het huis met de klok mee', '↻', () => zetKaartHuis(kaartHuis - 1)))),
    h('button.knop.hoofd', { type: 'button', onclick: () => trekLijn() }, 'Trek de lijn'));
  const tikKnoppen = h('div.knop-rij', h('button.knop.hoofd', { type: 'button', onclick: () => plaatsCursor() }, 'Hier sta ik'));
  const huisWaarde = h('p.pk-huiswaarde', { 'aria-hidden': 'true' });
  const kaartDeel = h('div.pk-deel', h('div.pk-kaartvak', svg), huisWaarde, kaartStand, kaartKnoppen, tikKnoppen);

  const el = h('div.k3.pk',
    h('div.k3-kop',
      h('div.chips', { role: 'group', 'aria-label': 'Hoeveel peilingen?' },
        keuze([['een', 'Eén peiling'], ['twee', 'Twee peilingen']], modus, (m) => { modus = m; nieuw(); })),
      schakel('Namen', true, (v) => kijker.zetNamen(v))),
    opdrachtRegel, stappen, peilDeel, kaartDeel, melding, uitslag,
    h('div.knop-rij',
      h('button.knop.klein', { type: 'button', onclick: () => nieuw() }, 'Opnieuw, ergens anders'),
      h('button.knop.klein', { type: 'button', onclick: () => { veld = maakVeld(1 + Math.floor(Math.random() * 99999)); kijker.zetVeld(veld); tekenKaart(); nieuw(); } }, 'Ander landschap')),
    h('p.doe-stil.k3-hulp', 'Op de kaart doet de naald niet mee: je legt het kompas met de noordlijnen langs de blauwe noord-zuidlijnen. De lijn loopt van het baken naar jou, dus je zet de terugkoers uit: je peiling plus of min 180°.'));

  // -- the map: roads, grid, landmarks; north up, y flipped
  function tekenKaart() {
    const pts = [...veld.net.levend, ...veld.bakens];
    const xs = pts.map((q) => q.x); const ys = pts.map((q) => q.y);
    const rand = 62;                              // room for the names at the edge
    Object.assign(vak, { x0: Math.min(...xs) - rand, y0: Math.min(...ys) - rand });
    vak.w = Math.max(...xs) + rand - vak.x0; vak.h = Math.max(...ys) + rand - vak.y0;
    svg.setAttribute('viewBox', `${p(vak.x0)} ${p(-(vak.y0 + vak.h))} ${p(vak.w)} ${p(vak.h)}`);
    const maat = vak.w / 300;                     // one "px" at a map 300 px wide
    svg.style.setProperty('--pk-maat', String(maat));
    kaartLaag.replaceChildren(s('rect', { x: p(vak.x0), y: p(-(vak.y0 + vak.h)), width: p(vak.w), height: p(vak.h), class: 'pk-papier' }));
    // the grid: blue north-south lines every 100 m, thin east-west lines
    for (let x = Math.ceil(vak.x0 / 100) * 100; x < vak.x0 + vak.w; x += 100) kaartLaag.append(s('path', { d: `M${x} ${p(-(vak.y0 + vak.h))}V${p(-vak.y0)}`, class: 'pk-noordlijn', 'stroke-width': p(maat * 1.3) }));
    for (let y = Math.ceil(vak.y0 / 100) * 100; y < vak.y0 + vak.h; y += 100) kaartLaag.append(s('path', { d: `M${p(vak.x0)} ${-y}H${p(vak.x0 + vak.w)}`, class: 'pk-ooslijn', 'stroke-width': p(maat * 0.7) }));
    kaartLaag.append(wegenLaag(veld.net));
    for (const b of veld.bakens) {
      const g = s('g', { transform: `translate(${p(b.x)} ${p(-b.y)}) scale(${p(maat)})`, class: 'pk-baken' });
      g.append(...{
        kerk: () => [s('circle', { r: 5 }), s('path', { d: 'M0 -5V-14M-3.5 -10.5H3.5', class: 'pk-lijntje' })],
        molen: () => [s('circle', { r: 3 }), s('path', { d: 'M-7 -7L7 7M-7 7L7 -7', class: 'pk-lijntje' })],
        eik: () => [s('circle', { r: 6, class: 'pk-boom' })],
        watertoren: () => [s('circle', { r: 6 }), s('circle', { r: 2.2, class: 'pk-gat' })],
      }[b.soort]());
      g.append(s('text', { y: 20, 'text-anchor': 'middle', class: 'pk-naam' }, BAKENS[b.soort].naam));
      kaartLaag.append(g);
    }
    // a north arrow
    kaartLaag.append(s('g', { transform: `translate(${p(vak.x0 + vak.w - 18 * maat)} ${p(-(vak.y0 + vak.h) + 22 * maat)}) scale(${p(maat)})` },
      s('path', { d: 'M0 -12L6 5L0 2L-6 5z', class: 'pk-noordpijl' }), s('text', { y: 17, 'text-anchor': 'middle', class: 'pk-naam' }, 'N')));
  }

  // -- the compass on the map
  const doel = () => doelen[i];
  function tekenKompas() {
    const b = doel(); if (!b) return;
    kompasGroep.setAttribute('transform', `translate(${p(b.x)} ${p(-b.y)}) rotate(${p(plaatHoek)}) scale(${SCHAAL}) translate(${-HOEK[0]} ${-HOEK[1]})`);
    huis.setAttribute('transform', `rotate(${p(-kaartHuis)})`);
    const scheef = zijde(plaatHoek, kaartHuis);
    const recht = Math.abs(scheef) <= 2; const omgekeerd = Math.abs(scheef) >= 178;
    huisWaarde.replaceChildren('Op het huis: ', h('strong', `${graden(kaartHuis)}°`));
    kaartStand.textContent = `Op het huis staat ${graden(kaartHuis)} graden. De richtingspijl wijst naar ${graden(plaatHoek)} graden. `
      + (recht ? 'De noordlijnen lopen gelijk met de noord-zuidlijnen van de kaart, oriëntatiepijl naar boven.'
        : omgekeerd ? 'De noordlijnen lopen gelijk, maar de oriëntatiepijl wijst naar beneden.'
          : `De noordlijnen staan ${Math.round(Math.abs(scheef))} graden scheef op de kaart.`);
  }
  function zetPlaat(g) { plaatHoek = ((g % 360) + 360) % 360; tekenKompas(); }
  function zetKaartHuis(g) { kaartHuis = ((g % 360) + 360) % 360; tekenKompas(); }
  function zetTerug() {
    const t = terug.value.trim();
    if (!/^\d{1,3}$/.test(t) || Number(t) > 360) { zeg('Vul de terugkoers in: een getal van 0 tot 360.', false); terug.focus(); return; }
    zetKaartHuis(Number(t)); zeg('', true);
  }

  // dragging on the map: round the housing turns the housing, elsewhere on the compass the whole compass (round the
  // landmark); in the last step a tap says where you stand
  const naarKaartPunt = (e) => {
    const m = svg.getScreenCTM(); if (!m) return null;
    const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: q.x, y: -q.y };
  };
  const hoek = (a, b) => Math.atan2(b.x - a.x, b.y - a.y) / RAD;      // a bearing on the map, world coordinates
  const huisMidden = () => {
    const b = doel(); const r = plaatHoek * RAD; const lx = -HOEK[0] * SCHAAL; const ly = -HOEK[1] * SCHAAL;
    // local (lx, ly) in svg (y down), turned clockwise by plaatHoek; back to world (y up)
    return { x: b.x + lx * Math.cos(r) - ly * Math.sin(r), y: b.y - (lx * Math.sin(r) + ly * Math.cos(r)) };
  };
  let sleep = null;
  svg.addEventListener('pointerdown', (e) => {
    if (e.button) return;
    const q = naarKaartPunt(e); if (!q) return;
    if (fase === 'tik') { tik = q; cursor = { ...q }; tekenTik(); uitkomst(); return; }
    if (fase !== 'kaart' || !e.target.closest('.pk-kompas')) return;
    const m = huisMidden();
    const opHuis = afstand(q, m) < 72 * SCHAAL;
    sleep = { id: e.pointerId, opHuis, hoek: hoek(opHuis ? m : doel(), q) };
    svg.setPointerCapture(e.pointerId); svg.classList.add('sleept');
    e.preventDefault();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!sleep || e.pointerId !== sleep.id) return;
    const q = naarKaartPunt(e); if (!q) return;
    const a = hoek(sleep.opHuis ? huisMidden() : doel(), q);
    const d = zijde(a, sleep.hoek); sleep.hoek = a;
    if (sleep.opHuis) zetKaartHuis(kaartHuis - d); else zetPlaat(plaatHoek + d);
  });
  const laatLos = (e) => { if (sleep && e.pointerId === sleep.id) { sleep = null; svg.classList.remove('sleept'); } };
  svg.addEventListener('pointerup', laatLos);
  svg.addEventListener('pointercancel', laatLos);
  svg.addEventListener('keydown', (e) => {
    const stap = e.shiftKey ? 10 : 1;
    if (fase === 'kaart') {
      const r = { ArrowLeft: -1, ArrowRight: 1 }[e.key]; if (!r) return;
      e.preventDefault(); zetPlaat(plaatHoek + r * stap);
    } else if (fase === 'tik') {
      // a cross to move with the arrows, Enter places it
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (d) { e.preventDefault(); cursor ??= { x: vak.x0 + vak.w / 2, y: vak.y0 + vak.h / 2 }; cursor.x += d[0] * 5 * stap; cursor.y += d[1] * 5 * stap; tekenTik(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); plaatsCursor(); }
    }
  });
  function plaatsCursor() { cursor ??= { x: vak.x0 + vak.w / 2, y: vak.y0 + vak.h / 2 }; tik = { ...cursor }; tekenTik(); uitkomst(); }
  function tekenTik() {
    const q = tik ?? cursor; tikLaag.replaceChildren();
    if (!q) return;
    const m = vak.w / 300;
    // a ring with a cross hair: not an X, that is the mill on this map
    tikLaag.append(s('g', { class: 'pk-tik', 'stroke-width': p(2.2 * m) },
      s('circle', { cx: p(q.x), cy: p(-q.y), r: p(7 * m) }),
      s('path', { d: `M${p(q.x - 11 * m)} ${p(-q.y)}h${p(22 * m)}M${p(q.x)} ${p(-q.y - 11 * m)}v${p(22 * m)}` })));
    kaartStand.textContent = tik ? '' : `Kruisje op ${Math.round(q.x - vak.x0)} meter van links en ${Math.round(q.y - vak.y0)} meter van onder. Enter: hier sta ik.`;
  }

  /** A ray on the map from a landmark, in direction g, to the edge of the map. */
  const straal = (b, g, klasse) => {
    const m = vak.w / 300; const l = 2 * Math.hypot(vak.w, vak.h);
    return s('path', { d: `M${p(b.x)} ${p(-b.y)}l${p(l * Math.sin(g * RAD))} ${p(-l * Math.cos(g * RAD))}`, class: klasse,
      'stroke-width': p((klasse === 'pk-lijn' ? 2 : 2.4) * m), ...(klasse === 'pk-echt' ? { 'stroke-dasharray': `${p(6 * m)} ${p(4 * m)}` } : {}) });
  };

  // -- the steps
  function zeg(tekst, goed) { melding.textContent = tekst; melding.classList.toggle('fout', !goed); }
  function nieuw() {
    doelen = kiesDoelen(veld, modus); metingen = []; i = 0; tik = null; cursor = null;
    lijnenLaag.replaceChildren(); echtLaag.replaceChildren(); tikLaag.replaceChildren();
    uitslag.hidden = true; uitslag.replaceChildren();
    tekenKaart();
    naarPeil();
  }
  function naarPeil() {
    fase = 'peil'; zeg('', true); lees.value = '';
    peilDeel.hidden = false; kaartDeel.hidden = true;
    const b = doel(); const naam = BAKENS[b.soort].de;
    kijker.zetKoers(b.peiling + (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 80));
    kijker.zetHuis(b.peiling + 60 + Math.random() * 240);
    opdrachtRegel.textContent = modus === 'twee' ? `Peiling ${i + 1} van 2: peil ${naam}.` : `Peil ${naam}.`;
    stappen.replaceChildren(
      h('li', S.richtNaar(naam)),
      h('li', `Draai het huis tot de rode punt van de naald ${S.huisje} staat.`),
      h('li', 'Lees de graden af bij de index en schrijf ze op. Dan naar de kaart.'));
  }
  function naarKaart() {
    const b = doel();
    const fout = kijker.richtFout(b) ?? kijker.naaldFout('huis');
    if (fout) { zeg(fout, false); return; }
    const t = lees.value.trim();
    if (!/^\d{1,3}$/.test(t) || Number(t) > 360) { zeg('Schrijf eerst op wat je bij de index leest: een getal van 0 tot 360.', false); lees.focus(); return; }
    metingen[i] = { baken: b, gelezen: Number(t) % 360, huis3d: kijker.huis() };
    fase = 'kaart'; zeg('', true);
    peilDeel.hidden = true; kaartDeel.hidden = false; kaartKnoppen.hidden = false; tikKnoppen.hidden = true; huisWaarde.hidden = false;
    svg.classList.add('kompas-aan');
    kompasGroep.style.display = '';
    // the housing as it was in the terrain; the compass on the landmark, not yet turned right
    kaartHuis = kijker.huis(); plaatHoek = graden(kaartHuis + 50 + Math.random() * 260); terug.value = '';
    tekenKompas();
    const naam = BAKENS[b.soort].de;
    opdrachtRegel.textContent = `Zet je peiling van ${naam} uit op de kaart.`;
    stappen.replaceChildren(
      h('li', `Reken de terugkoers uit: ${metingen[i].gelezen}° plus of min 180°. Zet die op het huis.`),
      h('li', `De rand van het kompas ligt op ${naam}. Draai het hele kompas tot de noordlijnen gelijk lopen met de blauwe noord-zuidlijnen, oriëntatiepijl naar boven.`),
      h('li', 'Trek de lijn langs de rand, de kant op van de richtingspijl: daar ergens sta jij.'));
    svg.focus({ preventScroll: true });
    kaartDeel.scrollIntoView?.({ block: 'nearest' });
  }
  function trekLijn() {
    const m = metingen[i]; m.kaartHuis = kaartHuis; m.plaat = plaatHoek;
    lijnenLaag.append(straal(m.baken, plaatHoek, 'pk-lijn'));
    i++;
    if (i < doelen.length) { naarPeil(); return; }
    fase = 'tik'; zeg('', true);
    kaartKnoppen.hidden = true; tikKnoppen.hidden = false; kompasGroep.style.display = 'none'; huisWaarde.hidden = true;
    svg.classList.remove('kompas-aan');
    opdrachtRegel.textContent = 'Waar sta jij?';
    stappen.replaceChildren(h('li', modus === 'twee'
      ? 'Tik op de kaart waar de twee lijnen elkaar kruisen: daar sta jij.'
      : 'Je staat op een kruispunt op je lijn. Tik op dat kruispunt. Kijk in het landschap als je twijfelt welke kant.'),
    h('li', 'Met het toetsenbord: pijltjes verschuiven een kruisje, Enter zet het neer.'));
    svg.focus({ preventScroll: true });
  }

  /** What went wrong with one line, in words; empty when the line is good. */
  function lijnFouten(m) {
    const naam = BAKENS[m.baken.soort].de;
    const juist = m.baken.peiling + 180;
    if (Math.abs(zijde(m.plaat, juist)) <= TOL_LIJN) return [];
    const uit = [];
    const tk = graden(m.gelezen + 180);
    if (Math.abs(zijde(m.gelezen, m.huis3d)) > S.tol.lees) uit.push(`Je schreef ${m.gelezen}° op, maar het huis stond op ${graden(m.huis3d)}°.`);
    if (Math.abs(zijde(m.kaartHuis, m.gelezen)) <= 4) uit.push(`Je bent de terugkoers vergeten: zo wijst de lijn vanaf ${naam} van je af. De terugkoers van ${m.gelezen}° is ${tk}°.`);
    else if (Math.abs(zijde(m.kaartHuis, tk)) > 3) uit.push(`De terugkoers van ${m.gelezen}° is ${tk}°, maar op het huis stond ${graden(m.kaartHuis)}°.`);
    const scheef = zijde(m.plaat, m.kaartHuis);
    if (Math.abs(scheef) >= 170) uit.push('De oriëntatiepijl wees naar de onderkant van de kaart: dan draait je lijn een halve slag.');
    else if (Math.abs(scheef) > 3) uit.push(`Het kompas lag ${Math.round(Math.abs(scheef))}° scheef: de noordlijnen liepen niet gelijk met de noord-zuidlijnen van de kaart.`);
    if (!uit.length) uit.push(`De lijn vanaf ${naam} wijkt ${Math.round(Math.abs(zijde(m.plaat, juist)))}° af.`);
    return uit;
  }

  function uitkomst() {
    fase = 'klaar'; tikKnoppen.hidden = true;
    const stand = veld.stand;
    // where you really were, and the right lines
    const m = vak.w / 300;
    for (const x of metingen) echtLaag.append(straal(x.baken, x.baken.peiling + 180, 'pk-echt'));
    echtLaag.append(s('circle', { cx: p(stand.x), cy: p(-stand.y), r: p(6 * m), class: 'pk-jij' }),
      s('text', { x: p(stand.x), y: p(-stand.y - 10 * m), 'text-anchor': 'middle', class: 'pk-naam pk-jij-naam', 'font-size': p(12 * m) }, 'hier stond je'));
    const d = Math.round(afstand(tik, stand));
    const goed = d <= TOL_PLEK;
    const lijnen = metingen.map((x) => ({ naam: BAKENS[x.baken.soort].de, fouten: lijnFouten(x) }));
    const lijnenGoed = lijnen.every((x) => !x.fouten.length);
    zeg(goed ? `Goed! Je stond hier: je tikte ${d} meter ernaast.`
      : `Je stond op de blauwe stip, ${d} meter van waar je tikte.${lijnenGoed ? (modus === 'twee' ? ' Je lijnen klopten: je plek is waar ze elkaar kruisen.' : ' Je lijn klopte: je plek is het kruispunt op die lijn waar je stond.') : ''}`, goed);
    uitslag.replaceChildren(
      h('p.doe-stil', 'Groen gestippeld: de goede lijnen. Rood: jouw lijnen.'),
      h('ul.pk-lijst', lijnen.map((x) => h('li', x.fouten.length ? [h('strong', `Lijn vanaf ${x.naam}: `), x.fouten.join(' ')] : `Lijn vanaf ${x.naam}: goed.`))));
    uitslag.hidden = false;
    opdrachtRegel.textContent = goed ? 'Gevonden!' : 'Bijna.';
  }

  opruimen(el, () => { kijker.dispose(); for (const t of timers) { clearTimeout(t); clearInterval(t); } });
  nieuw();
  return el;
}
