var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator'); // importa funções do express-validator

/* GET - página do formulário */
router.get('/', function(req, res, next) {
  res.render('contato', { title: 'Fale Conosco', errors: null, success: null });
});

/* POST - recebe e valida dados do formulário */
router.post('/', 
  [
    check('nome', 'O nome é obrigatório.').notEmpty(),
    check('email', 'E-mail inválido.').isEmail(),
    check('mensagem', 'A mensagem deve ter pelo menos 10 caracteres.').isLength({ min: 10 })
  ],
  function(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Se houver erros, renderiza a página de novo com mensagens
      return res.render('contato', { 
        title: 'Fale Conosco', 
        errors: errors.array(), 
        success: null 
      });
    }

    // Se estiver tudo certo
    res.render('contato', { 
      title: 'Fale Conosco', 
      errors: null, 
      success: 'Mensagem enviada com sucesso!' 
    });
});

module.exports = router;