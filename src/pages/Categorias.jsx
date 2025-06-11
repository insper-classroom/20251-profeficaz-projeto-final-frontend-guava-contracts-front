import { useEffect, useState } from 'react'
import '../styles/Categorias.css'
import axios from 'axios';
import { 
  Settings, Palette, CheckSquare, BarChart3, 
  Briefcase, Users, HeadphonesIcon, DollarSign, 
  Megaphone, PenTool, TrendingUp, Code, MoreHorizontal 
} from 'lucide-react';

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const API_BASE_URL = 'http://127.0.0.1:5000';

  // Mapeamento de ícones por categoria
  const getIconForCategory = (categoryName) => {
    const iconMap = {
      'DevOps - Sysadmin': Settings,
      'Design': Palette,
      'QA': CheckSquare,
      'Data Analysis': BarChart3,
      'Project Management': Briefcase,
      'Product': Users,
      'Customer Service': HeadphonesIcon,
      'Human Resources': Users,
      'Finance - Legal': DollarSign,
      'Marketing': Megaphone,
      'Writing': PenTool,
      'Sales - Business': TrendingUp,
      'Software Development': Code,
      'All others': MoreHorizontal
    };
    
    return iconMap[categoryName] || MoreHorizontal;
  };

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
      <p id="titulo_categorias">Categorias:</p>
      <div className="container_categorias">
        <ul className="lista_categorias">
          {categorias.map(categoria => {
            const IconComponent = getIconForCategory(categoria.Name);
            return (
              <li key={categoria._id}>
                <a href={`/categorias/${categoria.Name}`} className="categoria_link">
                  <div className='container_da_categoria'>
                    <span className='titulo_da_categoria'>
                      {categoria.Name}
                    </span>
                    <div className="icone_categoria">
                      <IconComponent size={48} />
                    </div>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  )
}

export default Categorias