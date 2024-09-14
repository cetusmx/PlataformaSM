import React from "react";
import { Nav } from "../components/Nav";

import firebaseApp from "../firebase/credenciales";
import { getAuth, signOut } from "firebase/auth";

const auth = getAuth(firebaseApp);

export const HomePage = ({user}) => {
  return (
    <>
      <Nav />
      <div>HomePage</div>
      {
      user.rol === "admin" 
      ? "Vista de Administrador  Rol: " +user.rol+ " Correo: "+ user.email +" Sucursal: " + user.sucursal 
      : user.rol === "soporte1" 
        ? "Vista de Soporte1  Rol: " +user.rol+ " Correo: "+ user.email +" Sucursal: " + user.sucursal 
        : "Vista de user1"}
      <div>
      <button onClick={()=> signOut(auth)}>Cerrar Sesión</button>
      </div>
    </>
  );
};
