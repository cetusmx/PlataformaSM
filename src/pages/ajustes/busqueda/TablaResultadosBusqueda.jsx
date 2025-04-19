import React, { useState } from "react";
import MasDetallesCard from "./MasDetallesCard";

const TablaResultadosBusqueda = ({ clave, linea, di, de, al, syr, lc }) => {
  const [claveLocal, setClaveLocal] = useState("");

  const guardaClave = () => {
    setClaveLocal(clave);
    console.log(claveLocal);
  };

  return (
    <>
      <div
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
              <div className="datos-vista-previa">
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
                {/* <div className="campos-vista-previa">
                  <h7>Línea</h7>
                  <h7 className="titulo-tabla-resultados">{linea}</h7>
                </div> */}
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
                      /*width: "100%",
                      marginBottom: "-5px",
                      marginTop: "-5px",*/
                      fontSize: "0.6rem",
                    }}
                    data-bs-toggle="modal"
                    data-bs-target="#modalMostrarMas"
                    onChange={guardaClave}
                  >
                    Ver más
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/**** MODAL SUBIDA ARCHIVO ******/}
      <div id="modalMostrarMas" className="modal fade" aria-hidden="false">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body">
              <div className="container-fluid">
                <div className="row">
                  <MasDetallesCard clave={clave} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                id="btnCerrar"
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TablaResultadosBusqueda;
