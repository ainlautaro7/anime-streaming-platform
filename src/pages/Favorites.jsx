import { useState, useEffect } from 'react';
import { favoritesService } from '../services/favorites';
import { api } from '../services/api';
import AnimeCard from '../components/AnimeCard';
import GenreDropdown from '../components/GenreDropdown';
import { Heart } from 'lucide-react';
import './Popular.css'; // Reusing Popular.css for grid layout

function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedGenreIds, setSelectedGenreIds] = useState([]);

    useEffect(() => {
        setFavorites(favoritesService.getFavorites());
        const fetchGenres = async () => {
            const list = await api.getGenres();
            setGenres(list);
        };
        fetchGenres();
    }, []);

    const handleRemove = (id) => {
        favoritesService.removeFavorite(id);
        setFavorites(favoritesService.getFavorites());
    };

    const handleGenreSelect = (genre) => {
        if (!genre) {
            setSelectedGenreIds([]);
            return;
        }

        const idStr = String(genre.mal_id);
        const isAlreadySelected = selectedGenreIds.includes(idStr);

        if (isAlreadySelected) {
            setSelectedGenreIds(selectedGenreIds.filter(id => id !== idStr));
        } else {
            setSelectedGenreIds([...selectedGenreIds, idStr]);
        }
    };

    const filteredFavorites = favorites.filter(anime => {
        if (selectedGenreIds.length === 0) return true;
        const selectedGenreNames = genres
            .filter(g => selectedGenreIds.includes(String(g.mal_id)))
            .map(g => g.name.toLowerCase());

        return selectedGenreNames.every(name =>
            anime.genres.some(g => g.toLowerCase() === name)
        );
    });

    return (
        <div className="popular-page page-container animate-fade">
            <div className="page-section-header with-actions">
                <div className="header-title-group">
                    <div>
                        <h1 className="page-title">Mis Favoritos</h1>
                        <p className="page-subtitle">Tus animes guardados para ver más tarde</p>
                    </div>
                </div>

                {favorites.length > 0 && (
                    <GenreDropdown
                        genres={genres}
                        selectedGenreIds={selectedGenreIds}
                        onSelect={handleGenreSelect}
                        className="header-variant"
                    />
                )}
            </div>

            {favorites.length === 0 ? (
                <div className="empty-state">
                    <Heart size={64} opacity={0.2} />
                    <p>Aún no tienes favoritos. ¡Explora y añade algunos!</p>
                </div>
            ) : filteredFavorites.length === 0 ? (
                <div className="empty-state">
                    <p>No se encontraron animes para los géneros seleccionados.</p>
                </div>
            ) : (
                <div className="anime-grid">
                    {filteredFavorites.map((anime) => (
                        <AnimeCard key={anime.id} anime={anime} wide />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Favorites;
