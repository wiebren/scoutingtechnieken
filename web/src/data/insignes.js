// The insignelaag: the insignepakket of Scouting Nederland (sept. 2025) as a lens on the bladen, and the only
// cross-section of the app (notities/onderwerpen.md, De insignelaag). Per insigne and niveau the bladen that
// belong to it, in the order of the insigne, grouped in delen. Everything in our own words: the names of the
// insignes and the niveaus are facts, the eisteksten are not ours to copy (reference/programma/BRONNEN.md).
//
// A deel has `bladen` (ids from src/data/bladen) and may have `zonderBlad`: a requirement without a blad of its
// own, `{ k, t }`, so the niveau is complete. `t` is one line in our own words (the view labels it "opdracht"); `k` is
// its key, and what a scout's tick is stored under: `<insigne>-<niveau>-<a word or two>`, unique, never a blad id
// (scripts/check.mjs). Keep `k` when you reword, move or reorder a line. When a line goes, or its key changes, add
// the old key to OUDE_SLEUTELS (oude-sleutels.js) with where the tick goes now: the new key, or the blad that now
// covers it (and put that blad in the deel). `compleet: false` marks an insigne of which only the bladen the app
// already has are in: the rest is still to be filled in.

export const NIVEAUS = [
  { niveau: 1, naam: 'Niveau 1', kleur: 'geel' },
  { niveau: 2, naam: 'Niveau 2', kleur: 'oranje' },
  { niveau: 3, naam: 'Niveau 3', kleur: 'paars' },
];

