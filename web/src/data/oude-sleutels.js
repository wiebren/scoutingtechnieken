// The keys of ticks that are gone, and what they are now. opslag.js applies this map once when it reads the ticks,
// so nobody loses a tick when the insignelaag (insignes.js) changes. A key maps to a zonderBlad key, a blad id, or a list
// of those; a key it maps to may itself be in the map (it is followed to the end). Never remove an entry: an old
// device can still hold the key. scripts/check.mjs checks that every entry ends at a key or blad that exists.
//
// A zonderBlad line that goes (because a blad now covers it) keeps its key here, pointing at that blad.

export const OUDE_SLEUTELS = {
  // until 2026-10-16 a zonderBlad line was ticked by its place: insigne:niveau:deel:regel
  'knopen:3:0:0': 'knopen-3-knopen-leren',
  'knopen:3:1:0': 'knopen-3-touw-hergebruiken',
  'pionieren:2:1:0': 'pionieren-2-object-bouwen',
  'pionieren:3:1:0': 'pionieren-3-groot-object',
  'navigeren:1:4:0': 'navigeren-1-tocht-5km',
  'navigeren:2:5:0': 'navigeren-2-hike-15km',
  'navigeren:2:5:1': 'navigeren-2-hike-uitzetten',
  'navigeren:3:6:0': 'navigeren-3-zwerfhike',
  'navigeren:3:6:1': 'navigeren-3-andere-technieken',
  'navigeren:3:6:2': 'navigeren-3-hike-uitzetten',
  'vuur-stoken:3:0:0': 'vuur-stoken-3-vuurvijfhoek',
  'vuur-stoken:3:0:1': 'vuur-stoken-3-brandwonden',
  'vuur-stoken:3:3:0': 'vuur-stoken-3-spectaculair',
  'vuur-stoken:3:3:1': 'vuur-stoken-3-vuurrol',
  'vuur-stoken:3:4:0': 'vuur-stoken-3-gloed',
  'houtbewerken:2:0:0': 'houtbewerken-2-tentharing',
  'houtbewerken:2:2:0': 'houtbewerken-2-schijf-zagen',
  'houtbewerken:3:1:0': 'houtbewerken-3-kindling-cracker',
  'houtbewerken:3:3:0': 'houtbewerken-3-steel-zaagblad',
  'kamperen:1:2:0': 'kamperen-1-kampregels',
  'kamperen:2:0:0': 'kamperen-2-spullen-nakijken',
  'kamperen:2:1:0': 'kamperen-2-kamp-week',
  'kamperen:2:2:0': 'kamperen-2-terreinafspraken',
  'kamperen:3:0:0': 'kamperen-3-subgroep-inpakken',
  'kamperen:3:1:0': 'kamperen-3-expeditie',
  'kamperen:3:1:1': 'kamperen-3-koken-in-tent',
  'kamperen:3:2:0': 'kamperen-3-buitenland',
  'kamperen:3:4:0': 'kamperen-3-eten-expeditie',
  'kamperen:3:4:1': 'kamperen-3-zonder-koelkast',
  'koken:1:0:0': 'koken-1-avondmenu',
  'koken:1:0:1': 'koken-1-koekjes',
  'koken:1:2:0': 'koken-1-seizoen',
  'koken:1:2:1': 'koken-1-kweken',
  'koken:1:3:0': 'koken-1-schijf-van-vijf',
  'koken:1:3:1': 'koken-1-quiz',
  'koken:1:4:0': 'koken-1-keukengerei',
  'koken:1:4:1': 'koken-1-veilig-koken',
  'koken:1:4:2': 'koken-1-koken-en-bakken',
  'koken:2:0:0': 'koken-2-driegangenmaaltijd',
  'koken:2:0:1': 'koken-2-receptenboekje',
  'koken:2:0:2': 'koken-2-taart',
  'koken:2:2:0': 'koken-2-van-maker-tot-bord',
  'koken:2:3:0': 'koken-2-eetdagboek',
  'koken:2:3:1': 'koken-2-weekmenu',
  'koken:2:4:0': 'koken-2-frituren',
  'koken:2:4:1': 'koken-2-airfryer-maaltijd',
  'koken:3:0:0': 'koken-3-feestmaal',
  'koken:3:0:1': 'koken-3-proeverij',
  'koken:3:1:0': 'koken-3-primitieve-dag',
  'koken:3:2:0': 'koken-3-voetafdruk',
  'koken:3:2:1': 'koken-3-restjes',
  'koken:3:3:0': 'koken-3-etiketten',
  'koken:3:3:1': 'koken-3-houdbaarheid',
  'koken:3:4:0': 'koken-3-grillen',
  'koken:3:4:1': 'koken-3-rookhout',
  'koken:3:4:2': 'koken-3-barbecue-temperatuur',
  'koken:3:4:3': 'koken-3-barbecuemaaltijd',
  'natuur-buitenleven:1:1:0': 'natuur-buitenleven-1-weerbericht',
  'natuur-buitenleven:1:4:0': 'natuur-buitenleven-1-planetarium',
  'natuur-buitenleven:1:4:1': 'natuur-buitenleven-1-achterkant-maan',
  'natuur-buitenleven:2:1:0': 'natuur-buitenleven-2-weerstation',
  'natuur-buitenleven:2:2:0': 'natuur-buitenleven-2-rond-clubhuis',
  'natuur-buitenleven:2:2:1': 'natuur-buitenleven-2-levenscyclus',
  'natuur-buitenleven:2:3:0': 'natuur-buitenleven-2-voetafdrukspel',
  'natuur-buitenleven:2:4:0': 'natuur-buitenleven-2-ontdekkingen',
  'natuur-buitenleven:2:4:1': 'natuur-buitenleven-2-planetenposter',
  'natuur-buitenleven:2:4:2': 'natuur-buitenleven-2-getijden',
  'natuur-buitenleven:2:4:3': 'natuur-buitenleven-2-noorderlicht',
  'natuur-buitenleven:2:4:4': 'natuur-buitenleven-2-zon-en-maan',
  'natuur-buitenleven:3:1:0': 'natuur-buitenleven-3-wolken',
  'natuur-buitenleven:3:2:0': 'natuur-buitenleven-3-natuurdocumentaire',
  'natuur-buitenleven:3:2:1': 'natuur-buitenleven-3-andere-streek',
  'natuur-buitenleven:3:3:0': 'natuur-buitenleven-3-plan-clubhuis',
  'natuur-buitenleven:3:4:0': 'natuur-buitenleven-3-sterrenkaart',
  'natuur-buitenleven:3:4:1': 'natuur-buitenleven-3-dierenriem',
  'natuur-buitenleven:3:4:2': 'natuur-buitenleven-3-dichtste-ster',
  'natuur-buitenleven:3:4:3': 'natuur-buitenleven-3-vallende-ster',
  'natuur-buitenleven:3:4:4': 'natuur-buitenleven-3-aarde-draait',
  'veilig-gezond:1:0:0': 'veilig-gezond-1-pleisters',
  'veilig-gezond:1:1:0': 'veilig-gezond-1-brandoefening',
  'veilig-gezond:1:3:0': 'veilig-gezond-1-dagje-strand',
  'veilig-gezond:1:4:0': 'veilig-gezond-1-sociale-veiligheid',
  'veilig-gezond:1:4:1': 'veilig-gezond-1-afspraak-sfeer',
  'veilig-gezond:2:0:0': 'veilig-gezond-2-brandwonden',
  'veilig-gezond:2:1:0': 'veilig-gezond-2-deur-openen',
  'veilig-gezond:2:3:0': 'veilig-gezond-2-schoonmaakplan',
  'veilig-gezond:2:4:0': 'veilig-gezond-2-vertrouwenspersoon',
  'veilig-gezond:2:4:1': 'veilig-gezond-2-grensoverschrijdend',
  'veilig-gezond:3:0:0': 'veilig-gezond-3-verbanden',
  'veilig-gezond:3:0:1': 'veilig-gezond-3-rautekgreep',
  'veilig-gezond:3:0:2': 'veilig-gezond-3-stabiele-zijligging',
  'veilig-gezond:3:1:0': 'veilig-gezond-3-brand-in-huis',
  'veilig-gezond:3:1:1': 'veilig-gezond-3-stoffen',
  'veilig-gezond:3:1:2': 'veilig-gezond-3-brandveiligheidsplan',
  'veilig-gezond:3:2:0': 'veilig-gezond-3-hike-buitenland',
  'veilig-gezond:3:3:0': 'veilig-gezond-3-duurzaamheidsplan',
  'veilig-gezond:3:4:0': 'veilig-gezond-3-gedragscode',
  'veilig-gezond:3:4:1': 'veilig-gezond-3-cyclus-veilige-groep',

  // 2026-10-16: lines a blad now covers; a tick on the line becomes a tick on the blad
  'vuur-stoken-3-vuurvijfhoek': 'vuurvijfhoek', // De vuurvijfhoek: wat er naast de drie kanten van de vuurdriehoek no…
  'vuur-stoken-3-brandwonden': 'brandwond', // Het verschil tussen een oppervlakkige, een gedeeltelijke en een vol…
  'vuur-stoken-3-spectaculair': 'kampvuur-op-afstand', // Een kampvuur op een spectaculaire manier aansteken, bijvoorbeeld op…
  'vuur-stoken-3-vuurrol': 'vuurrol', // Een vuur aansteken met de vuurrol.
  'vuur-stoken-3-gloed': 'gloed-meenemen', // Een kampvuur doven en de gloed meenemen om ergens anders opnieuw vu…
  'houtbewerken-2-tentharing': 'tentharing-snijden', // Met je mes een houten tentharing maken: puntig aan de ene kant, met…
  'houtbewerken-2-schijf-zagen': 'beugelzaag', // Een schijf van een dikke stam (15 cm of meer) zagen, zo vlak als he…
  'houtbewerken-3-kindling-cracker': 'kindling-cracker', // Een kindling cracker: wat het is, en hoe je er veilig aanmaakhout m…
  'houtbewerken-3-steel-zaagblad': 'steel-en-zaagblad', // Een nieuwe steel in een bijl zetten, en een zaagblad of het blad va…
  'kamperen-3-koken-in-tent': 'koken-in-tent', // Wanneer koken in een tent veilig kan, en wanneer niet.
  'koken-1-seizoen': 'seizoen-groente-fruit', // Van tien soorten groente of fruit uitzoeken in welk seizoen ze geoo…
  'koken-1-kweken': 'zelf-kweken', // Thuis een eetbaar plantje of kruiden kweken.
  'koken-1-schijf-van-vijf': 'schijf-van-vijf', // Wat de Schijf van Vijf is, en waarom die je helpt om gezond te eten.
  'koken-1-veilig-koken': 'veilig-in-de-keuken', // Veilig werken met een gasstel, een kookplaat en een oven.
  'koken-2-frituren': 'frituren-airfryer', // De voor- en nadelen van frituren en de airfryer, en welke olie het…
  'koken-3-etiketten': 'e-nummers', // De etiketten van vijf producten lezen en de E-nummers uitleggen.
  'koken-3-houdbaarheid': ['houdbaarheid', 'e-nummers'], // Wat conserveermiddelen zijn, hoe je bedorven eten herkent, en het v…
  'koken-3-grillen': 'grillen-en-roken', // Direct grillen, indirect grillen en roken, en wanneer je welke gebr…
  'koken-3-barbecue-temperatuur': ['barbecue', 'grillen-en-roken'], // Een barbecue opstarten en de temperatuur regelen met lucht of zones.
  'natuur-buitenleven-1-achterkant-maan': 'maan-achterkant', // Hoe het komt dat je vanaf de aarde nooit de achterkant van de maan…
  'natuur-buitenleven-2-ontdekkingen': 'zonnestelsel', // Wie ontdekte dat de aarde om de zon draait, welke planeten later ge…
  'natuur-buitenleven-2-getijden': ['getijden', 'verduisteringen'], // De maan en de getijden, springvloed, en zons- en maansverduisteringen.
  'natuur-buitenleven-2-noorderlicht': 'noorderlicht', // Wat het noorderlicht is, en waarom je het in Nederland soms ziet.
  'natuur-buitenleven-2-zon-en-maan': 'zonnestelsel', // Wat de zon en de maan doen voor het leven op aarde.
  'natuur-buitenleven-3-wolken': 'wolken-ontstaan', // Uitleggen hoe wolken ontstaan.
  'natuur-buitenleven-3-sterrenkaart': 'lichtjaar', // Een sterrenkaart maken, met zeven heldere sterren en hoeveel lichtj…
  'natuur-buitenleven-3-dierenriem': 'dierenriem', // De twaalf sterrenbeelden van de dierenriem, en wat ze met elkaar ve…
  'natuur-buitenleven-3-dichtste-ster': 'lichtjaar', // De dichtstbijzijnde ster: hoe ver hij is en in welk sterrenbeeld hi…
  'natuur-buitenleven-3-vallende-ster': 'vallende-sterren', // Waar een vallende ster vandaan komt, en in welke nachten je er veel…
  'natuur-buitenleven-3-aarde-draait': 'aarde-draait', // Hoe de aarde om haar as draait, wat dat betekent voor het leven, en…
  'veilig-gezond-2-brandwonden': 'brandwond', // De verschillende soorten brandwonden uit elkaar houden.
  'veilig-gezond-2-deur-openen': 'deur-bij-brand', // Bij brand veilig een deur openen om te kijken of er nog iemand in d…
  'veilig-gezond-3-brand-in-huis': 'brand-in-huis', // De meest voorkomende oorzaken van brand in huis, en hoe je ze voork…
  'veilig-gezond-3-stoffen': 'brandbaarheid-stoffen', // Uitzoeken en laten zien hoe goed stoffen als wol, katoen, polyester…
};

/** The keys a stored tick stands for now: the map followed to the end; a key that is not in it stays as it is. */
export function nuGeldig(key, gezien = []) {
  if (!Object.hasOwn(OUDE_SLEUTELS, key) || gezien.includes(key)) return [key];
  return [OUDE_SLEUTELS[key]].flat().flatMap((k) => nuGeldig(k, [...gezien, key]));
}
