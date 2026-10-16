// The seinvlaggen of the Internationaal Seinboek (ICS): 26 lettervlaggen, 10 cijferwimpels, 3 vervangwimpels and
// the onderscheidingswimpel. Designs and meanings copied from the sister project vlet
// (reference/seinvlaggen/seinvlaggen.json and web/src/bpr/vlaggen.js), as notities/onderwerpen.md decided: there is
// no official Dutch text of the Seinboek online, so the meanings are vlet's own short translation of Pub. 102.
// Every design is drawn with the broeking (the side at the mast) on the left, in coordinates from 0 to 1.

/** The colours of the flags. Fixed, not from the theme: a red flag stays red in the dark. */
export const KLEUR = { rood: '#e31f27', blauw: '#005c8e', geel: '#ffe600', zwart: '#000000', wit: '#ffffff' };
const NAAM_KLEUR = { rood: 'rood', blauw: 'blauw', geel: 'geel', zwart: 'zwart', wit: 'wit' };

const RECHT = [[0, 0], [1, 0], [1, 1], [0, 1]];
const OMTREK = {
  vlag: RECHT,
  zwaluwstaart: [[0, 0], [1, 0], [0.75, 0.5], [1, 1], [0, 1]],
  wimpel: [[0, 0], [1, 0.3], [1, 0.7], [0, 1]],
  puntwimpel: [[0, 0], [1, 0.5], [0, 1]],
};
const VERHOUDING = { vlag: 1.25, zwaluwstaart: 1.25, wimpel: 2.5, puntwimpel: 1.6 };

const vlak = (k) => ({ t: 'vlak', k });
const staand = (kleuren) => ({ t: 'banden', staand: true, kleuren });
const liggend = (kleuren, delen) => ({ t: 'banden', staand: false, kleuren, delen });
const rh = (x, y, b, h, k) => ({ t: 'rh', x, y, b, h, k });
const veelhoek = (punten, k) => ({ t: 'veelhoek', punten, k });
const schijf = (cx, cy, r, k) => ({ t: 'schijf', cx, cy, r, k });
const balk = (van, naar, breedte, k) => ({ t: 'balk', van, naar, breedte, k });
const blokken = (kolommen, rijen, kleuren) => ({ t: 'blokken', kolommen, rijen, kleuren });
const schuin = (aantal, kleuren) => ({ t: 'schuin', aantal, kleuren });
const kruis = (k, x, b, y, h) => [rh(x, 0, b, 1, k), rh(0, y, 1, h, k)];

