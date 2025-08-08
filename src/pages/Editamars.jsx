import React, { useState, useEffect } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { show_alerta } from "../functions";
import { BiNotification, BiSearch, BiMap, BiUser } from "react-icons/bi";
import * as XLSX from "xlsx";
import "../styles/editamars.css";
import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";
import TablaVistaPrevia from "./ajustes/cotizador/TablaVistaPrevia";
import { Spinner } from "react-bootstrap";

const Editamars = () => {
  const [search, setSearch] = useState("");
  const [dataExcel, setDataExcel] = useState([]);

  const url = "https://sealmarket.net/api1/actualiza";
  const urlServidorAPI = "https://sealmarket.net/api1";
  const [family, setFamily] = useState("");
  const [margenes, setMargenes] = useState([]);
  const [margenesPivote, setMargenesPivote] = useState([]);
  const [margenDurango, setMargenDurango] = useState("");
  const [margenDurangoOld, setMargenDurangoOld] = useState("");
  const [margenFresnillo, setMargenFresnillo] = useState("");
  const [margenFresnilloOld, setMargenFresnilloOld] = useState("");
  const [margenMazatlan, setMargenMazatlan] = useState("");
  const [margenMazatlanOld, setMargenMazatlanOld] = useState("");
  const [margenZacatecas, setMargenZacatecas] = useState("");
  const [margenZacatecasOld, setMargenZacatecasOld] = useState("");
  const [margenTecmin, setMargenTecmin] = useState("");
  const [margenTecminOld, setMargenTecminOld] = useState("");
  const [margenMayorista, setMargenMayorista] = useState("");
  const [margenMayoristaOld, setMargenMayoristaOld] = useState("");
  const [title, setTitle] = useState("1");
  const [operation, setOperation] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);

  const [radioModoSubidaLista, setRadioModoSubidaLista] = useState(true);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    setIsFetching(true);
    getMargenes();
    console.log("Dentro UseEffect");
  }, []);

  useEffect(() => {
    if (margenesPivote.length > 0) {
      setIsFetching(false);
    } else {
      setIsFetching(true);
    }
    console.log("Dentro useEffect IsFetching");
    //setIsDisabled(true);
  }, [margenesPivote]);

  const getMargenes = async () => {
    await Axios.get(urlServidorAPI + "/margenes").then((response) => {
      setMargenes(response.data);
      let hashMap = new Map();
      response.data.map((val) => {
        if (!hashMap.has(val.familia)) {
          let arr = [val.sucursal + "-" + val.margen];
          hashMap.set(val.familia, arr);
        } else {
          let arre = hashMap.get(val.familia);
          arre.push(val.sucursal + "-" + val.margen);
          hashMap.set(val.familia, arre);
        }
        /* fin conversion hashmap */
        return hashMap;
      });

      /* console.log("Contenido hashMap ");
      hashMap.forEach((value,key)=>{
        console.log(key+"->"+value);
      }); */

      let arreglo = new Array([]);

      hashMap.forEach((value, key) => {
        let family = { familia: key };

        value.forEach((numero) => {
          //sucursales con margen
          if (typeof numero === "string") {
            let arri = numero.split("-");
            let sucu = arri[0];
            let margi = arri[1];

            if (sucu === "Durango") {
              const temp = { Durango: margi };
              family = Object.assign({}, family, temp);
            }
            if (sucu === "Fresnillo") {
              const temp = { Fresnillo: margi };
              family = Object.assign({}, family, temp);
            }
            if (sucu === "Mazatlán") {
              const temp = { Mazatlán: margi };
              family = Object.assign({}, family, temp);
            }
            if (sucu === "Zacatecas") {
              const temp = { Zacatecas: margi };
              family = Object.assign({}, family, temp);
            }
            if (sucu === "Tecmin") {
              const temp = { Tecmin: margi };
              family = Object.assign({}, family, temp);
            }
            if (sucu === "Mayorista") {
              const temp = { Mayorista: margi };
              family = Object.assign({}, family, temp);
            }
          }
        });
        if (Object.keys(family).length !== 0) {
          arreglo.push(family);
        }
      });
      arreglo.shift();
      //console.log(arreglo);
      setMargenesPivote(arreglo);
    });
    setIsFetching(false);
  };

  const openModal = (op, familia, dur, fres, maza, zaca, tecm, mayor) => {
    setFamily("");
    setMargenDurango("");
    setMargenDurangoOld("");
    setMargenFresnillo("");
    setMargenFresnilloOld("");
    setMargenMazatlan("");
    setMargenMazatlanOld("");
    setMargenZacatecas("");
    setMargenZacatecasOld("");
    setMargenTecmin("");
    setMargenTecminOld("");
    setMargenMayorista("");
    setMargenMayoristaOld("");
    setOperation(op);
    if (op === 1) {
      setTitle("Editar Margen");
      setFamily(familia);
      setMargenDurango(dur);
      setMargenDurangoOld(dur);
      setMargenFresnillo(fres);
      setMargenFresnilloOld(fres);
      setMargenMazatlan(maza);
      setMargenMazatlanOld(maza);
      setMargenZacatecas(zaca);
      setMargenZacatecasOld(zaca);
      setMargenTecmin(tecm);
      setMargenTecminOld(tecm);
      setMargenMayorista(mayor);
      setMargenMayoristaOld(mayor);
    }
    window.setTimeout(function () {
      document.getElementById("dgo").focus();
    }, 500);
  };

  const validar = () => {
    var parametros;
    var metodo;
    if (margenDurango.trim() === "") {
      show_alerta("Escribe un margen para Durango", "warning");
    } else if (margenFresnillo.trim() === "") {
      show_alerta("Escribe un margen para Fresnillo", "warning");
    } else if (margenMazatlan.trim() === "") {
      show_alerta("Escribe un margen para Mazatlán", "warning");
    } else if (margenZacatecas.trim() === "") {
      show_alerta("Escribe un margen para Zacatecas", "warning");
    } else if (margenTecmin.trim() === "") {
      show_alerta("Escribe un margen para Tecmin", "warning");
    } else if (margenMayorista.trim() === "") {
      show_alerta("Escribe un margen para Mayorista", "warning");
    } else {
      if (operation === 1) {
        let cambiaron = new Array([]);
        if (margenDurango !== margenDurangoOld) {
          cambiaron.push("Durango");
        }
        if (margenFresnillo !== margenFresnilloOld) {
          cambiaron.push("Fresnillo");
        }
        if (margenMazatlan !== margenMazatlanOld) {
          cambiaron.push("Mazatlán");
        }
        if (margenZacatecas !== margenZacatecasOld) {
          cambiaron.push("Zacatecas");
        }
        if (margenTecmin !== margenTecminOld) {
          cambiaron.push("Tecmin");
        }
        if (margenMayorista !== margenMayoristaOld) {
          cambiaron.push("Mayorista");
        }
        cambiaron.shift();

        parametros = {
          fa: family.trim(),
          du: margenDurango.trim(),
          fr: margenFresnillo.trim(),
          ma: margenMazatlan.trim(),
          za: margenZacatecas.trim(),
          te: margenTecmin.trim(),
          my: margenMayorista.trim(),
          cambios: cambiaron,
        };
        metodo = "PUT";
      }
      enviarSolicitud(metodo, parametros);
      document.getElementById("btnCerrar").click();
      getMargenes();
    }
  };

  const enviarSolicitud = async (metodo, parametros) => {
    await Axios({ method: metodo, url: url, data: parametros })
      .then(function (respuesta) {
        var tipo = respuesta.status;
        console.log(tipo);
        if (tipo === 200) {
          show_alerta("Actualizado exitósamente", "success");
        } else {
          show_alerta("Hubo un problema", "error");
        }

        if (tipo === 200) {
          document.getElementById("btnCerrar").click();
          getMargenes();
          console.log("despues de getMargenes");
        }
      })
      .catch(function (error) {
        show_alerta("Error en la solicitud de escritura", "error");
        //console.log(error);
      });
  };

  const buscar = (e) => {
    setSearch(e.target.value);
    console.log(e.target.value);
  };

  const results = !search
    ? margenesPivote
    : margenesPivote.filter((dato) =>
        dato.familia.toLowerCase().includes(search.toLocaleLowerCase())
      );

  const handleFileUpload = (e) => {
    console.log("Dentro de fileupload");
    console.log(e.target.files[0]);

    if (typeof e.target.files[0] !== "undefined") {
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
        setDataExcel(parsedData);

        setIsDisabled(false);
        console.log("Inside handleFile");
        if (!radioModoSubidaLista) {
          setRadioModoSubidaLista(true);
        }
      };
    }
  };

  const openModal2 = async () => {
    console.log("Dentro de openModal2");
    console.log(dataExcel);

    // Radio true para  actualizar, false para borrar destino y escribir
    if (radioModoSubidaLista) {
      //Actualizar
      console.log("Radio true " + radioModoSubidaLista);

      Axios({
        method: "POST",
        url: urlServidorAPI + "/updateMargenes",
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
          getMargenes();
        })
        .catch(function (error) {
          JSON.parse(JSON.stringify(error));
        });
    } else {
      //setIsFetching(true);
      setMargenesPivote([]);

      ///Borrar e Insertar márgenes
      await Axios({
        method: "POST",
        url: urlServidorAPI + "/insertarMargenes",
        data: dataExcel,
      })
        .then((response) => {
          var tipo = response.status;
          console.log(tipo);
          if (tipo === 200) {
            //show_alerta("Subido exitósamente", "success");
          } else {
            show_alerta("Hubo un problema", "error");
          }

          console.log(response.status);
          getMargenes();
        })
        .catch(function (error) {
          JSON.parse(JSON.stringify(error));
        });
    }
    setIsDisabled(true); /* Botón Subir (se desactiva) */
    setDataExcel([]);
    setRadioModoSubidaLista(true);
  };

  return (
    <>
      <div className="container-fluid">
        <div className="row">
          {/* <div className="col-12 col-lg-10 offset-0 offset-lg-1"> */}
          <div className="contenedor-100porciento">
            {
              <div className="content--header--editamars">
                <div className="header--activity-ajcot">
                  <div className="search-box-editmars">
                    <input
                      type="text"
                      placeholder="Buscar"
                      onChange={buscar}
                      value={search}
                    />
                    <BiSearch className="icon-1" />
                  </div>
                </div>
              </div>
            }

            <div className="container-inferior">
              {/*** Contenedor de tabla *** */}
              <div style={{ fontSize: "0.8rem" }} className="div-table">
                {isFetching && margenesPivote?.length === 0 && (
                  <div>
                    <div
                      class="spinner-border"
                      role="status"
                      sx={{ display: "flex", justifyContent: "center" }}
                      style={{
                        width: "5rem",
                        height: "5rem",
                        margin: "22vh 0 0 55vh",
                      }}
                    >
                      {/* <Spinner animation="border" role="status">
                      {" "}
                      <span className="visually-hidden">Cargando...</span>{" "}
                    </Spinner> */}
                    </div>
                    <div
                      style={{
                        fontSize: "1.2rem",
                        justifyContent: "center",
                        margin: "1vh 0 0 53vh",
                      }}
                    >
                      <span>Cargando...</span>
                    </div>
                  </div>
                )}
                {results?.length > 0 &&
                  !isFetching &&
                  margenesPivote?.length > 0 && (
                    <table className="table">
                      <thead>
                        <tr>
                          <th className="td-table-cb">#</th>
                          <th>Familia</th>
                          <th>Durango</th>
                          <th>Fresnillo</th>
                          <th>Mazatlán</th>
                          <th>Zacatecas</th>
                          <th>Tecmin</th>
                          <th>Mayorista</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody className="=table-group-divider">
                        {results.map((margenes, i) => (
                          <tr key={margenes.familia}>
                            <td className="td-table-cb">{i + 1}</td>
                            <td className="td-table-cb2">{margenes.familia}</td>
                            <td className="td-table-cb">{margenes.Durango}</td>
                            <td className="td-table-cb">
                              {margenes.Fresnillo}
                            </td>
                            <td className="td-table-cb">{margenes.Mazatlán}</td>
                            <td className="td-table-cb">
                              {margenes.Zacatecas}
                            </td>
                            <td className="td-table-cb">{margenes.Tecmin}</td>
                            <td className="td-table-cb">
                              {margenes.Mayorista}
                            </td>
                            <td className="td-table-cb">
                              <button
                                onClick={() =>
                                  openModal(
                                    1,
                                    margenes.familia,
                                    margenes.Durango,
                                    margenes.Fresnillo,
                                    margenes.Mazatlán,
                                    margenes.Zacatecas,
                                    margenes.Tecmin,
                                    margenes.Mayorista
                                  )
                                }
                                className="btn btn-warning"
                                data-bs-toggle="modal"
                                data-bs-target="#modalEdicion"
                              >
                                <i className="fa-solid fa-edit"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
              </div>
              <div className="cargaMasiva">
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
                        <i>familia, margen, sucursal</i>
                      </p>
                      <p
                        style={{
                          margin: "2px",
                          marginTop: "10px",
                          fontSize: "0.rem",
                        }}
                      >
                        <i>Ejem.</i>
                      </p>
                      <p
                        style={{
                          /* margin: "2px", */
                          marginTop: "5px",
                          fontSize: "0.rem",
                        }}
                      >
                        <i>ADHES, 0.8, Mazatlán</i>
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
                        data-bs-target="#modalSubir"
                      >
                        {" "}
                        Subir
                      </button>
                    </div>
                  </ListGroup.Item>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="modalEdicion" className="modal fade" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <div className="container-fluid">
                <div className="row pb-2">
                  <label className="h5">{title}</label>
                </div>
                <div className="row">
                  <div className="col-md-8 offset-md-4">
                    <label className="h6">Familia: {family}</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <input type="hidden" id="id"></input>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-map-marker me-2"></i>
                  <div style={{ width: "100px" }}>Durango</div>
                </span>
                <input
                  type="text"
                  id="dgo"
                  className="form-control"
                  placeholder="Margen"
                  value={margenDurango}
                  onChange={(e) => setMargenDurango(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-map-marker me-2"></i>
                  <div style={{ width: "100px" }}>Fresnillo</div>
                </span>
                <input
                  type="text"
                  id="fllo"
                  className="form-control"
                  placeholder="Margen"
                  value={margenFresnillo}
                  onChange={(e) => setMargenFresnillo(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-map-marker me-2"></i>
                  <div style={{ width: "100px" }}>Mazatlán</div>
                </span>
                <input
                  type="text"
                  id="mzt"
                  className="form-control"
                  placeholder="Margen"
                  value={margenMazatlan}
                  onChange={(e) => setMargenMazatlan(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-map-marker me-2"></i>
                  <div style={{ width: "100px" }}>Zacatecas</div>
                </span>
                <input
                  type="text"
                  id="zac"
                  className="form-control"
                  placeholder="Margen"
                  value={margenZacatecas}
                  onChange={(e) => setMargenZacatecas(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-industry me-2"></i>
                  <div style={{ width: "100px" }}>Tecmin</div>
                </span>
                <input
                  type="text"
                  id="tecmin"
                  className="form-control"
                  placeholder="Margen"
                  value={margenTecmin}
                  onChange={(e) => setMargenTecmin(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-industry me-2"></i>
                  <div style={{ width: "100px" }}>Mayorista</div>
                </span>
                <input
                  type="text"
                  id="mayor"
                  className="form-control"
                  placeholder="Margen"
                  value={margenMayorista}
                  onChange={(e) => setMargenMayorista(e.target.value)}
                ></input>
              </div>
              <div className="d-grid col-6 mx-auto">
                <button onClick={() => validar()} className="btn btn-success">
                  <i className="fa-solid fa-floppy-disk mx-2"></i>Guardar
                </button>
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
            </div>
          </div>
        </div>
      </div>

      {/**** MODAL SUBIDA ARCHIVO ******/}
      <div id="modalSubir" className="modal fade" aria-hidden="true">
        <div className="modal-dialog modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <div className="container-fluid">
                <div className="row pt-3">
                  <div className="col-md-12">
                    <label className="h5">
                      Vista previa márgenes para Cotizador
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <div className="container-fluid">
                <div className="row">
                  <TablaVistaPrevia data={dataExcel} />
                </div>
                {/* <div className="row">
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
                </div> */}
              </div>
            </div>
            <div className="modal-footer">
              <div className="container-fluid">
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
                        Actualizar márgenes
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
                        Borrar márgenes en destino
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <button
                id="btnCerrar"
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => setIsDisabled(true)}
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

export default Editamars;
