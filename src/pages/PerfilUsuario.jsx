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
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const [contratoAtual, setContratoAtual] = useState(null);
  const [negociacaoAssociada, setNegociacaoAssociada] = useState(null);

  // Estados para notificações de negociação
  const [negociacoesPendentes, setNegociacoesPendentes] = useState([]);
  const [negociacaoSelecionada, setNegociacaoSelecionada] = useState(null);

  const [usuarioData, setUsuarioData] = useState({
    nome: "",
    profissao: "",
    tempo_atuacao: "",
    descricao: "",
    avaliacao: 0,
    created_at: "",
    address: "",
    categorias_servico: [],
    servicos: {}
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

  // Função para buscar negociações pendentes
  const fetchNegociacoesPendentes = async (userAddress) => {
    if (!userAddress) return;
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    try {
      const response = await axios.get(`${API_BASE_URL}/negociacao/usuario/${userAddress}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data && response.data.negociacoes) {
        // Filtrar apenas negociações pendentes (valor_final = 0)
        const pendentes = response.data.negociacoes.filter(neg => neg.valor_final === 0);
        setNegociacoesPendentes(pendentes);
        console.log("Negociações pendentes:", pendentes);
      }
    } catch (error) {
      console.error("Erro ao buscar negociações pendentes:", error);
    }
  };

  // Função para buscar negociação associada ao contrato
  const buscarNegociacaoDoContrato = async (contrato, userAddress) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    try {
      // Buscar todas as negociações do usuário
      const response = await axios.get(`${API_BASE_URL}/negociacao/usuario/${userAddress}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data && response.data.negociacoes) {
        // Tentar encontrar a negociação específica relacionada ao contrato
        const negociacaoEncontrada = response.data.negociacoes.find(neg => {
          // Critérios mais específicos para associar negociação ao contrato:
          const valorCoincidir = contrato.valor && neg.valor_final && 
                                Math.abs(parseFloat(contrato.valor) - parseFloat(neg.valor_final)) < 0.001;
          
          const isFinalizada = neg.valor_final > 0; // Negociação finalizada vira contrato
          
          // Se temos valor para comparar, usar isso
          if (valorCoincidir && isFinalizada) {
            return true;
          }
          
          // Caso contrário, pegar a mais recente finalizada envolvendo o usuário
          return isFinalizada;
        });
        
        return negociacaoEncontrada;
      }
    } catch (error) {
      console.error("Erro ao buscar negociações para o contrato:", error);
    }
    return null;
  };

  // Função para abrir modal com detalhes do contrato
  const abrirDetalhesContrato = async (contrato) => {
    setLoadingDetalhes(true);
    setContratoAtual(contrato);
    setNegociacaoAssociada(null);
    setNegociacaoSelecionada(null); // Limpar negociação selecionada
    
    const contratoAddress = contrato.contract_address
    
    const contratoId = contrato.id_contrato || contrato._id;
    
    console.log("Endereço extraído:", contratoAddress);
    console.log("ID do contrato:", contratoId);
    
    // Verificar se temos um endereço válido da blockchain
    if (!contratoAddress) {
      console.error('❌ ERRO: Endereço da blockchain não encontrado!');
    } else if (!contratoAddress.startsWith('0x') || contratoAddress.length !== 42) {
      console.error('❌ ERRO: Endereço inválido:', contratoAddress);
    } else {
      console.log('✅ Endereço válido encontrado:', contratoAddress);
    }
    
    let clienteAddress = contrato.cliente_address ||
                        contrato.address_cliente ||
                        contrato.cliente || 
                        (contrato.address && contrato.address.id_cliente);
    let freelaAddress = contrato.prestador_address ||
                      contrato.address_prestador ||
                      contrato.prestador || 
                      contrato.freelancer ||
                      (contrato.address && contrato.address.id_freela);

    console.log("Endereços das partes:", {
      cliente: clienteAddress,
      freelancer: freelaAddress
    });

    // Buscar da negociação para garantir que temos os endereços corretos
    const negociacao = await buscarNegociacaoDoContrato(contrato, usuarioData.address);
    if (negociacao) {
      console.log("Negociação encontrada:", negociacao);
      setNegociacaoAssociada(negociacao);
      
      // Usar endereços da negociação se não tivermos do contrato
      if (!clienteAddress) clienteAddress = negociacao.cliente;
      if (!freelaAddress) freelaAddress = negociacao.prestador;
      
      console.log("Endereços finais (após negociação):", {
        cliente: clienteAddress,
        freelancer: freelaAddress
      });
    }

    // Definir os endereços finais
    setAddressContrato(contratoAddress);
    setAddressCliente(clienteAddress);
    setAddressFreela(freelaAddress);

    setLoadingDetalhes(false);
    toggleOverlayUsuario();
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
          
          console.log("Perfil recebido do backend:", perfil);
          
          setUsuarioData({
            nome: perfil.nome || "",
            profissao: perfil.profissao || "Não informado",
            tempo_atuacao: perfil.tempo_atuacao || "Não informado",
            descricao: perfil.descricao || "Nenhuma descrição.",
            avaliacao: perfil.avaliacao_media || 0,
            created_at: perfil.created_at,
            address: perfil.address,
            categorias_servico: perfil.categorias_servico || [],
            servicos: perfil.servicos || []
          });
          
          setEditFormData({ 
            nome: perfil.nome || "",
            profissao: perfil.profissao || "",
            descricao: perfil.descricao || "",
            categorias_servico: perfil.categorias_servico || []
          });
          
          setServicosSelecionados(perfil.servicos || []);
          
          console.log("Serviços inicializados:", perfil.servicos);
          
          if (perfil.categorias_servico && perfil.categorias_servico.length > 0) {
            for (const categoria of perfil.categorias_servico) {
              await fetchServicosCategoria(categoria);
            }
          }
          
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
          console.log("Resposta completa dos contratos:", response.data);
          console.log("Contratos como prestador:", response.data.contratos_como_prestador);
          console.log("Contratos como cliente:", response.data.contratos_como_cliente);
          
          setContratosCliente(response.data.contratos_como_cliente || []);
          setContratosPrestador(response.data.contratos_como_prestador || []);
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
          fetchNegociacoesPendentes(userAddressFromProfile);
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
      return prev.includes(servicoNome)
        ? prev.filter(s => s !== servicoNome)
        : [...prev, servicoNome];
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
        categorias_servico: editFormData.categorias_servico || [],
        servicos: servicosSelecionados
      };

      console.log("Payload sendo enviado:", payload);

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
        servicos: updatedProfile.servicos || payload.servicos || []
      }));

      console.log("Perfil atualizado:", updatedProfile);
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
    if (!token) { 
      navigate('/'); 
      return; 
    }

    console.log("=== INICIANDO DEPÓSITO ===");
    console.log("addressContrato:", addressContrato);
    console.log("addressCliente:", addressCliente);
    console.log("contratoAtual:", contratoAtual);

    try {
      const enderecoContrato = addressContrato;
      
      if (!enderecoContrato) {
        console.error('❌ Endereço do contrato não disponível');
        alert('Endereço do contrato não disponível. Verifique o console para detalhes.');
        return;
      }

      // Verificar se temos um endereço válido da blockchain
      if (!enderecoContrato.startsWith('0x') || enderecoContrato.length !== 42) {
        console.error('❌ Endereço inválido:', enderecoContrato);
        alert(`Endereço do contrato inválido: ${enderecoContrato}\nDeve ser um endereço Ethereum válido (0x + 40 caracteres hex).`);
        return;
      }

      console.log('✅ Enviando requisição para:', `${API_BASE_URL}/contrato/${enderecoContrato}/depositar`);
      console.log('✅ Payload:', { cliente_addr: addressCliente });

      // 1. Preparar transação de depósito
      const response = await axios.post(
        `${API_BASE_URL}/contrato/${enderecoContrato}/depositar`,
        { cliente_addr: addressCliente },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log("✅ Resposta do backend:", response.data);

      if (response.data.transaction) {
        // 2. Verificar se MetaMask está disponível
        if (!window.ethereum) {
          alert('MetaMask não detectado. Por favor, instale a extensão MetaMask.');
          return;
        }

        try {
          // 3. Mostrar informações sobre o depósito
          const valorEth = response.data.valor_requerido_eth;
          const confirmar = window.confirm(
            `${response.data.instructions.pt}\n\n` +
            `Valor a ser depositado: ${valorEth} ETH\n\n` +
            `Contrato: ${enderecoContrato}\n\n` +
            `Deseja continuar com o depósito?`
          );
          
          if (!confirmar) return;

          // 4. Enviar transação via MetaMask
          const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [response.data.transaction],
          });

          console.log('✅ Transação de depósito enviada, txHash:', txHash);
          
          // 5. Feedback para o usuário
          alert(`Depósito ETH enviado com sucesso!\n\nHash: ${txHash}\n\nAguarde a confirmação na blockchain.`);
          
          // 6. Aguardar confirmação
          const aguardarConfirmacao = async () => {
            try {
              const receipt = await window.ethereum.request({
                method: 'eth_getTransactionReceipt',
                params: [txHash]
              });
              
              if (receipt && receipt.status === '0x1') {
                alert('Depósito confirmado com sucesso! O contrato agora está financiado.');
                
                // Recarregar dados do contrato
                if (contratoAtual) {
                  abrirDetalhesContrato(contratoAtual);
                }
              } else if (receipt && receipt.status === '0x0') {
                alert('Transação falhou. Verifique o console para mais detalhes.');
              }
            } catch (error) {
              console.error('Erro ao verificar confirmação:', error);
            }
          };

          // Verificar confirmação após 15 segundos
          setTimeout(aguardarConfirmacao, 15000);

        } catch (metamaskError) {
          console.error('❌ Erro no MetaMask:', metamaskError);
          
          if (metamaskError.code === 4001) {
            alert('Transação cancelada pelo usuário.');
          } else if (metamaskError.code === -32603) {
            alert('Erro na transação. Verifique se você tem ETH suficiente para o depósito e taxa de gas.');
          } else {
            alert('Erro ao enviar transação: ' + metamaskError.message);
          }
        }
      } else {
        console.error('❌ Dados da transação não recebidos');
        alert('Erro: Dados da transação não recebidos do backend');
      }

    } catch (error) {
      console.error("❌ Erro completo:", error);
      
      let mensagemErro = "Erro desconhecido ao depositar fundos";
      
      if (error.response) {
        console.log("❌ Resposta de erro do backend:", error.response);
        console.log("❌ Status:", error.response.status);
        console.log("❌ Data:", error.response.data);
        
        mensagemErro = error.response.data?.erro || 
                      error.response.data?.detalhes || 
                      `Erro HTTP ${error.response.status}`;
        
        if (error.response.status === 401 || error.response.status === 422) {
          if (desconectarCarteira) desconectarCarteira();
          navigate('/');
          return;
        }
      } else if (error.request) {
        console.log("❌ Erro de requisição:", error.request);
        mensagemErro = "Erro de rede. Verifique sua conexão.";
      } else {
        console.log("❌ Erro:", error.message);
        mensagemErro = error.message;
      }
      
      alert(`Erro ao depositar fundos: ${mensagemErro}\n\nVerifique o console para mais detalhes.`);
    }
  };

  // NOVA FUNÇÃO: Confirmar conclusão como cliente
  const handleConfirmarCliente = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) { 
      navigate('/'); 
      return; 
    }

    console.log("=== CONFIRMAÇÃO CLIENTE ===");
    console.log("addressContrato:", addressContrato);
    console.log("addressCliente:", addressCliente);

    try {
      const enderecoContrato = addressContrato;
      
      if (!enderecoContrato) {
        alert('Endereço do contrato não disponível.');
        return;
      }

      if (!enderecoContrato.startsWith('0x') || enderecoContrato.length !== 42) {
        alert('Endereço do contrato inválido.');
        return;
      }

      console.log('✅ Enviando requisição para confirmação do cliente');

      // 1. Preparar transação de confirmação
      const response = await axios.post(
        `${API_BASE_URL}/contrato/${enderecoContrato}/cliente/confirmar`,
        { cliente_addr: addressCliente },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log("✅ Resposta do backend:", response.data);

      if (response.data.transaction) {
        if (!window.ethereum) {
          alert('MetaMask não detectado. Por favor, instale a extensão MetaMask.');
          return;
        }

        try {
          const confirmar = window.confirm(
            `Confirmar conclusão do serviço como CLIENTE?\n\n` +
            `Esta ação indica que você está satisfeito com o serviço prestado.\n\n` +
            `Contrato: ${enderecoContrato}\n\n` +
            `Deseja continuar?`
          );
          
          if (!confirmar) return;

          // 2. Enviar transação via MetaMask
          const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [response.data.transaction],
          });

          console.log('✅ Transação de confirmação do cliente enviada, txHash:', txHash);
          
          alert(`Confirmação enviada com sucesso!\n\nHash: ${txHash}\n\nAguarde a confirmação na blockchain.`);

          // 3. Aguardar confirmação (opcional)
          const aguardarConfirmacao = async () => {
            try {
              const receipt = await window.ethereum.request({
                method: 'eth_getTransactionReceipt',
                params: [txHash]
              });
              
              if (receipt && receipt.status === '0x1') {
                alert('Confirmação processada com sucesso na blockchain!');
                
                // Recarregar dados do contrato
                if (contratoAtual) {
                  abrirDetalhesContrato(contratoAtual);
                }
              } else if (receipt && receipt.status === '0x0') {
                alert('Transação falhou. Verifique o console para mais detalhes.');
              }
            } catch (error) {
              console.error('Erro ao verificar confirmação:', error);
            }
          };

          // Verificar confirmação após 15 segundos
          setTimeout(aguardarConfirmacao, 15000);

        } catch (metamaskError) {
          console.error('❌ Erro no MetaMask:', metamaskError);
          
          // Tratamento melhorado de erros do MetaMask
          let mensagemErro = 'Erro ao enviar transação';
          
          if (metamaskError.code === 4001) {
            mensagemErro = 'Transação cancelada pelo usuário.';
          } else if (metamaskError.code === -32603) {
            mensagemErro = 'Erro na transação. Verifique se você tem ETH suficiente para a taxa de gas.';
          } else if (metamaskError.code === -32602) {
            mensagemErro = 'Parâmetros inválidos para a transação.';
          } else if (metamaskError.message) {
            // Verificar se message é string antes de usar métodos de string
            if (typeof metamaskError.message === 'string') {
              mensagemErro = metamaskError.message;
            } else {
              mensagemErro = 'Erro desconhecido do MetaMask: ' + JSON.stringify(metamaskError.message);
            }
          } else {
            mensagemErro = 'Erro desconhecido do MetaMask: ' + JSON.stringify(metamaskError);
          }
          
          alert(mensagemErro);
        }
      } else {
        console.error('❌ Dados da transação não recebidos');
        alert('Erro: Dados da transação não recebidos do backend');
      }

    } catch (error) {
      console.error("❌ Erro na confirmação do cliente:", error);
      
      let mensagemErro = "Erro desconhecido";
      
      if (error.response) {
        mensagemErro = error.response.data?.erro || 
                      error.response.data?.detalhes || 
                      `Erro HTTP ${error.response.status}`;
        
        if (error.response.status === 401 || error.response.status === 422) {
          if (desconectarCarteira) desconectarCarteira();
          navigate('/');
          return;
        }
      } else if (error.request) {
        mensagemErro = "Erro de rede. Verifique sua conexão.";
      } else if (error.message) {
        mensagemErro = error.message;
      }
      
      alert(`Erro na confirmação: ${mensagemErro}`);
    }
  };

  // NOVA FUNÇÃO: Confirmar conclusão como prestador
  const handleConfirmarPrestador = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) { 
      navigate('/'); 
      return; 
    }

    console.log("=== CONFIRMAÇÃO PRESTADOR ===");
    console.log("addressContrato:", addressContrato);
    console.log("addressFreela:", addressFreela);

    try {
      const enderecoContrato = addressContrato;
      
      if (!enderecoContrato) {
        alert('Endereço do contrato não disponível.');
        return;
      }

      if (!enderecoContrato.startsWith('0x') || enderecoContrato.length !== 42) {
        alert('Endereço do contrato inválido.');
        return;
      }

      console.log('✅ Enviando requisição para confirmação do prestador');

      // 1. Preparar transação de confirmação
      const response = await axios.post(
        `${API_BASE_URL}/contrato/${enderecoContrato}/prestador/confirmar`,
        { prestador_addr: addressFreela },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log("✅ Resposta do backend:", response.data);

      if (response.data.transaction) {
        if (!window.ethereum) {
          alert('MetaMask não detectado. Por favor, instale a extensão MetaMask.');
          return;
        }

        try {
          const confirmar = window.confirm(
            `Confirmar conclusão do serviço como PRESTADOR?\n\n` +
            `Esta ação indica que você finalizou o trabalho acordado.\n\n` +
            `Contrato: ${enderecoContrato}\n\n` +
            `Deseja continuar?`
          );
          
          if (!confirmar) return;

          // 2. Enviar transação via MetaMask
          const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [response.data.transaction],
          });

          console.log('✅ Transação de confirmação do prestador enviada, txHash:', txHash);
          
          alert(`Confirmação enviada com sucesso!\n\nHash: ${txHash}\n\nAguarde a confirmação na blockchain.`);

          // 3. Aguardar confirmação (opcional)
          const aguardarConfirmacao = async () => {
            try {
              const receipt = await window.ethereum.request({
                method: 'eth_getTransactionReceipt',
                params: [txHash]
              });
              
              if (receipt && receipt.status === '0x1') {
                alert('Confirmação processada com sucesso na blockchain!');
                
                // Recarregar dados do contrato
                if (contratoAtual) {
                  abrirDetalhesContrato(contratoAtual);
                }
              } else if (receipt && receipt.status === '0x0') {
                alert('Transação falhou. Verifique o console para mais detalhes.');
              }
            } catch (error) {
              console.error('Erro ao verificar confirmação:', error);
            }
          };

          // Verificar confirmação após 15 segundos
          setTimeout(aguardarConfirmacao, 15000);

        } catch (metamaskError) {
          console.error('❌ Erro no MetaMask:', metamaskError);
          
          // Tratamento melhorado de erros do MetaMask
          let mensagemErro = 'Erro ao enviar transação';
          
          if (metamaskError.code === 4001) {
            mensagemErro = 'Transação cancelada pelo usuário.';
          } else if (metamaskError.code === -32603) {
            mensagemErro = 'Erro na transação. Verifique se você tem ETH suficiente para a taxa de gas.';
          } else if (metamaskError.code === -32602) {
            mensagemErro = 'Parâmetros inválidos para a transação.';
          } else if (metamaskError.message) {
            // Verificar se message é string antes de usar métodos de string
            if (typeof metamaskError.message === 'string') {
              mensagemErro = metamaskError.message;
            } else {
              mensagemErro = 'Erro desconhecido do MetaMask: ' + JSON.stringify(metamaskError.message);
            }
          } else {
            mensagemErro = 'Erro desconhecido do MetaMask: ' + JSON.stringify(metamaskError);
          }
          
          alert(mensagemErro);
        }
      } else {
        console.error('❌ Dados da transação não recebidos');
        alert('Erro: Dados da transação não recebidos do backend');
      }

    } catch (error) {
      console.error("❌ Erro na confirmação do prestador:", error);
      
      let mensagemErro = "Erro desconhecido";
      
      if (error.response) {
        mensagemErro = error.response.data?.erro || 
                      error.response.data?.detalhes || 
                      `Erro HTTP ${error.response.status}`;
        
        if (error.response.status === 401 || error.response.status === 422) {
          if (desconectarCarteira) desconectarCarteira();
          navigate('/');
          return;
        }
      } else if (error.request) {
        mensagemErro = "Erro de rede. Verifique sua conexão.";
      } else if (error.message) {
        mensagemErro = error.message;
      }
      
      alert(`Erro na confirmação: ${mensagemErro}`);
    }
  };

  // Função para determinar se o usuário é cliente ou prestador do contrato
  const getUserRole = () => {
    const userAddress = usuarioData.address?.toLowerCase();
    const clienteAddr = addressCliente?.toLowerCase();
    const freelaAddr = addressFreela?.toLowerCase();
    
    if (userAddress === clienteAddr) return 'cliente';
    if (userAddress === freelaAddr) return 'prestador';
    return null;
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
      <Navbar />
      
      {/* Seção de Notificações de Negociação - POSICIONADA ABAIXO DA NAVBAR */}
      {negociacoesPendentes.length > 0 && (
        <div className="container_negociacoes_pendentes">
          <div className="notificacao_negociacoes">
            <div className="icone_notificacao">🔔</div>
            <div className="texto_notificacao">
              <strong>Você tem {negociacoesPendentes.length} negociação(ões) pendente(s)!</strong>
              <div className="lista_negociacoes_simples">
                {negociacoesPendentes.map((negociacao, index) => (
                  <div key={negociacao._id || index} className="item_negociacao_simples">
                    <span>
                      {negociacao.cliente === usuarioData.address ? 
                        `Proposta para ${formatarEndereco(negociacao.prestador)}` :
                        `Proposta de ${formatarEndereco(negociacao.cliente)}`
                      }
                      {negociacao.proposta > 0 && ` - ${negociacao.proposta} ETH`}
                    </span>
                    <div className="botoes_negociacao_simples">
                      <button 
                        onClick={() => navigate(`/negociar/${negociacao._id}`)}
                        className="botao_ver_negociacao_simples"
                      >
                        Ver Negociação →
                      </button>
                      <button 
                        onClick={() => {
                          setNegociacaoSelecionada(negociacao);
                          toggleOverlayUsuario();
                        }}
                        className="botao_detalhes_negociacao_simples"
                      >
                        Detalhes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
                          checked={servicosSelecionados.includes(servico)}
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
              <h2>Detalhes do {negociacaoSelecionada ? 'Negociação/Contrato' : 'Contrato'}</h2>
              {loadingDetalhes ? (
                <div className="container_descricao_contrato">
                  <p>Carregando detalhes...</p>
                </div>
              ) : (
                <div className="container_descricao_contrato">
                  {negociacaoSelecionada ? (
                    <>
                      <p><strong>ID da Negociação:</strong> {negociacaoSelecionada._id}</p>
                      <p><strong>Cliente:</strong> {formatarEndereco(negociacaoSelecionada.cliente)}</p>
                      <p><strong>Prestador:</strong> {formatarEndereco(negociacaoSelecionada.prestador)}</p>
                      <p><strong>Proposta Atual:</strong> {negociacaoSelecionada.proposta} ETH</p>
                      <p><strong>Status:</strong> {negociacaoSelecionada.valor_final === 0 ? 'Em negociação' : 'Finalizada'}</p>
                    </>
                  ) : (
                    <>
                      <p><strong>Endereço do Contrato:</strong> {addressContrato ? (addressContrato.length > 20 ? formatarEndereco(addressContrato) : addressContrato) : 'N/A'}</p>
                      <p><strong>Cliente:</strong> {addressCliente ? formatarEndereco(addressCliente) : 'N/A'}</p>
                      <p><strong>Freelancer:</strong> {addressFreela ? formatarEndereco(addressFreela) : 'N/A'}</p>
                      
                      {contratoAtual && (
                        <>
                          <p><strong>Status:</strong> {contratoAtual.status || 'N/A'}</p>
                          <p><strong>Valor:</strong> {contratoAtual.valor || 'N/A'} ETH</p>
                        </>
                      )}
                      
                      {negociacaoAssociada && (
                        <div style={{marginTop: '10px', padding: '10px', background: '#e3f2fd', borderRadius: '4px'}}>
                          <p><strong>📋 Dados da Negociação Associada:</strong></p>
                          <p><small>ID Negociação: {negociacaoAssociada._id}</small></p>
                          <p><small>Proposta: {negociacaoAssociada.proposta} ETH</small></p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className='container_botoes_contrato'>
                {negociacaoSelecionada ? (
                  <button 
                    onClick={() => navigate(`/negociar/${negociacaoSelecionada._id}`)}
                    className="botao_opcao_contrato"
                  >
                    Ir para Negociação
                  </button>
                ) : (
                  <>
                    {/* Botão de Depositar - só para cliente */}
                    {getUserRole() === 'cliente' && (
                      <button onClick={handleDepositar} className="botao_opcao_contrato">
                        Depositar Fundos
                      </button>
                    )}
                    
                    {/* Botão de Confirmação do Cliente */}
                    {getUserRole() === 'cliente' && (
                      <button 
                        onClick={handleConfirmarCliente} 
                        className="botao_opcao_contrato"
                        style={{marginLeft: '10px', background: '#4CAF50'}}
                      >
                        Confirmar como Cliente
                      </button>
                    )}
                    
                    {/* Botão de Confirmação do Prestador */}
                    {getUserRole() === 'prestador' && (
                      <button 
                        onClick={handleConfirmarPrestador} 
                        className="botao_opcao_contrato"
                        style={{marginLeft: '10px', background: '#FF9800'}}
                      >
                        Confirmar como Prestador
                      </button>
                    )}
                    
                    {/* Botão de Ver Negociação Associada */}
                    {negociacaoAssociada && (
                      <button 
                        onClick={() => navigate(`/negociar/${negociacaoAssociada._id}`)}
                        className="botao_opcao_contrato"
                        style={{marginLeft: '10px', background: '#2196F3'}}
                      >
                        Ver Negociação
                      </button>
                    )}
                  </>
                )}
              </div>
              <button onClick={() => {
                toggleOverlayUsuario();
                setNegociacaoSelecionada(null); // Limpar dados da negociação
              }} className="botao_fechar_modal_perfil">
                Fechar
              </button>
            </div>
          </div>
        </>
      )}
      
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
                            
                            {(editFormData.categorias_servico || []).includes(cat.Name) && (
                              <button
                                type="button"
                                className="selecionar-servicos-btn"
                                onClick={() => abrirOverlayServicos(cat)}
                              >
                                Selecionar Serviços
                                {(() => {
                                  const servicosDaCategoria = servicosPorCategoria[cat.Name] || [];
                                  const servicosSelecionadosDaCategoria = servicosSelecionados.filter(servico => 
                                    servicosDaCategoria.includes(servico)
                                  );
                                  return servicosSelecionadosDaCategoria.length > 0 && (
                                    <div className="servicos-selecionados-preview">
                                      <small>Serviços: {servicosSelecionadosDaCategoria.join(', ')}</small>
                                    </div>
                                  );
                                })()}
                              </button>
                            )}
                          </div>
                          
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
                        {usuarioData.categorias_servico.map((categoriaNome, index) => {
                          const servicosDaCategoria = servicosPorCategoria[categoriaNome] || [];
                          const servicosDoUsuarioNaCategoria = (usuarioData.servicos || []).filter(servico =>
                            servicosDaCategoria.includes(servico)
                          );
                          
                          return (
                            <div key={index} className="user-category-container">
                              <div className="user-category-item">
                                <strong>{categoriaNome}</strong>
                              </div>
                              {servicosDoUsuarioNaCategoria.length > 0 && (
                                <div className="user-servicos-list">
                                  {servicosDoUsuarioNaCategoria.map((servico, idx) => (
                                    <span key={idx} className="user-servico-tag">{servico}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
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
                    <p className="titulo_contrato">{formatarEndereco(contrato.contract_address)}</p>
                    <p className="desc_contrato_item">Status: {contrato.status}</p>
                    <p className="desc_contrato_item">Valor: {contrato.valor} ETH</p>
                  </div>
                  <div className="botoes">
                    <button 
                      onClick={() => abrirDetalhesContrato(contrato)} 
                      className="botao_visualizar_contrato"
                    >
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
                    <p className="titulo_contrato">{formatarEndereco(contrato.contract_address)}</p>
                    <p className="desc_contrato_item">Status: {contrato.status}</p>
                    <p className="desc_contrato_item">Valor: {contrato.valor} ETH</p>
                  </div>
                  <div className="botoes">
                    <button 
                      onClick={() => abrirDetalhesContrato(contrato)} 
                      className="botao_visualizar_contrato"
                    >
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