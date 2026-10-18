// The app moved from wiebren.github.io to scoutvaardig.nl (October 2026). For a while both addresses serve the same
// build, so an app installed from the old one still gets this version - and then moves on, with what it keeps on this
// device (localStorage, src/opslag.js): a browser tab at once, an installed app after asking, as it has to be
// installed again from the new address. What it keeps goes after the #, which the browser never sends to a server;
// the new address takes over only what it does not have yet. Imported first by main.js: the address is put back
// before the router reads it.
const OUD = 'wiebren.github.io';
const NIEUW = 'https://scoutvaardig.nl';
const VOORVOEGSEL = 'scoutingtechnieken.';
const NIET_MEE = new Set(['scoutingtechnieken.melder.v1']);   // a name typed for Melden stays where it was typed
const MERK = '#verhuis=';

export const opOudAdres = location.hostname === OUD;

const naarBase64 = (tekst) => {
  let bin = '';
  for (const b of new TextEncoder().encode(tekst)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const uitBase64 = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));

/** The same page on the new address, with what this device keeps and where you were. */
export function nieuwAdres() {
  const mee = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(VOORVOEGSEL) && !NIET_MEE.has(key)) mee[key] = localStorage.getItem(key);
    }
  } catch { /* nothing to take along */ }
  return `${NIEUW}${location.pathname}${location.search}${MERK}${naarBase64(JSON.stringify(mee))}&terug=${encodeURIComponent(location.hash)}`;
}

/** On the new address: how many things were taken over from the old one (0 when nothing came along). */
export const overgenomen = (() => {
  if (opOudAdres || !location.hash.startsWith(MERK)) return 0;
  const [data, terug = ''] = location.hash.slice(MERK.length).split('&terug=');
  history.replaceState(null, '', location.pathname + location.search + decodeURIComponent(terug));
  let n = 0;
  try {
    for (const [key, value] of Object.entries(JSON.parse(uitBase64(data)))) {
      if (!key.startsWith(VOORVOEGSEL) || NIET_MEE.has(key) || typeof value !== 'string') continue;
      if (localStorage.getItem(key) === null) { localStorage.setItem(key, value); n++; }
    }
  } catch (e) { console.warn('[scoutingtechnieken] niets overgenomen van het oude adres:', e); }
  return n;
})();
