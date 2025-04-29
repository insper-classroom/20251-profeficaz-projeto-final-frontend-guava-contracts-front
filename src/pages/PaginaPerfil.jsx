import '../styles/PaginaPerfil.css'
import Navbar from './Navbar';
import Avaliacao from '../components/Avaliacao.jsx'
import ServicoPerfil from './ServicoPerfil.jsx';


function PaginaPerfil () {

  const perfil = {
    "nome": "Pedro",
    "profissao": "Desenvolvedor Web",
    "tempo_atuacao": "2 anos",
    "descricao": "minha descricao",
    "avaliacao": 4.5,
    "servicos": [[{"titulo": "Servico cpa", "desc": "descricao cpa"}], [{"titulo": "Servico 2 cpa", "desc": "descricao cpa"}]]
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
          {perfil.servicos.map(servico => (
            <div className="lista_servicos" key={servico.titulo}>
              <ServicoPerfil servico={servico[0]}/>
            </div>   
          ))}

        </div>
      </div>
    </>
  )
}

export default PaginaPerfil;
