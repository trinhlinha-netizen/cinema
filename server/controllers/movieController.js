import pool from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * GET /api/movies
 * Hỗ trợ: search (LIKE), filter theo genre, status, date (ngày có suất chiếu), và phân trang phía server (LIMIT/OFFSET)
 */
export const getMovies = async (req, res, next) => {
  try {
    const {
      search = '',
      genre = '',
      status = '',
      date = '',
      page = 1,
      limit = 8
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 8));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (search.trim()) {
      conditions.push('m.title LIKE ?');
      params.push(`%${search.trim()}%`);
    }

    if (genre.trim() && genre !== 'all') {
      const genres = genre.split(',').map((g) => g.trim()).filter(Boolean);
      if (genres.length === 1) {
        conditions.push('m.genre LIKE ?');
        params.push(`%${genres[0]}%`);
      } else if (genres.length > 1) {
        const placeholders = genres.map(() => '?').join(', ');
        conditions.push(`m.genre IN (${placeholders})`);
        params.push(...genres);
      }
    }

    if (status.trim() && ['now_showing', 'coming_soon'].includes(status)) {
      conditions.push('m.status = ?');
      params.push(status);
    }

    let joinClause = '';
    if (date.trim() && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      joinClause = 'INNER JOIN showtimes s ON s.movie_id = m.id';
      conditions.push('s.show_date = ?');
      params.push(date.trim());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(DISTINCT m.id) AS total FROM movies m ${joinClause} ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT DISTINCT m.*
      FROM movies m
      ${joinClause}
      ${whereClause}
      ORDER BY m.is_featured DESC, (m.rank_order IS NULL) ASC, m.rank_order ASC, m.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [movies] = await pool.query(dataSql, [...params, limitNum, offset]);

    // Lấy danh sách thể loại duy nhất để frontend render bộ lọc
    const [genreRows] = await pool.query('SELECT DISTINCT genre FROM movies ORDER BY genre ASC');

    res.status(200).json({
      success: true,
      data: movies,
      genres: genreRows.map((row) => row.genre),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/movies/:id
 * Chi tiết phim kèm danh sách suất chiếu và thông tin phòng chiếu
 */
export const getMovieById = async (req, res, next) => {
  try {
    const movieId = Number(req.params.id);
    if (!Number.isInteger(movieId) || movieId <= 0) {
      return next(new AppError('ID phim không hợp lệ.', 400));
    }

    const [movies] = await pool.query('SELECT * FROM movies WHERE id = ?', [movieId]);
    if (movies.length === 0) {
      return next(new AppError('Không tìm thấy phim.', 404));
    }

    const [showtimes] = await pool.query(
      `SELECT s.*, r.name AS room_name, r.cinema_name, r.cinema_address, r.screen_type,
              r.total_rows, r.seats_per_row, r.vip_rows, r.double_rows
       FROM showtimes s
       INNER JOIN rooms r ON s.room_id = r.id
       WHERE s.movie_id = ? AND s.show_date >= CURDATE()
       ORDER BY s.show_date ASC, s.start_time ASC`,
      [movieId]
    );

    res.status(200).json({
      success: true,
      data: {
        ...movies[0],
        showtimes
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/movies (Admin)
 */
export const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      description,
      genre,
      duration,
      release_date,
      poster_url,
      trailer_url = '',
      rating = 'P',
      status = 'now_showing',
      is_featured = false,
      rank_order = null
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO movies (title, description, genre, duration, release_date, poster_url, trailer_url, rating, status, is_featured, rank_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description.trim(),
        genre.trim(),
        Number(duration),
        release_date,
        poster_url.trim(),
        trailer_url ? trailer_url.trim() : null,
        rating,
        status,
        Boolean(is_featured),
        rank_order ? Number(rank_order) : null
      ]
    );

    const [created] = await pool.query('SELECT * FROM movies WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Thêm phim thành công.',
      data: created[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/movies/:id (Admin)
 */
export const updateMovie = async (req, res, next) => {
  try {
    const movieId = Number(req.params.id);
    const [existing] = await pool.query('SELECT id FROM movies WHERE id = ?', [movieId]);
    if (existing.length === 0) {
      return next(new AppError('Không tìm thấy phim để cập nhật.', 404));
    }

    const {
      title,
      description,
      genre,
      duration,
      release_date,
      poster_url,
      trailer_url = '',
      rating = 'P',
      status = 'now_showing',
      is_featured = false,
      rank_order = null
    } = req.body;

    await pool.query(
      `UPDATE movies
       SET title = ?, description = ?, genre = ?, duration = ?, release_date = ?,
           poster_url = ?, trailer_url = ?, rating = ?, status = ?, is_featured = ?, rank_order = ?
       WHERE id = ?`,
      [
        title.trim(),
        description.trim(),
        genre.trim(),
        Number(duration),
        release_date,
        poster_url.trim(),
        trailer_url ? trailer_url.trim() : null,
        rating,
        status,
        Boolean(is_featured),
        rank_order ? Number(rank_order) : null,
        movieId
      ]
    );

    const [updated] = await pool.query('SELECT * FROM movies WHERE id = ?', [movieId]);

    res.status(200).json({
      success: true,
      message: 'Cập nhật phim thành công.',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/movies/:id (Admin)
 */
export const deleteMovie = async (req, res, next) => {
  try {
    const movieId = Number(req.params.id);
    const [result] = await pool.query('DELETE FROM movies WHERE id = ?', [movieId]);
    if (result.affectedRows === 0) {
      return next(new AppError('Không tìm thấy phim để xóa.', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Xóa phim thành công.'
    });
  } catch (error) {
    next(error);
  }
};
