// The categories of Zoeken and their chips (groepen), in this order: notities/onderwerpen.md, Overzicht. Every
// blad is in exactly one category and one groep; the categories are how Zoeken is laid out, nothing more. `kleur`
// is a family of categories that belong together (src/style.css, --fam-*), `icoon` a key of src/iconen.js.
// `nogNiet` says, on a blad without uitleg, where that uitleg is still to come from.

export const CATEGORIEEN = [
  { id: 'touw', naam: 'Touw en knopen', kleur: 'touw', icoon: 'touw',
    nogNiet: 'De stappen en animaties van de knopen komen later, uit een apart project.',
    groepen: [['eindknopen', 'Eindknopen'], ['lussen', 'Lussen'], ['steken', 'Steken'], ['verbindingen', 'Verbindingen'],
      ['klem', 'Klem- en spanknopen'], ['beleggen', 'Beleggen'], ['sier', 'Sierknopen'], ['afwerken', 'Afwerken en splitsen'],
      ['touwkunde', 'Touwkunde']] },
  { id: 'sjorren', naam: 'Sjorren en pionieren', kleur: 'touw', icoon: 'sjorren',
    groepen: [['sjorringen', 'Sjorringen'], ['takels', 'Takels en katrollen'], ['verankeren', 'Verankeren'], ['materiaal', 'Materiaal'],
      ['constructies', 'Bouwwerken'], ['touwbanen', 'Touwbanen'], ['krachten', 'Krachten'], ['veilig', 'Veilig bouwen']] },
  { id: 'kaart', naam: 'Kaart en kompas', kleur: 'weg', icoon: 'kaart',
    groepen: [['kaarten', 'Kaarten'], ['kaartlezen', 'Kaartlezen'], ['noorden', 'Noorden'], ['kompas', 'Kompas'],
      ['coordinaten', 'Coördinaten'], ['gps', 'GPS en digitaal'], ['zonderkompas', 'Noorden zonder kompas']] },
  { id: 'tocht', naam: 'Tochttechnieken', kleur: 'weg', icoon: 'tocht',
    groepen: [['sporen', 'Tekens onderweg'], ['spoortekens', 'Spoortekens'], ['kruispunt', 'Per kruispunt'], ['lijn', 'Lijnkaarten'],
      ['metkaart', 'Met de kaart'], ['metkompas', 'Met het kompas'], ['rally', 'Uit de rallywereld'], ['spelregels', 'Spelregels'],
      ['media', 'Media'], ['vormen', 'Tochtvormen']] },
  { id: 'waarnemen', naam: 'Waarnemen en schatten', kleur: 'weg', icoon: 'waarnemen',
    groepen: [['schatten', 'Schatten en meten'], ['schetsen', 'Schetsen'], ['water', 'Meten bij water'], ['spoorzoeken', 'Spoorzoeken'],
      ['kim', 'Kim en opmerken']] },
  { id: 'seinen', naam: 'Seinen', kleur: 'sein', icoon: 'seinen',
    groepen: [['morse', 'Morse'], ['semafoor', 'Semafoor'], ['vlaggen', 'Seinvlaggen'], ['historisch', 'Seinen van vroeger'],
      ['nood', 'Noodseinen'], ['spelalfabet', 'Spelalfabet'], ['gebaren', 'Gebaren en fluit'], ['portofoon', 'Portofoon']] },
  { id: 'geheimschrift', naam: 'Geheimschriften', kleur: 'sein', icoon: 'geheimschrift',
    groepen: [['vervangen', 'Vervangen'], ['cijfers', 'Cijfers en roosters'], ['verwisselen', 'Verwisselen'], ['verbergen', 'Verbergen'],
      ['tekens', 'Tekenalfabetten'], ['seinen', 'Seinen als code']] },
  { id: 'vuur', naam: 'Vuur', kleur: 'kamp', icoon: 'vuur',
    groepen: [['driehoek', 'Vuurdriehoek'], ['aanmaken', 'Aanmaken'], ['soorten', 'Vuursoorten'], ['hout', 'Hout'], ['doven', 'Doven'],
      ['regels', 'Regels']] },
  { id: 'koken', naam: 'Buitenkoken', kleur: 'kamp', icoon: 'koken',
    groepen: [['houtvuur', 'Op houtvuur'], ['branders', 'Branders'], ['ovens', 'Ovens'], ['water', 'Water'], ['eten', 'Eten en gezond'], ['hygiene', 'Hygiëne']] },
  { id: 'gereedschap', naam: 'Gereedschap', kleur: 'kamp', icoon: 'gereedschap',
    groepen: [['mes', 'Mes'], ['bijl', 'Bijl'], ['zaag', 'Zaag'], ['onderhoud', 'Slijpen en onderhoud'], ['sierwerk', 'Sierwerk'],
      ['regels', 'Regels']] },
  { id: 'kamperen', naam: 'Kamperen', kleur: 'kamp', icoon: 'kamperen',
    groepen: [['tenten', 'Tenten'], ['onderkomen', 'Zelf een onderkomen'], ['slapen', 'Slapen'], ['terrein', 'Kampterrein'],
      ['keuken', 'Kampkeuken'], ['sporen', 'Laat geen sporen na'], ['regels', 'Regels'], ['uitrusting', 'Uitrusting']] },
  { id: 'natuur', naam: 'Natuur', kleur: 'natuur', icoon: 'natuur',
    groepen: [['bomen', 'Bomen'], ['planten', 'Planten'], ['dieren', 'Dieren en sporen'], ['vogels', 'Vogels'],
      ['insecten', 'Insecten en teken'], ['paddenstoelen', 'Paddenstoelen'], ['materialen', 'Natuurlijke materialen'],
      ['mens', 'Mens en natuur']] },
  { id: 'weer', naam: 'Weer en hemel', kleur: 'natuur', icoon: 'weer',
    groepen: [['wolken', 'Wolken'], ['wind', 'Wind'], ['voorspellen', 'Weer voorspellen'], ['onweer', 'Onweer'],
      ['zonmaan', 'Zon en maan'], ['sterren', 'Sterren']] },
  { id: 'veiligheid', naam: 'Veiligheid en EHBO', kleur: 'veilig', icoon: 'veiligheid',
    groepen: [['oppad', 'Veilig op pad'], ['brand', 'Brand'], ['ehbo', 'EHBO']] },
];

export const CATEGORIE = Object.fromEntries(CATEGORIEEN.map((c) => [c.id, c]));

/** The label of a groep of a category. */
export const groepNaam = (categorie, groep) => CATEGORIE[categorie]?.groepen.find(([k]) => k === groep)?.[1] ?? groep;
