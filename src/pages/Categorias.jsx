import '../styles/Categorias.css'


function Categorias () {



  return (
    <div className="container_geral_categorias">
      <p id="titulo_categorias">
        Categorias:
      </p>

      <div className="container_categorias">
        <div className="first_row">
          <a href="/categorias/1">
            <div className="categoria">
              <div className="box_titulo_categoria">
                <p className="titulo_categoria">Categoria id</p>
              </div>
            </div>
          </a>

          <a href="/categorias/2">
            <div className="categoria">
              <div className="box_titulo_categoria">
                <p className="titulo_categoria">Categoria id</p>
              </div>
            </div>
          </a>
          <a href="#">
            <div className="categoria">
              <div className="box_titulo_categoria">
                <p className="titulo_categoria">Categoria id</p>
              </div>
            </div>
          </a>
          <a href="#">
            <div className="categoria">
              <div className="box_titulo_categoria">
                <p className="titulo_categoria">Categoria id</p>
              </div>
            </div>
          </a>
          <a href="#">
            <div className="categoria">
              <div className="box_titulo_categoria">
                <p className="titulo_categoria">Categoria id</p>
              </div>
            </div>
          </a>
         
        </div>
        
        <div className="second_row">
          <a href="#">
            <div className="categoria">
              <div className="box_titulo_categoria">
                <p className="titulo_categoria">Categoria id</p>
              </div>
            </div>
          </a>
           <a href="#">
            <div className="categoria">
              <div className="box_titulo_categoria">
                <p className="titulo_categoria">Categoria id</p>
              </div>
            </div>
          </a>
           <a href="#">
            <div className="categoria">
              <div className="box_titulo_categoria">
                <p className="titulo_categoria">Categoria id</p>
              </div>
            </div>
          </a>
       </div>
      </div>
    
    </div>
    
  )
}

export default Categorias
