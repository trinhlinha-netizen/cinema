import React, { useState } from 'react';
import { movieApi, roomApi, showtimeApi } from '../../services/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { LoadingState, ErrorState } from '../../components/StatusStates.jsx';

const todayStr = new Date().toISOString().slice(0, 10);

const AdminShowtimesPage = () => {
  const { data: stData, loading, error, refetch } = useFetch(() => showtimeApi.getAll({ limit: 50 }), []);
  const { data: moviesData } = useFetch(() => movieApi.getAll({ limit: 50 }), []);
  const { data: roomsData } = useFetch(() => roomApi.getAll(), []);

  const [form, setForm] = useState({
    movie_id: '',
    room_id: '',
    show_date: todayStr,
    start_time: '19:30',
    base_price: 80000,
    vip_price: 110000,
    double_price: 180000
  });
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const showtimes = stData?.data || [];
  const movies = moviesData?.data || [];
  const rooms = roomsData?.data || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', text: '' });
    try {
      await showtimeApi.create(form);
      setFeedback({ type: 'success', text: 'Tạo suất chiếu thành công.' });
      refetch();
    } catch (err) {
      // Hiển thị rõ lỗi HTTP 409 Conflict khi chồng giờ chiếu
      const prefix = err.status === 409 ? '[409 Conflict] ' : '';
      setFeedback({ type: 'error', text: `${prefix}${err.message}` });
    }
  };

  const handleAutoGenerate = async () => {
    if (!form.movie_id || !form.room_id || !form.show_date) {
      setFeedback({ type: 'error', text: 'Vui lòng chọn Phim, Phòng và Ngày trước khi sinh suất chiếu tự động.' });
      return;
    }
    setFeedback({ type: '', text: '' });
    try {
      const res = await showtimeApi.generate({
        movie_id: Number(form.movie_id),
        room_id: Number(form.room_id),
        show_date: form.show_date,
        time_slots: ['09:30', '13:00', '16:30', '20:00'],
        base_price: Number(form.base_price),
        vip_price: Number(form.vip_price),
        double_price: Number(form.double_price)
      });
      setFeedback({ type: 'success', text: res.message });
      refetch();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa suất chiếu này?')) return;
    try {
      await showtimeApi.remove(id);
      refetch();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="admin-grid">
      <form className="admin-card" onSubmit={handleCreate}>
        <h2>Tạo suất chiếu mới</h2>
        <p className="muted-text">Hệ thống tự động kiểm tra chồng giờ trong cùng phòng và trả về 409 Conflict nếu bị trùng.</p>

        {feedback.text && (
          <div className={`alert alert-${feedback.type}`} role="alert">
            {feedback.text}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="st-movie">Chọn phim *</label>
          <select id="st-movie" name="movie_id" value={form.movie_id} onChange={handleChange} required>
            <option value="">-- Chọn phim --</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.duration} phút)
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="st-room">Chọn phòng chiếu *</label>
          <select id="st-room" name="room_id" value={form.room_id} onChange={handleChange} required>
            <option value="">-- Chọn phòng --</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.screen_type})
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="st-date">Ngày chiếu *</label>
            <input id="st-date" name="show_date" type="date" value={form.show_date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="st-time">Giờ bắt đầu *</label>
            <input id="st-time" name="start_time" type="time" value={form.start_time} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="base_price">Giá thường (đ)</label>
            <input id="base_price" name="base_price" type="number" value={form.base_price} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="vip_price">Giá VIP (đ)</label>
            <input id="vip_price" name="vip_price" type="number" value={form.vip_price} onChange={handleChange} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Thêm suất chiếu
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleAutoGenerate}>
            Sinh nhanh 4 suất/ngày
          </button>
        </div>
      </form>

      <div className="admin-card">
        <h2>Lịch chiếu hiện có ({showtimes.length})</h2>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Phim</th>
                  <th>Phòng</th>
                  <th>Ngày</th>
                  <th>Khung giờ</th>
                  <th>Giá thường</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {showtimes.map((st) => (
                  <tr key={st.id}>
                    <td><strong>{st.movie_title}</strong></td>
                    <td>{st.room_name}</td>
                    <td>{st.show_date}</td>
                    <td>{st.start_time.slice(0, 5)} → {st.end_time.slice(0, 5)}</td>
                    <td>{Number(st.base_price).toLocaleString('vi-VN')}đ</td>
                    <td>
                      <button type="button" className="btn btn-danger btn-xs" onClick={() => handleDelete(st.id)}>
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

export default AdminShowtimesPage;
