// Vuur: notities/technieken/touw-kamp-natuur.md §4. Regels letterlijk naar de bron (TKN §4.5).

export default [
  { id: 'vuurdriehoek', naam: 'Vuurdriehoek', en: 'fire triangle', groep: 'driehoek', bron: 'TKN §4.1',
    uitleg: 'Vuur heeft drie dingen nodig: brandstof, zuurstof en warmte. Haal er één weg en het vuur gaat uit. Water koelt, zand sluit de lucht af, en zonder hout dooft het vanzelf.' },
  { id: 'natuurbrandrisico', naam: 'Natuurbrandrisico', ook: ['natuurbrand', 'stookverbod', 'fase 1', 'fase 2'], groep: 'regels', letterlijk: true,
    bron: 'brandweer.nl/natuurbrandrisico', bronDatum: 'geraadpleegd 14-10-2026',
    uitleg: [
      'De brandweer geeft per regio aan hoe groot de kans op een natuurbrand is, in twee fasen.',
      '- Fase 1: geen extra maatregelen. Wel geldt altijd dat je voorzichtig bent met vuur in de natuur.',
      '- Fase 2: je mag hoogstwaarschijnlijk niet meer stoken, ook niet met een stookvergunning. Eigenaren van een terrein kunnen vuurkorven, fakkels en koken op hout of houtskool verbieden.',
    ],
    letOp: 'Kijk vóór je stookt op brandweer.nl wat er vandaag geldt. Het oude schema met vier fasen bestaat niet meer.',
    verwijs: [{ naam: 'Natuurbrandrisico op brandweer.nl', url: 'https://www.brandweer.nl/natuurbrandrisico/' }] },
];
