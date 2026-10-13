import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Spinner, Badge } from "react-bootstrap";
import { 
    BiUpload, 
    BiRefresh, 
    BiSearch, 
    BiX, 
    BiCheckCircle, 
    BiErrorCircle, 
    BiTimeFive, 
    BiFile, 
    BiCheckDouble,
    BiFolderPlus,
    BiTrash
} from "react-icons/bi";
import Swal from "sweetalert2";
import ModalSubirFactura from "./ModalSubirFactura";
import ModalIncidencias from "./ModalIncidencias";
import FacturaXMLEditable from "../FacturaXMLEditable";
import "../../styles/tableroReposiciones.css";

const TableroReposiciones = ({ onVistaChange }) => {
    const urlServidorAPI = process.env.REACT_APP_URL_API1;

    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstatus, setFiltroEstatus] = useState("TODOS");
    const [busqueda, setBusqueda] = useState("");

    // Modales y vistas alternas
    const [showModalSubir, setShowModalSubir] = useState(false);
    const [incidenciaId, setIncidenciaId] = useState(null);
    const [facturaParaOC, setFacturaParaOC] = useState(null);
    const [cargandoDetalleOC, setCargandoDetalleOC] = useState(false);
    const [eliminandoId, setEliminandoId] = useState(null);

    useEffect(() => {
        cargarFacturas();
    }, []);

    useEffect(() => {
        if (onVistaChange) {
            onVistaChange({
                enDetalle: !!facturaParaOC,
                volverABandeja: () => {
                    setFacturaParaOC(null);
                    cargarFacturas();
                }
            });
        }
        return () => {
            if (onVistaChange) {
                onVistaChange({ enDetalle: false, volverABandeja: null });
            }
        };
    }, [facturaParaOC, onVistaChange]);

    const cargarFacturas = async () => {
        setLoading(true);
        try {
            const res = await Axios.get(`${urlServidorAPI}/api/v1/recepcion/monitoreo-compras`);
            setFacturas(res.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error al cargar monitoreo de compras:", error);
            setLoading(false);
        }
    };

    const iniciarGeneracionOC = async (factura) => {
        setCargandoDetalleOC(true);
        try {
            const res = await Axios.get(`${urlServidorAPI}/api/v1/recepcion/${factura.id}/detalle`);
            setFacturaParaOC(res.data);
            setCargandoDetalleOC(false);
        } catch (error) {
            console.error("Error al cargar detalle de factura para OC:", error);
            setCargandoDetalleOC(false);
        }
    };

    const handleEliminarFactura = async (factura) => {
        const result = await Swal.fire({
            title: "¿Eliminar Factura?",
            html: `
                <div class="text-start">
                    <p class="mb-2">¿Está seguro de que desea eliminar la factura <strong>${factura.folio_factura}</strong> del proveedor <strong>${factura.nombre_proveedor}</strong>?</p>
                    <div class="bg-light p-2 rounded border small mb-2">
                        <div><strong>Sucursal asignada:</strong> ${factura.sucursal_destino}</div>
                        <div><strong>Estatus:</strong> <span class="badge bg-secondary">${factura.estatus}</span></div>
                        ${factura.total_partidas ? `<div><strong>Partidas:</strong> ${factura.total_partidas}</div>` : ""}
                    </div>
                    <p class="text-danger small mb-0 fw-semibold">
                        ⚠️ Esta acción borrará la recepción y sus partidas de forma permanente. Podrá volver a cargarla si fue asignada por error.
                    </p>
                </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            focusCancel: true
        });

        if (!result.isConfirmed) return;

        setEliminandoId(factura.id);
        try {
            const res = await Axios.delete(`${urlServidorAPI}/api/v1/recepcion/${factura.id}`);
            if (res.status === 200 || res.data?.success) {
                Swal.fire({
                    title: "¡Factura Eliminada!",
                    text: `La factura ${factura.folio_factura} ha sido eliminada del sistema.`,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
                cargarFacturas();
            } else {
                Swal.fire("Error", "No se pudo eliminar la factura.", "error");
            }
        } catch (error) {
            console.error("Error al eliminar factura:", error);
            const msg = error.response?.data?.details || error.response?.data?.error || "Error al conectar con el servidor.";
            Swal.fire("Error al eliminar", msg, "error");
        } finally {
            setEliminandoId(null);
        }
    };

    // Filtros de búsqueda y estatus
    const facturasFiltradas = facturas.filter(f => {
        // Filtro por estatus
        if (filtroEstatus === "EN_SUCURSAL" && !["PENDIENTE", "EN_RECEPCION"].includes(f.estatus)) return false;
        if (filtroEstatus === "LISTAS_OC" && (f.estatus !== "RECIBIDO_COMPLETO" || f.tiene_incidencias === 1)) return false;
        if (filtroEstatus === "INCIDENCIAS" && (f.estatus !== "RECIBIDO_CON_INCIDENCIA" && f.tiene_incidencias !== 1)) return false;
        if (filtroEstatus === "OC_GENERADA" && f.estatus !== "OC_GENERADA") return false;

        // Filtro de texto
        if (busqueda.trim() !== "") {
            const term = busqueda.toLowerCase();
            const folio = (f.folio_factura || "").toLowerCase();
            const prov = (f.nombre_proveedor || "").toLowerCase();
            const rfc = (f.rfc_proveedor || "").toLowerCase();
            const sucursal = (f.sucursal_destino || "").toLowerCase();
            const receptor = (f.nombre_receptor || "").toLowerCase();
            return folio.includes(term) || prov.includes(term) || rfc.includes(term) || sucursal.includes(term) || receptor.includes(term);
        }

        return true;
    });

    // Contadores para badges
    const totalEnSucursal = facturas.filter(f => ["PENDIENTE", "EN_RECEPCION"].includes(f.estatus)).length;
    const totalListasOC = facturas.filter(f => f.estatus === "RECIBIDO_COMPLETO" && !f.tiene_incidencias).length;
    const totalIncidencias = facturas.filter(f => f.estatus === "RECIBIDO_CON_INCIDENCIA" || f.tiene_incidencias === 1).length;
    const totalCerradas = facturas.filter(f => f.estatus === "OC_GENERADA").length;

    const renderBadgeEstatus = (estatus, tieneIncidencias, facturaId) => {
        if (estatus === "OC_GENERADA") {
            if (tieneIncidencias) {
                return (
                    <div className="d-flex flex-column align-items-center gap-1">
                        <span className="badge-estatus oc_generada">
                            <BiCheckDouble /> OC Generada
                        </span>
                        <button 
                            type="button"
                            className="badge-estatus recibido_con_incidencia"
                            onClick={() => setIncidenciaId(facturaId)}
                            title="Factura con incidencias físicas. Clic para ver reporte de hallazgos."
                            style={{ fontSize: "0.65rem", padding: "1px 6px" }}
                        >
                            <BiErrorCircle /> Con Incidencias
                        </button>
                    </div>
                );
            }
            return (
                <span className="badge-estatus oc_generada">
                    <BiCheckDouble /> OC Generada
                </span>
            );
        }

        if (estatus === "RECIBIDO_CON_INCIDENCIA" || tieneIncidencias) {
            return (
                <button 
                    type="button"
                    className="badge-estatus recibido_con_incidencia"
                    onClick={() => setIncidenciaId(facturaId)}
                    title="Clic para ver hallazgos e incidencias reportadas por sucursal"
                >
                    <BiErrorCircle /> Con Incidencias
                </button>
            );
        }

        switch (estatus) {
            case "PENDIENTE":
                return (
                    <span className="badge-estatus pendiente">
                        <BiTimeFive /> En Espera
                    </span>
                );
            case "EN_RECEPCION":
                return (
                    <span className="badge-estatus en_recepcion">
                        <Spinner animation="border" size="sm" style={{ width: "10px", height: "10px" }} /> En Conteo
                    </span>
                );
            case "RECIBIDO_COMPLETO":
                return (
                    <span className="badge-estatus recibido_completo">
                        <BiCheckCircle /> Recibida 100% OK
                    </span>
                );
            default:
                return <span className="badge bg-secondary">{estatus}</span>;
        }
    };

    // Si el comprador está generando la OC desde una factura recibida
    if (facturaParaOC) {
        return (
            <FacturaXMLEditable 
                recepcionData={facturaParaOC}
                onVolver={() => {
                    setFacturaParaOC(null);
                    cargarFacturas();
                }}
            />
        );
    }

    return (
        <div className="tablero-reposiciones">
            {/* Toolbar superior compacto */}
            <div className="tablero-toolbar">
                {/* Filtros tipo pills */}
                <div className="tablero-filtros">
                    <button 
                        className={`btn-filtro ${filtroEstatus === "TODOS" ? "active" : ""}`}
                        onClick={() => setFiltroEstatus("TODOS")}
                    >
                        Todas ({facturas.length})
                    </button>
                    <button 
                        className={`btn-filtro filtro-sucursal ${filtroEstatus === "EN_SUCURSAL" ? "active" : ""}`}
                        onClick={() => setFiltroEstatus("EN_SUCURSAL")}
                    >
                        🟡 En Sucursal ({totalEnSucursal})
                    </button>
                    <button 
                        className={`btn-filtro filtro-listas ${filtroEstatus === "LISTAS_OC" ? "active" : ""}`}
                        onClick={() => setFiltroEstatus("LISTAS_OC")}
                    >
                        🟢 Listas para OC ({totalListasOC})
                    </button>
                    <button 
                        className={`btn-filtro filtro-incidencias ${filtroEstatus === "INCIDENCIAS" ? "active" : ""}`}
                        onClick={() => setFiltroEstatus("INCIDENCIAS")}
                    >
                        🔴 Con Incidencias ({totalIncidencias})
                    </button>
                    <button 
                        className={`btn-filtro ${filtroEstatus === "OC_GENERADA" ? "active" : ""}`}
                        onClick={() => setFiltroEstatus("OC_GENERADA")}
                    >
                        🟣 Procesadas ({totalCerradas})
                    </button>
                </div>

                {/* Buscador + Acciones principales */}
                <div className="d-flex align-items-center gap-2">
                    {/* Input buscador 200px con botón X */}
                    <div className="position-relative" style={{ width: "200px" }}>
                        <input
                            type="text"
                            className="form-control form-control-sm pe-4"
                            placeholder="Buscar folio, prov..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        {busqueda && (
                            <button
                                className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted p-1"
                                style={{ textDecoration: "none" }}
                                onClick={() => setBusqueda("")}
                            >
                                <BiX size={16} />
                            </button>
                        )}
                    </div>

                    <button 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={cargarFacturas}
                        title="Actualizar lista"
                        disabled={loading}
                    >
                        <BiRefresh className={loading ? "fa-spin" : ""} size={16} />
                    </button>

                    <button 
                        className="btn btn-primary btn-sm fw-bold shadow-sm"
                        onClick={() => setShowModalSubir(true)}
                    >
                        <BiFolderPlus className="me-1" size={16} /> + Cargar Factura XML
                    </button>
                </div>
            </div>

            {/* Tabla de Monitoreo */}
            <div className="tablero-tabla-container">
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted small">Consultando estado de recepciones...</p>
                    </div>
                ) : (
                    <table className="table tablero-tabla">
                        <thead>
                            <tr>
                                <th style={{ width: "11%", textAlign: "center" }}>Folio Factura</th>
                                <th style={{ width: "25%" }}>Proveedor</th>
                                <th style={{ width: "21%" }}>Sucursal Destino</th>
                                <th style={{ width: "13%", textAlign: "center" }}>Estatus</th>
                                <th style={{ width: "11%", textAlign: "center" }}>Fecha Subida</th>
                                <th style={{ width: "19%", textAlign: "center" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facturasFiltradas.map((f) => {
                                const tieneIncidencias = f.tiene_incidencias === 1 || f.estatus === "RECIBIDO_CON_INCIDENCIA";
                                const listaParaOC = ["RECIBIDO_COMPLETO", "RECIBIDO_CON_INCIDENCIA"].includes(f.estatus);
                                const yaProcesada = f.estatus === "OC_GENERADA";
                                const fechaLimpia = (f.fecha_subida || "").split("T")[0] || f.fecha_subida;

                                return (
                                    <tr key={f.id}>
                                        <td style={{ textAlign: "center" }}>
                                            <strong className="text-primary d-block" style={{ fontSize: "0.76rem" }}>{f.folio_factura}</strong>
                                            {f.fecha_factura && (
                                                <span className="text-muted d-block" style={{ fontSize: "0.65rem" }}>
                                                    Fac: {f.fecha_factura.split("T")[0]}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <strong className="text-dark d-block" style={{ fontSize: "0.74rem" }}>{f.nombre_proveedor}</strong>
                                            <span className="text-secondary d-block" style={{ fontSize: "0.66rem" }}>
                                                RFC: {f.rfc_proveedor}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark text-truncate mb-1" style={{ maxWidth: "220px", fontSize: "0.74rem" }} title={f.nombre_receptor || "Sin razón social"}>
                                                {f.nombre_receptor || <span className="text-muted fst-italic" style={{ fontSize: "0.68rem" }}>Sin razón social</span>}
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <Badge bg="light" text="dark" className="border" style={{ fontSize: "0.67rem" }}>
                                                    {f.sucursal_destino}
                                                </Badge>
                                                {f.almacen_sae && (
                                                    <span className="text-muted ms-1" style={{ fontSize: "0.66rem" }}>
                                                        (Alm {f.almacen_sae})
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            {renderBadgeEstatus(f.estatus, tieneIncidencias, f.id)}
                                        </td>
                                        <td className="text-muted text-center" style={{ fontSize: "0.72rem" }}>
                                            {fechaLimpia}
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <div className="d-flex justify-content-center align-items-center gap-1">
                                                {listaParaOC && (
                                                    <button 
                                                        className="btn btn-success btn-accion-sm fw-bold"
                                                        onClick={() => iniciarGeneracionOC(f)}
                                                        disabled={cargandoDetalleOC || eliminandoId === f.id}
                                                        title="Generar archivo .MOD para SAE"
                                                    >
                                                        <BiCheckDouble /> Generar OC
                                                    </button>
                                                )}

                                                {yaProcesada && (
                                                    <button 
                                                        className="btn btn-outline-secondary btn-accion-sm"
                                                        onClick={() => iniciarGeneracionOC(f)}
                                                        disabled={eliminandoId === f.id}
                                                        title="Re-abrir o re-descargar archivo .MOD"
                                                    >
                                                        <BiFile /> Re-descargar
                                                    </button>
                                                )}

                                                {["PENDIENTE", "EN_RECEPCION"].includes(f.estatus) && (
                                                    <span className="text-muted small fst-italic me-1" style={{ fontSize: "0.72rem" }}>
                                                        En espera
                                                    </span>
                                                )}

                                                <button 
                                                    type="button"
                                                    className="btn btn-outline-danger btn-accion-sm"
                                                    onClick={() => handleEliminarFactura(f)}
                                                    disabled={eliminandoId === f.id}
                                                    title={`Eliminar factura ${f.folio_factura}`}
                                                >
                                                    {eliminandoId === f.id ? (
                                                        <Spinner animation="border" size="sm" style={{ width: "10px", height: "10px" }} />
                                                    ) : (
                                                        <>
                                                            <BiTrash size={13} />
                                                            {["PENDIENTE", "EN_RECEPCION"].includes(f.estatus) && <span>Borrar</span>}
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {facturasFiltradas.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        <p className="mb-2">No se encontraron facturas con los filtros seleccionados.</p>
                                        <button 
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => setShowModalSubir(true)}
                                        >
                                            + Cargar una nueva factura XML
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal para subir y asignar factura */}
            <ModalSubirFactura
                show={showModalSubir}
                onHide={() => setShowModalSubir(false)}
                onSuccess={cargarFacturas}
            />

            {/* Modal para ver incidencias de conteo en sucursal */}
            <ModalIncidencias
                show={incidenciaId !== null}
                onHide={() => setIncidenciaId(null)}
                recepcionId={incidenciaId}
                onGenerarOC={(detalle) => {
                    setIncidenciaId(null);
                    setFacturaParaOC(detalle);
                }}
            />
        </div>
    );
};

export default TableroReposiciones;
