import React from "react";

const TablaPreciosSubida = (props) => {
  console.log("Datos en tabla subida");
  console.log(props.listaPrecios);
  let listaPrecios = props.listaPrecios;

  return (
    <>
      <div>TablaPreciosSubida</div>
      <div>
        {listaPrecios?.length > 0 && (
          <table
            className="table table-striped"
            style={{ padding: "3px", autoHeight: true, fontSize: "0.8rem" }}
          >
            <thead>
              <tr style={{ padding: "3px" }}>
                <th scope="col">Clave</th>
                <th scope="col">Precio</th>
                <th scope="col">Precio c/IVA</th>
              </tr>
            </thead>
            <tbody>
              {listaPrecios.map((val, key) => {
                return (
                  <tr key={val.clave}>
                    <td>{val.clave}</td>
                    <td>{val.precio}</td>
                    <td>{val.precioIVA}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default TablaPreciosSubida;
