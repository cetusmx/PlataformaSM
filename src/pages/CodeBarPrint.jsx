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
              marginBottom: "2px", // Un pequeño margen para separar en vista previa
              minHeight: "75px",
              fontSize: "0.9rem",
              /* border: "1px solid #dde6ed",
              marginLeft: "-5px",
              marginRight: "-5px" */
            }}
          >
            <img src={Logo} alt="Logo SM" width={"45px"} style={{ marginRight: "10px" }} />
            {val.soloTexto ? (
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "left", overflow: "hidden" }}>
                <span style={{ fontWeight: "600", fontSize: "12pt", lineHeight: "1.1", whiteSpace: "nowrap" }}>{val.clave}</span>
                <span style={{ 
                  fontWeight: "500",
                  fontSize: "7pt", 
                  lineHeight: "1.1", 
                  marginTop: "7px", 
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  /* textOverflow: "ellipsis", */
                  maxWidth: "200px",
                  display: "block"
                }}>{val.descripcion}</span>
              </div>
            ) : (
              <span style={{fontSize: "0.5rem"}}>
                {val.barcode}
              </span>
              
            )}
          </div>
        );
      })}
    </>
  );
};

export default CodeBarPrint;
