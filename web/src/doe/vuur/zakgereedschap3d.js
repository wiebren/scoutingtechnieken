// A Zwitsers zakmes or a multitool in 3D (three.js, loaded only with zakgereedschap.js). Sizes in mm. The knife lies
// along x, its blades open downwards out of the bottom edge, the layers stack along z; the multitool's jaws point
// along +x, its two handles turn round a pin each at the base of the jaws. Every part turns or slides from closed
// (t = 0) to open (t = 1); the scene animates towards what zet() asks and renders only when something changes.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, HemisphereLight, DirectionalLight, Mesh, Group, MeshPhongMaterial,
  Shape, ExtrudeGeometry, CylinderGeometry, TorusGeometry, TubeGeometry, CatmullRomCurve3, BoxGeometry, Vector3,
  Raycaster, Vector2, Path,
} from 'three';
import { DELEN } from './zakgereedschap-modellen.js';

const PI = Math.PI;
const RT = 4.2;                 // the round tang of a part round its pivot
const LAAG = 3.2;               // a layer of a Zwitsers zakmes: a part and a liner
const KLEUR = { staal: '#d3d8dd', ruw: '#8f979e', wit: '#f3f1ea', rood: '#c4282b', alu: '#b9bec3', mat: '#a7aeb5', donker: '#5a6168', glas: '#bfe3f2' };

// -- shapes ------------------------------------------------------------------------------------------------------

/** Points on a quadratic curve from a over c to b (without a). */
const krom = (a, c, b, n = 6) => Array.from({ length: n }, (_, i) => {
  const t = (i + 1) / n; const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
});

/** A part's outline: from the top of the round tang along `pts` to its bottom, and round the pivot back. */
function omtrek(pts, rt = RT) {
  const s = new Shape();
  s.moveTo(0, rt);
  for (const [x, y] of pts) s.lineTo(x, y);
  s.lineTo(0, -rt);
  s.absarc(0, 0, rt, -PI / 2, -PI * 1.5, true);
  return s;
}

