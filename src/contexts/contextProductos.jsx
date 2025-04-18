import React, { createContext, useState } from "react";

export const ProductosContext = createContext();

export default function ProductosContextProvider(props) {
  const [productosCont, setProductosCont] = useState([]);

  return (
    <ProductosContext.Provider value={{ productosCont, setProductosCont }}>
      {props.children}
    </ProductosContext.Provider>
  );
}
