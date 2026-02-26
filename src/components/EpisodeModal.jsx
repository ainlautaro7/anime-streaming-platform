import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Star, Calendar, LayoutGrid, List } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';
import { api } from '../services/api';
import { watchedEpisodesService } from '../services/watchedEpisodes';
import { SkeletonModal } from './Skeletons';
import './EpisodeModal.css';

function EpisodeModal() {
    const navigate = useNavigate();
    const { isEpisodeModalOpen, selectedAnime, closeEpisodeModal } = useAnime();
    const [animeDetails, setAnimeDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [availableEpisodes, setAvailableEpisodes] = useState(new Set());
    const [viewMode, setViewMode] = useState('grid');


    useEffect(() => {
        if (isEpisodeModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isEpisodeModalOpen]);

    useEffect(() => {
        if (isEpisodeModalOpen && selectedAnime) {

            fetchFullDetails();
        } else {
            setAnimeDetails(null);
            setLoading(true);
        }
    }, [isEpisodeModalOpen, selectedAnime]);

    const fetchFullDetails = async () => {
        setLoading(true);
        try {
            const slug = selectedAnime.slug || selectedAnime.id;
            const data = await api.getAnimeBySlug(slug);

            // Get thumbnails
            const videosData = await api.getAnimeVideos(data.id);

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

            // Availability check
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

            setAnimeDetails(data);
        } catch (error) {
            console.error('Error fetching modal details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isEpisodeModalOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeEpisodeModal();
        }
    };

    const handleEpisodeClick = (episodeNumber) => {
        const slug = selectedAnime.slug || selectedAnime.id;
        navigate(`/watch/${slug}/${episodeNumber}`);
        closeEpisodeModal();
    };


    return (
        <div className="episode-modal-backdrop" onClick={handleBackdropClick}>
            <div className="episode-modal animate-fade-in">
                <div className="episode-modal-header">
                    <h2>{selectedAnime.title}</h2>
                    <button className="episode-modal-close" onClick={closeEpisodeModal}>
                        <X size={24} />
                    </button>
                </div>

                <div className="episode-modal-content">
                    {loading ? (
                        <SkeletonModal />
                    ) : animeDetails ? (

                        <>
                            <div className="episode-modal-anime-info">
                                <img src={animeDetails.cover} alt={animeDetails.title} className="episode-modal-poster" />
                                <div className="episode-modal-details">
                                    <div className="episode-modal-meta">
                                        <span className="anime-detail-rating">
                                            <Star size={18} fill="var(--netflix-red)" stroke="var(--netflix-red)" />
                                            {animeDetails.rating || 'N/A'}
                                        </span>
                                        <span className="anime-detail-year">
                                            <Calendar size={18} />
                                            {animeDetails.type || 'N/A'}
                                        </span>
                                    </div>
                                    <p className="episode-modal-synopsis">{animeDetails.synopsis}</p>
                                    <div className="anime-detail-genres" style={{ marginBottom: animeDetails.type?.toLowerCase() === 'movie' ? '1.5rem' : 0 }}>
                                        {animeDetails.genres?.slice(0, 3).map((genre, index) => (
                                            <span key={index} className="anime-detail-genre">{genre}</span>
                                        ))}
                                    </div>
                                    {animeDetails.type?.toLowerCase() === 'movie' && (
                                        <button 
                                            className="movie-watch-now-btn" 
                                            onClick={() => handleEpisodeClick(1)}
                                        >
                                            <Play size={20} fill="currentColor" />
                                            Ver ahora
                                        </button>
                                    )}
                                </div>
                            </div>

                            {animeDetails.type?.toLowerCase() !== 'movie' && (
                                <>
                                    <div className="episode-modal-episodes-header">
                                        <h3 className="section-title">Episodios</h3>
                                        <div className="view-toggle">
                                            <button
                                                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                                onClick={() => setViewMode('grid')}
                                                title="Vista cuadrícula"
                                            >
                                                <LayoutGrid size={20} />
                                            </button>
                                            <button
                                                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                                onClick={() => setViewMode('list')}
                                                title="Vista lista"
                                            >
                                                <List size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className={`episode-modal-episodes-${viewMode}`}>
                                        {animeDetails.episodes?.map((episode) => {
                                            const isWatched = watchedEpisodesService.isWatched(selectedAnime.slug || selectedAnime.id, episode.number);
                                            const isAvailable = availableEpisodes.size > 0 ? availableEpisodes.has(episode.number) : true;

                                            return (
                                                <div
                                                    key={episode.number}
                                                    className={`episode-${viewMode === 'grid' ? 'card' : 'list-item'} ${isWatched ? 'watched' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                                                    onClick={() => isAvailable && handleEpisodeClick(episode.number)}
                                                    title={!isAvailable ? "No disponible" : ""}
                                                >
                                                    <div className={`episode-${viewMode === 'grid' ? 'card' : 'list'}-thumbnail`}>
                                                        <img src={episode.image || animeDetails.cover} alt={`Episodio ${episode.number}`} />
                                                        <div className={`episode-${viewMode === 'grid' ? 'card' : 'list'}-play`}>
                                                            <Play size={viewMode === 'grid' ? 30 : 20} fill="currentColor" />
                                                        </div>
                                                    </div>
                                                    <div className={`episode-${viewMode === 'grid' ? 'card' : 'list'}-info`}>
                                                        <h3 className={`episode-${viewMode === 'grid' ? 'card' : 'list'}-number`}>Episodio {episode.number}</h3>
                                                        <p className={`episode-${viewMode === 'grid' ? 'card' : 'list'}-title`}>{episode.title}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                        </>
                    ) : (
                        <div className="error">Error al cargar detalles del anime.</div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default EpisodeModal;
