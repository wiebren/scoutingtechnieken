// Reliëf (and the GNSS-kernnetpunt from Getrianguleerde punten), drawn again from the Kadaster legenda TOP25raster
// (CC BY 4.0). See ./index.js.
const TEKST = 'font-family="sans-serif" font-style="italic"';

/** A row of short ticks from x1 to x2 centred on y: a wide stroke dashed into teeth `dik` wide, every `stap`. */
const kam = (x1, x2, y, lang, kleur = '#1a1a1a', dik = 0.6, stap = 1.7) => `<path d="M${x1} ${y}H${x2}" stroke="${kleur}" `
  + `stroke-width="${lang}" stroke-dasharray="${dik} ${stap - dik}"/>`;
/** A line with teeth on one side (`naar` 1 = teeth below, -1 = above): the high edge of a slope. */
const rand = (x1, x2, y, naar) => `<path d="M${x1} ${y}H${x2}" stroke="#1a1a1a" stroke-width=".5"/>${kam(x1, x2, y + naar * 0.9, 1.4, '#1a1a1a', 0.5)}`;
/** A contour line broken around its height, written in italic brown. */
const hoogte = (getal, gat, lijn) => `<path d="M0 12H${32 - gat}M${32 + gat} 12H64" ${lijn}/>`
  + `<text x="32" y="14.6" font-size="8" text-anchor="middle" fill="#A74C12" ${TEKST}>${getal}</text>`;

export default {
  id: 'relief', titel: 'Hoogte',
  tekens: [
    { naam: 'dijk, talud hoger dan 2,5 m', teken: kam(0, 64, 10.2, 2.4) + kam(0, 32, 14.4, 2.4) },
    { naam: 'dijk, talud 1 - 2,5 m hoog', teken: kam(0, 64, 10.6, 1.8, '#6F6F6F', 0.45) + kam(0, 38, 14, 1.8, '#6F6F6F', 0.45) },
    {
      naam: 'kade, wal 0,5 - 1 m hoog',
      teken: `<path d="${Array.from({ length: 19 }, (_, i) => `M${0.6 + 3.4 * i} 13.2l1 -2.4`).join('')}" stroke="#1a1a1a" stroke-width=".6"/>`,
    },
    { naam: 'steile rand, aardrand: hoger dan 1 m', teken: rand(0, 64, 11.4, 1) },
    {
      naam: 'berijdbare dijk',
      teken: `${kam(0, 64, 8.6, 1.4, '#777')}<path d="M0 12H64" stroke="#6E6F87" stroke-width="4.2"/>`
        + `<path d="M0 12H64" stroke="#FFF80F" stroke-width="2.8"/>${kam(0, 64, 15.4, 1.4, '#777')}`,
    },
    { naam: 'ingraving, holle weg', teken: rand(0, 28, 10.2, 1) + rand(0, 28, 13.8, -1) + rand(36, 64, 9.2, 1) + rand(36, 64, 14.8, -1) },
    { naam: 'hoogtelijnen: 10 m', teken: hoogte('10', 6, 'stroke="#C58A63" stroke-width=".85"') },
    { naam: 'hoogtelijnen: 5 m', teken: hoogte('5', 4, 'stroke="#E2C5B1" stroke-width="1.7"') },
    { naam: 'hoogtelijnen: 2,5 m', teken: hoogte('2.5', 6, 'stroke="#ECD8CB" stroke-width="1.7" stroke-dasharray="14 3 3 3"') },
    { naam: 'hoogtepunt', teken: `<text x="32" y="15" font-size="8" text-anchor="middle" fill="#000" ${TEKST}>12.4</text>` },
    {
      naam: 'GNSS-kernnetpunt',
      teken: '<path d="M32 7.6L36.8 16H27.2Z" fill="#FF362F" stroke="#000" stroke-width=".6" stroke-linejoin="round"/><circle cx="32" cy="13.3" r=".9"/>',
    },
  ],
};
