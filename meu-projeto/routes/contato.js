// Importa os módulos necessários
var express = require('express');
var router = express.Router();

// Importa funções de validação e verificação do express-validator
const { body, validationResult } = require('express-validator');

/**
 * GET /contato – Exibe o formulário de contato
 * Aqui renderizamos o template "contato.ejs" com os objetos "data" e "errors" vazios
 * para evitar erros quando o formulário for carregado pela primeira vez.
 */
router.get('/', (req, res) => {
  res.render('contato', {
    title: 'Formulário de Contato',
    data: {},     // Dados vazios inicialmente
    errors: {}    // Nenhum erro ainda
  });
});

/**
 * POST /contato – Processa o envio do formulário
 * Nesta rota, aplicamos as validações e sanitizações com express-validator.
 */
router.post('/',
  [
    // Validação do nome (mínimo 3 e máximo 60 caracteres, apenas letras)
    body('nome')
      .trim().isLength({ min: 3, max: 60 }).withMessage('Nome deve ter entre 3 e 60 caracteres.')
      .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/).withMessage('Nome contém caracteres inválidos.')
      .escape(),

    // Validação do e-mail
    body('email')
      .trim().isEmail().withMessage('E-mail inválido.')
      .normalizeEmail(),

    // Validação da idade (opcional, mas se informada, deve estar entre 1 e 120)
    body('idade')
      .trim().optional({ checkFalsy: true })
      .isInt({ min: 1, max: 120 }).withMessage('Idade deve ser um inteiro entre 1 e 120.')
      .toInt(),

    // Validação do gênero (deve estar entre os valores listados)
    body('genero')
      .isIn(['', 'feminino', 'masculino', 'nao-binario', 'prefiro-nao-informar'])
      .withMessage('Gênero inválido.'),

    // Validação dos interesses (pode ser vários valores)
    body('interesses')
      .optional({ checkFalsy: true })
      .customSanitizer(v => Array.isArray(v) ? v : (v ? [v] : [])) // Garante que será sempre um array
      .custom((arr) => {
        const valid = ['node', 'express', 'ejs', 'frontend', 'backend'];
        return arr.every(x => valid.includes(x)); // Todos os valores devem estar dentro dos válidos
      }).withMessage('Interesse inválido.'),

    // Validação da mensagem (mínimo 10 e máximo 500 caracteres)
    body('mensagem')
      .trim().isLength({ min: 10, max: 500 }).withMessage('Mensagem deve ter entre 10 e 500 caracteres.')
      .escape(),

    // Verificação do aceite dos termos (checkbox)
    body('aceite')
      .equals('on').withMessage('Você deve aceitar os termos para continuar.')
  ],

  (req, res) => {
    // Coleta os erros de validação, se houver
    const errors = validationResult(req);

    // Cria o objeto data com os valores enviados no formulário
    const data = {
      nome: req.body.nome,
      email: req.body.email,
      idade: req.body.idade,
      genero: req.body.genero || '',
      interesses: req.body.interesses || [],
      mensagem: req.body.mensagem,
      aceite: req.body.aceite === 'on'
    };

    // Se houver erros de validação, renderiza novamente o formulário com mensagens
    if (!errors.isEmpty()) {
      const mapped = errors.mapped(); // Mapeia os erros por campo
      return res.status(400).render('contato', {
        title: 'Formulário de Contato',
        data,
        errors: mapped
      });
    }

    // Caso os dados sejam válidos, renderiza a página de sucesso
    return res.render('sucesso', {
      title: 'Enviado com sucesso',
      data
    });
  }
);

// Exporta o roteador para ser usado no app.js
module.exports = router;