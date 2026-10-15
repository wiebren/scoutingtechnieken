// Seinen: notities/technieken/navigatie-en-seinen.md §4, reference/vakbronnen/BRONNEN.md (C2000).

export default [
  { id: 'morse', naam: 'Morse', ook: ['morsecode', 'morsealfabet'], en: 'Morse code', groep: 'morse', bron: 'NAV §4a',
    uitleg: [
      'Elke letter is een rijtje korte en lange tekens: punten en strepen. Een streep duurt drie keer zo lang als een punt. Je kunt het seinen met licht, geluid, een vlag of door te tikken.',
      'SOS is · · · – – – · · ·, achter elkaar als één teken.',
      'Ezelsbrug: bij de hulpwoorden is een lettergreep met een o een streep, de andere een punt.',
    ] },
  { id: 'alpien-noodsein', naam: 'Alpien noodsein', ook: ['noodsein in de bergen'], en: 'International Mountain Distress Signal', groep: 'nood', bron: 'NAV §4d',
    uitleg: [
      'Zes keer per minuut een sein (elke tien seconden), dan een minuut stil, en weer opnieuw. Met een fluit, roepen, een lamp of iets dat zwaait.',
      'Het antwoord is drie keer per minuut.',
    ] },
  { id: 'spelalfabet', naam: 'Spelalfabet', ook: ['NAVO-alfabet', 'ICAO-alfabet'], en: 'NATO phonetic alphabet', groep: 'spelalfabet', bron: 'NAV §4f',
    uitleg: [
      'Om een woord door de portofoon of telefoon te spellen zonder dat B en D door elkaar raken:',
      'Alfa · Bravo · Charlie · Delta · Echo · Foxtrot · Golf · Hotel · India · Juliett · Kilo · Lima · Mike · November · Oscar · Papa · Quebec · Romeo · Sierra · Tango · Uniform · Victor · Whiskey · X-ray · Yankee · Zulu',
    ],
    letOp: 'De Nederlandse hulpdiensten (C2000) schrijven Whisky en Juliet.' },
];
