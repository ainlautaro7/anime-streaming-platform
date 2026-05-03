import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock3, LayoutGrid, Sparkles } from 'lucide-react';
import SeasonCalendar from '../components/SeasonCalendar';
import Loader from '../components/Loader';
import { api } from '../services/api';
import './SeasonCalendarPage.css';

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

function formatSeasonLabel(animeList) {
  if (!animeList.length) return 'Temporada actual';

  const anime = animeList[0];
  const season = anime.season ? SEASON_LABELS[String(anime.season).toLowerCase()] || anime.season : null;

  if (!season) return 'Temporada actual';
  return anime.year ? `${season} ${anime.year}` : season;
}

function SeasonCalendarPage() {
  const [airingAnime, setAiringAnime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAiringAnime = async () => {
      try {
        setLoading(true);
        const airing = await api.getAiringAnime();
        setAiringAnime(airing);
      } catch (error) {
        console.error('Error fetching calendar anime:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAiringAnime();
  }, []);

  const seasonLabel = useMemo(() => formatSeasonLabel(airingAnime), [airingAnime]);

  const stats = useMemo(() => {
    const dayCounts = DAY_ORDER.map((day) => ({
      ...day,
      count: airingAnime.filter((anime) => normalizeDay(anime.broadcast?.day) === day.key).length,
    }));

    const activeDays = dayCounts.filter((day) => day.count > 0).length;
    const scheduled = airingAnime.filter((anime) => anime.broadcast?.time).length;

    return {
      dayCounts,
      activeDays,
      scheduled,
    };
  }, [airingAnime]);

  if (loading) {
    return (
      <div className="season-calendar-page animate-fade">
        <div className="page-container season-calendar-page-container">
          <div className="season-calendar-hero season-calendar-hero--loading">
            <div className="season-calendar-hero-copy">
              <span className="season-calendar-kicker">Calendario de estrenos</span>
              <div className="season-calendar-skeleton title" />
              <div className="season-calendar-skeleton text" />
              <div className="season-calendar-skeleton text short" />
            </div>
            <div className="season-calendar-hero-panel">
              <div className="season-calendar-skeleton chip" />
              <div className="season-calendar-hero-stats">
                <div className="season-calendar-skeleton stat" />
                <div className="season-calendar-skeleton stat" />
                <div className="season-calendar-skeleton stat" />
              </div>
            </div>
          </div>
          <div className="season-calendar-loading">
            <Loader fullPage={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="season-calendar-page animate-fade">
      <div className="page-container season-calendar-page-container">
        <section className="season-calendar-hero">
          <div className="season-calendar-hero-copy">
            <span className="season-calendar-kicker">Calendario de estrenos</span>
            <h1 className="season-calendar-page-title">{seasonLabel}</h1>
            <p className="season-calendar-page-description">
              Revisa de un vistazo qué anime se estrena cada día. Los títulos se agrupan por jornada y se ordenan por horario para que encuentres rápido lo que viene.
            </p>

            <div className="season-calendar-hero-chips" aria-label="Resumen semanal">
              {stats.dayCounts.map((day) => (
                <div key={day.key} className={`season-calendar-day-chip ${day.count ? 'active' : ''}`}>
                  <span>{day.label.slice(0, 3)}</span>
                  <strong>{day.count}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="season-calendar-hero-panel">
            <div className="season-calendar-hero-badge">
              <Calendar size={18} />
              <span>{airingAnime.length} estrenos esta semana</span>
            </div>
            <p className="season-calendar-hero-note">
              El contador agrupa la cantidad de estrenos programados para esta semana.
            </p>

            <div className="season-calendar-hero-stats">
              <article className="season-calendar-stat-card">
                <Sparkles size={18} />
                <div>
                  <span>Días activos</span>
                  <strong>{stats.activeDays}</strong>
                </div>
              </article>

              <article className="season-calendar-stat-card">
                <LayoutGrid size={18} />
                <div>
                  <span>Estrenos con hora</span>
                  <strong>{stats.scheduled}</strong>
                </div>
              </article>

              <article className="season-calendar-stat-card">
                <Clock3 size={18} />
                <div>
                  <span>Vista semanal</span>
                  <strong>Ordenada</strong>
                </div>
              </article>
            </div>
          </div>
        </section>

        <SeasonCalendar animeList={airingAnime} showHeader={false} className="season-calendar-module" />
      </div>
    </div>
  );
}

export default SeasonCalendarPage;
