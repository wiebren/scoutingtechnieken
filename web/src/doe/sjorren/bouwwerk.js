// A pioneering structure in 3D (opties.model: one of modellen.js MODELLEN). Turn it with a finger or the mouse,
// zoom with two fingers, the wheel, or + and −; the arrow keys turn it too. "Bouw het op" goes through the build
// order: the poles appear, then the lashings, then the tuien. Tap a lashing (or a tui, a peg) and it lights up with
// its name and a link to its blad; the chips light up every lashing of one kind. Without WebGL: the steps and the
// parts list, as text. The 3D part (three.js) is loaded only when WebGL works: scene3d.js. A model with a part that
// moves (model.beweging: an arm, a bridge deck) gets a slider for it, from the step where that part is built.
import { h } from '../../dom.js';
import { stappenBalk } from '../stappen.js';
import { keuze } from '../knoppen.js';
import { BLAD } from '../../data/bladen/index.js';
import { SOORTEN, onderdelen } from './modellen.js';
import { MODELLEN } from './modellen-alle.js';
import '../vorm.css';
import './bouwwerk.css';

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

const blad = (id) => (id && BLAD[id] ? BLAD[id] : null);
const bladLink = (id, tekst) => {
  const b = blad(id);
  return b ? h('a.chip.bw-link', { href: `#/zoeken?c=${b.categorie}&blad=${b.id}` }, tekst ?? `Lees verder: ${b.naam}`) : null;
};

