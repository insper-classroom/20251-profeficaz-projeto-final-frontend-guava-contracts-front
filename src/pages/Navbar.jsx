import { useState, useEffect } from 'react';
import '../styles/Navbar.css';
import React from 'react';
import SejaContratado from './SejaContratado';

function Navbar() {
  const [contaConectada, setContaConectada] = useState(null);
  const [showForm, setShowForm] = useState(false); 
  const [overlay, setOverlay] = useState(false);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [estaAutenticando, setEstaAutenticando] = useState(false);

  const toggleOverlay = () => {
    setOverlay(!overlay);
  };

  const getLinkMetamask = () => {
    return "https://metamask.io/download/";
  };

  // const handleOpenForm = () => setShowForm(true);

  // Função para conectar, solicitar assinatura e autenticar
  const conectarEAutenticarCarteira = async () => {
    if (typeof window.ethereum === 'undefined') {
      setMostrarPopup(true);
      return;
    }

    setEstaAutenticando(true);
    console.log('MetaMask está instalada! Iniciando conexão e autenticação...');

    try {
      // 1. Solicitar permissões explicitamente
      await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
      });

      // 2. Obter as contas após a permissão ser concedida
      const contas = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const conta = contas[0];
      console.log('Conta obtida:', conta);

      // --- Início da Etapa de Assinatura ---

      // 3. Gerar desafio (Nonce) - Idealmente, obter do backend.
      //    NÃO USE NONCE GERADO NO CLIENTE EM PRODUÇÃO.
      const nonce = Math.floor(Math.random() * 1000000).toString();
      const mensagem = `Por favor, assine esta mensagem para provar que você controla esta carteira.\n\nNonce: ${nonce}`;
      console.log('Solicitando assinatura para a mensagem:', mensagem);

      // 4. Solicitar assinatura via MetaMask
      const assinatura = await window.ethereum.request({
        method: 'personal_sign',
        params: [mensagem, conta],
      });
      console.log('Assinatura recebida:', assinatura);

      // --- Fim da Etapa de Assinatura ---

      // 5. ENVIAR PARA O BACKEND PARA VERIFICAÇÃO
      //    Aqui você enviaria `conta`, `mensagem` e `assinatura` para seu servidor.
      //    O servidor usaria `ethers.utils.verifyMessage(mensagem, assinatura)`
      //    e validaria o nonce.
      console.log('Enviando para o backend (simulado):', { conta, mensagem, assinatura });
      // const respostaBackend = await fetch('/api/autenticar', { /* ... */ });
      // if (!respostaBackend.ok) throw new Error('Falha na verificação do backend');
      // const dadosSessao = await respostaBackend.json();

      // 6. Se a verificação no backend for bem-sucedida:
      console.log('Autenticação (simulada) bem-sucedida!');
      setContaConectada(conta); // Define a conta como conectada/autenticada

    } catch (error) {
      if (error.code === 4001) {
        console.log('Usuário rejeitou a solicitação.');
      } else {
        console.error('Erro durante conexão ou assinatura:', error);
      }
      setContaConectada(null); // Garante estado desconectado em caso de erro
    } finally {
      setEstaAutenticando(false); // Termina feedback de autenticação
    }
  };

  // Função para desconectar (limpa o estado local)
  const desconectarCarteira = () => {
    setContaConectada(null);
    console.log('Desconectado localmente.');
    // Considerar invalidar token de sessão no backend aqui
  };

  // useEffect para ouvir mudanças de conta
  useEffect(() => {
    const handleAccountsChanged = (contas) => {
      console.log('Mudança de conta detectada pela MetaMask:', contas);
      // Se a conta mudar ou desconectar na MetaMask, força desconexão local
      if (contas.length === 0 || (contaConectada && contas[0].toLowerCase() !== contaConectada.toLowerCase())) {
        console.log('Forçando desconexão local devido à mudança na MetaMask.');
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
  }, [contaConectada]); // Dependência para comparar com a conta atual

  const formatarEndereco = (endereco) => {
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
            {/* Botão principal: Conectar/Autenticar ou Mostrar Endereço */}
            <button
              onClick={contaConectada ? undefined : conectarEAutenticarCarteira} // Chama a nova função
              className="nome-usuario-nav" // Mantida classe original
              disabled={estaAutenticando || !!contaConectada} // Desabilita durante autenticação ou se já conectado
            >
              {estaAutenticando ? 'Autenticando...' : formatarEndereco(contaConectada)}
            </button>
            {/* Botão Sair (Desconectar) e Link Meu Perfil */}
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