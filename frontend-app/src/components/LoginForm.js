// frontend-app/src/components/auth/LoginForm.js

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
    <div className="hero is-fullheight">
      <div className="hero-body">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-one-third">
              <div className="box">
                <h1 className="title has-text-centered">Login to HNIN Connect</h1>
                <form onSubmit={handleSubmit}>
                  <div className="field">
                    <label className="label">Username</label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        name="username"
                        placeholder="e.g., alexsmith"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Password</label>
                    <div className="control">
                      <input
                        className="input"
                        type="password"
                        name="password"
                        placeholder="********"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="field">
                    <div className="control">
                      <button className="button is-primary is-fullwidth" type="submit">
                        Log in
                      </button>
                    </div>
                  </div>
                </form>
                {message && (
                  <p className={`mt-4 has-text-centered ${isSuccess ? 'has-text-success' : 'has-text-danger'}`}>
                    {message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;