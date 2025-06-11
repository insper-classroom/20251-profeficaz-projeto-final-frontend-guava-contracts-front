import React, { useState } from 'react';
import '../styles/AvaliacaoContratante.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';


function AvaliacaoContratante() {
  const AUTH_TOKEN_KEY = 'authToken';
  const contratoId = useParams();
  const [nota, setNota] = useState(0);
  const [descricao, setDescricao] = useState('');
  const navigate = useNavigate();

  const handleStarClick = (value) => {
    setNota(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://127.0.0.1:5000/contratos/avaliacaocontratante/${contratoId.contratoId}`,
        {
            nota
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`
          }
        }
      );
      // Optionally, show a user-friendly notification here
      setNota(0);
      setDescricao('');
      navigate('/perfilusuario'); // Redireciona para a página de perfil do usuário
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      // Optionally, show a user-friendly error notification here
    }
  };

  return (
    <div className="avaliacao-container">
      <h1>Avaliar freelancer</h1>
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
