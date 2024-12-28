import React, { useContext } from "react";
import {
  BiBookAlt,
  BiCalculator,
  BiCog,
  BiLogOut,
  BiDollar,
  BiHome,
  BiWrench,
} from "react-icons/bi";
import "../styles/sidebar.css";
import { DataContext } from "../contexts/dataContext";
import { getAuth, signOut } from "firebase/auth";
import { Link } from "react-router-dom";

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
        <BiHome className="logo-icon" />
        <h4 style={{ padding: 0 }}>Seal Market</h4>
      </div>

      <div className="menu--list">
        <Link to="cotizador" className="item" onClick={()=>{setContextSidebarNav("Cotizador")}}>
          <BiCalculator  />
          Cotizador
        </Link>
        <Link to="herramientas" className="item" onClick={()=>{setContextSidebarNav("Herramientas")}}>
          <BiWrench  />
          Herramientas
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
