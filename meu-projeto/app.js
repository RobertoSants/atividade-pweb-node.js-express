// Importa as bibliotecas necessárias para o funcionamento do servidor
var createError = require('http-errors'); // cria mensagens de erro HTTP (ex: 404, 500)
var express = require('express'); // principal framework para servidor Node.js
var path = require('path'); // ajuda a lidar com caminhos de arquivos
var cookieParser = require('cookie-parser'); // permite ler cookies (dados salvos no navegador)
var logger = require('morgan'); // exibe logs das requisições no terminal

// Importa os arquivos de rotas (cada um é responsável por uma parte do site)
var indexRouter = require('./routes/index'); // rota da página inicial
var usersRouter = require('./routes/users'); // rota de exemplo gerada automaticamente
var aboutRouter = require('./routes/about'); // rota personalizada
var contatoRouter = require('./routes/contato'); // rota de formulário

// Inicializa a aplicação Express
var app = express();

// CONFIGURAÇÕES GERAIS

// Define o mecanismo de templates (EJS) e o diretório das views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares (funções executadas em toda requisição)
app.use(logger('dev')); // mostra no terminal o tipo de requisição (GET, POST, etc.)
app.use(express.json()); // permite ler dados JSON no corpo das requisições
app.use(express.urlencoded({ extended: false })); // permite ler dados de formulários
app.use(cookieParser()); // habilita uso de cookies
app.use(express.static(path.join(__dirname, 'public'))); // define a pasta "public" para arquivos estáticos (CSS, imagens, etc.)

// ROTAS DO SISTEMA
app.use('/', indexRouter); // rota raiz (ex: http://localhost:3000/)
app.use('/users', usersRouter); // rota padrão do Generator
app.use('/about', aboutRouter); // nova rota personalizada
app.use('/contato', contatoRouter); // nova rota para formulario

// TRATAMENTO DE ERROS

// Se nenhuma rota for encontrada, gera erro 404 e envia ao handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Handler de erros gerais
app.use(function(err, req, res, next) {
  // Define mensagem e status do erro
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Renderiza a página de erro (views/error.ejs)
  res.status(err.status || 500);
  res.render('error');
});

// Exporta a aplicação para ser usada pelo arquivo bin/www
module.exports = app;