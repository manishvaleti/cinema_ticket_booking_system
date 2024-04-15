import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from './AuthContext';
import {jwtDecode} from 'jwt-decode';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    
    const handleRegisterClick = () => {
        navigate('/register');
    };

    const onForgotClick = () => {
        navigate('/forgotPassword');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const fetchCSRFToken = async () => {
        try {
            const csrfResponse = await axios.get('http://127.0.0.1:8000/csrf-token/');
            const csrfToken = csrfResponse.data.csrfToken;
            return csrfToken;
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const csrfToken = await fetchCSRFToken();
        if (!csrfToken) {
            console.error('CSRF token not available.');
            return;
        }
    
        try {
            const response = await axios.post('http://127.0.0.1:8000/login/', formData, {
                headers: {
                    'X-CSRFToken': csrfToken,
                },
            });
            const userData = response.data;
    
            if (!userData.is_active) {
                alert('Your account is inactive. Please contact Cinemaverse at contact@cinemaverse.com.');
                return;
            }
    
            // Extract authentication token from response headers
            const authToken = response.data.token;
            // Store the authentication token securely, for example in localStorage
            localStorage.setItem('authToken', authToken);
            const decodedToken = jwtDecode(authToken);
            console.log(decodedToken);
    
            login(userData.is_active);
    
            if (userData.is_superuser) {
                window.location.href = 'http://127.0.0.1:8000/admin/';
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.response && error.response.status === 401) {
                // if (error.response.data.detail === 'Invalid credentials') {
                //     alert('Invalid credentials');
                // } else if (error.response.data.detail === 'Your account is inactive. Please contact Cinemaverse at contact@cinemaverse.com.') {
                //     alert('Your account is inactive. Please contact Cinemaverse at contact@cinemaverse.com.');
                // } else {
                //     // Handle other types of authentication errors
                //     console.error('Authentication error:', error.response.data.detail);
                // }
                alert(error.response.data.detail);
            } else {
                // Optionally handle other types of errors
                console.error('Unexpected error:', error);
            }
        }
    };
    

    return (
        <>
            <Navbar />
            <div className="login-form">
                <h1>User Login</h1>
                <form onSubmit={handleSubmit} >
                    <div className="input-list"style={{margin: '0 auto'}}>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    
                    <button type="submit" style={{ width: '40%',margin: '0 auto' }}>Login</button>
                    </div>
                </form>
                <button onClick={onForgotClick}>Forgot Password</button>
                <p>
                    Don't have an account? <button onClick={handleRegisterClick}>Register</button>
                </p>
            </div>
        </>
    );
}

export default Login;
