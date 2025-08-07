import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import './App.css';

// Import all of your components
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import UserProfile from './components/UserProfile';
import UserDashboard from './components/UserDashboard';
import Navbar from './components/Navbar';
import Messages from './components/Messages';
import ActivityPage from './components/ActivityPage'; // NEW IMPORT

// Create a simple Auth Context
const AuthContext = createContext(null);

// This provider will wrap our entire application
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('jwtToken'));

    const login = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('jwtToken', jwtToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('jwtToken');
    };

    const value = { user, token, login, logout, isAuthenticated: !!token };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// A simple hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// A protected route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return (
        <React.Fragment>
            <Navbar />
            {children}
        </React.Fragment>
    );
};


function App() {
    return (
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <Router>
                    <div className="App">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/register" element={<RegisterForm />} />
                            <Route path="/login" element={<LoginForm />} />

                            {/* --- PROTECTED ROUTES --- */}
                            <Route path="/profile" element={
                                <ProtectedRoute>
                                    <UserProfile />
                                </ProtectedRoute>
                            } />
                            <Route path="/dashboard" element={
                                <ProtectedRoute>
                                    <UserDashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/messages" element={
                                <ProtectedRoute>
                                    <Messages />
                                </ProtectedRoute>
                            } />
                            <Route path="/activity" element={
                                <ProtectedRoute>
                                    <ActivityPage />
                                </ProtectedRoute>
                            } />

                        </Routes>
                    </div>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;