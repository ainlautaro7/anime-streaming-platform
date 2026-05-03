import { Suspense, lazy, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimeProvider } from './context/AnimeContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Loader from './components/Loader';
import EpisodeModal from './components/EpisodeModal';
import ScrollToTop from './components/ScrollToTop';

import './App.css';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Popular = lazy(() => import('./pages/Popular'));
const AnimeDetail = lazy(() => import('./pages/AnimeDetail'));
const Player = lazy(() => import('./pages/Player'));
const SeasonCalendarPage = lazy(() => import('./pages/SeasonCalendarPage'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Playlists = lazy(() => import('./pages/Playlists'));
const PlaylistDetail = lazy(() => import('./pages/PlaylistDetail'));

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Router>
      <AnimeProvider>
        <ScrollToTop />
        <EpisodeModal />
        <div className="app">
          {isSidebarOpen && (
            <div
              className="mobile-sidebar-overlay"
              onClick={toggleSidebar}
            />
          )}

          <Sidebar isOpen={isSidebarOpen} closeSidebar={toggleSidebar} />
          <div className="main-layout">
            <Header isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className="content-area">
              <Suspense fallback={<Loader fullPage={false} />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/popular" element={<Popular />} />
                  <Route path="/calendar" element={<SeasonCalendarPage />} />
                  <Route path="/movies" element={<CategoryPage type="movie" title="Películas de Anime" />} />
                  <Route path="/series" element={<CategoryPage type="tv" title="Series de Anime" />} />
                  <Route path="/recent" element={<Home />} />
                  <Route path="/genres" element={<Home />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/browse" element={<SearchResults />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/playlists" element={<Playlists />} />
                  <Route path="/playlists/:id" element={<PlaylistDetail />} />
                  <Route path="/anime/:id" element={<AnimeDetail />} />
                  <Route path="/watch/:id/:episode" element={<Player />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </div>
      </AnimeProvider>
    </Router>
  );
}

export default App;
