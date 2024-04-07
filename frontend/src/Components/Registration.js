import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

function Registration() {
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        address: '',
        phone_number: '', // Match the field name expected by the Django backend
        photo: null,
        provideCreditCardDetails: false,
        credit_card_number: '', // Match the field name expected by the Django backend
        credit_card_expiry: '', // Match the field name expected by the Django backend
        credit_card_cvv: '',
        promotions:false, // Match the field name expected by the Django backend
    });
    const [passwordError, setPasswordError] = useState('');

    const navigate = useNavigate();

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        if (e.target.name === 'photo') {
            setFormData({ ...formData, photo: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: value });
        }
        if (e.target.name === 'password') {
            validatePassword(e.target.value);
        }
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        if (!regex.test(password)) {
            setPasswordError('Password must be at least 8 characters long, include uppercase and lowercase letters, and numbers.');
        } else {
            setPasswordError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwordError) {
            alert('Please correct the errors before submitting.');
            return;
        }
        try {
            const userData = new FormData();
            Object.keys(formData).forEach(key => {
                userData.append(key, formData[key]);
            });
            const response = await axios.post('http://127.0.0.1:8000/register/', userData);
            console.log(response.data);
    
            navigate('/AccountCreatedPage');
        } catch (error) {
            console.error('Error:', error);
            if (error.response && error.response.status === 400) {
                const errorMessage = "Username Already Taken"; // Assuming the error message is returned in the 'detail' field
                alert(errorMessage); // Display the error message to the user
            } else {
                alert('An error occurred while processing your request. Please try again later.');
            }
        }
    };

    return (
        <>
            <Navbar />
            <div className="registration-form">
                <h1>User Registration</h1>
                <form onSubmit={handleSubmit} className="input-list">
                    <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
                    <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
                    <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                    {passwordError && <div style={{ color: 'red' }}>{passwordError}</div>}
                    <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
                    <input type="text" name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange} required />
                    <input type="file" name="photo" onChange={handleChange} />
                    <div>
                        <label>
                            Subscribe to Promotions:
                            <input
                                type="checkbox"
                                name="promotions"
                                checked={formData.promotions}
                                onChange={handleChange} />
                        </label>
                    </div>
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
                        <>
                            <input type="text" name="credit_card_number" placeholder="Credit Card Number" value={formData.credit_card_number} onChange={handleChange} />
                            <input type="date" name="credit_card_expiry" value={formData.credit_card_expiry} onChange={handleChange} />
                            <input type="text" name="credit_card_cvv" placeholder="Credit Card CVV" value={formData.credit_card_cvv} onChange={handleChange} />
                        </>
                    )}
                    <button type="submit">Register</button>
                </form>
            </div>
        </>
    );
}

export default Registration;
