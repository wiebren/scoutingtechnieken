// Veilig of brandgevaar? Everyday situations at home, one at a time: the scout says whether it is safe or a fire risk,
// and hears why. After brandweer.nl (Elektrische apparaten; Opladers, batterijen en accu's; Op kamers en
// studentenwoningen; Rookmelders; December brandveilige feestmaand; Doe de deur dicht), read 16-10-2026.
import { h } from '../../dom.js';
import { schud } from './hulp.js';
import './wn.css';
import './brandgevaar.css';

// gevaar: true when it is a fire risk; uitleg: said after either answer
const SITUATIES = [
  { wat: 'Je telefoon ligt ’s nachts aan de lader, naast je kussen in bed.', gevaar: true,
    uitleg: 'Laad overdag, als je wakker en thuis bent, op een vrije, harde plek die niet kan branden.' },
  { wat: 'Je laadt je telefoon overdag op je bureau, met de lader die erbij hoort.', gevaar: false,
    uitleg: 'Zo hoort het: overdag, op een harde plek, met de originele lader. Trek de stekker eruit als hij vol is.' },
  { wat: 'De frituurpan staat aan, en jij loopt even weg om iets te pakken.', gevaar: true,
    uitleg: 'Koken is een van de vaakste oorzaken van brand in huis. Blijf erbij als je kookt of frituurt.' },
  { wat: 'De frituurpan zit in een stekkerdoos.', gevaar: true,
    uitleg: 'Een apparaat dat veel stroom trekt, zoals een frituurpan of een elektrische kachel, gaat direct in het stopcontact.' },
  { wat: 'Er zit een stekkerdoos in een andere stekkerdoos.', gevaar: true,
    uitleg: 'Sluit stekkerdozen en verlengsnoeren niet op elkaar aan, en zet niet te veel apparaten op één stekkerdoos.' },
  { wat: 'De kachel zit aan een haspel die nog half is opgerold.', gevaar: true,
    uitleg: 'Een opgerolde haspel wordt heet. Rol hem helemaal uit, of zet de kachel direct in het stopcontact.' },
  { wat: 'Je wasgoed hangt te drogen over de kachel.', gevaar: true,
    uitleg: 'Hang wasgoed nooit vlak bij een kachel.' },
  { wat: 'Na het drogen maak je het pluizenfilter van de wasdroger schoon.', gevaar: false,
    uitleg: 'Goed. Van alle apparaten is de wasdroger het brandgevaarlijkst. Maak de filters steeds schoon.' },
  { wat: 'De tv staat de hele nacht op standby.', gevaar: true,
    uitleg: 'Op standby blijft een deel van het apparaat aan en warm. Zet apparaten helemaal uit.' },
  { wat: 'Je e-step is gevallen en de accu is een beetje vervormd. Je zet hem toch aan de lader.', gevaar: true,
    uitleg: 'Een accu die gevallen, kapot of vervormd is, leg je buiten neer en lever je zo snel mogelijk in.' },
  { wat: 'Een kaars staat in een stevige houder, ver van de kerstversiering.', gevaar: false,
    uitleg: 'Zo kan het: een stevige houder, niet bij iets dat kan branden, en niet bij een warmtebron. Geen echte kaarsen in kerststukjes.' },
  { wat: 'Je drukt op de testknop van de rookmelder, en hij piept niet.', gevaar: true,
    uitleg: 'Dan werkt hij niet. Test elke maand. Op elke verdieping moet een rookmelder hangen die het doet.' },
  { wat: 'Je slaapt met je slaapkamerdeur dicht.', gevaar: false,
    uitleg: 'Goed. Een dichte deur houdt de rook een tijd tegen, zodat je meer tijd hebt om eruit te komen. Zorg wel dat je de rookmelder hoort.' },
  { wat: 'Iemand gooit de asbak leeg in de prullenbak in de keuken.', gevaar: true,
    uitleg: 'Een peuk kan nog lang smeulen. Leeg een asbak nooit in een prullenbak binnen.' },
];

export default function brandgevaar() {
  let rij = []; let nu = null; let klaar = false;
  let goed = 0; let gedaan = 0;

  const vraag = h('p.bg-vraag');
  const keuzes = [[false, 'Veilig'], [true, 'Brandgevaar']].map(([g, naam]) =>
    h(`button.knop.bg-keuze${g ? '.bg-gevaar' : ''}`, { type: 'button', onclick: () => kies(g) }, naam));
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const score = h('p.wn-score');
  const verder = h('button.knop.hoofd.klein', { type: 'button', hidden: true, onclick: nieuw }, 'Volgende');
  const el = h('div.wn.doe-brandgevaar',
    h('p', 'Is dit veilig, of is het brandgevaar?'),
    vraag, h('div.bg-keuzes', { role: 'group', 'aria-label': 'Veilig of brandgevaar' }, keuzes), melding, h('div.knop-rij', verder), score);

  function kies(g) {
    if (klaar) return;
    klaar = true;
    const ok = g === nu.gevaar;
    gedaan += 1; if (ok) goed += 1;
    keuzes.forEach((b, i) => { b.disabled = true; b.classList.toggle('juist', (i === 1) === nu.gevaar); b.classList.toggle('mis', (i === 1) === g && !ok); });
    melding.classList.toggle('fout', !ok);
    melding.textContent = `${ok ? 'Goed.' : 'Niet goed.'} ${nu.gevaar ? 'Dit is brandgevaar.' : 'Dit is veilig.'} ${nu.uitleg}`;
    score.textContent = `${goed} van de ${gedaan} goed${gedaan === SITUATIES.length ? ', en je hebt ze allemaal gehad' : ''}.`;
    verder.hidden = false;
    verder.focus({ preventScroll: true });
  }

  function nieuw() {
    if (!rij.length) rij = schud(SITUATIES.filter((x) => x !== nu));
    nu = rij.pop(); klaar = false;
    vraag.textContent = nu.wat;
    keuzes.forEach((b) => { b.disabled = false; b.classList.remove('juist', 'mis'); });
    melding.textContent = ''; melding.classList.remove('fout'); verder.hidden = true;
  }

  nieuw();
  return el;
}
