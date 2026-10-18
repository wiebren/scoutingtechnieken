# Scoutingtechnieken

Een installeerbare webapp (PWA, werkt helemaal lokaal) om scoutingtechnieken te leren en te verkennen: knopen en
sjorringen, kaart en kompas, tochttechnieken, seinen en geheimschriften, vuur, kamperen, natuur, weer en EHBO.
Interface en documentatie in het Nederlands, code in het Engels. Zusterproject van
[lelievlet](https://scoutvaardig.nl/lelievlet/), dat het water voor zijn rekening neemt.

De app heeft Zoeken (ruim 550 onderwerpen in veertien categorieën), Insignes, Oefenen (alles om zelf te doen, per
categorie) en Instellingen (achter het tandwiel: licht, donker of automatisch, en wat er over de app te weten valt). In het menu kies je een niveau (1, 2, 3 of Extra, zoals bij de insignes); de lijsten tonen dan
wat daarbij hoort. De knopen hebben voorlopig een eenvoudige tekening; de stappen en animaties komen later uit een apart project.

| Map | Wat |
|---|---|
| `web/` | De app: gewoon JavaScript met Vite, geen framework |
| `reference/` | Bronmateriaal en de index daarop — begin bij `reference/README.md` |
| `notities/` | Eigen onderzoek (niet in git); de onderwerpenboom staat in `notities/onderwerpen.md` |

## Ontwikkelen

```sh
cd web
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # controleert eerst de data (pnpm check), dan naar dist/ met de service worker
pnpm preview    # de build bekijken, ook offline en installeerbaar
pnpm build:pages  # wat online komt: de homepage en handleiding (site/) op de root, de app in app/, naar pages/
pnpm icons      # de app-iconen opnieuw tekenen (vraagt rsvg-convert)
pnpm insignes   # de insignes uit de insignebladen in reference/ halen (vraagt pdfimages en magick)
```

Online: <https://scoutvaardig.nl/scoutingtechnieken/> (de app: `app/`). Elke push naar `main` bouwt en publiceert
de site via `.github/workflows/pages.yml`.

## Hoe de app in elkaar zit

- **Bladen** (`web/src/data/bladen/`, één bestand per categorie): de technieken, elk in precies één categorie en één
  groep (`web/src/data/categorieen.js`). Een blad weet niets van insignes of niveaus.
- **De insignelaag** (`web/src/data/insignes.js`): het insignepakket van Scouting Nederland, met
  per insigne en niveau een lijst bladen, in eigen woorden. De enige dwarsdoorsnede. Daaruit volgt het niveau van
  een blad voor de niveaukeuze in het menu (`web/src/data/niveaus.js`, `web/src/niveaukeuze.js`): elk niveau waar
  het in staat, of Extra.
- **Schermen**: `zoeken.js` en `insignes.js` delen de lijst met het kaartje (`splitview.js`, `bladkaart.js`);
  `oefenen.js` en `over.js` staan op zichzelf. Waar je bent staat na de `#` (`router.js`). Zoeken (`zoek.js`) kijkt
  naar naam, andere namen, Engels, groep en tekst, zonder accenten, en vindt ook het enkelvoud van een meervoud.
- **Tekeningen** (`web/src/plaatjes.js` en `web/src/plaatjes/`, één bestand per categorie): SVG als tekst, in de
  kleuren van het thema; ze laden als aparte bundel bij het eerste kaartje met een tekening.
- **Zelf doen** (`web/src/doe/`, per categorie een map met een eigen lijst): de interactieve blokken op een blad,
  elk een losse module die pas laadt als het kaartje opengaat. Oefenen zet ze per categorie bij elkaar. De 3D-route
  (`web/src/doe/route/`) gebruikt three.js.
- **Opmaak** (`web/src/style.css`): mobile first. Onder 760px de navigatie onderin, daarboven een balk links, vanaf
  1100px een zijbalk met de lijst en het kaartje naast elkaar. De kleuren zijn het groen, blauw en rood van
  scouting.nl, het teal van de insignes en de niveaukleuren geel, oranje en paars. Er zijn nog geen beeldmerken: het
  icoon is een windroos.
- **Offline**: `web/sw.js` houdt alles wat de app nodig heeft; de build schrijft de bestandslijst en de versie erin.
- **Op dit toestel** (`web/src/opslag.js`, localStorage): wat je afvinkt bij de insignes en welke insignes je hebt
  gekregen, je niveaukeuze, het thema, welke updates je gezien hebt, en je naam als je die bij een melding
  invult (`web/src/melden.js`). Er gaat niets naar een server, behalve een melding die je zelf verstuurt: die
  wordt een openbaar issue op GitHub.

## Licentie

© 2026 Wiebren Braakman. Het hele project valt onder [CC BY-NC-SA 4.0](LICENSE)
(Naamsvermelding-NietCommercieel-GelijkDelen), net als [lelievlet](https://github.com/wiebren/lelievlet): de app in
`web/`, de teksten erin (namen, uitleg, de samenvattingen van de insignelaag) en de eigen indexen in `reference/`.
Delen en bewerken mag, niet commercieel, als particulier en als scoutinggroep, school, vereniging of andere
organisatie zonder winstoogmerk; met naamsvermelding, en een bewerking deel je onder dezelfde licentie.

Wat van anderen is, valt niet onder deze licentie:

- Het insignepakket, de eisteksten, de insignes en het logo zijn van Scouting Nederland. De app volgt de indeling en
  noemt de namen van de insignes en de niveaus; de samenvattingen zijn in eigen woorden. De afbeeldingen van de
  insignes in `web/public/insignes/` komen uit de insignebladen van Scouting Nederland (© Scouting Nederland).
- De kaartvoorbeelden in `web/public/kaarten/` komen van het Kadaster (TOPraster, CC BY 4.0), OpenStreetMap
  (© OpenStreetMap-bijdragers, ODbL), OpenSeaMap en Waymarked Trails (CC BY-SA). De app zet de bron onder elk beeld.
  De legenda in `web/src/doe/legenda/` is nagetekend naar de legenda TOP25raster van het Kadaster (CC BY 4.0).
- De bronnen die `reference/` beschrijft houden hun eigen voorwaarden; de downloads zelf staan niet in de repository.
- Tekst van Scoutpedia (CC BY-NC-SA 4.0, dezelfde licentie) mag met naamsvermelding worden overgenomen.
- De windschaal van Beaufort is van het KNMI (CC0, "bron: KNMI").
- De sterren komen uit de Yale Bright Star Catalogue (publiek domein).
- Een paar knooptekeningen in `web/src/plaatjes/touw.js` zijn nagetekend naar beelden op Wikimedia Commons: de platte
  knoop en de oudewijvenknoop naar *Square knot.svg* en *Granny knot.svg* (CountingPine, publiek domein), de
  schootsteek naar de foto *Schotstek rechts.jpg* (Markus Bärlocher, publiek domein), de karaaksteek naar *Chambers 1908
  Carrick Bend.png* (Chambers's Twentieth Century Dictionary, 1908, publiek domein) en de timmersteek naar *EB1911 - Knot -
  Fig. 20 - Timber Hitch.jpg* (Encyclopaedia Britannica 1911, publiek domein).
- Vite en three.js houden hun eigen licentie (MIT).
