import React, { useState, useEffect, useRef } from "react";
import "../styles/facturaReutilizable.css";
import { BiXCircle, BiSpreadsheet, BiCheckDouble, BiArrowBack, BiTrash } from "react-icons/bi";
import { show_alerta } from "../functions";

const OrdenCompraInicial = ({ onVolver }) => {
    const [proveedor, setProveedor] = useState(null);
    const [datosExcel, setDatosExcel] = useState("");
    const [partidas, setPartidas] = useState([]);
    const [mostrarPreview, setMostrarPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const isFirstRender = useRef(true);

    const storageKey = "reposiciones_inicial_progress";

    // Constantes fijas
    const CONSTANTES = {
        ESQUEMA: 1,
        NUM_MONED: 1
    };

    // Cargar datos guardados al montar (solo una vez)
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.partidas && parsed.partidas.length > 0) {
                    setProveedor(parsed.proveedor || null);
                    setPartidas(parsed.partidas || []);
                    setDatosExcel(parsed.datosExcel || "");
                    setMostrarPreview(true);
                }
            } catch (e) {
                console.error("Error al cargar progreso:", e);
            }
        }
        isFirstRender.current = false;
    }, []); // Solo se ejecuta al montar

    // Guardar en localStorage solo cuando cambian datos (no al montar)
    useEffect(() => {
        // Skip en el primer render
        if (isFirstRender.current) return;
        
        const dataToSave = {
            proveedor: proveedor,
            partidas: partidas,
            datosExcel: datosExcel
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }, [proveedor, partidas, datosExcel]);

    const procesarExcel = () => {
        if (!datosExcel.trim()) {
            show_alerta("El área de pegado está vacía", "warning");
            return;
        }

        if (!proveedor) {
            show_alerta("Seleccione un proveedor primero", "warning");
            return;
        }

        setLoading(true);
        const lineas = datosExcel.trim().split("\n");
        const items = [];

        lineas.forEach((linea, i) => {
            const campos = linea.split(/\t/);
            if (campos.length >= 2) {
                // Nuevo orden: Almacén | Clave | Descripción | Línea | Familia | Cantidad
                const almacen = campos[0]?.trim() || "1";
                const clave = campos[1]?.trim() || "";
                const descripcion = campos[2]?.trim() || "";
                const lineaProd = campos[3]?.trim() || "";
                const familia = campos[4]?.trim() || "";
                const cantidad = parseFloat(campos[5]?.trim()) || 0;
                
                if (cantidad > 0 && clave) {
                    items.push({
                        id: i,
                        cantidad,
                        claveProveedor: clave,
                        almacen,
                        descripcion,
                        lineaProd,
                        familia
                    });
                }
            }
        });

        if (items.length === 0) {
            setLoading(false);
            show_alerta("No se detectaron datos válidos", "error");
            return;
        }

        setLoading(false);
        setPartidas(items);
        setMostrarPreview(true);
    };

const reset = () => {
        localStorage.removeItem(storageKey);
        setProveedor(null);
        setDatosExcel("");
        setPartidas([]);
        setMostrarPreview(false);
    };

    // Mostrar tabla de previsualización solo si hay partidas
    const tienePartidas = partidas.length > 0 && mostrarPreview;

    const calcularTotales = () => {
        return partidas.reduce((acc, item) => acc + item.cantidad, 0);
    };

    const generarMOD = () => {
        // Agrupar partidas por almacén
        const partidasPorAlmacen = {};
        partidas.forEach(p => {
            const alm = p.almacen;
            if (!partidasPorAlmacen[alm]) {
                partidasPorAlmacen[alm] = [];
            }
            partidasPorAlmacen[alm].push(p);
        });

        const numAlmacenes = Object.keys(partidasPorAlmacen).length;
        
        // Generar archivo por cada almacén
        Object.keys(partidasPorAlmacen).forEach((almacenHeader, index) => {
            const partidasAlmacen = partidasPorAlmacen[almacenHeader];
            
            try {
                let xml = `<?xml version="1.0" standalone="yes"?>\n<DATAPACKET Version="2.0">\n<METADATA>\n<FIELDS>\n`;
                xml += `<FIELD attrname="CVE_CLPV" fieldtype="string" WIDTH="10"/>\n<FIELD attrname="NUM_ALMA" fieldtype="i4"/>\n<FIELD attrname="CVE_PEDI" fieldtype="string" WIDTH="20"/>\n<FIELD attrname="ESQUEMA" fieldtype="i4"/>\n<FIELD attrname="DES_TOT" fieldtype="r8"/>\n<FIELD attrname="DES_FIN" fieldtype="r8"/>\n<FIELD attrname="CVE_VEND" fieldtype="string" WIDTH="5"/>\n<FIELD attrname="COM_TOT" fieldtype="r8"/>\n<FIELD attrname="NUM_MONED" fieldtype="i4"/>\n<FIELD attrname="TIPCAMB" fieldtype="r8"/>\n<FIELD attrname="STR_OBS" fieldtype="string" WIDTH="255"/>\n<FIELD attrname="ENTREGA" fieldtype="string" WIDTH="25"/>\n<FIELD attrname="SU_REFER" fieldtype="string" WIDTH="20"/>\n<FIELD attrname="TOT_IND" fieldtype="r8"/>\n<FIELD attrname="MODULO" fieldtype="string" WIDTH="4"/>\n<FIELD attrname="CONDICION" fieldtype="string" WIDTH="25"/>\n`;
                xml += `<FIELD attrname="dtfield" fieldtype="nested">\n<FIELDS>\n<FIELD attrname="CANT" fieldtype="r8"/>\n<FIELD attrname="CVE_ART" fieldtype="string" WIDTH="20"/>\n<FIELD attrname="DESC1" fieldtype="r8"/>\n<FIELD attrname="DESC2" fieldtype="r8"/>\n<FIELD attrname="DESC3" fieldtype="r8"/>\n<FIELD attrname="IMPU1" fieldtype="r8"/>\n<FIELD attrname="IMPU2" fieldtype="r8"/>\n<FIELD attrname="IMPU3" fieldtype="r8"/>\n<FIELD attrname="IMPU4" fieldtype="r8"/>\n<FIELD attrname="COMI" fieldtype="r8"/>\n<FIELD attrname="PREC" fieldtype="r8"/>\n<FIELD attrname="NUM_ALM" fieldtype="i4"/>\n<FIELD attrname="STR_OBS" fieldtype="string" WIDTH="255"/>\n<FIELD attrname="REG_GPOPROD" fieldtype="i4"/>\n<FIELD attrname="REG_KITPROD" fieldtype="i4"/>\n<FIELD attrname="NUM_REG" fieldtype="i4"/>\n<FIELD attrname="COSTO" fieldtype="r8"/>\n<FIELD attrname="TIPO_PROD" fieldtype="string" WIDTH="1"/>\n<FIELD attrname="TIPO_ELEM" fieldtype="string" WIDTH="1"/>\n<FIELD attrname="MINDIRECTO" fieldtype="r8"/>\n<FIELD attrname="TIP_CAM" fieldtype="r8"/>\n<FIELD attrname="FACT_CONV" fieldtype="r8"/>\n<FIELD attrname="UNI_VENTA" fieldtype="string" WIDTH="10"/>\n<FIELD attrname="IMP1APLA" fieldtype="i4"/>\n<FIELD attrname="IMP2APLA" fieldtype="i4"/>\n<FIELD attrname="IMP3APLA" fieldtype="i4"/>\n<FIELD attrname="IMP4APLA" fieldtype="i4"/>\n<FIELD attrname="PREC_SINREDO" fieldtype="r8"/>\n<FIELD attrname="COST_SINREDO" fieldtype="r8"/>\n<FIELD attrname="LOTE" fieldtype="string" WIDTH="16"/>\n<FIELD attrname="PEDIMENTO" fieldtype="string" WIDTH="16"/>\n<FIELD attrname="FECHCADUC" fieldtype="dateTime"/>\n<FIELD attrname="FECHADUANA" fieldtype="dateTime"/>\n<FIELD attrname="CVE_PRODSERV" fieldtype="string" WIDTH="9"/>\n<FIELD attrname="CVE_UNIDAD" fieldtype="string" WIDTH="4"/>\n</FIELDS>\n<PARAMS/>\n</FIELD>\n</FIELDS>\n<PARAMS/>\n</METADATA>\n<ROWDATA>\n`;
                
                xml += `<ROW CVE_CLPV="${proveedor}" NUM_ALMA="${almacenHeader}" ESQUEMA="${CONSTANTES.ESQUEMA}" DES_TOT="0" DES_FIN="0" CVE_VEND="" COM_TOT="0" NUM_MONED="${CONSTANTES.NUM_MONED}" TIPCAMB="1" STR_OBS="" ENTREGA="" SU_REFER="" TOT_IND="0" MODULO="COMP" CONDICION="CONTADO">\n`;
                xml += `<dtfield>\n`;
                
                partidasAlmacen.forEach(p => {
                    xml += `<ROWdtfield CANT="${p.cantidad}" CVE_ART="${p.claveProveedor}" DESC1="0" DESC2="0" DESC3="0" IMPU1="0" IMPU2="0" IMPU3="0" IMPU4="16" PREC="0" NUM_ALM="${p.almacen}" STR_OBS="" REG_GPOPROD="0" REG_KITPROD="0" NUM_REG="0" COSTO="0" TIPO_PROD="P" TIPO_ELEM="N" MINDIRECTO="0" TIP_CAM="1" FACT_CONV="1" UNI_VENTA="PZ" IMP1APLA="6" IMP2APLA="6" IMP3APLA="6" IMP4APLA="0" PREC_SINREDO="0" COST_SINREDO="0" LOTE="" PEDIMENTO="" FECHCADUC="" FECHADUANA="" CVE_PRODSERV="" CVE_UNIDAD=""/>\n`;
                });
                
                xml += `</dtfield>\n</ROW>\n</ROWDATA>\n</DATAPACKET>`;
                
                const blob = new Blob([xml], { type: "text/xml" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                // Si hay un solo archivo, nombre simple. Si hay varios, incluir almacén
                if (numAlmacenes === 1) {
                    a.download = `OC_INICIAL_${proveedor}.mod`;
                } else {
                    a.download = `OC_INICIAL_${proveedor}_ALM${almacenHeader}.mod`;
                }
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                console.error(`Error al generar archivo para almacén ${almacenHeader}:`, error);
            }
        });
        
        if (numAlmacenes > 1) {
            show_alerta(`Se generaron ${numAlmacenes} archivos .MOD (uno por almacén)`, "success");
        } else {
            show_alerta("Archivo .MOD generado", "success");
        }
    };

    const totalCantidad = calcularTotales();

    // Si no hay partidas procesadas, mostrar formulario de carga
    if (!mostrarPreview) {
        return (
            <div className="factura-reutilizable">
                <div className="header-factura" style={{ justifyContent: 'space-between' }}>
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-outline-secondary btn-volver" onClick={onVolver}>
                            <BiArrowBack /> Volver
                        </button>
                        <h5 className="mb-0">Generar OC Inicial</h5>
                    </div>
                </div>
                
                <div className="upload-section">
                    {loading ? (
                        <div className="py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-2">Procesando datos...</p>
                        </div>
                    ) : (
                        <>
                            <BiSpreadsheet size={50} color="#198754" />
                            <h4>Importar desde Excel</h4>
                            <p>Seleccione el proveedor y pegue los datos desde Excel</p>
                            
                            <div className="w-100" style={{ maxWidth: "500px", margin: "20px auto" }}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Proveedor</label>
                                    <select 
                                        className="form-select" 
                                        value={proveedor || ""} 
                                        onChange={(e) => setProveedor(e.target.value)}
                                    >
                                        <option value="">Seleccione proveedor...</option>
                                        <option value="3">3 - La Capital</option>
                                        <option value="35">35 - Sellos y Retenes</option>
                                    </select>
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Datos de Excel</label>
                                    <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                                        Copie las siguientes columnas de Excel:<br />
                                        <code>Almacén | Clave | Descripción | Línea | Familia | Cantidad</code>
                                    </p>
                                    <textarea
                                        className="form-control"
                                        rows={10}
                                        placeholder="Pegue aquí los datos desde Excel..."
                                        style={{ fontFamily: "monospace", fontSize: "0.9rem" }}
                                        value={datosExcel}
                                        onChange={(e) => setDatosExcel(e.target.value)}
                                    />
                                </div>
                                
                                <button 
                                    className="btn btn-success w-100" 
                                    onClick={procesarExcel}
                                    disabled={loading || !proveedor || !datosExcel.trim()}
                                >
                                    Procesar Datos
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Si hay partidas, mostrar tabla de previsualización
    return (
        <div className="factura-reutilizable">
            <div className="header-factura">
                <div className="header-item">
                    <strong>Proveedor</strong>
                    <span>{proveedor === "3" ? "La Capital" : "Sellos y Retenes"}</span>
                </div>
                <div className="header-item" style={{ border: 'none' }}>
                    <strong>Total Partidas</strong>
                    <span>{partidas.length}</span>
                </div>
                <button className="btn btn-outline-danger btn-cancelar-top" onClick={reset}>
                    <BiXCircle /> Cancelar
                </button>
            </div>

            <div className="tabla-factura-container">
                <table className="tabla-factura">
                    <thead>
                        <tr>
                            <th style={{ width: "8%" }}>Almacén</th>
                            <th style={{ width: "20%" }}>Clave</th>
                            <th style={{ width: "30%" }}>Descripción</th>
                            <th style={{ width: "12%" }}>Línea</th>
                            <th style={{ width: "10%" }}>Familia</th>
                            <th style={{ width: "8%" }}>Cant.</th>
                            <th style={{ width: "5%" }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {partidas.map((item) => (
                            <tr key={item.id}>
                                <td>{item.almacen}</td>
                                <td>{item.claveProveedor}</td>
                                <td>{item.descripcion}</td>
                                <td>{item.lineaProd}</td>
                                <td>{item.familia}</td>
                                <td>{item.cantidad}</td>
                                <td>
                                    <BiTrash 
                                        style={{ cursor: 'pointer', color: '#dc3545' }} 
                                        onClick={() => eliminarPartida(item.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="footer-acciones">
                <div className="msg-validacion">
                    <div className="status-label status-ok">
                        <span>✓ Listo para exportar</span>
                    </div>
                </div>
                
                <div className="resumen-horizontal">
                    <div className="resumen-item">
                        <label>Total Unidades</label>
                        <span>{totalCantidad}</span>
                    </div>
                    <div className="resumen-item">
                        <label>Total Partidas</label>
                        <span>{partidas.length}</span>
                    </div>
                    <button className="btn btn-primary btn-finalizar-main" onClick={generarMOD}>
                        <BiCheckDouble size={20} /> Generar .MOD
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrdenCompraInicial;