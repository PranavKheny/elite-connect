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

const InitialAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(59,130,246,.35), rgba(255,255,255,.08));
  border: 1px solid rgba(255,255,255,.15);
  color: #e8edf2;
  font-weight: 700;
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
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

/* ---- Match modal ---- */
const ModalScrim = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  display: grid; place-items: center;
  z-index: 1000;
`;
const ModalCard = styled.div`
  width: min(520px, 92vw);
  background: #0f172a;
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0,0,0,.4);
  color: #e8edf2;
`;
const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 12px;
  text-align: center;
`;
const MatchFaces = styled.div`
  display: flex; justify-content: center; align-items: center; gap: 18px; margin: 12px 0 18px;
`;
const Face = styled(InitialAvatar)`
  width: 72px; height: 72px; font-size: 1.4rem; margin: 0;
`;
const ModalActions = styled.div`
  display: flex; justify-content: center; gap: 12px; margin-top: 8px;
`;
const Primary = styled(StyledButton)``;
const Ghost = styled(StyledButton)`
  border-color: rgba(255,255,255,.35);
  color: #e8edf2;
`;

/* ============================== Helpers ============================== */
const isVerifiedUser = (u) => {
  if (u?.verified === true) return true;
  const vs = (u?.verificationStatus || '').toString().toLowerCase();
  return vs === 'verified';
};
const toId = (x) => String(x ?? '');
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
const initialOf = (name) => (name || '').trim().charAt(0).toUpperCase() || 'U';

/* ---- Seen-once storage for match popups ---- */
const seenKey = (meId) => `hnin:matchSeen:${meId}`;
const loadSeen = (meId) => {
  try {
    const raw = localStorage.getItem(seenKey(meId));
    const arr = raw ? JSON.parse(raw) : [];
    return new Set((arr || []).map((x) => String(x)));
  } catch { return new Set(); }
};
const saveSeen = (meId, set) => {
  try { localStorage.setItem(seenKey(meId), JSON.stringify(Array.from(set))); } catch {}
};
const markSeen = (meId, matchUserId) => {
  const s = loadSeen(meId);
  s.add(String(matchUserId));
  saveSeen(meId, s);
};

/* ============================== Component ============================== */
const UserDashboard = () => {
  const auth = useAuth();
  const navigate = useNavigate();

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

  // Modal: show on the first unseen match (per user) only
  const [matchModal, setMatchModal] = useState(null); // { id, username } | null

  const idToUsername = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(toId(u.id), u.username));
    return map;
  }, [users]);

  const idToUsernameRef = useRef(new Map());
  useEffect(() => { idToUsernameRef.current = idToUsername; }, [idToUsername]);

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

      // Seen-once logic
      const seen = loadSeen(myId);
      if (seen.size === 0) {
        // First time on this device: treat all existing matches as already seen
        saveSeen(myId, matchedIds);
      } else {
        const firstUnseen = Array.from(matchedIds).find((id) => !seen.has(id));
        if (firstUnseen) {
          const name = idToUsernameRef.current.get(firstUnseen) || '';
          setMatchModal({ id: firstUnseen, username: name });
          markSeen(myId, firstUnseen); // mark immediately so it never reopens
        }
      }
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
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [token, myId, page, navigate]);

  /* ------------------------------ Effects ------------------------------ */
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

  // Activity → “matches updated”
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

  /* ------------------------------ Render ------------------------------ */
  if (banner) {
    return (
      <StyledContainer>
        <Banner>{banner}</Banner>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      {/* Match Modal (seen-once) */}
      {matchModal && (
        <ModalScrim onClick={() => setMatchModal(null)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalTitle>It’s a match!</ModalTitle>
            <MatchFaces>
              <Face title="You">{initialOf(auth?.user?.username)}</Face>
              <span style={{ opacity:.7 }}>✦</span>
              <Face title={matchModal.username}>{initialOf(matchModal.username)}</Face>
            </MatchFaces>
            <p style={{textAlign:'center', opacity:.9, margin:'0 0 12px'}}>
              You and <strong>{matchModal.username || 'this member'}</strong> liked each other.
            </p>
            <ModalActions>
              <Primary onClick={() => {
                setMatchModal(null);
                const name = matchModal.username || '';
                if (name) navigate(`/messages?user=${encodeURIComponent(name)}`);
                else navigate('/messages');
              }}>
                Message now
              </Primary>
              <Ghost onClick={() => setMatchModal(null)}>Keep browsing</Ghost>
            </ModalActions>
          </ModalCard>
        </ModalScrim>
      )}

      <StyledUserList>
        {users.map((user) => (
          <StyledProfileCard key={user.id}>
            <InitialAvatar title={user.username}>{initialOf(user.username)}</InitialAvatar>
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
