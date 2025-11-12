// Rota responsável por exibir todos os contatos
// cadastrados no banco de dados SQLite.

// Importa os módulos necessários
var express = require('express');
var router = express.Router();

// Importa a conexão com o banco de dados
const db = require('../db');

/**
 * GET /lista
 * Busca todos os contatos armazenados na tabela "contatos"
 * e envia para a view "lista.ejs" renderizar na tela.
 */
router.get('/', (req, res) => {
  try {
    // Consulta todos os registros da tabela contatos
    const contatos = db.prepare('SELECT * FROM contatos ORDER BY criado_em DESC').all();

    // Renderiza a página 'lista.ejs' passando os dados encontrados
    res.render('lista', {
      title: 'Lista de Contatos Cadastrados',
      contatos // envia o array de resultados para o template
    });

  } catch (err) {
    // Caso ocorra erro no banco, mostra uma mensagem simples de erro
    console.error('Erro ao buscar contatos:', err.message);

    res.status(500).render('error', {
      title: 'Erro ao carregar lista',
      message: 'Ocorreu um erro ao tentar carregar a lista de contatos.'
    });
  }
});

module.exports = router;