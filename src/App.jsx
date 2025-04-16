import { useState } from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'
import Navbar from './pages/Navbar.jsx'


function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Navbar/>} />
      </Routes>
    </>
  )
}

export default App
