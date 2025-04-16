import {useState, useEffect} from 'react'
import NavBar from './Navbar.jsx'
import '../styles/LandingPage.css'

function LandingPage() {
 
  return (
    <>
      <NavBar/>
      <div className="container">
        <div className="pesquisa_apresentacao">
          <div className="pesquisa">
            <div className="espaco_pesquisa">
              <form className="barra_pesquisa">
                <input className="input_pesquisa" placeholder="Qual serviço está procurando hoje?" />
              </form>
            </div>
          </div>

          <div className="apresentacao">
            Descentralizando o mercado de freelancing com Guava 
          </div>
        </div>
      </div>

    </>
  )
}

export default LandingPage
