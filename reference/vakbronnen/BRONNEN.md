# Vakbronnen buiten scouting (Nederland) — bronnen (2026-10-14)

Bronnen van buiten scouting die dezelfde technieken gezaghebbend of didactisch goed behandelen: Defensie, Kadaster en
NSGI, oriënteringslopen en de puzzelrit- en rallywereld, radio (VERON, C2000), KNRM en Reddingsbrigade, KNMI,
brandweer, natuurorganisaties. Alleen Nederland. Bedoeld als aanvulling op `../../notities/prior-art.md`,
`../../notities/technieken/*.md` en `../programma/BRONNEN.md`; wat daar al staat, is hier niet herhaald.

Hoe zeker: **[V]** gelezen in de bron zelf · **[S]** alleen uit een zoekresultaat · **[I]** afgeleid of algemene
kennis, niet nagekeken.

Beperkingen van deze ronde: de zoekmachine vindt Nederlandse bronnen slecht. Daarom heb ik vooral bekende sites
rechtstreeks opgehaald, de Woo-zoekdienst van open.overheid.nl gebruikt (API
`https://open.overheid.nl/overheid/openbaarmakingen/api/v0/zoek?zoektekst=…`) en de PDOK-API bevraagd. Geen
downloads uitgevoerd; PDF's alleen met `pdftotext`/`pdftoppm` gelezen.

## Bronnentabel

| Sleutel | Wat | Organisatie | Versie / datum | URL → bestand | Licentie / hergebruik |
|---|---|---|---|---|---|
| **AW** | Auteurswet art. 11 en 15b (overheidswerken) | wetgever | geldig vanaf 01-01-2026, gel. 14-10-2026 | <https://wetten.overheid.nl/BWBR0001886/> | wettekst, geen auteursrecht (art. 11) [V] |
| **RO-CC0** | Copyrightverklaring Rijksoverheid: CC0 1.0 voor tekst, niet voor beeld | Rijksoverheid | gel. 14-10-2026 | <https://www.rijksoverheid.nl/copyright> | — [V] |
| **HBMIL** | *Handboek Militair, Militaire Basisvaardigheden*, LAND-E&T-02.3 (opvolger van het Handboek Soldaat) | Defensie, Opleidings- en Trainingscommando / Koninklijke Militaire School | vastgesteld 03-03-2020 | **niet openbaar gevonden**. Genoemd in het OVV-rapport *Schietongeval Camp Bulldog* (2024), voetnoot 6: <https://open.overheid.nl/documenten/e068c8c4-1473-4a44-8eaa-fbf473e31c72> | n.v.t. [V vermelding] |
| **KMA37** | *Handboek voor den soldaat (KMA Breda)*, deel I | Koninklijke Militaire Academie | 1937 | <https://www.dbnl.org/tekst/_han002hand01_01/> (DBNL-tekst, niet gedownload) | DBNL: "mogelijk auteursrechtelijk beschermd"; anoniem werk van de overheid uit 1937, dus vermoedelijk vrij (anoniem: 70 jaar na publicatie) [I] |
| **TOP-LEG** | Officiële legenda TOP25raster en TOP50raster | Kadaster (via PDOK) | gel. 14-10-2026 | <https://service.pdok.nl/brt/topraster/wms/v1_0/legend/top25raster/default.png> → `kadaster-legenda-top25raster.png`, `kadaster-legenda-top50raster.png` | TOPraster **CC BY 4.0** ("voorwaarden uit de CC-BY licentie", Kadaster-pagina) [V] |
| **TOPRAS** | Productpagina TOPraster (6 kaartseries, schaalbereik, herkomst) | Kadaster | gel. 14-10-2026 | <https://www.kadaster.nl/-/topraster> | CC BY 4.0 [V] |
| **TOP10-HL** | TOP10NL, collectie `hoogte_lijn` (hoogtelijnen als data) | Kadaster via PDOK OGC API | opgevraagd 14-10-2026 | <https://api.pdok.nl/brt/top10nl/ogc/v1/collections/hoogte_lijn/items> | CC BY 4.0 [S data.overheid.nl, V Kadaster] |
| **NSGI** | Overzicht coördinatenstelsels (RD, NAP, ETRS89, UTM-zones) en RDNAPTRANS | Nederlandse Samenwerking Geodetische Infrastructuur | gel. 14-10-2026 | <https://www.nsgi.nl/coordinatenstelsels-en-transformaties/overzicht-coordinatenstelsels> | geen licentie gezien [V pagina] |
| **NOLB** | Nederlandse Oriënteringsloop Bond: beginnerspagina, disciplines, e-learnings (ISOM2017-2, ISSprOM2019-2, postomschrijvingen) | NOLB | gel. 14-10-2026 | <https://nolb.nl/kenniscentrum/beginnen-met-orienteringslopen/> | "Copyright NOLB 2026" [V] |
| **TULP25** | *Reglement Tulpenrallye 2025* (de 71e), bijlage 1 *Bol-pijl systeem* en bijlage 2 *Kaartleesinstructies* | Tulpenrallye, goedgekeurd door KNAF (permit 0451.25.051) | definitief 01-03-2025 | via <https://knaf.nl/rally/rally-reglementen/historische-rallysport-reglementen> → `tulpenrallye-2025-reglement.pdf` (32 p.) | geen licentie, dus © [I]; systemen als feiten beschrijven |
| **KNAF26** | *Algemeen Reglement Historische Regularity Rally's 2026* (en 2025: Standaard Reglement, Reglement Touring Events) | KNAF | 06-01-2026 | zelfde pagina → `knaf-2026-algemeen-reglement-historische-regularity-rallys.pdf` (15 p.) | © KNAF [I] |
| **WNET** | Veelgestelde vragen LAW's en Streekpaden (ook: gemiddeld wandeltempo 4 à 5 km per uur, gel. 17-10-2026) | Wandelnet | gel. 14-10-2026 | <https://www.wandelnet.nl/veelgestelde-vragen> | © [I] |
| **C2000** | *Handboek C2000 Procedures en afspraken*, versie 2021, bijlage C *Radioprocedures* (dienstuitdrukkingen, NATO-spelalfabet met Nederlandse uitspraak, uitspraak cijfers) | Brandweer Nederland / IFV (nu NIPV), redactiecommissie C2000 Brandweer | PDF 19-02-2021 | <https://archief.nipv.nl/documenten/handboek-c2000procedures-en-afspraken/> (levert de PDF) → `ifv-handboek-c2000-brandweer-2021.pdf` (43 p.) | geen auteursrechtvoorbehoud in de tekst gevonden [V grep]; dan geldt art. 15b, als het IFV als "openbare macht" telt [I] |
| **VERON** | Morsesite, jeugd en jongeren (JOTA, Kids Day, YOTA) | VERON | gel. 14-10-2026 | <https://morse.veron.nl/> · <https://veron.nl/activiteiten/jeugd-en-jongeren/> (JOTA, zomerkampronde) · <https://veron.nl/vereniging/commissies-en-werkgroepen/jeugd-en-jongerencommissie/jamboree-on-the-air-jota/> (gel. 17-10-2026) | © [I] |
| **KNRM-NS** | Noodsignalen (pyrotechniek, EPIRB, PLB, AIS) | KNRM | gel. 14-10-2026 | <https://www.knrm.nl/preventie/veilig-het-water-op/noodsignalen> | © KNRM 2026 [V] |
| **KNRM-AL** | Alarmeren op het water (Kustwacht) | KNRM | gel. 14-10-2026 | <https://www.knrm.nl/alarmeren> | © [V] |
| **KNRM-WV** | Lespakket *Waterveilig* (groep 7–8): werkboekje, poster *Alarmeren doe je zó!*, strip over ijs | KNRM met Reddingsbrigade Nederland, Dutch Lifeguards, Nationale Raad Zwemveiligheid | werkboekje 25-09-2024; poster 2016; strip 2018 | <https://www.knrm.nl/preventie/veiligheid-door-preventie/waterveiligpakket-voor-jeugd> → `knrm-waterveilig-werkboekje.pdf`, `knrm-poster-alarmeren.pdf`, `knrm-strip-alarmeren-ijs.pdf` | © KNRM [V] |
| **RB-IJS** | *Veilig genieten van natuurijs* | Reddingsbrigade Nederland (KNBRD) | gel. 14-10-2026 | <https://www.reddingsbrigade.nl/wij/wat-wij-doen/voorlichting/tips-voor-meer-veiligheid/veilig-genieten-van-natuurijs/> | © [I] |
| **KNMI-BFT** | Windschaal van Beaufort (tabel met km/u, m/s, knopen, uitwerking boven land) | KNMI | gel. 14-10-2026 | <https://www.knmi.nl/kennis-en-datacentrum/uitleg/windschaal-van-beaufort> | **CC0**, bronvermelding "bron: KNMI" gevraagd ([KNMI copyright](https://www.knmi.nl/copyright)); foto's uitgezonderd [V] |
| **KNMI-WOL** | Wolken (families, geslachten, hoogtes) | KNMI | gel. 14-10-2026 | <https://www.knmi.nl/kennis-en-datacentrum/uitleg/wolken> | CC0 voor tekst; foto's staan op naam van fotografen [V] |
| **BW-NB** | Natuurbrand: wat doe je, natuurbrandfasen | Brandweer Nederland | gel. 14-10-2026 | <https://www.brandweer.nl/onderwerpen/natuurbrand/> | geen licentiepagina gevonden (/copyright 404) [V] |
| **SBB-TR** | Toegangsregels (aanvulling op SBB in de notities: wildpluk, gps-routes, natuurijs) | Staatsbosbeheer | gel. 14-10-2026 | <https://www.staatsbosbeheer.nl/Contact/toegangsregels> | © [I] |
| **NCTV-NP** | *Stel je noodpakket samen* (Denk vooruit) | NCTV / Rijksoverheid | gel. 14-10-2026 | <https://www.denkvooruit.nl/bereid-je-voor/stel-je-noodpakket-samen> | **CC0** voor tekst, niet voor beeld ([copyright](https://www.denkvooruit.nl/service/copyright)) [V] |
| **IVN-DEV** | *Deventer diersporen* (loop-, vraat-, woonsporen, uitwerpselen) | IVN Deventer, Zoogdierenwerkgroep | versie 2, © 2013 | <https://www.ivn.nl/app/uploads/sites/171/2022/09/dev_diersporenkaart-2013-web.pdf> → `ivn-deventer-diersporen-2013.pdf` | © [V] |
| **KNNV-WB** | *Bomen in de winter herkennen* (presentatie) | KNNV afdeling Utrecht, Cockie Streng | 19-01-2023 | <https://utrecht.knnv.nl/wp-content/uploads/sites/32/2023/01/Bomen-in-de-winter-herkennen.pdf> (niet bewaard) | © [I] |
| **KNVWS** | Koninklijke Nederlandse Vereniging voor Weer- en Sterrenkunde: publiekssterrenwachten, kijkavonden | KNVWS | gel. 14-10-2026 | <https://www.knvws.nl/> | © [I] |
| **JWG** | Jongeren Werkgroep voor Sterrenkunde (8–21 jaar) | JWG | gel. 14-10-2026 | <https://www.sterrenkunde.nl/jwg/> | © [I] |

