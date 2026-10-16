// The sun and a stick on the ground, seen from above, for the Netherlands on a day you choose. Nothing tells you where
// north is: the picture is turned at random. Three ways to find it, as on the cards of Kaart en kompas:
//  - middag: mark the tip of the shadow every few minutes around midday; the shortest shadow points north;
//  - uren: a garden sundial with hour lines for 52 degrees north; turn it until the shadow shows the solar time,
//    then its 12 points north;
//  - schaduwstok: two stones a quarter of an hour apart lie west to east.
// Once you are done, the real north shows, and how far you are out.
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { norm, p, pol, s, verschil } from '../kompasdelen.js';
import { beginStaat, datum, datumSchuif, moment, tijdNaam, tijdSchuif } from './bediening.js';
import { klok, klokNL, PLAATS, zon, zonOpOnder } from './hemel.js';
import './zonnewijzer.css';

const C = 180;
const STOK = 46;                 // the height of the stick in units of the picture
const BREEDTE = PLAATS.amersfoort.breedte;
const LENGTE = PLAATS.amersfoort.lengte;
const RAD = Math.PI / 180;
const draaiing = (a, b) => ((a - b + 540) % 360) - 180;

/** The angle of the hour line of a solar time (hours) on a horizontal sundial at 52 degrees, from the 12 line. */
const uurlijn = (uren) => {
  const H = (uren - 12) * 15 * RAD;
  return Math.atan2(Math.sin(BREEDTE * RAD) * Math.sin(H), Math.cos(H)) / RAD;
};

const UITLEG = {
  middag: 'Leg om de paar minuten een steentje op het puntje van de schaduw, van voor tot na de middag. Het kortste puntje wijst vanaf de stok naar het noorden.',
  uren: 'Een tuinzonnewijzer, plat op de grond. Draai hem tot de schaduw van de stijl de zonnetijd aanwijst; dan wijst de 12 naar het noorden.',
  schaduwstok: 'Leg een steentje op het puntje van de schaduw, wacht een kwartier, en leg er nog een. Van het eerste naar het tweede steentje is van west naar oost.',
};

