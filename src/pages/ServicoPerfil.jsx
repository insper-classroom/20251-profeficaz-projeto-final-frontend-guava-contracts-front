import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaFileContract, FaCheckCircle, FaDownload } from 'react-icons/fa';
import '../styles/ServicoPerfil.css';
import { useEffect } from 'react';
import axios from 'axios';
import { ContaContext } from '../context/ContaContext';
import { useContext } from 'react';


function ServicoPerfil({servico_id, id_prestador}) {
  const navigate = useNavigate();
  const {
    contaConectada
  } = useContext(ContaContext);

  const API_BASE_URL = 'http://127.0.0.1:5000';

  const [servico, setServico] = useState('');

  useEffect(() => {
    setServico(servico_id);
    console.log(servico_id)
  }, [servico_id]);

  async function verificarNegociacaoExistente(cliente, prestador) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/negociacao/verificar/${encodeURIComponent(cliente)}/${encodeURIComponent(prestador)}`
    );
    
    if (response.data.existe) {
      return response.data.negociacao;
    }
    return null;
    
  } catch (error) {
    console.error("Erro ao verificar negociação existente:", error);
    return null;
  }
}

  async function postNegociacao() {
  try {
    // Primeiro, buscar o endereço do prestador
    const prestadorResponse = await axios.get(`${API_BASE_URL}/usuario/${id_prestador}`);
    const prestadorAddress = prestadorResponse.data.address;
    
    console.log("Verificando negociação existente...");
    console.log("Cliente:", contaConectada);
    console.log("Prestador:", prestadorAddress);
    
    // Verificar se já existe uma negociação entre cliente e prestador
    const negociacaoExistente = await verificarNegociacaoExistente(contaConectada, prestadorAddress);
    
    if (negociacaoExistente) {
      console.log("Negociação existente encontrada:", negociacaoExistente);
      // Navegar para a negociação existente
      navigate(`/negociar/${negociacaoExistente._id}`);
      return;
    }
    
    console.log("Nenhuma negociação existente encontrada. Criando nova...");
    
    // Se não existe, criar nova negociação
    const url = `${API_BASE_URL}/negociacao`;
    const data = {
      cliente: contaConectada,
      prestador: prestadorAddress
    };
    
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Nova negociação criada:', response.data);
    navigate(`/negociar/${response.data.id}`);
    
  } catch (error) {
    console.error("Erro no processo de negociação:", error);
    alert("Erro ao iniciar negociação. Tente novamente.");
  }
}

  return (
    <>
      {!servico ? (
        <div className="">Carregando...</div>
      ) : (
        <>
          <div className="servico">
            <div className="info_servico">
              <p className="titulo_servico">{servico}</p>
            </div>
            <div className="botoes">
              <button
                className="botao_fechar_contrato"
                onClick={() => postNegociacao()}
              >
                <FaFileContract className="icon-contrato" />
                <span>Negociar</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default ServicoPerfil;
