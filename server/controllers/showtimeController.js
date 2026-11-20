import pool from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

// Chuẩn hóa thời gian HH:MM -> HH:MM:00 và cộng thêm số phút thời lượng phim
const normalizeTime = (timeStr) => (timeStr.length === 5 ? `${timeStr}:00` : timeStr);

const calculateEndTime = (startTime, durationMinutes) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + Number(durationMinutes);
  if (totalMinutes >= 24 * 60) {
    return null; // Vượt quá 23:59 trong ngày
  }
  const endH = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const endM = String(totalMinutes % 60).padStart(2, '0');
  return `${endH}:${endM}:00`;
};

/**
 * Kiểm tra chồng giờ chiếu trong cùng phòng và cùng ngày.
 * Quy tắc: hai khoảng [A_start, A_end] và [B_start, B_end] giao nhau khi A_start < B_end AND A_end > B_start
 */
const findOverlappingShowtime = async (roomId, showDate, startTime, endTime, excludeId = null) => {
  let sql = `
    SELECT s.id, s.start_time, s.end_time, m.title AS movie_title
    FROM showtimes s
    INNER JOIN movies m ON s.movie_id = m.id
    WHERE s.room_id = ?
      AND s.show_date = ?
      AND s.start_time < ?
      AND s.end_time > ?
  `;
  const params = [roomId, showDate, endTime, startTime];

  if (excludeId) {
    sql += ' AND s.id != ?';
    params.push(excludeId);
  }

  const [conflicts] = await pool.query(sql, params);
  return conflicts[0] || null;
};

/**
 * GET /api/showtimes
 * Lọc theo movie_id, room_id, show_date + phân trang server-side
 */
