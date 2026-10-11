import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { BiCheckDouble, BiErrorCircle, BiCheckCircle } from "react-icons/bi";

const ModalFinalizarRecepcion = ({ 
    show, 
    onHide, 
    factura, 
    totalPartidas, 
    validadas, 
    anomalias, 
    onConfirmar,
    guardando 
}) => {
    const [obsGenerales, setObsGenerales] = useState("");

    if (!show) return null;

    const tieneAnomalias = anomalias > 0 || validadas < totalPartidas;

    const handleConfirmar = () => {
        onConfirmar(obsGenerales.trim());
    };

    return (
        <Modal show={show} onHide={onHide} size="md" centered backdrop="static">
            <Modal.Header closeButton className={tieneAnomalias ? "bg-warning bg-opacity-25 py-2" : "bg-success bg-opacity-25 py-2"}>
                <Modal.Title style={{ fontSize: "1rem", fontWeight: "600" }} className="d-flex align-items-center">
                    {tieneAnomalias ? (
                        <>
                            <BiErrorCircle className="me-2 text-danger" size={22} />
                            Finalizar Recepción con Observaciones
                        </>
                    ) : (
                        <>
                            <BiCheckCircle className="me-2 text-success" size={22} />
                            Finalizar Recepción Completa
                        </>
                    )}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-3">
                <div className="bg-light p-2 rounded border mb-3">
                    <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted small">Proveedor:</span>
                        <strong className="small">{factura?.nombre_proveedor}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted small">Factura:</span>
                        <strong className="small">{factura?.folio_factura}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span className="text-muted small">Validación:</span>
                        <span className="small">
                            <strong>{validadas}</strong> de <strong>{totalPartidas}</strong> partidas validadas
                        </span>
                    </div>
                </div>

                {tieneAnomalias ? (
                    <Alert variant="warning" className="py-2 px-3 small mb-3">
                        <div className="fw-bold mb-1">
                            ⚠️ Hay {anomalias} partida(s) con anomalías / diferencias reportadas.
                        </div>
                        Se notificará al Comprador para que gestione con el proveedor la reposición física o la nota de crédito correspondiente.
                    </Alert>
                ) : (
                    <Alert variant="success" className="py-2 px-3 small mb-3">
                        ✓ Todas las partidas fueron verificadas al 100%. Se notificará a Compras como <strong>Recibida Completa</strong> para generar la Orden de Compra.
                    </Alert>
                )}

                <Form.Group className="mb-2">
                    <Form.Label className="small fw-bold">
                        Observaciones generales de la entrega (Opcional):
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        size="sm"
                        placeholder="Ej. Paquete exterior con golpe leve, transportista Castores..."
                        value={obsGenerales}
                        onChange={(e) => setObsGenerales(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>

            <Modal.Footer className="py-2">
                <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={guardando}>
                    Volver al Escaneo
                </Button>
                <Button 
                    variant={tieneAnomalias ? "danger" : "success"} 
                    size="sm" 
                    onClick={handleConfirmar}
                    disabled={guardando}
                >
                    {guardando ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-1" /> Notificando...
                        </>
                    ) : (
                        <>
                            <BiCheckDouble className="me-1" size={18} /> Confirmar y Notificar a Compras
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalFinalizarRecepcion;
