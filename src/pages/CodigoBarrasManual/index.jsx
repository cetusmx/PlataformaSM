import React from "react";
import { useReactToPrint } from "react-to-print";
import { Modal, Button } from "react-bootstrap";
import useCodigoBarras from "./useCodigoBarras";
import BarcodeTab from "./BarcodeTab";
import SoloTextoTab from "./SoloTextoTab";
import LogisticaTab from "./LogisticaTab";
import LogisticaTable from "./LogisticaTable";
import LogisticaPreview from "./LogisticaPreview";
import PartidasTable from "./PartidasTable";
import PreviewPanel from "./PreviewPanel";
import ModalImportacionLogistica from "../../components/ModalImportacionLogistica";

const CodigoBarrasManual = () => {
  const {
    partidas, partidasPrint, qty, value, sugerencias, descripcion,
    clavesxLote, showLogisticaModal, logisticaImported,
    setQty, setValue, setDescripcion, setClavesxLote, setShowLogisticaModal,
    handleChange, onSearch, agregarPartida, borrar, agregarLote,
    handleImportLogistica, limpiarTodo, componentRef
  } = useCodigoBarras();

  const [activeTab, setActiveTab] = React.useState("barcode");

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    limpiarTodo();
  };

  return (
    <>
      <div className="wrapper">
        <div className="encabezado-cb">
          <h6>Herramienta para la generación de códigos de barras</h6>
          <p style={{ fontSize: "0.8rem" }}>
            Ingrese la cantidad de etiquetas que desee imprimir y la clave del producto.
          </p>
        </div>
        <div className="captura">
          <div className="btn-group-custom mb-3" role="group">
            <button
              type="button"
              className={`btn ${activeTab === "barcode" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => handleTabChange("barcode")}
            >
              Con Código
            </button>
            <button
              type="button"
              className={`btn ${activeTab === "text" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => handleTabChange("text")}
            >
              Solo Texto
            </button>
            <button
              type="button"
              className={`btn ${activeTab === "logistica" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => handleTabChange("logistica")}
            >
              Logística
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "barcode" && (
              <BarcodeTab
                qty={qty}
                value={value}
                sugerencias={sugerencias}
                setDescripcion={setDescripcion}
                onQtyChange={setQty}
                onValueChange={handleChange}
                onSearch={onSearch}
                onAgregar={() => agregarPartida("barcode")}
                onLimpiar={limpiarTodo}
              />
            )}
            {activeTab === "text" && (
              <SoloTextoTab
                qty={qty}
                value={value}
                sugerencias={sugerencias}
                descripcion={descripcion}
                onQtyChange={setQty}
                onValueChange={handleChange}
                onDescripcionChange={setDescripcion}
                onSearch={onSearch}
                onAgregar={() => agregarPartida("text")}
                onLimpiar={limpiarTodo}
              />
            )}
            {activeTab === "logistica" && (
              <LogisticaTab
                logisticaImported={logisticaImported}
                onOpenModal={() => setShowLogisticaModal(true)}
              />
            )}
          </div>

          {(activeTab !== "logistica" || logisticaImported) && (
            <>
              {activeTab === "logistica" ? (
                <>
                  <LogisticaTable partidas={partidas} onBorrar={borrar} />
                  <div className="div-boton-generar">
                    <button
                      id="boton-nueva-importacion"
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={limpiarTodo}
                    >
                      Nueva importación
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <PartidasTable partidas={partidas} onBorrar={borrar} />
                  <div className="div-boton-generar">
                    <button
                      id="boton-print"
                      type="button"
                      className="btn btn-outline-secondary"
                      data-bs-toggle="modal"
                      data-bs-target="#myModal"
                      disabled={activeTab !== "barcode"}
                    >
                      Pegar por Lote
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {(activeTab !== "logistica" || logisticaImported) && partidas.length > 0 && (
          activeTab === "logistica" ? (
            <LogisticaPreview
              partidasPrint={partidasPrint}
              componentRef={componentRef}
              partidas={partidas}
              onPrint={handlePrint}
            />
          ) : (
            <PreviewPanel
              partidasPrint={partidasPrint}
              componentRef={componentRef}
              partidas={partidas}
              onPrint={handlePrint}
            />
          )
        )}
      </div>

      <div className="modal" id="myModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Agregar claves por lote</h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              <h6>Agregue las claves, una en cada fila</h6>
              <textarea
                onChange={(e) => setClavesxLote(e.target.value)}
                name="claves"
                id="claves"
                className="form-control"
                rows={10}
                value={clavesxLote}
              ></textarea>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setClavesxLote("");
                  limpiarTodo();
                }}
                type="button"
                className="btn btn-outline-danger"
              >
                Limpiar
              </button>
              <button
                onClick={() => agregarLote()}
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
              >
                Agregar
              </button>
              <button
                id="btnCerrar"
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModalImportacionLogistica
        show={showLogisticaModal}
        handleClose={() => setShowLogisticaModal(false)}
        onImport={handleImportLogistica}
      />
    </>
  );
};

export default CodigoBarrasManual;
