// The first-person view with a compass in your hand, shared by the kompas3d pieces: the world of the tochten
// (landschap3d.js, or the flat landschap2d.js without WebGL) with the four landmarks of a field (veld.js), and over
// it the compass as you hold it (kompasbeeld.js):
// - 'spiegel': the spiegelpeilkompas at eye height, the sight notch on the horizon, the mirror under it. You turn the
//   housing on its top (a control under the view: the ring as your fingers feel it); the mirror follows.
// - 'plaat': the plaatkompas held flat in front of you, the direction arrow pointing into the landscape; you turn
//   the housing on the compass itself.
// Drag the landscape (or ← → on it, or ◀ ▶) to turn yourself. The needle keeps pointing north, swings a little and
// settles (only then is there a frame loop). The 3D view renders one frame per change.
import { h } from '../../dom.js';
import { BAKENS, inVizier, zijde, graden } from './veld.js';
import { maakLandschap2d } from './landschap2d.js';
import { tekenEindplaat, tekenSpiegel, tekenBovenkant, tekenPlaatkompas } from './kompasbeeld.js';
import '../vorm.css';
import './schieten.css';

/** What differs between the two compasses: how close is close enough (degrees), and the words. */
export const SOORT = {
  spiegel: {
    tol: { richt: 2.5, naald: 2.5, lees: 2.5, kijk: 6 },
    tientallen: true,
    huisje: 'tussen de twee streepjes',
    richtNaar: (naam) => `Draai jezelf tot ${naam} midden in de inkeping staat.`,
    vizier: (naam) => `${naam} in het vizier`,
    nietGericht: (naam, waar) => `Je vizier staat niet op ${naam}: die staat nog ${waar}. Draai tot hij midden in de inkeping staat.`,
    anderGericht: (ander, naam) => `Je vizier staat op ${ander}, niet op ${naam}. Draai jezelf tot ${naam} in de inkeping staat.`,
    index: 'bij de index, bovenaan in de spiegel',
    kijkVraag: 'Wat zie je midden in de inkeping?',
    kijkNog: 'Kijk nog eens door de inkeping',
    hulp: 'Je mikt over de inkeping en ziet tegelijk in de spiegel het huis met de naald. Het huis draai je bovenop het kompas, met je vingers; in de spiegel draait het mee. De spiegel laat de onderkant van het huis zien en keert dat nog eens om: zo lees je de schaal gewoon, met de klok mee, net als van bovenaf. De cijfers zijn tientallen: 12 is 120°. Elk streepje is 2°.',
  },
  plaat: {
    tol: { richt: 4, naald: 3, lees: 3, kijk: 8 },
    tientallen: false,
    huisje: 'in de oriëntatiepijl',
    richtNaar: (naam) => `Houd het kompas plat voor je en draai jezelf tot de richtingspijl recht naar ${naam} wijst.`,
    vizier: (naam) => `de richtingspijl wijst naar ${naam}`,
    nietGericht: (naam, waar) => `Je richtingspijl wijst niet naar ${naam}: die staat nog ${waar}. Draai jezelf tot de pijl er recht naartoe wijst.`,
    anderGericht: (ander, naam) => `Je richtingspijl wijst naar ${ander}, niet naar ${naam}.`,
    index: 'bij de index, waar de richtingspijl het huis raakt',
    kijkVraag: 'Waar wijst de richtingspijl naar?',
    kijkNog: 'Kijk nog eens langs de richtingspijl',
    hulp: 'Houd het kompas plat, op borsthoogte, en kijk langs de richtingspijl naar de horizon. Het huis draai je op het kompas zelf. Elk streepje op het huis is 2°. Uit de hand is een plaatkompas minder precies dan een spiegelpeilkompas: een paar graden ernaast is normaal.',
  },
};

function heeftWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch { return false; }
}

