import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight, Info, Star } from 'lucide-react';
import './Hero.css';

function Hero({ animes }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  if (!animes || animes.length === 0) return null;

  const currentAnime = animes[currentIndex];

  const showControls = animes.length > 1;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % animes.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + animes.length) % animes.length);
  };

  const handlePlayClick = () => {
    if ((currentAnime.type || '').toLowerCase() === 'movie') {
      navigate(`/watch/${currentAnime.slug || currentAnime.id}/1`);
      return;
    }

    navigate(`/watch/${currentAnime.id}/1`);
  };

  return (
    <div className={`hero ${!showControls ? 'full-width' : ''}`}>
      <div className="hero-carousel">
        {showControls && (
          <button className="carousel-control prev" onClick={handlePrev}>
            <ChevronLeft size={32} />
          </button>
        )}

        <div className="carousel-track">
          {/* Main Focus */}
          <div className="carousel-item active">
            <img src={currentAnime.cover} alt={currentAnime.title} className="hero-image" />
            <div className="hero-content" key={currentIndex}>
              <div className="hero-inner-container">
                <div className="hero-poster-column">
                  <div className="hero-poster-wrapper">
                    <img
                      src={currentAnime.cover}
                      alt={currentAnime.title}
                      className="hero-poster-img"
                    />
                  </div>
                </div>

                <div className="hero-info-column">
                  <span><b>Anime Streaming Platform</b></span>

                  <h1 className="hero-title">{currentAnime.title}</h1>

                  <div className="hero-meta-row">
                    <span className="meta-year">{currentAnime.year || '2024'}</span>
                    <span className="meta-seasons">82 Seasons</span>
                    <span className="meta-rating-badge">TV-MA</span>
                    {currentAnime.rating && (
                      <span className="meta-score">
                        <Star size={14} fill="var(--primary-blue)" color="var(--primary-blue)" />
                        {currentAnime.rating}
                      </span>
                    )}
                  </div>

                  <div className="hero-ranking">
                    <div className="ranking-icon">🏆</div>
                    <span>#1 in TV Shows Today</span>
                  </div>

                  <p className="hero-description">{currentAnime.synopsis}</p>

                  <div className="hero-actions">
                    <button
                      className="hero-button hero-button-info"
                      onClick={handlePlayClick}
                    >
                      <Play size={20} />
                      Comenzar a ver

                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-overlay"></div>
          </div>
        </div>

        {showControls && (
          <button className="carousel-control next" onClick={handleNext}>
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      {showControls && (
        <div className="carousel-indicators">
          {animes.slice(0, 5).map((_, idx) => (
            <div
              key={idx}
              className={`indicator ${idx === currentIndex % 5 ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Hero;
