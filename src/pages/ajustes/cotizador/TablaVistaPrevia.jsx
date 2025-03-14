import React from "react";
import "./tablavistaprevia.css";

const TablaVistaPrevia = (props) => {
  console.log(props);

  return (
    <>
      <div className="contenedor-vista-previa">
        <table className="table table-bordered head-fixed">
          <thead>
            <tr>
              <th>#</th>
              <th>Familia</th>
              <th>Margen</th>
              <th>Sucursal</th>
            </tr>
          </thead>
          <tbody className="=table-group-divider">
            {props.data.map((margenes, i) => (
              <tr >
                <td>{i + 1}</td>
                <td>{margenes.familia}</td>
                <td>{margenes.margen}</td>
                <td>{margenes.sucursal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TablaVistaPrevia;
