// Windkracht to slide: 0 to 12, with the row of the KNMI table of the blad beaufort (read from the blad itself, so
// the two cannot differ) and a picture of what the wind does: smoke, a flag and a tree. The flag flutters and the
// streaks of wind move, faster the harder it blows; with reduced motion the picture stands still.
import { h } from '../dom.js';
import { BLAD } from '../data/bladen/index.js';
import './vorm.css';
import './beaufort.css';

const NS = 'http://www.w3.org/2000/svg';

function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...kids.flat());
  return el;
}

export default function beaufort() {
  const { rijen } = BLAD.beaufort.tabel;
  let kracht = 3;

  // -- the picture: the wind blows from left to right
  const rook = s('path', { class: 'bf-rook' });
  const vlag = s('g', { class: 'bf-vlag' }, s('path', { class: 'bf-doek', d: 'M0 0h46v28h-46z' }), s('path', { class: 'bf-doek-streep', d: 'M0 14h46' }));
  const kruin = s('g', { class: 'bf-kruin' },
    s('ellipse', { cx: 0, cy: -58, rx: 30, ry: 40, class: 'bf-blad' }),
    s('ellipse', { cx: -14, cy: -36, rx: 18, ry: 20, class: 'bf-blad' }),
    s('ellipse', { cx: 14, cy: -34, rx: 18, ry: 20, class: 'bf-blad' }));
  const stam = s('path', { class: 'bf-stam' });
  const strepen = s('g', { class: 'bf-strepen' },
    [[30, 40], [90, 70], [10, 100], [140, 30], [70, 120]].map(([x, y], i) => s('path', { d: `M${x} ${y}h34`, class: 'bf-streep', style: `--i: ${i}` })));
  const svg = s('svg', { viewBox: '0 0 360 200', class: 'bf-svg', 'aria-hidden': 'true' },
    s('rect', { x: 0, y: 0, width: 360, height: 200, class: 'bf-lucht' }),
    s('path', { d: 'M0 172H360V200H0z', class: 'bf-grond' }),
    strepen,
    // a campfire with its smoke
    s('path', { d: 'M38 172l14-10M66 172l-14-10', class: 'bf-hout' }), s('path', { d: 'M46 165q6-14 6-4q4-8 6 4z', class: 'bf-vuur' }), rook,
    // the flagpole
    s('path', { d: 'M160 172V52', class: 'bf-mast' }), s('g', { transform: 'translate(161 54)' }, vlag),
    // the tree
    s('g', { transform: 'translate(282 172)' }, stam, s('g', { class: 'bf-wieg' }, kruin)));

  // -- the words
  const getal = h('span.bf-getal');
  const naam = h('span.bf-naam');
  const kmu = h('span.bf-kmu');
  const ziet = h('p.bf-ziet');
  const schuif = h('input.doe-schuif', { type: 'range', min: 0, max: 12, step: 1, value: kracht, 'aria-label': 'Windkracht in Beaufort',
    oninput: () => { kracht = Number(schuif.value); teken(); } });
  const live = h('p.doe-sr', { 'aria-live': 'polite' });

  const el = h('div.doe-beaufort',
    h('div.bf-beeld', svg),
    h('div.bf-tekst',
      h('p.bf-kop', getal, h('span.bf-naamkm', naam, kmu)),
      ziet,
      h('div.bf-schuif', schuif, h('div.bf-schaal', { 'aria-hidden': 'true' }, rijen.map(([b]) => h('span', b)))),
      h('p.doe-stil', 'Uit de windschaal van het KNMI, hieronder.'),
      live));

  function teken() {
    const [b, n, km, wat] = rijen[kracht];
    getal.textContent = `${b} Bft`;
    naam.textContent = n;
    kmu.textContent = `${km} km/u`;
    ziet.textContent = wat.charAt(0).toUpperCase() + wat.slice(1) + '.';
    live.textContent = `Windkracht ${b}, ${n}, ${km} kilometer per uur: ${wat}.`;
    schuif.setAttribute('aria-valuetext', `${b}, ${n}`);

    const f = kracht / 12;
    // smoke: straight up at 0, lying down in a storm
    const buig = Math.min(1, kracht / 7);
    rook.setAttribute('d', `M52 160C${52 + buig * 20} ${130 + buig * 20} ${52 + buig * 70} ${110 + buig * 45} ${52 + buig * 130} ${70 + buig * 85}`);
    rook.style.opacity = String(1 - f * 0.6);
    // the flag: hangs along the pole at 0, straight out from 6 or so
    const hoek = 82 - Math.min(1, kracht / 6) * 82;
    vlag.setAttribute('transform', `rotate(${hoek.toFixed(1)})`);
    // the tree bends from the foot of its trunk; from 10 it is hard to stay standing
    const scheef = Math.min(32, kracht * 2.6);
    const top = 40 * Math.tan((scheef * Math.PI) / 180);
    kruin.setAttribute('transform', `skewX(${(-scheef).toFixed(1)})`);
    stam.setAttribute('d', `M-5 0Q-4 -20 ${(top - 4).toFixed(1)} -40L${(top + 4).toFixed(1)} -40Q4 -20 5 0z`);
    // how fast it moves: CSS reads these
    svg.style.setProperty('--bf-fladder', `${(1.4 - f * 1.15).toFixed(2)}s`);
    svg.style.setProperty('--bf-uitslag', `${(kracht ? 3 + f * 9 : 0).toFixed(1)}deg`);
    svg.style.setProperty('--bf-waai', `${(3.2 - f * 2.6).toFixed(2)}s`);
    svg.style.setProperty('--bf-strepen', String(kracht < 2 ? 0 : Math.min(1, 0.25 + f)));
  }

  teken();
  return el;
}
