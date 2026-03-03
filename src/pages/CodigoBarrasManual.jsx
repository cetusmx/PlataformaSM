import React, { useState, useEffect, useContext } from "react";
import "../styles/codigobarrasmanual.css";
import { BiTrash, BiBarcode } from "react-icons/bi";
import Barcode from "react-barcode";
import CodeBarPrint from "./CodeBarPrint";
import { DataContext } from "../contexts/dataContext";
import Axios from "axios";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const CodigoBarrasManual = () => {

  useEffect(() => {
  const cerrarDropdown = () => setSugerencias([]);
  window.addEventListener('click', cerrarDropdown);
  return () => window.removeEventListener('click', cerrarDropdown);
}, []);

  const url = "http://75.119.150.222:3010";
  const [preciosList, setPreciosList] = useState([]);
  const [partidas, setPartidas] = useState([]);
  const [partidasPrint, setPartidasPrint] = useState([]);
  const [qty, setQty] = useState("1");
  const [value, setValue] = useState("");
  const [clavesxLote, setClavesxLote] = useState("");

  const [totalCab, setTotalCab] = useState("0");
  const [price, setPrice] = useState("0");
  const [sugerencias, setSugerencias] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [soloTexto, setSoloTexto] = useState(false);
  const [activeTab, setActiveTab] = useState("barcode");

  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;
  const infoUsuario = contextData;

  const componentRef = useRef();

  const ref = useRef();

  let getPrecios = () => {
    Axios.get(url + `/precios/getprecios/`, {
      params: {
        sucursal: infoUsuario.sucursal,
      },
    }).then((response) => {
      setPreciosList(response.data);
      console.log(response.data);
    });
  };

  const handleChange = async (e) => {
    const texto = e.target.value;
    setValue(texto);
    const API_URL = "https://sistemahidraulico.mx/api-externa/clavesalternas/buscar";
    const API_KEY = "sm_ecommerce_x2ve9yFf0aiDxh1HelezpVeyRAcngGwgEg3ZnSZwhGg2SaZrd2gQiysiVo86R3LcUZFFxZDSMADepof1jMLSumIbiqBRcbjyhvA78haaxnLrrbOuU3zqCi0kQXJf1gSc";


    if (texto.length > 4) { // Solo busca si hay más de 2 letras
      try {
        const res = await Axios.get(API_URL, {
          params: { q: texto },
          headers: { 'x-api-key': API_KEY }
        });
        setSugerencias(res.data);
      } catch (err) {
        console.error("Error buscando sugerencias", err);
      }
    } else {
      setSugerencias([]);
    }
  };

  const agregarPartida = () => {
    const modoSoloTexto = activeTab === "text";
    const uniqueId = Date.now();
    
    const nuevaPartida = {
      id: uniqueId,
      cantidad: qty,
      clave: value,
      descripcion: descripcion,
      soloTexto: modoSoloTexto,
      barcode: !modoSoloTexto ? <Barcode width={1} height={40} ref={ref} value={value} /> : null,
    };

    setPartidas([...partidas, nuevaPartida]);

    let partidasImpre = [...partidasPrint];
    for (let j = 0; j < parseInt(qty); j++) {
      partidasImpre.push({
        ...nuevaPartida,
        id: `${uniqueId}-${j}`,
        barcode: !modoSoloTexto ? (
          <Barcode width={1} height={35} ref={ref} value={value} />
        ) : null,
      });
    }
    setPartidasPrint(partidasImpre);

    // Limpiar campos
    setQty("1");
    setValue("");
    setDescripcion("");
  };

  const borrar = (item) => {
    setPartidas(partidas.filter((p) => p.id !== item.id));
    setPartidasPrint(partidasPrint.filter((p) => p.id.toString().split('-')[0] !== item.id.toString()));
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
          <div className="btn-group-custom mb-3" role="group">
            <button
              type="button"
              className={`btn ${activeTab === "barcode" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setActiveTab("barcode")}
            >
              Con Código
            </button>
            <button
              type="button"
              className={`btn ${activeTab === "text" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setActiveTab("text")}
            >
              Solo Texto
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "barcode" && (
              <div className="formulario">
                <div className="cantidad">
                  <label for="exampleFormControlInput1">Cantidad etiquetas</label>
                  <input
                    value={qty}
                    onChange={(event) => {
                      setQty(event.target.value);
                    }}
                    type="text"
                    className="form-control"
                    id="exampleFormControlInput1"
                    placeholder="Ingrese cantidad"
                    style={{ width: "160px" }}
                  ></input>
                </div>
                <div className="claveProd">
                  <label for="exampleFormControlInput1">Clave producto</label>
                  <input
                    value={value}
                    onChange={handleChange}
                    type="text"
                    className="form-control"
                    id="exampleFormControlInput1"
                    placeholder="Ingrese clave producto"
                  />
                  {sugerencias.length > 0 && (
                    <div className="dropdown">
                      {sugerencias.map((item) => (
                        <div
                          key={item.CLAVE}
                          className="dropdown-row"
                          onClick={() => {
                            onSearch(item.CLAVE);
                            setValue(item.CLAVE);
                            setDescripcion(item.DESCRIPCION || "");
                            setSugerencias([]);
                          }}
                        >
                          <div className="suggestion-clave">{item.CLAVE}</div>
                          <div className="suggestion-descr">{item.DESCRIPCION}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="div-boton">
                  <button
                    style={{ width: "100%" }}
                    type="button"
                    className="btn btn-primary"
                    onClick={agregarPartida}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}
            {activeTab === "text" && (
              <div className="formulario">
                <div className="cantidad" style={{ marginRight: "10px" }}>
                  <label style={{ fontSize: "1rem" }}># Etiq.</label>
                  <input
                    value={qty}
                    onChange={(event) => setQty(event.target.value)}
                    type="text"
                    className="form-control"
                    style={{ width: "60px" }}
                  />
                </div>
                <div className="claveProd" style={{ marginRight: "10px", position: "relative" }}>
                  <label style={{ fontSize: "1rem" }}>Clave</label>
                  <input
                    value={value}
                    onChange={handleChange}
                    type="text"
                    className="form-control"
                    style={{ width: "170px" }}
                  />
                  {sugerencias.length > 0 && (
                    <div className="dropdown" style={{ width: "250px" }}>
                      {sugerencias.map((item) => (
                        <div
                          key={item.CLAVE}
                          className="dropdown-row"
                          onClick={() => {
                            onSearch(item.CLAVE);
                            setValue(item.CLAVE);
                            setDescripcion(item.DESCRIPCION || "");
                            setSugerencias([]);
                          }}
                        >
                          <div className="suggestion-clave">{item.CLAVE}</div>
                          <div className="suggestion-descr">{item.DESCRIPCION}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="descripcion" style={{ marginRight: "10px" }}>
                  <label style={{ fontSize: "0.8rem" }}>Descripción</label>
                  <input
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    type="text"
                    className="form-control"
                    style={{ width: "220px" }}
                  />
                </div>
                <div className="div-boton">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={agregarPartida}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="tablaProds">
            {partidas?.length > 0 && (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #dedede", borderLeft: "none", borderTop: "none", width: "15%" }} scope="col">Cant</th>
                    <th style={{ borderBottom: "1px solid #dedede", borderLeft: "none", borderTop: "none", width: "35%" }} scope="col">Clave</th>
                    <th style={{ borderBottom: "1px solid #dedede", borderLeft: "none", borderTop: "none", width: "35%" }} scope="col">Descripción</th>
                    <th style={{ borderBottom: "1px solid #dedede", borderLeft: "none", borderTop: "none", width: "15%" }} scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  {partidas.map((val, index) => {
                    return (
                      <tr key={index}>
                        <td style={{ border: "none", textAlign: "center" }}>{val.cantidad}</td>
                        <td style={{ border: "none", textAlign: "center" }}>{val.clave}</td>
                        <td style={{ border: "none", textAlign: "left", fontSize: "0.7rem" }}>{val.descripcion}</td>
                        <td style={{ border: "none", textAlign: "center" }}>
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

      <div className="modal" id="myModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Agregar claves por lote</h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              <h6>Agregue las claves, una en cada fila</h6>
              <textarea
                onChange={(e) => setClavesxLote(e.target.value)}
                name="claves"
                id="claves"
                className="form-control"
                rows={10}
              ></textarea>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => agregarLote()}
                type="button"
                className="btn btn-primary"
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
