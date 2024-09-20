import React, { useContext }  from "react";
import {
  BiBookAlt,
  BiCalculator,
  BiLogOut,
  BiDollar
} from "react-icons/bi";
import "../styles/sidebar.css";
import { getAuth, signOut } from "firebase/auth";
import { DataContext } from "../contexts/dataContext";
import { Link } from "react-router-dom";

const SidebarUser = () => {

  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;
  const {contextsideBarNav, setContextSidebarNav} = valor2;

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
        <BiBookAlt className="logo-icon" />
        <h4 style={{padding:0}}>Seal Market</h4>
      </div>

      <div className="menu--list">
        <Link to="cotizador" className="item" onClick={()=>{setContextSidebarNav("Cotizador")}}>
          <BiCalculator className="icon" />
          Cotizador
        </Link>
        <Link to="precios" className="item" onClick={()=>{setContextSidebarNav("Precios")}}>
          <BiDollar className="icon" />
          Precios
        </Link>
        <button className="item" onClick={logout}>
          <BiLogOut className="icon" />
          Salir
        </button>
      </div>
    </div>
  );
};

export default SidebarUser;
