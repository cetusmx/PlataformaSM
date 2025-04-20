import React, { Fragment, useState, useEffect } from "react";

const TablaResultadosBusqueda = ({ datos }) => {
  //console.log(data);
  const [claveLocal, setClaveLocal] = useState("");
  const [state, setState] = useState(0);
  const [data, setData] = useState([datos]);
  console.log(datos);

  useEffect(() => {
    // Agrega opciones al Select cuando carga la página por primera vez
  }, []);

  console.log(data);

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

  return (
    <>
      <div className="contenedor-principal">
        <table class="table">
          {/* <thead class="table-light">
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Clave</th>
            <th scope="col">Familia</th>
            <th scope="col">Sucursal</th>
            <th scope="col">Estatus</th>
          </tr>
        </thead> */}
          <tbody>
            {data.map((row, index) => (
              <Fragment key={row.clave}>
                <tr
                  style={{ cursor: "pointer" }}
                  onClick={() => handleClick(index)}
                >
                  <td>
                    {/* <img
                      src={`${process.env.PUBLIC_URL}/${row.linea}.jpg`}
                      alt="logo"
                      className="img-fluid rounded-start imagen-busqueda"
                    /> */}
                  </td>
                  <td>{row.clave}</td>
                  <td>{row.diametrointerior}</td>
                  <td>{row.diametroexterior}</td>
                  <td>{row.altura}</td>
                  <td>{row.claveanterior}</td>
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
                                <select class="form-control">
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
                                <button type="button" class="btn btn-primary">
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
      {/* <div
        className="card mb-2"
        style={{
          width: "100%",
          fontSize: "0.8rem",
          paddingRight: "1%",
        }}
      >
        <div className="row g-0">
          <div className="col-md-12">
            <div>
              {/* <div className="datos-vista-previa">
                <div className="campos-vista-previa col-md-1">
                  <img
                    src={`${process.env.PUBLIC_URL}/${linea}.jpg`}
                    alt="logo"
                    className="img-fluid rounded-start imagen-busqueda"
                  />
                </div>
                <div className="campos-vista-previa col-md-2">
                  <h7>Clave</h7>
                  <h7 className="titulo-tabla-resultados">{clave}</h7>
                </div>
                <div className="campos-vista-previa col-md-1">
                  <h7>Diám. int.</h7>
                  <h7 className="titulo-tabla-resultados">{di}</h7>
                </div>
                <div className="campos-vista-previa col-md-1">
                  <h7>Diám. ext.</h7>
                  <h7 className="titulo-tabla-resultados">{de}</h7>
                </div>
                <div className="campos-vista-previa col-md-1">
                  <h7>Altura</h7>
                  <h7 className="titulo-tabla-resultados">{al}</h7>
                </div>
                <div className="campos-vista-previa col-md-2">
                  <h7>Clave LC</h7>
                  <h7 className="titulo-tabla-resultados">{syr}</h7>
                </div>
                <div className="campos-vista-previa col-md-2">
                  <h7>Clave SYR</h7>
                  <h7 className="titulo-tabla-resultados">{lc}</h7>
                </div>
                <div className="campos-vista-previa col-md-1">
                  <button
                    id="boton-print"
                    type="button"
                    className="btn btn-outline-secondary"
                    style={{
                      fontSize: "0.6rem",
                    }}
                    data-bs-toggle="modal"
                    data-bs-target="#modalMostrarMas"
                    onChange={guardaClave}
                  >
                    Ver más
                  </button>
                </div>
              </div> */}
      {/*</div>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default TablaResultadosBusqueda;
