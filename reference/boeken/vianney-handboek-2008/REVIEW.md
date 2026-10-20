# Review van de app tegen het *Handboek Scouting technieken* (VIA08), 2026-10-20

Per hoofdstuk nagelopen: tekst, namen en (bij niet-afgevinkte bladen) de tekeningen tegen de bladzijden van het boek.
Afgevinkte bladen (de gebruiker had ze al goedgekeurd) zijn niet aangepast; wat daar anders zou kunnen staat onder
**Voorstellen**. Bladzijden zijn de gedrukte paginanummers. Alle 185 bladen die het boek behandelt hebben het boek nu
als bron (`web/src/data/referenties.local.js`).

## Aangepast (niet-afgevinkte bladen)

- **Hfst. 1 Bijl en mes**: soorten-bijlen (maten uit het boek; bokkenpoot- en rechte steel; de velbijl-tegel weg; delen
  van de bijl), bijl-doorgeven (grote bijl met de kop naar voren, dragen), hakken (houding kleine en grote bijl, bijl
  vast: nooit wrikken), bijl-onderhoud (mal, braam, zaag onderhouden), steel-en-zaagblad (nieuwe steel, kop recht),
  zagen-soorten (boomzaag voor twee). Tekening soorten-bijlen: vier bijlen, juiste stelen.
- **Hfst. 2 Touw en knopen**: opbouw-touw (kardeelslag, kort-/langgeslagen), touwsoorten (nylon), trompetsteek,
  vissersknoop, karaaksteek (hielingsteek), werpankersteek (visserssteek, ankerworp), rondtorn (werpankersteek als
  boeknaam), tonsteek (volgens het boek, met paalsteek; tekening opnieuw), turkse-knoop, eindsplits, oogsplits,
  fluitkoord.
- **Hfst. 2 Sjorringen, blokken, houvasten**: kruissjorring en woelen (drie of vier), vorksjorring (7–8 slagen, eind op
  de andere paal; tekening), steigersjorring (overlappend met twee sjorringen als hoofdvorm; tekening in twee delen),
  achtsjorring (begin met mastworp, 6–8 slagen; tekening), blok-onderdelen, katrol-inscheren (tweede takeltabel),
  hijsmateriaal (muizing), grondanker, haringen-in-serie (3-2-1; tekening), dode-man (touw ≤ 25°; tekening). 3D-modellen:
  aantallen slagen en woelslagen, eindmastworpen bij acht en vork.
- **Hfst. 3 Kaart en kompas**: spiegelkompas (delen, schaalverdeling, naald inspelen), gradenstelsels en kompasroute
  (oost-om/west-om), greep-1…4 (de nummering van het boek in `letOp`), kaarthoekmeter, horlogemethode, maankompas,
  natuurtekens, coordinatenroute (achtcijfermethode), hierogliefenroute, bolletje-pijltje-windrichting,
  tocht-logboek, hoogte-stokmethode (liggend), dwarsprofiel, routeschets, horizonschets.
- **Hfst. 4 Natuur**: fijnspar/grove-den/lariks (solo, duo, legio), paardenkastanje, gipsafdruk (blad afgieten),
  vuur-opbouwen (stookgang), tondel (berkenpapier, harsmannetjes), droog-hout, jagersvuur (houthakkersvuur),
  welk-hout (lariks, robinia, vlier, iep), wolken (afkortingen, waterig zonnetje, melklucht), buys-ballot (depressie,
  anticycloon, bovenwind), grote-beer (Mizar en Alkor), orion (Orionnevel), weerlogboek (stationssymbool).
- **Hfst. 5 EHBO** (volgens de *Nederlandse Richtlijnen Eerste Hulp 2026*, niet het boek): eerste-hulp-basis, ehbo-set,
  schaafwond, verstuiking, blaren, bloedneus, prikken-en-steken, tekenbeet, brandwond, bewusteloos; onderschrift
  tekenbeet-ring (tot 3 maanden).

## Voorstellen voor afgevinkte bladen (niet aangepast)

| Blad | Voorstel | Boek |
|---|---|---|
| takeling | `bezetting` in `ook`; de tweede manier uit het boek (beide einden langs het touw, minstens 4 slagen met de lus) | §2.2, blz 13–14 |
| opschieten | Tweede manier: touw dubbel, vanaf de einden opschieten, de middelste bocht om de rol en door de bovenkant | §2.2, blz 14 |
| achtknoop | `achtvormige knoop` in `ook` | §2.3.6, blz 16 |
| timmersteek | `timmersteek met muilslag`, `muilslag` in `ook`; halve steek ±20 cm van het eind van de paal | §2.3.7, blz 16 |
| welke-sjorring | Steigersjorring-tegel: "overlappend of met een spalk"; vorksjorring-tegel: palen naast elkaar sjorren, daarna spreiden | §2.4, blz 24–25 |
| rd-coordinaten | De korte notatie zonder het eerste cijfer (achtcijfermethode) en die naam noemen | §3.3, blz 43–44 |
| legenda | (Optioneel) de afkortingen Km, RK, Wt … als de huidige TOP25 ze nog drukt | §3.4, blz 44–47 |
| aangezichtskruispuntenroute | Tekening in perspectief (zoals je het kruispunt ziet), of dat in de tekst zeggen | §3.6.2, blz 50–51 |
| spoortekens, spoor-leggen | "Spoor bijster: terug naar het laatste teken"; cirkel met stip als einde spoor in sommige boeken; tak in een gevorkte steunstok; steen op steen zonder zijsteen = goede weg | §4.1, blz 61 |

