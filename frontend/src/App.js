import React from 'react';
import Registration from './Components/Registration';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Home from './Components/Home'; // Assuming you have a Home component for the homepage
import MovieDetails from './Components/movieInd';
import Login from './Components/Login';
import AccountCreatedPage from './Components/AccountCreatedPage';
import EditProfile from './Components/EditProfile';
import OrderSummary from './Components/OrderSummary';
import OrderConfirmationPage from './Components/OrderConfirmationPage';
import SeatMap from './Components/SeatMap';
import ChangePassword from './Components/changePassword';
import { AuthProvider } from './Components/AuthContext';
import ForgotPassword from './Components/ForgotPassword';
import ResetPassword from './Components/ResetPassword';
import OrderHistory from './Components/orderHistory';

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes> 
        <Route path="/" element={<Home />} /> 
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Registration />} />
        <Route path="/movies/:movieId/" element={<MovieDetails />} />
        <Route path="/AccountCreatedPage" element={<AccountCreatedPage />} />
        <Route path="/EditProfile" element={<EditProfile/>}/>
        <Route path="/OrderSummary" element={<OrderSummary/>}/>
        <Route path="/changePassword" element={<ChangePassword/>}/>
        <Route path="/OrderConfirmationPage" element={<OrderConfirmationPage/>}/>
        <Route path="/SeatMap/:showId/" element={<SeatMap/>}/>
        <Route path="/forgotPassword" element={<ForgotPassword/>}/>
        <Route path="/resetPassword" element={<ResetPassword/>}/>
        <Route path="/orderHistory" element={<OrderHistory/>}/>
        {/* Add more routes for other pages */}
      </Routes>
    </Router>
    </AuthProvider>
  );
}
export default App;