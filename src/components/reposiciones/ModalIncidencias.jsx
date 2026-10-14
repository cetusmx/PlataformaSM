import React, { useState, useEffect, useContext } from "react";
import Axios from "axios";
import { Modal, Button, Spinner, Badge, Nav } from "react-bootstrap";
import { 
    BiErrorCircle, 
    BiCheckDouble, 
    BiCheckCircle, 
    BiCamera, 
    BiDownload, 
    BiSave, 
    BiTimeFive, 
    BiMessageSquareDetail,
    BiBriefcase,
    BiListCheck,
    BiX,
    BiFile
} from "react-icons/bi";
import Swal from "sweetalert2";
import { DataContext } from "../../contexts/dataContext";
import "../../styles/tableroReposiciones.css";

const ModalIncidencias = ({ show, onHide, recepcionId, onGenerarOC, onActualizado }) => {
    const urlServidorAPI = process.env.REACT_APP_URL_API1;
    const { valor } = useContext(DataContext);
    const infoUsuario = valor?.contextData || {};
    const nombreUsuario = infoUsuario.email || infoUsuario.nombre || "Comprador";

    const [detalle, setDetalle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("evidencias");

    // Formulario de Gestión Comercial y Resolución
    const [estatusIncidencia, setEstatusIncidencia] = useState("PENDIENTE");
    const [tipoResolucion, setTipoResolucion] = useState("");
    const [folioNotaCredito, setFolioNotaCredito] = useState("");
    const [montoNotaCredito, setMontoNotaCredito] = useState("");
    const [comentariosResolucion, setComentariosResolucion] = useState("");
    const [resueltoPor, setResueltoPor] = useState("");
    const [guardandoSeguimiento, setGuardandoSeguimiento] = useState(false);

    // Formulario de Bitácora
    const [nuevaNotaBitacora, setNuevaNotaBitacora] = useState("");
    const [guardandoBitacora, setGuardandoBitacora] = useState(false);

    // Modal de zoom / Lightbox para evidencias fotográficas
    const [fotoZoom, setFotoZoom] = useState(null);

    useEffect(() => {
        if (show && recepcionId) {
            cargarDetalle();
            setActiveTab("evidencias");
        } else {
            setDetalle(null);
            setFotoZoom(null);
            setNuevaNotaBitacora("");
        }
    }, [show, recepcionId]);

    const cargarDetalle = async () => {
        setLoading(true);
        try {
            const res = await Axios.get(`${urlServidorAPI}/api/v1/recepcion/${recepcionId}/detalle`);
            const data = res.data;
            setDetalle(data);

            // Poblar estados del formulario con los datos existentes
            setEstatusIncidencia(data.estatus_incidencia || (data.tiene_incidencias ? "PENDIENTE" : "SIN_INCIDENCIA"));
            setTipoResolucion(data.tipo_resolucion || "");
            setFolioNotaCredito(data.folio_nota_credito || "");
            setMontoNotaCredito(
                data.monto_nota_credito !== null && data.monto_nota_credito !== undefined 
                    ? String(data.monto_nota_credito) 
                    : ""
            );
            setComentariosResolucion(data.comentarios_resolucion || "");
            setResueltoPor(data.resuelto_por || nombreUsuario);
        } catch (error) {
            console.error("Error al cargar detalle de incidencias:", error);
            Swal.fire("Error", "No se pudo cargar el detalle de la recepción.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    // Partidas que tienen discrepancias físicas u observaciones
    const partidasConIncidencia = (detalle?.partidas || []).filter(
        (p) =>
            Number(p.cantidad_facturada) !== Number(p.cantidad_recibida) ||
            (p.estatus_partida && !["PENDIENTE", "COMPLETA"].includes(p.estatus_partida)) ||
            (p.observacion && p.observacion.trim().length > 0) ||
            (p.fotos && p.fotos.length > 0)
    );

    // Evidencias generales de la recepción (sin partida_id asignada)
    const evidenciasGenerales = (detalle?.evidencias || []).filter((ev) => !ev.partida_id);

    // Total de fotos registradas en esta recepción
    const totalFotos = (detalle?.evidencias || []).length;

    // Validación de estatus resuelto (modo solo consulta)
    const esIncidenciaResuelta = detalle?.estatus_incidencia === "INCIDENCIA_RESUELTA";

    // Guardar resolución comercial del reclamo
    const handleGuardarSeguimiento = async (e) => {
        if (e) e.preventDefault();

        if (esIncidenciaResuelta) {
            Swal.fire({
                title: "Acción No Permitida",
                text: "Esta incidencia ya se encuentra RESUELTA y no puede ser modificada. Se encuentra en modo de solo consulta.",
                icon: "info",
                confirmButtonText: "Entendido"
            });
            return;
        }

        if (estatusIncidencia === "INCIDENCIA_RESUELTA" && tipoResolucion === "NOTA_CREDITO" && !folioNotaCredito.trim()) {
            const confirm = await Swal.fire({
                title: "¿Guardar sin Folio de NC?",
                text: "Indicaste que la solución es por Nota de Crédito pero no capturaste el folio. ¿Deseas continuar?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, guardar",
                cancelButtonText: "Regresar a capturar",
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#6c757d"
            });
            if (!confirm.isConfirmed) return;
        }

        setGuardandoSeguimiento(true);
        try {
            const payload = {
                estatus_incidencia: estatusIncidencia,
                tipo_resolucion: tipoResolucion || null,
                folio_nota_credito: folioNotaCredito.trim() || null,
                monto_nota_credito: montoNotaCredito !== "" ? parseFloat(montoNotaCredito) : null,
                comentarios_resolucion: comentariosResolucion.trim() || null,
                resuelto_por: resueltoPor.trim() || nombreUsuario
            };

            const res = await Axios.put(
                `${urlServidorAPI}/api/v1/recepcion/${recepcionId}/seguimiento-incidencia`,
                payload
            );

            if (res.status === 200 || res.data?.success) {
                Swal.fire({
                    title: "¡Seguimiento Guardado!",
                    text: "La gestión comercial y notas han sido actualizadas.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
                await cargarDetalle();
                if (onActualizado) onActualizado();
            } else {
                Swal.fire("Error", "No se pudo actualizar el seguimiento.", "error");
            }
        } catch (error) {
            console.error("Error al guardar seguimiento de incidencia:", error);
            const msg = error.response?.data?.error || "Error al conectar con el servidor.";
            Swal.fire("Error", msg, "error");
        } finally {
            setGuardandoSeguimiento(false);
        }
    };

    // Agregar nueva nota rápida a la bitácora
    const handleAgregarNotaBitacora = async (e) => {
        if (e) e.preventDefault();

        if (esIncidenciaResuelta) {
            Swal.fire({
                title: "Acción No Permitida",
                text: "No es posible agregar notas porque la incidencia ya ha sido RESUELTA.",
                icon: "info",
                confirmButtonText: "Entendido"
            });
            return;
        }

        if (!nuevaNotaBitacora.trim()) return;

        setGuardandoBitacora(true);
        try {
            await Axios.post(`${urlServidorAPI}/api/v1/recepcion/${recepcionId}/bitacora`, {
                usuario: nombreUsuario,
                comentario: nuevaNotaBitacora.trim()
            });

            setNuevaNotaBitacora("");
            await cargarDetalle();
            if (onActualizado) onActualizado();
        } catch (error) {
            console.error("Error al registrar nota en bitácora:", error);
            Swal.fire("Error", "No se pudo registrar la nota en la bitácora.", "error");
        } finally {
            setGuardandoBitacora(false);
        }
    };

    return (
        <>
            <Modal show={show} onHide={onHide} size="xl" centered backdrop="static">
                <Modal.Header closeButton className="modal-incidencias-header py-2">
                    <div className="d-flex align-items-center justify-content-between w-100 pe-3">
                        <Modal.Title style={{ fontSize: "1.05rem", fontWeight: "700" }} className="d-flex align-items-center text-dark">
                            <BiErrorCircle className="text-danger me-2" size={24} />
                            Seguimiento y Resolución de Incidencias en Recepción
                        </Modal.Title>
                        {detalle && (
                            <div className="d-flex align-items-center gap-2">
                                {detalle.estatus_incidencia === "INCIDENCIA_RESUELTA" ? (
                                    <Badge bg="success" className="px-2 py-1">
                                        <BiCheckCircle className="me-1" /> Resuelta Comercial
                                    </Badge>
                                ) : detalle.estatus_incidencia === "EN_ACLARACION" ? (
                                    <Badge bg="warning" text="dark" className="px-2 py-1">
                                        <BiTimeFive className="me-1" /> En Aclaración
                                    </Badge>
                                ) : (
                                    <Badge bg="danger" className="px-2 py-1">
                                        <BiErrorCircle className="me-1" /> Incidencia Pendiente
                                    </Badge>
                                )}

                                {detalle.estatus === "OC_GENERADA" && (
                                    <Badge bg="secondary" className="px-2 py-1">
                                        <BiCheckDouble className="me-1 text-info" /> OC Generada
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </Modal.Header>

                <Modal.Body className="p-3">
                    {loading || !detalle ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="danger" />
                            <p className="mt-2 text-muted small">Cargando reporte de incidencias y evidencias...</p>
                        </div>
                    ) : (
                        <div>
                            {/* Ficha técnica superior */}
                            <div className="bg-light p-2 rounded border mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ fontSize: "0.82rem" }}>
                                <div>
                                    <span className="text-muted small d-block">PROVEEDOR / FACTURA</span>
                                    <strong>{detalle.nombre_proveedor}</strong> ({detalle.rfc_proveedor}) — Folio: <strong>{detalle.folio_factura}</strong>
                                </div>
                                <div>
                                    <span className="text-muted small d-block">SUCURSAL DESTINO</span>
                                    <Badge bg="dark">{detalle.sucursal_destino}</Badge>
                                    {detalle.almacen_sae && <span className="text-muted ms-1 small">(Alm {detalle.almacen_sae})</span>}
                                </div>
                                <div>
                                    <span className="text-muted small d-block">RECIBIDO EN SUCURSAL</span>
                                    <span>{detalle.recibido_por || "Sin registrar"}</span>
                                </div>
                                <div>
                                    <span className="text-muted small d-block">SUBIDO POR</span>
                                    <span>{detalle.subido_por || "Compras"}</span>
                                </div>
                            </div>

                            {/* Pestañas de Navegación */}
                            <Nav variant="tabs" className="mb-3" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                                <Nav.Item>
                                    <Nav.Link eventKey="evidencias" className="fw-semibold small d-flex align-items-center gap-1">
                                        <BiListCheck size={18} /> Evidencias y Discrepancias
                                        <Badge bg={partidasConIncidencia.length > 0 ? "danger" : "secondary"} className="ms-1" pill>
                                            {partidasConIncidencia.length}
                                        </Badge>
                                        {totalFotos > 0 && (
                                            <Badge bg="primary" className="ms-1" pill title={`${totalFotos} fotos adjuntas`}>
                                                <BiCamera size={12} className="me-1" />{totalFotos}
                                            </Badge>
                                        )}
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="resolucion" className="fw-semibold small d-flex align-items-center gap-1">
                                        <BiBriefcase size={18} /> Gestión Comercial y Solución
                                        {detalle.folio_nota_credito && (
                                            <Badge bg="success" className="ms-1" pill>
                                                NC: {detalle.folio_nota_credito}
                                            </Badge>
                                        )}
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="bitacora" className="fw-semibold small d-flex align-items-center gap-1">
                                        <BiMessageSquareDetail size={18} /> Bitácora de Seguimiento
                                        <Badge bg="secondary" className="ms-1" pill>
                                            {(detalle.bitacora || []).length}
                                        </Badge>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>

                            {/* Contenido Pestaña 1: Evidencias y Discrepancias */}
                            {activeTab === "evidencias" && (
                                <div>
                                    {detalle.observaciones_generales && (
                                        <div className="alert alert-warning py-2 px-3 mb-3 d-flex align-items-start gap-2" style={{ fontSize: "0.85rem" }}>
                                            <BiErrorCircle size={20} className="mt-1 flex-shrink-0 text-warning" />
                                            <div>
                                                <strong>Observaciones generales del operador en sucursal:</strong>
                                                <p className="mb-0 text-dark">{detalle.observaciones_generales}</p>
                                            </div>
                                        </div>
                                    )}

                                    <h6 className="fw-bold small text-secondary mb-2">
                                        Partidas con Diferencias u Observaciones ({partidasConIncidencia.length}):
                                    </h6>
                                    <div className="border rounded table-responsive mb-3">
                                        <table className="table table-sm table-striped mb-0 modal-incidencias-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "4%" }}>#</th>
                                                    <th style={{ width: "22%" }}>Clave Prov / Interna</th>
                                                    <th style={{ width: "26%" }}>Descripción</th>
                                                    <th style={{ width: "10%", textAlign: "center" }}>Facturado</th>
                                                    <th style={{ width: "10%", textAlign: "center" }}>Recibido</th>
                                                    <th style={{ width: "16%" }}>Hallazgo Sucursal</th>
                                                    <th style={{ width: "12%", textAlign: "center" }}>Fotos</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {partidasConIncidencia.map((p, idx) => {
                                                    const dif = Number(p.cantidad_recibida) - Number(p.cantidad_facturada);
                                                    const fotosPartida = p.fotos || [];

                                                    return (
                                                        <tr key={p.id || idx}>
                                                            <td>{p.numero_partida}</td>
                                                            <td>
                                                                <strong>{p.clave_proveedor}</strong>
                                                                <span className="text-muted d-block small">
                                                                    {p.clave_interna || "S/C"}
                                                                </span>
                                                            </td>
                                                            <td style={{ maxWidth: "220px" }}>
                                                                <div className="text-truncate" title={p.descripcion}>
                                                                    {p.descripcion}
                                                                </div>
                                                            </td>
                                                            <td style={{ textAlign: "center" }}>
                                                                <Badge bg="secondary">{p.cantidad_facturada}</Badge>
                                                            </td>
                                                            <td style={{ textAlign: "center" }}>
                                                                <Badge bg={dif < 0 ? "danger" : dif > 0 ? "warning" : "success"}>
                                                                    {p.cantidad_recibida} ({dif > 0 ? `+${dif}` : dif})
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <span className="badge bg-danger mb-1">
                                                                    {p.estatus_partida === "INCORRECTO" ? "Incorrecto" :
                                                                     p.estatus_partida === "DANADA" ? "Dañado" :
                                                                     p.estatus_partida === "INCOMPLETA" ? "Faltante" :
                                                                     p.estatus_partida === "OTRA" ? "Otra" :
                                                                     p.estatus_partida === "NO_RECIBIDA" ? "No Recibida" :
                                                                     p.estatus_partida || "Incidencia"}
                                                                </span>
                                                                {p.observacion && (
                                                                    <span className="d-block text-danger small fst-italic">
                                                                        "{p.observacion}"
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td style={{ textAlign: "center" }}>
                                                                {fotosPartida.length > 0 ? (
                                                                    <div className="d-flex justify-content-center align-items-center gap-1 flex-wrap">
                                                                        {fotosPartida.map((f) => (
                                                                            <img
                                                                                key={f.id}
                                                                                src={`${urlServidorAPI}/api/v1/recepcion/evidencias/${f.id}`}
                                                                                alt={f.nombre_archivo}
                                                                                className="foto-evidencia-thumb"
                                                                                onClick={() => setFotoZoom(f)}
                                                                                title="Clic para ampliar evidencia"
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted small fst-italic">Sin fotos</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {partidasConIncidencia.length === 0 && (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4 text-muted">
                                                            No se reportaron diferencias físicas en las partidas.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Evidencias generales sin partida específica */}
                                    {evidenciasGenerales.length > 0 && (
                                        <div className="bg-light p-3 rounded border">
                                            <h6 className="fw-bold small text-secondary mb-2 d-flex align-items-center gap-1">
                                                <BiCamera size={18} className="text-primary" />
                                                Fotos Generales de la Recepción / Entrega ({evidenciasGenerales.length}):
                                            </h6>
                                            <div className="d-flex gap-2 flex-wrap">
                                                {evidenciasGenerales.map((f) => (
                                                    <div key={f.id} className="text-center">
                                                        <img
                                                            src={`${urlServidorAPI}/api/v1/recepcion/evidencias/${f.id}`}
                                                            alt={f.nombre_archivo}
                                                            className="foto-evidencia-thumb"
                                                            style={{ width: "65px", height: "65px" }}
                                                            onClick={() => setFotoZoom(f)}
                                                            title="Clic para ampliar foto"
                                                        />
                                                        <span className="d-block text-muted" style={{ fontSize: "0.65rem" }}>
                                                            {f.nombre_archivo}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Contenido Pestaña 2: Gestión Comercial y Solución */}
                            {activeTab === "resolucion" && (
                                <form onSubmit={handleGuardarSeguimiento}>
                                    {esIncidenciaResuelta && (
                                        <div className="alert alert-success py-2 px-3 mb-3 d-flex align-items-center gap-2" style={{ fontSize: "0.85rem" }}>
                                            <BiCheckCircle size={22} className="text-success flex-shrink-0" />
                                            <div>
                                                <strong>Incidencia Resuelta:</strong> Esta incidencia ya fue resuelta comercialmente. La información se encuentra en modo de <strong>solo consulta</strong> y no permite modificaciones.
                                                {detalle.fecha_resolucion && (
                                                    <span className="d-block text-muted small mt-1">
                                                        Fecha de resolución: <strong>{new Date(detalle.fecha_resolucion).toLocaleString("es-MX")}</strong> {detalle.resuelto_por ? `— Registrado por: ${detalle.resuelto_por}` : ""}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="card shadow-sm mb-3">
                                        <div className="card-header bg-white py-2 d-flex justify-content-between align-items-center">
                                            <strong className="text-primary small">
                                                Acuerdo Comercial y Solución con Proveedor
                                            </strong>
                                            {esIncidenciaResuelta && (
                                                <Badge bg="success" style={{ fontSize: "0.70rem" }}>
                                                    Solo Lectura
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="card-body p-3">
                                            <div className="row g-2 mb-3">
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-bold mb-1">
                                                        Estatus Comercial de la Incidencia:
                                                    </label>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={estatusIncidencia}
                                                        onChange={(e) => setEstatusIncidencia(e.target.value)}
                                                        disabled={esIncidenciaResuelta}
                                                    >
                                                        <option value="PENDIENTE">🔴 PENDIENTE (Sin gestionar / Por reclamar)</option>
                                                        <option value="EN_ACLARACION">🟡 EN ACLARACIÓN (En negociación con proveedor)</option>
                                                        <option value="INCIDENCIA_RESUELTA">🟢 INCIDENCIA RESUELTA (Acuerdo o NC aplicada)</option>
                                                    </select>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label small fw-bold mb-1">
                                                        Tipo de Solución Acordada:
                                                    </label>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={tipoResolucion}
                                                        onChange={(e) => setTipoResolucion(e.target.value)}
                                                        disabled={esIncidenciaResuelta}
                                                    >
                                                        <option value="">-- Seleccionar Solución --</option>
                                                        <option value="NOTA_CREDITO">Nota de Crédito (Proveedor bonifica o descuenta)</option>
                                                        <option value="REPOSICION_FISICA">Reposición Física (Proveedor reenvía mercancía)</option>
                                                        <option value="CANCELACION_FACTURA">Cancelación de Factura</option>
                                                        <option value="ACEPTADO_SIN_ACCION">Aceptado por SM sin Reclamo</option>
                                                        <option value="OTRO">Otro Acuerdo Comercial</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="row g-2 mb-3">
                                                <div className="col-md-4">
                                                    <label className="form-label small fw-bold mb-1">
                                                        Folio Nota de Crédito:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Ej: NC-88492"
                                                        value={folioNotaCredito}
                                                        onChange={(e) => setFolioNotaCredito(e.target.value)}
                                                        disabled={esIncidenciaResuelta}
                                                    />
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-label small fw-bold mb-1">
                                                        Monto de Nota de Crédito / Ajuste ($):
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-control form-control-sm"
                                                        placeholder="0.00"
                                                        value={montoNotaCredito}
                                                        onChange={(e) => setMontoNotaCredito(e.target.value)}
                                                        disabled={esIncidenciaResuelta}
                                                    />
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-label small fw-bold mb-1">
                                                        Responsable / Comprador:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={resueltoPor}
                                                        onChange={(e) => setResueltoPor(e.target.value)}
                                                        disabled={esIncidenciaResuelta}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label small fw-bold mb-1">
                                                    Detalle del Acuerdo / Comentarios de Solución:
                                                </label>
                                                <textarea
                                                    className="form-control form-control-sm"
                                                    rows="3"
                                                    placeholder="Describe el acuerdo pactado con el proveedor (ej. El proveedor reconoce 2 piezas dañadas y envía la nota de crédito NC-88492 por $1,250.00)..."
                                                    value={comentariosResolucion}
                                                    onChange={(e) => setComentariosResolucion(e.target.value)}
                                                    disabled={esIncidenciaResuelta}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {!esIncidenciaResuelta && (
                                        <div className="d-flex justify-content-end">
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                size="sm"
                                                disabled={guardandoSeguimiento}
                                                className="d-flex align-items-center gap-1 fw-bold shadow-sm"
                                            >
                                                {guardandoSeguimiento ? (
                                                    <>
                                                        <Spinner animation="border" size="sm" />
                                                        <span>Guardando...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <BiSave size={16} />
                                                        <span>Guardar Gestión Comercial</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            )}

                            {/* Contenido Pestaña 3: Bitácora de Seguimiento */}
                            {activeTab === "bitacora" && (
                                <div>
                                    {/* Si la incidencia ya fue resuelta, mostrar alerta de solo consulta */}
                                    {esIncidenciaResuelta ? (
                                        <div className="alert alert-secondary py-2 px-3 mb-3 d-flex align-items-center gap-2" style={{ fontSize: "0.85rem" }}>
                                            <BiCheckCircle size={20} className="text-success flex-shrink-0" />
                                            <div>
                                                <strong>Bitácora cerrada:</strong> La incidencia ha sido resuelta. No se permite agregar nuevas notas o avances; el historial se conserva como registro histórico de solo consulta.
                                            </div>
                                        </div>
                                    ) : (
                                        /* Formulario para agregar nueva nota si sigue abierta */
                                        <div className="card shadow-sm mb-3">
                                            <div className="card-body p-3">
                                                <label className="form-label small fw-bold mb-1 d-flex align-items-center gap-1">
                                                    <BiMessageSquareDetail className="text-primary" size={16} />
                                                    Registrar Nueva Nota o Avance con Proveedor:
                                                </label>
                                                <div className="d-flex gap-2">
                                                    <textarea
                                                        className="form-control form-control-sm"
                                                        rows="2"
                                                        placeholder="Escribe un avance (ej: Se llamó al proveedor, confirmaron que mandan nota de crédito el viernes)..."
                                                        value={nuevaNotaBitacora}
                                                        onChange={(e) => setNuevaNotaBitacora(e.target.value)}
                                                    />
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={handleAgregarNotaBitacora}
                                                        disabled={guardandoBitacora || !nuevaNotaBitacora.trim()}
                                                        className="d-flex align-items-center px-3"
                                                    >
                                                        {guardandoBitacora ? (
                                                            <Spinner animation="border" size="sm" />
                                                        ) : (
                                                            <span>Registrar</span>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Timeline de notas registradas */}
                                    <h6 className="fw-bold small text-secondary mb-3">Historial Cronológico de Seguimiento:</h6>
                                    {(detalle.bitacora || []).length === 0 ? (
                                        <div className="text-center py-4 text-muted bg-light rounded border">
                                            <BiTimeFive size={30} className="mb-2 text-secondary" />
                                            <p className="mb-0 small">No hay notas registradas en la bitácora aún.</p>
                                        </div>
                                    ) : (
                                        <div className="bitacora-timeline pe-2">
                                            {detalle.bitacora.map((item, idx) => {
                                                const esInicio = (item.comentario || "").includes("[EVENTO: INICIO DE GESTIÓN]");
                                                const esResolucion = (item.comentario || "").includes("[EVENTO: INCIDENCIA RESUELTA]");

                                                return (
                                                    <div 
                                                        key={item.id || idx} 
                                                        className={`bitacora-item ${esInicio ? "evento-inicio" : esResolucion ? "evento-resolucion" : ""}`}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <div className="d-flex align-items-center gap-1">
                                                                <Badge 
                                                                    bg={esResolucion ? "success" : esInicio ? "warning" : "primary"} 
                                                                    text={esInicio ? "dark" : "white"} 
                                                                    style={{ fontSize: "0.72rem" }}
                                                                >
                                                                    {item.usuario || "Comprador"}
                                                                </Badge>
                                                                {esInicio && (
                                                                    <span className="badge bg-warning text-dark border" style={{ fontSize: "0.65rem" }}>
                                                                        Inicio de Gestión
                                                                    </span>
                                                                )}
                                                                {esResolucion && (
                                                                    <span className="badge bg-success border" style={{ fontSize: "0.65rem" }}>
                                                                        Resolución
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-muted" style={{ fontSize: "0.70rem" }}>
                                                                {item.fecha ? new Date(item.fecha).toLocaleString("es-MX") : ""}
                                                            </span>
                                                        </div>
                                                        <p className="mb-0 text-dark" style={{ fontSize: "0.82rem", whiteSpace: "pre-wrap" }}>
                                                            {item.comentario}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer className="py-2 d-flex justify-content-between align-items-center">
                    <Button variant="outline-secondary" size="sm" onClick={onHide}>
                        Cerrar
                    </Button>
                    <div>
                        {detalle && detalle.estatus !== "OC_GENERADA" ? (
                            <Button 
                                variant="success" 
                                size="sm" 
                                onClick={() => {
                                    onHide();
                                    onGenerarOC(detalle);
                                }}
                                className="fw-semibold shadow-sm"
                            >
                                <BiCheckDouble className="me-1" size={16} /> Proceder a Generar OC (.MOD)
                            </Button>
                        ) : (
                            detalle && detalle.estatus === "OC_GENERADA" && (
                                <span className="badge bg-light text-muted border px-2 py-1 small">
                                    <BiCheckDouble className="text-success me-1" /> Orden de Compra ya generada para SAE
                                </span>
                            )
                        )}
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Modal Lightbox para visualización ampliada de evidencias fotográficas */}
            <Modal show={fotoZoom !== null} onHide={() => setFotoZoom(null)} size="lg" centered>
                <Modal.Header closeButton className="py-2 bg-light">
                    <Modal.Title style={{ fontSize: "0.95rem", fontWeight: "600" }} className="d-flex align-items-center text-dark">
                        <BiCamera className="me-2 text-primary" size={20} />
                        {fotoZoom?.nombre_archivo || "Evidencia Fotográfica"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-2 text-center bg-dark">
                    {fotoZoom && (
                        <img
                            src={`${urlServidorAPI}/api/v1/recepcion/evidencias/${fotoZoom.id}`}
                            alt={fotoZoom.nombre_archivo}
                            style={{ maxWidth: "100%", maxHeight: "72vh", objectFit: "contain", borderRadius: "4px" }}
                        />
                    )}
                </Modal.Body>
                <Modal.Footer className="py-2 d-flex justify-content-between align-items-center bg-light">
                    <div className="text-muted small">
                        {fotoZoom?.subido_por && <span>Subido por: <strong>{fotoZoom.subido_por}</strong> — </span>}
                        {fotoZoom?.fecha_subida && <span>{new Date(fotoZoom.fecha_subida).toLocaleString("es-MX")}</span>}
                        {fotoZoom?.tamano_bytes && (
                            <span className="ms-2">({(fotoZoom.tamano_bytes / 1024).toFixed(1)} KB)</span>
                        )}
                    </div>
                    <div className="d-flex gap-2">
                        {fotoZoom && (
                            <a
                                href={`${urlServidorAPI}/api/v1/recepcion/evidencias/${fotoZoom.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                            >
                                <BiDownload size={14} /> Abrir original / Descargar
                            </a>
                        )}
                        <Button variant="secondary" size="sm" onClick={() => setFotoZoom(null)}>
                            Cerrar
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ModalIncidencias;
