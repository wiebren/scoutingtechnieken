// Kraak de code: a short sentence in the code of a blad, to turn back into gewone tekst by hand. The key is shown
// where the code needs one (a codewoord, a jaartal, the rows), with a hint, and a table to look things up in behind a
// chip. The answer is checked letter by letter: capitals, spaces and accents do not count, and the letters that are
// off are marked in the scout's own answer. Zet in code is the other way round, for the codes where there is one
// right way to write it. The last chip is the converter of the blad (the Codeermachine, the codeschijf or the
// roostercode), to look and try with. What goes in which code, and the checking, is in ./lib/kraak.js; the codes are
// those of the Codeermachine (./lib/geheim.js).
import { h } from '../../dom.js';
import { keuze, schakel } from '../knoppen.js';
import { ABC, CODES, letters } from './lib/geheim.js';
import { OPGAVEN, STUKKEN, antwoordLetters, nieuweOpgave, vergelijk, woordwaarde } from './lib/kraak.js';
import codeermachine, { roosterTabel, teken } from './codeermachine.js';
import codeschijf from './codeschijf.js';
import roostercode, { maak } from './roostercode.js';
import '../vorm.css';
import './roostercode.css';
import './kraak.css';

const meervoud = (n, een, meer) => `${n} ${n === 1 ? een : meer}`;
const sr = (t) => h('span.doe-sr', t);

/** The table behind the hulp chip: a table of the Codeermachine (without a letter lit), pairs, or a tekenalfabet. */
function hulpInhoud(hulp, s) {
  if (hulp.rooster) {
    const t = roosterTabel(hulp.rooster(s));
    t.querySelectorAll('.nu').forEach((c) => c.classList.remove('nu'));
    return t;
  }
  if (hulp.lijst) return h('div.kr-lijst', hulp.lijst().map(([l, c]) => h('span', h('b', l), h('span', c))));
  const maat = hulp.tekens === 'semafoor' ? 52 : 34;
  return h('div.cm-sleutel', [...ABC].map((l) => h('span', { html: teken(hulp.tekens, l, maat) }, h('b', l))));
}

/** The answer as it was typed, with the pieces that are off marked. `stuk(ch)`: whether a character is a piece. */
function gemarkeerd(tekst, { fout, mist }, stuk) {
  const uit = [];
  const gat = (k) => mist.has(k) && uit.push(h('mark.kr-mist', '_'.repeat(mist.get(k))), sr(' (hier mist iets) '));
  let k = 0;
  for (const ch of tekst) {
    if (!stuk(ch)) { uit.push(ch); continue; }
    gat(k);
    uit.push(fout.has(k) ? [h('mark.kr-fout', ch), sr(' (fout) ')] : ch);
    k++;
  }
  gat(k);
  return uit;
}
/** The same for pieces of several characters (sms, morse …): the pieces with a space between. */
function gemarkeerdeStukken(stukken, { fout, mist }) {
  const gat = (k) => mist.has(k) && [h('mark.kr-mist', Array(mist.get(k)).fill('_').join(' ')), sr(' (hier mist iets) '), ' '];
  return [...stukken.map((s, k) => [gat(k), fout.has(k) ? [h('mark.kr-fout', s), sr(' (fout) ')] : s, ' ']), gat(stukken.length)];
}

