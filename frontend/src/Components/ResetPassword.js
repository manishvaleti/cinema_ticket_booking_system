import React, { useState } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import Navbar from './Navbar';
const ResetPassword = () => {
    const [username, setUsername] = useState('');
    const [tempPassword, setTempPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                'http://localhost:8000/reset_password/',
                { username:username,temp_password: tempPassword, new_password: newPassword }
            );
            setMessage(response.data.message);
            setError('');
            navigate('/login');
        } catch (error) {
            setMessage('');
            setError(error.response.data.error);
        }
    };

    return (
        <>
        <Navbar />
        <div className='resetPassword'>
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit}>
                <div className='input-list'>
                <input type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder="Enter temporary password" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} required />
                <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <button type="submit">Reset Password</button>
            </form>
            {message && <p>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
        </>
    );
};

export default ResetPassword;
