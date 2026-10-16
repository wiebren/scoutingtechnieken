// Run in web/: node src/doe/route/route.test.mjs (also part of pnpm check). Tests for the route engine: routes valid, every notation decodes back to the same choices.
const base = new URL('./', import.meta.url).href;
const N = await import(base + 'netwerk.js');
const T = await import(base + 'notaties.js');
let fout = 0; let n = 0; const tel = {};
const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
for (let s = 1; s <= 400; s++) for (const L of [6, 9, 12]) {
  const { net, route } = N.maakAlles(s, L);
  n++;
  // route validity
  const gezien = new Set();
  for (const [i, st] of route.stappen.entries()) {
    if (gezien.has(st.knoop)) { fout++; console.log('dubbel', s, L); }
    gezien.add(st.knoop);
    if (!N.isKruispunt(net.knopen[st.knoop])) { fout++; console.log('geen kruispunt', s); }
    if (!N.eenduidig(st.wegen, st.gekozen)) { fout++; console.log('niet eenduidig', s); }
    if (i > 0 && route.stappen[i - 1].wegen[route.stappen[i - 1].gekozen].naar !== st.knoop) { fout++; console.log('niet verbonden', s); }
    const angles = [...st.wegen.map((w) => w.peiling), N.norm(st.koers + 180)].sort((a, b) => a - b);
    for (let j = 0; j < angles.length; j++) { const d = N.norm(angles[(j + 1) % angles.length] - angles[j]); if (angles.length > 1 && d < 41.9 && d > 0) { fout++; console.log('hoek', s, d); } }
  }
  const echt = route.stappen.map((st) => st.gekozen);
  for (const t of T.VOLGORDE) {
    const codes = T.codeer(t, route, net);
    const gelezen = T.TECHNIEKEN[t].lees(codes, route.stappen.map((st) => ({ ...st, gekozen: undefined })));
    if (!eq(gelezen, echt)) { fout++; tel[t] = (tel[t] ?? 0) + 1; if (tel[t] < 3) console.log('notatie', t, s, L, gelezen, echt); }
    if (codes.perStap.length !== L) { fout++; console.log('perStap', t); }
    for (let i = 0; i < L; i++) if (typeof T.TECHNIEKEN[t].uitleg(codes, i, route.stappen[i]) !== 'string') fout++;
  }
  // a wrong notation must not decode to the route: flip one choice in stripkaart
  const c = T.codeer('stripkaart', route, net); const it = c.items[0];
  if (it.links.length) { it.rechts.push(it.links.pop()); if (eq(T.TECHNIEKEN.stripkaart.lees(c, route.stappen), echt)) { fout++; console.log('strip vals'); } }
}
// tijden: check the Scoutpedia examples
for (const [h, m, g] of [[0, 0, 0], [0, 16, 88], [3, 0, 270], [9, 0, 90], [6, 0, 180], [0, 32, 176]]) if (Math.abs(T.tijdHoek(h, m) - g) > 0.01) { fout++; console.log('tijd', h, m); }
console.log(`Routelooper: ${n} routes, ${fout} fouten`);
process.exit(fout ? 1 : 0);
