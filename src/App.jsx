import { useState } from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
      </Routes>
    </>
  )
}

export default App
