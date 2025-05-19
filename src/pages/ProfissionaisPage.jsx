import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/ProfissionaisPage.css';

function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const location = useLocation();
  const { servicoFiltro, categoriaFiltro } = location.state || {};

  useEffect(() => {
    const buscarProfissionais = async () => {
      try {
        // Primeiro, tenta buscar por serviço específico
        let url = 'http://127.0.0.1:5000/buscar';
        const params = new URLSearchParams();
        
        if (servicoFiltro) {
          params.append('termo', servicoFiltro);
        }
        if (categoriaFiltro) {
          params.append('categoria', categoriaFiltro);
        }

        const response = await fetch(`${url}?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        // Filtra apenas os resultados do tipo 'profissional'
        const profissionaisFiltrados = data.resultados.filter(r => r.tipo === 'profissional');
        setProfissionais(profissionaisFiltrados);
      } catch (error) {
        console.error('Erro na busca:', error);
        setErro('Erro ao carregar profissionais');
      } finally {
        setLoading(false);
      }
    };

    buscarProfissionais();
  }, [servicoFiltro, categoriaFiltro]);

  return (
    <>
      <Navbar />
      <div className="profissionais-page">
        <h1>
          {servicoFiltro && `Profissionais especializados em ${servicoFiltro}`}
          {categoriaFiltro && ` na área de ${categoriaFiltro}`}
        </h1>

        {loading && <div className="loading">Carregando profissionais...</div>}
        {erro && <div className="erro">{erro}</div>}
        
        {!loading && !erro && (
          <>
            {profissionais.length > 0 ? (
              <div className="profissionais-grid">
                {profissionais.map(prof => (
                  <div key={prof._id} className="profissional-card">
                    <h2>{prof.nome}</h2>
                    <p>{prof.bio || prof.descricao}</p>
                    <div className="info">
                      <span>Categoria: {prof.categoria}</span>
                      {prof.avaliacao && (
                        <span>Avaliação: {prof.avaliacao}</span>
                      )}
                    </div>
                    <Link 
                      to={`/perfil/${prof._id}`} 
                      className="ver-perfil-btn"
                    >
                      Ver Perfil Completo
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                Nenhum profissional encontrado para esta especialidade.
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

export default ProfissionaisPage;