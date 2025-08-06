// frontend-app/src/components/UserProfile.js

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const StyledProfileBox = styled(motion.div)`
  background-color: #1f2937; /* Secondary Background */
  padding: 3rem;
  border-radius: 8px; /* Consistent border radius */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem; /* Generous spacing */
  border-bottom: 1px solid #94a3b8; /* Accent color */
  padding-bottom: 1rem;
`;

const StyledTitle = styled.h2`
  font-family: 'sans-serif';
  font-size: 1.5rem;
  text-transform: uppercase;
  color: #f8fafc;
`;

const StyledInfo = styled.p`
  font-family: 'serif';
  margin-bottom: 1rem;
  color: #f8fafc;
`;

const StyledLabel = styled.span`
  font-weight: bold;
  color: #94a3b8;
`;

const StyledButton = styled(motion.button)`
  font-family: 'sans-serif';
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background-color: transparent;
  border: 2px solid #3b82f6;
  color: #f8fafc;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  margin-left: 1rem;

  &:hover {
    background-color: #3b82f6;
    color: #334155;
  }
`;

const StyledLogoutButton = styled(StyledButton)`
  border: 2px solid #ef4444; /* Danger color for logout button */
  color: #ef4444;

  &:hover {
    background-color: #ef4444;
    color: #f8fafc;
  }
`;

const StyledMessage = styled.p`
  text-align: center;
  font-family: 'serif';
  color: #f8fafc;
`;

// --- Animation Variants ---
const profileBoxVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const UserProfile = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    // Check if the user is verified after every render
    if (auth.user && auth.user.isVerified) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    }
  }, [auth.user, navigate]);


  if (!auth.isAuthenticated) {
    return (
      <StyledContainer>
        <StyledMessage>You are not logged in. Redirecting to login...</StyledMessage>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledProfileBox variants={profileBoxVariants} initial="hidden" animate="visible">
        <StyledHeader>
          <StyledTitle>User Profile</StyledTitle>
          <div>
            <StyledButton onClick={() => console.log("Edit Profile button clicked!")}>Edit Profile</StyledButton>
            <StyledLogoutButton onClick={auth.logout}>
              Logout
            </StyledLogoutButton>
          </div>
        </StyledHeader>
        {auth.user ? (
          <div>
            <StyledInfo>
              <StyledLabel>Username:</StyledLabel> {auth.user.username}
            </StyledInfo>
            <StyledInfo>
              <StyledLabel>Full Name:</StyledLabel> {auth.user.fullName}
            </StyledInfo>
            <StyledInfo>
              <StyledLabel>Email:</StyledLabel> {auth.user.email}
            </StyledInfo>
            <StyledInfo>
              <StyledLabel>Bio:</StyledLabel> {auth.user.bio || 'N/A'}
            </StyledInfo>
            <StyledInfo>
              <StyledLabel>Verification Status:</StyledLabel> {auth.user.isVerified ? 'Verified' : 'Pending'}
            </StyledInfo>
            {auth.user.verificationNotes && (
                <StyledInfo>
                    <StyledLabel>Verification Notes:</StyledLabel> {auth.user.verificationNotes}
                </StyledInfo>
            )}
          </div>
        ) : (
          <StyledMessage>No user data found.</StyledMessage>
        )}
      </StyledProfileBox>
    </StyledContainer>
  );
};

export default UserProfile;