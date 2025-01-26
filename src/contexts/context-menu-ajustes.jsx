import React, { createContext, useState } from "react";

export const MenuAjustesContext = createContext();

export default function MenuAjustesContextProvider(props) {
    const [posicionMenu, setPosicionMenu] = useState("");

  return (
    <MenuAjustesContext.Provider value={{ posicionMenu, setPosicionMenu}}>
    {props.children}
    </MenuAjustesContext.Provider>
  )
}
/* export default function MenuAjustesContextProvider({Children}) {
    const [posicionMenu, setPosicionMenu] = useState("");

  return (
    <MenuAjustesContext.Provider value={{ posicionMenu, setPosicionMenu}}>
    {Children}
    </MenuAjustesContext.Provider>
  )
}
 */