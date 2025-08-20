import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useAuth } from '../App';

const StyledContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #334155;
  color: #f8fafc;
  padding: 2rem;
`;

const StyledForm = styled(motion.form)`
  display: flex;
  flex-direction: column;
  background-color: #1f2937;
  padding: 4rem;
  border-radius: 8px;
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

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.8rem;
  padding-right: 44px; /* space for the icon */
  background-color: transparent;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  color: #f8fafc;
  font-family: 'serif';
  &:focus { outline: none; border-color: #3b82f6; }
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 8px;
  &:hover { background: rgba(148,163,184,.15); color: #e2e8f0; }
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
  &:hover { background-color: #3b82f6; color: #334155; }
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
  &:hover { text-decoration: underline; }
`;

const formVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Eye = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOff = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3l18 18"/>
    <path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.42M9.88 4.24A10.87 10.87 0 0 1 12 4c6.5 0 10 8 10 8a17.46 17.46 0 0 1-3.06 4.38M6.1 6.1C3.56 8 2 12 2 12a17.6 17.6 0 0 0 6.1 6.1"/>
  </svg>
);

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('http://localhost:8080/api/users/login', formData);
      const jwtToken = res.data.jwtToken;
      const me = await axios.get('http://localhost:8080/api/users/me', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const user = me.data;
      auth.login(user, jwtToken);

      setMessage('Login successful! Redirecting…');
      setIsSuccess(true);
      setTimeout(() => navigate(user.verified ? '/dashboard' : '/profile'), 1200);
    } catch (err) {
      setMessage(err.response ? `Error: ${err.response.data.message}` : 'An unexpected error occurred.');
      setIsSuccess(false);
    }
  };

  return (
    <StyledContainer>
      <StyledForm variants={formVariants} initial="hidden" animate="visible" onSubmit={handleSubmit}>
        <StyledTitle>Login to HNIN Connect</StyledTitle>

        <StyledLabel htmlFor="username">Username</StyledLabel>
        <InputWrapper>
          <StyledInput id="username" name="username" type="text" value={formData.username} onChange={handleChange} required />
        </InputWrapper>

        <StyledLabel htmlFor="password">Password</StyledLabel>
        <InputWrapper>
          <StyledInput
            id="password"
            name="password"
            type={showPwd ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
          />
          <ToggleButton type="button" aria-label={showPwd ? 'Hide password' : 'Show password'} onClick={() => setShowPwd(v => !v)}>
            {showPwd ? <EyeOff /> : <Eye />}
          </ToggleButton>
        </InputWrapper>

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
