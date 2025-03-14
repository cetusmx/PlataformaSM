import React, { useContext } from "react";
import {
  BiBookAlt,
  BiCalculator,
  BiLogOut,
  BiDollar,
  BiWrench,
  BiSearch,
  BiBarcode,
  BiPackage,
} from "react-icons/bi";
import "../styles/sidebar.css";
import { getAuth, signOut } from "firebase/auth";
import { DataContext } from "../contexts/dataContext";
import { Link } from "react-router-dom";

const SidebarUser = () => {
  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;
  const { contextsideBarNav, setContextSidebarNav } = valor2;

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
        <h4 style={{ padding: 0 }}>Seal Market</h4>
      </div>

      <div className="menu--list">
        <Link
          to="/"
          className="item"
          onClick={() => {
            setContextSidebarNav("Cotizador");
          }}
        >
          <BiCalculator />
          Cotizador
        </Link>
        <Link
          to="busquedasellos"
          className="item"
          onClick={() => {
            setContextSidebarNav("Búsqueda de sellos");
          }}
        >
          <BiSearch />
          Búsqueda sellos
        </Link>
        <Link
          to="codigosbarras"
          className="item"
          onClick={() => {
            setContextSidebarNav("Códigos de barras");
          }}
        >
          <BiBarcode />
          Códigos barras
        </Link>
        <Link
          to="faltantes"
          className="item"
          onClick={() => {
            setContextSidebarNav("Faltantes");
          }}
        >
          <BiPackage />
          Faltantes
        </Link>
        <Link
          to="listaprecios"
          className="item"
          onClick={() => {
            setContextSidebarNav("Lista de precios");
          }}
        >
          <BiDollar />
          Lista precios
        </Link>
        <button className="item" onClick={logout}>
          <BiLogOut />
          Salir
        </button>
      </div>
    </div>
  );
};

export default SidebarUser;
