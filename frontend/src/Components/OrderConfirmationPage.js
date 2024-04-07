import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

function OrderConfirmationPage() {
  return (
    <>
      <Navbar />
      <div className="order-confirmation">
        <h1>Order Confirmation</h1>
        <p>
          Thank you for booking tickets to [MovieName]. 
          <br></br>
          Your screening is scheduled for [Date] at [Time]. 
          <br></br>
          Your total payment was [TotalTicketPrice]. 
          <br></br>
          Please arrive 15 minutes early.
          <br></br>
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