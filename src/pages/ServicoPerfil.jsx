
import '../styles/ServicoPerfil.css'


function ServicoPerfil ({servico}) {

  return (

    <div className="servico">
      <div className = "info_servico">
        <p className = "titulo_servico">{servico.titulo}</p>
        <p className= "detalhes_servico">{servico.desc} </p>
      </div>
      <div className="botoes">
        <button className="botao_fechar_contrato">Fechar Contrato</button>
      </div>

    </div>
  )

}

export default ServicoPerfil
