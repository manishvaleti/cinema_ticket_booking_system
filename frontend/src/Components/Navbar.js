import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPencilAlt } from "react-icons/fa";
import { GiPadlock } from "react-icons/gi";
import { CgProfile } from "react-icons/cg";
import { IoKey } from "react-icons/io5";
import { useAuth } from './AuthContext'; // Adjust the import path as necessary
import axios from 'axios';
import { FaHistory } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout , user} = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            throw new Error('Authentication token not found in localStorage');
        }

        await axios.post('http://127.0.0.1:8000/logout/', null, {
            headers: {
                'Authorization': `Token ${authToken}`
            }
        });
        localStorage.removeItem('authToken');
        logout(); // Clears user authentication state
        console.log('Logged out successfully');
        navigate('/'); // Navigate to login page after logout
    } catch (error) {
        console.error('Error during logout:', error);
        // Optionally handle error state here
    }
};


  function DropDownItem({ icon, text, onClick }) {
    return (
      <li className='dropdownItem' onClick={onClick}>
        {icon}
        <span>{text}</span>
      </li>
    );
  }
  
  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="navbar-brand">CinemaVerse <i className="fa-solid fa-film"></i></Link>
          <div className="navbar-buttons">
            {!isLoggedIn ? (
              <>
                <Link to="/Register" className="btn btn-signup mr-2">Register</Link>
                <Link to="/Login" className="btn btn-login">Login</Link>
              </>
            ) : (
              <div className='menu-trigger' style={{marginRight:'40px'}} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <CgProfile size={24} />
              </div>
            )}
          </div>
        </div>
      </nav>
      {isLoggedIn && isDropdownOpen && ( // Show dropdown when isLoggedIn is true
        <div className='dropdown-menu'>
          <ul>
            <DropDownItem icon={<FaHistory />} text={'  Order History'} onClick={() => { navigate('/orderHistory'); setIsDropdownOpen(false); }} />
            <DropDownItem icon={<IoKey />} text={'  Change Password'} onClick={() => { navigate('/changePassword'); setIsDropdownOpen(false); }} />
            <DropDownItem icon={<FaPencilAlt />} text={'  Edit Profile'} onClick={() => { navigate('/EditProfile',{ user }); setIsDropdownOpen(false); }} />
            <DropDownItem icon={<GiPadlock />} text={'  Logout'} onClick={handleLogout} />
          </ul>
        </div>
      )}
    </>
  );
}

export default Navbar;
