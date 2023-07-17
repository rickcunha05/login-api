const express = require("express");
const router = express.Router();

//mongodb user model
const User = require("./../models/User");

//password handler
const bcrypt = require("bcrypt");

//signup
router.post("/signup", (req, res) => {
  let { name, email, password, dateOfBirth } = req.body;
  name = name.trim();
  email = email.trim();
  password = password.trim();
  dateOfBirth = dateOfBirth.trim();

  if (name == "" || email == "" || password == "" || dateOfBirth == "") {
    res.json({
      status: "FAILED",
      message: "Preencha os campos Obrigatório",
    });
  } else if (!/^[a-z A-z]*$/.test(name)) {
    res.json({
      status: "FAILED",
      message: "Digite um nome valido",
    });
    // } else if (!/^[\w-\.]+@([\w-]+\.)+\.)+[\w-]{2,4}$/.test(email)){
    //     res.json({
    //         status:"FAILED",
    //         message:"Digite um Email valido"
    //     });
  } else if (!new Date(dateOfBirth).getTime()) {
    res.json({
      status: "FAILED",
      message: "A data informada não é valida",
    });
  } else if (password.length < 8) {
    res.json({
      status: "FAILED",
      message: "A senha deve conter no mínimo 8 dígitos",
    });
  } else {
    User.find({ email })
      .then((result) => {
        if (result.length) {
          res.json({
            status: "FAILED",
            message: "Este email já está cadastrado no sistema",
          });
        } else {
          //armazenando o novo usuario
          const saltRounds = 10;
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newUser = new User({
                name,
                email,
                password: hashedPassword,
                dateOfBirth,
              });

              newUser
                .save()
                .then((result) => {
                  res.json({
                    status: "SUCCESS",
                    message: "Cadastro criado com sucesso.Bem vindo!!!",
                    data: result,
                  });
                })
                .catch((err) => {
                  res.json({
                    status: "FAILED",
                    message: "Ocorreu um erro ao salvar seu cadastro,tente",
                  });
                });
            })
            .catch((err) => {
              res.json({
                status: "FAILED",
                message: "Ocorreu um erro ao checar sua senha!",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "Ocorreu um erro ao checar se o usuário já existe",
        });
      });
  }
});

//signin
router.post("/signin", (req, res) => {
  let { email, password } = req.body;
  email = email.trim();
  password = password.trim();

  if (email == "" || password == "") {
    res.json({
      status: "FAILED",
      message: "Senha ou Email digitado estão incorretos",
    });
  } else {
    //verifica se o usuario existe
    User.find({ email })
      .then((data) => {
        if (data.length) {
          //usuario existe
          const hashedPassword = data[0].password;
          bcrypt
            .compare(password, hashedPassword)
            .then((result) => {
              if (result) {
                //senha correta
                res.json({
                  status: "SUCCESS",
                  message: "Login realizado com sucesso",
                  data: data,
                });
              } else {
                res.json({
                  status: "FAILED",
                  message: "A senha digitada está incorreta!",
                });
              }
            })
            .catch((err) => {
              res.json({
                status: "FAILED",
                message: "Um erro ocorreu ao verificar sua senha",
              });
            });
        } else {
          res.json({
            status: "FAILED",
            message: "As credencias inseridas estão incorretas",
          });
        }
      })
      .catch((err) => {
        res.json({
          status: "FAILED",
          message: "Aconteceu um erro quando verificamos sua senha",
        });
      });
  }
});

module.exports = router;
