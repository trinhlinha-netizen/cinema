import React, { useEffect } from 'react';

const TrailerModal = ({ movie, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Trailer ${movie.title}`}>
      <div className="modal-content modal-trailer" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Trailer — {movie.title}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Đóng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="trailer-frame-wrap">
          <iframe
            src={movie.trailer_url}
            title={`Trailer ${movie.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
