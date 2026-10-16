// The horlogemethode: a watch with hands, seen from above, and the sun on the edge of the world around it. Turn the
// watch until the hour hand points at the sun; then the line midway between the hour hand and the 1 (wintertijd) or
// the 2 (zomertijd) is south. The real north, east, south and west show once you have done it, with how far the
// watch is out: little in winter, up to 20° and more on a summer afternoon.
import { h } from '../dom.js';
import './horloge.css';

const NS = 'http://www.w3.org/2000/svg';
const C = 180;                                  // the middle of the watch and of the world
const R = 84;                                   // the watch
const BREEDTE = 52.16; const LENGTE = 5.39;     // Amersfoort
const RAAK = 3;                                 // how close the hour hand must point at the sun, in degrees

const norm = (g) => ((g % 360) + 360) % 360;
const draaiing = (a, b) => ((a - b + 540) % 360) - 180;                // from b to a, -180..180, clockwise positive
const pol = (r, g) => [C + r * Math.sin((g * Math.PI) / 180), C - r * Math.cos((g * Math.PI) / 180)];
const p = (n) => Math.round(n * 10) / 10;
const rad = Math.PI / 180;
const klok = (m) => `${Math.floor(m / 60)}:${String(Math.round(m % 60)).padStart(2, '0')}`;

/**
 * Where the sun stands in Amersfoort on a day of the year at a time on the clock: its direction from north and its
 * height above the horizon, in degrees. Roughly: the sun's declination and the equation of time from the usual short
 * formulas, good to a degree or so, which is plenty here.
 */
function zon(dag, minuten, zomer) {
  const b = (2 * Math.PI * (dag - 81)) / 364;
  const tijdsvereffening = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);     // minutes
  const middag = 12 * 60 + (15 - LENGTE) * 4 - tijdsvereffening + (zomer ? 60 : 0);            // about 12:40 / 13:40
  const uurhoek = ((minuten - middag) / 4) * rad;
  const decl = -23.44 * Math.cos(((2 * Math.PI) / 365) * (dag + 10)) * rad;
  const phi = BREEDTE * rad;
  const hoogte = Math.asin(Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(uurhoek)) / rad;
  const richting = norm(Math.atan2(Math.sin(uurhoek), Math.cos(uurhoek) * Math.sin(phi) - Math.tan(decl) * Math.cos(phi)) / rad + 180);
  return { richting, hoogte, middag };
}

/** Today in the Netherlands: the day of the year, the time in minutes, and whether it is zomertijd. */
function nuInNederland() {
  const d = new Date();
  const deel = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: 'numeric',
    day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(d).map((x) => [x.type, Number(x.value)]));
  const alsUtc = Date.UTC(deel.year, deel.month - 1, deel.day, deel.hour, deel.minute);
  return {
    dag: Math.round((Date.UTC(deel.year, deel.month - 1, deel.day) - Date.UTC(deel.year, 0, 0)) / 864e5),
    minuten: deel.hour * 60 + deel.minute,
    zomer: Math.round((alsUtc - d.getTime()) / 36e5) === 2,
    datum: d.toLocaleDateString('nl-NL', { timeZone: 'Europe/Amsterdam', day: 'numeric', month: 'long' }),
  };
}

function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...kids.flat());
  return el;
}

const SEIZOEN = { true: { dag: 172, datum: '21 juni' }, false: { dag: 355, datum: '21 december' } };

