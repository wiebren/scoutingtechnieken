# Scoutingtechnieken

Een installeerbare webapp (PWA, werkt helemaal lokaal) om scoutingtechnieken te leren en te verkennen: knopen en
sjorringen, kaart en kompas, tochttechnieken, seinen en geheimschriften, vuur, kamperen, natuur, weer en EHBO.
Interface en documentatie in het Nederlands, code in het Engels. Zusterproject van
[lelievlet](https://github.com/wiebren/lelievlet), dat het water voor zijn rekening neemt.

Er is een eerste opzet van de app: Zoeken, Insignes, Oefenen (nog leeg) en Over. De inhoud groeit nog.

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
pnpm icons      # de app-iconen opnieuw tekenen (vraagt rsvg-convert)
```

## Hoe de app in elkaar zit

- **Bladen** (`web/src/data/bladen/`, één bestand per categorie): de technieken, elk in precies één categorie en één
  groep (`web/src/data/categorieen.js`). Een blad weet niets van insignes of niveaus.
- **De insignelaag** (`web/src/data/insignes.js`): het insignepakket van Scouting Nederland als bril op de bladen,
  per insigne en niveau een lijst bladen, in eigen woorden. De enige dwarsdoorsnede.
- **Schermen**: `zoeken.js` en `insignes.js` delen de lijst met het kaartje (`splitview.js`, `bladkaart.js`);
  `oefenen.js` en `over.js` staan op zichzelf. Waar je bent staat na de `#` (`router.js`).
- **Opmaak** (`web/src/style.css`): mobile first. Onder 760px de navigatie onderin, daarboven een balk links, vanaf
  1100px een zijbalk met de lijst en het kaartje naast elkaar. De kleuren zijn het groen, blauw en rood van
  scouting.nl, het teal van de insignes en de niveaukleuren geel, oranje en paars. Er zijn nog geen beeldmerken: het
  icoon is een windroos.
- **Offline**: `web/sw.js` houdt alles wat de app nodig heeft; de build schrijft de bestandslijst en de versie erin.

## Licentie

© 2026 Wiebren Braakman. Het hele project valt onder [CC BY-NC-SA 4.0](LICENSE)
(Naamsvermelding-NietCommercieel-GelijkDelen), net als [lelievlet](https://github.com/wiebren/lelievlet): de app in
`web/`, de teksten erin (namen, uitleg, de samenvattingen van de insignelaag) en de eigen indexen in `reference/`.
Delen en bewerken mag, niet commercieel, als particulier en als scoutinggroep, school, vereniging of andere
organisatie zonder winstoogmerk; met naamsvermelding, en een bewerking deel je onder dezelfde licentie.

Wat van anderen is, valt niet onder deze licentie:

- Het insignepakket, de eisteksten, de insignes en het logo zijn van Scouting Nederland. De app volgt de indeling en
  noemt de namen van de insignes en de niveaus; de samenvattingen zijn in eigen woorden.
- De bronnen die `reference/` beschrijft houden hun eigen voorwaarden; de downloads zelf staan niet in de repository.
- Tekst van Scoutpedia (CC BY-NC-SA 4.0, dezelfde licentie) mag met naamsvermelding worden overgenomen.
- De windschaal van Beaufort is van het KNMI (CC0, "bron: KNMI").
- Vite houdt zijn eigen licentie (MIT).
