import '../styles/ProcuraPerfilporServico.css'
import Navbar from '../components/Navbar'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

function UsuariosPorServico () {
  const { title } = useParams()
  const [usuarios, setUsuarios] = useState([])

  const API_BASE_URL = 'http://127.0.0.1:5000';

  // Primeiro: buscar nome do serviço com base no id
//   useEffect(() => {
//   axios.get(`${API_BASE_URL}/servico`)
//     .then((res) => {
//       const servicoEncontrado = res.data.servicos.find(s => s._id === id)
//       if (servicoEncontrado) {
//         setNomeServico(servicoEncontrado.nome)
//         console.log("Serviço encontrado:", servicoEncontrado.nome)
//       } else {
//         console.error("Serviço não encontrado com id:", id)
//       }
//     })
//     .catch((err) => {
//       console.error("Erro ao buscar serviços", err)
//     })
// }, [id])


  useEffect(() => {

    axios.get(`${API_BASE_URL}/categorias/servicos/${title}`)
      .then((res) => {
        setUsuarios(res.data.usuarios)
      })
      .catch((err) => {
        console.error("Erro ao buscar usuários", err)
      })
  }, [])


  return (
    <>
      <Navbar />
      <div className="container">
        <p className="titulo">{title}</p>

        <div className='lista_categoria_container'>
          <ul className='header_lista'>
            <li className='list_title'>Nome</li>
            <li className='list_title'>Avaliação</li>
          </ul>
          {usuarios.map((user, index) => (
            <div className='body_lista' key={user._id || index}>
              <a href={`/perfil/${user._id}`} className='row_lista'>
                <div className='row_div'>
                  <li className='list_item'>{user.nome}</li>
                  <li className='list_item'>
                    {user.avaliacao.length > 0 ? `⭐ ${user.avaliacao.length}` : '—'}
                  </li>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default UsuariosPorServico
