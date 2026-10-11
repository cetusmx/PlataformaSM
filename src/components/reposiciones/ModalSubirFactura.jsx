import React, { useState, useEffect, useContext } from "react";
import Axios from "axios";
import { Modal, Button, Spinner } from "react-bootstrap";
import { BiUpload, BiCheckCircle, BiBuildings, BiRefresh, BiErrorCircle } from "react-icons/bi";
import Swal from "sweetalert2";
import { DataContext } from "../../contexts/dataContext";
import "../../styles/tableroReposiciones.css";
import "../../styles/facturaReutilizable.css";

const ModalSubirFactura = ({ show, onHide, onSuccess }) => {
    const { valor } = useContext(DataContext);
    const infoUsuario = valor?.contextData || {};
    const urlServidorAPI = process.env.REACT_APP_URL_API1;

    const [file, setFile] = useState(null);
    const [xmlRawText, setXmlRawText] = useState("");
    const [facturaData, setFacturaData] = useState(null);
    const [partidas, setPartidas] = useState([]);
    const [almacenes, setAlmacenes] = useState([]);
    const [almacenSeleccionado, setAlmacenSeleccionado] = useState("");
    const [observacionesEnvio, setObservacionesEnvio] = useState("");
    const [descuentoGeneral, setDescuentoGeneral] = useState("");
    const [loading, setLoading] = useState(false);
    const [cargandoClaves, setCargandoClaves] = useState(false);
    const [filasCargando, setFilasCargando] = useState({});
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (show) {
            fetchAlmacenes();
            limpiar();
        }
    }, [show]);

    const limpiar = () => {
        setFile(null);
        setXmlRawText("");
        setFacturaData(null);
        setPartidas([]);
        setAlmacenSeleccionado("");
        setObservacionesEnvio("");
        setDescuentoGeneral("");
        setLoading(false);
        setCargandoClaves(false);
        setFilasCargando({});
        setGuardando(false);
    };

    const handleDescuentoChange = (index, value) => {
        const val = parseFloat(value);
        const desc = isNaN(val) ? 0 : Math.max(0, Math.min(100, val));
        setPartidas(prev => prev.map((item, idx) => {
            if (idx === index) {
                return {
                    ...item,
                    descuento_porcentaje: desc
                };
            }
            return item;
        }));
    };

    const aplicarDescuentoGeneral = (valor) => {
        const val = parseFloat(valor);
        const desc = isNaN(val) ? 0 : Math.max(0, Math.min(100, val));
        setPartidas(prev => prev.map(item => ({
            ...item,
            descuento_porcentaje: desc
        })));
    };

    const calcularTotales = () => {
        const subtotalBruto = partidas.reduce((acc, it) => acc + (Number(it.importe) || 0), 0);
        const descuentoTotal = partidas.reduce((acc, it) => {
            const imp = Number(it.importe) || 0;
            const desc = Number(it.descuento_porcentaje) || 0;
            return acc + ((imp * desc) / 100);
        }, 0);
        const subtotalNeto = subtotalBruto - descuentoTotal;
        const iva = subtotalNeto * 0.16;
        const totalFinal = subtotalNeto + iva;
        return { subtotalBruto, descuentoTotal, subtotalNeto, iva, totalFinal };
    };

    const fetchAlmacenes = () => {
        Axios.get(`${urlServidorAPI}/compras/getalmacenes`)
            .then(res => setAlmacenes(res.data || []))
            .catch(err => console.error("Error al cargar almacenes", err));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.name.toLowerCase().endsWith(".xml")) {
            Swal.fire("Archivo no válido", "Por favor seleccione un archivo .XML del SAT", "warning");
            return;
        }

        setFile(selectedFile);
        setLoading(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            setXmlRawText(content);
            parseXML(content);
        };
        reader.onerror = () => {
            setLoading(false);
            Swal.fire("Error", "No se pudo leer el archivo XML", "error");
        };
        reader.readAsText(selectedFile);
    };

    const parseXML = (xmlText) => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            const ns4 = "http://www.sat.gob.mx/cfd/4";
            const ns3 = "http://www.sat.gob.mx/cfd/3";
            const tfdNS = "http://www.sat.gob.mx/TimbreFiscalDigital";

            const emisorNode = xmlDoc.getElementsByTagNameNS(ns4, "Emisor")[0] || xmlDoc.getElementsByTagNameNS(ns3, "Emisor")[0];
            const receptorNode = xmlDoc.getElementsByTagNameNS(ns4, "Receptor")[0] || xmlDoc.getElementsByTagNameNS(ns3, "Receptor")[0];
            const comprobanteNode = xmlDoc.getElementsByTagNameNS(ns4, "Comprobante")[0] || xmlDoc.getElementsByTagNameNS(ns3, "Comprobante")[0];
            const timbreNode = xmlDoc.getElementsByTagNameNS(tfdNS, "TimbreFiscalDigital")[0];
            const conceptosNodes = xmlDoc.getElementsByTagNameNS(ns4, "Concepto").length > 0 
                ? xmlDoc.getElementsByTagNameNS(ns4, "Concepto") 
                : xmlDoc.getElementsByTagNameNS(ns3, "Concepto");

            if (!comprobanteNode || !emisorNode) {
                setLoading(false);
                Swal.fire("Formato incorrecto", "El archivo XML no corresponde a una factura fiscal válida.", "error");
                return;
            }

            const header = {
                proveedor: emisorNode.getAttribute("Nombre") || "N/A",
                rfc: emisorNode.getAttribute("Rfc") || "N/A",
                receptor: receptorNode?.getAttribute("Nombre") || "N/A",
                rfcReceptor: receptorNode?.getAttribute("Rfc") || "",
                folio: comprobanteNode.getAttribute("Folio") || "S/F",
                fecha: (comprobanteNode.getAttribute("Fecha") || "").split("T")[0] || new Date().toISOString().split("T")[0],
                uuid: timbreNode ? timbreNode.getAttribute("UUID") : null,
                total: parseFloat(comprobanteNode.getAttribute("Total") || 0)
            };

            const items = [];
            for (let i = 0; i < conceptosNodes.length; i++) {
                const node = conceptosNodes[i];
                const cveProv = node.getAttribute("NoIdentificacion") || "N/A";
                const cveSAT = node.getAttribute("ClaveProdServ") || "";
                
                // Excluir fletes o conceptos no de inventario si aplica
                if (cveProv === "F-01") continue;

                const canti = parseFloat(node.getAttribute("Cantidad") || 0);
                const valorUnit = parseFloat(node.getAttribute("ValorUnitario") || 0);
                const imp = parseFloat(node.getAttribute("Importe") || (canti * valorUnit));

                items.push({
                    numero_partida: items.length + 1,
                    clave_proveedor: cveProv,
                    clave_interna: null,
                    descripcion: node.getAttribute("Descripcion") || "Sin descripción",
                    cantidad_facturada: canti,
                    cantidad_recibida: 0,
                    precio_unitario: valorUnit,
                    importe: imp,
                    descuento_porcentaje: 0,
                    estatus_partida: "PENDIENTE",
                    observacion: null
                });
            }

            setFacturaData(header);
            setPartidas(items);
            setLoading(false);

            // Cruce de claves con el backend
            consultarClavesProveedor(header.rfc, items);

        } catch (error) {
            console.error("Error al procesar XML:", error);
            setLoading(false);
            Swal.fire("Error al parsear", "Hubo un problema al leer el contenido del XML.", "error");
        }
    };

    const consultarClavesProveedor = async (rfc, items) => {
        setCargandoClaves(true);

        // Excepción de RFCs especiales donde la clave interna es la misma del proveedor
        if (rfc === "ROSA7504083F6" || rfc === "SAHR520527U29") {
            setPartidas(items.map(item => ({
                ...item,
                clave_interna: item.clave_proveedor
            })));
            setCargandoClaves(false);
            return;
        }

        const clavesUnicas = [...new Set(items.map(p => p.clave_proveedor))];

        try {
            // 1. Usar el endpoint original de Reposiciones (/compras/getclavesproveedor)
            const response = await Axios.post(`${urlServidorAPI}/compras/getclavesproveedor`, { rfc, claves: clavesUnicas });
            const { partidas: clavesServidor } = response.data || {};
            const lista = clavesServidor || response.data || [];

            const partidasActualizadas = items.map(item => {
                const coincidencia = (Array.isArray(lista) ? lista : []).find(c => 
                    c.claveprove?.trim().toUpperCase() === item.clave_proveedor?.trim().toUpperCase()
                );
                const claveFinal = (coincidencia && coincidencia.clave) ? coincidencia.clave : "No-registrada";
                return {
                    ...item,
                    clave_interna: claveFinal
                };
            });

            // Si algunas quedaron como No-registrada, intentar complementarlas con /api/v1/recepcion/productos
            const faltantes = partidasActualizadas.filter(p => p.clave_interna === "No-registrada").map(p => p.clave_proveedor);
            if (faltantes.length > 0) {
                try {
                    const res2 = await Axios.post(`${urlServidorAPI}/api/v1/recepcion/productos`, {
                        rfc: rfc,
                        claves_proveedor: faltantes
                    });
                    const resultados = res2.data?.resultados || [];
                    const partidasFinales = partidasActualizadas.map(item => {
                        if (item.clave_interna === "No-registrada") {
                            const c2 = resultados.find(c => 
                                c.clave_proveedor?.trim().toUpperCase() === item.clave_proveedor?.trim().toUpperCase()
                            );
                            if (c2 && c2.nuestra_clave && c2.nuestra_clave !== "No-registrada") {
                                return { ...item, clave_interna: c2.nuestra_clave };
                            }
                        }
                        return item;
                    });
                    setPartidas(partidasFinales);
                } catch {
                    setPartidas(partidasActualizadas);
                }
            } else {
                setPartidas(partidasActualizadas);
            }
            setCargandoClaves(false);
        } catch (err) {
            console.warn("Fallo en /compras/getclavesproveedor, intentando /api/v1/recepcion/productos:", err);
            try {
                const res2 = await Axios.post(`${urlServidorAPI}/api/v1/recepcion/productos`, {
                    rfc: rfc,
                    claves_proveedor: clavesUnicas
                });
                const resultados = res2.data?.resultados || [];
                const partidasActualizadas = items.map(item => {
                    const coincidencia = resultados.find(c => 
                        c.clave_proveedor?.trim().toUpperCase() === item.clave_proveedor?.trim().toUpperCase()
                    );
                    return {
                        ...item,
                        clave_interna: coincidencia ? coincidencia.nuestra_clave : "No-registrada"
                    };
                });
                setPartidas(partidasActualizadas);
            } catch (err2) {
                setPartidas(items.map(it => ({ ...it, clave_interna: "No-registrada" })));
            }
            setCargandoClaves(false);
        }
    };

    const consultarClaveUnitaria = async (idx, item) => {
        setFilasCargando(prev => ({ ...prev, [idx]: true }));
        try {
            let claveFinal = null;

            // 1. Intentar por /compras/getclavesproveedor
            try {
                const res = await Axios.get(`${urlServidorAPI}/compras/getclavesproveedor`, {
                    params: { rfc: facturaData.rfc, clave: item.clave_proveedor, _t: Date.now() }
                });
                const data = res.data;
                const coincidencia = Array.isArray(data) ? data[0] : data;
                if (coincidencia && coincidencia.clave && coincidencia.clave !== "No-registrada") {
                    claveFinal = coincidencia.clave;
                }
            } catch (err1) {
                console.warn("Fallo en getclavesproveedor unitario:", err1);
            }

            // 2. Si no se encontró, consultar por /api/v1/recepcion/productos
            if (!claveFinal) {
                try {
                    const res2 = await Axios.post(`${urlServidorAPI}/api/v1/recepcion/productos`, {
                        rfc: facturaData.rfc,
                        claves_proveedor: [item.clave_proveedor]
                    });
                    const resultados = res2.data?.resultados || [];
                    const c2 = resultados.find(c => 
                        c.clave_proveedor?.trim().toUpperCase() === item.clave_proveedor?.trim().toUpperCase()
                    );
                    if (c2 && c2.nuestra_clave && c2.nuestra_clave !== "No-registrada") {
                        claveFinal = c2.nuestra_clave;
                    }
                } catch (err2) {
                    console.warn("Fallo en productos recepcion unitario:", err2);
                }
            }

            if (claveFinal && claveFinal !== "No-registrada") {
                setPartidas(prev => prev.map((p, i) => {
                    if (i === idx) {
                        return { ...p, clave_interna: claveFinal };
                    }
                    return p;
                }));
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: `Clave vinculada: ${claveFinal}`,
                    showConfirmButton: false,
                    timer: 2500
                });
            } else {
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "warning",
                    title: `La clave "${item.clave_proveedor}" aún no está en el catálogo`,
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        } catch (error) {
            console.error("Error al consultar clave unitaria:", error);
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Error al consultar catálogo",
                showConfirmButton: false,
                timer: 2000
            });
        } finally {
            setFilasCargando(prev => ({ ...prev, [idx]: false }));
        }
    };

    const handleRegistrar = async () => {
        if (!almacenSeleccionado) {
            Swal.fire("Atención", "Debe seleccionar la Sucursal / Almacén de destino.", "warning");
            return;
        }

        const tieneNoRegistradas = partidas.some(p => p.clave_interna === "No-registrada" || !p.clave_interna);
        const cantNoRegistradas = partidas.filter(p => p.clave_interna === "No-registrada" || !p.clave_interna).length;
        if (tieneNoRegistradas) {
            Swal.fire({
                title: "Claves No Registradas",
                text: `No se puede registrar y enviar a sucursal porque existen ${cantNoRegistradas} partida(s) con clave 'No-registrada'. El comprador debe darlas de alta en el catálogo antes de continuar.`,
                icon: "warning",
                confirmButtonText: "Entendido"
            });
            return;
        }

        const almObj = almacenes.find(a => String(a.id) === String(almacenSeleccionado));
        const sucursalNombre = almObj ? almObj.nombre : `Almacén ${almacenSeleccionado}`;

        const totalPiezas = partidas.reduce((acc, it) => acc + (Number(it.cantidad_facturada) || 0), 0);

        const payload = {
            folio_factura: facturaData.folio,
            uuid_sat: facturaData.uuid,
            rfc_proveedor: facturaData.rfc,
            nombre_proveedor: facturaData.proveedor,
            nombre_receptor: facturaData.receptor || null,
            rfc_receptor: facturaData.rfcReceptor || null,
            sucursal_destino: sucursalNombre,
            almacen_sae: parseInt(almacenSeleccionado, 10),
            fecha_factura: facturaData.fecha,
            subido_por: infoUsuario?.email || "Sin email",
            observaciones_generales: observacionesEnvio.trim() || null,
            xml_original: xmlRawText,
            total_partidas: partidas.length,
            total_piezas_facturadas: totalPiezas,
            partidas: partidas
        };

        setGuardando(true);

        try {
            const res = await Axios.post(`${urlServidorAPI}/api/v1/recepcion/crear`, payload);
            setGuardando(false);

            if (res.status === 201 || res.data?.success) {
                Swal.fire({
                    title: "¡Factura Asignada!",
                    text: `La factura ${facturaData.folio} ha sido enviada a la bandeja de recepción de ${sucursalNombre}.`,
                    icon: "success",
                    confirmButtonText: "Entendido"
                });
                onSuccess();
                onHide();
            } else {
                Swal.fire("Error", "No se pudo registrar la recepción", "error");
            }
        } catch (error) {
            setGuardando(false);
            console.error("Error al registrar recepción:", error);
            const msg = error.response?.data?.details || error.response?.data?.error || "Error al conectar con el servidor.";
            Swal.fire("Error al registrar", msg, "error");
        }
    };

    const tieneNoRegistradas = partidas.some(p => p.clave_interna === 'No-registrada' || !p.clave_interna);
    const cantNoRegistradas = partidas.filter(p => p.clave_interna === 'No-registrada' || !p.clave_interna).length;

    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            dialogClassName={!facturaData ? "modal-subir-archivo" : "modal-mostrar-factura"} 
            backdrop="static" 
            centered
        >
            <Modal.Header closeButton className="bg-light py-2">
                <Modal.Title style={{ fontSize: "1rem", fontWeight: "600" }}>
                    {!facturaData ? (
                        <>
                            <BiUpload className="me-2 text-primary" /> Cargar Factura XML del Proveedor
                        </>
                    ) : (
                        <>
                            <BiUpload className="me-2 text-success" /> Asignar Factura a Sucursal — {facturaData.receptor}
                        </>
                    )}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-3">
                {!facturaData ? (
                    <div className="text-center py-4 border rounded bg-light">
                        {loading ? (
                            <div>
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2 text-muted small">Leyendo archivo XML y extrayendo conceptos...</p>
                            </div>
                        ) : (
                            <div>
                                <BiUpload size={48} className="text-primary mb-2" />
                                <h6>Seleccione la factura XML del Proveedor</h6>
                                <p className="text-muted small mb-3">El sistema leerá los conceptos y los cruzará automáticamente.</p>
                                <input
                                    type="file"
                                    accept=".xml"
                                    className="form-control mx-auto"
                                    style={{ maxWidth: "350px" }}
                                    onChange={handleFileChange}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        {/* Cabecera resumen de la factura */}
                        <div className="bg-light p-2 rounded border mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                                <span className="text-muted small d-block">PROVEEDOR</span>
                                <strong>{facturaData.proveedor}</strong> <span className="text-secondary small">({facturaData.rfc})</span>
                            </div>
                            <div>
                                <span className="text-muted small d-block">FOLIO</span>
                                <strong>{facturaData.folio}</strong>
                            </div>
                            <div>
                                <span className="text-muted small d-block">FECHA</span>
                                <span>{facturaData.fecha}</span>
                            </div>
                            <div>
                                <span className="text-muted small d-block">PARTIDAS / PZAS</span>
                                <span className="badge bg-secondary">
                                    {partidas.length} partidas ({partidas.reduce((a, b) => a + b.cantidad_facturada, 0)} pzas)
                                </span>
                            </div>
                            <div>
                                <span className="text-muted small d-block">TOTAL XML</span>
                                <strong>${facturaData.total?.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</strong>
                            </div>
                        </div>

                        {/* Selección de Sucursal / Almacén */}
                        <div className="row g-2 mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small mb-1">
                                    <BiBuildings className="me-1 text-primary" /> Sucursal / Almacén de Destino *
                                </label>
                                <select 
                                    className="form-select form-select-sm"
                                    value={almacenSeleccionado}
                                    onChange={(e) => setAlmacenSeleccionado(e.target.value)}
                                >
                                    <option value="">-- Seleccione Sucursal Destino --</option>
                                    {almacenes.map(alm => (
                                        <option key={alm.id} value={alm.id}>
                                            {alm.id} - {alm.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small mb-1">
                                    Observaciones / Guía de Envío (Opcional)
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Ej. Guía Paquetexpress #123456"
                                    value={observacionesEnvio}
                                    onChange={(e) => setObservacionesEnvio(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Desglose de partidas con columnas de descuento y totales */}
                        <div className="border rounded">
                            <div className="bg-light px-2 py-1 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="fw-bold small">Desglose de Conceptos</span>
                                    {cargandoClaves && (
                                        <span className="text-primary small">
                                            <Spinner animation="border" size="sm" className="me-1" /> Cruzando claves...
                                        </span>
                                    )}
                                </div>

                                <div className="d-flex align-items-center gap-1">
                                    <span className="text-muted small" style={{ fontSize: "0.75rem" }}>Aplicar Desc. a todas:</span>
                                    <div className="input-group input-group-sm" style={{ width: "105px" }}>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm text-end pe-1"
                                            placeholder="0"
                                            min="0"
                                            max="100"
                                            step="0.5"
                                            value={descuentoGeneral}
                                            onChange={(e) => {
                                                setDescuentoGeneral(e.target.value);
                                                aplicarDescuentoGeneral(e.target.value);
                                            }}
                                        />
                                        <span className="input-group-text px-1">%</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                                <table className="table table-sm table-striped table-hover mb-0" style={{ fontSize: "0.78rem" }}>
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th style={{ width: "6%" }}>Cant</th>
                                            <th style={{ width: "22%" }}>Clave Prov. / Desc.</th>
                                            <th style={{ width: "16%" }}>Nuestra Clave</th>
                                            <th style={{ width: "10%", textAlign: "right" }}>P. Unit</th>
                                            <th style={{ width: "10%", textAlign: "right" }}>Importe</th>
                                            <th style={{ width: "11%", textAlign: "right" }}>Desc. (%)</th>
                                            <th style={{ width: "11%", textAlign: "right" }}>Monto Desc.</th>
                                            <th style={{ width: "14%", textAlign: "right" }}>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {partidas.map((item, idx) => {
                                            const pUnit = Number(item.precio_unitario || 0);
                                            const descPorc = Number(item.descuento_porcentaje || 0);
                                            const imp = Number(item.importe || (item.cantidad_facturada * pUnit));
                                            const montoDesc = (imp * descPorc) / 100;
                                            const subtotalFila = imp - montoDesc;
                                            const pUnitNeto = pUnit * (1 - descPorc / 100);

                                            return (
                                                <tr key={idx}>
                                                    <td className="fw-bold">{item.cantidad_facturada}</td>
                                                    <td>
                                                        <span className="fw-bold">{item.clave_proveedor}</span>
                                                        <span className="text-muted d-block small text-truncate" style={{ maxWidth: "210px" }} title={item.descripcion}>
                                                            {item.descripcion}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <span className={`badge ${item.clave_interna === 'No-registrada' ? 'bg-danger' : 'bg-primary'}`}>
                                                                {filasCargando[idx] ? "Buscando..." : (item.clave_interna || "...")}
                                                            </span>
                                                            {(item.clave_interna === 'No-registrada' || !item.clave_interna) && (
                                                                <button
                                                                    type="button"
                                                                    className="btn-refresh-min ms-1 p-0"
                                                                    onClick={() => consultarClaveUnitaria(idx, item)}
                                                                    disabled={filasCargando[idx] || cargandoClaves}
                                                                    title="Volver a consultar esta clave en el catálogo"
                                                                    style={{ border: "none", background: "none", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                                                                >
                                                                    {filasCargando[idx] ? (
                                                                        <Spinner animation="border" size="sm" style={{ width: "12px", height: "12px" }} />
                                                                    ) : (
                                                                        <BiRefresh size={18} className="text-danger" />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: "right" }}>
                                                        <div>${pUnit.toFixed(2)}</div>
                                                        {descPorc > 0 && (
                                                            <span className="text-success small d-block" style={{ fontSize: "0.7rem" }} title="Precio unitario neto con descuento">
                                                                Neto: ${pUnitNeto.toFixed(2)}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: "right" }}>
                                                        ${imp.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td style={{ textAlign: "right" }}>
                                                        <div className="input-group input-group-sm" style={{ width: "75px", marginLeft: "auto" }}>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm text-end pe-1"
                                                                value={item.descuento_porcentaje === 0 ? "0" : item.descuento_porcentaje}
                                                                onChange={(e) => handleDescuentoChange(idx, e.target.value)}
                                                                min="0"
                                                                max="100"
                                                                step="0.1"
                                                            />
                                                            <span className="input-group-text px-1">%</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: "right" }}>
                                                        <span className={montoDesc > 0 ? "text-danger fw-bold" : "text-muted"}>
                                                            {montoDesc > 0 ? `- $${montoDesc.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: "right" }}>
                                                        <strong className="text-dark">
                                                            ${subtotalFila.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </strong>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Resumen Totales en la parte baja */}
                        {(() => {
                            const { subtotalBruto, descuentoTotal, subtotalNeto, iva, totalFinal } = calcularTotales();
                            return (
                                <div className="bg-light p-2 px-3 rounded border mt-2 d-flex justify-content-end align-items-center gap-4 flex-wrap">
                                    <div className="text-end">
                                        <span className="text-muted small d-block text-uppercase" style={{ fontSize: "0.7rem" }}>Subtotal</span>
                                        <strong>${subtotalBruto.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                    </div>
                                    <div className="text-end text-danger">
                                        <span className="text-muted small d-block text-uppercase" style={{ fontSize: "0.7rem" }}>Descuento</span>
                                        <strong>- ${descuentoTotal.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                    </div>
                                    <div className="text-end">
                                        <span className="text-muted small d-block text-uppercase" style={{ fontSize: "0.7rem" }}>IVA (16%)</span>
                                        <strong>${iva.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                    </div>
                                    <div className="text-end text-primary ps-3 border-start">
                                        <span className="text-muted small d-block text-uppercase" style={{ fontSize: "0.7rem" }}>Total Final</span>
                                        <strong className="fs-6">${totalFinal.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Alerta de bloqueo si existen claves no registradas */}
                        {tieneNoRegistradas && (
                            <div className="alert alert-warning py-2 px-3 mt-3 mb-0 d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ fontSize: "0.8rem" }}>
                                <div className="d-flex align-items-center">
                                    <BiErrorCircle className="me-2 text-danger flex-shrink-0" size={20} />
                                    <span>
                                        <strong>Acción requerida:</strong> Existen <strong>{cantNoRegistradas}</strong> partida(s) con clave <span className="badge bg-danger">No-registrada</span>. El comprador debe darlas de alta en el catálogo antes de poder registrar y enviar la factura a la sucursal.
                                    </span>
                                </div>
                                <Button 
                                    variant="outline-dark" 
                                    size="sm" 
                                    className="py-1 px-2 d-flex align-items-center gap-1" 
                                    style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
                                    onClick={() => consultarClavesProveedor(facturaData.rfc, partidas)}
                                    disabled={cargandoClaves}
                                    title="Volver a consultar todas las claves en el sistema"
                                >
                                    <BiRefresh size={16} className={cargandoClaves ? "spin" : ""} /> Re-verificar todas
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer className="py-2">
                <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={guardando}>
                    Cancelar
                </Button>
                {facturaData && (
                    <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={handleRegistrar} 
                        disabled={guardando || !almacenSeleccionado || tieneNoRegistradas || cargandoClaves}
                        title={tieneNoRegistradas ? `Debe vincular las ${cantNoRegistradas} clave(s) no registradas antes de enviar a sucursal` : ""}
                    >
                        {guardando ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-1" /> Asignando...
                            </>
                        ) : (
                            <>
                                <BiCheckCircle className="me-1" /> Registrar y Enviar a Sucursal
                            </>
                        )}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default ModalSubirFactura;
