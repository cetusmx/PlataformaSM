import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Form, Alert } from "react-bootstrap";
//import xmlDocument from "../xmlFactura.xml";
import "../styles/codigobarras.css";

const CodigoBarras = () => {
  const [xmlContent, setXmlContent] = useState("");
  const [error, setError] = useState("");
  const [listaProductos, setListaProductos] = useState([]);

  const [isFileUploaded, setIsFileUploaded] = useState(true);

//xmlDocument
  var namespace = "http://www.sat.gob.mx/cfd/4";
  var parser = new DOMParser();
  var xml = parser.parseFromString(xmlContent, "text/xml");
  var producto = xml.getElementsByTagNameNS(namespace, "Concepto");
  let productos = new Array();

  for (let j = 0; j < producto.length; j++) {
    const canti = producto[j].getAttribute("Cantidad");
    const noId = producto[j].getAttribute("NoIdentificacion");
    let partida = { cantidad: canti, producto: noId };
    productos.push(partida);
  }

  const handleFileUpload = (e) => {
    
    setIsFileUploaded(false);
    const file = e.target.files[0];

    if (!file) {
      setError("No se seleccionó archivo.");
      return;
    }

    if (!file.name.endsWith(".xml")) {
      setError("Suba un archivo XML válido.");
      return;
    }

    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      setXmlContent(event.target.result);
    };

    reader.onerror = () => {
      setError("Error al leer el archivo.");
    };

    reader.readAsText(file);

  };

  return (
    <>
    { isFileUploaded ? (
      <Container className="my-4">
        <Form.Group>
          <Form.Label>Subir factura en formato XML:</Form.Label>
          <Form.Control type="file" accept=".xml" onChange={handleFileUpload} />
        </Form.Group>
        {xmlContent && (
          <div className="mt-4">
            <h7>Contenido en Factura</h7>
          </div>
        )}
      </Container>)  : ( <div></div>)}
      { productos.length>0 ? ( <div className="contenedor">
        <table className="table table-striped">
          <thead>
            <tr>
              <th style={{textAlign:"center"}} scope="col">Cantidad</th>
              <th scope="col">Producto</th>
              <th style={{textAlign:"center"}} scope="col">Generar código</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((val, key) => {
              return (
                <tr key={val.id}>
                  <td style={{textAlign:"center"}} >{val.cantidad}</td>
                  <td>{val.producto}</td>
                  <td>
                    <div
                      className="centrar"
                      role="group"
                      aria-label="Basic example"
                    >
                      <input
                        type="checkbox"
                        id="codeCheckbox"
                        value="true"
                      ></input>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>):(
        <div></div>
      )}
    </>
  );
};

export default CodigoBarras;
