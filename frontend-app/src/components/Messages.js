// frontend-app/src/components/Messages.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

import { useAuth } from '../App';
import { fetchMatchesOf } from '../services/api';

/* ============================== Styles ============================== */
const StyledContainer = styled(motion.div)`
  display: flex;
  /* ensure we fully cover the viewport area below the navbar */
  height: calc(100dvh - 67px);
  background: #0b1628;
  color: #e8edf2;
  position: relative;
  isolation: isolate;
`;

const ConversationListContainer = styled.div`
  width: 280px;
  padding: 16px;
  border-right: 1px solid rgba(255,255,255,.08);
  overflow: auto;
  position: relative;
  z-index: 1;
  background: rgba(255,255,255,0.02);
`;

const ListHeader = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  opacity: .9;
`;

/* Row + avatar + badge */
const ConversationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.25);
  background: rgba(255,255,255,.06);
  flex: 0 0 26px;
`;

const ConversationName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Badge = styled.span`
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #3b82f6;
  color: #e8edf2;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
`;

const ConversationItem = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: ${({isActive}) => (isActive ? 'rgba(59,130,246,.25)' : 'rgba(255,255,255,.06)')};
  cursor: pointer;
  color: #e8edf2;
  &:hover { background: rgba(255,255,255,.1); }
`;

const MessagePane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  background: #0b1628;
`;

/* sticky header with 'last seen' + menu */
const ThreadHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 3;
  background: #0f1e34;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,.08);
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const HeaderTitle = styled.div`
  font-weight: 700;
  opacity: .95;
`;

const Subtle = styled.div`
  font-size: 12px;
  opacity: .7;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const KebabButton = styled.button`
  width: 36px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  color: #e8edf2;
  cursor: pointer;
`;

const MessageList = styled.div`
  flex: 1;
  overflow: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #0f1e34;
  position: relative; /* for jump button positioning */
`;

const MessageRow = styled.div`
  display: flex;
  justify-content: ${({ isSender }) => (isSender ? 'flex-end' : 'flex-start')};
  padding: 6px 0;
`;

const Bubble = styled.div`
  max-width: 72%;
  padding: 10px 12px;
  border-radius: 18px;
  border-bottom-right-radius: ${({ isSender }) => (isSender ? '6px' : '18px')};
  border-bottom-left-radius:  ${({ isSender }) => (isSender ? '18px' : '6px')};
  background: ${({isSender}) => (isSender ? 'rgba(59,130,246,.35)' : 'rgba(255,255,255,.10)')};
  color: #e8edf2;
  box-shadow: 0 1px 2px rgba(0,0,0,.15);
  white-space: pre-wrap;
  word-break: break-word;
`;

const Timestamp = styled.span`
  display: block;
  font-size: 11px;
  opacity: .7;
  margin-top: 4px;
  text-align: right;
`;

/* Day divider */
const DayDivider = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
  color: #b8c4d3;
  font-size: 12px;
  opacity: 0.8;

  &::before, &::after {
    content: "";
    height: 1px;
    background: rgba(255,255,255,0.15);
    display: block;
  }

  span {
    background: rgba(15,30,52,0.9);
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.12);
  }
`;

/* Centered “jump to bottom” */
const ScrollToBottomBtn = styled.button`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 76px; /* above composer */
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.2);
  background: rgba(15,30,52,0.9);
  color: #e8edf2;
  font-size: 13px;
  cursor: pointer;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 12px rgba(0,0,0,.25);
`;

const MessageForm = styled.form`
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,.08);
  background: #0f1e34;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: none;
  outline: none;
  background: rgba(255,255,255,.08);
  color: #e8edf2;
`;

const SendButton = styled.button`
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(59,130,246,.35);
  color: #e8edf2;
`;

/* ============================== Helpers ============================== */
const BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:8080';
const POLL_MS = 3500;

const fmtClock = (iso) => {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
const fmtFull = (iso) => new Date(iso || Date.now()).toLocaleString();

const isNearBottom = (el, thresholdPx = 80) => {
  const dist = el.scrollHeight - el.clientHeight - el.scrollTop;
  return dist <= thresholdPx;
};

const fromNow = (ts) => {
  const t = typeof ts === 'number' ? ts : new Date(ts).getTime();
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s/60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h/24);
  return `${d}d ago`;
};

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  return x.getTime();
};
const isSameDay = (a, b) => startOfDay(a) === startOfDay(b);

