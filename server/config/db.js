import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bhc_cine',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

export const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Kết nối MySQL thành công:', process.env.DB_NAME || 'bhc_cine');
    conn.release();
  } catch (error) {
    console.error('❌ Lỗi kết nối MySQL:', error.message);
  }
};

export default pool;
