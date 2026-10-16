// The network as a small low-poly world (three.js, loaded only with this piece): grass, roads of four kinds, narrow
// paths, trees, the landmarks, a sky. You stand at a junction seen from above and behind, the roads to choose from
// have an arrow and a number; tap one (or use the buttons and keys in route.js) and you walk. It renders only while
// something moves, caps the pixel ratio at 2, follows the size of its box, and frees the GPU when it is gone.
//
// World: x to the east is X, y to the north is -Z. Same shape as kaart2d.js: zet(), loop(), markeer(), dispose().
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Fog, HemisphereLight, DirectionalLight, Mesh, Group, Object3D,
  MeshLambertMaterial, MeshBasicMaterial, BufferGeometry, Float32BufferAttribute, PlaneGeometry, BoxGeometry,
  CylinderGeometry, ConeGeometry, IcosahedronGeometry, SphereGeometry, CircleGeometry, InstancedMesh, Raycaster,
  Vector2, Vector3, Sprite, SpriteMaterial, CanvasTexture, SRGBColorSpace, BackSide, DoubleSide,
} from 'three';
import { SOORTEN, SMAL_BREED, punt, afstandTotLijn, rng, peiling, norm } from './netwerk.js';
import { animeerPad } from './loop.js';

const RAD = Math.PI / 180;
const V = (q, y = 0) => new Vector3(q.x, y, -q.y);

const KLEUREN = {
  licht: {
    lucht: '#7fb7e6', horizon: '#dceef7', gras: '#86b35a', gras2: '#77a64e', hemel: '#ffffff', grond: '#5b6b3a',
    zon: '#fff3dc', zonSterk: 1.6, hemelSterk: 1.15,
    verhard: '#74787c', fietspad: '#b4573f', zandpad: '#d8c08c', bospad: '#9c7a52', smal: '#a99467',
  },
  donker: {
    lucht: '#2a3d66', horizon: '#9a8fa8', gras: '#6f9a4e', gras2: '#668f47', hemel: '#d6dcff', grond: '#3a4530',
    zon: '#ffd2a0', zonSterk: 1.25, hemelSterk: 1.0,
    verhard: '#5d6166', fietspad: '#8f4535', zandpad: '#b29e74', bospad: '#7c6143', smal: '#8a7a56',
  },
};
const HOOGTE = { bospad: 0.03, zandpad: 0.05, fietspad: 0.07, verhard: 0.09 };

