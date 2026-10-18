// The app: a navigation with four pages (at the bottom on a phone, on the left on a wider screen), each page a
// view that keeps its own state while you are on another one. Where you are is in the address (src/router.js).
// The navigation also holds the choice of niveau (src/niveaukeuze.js), which every page follows at once.
// Installing and updates work as in vlet's app.html: the browser's own install prompt where there is one,
// otherwise how to do it in this browser; and a new build is offered as soon as the service worker has it.
// first: on the new address it puts back the address the router reads (src/verhuizen.js)
import { nieuwAdres, opOudAdres, overgenomen } from './verhuizen.js';
import './style.css';
import './plaatjes/tocht.css';
import './plaatjes/waarnemen.css';
import './plaatjes/seinen.css';
import './plaatjes/geheimschrift.css';
import './plaatjes/vuur.css';
import './plaatjes/koken.css';
import './plaatjes/gereedschap.css';
import './plaatjes/kamperen.css';
import './plaatjes/natuur.css';
import './plaatjes/weer.css';
import './plaatjes/veiligheid.css';
import './plaatjes/touw.css';
import './plaatjes/sjorren.css';
import './plaatjes/kaart.css';
import { inKeuze } from './data/niveaus.js';
import { UPDATES } from './data/updates.js';
import { h } from './dom.js';
import { icoon } from './iconen.js';
import { insignesView } from './insignes.js';
import { merkSvg } from './merk.js';
import { niveauMenu } from './niveaukeuze.js';
import { oefenenView } from './oefenen.js';
import { updatesGezien, volgNiveauKeuze } from './opslag.js';
import { overView } from './over.js';
import { href, opWijziging, PAGINAS } from './router.js';
import { zoekenView } from './zoeken.js';

const NAMEN = { zoeken: 'Zoeken', insignes: 'Insignes', oefenen: 'Oefenen', over: 'Instellingen' };

const standalone = ['standalone', 'minimal-ui', 'window-controls-overlay'].some((m) => matchMedia(`(display-mode: ${m})`).matches)
  || navigator.standalone === true;

// -- installing
const installUitleg = h('p.uitleg');
const installNu = h('button.knop.hoofd', { type: 'button', hidden: true }, 'Installeren');
const installDialoog = h('dialog.dialoog', { 'aria-labelledby': 'installeren-titel' },
  h('h2', { id: 'installeren-titel' }, 'Installeer als app'),
  h('p', 'Dan krijgt de app een eigen icoon en een eigen venster. Hij werkt dan ook zonder internet.'),
  installUitleg,
  h('div.knoppen', h('button.knop', { type: 'button', onclick: () => installDialoog.close() }, 'Sluiten'), installNu));
{
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const android = /Android/.test(ua);
  const firefox = /Firefox\//.test(ua);
  const safari = /Safari\//.test(ua) && !/Chrome|Chromium|CriOS|Edg\//.test(ua);
  installUitleg.textContent = standalone ? 'De app is al geïnstalleerd.'
    : ios ? 'Tik op het deelsymbool: het vierkantje met de pijl omhoog. Op een iPhone zit het onderin, op een iPad bovenin. Kies dan ‘Zet op beginscherm’.'
      : android && firefox ? 'Open het menu (⋮) en kies ‘Installeren’.'
        : android ? 'Open het menu van de browser (⋮) en kies ‘App installeren’ of ‘Toevoegen aan startscherm’.'
          : firefox ? 'Firefox op de computer installeert geen apps. Open deze pagina in Chrome, Edge of Safari en installeer hem daar.'
            : safari ? 'Kies in de menubalk Archief › Voeg toe aan Dock.'
              : 'Klik op het installeersymbool rechts in de adresbalk, of kies in het menu van de browser ‘App installeren’.';
  let prompt = null;
  addEventListener('beforeinstallprompt', (e) => {   // Chrome and Edge: it can be done from here
    e.preventDefault(); prompt = e;
    installNu.hidden = false; installUitleg.textContent = 'Klik op Installeren. Of doe het later, met het installeersymbool in de adresbalk.';
  });
  installNu.addEventListener('click', async () => {
    if (!prompt) return;
    prompt.prompt(); await prompt.userChoice; prompt = null; installNu.hidden = true;
  });
  addEventListener('appinstalled', () => installDialoog.close());
}

// -- the move to scoutvaardig.nl (src/verhuizen.js): on the old address a browser tab goes on at once; an installed
// app asks first, as it has to be installed again there. On the new address, what came along is said once.
if (opOudAdres && !standalone) location.replace(nieuwAdres());
const verhuisDialoog = h('dialog.dialoog', { 'aria-labelledby': 'verhuisd-titel' },
  h('h2', { id: 'verhuisd-titel' }, 'De app is verhuisd'),
  h('p', 'Scoutingtechnieken staat nu op scoutvaardig.nl. Hier krijgt de app straks geen nieuwe versies meer.'),
  h('p', 'Open hem op het nieuwe adres en installeer hem daar opnieuw. Wat je hebt afgevinkt en je instellingen gaan mee. Daarna kun je deze app weghalen.'),
  h('div.knoppen', h('button.knop', { type: 'button', onclick: () => verhuisDialoog.close() }, 'Later'),
    h('button.knop.hoofd', { type: 'button', onclick: () => {
      const tab = window.open(nieuwAdres(), '_blank');
      if (tab) tab.opener = null; else location.assign(nieuwAdres());
    } }, 'Naar scoutvaardig.nl')));
