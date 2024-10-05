import React, { useContext } from "react";
import { BiArrowBack } from "react-icons/bi";
import { DataContext } from "../contexts/dataContext";
import EnConstruccion from "./EnConstruccion";
import "../styles/ajustescotizador.css";

const AjustesCotizador = () => {

    const { valor3 } = useContext(DataContext);
  const { contextAdminNav, setContextAdminNav } = valor3;
    const porcentaje = 75;

  return (
  <>
    <div className="container-ajustesCot">
        <div className="regresar">
          <button
            onClick={() => {
              setContextAdminNav("");
            }}
            className="item"
          >
            <BiArrowBack />
            Regresar
          </button>
        </div>
        <div className="enConstruccion">
          <EnConstruccion percentage={porcentaje} />
        </div>
      </div>
    </>
  )
}

export default AjustesCotizador