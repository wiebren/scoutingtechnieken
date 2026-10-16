// Every technique as a notation of the same route (netwerk.js). Pure JS: codeer() writes the route down, lees()
// reads it back from what a scout sees at each junction (the roads, not the answer), and uitleg() says in words
// what the notation means at one junction, for when someone took a wrong road. The drawings are in tekeningen.js.
//
// Conventions (NAV §2b, §2c, and the sources named there; where sources differ the choice is said in `sleutel`):
// kruispuntenroute and bolletje-pijltje as Scoutpedia (you always enter from below), stripkaart as Scoutpedia and the
// Neil Armstrong booklet (leftmost/rightmost roads, V for two, never two roads left, dotted = unpaved, long bar at the
// end), ogenroute, knopenroute and kralen as Scoutpedia (kralen: green straight on, red right, lilac left),
// tijdenroute as Scoutpedia (small hand north), RLL-LLL as KLJ (NAV §2c).

import { deNaam, metLidwoord, rng, draai, draaiWoord, soortDraai, eenduidig, wind16, kruispuntNaam, bakenBij, BAKENS, SOORTEN, norm, hoekVerschil } from './netwerk.js';

const WIND_VOLUIT = { N: 'noord', O: 'oost', Z: 'zuid', W: 'west' };
const voluit16 = (s) => [...s].map((l) => WIND_VOLUIT[l]).join('');
const ACTIE = { links: 'linksaf', rechts: 'rechtsaf', rechtdoor: 'rechtdoor' };
/** The bead colours of the kralentocht (Scoutpedia), and back. Each colour is also a CSS class (route.css). */
const KRAAL_KLEUR = { links: 'lila', rechtdoor: 'groen', rechts: 'rood' };
const KRAAL_SOORT = Object.fromEntries(Object.entries(KRAAL_KLEUR).map(([soort, kleur]) => [kleur, soort]));

/** The index of the road that left / straight on / right means here, or -1. */
export function kiesSoort(wegen, soort) {
  const i = wegen.findIndex((w, j) => soortDraai(w.draai) === soort && eenduidig(wegen, j));
  return i;
}
/** The index of the road nearest to a turn (or to a compass direction with `absoluut`), if it is near enough. */
function dichtstbij(wegen, doel, marge, veld = 'draai') {
  let best = -1; let min = Infinity;
  wegen.forEach((w, i) => { const d = hoekVerschil(w[veld], doel); if (d < min) { min = d; best = i; } });
  return min <= marge ? best : -1;
}
const gekozenSoort = (stap) => soortDraai(stap.wegen[stap.gekozen].draai);
const eenPerStap = (route, maak) => {
  const items = route.stappen.map(maak);
  return { items, perStap: items.map((_, i) => i) };
};

export const WEG_TELT = 'Een weg telt mee als twee volwassenen met een rugzak er naast elkaar over kunnen lopen. Smalle paadjes tellen niet.';

// -- the kruispunt drawings share their data
function kruispuntItem(route, net, stap) {
  const b = bakenBij(net, stap.knoop);
  return {
    wegen: stap.wegen.map((w) => ({ draai: w.draai, soort: w.soort })),
    inSoort: net.wegen[stap.inWeg].soort,
    pijl: stap.gekozen,
    baken: b ? { soort: b.soort, draai: draai(stap.koers, b.peiling) } : null,
    noord: draai(stap.koers, 0),                   // where north is on the drawing, as a turn from "up"
  };
}
const leesKruispunt = (codes, stappen) => stappen.map((stap, i) => {
  const it = codes.items[i];
  if (it.wegen.length !== stap.wegen.length) return -1;
  return dichtstbij(stap.wegen, it.wegen[it.pijl].draai, 3);
});

// -- tijdenroute: a digital time; on a clock with the small hand to the north the big hand points the way.
// The angle between the hands is 5.5° per minute minus 30° per hour.
export const tijdHoek = (h, m) => norm(5.5 * m - 30 * (h % 12));
export function tijdVoor(peiling, r) {
  const opties = [];
  for (let h = 0; h < 12; h++) {
    const m = Math.round(norm(peiling + 30 * h) / 5.5);
    if (m <= 59 && hoekVerschil(tijdHoek(h, m), peiling) <= 3) opties.push({ h, m });
  }
  const { h, m } = opties[Math.floor(r() * opties.length)];
  const uur = r() < 0.5 ? h : h + 12;
  return { h: uur, m, tijd: `${String(uur).padStart(2, '0')}:${String(m).padStart(2, '0')}` };
}

