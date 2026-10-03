import React, { useState, useEffect, useRef } from "react";
import "../styles/facturaReutilizable.css";
import { BiXCircle, BiFile, BiCheckDouble, BiArrowBack, BiTrash, BiUpload } from "react-icons/bi";
import { show_alerta } from "../functions";
import * as XLSX from "xlsx";

const GeneradorPedidos = () => {
    const [cliente, setCliente] = useState("");
    const [partidas, setPartidas] = useState([]);
    const [mostrarPreview, setMostrarPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState("");
    const isFirstRender = useRef(true);
    const fileInputRef = useRef(null);

    const storageKey = "pedidos_ventas_progress";

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.partidas && parsed.partidas.length > 0) {
                    setCliente(parsed.cliente || "");
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
            cliente: cliente,
            partidas: partidas,
            fileName: fileName
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }, [cliente, partidas, fileName]);

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
                // raw: true para mantener los tipos originales, header: 1 para obtener arrays en vez de objetos
                const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

                const items = [];
                // Se asume que la fila 0 puede ser encabezados, la saltamos si no parece un dato vlido
                // Iteramos buscando datos
                let startIndex = 0;
                
                // Si la primera fila contiene letras en la cantidad, asumimos que es encabezado
                if (data.length > 0 && isNaN(parseFloat(data[0][2]))) {
                    startIndex = 1;
                }

                for (let i = startIndex; i < data.length; i++) {
                    const row = data[i];
                    if (row.length >= 2) {
                        const clave = String(row[0] || "").trim();
                        const almacen = String(row[1] || "1").trim();
                        const cantidad = parseFloat(row[2]) || 0;

                        if (clave && cantidad > 0) {
                            items.push({
                                id: i,
                                claveArticulo: clave,
                                almacen: almacen,
                                cantidad: cantidad
                            });
                        }
                    }
                }

                if (items.length === 0) {
                    show_alerta("No se detectaron datos vlidos. Revise que tenga columnas: Clave | Almacn | Cantidad.", "error");
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
        if (!cliente.trim()) {
            show_alerta("Ingrese un nmero de cliente vlido antes de cargar el archivo", "warning");
            return;
        }
        fileInputRef.current.click();
    };

    const reset = () => {
        localStorage.removeItem(storageKey);
        setCliente("");
        setPartidas([]);
        setFileName("");
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
        const chunkSize = 300;
        const chunks = [];
        
        for (let i = 0; i < partidas.length; i += chunkSize) {
            chunks.push(partidas.slice(i, i + chunkSize));
        }

        chunks.forEach((chunk, index) => {
            try {
                // Tomamos el almacén del primer artículo de este chunk para la cabecera principal del documento
                const almacenHeader = chunk[0].almacen;
                
                let xml = `<?xml version="1.0" standalone="yes"?>\n<DATAPACKET Version="2.0">\n<METADATA>\n<FIELDS>\n`;
                xml += `<FIELD attrname="CVE_CLPV" fieldtype="string" WIDTH="10"/>\n<FIELD attrname="NUM_ALMA" fieldtype="i4"/>\n<FIELD attrname="CVE_PEDI" fieldtype="string" WIDTH="20"/>\n<FIELD attrname="ESQUEMA" fieldtype="i4"/>\n<FIELD attrname="DES_TOT" fieldtype="r8"/>\n<FIELD attrname="DES_FIN" fieldtype="r8"/>\n<FIELD attrname="CVE_VEND" fieldtype="string" WIDTH="5"/>\n<FIELD attrname="COM_TOT" fieldtype="r8"/>\n<FIELD attrname="NUM_MONED" fieldtype="i4"/>\n<FIELD attrname="TIPCAMB" fieldtype="r8"/>\n<FIELD attrname="STR_OBS" fieldtype="string" WIDTH="255"/>\n<FIELD attrname="ENTREGA" fieldtype="string" WIDTH="25"/>\n<FIELD attrname="SU_REFER" fieldtype="string" WIDTH="20"/>\n<FIELD attrname="TOT_IND" fieldtype="r8"/>\n<FIELD attrname="MODULO" fieldtype="string" WIDTH="4"/>\n<FIELD attrname="CONDICION" fieldtype="string" WIDTH="25"/>\n`;
                xml += `<FIELD attrname="dtfield" fieldtype="nested">\n<FIELDS>\n<FIELD attrname="CANT" fieldtype="r8"/>\n<FIELD attrname="CVE_ART" fieldtype="string" WIDTH="20"/>\n<FIELD attrname="DESC1" fieldtype="r8"/>\n<FIELD attrname="DESC2" fieldtype="r8"/>\n<FIELD attrname="DESC3" fieldtype="r8"/>\n<FIELD attrname="IMPU1" fieldtype="r8"/>\n<FIELD attrname="IMPU2" fieldtype="r8"/>\n<FIELD attrname="IMPU3" fieldtype="r8"/>\n<FIELD attrname="IMPU4" fieldtype="r8"/>\n<FIELD attrname="COMI" fieldtype="r8"/>\n<FIELD attrname="PREC" fieldtype="r8"/>\n<FIELD attrname="NUM_ALM" fieldtype="i4"/>\n<FIELD attrname="STR_OBS" fieldtype="string" WIDTH="255"/>\n<FIELD attrname="REG_GPOPROD" fieldtype="i4"/>\n<FIELD attrname="REG_KITPROD" fieldtype="i4"/>\n<FIELD attrname="NUM_REG" fieldtype="i4"/>\n<FIELD attrname="COSTO" fieldtype="r8"/>\n<FIELD attrname="TIPO_PROD" fieldtype="string" WIDTH="1"/>\n<FIELD attrname="TIPO_ELEM" fieldtype="string" WIDTH="1"/>\n<FIELD attrname="MINDIRECTO" fieldtype="r8"/>\n<FIELD attrname="TIP_CAM" fieldtype="r8"/>\n<FIELD attrname="FACT_CONV" fieldtype="r8"/>\n<FIELD attrname="UNI_VENTA" fieldtype="string" WIDTH="10"/>\n<FIELD attrname="IMP1APLA" fieldtype="i4"/>\n<FIELD attrname="IMP2APLA" fieldtype="i4"/>\n<FIELD attrname="IMP3APLA" fieldtype="i4"/>\n<FIELD attrname="IMP4APLA" fieldtype="i4"/>\n<FIELD attrname="PREC_SINREDO" fieldtype="r8"/>\n<FIELD attrname="COST_SINREDO" fieldtype="r8"/>\n<FIELD attrname="LOTE" fieldtype="string" WIDTH="16"/>\n<FIELD attrname="PEDIMENTO" fieldtype="string" WIDTH="16"/>\n<FIELD attrname="FECHCADUC" fieldtype="dateTime"/>\n<FIELD attrname="FECHADUANA" fieldtype="dateTime"/>\n<FIELD attrname="CVE_PRODSERV" fieldtype="string" WIDTH="9"/>\n<FIELD attrname="CVE_UNIDAD" fieldtype="string" WIDTH="4"/>\n<FIELD attrname="IMPU5" fieldtype="r8"/>\n<FIELD attrname="IMPU6" fieldtype="r8"/>\n<FIELD attrname="IMPU7" fieldtype="r8"/>\n<FIELD attrname="IMPU8" fieldtype="r8"/>\n<FIELD attrname="IMP5APLA" fieldtype="i4"/>\n<FIELD attrname="IMP6APLA" fieldtype="i4"/>\n<FIELD attrname="IMP7APLA" fieldtype="i4"/>\n<FIELD attrname="IMP8APLA" fieldtype="i4"/>\n</FIELDS>\n<PARAMS/>\n</FIELD>\n</FIELDS>\n<PARAMS/>\n</METADATA>\n<ROWDATA>\n`;
                
                const cveClienteFormateada = cliente.padStart(10, ' ');
                
                xml += `<ROW CVE_CLPV="${cveClienteFormateada}" NUM_ALMA="${almacenHeader}" CVE_PEDI="" ESQUEMA="0" DES_TOT="0" DES_FIN="0" CVE_VEND="" COM_TOT="0" NUM_MONED="1" TIPCAMB="1" STR_OBS="" MODULO="FACT" CONDICION="">\n`;
                xml += `<dtfield>\n`;
                
                chunk.forEach(p => {
                    xml += `<ROWdtfield CANT="${p.cantidad}" CVE_ART="${p.claveArticulo}" DESC1="0" DESC2="0" DESC3="0" IMPU1="0" IMPU2="0" IMPU3="0" IMPU4="16" COMI="0" PREC="0" NUM_ALM="${p.almacen}" STR_OBS="" REG_GPOPROD="0" COSTO="0" TIPO_PROD="P" TIPO_ELEM="N" TIP_CAM="1" UNI_VENTA="PZ" IMP1APLA="6" IMP2APLA="6" IMP3APLA="6" IMP4APLA="0" PREC_SINREDO="0" COST_SINREDO="0" IMPU5="0" IMPU6="0" IMPU7="0" IMPU8="0" IMP5APLA="6" IMP6APLA="6" IMP7APLA="6" IMP8APLA="6"/>\n`;
                });
                
                xml += `</dtfield>\n</ROW>\n</ROWDATA>\n</DATAPACKET>`;
                
                const blob = new Blob([xml], { type: "text/xml" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                
                const suffix = chunks.length > 1 ? `_${index + 1}` : "";
                a.download = `PEDIDO_${cliente.trim()}${suffix}.mod`;
                
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                console.error(`Error al generar archivo chunk ${index}:`, error);
            }
        });
        
        if (chunks.length > 1) {
            show_alerta(`Se generaron ${chunks.length} archivos .MOD (máximo 300 registros por archivo)`, "success");
        } else {
            show_alerta("Archivo de pedido generado correctamente", "success");
        }
    };

    if (!mostrarPreview) {
        return (
            <div className="factura-reutilizable">
                <div className="upload-section">
                    {loading ? (
                        <div className="py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-2">Procesando archivo...</p>
                        </div>
                    ) : (
                        <>
                            <BiFile size={50} color="#0d6efd" />
                            <h4>Cargar Pedido desde Excel</h4>
                            <p>Ingrese el número de cliente y suba su archivo de Excel</p>
                            
                            <div className="w-100" style={{ maxWidth: "500px", margin: "20px auto" }}>
                                <div className="mb-4 text-start">
                                    <label className="form-label fw-bold">Número de Cliente</label>
                                    <input 
                                        type="text"
                                        className="form-control form-control-lg"
                                        placeholder="Ej. 4239"
                                        value={cliente}
                                        onChange={(e) => setCliente(e.target.value)}
                                        style={{ letterSpacing: '2px', fontWeight: '500' }}
                                    />
                                </div>
                                
                                <div className="mb-3">
                                    <div className="alert alert-light border shadow-sm text-start">
                                        <p className="mb-2" style={{ fontSize: "0.9rem" }}>
                                            <strong>Formato requerido:</strong> El archivo debe tener 3 columnas en la primera hoja:
                                        </p>
                                        <ul className="mb-0 text-muted" style={{ fontSize: "0.85rem" }}>
                                            <li><strong>Columna A:</strong> Clave del Artículo</li>
                                            <li><strong>Columna B:</strong> Almacén (ej. 1, 6)</li>
                                            <li><strong>Columna C:</strong> Cantidad</li>
                                        </ul>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept=".xlsx, .xls"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                
                                <button 
                                    className="btn btn-primary w-100 py-3 fs-5 shadow-sm d-flex justify-content-center align-items-center gap-2" 
                                    onClick={handleProcesarClick}
                                    disabled={loading || !cliente.trim()}
                                >
                                    <BiUpload size={24} /> Subir Archivo Excel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="factura-reutilizable">
            <div className="header-factura">
                <div className="header-item">
                    <strong>Cliente</strong>
                    <span style={{ color: '#0d6efd', fontSize: '1.2rem', fontWeight: 'bold' }}>{cliente}</span>
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

            <div className="tabla-factura-container shadow-sm border mt-3 rounded">
                <table className="tabla-factura mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th style={{ width: "35%" }}>Clave Artículo</th>
                            <th style={{ width: "25%", textAlign: 'center' }}>Almacén</th>
                            <th style={{ width: "25%", textAlign: 'center' }}>Cantidad</th>
                            <th style={{ width: "15%", textAlign: 'center' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partidas.map((item) => (
                            <tr key={item.id} className="align-middle">
                                <td className="fw-bold">{item.claveArticulo}</td>
                                <td className="text-center">{item.almacen}</td>
                                <td className="text-center"><span className="badge bg-primary fs-6">{item.cantidad}</span></td>
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

            <div className="footer-acciones mt-4">
                <div className="msg-validacion">
                    <div className="status-label status-ok px-3 py-2 rounded shadow-sm">
                        <span>✓ Listo para exportar modelo de Ventas</span>
                    </div>
                </div>
                
                <div className="resumen-horizontal">
                    <div className="resumen-item">
                        <label>Unidades</label>
                        <span className="fs-5">{calcularTotales()}</span>
                    </div>
                    <div className="resumen-item">
                        <label>Partidas</label>
                        <span className="fs-5">{partidas.length}</span>
                    </div>
                    <button className="btn btn-primary btn-finalizar-main px-4 py-2 fs-5 shadow" onClick={generarMOD}>
                        <BiCheckDouble size={24} className="me-2" /> Descargar Modelo (.MOD)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeneradorPedidos;

