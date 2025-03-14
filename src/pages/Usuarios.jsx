import React, { useContext } from "react";
import "../styles/usuarios.css";
import EnConstruccion from "./EnConstruccion";
import { Link } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { DataContext } from "../contexts/dataContext";
import { MenuAjustesContext } from "../contexts/context-menu-ajustes";

const Usuarios = () => {
  /* const {posicionMenu, setPosicionMenu} = useContext(MenuAjustesContext);

  const { valor3 } = useContext(DataContext);
  const { contextAdminNav, setContextAdminNav } = valor3; */

  const porcentaje = 75;
  return (
    <>
      <div className="container-usuarios">
        {/* <div className="regresar">
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
        <div className="enConstruccion">
          <EnConstruccion percentage={porcentaje} />
        </div>
      </div>
    </>
  );
};

export default Usuarios;
