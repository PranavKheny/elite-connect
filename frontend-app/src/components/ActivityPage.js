import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useAuth } from '../App';

import {
  getReceivedLikes,
  getReceivedConnections,
  acceptConnection as apiAcceptConnection,
  declineConnection as apiDeclineConnection,
  fetchMatchesOf,
} from '../services/api';

/* ============================== Styles ============================== */
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
  margin-bottom: 1rem;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
`;

const TabButton = styled.button`
  padding: 0.5rem 0.9rem;
  border-radius: 10px;
  border: 1px solid ${({active}) => active ? '#3b82f6' : 'rgba(255,255,255,0.25)'};
  background: ${({active}) => active ? 'rgba(59,130,246,0.18)' : 'transparent'};
  color: #e8edf2;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  &:hover { background: rgba(255,255,255,0.08); }
`;

const StyledCard = styled(motion.div)`
  background-color: #1f2937;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 760px;
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
  padding: 0.85rem 0;
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
  max-width: 760px;
  width: 100%;
  text-align: center;
`;

const Empty = styled.p`
  margin: 0.5rem 0 0;
  opacity: 0.75;
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.9rem;
  gap: 0.75rem;
`;

const PagerButton = styled(StyledButton)`
  padding: 0.4rem 0.8rem;
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
const Face = styled.div`
  width: 72px; height: 72px; border-radius: 999px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, rgba(59,130,246,.35), rgba(255,255,255,.08));
  border: 1px solid rgba(255,255,255,.15);
  color: #e8edf2; font-weight: 700; font-size: 1.4rem;
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
const PAGE_SIZE = 10;

function fromNow(ts) {
  if (!ts) return '';
  const created = new Date(ts);
  const s = Math.max(0, Math.floor((Date.now() - created.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function paginate(arr, page, size) {
  const total = Array.isArray(arr) ? arr.length : 0;
  const totalPages = Math.max(1, Math.ceil(total / size) || 1);
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const start = safePage * size;
  const end = start + size;
  return {
    items: (arr || []).slice(start, end),
    total,
    totalPages,
    page: safePage,
  };
}

const initialOf = (name) =>
  (name || '').trim().charAt(0).toUpperCase() || 'U';

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
const ActivityPage = () => {
  const [tab, setTab] = useState('requests'); // 'requests' | 'likes' | 'matches'

  const [likes, setLikes] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [matches, setMatches] = useState([]);

  const [pageReq, setPageReq] = useState(0);
  const [pageLikes, setPageLikes] = useState(0);
  const [pageMatches, setPageMatches] = useState(0);

  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Local match modal (after Accept)
  const [matchModal, setMatchModal] = useState(null); // { username }

  const auth = useAuth();
  const navigate = useNavigate();

  const fetchActivities = async (silent = false) => {
    if (!auth.token) {
      navigate('/login');
      return;
    }
    try {
      if (!silent) setLoading(true);
      const [likesRes, consRes, matchesRes] = await Promise.all([
        getReceivedLikes(auth.token),
        getReceivedConnections(auth.token),
        fetchMatchesOf(auth.user.id, auth.token),
      ]);

      setLikes(Array.isArray(likesRes) ? likesRes : []);
      setConnectionRequests(Array.isArray(consRes) ? consRes : []);
      setMatches(Array.isArray(matchesRes) ? matchesRes : []);

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

  // Broadcast to other views that matches changed
  const broadcastMatchesUpdate = async () => {
    try {
      const m = await fetchMatchesOf(auth.user.id, auth.token);
      window.dispatchEvent(new CustomEvent('hnin:matches-updated', { detail: { at: Date.now(), matches: m } }));
      localStorage.setItem('hnin:matches:ping', String(Date.now()));
    } catch {
      // non-fatal
    }
  };

  const handleAccept = async (requestId, senderName, senderId) => {
    try {
      setBusyId(requestId);
      await apiAcceptConnection(requestId, auth.token);
      setMessage('Connection request accepted.');
      // Mark this specific match as "seen" immediately
      if (senderId != null) markSeen(auth.user.id, senderId);
      setMatchModal({ username: senderName }); // celebratory modal
      await Promise.all([fetchActivities(true), broadcastMatchesUpdate()]);
    } catch (error) {
      const msg = String(error?.message || '');
      if (/409|already/i.test(msg)) {
        if (senderId != null) markSeen(auth.user.id, senderId);
        setMatchModal({ username: senderName });
        await Promise.all([fetchActivities(true), broadcastMatchesUpdate()]);
      } else {
        console.error('Error accepting request:', error);
        setMessage('Error accepting request.');
        toast.error('Failed to accept request.');
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      setBusyId(requestId);
      await apiDeclineConnection(requestId, auth.token);
      setMessage('Connection request declined.');
      await fetchActivities(true);
    } catch (error) {
      console.error('Error declining request:', error);
      setMessage('Error declining request.');
    } finally {
      setBusyId(null);
    }
  };

  // Reset page when switching tabs
  useEffect(() => {
    if (tab === 'requests') setPageReq(0);
    if (tab === 'likes') setPageLikes(0);
    if (tab === 'matches') setPageMatches(0);
  }, [tab]);

  /* ============================== Render per-tab ============================== */
  const renderRequests = () => {
    const { items, totalPages, page } = paginate(connectionRequests, pageReq, PAGE_SIZE);

    return (
      <StyledCard>
        <HeaderRow>
          <h3>Incoming Connection Requests</h3>
          <Subtle>{loading ? 'Loading…' : `${connectionRequests.length} item(s)`}</Subtle>
        </HeaderRow>

        {connectionRequests.length > 0 ? (
          <>
            <StyledList>
              {items.map((req) => {
                const senderName = req?.senderUsername || 'Unknown';
                const senderId = req?.senderId; // <-- use senderId if present
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
                        onClick={() => handleAccept(req.id, senderName, senderId)}
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

            <PaginationBar>
              <PagerButton disabled={page === 0} onClick={() => setPageReq(p => Math.max(0, p - 1))}>
                Previous
              </PagerButton>
              <Subtle>Page {page + 1} of {totalPages}</Subtle>
              <PagerButton disabled={page + 1 >= totalPages} onClick={() => setPageReq(p => p + 1)}>
                Next
              </PagerButton>
            </PaginationBar>
          </>
        ) : (
          <Empty>No new connection requests.</Empty>
        )}
      </StyledCard>
    );
  };

  const renderLikes = () => {
    const { items, totalPages, page } = paginate(likes, pageLikes, PAGE_SIZE);

    return (
      <StyledCard>
        <HeaderRow>
          <h3>Incoming Likes</h3>
          <Subtle>{loading ? 'Loading…' : `${likes.length} item(s)`}</Subtle>
        </HeaderRow>

        {likes.length > 0 ? (
          <>
            <StyledList>
              {items.map((like) => {
                const likerName = like?.likerUsername || 'Unknown';
                const when = fromNow(like?.createdAt);
                return (
                  <StyledListItem key={like.id}>
                    <Left>
                      <div>New like from: <strong>{likerName}</strong></div>
                      <Subtle>{when}</Subtle>
                    </Left>
                    <Right>
                      <StyledButton onClick={() => navigate(`/dashboard?user=${like.likerId}`)}>
                        View Profile
                      </StyledButton>
                    </Right>
                  </StyledListItem>
                );
              })}
            </StyledList>

            <PaginationBar>
              <PagerButton disabled={page === 0} onClick={() => setPageLikes(p => Math.max(0, p - 1))}>
                Previous
              </PagerButton>
              <Subtle>Page {page + 1} of {totalPages}</Subtle>
              <PagerButton disabled={page + 1 >= totalPages} onClick={() => setPageLikes(p => p + 1)}>
                Next
              </PagerButton>
            </PaginationBar>
          </>
        ) : (
          <Empty>No new likes.</Empty>
        )}
      </StyledCard>
    );
  };

  const renderMatches = () => {
    const { items, totalPages, page } = paginate(matches, pageMatches, PAGE_SIZE);

    return (
      <StyledCard>
        <HeaderRow>
          <h3>Matches</h3>
          <Subtle>{loading ? 'Loading…' : `${matches.length} item(s)`}</Subtle>
        </HeaderRow>

        {matches.length > 0 ? (
          <>
            <StyledList>
              {items.map((m) => {
                const name = m?.username || `User ${m?.id}`;
                return (
                  <StyledListItem key={m.id}>
                    <Left>
                      <div>Matched with: <strong>{name}</strong></div>
                      <Subtle>—</Subtle>
                    </Left>
                    <Right>
                      <StyledButton onClick={() => navigate(`/messages?user=${encodeURIComponent(name)}`)}>
                        Message
                      </StyledButton>
                    </Right>
                  </StyledListItem>
                );
              })}
            </StyledList>

            <PaginationBar>
              <PagerButton disabled={page === 0} onClick={() => setPageMatches(p => Math.max(0, p - 1))}>
                Previous
              </PagerButton>
              <Subtle>Page {page + 1} of {totalPages}</Subtle>
              <PagerButton disabled={page + 1 >= totalPages} onClick={() => setPageMatches(p => p + 1)}>
                Next
              </PagerButton>
            </PaginationBar>
          </>
        ) : (
          <Empty>No matches yet.</Empty>
        )}
      </StyledCard>
    );
  };

  return (
    <StyledContainer>
      <StyledTitle>Activity</StyledTitle>
      {message ? <Banner>{message}</Banner> : null}

      {/* Match Modal after Accept */}
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
              You and <strong>{matchModal.username || 'this member'}</strong> can now chat.
            </p>
            <ModalActions>
              <Primary onClick={() => {
                const name = matchModal.username || '';
                setMatchModal(null);
                if (name) navigate(`/messages?user=${encodeURIComponent(name)}`); else navigate('/messages');
              }}>
                Message now
              </Primary>
              <Ghost onClick={() => setMatchModal(null)}>Keep browsing</Ghost>
            </ModalActions>
          </ModalCard>
        </ModalScrim>
      )}

      <Tabs>
        <TabButton active={tab === 'requests'} onClick={() => setTab('requests')}>Requests</TabButton>
        <TabButton active={tab === 'likes'} onClick={() => setTab('likes')}>Likes</TabButton>
        <TabButton active={tab === 'matches'} onClick={() => setTab('matches')}>Matches</TabButton>
      </Tabs>

      {tab === 'requests' && renderRequests()}
      {tab === 'likes' && renderLikes()}
      {tab === 'matches' && renderMatches()}
    </StyledContainer>
  );
};

export default ActivityPage;
