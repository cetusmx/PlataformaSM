import React, { useState } from 'react';
import "../styles/siembraProds.css";
import { show_alerta } from "../functions";
import Axios from "axios";

const SiembraProds = () => {

    const [clave, setClave] = useState("");
    const [familia, setFamilia] = useState("");
    const [motivo, setMotivo] = useState("");
    const [veces, setVeces] = useState("");
    const [observaciones, setObservaciones] = useState("");

    const urlServidorAPI = "http://18.224.118.226:3001";

  //Insertar nueva lista
  Axios({
    method: "PUT",
    url: urlServidorAPI + "/insertarSiembra",
    data: {
      clave: clave,
      familia: familia,
      motivo: motivo,
      veces: veces,
      observaciones: observaciones,
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

  return (
    <>
      
      <h6>Sugerir producto para siembra en sucursal</h6>
      <div className="form-container">
        <form>
          <div className="row">
            <div className="col">
              <div class="form-group st">
                <label for="exampleFormControlInput1">Clave de proveedor</label>
                <input
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
                onChange={setMotivo}
                class="form-control">
                  <option>Consumo recurrente de un cliente</option>
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
                <select class="form-control">
                  <option>Ninguna vez</option>
                  <option>1 vez</option>
                  <option>Más de 2 veces</option>
                  <option>Más de 4 veces</option>
                  <option>Más de 6 veces</option>
                </select>
              </div>
            </div>
          </div>
          <div class="form-group st">
            <label for="exampleFormControlTextarea1">Observaciones</label>
            <textarea
              class="form-control"
              id="exampleFormControlTextarea1"
              rows="3"
            ></textarea>
          </div>
          <div className="form-group">
            <button type="submit" class="btn btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SiembraProds;
