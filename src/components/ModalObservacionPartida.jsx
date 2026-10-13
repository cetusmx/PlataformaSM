import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Badge, Spinner } from "react-bootstrap";
import { BiErrorCircle, BiCheck, BiTrash, BiCamera, BiPlus, BiX } from "react-icons/bi";
import Swal from "sweetalert2";
import { comprimirImagen } from "../utils/imageCompressor";

const ModalObservacionPartida = ({ show, onHide, partida, onGuardar }) => {
    const urlServidorAPI = process.env.REACT_APP_URL_API1;
    const [tipoAnomalia, setTipoAnomalia] = useState("Faltante");
    const [observacion, setObservacion] = useState("");
    const [fotos, setFotos] = useState([]);
    const [procesandoFoto, setProcesandoFoto] = useState(false);

    useEffect(() => {
        if (show && partida) {
            setObservacion(partida.observacion || "");
            setTipoAnomalia(partida.tipoAnomalia || "Faltante");
            setFotos(partida.fotos || []);
        }
    }, [show, partida]);

    if (!partida) return null;

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setProcesandoFoto(true);
        try {
            const fotosComprimidas = [];
            for (const f of files) {
                const fotoComp = await comprimirImagen(f);
                fotosComprimidas.push(fotoComp);
            }
            setFotos(prev => [...prev, ...fotosComprimidas]);
        } catch (err) {
            console.error("Error al procesar fotos:", err);
            Swal.fire("Error", "No se pudo procesar la imagen seleccionada", "error");
        } finally {
            setProcesandoFoto(false);
            e.target.value = "";
        }
    };

    const handleEliminarFoto = (idx) => {
        setFotos(prev => prev.filter((_, i) => i !== idx));
    };

    const handleGuardar = () => {
        onGuardar(partida.id || partida.partida_id, tipoAnomalia, observacion.trim(), fotos);
        onHide();
    };

    const handleEliminar = () => {
        onGuardar(partida.id || partida.partida_id, "", "", []);
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

                <Form.Group className="mb-3">
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

                {/* Evidencias fotográficas */}
                <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <Form.Label className="small fw-bold mb-0 d-flex align-items-center">
                            <BiCamera className="me-1 text-primary" size={17} /> Fotos de Evidencia ({fotos.length}):
                        </Form.Label>
                        <label className="btn btn-outline-primary btn-sm py-1 px-2 d-flex align-items-center gap-1 mb-0" style={{ fontSize: "0.75rem", cursor: "pointer" }}>
                            <BiPlus size={15} /> Tomar / Adjuntar Foto
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment" 
                                multiple 
                                style={{ display: "none" }} 
                                onChange={handleFileChange}
                                disabled={procesandoFoto}
                            />
                        </label>
                    </div>

                    {procesandoFoto && (
                        <div className="text-center py-2 text-muted small bg-light rounded border mb-2">
                            <Spinner animation="border" size="sm" className="me-1" /> Procesando imagen...
                        </div>
                    )}

                    {fotos.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2 p-2 bg-light rounded border">
                            {fotos.map((f, i) => (
                                <div key={i} className="position-relative border rounded overflow-hidden shadow-sm" style={{ width: "68px", height: "68px", backgroundColor: "#fff" }}>
                                    <img 
                                        src={f.foto_base64 || (f.id ? `${urlServidorAPI}/api/v1/recepcion/evidencias/${f.id}` : "")} 
                                        alt={f.nombre_archivo} 
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                                    />
                                    <button 
                                        type="button" 
                                        className="btn btn-danger btn-sm p-0 position-absolute top-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: "18px", height: "18px", margin: "2px", fontSize: "10px", lineHeight: "1" }}
                                        onClick={() => handleEliminarFoto(i)}
                                        title="Quitar foto"
                                    >
                                        <BiX size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-muted p-2 bg-light rounded border text-center small" style={{ fontSize: "0.75rem" }}>
                            No hay fotos adjuntas. Puedes tomar fotos del daño o etiqueta con la cámara.
                        </div>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer className="py-2 d-flex justify-content-between">
                {partida.observacion || fotos.length > 0 ? (
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
