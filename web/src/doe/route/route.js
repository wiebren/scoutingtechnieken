// The route walker: one small road network (netwerk.js), a route through it written down in a technique
// (notaties.js, drawn by tekeningen.js), and a world to walk it in: 3D with three.js (wereld3d.js, loaded only when
// WebGL works) or the map from above (kaart2d.js). At every junction you choose a road: tap it, use the buttons, or
// ← ↑ → and the number keys. A wrong road: you walk a little way in, hear what the notation said, and walk back. At
// the end: how many junctions were right the first time, and the route you walked over the route you should have.
//
// opties.techniek: one of notaties.js VOLGORDE, or 'vertaler' (choose a technique, and see the same route in a
// second one next to it).
import { h } from '../../dom.js';
import { actie, acties, keuze, schakel } from '../knoppen.js';
import { s } from './svg.js';
import '../vorm.css';
import './route.css';
import { maakAlles, waarRegel, draaiWoord, wind8, punt, afstand, peiling } from './netwerk.js';
import { TECHNIEKEN, VOLGORDE, codeer } from './notaties.js';
import { tekenNotatie, sleutel } from './tekeningen.js';
import { overzicht, maakKaart2d } from './kaart2d.js';

const KORT = { kruispunten: 'Kruispuntenroute', noordpijl: 'Kruispunten met noordpijl', 'bolletje-pijltje': 'Bolletje-pijltje',
  windrichting: 'Bolletje-pijltje met windrichting', stripkaart: 'Stripkaart', ogen: 'Ogenroute / smileyroute', kralen: 'Kralentocht',
  knopen: 'Knopenroute', tijden: 'Tijdenroute', rll: 'RLL-LLL-tocht', beschrijving: 'Beschrijvende route' };

function heeftWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch { return false; }
}

