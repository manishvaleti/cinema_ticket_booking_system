import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

function Login() {
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
            userData.append('password', formData.password);

            const response = await axios.post('http://127.0.0.1:8000/api/register/', userData);
            console.log(response.data); // Response from Django backend

        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <><div /><Navbar />
        
        <div class="login-form">
            <h1>User Login</h1>
            <div class="input-list">
                
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />

                {formData.provideCreditCardDetails && (
                    <div>
                        <input type="text" name="creditCardNumber" placeholder="Credit Card Number" value={formData.creditCardNumber} onChange={handleChange} />
                        <input type="date" name="creditCardExpiry" placeholder="Credit Card Expiry (MM/YYYY)" value={formData.creditCardExpiry} onChange={handleChange} />
                        <input type="text" name="creditCardCVV" placeholder="Credit Card CVV" value={formData.creditCardCVV} onChange={handleChange} />
                    </div>
                )}
            </div>
            <button type="submit">Login</button>
            <p>
                <span style={{ color: 'white' }}>Don't have an account?</span> {' '}
                <Link to="/register" className="btn btn-login mr-2" >Register</Link>

            </p>
        </div>
        
    </>
        
    );
}

export default Login;