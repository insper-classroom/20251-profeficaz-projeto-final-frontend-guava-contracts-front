import '../styles/PaginaPerfil.css'
import Navbar from './Navbar';
import Avaliacao from '../components/Avaliacao.jsx'
import ServicoPerfil from './ServicoPerfil.jsx';
import { useParams } from 'react-router-dom';

function PaginaPerfil() {
  const { id } = useParams(); // Pega o address da URL

  const perfis = {
    "0x123abc": {
      "nome": "Bolivia",
      "profissao": "Desenvolvedor Web",
      "tempo_atuacao": "2 anos",
      "descricao": "Maluco das criptos",
      "avaliacao": 4.5,
      "servicos": [[{
        "titulo": "projeto de landing page", 
        "desc": "Desenvolvi uma landing page responsiva para uma startup do setor de educação, focada em maximizar conversão com design limpo e carregamento rápido. Usei HTML, CSS (Flexbox/Grid) e JavaScript vanilla, garantindo compatibilidade com todos os navegadores modernos. O destaque foi a taxa de conversão que aumentou 22% após o lançamento. Trabalhei diretamente com o time de design e entreguei tudo antes do prazo."
      }]]
    },
    "0x456def": { 
      "nome": "Nadottins",
      "profissao": "Desenvolvedor Web",
      "tempo_atuacao": "500 anos",
      "descricao": "Desenvolvedor fullstack",
      "avaliacao": 2.5,
      "servicos": [[{
        "titulo": " projeto de design UX/UI", 
        "desc": "Criei o design completo de uma aplicação mobile voltada para organização de tarefas em grupo. Fiz o mapeamento da jornada do usuário, wireframes de baixa e alta fidelidade no Figma e testes de usabilidade com foco em eficiência e clareza. O projeto foi aprovado pela equipe de produto com zero retrabalho visual. Cada tela foi pensada para manter o usuário no fluxo certo com o mínimo de fricção."
      }]]
    }
  };

  const perfil = perfis[id] || {
    nome: "Perfil não encontrado",
    profissao: "",
    tempo_atuacao: "",
    descricao: "",
    avaliacao: 0,
    servicos: []
  };

  return (
    <>
      <Navbar/>
      <div className="container_pagina_perfil">
        
        <div className="container_perfil">
          
          <div className="div_foto_perfil">
            <img className='foto_perfil'/>
          </div>
          
          <div className="detalhes_perfil">
            <p id="nome" className="desc_perfil">{perfil.nome}</p>
            <p id="descricao" className="desc_perfil">{perfil.profissao}</p>
            <p id="descricao" className="desc_perfil">Tempo de atuação: {perfil.tempo_atuacao}</p>
            <p id="descricao" className="desc_perfil">Descrição: {perfil.descricao}</p>
            <Avaliacao avaliacao={perfil.avaliacao}/>
          </div>

        </div>
        
        <div className="container_portifolio">
          {perfil.servicos.map(servico => (
            <div className="lista_servicos" key={servico.titulo}>
              <ServicoPerfil servico={servico[0]}/>
            </div>   
          ))}

        </div>
      </div>
    </>
  )
}

export default PaginaPerfil;
