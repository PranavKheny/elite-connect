// frontend-app/src/components/Navbar.js

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../App';

const StyledNav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: ${(props) => props.theme.colors.secondary};
  color: ${(props) => props.theme.colors.text};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const StyledLink = styled(Link)`
  font-family: ${(props) => props.theme.fonts.heading};
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
  text-decoration: none;
  margin-right: 1.5rem;
  transition: color 0.3s;

  &:hover {
    color: ${(props) => props.theme.colors.highlight};
  }
`;

const StyledLogoutButton = styled.button`
  font-family: ${(props) => props.theme.fonts.heading};
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: ${(props) => props.theme.borderRadius};
  background-color: transparent;
  border: 2px solid ${(props) => props.theme.colors.danger};
  color: ${(props) => props.theme.colors.danger};
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: ${(props) => props.theme.colors.danger};
    color: ${(props) => props.theme.colors.text};
  }
`;

const Navbar = () => {
  const auth = useAuth();
  
  return (
    <StyledNav>
      <div>
        <StyledLink to="/dashboard">Dashboard</StyledLink>
        <StyledLink to="/profile">Profile</StyledLink>
        <StyledLink to="/messages">Messages</StyledLink>
        <StyledLink to="/activity">Activity</StyledLink>
      </div>
      <div>
        <StyledLogoutButton onClick={auth.logout}>Logout</StyledLogoutButton>
      </div>
    </StyledNav>
  );
};

export default Navbar;