import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import '../styles/PerfilUsuario.css';
import '../styles/PaginaPerfil.css';
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
  const [contratosCliente, setContratosCliente] = useState([]);
  const [contratosPrestador, setContratosPrestador] = useState([]);
  const [mostrarContratosPrestador, setMostrarContratosPrestador] = useState(true);
  const [tabPrestador, setTabPrestador] = useState(true);
  const [tabCliente, setTabCliente] = useState(false);
  const [servicosPorCategoria, setServicosPorCategoria] = useState({});
  const [overlayServicos, setOverlayServicos] = useState(false);
  const [categoriaAtual, setCategoriaAtual] = useState(null);
  const [servicosSelecionados, setServicosSelecionados] = useState({});
  const [usuarioData, setUsuarioData] = useState({
    nome: "",
    profissao: "",
    tempo_atuacao: "",
    descricao: "",
    avaliacao: 0,
    created_at: "",
    address: "",
    categorias_servico: [],
    servicos_selecionados: {}
  });
  const [loading, setLoading] = useState(true);
  const [errorPage, setErrorPage] = useState(null);

  // States for editing profile
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nome: "",
    profissao: "",
    descricao: "",
    categorias_servico: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [allCategories, setAllCategories] = useState([]);


  const toggleOverlayUsuario = () => setOverlayUsuario(!overlayUsuario);
  const toggleMostrarContratos = () => {
    setMostrarContratosPrestador(!mostrarContratosPrestador)
    setTabPrestador(!tabPrestador);
    setTabCliente(!tabCliente);
  };

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
          nome: perfil.nome || "",
          profissao: perfil.profissao || "Não informado",
          tempo_atuacao: perfil.tempo_atuacao || "Não informado",
          descricao: perfil.descricao || "Nenhuma descrição.",
          avaliacao: perfil.avaliacao_media || 0,
          created_at: perfil.created_at,
          address: perfil.address,
          categorias_servico: perfil.categorias_servico || [],
          servicos_selecionados: perfil.servicos_selecionados || {}
        });
        
        // Inicializar formulário com nomes de categorias
        setEditFormData({ 
          nome: perfil.nome || "",
          profissao: perfil.profissao || "",
          descricao: perfil.descricao || "",
          categorias_servico: perfil.categorias_servico || []
        });
        
        // Inicializar serviços selecionados
        setServicosSelecionados(perfil.servicos_selecionados || {});
        
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
        const response = await axios.get(`${API_BASE_URL}/contratos/usuario?address=${userAddress}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (isMounted) {
          console.log(response.data.contratos_como_prestador);
          setContratosCliente( response.data.contratos_como_cliente || []);
          setContratosPrestador( response.data.contratos_como_prestador || []);
          setContratos(response.data.contratos || response.data.dados || response.data || []);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Erro ao buscar contratos:", error.response?.data || error.message);
          setErrorPage(prev => prev ? `${prev}\nErro ao carregar contratos.` : "Erro ao carregar contratos.");
        }
      }
    };

    const fetchAllCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categoria`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (isMounted && response.data && response.data.dados) {
          setAllCategories(response.data.dados);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Erro ao buscar todas as categorias:", error.response?.data || error.message);
        }
      }
    };

    fetchUserProfile()
      .then(userAddressFromProfile => {
        if (userAddressFromProfile && isMounted) {
          fetchUserContracts(userAddressFromProfile);
        }
        fetchAllCategories();
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
      // modo de edição ativado
      setEditFormData({
        nome: usuarioData.nome || "",
        profissao: usuarioData.profissao === "Não informado" ? "" : usuarioData.profissao,
        descricao: usuarioData.descricao === "Nenhuma descrição." ? "" : usuarioData.descricao,
        categorias_servico: usuarioData.categorias_servico || []
      });
      setEditError(null);
    }
    setIsEditing(!isEditing);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryName) => {
    setEditFormData(prev => {
      const currentCategories = prev.categorias_servico || [];
      const updatedCategories = currentCategories.includes(categoryName)
        ? currentCategories.filter(nome => nome !== categoryName)
        : [...currentCategories, categoryName];
      return { ...prev, categorias_servico: updatedCategories };
    });
  };

  const abrirOverlayServicos = async (categoria) => {
    setCategoriaAtual(categoria);
    
    // Buscar serviços para esta categoria se ainda não temos
    if (!servicosPorCategoria[categoria.Name]) {
      await fetchServicosCategoria(categoria.Name);
    }
    
    setOverlayServicos(true);
  };

  const fecharOverlayServicos = () => {
    setOverlayServicos(false);
    setCategoriaAtual(null);
  };

  const fetchServicosCategoria = async (nomeCategoria) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    try {
      const response = await axios.get(`${API_BASE_URL}/categoria/servico/${encodeURIComponent(nomeCategoria)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log("Serviços da categoria:", response.data);

      // Extrair apenas os nomes dos serviços
      const servicosNomes = response.data.map(servico => servico.title);
      
      setServicosPorCategoria(prev => ({
        ...prev,
        [nomeCategoria]: servicosNomes
      }));
    } catch (error) {
      console.error(`Erro ao buscar serviços para categoria ${nomeCategoria}:`, error);
    }
  };

  const handleServicoChange = (servicoNome) => {
    setServicosSelecionados(prev => {
      const servicosAtual = prev[categoriaAtual.Name] || [];
      const servicosAtualizados = servicosAtual.includes(servicoNome)
        ? servicosAtual.filter(s => s !== servicoNome)
        : [...servicosAtual, servicoNome];
      
      return {
        ...prev,
        [categoriaAtual.Name]: servicosAtualizados
      };
    });
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
      const payload = {
        nome: editFormData.nome.trim() === "" ? null : editFormData.nome.trim(),
        profissao: editFormData.profissao.trim(),
        descricao: editFormData.descricao.trim(),
        categorias_servico: editFormData.categorias_servico || [], // Já são nomes
        servicos_selecionados: servicosSelecionados
      };

      const response = await axios.put(`${API_BASE_URL}/perfilusuario`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const updatedProfile = response.data.perfil || response.data;

      setUsuarioData(prev => ({
        ...prev,
        nome: updatedProfile.nome || payload.nome || "",
        profissao: updatedProfile.profissao || payload.profissao || "Não informado",
        descricao: updatedProfile.descricao || payload.descricao || "Nenhuma descrição.",
        categorias_servico: updatedProfile.categorias_servico || payload.categorias_servico || [],
        servicos_selecionados: updatedProfile.servicos_selecionados || payload.servicos_selecionados || {}
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
      {overlayServicos && categoriaAtual && (
      <>
        <div className="overlay"></div>
        <div className="modal">
          <div onClick={fecharOverlayServicos} className="overlay-perfil"></div>
          <div className="modal-content-perfil servicos-modal">
            <h2>Selecionar Serviços - {categoriaAtual.Name}</h2>
            <div className="servicos-container">
              {servicosPorCategoria[categoriaAtual.Name] && servicosPorCategoria[categoriaAtual.Name].length > 0 ? (
                <div className="servicos-checkbox-group">
                  {servicosPorCategoria[categoriaAtual.Name].map((servico, index) => (
                    <div key={`${categoriaAtual._id}-servico-${index}`} className="servico-checkbox-item">
                      <input
                        type="checkbox"
                        id={`servico-${categoriaAtual._id}-${index}`}
                        checked={(servicosSelecionados[categoriaAtual.Name] || []).includes(servico)}
                        onChange={() => handleServicoChange(servico)}
                      />
                      <label htmlFor={`servico-${categoriaAtual._id}-${index}`}>{servico}</label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sem-servicos">
                  <p>Carregando serviços...</p>
                </div>
              )}
            </div>
            <div className="servicos-modal-actions">
              <button onClick={fecharOverlayServicos} className="botao_fechar_modal_perfil">
                Confirmar Seleção
              </button>
            </div>
          </div>
        </div>
      </>
    )}
      {overlayUsuario && (
      <>
        <div className="overlay"></div>
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
            </div>
            <button onClick={toggleOverlayUsuario} className="botao_fechar_modal_perfil">Fechar</button>
          </div>
        </div>
        </>
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
                <div className="form-group">
                  <label>Categorias de Serviço:</label>
                  <div className="categories-checkbox-group">
                    {allCategories.length > 0 ? (
                      allCategories.map(cat => (
                        <div key={cat._id} className="category-checkbox-container">
                          <div className="category-checkbox-item">
                            <input
                              type="checkbox"
                              id={`cat-edit-${cat._id}`}
                              name={cat.Name}
                              value={cat.Name}
                              checked={(editFormData.categorias_servico || []).includes(cat.Name)}
                              onChange={() => handleCategoryChange(cat.Name)}
                            />
                            <label htmlFor={`cat-edit-${cat._id}`}>{cat.Name}</label>
                            
                            {/* Botão para selecionar serviços se a categoria estiver marcada */}
                            {(editFormData.categorias_servico || []).includes(cat.Name) && (
                              <button
                                type="button"
                                className="selecionar-servicos-btn"
                                onClick={() => abrirOverlayServicos(cat)}
                              >
                                Selecionar Serviços
                                {servicosSelecionados[cat.Name] && servicosSelecionados[cat.Name].length > 0 && (
                                  <span className="servicos-count">({servicosSelecionados[cat.Name].length})</span>
                                )}
                              </button>
                            )}
                          </div>
                          
                          {/* Mostrar serviços selecionados */}
                          {servicosSelecionados[cat.Name] && servicosSelecionados[cat.Name].length > 0 && (
                            <div className="servicos-selecionados-preview">
                              <small>Serviços: {servicosSelecionados[cat.Name].join(', ')}</small>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>Carregando categorias...</p>
                    )}
                  </div>
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
                    {(usuarioData.nome && usuarioData.nome.trim() !== "") ? usuarioData.nome : formatarEndereco(usuarioData.address)}
                  </p>
                  <p className="desc_perfil">Profissão: {usuarioData.profissao}</p>
                  <p className="desc_perfil">Tempo de atuação: {usuarioData.tempo_atuacao}</p>
                  <p className="desc_perfil">Descrição: {usuarioData.descricao}</p>
                  <div className="user-categories-view">
                    <p className="desc_perfil"><strong>Categorias e Serviços:</strong></p>
                    {usuarioData.categorias_servico && usuarioData.categorias_servico.length > 0 ? (
                      <div className="user-categories-list">
                        {usuarioData.categorias_servico.map((categoriaNome, index) => (
                          <div key={index} className="user-category-container">
                            <div className="user-category-item">
                              <strong>{categoriaNome}</strong>
                            </div>
                            {usuarioData.servicos_selecionados && 
                            usuarioData.servicos_selecionados[categoriaNome] && 
                            usuarioData.servicos_selecionados[categoriaNome].length > 0 && (
                              <div className="user-servicos-list">
                                {usuarioData.servicos_selecionados[categoriaNome].map((servico, idx) => (
                                  <span key={idx} className="user-servico-tag">{servico}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="desc_perfil_item">Nenhuma categoria selecionada.</p>
                    )}
                  </div>
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
            <div className="parte_titulo">
            <p className="titulo_portifolio">Meus Contratos</p>
            </div>
            <div className="tabs_contratos">
              <button className={`tab_prestador_${tabPrestador}`} onClick={() => {toggleMostrarContratos()}}>Como Prestador</button>
              <button className={ `tab_cliente_${tabCliente}` } onClick={() => {toggleMostrarContratos()}}>Como Cliente</button>
            </div>
          </div>
          {mostrarContratosPrestador ? 

          (contratosPrestador && contratosPrestador.length > 0 ? (
            contratosPrestador.map(contrato => (
              <div className="lista_contratos" key={contrato._id || contrato.id_contrato}>
                <div className="contrato">
                  <div className="info_contrato">
                    <p className="titulo_contrato">{formatarEndereco(contrato.address_contrato)}</p>
                    <p className="desc_contrato_item">Status: {contrato.status}</p>
                    <p className="desc_contrato_item">Valor: {contrato.valor} ETH</p>
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
            <>
              <div className="container_sem_contrato">
              <p className="sem_contrato">Você ainda não tem nenhum contrato.</p>
              <a  className="botao_home_page" href="/">Home</a>
              </div>
            </>
            ))

          : (contratosCliente && contratosCliente.length > 0 ? (
            contratosCliente.map(contrato => (
              <div className="lista_contratos" key={contrato._id || contrato.id_contrato}>
                <div className="contrato">
                  <div className="info_contrato">
                    <p className="titulo_contrato">{formatarEndereco(contrato.address_contrato)}</p>
                    <p className="desc_contrato_item">Status: {contrato.status}</p>
                    <p className="desc_contrato_item">Valor: {contrato.valor} ETH</p>
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
                <>
                  <div className="container_sem_contrato">
                    <p className="sem_contrato">Você ainda não tem nenhum contrato.</p>
                    <a  className="botao_home_page" href="/">Home</a>
                  </div>
                </>
              ))}

        </div>
      </div>
    </>
  )
}

export default PerfilUsuario;
