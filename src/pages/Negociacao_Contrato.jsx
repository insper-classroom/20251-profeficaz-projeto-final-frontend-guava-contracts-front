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
    
    // Aqui você pode adicionar a lógica do contrato se necessário
    // Por enquanto, apenas aceita a negociação
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
        </div>
      )}
    </div>
  );
}

export default PaginaNegociacao;