const STORAGE_KEY = 'anime_watched_episodes';

export const watchedEpisodesService = {
    // Obtener todos los episodios vistos
    getWatchedEpisodes: () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    },

    // Verificar si un episodio específico ha sido visto
    // episodeKey formato: "animeSlug-episodeNumber" ej: "one-piece-1"
    isWatched: (animeSlug, episodeNumber) => {
        const watched = watchedEpisodesService.getWatchedEpisodes();
        const episodeKey = `${animeSlug}-${episodeNumber}`;
        return !!watched[episodeKey];
    },

    // Marcar un episodio como visto
    markAsWatched: (animeSlug, episodeNumber, animeTitle = '') => {
        const watched = watchedEpisodesService.getWatchedEpisodes();
        const episodeKey = `${animeSlug}-${episodeNumber}`;

        watched[episodeKey] = {
            animeSlug,
            episodeNumber,
            animeTitle,
            watchedAt: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
    },

    // Marcar un episodio como no visto
    markAsUnwatched: (animeSlug, episodeNumber) => {
        const watched = watchedEpisodesService.getWatchedEpisodes();
        const episodeKey = `${animeSlug}-${episodeNumber}`;
        delete watched[episodeKey];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
    },

    // Toggle del estado de visto
    toggleWatched: (animeSlug, episodeNumber, animeTitle = '') => {
        if (watchedEpisodesService.isWatched(animeSlug, episodeNumber)) {
            watchedEpisodesService.markAsUnwatched(animeSlug, episodeNumber);
            return false;
        } else {
            watchedEpisodesService.markAsWatched(animeSlug, episodeNumber, animeTitle);
            return true;
        }
    },

    // Obtener todos los episodios vistos de un anime específico
    getAnimeWatchedEpisodes: (animeSlug) => {
        const watched = watchedEpisodesService.getWatchedEpisodes();
        const animeEpisodes = [];

        for (const key in watched) {
            if (watched[key].animeSlug === animeSlug) {
                animeEpisodes.push(watched[key]);
            }
        }

        return animeEpisodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
    },

    // Obtener el progreso de un anime (porcentaje de episodios vistos)
    getAnimeProgress: (animeSlug, totalEpisodes) => {
        const watchedEpisodes = watchedEpisodesService.getAnimeWatchedEpisodes(animeSlug);
        if (totalEpisodes === 0) return 0;
        return Math.round((watchedEpisodes.length / totalEpisodes) * 100);
    },

    // Limpiar episodios vistos de un anime
    clearAnimeProgress: (animeSlug) => {
        const watched = watchedEpisodesService.getWatchedEpisodes();
        const updated = {};

        for (const key in watched) {
            if (watched[key].animeSlug !== animeSlug) {
                updated[key] = watched[key];
            }
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
};
