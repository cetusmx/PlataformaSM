import React, { useState, useContext, useEffect } from "react";
import "../styles/siembraProds.css";
import { show_alerta } from "../functions";
import Axios from "axios";
import { DataContext } from "../contexts/dataContext";

const SiembraProds = () => {
  const [clave, setClave] = useState("");
  const [familia, setFamilia] = useState("");
  const [motivo, setMotivo] = useState("Consumo recurrente de un cliente");
  const [veces, setVeces] = useState("Ninguna vez");
  const [observaciones, setObservaciones] = useState("");
  const [sucursal1, setSucursal1] = useState("");
  const [maximo, setMax] = useState("");

  const urlServidorAPI = "http://18.224.118.226:3001";

  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;
  const infoUsuario = contextData;
  
  useEffect(() => {
      // Agrega opciones al Select cuando carga la página por primera vez
      setSucursal1(infoUsuario.sucursal);
      console.log("Dentro UseEffect");
    }, []);

  //Insertar nueva siembra
  const guardar = () => {
    
    Axios({
      method: "POST",
      url: urlServidorAPI + "/insertarSiembra",
      data: {
        clave: clave,
        familia: familia,
        motivo: motivo,
        veces: veces,
        observaciones: observaciones,
        sucursal: sucursal1,
        maximo: maximo,
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
    setFamilia("");
    setObservaciones("");
    setMotivo("Consumo recurrente de un cliente");
    setVeces("Ninguna vez");
    setMax("");
  }

  return (
    <>
      <h6>Sugerir producto para siembra en sucursal</h6>
      <div className="form-container">
        <form>
          <div className="row">
            <div className="col">
              <div class="form-group st">
                <label for="exampleFormControlInput1">Clave (propia o de proveedor)</label>
                <input
                value={clave}
                  onChange={(event) => {
                    setClave(event.target.value);
                  }}
                  type="text"
                  class="form-control"
                  id="exampleFormControlInput1"
                  placeholder="Formato proveedor o fabricante"
                ></input>
              </div>
            </div>
            <div className="col">
              <div class="form-group st">
                <label for="exampleFormControlInput1">Familia sello</label>
                <input
                value={familia}
                  onChange={(event) => {
                    setFamilia(event.target.value);
                  }}
                  type="text"
                  class="form-control"
                  id="exampleFormControlInput1"
                  placeholder="Pistón, U, Guía, Buffer, etc."
                ></input>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div class="form-group st">
                <label for="exampleFormControlInput1">
                  Motivo de la sugerencia
                </label>
                <select 
                defaultValue={"DEFAULT"}
                value={motivo}
                onChange={(event) => {
                  setMotivo(event.target.value);
                }} 
                class="form-control">
                  <option value="DEFAULT">Consumo recurrente de un cliente</option>
                  <option>Consumo recurrente de varios clientes</option>
                  <option>Stock solicitado por un cliente</option>
                </select>
              </div>
            </div>
            <div className="col">
              <div class="form-group st">
                <label for="exampleFormControlSelect1">
                  Veces que se ha vendido
                </label>
                <select
                value={veces}
                defaultValue={"DEFAULT"}
                onChange={(event) => {
                  setVeces(event.target.value);
                }} 
                 class="form-control">
                  <option value="DEFAULT">Ninguna vez</option>
                  <option>1 vez</option>
                  <option>Más de 2 veces</option>
                  <option>Más de 4 veces</option>
                  <option>Más de 6 veces</option>
                </select>
              </div>
            </div>
            <div className="col">
              <div class="form-group st">
                <label for="exampleFormControlInput1">Máximo sugerido</label>
                <input
                value={maximo}
                  onChange={(event) => {
                    setMax(event.target.value);
                  }}
                  type="number"
                  class="form-control"
                  id="exampleFormControlInput1"
                  placeholder="Máximo sugerido"
                ></input>
              </div>
            </div>
          </div>
          <div class="form-group st">
            <label for="exampleFormControlTextarea1">Observaciones</label>
            <textarea
            value={observaciones}
            onChange={(event) => {setObservaciones(event.target.value)}}
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
    </>
  );
};

export default SiembraProds;