/** The flat outline of a part along +x from its pivot, its edge (if any) at -y; with extra meshes, made in buildDeel. */
function vorm(d) {
  const { L, B } = d; const s = 0.4 * B; const e = -0.6 * B;
  switch (d.vorm) {
    case 'mes': case 'gekarteld': {
      const rug = [[5, s], [0.62 * L, s], ...krom([0.62 * L, s], [0.92 * L, s], [L, -0.1 * B])];
      const buik = krom([L, -0.1 * B], [0.9 * L, e], [0.58 * L, e]);
      const snede = [];
      if (d.vorm === 'gekarteld') for (let x = 0.58 * L; x > 10; x -= 4) snede.push([x - 1.2, e + 1.3], [x - 4, e]);
      return omtrek([...rug, ...buik, ...snede, [7, e], [4, -RT]]);
    }
    case 'blik':
      return omtrek([[5, 0.3 * B], [0.86 * L, 0.3 * B], [L, 0.15 * B], [L, -0.1 * B], [0.8 * L, -0.2 * B], [0.7 * L, -0.8 * B], [0.62 * L, -0.3 * B], [6, -0.32 * B]]);
    case 'fles':
      return omtrek([[5, s], [0.9 * L, s], [L, 0.3 * B], [L, -0.3 * B], [0.9 * L, -0.48 * B], [0.66 * L, -0.48 * B], [0.62 * L, -0.12 * B], [0.5 * L, -0.12 * B], [0.46 * L, -0.5 * B], [6, -0.5 * B]]);
    case 'priem':
      return omtrek([[5, s], [0.3 * L, s], [L, 0], [0.3 * L, e], [5, e]]);
    case 'zaag': {
      const tanden = [];
      for (let x = L - 3; x > 9; x -= 2.6) tanden.push([x, e], [x - 1.3, e + 1.7]);
      return omtrek([[5, s], [L - 3, s], [L, s - 2.5], [L, e + 1], ...tanden, [7, e + 1.5]]);
    }
    case 'vijl':
      return omtrek([[5, s], [0.82 * L, s], [L, 0.05 * B], [L - 2, -0.12 * B], [L, -0.28 * B], [0.82 * L, e], [5, e]]);
    case 'haak':
      return omtrek([[5, s], [0.82 * L, s], [L, 0.1 * B], [L, e + 0.05 * B], [0.9 * L, e], [0.66 * L, e], [0.6 * L, -0.28 * B], [0.8 * L, -0.32 * B], [0.8 * L, -0.12 * B], [6, -0.12 * B]]);
    case 'schaar':
      return omtrek([[5, s], [0.55 * L, s], [L, 0.05 * B], [L - 1, -0.05 * B], [0.32 * L, -0.12 * B], [0.22 * L, -0.5 * B], [5, -0.5 * B]]);
    case 'tangetje':
      return omtrek([[5, s], [0.5 * L, s], [L, 0.3 * B], [L, 0.06 * B], [0.55 * L, 0], [L, -0.06 * B], [L, -0.4 * B], [0.5 * L, e], [5, e]]);
    case 'glas': {
      const r = 7.5; const cx = L - r;
      const sh = omtrek([[5, 2.2], [cx - r + 1, 2.2], ...krom([cx - r + 1, 2.2], [cx - r, r], [cx, r]),
        ...krom([cx, r], [cx + r, r], [cx + r, 0]), ...krom([cx + r, 0], [cx + r, -r], [cx, -r]),
        ...krom([cx, -r], [cx - r, -r], [cx - r + 1, -2.2]), [5, -2.2]]);
      const gat = new Path(); gat.absarc(cx, 0, r - 1.6, 0, PI * 2, false); sh.holes.push(gat);
      return sh;
    }
    case 'kruiskop':
      return omtrek([[4, 2.2], [L - 5, 1.5], [L, 0], [L - 5, -1.5], [4, -2.2]]);
    case 'bit':
      return omtrek([[5, 2.4], [L - 8, 2.4], [L - 8, -2.4], [5, -2.4]]);
    case 'kurk':
      return omtrek([[3, 1.6], [7, 1.2], [7, -1.2], [3, -1.6]], 2.4);
    case 'pincet': {
      const p = new Shape(); p.moveTo(0, -1.8);
      for (const [x, y] of [[4, -1.8], [4, -1.2], [L, -0.5], [L, 0.5], [4, 1.2], [4, 1.8], [0, 1.8]]) p.lineTo(x, y);
      return p;
    }
    case 'stoker': {
      const p = new Shape(); p.moveTo(0, -1.6);
      for (const [x, y] of [[5, -1.6], [5, -0.9], [L - 6, -0.9], [L, 0], [L - 6, 0.9], [5, 0.9], [5, 1.6], [0, 1.6]]) p.lineTo(x, y);
      return p;
    }
    default:
      return omtrek([[5, s], [L, s], [L, e], [5, e]]);
  }
}

const plaat = (shape, dik, bevel = 0) => {
  const g = new ExtrudeGeometry(shape, bevel
    ? { depth: dik, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 10 }
    : { depth: dik, bevelEnabled: false, curveSegments: 10 });
  g.translate(0, 0, -dik / 2);
  return g;
};

/** A stadium (a rounded bar) of length l and height hh, round the origin. */
function stadion(l, hh) {
  const r = hh / 2; const a = l / 2 - r; const s = new Shape();
  s.moveTo(-a, -r); s.lineTo(a, -r); s.absarc(a, 0, r, -PI / 2, PI / 2, false); s.lineTo(-a, r); s.absarc(-a, 0, r, PI / 2, PI * 1.5, false);
  return s;
}

// -- the scene ---------------------------------------------------------------------------------------------------

