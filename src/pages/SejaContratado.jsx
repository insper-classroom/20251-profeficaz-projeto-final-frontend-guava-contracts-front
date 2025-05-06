import { useState, useEffect } from 'react'
import {useNavigate} from 'react-router-dom'
import '../styles/SejaContratado.css'
import axios from 'axios'



function SejaContratado({ state, onClose }) {
  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');
  const [servico, setServico] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const navigate = useNavigate();


  const categoriasDisponiveis = [
    'Web Dev',
    'Aulas de Fisica',
    'Aulas de Matematica'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5173/servico', {servico, categoria, valor});

      console.log("enviado com sucesso", response.data)
    } catch (error){
      console.error("Erro ao enviar o formulario", error)
    }
    
    onClose();
  }

  return (
    <>
      {state && (
        <div className="modal">
          <div onClick={onClose} className="overlay"></div>
          <div className="modal-content">
            <h2>Seja Contratado</h2>
            <form onSubmit={handleSubmit}>

              <label className='label-tipo-servico'>Serviço</label>
              <input type="text" placeholder="Tipo de Serviço" className='tipo-servico' required/>

              <label className='label-categoria'>Categoria</label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
              >
                <option value="">-- Escolha uma categoria --</option>
                {categoriasDisponiveis.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <label className='label-valor'>Valor</label>
              <input type="text" placeholder="Valor" className='valor' required/>

              <button type="submit" className="submit-modal" >Enviar</button>
            </form>
            <button className="close-modal" onClick={onClose}>X</button>
          </div>
        </div>  
      )}
    </>
  );
}

export default SejaContratado
