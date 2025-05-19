import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaFileContract, FaCheckCircle, FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../styles/ServicoPerfil.css';
import { useEffect } from 'react';
import axios from 'axios';
import { ContaContext } from '../context/ContaContext';
import { useContext } from 'react';


function ServicoPerfil({servico_id, id_prestador}) {
  const navigate = useNavigate();
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showContrato, setShowContrato] = useState(false);
  const [showSucesso, setShowSucesso] = useState(false);
  const [aceitarTermos, setAceitarTermos] = useState(false);
  const {
    contaConectada
  } = useContext(ContaContext);



  const contratoRef = useRef();

  const [servico, setServico] = useState('');

  useEffect(() => {
    setServico(servico_id);
    console.log(servico_id)
  }, [servico_id]);

  const handleAssinarContrato = async () => {
    if (!aceitarTermos) {
      alert('Você precisa aceitar os termos e condições para assinar o contrato');
      return;
    }
  
    if (!servico) {
      alert('Dados do serviço não disponíveis');
      return;
    }
  
    try {
      console.log('Dados completos do serviço:', servico);
  
      const freelancerId = servico._id || servico.id || servico.freelancer_id || servico.usuario_id;
      
      if (!freelancerId) {
        throw new Error('ID do freelancer não encontrado nos dados do serviço');
      }
  
      const dadosContrato = {
        id_freela: freelancerId,
        id_contratante: "0x123...", 
        valor: servico.valor || 2000.00, 
        servico: servico.desc || servico.descricao || 'Serviço não especificado'
      };
  
      console.log('Dados do contrato a serem enviados:', dadosContrato);
  
      const response = await axios.post('http://127.0.0.1:5000/contrato', dadosContrato, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Resposta do backend:', response.data);
  
      if (response.data.transaction) {
        console.log('Transação preparada:', response.data.transaction);
        setShowContrato(false);
        setShowSucesso(true);
        
        setTimeout(() => {
          setShowSucesso(false);
          navigate('/');
        }, 3000);
      }
  
    } catch (error) {
      console.error('Erro detalhado:', error);
      const mensagemErro = error.response?.data?.error || error.message;
      alert(`Erro ao criar contrato: ${mensagemErro}`);
    }
  };

  async function postNegociacao() {
    const url = 'http://127.0.0.1:5000/negociacao'; 
    const data = {
      cliente: contaConectada,
      prestador: await axios.get(`http://127.0.0.1:5000/usuario/${id_prestador}`)
        .then((response) => {
          console.log(response.data)
          return response.data.address
        })
        .catch((error) => console.error("erro ao buscar categorias", error))
    };
    const id_negociacao = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Resposta do backend:', id_negociacao.data);
      
    navigate(`/negociar/${id_negociacao.data.id}`);
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
  
          {/* Modal de Detalhes */}
          {showDetalhes && (
            <div className="overlay">
              <div className="modal_detalhes">
                <div className="modal_header">
                  <h2>{servico_id}</h2>
                </div>
                <div className="modal_content">
                  <p>{servico.desc ? servico.desc : "Não informado"}</p>
                </div>
                <div className="modal_footer">
                  <button 
                    className="fechar_modal"
                    onClick={() => setShowDetalhes(false)}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
  
          {/* Modal do Contrato */}
          {showContrato && (
            <div className="overlay">
              <div className="modal_contrato">
                <div className="modal_header">
                  <h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>
                  <button 
                    className="botao_download"
                    onClick={handleDownloadPDF}
                  >
                    <FaDownload className="icon-download" />
                    <span>Baixar PDF</span>
                  </button>
                </div>
                
                <div className="modal_content_contrato">
                  <div className="contrato_texto" ref={contratoRef}>
                    <p>Pelo presente instrumento particular, de um lado:</p>
                    
                    <div className="parte_contrato">
                      <h3>CONTRATANTE:</h3>
                      <p>Nome:</p>
                      <p>CPF/CNPJ: 000.000.000-00</p>
                      <p>Endereço: Rua Exemplo, 123 - São Paulo/SP</p>
                    </div>
  
                    <p>E, de outro:</p>
  
                    <div className="parte_contrato">
                      <h3>CONTRATADO:</h3>
                      <p>Nome: {servico.nome}</p>
                      <p>CPF/CNPJ: 111.111.111-11</p>
                      <p>Endereço: Avenida Modelo, 456 - São Paulo/SP</p>
                    </div>
  
                    <p>Têm entre si justo e contratado o seguinte:</p>
  
                    <h3>CLÁUSULA 1 - OBJETO</h3>
                    <p>O presente contrato tem como objeto a prestação de serviços profissionais de desenvolvimento de solução
                    sob demanda, conforme detalhamento acordado entre as partes por e-mail ou proposta anterior.</p>
  
                    <h3>CLÁUSULA 2 - PRAZO</h3>
                    <p>O serviço será iniciado em 10/05/2025 e finalizado até 30/06/2025, salvo prorrogação consensual entre as
                    partes.</p>
  
                    <h3>CLÁUSULA 3 - VALOR E FORMA DE PAGAMENTO</h3>
                    <p>O valor total é de R$ 2.000,00, a ser pago 50% no início e 50% na entrega final, via PIX.</p>
  
                    <h3>CLÁUSULA 4 - OBRIGAÇÕES DO CONTRATADO</h3>
                    <p>Executar os serviços com qualidade e no prazo acordado, mantendo o contratante informado sobre o
                    andamento do trabalho.</p>
  
                    <h3>CLÁUSULA 5 - OBRIGAÇÕES DO CONTRATANTE</h3>
                    <p>Fornecer os materiais e informações necessárias, realizar os pagamentos e aprovar entregas conforme o
                    cronograma.</p>
  
                    <h3>CLÁUSULA 6 - PROPRIEDADE INTELECTUAL</h3>
                    <p>Os direitos sobre o produto final serão transferidos ao CONTRATANTE após o pagamento integral.</p>
  
                    <h3>CLÁUSULA 7 - RESCISÃO</h3>
                    <p>O contrato pode ser rescindido mediante aviso. Em caso de rescisão pelo CONTRATANTE, os valores
                    pagos não serão reembolsados.</p>
  
                    <h3>CLÁUSULA 8 - CONFIDENCIALIDADE</h3>
                    <p>Ambas as partes manterão sigilo sobre informações sensíveis trocadas durante a execução dos serviços.</p>
  
                    <h3>CLÁUSULA 9 - FORO</h3>
                    <p>Fica eleito o foro da comarca de São Paulo/SP para resolver eventuais dúvidas oriundas deste contrato.</p>
  
                    <p>E, por estarem de pleno acordo, firmam o presente contrato.</p>
  
                    <p className="data_contrato">São Paulo, 03/05/2025.</p>
  
                    <div className="assinaturas">
                      <p>CONTRATANTE: ____________________________</p>
                      <p>CONTRATADO: ____________________________</p>
                    </div>
                  </div>
                  
                  <div className="termos_aceite">
                    <label className="checkbox_container">
                      <input 
                        type="checkbox" 
                        checked={aceitarTermos}
                        onChange={(e) => setAceitarTermos(e.target.checked)}
                      />
                      <span>Li e aceito todos os termos e condições do contrato</span>
                    </label>
                  </div>
                </div>
  
                <div className="modal_footer">
                  <button 
                    className="botao_cancelar"
                    onClick={() => {
                      setShowContrato(false);
                      setAceitarTermos(false);
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="botao_assinar"
                    onClick={handleAssinarContrato}
                    disabled={!aceitarTermos}
                  >
                    Assinar Contrato
                  </button>
                </div>
              </div>
            </div>
          )}
  
          {/* Modal de Sucesso */}
          {showSucesso && (
            <div className="overlay sucesso-overlay">
              <div className="modal_sucesso">
                <FaCheckCircle className="icon-sucesso" />
                <h2>Contrato Assinado!</h2>
                <p>Redirecionando para a página inicial...</p>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default ServicoPerfil;
