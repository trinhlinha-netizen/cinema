import React, { useState } from 'react';
import { movieApi } from '../../services/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { LoadingState, ErrorState } from '../../components/StatusStates.jsx';

const INITIAL_FORM = {
  title: '',
  description: '',
  genre: 'Tình cảm',
  duration: 120,
  release_date: '2026-11-20',
  poster_url: '',
  trailer_url: '',
  rating: 'P',
  status: 'now_showing',
  is_featured: false
};

const AdminMoviesPage = () => {
  const { data, loading, error, refetch } = useFetch(() => movieApi.getAll({ limit: 50 }), []);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const movies = data?.data || [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEdit = (movie) => {
    setEditingId(movie.id);
    setForm({
      title: movie.title,
      description: movie.description,
      genre: movie.genre,
      duration: movie.duration,
      release_date: movie.release_date?.slice(0, 10) || '',
      poster_url: movie.poster_url,
      trailer_url: movie.trailer_url || '',
      rating: movie.rating || 'P',
      status: movie.status,
      is_featured: Boolean(movie.is_featured)
    });
    setFeedback({ type: '', text: '' });
  };

  const handleReset = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      if (editingId) {
        await movieApi.update(editingId, form);
        setFeedback({ type: 'success', text: 'Cập nhật phim thành công.' });
      } else {
        await movieApi.create(form);
        setFeedback({ type: 'success', text: 'Thêm phim mới thành công.' });
      }
      handleReset();
      refetch();
    } catch (err) {
      const detailText = err.details ? ` (${err.details.join(' ')})` : '';
      setFeedback({ type: 'error', text: `${err.message}${detailText}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phim "${title}"?`)) return;
    try {
      await movieApi.remove(id);
      setFeedback({ type: 'success', text: `Đã xóa phim "${title}".` });
      refetch();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="admin-grid">
      <form className="admin-card" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Cập nhật phim' : 'Thêm phim mới'}</h2>

        {feedback.text && (
          <div className={`alert alert-${feedback.type}`} role="alert">
            {feedback.text}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title">Tên phim *</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="genre">Thể loại *</label>
            <input id="genre" name="genre" value={form.genre} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="duration">Thời lượng (phút) *</label>
            <input id="duration" name="duration" type="number" min="1" value={form.duration} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="release_date">Ngày phát hành *</label>
            <input id="release_date" name="release_date" type="date" value={form.release_date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="status">Trạng thái</label>
            <select id="status" name="status" value={form.status} onChange={handleChange}>
              <option value="now_showing">Đang chiếu</option>
              <option value="coming_soon">Sắp chiếu</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="poster_url">Link Poster *</label>
          <input id="poster_url" name="poster_url" value={form.poster_url} onChange={handleChange} placeholder="https://..." required />
        </div>

        <div className="form-group">
          <label htmlFor="trailer_url">Link Trailer (YouTube Embed)</label>
          <input id="trailer_url" name="trailer_url" value={form.trailer_url} onChange={handleChange} placeholder="https://www.youtube.com/embed/..." />
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô tả ngắn *</label>
          <textarea id="description" name="description" rows="3" value={form.description} onChange={handleChange} required />
        </div>

        <label className="checkbox-label">
          <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
          Hiển thị làm Phim nổi bật ở Trang chủ
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm phim'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Hủy
            </button>
          )}
        </div>
      </form>

      <div className="admin-card">
        <h2>Danh sách phim ({movies.length})</h2>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên phim</th>
                  <th>Thể loại</th>
                  <th>Thời lượng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie.id}>
                    <td><strong>{movie.title}</strong></td>
                    <td>{movie.genre}</td>
                    <td>{movie.duration} phút</td>
                    <td>
                      <span className={`badge badge-${movie.status}`}>
                        {movie.status === 'now_showing' ? 'Đang chiếu' : 'Sắp chiếu'}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button type="button" className="btn btn-secondary btn-xs" onClick={() => handleEdit(movie)}>
                        Sửa
                      </button>
                      <button type="button" className="btn btn-danger btn-xs" onClick={() => handleDelete(movie.id, movie.title)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMoviesPage;
