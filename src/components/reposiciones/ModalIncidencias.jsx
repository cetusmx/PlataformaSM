import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Modal, Button, Spinner, Badge } from "react-bootstrap";
import { BiErrorCircle, BiCheckDouble, BiDetail } from "react-icons/bi";

const ModalIncidencias = ({ show, onHide, recepcionId, onGenerarOC }) => {
    const urlServidorAPI = process.env.REACT_APP_URL_API1;
    const [detalle, setDetalle] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && recepcionId) {
            cargarDetalle();
        } else {
            setDetalle(null);
        }
    }, [show, recepcionId]);

    const cargarDetalle = async () => {
        setLoading(true);
        try {
            const res = await Axios.get(`${urlServidorAPI}/api/v1/recepcion/${recepcionId}/detalle`);
            setDetalle(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error al cargar detalle de incidencias:", error);
            setLoading(false);
        }
    };

    if (!show) return null;

    const partidasConIncidencia = detalle?.partidas?.filter(p => 
        Number(p.cantidad_facturada) !== Number(p.cantidad_recibida) ||
        p.estatus_partida === "INCOMPLETA" ||
        p.estatus_partida === "DANADA" ||
        p.estatus_partida === "NO_RECIBIDA" ||
        (p.observacion && p.observacion.trim().length > 0)
    ) || [];

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="modal-incidencias-header py-2">
                <Modal.Title style={{ fontSize: "1rem", fontWeight: "600" }} className="text-danger d-flex align-items-center">
                    <BiErrorCircle className="me-2" size={22} />
                    Reporte de Incidencias en Recepción Física
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-3">
                {loading || !detalle ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="danger" />
                        <p className="mt-2 text-muted small">Cargando reporte de la sucursal...</p>
                    </div>
                ) : (
                    <div>
                        {/* Ficha técnica rápida */}
                        <div className="bg-light p-2 rounded border mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                                <span className="text-muted small d-block">PROVEEDOR / FOLIO</span>
                                <strong>{detalle.nombre_proveedor}</strong> — Factura: <strong>{detalle.folio_factura}</strong>
                            </div>
                            <div>
                                <span className="text-muted small d-block">SUCURSAL</span>
                                <Badge bg="dark">{detalle.sucursal_destino}</Badge>
                            </div>
                            <div>
                                <span className="text-muted small d-block">RECIBIDO POR</span>
                                <span>{detalle.recibido_por || "Operador"}</span>
                            </div>
                            <div>
                                <span className="text-muted small d-block">RESUMEN PIEZAS</span>
                                <span className="text-danger fw-bold">
                                    {detalle.total_piezas_recibidas} recibidas de {detalle.total_piezas_facturadas} facturadas
                                </span>
                            </div>
                        </div>

                        {/* Observaciones generales si las hubo */}
                        {detalle.observaciones_generales && (
                            <div className="alert alert-warning py-2 px-3 mb-3" style={{ fontSize: "0.85rem" }}>
                                <strong>Observaciones generales del operador:</strong>
                                <p className="mb-0 text-dark">{detalle.observaciones_generales}</p>
                            </div>
                        )}

                        {/* Tabla de discrepancias */}
                        <h6 className="fw-bold small text-secondary mb-2">
                            Partidas con Diferencias u Observaciones ({partidasConIncidencia.length}):
                        </h6>
                        <div className="border rounded">
                            <table className="table table-sm table-striped mb-0 modal-incidencias-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "5%" }}>#</th>
                                        <th style={{ width: "25%" }}>Clave Prov / Interna</th>
                                        <th style={{ width: "30%" }}>Descripción</th>
                                        <th style={{ width: "12%", textAlign: "center" }}>Facturado</th>
                                        <th style={{ width: "12%", textAlign: "center" }}>Recibido</th>
                                        <th style={{ width: "16%" }}>Hallazgo / Nota</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {partidasConIncidencia.map((p, idx) => {
                                        const dif = Number(p.cantidad_recibida) - Number(p.cantidad_facturada);
                                        return (
                                            <tr key={idx}>
                                                <td>{p.numero_partida}</td>
                                                <td>
                                                    <strong>{p.clave_proveedor}</strong>
                                                    <span className="text-muted d-block small">
                                                        {p.clave_interna || "S/C"}
                                                    </span>
                                                </td>
                                                <td className="text-truncate" style={{ maxWidth: "200px" }}>
                                                    {p.descripcion}
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <Badge bg="secondary">{p.cantidad_facturada}</Badge>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <Badge bg={dif < 0 ? "danger" : "success"}>
                                                        {p.cantidad_recibida} ({dif > 0 ? `+${dif}` : dif})
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <span className="badge bg-danger mb-1">{p.estatus_partida}</span>
                                                    {p.observacion && (
                                                        <span className="d-block text-danger small fst-italic">
                                                            "{p.observacion}"
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {partidasConIncidencia.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-3 text-muted">
                                                No se encontraron diferencias en las partidas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer className="py-2">
                <Button variant="outline-secondary" size="sm" onClick={onHide}>
                    Cerrar
                </Button>
                {detalle && (
                    <Button 
                        variant="success" 
                        size="sm" 
                        onClick={() => {
                            onHide();
                            onGenerarOC(detalle);
                        }}
                    >
                        <BiCheckDouble className="me-1" /> Proceder a Generar OC (.MOD)
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default ModalIncidencias;
