import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SeasonCalendar.css';

const DAY_ORDER = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

const DAY_ALIASES = {
  mondays: 'monday',
  monday: 'monday',
  tuesdays: 'tuesday',
  tuesday: 'tuesday',
  wednesdays: 'wednesday',
  wednesday: 'wednesday',
  thursdays: 'thursday',
  thursday: 'thursday',
  fridays: 'friday',
  friday: 'friday',
  saturdays: 'saturday',
  saturday: 'saturday',
  sundays: 'sunday',
  sunday: 'sunday',
};

const SEASON_LABELS = {
  winter: 'Invierno',
  spring: 'Primavera',
  summer: 'Verano',
  fall: 'Otoño',
};

function normalizeDay(day) {
  if (!day) return 'unknown';
  const normalized = String(day).trim().toLowerCase();
  return DAY_ALIASES[normalized] || 'unknown';
}

function parseTime(time) {
  if (!time) return null;
  const match = String(time).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatBroadcastTime(time) {
  if (!time) return 'Horario pendiente';
  return `A las ${time}`;
}

function formatSeasonLabel(animeList) {
  if (!animeList.length) return 'Temporada actual';

  const anime = animeList[0];
  const season = anime.season ? SEASON_LABELS[String(anime.season).toLowerCase()] || anime.season : null;

  if (!season) return 'Temporada actual';
  return anime.year ? `${season} ${anime.year}` : season;
}

function SeasonCalendar({ animeList = [], showHeader = true, className = '' }) {
  const navigate = useNavigate();

  const groupedByDay = DAY_ORDER.reduce((acc, day) => {
    acc[day.key] = [];
    return acc;
  }, { unknown: [] });

  animeList.forEach((anime) => {
    const dayKey = normalizeDay(anime.broadcast?.day);
    if (!groupedByDay[dayKey]) {
      groupedByDay[dayKey] = [];
    }
    groupedByDay[dayKey].push(anime);
  });

  DAY_ORDER.forEach((day) => {
    groupedByDay[day.key].sort((a, b) => {
      const timeDiff = (parseTime(a.broadcast?.time) ?? 24 * 60) - (parseTime(b.broadcast?.time) ?? 24 * 60);
      if (timeDiff !== 0) return timeDiff;
      return a.title.localeCompare(b.title);
    });
  });

  groupedByDay.unknown.sort((a, b) => a.title.localeCompare(b.title));

  const seasonLabel = formatSeasonLabel(animeList);

  return (
    <section className={`season-calendar-section ${showHeader ? '' : 'season-calendar-section--compact'} ${className}`.trim()}>
      {showHeader && (
        <div className="season-calendar-header">
          <div>
            <span className="season-calendar-kicker">Calendario de estrenos</span>
            <h2 className="season-calendar-title">{seasonLabel}</h2>
          </div>
          <div className="season-calendar-badge">
            <Calendar size={18} />
            <span>{animeList.length} animes</span>
          </div>
        </div>
      )}

      {animeList.length > 0 ? (
        <div className="season-calendar-grid">
          {DAY_ORDER.map((day) => {
            const items = groupedByDay[day.key];
            if (!items || items.length === 0) return null;

            return (
              <article key={day.key} className="season-calendar-day-card">
                <div className="season-calendar-day-header">
                  <h3>{day.label}</h3>
                  <span>{items.length}</span>
                </div>
                <div className="season-calendar-day-list">
                  {items.map((anime) => (
                    <button
                      key={anime.id}
                      type="button"
                      className="season-calendar-item"
                      onClick={() => navigate(`/anime/${anime.slug || anime.id}`)}
                    >
                      <img src={anime.cover} alt={anime.title} className="season-calendar-item-cover" />
                      <div className="season-calendar-item-content">
                        <div className="season-calendar-item-top">
                          <span className="season-calendar-item-title">{anime.title}</span>
                          <span className="season-calendar-item-time">{formatBroadcastTime(anime.broadcast?.time)}</span>
                        </div>
                        <div className="season-calendar-item-meta">
                          <span>{anime.type}</span>
                          {anime.rating ? <span>★ {anime.rating}</span> : null}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </article>
            );
          })}

          {groupedByDay.unknown.length > 0 && (
            <article className="season-calendar-day-card unknown">
              <div className="season-calendar-day-header">
                <h3>Sin día</h3>
                <span>{groupedByDay.unknown.length}</span>
              </div>
              <div className="season-calendar-day-list">
                {groupedByDay.unknown.map((anime) => (
                  <button
                    key={anime.id}
                    type="button"
                    className="season-calendar-item"
                    onClick={() => navigate(`/anime/${anime.slug || anime.id}`)}
                  >
                    <img src={anime.cover} alt={anime.title} className="season-calendar-item-cover" />
                    <div className="season-calendar-item-content">
                      <div className="season-calendar-item-top">
                        <span className="season-calendar-item-title">{anime.title}</span>
                        <span className="season-calendar-item-time">Horario pendiente</span>
                      </div>
                      <div className="season-calendar-item-meta">
                        <span>{anime.type}</span>
                        {anime.rating ? <span>★ {anime.rating}</span> : null}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </article>
          )}
        </div>
      ) : (
        <div className="season-calendar-empty">
          No hay estrenos disponibles para mostrar ahora mismo.
        </div>
      )}
    </section>
  );
}

export default SeasonCalendar;
