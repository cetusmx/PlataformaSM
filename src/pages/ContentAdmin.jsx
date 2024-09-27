import ContentHeader from "./ContentHeader";
import "../styles/content.css";
//import { DataContext } from "../contexts/dataContext";
import Cotizador from "./Cotizador";
import { Routes, Route } from "react-router-dom";
import Editamars from "./Editamars";
import Inicio from "./Inicio";
import Remision from "./Remision";

const ContentAdmin = () => {
  
  return (
    <div className="content">
      <ContentHeader />
      <div className="content--interior">
        
        <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="cotizador" element={<Cotizador />} />
            <Route path="admin" element={<Editamars />} />
            <Route path="precios" element={<Remision />} />
        </Routes>
      </div>
    </div>
  );
};

export default ContentAdmin;