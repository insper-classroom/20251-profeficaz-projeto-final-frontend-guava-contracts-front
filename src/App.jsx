import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import { ContaProvider } from './context/ContaContext';
import LandingPage from './pages/LandingPage.jsx';
import Categoria from './pages/Categoria.jsx';
import ContrateCategorias from './pages/ContrateCategorias.jsx';
import PaginaPerfil from './pages/PaginaPerfil.jsx';
import AvaliacaoContratante from './pages/AvaliacaoContratante.jsx';
import AvaliacaoFreela from './pages/AvaliacaoFreela.jsx';
import PerfilUsuario from './pages/PerfilUsuario.jsx';
import UsuariosPorServico from './pages/ProcuraPerfilporServico.jsx';
import ProfissionaisPage from './pages/ProfissionaisPage';
import ServicosPage from './pages/ServicosPage';
import Pagina_Negociacao_Contrato from './pages/Negociacao_Contrato.jsx';
import AvaliacaoPage from './pages/AvaliacaoPage';


function App() {
  return (
    <ContaProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/categorias/:id" element={<Categoria />} />
        <Route path="/categorias" element={<ContrateCategorias />} />
        <Route path="/perfil/:id" element={<PaginaPerfil />} />
        <Route path="/avaliacaocontratante" element={<AvaliacaoContratante />} />
        <Route path="/avaliacaofreela" element={<AvaliacaoFreela />} />
        <Route path="/perfilusuario" element={<PerfilUsuario />} />
        <Route path="/categorias/servicos/:title" element={<UsuariosPorServico />} />
        <Route path="/profissionais" element={<ProfissionaisPage />} />
        <Route path="/servicos" element={<ServicosPage />} />
        <Route path="/contrato/:id/negociar" element={<Pagina_Negociacao_Contrato />} />
        <Route path="/avaliacao" element={<AvaliacaoPage />} />

      </Routes>
    </ContaProvider>
  );
}

export default App;
