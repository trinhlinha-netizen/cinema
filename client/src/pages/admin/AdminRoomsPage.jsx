import React, { useState } from 'react';
import { roomApi } from '../../services/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { LoadingState, ErrorState } from '../../components/StatusStates.jsx';

const INITIAL_ROOM = {
  name: '',
  cinema_name: 'BHC.CINE Downtown',
  cinema_address: '24 Nguyễn Trãi, Thanh Xuân, Hà Nội',
  screen_type: '2D Standard',
  total_rows: 8,
  seats_per_row: 12,
  vip_rows: 'D,E',
  double_rows: 'H'
};

const AdminRoomsPage = () => {
  const { data, loading, error, refetch } = useFetch(() => roomApi.getAll(), []);
  const [form, setForm] = useState(INITIAL_ROOM);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const rooms = data?.data || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (room) => {
    setEditingId(room.id);
    setForm({
      name: room.name,
      cinema_name: room.cinema_name,
      cinema_address: room.cinema_address || '',
      screen_type: room.screen_type,
      total_rows: room.total_rows,
      seats_per_row: room.seats_per_row,
      vip_rows: room.vip_rows || '',
      double_rows: room.double_rows || ''
    });
    setFeedback({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', text: '' });
    try {
      if (editingId) {
        await roomApi.update(editingId, form);
        setFeedback({ type: 'success', text: 'Cập nhật phòng chiếu thành công.' });
      } else {
        await roomApi.create(form);
        setFeedback({ type: 'success', text: 'Thêm phòng chiếu thành công.' });
      }
      setEditingId(null);
      setForm(INITIAL_ROOM);
      refetch();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa phòng "${name}"?`)) return;
    try {
      await roomApi.remove(id);
      setFeedback({ type: 'success', text: `Đã xóa phòng "${name}".` });
      refetch();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="admin-grid">
      <form className="admin-card" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Sửa phòng chiếu' : 'Thêm phòng chiếu'}</h2>
        {feedback.text && <div className={`alert alert-${feedback.type}`}>{feedback.text}</div>}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="room-name">Tên phòng *</label>
            <input id="room-name" name="name" value={form.name} onChange={handleChange} placeholder="Phòng 05" required />
          </div>
          <div className="form-group">
            <label htmlFor="screen_type">Định dạng chiếu</label>
            <input id="screen_type" name="screen_type" value={form.screen_type} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="cinema_name">Tên cụm rạp</label>
          <input id="cinema_name" name="cinema_name" value={form.cinema_name} onChange={handleChange} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="total_rows">Số hàng ghế (1-26) *</label>
            <input id="total_rows" name="total_rows" type="number" min="1" max="26" value={form.total_rows} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="seats_per_row">Số ghế / hàng (1-30) *</label>
            <input id="seats_per_row" name="seats_per_row" type="number" min="1" max="30" value={form.seats_per_row} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="vip_rows">Hàng VIP (VD: D,E)</label>
            <input id="vip_rows" name="vip_rows" value={form.vip_rows} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="double_rows">Hàng ghế đôi (VD: H)</label>
            <input id="double_rows" name="double_rows" value={form.double_rows} onChange={handleChange} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Lưu phòng' : 'Thêm phòng'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm(INITIAL_ROOM); }}>
              Hủy
            </button>
          )}
        </div>
      </form>

      <div className="admin-card">
        <h2>Danh sách phòng chiếu ({rooms.length})</h2>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Định dạng</th>
                  <th>Sơ đồ</th>
                  <th>Hàng VIP / Đôi</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td><strong>{room.name}</strong></td>
                    <td>{room.screen_type}</td>
                    <td>{room.total_rows} hàng × {room.seats_per_row} ghế ({room.total_rows * room.seats_per_row} chỗ)</td>
                    <td>VIP: {room.vip_rows || '—'} | Đôi: {room.double_rows || '—'}</td>
                    <td className="action-cell">
                      <button type="button" className="btn btn-secondary btn-xs" onClick={() => handleEdit(room)}>
                        Sửa
                      </button>
                      <button type="button" className="btn btn-danger btn-xs" onClick={() => handleDelete(room.id, room.name)}>
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

export default AdminRoomsPage;
