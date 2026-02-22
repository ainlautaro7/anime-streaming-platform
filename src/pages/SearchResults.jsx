import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAnime } from '../context/AnimeContext';
import { api } from '../services/api';
import Loader from '../components/Loader';
import Hero from '../components/Hero';
import { SkeletonCard, SkeletonHero } from '../components/Skeletons';
import AnimeGrid from '../components/AnimeGrid';
import GenreDropdown from '../components/GenreDropdown';
import './SearchResults.css';

function BrowseResults() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { activeGenres, setActiveGenres, allAnimes, addAnimes, browseCache, setBrowseCache } = useAnime();
    const query = searchParams.get('q');
    const genreIds = searchParams.get('genre')?.split(',').filter(Boolean) || [];
    const genreTitles = searchParams.get('title')?.split(',').filter(Boolean) || [];

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);

    // Genre management
    const [genres, setGenres] = useState([]);
    const [genreSearch, setGenreSearch] = useState('');

    const observer = useRef();
    const lastAnimeElementRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasNextPage]);

    // Fetch genres once
    useEffect(() => {
        const fetchGenres = async () => {
            const list = await api.getGenres();
            setGenres(list);
        };
        fetchGenres();
    }, []);

    // Sync URL -> Context
    useEffect(() => {
        if (genreIds.length > 0 && genreTitles.length > 0) {
            const genresFromUrl = genreIds.map((id, index) => ({
                mal_id: id,
                name: genreTitles[index] || 'Genre'
            }));
            setActiveGenres(genresFromUrl);
        } else {
            setActiveGenres([]);
        }
    }, [searchParams.get('genre'), searchParams.get('title')]);

    // Client-side filtering from Context
    useEffect(() => {
        if (query) return; // Search results are handled separately by API

        if (genreIds.length === 0) {
            setResults([]);
            return;
        }

        // Intersection filter: anime must have ALL selected genres
        // Note: api returns animes with genres as names array. 
        // Our IDs are mal_ids. We need to match names if we don't have mal_ids in the anime objects.
        // Looking at api.js, item.genres is names array.
        const filtered = allAnimes.filter(anime => {
            return genreTitles.every(selectedTitle =>
                anime.genres.some(tg => tg.toLowerCase() === selectedTitle.toLowerCase())
            );
        });

        setResults(filtered);
    }, [allAnimes, searchParams.get('genre'), searchParams.get('title'), query]);

    // Restore from Context if visiting /browse without params
    useEffect(() => {
        if (!query && genreIds.length === 0 && activeGenres.length > 0) {
            const ids = activeGenres.map(g => g.mal_id).join(',');
            const titles = activeGenres.map(g => g.name).join(',');
            navigate(`/browse?genre=${ids}&title=${encodeURIComponent(titles)}`, { replace: true });
        }
    }, [activeGenres]);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query && genreIds.length === 0) {
                setLoading(false);
                return;
            }

            // If we have results and we are not on page 1, we are loading more
            const isInitialFetch = page === 1;

            // If filtering locally and we have some results, we might still want to fetch from API 
            // for the current genre combination to feed the Context.

            if (isInitialFetch) setLoading(true);
            else setLoadingMore(true);

            try {
                let data;
                if (query) {
                    data = await api.searchAnime(query, page);
                    const newItems = data?.media || data?.data || [];
                    if (isInitialFetch) setResults(newItems);
                    else setResults(prev => [...prev, ...newItems]);
                } else if (genreIds.length > 0) {
                    // Fetch for the specific genre combination (Jikan supports comma IDs for intersection)
                    data = await api.getAnimeByGenre(genreIds.join(','), page);
                    const fetchedItems = data?.data || [];

                    // Always add to master context list
                    addAnimes(fetchedItems);
                }

                setHasNextPage(data?.pagination?.has_next_page || false);

            } catch (error) {
                console.error('Error fetching results:', error);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        };

        fetchResults();
    }, [query, searchParams.get('genre'), page]); // Trigger on genre change or page change

    const handleGenreSelect = (genre) => {
        if (!genre) {
            setActiveGenres([]);
            navigate('/browse', { replace: true });
            return;
        }

        // Toggle logic
        const idStr = String(genre.mal_id);
        const isAlreadySelected = genreIds.includes(idStr);
        let newGenreIds, newGenreTitles;

        if (isAlreadySelected) {
            newGenreIds = genreIds.filter(id => id !== idStr);
            newGenreTitles = genreTitles.filter((_, i) => genreIds[i] !== idStr);
        } else {
            newGenreIds = [...genreIds, idStr];
            newGenreTitles = [...genreTitles, genre.name];
        }

        if (newGenreIds.length === 0) {
            setActiveGenres([]);
            navigate('/browse', { replace: true });
        } else {
            navigate(`/browse?genre=${newGenreIds.join(',')}&title=${encodeURIComponent(newGenreTitles.join(','))}`, { replace: true });
        }
    };




    const getPageTitle = () => {
        if (query) return <>Resultados para: <span>{query}</span></>;
        if (genreTitles.length > 0) {
            return (
                <>
                    Géneros: {genreTitles.map((t, i) => (
                        <span key={i}>{t}{i < genreTitles.length - 1 ? ', ' : ''}</span>
                    ))}
                </>
            );
        }
        return 'Categorías';
    };


    // Render Categories List view if no specific filter
    if (!query && genreIds.length === 0) {
        return (
            <div className="search-results-page animate-fade">
                <div className="page-container">
                    <div className="page-section-header">
                        <h1 className="page-title">{getPageTitle()}</h1>
                    </div>
                    {/* Reuse skeleton if genres loading (though usually fast) */}
                    {genres.length === 0 ? <Loader fullPage={false} /> : (
                        <>
                            <div className="genre-search-container">
                                <input
                                    type="text"
                                    placeholder="Buscar categoría..."
                                    className="genre-search-input"
                                    value={genreSearch}
                                    onChange={(e) => setGenreSearch(e.target.value)}
                                />
                            </div>
                            <div className="categories-grid">
                                {genres
                                    .filter(g => g.name.toLowerCase().includes(genreSearch.toLowerCase()))
                                    .map(genre => (
                                        <button
                                            key={genre.mal_id}
                                            className="category-card"
                                            onClick={() => handleGenreSelect(genre)}
                                        >
                                            <span className="category-name">{genre.name}</span>
                                            <span className="category-count">{genre.count} animes</span>
                                        </button>
                                    ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    if (loading && results.length === 0 && page === 1) {
        return (
            <div className="search-results-page animate-fade">
                <SkeletonHero />
                <div className="page-container">
                    <div className="search-results-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <SkeletonCard key={n} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="search-results-page animate-fade">
            {results.length > 0 && <Hero animes={[results[0]]} />}

            <div className="page-container">
                <div className="page-section-header with-actions">
                    <div className="header-title-group">
                        <h1 className="page-title">
                            {getPageTitle()}
                        </h1>

                        {/* Genre Dropdown in Header */}
                        <div className="header-genre-filter">
                            <GenreDropdown
                                genres={genres}
                                selectedGenreIds={genreIds}
                                onSelect={handleGenreSelect}
                                label={genreTitles.length > 0 ? `${genreTitles.length} seleccionados` : 'Filtrar'}
                                className="header-variant"
                                showCount={false}
                            />
                        </div>

                    </div>
                </div>

                {results.length > 0 ? (
                    <>
                        <AnimeGrid
                            animes={results}
                            lastElementRef={lastAnimeElementRef}
                        />

                        {loadingMore && (
                            <div className="loading-more">
                                <Loader fullPage={false} />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-results">
                        <p>No se encontraron animes para esta selección.</p>
                        <button className="btn-primary" onClick={() => navigate('/browse')}>
                            Ver Categorías
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BrowseResults;
