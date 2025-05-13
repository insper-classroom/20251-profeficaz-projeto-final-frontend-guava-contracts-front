function HeroSection({ searchTerm, handleSearchChange, handleSearchSubmit }) {
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
          <input
            type="text"
            className="search-input"
            placeholder="O que você está procurando hoje?"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button
            type="submit"
            className="search-button"
          >
            Buscar
          </button>
        </form>
      </div>
    </section>
  );
}

export default HeroSection;