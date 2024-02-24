import React, { useState } from 'react';
import Navbar from './Navbar';

function OrderSummary() {
  const [order, setOrder] = useState([
    { id: 1, movie: 'Movie 1', seat: 'A1', ticketAge: 'Adult', price: 10 },
    { id: 2, movie: 'Movie 2', seat: 'B3', ticketAge: 'Child', price: 8 },
    // Add more tickets as needed
  ]);

  const calculateTotal = () => {
    return order.reduce((total, ticket) => total + ticket.price, 0);
  };

  const updateTicket = (id, newTicket) => {
    setOrder(order.map(ticket => (ticket.id === id ? { ...ticket, ...newTicket } : ticket)));
  };

  const deleteTicket = id => {
    setOrder(order.filter(ticket => ticket.id !== id));
  };

  const handleConfirmOrder = () => {
    // Handle confirmation logic (e.g., proceed to checkout)
    console.log('Order confirmed:', order);
  };

  return (
    <>
      <Navbar />
      <div className="order-summary">
        <h1>Order Summary</h1>
        <table>
          <thead>
            <tr>
              <th>Movie</th>
              <th>Seat</th>
              <th>Ticket Age</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {order.map(ticket => (
              <tr key={ticket.id}>
                <td>{ticket.movie}</td>
                <td>{ticket.seat}</td>
                <td>{ticket.ticketAge}</td>
                <td>${ticket.price}</td>
                <td>
                  <button onClick={() => updateTicket(ticket.id, { movie: 'New Movie' })}>Update</button>
                  <button onClick={() => deleteTicket(ticket.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>Total: ${calculateTotal()}</div>
        <button onClick={handleConfirmOrder}>Confirm Order</button>
      </div>
    </>
  );
}

export default OrderSummary;
