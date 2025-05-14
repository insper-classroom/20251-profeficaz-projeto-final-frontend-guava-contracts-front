import Navbar from '../components/Navbar';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Avaliacao from '../components/Avaliacao';

const formatarEndereco = (endereco) => {
  if (!endereco) return '';
  return `${endereco.slice(0, 6)}...${endereco.slice(-4)}`;
};

const API_BASE_URL = 'http://127.0.0.1:5000'; // Define API_BASE_URL

function Categoria () {
  const [freelancersNaCategoria, setFreelancersNaCategoria] = useState([]);
  const [nomeCategoria, setNomeCategoria] = useState('');
  const {id} = useParams();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/categoria/${id}/usuarios`)
      .then((response) => {
        setFreelancersNaCategoria(response.data.usuarios || response.data.dados || response.data || []);
        console.log("Freelancers na categoria:", response.data);
      })
      .catch((error) => console.error("Erro ao buscar freelancers na categoria", error));
    axios.get(`${API_BASE_URL}/categoria/${id}`)
      .then((response) => {
        setNomeCategoria(response.data.Name);
        console.log("Nome da categoria:", response.data.Name);
      })
      .catch((error) => console.error("Erro ao buscar nome da categoria", error));
  }, [id]);

  return (
    <>
      <Navbar/>
      <div className="container">
        <p className="titulo">{nomeCategoria}</p>

        <div className='lista_categoria_container'>
          <ul className='header_lista'>
            <li className='list_title'>Nome / Endereço</li>
            <li className='list_title'>Profissão</li>
            <li className='list_title'>Avaliação</li>
          </ul>
          {freelancersNaCategoria.length > 0 ? (
            freelancersNaCategoria.map((freelancer, index) => (
              <a href={`/perfil/${freelancer._id}`} className='row_lista' key={freelancer._id || freelancer.address || index}> 
                <ul className='body_lista'>
                  <div className='row_div'>
                    <li className='list_item'>
                      {freelancer.nome || formatarEndereco(freelancer.address)}
                    </li>
                    <li className='list_item'>
                      {freelancer.profissao || 'N/A'}
                    </li>
                    <li className='list_item'>
                      <Avaliacao avaliacao={freelancer.avaliacao_media || 0} />
                    </li>
                  </div>
                </ul>
              </a>
            ))
          ) : (
            <p style={{ textAlign: 'center', marginTop: '20px' }}>Nenhum freelancer encontrado para esta categoria.</p>
          )}
        </div>
      </div>
    </>
  )
}

export default Categoria;