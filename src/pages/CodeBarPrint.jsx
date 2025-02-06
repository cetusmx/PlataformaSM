import React, { useState } from "react";
import Barcode from "react-barcode";

const CodeBarPrint = (props) => {

  //console.log(props);

  /* props.partidas.map((elemento) => {
    //console.log(elemento.id);
    }); */
  
  return (
    <>
      {props.partidas.map((val, key) => {
        return (
          <div>{val.barcode}</div>
        );
      })}
    </>
  );
};

export default CodeBarPrint;
