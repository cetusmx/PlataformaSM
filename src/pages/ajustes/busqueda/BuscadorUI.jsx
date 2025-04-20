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

  useEffect(() => {
    getProductos();
  }, []);

  const getProductos = async () => {
    await Axios.get(urlServidorAPI3 + `/api/v1/productos`).then((response) => {
      setProductos(response.data.body);
      setSearchList(response.data.body);
      setData(response.data.body);
      console.log(response.data.body);
    });
  };

  const onchange = (event) => {
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
          row.diametroexterior === event.target.value.trim() &&
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
          row.altura === event.target.value.trim()
        );
      });
      setSearchList(temp);
      setData(temp);
    }

    console.log(event.target.value);
    console.log(de);
    console.log(di);
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
              onChange={onchange}
            />
          </div>
        </div>

        <div className="tabla-resultados-buscadorUI">
          <Table productos={searchList} />
        </div>
      </div>
    </>
  );
};

export default BuscadorUI;
