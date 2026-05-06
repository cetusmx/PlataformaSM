import React from "react";
import Barcode from "react-barcode";
import Logo from "../assets/Logo20.jpeg"

const CodeBarPrint = (props) => {
  return (
    <div style={{ width: "100%" }}>
      {props.partidas.map((val, key) => {
        // Rediseño Etiqueta Logística Compleja
        if (val.isLogistica) {
          return (
            <div key={val.id} className="etiqueta-logistica">
              {/* Mitad Superior (Fila Desc-Logo y Fila 5-Datos) */}
              <div className="logistica-superior-container">
                {/* Fila 0: Clave */}
                <div className="fila-clave">
                  <div className="col-clave-label">{val.clave || "S/C"}</div>
                  <div className="col-cantidad">
                    <strong>Cant</strong>
                    <span>{val.cantidad || "1"}</span>
                  </div>
                </div>

                {/* Fila 1: Descripción 75% | Logo 25% */}
                <div className="fila-desc-logo">
                  <div className="col-descripcion">
                    <strong>Descripción</strong>
                    <span>{(val.descripcion || "SIN DESCRIPCIÓN").substring(0, 60)}</span>
                  </div>
                  {/* <div className="col-logo">
                    <img src={Logo} alt="Logo SM" width={"100%"} style={{ maxWidth: "40px" }} />
                  </div> */}
                </div>

                {/* Fila 2: 5 Columnas de Datos */}
                <div className="fila-cinco-datos">
                  {/* <div className="dato-logistico-item">
                    <strong>CANT</strong>
                    <span>{val.cantidad}</span>
                  </div> */}
                  <div className="dato-logistico-item">
                    <strong>LIN</strong>
                    <span>{val.linea}</span>
                  </div>
                  <div className="dato-logistico-item">
                    <strong>SEC</strong>
                    <span>{val.seccion || "-"}</span>
                  </div>
                  <div className="dato-logistico-item">
                    <strong>SUC</strong>
                    <span>{val.sucursal}</span>
                  </div>
                  <div className="dato-logistico-item">
                    <strong>ORI</strong>
                    <span>{val.origen || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Mitad Inferior: Código de Barras Completo */}
              <div className="logistica-inferior-barcode">
                <div className="barcode-container">
                <Barcode 
                  value={val.clave}
                  width={1.2}
                  height={60}
                  fontSize={10}
                  margin={0}
                  displayValue={false}
                />
                </div>
                {/* <div className="fecha-hora">{new Date().toLocaleString()}</div> */}
              </div>
            </div>
          );
        }

        // Diseño original para otros tipos de etiquetas
        return (
          <div 
            key={val.id} 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              pageBreakInside: "avoid",
              marginBottom: "5px",
              minHeight: "75px",
              fontSize: "0.9rem"
              /* borderBottom: "1px dashed #eee" */
            }}
          >
            <img src={Logo} alt="Logo SM" width={"45px"} style={{ marginRight: "10px" }} />
            {val.soloTexto ? (
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "left", overflow: "hidden" }}>
                <span style={{ fontWeight: "600", fontSize: "12pt", lineHeight: "1.1", whiteSpace: "nowrap" }}>{val.clave}</span>
                <span style={{ 
                  fontWeight: "500",
                  fontSize: "10pt", 
                  lineHeight: "1.1", 
                  marginTop: "5px", 
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
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
    </div>
  );
};

export default CodeBarPrint;
