// frontend-app/src/components/Messages.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useAuth } from '../App';
import { motion } from 'framer-motion';

const StyledContainer = styled(motion.div)`
  display: flex;
  min-height: 90vh;
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.text};
`;

const ConversationListContainer = styled.div`
  width: 300px;
  background-color: ${(props) => props.theme.colors.secondary};
  border-right: 1px solid ${(props) => props.theme.colors.accent};
  padding: 1rem;
  overflow-y: auto;
`;

const ConversationItem = styled.div`
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid ${(props) => props.theme.colors.accent};
  background-color: ${(props) => props.isActive ? props.theme.colors.highlight : 'transparent'};
  color: ${(props) => props.isActive ? props.theme.colors.primary : props.theme.colors.text};
  
  &:hover {
    background-color: ${(props) => props.theme.colors.highlight};
    color: ${(props) => props.theme.colors.primary};
  }
`;

const MessagePane = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

const MessageList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
`;

const MessageItem = styled.div`
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: ${(props) => props.theme.borderRadius};
  background-color: ${(props) => props.isSender ? props.theme.colors.highlight : props.theme.colors.accent};
  color: ${(props) => props.isSender ? props.theme.colors.primary : props.theme.colors.secondary};
  align-self: ${(props) => props.isSender ? 'flex-end' : 'flex-start'};
  max-width: 70%;
`;

const MessageForm = styled.form`
  display: flex;
  gap: 0.5rem;
`;

const MessageInput = styled.input`
  flex-grow: 1;
  padding: 0.8rem;
  border-radius: ${(props) => props.theme.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.accent};
  background-color: transparent;
  color: ${(props) => props.theme.colors.text};
`;

const SendButton = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: ${(props) => props.theme.borderRadius};
  background-color: ${(props) => props.theme.colors.highlight};
  color: ${(props) => props.theme.colors.primary};
  border: none;
  cursor: pointer;
`;

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const auth = useAuth();

    // Placeholder for fetching conversations
    useEffect(() => {
        // You would fetch a list of users you have connected with here
        // For now, we will use a hardcoded list for demonstration
        setConversations([
            { id: 2, username: 'testuser1' }, // Replace with real data
            { id: 3, username: 'testuser2' }
        ]);
    }, []);

    // Placeholder for fetching messages in a conversation
    useEffect(() => {
        if (currentConversation) {
            const fetchMessages = async () => {
                // You would use the API to get messages here
                console.log(`Fetching messages for conversation with user ID: ${currentConversation.id}`);
                // For now, let's set a placeholder message
                setMessages([{
                    id: 1,
                    senderId: auth.user.id,
                    receiverId: currentConversation.id,
                    content: 'Hello, how are you?',
                    createdAt: new Date()
                }]);
            };
            fetchMessages();
        }
    }, [currentConversation, auth.user.id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !currentConversation) return;

        try {
            await axios.post(`http://localhost:8080/api/messages/${currentConversation.id}`, `"${newMessage}"`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            setNewMessage('');
            // After sending, we would re-fetch the conversation to display the new message
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (!auth.isAuthenticated) {
        return <StyledContainer>Please log in.</StyledContainer>;
    }

    return (
        <StyledContainer>
            <ConversationListContainer>
                <h3>Conversations</h3>
                {conversations.map(conv => (
                    <ConversationItem 
                        key={conv.id} 
                        onClick={() => setCurrentConversation(conv)}
                        isActive={currentConversation && currentConversation.id === conv.id}
                    >
                        {conv.username}
                    </ConversationItem>
                ))}
            </ConversationListContainer>
            <MessagePane>
                {currentConversation ? (
                    <>
                        <MessageList>
                            <h4>Chat with {currentConversation.username}</h4>
                            {messages.map(msg => (
                                <MessageItem key={msg.id} isSender={msg.senderId === auth.user.id}>
                                    {msg.content}
                                </MessageItem>
                            ))}
                        </MessageList>
                        <MessageForm onSubmit={handleSendMessage}>
                            <MessageInput
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                            />
                            <SendButton type="submit">Send</SendButton>
                        </MessageForm>
                    </>
                ) : (
                    <div>Select a conversation to start chatting.</div>
                )}
            </MessagePane>
        </StyledContainer>
    );
};

export default Messages;