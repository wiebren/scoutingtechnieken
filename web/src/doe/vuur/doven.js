// Put a fire out for real. Sprinkle water, pull the coals apart, stir, put sand on, and feel whether it is cold:
// out is only out when you can touch the remains with your bare hand. Coals deep down stay hidden until you spread
// or stir them, sand smothers the glow but keeps the heat in, and a whole bucket on a fire makes hot steam.
// With "fles water" you have three splashes: only enough if you spread the coals first.
import { h } from '../../dom.js';
import { actie, acties, keuze } from '../knoppen.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './vuur.css';

const [CX, CY] = [160, 112];
const SCHEUTJES = 3;

function nieuwVuur() {
  const kolen = [];
  for (let i = 0; i < 15; i++) {
    const hoek = (i * 137.5 * Math.PI) / 180; const r = 10 + Math.sqrt(i / 15) * 58;
    kolen.push({ x: CX + r * Math.cos(hoek), y: CY + r * 0.62 * Math.sin(hoek), temp: 72 + Math.round(Math.random() * 24), onder: i % 3 === 1 });
  }
  return kolen;
}

export default function vuurDoven() {
  let kolen = nieuwVuur(); let verspreid = false; let zand = false; let water = 0; let modus = 'emmer'; let uit = false;

  const kolenG = s('g'); const effect = s('g');
  const zandLaag = s('ellipse', { cx: CX, cy: CY, rx: 112, ry: 70, class: 'zand', opacity: 0.92 });
  const vlammen = s('g');
  const svg = s('svg', { viewBox: '0 0 320 224', class: 'vk-svg', role: 'img' },
    s('ellipse', { cx: CX, cy: CY + 4, rx: 130, ry: 84, class: 'grond' }),
    s('ellipse', { cx: CX, cy: CY, rx: 118, ry: 76, class: 'lijn dun stil', 'stroke-dasharray': '5 4' }),
    kolenG, zandLaag, vlammen, effect);

  const stand = h('p.vk-uitleg.vk-stand', { 'aria-live': 'polite' });
  const melding = h('div.vk-oordeel', { 'aria-live': 'polite' });
  const daad = (t, f) => actie(t, null, f, { klein: true });
  const emmer = daad('Gooi de hele emmer erover', () => sprenkel(4));
  const knoppen = [daad('Sprenkel water', () => sprenkel(1)), daad('Haal uit elkaar', spreid), daad('Roer', roer), daad('Strooi zand erop', zandErop), emmer];
  const voel = actie('Voel of het koud is', 'vink', voelen, { hoofd: true });
  const el = h('div.doe-vk.naast', svg,
    h('div.vk-tekst',
      h('div.vk-rij', { role: 'group', 'aria-label': 'Hoeveel water' }, h('p.vk-kop', 'Water'),
        keuze([['emmer', 'emmer water'], ['fles', 'fles water']], modus, (m) => { modus = m; opnieuw(); })),
      acties(...knoppen), h('div.knop-rij', voel, actie('Nieuw vuur', 'opnieuw', opnieuw, { klein: true })),
      stand, melding));

  const zichtbaar = () => kolen.filter((k) => !k.onder);
  const heet = (lijst) => lijst.filter((k) => k.temp > 60).length;
  const warm = (lijst) => lijst.filter((k) => k.temp > 30 && k.temp <= 60).length;

  function teken() {
    kolenG.replaceChildren(...kolen.filter((k) => !k.onder).map((k) => {
      const kleur = k.temp > 60 ? '#ff6a1a' : k.temp > 30 ? '#9b3a1e' : '#5b6064';
      return s('g', {},
        k.temp > 60 ? s('circle', { cx: k.x.toFixed(1), cy: k.y.toFixed(1), r: 13, fill: '#ffb347', opacity: 0.35 }) : '',
        s('ellipse', { cx: k.x.toFixed(1), cy: k.y.toFixed(1), rx: 10, ry: 6.5, fill: kleur, stroke: '#2b2b2b', 'stroke-width': 0.8 }));
    }));
    zandLaag.style.display = zand ? '' : 'none';
    vlammen.replaceChildren();
    if (!zand && !verspreid && Math.max(...zichtbaar().map((k) => k.temp)) > 85) {
      vlammen.append(s('path', { class: 'vlam flakker', d: `M${CX} ${CY - 46}C${CX - 18} ${CY - 26} ${CX - 22} ${CY - 6} ${CX - 12} ${CY + 2}C${CX - 6} ${CY + 6} ${CX + 6} ${CY + 6} ${CX + 12} ${CY + 2}C${CX + 22} ${CY - 6} ${CX + 18} ${CY - 26} ${CX} ${CY - 46}Z` }));
    }
    const z = zichtbaar();
    const over = modus === 'fles' ? ` Nog ${SCHEUTJES - water} van de ${SCHEUTJES} scheutjes in je fles.` : ` ${water} keer water gebruikt.`;
    stand.textContent = `Je ziet ${heet(z)} gloeiende, ${warm(z)} warme en ${z.length - heet(z) - warm(z)} koude kooltjes${zand ? ', onder het zand' : ''}.${over}`;
    svg.setAttribute('aria-label', `De stookplek van boven. ${stand.textContent}`);
    emmer.disabled = modus === 'fles';
  }

  function zeg(tekst, soort = '') { melding.className = `vk-oordeel ${soort}`; melding.textContent = tekst; }

  function stoom() {
    effect.replaceChildren(...[-30, 0, 30].map((dx, i) => s('path', { d: `M${CX + dx} ${CY - 10}c-8 -12 8 -20 0 -32c-6 -10 6 -16 0 -26`, class: 'rook opstijgen', style: `animation-delay: ${i * 0.15}s` })));
  }

  function sprenkel(n) {
    if (uit) return;
    if (modus === 'fles' && water >= SCHEUTJES) { zeg('Je fles is leeg. Lukt het niet? Haal de kooltjes eerst uit elkaar, en probeer opnieuw.', 'fout'); return; }
    water += n;
    for (const k of zichtbaar()) k.temp = Math.max(4, k.temp - (verspreid ? 45 : 18) * (n > 1 ? 1.6 : 1));
    stoom();
    if (n > 1) zeg('Pssssjjj! Een grote wolk hete stoom. Bij een groot vuur met mensen dichtbij kan die stoom ernstige brandwonden geven. Sprenkel liever, en haal het vuur eerst uit elkaar.', 'fout');
    else zeg(verspreid ? 'Psssj. De losse kooltjes koelen snel af.' : 'Psssj. Het water komt alleen op de bovenkant; de stapel blijft vanbinnen heet.');
    teken();
  }

  function spreid() {
    if (uit) return;
    const verborgen = kolen.filter((k) => k.onder).length;
    const factor = verspreid ? 1 : 1.5;              // spread once; again only stirs up what lies under
    verspreid = true; zand = false;
    for (const k of kolen) { k.onder = false; k.x = CX + (k.x - CX) * factor; k.y = CY + (k.y - CY) * factor; k.temp = Math.max(4, k.temp - 4); }
    zeg(`Je haalt de kooltjes en het hout uit elkaar en schraapt het gloeiende eraf.${verborgen ? ` Onderin lagen nog ${verborgen} kooltjes verstopt!` : ''} Losse kooltjes koelen veel sneller af.`);
    teken();
  }

  function roer() {
    if (uit) return;
    const verborgen = kolen.filter((k) => k.onder).length;
    for (const k of kolen) { k.onder = false; k.x += (Math.random() - 0.5) * 10; k.y += (Math.random() - 0.5) * 6; }
    zeg(verborgen ? `Je roert met een stok. Er komen ${verborgen} kooltjes van onderen boven.` : 'Je roert met een stok. Er komt niets nieuws boven.');
    teken();
  }

  function zandErop() {
    if (uit) return;
    zand = true;
    zeg('Het zand sluit de lucht af en de gloed is weg. Maar eronder blijft het heet: onder een laag as smeult een vuur zelfs de hele nacht door. Voel daarom altijd na.', 'half');
    teken();
  }

  function voelen() {
    if (uit) return;
    const z = zichtbaar(); const verborgen = kolen.filter((k) => k.onder);
    if (heet(z)) { zeg('Al als je je hand erboven houdt, voel je de hitte. Nog lang niet uit!', 'fout'); return; }
    if (warm(z)) { zeg(`Voorzichtig gevoeld: nog warm${zand ? ', onder het zand' : ''}. Het is niet uit.`, 'fout'); return; }
    if (verborgen.length) {
      for (const k of verborgen) k.onder = false;
      zeg(`Bovenop is het koud. Maar je voelt onderin, en daar gloeit het nog: ${verborgen.length} kooltjes! Uit is ook onderin uit.`, 'fout');
      teken(); return;
    }
    uit = true;
    zeg(`Koud, ook onderin: je kunt alles met je blote hand aanraken. Nu is het uit.${modus === 'fles' ? ` Met maar ${water} scheutje${water === 1 ? '' : 's'} water!` : ` Je gebruikte ${water} keer water.`} De afgekoelde resten gaan in de container.`, 'goed');
    knoppen.forEach((b) => { b.disabled = true; }); voel.disabled = true;
  }

  function opnieuw() {
    kolen = nieuwVuur(); verspreid = false; zand = false; water = 0; uit = false;
    knoppen.forEach((b) => { b.disabled = false; }); voel.disabled = false;
    effect.replaceChildren();
    zeg(modus === 'fles' ? 'Maak dit vuur uit met één fles water: drie scheutjes.' : 'Het vuur is bijna op. Maak het helemaal uit.');
    teken();
  }

  opnieuw();
  return el;
}
