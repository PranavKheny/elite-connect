import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const LoginForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate(); // Hook for programmatically navigating

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        try {
            // Make a POST request to the backend's login endpoint
            const response = await axios.post('http://localhost:8080/api/users/login', formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // On successful login, the backend returns a JWT token
            const jwtToken = response.data.jwtToken;
            console.log('Login successful. JWT:', jwtToken);
            setMessage('Login successful! Redirecting to profile...');
            setIsSuccess(true);

            // Store the JWT token securely (e.g., in localStorage) for future requests
            localStorage.setItem('jwtToken', jwtToken);

            // Redirect the user to a protected page (e.g., /profile)
            setTimeout(() => {
                navigate('/profile');
            }, 1500);

        } catch (error) {
            console.error('Login failed:', error.response ? error.response.data : error.message);
            setMessage(error.response ? `Error: ${error.response.data.message}` : 'An unexpected error occurred.');
            setIsSuccess(false);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Login to HNIN Connect</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Username:</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Password:</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <button type="submit">Login</button>
            </form>
            {message && (
                <p style={{ color: isSuccess ? 'green' : 'red', marginTop: '15px' }}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default LoginForm;