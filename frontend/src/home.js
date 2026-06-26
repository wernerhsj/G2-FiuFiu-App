import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [darkMode, setDarkMode] = useState(false);
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

  const theme = {
    bg: darkMode ? '#15202b' : '#f7f9f9',
    text: darkMode ? '#ffffff' : '#0f1419',
    card: darkMode ? '#192734' : '#ffffff',
    border: darkMode ? '#38444d' : '#eff3f4',
    primary: '#FFD700',
    primaryHover: '#e6c200',
    secondaryText: darkMode ? '#8899a6' : '#536471'
  };

  // Componente de Avatar (Bolinha com a inicial)
  const Avatar = ({ name }) => (
    <div style={{
      width: '48px', height: '48px', borderRadius: '50%', backgroundColor: theme.primary,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 'bold', fontSize: '20px', textTransform: 'uppercase', flexShrink: 0
    }}>
      {name ? name.charAt(0) : '🐥'}
    </div>
  );

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', transition: 'background-color 0.3s ease' }}>
      
      {/* Navbar Fixa */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: theme.card, borderBottom: `1px solid ${theme.border}`, zIndex: 100, padding: '10px 20px', display: 'flex', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <div style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: theme.primary, fontSize: '24px' }}>FiuFiu 🐥</h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            {token ? (
              <button onClick={handleLogout} style={{ padding: '8px 15px', fontSize: '14px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>Sair</button>
            ) : (
              <button onClick={() => navigate('/login')} style={{ padding: '8px 15px', fontSize: '14px', backgroundColor: theme.primary, color: 'white', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>Entrar</button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', borderLeft: `1px solid ${theme.border}`, borderRight: `1px solid ${theme.border}`, minHeight: '100vh', backgroundColor: theme.card }}>
        
        {/* Área de Criar Post */}
        {token && (
          <form onSubmit={handlePost} style={{ display: 'flex', gap: '15px', paddingBottom: '20px', borderBottom: `1px solid ${theme.border}`, marginBottom: '20px' }}>
            <Avatar name={currentUser} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea 
                placeholder="Em que você está pensando?" 
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                style={{ width: '100%', padding: '10px', fontSize: '18px', backgroundColor: 'transparent', color: theme.text, border: 'none', resize: 'none', minHeight: '60px', fontFamily: 'inherit', outline: 'none' }}
                required
              />
              <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" style={{ padding: '10px 25px', backgroundColor: theme.primary, color: 'white', border: 'none', borderRadius: '25px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                  Publicar
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Lista de Posts */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {posts.map(post => (
            <div key={post.id} style={{ display: 'flex', gap: '15px', padding: '15px 0', borderBottom: `1px solid ${theme.border}`, transition: 'background-color 0.2s ease' }}>
              <Avatar name={post.username} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{post.username}</span>
                  <span style={{ color: theme.secondaryText, fontSize: '14px' }}>@{post.username.toLowerCase()}</span>
                  <span style={{ color: theme.secondaryText, fontSize: '14px' }}>· {new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ margin: '0 0 15px 0', fontSize: '15px', lineHeight: '1.5' }}>{post.content}</p>
                <div style={{ display: 'flex', gap: '30px' }}>
                  <button 
                    onClick={() => handleLike(post.id)}
                    style={{ background: 'none', border: 'none', color: theme.secondaryText, display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '14px', padding: '5px', borderRadius: '50%' }}
                  >
                    <span style={{ filter: post.likes > 0 ? 'none' : 'grayscale(100%)' }}>💛</span> {post.likes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Home;