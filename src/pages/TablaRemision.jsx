import React from 'react'

const TablaRemision = (records) => {
  return (
    <div className="row">
          <div className="col-2"></div>
          <div className="col-8">
            <div
              className="row"
              style={{ fontSize: "0.9rem", paddingTop: "10px" }}
            >
              <div className="col-12">
                <table
                  className="table table-striped"
                  style={{ padding: "3px", autoHeight: true }}
                >
                  <thead>
                    <tr style={{ padding: "3px" }}>
                      <th scope="col">Cant</th>
                      <th scope="col">Clave</th>
                      <th scope="col">P. Unit.</th>
                      <th scope="col">Total</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((val, key) => {
                      return (
                        <tr key={val.id}>
                          {/* <th scope="col"></th> */}
                          <td>{val.id}</td>
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
                                  /* deleteEmpleado(val); */
                                }}
                                className="btn btn-danger"
                                style={{
                                  fontSize: "0.9rem",
                                  padding: "3px 5px 3px 5px",
                                }}
                              >
                                Eliminar
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
          <div className="col-2"></div>
        </div>
  )
}

export default TablaRemision