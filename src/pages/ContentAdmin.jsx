import React from "react";
import ContentHeader from "./ContentHeader";
import "../styles/content.css";
import { Routes, Route } from "react-router-dom";
import MenuHerramientas from "./MenuHerramientas";
import Configuracion from "./Configuracion";
import ContenedorCotizador from "./ContenedorCotizador";
import Remision from "./Remision";
import BusquedaSellos from "./BusquedaSellos";
import SubmenuCodBarras from "./SubmenuCodBarras";
import SiembraProds from "./SiembraProds";
import CodigoBarras from "./CodigoBarras";
import CodigoBarrasManual from "./CodigoBarrasManual";
import AjustesCotizador from "./AjustesCotizador";
import Editamars from "./Editamars";
import AjustesPrecios from "./AjustesPrecios";
import Usuarios from "./Usuarios";
import Solicitudes from "./admon/siembra/Solicitudes";
import Gestion from "./admon/siembra/Gestion";

const ContentAdmin = () => {
  
  return (
    <div className="content">
      <ContentHeader />
      <div className="content--interior">
        
        <Routes>
            <Route path="/" element={<ContenedorCotizador />} />
            <Route path="cotizador" element={<ContenedorCotizador />} />
            <Route path="busquedasellos" element={<Usuarios />} />
            <Route path="codigosbarras" element={<CodigoBarrasManual />} />
            <Route path="faltantes" element={<SiembraProds />} />
            <Route path="admin" element={<Configuracion />} />
            <Route path="herramientas" element={<MenuHerramientas />} />
            <Route path="listaprecios" element={<Remision />} />
            <Route path="recepcionmercancia" element={<CodigoBarras />} />
            <Route path="ajustescotizador" element={<Editamars />} />
            <Route path="ajustesprecios" element={<AjustesPrecios />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="admonfaltantes" element={<Gestion />} />
        </Routes>
      </div>
    </div>
  );
};

export default ContentAdmin;