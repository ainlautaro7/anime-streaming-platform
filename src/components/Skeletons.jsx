import './Skeletons.css';

export const SkeletonHero = () => (
    <div className="skeleton-hero animate-pulse">
        <div className="skeleton-hero-content">
            <div className="skeleton-line title"></div>
            <div className="skeleton-line description"></div>
            <div className="skeleton-line btn"></div>
        </div>
    </div>
);

export const SkeletonCard = ({ wide }) => (
    <div className={`skeleton-card animate-pulse ${wide ? 'wide' : ''}`}>
        <div className="skeleton-image"></div>
        <div className="skeleton-info">
            <div className="skeleton-line short"></div>
        </div>
    </div>
);

export const SkeletonRow = ({ wide }) => (
    <div className="skeleton-row">
        <div className="skeleton-line row-title"></div>
        <div className="skeleton-row-cards">
            {[1, 2, 3, 4, 5, 6].map((n) => (
                <SkeletonCard key={n} wide={wide} />
            ))}
        </div>
    </div>
);

export const SkeletonDetail = () => (
    <div className="skeleton-detail animate-fade">
        <div className="skeleton-hero animate-pulse"></div>
        <div className="skeleton-detail-content">
            <div className="skeleton-line row-title"></div>
            <div className="skeleton-line description"></div>
            <div className="skeleton-line description"></div>
            <div className="skeleton-line btn"></div>
        </div>
    </div>
);

export const SkeletonPlayer = () => (
    <div className="skeleton-player animate-fade">
        <div className="skeleton-player-video animate-pulse"></div>
        <div className="skeleton-player-servers">
            <div className="skeleton-line row-title"></div>
            <div className="skeleton-servers-list">
                {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton-server-btn animate-pulse"></div>
                ))}
            </div>
        </div>
    </div>
);

export const SkeletonModal = () => (
    <div className="skeleton-modal animate-fade">
        <div className="skeleton-modal-anime-info">
            <div className="skeleton-modal-poster animate-pulse"></div>
            <div className="skeleton-modal-details">
                <div className="skeleton-line title animate-pulse"></div>
                <div className="skeleton-line description animate-pulse" style={{ marginTop: '1rem' }}></div>
                <div className="skeleton-line description animate-pulse"></div>
                <div className="skeleton-line description animate-pulse"></div>
            </div>
        </div>
        <div className="skeleton-line row-title animate-pulse"></div>
        <div className="skeleton-modal-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton-episode-card animate-pulse">
                    <div className="skeleton-episode-image"></div>
                    <div className="skeleton-episode-info">
                        <div className="skeleton-line short"></div>
                        <div className="skeleton-line description" style={{ width: '60%' }}></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