/** [letter, spelwoord, vorm, velden, wat je ziet, betekenis]. */
const LETTERS = [
  ['A', 'Alfa', 'zwaluwstaart', [staand(['wit', 'blauw'])], 'wit en blauw, met een zwaluwstaart', 'Ik heb een duiker onder water. Houd ruim afstand en vaar langzaam.'],
  ['B', 'Bravo', 'zwaluwstaart', [vlak('rood')], 'rood, met een zwaluwstaart', 'Ik laad, los of vervoer gevaarlijke stoffen.'],
  ['C', 'Charlie', 'vlag', [liggend(['blauw', 'wit', 'rood', 'wit', 'blauw'])], 'liggende banen blauw, wit, rood, wit, blauw', 'Ja: het antwoord is bevestigend.'],
  ['D', 'Delta', 'vlag', [liggend(['geel', 'blauw', 'geel'], [0.2, 0.6, 0.2])], 'geel, een brede blauwe baan, geel', 'Houd van mij vrij: ik manoeuvreer met moeite.'],
  ['E', 'Echo', 'vlag', [liggend(['blauw', 'rood'])], 'blauw boven, rood onder', 'Ik verander mijn koers naar stuurboord.'],
  ['F', 'Foxtrot', 'vlag', [vlak('wit'), veelhoek([[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]], 'rood')], 'wit met een rode ruit', 'Ik ben onmanoeuvreerbaar: kom met mij in verbinding.'],
  ['G', 'Golf', 'vlag', [staand(['geel', 'blauw', 'geel', 'blauw', 'geel', 'blauw'])], 'staande banen geel en blauw', 'Ik heb een loods nodig.'],
  ['H', 'Hotel', 'vlag', [staand(['wit', 'rood'])], 'wit en rood naast elkaar', 'Ik heb een loods aan boord.'],
  ['I', 'India', 'vlag', [vlak('geel'), schijf(0.5, 0.5, 0.25, 'zwart')], 'geel met een zwarte bol', 'Ik verander mijn koers naar bakboord.'],
  ['J', 'Juliett', 'vlag', [liggend(['blauw', 'wit', 'blauw'])], 'blauw, wit, blauw, liggend', 'Ik heb brand en gevaarlijke lading aan boord: houd ruim van mij vrij.'],
  ['K', 'Kilo', 'vlag', [staand(['geel', 'blauw'])], 'geel en blauw naast elkaar', 'Ik wil met u in verbinding komen.'],
  ['L', 'Lima', 'vlag', [blokken(2, 2, ['geel', 'zwart'])], 'vier blokken geel en zwart', 'Stop uw schip onmiddellijk.'],
  ['M', 'Mike', 'vlag', [vlak('blauw'), balk([0, 0], [1, 1], 0.175, 'wit'), balk([0, 1], [1, 0], 0.175, 'wit')], 'blauw met een wit schuin kruis', 'Mijn schip ligt stil en heeft geen vaart door het water.'],
  ['N', 'November', 'vlag', [blokken(4, 4, ['blauw', 'wit'])], 'blokjes blauw en wit, als een dambord', 'Nee: het antwoord is ontkennend.'],
  ['O', 'Oscar', 'vlag', [veelhoek([[0, 0], [1, 1], [0, 1]], 'geel'), veelhoek([[0, 0], [1, 0], [1, 1]], 'rood')], 'schuin gedeeld: rood rechtsboven, geel linksonder', 'Man over boord.'],
  ['P', 'Papa', 'vlag', [vlak('blauw'), rh(0.25, 0.25, 0.5, 0.5, 'wit')], 'blauw met een wit vlak in het midden', 'In de haven: iedereen aan boord, het schip gaat vertrekken.'],
  ['Q', 'Quebec', 'vlag', [vlak('geel')], 'helemaal geel', 'Mijn schip is gezond en ik vraag om vrij verkeer met de wal.'],
  ['R', 'Romeo', 'vlag', [vlak('rood'), ...kruis('geel', 0.44, 0.12, 0.425, 0.15)], 'rood met een geel kruis', 'Als losse vlag heeft R geen betekenis.'],
  ['S', 'Sierra', 'vlag', [vlak('wit'), rh(0.25, 0.25, 0.5, 0.5, 'blauw')], 'wit met een blauw vlak in het midden', 'Ik sla achteruit: mijn schroef draait achteruit.'],
  ['T', 'Tango', 'vlag', [staand(['rood', 'wit', 'blauw'])], 'rood, wit, blauw naast elkaar', 'Houd van mij vrij: ik vis met een spannet.'],
  ['U', 'Uniform', 'vlag', [blokken(2, 2, ['rood', 'wit'])], 'vier blokken rood en wit', 'U loopt gevaar: u vaart op gevaar af.'],
  ['V', 'Victor', 'vlag', [vlak('wit'), balk([0, 0], [1, 1], 0.175, 'rood'), balk([0, 1], [1, 0], 0.175, 'rood')], 'wit met een rood schuin kruis', 'Ik heb hulp nodig.'],
  ['W', 'Whiskey', 'vlag', [vlak('blauw'), rh(0.2, 0.2, 0.6, 0.6, 'wit'), rh(0.3, 0.3, 0.4, 0.4, 'rood')], 'blauw, wit en een rood vlak in het midden', 'Ik heb medische hulp nodig.'],
  ['X', 'X-ray', 'vlag', [vlak('wit'), ...kruis('blauw', 0.44, 0.12, 0.425, 0.15)], 'wit met een blauw kruis', 'Stop met wat u van plan bent en let op mijn seinen.'],
  ['Y', 'Yankee', 'vlag', [schuin(10, ['geel', 'rood'])], 'schuine banen geel en rood', 'Mijn anker krabt: het houdt niet.'],
  ['Z', 'Zulu', 'vlag', [veelhoek([[0, 0], [1, 0], [0.5, 0.5]], 'geel'), veelhoek([[0, 0], [0.5, 0.5], [0, 1]], 'zwart'),
    veelhoek([[0, 1], [0.5, 0.5], [1, 1]], 'rood'), veelhoek([[1, 0], [1, 1], [0.5, 0.5]], 'blauw')], 'vier driehoeken: geel, zwart, rood, blauw', 'Ik heb een sleepboot nodig.'],
];

