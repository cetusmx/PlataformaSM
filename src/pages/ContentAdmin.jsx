import ContentHeader from "./ContentHeader";
import "../styles/content.css";
import { Routes, Route } from "react-router-dom";
import Remision from "./Remision";
import Configuracion from "./Configuracion";
import ContenedorCotizador from "./ContenedorCotizador";

const ContentAdmin = () => {
  
  return (
    <div className="content">
      <ContentHeader />
      <div className="content--interior">
        
        <Routes>
            <Route path="/" element={<ContenedorCotizador />} />
            <Route path="cotizador" element={<ContenedorCotizador />} />
            <Route path="admin" element={<Configuracion />} />
            <Route path="precios" element={<Remision />} />
        </Routes>
      </div>
    </div>
  );
};

export default ContentAdmin;