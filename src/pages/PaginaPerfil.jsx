import '../styles/PaginaPerfil.css'
import Navbar from '../components/Navbar.jsx';
import Avaliacao from '../components/Avaliacao.jsx'
import ServicoPerfil from './ServicoPerfil.jsx';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Categoria from './Categoria.jsx';

function PaginaPerfil() {
  const { id } = useParams();
  const [perfil, setPerfil] = useState(null); // Mudamos para null
  const [categoria, setCategoria] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("ID do perfil:", id);
    axios.get(`http://127.0.0.1:5000/user/${id}`)
      .then((response) => {
        console.log('Dados recebidos:', response.data);
        setPerfil(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar perfil:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Carregando...</div>
      </>
    );
  }

  if (!perfil) {
    return (
      <>
        <Navbar />
        <div className="error-message">Perfil não encontrado</div>
      </>
    );
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
            <p id="nome" className="desc_perfil">{perfil.nome || 'Nome não informado'}</p>
            <p id="descricao" className="desc_perfil">Profissão: {perfil.profissao || 'Profissão não informada'}</p>
            <p id="descricao" className="desc_perfil">
              Tempo de atuação: {perfil.tempo_na_plataforma || 'Não informado'}
            </p>
            <p id="descricao" className="desc_perfil">
              Descrição: {perfil.descricao || 'Sem descrição'}
            </p>
            <Avaliacao avaliacao={perfil.avaliacao || 0}/>
          </div>
        </div>
        
        <div className="container_portifolio">
          {/* Verificação antes do map */}
          {Array.isArray(perfil.servicos) && perfil.servicos.length > 0 ? (
            perfil.servicos.map((servico, index) => (
              <div className="lista_servicos" key={index}>
                <ServicoPerfil servico_id={servico}/>
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