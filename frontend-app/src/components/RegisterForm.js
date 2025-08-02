import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // NEW IMPORT

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    gender: '',
    dateOfBirth: '',
    city: '',
    country: '',
    bio: '',
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    try {
      const response = await axios.post('http://localhost:8080/api/users/register', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Registration successful:', response.data);
      setMessage('Registration successful! You can now log in.');
      setIsSuccess(true);
    } catch (error) {
      console.error('Registration failed:', error.response ? error.response.data : error.message);
      setMessage(error.response ? `Error: ${error.response.data.message}` : 'An unexpected error occurred.');
      setIsSuccess(false);
    }
  };

  // ... (rest of the component logic)

    return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h2>Register for HNIN Connect</h2>
        <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
            <label>Username:</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
            <label>Password:</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
            <label>Full Name:</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
        </div>
        <button type="submit">Register</button>
        </form>
        {message && (
        <p style={{ color: isSuccess ? 'green' : 'red', marginTop: '15px' }}>
            {message}
        </p>
        )}
        <p style={{ marginTop: '20px' }}>
        Already have an account? <Link to="/login">Login here.</Link> {/* NEW LINK */}
        </p>
    </div>
    );
};

export default RegisterForm;