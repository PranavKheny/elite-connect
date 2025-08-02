import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import './App.css'; // Keep your existing CSS import
import UserProfile from './components/UserProfile'; // Ensure this import is present

// A simple home page component that acts as a navigation hub
const HomePage = () => (
  <div style={{ textAlign: 'center', marginTop: '50px' }}>
    <h1>Welcome to HNIN Connect</h1>
    <p>A professional network for high net-worth individuals.</p>
    <nav style={{ marginTop: '20px' }}>
      <Link to="/register" style={{ marginRight: '10px', padding: '10px', border: '1px solid #ccc' }}>Register</Link>
      <Link to="/login" style={{ padding: '10px', border: '1px solid #ccc' }}>Login</Link>
    </nav>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/profile" element={<UserProfile />} /> {/* CORRECT: The /profile route is now added */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;