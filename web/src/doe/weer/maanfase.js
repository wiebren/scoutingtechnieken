// The phases of the moon and why: the moon goes round the earth in about a month, always lit on the side of the sun.
// Seen from above (left) the lit half and the half that faces us; how much they overlap is what we see (right).
// Slide the days, or take today. "Raad" shows a moon: is it waxing or waning?
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { p, s } from '../kompasdelen.js';
import { faseNaam, MAANMAAND, maanPad, richtingTekst, vorigeNieuweMaan } from './hemel.js';
import '../vorm.css';
import './hemel.css';
import './maan.css';

const C = [160, 140];
const R = 100;

const ZICHTBAAR = {
  'nieuwe maan': 'Je ziet hem niet: hij staat overdag aan de hemel, vlak bij de zon.',
  'wassende sikkel': "’s Avonds, na zonsondergang, laag in het westen.",
  'eerste kwartier': "’s Middags en in de eerste helft van de nacht; rond middernacht gaat hij onder.",
  'wassende maan': 'Vanaf de middag tot diep in de nacht.',
  'volle maan': 'De hele nacht: hij komt op als de zon ondergaat, en gaat onder als de zon opkomt.',
  'afnemende maan': 'Vanaf de late avond tot in de ochtend.',
  'laatste kwartier': "In de tweede helft van de nacht en ’s ochtends; hij komt rond middernacht op.",
  'afnemende sikkel': "’s Ochtends vroeg, voor zonsopkomst, laag in het oosten.",
};

/** A moon of radius r at (cx, cy) as seen from here, for a phase 0..1. */
export function maanGezien(cx, cy, r, fase) {
  return s('g', {}, s('circle', { cx, cy, r, class: 'hm-maan-donker' }), s('path', { d: maanPad(cx, cy, r, fase), class: 'hm-maan' }),
    s('circle', { cx, cy, r, class: 'mf-rand' }));
}

