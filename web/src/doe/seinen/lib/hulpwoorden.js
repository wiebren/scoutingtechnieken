// The Dutch hulpwoorden for morse (NAV §4a): a lettergreep with an o in it is a streep, one without is a punt. The
// words of Indaba Zwolle (IND), and a second word from ezelsbrug.nl (EZB) where it fits the rule; each is checked
// against the morse of codes.js by scripts or by hand. Syllables are split with a streepje.

export const HULPWOORDEN = {
  A: ['An-no', 'Al-lo'], B: ['Bo-ter-ham-men', 'Bok-ken-wa-gen'], C: ['Co-ca-co-la'], D: ['Do-mi-nee', 'Dok-wer-ker'], E: ['Eik', 'Eend'],
  F: ['Fre-gat-op-zee'], G: ['Go-mor-ra', 'Groot-moe-der'], H: ['He-ren-hui-zen', 'Hek-ken-sprin-ger'], I: ['I-ris', 'Ie-mand'],
  J: ['Ja-oom-ot-to'], K: ['Ko-len-hok', 'Kom-mer-loos'], L: ['Li-mo-na-de'], M: ['Mo-tor'], N: ['No-ga', 'No-ten'],
  O: ['Oom-ot-to', 'Oor-logs-vloot'], P: ['Pas-toor-op-jacht'], Q: ['Quot-ho-mi-no'], R: ['Ra-bo-bank', 'Re-vol-ver'],
  S: ['Sein-te-ken', 'Su-per-man'], T: ['Toon', 'Ton'], U: ['U-ni-form'], V: ['Vas-ten-a-vond', 'Ver-ken-ners-groep'],
  W: ['Weer-op-komst'], X: ['oX-i-da-tor'], Y: ['Yo-ga-op-school'], Z: ['Zons-on-der-gang'],
};

/** The morse a word with streepjes between its syllables gives: o in the syllable is a streep. */
export const hulpCode = (woord) => woord.split(/[-\s·]+/).filter(Boolean).map((g) => (/o/i.test(g) ? '-' : '.')).join('');
