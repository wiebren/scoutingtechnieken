// Weer en hemel: notities/technieken/touw-kamp-natuur.md §7, reference/vakbronnen/BRONNEN.md (KNMI, CC0).

export default [
  { id: 'beaufort', naam: 'Windkracht (Beaufort)', ook: ['Beaufort', 'windschaal', 'bft'], en: 'Beaufort scale', groep: 'wind', letterlijk: true,
    bron: 'KNMI, Windschaal van Beaufort', bronDatum: 'geraadpleegd 14-10-2026',
    uitleg: 'Hoe hard het waait, in getallen van 0 tot 12. Zo zie je het aan land:',
    tabel: {
      kop: ['Bft', 'Naam', 'km/u', 'Wat je ziet'],
      rijen: [
        ['0', 'stil', '0–1', 'rook stijgt recht of bijna recht omhoog'],
        ['1', 'zwak', '1–5', 'windrichting goed af te leiden uit rookpluimen'],
        ['2', 'zwak', '6–11', 'wind merkbaar in gezicht'],
        ['3', 'matig', '12–19', 'stof waait op'],
        ['4', 'matig', '20–28', 'haar in de war, kleding flappert'],
        ['5', 'vrij krachtig', '29–38', 'opwaaiend stof hinderlijk voor de ogen, gekuifde golven op meren en kanalen en vuilcontainers waaien om'],
        ['6', 'krachtig', '39–49', "paraplu's met moeite vast te houden"],
        ['7', 'hard', '50–61', 'lastig tegen de wind in te lopen of fietsen'],
        ['8', 'stormachtig', '62–74', 'voortbewegen zeer moeilijk'],
        ['9', 'storm', '75–88', 'schoorsteenkappen en dakpannen waaien weg, kinderen waaien om'],
        ['10', 'zware storm', '89–102', 'grote schade aan gebouwen, volwassenen waaien om'],
        ['11', 'zeer zware storm', '103–117', 'enorme schade aan bossen'],
        ['12', 'orkaan', '> 117', 'verwoestingen'],
      ],
    },
    verwijs: [{ naam: 'Windschaal van Beaufort (KNMI)', url: 'https://www.knmi.nl/kennis-en-datacentrum/uitleg/windschaal-van-beaufort' }] },
  { id: 'flits-donder', naam: 'Flits en donder tellen', ook: ['onweer', 'bliksem', 'afstand onweer'], groep: 'onweer', letterlijk: true,
    bron: 'KNMI (afstand); Scouting Nederland (veiligheid bij onweer)', bronDatum: 'geraadpleegd 14-10-2026',
    uitleg: [
      'Tel de seconden tussen de flits en de donder. Het geluid legt in drie seconden ongeveer een kilometer af: seconden gedeeld door drie is de afstand in kilometers.',
      'Hoor je de donder binnen tien seconden, dan is het onweer gevaarlijk dichtbij. Stop de activiteit en zoek een veilige plek.',
    ] },
  { id: 'poolster', naam: 'Poolster', ook: ['Noordster', 'Grote Beer', 'Steelpan'], en: 'Polaris', groep: 'sterren', bron: 'NAV §6',
    uitleg: 'Zoek de Grote Beer, de steelpan. Trek een lijn door de twee sterren aan de voorkant van de pan, aan de kant tegenover de steel, en verleng die ongeveer vijf keer. Daar staat de Poolster, niet heel fel. Recht eronder is het noorden.' },
];
