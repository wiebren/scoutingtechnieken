// Where you are lives after the #, so a link or a reload brings you back to the same place, and the app needs
// one page only (which the service worker keeps): #/zoeken?c=touw&blad=paalsteek. The pages are the four of the
// navigation. Going somewhere pushes a history entry marked as the app's own, so Terug can go back in history
// when it came from inside the app, and to the list when the card was opened from a link.

export const PAGINAS = ['zoeken', 'insignes', 'oefenen', 'over'];

/** The address of a page with its parameters, left out when empty. */
export function href(pagina, params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== ''));
  return `#/${pagina}${query.size ? `?${query}` : ''}`;
}

/** Where the address points now: { pagina, params }. */
export function huidige(hash = location.hash) {
  const [pad, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const pagina = PAGINAS.includes(pad) ? pad : 'zoeken';
  return { pagina, params: Object.fromEntries(new URLSearchParams(query)) };
}

const luisteraars = new Set();
let laatste = null;
const meld = () => {
  if (location.hash === laatste) return;                         // popstate and hashchange both come for one change
  laatste = location.hash;
  const plek = huidige();
  for (const fn of luisteraars) fn(plek);
};
addEventListener('popstate', meld);
addEventListener('hashchange', meld);

/** Call fn with every new place, and now with the current one. */
export function opWijziging(fn) { luisteraars.add(fn); laatste = location.hash; fn(huidige()); }

/** Go to a page; `vervang` changes the current history entry (typing in the search field) instead of adding one. */
export function ga(pagina, params = {}, { vervang = false } = {}) {
  const url = href(pagina, params);
  if (url === location.hash) return;
  history[vervang ? 'replaceState' : 'pushState']({ binnen: vervang ? history.state?.binnen ?? false : true }, '', url);
  meld();
}

/** Back: in history when the app put this entry there, otherwise to `pagina` with `params` (the list). */
export function terug(pagina, params) {
  if (history.state?.binnen) history.back();
  else ga(pagina, params, { vervang: true });
}

// links inside the app go through ga(), so they are marked as the app's own; a click with a modifier key
// (a new tab) is left to the browser
addEventListener('click', (e) => {
  const a = e.target.closest?.('a[href^="#/"]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  const { pagina, params } = huidige(a.getAttribute('href'));
  ga(pagina, params, { vervang: a.hasAttribute('data-vervang') });
});
