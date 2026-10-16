// Drawings for koken. See ../plaatjes.js and ./basis.js; the parts and the colours (vk-*) come from ./vuur.js and
// ./vuur.css.
import { r1, svg, tekst } from './basis.js';
import { blok, fout, goed, grond, kolen, kop, label, pan, pijl, vlam } from './vuur.js';

/** A pot with a handle hanging from a point. */
const hangpan = (x, y, w = 40, h = 26) =>
  `<path d="M${x} ${y}V${y + 14}" class="vk-metaal-lijn"/><path d="M${x - w / 2} ${y + 26}Q${x} ${y + 6} ${x + w / 2} ${y + 26}" class="vk-metaal-lijn"/>`
  + `<path d="M${x - w / 2} ${y + 24}H${x + w / 2}L${x + w / 2 - 3} ${y + 24 + h}H${x - w / 2 + 3}Z" class="vk-metaal"/>`;

/** Three ways to hang a pot over the fire: a tripod, a crane on a forked stick, a bridge on two forked poles. */
function panBovenVuur() {
  const voet = 196;
  let uit = grond(voet, 420);
  // tripod
  uit += blok(28, voet, 74, 48, 5) + blok(120, voet, 74, 48, 5) + blok(82, voet - 6, 74, 48, 4);
  uit += `<path d="M74 48V92" class="vk-metaal-lijn" stroke-dasharray="3 2"/>` + hangpan(74, 92) + vlam(74, voet - 2, 34, 30);
  uit += tekst(74, 222, 'driepoot', { maat: 13, klasse: 'vet' });
  // crane: a slanted stick over a forked one, the thick end held down by a stone
  uit += `<ellipse cx="160" cy="${voet - 6}" rx="16" ry="8" class="vol-licht"/>`;
  uit += blok(150, voet - 8, 262, 70, 5) + blok(200, voet, 196, 128, 5) + blok(196, 132, 186, 118, 3) + blok(196, 132, 206, 118, 3);
  uit += hangpan(256, 76) + vlam(256, voet - 2, 34, 30);
  uit += tekst(214, 222, 'zwerversvuur', { maat: 13, klasse: 'vet' });
  // bridge
  uit += blok(310, voet, 310, 78, 6) + blok(408, voet, 408, 78, 6) + blok(310, 82, 300, 68, 3) + blok(310, 82, 320, 68, 3) + blok(408, 82, 398, 68, 3) + blok(408, 82, 418, 68, 3);
  uit += blok(298, 76, 420, 76, 5) + hangpan(338, 76, 32, 22) + hangpan(380, 76, 32, 22) + vlam(359, voet - 2, 30, 50);
  uit += tekst(359, 222, 'kookbrug', { maat: 13, klasse: 'vet' });
  return svg(420, 230, 'Drie manieren om een pan boven het vuur te hangen: een driepoot, een schuine stok over een gevorkte steunstok (zwerversvuur), en een dwarsstok op twee gevorkte palen (kookbrug)', uit);
}

/** A foil packet in the glowing coals; turn it halfway. */
function foliepakket() {
  const voet = 168;
  let uit = grond(voet, 320);
  uit += `<path d="M60 ${voet}Q160 ${voet - 34} 260 ${voet}Z" class="vk-kool" opacity="0.35"/>` + kolen(160, voet - 6, 9, 190);
  uit += `<path d="M112 ${voet - 26}H208L214 ${voet - 10}H106Z" class="vk-metaal"/><path d="M116 ${voet - 26}H204M118 ${voet - 22}H202" class="vk-metaal-lijn" opacity="0.6"/>`;
  uit += kolen(160, voet - 26, 4, 80);
  uit += `<path d="M110 58a26 26 0 1 1 -4 36" class="vk-warm"/>` + pijl(120, 92, 106, 96, { warm: true });
  uit += tekst(156, 70, 'halverwege', { anker: 'start', maat: 10.5 }) + tekst(156, 84, 'omdraaien', { anker: 'start', maat: 10.5 });
  uit += label(214, 112, 'dubbel folie,', 200, 140) + tekst(214, 125, 'randen omgevouwen', { anker: 'start', maat: 10.5 });
  uit += tekst(160, 194, 'in de gloeiende kolen, niet in de vlammen', { maat: 10, klasse: 'stil' });
  return svg(330, 204, 'Een foliepakket in de gloeiende kolen: dubbel folie, de randen omgevouwen, halverwege omdraaien', uit);
}