export const INSIGNES = [
  { id: 'knopen', naam: 'Knopen', compleet: true,
    over: 'Knopen leggen en weten waarvoor ze zijn. En alles over touw: welke soorten er zijn, hoe je het onderhoudt en hoe je er veilig mee werkt.',
    niveaus: {
      1: { kort: 'De basisknopen leggen, en zeggen waarvoor je ze gebruikt. Weten wat natuurlijk touw en kunststof touw is. Touw schoonhouden en opschieten: netjes oprollen. En weten waarom je wegblijft bij touw dat strak staat.',
        delen: [
          { titel: 'Knopen', bladen: ['mastworp', 'platte-knoop', 'schootsteek', 'halve-steek', 'slipsteek', 'paalsteek', 'achtknoop',
            'timmersteek', 'vriendschapsknoop', 'apenvuist', 'kikker-beleggen'] },
          { titel: 'Touw', bladen: ['natuur-of-kunststof'] },
          { titel: 'Herkennen', bladen: ['eindsplits', 'oogsplits', 'takeling'] },
          { titel: 'Onderhoud', bladen: ['touw-onderhoud', 'opschieten'] },
          { titel: 'Veiligheid', bladen: ['touw-onder-spanning'] },
        ] },
      2: { kort: 'De knopen die je het meest gebruikt goed kunnen leggen en gebruiken, en een fluitkoord knopen. Weten hoe touw in elkaar zit, zelf touw slaan, een touw repareren en het op schade controleren.',
        delen: [
          { titel: 'Knopen', bladen: ['mastworp-voorslag', 'dubbele-schootsteek', 'derdehandsteek', 'vrachtrijdersteek', 'dubbele-achtknoop',
            'marlsteek', 'rondtorn', 'werpankersteek', 'werplijnknoop', 'scheerlijnknoop', 'turkse-knoop', 'fluitkoord', 'plattingen'] },
          { titel: 'Touw', bladen: ['opbouw-touw', 'touwslaan', 'marlpriem'] },
          { titel: 'Repareren', bladen: ['eindsplits', 'oogsplits', 'takeling'] },
          { titel: 'Veiligheid', bladen: ['touw-controleren'] },
        ] },
      3: { kort: 'De specialistische knopen, een knopenbord met sierknopen, en knopen aan anderen leren. Touwsoorten herkennen, duurzaam omgaan met touw, en weten wat een touw kan dragen.',
        delen: [
          { titel: 'Knopen', bladen: ['trompetsteek', 'prusikknoop', 'karaaksteek', 'tonsteek', 'chirurgenknoop', 'vissersknoop', 'vlinderknoop',
            'dubbele-paalsteek', 'bunny-ears', 'constrictorknoop', 'knopenbord'],
            zonderBlad: [{ k: 'knopen-3-knopen-leren', t: 'Een paar knopen aan andere scouts leren.' }] },
          { titel: 'Touw', bladen: ['touwsoorten', 'takeling', 'duurzaam-touw'],
            zonderBlad: [{ k: 'knopen-3-touw-hergebruiken', t: 'In je groep aandacht vragen voor het hergebruiken van touw.' }] },
          { titel: 'Veiligheid', bladen: ['breeksterkte'] },
        ] },
    } },
  { id: 'pionieren', naam: 'Pionieren', compleet: true,
    over: 'Bouwen met palen en touw: de sjorringen, takels en ankers, het materiaal en hoe je het onderhoudt, waarom een bouwwerk staat, en veilig bouwen.',
    niveaus: {
      1: { kort: 'De drie basissjorringen leggen en weten waarvoor je ze gebruikt, en een enkele en dubbele jol inscheren. Een klein bouwwerk maken met satéprikkers of dun rondhout. Hout en touw onderhouden, weten waarom een driehoek sterk is en hoe een blok in elkaar zit, en op je eigen veiligheid letten.',
        delen: [
          { titel: 'Sjorringen en technieken', bladen: ['kruissjorring', 'achtsjorring', 'vorksjorring', 'welke-sjorring', 'woelen', 'katrol-inscheren'] },
          { titel: 'Praktijk', bladen: ['bouw-mini'] },
          { titel: 'Onderhoud', bladen: ['touw-onderhoud', 'hout-opslag'] },
          { titel: 'Krachten en materiaal', bladen: ['driehoek', 'blok-onderdelen', 'pionierpalen', 'sjortouw'] },
          { titel: 'Veilig bouwen', bladen: ['eigen-veiligheid'] },
        ] },
      2: { kort: 'Vier sjorringen meer, en een derdehand- en vierlopertakel inscheren. Met je subgroep een eenvoudig bouwwerk maken, zoals een bank, kampkeuken, vlot of klimrek. Hout controleren en goed opslaan, een boom beschermen, hijsmateriaal kennen, en de veiligheidsrichtlijnen van Scouting Nederland uitleggen.',
        delen: [
          { titel: 'Sjorringen en technieken', bladen: ['steigersjorring', 'slingersjorring', 'halve-kruissjorring', 'diagonaalsjorring', 'derdehandtakel', 'vierlopertakel'] },
          { titel: 'Praktijk', bladen: ['bouw-tafel', 'bouw-kampkeuken', 'bouw-vlot', 'bouw-klimrek', 'bouw-evenwichtsbalk', 'bouw-balkenhindernis', 'bouw-hangladder',
            'bouw-driepoot', 'bouw-bok', 'bouw-ladder', 'bouw-eetshelter', 'bouw-poort', 'bouw-hudo', 'bouw-wip', 'bouw-reuzenkatapult', 'bouw-kruipgang', 'bouw-muurtje', 'bouw-brancard'],
            zonderBlad: [{ k: 'pionieren-2-object-bouwen', t: 'Met je subgroep een eenvoudig pionierobject bouwen.' }] },
          { titel: 'Onderhoud', bladen: ['hout-controleren', 'hout-opslag', 'boombescherming'] },
          { titel: 'Krachten en materiaal', bladen: ['hijsmateriaal', 'katteklauw', 'haaksteek', 'strop'] },
          { titel: 'Veilig bouwen', bladen: ['veiligheid-pionierobjecten', 'geen-keuring-3m', 'veilig-touwbanen', 'valdemping-toezicht', 'tuien'] },
        ] },
      3: { kort: 'De specialistische sjorringen, een zwaar grondanker, en een buikschuif of apenbrug spannen met een vierloper. Meewerken aan een groot bouwwerk met een bouw- en veiligheidsplan. Blokken onderhouden, veilige belasting rekenen, bomen tuien, veilig op hoogte werken en het materiaal keuren.',
        delen: [
          { titel: 'Sjorringen en technieken', bladen: ['polypedestrasjorring', 'woelsjorring', 'japanse-kruissjorring', 'grondanker', 'haringen-in-serie', 'dode-man',
            'bouw-apenbrug', 'vierlopertakel', 'bouw-buikschuif', 'touw-spannen', 'piket', 'boomanker', 'strop'] },
          { titel: 'Praktijk', bladen: ['bouw-uitkijktoren', 'bouw-schragenbrug', 'bouw-reuzenrad', 'bouw-veiligheidsplan', 'bouw-v-touwbrug',
            'bouw-hangbrug', 'bouw-zandlopertoren', 'bouw-vlaggenmast', 'bouw-ophaalbrug', 'bouw-draaibrug', 'bouw-familieschommel', 'bouw-vikingschip'],
            zonderBlad: [{ k: 'pionieren-3-groot-object', t: 'Meewerken aan het voorbereiden en leiden van een groot pionierobject.' }] },
          { titel: 'Onderhoud', bladen: ['blokken-onderhoud'] },
          { titel: 'Krachten en materiaal', bladen: ['veilige-belasting', 'breeksterkte', 'kracht-strak-touw', 'bomen-tuien'] },
          { titel: 'Veilig bouwen', bladen: ['werken-op-hoogte', 'materiaalkeuring', 'zekeren-touwbanen', 'oprichten-takel'] },
        ] },
    } },
  { id: 'navigeren', naam: 'Navigeren', compleet: true,
    over: 'Je weg vinden met kaart, kompas en GPS, met routetechnieken, en anderen de weg wijzen.',
    niveaus: {
      1: { kort: 'De soorten kaarten kennen. Een topografische kaart lezen: de kaart waarmee je loopt, met alle wegen, paden, bossen en huizen. Op die kaart de legenda, de schaal, de kleuren en de RD-coördinaten snappen. De delen van een kompas en de acht windrichtingen kennen. Zelf een kompas maken, en met GPS naar een punt lopen. De makkelijke routetechnieken, hoogte schatten, en een situatieschets: een tekening van bovenaf die de weg wijst. Een tocht lopen, en zelf een speurtocht uitzetten.',
        delen: [
          { titel: 'Kaart', bladen: ['wegenkaart', 'topografische-kaart', 'waterkaart', 'luchtkaart', 'legenda', 'schaal', 'rd-coordinaten'] },
          { titel: 'Kompas en GPS', bladen: ['kompas-onderdelen', 'windrichtingen-8', 'kurkkompas', 'gps-naar-coordinaat', 'gps-track', 'kaart-apps'] },
          { titel: 'Routetechnieken', bladen: ['lintjesroute', 'fotoroute', 'kruispuntenroute', 'aangezichtskruispuntenroute', 'beschrijvende-route',
            'ogenroute', 'spoortekens', 'spoortekens-natuur', 'voetjestocht'] },
          { titel: 'Schatten en schetsen', bladen: ['hoogte-potlood', 'situatieschets'] },
          { titel: 'Onderweg', bladen: ['tochtafstanden', 'speurtocht-uitzetten', 'spoor-leggen'], zonderBlad: [
            { k: 'navigeren-1-tocht-5km', t: 'Een tocht van minstens 5 km lopen of varen, met twee routetechnieken.' }] },
        ] },
      2: { kort: 'Precies werken met coördinaten en een kaarthoekmeter, je plek op de kaart vinden, en RD, WGS84 en UTM uit elkaar houden. Zestien windrichtingen, de vier kompasgrepen, en weten wanneer je kompas niet klopt. Geocachen, het noorden vinden zonder kompas, de routetechnieken met kaart en kompas, afstand schatten en een routeschets. Een langere tocht leiden en een hike uitzetten.',
        delen: [
          { titel: 'Kaart', bladen: ['kaarthoekmeter', 'positie-bepalen', 'coordinatenstelsels', 'wgs84', 'utm'] },
          { titel: 'Kompas en GPS', bladen: ['windrichtingen-16', 'greep-1', 'greep-2', 'greep-3', 'greep-4', 'kompas-onbetrouwbaar', 'geocaching', 'multicache'] },
          { titel: 'Noorden zonder kompas', bladen: ['horlogemethode', 'natuurtekens', 'zonnewijzer'] },
          { titel: 'Routetechnieken', bladen: ['stripkaart', 'aangezichtsstripkaart', 'coordinatenroute', 'kruispeiling-route', 'kompasroute', 'oleaat',
            'blinde-vlek', 'bolletjesroute', 'bolletje-pijltje'] },
          { titel: 'Schatten en schetsen', bladen: ['driehoekmethode', 'routeschets'] },
          { titel: 'Onderweg', bladen: ['hike-leiden', 'regels-natuurgebied'], zonderBlad: [
            { k: 'navigeren-2-hike-15km', t: 'Een tocht of hike van minstens 15 km lopen, en de groep de weg wijzen.' },
            { k: 'navigeren-2-hike-uitzetten', t: 'Een hike van minstens 10 km door een natuurgebied uitzetten, met drie routetechnieken van niveau 2.' }] },
        ] },
      3: { kort: 'Een lange tocht op de kaart uitzetten, met hoogtelijnen en de tijd per stuk. Tweeëndertig windrichtingen; declinatie, inclinatie en deviatie; het noorden vinden met sterren, zon, maan en schaduw, en weten waar dat tekortschiet; hoe GPS werkt. Zelf geocaches maken, de moeilijkste routetechnieken, een spoor volgen, stroomsnelheid meten en de lastige schetsen. Een zwerfhike, en navigator zijn op een meerdaagse hike.',
        delen: [
          { titel: 'Kaart', bladen: ['tocht-uitzetten', 'hoogtelijnen', 'tijd-en-afstand'] },
          { titel: 'Kompas en GPS', bladen: ['windrichtingen-32', 'declinatie', 'inclinatie', 'deviatie', 'gps-werking', 'geocaching', 'multicache', 'geocache-maken'] },
          { titel: 'Noorden zonder kompas', bladen: ['poolster', 'zon-op-onder', 'maankompas', 'schaduwstok', 'noorden-zonder-kompas'] },
          { titel: 'Routetechnieken', bladen: ['blinde-lijn', 'vectorroute', 'helikopterroute'] },
          { titel: 'Wildspoor', bladen: ['sporen-lezen', 'spoorzoeken-spel'] },
          { titel: 'Schatten en schetsen', bladen: ['stroomsnelheid', 'soorten-schetsen', 'recognografische-schets', 'panoramaschets', 'horizonschets'] },
          { titel: 'Onderweg', bladen: ['zwerftocht', 'navigator-hike'], zonderBlad: [
            { k: 'navigeren-3-zwerfhike', t: 'Meedoen aan een vrije zwerfhike van minstens 15 km, met vijf routetechnieken.' },
            { k: 'navigeren-3-andere-technieken', t: 'Na de meerdaagse hike twee andere routetechnieken noemen die ook hadden gepast.' },
            { k: 'navigeren-3-hike-uitzetten', t: 'Een hike van minstens 15 km uitzetten, met routetechnieken van niveau 2 en 3.' }] },
        ] },
    } },
  { id: 'vuur-stoken', naam: 'Vuur stoken', compleet: true,
    over: 'Een vuur veilig voorbereiden, opbouwen, aansteken en weer doven. En weten welk hout en welke brandstof je gebruikt.',
    niveaus: {
      1: { kort: 'De vuurdriehoek uitleggen. Een stookplek veilig maken, en blusmiddelen klaarzetten: spullen om mee te blussen. Weten wat je doet als je je brandt. Droog sprokkelhout zoeken, en weten waarmee je een vuur aanmaakt. Een klein piramidevuur bouwen en met lucifers aansteken. Een nepkampvuur maken, met lichtjes in plaats van vlammen. En een vuurtje doven met zand of water.',
        delen: [
          { titel: 'Vuur en veiligheid', bladen: ['vuurdriehoek', 'stookverbod', 'stookplek', 'blusmiddelen', 'brandwond'] },
          { titel: 'Materialen', bladen: ['droog-hout', 'vuur-opbouwen', 'tondel', 'aanmaakblokjes'] },
          { titel: 'Opbouw', bladen: ['piramidevuur'] },
          { titel: 'Aansteken', bladen: ['aansteken-lucifer', 'kampvuur-zonder-vuur'] },
          { titel: 'Doven', bladen: ['vuur-doven'] },
        ] },
      2: { kort: 'Weten wat wind met je vuur doet, met de vuurdriehoek uitleggen hoe branden en doven werkt, en een kleine stookplek voor je subgroep inrichten. Vaste brandstoffen kennen, ook de vervuilende. Aanmaakmateriaal uit de natuur kennen, en zelf aanmaakblokjes maken. Vijf manieren om een vuur op te bouwen, aansteken met één lucifer, en vuur maken zonder lucifers. Doven op meer manieren, met één mok water, en kolen bewaren tot de ochtend.',
        delen: [
          { titel: 'Vuur en veiligheid', bladen: ['wind-en-vuur', 'vuurdriehoek', 'hoe-hout-brandt', 'stookplek'] },
          { titel: 'Materialen', bladen: ['brandstoffen', 'schoon-stoken', 'tondel', 'veerstok', 'aanmaakblokjes'] },
          { titel: 'Opbouw', bladen: ['piramidevuur', 'blokhutvuur', 'pagodevuur', 'stervuur', 'zwitserse-methode', 'soorten-vuren'] },
          { titel: 'Aansteken', bladen: ['aansteken-lucifer', 'zonder-lucifers'] },
          { titel: 'Doven', bladen: ['vuur-doven', 'kolen-bewaren'] },
        ] },
      3: { kort: 'De vuurvijfhoek kennen, een complete kampvuurplek veilig inrichten, en de soorten brandwonden kennen. Brandbare vloeistoffen en hun gevaren, welk hout hoe brandt en welk het schoonst, en zelf houtskool of charcloth maken. Vuren voor verschillende doelen, ook een grondvuur en een vuur op werkhoogte. Een kampvuur spectaculair aansteken, de vuurrol, en bijzondere vuren zoals een Lets vuur en een Zweedse fakkel. Een vuur doven en de warmte meenemen.',
        delen: [
          { titel: 'Vuur en veiligheid', bladen: ['stookplek', 'natuurbrandrisico', 'wind-en-vuur', 'blusmiddelen', 'brandwond', 'vuurvijfhoek'] },
          { titel: 'Materialen', bladen: ['brandstoffen', 'welk-hout', 'schoon-stoken', 'charcloth'] },
          { titel: 'Vuursoorten', bladen: ['jagersvuur', 'sleutelgatvuur', 'reflectorvuur', 'greppelvuur', 'dakotavuur', 'tafelvuur', 'fins-logvuur', 'soorten-vuren'] },
          { titel: 'Aansteken', bladen: ['lets-vuur', 'zweedse-fakkel', 'blikvuur', 'kampvuur-op-afstand', 'vuurrol', 'kaarsvetfakkel'] },
          { titel: 'Doven', bladen: ['vuur-doven', 'gloed-meenemen'] },
        ] },
    } },
  { id: 'houtbewerken', naam: 'Houtbewerken', compleet: true,
    over: 'Veilig snijden, hakken en zagen, je gereedschap onderhouden, en iets moois van hout maken.',
    niveaus: {
      1: { kort: 'Veilig met een zakmes omgaan. Je kent de delen en de beveiliging, je klapt het mes veilig open en je geeft het veilig door. Je gebruikt elk deel waarvoor het bedoeld is. Een broodstok schillen: je beweegt de stok, niet het mes. Een bijl veilig doorgeven, en weten hoeveel ruimte je nodig hebt. Met een figuurzaag werken. Weten welk hout je mag gebruiken. Je zakmes schoonmaken, en eenvoudig snijwerk maken.',
        delen: [
          { titel: 'Mes', bladen: ['zakmes', 'mes-doorgeven', 'van-je-af-snijden', 'scouting-messen', 'stokbrood'] },
          { titel: 'Bijl', bladen: ['bijl-doorgeven', 'bloedcirkel'] },
          { titel: 'Zaag', bladen: ['zagen-houtbewerking'] },
          { titel: 'Kennis en onderhoud', bladen: ['hout-voor-snijwerk', 'mes-onderhoud'] },
          { titel: 'Sierwerk', bladen: ['snijwerk'] },
        ] },
      2: { kort: 'De snijgrepen beheersen en er een tentharing mee snijden. Met een handbijl een stammetje doorhakken met een V, weten waar je op let en wat het lastig maakt, en soorten handbijlen kennen. Met een beugelzaag werken en een schijf van een stam zagen. Weten welk hout je wel en niet gebruikt, een zakmes slijpen, en bijlen en zagen opbergen. Een werkstuk van vers hout maken en afwerken.',
        delen: [
          { titel: 'Mes', bladen: ['snijgrepen', 'tentharing-snijden'] },
          { titel: 'Bijl', bladen: ['bijl-controleren', 'hakken', 'soorten-bijlen', 'regels-bijl-zaag'] },
          { titel: 'Zaag', bladen: ['beugelzaag', 'zagen-soorten'] },
          { titel: 'Kennis en onderhoud', bladen: ['hout-voor-snijwerk', 'mes-slijpen', 'bijl-onderhoud'] },
          { titel: 'Sierwerk', bladen: ['snijwerk'] },
        ] },
      3: { kort: 'Een oefenstok (Trystick) maken en de sneden erin uitleggen, en batonneren. Met een grote bijl een stam doorhakken, met een wig werken, hout kloven, en grote bijlen kennen. Een klapzaag en een trekzaag gebruiken, alleen en met z\'n tweeën. Een bijlsteel en zaagbladen vervangen, een bijl slijpen, en gereedschap lang goed bewaren. Chip carving en kohlrosing.',
        delen: [
          { titel: 'Mes', bladen: ['oefenstok', 'batonneren'] },
          { titel: 'Bijl', bladen: ['hakken', 'kloven', 'soorten-bijlen', 'kindling-cracker', 'bomen-vellen', 'dunne-boom-omhakken'] },
          { titel: 'Zaag', bladen: ['zagen-soorten'] },
          { titel: 'Kennis en onderhoud', bladen: ['bijl-onderhoud', 'beugelzaag', 'mes-onderhoud', 'steel-en-zaagblad'] },
          { titel: 'Sierwerk', bladen: ['chip-carving'] },
        ] },
    } },
  { id: 'kamperen', naam: 'Kamperen', compleet: true,
    over: 'Inpakken, tenten en andere plekken om in te slapen, een kampterrein indelen, een kampkeuken, en schoon en gezond blijven op kamp.',
    niveaus: {
      1: { kort: 'Een paklijst maken en je eigen kamptas inpakken. Een goede tentplek kiezen, samen een tent opzetten, erin slapen en hem netjes opruimen. Een plattegrond van het terrein tekenen en de belangrijkste kampregels bedenken. Meedoen met corvee (de klussen op kamp), helpen koken en afwassen. Jezelf schoonhouden, een corveeschema maken, en afval scheiden.',
        delen: [
          { titel: 'Inpakken', bladen: ['paklijst'] },
          { titel: 'Tenten', bladen: ['tentplek', 'tent-opzetten', 'tent-afbreken'] },
          { titel: 'Kampterrein', bladen: ['kampplattegrond', 'plattegrond-op-schaal'], zonderBlad: [
            { k: 'kamperen-1-kampregels', t: 'Je eigen lijst met de belangrijkste kampregels: over hoe je met elkaar omgaat, over schoon blijven, over veiligheid en over de natuur.' }] },
          { titel: 'Kampkeuken', bladen: ['corvee', 'afwas-drie-teilen'] },
          { titel: 'Hygiëne', bladen: ['hygiene-op-kamp', 'afval-op-kamp'] },
        ] },
      2: { kort: 'Je kamptas voor een week en een dagtas inpakken, je gezondheidsformulier inleveren, en de kampspullen nakijken. Een week in een tent slapen, je eigen tent en een groepstent opzetten, slapen in een zelfgebouwd onderkomen, en een tent luchten, onderhouden en droog opbergen. Een kampterrein indelen, met de HUDO, de wasplek en de gasflessen. Een kampkeuken bouwen met een afvoerputje, en veilig met een kooktoestel werken. Vers eten en afval goed bewaren, en elke dag de hygiëne nakijken.',
        delen: [
          { titel: 'Inpakken', bladen: ['paklijst', 'dagtas', 'ehbo-set'], zonderBlad: [
            { k: 'kamperen-2-spullen-nakijken', t: 'De kampkist, de EHBO-tas en de tent van je subgroep nakijken.' }] },
          { titel: 'Kamperen', bladen: ['tent-opzetten', 'patrouilletent', 'vendeltent', 'scheerlijnen', 'frietbuil', 'afdak-shelter', 'a-frame-shelter',
            'tent-luchten', 'tent-onderhoud'], zonderBlad: [
            { k: 'kamperen-2-kamp-week', t: 'Een kamp van zeven nachten of langer, in een tent of op een vlet.' }] },
          { titel: 'Kampterrein', bladen: ['kampplattegrond', 'plattegrond-op-schaal', 'hudo', 'gasflessen-op-kamp', 'terrein-ontzien'], zonderBlad: [
            { k: 'kamperen-2-terreinafspraken', t: 'Eigen afspraken voor het terrein: hoe je er zuinig op bent, hoeveel lawaai kan, en hoe iedereen overal kan komen.' }] },
          { titel: 'Kampkeuken', bladen: ['kampkeuken', 'afvoerputje', 'branders', 'brander-gebruiken', 'gasbrander'] },
          { titel: 'Hygiëne', bladen: ['vijf-keer-veilig', 'afval-op-kamp', 'handen-wassen-koken', 'hygiene-op-kamp', 'warm-slapen'] },
        ] },
      3: { kort: 'Je rugzak voor een trekkerskamp inpakken, met je deel van de groepsspullen, en de spullen van je subgroep. Een week op expeditie, nachten in een zelfgebouwd onderkomen en in de openlucht, en allerlei tenten opzetten. Weten wanneer je veilig in een tent kookt, en tenten duurzaam onderhouden. Het terrein ontzien, en een kampeertocht in het buitenland voorbereiden. Alle kooktoestellen van je groep kennen, en eten op expeditie goed bewaren, ook zonder koelkast.',
        delen: [
          { titel: 'Inpakken', bladen: ['rugzak-inpakken'], zonderBlad: [
            { k: 'kamperen-3-subgroep-inpakken', t: 'Voor je subgroep alles inpakken wat mee moet: EHBO-spullen, versiering, spellen en de informatie over het kamp.' }] },
          { titel: 'Kamperen', bladen: ['trekkerstent', 'tarp', 'partytent', 'vendeltent', 'afdak-shelter', 'a-frame-shelter', 'openlucht-slapen', 'bivakzak',
            'tent-onderhoud', 'dektent', 'koken-in-tent', 'soorten-tenten'], zonderBlad: [
            { k: 'kamperen-3-expeditie', t: 'Zeven dagen of langer op trektocht of expeditie.' }] },
          { titel: 'Kampterrein', bladen: ['terrein-ontzien', 'laat-geen-sporen-na'], zonderBlad: [
            { k: 'kamperen-3-buitenland', t: 'Een kampeertocht in het buitenland opzetten: wat je doet, hoe je reist, waar je slaapt, en kampeerplekken zoeken die daarbij passen.' }] },
          { titel: 'Kampkeuken', bladen: ['branders', 'brander-gebruiken', 'gasbrander', 'barbecue', 'dutch-oven'] },
          { titel: 'Hygiëne', bladen: ['vijf-keer-veilig', 'drinkwater-op-kamp'], zonderBlad: [
            { k: 'kamperen-3-eten-expeditie', t: 'Op een expeditie zorgen voor het eten: inkopen, goed bewaren en meenemen.' },
            { k: 'kamperen-3-zonder-koelkast', t: 'Uitzoeken hoe je eten zonder koelkast langer goed houdt, en één manier uitproberen.' }] },
        ] },
    } },
  { id: 'koken', naam: 'Koken', compleet: true,
    over: 'Gezond en lekker koken, thuis en buiten op vuur of brander, en weten waar je eten vandaan komt.',
    niveaus: {
      1: { kort: 'Een gezond avondmenu bedenken, boodschappen doen, koken en afwassen, en koekjes bakken. Een snack op houtvuur maken. Weten in welk seizoen groente en fruit groeien, en zelf iets eetbaars kweken. De Schijf van Vijf uitleggen. Je handen wassen bij het koken, en veilig met gasstel, kookplaat en oven werken.',
        delen: [
          { titel: 'Voorbereiden en koken', bladen: ['afwas-drie-teilen'], zonderBlad: [
            { k: 'koken-1-avondmenu', t: 'Een gezond avondmenu bedenken, met een boodschappenlijst, en meehelpen met inkopen, koken en afwassen.' },
            { k: 'koken-1-koekjes', t: 'Koekjes bakken voor je speltak, met de oven.' }] },
          { titel: 'Primitief koken', bladen: ['koken-op-houtvuur', 'foliepakket'] },
          { titel: 'Voedselproductie', bladen: ['seizoen-groente-fruit', 'zelf-kweken'] },
          { titel: 'Ingrediënten', bladen: ['schijf-van-vijf'], zonderBlad: [
            { k: 'koken-1-quiz', t: 'Een quiz van twaalf vragen over gezond eten maken en spelen.' }] },
          { titel: 'Kooktechnieken', bladen: ['handen-wassen-koken', 'veilig-in-de-keuken'], zonderBlad: [
            { k: 'koken-1-keukengerei', t: 'Keukengerei verzamelen en uitleggen waarvoor je het gebruikt.' },
            { k: 'koken-1-koken-en-bakken', t: 'Koken, iets bakken in de pan en iets bakken in de oven.' }] },
        ] },
      2: { kort: 'Een complete maaltijd volgens de Schijf van Vijf bedenken, met aandacht voor diëten en allergieën, en die binnen het budget met je subgroep koken. Een receptenboekje en een taart. Koken op een andere warmtebron dan een fornuis. Uitzoeken hoe eten van de maker bij jou komt. Een week je eten bijhouden en een weekmenu volgen. Frituren en de airfryer vergelijken.',
        delen: [
          { titel: 'Voorbereiden en koken', bladen: ['allergie-en-dieet', 'schijf-van-vijf'], zonderBlad: [
            { k: 'koken-2-driegangenmaaltijd', t: 'Een maaltijd met voor-, hoofd- en nagerecht volgens de Schijf van Vijf bedenken, en die binnen het budget met je subgroep koken.' },
            { k: 'koken-2-receptenboekje', t: 'Een receptenboekje maken met die maaltijd en vier kamprecepten.' },
            { k: 'koken-2-taart', t: 'Een taart bakken en laten proeven.' }] },
          { titel: 'Primitief koken', bladen: ['koken-op-houtvuur', 'pan-boven-vuur', 'branders', 'brander-gebruiken', 'barbecue', 'dutch-oven'] },
          { titel: 'Voedselproductie', bladen: ['biologisch'], zonderBlad: [
            { k: 'koken-2-van-maker-tot-bord', t: 'Van vijf producten uitzoeken hoe ze van de maker bij jou komen, en wat biologisch betekent; dat presenteren aan je speltak.' }] },
          { titel: 'Ingrediënten', bladen: ['schijf-van-vijf'], zonderBlad: [
            { k: 'koken-2-eetdagboek', t: 'Een week bijhouden wat je eet, en het naast de Schijf van Vijf leggen.' },
            { k: 'koken-2-weekmenu', t: 'Een week een eigen, gevarieerd weekmenu volgen en vertellen hoe dat ging.' }] },
          { titel: 'Kooktechnieken', bladen: ['frituren-airfryer'], zonderBlad: [
            { k: 'koken-2-airfryer-maaltijd', t: 'Een (vegetarische) snack en een hele vetvrije maaltijd maken in de airfryer of de oven.' }] },
        ] },
      3: { kort: 'Een feestmaal met een thema voor minstens tien personen organiseren, en een proeverij met zelfgemaakte lekkernijen. Een hele dag op primitieve manieren koken. Je eten aanpassen om je ecologische voetafdruk te verkleinen, en koken met restjes. Etiketten, E-nummers en houdbaarheid begrijpen. Barbecueën: direct en indirect grillen, roken, en de temperatuur regelen.',
        delen: [
          { titel: 'Voorbereiden en koken', bladen: ['allergie-en-dieet'], zonderBlad: [
            { k: 'koken-3-feestmaal', t: 'Een feestmaal met voor-, hoofd- en nagerecht voor minstens tien personen organiseren, met een thema, menukaarten, een budget en een kookdraaiboek.' },
            { k: 'koken-3-proeverij', t: 'Drie soorten gebak of lekkernijen maken en een proeverij houden.' }] },
          { titel: 'Primitief koken', bladen: ['dutch-oven', 'koken-zonder-gerei', 'foliepakket', 'stokbrood', 'koken-op-houtvuur'], zonderBlad: [
            { k: 'koken-3-primitieve-dag', t: 'Een hele dag alle maaltijden op primitieve manieren koken, zoals roken, een zonnekoker of een zelfgebouwde oven.' }] },
          { titel: 'Voedselproductie', bladen: ['ecologische-voetafdruk', 'restjes'], zonderBlad: [
            { k: 'koken-3-voetafdruk', t: 'Een maand anders eten om je voetafdruk te verkleinen, en het resultaat presenteren.' },
            { k: 'koken-3-restjes', t: 'Drie nieuwe gerechten maken van restjes.' }] },
          { titel: 'Ingrediënten', bladen: ['houdbaarheid', 'e-nummers'] },
          { titel: 'Kooktechnieken', bladen: ['barbecue', 'grillen-en-roken'], zonderBlad: [
            { k: 'koken-3-rookhout', t: 'Uitproberen wat verschillende houtsoorten doen met de smaak bij het roken.' },
            { k: 'koken-3-barbecuemaaltijd', t: 'Een barbecuemaaltijd maken met minstens twee technieken.' }] },
        ] },
    } },
  { id: 'natuur-buitenleven', naam: 'Natuur & Buitenleven', compleet: true,
    over: 'De natuur ontdekken: bouwen met wat je vindt, het weer, planten, dieren en hun sporen, wat mensen met de natuur doen, en de maan en de sterren.',
    niveaus: {
      1: { kort: 'Een hut bouwen van wat je in de natuur vindt. Tien dagen een weerlogboek bijhouden: elke dag opschrijven wat voor weer het is. Daar maak je een weerbericht van. Dierensporen herkennen en natekenen. Een herbarium maken: een map met gedroogde planten van je clubhuisterrein. Zwerfafval rapen en scheiden, en weten wat er weer iets nieuws van wordt (recyclen). Weten waarom de maan van vorm verandert, en waarom je altijd dezelfde kant van de maan ziet.',
        delen: [
          { titel: 'Materialen uit de natuur', bladen: ['afdak-shelter', 'a-frame-shelter', 'bladhut'] },
          { titel: 'Weer', bladen: ['weerlogboek', 'windrichting'], zonderBlad: [
            { k: 'natuur-buitenleven-1-weerbericht', t: 'Je weerlogboek als een weerbericht laten zien aan je speltak.' }] },
          { titel: 'Bomen, planten en sporen', bladen: ['pootafdrukken', 'herbarium', 'roetafdruk', 'carbonafdruk', 'bomen-herkennen'] },
          { titel: 'De mens en de natuur', bladen: ['zwerfafval'] },
          { titel: 'Maan en sterren', bladen: ['maan-waarom', 'maanstanden', 'maan-achterkant'], zonderBlad: [
            { k: 'natuur-buitenleven-1-planetarium', t: 'Een planetarium of sterrenwacht bezoeken.' }] },
        ] },
      2: { kort: 'Vlechten met leem, verven met planten en touw draaien van brandnetels. Een weerstation bezoeken en weten hoe de meters werken. Bomen, planten en dieren rond je clubhuis onderzoeken, en dieren opsporen aan vraatsporen, braakballen en prenten. De levenscyclus van een dier. De invloed van mensen op de natuur, en je ecologische voetafdruk. Het zonnestelsel, de planeten, de maan en het noorderlicht.',
        delen: [
          { titel: 'Materialen uit de natuur', bladen: ['vlechtwerk-met-leem', 'natuurlijke-kleurstoffen', 'touw-van-brandnetel'] },
          { titel: 'Weer', bladen: ['weerstation', 'luchtdruk', 'beaufort', 'windrichting'], zonderBlad: [
            { k: 'natuur-buitenleven-2-weerstation', t: 'Een (amateur)weerstation bezoeken en je bevindingen laten zien.' }] },
          { titel: 'Bomen, planten en sporen', bladen: ['bomen-herkennen', 'bomen-determineren', 'vraatsporen', 'braakbal', 'uitwerpselen', 'pootafdrukken',
            'gipsafdruk', 'vogels-herkennen', 'gedaanteverwisseling'], zonderBlad: [
            { k: 'natuur-buitenleven-2-rond-clubhuis', t: 'Bij je clubhuis van vijf bomen, vijf planten en vijf dieren (ook uit het water) de kenmerken uitzoeken.' },
            { k: 'natuur-buitenleven-2-levenscyclus', t: 'De levenscyclus van een dier dat van gedaante verandert, zoals een kikker of een vlinder, in beeld brengen, met hoe het leeft.' }] },
          { titel: 'De mens en de natuur', bladen: ['regels-natuurgebied', 'buitencode', 'ecologische-voetafdruk'], zonderBlad: [
            { k: 'natuur-buitenleven-2-voetafdrukspel', t: 'Met je speltak een voetafdrukspel spelen of meedoen aan een plasticproject, en bedenken hoe het op kamp zuiniger kan.' }] },
          { titel: 'Maan en sterren', bladen: ['maanstanden', 'planeten', 'zonnestelsel', 'getijden', 'verduisteringen', 'noorderlicht'], zonderBlad: [
            { k: 'natuur-buitenleven-2-planetenposter', t: 'Een digitale poster van alle planeten.' }] },
        ] },
      3: { kort: 'Een mand vlechten, of spinnen of brood bakken van eigen graan. Het weer voorspellen zonder apparaten, weerspreuken toetsen, wolken herkennen, en windrichting en luchtdruk koppelen. Biotoop, ecosysteem en habitat, een biotoop bij je clubhuis, en een hike in een heel ander gebied. Lichtvervuiling of biodiversiteit aanpakken. Een sterrenkaart, de dierenriem en vallende sterren.',
        delen: [
          { titel: 'Materialen uit de natuur', bladen: ['mand-vlechten'] },
          { titel: 'Weer', bladen: ['weerspreuken', 'wolkenreeks-warmtefront', 'wolken-herkennen', 'buys-ballot', 'weerkaart', 'weersymbolen', 'wolken-ontstaan'] },
          { titel: 'Planten, dieren en hun omgeving', bladen: ['biotoop'], zonderBlad: [
            { k: 'natuur-buitenleven-3-natuurdocumentaire', t: 'Een biotoop bij je clubhuis vastleggen in een eigen natuurdocumentaire.' },
            { k: 'natuur-buitenleven-3-andere-streek', t: 'Een hike in een gebied dat heel anders is dan thuis: beschrijven wat er anders is, sporen van vijftien dieren en tien planten verzamelen en op naam brengen, en uitleggen waarom ze thuis niet voorkomen.' }] },
          { titel: 'De mens en de natuur', bladen: ['lichtvervuiling'], zonderBlad: [
            { k: 'natuur-buitenleven-3-plan-clubhuis', t: 'Een plan tegen lichtvervuiling of voor meer biodiversiteit bij je clubhuis, en de acties met je speltak uitvoeren.' }] },
          { titel: 'Sterren', bladen: ['poolster', 'grote-beer', 'kleine-beer', 'cassiopeia', 'orion', 'grote-hond', 'zuiderkruis', 'sterrenbeelden-herkennen',
            'zomerdriehoek', 'leeuw', 'tweelingen', 'stier-plejaden', 'planeten', 'sterrenhemel', 'lichtjaar', 'dierenriem', 'vallende-sterren', 'aarde-draait'] },
        ] },
    } },
  { id: 'veilig-gezond', naam: 'Veilig & Gezond', compleet: true,
    over: 'Ongelukjes voorkomen en eerste hulp geven, brandveiligheid, veilig op pad en op kamp, en een groep waar iedereen zich veilig voelt.',
    niveaus: {
      1: { kort: 'Kleine wondjes en een bloedneus verzorgen, en pleisters plakken. Weten wat je doet bij planten en dieren die prikken, steken of branden. Een vluchtplan van je clubhuis: hoe je bij brand naar buiten komt. Meedoen aan een brandoefening. Weten wat er in een EHBO-set voor een dagtocht hoort. Weten wat je doet als je een wild dier tegenkomt. Veilig zwemmen in zee, en weten wat de vlaggen op het strand betekenen. Weten wat sociale veiligheid is: dat iedereen zich veilig voelt in de groep. En hoe je een goede scout voor een ander bent.',
        delen: [
          { titel: 'EHBO', bladen: ['schaafwond', 'bloedneus', 'prikken-en-steken', 'brandnetel', 'reuzenberenklauw', 'eikenprocessierups', 'tekenbeet'], zonderBlad: [
            { k: 'veilig-gezond-1-pleisters', t: 'Pleisters knippen en plakken op lastige plekken, zoals een vingertop, een knokkel of je neus.' }] },
          { titel: 'Brandveiligheid', bladen: ['vluchtplan'], zonderBlad: [
            { k: 'veilig-gezond-1-brandoefening', t: 'Meedoen aan een brandoefening in je clubhuis, en daarna samen bespreken hoe het ging.' }] },
          { titel: 'Veilig op pad', bladen: ['ehbo-set', 'wilde-dieren-onderweg'] },
          { titel: 'Veilig op kamp', bladen: ['zwemmen-in-zee', 'strandvlaggen'], zonderBlad: [
            { k: 'veilig-gezond-1-dagje-strand', t: 'Met je speltak een dagje strand plannen dat zo goed mogelijk is voor het milieu: denk aan vervoer, eten en afval.' }] },
          { titel: 'Sociale veiligheid', bladen: [], zonderBlad: [
            { k: 'veilig-gezond-1-sociale-veiligheid', t: 'Uitleggen wat sociale veiligheid is, en een top vijf maken van wat een goede scout voor een ander doet.' },
            { k: 'veilig-gezond-1-afspraak-sfeer', t: 'Met je leiding een afspraak maken over wat jij doet voor een fijne sfeer.' }] },
        ] },
      2: { kort: 'Hitte, onderkoeling, brandwonden, blaren en splinters, en weten wanneer en hoe je 112 belt. Wat je doet bij een ontruiming, welk blusmiddel bij welke brand, een vlam in de pan doven, en veilig door rook en deuren. Een veiligheidsplan voor een hike. Een schoonmaakplan voor kamp en eten veilig bewaren. Wat een vertrouwenspersoon doet, en afspraken tegen grensoverschrijdend gedrag.',
        delen: [
          { titel: 'EHBO', bladen: ['oververhitting', 'onderkoeling', 'brandwond', 'blaren', 'splinter', '112-bellen', 'huisarts-of-112'] },
          { titel: 'Brandveiligheid', bladen: ['vluchtplan', 'bij-brand', 'blusmiddelen', 'vlam-in-de-pan', 'deur-bij-brand'] },
          { titel: 'Veilig op pad', bladen: ['veiligheidsplan-hike', 'hike-verkeer', 'verkeersongeluk', 'zichtbaar-onderweg', 'hitte', 'kou-en-nat', 'verdwaald'] },
          { titel: 'Veilig op kamp', bladen: ['hygiene-op-kamp', 'vijf-keer-veilig'], zonderBlad: [
            { k: 'veilig-gezond-2-schoonmaakplan', t: 'Een schoonmaakplan voor het kamp, met taken, hygiëneregels en milieuvriendelijke schoonmaakmiddelen.' }] },
          { titel: 'Sociale veiligheid', bladen: [], zonderBlad: [
            { k: 'veilig-gezond-2-vertrouwenspersoon', t: 'Uitzoeken wat een vertrouwenspersoon bij Scouting doet, en kennismaken met die van je groep.' },
            { k: 'veilig-gezond-2-grensoverschrijdend', t: 'De afspraken van je groep over grensoverschrijdend gedrag opzoeken, en er met je speltak zelf een paar bedenken.' }] },
        ] },
      3: { kort: 'Verbanden aanleggen, een verstuiking verzorgen, wat je doet bij ernstige verslikking, de Rautekgreep en de stabiele zijligging; het best leer je dat op een EHBO-cursus. De branddriehoek, hoe brand in huis ontstaat, hoe stoffen branden, en een brandveiligheidsplan voor een groot evenement. Een veiligheidsplan voor een hike in het buitenland, en een noodbericht seinen. Duurzaamheidscoördinator op kamp. De gedragscode en de cyclus veilige groep.',
        delen: [
          { titel: 'EHBO', bladen: ['eerste-hulp-basis', 'verbanden', 'ernstige-bloeding', 'verstuiking', 'verslikking', 'verplaatsen', 'stabiele-zijligging'] },
          { titel: 'Brandveiligheid', bladen: ['vuurdriehoek', 'blusmiddelen', 'stookplek', 'stookverbod', 'vuurvijfhoek', 'brand-in-huis', 'brandbaarheid-stoffen', 'brandveiligheidsplan'], zonderBlad: [
            { k: 'veilig-gezond-3-brandveiligheidsplan', t: 'Een brandveiligheidsplan voor een groot evenement van je groep met vuur.' }] },
          { titel: 'Veilig op pad', bladen: ['veiligheidsplan-hike', 'morse', 'morse-seinmiddelen', 'semafoor', 'seinvlaggen', 'sos'], zonderBlad: [
            { k: 'veilig-gezond-3-hike-buitenland', t: 'Een veiligheidsplan voor een hike door ruig gebied in het buitenland.' }] },
          { titel: 'Veilig op kamp', bladen: ['afval-op-kamp', 'ecologische-voetafdruk'], zonderBlad: [
            { k: 'veilig-gezond-3-duurzaamheidsplan', t: 'Een duurzaamheidsplan voor het zomerkamp maken, en op kamp de duurzaamheidscoördinator zijn.' }] },
          { titel: 'Sociale veiligheid', bladen: [], zonderBlad: [
            { k: 'veilig-gezond-3-gedragscode', t: 'De gedragscode van Scouting Nederland lezen en in je eigen woorden vertellen wat ertoe doet.' },
            { k: 'veilig-gezond-3-cyclus-veilige-groep', t: 'De cyclus veilige groep bestuderen, er vragen over je speltak mee maken, en de uitkomsten presenteren.' }] },
        ] },
    } },
];

export const INSIGNE = Object.fromEntries(INSIGNES.map((i) => [i.id, i]));

/** The badge of an insigne at a niveau, from the insignebladen of Scouting Nederland (scripts/insignes.mjs). */
export const insigneBeeld = (id, niveau) => `insignes/${id}-${niveau}.webp`;

/** Where a blad is in the laag: [{ insigne, niveau }], for the card. Worked out here, the blad itself does not say. */
export const inLaag = (bladId) => INSIGNES.flatMap((i) => NIVEAUS
  .filter(({ niveau }) => i.niveaus[niveau]?.delen.some((d) => d.bladen.includes(bladId)))
  .map(({ niveau }) => ({ insigne: i, niveau })));

/** Everything that can be ticked off in a niveau: a blad by its id, a requirement without a blad by its key. */
export const afvinkbaar = (insigne, niveau) => (insigne.niveaus[niveau]?.delen ?? []).flatMap((d) => [
  ...d.bladen.map((id) => ({ blad: id })),
  ...(d.zonderBlad ?? []).map(({ k, t }) => ({ eis: k, tekst: t })),
]);
