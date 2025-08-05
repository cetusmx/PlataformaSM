import React, { useContext } from "react";
import {
  BiBookAlt,
  BiCalculator,
  BiCog,
  BiLogOut,
  BiDollar,
  BiHome,
  BiWrench,
  BiSearch,
  BiBarcode,
  BiPackage,
} from "react-icons/bi";
import "../styles/sidebar.css";
import { DataContext } from "../contexts/dataContext";
import { getAuth, signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import logoImage from "../assets/Logo3tr.png";

const Sidebar = () => {

  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;
  const {contextsideBarNav, setContextSidebarNav} = valor2;
  //console.log(sideBarNav);

  const logout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log("salió");
      })
      .catch((error) => {
        // An error happened.
      });
  };

  return (
    <div className="menu">
      <div className="logo">
        <img src={logoImage} alt="Logo" className="logo-image" />
        {/* <BiHome className="logo-icon" /> */}
        <h4 style={{ padding: 0 }}>Seal Market</h4>
      </div>

      <div className="menu--list">
        <Link to="cotizador" className="item" onClick={()=>{setContextSidebarNav("Cotizador")}}>
          <BiCalculator  />
          Cotizador
        </Link>
        <Link to="busquedasellos" className="item" onClick={()=>{setContextSidebarNav("Búsqueda de sellos")}}>
          <BiSearch  />
          Búsqueda sellos
        </Link>
        <Link to="codigosbarras" className="item" onClick={()=>{setContextSidebarNav("Códigos de barras")}}>
          <BiBarcode  />
          Códigos barras
        </Link>
        <Link to="faltantes" className="item" onClick={()=>{setContextSidebarNav("Faltantes")}}>
          <BiPackage  />
          Faltantes
        </Link>
        <Link to="listaprecios" className="item" onClick={()=>{setContextSidebarNav("Lista de precios")}}>
          <BiDollar  />
          Lista precios
        </Link>
        <Link to="admin" className="item" onClick={()=>{setContextSidebarNav("Ajustes")}}>
          <BiCog />
          Ajustes
        </Link>
        <button className="item" onClick={logout}>
          <BiLogOut />
          Salir
        </button>
        
      </div>
    </div>
  );
};

export default Sidebar;