/** Four camping stoves side by side: spirit, Esbit, gas and petrol. */
function branders() {
  const voet = 150;
  let uit = `<path d="M0 ${voet}H440" class="lijn dun stil"/>`;
  // spirit burner in a windshield
  uit += `<path d="M24 ${voet}V100H96V${voet}Z" class="vk-metaal"/><ellipse cx="60" cy="${voet - 12}" rx="16" ry="5" class="vk-metaal"/>`;
  uit += `<path d="M48 ${voet - 16}q6 -16 12 -22q6 6 12 22" class="vk-pijl" opacity="0.5"/>`;
  uit += tekst(60, 171, 'spiritus', { maat: 13, klasse: 'vet' }) + tekst(60, 188, '(Trangia)', { maat: 12, klasse: 'stil' });
  // Esbit: a folding stand with a tablet
  uit += `<path d="M126 ${voet}V112H196V${voet}" class="vk-metaal-lijn"/><path d="M126 112H196" class="vk-metaal-lijn" stroke-width="3"/>`;
  uit += `<rect x="150" y="${voet - 10}" width="22" height="8" rx="1" fill="#f4f4f0" stroke="#999"/>` + vlam(161, voet - 10, 24, 18);
  uit += tekst(161, 171, 'Esbit', { maat: 13, klasse: 'vet' }) + tekst(161, 188, '(tabletten)', { maat: 12, klasse: 'stil' });
  // gas: canister with a burner on top
  uit += `<path d="M232 ${voet}V108Q232 98 248 96H272Q288 98 288 108V${voet}Z" class="vk-metaal"/><rect x="254" y="82" width="12" height="14" class="vk-metaal"/>`;
  uit += `<path d="M236 82H284M244 82L238 72M276 82L282 72" class="vk-metaal-lijn"/>` + `<path d="M248 80q12 -18 24 0" fill="#5aa0e6" opacity="0.8"/>`;
  uit += tekst(260, 171, 'gas', { maat: 13, klasse: 'vet' }) + tekst(260, 188, '(gasbus)', { maat: 12, klasse: 'stil' });
  // petrol: bottle with a pump and a hose to the burner
  uit += `<rect x="318" y="98" width="30" height="${voet - 98}" rx="8" class="rood"/><rect x="326" y="88" width="14" height="10" class="vk-metaal"/>`;
  uit += `<path d="M340 92Q380 92 392 ${voet - 6}" class="vk-metaal-lijn"/><path d="M376 ${voet}L392 118L408 ${voet}M378 118H406" class="vk-metaal-lijn"/><path d="M382 116q10 -18 20 0" fill="#5aa0e6" opacity="0.8"/>`;
  uit += tekst(370, 171, 'benzine', { maat: 13, klasse: 'vet' }) + tekst(370, 188, '(met pomp)', { maat: 12, klasse: 'stil' });
  return svg(440, 196, 'Vier soorten branders: een spiritusbrander in een windscherm, een Esbitstandaard met een tablet, een gasbrander op een gasbus, en een benzinebrander met een fles en een pomp', uit);
}