export default function horloge() {
  let zomer = true;
  let dag = SEIZOEN[zomer].dag;
  let datum = SEIZOEN[zomer].datum;
  let vandaag = false;
  let minuten = 10 * 60;
  let draai = 0;                 // where the 12 of the watch points, in degrees from north

  // -- the world: the ground, the sun on its edge, and north, east, south and west once the watch has found them
  const wereld = s('g', { class: 'hw-wereld' });
  for (let g = 0; g < 360; g += 15) {
    const [x1, y1] = pol(170, g); const [x2, y2] = pol(g % 45 ? 174 : 177, g);
    wereld.append(s('path', { d: `M${p(x1)} ${p(y1)}L${p(x2)} ${p(y2)}`, class: 'hw-streep' }));
  }
  const windstreken = s('g', { class: 'hw-windstreken', visibility: 'hidden' });
  for (const [g, t] of [[0, 'N'], [90, 'O'], [180, 'Z'], [270, 'W']]) {
    const [x, y] = pol(160, g);
    windstreken.append(s('text', { x: p(x), y: p(y), class: `hw-letter${g === 180 ? ' zuid' : ''}`, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, t));
  }
  const zonTeken = s('g', { class: 'hw-zon' }, s('circle', { r: 17, class: 'hw-zon-gloed' }), s('circle', { r: 10, class: 'hw-zon-schijf' }));
  for (let g = 0; g < 360; g += 45) {
    const [x1, y1] = [13 * Math.sin(g * rad), -13 * Math.cos(g * rad)]; const [x2, y2] = [17 * Math.sin(g * rad), -17 * Math.cos(g * rad)];
    zonTeken.append(s('path', { d: `M${p(x1)} ${p(y1)}L${p(x2)} ${p(y2)}`, class: 'hw-zon-straal' }));
  }

  // -- the watch: turns as a whole; the hands turn with the time
  const horlogeGroep = s('g', { class: 'hw-horloge' });
  horlogeGroep.append(s('circle', { cx: C, cy: C, r: R + 7, class: 'hw-kast' }), s('circle', { cx: C, cy: C, r: R, class: 'hw-wijzerplaat' }));
  for (let i = 0; i < 60; i++) {
    const [x1, y1] = pol(R - 2, i * 6); const [x2, y2] = pol(R - (i % 5 ? 6 : 11), i * 6);
    horlogeGroep.append(s('path', { d: `M${p(x1)} ${p(y1)}L${p(x2)} ${p(y2)}`, class: i % 5 ? 'hw-tik dun' : 'hw-tik' }));
  }
  const merken = {};
  for (let u = 1; u <= 12; u++) {
    const [x, y] = pol(R - 23, u * 30);
    const merk = s('g', { class: 'hw-cijfer' }, s('circle', { cx: p(x), cy: p(y), r: 10.5, class: 'hw-merk' }),
      s('text', { x: p(x), y: p(y) + 0.5, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, String(u)));
    merken[u] = merk;
    horlogeGroep.append(merk);
  }
  const grote = s('path', { d: `M${C} ${C + 12}V${C - R + 12}`, class: 'hw-grote' });
  const kleine = s('path', { d: `M${C} ${C + 9}V${C - 48}`, class: 'hw-kleine' });
  horlogeGroep.append(grote, kleine, s('circle', { cx: C, cy: C, r: 4.5, class: 'hw-as' }));

  // -- what the method gives: the angle that is halved, the line through its middle, and how far that is out
  const helft = s('path', { class: 'hw-helft' });
  const deellijn = s('path', { class: 'hw-deellijn' });
  const zuidMerk = s('text', { class: 'hw-zuidmerk', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, 'Z');
  const noordMerk = s('text', { class: 'hw-noordmerk', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, 'N');
  const foutBoog = s('path', { class: 'hw-foutboog' });
  const foutTekst = s('text', { class: 'hw-fouttekst', 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  const methode = s('g', { class: 'hw-methode', visibility: 'hidden' }, helft, deellijn, foutBoog, foutTekst, zuidMerk, noordMerk);

  const svg = s('svg', { viewBox: '0 0 360 360', class: 'hw-svg', role: 'img', tabindex: '0',
    'aria-label': 'Een horloge, van boven gezien, met de zon aan de rand. Pijltjes links en rechts draaien het horloge.' },
    s('circle', { cx: C, cy: C, r: 178, class: 'hw-grond' }), wereld, windstreken, zonTeken, horlogeGroep, methode);

  // -- the words beside it
  const chips = [true, false].map((z) => h('button.chip', { type: 'button', 'aria-pressed': String(z === zomer),
    onclick: () => { zomer = z; vandaag = false; ({ dag, datum } = SEIZOEN[z]); teken(); } }, z ? 'Zomertijd' : 'Wintertijd'));
  const tijdIn = h('input.hw-schuif', { type: 'range', min: 360, max: 1200, step: 5, value: minuten,
    oninput: () => { minuten = Number(tijdIn.value); teken(); } });
  const tijdUit = h('output.hw-tijd');
  const nuKnop = h('button.knop.klein', { type: 'button', onclick: () => zetNu() }, 'Nu');
  const stappen = h('ol.hw-stappen');
  const stand = h('p.hw-stand', { 'aria-live': 'polite' });
  const melding = h('p.hw-melding', { 'aria-live': 'polite' });
  const noot = h('p.hw-noot');
  const draaiKnop = (d) => h('button.knop.klein', { type: 'button', 'aria-label': `Horloge ${d < 0 ? 'linksom' : 'rechtsom'} draaien`,
    onclick: (e) => zetDraai(draai + d * (e.shiftKey ? 10 : 1)) }, d < 0 ? '↺' : '↻');

  const el = h('div.doe-horloge',
    h('div.hw-beeld', svg),
    h('div.hw-tekst',
      h('div.chips', { role: 'group', 'aria-label': 'Zomertijd of wintertijd' }, chips),
      h('label.hw-klok', h('span.hw-label', 'Tijd'), tijdIn, tijdUit), h('div.knop-rij', nuKnop),
      stappen, stand, melding,
      h('div.hw-knoppen', h('span.hw-knoplabel', 'Horloge'), draaiKnop(-1), draaiKnop(1)),
      noot));

  // -- drawing
  function teken() {
    const z = zon(dag, minuten, zomer);
    const merk = zomer ? 2 : 1;
    const uren = minuten / 60;
    const kleineWereld = norm(draai + 30 * (uren % 12));
    // midway between the hour hand and the 1 or 2: clockwise in the morning, anticlockwise in the afternoon
    const halveHoek = 15 * (merk + 12 - uren);
    const zuidHorloge = norm(kleineWereld + halveHoek);
    const op = z.hoogte > -0.5;
    const raak = op && Math.abs(draaiing(z.richting, kleineWereld)) <= RAAK;

    chips.forEach((c, i) => c.setAttribute('aria-pressed', String((i === 0) === zomer)));
    tijdUit.textContent = klok(minuten);
    tijdIn.setAttribute('aria-valuetext', klok(minuten));
    for (const [u, m] of Object.entries(merken)) m.classList.toggle('doel', Number(u) === merk);
    horlogeGroep.setAttribute('transform', `rotate(${p(draai)} ${C} ${C})`);
    kleine.setAttribute('transform', `rotate(${p(30 * (uren % 12))} ${C} ${C})`);
    grote.setAttribute('transform', `rotate(${p(6 * (minuten % 60))} ${C} ${C})`);
    const [zx, zy] = pol(150, z.richting);
    zonTeken.setAttribute('transform', `translate(${p(zx)} ${p(zy)})`);
    zonTeken.setAttribute('visibility', op ? 'visible' : 'hidden');
    windstreken.setAttribute('visibility', raak ? 'visible' : 'hidden');
    methode.setAttribute('visibility', raak ? 'visible' : 'hidden');
    svg.classList.toggle('raak', raak);

    if (raak) {
      const [a1, b1] = pol(34, kleineWereld); const [a2, b2] = pol(34, kleineWereld + 2 * halveHoek);
      helft.setAttribute('d', `M${p(a1)} ${p(b1)}A34 34 0 ${Math.abs(2 * halveHoek) > 180 ? 1 : 0} ${halveHoek > 0 ? 1 : 0} ${p(a2)} ${p(b2)}`);
      const [n1, m1] = pol(118, zuidHorloge + 180); const [n2, m2] = pol(132, zuidHorloge);
      deellijn.setAttribute('d', `M${p(n1)} ${p(m1)}L${p(n2)} ${p(m2)}`);
      const [zx2, zy2] = pol(141, zuidHorloge); const [nx2, ny2] = pol(128, zuidHorloge + 180);
      zuidMerk.setAttribute('x', p(zx2)); zuidMerk.setAttribute('y', p(zy2));
      noordMerk.setAttribute('x', p(nx2)); noordMerk.setAttribute('y', p(ny2));
      const fout = draaiing(zuidHorloge, 180);
      const [f1, g1] = pol(120, 180); const [f2, g2] = pol(120, zuidHorloge);
      foutBoog.setAttribute('d', `M${p(f1)} ${p(g1)}A120 120 0 0 ${fout > 0 ? 1 : 0} ${p(f2)} ${p(g2)}`);
      const [tx, ty] = pol(104, 180 + fout / 2);
      foutTekst.setAttribute('x', p(tx)); foutTekst.setAttribute('y', p(ty));
      foutTekst.textContent = `${Math.round(Math.abs(fout))}°`;
      foutTekst.setAttribute('visibility', Math.abs(fout) >= 2 ? 'visible' : 'hidden');
    }

    const wanneer = `${vandaag ? `Vandaag (${datum})` : datum}, ${klok(minuten)} ${zomer ? 'zomertijd' : 'wintertijd'}`;
    const stap = (tekst, klaar) => h('li', { class: klaar ? 'klaar' : null }, tekst);
    stappen.replaceChildren(
      stap('Houd het horloge plat, en draai het tot de kleine wijzer naar de zon wijst.', raak),
      stap(`Het zuiden ligt midden tussen de kleine wijzer en de ${merk} (${zomer ? 'zomertijd' : 'wintertijd'}).`, raak),
      stap('Het noorden is de andere kant op.', raak));

    if (!op) {
      stand.textContent = `${wanneer}: de zon is ${minuten < z.middag ? 'nog niet op' : 'al onder'}. Schuif de tijd ${minuten < z.middag ? 'verder' : 'terug'}.`;
      melding.textContent = '';
    } else if (!raak) {
      const nog = Math.round(draaiing(z.richting, kleineWereld));
      stand.textContent = `${wanneer}. Draai het horloge nog ${Math.abs(nog)}° ${nog > 0 ? 'rechtsom' : 'linksom'}, tot de kleine wijzer naar de zon wijst.`;
      melding.textContent = '';
    } else {
      const fout = Math.round(draaiing(zuidHorloge, 180));
      stand.textContent = `${wanneer}. De kleine wijzer wijst naar de zon. Je horloge zegt: het zuiden ligt op ${Math.round(zuidHorloge)}°.`;
      melding.textContent = Math.abs(fout) <= 2 ? 'Het echte zuiden ligt op 180°: dat klopt bijna precies.'
        : `Het echte zuiden ligt op 180°: je horloge zit er ${Math.abs(fout)}° naast, naar het ${fout > 0 ? 'westen' : 'oosten'}.`
          + (Math.abs(fout) >= 15 ? ' Gebruik het als grove richting.' : '');
    }
    noot.textContent = (Math.abs(halveHoek) > 90 ? `Meet 's ochtends rechtsom en 's middags linksom van de kleine wijzer naar de ${merk}, ook als dat de grote kant is. ` : '')
      + `Ongeveer, voor Amersfoort: ${vandaag ? 'vandaag' : `op ${datum}`} staat de zon daar om ${klok(Math.round(z.middag))} in het zuiden; in het oosten van het land iets eerder, in het westen iets later.`;
  }

  function zetDraai(g) { draai = norm(g); teken(); }

  function zetNu() {
    const nu = nuInNederland();
    ({ dag, zomer, datum } = nu);
    vandaag = true;
    minuten = Math.min(1200, Math.max(360, Math.round(nu.minuten / 5) * 5));
    tijdIn.value = minuten;
    teken();
    if (minuten !== Math.round(nu.minuten / 5) * 5) melding.textContent = `Het is nu ${klok(nu.minuten)}; deze klok loopt van 6:00 tot 20:00.`;
  }

  // -- turning the watch with a finger or the mouse, anywhere in the picture
  let sleep = null;
  const hoekVan = (e) => {
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 360 - C; const y = ((e.clientY - r.top) / r.height) * 360 - C;
    return { hoek: (Math.atan2(x, -y) * 180) / Math.PI, afstand: Math.hypot(x, y) };
  };
  svg.addEventListener('pointerdown', (e) => {
    const { hoek, afstand } = hoekVan(e);
    if (afstand > 178) return;
    sleep = { hoek, start: draai };
    svg.setPointerCapture(e.pointerId);
    svg.classList.add('sleept');
    e.preventDefault();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!sleep) return;
    zetDraai(sleep.start + hoekVan(e).hoek - sleep.hoek);
  });
  const los = () => {
    if (!sleep) return;
    sleep = null;
    svg.classList.remove('sleept');
    // let go close to the sun: put the hour hand right on it
    const z = zon(dag, minuten, zomer);
    const nog = draaiing(z.richting, draai + 30 * ((minuten / 60) % 12));
    if (z.hoogte > -0.5 && Math.abs(nog) <= 6) zetDraai(draai + nog);
  };
  svg.addEventListener('pointerup', los);
  svg.addEventListener('pointercancel', los);
  svg.addEventListener('keydown', (e) => {
    const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
    if (!d) return;
    e.preventDefault();
    zetDraai(draai + d * (e.shiftKey ? 10 : 1));
  });

  teken();
  return el;
}
