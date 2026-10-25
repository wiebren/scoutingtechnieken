// The draaiende sterrenkaart: the sky over the Netherlands (52 degrees north) for a date and a time. Hold it above
// your head with the direction you face at the bottom: the middle is straight up, the edge is the horizon. Slide the
// time and the sky turns round the Pole Star; tap a star to hear its name. Option `beeld` opens on a night when that
// figure stands high, and shows it in yellow.
import { h } from '../../dom.js';
import { actie, acties, keuze, schakel, zetActie } from '../knoppen.js';
import { p, pol, s } from '../kompasdelen.js';
import { beginStaat, datum, datumSchuif, moment, tijdNaam, tijdSchuif, zetNu } from './bediening.js';
import { maan, maanfase, maanPad, momentNL, PLAATS, uitDagVanJaar } from './hemel.js';
import { BEELD, BEELDEN, donker, IN_BEELD, kleur, metDe, midden, NAMEN, posities, STERREN, straal, waarTekst } from './sterren.js';
import './sterren.css';

const C = 180;
const R = 150;                                  // the horizon
const plaats = PLAATS.amersfoort;
const RICHTINGEN = [[0, 'N'], [45, 'NO'], [90, 'O'], [135, 'ZO'], [180, 'Z'], [225, 'ZW'], [270, 'W'], [315, 'NW']];

/** The evening in the year (at 21:00 or 23:00, when it is dark enough) when a figure stands highest. */
function besteAvond(b, j) {
  let beste = null;
  for (let dag = 1; dag <= 365; dag += 2) {
    const { m, d } = uitDagVanJaar(dag, j);
    for (const minuten of [21 * 60, 23 * 60]) {
      const t = momentNL(j, m, d, minuten);
      if (donker(t, plaats.breedte, plaats.lengte).grens < 3.8) continue;
      const hgt = midden(b, t, plaats.breedte, plaats.lengte).hoogte;
      if (!beste || hgt > beste.hgt + 0.5) beste = { dag, minuten, hgt };
    }
  }
  return beste;
}

