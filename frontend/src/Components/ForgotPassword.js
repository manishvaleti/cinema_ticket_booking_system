import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/forgot_password/',
                { email : email }
            );
            setMessage(response.data.message);
            setError('');
            navigate('/resetPassword');
        } catch (error) {
            setMessage('');
            setError(error.response.data.error);
        }
    };

    return (
        <>
        <Navbar />
        <div className='forgotPassword'>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <div className='input-list'><input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <button type="submit">Submit</button>
            </form>
            {message && <p>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
        </>
    );
};

export default ForgotPassword;
