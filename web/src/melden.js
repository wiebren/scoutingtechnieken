// Melden: something wrong in a blad, a drawing or a piece that does not work, the app itself, or something missing.
// A dialog that asks one thing at a time, as Melden in the lelievlet viewer (wiebren/lelievlet, web/src/feedback.js),
// and sends the report to the same receiver (lelievlet-melden), which files it as an issue on GitHub in
// wiebren/scoutingtechnieken. No picture of the screen: the blad or the piece it is about goes along instead.
// Opened from Instellingen, from the foot of a card (with that blad) and from a piece on Oefenen (with that piece).
// When it cannot be sent, the report can be saved as a file.
import { BLAD } from './data/bladen/index.js';
import { CATEGORIE, groepNaam } from './data/categorieen.js';
import { DOE } from './doe/index.js';
import { h, vul } from './dom.js';
import { niveauKeuze, thema } from './opslag.js';
import './doe/vorm.css';

/** Where the report is POSTed as JSON; null: it can only be saved as a file. */
const URL_MELDEN = 'https://europe-west4-lelievlet.cloudfunctions.net/lelievlet-melden';
const MIN_TEKST = 10;                      // the receiver takes no description shorter than this
const MELDER = 'scoutingtechnieken.melder.v1';   // the name, kept for the next report (no e-mail address: decided)

const SOORTEN = [
  { key: 'inhoud', naam: 'De tekst klopt niet', uitleg: 'Een feit, een regel, een naam of een stap die niet klopt, of die je niet snapt', bijBlad: 'De tekst van dit onderwerp' },
  { key: 'tekening', naam: 'Een tekening of oefening', uitleg: 'Een tekening die niet klopt, of een oefening die niet goed werkt', bijBlad: 'De tekening of de oefening hier' },
  { key: 'app', naam: 'De app zelf', uitleg: 'Zoeken, het menu, installeren, iets wat vastloopt of niet laadt' },
  { key: 'verzoek', naam: 'Iets ontbreekt', uitleg: 'Een onderwerp of een stuk uitleg dat je mist' },
];

const melder = {
  /** The name kept from the last report. An e-mail address kept by an earlier version is dropped here. */
  lees: () => {
    try {
      const bewaard = JSON.parse(localStorage.getItem(MELDER) ?? 'null') ?? {};
      if ('contact' in bewaard) melder.bewaar(bewaard.naam ?? '');
      return { naam: bewaard.naam ?? '' };
    } catch { return { naam: '' }; }
  },
  bewaar: (naam) => {
    try { if (naam) localStorage.setItem(MELDER, JSON.stringify({ naam })); else localStorage.removeItem(MELDER); } catch { /* not kept */ }
  },
};

/** Whether a name from an earlier report is kept on this device (Instellingen, Je gegevens). */
export function melderBewaard() { return Boolean(melder.lees().naam); }

/** Forgets the name kept for the next report. */
export function vergeetMelder() { try { localStorage.removeItem(MELDER); } catch { /* nothing kept */ } }

let dialoog = null;

/**
 * Opens Melden. @param over what it is about, if it is opened from one: { blad: id } or { doe: naam }
 */
export function meld(over = {}) {
  dialoog ??= maakDialoog();
  dialoog.open(over);
}

