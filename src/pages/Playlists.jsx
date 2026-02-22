import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListVideo, Plus, Trash2 } from 'lucide-react';
import { playlistsService } from '../services/playlists';
import './Playlists.css';

function Playlists() {
    const [playlists, setPlaylists] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadPlaylists();
    }, []);

    const loadPlaylists = () => {
        setPlaylists(playlistsService.getPlaylists());
    };

    const handleCreatePlaylist = (e) => {
        e.preventDefault();

        if (newPlaylistName.trim()) {
            playlistsService.createPlaylist(newPlaylistName, newPlaylistDescription);
            setNewPlaylistName('');
            setNewPlaylistDescription('');
            setShowCreateForm(false);
            loadPlaylists();
        }
    };

    const handleDeletePlaylist = (e, playlistId) => {
        e.stopPropagation();

        if (confirm('¿Estás seguro de que quieres eliminar esta lista?')) {
            playlistsService.deletePlaylist(playlistId);
            loadPlaylists();
        }
    };

    const handlePlaylistClick = (playlistId) => {
        navigate(`/playlists/${playlistId}`);
    };

    return (
        <div className="playlists-page page-container animate-fade">
            <div className="page-section-header">
                <div>
                    <h1 className="page-title">Mis Listas de Reproducción</h1>
                    <p className="page-subtitle">Organiza tus animes favoritos en listas personalizadas</p>
                </div>
                <button
                    className="create-playlist-button"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    <Plus size={20} />
                    Nueva Lista
                </button>
            </div>

            {showCreateForm && (
                <div className="playlist-create-card">
                    <form onSubmit={handleCreatePlaylist}>
                        <h3>Crear Nueva Lista</h3>
                        <input
                            type="text"
                            placeholder="Nombre de la lista"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            maxLength={50}
                            required
                            autoFocus
                        />
                        <textarea
                            placeholder="Descripción (opcional)"
                            value={newPlaylistDescription}
                            onChange={(e) => setNewPlaylistDescription(e.target.value)}
                            maxLength={200}
                            rows={3}
                        />
                        <div className="playlist-create-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setNewPlaylistName('');
                                    setNewPlaylistDescription('');
                                }}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="submit-button">
                                Crear Lista
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {playlists.length === 0 ? (
                <div className="empty-state">
                    <ListVideo size={64} opacity={0.2} />
                    <p>No tienes listas de reproducción.</p>
                    <p className="empty-subtitle">Crea tu primera lista para organizar tus animes</p>
                </div>
            ) : (
                <div className="playlists-grid">
                    {playlists.map((playlist) => (
                        <div
                            key={playlist.id}
                            className="playlist-card"
                            onClick={() => handlePlaylistClick(playlist.id)}
                        >
                            <div className="playlist-card-thumbnails">
                                {playlist.items.length > 0 ? (
                                    <div className="playlist-thumbnails-grid">
                                        {playlist.items.slice(0, 4).map((item, index) => (
                                            <img
                                                key={index}
                                                src={item.cover}
                                                alt={item.title}
                                            />
                                        ))}
                                        {playlist.items.length < 4 && (
                                            Array.from({ length: 4 - playlist.items.length }).map((_, index) => (
                                                <div key={`empty-${index}`} className="empty-thumbnail">
                                                    <ListVideo size={24} opacity={0.2} />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    <div className="playlist-empty-thumbnail">
                                        <ListVideo size={48} opacity={0.2} />
                                    </div>
                                )}
                            </div>
                            <div className="playlist-card-info">
                                <h3>{playlist.name}</h3>
                                {playlist.description && (
                                    <p className="playlist-description">{playlist.description}</p>
                                )}
                                <p className="playlist-count">
                                    {playlist.items.length} {playlist.items.length === 1 ? 'anime' : 'animes'}
                                </p>
                            </div>
                            <button
                                className="playlist-delete-button"
                                onClick={(e) => handleDeletePlaylist(e, playlist.id)}
                                title="Eliminar lista"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Playlists;
