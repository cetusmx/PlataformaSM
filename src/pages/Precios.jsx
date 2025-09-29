import React, { useState, useContext, useEffect } from "react";
import Axios from "axios";
import { DataContext } from "../contexts/dataContext";
import "../styles/precios.css";

const Precios = () => {
  useEffect(() => {
    // Agrega opciones al Select cuando carga la página por primera vez
    getPrecios();
    console.log("Dentro UseEffect Precios");
  }, []);

  const divStyle = {
    fontSize: "blue",

    backgroundColor: "lightgray",
  };

  const [preciosList, setPreciosList] = useState([]);
  const [records, setRecords] = useState([]);

  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;
  const { contextsideBarNav, setContextSidebarNav } = valor2;
  const infoUsuario = contextData;

  let getPrecios = () => {
    Axios.get(`https://sealmarket.net/api1/precios/getprecios`, {
      params: {
        sucursal: infoUsuario.sucursal,
      },
    }).then((response) => {
      setPreciosList(response.data);
      setRecords(response.data);
      console.log(response.data);
    });
  };

  const Filter = (event) => {
    setRecords(
      preciosList.filter((f) =>
        f.clave.toUpperCase().includes(event.target.value)
      )
    );
  };

  return (
    <>
      {/* <div>Precios</div> */}
      <div className="preciosDiv">
        <h6>Consulta precios</h6>
        <div className="row">
          <div className="col-2"></div>
          <div className="col-8"></div>
        </div>
        <div className="row">
          <div className="col-1"></div>
          <div className="col-3">
            <input
              type="text"
              className="form-control"
              /* className="form-control" */
              onChange={Filter}
              placeholder="Buscar clave"
            />
          </div>
          <div className="col-3">
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon1">
                  $
                </span>
              </div>
              <input
                type="text"
                class="form-control"
                aria-label="Username"
                aria-describedby="basic-addon1"
              />
            </div>
          </div>
        </div>
        <div className="row" style={{ fontSize: "0.9rem", paddingTop: "10px" }}>
          <div className="col-1"></div>
          <div className="col-6">
            <table
              className="table table-striped"
              style={{ padding: "3px", autoHeight: true }}
            >
              <thead>
                <tr style={{ padding: "3px" }}>
                  <th scope="col">Sel</th>
                  <th scope="col">Clave</th>
                  <th scope="col">Precio</th>
                  <th scope="col">Precio c/IVA</th>
                </tr>
              </thead>
              <tbody>
                {records.map((val, key) => {
                  return (
                    <tr key={val.id}>
                      <th scope="col">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="allSelect"
                          /* onChange = {handleChange} */
                        />
                      </th>
                      <td>{val.clave}</td>
                      <td>{val.precio}</td>
                      <td>{val.precioIVA}</td>
                      <td>
                        <div
                          className="btn-group"
                          role="group"
                          aria-label="Basic example"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              /* editarEmpleado(val); */
                            }}
                            className="btn btn-info"
                            style={{
                              fontSize: "0.9rem",
                              padding: "3px 5px 3px 5px",
                            }}
                          >
                            Agregar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Precios;
