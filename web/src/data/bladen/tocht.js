// Tochttechnieken: notities/technieken/navigatie-en-seinen.md §2, in the Dutch meaning where Flemish differs.

export default [
  { id: 'kruispuntenroute', naam: 'Kruispuntenroute', ook: ['KP-route'], groep: 'kruispunt', bron: 'NAV §2b',
    uitleg: 'Elk kruispunt staat getekend zoals je het tegenkomt, met een pijl voor de weg die je neemt. Je komt altijd van onderen het kruispunt op.',
    naar: [{ blad: 'bolletje-pijltje' }] },
  { id: 'bolletje-pijltje', naam: 'Bolletje-pijltje', ook: ['bolletje-pijl'], groep: 'kruispunt', bron: 'NAV §2b',
    uitleg: [
      'Per kruispunt een tekentje: het bolletje is het kruispunt waar je aankomt, de pijl de weg die je neemt, en korte streepjes de wegen die je laat liggen.',
      'Je leest de tekentjes van links naar rechts, zoals tekst.',
    ],
    naar: [{ blad: 'kruispuntenroute' }, { blad: 'stripkaart' }] },
  { id: 'stripkaart', naam: 'Stripkaart', ook: ['strippenkaart', 'visgraat'], groep: 'lijn', bron: 'NAV §2c',
    uitleg: 'Je route is een rechte lijn van onder naar boven. De zijwegen die je laat liggen staan als korte streepjes links of rechts. Je volgt de lijn en telt de zijwegen af.',
    naar: [{ blad: 'bolletje-pijltje' }] },
];
