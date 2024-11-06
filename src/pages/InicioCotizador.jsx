import React, { useState, useContext } from "react";
import { DataContext } from "../contexts/dataContext";
import CotizadorAdmin from "./CotizadorAdmin";
import Cotizador from "./Cotizador";
import CotizadorFres from "./CotizadorFres";

const InicioCotizador = () => {
    const { valor, valor2 } = useContext(DataContext);
    const { contextData, setContextData } = valor;
    const { contextsideBarNav, setContextSidebarNav } = valor2;
  
    console.log("AppAdmin: " + contextData.uid);
    console.log("AppAdmin: " + contextData.email);
    console.log("AppAdmin: " + contextData.rol);
    console.log("AppAdmin: " + contextData.sucursal);
    //console.log("AppAdmin=> navegacion: " + contextsideBarNav.page);
    console.log("AppAdmin=> navegacion1: " + contextsideBarNav);

  return (
    <>
      {contextData.rol==="admin" ? (
        <CotizadorAdmin />
      ) : contextData.rol === "user" ? (
        <Cotizador />
      ) : contextData.rol === "userfres" ? (
        <CotizadorFres />
      ) : (
        <CotizadorAdmin />
      )}
    </>
  );
};

export default InicioCotizador;
