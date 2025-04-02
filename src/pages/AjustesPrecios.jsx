import React, { useContext, useEffect, useState } from "react";
import { BiArrowBack, BiCaretRight } from "react-icons/bi";
import { DataContext } from "../contexts/dataContext";
import EnConstruccion from "./EnConstruccion";
import "../styles/ajustesprecios.css";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import TablaPrecios from "./TablaPrecios";
import TablaRemision from "./TablaRemision";
import * as XLSX from "xlsx";
import TablaPreciosSubida from "./TablaPreciosSubida";
import Swal from "sweetalert2";
import Axios from "axios";
import { Spinner } from "react-bootstrap";
import { show_alerta } from "../functions";
import { MenuAjustesContext } from "../contexts/context-menu-ajustes";

const AjustesPrecios = () => {
  /* const {posicionMenu, setPosicionMenu} = useContext(MenuAjustesContext); */

  const [isOpenDgo, setIsOpenDgo] = useState(false);
  const [isOpenFllo, setIsOpenFllo] = useState(false);
  const [isOpenMzt, setIsOpenMzt] = useState(false);
  const [isOpenZac, setIsOpenZac] = useState(false);
  const [isOpenTecmin, setIsOpenTecmin] = useState(false);
  const [isOpenTodas, setIsOpenTodas] = useState(false);
  const [sucursal, setSucursal] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [isDisabledTit, setIsDisabledTit] = useState(false);
  const [radioModoSubidaLista, setRadioModoSubidaLista] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);

  const [dataExcel, setDataExcel] = useState([]);

 /*  const { valor3 } = useContext(DataContext);
  const { contextAdminNav, setContextAdminNav } = valor3; */
  const porcentaje = 75;

  const urlServidorAPI = "http://18.224.118.226:3001";
  const urlServidorAPI2 = "http://localhost:8080";

  useEffect(() => {
    // Agrega opciones al Select cuando carga la página por primera vez
    console.log("Dentro UseEffect");
    setShowSpinner(true);
    console.log(dataExcel);
  }, [dataExcel]);

  const showLista = (e) => {
    /* document.getElementById("tituloListaPrecios") */
    setIsDisabledTit(true);
    let sucu = e.target.value;
    setSucursal(sucu);
    console.log(e.target.value);

    if (sucu === "Durango") {
      setIsOpenDgo(true);
      setIsOpenFllo(false);
      setIsOpenMzt(false);
      setIsOpenZac(false);
      setIsOpenTecmin(false);
      setIsOpenTodas(false);
    }
    if (sucu === "Fresnillo") {
      setIsOpenFllo(true);
      setIsOpenDgo(false);
      setIsOpenMzt(false);
      setIsOpenZac(false);
      setIsOpenTecmin(false);
      setIsOpenTodas(false);
    }
    if (sucu === "Mazatlán") {
      setIsOpenMzt(true);
      setIsOpenDgo(false);
      setIsOpenFllo(false);
      setIsOpenZac(false);
      setIsOpenTecmin(false);
      setIsOpenTodas(false);
    }
    if (sucu === "Zacatecas") {
      setIsOpenZac(true);
      setIsOpenDgo(false);
      setIsOpenFllo(false);
      setIsOpenMzt(false);
      setIsOpenTecmin(false);
      setIsOpenTodas(false);
    }
    if (sucu === "Tecmin") {
      setIsOpenTecmin(true);
      setIsOpenDgo(false);
      setIsOpenFllo(false);
      setIsOpenMzt(false);
      setIsOpenZac(false);
      setIsOpenTodas(false);
    }
    if (sucu === "Todas") {
      setIsOpenTodas(true);
      setIsOpenDgo(false);
      setIsOpenFllo(false);
      setIsOpenMzt(false);
      setIsOpenZac(false);
      setIsOpenTecmin(false);
    }
  };

  const handleFileUpload = (e) => {
    const reader = new FileReader();
    let parsedData;
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      console.log(sheetName);
      const sheet = workbook.Sheets[sheetName];
      parsedData = XLSX.utils.sheet_to_json(sheet);
      let temp = acondicionaDatos(parsedData);
      setDataExcel(temp);
    };
    
    /** al inicio está en true (está deshabilitado por default) */
    if (isDisabled) {
      setIsDisabled(false);
    } else {
      setIsDisabled(false);
    }
  };

  const openModal2 = async () => {
    
    setIsDisabled(true); /* Botón Subir (se desactiva) */
    console.log("Dentro de openModal2");
    //setDataExcel(acondicionaDatos());
    //console.log(dataExcel);

    // Radio true para  actualizar, false para borrar destino y escribir
    if (radioModoSubidaLista) {
      //Actualizar
      //console.log("Radio true " + radioModoSubidaLista);

      await Axios({
        method: "POST",
        url: urlServidorAPI + "/updateListaPrecios",
        data: dataExcel,
      })
        .then((response) => {
          var tipo = response.status;
          console.log(tipo);
          if (tipo === 200) {
            show_alerta("Subido exitósamente", "success");
          } else {
            show_alerta("Hubo un problema", "error");
          }
  
          console.log(response.status);
        })
        .catch(function (error) {
          JSON.parse(JSON.stringify(error));
        });

    } else {
      console.log("Radio false " + radioModoSubidaLista);

      //Borrar lista destino
      /* Axios.post(urlServidorAPI + `/borrarLista/`, {
        params: {
          sucursal: sucursal,
        },
      }).then((response) => {
        console.log(response.status);
      }); */

      //Insertar nueva lista
      await Axios({
        method: "POST",
        url: urlServidorAPI + "/insertarLista",
        data: dataExcel,
      })
        .then((response) => {
          var tipo = response.status;
          console.log(tipo);
          if (tipo === 200) {
            show_alerta("Subido exitósamente", "success");
          } else {
            show_alerta("Hubo un problema", "error");
          }
  
          console.log(response.status);
        })
        .catch(function (error) {
          JSON.parse(JSON.stringify(error));
        });
    }
    //document.getElementById("btnAplicar").click();
  };

  const acondicionaDatos = (parsed) => {

    const temp = parsed.map(partida => {
      return {...partida, precio: partida.precio.replace(',','')}
     /*  elemento.precio = elemento.precio.replace(',',''); */
    });
    return temp;
  }

  return (
    <>
      <div className="container-ajustesPrecios">
        <div className="contenedor-columnas1">
          <div className="columnaIzquierda">
            <div className="row-col-izq-up"></div>
          </div>
          {/* <div className="columnaDerecha1">
            {isDisabledTit ? (
              <div
                style={{ width: "73%", marginRight: "2%", fontSize: "1.2rem" }}
              >
                Lista de precios de {sucursal}
              </div>
            ) : (
              <div
                style={{ width: "73%", marginRight: "2%", fontSize: "1.2rem" }}
              ></div>
            )}
            <div className="divRegresar">
              
              <button
                onClick={() => {
                  setPosicionMenu("");
                }}
                className="item"
              >
                <BiArrowBack />
                Regresar
              </button>
              {/* </div> 
            </div>
          </div> */}
        </div>
        <div className="contenedor-columnasAP">
          <div className="columnaIzquierdaAP">
            <div className="row-col-izq-up">
              <Card style={{ width: "14rem" }}>
                <Card.Header>Listas de Precios</Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <div className="divButton">
                      <button
                        onClick={showLista}
                        className="button"
                        value={"Durango"}
                      >
                        Durango
                      </button>
                    </div>
                    <div className="divFlecha">
                      {isOpenDgo && <BiCaretRight />}
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <div className="divButton">
                      {" "}
                      <button
                        onClick={showLista}
                        className="button"
                        value={"Fresnillo"}
                      >
                        Fresnillo
                      </button>
                    </div>
                    <div className="divFlecha">
                      {isOpenFllo && <BiCaretRight />}
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <div className="divButton">
                      {" "}
                      <button
                        onClick={showLista}
                        className="button"
                        value={"Mazatlán"}
                      >
                        Mazatlán
                      </button>
                    </div>
                    <div className="divFlecha">
                      {isOpenMzt && <BiCaretRight />}
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <div className="divButton">
                      {" "}
                      <button
                        onClick={showLista}
                        className="button"
                        value={"Zacatecas"}
                      >
                        Zacatecas
                      </button>
                    </div>
                    <div className="divFlecha">
                      {isOpenZac && <BiCaretRight />}
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <div className="divButton">
                      {" "}
                      <button
                        onClick={showLista}
                        className="button"
                        value={"Tecmin"}
                      >
                        Tecmin
                      </button>
                    </div>
                    <div className="divFlecha">
                      {isOpenTecmin && <BiCaretRight />}
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </div>
            <div className="row-col-izq-down">
              <Card style={{ width: "14rem" }}>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <div className="divButton">
                      <button
                        onClick={showLista}
                        className="button"
                        value={"Todas"}
                      >
                        Ver Todas
                      </button>
                    </div>
                    <div className="divFlecha">
                      {isOpenTodas && <BiCaretRight />}
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </div>
          </div>
          <div className="columnaDerechaAP">
            <div style={{ width: "73%", marginRight: "2%" }}>
              {sucursal !== "" ? <TablaPrecios sucursal={sucursal} /> : null}
            </div>
            {isDisabledTit ? (
              <div
              style={{ width: "24%", justifyItems: "right", marginLeft: "1%" }}
            >
              <Card style={{ width: "100%" }}>
                <Card.Header>Carga masiva</Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={(e) => handleFileUpload(e)}
                      style={{ width: "140px" }}
                    />
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <p style={{ margin: "2px" }}>Columnas necesarias:</p>
                    <p style={{ margin: "2px", fontWeight: "500" }}>
                      <i>clave, precio, sucursal</i>
                    </p>
                    <p
                      style={{
                        margin: "2px",
                        marginTop: "5px",
                        fontSize: "0.rem",
                      }}
                    >
                      <i>En precio sin comas o símbolo $</i>
                    </p>
                  </ListGroup.Item>
                </ListGroup>
                <ListGroup.Item>
                  <div style={{ paddingLeft: "10px" }}>
                    <button
                      /* onClick={() => openModal2()} */
                      disabled={isDisabled}
                      style={{
                        width: "110px",
                        border: "1px solid #757575",
                        padding: "0.1rem",
                        margin: "0.4rem",
                        fontSize: "0.8rem",
                      }}
                      data-bs-toggle="modal"
                      data-bs-target="#modalEdicion"
                    >
                      {" "}
                      Subir
                    </button>
                  </div>
                </ListGroup.Item>
              </Card>
            </div>
            ) : (
              <div
              style={{ width: "24%", justifyItems: "right", marginLeft: "1%" }}
            ></div>
            )}
          </div>
        </div>
      </div>

      {/**** MODAL SUBIDA ARCHIVO ******/}
      <div id="modalEdicion" className="modal fade" aria-hidden="false">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <div className="container-fluid">
                <div className="row pt-3">
                  <div className="col-md-8">
                    <label className="h5">Carga de listas de precios</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <div className="container-fluid">
                <div className="row">
                  <div
                    className="col-md-6 mx-auto"
                    style={{ fontSize: "1.2rem" }}
                  >
                    <label
                      style={{ paddingRight: "1rem" }}
                      className="col-form-label"
                    >
                      {dataExcel.length}
                    </label>
                    <span id="passwordHelpInline" className="form-text">
                      registros en total
                    </span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-8">
                    <div className="form-check">
                      <input
                        onClick={() => setRadioModoSubidaLista(true)}
                        className="form-check-input"
                        type="radio"
                        name="flexRadioDefault"
                        id="flexRadioDefault1"
                        checked
                      />
                      <label
                        className="form-check-label"
                        for="flexRadioDefault1"
                      >
                        Actualizar precios
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        onClick={() => setRadioModoSubidaLista(false)}
                        className="form-check-input"
                        type="radio"
                        name="flexRadioDefault"
                        id="flexRadioDefault2"
                      />
                      <label
                        className="form-check-label"
                        for="flexRadioDefault2"
                      >
                        Borrar lista en destino
                      </label>
                    </div>
                  </div>
                  <div className="col-4 mx-auto">
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                id="btnCerrar"
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
              <button
                id="btnAplicar"
                onClick={openModal2}
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AjustesPrecios;
