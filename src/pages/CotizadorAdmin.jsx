import React, { useEffect, useContext, useState } from "react";
import Card from "react-bootstrap/Card";
import Axios from "axios";
import "../styles/cotizador.css";
import Button from "react-bootstrap/Button";

import { DataContext } from "../contexts/dataContext";

let sucursales = [
  {
    sucursal: "Durango",
    price: "",
  },
  {
    sucursal: "Fresnillo",
    price: "",
  },
  {
    sucursal: "Mazatlán",
    price: "",
  },
  {
    sucursal: "Zacatecas",
    price: "",
  },
  {
    sucursal: "Tecmin",
    price: "",
  },
  {
    sucursal: "Mayorista",
    price: "",
  },
];

const CotizadorAdmin = () => {
  const url = "https://sealmarket.net/api1";

  useEffect(() => {
    // Agrega opciones al Select cuando carga la página por primera vez
    populateFamiliaSelect();
    /* console.log("Dentro UseEffect"); */
  }, []);

  const [costo, setCosto] = useState();
  const [precioDgo, setPrecioDgo] = useState([]);
  const [precioFllo, setPrecioFllo] = useState([]);
  const [precioZac, setPrecioZac] = useState([]);
  const [precioMzt, setPrecioMzt] = useState([]);
  const [precioTecmin, setPrecioTecmin] = useState([]);
  const [precioMayorista, setPrecioMayorista] = useState([]);
  const [familia, setFamilia] = useState();
  const [familiasSelect, setFamiliasselect] = useState();
  const [sucursal, setSucursal] = useState();

  const [margen, setMargen] = useState(0.0);

  const calculaPrecio = () => {
   
    /** Obtener precios de cada sucursal */
    sucursales.map((object) => {
      const newObject = { ...object };

      Object.keys(newObject).map((property) => {
        if (property === "sucursal") {
          /* console.log(newObject[property]); */
          console.log(getMargen(newObject[property]));
        }
      });
    });

    /* console.log("Dentro calculaPre D " + precioDgo);
    console.log("Dentro calculaPre F " + precioFllo);
    console.log("Dentro calculaPre Z " + precioZac);
    console.log("Dentro calculaPre M " + precioMzt);
    console.log("Dentro calculaPre T " + precioTecmin); */

    //const listOfUpdatedObjects = updateObjects(sucursales);

    //setPrecio(listOfUpdatedObjects);
    /* console.log(sucursales); */
  };

  function updateObjects(objects) {
    return objects.map((object) => {
      /* console.log(object); */
      const newObject = { ...object };

      Object.keys(newObject).map((property) => {
        if (property === "sucursal") {
          console.log("Dentro keys object " + newObject[property]);
          /* console.log(property); */
          /* let precio_ = getMargen(newObject[property]); */
          console.log("Preciooo " + getMargen(newObject[property]));
          newObject["price"] = getMargen(newObject[property]);
          /* console.log(newObject["price"]); */
        }
      });
      /* console.log(newObject); */
      return newObject;
    });
  }

  let getMargen = (sucursa) => {
    Axios.get(url + `/getmargen/`, {
      params: {
        familia: familia,
        sucursal: sucursa,
      },
    }).then((response) => {
      setMargen(response.data[0].margen);
      /* console.log("Margen dentro Axios: " + response.data[0].margen); */
      const margenFormateado = parseFloat(1.0 - response.data[0].margen);
      const costoFormateado = parseFloat(costo);
      const precioFormateado = Math.ceil(costoFormateado / margenFormateado);
      let convertedPrecioToString = String(precioFormateado);
     /*  console.log("Precio: " + sucursa + " -> " + convertedPrecioToString); */
      if(sucursa==="Durango"){
        setPrecioDgo(convertedPrecioToString);
        console.log("Dgo");
      } if(sucursa==="Fresnillo"){
        setPrecioFllo(convertedPrecioToString);
        console.log("Fres");
      }if(sucursa==="Zacatecas"){
        setPrecioZac(convertedPrecioToString);
        console.log("Zaca");
      }if(sucursa==="Mazatlán"){
        setPrecioMzt(convertedPrecioToString);
        console.log("Mzt");
      }if(sucursa==="Tecmin"){
        setPrecioTecmin(convertedPrecioToString);
        console.log("Tecm");
      }if(sucursa==="Mayorista"){
        setPrecioMayorista(convertedPrecioToString);
        console.log("Mayor");
      }
      /* setPrecio([...precio, precioFormateado]); */
    });
  };

  const populateFamiliaSelect = () => {
    Axios.get(url + "/getfamilias/").then((response) => {
      setFamiliasselect(response.data);
      response.data.map((opcion) => {
        var option = document.createElement("option");
        option.text = opcion.familia;
        option.value = opcion.familia;
        var select = document.getElementById("familiasSelect");
        select.append(option);
        //return console.log(opcion.familia);
      });
    });
  };

  return (
    <>
      <div className="row">
        <div className="col">
          <br />
        </div>
      </div>
      <div className="row">
        <div className="col-5">
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
                  /* setSucursal(infoUsuario.sucursal); */
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
        {precioDgo?.length > 0 && (
        <div className="col-7">
          <ul
            className="list-group list-group-horizontal"
            style={{ width: "100%" }}
          >
            <li className="list-group-item">
              <div className="row">
                <div className="col">
                  <div
                    style={{
                      width: "100%",
                      borderBottom: "1px solid #dfe2e6",
                      margin: "10px 0 10px 0",
                    }}
                  >
                    Durango
                  </div>
                  <div className="col">
                    <div style={{ width: "100%", margin: "10px 0 10px 0", textAlign: "center" }}>
                      {precioDgo}
                    </div>
                  </div>
                </div>
                <div className="col">
                  <div
                    style={{
                      width: "100%",
                      borderBottom: "1px solid #dfe2e6",
                      margin: "10px 0 10px 0",
                    }}
                  >
                    Fresnillo
                  </div>
                  <div className="col">
                    <div style={{ width: "100%", margin: "10px 0 10px 0", textAlign: "center" }}>
                      {precioFllo}
                    </div>
                  </div>
                </div>
                <div className="col">
                  <div
                    style={{
                      width: "100%",
                      borderBottom: "1px solid #dfe2e6",
                      margin: "10px 0 10px 0",
                    }}
                  >
                    Mazatlán
                  </div>
                  <div className="col">
                    <div style={{ width: "100%", margin: "10px 0 10px 0", textAlign: "center" }}>
                      {precioMzt}
                    </div>
                  </div>
                </div>
                <div className="col">
                  <div
                    style={{
                      width: "100%",
                      borderBottom: "1px solid #dfe2e6",
                      margin: "10px 0 10px 0",
                    }}
                  >
                    Zacatecas
                  </div>
                  <div className="col">
                    <div style={{ width: "100%", margin: "10px 0 10px 0", textAlign: "center" }}>
                      {precioZac}
                    </div>
                  </div>
                </div>
                <div className="col">
                  <div
                    style={{
                      width: "100%",
                      borderBottom: "1px solid #dfe2e6",
                      margin: "10px 0 10px 0",
                    }}
                  >
                    Tecmin
                  </div>
                  <div className="col">
                    <div style={{ width: "100%", margin: "10px 0 10px 0", textAlign: "center" }}>
                      {precioTecmin}
                    </div>
                  </div>
                </div>
                <div className="col">
                  <div
                    style={{
                      width: "100%",
                      borderBottom: "1px solid #dfe2e6",
                      margin: "10px 0 10px 0",
                    }}
                  >
                    Mayorista
                  </div>
                  <div className="col">
                    <div style={{ width: "100%", margin: "10px 0 10px 0", textAlign: "center" }}>
                      {precioMayorista}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        )}
      </div>
    </>
  );
};

export default CotizadorAdmin;
