import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Star, Calendar, Server, Heart, ListPlus } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';
import PlaylistModal from '../components/PlaylistModal';
import { api } from '../services/api';
import { favoritesService } from '../services/favorites';
import { watchedEpisodesService } from '../services/watchedEpisodes';
import { SkeletonDetail } from '../components/Skeletons';
import Loader from '../components/Loader';
import { formatSeasonOption, getAvailableSeasonOptions } from '../utils/seasonRelations';
import './AnimeDetail.css';

function AnimeDetail() {
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const { setCurrentAnime } = useAnime();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servers, setServers] = useState([]);
  const [currentServer, setCurrentServer] = useState(null);
  const [loadingServers, setLoadingServers] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [availableEpisodes, setAvailableEpisodes] = useState(new Set());
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [seasonOptions, setSeasonOptions] = useState([]);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const data = await api.getAnimeBySlug(slug);

        // Obtener thumbnails de episodios
        const videosData = await api.getAnimeVideos(data.id);

        // Mezclar datos de episodios con thumbnails
        if (data.episodes) {
          data.episodes = data.episodes.map(episode => {
            const video = videosData.find(v => v.number === episode.number);
            return {
              ...episode,
              image: video?.image || data.cover,
              title: video?.title || `Episodio ${episode.number}`
            };
          });
        }

        const flvSlug = await api.getAnimeFLVSlug(data.title);
        if (flvSlug) {
          const flvDetails = await api.getAnimeFLVDetails(flvSlug);
          if (flvDetails && flvDetails.episodes) {
            const availableSet = new Set(flvDetails.episodes.map(ep => ep.number));
            setAvailableEpisodes(availableSet);
          }
        } else {
          setAvailableEpisodes(new Set());
        }

        setAnime(data);
        setCurrentAnime(data); // Update global context
        setIsFav(favoritesService.isFavorite(data.id));

        const seasonList = await getAvailableSeasonOptions(data);
        setSeasonOptions(seasonList);

        // En Jikan, el tipo es 'Movie'
        if (data && data.type === 'Movie' && data.episodes) {
          const fetchServers = async (episodeNumber, title) => {
            setLoadingServers(true);
            try {
              const serversData = await api.getEpisodeServers(slug, episodeNumber, title || data.title);
              setServers(serversData);
              if (serversData.length > 0) {
                setCurrentServer(serversData[0]);
              }
            } catch (error) {
              console.error('Error fetching servers for movie:', error);
            } finally {
              setLoadingServers(false);
            }
          };

          fetchServers(1, data.title);
        }
      } catch (error) {
        console.error('Error fetching anime details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [slug, setCurrentAnime]);

  const handleToggleFavorite = () => {
    if (anime) {
      const newStatus = favoritesService.toggleFavorite(anime);
      setIsFav(newStatus);
    }
  };

  if (loading) return <SkeletonDetail />;
  if (!anime) return <div className="error">No se encontró el anime.</div>;

  const handleEpisodeClick = (episodeNumber) => {
    navigate(`/watch/${slug}/${episodeNumber}`);
  };

  const handlePlayClick = () => {
    if (isMovie) {
      navigate(`/watch/${slug}/1`);
    } else if (anime.episodes && anime.episodes.length > 0) {
      navigate(`/watch/${slug}/${anime.episodes[0].number}`);
    }
  };

  const isMovie = anime.type === 'Movie';

  return (
    <div className="anime-detail animate-fade">
      <div className="anime-detail-hero" style={{ backgroundImage: `url(${anime.cover})` }}>
        <div className="anime-detail-overlay"></div>
        <div className="anime-detail-hero-content">
          <img src={anime.cover} alt={anime.title} className="anime-detail-poster" />
          <div className="anime-detail-info">
            <h1 className="anime-detail-title">{anime.title}</h1>

            <div className="anime-detail-meta">
              <span className="anime-detail-rating">
                <Star size={18} fill="var(--netflix-red)" stroke="var(--netflix-red)" />
                {anime.rating || 'N/A'}
              </span>
              <span className="anime-detail-year">
                <Calendar size={18} />
                {anime.type || 'N/A'}
              </span>
              <span className="anime-detail-status">{anime.status || 'Desconocido'}</span>
            </div>

            <div className="anime-detail-genres">
              {anime.genres && anime.genres.map((genre, index) => (
                <span key={index} className="anime-detail-genre">{genre}</span>
              ))}
            </div>

            <p className="anime-detail-description">{anime.synopsis}</p>

            <div className="anime-detail-stats">
              <p><strong>Tipo:</strong> {anime.type}</p>
              {!isMovie && <p><strong>Episodios:</strong> {anime.episodes_count || anime.episodes?.length || 0}</p>}
            </div>

            <div className="anime-detail-actions">
              {!isMovie && (
                <button className="anime-detail-play-button" onClick={handlePlayClick}>
                  <Play size={24} fill="currentColor" />
                  Comenzar a ver
                </button>
              )}
              <button
                className={`anime-detail-fav-button ${isFav ? 'active' : ''}`}
                onClick={handleToggleFavorite}
                title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
              >
                <Heart size={24} fill={isFav ? "currentColor" : "none"} />
              </button>
              <button
                className="anime-detail-playlist-button"
                onClick={() => setShowPlaylistModal(true)}
                title="Agregar a lista de reproducción"
              >
                <ListPlus size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Seasons / Franchise Navigation - REMOVED STANDALONE SECTION */}

      {isMovie ? (
        <div id="movie-player" className="anime-detail-player-section">
          {loadingServers ? (
            <Loader fullPage={false} />
          ) : currentServer ? (
            <>
              <div className="player-video-container">
                <iframe
                  src={currentServer.embed}
                  className="player-video"
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture"
                  title={anime.title}
                />
              </div>
              <div className="player-servers">
                <div className="player-servers-header">
                  <Server size={20} />
                  <span>Servidores disponibles</span>
                </div>
                <div className="player-servers-list">
                  {servers.map((server, index) => (
                    <button
                      key={index}
                      className={`player-server-button ${currentServer === server ? 'active' : ''}`}
                      onClick={() => setCurrentServer(server)}
                      disabled={!server.embed}
                    >
                      {server.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="no-servers-message">No se encontraron servidores de video para esta película.</div>
          )}
        </div>
      ) : (
        <div className="anime-detail-episodes">
          <div className="anime-detail-episodes-header">
            <h2 className="anime-detail-episodes-title">Episodios</h2>

            {seasonOptions.length > 1 && (
              <div className="relations-dropdown-wrapper">
                <select
                  className="relations-dropdown"
                  onChange={(e) => {
                    if (e.target.value) navigate(`/anime/${e.target.value}`)
                  }}
                  value={anime.id}
                >
                  {seasonOptions.map((season) => (
                    <option key={season.id} value={season.id}>
                      {formatSeasonOption(season)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="anime-detail-episodes-grid">
            {anime.episodes && anime.episodes.map((episode) => {
              const isWatched = watchedEpisodesService.isWatched(slug, episode.number);
              // Use stricter check: Must be in the set to be clickable.
              // Note: Jikan sometimes has more episodes listed (announced) than FLV (released).
              // If availableEpisodes is empty (api failed or no match), we might show all disabled or allow all?
              // Current logic: If availableEpisodes has entries, use it filter.
              // If empty, it might mean the initial check failed or no ep is out.
              // Improvement: Only check if availableEpisodes is populated.
              const isAvailable = availableEpisodes.size > 0 ? availableEpisodes.has(episode.number) : true;

              return (
                <div
                  key={episode.number}
                  className={`episode-card ${isWatched ? 'watched' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                  onClick={() => isAvailable && handleEpisodeClick(episode.number)}
                  title={!isAvailable ? "No disponible" : ""}
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
      {showPlaylistModal && (
        <PlaylistModal
          anime={anime}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
}

export default AnimeDetail;
