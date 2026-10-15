// Veiligheid en EHBO: notities/technieken/touw-kamp-natuur.md §8. EHBO alleen de basis, en doorverwijzen naar de
// EHBO-app van het Rode Kruis en een cursus (besloten 2026-10-14): geen eigen stappenplannen.

const EHBO_APP = { naam: 'EHBO-app van het Rode Kruis', url: 'https://www.rodekruis.nl/ehbo-app/' };

export default [
  { id: '112-bellen', naam: '112 bellen', ook: ['alarmeren', 'alarmnummer', 'noodnummer'], groep: 'ehbo', bron: 'TKN §8',
    uitleg: [
      'Bel 112 als er levensgevaar is of als elke seconde telt. Je wordt gevraagd of je politie, brandweer of ambulance nodig hebt.',
      '- Zeg waar je bent: een adres, of in het bos een paaltje, een coördinaat of wat je om je heen ziet.',
      '- Zeg wat er is gebeurd en hoeveel mensen gewond zijn.',
      '- Hang pas op als de meldkamer dat zegt.',
      'Geen spoed maar wel politie nodig: 0900-8844.',
    ],
    verwijs: [EHBO_APP],
    naar: [{ blad: 'rd-coordinaten' }] },
  { id: 'verdwaald', naam: 'Verdwaald', ook: ['STOP', 'de weg kwijt'], groep: 'oppad', bron: 'TKN §9',
    uitleg: [
      'Ben je de weg kwijt, onthoud dan STOP:',
      '- Stop: blijf staan, loop niet verder.',
      '- Think, denk na: waar was je het laatst zeker van?',
      '- Observe, kijk rond: wat zie en hoor je, wat staat er op de kaart?',
      '- Plan: kies dan pas wat je doet. Twijfel je, ga terug naar het laatste punt dat je zeker wist.',
    ] },
];
