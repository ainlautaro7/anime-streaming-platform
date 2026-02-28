import { NavLink } from 'react-router-dom';
import { Home, Compass, PlaySquare, Clock, Heart, Settings, LogOut, Clapperboard, ListVideo, LayoutGrid } from 'lucide-react';
import './Sidebar.css';

function Sidebar({ isOpen, closeSidebar }) {
    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Home" onClick={closeSidebar}>
                    <Home size={22} />
                </NavLink>
                <NavLink to="/browse" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Categorías" onClick={closeSidebar}>
                    <LayoutGrid size={22} />
                </NavLink>
                <NavLink to="/series" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Series" onClick={closeSidebar}>
                    <PlaySquare size={22} />
                </NavLink>
                <NavLink to="/movies" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Movies" onClick={closeSidebar}>
                    <Clapperboard size={22} />
                </NavLink>
                <NavLink to="/popular" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Popular" onClick={closeSidebar}>
                    <Compass size={22} />
                </NavLink>
                <NavLink to="/favorites" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Favorites" onClick={closeSidebar}>
                    <Heart size={22} />
                </NavLink>
                <NavLink to="/playlists" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Listas" onClick={closeSidebar}>
                    <ListVideo size={22} />
                </NavLink>
            </nav>
        </aside>
    );
}

export default Sidebar;
