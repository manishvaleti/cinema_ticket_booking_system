import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

function CheckOutPage() {
    const [shippingInfo, setShippingInfo] = useState({});
    const [billingInfo, setBillingInfo] = useState({});
    const [cardInfo, setCardInfo] = useState({});
    const [booking, setBooking] = useState([]);

    useEffect(() => {
        // Fetch booking data from the server
        axios.get('/api/bookings')
            .then(response => {
                setBooking(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);
    
    const handleSubmit = (event) => {
        event.preventDefault();
    
        // Send the data to the server for processing
        axios.post('/api/checkout', {
            shippingInfo,
            billingInfo,
            cardInfo,
            booking
        })
        .then(response => {
            console.log(response.data);
            // Redirect to a success page or show a success message
        })
        .catch(error => {
            console.log(error);
            // Show an error message
        });
    };
    
    return (
        <>
            <Navbar />
            <div className="background-container">
            <div className="checkout-container">
                <h1>Checkout</h1>
    
                <form onSubmit={handleSubmit}>
                    <h3>Shipping Information</h3>
                    <input type="text" placeholder="Name" onChange={(event) => setShippingInfo({ ...shippingInfo, name: event.target.value })} />
                    <input type="text" placeholder="Address" onChange={(event) => setShippingInfo({ ...shippingInfo, address: event.target.value })} />
                    <input type="text" placeholder="City" onChange={(event) => setShippingInfo({ ...shippingInfo, city: event.target.value })} />
                    <input type="text" placeholder="State" onChange={(event) => setShippingInfo({ ...shippingInfo, state: event.target.value })} />
                    <input type="text" placeholder="Zip Code" onChange={(event) => setShippingInfo({ ...shippingInfo, zipCode: event.target.value })} />
    
                    <h3>Billing Information</h3>
                    <input type="text" placeholder="Name" onChange={(event) => setBillingInfo({ ...billingInfo, name: event.target.value })} />
                    <input type="text" placeholder="Address" onChange={(event) => setBillingInfo({ ...billingInfo, address: event.target.value })} />
                    <input type="text" placeholder="City" onChange={(event) => setBillingInfo({ ...billingInfo, city: event.target.value })} />
                    <input type="text" placeholder="State" onChange={(event) => setBillingInfo({ ...billingInfo, state: event.target.value })} />
                    <input type="text" placeholder="Zip Code" onChange={(event) => setBillingInfo({ ...billingInfo, zipCode: event.target.value })} />
    
                    <h3>Card Information</h3>
                    <input type="text" placeholder="Card Number" onChange={(event) => setCardInfo({ ...cardInfo, cardNumber: event.target.value })} />
                    <input type="text" placeholder="Expiration Date" onChange={(event) => setCardInfo({ ...cardInfo, expirationDate: event.target.value })} />
                    <input type="text" placeholder="CVV" onChange={(event) => setCardInfo({ ...cardInfo, cvv: event.target.value })} />
    
                    <button type="submit" className="checkoutpage-button">Confirm</button>
                    <button type="submit" className="checkout-cancel-button">Cancel</button>
                </form>
            </div>
            </div>
        </>
    );
}

export default CheckOutPage