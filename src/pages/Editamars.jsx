import { useState, useEffect } from "react";
import Axios from "axios";



export const Editamars = () => {

    const [margenes, setMargenes] = useState([]);

    useEffect(() => {
        // Agrega opciones al Select cuando carga la página por primera vez
        getMargenes();
        console.log("Dentro UseEffect");
      }, []);


    const getMargenes = () => {
        Axios.get("https://servcotiza.onrender.com/margenes").then((response) => {
            setMargenes(response.data);
        });
      };


  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">Familia</th>
                  <th scope="col">Margen</th>
                </tr>
              </thead>
              <tbody>
                {margenes.map((val, key) => {
                  return (
                    <tr key={val.id}>
                      <th scope="row">{val.id}</th>
                      <td>{val.familia}</td>
                      <td>{val.margen}</td>
                      <td>
                        <div
                          className="btn-group"
                          role="group"
                          aria-label="Basic example"
                        >
                          <button
                            type="button"
                           /*  onClick={() => {
                              editarEmpleado(val);
                            }} */
                            className="btn btn-info"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            /* onClick={() => {
                              deleteEmpleado(val);
                            }} */
                            className="btn btn-danger"
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
          <div className="col"></div>
          <div className="col"></div>
        </div>
      </div>
    </>
  );
};
