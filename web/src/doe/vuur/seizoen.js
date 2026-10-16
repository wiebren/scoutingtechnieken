// What is in season: the groente- en fruitkalender of the Voedingscentrum (web page, read 16-10-2026; VKG VC-SZ).
// It says in which month a vegetable or fruit is for sale from the Dutch open field, a plastic tunnel or an unheated
// greenhouse. Two ways to look: per month (what is there now), or per kind (in which months). A viewer, no exercise.
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import '../vorm.css';
import './vuur.css';
import './seizoen.css';

const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

// Per month: [groente, fruit], as on the page of the Voedingscentrum.
const KALENDER = [
  ['aardpeer, boerenkool, groene selderij, knolselderij, koolraap, meiraap, paddenstoelen, pastinaak, pompoen, prei, rammenas, rode biet, rodekool, savooiekool, schorseneren, spruiten, ui, veldsla, waterkers, winterpostelein, witlof, witte kool, wortel', 'appel, peer'],
  ['boerenkool, groene selderij, knolselderij, meiraap, paddenstoelen, pastinaak, pompoen, prei, rammenas, rode biet, rodekool, savooiekool, schorseneren, spruiten, ui, veldsla, winterpostelein, witlof, witte kool, wortel', 'appel, peer'],
  ['bloemkool, boerenkool, groene selderij, knolselderij, meiraap, paddenstoelen, pastinaak, pompoen, prei, raapsteel, rabarber, radijs, rammenas, rode biet, rodekool, roodlof, savooiekool, schorseneren, snijbiet, spinazie, spruiten, ui, veldsla, winterpostelein, witlof, witte kool, wortel', 'appel, peer'],
  ['andijvie, asperge, bloemkool, groene selderij, meiraap, paddenstoelen, paksoi, pompoen, prei, raapsteel, rabarber, radijs, rode biet, roodlof, snijbiet, spinazie, spruiten, ui, waterkers, witlof, wortel', 'aardbei, appel, peer'],
  ['andijvie, asperge, bloemkool, doperwt, groene selderij, koolrabi, kropsla, meiraap, paddenstoelen, paksoi, peultjes, prei, raapsteel, rabarber, radijs, rode biet, roodlof, snijbiet, spinazie, spitskool, ui, waterkers, wortel', 'aardbei, appel, peer'],
  ['andijvie, artisjok, asperge, bloemkool, broccoli, doperwt, groene selderij, koolrabi, kropsla, meiraap, paddenstoelen, paksoi, peultjes, prei, rabarber, radijs, rode biet, savooiekool, sperziebonen, snijbiet, spinazie, spitskool, tomaat, tuinbonen, ui, venkel, waterkers, wortel', 'aardbei, abrikoos, blauwe bessen, framboos, kers, nectarine, perzik, rode bessen, zwarte bessen'],
  ['andijvie, artisjok, aubergine, bleekselderij, bloemkool, broccoli, chinese kool, courgette, doperwt, groene selderij, komkommer, koolrabi, kropsla, paddenstoelen, paksoi, paprika, peultjes, prei, rabarber, radijs, rode biet, rodekool, savooiekool, sperziebonen, snijbiet, snijboon, spinazie, spitskool, tomaat, tuinbonen, ui, venkel, waterkers, witte kool, wortel', 'aardbei, abrikoos, blauwe bessen, braam, framboos, kers, nectarine, perzik, rode bessen, zwarte bessen'],
  ['andijvie, artisjok, aubergine, bleekselderij, bloemkool, broccoli, chinese kool, courgette, groene selderij, knolselderij, komkommer, koolrabi, kropsla, mais, paddenstoelen, paksoi, paprika, pompoen, prei, raapsteel, radijs, rode biet, rodekool, savooiekool, sperziebonen, snijbiet, snijboon, spinazie, spitskool, tomaat, ui, venkel, waterkers, witte kool, wortel', 'aardbei, abrikoos, appel, blauwe bessen, braam, druif, framboos, kers, meloen, nectarine, peer, perzik, pruim, vijg, zwarte bessen'],
  ['andijvie, artisjok, aubergine, bleekselderij, bloemkool, broccoli, chinese kool, courgette, groene selderij, knolselderij, komkommer, koolrabi, kropsla, mais, paddenstoelen, paksoi, paprika, pompoen, prei, raapsteel, radijs, rammenas, rode biet, rodekool, savooiekool, schorseneren, sperziebonen, snijbiet, snijboon, spinazie, spitskool, tomaat, ui, venkel, waterkers, witte kool, wortel', 'appel, blauwe bessen, braam, druif, framboos, kiwibes, kweepeer, meloen, nectarine, peer, perzik, pruim, vijg'],
  ['andijvie, artisjok, aubergine, bleekselderij, bloemkool, boerenkool, broccoli, chinese kool, courgette, groene selderij, knolselderij, komkommer, koolrabi, kropsla, paddenstoelen, paksoi, paprika, pastinaak, pompoen, prei, raapsteel, radijs, rammenas, rode biet, rodekool, roodlof, savooiekool, schorseneren, sperziebonen, snijbiet, snijboon, spinazie, spitskool, spruiten, tomaat, ui, veldsla, venkel, waterkers, winterpostelein, witlof, witte kool, wortel', 'appel, braam, druif, framboos, kiwibes, kweepeer, meloen, peer'],
  ['aardpeer, andijvie, bleekselderij, bloemkool, boerenkool, broccoli, chinese kool, courgette, groene selderij, knolselderij, koolraap, paddenstoelen, pastinaak, pompoen, prei, raap, rammenas, rode biet, rodekool, savooiekool, schorseneren, snijbiet, spruiten, ui, veldsla, venkel, waterkers, winterpostelein, witlof, witte kool, wortel', 'appel, druif, meloen, peer'],
  ['aardpeer, andijvie, boerenkool, groene selderij, knolselderij, paddenstoelen, pastinaak, pompoen, prei, raap, rammenas, rode biet, rodekool, savooiekool, schorseneren, spruiten, ui, veldsla, waterkers, winterpostelein, witlof, witte kool, wortel', 'appel, peer'],
].map(([g, f]) => [g.split(', '), f.split(', ')]);