export default function bouwwerk({ model: naam = 'driepoot', stil = false } = {}) {
  const maakModel = MODELLEN[naam] ?? MODELLEN.driepoot;
  // some structures come in variants (the tafel: on loose legs, on bokken, on driepoten); the steps follow the variant
  const varianten = maakModel.varianten ?? null;
  let variant = varianten?.[0][0];
  let model = maakModel(variant);
  let n = model.stappen.length;
  const beweging = !stil && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const webgl = heeftWebGL();
  let scene = null; let weg = false; let stap = n; let gekozen = -1; let soortAan = null;

  // -- the parts
  const label = h('div.bw-label', { hidden: true, 'aria-hidden': 'true' });
  const scherm = h('div.bw-scherm', {
    tabindex: webgl ? '0' : null, role: webgl ? 'group' : null,
    'aria-label': `${model.naam} in 3D. Pijltjes draaien het model, plus en min zoomen in en uit, 0 zet het terug.`,
  }, label);
  const zoomKnoppen = h('div.bw-hoek',
    h('button.bw-rond', { type: 'button', 'aria-label': 'Inzoomen', onclick: () => scene?.zoom(0.8) }, '+'),
    h('button.bw-rond', { type: 'button', 'aria-label': 'Uitzoomen', onclick: () => scene?.zoom(1.25) }, '−'),
    h('button.bw-rond', { type: 'button', 'aria-label': 'Terug naar het begin', title: 'Terug naar het begin', onclick: () => scene?.herstel() },
      h('span', { 'aria-hidden': 'true' }, '⟲')));
  const stapTekst = h('p.bw-stap', { 'aria-live': 'polite' });
  const info = h('div.bw-info', { 'aria-live': 'polite' });
  const legenda = h('div.chips.bw-legenda', { role: 'group', 'aria-label': 'Laat oplichten' });
  const lijst = h('ul.bw-delen', onderdelen(model).map((r) => h('li', r)));
  const keuzeRij = varianten ? h('div.bw-variant', h('span.bw-kop', maakModel.variantKop ?? 'Poten:'),
    h('div.chips', { role: 'group', 'aria-label': maakModel.variantLabel ?? 'Kies de poten' }, keuze(varianten, variant, (v) => wissel(v)))) : null;
  // the moving part: a slider from 0 to 100, shown from the step in which the part is there
  let beweegT = model.beweging?.start ?? 0;
  const schuif = h('input.doe-schuif', { type: 'range', min: '0', max: '100', step: '1',
    oninput: () => { beweegT = Number(schuif.value) / 100; zetSchuifTekst(); scene?.beweeg(beweegT); } });
  const schuifNaam = h('span');
  const beweegRij = h('label.doe-label.bw-beweeg', { hidden: true }, schuifNaam, schuif);
  function zetSchuifTekst() {
    const b = model.beweging; if (!b) return;
    schuif.setAttribute('aria-valuetext', b.waarde ? b.waarde(beweegT) : `${Math.round(beweegT * 100)} procent`);
  }
  function zetBeweging() {
    const b = model.beweging;
    beweegRij.hidden = !b || !webgl || stap < (b.vanaf ?? 1);
    if (!b) return;
    schuifNaam.textContent = b.label;
    if (stap < (b.vanaf ?? 1)) beweegT = b.start ?? 0;
    schuif.value = String(Math.round(beweegT * 100)); zetSchuifTekst();
    scene?.beweeg(beweegT);
  }
  const delen = h('details.bw-details', { open: !webgl }, h('summary', 'Wat heb je nodig?'), lijst);
  const maakBalk = () => stappenBalk({
    stappen: model.stappen.map((s) => s.naam), waarde: n - 1, label: `Bouwstappen, ${model.naam.toLowerCase()}`,
    zet: (w) => zetStap(Math.round(w) + 1, true),
  });
  let balk = maakBalk();
  const el = h('div.bw',
    webgl ? h('div.bw-beeld', scherm, zoomKnoppen) : h('p.bw-geen3d', 'Je browser kan hier geen 3D laten zien (WebGL staat uit of ontbreekt). Hieronder staan de bouwstappen en wat je nodig hebt.'),
    keuzeRij,
    h('div.bw-bouw', h('p.bw-kop', 'Bouw het op'), balk.el, stapTekst),
    beweegRij,
    webgl ? h('p.doe-stil.bw-hulp', 'Sleep om te draaien, knijp of scroll om te zoomen. Tik op een sjorring, tui of haring.') : null,
    webgl ? legenda : null,
    info,
    delen);

  // -- the step
  function zetStap(s, animeer = false) {
    stap = s;
    scene?.toonStap(s, { animeer });
    const st = model.stappen[s - 1];
    const telPalen = model.palen.filter((p) => p.stap <= s && !(p.tot && s >= p.tot)).length;
    const telSjor = model.sjor.filter((x) => x.stap <= s && !(x.tot && s >= x.tot)).length;
    const wat = [`${telPalen} ${telPalen === 1 ? 'paal' : 'palen'}`, telSjor ? `${telSjor} ${telSjor === 1 ? 'sjorring' : 'sjorringen'}` : null].filter(Boolean).join(' en ');
    stapTekst.replaceChildren(h('strong', `Stap ${s} van ${n}: ${st.naam}. `), st.tekst, h('span.doe-sr', ` Te zien: ${wat}.`));
    zetBeweging();
    if (scene && gekozen >= 0 && !zichtbaar(scene.delen[gekozen])) kies(-1);
    else if (soortAan) toonSoort(soortAan);
  }
  const zichtbaar = (d) => d.stap <= stap && !(d.tot && stap >= d.tot);

  // -- one part chosen (tapped), or all of a kind (chip)
  function kies(i) {
    gekozen = i; soortAan = null; zetChips();
    if (!scene) return;
    if (i < 0) { scene.markeer([], label); info.replaceChildren(); return; }
    const d = scene.delen[i]; const s = SOORTEN[d.soort] ?? SOORTEN.lijn;
    const titel = d.soort === 'brugtouw' ? (d.naam[0].toUpperCase() + d.naam.slice(1)) : s.naam;
    label.textContent = titel;
    scene.markeer([i], label);
    info.replaceChildren(
      h('p', h('strong', titel), d.naam && d.soort !== 'brugtouw' ? ` · ${d.naam}` : '', s.uitleg ? h('br') : null, s.uitleg),
      bladLink(s.blad));
  }
  function toonSoort(soort) {
    soortAan = soort; gekozen = -1; zetChips();
    if (!scene) return;
    if (!soort) { scene.markeer([], label); info.replaceChildren(); return; }
    const idx = scene.delen.map((d, i) => (d.soort === soort && zichtbaar(d) ? i : -1)).filter((i) => i >= 0);
    scene.markeer(idx, null); label.hidden = true;
    const s = SOORTEN[soort];
    const alle = scene.delen.filter((d) => d.soort === soort && !d.kopie).length;
    info.replaceChildren(
      h('p', h('strong', s.naam), ` · ${alle} in dit bouwwerk${idx.length < alle ? `, ${idx.length} nu te zien` : ''}`, h('br'), s.uitleg),
      bladLink(s.blad));
  }
  let chips = [];
  function maakLegenda() {
    const tel = new Map();
    for (const d of scene.delen) if (!d.kopie) tel.set(d.soort, (tel.get(d.soort) ?? 0) + 1);
    const volgorde = Object.keys(SOORTEN);
    chips = [...tel.keys()].sort((a, b) => volgorde.indexOf(a) - volgorde.indexOf(b)).map((soort) => {
      const s = SOORTEN[soort]; const k = tel.get(soort);
      const naamK = soort === 'brugtouw' ? 'Brugtouwen' : soort === 'anker' ? 'Ankerharingen' : s.naam;
      const c = h('button.chip', { type: 'button', 'aria-pressed': 'false', 'data-soort': soort,
        onclick: () => toonSoort(soortAan === soort ? null : soort) }, `${naamK} ×${k}`);
      return c;
    });
    legenda.replaceChildren(...chips);
  }
  function zetChips() { for (const c of chips) c.setAttribute('aria-pressed', String(c.dataset.soort === soortAan)); }

  // -- another variant: a new model, new steps, a new scene
  function wissel(v) {
    if (v === variant) return;
    variant = v; model = maakModel(v); n = model.stappen.length; stap = n; beweegT = model.beweging?.start ?? 0;
    const nieuw = maakBalk(); balk.el.replaceWith(nieuw.el); balk = nieuw;
    lijst.replaceChildren(...onderdelen(model).map((r) => h('li', r)));
    chips = []; legenda.replaceChildren();
    if (scene) { rust(); bouw(); } else zetStap(stap);
  }

  // -- keys on the picture
  scherm.addEventListener('keydown', (e) => {
    if (!scene || e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key;
    if (k === 'ArrowLeft') scene.draai(-30, 0); else if (k === 'ArrowRight') scene.draai(30, 0);
    else if (k === 'ArrowUp') scene.draai(0, -24); else if (k === 'ArrowDown') scene.draai(0, 24);
    else if (k === '+' || k === '=') scene.zoom(0.85); else if (k === '-' || k === '_') scene.zoom(1 / 0.85);
    else if (k === '0' || k === 'Home') scene.herstel();
    else if (k === 'Escape') kies(-1);
    else return;
    e.preventDefault();
  });

  // -- the 3D scene, loaded when WebGL is there. It also sleeps (frees the GPU) while the page it is on is hidden,
  // and wakes up when it is shown again.
  let thema = null; let media = null; let maak = null; let slaap = 0;
  const opMedia = () => scene?.kleur(themaKleuren());
  const fout = (tekst) => { scherm.replaceChildren(h('p.bw-laden', tekst)); delen.open = true; };
  function bouw() {
    if (scene || weg || !maak) return;
    scherm.querySelector('.bw-laden')?.remove();
    try {
      scene = maak(scherm, model, { beweging, kleuren: themaKleuren(), opKies: kies });
    } catch {
      fout('Het 3D-model kon niet starten. Hieronder staan de bouwstappen en wat je nodig hebt.');
      maak = null;
      return;
    }
    el.bouwwerk = scene;
    scene.kleur(themaKleuren());
    if (!chips.length) maakLegenda();
    gekozen = -1; soortAan = null; zetChips(); info.replaceChildren(); label.hidden = true;
    zetStap(stap);
  }
  function rust() {
    if (!scene) return;
    scene.dispose(); scene = null; el.bouwwerk = null;
  }
  if (webgl) {
    scherm.append(h('p.bw-laden', 'Het model wordt geladen…'));
    import('./scene3d.js').then((m) => {
      if (weg) return;
      maak = m.maakScene;
      bouw();
      // a theme switched while the piece is open: read the tokens again
      thema = new MutationObserver(opMedia);
      thema.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      media = matchMedia('(prefers-color-scheme: dark)');
      media.addEventListener('change', opMedia);
    }).catch(() => { if (!weg) fout('Het 3D-model kon niet laden. Hieronder staan de bouwstappen en wat je nodig hebt.'); });
  }
  zetStap(stap);
  // shown again (another page was open): build the scene again at once
  const zicht = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) bouw(); }) : null;
  zicht?.observe(scherm);

  // -- clean up once the card is gone (the card attaches the element as soon as it is made); sleep while hidden
  let gezien = false; const t0 = Date.now();
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
