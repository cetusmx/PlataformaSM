import React, { useState, useContext, useEffect } from "react";
import "../styles/siembraProds.css";
import { show_alerta } from "../functions";
import Axios from "axios";
import { DataContext } from "../contexts/dataContext";
import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";

const SiembraProds = () => {
  const [clave, setClave] = useState("");
  const [value, setValue] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [sucursal1, setSucursal1] = useState("");
  const [preciosList, setPreciosList] = useState([]);
  const [totalCab, setTotalCab] = useState("0");
  const [price, setPrice] = useState("0");
  const [qty, setQty] = useState("1");
  const urlServidorAPI = "http://18.224.118.226:3001";

  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;
  const infoUsuario = contextData;

  useEffect(() => {
    // Agrega opciones al Select cuando carga la página por primera vez
    setSucursal1(infoUsuario.sucursal);
    getPrecios();
    console.log("Dentro UseEffect");
  }, []);

  let getPrecios = () => {
    Axios.get(urlServidorAPI + `/getprecios/`, {
      params: {
        sucursal: infoUsuario.sucursal,
      },
    }).then((response) => {
      setPreciosList(response.data);
      //console.log(response.data);
    });
  };

  //Insertar nueva siembra
  const guardar = () => {
    const date = new Date().toJSON().slice(0, 10);

    Axios({
      method: "POST",
      url: urlServidorAPI + "/insertarSiembra",
      data: {
        fecha: date,
        clave: clave,
        observaciones: observaciones,
        sucursal: sucursal1,
      },
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

    clearControles();
  };

  const clearControles = () => {
    setClave("");
    setValue("");
    setObservaciones("");
  };

  const onSearch = (searchTerm) => {
    //console.log(searchTerm);
    setValue(searchTerm); //Se coloca el valor en el input "Clave prod"
    const filtrado = preciosList.find((item) =>
      item.clave.toUpperCase().includes(searchTerm.toUpperCase())
    );
    /* const filtrado = preciosList.filter((item) =>
      item.clave.toUpperCase().includes(searchTerm.toUpperCase())
    ); */
    console.log(filtrado);
    const precio_ = filtrado.precio;
    /* const precio_ = filtrado.map((item) => item.precio); */
    const totalInp = qty * precio_;
    setTotalCab(totalInp);
    setPrice(precio_);
  };

  return (
    <div className="contenedor-siembra-prods">
      <div className="formulario-siembra">
        <div style={{ paddingTop: "30px" }}>
          <h5>Registro de faltantes en sucursal {infoUsuario.sucursal}</h5>
        </div>
        <div className="form-container">
          <form>
            <div className="row">
              <div class="form-group st"  style={{ width: "20%" }}>
                <label for="cantidad" /* class="form-label" */>
                  Cantidad
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="cantidad"
                  /* placeholder="Enter email" */
                  name="cantidad"
                />
              </div>
              <div class="form-group st" style={{ width: "40%" }}>
                <label for="exampleFormControlInput1">
                  Clave (propia o de proveedor)
                </label>
                <input
                  value={value}
                  onChange={(event) => {
                    setValue(event.target.value);
                  }}
                  type="text"
                  class="form-control"
                  id="exampleFormControlInput1"
                  /* placeholder="Formato proveedor o fabricante" */
                ></input>
                <div className="dropdown">
                  {preciosList
                    .filter((item) => {
                      const searchTerm = value.toLowerCase();
                      const clave = item.clave.toLowerCase();

                      return (
                        searchTerm &&
                        clave.startsWith(searchTerm) &&
                        clave !== searchTerm
                      );
                    })
                    .slice(0, 10)
                    .map((item) => (
                      <div
                        onClick={() => onSearch(item.clave)}
                        className="dropdown-row"
                        key={item.clave}
                      >
                        {item.clave}
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div class="form-group st">
              <label for="exampleFormControlTextarea1">Observaciones</label>
              <textarea
                value={observaciones}
                onChange={(event) => {
                  setObservaciones(event.target.value);
                }}
                class="form-control"
                id="exampleFormControlTextarea1"
                rows="3"
              ></textarea>
            </div>
            <div className="form-group">
              <button type="button" class="btn btn-primary" onClick={guardar}>
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="sidebar-right-faltantes">
        <div className="mensaje-faltantes"></div>
        <div className="instrucciones-faltantes">
        <div
              style={{ justifyItems: "right", marginLeft: "1%" }}
            >
              <Card style={{ width: "100%" }}>
                <Card.Header><strong>Atención</strong></Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                   <p>En el campo <i>Cantidad</i>, escribir el número de piezas faltantes para completar el pedido del cliente.</p>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SiembraProds;
