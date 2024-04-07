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
import OrderSummaryPage from './Components/OrderSummaryPage';
import CheckOutPage from './Components/CheckOutPage';
import OrderConfirmationPage from './Components/OrderConfirmationPage';
import SeatMap from './Components/SeatMap';
import ChangePassword from './Components/changePassword';
import { AuthProvider } from './Components/AuthContext';
import ForgotPassword from './Components/ForgotPassword';
import ResetPassword from './Components/ResetPassword';

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes> 
        <Route path="/" element={<Home />} /> {/* Use element prop to specify the component */}
        <Route path="/users" element={<UserList />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Registration />} />
        <Route path="/movies/:movieId/" element={<MovieDetails />} />
        <Route path="/AccountCreatedPage" element={<AccountCreatedPage />} />
        <Route path="/EditProfile" element={<EditProfile/>}/>
        <Route path="/BookMovies" element={<BookMovies/>}/>
        <Route path="/OrderSummary" element={<OrderSummary/>}/>
        <Route path="/changePassword" element={<ChangePassword/>}/>
        <Route path="/OrderSummaryPage" element={<OrderSummaryPage />} />
        <Route path="/CheckOutPage" element={<CheckOutPage />} />
        <Route path="/OrderConfirmationPage" element={<OrderConfirmationPage/>}/>
        <Route path="/SeatMap/:showId/" element={<SeatMap/>}/>
        <Route path="/forgotPassword" element={<ForgotPassword/>}/>
        <Route path="/resetPassword" element={<ResetPassword/>}/>
        {/* Add more routes for other pages */}
      </Routes>
    </Router>
    </AuthProvider>
  );
}
export default App;