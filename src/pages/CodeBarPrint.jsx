import React, { useState } from "react";
import Barcode from "react-barcode";
import Logo from "../assets/Logo20.jpeg"

const CodeBarPrint = (props) => {

  //console.log(props);

  /* props.partidas.map((elemento) => {
    //console.log(elemento.id);
    }); */
  
  return (
    <>
      {props.partidas.map((val, key) => {
        return (
          <div><img src={Logo} alt="Logo SM" width={"45px"} />{val.barcode}</div>
        );
      })}
    </>
  );
};

export default CodeBarPrint;
