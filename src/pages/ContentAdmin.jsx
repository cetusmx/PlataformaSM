import React, { useContext } from "react";
import ContentHeader from "./ContentHeader";
import "../styles/content.css";
import { DataContext } from "../contexts/dataContext";
import Cotizador from "./Cotizador";
import { Routes, Route } from "react-router-dom";
import Configuracion from "./Configuracion";
import Precios from "./Precios";
import Inicio from "./Inicio";

const ContentAdmin = () => {
  
  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;
  const {contextsideBarNav, setContextSidebarNav} = valor2;
  /* console.log("AppAdmin: " + contextData.uid);
  console.log("AppAdmin=> navegacion: " + contextsideBarNav.page); */


  return (
    <div className="content">
      <ContentHeader />
      <div className="content--interior">
        
        <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="cotizador" element={<Cotizador />} />
            <Route path="admin" element={<Configuracion />} />
            <Route path="precios" element={<Precios />} />
        </Routes>
      </div>
    </div>
  );
};

export default ContentAdmin;