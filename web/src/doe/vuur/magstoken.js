// May I light a fire today? A few questions - the natuurbrandrisico, what you want to do, permission from the
// municipality and the owner, the wind, the fireplace - and the answer with its reasons. In Dutch rules as in the
// Scouting Nederland infobladen (2026) and brandweer.nl. Netherlands only.
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import '../vorm.css';
import './vuur.css';

const VRAGEN = [
  ['fase', 'Natuurbrandrisico vandaag (brandweer.nl)', [['1', 'fase 1'], ['2', 'fase 2'], ['?', 'weet ik niet']]],
  ['wat', 'Wat wil je stoken?', [['kampvuur', 'een kampvuur'], ['koken', 'een vuurtje om te koken']]],
  ['gemeente', 'Ontheffing van de gemeente?', [['ja', 'ja'], ['nee', 'nee'], ['?', 'weet ik niet']]],
  ['eigenaar', 'Mag het van de eigenaar van het terrein?', [['ja', 'ja'], ['nee', 'nee'], ['?', 'niet gevraagd']]],
  ['wind', 'Windkracht', [['laag', '0 tot 4'], ['hoog', '5 of meer']]],
  ['plek', 'Stookplek op zand of in een stookton, niets brandbaars eromheen?', [['ja', 'ja'], ['nee', 'nee']]],
  ['blus', 'Blusmiddelen klaar (water, zand, branddeken)?', [['ja', 'ja'], ['nee', 'nee']]],
  ['leiding', 'Leiding erbij die toezicht houdt?', [['ja', 'ja'], ['nee', 'nee']]],
];

/** The verdict: { soort, kop, redenen[] }. */
export function oordeel(a) {
  const nee = []; const let_op = [];
  if (a.fase === '2') nee.push('Fase 2: je mag hoogstwaarschijnlijk niet stoken, ook niet met een ontheffing.');
  if (a.fase === '?') nee.push('Kijk eerst op brandweer.nl welke fase er vandaag in jouw regio geldt.');
  if (a.wat === 'kampvuur' && a.gemeente !== 'ja') nee.push('Voor een kampvuur heb je meestal een ontheffing van de gemeente nodig.');
  if (a.wat === 'koken' && a.gemeente !== 'ja') let_op.push('Een vuurtje om te koken en te bakken mag vaak zonder ontheffing, maar niet overal: kijk in de APV van de gemeente.');
  if (a.eigenaar !== 'ja') nee.push(a.eigenaar === 'nee' ? 'De eigenaar wil het niet: dan stook je niet.' : 'Vraag het eerst aan de eigenaar of beheerder van het terrein.');
  if (a.wind === 'hoog') nee.push('Windkracht 5 of meer: niet stoken. De rook slaat neer en vonken vliegen ver.');
  if (a.plek === 'nee') nee.push('Maak eerst een veilige stookplek: op zand of in een stookton, zonder overhangende takken of iets brandbaars in de buurt.');
  if (a.blus === 'nee') nee.push('Zet eerst blusmiddelen klaar, en water om brandwonden te koelen.');
  if (a.leiding === 'nee') nee.push('Stook alleen met leiding erbij, en laat het vuur nooit alleen.');
  let_op.push('Alleen schoon, droog hout. Afval en bewerkt hout verbranden is verboden.');
  if (nee.length) return { soort: 'fout', kop: 'Nu niet stoken.', redenen: [...nee, ...let_op.slice(0, 1)] };
  if (let_op.length > 1) return { soort: 'half', kop: 'Waarschijnlijk wel, maar check het.', redenen: let_op };
  return { soort: 'goed', kop: 'Je mag stoken.', redenen: ['Houd het vuur klein, blijf erbij, en maak het na afloop helemaal uit.', ...let_op] };
}

export default function magIkStoken() {
  const antwoord = {};
  const vragenVak = h('div.vk-tekst', VRAGEN.map(([id, vraag, opties]) =>
    h('div.vk-rij', { role: 'group', 'aria-label': vraag }, h('p.vk-kop', vraag),
      keuze(opties, antwoord[id], (w) => { antwoord[id] = w; reken(); }))));
  const uitslag = h('div.vk-oordeel', { 'aria-live': 'polite' });
  const el = h('div.doe-vk', vragenVak, uitslag);

  function reken() {
    const open = VRAGEN.filter(([id]) => !antwoord[id]).length;
    if (open) {
      uitslag.className = 'vk-oordeel';
      uitslag.textContent = `Beantwoord nog ${open} ${open === 1 ? 'vraag' : 'vragen'}.`;
      return;
    }
    const o = oordeel(antwoord);
    uitslag.className = `vk-oordeel ${o.soort}`;
    uitslag.replaceChildren(h('strong', o.kop), h('ul', o.redenen.map((r) => h('li', r))));
  }

  reken();
  return el;
}
