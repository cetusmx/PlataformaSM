import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import { BiErrorCircle, BiCheck, BiTrash } from "react-icons/bi";

const ModalObservacionPartida = ({ show, onHide, partida, onGuardar }) => {
    const [tipoAnomalia, setTipoAnomalia] = useState("Faltante");
    const [observacion, setObservacion] = useState("");

    useEffect(() => {
        if (show && partida) {
            setObservacion(partida.observacion || "");
            setTipoAnomalia(partida.tipoAnomalia || "Faltante");
        }
    }, [show, partida]);

    if (!partida) return null;

    const handleGuardar = () => {
        onGuardar(partida.id || partida.partida_id, tipoAnomalia, observacion.trim());
        onHide();
    };

    const handleEliminar = () => {
        onGuardar(partida.id || partida.partida_id, "", "");
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="md" centered>
            <Modal.Header closeButton className="bg-light py-2">
                <Modal.Title style={{ fontSize: "1rem", fontWeight: "600" }} className="d-flex align-items-center text-danger">
                    <BiErrorCircle className="me-2" size={20} />
                    Reportar Anomalía / Observación en Partida
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-3">
                {/* Resumen del producto */}
                <div className="bg-light p-2 rounded border mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="text-primary">{partida.producto}</strong>
                        <Badge bg="secondary">Cant. Facturada: {partida.cantidad}</Badge>
                    </div>
                    {partida.clave && partida.clave !== "No-registrada" && (
                        <div className="small text-muted mb-1">
                            Clave interna: <span className="fw-bold text-dark">{partida.clave}</span>
                        </div>
                    )}
                    {partida.descripcion && (
                        <div className="small text-secondary text-truncate" style={{ maxWidth: "100%" }}>
                            {partida.descripcion}
                        </div>
                    )}
                </div>

                {/* Formulario de anomalía */}
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Tipo de Anomalía:</Form.Label>
                    <Form.Select 
                        size="sm"
                        value={tipoAnomalia}
                        onChange={(e) => setTipoAnomalia(e.target.value)}
                    >
                        <option value="Faltante">Faltante físico de piezas (por reponer o NC)</option>
                        <option value="Dañado">Mercancía dañada / empaque roto / golpeada</option>
                        <option value="Incorrecto">Producto no coincide / clave errónea</option>
                        <option value="Otra">Otra anomalía u observación</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                    <Form.Label className="small fw-bold">
                        Detalle de la anomalía para Compras:
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        size="sm"
                        placeholder="Ej. Faltaron 2 piezas por entregar; empaque exterior roto..."
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                        autoFocus
                    />
                    <Form.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                        Esta nota se enviará al Comprador para seguimiento comercial con el proveedor.
                    </Form.Text>
                </Form.Group>
            </Modal.Body>

            <Modal.Footer className="py-2 d-flex justify-content-between">
                {partida.observacion ? (
                    <Button variant="outline-danger" size="sm" onClick={handleEliminar}>
                        <BiTrash className="me-1" /> Quitar Anomalía
                    </Button>
                ) : (
                    <div />
                )}
                <div>
                    <Button variant="outline-secondary" size="sm" className="me-2" onClick={onHide}>
                        Cancelar
                    </Button>
                    <Button variant="danger" size="sm" onClick={handleGuardar}>
                        <BiCheck className="me-1" /> Guardar Observación
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalObservacionPartida;