/** Every kind with the months (0–11) it is in season, and whether it is fruit. */
const SOORTEN = (() => {
  const kaart = new Map();
  KALENDER.forEach(([groente, fruit], m) => {
    for (const [lijst, isFruit] of [[groente, false], [fruit, true]]) {
      for (const naam of lijst) {
        if (!kaart.has(naam)) kaart.set(naam, { naam, fruit: isFruit, maanden: [] });
        kaart.get(naam).maanden.push(m);
      }
    }
  });
  return [...kaart.values()].sort((a, b) => a.naam.localeCompare(b.naam, 'nl'));
})();

/** The months as text: "april tot en met augustus", "het hele jaar", or a list of stretches. */
export function maandTekst(maanden) {
  if (maanden.length === 12) return 'het hele jaar';
  const aan = new Set(maanden);
  // start a stretch at a month that is on while the month before is off, and go round the year
  const stukken = [];
  for (let m = 0; m < 12; m++) {
    if (!aan.has(m) || aan.has((m + 11) % 12)) continue;
    let eind = m;
    while (aan.has((eind + 1) % 12)) eind = (eind + 1) % 12;
    stukken.push(m === eind ? MAANDEN[m] : `${MAANDEN[m]} tot en met ${MAANDEN[eind]}`);
  }
  return stukken.join(', en ');
}

export default function seizoen() {
  let wijze = 'maand';
  let maand = new Date().getMonth();
  let soort = SOORTEN.find((s) => s.naam === 'aardbei');

  const lijst = (titel, namen) => h('div.sz-groep', h('p.vk-kop', `${titel} (${namen.length})`),
    h('ul.sz-lijst', namen.map((n) => h('li', n))));

  const inhoud = h('div.sz-inhoud');
  const status = h('p.doe-sr', { 'aria-live': 'polite' });
  const maandChips = h('div.vk-rij', { role: 'group', 'aria-label': 'Maand' },
    keuze(MAANDEN.map((n, i) => [i, n.slice(0, 3)]), maand, (m) => { maand = m; toon(); }));
  const kiezer = h('select.doe-veld', { 'aria-label': 'Groente of fruit', onchange: (e) => { soort = SOORTEN[e.target.value]; toon(); } },
    h('optgroup', { label: 'Groente' }, SOORTEN.map((s, i) => !s.fruit && h('option', { value: i, selected: s === soort }, s.naam))),
    h('optgroup', { label: 'Fruit' }, SOORTEN.map((s, i) => s.fruit && h('option', { value: i, selected: s === soort }, s.naam))));
  const perMaand = h('div.sz-deel', maandChips);
  const perSoort = h('div.sz-deel', h('label.doe-label', h('span', 'Kies groente of fruit'), kiezer));
  const el = h('div.doe-vk.sz',
    h('div.vk-rij', { role: 'group', 'aria-label': 'Bekijk' },
      keuze([['maand', 'Per maand'], ['soort', 'Per soort']], wijze, (w) => { wijze = w; toon(); })),
    perMaand, perSoort, inhoud, status,
    h('p.doe-stil', 'Uit de groente- en fruitkalender van het Voedingscentrum: in deze maanden is het te koop uit de Nederlandse volle grond, een plastic tunnel of een kas zonder verwarming.'));

  function toon() {
    perMaand.hidden = wijze !== 'maand';
    perSoort.hidden = wijze !== 'soort';
    if (wijze === 'maand') {
      const [groente, fruit] = KALENDER[maand];
      inhoud.replaceChildren(h('p.vk-vraag', `In ${MAANDEN[maand]}`), lijst('Groente', groente), lijst('Fruit', fruit));
      status.textContent = `In ${MAANDEN[maand]}: ${groente.length} soorten groente en ${fruit.length} soorten fruit.`;
    } else {
      const aan = new Set(soort.maanden);
      inhoud.replaceChildren(
        h('ol.sz-jaar', { 'aria-hidden': 'true' }, MAANDEN.map((n, i) => h(`li${aan.has(i) ? '.aan' : ''}${i === new Date().getMonth() ? '.nu' : ''}`, n.slice(0, 3)))),
        h('p.vk-vraag', `${soort.naam[0].toUpperCase()}${soort.naam.slice(1)}: ${maandTekst(soort.maanden)}.`));
      status.textContent = `${soort.naam}: ${maandTekst(soort.maanden)}.`;
    }
  }

  toon();
  return el;
}
