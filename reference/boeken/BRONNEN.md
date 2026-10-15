# Boeken en uitgaven over scoutingtechnieken in Nederland (2026-10-14)

Onderzoek naar Nederlandstalige boeken en uitgaven (niet Vlaanderen) die scoutingtechnieken behandelen: van de eerste
bewerkingen van *Scouting for Boys* (1910–1911) tot de huidige Scoutshop. Aanvulling op
`reference/programma/BRONNEN.md`, `reference/pooltochten/BRONNEN.md`, `notities/prior-art.md` §1 en de
bronnensecties van `notities/technieken/*.md`. Wat daar al staat (o.a. *Pionieren* 1987, *Op expeditie in Nederland*,
*Het Kampvuurboek*, *Kamp & bivak*, NPV 1916 en 1928 uit *De Padvinder* / *De Verkenner*) herhaal ik alleen als er
iets nieuws bij komt.

Zekerheid: **[V]** gelezen in de bron · **[S]** alleen uit zoekresultaat of catalogusrecord · **[I]** afgeleid.

## Werkwijze en nuttige ingangen

- **Delpher Boeken** heeft veel meer padvindersboeken dan gedacht. De zoekpagina is JavaScript, maar de JSON-ingang
  `https://www.delpher.nl/nl/pres/results/multi?actions[]=results&actions[]=resultsCount&query=…&coll=boeken`
  werkt zonder sleutel [V]. Tekst per pagina: `http://resolver.kb.nl/resolve?urn=<id>:<00001>:ocr`, hele PDF:
  `…urn=<id>:pdf`, paginalijst: `…urn=<id>:mpeg21` [V].
- **Toegang [V]**: boeken tot en met ±1937 zijn open. Van boeken **vanaf ±1940** geeft de resolver
  "Please provide a (valid) API-key" (status *deleted*); ook enkele oudere boeken met mogelijk nog beschermde auteurs
  gaven **HTTP 403** (o.a. *De padvinders of jonge verkenners* 1911, *Het welpenboekje* 1925, Gilcraft *Eerste hulp
  bij ongevallen voor padvindsters* 1928, Morgan *Op hike* 1936). Die titels staan hieronder met [S].
- **KB-catalogus (GGC)** is via SRU te doorzoeken: `https://jsru.kb.nl/sru/sru?x-collection=GGC&recordSchema=dc&query=dc.publisher="Scouting Nederland"`
  (148 records) [V]. Het uittreksel staat in `catalogus-KB-uittreksel.txt` (±800 regels: SN, NPV, KV, NPG, NGB,
  KJB, plus algemene outdoorboeken). Na ±2006 staan SN-handboeken (Junglegids, Scoutsgids, Explorergids) **niet** in
  de KB-catalogus [V: 0 treffers].
- **Delpher Tijdschriften** via `jsru.kb.nl` met `x-collection=DTS_document` (resultaat per aflevering; OCR per pagina
  via de resolver) [V].
