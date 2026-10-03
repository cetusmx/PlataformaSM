import React, { useState, useEffect, useRef } from "react";
import "../styles/facturaReutilizable.css";
import { BiXCircle, BiCheckDouble, BiArrowBack, BiTrash, BiFile, BiUpload } from "react-icons/bi";
import { show_alerta } from "../functions";
import * as XLSX from "xlsx";

const OrdenCompraInicial = ({ onVolver }) => {
    const [proveedor, setProveedor] = useState("");
    const [partidas, setPartidas] = useState([]);
    const [mostrarPreview, setMostrarPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState("");
    const [filtroClave, setFiltroClave] = useState("");
    
    const isFirstRender = useRef(true);
    const fileInputRef = useRef(null);

    const storageKey = "reposiciones_inicial_progress";

    const CONSTANTES = {
        ESQUEMA: 1,
        NUM_MONED: 1
    };

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.partidas && parsed.partidas.length > 0) {
                    setProveedor(parsed.proveedor || "");
                    setPartidas(parsed.partidas || []);
                    setFileName(parsed.fileName || "Archivo recuperado");
                    setMostrarPreview(true);
                }
            } catch (e) {
                console.error("Error al cargar progreso:", e);
            }
        }
        isFirstRender.current = false;
    }, []);

    useEffect(() => {
        if (isFirstRender.current) return;
        const dataToSave = {
            proveedor: proveedor,
            partidas: partidas,
            fileName: fileName
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }, [proveedor, partidas, fileName]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        setLoading(true);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                
                const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

                const items = [];
                let startIndex = 0;
                
                // Asume encabezado si la cantidad (col 5) no es número
                if (data.length > 0 && isNaN(parseFloat(data[0][5]))) {
                    startIndex = 1;
                }

                for (let i = startIndex; i < data.length; i++) {
                    const row = data[i];
                    if (row.length >= 2) {
                        const almacen = String(row[0] || "1").trim();
                        const clave = String(row[1] || "").trim();
                        const descripcion = String(row[2] || "").trim();
                        const lineaProd = String(row[3] || "").trim();
                        const familia = String(row[4] || "").trim();
                        const cantidad = parseFloat(row[5]) || 0;
                        const costo = parseFloat(row[6]) || 0;

                        if (clave && cantidad > 0) {
                            items.push({
                                id: i,
                                claveProveedor: clave,
                                almacen,
                                descripcion,
                                lineaProd,
                                familia,
                                cantidad,
                                costo
                            });
                        }
                    }
                }

                if (items.length === 0) {
                    show_alerta("No se detectaron datos válidos. Revise que el archivo tenga las 6 columnas correctas.", "error");
                    setLoading(false);
                    return;
                }

                setPartidas(items);
                setMostrarPreview(true);
            } catch (error) {
                console.error(error);
                show_alerta("Error al leer el archivo Excel", "error");
            } finally {
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleProcesarClick = () => {
        if (!proveedor) {
            show_alerta("Seleccione un proveedor antes de cargar el archivo", "warning");
            return;
        }
        fileInputRef.current.click();
    };

    const reset = () => {
        localStorage.removeItem(storageKey);
        setProveedor("");
        setPartidas([]);
        setFileName("");
        setFiltroClave("");
        setMostrarPreview(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const eliminarPartida = (id) => {
        setPartidas(prev => prev.filter(p => p.id !== id));
    };

    const calcularTotales = () => {
        return partidas.reduce((acc, item) => acc + item.cantidad, 0);
    };

    const generarMOD = () => {
        const partidasPorAlmacen = {};
        partidas.forEach(p => {
            const alm = p.almacen;
            if (!partidasPorAlmacen[alm]) {
                partidasPorAlmacen[alm] = [];
            }
            partidasPorAlmacen[alm].push(p);
        });

        const numAlmacenes = Object.keys(partidasPorAlmacen).length;
        
        Object.keys(partidasPorAlmacen).forEach((almacenHeader) => {
            const partidasAlmacen = partidasPorAlmacen[almacenHeader];
            
            try {
                let xml = `<?xml version="1.0" standalone="yes"?>\n<DATAPACKET Version="2.0">\n<METADATA>\n<FIELDS>\n`;
                xml += `<FIELD attrname="CVE_CLPV" fieldtype="string" WIDTH="10"/>\n<FIELD attrname="NUM_ALMA" fieldtype="i4"/>\n<FIELD attrname="CVE_PEDI" fieldtype="string" WIDTH="20"/>\n<FIELD attrname="ESQUEMA" fieldtype="i4"/>\n<FIELD attrname="DES_TOT" fieldtype="r8"/>\n<FIELD attrname="DES_FIN" fieldtype="r8"/>\n<FIELD attrname="CVE_VEND" fieldtype="string" WIDTH="5"/>\n<FIELD attrname="COM_TOT" fieldtype="r8"/>\n<FIELD attrname="NUM_MONED" fieldtype="i4"/>\n<FIELD attrname="TIPCAMB" fieldtype="r8"/>\n<FIELD attrname="STR_OBS" fieldtype="string" WIDTH="255"/>\n<FIELD attrname="ENTREGA" fieldtype="string" WIDTH="25"/>\n<FIELD attrname="SU_REFER" fieldtype="string" WIDTH="20"/>\n<FIELD attrname="TOT_IND" fieldtype="r8"/>\n<FIELD attrname="MODULO" fieldtype="string" WIDTH="4"/>\n<FIELD attrname="CONDICION" fieldtype="string" WIDTH="25"/>\n`;
                xml += `<FIELD attrname="dtfield" fieldtype="nested">\n<FIELDS>\n<FIELD attrname="CANT" fieldtype="r8"/>\n<FIELD attrname="CVE_ART" fieldtype="string" WIDTH="20"/>\n<FIELD attrname="DESC1" fieldtype="r8"/>\n<FIELD attrname="DESC2" fieldtype="r8"/>\n<FIELD attrname="DESC3" fieldtype="r8"/>\n<FIELD attrname="IMPU1" fieldtype="r8"/>\n<FIELD attrname="IMPU2" fieldtype="r8"/>\n<FIELD attrname="IMPU3" fieldtype="r8"/>\n<FIELD attrname="IMPU4" fieldtype="r8"/>\n<FIELD attrname="COMI" fieldtype="r8"/>\n<FIELD attrname="PREC" fieldtype="r8"/>\n<FIELD attrname="NUM_ALM" fieldtype="i4"/>\n<FIELD attrname="STR_OBS" fieldtype="string" WIDTH="255"/>\n<FIELD attrname="REG_GPOPROD" fieldtype="i4"/>\n<FIELD attrname="REG_KITPROD" fieldtype="i4"/>\n<FIELD attrname="NUM_REG" fieldtype="i4"/>\n<FIELD attrname="COSTO" fieldtype="r8"/>\n<FIELD attrname="TIPO_PROD" fieldtype="string" WIDTH="1"/>\n<FIELD attrname="TIPO_ELEM" fieldtype="string" WIDTH="1"/>\n<FIELD attrname="MINDIRECTO" fieldtype="r8"/>\n<FIELD attrname="TIP_CAM" fieldtype="r8"/>\n<FIELD attrname="FACT_CONV" fieldtype="r8"/>\n<FIELD attrname="UNI_VENTA" fieldtype="string" WIDTH="10"/>\n<FIELD attrname="IMP1APLA" fieldtype="i4"/>\n<FIELD attrname="IMP2APLA" fieldtype="i4"/>\n<FIELD attrname="IMP3APLA" fieldtype="i4"/>\n<FIELD attrname="IMP4APLA" fieldtype="i4"/>\n<FIELD attrname="PREC_SINREDO" fieldtype="r8"/>\n<FIELD attrname="COST_SINREDO" fieldtype="r8"/>\n<FIELD attrname="LOTE" fieldtype="string" WIDTH="16"/>\n<FIELD attrname="PEDIMENTO" fieldtype="string" WIDTH="16"/>\n<FIELD attrname="FECHCADUC" fieldtype="dateTime"/>\n<FIELD attrname="FECHADUANA" fieldtype="dateTime"/>\n<FIELD attrname="CVE_PRODSERV" fieldtype="string" WIDTH="9"/>\n<FIELD attrname="CVE_UNIDAD" fieldtype="string" WIDTH="4"/>\n</FIELDS>\n<PARAMS/>\n</FIELD>\n</FIELDS>\n<PARAMS/>\n</METADATA>\n<ROWDATA>\n`;
                
                xml += `<ROW CVE_CLPV="${proveedor}" NUM_ALMA="${almacenHeader}" ESQUEMA="${CONSTANTES.ESQUEMA}" DES_TOT="0" DES_FIN="0" CVE_VEND="" COM_TOT="0" NUM_MONED="${CONSTANTES.NUM_MONED}" TIPCAMB="1" STR_OBS="" ENTREGA="" SU_REFER="" TOT_IND="0" MODULO="COMP" CONDICION="CONTADO">\n`;
                xml += `<dtfield>\n`;
                
                partidasAlmacen.forEach(p => {
                    xml += `<ROWdtfield CANT="${p.cantidad}" CVE_ART="${p.claveProveedor}" DESC1="0" DESC2="0" DESC3="0" IMPU1="0" IMPU2="0" IMPU3="0" IMPU4="16" PREC="0" NUM_ALM="${p.almacen}" STR_OBS="" REG_GPOPROD="0" REG_KITPROD="0" NUM_REG="0" COSTO="${p.costo}" TIPO_PROD="P" TIPO_ELEM="N" MINDIRECTO="0" TIP_CAM="1" FACT_CONV="1" UNI_VENTA="PZ" IMP1APLA="6" IMP2APLA="6" IMP3APLA="6" IMP4APLA="0" PREC_SINREDO="0" COST_SINREDO="${p.costo}" LOTE="" PEDIMENTO="" FECHCADUC="" FECHADUANA="" CVE_PRODSERV="" CVE_UNIDAD=""/>\n`;
                });
                
                xml += `</dtfield>\n</ROW>\n</ROWDATA>\n</DATAPACKET>`;
                
                const blob = new Blob([xml], { type: "text/xml" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
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

    const getProveedorName = (id) => {
        const provs = {
            "3": "La Capital",
            "35": "Sellos y Retenes",
            "57": "ROSA MARIA QUEZADA LARA",
            "46": "ROSA MARIA SALAS HERNANDEZ",
            "8": "ALBERTO RODRIGUEZ SALAS"
        };
        return provs[id] || id;
    };

    if (!mostrarPreview) {
        return (
            <div className="factura-reutilizable mt-0">
                <div className="header-factura" style={{ justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
                    <h5 className="mb-0 py-2">Generar OC Inicial</h5>
                </div>
                
                <div className="upload-section mt-3">
                    {loading ? (
                        <div className="py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-2">Procesando archivo...</p>
                        </div>
                    ) : (
                        <>
                            <BiFile size={50} color="#198754" />
                            <h4>Importar OC desde Excel</h4>
                            <p>Seleccione el proveedor y suba su archivo de Excel</p>
                            
                            <div className="w-100" style={{ maxWidth: "500px", margin: "20px auto" }}>
                                <div className="mb-4 text-start">
                                    <label className="form-label fw-bold">Proveedor</label>
                                    <select 
                                        className="form-select" 
                                        value={proveedor || ""} 
                                        onChange={(e) => setProveedor(e.target.value)}
                                    >
                                        <option value="">Seleccione proveedor...</option>
                                        <option value="3">3 - La Capital</option>
                                        <option value="8">8 - ALBERTO RODRIGUEZ SALAS</option>
                                        <option value="35">35 - Sellos y Retenes</option>
                                        <option value="46">46 - ROSA MARIA SALAS HERNANDEZ</option>
                                        <option value="57">57 - ROSA MARIA QUEZADA LARA</option>
                                    </select>
                                </div>
                                
                                <div className="mb-3">
                                    <input 
                                        type="file" 
                                        accept=".xlsx, .xls"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                    />
                                    <button 
                                        className="btn btn-success w-100 py-3 fs-5 shadow-sm d-flex justify-content-center align-items-center gap-2" 
                                        onClick={handleProcesarClick}
                                        disabled={loading || !proveedor}
                                    >
                                        <BiUpload size={24} /> Subir Archivo Excel
                                    </button>
                                </div>

                                <div className="mb-3">
                                    <div className="alert alert-light border shadow-sm text-center mb-0 py-2">
                                        <p className="mb-0 text-muted" style={{ fontSize: "0.85rem" }}>
                                            <strong>Formato requerido:</strong> Almacén | Clave | Descripción | Línea | Familia | Cantidad | Costo
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const partidasFiltradas = partidas.filter(item => item.claveProveedor.toLowerCase().includes(filtroClave.toLowerCase()));

    return (
        <div className="factura-reutilizable mt-0">
            <div className="header-factura">
                <div className="header-item">
                    <strong>Proveedor</strong>
                    <span>{getProveedorName(proveedor)}</span>
                </div>
                <div className="header-item">
                    <strong>Almacén</strong>
                    <span>
                        {partidas.length > 0 ? Array.from(new Set(partidas.map(p => p.almacen))).join(', ') : '-'}
                    </span>
                </div>
                <div className="header-item">
                    <strong>Archivo</strong>
                    <span>{fileName}</span>
                </div>
                <div className="header-item" style={{ border: 'none' }}>
                    <strong>Total Partidas</strong>
                    <span>{partidas.length}</span>
                </div>
                <button className="btn btn-outline-danger btn-cancelar-top" onClick={reset}>
                    <BiXCircle className="me-1" /> Cancelar
                </button>
            </div>

            <div className="tabla-factura-container shadow-sm border mt-3 rounded" style={{ height: "50vh" }}>
                <table className="tabla-factura mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th style={{ width: "8%", textAlign: 'center' }}>Cant.</th>
                            <th style={{ width: "29%" }}>
                                <div className="d-flex align-items-center">
                                    <span>Clave</span>
                                    <div className="position-relative ms-2">
                                        <input 
                                            type="text" 
                                            className="form-control form-control-sm" 
                                            placeholder="🔍 Buscar..." 
                                            value={filtroClave}
                                            onChange={(e) => setFiltroClave(e.target.value)}
                                            style={{ width: "200px", padding: "2px 25px 2px 10px", fontSize: "0.85rem", borderRadius: "15px", border: "1px solid #ced4da" }}
                                        />
                                        {filtroClave && (
                                            <BiXCircle 
                                                className="position-absolute" 
                                                style={{ right: '6px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#6c757d', fontSize: '1rem' }} 
                                                onClick={() => setFiltroClave('')} 
                                                title="Limpiar búsqueda"
                                            />
                                        )}
                                    </div>
                                </div>
                            </th>
                            <th style={{ width: "34%" }}>Descripción</th>
                            <th style={{ width: "11%" }}>Línea</th>
                            <th style={{ width: "10%", textAlign: 'right' }}>Costo</th>
                            <th style={{ width: "8%", textAlign: 'center' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partidasFiltradas.map((item) => (
                            <tr key={item.id} className="align-middle">
                                <td className="text-center">
                                    <span className="badge bg-success" style={{ fontSize: 'inherit', fontWeight: 'normal' }}>
                                        {item.cantidad}
                                    </span>
                                </td>
                                <td className="fw-bold">{item.claveProveedor}</td>
                                <td>{item.descripcion}</td>
                                <td title={`Familia: ${item.familia}`} style={{ cursor: 'help' }}>
                                    {item.lineaProd}
                                </td>
                                <td className="text-end fw-bold">${item.costo.toFixed(2)}</td>
                                <td className="text-center">
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarPartida(item.id)}>
                                        <BiTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="footer-acciones mt-3 d-flex justify-content-between align-items-center w-100">
                <div className="status-label status-ok px-3 py-2 rounded shadow-sm m-0">
                    <span>✓ Listo para exportar orden de compra</span>
                </div>
                
                <button className="btn btn-success btn-finalizar-main px-4 shadow-sm text-nowrap" onClick={generarMOD}>
                    <BiCheckDouble size={20} className="me-1" /> Generar .MOD
                </button>
            </div>
        </div>
    );
};

export default OrdenCompraInicial;