export default function routeLoper({ techniek = 'kruispunten', stil = false } = {}) {
  const vertaler = techniek === 'vertaler';
  let tA = vertaler ? 'kruispunten' : (TECHNIEKEN[techniek] ? techniek : 'kruispunten');
  let tB = vertaler ? 'stripkaart' : null;
  let variant = 'ogen'; let woorden = false;   // ogenroute: 'ogen' (eyes that look) or 'smiley' (one eye black, on a whole face)
  let stijl = 'gewoon';                         // beschrijvende route: gewoon, gedicht, konijn, sprookje (notaties.js, STIJLEN)
  let lengte = 9; let seed = 1 + Math.floor(Math.random() * 99999);
  let toonHier = false;            // "Waar ben ik?": off, so you find your place in the route yourself
  const beweging = !stil && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  // dark when the theme is dark: the panel colour is dark (works for the media query and for a forced theme)
  const donker = (() => {
    const m = getComputedStyle(document.documentElement).getPropertyValue('--paneel').trim().match(/^#(..)(..)(..)$/);
    return m ? m.slice(1).reduce((s, x) => s + parseInt(x, 16), 0) < 3 * 110 : matchMedia('(prefers-color-scheme: dark)').matches;
  })();
  const webgl = heeftWebGL();
  let plat = !webgl;                 // the map from above instead of 3D

  let net; let route; let codesA; let codesB;
  let i = 0; let status = 'laden'; let pogingen = 0; let goed = 0; let gelopen = []; let fout = null;
  let view = null; let beurt = 0; let ronde = 0; let viewKlaar = Promise.resolve();

  // -- the parts
  const scherm = h('div.rw-scherm');
  const hudNr = h('span.rw-hud-nr');
  const kompas = s('svg', { viewBox: '-20 -20 40 40', class: 'rw-kompas', 'aria-hidden': 'true' });
  const kompasNaald = s('g', {}, s('path', { d: 'M0 -14L4 0L0 2L-4 0z', class: 'rw-kompas-noord' }), s('path', { d: 'M0 14L4 0L0 -2L-4 0z', class: 'rw-kompas-zuid' }));
  kompas.append(s('circle', { r: 18, class: 'rw-kompas-rond' }), kompasNaald, s('text', { class: 'rw-kompas-n', 'text-anchor': 'middle', y: 0 }, 'N'));
  const hud = h('div.rw-hud', hudNr, kompas);
  const wereldBox = h('div.rw-wereld', scherm, hud);
  const knoppen = h('div.rw-knoppen', { role: 'group', 'aria-label': 'Kies een weg' });
  const waar = h('p.rw-waar', { 'aria-live': 'polite' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const actieRij = acties(); actieRij.hidden = true;
  const zetActies = (...k) => { actieRij.replaceChildren(...k); actieRij.hidden = !k.length; };   // no line while it is empty
  const einde = h('div.rw-einde', { hidden: true });
  const notatie = h('div.rw-notatie');

  const lengteChips = keuze([[6, 'Kort'], [9, 'Middel'], [12, 'Lang']], 9, (n) => { lengte = n; nieuw(); });
  const kop = h('div.rw-kop');
  const selectA = vertaler ? h('select.doe-veld', { 'aria-label': 'Lopen met', onchange: (e) => { tA = e.target.value; hercodeer(); } },
    VOLGORDE.map((t) => h('option', { value: t, selected: t === tA }, KORT[t]))) : null;
  const selectB = vertaler ? h('select.doe-veld', { 'aria-label': 'Vertaal naar', onchange: (e) => { tB = e.target.value || null; hercodeer(); } },
    h('option', { value: '' }, 'Niet vertalen'), VOLGORDE.map((t) => h('option', { value: t, selected: t === tB }, KORT[t]))) : null;
  if (vertaler) kop.append(h('div.rw-kiezers', h('label.doe-label', h('span', 'Lopen met'), selectA), h('label.doe-label', h('span', 'Vertaal naar'), selectB)));
  const hierChip = schakel('Waar ben ik?', toonHier, (v) => { toonHier = v; tekenNotaties(); });
  const extraChips = h('div.chips');
  const zetExtra = () => {
    extraChips.replaceChildren(hierChip);
    if (tA === 'ogen' || tB === 'ogen') extraChips.append(...keuze([['ogen', 'Ogen die kijken'], ['smiley', 'Eén oog zwart']], variant, (v) => { variant = v; tekenNotaties(); }));
    if (['kralen', 'knopen'].includes(tA) || ['kralen', 'knopen'].includes(tB)) extraChips.append(schakel('In woorden', woorden, (v) => { woorden = v; tekenNotaties(); }));
    if (tA === 'beschrijving' || tB === 'beschrijving') extraChips.append(...keuze([['gewoon', 'Gewoon'], ['gedicht', 'Gedichtje'], ['konijn', 'Konijn Floep'], ['sprookje', 'Sprookje'], ['kryptisch', 'Kryptisch']], stijl, (v) => { stijl = v; tekenNotaties(); }));
  };
  kop.append(h('div.rw-opties',
    h('div.chips', { role: 'group', 'aria-label': 'Lengte van de route' }, lengteChips),
    actie('Nieuwe route', 'opnieuw', () => { seed = 1 + Math.floor(Math.random() * 99999); nieuw(); }, { klein: true }),
    webgl ? schakel('Van bovenaf', plat, (v) => { plat = v; maakView().then(herstel); }) : null));

  const el = h('div.rw',
    kop,
    h('div.rw-hoofd',
      h('div.rw-links', wereldBox, knoppen, waar, actieRij, melding, einde),
      h('div.rw-rechts', h('div.rw-notatie-kop', h('strong', 'De route')), extraChips, notatie)));
  el.addEventListener('keydown', toets);

  // -- the view (3D or the map), made again for every network. `beurt` counts views, `ronde` routes: a walk that
  // is under way when the view changes finishes in the new view.
  function maakView() { viewKlaar = bouwView(); return viewKlaar; }
  async function bouwView() {
    const mijn = ++beurt;
    view?.dispose(); view = null;
    scherm.replaceChildren(h('p.rw-laden', 'De wereld wordt geladen…'));
    const opties = { opKeuze: kies, beweging, donker };
    let v = null;
    if (!plat) {
      try {
        const m = await import('./wereld3d.js');
        if (mijn !== beurt) return;
        scherm.replaceChildren();
        v = m.maakWereld3d(scherm, net, route, opties);
      } catch { plat = true; }
    }
    if (mijn !== beurt) return;
    if (!v) { scherm.replaceChildren(); v = maakKaart2d(scherm, net, route, opties); }
    view = v;
    scherm.classList.toggle('plat', plat);
  }
  // after switching between 3D and the map: put the new view where the old one was
  function herstel() {
    if (!view) return;
    if (status === 'kies') toonStap();
    else if (status === 'fout') view.zet({ pos: fout, koers: peiling(net.knopen[stap().knoop], fout) });
    else if (status === 'klaar') view.zet({ pos: route.eind, koers: route.eind.koers });
    // 'lopen': kies() or terug() places the new view when the walk is over
  }
  // a walk in the view, then wait for a view that may have been switched meanwhile; false if the route changed
  async function loopIn(punten, koers) {
    const mijn = ronde;
    await view.loop(punten, koers);
    await viewKlaar;
    return mijn === ronde && !!view;
  }

  // -- a new route
  async function nieuw() {
    ronde++;
    ({ net, route, seed } = maakAlles(seed, lengte));
    i = 0; pogingen = 0; goed = 0; fout = null;
    gelopen = [{ x: route.start.x, y: route.start.y }, standplek(route.stappen[0])];
    einde.hidden = true; einde.replaceChildren();
    hercodeer();
    status = 'laden';
    await maakView();
    if (!view) return;
    status = 'kies';
    toonStap();
  }
  function hercodeer() {
    codesA = codeer(tA, route, net);
    codesB = tB && tB !== tA ? codeer(tB, route, net) : null;
    zetExtra();
    kompas.style.display = TECHNIEKEN[tA].noorden || (codesB && TECHNIEKEN[tB].noorden) ? '' : 'none';
    tekenNotaties();
  }
  function tekenNotaties() {
    const blok = (t, codes, titel) => h('section.rw-blok',
      titel ? h('h4', titel) : null,
      tekenNotatie(t, codes, { hier: status === 'klaar' ? route.stappen.length : i, toon: toonHier, variant, woorden, stijl }),
      sleutel(t, variant));
    notatie.replaceChildren(...[blok(tA, codesA, codesB || vertaler ? KORT[tA] : null), codesB ? blok(tB, codesB, `Vertaald: ${KORT[tB]}`) : null].filter(Boolean));
    notatie.classList.toggle('twee', !!codesB);
  }

  // -- standing at junction i
  const stap = () => route.stappen[i];
  // where you stand at a junction: not in the middle, but just inside the street you arrive from
  const standplek = (st) => {
    const k = net.knopen[st.knoop];
    return punt(k, Math.min(6, afstand(k, net.knopen[st.van]) * 0.3), st.koers + 180);
  };
  function toonStap() {
    const st = stap(); const k = net.knopen[st.knoop];
    // the street names, for the techniques that use them: the signs in 3D are small on a phone, the map has none
    const namen = [tA, tB].some((t) => t === 'rll' || t === 'beschrijving');
    knoppen.classList.toggle('namen', namen);
    view.zet({ pos: standplek(st), koers: st.koers, keuzes: st.wegen, knoop: k });
    if (pogingen >= 2) view.markeer(st.gekozen, 'hint');
    hudNr.textContent = `Kruispunt ${i + 1} van ${route.stappen.length}`;
    kompasNaald.setAttribute('transform', `rotate(${Math.round(-st.koers)})`);
    knoppen.replaceChildren(...st.wegen.map((w, j) => {
      const pijl = s('svg', { viewBox: '-12 -12 24 24', width: 22, height: 22, 'aria-hidden': 'true' },
        s('path', { d: `M0 8V-6M-5 -1L0 -7L5 -1`, transform: `rotate(${Math.round(w.draai)})`, class: 'rw-knop-pijl' }));
      return h('button.knop.rw-keuze', { type: 'button', 'aria-label': `Weg ${j + 1}: ${draaiWoord(w.draai)}, naar het ${wind8(w.peiling)}en, ${w.naam}`,
        onclick: () => kies(j), onfocus: () => view?.markeer(j), onblur: () => view?.markeer(-1),
        onpointerenter: () => view?.markeer(j), onpointerleave: () => view?.markeer(-1) },
      h('span.rw-keuze-nr', String(j + 1)), pijl, h('span.rw-keuze-tekst', draaiWoord(w.draai), namen ? h('small', w.naam) : null));
    }));
    waar.textContent = waarRegel(st, i, route.stappen.length);
    zetActies();
    tekenNotaties();
  }

  // -- choosing a road
  async function kies(j) {
    if (status !== 'kies' || !view) return;
    const st = stap(); const k = net.knopen[st.knoop]; const w = st.wegen[j];
    const focus = el.contains(document.activeElement) && document.activeElement.closest('.rw-knoppen, .rw-scherm');
    status = 'lopen'; knoppen.replaceChildren(); melding.classList.remove('fout');
    if (j === st.gekozen) {
      if (pogingen === 0) goed++;
      melding.textContent = pogingen ? 'Ja, deze is het.' : 'Goed!';
      const laatste = i === route.stappen.length - 1;
      const doel = laatste ? route.eind : standplek(route.stappen[i + 1]);
      const hier = standplek(st);
      gelopen.push({ x: k.x, y: k.y }, { x: doel.x, y: doel.y });
      waar.textContent = laatste ? 'Je loopt naar de post.' : `Je loopt ${draaiWoord(w.draai)} naar kruispunt ${i + 2}.`;
      if (!await loopIn([hier, k, doel], w.peiling)) return;
      if (laatste) { klaar(); return; }
      i++; pogingen = 0; status = 'kies'; melding.textContent = '';
      toonStap();
      // keep the keyboard where it was: on the buttons for the roads
      if (focus || document.activeElement === document.body) knoppen.querySelector('button')?.focus({ preventScroll: true });
    } else {
      pogingen++;
      const lang = afstand(k, net.knopen[w.naar]);
      const p = punt(k, Math.min(20, lang * 0.45), w.peiling);
      gelopen.push({ x: k.x, y: k.y }, p);
      waar.textContent = `Je loopt ${draaiWoord(w.draai)}.`;
      const was = view;
      if (!await loopIn([standplek(st), k, p], w.peiling)) return;
      if (view !== was) view.zet({ pos: p, koers: w.peiling });
      status = 'fout'; fout = p;
      const t = TECHNIEKEN[tA];
      melding.classList.add('fout');
      melding.textContent = `Hmm, dit is niet de goede weg${w.doodlopend ? ' (en hij loopt ook nog dood)' : ''}. ${t.uitleg(codesA, i, st, variant, stijl)} Loop terug en kies opnieuw.`;
      const terugKnop = actie('Loop terug', 'terug', terug, { hoofd: true });
      zetActies(terugKnop);
      terugKnop.focus({ preventScroll: true });
    }
  }
  async function terug() {
    if (status !== 'fout' || !view) return;
    const st = stap(); const k = net.knopen[st.knoop];
    status = 'lopen'; zetActies();
    const plek = standplek(st);
    gelopen.push({ x: k.x, y: k.y }, plek);
    if (!await loopIn([fout, k, plek], st.koers)) return;
    status = 'kies';
    melding.classList.remove('fout');
    melding.textContent = pogingen >= 2 ? 'Je staat weer op het kruispunt. De goede weg licht nu groen op.' : 'Je staat weer op het kruispunt. Kijk nog eens goed.';
    toonStap();
    knoppen.querySelector('button')?.focus({ preventScroll: true });
  }

  function klaar() {
    status = 'klaar';
    const K = route.stappen.length;
    view.zet({ pos: route.eind, koers: route.eind.koers });
    hudNr.textContent = 'Bij de post';
    knoppen.replaceChildren();
    const oordeel = goed === K ? 'Foutloos! Probeer een langere route of een andere techniek.'
      : goed >= K * 0.7 ? 'Goed gedaan. Kijk op de kaart waar het misging.' : 'Kijk op de kaart waar het misging: blauw is hoe jij liep, groen de route.';
    melding.classList.remove('fout');
    melding.textContent = `Je bent bij de post! ${goed} van de ${K} kruispunten had je in één keer goed.`;
    waar.textContent = '';
    einde.hidden = false;
    einde.replaceChildren(h('p.doe-stil', oordeel), overzicht(net, route, gelopen),
      h('p.rw-legenda-regel', h('span.rw-lijn-groen'), 'route  ', h('span.rw-lijn-blauw'), 'jij'));
    zetActies(
      actie('Nieuwe route', 'opnieuw', () => { seed = 1 + Math.floor(Math.random() * 99999); nieuw(); }, { hoofd: true }),
      actie('Deze nog een keer', 'opnieuw', () => nieuw()));
    tekenNotaties();
  }

  // -- keys: ← ↑ → for the road to the left, straight on and to the right; 1–9 for the nth road from the left
  function toets(e) {
    if (e.target.closest('select, input, textarea') || e.altKey || e.ctrlKey || e.metaKey) return;
    if (status === 'fout' && ['ArrowDown', 'Backspace', 'Escape'].includes(e.key)) { e.preventDefault(); terug(); return; }
    if (status !== 'kies') return;
    const wegen = stap().wegen;
    let j = -1;
    if (/^[1-9]$/.test(e.key) && Number(e.key) <= wegen.length) j = Number(e.key) - 1;
    const doel = { ArrowLeft: -90, ArrowUp: 0, ArrowRight: 90 }[e.key];
    if (doel != null) {
      const kant = (w) => (doel === 0 ? Math.abs(w.draai) <= 35 : Math.sign(w.draai) === Math.sign(doel) && Math.abs(w.draai) > 20);
      let min = Infinity;
      wegen.forEach((w, x) => { const d = Math.abs(w.draai - doel); if (kant(w) && d < min) { min = d; j = x; } });
    }
    if (j >= 0) { e.preventDefault(); kies(j); }
  }

  // -- clean up once the card is gone
  // (the card attaches the element as soon as it is made, so not connected means gone, also after a short visit)
  const wacht = setInterval(() => {
    if (el.isConnected) return;
    clearInterval(wacht); beurt++; ronde++; view?.dispose(); view = null;
  }, 1500);

  nieuw();
  return el;
}