/** The Dutch oven with the rule of thumb for a 12-inch pot: 16 briquettes on the lid, 8 under it. */
function dutchOven() {
  const voet = 190;
  let uit = grond(voet, 340);
  const briket = (x, y) => `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="6.5" ry="4.5" class="vk-kool"/>`;
  // the legs, the pot, the lid with a rim
  uit += `<path d="M110 ${voet}L118 160M230 ${voet}L222 160" class="vk-metaal-lijn" stroke-width="4"/>`;
  uit += `<path d="M96 100H244V148Q244 164 226 164H114Q96 164 96 148Z" fill="#3b3f42" stroke="#1c1f21" stroke-width="1.5"/>`;
  uit += `<path d="M90 100H250L246 90H94Z" fill="#3b3f42" stroke="#1c1f21" stroke-width="1.5"/><path d="M92 90V80M248 90V80" stroke="#3b3f42" stroke-width="4"/>`;
  uit += `<path d="M160 90q10 -14 20 0" fill="none" stroke="#3b3f42" stroke-width="4"/>`;
  for (let i = 0; i < 8; i++) uit += briket(108 + i * 18.5, 82 + (i % 2 ? -1 : 1));
  for (let i = 0; i < 8; i++) uit += briket(112 + i * 17.5, 72 + (i % 2 ? 1 : -1));
  for (let i = 0; i < 8; i++) if (i !== 3 && i !== 4) uit += briket(128 + i * 12, voet - 6);
  uit += briket(176, voet - 13) + briket(164, voet - 13);
  uit += label(262, 56, '16 op het deksel (⅔)', 236, 70) + label(262, 176, '8 eronder (⅓)', 210, 182);
  uit += tekst(170, 26, 'pan van 12 inch (30 cm): 24 briketten', { maat: 11, klasse: 'vet' });
  return svg(380, 214, 'Dutch oven: een gietijzeren pan met een deksel met een opstaande rand. Voor een pan van 30 cm 24 briketten: 16 op het deksel, 8 eronder', uit);
}

/** Washing up in three tubs, from left to right. */
function drieTeilen() {
  let uit = '';
  const teil = (x, t1, t2, warm) => {
    let s = `<path d="M${x - 46} 70H${x + 46}L${x + 36} 128H${x - 36}Z" class="vk-metaal"/>`;
    s += `<path d="M${x - 43} 78H${x + 43}L${x + 37} 116H${x - 37}Z" class="vk-water" opacity="0.8"/>`;
    if (warm) s += `<path d="M${x - 14} 62q-6 -10 0 -18q6 -8 0 -16M${x + 8} 62q-6 -10 0 -18q6 -8 0 -16" class="vk-rook"/>`;
    return s + tekst(x, 150, t1, { maat: 11.5, klasse: 'vet' }) + tekst(x, 165, t2, { maat: 10.5, klasse: 'stil' });
  };
  uit += teil(62, '1 wassen', 'heet sop', true) + teil(180, '2 spoelen', 'schoon, heet', true) + teil(298, '3 naspoelen', 'schoon water', false);
  for (const [x, y] of [[48, 76], [60, 72], [74, 77], [56, 80]]) uit += `<circle cx="${x}" cy="${y}" r="4" fill="#fff" opacity="0.8"/>`;
  uit += pijl(110, 98, 132, 98) + pijl(228, 98, 250, 98);
  return svg(360, 176, 'Afwassen in drie teilen naast elkaar: 1 wassen in heet sop, 2 spoelen in schoon heet water, 3 naspoelen in schoon water', uit);
}

/** Cook on glowing coals, not on high flames. */
function gloedVlammen() {
  const voet = 150;
  let uit = grond(voet, 340) + `<path d="M170 16V${voet}" class="lijn dun stil" stroke-dasharray="4 4"/>`;
  uit += vlam(64, voet - 2, 82, 46) + vlam(100, voet - 2, 70, 40) + pan(84, voet - 44, 50, 26);
  uit += `<path d="M62 ${voet - 44}H106" stroke="#1c1c1c" stroke-width="5" opacity="0.7"/>` + fout(150, 36);
  uit += kolen(256, voet - 4, 8, 96) + kop(212, voet - 12, 10) + kop(300, voet - 12, 10);
  uit += blok(204, voet - 26, 308, voet - 26, 6) + pan(256, voet - 29, 52, 28) + goed(320, 36);
  uit += tekst(84, 172, 'hoge vlammen: pan zwart,', { maat: 10.5 }) + tekst(84, 186, 'eten vanbuiten aangebrand', { maat: 10.5 });
  uit += tekst(256, 172, 'gloeiende kolen: rustig', { maat: 10.5 }) + tekst(256, 186, 'en overal even heet', { maat: 10.5 });
  return svg(340, 194, 'Koken op houtvuur: links een pan in hoge vlammen, die zwart wordt en het eten aan laat branden; rechts een pan boven een bed gloeiende kolen, rustig en overal even heet', uit);
}

