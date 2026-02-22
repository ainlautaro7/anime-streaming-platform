import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';
import './AnimeCard.css';

function AnimeCard({ anime, wide, layout = 'grid' }) {
  const navigate = useNavigate();
  const { openEpisodeModal } = useAnime();

  const handleClick = () => {
    openEpisodeModal(anime);
  };

  if (layout === 'list') {
    return (
      <div className="anime-card list-layout animate-slide-up" onClick={handleClick}>
        <div className="anime-card-list-image">
          <img src={anime.cover || anime.image} alt={anime.title} />
          <div className="anime-card-list-play">
            <Play size={20} fill="white" />
          </div>
        </div>
        <div className="anime-card-list-info">
          <h3 className="anime-card-list-title">{anime.title}</h3>
          <div className="anime-card-list-meta">
            {anime.rating && <span className="anime-card-list-rating">★ {anime.rating}</span>}
            {anime.type && <span className="anime-card-list-type">{anime.type}</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`anime-card ${wide ? 'wide' : ''}`} onClick={handleClick}>
      <div className="anime-card-image-container">
        <h3 className="anime-card-heading">{anime.title}</h3>
        <img src={anime.cover || anime.image} alt={anime.title} className="anime-card-image" />
        <div className="anime-card-overlay">
          <div className="anime-card-play">
            <Play size={wide ? 30 : 24} fill="white" />
          </div>
          <div className="anime-card-info">
            {anime.rating && <p className="anime-card-meta">Rating: {anime.rating}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}


export default AnimeCard;
