import React, { useState, useEffect, useRef, useContext } from "react";
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
import { CiBarcode } from "react-icons/ci";
import { show_alerta } from "../functions";
import { DataContext } from "../contexts/dataContext";

const CodigoBarras = () => {
  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;
  const infoUsuario = contextData;

  const fecha = Date.now();
  const hoy = new Date(fecha).toJSON().slice(0, 10);

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
  //const [isFileUploaded, setIsFileUploaded] = useState(true);
  const [mostrarCargaArchivo, setMostrarCargaArchivo] = useState(true);
  const [existeProductoEnFactura, setExisteProductoEnFactura] = useState(false);

  const [productosRecepcionados, setProductosRecepcionados] = useState([]);
  const [productoEscaneado, setProductoEscaneado] = useState([]);
  const [productoIngresadoManualmente, setProductoIngresadoManualmente] =
    useState("");
  const [claveProveedorIngManualmente, setClaveProveedorIngManualmente] =
    useState("");
  const [qtyManualmente, setQtyManualmente] = useState("");
  const [partidasPrint, setPartidasPrint] = useState([]);

  const ref = useRef();
  const componentRef = useRef();

  const renderTooltip = (props) => (
    <Tooltip {...props}>Da clic para generar código de barras</Tooltip>
  );

  const renderTooltip2 = (props) => (
    <Tooltip {...props}>Da clic para recibir producto manualmente</Tooltip>
  );

  useEffect(() => {
    console.log("Useeffect rfc, getClaves()")
    getClaves();
  }, [rfc]);

  useEffect(() => {
    if (partidasPrint.length !== 0) {
      handlePrint();
    }
  }, [partidasPrint]);

  useEffect(() => {
    console.log("Useeffect clavesProveedor, unificaClaves()");
    unificaClaves();
  }, [clavesProveedor]);

  useEffect(() => {
    console.log("Cambió xmlContent");
    if (xmlContent.length > 0) {
      unificaClaves();
    } else {
      setClavesunificadas([]);
    }
  }, [xmlContent,folioFactura]);

  const myinput = useRef();

  const inputFocus = () => {
    myinput.current.focus();
  };

  let unificaClaves = () => {
    let temp = [];
    let encontrado = false;

    listaProductos.forEach((e, i) => {
      //Listaproductos son los contenidos en la factura. Campos... cantidad, producto, clave (vacio)

      if (
        clavesProveedor.some((partida) => partida.claveprovedor === e.producto)
      ) {
        //Checa si existe el producto de la factura en la BD. Campos... (clave, claveprovedor)
        //console.log("Sí encontrado");
        const found = clavesProveedor.find(
          (element) => element.claveprovedor === e.producto
        );

        /* const result = clavesProveedor.find(    //clavesproveedor son todos los productos de ese proveedor
        (claveProv) => claveProv.claveprovedor === e.producto
      ); */

        e.clave = found.clave;

        let partida = {
          cantidad: e.cantidad,
          producto: e.producto,
          clave: found.clave,
        };
        temp.push(partida);
      } else {
        let partida = {
          cantidad: e.cantidad,
          producto: e.producto,
          clave: "No-registrada",
        };
        temp.push(partida);
      }
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
    console.log("inside handle");
    //setIsFileUploaded(false);
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
    if (xmlContent.length > 0) {
      //console.log("Dentro showDatos y xmlContent>0");
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
        //console.log(partida);
        productos.push(partida);
      }
      setListaProductos(productos);
      //console.log(productos);

      for (let i = 0; i < emisor.length; i++) {
        setRfc(emisor[i].getAttribute("Rfc"));
        setNombreProveedor(emisor[i].getAttribute("Nombre"));
      }

      for (let i = 0; i < comprobante.length; i++) {
        setFolioFactura(comprobante[i].getAttribute("Folio"));
      }
      setMostrarCargaArchivo(false);
    } else {
      show_alerta("Elija un archivo .xml", "warning");
    }
  };

  const cancelar = () => {
    //setIsFileUploaded(true);
  };

  const handlerFunction = (e) => {
    console.log(e.target.value);

    e.preventDefault();
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

    const grabaClaveNoEncontrada = (valor) => {
    let clave = valor.producto; //clave de proveedor no registrada en BD
    setClaveProveedorIngManualmente(clave);
    setQtyManualmente(valor.cantidad);
  };

  const agregarClaveManual = () => {
    var parametros;
    var metodo;

    parametros = {
      clave: productoIngresadoManualmente.trim(),
      sucursal: infoUsuario.sucursal,
      proveedor: rfc,
      factura: folioFactura,
      claveProveedor: claveProveedorIngManualmente,
      fecha: hoy,
    };

    console.log(parametros);
    metodo = "PUT";
    //const url = "http://18.224.118.226:3001/insertClaveManualNoRegistrada";

    enviarSolicitud(metodo,parametros)

    /* Axios({ method: "POST", url: url, data: parametros })
      .then(function (respuesta) {
        var tipo = respuesta.status;
        console.log(tipo);
        if (tipo === 200) {
          moverProductoaRecepcionados();
          show_alerta("Registrado exitósamente", "success");
        } else {
          show_alerta("Hubo un problema", "error");
        }

        if (tipo === 200) {
          document.getElementById("btnCerrar").click();
        }
      })
      .catch(function (error) {
        show_alerta("Error en la solicitud de escritura", "error");
        //console.log(error);
      }); */
  };

  const enviarSolicitud = async (metodo, parametros) => {
    const url = "http://18.224.118.226:3001/insertClaveManualNoRegistrada";

    await Axios({ method: metodo, url: url, data: parametros })
      .then(function (respuesta) {
        var tipo = respuesta.status;
        console.log(tipo);
        if (tipo === 200) {
          show_alerta("Registrado exitósamente", "success");
        } else {
          show_alerta("Hubo un problema", "error");
        }

        if (tipo === 200) {
          document.getElementById("btnCerrar").click();
          console.log("despues de getMargenes");
        }
      })
      .catch(function (error) {
        show_alerta("Error en la solicitud de escritura", "error");
        //console.log(error);
      });
  };

  const moverProductoaRecepcionados = () => {
    let temporal = clavesunificadas.filter(
      (claveProv) => claveProv.producto !== claveProveedorIngManualmente //Solo quedan prods que no son el ing manualmente
    );
    /* console.log(temporal); */
    setClavesunificadas(temporal);

    let temp = [...productosRecepcionados];

    let partida = {
      cantidad: qtyManualmente,
      producto: claveProveedorIngManualmente,
      clave: productoIngresadoManualmente,
    };
    temp.push(partida);
    setProductosRecepcionados(temp);
  };

  return (
    <>
      <div className="wrapperCB">
        <div className="encabezadoCB">
          {mostrarCargaArchivo ? (
            <div className="carga-archivo">
              <div className="instrucciones">
                Elija el archivo .xml de la factura que desea recepcionar.
              </div>
              <div
                style={{ fontSize: "0.8rem" }}
                className="encabezado-izquierdoCB"
              >
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
                    setMostrarCargaArchivo(true);
                    setClavesunificadas([]);
                    setProductosRecepcionados([]);
                    setXmlContent([]);
                    setListaProductos([]);
                    /* setClavesProveedor([]); */
                    /* setIsFileUploaded(true); */
                    /* cancelar(); */
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
                          <th scope="col"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {clavesunificadas.map((val, key) => {
                          return (
                            <tr key={val.id}>
                              <td
                                className="td-table-cb2"
                                style={{ textAlign: "center" }}
                              >
                                {val.cantidad}
                              </td>
                              <td className="td-table-cb">{val.producto}</td>
                              <td className="td-table-cb">{val.clave}</td>
                              <td className="td-table-cb">
                                {val.clave !== "No-registrada" ? (
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
                                ) : (
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={renderTooltip2}
                                  >
                                    <button
                                      onClick={() =>
                                        grabaClaveNoEncontrada(val)
                                      }
                                      data-bs-toggle="modal"
                                      data-bs-target="#myModal"
                                      className="btn btn-outline-secondary boton-tb-cb2"
                                    >
                                      <i className="fa-solid fa-unlock"></i>
                                    </button>
                                  </OverlayTrigger>
                                )}
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
                                className="td-table-cb2"
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
              style={{ width: "55%", paddingRight: "1%" }}
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

      <div
        style={{ maxHeight: "40px" }}
        className="printContent"
        ref={componentRef}
      >
        <CodeBarPrint partidas={partidasPrint} />
      </div>

      <div class="modal" id="myModal">
        <div class="modal-dialog">
          <div class="modal-content">
            {/* <!-- Modal Header --> */}
            <div class="modal-header">
              <h5 class="modal-title">
                Recepcionar producto sin clave registrada
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div class="modal-body modal-display-col">
              <div className="indicaciones-en-modal">
                <p>
                  Si el producto cuenta con código de barras en su almacén,
                  escanéelo para asegurar una correcta captura.
                </p>
              </div>
              <div className="modal-display-row">
                <div class="mb-3" style={{ width: "48%", paddingRight: "2%" }}>
                  <label for="exampleFormControlInput12" class="form-label">
                    Clave
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="exampleFormControlInput12"
                    onChange={(e) =>
                      setProductoIngresadoManualmente(e.target.value)
                    }
                  />
                </div>
                <div className="item-scan">
                  <i style={{ fontSize: "2.2rem", textAlign: "center" }}>
                    <CiBarcode />{" "}
                  </i>
                </div>
              </div>
            </div>

            {/* <!-- Modal footer --> */}
            <div class="modal-footer">
              <button
                onClick={() => agregarClaveManual()}
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
