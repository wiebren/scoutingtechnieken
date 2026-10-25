// The compass on a real map (the TOP25 sample of the Soester Duinen, north up). Three opdrachten:
// - greep 3: lay the compass from you to your goal, turn the housing to the north-south lines of the map, read the
//   course;
// - greep 4: a bearing is set; lay the compass on your spot and turn it to the north-south lines, and the line to
//   what you saw appears;
// - orienteren: turn the map (with the compass on it) until the needle points to the top of the map.
import { h } from '../dom.js';
import { actie, acties } from './knoppen.js';
import { kompasDelen, norm, p, pol, R, s, streek16, verschil } from './kompasdelen.js';
import './kompas.css';
import './kaartkompas.css';

const KAART = 'kaarten/top25-soester-duinen.webp';
const [W, H] = [800, 560];
const SCHAAL = 0.9;                               // of the compass on the map
const RASTER = [280, 680];                        // the north-south lines of the RD grid in the picture (x = 149, 150 km)

const peiling = ([ax, ay], [bx, by]) => norm((Math.atan2(bx - ax, -(by - ay)) * 180) / Math.PI);
const willekeurig = (min, max) => min + Math.random() * (max - min);

export default function kaartkompas({ greep = 3 } = {}) {
  const orienteren = greep === 'orienteren';
  let plaat = 0; let koers = 0; let kaartHoek = 0;
  let jij = null; let doel = null; let gezien = null;
  let midden = [W / 2, H / 2];
  let gelukt = false;

  // -- the picture
  const kaartGroep = s('g', { class: 'kkk-kaart' },
    s('image', { href: KAART, x: 0, y: 0, width: W, height: H, preserveAspectRatio: 'none' }),
    RASTER.map((x) => s('path', { d: `M${x} 0V${H}`, class: 'kkk-raster' })));
  const lijnen = s('g');
  const punten = s('g');
  const { plaat: plaatGroep, huis, naald } = kompasDelen({ liniaal: false });
  const kompasGroep = s('g', { class: 'kkk-kompas' }, plaatGroep);
  naald.classList.add('kkk-naald');

  const randen = s('g');                                    // arrows at the edge to points outside a zoomed view

  let svg;
  let rond = null;                                          // orienteren: sets the radius of the round window
  if (orienteren) {
    // a round window on the map, around the compass; the map turns, north stays up
    midden = [RASTER[0] + 66 * SCHAAL, 280];               // the left edge of the plate on the grid line
    const [cx, cy] = midden;
    const clipCirkel = s('circle', { cx, cy });
    const clip = s('clipPath', { id: `kkk-rond-${Math.random().toString(36).slice(2)}` }, clipCirkel);
    kaartGroep.append(kompasGroep);
    const grond = s('circle', { cx, cy, class: 'kkk-grond' });
    const rand = s('circle', { cx, cy, class: 'kkk-rand' });
    const wereld = [[0, 'N'], [90, 'O'], [180, 'Z'], [270, 'W']].map(([g, t]) => [g,
      s('text', { class: `kkk-wereld${g ? '' : ' noord'}`, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, t)]);
    svg = s('svg', { class: 'kkk-svg rond', role: 'img', tabindex: '0',
      'aria-label': 'Kaart met kompas. Pijltjes links en rechts draaien de kaart.' },
      s('defs', {}, clip), grond, s('g', { 'clip-path': `url(#${clip.id})` }, kaartGroep), rand,
      s('g', {}, wereld.map(([, t]) => t)), naald);
    rond = (r) => {
      clipCirkel.setAttribute('r', p(r)); rand.setAttribute('r', p(r)); grond.setAttribute('r', p(r + 28));
      for (const [g, t] of wereld) { const [x, y] = pol(cx, cy, r + 12, g); t.setAttribute('x', p(x)); t.setAttribute('y', p(y)); }
      svg.setAttribute('viewBox', `${p(cx - r - 28)} ${p(cy - r - 28)} ${p(2 * r + 56)} ${p(2 * r + 56)}`);
    };
    rond(262);
  } else {
    svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'kkk-svg', role: 'img', tabindex: '0',
      'aria-label': greep === 3 ? 'Kaart met kompas. Pijltjes draaien het huis, met Shift het hele kompas.' : 'Kaart met kompas. Pijltjes draaien het hele kompas.' },
      kaartGroep, lijnen, kompasGroep, punten, naald, randen);
  }

  // -- the words beside it
  const opdrachtRegel = h('p.kk-opdracht');
  const stappen = h('ol.kk-stappen');
  const stand = h('p.kk-stand', { 'aria-live': 'polite' });
  const melding = h('p.kk-melding', { 'aria-live': 'polite' });
  const draai = (wat, d) => h('button.knop.klein', { type: 'button', 'aria-label': `${wat} ${d < 0 ? 'linksom' : 'rechtsom'} draaien`,
    onclick: (e) => draaiMet(wat, d * (e.shiftKey ? 10 : 1)) }, d < 0 ? '↺' : '↻');
  const knoppen = h('div.kk-knoppen',
    greep === 3 && h('span.kk-knopgroep', h('span.kk-knoplabel', 'Huis'), draai('Huis', -1), draai('Huis', 1)),
    h('span.kk-knopgroep', h('span.kk-knoplabel', orienteren ? 'Kaart' : 'Kompas'), draai(orienteren ? 'Kaart' : 'Kompas', -1), draai(orienteren ? 'Kaart' : 'Kompas', 1)));
  const beeld = h('div.kkk-beeld', svg, h('p.kkk-bron', 'Kaart: Kadaster, TOPraster via PDOK (CC BY 4.0)'));
  const el = h('div.doe-kaartkompas', beeld,
    h('div.kk-tekst', opdrachtRegel, stappen, stand, melding, knoppen,
      acties(actie('Nieuwe opdracht', 'opnieuw', () => nieuweTaak(), { klein: true }))));

  function draaiMet(wat, d) {
    if (wat === 'Huis') koers = norm(koers + d);
    else if (wat === 'Kaart') kaartHoek = norm(kaartHoek + d);
    else plaat = norm(plaat + d);
    teken();
  }

  const stap = (tekst, klaar) => h('li', { class: klaar ? 'klaar' : null }, tekst);
  const punt = ([x, y], naam, klasse) => s('g', { class: `kkk-punt ${klasse}` },
    s('circle', { cx: p(x), cy: p(y), r: 9 }), s('text', { x: p(x), y: p(y - 16), 'text-anchor': 'middle' }, naam));

  // -- drawing and checking
  function teken() {
    const [mx, my] = midden;
    if (orienteren) {
      kaartGroep.setAttribute('transform', `rotate(${p(kaartHoek)} ${mx} ${my})`);
      kompasGroep.setAttribute('transform', `translate(${mx} ${my}) scale(${SCHAAL})`);
      naald.setAttribute('transform', `translate(${mx} ${my}) scale(${SCHAAL})`);
      huis.setAttribute('transform', 'rotate(0)');
      const goed = verschil(kaartHoek, 0) <= 3;
      stappen.replaceChildren(
        stap('Het kompas ligt met zijn rand langs een noord-zuidlijn van de kaart, richtingspijl naar boven.', true),
        stap('Draai de kaart, met het kompas erop, tot rood naar de bovenkant van de kaart wijst.', goed));
      stand.replaceChildren(h('span', 'De bovenkant van de kaart wijst naar: ', h('strong', `${norm(kaartHoek)}°`), ` (${streek16(kaartHoek)})`));
      melding.textContent = goed ? 'De kaart ligt goed: alles op de kaart ligt nu dezelfde kant op als om je heen.' : '';
      svg.classList.toggle('goed', goed);
      return;
    }

    kompasGroep.setAttribute('transform', `translate(${p(mx)} ${p(my)}) rotate(${p(plaat)}) scale(${SCHAAL})`);
    huis.setAttribute('transform', `rotate(${-koers})`);
    naald.setAttribute('transform', `translate(${p(mx)} ${p(my)}) scale(${SCHAAL})`);
    const huisRecht = verschil(plaat - koers, 0) <= 2;           // the north lines along the map's, orientatiepijl up
    const huisOmgekeerd = verschil(plaat - koers, 180) <= 2;

    if (greep === 3) {
      const moet = peiling(jij, doel);
      const gelegd = verschil(plaat, moet) <= 2;
      const verkeerdOm = verschil(plaat, moet + 180) <= 2;
      const klaar = gelegd && huisRecht;
      stappen.replaceChildren(
        stap('Leg het kompas langs de lijn van jou naar je doel, richtingspijl naar je doel: draai het hele kompas.', gelegd),
        stap('Draai het huis tot de noordlijnen gelijk lopen met de blauwe noord-zuidlijnen van de kaart, oriëntatiepijl naar boven.', klaar),
        stap('Lees de graden af bij de richtingspijl.', klaar));
      stand.replaceChildren(h('span', 'Op het huis: ', h('strong', `${koers}°`), ` (${streek16(koers)})`));
      melding.textContent = klaar ? `Goed! Je koers is ${koers}° (${streek16(koers)}).${koers === moet ? '' : ` Precies is het ${moet}°.`} Met greep 1 loop je die in het terrein.`
        : verkeerdOm ? 'De richtingspijl wijst naar jou, niet naar je doel. Draai het kompas om.'
          : gelegd && huisOmgekeerd ? 'De noordlijnen lopen gelijk, maar de oriëntatiepijl wijst naar beneden: dan zit je er 180° naast.' : '';
      svg.classList.toggle('goed', klaar);
      gelukt = klaar;
    } else {
      const klaar = huisRecht;
      stappen.replaceChildren(
        stap(`Het huis staat op ${koers}°, zoals je met greep 2 hebt gemeten. Laat het zo staan.`, true),
        stap('Het kompas ligt op je eigen plek. Draai het hele kompas tot de noordlijnen gelijk lopen met de blauwe noord-zuidlijnen, oriëntatiepijl naar boven.', klaar),
        stap('Langs de richtingspijl ligt wat je zag.', klaar));
      stand.replaceChildren(h('span', 'Het kompas wijst naar: ', h('strong', `${plaat}°`), ` (${streek16(plaat)})`));
      lijnen.replaceChildren();
      punten.replaceChildren(punt(jij, 'jij', 'jij'));
      if (klaar) {
        const [ex, ey] = pol(jij[0], jij[1], 900, koers);
        lijnen.append(s('path', { d: `M${p(jij[0])} ${p(jij[1])}L${p(ex)} ${p(ey)}`, class: 'kkk-lijn' }));
        punten.append(punt(gezien, 'de toren', 'doel'));
      } else randen.replaceChildren();                        // no arrow to a tower that is not there (yet)
      melding.textContent = klaar ? 'Goed! De toren die je zag, ligt ergens op deze lijn. Zoek langs de lijn op de kaart naar een toren.'
        : huisOmgekeerd ? 'De oriëntatiepijl wijst naar beneden: dan ligt je lijn precies de verkeerde kant op.' : '';
      svg.classList.toggle('goed', klaar);
      gelukt = klaar;
    }
    if (!sleep) kijk(true);                                   // not while dragging: the drag turns around a fixed spot
  }

  function nieuweTaak() {
    melding.textContent = '';
    if (orienteren) {
      kaartHoek = norm(willekeurig(40, 320));
      opdrachtRegel.textContent = 'Leg de kaart zo dat hij klopt met de echte wereld om je heen.';
    } else if (greep === 3) {
      // on a narrow screen preferably a pair that fits in the zoomed view, so both stay in sight
      const z = zoom();
      for (let keer = 0; ; keer++) {
        jij = [willekeurig(90, W - 90), willekeurig(80, H - 60)];
        doel = [willekeurig(90, W - 90), willekeurig(80, H - 60)];
        midden = [(jij[0] + doel[0]) / 2, (jij[1] + doel[1]) / 2];
        if (Math.hypot(doel[0] - jij[0], doel[1] - jij[1]) < 280) continue;
        if (!z || keer > 400 || zijde(omvat(nodig())) <= z[0]) break;
      }
      plaat = norm(peiling(jij, doel) + willekeurig(40, 100) * (Math.random() < 0.5 ? -1 : 1));
      koers = norm(willekeurig(0, 359));
      lijnen.replaceChildren(s('path', { d: `M${p(jij[0])} ${p(jij[1])}L${p(doel[0])} ${p(doel[1])}`, class: 'kkk-lijn' }));
      punten.replaceChildren(punt(jij, 'jij', 'jij'), punt(doel, 'doel', 'doel'));
      opdrachtRegel.textContent = 'Welke koers loop je van jou naar je doel? Haal hem van de kaart.';
    } else {
      // a spot and a tower that both lie on the map, and the bearing between them
      do {
        jij = [willekeurig(160, W - 160), willekeurig(150, H - 150)];
        koers = norm(Math.round(willekeurig(0, 359) / 5) * 5);
        gezien = pol(jij[0], jij[1], willekeurig(190, 300), koers);
      } while (gezien[0] < 40 || gezien[0] > W - 40 || gezien[1] < 40 || gezien[1] > H - 30);
      midden = jij;
      plaat = norm(koers + willekeurig(40, 120) * (Math.random() < 0.5 ? -1 : 1));
      opdrachtRegel.replaceChildren('Je zag een toren op ', h('strong', `${koers}°`), '. Waar ligt die op de kaart?');
    }
    teken();
  }

  // -- how much of the map is shown. With room for it, all of it. In a narrow picture the whole map would leave a
  // housing of a few dozen pixels, too small to turn with a finger; then a square around the compass and the points
  // that matter, as big as fits (`pref`), at most `cap` to keep both points in view, and otherwise around the
  // compass with an arrow at the edge to what falls outside.
  const BREED = 420;                                      // picture width (px) from which the whole map is shown
  let breedte = 0;                                        // measured width of the picture
  let kijkNu = [0, 0, W, H]; let kijkDoel = `0 0 ${W} ${H}`; let tween = 0;
  function zoom() {                                       // [pref, cap] in map units, or null for the whole map
    if (!breedte || breedte >= BREED) return null;
    const pref = Math.min(H, Math.max(380, breedte * 1.4));          // a housing of ~90 px
    const cap = Math.min(H, Math.max(pref, breedte * 1.9));          // still ~65 px
    return [pref, cap];
  }
  const vak = ([x, y], r) => (r ? [x - r, y - r, x + r, y + r] : [x - 45, y - 50, x + 45, y + 22]);  // a point and its name
  // what should be in view: in greep 3 both points and the housing; in greep 4 the compass, and once the line is
  // there also the tower (only then, or the view would give away where it is)
  const nodig = () => (greep === 3 ? [vak(jij), vak(doel), vak(midden, 80)]
    : gelukt ? [vak(jij), vak(jij, 75), vak(gezien)] : [vak(jij, 150)]);
  const omvat = (vakken) => vakken.reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]);
  const zijde = (b) => Math.max(b[2] - b[0], b[3] - b[1]);
  const tussen = (v, min, max) => Math.min(max, Math.max(min, v));

  function kijk(zacht) {
    const z = zoom();
    let v = [0, 0, W, H];
    if (z) {
      const [pref, cap] = z; const b = omvat(nodig());
      let kant = Math.max(pref, zijde(b)); let [cx, cy] = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
      if (kant > cap) { kant = cap; [cx, cy] = midden; }
      v = [tussen(cx - kant / 2, 0, W - kant), tussen(cy - kant / 2, 0, H - kant), kant, kant].map(p);
    }
    // an arrow on the edge, on the line from the middle of the view to each point that falls outside it; the
    // point's own name, cut off at the edge, makes way for the arrow's
    randen.replaceChildren();
    const [vx, vy, vw, vh] = v; const [cx, cy] = [vx + vw / 2, vy + vh / 2];
    for (const g of punten.children) {
      const [x, y] = ['cx', 'cy'].map((a) => +g.firstChild.getAttribute(a));
      const binnen = x > vx && x < vx + vw && y > vy && y < vy + vh;
      g.classList.toggle('buiten', !binnen);
      if (binnen) continue;
      const naam = g.lastChild.textContent; const klasse = g.classList.contains('jij') ? 'jij' : 'doel';
      const t = Math.min((vw / 2 - 22) / Math.abs(x - cx || 1e-6), (vh / 2 - 22) / Math.abs(y - cy || 1e-6));
      const [ex, ey] = [cx + (x - cx) * t, cy + (y - cy) * t];
      const hoek = peiling([cx, cy], [x, y]); const [tx, ty] = pol(ex, ey, 36, hoek + 180);
      randen.append(s('g', { class: `kkk-punt kkk-wijzer ${klasse}` },
        s('path', { d: 'M0 -17L13 9H-13Z', transform: `translate(${p(ex)} ${p(ey)}) rotate(${p(hoek)})` }),
        s('text', { x: p(tx), y: p(ty), 'text-anchor': 'middle', 'dominant-baseline': 'central' }, naam)));
    }
    if (zacht && v.join(' ') === kijkDoel) return;
    kijkDoel = v.join(' ');
    cancelAnimationFrame(tween);
    const zet = (w) => { kijkNu = w; svg.setAttribute('viewBox', w.map(p).join(' ')); };
    if (!zacht || matchMedia('(prefers-reduced-motion: reduce)').matches) { zet(v); return; }
    const van = kijkNu; const begin = performance.now();
    const stap = (nu) => {
      const t = Math.min(1, (nu - begin) / 300); const e = t * (2 - t);
      zet(van.map((a, i) => a + (v[i] - a) * e));
      if (t < 1 && svg.isConnected) tween = requestAnimationFrame(stap);
    };
    tween = requestAnimationFrame(stap);
  }

  // the width of the picture, not of the window: it decides how big the compass gets
  let gemeten = false;
  const ro = new ResizeObserver(() => {
    if (!el.isConnected) { if (gemeten) ro.disconnect(); return; }
    const b = Math.round(beeld.clientWidth);
    if (!b || b === breedte) return;
    const eerste = !gemeten; breedte = b; gemeten = true;
    if (orienteren) rond(tussen(b * (290 / 360) - 28, 200, 262));      // the same px per map unit as at full size
    else {
      if (eerste && greep === 3 && zoom()) nieuweTaak();               // before the first paint: a pair that fits
      kijk(false);
    }
  });
  ro.observe(beeld);

  // -- turning with a finger or the mouse
  let sleep = null;
  const naarSvg = (e) => {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };
  const hoekVan = (e) => {
    const { x, y } = naarSvg(e); const [mx, my] = midden;
    return { hoek: (Math.atan2(x - mx, -(y - my)) * 180) / Math.PI, afstand: Math.hypot(x - mx, y - my) };
  };
  svg.addEventListener('pointerdown', (e) => {
    if (!orienteren) {                                      // a view still sliding would turn the compass by itself
      cancelAnimationFrame(tween); kijkNu = kijkDoel.split(' ').map(Number); svg.setAttribute('viewBox', kijkDoel);
    }
    const { hoek, afstand } = hoekVan(e);
    const wat = orienteren ? 'kaart' : greep === 3 && afstand <= (R + 10) * SCHAAL ? 'huis' : 'plaat';
    sleep = { wat, hoek, start: { kaart: kaartHoek, huis: koers, plaat }[wat] };
    svg.setPointerCapture(e.pointerId);
    svg.classList.add('sleept');
    e.preventDefault();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!sleep) return;
    const d = hoekVan(e).hoek - sleep.hoek;
    if (sleep.wat === 'huis') koers = norm(sleep.start - d);
    else if (sleep.wat === 'kaart') kaartHoek = norm(sleep.start + d);
    else plaat = norm(sleep.start + d);
    teken();
  });
  const los = () => { if (!sleep) return; sleep = null; svg.classList.remove('sleept'); kijk(true); };
  svg.addEventListener('pointerup', los);
  svg.addEventListener('pointercancel', los);
  svg.addEventListener('keydown', (e) => {
    const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
    if (!d) return;
    e.preventDefault();
    if (orienteren) draaiMet('Kaart', d * 2);
    else if (greep === 3 && !e.shiftKey) draaiMet('Huis', d);
    else draaiMet('Kompas', d);
  });

  nieuweTaak();
  return el;
}
