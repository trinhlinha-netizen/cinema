import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieApi } from '../services/api.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useFetch } from '../hooks/useFetch.js';
import MovieCard from '../components/MovieCard.jsx';
import Pagination from '../components/Pagination.jsx';
import TrailerModal from '../components/TrailerModal.jsx';
import { LoadingState, EmptyState, ErrorState } from '../components/StatusStates.jsx';

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [trailerMovie, setTrailerMovie] = useState(null);

  const searchInputRef = useRef(null);
  const debouncedSearch = useDebounce(searchText, 400);

  const { data, loading, error, refetch } = useFetch(
    () =>
      movieApi.getAll({
        search: debouncedSearch,
        genre: genre === 'all' ? '' : genre,
        status,
        date,
        page,
        limit: 8
      }),
    [debouncedSearch, genre, status, date, page]
  );

  const movies = data?.data || [];
  const genres = data?.genres || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleResetFilters = () => {
    setSearchText('');
    setGenre('all');
    setStatus('');
    setDate('');
    setPage(1);
    setSearchParams({});
    searchInputRef.current?.focus();
  };

  return (
    <section className="container section-block">
      <div className="page-heading">
        <h1>Danh sách phim & Lịch chiếu</h1>
        <p className="muted-text">Tìm kiếm theo tên, lọc theo thể loại hoặc chọn ngày chiếu bạn mong muốn.</p>
      </div>

      {/* Bộ lọc */}
      <form className="filter-bar" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label htmlFor="movie-search">Tìm theo tên phim</label>
          <input
            ref={searchInputRef}
            id="movie-search"
            type="text"
            placeholder="Nhập tên phim..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="movie-status">Trạng thái</label>
          <select
            id="movie-status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả</option>
            <option value="now_showing">Đang chiếu</option>
            <option value="coming_soon">Sắp chiếu</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="movie-genre">Thể loại</label>
          <select
            id="movie-genre"
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Tất cả thể loại</option>
            {genres.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="movie-date">Ngày chiếu</label>
          <input
            id="movie-date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <button type="button" className="btn btn-secondary filter-reset-btn" onClick={handleResetFilters}>
          Đặt lại
        </button>
      </form>

      {loading && <LoadingState text="Đang tìm phim..." />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && movies.length === 0 && (
        <EmptyState text="Không tìm thấy bộ phim nào khớp với bộ lọc hiện tại." />
      )}

      {!loading && !error && movies.length > 0 && (
        <>
          <p className="result-count">Tìm thấy {pagination.total} bộ phim</p>
          <div className="movie-grid">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onOpenTrailer={setTrailerMovie} />
            ))}
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(nextPage) => setPage(nextPage)}
          />
        </>
      )}

      <TrailerModal movie={trailerMovie} onClose={() => setTrailerMovie(null)} />
    </section>
  );
};

export default MoviesPage;
