import { useState } from 'react'
import {Routes, Route} from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import Categoria from './pages/Categoria.jsx'
import ContrateCategorias from './pages/ContrateCategorias.jsx'
import PaginaPerfil from './pages/PaginaPerfil.jsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/categorias/:id" element={<Categoria/>} />
        <Route path="/categorias" element={<ContrateCategorias/>} />
        <Route path="/perfil/:id" element={<PaginaPerfil/>} />
      </Routes>
    </>
  )
}

export default App
