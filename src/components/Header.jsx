import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Settings, ChevronDown, ArrowLeft } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';
import './Header.css';

function Header({ isSidebarOpen, toggleSidebar }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { currentAnime } = useAnime();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAnimePage = location.pathname.startsWith('/anime/') || location.pathname.startsWith('/watch/');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Inicio';
    if (path.startsWith('/popular')) return 'Populares';
    if (path.startsWith('/series')) return 'Series';
    if (path.startsWith('/movies')) return 'Películas';
    if (path.startsWith('/search')) return 'Búsqueda';
    if (path.startsWith('/favorites')) return 'Mis Favoritos';
    if (path.startsWith('/anime/')) return currentAnime ? currentAnime.title : 'Detalles';
    if (path.startsWith('/watch/')) return currentAnime ? currentAnime.title : 'Reproductor';
    return '';
  };

  return (
    <header className={`header ${scrolled || isAnimePage ? 'scrolled' : ''}`}>
      <div className="header-container">
        {getPageTitle() && (
          <div className="header-info">
            {(location.pathname.startsWith('/watch/') || location.pathname.startsWith('/anime/')) && (
              <button
                className="header-back-btn"
                onClick={() => navigate(-1)}
                title="Volver"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <span className="current-module">{getPageTitle()}</span>
          </div>
        )}
        {/* <div className="header-nav-main">
          <NavLink to="/" className="header-nav-link">Home</NavLink>
          <NavLink to="/browse" className="header-nav-link">Browse</NavLink>
          <NavLink to="/series" className="header-nav-link">Series</NavLink>
          <NavLink to="/movies" className="header-nav-link">Movies</NavLink>
          <NavLink to="/faq" className="header-nav-link">FAQ</NavLink>
        </div> */}

        <div className="header-actions">
          <div className={`search-bar ${isSearchOpen ? 'active' : ''}`}>
            <Search size={18} className="search-icon" onClick={() => setIsSearchOpen(true)} />
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => !searchQuery && setIsSearchOpen(false)}
                autoFocus={isSearchOpen}
              />
            </form>
          </div>

          {/* <button className="icon-btn">
            <Settings size={20} />
          </button>

          <div className="user-profile-mini">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" />
            <ChevronDown size={14} />
          </div> */}

          <button
            className="mobile-menu-toggle"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
