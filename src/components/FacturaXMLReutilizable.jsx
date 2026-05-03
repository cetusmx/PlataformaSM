import React, { useState, useEffect } from "react";
import "../styles/facturaReutilizable.css";
import { BiXCircle, BiUpload, BiRefresh, BiCheckDouble } from "react-icons/bi";
import { show_alerta } from "../functions";
import Axios from "axios";
import { Spinner } from "react-bootstrap";

const FacturaXMLReutilizable = ({ storageKey = "factura_progress" }) => {
    const [facturaData, setFacturaData] = useState(null);
    const [partidas, setPartidas] = useState([]);
    const [almacenes, setAlmacenes] = useState([]);
    const [almacenSeleccionado, setAlmacenSeleccionado] = useState("");
    const [claveProvSistema, setClaveProvSistema] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recargandoMasivo, setRecargandoMasivo] = useState(false);
    const [filasCargando, setFilasCargando] = useState({});

    const urlServidorAPI = process.env.REACT_APP_URL_API1;

    // Valores fijos según MODELO_149486.mod
    const CONSTANTES = {
        ESQUEMA: 1,
        NUM_MONED: 1,
        CONDICION: "CONTADO"
    };

    // Cargar datos guardados al iniciar
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.facturaData) {
                    setFacturaData(parsed.facturaData);
                    setPartidas(parsed.partidas || []);
                    setAlmacenSeleccionado(parsed.almacenSeleccionado || "");
                    setClaveProvSistema(parsed.claveProvSistema || null);
                }
            } catch (e) {
                console.error("Error al cargar progreso guardado:", e);
            }
        }
        fetchAlmacenes();
    }, [storageKey]);

    // Guardar datos automáticamente ante cualquier cambio
    useEffect(() => {
        if (facturaData) {
            const dataToSave = {
                facturaData,
                partidas,
                almacenSeleccionado,
                claveProvSistema
            };
            localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        }
    }, [facturaData, partidas, almacenSeleccionado, claveProvSistema, storageKey]);

    const fetchAlmacenes = () => {
        Axios.get(`${urlServidorAPI}/getalmacenes`)
            .then(res => setAlmacenes(res.data))
            .catch(err => console.error("Error al cargar almacenes", err));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    const getClavesMasivas = (rfc, items) => {
        setRecargandoMasivo(true);
        const clavesUnicas = [...new Set(items.map(p => p.claveProveedor))];
        Axios.post(`${urlServidorAPI}/getclavesproveedor`, { rfc, claves: clavesUnicas })
            .then((response) => {
                const { cve_clpv, partidas: clavesServidor } = response.data;
                setClaveProvSistema(cve_clpv || "NO ENCONTRADO");
                const partidasActualizadas = items.map(item => {
                    const coincidencia = (clavesServidor || response.data).find(c => 
                        c.claveprove?.trim().toUpperCase() === item.claveProveedor?.trim().toUpperCase()
                    );
                    const claveFinal = (coincidencia && coincidencia.clave) ? coincidencia.clave : "No-registrada";
                    return { ...item, claveInterna: claveFinal, origen: coincidencia?.origen || null };
                });
                setPartidas(partidasActualizadas);
                setRecargandoMasivo(false);
            })
            .catch(() => {
                setPartidas(items.map(it => ({ ...it, claveInterna: "No-registrada" })));
                setRecargandoMasivo(false);
            });
    };

    const getClaveUnitaria = (item) => {
        setFilasCargando(prev => ({ ...prev, [item.id]: true }));
        Axios.get(`${urlServidorAPI}/getclavesproveedor`, {
            params: { rfc: facturaData.rfc, clave: item.claveProveedor, _t: Date.now() }
        }).then((response) => {
            const data = response.data;
            const coincidencia = Array.isArray(data) ? data[0] : data;
            setPartidas(prev => prev.map(p => {
                if (p.id === item.id) {
                    const claveFinal = (coincidencia && coincidencia.clave) ? coincidencia.clave : "No-registrada";
                    return { ...p, claveInterna: claveFinal, origen: coincidencia?.origen || null };
                }
                return p;
            }));
            setFilasCargando(prev => ({ ...prev, [item.id]: false }));
        }).catch(() => setFilasCargando(prev => ({ ...prev, [item.id]: false })));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        const reader = new FileReader();
        reader.onload = (event) => parseXML(event.target.result);
        reader.readAsText(file);
    };

    const parseXML = (xmlText) => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            const ns4 = "http://www.sat.gob.mx/cfd/4";
            const ns3 = "http://www.sat.gob.mx/cfd/3";
            let emisorNode = xmlDoc.getElementsByTagNameNS(ns4, "Emisor")[0] || xmlDoc.getElementsByTagNameNS(ns3, "Emisor")[0];
            let comprobanteNode = xmlDoc.getElementsByTagNameNS(ns4, "Comprobante")[0] || xmlDoc.getElementsByTagNameNS(ns3, "Comprobante")[0];
            let conceptosNodes = xmlDoc.getElementsByTagNameNS(ns4, "Concepto") || xmlDoc.getElementsByTagNameNS(ns3, "Concepto");

            const header = {
                proveedor: emisorNode?.getAttribute("Nombre") || "N/A",
                rfc: emisorNode?.getAttribute("Rfc") || "N/A",
                folio: comprobanteNode.getAttribute("Folio") || "S/F",
                fecha: (comprobanteNode.getAttribute("Fecha") || "S/F").split('T')[0]
            };

            const items = [];
            for (let i = 0; i < conceptosNodes.length; i++) {
                const node = conceptosNodes[i];
                items.push({
                    id: i,
                    descripcion: node.getAttribute("Descripcion") || "Sin descripción",
                    cantidad: parseFloat(node.getAttribute("Cantidad") || 0),
                    valorUnitario: parseFloat(node.getAttribute("ValorUnitario") || 0),
                    importe: parseFloat(node.getAttribute("Importe") || 0),
                    claveProveedor: node.getAttribute("NoIdentificacion") || "N/A",
                    claveInterna: null,
                    origen: null,
                    descuento: 0
                });
            }
            setFacturaData(header);
            setLoading(false);
            getClavesMasivas(header.rfc, items);
        } catch (error) {
            setLoading(false);
        }
    };

    const handleDescuentoChange = (id, value) => {
        setPartidas(partidas.map(item => item.id === id ? { ...item, descuento: parseFloat(value) || 0 } : item));
    };

    const calcularTotales = () => {
        const subtotal = partidas.reduce((acc, item) => acc + item.importe, 0);
        const descuentoTotal = partidas.reduce((acc, item) => acc + ((item.importe * item.descuento) / 100), 0);
        const baseGravable = subtotal - descuentoTotal;
        const iva = baseGravable * 0.16;
        const total = baseGravable + iva;
        return { subtotal, descuentoTotal, iva, total };
    };

    const { subtotal, descuentoTotal, iva, total } = calcularTotales();
    const tienePendientes = partidas.some(p => p.claveInterna === "No-registrada" || !p.claveInterna);
    const faltaAlmacen = !almacenSeleccionado;

    const reset = () => {
        setFacturaData(null);
        setPartidas([]);
        setClaveProvSistema(null);
        setAlmacenSeleccionado("");
    };

    const finalizarProceso = () => {
        try {
            const xmlMod = generarXMLMod();
            const blob = new Blob([xmlMod], { type: "text/xml" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `PEDIDO_${claveProvSistema}_${facturaData.folio}.mod`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            show_alerta("Archivo .MOD generado", "success");
        } catch (error) {
            show_alerta("Error al generar archivo", "error");
        }
    };

    const generarXMLMod = () => {
        let xml = `<?xml version="1.0" standalone="yes"?>\n<DATAPACKET Version="2.0">\n<METADATA>\n<FIELDS>\n`;
        xml += `<FIELD attrname="CVE_CLPV" fieldtype="string" WIDTH="10"/>\n<FIELD attrname="NUM_ALMA" fieldtype="i4"/>\n<FIELD attrname="CVE_PEDI" fieldtype="string" WIDTH="20"/>\n<FIELD attrname="ESQUEMA" fieldtype="i4"/>\n<FIELD attrname="DES_TOT" fieldtype="r8"/>\n<FIELD attrname="DES_FIN" fieldtype="r8"/>\n<FIELD attrname="CVE_VEND" fieldtype="string" WIDTH="5"/>\n<FIELD attrname="COM_TOT" fieldtype="r8"/>\n<FIELD attrname="NUM_MONED" fieldtype="i4"/>\n<FIELD attrname="TIPCAMB" fieldtype="r8"/>\n<FIELD attrname="STR_OBS" fieldtype="string" WIDTH="255"/>\n<FIELD attrname="ENTREGA" fieldtype="string" WIDTH="25"/>\n<FIELD attrname="SU_REFER" fieldtype="string" WIDTH="20"/>\n<FIELD attrname="TOT_IND" fieldtype="r8"/>\n<FIELD attrname="MODULO" fieldtype="string" WIDTH="4"/>\n<FIELD attrname="CONDICION" fieldtype="string" WIDTH="25"/>\n<FIELD attrname="dtfield" fieldtype="nested">\n<FIELDS>\n<FIELD attrname="CANT" fieldtype="r8"/>\n<FIELD attrname="CVE_ART" fieldtype="string" WIDTH="20"/>\n<FIELD attrname="DESC1" fieldtype="r8"/>\n<FIELD attrname="DESC2" fieldtype="r8"/>\n<FIELD attrname="DESC3" fieldtype="r8"/>\n<FIELD attrname="IMPU1" fieldtype="r8"/>\n<FIELD attrname="IMPU2" fieldtype="r8"/>\n<FIELD attrname="IMPU3" fieldtype="r8"/>\n<FIELD attrname="IMPU4" fieldtype="r8"/>\n<FIELD attrname="COMI" fieldtype="r8"/>\n<FIELD attrname="PREC" fieldtype="r8"/>\n<FIELD attrname="NUM_ALM" fieldtype="i4"/>\n<FIELD attrname="STR_OBS" fieldtype="string" WIDTH="255"/>\n<FIELD attrname="REG_GPOPROD" fieldtype="i4"/>\n<FIELD attrname="REG_KITPROD" fieldtype="i4"/>\n<FIELD attrname="NUM_REG" fieldtype="i4"/>\n<FIELD attrname="COSTO" fieldtype="r8"/>\n<FIELD attrname="TIPO_PROD" fieldtype="string" WIDTH="1"/>\n<FIELD attrname="TIPO_ELEM" fieldtype="string" WIDTH="1"/>\n<FIELD attrname="MINDIRECTO" fieldtype="r8"/>\n<FIELD attrname="TIP_CAM" fieldtype="r8"/>\n<FIELD attrname="FACT_CONV" fieldtype="r8"/>\n<FIELD attrname="UNI_VENTA" fieldtype="string" WIDTH="10"/>\n<FIELD attrname="IMP1APLA" fieldtype="i4"/>\n<FIELD attrname="IMP2APLA" fieldtype="i4"/>\n<FIELD attrname="IMP3APLA" fieldtype="i4"/>\n<FIELD attrname="IMP4APLA" fieldtype="i4"/>\n<FIELD attrname="PREC_SINREDO" fieldtype="r8"/>\n<FIELD attrname="COST_SINREDO" fieldtype="r8"/>\n<FIELD attrname="LOTE" fieldtype="string" WIDTH="16"/>\n<FIELD attrname="PEDIMENTO" fieldtype="string" WIDTH="16"/>\n<FIELD attrname="FECHCADUC" fieldtype="dateTime"/>\n<FIELD attrname="FECHADUANA" fieldtype="dateTime"/>\n<FIELD attrname="CVE_PRODSERV" fieldtype="string" WIDTH="9"/>\n<FIELD attrname="CVE_UNIDAD" fieldtype="string" WIDTH="4"/>\n</FIELDS>\n<PARAMS/>\n</FIELD>\n</FIELDS>\n<PARAMS/>\n</METADATA>\n<ROWDATA>\n`;
        const valorSuRefer = String(claveProvSistema).trim() === "35" ? "" : facturaData.folio;
        xml += `<ROW CVE_CLPV="${claveProvSistema}" NUM_ALMA="${almacenSeleccionado}" ESQUEMA="${CONSTANTES.ESQUEMA}" DES_TOT="0" DES_FIN="0" NUM_MONED="${CONSTANTES.NUM_MONED}" TIPCAMB="1" STR_OBS="" ENTREGA="" SU_REFER="${valorSuRefer}" TOT_IND="0" MODULO="COMP">\n`;
        xml += `<dtfield>\n`;
        partidas.forEach((p, index) => {
            const factorDescuento = 1 - (p.descuento / 100);
            const precioNeto = (p.valorUnitario * factorDescuento).toFixed(6);
            xml += `<ROWdtfield CANT="${p.cantidad}" CVE_ART="${p.claveInterna}" DESC1="0" IMPU1="0" IMPU2="0" IMPU3="0" IMPU4="16" PREC="0" NUM_ALM="${almacenSeleccionado}" STR_OBS="" REG_GPOPROD="0" COSTO="${precioNeto}" TIPO_PROD="P" TIPO_ELEM="N" MINDIRECTO="0" TIP_CAM="1" FACT_CONV="1" UNI_VENTA="PZ" IMP1APLA="6" IMP2APLA="6" IMP3APLA="6" IMP4APLA="0" PREC_SINREDO="0" COST_SINREDO="${precioNeto}"/>\n`;
        });
        xml += `</dtfield>\n</ROW>\n</ROWDATA>\n</DATAPACKET>`;
        return xml;
    };

    if (!facturaData) {
        return (
            <div className="factura-reutilizable">
                <div className="upload-section">
                    {loading ? (
                        <div className="py-4">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Procesando archivo XML...</p>
                        </div>
                    ) : (
                        <>
                            <BiUpload size={50} color="#007bff" />
                            <h4>Cargar Factura XML</h4>
                            <p>Seleccione el archivo XML del proveedor para comenzar</p>
                            <input type="file" accept=".xml" className="form-control" onChange={handleFileUpload} style={{ maxWidth: "400px", margin: "20px auto" }} />
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="factura-reutilizable" style={{ position: "relative" }}>
            {recargandoMasivo && (
                <div style={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: "rgba(255,255,255,0.7)", zIndex: 100,
                    display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"
                }}>
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 fw-bold">Buscando claves en el sistema...</p>
                </div>
            )}
            <div className="header-factura">
                <div className="header-item">
                    <strong>Proveedor</strong>
                    <span>{facturaData.proveedor}</span>
                </div>
                <div className="header-item">
                    <strong>RFC</strong>
                    <span>{facturaData.rfc}</span>
                </div>
                <div className="header-item">
                    <strong>Clave PROV</strong>
                    <span className="badge-prov-sistema">{claveProvSistema || "..."}</span>
                </div>
                <div className="header-item">
                    <strong>Folio</strong>
                    <span>{facturaData.folio}</span>
                </div>
                <div className="header-item">
                    <strong>Fecha</strong>
                    <span>{facturaData.fecha}</span>
                </div>
                <div className="header-item" style={{ border: "none" }}>
                    <strong>Almacén</strong>
                    <select className="form-select form-select-sm" value={almacenSeleccionado} onChange={(e) => setAlmacenSeleccionado(e.target.value)} style={{ width: "130px" }}>
                        <option value="">Seleccione...</option>
                        {almacenes.map(alm => <option key={alm.id} value={alm.id}>{alm.id} - {alm.nombre}</option>)}
                    </select>
                </div>
                <button className="btn btn-outline-danger btn-cancelar-top" onClick={reset}>
                    <BiXCircle /> Cancelar
                </button>
            </div>

            <div className="tabla-factura-container">
                <table className="tabla-factura">
                    <thead>
                        <tr>
                            <th style={{ width: "6%" }}>Cant.</th>
                            <th style={{ width: "28%" }}>Clave Prov. / Descripción</th>
                            <th style={{ width: "13%" }}>Clave</th>
                            <th style={{ width: "10%", textAlign: "right" }}>V. Unitario</th>
                            <th style={{ width: "10%", textAlign: "right" }}>Importe</th>
                            <th style={{ width: "11%", textAlign: "right" }}>Desc. (%)</th>
                            <th style={{ width: "10%", textAlign: "right" }}>Monto Desc.</th>
                            <th style={{ width: "12%", textAlign: "right" }}>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partidas.map((item) => {
                            const montoDesc = (item.importe * item.descuento) / 100;
                            const isNoReg = item.claveInterna === "No-registrada";
                            const loadingFila = filasCargando[item.id];
                            return (
                                <tr key={item.id}>
                                    <td>{item.cantidad}</td>
                                    <td>
                                        <strong>{item.claveProveedor}</strong>
                                        <span className="desc-secundaria">{item.descripcion}</span>
                                    </td>
                                    <td>
                                        <span className={`col-clave ${isNoReg ? "no-registrada" : ""}`}>
                                            {loadingFila ? "..." : (item.claveInterna || "...")}
                                        </span>
                                        {item.origen && !loadingFila && !isNoReg && <span className="origen-info">{item.origen}</span>}
                                        {isNoReg && (
                                            <button className="btn-refresh-min" onClick={() => getClaveUnitaria(item)} disabled={loadingFila}>
                                                <BiRefresh className={loadingFila ? "fa-spin" : ""} />
                                            </button>
                                        )}
                                    </td>
                                    <td style={{ textAlign: "right" }}>{formatCurrency(item.valorUnitario)}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurrency(item.importe)}</td>
                                    <td style={{ textAlign: "right" }}>
                                        <div className="input-group input-group-sm" style={{ width: "85px", marginLeft: "auto" }}>
                                            <input type="number" className="form-control text-end" value={item.descuento} onChange={(e) => handleDescuentoChange(item.id, e.target.value)} min="0" max="100" step="0.1" />
                                            <span className="input-group-text">%</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        {montoDesc.toLocaleString('es-MX', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                                    </td>
                                    <td style={{ textAlign: "right" }}>{formatCurrency(item.importe - montoDesc)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="footer-acciones">
                <div className="msg-validacion">
                    {tienePendientes || faltaAlmacen ? (
                        <div className="status-label status-alerta">
                           <span className="warning-icon">⚠️</span>
                           <span>{faltaAlmacen ? "Seleccione Almacén" : "Vincule todas las claves"}</span>
                        </div>
                    ) : (
                        <div className="status-label status-ok">
                           <span>✓ Listo para exportar</span>
                        </div>
                    )}
                </div>
                
                <div className="resumen-horizontal">
                    <div className="resumen-item">
                        <label>Subtotal</label>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="resumen-item" style={{ color: "#d9534f" }}>
                        <label>Descuento</label>
                        <span>- {formatCurrency(descuentoTotal)}</span>
                    </div>
                    <div className="resumen-item">
                        <label>IVA (16%)</label>
                        <span>{formatCurrency(iva)}</span>
                    </div>
                    <div className="resumen-item total-destacado">
                        <label>Total Final</label>
                        <span>{formatCurrency(total)}</span>
                    </div>
                    <button className="btn btn-primary btn-finalizar-main" disabled={tienePendientes || faltaAlmacen} onClick={finalizarProceso}>
                        <BiCheckDouble size={20} /> Generar .MOD
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FacturaXMLReutilizable;
