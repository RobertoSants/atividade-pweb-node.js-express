const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// GET – Exibe o formulário
router.get('/', (req, res) => {
  res.render('cadastro', {
    title: 'Cadastro de Usuário',
    data: {},
    errors: {},
    csrfToken: req.csrfToken() // Proteção contra CSRF
  });
});

// POST – Processa o envio
router.post('/',
  [
    // Nome: obrigatório, apenas letras
    body('nome')
      .trim()
      .isLength({ min: 3, max: 60 }).withMessage('O nome deve ter entre 3 e 60 caracteres.')
      .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/).withMessage('Use apenas letras e espaços.')
      .escape(),

    // E-mail
    body('email').isEmail().withMessage('E-mail inválido.').normalizeEmail(),

    // Senha
    body('senha')
      .isLength({ min: 8, max: 20 }).withMessage('A senha deve ter entre 8 e 20 caracteres.')
      .matches(/[A-Z]/).withMessage('A senha deve conter pelo menos uma letra maiúscula.')
      .matches(/\d/).withMessage('A senha deve conter pelo menos um número.')
      .escape(),

    // País (select obrigatório)
    body('pais').notEmpty().withMessage('Selecione um país.'),

    // Estado (datalist)
    body('estado').trim().notEmpty().withMessage('Informe o estado.'),

    // Gênero (radio)
    body('genero').isIn(['masculino', 'feminino', 'outro']).withMessage('Selecione um gênero válido.'),

    // Interesses (checkbox)
    body('interesses')
      .optional({ checkFalsy: true })
      .customSanitizer(v => Array.isArray(v) ? v : (v ? [v] : []))
      .custom(arr => {
        const valid = ['tecnologia', 'design', 'musica', 'esportes', 'cinema'];
        return arr.every(x => valid.includes(x));
      }).withMessage('Interesse inválido.'),

    // Comentário (textarea)
    body('comentario')
      .trim().isLength({ min: 10, max: 300 }).withMessage('Comentário deve ter entre 10 e 300 caracteres.')
      .escape(),

    // Termos (checkbox)
    body('aceite').equals('on').withMessage('Você deve aceitar os termos.')
  ],

  (req, res) => {
    const errors = validationResult(req);
    const data = {
      nome: req.body.nome,
      email: req.body.email,
      senha: req.body.senha,
      pais: req.body.pais,
      estado: req.body.estado,
      genero: req.body.genero,
      interesses: req.body.interesses || [],
      comentario: req.body.comentario,
      aceite: req.body.aceite === 'on'
    };

    if (!errors.isEmpty()) {
      return res.status(400).render('cadastro', {
        title: 'Cadastro de Usuário',
        data,
        errors: errors.mapped(),
        csrfToken: req.csrfToken()
      });
    }

    return res.render('sucesso-cadastro', {
      title: 'Cadastro realizado com sucesso!',
      data
    });
  }
);

module.exports = router;