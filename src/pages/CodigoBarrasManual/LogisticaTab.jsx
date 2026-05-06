import React from "react";
import { BiBarcode } from "react-icons/bi";

const LogisticaTab = ({ logisticaImported, onOpenModal }) => {
  if (logisticaImported) {
    return (
      <div className="logistica-importada"></div>
    );
  }

  return (
    <div className="formulario-logistica d-flex flex-column align-items-center justify-content-center py-4">
      <BiBarcode size={60} color="#6c757d" className="mb-3" />
      <h5>Importación Logística</h5>
      <p className="text-muted text-center mb-4">
        Cargue de forma masiva los datos de sus etiquetas desde Excel.
      </p>
      <button
        className="btn btn-outline-secondary btn-lg"
        onClick={onOpenModal}
      >
        Importar desde Excel
      </button>
    </div>
  );
};

export default LogisticaTab;
