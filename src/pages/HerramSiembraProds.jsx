import React, { useContext } from "react";
import { BiArrowBack } from "react-icons/bi";
import "../styles/herramsiembraprods.css";
import { MenuAjustesContext } from "../contexts/context-menu-ajustes";
import SiembraProds from "./SiembraProds";

const HerramSiembraProds = () => {

    const {posicionMenu, setPosicionMenu} = useContext(MenuAjustesContext);

  return (
    <>
    <div className="container-ajustesCot">
      <div className="contenedor-columnas1">
          <div className="columnaIzquierda">
            <div className="row-col-izq-up"><h5>Siembra de productos</h5></div>
          </div>
          <div className="columnaDerecha1">
            <div
                style={{ width: "73%", marginRight: "2%", fontSize: "1.2rem" }}
              >
              </div>
            <div className="divRegresar">
              {/* <div className="regresar"> */}
              <button
                onClick={() => {
                  setPosicionMenu("");
                }}
                className="item"
              >
                <BiArrowBack />
                Regresar
              </button>
              {/* </div> */}
            </div>
          </div>
        </div>
        {
          <SiembraProds />
        }
        
      </div>
    </>
  )
}

export default HerramSiembraProds