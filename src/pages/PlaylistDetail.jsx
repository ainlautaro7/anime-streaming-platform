import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, ListVideo } from 'lucide-react';
import { playlistsService } from '../services/playlists';
import AnimeCard from '../components/AnimeCard';
import './Playlists.css';

function PlaylistDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    useEffect(() => {
        loadPlaylist();
    }, [id]);

    const loadPlaylist = () => {
        const data = playlistsService.getPlaylistById(id);
        if (data) {
            setPlaylist(data);
            setEditName(data.name);
            setEditDescription(data.description || '');
        } else {
            navigate('/playlists');
        }
    };

    const handleRemoveAnime = (animeId) => {
        if (confirm('¿Quieres quitar este anime de la lista?')) {
            playlistsService.removeFromPlaylist(id, animeId);
            loadPlaylist();
        }
    };

    const handleUpdatePlaylist = (e) => {
        e.preventDefault();
        playlistsService.updatePlaylist(id, {
            name: editName,
            description: editDescription
        });
        setIsEditing(false);
        loadPlaylist();
    };

    const handleDeletePlaylist = () => {
        if (confirm('¿Estás seguro de que quieres eliminar esta lista?')) {
            playlistsService.deletePlaylist(id);
            navigate('/playlists');
        }
    };

    if (!playlist) {
        return (
            <div className="playlists-page page-container animate-fade">
                <div className="empty-state">
                    <ListVideo size={64} opacity={0.2} />
                    <p>Lista no encontrada</p>
                </div>
            </div>
        );
    }

    return (
        <div className="playlists-page page-container animate-fade">
            <div className="playlist-detail-header">
                <button className="back-button" onClick={() => navigate('/playlists')}>
                    <ArrowLeft size={20} />
                    Volver
                </button>

                {isEditing ? (
                    <form onSubmit={handleUpdatePlaylist} className="playlist-edit-form">
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            maxLength={50}
                            required
                            autoFocus
                        />
                        <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Descripción (opcional)"
                            maxLength={200}
                            rows={2}
                        />
                        <div className="playlist-edit-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditName(playlist.name);
                                    setEditDescription(playlist.description || '');
                                }}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="submit-button">
                                Guardar
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="playlist-detail-info">
                            <h1 className="page-title">{playlist.name}</h1>
                            {playlist.description && (
                                <p className="page-subtitle">{playlist.description}</p>
                            )}
                            <p className="playlist-meta">
                                {playlist.items.length} {playlist.items.length === 1 ? 'anime' : 'animes'}
                            </p>
                        </div>
                        <div className="playlist-detail-actions">
                            <button
                                className="edit-button"
                                onClick={() => setIsEditing(true)}
                                title="Editar lista"
                            >
                                <Edit2 size={20} />
                            </button>
                            <button
                                className="delete-button"
                                onClick={handleDeletePlaylist}
                                title="Eliminar lista"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {playlist.items.length === 0 ? (
                <div className="empty-state">
                    <ListVideo size={64} opacity={0.2} />
                    <p>Esta lista está vacía</p>
                    <p className="empty-subtitle">Agrega animes desde sus páginas de detalles</p>
                </div>
            ) : (
                <div className="anime-grid">
                    {playlist.items.map((anime) => (
                        <div key={anime.id} className="playlist-anime-item">
                            <AnimeCard anime={anime} wide />
                            <button
                                className="remove-anime-button"
                                onClick={() => handleRemoveAnime(anime.id)}
                                title="Quitar de la lista"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PlaylistDetail;
