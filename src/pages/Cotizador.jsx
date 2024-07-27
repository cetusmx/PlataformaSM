import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { Nav } from "../components/Nav";
import { useState, useEffect } from "react";
import Axios from "axios";

export const Cotizador = () => {
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

  const [margen, setMargen] = useState();

  const calculaPrecio = () => {
    getMargen();
    const margenFormateado = parseFloat(1.0 - margen);
    console.log("Margen formateado " + margenFormateado);
    const costoFormateado = parseFloat(costo);
    console.log("Costo formateado " + costoFormateado);
    const precioFormateado = Math.ceil(costoFormateado / margenFormateado);

    let convertedPrecioToString = String(precioFormateado);
    console.log(convertedPrecioToString);
    setPrecio(precioFormateado);

    let labelElement = document.getElementById("sucu");
    labelElement.innerText = "Durango";
  };

  const getMargen = () => {
    Axios.get(`https://servcotiza.onrender.com/getmargen`, {
      params: {
        familia: familia,
        sucursal: sucursal,
      },
    }).then((response) => {
      setMargen(response.data[0].margen);
      console.log("Margen dentro Axios: " + response.data[0].margen);
    });
  };

  const populateFamiliaSelect = () => {
    Axios.get("https://servcotiza.onrender.com/getfamilias").then((response) => {
      setFamiliasselect(response.data);
      response.data.map((opcion) => {
        var option = document.createElement("option");
        option.text = opcion.familia;
        option.value = opcion.familia;
        var select = document.getElementById("familiasSelect");
        select.append(option);
        return console.log(opcion.familia);
      });
    });
  };

  return (
    <>
      <div className="row">
        <div className="col">
          <Nav />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <br />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <Card className="text-center">
            <Card.Header style={{ backgroundColor: "#D6DBDF" }}>
              <h2>Cotizador</h2>
            </Card.Header>
            <Card.Body>
              <label className="mb-2">Ingresa Costo</label>
              <input
                onChange={(event) => {
                  setCosto(event.target.value);
                  setSucursal("Durango");
                }}
                type="text"
                className="form-control pxt-5"
                placeholder="Ingresa costo en factura del proveedor"
                aria-label="Username"
                aria-describedby="basic-addon1"
              />
              <label className="mt-3 mb-2">Familia</label>
              <select
                id="familiasSelect"
                value={familia}
                onChange={(event) => {
                  setFamilia(event.target.value);
                }}
                className="form-select"
              >
                <option selected>-- Seleccionar familia --</option>
                
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
              <h2>Resultado</h2>
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
                <label id="sucu"></label>
              </h3>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </>
  );
};
