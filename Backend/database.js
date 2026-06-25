const sqlite3 = require('sqlite3').verbose();

// Conecta ao banco de dados SQLite (cria o arquivo database.sqlite se não existir)
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// Criação das tabelas obrigatórias
db.serialize(() => {
    // Tabela de Usuários
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    // Tabela de Posts
    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Tabela de Favoritos (Curtidas)
    db.run(`CREATE TABLE IF NOT EXISTS favorites (
        user_id INTEGER NOT NULL,
        post_id INTEGER NOT NULL,
        PRIMARY KEY (user_id, post_id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (post_id) REFERENCES posts (id)
    )`);
});

module.exports = db;