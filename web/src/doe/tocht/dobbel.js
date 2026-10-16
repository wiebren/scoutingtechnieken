// Dobbelsteentocht: throw the die at a crossing and read what to do, with the key of Jong Nederland (blad
// dobbelsteentocht). Not an exercise: a die to take along. The last throws stay in a short list.
import { h } from '../../dom.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './dobbel.css';

const BETEKENIS = ['rechtsaf', 'linksaf', 'rechtdoor', 'terug', 'doe een opdracht', 'jullie kiezen zelf'];
const OGEN = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };

export default function dobbelsteentocht() {
  const steen = s('svg', { viewBox: '0 0 100 100', class: 'db-steen', role: 'img', 'aria-label': 'Een dobbelsteen' });
  const uitslag = h('p.doe-melding', { 'aria-live': 'polite' }, 'Je staat op een kruispunt. Gooi de dobbelsteen.');
  const lijst = h('ol.db-lijst');
  const knop = h('button.knop.hoofd', { type: 'button', onclick: gooi }, 'Gooi');
  let timer = 0; let kruispunt = 0;

  function toon(n) {
    steen.replaceChildren(s('rect', { x: 6, y: 6, width: 88, height: 88, rx: 16, class: 'db-vlak' }),
      ...OGEN[n].map(([x, y]) => s('circle', { cx: 50 + x * 24, cy: 50 + y * 24, r: 8, class: 'db-oog' })));
    steen.setAttribute('aria-label', `Een dobbelsteen met ${n} ${n === 1 ? 'oog' : 'ogen'}`);
  }

  function gooi() {
    clearInterval(timer);
    const n = 1 + Math.floor(Math.random() * 6);
    const klaar = () => {
      toon(n);
      kruispunt += 1;
      uitslag.textContent = `${n}: ${BETEKENIS[n - 1]}.`;
      lijst.prepend(h('li', `Kruispunt ${kruispunt}: ${n}, ${BETEKENIS[n - 1]}`));
      while (lijst.children.length > 6) lijst.lastChild.remove();
      knop.disabled = false;
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { klaar(); return; }
    // a short tumble: a few random faces, then the throw
    knop.disabled = true; let keer = 0;
    timer = setInterval(() => {
      if (!steen.isConnected || ++keer > 6) { clearInterval(timer); if (steen.isConnected) klaar(); return; }
      toon(1 + Math.floor(Math.random() * 6));
    }, 70);
  }

  toon(6);
  const sleutel = h('ul.db-sleutel', BETEKENIS.map((t, i) => h('li', h('b', `${i + 1}`), ` ${t}`)));
  return h('div.doe-dobbel', h('div.db-boven', steen, h('div.db-rechts', knop, uitslag)), sleutel, lijst);
}
