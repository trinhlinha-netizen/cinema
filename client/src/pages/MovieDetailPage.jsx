import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { movieApi } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import TrailerModal from '../components/TrailerModal.jsx';
import { LoadingState, EmptyState, ErrorState } from '../components/StatusStates.jsx';

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);

  const { data, loading, error, refetch } = useFetch(() => movieApi.getById(id), [id]);
  const movie = data?.data;

  // Nhóm các suất chiếu theo ngày
  const groupedShowtimes = useMemo(() => {
    const groups = {};
    (movie?.showtimes || []).forEach((st) => {
      if (!groups[st.show_date]) groups[st.show_date] = [];
      groups[st.show_date].push(st);
    });
    return groups;
  }, [movie]);

  if (loading) return <LoadingState text="Đang tải chi tiết phim..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!movie) return <EmptyState text="Không tìm thấy thông tin phim." />;

  const dates = Object.keys(groupedShowtimes);

  return (
    <section className="container section-block">
      <Link to="/movies" className="back-link">
        ← Quay lại danh sách phim
      </Link>

      <div className="detail-grid">
        <div className="detail-poster">
          <img src={movie.poster_url} alt={movie.title} />
        </div>

        <div className="detail-info">
          <div className="hero-tags">
            <span className="tag-pill">{movie.rating || 'P'}</span>
            <span className="tag-pill">{movie.genre}</span>
            <span className="tag-pill">{movie.duration} phút</span>
            <span className="tag-pill">
              {movie.status === 'now_showing' ? 'Đang chiếu' : 'Sắp chiếu'}
            </span>
          </div>

          <h1 className="detail-title">{movie.title}</h1>
          <p className="detail-desc">{movie.description}</p>
          <p className="muted-text">Ngày phát hành: {movie.release_date}</p>

          {movie.trailer_url && (
            <div className="detail-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowTrailer(true)}>
                Xem trailer YouTube
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lịch chiếu theo ngày */}
      <div className="showtimes-section">
        <h2>Chọn suất chiếu</h2>
        {dates.length === 0 ? (
          <EmptyState text="Phim hiện chưa có suất chiếu sắp tới." />
        ) : (
          dates.map((dateStr) => (
            <div key={dateStr} className="showtime-date-group">
              <h3 className="showtime-date-title">Ngày {dateStr}</h3>
              <div className="showtime-list">
                {groupedShowtimes[dateStr].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    className="showtime-chip"
                    onClick={() => navigate(`/booking/${st.id}`)}
                  >
                    <span className="showtime-hour">
                      {st.start_time.slice(0, 5)} - {st.end_time.slice(0, 5)}
                    </span>
                    <span className="showtime-meta">
                      {st.room_name} • {st.screen_type}
                    </span>
                    <span className="showtime-price">
                      Từ {Number(st.base_price).toLocaleString('vi-VN')}đ
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <TrailerModal movie={showTrailer ? movie : null} onClose={() => setShowTrailer(false)} />
    </section>
  );
};

export default MovieDetailPage;
