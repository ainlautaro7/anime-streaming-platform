import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Server } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';
import { api } from '../services/api';
import { watchedEpisodesService } from '../services/watchedEpisodes';
import { SkeletonPlayer } from '../components/Skeletons';
import { buildUpcomingEpisodeSchedule } from '../utils/episodeSchedule';
import './Player.css';
import './AnimeDetail.css';

function Player() {
  const { id: slug, episode } = useParams();
  const navigate = useNavigate();
  const { setCurrentAnime } = useAnime();
  const [servers, setServers] = useState([]);
  const [currentServer, setCurrentServer] = useState(null);
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const videoContainerRef = useRef(null);
  const [episodesSidebarHeight, setEpisodesSidebarHeight] = useState(null);
  const [isPlayerActivated, setIsPlayerActivated] = useState(false);
  const [availableEpisodes, setAvailableEpisodes] = useState(new Set());
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const currentEpisode = parseInt(episode);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtenemos primero los detalles del anime para tener el título exacto
        const animeData = await api.getAnimeBySlug(slug);
        setAnime(animeData);
        setCurrentAnime(animeData); // Update global context

        if (animeData) {
          const flvSlug = await api.getAnimeFLVSlug(animeData.title);
          if (flvSlug) {
            const flvDetails = await api.getAnimeFLVDetails(flvSlug);
            if (flvDetails?.episodes?.length) {
              setAvailableEpisodes(new Set(flvDetails.episodes.map((item) => item.number)));
            } else {
              setAvailableEpisodes(new Set());
            }
          } else {
            setAvailableEpisodes(new Set());
          }

          // Usamos el título para buscar las fuentes
          const serversData = await api.getEpisodeServers(slug, currentEpisode, animeData.title);
          setServers(serversData);
          if (serversData.length > 0) {
            setCurrentServer(serversData[0]);
          }

          // Marcar episodio como visto
          watchedEpisodesService.markAsWatched(slug, currentEpisode, animeData.title);
        }
      } catch (error) {
        console.error('Error fetching player data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, currentEpisode, setCurrentAnime]);

  useEffect(() => {
    const syncSidebarHeight = () => {
      const videoHeight = videoContainerRef.current?.offsetHeight;
      setEpisodesSidebarHeight(videoHeight || null);
    };

    syncSidebarHeight();
    window.addEventListener('resize', syncSidebarHeight);

    return () => {
      window.removeEventListener('resize', syncSidebarHeight);
    };
  }, [currentServer, loading, anime, currentEpisode]);

  useEffect(() => {
    setIsPlayerActivated(false);
  }, [currentServer?.embed, currentEpisode]);

  useEffect(() => {
    if (!anime) {
      setUpcomingSchedule([]);
      return;
    }

    setUpcomingSchedule(buildUpcomingEpisodeSchedule(anime, currentEpisode));
  }, [anime, currentEpisode]);

  const getAutoplayEmbed = (embedUrl) => {
    if (!embedUrl) return embedUrl;

    try {
      const url = new URL(embedUrl);
      url.searchParams.set('autoplay', '1');
      return url.toString();
    } catch {
      const separator = embedUrl.includes('?') ? '&' : '?';
      return `${embedUrl}${separator}autoplay=1`;
    }
  };

  const handleEpisodeClick = (episodeNumber) => {
    navigate(`/watch/${slug}/${episodeNumber}`);
  };

  // if (loading) return <Loader />; // REMOVED: Prevent full page flash

  return (
    <div className="player animate-fade">
      <div className="player-container">
        <div className="player-header">
          {/* Back button is now in global Header */}
          <h1 className="player-title">
            {loading ? 'Cargando...' : (
              anime?.type?.toLowerCase() === 'movie'
                ? anime?.title
                : `${anime?.title} - Episodio ${currentEpisode}`
            )}
          </h1>
        </div>

        {loading ? (
          <SkeletonPlayer />
        ) : (
          <>
            <div className="player-layout">
              <div className="player-main-column">
              {currentServer && currentServer.embed ? (
                <div className={`player-video-container ${isPlayerActivated ? 'is-activated' : ''}`} ref={videoContainerRef}>
                  <iframe
                    src={isPlayerActivated ? getAutoplayEmbed(currentServer.embed) : currentServer.embed}
                    className="player-video"
                    allowFullScreen
                    allow="autoplay; fullscreen; picture-in-picture"
                    title={anime?.title}
                  />
                  {!isPlayerActivated && (
                    <button
                      type="button"
                      className="player-video-overlay"
                      onClick={() => setIsPlayerActivated(true)}
                      aria-label="Iniciar reproducción"
                    >
                      <span className="player-video-overlay-icon">
                        <Play size={42} fill="currentColor" />
                      </span>
                      <span className="player-video-overlay-text">Reproducir</span>
                      <span className="player-video-overlay-hint">Pulsa para iniciar sin tocar el reproductor</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="player-no-video">
                  <h2>
                    {anime?.type?.toLowerCase() === 'movie'
                      ? anime?.title
                      : `${anime?.title} - Episodio ${currentEpisode}`}
                  </h2>
                  <p>No se pudieron encontrar fuentes de video para este anime en los servidores externos.</p>
                </div>
              )}

              <div className="player-servers">
                <div className="player-servers-header">
                  <Server size={20} />
                  <span>Fuentes Disponibles</span>
                </div>
                <div className="player-servers-list">
                  {servers.length > 0 ? (
                    servers.map((server, index) => (
                      <button
                        key={index}
                        className={`player-server-button ${currentServer === server ? 'active' : ''}`}
                        onClick={() => setCurrentServer(server)}
                      >
                        {server.name}
                      </button>
                    ))
                  ) : (
                    <p className="no-servers-message">No se encontraron videos o trailers disponibles.</p>
                  )}
                </div>
              </div>

              </div>

              {anime && anime.episodes && anime.type?.toLowerCase() !== 'movie' && (
                <aside
                  className="player-episodes-sidebar"
                  style={episodesSidebarHeight ? { height: `${episodesSidebarHeight}px` } : undefined}
                >
                  <div className="player-episodes-sidebar-header">
                    <h2 className="player-episodes-title">Capítulos</h2>
                    <span className="player-episodes-count">{anime.episodes.length}</span>
                  </div>
                  <div className="player-episodes-scroll">
                    <div className="player-episodes-list">
                      {anime.episodes.map((episode) => {
                        const isWatched = watchedEpisodesService.isWatched(slug, episode.number);
                        const isActive = episode.number === currentEpisode;
                        const isAvailable = availableEpisodes.size > 0 ? availableEpisodes.has(episode.number) : true;
                        const isDisabled = !isAvailable;

                        return (
                          <button
                            key={episode.number}
                            className={`player-episode-item ${isWatched ? 'watched' : ''} ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                            onClick={() => !isDisabled && handleEpisodeClick(episode.number)}
                            disabled={isDisabled}
                            type="button"
                          >
                            <div className="player-episode-thumb">
                              <img src={episode.image || anime.cover} alt={`Episodio ${episode.number}`} />
                              <div className="player-episode-thumb-overlay">
                                <span className="player-episode-badge">
                                  {isDisabled ? 'Próximo' : isActive ? 'Viendo' : `#${episode.number}`}
                                </span>
                              </div>
                            </div>
                            <div className="player-episode-meta">
                              <h3 className="player-episode-number">Episodio {episode.number}</h3>
                              <p className="player-episode-title">{episode.title}</p>
                              {isDisabled ? (
                                <span className="player-episode-status">No disponible</span>
                              ) : isWatched && <span className="player-episode-status">Visto</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </aside>
              )}
            </div>
            <section className="player-schedule-section">
              <div className="player-schedule-card">
                <div className="player-schedule-header">
                  <div className="player-schedule-title-wrap">
                    <span className="player-schedule-kicker">Calendario</span>
                    <h2 className="player-schedule-title">Próximos estrenos</h2>
                  </div>
                  <span className="player-schedule-count">{upcomingSchedule.length}</span>
                </div>
                {upcomingSchedule.length > 0 ? (
                  <div className="player-schedule-calendar">
                    {upcomingSchedule.map((item) => (
                      <div key={item.episode} className="player-schedule-item">
                        <div className="player-schedule-date">
                          <span className="player-schedule-weekday">{item.weekday}</span>
                          <span className="player-schedule-day">{item.dayNumber}</span>
                          <span className="player-schedule-month">{item.monthShort}</span>
                        </div>
                        <div className="player-schedule-info">
                          <span className="player-schedule-episode-label">Episodio {item.episode}</span>
                          <span className="player-schedule-episode-date">{item.label}</span>
                          <span className="player-schedule-meta">
                            {item.time ? `A las ${item.time}` : 'Horario pendiente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="player-schedule-empty">
                    No hay fechas de estreno disponibles por ahora.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Player;