## Wat mogen we overnemen? (overheidspublicaties)

- **Auteurswet art. 11** [V AW]: "Er bestaat geen auteursrecht op wetten, besluiten en verordeningen, door de openbare
  macht uitgevaardigd, noch op rechterlijke uitspraken en administratieve beslissingen." Een militair voorschrift is
  daarmee niet vrij: het is geen wet of besluit in die zin [I].
- **Art. 15b** [V AW]: verdere openbaarmaking of verveelvoudiging van een werk dat "door of vanwege de openbare macht
  openbaar gemaakt" is, en waarvan de overheid maker of rechtverkrijgende is, is geen inbreuk, "tenzij het
  auteursrecht […] blijkens mededeling op het werk zelf of bij de openbaarmaking daarvan uitdrukkelijk is
  voorbehouden". De maker houdt wel het recht om die werken gebundeld uit te geven.
  - Gevolg [I]: een **intern** voorschrift (Handboek Militair, Handboek Soldaat) is nooit door de overheid openbaar
    gemaakt, dus 15b helpt niet. Pas na een Woo-besluit dat het document openbaar maakt, kan 15b gelden, mits er geen
    ©-vermelding op staat.
  - Gevolg [I]: websites van de Rijksoverheid, KNMI en Denk vooruit hebben het zelf al geregeld met **CC0** voor
    tekst (niet voor foto's en infographics) [V RO-CC0, KNMI-BFT, NCTV-NP]. Tabellen en tekst van die sites mogen
    we dus overnemen. KNMI vraagt "bron: KNMI" te vermelden en te zeggen dat het KNMI niet bij ons werk betrokken is.
- **Feiten zijn vrij** [I]: een kaartleessysteem, een lijst dienstuitdrukkingen of een legenda-indeling beschrijven in
  eigen woorden mag altijd. Letterlijke tekst, tekeningen en lay-out van KNRM, KNAF/Tulpenrallye, NOLB, IVN niet.
- **Kadaster-data** (legenda-PNG, TOPraster, TOP10NL) is CC BY 4.0: overnemen mag, met "CC-BY Kadaster" en jaar.

## Per bron: wat is bruikbaar

### Defensie

**Handboek Soldaat (VS 2-1350) → Handboek Militair (LAND-E&T-02.3).** Het huidige basisboek heet *Handboek Militair,
Militaire Basisvaardigheden*, LAND-E&T-02.3, "vastgesteld door Commandant Opleidings- en Trainingscommando, namens
deze de Commandant Koninklijke Militaire School, d.d. 3 maart 2020". Volgens de OVV "dient iedere militair de inhoud
van het handboek te kennen" [V HBMIL-vermelding]. Het voorschriftnummer VS 2-1350 en de inhoud van het Handboek
Soldaat heb ik niet in een bron gezien [S: geen treffers]. Woo-zoekopdrachten naar "Handboek Soldaat", "VS 2-1350",
"Militaire Basisvaardigheden", "panoramaschets", "terreinschets" en "afstandschatten" op open.overheid.nl gaven geen
openbaar gemaakt exemplaar [V zoekresultaten]. Kamerstukken noemen wel dat de opleiding "kaart en kompas lezen,
militaire EHBO" en een bivak bevat (Woo-besluit *Nationale Weerbaarheidstraining RUG*, 2026) [V].
**Conclusie**: voor de app niet bruikbaar zonder Woo-verzoek; zie open vragen.

**Handboek voor den soldaat (KMA Breda, 1937), deel I** [V KMA37]. Op DBNL als volledige tekst. Bruikbaar:
- *Hoofdstuk XI, De algemeene teekens*: Nederlandse **armseinen** met waarschuwingssein (2 stoten op fluit) en
  uitvoeringssein (1 stoot): marsrichting (arm in de richting), aanmarcheren (armzwaaien naar voren), halt (rechterarm
  omhoog, dan zijwaarts omlaag), verzamelen (armen zijwaarts, dan over de borst kruisen), ondercommandanten ontbieden,
  terrein vrij, vijand gezien (arm rondzwaaien boven het hoofd), begrepen (rechterhand tegen de helm). "Alle teekens
  moeten, ten bewijze dat zij zijn begrepen, worden herhaald." Een Nederlandse tegenhanger van de BP-handsignalen.
- *Hoofdstuk XVI, Wenken voor het behoud der gezondheid te velde*: drinkwater ("drink slechts water uit goedgekeurde
  pompen of drink gekookt water"), latrines met aarde afdekken, handen wassen vóór het eten, voeten wassen na een
  mars, sokken zonder plooien. Historisch kader voor *hudo* en *voeten*.
- *Hoofdstuk XII*: rantsoen per man per dag (0,75 kg brood, 1,75 kg aardappelen …). Alleen als weetje.
- Geen hoofdstukken over kaartlezen, afstand schatten of schetsen in deel I [V inhoudsopgave].

### Kadaster, PDOK, NSGI

**Officiële legenda TOP25raster** [V TOP-LEG, gelezen als afbeelding]. De Kadaster-productpagina verwijst ernaar
("De legenda's van de TOPraster producten vindt u op de website van PDOK"). Indeling en termen, letterlijk:
- **Bebouwing**: bebouwd gebied · gebouwen · hoogbouw · kas.
- **Wegen**: autosnelweg · hoofdweg (met gescheiden rijbanen) · regionale weg (idem) · lokale weg (idem) · weg met
  losse of slechte verharding · onverharde weg · straat/overige weg · voetgangersgebied · verhard fietspad · fietspad
  met losse of slechte verharding · pad, voetpad · weg in aanleg · viaduct · aquaduct · tunnel · vaste brug ·
  beweegbare brug · brug op pijlers.
- **Spoorwegen**: enkelspoor · meersporig · station · spoorweg in tunnel · tramweg · sneltram (halte) · metro
  bovengronds · metrostation.
- **Hydrografie**: waterloop **smaller dan 3 m · 3–6 m breed · breder dan 6 m** · schutsluis · stuwen · koedam ·
  duiker · grondduiker · afsluitbare duiker · bron, wel · afvalwaterzuiveringsbekkens · pontveer · fiets- en voetveer ·
  peilschaal · kilometerraaibord · baak · dok · dukdalf · scheepvaartlicht · aanlegsteigers · versterkt talud ·
  dieptegetal · hoogwaterlijn · laagwaterlijn · LAT (laagste astronomisch getij) · dieptelijnen · droogvallende grond ·
  krib, golfbreker.
- **Getrianguleerde punten**: GNSS-kernnetpunt.
- **Overige symbolen**: **religieus gebouw · toren, hoge koepel · religieus gebouw met toren** · markant object ·
  watertoren · vuurtoren · gemeentehuis · postkantoor · politiebureau · wegwijzer · kapel · kruis · vlampijp ·
  telescoop · windmolen · waterradmolen · windmotor · windturbine · oliepompinstallatie · seinmast · zendmast · hunebed ·
  monument · gemaal · **kampeerterrein** · sportcomplex · ziekenhuis · paal · grenspunt · boom · bomenrij · heg, haag ·
  houtwal · schietbaan · afrastering · hoogspanningsleiding met mast · muur · geluidswering.
- **Wegeninformatie**: wegnummering (A, N, E, S) · parkeerplaats · tankstation · afritnummer · aantal rijstroken ·
  kilometerpaal · wegafsluiting · verharde en onverharde start-/landingsbaan.
- **Grenzen**: rijksgrens · provinciegrens · gemeentegrens.
- **Reliëf**: dijk, talud hoger dan 2,5 m · dijk, talud 1–2,5 m hoog · kade, wal 0,5–1 m hoog · steile rand,
  aardrand: hoger dan 1 m · berijdbare dijk · ingraving, holle weg · **hoogtelijnen (drie lijnsoorten met de getallen
  10, 5 en 2,5)** · hoogtepunt (bv. 12.4).
- **Bodemgebruik** (vlakken a–r): grasland met sloten · akkerland met greppels · boomgaard · fruitkwekerij ·
  boomkwekerij · grasland met populierenopstand · loofbos · naaldbos · gemengd bos · griend · heide · zand · drasland,
  moeras · rietland · dodenakker, begraafplaats · zonnepark · overig bodemgebruik · duin.

Voor de app: dit is de bron voor een **legenda-trainer** (categorieën liggen al vast) en een kandidaat om de
symbolen uit over te tekenen (CC BY 4.0, met naamsvermelding). De TOP50-legenda staat ernaast voor vergelijking.

**Equidistantie** [V TOP10-HL]. In TOP10NL liggen de hoogtelijnen op **veelvouden van 2,5 m** ten opzichte van NAP.
Gecontroleerd in vier gebieden (Vaalserberg 160–310 m, Posbank 35–107,5 m, Groesbeek 17,5–82,5 m, Utrechtse Heuvelrug
0–52,5 m): elke waarde is een veelvoud van 2,5, nergens een tussenwaarde. Eigenschappen per lijn: `typehoogte =
hoogtelijn`, `referentievlak = NAP`, bron "hoogtemodel Kadaster dat is bijgehouden met behulp van stereo luchtfoto's",
bronactualiteit 2004 of 2010. De TOP25-legenda onderscheidt de lijnen van 10, 5 en 2,5 m in stijl [V]. Dat de
lijnen van 2,5 m de "tussenlijnen" zijn, is mijn lezing van de legenda [I].

**TOPraster-productpagina** [V TOPRAS]: zes series (TOP25raster tot TOP1000raster). TOP25raster is "een digitale
cartografische weergave van TOP10NL"; TOP50/TOP100 worden automatisch gegeneraliseerd uit TOP10NL; TOP250 en kleiner
komen uit EuroRegionalMap. Bruikbaar schaalbereik: TOP25 1:10.000–1:50.000, TOP50 1:25.000–1:75.000. TOP10NL wordt
ingewonnen "met behulp van luchtfoto's, panoramafoto's en informatie uit externe bronnen".

**NSGI** [V]: RD (EPSG:28992; met NAP EPSG:7415) wordt door het Kadaster "gedefinieerd […] als transformatie van
ETRS89 met RDNAPTRANS™" (huidige versie RDNAPTRANS™2018). Meetruis uit de oude driehoeksmeting tot 0,25 m zit in een
correctiegrid. Stereografische projectie, hoekgetrouw; schaalfout op land onder 0,15 m/km. NAP komt van het
Amsterdams Peil, "gemiddeld hoogwater op het IJ in 1683-1684". UTM-zones: ETRS89-TM zone 31 (west) en 32 (oost). De
parameters en formules van RDNAPTRANS zijn "vrij beschikbaar", na een downloadformulier.

**Onderwijs** [—]: een Kadaster-lespakket over kaartlezen heb ik niet gevonden (kadaster.nl/onderwijs en
/lesmateriaal geven 404; de zoekmachine vond niets). Bosatlas en andere schoolmethodes niet bekeken; die zijn © van
de uitgever (Noordhoff) [I].

### Oriënteringslopen, rally's, wandelen

**NOLB** [V]. Officiële naam: **Nederlandse Oriënteringsloop Bond**; de sport heet *oriënteringslopen* (ook
*oriëntatielopen* komt op de site voor). Bruikbaar:
- Disciplines met winnaarstijden: **Sprint** (±15 min, stad/park), **Middle** (30–35 min, meest technisch, veel korte
  benen), **Long** (±90 min, routekeuze), **klassieke afstand** (60–70 min), **Avond-O** (met lamp, posten met
  reflector), **Oriëntrail** (alleen over paden, ook met stafkaart), **Stads-O**.
- Werkwijze: kaart met ingetekende **controleposten** in vaste volgorde, de route ertussen kies je zelf;
  **postomschrijving** op een los papiertje; afstanden "altijd gemeten in een rechte lijn tussen de controleposten. Je
  loopt dus altijd meer!"; beginners zijn 2–3× zo lang onderweg als hun hardlooptijd; kompas: plaatkompas of
  duimkompas (gevorderden); rood-witte pijlen en lint naar start en wedstrijdcentrum.
- E-learnings voor organisatoren over **ISOM2017-2** (boskaarten), **ISSprOM2019-2** (sprintkaarten) en
  postomschrijvingen. Dat bevestigt de normen achter de O-kaart (in de notities nog [I]).
- Voor techniek verwijst de NOLB zelf naar de Belgische club Hamok (<https://techniek.hamok.be/orientatielopen/>);
  Vlaams, dus hier niet uitgewerkt.

**Tulpenrallye 2025, kaartleesinstructies** [V TULP25]. De rallywereld heeft wat scouting mist: **precieze,
geschreven regels per routetechniek**. Wat erin staat:
- **Bol-pijl systeem met afstanden** (bijlage 1): situatieschetsen met kolommen *situatienummer · totale afstand vanaf
  de vorige tijdcontrole · afstand tussen twee situaties · getekende situatie · extra info · resterende afstand*. Regels:
  van de bol naar de punt van de pijl; meetpunt soms met een sterretje; bij minder dan 100 m tussen twee situaties
  een verticale pijl ("snel lezen"); situaties zijn gestileerd (bochten hoeven niet getekend); **verharde weg =
  doorgetrokken lijn, onverharde weg = onderbroken lijn**; alle wegen op de situatie zijn getekend, behalve doodlopende
  en verboden wegen (of die krijgen een **blokje**); tussen twee situaties zoveel mogelijk de doorgaande weg.
- **Bol-pijl zonder afstanden**: de opdracht geldt op de eerstvolgende wegsituatie die past; hooguit 2,5 km tussen
  opdrachten.
- **Algemene kaartleesregels** (bijlage 2, 19 regels), o.a.: alleen wegen met twee bermlijnen; een weg niet in
  tegengestelde richting opnieuw rijden; binnen een cirkel op de kaart mag je alle wegen gebruiken; afwijkingen tot
  100 m tellen als kloppend; kaarttekens en tekst onderbreken een weg niet, door de organisatie geplakte dingen wel;
  bij een afgesloten weg de kortste omweg die het minst van de route mist; **keren mag niet** tenzij opgedragen;
  "doodlopende weg" sluit een weg niet af, "bestemmingsverkeer" wel; **overgangspunten** A, B, C tussen
  kaartfragmenten.
- **Herstelcodes** bij routecontroles: HK hier keren · DMP 7 doorgaan met punt of pijl 7 · DMIL doorgaan met
  ingetekende lijn · DMG doorgaan met grensbenadering · NVO niet verder omrijden · 1R/2R eerste/tweede weg rechts ·
  ER einde weg rechts · VR voorrangsweg rechts · VO voorrangsweg oversteken.
- **Kaartleessystemen**, elk met regels en een voorbeeld:
  1. *Pijlen en punten*: in nummervolgorde, steeds de **kortste route**; pijlen en punten die niet aan de beurt zijn,
     blokkeren de weg; een pijl niet raken of kruisen, helemaal en in de pijlrichting rijden.
  2. *Ingetekende lijn*: de getekende wegen zo nauwkeurig mogelijk rijden.
  3. *Grensbenadering*: zo dicht mogelijk langs een grenslijn zonder eroverheen; "de oppervlakte tussen de route en
     de grens dient zo klein mogelijk te blijven".
  4. *Ingetekende lijn met barricades*: genummerde dwarsstreepjes zijn afgesloten; in volgorde omrijden, zo kort
     mogelijk, nooit door een barricade.
  5. *Punten vrije route*: punten in volgorde, route vrij.
  6. *Punten speciaal*: op elk punt staat een cijfer dat zegt naar welk punt je daarna moet.
  7. *Pace-notes* (AMAC-systeem uit de jaren 70–80): afstanden, bochtgradaties, afslagen.
- Weetje voor *schaal*: het reglement noemt 1:100.000 een schaal "kleiner (nauwkeuriger) dan 1:200.000". Dat is
  omgekeerd (1:100.000 is een *grotere* schaal) en laat zien hoe vaak "groot/klein" bij schalen verwisseld wordt.

**KNAF-reglementen** [V KNAF26]: het Algemeen Reglement 2026 en het Standaard Reglement 2025 regelen tijdcontroles,
stempels en "routeopdrachten", maar **definiëren geen kaartleessystemen**; dat doet elk *bijzonder reglement* van een
rally zelf. Het *Reglement Touring Events 2025* zegt: "In het Reglement dient de organisator een beschrijving van de te
gebruiken kaartlees[systemen]" te geven [V]. Er is dus **geen landelijk standaardreglement** voor kaartleessystemen bij
de KNAF; de Tulpenrallye is een goed uitgewerkt voorbeeld [I].

**Visgraat** en **puzzelritten**: in deze reglementen niet gevonden. Een vereniging of reglement voor
(auto)puzzelritten of oriëntatieritten met een eigen uniform reglement heb ik niet kunnen vinden; nhra.nl is een lege
domeinnaam, puzzelrit.nl staat te koop [V]. Zie open vragen.

**Wandelnet** [V WNET]: een **LAW** (Lange-Afstand-Wandelpad) is een lijnroute van A naar B, **wit-rood**
gemarkeerd; een **Streekpad** is een rondwandeling in één regio, **geel-rood** gemarkeerd. "De routebeschrijving, de
routekaart en de markering ondersteunen elkaar. Als één van de drie afwijkt, kun je altijd nog vertrouwen op de
andere twee." Markeerders lopen elke route twee keer per jaar na. Langste LAW: Nederlands Kustpad, 725 km.
KWBN en de Vierdaagse heb ik niet bekeken.

### Seinen, radio, nood

**Handboek C2000 Brandweer, bijlage C *Radioprocedures*** [V C2000, tabel gelezen als afbeelding]. De enige
gevonden **officiële Nederlandse lijst van dienstuitdrukkingen** (procedurewoorden):
- Werkwijze: simplex, je kunt elkaar niet in de rede vallen; na het indrukken van de zendknop één seconde wachten met
  spreken; "Spreek duidelijk, rustig en nauwkeurig, maar schreeuw nooit"; met dicteersnelheid als de ander moet
  opschrijven; spellen met "IK SPEL", getallen met "CIJFERS" en elk cijfer apart; leestekens uitspreken als PUNT,
  KOMMA, HORIZONTALE STREEP, SCHUINE STREEP.
- Standaardgesprek: "(roepnaam), HIER MELDKAMER, GEEF BERICHT, OVER" → "(bericht), OVER" → "(antwoord), OVER" →
  "(…), UIT".
- **Dienstuitdrukkingen (38, nrs. 22–23 leeg)**, met verklaring: **HIER** (de uitzending komt van het station waarvan
  de roepnaam volgt) · **OVER** ("einde van mijn uitzending en ik verwacht antwoord") · **UIT** ("einde van mijn
  uitzending en ik verwacht geen antwoord", **alleen te gebruiken door het netcontrolestation**) · MOBIEL · KAZERNE ·
  ONBEKEND STATION · **BEGREPEN** ("uw mededeling heb ik begrepen") · **CORRECT** ("uw opmerking/mededeling is
  juist") · **… WACHT** ("wacht tot u weer wordt opgeroepen") · **… SLUITEN** (toestemming om uit te schakelen) ·
  **ALLE STATIONS** · **HERHAAL** · **HERSTEL** ("in deze uitzending is een fout gemaakt; ik vervolg met het laatste
  woord dat goed werd uitgesproken") · BERICHT VOOR U · GEEF BERICHT · **ALLES ACHTER … / ALLES VOOR …** · **CIJFERS** ·
  WOORD ACHTER … / WOORD VOOR … · **SPREEK LANGZAAM** · **SPEL … / IK SPEL …** · RADIOSTILTE / EINDE RADIOSTILTE ·
  SCHAKEL NAAR GESPREKSGROEP (… NU) · STAND-BY · RUKT UIT · TER PLAATSE · NADER BERICHT · PENDELEN · RUKT IN ·
  VERTRAAGD · BUITEN DIENST · INCIDENT MEESTER ("brand meester" bij brand).
- **NATO-spelalfabet met Nederlandse uitspraak**: alfa, bravoo, sjarlie, delta, ekko, fokstrot, golf, hotel, india,
  joeli èt, kielo, liema, maaik, november, oskar, pappa, ke bèk, romeo, sie èrra, tengo, joeniform, viktor, wiskie,
  èksree, jenkie, zoeloe. Schrijfwijze in de tabel: ALPHA, JULIET, WHISKY, X RAY.
- **Uitspraak cijfers** (Nederlands, niet het Engelse *niner*): nul · één ("kort afgebeten") · twee · **de rie** ·
  vier · vijf · zes · **zeuven** · acht · **neegen**.

Voor de app: dit is de bron voor *Portofoon › procedure*. Scouting gebruikt geen meldkamer; de app kan "netcontrole-
station" vertalen naar "leiding/post" [I].

**VERON** [V]: VERON is sinds 2015 erkend als belangenbehartiger van "de Morsecode als traditie in Nederland"; morse
staat op de **Nationale Inventaris Immaterieel Cultureel Erfgoed**. De **Morse Academy** (les aan boord van de SS
Rotterdam) leidt morsetelegrafisten op. **JOTA**: "ieder jaar tijdens het derde volle weekend van oktober". VERON
heeft ook een *zomerkampronde* voor scouts (een zendamateur komt op een kampavond langs), Kids Day (januari en juni) en
YOTA (jongeren tot 26). Cursusmateriaal zit in de VERON-webshop (©). VRZA heeft pagina's voor cursus, examens en
jeugdleden; niet verder gelezen.

**KNRM en Kustwacht** [V KNRM-NS, KNRM-AL]:
- Alarmeren op het water: **VHF kanaal 16** of **VHF/DSC kanaal 70**, roepnaam **"Den Helder Rescue"**; zonder
  marifoon de KNRM Helpt-app (rode NOODGEVAL-knop); anders **0900-0111** (Kustwacht) of **112**. Niet-spoed (motorpech)
  via het KNRM Helpt Assistentie Centrum.
- Noodsignalen: dag- en nachtsignaal (rood stakellicht en oranje rook), **rode parachutefakkel** (tot ongeveer 300 m,
  "bij veel wind iets met de wind mee richten", leren handschoenen), witte parachutefakkel is *geen* noodsein maar
  verlichting; elektronisch handstakellicht. Bakens via COSPAS-SARSAT op 406 MHz: **EPIRB** (schip), **ELT**
  (vliegtuig), **PLB** (persoon; registratie bij de RDI). Positiebakens (AIS-MOB, 121,5 MHz) zijn geen noodsein.
  "Het onterecht uitzenden van noodseinen is strafbaar."
- *Waterveilig* (groep 7–8) [V KNRM-WV]: drie tips als iemand in het water ligt: **1** blijf rustig, houd hem in de
  gaten; **2** regel hulp, bel 112 of laat bellen; **3** zorg voor je eigen veiligheid, gooi iets dat drijft, ga alleen
  het water in als het niet anders kan. Zelf in het water vallen: hoofd beschermen met je armen, jezelf klein maken.
  Mui: lifeguards erbij of 112. De poster *Alarmeren doe je zó!* en de ijsstrip laten het 112-gesprek zien ("Wat
  heeft u nodig en waar bent u?", "Blijf aan de lijn!", "Let op dat je niet zelf door het ijs zakt!").

**Reddingsbrigade, natuurijs** [V RB-IJS]. Officiële Nederlandse bron voor ijs (open vraag 13 in
`touw-kamp-natuur.md`):
- Vooraf: ijsclub, gemeente of Schaatsen.nl raadplegen; alleen erkende locaties; ander natuurijs "nooit als er sneeuw
  op ligt en niet in het donker"; zeggen waar je heen gaat; **ijsprikkers**, reddingsklos of touw, **fluitje**,
  telefoon waterdicht; reservekleding; **nooit alleen**; let op wakken, bijten, kleurverschil, bruggen, riet,
  waterplanten en overhangende takken. Verwijst naar de KNSB-*Twintig gouden regels voor schaatsen op natuurijs*.
- Zelf door het ijs: rustig blijven; ijs afbreken tot het steviger wordt; zijwaarts of ruggelings eruit door je af
  te zetten, op het ijs rollen; met handen of ijsprikkers optrekken, **op je buik wegkruipen en wegrollen**; pas
  staan als het ijs stevig is; onder het ijs: op je rug zwemmen en naar de donkere plek (het wak) zoeken.
- Een ander door het ijs: **112 bellen**; "Ga niet zelf het ijs op richting het slachtoffer"; iets toewerpen
  (reddingsklos, touw, tak, kledingstuk) en hem daarmee eruit trekken; daarna naar een warme plek.

### Weer en sterren

**KNMI Beaufort** [V KNMI-BFT]. Officiële Nederlandse tabel (CC0):

| Bft | Benaming | km/u | m/s | knopen | Uitwerking boven land en bij mens |
|---|---|---|---|---|---|
| 0 | **stil** | 0–1 | 0–0,2 | < 1 | rook stijgt recht of bijna recht omhoog |
| 1 | zwak | 1–5 | 0,3–1,5 | 1–3 | windrichting goed af te leiden uit rookpluimen |
| 2 | zwak | 6–11 | 1,6–3,3 | 4–6 | wind merkbaar in gezicht |
| 3 | matig | 12–19 | 3,4–5,4 | 7–10 | stof waait op |
| 4 | matig | 20–28 | 5,5–7,9 | 11–16 | haar in de war, kleding flappert |
| 5 | vrij krachtig | 29–38 | 8,0–10,7 | 17–21 | opwaaiend stof hinderlijk voor de ogen, gekuifde golven op meren en kanalen en vuilcontainers waaien om |
| 6 | krachtig | 39–49 | 10,8–13,8 | 22–27 | paraplu's met moeite vast te houden |
| 7 | hard | 50–61 | 13,9–17,1 | 28–33 | lastig tegen de wind in te lopen of fietsen |
| 8 | stormachtig | 62–74 | 17,2–20,7 | 34–40 | voortbewegen zeer moeilijk |
| 9 | storm | 75–88 | 20,8–24,4 | 41–47 | schoorsteenkappen en dakpannen waaien weg, kinderen waaien om |
| 10 | zware storm | 89–102 | 24,5–28,4 | 48–55 | grote schade aan gebouwen, volwassenen waaien om |
| 11 | zeer zware storm | 103–117 | 28,5–32,6 | 56–63 | enorme schade aan bossen |
| 12 | orkaan | > 117 | > 32,6 | 64+ | verwoestingen |

Voetnoot KNMI: de windkracht volgt uit het 10-minutengemiddelde, "maar voor wat betreft de benaming 'storm' is bij het
KNMI het gemiddelde over 1 uur bepalend". De uitlegtekst noemt ook "bij windkracht 5 bebladerde takken zwaaien en bij
windkracht 8 twijgjes afbreken". Er bestaat een *biologische windschaal* (Lyall Watson): bij windkracht 9 vliegen
alleen zwaluwen en eenden, vanaf 10 blijven alle vogels aan de grond.

**KNMI wolken** [V KNMI-WOL]: vier **families**: hoge, middelhoge, **verticaal ontwikkelde** en lage wolken. Cirrus
op 6–12 km ("windveren of sluierwolken"; halo; verdwijnende zon of maan is "vaak een voorbode van slechter weer.
Vooral als de cirruswolken uit het westen komen en snel dichter worden"). Middelhoog 2–6 km: altocumulus
(schapenwolk), altostratus (matglaslucht), nimbostratus (regenlucht). Laag onder 2 km: stratus ("opgeloste mist"),
stratocumulus ("de meest voorkomende in West-Europa"); "Ook mist rekent het KNMI tot de lage bewolking". Cumulus =
stapelwolk; cumulonimbus "veroorzaken altijd onweersbuien", aambeeld. Extra: rolwolk (arcus/shelfcloud) voor zware
onweersbuien, parelmoerwolken.

**KNVWS en JWG** [V]: de KNVWS (Koninklijke Nederlandse Vereniging voor Weer- en Sterrenkunde, 125 jaar in 2026)
heeft een landkaart met publiekssterrenwachten en verenigingen met kijkavonden en cursussen, en organiseert op de
eerste zondag van juli de Landelijke Zonnekijkdag. De **JWG** is de landelijke sterrenkundevereniging voor 8–21 jaar
(kampen in de zomer). Geschikt als doorverwijzing ("ga kijken bij een sterrenwacht"), niet als tekstbron.

### Brandweer en buitenleven

**Brandweer, natuurbrand** [V BW-NB]: wat doe je bij een natuurbrand?
1. "Vlucht snel naar een openbare weg, een groot verhard terrein of de bebouwde kom."
2. "**Loop dwars op de brand.** […] Komt de brand uit het zuiden, loop dan niet richting het noorden, maar richting
   het oosten of westen."
3. "Help andere mensen naar een veilige plek."
4. "Bel 112 en geef de locatie van de brand zo precies mogelijk door. Kijk in je omgeving of je herkenningspunten ziet,
   zoals een ANWB-wegwijzer."

"Het grootste gevaar voor mensen is dat ze door het vuur ingesloten raken." Natuurbrandfasen sinds 2018: fase 1
"wees altijd voorzichtig met vuur in de natuur", fase 2 "vermijd vuur in de natuur" (staat al in de notities).

**Staatsbosbeheer, aanvulling** [V SBB-TR]: wildplukken mag "op kleine schaal en voor eigen gebruik", voor bramen en
paddenstoelen "een hoeveelheid van een 250 grams champignonbakje"; een **gps-route uitzetten of een geocache
plaatsen** vraagt vooraf toestemming van de boswachter (raakt routetechnieken en tochten); natuurijs op eigen risico,
"Check altijd bij de lokale ijsclub of knsb.nl of het ijs is vrijgegeven". SBB heeft 21 natuurkampeerterreinen en
vier groepskampeerterreinen (o.a. voor scoutinggroepen) [V *logerenbijdeboswachter.nl*].

**Denk vooruit, noodpakket** [V NCTV-NP, CC0]: voor de eerste 72 uur: water (**3 liter per persoon per dag**),
houdbaar eten, radio op batterijen, mobiel met powerbank, zaklamp met batterijen, kaarsen en lucifers, EHBO-doos,
dekens, **fluitje** ("om hulpdiensten te laten weten waar je bent"), contant geld, gereedschap, hygiëne, kopieën van
identiteitsbewijzen, reservesleutels; elk half jaar controleren. Bruikbaar als vrij te hergebruiken checklistvoorbeeld
naast de paklijst.

**Bushcraft** [V]: Nederlandse sites zijn commercieel (cursussen, reizen, webshop: bushcraftnederland.nl) of
reviewblogs (bushcraft.nl: "Overname is toegestaan doch uitsluitend met bronvermelding"). Een vereniging met open
lesmateriaal heb ik niet gevonden. Geen bron voor de app.

### Natuur

**IVN Deventer, diersporen** [V IVN-DEV]: tweezijdige kaart van de zoogdierenwerkgroep. Bruikbare vuistregels:
**hazenprent ±4 cm = lange kant van een luciferdoosje, konijn ±2½ cm = korte kant**; bij hazen en konijnen komen bij
het huppen de achterpoten vóór de voorpoten; marterachtigen hebben zichtbare nagels (katten niet) en een
"marterloop"; vossenprent smal, **druppelvormig**, bij honden lijkt de afdruk op **een wolkje**; ree: scherpe
hoefjes, bij galop gespreid; bever: vlies tussen de achtertenen, "potloodpunten" aan omgeknaagde bomen; das: neusputjes,
mestputjes langs de territoriumgrens; "**dassen steken, zwijnen breken**"; kegels: muizen knagen netjes, eekhoorns
laten rafels.

**KNNV Utrecht, bomen in de winter** [V KNNV-WB]: een presentatie, geen lesbrief. Noemt de kenmerken (habitus,
bladlittekens, lenticellen, schors, knoppen) en de Nederlandse bronnen: de **KNNV-Knoppentabel** (Janssen en Slagter),
*Knoppen en twijgen* (Godet, Noordboek 2021), *Winterflora bomen en struiken* (Slagter, NatuurMedia 2016). Alle ©.

## Nieuw ten opzichte van de andere notities

Met correcties op `notities/technieken/navigatie-en-seinen.md` (NAV) en `touw-kamp-natuur.md` (TKN).

**Correcties**

1. **KNMI is CC0, niet ©.** TKN §10 zet KNMI-W, -O, -BL, -Z en -B op "© KNMI". De KNMI-site valt onder CC0 met
   gevraagde bronvermelding; alleen foto's en documenten met een eigen vermelding zijn uitgezonderd [V].
2. **Beaufort (TKN §7.2):** de officiële KNMI-naam bij 0 is **"stil"** (niet "windstil", dat is de KMI-term) en 12 is
   **"> 117 km/u"** (niet "≥ 118"). De kolom *Op land* in TKN was [I]; vervang die door de KNMI-kolom hierboven
   (bv. 3 = "stof waait op", niet "blaadjes en twijgen bewegen"; 8 = "voortbewegen zeer moeilijk"). Daarmee is open
   vraag 5 in TKN beantwoord. Extra regel: voor de *benaming* "storm" telt het uurgemiddelde.
3. **Legenda (NAV §1b):** "Een officiële losse Kadaster-legenda is niet gevonden" klopt niet meer: de Kadaster-pagina
   linkt naar de officiële legenda's op PDOK (PNG, CC BY 4.0), nu in deze map. Het Kadaster zegt **"religieus
   gebouw"** en "religieus gebouw met toren", niet "kerk (met/zonder toren)" zoals Scoutpedia; een **toren of hoge
   koepel** zonder kerk heeft een eigen teken.
4. **Equidistantie (NAV §1b, open vraag 7):** niet "2,5 m in heuvelachtig gebied?", maar 2,5 m in de data van
   TOP10NL, ook op de Vaalserberg; de legenda geeft lijnstijlen voor 10, 5 en 2,5 m [V].
5. **Radioprocedure (NAV §4g, open vraag 11):** de Nederlandse woorden staan nu [V] in het Handboek C2000:
   HIER, OVER, UIT, BEGREPEN, HERHAAL, HERSTEL, WACHT, IK SPEL, CIJFERS. Twee nuances: **UIT** is daar alleen voor het
   netcontrolestation; **"herstel"** is het woord voor een correctie (NAV zegt "correctie"; CORRECT betekent in C2000
   "uw opmerking is juist"). De NAVO-cijferuitspraak in het Nederlands is *de rie, zeuven, neegen*, niet het Engelse
   *tree, niner*.
6. **NAVO-alfabet (NAV §4e):** C2000 spelt WHISKY, JULIET, X RAY; NAV volgt de ICAO-spelling (Whiskey, Juliett,
   X-ray). Beide komen voor; kies één schrijfwijze en noem de andere als variant.
7. **IVN-diersporenkaart (TKN §10, [S]):** het is de lokale kaart *Deventer diersporen* van IVN Deventer (versie 2,
   © 2013), geen landelijke IVN-kaart. Nu [V].
8. **KNNV-presentatie (TKN §10, [S]):** nu [V]; het is een presentatie die naar de KNNV-Knoppentabel verwijst.
9. **Naam van de bond:** *Nederlandse Oriënteringsloop Bond* (NOLB), de sport heet *oriënteringslopen*. De
   O-kaartnormen ISOM2017-2 en ISSprOM2019-2 (in NAV §1a [I]) bevestigd via de NOLB [V].
10. **KNVWS** heet *Koninklijke* Nederlandse Vereniging voor Weer- en Sterrenkunde.

**Nieuw**

11. **Kaartleessystemen uit de rallywereld** (Tulpenrallye): bol-pijl met en zonder afstanden, pijlen en punten,
    ingetekende lijn, grensbenadering, ingetekende lijn met barricades, punten vrij en punten speciaal, pace-notes,
    plus algemene regels en herstelcodes. *Grensbenadering*, *barricades* en *punten speciaal* staan niet in de
    32 routetechnieken van Scoutpedia. De regels zijn precies genoeg om een **routetechniek-generator en -checker**
    te bouwen (kortste route, niet keren, geen weg tegengesteld, blokkades).
12. **Bol-pijl in de rally ≈ bolletje-pijltje bij scouting**: zelfde idee (bol = waar je vandaan komt, pijl = waar je
    heen gaat), met extra conventies: verhard doorgetrokken, onverhard gestippeld, blokje = niet inrijden, verticale
    pijl = snel achter elkaar [V TULP25; vergelijking I].
13. **Waterloopbreedtes op de kaart**: < 3 m, 3–6 m, > 6 m. Handig bij *rivierbreedte schatten*: schat eerst, vergelijk
    met de klasse op de kaart [I idee].
14. **LAW wit-rood, Streekpad geel-rood** [V]: aanvulling op "G.R./LAW-routemarkeringen" (Scoutpedia, Vlaams G.R.).
15. **Armseinen KMA 1937**: Nederlandse militaire handseinen, vermoedelijk vrij [I], naast de BP-handsignalen.
16. **Natuurbrand: "loop dwars op de brand"** en de 112-melding met een ANWB-wegwijzer als herkenningspunt [V].
17. **IJs** (Reddingsbrigade) en **water** (KNRM *Waterveilig*): officiële Nederlandse adviezen, beantwoordt TKN
    open vraag 13 voor ijs. STOP en Hug-a-Tree heb ik niet gezocht.
18. **Alarmeren op het water**: kanaal 16 / DSC 70, "Den Helder Rescue", 0900-0111 [V].
19. **Noodpakket** (NCTV, CC0): vrij te hergebruiken checklist, en "fluitje" als officieel advies.
20. **SBB**: gps-route of geocache uitzetten vraagt toestemming van de boswachter; wildpluk-maat 250 g.
21. **Morse als immaterieel erfgoed** en **JOTA = derde volle weekend van oktober** [V VERON].
22. **Defensie**: het Handboek Soldaat heet nu *Handboek Militair, Militaire Basisvaardigheden* (LAND-E&T-02.3,
    2020) en is niet openbaar. Voor kaart, kompas, afstand schatten en panoramaschets is er dus (nog) geen vrije
    Nederlandse militaire bron.

## Open vragen

1. **Woo-verzoek Handboek Militair?** Een verzoek bij Defensie om LAND-E&T-02.3 (of alleen de hoofdstukken kaart en
   kompas, afstand schatten, terreinschets, verbindingen, bivak) openbaar te maken. Na openbaarmaking zonder
   ©-voorbehoud valt het onder art. 15b. Weegt dat op tegen eigen tekst? Doorlooptijd van een Woo-verzoek is weken
   tot maanden [I].
2. **Oude militaire voorschriften op Delpher** (bv. handleidingen kaartlezen of terreinverkenning van vóór 1955):
   vrij en Nederlandstalig, maar niet gezocht. De Delpher-SRU-API werkte niet voor de boekencollectie met de namen
   die ik probeerde (`boeken`, `Boeken`, `BOEKEN_KB`); de juiste collectienaam opzoeken.
3. **Puzzelrit- en oriëntatieritbonden**: bestaat er een Nederlandse bond met een *uniform* reglement voor
   (auto)puzzelritten, met *visgraat*, *ingetekende kaart*, *blinde kaart*? Niet gevonden; namen van clubs of een
   bestaand boekje helpen.
4. **Tulpenrallye-legenda**: de legenda van de kaartfragmenten staat in het *Tulp-infoboek*, dat niet online staat.
   Opvragen? Het reglement van 2026 naast dat van 2025 leggen (systemen kunnen per jaar wisselen).
5. **Licentie IFV/NIPV-documenten**: geen ©-vermelding in het Handboek C2000 gevonden. Is het NIPV "openbare macht"
   in de zin van art. 15b? Dan mogen we de dienstuitdrukkingen letterlijk overnemen; anders in eigen woorden (een
   lijst procedurewoorden is waarschijnlijk geen werk [I]). Er is mogelijk een nieuwere versie dan 2021.
6. **Kadaster-onderwijs**: bestaat er nog een Kadaster-lespakket over de topografische kaart (vroeger via
   Topografische Dienst)? Navragen bij kcc@kadaster.nl.
7. **Hoogtelijnen in de polder**: komen in TOP10NL ook lijnen onder NAP voor (bv. −2,5 m)? Alleen heuvelachtige
   gebieden gecontroleerd.
8. **TOP25-symbolen overtekenen**: mogen we de PNG-legenda (CC BY 4.0) knippen tot losse iconen, of liever de
   symbolen zelf tekenen naar het voorbeeld? Beide mogen met naamsvermelding [I]; kwestie van kwaliteit.
9. **KWBN en Vierdaagse**: routemarkering bij georganiseerde wandeltochten (pijlen, kleuren per afstand) niet bekeken.
10. **Brandweer.nl-licentie**: geen copyright- of disclaimerpagina met hergebruikregels gevonden. Vragen of de
    teksten (natuurbrand, kampvuur) letterlijk mogen.
11. **Duimsprong**: ook in deze bronnen geen Nederlandse term of uitleg gevonden (zie NAV §1h).
12. **Woo-documenten natuurbrand op oefenterreinen** (open.overheid.nl, 09-10-2026: "Brandveiligheidsmaatregelen op
    militaire oefenterreinen CLAS tijdens natuurbrandfasen 1 en 2") niet gelezen [S]; mogelijk concrete regels voor
    vuur en bivak in fase 2.

## Map-inhoud

| Bestand | Wat | Bron |
|---|---|---|
| `kadaster-legenda-top25raster.png` | Officiële legenda TOP25raster, 300 × 2250 px | TOP-LEG (CC BY 4.0) |
| `kadaster-legenda-top50raster.png` | Officiële legenda TOP50raster | TOP-LEG (CC BY 4.0) |
| `tulpenrallye-2025-reglement.pdf` | Reglement Tulpenrallye 2025, bijlagen 1–2 kaartleessystemen (p. 26–31) | TULP25 (©) |
| `knaf-2026-algemeen-reglement-historische-regularity-rallys.pdf` | KNAF-reglement 2026, geen kaartleessystemen | KNAF26 (©) |
| `ifv-handboek-c2000-brandweer-2021.pdf` | Handboek C2000, bijlage C radioprocedures (p. 28–31) | C2000 |
| `knrm-waterveilig-werkboekje.pdf` | Werkboekje Waterveilig (2024) | KNRM-WV (©) |
| `knrm-poster-alarmeren.pdf` | Poster *Alarmeren doe je zó!* (2016) | KNRM-WV (©) |
| `knrm-strip-alarmeren-ijs.pdf` | Strip alarmeren bij ijs (2018) | KNRM-WV (©) |
| `ivn-deventer-diersporen-2013.pdf` | Diersporenkaart IVN Deventer | IVN-DEV (©) |

De ©-bestanden niet in een openbare repository zetten; de URL's in de tabel zijn genoeg om ze opnieuw op te halen.
