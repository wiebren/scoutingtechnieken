// Where the facts of a blad come from: the sources shown at the foot of its card, under "Bronnen". Only sources about
// the blad itself: an overview of all knots is not one, and the eisen of an insigne are on the insigne's page
// (INSIGNE_REFERENTIES), not on every blad in it. They are in
// referenties.local.js, which is not in git (.gitignore) until it is decided whether they may be public. Without that
// file the app and the build go on without them; the number of a knot in The Ashley Book of Knots comes from
// `blad.abok` and is always shown.
//   REFERENTIES = { '<blad id>': [ { naam, url } | { boek, auteur?, jaar?, blz?, par?, url? }, … ] }
// A web page has a name and an address; a book a title, and where known its author, year, page(s) (`blz`) or
// paragraph (`par`, e.g. '§68'), and an address where it can be read. scripts/check.mjs checks the local file itself
// (import.meta.glob is Vite's, not Node's).
const lokaal = import.meta.glob('./referenties.local.js', { eager: true });

export const REFERENTIES = Object.values(lokaal)[0]?.REFERENTIES ?? {};
//   INSIGNE_REFERENTIES = { '<insigne id>': [ … the same ] }: the insigneblad of Scouting Nederland, and older eisen
export const INSIGNE_REFERENTIES = Object.values(lokaal)[0]?.INSIGNE_REFERENTIES ?? {};
