import React, { useEffect, useState } from 'react';
import { Paper, Button } from '@material-ui/core';
import { CustomField, SelectBox } from '../components';
import { cpf } from 'cpf-cnpj-validator';
import Inputmask from 'inputmask';
import { useHistory } from 'react-router-dom';
import { host } from '../actions/backendConnection';

export default function CadastroUsuario() {
  const [controlador, setControlador] = useState({
    userCPF: '',
    nome: '',
    user: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    genero: '',
    dataNascimento: '',
    country: '',
    estado: '',
    cidade: '',
    telefone: '',
  });

  let emailValido = false;
  let userValido = false;
  const history = useHistory();

  function populaPaises() {
    fetch(`${host}/address/getPaises`)
      .then((resp) => resp.json())
      .then((data) => {
        setControlador((prev) => {
          return { ...prev, listaPaises: data };
        });
      });
  }

  function populaEstados(id) {
    fetch(`${host}/address/getEstados`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id,
      }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        setControlador((prev) => {
          return { ...prev, listaEstados: data };
        });
      });
  }

  function populaCidades(id) {
    fetch(`${host}/address/getCidades`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id,
      }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        setControlador((prev) => {
          return { ...prev, listaCidades: data };
        });
      });
  }

  function populaGeneros() {
    fetch(`${host}/users/getGeneros`)
      .then((resp) => resp.json())
      .then((data) => {
        setControlador((prev) => {
          return { ...prev, listaGeneros: data };
        });
      });
  }

  useEffect(() => {
    Inputmask({ mask: '999.999.999-99' }).mask(document.getElementById('cpf'));
    Inputmask({ mask: '(99) 9 9999-9999' }).mask(
      document.getElementById('telefone'),
    );
    populaGeneros();
    populaPaises();
  }, []);

  function validador(senha) {
    const regex = /^(?=.*[@!#$%^&*()/\\])[@!#$%^&*()/\\a-zA-Z0-9]{8,20}$/;
    const valid = regex.test(senha);
    if (valid && senha.length >= 8) {
      return true;
    } else {
      return false;
    }
  }

  function cpfValidator(value) {
    const x = cpf.format(value);
    if (cpf.isValid(x)) {
      document.getElementById('cpf').style.borderColor = 'green';
    } else {
      document.getElementById('cpf').style.borderColor = 'red';
    }
    setControlador((prev) => {
      return { ...prev, userCPF: x };
    });
  }

  function validaSenha() {
    const senha = document.getElementById('senha');
    const confirmarSenha = document.getElementById('confirmarSenha');

    if (validador(senha.value) && senha.value === confirmarSenha.value) {
      senha.style.borderColor = 'green';
      confirmarSenha.style.borderColor = 'green';
      setControlador((prev) => {
        return { ...prev, senhaValida: true };
      });
    } else {
      senha.style.borderColor = 'red';
      confirmarSenha.style.borderColor = 'red';
      setControlador((prev) => {
        return { ...prev, senhaValida: false };
      });
    }
  }

  function selectPais(e) {
    populaEstados(e);
    setControlador((prev) => {
      return { ...prev, country: e };
    });
  }

  function selectEstado(e) {
    populaCidades(e);
    setControlador((prev) => {
      return { ...prev, estado: e };
    });
  }

  function validaCampos() {
    debugger;
    const {
      userCPF,
      nome,
      email,
      senhaValida,
      genero,
      dataNascimento,
      country,
      estado,
      cidade,
    } = controlador;

    if (
      userCPF &&
      nome &&
      email &&
      senhaValida &&
      userValido &&
      emailValido &&
      genero &&
      dataNascimento &&
      country &&
      estado &&
      cidade
    ) {
      return false;
    } else if (!userValido) {
      return 'Usu??rio inv??lido ou em uso.';
    } else if (!emailValido) {
      return 'Email j?? em uso.';
    } else if (!senhaValida) {
      return 'Senha invalida, necess??rio que a senha tenha no m??nimo 8 caracteres, possuindo ao menos 1 n??mero, 1 caracter especial, 1 letra mai??scula e 1 letra min??scula.';
    } else {
      return 'Necess??rio que os campos: Nome Completo, Usu??rio, E-mail, CPF, Senha, G??nero, Data Nascimento, Pa??s, Estado e Cidade estejam corretamente preenchidos.';
    }
  }

  function createUser() {
    const msg = validaCampos();
    if (!msg) {
      const unmaskCPF = Inputmask.unmask(controlador.userCPF, {
        mask: '999-999-999-99',
      });
      const unmaskTelefone = controlador.telefone
        ? Inputmask.unmask(controlador.telefone, {
            mask: '(99) 9 9999-9999',
          })
        : null;
      fetch(`${host}/users/createUser`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userCPF: unmaskCPF,
          nome: controlador.nome,
          user: controlador.user,
          email: controlador.email,
          senha: controlador.senha,
          genero: controlador.genero,
          dataNascimento: controlador.dataNascimento,
          country: controlador.country,
          estado: controlador.estado,
          cidade: controlador.cidade,
          telefone: unmaskTelefone,
        }),
      })
        .then((req) => req.json())
        .then((data) => {
          if (data?.status === 200) {
            alert('Usu??rio criado com sucesso.');
            history.push('/login');
          } else {
            alert(
              'Ocorreu um erro durante a cria????o de usu??rio. Por favor tente novamente.',
            );
          }
        });
    } else {
      alert(msg);
    }
  }

  async function validaUsername(username) {
    const userField = document.getElementById('user');
    await fetch(`${host}/users/validaUsername`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
      }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data?.[0].count === 0) {
          userField.style.borderColor = 'green';
          userValido = true;
        } else {
          userField.style.borderColor = 'red';
          alert('Username j?? em uso.');
          userValido = false;
        }
      });
  }

  async function validaEmail(email) {
    const emailField = document.getElementById('email');
    await fetch(`${host}/users/validaEmail`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
      }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data?.[0].count === 0) {
          emailField.style.borderColor = 'green';
          emailValido = true;
        } else {
          emailField.style.borderColor = 'red';
          alert('Email j?? cadastrado.');
          emailValido = false;
        }
      });
  }

  const { listaPaises, listaEstados, listaCidades, listaGeneros } = controlador;

  return (
    <div
      className="formGroup"
      style={{
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        marginTop: '3%',
      }}
    >
      <Paper
        elevation={5}
        style={{
          minWidth: 300,
          width: '90%',
          maxWidth: 700,
          padding: 20,
          zoom: 1.2,
          marginBottom: 10,
        }}
      >
        <div style={{ fontSize: 24 }}>Dados Cadastrais</div>
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <CustomField
              label="Nome Completo"
              name="nome"
              id="nome"
              onChange={(e) =>
                setControlador((prev) => {
                  return { ...prev, nome: e };
                })
              }
              value={controlador.nome}
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <CustomField
              label="Usu??rio"
              name="user"
              id="user"
              onChange={(e) =>
                setControlador((prev) => {
                  return { ...prev, user: e };
                })
              }
              onBlur={(e) => validaUsername(e)}
              value={controlador.user}
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <CustomField
              label="E-mail"
              id="email"
              name="email"
              placeholder="exemplo@email.com.br"
              type="email"
              onChange={(e) =>
                setControlador((prev) => {
                  return { ...prev, email: e };
                })
              }
              onBlur={(e) => validaEmail(e)}
              value={controlador.email}
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <CustomField
              label="CPF"
              id="cpf"
              name="cpf"
              value={controlador.userCPF}
              onChange={(e) => cpfValidator(e)}
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <CustomField
              label="Senha"
              name="senha"
              id="senha"
              type="password"
              placeholder="Ex: 123@Senha"
              title="?? necess??rio que a senha tenha no m??nimo 8 caracteres, possuindo ao menos 1 n??mero, 1 caracter especial, 1 letra mai??scula e 1 letra min??scula."
              onChange={(e) => {
                validaSenha();
                setControlador((prev) => {
                  return { ...prev, senha: e };
                });
              }}
              value={controlador.senha}
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <CustomField
              label="Confirmar Senha"
              id="confirmarSenha"
              name="confirmarSenha"
              type="password"
              onChange={(e) => {
                validaSenha();
                setControlador((prev) => {
                  return { ...prev, confirmarSenha: e };
                });
              }}
              value={controlador.confirmarSenha}
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <SelectBox
              label="G??nero"
              name="genero"
              id="genero"
              onChange={(e) => {
                setControlador((prev) => {
                  return { ...prev, genero: e };
                });
              }}
              value={controlador.genero}
              list={listaGeneros}
              idCol="id"
              valueCol="label"
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <CustomField
              label="Data de Nascimento"
              id="dataNascimento"
              name="dataNascimento"
              type="date"
              onChange={(e) =>
                setControlador((prev) => {
                  return { ...prev, dataNascimento: e };
                })
              }
              value={controlador.dataNascimento}
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <SelectBox
              label="Pa??s"
              name="country"
              id="country"
              onChange={(e) => selectPais(e)}
              value={controlador.country}
              list={listaPaises}
              idCol="id"
              valueCol="fips"
              complementCol="nome"
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <SelectBox
              label="Estado (UF)"
              id="estado"
              name="estado"
              disabled={!controlador.country}
              onChange={(e) => selectEstado(e)}
              value={controlador.estado}
              list={listaEstados}
              idCol="id"
              valueCol="uf"
              complementCol="nome"
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <SelectBox
              label="Cidade"
              id="cidade"
              name="cidade"
              disabled={!controlador.estado}
              onChange={(e) =>
                setControlador((prev) => {
                  return { ...prev, cidade: e };
                })
              }
              value={controlador.cidade}
              list={listaCidades}
              idCol="id"
              valueCol="nome"
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <CustomField
              label="Telefone"
              id="telefone"
              name="telefone"
              type="tel"
              onChange={(e) =>
                setControlador((prev) => {
                  return { ...prev, telefone: e };
                })
              }
              value={controlador.telefone}
            />
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: 20,
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={() => history.push('/login')}
            style={{
              background: 'rgb(255 0 0)',
              color: 'white',
              width: '40%',
            }}
          >
            Voltar
          </Button>
          <Button
            variant="contained"
            size="small"
            style={{
              background: '#47967e',
              color: 'white',
              width: '40%',
            }}
            onClick={async () => {
              if (!emailValido) {
                await validaEmail(controlador.email);
              }
              if (!userValido) {
                await validaUsername(controlador.user);
              }
              createUser();
            }}
          >
            Salvar
          </Button>
        </div>
      </Paper>
    </div>
  );
}
