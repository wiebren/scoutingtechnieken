// Which tarp setup for this weather? A scene with rain and wind; choose A-frame, afdak or vlieger, and see the tarp
// put up that way in that weather, with why it does or does not keep you dry. Facts: TKN §9 (tarp-opstellingen) and
// kamperen-uitwerking.md; the advice is the plain rule "the low side into the wind".
import { h } from '../../dom.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './kamp.css';

const OPSTELLINGEN = [
  { id: 'aframe', naam: 'A-frame' },
  { id: 'afdak', naam: 'Afdak' },
  { id: 'vlieger', naam: 'Vlieger' },
];

const WEER = [
  { tekst: 'Het regent de hele nacht, en het waait bijna niet.', regen: true, wind: 0, goed: 'aframe',
    uitleg: {
      aframe: 'Een A-frame is een dak met twee schuine kanten: de regen loopt er aan beide kanten af, en je ligt er droog onder.',
      afdak: 'Een afdak is aan één kant open. Zonder wind gaat dat nog, maar bij een vlaag of opspattende regen word je aan de open kant nat.',
      vlieger: 'Een vlieger beschermt vooral tegen wind uit één richting. Voor regen recht van boven is hij klein: een A-frame geeft meer dak.',
    } },
  { tekst: 'Het is droog, er staat een stevige wind uit het westen, en je wilt een vuurtje voor je slaapplek.', regen: false, wind: 1, goed: 'afdak',
    uitleg: {
      aframe: 'Een A-frame is aan twee kanten dicht, maar dan zit je niet naar je vuurtje toe. Hier past een afdak beter.',
      afdak: 'Een afdak met de lage, dichte kant in de wind: de wind gaat over je heen, en aan de open kant zit je bij het vuur.',
      vlieger: 'Een vlieger vangt de wind goed, maar is klein en zit dicht. Voor een plek bij het vuur is een afdak handiger.',
    } },
  { tekst: 'Het regent, en de wind komt steeds uit dezelfde hoek. Je bent alleen en hebt een klein zeil.', regen: true, wind: 1, goed: 'vlieger',
    uitleg: {
      aframe: 'Een A-frame kan, maar met een klein zeil zijn de kanten kort en waait de regen er aan de open uiteinden in.',
      afdak: 'Bij een afdak waait de regen aan de open kant naar binnen als de wind een beetje draait.',
      vlieger: 'Een vlieger: één hoek hoog, de andere laag en vast in de wind. Klein zeil, weinig lijnen, en de wind en de regen gaan eroverheen.',
    } },
  { tekst: 'Een warme droge zomernacht. Je wilt de sterren zien en alleen de dauw tegenhouden.', regen: false, wind: 0, nacht: true, goed: 'afdak',
    uitleg: {
      aframe: 'Een A-frame houdt de dauw tegen, maar je ziet alleen zeil. Zonder regen kan het opener.',
      afdak: 'Een hoog afdak houdt de dauw van je slaapzak, en aan de open kant zie je de lucht.',
      vlieger: 'Een vlieger kan, maar hij hangt laag en dicht om je heen. Een open afdak past hier beter.',
    } },
];

