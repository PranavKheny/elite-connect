// frontend-app/src/components/HomePage.js

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';

// --- Styled Components ---
const StyledHero = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.text};
  padding: 2rem;
  text-align: center;
`;

const StyledHeading = styled(motion.h1)`
  font-family: ${(props) => props.theme.fonts.heading};
  font-size: ${(props) => props.theme.fontSizes.large};
  font-weight: bold;
  margin-bottom: ${(props) => props.theme.spacing.medium};
`;

const StyledSubtitle = styled(motion.h2)`
  font-family: ${(props) => props.theme.fonts.body};
  font-size: ${(props) => props.theme.fontSizes.medium};
  font-weight: normal;
  margin-bottom: ${(props) => props.theme.spacing.large};
  color: ${(props) => props.theme.colors.accent};
`;

const StyledButton = styled(motion.button)`
  font-family: ${(props) => props.theme.fonts.heading};
  font-size: ${(props) => props.theme.fontSizes.small};
  font-weight: bold;
  padding: 0.8rem 2.5rem;
  border-radius: ${(props) => props.theme.borderRadius};
  text-transform: uppercase;
  cursor: pointer;
  border: 2px solid ${(props) => props.theme.colors.highlight};
  color: ${(props) => props.theme.colors.text};
  background-color: transparent;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: ${(props) => props.theme.colors.highlight};
    color: ${(props) => props.theme.colors.primary};
  }
`;

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// --- The HomePage Component ---
const HomePage = () => (
  <StyledHero variants={containerVariants} initial="hidden" animate="visible">
    <StyledHeading variants={itemVariants}>HNIN Connect</StyledHeading>
    <StyledSubtitle variants={itemVariants}>
      A professional network for high net-worth individuals.
    </StyledSubtitle>
    <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem' }}>
      <Link to="/register">
        <StyledButton>Register</StyledButton>
      </Link>
      <Link to="/login">
        <StyledButton>Login</StyledButton>
      </Link>
    </motion.div>
  </StyledHero>
);

export default HomePage;