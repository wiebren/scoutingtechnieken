// The quiz of ./quiz.js with a set of its own: may your knife come along? Facts as in the bladen messenwet and
// scouting-messen (gereedschap): the Wet wapens en munitie (art. 2, 26, 27, as in force from 01-07-2026) and the
// infoblad Messen en de wapenwet of Scouting Nederland (2020). The set is added here and not in ./vragen.js, so
// that file stays as it is.
import quiz from './quiz.js';
import { QUIZ } from './vragen.js';

QUIZ['mes-mee'] ??= [
  { vraag: 'Zaterdag kook je met je groep op houtvuur. Neem je je zakmes mee?',
    keuzes: ['Ja, als jullie groep dat goedvindt: bij koken op houtvuur heb je hem echt nodig.', 'Nee, een mes mag nooit mee naar Scouting.', 'Ja, en je houdt hem de hele week bij je.'],
    uitleg: 'Scouting Nederland stelt voor: neem je mes alleen mee als je het echt nodig hebt, zoals bij vuur maken of koken.' },
  { vraag: 'Je gaat zaterdagavond met vrienden de stad in. En je zakmes?',
    keuzes: ['Laat je thuis.', 'Mag mee: een zakmes is nooit een wapen.', 'Mag mee als het lemmet kort is.'],
    uitleg: 'Je hebt hem daar niet nodig. Bij het uitgaan kan zelfs een klein zakmes als wapen gelden: dan telt waarom je het bij je hebt, niet hoe lang het lemmet is. En een gemeente kan messen op sommige plekken verbieden.' },
  { vraag: 'Een vriend heeft in het buitenland een vlindermes gekocht. Mag hij dat hier hebben?',
    keuzes: ['Nee, een vlindermes is in Nederland verboden.', 'Ja, als hij het thuis bewaart.', 'Ja, vanaf 18 jaar.'],
    uitleg: 'Vlindermessen, valmessen en springmessen (stiletto’s) zijn categorie I: verboden om te hebben, voor iedereen.' },
  { vraag: 'Een klapmes is opengeklapt 30 centimeter lang. Mag je dat hebben?',
    keuzes: ['Nee: een klapmes dat opengeklapt langer is dan 28 cm is verboden.', 'Ja, de lengte maakt niet uit.', 'Ja, als het één snijkant heeft.'],
    uitleg: 'Een opvouwbaar mes van meer dan 28 cm opengeklapt, of met meer dan één snijkant, is categorie I.' },
  { vraag: 'Je bent 15 en wilt een dolk met twee snijkanten kopen.',
    keuzes: ['Mag niet: onder de 18 mag je geen wapen van categorie IV hebben.', 'Mag, als je hem niet op straat draagt.', 'Mag, als hij in een schede zit.'],
    uitleg: 'Een mes met meer dan één snijkant is categorie IV: niemand mag het dragen, en onder de 18 mag je het niet eens hebben.' },
  { vraag: 'Waar blijft je scoutsmes het liefst als je niet op Scouting bent?',
    keuzes: ['Op het clubhuis. Dan hoef je er niet mee over straat.', 'In je broekzak, voor als je het nodig hebt.', 'In je schooltas.'],
    uitleg: 'Scouting Nederland stelt voor dat messen van jeugdleden op het clubhuis blijven.' },
  { vraag: 'Wanneer gebruik je je mes bij Scouting?',
    keuzes: ['Als er leiding bij is.', 'Wanneer je maar wilt.', 'Alleen als niemand kijkt.'],
    uitleg: 'Een van de afspraken die Scouting Nederland voorstelt: een mes gebruik je alleen als je speltakleiding erbij is.' },
  { vraag: 'Je gaat met je groep op kamp in een ander land. Gelden de Nederlandse messenregels daar?',
    keuzes: ['Nee, elk land heeft eigen regels: zoek ze vooraf op.', 'Ja, in heel Europa geldt hetzelfde.', 'Nee, in het buitenland mag alles.'],
    uitleg: 'De regels voor messen zijn niet in heel Europa gelijk: soms strenger, soms ruimer dan bij ons.' },
];

export default (opties) => quiz(opties);
