import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import AnimeRow from '../components/AnimeRow';
import { api } from '../services/api';
import { SkeletonHero, SkeletonRow } from '../components/Skeletons';
import './Home.css';

function Home() {
  const [latestEpisodes, setLatestEpisodes] = useState([]);
  const [airingAnime, setAiringAnime] = useState([]);
  const [popularAnime, setPopularAnime] = useState([]);
  const [featuredAnimes, setFeaturedAnimes] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch data sequentially to respect Jikan's rate limits
        const latest = await api.getLatestEpisodes();
        setLatestEpisodes(latest);

        const airing = await api.getAiringAnime();
        setAiringAnime(airing);
        if (airing.length > 0) {
          setFeaturedAnimes(airing.slice(0, 5)); // Restore slider for Home
        }

        const popular = await api.getPopularAnime();
        setPopularAnime(popular.data);
      } catch (error) {
        console.error('Error fetching data for Home:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="home animate-fade">
        <SkeletonHero />
        <div className="page-container" style={{ marginTop: '4rem' }}>
          <SkeletonRow wide />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    );
  }

  return (
    <div className="home animate-fade">
      {featuredAnimes.length > 0 && <Hero animes={featuredAnimes} />}

      <div className="page-container">
        <div className="home-sections" style={{ marginTop: '4rem' }}>
          <AnimeRow title="POPULARES" animes={popularAnime} showSeeAll />
          <AnimeRow title="ÚLTIMOS EPISODIOS" animes={latestEpisodes} />
          <AnimeRow title="EN EMISIÓN" animes={airingAnime.slice(1)} />
        </div>
      </div>
    </div>
  );
}

export default Home;
