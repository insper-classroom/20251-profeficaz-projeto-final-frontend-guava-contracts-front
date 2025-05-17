import React, { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Categorias from './Categorias.jsx';
import HeroSection from '../components/home/HeroSection.jsx';
import HowItWorksSection from '../components/home/HowItWorks.jsx';
import JoinSection from '../components/home/JoinSection.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/LandingPage.css';
import ResultadosBusca from '../components/ResultadosBusca';
import axios from 'axios';
function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const[buscaRealizada, setBuscaRealizada] = useState(false);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = async (event) => {
  event.preventDefault();
  
  if (!searchTerm.trim()) {
    return;
  }

  setLoading(true);
  setErro(null);
  setResultados([]);
  setBuscaRealizada(true);

  try {
    const url = `http://127.0.0.1:5000/buscar?termo=${encodeURIComponent(searchTerm.trim())}`;
    console.log('Fazendo requisição para:', url);

    const response = await fetch(url);
    console.log('Status da resposta:', response.status);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('Dados completos recebidos:', data);

    if (data && data.resultados) {
      if (data.resultados.length === 0) {
        console.log('Nenhum resultado encontrado');
        setErro('Nenhum resultado encontrado para sua busca');
      } else {
        console.log(`Encontrados ${data.resultados.length} resultados`);
        console.log('Query utilizada:', data.query_utilizada);
      }
      setResultados(data.resultados);
    } else {
      console.error('Formato inesperado:', data);
      setErro('Formato de resposta inválido');
    }
  } catch (error) {
    console.error('Erro detalhado:', error);
    setErro(
      error.message === 'Failed to fetch' 
        ? 'Servidor não está respondendo. Verifique se o backend está rodando.'
        : `Erro na busca: ${error.message}`
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <Navbar />
      <HeroSection
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        handleSearchSubmit={handleSearchSubmit}
      />

      <div className="resultados-section">
        {loading && <div className="loading">Buscando...</div>}
        {erro && <div className="erro">{erro}</div>}
        {!loading && !erro && buscaRealizada &&resultados.length === 0 && (
          <div className="no-results">
            Nenhum resultado encontrado para "{searchTerm}"
          </div>
        )}
        {resultados.length > 0 && <ResultadosBusca resultados={resultados} />}
      </div>

      <Categorias />
      <HowItWorksSection />
      <JoinSection />
      <Footer />
    </>
  );
}

export default LandingPage;