import '../styles/Categoria.css'
import Navbar from '../components/Navbar'
import React from 'react'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios';


function Categoria () {
  
  const [servicos, setServicos] = useState([]);
  const [nomeCategoria, setNomeCategoria] = useState('');
  const {id} = useParams()
  const rows = [
    {"address": "6809410ee314814015b7f9ca" ,"nome": "Thales", "tempoDeAtuacao": "2 anos", "avaliacao": 4.5},
  ]


  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/servico/categoria/${id}`)
      .then((response) => {
        
        setServicos(response.data)
        console.log("categoria", response.data)
      })
      .catch((error) => console.error("erro ao buscar categorias", error))
  }, [])


  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/categoria/${id}`)
      .then((response) => {

        setNomeCategoria(response.data.Name)
        console.log("categoria", response.data.Name)
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
              
            </li>
            <li className='list_title'>
              Tags
            </li>
          </ul>
          {servicos.map((servico, index) => (
            <ul className='body_lista' key={servico.address || index}>
              <a href={`/servico/user/${servico.title}`} className='row_lista'>
                <div className='row_div'>
                  <li className='list_item'>
                    {servico.title}
                  </li>

                  <li className='list_item'>
                    {servico.tempoDeAtuacao}
                  </li>

                  <li className='list_item'>
                    {servico.tags && servico.tags.slice(0, 3).join(', ')}
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
