import React, { useState } from 'react';
import '../styles/AvaliacaoContratante.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';


function AvaliacaoContratante() {
  const { contratoId } = useParams();
  const [nota, setNota] = useState(0);
  const [descricao, setDescricao] = useState('');
  const navigate = useNavigate();

  const handleStarClick = (value) => {
    setNota(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Nota:', nota);
    console.log('Descrição:', descricao);
    alert('Avaliação enviada com sucesso!');
    axios.put(`http://localhost:3000/avaliacaocontratante/${contratoId}`, {
      avaliacao: {
        nota
      },
    })
    .then(() => {
      console.log('Avaliação atualizada com sucesso');
    })
    .catch((error) => {
      console.error('Erro ao atualizar avaliação:', error);
      alert('Erro ao enviar avaliação. Tente novamente mais tarde.');
    });
    setNota(0);
    setDescricao('');
    navigate('/');
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
