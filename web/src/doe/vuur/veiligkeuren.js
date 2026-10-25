// Good, or reject? A rope, a pole, a shackle, a sling or a block, drawn as the drawings of sjorren draw them; you
// say whether you would build with it, and it says why. As in the bladen materiaalkeuring, hout-controleren,
// touw-controleren and blokken-onderhoud (sources there: SN-P25, SW Treksterkte, SW Katrol, SW-PAAL, SGV-GS).
import { h } from '../../dom.js';
import { actie, acties, zetActie } from '../knoppen.js';
import { eind, paal, touw } from '../../plaatjes/sjorren.js';
import '../vorm.css';
import './veilig.css';

const W = 260; const H = 120;
export const teken = (titel, inhoud) => `<svg class="plaatje vg-ding" viewBox="0 0 ${W} ${H}" role="img" aria-label="${titel}">${inhoud}</svg>`;

/** A straight rope across the picture, with a whipped end. */
const recht = (extra = '') => touw(`M20 ${H / 2}H228`, 18) + eind(234, H / 2, 0, 18) + extra;
/** A pole across the picture. */
const balk = (extra = '') => paal(16, H / 2, 244, H / 2, 40, { kop1: true, kop2: true }) + extra;
/** A D-shackle standing up, `krom` bent to one side. */
function sluiting(krom, stempel) {
  const d = krom ? 'M98 34V60Q98 98 130 100Q170 96 178 70L196 34' : 'M104 34V78a26 26 0 0 0 52 0V34';
  let uit = `<path d="${d}" fill="none" class="sj-metaal-lijn" stroke-width="12"/><path d="${d}" fill="none" style="stroke: var(--sj-metaal); stroke-width: 8"/>`;
  uit += krom ? '<rect x="88" y="22" width="118" height="14" rx="7" class="sj-metaal"/>' : '<rect x="92" y="22" width="76" height="14" rx="7" class="sj-metaal"/>';
  uit += '<circle cx="94" cy="29" r="9" class="sj-metaal"/>';
  if (stempel) uit += `<text x="132" y="33" class="tekst" font-size="9.5" font-weight="700" text-anchor="middle" style="fill: #1c1f21">${stempel}</text>`;
  return uit;
}
/** A lifting sling as a flat band, `snee` with a cut in it. */
function band(snee, label = true) {
  let uit = '<rect x="20" y="40" width="220" height="40" rx="20" fill="none" class="sj-band-rand" stroke-width="15"/>'
    + '<rect x="20" y="40" width="220" height="40" rx="20" fill="none" class="sj-band" stroke-width="12"/>';
  // the sewn-on label with the werklast: without it nobody knows what the band may carry
  if (label) uit += '<rect x="168" y="70" width="62" height="34" rx="3" style="fill: #e9eef4; stroke: #2f4d7a; stroke-width: 1.4"/>'
    + '<text x="199" y="84" text-anchor="middle" style="font-size: 10px; font-weight: 700; fill: #1c2a40">WLL</text>'
    + '<text x="199" y="97" text-anchor="middle" style="font-size: 10px; fill: #1c2a40">1000 kg</text>';
  if (snee) uit += '<path d="M112 30L126 46L132 40L146 30Z" class="vlak"/><path d="M112 32L126 46L132 40L146 32" fill="none" style="stroke: #1c1f21; stroke-width: 1.6"/>';
  return uit;
}
/** A block with a wooden sheave, `scheur` with a crack in it, with a tag with the werklast as the hijsband has. */
function blok(scheur) {
  let uit = '<path d="M130 22V8" class="sj-metaal-lijn" stroke-width="6"/>';
  uit += '<rect x="96" y="20" width="68" height="86" rx="32" class="sj-metaal"/><circle cx="130" cy="62" r="26" class="sj-hout-licht"/><circle cx="130" cy="62" r="4" class="sj-metaal-licht"/>';
  uit += '<path d="M164 62H176" style="stroke: #2f4d7a; stroke-width: 1.4"/><rect x="176" y="45" width="62" height="34" rx="3" style="fill: #e9eef4; stroke: #2f4d7a; stroke-width: 1.4"/>'
    + '<text x="207" y="59" text-anchor="middle" style="font-size: 10px; font-weight: 700; fill: #1c2a40">WLL</text>'
    + '<text x="207" y="72" text-anchor="middle" style="font-size: 10px; fill: #1c2a40">500 kg</text>';
  if (scheur) uit += '<path d="M134 36l-7 10 6 6 -8 10 4 6" style="fill: none; stroke: #2a1a0b; stroke-width: 2.6"/>';
  return uit;
}

