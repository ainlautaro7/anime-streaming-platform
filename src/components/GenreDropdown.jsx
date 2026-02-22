import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './GenreDropdown.css';

function GenreDropdown({
    genres,
    selectedGenreIds = [],
    onSelect,
    label = 'Géneros',
    icon = true,
    className = '',
    showCount = true
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    // Find names for selected genres
    const selectedGenres = genres.filter(g => selectedGenreIds.includes(String(g.mal_id)));
    const displayLabel = selectedGenres.length > 0
        ? `${selectedGenres.length} seleccionados`
        : label;

    const toggleGenre = (genre) => {
        onSelect(genre);
    };

    const handleClear = () => {
        onSelect(null);
    };

    const filteredGenres = genres.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <div className={`genre-filter-container ${className}`}>
            <button
                className={`filter-dropdown ${isOpen ? 'active' : ''} ${selectedGenres.length > 0 ? 'has-selection' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {displayLabel}
                {icon && <ChevronDown size={18} className={isOpen ? 'rotate-180' : ''} />}
            </button>

            {isOpen && (
                <div className="genre-dropdown-menu">
                    <div className="genre-dropdown-header">
                        <input
                            type="text"
                            className="genre-search-box"
                            placeholder="Buscar género..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="genre-items-list">
                        {filteredGenres.map(genre => {
                            const isSelected = selectedGenreIds.includes(String(genre.mal_id));
                            return (
                                <button
                                    key={genre.mal_id}
                                    className={`genre-item ${isSelected ? 'active' : ''}`}
                                    onClick={() => toggleGenre(genre)}
                                >
                                    <div className="genre-checkbox">
                                        {isSelected && <div className="genre-checkbox-inner" />}
                                    </div>
                                    <span className="genre-name-text">
                                        {genre.name} {showCount && <span className="genre-count-text">({genre.count})</span>}
                                    </span>
                                </button>
                            );
                        })}
                        {filteredGenres.length === 0 && (
                            <div className="no-genres-found">No se encontraron resultados</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}



export default GenreDropdown;
