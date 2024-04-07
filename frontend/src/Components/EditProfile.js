import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

function EditProfile() {
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        address: '',
        phone_number: '', // Updated field name
        photo: null,
        provideCreditCardDetails: false,
        credit_card_number: '', // Updated field name
        credit_card_expiry: '', // Updated field name
        credit_card_cvv: '',
        promotions:false, // Updated field name
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
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
                const profileData = response.data;
                setFormData({
                    ...profileData,
                    phoneNumber: profileData.phone_number,
                    creditCardNumber: profileData.credit_card_number,
                    creditCardExpiry: profileData.credit_card_expiry,
                    creditCardCVV: profileData.credit_card_cvv
                });
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };
        fetchProfileData();
    }, []);

    const handleChange = (e) => {
        const { name, value, checked, files } = e.target;
        if (name === 'photo') {
            setFormData({ ...formData, photo: files[0] });
        } else if (name === 'promotions') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const csrfToken = await getCSRFToken(); // Fetch CSRF token
            const authToken = localStorage.getItem('authToken');
            const userData = new FormData();
            userData.append('username', formData.username);
            userData.append('first_name', formData.first_name);
            userData.append('last_name', formData.last_name);
            userData.append('email', formData.email);
            userData.append('address', formData.address);
            userData.append('phone_number', formData.phone_number);
            userData.append('promotions', formData.promotions);
            if (formData.photo) {
                userData.append('photo', formData.photo);
            }
            if (formData.provideCreditCardDetails) {
                userData.append('credit_card_number', formData.credit_card_number);
                userData.append('credit_card_expiry', formData.credit_card_expiry);
                userData.append('credit_card_cvv', formData.credit_card_cvv);
            }

            await axios.put('http://127.0.0.1:8000/edit_profile/', userData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRFToken': csrfToken,
                    'Authorization': `Token ${authToken}` // Include CSRF token in the request headers
                },
            });
            navigate('/');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getCSRFToken = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/csrf-token/');
            return response.data.csrfToken;
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
            return null;
        }
    };

    

    return (
        <>
            <Navbar />
            <div className="registration-form">
                <h1>Edit Profile</h1>
                <form onSubmit={handleSubmit} className="input-list">
                    <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
                    <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} />
                    <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} />
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} disabled />
                    <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
                    <input type="text" name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange} />
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
                            Change Credit Card Details:
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
                    <button type="submit">Submit Changes</button>
                </form>
            </div>
        </>
    );
}

export default EditProfile;
