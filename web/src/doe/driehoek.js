// Why a triangle is strong: a square of four poles, lashed at the corners, falls over sideways when you push it -
// no pole gets longer or shorter. Put in a schoor and it makes two triangles, and the square stands.
import { h } from '../dom.js';
import { p, s } from './kompasdelen.js';
import './driehoek.css';

const [X0, X1, Y0, L] = [80, 240, 250, 160];      // the feet on the ground, and the length of the uprights

export default function driehoek() {
  let hoek = 0;                                     // how far the uprights lean, in degrees
  let schoor = false;

  const paal = (cls) => s('path', { class: `dh-paal ${cls}` });
  const [links, rechts, boven, schuin] = [paal('staand'), paal('staand'), paal('ligt'), paal('schoor')];
  const knopen = [0, 1, 2, 3].map(() => s('circle', { r: 7, class: 'dh-knoop' }));
  const greep = s('circle', { r: 20, class: 'dh-greep' });
  const svg = s('svg', { viewBox: '0 0 320 290', class: 'dh-svg', role: 'img', tabindex: '0',
    'aria-label': 'Een vierkant van vier palen. Sleep de rechterbovenhoek opzij, of gebruik de pijltjes.' },
    s('path', { d: 'M20 252 H300', class: 'dh-grond' }), schuin, links, rechts, boven, knopen, greep);

  const melding = h('p.dh-melding', { 'aria-live': 'polite' });
  const schoorKnop = h('button.knop.klein', { type: 'button', 'aria-pressed': 'false', onclick: () => zetSchoor(!schoor) }, 'Zet er een schoor in');

  function teken() {
    const dx = L * Math.sin((hoek * Math.PI) / 180); const dy = L * Math.cos((hoek * Math.PI) / 180);
    const tl = [X0 + dx, Y0 - dy]; const tr = [X1 + dx, Y0 - dy];
    const lijn = (el, [a, b], [c, d]) => el.setAttribute('d', `M${p(a)} ${p(b)}L${p(c)} ${p(d)}`);
    lijn(links, [X0, Y0], tl); lijn(rechts, [X1, Y0], tr); lijn(boven, tl, tr); lijn(schuin, [X0, Y0], tr);
    [[X0, Y0], [X1, Y0], tl, tr].forEach(([x, y], i) => { knopen[i].setAttribute('cx', p(x)); knopen[i].setAttribute('cy', p(y)); });
    greep.setAttribute('cx', p(tr[0])); greep.setAttribute('cy', p(tr[1]));
    schuin.style.display = schoor ? '' : 'none';
    melding.textContent = schoor
      ? 'Met de schoor zijn het twee driehoeken. Duwen helpt niet meer: dan zou een paal langer of korter moeten worden.'
      : Math.abs(hoek) > 3 ? `Het vierkant zakt ${Math.round(Math.abs(hoek))}° scheef, en geen paal is langer of korter geworden.`
        : 'Duw de bovenkant opzij: sleep de rechterbovenhoek.';
  }

  function zetHoek(g) {
    if (schoor) { svg.classList.remove('wiebel'); void svg.offsetWidth; svg.classList.add('wiebel'); return; }
    hoek = Math.max(-30, Math.min(30, g));
    teken();
  }
  function zetSchoor(aan) {
    schoor = aan;
    if (aan) hoek = 0;
    schoorKnop.setAttribute('aria-pressed', String(aan));
    schoorKnop.textContent = aan ? 'Haal de schoor weg' : 'Zet er een schoor in';
    teken();
  }

  let sleep = false;
  const naarSvg = (e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
  svg.addEventListener('pointerdown', (e) => { sleep = true; svg.setPointerCapture(e.pointerId); e.preventDefault(); });
  svg.addEventListener('pointermove', (e) => {
    if (!sleep) return;
    const { x } = naarSvg(e);
    zetHoek((Math.asin(Math.max(-1, Math.min(1, (x - X1) / L))) * 180) / Math.PI);
  });
  const los = () => { sleep = false; };
  svg.addEventListener('pointerup', los);
  svg.addEventListener('pointercancel', los);
  svg.addEventListener('keydown', (e) => {
    const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (d) { e.preventDefault(); zetHoek(hoek + d * 4); }
  });

  teken();
  return h('div.doe-driehoek', svg, h('div.dh-tekst', melding, h('div.knop-rij', schoorKnop)));
}
