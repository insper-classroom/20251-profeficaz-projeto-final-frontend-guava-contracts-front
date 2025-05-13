import { useState, useEffect, useContext } from 'react';
import '../styles/Navbar.css';
import React from 'react';
import SejaContratado from '../pages/SejaContratado';
import { ContaContext } from '../context/ContaContext';

// URL base da sua API Flask
const API_URL = 'http://127.0.0.1:5000';

// Chaves para localStorage
const AUTH_TOKEN_KEY = 'authToken';
const USER_ADDRESS_KEY = 'userAddress';

function Navbar() {
  const {contaConectada, setContaConectada} = useContext(ContaContext); // Armazena o endereço da conta
  const [overlay, setOverlay] = useState(false);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [estaAutenticando, setEstaAutenticando] = useState(false); // Durante o processo de clique no botão
  const [erroAuth, setErroAuth] = useState(null);

  const toggleOverlay = () => {
    setOverlay(!overlay);
    setErroAuth(null);
  };

  const getLinkMetamask = () => {
    return "https://metamask.io/download/";
  };

  // Função para conectar, solicitar assinatura e autenticar
  const conectarEAutenticarCarteira = async () => {
    if (typeof window.ethereum === 'undefined') {
      setMostrarPopup(true);
      return;
    }

    setEstaAutenticando(true);
    setErroAuth(null);
    console.log('MetaMask está instalada! Iniciando conexão e autenticação...');

    try {
      await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
      });
      const contas = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const conta = contas[0]; // Endereço obtido da MetaMask
      console.log('Conta obtida:', conta);

      const nonceResponse = await fetch(`${API_URL}/nonce/${conta}`);
      if (!nonceResponse.ok) {
        const errorData = await nonceResponse.json();
        throw new Error(errorData.error || 'Falha ao obter nonce do servidor.');
      }
      const { nonce } = await nonceResponse.json();
      console.log('Nonce recebido do backend:', nonce);

      const mensagem = `Por favor, assine esta mensagem para provar que você controla esta carteira.\n\nNonce: ${nonce}`;
      console.log('Solicitando assinatura para a mensagem:', mensagem);
      const assinatura = await window.ethereum.request({
        method: 'personal_sign',
        params: [mensagem, conta],
      });
      console.log('Assinatura recebida:', assinatura);

      const verifyResponse = await fetch(`${API_URL}/verificar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: conta, message: mensagem, signature: assinatura }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'Falha na verificação da assinatura pelo servidor.');
      }

      const { token } = await verifyResponse.json();
      console.log('Autenticação bem-sucedida! Token recebido.');

      // Armazenar Token E Endereço no localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(USER_ADDRESS_KEY, conta); // Salva o endereço
      setContaConectada(conta); // Define a conta imediatamente após login bem-sucedido

    } catch (error) {
      console.error('Erro durante autenticação:', error);
      setErroAuth(error.message || 'Ocorreu um erro.');
      setContaConectada(null);

      // Limpa ambos os itens do localStorage em caso de erro
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_ADDRESS_KEY);
      if (error.code === 4001) {
        setErroAuth('Você rejeitou a solicitação na MetaMask.');
      }
    } finally {
      setEstaAutenticando(false);
    }
  };

  // Função para desconectar
  const desconectarCarteira = () => {
    setContaConectada(null);
    // Limpa ambos os itens do localStorage
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_ADDRESS_KEY);
    setErroAuth(null);
    console.log('Desconectado localmente. Token e endereço removidos.');
  };


  // useEffect para restaurar estado do localStorage e ouvir mudanças de conta
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedAddress = localStorage.getItem(USER_ADDRESS_KEY);

    // Se ambos existirem, restaura o estado
    if (storedToken && storedAddress) {
      console.log('Sessão restaurada do localStorage para:', storedAddress);
      setContaConectada(storedAddress);
    } else {
      console.log('Nenhuma sessão encontrada no localStorage.');
      // Garante que se um item existir mas o outro não, ambos sejam limpos
      if (storedToken || storedAddress) {
          desconectarCarteira();
      }
    }

    // Listener para mudanças de conta na MetaMask
    const handleAccountsChanged = (contas) => {
      console.log('Mudança de conta detectada pela MetaMask:', contas);
      const currentStoredAddress = localStorage.getItem(USER_ADDRESS_KEY); // Pega o endereço que deveria estar logado

      // Se tínhamos um endereço armazenado e não há mais contas OU a conta ativa mudou
      if (currentStoredAddress && (contas.length === 0 || contas[0].toLowerCase() !== currentStoredAddress.toLowerCase())) {
        console.log('Forçando desconexão local devido à mudança na MetaMask.');
        desconectarCarteira();
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
    // Formata o endereço do estado contaConectada
    if (!endereco) return "Conectar";
    return `${endereco.substring(0, 6)}...${endereco.substring(endereco.length - 4)}`;
  };

  // JSX return
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
             {erroAuth && <span className="auth-error" style={{color: 'red', marginRight: '10px'}}>{erroAuth}</span>}

            <button
              onClick={contaConectada ? undefined : conectarEAutenticarCarteira}
              className="nome-usuario-nav"
              disabled={estaAutenticando || !!contaConectada} // Desabilita se autenticando ou se já conectado
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
      {/* Popup para MetaMask não detectada */}
      {mostrarPopup && (
        <div className="metamask-popup-overlay">
          {/* ... (código do popup) ... */}
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
              onClick={() => { setMostrarPopup(false); setErroAuth(null); }}
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