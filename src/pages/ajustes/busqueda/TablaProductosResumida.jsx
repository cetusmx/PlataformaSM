import React, { useEffect, useState } from "react";
import Axios from "axios";

const TablaProductosResumida = () => {
  const [productos, setProductos] = useState([]);
  const urlServidorAPI = "http://18.224.118.226:3002";

  useEffect(() => {
    getProductos();
  }, []);

  const getProductos = async () => {
    await Axios.get(urlServidorAPI + `/api/v1/productos`).then((response) => {
      setProductos(response.data.body);
      console.log(response.data.body);
    });
  };
  return (
    <div>
      {productos?.length > 0 && (
        <table
          className="table table-striped"
          style={{ padding: "3px", autoHeight: true, fontSize: "0.8rem" }}
        >
          <thead>
            <tr style={{ padding: "3px" }}>
              <th scope="col">Clave</th>
              <th scope="col">Descripción</th>
              <th scope="col">Línea</th>
              <th scope="col">Perfil</th>
              <th scope="col">Clave ant.</th>
              <th scope="col">Fecha actualización</th>
            </tr>
          </thead>
          <tbody>
            {productos
              .map((val, key) => {
                return (
                  <tr key={val.clave}>
                    <td>{val.clave}</td>
                    <td>{val.descripcion}</td>
                    <td>{val.linea}</td>
                    <td>{val.perfil}</td>
                    <td>{val.claveanterior}</td>
                    <td>{val.createdAt}</td>
                  </tr>
                );
              })
              .slice(0, 9)}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TablaProductosResumida;