/** A flat strip from a to b, pushed into a position array (two triangles, facing up). */
function strook(pos, a, b, breed, y) {
  const dx = b.x - a.x; const dy = b.y - a.y; const l = Math.hypot(dx, dy) || 1;
  const px = (-dy / l) * breed / 2; const py = (dx / l) * breed / 2;
  const h = [[a.x + px, a.y + py], [a.x - px, a.y - py], [b.x - px, b.y - py], [b.x + px, b.y + py]];
  for (const i of [0, 1, 2, 0, 2, 3]) pos.push(h[i][0], y, -h[i][1]);
}
function schijf(pos, c, r, y, n = 16) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2; const b = ((i + 1) / n) * Math.PI * 2;
    pos.push(c.x, y, -c.y, c.x + r * Math.sin(b), y, -(c.y + r * Math.cos(b)), c.x + r * Math.sin(a), y, -(c.y + r * Math.cos(a)));
  }
}
function vlakGeo(pos) {
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(pos.map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  return g;
}

/** A text on a canvas, as a sprite. */
function tekstSprite(tekst, { breed = 256, hoog = 64, achter = '#ffffff', kleur = '#17211b', rand = '#17211b', rond = false, schaal = 1, volgorde = 3 } = {}) {
  const c = document.createElement('canvas'); c.width = breed; c.height = hoog;
  const x = c.getContext('2d');
  x.fillStyle = achter; x.strokeStyle = rand; x.lineWidth = 6;
  if (rond) { x.beginPath(); x.arc(breed / 2, hoog / 2, hoog / 2 - 4, 0, Math.PI * 2); x.fill(); x.stroke(); }
  else { x.beginPath(); x.roundRect(3, 3, breed - 6, hoog - 6, 10); x.fill(); x.stroke(); }
  x.fillStyle = kleur; x.textAlign = 'center'; x.textBaseline = 'middle';
  let size = rond ? hoog * 0.58 : hoog * 0.5;
  x.font = `700 ${size}px system-ui, sans-serif`;
  while (!rond && x.measureText(tekst).width > breed - 20 && size > 12) { size -= 2; x.font = `700 ${size}px system-ui, sans-serif`; }
  x.fillText(tekst, breed / 2, hoog / 2 + 2);
  const tex = new CanvasTexture(c); tex.colorSpace = SRGBColorSpace;
  // drawn over everything (and after the arrows): a tree or a house between the camera and the junction must not
  // hide a number or a street name
  const sp = new Sprite(new SpriteMaterial({ map: tex, depthTest: false, depthWrite: false, transparent: true }));
  sp.scale.set((breed / hoog) * schaal, schaal, 1);
  sp.renderOrder = volgorde;
  return sp;
}

/**
 * The world without the route: sky, ground, roads, trees, the landmarks at the junctions and the fences at dead
 * ends, added to `scene`. Shared with the spiegelkompas piece (../kompas3d/), which stands in this world at eye height.
 * `open`: points where no tree may stand (within 7 m); `vrij(q)`: an extra test for where a tree may stand.
 * Returns the materials and builders, so a caller can add things of its own in the same style.
 */
export function bouwLandschap(scene, net, { donker = false, open = [], vrij: magBoom = () => true } = {}) {
  const K = donker ? KLEUREN.donker : KLEUREN.licht;
  let lucht; let grond;
  // the area of the network
  const xs = net.levend.map((k) => k.x); const ys = net.levend.map((k) => k.y);
  const midden = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
  const r = rng(net.seed * 5 + 1);

  // -- sky: a dome with a gradient, not touched by fog
  {
    const g = new SphereGeometry(520, 16, 10);
    const boven = new Color(K.lucht); const onder = new Color(K.horizon);
    const kleur = []; const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) { const t = Math.max(0, pos.getY(i) / 520); const c = onder.clone().lerp(boven, Math.pow(t, 0.6)); kleur.push(c.r, c.g, c.b); }
    g.setAttribute('color', new Float32BufferAttribute(kleur, 3));
    lucht = new Mesh(g, new MeshBasicMaterial({ vertexColors: true, side: BackSide, fog: false, depthWrite: false }));
    lucht.position.set(midden.x, 0, -midden.y);
    scene.add(lucht);
  }

  // -- the ground, with a little colour variation
  {
    const g = new PlaneGeometry(1100, 1100, 44, 44);
    g.rotateX(-Math.PI / 2);
    const a = new Color(K.gras); const b = new Color(K.gras2); const kleur = [];
    for (let i = 0; i < g.attributes.position.count; i++) { const c = a.clone().lerp(b, r()); kleur.push(c.r, c.g, c.b); }
    g.setAttribute('color', new Float32BufferAttribute(kleur, 3));
    grond = new Mesh(g, new MeshLambertMaterial({ vertexColors: true }));
    grond.position.set(midden.x, 0, -midden.y);
    scene.add(grond);
  }

  // -- roads: one mesh per kind, with a disc at every junction in the colour of its widest road
  {
    const lagen = Object.fromEntries(Object.keys(SOORTEN).map((s) => [s, []]));
    for (const w of net.wegenLijst) strook(lagen[w.soort], net.knopen[w.a], net.knopen[w.b], SOORTEN[w.soort].breed, HOOGTE[w.soort]);
    for (const k of net.levend) {
      if (k.wegen.length < 2) continue;
      const breedste = k.wegen.map((id) => net.wegen[id].soort).sort((p, q) => SOORTEN[q].breed - SOORTEN[p].breed)[0];
      schijf(lagen[breedste], k, (SOORTEN[breedste].breed / 2) * 1.12, HOOGTE[breedste] + 0.012);
    }
    Object.entries(lagen).forEach(([soort, pos], i) => {
      if (!pos.length) return;
      scene.add(new Mesh(vlakGeo(pos), new MeshLambertMaterial({ color: K[soort], polygonOffset: true, polygonOffsetFactor: -1 - i, polygonOffsetUnits: -2 - i })));
    });
    const smal = [];
    for (const pd of net.paadjes) strook(smal, net.knopen[pd.knoop], pd, SMAL_BREED, 0.02);
    if (smal.length) scene.add(new Mesh(vlakGeo(smal), new MeshLambertMaterial({ color: K.smal, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })));
  }

  // -- materials for the things
  const mat = (kleur) => new MeshLambertMaterial({ color: kleur });
  const M = {
    stam: mat('#6e4b2f'), naald: mat('#2f6b3d'), blad: mat('#4f8f3f'), eik: mat('#4a7f37'),
    muur: mat('#efe7d8'), baksteen: mat('#a65a3e'), dak: mat('#8e3b2b'), leien: mat('#4c5663'), hout: mat('#8a5a32'),
    wit: mat('#f4f2ec'), rood: mat('#c8321e'), oranje: mat('#e8742a'), donker: mat('#2d2a26'), huid: mat('#e3b08a'),
    shirt: mat('#c9b07a'), broek: mat('#3b4a5c'), rugzak: mat('#3f6e4a'), das: mat('#c8321e'),
  };

  // -- trees: instanced, away from roads, junctions and landmarks, denser in a few woods
  {
    const bossen = Array.from({ length: 7 }, () => ({ x: midden.x + (r() - 0.5) * 420, y: midden.y + (r() - 0.5) * 420, r: 50 + r() * 90 }));
    const lijnen = net.wegenLijst.map((w) => [net.knopen[w.a], net.knopen[w.b], SOORTEN[w.soort].breed / 2 + 3.2]);
    for (const pd of net.paadjes) lijnen.push([net.knopen[pd.knoop], pd, 2]);
    const vrij = (q) => lijnen.every(([a, b, m]) => afstandTotLijn(q, a, b) > m)
      && net.levend.every((k) => k.wegen.length < 3 || Math.hypot(q.x - k.x, q.y - k.y) > 12)
      && net.bakens.every((b) => Math.hypot(q.x - b.x, q.y - b.y) > (b.soort === 'kerk' ? 14 : b.soort === 'huis' ? 11 : 6))
      && open.every((b) => Math.hypot(q.x - b.x, q.y - b.y) > 7) && magBoom(q);
    const bomen = [];
    for (let i = 0; i < 2600 && bomen.length < 520; i++) {
      const q = { x: midden.x + (r() - 0.5) * 560, y: midden.y + (r() - 0.5) * 560 };
      const inBos = bossen.some((b) => Math.hypot(q.x - b.x, q.y - b.y) < b.r);
      if (r() > (inBos ? 0.9 : 0.12) || !vrij(q)) continue;
      bomen.push({ ...q, naald: r() < (inBos ? 0.65 : 0.35), s: 0.75 + r() * 0.65, t: r() });
    }
    const naald = bomen.filter((b) => b.naald); const loof = bomen.filter((b) => !b.naald);
    const o = new Object3D();
    const stammen = new InstancedMesh(new CylinderGeometry(0.22, 0.32, 2.2, 5), M.stam, bomen.length);
    bomen.forEach((b, i) => { o.position.set(b.x, 1.1 * b.s, -b.y); o.scale.setScalar(b.s); o.rotation.set(0, 0, 0); o.updateMatrix(); stammen.setMatrixAt(i, o.matrix); });
    const kegels = new InstancedMesh(new ConeGeometry(2.1, 6.2, 6), M.naald, naald.length);
    const tint = new Color();
    naald.forEach((b, i) => { o.position.set(b.x, (2 + 3.1) * b.s, -b.y); o.scale.setScalar(b.s); o.rotation.set(0, b.t * 6, 0); o.updateMatrix(); kegels.setMatrixAt(i, o.matrix); kegels.setColorAt(i, tint.set(M.naald.color).offsetHSL(0, 0, (b.t - 0.5) * 0.08)); });
    const bollen = new InstancedMesh(new IcosahedronGeometry(2.5, 0), M.blad, loof.length);
    loof.forEach((b, i) => { o.position.set(b.x, (2 + 2) * b.s, -b.y); o.scale.set(b.s, b.s * 1.1, b.s); o.rotation.set(b.t, b.t * 5, 0); o.updateMatrix(); bollen.setMatrixAt(i, o.matrix); bollen.setColorAt(i, tint.set(M.blad.color).offsetHSL((b.t - 0.5) * 0.04, 0, (b.t - 0.5) * 0.1)); });
    const schaduw = new InstancedMesh(new CircleGeometry(1, 10).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: '#000000', transparent: true, opacity: donker ? 0.22 : 0.15, depthWrite: false }), bomen.length);
    bomen.forEach((b, i) => { o.position.set(b.x + 0.6, 0.015, -b.y + 0.4); o.rotation.set(0, 0, 0); o.scale.setScalar(b.s * 2.3); o.updateMatrix(); schaduw.setMatrixAt(i, o.matrix); });
    scene.add(stammen, kegels, bollen, schaduw);
  }

  // -- landmarks
  const doos = (b, h, d, m, x = 0, y = 0, z = 0) => { const me = new Mesh(new BoxGeometry(b, h, d), m); me.position.set(x, y, z); return me; };
  const bouw = {
    huis: () => {
      const g = new Group();
      g.add(doos(7, 4.4, 6, M.muur, 0, 2.2, 0));
      const dak = new Mesh(new ConeGeometry(5.6, 3.2, 4), M.dak); dak.rotation.y = Math.PI / 4; dak.scale.set(1, 1, 0.86); dak.position.y = 6; g.add(dak);
      g.add(doos(1.1, 2, 0.1, M.hout, 0, 1, 3.03), doos(1.3, 1, 0.1, M.leien, -2.2, 2.6, 3.03), doos(1.3, 1, 0.1, M.leien, 2.2, 2.6, 3.03));
      return g;
    },
    kerk: () => {
      const g = new Group();
      g.add(doos(6, 6, 11, M.baksteen, 0, 3, -1));
      const dak = new Mesh(new ConeGeometry(4.7, 3.6, 4), M.leien); dak.rotation.y = Math.PI / 4; dak.scale.set(1, 1, 1.75); dak.position.set(0, 7.8, -1); g.add(dak);
      g.add(doos(3.4, 12, 3.4, M.baksteen, 0, 6, 5.6));
      const spits = new Mesh(new ConeGeometry(2.6, 7, 4), M.leien); spits.rotation.y = Math.PI / 4; spits.position.set(0, 15.5, 5.6); g.add(spits);
      g.add(doos(1.4, 2.4, 0.1, M.hout, 0, 1.2, 7.33));
      return g;
    },
    boom: () => {
      const g = new Group();
      const stam = new Mesh(new CylinderGeometry(0.55, 0.8, 4.2, 6), M.stam); stam.position.y = 2.1; g.add(stam);
      for (const [x, y, z, s] of [[0, 6.2, 0, 3.8], [2.2, 5.2, 0.8, 2.8], [-2, 5.4, -0.6, 3], [0.3, 7.6, -1.2, 2.6]]) {
        const bol = new Mesh(new IcosahedronGeometry(s, 0), M.eik); bol.position.set(x, y, z); bol.rotation.set(x, y, z); g.add(bol);
      }
      return g;
    },
    bankje: () => {
      const g = new Group();
      g.add(doos(2.4, 0.12, 0.62, M.hout, 0, 0.55, 0), doos(2.4, 0.5, 0.1, M.hout, 0, 0.95, -0.3));
      for (const x of [-1, 1]) g.add(doos(0.12, 0.55, 0.5, M.donker, x, 0.27, 0));
      return g;
    },
    hek: () => {
      const g = new Group();
      for (const x of [-3, -1, 1, 3]) g.add(doos(0.18, 1.3, 0.18, M.hout, x, 0.65, 0));
      g.add(doos(6.4, 0.14, 0.08, M.hout, 0, 1.05, 0), doos(6.4, 0.14, 0.08, M.hout, 0, 0.6, 0));
      return g;
    },
  };
  function wegwijzer(k) {
    const g = new Group();
    const paal = new Mesh(new CylinderGeometry(0.09, 0.09, 3.3, 6), M.wit); paal.position.y = 1.65; g.add(paal);
    k.wegen.slice(0, 3).forEach((id, i) => {
      const w = net.wegen[id]; const ander = net.ander(w, k);
      const arm = new Group(); arm.rotation.y = -peiling(k, ander) * RAD;
      arm.add(doos(0.08, 0.34, 1.7, M.wit, 0, 0, -0.9), doos(0.09, 0.08, 1.7, M.rood, 0, 0.15, -0.9));
      arm.position.y = 3 - i * 0.42; g.add(arm);
    });
    return g;
  }
  for (const b of net.bakens) {
    const k = net.knopen[b.knoop];
    const ding = b.soort === 'wegwijzer' ? wegwijzer(k) : bouw[b.soort]();
    ding.position.set(b.x, 0, -b.y);
    // the front faces the junction; a fence lies across the corner
    if (b.soort !== 'wegwijzer') ding.rotation.y = -(peiling(b, k)) * RAD + Math.PI;
    if (b.soort === 'boom') ding.rotation.y = b.draai * RAD;
    scene.add(ding);
  }
  // a fence at the end of a dead end
  for (const k of net.levend) {
    if (!k.doodlopend) continue;
    const w = net.wegen[k.wegen[0]]; const ander = net.ander(w, k);
    const hek = bouw.hek(); hek.position.set(k.x, 0, -k.y); hek.rotation.y = -peiling(ander, k) * RAD; hek.scale.x = (SOORTEN[w.soort].breed + 1.5) / 6.4;
    scene.add(hek);
  }

  return { K, M, doos, bouw, midden, lucht, grond };
}

