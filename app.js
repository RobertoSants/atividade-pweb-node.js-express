// Importa o framework Express (usado para criar o servidor web)
const express = require('express');
const app = express(); // Inicializa a aplicação
const port = 3000; // Define a porta onde o servidor vai rodar

//Configurar EJS como template engine (permite usar HTML com JS)
app.set('view engine', 'ejs');

// Define a pasta 'public' para servir arquivos estáticos (CSS, imagens, etc.)
app.use(express.static('public'));

// Rota principal (Home) -> renderiza a página index.ejs
app.get('/', (req, res) => {
    res.render('index', { title: 'Minha Aplicação Express'});
});

// Rota /sobre -> renderiza sobre.ejs
app.get('/sobre', (req, res) => {
    res.render('sobre', { title: 'Sobre Nós'});
});

// Rota /servicos -> renderiza servicos.ejs
app.get('/servicos', (req, res) => {
    res.render('servicos', { title: 'Serviços' });
});

// Rota /contato -> renderiza contato.ejs
app.get('/contato', (req, res) => {
    res.render('contato', { title: 'Contato' });
});

// Inicia o servidor e mostra a mensagem no terminal
app.listen(port, () => {
    console.log('Servidor rodando em http://localhost:${port}');
});