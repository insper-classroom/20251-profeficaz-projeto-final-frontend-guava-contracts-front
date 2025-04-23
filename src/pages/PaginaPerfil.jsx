import '../styles/PaginaPerfil.css'
import Navbar from './Navbar';
import Avaliacao from '../components/Avaliacao.jsx'


function PaginaPerfil () {

  const perfil = {
    "nome": "Pedro",
    "profissao": "Desenvolvedor Web",
    "tempo_atuacao": "2 anos",
    "descricao": "minha descricao",
    "avaliacao": 4.5,
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
          <ul>
            <a>
              <div>
                <li>
                  Boa Noite
                </li>
              </div>
            </a>
          </ul>
        </div>
      </div>
    </>
  )
}

export default PaginaPerfil;
