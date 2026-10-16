// Bodemgebruik, drawn again from the Kadaster legenda TOP25raster (CC BY 4.0). See ./index.js.
// Each area is a block (x 4..60, y 3..21) in its fill colour, sprinkled with its small signs.
const GRAS = '#DEE9AF'; const AKKER = '#FFFCCF'; const BOS = '#A4C95D'; const NAT = '#E3EBAE';
const GROEN = '#00905E'; const BLAUW = '#0096D9';

/** The block itself, with the thin grey edge an area gets on the map. */
const blok = (kleur, binnen = '') => `<path d="M4 3H60V21H4Z" fill="${kleur}"/>${binnen}`
  + '<path d="M4 3H60V21H4Z" fill="none" stroke="#6b6b6b" stroke-width=".5"/>';
/** Signs on a staggered grid: rows at the given heights, every `dx` along a row, odd rows shifted half a step. */
const raster = (teken, rijen, dx = 6, x0 = 8) => rijen.flatMap((y, r) => {
  const uit = [];
  for (let x = x0 + (r % 2) * (dx / 2); x <= 57; x += dx) uit.push(teken(x, y, uit.length + r));
  return uit;
}).join('');
const lijn = (kleur, d, dik = 0.6) => `<path d="${d}" fill="none" stroke="${kleur}" stroke-width="${dik}"/>`;

// The small signs, each centred on (x, y).
const boom = (x, y) => `<circle cx="${x}" cy="${y - 0.8}" r=".9" fill="none" stroke="#000" stroke-width=".55"/>${lijn('#000', `M${x} ${y + 0.1}V${y + 1.8}`, 0.55)}`;
const kwekerij = (x, y) => `<circle cx="${x}" cy="${y}" r="1" fill="none" stroke="#000" stroke-width=".55"/>`;
const populier = (x, y) => `<ellipse cx="${x}" cy="${y - 0.7}" rx=".8" ry="1.3" fill="none" stroke="#000" stroke-width=".5"/>${lijn('#000', `M${x} ${y + 0.6}V${y + 2}`, 0.5)}`;
const loof = (x, y) => lijn(GROEN, `M${x - 1.1} ${y + 1}V${y}a1.1 1.1 0 0 1 2.2 0V${y + 1}`);
const naald = (x, y) => lijn(GROEN, `M${x - 1.1} ${y}L${x} ${y - 1.8}L${x + 1.1} ${y}M${x} ${y - 1.8}V${y + 1.6}`);
const griend = (x, y) => lijn(GROEN, `M${x - 1.3} ${y - 1.8}Q${x - 1.3} ${y - 0.3} ${x} ${y - 0.3}Q${x + 1.3} ${y - 0.3} ${x + 1.3} ${y - 1.8}M${x} ${y - 2}V${y + 1.8}`);
const riet = (x, y) => lijn('#2E2E24', `M${x - 1.4} ${y + 1}H${x + 1.4}M${x - 0.8} ${y + 1}V${y - 0.2}M${x} ${y + 1}V${y - 1.4}M${x + 0.8} ${y + 1}V${y + 0.1}`, 0.5);
const kruis = (x, y) => lijn('#000', `M${x} ${y - 1.6}V${y + 1.6}M${x - 1} ${y - 0.6}H${x + 1}`, 0.55);
const paneel = (x, y) => lijn('#8A8A8A', `M${x - 1.6} ${y + 0.6}L${x + 1.4} ${y - 1.4}M${x - 0.4} ${y - 0.2}V${y + 1.4}M${x + 0.6} ${y - 0.9}V${y + 1.4}`, 0.55);
const plas = (x, y) => lijn(BLAUW, `M${x - 1} ${y}h2`);

// Dune sand: short strokes in two tans, scattered by a fixed pseudo-random walk so it is the same on every page.
const duin = Array.from({ length: 84 }, (_, i) => {
  const x = 5.5 + ((i * 37) % 53); const y = 4.5 + ((i * 23) % 15); const s = ((i * 7) % 5) - 2;
  return `M${x} ${y}l${1.2 + (i % 3) * 0.5} ${s * 0.7}`;
});

export default {
  id: 'bodemgebruik', titel: 'Vlakken',
  tekens: [
    { naam: 'grasland met sloten', teken: blok(GRAS, lijn(BLAUW, 'M4 3.5L22 13.4M13 21L35 3')) },
    { naam: 'akkerland met greppels', teken: blok('#FFFEE5', lijn('#000', 'M12 3L52 21M14 21L50 3', 0.45)) },
    { naam: 'boomgaard', teken: blok(GRAS, raster(boom, [7, 12, 17.5])) },
    { naam: 'fruitkwekerij', teken: blok(AKKER, raster(boom, [7, 12, 17.5], 5)) },
    { naam: 'boomkwekerij', teken: blok(AKKER, raster(kwekerij, [7, 12, 17], 7)) },
    { naam: 'grasland met populierenopstand', teken: blok(GRAS, raster(populier, [7.4, 12.4, 17.6])) },
    { naam: 'loofbos', teken: blok(BOS, raster(loof, [7, 12, 17], 8)) },
    { naam: 'naaldbos', teken: blok(BOS, raster(naald, [7.4, 12.4, 17.4], 8)) },
    { naam: 'gemengd bos', teken: blok(BOS, raster((x, y, i) => (i % 2 ? loof(x, y) : naald(x, y)), [7.4, 12.4, 17.4], 8)) },
    { naam: 'griend', teken: blok(BOS, raster(griend, [7.6, 12.6, 17.6], 8)) },
    { naam: 'heide', teken: blok('#F2D8E7') },
    { naam: 'zand', teken: blok('#FFF8A8') },
    { naam: 'drasland, moeras', teken: blok(NAT, raster(plas, [8, 16], 10)) },
    { naam: 'rietland', teken: blok(NAT, raster(riet, [8, 16], 10)) },
    { naam: 'dodenakker, begraafplaats', teken: blok('#fff', raster(kruis, [7.4, 12.4, 17.4], 5)) },
    { naam: 'zonnepark', teken: blok('#fff', raster(paneel, [8, 16], 8)) },
    { naam: 'overig bodemgebruik', teken: blok('#fff') },
    {
      naam: 'duin',
      teken: blok('#FFF4B4', lijn('#CFB278', duin.filter((_, i) => i % 2).join('')) + lijn('#B99864', duin.filter((_, i) => !(i % 2)).join(''))),
    },
  ],
};
