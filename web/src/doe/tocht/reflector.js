// Reflectortocht at night: the screen is dark, your finger (or the mouse, or the arrow keys) is the torch. At each
// crossing one reflector hangs on a tree along the path you must take; it only shines when your light falls on it.
// Find it, then choose that path. Five crossings, then you are home.
import { h } from '../../dom.js';
import { pol, s } from '../kompasdelen.js';
import '../vorm.css';
import './reflector.css';

const B = 360; const H = 260; const C = [180, 150];      // the crossing
const LAMP = 46;                                         // radius of the torch light
const RICHTING = { links: 270, 'schuin links': 315, rechtdoor: 0, 'schuin rechts': 45, rechts: 90 };
const RONDES = 5;
const r1 = (n) => Math.round(n * 10) / 10;
let teller = 0;

/** A crossing: two or three paths besides the one you came on, one of them the right one. */
function maakKruispunt() {
  const sets = [['links', 'rechtdoor', 'rechts'], ['links', 'rechts'], ['schuin links', 'schuin rechts'], ['links', 'rechtdoor'], ['rechtdoor', 'rechts'], ['links', 'schuin rechts', 'rechts']];
  const paden = sets[Math.floor(Math.random() * sets.length)];
  const goed = paden[Math.floor(Math.random() * paden.length)];
  // trees along every path, two on either side; the reflector on one of the trees of the right path
  const bomen = [];
  for (const p of [...paden, 'terug']) {
    const g = p === 'terug' ? 180 : RICHTING[p];
    for (const [afstand, kant] of [[60, -1], [70, 1], [100, 1], [112, -1]]) {
      const [bx, by] = pol(C[0], C[1], afstand + Math.random() * 10, g);
      const [x, y] = pol(bx, by, 22 + Math.random() * 6, g + 90 * kant);
      if (x > 8 && x < B - 8 && y > 8 && y < H - 8) bomen.push({ x, y, pad: p });
    }
  }
  // a few trees in between the paths, so the dark is not empty
  for (let i = 0; i < 10; i++) bomen.push({ x: 15 + Math.random() * (B - 30), y: 15 + Math.random() * (H - 30), pad: null });
  const kandidaten = bomen.filter((b) => b.pad === goed);
  const reflector = kandidaten[Math.floor(Math.random() * kandidaten.length)];
  return { paden, goed, bomen: bomen.filter((b) => b.pad || Math.hypot(b.x - C[0], b.y - C[1]) > 40), reflector };
}

