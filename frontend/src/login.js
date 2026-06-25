import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/login' : '/register';
    
    try {
      // Fazendo a requisição para o nosso backend rodando na porta 3001
      const response = await axios.post(`http://localhost:3001${endpoint}`, {
        username,
        password
      });

      if (isLogin) {
        // Se for login, salva o token e vai para a página inicial
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', username);
        alert('Bem-vindo ao FiuFiu!');
        navigate('/'); // Redireciona para o feed
      } else {
        alert('Cadastro realizado com sucesso! Agora faça login.');
        setIsLogin(true); // Muda para a tela de login
        setPassword('');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Ocorreu um erro!');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Entrar no FiuFiu' : 'Criar Conta'}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input 
          type="text" 
          placeholder="Nome de Usuário" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? 'Entrar' : 'Cadastrar'}</button>
      </form>
      
      <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
      </button>

      {/* Botão para entrar sem login como pede a prova */}
      <button className="toggle-btn" onClick={() => navigate('/')}>
        Continuar sem logar (Apenas visualização)
      </button>
    </div>
  );
}

export default Login;