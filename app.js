//app.js
const express = require('express');
const app = express();
const port = 3000;

//Configurar EJS como template engine
app.set('view engine', 'ejs');

//Servir arquivos estáticos da pasta 'public'
app.use(express.static('public'));

//Rota principal (Home)
app.get('/', (req, res) => {
    res.render('index', { title: 'Minha Aplicação Express'});
});

//Outras Rotas
app.get('/sobre', (req, res) => {
    res.render('index', { title: 'Sobre Nós'});
});

//Rota para "Serviços"
app.get('/servicos', (req, res) => {
    res.render('servicos', { title: 'Serviços' });
});

//Rota para "Contato"
app.get('/contato', (req, res) => {
    res.render('contato', { title: 'Contato' });
});

//Iniciar o Servidor
app.listen(port, () => {
    console.log('Servidor rodando em http://localhost:${port}');
});