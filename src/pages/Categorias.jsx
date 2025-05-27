import { useEffect } from 'react'
import '../styles/Categorias.css'
import { useState } from 'react'
import axios from 'axios';


function Categorias () {

  const [categorias, setCategorias] = useState([]);
  const API_BASE_URL = 'http://127.0.0.1:5000';

  useEffect(() => {
    axios.get(`${API_BASE_URL}/categoria`)
      .then((response) => {
        console.log(response.data)
        setCategorias(response.data.dados)
      })
      .catch((error) => console.error("erro ao buscar categorias", error))
  }, [])

  return (

    <div className="container_geral_categorias">
      <p id="titulo_categorias">
        Categorias:
      </p>

      <div className="container_categorias">

        <ul className="lista_categorias" >
          {categorias.map(categoria => (
            <li key={categoria._id}>
              <a href={`/categorias/${categoria.Name}`} className="categoria_link">
                <div className='container_da_categoria'>
                  <span className='titulo_da_categoria'>
                    {categoria.Name}
                  </span>
                </div>
              </a>
            </li>           

          ))}

        </ul>
        <a href="/categorias">

        </a>
      </div>
    </div>
  )
}

export default Categorias
