import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft, Server, Play } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';
import { api } from '../services/api';
import { watchedEpisodesService } from '../services/watchedEpisodes';
import { SkeletonPlayer } from '../components/Skeletons';
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

  const handleBackClick = () => {
    navigate(`/anime/${slug}`);
  };

  const handlePreviousEpisode = () => {
    if (currentEpisode > 1) {
      navigate(`/watch/${slug}/${currentEpisode - 1}`);
    }
  };

  const handleNextEpisode = () => {
    if (anime && anime.episodes && currentEpisode < anime.episodes.length) {
      navigate(`/watch/${slug}/${currentEpisode + 1}`);
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
            {currentServer && currentServer.embed ? (
              <div className="player-video-container">
                <iframe
                  src={currentServer.embed}
                  className="player-video"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={anime?.title}
                />
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
          </>
        )}

        <div className="player-controls">
          <button
            className="player-control-button"
            onClick={handlePreviousEpisode}
            disabled={currentEpisode === 1}
          >
            <ChevronLeft size={24} />
            Anterior
          </button>
          <button
            className="player-control-button"
            onClick={handleNextEpisode}
            disabled={!anime || !anime.episodes || currentEpisode >= anime.episodes.length}
          >
            Siguiente
            <ChevronRight size={24} />
          </button>
        </div>

        {anime && anime.episodes && (
          <div className="player-episodes">
            <h2 className="player-episodes-title">Todos los episodios</h2>
            <div className="anime-detail-episodes-grid">
              {anime.episodes && anime.episodes.map((episode) => {
                const isWatched = watchedEpisodesService.isWatched(slug, episode.number);
                return (
                  <div
                    key={episode.number}
                    className={`episode-card ${isWatched ? 'watched' : ''}`}
                    onClick={() => handleEpisodeClick(episode.number)}
                  >
                    <div className="episode-card-thumbnail">
                      <img src={episode.image || anime.cover} alt={`Episodio ${episode.number}`} />
                      <div className="episode-card-play">
                        <Play size={30} fill="currentColor" />
                      </div>
                    </div>
                    <div className="episode-card-info">
                      <h3 className="episode-card-number">Episodio {episode.number}</h3>
                      <p className="episode-card-title">{episode.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Player;
