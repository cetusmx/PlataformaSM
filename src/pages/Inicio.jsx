import React, { useState, useContext } from "react";
import {
 BiSlider,
  BiDollar,
  BiGroup,
} from "react-icons/bi";
import Editamars from "./Editamars";
import Precios from "./Precios";
import Usuarios from "./Usuarios";
import AjustesCotizador from "./AjustesCotizador";
import AjustesPrecios from "./AjustesPrecios";
import { DataContext } from "../contexts/dataContext";

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

  const { valor3 } = useContext(DataContext);
  const { contextAdminNav, setContextAdminNav } = valor3;

  console.log(contextAdminNav);

  /* const[opcion, setOpcion] = useState(""); */

  const toggleDiv = (e) => {
    /* (e.target.value==="Usuarios")
    ? <Usuarios />
    : (e.target.value==="Ajustes Cotizador")
      ? <Editamars />
      : <AjusPrecios />
 */
      setContextAdminNav(e.target.value);
    console.log(e.target.value);
  }

  return (
    <>
    {contextAdminNav==="" ? (
      
    <div className="cardM--container">
      {course.map((item) => (
        <div className="cardM" >
          <div className="cardM--cover">{item.icon}</div>
          <div className="cardM--title">
            <button onClick={toggleDiv} value={item.title} className="button-admin">{item.title}</button>
          </div>
        </div>
      ))}
    </div>
    ) 
    : contextAdminNav==="Ajustes Cotizador"
      ? <AjustesCotizador />
      : contextAdminNav==="Ajustes Precios"
        ? <AjustesPrecios />
        : <Usuarios />
  }
  </>
  );
};
export default Inicio;
