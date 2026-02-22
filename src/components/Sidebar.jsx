import { NavLink } from 'react-router-dom';
import { Home, Compass, PlaySquare, Clock, Heart, Settings, LogOut, Clapperboard, ListVideo, LayoutGrid } from 'lucide-react';
import './Sidebar.css';

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">S</div>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Home">
                    <Home size={22} />
                </NavLink>
                <NavLink to="/browse" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Categorías">
                    <LayoutGrid size={22} />
                </NavLink>
                <NavLink to="/series" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Series">
                    <PlaySquare size={22} />
                </NavLink>
                <NavLink to="/movies" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Movies">
                    <Clapperboard size={22} />
                </NavLink>
                <NavLink to="/popular" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Popular">
                    <Compass size={22} />
                </NavLink>
                <NavLink to="/favorites" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Favorites">
                    <Heart size={22} />
                </NavLink>
                <NavLink to="/playlists" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Listas">
                    <ListVideo size={22} />
                </NavLink>
            </nav>
        </aside>
    );
}

export default Sidebar;
