import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import '../styles/AvaliacaoPage.css';
import Navbar from '../components/Navbar';

function AvaliacaoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { enderecoAvaliado, enderecoAvaliador } = location.state || {};
  
  const [avaliacao, setAvaliacao] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [nomeAvaliado, setNomeAvaliado] = useState('');

  const API_BASE_URL = 'http://127.0.0.1:5000';

  const enviarAvaliacao = async (dados) => {
  const token = localStorage.getItem('authToken');
  
  // Formatação dos dados antes de enviar
  const dadosFormatados = {
    enderecoAvaliado: dados.enderecoAvaliado,
    nota: parseFloat(dados.nota), // Garante que seja um número decimal
    comentario: dados.comentario || null // Envia null se não houver comentário
  };
  
  console.log('Dados formatados para envio:', dadosFormatados);
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/usuario/avaliar`,
      dadosFormatados,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Resposta completa:', response);
    return response;
  } catch (error) {
    // Log detalhado do erro
    console.error('Erro detalhado:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers
    });
    throw error;
  }
};
  useEffect(() => {
  const buscarDadosUsuario = async () => {
    if (!enderecoAvaliado) {
      console.error('Endereço do avaliado não fornecido');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      // Usar a nova rota específica para endereço
      const response = await axios.get(`${API_BASE_URL}/usuario/endereco/${enderecoAvaliado}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const usuario = response.data;
      console.log('Dados recebidos:', usuario);
      
      // Usa o nome do usuário se existir, senão usa o endereço formatado
      setNomeAvaliado(usuario.nome || `${enderecoAvaliado.slice(0, 6)}...${enderecoAvaliado.slice(-4)}`);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      setNomeAvaliado(`${enderecoAvaliado.slice(0, 6)}...${enderecoAvaliado.slice(-4)}`);
    }
  };

  buscarDadosUsuario();
}, [enderecoAvaliado]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setEnviando(true);
  setErro('');

  try {
    // Validações
    if (!avaliacao || avaliacao < 1 || avaliacao > 5) {
      setErro('Por favor, selecione uma nota entre 1 e 5');
      return;
    }

    if (!enderecoAvaliado) {
      setErro('Endereço do avaliado não fornecido');
      return;
    }

    const dados = {
      enderecoAvaliado: enderecoAvaliado,
      nota: Number(avaliacao),
      comentario: comentario.trim() || null // Envia null se estiver vazio
    };

    console.log('Dados antes do envio:', dados);
    
    const response = await enviarAvaliacao(dados);
    
    if (response.data) {
      console.log('Avaliação enviada com sucesso:', response.data);
      navigate(`/perfil/${enderecoAvaliado}`);
    }
  } catch (error) {
    console.error('Erro ao enviar avaliação:', error);
    
    if (error.response?.data?.erro) {
      setErro(error.response.data.erro);
    } else if (error.response?.status === 422) {
      setErro('Formato de dados inválido. Verifique os campos e tente novamente.');
    } else {
      setErro('Erro ao enviar avaliação. Tente novamente.');
    }
  } finally {
    setEnviando(false);
  }
};

  return (
    <>
      <Navbar />
      <div className="avaliacao-page">
        <h1>Avaliar {nomeAvaliado}</h1>
        <form onSubmit={handleSubmit} className="avaliacao-form">
          <div className="stars-input">
            {[1, 2, 3, 4, 5].map((valor) => (
              <FaStar
                key={valor}
                className={valor <= avaliacao ? 'star-filled' : 'star-empty'}
                onClick={() => setAvaliacao(valor)}
              />
            ))}
          </div>

          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Deixe seu comentário (opcional)"
            rows="4"
          />

          {erro && <p className="erro-mensagem">{erro}</p>}

          <button 
            type="submit" 
            className="enviar-avaliacao" 
            disabled={!avaliacao || enviando}
          >
            {enviando ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
        </form>
      </div>
    </>
  );
}

export default AvaliacaoPage;