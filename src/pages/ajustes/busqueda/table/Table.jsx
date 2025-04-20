import React from "react";
import TableSection from "./TableSection";
import "../buscadorUI.css";

const Table = ({ productos }) => {
  return (
    <table className="table" style={{ fontSize: "0.9rem" }}>
      <thead className="table-light">
        <td></td>
        <td></td>
        <th className="td-center-buscadorUI">Clave</th>
        <th className="td-center-buscadorUI">Línea</th>
        <th className="td-center-buscadorUI">Diám. interior</th>
        <th className="td-center-buscadorUI">Diám. exterior</th>
        <th className="td-center-buscadorUI">Altura</th>
        <th className="td-center-buscadorUI">Marca</th>
        <th className="td-center-buscadorUI">Perfil</th>
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
