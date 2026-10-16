// The maankompas (Kaart en kompas, blad maankompas): two cardboard discs on a pin. The bottom one has the
// directions round its edge and the phases of the moon round the middle (full moon at Z, new moon at N); the top one
// has a window and the hours. Turn the top disc until the phase of tonight shows in the window, then turn the whole
// thing until the time points at the moon: the bottom disc shows the directions. Here the moon stands where it really
// is on a night with that phase (the hemelrekenaar), so you also see how far the maankompas is out.
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { norm, p, pol, s, verschil } from '../kompasdelen.js';
import { datumTekst, klok, klokNL, maan, MAANMAAND, maanfase, maanPad, momentNL, PLAATS, uitDagVanJaar, zonOpOnder } from './hemel.js';
import '../vorm.css';
import './hemel.css';
import './maan.css';

const C = 180;
const ONDER = 118;              // the bottom disc
const BOVEN = 96;               // the top disc
const RING = 60;                // the ring of phases, and the window
const RAAK = 5;
const plaats = PLAATS.amersfoort;

// the phases you can choose, with the age of the moon in days and where it stands on the bottom disc
const FASEN = [
  { id: 'eerste', naam: 'eerste kwartier', dagen: 7.4 },
  { id: 'wassend', naam: 'wassende maan', dagen: 11 },
  { id: 'vol', naam: 'volle maan', dagen: 14.8 },
  { id: 'afnemend', naam: 'afnemende maan', dagen: 18.5 },
  { id: 'laatste', naam: 'laatste kwartier', dagen: 22.1 },
];
// on the bottom disc: new moon at N, first quarter at W, full at Z, last quarter at O
const opSchijf = (dagen) => norm(-(dagen / MAANMAAND) * 360);

/** The coming night (from today, within 35 days) on which the moon at midnight is closest to an age in days. */
function nachtMet(dagen) {
  const nu = klokNL(Date.now());
  let beste = null;
  for (let i = 0; i < 35; i++) {
    const { j, m, d } = uitDagVanJaar(nu.dagVanJaar + i, nu.j);
    const t = momentNL(j, m, d, 24 * 60);
    const leeftijd = maanfase(t).fase * MAANMAAND;
    const mis = Math.abs(leeftijd - dagen);
    if (!beste || mis < beste.mis) beste = { j, m, d, mis, morgen: uitDagVanJaar(nu.dagVanJaar + i + 1, nu.j) };
  }
  return beste;
}

