import React, { useContext } from "react";
import { BiNotification, BiSearch, BiMap, BiUser } from "react-icons/bi";
import { DataContext } from "../contexts/dataContext";

const ContentHeader = () => {
  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;
  const {contextsideBarNav, setContextSidebarNav} = valor2;
  /* console.log("AppAdmin: " + contextData.uid);
  console.log("AppAdmin=> navegacion: " + contextsideBarNav.page); */

  const infoUsuario = contextData;
  //console.log("ContentHeader=> " + contextData.rol);
  //console.log("ContentHeader=> infoUsuario " + infoUsuario.sucursal);
  console.log("ContentHeader=> contextsideBarNav " + contextsideBarNav);

  const nombre = () => {
    const correoUser = infoUsuario.email;

    let arri = correoUser.split("@");
            let usuarioCorreo = arri[0];
            return usuarioCorreo;
  }

  return (
    <div className="content--header">
      <h4 className="header--title">{contextsideBarNav}</h4>
      <div className="header--activity">
        <div className="search-box">
          <input type="text" placeholder="Buscar" />
          <BiSearch className="icon" />
        </div>
        <div className="notify">
          <BiNotification className="icon" />
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
