import React from "react";
import FilaCards from "./FilaCards";

const List = ({ productos, prodsPerRow }) => {
  //console.log(productos);
  const prodsxfila = prodsPerRow;
  const fila = [];

  for (var i = 0; i < productos.length; i++) {
    const temp = [];
    let indice = i;
    for (var j = 0; j < prodsxfila; j++) {
      indice = i + j;
      if (indice < productos.length) {
        temp.push(productos[indice]);
      }
    }
    i = indice;
    fila.push(temp);
  }
  //console.log(fila);

  return (
    <>
      {fila.map((elemento) => <FilaCards filaProds={elemento} />).slice(0, 50)}
    </>
  );
};

export default List;
