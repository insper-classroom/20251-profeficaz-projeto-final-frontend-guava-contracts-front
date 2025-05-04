import '../styles/Categoria.css'
import Navbar from './Navbar'
import React from 'react'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios';


function Categoria () {
  
  const [servicos, setServicos] = useState([]);
  const [nomeCategoria, setNomeCategoria] = useState('');
  const {id} = useParams()
  const rows = [
    {"address": "askdjhf1239841epkl@#P$#" ,"nome": "Bolivia", "tempoDeAtuacao": "2 anos", "avaliacao": 4.5},
    {"address": "askdjhf1239841epkl@#P$@" ,"nome": "Nadottins", "tempoDeAtuacao": "500 anos", "avaliacao": 25}
  ]


  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/categoria/${id}`)
      .then((response) => {
        console.log(response.data)
        setServicos(response.data.servicos)
        setNomeCategoria(response.data.Name)
      })
      .catch((error) => console.error("erro ao buscar categorias", error))
  }, [])

  return (
    <>
      <Navbar/>
      <div className="container">
        <p className="titulo">{nomeCategoria}</p>

        <div className='lista_categoria_container'>
          <ul className='header_lista'>
            <li className='list_title'>
              Nome
            </li>
            <li className='list_title'>
              Tempo de atuação
            </li>
            <li className='list_title'>
              Avaliação
            </li>
          </ul>
          {rows.map(servico => (
            <ul className='body_lista' key={servico.address}>
              <a href={`/perfil/${servico.address}`} className='row_lista'>
                <div className='row_div'>
                  <li className='list_item'>
                    {servico.nome}
                  </li>

                  <li className='list_item'>
                    {servico.tempoDeAtuacao}
                  </li>

                  <li className='list_item'>
                    {servico.avaliacao}
                  </li>

                </div>


              </a>
            </ul>
          ))}
        </div>

      </div>
    </>
  )

}

export default Categoria
