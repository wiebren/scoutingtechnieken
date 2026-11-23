// A packing list to tick off: a weekend camp, a camp week, or a day bag for a hike. It is a base list; each thing
// says why it comes along. Add your own things, or pick from the suggestions. Ticks and your own things stay on this
// device (localStorage), per list. Sources: SN-K niveau 1-2 (paklijst, kamptas, dagtas), a hike booklet (JMC,
// notes), and the suggestions from Scoutpedia Paklijst.
import { h } from '../../dom.js';
import { actie, acties, keuze } from '../knoppen.js';
import { icoon } from '../../iconen.js';
import '../vorm.css';
import './kamp.css';
import './paklijst.css';

const SLEUTEL = 'scoutingtechnieken.paklijst.v1';
const EIGEN = 'scoutingtechnieken.paklijst.eigen.v1';      // your own things: { lijst: [naam] }
const lees = (k = SLEUTEL) => { try { return JSON.parse(localStorage.getItem(k) ?? '{}') ?? {}; } catch { return {}; } };
const schrijf = (v, k = SLEUTEL) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* it works without */ } };

const SLAPEN = [
  ['Slaapzak', 'Warm genoeg voor de nachten van dit kamp.'],
  ['Matje of luchtbed', 'Houdt de kou van de grond weg.'],
  ['Pyjama of droge slaapkleren', 'Niet in je dagkleding slapen: die is vochtig van zweet, en dan krijg je het koud.'],
];
const KLEDING = [
  ['Ondergoed en sokken voor elke dag, plus een extra paar', 'Droge sokken tegen blaren en koude voeten.'],
  ['T-shirts en een lange broek', 'Een lange broek ook tegen teken en brandnetels.'],
  ['Warme trui of fleece', '’s Avonds koelt het af, ook in de zomer.'],
  ['Regenjas', 'Altijd mee, ook als het weerbericht droog zegt.'],
  ['Stevige schoenen, en een tweede paar', 'Natte schoenen drogen niet in één nacht.'],
  ['Pet en zonnebrand', 'Je bent de hele dag buiten.'],
  ['Uniform en das', 'Je groep zegt wanneer je ze draagt, bijvoorbeeld bij de opening.'],
];
const VERDER = [
  ['Toilettas: tandenborstel, tandpasta, zeep, kam', 'Ook op kamp houd je jezelf schoon.'],
  ['Handdoek', ''],
  ['Bord, beker, bestek en een theedoek', 'Op veel kampen neem je je eigen eetgerei mee.'],
  ['Zaklamp of hoofdlamp', 'Voor de nacht, en de weg naar de wc.'],
  ['Drinkfles', ''],
  ['Je medicijnen, en zeg het de leiding', 'Ook als je ergens allergisch voor bent.'],
];

const LIJSTEN = {
  weekend: { naam: 'Weekendkamp', items: [...SLAPEN, ...KLEDING, ...VERDER] },
  week: { naam: 'Kampweek', items: [...SLAPEN, ...KLEDING, ...VERDER,
    ['Zwemspullen', 'Als er gezwommen wordt.'],
    ['Zak voor vuile was', 'Dan blijft je schone kleding schoon en droog.'],
    ['Extra schoenen of sandalen voor op het terrein', ''],
    ['Pen en papier, of een boekje', 'Voor een logboek, of een rustig moment.'],
    ['Zakmes, als je leiding dat goed vindt', 'Je groep spreekt af wie een mes mag hebben.']] },
  dagtas: { naam: 'Dagtas voor een hike', items: [
    ['Regenjas', 'Op een hike kun je niet even naar binnen.'],
    ['Warme trui', 'Bij een pauze koel je snel af.'],
    ['Een of twee drinkflessen, vol', 'Drink onderweg genoeg, zeker als het warm is.'],
    ['Lunch en iets voor tussendoor', ''],
    ['Kaart, kompas en kaarthoekmeter', 'Of één set voor de hele patrouille.'],
    ['Pen en papier', 'Voor opdrachten en aantekeningen.'],
    ['Zaklamp', 'Als de hike langer duurt dan gedacht.'],
    ['Pleisters en een kleine EHBO-set', 'Voor blaren en schaafwondjes.'],
    ['Pet en zonnebrand', ''],
    ['Telefoon, opgeladen', 'Voor als er iets gebeurt: 112.'],
  ] },
};

// Things to add, by kind. `bij`: only for these lists (else for both camp lists).
const IDEEEN_KAMP = [
  ['Slapen', ['Kussen of kussensloop', 'Hoeslaken', 'Extra deken', 'Knuffel']],
  ['Kleding', ['Korte broek', 'Slippers', 'Waterschoenen', 'Sportschoenen en sportkleding', 'Laarzen', 'Muts en sjaal',
    'Werkkleding die vies mag worden', 'Themakleding', ['Zwemkleding en badlaken', 'weekend'], ['Zak voor vuile was', 'weekend']]],
  ['Verzorging', ['Washandje', 'Shampoo', 'Deodorant', 'Haarborstel', 'Eigen EHBO-setje', 'Maandverband of tampons',
    'Brillenkoker', 'Verzorging voor je beugel']],
  ['Verder', ['Rugzak voor de hike', 'Zakgeld, als dat mag', ['Zakmes en slijpsteen, als je leiding dat goed vindt', 'weekend'],
    ['Pen en papier', 'weekend'], 'Spelletje of boek', 'Zitlap', 'Camera', 'Etui', 'Ducttape', 'Naald en draad',
    'Rol toiletpapier', 'Sjortouw', 'Lap om je schoenen schoon te maken']],
];
const IDEEEN_DAG = [
  ['Meer mee', ['Muts en sjaal', 'Droge sokken', 'Zitlap', 'Rol toiletpapier', 'Zakgeld, als dat mag',
    'Zakmes, als je leiding dat goed vindt', 'Ducttape', 'Camera', 'Zonnebril']],
];
const ideeen = (lijst) => (lijst === 'dagtas' ? IDEEEN_DAG : IDEEEN_KAMP).map(([kop, xs]) => [kop,
  xs.filter((x) => !Array.isArray(x) || x[1] === lijst).map((x) => (Array.isArray(x) ? x[0] : x))]);

