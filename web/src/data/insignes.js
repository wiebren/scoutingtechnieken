// The insignelaag: the insignepakket of Scouting Nederland (sept. 2025) as a lens on the bladen, and the only
// cross-section of the app (notities/onderwerpen.md, De insignelaag). Per insigne and niveau the bladen that
// belong to it, in the order of the insigne, grouped in delen. Everything in our own words: the names of the
// insignes and the niveaus are facts, the eisteksten are not ours to copy (reference/programma/BRONNEN.md).
//
// A deel has `bladen` (ids from src/data/bladen) and may have `zonderBlad`: a requirement without a blad of its
// own, one line in our own words, so the niveau is complete. `compleet: false` marks an insigne of which only the
// bladen the app already has are in: the rest is still to be filled in.

export const NIVEAUS = [
  { niveau: 1, naam: 'Niveau 1', kleur: 'geel' },
  { niveau: 2, naam: 'Niveau 2', kleur: 'oranje' },
  { niveau: 3, naam: 'Niveau 3', kleur: 'paars' },
];

export const INSIGNES = [
  { id: 'knopen', naam: 'Knopen', compleet: true,
    over: 'Knopen leggen en weten waarvoor ze dienen, en alles over het touw zelf: soorten, onderhoud en veiligheid.',
    niveaus: {
      1: { kort: 'De basisknopen leggen en uitleggen waarvoor je ze gebruikt. Weten wat natuurlijk en kunststof touw is, touw schoonhouden en opschieten, en waarom je wegblijft bij touw dat strak staat.',
        delen: [
          { titel: 'Knopen', bladen: ['mastworp', 'platte-knoop', 'schootsteek', 'halve-steek', 'slipsteek', 'paalsteek', 'achtknoop',
            'timmersteek', 'vriendschapsknoop', 'apenvuist', 'kikker-beleggen'] },
          { titel: 'Touw', bladen: ['natuur-of-kunststof'] },
          { titel: 'Herkennen', bladen: ['eindsplits', 'oogsplits', 'takeling'] },
          { titel: 'Onderhoud', bladen: ['touw-onderhoud', 'opschieten'] },
          { titel: 'Veiligheid', bladen: ['touw-onder-spanning'] },
        ] },
      2: { kort: 'De meest gebruikte knopen beheersen en toepassen, en een fluitkoord knopen. Weten hoe touw in elkaar zit, zelf touw slaan, een touw repareren en het controleren op schade.',
        delen: [
          { titel: 'Knopen', bladen: ['mastworp-voorslag', 'dubbele-schootsteek', 'derdehandsteek', 'vrachtrijdersteek', 'dubbele-achtknoop',
            'marlsteek', 'rondtorn', 'werpankersteek', 'werplijnknoop', 'scheerlijnknoop', 'turkse-knoop', 'fluitkoord'] },
          { titel: 'Touw', bladen: ['opbouw-touw', 'touwslaan', 'marlpriem'] },
          { titel: 'Repareren', bladen: ['eindsplits', 'oogsplits', 'takeling'] },
          { titel: 'Veiligheid', bladen: ['touw-controleren'] },
        ] },
      3: { kort: 'De specialistische knopen, een knopenbord met sierknopen, en knopen aan anderen leren. Touwsoorten herkennen, duurzaam omgaan met touw, en weten wat een touw kan dragen.',
        delen: [
          { titel: 'Knopen', bladen: ['trompetsteek', 'prusikknoop', 'karaaksteek', 'tonsteek', 'chirurgenknoop', 'vissersknoop', 'vlinderknoop',
            'dubbele-paalsteek', 'bunny-ears', 'constrictorknoop', 'knopenbord'],
            zonderBlad: ['Een paar knopen aan andere scouts leren.'] },
          { titel: 'Touw', bladen: ['touwsoorten', 'takeling', 'duurzaam-touw'],
            zonderBlad: ['In je groep aandacht vragen voor het hergebruiken van touw.'] },
          { titel: 'Veiligheid', bladen: ['breeksterkte'] },
        ] },
    } },
  { id: 'pionieren', naam: 'Pionieren', compleet: false,
    niveaus: { 1: { delen: [{ titel: 'Sjorringen', bladen: ['kruissjorring', 'achtsjorring'] }, { titel: 'Bouwen', bladen: ['driehoek'] }] } } },
  { id: 'navigeren', naam: 'Navigeren', compleet: false,
    niveaus: {
      1: { delen: [{ titel: 'Kaart', bladen: ['schaal', 'rd-coordinaten'] }, { titel: 'Routetechnieken', bladen: ['kruispuntenroute'] }] },
      2: { delen: [{ titel: 'Routetechnieken', bladen: ['bolletje-pijltje', 'stripkaart'] }] },
      3: { delen: [{ titel: 'Kompas', bladen: ['declinatie'] }] },
    } },
  { id: 'vuur-stoken', naam: 'Vuur stoken', compleet: false,
    niveaus: { 1: { delen: [{ titel: 'Vuur', bladen: ['vuurdriehoek'] }] } } },
  { id: 'houtbewerken', naam: 'Houtbewerken', compleet: false,
    niveaus: { 1: { delen: [{ titel: 'Veilig werken', bladen: ['mes-doorgeven', 'bloedcirkel'] }] } } },
  { id: 'kamperen', naam: 'Kamperen', compleet: false,
    niveaus: { 1: { delen: [{ titel: 'Tenten', bladen: ['tentplek'] }] } } },
  { id: 'koken', naam: 'Koken', compleet: false, niveaus: {} },
  { id: 'natuur-buitenleven', naam: 'Natuur & Buitenleven', compleet: false,
    niveaus: { 3: { delen: [{ titel: 'Sterren', bladen: ['poolster'] }] } } },
  { id: 'veilig-gezond', naam: 'Veilig & Gezond', compleet: false,
    niveaus: { 2: { delen: [{ titel: 'Alarmeren', bladen: ['112-bellen'] }, { titel: 'Seinen', bladen: ['morse'] }] } } },
];

export const INSIGNE = Object.fromEntries(INSIGNES.map((i) => [i.id, i]));

/** Where a blad is in the laag: [{ insigne, niveau }], for the card. Worked out here, the blad itself does not say. */
export const inLaag = (bladId) => INSIGNES.flatMap((i) => NIVEAUS
  .filter(({ niveau }) => i.niveaus[niveau]?.delen.some((d) => d.bladen.includes(bladId)))
  .map(({ niveau }) => ({ insigne: i, niveau })));

/** Everything that can be ticked off in a niveau: a blad by its id, a requirement without a blad by its place. */
export const afvinkbaar = (insigne, niveau) => (insigne.niveaus[niveau]?.delen ?? []).flatMap((d, i) => [
  ...d.bladen.map((id) => ({ blad: id })),
  ...(d.zonderBlad ?? []).map((tekst, j) => ({ eis: `${insigne.id}:${niveau}:${i}:${j}`, tekst })),
]);
