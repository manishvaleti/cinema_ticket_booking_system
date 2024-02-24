import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

function OrderSummaryPage() {
  const [order, setOrder] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get('/api/order');
        setOrder(response.data);
        const totalPrice = response.data.reduce((acc, ticket) => acc + ticket.price, 0);
        setTotal(totalPrice);
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    };

    fetchOrder();
  }, []);

  const updateOrder = async (id, quantity) => {
    await axios.put(`/api/order/${id}`, { quantity });
    const updatedOrder = order.map(ticket => (ticket.id === id ? { ...ticket, quantity } : ticket));
    setOrder(updatedOrder);
    const totalPrice = updatedOrder.reduce((acc, ticket) => acc + ticket.price * ticket.quantity, 0);
    setTotal(totalPrice);
  };

  const deleteTicket = async (id) => {
    await axios.delete(`/api/order/${id}`);
    const updatedOrder = order.filter(ticket => ticket.id !== id);
    setOrder(updatedOrder);
    const totalPrice = updatedOrder.reduce((acc, ticket) => acc + ticket.price * ticket.quantity, 0);
    setTotal(totalPrice);
  };

  const handleCheckout = () => {
    // Redirect to checkout page
  };

  return (

    <div className="order-summary-page">
        <Navbar />
        <h1 className="order-summary-title">Order Summary</h1>
      <table>
        <thead>
          <tr>
            <th>Movie</th>
            <th>Date</th>
            <th>Time</th>
            <th>Ticket Price</th>
            <th>Ticket Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.map(ticket => (
            <tr key={ticket.id}>
              <td>{ticket.movie}</td>
              <td>{ticket.date}</td>
              <td>{ticket.time}</td>
              <td>${ticket.price}</td>
              <td>{ticket.quantity}</td>
              <td>${ticket.price * ticket.quantity}</td>
              <td>
                <button onClick={() => updateOrder(ticket.id, ticket.quantity + 1)}>+</button>
                <button onClick={() => updateOrder(ticket.id, ticket.quantity - 1)}>-</button>
                <button onClick={() => deleteTicket(ticket.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <button className="checkout-button" onClick={handleCheckout}>
        Checkout
      </button>
      
    </div>
    
  );
}

export default OrderSummaryPage;