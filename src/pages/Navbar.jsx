import { useState } from 'react'
import '../styles/Navbar.css'
import React from 'react'

function Navbar() {

  return (
      <nav>
        <div className="Titulo">
          Guava
        </div>

        <ul className="Nav-Items">
          <li>
            <a href="#" className = "seja-contratado" > Seja Contratado</a>
          </li>
          <li>
            <a href="#" className="contrate"> Contrate</a>
          </li>
          <li >
            <a href="#" className="conectar"> Conectar</a>
          </li>
        </ul>
      </nav>
  )
}

export default Navbar
