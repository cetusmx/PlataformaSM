import React, { Fragment, useEffect, useState } from "react";
import "./buscadorUI.css";
import TablaResultadosBusqueda from "./TablaResultadosBusqueda";
import { ProductosContext } from "../../../contexts/contextProductos";
import { BiFilterAlt } from "react-icons/bi";
import Axios from "axios";

const BuscadorUI = () => {
  const urlServidorAPI3 = "http://18.224.118.226:3002";
  const [searchList, setSearchList] = useState([]);
  const [properties, setProperties] = useState([]);
  const [di, setDi] = useState("");
  const [de, setDe] = useState("");
  const [altura, setAltura] = useState("");
  const [productos, setProductos] = useState([]);
  const [state, setState] = useState(0);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getProductos();
  }, []);

  useEffect(() => {
    console.log(open);
  }, [open]);

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
          row.diametrointerior === di.trim() &&
          row.diametroexterior === de.trim() &&
          row.altura === event.target.value.trim()
        );
      });
      setSearchList(temp);
      setData(temp);
    }

    console.log(event.target.value);
    console.log(de);
    console.log(di);

    //console.log(productos);
    /* const temp = productos
      .filter((di) => di == 0)
      .filter((c) => c > 1)
      .filter((d) => d > 2)
      .filter((e) => e > 3); */
  };

  const handleClick = (index) => {
    const updatedState = data[index]; //Aquí se guarda toda la fila
    //console.log(updatedState);

    if (updatedState.other) {
      delete updatedState.other;
      setState((pre) => {
        return pre + 1;
      });
    } else {
      updatedState.other = {
        description: "Hello there", //or data from api
      };
      setState((pre) => {
        return pre + 1;
      });
    }
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
          <table
            className="table centrando-contenido"
            style={{ fontSize: "0.8rem" }}
          >
            <thead className="table-light">
              <tr style={{ textAlign: "center" }}>
                <th scope="col"></th>
                <th scope="col"></th>
                <th className="td-center-buscadorUI" scope="col">
                  Clave
                </th>
                <th className="td-center-buscadorUI" scope="col">
                  Línea
                </th>
                <th className="td-center-buscadorUI" scope="col">
                  Diám. int.
                </th>
                <th className="td-center-buscadorUI" scope="col">
                  Diám. ext.
                </th>
                <th className="td-center-buscadorUI" scope="col">
                  Altura
                </th>
                <th className="td-center-buscadorUI" scope="col">
                  Clave anterior
                </th>
                <th className="td-center-buscadorUI" scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {data
                .map((row, index) => (
                  <Fragment key={row.clave}>
                    <tr key={index}>
                      <td className="td-center-buscadorUI">
                        <div
                          className={open ? "toggle-btnSA" : "toggle-btnS-rota"}
                        >
                          <i
                            className="bi-chevron-right toggle-btnS"
                            onClick={() => setOpen(!open)}
                          ></i>
                        </div>
                      </td>
                      <td>
                        <img
                          src={`${process.env.PUBLIC_URL}/Perfiles/${row.linea}.jpg`}
                          alt="logo"
                          className="img-fluid rounded-start imagen-busqueda"
                        />
                      </td>
                      <td className="td-center-buscadorUI">{row.clave}</td>
                      <td className="td-center-buscadorUI">{row.linea}</td>
                      <td className="td-center-buscadorUI">
                        {row.diametrointerior}
                      </td>
                      <td className="td-center-buscadorUI">
                        {row.diametroexterior}
                      </td>
                      <td className="td-center-buscadorUI">{row.altura}</td>
                      <td className="td-center-buscadorUI">
                        {row.claveanterior}
                      </td>
                      <td className="td-center-buscadorUI">
                        <button
                          id="boton-print"
                          type="button"
                          className="btn btn-outline-secondary"
                          style={{
                            fontSize: "0.8rem",
                          }}
                          onClick={() => handleClick(index)}
                        >
                          Ver más
                        </button>
                      </td>
                    </tr>
                    {row.other ? (
                      <tr>
                        <td colSpan={9}>
                          <div className="contenedor-sub-tabla">
                            <div className="campos-vista-previa col-md-2">
                              <h7>Perfil</h7>
                              <h7 className="titulo-tabla-resultados">
                                {row.perfil}
                              </h7>
                            </div>
                            <div className="campos-vista-previa col-md-2">
                              <h7>Clave fabricante</h7>
                              <h7 className="titulo-tabla-resultados">
                                {row.clavefabricante}
                              </h7>
                            </div>
                            <div className="campos-vista-previa col-md-2">
                              <h7>Clave LC</h7>
                              <h7 className="titulo-tabla-resultados">
                                {row.clavelacapital}
                              </h7>
                            </div>
                            <div className="campos-vista-previa col-md-2">
                              <h7>Clave SYR</h7>
                              <h7 className="titulo-tabla-resultados">
                                {row.clavesellosyr}
                              </h7>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))
                .slice(0, 70)}
            </tbody>
          </table>
          {/* {searchList
            .map((row) => <TablaResultadosBusqueda data={row} />)
            .slice(0, 10)} */}
        </div>
      </div>
    </>
  );
};

export default BuscadorUI;
