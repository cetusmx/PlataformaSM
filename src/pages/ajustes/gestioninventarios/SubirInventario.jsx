// src/components/SubirInventario.js
import React, { useState, useEffect, useCallback } from "react";
import "./SubirInventario.css";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import Axios from "axios";

const SubirInventario = ({ onUploadSuccess }) => {
  // --- Estados para controlar las vistas ---
  const [currentStep, setCurrentStep] = useState(1); // 1 para la primera vista, 2 para la segunda

  // --- Estados del formulario ---
  const [tipoInventario, setTipoInventario] = useState("ciclico");
  const [nombreInventario, setNombreInventario] = useState("");
  const [auditorSeleccionadoDropdown, setAuditorSeleccionadoDropdown] =
    useState("");
  const [auditoresSeleccionados, setAuditoresSeleccionados] = useState([]); // Array para los tags
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState("");
  const [almacenInput, setAlmacenInput] = useState("");
  const [tipoSeleccionGeneral, setTipoSeleccionGeneral] = useState("lineas"); // 'lineas' o 'ubicaciones'
  const [ubicacionesInput, setUbicacionesInput] = useState("");
  const [lineasSeleccionadas, setLineasSeleccionadas] = useState([]);
  const [lineasInput, setLineasInput] = useState("");
  const [sugerenciasLineas, setSugerenciasLineas] = useState([]);

  // --- Estados de datos de API ---
  const [nombresInventariosGeneralesExistentes, setNombresInventariosGeneralesExistentes] = useState([]);
  const [nombresInventariosCiclicosExistentes, setNombresInventariosCiclicosExistentes] = useState([]);
  const [auditores, setAuditores] = useState([]); // Lista completa de auditores
  const [lineasTotales, setLineasTotales] = useState([]);

  // --- Estados de carga y error ---
  const [loadingNombres, setLoadingNombres] = useState(true);
  const [loadingAuditores, setLoadingAuditores] = useState(true); // <-- CORRECCIÓN AQUÍ
  const [loadingLineas, setLoadingLineas] = useState(true);
  const [errorApi, setErrorApi] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Estados para carga de archivo (Inventario Cíclico) ---
  const [file, setFile] = useState(null);
  const [dataExcel, setDataExcel] = useState([]);
  const [previewDataCiclico, setPreviewDataCiclico] = useState(null);
  const [previewDataGeneral, setPreviewDataGeneral] = useState(null);

  // --- Efectos para cargar datos de APIs al inicio ---
  useEffect(() => {
    const fetchData = async () => {
      setErrorApi(null);
      try {
        setLoadingNombres(true);
        const nombresRes = await fetch(
          "http://75.119.150.222:3001/getnombresinv"
        );
        const nombresData = await nombresRes.json();
        
        setNombresInventariosGeneralesExistentes(
          nombresData.map((item) => item.InventarioID)
        );
        setLoadingNombres(false);

        setLoadingAuditores(true);
        const auditoresRes = await fetch(
          "http://75.119.150.222:3001/getauditores"
        );
        const auditoresData = await auditoresRes.json();
        setAuditores(auditoresData);
        setLoadingAuditores(false);

        setLoadingLineas(true);
        const lineasRes = await fetch("http://75.119.150.222:3001/getlineas");
        const lineasData = await lineasRes.json();
        setLineasTotales(lineasData);
        setLoadingLineas(false);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        setErrorApi(
          "No se pudieron cargar algunos datos iniciales (nombres de inventario, auditores o líneas)."
        );
        setLoadingNombres(false);
        setLoadingAuditores(false);
        setLoadingLineas(false);
      }
    };
    fetchData();
  }, []);

  // --- Lógica para sugerir nombre de inventario ---
  useEffect(() => {
    if (!loadingNombres) {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      const prefix = `${month}${year}-`;

      let consecutive = 1;
      let suggestedName = `${prefix}${consecutive}`;

      while (nombresInventarioExistentes.includes(suggestedName)) {
        consecutive++;
        suggestedName = `${prefix}${consecutive}`;
      }
      setNombreInventario(suggestedName);
    }
  }, [loadingNombres, nombresInventarioExistentes]);

  // --- Manejo de la carga de archivos (para Inventario Cíclico) ---
  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      alert("Por favor, selecciona un archivo .xls o .xlsx válido.");
      return;
    }
    const uploadedFile = acceptedFiles[0];
    if (
      !uploadedFile.name.endsWith(".xls") &&
      !uploadedFile.name.endsWith(".xlsx")
    ) {
      alert("Solo se permiten archivos con extensión .xls o .xlsx.");
      return;
    }
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (json.length < 2) {
        alert("El archivo Excel está vacío o solo contiene encabezados.");
        setFile(null);
        setDataExcel([]);
        setPreviewDataCiclico(null);
        return;
      }

      const headers = json[0];
      const requiredHeaders = [
        "Clave",
        "Descripcion",
        "Linea",
        "Existencias",
        "Unidad",
      ];

      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header)
      );
      if (missingHeaders.length > 0) {
        alert(
          `Faltan las siguientes columnas requeridas en el archivo: ${missingHeaders.join(
            ", "
          )}`
        );
        setFile(null);
        setDataExcel([]);
        setPreviewDataCiclico(null);
        return;
      }

      const parsedData = json.slice(1).map((row) => {
        const rowObject = {};
        headers.forEach((header, index) => {
          rowObject[header] = row[index];
        });
        return rowObject;
      });

      setDataExcel(parsedData);
      console.log("Contenido archivo: ", parsedData);

      if (parsedData.length > 0) {
        const firstRow = parsedData[0];
        const uniqueLines = new Set(parsedData.map((item) => item.Linea)).size;
        const totalProducts = parsedData.reduce(
          (sum, item) => sum + (Number(item.Existencias) || 0),
          0
        );

        setPreviewDataCiclico({
          InventarioID: nombreInventario,
          cantidadProductos: totalProducts,
          cantidadLineas: uniqueLines,
          ciudad: sucursalSeleccionada,
          almacen: almacenInput,
          auditores: auditoresSeleccionados.map((auditor) => auditor.Nombre),
        });
      } else {
        setPreviewDataCiclico(null);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Función para cancelar la carga de archivo en inventario cíclico
  const handleCancelFileUpload = () => {
    setFile(null);
    setDataExcel([]);
    setPreviewDataCiclico(null);
  };

  // --- Lógica para el filtro y selección de Líneas (Inventario General) ---
  const handleLineasInputChange = (e) => {
    const value = e.target.value;
    setLineasInput(value);

    if (value.length > 0) {
      const filtered = lineasTotales.filter((linea) =>
        linea.linea.toLowerCase().includes(value.toLowerCase())
      );
      setSugerenciasLineas(filtered);
    } else {
      setSugerenciasLineas([]);
    }
  };

  const handleSelectLinea = (lineaToToggle) => {
    setLineasSeleccionadas((prevSelectedLines) => {
      const isAlreadySelected = prevSelectedLines.some(
        (selected) => selected.linea === lineaToToggle.linea
      );

      if (isAlreadySelected) {
        return prevSelectedLines.filter(
          (selected) => selected.linea !== lineaToToggle.linea
        );
      } else {
        return [...prevSelectedLines, lineaToToggle];
      }
    });
    setLineasInput("");
    setSugerenciasLineas([]);
  };

  // --- Lógica para la selección de Auditor con Dropdown y Tags ---
  const handleAuditorDropdownChange = (e) => {
    const selectedAuditorName = e.target.value;
    setAuditorSeleccionadoDropdown(selectedAuditorName);

    if (selectedAuditorName) {
      const selectedAuditor = auditores.find(
        (auditor) => auditor.Nombre === selectedAuditorName
      );

      if (
        selectedAuditor &&
        !auditoresSeleccionados.some((a) => a.Nombre === selectedAuditor.Nombre)
      ) {
        setAuditoresSeleccionados((prevSelected) => [
          ...prevSelected,
          selectedAuditor,
        ]);
      }
      setAuditorSeleccionadoDropdown("");
    }
  };

  const handleRemoveAuditorTag = (auditorToRemove) => {
    setAuditoresSeleccionados((prevSelected) =>
      prevSelected.filter(
        (auditor) => auditor.Nombre !== auditorToRemove.Nombre
      )
    );
  };

  // --- Actualizar previewDataGeneral cuando cambian los datos relevantes ---
  useEffect(() => {
    if (currentStep === 2 && tipoInventario === "general") {
      const hasRequiredData =
        sucursalSeleccionada &&
        almacenInput &&
        ((tipoSeleccionGeneral === "ubicaciones" && ubicacionesInput) ||
          (tipoSeleccionGeneral === "lineas" &&
            lineasSeleccionadas.length > 0));

      if (hasRequiredData) {
        setPreviewDataGeneral({
          InventarioID: nombreInventario,
          Ciudad: sucursalSeleccionada,
          Almacen: almacenInput,
          Auditores: auditoresSeleccionados.map((auditor) => auditor.Nombre),
          Ubicaciones:
            tipoSeleccionGeneral === "ubicaciones"
              ? ubicacionesInput
              : "No aplica",
          Lineas:
            tipoSeleccionGeneral === "lineas"
              ? lineasSeleccionadas.map((linea) => linea.linea).join(", ")
              : "No aplica",
        });
      } else {
        setPreviewDataGeneral(null);
      }
    }
  }, [
    nombreInventario,
    sucursalSeleccionada,
    almacenInput,
    auditoresSeleccionados,
    tipoInventario,
    tipoSeleccionGeneral,
    ubicacionesInput,
    lineasSeleccionadas,
    currentStep,
  ]);

  // --- Navegación entre vistas ---
  const handleNextStep = () => {
    // Validación para la primera vista antes de avanzar
    if (
      !nombreInventario ||
      auditoresSeleccionados.length === 0 ||
      !sucursalSeleccionada
    ) {
      alert(
        "Por favor, completa el Nombre del Inventario, asigna al menos un Auditor y selecciona una Sucursal antes de continuar."
      );
      return;
    }
    if (nombresInventarioExistentes.includes(nombreInventario)) {
      alert(
        "El nombre de inventario ya existe. Por favor, elige uno diferente o ajusta el consecutivo."
      );
      return;
    }
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  // --- Funciones para guardar inventario ---
  const handleGuardarInventarioGeneral = async () => {
    if (!almacenInput) {
      alert("Por favor, ingresa un Almacén.");
      return;
    }
    if (tipoSeleccionGeneral === "ubicaciones" && !ubicacionesInput) {
      alert("Por favor, ingresa al menos una Ubicación (Pasillo/Zona).");
      return;
    }
    if (tipoSeleccionGeneral === "lineas" && lineasSeleccionadas.length === 0) {
      alert("Por favor, selecciona al menos una Línea de Producto.");
      return;
    }
    // Asegurarse de que al menos un auditor esté seleccionado antes de generar los datos
    if (auditoresSeleccionados.length === 0) {
      alert("Por favor, asigna al menos un Auditor.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Generar un objeto inventarioData para cada auditor seleccionado
      const inventariosPorAuditor = auditoresSeleccionados.map((auditor) => {
        return {
          InventarioID: nombreInventario,
          Fecha: new Date().toISOString(),
          Ciudad: sucursalSeleccionada,
          Almacen: almacenInput,
          Auditor: auditor.Nombre, // Usar la propiedad 'id' del auditor
          TipoSeleccion: tipoSeleccionGeneral,
          Ubicacion:
            tipoSeleccionGeneral === "ubicaciones"
              ? ubicacionesInput
              : "",
          Lineas:
            tipoSeleccionGeneral === "lineas"
              ? lineasSeleccionadas.join(", ")
              : "",
        };
      });

      console.log(
        "Objetos a enviar (Inventario General por Auditor):",
        inventariosPorAuditor
      );

      // --- PENDIENTE: Aquí iría la llamada a la API para Inventario General ---
      if (inventariosPorAuditor.length > 1) {
        await Axios({
          method: "POST",
          url: `http://75.119.150.222:3002/api/v1/inventariosgenerales/`,
          data: inventariosPorAuditor,
        })
          .then((response) => {
            if (response.status === 200) {
              show_alerta("Subido exitósamente", "success");
            } else {
              show_alerta("Hubo un problema", "error");
            }
            setShowSpinner(false);
            console.log(response.data.message);
          })
          .catch(function (error) {
            JSON.parse(JSON.stringify(error));
          });
      }else{
        await Axios({
          method: "POST",
          url: `http://75.119.150.222:3002/api/v1/inventariogeneral/`,
          data: inventariosPorAuditor[0],
        })
          .then((response) => {
            if (response.status === 200) {
              show_alerta("Subido exitósamente", "success");
            } else {
              show_alerta("Hubo un problema", "error");
            }
            setShowSpinner(false);
            console.log(response.data.message);
          })
          .catch(function (error) {
            JSON.parse(JSON.stringify(error));
          });
      }

      alert("Inventarios Generales guardados con éxito");
      onUploadSuccess();
    } catch (error) {
      console.error("Error al guardar Inventario General:", error);
      alert("Hubo un error al guardar el inventario general.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuardarInventarioCiclico = async () => {
    if (!file || dataExcel.length === 0) {
      alert(
        "Por favor, sube y procesa un archivo Excel válido antes de guardar."
      );
      return;
    }
    // Added validation for selected auditors, branch, and warehouse
    if (auditoresSeleccionados.length === 0 || !sucursalSeleccionada || !almacenInput) {
        alert('Por favor, selecciona al menos un auditor, the branch, and the warehouse.');
        return;
    }
    if (nombresInventarioExistentes.includes(nombreInventario)) {
        alert('El nombre de inventario ya existe. Por favor, elige uno diferente o ajusta el consecutivo.');
        return;
    }

    setIsSubmitting(true);
    try {
      // This array will hold all the objects to be sent to the API
      const allDataToSend = [];

      // Iterate over each selected auditor
      for (const auditor of auditoresSeleccionados) {
        const auditorNombre = auditor.Nombre; // Get the auditor's name

        // Map each row from dataExcel to create a new object for this specific auditor
        const dataForThisAuditor = dataExcel.map((row) => ({
          ...row, // Copy all properties from the original row
          InventarioID: nombreInventario, // Same InventarioID for all rows
          Auditor: auditorNombre, // Assign the current auditor to all rows
          Ciudad: sucursalSeleccionada, // Assign the selected city
          Almacen: almacenInput, // Assign the entered warehouse
          Fecha: new Date().toISOString(), // You can add more fields here if needed and not coming from Excel
        }));
        // Add the data for this auditor to the main array.
        // This effectively duplicates the Excel data for each auditor.
        allDataToSend.push(...dataForThisAuditor);
      }

      /* console.log(
        "Final array of objects to send (Cyclic Inventory):",
        allDataToSend
      ); */
      console.log(allDataToSend)
      if (allDataToSend.length > 1) {
        await Axios({
          method: "POST",
          url: `http://75.119.150.222:3002/api/v1/inventario`,
          data: allDataToSend,
        })
          .then((response) => {
            if (response.status === 200) {
              show_alerta("Subido exitósamente", "success");
            } else {
              show_alerta("Hubo un problema", "error");
            }
            setShowSpinner(false);
            console.log(response.data.message);
          })
          .catch(function (error) {
            JSON.parse(JSON.stringify(error));
          });
      }

      alert("Inventario Cíclico guardado con éxito");
      onUploadSuccess();
    } catch (error) {
      console.error("Error al guardar Inventario Cíclico:", error);
      alert("Hubo an error al guardar el inventario cíclico.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizado del componente
  return (
    <div className="subir-inventario-container">
      <h5>Alta de Inventario</h5>

      {errorApi && <div className="error-message">{errorApi}</div>}

      {/* --- Vista 1: Configuración General --- */}
      {currentStep === 1 && (
        <div className="form-view-step">
          <h3>Configuración General</h3>
          <div className="form-group">
            <label className="titulos-label">Tipo de Inventario:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="ciclico"
                  checked={tipoInventario === "ciclico"}
                  onChange={() => {
                    setTipoInventario("ciclico");
                    setPreviewDataGeneral(null);
                  }}
                />
                Inventario Cíclico
              </label>
              <label>
                <input
                  type="radio"
                  value="general"
                  checked={tipoInventario === "general"}
                  onChange={() => {
                    setTipoInventario("general");
                    setPreviewDataCiclico(null);
                    setFile(null);
                    setDataExcel([]);
                  }}
                />
                Inventario General
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="titulos-label" htmlFor="nombreInventario">
              Nombre del Inventario:
            </label>
            <input
              className="titulos-text"
              type="text"
              id="nombreInventario"
              value={nombreInventario}
              onChange={(e) => setNombreInventario(e.target.value)}
              placeholder="Ej: 062025-1"
              readOnly={loadingNombres}
            />
            {loadingNombres && (
              <span className="loading-inline">Cargando sugerencia...</span>
            )}
            {nombresInventarioExistentes.includes(nombreInventario) && (
              <p className="warning-text">
                Este nombre ya existe. Por favor, ajústalo.
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="titulos-label" htmlFor="sucursal">
              Ciudad:
            </label>
            <select
              id="sucursal"
              value={sucursalSeleccionada}
              onChange={(e) => setSucursalSeleccionada(e.target.value)}
            >
              <option value="">-- Seleccione una ciudad --</option>
              <option value="Durango">Durango</option>
              <option value="Fresnillo">Fresnillo</option>
              <option value="Mazatlan">Mazatlán</option>
              <option value="Zacatecas">Zacatecas</option>
            </select>
          </div>

          <div className="form-group">
            <label className="titulos-label" htmlFor="auditorDropdown">
              Auditor(es) Asignado(s):
            </label>
            <select
              id="auditorDropdown"
              value={auditorSeleccionadoDropdown}
              onChange={handleAuditorDropdownChange}
              disabled={loadingAuditores}
            >
              <option value="">-- Seleccione un auditor --</option>
              {loadingAuditores ? (
                <option disabled>Cargando auditores...</option>
              ) : (
                auditores
                  .filter(
                    (auditor) =>
                      !auditoresSeleccionados.some(
                        (selected) => selected.Nombre === auditor.Nombre
                      )
                  )
                  .map((auditor, index) => (
                    <option key={index} value={auditor.Nombre}>
                      {auditor.Nombre}
                    </option>
                  ))
              )}
            </select>
            {loadingAuditores && (
              <span className="loading-inline">Cargando auditores...</span>
            )}

            <div className="selected-tags-container auditor-tags-container">
              {auditoresSeleccionados.map((auditor, index) => (
                <span key={index} className="selected-tag">
                  {auditor.Nombre}
                  <button onClick={() => handleRemoveAuditorTag(auditor)}>
                    x
                  </button>
                </span>
              ))}
              {auditoresSeleccionados.length === 0 && !loadingAuditores && (
                <p className="no-data-message-small">
                  No hay auditores seleccionados.
                </p>
              )}
            </div>
          </div>

          <button
            className="submit-button"
            onClick={handleNextStep}
            disabled={
              loadingNombres ||
              loadingAuditores ||
              isSubmitting ||
              !nombreInventario ||
              auditoresSeleccionados.length === 0 ||
              nombresInventarioExistentes.includes(nombreInventario) ||
              !sucursalSeleccionada
            }
          >
            Siguiente
          </button>
        </div>
      )}

      {/* --- Vista 2: Detalles Específicos del Inventario --- */}
      {currentStep === 2 && (
        <div className="form-view-step">
          <h3>
            Detalles del Inventario{" "}
            {tipoInventario === "general" ? "General" : "Cíclico"}
          </h3>
          {tipoInventario === "general" ? (
            <>
              <div className="form-group">
                <label className="titulos-label" htmlFor="almacenInput">
                  Almacén:
                </label>
                <input
                  type="text"
                  id="almacenInput"
                  value={almacenInput}
                  onChange={(e) => setAlmacenInput(e.target.value)}
                  placeholder="Ej: Almacén Principal"
                />
              </div>

              <div className="form-group">
                <label className="titulos-label">Selección por:</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="ubicaciones"
                      checked={tipoSeleccionGeneral === "ubicaciones"}
                      onChange={() => {
                        setTipoSeleccionGeneral("ubicaciones");
                        setLineasSeleccionadas([]);
                        setLineasInput("");
                      }}
                    />
                    Ubicación (Pasillos/Zonas)
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="lineas"
                      checked={tipoSeleccionGeneral === "lineas"}
                      onChange={() => {
                        setTipoSeleccionGeneral("lineas");
                        setUbicacionesInput("");
                      }}
                    />
                    Líneas de Productos
                  </label>
                </div>
              </div>

              {tipoSeleccionGeneral === "ubicaciones" && (
                <div className="form-group">
                  <label className="titulos-label" htmlFor="ubicacionesInput">
                    Ubicación(es) (Pasillos/Zonas):
                  </label>
                  <input
                    type="text"
                    id="ubicacionesInput"
                    value={ubicacionesInput}
                    onChange={(e) => setUbicacionesInput(e.target.value)}
                    placeholder="Ej: A1, B2, Zona Principal"
                  />
                  <p className="required-fields-info">
                    Ingresa múltiples ubicaciones separadas por comas.
                  </p>
                </div>
              )}

              {tipoSeleccionGeneral === "lineas" && (
                <div className="form-group">
                  <label className="titulos-label" htmlFor="lineasInput">
                    Seleccionar Líneas de Productos:
                  </label>
                  <input
                    type="text"
                    id="lineasInput"
                    value={lineasInput}
                    onChange={handleLineasInputChange}
                    placeholder="Empieza a teclear para buscar líneas..."
                    disabled={loadingLineas}
                  />
                  {loadingLineas && (
                    <span className="loading-inline">Cargando líneas...</span>
                  )}
                  {sugerenciasLineas.length > 0 && lineasInput.length > 0 && (
                    <ul className="suggestions-list">
                      {sugerenciasLineas.map((linea) => (
                        <li
                          key={linea.id}
                          onClick={() => handleSelectLinea(linea)}
                        >
                          {linea.linea}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="selected-tags-container lineas-tags-container">
                    {lineasSeleccionadas.map((linea) => (
                      <span key={linea.id} className="selected-tag">
                        {linea.linea}
                        <button onClick={() => handleSelectLinea(linea)}>
                          x
                        </button>
                      </span>
                    ))}
                    {lineasSeleccionadas.length === 0 &&
                      lineasInput.length === 0 &&
                      !loadingLineas && (
                        <p className="no-data-message-small">
                          No hay líneas seleccionadas.
                        </p>
                      )}
                  </div>
                </div>
              )}

              {previewDataGeneral &&
                sucursalSeleccionada &&
                almacenInput &&
                ((tipoSeleccionGeneral === "ubicaciones" && ubicacionesInput) ||
                  (tipoSeleccionGeneral === "lineas" &&
                    lineasSeleccionadas.length > 0)) && (
                  <div className="preview-card">
                    <h4>Datos Preliminares del Inventario</h4>
                    <p>
                      <strong>Inventario ID:</strong>{" "}
                      {previewDataGeneral.InventarioID}
                    </p>
                    <p>
                      <strong>Ciudad:</strong> {previewDataGeneral.Ciudad}
                    </p>
                    <p>
                      <strong>Almacén:</strong> {previewDataGeneral.Almacen}
                    </p>
                    <p>
                      <strong>Auditor(es):</strong>{" "}
                      {previewDataGeneral.Auditores.join(", ")}
                    </p>
                    {tipoSeleccionGeneral === "ubicaciones" &&
                      previewDataGeneral.Ubicaciones !== "No aplica" && (
                        <p>
                          <strong>Ubicaciones:</strong>{" "}
                          {previewDataGeneral.Ubicaciones}
                        </p>
                      )}
                    {tipoSeleccionGeneral === "lineas" &&
                      previewDataGeneral.Lineas !== "No aplica" && (
                        <p>
                          <strong>Líneas:</strong> {previewDataGeneral.Lineas}
                        </p>
                      )}
                  </div>
                )}

              <div className="form-actions">
                <button className="back-button" onClick={handlePrevStep}>
                  Atrás
                </button>
                <button
                  className="submit-button"
                  onClick={handleGuardarInventarioGeneral}
                  disabled={
                    isSubmitting ||
                    loadingLineas ||
                    !almacenInput ||
                    (tipoSeleccionGeneral === "ubicaciones" &&
                      !ubicacionesInput) ||
                    (tipoSeleccionGeneral === "lineas" &&
                      lineasSeleccionadas.length === 0)
                  }
                >
                  {isSubmitting ? "Guardando..." : "Guardar Inventario General"}
                </button>
              </div>
            </>
          ) : (
            <>
              {!previewDataCiclico && (
                <>
                  <div className="form-group">
                    <label className="titulos-label" htmlFor="almacenInput">
                      Almacén:
                    </label>
                    <input
                      type="text"
                      id="almacenInput"
                      value={almacenInput}
                      onChange={(e) => setAlmacenInput(e.target.value)}
                      placeholder="Ej: Almacén Principal"
                    />
                  </div>
                  <div className="form-group">
                    <label className="titulos-label">
                      Cargar Archivo Excel:
                    </label>
                    <div
                      {...getRootProps({
                        className: `dropzone ${isDragActive ? "active" : ""}`,
                      })}
                    >
                      <input {...getInputProps()} />
                      {file ? (
                        <p>
                          Archivo seleccionado: <strong>{file.name}</strong>
                        </p>
                      ) : (
                        <p>
                          Arrastra y suelta tu archivo Excel aquí, o haz clic
                          para seleccionar
                        </p>
                      )}
                    </div>
                    <p className="required-fields-info">
                      **Campos requeridos en el archivo Excel:** Clave,
                      Descripcion, Linea, Existencias, Unidad.
                    </p>
                  </div>
                </>
              )}

              {previewDataCiclico && (
                <div className="preview-card">
                  <h4>Datos Preliminares del Archivo</h4>
                  <p>
                    <strong>Inventario ID:</strong>{" "}
                    {previewDataCiclico.InventarioID}
                  </p>
                  <p>
                    <strong>Cantidad de Productos:</strong>{" "}
                    {previewDataCiclico.cantidadProductos}
                  </p>
                  <p>
                    <strong>Cantidad de Líneas:</strong>{" "}
                    {previewDataCiclico.cantidadLineas}
                  </p>
                  <p>
                    <strong>Ciudad:</strong> {previewDataCiclico.ciudad}
                  </p>
                  <p>
                    <strong>Almacén:</strong> {previewDataCiclico.almacen}
                  </p>
                  <p>
                    <strong>Auditor(es) Asignado(s):</strong>{" "}
                    {previewDataCiclico.auditores.join(", ")}
                  </p>
                  <button
                    className="cancel-upload-button"
                    onClick={handleCancelFileUpload}
                  >
                    Cancelar
                  </button>
                </div>
              )}

              <div className="form-actions">
                <button className="back-button" onClick={handlePrevStep}>
                  Atrás
                </button>
                <button
                  className="submit-button"
                  onClick={handleGuardarInventarioCiclico}
                  disabled={isSubmitting || !file || dataExcel.length === 0}
                >
                  {isSubmitting ? "Guardando..." : "Guardar Inventario Cíclico"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SubirInventario;
