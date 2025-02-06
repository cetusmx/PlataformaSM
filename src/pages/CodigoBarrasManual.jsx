import React, { useState } from "react";
import "../styles/codigobarrasmanual.css";
import { BiTrash } from "react-icons/bi";
import Barcode from "react-barcode";
import CodeBarPrint from "./CodeBarPrint";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const CodigoBarrasManual = () => {
  const [partidas, setPartidas] = useState([]);
  const [partidasPrint, setPartidasPrint] = useState([]);
  const [qty, setQty] = useState("1");
  const [value, setValue] = useState("");

  const componentRef = useRef();

  const ref = useRef();

  const agregarPartida = () => {
    const partida = [
      {
        cantidad: qty,
        clave: value,
        barcode: <Barcode width={1} height={40} ref={ref} value={value} />,
      },
    ];

    const partidasImpresion = partidas.concat(partida);

    setPartidas(partidasImpresion);

    setQty("1");
    setValue("");

    let partidasImpre = [];
    if (partidasPrint.length > 0) {
      partidasImpre = [...partidasPrint];
    }

    for (let j = 0; j < qty; j++) {
      let partidaImp = {
        id: j,
        cantidad: qty,
        clave: value,
        barcode: <Barcode width={1} height={35} ref={ref} value={value} />,
      };

      partidasImpre.push(partidaImp);
      console.log(j);
    }
    setPartidasPrint(partidasImpre);
    //console.log(partidasImpre);
  };

  const borrar = (item) => {
    const resultado = partidas.filter(
      (partida) => partida.clave !== item.clave
    );
    setPartidas(resultado);
    setPartidasPrint(updatePrintables(resultado));
    console.log(resultado);
  };

  const updatePrintables = (resultado) => {
    let temp = [];

    for (let i=0; i < resultado.length; i++) {

      for(let j=0; j < resultado.cantidad; j++){
        temp.push(resultado.barcode);
      }
  }
}

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <>
      <div className="wrapper">
        <div className="encabezado">
          {/* <h6>Generar códigos de barras</h6> */}
        </div>
        <div className="captura">
          <div className="formulario">
            <div className="cantidad">
              <label for="exampleFormControlInput1">Cantidad</label>
              <input
                value={qty}
                onChange={(event) => {
                  setQty(event.target.value);
                }}
                type="text"
                class="form-control"
                id="exampleFormControlInput1"
                placeholder="Ingrese cantidad"
                style={{ width: "160px" }}
              ></input>
            </div>
            <div className="claveProd">
              <label for="exampleFormControlInput1">Clave producto</label>
              <input
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                }}
                type="text"
                class="form-control"
                id="exampleFormControlInput1"
                placeholder="Ingrese clave producto"
              ></input>
            </div>
            <div class="div-boton">
              <button
                style={{ width: "100%" }}
                type="button"
                class="btn btn-primary"
                onClick={agregarPartida}
              >
                Agregar
              </button>
            </div>
          </div>
          <div className="tablaProds">
            {partidas?.length > 0 && (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Cant</th>
                    <th scope="col">Clave</th>
                    {/* <th scope="col">Código de barras</th> */}
                  </tr>
                </thead>
                <tbody>
                  {partidas.map((val) => {
                    return (
                      <tr>
                        <td>{val.cantidad}</td>
                        <td>{val.clave}</td>
                        {/* <td>{val.barcode}</td> */}
                        <td>
                          <div
                            className="btn-group"
                            role="group"
                            aria-label="Basic example"
                          >
                            <BiTrash
                              className="icon"
                              onClick={() => borrar(val)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {partidas?.length > 0 && (
          <div className="codigosBarras">
            <div className="codesHeader">
              <h6>Vista previa</h6>
            </div>
            <div className="contenedorEtiquetas">
              <div ref={componentRef}>
                <CodeBarPrint partidas={partidasPrint} />
              </div>
            </div>
            {partidas?.length > 0 && (
              <div className="div-boton-generar">
                <button
                  id="boton-print"
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handlePrint}
                >
                  Imprimir códigos
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CodigoBarrasManual;
