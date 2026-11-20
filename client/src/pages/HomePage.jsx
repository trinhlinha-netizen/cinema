import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { movieApi } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import MovieCard from '../components/MovieCard.jsx';
import TrailerModal from '../components/TrailerModal.jsx';
import { LoadingState, ErrorState } from '../components/StatusStates.jsx';

const HomePage = () => {
  const [trailerMovie, setTrailerMovie] = useState(null);

  const { data, loading, error, refetch } = useFetch(
    () => movieApi.getAll({ limit: 20 }),
    []
  );

  const movies = data?.data || [];

  const featuredMovie = useMemo(
    () => movies.find((m) => m.is_featured) || movies[0] || null,
    [movies]
  );

  const rankedMovies = useMemo(
    () => movies.filter((m) => m.status === 'now_showing').slice(0, 2),
    [movies]
  );

  const comingSoonMovies = useMemo(
    () => movies.filter((m) => m.status === 'coming_soon').slice(0, 4),
    [movies]
  );

  if (loading) return <LoadingState text="Đang tải danh sách phim..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="home-page">
      {/* PHIM NỔI BẬT */}
      {featuredMovie && (
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-info">
              <span className="hero-eyebrow">PHIM NỔI BẬT</span>
              <h1 className="hero-title">{featuredMovie.title}</h1>
              <p className="hero-desc">{featuredMovie.description}</p>

              <div className="hero-tags">
                <span className="tag-pill">{featuredMovie.genre}</span>
                <span className="tag-pill">{featuredMovie.duration} phút</span>
                <span className="tag-pill">Phụ đề • {featuredMovie.rating || 'P'}</span>
              </div>

              <div className="hero-actions">
                <Link to={`/movies/${featuredMovie.id}`} className="btn btn-primary">
                  Đặt vé
                </Link>
                {featuredMovie.trailer_url && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setTrailerMovie(featuredMovie)}
                  >
                    Xem trailer
                  </button>
                )}
              </div>
            </div>

            <div className="hero-media">
              <img src={featuredMovie.poster_url} alt={featuredMovie.title} />
            </div>
          </div>
        </section>
      )}

      {/* BẢNG XẾP HẠNG PHIM */}
      <section className="container section-block">
        <div className="section-header">
          <h2>BẢNG XẾP HẠNG PHIM</h2>
          <Link to="/movies?status=now_showing" className="text-link">
            Xem tất cả →
          </Link>
        </div>

        <div className="rank-grid">
          {rankedMovies.map((movie, index) => (
            <article key={movie.id} className="rank-card">
              <div className="rank-thumb-wrap">
                <img src={movie.poster_url} alt={movie.title} className="rank-thumb" />
                <span className={`rank-ribbon rank-${index + 1}`}>Top {index + 1}</span>
              </div>
              <div className="rank-info">
                <h3>{movie.title}</h3>
                <p className="muted-text">
                  {movie.duration} phút • {movie.genre}
                </p>
                <Link to={`/movies/${movie.id}`} className="btn btn-primary btn-sm">
                  Đặt vé
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CÁC PHIM SẮP LÊN SÓNG */}
      <section className="container section-block">
        <div className="section-header">
          <h2>CÁC PHIM SẮP LÊN SÓNG</h2>
          <Link to="/movies?status=coming_soon" className="text-link">
            Khám phá thêm →
          </Link>
        </div>

        <div className="movie-grid">
          {comingSoonMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onOpenTrailer={setTrailerMovie} />
          ))}
        </div>
      </section>

      <TrailerModal movie={trailerMovie} onClose={() => setTrailerMovie(null)} />
    </div>
  );
};

export default HomePage;
