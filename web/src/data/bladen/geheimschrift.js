// Geheimschriften: notities/technieken/navigatie-en-seinen.md §5.

export default [
  { id: 'verschuivingscode', naam: 'Verschuivingscode', ook: ['Caesar', 'Caesarcode'], en: 'Caesar cipher', groep: 'vervangen', bron: 'NAV §5',
    uitleg: 'Elke letter schuif je een vast aantal plaatsen op in het alfabet. Met drie wordt A een D, B een E, en X, Y, Z worden A, B, C. Ontcijferen doe je door terug te schuiven.' },
  { id: 'a-is-1', naam: 'A=1', ook: ['lettercijfercode', 'A1Z26'], groep: 'cijfers', bron: 'NAV §5',
    uitleg: 'Elke letter wordt het nummer van zijn plaats in het alfabet: A = 1, B = 2, tot Z = 26. Zet streepjes tussen de getallen, anders weet je niet of 12 nu AB is of L.' },
];
