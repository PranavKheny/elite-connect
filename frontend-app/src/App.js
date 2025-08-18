import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import './App.css';

import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import UserProfile from './components/UserProfile';
import UserDashboard from './components/UserDashboard';
import Navbar from './components/Navbar';
import Messages from './components/Messages';
import ActivityPage from './components/ActivityPage';

// ---------- Auth Context ----------
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwtToken'));

  const login = (userData, jwtToken) => {
    setUser(userData || null);
    setToken(jwtToken);
    localStorage.setItem('jwtToken', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwtToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// ---------- Route Guards ----------

// Logged-in only
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

// Logged-in AND verified
const VerifiedRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (!isAuthenticated) {
        if (!cancelled) {
          setVerified(false);
          setLoading(false);
        }
        return;
      }
      try {
        const res = await fetch('http://localhost:8080/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const me = await res.json();
          // Handle different possible property names from the backend
          const flag =
            (typeof me.isVerified !== 'undefined' ? me.isVerified : undefined) ??
            (typeof me.verified !== 'undefined' ? me.verified : undefined) ??
            (typeof me.is_verified !== 'undefined' ? me.is_verified : undefined) ??
            false;
          if (!cancelled) setVerified(!!flag);
        } else {
          if (!cancelled) setVerified(false);
        }
      } catch {
        if (!cancelled) setVerified(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    check();
    return () => { cancelled = true; };
  }, [isAuthenticated, token]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '2rem' }}>Checking verification…</div>
      </>
    );
  }

  if (!verified) return <Navigate to="/profile" replace />;

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

// ---------- App ----------
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

              {/* Login required */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Verified required */}
              <Route
                path="/dashboard"
                element={
                  <VerifiedRoute>
                    <UserDashboard />
                  </VerifiedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <VerifiedRoute>
                    <Messages />
                  </VerifiedRoute>
                }
              />
              <Route
                path="/activity"
                element={
                  <VerifiedRoute>
                    <ActivityPage />
                  </VerifiedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
