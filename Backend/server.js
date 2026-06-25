const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
app.use(express.json());
app.use(cors()); // Permite que o front-end em React se comunique com este back-end

const PORT = 3001;
const SECRET_KEY = 'fiufiu_chave_super_secreta_para_prova'; // Em produção, usaríamos variáveis de ambiente

// ROTA 1: Cadastro de Usuário (Registro)
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    try {
        // Criptografando a senha (HASH), NUNCA em texto puro
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
        db.run(query, [username, hashedPassword], function(err) {
            if (err) {
                // Tratamento simples para usuário já existente
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Nome de usuário já existe.' });
                }
                return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
            }
            res.status(201).json({ message: 'Usuário cadastrado com sucesso!', userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// ROTA 2: Login de Usuário
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = `SELECT * FROM users WHERE username = ?`;
    db.get(query, [username], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor.' });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        // Comparar a senha enviada com o HASH armazenado no banco
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Senha incorreta.' });

        // Gerar o token de autenticação (JWT)
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '2h' });

        res.json({ message: 'Login realizado com sucesso!', token });
    });
});

// ==========================================
// MIDDLEWARE DE AUTENTICAÇÃO
// Verifica se o usuário enviou um token válido
// ==========================================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extrai o token do formato "Bearer TOKEN"

    if (!token) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
        req.user = user; // Salva os dados do usuário na requisição
        next(); // Permite que a rota continue
    });
};

// ==========================================
// ROTAS DE POSTS E CURTIDAS
// ==========================================

// ROTA 3: Listar Posts (Usuários logados e não logados podem ver)
app.get('/posts', (req, res) => {
    // Busca os posts, junta com o nome do usuário e conta as curtidas
    const query = `
        SELECT posts.id, posts.content, posts.created_at, users.username,
        (SELECT COUNT(*) FROM favorites WHERE post_id = posts.id) as likes
        FROM posts
        JOIN users ON posts.user_id = users.id
        ORDER BY posts.created_at DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar posts.' });
        res.json(rows);
    });
});

// ROTA 4: Criar um Post (Somente logados)
app.post('/posts', authenticateToken, (req, res) => {
    const { content } = req.body;
    
    if (!content) {
        return res.status(400).json({ error: 'O conteúdo do post não pode estar vazio.' });
    }

    const query = `INSERT INTO posts (user_id, content) VALUES (?, ?)`;
    // req.user.id vem do middleware de autenticação
    db.run(query, [req.user.id, content], function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao criar post.' });
        res.status(201).json({ message: 'Post publicado com sucesso!', postId: this.lastID });
    });
});

// ROTA 5: Curtir / Descurtir um Post (Somente logados)
app.post('/posts/:id/like', authenticateToken, (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    // Primeiro, verifica se o usuário já curtiu esse post
    db.get(`SELECT * FROM favorites WHERE user_id = ? AND post_id = ?`, [userId, postId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Erro interno no servidor.' });

        if (row) {
            // Se já curtiu, descurte (remove a linha)
            db.run(`DELETE FROM favorites WHERE user_id = ? AND post_id = ?`, [userId, postId], (err) => {
                if (err) return res.status(500).json({ error: 'Erro ao descurtir o post.' });
                res.json({ message: 'Você descurtiu o post.' });
            });
        } else {
            // Se não curtiu, curte (insere a linha)
            db.run(`INSERT INTO favorites (user_id, post_id) VALUES (?, ?)`, [userId, postId], (err) => {
                if (err) return res.status(500).json({ error: 'Erro ao curtir o post.' });
                res.json({ message: 'Você curtiu o post!' });
            });
        }
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor FiuFiu rodando na porta ${PORT}`);
});