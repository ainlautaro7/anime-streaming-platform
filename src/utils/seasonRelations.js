import { api } from '../services/api';

const SEASON_RELATION_LABELS = {
  Prequel: 'Temporada anterior',
  Sequel: 'Temporada siguiente',
  'Parent story': 'Historia principal',
  'Side story': 'Historia lateral',
  'Alternative version': 'Versión alternativa',
  Summary: 'Resumen',
};

const SEASON_RELATION_ORDER = {
  Prequel: 1,
  'Parent story': 2,
  Sequel: 3,
  'Side story': 4,
  'Alternative version': 5,
  Summary: 6,
};

const SEASON_RELATION_TYPES = new Set(Object.keys(SEASON_RELATION_LABELS));

export function getSeasonOptions(anime) {
  if (!anime) return [];

  const optionsById = new Map();
  const currentId = String(anime.id);

  optionsById.set(currentId, {
    id: anime.id,
    title: anime.title,
    relation: 'Current season',
    relationLabel: 'Temporada actual',
    isCurrent: true,
  });

  anime.relations?.forEach((relation) => {
    if (!SEASON_RELATION_TYPES.has(relation.relation)) return;

    relation.entry?.forEach((entry) => {
      if (entry.type !== 'anime' || !entry.mal_id) return;

      const entryId = String(entry.mal_id);
      if (optionsById.has(entryId)) return;

      optionsById.set(entryId, {
        id: entry.mal_id,
        title: entry.name,
        relation: relation.relation,
        relationLabel: SEASON_RELATION_LABELS[relation.relation],
        isCurrent: false,
      });
    });
  });

  return Array.from(optionsById.values()).sort((a, b) => {
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;

    const orderDiff = (SEASON_RELATION_ORDER[a.relation] ?? 99) - (SEASON_RELATION_ORDER[b.relation] ?? 99);
    if (orderDiff !== 0) return orderDiff;

    return a.title.localeCompare(b.title);
  });
}

export function formatSeasonOption(option) {
  if (!option) return '';
  if (option.isCurrent) return `${option.title} (actual)`;
  return `${option.relationLabel}: ${option.title}`;
}

export async function getAvailableSeasonOptions(anime) {
  const seasonOptions = getSeasonOptions(anime);
  if (seasonOptions.length <= 1) return seasonOptions;

  const filteredOptions = await Promise.all(
    seasonOptions.map(async (option) => {
      if (option.isCurrent) return option;

      const flvSlug = await api.getAnimeFLVSlug(option.title);
      if (!flvSlug) return null;

      const flvDetails = await api.getAnimeFLVDetails(flvSlug);
      if (!flvDetails?.episodes || flvDetails.episodes.length === 0) return null;

      return option;
    })
  );

  return filteredOptions.filter(Boolean);
}