export default function zonnewijzerStuk({ soort: begin = 'middag' } = {}) {
  let soort = begin;
  const staat = beginStaat({ minuten: 12 * 60 });
  let wereld = 0;                 // where north is in the picture (degrees), at random
  let wijzer = 0;                 // where the 12 of the sundial points in the picture
  let stenen = [];                // the tips of the shadow marked, in the world: { richting, lengte, minuten }
  let klaar = false;

  // -- the picture
  const grond = s('circle', { cx: C, cy: C, r: 172, class: 'zw-grond' });
  const echtNoorden = s('g', { visibility: 'hidden' });
  const lijnen = s('g');                       // what you worked out: the north line, or west-east
  const cirkel = s('circle', { cx: C, cy: C, class: 'zw-cirkel', visibility: 'hidden' });
  const steentjes = s('g');
  const schijf = s('g', { class: 'zw-schijf' });
  const schaduw = s('path', { class: 'zw-schaduw' });
  const stok = s('circle', { cx: C, cy: C, r: 5, class: 'zw-stok' });
  const svg = s('svg', { viewBox: '0 0 360 360', class: 'hm-svg zw-svg', role: 'img', tabindex: '-1' },
    grond, cirkel, schijf, echtNoorden, lijnen, schaduw, steentjes, stok);

  // the sundial: hour lines for 6 to 18 hours solar time, and the style along the 12 line
  for (let u = 6; u <= 18; u++) {
    const g = uurlijn(u);
    const [x, y] = pol(0, 0, 96, g); const [tx, ty] = pol(0, 0, 112, g);
    schijf.append(s('path', { d: `M0 0L${p(x)} ${p(y)}`, class: `zw-uurlijn${u === 12 ? ' twaalf' : ''}` }),
      s('text', { x: p(tx), y: p(ty), class: `zw-uur${u === 12 ? ' twaalf' : ''}`, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, String(u)));
  }
  schijf.prepend(s('path', { d: 'M-128 0A128 128 0 0 1 128 0L128 22H-128Z', class: 'zw-plaat' }));
  schijf.append(s('path', { d: 'M-3 0L0 -84L3 0Z', class: 'zw-stijl' }));

  // -- the words
  const stand = h('p.hm-uitkomst', { 'aria-live': 'polite' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const uitleg = h('p');
  const opnieuw = () => teken();
  const datumS = datumSchuif(staat, opnieuw);
  const tijdS = tijdSchuif(staat, opnieuw, { van: 6 * 60, tot: 21 * 60, stap: 1 });
  const legKnop = h('button.knop.klein.hoofd', { type: 'button', onclick: () => leg() }, 'Leg een steentje');
  const wachtKnop = h('button.knop.klein', { type: 'button', onclick: () => { staat.minuten = Math.min(21 * 60, staat.minuten + 15); tijdS.zet(); teken(); } }, 'Wacht een kwartier');
  const klaarKnop = h('button.knop.klein', { type: 'button', onclick: () => { klaar = true; teken(); } }, 'Klaar: waar is het noorden?');
  const nieuwKnop = h('button.knop.klein', { type: 'button', onclick: () => nieuw() }, 'Opnieuw');
  const draaiKnop = (d) => h('button.knop.klein', { type: 'button', 'aria-label': `Zonnewijzer ${d < 0 ? 'linksom' : 'rechtsom'} draaien`,
    onclick: (e) => { wijzer = norm(wijzer + d * (e.shiftKey ? 10 : 1)); vastklik(); teken(); } }, d < 0 ? '↺' : '↻');
  const draaiRij = h('div.knop-rij.zw-draai', h('span.doe-stil', 'Zonnewijzer'), draaiKnop(-1), draaiKnop(1));
  const knoppen = h('div.knop-rij');

  function zonNu() {
    const z = zon(moment(staat), BREEDTE, LENGTE);
    let H = z.uurhoek % (2 * Math.PI);
    if (H > Math.PI) H -= 2 * Math.PI; if (H < -Math.PI) H += 2 * Math.PI;
    return { ...z, zonnetijd: 12 + H / RAD / 15 };
  }

  function leg() {
    const z = zonNu();
    if (z.hoogte <= 1) return;
    if (soort === 'schaduwstok' && stenen.length >= 2) return;
    stenen.push({ richting: norm(z.richting + 180), lengte: Math.min(168, STOK / Math.tan(z.hoogte * RAD)), minuten: staat.minuten });
    if (soort === 'schaduwstok' && stenen.length === 2) klaar = true;
    teken();
  }

  function nieuw() {
    wereld = Math.floor(Math.random() * 360);
    wijzer = norm(wereld + 120 + Math.random() * 120);
    stenen = []; klaar = false;
    staat.minuten = soort === 'middag' ? (klokNL(moment(staat)).zomer ? 13 * 60 + 10 : 12 * 60 + 10) : soort === 'uren' ? 15 * 60 : 10 * 60 + 30;
    tijdS.zet();
    teken();
  }

  /** The sundial close to right: put it right on. */
  function vastklik() {
    const z = zonNu();
    const goed = norm(wereld + (uurlijnZon(z) - uurlijn(z.zonnetijd)));
    if (verschil(wijzer, goed) <= 3) wijzer = goed;
  }
  // where the shadow of the style falls, from north in the world
  const uurlijnZon = (z) => uurlijn(z.zonnetijd);

  function teken() {
    const z = zonNu();
    const op = z.hoogte > 1;
    const dt = datum(staat);

    // the shadow of the stick (or of the style of the sundial)
    if (soort === 'uren') {
      const [x, y] = pol(C, C, 100, wereld + uurlijnZon(z));
      schaduw.setAttribute('d', `M${C} ${C}L${p(x)} ${p(y)}`);
    } else {
      const lengte = op ? Math.min(168, STOK / Math.tan(z.hoogte * RAD)) : 0;
      const [x, y] = pol(C, C, lengte, wereld + z.richting + 180);
      schaduw.setAttribute('d', `M${C} ${C}L${p(x)} ${p(y)}`);
    }
    schaduw.setAttribute('visibility', op ? 'visible' : 'hidden');
    schijf.setAttribute('transform', `translate(${C} ${C}) rotate(${p(wijzer)})`);
    schijf.setAttribute('visibility', soort === 'uren' ? 'visible' : 'hidden');
    stok.setAttribute('visibility', soort === 'uren' ? 'hidden' : 'visible');

    // the stones; the shortest one ringed
    const kortste = stenen.reduce((k, x) => (!k || x.lengte < k.lengte ? x : k), null);
    steentjes.replaceChildren(...stenen.map((x, i) => {
      const [sx, sy] = pol(C, C, x.lengte, wereld + x.richting);
      return s('g', {}, s('circle', { cx: p(sx), cy: p(sy), r: 6, class: `zw-steen${soort === 'middag' && x === kortste ? ' kortst' : ''}` }),
        soort === 'schaduwstok' && s('text', { x: p(sx), y: p(sy) - 12, class: 'zw-label', 'text-anchor': 'middle' }, String(i + 1)));
    }));
    if (soort === 'schaduwstok' && stenen.length === 1) {
      cirkel.setAttribute('r', p(stenen[0].lengte));
      cirkel.setAttribute('visibility', 'visible');
    } else cirkel.setAttribute('visibility', 'hidden');

    // the real north, once done
    const [nx, ny] = pol(C, C, 150, wereld);
    echtNoorden.replaceChildren(s('path', { d: `M${C} ${C}L${p(nx)} ${p(ny)}`, class: 'zw-noord' }),
      s('text', { x: p(pol(C, C, 162, wereld)[0]), y: p(pol(C, C, 162, wereld)[1]), class: 'zw-noordletter', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, 'N'));

    // what you worked out
    let gevonden = null;
    lijnen.replaceChildren();
    if (soort === 'middag' && klaar && kortste) {
      gevonden = kortste.richting;
      const [kx, ky] = pol(C, C, Math.max(kortste.lengte, 120), wereld + gevonden);
      lijnen.append(s('path', { d: `M${C} ${C}L${p(kx)} ${p(ky)}`, class: 'zw-jouw' }));
    }
    if (soort === 'schaduwstok' && stenen.length === 2) {
      const [a, b] = stenen.map((x) => pol(C, C, x.lengte, wereld + x.richting));
      const oost = Math.atan2(b[0] - a[0], -(b[1] - a[1])) / RAD;      // from stone 1 to stone 2, in the picture
      gevonden = norm(oost - 90 - wereld);
      const [m1, m2] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const [n1, n2] = pol(m1, m2, 90, oost - 90);
      lijnen.append(s('path', { d: `M${p(a[0])} ${p(a[1])}L${p(b[0])} ${p(b[1])}`, class: 'zw-weoost' }),
        s('path', { d: `M${p(m1)} ${p(m2)}L${p(n1)} ${p(n2)}`, class: 'zw-jouw' }));
      for (const [pt, t] of [[a, 'W'], [b, 'O']]) {
        const [lx, ly] = pol(pt[0], pt[1], 20, oost + (t === 'W' ? 180 : 0));
        lijnen.append(s('text', { x: p(lx), y: p(ly), class: 'zw-label vet', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, t));
      }
    }
    let zonnewijzerGoed = false;
    if (soort === 'uren') {
      const goed = norm(wereld + (uurlijnZon(z) - uurlijn(z.zonnetijd)));
      zonnewijzerGoed = op && verschil(wijzer, goed) <= 0.5;
      if (zonnewijzerGoed) { klaar = true; gevonden = norm(wijzer - wereld); }
    }
    echtNoorden.setAttribute('visibility', klaar && gevonden != null ? 'visible' : 'hidden');

    // the words
    const zt = klok(Math.round(z.zonnetijd * 60));
    const midden = zonOpOnder(dt.j, dt.m, dt.d, BREEDTE, LENGTE).top.t;
    stand.textContent = `${dt.tekst}, ${klok(staat.minuten)} ${tijdNaam(staat)}`
      + (soort === 'uren' ? `: dat is ${zt} zonnetijd.` : '.')
      + (op ? '' : ' De zon is onder.');
    uitleg.textContent = UITLEG[soort];
    if (gevonden != null && klaar) {
      const fout = Math.round(draaiing(gevonden, 0));
      melding.classList.toggle('fout', Math.abs(fout) > 10);
      melding.textContent = (Math.abs(fout) <= 2 ? 'Precies: je hebt het noorden gevonden.' : `Je zit er ${Math.abs(fout)}° naast, naar het ${fout > 0 ? 'oosten' : 'westen'}.`)
        + (soort === 'middag' ? ` Die dag stond de zon om ${klok(klokNL(midden).minuten)} in het zuiden.` : '')
        + (soort === 'schaduwstok' && Math.abs(fout) > 5 ? ' Preciezer: leg het tweede steentje pas als de schaduw weer even lang is als bij het eerste (de cirkel).' : '');
    } else if (soort === 'uren' && op) {
      const nog = Math.round(draaiing(norm(wereld + (uurlijnZon(z) - uurlijn(z.zonnetijd))), wijzer));
      melding.classList.remove('fout');
      melding.textContent = `Draai de zonnewijzer tot de schaduw op ${zt} valt.${Math.abs(nog) <= 15 ? ` Bijna: nog een stukje ${nog > 0 ? 'rechtsom' : 'linksom'}.` : ''}`;
    } else if (soort === 'middag') {
      melding.classList.remove('fout');
      melding.textContent = stenen.length ? `${stenen.length} ${stenen.length === 1 ? 'steentje' : 'steentjes'}; het kortste lag om ${klok(kortste.minuten)}.` : '';
    } else melding.textContent = '';

    knoppen.replaceChildren(...(soort === 'uren' ? [nieuwKnop] : soort === 'middag' ? [legKnop, klaarKnop, nieuwKnop] : [legKnop, wachtKnop, nieuwKnop]));
    legKnop.disabled = !op || (soort === 'schaduwstok' && stenen.length >= 2) || klaar;
    klaarKnop.disabled = stenen.length < 2 || klaar;
    draaiRij.hidden = soort !== 'uren';
    svg.setAttribute('aria-label', `Een ${soort === 'uren' ? 'zonnewijzer' : 'stok'} op de grond, van bovenaf, met de schaduw. ${stand.textContent}`);
  }

  // -- turning the sundial with a finger or the mouse
  let sleep = null;
  const hoekVan = (e) => {
    const r = svg.getBoundingClientRect();
    return (Math.atan2(((e.clientX - r.left) / r.width) * 360 - C, -(((e.clientY - r.top) / r.height) * 360 - C)) * 180) / Math.PI;
  };
  svg.addEventListener('pointerdown', (e) => {
    if (soort !== 'uren') return;
    sleep = { hoek: hoekVan(e), start: wijzer };
    svg.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  svg.addEventListener('pointermove', (e) => { if (sleep) { wijzer = norm(sleep.start + hoekVan(e) - sleep.hoek); teken(); } });
  const los = () => { if (sleep) { sleep = null; vastklik(); teken(); } };
  svg.addEventListener('pointerup', los);
  svg.addEventListener('pointercancel', los);
  svg.addEventListener('keydown', (e) => {
    const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
    if (!d || soort !== 'uren') return;
    e.preventDefault();
    wijzer = norm(wijzer + d * (e.shiftKey ? 10 : 1)); vastklik(); teken();
  });

  const keuzes = begin === 'schaduwstok' ? null : h('div.chips', { role: 'group', 'aria-label': 'Welke manier' },
    keuze([['middag', 'Kortste schaduw'], ['uren', 'Zonnewijzer met uren']], soort, (k) => {
      soort = k; svg.setAttribute('tabindex', k === 'uren' ? '0' : '-1'); svg.classList.toggle('draait', k === 'uren'); nieuw();
    }));

  nieuw();
  svg.setAttribute('tabindex', soort === 'uren' ? '0' : '-1');
  svg.classList.toggle('draait', soort === 'uren');
  return h('div.doe-zonnewijzer', keuzes,
    h('div.hm',
      h('div.hm-beeld', svg),
      h('div.hm-tekst', uitleg, datumS.el, tijdS.el, knoppen, draaiRij, stand, melding,
        h('p.hm-noot', 'Van bovenaf gezien, in Amersfoort. Het plaatje is willekeurig gedraaid: waar het noorden is, zie je pas als je klaar bent.'))));
}
