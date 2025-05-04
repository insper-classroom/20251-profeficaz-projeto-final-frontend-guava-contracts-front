import { useEffect } from 'react'
import '../styles/Categorias.css'
import { useState } from 'react'
import axios from 'axios';


function Categorias () {
  
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/categoria')
    .then((response) => {
        console.log(response.data.dados)
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
            <a href={`/categorias/${categoria.id}`} className="categoria_link" key={categoria._id}>
              <div className='container_da_categoria' >
                <li className='titulo_da_categoria' >
                  {categoria.nome}
                </li>
              </div>
            </a>
            
                     
        ))}
        
        </ul>
        <a href="/categorias">

        </a>
        </div>
    </div>
  )
}

export default Categorias
