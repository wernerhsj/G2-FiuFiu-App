import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const navigate = useNavigate();

  // Verifica se o usuário está logado (se tem token no localStorage)
  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('username');

  // Busca os posts assim que a tela carrega
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

  // Função para criar um novo post
  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await axios.post('http://localhost:3001/posts', 
        { content: newPost },
        { headers: { Authorization: `Bearer ${token}` } } // Envia o token para provar que está logado
      );
      setNewPost(''); // Limpa o campo
      fetchPosts(); // Atualiza a lista de posts
    } catch (error) {
      alert('Erro ao publicar. Faça login novamente.');
    }
  };

  // Função para curtir/descurtir
  const handleLike = async (postId) => {
    if (!token) {
      alert('Você precisa estar logado para curtir um post!');
      return;
    }

    try {
      await axios.post(`http://localhost:3001/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts(); // Atualiza a contagem de curtidas
    } catch (error) {
      console.error('Erro ao curtir:', error);
    }
  };

  // Função de Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      
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
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', minHeight: '80px', fontFamily: 'inherit' }}
            required
          />
          <button type="submit" style={{ alignSelf: 'flex-end', padding: '10px 20px' }}>Publicar</button>
        </form>
      )}

      {/* Lista de Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {posts.map(post => (
          <div key={post.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', backgroundColor: '#fafafa', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: 'bold', color: '#FFD700', marginBottom: '10px' }}>@{post.username}</div>
            <p style={{ margin: '0 0 15px 0' }}>{post.content}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
              <span>{new Date(post.created_at).toLocaleString()}</span>
              <button 
                onClick={() => handleLike(post.id)}
                style={{ background: 'none', border: '1px solid #FFD700', color: '#333', padding: '5px 10px', fontSize: '12px' }}
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