function maakDialoog() {
  const inhoud = h('div.meld-inhoud');
  const el = h('dialog.dialoog.meld', { 'aria-labelledby': 'meld-titel' },
    h('div.meld-kop', h('h2', { id: 'meld-titel' }, 'Melden'),
      h('button.meld-sluit', { type: 'button', 'aria-label': 'Sluiten', onclick: () => sluit() }, '×')),
    inhoud);
  document.body.append(el);
  el.addEventListener('close', () => { melding = null; spoor = []; });

  let melding = null;                      // what is being put together
  let spoor = [];                          // the screens gone through, for Terug

  const tekst = (t, cls = 'meld-hint') => h(`p.${cls}`, t);
  const knop = (label, fn, hoofd = false) => h(`button.knop${hoofd ? '.hoofd' : ''}`, { type: 'button', onclick: fn }, label);

  /** A field that keeps what is typed in melding[key], and keeps `verder` shut until there is enough. */
  function veld(key, label, placeholder, verder, { regels = 5, min = MIN_TEKST, enkel = false, type = 'text', focus = true } = {}) {
    const invoer = enkel
      ? h('input.doe-veld', { type, value: melding[key] ?? '', placeholder, autocomplete: 'off' })
      : h('textarea.doe-veld', { rows: regels, placeholder }, melding[key] ?? '');
    const kijk = () => { melding[key] = invoer.value; if (verder) verder.disabled = invoer.value.trim().length < min; };
    invoer.addEventListener('input', kijk);
    kijk();
    if (focus) queueMicrotask(() => invoer.focus());
    return h('label.meld-veld', h('span', label), invoer);
  }

  const blad = () => (melding.blad ? BLAD[melding.blad] : null);
  const watHier = () => {
    const b = blad();
    if (b) return `${b.naam} (${CATEGORIE[b.categorie].naam} › ${groepNaam(b.categorie, b.groep)})`;
    if (melding.doe && DOE[melding.doe]) return `De oefening ‘${DOE[melding.doe].titel}’`;
    return null;
  };

  const SCHERMEN = {
    soort: () => {
      const hier = watHier();
      return [
        hier && h('p.meld-over', h('span', 'Over: '), h('strong', hier)),
        h('h3', 'Waar gaat het over?'),
        h('div.meld-soorten', SOORTEN
          .filter((s) => s.key !== 'tekening' || !blad() || blad().plaatje || blad().doe || blad().beelden?.length)
          .map((s) => h('button', { type: 'button', onclick: () => { melding.categorie = s.key; ga('omschrijving'); } },
            h('b', (hier && s.bijBlad) || s.naam), h('span', s.uitleg)))),
      ];
    },

    omschrijving: () => {
      const verder = knop('Verder', () => ga('versturen'), true);
      const k = melding.categorie;
      return [
        h('h3', SOORTEN.find((s) => s.key === k).naam),
        k === 'verzoek' && tekst('De stappen om knopen en sjorringen te leggen komen later, uit een apart project. Die hoef je niet te melden.', 'meld-noot'),
        veld('omschrijving',
          { inhoud: 'Wat klopt er niet?', tekening: 'Wat klopt er niet, of wat gebeurt er?', app: 'Wat gebeurt er, en wat had je verwacht?', verzoek: 'Wat mis je?' }[k],
          { inhoud: 'Wat staat er, en hoe hoort het?', tekening: 'Wat zie je, wat deed je, en wat had je verwacht?', app: 'Wat deed je, stap voor stap?', verzoek: 'Bij welk onderwerp, en wat zou erbij moeten?' }[k],
          verder),
        k === 'inhoud' && veld('bron', 'Waar staat het anders? (mag leeg blijven)', 'Een boek, een site, een insigneblad…', null, { enkel: true, min: 0, focus: false }),
        h('div.knoppen', verder),
      ];
    },

    versturen: () => {
      const stuur = knop(URL_MELDEN ? 'Versturen' : 'Opslaan als bestand', verstuur, true);
      return [
        h('h3', 'Klaar om te versturen'),
        veld('naam', 'Je naam of scoutinggroep (mag leeg blijven)', '', null, { enkel: true, min: 0 }),
        tekst('Je melding gaat naar de makers van de app, op GitHub. Vul je je naam in, dan gaat die mee. Iedereen kan je melding daar lezen, ook je naam. Zet er dus niets in wat niet iedereen mag lezen.'),
        // what goes out as it is when opened, so with the name typed just now
        h('details.meld-details', { ontoggle: (e) => { if (melding && e.target.open) e.target.querySelector('pre').textContent = JSON.stringify(inhoudMelding(), null, 2); } },
          h('summary', 'Wat wordt er meegestuurd?'), h('pre')),
        h('div.knoppen', stuur),
      ];
    },

    verstuurd: () => [
      h('h3', 'Bedankt!'),
      tekst(URL_MELDEN ? 'Je melding is verstuurd.' : 'De melding is opgeslagen als bestand.', 'meld-lead'),
      melding.issue && h('p.meld-lead', h('a', { href: melding.issue, target: '_blank', rel: 'noopener' }, 'Bekijk je melding')),
      h('div.knoppen', knop('Sluiten', () => sluit(), true)),
    ],

    mislukt: () => [
      h('h3', 'Versturen is niet gelukt'),
      tekst(navigator.onLine ? 'Probeer het zo nog eens. Of sla je melding op als bestand, dan raak je hem niet kwijt.'
        : 'Je hebt nu geen internet. Probeer het later nog eens, of sla je melding op als bestand.'),
      h('div.knoppen', knop('Opslaan als bestand', () => { bewaarAlsBestand(); ga('verstuurd'); }), knop('Opnieuw', verstuur, true)),
    ],
  };

  function toon(naam, nieuw = true) {
    if (nieuw && spoor.at(-1) !== naam) spoor.push(naam);
    const terug = spoor.length > 1 && !['verstuurd'].includes(naam)
      && h('button.meld-terug', { type: 'button', onclick: () => { spoor.pop(); toon(spoor.at(-1) ?? 'soort', false); } }, '‹ Terug');
    vul(inhoud, ...SCHERMEN[naam]().filter(Boolean), terug || '');
    inhoud.scrollTop = 0;
  }
  const ga = (naam) => toon(naam);

  /** The report as it goes out: what was answered, and where the app was. */
  function inhoudMelding() {
    const b = blad();
    const donker = document.documentElement.dataset.theme === 'dark'
      || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    return {
      versie: 1, app: 'scoutingtechnieken', categorie: melding.categorie,
      omschrijving: melding.omschrijving?.trim() ?? '', bron: melding.bron?.trim() || undefined,
      naam: melding.naam?.trim() || undefined,
      blad: b ? { id: b.id, naam: b.naam, categorie: CATEGORIE[b.categorie].naam, groep: groepNaam(b.categorie, b.groep) } : undefined,
      doe: melding.doe || b?.doe || undefined,
      gegevens: {
        pagina: melding.pagina,
        build: typeof __BUILD__ === 'object' ? __BUILD__ : undefined,
        apparaat: {
          browser: navigator.userAgent.slice(0, 200),
          scherm: `${innerWidth}×${innerHeight}`,
          thema: `${donker ? 'donker' : 'licht'} (${thema()})`,
          app: matchMedia('(display-mode: standalone)').matches || navigator.standalone === true ? 'geïnstalleerd' : 'browser',
        },
        niveaus: [...niveauKeuze()],
      },
    };
  }

  function bewaarAlsBestand() {
    const blob = new Blob([JSON.stringify(inhoudMelding(), null, 2)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `scoutingtechnieken-melding-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json` });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
  }

  // a report on its way keeps going when the dialog closes; its answer only shows if it is still the one open
  let onderweg = null;
  async function verstuur() {
    if (onderweg === melding) return;
    if (!URL_MELDEN) { melder.bewaar(melding.naam?.trim() ?? ''); bewaarAlsBestand(); ga('verstuurd'); return; }
    const mijn = melding; onderweg = mijn;
    const k = inhoud.querySelector('.knoppen .hoofd');
    if (k) { k.disabled = true; k.textContent = 'Bezig…'; }
    try {
      const antwoord = await fetch(URL_MELDEN, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(inhoudMelding()) });
      if (!antwoord.ok) throw new Error(`HTTP ${antwoord.status}`);
      const { issue } = await antwoord.json().catch(() => ({}));
      melder.bewaar(mijn.naam?.trim() ?? '');
      if (melding !== mijn) return;
      melding.issue = typeof issue === 'string' && issue.startsWith('https://') ? issue : null;
      ga('verstuurd');
    } catch (fout) {
      console.warn('[scoutingtechnieken] melding versturen:', fout);
      if (melding === mijn) ga('mislukt');
    } finally { if (onderweg === mijn) onderweg = null; }
  }

  // a report half written is not thrown away by a tap beside the dialog: only by × or Escape
  function sluit() { el.close(); }

  return {
    open(over) {
      const { naam } = melder.lees();
      melding = { naam, blad: over.blad && BLAD[over.blad] ? over.blad : undefined, doe: over.doe, pagina: location.href };
      spoor = [];
      toon('soort');
      if (!el.open) el.showModal();
    },
  };
}
