import React, { useContext } from "react";
import { BiArrowBack } from "react-icons/bi";
import { DataContext } from "../contexts/dataContext";
import EnConstruccion from "./EnConstruccion";
import "../styles/ajustescotizador.css";
import Editamars from "./Editamars";
import { MenuAjustesContext } from "../contexts/context-menu-ajustes";
import Remision from "./Remision";

const HerramListaPrecios = () => {

    const {posicionMenu, setPosicionMenu} = useContext(MenuAjustesContext);

  return (
    <>
    <div className="container-ajustesCot">
      <div className="contenedor-columnas1">
          <div className="columnaIzquierda">
            <div className="row-col-izq-up"></div>
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
          <Remision />
        }
        
      </div>
    </>
  )
}

export default HerramListaPrecios