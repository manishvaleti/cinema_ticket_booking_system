import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchOrderHistory = async () => {
            try {
                const authToken = localStorage.getItem('authToken'); // Retrieve authentication token from local storage
                if (!authToken) {
                    throw new Error('Authentication token not found in localStorage');
                }

                const response = await axios.get('http://127.0.0.1:8000/order_history/', {
                    headers: {
                        'Authorization': `Token ${authToken}`
                    }
                });

                setOrders(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching order history:', error);
            }
        };

        fetchOrderHistory();
    }, []);

    
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

    const handleCancel = async(orderId) => {
        if (window.confirm('Are you sure you want to cancel this ticket?')) {
            try {
                const authToken = localStorage.getItem('authToken'); // Retrieve authentication token from local storage
                if (!authToken) {
                    throw new Error('Authentication token not found in localStorage');
                }
    
                // Delete the booking
                const response = await axios.delete(`http://127.0.0.1:8000/cancelBooking/${orderId}/`, {
                    headers: {
                        'Authorization': `Token ${authToken}`
                    }
                });
    
                // Optional: Implement logic to delete associated seats
    
                // Update the order list to reflect the cancellation
                const updatedOrders = orders.filter(order => order.id !== orderId);
                setOrders(updatedOrders);
                setMessage(response.message); // Update message state here
                console.log('Booking cancelled successfully:', orderId);
            } catch (error) {
                console.error('Error cancelling booking:', error);
            }
        }
    };
    
    return (
        <>
            <Navbar />
            <div className="order-history-container">
                <div className="card">
                    <h1>Order History</h1>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Movie</th>
                                    <th>Show</th>
                                    <th>Total Amount</th>
                                    <th>Seats</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td>{order.reference_number}</td>
                                        <td>{order.show.movie.title}</td>
                                        <td>{order.show.screen.name} at {formatTime(order.show.start_time)}</td>
                                        <td>{order.total_amount}</td>
                                        <td>
                                            <ul>
                                                {order.seats.map(seat => (
                                                    <li key={seat.id}>{seat.seatNo}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td><button onClick={() => handleCancel(order.id)}>Cancel</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {message && <p style={{ color: 'green' }}>{message}</p>}
        </>
    );
    
}

export default OrderHistory;
