var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // render() procura o arquivo "index.ejs" dentro de /views
  // e envia a variável "title" para ser usada lá dentro
  res.render('index', { title: 'Minha Aplicação' });
});

// Exporta as rotas para o app.js
module.exports = router;