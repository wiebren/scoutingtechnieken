// What is in the sky now, and which way of finding north without a compass works at this moment: the sun (watch,
// shadow stick, midday shadow), the moon (maankompas), the Pole Star (dark enough), seen from above for a place and a
// time you choose. For the blad noorden-zonder-kompas of Kaart en kompas.
import { h } from '../../dom.js';
import { p, pol, s } from '../kompasdelen.js';
import { beginStaat, datum, datumSchuif, moment, plaatsKeuze, plaatsVan, tijdNaam, tijdSchuif, zetNu } from './bediening.js';
import { faseNaam, klok, klokNL, maan, maanfase, maanPad, richtingTekst, zon, zonOpOnder } from './hemel.js';
import './hemel.css';

const C = 150;
const R = 120;
const naar = (hoogte, richting) => pol(C, C, (R * (90 - Math.max(hoogte, 0))) / 90, richting);

export default function hemelNu() {
  const staat = beginStaat();

  const lucht = s('circle', { cx: C, cy: C, r: R, class: 'hn-lucht' });
  const vast = s('g');
  for (const [g, t] of [[0, 'N'], [90, 'O'], [180, 'Z'], [270, 'W']]) {
    const [x, y] = pol(C, C, R + 16, g);
    vast.append(s('text', { x: p(x), y: p(y), class: 'hm-letter hoofd', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, t));
  }
  const dingen = s('g');
  const svg = s('svg', { viewBox: '0 0 300 300', class: 'hm-svg', role: 'img' },
    lucht, s('circle', { cx: C, cy: C, r: R, class: 'hm-horizon' }), vast, dingen);

  const lijst = h('ul.hn-lijst', { 'aria-live': 'polite' });
  const stand = h('p.hm-uitkomst');
  const opnieuw = () => teken();
  const datumS = datumSchuif(staat, opnieuw);
  const tijdS = tijdSchuif(staat, opnieuw);
  const nuKnop = h('button.knop.klein', { type: 'button', onclick: () => { zetNu(staat); datumS.zet(); tijdS.zet(); teken(); } }, 'Nu');

  function teken() {
    const pl = plaatsVan(staat);
    const t = moment(staat);
    const z = zon(t, pl.breedte, pl.lengte);
    const mn = maan(t, pl.breedte, pl.lengte);
    const mf = maanfase(t, pl.breedte, pl.lengte);
    const dt = datum(staat);
    const middag = klokNL(zonOpOnder(dt.j, dt.m, dt.d, pl.breedte, pl.lengte).top.t).minuten;
    const nacht = z.hoogte < -6;
    lucht.setAttribute('fill', z.hoogte > 0 ? '#8fb7de' : z.hoogte > -6 ? '#3a5f8f' : '#0d1626');

    dingen.replaceChildren();
    if (z.hoogte > 0) {
      const [x, y] = naar(z.hoogte, z.richting);
      dingen.append(s('circle', { cx: p(x), cy: p(y), r: 13, class: 'hm-zon-gloed' }), s('circle', { cx: p(x), cy: p(y), r: 8, class: 'hm-zon-schijf' }));
    }
    if (mn.hoogte > 0 && mf.verlicht > 0.03) {
      const [x, y] = naar(mn.hoogte, mn.richting);
      dingen.append(s('circle', { cx: p(x), cy: p(y), r: 9, class: 'hm-maan-donker' }), s('path', { d: maanPad(x, y, 9, mf.fase), class: 'hm-maan' }));
    }
    if (nacht) {
      const [x, y] = naar(pl.breedte, 0);
      dingen.append(s('circle', { cx: p(x), cy: p(y), r: 3, class: 'hm-ster' }), s('text', { x: p(x + 7), y: p(y + 4), class: 'hm-sternaam' }, 'Poolster'));
    }

    const rij = (ja, wat, tekst) => h('li', { class: ja ? 'ja' : 'nee' }, h('strong', wat), `: ${tekst}`);
    const zonOp = z.hoogte > 0;
    const rondMiddag = Math.abs(staat.minuten - middag) <= 45;
    const maanBruik = mn.hoogte > 5 && mf.verlicht > 0.3;
    lijst.replaceChildren(
      rij(zonOp, 'Horloge', zonOp ? `de zon staat in ${richtingTekst(z.richting)}, ${Math.round(z.hoogte)}° hoog` : 'de zon is onder'),
      rij(zonOp && z.hoogte > 5, 'Schaduwstok', zonOp && z.hoogte > 5 ? 'er is schaduw (als de zon niet achter de wolken zit)' : 'geen zon, geen schaduw'),
      rij(zonOp && rondMiddag, 'Middagschaduw', zonOp ? `de zon staat om ${klok(middag)} in het zuiden${rondMiddag ? ': nu bijna' : ''}` : 'de zon is onder'),
      rij(maanBruik, 'Maan', mn.hoogte > 0 ? `${faseNaam(mf.fase)}, in ${richtingTekst(mn.richting)}, ${Math.round(mn.hoogte)}° hoog` : `de maan (${faseNaam(mf.fase)}) is onder`),
      rij(nacht, 'Poolster', nacht ? 'het is donker genoeg: recht onder de Poolster is het noorden' : 'nog te licht voor sterren'),
      rij(false, 'Mos en bomen', 'werkt nooit goed'));
    stand.textContent = `${pl.naam}, ${dt.tekst}, ${klok(staat.minuten)} ${tijdNaam(staat)}:`;
    svg.setAttribute('aria-label', `De hemel van bovenaf, noord boven. ${zonOp ? `Zon in ${richtingTekst(z.richting)}.` : 'De zon is onder.'} ${mn.hoogte > 0 ? `Maan in ${richtingTekst(mn.richting)}.` : 'De maan is onder.'}`);
  }

  teken();
  return h('div.hm.doe-hemelnu',
    h('div.hm-beeld', svg),
    h('div.hm-tekst', plaatsKeuze(staat, opnieuw), datumS.el, tijdS.el, h('div.knop-rij', nuKnop), stand, lijst,
      h('p.hm-noot', 'Van bovenaf: het midden is recht boven je, de rand de horizon. Bewolking kan de hemelrekenaar niet zien: kijk zelf.')));
}