export default function reflectortocht() {
  const id = `rt-${++teller}`;
  let ronde = 0; let kp; let lamp = [C[0], C[1] + 70]; let gevonden = false; let fouten = 0; let klaar = false;

  const scene = s('g');
  const masker = s('mask', { id: `${id}-m` }, s('rect', { x: 0, y: 0, width: B, height: H, fill: '#fff' }));
  const gat = s('circle', { r: LAMP, fill: 'url(#' + id + '-g)' });
  masker.append(gat);
  const verloop = s('radialGradient', { id: `${id}-g` }, s('stop', { offset: '0.55', 'stop-color': '#000' }), s('stop', { offset: '1', 'stop-color': '#fff' }));
  const donker = s('rect', { x: 0, y: 0, width: B, height: H, class: 'rt-nacht', mask: `url(#${id}-m)` });
  const glans = s('g');                     // the reflector, on top of the dark when lit
  const svg = s('svg', { viewBox: `0 0 ${B} ${H}`, class: 'rt-svg', tabindex: '0', role: 'img' }, s('defs', {}, verloop, masker), scene, donker, glans);

  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const voortgang = h('p.doe-stil');
  const knoppen = h('div.knop-rij.rt-knoppen');
  const opnieuw = h('button.knop', { type: 'button', hidden: true, onclick: () => begin() }, 'Nog een keer');

  const el = h('div.doe-reflector',
    h('p.doe-stil', 'Het is donker. Beweeg je zaklamp over het bos (vinger, muis, of de pijltjes) en zoek de reflector. Hij hangt aan een boom langs het pad dat je moet nemen.'),
    svg, voortgang, knoppen, melding, opnieuw);

  function tekenScene() {
    scene.replaceChildren(s('rect', { x: 0, y: 0, width: B, height: H, class: 'rt-grond' }));
    const [ox, oy] = pol(C[0], C[1], 160, 180);
    scene.append(s('path', { d: `M${r1(ox)} ${r1(oy)}L${C[0]} ${C[1]}`, class: 'rt-pad' }));
    for (const p of kp.paden) { const [x, y] = pol(C[0], C[1], 220, RICHTING[p]); scene.append(s('path', { d: `M${C[0]} ${C[1]}L${r1(x)} ${r1(y)}`, class: 'rt-pad' })); }
    for (const b of kp.bomen) scene.append(s('circle', { cx: r1(b.x), cy: r1(b.y), r: 11, class: 'rt-boom' }), s('circle', { cx: r1(b.x), cy: r1(b.y), r: 3, class: 'rt-stam' }));
    scene.append(s('circle', { cx: C[0], cy: C[1] + 58, r: 6, class: 'rt-ik' }));
  }

  function tekenLamp() {
    gat.setAttribute('cx', r1(lamp[0])); gat.setAttribute('cy', r1(lamp[1]));
    const { reflector: rf } = kp;
    const verlicht = Math.hypot(rf.x - lamp[0], rf.y - lamp[1]) < LAMP * 0.8;
    glans.replaceChildren();
    if (verlicht || gevonden || klaar) glans.append(s('circle', { cx: r1(rf.x), cy: r1(rf.y), r: 9, class: 'rt-glans' }), s('circle', { cx: r1(rf.x), cy: r1(rf.y), r: 4.5, class: 'rt-reflector' }));
    if (verlicht && !gevonden) {
      gevonden = true;
      melding.classList.remove('fout');
      melding.textContent = 'Daar glimt iets! Welk pad is het?';
    }
  }

  function nieuweRonde() {
    kp = maakKruispunt(); gevonden = false; lamp = [C[0], C[1] + 70];
    tekenScene(); tekenLamp();
    voortgang.textContent = `Kruispunt ${ronde + 1} van ${RONDES}`;
    svg.setAttribute('aria-label', `Kruispunt ${ronde + 1}: in het donker gaan ${kp.paden.length} paden verder: ${kp.paden.join(', ')}. Zoek de reflector met de zaklamp.`);
    knoppen.replaceChildren(...kp.paden.map((p) => h('button.knop', { type: 'button', onclick: () => kies(p) }, p[0].toUpperCase() + p.slice(1))));
  }

  function kies(p) {
    if (klaar) return;
    if (p !== kp.goed) {
      fouten++;
      melding.classList.add('fout');
      melding.textContent = gevonden ? 'Kijk nog eens waar de reflector hangt: langs welk pad staat die boom?' : `Niet dit pad. Zoek eerst de reflector.`;
      return;
    }
    ronde++;
    if (ronde === RONDES) {
      klaar = true; tekenLamp();
      melding.classList.remove('fout');
      melding.textContent = fouten ? `Thuis! Met ${fouten} keer een verkeerd pad.` : 'Thuis, zonder één verkeerd pad!';
      knoppen.replaceChildren(); opnieuw.hidden = false; opnieuw.focus({ preventScroll: true });
      voortgang.textContent = `Alle ${RONDES} kruispunten gehad.`;
      return;
    }
    melding.classList.remove('fout');
    melding.textContent = `Goed, ${p}! Op naar het volgende kruispunt.`;
    nieuweRonde();
  }

  function begin() { ronde = 0; fouten = 0; klaar = false; opnieuw.hidden = true; melding.textContent = ''; nieuweRonde(); }

  const naar = (e) => {
    const r = svg.getBoundingClientRect();
    lamp = [((e.clientX - r.left) / r.width) * B, ((e.clientY - r.top) / r.height) * H];
    tekenLamp();
  };
  svg.addEventListener('pointerdown', (e) => { svg.setPointerCapture(e.pointerId); naar(e); });
  svg.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || e.buttons) naar(e); });
  svg.addEventListener('keydown', (e) => {
    const d = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[e.key];
    if (!d) return;
    e.preventDefault();
    lamp = [Math.max(0, Math.min(B, lamp[0] + d[0])), Math.max(0, Math.min(H, lamp[1] + d[1]))];
    const was = gevonden;
    tekenLamp();
    // with the keyboard you cannot see the picture well, so say which path the tree stands by
    if (!was && gevonden) melding.textContent = `Daar glimt iets, bij het pad ${kp.reflector.pad}.`;
  });

  begin();
  return el;
}
