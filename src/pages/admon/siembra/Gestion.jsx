import React, { useContext } from "react";
import { MenuAjustesContext } from "../../../contexts/context-menu-ajustes";
import { BiArrowBack } from "react-icons/bi";
import Solicitudes from "./Solicitudes";

const Gestion = () => {
  /* const { posicionMenu, setPosicionMenu } = useContext(MenuAjustesContext); */

  return (
    <>
      <div className="contenedor-columnas1">
        <div className="columnaIzquierda">
          <div className="row-col-izq-up">
            
          </div>
        </div>
        <div className="columnaDerecha1">
          <div
            style={{ width: "73%", marginRight: "2%", fontSize: "1.2rem" }}
          ></div>
          {/* <div className="divRegresar">
            
            <button
              onClick={() => {
                setPosicionMenu("");
              }}
              className="item"
            >
              <BiArrowBack />
              Regresar
            </button>
            
          </div> */}
        </div>
      </div>
      <div style={{paddingTop: "15px"}}>
        <Solicitudes />
      </div>
    </>
  );
};

export default Gestion;
