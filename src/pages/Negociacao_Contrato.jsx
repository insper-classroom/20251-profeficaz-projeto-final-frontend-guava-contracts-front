// filepath: src/pages/Negociacao_Cliente.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ContaContext } from '../context/ContaContext';
import '../styles/Negociacao_Contrato.css';

const API_BASE_URL = 'http://127.0.0.1:5000';
const AUTH_TOKEN_KEY = 'authToken';

function Pagina_Negociacao_Contrato() {
  const { id: contractId } = useParams();
  const navigate = useNavigate();
  const { contaConectada, desconectarCarteira } = useContext(ContaContext);

  const [contractDetails, setContractDetails] = useState(null);
  const [negotiationHistory, setNegotiationHistory] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null); // 'client' ou 'freelancer'
  
  const [currentOfferInput, setCurrentOfferInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('Carregando negociação...');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!contractId || !contaConectada) {
      setLoading(false);
      if (!contaConectada) navigate('/'); // Redireciona se não estiver conectado
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        if (desconectarCarteira) desconectarCarteira();
        navigate('/');
        return;
      }

      try {
        // 1. Buscar Detalhes do Contrato
        const contractRes = await axios.get(`${API_BASE_URL}/contrato/${contractId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const details = contractRes.data.dados || contractRes.data;
        setContractDetails(details);

        // 2. Determinar Papel do Usuário
        let role = null;
        if (details.address_cliente && details.address_cliente.toLowerCase() === contaConectada.toLowerCase()) {
          role = 'client';
        } else if (details.address_prestador && details.address_prestador.toLowerCase() === contaConectada.toLowerCase()) {
          role = 'freelancer';
        }
        setCurrentUserRole(role);

        if (!role) {
          throw new Error("Você não faz parte deste contrato.");
        }

        // 3. Buscar Histórico de Negociação
        const historyRes = await axios.get(`${API_BASE_URL}/contrato/${contractId}/negociacao`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const history = historyRes.data.historico || historyRes.data.dados || []; 
        setNegotiationHistory(history);
        
        // 4. Determinar Turno, Status e Finalização
        updateNegotiationState(history, role, details.status_contrato);

      } catch (err) {
        console.error("Erro ao carregar dados da negociação:", err);
        setError(err.response?.data?.error || err.message || "Erro ao carregar dados.");
        if (err.response?.status === 401 || err.response?.status === 422) {
            if(desconectarCarteira) desconectarCarteira();
            navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contractId, contaConectada, navigate, desconectarCarteira]);

  const updateNegotiationState = (history, role, contractStatus) => {
    if (contractStatus === 'ACEITO' || contractStatus === 'FINALIZADO' || contractStatus === 'CANCELADO') {
      setIsFinalized(true);
      setStatusMessage(`Negociação ${contractStatus === 'ACEITO' || contractStatus === 'FINALIZADO' ? 'Concluída' : 'Cancelada'}. Status: ${contractStatus}`);
      setIsMyTurn(false);
      return;
    }

    setIsFinalized(false);
    const lastEntry = history.length > 0 ? history[history.length - 1] : null;

    if (!lastEntry) { // Nenhuma proposta ainda
      if (role === 'client') {
        setIsMyTurn(true);
        setStatusMessage('Cliente, faça sua proposta inicial.');
      } else { // Freelancer
        // Verifica se há uma proposta inicial no contrato (para o freelancer responder)
        if (contractDetails?.valor_inicial && contractDetails?.status_contrato === 'PENDENTE_FREELANCER') {
             setIsMyTurn(true);
             setStatusMessage('Cliente fez uma proposta inicial. Sua vez, Freelancer.');
        } else {
            setIsMyTurn(false);
            setStatusMessage('Aguardando proposta inicial do Cliente.');
        }
      }
    } else {
      // lastEntry.actorRole deve ser 'client' ou 'freelancer'
      const lastActorIsClient = lastEntry.actorRole === 'client';
      if (role === 'client') {
        setIsMyTurn(!lastActorIsClient); // Turno do cliente se o último não foi ele
        setStatusMessage(!lastActorIsClient ? 'Sua vez (Cliente).' : 'Aguardando resposta do Freelancer.');
      } else { // Freelancer
        setIsMyTurn(lastActorIsClient); // Turno do freelancer se o último foi o cliente
        setStatusMessage(lastActorIsClient ? 'Sua vez (Freelancer).' : 'Aguardando resposta do Cliente.');
      }
    }
  };
  
  const handleOfferInputChange = (event) => {
    setCurrentOfferInput(event.target.value);
  };

  const submitNegotiationAction = async (actionType, value = null) => {
    if (!currentUserRole) {
      setError("Não foi possível determinar seu papel na negociação.");
      return;
    }
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    setLoading(true);
    try {
      let endpoint = `${API_BASE_URL}/contrato/${contractId}/`;
      const payload = { role: currentUserRole };

      if (actionType === 'propose') {
        endpoint += 'negociar';
        payload.valor = parseFloat(currentOfferInput);
        if (isNaN(payload.valor) || payload.valor <= 0) {
          alert("Valor da proposta inválido.");
          setLoading(false);
          return;
        }
      } else if (actionType === 'accept') {
        endpoint += 'aceitar';
      } else if (actionType === 'reject') {
        endpoint += 'rejeitar';
      } else {
        setLoading(false);
        return;
      }

      await axios.post(endpoint, payload, { headers: { 'Authorization': `Bearer ${token}` } });
      
      const historyRes = await axios.get(`${API_BASE_URL}/contrato/${contractId}/negociacao`, { headers: { 'Authorization': `Bearer ${token}` } });
      const newHistory = historyRes.data.historico || historyRes.data.dados || [];
      setNegotiationHistory(newHistory);
      
      const contractRes = await axios.get(`${API_BASE_URL}/contrato/${contractId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const updatedDetails = contractRes.data.dados || contractRes.data;
      setContractDetails(updatedDetails);

      updateNegotiationState(newHistory, currentUserRole, updatedDetails.status_contrato);
      setCurrentOfferInput('');

    } catch (err) {
      console.error(`Erro ao ${actionType}:`, err);
      setError(err.response?.data?.error || `Falha ao ${actionType}.`);
       if (err.response?.status === 401 || err.response?.status === 422) {
            if(desconectarCarteira) desconectarCarteira();
            navigate('/');
        }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !contractDetails) return <div className="negotiation-container"><p>Carregando dados da negociação...</p></div>;
  if (error) return <div className="negotiation-container"><p className="status-message" style={{backgroundColor: '#ffebee', color: '#c62828'}}>Erro: {error}</p></div>;
  if (!contractDetails) return <div className="negotiation-container"><p>Contrato não encontrado.</p></div>;
  if (!currentUserRole) return <div className="negotiation-container"><p className="status-message">Verificando seu papel no contrato...</p></div>;

  const lastOfferByOtherParty = negotiationHistory.length > 0 && negotiationHistory[negotiationHistory.length - 1].actorRole !== currentUserRole;

  return (
    <div className="negotiation-container">
      <h1 className="negotiation-title">Negociação do Contrato</h1>
      <p>ID do Contrato: {contractId}</p>
      <p>Seu Papel: {currentUserRole === 'client' ? 'Cliente' : 'Freelancer'}</p>

      {statusMessage && <div className={isMyTurn || isFinalized ? "status-message" : "waiting-message"}>{statusMessage}</div>}

      {/* Proposta Inicial do Cliente (para Freelancer ver) */}
      {currentUserRole === 'freelancer' && contractDetails?.valor_inicial && negotiationHistory.length <= 1 && (
        <div className="client-initial-proposal">
          <h2 className="proposal-title">Proposta Inicial do Cliente</h2>
          <p><strong>Valor Proposto:</strong> R$ {parseFloat(contractDetails.valor_inicial).toFixed(2)}</p>
          <p><strong>Descrição:</strong> {contractDetails.descricao_servico || 'Não especificado'}</p>
        </div>
      )}

      <div className="negotiation-history">
        <h2 className="history-title">Histórico de Negociações</h2>
        {negotiationHistory.length === 0 ? (
          <p className="history-empty">Nenhuma proposta ainda.</p>
        ) : (
          <ul>
            {negotiationHistory.map((entry, index) => (
              <li 
                key={index} 
                className={`history-item ${entry.actorRole === 'client' ? 'item-client' : 'item-freelancer'} ${entry.type === 'ACEITE' ? 'item-accepted' : ''} ${entry.type === 'REJEICAO' ? 'item-rejected' : ''}`}
              >
                <strong>{entry.actorRole === 'client' ? 'Cliente' : 'Freelancer'}:</strong>
                {entry.type === 'PROPOSTA' && ` Propôs R$ ${parseFloat(entry.valor).toFixed(2)}`}
                {entry.type === 'CONTRA_PROPOSTA' && ` Contrapropôs R$ ${parseFloat(entry.valor).toFixed(2)}`}
                {entry.type === 'ACEITE' && ` Aceitou a proposta de R$ ${parseFloat(entry.valor_aceito || entry.valor).toFixed(2)}`}
                {entry.type === 'REJEICAO' && ` Rejeitou a proposta.`}
              </li>
            ))}
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
              {negotiationHistory.length === 0 && currentUserRole === 'client' ? 'Enviar Proposta Inicial' : 'Enviar Contraproposta'}
            </button>
          </div>
          {lastOfferByOtherParty && negotiationHistory.length > 0 && (
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
                onClick={() => submitNegotiationAction('accept')}
                disabled={loading}
              >
                Aceitar Proposta Atual
              </button>
            </div>
          )}
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

export default Pagina_Negociacao_Contrato; 
