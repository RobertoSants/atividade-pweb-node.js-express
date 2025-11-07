var express = require('express');
var router = express.Router();

/* GET about page. */
router.get('/', function(req, res, next) {
  // renderiza o arquivo "about.ejs" e envia o título
  res.render('about', { title: 'Sobre Nós' });
});

module.exports = router;