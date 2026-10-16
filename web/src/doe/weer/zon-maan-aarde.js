// Zon, maan en aarde: the orbit of the moon seen from above, the sun far away on the right (as in the drawing
// maanfasen). A question asks for a situation: a solar eclipse, a lunar eclipse, spring tide, neap tide, or a phase.
// Tap (or choose with Tab and Enter) the place of the moon. Blad getijden and blad verduisteringen.
import { h } from '../../dom.js';
import { pol, s } from '../kompasdelen.js';
import '../vorm.css';
import './zon-maan-aarde.css';

const C = [160, 130]; const R = 92;
// the eight places, as in the drawing maanfasen: 0 = between earth and sun (right), then anticlockwise
const PLEKKEN = ['nieuwe maan', 'wassende sikkel', 'eerste kwartier', 'wassende maan', 'volle maan', 'afnemende maan', 'laatste kwartier', 'afnemende sikkel'];
const hoek = (i) => 90 - i * 45;                                  // degrees clockwise from up
const WAAR = ['rechts, tussen de aarde en de zon', 'rechtsboven', 'boven', 'linksboven', 'links, aan de andere kant van de aarde', 'linksonder', 'onder', 'rechtsonder'];

const VRAGEN = [
  { vraag: 'Waar staat de maan bij een zonsverduistering?', goed: [0],
    uitleg: 'Bij nieuwe maan staat de maan tussen de zon en de aarde. Staan ze precies op één lijn, dan valt de schaduw van de maan op de aarde.' },
  { vraag: 'Waar staat de maan bij een maansverduistering?', goed: [4],
    uitleg: 'Bij volle maan staat de aarde tussen de zon en de maan. Staan ze precies op één lijn, dan schuift de maan door de schaduw van de aarde.' },
  { vraag: 'Waar kan de maan staan bij springtij? (Er zijn twee goede plekken.)', goed: [0, 4],
    uitleg: 'Springtij komt bij nieuwe én bij volle maan: zon, maan en aarde op één lijn, zodat zon en maan samen trekken.' },
  { vraag: 'Waar kan de maan staan bij doodtij? (Er zijn twee goede plekken.)', goed: [2, 6],
    uitleg: 'Doodtij komt bij eerste en laatste kwartier: de maan staat haaks op de zon, zodat ze elkaar tegenwerken.' },
  { vraag: 'Waar staat de maan als je hem de hele nacht als volle maan ziet?', goed: [4],
    uitleg: 'Volle maan: de maan staat tegenover de zon, dus je kijkt tegen de hele verlichte kant aan.' },
  { vraag: 'Waar staat de maan bij eerste kwartier?', goed: [2],
    uitleg: 'Eerste kwartier: de maan heeft een kwart van zijn rondje gedaan, tegen de klok in vanaf nieuwe maan.' },
  { vraag: 'Waar staat de maan bij laatste kwartier?', goed: [6],
    uitleg: 'Laatste kwartier: nog een kwart rondje te gaan tot de volgende nieuwe maan.' },
];

export default function zonMaanAarde() {
  let volgorde = []; let nu = null; let gedaan = 0; let goedTeller = 0; let klaar = false;

  const svg = s('svg', { viewBox: '0 0 320 260', class: 'zma-svg', role: 'group', 'aria-label': 'De baan van de maan om de aarde, van bovenaf. De zon staat ver weg rechts.' });
  for (const y of [40, 80, 180, 220]) svg.append(s('path', { d: `M314 ${y}H290M298 ${y - 5}L288 ${y}L298 ${y + 5}`, class: 'zma-zonlicht' }));
  svg.append(s('text', { x: 300, y: 126, class: 'zma-klein', 'text-anchor': 'middle' }, 'naar'), s('text', { x: 300, y: 139, class: 'zma-klein', 'text-anchor': 'middle' }, 'de zon'));
  svg.append(s('circle', { cx: C[0], cy: C[1], r: R, class: 'zma-baan' }));
  svg.append(s('circle', { cx: C[0], cy: C[1], r: 20, class: 'zma-aarde' }), s('path', { d: `M${C[0]} ${C[1] - 20}a20 20 0 0 0 0 40Z`, class: 'zma-nacht' }));
  svg.append(s('text', { x: C[0], y: C[1] + 36, class: 'zma-klein', 'text-anchor': 'middle' }, 'aarde'));
  svg.append(s('path', { d: `M${C[0] + 34} ${C[1] - 46}A57 57 0 0 0 ${C[0] - 34} ${C[1] - 46}`, class: 'zma-pijl' }),
    s('path', { d: `M${C[0] - 26} ${C[1] - 54}L${C[0] - 35} ${C[1] - 46}L${C[0] - 24} ${C[1] - 41}`, class: 'zma-pijl' }));

  const manen = PLEKKEN.map((naam, i) => {
    const [x, y] = pol(C[0], C[1], R, hoek(i));
    const g = s('g', { class: 'zma-plek', tabindex: '0', role: 'button', 'aria-label': `De maan ${WAAR[i]}` },
      s('circle', { cx: x, cy: y, r: 18, class: 'zma-raak' }),
      s('circle', { cx: x, cy: y, r: 11, class: 'zma-maan-donker' }),
      s('path', { d: `M${x} ${y - 11}a11 11 0 0 1 0 22Z`, class: 'zma-maan' }));
    g.addEventListener('click', () => kies(i));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); kies(i); } });
    svg.append(g);
    return g;
  });

  const vraag = h('p.zma-vraag');
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const stand = h('p.doe-stil');
  const verder = h('button.knop.klein', { type: 'button', hidden: true, onclick: volgende }, 'Volgende vraag');

  function volgende() {
    if (!volgorde.length) volgorde = [...VRAGEN].sort(() => Math.random() - 0.5);
    nu = volgorde.pop(); klaar = false;
    vraag.textContent = nu.vraag; melding.textContent = ''; melding.classList.remove('fout');
    manen.forEach((m) => m.classList.remove('goed', 'fout'));
    verder.hidden = true;
  }

  function kies(i) {
    if (!nu || klaar) return;
    const raak = nu.goed.includes(i);
    manen[i].classList.add(raak ? 'goed' : 'fout');
    if (raak) {
      klaar = true; gedaan += 1; if (!manen.some((m) => m.classList.contains('fout'))) goedTeller += 1;
      nu.goed.forEach((j) => manen[j].classList.add('goed'));
      melding.classList.remove('fout');
      melding.textContent = `Goed: ${PLEKKEN[i]}. ${nu.uitleg}`;
      stand.textContent = `In één keer goed: ${goedTeller} van ${gedaan}.`;
      verder.hidden = false;
    } else {
      melding.classList.add('fout');
      melding.textContent = `Nee, daar is het ${PLEKKEN[i]}. Probeer het nog eens.`;
    }
  }

  volgende();
  stand.textContent = 'Tik de plek van de maan aan.';
  return h('div.doe-zma', vraag, h('div.zma-beeld', svg), melding, h('div.knop-rij', verder), stand);
}
