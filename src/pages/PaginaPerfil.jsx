import '../styles/PaginaPerfil.css'
import Navbar from './Navbar';


function PaginaPerfil () {

  const perfil = {
    "nome": "Pedro",
    "profissao": "dev",
    "tempo_atuacao": "2 anos",
    "descricao": "minha descricao",
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
            <p className="desc_perfil">Nome: {perfil.nome}</p>
            <p className="desc_perfil">Profissão: {perfil.profissao}</p>
            <p className="desc_perfil">Tempo de atuação: {perfil.tempo_atuacao}</p>
            <p className="desc_perfil">Descrição: {perfil.descricao}</p>
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