export default function maankompasStuk() {
  let fase = FASEN[2];
  let nacht = nachtMet(fase.dagen);
  let minuten = 23 * 60;          // on the clock; past midnight counts on: 25:00 is 1:00
  let boven = 0;                  // where the window of the top disc is, on the bottom disc (degrees)
  let geheel = 137;               // where the N of the bottom disc points in the world

  // -- the world: the horizon and the moon on it
  const wereld = s('g');
  wereld.append(s('circle', { cx: C, cy: C, r: 176, class: 'hm-nacht' }), s('circle', { cx: C, cy: C, r: 172, class: 'hm-nachtrand' }));
  const echt = s('g', { visibility: 'hidden' });
  for (const [g, t] of [[0, 'N'], [90, 'O'], [180, 'Z'], [270, 'W']]) {
    const [x, y] = pol(C, C, 160, g);
    echt.append(s('text', { x: p(x), y: p(y), class: 'hm-nachtletter', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, t));
  }
  const maanTeken = s('g');

  // -- the bottom disc: directions and the phases
  const onder = s('g', { class: 'mk-onder' });
  onder.append(s('circle', { cx: 0, cy: 0, r: ONDER, class: 'mk-schijf' }));
  for (let g = 0; g < 360; g += 15) {
    const [x1, y1] = pol(0, 0, ONDER, g); const [x2, y2] = pol(0, 0, ONDER - (g % 45 ? 5 : 9), g);
    onder.append(s('path', { d: `M${p(x1)} ${p(y1)}L${p(x2)} ${p(y2)}`, class: 'mk-streep' }));
  }
  for (const [g, t] of [[0, 'N'], [45, 'NO'], [90, 'O'], [135, 'ZO'], [180, 'Z'], [225, 'ZW'], [270, 'W'], [315, 'NW']]) {
    const [x, y] = pol(0, 0, ONDER - 18, g);
    onder.append(s('text', { x: p(x), y: p(y), class: g % 90 ? 'mk-tussen' : `mk-letter${g ? '' : ' noord'}`, 'text-anchor': 'middle', 'dominant-baseline': 'central', transform: `rotate(${g} ${p(x)} ${p(y)})` }, t));
  }
  for (let i = 0; i < 8; i++) {
    const dagen = (i / 8) * MAANMAAND;
    const [x, y] = pol(0, 0, RING, opSchijf(dagen));
    onder.append(s('circle', { cx: p(x), cy: p(y), r: 10, class: 'hm-maan-donker' }), s('path', { d: maanPad(x, y, 10, i / 8), class: 'hm-maan' }));
  }

  // -- the top disc: a window, and the hours (12 above the window, 1 to 6 to the right, 11 to 6 to the left)
  const bovenSchijf = s('g', { class: 'mk-boven' });
  const [wx, wy] = pol(0, 0, RING, 0);
  bovenSchijf.append(s('path', { d: `M${-BOVEN} 0a${BOVEN} ${BOVEN} 0 1 0 ${2 * BOVEN} 0a${BOVEN} ${BOVEN} 0 1 0 ${-2 * BOVEN} 0Z`
    + `M${p(wx - 13)} ${p(wy)}a13 13 0 1 0 26 0a13 13 0 1 0 -26 0Z`, class: 'mk-schijf2', 'fill-rule': 'evenodd' }));
  bovenSchijf.append(s('circle', { cx: p(wx), cy: p(wy), r: 13, class: 'mk-venster' }));
  for (let u = -6; u <= 6; u++) {
    const [x, y] = pol(0, 0, 84, u * 15);
    const t = u === 0 ? '12' : String(u > 0 ? u : 12 + u);
    bovenSchijf.append(s('text', { x: p(x), y: p(y), class: `mk-uur${u === 0 ? ' twaalf' : ''}`, 'text-anchor': 'middle', 'dominant-baseline': 'central', transform: `rotate(${u * 15} ${p(x)} ${p(y)})` }, t));
  }
  bovenSchijf.append(s('circle', { cx: 0, cy: 0, r: 4, class: 'mk-pen' }));
  const uurWijzer = s('path', { class: 'mk-uurwijzer' });
  const kompas = s('g', {}, onder, s('g', {}, bovenSchijf), uurWijzer);
  const svg = s('svg', { viewBox: '0 0 360 360', class: 'hm-svg mk-svg', role: 'img', tabindex: '0',
    'aria-label': 'Een maankompas in het midden van een nachthemel, met de maan aan de rand. Sleep in de bovenste schijf om die te draaien, daarbuiten om het hele maankompas te draaien.' },
    wereld, echt, maanTeken, kompas);

  // -- the words
  const stappen = h('ol.mk-stappen');
  const stand = h('p.hm-uitkomst', { 'aria-live': 'polite' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const tijdUit = h('output');
  const tijdIn = h('input.doe-schuif', { type: 'range', min: 18 * 60, max: 31 * 60, step: 10, value: minuten,
    oninput: () => { minuten = Number(tijdIn.value); teken(); } });
  const draaiKnop = (wat, d) => h('button.knop.klein', { type: 'button', 'aria-label': `${wat === 'boven' ? 'Bovenste schijf' : 'Hele maankompas'} ${d < 0 ? 'linksom' : 'rechtsom'} draaien`,
    onclick: (e) => draai(wat, d * (e.shiftKey ? 10 : 3)) }, d < 0 ? '↺' : '↻');

  function waar() {
    const { j, m, d } = nacht;
    const t = momentNL(j, m, d, minuten);
    const top = zonOpOnder(j, m, d, plaats.breedte, plaats.lengte).top.t;
    const zonnetijd = minuten - (klokNL(top).minuten - 12 * 60);          // minutes, solar
    return { t, mn: maan(t, plaats.breedte, plaats.lengte), zonnetijd, zomer: klokNL(t).zomer, mf: maanfase(t, plaats.breedte, plaats.lengte) };
  }

  function draai(wat, d) {
    if (wat === 'boven') boven = norm(boven + d); else geheel = norm(geheel + d);
    vastklik();
    teken();
  }

  /** Close enough: put it right on. */
  function vastklik() {
    const doel = opSchijf(fase.dagen);
    if (verschil(boven, doel) <= RAAK) boven = doel;
    const { mn, zonnetijd } = waar();
    const uurHoek = boven + ((zonnetijd - 24 * 60) / 60) * 15;          // the time on the top disc, relative to N of the bottom disc
    const nodig = norm(mn.richting - uurHoek);
    if (verschil(boven, doel) === 0 && verschil(geheel, nodig) <= RAAK) geheel = nodig;
  }

  function teken() {
    const { mn, zonnetijd, zomer, mf } = waar();
    const doel = opSchijf(fase.dagen);
    const vensterGoed = verschil(boven, doel) === 0;
    const uren = (zonnetijd - 24 * 60) / 60;
    const uurHoek = boven + uren * 15;
    const op = mn.hoogte > 0;
    const wijstGoed = vensterGoed && op && verschil(norm(geheel + uurHoek), mn.richting) <= 0.5;

    tijdUit.textContent = klok(minuten);
    tijdIn.setAttribute('aria-valuetext', `${klok(minuten)} ${zomer ? 'zomertijd' : 'wintertijd'}`);
    kompas.setAttribute('transform', `translate(${C} ${C}) rotate(${p(geheel)})`);
    bovenSchijf.parentNode.setAttribute('transform', `rotate(${p(boven)})`);
    const [ux, uy] = pol(0, 0, BOVEN + 26, uurHoek);
    uurWijzer.setAttribute('d', `M0 0L${p(ux)} ${p(uy)}`);
    uurWijzer.setAttribute('visibility', vensterGoed ? 'visible' : 'hidden');

    const [mx, my] = pol(C, C, 150, mn.richting);
    const gezien = s('g', {}, s('circle', { cx: p(mx), cy: p(my), r: 12, class: 'hm-maan-donker' }), s('path', { d: maanPad(mx, my, 12, mf.fase), class: 'hm-maan' }));
    maanTeken.replaceChildren(gezien);
    maanTeken.setAttribute('visibility', op ? 'visible' : 'hidden');
    echt.setAttribute('visibility', wijstGoed ? 'visible' : 'hidden');
    svg.classList.toggle('klaar', wijstGoed);

    const zt = klok(Math.round(zonnetijd / 5) * 5);
    const stap = (tekst, klaar) => h('li', { class: klaar ? 'klaar' : null }, tekst);
    stappen.replaceChildren(
      stap(`Draai de bovenste schijf tot de ${fase.naam} in het venster staat.`, vensterGoed),
      stap(`Draai het hele maankompas tot ${zt} (zonnetijd) naar de maan wijst.`, wijstGoed),
      stap('Lees de windrichtingen af op de onderste schijf.', wijstGoed));

    const { morgen } = nacht;
    const wanneer = `Nacht van ${morgen.m === nacht.m ? nacht.d : datumTekst(nacht.m, nacht.d)} op ${datumTekst(morgen.m, morgen.d)}, `;
    stand.textContent = `${wanneer}${klok(minuten)} ${zomer ? 'zomertijd' : 'wintertijd'}, dat is ongeveer ${zt} zonnetijd.`
      + (op ? '' : ` De maan is nu onder de horizon: schuif de tijd.`);
    if (!op) melding.textContent = '';
    else if (!vensterGoed) melding.textContent = '';
    else if (!wijstGoed) {
      const nog = Math.round(((mn.richting - norm(geheel + uurHoek) + 540) % 360) - 180);
      melding.textContent = `Draai het hele maankompas nog ${Math.abs(nog)}° ${nog > 0 ? 'rechtsom' : 'linksom'}.`;
      melding.classList.remove('fout');
    } else {
      const fout = Math.round(((geheel + 540) % 360) - 180);
      melding.textContent = Math.abs(fout) <= 3 ? 'Het noorden van je maankompas klopt bijna precies.'
        : `Het noorden van je maankompas zit er ${Math.abs(fout)}° naast, naar het ${fout > 0 ? 'oosten' : 'westen'}.${Math.abs(fout) >= 15 ? ' Een grove richting, meer niet.' : ''}`;
    }
  }

  // -- turning with a finger or the mouse: in the top disc turns the top disc, outside it the whole thing
  let sleep = null;
  const hoekVan = (e) => {
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 360 - C; const y = ((e.clientY - r.top) / r.height) * 360 - C;
    return { hoek: (Math.atan2(x, -y) * 180) / Math.PI, afstand: Math.hypot(x, y) };
  };
  svg.addEventListener('pointerdown', (e) => {
    const { hoek, afstand } = hoekVan(e);
    if (afstand > 176) return;
    sleep = { wat: afstand < BOVEN + 4 ? 'boven' : 'geheel', hoek, start: afstand < BOVEN + 4 ? boven : geheel };
    svg.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!sleep) return;
    const d = hoekVan(e).hoek - sleep.hoek;
    // turning the top disc: relative to the bottom disc, which has been turned by `geheel`
    if (sleep.wat === 'boven') boven = norm(sleep.start + d); else geheel = norm(sleep.start + d);
    teken();
  });
  const los = () => { if (!sleep) return; sleep = null; vastklik(); teken(); };
  svg.addEventListener('pointerup', los);
  svg.addEventListener('pointercancel', los);
  svg.addEventListener('keydown', (e) => {
    const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
    if (!d) return;
    e.preventDefault();
    // first the top disc, once the phase is in the window the whole thing
    draai(verschil(boven, opSchijf(fase.dagen)) === 0 && !e.altKey ? 'geheel' : 'boven', d * (e.shiftKey ? 10 : 2));
  });

  const kiesFase = h('div.chips', { role: 'group', 'aria-label': 'Maanstand' },
    keuze(FASEN.map((f) => [f, f.naam]), fase, (f) => { fase = f; nacht = nachtMet(f.dagen); teken(); }));

  teken();
  return h('div.doe-maankompas',
    kiesFase,
    h('div.hm',
      h('div.hm-beeld', svg),
      h('div.hm-tekst',
        h('label.doe-label.hm-schuif', h('span', 'Tijd op de klok: ', tijdUit), tijdIn),
        stappen, stand, melding,
        h('div.mk-knoppen', h('span.doe-stil', 'Bovenste schijf'), draaiKnop('boven', -1), draaiKnop('boven', 1),
          h('span.doe-stil', 'Hele kompas'), draaiKnop('geheel', -1), draaiKnop('geheel', 1)),
        h('p.hm-noot', 'Sleep in de bovenste schijf om die te draaien, daarbuiten om het hele maankompas te draaien. De maan staat waar hij echt staat, in Amersfoort, in de eerstvolgende nacht met deze maanstand. Zonnetijd: in de wintertijd ongeveer 40 minuten minder dan de klok, in de zomertijd 1 uur 40.'))));
}
