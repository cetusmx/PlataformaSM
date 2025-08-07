import React from "react";

const TableRow = ({ producto }) => {
  return (
    <tr style={{border:"none", background: "#27769eff", padding:"10px", borderRadius: "10px"}}>
      <td colSpan={10}>
        <div
          className="div-appears"
          /* style={{
            width: "100%",
            paddingLeft: "5%",
            paddingRight: "5%",
            paddingTop: "10px",
            background: "#f7f9fa",
            paddingBottom: "10px",
            borderRadius: "10px",
          }} */
        >
          <table style={{borderRadius:"5px", border:"none"}} className="table">
            <thead style={{ fontWeight: "400" }}>
              <th
                className="td-center-buscadorUI"
                style={{ fontSize: "0.8rem", fontWeight: "500" }}
              >
                Perfil
              </th>
              <th
                className="td-center-buscadorUI"
                style={{ fontSize: "0.8rem", fontWeight: "500" }}
              >
                Clave fabricante
              </th>
              <th
                className="td-center-buscadorUI"
                style={{ fontSize: "0.8rem", fontWeight: "500" }}
              >
                Clave SYR
              </th>
              <th
                className="td-center-buscadorUI"
                style={{ fontSize: "0.8rem", fontWeight: "500" }}
              >
                Clave LC
              </th>
              <th
                className="td-center-buscadorUI"
                style={{ fontSize: "0.8rem", fontWeight: "500" }}
              >
                Clave anterior
              </th>
            </thead>
            <tbody>
              <tr>
                <td className="td-center-buscadorUI">{producto.perfil}</td>
                <td className="td-center-buscadorUI">
                  {producto.clavefabricante}
                </td>
                <td className="td-center-buscadorUI">
                  {producto.clavesellosyr}
                </td>
                <td className="td-center-buscadorUI">
                  {producto.clavelacapital}
                </td>
                <td className="td-center-buscadorUI">
                  {producto.claveanterior}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
};

export default TableRow;
