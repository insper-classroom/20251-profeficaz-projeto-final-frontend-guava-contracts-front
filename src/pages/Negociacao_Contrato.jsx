import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ContaContext } from '../context/ContaContext';
import '../styles/Negociacao_Contrato.css';

const API_BASE_URL = 'http://127.0.0.1:5000';

function PaginaNegociacao() { 
  const { negotiationId } = useParams();
  const navigate = useNavigate();
  const { contaConectada, desconectarCarteira } = useContext(ContaContext);

  const [negotiationDetails, setNegotiationDetails] = useState(null); 
  const [currentUserRole, setCurrentUserRole] = useState(null);
  
  const [currentOfferInput, setCurrentOfferInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('Carregando negociação...');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const negDetailsRes = await axios.get(`${API_BASE_URL}/negociacao/${negotiationId}`);
      console.log("Detalhes da Negociação:", negDetailsRes.data);
      
      const details = negDetailsRes.data;
      setNegotiationDetails(details);

      // Determinar papel do usuário
      let role = null;
      if (details.cliente && details.cliente.toLowerCase() === contaConectada.toLowerCase()) {
        role = 'client';
      } else if (details.prestador && details.prestador.toLowerCase() === contaConectada.toLowerCase()) {
        role = 'freelancer';
      }
      setCurrentUserRole(role);

      if (!role) {
        setError("Você não faz parte desta negociação.");
        return;
      }
      
      // Atualizar estado com base nos dados do backend
      updateNegotiationState(details, role);

    } catch (err) {
      console.error("Erro ao carregar dados da negociação:", err);
      setError(err.response?.data?.erro || err.message || "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!contaConectada) {
      setLoading(false);
      setError("Por favor, conecte sua carteira.");
      return;
    }
    if (!negotiationId) {
      setLoading(false);
      setError("ID da negociação não encontrado na URL.");
      return;
    }

    fetchData();
  }, [negotiationId, contaConectada]);

  const updateNegotiationState = (details, role) => {
    const { proposta, contrata_proposta, valor_final } = details;
    
    // Se valor_final > 0, negociação foi aceita/finalizada
    if (valor_final > 0) {
      setIsFinalized(true);
      setStatusMessage('Negociação aceita e finalizada.');
      setIsMyTurn(false);
      return;
    }

    // Se valor_final = -1, negociação foi rejeitada
    if (valor_final === -1) {
      setIsFinalized(true);
      setStatusMessage('Negociação rejeitada.');
      setIsMyTurn(false);
      return;
    }

    setIsFinalized(false);

    // Lógica de turnos baseada nos campos existentes
    if (proposta === 0) {
      // Nenhuma proposta ainda
      if (role === 'client') {
        setIsMyTurn(true);
        setStatusMessage('Cliente, faça sua proposta inicial.');
      } else {
        setIsMyTurn(false);
        setStatusMessage('Aguardando proposta inicial do Cliente.');
      }
    } else if (contrata_proposta === 0) {
      // Cliente fez proposta, esperando contraproposta do freelancer
      if (role === 'freelancer') {
        setIsMyTurn(true);
        setStatusMessage(`Sua vez (Freelancer). Cliente propôs R$ ${proposta.toFixed(2)}`);
      } else {
        setIsMyTurn(false);
        setStatusMessage('Aguardando resposta do Freelancer.');
      }
    } else {
      // Freelancer fez contraproposta, esperando decisão do cliente
      if (role === 'client') {
        setIsMyTurn(true);
        setStatusMessage(`Sua vez (Cliente). Freelancer contrapropôs R$ ${contrata_proposta.toFixed(2)}`);
      } else {
        setIsMyTurn(false);
        setStatusMessage('Aguardando decisão do Cliente.');
      }
    }
  };
  
  const handleOfferInputChange = (event) => {
    setCurrentOfferInput(event.target.value);
  };

  const submitNegotiationAction = async (actionType) => {
    if (!currentUserRole || !negotiationDetails) {
      setError("Dados insuficientes para realizar ação.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const valorProposta = parseFloat(currentOfferInput);

      if (actionType === 'propose') {
        if (isNaN(valorProposta) || valorProposta <= 0) {
          alert("Valor da proposta inválido.");
          setLoading(false);
          return;
        }

        // Determinar qual campo atualizar baseado no estado atual
        let campoAtualizar = {};
        if (negotiationDetails.proposta === 0) {
          // Primeira proposta (sempre do cliente)
          campoAtualizar = { proposta: valorProposta };
        } else if (negotiationDetails.contrata_proposta === 0) {
          // Contraproposta do freelancer
          campoAtualizar = { contrata_proposta: valorProposta };
        } else {
          // Nova rodada - resetar e começar de novo
          campoAtualizar = { 
            proposta: valorProposta, 
            contrata_proposta: 0 
          };
        }

        // Atualizar usando o endpoint PUT genérico
        await axios.put(`${API_BASE_URL}/negociacao/${negotiationId}`, campoAtualizar);

      } else if (actionType === 'accept') {
        // Aceitar a negociação - definir valor_final
        const valorFinal = negotiationDetails.contrata_proposta > 0 ? 
          negotiationDetails.contrata_proposta : negotiationDetails.proposta;
        
        await axios.put(`${API_BASE_URL}/negociacao/${negotiationId}`, {
          valor_final: valorFinal
        });

        // Chamar endpoint de aceitar para logging/notificação
        await axios.get(`${API_BASE_URL}/negociacao/${negotiationId}/aceitar`);

      } else if (actionType === 'reject') {
        // Rejeitar a negociação
        await axios.put(`${API_BASE_URL}/negociacao/${negotiationId}`, {
          valor_final: -1
        });

        // Chamar endpoint de rejeitar para logging/notificação
        await axios.get(`${API_BASE_URL}/negociacao/${negotiationId}/rejeitar`);
      }

      // Recarregar dados após ação
      await fetchData();
      setCurrentOfferInput('');

    } catch (err) {
      console.error(`Erro ao ${actionType}:`, err);
      setError(err.response?.data?.erro || `Falha ao ${actionType}.`);
    } finally {
      setLoading(false);
    }
  };

  const criarContrato = async () => {
    // Aceitar a proposta primeiro
    await submitNegotiationAction('accept');
    
    // Aguardar um pouco para garantir que a negociação foi atualizada
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Recarregar dados para ter o valor_final atualizado
    await fetchData();
    
    // Verificar se a negociação foi aceita com sucesso
    if (!negotiationDetails || negotiationDetails.valor_final <= 0) {
      alert("Erro: A negociação precisa estar aceita para criar o contrato!");
      return;
    }

    if (window.confirm("Deseja criar um contrato inteligente na blockchain? Esta ação criará um contrato real.")) {
      try {
        setLoading(true);
        setError(null);

        // Buscar token de autenticação
        const token = localStorage.getItem('authToken');
        if (!token) {
          alert("Token de autenticação não encontrado. Por favor, faça login novamente.");
          return;
        }

        // Verificar se MetaMask está conectado e obter conta atual
        if (!window.ethereum || !window.ethereum.isMetaMask) {
          alert('MetaMask não detectada. Por favor, instale a extensão MetaMask.');
          return;
        }

        // Solicitar conexão com MetaMask se necessário
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        }

        const currentAccount = accounts[0];
        console.log("Conta conectada no MetaMask:", currentAccount);
        console.log("Conta do contexto:", contaConectada);

        // Verificar se a conta conectada é a mesma do contexto
        if (currentAccount.toLowerCase() !== contaConectada.toLowerCase()) {
          alert("A conta conectada no MetaMask é diferente da conta logada. Por favor, troque para a conta correta.");
          return;
        }

        // Passo 1: Solicitar ao backend para preparar a transação
        console.log("Preparando transação para o contrato...");
        console.log("Dados sendo enviados:", {
          id_freela: negotiationDetails.prestador,
          valor: negotiationDetails.valor_final,
          servico: `Contrato de serviço - Negociação ${negotiationId}`
        });

        const prepareResponse = await axios.post(`${API_BASE_URL}/contrato`, {
          id_freela: negotiationDetails.prestador,
          valor: negotiationDetails.valor_final,
          servico: `Contrato de serviço - Negociação ${negotiationId}`
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log("Resposta da preparação:", prepareResponse.data);
        const { transaction, contract_data } = prepareResponse.data;

        if (!transaction) {
          throw new Error("Falha ao preparar a transação no backend.");
        }

        // Validar e ajustar a transação antes de enviar para MetaMask
        const transactionForMetaMask = {
          to: transaction.to,
          data: transaction.data,
          gas: transaction.gas,
          gasPrice: transaction.gasPrice,
          from: currentAccount, // Definir explicitamente o 'from'
        };

        // Adicionar value se existir
        if (transaction.value) {
          transactionForMetaMask.value = transaction.value;
        }

        console.log("Transação formatada para MetaMask:", transactionForMetaMask);

        // Passo 2: Solicitar assinatura via MetaMask
        console.log("Solicitando assinatura via MetaMask...");
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionForMetaMask],
        });

        console.log('Transação enviada, hash:', txHash);
        alert(`Transação enviada! Hash: ${txHash}\n\nVocê pode acompanhar no Etherscan.`);

        // Passo 3: Registrar o contrato no backend com o hash da transação
        console.log("Registrando contrato no backend...");
        
        // Verificar se o endpoint existe, senão usar PUT na negociação
        try {
          const registerResponse = await axios.post(`${API_BASE_URL}/contrato/registrar`, {
            negotiation_id: negotiationId,
            tx_hash: txHash,
            ...contract_data
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log("Contrato registrado:", registerResponse.data);
        } catch (registerError) {
          // Se endpoint não existe, usar PUT na negociação
          console.log("Endpoint de registro não existe, usando PUT...");
          await axios.put(`${API_BASE_URL}/negociacao/${negotiationId}`, {
            tx_hash_contrato: txHash,
            status_contrato: "PENDENTE"
          });
        }

        alert("Contrato criado com sucesso na blockchain!");

        // Recarregar dados da negociação
        await fetchData();

      } catch (error) {
        console.error("Erro ao criar contrato:", error);
        
        if (error.response) {
          const errorMsg = error.response.data?.erro || "Erro no servidor";
          console.log("Detalhes do erro do servidor:", error.response.data);
          
          if (error.response.status === 401) {
            alert("Sua sessão expirou. Por favor, faça login novamente.");
          } else {
            setError(`Erro ao criar contrato: ${errorMsg}`);
            alert(`Erro: ${errorMsg}`);
          }
        } else if (error.code) {
          // Erro do MetaMask
          console.log("Erro do MetaMask:", error);
          setError("Erro na transação MetaMask");
          alert(`Erro do MetaMask: ${error.message}`);
        } else {
          setError("Erro de conexão ao criar contrato");
          alert("Erro de conexão. Verifique sua internet e tente novamente.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const cancelarNegociacao = async () => {
  if (window.confirm("Tem certeza que deseja cancelar esta negociação? Esta ação não pode ser desfeita.")) {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.delete(`${API_BASE_URL}/negociacao/${negotiationId}`);
      
      console.log("Resposta do backend:", response.data);
      alert(response.data.mensagem || "Negociação cancelada com sucesso!");
      
      // Redirecionar para página inicial ou anterior
      navigate('/'); // ou navigate(-1) para voltar à página anterior
      
    } catch (error) {
      console.error("Erro ao cancelar negociação:", error);
      
      if (error.response) {
        // Erro do backend
        const errorMsg = error.response.data?.erro || "Erro no servidor";
        setError(`Erro ao cancelar: ${errorMsg}`);
        alert(`Erro ao cancelar negociação: ${errorMsg}`);
      } else {
        // Erro de rede ou outro
        setError("Erro de conexão ao cancelar negociação");
        alert("Erro de conexão. Verifique sua internet e tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }
};

  if (loading && !negotiationDetails && !error) {
    return <div className="negotiation-container"><p>Carregando dados da negociação...</p></div>;
  }
  if (error) {
    return <div className="negotiation-container"><p className="status-message" style={{backgroundColor: '#ffebee', color: '#c62828'}}>Erro: {error}</p></div>;
  }
  if (!negotiationDetails && !loading) {
    return <div className="negotiation-container"><p>Detalhes da negociação não encontrados.</p></div>;
  }
  if (!currentUserRole && !loading) {
    return <div className="negotiation-container"><p className="status-message">Você não faz parte desta negociação.</p></div>;
  }

  // Determinar se há uma proposta da outra parte para aceitar/rejeitar
  const canAcceptReject = (currentUserRole === 'freelancer' && negotiationDetails.proposta > 0 && negotiationDetails.contrata_proposta === 0) ||
                         (currentUserRole === 'client' && negotiationDetails.contrata_proposta > 0);

  return (
    <div className="negotiation-container">
      <h1 className="negotiation-title">Proposta de Negociação</h1>
      <p>ID da Negociação: {negotiationId}</p>
      <p>Cliente: {negotiationDetails.cliente}</p>
      <p>Prestador: {negotiationDetails.prestador}</p>
      <p>Seu Papel: {currentUserRole === 'client' ? 'Cliente' : 'Freelancer'}</p>

      {statusMessage && (
        <div className={`status-message ${isMyTurn && !isFinalized ? 'my-turn' : ''} ${isFinalized ? 'finalized' : ''}`}>
          {statusMessage}
        </div>
      )}

      <div className="negotiation-history">
        <h2 className="history-title">Histórico de Propostas</h2>
        {negotiationDetails.proposta === 0 ? (
          <p className="history-empty">Nenhuma proposta ainda.</p>
        ) : (
          <ul>
            {negotiationDetails.proposta > 0 && (
              <li className="history-item item-client">
                <strong>Cliente</strong> propôs R$ {negotiationDetails.proposta.toFixed(2)}
              </li>
            )}
            {negotiationDetails.contrata_proposta > 0 && (
              <li className="history-item item-freelancer">
                <strong>Freelancer</strong> contrapropôs R$ {negotiationDetails.contrata_proposta.toFixed(2)}
              </li>
            )}
            {negotiationDetails.valor_final > 0 && (
              <li className="history-item item-accepted">
                <strong>Negociação aceita</strong> por R$ {negotiationDetails.valor_final.toFixed(2)}
              </li>
            )}
            {negotiationDetails.valor_final === -1 && (
              <li className="history-item item-rejected">
                <strong>Negociação rejeitada</strong>
              </li>
            )}
          </ul>
        )}
      </div>

      {!isFinalized && isMyTurn && (
        <div className="negotiation-actions">
          <h2 className="actions-title">Sua Vez</h2>
          <div className="input-group">
            <input
              type="number"
              className="offer-input"
              placeholder="Digite o valor (R$)"
              value={currentOfferInput}
              onChange={handleOfferInputChange}
              step="0.01"
              min="0"
            />
            <button
              className="send-button"
              onClick={() => submitNegotiationAction('propose')}
              disabled={!currentOfferInput || loading}
            >
              {negotiationDetails.proposta === 0 && currentUserRole === 'client' ? 
                'Enviar Proposta Inicial' : 'Enviar Contraproposta'}
            </button>
          </div>
          
          {canAcceptReject && (
            <div className="action-buttons">
              <button
                className="reject-button"
                onClick={() => submitNegotiationAction('reject')}
                disabled={loading}
              >
                Rejeitar Proposta Atual
              </button>
              <button
                className="accept-button"
                onClick={criarContrato}
                disabled={loading}
              >
                Aceitar Proposta e Finalizar
              </button>
            </div>
          )}
        </div>
      )}
      
      {currentUserRole === 'client' && (
      <div className="cancel-section" style={{marginTop: '20px'}}>
        <button
          className="cancel-button"
          onClick={cancelarNegociacao}
          disabled={loading}
          style={{
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancelar Negociação
        </button>
      </div>
    )}

      {isFinalized && (
        <div className="negotiation-finalized">
          {statusMessage}
          {/* Adicionar botão Fechar Contrato apenas para clientes quando negociação foi aceita */}
          {currentUserRole === 'client' && negotiationDetails.valor_final > 0 && !negotiationDetails.tx_hash_contrato && (
            <div style={{marginTop: '20px'}}>
              <button
                className="contract-button"
                onClick={criarContrato}
                disabled={loading}
                style={{
                  backgroundColor: '#2e7d32',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Criando Contrato...' : 'Fechar Contrato na Blockchain 📄'}
              </button>
              <p style={{fontSize: '12px', color: '#666', marginTop: '8px'}}>
                ⚠️ Esta ação criará um contrato inteligente real na blockchain
              </p>
            </div>
          )}

          {/* Mostrar link do contrato se já foi criado */}
          {negotiationDetails.tx_hash_contrato && (
            <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '4px'}}>
              <p style={{color: '#2e7d32', fontWeight: 'bold'}}>✅ Contrato criado na blockchain!</p>
              <p>
                <a 
                  href={`https://sepolia.etherscan.io/tx/${negotiationDetails.tx_hash_contrato}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{color: '#1976d2', textDecoration: 'underline'}}
                >
                  Ver transação no Etherscan
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PaginaNegociacao;