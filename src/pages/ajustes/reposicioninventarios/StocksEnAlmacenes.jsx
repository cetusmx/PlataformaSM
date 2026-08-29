import React, { useState, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import Axios from "axios";
import { show_alerta } from "../../../functions";
import StocksTabla from "./StocksTabla";

// Columnas requeridas en el orden esperado. El chequeo es insensible a
// mayúsculas/minúsculas para tolerar variaciones en el encabezado del Excel.
const CANONICAL = ["almacen", "clave", "max", "min", "rotacion"];
// Mapeo de encabezados (en minúsculas) a clave canónica. Incluye variantes
// con tilde para tolerar "Almacén", "Rotación", etc.
const HEADER_MAP = {
  almacen: "almacen",
  "almacén": "almacen",
  clave: "clave",
  max: "max",
  min: "min",
  rotacion: "rotacion",
  "rotación": "rotacion",
};

// Contrato del endpoint (API2). El backend debe adaptarse a este formato:
// POST {REACT_APP_URL_API2}/api/v1/stocks-almacenes
// body: { reemplazar: boolean, registros: [ { almacen, clave, max, min, rotacion }, ... ] }
//   reemplazar = true  -> el backend BORRA los datos existentes y guarda los nuevos
//   reemplazar = false -> el backend CONSERVA y actualiza solo los registros que cambiaron
const URL_API2 = `${process.env.REACT_APP_URL_API2}/api/v1`;

const StocksEnAlmacenes = () => {
  const [file, setFile] = useState(null);
  const [dataExcel, setDataExcel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [reemplazar, setReemplazar] = useState(false);
  const [busquedaClave, setBusquedaClave] = useState("");
  const [filtroAlmacen, setFiltroAlmacen] = useState("");
  const [filtroRotacion, setFiltroRotacion] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const onDrop = (acceptedFiles) => {
    setMensaje("");
    setBusquedaClave("");
    setFiltroAlmacen("");
    setFiltroRotacion("");
    if (acceptedFiles.length === 0) {
      setMensaje("Por favor, selecciona un archivo .xls o .xlsx válido.");
      return;
    }
    const uploadedFile = acceptedFiles[0];
    if (
      !uploadedFile.name.endsWith(".xls") &&
      !uploadedFile.name.endsWith(".xlsx")
    ) {
      setMensaje("Solo se permiten archivos con extensión .xls o .xlsx.");
      return;
    }

    setFile(uploadedFile);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = new Uint8Array(e.target.result);
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length < 2) {
          setMensaje("El archivo Excel está vacío o solo contiene encabezados.");
          setFile(null);
          setDataExcel([]);
          setLoading(false);
          return;
        }

        const headers = json[0].map((h) => String(h).trim());
        const headersLower = headers.map((h) => h.toLowerCase());
        // Mapea cada encabezado a su clave canónica (tolera tildes y mayúsculas)
        const headerToCanon = headersLower.map((h) => HEADER_MAP[h] || h);
        const canonSet = new Set(
          headerToCanon.filter((c) => CANONICAL.includes(c))
        );
        const missing = CANONICAL.filter((c) => !canonSet.has(c));
        if (missing.length > 0) {
          setMensaje(
            `Faltan las siguientes columnas requeridas: ${missing.join(", ")}`
          );
          setFile(null);
          setDataExcel([]);
          setLoading(false);
          return;
        }

        const parsed = json.slice(1).map((row) => {
          const obj = {};
          CANONICAL.forEach((c) => {
            obj[c] = "";
          });
          headerToCanon.forEach((canon, idx) => {
            if (CANONICAL.includes(canon)) {
              obj[canon] = row[idx] ?? "";
            }
          });
          return obj;
        });

        setDataExcel(parsed);
      } catch (err) {
        console.error("Error al leer el archivo:", err);
        setMensaje("Ocurrió un error al procesar el archivo.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const limpiar = () => {
    setFile(null);
    setDataExcel([]);
    setMensaje("");
    setBusquedaClave("");
    setFiltroAlmacen("");
    setFiltroRotacion("");
  };

  const construirRegistros = () =>
    dataExcel.map((r) => ({
      almacen: String(r.almacen ?? "").trim(),
      clave: String(r.clave ?? "").trim(),
      // El backend espera max/min/rotacion como strings
      max: String(r.max ?? "").trim(),
      min: String(r.min ?? "").trim(),
      rotacion: String(r.rotacion ?? "").trim(),
    }));

  const registrosFiltrados = useMemo(() => {
    const bClave = busquedaClave.trim().toLowerCase();
    const fAlm = filtroAlmacen.trim().toLowerCase();
    const fRot = filtroRotacion.trim().toLowerCase();
    return dataExcel.filter((r) => {
      const okClave =
        bClave === "" || String(r.clave ?? "").toLowerCase().includes(bClave);
      const okAlm =
        fAlm === "" || String(r.almacen ?? "").toLowerCase().includes(fAlm);
      const okRot =
        fRot === "" || String(r.rotacion ?? "").toLowerCase().includes(fRot);
      return okClave && okAlm && okRot;
    });
  }, [dataExcel, busquedaClave, filtroAlmacen, filtroRotacion]);

  const opcionesAlmacen = useMemo(() => {
    const set = new Set(
      dataExcel.map((r) => String(r.almacen ?? "").trim()).filter(Boolean)
    );
    return Array.from(set).sort();
  }, [dataExcel]);

  const opcionesRotacion = useMemo(() => {
    const set = new Set(
      dataExcel.map((r) => String(r.rotacion ?? "").trim()).filter(Boolean)
    );
    return Array.from(set).sort();
  }, [dataExcel]);

  const guardar = () => {
    if (dataExcel.length === 0) return;
    if (reemplazar) {
      setShowConfirmModal(true);
      return;
    }
    ejecutarGuardado();
  };

  const ejecutarGuardado = async () => {
    setShowConfirmModal(false);
    setGuardando(true);
    try {
      const payload = { reemplazar, registros: construirRegistros() };
      const res = await Axios.post(`${URL_API2}/stocks-almacenes`, payload);
      const msg =
        res.data?.message ||
        `Se guardaron ${payload.registros.length} registros correctamente.`;
      await show_alerta(msg, "success");
      limpiar();
    } catch (err) {
      console.error("Error al guardar stocks:", err);
      const msg =
        err.response?.data?.message ||
        "Ocurrió un error al guardar los datos en el servidor.";
      show_alerta(msg, "error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="ri-stocks">
      {dataExcel.length === 0 && (
        <>
          <h4 className="ri-stocks-titulo">Stocks en Almacenes</h4>
          <p className="ri-stocks-descripcion">
            Cargue un archivo de Excel con la información de máximos, mínimos,
            rotación y existencias de los productos en cada almacén de la empresa.
          </p>
        </>
      )}

      {dataExcel.length === 0 && (
        <div className="ri-instrucciones">
          <h6>Columnas requeridas (en este orden, con encabezados):</h6>
          <ol className="ri-instrucciones-lista">
            <li><code>almacen</code> — identificador del almacén</li>
            <li><code>clave</code> — clave del producto</li>
            <li><code>max</code> — existencia máxima</li>
            <li><code>min</code> — existencia mínima</li>
            <li><code>rotacion</code> — rotación del producto</li>
          </ol>
          <p className="ri-instrucciones-nota">
            <strong>Importante:</strong> la primera fila del archivo debe contener
            los encabezados con los nombres exactos (no distingue mayúsculas/
            minúsculas).
          </p>
        </div>
      )}

      {dataExcel.length === 0 && (
        <div
          {...getRootProps()}
          className={`ri-dropzone ${isDragActive ? "active" : ""}`}
        >
          <input {...getInputProps()} />
          <i className="bi bi-cloud-upload ri-dropzone-icon"></i>
          <p>
            Arrastre aquí su archivo Excel o haga clic para seleccionarlo
          </p>
          <small>Formatos permitidos: .xls, .xlsx</small>
        </div>
      )}

      {loading && <p className="ri-cargando">Procesando archivo...</p>}
      {mensaje && <div className="ri-mensaje">{mensaje}</div>}

      {dataExcel.length > 0 && (
        <div className="ri-preview">
          <div className="ri-opciones-guardado">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="switchReemplazar"
                checked={reemplazar}
                onChange={(e) => setReemplazar(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="switchReemplazar">
                Borrar todos los datos existentes antes de guardar
              </label>
            </div>
            {(busquedaClave || filtroAlmacen || filtroRotacion) && (
              <button
                className="ri-btn ri-btn-ghost ri-btn-sm"
                onClick={() => {
                  setBusquedaClave("");
                  setFiltroAlmacen("");
                  setFiltroRotacion("");
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
          <div className="ri-preview-header">
            <h5>
              Vista previa de {file?.name} ({registrosFiltrados.length} registros)
            </h5>
            <div className="ri-preview-acciones">
              <button
                className="ri-btn ri-btn-ghost"
                onClick={limpiar}
                disabled={guardando}
              >
                Quitar archivo
              </button>
              <button
                className="ri-btn ri-btn-primary"
                onClick={guardar}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar en base de datos"}
              </button>
            </div>
          </div>
          <StocksTabla
            datos={registrosFiltrados}
            opcionesAlmacen={opcionesAlmacen}
            opcionesRotacion={opcionesRotacion}
            busquedaClave={busquedaClave}
            setBusquedaClave={setBusquedaClave}
            filtroAlmacen={filtroAlmacen}
            setFiltroAlmacen={setFiltroAlmacen}
            filtroRotacion={filtroRotacion}
            setFiltroRotacion={setFiltroRotacion}
          />
        </div>
      )}

      {showConfirmModal && (
        <div className="ri-modal-overlay">
          <div className="ri-modal">
            <h5 className="ri-modal-title">Confirmar acción</h5>
            <p className="ri-modal-text">
              Va a BORRAR todos los datos existentes antes de guardar los nuevos.
              ¿Desea continuar?
            </p>
            <div className="ri-modal-acciones">
              <button
                className="ri-btn ri-btn-ghost"
                onClick={() => setShowConfirmModal(false)}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                className="ri-btn ri-btn-primary"
                onClick={ejecutarGuardado}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Confirmar y guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StocksEnAlmacenes;
