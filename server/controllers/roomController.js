import pool from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export const getRooms = async (req, res, next) => {
  try {
    const [rooms] = await pool.query('SELECT * FROM rooms ORDER BY id ASC');
    res.status(200).json({
      success: true,
      data: rooms
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (req, res, next) => {
  try {
    const roomId = Number(req.params.id);
    const [rooms] = await pool.query('SELECT * FROM rooms WHERE id = ?', [roomId]);
    if (rooms.length === 0) {
      return next(new AppError('Không tìm thấy phòng chiếu.', 404));
    }
    res.status(200).json({
      success: true,
      data: rooms[0]
    });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const {
      name,
      cinema_name = 'BHC.CINE Downtown',
      cinema_address = '24 Nguyễn Trãi, Thanh Xuân, Hà Nội',
      screen_type = '2D Standard',
      total_rows,
      seats_per_row,
      vip_rows = '',
      double_rows = ''
    } = req.body;

    const cleanVip = vip_rows.replace(/\s/g, '').toUpperCase();
    const cleanDouble = double_rows.replace(/\s/g, '').toUpperCase();

    const [result] = await pool.query(
      `INSERT INTO rooms (name, cinema_name, cinema_address, screen_type, total_rows, seats_per_row, vip_rows, double_rows)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        cinema_name.trim(),
        cinema_address.trim(),
        screen_type.trim(),
        Number(total_rows),
        Number(seats_per_row),
        cleanVip,
        cleanDouble
      ]
    );

    const [created] = await pool.query('SELECT * FROM rooms WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'Thêm phòng chiếu thành công.',
      data: created[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const roomId = Number(req.params.id);
    const [existing] = await pool.query('SELECT id FROM rooms WHERE id = ?', [roomId]);
    if (existing.length === 0) {
      return next(new AppError('Không tìm thấy phòng chiếu để cập nhật.', 404));
    }

    const {
      name,
      cinema_name = 'BHC.CINE Downtown',
      cinema_address = '24 Nguyễn Trãi, Thanh Xuân, Hà Nội',
      screen_type = '2D Standard',
      total_rows,
      seats_per_row,
      vip_rows = '',
      double_rows = ''
    } = req.body;

    const cleanVip = vip_rows.replace(/\s/g, '').toUpperCase();
    const cleanDouble = double_rows.replace(/\s/g, '').toUpperCase();

    await pool.query(
      `UPDATE rooms
       SET name = ?, cinema_name = ?, cinema_address = ?, screen_type = ?,
           total_rows = ?, seats_per_row = ?, vip_rows = ?, double_rows = ?
       WHERE id = ?`,
      [
        name.trim(),
        cinema_name.trim(),
        cinema_address.trim(),
        screen_type.trim(),
        Number(total_rows),
        Number(seats_per_row),
        cleanVip,
        cleanDouble,
        roomId
      ]
    );

    const [updated] = await pool.query('SELECT * FROM rooms WHERE id = ?', [roomId]);
    res.status(200).json({
      success: true,
      message: 'Cập nhật phòng chiếu thành công.',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const roomId = Number(req.params.id);
    const [result] = await pool.query('DELETE FROM rooms WHERE id = ?', [roomId]);
    if (result.affectedRows === 0) {
      return next(new AppError('Không tìm thấy phòng chiếu để xóa.', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Xóa phòng chiếu thành công.'
    });
  } catch (error) {
    next(error);
  }
};
