// The legenda of the topographic map, drawn again from the Kadaster legenda TOP25raster (CC BY 4.0): the names as
// text, the signs as small SVG pictures, so both stay sharp at any size. "Bekijk" lists one group; "Raad" shows a
// sign and you choose its name out of four from the same group.
import { h } from '../dom.js';
import { keuze } from './knoppen.js';
import { GROEPEN } from './legenda/index.js';
import './vorm.css';
import './legenda.css';

const NS = 'http://www.w3.org/2000/svg';

/** One sign as an SVG element; `maat` is how many CSS pixels one unit of the drawing becomes. */
function teken(t, maat) {
  const hoog = t.h ?? 24;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 64 ${hoog}`);
  svg.setAttribute('width', 64 * maat);
  svg.setAttribute('height', hoog * maat);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'lg-teken');
  svg.innerHTML = t.teken;
  return svg;
}

const schud = (lijst) => {
  for (let i = lijst.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [lijst[i], lijst[j]] = [lijst[j], lijst[i]]; }
  return lijst;
};

export default function legenda() {
  let modus = 'bekijk';
  let groep = GROEPEN[0];
  let goed = 0; let gehad = 0;
  const plek = h('div.lg-plek');

  function bekijk() {
    plek.replaceChildren(h('ul.lg-lijst', groep.tekens.map((t) => h('li', teken(t, 2), h('span', t.naam)))));
  }

  function raad() {
    // names can repeat within a group (a sign with and without a letter), so choose among distinct names
    const namen = [...new Set(groep.tekens.map((t) => t.naam))];
    const vraag = groep.tekens[Math.floor(Math.random() * groep.tekens.length)];
    const opties = schud([vraag.naam, ...schud(namen.filter((n) => n !== vraag.naam)).slice(0, 3)]);
    const melding = h('p.doe-melding', { 'aria-live': 'polite' });
    const verder = h('button.knop.klein.hoofd', { type: 'button', hidden: true, onclick: raad }, 'Volgende');
    const knoppen = opties.map((naam) => h('button.knop.klein.lg-optie', { type: 'button', onclick: () => {
      gehad += 1;
      if (naam === vraag.naam) goed += 1;
      for (const [i, k] of knoppen.entries()) {
        k.disabled = true;
        if (opties[i] === vraag.naam) k.classList.add('goed');
        else if (k === knoppen[opties.indexOf(naam)]) k.classList.add('fout');
      }
      melding.classList.toggle('fout', naam !== vraag.naam);
      melding.textContent = `${naam === vraag.naam ? 'Goed!' : `Nee, dit is: ${vraag.naam}.`} ${goed} van de ${gehad} goed.`;
      verder.hidden = false;
      verder.focus();
    } }, naam));
    plek.replaceChildren(h('div.lg-raad',
      h('div.lg-groot', teken(vraag, 4)),
      h('p.doe-sr', 'Welk teken is dit?'),
      h('div.lg-opties', knoppen), melding, h('div.knop-rij', verder)));
  }

  const toon = () => (modus === 'bekijk' ? bekijk() : raad());
  const modi = h('div.chips', { role: 'group', 'aria-label': 'Bekijken of raden' },
    keuze([['bekijk', 'Bekijk'], ['raad', 'Raad']], modus, (m) => { modus = m; toon(); }));
  const groepen = h('div.chips', { role: 'group', 'aria-label': 'Kies een groep' },
    keuze(GROEPEN.map((g) => [g, g.titel]), groep, (g) => { groep = g; toon(); }));

  toon();
  return h('div.doe-legenda', modi, groepen, plek,
    h('p.doe-stil', 'Nagetekend naar de legenda TOP25raster van het Kadaster (CC BY 4.0). Op de kaart zelf kan een teken er iets anders uitzien.'));
}
