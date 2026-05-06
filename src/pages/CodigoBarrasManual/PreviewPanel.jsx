import React from "react";
import CodeBarPrint from "../CodeBarPrint";

const PreviewPanel = ({ partidasPrint, componentRef, partidas, onPrint }) => {
  return (
    <div className="codigosBarras">
      <div className="codesHeader">
        <h6>Vista previa</h6>
      </div>
      <div className="contenedorEtiquetas2">
        <div className="codebars" ref={componentRef}>
          <CodeBarPrint partidas={partidasPrint} />
        </div>
      </div>
      {partidas?.length > 0 && (
        <div className="div-boton-generar">
          <button
            id="boton-print"
            type="button"
            className="btn btn-outline-secondary"
            onClick={onPrint}
          >
            Imprimir códigos
          </button>
        </div>
      )}
    </div>
  );
};

export default PreviewPanel;
