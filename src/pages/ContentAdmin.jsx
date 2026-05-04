import React from "react";
import ContentHeader from "./ContentHeader";
import "../styles/content.css";
import { Routes, Route } from "react-router-dom";
import MenuHerramientas from "./MenuHerramientas";
import Configuracion from "./Configuracion";
import ContenedorCotizador from "./ContenedorCotizador";
import CodigoBarras from "./CodigoBarras";
import CodigoBarrasManual from "./CodigoBarrasManual";
import Editamars from "./Editamars";
import Usuarios from "./Usuarios";
import ClavesNoRegistradas from "./ClavesNoRegistradas";
import InventariosPage from "./ajustes/gestioninventarios/InventarioPage";
import PedidosEspeciales from "./PedidosEspeciales";
import Reposiciones from "./Reposiciones";

const ContentAdmin = () => {
  return (
    <div className="content">
      <ContentHeader />
      <div className="content--interior">
        <Routes>
          <Route path="/" element={<ContenedorCotizador />} />
          <Route path="cotizador" element={<ContenedorCotizador />} />
          <Route path="codigosbarras" element={<CodigoBarrasManual />} />
          <Route path="admin" element={<Configuracion />} />
          <Route path="herramientas" element={<MenuHerramientas />} />
          <Route path="recepcionmercancia" element={<CodigoBarras />} />
          <Route path="ajustescotizador" element={<Editamars />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="noregistradas" element={<ClavesNoRegistradas />} />
          <Route path="gestioninventarios" element={<InventariosPage />} />
          <Route path="pedidosespeciales" element={<PedidosEspeciales />} />
          <Route path="reposiciones" element={<Reposiciones />} />
        </Routes>
      </div>
    </div>
  );
};

export default ContentAdmin;