/** The scene: rain and wind, and the tarp put up the chosen way (or none yet). The wind comes from the left. */
function scene(weer, keuze) {
  const g = s('g');
  g.append(s('rect', { x: 0, y: 150, width: 320, height: 30, class: 'kd-gras' }), s('path', { d: 'M0 150H320', class: 'kd-touw' }));
  if (weer.wind) {
    for (const y of [50, 90]) g.append(s('path', { d: `M8 ${y}h44m-8 -6l8 6l-8 6`, class: 'kd-wind' }));
    g.append(s('text', { x: 30, y: 40, 'text-anchor': 'middle', class: 'kd-label blauw' }, 'wind'));
  }
  if (weer.nacht) {
    g.append(s('circle', { cx: 268, cy: 34, r: 12, fill: '#f4e19c' }), s('circle', { cx: 274, cy: 30, r: 11, fill: 'var(--paneel)' }));
    for (const [x, y] of [[60, 30], [120, 18], [190, 40], [230, 16], [90, 60]]) g.append(s('circle', { cx: x, cy: y, r: 1.8, fill: 'var(--stil)' }));
  }
  if (weer.regen) {
    const schuin = weer.wind ? 7 : 1;
    for (let i = 0; i < 18; i++) for (let j = 0; j < 4; j++) {
      const x = 14 + i * 17 + (j % 2) * 8; const y = 14 + j * 26;
      g.append(s('path', { d: `M${x} ${y}l${schuin} 10`, class: 'kd-regen' }));
    }
  }
  if (keuze === 'aframe') {
    g.append(s('path', { d: 'M110 70H230', class: 'kd-touw' }), s('path', { d: 'M110 60V150M230 60V150', class: 'kd-paal' }),
      s('path', { d: 'M170 70L120 150H220Z', class: 'kd-zeil' }));
  } else if (keuze === 'afdak') {
    // the low side into the wind (left), the open side away from it
    g.append(s('path', { d: 'M226 54V150', class: 'kd-paal' }), s('path', { d: 'M226 50L250 150', class: 'kd-touw' }),
      s('path', { d: 'M108 150L224 60L230 70L118 150Z', class: 'kd-zeil' }));
  } else if (keuze === 'vlieger') {
    g.append(s('path', { d: 'M232 50V150', class: 'kd-paal' }),
      s('path', { d: 'M230 54L170 96L120 150L216 142Z', class: 'kd-zeil' }));
  }
  if (keuze) g.append(s('ellipse', { cx: 178, cy: 144, rx: 26, ry: 6, fill: 'color-mix(in srgb, var(--fam-kamp) 60%, var(--paneel))' }));
  return g;
}

export default function tarp() {
  let i = Math.floor(Math.random() * WEER.length);
  let gekozen = null;
  let goed = 0; let gedaan = 0;

  const beeld = s('g');
  const svg = s('svg', { viewBox: '0 0 320 180', class: 'kd-svg', role: 'img' }, beeld);
  const vraag = h('p.kd-vraag', { 'aria-live': 'polite' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const keuzes = h('div.knop-rij');
  const volgende = h('button.knop.klein.hoofd', { type: 'button', hidden: true, onclick: () => { i = (i + 1) % WEER.length; nieuw(); } }, 'Ander weer');
  const score = h('p.kd-score');

  function teken() {
    const weer = WEER[i];
    beeld.replaceChildren(scene(weer, gekozen));
    svg.setAttribute('aria-label', `${weer.tekst}${gekozen ? ` Gekozen: ${OPSTELLINGEN.find((o) => o.id === gekozen).naam}.` : ''}`);
    score.textContent = gedaan ? `Goed gekozen: ${goed} van ${gedaan}` : '';
  }

  function kies(id) {
    if (gekozen) return;
    const weer = WEER[i];
    gekozen = id; gedaan++;
    if (id === weer.goed) goed++;
    melding.classList.toggle('fout', id !== weer.goed);
    melding.textContent = `${id === weer.goed ? 'Goed!' : `Hier past ${OPSTELLINGEN.find((o) => o.id === weer.goed).naam.toLowerCase()} beter.`} ${weer.uitleg[id]}`;
    for (const k of keuzes.children) {
      k.disabled = true;
      k.classList.toggle('kd-goed', k.dataset.id === weer.goed);
      k.classList.toggle('kd-fout', k.dataset.id === id && id !== weer.goed);
    }
    volgende.hidden = false;
    volgende.focus({ preventScroll: true });
    teken();
  }

  function nieuw() {
    gekozen = null;
    vraag.textContent = `${WEER[i].tekst} Welke opstelling kies je?`;
    melding.textContent = ''; melding.classList.remove('fout');
    keuzes.replaceChildren(...OPSTELLINGEN.map((o) => h('button.knop.klein', { type: 'button', 'data-id': o.id, onclick: () => kies(o.id) }, o.naam)));
    volgende.hidden = true;
    teken();
  }

  nieuw();
  return h('div.kd.naast.doe-tarp', svg, h('div.kd-tekst', vraag, keuzes, melding, h('div.knop-rij', volgende), score));
}
