import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { show_alerta } from "../functions";

const ModalImportacionLogistica = ({ show, handleClose, onImport }) => {
  const [dataExcel, setDataExcel] = useState("");

  const handleProcesar = () => {
    if (!dataExcel.trim()) {
      show_alerta("El área de pegado está vacía", "warning");
      return;
    }

    const lineas = dataExcel.trim().split("\n");
    const nuevasPartidas = [];

    lineas.forEach((lineaTexto, i) => {
      const campos = lineaTexto.split(/\t/);
      if (campos.length >= 2) {
        // Orden: Desc | Clave | Cant | Sucursal | Línea | Sección | Origen
        const [desc, clave, cant, sucursal, lineaProd, seccion, origen] = campos;
        
        nuevasPartidas.push({
          descripcion: desc?.trim() || "",
          clave: clave?.trim() || "S/C",
          cantidad: cant?.trim() || "1",
          sucursal: sucursal?.trim() || "N/A",
          linea: lineaProd?.trim() || "N/A",
          seccion: seccion?.trim() || "",
          origen: origen?.trim() || "",
          isLogistica: true
        });
      }
    });

    if (nuevasPartidas.length > 0) {
      onImport(nuevasPartidas);
      setDataExcel("");
      handleClose();
    } else {
      show_alerta("No se detectaron datos válidos para procesar", "error");
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Importación Logística desde Excel</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="alert alert-info py-2" style={{ fontSize: "0.85rem" }}>
          <strong>Formato requerido:</strong> Copie las siguientes columnas de su Excel:<br />
          <code>Desc | Clave | Cant | Sucursal | Línea | Sección | Origen</code>
        </div>
        <textarea
          className="form-control"
          rows={12}
          placeholder="Pegue aquí el contenido de las celdas de Excel..."
          style={{ fontFamily: "monospace", fontSize: "0.9rem" }}
          onChange={(e) => setDataExcel(e.target.value)}
          value={dataExcel}
        ></textarea>
      </Modal.Body>
      <Modal.Footer style={{ padding: "1rem", gap: "0.5rem" }}>
        <Button 
          variant="secondary" 
          onClick={handleClose}
          className="btn-modal-cancelar"
        >
          Cancelar
        </Button>
        <Button 
          variant="outline-secondary" 
          onClick={handleProcesar}
          className="btn-modal-importar"
        >
          Procesar e Importar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalImportacionLogistica;
