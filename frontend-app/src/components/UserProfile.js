import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('Loading profile...');
    const navigate = useNavigate();

    useEffect(() => {
        // Function to fetch user data
        const fetchUserProfile = async () => {
            const jwtToken = localStorage.getItem('jwtToken');

            // If there's no token, redirect to login
            if (!jwtToken) {
                setMessage('You are not logged in. Redirecting to login...');
                setTimeout(() => navigate('/login'), 1500);
                return;
            }

            try {
                // Send a GET request to the protected API endpoint
                const response = await axios.get('http://localhost:8080/api/users', {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`, // Include the JWT in the Authorization header
                    },
                });

                // Assuming the backend returns a list of users, find the current one.
                // This is a simple way for now. We can improve this later.
                const currentUser = response.data.find(u => u.username === 'testuser2'); 
                // Note: 'testuser2' is the user we registered. If you registered a different user like 'newuser', use that name.

                if (currentUser) {
                    setUser(currentUser);
                    setMessage('');
                } else {
                    setMessage('Could not find user profile.');
                }

            } catch (error) {
                console.error('Failed to fetch user profile:', error.response ? error.response.data : error.message);
                // Handle expired tokens or other errors
                setMessage('Session expired or access denied. Please log in again.');
                localStorage.removeItem('jwtToken');
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    // A function to handle logout
    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        navigate('/login');
    };

    if (message) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>{message}</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <div style={{ float: 'right' }}>
                <button onClick={handleLogout}>Logout</button>
            </div>
            <h2>User Profile</h2>
            {user ? (
                <div>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Full Name:</strong> {user.fullName}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Bio:</strong> {user.bio || 'N/A'}</p>
                </div>
            ) : (
                <p>No user data found.</p>
            )}
        </div>
    );
};

export default UserProfile;