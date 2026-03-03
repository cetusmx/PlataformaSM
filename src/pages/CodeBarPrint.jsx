import React, { useState } from "react";
import Barcode from "react-barcode";
import Logo from "../assets/Logo20.jpeg"

const CodeBarPrint = (props) => {
  return (
    <>
      {props.partidas.map((val, key) => {
        return (
          <div 
            key={key} 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              pageBreakInside: "avoid",
              marginBottom: "2px" // Un pequeño margen para separar en vista previa
            }}
          >
            <img src={Logo} alt="Logo SM" width={"45px"} style={{ marginRight: "10px" }} />
            {val.soloTexto ? (
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "left", overflow: "hidden" }}>
                <span style={{ fontWeight: "500", fontSize: "11pt", lineHeight: "1.1", whiteSpace: "nowrap" }}>{val.clave}</span>
                <span style={{ 
                  fontSize: "7pt", 
                  lineHeight: "1.1", 
                  marginTop: "7px", 
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "180px",
                  display: "block"
                }}>{val.descripcion}</span>
              </div>
            ) : (
              val.barcode
            )}
          </div>
        );
      })}
    </>
  );
};

export default CodeBarPrint;
