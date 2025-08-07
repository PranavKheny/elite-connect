// frontend-app/src/components/UserDashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useAuth } from '../App'; // The useAuth hook is imported here

const StyledContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #334155;
  color: #f8fafc;
  padding: 2rem;
`;

const StyledUserList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
`;

const StyledProfileCard = styled(motion.div)`
  background-color: #1f2937;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledUsername = styled.h3`
  font-family: 'sans-serif';
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #f8fafc;
`;

const StyledBio = styled.p`
  font-family: 'serif';
  font-size: 1rem;
  text-align: center;
  color: #94a3b8;
  margin-bottom: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const StyledButton = styled(motion.button)`
  font-family: 'sans-serif';
  font-weight: bold;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  background-color: transparent;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  
  &:hover {
    background-color: #3b82f6;
    color: #334155;
  }
`;

const StyledMessage = styled.p`
  font-family: 'serif';
  text-align: center;
  color: #f8fafc;
`;


const UserDashboard = () => {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('Loading users...');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [userActions, setUserActions] = useState({ likes: [], connections: [] });
    const navigate = useNavigate();
    const auth = useAuth(); // NEW: The auth object is now correctly initialized

    // --- Fetches user's likes and connection requests ---
    const fetchUserActions = async (token) => {
        try {
            const likesResponse = await axios.get('http://localhost:8080/api/users/likes', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const connectionsResponse = await axios.get('http://localhost:8080/api/users/connections', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserActions({ likes: likesResponse.data, connections: connectionsResponse.data });

        } catch (error) {
            console.error('Failed to fetch user actions:', error);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            const jwtToken = auth.token;

            if (!jwtToken) {
                setMessage('You are not logged in. Redirecting to login...');
                setTimeout(() => navigate('/login'), 1500);
                return;
            }
            
            await fetchUserActions(jwtToken);
            
            try {
                const response = await axios.get(`http://localhost:8080/api/users?page=${page}&size=10`, {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                });
                
                setUsers(response.data);
                setTotalPages(parseInt(response.headers['x-total-pages'], 10));
                setMessage('');

            } catch (error) {
                console.error('Failed to fetch users:', error.response ? error.response.data : error.message);
                setMessage('Session expired or access denied. Please log in again.');
                auth.logout();
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        fetchUsers();
    }, [page, auth, navigate]);

    const handleLike = async (userId) => {
        try {
            await axios.post(`http://localhost:8080/api/users/${userId}/like`, {}, {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            setMessage('Liked user!');
            await fetchUserActions(auth.token);
            setTimeout(() => setMessage(''), 1500);
        } catch (error) {
            if (error.response && error.response.data.message.includes('already liked')) {
                await fetchUserActions(auth.token);
            } else {
                setMessage(error.response.data.message || 'Error liking user.');
                setTimeout(() => setMessage(''), 3000);
            }
        }
    };

    const handleConnect = async (userId) => {
        try {
            await axios.post(`http://localhost:8080/api/users/${userId}/connect`, {}, {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            setMessage('Connection request sent!');
            await fetchUserActions(auth.token);
            setTimeout(() => setMessage(''), 1500);
        } catch (error) {
            if (error.response && error.response.data.message.includes('already sent')) {
                await fetchUserActions(auth.token);
            } else {
                setMessage(error.response.data.message || 'Error sending connection request.');
                setTimeout(() => setMessage(''), 3000);
            }
        }
    };

    // --- Helper function to check if a user has been liked or a connection request has been sent ---
    const hasLiked = (userId) => userActions.likes.some(like => like.likedUser.id === userId);
    const hasSentRequest = (userId) => userActions.connections.some(conn => conn.receiver.id === userId);

    if (message) {
        return (
            <StyledContainer>
                <StyledMessage>{message}</StyledMessage>
            </StyledContainer>
        );
    }

    return (
        <StyledContainer>
            <StyledUserList>
                {users.map(user => (
                    <StyledProfileCard key={user.id}>
                        <StyledUsername>{user.username}</StyledUsername>
                        <StyledBio>{user.bio}</StyledBio>
                        <ButtonGroup>
                            {hasLiked(user.id) ? (
                                <StyledButton disabled>Liked</StyledButton>
                            ) : (
                                <StyledButton onClick={() => handleLike(user.id)}>Like</StyledButton>
                            )}
                            {hasSentRequest(user.id) ? (
                                <StyledButton disabled>Request Sent</StyledButton>
                            ) : (
                                <StyledButton onClick={() => handleConnect(user.id)}>Connect</StyledButton>
                            )}
                        </ButtonGroup>
                    </StyledProfileCard>
                ))}
            </StyledUserList>
            {totalPages > 1 && (
                <ButtonGroup style={{ marginTop: '2rem' }}>
                    {page > 0 && (
                        <StyledButton onClick={() => setPage(page - 1)}>Previous</StyledButton>
                    )}
                    {page < totalPages - 1 && (
                        <StyledButton onClick={() => setPage(page + 1)}>Next</StyledButton>
                    )}
                </ButtonGroup>
            )}
        </StyledContainer>
    );
};

export default UserDashboard;