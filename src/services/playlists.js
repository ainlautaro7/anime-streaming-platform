// Simple UUID generator
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const STORAGE_KEY = 'anime_playlists';

export const playlistsService = {
    // Get all playlists
    getPlaylists: () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    // Get a single playlist by ID
    getPlaylistById: (playlistId) => {
        const playlists = playlistsService.getPlaylists();
        return playlists.find(p => p.id === playlistId);
    },

    // Create a new playlist
    createPlaylist: (name, description = '') => {
        const playlists = playlistsService.getPlaylists();
        const newPlaylist = {
            id: generateId(),
            name: name.trim(),
            description: description.trim(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            items: []
        };
        const updated = [...playlists, newPlaylist];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return newPlaylist;
    },

    // Update playlist metadata (name, description)
    updatePlaylist: (playlistId, updates) => {
        const playlists = playlistsService.getPlaylists();
        const updated = playlists.map(playlist => {
            if (playlist.id === playlistId) {
                return {
                    ...playlist,
                    ...updates,
                    updatedAt: Date.now()
                };
            }
            return playlist;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },

    // Add anime to a playlist
    addToPlaylist: (playlistId, anime) => {
        const playlists = playlistsService.getPlaylists();
        const updated = playlists.map(playlist => {
            if (playlist.id === playlistId) {
                // Check if anime already exists in playlist
                if (!playlist.items.some(item => item.id === anime.id)) {
                    return {
                        ...playlist,
                        items: [...playlist.items, {
                            id: anime.id,
                            title: anime.title,
                            cover: anime.cover,
                            rating: anime.rating,
                            type: anime.type,
                            slug: anime.id,
                            addedAt: Date.now()
                        }],
                        updatedAt: Date.now()
                    };
                }
            }
            return playlist;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },

    // Remove anime from playlist
    removeFromPlaylist: (playlistId, animeId) => {
        const playlists = playlistsService.getPlaylists();
        const updated = playlists.map(playlist => {
            if (playlist.id === playlistId) {
                return {
                    ...playlist,
                    items: playlist.items.filter(item => item.id !== animeId),
                    updatedAt: Date.now()
                };
            }
            return playlist;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },

    // Delete entire playlist
    deletePlaylist: (playlistId) => {
        const playlists = playlistsService.getPlaylists();
        const updated = playlists.filter(p => p.id !== playlistId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },

    // Check if anime is in a specific playlist
    isInPlaylist: (playlistId, animeId) => {
        const playlist = playlistsService.getPlaylistById(playlistId);
        return playlist ? playlist.items.some(item => item.id === animeId) : false;
    },

    // Get playlists containing specific anime
    getPlaylistsWithAnime: (animeId) => {
        const playlists = playlistsService.getPlaylists();
        return playlists.filter(playlist =>
            playlist.items.some(item => item.id === animeId)
        );
    }
};
