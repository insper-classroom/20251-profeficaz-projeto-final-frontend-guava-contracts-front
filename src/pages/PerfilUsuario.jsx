import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import '../styles/PerfilUsuario.css';
import Avaliacao from '../components/Avaliacao.jsx';
import { ContaContext } from '../context/ContaContext';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';
const AUTH_TOKEN_KEY = 'authToken';

function PerfilUsuario() {
  const { contaConectada, desconectarCarteira } = useContext(ContaContext);
  const navigate = useNavigate();
  const [overlayUsuario, setOverlayUsuario] = useState(false);
  const [addressContrato, setAddressContrato] = useState('');
  const [addressFreela, setAddressFreela] = useState('');
  const [addressCliente, setAddressCliente] = useState('');
  const [contratos, setContratos] = useState([]);
  const [usuarioData, setUsuarioData] = useState({
    nome: "",
    profissao: "",
    tempo_atuacao: "",
    descricao: "",
    avaliacao: 0,
    created_at: "",
    address: ""
  });
  const [loading, setLoading] = useState(true);
  const [errorPage, setErrorPage] = useState(null);

  // States for editing profile
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nome: "",
    profissao: "",
    descricao: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);


  const toggleOverlayUsuario = () => setOverlayUsuario(!overlayUsuario);

  const formatarEndereco = (endereco) => {
    if (!endereco) return '';
    return `${endereco.slice(0, 6)}...${endereco.slice(-4)}`;
  };

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      if (desconectarCarteira) desconectarCarteira();
      navigate('/');
      return;
    }

    setLoading(true);
    setErrorPage(null);
    let isMounted = true;

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/perfilusuario`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (isMounted) {
          const perfil = response.data;
          setUsuarioData({
            nome: perfil.nome || "", // Initialize nome as empty string if null
            profissao: perfil.profissao || "Não informado",
            tempo_atuacao: perfil.tempo_atuacao || "Não informado",
            descricao: perfil.descricao || "Nenhuma descrição.",
            avaliacao: perfil.avaliacao_media || 0,
            created_at: perfil.created_at,
            address: perfil.address
          });
          // Initialize edit form data when profile data is fetched
          setEditFormData({
            nome: perfil.nome || "",
            profissao: perfil.profissao || "",
            descricao: perfil.descricao || ""
          });
          return perfil.address;
        }
      } catch (error) {
        if (isMounted) {
          console.error("Erro ao buscar dados do perfil:", error.response?.data || error.message);
          if (error.response && (error.response.status === 401 || error.response.status === 422)) {
            if (desconectarCarteira) desconectarCarteira();
            navigate('/');
          } else {
            setErrorPage("Erro ao carregar dados do perfil. Tente novamente mais tarde.");
          }
          throw error;
        }
      }
    };

    const fetchUserContracts = async (userAddress) => {
      if (!userAddress) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/contratos/usuario/${userAddress}`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        if (isMounted) {
          setContratos(response.data.contratos || response.data.dados || response.data || []);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Erro ao buscar contratos:", error.response?.data || error.message);
           setErrorPage(prev => prev ? `${prev}\nErro ao carregar contratos.` : "Erro ao carregar contratos.");
        }
      }
    };

    fetchUserProfile()
      .then(userAddressFromProfile => {
        if (userAddressFromProfile && isMounted) {
          return fetchUserContracts(userAddressFromProfile);
        }
      })
      .catch(() => {
        if (isMounted) console.log("Cadeia de promises interrompida devido a erro anterior.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [navigate, desconectarCarteira]);

  const handleEditToggle = () => {
    if (!isEditing) {
      // Entering edit mode, prefill form with current data
      setEditFormData({
        nome: usuarioData.nome || "", // Use empty string if null
        profissao: usuarioData.profissao === "Não informado" ? "" : usuarioData.profissao,
        descricao: usuarioData.descricao === "Nenhuma descrição." ? "" : usuarioData.descricao,
      });
      setEditError(null); // Clear previous edit errors
    }
    setIsEditing(!isEditing);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      if (desconectarCarteira) desconectarCarteira();
      navigate('/');
      return;
    }
    setIsSaving(true);
    setEditError(null);
    try {
      // Prepare data, ensure empty strings are sent if user clears a field
      // Backend should handle empty strings appropriately (e.g., store as null or empty)
      const payload = {
        nome: editFormData.nome.trim() === "" ? null : editFormData.nome.trim(), // Send null if name is empty after trim
        profissao: editFormData.profissao.trim(),
        descricao: editFormData.descricao.trim()
      };

      const response = await axios.put(`${API_BASE_URL}/perfilusuario`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Update local state with new data from response or payload
      setUsuarioData(prev => ({
        ...prev,
        nome: response.data.nome || payload.nome || "", // Use response data if available
        profissao: response.data.profissao || payload.profissao || "Não informado",
        descricao: response.data.descricao || payload.descricao || "Nenhuma descrição."
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error.response?.data || error.message);
      setEditError(error.response?.data?.erro || "Falha ao salvar o perfil. Tente novamente.");
      if (error.response && (error.response.status === 401 || error.response.status === 422)) {
        if (desconectarCarteira) desconectarCarteira();
        navigate('/');
      }
    } finally {
      setIsSaving(false);
    }
  };


  const handleDepositar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) { navigate('/'); return; }
    try {
      const response = await axios.post(`${API_BASE_URL}/contrato/${addressContrato}/depositar`,
        { address_cliente: addressCliente },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log("deposito feito com sucesso", response.data);
    } catch (error) {
      console.error("Erro ao tentar depositar fundos", error.response ? error.response.data : error.message);
      if (error.response && (error.response.status === 401 || error.response.status === 422)) {
        if (desconectarCarteira) desconectarCarteira();
        navigate('/');
      }
    }
  };

  if (loading && !errorPage) {
    return (
      <>
        <Navbar />
        <div className="container_pagina_perfil_loading">Carregando perfil...</div>
      </>
    );
  }

  if (errorPage && !loading) {
     return (
      <>
        <Navbar />
        <div className="container_pagina_perfil_error">{errorPage}</div>
      </>
    );
  }


  return (
    <>
      {overlayUsuario && (
      <div className="modal">
        <div onClick={toggleOverlayUsuario} className="overlay-perfil"></div>
        <div className="modal-content-perfil">
          <h2>Detalhes do Contrato</h2>
          <div className="container_descricao_contrato">
            <p><strong>ID do Contrato:</strong> {addressContrato}</p>
            <p><strong>Cliente:</strong> {formatarEndereco(addressCliente)}</p>
            <p><strong>Freelancer:</strong> {formatarEndereco(addressFreela)}</p>
            {/* You can add more contract details here, e.g., status, valor */}
          </div>

          <div className='container_botoes_contrato'>
            <button onClick={handleDepositar} className="botao_opcao_contrato">Depositar Fundos</button>
            {/* TODO: Implement and add other contract action buttons and their handlers below */}
            {/* Example:
            <button onClick={handleConfirmarRecebimento} className="botao_opcao_contrato">Confirmar Recebimento</button>
            <button onClick={handleFinalizarServico} className="botao_opcao_contrato">Finalizar Serviço</button>
            <button onClick={handleCancelarContrato} className="botao_opcao_contrato botao_cancelar_contrato_modal">Cancelar Contrato</button>
            */}
          </div>
          <button onClick={toggleOverlayUsuario} className="botao_fechar_modal_perfil">Fechar</button>
        </div>
      </div>
      )}
      <Navbar />
      <div className="container_pagina_perfil">
        <div className="container_perfil">
          <div className="div_foto_perfil">
            <svg
              className='foto_perfil_svg' 
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="detalhes_perfil">
            {isEditing ? (
              <div className="edit-profile-form">
                <div className="form-group">
                  <label htmlFor="nome">Nome:</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={editFormData.nome}
                    onChange={handleEditFormChange}
                    placeholder="Seu nome (opcional)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profissao">Profissão:</label>
                  <input
                    type="text"
                    id="profissao"
                    name="profissao"
                    value={editFormData.profissao}
                    onChange={handleEditFormChange}
                    placeholder="Sua profissão"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="descricao">Descrição:</label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={editFormData.descricao}
                    onChange={handleEditFormChange}
                    placeholder="Fale um pouco sobre você"
                    rows="4"
                  />
                </div>
                {editError && <p className="edit-error-message">{editError}</p>}
                <div className="edit-profile-actions">
                  <button onClick={handleSaveProfile} disabled={isSaving} className="save-profile-button">
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                  <button onClick={handleEditToggle} disabled={isSaving} className="cancel-edit-button">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p id="nome" className="desc_perfil">
                  {/* Display formatted address if name is empty or just whitespace */}
                  {(usuarioData.nome && usuarioData.nome.trim() !== "") ? usuarioData.nome : formatarEndereco(usuarioData.address)}
                </p>
                <p className="desc_perfil">Profissão: {usuarioData.profissao}</p>
                <p className="desc_perfil">Tempo de atuação: {usuarioData.tempo_atuacao}</p>
                <p className="desc_perfil">Descrição: {usuarioData.descricao}</p>
                <p className="desc_perfil">Membro desde: {usuarioData.created_at ? new Date(usuarioData.created_at).toLocaleDateString() : 'N/A'}</p>
                <Avaliacao avaliacao={usuarioData.avaliacao} />
                <button onClick={handleEditToggle} className="edit-profile-button">
                  Editar Perfil
                </button>
              </>
            )}
          </div>
        </div>

        <div className="container_portifolio">
          <div className='container_titulo_portifolio'>
            <p className="titulo_portifolio">Meus Contratos</p>
          </div>
          {contratos && contratos.length > 0 ? (
            contratos.map(contrato => (
              <div className="lista_contratos" key={contrato._id || contrato.id_contrato}>
                <div className="contrato">
                  <div className="info_contrato">
                    <p className="titulo_contrato">{contrato.titulo || "Contrato sem título"}</p>
                    <p className="desc_contrato_item">Status: {contrato.status || "N/A"}</p>
                    <p className="desc_contrato_item">Valor: {contrato.valor || "N/A"} ETH</p>
                  </div>
                  <div className="botoes">
                    <button onClick={() => {
                       toggleOverlayUsuario();
                       setAddressContrato(contrato.id_contrato || contrato._id);
                       setAddressCliente(contrato.address_cliente || (contrato.address && contrato.address.id_cliente));
                       setAddressFreela(contrato.address_prestador || (contrato.address && contrato.address.id_freela));
                       }} className="botao_visualizar_contrato">
                      Visualizar Detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Nenhum contrato encontrado.</p>
          )}
        </div>
      </div>
    </>
  )
}

export default PerfilUsuario;