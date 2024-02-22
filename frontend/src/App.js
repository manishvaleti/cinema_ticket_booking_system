import React from 'react';
import Registration from './Components/Registration';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Update import statement
import UserList from './Components/UserList';
import Home from './Components/Home'; // Assuming you have a Home component for the homepage
<<<<<<< HEAD
import MovieDetails from './Components/movieInd';
import Login from './Components/Login';

=======
import MovieDetails from './Components/movieInd'
import Login from './Components/Login'
>>>>>>> f182f64 (next update)
function App() {
  return (
    <Router>
      <Routes> 
        <Route path="/" element={<Home />} /> {/* Use element prop to specify the component */}
        <Route path="/users" element={<UserList />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Registration />} />
        <Route path="/movies/:movieId/" element={<MovieDetails />} />
        {/* Add more routes for other pages */}
      </Routes>
    </Router>
  );
}

export default App;
