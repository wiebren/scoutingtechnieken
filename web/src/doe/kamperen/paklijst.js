// A packing list to tick off: a weekend camp, a camp week, or a day bag for a hike. Each thing says why it comes
// along. The ticks stay on this device (localStorage), per list, until you clear them. A starting point: your own
// group's list goes first. Sources: SN-K niveau 1-2 (paklijst, kamptas, dagtas) and a hike booklet (JMC, notes).
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import '../vorm.css';
import './kamp.css';
import './paklijst.css';

const SLEUTEL = 'scoutingtechnieken.paklijst.v1';
const lees = () => { try { return JSON.parse(localStorage.getItem(SLEUTEL) ?? '{}') ?? {}; } catch { return {}; } };
const schrijf = (v) => { try { localStorage.setItem(SLEUTEL, JSON.stringify(v)); } catch { /* it works without */ } };

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
  ['Uniform of das', 'Als je groep dat draagt.'],
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

export default function paklijst({ lijst: begin = 'weekend' } = {}) {
  let lijst = begin;
  let vinkjes = lees();

  const vak = h('ul.pk-lijst');
  const telling = h('p.kd-score', { 'aria-live': 'polite' });
  const wis = h('button.knop.klein', { type: 'button', onclick: () => { vinkjes[lijst] = []; schrijf(vinkjes); teken(); } }, 'Alle vinkjes weg');
  const chips = keuze(Object.entries(LIJSTEN).map(([k, v]) => [k, v.naam]), lijst, (k) => { lijst = k; teken(); });

  function teken() {
    const aan = new Set(vinkjes[lijst] ?? []);
    const items = LIJSTEN[lijst].items;
    vak.replaceChildren(...items.map(([naam, waarom], i) => {
      const id = `pk-${lijst}-${i}`;
      const vink = h('input', { type: 'checkbox', id, checked: aan.has(naam), onchange: () => {
        const nu = new Set(vinkjes[lijst] ?? []);
        if (vink.checked) nu.add(naam); else nu.delete(naam);
        vinkjes = { ...vinkjes, [lijst]: [...nu] };
        schrijf(vinkjes);
        tel();
      } });
      return h('li', h('label', { for: id }, vink, h('span', h('span.pk-naam', naam), waarom && h('span.pk-waarom', waarom))));
    }));
    tel();
  }
  function tel() {
    const n = (vinkjes[lijst] ?? []).filter((x) => LIJSTEN[lijst].items.some(([naam]) => naam === x)).length;
    const totaal = LIJSTEN[lijst].items.length;
    telling.textContent = n === totaal ? `Alles ingepakt (${totaal} van ${totaal}).` : `${n} van ${totaal} ingepakt.`;
  }

  teken();
  return h('div.kd-tekst.doe-paklijst',
    h('div.chips', { role: 'group', 'aria-label': 'Kies een lijst' }, chips),
    vak, telling, h('div.knop-rij', wis),
    h('p.kd-score', 'Een begin: kijk ook op de lijst van je eigen groep. Je vinkjes blijven op dit apparaat staan.'));
}
