import React from "react";
import Inicio from "./Inicio";
import MenuAjustesContextProvider from "../contexts/context-menu-ajustes";
import Herramientas from "./Herramientas";

const MenuHerramientas = () => {
    
  return (
    <>
      <MenuAjustesContextProvider>
        <Herramientas />
      </MenuAjustesContextProvider>
    </>
  )
}

export default MenuHerramientas