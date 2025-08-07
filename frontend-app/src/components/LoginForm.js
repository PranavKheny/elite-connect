// frontend-app/src/components/LoginForm.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useAuth } from '../App';

// --- Styled Components (with styling guide values) ---
const StyledContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #334155; /* Primary Background */
  color: #f8fafc; /* Text */
  padding: 2rem;
`;

const StyledForm = styled(motion.form)`
  display: flex;
  flex-direction: column;
  background-color: #1f2937; /* Secondary Background */
  padding: 4rem;
  border-radius: 8px; /* Consistent border radius */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
`;

const StyledTitle = styled.h2`
  font-family: 'sans-serif';
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  text-transform: uppercase;
  color: #f8fafc;
`;

const StyledLabel = styled.label`
  font-family: 'serif';
  margin-bottom: 0.5rem;
  color: #94a3b8;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1.5rem;
  background-color: transparent;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  color: #f8fafc;
  font-family: 'serif';

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const StyledButton = styled(motion.button)`
  font-family: 'sans-serif';
  font-weight: bold;
  padding: 1rem;
  border-radius: 8px;
  background-color: transparent;
  color: #f8fafc;
  border: 2px solid #3b82f6;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: #3b82f6;
    color: #334155;
  }
`;

const StyledMessage = styled.p`
  text-align: center;
  margin-top: 1rem;
  color: ${(props) => (props.isSuccess ? '#22c55e' : '#ef4444')};
`;

const StyledLinkContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;

const StyledLink = styled(Link)`
  font-family: 'serif';
  color: #3b82f6;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;


// --- Animation Variants ---
const formVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('http://localhost:8080/api/users/login', formData);
      const jwtToken = response.data.jwtToken;
      
      const userResponse = await axios.get('http://localhost:8080/api/users/me', {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      const user = userResponse.data;

      auth.login(user, jwtToken);

      if (user.verified) { // Use 'verified' as per the backend UserResponse DTO
        setMessage('Login successful! Redirecting to dashboard...');
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setMessage('Login successful! Redirecting to profile for verification...');
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (error) {
      setMessage(error.response ? `Error: ${error.response.data.message}` : 'An unexpected error occurred.');
      setIsSuccess(false);
    }
  };

  return (
    <StyledContainer>
      <StyledForm variants={formVariants} initial="hidden" animate="visible" onSubmit={handleSubmit}>
        <StyledTitle>Login to HNIN Connect</StyledTitle>
        <StyledLabel htmlFor="username">Username</StyledLabel>
        <StyledInput
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <StyledLabel htmlFor="password">Password</StyledLabel>
        <StyledInput
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <StyledButton type="submit">Log in</StyledButton>
        {message && <StyledMessage isSuccess={isSuccess}>{message}</StyledMessage>}
        <StyledLinkContainer>
          <StyledLink to="/forgot-password">Forgot Password?</StyledLink>
          <StyledLink to="/register">Register here.</StyledLink>
        </StyledLinkContainer>
      </StyledForm>
    </StyledContainer>
  );
};

export default LoginForm;