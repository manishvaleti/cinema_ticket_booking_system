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
  const [promoCode, setPromoCode] = useState(''); // State for promo code
  const [discount, setDiscount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0); // State for total amount
  const [promoCodeMessage, setPromoCodeMessage] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCVV] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/shows/${showId}/`);

        const formatTime = (timestamp) => {
          return new Date(timestamp).toLocaleString('en-US', {
              timeZone: 'UTC',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
          });
      };
  
        setShowDetails({
          price: response.data.price,
          startTime: formatTime(response.data.start_time),
          movie: response.data.title,
          screen: response.data.screen,
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

  useEffect(() => {
    // Calculate total amount when order or discount changes
    const total = order.reduce((total, ticket) => total + parseFloat(ticket.price), 0);
    setTotalAmount(total - discount); // Subtract discount from total
  }, [order, discount]);

  useEffect(() => {
    // Fetch user data with encrypted card details and decrypt them
    const fetchUserData = async () => {
      try {
        const authToken = localStorage.getItem('authToken'); // Retrieve authentication token from local storage
        console.log(authToken);
        if (!authToken) {
          throw new Error('Authentication token not found in localStorage');
          }
        
        const response = await axios.get('http://127.0.0.1:8000/edit_profile/', {
          headers: {
            'Authorization': `Token ${authToken}`
            }
      });
// Endpoint to fetch user data using user ID
        // Decrypt card details and set them in the state
        const decryptedCardNumber = response.data.credit_card_number;
        const decryptedExpirationDate = response.data.credit_card_expiry;
        const decryptedCVV = response.data.credit_card_cvv;
        setCardNumber(decryptedCardNumber);
        setExpirationDate(decryptedExpirationDate);
        setCVV(decryptedCVV);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const applyDiscount = (category, price) => {
    if (category === 'CHILD' || category === 'SENIOR') {
      return price * 0.8; // Applying 20% discount for children and senior citizens
    }
    return price;
  };

  const handleChangeCategory = (id, category) => {
    setOrder(order.map(ticket => (ticket.id === id ? { ...ticket, category } : ticket)));
  };

  const handleApplyPromoCode = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/validate-promo-code/', {
        promo_code: promoCode,
        total_amount: totalAmount // Send total amount to backend
      });
      setDiscount(response.data.discount);
      setPromoCodeMessage(`Promo code applied successfully. Discount: $${response.data.discount.toFixed(2)}`);
    } catch (error) {
      console.error('Error validating promo code:', error);
      setDiscount(0); // Set discount to 0 if promo code is invalid
      setPromoCodeMessage('Invalid promo code. Please try again.');
    }
  };
  

  const handleSubmit = async () => {
    try {
      const authToken = localStorage.getItem('authToken'); // Retrieve authentication token from local storage
        console.log(authToken);
        if (!authToken) {
          throw new Error('Authentication token not found in localStorage');
          }
      const seatsData = order.map(ticket => ({
        seat: ticket.seat,
        category: ticket.category
      }));
      const seatNumbers = order.map(ticket => ticket.seat);
      const response = await axios.put(`http://127.0.0.1:8000/seat-booking/${showId}/`, {
        seats: seatsData,
      });
      console.log(response.data);
      const response1 = await axios.post(`http://127.0.0.1:8000/book/`, {
      show_id: showId,
      total_amount: totalAmount,
      seat_numbers: seatNumbers,
      credit_card_number: cardNumber,
      cvv: cvv,
      expiry_date: expirationDate
      
    }, {
      headers: {
        'Authorization': `Token ${authToken}`
      }
    });
    console.log(response1.data)
    navigate(`/OrderConfirmationPage`, {
      state: {
        confirmationDetails: {
          movieName: showDetails.movie,
          time: showDetails.startTime, // Assuming startTime contains both date and time
          totalTicketPrice: totalAmount.toFixed(2), // Assuming totalAmount contains the total ticket price
          bookedSeats: order.map(ticket => ticket.seat).join(', '),
          screen: showDetails.screen
        }
      }
    },[location.state, navigate]); // Redirect to confirmation page after successful booking
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
        <h4>{showDetails.screen}</h4>
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
        
        <div style={{ marginTop: 'auto', fontSize: '30px' }}>Total: ${totalAmount.toFixed(2)}</div>
        <div className='promocode'>
          <label htmlFor="promoCode">Enter Promo Code:  </label>
          <input type="text" id="promoCode" style={{width:'auto'}} value={promoCode} onChange={e => setPromoCode(e.target.value)} />
          <button onClick={handleApplyPromoCode} style={{ backgroundColor: '#fff', color: '#333', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>Apply</button>
        </div>
        {promoCodeMessage && <p style={{ color: 'green' }}>{promoCodeMessage}</p>}
        <h3>Card Information</h3>
        <div className='input-list'>
            
          <input 
            type="text" 
            name="creditcardnumber" 
            placeholder="Card Number"  
            value={cardNumber}
            onChange={e => setCardNumber(e.target.value)} // Update cardNumber state on change
          />
          <input 
            type="date" 
            name="expirydate" 
            placeholder="Expiration Date" 
            value={expirationDate}
            onChange={e => setExpirationDate(e.target.value)} // Update expirationDate state on change
          />
          <input 
            type="text" 
            name="cvv" 
            placeholder="CVV" 
            value={cvv}
            onChange={e => setCVV(e.target.value)} // Update cvv state on change
          />
        </div>
        
        <button onClick={handleSubmit} style={{ backgroundColor: '#fff', color: '#333', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>Confirm Order</button>
      </div>
    </>
  );
}

export default OrderSummary;
