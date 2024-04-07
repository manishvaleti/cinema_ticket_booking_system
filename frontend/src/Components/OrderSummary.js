import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

function OrderSummary() {
  const location = useLocation();
  const { showId, selectedSeats } = location.state || {};
  const [order, setOrder] = useState([]);
  const [showDetails, setShowDetails] = useState({ price: 0, movie: '', startTime: '' });
  const [categories, setCategories] = useState([]); // State to store categories
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/shows/${showId}/`);
        const startTime = new Date(response.data.start_time);
        const formattedStartTime = startTime.toLocaleString(); // This will format the date and time according to the locale
  
        setShowDetails({
          price: response.data.price,
          startTime: formattedStartTime,
          movie: response.data.title,
        });

        const initialOrder = selectedSeats.map((seat, index) => ({
          id: index,
          seat: seat,
          ticketAge: 'Adult',
          category: 'ADULT', // Default category
          price: response.data.price,
        }));
        
        setOrder(initialOrder);
      } catch (error) {
        console.error('Error fetching show details:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (showId) {
      fetchShowDetails();
      fetchCategories();
    }
  }, [showId, selectedSeats]);

  // const calculateTotal = () => {
  //   return order.reduce((total, ticket) => total + parseFloat(ticket.price), 0);
  // };

  const applyDiscount = (category, price) => {
    if (category === 'CHILD' || category === 'SENIOR') {
      return price * 0.8; // Applying 20% discount for children and senior citizens
    }
    return price;
  };

  const handleChangeCategory = (id, category) => {
    setOrder(order.map(ticket => (ticket.id === id ? { ...ticket, category } : ticket)));
  };

  const calculateTotal = () => {
    return order.reduce((total, ticket) => total + parseFloat(applyDiscount(ticket.category, ticket.price)), 0);
  };
  

  const handleSubmit = async () => {
    try {
      const seatsData = order.map(ticket => ({
        seat: ticket.seat,
        category: ticket.category
      }));
      const response = await axios.put(`http://127.0.0.1:8000/seat-booking/${showId}/`, {
        seats: seatsData,
      });
      console.log(response.data);
      navigate(`/`) // Redirect to confirmation page after successful booking
    } catch (error) {
      console.error('Error booking seats:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="order-summary">
        <h1>Order Summary</h1>
        <h3>{showDetails.movie}</h3>
        <h5>{showDetails.startTime}</h5>
        <table>
          <thead>
            <tr>
              <th>Seat</th>
              <th>Category</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {order.map((ticket, index) => (
              <tr key={index}>
                <td>{ticket.seat}</td>
                <td>
                  <select value={ticket.category} onChange={e => handleChangeCategory(ticket.id, e.target.value)}>
                    {categories.map(category => (
                      <option key={category[0]} value={category[0]}>{category[1]}</option>
                    ))}
                  </select>
                </td>
                <td>${applyDiscount(ticket.category, ticket.price).toFixed(2)}</td>
                
              </tr>
            ))}
          </tbody>
        </table>
        <div>Total: ${calculateTotal().toFixed(2)}</div>
        <button onClick={handleSubmit}>Confirm Order</button>
      </div>
    </>
  );
}

export default OrderSummary;
