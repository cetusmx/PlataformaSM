import React from "react";
import "./card-busqueda.css";
import logo from "../../../assets/Logo20.jpeg";

const Card = (props) => {
  console.log(props);

  return (
    <>
      <div class="card" style={{ marginRight: "7px" }}>
        <div
          class="card-header"
          style={{ fontWeight: 500, fontSize: "0.9rem" }}
        >
          {props.producto.clave}
        </div>
        <div class="card-body" style={{ marginBottom: "-15px" }}>
          <h5 class="card-title" style={{ fontSize: "1rem" }}>
            {props.producto.descripcion}
          </h5>
          <div className="linea-sistema">
            <div>
              <p class="card-text">
                <h7>Línea </h7>
                {props.producto.linea}
              </p>
            </div>
            <div>
              <p class="card-text">
                <h7>Sistema medición </h7>
                {props.producto.sistemamedicion}
              </p>
            </div>
          </div>

          <div className="contenedor-busqueda">
            <div className="table-container-left">
              <table className="tabla-card">
                <tbody>
                  <tr>
                    <td className="left-cell-busqueda">
                      <label>Perfil </label>
                    </td>
                    <td className="right-cell-busqueda">
                      {props.producto.perfil}
                    </td>
                  </tr>
                  <tr>
                    <td className="left-cell-busqueda">
                      <label>Diám. int. </label>
                    </td>
                    <td className="right-cell-busqueda">
                      {props.producto.diametrointerior}
                    </td>
                  </tr>
                  <tr>
                    <td className="left-cell-busqueda">
                      <label>Diám. ext. </label>
                    </td>
                    <td className="right-cell-busqueda">
                      {props.producto.diametroexterior}
                    </td>
                  </tr>
                  <tr>
                    <td className="left-cell-busqueda">
                      <label>Altura </label>
                    </td>
                    <td className="right-cell-busqueda">
                      {props.producto.altura}
                    </td>
                  </tr>
                  <tr>
                    <td className="left-cell-busqueda">
                      <label>Sección </label>
                    </td>
                    <td className="right-cell-busqueda">
                      {props.producto.seccion}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="table-container-right">
              <table className="tabla-card">
                <tbody>
                  <tr>
                    <td className="left-cell-busqueda-right">
                      <label>Marca </label>
                    </td>
                    <td className="right-cell-busqueda-right">
                      {props.producto.marca}
                    </td>
                  </tr>
                  <tr>
                    <td className="left-cell-busqueda-right">
                      <label>Clave fab. </label>
                    </td>
                    <td className="right-cell-busqueda-right">
                      {props.producto.clavefabricante}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="contenedor-busqueda">
            <div className="table-container-left">
              <table className="tabla-card">
                <tbody>
                  <tr>
                    <td className="left-cell-busqueda">
                      <label>Material </label>
                    </td>
                    <td className="right-cell-busqueda">
                      {props.producto.material}
                    </td>
                  </tr>
                  <tr>
                    <td className="left-cell-busqueda">
                      <label>Temperatura </label>
                    </td>
                    <td className="right-cell-busqueda">
                      {props.producto.temperatura}
                    </td>
                  </tr>
                  <tr>
                    <td className="left-cell-busqueda">
                      <label>Presión </label>
                    </td>
                    <td className="right-cell-busqueda">
                      {props.producto.presion}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="table-container-right">
              <table className="tabla-card">
                <tbody>
                  <tr>
                    <td className="left-cell-busqueda-right">
                      <label>Clave anterior </label>
                    </td>
                    <td className="right-cell-busqueda-right">
                      {props.producto.claveanterior}
                    </td>
                  </tr>
                  <tr>
                    <td className="left-cell-busqueda-right">
                      <label>Clave SYR </label>
                    </td>
                    <td className="right-cell-busqueda-right">
                      {props.producto.clavesellosyr}
                    </td>
                  </tr>
                  <tr>
                    <td className="left-cell-busqueda-right">
                      <label>Clave LC </label>
                    </td>
                    <td className="right-cell-busqueda-right">
                      {props.producto.clavelacapital}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="contenedor-busqueda">
            <div className="table-container-left-logo">
              <img
                src={`${process.env.PUBLIC_URL}/Perfiles/${props.producto.linea}.jpg`}
                alt="logo"
                className="imagen-busqueda"
              />
            </div>
            <div className="table-container-right">
              <table className="tabla-card">
                <tbody>
                  <tr>
                    <td className="left-cell-busqueda-right">
                      <label>Unidad ent. </label>
                    </td>
                    <td className="right-cell-busqueda-right">
                      {props.producto.unidad}
                    </td>
                  </tr>
                  <tr>
                    <td className="left-cell-busqueda-right">
                      <label>Existencias </label>
                    </td>
                    <td className="right-cell-busqueda-right">
                      {props.producto.existencias}
                    </td>
                  </tr>
                  <tr>
                    <td className="left-cell-busqueda-right">
                      <label>Costo prom. </label>
                    </td>
                    <td className="right-cell-busqueda-right">
                      {props.producto.costopromedio}
                    </td>
                  </tr>
                  <tr>
                    <td className="left-cell-busqueda-right">
                      <label>Último costo </label>
                    </td>
                    <td className="right-cell-busqueda-right">
                      {props.producto.ultimocosto}
                    </td>
                  </tr>
                  <tr>
                    <td className="left-cell-busqueda-right">
                      <label>F. últ. compra </label>
                    </td>
                    <td className="right-cell-busqueda-right">
                      {props.producto.fechaultimacompra}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Card;
