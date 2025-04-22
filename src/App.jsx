import { useState } from 'react'
import {Routes, Route} from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import Categoria from './pages/Categoria.jsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/categorias/:id" element={<Categoria/>} />
      </Routes>
    </>
  )
}

export default App
