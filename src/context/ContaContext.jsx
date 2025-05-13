import React, { createContext, useState, useEffect } from 'react';

export const ContaContext = createContext();

// URL base da sua API Flask
const API_URL = 'http://127.0.0.1:5000'; // Mova para cá ou para um arquivo de config

// Chaves para localStorage
const AUTH_TOKEN_KEY = 'authToken';
const USER_ADDRESS_KEY = 'userAddress';

export const ContaProvider = ({ children }) => {
  const [contaConectada, setContaConectada] = useState(null);
  const [estaAutenticando, setEstaAutenticando] = useState(false);
  const [erroAuthContext, setErroAuthContext] = useState(null); // Erro específico do contexto
  const [mostrarPopupMetamask, setMostrarPopupMetamask] = useState(false);


  const desconectarCarteiraLocalmente = () => {
    setContaConectada(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_ADDRESS_KEY);
    setErroAuthContext(null);
    console.log('Contexto: Desconectado localmente. Token e endereço removidos.');
  };

  const conectarEAutenticarCarteiraContext = async () => {
    if (typeof window.ethereum === 'undefined') {
      setMostrarPopupMetamask(true); // Controla o popup a partir do contexto
      return null; // Retorna null ou lança erro para indicar falha
    }

    setEstaAutenticando(true);
    setErroAuthContext(null);
    console.log('Contexto: MetaMask está instalada! Iniciando conexão e autenticação...');

    try {
      await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
      });
      const contas = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const conta = contas[0];
      console.log('Contexto: Conta obtida:', conta);

      const nonceResponse = await fetch(`${API_URL}/nonce/${conta}`);
      if (!nonceResponse.ok) {
        const errorData = await nonceResponse.json();
        throw new Error(errorData.error || 'Falha ao obter nonce do servidor.');
      }
      const { nonce } = await nonceResponse.json();
      console.log('Contexto: Nonce recebido do backend:', nonce);

      const mensagem = `Por favor, assine esta mensagem para provar que você controla esta carteira.\n\nNonce: ${nonce}`;
      const assinatura = await window.ethereum.request({
        method: 'personal_sign',
        params: [mensagem, conta],
      });
      console.log('Contexto: Assinatura recebida:', assinatura);

      const verifyResponse = await fetch(`${API_URL}/verificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: conta, message: mensagem, signature: assinatura }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'Falha na verificação da assinatura pelo servidor.');
      }

      const { token } = await verifyResponse.json();
      console.log('Contexto: Autenticação bem-sucedida! Token recebido.');

      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(USER_ADDRESS_KEY, conta);
      setContaConectada(conta);
      return conta; // Retorna a conta em caso de sucesso
    } catch (error) {
      console.error('Contexto: Erro durante autenticação:', error);
      setErroAuthContext(error.message || 'Ocorreu um erro.');
      desconectarCarteiraLocalmente(); // Garante limpeza em caso de erro
      if (error.code === 4001) {
        setErroAuthContext('Você rejeitou a solicitação na MetaMask.');
      }
      return null; // Retorna null em caso de erro
    } finally {
      setEstaAutenticando(false);
    }
  };

  // useEffect para restaurar estado e ouvir mudanças de conta
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedAddress = localStorage.getItem(USER_ADDRESS_KEY);

    if (storedToken && storedAddress) {
      setContaConectada(storedAddress);
    } else if (storedToken || storedAddress) {
      desconectarCarteiraLocalmente();
    }

    const handleAccountsChanged = (contas) => {
      const currentStoredAddress = localStorage.getItem(USER_ADDRESS_KEY);
      if (currentStoredAddress && (contas.length === 0 || contas[0].toLowerCase() !== currentStoredAddress.toLowerCase())) {
        desconectarCarteiraLocalmente();
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


  const value = {
    contaConectada,
    // setContaConectada, // Não exponha diretamente se a lógica de conexão/desconexão deve ser centralizada
    conectarCarteira: conectarEAutenticarCarteiraContext, // Nome da função para conectar
    desconectarCarteira: desconectarCarteiraLocalmente, // Nome da função para desconectar
    estaAutenticando,
    erroAuthContext, // Exponha o erro do contexto
    setErroAuthContext, // Para limpar o erro de outros componentes se necessário
    mostrarPopupMetamask, // Para controlar o popup de "instale o metamask"
    setMostrarPopupMetamask
  };

  return (
    <ContaContext.Provider value={value}>
      {children}
      {/* Você pode mover o Popup MetaMask para cá para ser global */}
      {mostrarPopupMetamask && (
        <div className="metamask-popup-overlay">
          <div className="metamask-popup">
            <h2>MetaMask não detectada</h2>
            <p>Para conectar sua carteira, instale a extensão MetaMask.</p>
            <button
              className="install-btn"
              onClick={() => window.open("https://metamask.io/download/", "_blank")}
            >
              Ir para instalação
            </button>
            <br />
            <button
              className="close-btn"
              onClick={() => { setMostrarPopupMetamask(false); if(setErroAuthContext) setErroAuthContext(null); }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </ContaContext.Provider>
  );
};