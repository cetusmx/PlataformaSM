import React from "react";
import CodeBarPrint from "../CodeBarPrint";

const PreviewPanel = ({ partidasPrint, componentRef, partidas, onPrint }) => {
  return (
    <div className="codigosBarras">
      <div className="codesHeader">
        <h6 className="ec-card-title mb-1">Vista previa</h6>
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
            className="btn btn-sm btn-outline-secondary ec-control-sm"
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
