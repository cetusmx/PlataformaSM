import React, { Fragment, useEffect, useState } from "react";
import "./buscadorUI.css";
import { BiFilterAlt } from "react-icons/bi";
import Axios from "axios";
import Table from "./table/Table";

const BuscadorUI = () => {
  const urlServidorAPI3 = "http://18.224.118.226:3002";
  const [searchList, setSearchList] = useState([]);
  const [di, setDi] = useState("");
  const [de, setDe] = useState("");
  const [altura, setAltura] = useState("");
  const [productos, setProductos] = useState([]);
  const [data, setData] = useState([]);
  const [isSpinner, setIsSpinner] = useState(true);
  const [claveBuscada, setClaveBuscada] = useState("");

  useEffect(() => {
    getProductos();
    const timer = setTimeout(() => {
      setIsSpinner(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isSpinner) {
      setIsSpinner(true);
      console.log("spinner false");
    }
    const timer = setTimeout(() => {
      console.log("Dentro timeout");
      setIsSpinner(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchList]);

  const getProductos = async () => {
    await Axios.get(urlServidorAPI3 + `/api/v1/productos`).then((response) => {
      setProductos(response.data.body);
      setSearchList(response.data.body);
      setData(response.data.body);
      //console.log(response.data.body);
    });
  };

  const onchange = (event) => {
    if (claveBuscada) {
      setClaveBuscada("");
    }
    console.log("Spinner => " + isSpinner);
    let id = event.target.id;
    console.log(id);
    if (id === "input-di") {
      setDi(event.target.value);
      const temp = productos.filter((row) => {
        return (
          row.diametrointerior === event.target.value.trim() &&
          (row.diametroexterior === de.trim() || de.trim() === "") &&
          (row.altura === altura.trim() || altura.trim() === "")
        );
      });
      setSearchList(temp);
      setData(temp);
    }
    if (id === "input-de") {
      setDe(event.target.value);
      const temp = productos.filter((row) => {
        return (
          (row.diametrointerior === di.trim() || di.trim() === "") &&
          row.diametroexterior === event.target.value.trim() /* ||
            de.trim() === "" */ &&
          (row.altura === altura.trim() || altura.trim() === "")
        );
      });
      setSearchList(temp);
      setData(temp);
    }
    if (id === "input-altura") {
      setAltura(event.target.value);
      const temp = productos.filter((row) => {
        return (
          (row.diametrointerior === di.trim() || di.trim() === "") &&
          (row.diametroexterior === de.trim() || de.trim() === "") &&
          (row.altura === event.target.value.trim() || altura.trim() === "")
        );
      });
      setSearchList(temp);
      setData(temp);
    }
    setIsSpinner(false);
    /* console.log("D.I. => " + di);
    console.log("D.E. => " + de);
    console.log("Altura => " + altura);
    console.log("Spinner => " + isSpinner); */
  };

  const onchange2 = (e) => {
    setDi("");
    setDe("");
    setAltura("");

    setClaveBuscada(e.target.value);
    // Filter data based on search term
    setSearchList(
      productos
        .filter((item) =>
          item.clave.toUpperCase().includes(e.target.value.toUpperCase())
        )
        .slice(0, 70)
    );
  };

  return (
    <>
      <div className="contenedor-buscadorUI">
        <div className="encabezado-buscadorUI">
          <div
            className="input-group mb-2 mt-2 shadow-encabezado"
            style={{ width: "40%" }}
          >
            <input
              placeholder="Buscar por clave"
              type="text"
              className="form-control"
              aria-label="Sizing example input"
              aria-describedby="inputGroup-sizing-default"
              onChange={onchange2}
              value={claveBuscada}
            />
          </div>
        </div>

        <div className="filtros-buscadorUI">
          <div className="filtro-icono">
            <BiFilterAlt />
          </div>
          <div className="input-group input-group-sm mb-3 mt-3 shadow-encabezado">
            <span class="input-group-text" id="inputGroup-sizing-sm">
              Pulg/MM
            </span>
            <select
              className="form-select form-select-sm"
              aria-label=".form-select-sm example"
            >
              {/* <option selected>Seleccione</option> */}
              <option selected value="1">
                Pulgadas
              </option>
              <option value="2">Milimétrico</option>
            </select>
          </div>
          <div className="input-group input-group-sm mb-3 mt-3 shadow-encabezado">
            <span class="input-group-text" id="inputGroup-sizing-sm">
              Sello
            </span>
            <select
              className="form-select form-select-sm"
              aria-label=".form-select-sm example"
            >
              {/* <option selected>Seleccione</option> */}
              <option selected value="1">
                Todos
              </option>
              <option value="1">Pistón</option>
              <option value="2">Sello U</option>
              <option value="3">Buffer</option>
            </select>
          </div>
          <div
            className="input-group input-group-sm mb-3 mt-3 shadow-encabezado"
            style={{ width: "70%" }}
          >
            <span class="input-group-text" id="inputGroup-sizing-sm">
              D.I.
            </span>
            <input
              id="input-di"
              type="text"
              className="form-control"
              aria-label="Sizing example input"
              aria-describedby="inputGroup-sizing-sm"
              value={di}
              onChange={onchange}
            />
          </div>
          <div
            className="input-group input-group-sm mb-3 mt-3 shadow-encabezado"
            style={{ width: "70%" }}
          >
            <span className="input-group-text" id="inputGroup-sizing-sm">
              D.E.
            </span>
            <input
              id="input-de"
              type="text"
              className="form-control"
              aria-label="Sizing example input"
              aria-describedby="inputGroup-sizing-sm"
              value={de}
              onChange={onchange}
            />
          </div>
          <div
            className="input-group input-group-sm mb-3 mt-3 shadow-encabezado"
            style={{ width: "70%" }}
          >
            <span className="input-group-text" id="inputGroup-sizing-sm">
              Altura
            </span>
            <input
              id="input-altura"
              type="text"
              className="form-control"
              aria-label="Sizing example input"
              aria-describedby="inputGroup-sizing-sm"
              value={altura}
              onChange={(e) => {
                setAltura(e.target.value);
                onchange(e);
              }}
            />
          </div>
        </div>
        {isSpinner && (
          <div
            style={{
              display: "flex",
              /* flexDirection: "column", */
              width: "100%",
              justifyItems: "center",
              justifyContent: "center",
              /* textAlign: "center", */
              paddingTop: "5rem",
            }}
          >
            <div
              class="spinner-border"
              role="status"
              /* sx={{ display: "flex", justifyContent: "center" }} */
              style={{
                width: "5rem",
                height: "5rem",
                /*margin: "22vh 0 0 55vh", */
              }}
            ></div>
          </div>
        )}
        {!isSpinner && (
          <div className="tabla-resultados-buscadorUI">
            <Table productos={searchList} />
          </div>
        )}
      </div>
    </>
  );
};

export default BuscadorUI;
