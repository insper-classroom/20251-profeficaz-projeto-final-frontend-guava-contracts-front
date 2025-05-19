import '../styles/PaginaPerfil.css'
import Navbar from '../components/Navbar.jsx';
import Avaliacao from '../components/Avaliacao.jsx'
import ServicoPerfil from './ServicoPerfil.jsx';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Categoria from './Categoria.jsx';
import { useNavigate } from 'react-router-dom';

function PaginaPerfil() {
  const { id } = useParams();
  const [perfil, setPerfil] = useState(null); // Mudamos para null
  const [categoria, setCategoria] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showAvaliacoesOverlay, setShowAvaliacoesOverlay] = useState(false);
  const navigate = useNavigate();
  const [usuarioData, setUsuarioData] = useState({
    avaliacao_pendentes: []
  });
  
  const formatarEndereco = (endereco) => {
    if (!endereco) return '';
    return `${endereco.slice(0, 6)}...${endereco.slice(-4)}`;
  };

  const handleAvaliar = (enderecoAvaliado) => {
    navigate('/avaliacao', {
      state: { 
        enderecoAvaliado,
        enderecoAvaliador: usuarioData.address
      }
    });
  };

 useEffect(() => {
  console.log("ID do perfil:", id);
  const API_BASE_URL = 'http://127.0.0.1:5000'; // Adicione esta constante no início do componente

  axios.get(`usuario/${id}`)
    .then(async (response) => {
      console.log('Dados recebidos:', response.data);
      
      const perfilData = response.data;
      // Pegando o nome do array avaliado
      const nomePerfil = perfilData.nome || 'Nome não informado';

      setPerfil({ ...perfilData, nome: nomePerfil });

      // Buscar dados dos usuários a serem avaliados
      const avaliacoesPendentes = perfilData.avaliacao_pendentes || [];
      const usuariosParaAvaliar = await Promise.all(
        avaliacoesPendentes.map(async (endereco) => {
          try {
            // Usando a nova rota para buscar por endereço
            const userResponse = await axios.get(`usuario/endereco/${endereco}`);
            console.log('Dados do usuário para avaliar:', userResponse.data);
            
            // Pegando o nome do array avaliado do usuário
            const nomeUsuario = userResponse.data.nome || formatarEndereco(endereco);
            
            return {
              endereco: endereco,
              nome: nomeUsuario
            };
          } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            // Se der erro, usa o endereço formatado como fallback
            return {
              endereco: endereco,
              nome: formatarEndereco(endereco)
            };
          }
        })
      );

      console.log('Usuários para avaliar:', usuariosParaAvaliar);

      setUsuarioData((prevData) => ({
        ...prevData,
        address: perfilData.address,
        avaliacao_pendentes: usuariosParaAvaliar
      }));
      setLoading(false);
    })
    .catch((error) => {
      console.error("Erro ao buscar perfil:", error);
      setLoading(false);
    });
}, [id]);

  
  if (loading || !perfil) {
    return (
      <>
        <Navbar />
        <div className="container_pagina_perfil">
          <p>Carregando...</p>
        </div>
      </>
    );
  }

  // Se houver erro, mostra mensagem de erro
  if (!perfil) {
    return (
      <>
        <Navbar />
        <div className="container_pagina_perfil">
          <p>Erro ao carregar perfil.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar/>
      <div className="container_pagina_perfil">
        {/* Overlay de Avaliações Pendentes */}
      {showAvaliacoesOverlay && (
  <div className="modal">
    <div onClick={() => setShowAvaliacoesOverlay(false)} className="overlay-perfil"></div>
    <div className="modal-content-perfil">
      <h2>Avaliações Pendentes</h2>
      <div className="avaliacoes-lista">
        {usuarioData.avaliacao_pendentes && usuarioData.avaliacao_pendentes.map((usuario, index) => (
          <div key={index} className="avaliacao-item">
            <span>{usuario.nome}</span>
            <button 
              onClick={() => {
                handleAvaliar(usuario.endereco);
                setShowAvaliacoesOverlay(false);
              }}
              className="botao-avaliar"
            >
              Avaliar
            </button>
          </div>
        ))}
      </div>
      <button 
        onClick={() => setShowAvaliacoesOverlay(false)}
        className="botao_fechar_modal_perfil"
      >
        Fechar
      </button>
    </div>
  </div>
)}
        <div className="container_perfil">
          <div className="div_foto_perfil">
            <img className='foto_perfil'/>
          </div>
          
          <div className="detalhes_perfil">
            <p id="nome" className="desc_perfil">{perfil.nome || 'Nome não informado'}</p>
            <p id="descricao" className="desc_perfil">Profissão: {perfil.profissao || 'Profissão não informada'}</p>
            <p id="descricao" className="desc_perfil">
              Tempo de atuação: {perfil.tempo_na_plataforma || 'Não informado'}
            </p>
            <p id="descricao" className="desc_perfil">
              Descrição: {perfil.descricao || 'Sem descrição'}
            </p>
            {usuarioData.avaliacao_pendentes && usuarioData.avaliacao_pendentes.length > 0 && (
          <button 
            onClick={() => setShowAvaliacoesOverlay(true)}
            className="avaliacoes-pendentes-button"
          >
            Avaliações Pendentes ({usuarioData.avaliacao_pendentes.length})
          </button>
        )}
            <Avaliacao avaliacao={perfil.avaliacao || 0}/>
          </div>
        </div>
        
        
        <div className="container_portifolio">
          {/* Verificação antes do map */}
          {Array.isArray(perfil.servicos) && perfil.servicos.length > 0 ? (
            perfil.servicos.map((servico, index) => (
              <div className="lista_servicos" key={index}>
                <ServicoPerfil servico_id={servico} id_prestador={id} />
              </div>   
            ))
          ) : (
            <p className="no-services">Nenhum serviço cadastrado</p>
          )}
        </div>
      </div>
    </>
  );
}

export default PaginaPerfil;
