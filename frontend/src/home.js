import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [darkMode, setDarkMode] = useState(false); // Estado para a Feature Extra
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('username');

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await axios.post('http://localhost:3001/posts', 
        { content: newPost },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewPost('');
      fetchPosts();
    } catch (error) {
      alert('Erro ao publicar. Faça login novamente.');
    }
  };

  const handleLike = async (postId) => {
    if (!token) {
      alert('Você precisa estar logado para curtir um post!');
      return;
    }

    try {
      await axios.post(`http://localhost:3001/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (error) {
      console.error('Erro ao curtir:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  // Cores dinâmicas para o Dark Mode
  const themeStyles = {
    backgroundColor: darkMode ? '#15202b' : '#ffffff', // Fundo estilo Twitter Dark vs Branco
    color: darkMode ? '#ffffff' : '#333333',
    cardBackground: darkMode ? '#192734' : '#fafafa',
    cardBorder: darkMode ? '#38444d' : '#eee',
    inputBackground: darkMode ? '#192734' : '#ffffff',
    inputText: darkMode ? '#ffffff' : '#333333'
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', backgroundColor: themeStyles.backgroundColor, color: themeStyles.color, minHeight: '100vh', transition: '0.3s' }}>
      
      {/* Botão flutuante ou fixo do Tema (Feature Extra) */}
      <div style={{ textAlign: 'right', marginBottom: '10px' }}>
        <button 
          onClick={() => setDarkMode(!darkMode)} 
          style={{ padding: '8px 15px', fontSize: '13px', backgroundColor: darkMode ? '#FFD700' : '#333', color: darkMode ? '#333' : '#fff', borderRadius: '20px' }}
        >
          {darkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
        </button>
      </div>

      {/* Cabeçalho da Home */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Feed FiuFiu 🐥</h2>
        {token ? (
          <div>
            <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Olá, {currentUser}</span>
            <button onClick={handleLogout} style={{ padding: '5px 10px', fontSize: '14px', backgroundColor: '#dc3545' }}>Sair</button>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} style={{ padding: '5px 10px', fontSize: '14px' }}>Fazer Login</button>
        )}
      </div>

      {/* Área de criação de Post (Somente logados) */}
      {token && (
        <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
          <textarea 
            placeholder="O que estou pensando?" 
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid ' + themeStyles.cardBorder, backgroundColor: themeStyles.inputBackground, color: themeStyles.inputText, minHeight: '80px', fontFamily: 'inherit' }}
            required
          />
          <button type="submit" style={{ alignSelf: 'flex-end', padding: '10px 20px' }}>Publicar</button>
        </form>
      )}

      {/* Lista de Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {posts.map(post => (
          <div key={post.id} style={{ border: '1px solid ' + themeStyles.cardBorder, padding: '15px', borderRadius: '8px', backgroundColor: themeStyles.cardBackground, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: '0.3s' }}>
            <div style={{ fontWeight: 'bold', color: '#FFD700', marginBottom: '10px' }}>@{post.username}</div>
            <p style={{ margin: '0 0 15px 0' }}>{post.content}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
              <span>{new Date(post.created_at).toLocaleString()}</span>
              <button 
                onClick={() => handleLike(post.id)}
                style={{ background: 'none', border: '1px solid #FFD700', color: themeStyles.color, padding: '5px 10px', fontSize: '12px', borderRadius: '5px', cursor: 'pointer' }}
              >
                💛 Curtir ({post.likes})
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Home;