const lidSoort = (soort) => (soort === 'verhard' ? 'de verharde weg' : `het ${SOORTEN[soort].naam}`);
const actieWoord = (d) => {
  const w = draaiWoord(d);
  return w === 'rechtdoor' ? 'rechtdoor' : `${w}af`;
};

/**
 * The techniques. `noorden`: the scout needs to know where north is (a compass in the HUD). `tellen`: counting is
 * the skill, so "waar ben ik" starts off.
 */
export const TECHNIEKEN = {
  kruispunten: {
    titel: 'Kruispuntenroute',
    codeer: (route, net) => eenPerStap(route, (stap) => kruispuntItem(route, net, stap)),
    lees: leesKruispunt,
    uitleg: (codes, i) => `Op tekening ${i + 1} wijst de pijl ${draaiWoord(codes.items[i].wegen[codes.items[i].pijl].draai)}. Je komt altijd van onderen binnen.`,
    sleutel: [
      'Elk kruispunt staat van bovenaf getekend, genummerd in de volgorde waarin je ze tegenkomt.',
      'Je komt altijd van onderen binnen. Draai het plaatje in gedachten zo, dat jouw weg onderaan zit.',
      'De pijl wijst de weg die je neemt. Kaarttekens bij een kruispunt helpen je controleren.',
    ],
    legenda: ['lijnen', 'bakens'],
  },
  noordpijl: {
    titel: 'Kruispunten-noordpijlroute', noorden: true,
    codeer: (route, net) => eenPerStap(route, (stap) => kruispuntItem(route, net, stap)),
    lees: leesKruispunt,
    uitleg: (codes, i) => `Op tekening ${i + 1} wijst de dunne pijl ${draaiWoord(codes.items[i].wegen[codes.items[i].pijl].draai)}. De dikke pijl is het noorden: daarmee kun je met je kompas controleren of je goed staat.`,
    sleutel: [
      'Een kruispuntenroute met bij elk kruispunt een dikke noordpijl. De dunne pijl is de weg die je neemt.',
      'Je komt van onderen binnen. Met je kompas controleer je of het kruispunt goed ligt: wijst de dikke pijl echt naar het noorden?',
    ],
    legenda: ['lijnen', 'bakens'],
  },
  'bolletje-pijltje': {
    titel: 'Bolletje-pijltje',
    codeer: (route) => eenPerStap(route, (stap) => ({ draaien: stap.wegen.map((w) => w.draai), pijl: stap.gekozen })),
    lees: (codes, stappen) => stappen.map((stap, i) => {
      const it = codes.items[i];
      return it.draaien.length === stap.wegen.length ? dichtstbij(stap.wegen, it.draaien[it.pijl], 3) : -1;
    }),
    uitleg: (codes, i) => `Bij teken ${i + 1} wijst de pijl ${draaiWoord(codes.items[i].draaien[codes.items[i].pijl])}; de stompe streepjes zijn de wegen die je laat liggen.`,
    sleutel: [
      'Lees van links naar rechts: elk teken is een kruispunt.',
      'Het bolletje is het kruispunt. Je komt altijd van onderen.',
      'De pijl is de weg die je neemt. De stompe streepjes zijn de wegen die je laat liggen.',
      'Zo doen ze het in Nederland. In Vlaanderen is het bolletje vaak de plek waar je vandaan komt.',
    ],
  },
  windrichting: {
    titel: 'Bolletje-pijltje met windrichting', noorden: true, tellen: true,
    codeer: (route) => {
      const items = []; const perStap = [];
      const K = route.stappen.length;
      for (let s = 0; s < K;) {
        let t = s + 1;
        while (t < K && gekozenSoort(route.stappen[t]) === 'rechtdoor') t++;
        const streek = wind16(route.stappen[s].wegen[route.stappen[s].gekozen].peiling);
        items.push({ streek, peiling: (['N', 'NNO', 'NO', 'ONO', 'O', 'OZO', 'ZO', 'ZZO', 'Z', 'ZZW', 'ZW', 'WZW', 'W', 'WNW', 'NW', 'NNW'].indexOf(streek)) * 22.5,
          streepjes: t < K ? t - s : K - s - 1, laatste: t >= K, van: s });
        for (let j = s; j < t; j++) perStap.push(items.length - 1);
        s = t;
      }
      return { items, perStap };
    },
    lees: (codes, stappen) => {
      const keuzes = []; let s = 0;
      for (const it of codes.items) {
        if (s >= stappen.length) return [...keuzes, -1];
        keuzes.push(dichtstbij(stappen[s].wegen, it.peiling, 15, 'peiling'));
        const rechtdoor = it.laatste ? it.streepjes : it.streepjes - 1;
        for (let j = 1; j <= rechtdoor; j++) keuzes.push(stappen[s + j] ? kiesSoort(stappen[s + j].wegen, 'rechtdoor') : -1);
        s += rechtdoor + 1;
      }
      return keuzes;
    },
    uitleg: (codes, i) => {
      const g = codes.perStap[i]; const it = codes.items[g];
      if (it.van === i) return `Hier begint aanwijzing ${g + 1}: de bolletjes zeggen ${it.streek} (${voluit16(it.streek)}). Neem de weg die die kant op loopt.`;
      return `Je volgt de weg van aanwijzing ${g + 1} (${it.streek}): hier ga je rechtdoor. Dit is streepje ${i - it.van} van ${it.streepjes}.`;
    },
    sleutel: [
      'Een bolletje met een stokje is een windrichting: stokje omhoog is noord, naar rechts oost, omlaag zuid, naar links west.',
      'Twee of drie bolletjes samen maken een tussenrichting; lees ze in de richting van het pijltje (noord + oost = NO, noord + noord + oost = NNO).',
      'Op het kruispunt neem je de weg die in die windrichting loopt. Je kompas vertelt waar die is.',
      'De streepjes erna tellen de kruispunten: tot daar volg je de weg rechtdoor, en op het kruispunt van het laatste streepje geldt de volgende aanwijzing.',
      'Na de laatste aanwijzing tellen de streepjes de kruispunten tot de post (de vlag).',
    ],
  },
  stripkaart: {
    titel: 'Stripkaart', tellen: true,
    codeer: (route) => eenPerStap(route, (stap) => ({
      links: stap.wegen.slice(0, stap.gekozen).map((w) => ({ onverhard: SOORTEN[w.soort].onverhard })),
      rechts: stap.wegen.slice(stap.gekozen + 1).map((w) => ({ onverhard: SOORTEN[w.soort].onverhard })),
    })),
    lees: (codes, stappen) => stappen.map((stap, i) => {
      const it = codes.items[i];
      return it.links.length + it.rechts.length + 1 === stap.wegen.length ? it.links.length : -1;
    }),
    uitleg: (codes, i) => {
      const { links, rechts } = codes.items[i];
      const tel = (n, kant) => (n ? `${n === 1 ? 'één streepje' : `${n} streepjes`} ${kant}` : null);
      const delen = [tel(links.length, 'links'), tel(rechts.length, 'rechts')].filter(Boolean).join(' en ');
      return `Bij kruispunt ${i + 1} ${links.length + rechts.length === 1 ? 'staat' : 'staan'} ${delen}: je laat ${links.length ? `de ${links.length === 1 ? 'meest linkse weg' : `${links.length} meest linkse wegen`}` : ''}${links.length && rechts.length ? ' en ' : ''}${rechts.length ? `de ${rechts.length === 1 ? 'meest rechtse weg' : `${rechts.length} meest rechtse wegen`}` : ''} liggen en neemt de weg die overblijft.`;
    },
    sleutel: [
      'Lees van onder (het bolletje) naar boven. De lange lijn is jouw route, als een touwtje rechtgetrokken.',
      'Elk streepje is een weg die je laat liggen, links of rechts van je. Twee streepjes aan één kant (een V) zijn de twee meest linkse (of rechtse) wegen.',
      'Je neemt de weg die overblijft. Blijven er twee over, dan ben je verkeerd gelopen: loop terug naar waar het nog klopte.',
      'Een gestippeld streepje is een onverharde weg. De afstand tussen de streepjes zegt niets over de echte afstand.',
      'De lange dwarsstreep bovenaan is het einde.',
    ],
  },
  ogen: {
    titel: 'Ogenroute',
    codeer: (route) => eenPerStap(route, (stap) => ({ kijk: gekozenSoort(stap) })),
    lees: (codes, stappen) => stappen.map((stap, i) => kiesSoort(stap.wegen, codes.items[i].kijk)),
    uitleg: (codes, i, _stap, variant) => {
      const k = codes.items[i].kijk;
      if (variant === 'smiley') return k === 'rechtdoor' ? `Gezichtje ${i + 1} heeft beide ogen open: rechtdoor.` : `Bij gezichtje ${i + 1} is het oog aan de ${k === 'links' ? 'linker' : 'rechter'}kant dicht: ${ACTIE[k]}.`;
      return `De ogen van gezichtje ${i + 1} kijken ${k === 'rechtdoor' ? 'omhoog: rechtdoor' : `naar ${k}: ${ACTIE[k]}`}.`;
    },
    sleutel: [
      'Elk gezichtje is een kruispunt. Lees van links naar rechts en van boven naar beneden.',
      'Kijken de ogen omhoog, dan ga je rechtdoor. Kijken ze naar links, dan ga je linksaf; naar rechts is rechtsaf.',
    ],
    sleutelSmiley: [
      'Elk gezichtje is een kruispunt. Lees van links naar rechts en van boven naar beneden.',
      'Beide ogen open: rechtdoor. Het oog aan de linkerkant van het plaatje dicht (zwart): linksaf. Rechts dicht: rechtsaf.',
    ],
  },
  kralen: {
    titel: 'Kralentocht', tellen: true,
    codeer: (route) => eenPerStap(route, (stap) => ({ kleur: KRAAL_KLEUR[gekozenSoort(stap)] })),
    lees: (codes, stappen) => stappen.map((stap, i) => kiesSoort(stap.wegen, KRAAL_SOORT[codes.items[i].kleur])),
    uitleg: (codes, i) => {
      const k = codes.items[i].kleur;
      return `Kraal ${i + 1} is ${k}: ${ACTIE[KRAAL_SOORT[k]]}.`;
    },
    sleutel: [
      'Eén kraal per kruispunt. Je begint bij de lus.',
      'Lila is linksaf, groen is rechtdoor, rood is rechtsaf. Zo staat het op Scoutpedia.',
      'De kleuren spreekt de leiding af en ze kunnen per groep verschillen. Lees altijd de sleutel die je meekrijgt.',
    ],
  },
  knopen: {
    titel: 'Knopenroute', tellen: true,
    codeer: (route) => eenPerStap(route, (stap) => ({ knoop: { links: 'paalsteek', rechtdoor: 'halve steek', rechts: 'achtknoop' }[gekozenSoort(stap)] })),
    lees: (codes, stappen) => stappen.map((stap, i) => kiesSoort(stap.wegen, { paalsteek: 'links', 'halve steek': 'rechtdoor', achtknoop: 'rechts' }[codes.items[i].knoop])),
    uitleg: (codes, i) => {
      const k = codes.items[i].knoop;
      return `Knoop ${i + 1} is een ${k}: ${{ paalsteek: 'linksaf', 'halve steek': 'rechtdoor', achtknoop: 'rechtsaf' }[k]}.`;
    },
    sleutel: [
      'Eén knoop per kruispunt, van boven (de lus) naar beneden.',
      'Paalsteek is linksaf, halve steek is rechtdoor, achtknoop is rechtsaf. Zo staat het op Scoutpedia.',
      'Andere groepen tellen knoopjes (1 = rechtdoor, 2 = rechtsaf, 3 = linksaf). Vraag altijd welke afspraak geldt.',
    ],
  },
  tijden: {
    titel: 'Tijdenroute', noorden: true,
    codeer: (route) => {
      const r = rng(route.seed * 31 + route.stappen.length);
      return eenPerStap(route, (stap) => tijdVoor(stap.wegen[stap.gekozen].peiling, r));
    },
    lees: (codes, stappen) => stappen.map((stap, i) => dichtstbij(stap.wegen, tijdHoek(codes.items[i].h, codes.items[i].m), 10, 'peiling')),
    uitleg: (codes, i) => {
      const it = codes.items[i];
      return `Tijd ${i + 1} is ${it.tijd}. Met de kleine wijzer op het noorden wijst de grote wijzer naar ongeveer ${Math.round(tijdHoek(it.h, it.m))}°: neem de weg die die kant op gaat.`;
    },
    sleutel: [
      'Elke tijd hoort bij een kruispunt.',
      'Zet de tijd op een wijzerklok (of denk hem je in). Houd de klok zo dat de kleine wijzer naar het noorden wijst.',
      'De grote wijzer wijst dan de weg die je neemt. 03:00 is west, 06:00 zuid, 09:00 oost.',
      'Sommige groepen zetten de kleine wijzer op de weg waar je vandaan komt. Hier geldt: kleine wijzer op het noorden (Scoutpedia).',
    ],
  },
  rll: {
    titel: 'RLL-LLL-tocht',
    codeer: (route) => eenPerStap(route, (stap) => ({
      laten: stap.wegen.map((w, j) => (j === stap.gekozen ? null : { naam: w.naam, kant: j < stap.gekozen ? 'LLL' : 'RLL' })).filter(Boolean),
    })),
    lees: (codes, stappen) => stappen.map((stap, i) => {
      // the road to take is the one for which the other roads, each with its side, are exactly the list
      const sleutelVan = (lijst) => lijst.map((l) => `${l.naam}|${l.kant}`).sort().join(',');
      const doel = sleutelVan(codes.items[i].laten);
      const passend = stap.wegen.map((_, j) => j).filter((j) => sleutelVan(stap.wegen
        .map((w, x) => (x === j ? null : { naam: w.naam, kant: x < j ? 'LLL' : 'RLL' })).filter(Boolean)) === doel);
      return passend.length === 1 ? passend[0] : -1;
    }),
    uitleg: (codes, i) => {
      const laten = codes.items[i].laten.map((l) => `${l.naam} ${l.kant === 'LLL' ? 'links' : 'rechts'}`).join(', ');
      return `Regel ${i + 1}: je laat ${laten} liggen. Neem de weg die overblijft.`;
    },
    sleutel: [
      'Elke regel is een kruispunt. Er staan de wegen op die je níet neemt, met hun naam.',
      'LLL is links laten liggen: die weg ligt links van je en daar ga je niet in. RLL is rechts laten liggen.',
      'Je neemt de weg die overblijft. Lees de naambordjes. Heeft een straat links en rechts dezelfde naam, dan zegt LLL of RLL welke kant je laat liggen.',
    ],
  },
  beschrijving: {
    titel: 'Beschrijvende route',
    codeer: (route, net) => {
      const r = rng(route.seed * 13 + 5);
      const startWeg = net.wegen[route.start.weg];
      const eerste = route.stappen[0];
      const intro = `Je begint op ${deNaam(startWeg.naam)}, ${lidSoort(startWeg.soort)}. Loop door tot ${metLidwoord(kruispuntNaam(eerste))}.`;
      const res = eenPerStap(route, (stap, i) => {
        const w = stap.wegen[stap.gekozen];
        const b = bakenBij(net, stap.knoop);
        const bij = b ? ` bij ${BAKENS[b.soort].lidwoord} ${BAKENS[b.soort].naam}` : '';
        const type = kruispuntNaam(stap);
        const zelfdeStraat = net.wegen[stap.inWeg].straat === net.wegen[w.weg].straat;
        const actie = actieWoord(w.draai);
        let weg;
        if (soortDraai(w.draai) === 'rechtdoor') weg = zelfdeStraat ? `, je blijft op ${deNaam(w.naam)}` : `, ${deNaam(w.naam)} op`;
        else weg = r() < 0.5 ? `, ${deNaam(w.naam)} in` : `, ${lidSoort(w.soort)} in`;
        const zin = i === 0 || r() < 0.5
          ? `${i === 0 ? `Bij ${metLidwoord(type)}` : r() < 0.5 ? `Bij ${metLidwoord(type, 'volgende')}` : `Op ${metLidwoord(type)}`}${bij} ga je ${actie}${weg}.`
          : `Je komt bij een ${type}${bij}. Ga ${actie}${weg}.`;
        return { zin, soort: soortDraai(w.draai) };
      });
      res.intro = intro;
      res.slot = 'Na een stukje zie je de post. Je bent er!';
      return res;
    },
    lees: (codes, stappen) => stappen.map((stap, i) => kiesSoort(stap.wegen, codes.items[i].soort)),
    uitleg: (codes, i) => `Zin ${i + 1}: "${codes.items[i].zin}"`,
    sleutel: [
      'Lees de tekst zin voor zin. Bij elk kruispunt staat wat je doet.',
      'Controleer onderweg: klopt de soort kruising, zie je het huis of de boom uit de tekst, staat de naam op het bordje?',
    ],
  },
};

/** The techniques in the order of the chips. */
export const VOLGORDE = ['kruispunten', 'noordpijl', 'bolletje-pijltje', 'windrichting', 'stripkaart', 'ogen', 'kralen', 'knopen', 'tijden', 'rll', 'beschrijving'];

/** Write a route down in a technique. */
export const codeer = (techniek, route, net) => TECHNIEKEN[techniek].codeer(route, net);
