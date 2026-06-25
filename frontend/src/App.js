import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './login';
// Em breve criaremos o Home.js
// import Home from './Home'; 

function App() {
  return (
    <Router>
      <div className="app-container">
        <header>FiuFiu 🐥</header>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Por enquanto, a raiz também vai para o Login, logo mudaremos para o Home */}
          <Route path="/" element={<Login />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;