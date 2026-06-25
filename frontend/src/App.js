import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './login';
import Home from './home'; 

function App() {
  return (
    <Router>
      <div className="app-container">
        <header>FiuFiu 🐥</header>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;