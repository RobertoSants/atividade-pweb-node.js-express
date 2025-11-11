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
 * Renderiza o template "contato.ejs" com objetos vazios para evitar erros na primeira carga.
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
 * Aqui aplicamos as validações e sanitizações usando express-validator.
 */
router.post('/',
  [
    // Validação do nome (mínimo 3 e máximo 60 caracteres, apenas letras e espaços)
    body('nome')
      .trim()
      .isLength({ min: 3, max: 60 }).withMessage('Nome deve ter entre 3 e 60 caracteres.')
      .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/).withMessage('Nome contém caracteres inválidos.')
      .escape(),

    // Validação do e-mail
    body('email')
      .trim()
      .isEmail().withMessage('E-mail inválido.')
      .normalizeEmail(),

    // Validação da idade (opcional, mas se informada, deve estar entre 1 e 120)
    body('idade')
      .trim()
      .optional({ checkFalsy: true })
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
        return arr.every(x => valid.includes(x)); // Todos os valores devem ser válidos
      }).withMessage('Interesse inválido.'),

    // Validação da mensagem (mínimo 10 e máximo 500 caracteres)
    body('mensagem')
      .trim()
      .isLength({ min: 10, max: 500 }).withMessage('Mensagem deve ter entre 10 e 500 caracteres.')
      .escape(),

    // Verificação do aceite dos termos (checkbox)
    body('aceite')
      .equals('on').withMessage('Você deve aceitar os termos para continuar.'),

    // Exemplos Adicionais de Validações (Passo 16)

    // Exemplo: validação de "pontuação" entre 0 e 100 (inteiro)
    body('pontuacao')
      .optional({ checkFalsy: true })
      .isInt({ min: 0, max: 100 })
      .withMessage('Pontuação deve estar entre 0 e 100.'),

    // Exemplo: validação de "senha" entre 8 e 64 caracteres
    body('senha')
      .optional({ checkFalsy: true })
      .isLength({ min: 8, max: 64 })
      .withMessage('Senha deve ter entre 8 e 64 caracteres.'),

    // Exemplo: código alfanumérico (6 caracteres, letras e números)
    body('codigo')
      .optional({ checkFalsy: true })
      .matches(/^[A-Z0-9]{6}$/i)
      .withMessage('Código deve ter 6 caracteres alfanuméricos.'),

    // Exemplo: sanitização de campo "comentario"
    body('comentario')
      .optional({ checkFalsy: true })
      .trim()
      .escape()
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
      aceite: req.body.aceite === 'on',
      // Campos extras opcionais (exemplo didático)
      pontuacao: req.body.pontuacao,
      senha: req.body.senha,
      codigo: req.body.codigo,
      comentario: req.body.comentario
    };

    // Se houver erros, reexibe o formulário com as mensagens
    if (!errors.isEmpty()) {
      const mapped = errors.mapped();
      return res.status(400).render('contato', {
        title: 'Formulário de Contato',
        data,
        errors: mapped
      });
    }

    /**
     * SUCESSO: SALVAR NO BANCO DE DADOS
     * Aqui ocorre a integração real com o banco SQLite.
     * Os dados validados são inseridos na tabela "contatos"
     * usando uma instrução SQL preparada (segura contra injeções).
     */
    const stmt = db.prepare(`
      INSERT INTO contatos (nome, email, idade, genero, interesses, mensagem, aceite)
      VALUES (@nome, @email, @idade, @genero, @interesses, @mensagem, @aceite)
    `);

    // Executa o comando SQL substituindo os parâmetros pelos valores do formulário
    stmt.run({
      nome: data.nome,
      email: data.email,
      idade: data.idade || null,
      genero: data.genero || null,
      interesses: Array.isArray(data.interesses)
        ? data.interesses.join(',') // transforma array de interesses em texto (ex: "node,express")
        : (data.interesses || ''),
      mensagem: data.mensagem,
      aceite: data.aceite ? 1 : 0 // converte booleano em número (1=aceitou, 0=não)
    });

    // Após inserir os dados, renderiza a página de sucesso normalmente
    return res.render('sucesso', {
      title: 'Enviado com sucesso',
      data
    });
  }
);

/**
 * GET /contato/lista – Lista de contatos cadastrados
 * Esta rota exibe todos os contatos salvos no banco SQLite.
 * É usada apenas para visualização e consulta.
 */
router.get('/lista', (req, res) => {
  // Consulta todos os registros da tabela contatos
  const rows = db.prepare(`
    SELECT id, nome, email, idade, genero, interesses, mensagem, criado_em
    FROM contatos
    ORDER BY criado_em DESC
  `).all();

  // Renderiza a página 'contatos-lista.ejs' passando os dados obtidos
  res.render('contatos-lista', {
    title: 'Lista de Contatos',
    contatos: rows
  });
});

/**
 * POST /contato/:id/delete – Exclui um contato específico pelo ID
 * ---------------------------------------------------------------
 * 📘 Didático: Usamos POST (e não GET) para seguir boas práticas REST e de segurança.
 * O ideal seria o método HTTP DELETE, mas aqui simplificamos o fluxo.
 */
router.post('/:id/delete', (req, res) => {
  // Captura o ID da URL e converte para número inteiro
  const id = parseInt(req.params.id, 10);

  // Verifica se o ID é válido
  if (Number.isNaN(id)) {
    // Caso o ID seja inválido, apenas redireciona de volta à lista
    return res.redirect('/contato/lista');
  }

  // Executa o comando SQL DELETE no registro correspondente
  const info = db.prepare('DELETE FROM contatos WHERE id = ?').run(id);

  // (Opcional) Teste: você pode verificar se algum registro foi realmente apagado
  // if (info.changes === 0) console.log('Nenhum registro com esse ID');

  // Após exclusão, redireciona novamente para a lista de contatos
  return res.redirect('/contato/lista');
});

// Exporta para ser usado no app.js
module.exports = router;