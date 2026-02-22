import { useState, useEffect } from 'react';
import { X, Check, Plus } from 'lucide-react';
import { playlistsService } from '../services/playlists';
import './PlaylistModal.css';

function PlaylistModal({ anime, onClose }) {
    const [playlists, setPlaylists] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistDescription, setNewPlaylistDescription] = useState('');

    useEffect(() => {
        setPlaylists(playlistsService.getPlaylists());
    }, []);

    const handleTogglePlaylist = (playlistId) => {
        const isInPlaylist = playlistsService.isInPlaylist(playlistId, anime.id);

        if (isInPlaylist) {
            playlistsService.removeFromPlaylist(playlistId, anime.id);
        } else {
            playlistsService.addToPlaylist(playlistId, anime);
        }

        // Refresh playlists
        setPlaylists(playlistsService.getPlaylists());
    };

    const handleCreatePlaylist = (e) => {
        e.preventDefault();

        if (newPlaylistName.trim()) {
            const newPlaylist = playlistsService.createPlaylist(
                newPlaylistName,
                newPlaylistDescription
            );

            // Add current anime to the new playlist
            playlistsService.addToPlaylist(newPlaylist.id, anime);

            // Reset form and refresh
            setNewPlaylistName('');
            setNewPlaylistDescription('');
            setShowCreateForm(false);
            setPlaylists(playlistsService.getPlaylists());
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="playlist-modal-backdrop" onClick={handleBackdropClick}>
            <div className="playlist-modal">
                <div className="playlist-modal-header">
                    <h2>Agregar a lista de reproducción</h2>
                    <button className="playlist-modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="playlist-modal-anime-info">
                    <img src={anime.cover} alt={anime.title} />
                    <div>
                        <h3>{anime.title}</h3>
                        <p>{anime.type}</p>
                    </div>
                </div>

                <div className="playlist-modal-content">
                    {playlists.length > 0 ? (
                        <div className="playlist-modal-list">
                            <h3>Tus listas</h3>
                            {playlists.map((playlist) => {
                                const isInPlaylist = playlistsService.isInPlaylist(playlist.id, anime.id);
                                return (
                                    <div
                                        key={playlist.id}
                                        className={`playlist-item ${isInPlaylist ? 'active' : ''}`}
                                        onClick={() => handleTogglePlaylist(playlist.id)}
                                    >
                                        <div className="playlist-item-info">
                                            <h4>{playlist.name}</h4>
                                            <p>{playlist.items.length} {playlist.items.length === 1 ? 'anime' : 'animes'}</p>
                                        </div>
                                        <div className="playlist-item-checkbox">
                                            {isInPlaylist && <Check size={20} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="playlist-modal-empty">
                            <p>No tienes listas de reproducción aún</p>
                        </div>
                    )}

                    {!showCreateForm ? (
                        <button
                            className="playlist-modal-create-button"
                            onClick={() => setShowCreateForm(true)}
                        >
                            <Plus size={20} />
                            Crear nueva lista
                        </button>
                    ) : (
                        <form className="playlist-create-form" onSubmit={handleCreatePlaylist}>
                            <h3>Nueva lista de reproducción</h3>
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
                            <div className="playlist-create-form-actions">
                                <button
                                    type="button"
                                    className="playlist-cancel-button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setNewPlaylistName('');
                                        setNewPlaylistDescription('');
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="playlist-submit-button">
                                    Crear lista
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PlaylistModal;
