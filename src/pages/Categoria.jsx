import '../styles/Categoria.css'
import Navbar from './Navbar'
import React from 'react'

function Categoria () {
  
  const rows = [
  {"address": "askdjhf1239841epkl@#P$#" ,"nome": "Bolivia", "tempoDeAtuacao": "2 anos", "avaliacao": 4.5},
  {"address": "askdjhf1239841epkl@#P$#" ,"nome": "Nadottins", "tempoDeAtuacao": "500 anos", "avaliacao": 25}
]
  
  return (
  <>
  <Navbar/>
    <div className="container">
      <p className="titulo">Categoria id</p>
    
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
            <a href="#" className='row_lista'>
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