export default function sterrenkaart({ beeld: gekozen = null } = {}) {
  const staat = beginStaat({ nacht: true });
  if (staat.minuten < 18 * 60 || staat.minuten > 31 * 60) staat.minuten = 22 * 60;
  let kijk = 0;                                 // the direction you face: at the bottom of the chart
  let metLijnen = true; let metNamen = true;
  // the figures to show in yellow: one id, or a list (the Zomerdriehoek is three)
  const uitgelicht = new Set([gekozen ?? []].flat().map((id) => BEELD[id]));
  const eerste = [...uitgelicht][0];
  if (eerste) {
    const a = besteAvond(eerste, staat.j);
    if (a) { staat.dag = a.dag; staat.minuten = a.minuten; }
  }
  let gekozenSter = null;

  // -- the chart: the ground round the edge, the sky inside
  const rand = s('g');
  rand.append(s('circle', { cx: C, cy: C, r: 178, class: 'sk-grond' }));
  const lucht = s('circle', { cx: C, cy: C, r: R, class: 'sk-lucht' });
  const letters = s('g');
  const lijnen = s('g', { class: 'sk-lijnen' });
  const beeldPaden = BEELDEN.map((b) => { const pad = s('path', { class: 'hm-sterlijn' }); lijnen.append(pad); return pad; });
  const stippen = s('g');
  const sterren = STERREN.map((x) => {
    const c = s('circle', { r: p(straal(x.mag)), fill: kleur(x.bv) });
    stippen.append(c);
    return c;
  });
  const namenLaag = s('g');
  const keuzeRing = s('circle', { r: 9, class: 'sk-keuze', visibility: 'hidden' });
  const maanTeken = s('g');
  const svg = s('svg', { viewBox: '0 0 360 360', class: 'hm-svg sk-svg', role: 'img' },
    rand, lucht, lijnen, stippen, maanTeken, namenLaag, keuzeRing, letters,
    s('circle', { cx: C, cy: C, r: R, class: 'hm-nachtrand' }));

  // where a height and direction land on the chart
  const naar = (hoogte, richting) => pol(C, C, (R * (90 - hoogte)) / 90, 180 + kijk - richting);

  // -- the words
  const stand = h('p.hm-uitkomst');
  const lijst = h('p.sk-lijst', { 'aria-live': 'polite' });
  const info = h('p.doe-melding', { 'aria-live': 'polite' });
  const opnieuw = () => teken();
  const datumS = datumSchuif(staat, opnieuw);
  const tijdS = tijdSchuif(staat, opnieuw, { van: 18 * 60, tot: 31 * 60, stap: 5 });
  const nuKnop = actie('Zet op nu', 'klok', () => { stop(); zetNu(staat, { nacht: true }); staat.minuten = Math.min(31 * 60, Math.max(18 * 60, staat.minuten)); datumS.zet(); tijdS.zet(); teken(); }, { klein: true });
  const speelKnop = actie('Laat de hemel draaien', 'start', () => (loopt ? stop() : speel()), { klein: true });
  const kijkKeuze = h('div.chips', { role: 'group', 'aria-label': 'Welke kant kijk je op?' },
    keuze(RICHTINGEN.filter(([g]) => g % 90 === 0).map(([g, t]) => [g, { N: 'Naar het noorden', O: 'Naar het oosten', Z: 'Naar het zuiden', W: 'Naar het westen' }[t]]), kijk, (g) => { kijk = g; teken(); }));
  const schakels = h('div.chips', schakel('Lijnen', metLijnen, (a) => { metLijnen = a; teken(); }), schakel('Namen', metNamen, (a) => { metNamen = a; teken(); }));

  let pos = [];
  function teken() {
    const t = moment(staat);
    const dk = donker(t, plaats.breedte, plaats.lengte);
    pos = posities(t, plaats.breedte, plaats.lengte);
    lucht.setAttribute('fill', dk.lucht);

    // the stars
    pos.forEach((x, i) => {
      const zie = x.hoogte > 0 && STERREN[i].mag <= dk.grens;
      const c = sterren[i];
      if (!zie) { c.setAttribute('visibility', 'hidden'); return; }
      const [sx, sy] = naar(x.hoogte, x.richting);
      c.setAttribute('cx', p(sx)); c.setAttribute('cy', p(sy));
      c.setAttribute('visibility', 'visible');
    });
    // the figures: a line between two stars when both are above the horizon
    BEELDEN.forEach((b, k) => {
      let d = '';
      for (const keten of b.lijnen) for (let n = 1; n < keten.length; n++) {
        const a = pos[keten[n - 1]]; const z = pos[keten[n]];
        if (a.hoogte < 0 || z.hoogte < 0) continue;
        const [x1, y1] = naar(a.hoogte, a.richting); const [x2, y2] = naar(z.hoogte, z.richting);
        d += `M${p(x1)} ${p(y1)}L${p(x2)} ${p(y2)}`;
      }
      beeldPaden[k].setAttribute('d', d);
      beeldPaden[k].classList.toggle('licht', uitgelicht.has(b));
      beeldPaden[k].setAttribute('visibility', metLijnen || uitgelicht.has(b) ? 'visible' : 'hidden');
    });
    lijnen.setAttribute('opacity', dk.grens < 2 ? 0.45 : 1);
    lijnen.setAttribute('visibility', dk.grens < 0 ? 'hidden' : 'visible');

    // names: the bright stars and the figures that are up
    const namen = [];
    if (metNamen) {
      for (const [i, naam] of Object.entries(NAMEN)) {
        const x = pos[i];
        if (x.hoogte < 10 || STERREN[i].mag > Math.min(dk.grens, 1.2) || naam === 'Dubhe' || naam === 'Merak') continue;
        const [sx, sy] = naar(x.hoogte, x.richting);
        namen.push(s('text', { x: p(sx + (sx > 280 ? -6 : 6)), y: p(sy - 5), class: 'hm-sternaam', 'text-anchor': sx > 280 ? 'end' : 'start' }, naam));
      }
      for (const b of BEELDEN) {
        const m = midden(b, t, plaats.breedte, plaats.lengte);
        if (m.hoogte < 14 || dk.grens < 2.5) continue;                    // lower, the name runs over the edge
        const [bx, by] = naar(m.hoogte, m.richting);
        namen.push(s('text', { x: p(bx), y: p(by + 16), class: `hm-beeldnaam${uitgelicht.has(b) ? ' licht' : ''}`, 'text-anchor': 'middle' }, b.naam));
      }
    }
    namenLaag.replaceChildren(...namen);

    // the moon
    const mn = maan(t, plaats.breedte, plaats.lengte);
    if (mn.hoogte > 0) {
      const mf = maanfase(t, plaats.breedte, plaats.lengte);
      const [mx, my] = naar(mn.hoogte, mn.richting);
      const hoek = Math.atan2(mx - C, -(my - C)) * (180 / Math.PI);            // the moon on the chart, clockwise from up
      const draai = hoek + 180 - (mf.kant - (mf.wassend ? 270 : 90));
      maanTeken.replaceChildren(s('g', { transform: `translate(${p(mx)} ${p(my)}) rotate(${p(draai)})` },
        s('circle', { r: 8, class: 'hm-maan-donker' }), s('path', { d: maanPad(0, 0, 8, mf.fase), class: 'hm-maan' })));
    } else maanTeken.replaceChildren();

    // the directions round the edge
    letters.replaceChildren(...RICHTINGEN.map(([g, tx]) => {
      const [x, y] = pol(C, C, 164, 180 + kijk - g);
      return s('text', { x: p(x), y: p(y), class: `sk-richting${g % 90 ? ' tussen' : ''}${g === kijk ? ' kijk' : ''}`, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, tx);
    }));

    if (gekozenSter != null) {
      const x = pos[gekozenSter];
      if (x.hoogte > 0) { const [sx, sy] = naar(x.hoogte, x.richting); keuzeRing.setAttribute('cx', p(sx)); keuzeRing.setAttribute('cy', p(sy)); keuzeRing.setAttribute('visibility', 'visible'); } else keuzeRing.setAttribute('visibility', 'hidden');
    } else keuzeRing.setAttribute('visibility', 'hidden');

    // the words
    const dt = datum(staat);
    const morgen = staat.minuten >= 24 * 60;
    stand.textContent = `${morgen ? `Nacht na ${dt.tekst}` : dt.tekst}, ${tijdS.el.querySelector('output').textContent} ${tijdNaam(staat)}: ${dk.naam}.`;
    if (dk.grens < 0) lijst.textContent = '';
    else {
      const boven = BEELDEN.map((b) => ({ b, m: midden(b, t, plaats.breedte, plaats.lengte) })).filter((x) => x.m.hoogte > 10).sort((a, b) => b.m.hoogte - a.m.hoogte);
      lijst.textContent = boven.length ? `Te zien: ${boven.map(({ b, m }) => `${b.naam} (${waarTekst(m)})`).join(', ')}.` : '';
    }
    svg.setAttribute('aria-label', `Sterrenkaart van de hemel boven Nederland. Onderaan is ${['het noorden', 'het oosten', 'het zuiden', 'het westen'][kijk / 90]}. ${stand.textContent}`);
  }

  // -- tap a star
  svg.addEventListener('click', (e) => {
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 360; const y = ((e.clientY - r.top) / r.height) * 360;
    let beste = null;
    const grens = donker(moment(staat), plaats.breedte, plaats.lengte).grens;
    pos.forEach((q, i) => {
      if (q.hoogte <= 0 || STERREN[i].mag > grens) return;
      const [sx, sy] = naar(q.hoogte, q.richting);
      const d = Math.hypot(sx - x, sy - y) - straal(STERREN[i].mag);
      if (d < 12 && (!beste || d < beste.d)) beste = { i, d };
    });
    if (!beste) { gekozenSter = null; info.textContent = ''; teken(); return; }
    gekozenSter = beste.i;
    const b = IN_BEELD.get(beste.i);
    const naam = NAMEN[beste.i];
    info.textContent = `${naam ?? 'Een ster'}${b ? ` ${naam ? 'in' : 'van'} ${metDe(b)}` : naam ? '' : ' zonder eigen naam hier'}: ${waarTekst(pos[beste.i])}, ${Math.round(pos[beste.i].hoogte)}° hoog.`;
    teken();
  });

  // -- let the sky turn: time runs on, a minute every frame; with reduced motion in jumps of ten minutes
  let loopt = false; let frame = 0; let vorige = 0;
  const rustig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function speel() {
    loopt = true; zetActie(speelKnop, 'Stop', 'stop');
    const stap = (nu) => {
      if (!loopt || !el.isConnected) { stop(); return; }
      if (nu - vorige >= (rustig ? 600 : 30)) {
        vorige = nu;
        staat.minuten += rustig ? 10 : 1;
        if (staat.minuten > 31 * 60) staat.minuten = 18 * 60;
        tijdS.zet(); teken();
      }
      frame = requestAnimationFrame(stap);
    };
    frame = requestAnimationFrame(stap);
  }
  function stop() { loopt = false; cancelAnimationFrame(frame); zetActie(speelKnop, 'Laat de hemel draaien', 'start'); }

  const el = h('div.doe-sterrenkaart',
    kijkKeuze,
    h('div.hm',
      h('div.hm-beeld', svg),
      h('div.hm-tekst', datumS.el, tijdS.el, schakels, acties(nuKnop, speelKnop), stand, info, lijst,
        h('p.hm-noot', `Houd de kaart boven je hoofd, met de kant waar je naar kijkt onderaan. Het midden is recht boven je, de rand is de horizon. Voor Amersfoort; in heel Nederland bijna hetzelfde. ${eerste ? `${[...uitgelicht].map((b) => b.naam).join(', ')} in het geel. ` : ''}Tik op een ster voor zijn naam.`))));
  if (eerste) {
    const m = midden(eerste, moment(staat), plaats.breedte, plaats.lengte);
    kijk = (Math.round(m.richting / 90) * 90) % 360;
    kijkKeuze.querySelectorAll('.chip').forEach((c, i) => c.setAttribute('aria-pressed', String(i * 90 === kijk)));
    datumS.zet(); tijdS.zet();
  }
  teken();
  return el;
}
