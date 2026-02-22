import './Loader.css';

function Loader({ fullPage = true }) {
    return (
        <div className={`loader-container ${fullPage ? 'full-page' : ''}`}>
            <div className="spinner"></div>
        </div>
    );
}

export default Loader;
