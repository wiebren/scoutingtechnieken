// Chop a log through with a V. Choose how wide you make the V and at what angle the axe goes in, then chop, left and
// right in turn. Too flat and the axe glances off; too steep and it sticks and few chips come out. A V with sides at
// an angle θ to the log can only get as deep as half its width × tan θ: at 45° and a V as wide as the log is thick,
// that is halfway, and you turn the log over and chop a second V from the other side.
import { h } from '../../dom.js';
import { actie, acties } from '../knoppen.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './vuur.css';

const D = 60;                                   // thickness of the log in the drawing
const [X0, X1, CX, BOVEN] = [24, 296, 160, 96];
const rad = (g) => (g * Math.PI) / 180;

export default function vHakken() {
  let breed = 0.5; let hoek = 60;               // width as part of D, angle in degrees
  let diep = [0, 0]; let kant = 0; let vorige = null; let slagen = 0; let ketsen = 0; let door = false;

  const hout = s('path', { class: 'hout-vol' });
  const plan = s('g'); const flits = s('g');
  const svg = s('svg', { viewBox: '0 0 320 230', class: 'vk-svg', role: 'img' },
    s('rect', { x: 70, y: BOVEN + D, width: 180, height: 34, rx: 4, class: 'hout-vol', opacity: 0.55 }),
    s('text', { x: CX, y: BOVEN + D + 22, class: 'tekst stil', 'text-anchor': 'middle' }, 'hakblok'),
    hout, plan, flits);

  const schuifB = h('input.doe-schuif', { type: 'range', min: 30, max: 130, step: 5, value: breed * 100, 'aria-label': 'Breedte van de V, als deel van de dikte van het hout' });
  const schuifH = h('input.doe-schuif', { type: 'range', min: 15, max: 80, step: 5, value: hoek, 'aria-label': 'Hoek van je slag met het hout, in graden' });
  const bLabel = h('output'); const hLabel = h('output');
  const melding = h('div.vk-oordeel', { 'aria-live': 'polite' });
  const stand = h('p.vk-uitleg.vk-stand');
  const links = actie('Hak van links', null, () => hak('links'));
  const rechts = actie('Hak van rechts', null, () => hak('rechts'));
  const draai = actie('Draai het stammetje om', null, () => draaiOm(), { klein: true, hidden: true });
  const el = h('div.doe-vk.naast', svg,
    h('div.vk-tekst',
      h('label.doe-label', h('span', 'Breedte van de V: ', bLabel), schuifB),
      h('label.doe-label', h('span', 'Hoek van je slag: ', hLabel), schuifH),
      acties(links, rechts), h('div.knop-rij', draai, actie('Nieuw stammetje', 'opnieuw', () => reset(), { klein: true })),
      stand, melding));

  schuifB.addEventListener('input', () => { breed = Number(schuifB.value) / 100; teken(); });
  schuifH.addEventListener('input', () => { hoek = Number(schuifH.value); teken(); });

  const maxDiep = () => Math.min(D, ((breed * D) / 2) * Math.tan(rad(hoek)));
  const zeg = (t, soort = '') => { melding.className = `vk-oordeel ${soort}`; melding.textContent = t; };

  const half = (d) => Math.min((breed * D) / 2, d / Math.tan(rad(hoek)));

  function teken() {
    const [d0, d1] = diep; const [h0, h1] = [half(d0), half(d1)];
    const B = BOVEN + D;
    hout.setAttribute('d', door
      ? `M${X0} ${BOVEN}L${CX - 14} ${BOVEN}L${CX - 6} ${B}L${X0} ${B}ZM${CX + 14} ${BOVEN}L${X1} ${BOVEN}L${X1} ${B}L${CX + 6} ${B}Z`
      : `M${X0} ${BOVEN}${d0 ? `L${CX - h0} ${BOVEN}L${CX} ${BOVEN + d0}L${CX + h0} ${BOVEN}` : ''}L${X1} ${BOVEN}L${X1} ${B}`
        + `${d1 ? `L${CX + h1} ${B}L${CX} ${B - d1}L${CX - h1} ${B}` : ''}L${X0} ${B}Z`);
    const w = (breed * D) / 2;
    plan.replaceChildren(
      s('path', { d: `M${CX - w} ${BOVEN - 12}V${BOVEN - 2}M${CX + w} ${BOVEN - 12}V${BOVEN - 2}M${CX - w} ${BOVEN - 7}H${CX + w}`, class: 'lijn dun stil' }),
      s('path', { d: `M${X1 + 8} ${BOVEN}H${X1 + 16}M${X1 + 8} ${BOVEN + D}H${X1 + 16}M${X1 + 12} ${BOVEN}V${BOVEN + D}`, class: 'lijn dun stil' }),
      s('text', { x: CX, y: BOVEN - 16, class: 'tekst stil', 'text-anchor': 'middle' }, 'breedte V'),
      // the direction of your blow from the left, at the chosen angle
      s('path', { d: `M${CX - w - 46 * Math.cos(rad(hoek))} ${BOVEN - 46 * Math.sin(rad(hoek))}L${CX - w * 0.4} ${BOVEN}`, class: 'rood-lijn', 'stroke-dasharray': '5 4' }),
      s('text', { x: 40, y: 30, class: 'tekst stil' }, `${hoek}°`));
    bLabel.textContent = `${Math.round(breed * 100)}% van de dikte${Math.abs(breed - 1) < 0.01 ? ' (zo breed als het hout dik is)' : ''}`;
    hLabel.textContent = `${hoek}°`;
    const pct = Math.round(((diep[0] + diep[1]) / D) * 100);
    stand.textContent = door ? `Door, in ${slagen} slagen.` : `${slagen} slagen, ${Math.min(100, pct)}% door${diep[1] ? ' (twee kanten)' : ''}.${ketsen ? ` ${ketsen} keer afgeketst.` : ''}`;
    svg.setAttribute('aria-label', `Een stammetje op een hakblok, van opzij. ${stand.textContent}`);
    schuifB.disabled = slagen > 0; schuifH.disabled = slagen > 0;
  }

  function hak(zijde) {
    if (door) return;
    slagen++;
    flits.replaceChildren(s('path', { d: zijde === 'links' ? `M${CX - 40} ${BOVEN - 30}L${CX - 6} ${BOVEN + 4}` : `M${CX + 40} ${BOVEN - 30}L${CX + 6} ${BOVEN + 4}`, class: 'rood-lijn opstijgen' }));
    if (hoek < 30) { ketsen++; zeg('De bijl ketst af! Te plat: hij schampt over het hout en kan naar je been schieten. Hak steiler, rond de 45 graden.', 'fout'); teken(); return; }
    const max = maxDiep();
    const k = kant;
    if (diep[k] >= max - 0.01) {
      zeg(k === 0 && diep[0] < D ? 'De V is zo diep als hij met deze breedte kan. Draai het stammetje om en hak van de andere kant.' : 'Dieper gaat het niet: de V is te smal.', 'half');
      draai.hidden = k === 1; teken(); return;
    }
    let stap = hoek <= 55 ? 6 : 2.5;
    let tekst = hoek <= 55 ? 'Tjak! Er springt een spaander uit.' : 'De bijl blijft steken: te steil. Er komen bijna geen spaanders uit, en je moet hem lostrekken.';
    if (vorige === zijde) { stap /= 2; tekst = 'Wissel af: om en om van links en van rechts, anders wordt het geen V.'; }
    vorige = zijde;
    diep[k] = Math.min(max, diep[k] + stap);
    if (diep[0] + diep[1] >= D - 0.01) {
      door = true;
      zeg(`Door! In ${slagen} slagen${ketsen ? `, en ${ketsen} keer afgeketst` : ''}.${kant ? ' Met een V van twee kanten.' : ''}`, 'goed');
      draai.hidden = true; teken(); return;
    }
    if (diep[k] >= max - 0.01) {
      if (k === 0) { tekst += ' De V is nu zo diep als hij kan. Draai het stammetje om en hak van de andere kant.'; draai.hidden = false; }
      else tekst = 'De twee V\'s komen niet bij elkaar: ze zijn te smal. Begin opnieuw met een bredere V.';
      zeg(tekst, k === 1 ? 'fout' : 'half');
    } else zeg(tekst, tekst.startsWith('Wissel') ? 'half' : '');
    teken();
  }

  function draaiOm() { kant = 1; vorige = null; draai.hidden = true; zeg('Omgedraaid. Hak nu een V van de andere kant (die zie je onderaan).'); teken(); }

  function reset() {
    diep = [0, 0]; kant = 0; vorige = null; slagen = 0; ketsen = 0; door = false; draai.hidden = true;
    flits.replaceChildren();
    zeg('Kies de breedte van de V en de hoek van je slag. Hak dan om en om van links en van rechts.');
    teken();
  }

  reset();
  return el;
}
