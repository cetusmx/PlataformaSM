import React from "react";
import logo from "../../../assets/Logo20.jpeg";
import { getImageURL } from "../../../utils/image-util";

const TablaResultadosBusqueda = ({ clave, linea, di, de, al, syr, lc }) => {
  const link = "../../../../public/" + linea + ".jpg";
  return (
    <>
      <div className="card mb-3" style={{ width: "100%", fontSize: "0.8rem" }}>
        <div className="row g-0">
          <div className="col-md-1 mt-1 mb-1 ml-1">
            <img
              /* src={getImageURL(link)} */
              src={`${process.env.PUBLIC_URL}/${linea}.jpg`}
              /* src={require(getImageURL(link))} */
              alt="logo"
              className="img-fluid rounded-start imagen-busqueda"
            />
          </div>
          <div className="col-md-10">
            <div className="card-body">
              <div className="datos-vista-previa">
                <div className="campos-vista-previa">
                  <h7>Clave</h7>
                  <h7 className="titulo-tabla-resultados">{clave}</h7>
                </div>
                <div className="campos-vista-previa">
                  <h7>Línea</h7>
                  <h7 className="titulo-tabla-resultados">{linea}</h7>
                </div>
                <div className="campos-vista-previa">
                  <h7>Diámetro interior</h7>
                  <h7 className="titulo-tabla-resultados">{di}</h7>
                </div>
                <div className="campos-vista-previa">
                  <h7>Diámetro exterior</h7>
                  <h7 className="titulo-tabla-resultados">{de}</h7>
                </div>
                <div className="campos-vista-previa">
                  <h7>Altura</h7>
                  <h7 className="titulo-tabla-resultados">{al}</h7>
                </div>
                <div className="campos-vista-previa">
                  <h7>Clave LC</h7>
                  <h7 className="titulo-tabla-resultados">{syr}</h7>
                </div>
                <div className="campos-vista-previa">
                  <h7>Clave SYR</h7>
                  <h7 className="titulo-tabla-resultados">{lc}</h7>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TablaResultadosBusqueda;