export const LETTERVLAGGEN = LETTERS.map(([id, spelwoord, vorm, velden, ziet, betekenis]) => ({ id, spelwoord, ontwerp: { vorm, velden }, ziet, betekenis }));
export const LETTERVLAG = Object.fromEntries(LETTERVLAGGEN.map((v) => [v.id, v]));

export const CIJFERWIMPELS = [
  ['1', [vlak('wit'), schijf(0.24, 0.5, 0.27, 'rood')]],
  ['2', [vlak('blauw'), schijf(0.24, 0.5, 0.27, 'wit')]],
  ['3', [staand(['rood', 'wit', 'blauw'])]],
  ['4', [vlak('rood'), ...kruis('wit', 0.31, 0.08, 0.4, 0.2)]],
  ['5', [staand(['geel', 'blauw'])]],
  ['6', [liggend(['zwart', 'wit'])]],
  ['7', [liggend(['geel', 'rood'])]],
  ['8', [vlak('wit'), ...kruis('rood', 0.31, 0.08, 0.4, 0.2)]],
  ['9', [rh(0, 0, 0.5, 0.5, 'wit'), rh(0.5, 0, 0.5, 0.5, 'zwart'), rh(0, 0.5, 0.5, 0.5, 'rood'), rh(0.5, 0.5, 0.5, 0.5, 'geel')]],
  ['0', [staand(['geel', 'rood', 'geel'])]],
].map(([id, velden]) => ({ id, ontwerp: { vorm: 'wimpel', velden } }));

export const OVERIGE_WIMPELS = [
  { id: '1e', naam: 'Eerste vervangwimpel', ontwerp: { vorm: 'puntwimpel', velden: [vlak('blauw'), veelhoek([[0, 0.2], [0.6, 0.5], [0, 0.8]], 'geel')] } },
  { id: '2e', naam: 'Tweede vervangwimpel', ontwerp: { vorm: 'puntwimpel', velden: [staand(['blauw', 'wit'])] } },
  { id: '3e', naam: 'Derde vervangwimpel', ontwerp: { vorm: 'puntwimpel', velden: [vlak('wit'), rh(0, 1 / 3, 1, 1 / 3, 'zwart')] } },
  { id: 'ow', naam: 'Onderscheidingswimpel', ontwerp: { vorm: 'wimpel', velden: [staand(['rood', 'wit', 'rood', 'wit', 'rood'])] } },
];

// -- drawing

const r1 = (n) => Math.round(n * 10) / 10;
const pts = (lijst, w, h) => lijst.map(([x, y]) => `${r1(x * w)},${r1(y * h)}`).join(' ');
const fill = (k) => KLEUR[k] ?? k;

