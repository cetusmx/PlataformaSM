import React, { useState, useEffect } from "react";
import "../../../styles/buscadorsellos.css";
import List from "./List";
import * as XLSX from "xlsx";
import { BiFilterAlt } from "react-icons/bi";
import Axios from "axios";
import { show_alerta } from "../../../functions";
import TablaProductosResumida from "./TablaProductosResumida";

const BuscadorSellos = () => {
  const [dataExcel, setDataExcel] = useState([]);
  const [muestraFileUpload, setMuestraFileUpload] = useState(true);
  const [claveBuscada, setClaveBuscada] = useState("");
  const [searchList, setSearchList] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [showSpinner2, setShowSpinner2] = useState(true);
  /* const [lineaBuscada, setLineaBuscada] = useState(""); */
  const cardsPerRow = 2;
  const urlServidorAPI3 = "http://75.119.150.222:3002";
  const urlServidorAPI4 = "http://localhost:5071";

  useEffect(() => {
    // Use setTimeout to update the message after 2000 milliseconds (2 seconds)
    const timeoutId = setTimeout(() => {
      //setMessage('Delayed message after 2 seconds!');
      setShowSpinner2(false);
    }, 2000);
    // Cleanup function to clear the timeout if the component unmounts
    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array ensures the effect runs only once

  const handleFileUpload = (e) => {
    if (typeof e.target.files[0] !== "undefined") {
      const reader = new FileReader();
      let parsedData;
      reader.readAsBinaryString(e.target.files[0]);
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        parsedData = XLSX.utils.sheet_to_json(sheet);
        const originalHeader = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        })[0];
        // Map the original header to the desired header
        const modifiedHeader = mapHeader(originalHeader);
        //console.log(parsedData);

        const successdata = modificaArray(
          modifiedHeader,
          parsedData,
          originalHeader
        );
        console.log(successdata);
        /* let temp = acondicionaDatos(parsedData);*/
        setDataExcel(successdata);
        setSearchList(successdata);
        setMuestraFileUpload(false);
      };
      e.target.value = null;
    }
  };

  const modificaArray = (modifiedHeader, parsedData, originalHeader) => {
    const successData = [];

    for (let i = 0; i < parsedData.length; i++) {
      // Use the modified header to update the keys in each row of the data
      const modifiedRow = {};
      originalHeader.forEach((column, index) => {
        modifiedRow[modifiedHeader[index]] = parsedData[i][column];
      });
      successData.push(modifiedRow);
    }
    return successData;
  };

  const mapHeader = (originalHeader) => {
    originalHeader = originalHeader.map((elemento) => elemento.trim());
    //console.log(originalHeader);
    // Define your mapping logic here
    const headerMap = {
      Clave: "clave",
      Descripción: "descripcion",
      "Unidad de entrada": "unidad",
      Línea: "linea",
      Existencias: "existencias",
      "Costo promedio": "costopromedio",
      "Último costo": "ultimocosto",
      "Fecha de última compra": "fechaultimacompra",
      "Diámetro Interior": "diametrointerior",
      "Diámetro Exterior": "diametroexterior",
      Altura: "altura",
      Sección: "seccion",
      Material: "material",
      Marca: "marca",
      Temperatura: "temperatura",
      Presión: "presion",
      "Clave fabricante": "clavefabricante",
      Perfil: "perfil",
      "Clave anterior": "claveanterior",
      "Clave Sellos y Retenes": "clavesellosyr",
      "Clave La Capital": "clavelacapital",
      "Sistema métrico": "sistemamedicion",
    };

    return originalHeader.map((column) => headerMap[column] || column);
  };

  const onChange = (event) => {
    setClaveBuscada(event.target.value);
    // Filter data based on search term
    setSearchList(
      dataExcel
        .filter((item) =>
          item.clave.toUpperCase().includes(event.target.value.toUpperCase())
        )
        .slice(0, 10)
    );
  };

  const subirdata = async () => {
    setShowSpinner(true);
    await Axios({
      method: "DELETE",
      url: urlServidorAPI3 + `/api/v1/productos/`,
    })
      .then((response) => {
        //console.log(response);
      })
      .catch(function (error) {
        JSON.parse(JSON.stringify(error));
      });
    //Insertar nueva lista
    await Axios({
      method: "POST",
      url: urlServidorAPI3 + `/api/v1/productos/`,
      data: dataExcel,
    })
      .then((response) => {
        if (response.status === 200) {
          show_alerta("Subido exitósamente", "success");
        } else {
          show_alerta("Hubo un problema", "error");
        }
        setShowSpinner(false);
        console.log(response.data.message);
      })
      .catch(function (error) {
        JSON.parse(JSON.stringify(error));
      });
    setMuestraFileUpload(true);
    setClaveBuscada("");
  };
  
  return (
    <>
      <div className="wrapper-ajus-busqueda">
        {muestraFileUpload && (
          <>
            <div class="mb-3" style={{ paddingTop: "10px" }}>
              <label for="formFile" class="form-label">
                Carga del catálogo de productos para Buscador
              </label>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => handleFileUpload(e)}
                style={{ width: "50%" }}
                class="form-control"
                id="formFile"
              />
              <p
                style={{
                  fontStyle: "italic",
                  fontSize: "0.8rem",
                  paddingTop: "10px",
                }}
              >
                Elija un archivo .xls o .xlsx con la información de los
                productos.
              </p>
            </div>
            <div>
              <TablaProductosResumida />
            </div>
          </>
        )}

        {!muestraFileUpload && (
          <div>
            <div className="header--activity-busqueda">
              <div className="search-box-busqueda">
                <input
                  value={claveBuscada}
                  onChange={onChange}
                  type="text"
                  placeholder="Filtrar por clave"
                />
                <BiFilterAlt />
              </div>
              <div className="encabezado-busqueda-tabla">Vista previa</div>
              <div className="boton-buscador-sellos">
                <button
                  id="boton-print"
                  type="button"
                  className="btn btn-outline-secondary"
                  style={{
                    width: "50%",
                    marginBottom: "-5px",
                    marginTop: "-5px",
                    fontSize: "0.8rem",
                  }}
                  data-bs-toggle="modal"
                  data-bs-target="#modalSubir"
                >
                  Guardar
                </button>

                <button
                  id="boton-print"
                  type="button"
                  className="btn btn-outline-secondary"
                  style={{
                    width: "50%",
                    marginBottom: "-5px",
                    marginTop: "-5px",
                    fontSize: "0.8rem",
                  }}
                  onClick={() => {
                    setMuestraFileUpload(true);
                    setClaveBuscada("");
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
            {showSpinner && (
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
                ></div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    justifyContent: "center",
                    margin: "1vh 0 0 53vh",
                  }}
                >
                  <span>Subiendo...</span>
                </div>
              </div>
            )}
            {!showSpinner && (
              <div className="div-table">
                <List productos={searchList} prodsPerRow={cardsPerRow} />
              </div>
            )}
          </div>
        )}
      </div>

      {/**** MODAL SUBIDA ARCHIVO ******/}
      <div id="modalSubir" className="modal fade" aria-hidden="false">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <div className="container-fluid">
                <div className="row pt-3">
                  <div className="col-md-8">
                    <label className="h5">Carga de productos</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <div className="container-fluid">
                <div className="row">
                  <div
                    className="col-md-7 mx-auto"
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
              </div>
            </div>
            <div className="modal-footer">
              <button
                id="btnCerrar"
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancelar
              </button>
              <button
                id="btnAplicar"
                onClick={subirdata}
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuscadorSellos;
