import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <section className="container state-box">
      <h1>404 — Không tìm thấy trang</h1>
      <p className="muted-text">Đường dẫn bạn truy cập không tồn tại hoặc đã bị di chuyển.</p>
      <Link to="/" className="btn btn-primary">
        Về trang chủ
      </Link>
    </section>
  );
};

export default NotFoundPage;
