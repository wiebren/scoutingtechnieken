// 112, huisarts of zelf? Short situations, and four choices: 112, spoedcontact with the huisarts or the
// huisartsenpost, the huisarts (no rush, but a doctor should look), or helping yourself. The answers follow the
// Nederlandse Richtlijnen Eerste Hulp 2026 (versie 2); what to do then is in the EHBO-app, not here.
import { h } from '../../dom.js';
import { schud } from './hulp.js';
import './wn.css';
import './huisartsof112.css';

// [key, button text, the answer in a sentence]
const KEUZES = [
  ['112', '112 bellen', '112 bellen'],
  ['spoed', 'Spoed: huisarts of huisartsenpost', 'spoedcontact met de huisarts of de huisartsenpost'],
  ['huisarts', 'Huisarts bellen', 'de huisarts bellen'],
  ['zelf', 'Zelf helpen', 'zelf helpen'],
];
const GEVALLEN = [
  ['Iemand is gevallen en reageert niet meer als je hem aanspreekt.', '112', 'Bewusteloos is altijd 112.'],
  ['Na een verzwikte enkel kan iemand geen vier stappen lopen zonder hulp.', 'huisarts', 'Een arts moet kijken of er iets gebroken is: bel de huisarts, of buiten kantoortijd de huisartsenpost.'],
  ['Een bloedneus door een bal tegen het gezicht.', 'spoed', 'Een bloedneus door een klap of stoot: spoedcontact, want de neus kan gebroken zijn.'],
  ['Een bloedneus, zomaar. Na 10 minuten dichtknijpen is hij gestopt.', 'zelf', 'Gestopt: nog een halfuur rustig aan doen.'],
  ['Een wesp stak iemand in de mond, en hij wordt benauwd.', '112', 'Een steek in de mond of keel, of een heftige allergische reactie: 112.'],
  ['Je haalt een teek weg die er een paar uur in zat.', 'zelf', 'Eruit, ontsmetten, de datum opschrijven en de plek 3 maanden in de gaten houden.'],
  ['Drie weken na een tekenbeet zit er een rode ring om de plek die groter wordt.', 'huisarts', 'Een vlek of ring die groter wordt na een tekenbeet: naar de huisarts.'],
  ['Na een warme dag lopen is iemand suf en verward, en loopt hij wankel.', '112', 'Dat kan een hitteberoerte zijn: 112.'],
  ['Hoofdpijn en misselijk door de hitte. Na 20 minuten koelen is het niet beter.', 'spoed', 'Niet beter na 20 minuten: spoedcontact met de huisarts.'],
  ['Een schaafwond op je knie, goed schoongespoeld.', 'zelf', 'Afdekken is genoeg. Is je laatste tetanusprik meer dan 10 jaar geleden, of weet je het niet? Vraag het dan aan de huisarts.'],
  ['Een wond die maar blijft bloeden.', 'spoed', 'Een wond die blijft bloeden, of waarin iets vastzit: spoedcontact.'],
  ['Je raakte een hete pan: een rood plekje op je vinger.', 'zelf', 'Koelen met lauw, zacht stromend water, 10 tot 20 minuten.'],
  ['Een brandwond op je arm met blaren, na een steekvlam.', 'spoed', 'Een brandwond die verder gaat dan rode huid: spoedcontact. Is hij groot of ernstig: 112.'],
  ['Iemand viel in koud water, rilt niet meer en wordt suf.', '112', 'Suf worden bij onderkoeling: 112.'],
  ['Een been is gebroken: je ziet het bot door de huid.', '112', 'Een open breuk, en een gebroken been: 112.'],
  ['Na een val doet je pols pijn en is hij dik. Misschien is hij gebroken.', 'huisarts', 'Een mogelijke breuk van een hand of arm: de huisarts of de huisartsenpost.'],
];

export default function huisartsOf112() {
  let rij = []; let nu = null;
  let goed = 0; let gedaan = 0;

  const vraag = h('p.ho-vraag', { 'aria-live': 'polite' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const score = h('p.wn-score');
  const knoppen = KEUZES.map(([k, n]) => h('button.knop.ho-keuze', { type: 'button', 'data-k': k, onclick: () => kies(k) }, n));
  const verder = h('button.knop.hoofd.klein', { type: 'button', onclick: nieuw, hidden: true }, 'Volgende');
  const el = h('div.wn.doe-huisartsof112',
    vraag, h('div.ho-keuzes', { role: 'group', 'aria-label': 'Wat doe je?' }, knoppen), melding, h('div.knop-rij', verder), score,
    h('p.doe-stil', 'Twijfel je, bel dan: de huisarts of 112 helpt je kiezen.'));

  function kies(k) {
    if (!nu || verder.hidden === false) return;
    const [, juist, uitleg] = nu;
    gedaan += 1; if (k === juist) goed += 1;
    knoppen.forEach((b) => { b.disabled = true; b.classList.toggle('juist', b.dataset.k === juist); b.classList.toggle('mis', b.dataset.k === k && k !== juist); });
    melding.classList.toggle('fout', k !== juist);
    melding.textContent = `${k === juist ? 'Goed.' : `Nee. Beter: ${KEUZES.find(([x]) => x === juist)[2]}.`} ${uitleg}`;
    score.textContent = `${goed} van de ${gedaan} goed.`;
    verder.hidden = false;
    verder.focus({ preventScroll: true });
  }

  function nieuw() {
    if (!rij.length) rij = schud(GEVALLEN.filter((g) => g !== nu));
    nu = rij.pop();
    vraag.textContent = nu[0];
    knoppen.forEach((b) => { b.disabled = false; b.classList.remove('juist', 'mis'); });
    melding.textContent = ''; verder.hidden = true;
  }

  nieuw();
  return el;
}
