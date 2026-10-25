// Build a fire and light it. Lay tinder, kindling and firewood from the inside out, choose where the opening is,
// how loosely you stack and how dry the wood is; then strike the match. The fire tells you why it does not burn:
// each layer has to light the next one, it needs air, dry wood, and a way in for the match on the windward side.
import { h } from '../../dom.js';
import { actie, acties, keuze } from '../knoppen.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './vuur.css';

const [CX, VOET] = [160, 196];
const MAAT = [{ b: 24, top: 166 }, { b: 44, top: 134 }, { b: 66, top: 98 }, { b: 88, top: 62 }];
const NAAM = { tondel: 'tondel', aanmaak: 'aanmaakhout', brand: 'brandhout' };

function vlam(cx, voet, hoogte, breed, klasse = '') {
  const b = breed / 2; const hh = hoogte;
  return s('g', { class: klasse },
    s('path', { class: 'vlam', d: `M${cx} ${voet - hh}C${cx - b * 0.9} ${voet - hh * 0.55} ${cx - b * 1.15} ${voet - hh * 0.25} ${cx - b * 0.75} ${voet - hh * 0.06}C${cx - b * 0.45} ${voet + 2} ${cx + b * 0.45} ${voet + 2} ${cx + b * 0.75} ${voet - hh * 0.06}C${cx + b * 1.15} ${voet - hh * 0.25} ${cx + b * 0.9} ${voet - hh * 0.55} ${cx} ${voet - hh}Z` }),
    s('path', { class: 'vlam-binnen', d: `M${cx} ${voet - hh * 0.55}C${cx - b * 0.5} ${voet - hh * 0.3} ${cx - b * 0.55} ${voet - hh * 0.1} ${cx} ${voet - 1}C${cx + b * 0.55} ${voet - hh * 0.1} ${cx + b * 0.5} ${voet - hh * 0.3} ${cx} ${voet - hh * 0.55}Z` }));
}

/** What happens when you light it: { soort: 'goed' | 'half' | 'fout', kop, tekst, brandt: how many layers burn }. */
export function beoordeel({ lagen, opening, stapel, hout }) {
  const l = lagen.filter((x, i) => x !== lagen[i - 1]);           // two of the same in a row count as one layer
  if (!l.length) return { soort: 'fout', kop: 'Er ligt nog niets.', tekst: 'Leg eerst iets neer om aan te steken.', brandt: 0 };
  if (opening === 'geen' && l.length > 1) {
    return { soort: 'fout', kop: 'Je komt er niet bij.', tekst: 'Alles zit dicht: met de lucifer kom je niet bij wat binnenin ligt. Laat een opening, aan de kant waar de wind vandaan komt.', brandt: 0 };
  }
  if (l[0] !== 'tondel') {
    return l.includes('tondel')
      ? { soort: 'fout', kop: 'De tondel ligt niet in het midden.', tekst: 'Een vlam gaat omhoog, niet naar binnen. Tondel aan de buitenkant brandt op zonder het hout binnenin heet te maken. Begin met een bedje tondel in het midden.', brandt: 0 }
      : { soort: 'fout', kop: 'De lucifer brandt op.', tekst: `${l[0] === 'aanmaak' ? 'Zelfs dunne takjes vatten' : 'Dik hout vat'} geen vlam van zo'n klein vlammetje. Begin met tondel: iets dat van een lucifer meteen vlam vat.`, brandt: 0 };
  }
  if (opening === 'lij' && l.length > 1) {
    return { soort: 'fout', kop: 'De wind blaast de vlam weg.', tekst: 'De opening zit aan de kant waar de wind naartoe gaat. De wind blaast het vlammetje van het hout af, naar buiten. Zet de opening aan de windkant: dan blaast de wind de vlam het vuur in.', brandt: 1 };
  }
  if (l.length === 1) return { soort: 'half', kop: 'De tondel brandt even…', tekst: 'en dan is hij op. Tondel brandt kort. Zet er een tentje van aanmaakhout omheen, dan steekt de tondel dat aan.', brandt: 1 };
  if (l[1] === 'brand') {
    return { soort: 'fout', kop: 'Het dikke hout wil niet.', tekst: 'De tondel brandt tegen het brandhout op, maar dik hout wordt daar niet heet genoeg van. Eerst dun aanmaakhout om de tondel, dan pas dikker hout.', brandt: 1 };
  }
  if (hout === 'nat') {
    return { soort: 'fout', kop: 'Het rookt en sist.', tekst: 'De warmte gaat op aan het water in het hout. Daardoor wordt het hout niet heet genoeg om te branden. Zoek droog hout: het is licht, en een takje breekt met een knap.', brandt: 1, rook: true };
  }
  if (stapel === 'strak') {
    return { soort: 'fout', kop: 'Het smeult en rookt.', tekst: 'Het vlamt even op, maar er kan geen lucht tussen het hout: zonder zuurstof stikt het vuur. Stapel het hout losser.', brandt: 1, rook: true };
  }
  if (l.length === 2) return { soort: 'half', kop: 'Het brandt!', tekst: 'Maar aanmaakhout is snel op. Zet er op tijd brandhout omheen, anders is je vuur over een paar minuten uit.', brandt: 2 };
  if (l[2] === 'tondel') return { soort: 'half', kop: 'Het aanmaakhout brandt…', tekst: 'maar de tondel daaromheen brandt meteen op, zonder het hout erbuiten aan te steken. Leg het brandhout direct om het aanmaakhout.', brandt: 2 };
  return { soort: 'goed', kop: 'Het brandt!', tekst: 'De tondel stak het aanmaakhout aan, en het aanmaakhout het brandhout. Van klein naar groot, met lucht ertussen en de opening aan de windkant.', brandt: 3 };
}

