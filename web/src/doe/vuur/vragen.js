// The question sets of the quiz (./quiz.js) and the order puzzles (./volgorde.js). A question: the question, an
// optional drawing (a name in PLAATJES), the right answer first in `keuzes` (they are shuffled), and why.
// Facts as in the bladen of vuur, koken and gereedschap (src/data/bladen/), with the same sources.

const VUREN = ['Piramidevuur', 'Blokhutvuur', 'Zwitserse methode', 'Pagodevuur', 'Stervuur', 'Jagersvuur', 'Sleutelgatvuur', 'Reflectorvuur',
  'Greppelvuur', 'Dakotavuur', 'Tafelvuur', 'Zweedse fakkel', 'Lets vuur', 'Blikvuurtje', 'Fins logvuur'];
const PLAATJE = { Piramidevuur: 'piramidevuur', Blokhutvuur: 'blokhutvuur', 'Zwitserse methode': 'zwitserse-methode', Pagodevuur: 'pagodevuur',
  Stervuur: 'stervuur', Jagersvuur: 'jagersvuur', Sleutelgatvuur: 'sleutelgatvuur', Reflectorvuur: 'reflectorvuur', Greppelvuur: 'greppelvuur',
  Dakotavuur: 'dakotavuur', Tafelvuur: 'tafelvuur', 'Zweedse fakkel': 'zweedse-fakkel', 'Lets vuur': 'lets-vuur', Blikvuurtje: 'blikvuur', 'Fins logvuur': 'fins-logvuur' };

/** The fires to pick wrong answers from, without the ones in `niet`: fires that look alike or would also be right. */
const andere = (niet) => VUREN.filter((v) => !niet.includes(v));
/** "Which fire is this?" with three other fires to choose from (picked when asked). */
const welkVuur = (naam, uitleg, niet = []) => ({ vraag: 'Welk vuur is dit?', plaatje: PLAATJE[naam], keuzes: [naam], uit: andere(niet), uitleg });
/** "Which fire suits this?" */
const waarvoor = (vraag, naam, uitleg, niet = []) => ({ vraag, keuzes: [naam], uit: andere(niet), uitleg });

