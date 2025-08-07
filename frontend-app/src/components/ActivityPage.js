// frontend-app/src/components/ActivityPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useAuth } from '../App';

const StyledContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 90vh;
  background-color: #334155;
  color: #f8fafc;
  padding: 2rem;
`;

const StyledTitle = styled.h2`
  font-family: 'sans-serif';
  font-size: 1.5rem;
  text-transform: uppercase;
  color: #f8fafc;
  margin-bottom: 2rem;
`;

const StyledCard = styled(motion.div)`
  background-color: #1f2937;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  margin-bottom: 2rem;
`;

const StyledList = styled.ul`
  list-style: none;
  padding: 0;
`;

const StyledListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.accent};
`;

const StyledButton = styled.button`
  font-family: 'sans-serif';
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background-color: transparent;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  margin-left: 1rem;

  &:hover {
    background-color: #3b82f6;
    color: #334155;
  }
`;

const StyledDeclineButton = styled(StyledButton)`
  border: 2px solid #ef4444;
  color: #ef4444;

  &:hover {
    background-color: #ef4444;
    color: #f8fafc;
  }
`;

const ActivityPage = () => {
  const [likes, setLikes] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [message, setMessage] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
      if (!auth.token) {
        navigate('/login');
        return;
      }
      try {
        const likesResponse = await axios.get('http://localhost:8080/api/users/likes/received', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        setLikes(likesResponse.data);

        const connectionsResponse = await axios.get('http://localhost:8080/api/users/connections/received', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        setConnectionRequests(connectionsResponse.data);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        setMessage('Failed to load activities.');
      }
    };
    fetchActivities();
  }, [auth.token, navigate]);
  
  const handleAccept = async (requestId) => {
    try {
      await axios.put(`http://localhost:8080/api/users/connections/${requestId}/accept`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setMessage('Connection request accepted!');
      setConnectionRequests(connectionRequests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error accepting request:', error);
      setMessage('Error accepting request.');
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await axios.put(`http://localhost:8080/api/users/connections/${requestId}/decline`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setMessage('Connection request declined.');
      setConnectionRequests(connectionRequests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error declining request:', error);
      setMessage('Error declining request.');
    }
  };


  return (
    <StyledContainer>
      <StyledTitle>Activity</StyledTitle>

      <StyledCard>
        <h3>Incoming Connection Requests</h3>
        {connectionRequests.length > 0 ? (
          <StyledList>
            {connectionRequests.map(req => (
              <StyledListItem key={req.id}>
                <span>Request from: {req.sender.username}</span>
                <div>
                  <StyledButton onClick={() => handleAccept(req.id)}>Accept</StyledButton>
                  <StyledDeclineButton onClick={() => handleDecline(req.id)}>Decline</StyledDeclineButton>
                </div>
              </StyledListItem>
            ))}
          </StyledList>
        ) : (
          <p>No new connection requests.</p>
        )}
      </StyledCard>

      <StyledCard>
        <h3>Incoming Likes</h3>
        {likes.length > 0 ? (
          <StyledList>
            {likes.map(like => (
              <StyledListItem key={like.id}>
                <span>New like from: {like.liker.username}</span>
                <StyledButton>View Profile</StyledButton>
              </StyledListItem>
            ))}
          </StyledList>
        ) : (
          <p>No new likes.</p>
        )}
      </StyledCard>
    </StyledContainer>
  );
};

export default ActivityPage;