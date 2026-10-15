// The app: a navigation with four pages (at the bottom on a phone, on the left on a wider screen), each page a
// view that keeps its own state while you are on another one. Where you are is in the address (src/router.js).
// Installing and updates work as in vlet's app.html: the browser's own install prompt where there is one,
// otherwise how to do it in this browser; and a new build is offered as soon as the service worker has it.
import './style.css';
import { UPDATES } from './data/updates.js';
import { h } from './dom.js';
import { icoon } from './iconen.js';
import { insignesView } from './insignes.js';
import { oefenenView } from './oefenen.js';
import { updatesGezien } from './opslag.js';
import { overView } from './over.js';
import { href, opWijziging, PAGINAS } from './router.js';
import { zoekenView } from './zoeken.js';

const NAMEN = { zoeken: 'Zoeken', insignes: 'Insignes', oefenen: 'Oefenen', over: 'Over' };

const standalone = ['standalone', 'minimal-ui', 'window-controls-overlay'].some((m) => matchMedia(`(display-mode: ${m})`).matches)
  || navigator.standalone === true;

// -- installing
const installUitleg = h('p.uitleg');
const installNu = h('button.knop.hoofd', { type: 'button', hidden: true }, 'Installeren');
const installDialoog = h('dialog.dialoog', { 'aria-labelledby': 'installeren-titel' },
  h('h2', { id: 'installeren-titel' }, 'Installeer als app'),
  h('p', 'De app opent dan in een eigen venster, met een eigen icoon, en werkt ook zonder internet.'),
  installUitleg,
  h('div.knoppen', h('button.knop', { type: 'button', onclick: () => installDialoog.close() }, 'Sluiten'), installNu));
{
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const android = /Android/.test(ua);
  const firefox = /Firefox\//.test(ua);
  const safari = /Safari\//.test(ua) && !/Chrome|Chromium|CriOS|Edg\//.test(ua);
  installUitleg.textContent = standalone ? 'Je gebruikt de app al als geïnstalleerde app.'
    : ios ? 'Tik onderin (of bovenin, op een iPad) op het deelsymbool, het vierkantje met de pijl omhoog, en kies ‘Zet op beginscherm’.'
      : android && firefox ? 'Open het menu (⋮) en kies ‘Installeren’.'
        : android ? 'Open het menu van de browser (⋮) en kies ‘App installeren’ of ‘Toevoegen aan startscherm’.'
          : firefox ? 'Firefox op de computer installeert geen apps. Open deze pagina in Chrome, Edge of Safari en installeer hem daar.'
            : safari ? 'Kies in de menubalk Archief › Voeg toe aan Dock.'
              : 'Klik op het installeersymbool rechts in de adresbalk, of kies in het menu van de browser ‘App installeren’.';
  let prompt = null;
  addEventListener('beforeinstallprompt', (e) => {   // Chrome and Edge: it can be done from here
    e.preventDefault(); prompt = e;
    installNu.hidden = false; installUitleg.textContent = 'Klik op Installeren, of later op het installeersymbool in de adresbalk.';
  });
  installNu.addEventListener('click', async () => {
    if (!prompt) return;
    prompt.prompt(); await prompt.userChoice; prompt = null; installNu.hidden = true;
  });
  addEventListener('appinstalled', () => installDialoog.close());
}

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
const nav = h('nav.nav', { 'aria-label': 'Hoofdmenu' },
  h('div.merk', h('span.merk-teken', icoon('windroos')), h('span.merk-naam', 'Scoutingtechnieken')),
  h('div.nav-items', PAGINAS.map((p) => navLinks[p])));
const main = h('main.main', PAGINAS.map((p) => { views[p].el.hidden = true; return views[p].el; }));

const nieuw = h('div.nieuw', { role: 'status', hidden: true },
  h('span', 'Er is een nieuwe versie.'),
  h('button.knop.hoofd', { type: 'button', onclick: () => location.reload() }, 'Bijwerken'));

document.getElementById('app').replaceWith(h('div.app', { id: 'app' }, nav, main, nieuw, installDialoog));

let pagina = null;
opWijziging(({ pagina: p, params }) => {
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
  navLinks.over.classList.toggle('nieuws', p !== 'over' && updatesGezien() < UPDATES[0].datum);
  const titel = views[p].titel(params);
  document.title = titel === 'Zoeken' ? 'Scoutingtechnieken' : `${titel} · Scoutingtechnieken`;
});

// keys on a computer: / to search, Escape to close the card
addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  const typing = e.target.closest?.('input, textarea, [contenteditable]');
  if (e.key === '/' && !typing) {
    e.preventDefault();
    if (pagina !== 'zoeken') navLinks.zoeken.click();
    views.zoeken.focusZoek();
  } else if (e.key === 'Escape' && !document.querySelector('dialog[open]')) {
    if (typing) e.target.blur(); else views[pagina].sluitKaart?.();
  }
});

// -- updates: the service worker is asked for a new build at start, every hour, and whenever the app comes back
// into view; once one has taken over, the app offers to start again with it. Not under `pnpm dev`: there sw.js is
// the template, and Vite brings the changes itself.
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
