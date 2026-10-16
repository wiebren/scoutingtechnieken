// The doe names of the touwbanen models, merged into ./index.js. Same shape as there. `bouwwerk-apenbrug` stays in
// ./index.js with the model name `apenbrug`, which ./modellen-touwbanen.js now fills with the two-rope apenbrug.
// `bouw` is the one helper of all three lists: a bouwwerk is to look at (`bekijk`), so Oefenen leaves it out.
const laad = () => import('./bouwwerk.js');
export const bouw = (titel, model) => ({ titel, laad, opties: { model }, bekijk: true });

export default {
  'bouwwerk-v-touwbrug': bouw('Bekijk de V-touwbrug in 3D', 'vtouwbrug'),
  'bouwwerk-buikschuif': bouw('Bekijk de buikschuif in 3D', 'buikschuif'),
  'bouwwerk-postman-walk': bouw('Bekijk de postman walk in 3D', 'postmanwalk'),
  'bouwwerk-lianenbrug': bouw('Bekijk de lianenbrug in 3D', 'lianenbrug'),
  'bouwwerk-evenwichtsbalk': bouw('Bekijk de evenwichtsbalk in 3D', 'evenwichtsbalk'),
  'bouwwerk-hangladder': bouw('Bekijk de hangladder in 3D', 'hangladder'),
  'bouwwerk-klimnet': bouw('Bekijk het klimnet in 3D', 'klimnet'),
  'bouwwerk-kruipgang': bouw('Bekijk de kruipgang in 3D', 'kruipgang'),
  'bouwwerk-balkenhindernis': bouw('Bekijk de balken in 3D', 'balkenhindernis'),
  'bouwwerk-muurtje': bouw('Bekijk het muurtje in 3D', 'muurtje'),
  'bouwwerk-wokkel': bouw('Bekijk de wokkel in 3D', 'wokkel'),
  'bouwwerk-spinnenweb': bouw('Bekijk het spinnenweb in 3D', 'spinnenweb'),
};
