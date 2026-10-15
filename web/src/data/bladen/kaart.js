// Kaart en kompas: notities/technieken/navigatie-en-seinen.md §1, reference/vakbronnen/BRONNEN.md.

export default [
  { id: 'schaal', naam: 'Schaal', ook: ['1:25.000', '1:50.000', 'kaartschaal'], en: 'scale', groep: 'kaartlezen', bron: 'NAV §1',
    uitleg: [
      'De schaal zegt hoeveel kleiner de kaart is dan het echt is.',
      '- 1:25.000: 1 cm op de kaart is 250 m echt; 4 cm is een kilometer.',
      '- 1:50.000: 1 cm is 500 m; 2 cm is een kilometer.',
    ] },
  { id: 'rd-coordinaten', naam: 'RD-coördinaten', ook: ['Rijksdriehoek', 'rijksdriehoeksmeting', 'RD-grid'], groep: 'coordinaten', bron: 'NAV §1',
    uitleg: [
      'Het Nederlandse coördinatenrooster, met de lijnen op de topografische kaart. Een coördinaat is twee getallen in meters: eerst x, van west naar oost, dan y, van zuid naar noord.',
      'Ezelsbrug: eerst het huisje in (naar rechts), dan het trapje op (omhoog).',
      'Het nulpunt ligt buiten Nederland, zodat alle getallen positief zijn. De toren van de Onze-Lieve-Vrouwekerk in Amersfoort staat op 155.000, 463.000.',
    ] },
  { id: 'declinatie', naam: 'Declinatie', ook: ['miswijzing', 'magnetisch noorden'], en: 'magnetic declination', groep: 'noorden', bron: 'NAV §1, WMM-2025', bronDatum: '2025',
    uitleg: [
      'Het verschil tussen het ware noorden en het magnetische noorden, waar je kompasnaald naar wijst.',
      'In Nederland wijst de naald nu 2,4° (Zeeland) tot 3,1° (Groningen) oostelijk van het ware noorden. Dat verandert langzaam, elk jaar een beetje.',
      'Op een korte tocht merk je het weinig: 3° is over een kilometer ongeveer 50 m opzij.',
    ],
    letOp: 'Oudere boeken en sites geven een westelijke declinatie. Die is verouderd.' },
];
