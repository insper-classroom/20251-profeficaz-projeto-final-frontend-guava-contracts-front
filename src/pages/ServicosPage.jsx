import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/ServicosPage.css';

function ServicosPage() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const location = useLocation();
  const { categoria } = location.state || {};

  useEffect(() => {
    const buscarServicos = async () => {
      try {
        const params = new URLSearchParams();
        if (categoria) {
          params.append('categoria', categoria);
        }

        const response = await fetch(`http://127.0.0.1:5000/buscar?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        // Filtra apenas os resultados do tipo serviço
        const servicosFiltrados = data.resultados.filter(r => r.tipo === 'servico');
        setServicos(servicosFiltrados);
      } catch (error) {
        console.error('Erro na busca:', error);
        setErro('Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    };

    buscarServicos();
  }, [categoria]);

  return (
    <>
      <Navbar />
      <div className="servicos-page">
        <h1>
          {categoria ? `Serviços em ${categoria}` : 'Todos os Serviços'}
        </h1>

        {loading && <div className="loading">Carregando serviços...</div>}
        {erro && <div className="erro">{erro}</div>}
        
        {!loading && !erro && (
          <>
            {servicos.length > 0 ? (
              <div className="servicos-grid">
                {servicos.map(servico => (
                  <div key={servico._id} className="servico-card">
                    <h2>{servico.title}</h2>
                    <div className="tags">
                      {servico.tags && servico.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                    <div className="info">
                      <span>Categoria: {servico.category}</span>
                    </div>
                    <Link 
                      to="/profissionais"
                      state={{ 
                        servicoFiltro: servico.title,
                        categoriaFiltro: servico.category 
                      }}
                      className="ver-profissionais-btn"
                    >
                      Ver Profissionais
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                Nenhum serviço encontrado nesta categoria.
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

export default ServicosPage;