/** Dark when the panel colour is dark (works for the media query and for a forced theme). */
function themaDonker() {
  const m = getComputedStyle(document.documentElement).getPropertyValue('--paneel').trim().match(/^#(..)(..)(..)$/);
  return m ? m.slice(1).reduce((t, x) => t + parseInt(x, 16), 0) < 3 * 110 : matchMedia('(prefers-color-scheme: dark)').matches;
}

/** A round button that turns one step, and keeps turning while held down; Enter or space turns one step. The
 *  timers go in `timers`, for the caller to clear. */
export function houdKnop(timers, label, tekst, stap) {
  let t1 = 0; let t2 = 0;
  const stop = () => { clearTimeout(t1); clearInterval(t2); timers.delete(t1); timers.delete(t2); };
  return h('button.knop.klein.k3-rond', { type: 'button', 'aria-label': label, title: label,
    onpointerdown: (e) => { if (e.button) return; stap(); stop(); t1 = setTimeout(() => { t2 = setInterval(stap, 60); timers.add(t2); }, 380); timers.add(t1); },
    onpointerup: stop, onpointerleave: stop, onpointercancel: stop,
    onclick: (e) => { if (e.detail === 0) stap(); } }, h('span', { 'aria-hidden': 'true' }, tekst));
}

let teller = 0;
const p1 = (n) => Math.round(n * 10) / 10;
const kant = (d) => (d > 0 ? 'rechts' : 'links');

/**
 * @param opties.kompas 'spiegel' or 'plaat'
 * @param opties.veld the field (veld.js maakVeld)
 * @param opties.stil no animation (else prefers-reduced-motion decides)
 * @param opties.opDraai called after every turn of you or the housing
 * Returns { el, bediening, stand, zetKoers, zetHuis, koers(), huis(), zetVeld(veld), zetNamen(aan), naaldFout(wie),
 * richtFout(baken), inVizier(tol), dispose() }.
 */
export function maakKijker({ kompas = 'spiegel', veld, stil = false, opDraai = () => {} }) {
  const S = SOORT[kompas];
  const id = `k3-${++teller}`;
  const beweging = !stil && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const webgl = heeftWebGL();
  let koers = Math.random() * 360;          // where you look, compass degrees
  let huis = Math.random() * 360;           // the degrees at the index of the housing
  let naaldHoek = -koers; let naaldV = 0;   // the needle as drawn (screen degrees, the housing seen from above), its swing
  let view = null; let weg = false;
  let maten = { breed: 0, hoog: 0, lucht: 0, hfov: 54 };

  // -- the parts
  const namen = h('div.k3-namen', { 'aria-hidden': 'true' });
  const naamLabels = [];
  const zicht = h('div.k3-zicht', { role: 'slider', tabindex: '0', 'aria-valuemin': '0', 'aria-valuemax': '359',
    'aria-label': 'Jouw kijkrichting. Sleep over het landschap of gebruik pijltjes links en rechts om je te draaien.' });
  let kompasBox; let schalen; let naald; let draaiEl; let draaiMidden; let spiegelSvg = null; let boven = null;
  if (kompas === 'spiegel') {
    const sp = tekenSpiegel(id);
    boven = tekenBovenkant();
    spiegelSvg = sp.svg;
    kompasBox = h('div.k3-kompas.spiegel', tekenEindplaat(), sp.svg);
    schalen = [[sp.ring, sp.cx, sp.cy], [boven.ring, boven.cx, boven.cy]];
    naald = [sp.naald, sp.cx, sp.cy];
    draaiEl = boven.svg; draaiMidden = boven;
  } else {
    const pk = tekenPlaatkompas();
    kompasBox = h('div.k3-kompas.plaat', pk.svg);
    schalen = [[pk.ring, pk.cx, pk.cy]];
    naald = [pk.naald, pk.cx, pk.cy];
    draaiEl = pk.svg; draaiMidden = pk;
  }
  const beeld = h('div.k3-beeld', zicht, namen, kompasBox, h('p.k3-laden', webgl ? 'Het landschap wordt geladen…' : ''));
  const stand = h('p.doe-sr', { 'aria-live': 'polite' });

  const timers = new Set();
  const houd = (label, tekst, stap) => houdKnop(timers, label, tekst, stap);
  const jij = h('div.k3-groep', { role: 'group', 'aria-label': 'Draai jezelf' }, h('span.k3-groep-label', 'Jij'),
    houd('Draai jezelf naar links', '◀', () => zetKoers(koers - 1)), houd('Draai jezelf naar rechts', '▶', () => zetKoers(koers + 1)));
  const tegen = houd('Draai het huis tegen de klok in', '↺', () => zetHuis(huis + 1));
  const mee = houd('Draai het huis met de klok mee', '↻', () => zetHuis(huis - 1));
  const bediening = kompas === 'spiegel'
    ? h('div.k3-bediening', jij,
      h('div.k3-draai', { role: 'group', 'aria-label': 'Draai het huis' }, tegen, h('div.k3-draai-midden', boven.svg, h('span.k3-groep-label', 'Draai het huis')), mee))
    : h('div.k3-bediening', jij, h('div.k3-groep', { role: 'group', 'aria-label': 'Draai het huis' }, h('span.k3-groep-label', 'Huis'), tegen, mee));

  // -- the state on screen
  function naaldTekst() {
    const d = zijde(huis, koers);
    if (Math.abs(d) <= S.tol.naald) return 'De rode punt van de naald staat in het huisje.';
    if (Math.abs(d) >= 180 - S.tol.naald) return 'De zwarte kant van de naald staat in het huisje.';
    return `De naald staat ${Math.round(Math.abs(d))} graden ${d > 0 ? 'rechts' : 'links'} van het huisje.`;
  }
  function vizierTekst() {
    const b = inVizier(veld, koers, S.tol.richt);
    return b ? S.vizier(BAKENS[b.soort].de) : 'niets bijzonders recht voor je';
  }
  function tekenHuis() {
    for (const [g, cx, cy] of schalen) g.setAttribute('transform', `rotate(${p1(-huis)} ${cx} ${cy})`);
    const tekst = `${graden(huis)} graden bij de index. ${naaldTekst()}`;
    draaiEl.setAttribute('aria-valuenow', String(graden(huis)));
    draaiEl.setAttribute('aria-valuetext', tekst);
    spiegelSvg?.setAttribute('aria-label', `In de spiegel: het huis, ${tekst}`);
  }
  function tekenNaald() { naald[0].setAttribute('transform', `rotate(${p1(naaldHoek)} ${naald[1]} ${naald[2]})`); }
  let standTimer = 0;
  function meld() {
    zicht.setAttribute('aria-valuenow', String(graden(koers)));
    zicht.setAttribute('aria-valuetext', `${graden(koers)} graden, ${vizierTekst()}`);
    tekenHuis();
    clearTimeout(standTimer);
    standTimer = setTimeout(() => { if (!weg) stand.textContent = `Je kijkt naar ${graden(koers)} graden, ${vizierTekst()}. Het huis staat op ${graden(huis)} graden. ${naaldTekst()}`; }, 900);
    opDraai();
  }
  function zetKoers(k) {
    koers = ((k % 360) + 360) % 360;
    view?.zet(koers);
    swing();
    meld();
  }
  function zetHuis(g) { huis = ((g % 360) + 360) % 360; meld(); }

  // the needle swings after a turn and settles (a damped spring); only while it moves is there a frame loop
  let naaldRaf = 0; let vorige = 0;
  function swing() {
    if (!beweging) { naaldHoek = -koers; naaldV = 0; tekenNaald(); return; }
    if (!naaldRaf) { vorige = 0; naaldRaf = requestAnimationFrame(naaldStap); }
  }
  function naaldStap(nu) {
    naaldRaf = 0;
    if (weg) return;
    const dt = Math.min(0.05, vorige ? (nu - vorige) / 1000 : 0.016); vorige = nu;
    naaldV += (-70 * zijde(naaldHoek, -koers) - 9 * naaldV) * dt;
    naaldHoek += naaldV * dt;
    if (Math.abs(zijde(naaldHoek, -koers)) < 0.05 && Math.abs(naaldV) < 0.5) { naaldHoek = -koers; naaldV = 0; tekenNaald(); return; }
    tekenNaald();
    naaldRaf = requestAnimationFrame(naaldStap);
  }

  // -- the labels over the landmarks
  function zetLabels(posities) {
    posities.forEach((q, i) => {
      const lab = naamLabels[i]; if (!lab) return;
      lab.hidden = !q.zichtbaar;
      if (q.zichtbaar) lab.style.transform = `translate(${Math.round(q.x)}px, ${Math.round(q.y)}px) translate(-50%, -100%)`;
    });
  }

  // -- the view: 3D when it can, else flat
  let maakNr = 0;
  async function maakView() {
    const mijn = ++maakNr;
    view?.dispose(); view = null;
    naamLabels.length = 0;
    namen.replaceChildren(...veld.bakens.map((b) => { const l = h('span.k3-naam', BAKENS[b.soort].naam); naamLabels.push(l); return l; }));
    const opties = { donker: themaDonker(), opRender: zetLabels };
    let v = null;
    if (webgl) {
      try {
        const m = await import('./landschap3d.js');
        if (mijn !== maakNr || weg) return;
        v = m.maakLandschap3d(zicht, veld, opties);
      } catch { v = null; }
    }
    if (mijn !== maakNr || weg) { v?.dispose(); return; }
    if (!v) v = maakLandschap2d(zicht, veld, opties);
    beeld.querySelector('.k3-laden')?.remove();
    view = v;
    pasAan(true);
    view.zet(koers);
  }

  // -- size: the compass about 70% of the view, at most 280 px wide. The horizon in the sight notch (spiegel), or just
  // above the tip of the direction arrow (plaat).
  function pasAan(altijd = false) {
    const breed = beeld.clientWidth; if (!breed) return;
    const kompasB = Math.min(kompas === 'spiegel' ? 280 : 270, Math.round(breed * 0.72));
    const sc = kompasB / 240;
    const lucht = Math.round(Math.min(200, Math.max(110, breed * 0.3)));
    const top = kompas === 'spiegel' ? lucht - 14 * sc : lucht + 16 * sc;
    const hoog = Math.round(top + (kompas === 'spiegel' ? 50 + 252 : 330) * sc + 6);
    const hfov = breed < 520 ? 54 : 64;
    if (!altijd && breed === maten.breed && hoog === maten.hoog) return;
    maten = { breed, hoog, lucht, hfov };
    beeld.style.height = `${hoog}px`;
    kompasBox.style.width = `${kompasB}px`;
    kompasBox.style.top = `${Math.round(top)}px`;
    view?.maat(breed, hoog, lucht, hfov);
  }
  const ro = new ResizeObserver(() => { if (!weg) pasAan(); });
  ro.observe(beeld);

  // -- turning yourself: drag over the landscape (the world stays under your finger), or the keys
  let sleep = null;
  beeld.addEventListener('pointerdown', (e) => {
    if (e.button || e.target.closest('.k3-draaibaar')) return;
    sleep = { id: e.pointerId, x: e.clientX };
    beeld.setPointerCapture(e.pointerId); beeld.classList.add('sleept');
    zicht.focus({ preventScroll: true });
  });
  beeld.addEventListener('pointermove', (e) => {
    if (!sleep || e.pointerId !== sleep.id) return;
    const dx = e.clientX - sleep.x; sleep.x = e.clientX;
    if (dx) zetKoers(koers - (dx * maten.hfov) / Math.max(1, maten.breed));
  });
  const laatLos = (e) => { if (sleep && e.pointerId === sleep.id) { sleep = null; beeld.classList.remove('sleept'); } };
  beeld.addEventListener('pointerup', laatLos);
  beeld.addEventListener('pointercancel', laatLos);
  const PIJL = { ArrowLeft: -1, ArrowDown: -1, PageDown: -1, ArrowRight: 1, ArrowUp: 1, PageUp: 1 };
  const stapVoor = (e) => (e.shiftKey || e.key.startsWith('Page') ? 10 : 1);
  zicht.addEventListener('keydown', (e) => {
    const r = PIJL[e.key]; if (!r) return;
    e.preventDefault(); zetKoers(koers + r * stapVoor(e));
  });

  // -- turning the housing: drag round its middle (the top of the housing, or the plaatkompas), or the keys (right
  // and up: a higher number). Turning the ring clockwise brings a lower number to the index.
  let draai = null;
  const [vx, vy, vw, vh] = draaiMidden.vak;
  const hoekVan = (e) => {
    const b = draaiEl.getBoundingClientRect();
    const x = e.clientX - (b.left + ((draaiMidden.cx - vx) / vw) * b.width);
    const y = e.clientY - (b.top + ((draaiMidden.cy - vy) / vh) * b.height);
    return Math.hypot(x, y) < 6 ? null : Math.atan2(x, -y) / (Math.PI / 180);
  };
  draaiEl.addEventListener('pointerdown', (e) => {
    if (e.button) return;
    e.stopPropagation();
    draai = { id: e.pointerId, hoek: hoekVan(e) };
    draaiEl.setPointerCapture(e.pointerId); draaiEl.classList.add('sleept');
    draaiEl.focus({ preventScroll: true });
  });
  draaiEl.addEventListener('pointermove', (e) => {
    if (!draai || e.pointerId !== draai.id) return;
    const a = hoekVan(e); if (a == null) return;
    if (draai.hoek != null) zetHuis(huis - zijde(a, draai.hoek));
    draai.hoek = a;
  });
  const stopDraai = (e) => { if (draai && e.pointerId === draai.id) { draai = null; draaiEl.classList.remove('sleept'); } };
  draaiEl.addEventListener('pointerup', stopDraai);
  draaiEl.addEventListener('pointercancel', stopDraai);
  draaiEl.addEventListener('keydown', (e) => {
    const r = PIJL[e.key]; if (!r) return;
    e.preventDefault(); e.stopPropagation(); zetHuis(huis + r * stapVoor(e));
  });

  // -- theme: a switched theme or system setting builds the landscape again
  const opThema = () => { if (view) maakView(); };
  const thema = new MutationObserver(opThema);
  thema.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const media = matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', opThema);

  tekenNaald(); meld();
  maakView();

  return {
    el: beeld, bediening, stand,
    koers: () => koers, huis: () => huis,
    zetKoers, zetHuis,
    zetVeld(v) { veld = v; maakView(); meld(); },
    zetNamen(aan) { namen.hidden = !aan; },
    inVizier: (tol = S.tol.richt) => inVizier(veld, koers, tol),
    /** What is wrong with the aim at a landmark, or null. */
    richtFout(baken) {
      const naam = BAKENS[baken.soort].de;
      const d = zijde(baken.peiling, koers);
      if (Math.abs(d) <= S.tol.richt) return null;
      const ander = inVizier(veld, koers, S.tol.richt);
      return ander ? S.anderGericht(BAKENS[ander.soort].de, naam) : S.nietGericht(naam, `${Math.abs(d) > 15 ? 'een eind' : 'een stukje'} naar ${kant(d)}`);
    },
    /** What is wrong with the needle, or null when red is in the arrow. `wie`: 'huis' or 'jij', what to turn. */
    naaldFout(wie) {
      const d = zijde(huis, koers);      // > 0: the needle stands right (clockwise) of the arrow
      if (Math.abs(d) <= S.tol.naald) return null;
      if (Math.abs(d) >= 165) {
        return wie === 'huis'
          ? 'De zwarte kant van de naald staat in het huisje. Rood hoort in het huisje: draai het huis een halve slag.'
          : 'De zwarte kant van de naald staat in het huisje: zo loop je precies de verkeerde kant op. Draai je om tot rood in het huisje staat.';
      }
      return wie === 'huis'
        ? `De naald staat nog niet ${S.huisje}. Draai het huis nog wat ${d > 0 ? 'met de klok mee' : 'tegen de klok in'}.`
        : `De naald staat nog niet ${S.huisje}. Draai jezelf nog wat naar ${kant(d)}.`;
    },
    dispose() {
      weg = true;
      clearTimeout(standTimer); for (const t of timers) { clearTimeout(t); clearInterval(t); }
      if (naaldRaf) cancelAnimationFrame(naaldRaf);
      ro.disconnect(); thema.disconnect(); media.removeEventListener('change', opThema);
      view?.dispose(); view = null;
    },
  };
}

/** Free a piece once its card is gone (the card attaches the element as soon as it is made). */
export function opruimen(el, weg) {
  let gezien = false; const t0 = Date.now();
  setTimeout(() => { gezien ||= el.isConnected; }, 0);
  const wacht = setInterval(() => {
    if (el.isConnected) { gezien = true; return; }
    if (!gezien && Date.now() - t0 < 10000) return;
    clearInterval(wacht); weg();
  }, 1000);
}
