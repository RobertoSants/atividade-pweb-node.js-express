// Importa os módulos necessários
var express = require('express');
var router = express.Router();

// Importa funções de validação e verificação do express-validator
const { body, validationResult } = require('express-validator');

// Importa o módulo de banco de dados (SQLite)
// Este arquivo 'db.js' está na raiz do projeto e cria/gerencia a base 'contatos.db'
const db = require('../db');

/**
 * GET /contato – Exibe o formulário de contato
 * Esta rota apenas renderiza o formulário vazio na primeira carga.
 * Nenhum dado é salvo aqui — serve apenas para exibir a página.
 */
router.get('/', (req, res) => {
  res.render('contato', {
    title: 'Formulário de Contato',
    data: {},     // Dados vazios inicialmente
    errors: {}    // Nenhum erro ainda
  });
});

/**
 * POST /contato – Processa e valida o envio do formulário
 * Aqui é onde o Express valida, sanitiza e insere os dados no banco.
 * O express-validator é usado para garantir integridade dos dados.
 */
router.post('/',
  [
    // Validação do nome (mínimo 3 e máximo 60 caracteres, apenas letras e espaços)
    body('nome')
      .trim()
      .isLength({ min: 3, max: 60 }).withMessage('Nome deve ter entre 3 e 60 caracteres.')
      .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/).withMessage('Nome contém caracteres inválidos.')
      .escape(),

    // Validação do e-mail (precisa ser válido)
    body('email')
      .trim()
      .isEmail().withMessage('E-mail inválido.')
      .normalizeEmail(),

    // Novo campo: telefone (opcional, apenas números com 10 ou 11 dígitos)
    body('telefone')
      .optional({ checkFalsy: true })
      .matches(/^\d{10,11}$/)
      .withMessage('Telefone deve conter apenas números (10 ou 11 dígitos, ex: 82999999999).'),

    // Validação da idade (opcional, mas se informada, deve estar entre 1 e 120)
    body('idade')
      .trim()
      .optional({ checkFalsy: true })
      .isInt({ min: 1, max: 120 })
      .withMessage('Idade deve ser um inteiro entre 1 e 120.')
      .toInt(),

    // Validação do gênero (deve estar entre os valores listados)
    body('genero')
      .isIn(['', 'feminino', 'masculino', 'nao-binario', 'prefiro-nao-informar'])
      .withMessage('Gênero inválido.'),

    // Validação dos interesses (pode ser um ou vários)
    body('interesses')
      .optional({ checkFalsy: true })
      // Garante que o campo sempre será um array, mesmo que o usuário selecione apenas um
      .customSanitizer(v => Array.isArray(v) ? v : (v ? [v] : []))
      .custom((arr) => {
        const valid = ['node', 'express', 'ejs', 'frontend', 'backend'];
        // Verifica se todos os valores enviados são válidos
        return arr.every(x => valid.includes(x));
      })
      .withMessage('Interesse inválido.'),

    // Validação da mensagem (mínimo 10 e máximo 500 caracteres)
    body('mensagem')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Mensagem deve ter entre 10 e 500 caracteres.')
      .escape(),

    // Verificação do aceite dos termos (checkbox obrigatório)
    body('aceite')
      .equals('on')
      .withMessage('Você deve aceitar os termos para continuar.'),

    // Campo senha mantido como exemplo opcional (não obrigatório)
    body('senha')
      .optional({ checkFalsy: true })
      .isLength({ min: 8, max: 64 })
      .withMessage('Senha deve ter entre 8 e 64 caracteres.')
  ],

  (req, res) => {
    // Coleta os erros de validação, se houver
    const errors = validationResult(req);

    // Cria o objeto com os dados enviados do formulário
    // Obs.: Apenas campos realmente usados são mantidos aqui
    const data = {
      nome: req.body.nome,
      email: req.body.email,
      telefone: req.body.telefone || '',
      idade: req.body.idade,
      genero: req.body.genero || '',
      interesses: req.body.interesses || [],
      mensagem: req.body.mensagem,
      aceite: req.body.aceite === 'on',
      senha: req.body.senha
    };

    // Se houver erros de validação, o formulário é reexibido com os erros
    if (!errors.isEmpty()) {
      const mapped = errors.mapped(); // Transforma os erros em objeto acessível no EJS
      return res.status(400).render('contato', {
        title: 'Formulário de Contato',
        data,
        errors: mapped
      });
    }

    /**
     * SUCESSO: SALVAR NO BANCO DE DADOS
     * Aqui ocorre a integração real com o SQLite.
     * Os dados validados são inseridos na tabela "contatos"
     * usando uma instrução SQL preparada (para evitar injeções).
     */
    const stmt = db.prepare(`
      INSERT INTO contatos (nome, email, idade, genero, interesses, mensagem, aceite)
      VALUES (@nome, @email, @idade, @genero, @interesses, @mensagem, @aceite)
    `);

    // Executa o comando SQL substituindo os parâmetros (@campo)
    stmt.run({
      nome: data.nome,
      email: data.email,
      idade: data.idade || null,
      genero: data.genero || null,
      interesses: Array.isArray(data.interesses)
        ? data.interesses.join(',') // transforma array de interesses em texto (ex: "node,express")
        : (data.interesses || ''),
      mensagem: data.mensagem,
      aceite: data.aceite ? 1 : 0 // Converte booleano em número (1=aceitou, 0=não)
    });

    // Após salvar os dados, renderiza a página de sucesso
    return res.render('sucesso', {
      title: 'Enviado com sucesso',
      data
    });
  }
);

/**
 * GET /contato/lista – Lista de contatos cadastrados
 * Esta rota exibe todos os contatos salvos no banco.
 * O resultado é exibido em uma tabela EJS (contatos-lista.ejs).
 */
router.get('/lista', (req, res) => {
  // Consulta todos os registros da tabela "contatos"
  const rows = db.prepare(`
    SELECT id, nome, email, idade, genero, interesses, mensagem, criado_em
    FROM contatos
    ORDER BY criado_em DESC
  `).all();

  // Renderiza a view com os dados obtidos
  res.render('contatos-lista', {
    title: 'Lista de Contatos',
    contatos: rows
  });
});

/**
 * POST /contato/:id/delete – Exclui um contato específico
 * Didático: usamos POST (não GET) para exclusão.
 * Em APIs REST, o ideal seria DELETE, mas aqui o foco é segurança e simplicidade.
 */
router.post('/:id/delete', (req, res) => {
  // Captura o ID da URL e converte para número inteiro
  const id = parseInt(req.params.id, 10);

  // Verifica se o ID é válido
  if (Number.isNaN(id)) {
    // Se não for, apenas redireciona de volta à lista
    return res.redirect('/contato/lista');
  }

  // Executa o comando SQL DELETE para remover o registro
  const info = db.prepare('DELETE FROM contatos WHERE id = ?').run(id);

  // (Opcional) Você poderia verificar se algo foi realmente excluído:
  // if (info.changes === 0) console.log('Nenhum registro com esse ID encontrado.');

  // Redireciona de volta para a lista após exclusão
  return res.redirect('/contato/lista');
});

// Exporta para ser usado no app.js
module.exports = router;