- Scoutpedia-API `https://nl.scoutwiki.org/api.php?action=query&prop=revisions…` werkt (geen Anubis) [V]; de
  zoekfunctie (`list=search`) gaf 0 treffers, `list=categorymembers` wel (Categorie:Boek, 34 pagina's).
- Google Books-API gaf direct HTTP 429; Open Library kende vrijwel niets Nederlands.

## Licentie in het kort [I]

Nederlandse Auteurswet: 70 jaar na het overlijden van de maker (art. 37). Werken **zonder genoemde maker** of met een
**rechtspersoon als maker** (vereniging, ministerie, PTT): 70 jaar na de eerste openbaarmaking (art. 38) — dus alles
van vóór 1956 is nu vrij. **Wetten, besluiten en verordeningen** van de overheid zijn vrij (art. 11); een
legervoorschrift valt daar vermoedelijk onder, en anders onder art. 38. De opdracht vroeg "auteur overleden vóór
1956": dat is de grens voor vrij op 1-1-2026. Delpher-voorwaarden: vrij werk mag vrij hergebruikt worden; bij
beschermd werk alleen eigen gebruik [I, voorwaarden niet opnieuw gelezen].

## Bronnentabel

Bestandsnamen staan in `delpher/`. "Delpher-id" = `https://www.delpher.nl/nl/boeken/view?coll=boeken&identifier=<id>`.

### A. Historisch, gedigitaliseerd en gedownload

| Sleutel | Titel | Auteur / uitgever | Jaar | Onderwerpen | Waar / bestand | Licentie |
|---|---|---|---|---|---|---|
| **HOY10** | *Op! Hollandsche jongens naar buiten! Wenken voor wandelingen, vacantietochten en jongenskampen* | W.J. van Hoytema; Nederlandsche Bond voor Lichamelijke Opvoeding; Brusse, Rotterdam | 1910 | **Eerste Nederlandse bewerking van *Scouting for Boys*** (zonder wet, belofte of klassen): kompas, zon, horloge, Poolster, maan, kerken; kaart; schatten; opmerken; touwverbindingen, boom vellen, hut, tent, vlot, brug; kampkeukens, kampmeubels, knopen; koken; eerste hulp | MMKB18:004984000 → `1910_vanHoytema_…txt` + `.pdf` (134 scans) [V] | Overlijdensjaar Van Hoytema onbekend → **niet zeker vrij**. Illustraties deels van B-P (vrij) |
| **NPO11** | *Baden Powell's Padvindersboek*, "voor Nederland bewerkt … tevens bevattende het reglement en de techniek der Nederlandsche Padvindersorganisatie" | NPO (hoofdbestuur), Scheltens & Giltay, Amsterdam | 1911 | 10 hoofdstukken (zie onder) **plus de NPO-klasse-eisen 1911** (p. 10–27, "samengesteld door het Hoofd-comité") | MMKB18A:021668000 → `1911_Baden-Powells-Padvindersboek_NPO.txt` + `.pdf` (23,7 MB) [V] | Bewerker niet genoemd, organisatie als maker → **vrij** (art. 38) [I] |
| **SV15** | *Seinvoorschrift* (aanschrijving D.v.O. 7 juni 1915) | Departement van Oorlog; KMA Breda | 1915 | **Seinstelsel "de Lange"** volledig: sleutel, letter met vlag en met armen, berichten, tekens, onderwijs in oefeningen, eisen aan een geoefend seiner | MMTRES06:245167000 → `1915_Seinvoorschrift_leger.txt` + `.pdf` [V] | Overheidsvoorschrift → **vrij** [I] |
| **ROM16** | *Handboek voor padvinders* (voorwoord J.B. van Heutsz) | Dr. R. Römer; C.A.J. van Dishoeck, Bussum | 1916 | Vooral **eerste hulp** (bloeding, wonden, verbandleer, vreemde voorwerpen, kunstmatige ademhaling, drenkelingen, electriciteit, vervoer, verbranding), verkeer, natuur, karakter, "hulp in het huisgezin", kookrecepten | MMKB47:269397000 → `1916_Romer_…txt` (360 scans) [V] | Overlijdensjaar Römer onbekend → niet zeker. Medisch verouderd |
| **ABR22** | *Padvinders seinboekje: allerlei methodes o.a. Vreede (3) – Morse – fluit – stok – hand – vlaggen – De Lange*, 2e druk, 24 p. | K. Henry Abraas (troepleider NPO); J.F. van de Ven, Baarn | 1922 | **Vreede** (tabel als tekening), **Morse**, Engelse/Belgische en Franse methode met twee vlaggen, **fluit-, stok-, hand- en vlagsignalen**, **De Lange** ("met toestemming van den Schrijver") | MMKB47:270175000 → `1922_Abraas_…txt` + `.pdf`; tabellen als PNG: `1922_Abraas_vreede-tabel_scan9.png`, `…_morse-tabel_scan8.png` [V] | Abraas' overlijden onbekend → niet zeker |
| **KAMP28** | *Kampeeren* (kampbrosjure) | Jeugdbond voor Onthouding | 1928 | Vooral kampverslagen/propaganda; weinig techniek | MMTRES06:239503000 → `1928_Kampeeren.txt` [V] | Organisatie → vrij [I] |
| **NPV29** | *Het verkennen voor jongens. Een handboek voor de opleiding van jongens tot goede burgers*, 2e druk | Baden-Powell, "voor Nederland vertaald en bewerkt door **Jan Schaap**"; Schefferdrukkerij voor De Nederlandsche Padvinders | 1929 | Volledige NL-*Scouting for Boys* in 26 kampvuurverhalen (zie onder) **met de volledige NPV-klasse-eisen (Nieuweling, 2e, 1e klasse), jaarsterren en vakinsignes** | MMKB47:270926000 → `1929_Baden-Powell_…txt` (474 scans; 1 pagina 403) [V] | Schaap † 10-1-1963 (Scoutpedia [V]) → **beschermd tot 1-1-2034**. B-P zelf vrij. Feiten/eisen parafraseren |
| **NPV30** | *De eerste schreden in het spel van verkennen. Handboekje voor de opleiding tot Nieuweling en Verkenner 2e klasse* | De Nederlandsche Padvinders (Nat. Hoofdkwartier) | 1930 volgens Delpher; dit exemplaar in nieuwe spelling en met declinatie "±11° west" → een druk uit de jaren '30–'40 [I] | Eisen 3e en 2e klasse eis voor eis uitgelegd: wet, saluut, **spoortekens**, vlag, verkennersstok, **knopen** (platte knoop, schootsteek, mastworp, werpankersteek, touwverkorting, paalsteek, bezetten), EHBO, **Morse en Vreede** (met 14 seinregels en ezelsbruggetjes), spoorzoeken/Kim, kompas en kaart | MMKB18:002537000 → `1930_NPV_…txt` + `.pdf` [V]. Andere drukken: MMKB18A:019516000 (1931), MMKB18A:022796000 (1931–34) [S] | Organisatie → **vrij** [I] |
| **PTT30** | *Knopen – steken en sjorringen* | Staatsbedrijf der PTT | ±1930 | 27 genummerde figuren: halve knoop, achtknoop, platte knoop, schootsteek (weversknoop), dubbele schootsteek, halve steek, twee halve steken, **mastworp (2 manieren, met voorslag, met muilsteek)**, dubbele ankersteek, timmersteek (met muilsteek), paalsteek (op brancard), dubbele paalsteek/bootsmansstoeltje, pikétknoop, takeling, **steiger-, kruis-, vorksjorring, kopsjorring op twee- en driebenige bok** | MMKB18A:027678000 → `1930c_Knopen-steken-en-sjorringen.txt` + `.pdf` (tekeningen) [V] | Staatsbedrijf, geen maker → **vrij** [I]. Goede kandidaat voor publiek-domein-knoopfiguren |
| **NMG30** | *De vakinsignes voor padvindsters van de vereeniging "Het Nederlandsche Meisjesgilde"*, 3e uitgave | E.C. ter Meulen; Gilde-Winckel, Amsterdam | ±1930 | Alle NMG-vakinsignes, o.a. Gids, **Sterrenkunde** (10 sterrenfiguren, noorden en uur bij nacht), **Natuurkennis** (Natuurliefhebster: 30 planten, 20 bomen ook in de winter, 10 vogels; Plantenkennis 75 planten …) | MMKB18:008580000 → `1930_terMeulen_…txt` [V] | Ter Meulen: overlijden onbekend |
| **CJR30** | *Eenvoudige wenken voor het kampeeren door jeugdorganisaties* | Centrale Jeugdraad | ±1930 | Kampeerwenken voor jeugdclubs (tenten in bruikleen van Oorlog) | MMKB21:037438000 → `1930c_Eenvoudige-wenken-…txt` [V] | Organisatie → vrij [I] |
| **GIL32** | *Werkjes voor vrije oogenblikken* (*Spare Time Activities*) | Gilcraft (Gidney & Moore); ill. A.A. Moors; Schefferdrukkerij | 1932 (Delpher: 1929) | Vuur zonder lucifers, messchede, rugzak, mocassins, **knopen, touwsplitsen, oogsplits, touwbezetting**, kampmeubels, halsdoekring, pannenkoeken (inhoud: Scoutpedia [V]) | MMKB47:270877000 → `1932_Gilcraft_…txt` [V] | Vertaler onbekend → niet zeker |
| **RED33** | *Gezondheidsleer voor padvindsters* (handleiding vakinsigne) | J.E. Redeke; NMG-hoofdbestuur | 1933 | Hygiëne, organen, ziektekiemen, ongedierte | MMKB18A:022763000 → `1933_Redeke_…txt` [V] | Onbekend |
| **VIS34** | *Voorschrift Inrichten Stellingen, deel II: Pionieren* (V.I.S. II) | Ministerie van Defensie; KMA Breda | 1933/34 | Militair pionieren: gereedschap (schoppen, bijlen, zagen, beitels…), grondwerk, timmerwerk en houtverbindingen, **touw (samenstelling, draagvermogen, rek, onderhoud) en touwverbindingen**, … | Delpher (Univ. Leiden-exemplaar) → `1934_Pionieren.txt` (142 scans) [V] | Overheid → **vrij** [I]. Ook *Voorschrift pionieren voor alle wapens* (Batavia 1933, KB-PDF) [S] |
| **KOOT34** | *Verkenner eerste klasse. Handboekje voor de klasse-eischen*, 2e geheel herziene druk, 72 p. | **Ton Koot**; De Nederlandsche Padvinders | 1934 | **De 12 eerste-klasse-eisen met uitleg**: zwemmen, sparen, **seinen** (Morse 15/min of Vreede 20/min), wielrijden, **eerste hulp** (p. 18–41), koken, **kaartlezen, schetskaart, oriënteren** (stafkaart 1:50.000), **bijl**, **schatten** (25 %), **zwerftocht** met overnachting en rapport, nieuweling opleiden | MMKB47:271559000 → `1934_Koot_…txt` [V] | Koot † 1986 → **beschermd tot 2057** |
| **NPG37** | *Insigneboekje voor kabouters* | Nederlandsch Padvindsters Gilde; Gilde-Winckel, Den Haag | ±1937 | 20 kabouterinsignes, o.a. **Speuren** (5 dierensporen, Kim 8/10), **Seinen (Vredeseinstelsel)**, natuurvriend, fietsen, verkeer, zwemmen, koken | MMKB47:271882000 → `1937_Insigneboekje-voor-kabouters.txt` [V] | Organisatie → **vrij** [I] |

### B. Historisch, op Delpher maar **niet open** (≥1940 of 403) — alleen metadata [S]

| Sleutel | Titel | Auteur / uitgever | Jaar | Onderwerp | Delpher-id |
|---|---|---|---|---|---|
| JV11 | *De padvinders of jonge verkenners* | — | [1911] | vroegste NL-padvindersboekje (Jonge Verkenners?) | MMKB47:268936000 (403) |
| WB25 | *Het welpenboekje* | "De Ouden Grijzen Wolf" (vert. R.L. Leopold & A.E. van Voorthuisen volgens Scoutpedia) | 1925, ±1930, 1934–47 | welpeneisen | MMKB47:270471000, 270970000, 271533000 |
| GIL28 | *Eerste hulp bij ongevallen voor padvindsters* | Gilcraft | [1928] | EHBO | MMKB18A:026236000 |
| MOR36 | *Op hike* | D. Francis Morgan | [1936] | hiken | MMKB06:000001308 |
| GIL40 | *Touw verbindingen* (vertaling Gilcraft *Knotting*) | Gilcraft; NPV | 1940 (herdr. 1962, 1967, SN 1975) | knopen en splitsen | MMKB18C:053649000 |
| SLU40 | *Pionieren*, 158 p. | H. van der Sluys; NPV | 1940 | pionieren | MMKB18C:057478000 |
| DOR47 | *Met kaart en kompas*, 120/143 p. | J. Dormaar; NPV | 1947, 1948 | kaart en kompas | MMKB47:274225000 (KB heeft ook een PDF, PPN 435783246) |
| ROZ47 | *Het spoor van de troep door alle jaargetijden (wenken voor gevorderd verkennerswerk)* | H.M. Rozendaal; NPV | 1947 | gevorderd verkennerswerk | MMKB45:257148000 |
| KJB48 | *Spelregels van de Verkenners van de Katholieke Jeugdbeweging* (voorlopig, verkort) | KJB | 1948 | **KVP/KJB-klasse-eisen** [I] | MMKB45:257004000 |
| VER48 | *Verkenner 1e klas(se)*, instructieboekje | N.A. Verloop | 1948, 1949 | 1e-klasse-eisen | MMKB47:274944000, 275497000 |
| CRE48 | *Jeugd E.H.B.O.* | Jac. Creyghton | 1948 | EHBO | MMKB45:258217000 |
| LEE49 | *Je eigen kamp. Een kampeerhandleiding voor jongens en meisjes van 14 tot 64 jaar* | Titus Leeser | 1949 | kamperen | MMKB47:275340000 |
| NPV50 | *Regels van het spel van verkennen voor jongens* (jongenseditie) | NPV | 1945, 1946, 1950, 1952; *Spelregels* 1959 | NPV-reglement met eisen | MMKB35:173735000, 169377000; MMKB46:264147000 |
| KK50 | *De betere kampkeuken*; *Laaiend vuur. Werkboek voor een schoon en stijlvol kampvuur*; *Op weg naar kamp en bivak* (Jan Stoovelaar) | NPV / div. | ±1950 | kampkeuken, kampvuur, kamperen | MMKB35:171254000, 167049000; MMKB52:305377000 |
| KL50 | *Kaarten en kaartlezen* [1947?]; *Wat weet ik van kaartleggen?* (C. Fries) | — | ±1950 | kaartlezen | MMKB28:013098000; MMKB35:169232000 |
| NPV55 | *Verkenner derde / tweede / eerste klas* (zakboekjes 36–48 p.); *Het Nieuwelingenspoor*; *Eersteklas verkenner*; *De eerste klas tocht* | NPV | 1955–1962 | **NPV-klasse-eisen 1955–61** | MMKB46:263312000, 263313000, 263310000, 263311000, 263309000, 260440000; MMKB47:276361000; MMKB48:282747000 |
| NGB56 | *Vizier op het gidsenspel* | Nederlandse Gidsen Beweging | 1956, 1961 | **NGB-eisen** (katholieke gidsen) [I] | MMKB53:311905000 |
| KJB56 | *Zeeverkennen in de Katholieke Jeugdbeweging* | KJB | 1956 | zeeverkenners | MMKB53:312842000 |
| ZV69 | *Zeeverkenners klasse-eisen* | R.A.H. v. Schalkwijk; NPV | [1969] | zeeverkennerseisen | MMKB48:288336000 |
| RAI44 | *Sterren zoeken en bekijken* | J.J. Raimond | 1944 | sterren | MMKB47:273220000 |

### C. Scouting Nederland en voorgangers 1955–2006 (KB-catalogus) [S tenzij anders]

| Sleutel | Titel | Auteur / uitgever | Jaar | Onderwerp |
|---|---|---|---|---|
| NPV59-KK | *Kaart en kompas*, 43 p. | J.S. Zaneveld (& W.M.K. Kalis); NPV, herdruk SN 1975 | 1959, 1975 | kaart en kompas |
| NPV60-KE | *Verkenners klasse-eisen*, 54 p.; *Toelichting aangepaste Verkenners klasse-eisen* (1970) | P. Koedijk, A. Gelderblom, K. Wijdooge; NPV | 1960, 1970 | NPV-eisen laatste periode |
| NPV60-VL | *Vlieger derde / tweede / eerste klasse; vliegeisen voor luchtverkenners* | B.J. van Senus; NPV | 1960 | luchtverkenners |
| NPV61 | *Brand! Handleiding voor het insigne brandweerman*, 63 p. | NPV | 1961 | brandveiligheid |
| NPV68 | *Vaardigheidsinsignes verkenners van De Nederlandse Padvinders*, 62 p.; *Nieuwe ster- en insigne-eisen voor welpen* | NPV | 1968 | insigne-eisen vlak vóór de fusie |
| KV59 | *Houthakker* | Br. Celestinus (Vencken); KV | 1959, 1968 | **hakken/houtbewerken** |
| KV64 | *Regels van de Vereniging de Katholieke Verkenners*, 174 p. (eerder: *Regels van het spel van verkennen voor jongens*, KV 1934, 104 p.) | KV | 1934, 1964 | **KVP-klasse-eisen** [I] |
| KV69 | *Speuren en pionieren* [230 p.]; *Pats: standaards voor patrouilles, de vaardigheidsinsignes, de kroon, het verkennerssnoer* (47 p.); *Zwerven*; *Het zomerkamp*; *Het projectenboek* | KV | 1969 | technieken en insignes KV |
| KV70 | *Het bivak met de horde*; *Speel het spel op kamp*; *Ken je omgeving* (1972) | KV | 1970–72 | kamp, omgeving |
| NG60 | *Insigneboekje* (40 p.), *Insigne-mapje* (29 p.); *Onder de schijnwerper* (instructie insignespel, 155 p., 1969); *Pio handboek* (1968); *Watergidsen; Behouden vaart!* (1964) | Nederlandse Gidsen (Beweging) | 1960–69 | **NGB-insignes** |
| SN74 | *Touwverbindingen*, 64 p. (herdruk NPV 1962/1967) | SN | 1975 | knopen |
| SN75 | *Speel eens met technieken* (2 dl.); *Bivakmap* (1976); *Kampeermap* (1976); *Op het buitenspoor* (1976); *Rond fourage, shelter en kookvuur* (1978); *Hike map* (1982); *Exploreren* (1979) | SN (landelijke teams) | 1975–82 | **technieken, bivak, hike** |
| SN79 | *Insigneboek voor padvindsters, verkenners en zeeverkenners* (58 p.); *Insigneboek voor kabouters en welpen* (32 p.); *Welpen zakboekje: sterren en insignes* (1975) | SN | 1975–79 | **eerste SN-insignes na de fusie** |
| SN77-ZV | *Monsterboekje* (Landelijke Admiraliteit, 67 p.); *'t Ankerop: zeeverkenners* (G. Blöte, 336 p., 1982); *Blauwe vademecum* (7 dl.); *Leidraad voor zeilers* | SN | 1974–82 | waterwerk |
| SN87-KK | *Kaart en kompas kneepjes*, 36 p. | Geert-Jan ten Napel; SN | 1987 | kaart en kompas |
| SN91 | *Handboek scouts* (Hugo Nelissen, 243 p., ISBN 90-72388-06-2); *Werkboek scouts: activiteiten, tips, wetenswaardigheden* (275 p., 90-72388-02-X); *Specialiteitenboek scouts* (Sander Kessels, 107 p., 90-72388-09-7); *Zakboek scouts* (88 p., 90-72388-07-0); *Zakboek monsterboekje* (90-72388-08-9); *Explorers katern* (4 dl.); *Handboek Esta's*; *Doeboek Esta's* | SN (Big Balloon, Haarlem) | 1991 | **speltakhandboeken scouts 1991** — Zakboek scouts herdrukt 2017 (90-72388-00-3, 128 p.; Open Library) |
| SN93 | *Hiken*, 244 p., ISBN 90-72388-12-7 | Arthur de Bekker; SN | 1993 | **hiken** — niet eerder genoemd |
| SN95 | *Op kamp* (René van Andel, 206 p., 90-72388-13-5); *Kamp & bivak* (Dick van Aggel, 188 p., 90-72388-14-3); *Het kampvuurboek* (Simon van Dijk, 176 p., 90-72388-16-X); *Pionieren* (Chris Blok jr., ill. Jeroen Lindeboom, 158 p., 90-72388-15-1); *Bamboek*, *Rimboeboek* (René Nauta e.a.) | SN | 1995 | technieken; auteurs nu bekend |
| SN04 | *Watch-DoeBoek*, [126] p. | Fleur Laros, Arjan Woertink; **IVN + Scouting Nederland** | 2004 | natuur (doeboek) |
| SN06 | *Handboek scouts met een handicap* | Frank van Geffen; SN | 2006 | — |

Uitgeversprefix van SN (ISBN-10): **90-72388** [V uit records]. Na 2006 geen KB-records voor SN-handboeken.

### D. Huidig aanbod Scoutshop (boekencategorie, 9 titels) [V scoutshop.nl/boeken-en-speelgoed/boeken]

*Zakboek Kaart Kompas GPS* (95 p.; "kaart, kompas en GPS/GNSS"; auteur niet op de pagina), *De Yukon Vuurman*
(survivalverhaal + leerboek, 320 p., 300+ tekeningen, 11–14 jaar), *Outdoor kids: Spoorzoeken / Huttenbouwen /
Sterrenkijken*, *Victorinox Houtsnijden* (Chris Lubkemann), *SAS survival handboek* (36e druk), *De man & het hout*
(Lars Mytting, houtstoken), *Het Zeilboek*. Er is **geen eigen SN-technieken- of knopenboek meer** in de shop [V].
*Scouting EHBO* (Scouting Academy) staat in het SN25-insigne Veilig & Gezond; het is een cursus met Het Oranje Kruis,
geen boek [S, zie programma/BRONNEN].

### E. Algemene Nederlandstalige boeken die scouts gebruiken [S: KB-catalogus]

| Sleutel | Titel | Auteur / uitgever | Jaar | Onderwerp |
|---|---|---|---|---|
| TK76 | *Kaart en kompas* (vertaald uit het Duits), 78 p., ISBN 90-252-6580-4 | Karl Thöne, Edwin Kaufmann; Helmond / Standaard | 1976, 1982, 1996, 1998 | kaart en kompas (zakboek) |
| IVN03 | *Kaart en kompas*, dl. 1–2 (lesmateriaal) | Wim & Arno Ramaekers e.a.; IVN Consulentschap Limburg | 2003 | kaart en kompas, onderwijs |
| ANWB05 | *ANWB Knopenboek: meer dan 100 knopen*, 224 p. | Gordon Perry (vert.); ANWB | 2005, 2009, 2017, 2021 | knopen |
| BUD85 | *Knopenboek* (159 p.); *Het complete knopenboek* (256 p., 2000) | Geoffrey Budworth (vert.); Mondria / De Hoeve / Cantecleer | 1985, 1993, 2000 | knopen |
| HIN74 | *Knopen en steken voor watersporters* | Floris Hin; De Boer | 1974–78 | knopen (water) |
| JAR02 | *Knopen en steken in de praktijk: knopen, steken, takelingen & splitsen* | Colin Jarman; De Alk | 2002, 2004 | knopen, splitsen |
| ANWB96 | *Handboek kamperen: de tent* | Ger van Tongeren; ANWB | 1996 (2000 herzien) | tentkamperen |
| NAU15 | ***Bushcraft handboek***, 285 p., ISBN 978-90-824538-0-5; *Buiten leven: meer dan 100 EXTRA bushcraft skills* (488 p., 2022) | **René Nauta**; EXTRA Survival & Bushcraft, Vledder | 2015, 2019, 2024 | **bushcraft in Nederland**. Nauta schreef ook mee aan SN's *Bamboek*/*Rimboeboek* (1995) — dezelfde persoon? [I] |
| KRO92 | *Survival handboek: overleven in onbewoonde natuurgebieden* | Hans Krook; Kosmos | 1992, 1995 | survival |
| BOG86 | *Survival: overleven als sport* | Jan Boger; Kosmos | 1986 | survival |
| WOU14 | *Jonge woudlopers survival gids* | Dimitri Heikamp, Pascal Oost; Sanoma/Disney | 2014 | survival voor kinderen |
| NJN | Determinatietabellen: *Knoppentabel* (S. Segal, 1960–69), *Libellentabel*, *Amfibieën- en reptielentabel*, *Drollentabel* (J. Haakman, 1976), *Mossentabel*, L. Tinbergen *Roofvogels* (1937) en *Veldkenmerken van steltlopers…* (1940) | Nederlandse Jeugdbond voor Natuurstudie | 1937–1976 | **natuur voor jongeren**; Tinbergen † 1955 → zijn NJN-werk is vrij [I] |
| EHBO-J | *Jeugd EHBO-A / -B, leerstof voor het getuigschrift* | KNBRD/Commissie Jeugd EHBO; Spruyt; later ThiemeMeulenhoff | 1980–2006 | jeugd-EHBO |
| RAP18 | *Over het wandelen, marsch-training en marsch-techniek, en over kaarten en kaartlezen* | W. van Rappard | 1918 | wandelen, kaartlezen (Delpher MMUBL07:000003383, niet gedownload) |
| WIJ12 | *Het lezen en het gebruik van militaire-, fiets- en wandelkaarten* | R.W. Wijnmalen | 1912 | kaartlezen (Delpher MMTRES06:244132000, niet gedownload) |

Niet gevonden in de KB-catalogus: een oriëntatieloopbond-uitgave (NOLB), een NKBV-kaart-en-kompasboek, een
KNNV-jeugdgids. Daar heb ik niet verder naar gezocht.

## Inhoudsopgaven en indeling

**HOY10 — *Op! Hollandsche jongens naar buiten!* (1910)** [V Scoutpedia + scan]: Aan den Hollandschen Jongen · Het
bed uit · Kleeden · Eten, drinken … · **Op marsch** (kompas, zon, horloge, wind, oude katholieke kerken,
jodenbegraafplaats, Poolster, maan) · **De kaart** · **Het schatten** van afstanden, maten, gewichten en getallen ·
**Leer opmerken** · **Handigheid** (touwverbindingen, boom vellen, hut, rietmat, tent, vlotbrugje, vlotten, brug) ·
**In het kamp** (drinkwater, keukens, privaten, veldbedden, weefgetouw, kandelaar, lantaarn, knoopen,
kampuitrusting, kampregels, dagindeling) · **Koken** · **Hoe te helpen** (paniek, drenkelingen, brand, gebroken
ledematen, bloeden, zonnesteek, bewusteloosheid, bevriezen, patiënt dragen) · Bij het kampvuur.

**NPO11 — *Baden Powell's Padvindersboek* (1911)** [V]: I De padvinder (organisatie en technisch deel) 1 · II
Velddienst 35 · III Het kampleven 59 · IV Over goed opmerken 89 · V Waarneming van de natuur 110 · VI Wilskracht,
sterk en gezond 134 · VII Het voorbeeld van de oude ridders 160 · VIII Het redden van menschenlevens 177 · IX Ons
Vaderland 205 · X Een padvinderscorps voor Nederland 209.

**SV15 — *Seinvoorschrift* (1915)** [V]: Seinstelsel "de Lange": I De sleutel · II Een letter met de vlag · III Een
letter met de armen · IV Een bericht · V Tekens · VI Seinen met de vlag (middelen, houding, onderwijs, 1e oefening,
"Ja"/"Neen", "Grond"/"Vlag", 2e oefening) · VII Seinen met de armen · VIII Vlag en armen · IX **Eisen aan een
geoefend seiner** · X Bijlage.

**ROM16 — Römer, *Handboek voor padvinders* (1916)** [V]: Bouw van het lichaam 1 · Bloeding 12 · Wondbehandeling 41 ·
Algemene verbandleer 57 · Speciale verbandleer 65 · Vreemde lichamen 79 · Kunstmatige ademhaling 84 · Schijndood en
bewusteloosheid 94 · Redding van drenkelingen 101 · Schipbreuk, spoorwegongeval 129 · Electriciteit 136 · Vervoer
144 · Verbranding 189 · Gedrag op straat 192 · Kennis van de natuur 206 · Karaktereigenschappen 215 · Het wezen der
padvinderij 232 · Uniformen 263 · Hulp in het huisgezin 273 · Nuttige wenken 318.

**NPV29 — *Het verkennen voor jongens* (Schaap, 1929)** [V]: I Verkennen (verkennerswerk, overzicht opleiding,
organisatie en klasse-eisen p. 45, padvinderswet, verkennersspelen) · II Het buitenleven (in het veld; zeeverkenners;
**seinen en commando's** p. 140, Morse 143–152) · III Kampleven (**pionieren** 164, knopen 164–166, hutten 167;
**kampeeren** 177; **koken** 198) · IV Speuren (opmerken van tekens 206; **spoorzoeken** 222, landloperstekens 229;
deductie 238) · V Woodcraft (dieren 258, planten 276) · VI Weerstandsvermogen · VII Ridderlijkheid · VIII
Reddingswerk (ongevallen 359, kunstmatige ademhaling 378) · IX Vaderlandsliefde (door Rambonnet) · X Voor
instructeurs.

**KOOT34 — *Verkenner eerste klasse*** [V]: zie bronnentabel; de 12 eisen met paginanummers 11–68.

**VIS34 — *V.I.S. II Pionieren*** [V]: I Gereedschappen (schoppen, pikhouweel, bijlen, zagen, beitels, hamers,
tangen, boren, klimsporen, kattekoppen) · II Grondwerk · III Timmerwerk (rondhout, vellen, houtverbindingen,
kramplaten, bederf) · IV **Touwverbindingen** (samenstelling, draagvermogen, rek, krimp, uitrafelen, onderhoud;
verlengen …) · verder niet uitgeschreven.

**Sleutel 14** (explorers, ±2000–2011) staat met inhoudsopgave op Scoutpedia [V]; geen techniek.

## Inhoud die direct bruikbaar is

### Seinstelsel **Vreede** [V: ABR22 scan 9, NPV30 scan 43–45, Allen Weerbaar 4-11-1910, Militair Blad 15-11-1886]

- **Herkomst**: bedacht door **luitenant ter zee Vreede**, die er in november 1886 een voordracht over hield in de
  Marine Vereeniging te Nieuwediep [V Militair Blad, MMNMM02:000400022 p. 6]. Rond 1900–1915 gebruikt bij
  infanterieregimenten en door de weerbaarheidsverenigingen, ook met **gekleurde lantaarns** bij nacht [V Militaire
  Spectator; Militair Weekblad]. In 1915 kreeg het leger het **De Lange**-stelsel (SV15).
- **Werking**: een **tweearmig standenstelsel**. De **gemerkte rechterarm** (rood vlaggetje) en de **ongemerkte
  linkerarm** (of wit/blauw diagonaal vlaggetje) staan elk in stand **0–4** (zijwaarts, in kwartcirkels); een letter
  is een "breuk" rechts/links. Uit de tabel [V ABR22]:

  | rechts \ links | 0 | 1 | 2 | 3 | 4 |
  |---|---|---|---|---|---|
  | **0** | (rust) | a | e | o | u |
  | **1** | b | c | d | f | g |
  | **2** | h | i/j | k | l | m |
  | **3** | n | p | q | r | s |
  | **4** | t | v | w | y | z |

  Ezelsbruggen: **"Arie Eet Ook Uien"** (rij 0: klinkers), **"Ben Heden Niet Thuis"** (kolom 0: b h n t), **"Corrie
  (Chris) Komt Ruzie Zoeken (Met Wim)"** (dubbelstanden c k r z, plus m w) [V ABR22, NPV30]. Cijfers: na het
  cijferteken; **1=b 2=h 3=n 4=t 5=a 6=e 7=o 8=u 0=z**, en **9=k** (ABR22-tabel) of **9=r** (Allen Weerbaar 1910,
  OCR) — tegenstrijdig. Een decimaalteken is w; geen leestekens [V Padvindersblad 19-11-1915].
- **Procedure** (NPV30): oproepsein = beide armen een paar keer in een halve cirkel zwaaien; contrasein/begrepen =
  beide armen van stand 1 naar het lichaam; ruststand = vlaggetjes gekruist voor het lichaam; "achtergrond verbeteren" =
  armen gekruist boven het hoofd; per post drie man (aflezer, seiner, schrijver); veertien seinregels (vlag in het
  verlengde van de arm, precies zijwaarts, na elke letter terug naar rust, lucht als achtergrond …). Snelseinen:
  handen even tegen de borst in plaats van rust.
- **Wie gebruikte het**: NPO 1911 (2e klasse: letters Morse **en** Vreede; 1e klasse 16 letters/min, Morse of
  Vreede) [V NPO11]; NPV 1928–1934 (2e klasse Morse of Vreede; 1e klasse Morse 15/min of **Vreede 20/min**) [V NPV29,
  KOOT34]; **welpen** NPV ("onze spelregels (regel 131) laten de welp … geen keuze": welpen seinen Vreede, verkenners
  in het algemeen Morse) [V Waakt dec. 1938, MMKB14:002317022 p. 8]; **kabouters** NPG 1937 [V NPG37].

### Seinstelsel **De Lange** [V: SV15, ABR22; Scoutpedia *Seinstelsel De Lange* bestaat al]

Van **1e luitenant regiments-adjudant H.H. de Lange**, eind 1915 in het leger ingevoerd [V Scoutpedia]. Een
**telstelsel**: letter = plaats in het alfabet (a=1 … z=26, **25 = ij**, er is geen y [V SV15]; ABR22 heeft 25 = y);
**slagen links = 1–4, slagen rechts = 5-tallen** (e = 1× rechts, f = rechts + links, j = 2× rechts, o = 3× rechts,
t = 4× rechts, ij = 5× rechts, z = 5× rechts + 1× links). Ezelsbrug: de vijfvouden vormen **"e-j-o-t-ij"** [V ABR22].
Aparte tekens voor ja/nee, woord af, bericht uit, cijfer, langzamer, "grond", "vlag". NPV 1916: 2e klasse ≥ 10
tekens/min, 1e klasse ≥ 15 tekens/min met arm-, licht- en fluittekens (zie programma/BRONNEN, NPV16). Na 1916
verdwijnt De Lange uit de scoutingeisen; in 1928–1934 is het Morse of Vreede [V NPV29, KOOT34].

### Klasse-eisen van voorgangers [V]

- **NPO 1911** (NPO11 p. 10–27): leerling-padvinder (≥ 6 weken oefenen, belofte) → **2e klasse**: EHBO-beginselen en
  eenvoudig verband · letters van **Morse en Vreede** · spoor 1 km in ⅓ uur (of etalage) · **1 km in 7 min
  padvindersgang** (40 passen hard, 40 langzaam) · houtvuur met ≤ 2 lucifers · rijst en aardappels in de
  menageketel · **16 kompasstreken** · ≥ 25 ct op de spaarbank · **lassoproeven** · koninklijke standaard → **1e
  klasse** (≥ 4 maanden later): 50 m zwemmen · **16 letters/min** Morse of Vreede · **tocht 20 km te voet of per boot
  (of 40 km per fiets)** met schriftelijk verslag en wegschets · de meest voorkomende verbanden, drenkeling, gas,
  brand, elektriciteit, ijs · **stafkaart** lezen, windstreken zonder kompas · dunne boom of paal (20 cm) doorhakken of
  werkstuk · **schatten** (afstand, hoogte, rivierbreedte, gewicht) binnen 25 % · een leerling opleiden · smakelijk
  koken · 75 ct · **polsstokspringen**. Konings Padvinder: 1e klasse + 3 van EHBO, trompetter, wielrijder,
  scherpschutter, zeeman, seiner. Dit was nog niet bekend: programma/BRONNEN begint bij NPV 1916.
- **NPV 1929 Verkenner 1e klasse** (NPV29 p. 45–50; dezelfde eisen in KOOT34, "Regel 430"): ≥ 3 maanden 2e klasse ·
  **75 m zwemmen** (of een insigne: ambulance, brandweerman, schutter, gids, seiner, bespieder) · ≥ ƒ 2,50 · **Morse
  15/min of Vreede 20/min**, oproep-, begrepen-, einde- en cijfersein · wielrijden en banden plakken · **EHBO**:
  slagaders, bloeding stelpen, beenbreuk, drenkeling bijbrengen (methode Schäfer), bewusteloosheid, brand, paard op
  hol, gas, ijs, elektriciteit · **patrouillemaaltijd** (hutspot, jachtschotel, havermout; of konijn villen /
  vogel plukken; brood en pannenkoeken) op houtvuur · **kaartlezen, schetskaart, oriënteren zonder kompas** · **boom
  vellen of hout klein maken, bijl slijpen** (of werkstuk/model) · **schatten** binnen 25 % (afstand, slootbreedte,
  hoogte, oppervlak, gewicht, inhoud, tijd) · **zwerftocht ≥ 10 km** (te paard 25 km), alleen of met z'n tweeën,
  overnachten in **tentje of shelter**, rapport + schetskaart waarmee een derde de tocht kan herhalen, één warme
  maaltijd, alles als bepakking · een nieuweling opleiden. Dit vult het gat "eerste-klasse-eisen 1928 niet gevonden"
  in programma/BRONNEN §2.5. De nieuweling- en 2e-klasse-eisen in NPV29 zijn gelijk aan NPV28.
- **NPV na 1930** (NPV30): nieuweling-knopen nu **platte knoop, schootsteek, mastworp, werpankersteek, touwverkorting,
  paalsteek + touw bezetten** (de vissersknoop uit 1928/29 is vervangen door de werpankersteek) [V].
- **NMG** (Meisjesgilde, protestants-christelijk) en **NPG** (Padvindstersgilde): klasse-eisen bestonden ("2e en 1e
  klasse", NMG30); **De Padvindster** begon in 1927 een reeks die "naar volgorde de klasse-eischen" behandelt (3e
  klasse o.a. "tien boomen aan het blad kennen", "geschiedenis der Nederlandsche vlag") [V MMKB14:002245013 p. 6–7].
  De volledige lijst heb ik niet uitgeschreven.
- **KVP / KJB**: 1930 *Aanvullingen van de N.P.V. spelregels voor "De Katholieke Verkenners"* — de KV gebruikten
  toen de **NPV-spelregels met aanvullingen** [S KB-catalogus]. Eigen *Regels van het spel van verkennen* (KV 1934,
  104 p.) en *Spelregels* (KJB 1948) zijn niet online [S].
- **NGB** (katholieke gidsen): *Vizier op het gidsenspel* (1956/61) en *Insigneboekje* (1960) — niet online [S].

## Nieuw ten opzichte van de andere notities

1. **Vreede bestaat al sinds 1886** (luitenant ter zee Vreede) en is een **tweearmig 5×5-standenstelsel** met een
   complete lettertabel en ezelsbruggen. Het was het **welpen- en kabouterseinstelsel** tot in elk geval 1938, en
   een alternatief voor Morse bij de verkenners (1911–1934). In onderwerpen.md stond nog "wat ze precies waren is
   nog niet uitgezocht".
2. **De Lange** is het legerstelsel van eind 1915 (H.H. de Lange); het **volledige legervoorschrift** (SV15) staat
   nu lokaal, en mag waarschijnlijk vrij gebruikt worden.
3. **NPO-klasse-eisen 1911** en **NPV 1e klasse 1929/1934** (de eerdere notities hadden 1916 en 1928 2e klasse).
   Nieuwe "klassieke" onderdelen: **padvindersgang 1 km in 7 min**, **lassoproeven**, **polsstokspringen**, **konijn
   villen**, **zwerftocht met schetskaart die een ander kan nalopen**, **Vreede 20/min**.
4. **Publiek-domein-kandidaten met tekeningen**: PTT-knopenboekje (±1930, 27 knopen en sjorringen), NPV30 (knopen,
   Vreede, Morse, kompas), NPO11, SV15, VIS34, NPG37. Die kunnen bron worden voor eigen figuren of citaten.
5. **Twee eerdere Nederlandse bewerkingen** van *Scouting for Boys*: Van Hoytema 1910 (*Op!*) en NPO 1911 — beide
   compleet op Delpher.
6. **SN-uitgaven 1974–2006 met auteurs en ISBN** (prefix 90-72388), o.a. *Hiken* (Arthur de Bekker, 1993), *Op kamp*
   (René van Andel, 1995), *Specialiteitenboek scouts* (1991), *Kaart en kompas kneepjes* (1987), *Speel eens met
   technieken* (1975), *Rond fourage, shelter en kookvuur* (1978), KV *Speuren en pionieren* (1969) en *Houthakker*.
   Het **Handboek Hiken** op Scoutpedia lijkt op *Hiken* (1993) [I, niet vergeleken].
7. **Zeeverkenners**: aparte klasse-eisen (1969) en monsterboekjes (1948, 1977) — relevant voor de waterkant.
8. **Na 2006 geen SN-techniekboeken meer**: de Scoutshop verkoopt alleen boeken van derden (o.a. *Zakboek Kaart
   Kompas GPS*, *De Yukon Vuurman*). De markt voor een Nederlandstalig techniekenhandboek voor scouts is dus leeg [I].
9. **René Nauta** (*Bushcraft handboek*, 2015) is de Nederlandse bushcraftbron; mogelijk dezelfde Nauta als bij
   *Bamboek*/*Rimboeboek* [I].

## Open vragen

1. **Overlijdensjaren** van W.J. van Hoytema, Dr. R. Römer, K. Henry Abraas, E.C. ter Meulen en J.E. Redeke: zijn
   HOY10, ROM16, ABR22, NMG30 en RED33 vrij? (Bij overlijden vóór 1956: ja.)
2. **Vreede-cijfer 9**: k (ABR22) of r (Allen Weerbaar 1910)? De scan van Allen Weerbaar nakijken
   (MMNMM02:000426067 p. 1), of een NPV30-tabel (staat als tekening in de PDF, niet bekeken).
3. Voornaam en levensjaren van **luitenant ter zee Vreede**; de oorspronkelijke publicatie (1886?) zoeken in het
   Marineblad (Delpher `dts:`).
4. **NPG/NMG-klasse-eisen** uitschrijven uit *De Padvindster* (reeks vanaf 1927) en *De Schalmei*; **KV-eisen 1934**
   en **KJB 1948**, en **NGB 1956** kunnen alleen via de KB-leeszaal of een Delpher-sleutel.
5. Is de Delpher-API-sleutel (voor 1940–1970-boeken) voor dit project aan te vragen, of is er een KB-leeszaalbezoek
   nodig voor Dormaar *Met kaart en kompas* (1947), Van der Sluys *Pionieren* (1940) en de NPV-klassenboekjes 1955–61?
6. Klopt het dat SN na ±2010 geen gedrukte techniekhandboeken meer uitgaf (alleen speltakgidsen en online
   insignebladen)? Navragen bij de Scoutshop of het SN-archief (KDC Nijmegen).
7. De oriëntatieloopbond (NOLB), NKBV en KNNV heb ik niet gevonden in de catalogus; nog los zoeken als die
   gewenst zijn.

## Bestanden in deze map

- `BRONNEN.md` — dit bestand.
- `catalogus-KB-uittreksel.txt` — ruwe GGC-zoekresultaten (jaar | titel | auteur | uitgever | omvang | ISBN/PPN).
- `delpher/*.txt` — OCR per scan (ongecorrigeerd), kop met Delpher-link. 16 boeken.
- `delpher/*.pdf` — 6 PDF's met tekeningen: HOY10, NPO11, SV15, ABR22, NPV30, PTT30 (samen ±42 MB).
- `delpher/1922_Abraas_vreede-tabel_scan9.png`, `…_morse-tabel_scan8.png` — de handgetekende seintabellen.
