import React from 'react';
import Registration from './Components/Registration';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Update import statement
import UserList from './Components/UserList';
import Home from './Components/Home'; // Assuming you have a Home component for the homepage
import MovieDetails from './Components/movieInd';
import Login from './Components/Login';
import AccountCreatedPage from './Components/AccountCreatedPage';
import OrderSummaryPage from './Components/OrderSummaryPage';
import CheckOutPage from './Components/CheckOutPage';
import OrderConfirmationPage from './Components/OrderConfirmationPage';

function App() {
  return (
    <Router>
      <Routes> 
        <Route path="/" element={<Home />} /> {/* Use element prop to specify the component */}
        <Route path="/users" element={<UserList />} />
        <Route path="/Register" element={<Registration />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/movies/:movieId/" element={<MovieDetails />} />
        <Route path="/AccountCreatedPage" element={<AccountCreatedPage />} />
        <Route path="/OrderSummaryPage" element={<OrderSummaryPage />} />
        <Route path="/CheckOutPage" element={<CheckOutPage />} />
        <Route path="/OrderConfirmationPage" element={<OrderConfirmationPage/>}/>

        {/* Add more routes for other pages */}
      </Routes>
    </Router>
  );
}

export default App;
