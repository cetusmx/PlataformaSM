import React from "react";
import { BiTrash } from "react-icons/bi";

const LogisticaTable = ({ partidas, onBorrar }) => {
  return (
    <div className="tablaProds logistica-table">
      <table className="table table-striped">
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #dedede", borderLeft: "none", borderTop: "none", width: "15%" }} scope="col">Cant</th>
            <th style={{ borderBottom: "1px solid #dedede", borderLeft: "none", borderTop: "none", width: "35%" }} scope="col">Clave</th>
            <th style={{ borderBottom: "1px solid #dedede", borderLeft: "none", borderTop: "none", width: "35%" }} scope="col">Descripción</th>
            <th style={{ borderBottom: "1px solid #dedede", borderLeft: "none", borderTop: "none", width: "15%" }} scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {partidas.map((val) => (
            <tr key={val.id}>
              <td style={{ border: "none", textAlign: "center" }}>{val.cantidad}</td>
              <td style={{ border: "none", textAlign: "center" }}>{val.clave}</td>
              <td style={{ border: "none", textAlign: "left", fontSize: "0.7rem" }}>{val.descripcion}</td>
              <td style={{ border: "none", textAlign: "center" }}>
                <div className="btn-group" role="group" aria-label="Basic example">
                  <BiTrash className="icon" onClick={() => onBorrar(val)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogisticaTable;