/** Cooking in a pit: hot stones or coals, the food on them, and earth over it all. */
function kuilkoken() {
  const top = 70;
  let uit = `<rect x="0" y="${top}" width="400" height="120" class="vk-grond"/><path d="M0 ${top}H400" class="lijn dun stil"/>`;
  uit += `<path d="M80 ${top}L96 166H224L240 ${top}Z" class="vk-gat"/>`;
  for (let i = 0; i < 7; i++) uit += `<ellipse cx="${108 + i * 17}" cy="156" rx="9" ry="7" class="vol-licht"/><ellipse cx="${108 + i * 17}" cy="158" rx="4" ry="2.4" class="vk-kool"/>`;
  uit += `<rect x="116" y="126" width="88" height="20" rx="5" class="vk-metaal"/>`;
  uit += `<path d="M84 ${top + 8}H236L240 ${top}H80Z" class="vk-grond"/><path d="M70 ${top + 2}Q160 ${top - 34} 250 ${top + 2}Z" class="vk-grond"/><path d="M70 ${top + 2}Q160 ${top - 34} 250 ${top + 2}" class="lijn dun stil"/>`;
  uit += label(258, 46, 'aarde erover', 220, 60, 'start');
  uit += label(254, 118, 'eten in folie of bladeren', 204, 134, 'start');
  uit += label(254, 182, 'hete stenen of kolen', 222, 158, 'start');
  return svg(400, 196, 'Kuilkoken, in doorsnede: onderin hete stenen of kolen, daarop het eten in folie of bladeren, en alles afgedekt met aarde', uit);
}

/** Using a stove safely: outside, flat and steady, a windshield, far from the tent and the spare fuel. */
function branderVeilig() {
  const voet = 160;
  let uit = `<path d="M0 ${voet}H340" class="lijn dun stil"/>`;
  uit += `<path d="M14 ${voet}L60 ${voet - 70}L106 ${voet}Z" class="vol-licht"/><path d="M60 ${voet - 70}V${voet}" class="lijn dun stil"/>`;
  uit += vlam(60, voet - 18, 22, 14) + fout(60, voet - 28);
  uit += tekst(60, 182, 'nooit in de tent', { maat: 10.5, klasse: 'rood-tekst' });
  uit += pijl(116, 120, 150, 120) + pijl(150, 120, 116, 120);
  // the stove on flat ground in a windshield, a pot on it
  uit += `<path d="M180 ${voet}V${voet - 30}A40 8 0 0 0 260 ${voet - 30}V${voet}" class="vk-metaal-lijn" stroke-width="2"/>`;
  uit += `<rect x="204" y="${voet - 14}" width="32" height="14" rx="2" class="vk-metaal"/>` + vlam(220, voet - 14, 10, 18) + pan(220, voet - 24, 40, 20);
  uit += tekst(220, 182, 'vlak, stevig, windscherm', { maat: 10.5 });
  uit += `<rect x="304" y="${voet - 34}" width="20" height="34" rx="5" class="rood"/><rect x="309" y="${voet - 42}" width="10" height="8" class="vk-metaal"/>`;
  uit += tekst(314, 182, 'brandstof', { maat: 10.5 }) + tekst(314, 196, 'ver weg', { maat: 10.5 });
  uit += tekst(133, 108, 'afstand', { maat: 10.5, klasse: 'stil' });
  return svg(340, 204, 'Een brander veilig gebruiken: nooit in de tent, maar buiten op afstand, vlak en stevig in een windscherm, en de reservebrandstof ver weg', uit);
}

