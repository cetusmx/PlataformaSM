import React, { useState, useContext } from "react";
import { BiSlider, BiDollar, BiGroup } from "react-icons/bi";
import Editamars from "./Editamars";
import Precios from "./Precios";
import Usuarios from "./Usuarios";
import AjustesCotizador from "./AjustesCotizador";
import AjustesPrecios from "./AjustesPrecios";
import { DataContext } from "../contexts/dataContext";
import { MenuAjustesContext } from "../contexts/context-menu-ajustes";


const course = [
  {
    title: "Usuarios",
    icon: <BiGroup />,
  },
  {
    title: "Ajustes Cotizador",
    icon: <BiSlider />,
  },
  {
    title: "Ajustes Precios",
    icon: <BiDollar />,
  },
];

const Inicio = () => {
  const { posicionMenu, setPosicionMenu } = useContext(MenuAjustesContext);

  const { valor3 } = useContext(DataContext);
  const { contextAdminNav, setContextAdminNav } = valor3;

  const [opcionDeMenu, setOpcionDeMenu] = useState("");

  console.log("PosicionMenu=>" + posicionMenu);

  /* const[opcion, setOpcion] = useState(""); */

  const toggleDiv = (e) => {
    setPosicionMenu(e.target.value);
    /* setContextAdminNav(e.target.value); */
    console.log(e.target.value);
  };

  return (
    <>
     
        {/* {contextAdminNav==="" ? ( */}
        {/* {opcionDeMenu==="" ? ( */}
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
        ) : posicionMenu === "Ajustes Cotizador" ? (
          <AjustesCotizador />
        ) : posicionMenu === "Ajustes Precios" ? (
          <AjustesPrecios />
        ) : (
          <Usuarios />
        )}
    </>
  );
};
export default Inicio;