const meegekomen = h('div.nieuw', { role: 'status', hidden: overgenomen === 0 },
  h('span', 'Wat je had afgevinkt en ingesteld, is meegekomen van het oude adres.'),
  h('button.knop', { type: 'button', onclick: () => { meegekomen.hidden = true; } }, 'Oké'));

// -- the pages and the navigation
const views = {
  zoeken: zoekenView(),
  insignes: insignesView(),
  oefenen: oefenenView(),
  over: overView({ installeer: () => installDialoog.showModal() }),
};
const laatst = Object.fromEntries(PAGINAS.map((p) => [p, {}]));   // where each page was, for its tab
const navLinks = Object.fromEntries(PAGINAS.map((p) => [p, h('a.nav-item', { href: href(p) },
  h('span.nav-icoon', icoon(p)), h('span.nav-naam', NAMEN[p]))]));
const niveau = niveauMenu();
// Instellingen (the page over, with the theme) is not one of the tabs: a gear at the top right on a phone, at the
// bottom of the menu from 760px (style.css, .nav-onder)
navLinks.over.setAttribute('aria-label', 'Instellingen');
const nav = h('nav.nav', { 'aria-label': 'Hoofdmenu' },
  h('div.merk', h('span.merk-teken', { html: merkSvg({ size: 40 }), 'aria-hidden': 'true' }), h('span.merk-naam', 'Scoutingtechnieken')),
  h('div.nav-items', PAGINAS.filter((p) => p !== 'over').map((p) => navLinks[p]), niveau.knop),
  niveau.zij,
  h('div.nav-onder', navLinks.over));
const main = h('main.main', PAGINAS.map((p) => { views[p].el.hidden = true; return views[p].el; }));

const nieuw = h('div.nieuw', { role: 'status', hidden: true },
  h('span', 'Er is een nieuwe versie.'),
  h('button.knop.hoofd', { type: 'button', onclick: () => location.reload() }, 'Bijwerken'));

document.getElementById('app').replaceWith(h('div.app', { id: 'app' }, nav, main, nieuw, meegekomen, installDialoog, verhuisDialoog, niveau.pop));
if (opOudAdres && standalone) verhuisDialoog.showModal();

let pagina = null;
let plek = null;
opWijziging(({ pagina: p, params }) => {
  plek = { pagina: p, params };
  if (p !== pagina) {
    if (pagina) views[pagina].el.hidden = true;
    views[p].el.hidden = false;
    pagina = p;
  }
  laatst[p] = params;
  views[p].update(params);
  for (const q of PAGINAS) {
    // the tab of another page goes back to where that page was; the tab of this page to its start
    navLinks[q].href = q === p ? href(q) : href(q, laatst[q]);
    if (q === p) navLinks[q].setAttribute('aria-current', 'page'); else navLinks[q].removeAttribute('aria-current');
  }
  navLinks.over.classList.toggle('nieuws', p !== 'over' && UPDATES.length > 0 && updatesGezien() < UPDATES[0].datum);
  document.title = titelVan(plek);
});

function titelVan({ pagina: p, params }) {
  const titel = views[p].titel(params);
  return titel === 'Zoeken' ? 'Scoutingtechnieken' : `${titel} · Scoutingtechnieken`;
}

// another choice of niveau: every page draws its lists again, an open card keeps its place (and its piece) and only
// shows or hides the line that it is outside the choice
volgNiveauKeuze((keuze) => {
  for (const p of PAGINAS) views[p].herteken?.();
  for (const el of document.querySelectorAll('.buiten-niveau[data-blad]')) el.hidden = inKeuze(el.dataset.blad, keuze);
  if (plek) document.title = titelVan(plek);
});

// keys on a computer: / to search, Escape to close the card (not when it closes the niveau popover)
const popoverOpen = () => { try { return niveau.pop.matches(':popover-open'); } catch { return false; } };
addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  const typing = e.target.closest?.('input, textarea, [contenteditable]');
  if (e.key === '/' && !typing) {
    e.preventDefault();
    if (pagina !== 'zoeken') navLinks.zoeken.click();
    views.zoeken.focusZoek();
  } else if (e.key === 'Escape' && !document.querySelector('dialog[open]') && !popoverOpen()) {
    if (typing) e.target.blur(); else views[pagina].sluitKaart?.();
  }
});

// -- updates: the service worker is asked for a new build at start, every hour, and whenever the app comes back
// into view; once one has taken over, the app offers to start again with it. Not under `pnpm dev`: there sw.js is
// the template, and Vite brings the changes itself.
// A drawing or piece that does not load while we are online: most likely a new version took over while the app was
// open and the old files are gone (bladkaart.js and oefenen.js send 'laadfout'). Starting again fixes it.
if (import.meta.env.PROD) {
  const opnieuw = () => { if (navigator.onLine) nieuw.hidden = false; };
  addEventListener('laadfout', opnieuw);
  addEventListener('vite:preloadError', opnieuw);
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  let huidig = navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((registration) => {
    const kijk = () => registration.update().catch(() => { /* offline: next time */ });
    setInterval(kijk, 60 * 60 * 1000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') kijk(); });
  }).catch((e) => console.warn('[scoutingtechnieken] geen service worker:', e));
  // the first worker taking over is not news; one taking over from another is a new version
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (huidig) nieuw.hidden = false;
    huidig = navigator.serviceWorker.controller;
  });
}
