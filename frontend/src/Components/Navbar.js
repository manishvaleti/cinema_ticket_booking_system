import React, { useState } from 'react'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { GoChevronDown } from 'react-icons/go';
import { FaPencilAlt } from "react-icons/fa";
import { GiPadlock } from "react-icons/gi";
import { CgProfile } from "react-icons/cg";

function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const handleEditProfile = () => {

    navigate('/EditProfile');
  }

  const handleLogout = () => {

    navigate('/');
  }

  function DropDownItem ({icon, text, onClick}) {
    return (
     <li className='dropdownItem' onClick={onClick}>
       {icon}
       <a>{text}</a>
     </li>
  )
}
  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="navbar-brand">CinemaVerse <i className="fa-solid fa-film"></i></Link>
          <div className="navbar-buttons">
            <Link to="/Register" className="btn btn-signup mr-2">Register</Link>
            <Link to="/Login" className="btn btn-login mr-2">Login</Link>
            <div className='menu-trigger' onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <GoChevronDown size={24} />
              </div>
          </div>
        </div>
      </nav>
      {isDropdownOpen && (
        <div className='dropdown-menu'>
          <ul>
            <DropDownItem icon={<CgProfile />} text={'My Profile'} onClick={() => setIsDropdownOpen(false)} />
            <DropDownItem icon={<FaPencilAlt />} text={'Edit Profile'} onClick={handleEditProfile} />
            <DropDownItem icon={<GiPadlock />} text={'Logout'} onClick={handleLogout} />
          </ul>
        </div>
      )}
    </>
);
}

export default Navbar;