// [drawing, what you take (the question names no defect: the drawing shows it), what it shows, good?, why]
export const DINGEN = [
  [() => recht(), 'een sjortouw', 'een sjortouw', true, 'Heel, droog, gelijkmatig, met een afgewerkt eind: daar kun je mee sjorren.'],
  [() => recht('<rect x="100" y="52" width="34" height="16" class="sj-touw-vul" style="opacity: 0.6"/><path d="M104 52q4 -16 -2 -28M110 52q8 -14 6 -26M118 52q10 -8 18 -20M126 52q14 -4 22 -12M106 68q-4 14 -14 20M114 68q2 16 -4 28M122 68q8 12 6 26M130 68q12 8 20 12" fill="none" style="stroke: var(--sj-touw); stroke-width: 2; stroke-linecap: round"/>'),
    'een sjortouw', 'een touw met een rafelige, doorgesleten plek', false, 'Op een doorgesleten plek breekt het touw het eerst. Afkeuren, en in korte stukken knippen als oefentouw, zodat het niet terug tussen het goede touw komt.'],
  [() => recht('<ellipse cx="86" cy="60" rx="16" ry="7" style="fill: #3d3a24; opacity: 0.75"/><ellipse cx="148" cy="59" rx="11" ry="6" style="fill: #3d3a24; opacity: 0.75"/><ellipse cx="178" cy="62" rx="7" ry="5" style="fill: #3d3a24; opacity: 0.6"/>'),
    'een sjortouw', 'een touw met donkere vlekken, dat muf ruikt', false, 'Donkere vlekken en een muffe geur wijzen op schimmel of rot: dat touw is vanbinnen zwak. Afkeuren.'],
  [() => balk(), 'een pionierpaal', 'een pionierpaal', true, 'Recht, rond, zonder scheuren of zachte plekken: goed.'],
  [() => balk('<path d="M80 41l12 7 -5 7 14 6 -7 6 12 7 -10 7 7 5 -14 -4 5 -7 -12 -6 6 -7 -13 -6z" class="sj-scheur"/>'),
    'een pionierpaal', 'een paal met een diepe scheur', false, 'Past er een vinger in de scheur, dan is de paal gevaarlijk. Afkeuren, en in stukken zagen, zodat hij niet terug in de stapel komt. Is het hout niet geïmpregneerd, dan mag het op het vuur.'],
  [() => balk('<ellipse cx="200" cy="62" rx="32" ry="14" class="sj-rot"/>'), 'een pionierpaal', 'een paal met een donkere, zachte plek', false, 'Zacht en donker, en hij klinkt dof als je erop klopt: rot. Afkeuren.'],
  [() => sluiting(false, 'WLL 1 t'), 'een sluiting', 'een sluiting met de werklast erop', true, 'Recht, de pen draait soepel, en de werklast (WLL) staat erop: goed.'],
  [() => sluiting(true, ''), 'een sluiting', 'een kromme sluiting', false, 'Een kromme beugel heeft al eens meer kracht gekregen dan hij aankan. Afkeuren, ook als hij nog dichtgaat.'],
  [() => band(false), 'een hijsband', 'een hijsband met een label', true, 'Heel, zonder sneden of rafels, en het label met de werklast (WLL) zit erop en is te lezen: goed.'],
  [() => band(false, false), 'een hijsband', 'een hijsband zonder label', false, 'Zonder label weet je niet hoeveel hij mag dragen, ook al is hij heel. De kleur alleen is niet genoeg. Afkeuren.'],
  [() => band(true), 'een hijsband', 'een hijsband met een snee', false, 'Een band met een snee of een gescheurde naad scheurt verder onder last. Afkeuren.'],
  [() => blok(false), 'een blok', 'een blok met een houten schijf', true, 'De schijf is heel en draait soepel, de haak is recht, en de werklast (WLL) staat erop: goed.'],
  [() => blok(true), 'een blok', 'een blok met een scheur in de schijf', false, 'Een gescheurde schijf kan onder last breken, en vreet je touw op. Afkeuren.'],
];
const RONDE = 8;
/** The list in random order (not the one of ./quiz.js: that would load all the drawings with it). */
const schud = (lijst) => {
  const l = [...lijst];
  for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
  return l;
};

