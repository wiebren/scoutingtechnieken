// Sjorren en pionieren: notities/technieken/touw-kamp-natuur.md §2. A first few; the sjorringen get their steps from
// the stappenspeler once the knopen side project is there (same rope).

export default [
  { id: 'kruissjorring', naam: 'Kruissjorring', en: 'square lashing', groep: 'sjorringen', bron: 'TKN §2',
    uitleg: 'Twee palen die elkaar haaks kruisen aan elkaar vastmaken. Je begint met een mastworp, legt een paar slagen om de kruising, trekt die strak met slagen tussen de palen door, en eindigt weer met een mastworp.',
    naar: [{ blad: 'mastworp' }, { blad: 'achtsjorring' }] },
  { id: 'achtsjorring', naam: 'Achtsjorring', ook: ['achtvormige sjorring', 'schaarsjorring'], en: 'shear lashing', groep: 'sjorringen', bron: 'TKN §2',
    uitleg: 'Twee palen die naast elkaar liggen aan elkaar vastmaken, met het touw in achten tussen de palen door. Daarna zet je ze als een schaar uit elkaar: zo maak je een bok.',
    naar: [{ blad: 'timmersteek' }, { blad: 'kruissjorring' }] },
  { id: 'driehoek', naam: 'Waarom een driehoek sterk is', ook: ['schoor', 'stijfheid'], groep: 'krachten', bron: 'TKN §2',
    uitleg: 'Een vierkant van palen kan scheef trekken zonder dat een paal langer of korter wordt. Een driehoek niet. Daarom zet je in een bouwwerk schuine palen, schoren, zodat er driehoeken ontstaan.' },
];
