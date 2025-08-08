import React from "react";
import TableSection from "./TableSection";
import "../buscadorUI.css";

const Table = ({ productos }) => {
  return (
    <table className="table" style={{ fontSize: "0.8rem" }}>
      <thead className="table-light">
        <th style={{width:"5%"}}  className="td-center-buscadorUI" ></th>
        <th style={{width:"8%"}}  className="td-center-buscadorUI" ></th>
        <th style={{width:"19%"}}  className="td-center-buscadorUI">Clave</th>
        <th style={{width:"8%"}}  className="td-center-buscadorUI">Línea</th>
        <th style={{width:"12%"}}  className="td-center-buscadorUI">Diám. interior</th>
        <th style={{width:"12%"}}  className="td-center-buscadorUI">Diám. exterior</th>
        <th style={{width:"12%"}}  className="td-center-buscadorUI">Altura</th>
        <th style={{width:"12%"}}  className="td-center-buscadorUI">Marca</th>
        <th style={{width:"12%"}}  className="td-center-buscadorUI">Perfil</th>
      </thead>
      {productos
        .map((producto, index) => (
          <TableSection producto={producto} index={index} />
        ))
        .slice(0, 100)}
    </table>
  );
};

export default Table;
