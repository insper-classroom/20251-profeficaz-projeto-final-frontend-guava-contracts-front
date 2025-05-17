import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../styles/ResultadosBusca.css';

function ResultadosBusca({ resultados }) {
  if (!resultados || resultados.length === 0) {
    return (
      <div className="resultados-vazios">
        <p>Nenhum resultado encontrado</p>
      </div>
    );
  }

  const servicos = resultados.filter(r => r.tipo === 'servico');

  return (
    <div className="resultados-container">
      <h2>Serviços Encontrados ({servicos.length})</h2>
      <div className="resultados-grid">
        {servicos.map((servico) => (
          <div key={servico._id} className="resultado-card">
            <h3>{servico.title}</h3>
            <div className="tags">
              {servico.tags && servico.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
            <div className="servico-info">
              <span className="categoria">
                <i className="fas fa-folder"></i> {servico.category}
              </span>
            </div>
            <a 
              href={`/categorias/servicos/${servico.title}`} 
              className="ver-servico-btn"
            >
              Ver Profissional
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

ResultadosBusca.propTypes = {
  resultados: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string),
      category: PropTypes.string.isRequired,
      profissionalId: PropTypes.string.isRequired
    })
  ).isRequired
};

export default ResultadosBusca;
