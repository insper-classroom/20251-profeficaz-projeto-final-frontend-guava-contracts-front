import { useState, useEffect } from 'react';
import '../styles/Navbar.css';
import React from 'react';

function Navbar() {
  const [contaConectada, setContaConectada] = useState(null);

  // Função para conectar a carteira
  const conectarCarteira = async () => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask está instalada!');
      try {
        // 1. Solicitar permissões explicitamente
        await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }] // Solicita permissão para acessar contas
        });

        // 2. Obter as contas após a permissão ser concedida
        const contas = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const conta = contas[0];
        console.log('Conta conectada:', conta);
        setContaConectada(conta);
      } catch (error) {
        console.error('Erro ao conectar com a MetaMask:', error);
        // O erro 4001 (User Rejected Request) pode acontecer em qualquer um dos requests
        if (error.code === 4001) {
          console.log('Usuário rejeitou a solicitação.');
        } else {
          console.error('Erro inesperado:', error);
        }
      }
    } else {
      console.log('MetaMask não está instalada. Por favor, instale a extensão.');
      alert('MetaMask não detectada. Instale a extensão para conectar sua carteira.');
    }
  };

  // Função para desconectar (limpa o estado local)
  const desconectarCarteira = () => {
    setContaConectada(null);
    console.log('Carteira desconectada (localmente).');
  };


  // useEffect para ouvir mudanças de conta
  useEffect(() => {
    const handleAccountsChanged = (contas) => {
        if (contas.length > 0) {
            setContaConectada(contas[0]);
            console.log('Conta alterada para:', contas[0]);
        } else {
            setContaConectada(null);
            console.log('Carteira desconectada (via MetaMask).');
        }
    };

    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
        if (window.ethereum && window.ethereum.removeListener) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
    };
  }, []);

  // formatarEndereco - SEM MUDANÇAS
  const formatarEndereco = (endereco) => {
    if (!endereco) return "Conectar";
    return `${endereco.substring(0, 6)}...${endereco.substring(endereco.length - 4)}`;
  }

  // JSX return - SEM MUDANÇAS
  return (
      <nav>
        <div className="Titulo">
          <a id='guava' href="/">Guava</a>
        </div>

   
      <ul className="Nav-Items">
        <li>
          <a href="#" className="seja-contratado"> Seja Contratado</a>
        </li>
        <li>
          <a href="/categorias" className="contrate"> Contrate</a>
        </li>
        <li className="wallet-controls">
          <button
            onClick={contaConectada ? null : conectarCarteira}
            className="conectar"
            disabled={!!contaConectada}
          >   
            {formatarEndereco(contaConectada)}
          </button>
          {contaConectada && (
            <button onClick={desconectarCarteira} className="conectar">
              Desconectar
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
