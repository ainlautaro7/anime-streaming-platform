const STORAGE_KEY = 'anime_favorites';

export const favoritesService = {
    getFavorites: () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    isFavorite: (id) => {
        const favorites = favoritesService.getFavorites();
        return favorites.some(fav => fav.id === id);
    },

    addFavorite: (anime) => {
        const favorites = favoritesService.getFavorites();
        if (!favorites.some(fav => fav.id === anime.id)) {
            const updated = [...favorites, {
                id: anime.id,
                title: anime.title,
                cover: anime.cover,
                rating: anime.rating,
                type: anime.type,
                slug: anime.id
            }];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
    },

    removeFavorite: (id) => {
        const favorites = favoritesService.getFavorites();
        const updated = favorites.filter(fav => fav.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },

    toggleFavorite: (anime) => {
        if (favoritesService.isFavorite(anime.id)) {
            favoritesService.removeFavorite(anime.id);
            return false;
        } else {
            favoritesService.addFavorite(anime);
            return true;
        }
    }
};
