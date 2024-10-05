import React, { useContext } from "react";
import "../styles/usuarios.css";
import EnConstruccion from "./EnConstruccion";
import { Link } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { DataContext } from "../contexts/dataContext";

const Usuarios = () => {
  const { valor3 } = useContext(DataContext);
  const { contextAdminNav, setContextAdminNav } = valor3;

  const porcentaje = 75;
  return (
    <>
      <div className="container-usuarios">
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
  );
};

export default Usuarios;
