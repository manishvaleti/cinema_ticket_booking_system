import React, { useState } from 'react'

import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="container">
        <a href="/" className="navbar-brand">CinemaVerse <i class="fa-solid fa-film"></i></a>
        <div className="navbar-buttons">
          <Link to="/Register" className="btn btn-signup mr-2">Register</Link>
          <Link to="/Login" className="btn btn-login mr-2">Login</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;