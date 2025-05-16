import React from 'react';
import PropTypes from 'prop-types';
import './HeroSection.css';

function HeroSection({ 
  searchTerm, 
  handleSearchChange, 
  handleSearchSubmit
}) {
  return (
    <section className="hero-section">
      <div className="container">
        <h1 className="hero-title">
          Descentralizando o mercado de freelancing com Guava
        </h1>
        <p className="hero-subtitle">
          Crie e gerencie contratos inteligentes seguros e transparentes para seus projetos freelance.
        </p>
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="O que você está procurando hoje?"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button type="submit" className="search-button">
              Buscar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

HeroSection.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  handleSearchChange: PropTypes.func.isRequired,
  handleSearchSubmit: PropTypes.func.isRequired
};

export default HeroSection;