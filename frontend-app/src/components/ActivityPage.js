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
  max-width: 700px;
  margin-bottom: 2rem;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1rem;
  gap: 1rem;
`;

const Subtle = styled.span`
  opacity: 0.7;
  font-size: 0.9rem;
`;

const StyledList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StyledListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${(props) => props.theme?.colors?.accent || '#475569'};
  &:last-child { border-bottom: none; }
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  transition: background-color 0.2s, color 0.2s;
  &:hover { background-color: #3b82f6; color: #334155; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const StyledDeclineButton = styled(StyledButton)`
  border: 2px solid #ef4444;
  color: #ef4444;
  &:hover { background-color: #ef4444; color: #f8fafc; }
`;

const Banner = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: #0f172a;
  border: 1px solid #475569;
  max-width: 700px;
  width: 100%;
  text-align: center;
`;

const Empty = styled.p`
  margin: 0.5rem 0 0;
  opacity: 0.75;
`;

function fromNow(ts) {
  if (!ts) return '';
  const created = new Date(ts);
  const diffMs = Date.now() - created.getTime();
  const s = Math.max(0, Math.floor(diffMs / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const ActivityPage = () => {
  const [likes, setLikes] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = useAuth();
  const navigate = useNavigate();

  const fetchActivities = async (silent = false) => {
    if (!auth.token) {
      navigate('/login');
      return;
    }
    try {
      if (!silent) setLoading(true);
      const [likesRes, consRes] = await Promise.all([
        axios.get('http://localhost:8080/api/users/likes/received', {
          headers: { Authorization: `Bearer ${auth.token}` }
        }),
        axios.get('http://localhost:8080/api/users/connections/received', {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
      ]);
      setLikes(Array.isArray(likesRes.data) ? likesRes.data : []);
      setConnectionRequests(Array.isArray(consRes.data) ? consRes.data : []);
      if (!silent) setMessage('');
    } catch (err) {
      console.error('Failed to fetch activities:', err);
      if (!silent) setMessage('Failed to load activities.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial load + auto-refresh every 10s
  useEffect(() => {
    fetchActivities(false);
    const t = setInterval(() => fetchActivities(true), 10000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token]);

  const handleAccept = async (requestId) => {
    try {
      setBusyId(requestId);
      await axios.put(
        `http://localhost:8080/api/users/connections/${requestId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setMessage('Connection request accepted.');
      await fetchActivities(true);
    } catch (error) {
      console.error('Error accepting request:', error);
      setMessage('Error accepting request.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      setBusyId(requestId);
      await axios.put(
        `http://localhost:8080/api/users/connections/${requestId}/decline`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setMessage('Connection request declined.');
      await fetchActivities(true);
    } catch (error) {
      console.error('Error declining request:', error);
      setMessage('Error declining request.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <StyledContainer>
      <StyledTitle>Activity</StyledTitle>

      {message ? <Banner>{message}</Banner> : null}

      <StyledCard>
        <HeaderRow>
          <h3>Incoming Connection Requests</h3>
          <Subtle>{loading ? 'Loading…' : `${connectionRequests.length} item(s)`}</Subtle>
        </HeaderRow>

        {connectionRequests.length > 0 ? (
          <StyledList>
            {connectionRequests.map((req) => {
              const senderName = req?.senderUsername || 'Unknown';
              const when = fromNow(req?.createdAt);
              const pending = (req?.status || '').toUpperCase() === 'PENDING';
              return (
                <StyledListItem key={req.id}>
                  <Left>
                    <div>Request from: <strong>{senderName}</strong></div>
                    <Subtle>{when}</Subtle>
                  </Left>
                  <Right>
                    <StyledButton
                      disabled={!pending || busyId === req.id}
                      onClick={() => handleAccept(req.id)}
                    >
                      Accept
                    </StyledButton>
                    <StyledDeclineButton
                      disabled={!pending || busyId === req.id}
                      onClick={() => handleDecline(req.id)}
                    >
                      Decline
                    </StyledDeclineButton>
                  </Right>
                </StyledListItem>
              );
            })}
          </StyledList>
        ) : (
          <Empty>No new connection requests.</Empty>
        )}
      </StyledCard>

      <StyledCard>
        <HeaderRow>
          <h3>Incoming Likes</h3>
          <Subtle>{loading ? 'Loading…' : `${likes.length} item(s)`}</Subtle>
        </HeaderRow>

        {likes.length > 0 ? (
          <StyledList>
            {likes.map((like) => {
              const likerName = like?.likerUsername || 'Unknown';
              const when = fromNow(like?.createdAt);
              return (
                <StyledListItem key={like.id}>
                  <Left>
                    <div>New like from: <strong>{likerName}</strong></div>
                    <Subtle>{when}</Subtle>
                  </Left>
                  <Right>
                    {/* Placeholder: later wire to a profile modal or /users/:id route */}
                    <StyledButton disabled>View Profile</StyledButton>
                  </Right>
                </StyledListItem>
              );
            })}
          </StyledList>
        ) : (
          <Empty>No new likes.</Empty>
        )}
      </StyledCard>
    </StyledContainer>
  );
};

export default ActivityPage;
