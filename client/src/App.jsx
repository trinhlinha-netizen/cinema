import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/MainLayout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import MoviesPage from './pages/MoviesPage.jsx';
import MovieDetailPage from './pages/MovieDetailPage.jsx';
import AdminMoviesPage from './pages/admin/AdminMoviesPage.jsx';
import AdminRoomsPage from './pages/admin/AdminRoomsPage.jsx';
import AdminShowtimesPage from './pages/admin/AdminShowtimesPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />

        {/* Nested Routes cho khu vực Quản trị (Thành viên 1) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/movies" replace />} />
          <Route path="movies" element={<AdminMoviesPage />} />
          <Route path="rooms" element={<AdminRoomsPage />} />
          <Route path="showtimes" element={<AdminShowtimesPage />} />
        </Route>

        {/* Điểm nối sang trang Chọn ghế của Thành viên 2 */}
        <Route
          path="/booking/:showtimeId"
          element={
            <div className="container state-box">
              <h2>Trang Chọn Ghế (Phạm vi Thành viên 2)</h2>
              <p className="muted-text">Gọi API GET /api/showtimes/:id để lấy cấu hình phòng và sinh sơ đồ ghế động.</p>
            </div>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
