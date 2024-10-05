import ContentHeader from "./ContentHeader";
import "../styles/content.css";
//import { DataContext } from "../contexts/dataContext";
import Cotizador from "./Cotizador";
import { Routes, Route } from "react-router-dom";
import Remision from "./Remision";
import Configuracion from "./Configuracion";

const ContentAdmin = () => {
  
  return (
    <div className="content">
      <ContentHeader />
      <div className="content--interior">
        
        <Routes>
            <Route path="/" element={<Cotizador />} />
            <Route path="cotizador" element={<Cotizador />} />
            <Route path="admin" element={<Configuracion />} />
            <Route path="precios" element={<Remision />} />
        </Routes>
      </div>
    </div>
  );
};

export default ContentAdmin;