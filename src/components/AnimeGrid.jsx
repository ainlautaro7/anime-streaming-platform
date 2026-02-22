import React from 'react';
import AnimeCard from './AnimeCard';
import './AnimeGrid.css';

function AnimeGrid({ animes, lastElementRef }) {
    if (!animes || animes.length === 0) return null;

    return (
        <div className="anime-grid">
            {animes.map((anime, index) => {
                if (animes.length === index + 1 && lastElementRef) {
                    return (
                        <div ref={lastElementRef} key={`${anime.mal_id}-${index}`}>
                            <AnimeCard anime={anime} wide />
                        </div>
                    );
                } else {
                    return (
                        <AnimeCard
                            key={`${anime.mal_id}-${index}`}
                            anime={anime}
                            wide
                        />
                    );
                }
            })}
        </div>
    );
}

export default AnimeGrid;
