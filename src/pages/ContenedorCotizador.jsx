import React from "react";
import MenuAjustesContextProvider from "../contexts/context-menu-ajustes";
import InicioCotizador from "./InicioCotizador";

const ContenedorCotizador = () => {
  return (
    <>
      <MenuAjustesContextProvider>
        <InicioCotizador />
      </MenuAjustesContextProvider>
    </>
  );
};

export default ContenedorCotizador;
