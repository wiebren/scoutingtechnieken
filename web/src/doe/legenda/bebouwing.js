// Bebouwing, drawn again from the Kadaster legenda TOP25raster (CC BY 4.0). See ./index.js.
export default {
  id: 'bebouwing', titel: 'Bebouwing',
  tekens: [
    { naam: 'bebouwd gebied', teken: '<path d="M10 20V12H24V4H54V20Z" fill="#b6b7b6" stroke="#393838" stroke-width="1"/>' },
    { naam: 'gebouwen', teken: '<path d="M14 11H30V18H14Z" fill="#181717"/><path d="M36 18V6H42V11H50V18Z" fill="#181717"/>' },
    { naam: 'hoogbouw', teken: '<path d="M18 9H46V17H18Z" fill="#b4352d" stroke="#5a1a16" stroke-width="0.8"/>' },
    { naam: 'kas', teken: '<path d="M10 20V12H24V4H54V20Z" fill="#cda772" stroke="#e8706a" stroke-width="1.2"/>' },
  ],
};
