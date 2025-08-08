import React, { useState, useEffect, useContext } from "react";
import "../styles/codigobarrasmanual.css";
import { BiTrash } from "react-icons/bi";
import Barcode from "react-barcode";
import CodeBarPrint from "./CodeBarPrint";
import { DataContext } from "../contexts/dataContext";
import Axios from "axios";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const CodigoBarrasManual = () => {
  useEffect(() => {
    // Agrega opciones al Select cuando carga la página por primera vez
    getPrecios();
    console.log("Dentro UseEffect Precios");
  }, []);

  const url = "https://sealmarket.net/api1";
  const [preciosList, setPreciosList] = useState([]);
  const [partidas, setPartidas] = useState([]);
  const [partidasPrint, setPartidasPrint] = useState([]);
  const [qty, setQty] = useState("1");
  const [value, setValue] = useState("");
  const [clavesxLote, setClavesxLote] = useState("");

  const [totalCab, setTotalCab] = useState("0");
  const [price, setPrice] = useState("0");

  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;
  const infoUsuario = contextData;

  const componentRef = useRef();

  const ref = useRef();

  let getPrecios = () => {
    Axios.get(url + `/getprecios/`, {
      params: {
        sucursal: infoUsuario.sucursal,
      },
    }).then((response) => {
      setPreciosList(response.data);
      console.log(response.data);
    });
  };

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
        barcode: (
          <Barcode width={1} height={35} ref={ref} value={value} />
        ) /** height previo : 35 */,
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

    const resultado2 = partidasPrint.filter(
      (partida) => partida.clave !== item.clave
    );
    setPartidasPrint(resultado2);
    //console.log(resultado);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const agregarLote = () => {
    var lines = clavesxLote.split("\n");
    //console.log(lines);
    let loteTemp = [];

    for (var i = 0; i < lines.length; i++) {
      //code here using lines[i] which will give you each line
      const partida = [
        {
          cantidad: "1",
          clave: lines[i],
          barcode: (
            <Barcode width={1} height={35} ref={ref} value={lines[i]} />
          ) /* width: 0.8, height: 32 */,
        },
      ];

      loteTemp = loteTemp.concat(partida);
    }
    console.log(loteTemp);
    setPartidas(loteTemp);
    setPartidasPrint(loteTemp);
    //console.log(clavesxLote);
  };

  const onChange = (event) => {
    setValue(event.target.value); //Se coloca el valor en el input "Clave prod"

    /* Aquí puedo implementar la búsqueda en el arreglo general */
  };

  const onSearch = (searchTerm) => {
    //console.log(searchTerm);
    setValue(searchTerm); //Se coloca el valor en el input "Clave prod"
    const filtrado = preciosList.find((item) =>
      item.clave.toUpperCase().includes(searchTerm.toUpperCase())
    );
    /* const filtrado = preciosList.filter((item) =>
      item.clave.toUpperCase().includes(searchTerm.toUpperCase())
    ); */
    console.log(filtrado);
    const precio_ = filtrado.precio;
    /* const precio_ = filtrado.map((item) => item.precio); */
    const totalInp = qty * precio_;
    setTotalCab(totalInp);
    setPrice(precio_);
  };

  return (
    <>
      <div className="wrapper">
        <div className="encabezado-cb">
          <h6>Herramienta para la generación de códigos de barras</h6>
          <p style={{ fontSize: "0.8rem" }}>
            Ingrese la cantidad de etiquetas que desee imprimir y la clave del
            producto.
          </p>
        </div>
        <div className="captura">
          <div className="formulario">
            <div className="cantidad">
              <label for="exampleFormControlInput1">Cantidad etiquetas</label>
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
                onChange={onChange}
                type="text"
                class="form-control"
                id="exampleFormControlInput1"
                placeholder="Ingrese clave producto"
              />
              <div className="dropdown">
                {preciosList
                  .filter((item) => {
                    const searchTerm = value.toLowerCase();
                    const clave = item.clave.toLowerCase();

                    return (
                      searchTerm &&
                      clave.startsWith(searchTerm) &&
                      clave !== searchTerm
                    );
                  })
                  .slice(0, 10)
                  .map((item) => (
                    <div
                      onClick={() => onSearch(item.clave)}
                      className="dropdown-row"
                      key={item.clave}
                    >
                      {item.clave}
                    </div>
                  ))}
              </div>
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
                    <th style={{borderBottom: "1px solid #dedede", borderLeft: "none", borderTop:"none", width: "25%"}} scope="col">Cant</th>
                    <th style={{borderBottom: "1px solid #dedede", borderLeft: "none", borderTop:"none", width: "40%"}} scope="col">Clave</th>
                    <th style={{borderBottom: "1px solid #dedede", borderLeft: "none", borderTop:"none", width: "25%"}} scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  {partidas.map((val) => {
                    return (
                      <tr>
                        <td style={{border: "none", textAlign: "center"}}>{val.cantidad}</td>
                        <td style={{border: "none", textAlign: "center"}}>{val.clave}</td>
                        {/* <td>{val.barcode}</td> */}
                        <td style={{border: "none", textAlign: "center"}}>
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
          <div className="div-boton-generar">
            <button
              id="boton-print"
              type="button"
              className="btn btn-outline-secondary"
              data-bs-toggle="modal"
              data-bs-target="#myModal"
            >
              Por Lote
            </button>
          </div>
        </div>

        {partidas?.length > 0 && (
          <div className="codigosBarras">
            <div className="codesHeader">
              <h6>Vista previa</h6>
            </div>
            <div className="contenedorEtiquetas2">
              <div className="codebars" ref={componentRef}>
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

      <div class="modal" id="myModal">
        <div class="modal-dialog">
          <div class="modal-content">
            {/* <!-- Modal Header --> */}
            <div class="modal-header">
              <h4 class="modal-title">Agregar claves por lote</h4>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            {/* <!-- Modal body --> */}
            <div class="modal-body">
              <h6>Agregue las claves, una en cada fila</h6>
              <textarea
                onChange={(e) => setClavesxLote(e.target.value)}
                name="claves"
                id="claves"
                class="form-control"
                rows={10}
              ></textarea>
            </div>

            {/* <!-- Modal footer --> */}
            <div class="modal-footer">
              <button
                onClick={() => agregarLote()}
                type="button"
                class="btn btn-primary"
                data-bs-dismiss="modal"
              >
                Agregar
              </button>
              <button
                id="btnCerrar"
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CodigoBarrasManual;
