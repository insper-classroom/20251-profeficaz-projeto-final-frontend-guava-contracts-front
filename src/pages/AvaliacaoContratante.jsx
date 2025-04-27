import React, { useState } from 'react';
import '../styles/AvaliacaoContratante.css';

function AvaliacaoContratante() {
  const [nota, setNota] = useState(0);
  const [descricao, setDescricao] = useState('');

  const handleStarClick = (value) => {
    setNota(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Nota:', nota);
    console.log('Descrição:', descricao);
    alert('Avaliação enviada com sucesso!');
    setNota(0);
    setDescricao('');
  };

  return (
    <div className="avaliacao-container">
      <h1>Avaliar Contratante</h1>
      <form onSubmit={handleSubmit}>
        <div className="avaliacao-stars">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= nota ? 'selected' : ''}`}
                onClick={() => handleStarClick(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <div className="avaliacao-descricao">
          <label htmlFor="descricao">Descrição:</label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows="5"
            required
          />
        </div>
        <button type="submit" className="avaliacao-submit">
          Enviar Avaliação
        </button>
      </form>
    </div>
  );
}

export default AvaliacaoContratante;