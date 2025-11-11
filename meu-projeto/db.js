// Este arquivo é responsável por criar e gerenciar o banco de dados SQLite.
// Ele garante que o banco exista e que a tabela 'contatos' seja criada automaticamente.

// Importa módulos internos do Node.js
const Database = require('better-sqlite3'); // Biblioteca de acesso ao SQLite
const path = require('path');                // Lida com caminhos de arquivos de forma segura
const fs = require('fs');                    // Manipula arquivos e diretórios

// Define o diretório onde o banco será salvo (ex: ./data)
const dbDir = path.join(__dirname, 'data');

// Se a pasta 'data' ainda não existir, cria automaticamente
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Define o caminho completo do arquivo do banco de dados (ex: ./data/contatos.db)
const dbPath = path.join(dbDir, 'contatos.db');

// Cria ou abre o banco de dados SQLite
const db = new Database(dbPath);

// Cria a tabela 'contatos' se ainda não existir
// Essa tabela armazenará os dados enviados pelo formulário de contato
db.prepare(`
  CREATE TABLE IF NOT EXISTS contatos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Identificador único de cada registro
    nome TEXT NOT NULL,                    -- Nome do usuário
    email TEXT NOT NULL,                   -- E-mail do usuário
    idade INTEGER,                         -- Idade (opcional)
    genero TEXT,                           -- Gênero (opcional)
    interesses TEXT,                       -- Lista de interesses (em texto)
    mensagem TEXT NOT NULL,                -- Mensagem principal
    aceite INTEGER NOT NULL,               -- 1 se aceitou os termos, 0 se não
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP -- Data e hora automáticas de criação
  )
`).run(); // Executa o comando imediatamente

// Exporta a instância do banco para ser usada em outros arquivos
module.exports = db;