import React, { useContext, useEffect } from 'react';
import Navbar from './Navbar';
import '../styles/PerfilUsuario.css';
import Avaliacao from '../components/Avaliacao.jsx';
import { ContaContext } from '../context/ContaContext';
import { useState } from 'react';
import axios from 'axios';

function PerfilUsuario() {
  const { contaConectada } = useContext(ContaContext);
  const [overlayUsuario, setOverlayUsuario] = useState(false)
  const [addressContrato, setAddressContrato] = useState('')
  const [addressFreela, setAddressFreela] = useState('')
  const [addressCliente, setAddressCliente] = useState('')
  const [contratos, setContratos] = useState([])
  const [createdAt, setCreatedAt] = useState('')

  const toggleOverlayUsuario = () => {
    setOverlayUsuario(!overlayUsuario)
  }

  const formatarEndereco = (endereco) => {
    if (!endereco) return '';
    return `${endereco.slice(0, 6)}...${endereco.slice(-4)}`;
  }


  // conseguir o endereco do cara
  // pegar o perfil dele no backend
  // e buscar os contratos dele no backend
  useEffect(() => {
    axios.get(`/contratos/usuario/${contaConectada}`)
    .then((response) => {
      console.log("contratos do usuario", response.data.dados)
      setContratos(response.data)
    })
    .catch((error) => console.error("erro ao buscar contratos do usuario", error))
  }, [contaConectada])


  // pegando os dados do usuario

  useEffect(() => {
    axios.get(`/usuario/${contaConectada}`)
    .then((response) => {
      console.log("dados do usuario", response.data)
      setCreatedAt(response.data.created_at)
    })
    .catch((error) => console.error("erro ao buscar dados do usuario", error))
  }, [contaConectada])



  const perfil = {
    "nome": "Pedro",
    "profissao": "Desenvolvedor Web",
    "tempo_atuacao": "2 anos",
    "descricao": "minha descricao",
    "avaliacao": 4.5,
    "contratos": [
      [{ "titulo": "Servico cpa",
         "desc": "Lorem ipsum laksdjfh adlh wakfblsadnf sadf soadf oasdf lsdf sfk asdf sdf kjhas ",
          "address": {"id_freela": "132i41328g#G#(*"} }],
      [{ "titulo": "Servico 2 cpa", "desc": "descricao cpa", "address": "132i41328g#G#" }]
    ]
  }

  // Funcao para depositar fundos
  const handleDepositar = async (e) => {
    e.preventDefault()

    try {
      // falta conseguir o address do usuario
      // e passar como parametro para o backend
      const response = await axios.post(`http://localhost:5173/${addressContrato}/depositar`, {addressCliente})

      console.log("deposito feito com sucesso", response.data)
    } catch (error) {
      console.error("Erro ao tentar depositar fundos", error)
    }
  }

  // Funcao para confirmar contrato cliente
  const handleConfirmarContratoCliente = async (e) => {
    e.preventDefault()

    try {
      // falta conseguir o address do usuario
      // e passar como parametro para o backend
      const response = await axios.post(`http://localhost:5173/${addressContrato}/cliente/confirmar`, {addressFreela})

      console.log("confirmacao feita com sucesso", response.data)
    } catch (error) {
      console.error("Erro ao tentar depositar fundos", error)
    }
  }

  // Funcao para confirmar contrato prestador
  const handleConfirmarContratoPrestador = async (e) => {
    e.preventDefault()

    try {
      // falta conseguir o address do prestador
      // e passar como parametro para o backend
      const response = await axios.post(`http://localhost:5173/${addressContrato}/prestador/confirmar`, {addressFreela})

      console.log("confirmacao feita com sucesso", response.data)
    } catch (error) {
      console.error("Erro ao tentar depositar fundos", error)
    }
  }

  // Funcao para reivindicar fundos cliente
  const handleReivindicarFundosCliente = async (e) => {
    e.preventDefault()

    try {
      // falta conseguir o address do prestador
      // e passar como parametro para o backend
      const response = await axios.post(`http://localhost:5173/${addressContrato}/cliente/reivindicar`, {addressCliente})

      console.log("fundos reivindicados com sucesso", response.data)
    } catch (error) {
      console.error("Erro ao tentar depositar fundos", error)
    }
  }

  // Funcao para cancelar contrato
  const handleCancelarContrato = async (e) => {
    e.preventDefault()

    try {
      // falta conseguir o address do prestador
      // e passar como parametro para o backend
      const response = await axios.post(`http://localhost:5173/${addressContrato}/cancelar`, {addressCliente})

      console.log("cancelamento feito com sucesso", response.data)
    } catch (error) {
      console.error("Erro ao tentar depositar fundos", error)
    }
  }

  return (
    <>
      {overlayUsuario && (
        <div className="modal">
          <div onClick={toggleOverlayUsuario} className="overlay-perfil"></div>
          <div className="modal-content-perfil">
            <h2>Contrato</h2>

            <div className='container_descricao_contrato'>
              <p>{perfil.contratos[0][0].desc}</p>
              <p>{perfil.contratos[0][0].desc}</p>
              <p>{perfil.contratos[0][0].desc}</p>
            </div>

            <div className='container_botoes_contrato'>
              <button onClick={handleDepositar} className="botao_opcao_contrato">Depositar Fundos</button>
              <button onClick={handleConfirmarContratoCliente} className="botao_opcao_contrato">Confirmar Contrato Cliente</button>
              <button onClick={handleConfirmarContratoPrestador}  className="botao_opcao_contrato">Confirmar Contrato Prestador</button>
              <button onClick={handleReivindicarFundosCliente} className="botao_opcao_contrato">Reivindicar Fundos Cliente</button>
              <button onClick={handleCancelarContrato} className="botao_opcao_contrato">Cancelar Contrato</button>
            </div>
            <button onClick={toggleOverlayUsuario} className="botao_fechar_contrato">Fechar</button>
          </div>
        </div>
      )}
      <Navbar />
      <div className="container_pagina_perfil">

        <div className="container_perfil">

          <div className="div_foto_perfil">
            <img className='foto_perfil' />
          </div>

          <div className="detalhes_perfil">
            <p id="nome" className="desc_perfil">{formatarEndereco(contaConectada)}</p>
            <p id="descricao" className="desc_perfil">{perfil.profissao}</p>
            <p id="descricao" className="desc_perfil">Tempo de atuação: {perfil.tempo_atuacao}</p>
            <p id="descricao" className="desc_perfil">Descrição: {perfil.descricao}</p>
            <Avaliacao avaliacao={perfil.avaliacao} />
          </div>

        </div>

        <div className="container_portifolio">
          <div className='container_titulo_portifolio'>
            <p className="titulo_portifolio">Meus Contratos</p>
          </div>
          {perfil.contratos.map(contrato => (
            <div className="lista_contratos" key={contrato[0].address}>
              <div className="contrato">
                <div className="info_contrato">
                  <p className="titulo_contrato">{contrato[0].titulo}</p>
                </div>
                <div className="botoes">
                  <button onClick={() => { toggleOverlayUsuario();
                     setAddressContrato(contrato[0]._id)
                     setAddressCliente(contrato[0].address.id_cliente)
                     setAddressFreela(contrato[0].address.id_freela)
                     }} className="botao_visualizar_contrato">Visualizar Contrato</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default PerfilUsuario;
