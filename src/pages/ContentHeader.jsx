import React, { useContext } from "react";
import { BiNotification, BiSearch, BiMap, BiUser, BiCalendar } from "react-icons/bi";
import { DataContext } from "../contexts/dataContext";

const ContentHeader = () => {
  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;
  const {contextsideBarNav, setContextSidebarNav} = valor2;
  /* console.log("AppAdmin: " + contextData.uid);
  console.log("AppAdmin=> navegacion: " + contextsideBarNav.page); */
  const fecha = Date.now();
  const hoy = new Date(fecha);

  const infoUsuario = contextData;
  console.log("ContentHeader=> contextsideBarNav " + contextsideBarNav);

  const nombre = () => {
    const correoUser = infoUsuario.email;

    let arri = correoUser.split("@");
            let usuarioCorreo = arri[0];
            return usuarioCorreo;
  }

  return (
    <div className="content--header">
      <div style={{alignItems:"center", fontSize: "1.4rem"}}>{contextsideBarNav}</div>
      <div className="header--activity">

        <div className="fecha">
          <BiCalendar className="icon1" />
          <div className="cont-fecha"><h7>{hoy.toLocaleDateString()}</h7></div>
        </div>
        <div className="ubicacion">
          <BiMap className="icon1" />
          <h7>{infoUsuario.sucursal}</h7>
        </div>
        <div className="user">
          <BiUser className="icon1"  />
          <h7>{nombre()}</h7>
        </div>
      </div>
    </div>
  );
};

export default ContentHeader;
