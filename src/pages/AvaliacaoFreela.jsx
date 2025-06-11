import React, { useState } from 'react';
import '../styles/AvaliacaoFreela.css';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';

function AvaliacaoFreela() {

  const AUTH_TOKEN_KEY = 'authToken';
  const contratoId = useParams()
  const [nota, setNota] = useState(0);
  const [descricao, setDescricao] = useState('');
  const navigate = useNavigate();
  const handleStarClick = (value) => {
    setNota(value);
    console.log(nota)
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Nota:', nota);
    console.log('Descrição:', descricao);
    console.log('Contrato ID:', contratoId);
    alert('Avaliação enviada com sucesso!');
    axios.put(`http://127.0.0.1:5000/contratos/avaliacaofreela/${contratoId.contratoId}`, {nota},
 {
    headers: {
      Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`
    }
  })
    .then((response) => {
      console.log("Avaliação enviada com sucesso:", response.data);
    })
    .catch((error) => {
      console.error("Erro ao enviar avaliação:", error);
      alert('Erro ao enviar avaliação. Tente novamente.');
    });
    setNota(0);
    setDescricao('');
    navigate('/perfilusuario'); // Redireciona para a página de perfil do usuário
  };

  return (
    <>
      <Navbar/>
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
    </>

  );
}

export default AvaliacaoFreela;
