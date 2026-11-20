import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <section className="container admin-wrapper">
      <nav className="admin-tab-bar" aria-label="Điều hướng quản trị">
        <NavLink
          to="/admin/movies"
          className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}
        >
          Quản lý phim
        </NavLink>
        <NavLink
          to="/admin/rooms"
          className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}
        >
          Quản lý phòng chiếu
        </NavLink>
        <NavLink
          to="/admin/showtimes"
          className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}
        >
          Quản lý suất chiếu
        </NavLink>
      </nav>

      <div className="admin-body">
        <Outlet />
      </div>
    </section>
  );
};

export default AdminLayout;
