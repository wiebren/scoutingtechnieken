// Oefenen: the interactive tools, which go across the categories (notities/onderwerpen.md, Gereedschappen). None
// is built yet; this page says what is coming, in the order of "Eerst bouwen". Address: #/oefenen
import { CATEGORIE } from './data/categorieen.js';
import { h } from './dom.js';
import { icoon } from './iconen.js';
import { href } from './router.js';

const GEREEDSCHAPPEN = [
  { naam: 'Codeermachine', wat: 'Tekst omzetten in een geheimschrift, morse of semafoor, en terug. Met een herkenner: welke code is dit?', in: ['geheimschrift', 'seinen'], eerst: true },
  { naam: 'Seinspeler en -trainer', wat: 'Morse als geluid, licht en trilling; semafoor met een poppetje; noodseinen en fluitsignalen. Oefenen in je eigen tempo.', in: ['seinen'], eerst: true },
  { naam: 'Stappenspeler', wat: 'Stap voor stap vooruit en achteruit door een sjorring, een vuur dat je opbouwt of een tent die je opzet.', in: ['sjorren', 'vuur', 'kamperen'] },
  { naam: 'Kompas', wat: 'Een kompas op het scherm om de grepen te oefenen, en het kompas van je telefoon.', in: ['kaart', 'tocht'] },
  { naam: 'Oefenkaart', wat: 'Een stuk topografische kaart dat ook zonder internet werkt, met coördinaten prikken, een oleaat en peillijnen.', in: ['kaart', 'tocht', 'waarnemen'] },
  { naam: 'Routevertaler', wat: 'Eén route in elke notatie: bolletje-pijltje, stripkaart, kruispuntenroute. Lees de route, en loop hem op het scherm.', in: ['tocht'] },
  { naam: 'Hemelrekenaar', wat: 'Zon, maan en sterren voor jouw plek en tijd: wanneer gaat de zon onder, waar staat de Poolster.', in: ['weer', 'kaart'] },
  { naam: 'Herkenquiz', wat: 'Plaatje naar naam en terug: knopen, spoortekens, bomen, sporen, wolken, sterrenbeelden.', in: ['touw', 'tocht', 'natuur', 'weer'] },
  { naam: 'Bouwplaat', wat: 'Slepen en neerzetten: een pionierobject met materiaallijst, een vuur, een kampterrein, een rugzak.', in: ['sjorren', 'vuur', 'kamperen'] },
  { naam: 'Keuzehulp', wat: 'Een paar vragen naar een antwoord: welke knoop, welke sjorring, mag ik hier stoken?', in: ['touw', 'sjorren', 'vuur', 'kamperen'] },
  { naam: 'Rekenhulpen', wat: 'Schaal, declinatie, RD naar GPS, flits en donder, touwsterkte.', in: ['kaart', 'weer', 'sjorren'] },
];

export function oefenenView() {
  const el = h('div.view.enkel',
    h('section.paneel',
      h('header.balk', h('div.balk-rij', h('h1', 'Oefenen'))),
      h('div.scroll', h('div.smal',
        h('p.intro', 'Hier komen de onderdelen om mee te oefenen. Ze zijn nog niet gebouwd; dit is wat er komt, met bovenaan wat het eerst komt.'),
        h('ul.gereedschappen', GEREEDSCHAPPEN.map((g) => h('li.gereedschap',
          h('div.gereedschap-kop', h('h2', g.naam), h('span.label', g.eerst ? 'komt eerst' : 'later')),
          h('p', g.wat),
          h('ul.chips', g.in.map((c) => h('li', h('a.chip.klein', { href: href('zoeken', { c }), 'data-familie': CATEGORIE[c].kleur },
            icoon(CATEGORIE[c].icoon, 'icoon klein'), CATEGORIE[c].naam)))))))))));
  return { el, update() {}, titel: () => 'Oefenen' };
}
