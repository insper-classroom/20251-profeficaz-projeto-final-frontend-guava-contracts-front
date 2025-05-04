import { useState } from 'react'
import '../styles/SejaContratado.css'



function SejaContratado({ state, onClose }) {
  return (
    <>
      {state && (
        <div className="modal">
          <div onClick={onClose} className="overlay"></div>
          <div className="modal-content">
            <h2>Seja Contratado</h2>
            <form>
              <label className='label-nome-apelido'>Nome / Apelido</label>
              <input type="text" placeholder="Nome / Apelido" className='nome-apelido' />

              <label className='label-tipo-servico'>Tipo de Serviço</label>
              <input type="text" placeholder="Tipo de Serviço" className='tipo-servico'/>

              <button type="button" className="submit-modal" onClick={onClose}>Enviar</button>
            </form>
            <button className="close-modal" onClick={onClose}>X</button>
          </div>
        </div>
      )}
    </>
  );
}

export default SejaContratado
