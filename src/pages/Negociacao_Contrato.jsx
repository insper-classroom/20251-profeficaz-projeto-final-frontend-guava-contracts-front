import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ContaContext } from '../context/ContaContext';
import '../styles/Negociacao_Contrato.css';

const API_BASE_URL = 'http://127.0.0.1:5000';
const AUTH_TOKEN_KEY = 'authToken';

// Renomear para refletir que é uma negociação, não necessariamente um contrato já existente
function PaginaNegociacao() { 
  const { negotiationId } = useParams(); // Mudado de id para negotiationId
  const navigate = useNavigate();
  const { contaConectada, desconectarCarteira } = useContext(ContaContext);

  // contractDetails agora pode ser negotiationDetails
  const [negotiationDetails, setNegotiationDetails] = useState(null); 
  const [negotiationHistory, setNegotiationHistory] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  
  const [currentOfferInput, setCurrentOfferInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('Carregando negociação...');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false); // Baseado no status_negociacao
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // A verificação de contaConectada permanece
    if (!contaConectada) {
      setLoading(false);
      // navigate('/'); 
      return;
    }
    // Adicionar verificação para negotiationId
    console.log("ID da Negociação:", negotiationId);
    if (!negotiationId) {
        setLoading(false);
        setError("ID da negociação não encontrado na URL.");
        return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        if (desconectarCarteira) desconectarCarteira();
        // navigate('/');
        return;
      }

      try {
        // 1. Buscar Detalhes da Negociação (incluindo partes e histórico)
        const negDetailsRes = await axios.get(`${API_BASE_URL}/negociacao/${negotiationId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("Detalhes da Negociação:", negDetailsRes.data);
        
        const details = negDetailsRes.data;
        setNegotiationDetails(details);
        const history = details.historico || [];
        setNegotiationHistory(history);

        // 2. Determinar Papel do Usuário com base nos detalhes da negociação
        let role = null;
        if (details.cliente && details.cliente.toLowerCase() === contaConectada.toLowerCase()) {
          role = 'client';
        } else if (details.prestador && details.prestador.toLowerCase() === contaConectada.toLowerCase()) {
          role = 'freelancer';
        }
        setCurrentUserRole(role);

        if (!role) {
          throw new Error("Você não faz parte desta negociação ou os detalhes são insuficientes.");
        }
        
        // 3. Determinar Turno, Status e Finalização com base no status_negociacao e histórico
        updateNegotiationState(history, role, details.status_negociacao);

      } catch (err) {
        console.error("Erro ao carregar dados da negociação:", err);
        setError(err.response?.data?.error || err.message || "Erro ao carregar dados.");
        if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 422) {
            if(desconectarCarteira) desconectarCarteira();
            // navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [negotiationId, contaConectada, navigate, desconectarCarteira]);

  const updateNegotiationState = (history, role, negotiationStatus) => {
    // A negociação é considerada finalizada se o status for ACEITA ou REJEITADA (ou CANCELADA)
    if (negotiationStatus === 'ACEITA' || negotiationStatus === 'REJEITADA' || negotiationStatus === 'CANCELADA') {
      setIsFinalized(true);
      setStatusMessage(`Negociação ${negotiationStatus}.`);
      setIsMyTurn(false);
      return;
    }

    setIsFinalized(false);
    const lastEntry = history.length > 0 ? history[history.length - 1] : null;

    if (!lastEntry) { 
      if (role === 'client') {
        setIsMyTurn(true);
        setStatusMessage('Cliente, faça sua proposta inicial.');
      } else { 
        setIsMyTurn(false);
        setStatusMessage('Aguardando proposta inicial do Cliente.');
      }
    } else {
      const lastActorIsClient = lastEntry.actorRole === 'client';
      if (role === 'client') {
        setIsMyTurn(!lastActorIsClient);
        setStatusMessage(!lastActorIsClient ? 'Sua vez (Cliente).' : 'Aguardando resposta do Freelancer.');
      } else { 
        setIsMyTurn(lastActorIsClient);
        setStatusMessage(lastActorIsClient ? 'Sua vez (Freelancer).' : 'Aguardando resposta do Cliente.');
      }
    }
  };
  
  const handleOfferInputChange = (event) => {
    setCurrentOfferInput(event.target.value);
  };

  const submitNegotiationAction = async (actionType) => {
    if (!currentUserRole) {
      setError("Não foi possível determinar seu papel na negociação.");
      return;
    }
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    setLoading(true);
    try {
      // Os endpoints agora são relativos à negociação
      let endpoint = `${API_BASE_URL}/negociacao/${negotiationId}/`; 
      const payload = { 
        role: currentUserRole,
        proposta: parseFloat(currentOfferInput),
        status_negociacao: negotiationDetails.status_negociacao, 
      };
      console.log("Payload:", payload);

      if (actionType === 'propose') {
        endpoint += 'propor';
        payload.proposta = parseFloat(currentOfferInput);
        console.log("Proposta:", payload.proposta);
        if (isNaN(payload.proposta) || payload.proposta <= 0) {
          alert("Valor da proposta inválido.");
          setLoading(false);
          return;
        }
        negotiationHistory.push(payload.proposta);
        console.log("Histórico atualizado:", negotiationHistory);
        // Se for a primeira proposta do cliente, você pode querer adicionar outros campos ao payload:
        // if (negotiationHistory.length === 0 && currentUserRole === 'client') {
        //   payload.descricao_servico = "Descrição da proposta inicial aqui"; // Exemplo
        //   payload.prazo_estimado = "Prazo da proposta inicial aqui"; // Exemplo
        // }
      } else if (actionType === 'accept') {
        endpoint += 'aceitar';
        // Ao aceitar, o backend deve:
        // 1. Atualizar o status da negociação para 'ACEITA'.
        // 2. Criar o Contrato formal com base nos dados da negociação.
        // 3. Opcionalmente, retornar o ID do contrato criado.
      } else if (actionType === 'reject') {
        endpoint += 'rejeitar';
        // Backend atualiza o status da negociação para 'REJEITADA'.
      } else {
        setLoading(false);
        return;
      }

      // A resposta da ação pode incluir o estado atualizado da negociação
      const actionResponse = await axios.put(`${endpoint}/${payload.proposta}`, payload, { headers: { 'Authorization': `Bearer ${token}` } });

      // Atualizar dados com base na resposta da ação ou refazendo o fetch
      const updatedNegDetails = actionResponse.data;
      console.log("Resposta da Ação:", updatedNegDetails);
      
      setNegotiationDetails(updatedNegDetails);
      console.log("Novo Histórico:", negotiationHistory);
      updateNegotiationState(negotiationHistory, currentUserRole, updatedNegDetails.status_negociacao);
      setCurrentOfferInput('');

      // Se a negociação foi aceita e o backend retornou o ID do contrato criado:
      // if (updatedNegDetails.status_negociacao === 'ACEITA' && updatedNegDetails.contrato_criado_id) {
      //   navigate(`/contrato/${updatedNegDetails.contrato_criado_id}`); // Navega para a página do contrato
      // }

    } catch (err) {
      console.error(`Erro ao ${actionType}:`, err);
      setError(err.response?.data?.error || `Falha ao ${actionType}.`);
       if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 422) {
            if(desconectarCarteira) desconectarCarteira();
            // navigate('/');
        }
    } finally {
      setLoading(false);
    }
  };

  // Ajustar as condições de renderização de carregamento/erro
  if (loading && !negotiationDetails && !error) return <div className="negotiation-container"><p>Carregando dados da negociação...</p></div>;
  if (error) return <div className="negotiation-container"><p className="status-message" style={{backgroundColor: '#ffebee', color: '#c62828'}}>Erro: {error}</p></div>;
  if (!negotiationDetails && !loading) return <div className="negotiation-container"><p>Detalhes da negociação não encontrados.</p></div>;
  if (!currentUserRole && !loading) return <div className="negotiation-container"><p className="status-message">Verificando seu papel na negociação...</p></div>;


  const lastOfferByOtherParty = negotiationHistory.length > 0 && negotiationHistory[negotiationHistory.length - 1].actorRole !== currentUserRole;
  const firstProposalByClient = negotiationHistory.length > 0 && negotiationHistory[0].actorRole === 'client' ? negotiationHistory[0] : null;

  return (
    <div className="negotiation-container">
      <h1 className="negotiation-title">Proposta de Negociação</h1>
      <p>ID da Negociação: {negotiationId}</p>
      {negotiationDetails && negotiationDetails.address_cliente && negotiationDetails.address_prestador && (
        <>
          <p style={{fontSize: '0.9em', color: '#555'}}>Cliente: {negotiationDetails.address_cliente}</p>
          <p style={{fontSize: '0.9em', color: '#555'}}>Prestador: {negotiationDetails.address_prestador}</p>
        </>
      )}
      <p>Seu Papel: {currentUserRole === 'client' ? 'Cliente' : 'Freelancer'}</p>

      {statusMessage && <div className={isMyTurn || isFinalized ? "status-message" : "waiting-message"}>{statusMessage}</div>}

      {currentUserRole === 'freelancer' && firstProposalByClient && isMyTurn && (
        <div className="client-initial-proposal">
          <h2 className="proposal-title">Proposta Recebida do Cliente</h2>
          <p><strong>Valor Proposto:</strong> R$ {parseFloat(firstProposalByClient.valor).toFixed(2)}</p>
          {/* Adicionar outros campos da proposta inicial se existirem no histórico */}
          {/* Ex: <p><strong>Descrição:</strong> {firstProposalByClient.descricao_servico || 'Não especificado'}</p> */}
        </div>
      )}

      <div className="negotiation-history">
        <h2 className="history-title">Histórico de Propostas</h2>
        {negotiationHistory.length === 0 ? (
          <p className="history-empty">Nenhuma proposta ainda.</p>
        ) : (
          <ul>
            {negotiationHistory.map((entry, index) => (
              <li 
                key={index} 
                className={`history-item ${entry.actorRole === 'client' ? 'item-client' : 'item-freelancer'} ${entry.type === 'ACEITE' ? 'item-accepted' : ''} ${entry.type === 'REJEICAO' ? 'item-rejected' : ''}`}
              >
                <strong>{currentUserRole === 'client' ? 'Cliente' : 'Freelancer'}:</strong>
                {index === 0 && ` Propôs R$ ${parseInt(entry)}`}
                {index === 1 && (<p>Contrapropôs R$ {parseInt(entry)}</p>)}
                {index === 2 && (<p>Valor final sugerido R$ {parseInt(entry)}</p>)}
                {/* ACEITE -> navigate pra parte de contrato*/}
                {/* REJEICAO -> navigate pra pagina anterior*/}
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
            {/* Adicionar aqui inputs para descrição, prazo, etc., se for a proposta inicial do cliente */}
            {/* Exemplo:
            {negotiationHistory.length === 0 && currentUserRole === 'client' && (
              <>
                <textarea placeholder="Descrição do serviço" />
                <input type="text" placeholder="Prazo estimado" />
              </>
            )}
            */}
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
           {/* Se a negociação foi aceita, você pode adicionar um link para o contrato criado */}
           {/* {negotiationDetails?.status_negociacao === 'ACEITA' && negotiationDetails?.contrato_criado_id && (
             <p><a href={`/contrato/${negotiationDetails.contrato_criado_id}`}>Ver Contrato</a></p>
           )} */}
         </div>
       )}
    </div>
  );
}

export default PaginaNegociacao; // Renomeado
