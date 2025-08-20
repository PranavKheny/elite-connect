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
  min-height: calc(100vh - 120px);
  /* Force solid backdrop + isolate from any global opacity/filters */
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

const ThreadHeader = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,.08);
  font-weight: 600;
  opacity: .9;
`;

const MessageList = styled.div`
  flex: 1;
  overflow: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  /* Solid chat canvas */
  background: #0f1e34;
`;

const Bubble = styled.div`
  max-width: 72%;
  padding: 10px 12px;
  border-radius: 14px;
  align-self: ${({isSender}) => (isSender ? 'flex-end' : 'flex-start')};
  background: ${({isSender}) => (isSender ? 'rgba(59,130,246,.35)' : 'rgba(255,255,255,.08)')};
  box-shadow: 0 1px 2px rgba(0,0,0,.15);
  white-space: pre-wrap;
  word-break: break-word;
`;

const Meta = styled.div`
  font-size: 12px;
  opacity: .7;
  margin-top: 2px;
  text-align: ${({right}) => (right ? 'right' : 'left')};
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

/* ============================== Component ============================== */

const BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:8080';
const POLL_MS = 3500;

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
              setMessages((prev) => [...prev, body]);
              requestAnimationFrame(() => {
                if (messageListRef.current) {
                  messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
                }
              });
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
          return;
        }

        const storedId = localStorage.getItem('hnin:selectedConversationId');
        if (storedId) {
          const found = (data || []).find((c) => String(c.id) === String(storedId));
          if (found) setCurrentConversation(found);
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
          if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
          }
        });
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [auth?.token, currentConversation?.id, mergeUniqueAscending]);

  useEffect(() => {
    if (!currentConversation) return;
    localStorage.setItem('hnin:selectedConversationId', String(currentConversation.id));
    setPage(0);
    setHasMore(true);
    fetchMessagesPage(0, { replace: true });
  }, [currentConversation, fetchMessagesPage]);

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
      } catch {}
      finally {
        timer = setTimeout(tick, POLL_MS);
      }
    };
    timer = setTimeout(tick, POLL_MS);
    return () => { if (timer) clearTimeout(timer); };
  }, [auth?.token, currentConversation?.id, mergeUniqueAscending]);

  /* -------------------------- Infinite scroll (older) -------------------------- */
  const handleScroll = useCallback(() => {
    const el = messageListRef.current;
    if (!el || loadingMessages || !hasMore) return;
    if (el.scrollTop <= 0) {
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
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
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

  return (
    <StyledContainer>
      <ConversationListContainer>
        <ListHeader>Conversations</ListHeader>

        {loadingMatches && <div>Loading matches…</div>}
        {matchesError && <div style={{ color: 'salmon' }}>{matchesError}</div>}

        {!loadingMatches && !matchesError && conversations.length === 0 && (
          <div>No matches yet. Like someone who liked you back ✨</div>
        )}

        {conversations.map((c) => (
          <ConversationItem
            key={c.id}
            onClick={() => setCurrentConversation(c)}
            isActive={currentConversation?.id === c.id}
            aria-label={`Open chat with ${c.username}`}
          >
            {c.username}
          </ConversationItem>
        ))}
      </ConversationListContainer>

      <MessagePane>
        {currentConversation ? (
          <>
            <ThreadHeader>Chat with {currentConversation.username}</ThreadHeader>

            <MessageList ref={messageListRef}>
              {messages.map((m) => {
                const isSender = m.senderId === auth.user.id;
                return (
                  <div key={m.id}>
                    <Bubble isSender={isSender}>{m.content}</Bubble>
                    <Meta right={isSender}>
                      {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Meta>
                  </div>
                );
              })}
              {loadingMessages && messages.length === 0 && <div>Loading…</div>}
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