## Ronde 2 (zelfde dag): wat de gebruiker besloot

- Voorstellen 1, 3–7 hieronder zijn doorgevoerd (takeling, achtknoop, timmersteek, welke-sjorring, rd-coordinaten,
  aangezichtskruispuntenroute in perspectief, spoortekens: spoor bijster, cirkel met stip, tak in gevorkte stok,
  steen op steen). Voorstel 2 (opschieten) staat in `notities/todo.md`.
- Alles onder *Ontbreekt in de app* is toegevoegd als blad (39 nieuwe bladen: 702 → 741), met eigen tekeningen; EHBO volgens de
  NREH 2026. Het insigne Veilig & Gezond 3 wijst nu naar verbanden, verplaatsen en stabiele-zijligging.
- Daarna: valkerf is een deel van bomen-vellen geworden (geen eigen blad meer: 740 bladen); de velbladen staan in een
  eigen groep *Bomen vellen*. 15 nieuwe bladen staan nu bij een insigne-eis (o.a. plattingen bij Knopen 2, katteklauw,
  haaksteek en strop bij Pionieren 2, weersymbolen bij Natuur & Buitenleven 3); de rest blijft bij Extra.

## Ontbreekt in de app (stand vóór ronde 2)

- **Bijl**: bomen vellen (valkerf, omhakken, rooien), uitsnoeien, hiep, schilschop. Let op: kapvergunning is nu
  omgevingsvergunning; volg het SN-infoblad *Kappen van bomen*, niet de maten van het boek.
- **Knopen**: treksteek, zitsteek, topreepsteek, gareelsteek, bootsmanstoeltje, galeisteek, leeuwerikskop, korte
  splits, plattings (boeren-, bootsmans-, kroonplatting). Bij knopen om mensen te hijsen: alleen als knoop, met de
  waarschuwing dat dat met gekeurd materiaal moet.
- **Blokken**: Engelse kink/katteklauw, haaksteek/nekslag, strop/grommer.
- **Kaart**: plattegrond op schaal.
- **Natuur**: roet- en carbonafdruk; iep, grauwe els, robinia, meidoorn; weersymbolen en stationsmodel als tekening;
  sluipen (apen-, ganzen-, katten-, robbengang).
- **EHBO**: levensbedreigende bloeding, flauwte, shock, vuiltje in het oog, tand uit de mond, elektriciteits- en
  verkeersongeval, vergiftiging, verbanden (insigne Veilig & Gezond 3 vraagt vinger-, druk- en snelverband),
  vervoermethoden en Rautekgreep (ook in dat insigne).

## Niet overgenomen: fouten of verouderd in het boek

- Beaufort 8 als 34–50 kn (moet 34–40), "knopen per uur"; KNMI volgt.
- Wind om een hogedrukgebied "tegen de klok in" (op het noordelijk halfrond met de klok mee).
- Hoogtemeting "ED : AD = CB : AD" (moet CB : AB); breedtemeting "gedeeld door AD" (moet AB).
- Wolkenhoogtes (middel 2–8 km, hoog 5–13 km): KNMI geeft 2–6 en 6–12 km.
- Cassiopeia "hoog in het zenit": alleen in sommige seizoenen.
- Zon om 6 uur in het oosten en 15° per uur: alleen rond de equinox, en ruw; niet als tabel overgenomen.
- Horloge: halverwege de kleine wijzer en de 12 (wintertijd) wijkt ±10° af; de app houdt de 1 / 2.
- Trekvastheid "duims² × 100 kg": alleen zinvol voor de omtrek in duimen; de app houdt haar d²-regel in mm.
- Losse bijlkop 24 uur in water zetten: SN zegt niet gebruiken en laten repareren.
- Hele EHBO-hoofdstuk: drukpunten op slagaders, beademing zonder borstcompressies, polscontrole door leken,
  draaien van teken, alcohol op een teek, boter of zalf op brandwonden, berkentak tegen een bosbrand.

## Nog na te kijken

- 3D-kruissjorring: elke slag ligt nu buiten de vorige op beide palen; het boek legt ze binnen op de balk en buiten op
  de staande paal (`sb` in `web/src/doe/sjorren/scene3d.js`).
- `werpankersteek` staat niet meer in `ook` van rondtorn: de knopen lijken op elkaar maar zijn niet hetzelfde
  (gebruiker, 2026-10-20); beide bladen leggen het verschil uit.
- Zo ook `slipsteek` uit `ook` van treksteek (het boek noemt de treksteek slipsteek); het blad legt het verschil uit. `visserssteek` is uit `ook` van vissersknoop gehaald.
- `vuurtoorts` (boek: veerstok) staat in `ook` van zweedse-fakkel; `kraanvuur` hoort in `ook` van pan-boven-vuur.
