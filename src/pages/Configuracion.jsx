import React from "react";
import Inicio from "./Inicio";
import MenuAjustesContextProvider from "../contexts/context-menu-ajustes";

const Configuracion = () => {
  return (
    <>
      <MenuAjustesContextProvider>
        <Inicio />
      </MenuAjustesContextProvider>
    </>
  );
};

export default Configuracion;
