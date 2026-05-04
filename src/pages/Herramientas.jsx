import React, { useState, useContext } from 'react'
import { BiPackage, BiDollar, BiSearch, BiBarcode } from "react-icons/bi";
import { DataContext } from "../contexts/dataContext";
import { MenuAjustesContext } from "../contexts/context-menu-ajustes";
import HerramCodigoBarras from './HerramCodigoBarras';
import SubmenuCodBarras from './SubmenuCodBarras';

const course = [
    {
      title: "Códigos barras",
      icon: <BiBarcode />,
    },
    ];

    const Herramientas = () => {
    const { posicionMenu, setPosicionMenu } = useContext(MenuAjustesContext);

    const { valor3 } = useContext(DataContext);
    const { contextAdminNav, setContextAdminNav } = valor3;

    const [opcionDeMenu, setOpcionDeMenu] = useState("");

    //console.log("PosicionMenu=>" + posicionMenu);

    /* const[opcion, setOpcion] = useState(""); */

    const toggleDiv = (e) => {
    setPosicionMenu(e.target.value);
    /* setContextAdminNav(e.target.value); */
    //console.log(e.target.value);
    };

    return (
    <>
    {posicionMenu === "" ? (
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
        ) : (
          <SubmenuCodBarras />
        )}
    </>
    );
    };

export default Herramientas