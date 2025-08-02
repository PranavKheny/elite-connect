import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import './App.css';
import UserProfile from './components/UserProfile';

// A simple home page component that acts as a navigation hub
const HomePage = () => (
  <div className="hero is-fullheight is-primary">
    <div className="hero-body">
      <div className="container has-text-centered">
        <h1 className="title is-1">HNIN Connect</h1>
        <h2 className="subtitle is-4">A professional network for high net-worth individuals.</h2>
        <div className="mt-5">
          <Link to="/register" className="button is-white is-outlined is-large mr-4">
            Register
          </Link>
          <Link to="/login" className="button is-white is-large">
            Login
          </Link>
        </div>
      </div>
    </div>
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
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;