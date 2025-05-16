import { useState, useEffect, useContext } from 'react';
import '../styles/Navbar.css';
import React from 'react';
import SejaContratado from '../pages/SejaContratado';
import { ContaContext } from '../context/ContaContext'; // Importa o contexto

// Remova API_URL e chaves de localStorage daqui se estiverem no contexto

function Navbar() {
  // estados e funções do contexto
  const {
    contaConectada,
    conectarCarteira, // Função de conectar do contexto
    desconectarCarteira, // Função de desconectar do contexto
    estaAutenticando,
    erroAuthContext, // Erro do contexto
    setErroAuthContext, // Para limpar o erro
  } = useContext(ContaContext);



  const formatarEndereco = (endereco) => {
    if (!endereco) return "Conectar";
    return `${endereco.substring(0, 6)}...${endereco.substring(endereco.length - 4)}`;
  };

  return (
    <>
      <nav>
        <div className="Titulo">
          <a id='guava' href="/">Guava</a>
        </div>

        <ul className="Nav-Items">
          <li>
            <a href="/categorias" className="contrate"> Contrate</a>
          </li>
          <li className="wallet-controls">
             {erroAuthContext && !contaConectada && <span className="auth-error" style={{color: 'red', marginRight: '10px'}}>{erroAuthContext}</span>}

            <button
              onClick={contaConectada ? undefined : conectarCarteira} // Usa a função do contexto
              className="nome-usuario-nav"
              disabled={estaAutenticando || !!contaConectada}
            >
              {estaAutenticando ? 'Autenticando...' : formatarEndereco(contaConectada)}
            </button>

            {contaConectada && !estaAutenticando && (
              <>
                <button onClick={desconectarCarteira} className="desconectar">
                  Sair
                </button>
                <a href="/perfilusuario" className="link-perfil-usuario">
                  Meu Perfil
                </a>
              </>
            )}
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Navbar;
