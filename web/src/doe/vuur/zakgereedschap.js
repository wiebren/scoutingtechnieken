// A Zwitsers zakmes or a multitool in 3D (opties.soort: 'zwitsers' or 'multitool'). Choose a model; tap a part, or
// its chip, and it folds open or shut, with what it is for below. Turn it with a finger or the mouse, zoom with two
// fingers, the wheel, or + and −. On a multitool the inner parts come out only with the pliers open, the outer ones
// only with the handles closed. Without WebGL: the parts and what they are for, as a list. The 3D part (three.js)
// is loaded only when WebGL works: zakgereedschap3d.js.
import { h } from '../../dom.js';
import { keuze, actie, acties } from '../knoppen.js';
import { DELEN, SOORTEN } from './zakgereedschap-modellen.js';
import '../vorm.css';
import '../sjorren/bouwwerk.css';

function heeftWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch { return false; }
}

/** The colours of the theme, from the CSS tokens (so a forced theme counts too). */
function themaKleuren() {
  const st = getComputedStyle(document.documentElement);
  const v = (n, x) => st.getPropertyValue(n).trim() || x;
  const paneel = v('--paneel', '#ffffff');
  const m = paneel.match(/^#(..)(..)(..)$/);
  const donker = m ? m.slice(1).reduce((s, x) => s + parseInt(x, 16), 0) < 3 * 110 : false;
  return { achter: v('--zacht', donker ? '#1f2923' : '#edf1ed'), accent: v('--accent', '#00803f'), donker };
}

const hoofdletter = (t) => t[0].toUpperCase() + t.slice(1);

export default function zakgereedschap({ soort: welk = 'zwitsers', stil = false } = {}) {
  const S = SOORTEN[welk] ?? SOORTEN.zwitsers;
  const isTang = S.soort === 'tang';
  let model = S.modellen[0];
  const beweging = !stil && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const webgl = heeftWebGL();
  let scene = null; let weg = false;
  // what is open now; a new model starts with the big blade open, or the pliers
  let open = new Set();
  const beginStand = () => new Set([isTang ? 'tang' : 'groot-mes']);

  const scherm = h('div.bw-scherm', {
    tabindex: webgl ? '0' : null, role: webgl ? 'group' : null,
    'aria-label': `${S.label} in 3D. Pijltjes draaien het, plus en min zoomen in en uit, 0 zet het terug.`,
  });
  const zoomKnoppen = h('div.bw-hoek',
    h('button.bw-rond', { type: 'button', 'aria-label': 'Inzoomen', onclick: () => scene?.zoom(0.8) }, '+'),
    h('button.bw-rond', { type: 'button', 'aria-label': 'Uitzoomen', onclick: () => scene?.zoom(1.25) }, '−'),
    h('button.bw-rond', { type: 'button', 'aria-label': 'Terug naar het begin', title: 'Terug naar het begin', onclick: () => scene?.herstel() },
      h('span', { 'aria-hidden': 'true' }, '⟲')));
  const modelRij = h('div.bw-variant', h('span.bw-kop', 'Model:'),
    h('div.chips', { role: 'group', 'aria-label': 'Kies het model' }, keuze(S.modellen.map((m) => [m.id, m.naam]), model.id, (id) => wissel(id))));
  const delenRij = h('div.chips.bw-legenda', { role: 'group', 'aria-label': 'Klap open of dicht' });
  const info = h('div.bw-info', { 'aria-live': 'polite' });
  const lijst = h('ul.bw-delen');
  const delen = h('details.bw-details', { open: !webgl }, h('summary', 'Wat zit erop?'), lijst);
  const knopDicht = actie('Klap alles dicht', null, () => allesDicht());
  const knopOpen = isTang ? null : actie('Klap alles open', null, () => allesOpen());

  const el = h('div.bw',
    webgl ? h('div.bw-beeld', scherm, zoomKnoppen) : h('p.bw-geen3d', 'Je browser kan hier geen 3D laten zien (WebGL staat uit of ontbreekt). Hieronder staat wat erop zit, en waarvoor het is.'),
    S.modellen.length > 1 ? modelRij : null,
    webgl ? h('p.doe-stil.bw-hulp', 'Sleep om te draaien, knijp of scroll om te zoomen. Tik op een onderdeel om het open of dicht te klappen.') : null,
    webgl ? delenRij : null,
    info,
    webgl ? acties(...[knopOpen, knopDicht].filter(Boolean)) : null,
    delen);

  const tikbaar = () => model.delen.filter((p) => !DELEN[p.id].vast);
  let chips = [];
  function maakChips() {
    chips = tikbaar().map((p) => h('button.chip', { type: 'button', 'aria-pressed': String(open.has(p.id)), 'data-deel': p.id,
      onclick: () => wissel1(p.id) }, hoofdletter(DELEN[p.id].naam)));
    delenRij.replaceChildren(...chips);
    lijst.replaceChildren(...model.delen.map((p) => h('li', h('strong', hoofdletter(DELEN[p.id].naam)), ': ', DELEN[p.id].uitleg)));
  }
  const zetChips = () => { for (const c of chips) c.setAttribute('aria-pressed', String(open.has(c.dataset.deel))); };
  const toon = (id, extra = null) => {
    const d = DELEN[id];
    info.replaceChildren(h('p', h('strong', hoofdletter(d.naam)), h('br'), extra ?? d.uitleg));
    scene?.kies(id);
  };

  /** Open or close one part, as far as the multitool lets you. */
  function wissel1(id) {
    const p = model.delen.find((x) => x.id === id);
    const nu = !open.has(id);
    if (isTang && id === 'tang') {
      // folding the handles: first every part back in
      for (const x of [...open]) if (x !== 'tang') { open.delete(x); scene?.zet(x, false); }
    } else if (isTang && nu && !p.buiten && !open.has('tang')) {
      toon(id, 'Dit zit binnen in een handvat. Klap eerst de tang open, dan kun je het uitklappen.'); return;
    } else if (isTang && nu && p.buiten && open.has('tang')) {
      toon(id, 'Dit klap je uit met de handvatten dicht. Klap eerst de tang dicht.'); return;
    }
    if (nu) open.add(id); else open.delete(id);
    scene?.zet(id, nu);
    zetChips();
    toon(id);
  }
  function allesDicht() {
    for (const id of open) scene?.zet(id, false);
    open.clear(); zetChips(); info.replaceChildren(); scene?.kies(null);
  }
  // all open: the parts at one end fan out, as in a photo of the knife, so that each one shows
  function allesOpen() {
    const per = { 1: 0, '-1': 0 };
    for (const p of tikbaar()) {
      const ver = p.rug || p.schuif || !p.eind ? 1 : 1 - 0.17 * per[p.eind]++;
      open.add(p.id); scene?.zet(p.id, ver);
    }
    zetChips(); info.replaceChildren(); scene?.kies(null);
  }

  // -- another model: a new scene
  function wissel(id) {
    if (id === model.id) return;
    model = S.modellen.find((m) => m.id === id) ?? model;
    open = beginStand(); maakChips(); info.replaceChildren();
    if (scene) { rust(); bouw(); }
  }

  // -- keys on the picture
  scherm.addEventListener('keydown', (e) => {
    if (!scene || e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key;
    if (k === 'ArrowLeft') scene.draai(-30, 0); else if (k === 'ArrowRight') scene.draai(30, 0);
    else if (k === 'ArrowUp') scene.draai(0, -24); else if (k === 'ArrowDown') scene.draai(0, 24);
    else if (k === '+' || k === '=') scene.zoom(0.85); else if (k === '-' || k === '_') scene.zoom(1 / 0.85);
    else if (k === '0' || k === 'Home') scene.herstel();
    else return;
    e.preventDefault();
  });

  // -- the 3D scene, loaded when WebGL is there; it sleeps (frees the GPU) while hidden and wakes when shown again
  let thema = null; let media = null; let maak = null; let slaap = 0;
  const opMedia = () => scene?.kleur(themaKleuren());
  const fout = (tekst) => { scherm.replaceChildren(h('p.bw-laden', tekst)); delen.open = true; };
  function bouw() {
    if (scene || weg || !maak) return;
    scherm.querySelector('.bw-laden')?.remove();
    try {
      scene = maak(scherm, S.soort, model, { beweging, kleuren: themaKleuren(), opTik: wissel1 });
    } catch {
      fout('Het 3D-model kon niet starten. Hieronder staat wat erop zit.');
      maak = null;
      return;
    }
    el.zakgereedschap = scene;
    for (const id of open) scene.zet(id, true, true);
    scene.kies(null);
  }
  function rust() {
    if (!scene) return;
    scene.dispose(); scene = null; el.zakgereedschap = null;
  }
  open = beginStand(); maakChips();
  if (webgl) {
    scherm.append(h('p.bw-laden', 'Het model wordt geladen…'));
    import('./zakgereedschap3d.js').then((m) => {
      if (weg) return;
      maak = m.maakScene;
      bouw();
      thema = new MutationObserver(opMedia);
      thema.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      media = matchMedia('(prefers-color-scheme: dark)');
      media.addEventListener('change', opMedia);
    }).catch(() => { if (!weg) fout('Het 3D-model kon niet laden. Hieronder staat wat erop zit.'); });
  }
  const zicht = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) bouw(); }) : null;
  zicht?.observe(scherm);

  // -- clean up once the card is gone; sleep while hidden
  let gezien = false; const t0 = Date.now();
  setTimeout(() => { gezien ||= el.isConnected; }, 0);
  const verborgen = () => (el.checkVisibility ? !el.checkVisibility() : el.offsetParent === null);
  const wacht = setInterval(() => {
    if (el.isConnected) {
      gezien = true;
      slaap = verborgen() ? slaap + 1 : 0;
      if (slaap >= 2) rust();
      return;
    }
    if (!gezien && Date.now() - t0 < 10000) return;
    clearInterval(wacht); weg = true;
    thema?.disconnect(); media?.removeEventListener('change', opMedia); zicht?.disconnect();
    rust();
  }, 1000);

  return el;
}
