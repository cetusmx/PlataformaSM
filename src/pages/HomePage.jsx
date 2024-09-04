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
      <button onClick={()=> signOut(auth)}>Cerrar Sesión</button>

      {user.rol === "admin" ? "Vista de Administrador: " + user.email : "Vista de usuario"}
      
    </>
  );
};
