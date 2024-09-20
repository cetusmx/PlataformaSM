import React, { useContext } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useState, useEffect } from "react";
import Axios from "axios";
import "../styles/cotizador.css";

import { DataContext } from "../contexts/dataContext";

const Cotizador = () => {

  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;
  const {contextsideBarNav, setContextSidebarNav} = valor2;

  const infoUsuario = contextData;
  console.log("Corrmail: " + infoUsuario.email);

  useEffect(() => {
    // Agrega opciones al Select cuando carga la página por primera vez
    populateFamiliaSelect();
    console.log("Dentro UseEffect");
  }, []);

  const [costo, setCosto] = useState();
  const [precio, setPrecio] = useState();
  const [familia, setFamilia] = useState();
  const [familiasSelect, setFamiliasselect] = useState();
  const [sucursal, setSucursal] = useState();

  const [margen, setMargen] = useState(0.0);

  const calculaPrecio = () => {
    const m = getMargen();

    /* let labelElement = document.getElementById("sucu");
    labelElement.innerText = "Durango"; */
  };

  let getMargen = () => {
    Axios.get(`https://servcotiza.onrender.com/getmargen`, {
      params: {
        familia: familia,
        sucursal: sucursal,
      },
    }).then((response) => {
      setMargen(response.data[0].margen);
      console.log("Margen dentro Axios: " + response.data[0].margen);
      const margenFormateado = parseFloat(1.0 - response.data[0].margen);
      const costoFormateado = parseFloat(costo);
      const precioFormateado = Math.ceil(costoFormateado / margenFormateado);
      let convertedPrecioToString = String(precioFormateado);
      console.log("Precio: " + convertedPrecioToString);
      setPrecio(precioFormateado);
    });
  };

  const populateFamiliaSelect = () => {
    Axios.get("https://servcotiza.onrender.com/getfamilias").then(
      (response) => {
        setFamiliasselect(response.data);
        response.data.map((opcion) => {
          var option = document.createElement("option");
          option.text = opcion.familia;
          option.value = opcion.familia;
          var select = document.getElementById("familiasSelect");
          select.append(option);
          //return console.log(opcion.familia);
        });
      }
    );
  };

  return (
    <>
      <div className="row">
        <div className="col">
          <br />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <Card className="text-center">
            <Card.Header style={{ backgroundColor: "#D6DBDF" }}>
              <div className="encab">
                {/* <BiCalculator className="icono" /> */}
                Calcular
              </div>
            </Card.Header>
            <Card.Body>
              <label className="mb-2">Ingresa Costo</label>
              <input
                onChange={(event) => {
                  setCosto(event.target.value);
                  setSucursal(infoUsuario.sucursal);
                }}
                type="text"
                className="form-control pxt-5"
                placeholder="Ingresa costo en factura del proveedor"
                aria-label="Username"
                aria-describedby="basic-addon1"
              />
              <label className="mt-3 mb-2">Familia</label>
              <select
                defaultValue={"DEFAULT"}
                id="familiasSelect"
                value={familia}
                onChange={(event) => {
                  setFamilia(event.target.value);
                }}
                className="form-select"
              >
                <option value="DEFAULT" disabled>
                  -- Seleccionar familia --
                </option>
              </select>
            </Card.Body>
            <Card.Footer
              className="text-muted pt-2 pb-2"
              style={{ backgroundColor: "#D6DBDF" }}
            >
              <Button style={{ width: "200px" }} onClick={calculaPrecio}>
                Calcular
              </Button>
            </Card.Footer>
          </Card>
        </div>
        <div className="col">
          <Card className="text-center">
            <Card.Header style={{ backgroundColor: "#D6DBDF" }}>
            <div className="encab">
                {/* <BiCalculator className="icono" /> */}
                Resultado
              </div>
            </Card.Header>
            <Card.Body>
              <label className="mb-2">Precio de venta</label>
              <input
                value={precio}
                type="text"
                readOnly="true"
                className="form-control pxt-5"
                placeholder=""
                aria-label="Username"
                aria-describedby="basic-addon1"
              />
              <label className="mt-3 mb-2">Sucursal</label>
              <input
                value={precio}
                type="text"
                readOnly="true"
                className="form-control pxt-5"
                placeholder=""
                aria-label="Username"
                aria-describedby="basic-addon1"
              />
            </Card.Body>
            <Card.Footer
              className="text-muted pt-1 pb-2"
              style={{ backgroundColor: "#D6DBDF" }}
            >
              <h3>
                <label id="sucu">{infoUsuario.sucursal}</label>
              </h3>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </>
  );
};
export default Cotizador;