/** Finding a gas leak: a brush with washing-up liquid on the joints; where it bubbles, it leaks. */
function gaslek() {
  let uit = `<path d="M0 176H320" class="lijn dun stil"/>`;
  uit += `<path d="M40 176V96Q40 80 60 78H92Q112 80 112 96V176Z" class="vk-metaal"/><rect x="68" y="60" width="16" height="18" class="vk-metaal"/>`;
  uit += `<path d="M84 66H120Q150 66 160 96T220 140" class="vk-metaal-lijn" stroke-width="5" fill="none"/>`;
  uit += `<rect x="114" y="58" width="12" height="16" rx="2" class="vk-metaal"/>`;
  for (const [x, y, r] of [[112, 52, 4], [120, 46, 3], [128, 52, 3.5], [118, 38, 2.6]]) uit += `<circle cx="${x}" cy="${y}" r="${r}" fill="none" style="stroke: var(--blauw)" stroke-width="1.4"/>`;
  uit += `<path d="M150 40L132 56" class="vk-hout" stroke-width="5"/><path d="M132 56l-6 6" stroke="#e9cf73" stroke-width="7" stroke-linecap="round"/>`;
  uit += label(160, 30, 'kwastje met afwasmiddel', 146, 42, 'start');
  uit += label(180, 82, 'belletjes: hier lekt het', 128, 54, 'start');
  uit += tekst(236, 192, 'nooit met een vlam zoeken', { maat: 10.5, klasse: 'rood-tekst' });
  return svg(320, 200, 'Een gaslek zoeken: smeer met een kwastje afwasmiddel op de aansluitingen van de gasfles; waar het belletjes blaast, lekt het. Nooit met een vlam zoeken', uit);
}

/** A barbecue, direct and indirect: food above the coals, or beside them with the lid on. */
function bbqDirectIndirect() {
  const ketel = (cx) => `<path d="M${cx - 66} 90A66 50 0 0 0 ${cx + 66} 90Z" class="vk-metaal"/><path d="M${cx - 66} 90H${cx + 66}" class="vk-metaal-lijn"/>`;
  let uit = ketel(84) + kolen(84, 118, 6, 70);
  uit += `<rect x="62" y="80" width="44" height="9" rx="3" class="vk-hout-vol"/>` + pijl(84, 112, 84, 94, { warm: true });
  uit += ketel(256) + kolen(208, 118, 3, 34) + kolen(304, 118, 3, 34);
  uit += `<path d="M190 90A66 46 0 0 1 322 90" class="vk-metaal" opacity="0.85"/><rect x="234" y="80" width="44" height="9" rx="3" class="vk-hout-vol"/>`;
  uit += `<path d="M212 110Q220 60 252 62" class="vk-warm"/><path d="M300 110Q292 60 260 62" class="vk-warm"/>`;
  uit += tekst(84, 164, 'direct: boven de kolen', { maat: 10.5 });
  uit += tekst(256, 164, 'indirect: naast de kolen,', { maat: 10.5 }) + tekst(256, 178, 'met het deksel erop', { maat: 10.5 });
  return svg(340, 186, 'Barbecue in doorsnede: direct grillen met het eten boven de kolen, of indirect garen met de kolen aan de zijkanten, het eten in het midden en het deksel erop', uit);
}

export default {
  'pan-boven-vuur': panBovenVuur,
  foliepakket,
  branders,
  'dutch-oven': dutchOven,
  'drie-teilen': drieTeilen,
  'gloed-vlammen': gloedVlammen,
  kuilkoken,
  'brander-veilig': branderVeilig,
  gaslek,
  'bbq-direct-indirect': bbqDirectIndirect,
};
