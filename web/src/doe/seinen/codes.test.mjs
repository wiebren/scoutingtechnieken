// Run in web/: node src/doe/seinen/codes.test.mjs (also part of pnpm check). Every code of the Codeermachine encodes and decodes back.
// only failures and the summary are printed
const log = console.log;
console.log = (...a) => { if (String(a[0]).startsWith('FOUT')) log(...a); };
const W = new URL('../', import.meta.url).href;   // web/src/doe/
const { CODES, standaardSleutels, letters } = await import(W + 'seinen/lib/geheim.js');
const codes = await import(W + 'codes.js');
const { HULPWOORDEN, hulpCode } = await import(W + 'seinen/lib/hulpwoorden.js');
const zinnen = [...codes.ZINNEN, 'Kom om acht uur naar het kampvuur', 'De Scout', 'sportfeest', 'pionierhout', 'Zoë en Daniël', 'Jan ijs quiz', 'a', 'XYZ abc'];
let fouten = 0;
const norm = (t) => letters(t);
for (const [id, c] of Object.entries(CODES)) {
  if (!c.decodeer) { console.log('one-way/teken:', id); continue; }
  const keyVariants = [standaardSleutels(c)];
  if (id === 'verschuiving') for (let n = 1; n <= 25; n++) keyVariants.push({ n });
  if (id === 'zigzag') for (let r = 2; r <= 5; r++) keyVariants.push({ rijen: r });
  if (id === 'jaartal') keyVariants.push({ jaar: '2026' }, { jaar: '1907' }, { jaar: '1' });
  if (id === 'kolom') keyVariants.push({ woord: 'SCOUTING' }, { woord: 'AA' }, { woord: 'ZEBRA' });
  if (id === 'codewoord') keyVariants.push({ woord: 'KAMPVUUR' });
  if (id === 'vigenere') keyVariants.push({ woord: 'Zwaluw' });
  if (id === 'achterstevoren') keyVariants.push({ hoe: 'alles' }, { hoe: 'volgorde' });
  if (id === 'stoorwoord') keyVariants.push({ woord: 'BOS' });
  for (const k of keyVariants) for (const z of zinnen) {
    const enc = c.codeer(z, k);
    const dec = c.decodeer(enc, k);
    if (dec && typeof dec === 'object') { console.log('FOUT obj', id, JSON.stringify(k), z, enc, dec); fouten++; continue; }
    let want = norm(z);
    if (id === 'polybius') want = want.replace(/J/g, 'I');
    let got = norm(dec);
    if (['blokmethode', 'jaartal', 'kolom'].includes(id)) got = got.slice(0, want.length) + (got.slice(want.length).replace(/X/g, '') );
    if (id === 'achterstevoren' ) { if (dec !== z) { console.log('FOUT', id, k, z, '|', enc, '|', dec); fouten++; } continue; }
    if (got !== want) { console.log('FOUT', id, JSON.stringify(k), JSON.stringify(z), '->', JSON.stringify(enc), '->', JSON.stringify(dec)); fouten++; }
  }
}
// examples from the bladen
const ex = [
  ['rot13', 'De Scout', {}, 'Qr Fpbhg'], ['atbash', 'Scout', {}, 'Hxlfg'], ['codewoord', 'sportfeest', { woord: 'WIMPEL' }, 'aoplbxqqab'],
  ['vigenere', 'Scouts', { woord: 'BALOE' }, 'Tczixt'], ['a-is-1', 'SCOUT', {}, '19-3-15-21-20'], ['sms', 'SCOUT', {}, '7777 222 666 88 8'],
  ['polybius', 'SCOUT', {}, '43 13 34 45 44'], ['bacon', 'ABC', {}, 'AAAAA AAAAB AAABA'], ['binair', 'A', {}, '01000001'], ['leet', 'Scouts', {}, '5c0u75'],
  ['blokmethode', 'pionierhout', {}, 'PIOX IEUX ORTX NHXX'], ['zonder', 'Kom om acht uur naar het kampvuur', { wat: 'klinkers' }, 'Km m cht r nr ht kmpvr'],
  ['ptaal', 'hallo', {}, 'hapallopo'], ['ptaal', 'kamp', {}, 'kapamp'], ['verschuiving', 'SCOUT', { n: 1 }, 'TDPVU'],
  ['achterstevoren', 'Kom hier', { hoe: 'woord' }, 'moK reih'], ['achterstevoren', 'Kom hier', { hoe: 'alles' }, 'reih moK'], ['achterstevoren', 'Kom hier', { hoe: 'volgorde' }, 'hier Kom'],
  ['woordwaarde', 'SCOUT', {}, 'SCOUT = 19 + 3 + 15 + 21 + 20 = 78'],
];
for (const [id, t, k, want] of ex) {
  const got = CODES[id].codeer(t, { ...standaardSleutels(CODES[id]), ...k });
  if (got.toLowerCase() !== want.toLowerCase()) { console.log('VOORBEELD FOUT', id, t, got, 'want', want); fouten++; }
}
// ptaal round trip on Dutch words
for (const w of ['hallo', 'kampvuur', 'eieren', 'ui', 'beuk', 'zwaaien', 'ijs', 'oog', 'Scouting']) {
  const e = CODES.ptaal.codeer(w); const d = CODES.ptaal.decodeer(e); if (d !== w) { console.log('ptaal', w, e, d); fouten++; }
}
// hulpwoorden
for (const [l, ws] of Object.entries(HULPWOORDEN)) for (const w of ws) if (hulpCode(w) !== codes.MORSE[l]) { console.log('hulpwoord', l, w, hulpCode(w), codes.MORSE[l]); fouten++; }
// morse tijdlijn PARIS = 50 units incl word gap
const { woorden } = codes.naarMorse('PARIS PARIS');
const tl = codes.morseTijdlijn(woorden, 12);
const eenheid = 0.1;
const startTweede = tl.find((s) => s.teken === 5).van;
console.log('PARIS second word starts at', startTweede / eenheid, 'units (want 50)');
// verschuif / getallen