export default function materiaalKeuren() {
  let ronde = []; let nr = 0; let goed = 0;

  const teller = h('p.vk-uitleg.vk-stand');
  const plek = h('div.vg-plaatje');
  const vraag = h('p.vk-vraag', { 'aria-live': 'polite' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const knopGoed = h('button.knop', { type: 'button', onclick: (e) => kies(true, e.currentTarget) }, 'Goed: bouwen');
  const knopAf = h('button.knop', { type: 'button', onclick: (e) => kies(false, e.currentTarget) }, 'Afkeuren');
  const keuzes = h('div.vg-keuzes', knopGoed, knopAf);
  const verder = actie('Volgende', 'verder', () => volgende(), { hoofd: true, klein: true, hidden: true });
  const el = h('div.doe-vk', teller, plek, vraag, keuzes, acties(verder), melding);

  function begin() {
    ronde = schud(DINGEN).slice(0, RONDE);
    nr = 0; goed = 0;
    keuzes.hidden = false;
    toon();
  }
  function toon() {
    const [tekenen, naam, wat] = ronde[nr];
    teller.textContent = `${nr + 1} van ${ronde.length}`;
    plek.innerHTML = teken(wat, tekenen());
    vraag.textContent = `Uit het materiaalhok pak je ${naam}. Bouw je ermee, of keur je het af?`;
    melding.textContent = ''; melding.classList.remove('fout');
    for (const k of [knopGoed, knopAf]) { k.disabled = false; k.classList.remove('goed', 'fout'); }
    verder.hidden = true;
  }
  function kies(zegtGoed, knop) {
    const [, , , isGoed, waarom] = ronde[nr];
    const juist = zegtGoed === isGoed;
    if (juist) goed++;
    for (const k of [knopGoed, knopAf]) k.disabled = true;
    (isGoed ? knopGoed : knopAf).classList.add('goed');
    if (!juist) knop.classList.add('fout');
    melding.classList.toggle('fout', !juist);
    melding.textContent = `${juist ? 'Goed!' : 'Niet goed.'} ${waarom}`;
    zetActie(verder, ...(nr + 1 < ronde.length ? ['Volgende', 'verder'] : ['Bekijk de uitslag', 'vink']));
    verder.hidden = false;
    verder.focus();
  }
  function volgende() {
    if (verder.textContent === 'Nog een keer') { begin(); return; }
    if (nr + 1 < ronde.length) { nr++; toon(); return; }
    teller.textContent = '';
    plek.innerHTML = '';
    keuzes.hidden = true;
    vraag.textContent = `${goed} van de ${ronde.length} goed.`;
    melding.classList.remove('fout');
    melding.textContent = goed === ronde.length ? 'Alles goed: jij mag de materiaalkeuring doen.' : 'Twijfel je bij het echte materiaal, dan keur je het af.';
    zetActie(verder, 'Nog een keer', 'opnieuw');
  }

  begin();
  return el;
}