export function maakScene(plek, soort, model, { beweging, kleuren, opTik }) {
  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const canvas = renderer.domElement;
  canvas.className = 'bw-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  plek.prepend(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 4 / 3, 5, 3000);
  const hemi = new HemisphereLight(0xffffff, 0x7a7f86, 1.25);
  const zon = new DirectionalLight(0xffffff, 1.7); zon.position.set(80, 160, 220);
  const tegen = new DirectionalLight(0xdfe8ff, 0.6); tegen.position.set(-160, -60, -140);
  scene.add(hemi, zon, tegen);

  const materialen = [];
  const mat = (kleur, glans = 70, extra = {}) => {
    const m = new MeshPhongMaterial({ color: kleur, shininess: glans, specular: 0x8a8f94, ...extra });
    materialen.push(m); return m;
  };
  const geos = [];
  const mesh = (g, m) => { geos.push(g); return new Mesh(g, m); };

  const wortel = new Group(); scene.add(wortel);
  const delen = new Map();      // id → { groep, t, doel, zet(t), mats }
  const kleurVan = (d) => KLEUR[d.kleur] ?? KLEUR.staal;

  /** The meshes of one part in its own frame: the pivot at the origin, the part along +x, centred on z = 0. */
  function bouwDeel(d, m) {
    const g = new Group();
    g.add(mesh(plaat(vorm(d), d.dik), m));
    if (d.vorm === 'mes') {
      // the nail nick, a quarter of the length from the point, on both faces
      const nk = mat(KLEUR.donker, 20);
      for (const z of [1, -1]) {
        const n = mesh(new BoxGeometry(6, 0.9, 0.2), nk);
        n.position.set(0.75 * d.L, 0.4 * d.B - 2.4, z * (d.dik / 2 + 0.05)); n.rotation.z = 0.12;
        g.add(n);
      }
    } else if (d.vorm === 'kurk') {
      const pts = []; const r = 2.3; const x0 = 6; const lang = d.L - x0;
      for (let i = 0; i <= 90; i++) {
        const t = i / 90; const a = t * PI * 2 * 4.5; const rr = r * Math.min(1, (1 - t) * 6);
        pts.push(new Vector3(x0 + t * lang, Math.cos(a) * rr, Math.sin(a) * rr));
      }
      g.add(mesh(new TubeGeometry(new CatmullRomCurve3(pts), 140, 0.55, 6, false), m));
    } else if (d.vorm === 'glas') {
      const lens = mesh(new CylinderGeometry(6, 6, 0.9, 28), mat(KLEUR.glas, 120, { transparent: true, opacity: 0.45 }));
      lens.rotation.x = PI / 2; lens.position.x = d.L - 7.5; g.add(lens);
    } else if (d.vorm === 'bit') {
      const kop = mesh(new CylinderGeometry(3.8, 3.8, 8, 6), mat(KLEUR.donker, 40));
      kop.rotation.z = PI / 2; kop.position.x = d.L - 4; g.add(kop);
    } else if (d.vorm === 'schaar') {
      // the moving blade, a little open, and its spring
      const blad = new Shape(); blad.moveTo(0, 0);
      for (const [x, y] of [[0.7 * d.L, 0.2], [0.68 * d.L, -1.6], [0, -2.6], [-0.12 * d.L, -2.2]]) blad.lineTo(x, y);
      const b = mesh(plaat(blad, 0.7), m); b.position.set(0.32 * d.L, -0.12 * d.B, d.dik / 2 + 0.4); b.rotation.z = -0.1; g.add(b);
    }
    return g;
  }

  let kader = 100; let doelX = 0;

  if (soort === 'zakmes') {
    // -- a Zwitsers zakmes: scales, liners, parts in layers
    const rug = model.delen.some((x) => x.rug);
    const lagen = model.lagen + (rug ? 1 : 0);
    const T = lagen * LAAG; const PX = 37.5; const PY = -3;
    const rood = mat(KLEUR.rood, 45); const alu = mat(KLEUR.alu, 60);
    for (const k of [1, -1]) {
      const sch = mesh(plaat(stadion(89.4, 22.4), 2.2, 0.8), rood);
      sch.position.z = k * (T / 2 + 1.9); wortel.add(sch);
    }
    const kruis = new Shape(); kruis.moveTo(-1.6, -4.8);
    for (const [x, y] of [[1.6, -4.8], [1.6, -1.6], [4.8, -1.6], [4.8, 1.6], [1.6, 1.6], [1.6, 4.8], [-1.6, 4.8], [-1.6, 1.6], [-4.8, 1.6], [-4.8, -1.6], [-1.6, -1.6]]) kruis.lineTo(x, y);
    const kr = mesh(plaat(kruis, 0.3), mat('#ffffff', 30)); kr.position.set(-6, 0.5, T / 2 + 3.9); wortel.add(kr);
    for (let i = 0; i <= lagen; i++) {
      const l = mesh(plaat(stadion(90, 22.6), 0.7), alu); l.position.z = T / 2 - i * LAAG; wortel.add(l);
    }
    for (const x of [PX, -PX]) {
      const pen = mesh(new CylinderGeometry(1.5, 1.5, T + 6.4, 14), mat(KLEUR.staal, 90)); pen.rotation.x = PI / 2; pen.position.set(x, PY, 0); wortel.add(pen);
    }
    const laagZ = (i) => T / 2 - LAAG / 2 - i * LAAG;
    for (const p of model.delen) {
      const d = DELEN[p.id];
      if (d.vast) {
        // the key ring through a little steel eye at the end
        const ring = mesh(new TorusGeometry(5.6, 0.75, 8, 32), mat(KLEUR.staal, 90)); ring.position.set(-50.5, 6.5, 0); wortel.add(ring);
        const oog = mesh(new BoxGeometry(4, 2, 2.4), mat(KLEUR.staal, 90)); oog.position.set(-44, 6.5, 0); wortel.add(oog);
        continue;
      }
      const m = mat(kleurVan(d), d.kleur === 'wit' ? 15 : d.kleur === 'ruw' ? 25 : 80);
      const binnen = bouwDeel(d, m);
      const draai = new Group(); draai.add(binnen); wortel.add(draai);
      let zet;
      if (p.schuif) {
        // in a groove of the scale, it slides out at the left end
        const z = (p.schuif === 'voor' ? 1 : -1) * (T / 2 + 2.6); const y = p.schuif === 'voor' ? -5 : -5;
        draai.position.set(-45.6, y, z);
        zet = (t) => { draai.position.x = -45.6 - t * (d.L - 10); };
      } else if (p.rug) {
        // on the back of the handle, it turns up to stand square on it
        const x = p.eind < 0 ? -31 : 31; draai.position.set(x, 8.6, laagZ(lagen - 1));
        const open = ((p.open ?? 90) * PI) / 180; const dicht = p.eind < 0 ? 0 : PI;
        zet = (t) => { draai.rotation.z = dicht - p.eind * t * open; };
        if (p.eind > 0) binnen.scale.y = -1;
      } else {
        draai.position.set(p.eind * PX, PY, laagZ(p.laag));
        if (p.eind < 0) binnen.scale.x = -1;
        const open = ((p.open ?? 180) * PI) / 180;
        zet = (t) => { draai.rotation.z = PI + p.eind * t * open; };
      }
      binnen.traverse((o) => { o.userData.deel = p.id; });
      delen.set(p.id, { groep: draai, t: 0, doel: 0, zet, mats: [m] });
      zet(0);
    }
    kader = 68; doelX = 0;
  } else {
    // -- a multitool: two jaws, two handles that fold round them, parts in the handles
    const mt = mat(KLEUR.mat, 35); const pen = mat(KLEUR.donker, 50);
    const bek = new Shape(); bek.moveTo(-17, 0.3);
    for (const [x, y] of [[-17, 7], [-12, 9.8], [-6, 8.6], [6, 6], [20, 4.2], [44, 1.6], [46, 0.8], [46, 0.3], [11, 0.3], [7, 2.4], [3, 0.3]]) bek.lineTo(x, y);
    const kaken = new Group(); wortel.add(kaken);
    for (const k of [1, -1]) {
      const b = mesh(plaat(bek, 7), mt); b.scale.y = k; kaken.add(b);
    }
    const kpen = mesh(new CylinderGeometry(2.2, 2.2, 7.6, 14), pen); kpen.rotation.x = PI / 2; kpen.position.set(-2, 0, 0); kaken.add(kpen);
    kaken.traverse((o) => { o.userData.deel = 'tang'; });
    // a handle along -x from its pivot: two side plates, a spine on the inside (towards the other handle when the
    // pliers are open), the channel open to the outside
    const zij = new Shape(); zij.moveTo(-97, -7.5); zij.lineTo(0, -7.5); zij.absarc(0, 0, 7.5, -PI / 2, PI / 2, false);
    zij.lineTo(-97, 7.5); zij.quadraticCurveTo(-100, 7.5, -100, 4.5); zij.lineTo(-100, -4.5); zij.quadraticCurveTo(-100, -7.5, -97, -7.5);
    const handvat = {};
    for (const [naam, k] of [['boven', 1], ['onder', -1]]) {
      const draai = new Group(); draai.position.set(-12, k * 7.5, 0); wortel.add(draai);
      const binnen = new Group(); binnen.scale.y = k; draai.add(binnen);
      for (const z of [8.4, -8.4]) { const p = mesh(plaat(zij, 1.2), mt); p.position.z = z; binnen.add(p); }
      const spine = mesh(new BoxGeometry(88, 1.2, 7.2), mt); spine.position.set(-56, -6.9, 0); binnen.add(spine);
      for (const [x, r] of [[0, 2.6], [-93, 1.8]]) {
        const c = mesh(new CylinderGeometry(r, r, 19.4, 14), pen); c.rotation.x = PI / 2; c.position.x = x; binnen.add(c);
      }
      binnen.traverse((o) => { o.userData.deel = 'tang'; });
      handvat[naam] = { draai, binnen, k };
    }
    const tang = { t: 0, doel: 0, mats: [mt], groep: wortel,
      zet: (t) => {
        const th = PI * (1 - t) + 0.07 * t;
        handvat.boven.draai.rotation.z = -th; handvat.onder.draai.rotation.z = th;
      } };
    delen.set('tang', tang);
    for (const p of model.delen) {
      if (p.id === 'tang') continue;
      const d = DELEN[p.id];
      const m = mat(kleurVan(d), d.kleur === 'ruw' ? 25 : 80);
      const binnen = bouwDeel(d, m);
      const draai = new Group(); draai.add(binnen);
      draai.position.set(-93, 0, p.z);
      handvat[p.handvat].binnen.add(draai);
      // the outer parts open out over the spine (with the handles closed), the inner ones out of the channel
      if (p.buiten) binnen.scale.y = -1;
      const zet = p.buiten ? (t) => { draai.rotation.z = -t * PI; } : (t) => { draai.rotation.z = t * PI; };
      binnen.traverse((o) => { o.userData.deel = p.id; });
      delen.set(p.id, { groep: draai, t: 0, doel: 0, zet, mats: [m] });
      zet(0);
    }
    tang.zet(0);
    kader = 82; doelX = -34;
  }

  // -- camera: turn round the middle of the tool
  const doel = new Vector3(doelX, 0, 0);
  let breedte = 4; let hoogte = 3;
  const begin = { theta: 0.42, phi: 1.18, afstand: 1 };
  const zicht = { ...begin };
  const pasAfstand = () => {
    const tv = Math.tan(((camera.fov * PI) / 180) / 2); const th = tv * camera.aspect;
    return kader / Math.min(tv, th) * 1.02;
  };
  function plaatsCamera() {
    // a multitool turns round the middle of its pliers when open, round the closed handles when shut
    if (soort !== 'zakmes') { const t = delen.get('tang').t; doel.x = 42 - 76 * t * t * (3 - 2 * t); }
    const ver = pasAfstand();
    zicht.afstand = Math.min(ver * 2.4, Math.max(ver * 0.3, zicht.afstand));
    zicht.phi = Math.min(PI - 0.08, Math.max(0.08, zicht.phi));
    const s = Math.sin(zicht.phi);
    camera.position.set(doel.x + zicht.afstand * s * Math.sin(zicht.theta), doel.y + zicht.afstand * Math.cos(zicht.phi), doel.z + zicht.afstand * s * Math.cos(zicht.theta));
    camera.lookAt(doel);
    camera.near = Math.max(1, zicht.afstand / 50); camera.far = zicht.afstand + kader * 4;
    camera.updateProjectionMatrix();
  }

  // -- colours of the theme; a chosen part glows in the accent colour
  const accent = new Color(); let gekozen = null;
  function kleur(k) {
    scene.background = new Color(k.achter);
    accent.set(k.accent);
    hemi.intensity = k.donker ? 1.05 : 1.25;
    zetGloed();
    vraag();
  }
  function zetGloed() {
    for (const [id, x] of delen) for (const m of x.mats) m.emissive.copy(id === gekozen ? accent : new Color(0)).multiplyScalar(id === gekozen ? 0.35 : 0);
  }

  // -- animation and rendering, only on change
  let raf = 0; let weg = false; let vorige = 0;
  function teken(nu) {
    raf = 0;
    if (weg) return;
    const dt = vorige ? Math.min(64, nu - vorige) : 16; vorige = nu;
    let bezig = false;
    for (const x of delen.values()) {
      if (x.t === x.doel) continue;
      const stap = beweging ? dt / 420 : 1;
      x.t = x.doel > x.t ? Math.min(x.doel, x.t + stap) : Math.max(x.doel, x.t - stap);
      const e = x.t * x.t * (3 - 2 * x.t);
      x.zet(e);
      if (x.t !== x.doel) bezig = true;
    }
    plaatsCamera();
    renderer.render(scene, camera);
    if (bezig) raf = requestAnimationFrame(teken); else vorige = 0;
  }
  function vraag() { if (!raf && !weg) raf = requestAnimationFrame(teken); }

  const ro = new ResizeObserver(() => {
    if (weg) return;
    const w = plek.clientWidth; const h = plek.clientHeight;
    if (!w || !h || (w === breedte && h === hoogte)) return;
    const eerste = breedte === 4;
    breedte = w; hoogte = h;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (eerste) { begin.afstand = pasAfstand(); zicht.afstand = begin.afstand; }
    vraag();
  });
  ro.observe(plek);

  // -- turning and zooming: one finger or the mouse turns, two fingers or the wheel zoom; a tap opens or closes
  const wijzers = new Map(); let tik = null;
  const draai = (dx, dy) => { zicht.theta -= dx * 0.009; zicht.phi -= dy * 0.009; vraag(); };
  const zoom = (f) => { zicht.afstand *= f; vraag(); };
  canvas.addEventListener('pointerdown', (e) => {
    try { canvas.setPointerCapture(e.pointerId); } catch { /* the pointer is already gone */ }
    wijzers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    tik = wijzers.size === 1 ? { t: performance.now(), ver: 0 } : null;
  });
  canvas.addEventListener('pointermove', (e) => {
    const oud = wijzers.get(e.pointerId); if (!oud) return;
    const nieuw = { x: e.clientX, y: e.clientY };
    if (wijzers.size === 1) {
      draai(nieuw.x - oud.x, nieuw.y - oud.y);
      if (tik) tik.ver += Math.abs(nieuw.x - oud.x) + Math.abs(nieuw.y - oud.y);
    } else if (wijzers.size === 2) {
      const [a, b] = [...wijzers.entries()].map(([id, q]) => (id === e.pointerId ? nieuw : q));
      const [a0, b0] = [...wijzers.values()];
      const d0 = Math.hypot(a0.x - b0.x, a0.y - b0.y); const d1 = Math.hypot(a.x - b.x, a.y - b.y);
      if (d0 > 0 && d1 > 0) zoom(d0 / d1);
    }
    wijzers.set(e.pointerId, nieuw);
  });
  const straal = new Raycaster(); const punt = new Vector2();
  const los = (e) => {
    const was = wijzers.has(e.pointerId); wijzers.delete(e.pointerId);
    if (was && e.type === 'pointerup' && tik && tik.ver < 8 && performance.now() - tik.t < 600) {
      const b = canvas.getBoundingClientRect();
      punt.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
      straal.setFromCamera(punt, camera);
      const raak = straal.intersectObject(wortel, true).find((x) => x.object.userData.deel);
      if (raak) opTik(raak.object.userData.deel);
    }
    if (!wijzers.size || e.type !== 'pointerup') tik = null;
  };
  canvas.addEventListener('pointerup', los);
  canvas.addEventListener('pointercancel', los);
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); zoom(Math.exp(Math.max(-1, Math.min(1, e.deltaY * 0.0015)))); }, { passive: false });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  kleur(kleuren);
  plaatsCamera();

  return {
    /** Open (true, or how far: 0 to 1) or close a part; with `direct` it jumps there. */
    zet(id, open, direct = false) {
      const x = delen.get(id); if (!x) return;
      x.doel = open === true ? 1 : open || 0;
      if (direct || !beweging) { x.t = x.doel; x.zet(x.t); }
      vraag();
    },
    /** Light up a part (or none). */
    kies(id) { gekozen = id; zetGloed(); vraag(); },
    kleur,
    draai(dx, dy) { draai(dx, dy); },
    zoom,
    herstel() { Object.assign(zicht, begin); vraag(); },
    dispose() {
      weg = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      for (const g of geos) g.dispose();
      for (const m of materialen) m.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