export function maakWereld3d(plek, net, route, { opKeuze, beweging, donker }) {
  const K = donker ? KLEUREN.donker : KLEUREN.licht;
  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const canvas = renderer.domElement;
  canvas.className = 'rw-canvas';
  plek.append(canvas);

  const scene = new Scene();
  scene.background = new Color(K.horizon);
  scene.fog = new Fog(K.horizon, 70, 240);
  const camera = new PerspectiveCamera(60, 4 / 3, 0.5, 700);

  scene.add(new HemisphereLight(K.hemel, K.grond, K.hemelSterk));
  const zon = new DirectionalLight(K.zon, K.zonSterk);
  zon.position.set(-60, 120, 40);
  scene.add(zon);

  const { M, doos } = bouwLandschap(scene, net, { donker, open: [route.start, route.eind] });

  // -- start and post
  function vlag(q, groot) {
    const g = new Group();
    const s = groot ? 1.5 : 1;
    const stok = new Mesh(new CylinderGeometry(0.07 * s, 0.07 * s, 3.4 * s, 6), M.wit); stok.position.y = 1.7 * s; g.add(stok);
    const doek = new Mesh(new BufferGeometry().setAttribute('position', new Float32BufferAttribute([0, 3.3 * s, 0, 0, 2.4 * s, 0, 1.5 * s, 2.85 * s, 0], 3)), new MeshBasicMaterial({ color: groot ? '#e8742a' : '#2f7fd0', side: DoubleSide }));
    g.add(doek);
    if (groot) { const tent = new Mesh(new ConeGeometry(2.2, 2.4, 4), M.oranje); tent.position.set(3.4, 1.2, 1.5); tent.rotation.y = Math.PI / 4; g.add(tent); }
    g.position.set(q.x, 0, -q.y);
    scene.add(g);
  }
  vlag(punt(route.start, 3.5, route.start.koers + 90), false);
  vlag(punt(route.eind, 4, route.eind.koers + 90), true);

  // -- the walker
  const loper = new Group();
  {
    for (const x of [-0.14, 0.14]) loper.add(doos(0.17, 0.8, 0.2, M.broek, x, 0.4, 0));
    const lijf = new Mesh(new CylinderGeometry(0.27, 0.33, 0.85, 8), M.shirt); lijf.position.y = 1.22; loper.add(lijf);
    const das = new Mesh(new ConeGeometry(0.16, 0.3, 3), M.das); das.position.set(0, 1.48, -0.25); das.rotation.x = Math.PI; loper.add(das);
    const hoofd = new Mesh(new SphereGeometry(0.23, 10, 8), M.huid); hoofd.position.y = 1.86; loper.add(hoofd);
    const rand = new Mesh(new CylinderGeometry(0.42, 0.42, 0.04, 12), M.hout); rand.position.y = 2.02; loper.add(rand);
    const kroon = new Mesh(new ConeGeometry(0.22, 0.32, 8), M.hout); kroon.position.y = 2.18; loper.add(kroon);
    loper.add(doos(0.5, 0.62, 0.26, M.rugzak, 0, 1.3, 0.36));
  }
  scene.add(loper);

  // -- choices at the current junction: an arrow on the road, a number, a name sign, and a wide invisible strip to tap
  const keuzeGroep = new Group(); scene.add(keuzeGroep);
  const PIJL = (() => {
    const pos = []; const v = (x, z) => pos.push(x, 0, z);
    v(-0.45, 0); v(0.45, 0); v(0.45, -4.2); v(-0.45, 0); v(0.45, -4.2); v(-0.45, -4.2);
    v(-1.25, -4.2); v(1.25, -4.2); v(0, -6.4);
    return vlakGeo(pos);
  })();
  const raakGeo = new PlaneGeometry(7, 15).rotateX(-Math.PI / 2).translate(0, 0, -9);
  const pijlKleur = { gewoon: new Color('#ffffff'), focus: new Color('#ffd84a'), hint: new Color('#3fcb7d') };
  let keuzes = []; let raakDoelen = []; let markering = { focus: -1, hint: -1 };

  function leegKeuzes() {
    for (const c of [...keuzeGroep.children]) {
      c.traverse((o) => { if (o.material) { o.material.map?.dispose(); o.material.dispose(); } if (o.geometry && o.geometry !== PIJL && o.geometry !== raakGeo) o.geometry.dispose(); });
      keuzeGroep.remove(c);
    }
    raakDoelen = []; keuzes = [];
  }
  function toonKeuzes(knoop, lijst) {
    leegKeuzes();
    keuzes = lijst.map((w, i) => {
      const g = new Group(); g.position.set(knoop.x, 0.16, -knoop.y); g.rotation.y = -w.peiling * RAD;
      // drawn on top of the road (no depth test): at a grazing angle the road's polygon offset would hide it
      const pijl = new Mesh(PIJL, new MeshBasicMaterial({ color: pijlKleur.gewoon, transparent: true, opacity: 0.88, depthWrite: false, depthTest: false }));
      pijl.position.z = -2.6; pijl.renderOrder = 2; g.add(pijl);
      const raak = new Mesh(raakGeo, new MeshBasicMaterial({ visible: false })); raak.userData.keuze = i; g.add(raak);
      const nr = tekstSprite(String(i + 1), { breed: 128, hoog: 128, rond: true, achter: '#17211b', kleur: '#ffffff', rand: '#ffffff', schaal: 2, volgorde: 4 });
      nr.position.set(0, 1.7, Math.abs(w.draai) > 110 ? -7.5 : -11); nr.userData.keuze = i; g.add(nr);
      // the name sign on a little post at the right-hand side of the road mouth
      const zij = SOORTEN[w.soort].breed / 2 + 1.3;
      const post = new Mesh(new CylinderGeometry(0.06, 0.06, 2.1, 5), M.wit); post.position.set(zij, 1.05, -5); g.add(post);
      const bord = tekstSprite(w.naam, { achter: '#ffffff', kleur: '#17211b', rand: '#2a5fae', schaal: 1.15 }); bord.position.set(zij, 2.6, -5); g.add(bord);
      keuzeGroep.add(g);
      raakDoelen.push(raak, nr);
      return { pijl };
    });
    kleurKeuzes();
  }
  function kleurKeuzes() {
    keuzes.forEach(({ pijl }, i) => {
      pijl.material.color.copy(i === markering.hint ? pijlKleur.hint : i === markering.focus ? pijlKleur.focus : pijlKleur.gewoon);
      pijl.scale.setScalar(i === markering.focus || i === markering.hint ? 1.15 : 1);
    });
  }

  // -- camera: from above and behind while standing, lower while walking
  let stand = { pos: { x: route.start.x, y: route.start.y }, koers: route.start.koers };
  let hoog = 1; let hoogDoel = 1; let lopend = false; let bob = 0;
  function plaats() {
    const f = new Vector3(Math.sin(stand.koers * RAD), 0, -Math.cos(stand.koers * RAD));
    loper.position.set(stand.pos.x, lopend && beweging ? Math.abs(Math.sin(bob)) * 0.08 : 0, -stand.pos.y);
    loper.rotation.y = -stand.koers * RAD;
    const terug = 7 + hoog * 5; const op = 3.6 + hoog * 8.4; const vooruit = 6 + hoog * 2;
    camera.position.copy(loper.position).addScaledVector(f, -terug); camera.position.y = op;
    const doel = V(stand.pos, (1 - hoog) * 1.6).addScaledVector(f, vooruit);
    camera.lookAt(doel);
  }

  let rafId = 0; let animeert = false; let vorige = 0; let weg = false;
  function render() { plaats(); renderer.render(scene, camera); }
  function lus(nu) {
    rafId = 0;
    if (weg || !plek.isConnected) return;
    const dt = Math.min(0.1, (nu - (vorige || nu)) / 1000); vorige = nu;
    hoog += (hoogDoel - hoog) * Math.min(1, dt * 3.2);
    if (Math.abs(hoogDoel - hoog) < 0.004) hoog = hoogDoel;
    if (lopend) bob += dt * 11;
    render();
    if (animeert || hoog !== hoogDoel) rafId = requestAnimationFrame(lus);
  }
  function start() { if (!rafId) { vorige = 0; rafId = requestAnimationFrame(lus); } }
  function vraagRender() { if (!rafId) rafId = requestAnimationFrame(lus); }

  // -- size
  const ro = new ResizeObserver(() => {
    if (weg || !plek.isConnected) return;
    const w = plek.clientWidth; const h = plek.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); vraagRender();
  });
  ro.observe(plek);

  // -- tapping and pointing
  const ray = new Raycaster(); const muis = new Vector2();
  const raak = (e) => {
    if (!raakDoelen.length) return -1;
    const b = canvas.getBoundingClientRect();
    muis.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(muis, camera);
    const hit = ray.intersectObjects(raakDoelen, false)[0];
    return hit ? hit.object.userData.keuze : -1;
  };
  canvas.addEventListener('click', (e) => { const i = raak(e); if (i >= 0) opKeuze(i); });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const i = raak(e);
    canvas.style.cursor = i >= 0 ? 'pointer' : '';
    if (i !== markering.focus) { markering.focus = i; kleurKeuzes(); vraagRender(); }
  });

  render();

  return {
    zet({ pos, koers, keuzes: lijst = [], knoop = null }) {
      stand = { pos: { ...pos }, koers };
      markering = { focus: -1, hint: -1 };
      if (knoop && lijst.length) toonKeuzes(knoop, lijst); else leegKeuzes();
      hoogDoel = knoop ? 1 : 0.35;
      if (!beweging) hoog = hoogDoel;
      start();
    },
    markeer(i, soort = 'focus') { markering[soort] = i; kleurKeuzes(); vraagRender(); },
    async loop(punten, eindKoers) {
      leegKeuzes();
      lopend = true; animeert = true; hoogDoel = 0; if (!beweging) hoog = 0;
      start();
      await animeerPad(punten, stand.koers, eindKoers, { beweging, levend: () => !weg && plek.isConnected,
        opFrame: (st) => { stand = { pos: st.pos, koers: norm(st.koers) }; } });
      lopend = false; animeert = false;
      start();
    },
    dispose() {
      weg = true;
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      leegKeuzes();
      PIJL.dispose(); raakGeo.dispose();
      scene.traverse((o) => {
        o.geometry?.dispose();
        const m = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        for (const x of m) { x.map?.dispose(); x.dispose(); }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
