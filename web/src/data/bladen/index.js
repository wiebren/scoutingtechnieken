// All bladen, one file per category. A blad knows its category from the file it is in, and nothing of insignes
// or levels: the insignelaag (src/data/insignes.js) points at bladen, not the other way round.
import { CATEGORIEEN } from '../categorieen.js';
import geheimschrift from './geheimschrift.js';
import gereedschap from './gereedschap.js';
import kaart from './kaart.js';
import kamperen from './kamperen.js';
import koken from './koken.js';
import natuur from './natuur.js';
import seinen from './seinen.js';
import sjorren from './sjorren.js';
import sjorrenBouwwerken from './sjorren-bouwwerken.js';
import sjorrenTouwbanen from './sjorren-touwbanen.js';
import tocht from './tocht.js';
import touw from './touw.js';
import veiligheid from './veiligheid.js';
import vuur from './vuur.js';
import waarnemen from './waarnemen.js';
import weer from './weer.js';

const PER_CATEGORIE = { touw, sjorren: [...sjorren, ...sjorrenTouwbanen, ...sjorrenBouwwerken], kaart, tocht, waarnemen, seinen, geheimschrift, vuur, koken, gereedschap, kamperen, natuur, weer, veiligheid };

export const BLADEN = CATEGORIEEN.flatMap((c) => (PER_CATEGORIE[c.id] ?? []).map((b) => ({ ...b, categorie: c.id })));
export const BLAD = Object.fromEntries(BLADEN.map((b) => [b.id, b]));
