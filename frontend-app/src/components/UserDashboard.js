import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useAuth } from '../App';
import { getSentLikeIds, getSentConnectionIds, fetchMatchesOf } from '../services/api';

const BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

/* ============================== UI ============================== */
const StyledContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
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
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledUsername = styled.h3`
  font-family: 'sans-serif';
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const StyledBio = styled.p`
  font-family: 'serif';
  font-size: 1rem;
  text-align: center;
  color: #94a3b8;
  margin-bottom: 1rem;
  min-height: 2.5rem;
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
  border-radius: 10px;
  background-color: transparent;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  cursor: pointer;
  transition: background-color .2s, color .2s, transform .05s;
  &:hover { background-color: #3b82f6; color: #0f172a; }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: .6; cursor: not-allowed; }
`;

const Banner = styled.p`
  font-family: 'serif';
  text-align: center;
  margin-bottom: 1rem;
`;

const Toast = styled.div`
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(34,197,94,.2);
  border: 1px solid rgba(34,197,94,.5);
  color: #e7fee7;
  padding: 10px 14px;
  border-radius: 10px;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 10px rgba(0,0,0,.25);
  z-index: 50;
`;

/* ============================== Helpers ============================== */
const isVerifiedUser = (u) => {
  if (u?.verified === true) return true;
  const vs = (u?.verificationStatus || '').toString().toLowerCase();
  return vs === 'verified';
};
const toId = (x) => String(x ?? '');

// Accept arrays of primitives or objects ({receiverId}|{userId}|{targetId}|{id})
const toUserIdSet = (arr) => {
  const out = new Set();
  (arr || []).forEach((item) => {
    if (item == null) return;
    if (typeof item === 'object') {
      const id = item.receiverId ?? item.userId ?? item.targetId ?? item.id;
      if (id != null) out.add(toId(id));
    } else {
      out.add(toId(item));
    }
  });
  return out;
};

/* ============================== Component ============================== */
const UserDashboard = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  // destructure primitives to satisfy ESLint deps
  const token = auth?.token;
  const myId  = auth?.user?.id;

  const [users, setUsers] = useState([]);
  const [banner, setBanner] = useState('Loading users...');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [userActions, setUserActions] = useState({
    likedIds: new Set(),
    requestedIds: new Set(),
    matchedIds: new Set(),
  });

  const prevMatchedIdsRef = useRef(new Set());
  const [toast, setToast] = useState('');

  const idToUsername = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(toId(u.id), u.username));
    return map;
  }, [users]);

  const idToUsernameRef = useRef(new Map());
  useEffect(() => { idToUsernameRef.current = idToUsername; }, [idToUsername]);

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(''), 2200);
  };

  /* --------- Data loaders (stable with useCallback) --------- */
  const fetchUserActions = useCallback(async () => {
    if (!token || !myId) return;
    try {
      const [likesArr, reqArr, matchesArr] = await Promise.all([
        getSentLikeIds(token),
        getSentConnectionIds(token),
        fetchMatchesOf(myId, token),
      ]);

      const likedIds     = toUserIdSet(likesArr);
      const requestedIds = toUserIdSet(reqArr);
      const matchedIds   = new Set((matchesArr || []).map((m) => toId(m.id)));

      setUserActions({ likedIds, requestedIds, matchedIds });

      // New match toast
      const prev = prevMatchedIdsRef.current;
      const newly = [];
      matchedIds.forEach((id) => { if (!prev.has(id)) newly.push(id); });
      if (newly.length) {
        const first = newly[0];
        const name = idToUsernameRef.current.get(first);
        showToast(name ? `It’s a match with ${name}!` : `It’s a match!`);
      }
      prevMatchedIdsRef.current = matchedIds;
    } catch (error) {
      console.error('Failed to fetch user actions:', error);
    }
  }, [token, myId]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(
        `${BASE_URL}/api/users?page=${page}&size=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const all = response.data || [];
      const filtered = all.filter((u) => isVerifiedUser(u) && toId(u.id) !== toId(myId));
      setUsers(filtered);

      const pagesHeader = response.headers['x-total-pages'];
      const pages = parseInt(pagesHeader, 10);
      setTotalPages(Number.isNaN(pages) ? 0 : pages);
      setBanner('');
    } catch (error) {
      console.error('Failed to fetch users:', error.response?.data || error.message);
      setBanner('Session expired or access denied. Please log in again.');
      // optional: auth.logout();  // keep or remove depending on your flow
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [token, myId, page, navigate]);

  /* ------------------------------ Effects ------------------------------ */
  // Initial load
  useEffect(() => {
    const boot = async () => {
      if (!token) {
        setBanner('You are not logged in. Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      await Promise.all([fetchUserActions(), fetchUsers()]);
    };
    boot();
  }, [token, fetchUserActions, fetchUsers, navigate]);

  // Poll as a backup
  useEffect(() => {
    if (!token) return;
    const t = setInterval(() => fetchUserActions(), 10000);
    return () => clearInterval(t);
  }, [token, fetchUserActions]);

  // Listen for Activity → “matches updated” (instant refresh)
  useEffect(() => {
    const onBump = () => fetchUserActions();
    const onStorage = (e) => { if (e.key === 'hnin:matches:ping') fetchUserActions(); };
    window.addEventListener('hnin:matches-updated', onBump);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('hnin:matches-updated', onBump);
      window.removeEventListener('storage', onStorage);
    };
  }, [fetchUserActions]);

  /* ------------------------------ Actions ------------------------------ */
  const optimisticUpdate = (kind, userId) => {
    const id = toId(userId);
    setUserActions((prev) => {
      const likedIds = new Set(prev.likedIds);
      const requestedIds = new Set(prev.requestedIds);
      const matchedIds = new Set(prev.matchedIds);
      if (kind === 'like') likedIds.add(id);
      if (kind === 'request') requestedIds.add(id);
      return { likedIds, requestedIds, matchedIds };
    });
  };

  const handleLike = async (userId) => {
    const id = toId(userId);
    optimisticUpdate('like', id);
    try {
      await axios.post(
        `${BASE_URL}/api/users/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchUserActions();
    } catch (error) {
      const msg = String(error?.response?.data?.message || error?.message || '');
      if (/already/i.test(msg) || /409/.test(msg)) {
        await fetchUserActions();
        return;
      }
      // rollback on true failure
      setUserActions((prev) => {
        const likedIds = new Set(prev.likedIds);
        likedIds.delete(id);
        return { ...prev, likedIds };
      });
      setBanner('Error liking user.');
      setTimeout(() => setBanner(''), 2500);
    }
  };

  const handleConnect = async (userId) => {
    const id = toId(userId);
    optimisticUpdate('request', id);
    try {
      await axios.post(
        `${BASE_URL}/api/users/${id}/connect`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchUserActions();
    } catch (error) {
      const msg = String(error?.response?.data?.message || error?.message || '');
      if (/already/i.test(msg) || /409/.test(msg)) {
        await fetchUserActions();
        return;
      }
      setUserActions((prev) => {
        const requestedIds = new Set(prev.requestedIds);
        requestedIds.delete(id);
        return { ...prev, requestedIds };
      });
      setBanner('Error sending connection request.');
      setTimeout(() => setBanner(''), 2500);
    }
  };

  const hasLiked = (userId) => userActions.likedIds.has(toId(userId));
  const hasSentRequest = (userId) => userActions.requestedIds.has(toId(userId));
  const isMatched = (userId) => userActions.matchedIds.has(toId(userId));

  if (banner) {
    return (
      <StyledContainer>
        {toast && <Toast role="status">{toast}</Toast>}
        <Banner>{banner}</Banner>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      {toast && <Toast role="status">{toast}</Toast>}

      <StyledUserList>
        {users.map((user) => (
          <StyledProfileCard key={user.id}>
            <StyledUsername>{user.username}</StyledUsername>
            <StyledBio>{user.bio || ' '}</StyledBio>

            <ButtonGroup>
              {isMatched(user.id) ? (
                <StyledButton onClick={() => navigate(`/messages?user=${encodeURIComponent(user.username)}`)}>
                  Message
                </StyledButton>
              ) : (
                <>
                  <StyledButton disabled={hasLiked(user.id)} onClick={() => handleLike(user.id)}>
                    {hasLiked(user.id) ? 'Liked' : 'Like'}
                  </StyledButton>
                  <StyledButton disabled={hasSentRequest(user.id)} onClick={() => handleConnect(user.id)}>
                    {hasSentRequest(user.id) ? 'Request Sent' : 'Connect'}
                  </StyledButton>
                </>
              )}
            </ButtonGroup>
          </StyledProfileCard>
        ))}
      </StyledUserList>

      {totalPages > 1 && (
        <ButtonGroup style={{ marginTop: '2rem' }}>
          {page > 0 && <StyledButton onClick={() => setPage((p) => p - 1)}>Previous</StyledButton>}
          {page < totalPages - 1 && <StyledButton onClick={() => setPage((p) => p + 1)}>Next</StyledButton>}
        </ButtonGroup>
      )}
    </StyledContainer>
  );
};

export default UserDashboard;
