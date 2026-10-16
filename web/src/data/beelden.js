// Pictures that are not ours: map samples, in public/. Each says where it comes from, and the card
// shows that under it - their licences ask for it. A blad shows them with `beelden: [{ beeld, titel?, bij? }]`;
// with a titel on each, the card shows one at a time with chips to switch (the same spot at three scales).
// Where they come from and how they were made: notities/technieken/kaart-en-kompas.md, Beelden.

export const BRONNEN = {
  kadaster: 'Kadaster, TOPraster via PDOK (open data)',
  osm: '© OpenStreetMap-bijdragers (ODbL)',
  wandel: '© OpenStreetMap-bijdragers (ODbL), routes: Waymarked Trails (CC BY-SA)',
  zeekaart: '© OpenStreetMap-bijdragers (ODbL), tonnen en bakens: OpenSeaMap (CC BY-SA)',
};

const kaart = (naam, alt, bron, w = 800, h = 560) => ({ src: `kaarten/${naam}.webp`, w, h, alt, bron });

export const BEELDEN = {
  'top25-soester-duinen': kaart('top25-soester-duinen', 'Topografische kaart 1:25.000 van de Soester Duinen: zand, bos, paden, hoogtelijnen en het RD-raster', 'kadaster'),
  'top50-soester-duinen': kaart('top50-soester-duinen', 'Topografische kaart 1:50.000 rond de Soester Duinen', 'kadaster'),
  'top100-soester-duinen': kaart('top100-soester-duinen', 'Topografische kaart 1:100.000 rond Soest en Soesterberg', 'kadaster'),
  'top250-amersfoort': kaart('top250-amersfoort', 'Overzichtskaart 1:250.000 rond Amersfoort met snelwegen, N-wegen en plaatsen', 'kadaster'),
  'osm-soester-duinen': kaart('osm-soester-duinen', 'OpenStreetMap van de Soester Duinen', 'osm'),
  'wandelroutes-soester-duinen': kaart('wandelroutes-soester-duinen', 'Gemarkeerde wandelroutes als gekleurde lijnen over OpenStreetMap, Soester Duinen', 'wandel'),
  'openseamap-eemmeer': kaart('openseamap-eemmeer', 'Vaargeul in het Eemmeer bij Spakenburg met rode en groene tonnen', 'zeekaart'),
};
