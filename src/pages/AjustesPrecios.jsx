import React, { useContext, useState } from "react";
import { BiArrowBack, BiCaretRight } from "react-icons/bi";
import { DataContext } from "../contexts/dataContext";
import EnConstruccion from "./EnConstruccion";
import "../styles/ajustesprecios.css";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import TablaPrecios from "./TablaPrecios";
import TablaRemision from "./TablaRemision";
import * as XLSX from "xlsx";

const AjustesPrecios = () => {
  const [isOpenDgo, setIsOpenDgo] = useState(false);
  const [isOpenFllo, setIsOpenFllo] = useState(false);
  const [isOpenMzt, setIsOpenMzt] = useState(false);
  const [isOpenZac, setIsOpenZac] = useState(false);
  const [isOpenTecmin, setIsOpenTecmin] = useState(false);
  const [isOpenTodas, setIsOpenTodas] = useState(false);
  const [sucursal, setSucursal] = useState("");

  const [dataExcel, setDataExcel] = useState([]);

  const { valor3 } = useContext(DataContext);
  const { contextAdminNav, setContextAdminNav } = valor3;
  const porcentaje = 75;

  const showLista = (e) => {
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
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      setDataExcel(parsedData);
    };
    console.log(dataExcel);
  };

  return (
    <>
      <div className="container-ajustesPrecios">
        <div className="contenedor-columnas1">
          <div className="columnaIzquierda">
            <div className="row-col-izq-up"></div>
          </div>
          <div className="columnaDerecha1">
            <div
              style={{ width: "73%", marginRight: "2%", fontSize: "1.2rem" }}
            >
              Lista de precios de {sucursal}
            </div>
            <div className="divRegresar">
              {/* <div className="regresar"> */}
              <button
                onClick={() => {
                  setContextAdminNav("");
                }}
                className="item"
              >
                <BiArrowBack />
                Regresar
              </button>
              {/* </div> */}
            </div>
          </div>
        </div>
        <div className="contenedor-columnas">
          <div className="columnaIzquierda">
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
          <div className="columnaDerecha">
            <div style={{ width: "73%", marginRight: "2%" }}>
              {sucursal !== "" ? <TablaPrecios sucursal={sucursal} /> : null}
            </div>
            <div style={{ width: "73%", marginRight: "2%" }}>
              {/* <table
                className="table table-striped"
                style={{ padding: "3px", autoHeight: true, fontSize: "0.8rem" }}
              >
                <thead>
                  <tr style={{ padding: "3px" }}>
                    <th scope="col">Clave</th>
                    <th scope="col">Precio</th>
                    <th scope="col">Precio c/IVA</th>
                  </tr>
                </thead>
                <tbody>
                  {dataExcel.map((val, key) => {
                    return (
                      <tr key={val.id}>
                        <td>{val.clave}</td>
                        <td>{val.precio}</td>
                        <td>{val.precioIVA}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table> */}
            </div>
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
                      onChange={handleFileUpload}
                      style={{ width: "140px" }}
                    />
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <p style={{ margin: "2px" }}>Columnas necesarias:</p>
                    <i>clave, precio, sucursal</i>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AjustesPrecios;
