import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Form, Alert } from "react-bootstrap";

const CodigoBarras = () => {
  const [xmlContent, setXmlContent] = useState("");
  const [error, setError] = useState("");

  const handleFileUpload = (e) => {
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
      <Container className="my-4">
        <Form.Group>
          <Form.Label>Subir factura en formato XML:</Form.Label>
          <Form.Control type="file" accept=".xml" onChange={handleFileUpload} />
        </Form.Group>
        {xmlContent && (
          <div className="mt-4">
            <h5>Contenido XML</h5>
            {/* <XMLViewer
          xml={xmlContent}
          />  */}
          </div>
        )}
      </Container>
    </>
  );
};

export default CodigoBarras;
