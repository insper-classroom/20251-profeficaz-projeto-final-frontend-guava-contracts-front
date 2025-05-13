import React, { useState } from 'react';
import Navbar from '../components/Navbar.jsx'; 
import Categorias from './Categorias.jsx';
import HeroSection from '../components/home/HeroSection.jsx';
import HowItWorksSection from '../components/home/HowItWorks.jsx';
import JoinSection from '../components/home/JoinSection.jsx'; 
import Footer from '../components/Footer.jsx';
import '../styles/LandingPage.css';

function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    console.log('Buscando por:', searchTerm);
    // Implemente a lógica de busca aqui
  };

  return (
    <>
      <Navbar />
      <HeroSection
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        handleSearchSubmit={handleSearchSubmit}
      />
      <Categorias />
      <HowItWorksSection />
      <JoinSection />
      <Footer />
    </>
  );
}

export default LandingPage;