import React, { useEffect, useState } from "react";
import Axios from "axios";
import { BiFilterAlt } from "react-icons/bi";
import Card from "./Card";
import Prod from "./Producto";

const TablaProductosResumida = () => {
  const [productos, setProductos] = useState([]);
  const [claveBuscada, setClaveBuscada] = useState("");
  const [searchList, setSearchList] = useState("");
  const [claveModal, setClaveModal] = useState("");
  const [resultado, setResultado] = useState([]);
  const urlServidorAPI = "http://18.224.118.226:3002";

  useEffect(() => {
    getProductos();
  }, []);

  /* useEffect(() => {
    getProducto();
  }, [claveModal]); */

  const getProductos = async () => {
    await Axios.get(urlServidorAPI + `/api/v1/productos`).then((response) => {
      setProductos(response.data.body);
      setSearchList(response.data.body);
      console.log(response.data.body);
    });
  };

  const getProducto = async (claveTr) => {
    await Axios.get(urlServidorAPI + `/api/v1/productos/${claveTr}`).then(
      (response) => {
        const producto = new Prod(response.data.body);
        //let temp = Object.assign(objetoProducto, response.data.body);
        setResultado(producto);
        console.log(producto);
      }
    );
    return resultado;
  };

  let creaObjeto = () => {
    const producto = {
      clave: "",
      descripcion: "",
      unidad: "",
      linea: "",
      existencias: "",
      costopromedio: "",
      ultimocosto: "",
      fechaultimacompra: "",
      diametrointerior: "",
      diametroexterior: "",
      altura: "",
      seccion: "",
      material: "",
      marca: "",
      temperatura: "",
      presion: "",
      clavefabricante: "",
      perfil: "",
      claveanterior: "",
      clavesellosyr: "",
      clavelacapital: "",
      sistemamedicion: "",
    };
    return producto;
  };

  const onChange = (event) => {
    setClaveBuscada(event.target.value);
    // Filter data based on search term
    setSearchList(
      productos
        .filter((item) =>
          item.clave.toUpperCase().includes(event.target.value.toUpperCase())
        )
        .slice(0, 7)
    );
  };

  return (
    <>
      <div>
        <div className="header--activity-busqueda">
          <div className="search-box-busqueda">
            <input
              value={claveBuscada}
              onChange={onChange}
              type="text"
              placeholder="Filtrar por clave"
            />
            <BiFilterAlt style={{ color: "#969393", fontSize: "1.4rem" }} />
          </div>
          <div className="encabezado-busqueda-tabla">Productos</div>
          <div style={{ width: "15%" }}></div>
        </div>
      </div>
      <div>
        {productos?.length > 0 && (
          <table
            className="table table-striped"
            style={{ padding: "3px", autoHeight: true, fontSize: "0.8rem" }}
          >
            <thead>
              <tr style={{ padding: "3px" }}>
                <th scope="col">Clave</th>
                <th scope="col">Descripción</th>
                <th scope="col">Línea</th>
                <th scope="col">Perfil</th>
                <th scope="col">Clave ant.</th>
                <th scope="col">Fecha actualización</th>
              </tr>
            </thead>
            <tbody>
              {searchList
                .map((val, key) => {
                  return (
                    <tr
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        getProducto(val.clave);
                        setClaveModal(val.clave);
                      }}
                      key={val.clave}
                      data-bs-toggle="modal"
                      data-bs-target="#modalSubir"
                    >
                      <td>{val.clave}</td>
                      <td>{val.descripcion}</td>
                      <td>{val.linea}</td>
                      <td>{val.perfil}</td>
                      <td>{val.claveanterior}</td>
                      <td>{val.createdAt}</td>
                    </tr>
                  );
                })
                .slice(0, 8)}
            </tbody>
          </table>
        )}
      </div>
      {/**** MODAL SUBIDA ARCHIVO ******/}
      <div id="modalSubir" className="modal fade" aria-hidden="false">
        <div className="modal-dialog">
          <div className="modal-content">
            <div
              className="modal-body"
              style={{
                marginRight: "-15px",
                marginLeft: "-10px",
              }}
            >
              <div className="container-fluid">
                <div className="row">
                  <div
                    className="col-md-12 mx-auto"
                    style={{
                      fontSize: "1rem",
                    }}
                  >
                    {<Card producto={resultado} />}
                  </div>
                </div>
              </div>
            </div>
            <div
              className="modal-footer"
              style={{ marginBottom: "-7px", marginTop: "-7px" }}
            >
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

export default TablaProductosResumida;
