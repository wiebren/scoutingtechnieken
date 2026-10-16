// The world of the tochten, first person, for the spiegelkompas piece (three.js, loaded only with this piece and only
// when WebGL works). The ground, roads, woods, houses and sky come from the route walker (bouwLandschap in
// ../route/wereld3d.js); this adds the four landmarks of the field (veld.js) in the same style, keeps the trees out of
// the line of sight to them, and lets you look further (less haze, a wider ground). You stand on a junction at eye
// height and only turn. It renders one frame when the heading or the size changes, never in a loop; it caps the
// pixel ratio at 2 and frees the GPU when gone.
//
// World: east is +X, north is -Z, up is +Y; a bearing b (degrees, clockwise from north) points to (sin b, 0, -cos b).
// Same shape as landschap2d.js: zet(), maat(), dispose().
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Fog, HemisphereLight, DirectionalLight, Mesh, Group, CylinderGeometry,
  ConeGeometry, SphereGeometry, Vector3,
} from 'three';
import { bouwLandschap } from '../route/wereld3d.js';
import { peiling as peilingVan } from '../route/netwerk.js';
import { BAKENS, zijde } from './veld.js';

const RAD = Math.PI / 180;
const OOG = 1.6;            // eye height in metres

export function maakLandschap3d(plek, veld, { donker = false, opRender = () => {} } = {}) {
  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const canvas = renderer.domElement;
  canvas.className = 'k3-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  plek.prepend(canvas);

  const scene = new Scene();
  const { stand } = veld;
  const camera = new PerspectiveCamera(40, 1, 0.5, 2600);
  camera.position.set(stand.x, OOG, -stand.y);
  camera.rotation.order = 'YXZ';

  // no tree on your spot, in front of a landmark, or between you and it
  const vrij = (q) => {
    const d = Math.hypot(q.x - stand.x, q.y - stand.y);
    if (d < 30) return false;
    const pq = peilingVan(stand, q);
    return veld.bakens.every((b) => {
      const breed = BAKENS[b.soort].breed / 2;
      if (Math.hypot(q.x - b.x, q.y - b.y) < breed + 6) return false;
      const hoek = zijde(pq, b.peiling);
      if (d > b.afstand + 12 || Math.abs(hoek) > 90) return true;
      return Math.abs(Math.sin(hoek * RAD)) * d > breed + 4 + d * Math.tan(1.5 * RAD);
    });
  };
  const { K, M, doos, bouw, lucht, grond } = bouwLandschap(scene, veld.net, { donker, open: [stand], vrij });

  // seen from eye height you look much further than from above the walker: less haze, a wider ground and sky
  scene.background = new Color(K.horizon);
  scene.fog = new Fog(K.horizon, 260, 950);
  grond.scale.set(3, 1, 3);
  lucht.scale.setScalar(4);
  scene.add(new HemisphereLight(K.hemel, K.grond, K.hemelSterk));
  const zon = new DirectionalLight(K.zon, K.zonSterk);
  zon.position.set(-60, 120, 40);
  scene.add(zon);

  // -- the landmarks: the church and the oak of the route world, bigger; a mill and a water tower in its style
  const maak = {
    kerk: () => { const g = bouw.kerk(); g.scale.setScalar(1.5); return g; },
    eik: () => { const g = bouw.boom(); g.scale.setScalar(1.3); return g; },
    molen: () => {
      const g = new Group();
      const voet = new Mesh(new CylinderGeometry(5.4, 5.8, 2.5, 8), M.baksteen); voet.position.y = 1.25; g.add(voet);
      const romp = new Mesh(new CylinderGeometry(2.8, 5, 14, 8), M.donker); romp.position.y = 9.5; g.add(romp);
      const kap = new Mesh(new SphereGeometry(3.4, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M.donker); kap.scale.set(1, 0.8, 1.3); kap.position.y = 16.5; g.add(kap);
      // the sails: a stock for each arm, a lattice on one side of it
      const wiek = new Group(); wiek.position.set(0, 17, 4.3); wiek.rotation.z = 22 * RAD;
      for (const a of [0, 90, 180, 270]) {
        const arm = new Group(); arm.rotation.z = a * RAD;
        arm.add(doos(0.5, 10, 0.4, M.rood, 0, 5, 0), doos(1.8, 7.6, 0.15, M.wit, 1.15, 6, -0.1));
        wiek.add(arm);
      }
      g.add(wiek);
      return g;
    },
    watertoren: () => {
      const g = new Group();
      const schacht = new Mesh(new CylinderGeometry(3.2, 3.7, 22, 14), M.muur); schacht.position.y = 11; g.add(schacht);
      const kuip = new Mesh(new CylinderGeometry(7, 6.2, 7, 18), M.muur); kuip.position.y = 25.5; g.add(kuip);
      const band = new Mesh(new CylinderGeometry(7.1, 7.1, 1, 18), M.baksteen); band.position.y = 26; g.add(band);
      const kap = new Mesh(new ConeGeometry(7.3, 3.4, 18), M.leien); kap.position.y = 30.7; g.add(kap);
      g.add(doos(1.2, 2.2, 0.1, M.hout, 0, 1.1, 3.62));
      return g;
    },
  };
  const toppen = veld.bakens.map((b) => {
    const ding = maak[b.soort]();
    ding.position.set(b.x, 0, -b.y);
    // the front faces you; the mill a little turned, so its sails read as sails
    ding.rotation.y = -b.peiling * RAD + (b.soort === 'molen' ? 25 * RAD : 0);
    scene.add(ding);
    return new Vector3(b.x, BAKENS[b.soort].hoogte + 3, -b.y);
  });

  // -- size: horizon at `luchtPx` from the top, `hfov` degrees across. A view offset moves the horizon up without
  // tilting the camera, so towers stay upright.
  let breed = 0; let hoog = 0; let koers = 0;
  function maat(w, h, luchtPx, hfov) {
    if (!w || !h) return;
    breed = w; hoog = h;
    renderer.setSize(w, h, false);
    const f = (w / 2) / Math.tan((hfov / 2) * RAD);
    const vol = 2 * Math.max(h - luchtPx, h / 2);
    camera.fov = (2 * Math.atan(vol / 2 / f)) / RAD;
    camera.aspect = w / vol;
    camera.setViewOffset(w, vol, 0, vol / 2 - luchtPx, w, h);
    camera.updateProjectionMatrix();
    vraag();
  }

  // -- drawing, one frame per change
  let rafId = 0; let weg = false;
  const v = new Vector3();
  function teken() {
    rafId = 0;
    if (weg || !plek.isConnected || !breed) return;
    camera.rotation.set(0, -koers * RAD, 0);
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    opRender(veld.bakens.map((b, i) => {
      v.copy(toppen[i]).project(camera);
      const voor = Math.abs(zijde(b.peiling, koers)) < 90;
      return { x: ((v.x + 1) / 2) * breed, y: ((1 - v.y) / 2) * hoog, zichtbaar: voor && v.x > -1.2 && v.x < 1.2 };
    }));
  }
  function vraag() { if (!rafId && !weg) rafId = requestAnimationFrame(teken); }

  return {
    zet(k) { koers = k; vraag(); },
    maat,
    dispose() {
      weg = true;
      if (rafId) cancelAnimationFrame(rafId);
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
