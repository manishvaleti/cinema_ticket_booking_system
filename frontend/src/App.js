import React from 'react';
import Registration from './Components/Registration';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Update import statement
import UserList from './Components/UserList';
import Home from './Components/Home'; // Assuming you have a Home component for the homepage
import MovieDetails from './Components/movieInd';
import Login from './Components/Login';
import AccountCreatedPage from './Components/AccountCreatedPage';
import EditProfile from './Components/EditProfile';
import BookMovies from './Components/BookMovies';
import OrderSummary from './Components/OrderSummary';

function App() {
  return (
    <Router>
      <Routes> 
        <Route path="/" element={<Home />} /> {/* Use element prop to specify the component */}
        <Route path="/users" element={<UserList />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Registration />} />
        <Route path="/movies/:movieId/" element={<MovieDetails />} />
        <Route path="/AccountCreatedPage" element={<AccountCreatedPage />} />
        <Route path="/AccountCreatedPage" element={<AccountCreatedPage />} />
        <Route path="/EditProfile" element={<EditProfile/>}/>
        <Route path="/BookMovies" element={<BookMovies/>}/>
        <Route path="/OrderSummary" element={<OrderSummary/>}/>
        
        {/* Add more routes for other pages */}
      </Routes>
    </Router>
  );
}
export default App;