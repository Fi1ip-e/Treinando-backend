const express = require('express');
const router = express.Router();
const mogoose = require('mongoose');
require('../models/Usuario');
const Usuario = mogoose.model('usuarios');
const bcrypt = require('bcryptjs');
const passport = require('passport');

router.get('/registro', (req, res) =>
{
    res.render('usuarios/registro')
})
router.post('/registro', (req, res) =>
{
    var erros = [];
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null)
    {
        erros.push({texto: "Nome invalido"})
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null)
    {
        erros.push({texto: "Email invalido"})
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null)
    {
        erros.push({texto: "Senha invalido"})
    }
    if (req.body.senha.length < 4)
    {
        erros.push({testo: "Senha muito curta"})
    }
    if (req.body.senha != req.body.senha2)
    {
        erros.push({texto: "Senha de confirmação diferente"})
    }
    if (erros.length > 0)
    {
        res.render('usuarios/registro', {erros: erros})
    }
    else
    {
        Usuario.findOne({email: req.body.email}).then((usuario) =>
        {
            if (usuario)
            {req.flash("error_msg", "Ja existe esse email cadastrado")
            res.redirect('/usuarios/registro')
            }
            else
            {
                const NovoUsuario = new Usuario(
                    {
                        nome: req.body.nome,
                        email: req.body.email,
                        senha: req.body.senha
                    }
                )
                bcrypt.genSalt(10, (erro, salt) =>
                {
                    bcrypt.hash(NovoUsuario.senha, salt, (erro, hash) =>
                    {
                        if (erro)
                        {
                            req.flash("error_msg", "houve um erro durante o salvamento do usuario")
                            res.redirect("/")
                        }
                        NovoUsuario.senha = hash
                        NovoUsuario.save().then(() =>
                        {
                            req.flash("success_msg", "Usuario salvo com sucesso")
                            res.redirect("/")
                        }).catch((err) =>
                        {
                            req.flash("error_msg", "Houve um erro ao criar um usuario. Tente novamente")
                            res.redirect("/")
                        })
                    })
                })              
            }
        }).catch((err) =>
        {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }
})

router.get('/login', (req, res) =>
{
    res.render('usuarios/login')
})
router.post('/login', (req, res, next) =>
{
    passport.authenticate('local',
    {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) =>
{
    req.logout()
    req.flash('success_msg', "deslogado com sucesso")
    res.redirect('/')
})
module.exports = router