// Waar schuil je bij onweer? A landscape on a hike with places to go when it thunders. Tap one (or choose it from
// the list) and hear whether it is safe, after the KNMI and the KMI (blad onweer-schuilplek). Find all the safe ones.
import { h } from '../../dom.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './onweer-plek.css';

// x, y: where the place is in the picture; veilig: true, false, or 'nood' (only if there is nothing better)
const PLEKKEN = [
  { id: 'huis', naam: 'Het boerderijtje', x: 52, y: 128, veilig: true, waarom: 'Een gebouw is de veiligste plek. Blijf weg van de ramen.' },
  { id: 'auto', naam: 'De auto van de leiding', x: 120, y: 166, veilig: true, waarom: 'Een auto met een metalen dak is veilig: de bliksem gaat over de buitenkant. Ramen en deuren dicht.' },
  { id: 'boom', naam: 'Onder de losse boom', x: 196, y: 112, veilig: false, waarom: 'Nooit onder een losse boom: de bliksem slaat juist in hoge, losse dingen in.' },
  { id: 'tent', naam: 'In de tent', x: 262, y: 160, veilig: false, waarom: 'Een tent beschermt niet tegen bliksem, en de stokken kunnen van metaal zijn.' },
  { id: 'veld', naam: 'Midden op het open veld', x: 230, y: 186, veilig: false, waarom: 'Op een open vlakte ben jij het hoogste punt. Blijf uit open velden.' },
  { id: 'meer', naam: 'In het bootje op het meer', x: 318, y: 196, veilig: false, waarom: 'Open water is gevaarlijk bij onweer: ga zo snel mogelijk het water uit.' },
  { id: 'hokje', naam: 'In het bushokje', x: 92, y: 192, veilig: false, waarom: 'Een bushokje of open schuilplaats beschermt niet.' },
  { id: 'hek', naam: 'Tegen het hek', x: 160, y: 196, veilig: false, waarom: 'Blijf minstens 3 meter van hekken en draden, ook als ze niet van metaal zijn.' },
  { id: 'heuvel', naam: 'Op de heuveltop bij de uitkijktoren', x: 300, y: 70, veilig: false, waarom: 'Heuveltoppen, torens en uitkijkpunten trekken de bliksem aan.' },
  { id: 'laagte', naam: 'Gehurkt in de laagte tussen lage bomen', x: 30, y: 196, veilig: 'nood', waarom: 'Niet veilig, maar beter dan open veld als je nergens naar binnen kunt: een groepje lage bomen in het laagste deel van het terrein. Hurk, voeten tegen elkaar, hoofd laag; nooit plat liggen.' },
];

export default function onweerPlek() {
  const gekozen = new Set();
  const plaatje = s('svg', { viewBox: '0 0 360 220', class: 'op-svg', role: 'img', 'aria-label': 'Een landschap bij onweer met plekken om te schuilen: een boerderijtje, een auto, een losse boom, een tent, een open veld, een meer met een bootje, een bushokje, een hek, een heuveltop met een uitkijktoren en een laagte met lage bomen.' });
  plaatje.innerHTML = `
    <rect width="360" height="220" rx="12" class="op-lucht"/>
    <path d="M40 30 q20 -22 46 -8 q16 -18 40 -4 q26 -6 30 16 q-60 10 -116 -4z" class="op-wolk"/>
    <path d="M110 30 l-10 18 h8 l-10 20 l22 -26 h-9 l9 -12z" class="op-flits"/>
    <path d="M220 110 Q270 40 330 60 Q350 70 360 80 V220 H200Z" class="op-heuvel"/>
    <path d="M0 150 Q90 136 180 152 T360 160 V220 H0Z" class="op-gras"/>
    <path d="M286 190 q34 -14 74 -4 V220 H276z" class="op-water"/>
    <path d="M308 194 h22 l-4 6 h-14z" class="op-boot"/>
    <path d="M296 72 v-30 M304 72 v-30 M292 42 h16 v-8 h-16z" class="op-toren"/>
    <path d="M30 136 v-22 l22 -16 l22 16 v22z" class="op-huis"/><path d="M46 136 v-12 h10 v12" class="op-deur"/>
    <path d="M100 172 h40 v-10 l-8 -8 h-22 l-6 8 h-4z" class="op-auto"/><circle cx="110" cy="173" r="4" class="op-wiel"/><circle cx="132" cy="173" r="4" class="op-wiel"/>
    <path d="M196 152 v-24" class="op-stam"/><circle cx="196" cy="114" r="18" class="op-boom"/>
    <path d="M248 166 l14 -22 l14 22z" class="op-tent"/>
    <path d="M80 200 v-22 h26 v22 M78 178 h30" class="op-hokje"/>
    <path d="M140 200 v-12 M152 200 v-12 M164 200 v-12 M176 200 v-12 M138 191 h40" class="op-hek"/>
    <circle cx="18" cy="190" r="9" class="op-boom laag"/><circle cx="36" cy="186" r="10" class="op-boom laag"/><circle cx="50" cy="192" r="8" class="op-boom laag"/>`;
  const merken = s('g');
  plaatje.append(merken);

  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const telling = h('p.doe-stil');
  const knoppen = PLEKKEN.map((pl) => h('button.knop.klein.op-knop', { type: 'button', onclick: () => kies(pl) }, pl.naam));

  function kies(pl) {
    gekozen.add(pl.id);
    melding.classList.toggle('fout', pl.veilig === false);
    melding.classList.toggle('nood', pl.veilig === 'nood');
    melding.textContent = `${pl.veilig === true ? 'Veilig.' : pl.veilig === 'nood' ? 'Alleen als het niet anders kan.' : 'Niet veilig.'} ${pl.waarom}`;
    knoppen.forEach((k, i) => {
      const x = PLEKKEN[i];
      if (!gekozen.has(x.id)) return;
      k.classList.toggle('goed', x.veilig === true);
      k.classList.toggle('nood', x.veilig === 'nood');
      k.classList.toggle('fout', x.veilig === false);
    });
    merken.replaceChildren(...PLEKKEN.filter((x) => gekozen.has(x.id)).map((x) => s('g', { transform: `translate(${x.x} ${x.y})` },
      s('circle', { r: 9, class: `op-merk ${x.veilig === true ? 'goed' : x.veilig === 'nood' ? 'nood' : 'fout'}` }),
      s('text', { class: 'op-merkteken', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, x.veilig === true ? '✓' : x.veilig === 'nood' ? '!' : '✗'))));
    const veilig = PLEKKEN.filter((x) => x.veilig === true);
    const gevonden = veilig.filter((x) => gekozen.has(x.id)).length;
    telling.textContent = gevonden === veilig.length ? `Je hebt de ${veilig.length} veilige plekken gevonden.` : `Veilige plekken gevonden: ${gevonden} van de ${veilig.length}.`;
  }

  // a tap in the picture chooses the nearest place
  plaatje.addEventListener('click', (e) => {
    const r = plaatje.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 360; const y = ((e.clientY - r.top) / r.height) * 220;
    const beste = PLEKKEN.reduce((b, pl) => { const d = Math.hypot(pl.x - x, pl.y - y); return d < b.d ? { pl, d } : b; }, { pl: null, d: 34 });
    if (beste.pl) kies(beste.pl);
  });

  telling.textContent = 'Het onweert, je bent op hike. Waar ga je heen? Tik een plek aan.';
  return h('div.doe-onweerplek', h('div.op-beeld', plaatje), telling, melding, h('div.op-knoppen', knoppen));
}
