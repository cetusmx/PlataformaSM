import React, { useEffect, useState, Fragment } from "react";
import Axios from "axios";
import "./solicitudes.css";
import Swal from "sweetalert2";

const Solicitudes = () => {
  const [state, setState] = useState(0);
  const [data, setData] = useState([]);
  const [estatus, setEstatus] = useState("");
  const urlServidorAPI = "https://sealmarket.net/api1";

  useEffect(() => {
    // Agrega opciones al Select cuando carga la página por primera vez
    getSolicitudes();
    console.log("Dentro UseEffect");
  }, []);

  const getSolicitudes = () => {
    Axios.get(urlServidorAPI + "/getSolSiembra").then((response) => {
      setData(response.data);
    });
  };

  const handleClick = (index) => {
    const updatedState = data[index]; //Aquí se guarda toda la fila
    //console.log(updatedState);
    
    if (updatedState.other) {
      delete updatedState.other;
      setState((pre) => {
        return pre + 1;
      });
    } else {
      updatedState.other = {
        description: "Hello there", //or data from api
      };
      setState((pre) => {
        return pre + 1;
      });
    }
  };

  const guardar = (row) => {
    console.log("Dentro de guardar");
    console.log(row);

    /* Axios.put(urlServidorAPI + "/updateSiembraProds", {
      fecha: row.fecha,
      clave: row.clave,
      familia: row.familia,
      sucursal: row.sucursal,
      /* cargo: cargo,
      anios: anios, 
    }).then(() => {
        Swal.fire({
        title: "<strong>Actualización exitosa</strong>",
        html:
          "<i>El empleado <strong>" +
           +
          "</strong> fue actualizado exitósamente</i>",
        icon: "success",
        timer: 3000,
      });
    }); */
  };

  return (
    <div className="contenedor-principal">
      <table class="table">
        <thead class="table-light">
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Clave</th>
            <th scope="col">Familia</th>
            <th scope="col">Sucursal</th>
            <th scope="col">Estatus</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <Fragment key={row.clave}>
              <tr 
              style={{ cursor: "pointer" }}
              onClick={() => handleClick(index)}
              >
                <td>
                  {row.fecha.slice(0, 10)}
                </td>
                <td>
                  {row.clave}
                </td>
                <td>
                  {row.familia}
                </td>
                <td>
                  {row.sucursal}
                </td>
                <td>
                  {row.estatus}
                </td>
              </tr>
              {row.other ? (
                <tr>
                  <td colSpan={5}>
                    <div className="formulario1">
                      <form>
                        <div className="row">
                          <div className="col">
                            <div class="form-group st">
                              <label for="exampleFormControlInput1">
                                Veces vendido
                              </label>
                              <input
                                disabled="true"
                                value={row.veces}
                                type="text"
                                class="form-control fontSize"
                                id="exampleFormControlInput1"
                              ></input>
                            </div>
                          </div>
                          <div className="col">
                            <div class="form-group st">
                              <label for="exampleFormControlInput2">
                                Máximo sugerido
                              </label>
                              <input
                                disabled="true"
                                value={row.maximo}
                                type="text"
                                class="form-control"
                                id="exampleFormControlInput2"
                              ></input>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col">
                            <div class="form-group st">
                              <label for="exampleFormControlInput2">
                                Motivo
                              </label>
                              <input
                                disabled="true"
                                value={row.motivo}
                                type="text"
                                class="form-control"
                                id="exampleFormControlInput2"
                              ></input>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col">
                            <div class="form-group st">
                              <label for="exampleFormControlTextarea1">
                                Observaciones
                              </label>
                              <textarea
                                value={row.observaciones}
                                class="form-control"
                                id="exampleFormControlTextarea1"
                                rows="2"
                                disabled="true"
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                    <div className="formulario2">
                      <form>
                        <div className="row">
                          <div className="col">
                            <div class="form-group st">
                              <label for="exampleFormControlSelect1">
                                Autorización
                              </label>
                              <select
                                /* value={veces}
                                defaultValue={"DEFAULT"}
                                onChange={(event) => {
                                setVeces(event.target.value);
                                }}  */
                                class="form-control"
                              >
                                <option value="DEFAULT">
                                  {row.autorizacion}
                                </option>
                                <option>Autorizada</option>
                                <option>Rechazada</option>
                              </select>
                            </div>
                          </div>
                          <div className="col">
                            <div class="form-group st">
                              <label for="exampleFormControlInput1">
                                Máximo
                              </label>
                              <input
                                /* value={row.veces} */
                                type="number"
                                class="form-control fontSize"
                                id="exampleFormControlInput11"
                              ></input>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col">
                            <div class="form-group st">
                              <label for="exampleFormControlTextarea1">
                                Observaciones
                              </label>
                              <textarea
                                /* value={row.observaciones} */
                                class="form-control"
                                id="exampleFormControlTextarea1"
                                rows="3"
                              ></textarea>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col">
                            <div class="form-group st">
                              <button type="button" class="btn btn-primary" onClick={guardar(row)}>
                                Guardar
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </td>
                </tr>
              ) : null}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Solicitudes;
