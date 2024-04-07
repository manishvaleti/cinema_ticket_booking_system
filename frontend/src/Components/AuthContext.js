// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if a JWT token is stored in local storage
    const token = localStorage.getItem('jwtToken');
    if (token) {
      // Verify the token (you may need to send a request to the server to verify)
      setIsLoggedIn(true);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('jwtToken', token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