const dayLabel = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  if (isSameDay(d, today)) return 'Today';
  if (isSameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const lastSeenKey = (peerId, meId) => `hnin:lastSeenAt:${meId}:${peerId}`;

/* ============================== Component ============================== */
const Messages = () => {
  const auth = useAuth();
  const location = useLocation();

  const messageListRef = useRef(null);
  const stompClientRef = useRef(null);

  const currentPeerRef = useRef(null);
  const seenIdsRef = useRef(new Set());

  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchesError, setMatchesError] = useState('');

  // unread per peer
  const [unreadMap, setUnreadMap] = useState({});
  // show scroll-to-bottom button
  const [showJump, setShowJump] = useState(false);
  // peer “last seen” (last activity time we can infer)
  const [peerLastSeen, setPeerLastSeen] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const preselectUsername = queryParams.get('user');

  useEffect(() => {
    currentPeerRef.current = currentConversation?.id ?? null;
  }, [currentConversation]);

  /* -------------------------- WebSocket (once) -------------------------- */
  useEffect(() => {
    if (!auth?.isAuthenticated || !auth?.user?.id) return;
    if (stompClientRef.current) return;

    const socket = new SockJS(`${BASE_URL}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/messages/${auth.user.id}`, (frame) => {
        try {
          const body = JSON.parse(frame.body);
          const openPeerId = currentPeerRef.current;
          const isForThisChat =
            openPeerId &&
            (body.senderId === openPeerId || body.receiverId === openPeerId);

          if (!seenIdsRef.current.has(body.id)) {
            seenIdsRef.current.add(body.id);

            if (isForThisChat) {
              // always keep the thread scrolled to bottom when the chat is open
              setMessages((prev) => [...prev, body]);
              requestAnimationFrame(() => {
                const el = messageListRef.current;
                if (el) el.scrollTop = el.scrollHeight;
                setShowJump(false);
              });
              if (body.senderId !== auth.user.id) {
                // update peer last seen with their message time
                setPeerLastSeen(body.createdAt || Date.now());
              }
            } else {
              // increment unread for the other peer
              const peerId = body.senderId === auth.user.id ? body.receiverId : body.senderId;
              if (peerId !== auth.user.id && body.senderId === peerId) {
                setUnreadMap((prev) => ({
                  ...prev,
                  [peerId]: (prev[peerId] || 0) + 1,
                }));
              }
            }
          }
        } catch {}
      });
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      try { client.deactivate(); } catch {}
      stompClientRef.current = null;
    };
  }, [auth?.isAuthenticated, auth?.user?.id]);

  /* ---------------------- Load conversations (matches) ---------------------- */
  useEffect(() => {
    if (!auth?.isAuthenticated || !auth?.user?.id || !auth?.token) return;

    let alive = true;
    (async () => {
      try {
        setLoadingMatches(true);
        setMatchesError('');
        let data = await fetchMatchesOf(auth.user.id, auth.token);
        if (!Array.isArray(data) && data?.value) data = data.value;

        if (!alive) return;
        setConversations(data || []);

        const byQuery = preselectUsername
          ? (data || []).find(
              (c) => c.username?.toLowerCase() === preselectUsername.toLowerCase()
            )
          : null;

        if (byQuery) {
          setCurrentConversation(byQuery);
        } else {
          const storedId = localStorage.getItem('hnin:selectedConversationId');
          if (storedId) {
            const found = (data || []).find((c) => String(c.id) === String(storedId));
            if (found) setCurrentConversation(found);
          }
        }

        // Prime accurate unread counts and last-activity snapshot
        if (Array.isArray(data) && data.length) {
          const snapshots = await Promise.all(
            data.map(async (c) => {
              try {
                // grab up to 50 most recent to compute unread properly
                const res = await axios.get(
                  `${BASE_URL}/api/messages/${c.id}?page=0&size=50&sort=createdAt,desc`,
                  { headers: { Authorization: `Bearer ${auth.token}` } }
                );
                const contentDesc = res.data?.content || [];
                const messagesAsc = [...contentDesc].reverse();
                return { peerId: c.id, items: messagesAsc };
              } catch {
                return { peerId: c.id, items: [] };
              }
            })
          );

          setUnreadMap((prev) => {
            const next = { ...prev };
            snapshots.forEach(({ peerId, items }) => {
              const key = lastSeenKey(peerId, auth.user.id);
              const seenAt = Number(localStorage.getItem(key) || 0);
              const count = items.filter(m =>
                m.senderId === peerId &&
                new Date(m.createdAt || Date.now()).getTime() > seenAt
              ).length;
              next[peerId] = count;
            });
            return next;
          });
        }
      } catch (e) {
        if (alive) setMatchesError(e?.message || 'Failed to load matches');
      } finally {
        if (alive) setLoadingMatches(false);
      }
    })();

    return () => { alive = false; };
  }, [auth?.isAuthenticated, auth?.user?.id, auth?.token, preselectUsername]);

  /* -------------------------- Fetch messages -------------------------- */
  const mergeUniqueAscending = useCallback((incoming, { appendToEnd } = { appendToEnd: true }) => {
    const out = [];
    for (const m of incoming) {
      if (!seenIdsRef.current.has(m.id)) {
        seenIdsRef.current.add(m.id);
        out.push(m);
      }
    }
    if (out.length === 0) return;
    setMessages((prev) => appendToEnd ? [...prev, ...out] : [...out, ...prev]);
  }, []);

  const fetchMessagesPage = useCallback(async (pageNumber, { replace } = { replace: false }) => {
    if (!currentConversation?.id || !auth?.token) return;

    setLoadingMessages(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/messages/${currentConversation.id}?page=${pageNumber}&size=20&sort=createdAt,desc`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      const chunkDesc = res.data?.content || [];
      const chunkAsc = [...chunkDesc].reverse();

      if (replace) {
        seenIdsRef.current = new Set();
        setMessages([]);
      }
      if (chunkAsc.length === 0) setHasMore(false);
      mergeUniqueAscending(chunkAsc, { appendToEnd: replace ? true : false });

      if (replace) {
        requestAnimationFrame(() => {
          const el = messageListRef.current;
          if (el) el.scrollTop = el.scrollHeight;
        });
        // set “last seen” from the other party’s latest message
        const lastFromPeer = [...chunkAsc].reverse().find(m => m.senderId === currentConversation.id);
        setPeerLastSeen(lastFromPeer ? lastFromPeer.createdAt : null);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [auth?.token, currentConversation?.id, mergeUniqueAscending]);


  const markThreadRead = useCallback((peerId, lastTs = Date.now()) => {
    const key = lastSeenKey(peerId, auth.user.id);
    localStorage.setItem(key, String(lastTs));
    setUnreadMap((prev) => ({ ...prev, [peerId]: 0 }));
  }, [auth?.user?.id]);

  useEffect(() => {
    if (!currentConversation) return;
    localStorage.setItem('hnin:selectedConversationId', String(currentConversation.id));
    setPage(0);
    setHasMore(true);
    fetchMessagesPage(0, { replace: true });
    markThreadRead(currentConversation.id, Date.now());
  }, [currentConversation, fetchMessagesPage, markThreadRead]);

  /* -------------------------- Polling fallback -------------------------- */
  useEffect(() => {
    if (!currentConversation?.id || !auth?.token) return;
    let timer = null;

    const tick = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/messages/${currentConversation.id}?page=0&size=20&sort=createdAt,desc`,
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        const latestAsc = [...(res.data?.content || [])].reverse();
        mergeUniqueAscending(latestAsc, { appendToEnd: true });

        // keep “last seen” fresh
        const lastFromPeer = [...latestAsc].reverse().find(m => m.senderId === currentConversation.id);
        if (lastFromPeer) setPeerLastSeen(lastFromPeer.createdAt);
        const last = latestAsc[latestAsc.length - 1];
        if (last) markThreadRead(
          currentConversation.id,
          new Date(last.createdAt || Date.now()).getTime()
        );
      } catch {}
      finally {
        timer = setTimeout(tick, POLL_MS);
      }
    };
    timer = setTimeout(tick, POLL_MS);
    return () => { if (timer) clearTimeout(timer); };
  }, [auth?.token, currentConversation?.id, mergeUniqueAscending, markThreadRead]);

  /* -------------------------- Infinite scroll + jump btn -------------------------- */
  const handleScroll = useCallback(() => {
    const el = messageListRef.current;
    if (!el) return;

    setShowJump(!isNearBottom(el, 160));

    if (!loadingMessages && hasMore && el.scrollTop <= 0) {
      const next = page + 1;
      setPage(next);
      fetchMessagesPage(next, { replace: false });
    }
  }, [page, hasMore, loadingMessages, fetchMessagesPage]);

  useEffect(() => {
    const el = messageListRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToBottom = () => {
    const el = messageListRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
      setShowJump(false);
    }
  };

  /* -------------------------- Send message -------------------------- */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation?.id) return;

    const payload = { content: newMessage.trim() };

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      senderId: auth.user.id,
      receiverId: currentConversation.id,
      content: payload.content,
      createdAt: new Date().toISOString(),
    };
    seenIdsRef.current.add(tempId);
    setMessages((prev) => [...prev, optimistic]);
    setNewMessage('');
    requestAnimationFrame(() => {
      const el = messageListRef.current;
      if (el) el.scrollTop = el.scrollHeight;
      setShowJump(false);
    });

    try {
      const res = await axios.post(
        `${BASE_URL}/api/messages/${currentConversation.id}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      const real = res.data;
      setMessages((prev) => {
        const arr = [...prev];
        const idx = arr.findIndex((m) => m.id === tempId);
        if (idx !== -1) arr[idx] = real;
        else arr.push(real);
        return arr;
      });
      seenIdsRef.current.add(real.id);
      markThreadRead(currentConversation.id, new Date(real.createdAt || Date.now()).getTime());
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      seenIdsRef.current.delete(tempId);
      console.error('Error sending message:', error);
    }
  };

  /* -------------------------- Render -------------------------- */
  if (!auth?.isAuthenticated) {
    return (
      <StyledContainer>
        <div style={{ padding: 16 }}>Please log in.</div>
      </StyledContainer>
    );
  }

  // Build message list with day dividers
  const renderThread = () => {
    const items = [];
    let prevTs = null;

    messages.forEach((m) => {
      const ts = m.createdAt || Date.now();
      if (!prevTs || !isSameDay(new Date(prevTs), new Date(ts))) {
        items.push(
          <DayDivider key={`day-${startOfDay(new Date(ts))}`}>
            <span>{dayLabel(ts)}</span>
          </DayDivider>
        );
      }
      const isSender = m.senderId === auth.user.id;
      items.push(
        <MessageRow key={m.id} isSender={isSender} title={fmtFull(ts)} aria-label={`Sent at ${fmtFull(ts)}`}>
          <Bubble isSender={isSender}>
            {m.content}
            <Timestamp>{fmtClock(ts)}</Timestamp>
          </Bubble>
        </MessageRow>
      );
      prevTs = ts;
    });

    if (loadingMessages && messages.length === 0) {
      items.push(<div key="loading">Loading…</div>);
    }
    return items;
  };

  return (
    <StyledContainer>
      <ConversationListContainer>
        <ListHeader>Conversations</ListHeader>

        {loadingMatches && <div>Loading matches…</div>}
        {matchesError && <div style={{ color: 'salmon' }}>{matchesError}</div>}

        {!loadingMatches && !matchesError && conversations.length === 0 && (
          <div>No matches yet. Like someone who liked you back ✨</div>
        )}

        {conversations.map((c) => {
          const unread = unreadMap[c.id] || 0;
          return (
            <ConversationItem
              key={c.id}
              onClick={() => setCurrentConversation(c)}
              isActive={currentConversation?.id === c.id}
              aria-label={`Open chat with ${c.username}`}
            >
              <ConversationRow>
                <Avatar aria-hidden="true" />
                <ConversationName>{c.username}</ConversationName>
                {unread > 0 && <Badge aria-label={`${unread} unread`}>{unread}</Badge>}
              </ConversationRow>
            </ConversationItem>
          );
        })}
      </ConversationListContainer>

      <MessagePane>
        {currentConversation ? (
          <>
            <ThreadHeader>
              <HeaderRow>
                <div>
                  <HeaderTitle>Chat with {currentConversation.username}</HeaderTitle>
                  <Subtle>
                    {peerLastSeen ? `Last seen ${fromNow(peerLastSeen)}` : '—'}
                  </Subtle>
                </div>
                <HeaderRight>
                  <KebabButton title="More">⋯</KebabButton>
                </HeaderRight>
              </HeaderRow>
            </ThreadHeader>

            <MessageList ref={messageListRef}>
              {renderThread()}
              {showJump && (
                <ScrollToBottomBtn onClick={scrollToBottom}>
                  New messages • Jump ↓
                </ScrollToBottomBtn>
              )}
            </MessageList>

            <MessageForm onSubmit={handleSendMessage}>
              <MessageInput
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message…"
              />
              <SendButton type="submit">Send</SendButton>
            </MessageForm>
          </>
        ) : (
          <ThreadHeader style={{ opacity: .7 }}>Select a conversation to start chatting.</ThreadHeader>
        )}
      </MessagePane>
    </StyledContainer>
  );
};

export default Messages;
