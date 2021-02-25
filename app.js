const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const admin = require("./routes/admin");
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
require('./models/Postagem');
const Postagem = mongoose.model('postagens');
require('./models/Categorias');
const Categoria = mongoose.model('categorias');
const usuarios = require('./routes/usuarios');
const passport = require('passport');
require('./config/auth')(passport);
//CONFIGURAÇÕES:

//Session
//Validar os campos
app.use(session(
    {
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }
))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) =>
{//declaração de variavel global
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
})

//mongoose
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blogapp", {useNewUrlParser: true, useUnifiedTopology: true }).then(() =>
{
    console.log("conectado ao mongo")
}).catch((err) =>
{
    console.log("Erro ao se conectar " + err)
})

//body-parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//handlebars
app.engine('handlebars', handlebars({extname: 'handlebars', defaultLayout: 'main', layoutsDir: __dirname + "/views/layouts"}));
app.set('view engine', 'handlebars');
//app.set('views', path.join(__dirname, 'views'));

//public
app.use(express.static(path.join(__dirname, "public")));
//app.use(express.static("public"));
//ROTA principal

app.get('/', (req, res) =>
{
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) =>
    {
        res.render('index', {postagens: postagens})
    }).catch((err) =>
    {
        req.flash('error_msg', 'Houve um erro')
        res.redirect('/404')
    })    
})
//rota de visualização de conteudo das postagem
app.get('/postagem/:slug', (req, res) =>
{
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) =>
    {
        if (postagem)
        {
            res.render('postagem/vermais', {postagem: postagem})
        }        
        
    }).catch((err) =>
    {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect('/')
    })
})

app.get('/categorias', (req, res) =>
{
    Categoria.find().then((categoria) =>
    {
        res.render('categorias/cat', {categoria: categoria.map(category => category.toJSON())})
    }).catch((err) =>
    {
        req.flash("error_msg", "houve um erro ao carregar as categorias")
        res.redirect('/')
    })
})

app.get('/categoria/:slug', (req, res) =>
{
    Categoria.findOne({slug: req.params.slug}).then((categoria) =>
    {
        if (categoria)
        {
            Postagem.find({categoria: categoria._id}).lean().then((postagens) =>
            {
                res.render('categorias/post', {postagens: postagens, categoria: categoria})
            }).catch((err) =>
            {
                req.flash("error_msg", "Houve um erro ao listar oa post")
                res.redirect('/')
            })
        }
        else
        {
            req.flash("error_msg", "Essa categoria não existe")
            res.redirect('/')
        }
    })
})

app.get('/404', (req, res) =>
{
    res.send("Erro 404!")
})

app.use('/usuarios', usuarios)

app.use('/admin', admin)
//SERVIDOR
const port = 8080;
//const http = require('http');
const hostname = '127.0.0.1';

app.listen(port || hostname, () => {console.log("Servidor rodando")});