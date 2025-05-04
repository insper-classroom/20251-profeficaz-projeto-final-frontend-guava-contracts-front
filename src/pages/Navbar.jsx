  import { useState, useEffect } from 'react';
  import '../styles/Navbar.css';
  import React from 'react';
  import SejaContratado from './SejaContratado';

function Navbar() {
  const [contaConectada, setContaConectada] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [overlay, setOverlay] = useState(false)
  const [mostrarPopup, setMostrarPopup] = useState(false)

  const toggleOverlay = () => {
    setOverlay(!overlay)
  }

  const getLinkMetamask = () => {
    return "https://metamask.io/download/";}

  const handleOpenForm = () => setShowForm(true);

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
        
        setContaConectada(conta);
      } catch (error) {
        
        if (error.code === 4001) {
          console.log('Usuário rejeitou a solicitação.');
        } else {
          console.error('Erro ao conectar com a MetaMask:', error);
        }
      }
    } else {
      setMostrarPopup(true);
    }
  };

  // Função para desconectar (limpa o estado local)
  const desconectarCarteira = () => {
    setContaConectada(null);
    
  };


  // useEffect para ouvir mudanças de conta
  useEffect(() => {
    const handleAccountsChanged = (contas) => {
        if (contas.length > 0) {
            setContaConectada(contas[0]);
            
        } else {
            setContaConectada(null);
            
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

  const formatarEndereco = (endereco) => {
    if (!endereco) return "Conectar";
    return `${endereco.substring(0, 6)}...${endereco.substring(endereco.length - 4)}`;
  };

  // JSX return - SEM MUDANÇAS
  return (
    <>
      <SejaContratado state={overlay} onClose={toggleOverlay}/>
      <nav>
        <div className="Titulo">
          <a id='guava' href="/">Guava</a>
        </div>

   
      <ul className="Nav-Items">
        <li>
          <a href="#" onClick={toggleOverlay} className="seja-contratado">Seja Contratado</a>
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
            <button onClick={desconectarCarteira} className="desconectar">
              Desconectar
            </button>
          )}
        </li>
      </ul>
    </nav>
    {mostrarPopup && (
      <div className="metamask-popup-overlay">
        <div className="metamask-popup">
          <h2>MetaMask não detectada</h2>
          <p>Para conectar sua carteira, instale a extensão MetaMask.</p>
          <button
            className="install-btn"
            onClick={() => window.open(getLinkMetamask(), "_blank")}
          >
            Ir para instalação
          </button>
          <br />
          <button
            className="close-btn"
            onClick={() => setMostrarPopup(false)}
          >
            Fechar
          </button>
        </div>
      </div>
    )}
  </>
  );
}

  export default Navbar;