function veld(f, w, h) {
  switch (f.t) {
    case 'vlak': return `<rect x="-1" y="-1" width="${r1(w + 2)}" height="${r1(h + 2)}" fill="${fill(f.k)}"/>`;
    case 'banden': {
      const n = f.kleuren.length;
      const delen = f.delen ?? Array(n).fill(1 / n);
      let bij = 0;
      return f.kleuren.map((k, i) => {
        const van = bij; bij += delen[i]; const meer = i < n - 1 ? 0.6 : 1;
        return f.staand ? `<rect x="${r1(van * w - (i ? 0 : 1))}" y="-1" width="${r1(delen[i] * w + meer + (i ? 0 : 1))}" height="${r1(h + 2)}" fill="${fill(k)}"/>`
          : `<rect x="-1" y="${r1(van * h - (i ? 0 : 1))}" width="${r1(w + 2)}" height="${r1(delen[i] * h + meer + (i ? 0 : 1))}" fill="${fill(k)}"/>`;
      }).join('');
    }
    case 'rh': return `<rect x="${r1(f.x * w)}" y="${r1(f.y * h)}" width="${r1(f.b * w)}" height="${r1(f.h * h)}" fill="${fill(f.k)}"/>`;
    case 'veelhoek': return `<polygon points="${pts(f.punten, w, h)}" fill="${fill(f.k)}"/>`;
    case 'schijf': return `<circle cx="${r1(f.cx * w)}" cy="${r1(f.cy * h)}" r="${r1(f.r * h)}" fill="${fill(f.k)}"/>`;
    case 'balk': {
      const [ax, ay] = [f.van[0] * w, f.van[1] * h]; const [bx, by] = [f.naar[0] * w, f.naar[1] * h];
      const len = Math.hypot(bx - ax, by - ay); const [dx, dy] = [(bx - ax) / len, (by - ay) / len];
      const [nx, ny] = [(-dy * f.breedte * h) / 2, (dx * f.breedte * h) / 2]; const e = w + h;
      const p = [[ax - dx * e + nx, ay - dy * e + ny], [bx + dx * e + nx, by + dy * e + ny], [bx + dx * e - nx, by + dy * e - ny], [ax - dx * e - nx, ay - dy * e - ny]];
      return `<polygon points="${p.map(([x, y]) => `${r1(x)},${r1(y)}`).join(' ')}" fill="${fill(f.k)}"/>`;
    }
    case 'blokken': {
      let uit = '';
      for (let r = 0; r < f.rijen; r++) for (let c = 0; c < f.kolommen; c++) {
        uit += `<rect x="${r1((c * w) / f.kolommen)}" y="${r1((r * h) / f.rijen)}" width="${r1(w / f.kolommen + 0.6)}" height="${r1(h / f.rijen + 0.6)}" fill="${fill(f.kleuren[(r + c) % 2])}"/>`;
      }
      return uit;
    }
    case 'schuin': {
      let uit = '';
      for (let i = 0; i < f.aantal; i++) {
        const [c0, c1] = [(2 * i) / f.aantal, (2 * (i + 1)) / f.aantal + (i < f.aantal - 1 ? 0.004 : 0)];
        uit += `<polygon points="${pts([[c0 + 1, -1], [c1 + 1, -1], [c1 - 2, 2], [c0 - 2, 2]], w, h)}" fill="${fill(f.kleuren[i % 2])}"/>`;
      }
      return uit;
    }
    default: return '';
  }
}

let clips = 0;
/** The width of a design drawn h high. */
export const breedte = (o, h) => h * VERHOUDING[o.vorm];
/** One design h high at (x, y), cut to its outline, with a thin edge so that white shows on white. */
export function vlag(o, x, y, h) {
  const w = breedte(o, h);
  const id = `ics${++clips}`;
  const omtrek = pts(OMTREK[o.vorm], w, h);
  return `<g transform="translate(${r1(x)} ${r1(y)})"><clipPath id="${id}"><polygon points="${omtrek}"/></clipPath>`
    + `<g clip-path="url(#${id})">${o.velden.map((f) => veld(f, w, h)).join('')}</g>`
    + `<polygon points="${omtrek}" class="vl-rand"/></g>`;
}

/** The colours a design shows, in words (for a screen reader and the quiz). */
export const kleurenVan = (o) => [...new Set(o.velden.flatMap((f) => f.kleuren ?? [f.k]))].map((k) => NAAM_KLEUR[k]);
