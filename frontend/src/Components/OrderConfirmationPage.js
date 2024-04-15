import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';

function OrderConfirmationPage() {
  const location = useLocation();
  const { confirmationDetails } = location.state || {};
  const { movieName, time, totalTicketPrice, bookedSeats, screen } = confirmationDetails || {};

  return (
    <>
      <Navbar />
      <div className="order-confirmation">
        <h1>Order Confirmation</h1>
        <p>
          Thank you for booking tickets to {movieName}. 
          <br />
          Your screening is scheduled for  {time} in {screen}
          <br />
          Your total payment was {totalTicketPrice}. 
          <br />
          Booked Seats: {bookedSeats}
          <br />
          Please arrive 15 minutes early.
          <br />
          Enjoy the show!
        </p>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button className="go-back-button">Browse More Shows</button>
        </Link>
      </div>
    </>
  );
}

export default OrderConfirmationPage;
