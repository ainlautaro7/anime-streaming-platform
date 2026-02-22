import { useState, useEffect } from 'react';
import { favoritesService } from '../services/favorites';
import AnimeCard from '../components/AnimeCard';
import { Heart } from 'lucide-react';
import './Popular.css'; // Reusing Popular.css for grid layout

function Favorites() {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        setFavorites(favoritesService.getFavorites());
    }, []);

    const handleRemove = (id) => {
        favoritesService.removeFavorite(id);
        setFavorites(favoritesService.getFavorites());
    };

    return (
        <div className="popular-page page-container animate-fade">
            <div className="page-section-header">
                <div>
                    <h1 className="page-title">Mis Favoritos</h1>
                    <p className="page-subtitle">Tus animes guardados para ver más tarde</p>
                </div>
            </div>

            {favorites.length === 0 ? (
                <div className="empty-state">
                    <Heart size={64} opacity={0.2} />
                    <p>Aún no tienes favoritos. ¡Explora y añade algunos!</p>
                </div>
            ) : (
                <div className="anime-grid">
                    {favorites.map((anime) => (
                        <AnimeCard key={anime.id} anime={anime} wide />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Favorites;
