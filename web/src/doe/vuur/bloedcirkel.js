// Is your bloedcirkel free? You stand in the middle with a knife, an axe or a saw; around you a few scouts, and
// sometimes a branch overhead. Send everyone who stands inside your circle out (tap them), and only then start.
// The circle: as far as your arm with the tool reaches, all round; for an axe two axe lengths measured from you, with
// nothing in front, behind or above you (Scouting Nederland, veiligheidsblad 2016). The axe is a long one, so two axe
// lengths are more than your reach; with a short hand axe they would not be. The sizes are rough, not metres.
import { h } from '../../dom.js';
import { actie, acties, keuze, zetActie } from '../knoppen.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './vuur.css';

const [CX, CY] = [170, 150];
const ARM = 30;
const GEREEDSCHAP = {
  mes: { naam: 'zakmes', lengte: 7, uitleg: 'je arm met het mes' },
  zaag: { naam: 'beugelzaag', lengte: 32, uitleg: 'je arm met de zaag' },
  bijl: { naam: 'bijl', lengte: 50, bijllengtes: 2, uitleg: 'twee bijllengtes, gemeten vanaf jou' },
};
const NAMEN = ['Sam', 'Noor', 'Daan', 'Fleur', 'Mo', 'Lotte', 'Jesse', 'Yara', 'Tim', 'Ilse'];

