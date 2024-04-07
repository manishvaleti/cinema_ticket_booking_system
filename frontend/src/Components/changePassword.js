import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const history = useNavigate();
    const { logout } = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (newPassword.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
            setError('New password must be at least 8 characters long and contain at least one special character.');
            return;
        }
        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/change_password/',
                { old_password: oldPassword, new_password: newPassword },
                { headers: { Authorization: `Token ${localStorage.getItem('authToken')}` } }
            );
            console.log(response.data.message);
            // setError('');
            localStorage.removeItem('authToken');
            logout(); // Delete the authentication token
            history('/login');
        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.error);
            } else {
                // setError('An error occurred. Please try again.');
            }
        }
    };

    
    return (
        <>
        <Navbar />
        <div className='changePassword'>
            <h2>Change Password</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-list">
                    <input type="password" placeholder='Old Password' name="old_password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                </div>
                <div className="input-list">
                    <input type="password" placeholder='New Password' name="new_password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
                </div>
                <div className="input-list">
                    <input type="password" placeholder='Confirm New Password' name="confirm_new_password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                </div>
                <button type="submit">Change Password</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
        </>
    );
}

export default ChangePassword;
