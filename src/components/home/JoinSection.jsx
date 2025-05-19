import React, { useContext, useState } from 'react';
import { ContaContext } from '../../context/ContaContext';

function JoinSection() {
  // função de conexão exposta pelo contexto
  const { contaConectada, conectarCarteira, estaAutenticando, erroAuthContext, setErroAuthContext } = useContext(ContaContext);
  const [loadingJoin, setLoadingJoin] = useState(false); // Estado de loading local para o botão

  const handleConnectWallet = async () => {
    if (!contaConectada && conectarCarteira) {
      if (erroAuthContext) setErroAuthContext(null); // Limpa erro anterior do contexto
      setLoadingJoin(true); // Ativa loading local
      await conectarCarteira(); // Chama a função de autenticação completa do contexto
      setLoadingJoin(false); // Desativa loading local
    }
  };

  return (
    <section className="join-section">
      <div className="container">
        <h2 className="join-title">Pronto para começar?</h2>
        <p className="join-subtitle">
          {contaConectada
            ? 'Você já está conectado! Explore a plataforma.'
            : 'Junte-se à plataforma Guava e experimente a segurança dos contratos inteligentes.'}
        </p>
        {/* Exibe erro do contexto, se houver */}
        {erroAuthContext && !contaConectada && <p className="auth-error-join">{erroAuthContext}</p>}

        {contaConectada ? (
          <div className="join-button-connected">
            Conectado
          </div>
        ) : (
          <button
            className="join-button"
            onClick={handleConnectWallet}
            disabled={estaAutenticando || loadingJoin} // Desabilita se o contexto está autenticando ou o botão local está carregando
          >
            {estaAutenticando || loadingJoin ? 'Conectando...' : 'Conectar Carteira'}
          </button>
        )}
      </div>
    </section>
  );
}

export default JoinSection;