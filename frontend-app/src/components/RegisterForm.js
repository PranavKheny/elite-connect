// frontend-app/src/components/RegisterForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';

/* ===================== Styled ===================== */
const StyledContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(p) => p.theme.colors.primary};
  color: ${(p) => p.theme.colors.text};
`;

const StyledForm = styled(motion.form)`
  display: flex;
  flex-direction: column;
  background-color: ${(p) => p.theme.colors.secondary};
  padding: 4rem;
  border-radius: ${(p) => p.theme.borderRadius};
  box-shadow: 0 4px 6px rgba(0,0,0,.1);
  width: 100%;
  max-width: 450px;
`;

const StyledTitle = styled.h2`
  font-family: ${(p) => p.theme.fonts.heading};
  font-size: ${(p) => p.theme.fontSizes.medium};
  margin-bottom: ${(p) => p.theme.spacing.large};
  text-align: center;
  text-transform: uppercase;
  color: ${(p) => p.theme.colors.text};
`;

const StyledLabel = styled.label`
  font-family: ${(p) => p.theme.fonts.body};
  margin-bottom: 0rem;
  color: ${(p) => p.theme.colors.accent};
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: ${(p) => p.theme.spacing.large};
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.8rem;
  padding-right: 48px; /* space for eye button */
  background-color: transparent;
  border: 1px solid ${(p) => p.theme.colors.accent};
  border-radius: ${(p) => p.theme.borderRadius};
  color: ${(p) => p.theme.colors.text};
  font-family: ${(p) => p.theme.fonts.body};
  &:focus { outline: none; border-color: ${(p) => p.theme.colors.highlight}; }
`;

/* reduced slightly so the form is tighter */
const FieldHint = styled.small`
  display: block;
  margin-top: 0px;
  min-height: 14px;
  color: #ef4444;
  opacity: ${(p) => (p.$show ? 1 : 0)};
  transition: opacity .15s ease;
`;

/* perfectly centered eye button */
const ToggleButton = styled.button`
  position: absolute;
  right: 6px;
  top: 30%;
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
  font-family: ${(p) => p.theme.fonts.heading};
  font-weight: bold;
  padding: 1rem;
  border-radius: ${(p) => p.theme.borderRadius};
  background-color: transparent;
  color: ${(p) => p.theme.colors.text};
  border: 2px solid ${(p) => p.theme.colors.highlight};
  cursor: pointer;
  transition: background-color .3s, color .3s;
  &:hover { background-color: ${(p) => p.theme.colors.highlight}; color: ${(p) => p.theme.colors.primary}; }
`;

const StyledMessage = styled.p`
  text-align: center;
  margin-top: ${(p) => p.theme.spacing.medium};
  color: ${(p) => (p.isSuccess ? 'green' : p.theme.colors.danger)};
`;

const StyledLink = styled(Link)`
  text-align: center;
  margin-top: ${(p) => p.theme.spacing.medium};
  color: ${(p) => p.theme.colors.highlight};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const formVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ===================== Icons ===================== */
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

/* ===================== Component ===================== */
const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '', fullName: ''
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  // live validation
  const usernameValid = formData.username.trim().length > 0;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const passwordValid = formData.password.length >= 8;
  const confirmShows = formData.confirmPassword.length > 0;
  const confirmValid = confirmShows && formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!usernameValid || !emailValid || !passwordValid || !confirmValid) return;

    try {
      await axios.post(
        '/api/users/register',
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setMessage('Registration successful! You can now log in.');
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setMessage(err.response ? `Error: ${err.response.data.message}` : 'An unexpected error occurred.');
      setIsSuccess(false);
    }
  };

  return (
    <StyledContainer>
      <StyledForm variants={formVariants} initial="hidden" animate="visible" onSubmit={handleSubmit}>
        <StyledTitle>Register for HNIN Connect</StyledTitle>

        <StyledLabel htmlFor="username">Username</StyledLabel>
        <InputWrapper>
          <StyledInput id="username" name="username" type="text"
            value={formData.username} onChange={handleChange} required aria-invalid={!usernameValid}/>
          <FieldHint $show={!usernameValid}>Enter a username.</FieldHint>
        </InputWrapper>

        <StyledLabel htmlFor="email">Email</StyledLabel>
        <InputWrapper>
          <StyledInput id="email" name="email" type="email"
            value={formData.email} onChange={handleChange} required aria-invalid={!emailValid}/>
          <FieldHint $show={!emailValid}>Enter a valid email.</FieldHint>
        </InputWrapper>

        <StyledLabel htmlFor="password">Password</StyledLabel>
        <InputWrapper>
          <StyledInput id="password" name="password" type={showPwd ? 'text' : 'password'}
            value={formData.password} onChange={handleChange} required aria-invalid={!passwordValid}/>
          <ToggleButton type="button" aria-label={showPwd ? 'Hide password' : 'Show password'}
            onClick={() => setShowPwd((v) => !v)}>
            {showPwd ? <EyeOff /> : <Eye />}
          </ToggleButton>
          <FieldHint $show={!passwordValid}>At least 8 characters.</FieldHint>
        </InputWrapper>

        <StyledLabel htmlFor="confirmPassword">Confirm Password</StyledLabel>
        <InputWrapper>
          <StyledInput id="confirmPassword" name="confirmPassword" type={showConfirm ? 'text' : 'password'}
            value={formData.confirmPassword} onChange={handleChange} required
            aria-invalid={confirmShows && !confirmValid}/>
          <ToggleButton type="button" aria-label={showConfirm ? 'Hide password' : 'Show password'}
            onClick={() => setShowConfirm((v) => !v)}>
            {showConfirm ? <EyeOff /> : <Eye />}
          </ToggleButton>
          <FieldHint $show={confirmShows && !confirmValid}>Passwords should match.</FieldHint>
        </InputWrapper>

        <StyledLabel htmlFor="fullName">Full Name</StyledLabel>
        <InputWrapper>
          <StyledInput id="fullName" name="fullName" type="text"
            value={formData.fullName} onChange={handleChange}/>
          <FieldHint $show={false} />
        </InputWrapper>

        <StyledButton type="submit">Register</StyledButton>
        {message && <StyledMessage isSuccess={isSuccess}>{message}</StyledMessage>}
        <StyledLink to="/login">Already have an account? Login here.</StyledLink>
      </StyledForm>
    </StyledContainer>
  );
};
export default RegisterForm;
