// frontend-app/src/components/RegisterForm.js

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
  padding: 4rem;
  border-radius: ${(props) => props.theme.borderRadius};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
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
  color: ${(props) => props.theme.colors.accent};
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: ${(props) => props.theme.spacing.large};
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
  background-color: transparent;
  color: ${(props) => props.theme.colors.text};
  border: 2px solid ${(props) => props.theme.colors.highlight};
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

const StyledLink = styled(Link)`
  text-align: center;
  margin-top: ${(props) => props.theme.spacing.medium};
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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('/api/users/register', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setMessage('Registration successful! You can now log in.');
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      setMessage(error.response ? `Error: ${error.response.data.message}` : 'An unexpected error occurred.');
      setIsSuccess(false);
    }
  };

  return (
    <StyledContainer>
      <StyledForm variants={formVariants} initial="hidden" animate="visible" onSubmit={handleSubmit}>
        <StyledTitle>Register for HNIN Connect</StyledTitle>
        <StyledLabel htmlFor="username">Username</StyledLabel>
        <StyledInput
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <StyledLabel htmlFor="email">Email</StyledLabel>
        <StyledInput
          type="email"
          id="email"
          name="email"
          value={formData.email}
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
        <StyledLabel htmlFor="fullName">Full Name</StyledLabel>
        <StyledInput
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
        />
        <StyledButton type="submit">Register</StyledButton>
        {message && <StyledMessage isSuccess={isSuccess}>{message}</StyledMessage>}
        <StyledLink to="/login">Already have an account? Login here.</StyledLink>
      </StyledForm>
    </StyledContainer>
  );
};

export default RegisterForm;