export default function paklijst({ lijst: begin = 'weekend' } = {}) {
  let lijst = begin;
  let vinkjes = lees();
  let eigen = lees(EIGEN);

  const vak = h('ul.pk-lijst');
  const telling = h('p.kd-score', { 'aria-live': 'polite' });
  const melding = h('p.doe-sr', { 'aria-live': 'polite' });
  const wis = actie('Wis alle vinkjes', 'wis', () => { vinkjes[lijst] = []; schrijf(vinkjes); teken(); }, { klein: true });
  const chips = keuze(Object.entries(LIJSTEN).map(([k, v]) => [k, v.naam]), lijst, (k) => { lijst = k; teken(); });

  // your own things: a field and a button, and the suggestions as chips
  const veld = h('input.doe-veld', { type: 'text', maxlength: 60, autocomplete: 'off', 'aria-label': 'Wat wil je nog meenemen?',
    placeholder: 'Wat wil je nog meenemen?', enterkeyhint: 'done', onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); voegToe(veld.value); } } });
  const toevoegen = h('button.knop.klein', { type: 'button', onclick: () => voegToe(veld.value) }, 'Voeg toe');
  const ideeVak = h('div.pk-ideeen');

  const mijn = () => eigen[lijst] ?? [];
  const alle = () => [...LIJSTEN[lijst].items.map(([naam]) => naam), ...mijn()];
  const gelijk = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

  function voegToe(tekst) {
    const naam = tekst.trim().replace(/\s+/g, ' ');
    if (!naam) return;
    if (alle().some((x) => gelijk(x, naam))) { melding.textContent = `${naam} staat al op de lijst.`; return; }
    eigen = { ...eigen, [lijst]: [...mijn(), naam] };
    schrijf(eigen, EIGEN);
    veld.value = '';
    melding.textContent = `${naam} staat nu op de lijst.`;
    teken();
  }
  function haalWeg(naam) {
    eigen = { ...eigen, [lijst]: mijn().filter((x) => x !== naam) };
    vinkjes = { ...vinkjes, [lijst]: (vinkjes[lijst] ?? []).filter((x) => x !== naam) };
    schrijf(eigen, EIGEN); schrijf(vinkjes);
    melding.textContent = `${naam} is van de lijst gehaald.`;
    teken();
  }

  function regel(naam, waarom, i, van) {
    const aan = new Set(vinkjes[lijst] ?? []);
    const id = `pk-${lijst}-${van}-${i}`;
    const vink = h('input', { type: 'checkbox', id, checked: aan.has(naam), onchange: () => {
      const nu = new Set(vinkjes[lijst] ?? []);
      if (vink.checked) nu.add(naam); else nu.delete(naam);
      vinkjes = { ...vinkjes, [lijst]: [...nu] };
      schrijf(vinkjes);
      tel();
    } });
    return h(`li${van === 'eigen' ? '.pk-eigen' : ''}`,
      h('label', { for: id }, vink, h('span', h('span.pk-naam', naam), waarom && h('span.pk-waarom', waarom))),
      van === 'eigen' && h('button.pk-weg', { type: 'button', 'aria-label': `Haal ${naam} van de lijst`, title: 'Haal weg', onclick: () => haalWeg(naam) },
        icoon('sluit', 'icoon klein')));
  }

  function teken() {
    vak.replaceChildren(...LIJSTEN[lijst].items.map(([naam, waarom], i) => regel(naam, waarom, i, 'basis')),
      ...mijn().map((naam, i) => regel(naam, 'Zelf toegevoegd.', i, 'eigen')));
    const op = alle();
    ideeVak.replaceChildren(...ideeen(lijst).map(([kop, xs]) => {
      const vrij = xs.filter((x) => !op.some((y) => gelijk(x, y)));
      return vrij.length ? h('div.pk-groep', h('span.pk-kop', kop),
        h('div.chips', vrij.map((x) => h('button.chip', { type: 'button', 'aria-label': `Voeg ${x} toe`, onclick: () => voegToe(x) }, `+ ${x}`)))) : null;
    }));
    tel();
  }
  function tel() {
    const op = alle();
    const n = (vinkjes[lijst] ?? []).filter((x) => op.includes(x)).length;
    const totaal = op.length;
    telling.textContent = n === totaal ? `Alles ingepakt (${totaal} van ${totaal}).` : `${n} van ${totaal} ingepakt.`;
  }

  teken();
  return h('div.kd-tekst.doe-paklijst',
    h('div.chips', { role: 'group', 'aria-label': 'Kies een lijst' }, chips),
    h('p.kd-score', 'Dit is een basislijst. Vul hem aan met wat jij of je groep nog nodig heeft.'),
    vak, telling,
    h('div.pk-toevoegen', veld, toevoegen), melding,
    h('details.pk-meer', h('summary', 'Ideeën om toe te voegen'), ideeVak),
    acties(wis),
    h('p.kd-score', 'Kijk ook op de lijst van je eigen groep. Je vinkjes en je eigen dingen blijven op dit apparaat staan.'));
}
