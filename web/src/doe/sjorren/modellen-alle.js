// All the models: those of ./modellen.js, the touwbanen and the other bouwwerken. A later file may replace a model of
// an earlier one by its name.
import { MODELLEN as BASIS } from './modellen.js';
import touwbanen from './modellen-touwbanen.js';
import extra from './modellen-extra.js';

export const MODELLEN = { ...BASIS, ...touwbanen, ...extra };
