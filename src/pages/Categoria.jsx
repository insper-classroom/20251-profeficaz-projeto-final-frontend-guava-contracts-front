import '../styles/Categoria.css'
import Navbar from './Navbar'
import React from 'react'
import { useParams } from 'react-router-dom'

function Categoria () {

  // Vou alterar colocando endereços unicos para cada um deles --> address
  // esse endereço consequetemente vai aparecer na URL quando for pra pag de perfil e etc
  const rows = [
    {
      "address": "0x123abc", 
      "nome": "Bolivia", 
      "tempoDeAtuacao": "2 anos", 
      "avaliacao": 4.5
    },
    {
      "address": "0x456def", 
      "nome": "Nadottins", 
      "tempoDeAtuacao": "500 anos", 
      "avaliacao": 2.5
    }
  ]

const {id} = useParams()
  
  return (
  <>
  <Navbar/>
    <div className="container">
      <p className="titulo">Categoria {id}</p>
    
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
        {rows.map(row => (
          <ul className='body_lista' key={row.address}>
            <a href={`/perfil/${row.address}`} className='row_lista'>
              <div className='row_div'>
                <li className='list_item'>
                  {row.nome}
                </li>
                
                <li className='list_item'>
                  {row.tempoDeAtuacao}
                </li>
              
                <li className='list_item'>
                  {row.avaliacao}
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
