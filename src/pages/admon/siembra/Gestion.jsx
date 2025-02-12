import React, { useContext } from "react";
import { MenuAjustesContext } from "../../../contexts/context-menu-ajustes";
import { BiArrowBack } from "react-icons/bi";
import Solicitudes from "./Solicitudes";

const Gestion = () => {
  const { posicionMenu, setPosicionMenu } = useContext(MenuAjustesContext);

  return (
    <>
      <div className="contenedor-columnas1">
        <div className="columnaIzquierda">
          <div className="row-col-izq-up">
            <h5>Gestión de Siembra de productos</h5>
          </div>
        </div>
        <div className="columnaDerecha1">
          <div
            style={{ width: "73%", marginRight: "2%", fontSize: "1.2rem" }}
          ></div>
          <div className="divRegresar">
            {/* <div className="regresar"> */}
            <button
              onClick={() => {
                setPosicionMenu("");
              }}
              className="item"
            >
              <BiArrowBack />
              Regresar
            </button>
            {/* </div> */}
          </div>
        </div>
      </div>
      <div style={{paddingTop: "15px"}}>
        <ul class="nav nav-tabs" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link active"
              id="home-tab"
              data-bs-toggle="tab"
              data-bs-target="#home"
              type="button"
              role="tab"
              aria-controls="home"
              aria-selected="true"
            >
              Solicitudes
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="profile-tab"
              data-bs-toggle="tab"
              data-bs-target="#profile"
              type="button"
              role="tab"
              aria-controls="profile"
              aria-selected="false"
            >
              Por procesar
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="contact-tab"
              data-bs-toggle="tab"
              data-bs-target="#contact"
              type="button"
              role="tab"
              aria-controls="contact"
              aria-selected="false"
            >
              Procesadas
            </button>
          </li>
        </ul>
        <div class="tab-content" id="myTabContent">
          <div
            class="tab-pane fade show active"
            id="home"
            role="tabpanel"
            aria-labelledby="home-tab"
          >
            <Solicitudes />
          </div>
          <div
            class="tab-pane fade"
            id="profile"
            role="tabpanel"
            aria-labelledby="profile-tab"
          >
            ...
          </div>
          <div
            class="tab-pane fade"
            id="contact"
            role="tabpanel"
            aria-labelledby="contact-tab"
          >
            ...
          </div>
        </div>
      </div>
    </>
  );
};

export default Gestion;
