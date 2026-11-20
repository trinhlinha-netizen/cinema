import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-title">BHC.CINE</span>
          <span className="brand-tagline">A better place for the big screen.</span>
        </Link>

        <nav className="nav-links" aria-label="Điều hướng chính">
          <NavLink to="/" end className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
            Trang Chủ
          </NavLink>
          <NavLink to="/movies" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
            Lịch Chiếu
          </NavLink>
          <NavLink to="/admin/movies" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
            Quản lý rạp
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
