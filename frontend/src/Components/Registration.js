import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';


function Registration() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        address: '',
        phoneNumber: '',
        photo: null,
        provideCreditCardDetails: false,
        creditCardNumber: '',
        creditCardExpiry: '',
        creditCardCVV: ''
    });

    const handleChange = (e) => {
        if (e.target.name === 'photo') {
            setFormData({ ...formData, photo: e.target.files[0] });
        } else if (e.target.name === 'provideCreditCardDetails') {
            setFormData({ ...formData, provideCreditCardDetails: e.target.checked });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = new FormData();
            userData.append('username', formData.username);
            userData.append('email', formData.email);
            userData.append('password', formData.password);
            userData.append('address', formData.address);
            userData.append('phone_number', formData.phoneNumber);
            userData.append('photo', formData.photo);
            if (formData.provideCreditCardDetails) {
                userData.append('credit_card_number', formData.creditCardNumber);
                userData.append('credit_card_expiry', formData.creditCardExpiry);
                userData.append('credit_card_cvv', formData.creditCardCVV);
            }

            const response = await axios.post('http://127.0.0.1:8000/api/register/', userData);
            console.log(response.data); // Response from Django backend

        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <><div /><Navbar />
        
        <div class="registration-form">
            <h1>User Registration</h1>
            <div class="input-list">
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
                <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} />
                <input type="file" name="photo" onChange={handleChange} />
                <div>
                    <label>
                        Provide Credit Card Details:
                        <input
                            type="checkbox"
                            name="provideCreditCardDetails"
                            checked={formData.provideCreditCardDetails}
                            onChange={handleChange} />
                    </label>
                </div>
                {formData.provideCreditCardDetails && (
                    <div>
                        <input type="text" name="creditCardNumber" placeholder="Credit Card Number" value={formData.creditCardNumber} onChange={handleChange} />
                        <input type="date" name="creditCardExpiry" placeholder="Credit Card Expiry (MM/YYYY)" value={formData.creditCardExpiry} onChange={handleChange} />
                        <input type="text" name="creditCardCVV" placeholder="Credit Card CVV" value={formData.creditCardCVV} onChange={handleChange} />
                    </div>
                )}
            </div>
            <button type="submit">Register</button>

        </div>
        
    </>
        
    );
}

export default Registration;
