import React from "react";
import {
  BiBookAlt,
  BiCalculator,
  BiLogOut,
  BiDollar
} from "react-icons/bi";
import "../styles/sidebar.css";
import { getAuth, signOut } from "firebase/auth";

const SidebarSop = () => {

  const logout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log("salió");
      })
      .catch((error) => {
        // An error happened.
      });
  };

  return (
    <div className="menu">
      <div className="logo">
        <BiBookAlt className="logo-icon" />
        <h4 style={{padding:0}}>Seal Market</h4>
      </div>

      <div className="menu--list">
        <a href="#" className="item">
          <BiCalculator className="icon" />
          Cotizador
        </a>
        <a href="#" className="item">
          <BiDollar className="icon" />
          Precios
        </a>
        <button className="item" onClick={logout}>
          <BiLogOut className="icon"/>
          Salir
        </button>
      </div>
    </div>
  );
};

export default SidebarSop;
