import { useState, useEffect, useRef, useCallback } from 'react';
import Hero from '../components/Hero';
import AnimeCard from '../components/AnimeCard';
import { api } from '../services/api';
import { Grid, List, ChevronDown } from 'lucide-react';
import { SkeletonHero, SkeletonCard } from '../components/Skeletons';
import Loader from '../components/Loader';
import './Popular.css'; // Reusing Popular.css for consistency

function CategoryPage({ type, title }) {
    const [animes, setAnimes] = useState([]);
    const [featuredAnimes, setFeaturedAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [viewMode, setViewMode] = useState('grid');


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

    // Reset when type changes
    useEffect(() => {
        setAnimes([]);
        setFeaturedAnimes([]);
        setPage(1);
    }, [type]);

    useEffect(() => {
        const fetchAnimes = async () => {
            if (page === 1) setLoading(true);
            else setLoadingMore(true);

            try {
                const result = await api.getPopularAnime(type, page);

                if (page === 1) {
                    setAnimes(result.data);
                    if (result.data.length > 0) {
                        setFeaturedAnimes([result.data[0]]);
                    }
                } else {
                    setAnimes(prev => [...prev, ...result.data]);
                }

                setHasNextPage(result.pagination?.has_next_page || false);
            } catch (error) {
                console.error(`Error fetching category ${type}:`, error);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        };

        fetchAnimes();
    }, [type, page]);

    if (loading && page === 1) {
        return (
            <div className="popular-page animate-fade">
                <SkeletonHero />
                <div className="page-container">
                    <div className="popular-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <SkeletonCard key={n} wide />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="popular-page animate-fade">
            {featuredAnimes.length > 0 && <Hero animes={featuredAnimes} />}

            <div className="page-container">
                <div className="page-section-header">
                    <div className="header-left">
                        <h1 className="page-title">{title}</h1>
                        <button className="filter-dropdown">
                            Genres
                            <ChevronDown size={18} />
                        </button>
                    </div>
                    <div className="view-toggles">
                        <button
                            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Vista cuadrícula"
                        >
                            <Grid size={20} />
                        </button>
                        <button
                            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="Vista lista"
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {animes.length > 0 ? (
                    <>
                        <div className={`popular-${viewMode}`}>
                            {animes.map((anime, index) => {
                                if (index === 0) return null;

                                if (animes.length === index + 1) {
                                    return (
                                        <div ref={lastAnimeElementRef} key={anime.id}>
                                            <AnimeCard anime={anime} layout={viewMode} wide={viewMode === 'grid'} />
                                        </div>
                                    );
                                } else {
                                    return <AnimeCard key={anime.id} anime={anime} layout={viewMode} wide={viewMode === 'grid'} />;
                                }

                            })}
                        </div>


                        {loadingMore && (
                            <div className="loading-more">
                                <Loader fullPage={false} />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-results">
                        <p>No se encontraron resultados para esta sección.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CategoryPage;
