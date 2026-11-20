import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie, onOpenTrailer }) => {
  return (
    <article className="movie-card">
      <Link to={`/movies/${movie.id}`} className="movie-poster-wrap">
        <img src={movie.poster_url} alt={movie.title} className="movie-poster" loading="lazy" />
        <span className="rating-badge">{movie.rating || 'P'}</span>
        {movie.rank_order && (
          <span className={`rank-ribbon rank-${movie.rank_order}`}>Top {movie.rank_order}</span>
        )}
      </Link>

      <div className="movie-card-body">
        <h3 className="movie-card-title">
          <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
        </h3>
        <p className="movie-card-meta">
          {movie.duration} phút • {movie.genre}
        </p>

        <div className="movie-card-actions">
          <Link to={`/movies/${movie.id}`} className="btn btn-primary btn-sm">
            Đặt vé
          </Link>
          {movie.trailer_url && onOpenTrailer && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenTrailer(movie)}
            >
              Trailer
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default MovieCard;
