const express = require('express');
const routes = express.Router();
const mongoose = require('mongoose');
require('../models/Categorias');
const Categoria = mongoose.model('categorias');
require('../models/Postagem');
const Postagem = mongoose.model('postagens');
const {eadmin} = require('../helpers/eadmin');


//>>>>>>>>ROTAS<<<<<<<<<<<

//>>>>>ROTA DE CRIAÇÃO E LISTAGEM DE CATEGORIA
routes.get('/cat', eadmin, (req, res) =>
{
    Categoria.find().then((categorias) =>
    {
        res.render("admin/categorias", {categorias: categorias.map(category => category.toJSON())})
    }).catch((err) =>
    {
        req.flash('error-msg', 'houve um erro ao lista as categorias')
    })
})
routes.get('/categorias/add', eadmin, (req, res) =>
{
    res.render('admin/addcategoria');
})
routes.post('/categorias/nova', eadmin,(req, res) =>
{
    var erros = [];
    
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null)
    {
        erros.push({texto: "Nome invalido!"});
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null)
    {
        erros.push({texto: "slug invalido!"});
    }

    if (erros.length > 0)
    {
        res.render('admin/addcategoria', {erros: erros})
    }

    const novaCategoria = {
        nome: req.body.nome, slug: req.body.slug
    }
    new Categoria(novaCategoria).save().then(() =>
    {
        req.flash('success_msg', 'categoria criada com sucesso!')
        res.redirect('/admin/cat')
    }).catch((err) =>
    {
        req.flash('error_msg', 'Erro ao salvar a categoria')
        res.redirect('/admin/cat')
    })
})
//Postagem
routes.get('/post', eadmin,(req, res) =>
{
    Postagem.find().populate("categoria").sort({data:'desc'}).then((postagens) =>
    {
        res.render('admin/postagens', {postagens: postagens.map(postage => postage.toJSON())})
    }).catch((err) =>
    {
        req.flash("error_msg", "houve um erro ao carregar a lista de postagem")
    })
})
routes.get('/postagens/add', eadmin,(req, res) =>
{
    Categoria.find().lean().then((categorias) =>
    {
        res.render('admin/addpostagem', {categorias: categorias})
    }).catch((err) =>
    {
        req.flash("error_msg", "Erro ao carregar formulario" + err)
        res.redirect('/admin/postagens')
    })
})
routes.post('/postagens/nova', eadmin,(req, res) =>
{
    var erros = [];
    
    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null)
    {
        erros.push({texto: "titulo invalido invalido!"});
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null)
    {
        erros.push({texto: "slug invalido!"});
    }
    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null)
    {
        erros.push({texto: "descrição ivalida invalido!"});
    }
    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null)
    {
        erros.push({texto: "conteudo ivalida invalido!"});
    }
    if (erros.length > 0)
    {
        res.render('/admin/post', {erros: erros})
    }

    const NovaPostagem = {
        titulo: req.body.titulo, slug: req.body.slug,
        descricao: req.body.descricao, conteudo: req.body.conteudo,
        categoria: req.body.categoria
    }
    new Postagem(NovaPostagem).save().then(() =>
    {
        req.flash("success_msg", "Salvo nova postagem!")
        res.redirect('/admin/post')
    }).catch((err) =>
    {
        req.flash("error_msg", "Erro ao cadastrar nova postagem!" + err)
        res.redirect('/admin/post')
    })
})

//>>>>>>>ROTAS DE EDIÇÃO DOS CONTEUDOS

routes.get('/categorias/edit/:id', eadmin,(req, res) =>
{    
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) =>
    {
        res.render('admin/editcategoria', {categoria: categoria})
    }).catch((err) =>
    {
        req.flash("error_msg", "Esta categoria não existe" + err)
        res.redirect('/admin/cat')
    })
})

routes.post('/categorias/edit', eadmin, (req, res) =>
{
    Categoria.findOne({_id: req.body.id}).then((categoria) =>
    {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() =>
        {
            req.flash("success_msg", "Salvo com sucesso!")
            res.redirect('/admin/cat')
        }).catch((err) =>
        {
            req.flash("error_msg", "Erro ao salvar")
            res.redirect('/admin/cat')
        })
    }).catch((err) =>
    {
        req.flash("error_msg", "Erro ao editar" + err)
        res.redirect('/admin/cat')
    })
})
//>>>>>>>>>>>>>>>>>POSTAGEM
routes.get('/postagem/edit/:id', (req, res) =>
{
    Postagem.findOne({_id: req.params.id}).lean().then((postagens) =>
    {
        Categoria.find().lean().then((categoria) =>
        {
            res.render('admin/editpostagens', {categoria: categoria, postagens: postagens})
        }).catch((err) =>
        {
            ("error_msg", "Erro ao carregar as categorias")
            res.redirect('/admin/post')
        })
        
    }).catch((err) =>
    {
        req.flash("error_msg", "Erro ao carregar formulario de edição")
        res.redirect('/admin/post')
    })
})
routes.post('/postagens/edit', eadmin, (req, res) =>
{
    Postagem.findOne({_id: req.body.id}).then((postagem) =>
    {
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        
        postagem.save().then(() =>
        req.flash("success_msg", "Salvo alterações"))
        res.redirect('/admin/post')
    }).catch((err) =>
    {
        req.flash("error_msg", "Erro ao fazer alterações")
        res.redirect('/admin/post')
    })
})
//>>>>>>>>>>>>>>Delete<<<<<<<<<<<<<<<

//categorias
routes.post('/categorias/deletar', (req, res) =>
{
    Categoria.remove({_id: req.body.id}).lean().then(() =>
    {
        req.flash("success_msg", "Excluida com sucesso!")
        res.redirect('/admin/cat')
    }).catch((err) =>
    {
        req.flash("error_msg", "houve um erro ao excluir" + err)
        res.redirect('/admin/cat')
    })
})

//postagens
routes.post('/postagem/delete', eadmin,(req, res) =>
{
    Postagem.remove({_id: req.body.id}).then(() =>
    {
        req.flash("success_msg", "Exluido com sucesso")
        res.redirect('/admin/post')
    }).catch((err) =>
    {
        req.flash("error_msg", "Erro ao delete uma postagem")
        res.redirect('/admin/post')
    })
})

module.exports = routes;