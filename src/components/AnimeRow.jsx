import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AnimeCard from './AnimeCard';
import { Link } from 'react-router-dom';
import './AnimeRow.css';

function AnimeRow({ title, animes, showSeeAll }) {
  const rowRef = useRef(null);
  const isWide = title === 'POPULARES';

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="anime-row">
      <div className="anime-row-header">
        <h2 className="anime-row-title">{title}</h2>
        {showSeeAll && (
          <Link to="/popular" className="see-all-link">
            VER TODOS &gt;
          </Link>
        )}
      </div>

      <div className="anime-row-container">
        <button
          className="anime-row-button anime-row-button-left"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <ChevronLeft size={30} />
        </button>

        <div className="anime-row-content" ref={rowRef}>
          {Array.isArray(animes) && animes.map((anime) => (
            <AnimeCard
              key={anime.slug || anime.id}
              anime={anime}
              wide={isWide}
            />
          ))}
        </div>

        <button
          className="anime-row-button anime-row-button-right"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <ChevronRight size={30} />
        </button>
      </div>
    </div>
  );
}

export default AnimeRow;