export default function kraak({ code: id = 'rot13', hulpmiddel = 'codeermachine' } = {}) {
  if (!OPGAVEN[id]) id = 'rot13';
  const o = OPGAVEN[id];
  const c = CODES[id];

  /** The hulp chip and its table, built when it is first opened. */
  function hulpBlok(s) {
    if (!o.hulp) return [];
    const plek = h('div.kr-hulp', { hidden: true });
    const chip = schakel(o.hulp.naam, false, (aan) => {
      if (aan && !plek.firstChild) plek.append(hulpInhoud(o.hulp, s));
      plek.hidden = !aan;
    });
    return [h('div.chips', chip), plek];
  }

  /** The code: as text, as tekens to read, or as a rooster with its sjabloon next to it. */
  function toonCode(opgave) {
    if (opgave.rooster) {
      const { rooster, gaten } = opgave.rooster;
      const raster = h('div.rc-rooster', { role: 'img', 'aria-label': `Een rooster van letters, rij voor rij: ${rooster.join(' ')}` }, rooster.map((l) => h('span', l)));
      const sjabloon = h('div.rc-rooster.erop', { role: 'img', 'aria-label': `Het sjabloon, met gaten in de vakjes ${[...gaten].map((g) => g + 1).join(', ')}, rij voor rij geteld` },
        rooster.map((_, i) => h('span', { class: gaten.has(i) ? 'gat' : null })));
      return h('div.kr-rooster-paar', h('figure', raster, h('figcaption', 'Het rooster')), h('figure', sjabloon, h('figcaption', 'Het sjabloon')));
    }
    if (o.tekens) {
      const lijst = c.tekens(opgave.zin);
      return h('div.cm-tekenveld.kr-tekens', { role: 'img', 'aria-label': `Een boodschap van ${meervoud(lijst.filter(Boolean).length, 'teken', 'tekens')} in ${c.naam.toLowerCase()}` },
        lijst.map((l) => (l ? h('span.cm-tekentje', { html: teken(c.teken, l, c.teken === 'semafoor' ? 64 : 40) }) : h('span.cm-spatie'))));
    }
    return h('p.kr-boodschap', o.som ? opgave.zin.toUpperCase() : opgave.geheim);
  }

  /** A new message, with the square for the roostercode. */
  function nieuw(vorige, kort) {
    const opgave = nieuweOpgave(id, vorige, kort);
    if (id === 'rooster') opgave.rooster = maak(opgave.zin);
    return opgave;
  }

  /** What both panels share: the key line, the hint, the codeschijf and the hulp, and the answer with its buttons. */
  function paneel({ vraag, kort, label, toonOpgave, hintVan, kijkNa, oplossing, nieuwKnop, veld = 'textarea' }) {
    let opgave = null;
    const codePlek = h('div');
    const sleutel = h('p.kr-sleutel');
    const hint = h('p.doe-stil');
    const hulpPlek = h('div.kr-hulpplek');
    const schijf = hulpmiddel === 'codeschijf' ? codeschijf({ alleenSchijf: true }) : null;
    const antwoord = h(veld === 'getal' ? 'input.doe-veld' : 'textarea.doe-veld', {
      type: veld === 'getal' ? 'text' : null, inputmode: veld === 'getal' ? 'numeric' : null, rows: veld === 'getal' ? null : 2,
      maxlength: 600, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': label, placeholder: label,
      onkeydown: (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); nakijken(); } },
    });
    const melding = h('p.doe-melding', { 'aria-live': 'polite' });
    const nagekeken = h('p.kr-nagekeken', { hidden: true });

    function zet() {
      opgave = nieuw(opgave, kort);
      codePlek.replaceChildren(toonOpgave(opgave));
      sleutel.textContent = o.sleutel?.(opgave.s) ?? '';
      sleutel.hidden = !o.sleutel;
      hint.textContent = hintVan(opgave);
      hint.hidden = !hint.textContent;
      hulpPlek.replaceChildren(...hulpBlok(opgave.s));
      antwoord.value = '';
      melding.textContent = '';
      melding.classList.remove('fout');
      nagekeken.hidden = true;
    }
    function nakijken() {
      const { tekst, goed, markering } = kijkNa(opgave, antwoord.value);
      melding.textContent = tekst;
      melding.classList.toggle('fout', goed === false);
      nagekeken.replaceChildren(...(markering ?? []).flat(Infinity).filter((x) => x != null && x !== false));
      nagekeken.hidden = !markering;
    }

    zet();
    return h('div.kr-paneel',
      h('p', vraag), codePlek, sleutel, hint, schijf, hulpPlek,
      h('div.kr-antwoord', antwoord, h('button.knop', { type: 'button', onclick: () => nakijken() }, 'Kijk na'),
        h('button.knop', { type: 'button', onclick: () => { melding.classList.remove('fout'); nagekeken.hidden = true; melding.textContent = oplossing(opgave); } }, 'Laat zien')),
      melding, nagekeken,
      h('div.knop-rij', h('button.knop.klein', { type: 'button', onclick: () => { zet(); antwoord.focus({ preventScroll: true }); } }, nieuwKnop)));
  }

  // -- Kraak de code, or: reken de woordwaarde uit
  const kraakPaneel = () => paneel({
    vraag: o.som ? 'Wat is de woordwaarde van dit woord?' : 'Wat staat hier? Typ het in gewone letters.',
    label: o.som ? 'De woordwaarde' : 'Wat staat er?',
    veld: o.som ? 'getal' : 'textarea',
    nieuwKnop: o.som ? 'Nieuw woord' : 'Nieuwe boodschap',
    toonOpgave: toonCode,
    hintVan: (opgave) => o.hint(opgave.s, opgave.geheim),
    oplossing: (opgave) => (o.som ? `${opgave.geheim}.` : `Er staat: ${opgave.zin}.`),
    kijkNa(opgave, invoer) {
      if (o.som) {
        if (!invoer.trim()) return { tekst: 'Typ eerst een getal.' };
        const getal = Number(invoer.replace(/\D/g, ''));
        const juist = woordwaarde(opgave.zin);
        return getal === juist ? { tekst: `Goed! ${opgave.geheim}.`, goed: true }
          : { tekst: `Nog niet: ${getal} is te ${getal > juist ? 'hoog' : 'laag'}. Tel elke letter nog eens na.`, goed: false };
      }
      const b = antwoordLetters(id, opgave.zin);
      const a = antwoordLetters(id, invoer, b.length);
      if (!a.length) return { tekst: 'Typ eerst wat er volgens jou staat.' };
      const v = vergelijk(a, b);
      if (!v.aantal) return { tekst: `Goed! Er staat: ${opgave.zin}.`, goed: true };
      if (v.aantal > b.length / 2) return { tekst: 'Dat lijkt er nog niet op. Lees de sleutel en de hint nog eens, en probeer het opnieuw.', goed: false };
      const mist = v.aantal - v.fout.size;
      const wat = [v.fout.size && `${meervoud(v.fout.size, 'letter klopt', 'letters kloppen')} nog niet`, mist && `er ${mist === 1 ? 'mist 1 letter' : `missen ${mist} letters`}`]
        .filter(Boolean).join(', en ');
      return { tekst: `Bijna: ${wat}. Hieronder zie je waar.`, goed: false,
        markering: [h('span.kr-kop', 'Jouw antwoord: '), gemarkeerd(invoer, v, (ch) => letters(ch).length > 0)] };
    },
  });

  // -- Zet in code: the other way round
  const zetPaneel = () => {
    const stukken = STUKKEN[o.terug];
    const perTeken = ['letters', 'tekens'].includes(o.terug);
    const tip = {
      sms: 'Zet een spatie tussen de letters.', paren: 'Zet een spatie tussen de letters.', bacon: 'Zet een spatie tussen de letters.', binair: 'Zet een spatie tussen de letters.',
      morse: 'Typ een punt (.) en een streepje (-), met een spatie tussen de letters en een / tussen de woorden.',
    }[o.terug];
    return paneel({
      vraag: `Zet deze zin in ${id === 'verschuiving' ? 'de verschuivingscode' : c.naam.toLowerCase().replace(/^sms/, 'SMS')}.`,
      label: 'Typ de code', kort: true, nieuwKnop: 'Nieuwe zin',
      toonOpgave: (opgave) => h('p.kr-boodschap.gewoon', opgave.zin),
      hintVan: () => [o.opvulling && 'Vul het laatste stuk op met X’en.', tip].filter(Boolean).join(' '),
      oplossing: (opgave) => `In code: ${opgave.geheim}`,
      kijkNa(opgave, invoer) {
        const a = stukken(invoer);
        const b = stukken(opgave.geheim);
        if (!a.length) return { tekst: 'Typ eerst de code.' };
        const v = vergelijk(a, b);
        if (!v.aantal) return { tekst: `Goed! In code is het: ${opgave.geheim}`, goed: true };
        if (v.aantal > b.length / 2) return { tekst: 'Dat lijkt er nog niet op. Kijk nog eens hoe de code werkt.', goed: false };
        return { tekst: `Bijna: ${meervoud(v.aantal, perTeken ? 'teken klopt' : 'stukje klopt', perTeken ? 'tekens kloppen' : 'stukjes kloppen')} nog niet. Hieronder zie je waar.`, goed: false,
          markering: [h('span.kr-kop', 'Jouw code: '), perTeken ? gemarkeerd(invoer, v, (ch) => stukken(ch).length > 0) : gemarkeerdeStukken(a, v)] };
      },
    });
  };

  // -- the converter of the blad
  const HULPMIDDEL = {
    codeermachine: ['Codeermachine', () => codeermachine({ code: id })],
    codeschijf: ['Codeschijf', () => codeschijf()],
    roostercode: ['Maak een rooster', () => roostercode()],
  };
  const [hulpTitel, maakHulp] = HULPMIDDEL[hulpmiddel] ?? HULPMIDDEL.codeermachine;

  const panelen = { kraak: kraakPaneel() };
  const plek = h('div.kr-plek', panelen.kraak);
  const modi = [['kraak', o.som ? 'Reken uit' : 'Kraak de code'], o.terug && ['zet', 'Zet in code'], ['hulp', hulpTitel]].filter(Boolean);

  return h('div.doe-kraak',
    h('div.chips', { role: 'group', 'aria-label': 'Wat wil je doen?' }, keuze(modi, 'kraak', (m) => {
      panelen[m] ??= m === 'zet' ? zetPaneel() : maakHulp();
      plek.replaceChildren(panelen[m]);
    })),
    plek);
}