export const getShowtimes = async (req, res, next) => {
  try {
    const { movie_id, room_id, show_date, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (movie_id) {
      conditions.push('s.movie_id = ?');
      params.push(Number(movie_id));
    }
    if (room_id) {
      conditions.push('s.room_id = ?');
      params.push(Number(room_id));
    }
    if (show_date) {
      conditions.push('s.show_date = ?');
      params.push(show_date);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM showtimes s ${whereClause}`,
      params
    );

    const [showtimes] = await pool.query(
      `SELECT s.*,
              m.title AS movie_title, m.duration AS movie_duration, m.poster_url, m.genre, m.rating,
              r.name AS room_name, r.cinema_name, r.screen_type, r.total_rows, r.seats_per_row, r.vip_rows, r.double_rows
       FROM showtimes s
       INNER JOIN movies m ON s.movie_id = m.id
       INNER JOIN rooms r ON s.room_id = r.id
       ${whereClause}
       ORDER BY s.show_date ASC, s.start_time ASC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.status(200).json({
      success: true,
      data: showtimes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countRows[0].total,
        totalPages: Math.ceil(countRows[0].total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/showtimes/:id
 * Chi tiết 1 suất chiếu (dùng chung cho Thành viên 2 dựng sơ đồ ghế động)
 */
export const getShowtimeById = async (req, res, next) => {
  try {
    const showtimeId = Number(req.params.id);
    const [rows] = await pool.query(
      `SELECT s.*,
              m.title AS movie_title, m.duration AS movie_duration, m.poster_url, m.genre, m.rating,
              r.name AS room_name, r.cinema_name, r.cinema_address, r.screen_type,
              r.total_rows, r.seats_per_row, r.vip_rows, r.double_rows
       FROM showtimes s
       INNER JOIN movies m ON s.movie_id = m.id
       INNER JOIN rooms r ON s.room_id = r.id
       WHERE s.id = ?`,
      [showtimeId]
    );

    if (rows.length === 0) {
      return next(new AppError('Không tìm thấy suất chiếu.', 404));
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/showtimes (Admin)
 * Bắt lỗi HTTP 409 Conflict nếu trùng lịch chiếu trong cùng phòng
 */
export const createShowtime = async (req, res, next) => {
  try {
    const {
      movie_id,
      room_id,
      show_date,
      start_time,
      base_price = 80000,
      vip_price = 110000,
      double_price = 180000
    } = req.body;

    const [movies] = await pool.query('SELECT id, title, duration FROM movies WHERE id = ?', [movie_id]);
    if (movies.length === 0) {
      return next(new AppError('Phim không tồn tại.', 404));
    }

    const [rooms] = await pool.query('SELECT id, name FROM rooms WHERE id = ?', [room_id]);
    if (rooms.length === 0) {
      return next(new AppError('Phòng chiếu không tồn tại.', 404));
    }

    const normalizedStart = normalizeTime(start_time);
    const endTime = calculateEndTime(normalizedStart, movies[0].duration);
    if (!endTime) {
      return next(new AppError('Suất chiếu kết thúc sau 23:59, vui lòng chọn giờ sớm hơn.', 400));
    }

    const conflict = await findOverlappingShowtime(room_id, show_date, normalizedStart, endTime);
    if (conflict) {
      return next(
        new AppError(
          `Trùng lịch chiếu tại ${rooms[0].name}: đã có suất "${conflict.movie_title}" (${conflict.start_time.slice(0, 5)} - ${conflict.end_time.slice(0, 5)}).`,
          409,
          conflict
        )
      );
    }

    const [result] = await pool.query(
      `INSERT INTO showtimes (movie_id, room_id, show_date, start_time, end_time, base_price, vip_price, double_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [movie_id, room_id, show_date, normalizedStart, endTime, Number(base_price), Number(vip_price), Number(double_price)]
    );

    const [created] = await pool.query('SELECT * FROM showtimes WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Tạo suất chiếu thành công.',
      data: created[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/showtimes/generate (Admin)
 * Điểm nhấn Thành viên 1: Tự động sinh nhiều suất chiếu trong ngày, tự bỏ qua khung giờ bị trùng
 */
export const generateShowtimes = async (req, res, next) => {
  try {
    const {
      movie_id,
      room_id,
      show_date,
      time_slots = ['09:30', '13:00', '16:30', '20:00'],
      base_price = 80000,
      vip_price = 110000,
      double_price = 180000
    } = req.body;

    if (!movie_id || !room_id || !show_date || !Array.isArray(time_slots) || time_slots.length === 0) {
      return next(new AppError('Thiếu thông tin phim, phòng, ngày hoặc danh sách khung giờ.', 400));
    }

    const [movies] = await pool.query('SELECT id, duration FROM movies WHERE id = ?', [movie_id]);
    if (movies.length === 0) return next(new AppError('Phim không tồn tại.', 404));

    const [rooms] = await pool.query('SELECT id, name FROM rooms WHERE id = ?', [room_id]);
    if (rooms.length === 0) return next(new AppError('Phòng chiếu không tồn tại.', 404));

    const created = [];
    const skipped = [];

    for (const slot of time_slots) {
      const normalizedStart = normalizeTime(slot.trim());
      const endTime = calculateEndTime(normalizedStart, movies[0].duration);

      if (!endTime) {
        skipped.push({ slot, reason: 'Vượt quá 23:59' });
        continue;
      }

      const conflict = await findOverlappingShowtime(room_id, show_date, normalizedStart, endTime);
      if (conflict) {
        skipped.push({
          slot,
          reason: `Trùng suất "${conflict.movie_title}" (${conflict.start_time.slice(0, 5)}-${conflict.end_time.slice(0, 5)})`
        });
        continue;
      }

      const [result] = await pool.query(
        `INSERT INTO showtimes (movie_id, room_id, show_date, start_time, end_time, base_price, vip_price, double_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [movie_id, room_id, show_date, normalizedStart, endTime, Number(base_price), Number(vip_price), Number(double_price)]
      );
      created.push({ id: result.insertId, start_time: normalizedStart, end_time: endTime });
    }

    res.status(201).json({
      success: true,
      message: `Đã sinh thành công ${created.length} suất chiếu, bỏ qua ${skipped.length} khung giờ trùng.`,
      created,
      skipped
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/showtimes/:id (Admin)
 */
export const updateShowtime = async (req, res, next) => {
  try {
    const showtimeId = Number(req.params.id);
    const [existing] = await pool.query('SELECT id FROM showtimes WHERE id = ?', [showtimeId]);
    if (existing.length === 0) {
      return next(new AppError('Không tìm thấy suất chiếu để cập nhật.', 404));
    }

    const {
      movie_id,
      room_id,
      show_date,
      start_time,
      base_price = 80000,
      vip_price = 110000,
      double_price = 180000
    } = req.body;

    const [movies] = await pool.query('SELECT id, duration FROM movies WHERE id = ?', [movie_id]);
    if (movies.length === 0) return next(new AppError('Phim không tồn tại.', 404));

    const [rooms] = await pool.query('SELECT id, name FROM rooms WHERE id = ?', [room_id]);
    if (rooms.length === 0) return next(new AppError('Phòng chiếu không tồn tại.', 404));

    const normalizedStart = normalizeTime(start_time);
    const endTime = calculateEndTime(normalizedStart, movies[0].duration);
    if (!endTime) {
      return next(new AppError('Suất chiếu kết thúc sau 23:59.', 400));
    }

    const conflict = await findOverlappingShowtime(room_id, show_date, normalizedStart, endTime, showtimeId);
    if (conflict) {
      return next(
        new AppError(
          `Trùng lịch chiếu tại ${rooms[0].name}: đã có suất "${conflict.movie_title}" (${conflict.start_time.slice(0, 5)} - ${conflict.end_time.slice(0, 5)}).`,
          409,
          conflict
        )
      );
    }

    await pool.query(
      `UPDATE showtimes
       SET movie_id = ?, room_id = ?, show_date = ?, start_time = ?, end_time = ?,
           base_price = ?, vip_price = ?, double_price = ?
       WHERE id = ?`,
      [movie_id, room_id, show_date, normalizedStart, endTime, Number(base_price), Number(vip_price), Number(double_price), showtimeId]
    );

    const [updated] = await pool.query('SELECT * FROM showtimes WHERE id = ?', [showtimeId]);

    res.status(200).json({
      success: true,
      message: 'Cập nhật suất chiếu thành công.',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/showtimes/:id (Admin)
 */
export const deleteShowtime = async (req, res, next) => {
  try {
    const showtimeId = Number(req.params.id);
    const [result] = await pool.query('DELETE FROM showtimes WHERE id = ?', [showtimeId]);
    if (result.affectedRows === 0) {
      return next(new AppError('Không tìm thấy suất chiếu để xóa.', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Xóa suất chiếu thành công.'
    });
  } catch (error) {
    next(error);
  }
};
