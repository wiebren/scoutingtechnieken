// Where and when the sun rises and sets: a place in the Netherlands and a date, and the path of the sun over the sky
// seen from above, with you in the middle and the horizon round the edge. The higher the sun, the closer to the
// middle. Slide the time to see where the sun is, and which way the shadow of a stick falls.
import { h } from '../../dom.js';
import { actie, acties } from '../knoppen.js';
import { p, pol, s } from '../kompasdelen.js';
import { beginStaat, datum, datumSchuif, moment, plaatsKeuze, plaatsVan, tijdNaam, tijdSchuif, zetNu } from './bediening.js';
import { klok, klokNL, richtingTekst, windstreek, zon, zonOpOnder } from './hemel.js';

const C = 180;
const R = 146;                                   // the horizon
const naar = (hoogte, richting) => pol(C, C, (R * (90 - Math.max(hoogte, 0))) / 90, richting);
const duur = (min) => { const m = Math.round(min); return `${Math.floor(m / 60)} uur ${m % 60} min`; };

export default function opEnOnderStuk() {
  const staat = beginStaat();
  if (staat.minuten < 360 || staat.minuten > 1320) staat.minuten = 13 * 60;

  // -- the picture
  const vast = s('g');
  vast.append(s('circle', { cx: C, cy: C, r: R, class: 'hm-grond' }));
  for (const hoogte of [30, 60]) vast.append(s('circle', { cx: C, cy: C, r: (R * (90 - hoogte)) / 90, class: 'hm-ring' }));
  vast.append(s('circle', { cx: C, cy: C, r: R, class: 'hm-horizon' }));
  for (let g = 0; g < 360; g += 15) {
    const [x1, y1] = pol(C, C, R, g); const [x2, y2] = pol(C, C, R + (g % 45 ? 4 : 8), g);
    vast.append(s('path', { d: `M${p(x1)} ${p(y1)}L${p(x2)} ${p(y2)}`, class: 'hm-streep' }));
  }
  for (const [g, t] of [[0, 'N'], [90, 'O'], [180, 'Z'], [270, 'W']]) {
    const [x, y] = pol(C, C, R + 20, g);
    vast.append(s('text', { x: p(x), y: p(y), class: 'hm-letter hoofd', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, t));
  }
  for (const hoogte of [30, 60]) {
    const [x, y] = pol(C, C, (R * (90 - hoogte)) / 90, 200);
    vast.append(s('text', { x: p(x), y: p(y) + 12, class: 'hm-klein', 'text-anchor': 'middle' }, `${hoogte}°`));
  }
  const baan = s('path', { class: 'hm-zonbaan' });
  const opMerk = s('g'); const onderMerk = s('g'); const topMerk = s('g');
  const schaduw = s('path', { class: 'hm-schaduw' });
  const zonTeken = s('g', { class: 'hm-glij' }, s('circle', { r: 15, class: 'hm-zon-gloed' }), s('circle', { r: 9, class: 'hm-zon-schijf' }));
  const svg = s('svg', { viewBox: '0 0 360 360', class: 'hm-svg', role: 'img' },
    vast, baan, opMerk, onderMerk, topMerk, schaduw, s('circle', { cx: C, cy: C, r: 4.5, class: 'hm-stok' }), zonTeken);

  // -- the words
  const uitkomst = h('p.hm-uitkomst');
  const nu = h('p.hm-uitkomst', { 'aria-live': 'polite' });
  const tabel = h('table.hm-tabel');
  const opnieuw = () => teken();
  const datumS = datumSchuif(staat, opnieuw);
  const tijdS = tijdSchuif(staat, opnieuw);
  const nuKnop = actie('Zet op nu', 'klok', () => { zetNu(staat); datumS.zet(); tijdS.zet(); teken(); }, { klein: true });

  const merk = (groep, hoogte, richting, tekst) => {
    const [x, y] = naar(hoogte, richting);
    const [lx, ly] = pol(C, C, Math.max(0, (R * (90 - hoogte)) / 90 - 26), richting);
    groep.replaceChildren(s('circle', { cx: p(x), cy: p(y), r: 4.5, class: 'hm-zon-schijf' }),
      s('text', { x: p(lx), y: p(ly), class: 'hm-label', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, tekst));
  };

  function teken() {
    const pl = plaatsVan(staat);
    const dt = datum(staat);
    const r = zonOpOnder(dt.j, dt.m, dt.d, pl.breedte, pl.lengte);
    const tijd = (t) => klok(klokNL(t).minuten);

    // the path over the day, only the part above the horizon
    const delen = []; let deel = [];
    for (let m = 0; m <= 1440; m += 5) {
      const z = zon(moment(staat, m), pl.breedte, pl.lengte);
      if (z.hoogte >= 0) { const [x, y] = naar(z.hoogte, z.richting); deel.push(`${p(x)} ${p(y)}`); } else if (deel.length) { delen.push(deel); deel = []; }
    }
    if (deel.length) delen.push(deel);
    baan.setAttribute('d', delen.map((d) => `M${d.join('L')}`).join(''));

    const zOp = r.op && zon(r.op, pl.breedte, pl.lengte);
    const zOnder = r.onder && zon(r.onder, pl.breedte, pl.lengte);
    if (zOp) merk(opMerk, 0, zOp.richting, `op ${tijd(r.op)}`); else opMerk.replaceChildren();
    if (zOnder) merk(onderMerk, 0, zOnder.richting, `onder ${tijd(r.onder)}`); else onderMerk.replaceChildren();
    const zTop = zon(r.top.t, pl.breedte, pl.lengte);
    merk(topMerk, zTop.hoogte, zTop.richting, `${tijd(r.top.t)} · ${Math.round(zTop.hoogte)}°`);

    // the sun now, and the shadow of a stick of 1 m (on this scale 30 units)
    const z = zon(moment(staat), pl.breedte, pl.lengte);
    const op = z.hoogte > 0;
    const [zx, zy] = naar(z.hoogte, z.richting);
    zonTeken.setAttribute('transform', `translate(${p(zx)} ${p(zy)})`);
    zonTeken.setAttribute('visibility', op ? 'visible' : 'hidden');
    const lengte = op ? Math.min(R - 10, 30 / Math.tan((Math.max(z.hoogte, 1) * Math.PI) / 180)) : 0;
    const [sx, sy] = pol(C, C, lengte, z.richting + 180);
    schaduw.setAttribute('d', `M${C} ${C}L${p(sx)} ${p(sy)}`);
    schaduw.setAttribute('visibility', op ? 'visible' : 'hidden');

    const dag = r.op && r.onder ? (r.onder - r.op) / 6e4 : null;
    tabel.replaceChildren(
      h('tr', h('th', 'Zon op'), h('td', r.op ? `${tijd(r.op)}, in ${richtingTekst(zOp.richting)} (${Math.round(zOp.richting)}°)` : '–')),
      h('tr', h('th', 'Hoogst'), h('td', `${tijd(r.top.t)}, in het zuiden, ${Math.round(zTop.hoogte)}° hoog`)),
      h('tr', h('th', 'Zon onder'), h('td', r.onder ? `${tijd(r.onder)}, in ${richtingTekst(zOnder.richting)} (${Math.round(zOnder.richting)}°)` : '–')),
      h('tr', h('th', 'Dag'), h('td', dag ? duur(dag) : '–')));
    uitkomst.textContent = `${pl.naam}, ${dt.tekst} (${tijdNaam(staat)}):`;
    const schaduwTekst = z.hoogte > 2 ? ` Een stok van 1 meter geeft ${(1 / Math.tan((z.hoogte * Math.PI) / 180)).toLocaleString('nl-NL', { maximumFractionDigits: 1 })} meter schaduw, naar ${richtingTekst(z.richting + 180)}.` : '';
    nu.textContent = op
      ? `Om ${klok(staat.minuten)} staat de zon in ${richtingTekst(z.richting)} (${Math.round(z.richting)}°), ${Math.round(z.hoogte)}° boven de horizon.${schaduwTekst}`
      : `Om ${klok(staat.minuten)} is de zon onder.`;
    svg.setAttribute('aria-label', `De baan van de zon van bovenaf, op ${dt.tekst} in ${pl.naam}: op in ${windstreek(zOp?.richting ?? 90)}, onder in ${windstreek(zOnder?.richting ?? 270)}. ${nu.textContent}`);
  }

  teken();
  return h('div.hm.doe-zon',
    h('div.hm-beeld', svg),
    h('div.hm-tekst', plaatsKeuze(staat, opnieuw), datumS.el, tijdS.el, acties(nuKnop),
      uitkomst, tabel, nu,
      h('p.hm-noot', 'Van bovenaf: jij staat in het midden, de rand is de horizon. Hoe hoger de zon, hoe dichter bij het midden. De grijze streep is de schaduw van een stok. Tijden in de klok van Nederland.')));
}
