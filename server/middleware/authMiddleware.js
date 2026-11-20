import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

/**
 * Middleware xác thực JWT và kiểm tra vai trò (Admin / Member).
 * Khi test độc lập phần Thành viên 1, có thể đặt BYPASS_AUTH_DEV=true trong .env.
 * Khi ghép dự án với Thành viên 3, đặt BYPASS_AUTH_DEV=false để bật kiểm tra JWT chặt chẽ.
 */
export const verifyToken = (req, res, next) => {
  if (process.env.BYPASS_AUTH_DEV === 'true') {
    req.user = { id: 1, role: 'admin', name: 'Dev Admin' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Vui lòng đăng nhập để tiếp tục (thiếu token).', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return next(new AppError('Token không hợp lệ hoặc đã hết hạn.', 401));
  }
};

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Chưa xác thực người dùng.', 401));
  }
  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError('Bạn không có quyền thực hiện thao tác này.', 403));
  }
  return next();
};
