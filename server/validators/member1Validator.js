import { AppError } from '../middleware/errorHandler.js';

export const validateMoviePayload = (req, res, next) => {
  const { title, description, genre, duration, release_date, poster_url, status } = req.body;
  const errors = [];

  if (!title || !title.trim()) errors.push('Tên phim không được để trống.');
  if (!description || !description.trim()) errors.push('Mô tả phim không được để trống.');
  if (!genre || !genre.trim()) errors.push('Thể loại phim không được để trống.');

  const parsedDuration = Number(duration);
  if (!Number.isInteger(parsedDuration) || parsedDuration <= 0 || parsedDuration > 500) {
    errors.push('Thời lượng phim phải là số nguyên dương (1 - 500 phút).');
  }

  if (!release_date || !/^\d{4}-\d{2}-\d{2}$/.test(release_date)) {
    errors.push('Ngày phát hành không hợp lệ (định dạng YYYY-MM-DD).');
  }

  if (!poster_url || !poster_url.trim()) {
    errors.push('Đường dẫn poster không được để trống.');
  }

  if (status && !['now_showing', 'coming_soon'].includes(status)) {
    errors.push('Trạng thái phim chỉ nhận now_showing hoặc coming_soon.');
  }

  if (errors.length > 0) {
    return next(new AppError('Dữ liệu phim không hợp lệ.', 400, errors));
  }

  return next();
};

export const validateRoomPayload = (req, res, next) => {
  const { name, total_rows, seats_per_row, vip_rows, double_rows } = req.body;
  const errors = [];

  if (!name || !name.trim()) errors.push('Tên phòng chiếu không được để trống.');

  const rows = Number(total_rows);
  const cols = Number(seats_per_row);
  if (!Number.isInteger(rows) || rows < 1 || rows > 26) {
    errors.push('Số hàng ghế phải từ 1 đến 26.');
  }
  if (!Number.isInteger(cols) || cols < 1 || cols > 30) {
    errors.push('Số ghế mỗi hàng phải từ 1 đến 30.');
  }

  const rowPattern = /^([A-Z](,[A-Z])*)?$/;
  if (vip_rows && !rowPattern.test(vip_rows.replace(/\s/g, '').toUpperCase())) {
    errors.push('Hàng VIP phải có dạng các chữ cái ngăn cách bằng dấu phẩy (VD: D,E).');
  }
  if (double_rows && !rowPattern.test(double_rows.replace(/\s/g, '').toUpperCase())) {
    errors.push('Hàng ghế đôi phải có dạng các chữ cái ngăn cách bằng dấu phẩy (VD: H).');
  }

  if (errors.length > 0) {
    return next(new AppError('Dữ liệu phòng chiếu không hợp lệ.', 400, errors));
  }

  return next();
};

export const validateShowtimePayload = (req, res, next) => {
  const { movie_id, room_id, show_date, start_time, base_price, vip_price, double_price } = req.body;
  const errors = [];

  if (!Number.isInteger(Number(movie_id)) || Number(movie_id) <= 0) {
    errors.push('movie_id không hợp lệ.');
  }
  if (!Number.isInteger(Number(room_id)) || Number(room_id) <= 0) {
    errors.push('room_id không hợp lệ.');
  }
  if (!show_date || !/^\d{4}-\d{2}-\d{2}$/.test(show_date)) {
    errors.push('Ngày chiếu không hợp lệ (YYYY-MM-DD).');
  }
  if (!start_time || !/^\d{2}:\d{2}(:\d{2})?$/.test(start_time)) {
    errors.push('Giờ bắt đầu không hợp lệ (HH:MM hoặc HH:MM:SS).');
  }
  if (base_price !== undefined && Number(base_price) < 0) {
    errors.push('Giá vé thường không được âm.');
  }
  if (vip_price !== undefined && Number(vip_price) < 0) {
    errors.push('Giá vé VIP không được âm.');
  }
  if (double_price !== undefined && Number(double_price) < 0) {
    errors.push('Giá vé đôi không được âm.');
  }

  if (errors.length > 0) {
    return next(new AppError('Dữ liệu suất chiếu không hợp lệ.', 400, errors));
  }

  return next();
};
