// Tekens (overige symbolen), drawn again from the Kadaster legenda TOP25raster (CC BY 4.0). See ./index.js.
// Point signs are drawn at 1.1 unit per original pixel (about 1.3x the scale of the line signs) so they stay readable;
// the tall pole signs get a taller box instead of being shrunk.
const R = '#e1130c'; // red lines
const RV = '#e5322c'; // red fills
const Z = '#181717'; // black
const B = '#009ed6'; // blue
const lijn = (kleur, w, extra = '') => `<path d="M0 12H64" stroke="${kleur}" stroke-width="${w}"${extra}/>`;
const letters = (tekst, x) => `<text x="${x}" y="13.6" font-family="Arial,Helvetica,sans-serif" font-size="11" fill="${Z}">${tekst}</text>`;

export default {
  id: 'tekens', titel: 'Tekens',
  tekens: [
    { naam: 'religieus gebouw', teken: `<path d="M27 12H37M32 7V17" stroke="${R}" stroke-width="1.5"/>` },
    { naam: 'toren, hoge koepel', teken: `<circle cx="32" cy="12" r="5.2" fill="${RV}"/>` },
    { naam: 'religieus gebouw met toren', teken: `<path d="M27 6.6H37M32 3.2V13" stroke="${R}" stroke-width="1.5"/><circle cx="32" cy="16.2" r="4.6" fill="${RV}"/>` },
    { naam: 'markant object', teken: `<circle cx="32" cy="12" r="3.1" fill="none" stroke="${R}" stroke-width="0.9"/><path d="M31 12H33" stroke="${R}" stroke-width="1"/>` },
    { naam: 'watertoren', teken: `<circle cx="32" cy="12" r="5.1" fill="${B}" stroke="#0b3c50" stroke-width="0.8"/>` },
    { naam: 'vuurtoren', teken: `<circle cx="32" cy="12" r="3.8" fill="${Z}"/><path d="M32 4.6V19.4M25.6 8.3 38.4 15.7M25.6 15.7 38.4 8.3" stroke="${Z}" stroke-width="1.1"/>` },

    { naam: 'gemeentehuis', teken: `<path d="M30.4 1.8V22.2" stroke="${RV}" stroke-width="1.6"/><path d="M31 3H35.4V6.6H31Z" fill="${RV}"/>` },
    { naam: 'postkantoor', teken: `<path d="M27 2.2V7.4H37V2.2M32 3V22" fill="none" stroke="${R}" stroke-width="1.3"/>` },
    { naam: 'politiebureau', teken: `<path d="M30.4 1.8V22.2" stroke="${RV}" stroke-width="1.6"/><path d="M31 3 35.8 5.1 31 7.2Z" fill="${R}"/>` },
    { naam: 'wegwijzer', h: 32, teken: `<path d="M26.4 2 32 9M37.6 2 32 9V30" fill="none" stroke="${Z}" stroke-width="1.3"/>` },

    { naam: 'kapel', teken: `<path d="M27 5H37M32 1.5V20" stroke="${Z}" stroke-width="1.3"/><path d="M29.2 19.2H34.8V22.5H29.2Z" fill="${Z}"/>` },
    { naam: 'kruis', teken: `<path d="M26 5H38M32 1.2V22.8" stroke="${Z}" stroke-width="1.3"/>` },
    { naam: 'vlampijp', teken: `<path d="M32 9.5V20.4" stroke="${Z}" stroke-width="1.2"/><circle cx="32" cy="21.3" r="1.1" fill="none" stroke="${Z}" stroke-width="0.8"/><path d="M31.2 9.8C30.4 7.6 31.6 4.4 34 1.8C34.4 4.6 34.4 7.6 32.9 9.8Z" fill="${Z}"/>` },
    { naam: 'telescoop', h: 28, teken: `<path d="M30.2 2.5Q30.3 8 32.2 11M32.4 11.6 37.6 11.2" fill="none" stroke="${Z}" stroke-width="1.1"/><path d="M31.6 11.2H32.8L36.1 25.5H28.3Z" fill="${Z}"/>` },

    { naam: 'windmolen', teken: `<path d="M28.5 2.5 38.5 21.5M38.5 2.5 28.5 21.5M27 12H33.5" stroke="${Z}" stroke-width="1.3"/><circle cx="26.8" cy="12" r="2" fill="${Z}"/>` },
    { naam: 'waterradmolen', teken: `<circle cx="32" cy="12" r="2.6" fill="none" stroke="${Z}" stroke-width="1"/><path d="M32 7.3V9M32 15V16.7M27.3 12H29M35 12H36.7M28.7 8.7 29.9 9.9M34.1 14.1 35.3 15.3M35.3 8.7 34.1 9.9M29.9 14.1 28.7 15.3" stroke="${Z}" stroke-width="1"/>` },
    { naam: 'windmotor', teken: `<path d="M32 6V21.4M28.5 2.6 35.5 9.2M35.5 2.6 28.5 9.2" stroke="${Z}" stroke-width="1.2"/><path d="M32 3 34.2 4.5V7.3L32 8.8 29.8 7.3V4.5Z" fill="${Z}"/>` },
    { naam: 'windturbine', h: 28, teken: `<path d="M32 9.4V25.6M32 9.4 32.8 1.9M32 9.4 38.1 13.8M32 9.4 25.2 12.5" stroke="${Z}" stroke-width="1.1" stroke-linecap="round"/>` },

    { naam: 'oliepompinstallatie', teken: `<path d="M31.7 7V21.9M23.4 10.8 37.6 4.4" stroke="${Z}" stroke-width="1.1"/><path d="M38.9 2.2 36.6 5.7 40.2 6.5Z" fill="none" stroke="${Z}" stroke-width="0.9" stroke-linejoin="round"/>` },
    { naam: 'seinmast', teken: `<path d="M29.7 18.9V5.1H34.3V8" fill="none" stroke="${Z}" stroke-width="1.3"/><path d="M33.5 7.3H35.3V10.3H33.5Z" fill="${Z}"/>` },
    { naam: 'zendmast', teken: `<path d="M23.1 3Q28 3.4 32 6.2Q36 3.4 40.9 3M32 6V22" fill="none" stroke="${Z}" stroke-width="1.3"/>` },

    { naam: 'hunebed', teken: `<path d="M24.6 15.4C25.6 13 27.2 12 28.6 11.4C29.4 9.8 30.2 8.6 32 8.6S34.6 9.8 35.4 11.4C36.8 12 38.4 13 39.4 15.4Z" fill="${Z}"/>` },
    { naam: 'monument', teken: `<path d="M32 5.4 33.7 10.3V15.3H37V16.9H38V18.6H26V16.9H27V15.3H30.3V10.3Z" fill="${Z}"/>` },
    { naam: 'gemaal', teken: `<path d="M28.4 15.2V11.3Q28.4 10 29.8 10H30.6V8.8H33.4V10H34.2Q35.6 10 35.6 11.3V15.2Z" fill="${Z}"/>` },

    { naam: 'kampeerterrein', teken: `<path d="M32 7.3 36.4 16.7H27.6Z" fill="${B}"/>` },
    { naam: 'sportcomplex', teken: `<circle cx="32" cy="12" r="6.9" fill="${B}"/><circle cx="32" cy="12" r="4.5" fill="#fff"/><path d="M34 9.6C33.6 8.9 32.8 8.6 32 8.6C30.9 8.6 30.1 9.3 30.1 10.3C30.1 12.2 33.9 11.8 33.9 13.7C33.9 14.7 33.1 15.4 32 15.4C31.1 15.4 30.4 15 30 14.3" fill="none" stroke="${B}" stroke-width="1.2"/>` },
    { naam: 'ziekenhuis', teken: `<path d="M27.7 7H36.3V17H27.7Z" fill="${B}"/><path d="M30 9V15M34 9V15M30 12H34" stroke="#fff" stroke-width="1.2"/>` },

    { naam: 'paal', teken: `${letters('Pl', 29.6)}<circle cx="31.4" cy="18.6" r="0.9" fill="${Z}"/>` },
    { naam: 'grenspunt', teken: `${letters('Gp', 28.2)}<circle cx="30.4" cy="18.6" r="0.9" fill="${Z}"/>` },
    { naam: 'boom', teken: `<circle cx="32" cy="12" r="0.8" fill="${Z}"/>` },

    { naam: 'bomenrij', teken: `<path d="M6.4 12H6.4M19.2 12H19.2M32 12H32M44.8 12H44.8M57.6 12H57.6" stroke="${Z}" stroke-width="1.5" stroke-linecap="round"/>` },
    { naam: 'heg, haag', teken: lijn('#444', 0.9, ' stroke-dasharray="0 3.2" stroke-linecap="round" transform="translate(1.6 0)"') },
    { naam: 'houtwal', teken: `${lijn('#455720', 3.4)}${lijn('#b5df65', 1.7)}${lijn('#000', 1.7, ' stroke-dasharray="0.7 2.6"')}<path d="M3 13.3H64" stroke="#00974e" stroke-width="0.8" stroke-dasharray="1.6 12"/>` },
    { naam: 'schietbaan', teken: `<path d="M0 12H61" stroke="#454444" stroke-width="1.3"/><path d="M60.5 9.4H63V14.6H60.5Z" fill="${Z}"/>` },
    { naam: 'afrastering', teken: `${lijn('#575656', 1.1)}<path d="M3.6 9.6 8.4 14.4M8.4 9.6 3.6 14.4M21 9.6 25.8 14.4M25.8 9.6 21 14.4M38.4 9.6 43.2 14.4M43.2 9.6 38.4 14.4M55.8 9.6 60.6 14.4M60.6 9.6 55.8 14.4" stroke="#7a7979" stroke-width="0.6"/>` },
    { naam: 'hoogspanningsleiding met mast', teken: `${lijn(Z, 0.85)}<path d="M15.6 11.1H17.4V12.9H15.6ZM46.6 11.1H48.4V12.9H46.6Z" fill="${Z}"/>` },
    { naam: 'muur', teken: lijn('#df0300', 0.85) },
    { naam: 'geluidswering', teken: lijn('#25075f', 1.3) },
  ],
};
