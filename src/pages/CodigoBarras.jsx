import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Axios from "axios";
import "../styles/codigobarras.css";
import { BiXCircle } from "react-icons/bi";
import Swal from "sweetalert2";

import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Barcode from "react-barcode";
import { useReactToPrint } from "react-to-print";
import CodeBarPrint from "./CodeBarPrint";

const CodigoBarras = () => {
  const urlServidorAPI = "http://18.224.118.226:3001";
  const [xmlContent, setXmlContent] = useState("");
  const [error, setError] = useState("");
  const [listaProductos, setListaProductos] = useState([]);
  const [productosComprados, setProductosComprados] = useState([]);
  const [rfc, setRfc] = useState("");
  const [nombreProveedor, setNombreProveedor] = useState("");
  const [folioFactura, setFolioFactura] = useState("");
  const [clavesProveedor, setClavesProveedor] = useState([]);
  const [clavesunificadas, setClavesunificadas] = useState([]);
  const [isFileUploaded, setIsFileUploaded] = useState(true);
  const [mostrarCargaArchivo, setMostrarCargaArchivo] = useState(true);
  const [existeProductoEnFactura, setExisteProductoEnFactura] = useState(false);

  const [productosRecepcionados, setProductosRecepcionados] = useState([]);
  const [productoEscaneado, setProductoEscaneado] = useState([]);
  const [partidasPrint, setPartidasPrint] = useState([]);

  const ref = useRef();
  const componentRef = useRef();

  const renderTooltip = (props) => (
    <Tooltip {...props}>Da clic para generar código de barras</Tooltip>
  );

  useEffect(() => {
    getClaves();
  }, [rfc]);
  
  useEffect(() => {
    if(partidasPrint.length !== 0){
    handlePrint();
    }
  }, [partidasPrint]);

  useEffect(() => {
    unificaClaves();
  }, [clavesProveedor]);

  const myinput = useRef();

  const inputFocus = () => {
    myinput.current.focus();
  };

  let unificaClaves = () => {
    let temp = [];
    listaProductos.forEach((e, i) => {
      const result = clavesProveedor.find(
        (claveProv) => claveProv.claveprovedor === e.producto
      );
      e.clave = result.clave;

      let partida = {
        cantidad: e.cantidad,
        producto: e.producto,
        clave: result.clave,
      };
      temp.push(partida);
    });
    setClavesunificadas(temp);
  };
  let getClaves = () => {
    if (listaProductos.length > 0) {
      Axios.get(urlServidorAPI + `/getclaves`, {
        params: {
          /* productos: listaProductos, */
          rfc: rfc,
        },
      }).then((response) => {
        setClavesProveedor(response.data);
      });
    }
  };

  const handleFileUpload = (e) => {
    //console.log("inside handle");
    setIsFileUploaded(false);
    const file = e.target.files[0];

    if (!file) {
      setError("No se seleccionó archivo.");
      return;
    }

    if (!file.name.endsWith(".xml")) {
      setError("Suba un archivo XML válido.");
      return;
    }

    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      setXmlContent(event.target.result);
    };

    reader.onerror = () => {
      setError("Error al leer el archivo.");
    };

    reader.readAsText(file);
  };

  const showDatos = () => {
    //xmlDocument
    var namespace = "http://www.sat.gob.mx/cfd/4";
    var parser = new DOMParser();
    var xml = parser.parseFromString(xmlContent, "text/xml");
    var producto = xml.getElementsByTagNameNS(namespace, "Concepto");
    var emisor = xml.getElementsByTagNameNS(namespace, "Emisor");
    var comprobante = xml.getElementsByTagNameNS(namespace, "Comprobante");
    let productos = new Array();

    for (let j = 0; j < producto.length; j++) {
      const canti = producto[j].getAttribute("Cantidad");
      const noId = producto[j].getAttribute("NoIdentificacion");
      let partida = { cantidad: canti, producto: noId, clave: "" };
      productos.push(partida);
    }
    setListaProductos(productos);

    for (let i = 0; i < emisor.length; i++) {
      setRfc(emisor[i].getAttribute("Rfc"));
      setNombreProveedor(emisor[i].getAttribute("Nombre"));
    }

    for (let i = 0; i < comprobante.length; i++) {
      setFolioFactura(comprobante[i].getAttribute("Folio"));
    }
    setMostrarCargaArchivo(false);
  };

  const cancelar = () => {
    setMostrarCargaArchivo(true);
    setIsFileUploaded(true);
    setClavesunificadas([]);
    setProductosRecepcionados([]);
  };

  const handlerFunction = (e) => {
    console.log(e.target.value);

    e.preventDefault();
    /* if(){
      setExisteProductoEnFactura(true);
      console.log("existe");
    }else{
      setExisteProductoEnFactura(false);
      console.log("no existe");
    } */

    //setExisteProductoEnFactura(true);
    /* console.log("inside handler");*/
    //console.log(e.key);
    console.log(existeProductoEnFactura);

    if (
      e.key === "Enter" &&
      typeof clavesunificadas.find(
        (claveProv) => claveProv.clave === e.target.value
      ) !== "undefined"
    ) {
      console.log("inside if key");
      console.log(productoEscaneado);
      let temporal = clavesunificadas.find(
        (claveProv) => claveProv.clave === e.target.value
      );
      const cant = temporal.cantidad;

      Swal.fire({
        /* title: "<strong>Producto</strong>", */
        html:
          "<p><i>Cantidad: <strong>" +
          cant +
          "</strong></i></p>" +
          "<p><i>Producto: <strong>" +
          e.target.value +
          "</strong></i></p>" +
          "<p style='font-size: 30px;'>¿Es correcto?</p>",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí",
      }).then((res) => {
        if (res.isConfirmed) {
          let tempClavesunificadas = clavesunificadas.filter(
            (product) => product.clave !== e.target.value
          );
          setClavesunificadas(tempClavesunificadas);

          if (productosRecepcionados.length === 0) {
            let temp = clavesunificadas.find(
              (claveProv) => claveProv.clave === e.target.value
            );
            const recep = [];
            recep.push(temp);
            setProductosRecepcionados(recep);
            console.log(recep);
          } else {
            let copyRecepcionados = structuredClone(productosRecepcionados);
            let temp = clavesunificadas.find(
              (claveProv) => claveProv.clave === e.target.value
            );
            copyRecepcionados.push(temp);
            setProductosRecepcionados(copyRecepcionados);
            //console.log(copyRecepcionados);
          }
          //setProductoEscaneado("");

          const newArray = listaProductos.filter(
            (item, index) => item.clave !== e.target.value
          );

          setListaProductos(newArray);
          inputFocus();
        }
      });
    } else {
      inputFocus();
      console.log("Dentro else");
      Swal.fire({
        title: "<strong>Hubo un problema</strong>",
        html:
          "<i>El producto <strong>" +
          e.target.value +
          "</strong> no aparece en la factura. </i>",
        icon: "error",
        /* timer: 3000, */
      });
    }
  };

  const printCodeBar = (val) => {
    let cla = val.clave;
    const partida = [
      {
        cantidad: "1",
        clave: cla,
        barcode: <Barcode width={1} height={30} ref={ref} value={cla} />,
      },
    ];

    setPartidasPrint(partida);

    //handlePrint(partida);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  /* const openModal = (op, cantidad, producto, clave) => {
    window.setTimeout(function () {
      //document.getElementById("dgo").focus();
    }, 500);
  }; */

  return (
    <>
      <div className="wrapperCB">
        <div className="encabezadoCB">
          {mostrarCargaArchivo ? (
            <div className="carga-archivo">
              <div className="instrucciones">
                Elija el archivo .xml de la factura que desea recepcionar.
                </div>           
              <div style={{fontSize:"0.8rem"}} className="encabezado-izquierdoCB">
                <div class="input-group">
                  <input
                    type="file"
                    accept=".xml"
                    class="form-control"
                    id="inputGroupFile04"
                    aria-describedby="inputGroupFileAddon04"
                    aria-label="Upload"
                    onChange={(e) => {
                      handleFileUpload(e);
                    }}
                  />
                  <button
                    onClick={showDatos}
                    class="btn btn-outline-secondary"
                    type="button"
                    id="inputGroupFileAddon04"
                  >
                    Subir
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="subencabezado">
              <div className="proveedor-info">
                <h6>Proveedor: {nombreProveedor}</h6>
                <h6>Factura: {folioFactura}</h6>
              </div>
              <div className="divRegresarCB">
                <button
                  onClick={() => {
                    cancelar();
                  }}
                  className="itemCB"
                >
                  <BiXCircle />
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
        {clavesunificadas.length > 0 || productosRecepcionados.length > 0 ? (
          <div className="contenedor-raizCB">
            <div className="columna-izquierdaCB">
              <div className="contenedor-inferior">
                <div className="mensaje">
                  <div className="item-1">Productos facturados</div>
                </div>
                <div className="boton-accion"></div>
              </div>

              {clavesunificadas.length > 0 ? (
                <div className="contenedor">
                  <div className="table-scroll">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th style={{ textAlign: "center" }} scope="col">
                            Cantidad
                          </th>
                          <th scope="col">Clave Proveedor</th>
                          <th scope="col">Clave</th>
                          <th scope="col"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {clavesunificadas.map((val, key) => {
                          return (
                            <tr key={val.id}>
                              <td
                                className="td-table-cb"
                                style={{ textAlign: "center" }}
                              >
                                {val.cantidad}
                              </td>
                              <td className="td-table-cb">{val.producto}</td>
                              <td className="td-table-cb">{val.clave}</td>
                              <td className="td-table-cb">
                                <OverlayTrigger
                                  placement="top"
                                  overlay={renderTooltip}
                                >
                                  <button
                                    onClick={() => printCodeBar(val)}
                                    className="btn btn-outline-secondary boton-tb-cb"
                                  >
                                    <i className="fa-solid fa-barcode"></i>
                                  </button>
                                </OverlayTrigger>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="contenedor-completada">Factura completada</div>
              )}
            </div>
            <div className="columna-derechaCB">
              {productosRecepcionados.length > 0 ? (
                <div className="contenedor-inferior">
                  <div className="mensaje">
                    <div className="item-1">Productos recepcionados</div>
                  </div>
                  <div className="boton-accion"></div>
                </div>
              ) : (
                <div></div>
              )}

              {productosRecepcionados.length > 0 ? (
                <div className="contenedor">
                  <div className="table-scroll">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th style={{ textAlign: "center" }} scope="col">
                            Cantidad
                          </th>
                          <th scope="col">Clave Proveedor</th>
                          <th scope="col">Clave</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosRecepcionados.map((val, key) => {
                          return (
                            <tr key={val.id}>
                              <td
                                className="td-table-cb"
                                style={{ textAlign: "center" }}
                              >
                                {val.cantidad}
                              </td>
                              <td className="td-table-cb">{val.producto}</td>
                              <td className="td-table-cb">{val.clave}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div></div>
              )}
              {clavesunificadas.length === 0 &&
              productosRecepcionados.length > 0 ? (
                <div className="captura-lector2">
                  <button
                    id="boton-print"
                    type="button"
                    className="btn btn-outline-secondary"
                    /* onClick={handlePrint} */
                  >
                    Terminar
                  </button>
                </div>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        ) : (
          <div></div>
        )}
        {clavesunificadas.length > 0 ? (
          <div className="captura-lector">
            <div
              style={{ width: "50%", paddingRight: "1%" }}
              class="input-group mt-3"
            >
              <span class="input-group-text bg-primary text-white">
                Escanee el producto
              </span>
              <input
                autoFocus
                /* defaultValue={""} */
                /* onKeyDown={handlerFunction} */
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlerFunction(e);
                  }
                }}
                type="text"
                class="form-control"
                id="producto"
                onFocus={(e) => (e.target.value = "")}
                ref={myinput}
              />
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
      
      <div style={{maxHeight: "40px"}} className="printContent" ref={componentRef}>
        <CodeBarPrint partidas={partidasPrint} />
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
                /* onChange={(e) => setClavesxLote(e.target.value)} */
                name="claves"
                id="claves"
                class="form-control"
                rows={10}
              ></textarea>
            </div>

            {/* <!-- Modal footer --> */}
            <div class="modal-footer">
              <button
                /* onClick={() => agregarLote()} */
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

export default CodigoBarras;
