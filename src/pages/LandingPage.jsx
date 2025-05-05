import {useState, useEffect} from 'react'
import NavBar from './Navbar.jsx'
import Categorias from './Categorias.jsx'
import '../styles/LandingPage.css'

function LandingPage() {


 
  return (
    <>
        <NavBar/> <div className="container">
        <div className="pesquisa_apresentacao">
          <div className="pesquisa">
            <div className="espaco_pesquisa">
              <form className="barra_pesquisa">
                <input className="input_pesquisa" placeholder="O que você está procurando hoje?" />
              </form>
            </div>
          </div>


          <div className="apresentacao">
            <p className="texto_apresentacao">
              Descentralizando o mercado de freelancing com Guava 
            </p>
          </div>
        </div>

      <Categorias/>
      </div>
    
    </>
  )
}

export default LandingPage
