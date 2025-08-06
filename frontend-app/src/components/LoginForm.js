// frontend-app/src/components/LoginForm.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';

// --- Styled Components ---
const StyledContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.text};
`;

const StyledForm = styled(motion.form)`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.secondary};
  padding: 4rem; /* Increased padding */
  border-radius: ${(props) => props.theme.borderRadius};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px; /* Increased max-width */
`;

const StyledTitle = styled.h2`
  font-family: ${(props) => props.theme.fonts.heading};
  font-size: ${(props) => props.theme.fontSizes.medium};
  margin-bottom: ${(props) => props.theme.spacing.large};
  text-align: center;
  text-transform: uppercase;
  color: ${(props) => props.theme.colors.text};
`;

const StyledLabel = styled.label`
  font-family: ${(props) => props.theme.fonts.body};
  margin-bottom: 0.5rem;
  color: ${(props) => props.theme.colors.accent}; /* A subtle accent color for labels */
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: ${(props) => props.theme.spacing.large}; /* Increased margin */
  background-color: transparent;
  border: 1px solid ${(props) => props.theme.colors.accent};
  border-radius: ${(props) => props.theme.borderRadius};
  color: ${(props) => props.theme.colors.text};
  font-family: ${(props) => props.theme.fonts.body};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.highlight};
  }
`;

const StyledButton = styled(motion.button)`
  font-family: ${(props) => props.theme.fonts.heading};
  font-weight: bold;
  padding: 1rem;
  border-radius: ${(props) => props.theme.borderRadius};
  background-color: transparent; /* Made the button outlined */
  color: ${(props) => props.theme.colors.text};
  border: 2px solid ${(props) => props.theme.colors.highlight}; /* Added a solid border */
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: ${(props) => props.theme.colors.highlight};
    color: ${(props) => props.theme.colors.primary};
  }
`;

const StyledMessage = styled.p`
  text-align: center;
  margin-top: ${(props) => props.theme.spacing.medium};
  color: ${(props) => (props.isSuccess ? 'green' : props.theme.colors.danger)};
`;

const StyledLinkContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${(props) => props.theme.spacing.medium};
`;

const StyledLink = styled(Link)`
  font-family: ${(props) => props.theme.fonts.body};
  color: ${(props) => props.theme.colors.highlight};
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('http://localhost:8080/api/users/login', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const jwtToken = response.data.jwtToken;
      setMessage('Login successful! Redirecting to profile...');
      setIsSuccess(true);
      localStorage.setItem('jwtToken', jwtToken);
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
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