export default function vuurBouwen() {
  const staat = { lagen: [], opening: 'geen', stapel: 'los', hout: 'droog' };
  let uitslag = null;

  const lagenG = s('g'); const vuurG = s('g');
  const svg = s('svg', { viewBox: '0 40 320 190', class: 'vk-svg', role: 'img' },
    s('rect', { x: 0, y: VOET, width: 320, height: 34, class: 'grond' }), s('path', { d: `M0 ${VOET}H320`, class: 'grondlijn' }),
    s('path', { d: 'M14 150H54', class: 'pijl' }), s('path', { d: 'M62 150l-10 -5v10z', class: 'pijl-kop' }),
    s('text', { x: 14, y: 140, class: 'tekst stil' }, 'wind'),
    lagenG, vuurG);

  const opbouw = h('span', { 'aria-live': 'polite' });
  const oordeel = h('div.vk-oordeel', { hidden: true, 'aria-live': 'polite' });
  const leg = (t, wat) => h('button.knop.klein', { type: 'button', onclick: () => { if (staat.lagen.length < 4) { staat.lagen.push(wat); wijzig(); } } }, t);
  const legKnoppen = [leg('+ Tondel', 'tondel'), leg('+ Aanmaakhout', 'aanmaak'), leg('+ Brandhout', 'brand')];
  const weg = actie('Haal laatste weg', 'terug', () => { staat.lagen.pop(); wijzig(); }, { klein: true });
  const aan = actie('Steek aan', 'vuur', () => steekAan(), { hoofd: true });
  const zet = (veld) => (w) => { staat[veld] = w; wijzig(); };
  const veld = (kop, knoppen) => h('div.vk-veld', { role: 'group', 'aria-label': kop }, h('p.vk-kop', kop), h('div', knoppen));

  // The drawing on top, with what lies on the fire under it; the choices below, one row each.
  const el = h('div.doe-vk.vk-bouw',
    h('p.vk-vraag', 'Bouw van binnen naar buiten, en steek dan aan.'),
    h('figure.vk-beeld', svg, h('figcaption.vk-uitleg', opbouw, weg)),
    h('div.vk-velden',
      veld('Leg erbij', legKnoppen),
      veld('Opening', keuze([['wind', 'aan de windkant'], ['lij', 'aan de andere kant'], ['geen', 'geen']], staat.opening, zet('opening'))),
      veld('Stapelen', keuze([['los', 'los'], ['strak', 'strak op elkaar']], staat.stapel, zet('stapel'))),
      veld('Het hout is', keuze([['droog', 'droog'], ['nat', 'nat']], staat.hout, zet('hout')))),
    acties(aan),
    oordeel);

  function teken() {
    lagenG.replaceChildren();
    staat.lagen.forEach((wat, i) => {
      const { b, top } = MAAT[i];
      if (wat === 'tondel' && i === 0) {
        lagenG.append(s('path', { class: 'tondel-vol', d: `M${CX - 20} ${VOET}Q${CX - 10} ${VOET - 18} ${CX} ${VOET - 14}Q${CX + 10} ${VOET - 22} ${CX + 20} ${VOET}Z` }));
        return;
      }
      const n = (wat === 'brand' ? 5 : 7) + (staat.stapel === 'strak' ? (wat === 'brand' ? 6 : 8) : 0) + i;
      for (let k = 0; k < n; k++) {
        const x = CX - b + (2 * b * k) / (n - 1);
        const rel = (x - CX) / b;                                    // -1 left .. 1 right
        if (staat.opening === 'wind' && rel > -0.75 && rel < -0.12) continue;
        if (staat.opening === 'lij' && rel > 0.12 && rel < 0.75) continue;
        const d = `M${x.toFixed(1)} ${VOET}L${(CX + (x - CX) * 0.1).toFixed(1)} ${top}`;
        if (wat === 'brand') lagenG.append(s('path', { d, class: 'hout-rand', 'stroke-width': 8.6 }), s('path', { d, class: 'hout', 'stroke-width': 6.2, style: staat.hout === 'nat' ? 'stroke: #5b4a38' : '' }));
        else if (wat === 'aanmaak') lagenG.append(s('path', { d, class: 'hout', 'stroke-width': 2.8, style: staat.hout === 'nat' ? 'stroke: #5b4a38' : '' }));
        else lagenG.append(s('path', { d, class: 'tondel', 'stroke-width': 3.4 }));
      }
    });
    if (staat.hout === 'nat' && staat.lagen.some((x) => x !== 'tondel')) {
      for (const [x, y] of [[CX - 40, 150], [CX + 30, 128], [CX + 52, 170]]) lagenG.append(s('path', { d: `M${x} ${y}q-4 6 0 8q4 -2 0 -8z`, class: 'water' }));
    }
  }

  function tekenVuur() {
    vuurG.replaceChildren();
    if (!uitslag) return;
    const { brandt, rook, soort } = uitslag;
    if (rook || soort === 'fout') {
      for (const [x, d] of [[CX - 8, 0], [CX + 6, 0.4], [CX - 2, 0.8]]) {
        vuurG.append(s('path', { d: `M${x} ${VOET - 30}c-8 -12 8 -20 0 -34c-6 -10 6 -18 0 -28`, class: 'rook opstijgen', style: `animation-delay: ${d}s; animation-iteration-count: infinite` }));
      }
    }
    if (brandt >= 1) vuurG.append(vlam(CX, VOET - 1, soort === 'fout' && !rook ? 14 : 22, 18, 'flakker'));
    if (brandt >= 2) vuurG.append(s('g', { class: 'groei', style: 'animation-delay: .5s' }, vlam(CX, VOET - 1, 70, 52, 'flakker')));
    if (brandt >= 3) vuurG.append(s('g', { class: 'groei', style: 'animation-delay: 1.2s', opacity: 0.85 }, vlam(CX, VOET - 1, 130, 96, 'flakker')));
  }

  function wijzig() {
    uitslag = null;
    oordeel.hidden = true;
    for (const k of legKnoppen) k.disabled = staat.lagen.length >= 4;
    weg.disabled = !staat.lagen.length;
    const opening = { wind: 'een opening aan de windkant', lij: 'een opening aan de kant waar de wind naartoe gaat', geen: 'geen opening' }[staat.opening];
    // Under the drawing only the layers: the choices below already show the rest.
    opbouw.textContent = staat.lagen.length ? `Van binnen naar buiten: ${staat.lagen.map((x) => NAAM[x]).join(', ')}.` : 'Er ligt nog niets.';
    svg.setAttribute('aria-label', `Je vuur van opzij. ${opbouw.textContent} ${staat.stapel === 'los' ? 'Los' : 'Strak'} gestapeld, ${staat.hout} hout, ${opening}. De wind komt van links.`);
    teken(); tekenVuur();
  }

  function steekAan() {
    uitslag = beoordeel(staat);
    oordeel.className = `vk-oordeel ${uitslag.soort}`;
    oordeel.replaceChildren(h('strong', uitslag.kop), uitslag.tekst);
    oordeel.hidden = false;
    tekenVuur();
  }

  wijzig();
  return el;
}
