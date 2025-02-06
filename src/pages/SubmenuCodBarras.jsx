import React, { useState, useContext } from "react";
import {
  BiDollar,
  BiSearch,
  BiPackage,
  BiBarcode,
  BiFile,
  BiArrowBack,
} from "react-icons/bi";
import { BsKeyboard } from "react-icons/bs";
import CodigoBarras from "./CodigoBarras";
import { MenuAjustesContext } from "../contexts/context-menu-ajustes";
import CodigoBarrasManual from "./CodigoBarrasManual";

const course = [
  {
    title: "Utilizar archivo XML",
    icon: <BiFile />,
  },
  {
    title: "Capturar claves",
    icon: <BsKeyboard />,
  },
];

const SubmenuCodBarras = () => {
  const { posicionMenu, setPosicionMenu } = useContext(MenuAjustesContext);

  console.log("PosicionMenuSubMenu=>" + posicionMenu);

  const toggleDiv = (e) => {
    setPosicionMenu(e.target.value);
    /* setContextAdminNav(e.target.value); */
    //console.log(e.target.value);
  };

  return (
    <>

      <div className="contenedor-columnas1">
        <div className="columnaIzquierda">
          <div className="row-col-izq-up">
            <h5>Códigos de barras</h5>
          </div>
        </div>
        <div className="columnaDerecha1">
          <div
            style={{ width: "73%", marginRight: "2%", fontSize: "1.2rem" }}
          ></div>
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

      {posicionMenu === "Códigos barras" ? (
        <div className="cardM--container">
          {course.map((item) => (
            <div className="cardM">
              <div className="cardM--cover">{item.icon}</div>
              <div className="cardM--title">
                <button
                  onClick={toggleDiv}
                  value={item.title}
                  className="button-admin"
                >
                  {item.title}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : posicionMenu === "Utilizar archivo XML" ? (
        <CodigoBarras />
      ) : posicionMenu === "Capturar claves" ? (
        <CodigoBarrasManual />
      ) : (
        <div></div>
      )}
    </>
  );
};

export default SubmenuCodBarras;