export const QUIZ = {
  vuur: [
    welkVuur('Stervuur', 'Blokken als spaken van een wiel, met de punten in het vuur.'),
    welkVuur('Jagersvuur', 'Twee balken naast elkaar, wijder aan de windkant, pannen erop.'),
    welkVuur('Pagodevuur', 'Grote blokken kruislings en trapsgewijs: een groot kampvuur.', ['Blokhutvuur']),
    welkVuur('Dakotavuur', 'Een vuur in een kuil met een luchttunnel: een grondvuur.'),
    welkVuur('Reflectorvuur', 'Een scherm van blokken kaatst de warmte terug.'),
    welkVuur('Zweedse fakkel', 'Een staande stam, van boven ingezaagd, die van binnenuit brandt.'),
    welkVuur('Tafelvuur', 'Een vuur op een gesjorde tafel met zand: op werkhoogte.'),
    welkVuur('Sleutelgatvuur', 'Stoken in het ronde deel, koken op de kolen in de gleuf.'),
    welkVuur('Lets vuur', 'Een blok in vier gekloofd en weer samengebonden, met een schoorsteen in het midden.'),
    welkVuur('Zwitserse methode', 'Dik onderop, dun bovenop, en van boven aangestoken.', ['Blokhutvuur']),
    waarvoor('Je hebt maar een paar dikke blokken, en je wilt er zuinig de hele dag een kookvuur mee aanhouden.', 'Stervuur', 'Een stervuur is zuinig: je schuift de blokken steeds een stukje naar binnen.', ['Jagersvuur', 'Fins logvuur', 'Sleutelgatvuur']),
    waarvoor('Je mag niet op de grond stoken, maar wel op het terrein.', 'Tafelvuur', 'Op een gesjorde tafel met een dikke laag zand.', ['Blikvuurtje']),
    waarvoor('Je wilt de hele koude nacht een zachte, gelijkmatige warmte.', 'Fins logvuur', 'Twee stammen op elkaar gloeien heel lang.', ['Reflectorvuur', 'Stervuur']),
    waarvoor('Je wilt een groot kampvuur met veel licht.', 'Pagodevuur', 'Een pagodevuur brandt fel en geeft veel licht.', ['Blokhutvuur']),
    waarvoor('Je begint: de eerste vlammetjes moeten het hout aansteken.', 'Piramidevuur', 'Met een piramidevuur steek je aan; daarna bouw je een ander vuur.', ['Zwitserse methode', 'Blokhutvuur']),
    waarvoor('Je wilt een heet kookvuur dat je van ver bijna niet ziet.', 'Dakotavuur', 'Het brandt in een kuil, met een tunnel die lucht aanvoert.', ['Greppelvuur']),
    waarvoor('Weinig wind, droog hout, en zo min mogelijk rook bij het aansteken.', 'Zwitserse methode', 'Van boven aansteken geeft veel minder rook.', ['Blikvuurtje']),
    waarvoor('Je wilt meer pannen naast elkaar op één vuur.', 'Greppelvuur', 'In een lange greppel staan de pannen naast elkaar op de rand.', ['Jagersvuur']),
    waarvoor('Je hebt alleen een blik en dunne takjes, en wilt een liter water koken.', 'Blikvuurtje', 'Twee tot drie keer de inhoud van het blik aan takjes is genoeg.'),
  ],
  hout: [
    { vraag: 'Je wilt snel een vuur aanmaken. Welk hout pak je?', keuzes: ['Berk', 'Eik', 'Wilg', 'Populier'], uitleg: 'Berk vat snel vlam en brandt snel op.' },
    { vraag: 'Welk hout brandt lang en heet, als het goed droog is?', keuzes: ['Eik', 'Populier', 'Wilg', 'Linde'], uitleg: 'Eik is uitstekend brandhout, maar moet lang drogen.' },
    { vraag: 'Welk hout knettert en spat vonken?', keuzes: ['Den', 'Beuk', 'Es', 'Eik'], uitleg: 'De hars in naaldhout knettert en geeft vonken.' },
    { vraag: 'Welk hout brandt nog redelijk als het een beetje vochtig is?', keuzes: ['Es', 'Populier', 'Wilg', 'Linde'], uitleg: 'Es brandt regelmatig, ook als het wat vochtiger is.' },
    { vraag: 'Welk hout geeft weinig warmte?', keuzes: ['Populier', 'Beuk', 'Eik', 'Es'], uitleg: 'Populier is licht hout: een blok ervan geeft weinig warmte. Ook wilg, linde en kastanje branden slecht.' },
    { vraag: 'Wat mag nooit op het vuur?', keuzes: ['Een oude geverfde plank', 'Een dode beukentak', 'Een droge berkentak', 'Gekloofd eikenhout'], uitleg: 'Geverfd, gebeitst, gelijmd en geïmpregneerd hout is verboden: het geeft giftige stoffen.' },
    { vraag: 'Er ligt een pallet bij het vuur. Mag die erop?', keuzes: ['Nee: er zitten spijkers in, en het is bewerkt hout', 'Ja, dat is gewoon hout', 'Ja, als je hem eerst zaagt', 'Alleen als het regent'], uitleg: 'Pallets zijn bewerkt hout. Dat stook je niet.' },
    { vraag: 'Welke boom is giftig, ook als je hem stookt?', keuzes: ['Taxus', 'Berk', 'Es', 'Beuk'], uitleg: 'Taxus is giftig; stook hem nooit.' },
    { vraag: 'Twee blokken tegen elkaar klinken helder. Wat zegt dat?', keuzes: ['Ze zijn droog', 'Ze zijn nat', 'Ze zijn rot', 'Ze zijn giftig'], uitleg: 'Droog hout klinkt helder, nat hout dof.' },
    { vraag: 'Een takje buigt als je het wilt breken. Wat betekent dat?', keuzes: ['Het is nat of nog levend', 'Het is heel droog', 'Het is hard hout', 'Het brandt extra goed'], uitleg: 'Een droog takje breekt met een knap.' },
    { vraag: 'Hoe lang moet vers gekapt hout ongeveer drogen?', keuzes: ['Een tot twee jaar', 'Een week', 'Een dag in de zon', 'Niet: vers brandt het best'], uitleg: 'Vers hout is voor bijna de helft water.' },
    { vraag: 'Waarom rookt nat hout zo?', keuzes: ['Het water moet er eerst uit, en het wordt niet heet genoeg om te branden', 'Nat hout bevat meer hars', 'Water brandt met rook', 'Het brandt juist te heet'], uitleg: 'Zolang er water in zit, wordt het niet veel heter dan 100 graden.' },
  ],
  branders: [
    { vraag: 'Een brander met een potje en een windscherm eromheen, waarin je een vloeistof giet, brandt op…', keuzes: ['Spiritus', 'Gas', 'Petroleum', 'Brandtabletten'], uitleg: 'Dat is een spiritusbrander. De vlam zie je bij daglicht bijna niet.' },
    { vraag: 'Een klein opvouwbaar standaardje, met onderin een wit blokje dat je aansteekt, brandt op…', keuzes: ['Brandtabletten', 'Spiritus', 'Benzine', 'Houtskool'], uitleg: 'Dat witte blokje is een brandtablet. Je steekt het aan met een lucifer.' },
    { vraag: 'Een brander met een fles en een pomp brandt meestal op…', keuzes: ['Benzine', 'Spiritus', 'Brandtabletten', 'Takjes'], uitleg: 'Een benzinebrander zet de brandstof onder druk met een pomp.' },
    { vraag: 'Een ouderwetse primus brandt op…', keuzes: ['Petroleum', 'Gas', 'Brandtabletten', 'Spiritus'], uitleg: 'Een primus is een petroleumbrander; hij moet eerst warm worden.' },
    { vraag: 'Welke brander werkt slechter als het koud is?', keuzes: ['Gasbrander', 'Tablettenbrander', 'Houtbrander', 'Blikvuurtje'], uitleg: 'Bij kou komt er minder gas uit de bus.' },
    { vraag: 'Bij welke brander zie je de vlam overdag bijna niet?', keuzes: ['Spiritusbrander', 'Houtbrander', 'Tablettenbrander', 'Kampvuur'], uitleg: 'Een spiritusvlam is bij daglicht bijna onzichtbaar. Pas op dat je je niet brandt.' },
    { vraag: 'Mag je in je slaaptent koken op een brander?', keuzes: ['Nee, nooit: koolmonoxide', 'Ja, met de rits open', 'Ja, als het regent', 'Alleen met gas'], uitleg: 'Koolmonoxide ruik je niet, en het kan je doden.' },
    { vraag: 'Je ruikt gas. Hoe vind je het lek?', keuzes: ['Met een kwastje met afwasmiddel: waar het belletjes blaast', 'Met een aansteker', 'Door er met je neus vlakbij te gaan', 'Je hoort het altijd sissen'], uitleg: 'Nooit met een vlam zoeken.' },
    { vraag: 'Hoe oud mag een wegwerpgasbusje hooguit zijn?', keuzes: ['Drie jaar', 'Tien jaar', 'Maakt niet uit', 'Een maand'], uitleg: 'Zo zegt de brandweer het.' },
    { vraag: 'Wanneer vul je een brander bij?', keuzes: ['Als hij uit en afgekoeld is', 'Terwijl hij nog brandt', 'Als hij nog warm is, dat gaat sneller', 'Boven de vlam van een ander'], uitleg: 'Brandstof bij een vlam of een hete brander kan in één keer vlam vatten.' },
  ],
  grepen: [
    { vraag: 'Je schilt een stok voor stokbrood: grof werk, met kracht.', keuzes: ['Kniegreep', 'Versterkte greep', 'Aardappelgreep', 'Veerstokgreep'], uitleg: 'Je pols tegen je knie geeft steun; je trekt het hout langs het mes.' },
    { vraag: 'Je snijdt een klein gezichtje in een stokje: fijn werk.', keuzes: ['Versterkte greep', 'Kniegreep', 'Borstgreep', 'Batonneren'], uitleg: 'De duim van je andere hand duwt op de rug van het lemmet; je stuurt met de hand met het mes.' },
    { vraag: 'Kracht met kleine, gecontroleerde sneden, je hand tegen je borstbeen.', keuzes: ['Borstgreep', 'Aardappelgreep', 'Veerstokgreep', 'Kniegreep'], uitleg: 'Je trekt het hout langs het mes door je schouders naar achteren te bewegen.' },
    { vraag: 'Je snijdt krullen van een stokje dat rechtop op een blok staat.', keuzes: ['Veerstokgreep', 'Borstgreep', 'Aardappelgreep', 'Versterkte greep'], uitleg: 'Van boven naar beneden, van je af.' },
    { vraag: 'Zoals je een aardappel schilt, met het hout boven je duim.', keuzes: ['Aardappelgreep', 'Kniegreep', 'Borstgreep', 'Veerstokgreep'], uitleg: 'Het hout ligt boven je duim, zodat je niet in je vingers snijdt.' },
    { vraag: 'Je splijt een blokje met je mes en een stuk hout als hamer.', keuzes: ['Batonneren', 'Kloven met een bijl', 'Versterkte greep', 'Aardappelgreep'], uitleg: 'Sla op de rug van het lemmet; alleen met een stevig mes met een vast lemmet.' },
    { vraag: 'Waar houd je je andere hand als je snijdt?', keuzes: ['Achter het mes', 'Voor het mes, om het hout vast te houden', 'Onder het hout, waar het mes uitkomt', 'Maakt niet uit'], uitleg: 'Schiet het mes uit, dan raakt het je hand niet.' },
    { vraag: 'Je schilt een stok. Wat beweeg je?', keuzes: ['De stok, niet het mes', 'Het mes, niet de stok', 'Allebei zo snel mogelijk', 'Het mes naar je toe'], uitleg: 'Houd het mes stil, met de snede van je af, en trek de stok erlangs. Zo houd je het mes onder controle.' },
  ],
  // De Schijf van Vijf (blad schijf-van-vijf): the Voedingscentrum, 2026 (VKG VC-S5, VC-S5W).
  schijf: [
    { vraag: 'Past een volkorenboterham in de Schijf van Vijf?', keuzes: ['Ja', 'Nee'], uitleg: 'Volkoren brood, havermout en volkorenpasta passen erin.' },
    { vraag: 'Past een glas kraanwater in de Schijf van Vijf?', keuzes: ['Ja', 'Nee'], uitleg: 'Kraanwater is het goedkoopst, en goed voor het milieu.' },
    { vraag: 'Past een handje ongezouten noten in de Schijf van Vijf?', keuzes: ['Ja', 'Nee'], uitleg: 'Elke dag een handje noten, zonder zout.' },
    { vraag: 'Past een glas halfvolle melk in de Schijf van Vijf?', keuzes: ['Ja', 'Nee'], uitleg: 'Zuivel kies je vooral mager of halfvol.' },
    { vraag: 'Passen linzen en kikkererwten in de Schijf van Vijf?', keuzes: ['Ja', 'Nee'], uitleg: 'Peulvruchten passen erin: kies vooral eten uit planten.' },
    { vraag: 'Past een glas vruchtensap in de Schijf van Vijf?', keuzes: ['Nee', 'Ja'], uitleg: 'Sap past er niet in, net als frisdrank: er zit te veel suiker in.' },
    { vraag: 'Past worst op je brood in de Schijf van Vijf?', keuzes: ['Nee', 'Ja'], uitleg: 'Bewerkt vlees, zoals worst, past er niet in: te veel zout of vet.' },
    { vraag: 'Wat is de beste dorstlesser?', keuzes: ['Kraanwater', 'Frisdrank', 'Vruchtensap', 'Sportdrank'], uitleg: 'Water. Frisdrank en sap passen niet in de Schijf van Vijf.' },
    { vraag: 'Een koekje: is dat iets kleins of iets groters naast de Schijf van Vijf?', keuzes: ['Iets kleins', 'Iets groters'], uitleg: 'Iets kleins kan 3 tot 5 keer per dag.' },
    { vraag: 'Een zakje chips: is dat iets kleins of iets groters naast de Schijf van Vijf?', keuzes: ['Iets groters', 'Iets kleins'], uitleg: 'Iets groters hooguit 3 keer per week.' },
    { vraag: 'Een stuk taart: is dat iets kleins of iets groters naast de Schijf van Vijf?', keuzes: ['Iets groters', 'Iets kleins'], uitleg: 'Iets groters hooguit 3 keer per week.' },
    { vraag: 'Ketchup bij het eten: is dat iets kleins of iets groters naast de Schijf van Vijf?', keuzes: ['Iets kleins', 'Iets groters'], uitleg: 'Iets kleins kan 3 tot 5 keer per dag.' },
    { vraag: 'Welke drie dingen staan voorop in de Schijf van Vijf van 2026?', keuzes: ['Veel uit planten, vooral eten uit de schijf, weinig weggooien', 'Veel vlees, veel melk, veel brood', 'Alleen biologisch, alleen vers, alleen zelf koken', 'Elke dag snoep, chips en frisdrank'], uitleg: 'Gezond voor jou, en beter voor de aarde.' },
  ],
};

export const VOLGORDE = {
  afwas: {
    vraag: 'Tik de stappen van de afwas in de goede volgorde aan.',
    stappen: [
      'Etensresten van je bord in de afvalzak schrapen',
      'Afwassen in heet sop (teil 1)',
      'Het sop eraf spoelen in schoon, heet water (teil 2)',
      'Naspoelen in schoon water (teil 3)',
      'Laten drogen aan de lucht, op een rek of in een net',
      'Als alles klaar is: het afwaswater door een zeef in het afvoerputje gieten',
    ],
    klaar: 'Goed! Eerst wassen, dan het sop eraf, dan schoon naspoelen. Het afwaswater gaat pas aan het eind, gezeefd, het putje in.',
  },
};
