// A baseplate compass to turn: drag the housing to set a course, drag the plate to turn the whole compass. The
// needle keeps pointing north, so "rood in het huisje" can be tried with a finger. With an opdracht it asks for
// one: walk a course (greep 1), take a bearing on something you see (greep 2), or the way back (terugkoers). With
// `sensor` a phone is the compass: the plate is the phone, and the needle follows the real north.
import { h } from '../dom.js';
import { kompasDelen, norm, p, pol as polVan, R, s, streek16, verschil } from './kompasdelen.js';
import './kompas.css';

const C = 180;                                  // the pivot: the middle of the housing, in the middle of the picture
const pol = (r, g) => polVan(C, C, r, g);

/** The things around you to take a bearing on, at a distance on the edge of the picture. */
const DOELEN = [['kerktoren', '⛪'], ['watertoren', '🗼'], ['windmolen', '🌬️'], ['boom', '🌳'], ['hoogspanningsmast', '⚡'], ['uitkijktoren', '🔭']];

export default function kompas({ opdracht = null, sensor = false } = {}) {
  let koers = 0;                 // the course set on the housing: the degrees at the index
  let plaat = sensor ? 0 : 35;   // where the direction arrow points, in degrees from north
  let noorden = 0;               // where north is on the screen (turns with a phone, else 0)
  let doel = null;               // { graden, naam, teken } for peilen
  let taak = null;               // the course asked for, or the way out for terug
  let sensorAan = false;

  // -- the picture
  const wereld = s('g', { class: 'kk-wereld' });
  for (let g = 0; g < 360; g += 15) {
    const [x1, y1] = pol(166, g); const [x2, y2] = pol(g % 45 ? 171 : 176, g);
    wereld.append(s('path', { d: `M${p(x1)} ${p(y1)}L${p(x2)} ${p(y2)}`, class: 'kk-wereld-streep' }));
  }
  for (const [g, t] of [[0, 'N'], [90, 'O'], [180, 'Z'], [270, 'W']]) {
    const [x, y] = pol(155, g);
    wereld.append(s('text', { x: p(x), y: p(y), class: `kk-wereld-letter${g ? '' : ' noord'}`, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, t));
  }
  const doelTeken = s('g', { class: 'kk-doel', visibility: 'hidden' });

  const { plaat: plaatGroep, huis, naald } = kompasDelen();

  const svg = s('svg', { viewBox: '0 0 360 360', class: 'kk-svg', role: 'img', tabindex: '0',
    'aria-label': 'Kompas. Pijltjes links en rechts draaien het huis, met Shift het hele kompas.' },
    s('circle', { cx: C, cy: C, r: 178, class: 'kk-grond' }), wereld, doelTeken, plaatGroep, naald);

  // -- the words beside it
  const opdrachtRegel = h('p.kk-opdracht');
  const stappen = h('ol.kk-stappen');
  const stand = h('p.kk-stand', { 'aria-live': 'polite' });
  const melding = h('p.kk-melding', { 'aria-live': 'polite' });
  const draai = (wat, d) => h('button.knop.klein', { type: 'button', 'aria-label': `${wat} ${d < 0 ? 'linksom' : 'rechtsom'} draaien`,
    onclick: (e) => { if (wat === 'Huis') zetKoers(koers + d * (e.shiftKey ? 10 : 1)); else if (!sensorAan) zetPlaat(plaat + d * (e.shiftKey ? 10 : 1)); } },
    d < 0 ? '↺' : '↻');
  const knoppen = h('div.kk-knoppen',
    h('span.kk-knopgroep', h('span.kk-knoplabel', 'Huis'), draai('Huis', -1), draai('Huis', 1)),
    !sensor && h('span.kk-knopgroep', h('span.kk-knoplabel', 'Kompas'), draai('Kompas', -1), draai('Kompas', 1)));
  const nieuw = h('button.knop.klein', { type: 'button', onclick: () => nieuweTaak() }, 'Nieuwe opdracht');
  const sensorKnop = h('button.knop.klein.hoofd', { type: 'button', onclick: () => startSensor() }, 'Gebruik je telefoon');

  const el = h('div.doe-kompas',
    h('div.kk-beeld', svg),
    h('div.kk-tekst',
      opdracht && opdrachtRegel, opdracht && stappen, stand, melding,
      knoppen,
      h('div.knop-rij', opdracht && nieuw, sensor && sensorKnop)));

  // -- drawing
  function teken() {
    wereld.setAttribute('transform', `rotate(${p(noorden)} ${C} ${C})`);
    plaatGroep.setAttribute('transform', `translate(${C} ${C}) rotate(${p(plaat + noorden)})`);
    huis.setAttribute('transform', `rotate(${-koers})`);
    naald.setAttribute('transform', `translate(${C} ${C}) rotate(${p(noorden)})`);
    if (doel) {
      const [x, y] = pol(150, doel.graden + noorden);
      doelTeken.setAttribute('visibility', 'visible');
      doelTeken.replaceChildren(s('circle', { cx: p(x), cy: p(y), r: 15, class: 'kk-doel-rond' }),
        s('text', { x: p(x), y: p(y) + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'kk-doel-teken' }, doel.teken));
    } else doelTeken.setAttribute('visibility', 'hidden');

    const inHuisje = verschil(plaat, koers) <= 2;
    stand.replaceChildren(
      h('span', 'Op het huis: ', h('strong', `${norm(koers)}°`), ` (${streek16(koers)})`),
      h('span', 'Het kompas wijst naar: ', h('strong', `${norm(plaat)}°`), ` (${streek16(plaat)})`));
    svg.classList.toggle('in-huisje', inHuisje);
    if (opdracht) controleer(inHuisje);
    else melding.textContent = inHuisje
      ? `Rood in het huisje: de richtingspijl wijst naar ${norm(koers)}°.`
      : 'Draai het hele kompas tot de rode punt van de naald in het huisje staat.';
  }

  function stap(tekst, klaar) { return h('li', { class: klaar ? 'klaar' : null }, tekst); }

  function controleer(inHuisje) {
    if (opdracht === 'koers' || opdracht === 'terug') {
      const huisGoed = verschil(koers, taak.koers) <= 1;
      stappen.replaceChildren(
        stap(`Draai het huis tot ${taak.koers}° bij de richtingspijl staat.`, huisGoed),
        stap('Draai het hele kompas tot rood in het huisje staat.', huisGoed && inHuisje),
        stap('Kijk langs de richtingspijl: die kant loop je op.', huisGoed && inHuisje));
      melding.textContent = huisGoed && inHuisje ? `Goed! Je loopt nu naar ${taak.koers}° (${streek16(taak.koers)}).`
        : !huisGoed && inHuisje ? 'De naald staat in het huisje, maar het huis staat nog niet op de goede koers.' : '';
    } else if (opdracht === 'peilen') {
      const gemikt = verschil(plaat, doel.graden) <= 2;
      const klaar = gemikt && inHuisje;
      stappen.replaceChildren(
        stap(`Richt de richtingspijl op de ${doel.naam}: draai het hele kompas.`, gemikt),
        stap('Houd het kompas stil en draai het huis tot rood in het huisje staat.', klaar),
        stap('Lees de graden af bij de richtingspijl.', klaar));
      melding.textContent = klaar ? `Goed! Je peiling: ${norm(koers)}° (${streek16(koers)}).${norm(koers) === doel.graden ? '' : ` Precies is het ${doel.graden}°: binnen 2 graden is goed.`}`
        : inHuisje && !gemikt ? `Rood staat in het huisje, maar je richt nog niet op de ${doel.naam}.` : '';
    }
  }

  function zetKoers(g) { koers = norm(g); teken(); }
  function zetPlaat(g) { plaat = norm(g); teken(); }

  function nieuweTaak() {
    const rond = (min, max) => Math.round((min + Math.random() * (max - min)) / 5) * 5;
    doel = null;
    if (opdracht === 'koers') {
      taak = { koers: norm(rond(0, 355)) };
      opdrachtRegel.replaceChildren('Loop naar ', h('strong', `${taak.koers}°`), ` (${streek16(taak.koers)}).`);
    } else if (opdracht === 'terug') {
      const heen = norm(rond(0, 355));
      taak = { koers: norm(heen + 180) };
      opdrachtRegel.replaceChildren('Je liep heen op ', h('strong', `${heen}°`), '. Zet het kompas op de terugkoers: ', h('em', 'plus of min 180'), '.');
    } else if (opdracht === 'peilen') {
      const [naam, teken] = DOELEN[Math.floor(Math.random() * DOELEN.length)];
      doel = { graden: norm(rond(0, 355)), naam, teken };
      opdrachtRegel.replaceChildren('Welke kant ligt de ', h('strong', doel.naam), ' op? Neem een peiling.');
    }
    melding.textContent = '';
    teken();
  }

  // -- turning with a finger or the mouse: on the housing turns the housing, elsewhere the whole compass
  let sleep = null;
  const hoekVan = (e) => {
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 360 - C; const y = ((e.clientY - r.top) / r.height) * 360 - C;
    return { hoek: (Math.atan2(x, -y) * 180) / Math.PI, afstand: Math.hypot(x, y) };
  };
  svg.addEventListener('pointerdown', (e) => {
    const { hoek, afstand } = hoekVan(e);
    if (afstand > 176) return;
    const opHuis = afstand <= R + 10;
    if (!opHuis && sensorAan) return;
    sleep = { opHuis, hoek, start: opHuis ? koers : plaat };
    svg.setPointerCapture(e.pointerId);
    svg.classList.add('sleept');
    e.preventDefault();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!sleep) return;
    const d = hoekVan(e).hoek - sleep.hoek;
    // turning the housing clockwise brings a lower number to the index
    if (sleep.opHuis) zetKoers(sleep.start - d); else zetPlaat(sleep.start + d);
  });
  const los = () => { sleep = null; svg.classList.remove('sleept'); };
  svg.addEventListener('pointerup', los);
  svg.addEventListener('pointercancel', los);
  svg.addEventListener('keydown', (e) => {
    const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
    if (!d) return;
    e.preventDefault();
    if (e.shiftKey && !sensorAan) zetPlaat(plaat + d * 5); else zetKoers(koers + d * (e.altKey ? 10 : 1));
  });

  // -- a phone as the compass: the plate is the phone, so north turns on the screen
  async function startSensor() {
    if (sensorAan) return;
    try {
      if (typeof DeviceOrientationEvent?.requestPermission === 'function' && await DeviceOrientationEvent.requestPermission() !== 'granted') {
        melding.textContent = 'Zonder toestemming voor de bewegingssensor werkt dit niet.';
        return;
      }
    } catch { /* not asked from a tap, or refused */ }
    let gehoord = false;
    const op = (e) => {
      if (!el.isConnected) { removeEventListener('deviceorientationabsolute', op); removeEventListener('deviceorientation', op); return; }
      // iOS gives the heading itself; elsewhere alpha counts the other way round, from north when absolute. A
      // computer without the sensor fires one event with alpha null: that is no heading.
      const kop = e.webkitCompassHeading ?? (e.alpha != null && (e.absolute || e.type === 'deviceorientationabsolute') ? 360 - e.alpha : null);
      if (kop == null || Number.isNaN(kop) || kop < 0) return;
      // the heading is of the top of the device; held sideways, the top of the screen is turned by the screen angle
      const richting = kop + (screen.orientation?.angle ?? window.orientation ?? 0);
      gehoord = true;
      plaat = norm(richting);
      noorden = -richting;
      teken();
    };
    const soort = 'ontouchstart' in window && 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    addEventListener(soort, op);
    sensorAan = true;
    sensorKnop.hidden = true;
    melding.textContent = 'Houd je telefoon plat voor je, met de bovenkant van je af.';
    // nothing heard: no compass in this device (a computer); then turning by hand works again
    setTimeout(() => {
      if (gehoord || !el.isConnected) return;
      removeEventListener(soort, op);
      sensorAan = false;
      sensorKnop.hidden = false;
      melding.textContent = 'Dit toestel geeft geen kompasrichting door. Op een computer werkt dit niet; probeer het op je telefoon, of draai met de hand.';
    }, 2500);
  }

  if (opdracht) nieuweTaak(); else teken();
  return el;
}
