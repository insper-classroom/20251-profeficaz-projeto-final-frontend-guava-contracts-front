import '../styles/Categorias.css'


function Categorias () {

const categorias = [
    {"nome": "Web Dev", "id": 1},
    {"nome": "Web Dev", "id": 2},
    {"nome": "Web Dev", "id": 3},
    {"nome": "Web Dev", "id": 4},
    {"nome": "Web Dev", "id": 5},
    {"nome": "Web Dev", "id": 6},
    {"nome": "Web Dev", "id": 7},
  ]

  return (

    <div className="container_geral_categorias">
      <p id="titulo_categorias">
        Categorias:
      </p>

      <div className="container_categorias">

        <ul className="lista_categorias" >
        {categorias.map(categoria => (
            <a href={`/categorias/${categoria.id}`} className="categoria_link" key={categoria.id}>
              <div className='container_da_categoria' key={categoria.id}>
                <li className='titulo_da_categoria'>
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
