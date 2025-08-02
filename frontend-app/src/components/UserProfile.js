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
                const currentUser = response.data.find(u => u.username === 'testuser');
                if (currentUser) {
                    setUser(currentUser);
                    setMessage('');
                } else {
                    setMessage('Could not find user profile.');
                }
            } catch (error) {
                console.error('Failed to fetch user profile:', error.response ? error.response.data : error.message);
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

    // A placeholder function for the edit profile button
    const handleEditProfile = () => {
        // This is a placeholder. You can implement the full functionality later.
        console.log("Edit Profile button clicked!");
        // e.g., navigate('/profile/edit');
    };

    if (message) {
        return (
            <div className="hero is-fullheight">
                <div className="hero-body">
                    <div className="container has-text-centered">
                        <p className="title is-4">{message}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-6">
            <div className="columns is-centered">
                <div className="column is-half">
                    <div className="box">
                        <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
                            <h2 className="title is-3 mb-0">User Profile</h2>
                            <div>
                                <button className="button is-info is-light mr-2" onClick={handleEditProfile}>
                                    Edit Profile
                                </button>
                                <button className="button is-danger is-outlined" onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                        </div>
                        {user ? (
                            <div>
                                <p className="block"><strong>Username:</strong> {user.username}</p>
                                <p className="block"><strong>Full Name:</strong> {user.fullName}</p>
                                <p className="block"><strong>Email:</strong> {user.email}</p>
                                <p className="block"><strong>Bio:</strong> {user.bio || 'N/A'}</p>
                            </div>
                        ) : (
                            <p>No user data found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;