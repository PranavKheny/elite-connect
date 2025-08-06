// frontend-app/src/components/UserProfile.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  padding: 2rem;
`;

const StyledProfileBox = styled(motion.div)`
  background-color: ${(props) => props.theme.colors.secondary};
  padding: 3rem;
  border-radius: ${(props) => props.theme.borderRadius};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.large};
  border-bottom: 1px solid ${(props) => props.theme.colors.accent};
  padding-bottom: ${(props) => props.theme.spacing.medium};
`;

const StyledTitle = styled.h2`
  font-family: ${(props) => props.theme.fonts.heading};
  font-size: ${(props) => props.theme.fontSizes.medium};
  text-transform: uppercase;
  color: ${(props) => props.theme.colors.text};
`;

const StyledInfo = styled.p`
  font-family: ${(props) => props.theme.fonts.body};
  margin-bottom: ${(props) => props.theme.spacing.medium};
  color: ${(props) => props.theme.colors.text};
`;

const StyledLabel = styled.span`
  font-weight: bold;
  color: ${(props) => props.theme.colors.accent};
`;

const StyledButton = styled(motion.button)`
  font-family: ${(props) => props.theme.fonts.heading};
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: ${(props) => props.theme.borderRadius};
  background-color: transparent;
  border: 2px solid ${(props) => props.theme.colors.highlight};
  color: ${(props) => props.theme.colors.text};
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: ${(props) => props.theme.colors.highlight};
    color: ${(props) => props.theme.colors.primary};
  }
`;

const StyledLogoutButton = styled(StyledButton)`
  border: 2px solid ${(props) => props.theme.colors.danger};
  color: ${(props) => props.theme.colors.danger};

  &:hover {
    background-color: ${(props) => props.theme.colors.danger};
    color: ${(props) => props.theme.colors.text};
  }
`;

const StyledLink = styled.a`
  color: ${(props) => props.theme.colors.highlight};
  text-decoration: none;
  margin-left: ${(props) => props.theme.spacing.small};
`;

const StyledMessage = styled.p`
  text-align: center;
  font-family: ${(props) => props.theme.fonts.body};
  color: ${(props) => props.theme.colors.text};
`;

// --- Animation Variants ---
const profileBoxVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('Loading profile...');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const jwtToken = localStorage.getItem('jwtToken');

      if (!jwtToken) {
        setMessage('You are not logged in. Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      try {
        const response = await axios.get('http://localhost:8080/api/users', {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        const currentUser = response.data.find(u => u.username === 'testuser');
        if (currentUser) {
          setUser(currentUser);
          setMessage('');
        } else {
          setMessage('Could not find user profile.');
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error.response ? error.response.data : error.message);
        setMessage('Session expired or access denied. Please log in again.');
        localStorage.removeItem('jwtToken');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    navigate('/login');
  };

  const handleEditProfile = () => {
    console.log("Edit Profile button clicked!");
  };

  if (message) {
    return (
      <StyledContainer>
        <StyledMessage>{message}</StyledMessage>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledProfileBox variants={profileBoxVariants} initial="hidden" animate="visible">
        <StyledHeader>
          <StyledTitle>User Profile</StyledTitle>
          <div>
            <StyledButton onClick={handleEditProfile}>Edit Profile</StyledButton>
            <StyledLogoutButton onClick={handleLogout} style={{ marginLeft: '1rem' }}>
              Logout
            </StyledLogoutButton>
          </div>
        </StyledHeader>
        {user ? (
          <div>
            <StyledInfo>
              <StyledLabel>Username:</StyledLabel> {user.username}
            </StyledInfo>
            <StyledInfo>
              <StyledLabel>Full Name:</StyledLabel> {user.fullName}
            </StyledInfo>
            <StyledInfo>
              <StyledLabel>Email:</StyledLabel> {user.email}
            </StyledInfo>
            <StyledInfo>
              <StyledLabel>Bio:</StyledLabel> {user.bio || 'N/A'}
            </StyledInfo>
          </div>
        ) : (
          <StyledMessage>No user data found.</StyledMessage>
        )}
      </StyledProfileBox>
    </StyledContainer>
  );
};

export default UserProfile;