export default function maanfaseStuk() {
  let modus = 'bekijk';
  let dagen = 7.4;
  let vandaag = false;

  // -- the orbit from above, the sun far away on the right
  const baan = s('g');
  for (const y of [30, 70, 210, 250]) baan.append(s('path', { d: `M354 ${y}H322M330 ${y - 5}L320 ${y}L330 ${y + 5}`, class: 'mf-zonlicht' }));
  baan.append(s('text', { x: 340, y: 140, class: 'hm-klein', 'text-anchor': 'middle', transform: 'rotate(90 340 140)' }, 'licht van de zon'));
  baan.append(s('circle', { cx: C[0], cy: C[1], r: R, class: 'mf-baan' }));
  // the moon goes round anticlockwise, seen from the north: an arrow along the orbit, bottom left
  const boog = (g) => [C[0] + (R + 16) * Math.cos(g * Math.PI / 180), C[1] - (R + 16) * Math.sin(g * Math.PI / 180)];
  const [b1, b2] = [boog(200), boog(240)];
  const punt = boog(240); const raak = [-Math.sin(240 * Math.PI / 180), -Math.cos(240 * Math.PI / 180)];
  const kop = (zij) => [punt[0] - 9 * raak[0] + zij * 5 * raak[1], punt[1] - 9 * raak[1] - zij * 5 * raak[0]];
  baan.append(s('path', { d: `M${p(b1[0])} ${p(b1[1])}A${R + 16} ${R + 16} 0 0 0 ${p(b2[0])} ${p(b2[1])}`, class: 'mf-pijl' }),
    s('path', { d: `M${p(kop(1)[0])} ${p(kop(1)[1])}L${p(punt[0])} ${p(punt[1])}L${p(kop(-1)[0])} ${p(kop(-1)[1])}`, class: 'mf-pijl' }));
  baan.append(s('circle', { cx: C[0], cy: C[1], r: 18, class: 'mf-aarde' }),
    s('path', { d: `M${C[0]} ${C[1] - 18}a18 18 0 0 0 0 36z`, class: 'mf-nacht' }),
    s('text', { x: C[0], y: C[1] + 32, class: 'hm-klein', 'text-anchor': 'middle' }, 'aarde'));
  const zicht = s('path', { class: 'mf-zicht' });
  const maanBol = s('g');
  const svg = s('svg', { viewBox: '0 0 360 280', class: 'hm-svg', role: 'img' }, baan, zicht, maanBol);

  const groot = s('svg', { viewBox: '0 0 120 120', class: 'mf-groot', role: 'img' });
  const naam = h('p.mf-naam');
  const uitleg = h('p.hm-uitkomst', { 'aria-live': 'polite' });
  const wanneer = h('p');
  const schuif = h('input.doe-schuif', { type: 'range', min: 0, max: 29.5, step: 0.25, value: dagen,
    oninput: () => { dagen = Number(schuif.value); vandaag = false; teken(); } });
  const dagUit = h('output');
  const vandaagKnop = h('button.knop.klein', { type: 'button', onclick: () => {
    const nu = Date.now();
    dagen = Math.round(((nu - vorigeNieuweMaan(nu)) / 864e5) * 4) / 4;
    vandaag = true;
    schuif.value = dagen;
    teken();
  } }, 'Vandaag');

  function teken() {
    const fase = dagen / MAANMAAND;
    const nm = faseNaam(Math.min(fase, 0.9999));
    dagUit.textContent = `${dagen.toLocaleString('nl-NL')} ${dagen === 1 ? 'dag' : 'dagen'}`;
    schuif.setAttribute('aria-valuetext', `${dagUit.textContent} na nieuwe maan`);

    // where the moon is on its orbit: anticlockwise from the side of the sun
    const a = 2 * Math.PI * fase;
    const mx = C[0] + R * Math.cos(a); const my = C[1] - R * Math.sin(a);
    // the moon: lit on the half towards the sun (right), dark on the other half
    maanBol.replaceChildren(s('circle', { cx: p(mx), cy: p(my), r: 14, class: 'hm-maan-donker' }),
      s('path', { d: `M${p(mx)} ${p(my - 14)}a14 14 0 0 1 0 28z`, class: 'hm-maan' }));
    // the half that faces the earth: a ring on that side
    const naarAarde = Math.atan2(C[1] - my, C[0] - mx);
    const r = 19;
    const b1 = naarAarde - Math.PI / 2; const b2 = naarAarde + Math.PI / 2;
    zicht.setAttribute('d', `M${p(mx + r * Math.cos(b1))} ${p(my + r * Math.sin(b1))}A${r} ${r} 0 0 1 ${p(mx + r * Math.cos(b2))} ${p(my + r * Math.sin(b2))}`);

    const verlicht = Math.round(((1 - Math.cos(a)) / 2) * 100);
    groot.replaceChildren(maanGezien(60, 60, 50, fase));
    groot.setAttribute('aria-label', `Zo zie je de maan: ${nm}, ${verlicht} procent verlicht`);
    naam.textContent = `${nm[0].toUpperCase()}${nm.slice(1)}`;
    const middernacht = (360 - fase * 360) % 360;
    uitleg.textContent = `${vandaag ? 'Vandaag: ' : ''}${dagUit.textContent} na nieuwe maan, ${verlicht}% verlicht`
      + (verlicht > 2 && verlicht < 98 ? `, ${fase < 0.5 ? 'wassend: de rechterkant is licht' : 'afnemend: de linkerkant is licht'}.` : '.');
    wanneer.textContent = `${ZICHTBAAR[nm]}`
      // not for new moon and the crescents: at midnight they are mostly below the horizon
      + (!/nieuwe maan|sikkel/.test(nm) ? ` Midden in de nacht staat hij ongeveer in ${richtingTekst(middernacht)}.` : '');
    svg.setAttribute('aria-label', `De maan van bovenaf op zijn baan om de aarde, ${dagUit.textContent} na nieuwe maan. De helft naar de zon is licht; de boog wijst de helft aan die naar de aarde kijkt.`);
  }

  // -- guess: waxing or waning?
  let goed = 0; let gehad = 0;
  function raad() {
    const fase = Math.random() < 0.5 ? 0.06 + Math.random() * 0.38 : 0.56 + Math.random() * 0.38;
    const beeld = s('svg', { viewBox: '0 0 120 120', class: 'mf-groot', role: 'img', 'aria-label': `Een maan, ${fase < 0.5 ? 'rechts' : 'links'} verlicht` }, maanGezien(60, 60, 50, fase));
    const melding = h('p.doe-melding', { 'aria-live': 'polite' });
    const verder = h('button.knop.klein.hoofd', { type: 'button', hidden: true, onclick: raad }, 'Volgende');
    const knoppen = [['wassend', 'Wassend'], ['afnemend', 'Afnemend']].map(([w, t]) => h('button.knop.klein', { type: 'button', onclick: () => {
      const juist = fase < 0.5 ? 'wassend' : 'afnemend';
      gehad += 1; if (w === juist) goed += 1;
      knoppen.forEach((k) => { k.disabled = true; });
      melding.classList.toggle('fout', w !== juist);
      melding.textContent = `${w === juist ? 'Goed!' : 'Nee.'} ${fase < 0.5 ? 'Rechts licht: wassend, hij wordt voller.' : 'Links licht: afnemend, hij wordt kleiner.'} Het is ${faseNaam(fase)}. ${goed} van de ${gehad} goed.`;
      verder.hidden = false; verder.focus();
    } }, t));
    plek.replaceChildren(h('div.mf-raad', beeld, h('p', 'Wassend of afnemend?'), h('div.knop-rij', knoppen), melding, h('div.knop-rij', verder)));
  }

  const bekijk = h('div.hm',
    h('div.hm-beeld', svg),
    h('div.hm-tekst',
      h('label.doe-label.hm-schuif', h('span', 'Na nieuwe maan: ', dagUit), schuif), h('div.knop-rij', vandaagKnop),
      h('div.mf-zo', groot, h('div', h('p.doe-stil', 'Zo zie je hem vanuit Nederland:'), naam)),
      uitleg, wanneer,
      h('p.hm-noot', 'Links zie je het van bovenaf. De helft van de maan die naar de zon kijkt, is altijd licht. De boog om de maan is de helft die naar de aarde kijkt. Het stuk dat licht is én naar de aarde kijkt, zie je.')));
  const plek = h('div.mf-plek', bekijk);
  const modi = h('div.chips', { role: 'group', 'aria-label': 'Bekijken of raden' },
    keuze([['bekijk', 'Bekijk'], ['raad', 'Raad: wassend of afnemend?']], modus, (m) => { modus = m; if (m === 'raad') raad(); else plek.replaceChildren(bekijk); }));

  teken();
  return h('div.doe-maanfase', modi, plek);
}