// Kraak de code (seinen/lib/kraak.js): every exercise has sentences, and every message can be read back to its sentence
const K = await import(W + 'seinen/lib/kraak.js');
const kfout = (...a) => { log('KRAAK FOUT', ...a); fouten++; };
for (const id of Object.keys(K.OPGAVEN)) {
  if (K.zinnenVoor(id).length < 4) kfout(id, 'te weinig zinnen', K.zinnenVoor(id).length);
  const c = CODES[id];
  for (let p = 0; p < 150; p++) {
    const o = K.nieuweOpgave(id, null, p % 2 === 1);
    const juist = K.antwoordLetters(id, o.zin);
    if (K.vergelijk(K.antwoordLetters(id, o.zin.toUpperCase(), juist.length), juist).aantal) kfout(id, 'eigen zin niet goed', o.zin);
    if (c?.decodeer) {
      const terug = c.decodeer(o.geheim, o.s);
      if (typeof terug !== 'string' || K.antwoordLetters(id, terug, juist.length).join('') !== juist.join('')) kfout(id, JSON.stringify(o.s), o.zin, '->', o.geheim, '->', terug);
    } else if (c?.tekens && c.tekens(o.zin).filter(Boolean).join('') !== letters(o.zin)) kfout(id, 'tekens', o.zin);
    else if (id === 'husselen' && [...letters(o.geheim)].sort().join('') !== [...letters(o.zin)].sort().join('')) kfout(id, o.zin, o.geheim);
    else if (id === 'woordwaarde' && !o.geheim.endsWith(`= ${K.woordwaarde(o.zin)}`)) kfout(id, o.zin, o.geheim);
    const t = K.OPGAVEN[id].terug;
    if (t) {
      const stukken = K.STUKKEN[t];
      // what a scout may type: without the spaces between the pieces, with a dot and a hyphen for morse, in other capitals
      const getypt = { sms: o.geheim.replace(/ \/ /g, ' '), paren: o.geheim.replace(/[ /]/g, ''), bacon: o.geheim.replace(/[ /]/g, '').toLowerCase(),
        binair: o.geheim.replace(/[ /]/g, ''), morse: o.geheim.replaceAll('·', '.').replaceAll('–', '-') }[t] ?? o.geheim.toLowerCase();
      if (K.vergelijk(stukken(getypt), stukken(o.geheim)).aantal) kfout(id, 'zet in code', o.geheim, '|', getypt, stukken(getypt), stukken(o.geheim));
    }
  }
}
// the comparison: what is off, and where
const v1 = K.vergelijk([...'KAMPVUUR'], [...'KAMPVUUR']);
const v2 = K.vergelijk([...'KANPVUUR'], [...'KAMPVUUR']);
const v3 = K.vergelijk([...'KAPVUUR'], [...'KAMPVUUR']);
const v4 = K.vergelijk([...'KAMMPVUUR'], [...'KAMPVUUR']);
if (v1.aantal || v2.aantal !== 1 || !v2.fout.has(2) || v3.aantal !== 1 || v3.mist.get(2) !== 1 || v4.aantal !== 1 || v4.fout.size !== 1) kfout('vergelijk', v2, v3, v4);
if (K.woordwaarde('Scout') !== 78) kfout('woordwaarde', K.woordwaarde('Scout'));
if (K.antwoordLetters('blokmethode', 'pionierhoutxxxxx', 11).join('') !== 'PIONIERHOUT') kfout('opvulling');
log(`Codeermachine: ${fouten} fouten`);
process.exit(fouten ? 1 : 0);
