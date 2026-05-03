const WEEKDAY_MAP = {
  sunday: 0,
  sundays: 0,
  monday: 1,
  mondays: 1,
  tuesday: 2,
  tuesdays: 2,
  wednesday: 3,
  wednesdays: 3,
  thursday: 4,
  thursdays: 4,
  friday: 5,
  fridays: 5,
  saturday: 6,
  saturdays: 6,
};

const MONTH_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
});

const WEEKDAY_SHORT_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
});

const DAY_NUMBER_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
});

const MONTH_SHORT_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  month: 'short',
});

const TIME_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
});

function getBroadcastDayIndex(day) {
  if (!day) return null;
  const normalized = String(day).trim().toLowerCase();
  return WEEKDAY_MAP[normalized] ?? WEEKDAY_MAP[normalized.replace(/[^a-z]/g, '')] ?? null;
}

function parseTime(time) {
  if (!time) return { hours: 0, minutes: 0 };
  const match = String(time).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return { hours: 0, minutes: 0 };
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

function getNextBroadcastDate(day, time, fromDate = new Date()) {
  const targetDay = getBroadcastDayIndex(day);
  if (targetDay === null) return null;

  const { hours, minutes } = parseTime(time);
  const candidate = new Date(fromDate);
  const dayDiff = (targetDay - candidate.getDay() + 7) % 7;
  candidate.setDate(candidate.getDate() + dayDiff);
  candidate.setHours(hours, minutes, 0, 0);

  if (candidate <= fromDate) {
    candidate.setDate(candidate.getDate() + 7);
  }

  return candidate;
}

export function buildUpcomingEpisodeSchedule(anime, currentEpisode, limit = 5) {
  if (!anime || !anime.broadcast?.day || !anime.episodes_count) return [];

  const status = String(anime.status || '').toLowerCase();
  if (!status.includes('currently airing') && status !== 'airing') return [];

  const nextBroadcast = getNextBroadcastDate(anime.broadcast.day, anime.broadcast.time);
  if (!nextBroadcast) return [];

  const totalEpisodes = anime.episodes_count || anime.episodes?.length || 0;
  const firstUpcomingEpisode = currentEpisode + 1;
  const lastEpisode = Math.min(totalEpisodes, firstUpcomingEpisode + limit - 1);

  if (firstUpcomingEpisode > lastEpisode) return [];

  return Array.from({ length: lastEpisode - firstUpcomingEpisode + 1 }, (_, index) => {
    const episodeNumber = firstUpcomingEpisode + index;
    const date = new Date(nextBroadcast);
    date.setDate(date.getDate() + index * 7);

    return {
      episode: episodeNumber,
      date,
      label: MONTH_FORMATTER.format(date),
      weekday: WEEKDAY_SHORT_FORMATTER.format(date),
      dayNumber: DAY_NUMBER_FORMATTER.format(date),
      monthShort: MONTH_SHORT_FORMATTER.format(date),
      time: anime.broadcast.time ? TIME_FORMATTER.format(date) : null,
    };
  });
}

export function formatEpisodeScheduleDate(date) {
  if (!date) return '';
  return MONTH_FORMATTER.format(date);
}
