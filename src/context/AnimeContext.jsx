import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AnimeContext = createContext();

export function AnimeProvider({ children }) {
    const navigate = useNavigate();
    const [currentAnime, setCurrentAnime] = useState(null);
    const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
    const [selectedAnime, setSelectedAnime] = useState(null);
    const [activeGenres, setActiveGenres] = useState([]);
    const [allAnimes, setAllAnimes] = useState([]); // Master list for client-side filtering
    const [browseCache, setBrowseCache] = useState({
        params: null,
        results: [],
        page: 1,
        hasNextPage: false
    });

    const addAnimes = (newAnimes) => {
        setAllAnimes(prev => {
            const existingIds = new Set(prev.map(a => a.id));
            const uniqueNew = newAnimes.filter(a => !existingIds.has(a.id));
            return [...prev, ...uniqueNew];
        });
    };

    const openEpisodeModal = (anime) => {
        if ((anime?.type || '').toLowerCase() === 'movie') {
            setCurrentAnime(anime);
            navigate(`/watch/${anime.slug || anime.id}/1`);
            return;
        }

        setSelectedAnime(anime);
        setIsEpisodeModalOpen(true);
    };

    const closeEpisodeModal = () => {
        setIsEpisodeModalOpen(false);
        setSelectedAnime(null);
    };

    return (
        <AnimeContext.Provider value={{
            currentAnime,
            setCurrentAnime,
            isEpisodeModalOpen,
            selectedAnime,
            openEpisodeModal,
            closeEpisodeModal,
            activeGenres,
            setActiveGenres,
            allAnimes,
            addAnimes,
            browseCache,
            setBrowseCache
        }}>
            {children}
        </AnimeContext.Provider>
    );

}



// eslint-disable-next-line react-refresh/only-export-components
export function useAnime() {
    const context = useContext(AnimeContext);
    if (!context) {
        throw new Error('useAnime must be used within AnimeProvider');
    }
    return context;
}
