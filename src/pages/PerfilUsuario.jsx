import Navbar from './Navbar'
import '../styles/PerfilUsuario.css'
import Avaliacao from '../components/Avaliacao.jsx'

function PerfilUsuario () {

  const perfil = {
    "nome": "Pedro",
    "profissao": "Desenvolvedor Web",
    "tempo_atuacao": "2 anos",
    "descricao": "minha descricao",
    "avaliacao": 4.5,
    "contratos": [[{"titulo": "Servico cpa", "desc": "descricao cpa"}], [{"titulo": "Servico 2 cpa", "desc": "descricao cpa"}]]
  }

  return (
    <>
      <Navbar/>
      <div className="container_pagina_perfil">

        <div className="container_perfil">

          <div className="div_foto_perfil">
            <img className='foto_perfil'/>
          </div>

          <div className="detalhes_perfil">
            <p id="nome" className="desc_perfil">{perfil.nome}</p>
            <p id="descricao" className="desc_perfil">{perfil.profissao}</p>
            <p id="descricao" className="desc_perfil">Tempo de atuação: {perfil.tempo_atuacao}</p>
            <p id="descricao" className="desc_perfil">Descrição: {perfil.descricao}</p>
            <Avaliacao avaliacao={perfil.avaliacao}/>
          </div>

        </div>

        <div className="container_portifolio">
          {perfil.contratos[0].map(contrato => (
            <div className="lista_contratos" key={contrato.push}>
              <div className="contrato">
                  <div className = "info_contrato">
                    <p className = "titulo_contrato">{contrato.titulo}</p>
                  </div>
                  <div className="botoes">
                    <button className="botao_visualizar_contrato">Visualizar Contrato</button>
                  </div>

                </div>
              </div>
          ))}

        </div>
      </div>
    </>
  )
}

export default PerfilUsuario