const schud = (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export default function bloedcirkel() {
  let tool = 'bijl'; let mensen = []; let tak = false; let klaar = false;

  const cirkel = s('circle', { cx: CX, cy: CY, class: 'rood-lijn', 'stroke-dasharray': '7 5', style: 'fill: color-mix(in srgb, var(--rood) 9%, transparent)' });
  const arm = s('g');
  const mensenG = s('g'); const takG = s('g');
  const svg = s('svg', { viewBox: '0 0 340 300', class: 'vk-svg' },
    s('rect', { x: 0, y: 0, width: 340, height: 300, rx: 12, style: 'fill: color-mix(in srgb, var(--fam-natuur) 12%, var(--paneel))' }),
    cirkel, arm,
    s('ellipse', { cx: CX, cy: CY, rx: 20, ry: 11, style: 'fill: var(--lijn-sterk)' }), s('circle', { cx: CX, cy: CY, r: 9, style: 'fill: var(--stil)' }),
    s('text', { x: CX, y: CY + 30, class: 'tekst stil', 'text-anchor': 'middle' }, 'jij'),
    takG, mensenG);

  const melding = h('div.vk-oordeel', { 'aria-live': 'polite' });
  const start = actie('Begin met werken', 'start', () => begin(), { hoofd: true });
  const el = h('div.doe-vk.naast', svg,
    h('div.vk-tekst',
      h('div.vk-rij', { role: 'group', 'aria-label': 'Gereedschap' }, h('p.vk-kop', 'Je werkt met'),
        keuze(Object.entries(GEREEDSCHAP).map(([k, g]) => [k, g.naam]), tool, (t) => { tool = t; klaar = false; teken(); zeg(uitleg()); })),
      h('p.vk-uitleg', 'Staat er iemand in je cirkel? Tik hem aan om hem weg te sturen. Hangt er een tak boven je? Tik die aan om een andere plek te zoeken.'),
      acties(start, actie('Andere plek', 'opnieuw', () => nieuw(), { klein: true })),
      melding));

  const straal = () => { const g = GEREEDSCHAP[tool]; return g.bijllengtes ? g.bijllengtes * g.lengte : 16 + ARM + g.lengte; };
  const binnen = (m) => Math.hypot(m.x - CX, m.y - CY) < straal() + 9;
  const uitleg = () => `Je cirkel is ${GEREEDSCHAP[tool].uitleg}, rondom.${tool === 'bijl' ? ' En niets voor, achter of boven je. Houd liever wat meer ruimte: nooit minder dan je arm met de bijl reikt.' : ''}`;
  function zeg(t, soort = '') { melding.className = `vk-oordeel ${soort}`; melding.textContent = t; }

  function nieuw() {
    klaar = false;
    const namen = schud(NAMEN).slice(0, 5);
    mensen = namen.map((naam, i) => {
      const hoek = ((i * 72 + Math.random() * 40) * Math.PI) / 180;
      const r = 30 + Math.random() * 120;
      return { naam, x: Math.min(318, Math.max(22, CX + r * Math.cos(hoek))), y: Math.min(262, Math.max(18, CY + r * Math.sin(hoek) * 0.85)) };
    });
    tak = Math.random() < 0.5;
    teken();
    zeg(uitleg());
  }

  function stuurWeg(m) {
    if (klaar) return;
    if (!binnen(m)) { zeg(`${m.naam} staat al buiten je cirkel.`); return; }
    const hoek = Math.atan2(m.y - CY, m.x - CX); const r = straal() + 26;
    m.x = Math.min(318, Math.max(22, CX + r * Math.cos(hoek)));
    m.y = Math.min(262, Math.max(18, CY + r * Math.sin(hoek)));
    if (binnen(m)) { m.x = CX + r * Math.cos(hoek) > 170 ? 318 : 22; }
    teken();
    zeg(`${m.naam} gaat buiten je cirkel staan.`);
  }

  function teken() {
    const r = straal();
    cirkel.setAttribute('r', r);
    const g = GEREEDSCHAP[tool];
    const handX = CX + 16 + ARM; const eind = CX + 16 + ARM + g.lengte;
    arm.replaceChildren(
      s('path', { d: `M${CX + 16} ${CY}H${handX}`, class: 'lijn', 'stroke-width': 4 }),
      s('path', { d: `M${handX} ${CY}H${eind}`, class: 'hout', 'stroke-width': 5, style: tool === 'mes' ? 'stroke: var(--vk-metaal)' : '' }),
      tool === 'bijl' ? s('path', { d: `M${eind - 4} ${CY - 10}h10v20h-10z`, class: 'metaal' }) : '',
      ...(g.bijllengtes ? Array.from({ length: g.bijllengtes }, (_, i) => {
        // one axe length per segment, along the circle's radius to the lower left
        const [ux, uy] = [-Math.SQRT1_2, Math.SQRT1_2]; const [a, e] = [i * g.lengte + 3, (i + 1) * g.lengte - 3];
        return s('g', {},
          s('path', { d: `M${CX + ux * a} ${CY + uy * a}L${CX + ux * e} ${CY + uy * e}`, class: 'hout', 'stroke-width': 4, opacity: 0.55 }),
          s('text', { x: CX + ux * (a + e) / 2 - 8, y: CY + uy * (a + e) / 2 - 6, class: 'tekst stil', 'text-anchor': 'end' }, `${i + 1}`));
      }) : []));
    takG.replaceChildren(...(tak ? [s('g', { role: 'button', tabindex: 0, 'aria-label': 'Een tak boven je hoofd' },
      s('circle', { cx: 240, cy: 82, r: 52, class: 'focus-ring', fill: 'none' }),
      s('path', { d: `M330 40Q260 70 ${CX + 6} ${CY - 22}`, stroke: '#6b4a2b', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }),
      ...[[280, 60], [240, 82], [205, 108]].map(([x, y]) => s('ellipse', { cx: x, cy: y, rx: 16, ry: 9, style: 'fill: var(--fam-natuur)', opacity: 0.8 })),
      s('text', { x: 268, y: 34, class: 'tekst stil' }, 'tak boven je'))] : []));
    const takEl = takG.firstChild;
    if (takEl) {
      const weg = () => { if (klaar) return; tak = false; teken(); zeg('Je zoekt een plek zonder takken boven je.'); };
      takEl.addEventListener('click', weg);
      takEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); weg(); } });
    }
    mensenG.replaceChildren(...mensen.map((m) => {
      const groep = s('g', { role: 'button', tabindex: 0, 'aria-label': `${m.naam}, ${binnen(m) ? 'dichtbij' : 'verder weg'}` },
        s('circle', { cx: m.x.toFixed(1), cy: m.y.toFixed(1), r: 14, class: 'focus-ring', fill: 'none' }),
        s('circle', { cx: m.x.toFixed(1), cy: m.y.toFixed(1), r: 9, style: 'fill: var(--accent)' }),
        s('text', { x: m.x.toFixed(1), y: (m.y + 22).toFixed(1), class: 'tekst', 'text-anchor': 'middle' }, m.naam));
      groep.addEventListener('click', () => stuurWeg(m));
      groep.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stuurWeg(m); } });
      return groep;
    }));
    svg.setAttribute('aria-label', `Jij van bovenaf met een ${g.naam}, je bloedcirkel eromheen, en vijf scouts.${tak ? ' Er hangt een tak boven je.' : ''}`);
    zetActie(start, ...(klaar ? ['Nog een keer', 'opnieuw'] : ['Begin met werken', 'start']));
  }

  function begin() {
    if (klaar) { nieuw(); return; }
    const in_ = mensen.filter(binnen).map((m) => m.naam);
    if (in_.length) { zeg(`Stop! ${in_.join(' en ').replace(/ en (?=.* en )/g, ', ')} ${in_.length === 1 ? 'staat' : 'staan'} in je cirkel.`, 'fout'); return; }
    if (tak && tool === 'bijl') { zeg('Stop! Er hangt een tak boven je. Daar blijft je bijl achter haken of ketst hij af.', 'fout'); return; }
    klaar = true;
    zeg(`Je cirkel is vrij${tak ? ' (de tak hindert je zakmes of zaag niet, maar let erop)' : ''}. Je kunt veilig werken. Komt er toch iemand in je cirkel: stop.`, 'goed');
    teken();
  }

  nieuw();
  return el;
}
