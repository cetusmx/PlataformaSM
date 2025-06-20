// src/components/SubirInventario.js
import React, { useState, useEffect, useCallback } from 'react'; // Agregamos useCallback
import './SubirInventario.css';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

const SubirInventario = ({ onUploadSuccess }) => {
  // --- Estados del formulario ---
  const [tipoInventario, setTipoInventario] = useState('ciclico');
  const [nombreInventario, setNombreInventario] = useState('');
  const [auditorSeleccionado, setAuditorSeleccionado] = useState('');
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState('');
  // Cambiamos 'lineasSeleccionadas' a un array de objetos o IDs según cómo lo necesites
  const [lineasSeleccionadas, setLineasSeleccionadas] = useState([]); // Array para las líneas seleccionadas (puede contener objetos {id, nombre})
  const [lineasInput, setLineasInput] = useState(''); // Estado para el valor del input de filtro de líneas
  const [sugerenciasLineas, setSugerenciasLineas] = useState([]); // Estado para las sugerencias filtradas

  // --- Estados de datos de API ---
  const [nombresInventarioExistentes, setNombresInventarioExistentes] = useState([]);
  const [auditores, setAuditores] = useState([]);
  const [lineasTotales, setLineasTotales] = useState([]); // Renombrado a lineasTotales para evitar conflicto

  // --- Estados de carga y error ---
  const [loadingNombres, setLoadingNombres] = useState(true);
  const [loadingAuditores, setLoadingAuditores] = useState(true);
  const [loadingLineas, setLoadingLineas] = useState(true);
  const [errorApi, setErrorApi] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Estados para carga de archivo (Inventario Cíclico) ---
  const [file, setFile] = useState(null);
  const [dataExcel, setDataExcel] = useState([]);
  const [previewData, setPreviewData] = useState(null);

  // --- Efectos para cargar datos de APIs al inicio ---
  useEffect(() => {
    const fetchData = async () => {
      setErrorApi(null);
      try {
        setLoadingNombres(true);
        const nombresRes = await fetch('http://18.224.118.226:3001/getnombresinv');
        const nombresData = await nombresRes.json();
        setNombresInventarioExistentes(nombresData.map(item => item.InventarioID));
        setLoadingNombres(false);

        setLoadingAuditores(true);
        const auditoresRes = await fetch('http://18.224.118.226:3001/getauditores');
        const auditoresData = await auditoresRes.json();
        setAuditores(auditoresData);
        setLoadingAuditores(false);

        setLoadingLineas(true);
        const lineasRes = await fetch('http://18.224.118.226:3001/getlineas');
        const lineasData = await lineasRes.json();
        setLineasTotales(lineasData); // Guarda todas las líneas
        setLoadingLineas(false);

      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        setErrorApi("No se pudieron cargar algunos datos iniciales (nombres de inventario, auditores o líneas).");
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
      const month = String(today.getMonth() + 1).padStart(2, '0');
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
      alert('Por favor, selecciona un archivo .xls o .xlsx válido.');
      return;
    }
    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile.name.endsWith('.xls') && !uploadedFile.name.endsWith('.xlsx')) {
      alert('Solo se permiten archivos con extensión .xls o .xlsx.');
      return;
    }
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (json.length < 2) {
        alert('El archivo Excel está vacío o solo contiene encabezados.');
        setFile(null);
        setDataExcel([]);
        setPreviewData(null);
        return;
      }

      const headers = json[0];
      const requiredHeaders = [
        "InventarioID", "Almacen", "Ciudad", "Clave", "Descripcion",
        "Linea", "Existencias", "PendientesSurtir", "Fecha", "LineaDesc", "Unidad"
      ];

      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        alert(`Faltan las siguientes columnas requeridas en el archivo: ${missingHeaders.join(', ')}`);
        setFile(null);
        setDataExcel([]);
        setPreviewData(null);
        return;
      }

      const parsedData = json.slice(1).map(row => {
        const rowObject = {};
        headers.forEach((header, index) => {
          rowObject[header] = row[index];
        });
        return rowObject;
      });

      setDataExcel(parsedData);

      if (parsedData.length > 0) {
        const firstRow = parsedData[0];
        const uniqueLines = new Set(parsedData.map(item => item.Linea)).size;
        const totalProducts = parsedData.reduce((sum, item) => sum + (Number(item.Existencias) || 0), 0);

        setPreviewData({
          InventarioID: firstRow.InventarioID,
          cantidadProductos: totalProducts,
          cantidadLineas: uniqueLines,
          ciudad: firstRow.Ciudad,
          almacen: firstRow.Almacen,
        });
      } else {
        setPreviewData(null);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // --- Lógica para el filtro de líneas (Inventario General) ---
  const handleLineasInputChange = (e) => {
    const value = e.target.value;
    console.log(auditores)
    setLineasInput(value);

    if (value.length > 0) {
      const filtered = lineasTotales.filter(linea =>
        linea.linea.toLowerCase().includes(value.toLowerCase())
      );
      setSugerenciasLineas(filtered);
      //console.log(filtered)
    } else {
      setSugerenciasLineas([]);
    }
  };

  const handleSelectLinea = (lineaToToggle) => {
    console.log(lineaToToggle)
  setLineasSeleccionadas(prevSelectedLines => {
    // Check if the line is already selected based on its 'id'

    const isAlreadySelected = prevSelectedLines.some(selected => selected.linea === lineaToToggle.linea);

    if (isAlreadySelected) {
      // If it's already selected, remove it
      return prevSelectedLines.filter(selected => selected.linea !== lineaToToggle.linea);
    } else {
      // If it's not selected, add it
      return [...prevSelectedLines, lineaToToggle];
    }
  });
  setLineasInput(''); // Clear the input after selecting/deselecting
  setSugerenciasLineas([]); // Hide suggestions
};

  // --- Funciones para guardar inventario ---
  const handleGuardarInventarioGeneral = async () => {
    if (!nombreInventario || !auditorSeleccionado || !sucursalSeleccionada || lineasSeleccionadas.length === 0) {
      alert('Por favor, completa todos los campos requeridos para Inventario General.');
      return;
    }
    if (nombresInventarioExistentes.includes(nombreInventario)) {
        alert('El nombre de inventario ya existe. Por favor, elige uno diferente o ajusta el consecutivo.');
        return;
    }

    setIsSubmitting(true);
    try {
      const inventarioData = {
        InventarioID: nombreInventario,
        Fecha: new Date().toISOString(),
        Ciudad: sucursalSeleccionada,
        Almacen: sucursalSeleccionada, // Asumiendo Almacen es igual a Ciudad/Sucursal
        LineasSeleccionadas: lineasSeleccionadas.map(linea => linea.id) // Enviar solo los IDs de las líneas
      };

      console.log('Objeto a enviar (Inventario General):', inventarioData);

      // --- PENDIENTE: Aquí iría la llamada a la API para Inventario General ---
      // const response = await fetch('YOUR_API_ENDPOINT_GENERAL', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(inventarioData),
      // });
      // if (!response.ok) {
      //   throw new Error(`Error al guardar Inventario General: ${response.statusText}`);
      // }
      // const result = await response.json();
      // console.log('Inventario General guardado con éxito:', result);

      alert('Inventario General guardado con éxito (simulado)!');
      onUploadSuccess();
    } catch (error) {
      console.error('Error al guardar Inventario General:', error);
      alert('Hubo un error al guardar el inventario general.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuardarInventarioCiclico = async () => {
    if (!file || dataExcel.length === 0) {
      alert('Por favor, sube y procesa un archivo Excel válido antes de guardar.');
      return;
    }
    if (!nombreInventario || !auditorSeleccionado) {
        alert('Por favor, completa los campos de Nombre del Inventario y Auditor.');
        return;
    }
    if (nombresInventarioExistentes.includes(nombreInventario)) {
        alert('El nombre de inventario ya existe. Por favor, elige uno diferente o ajusta el consecutivo.');
        return;
    }

    setIsSubmitting(true);
    try {
      const dataToSend = dataExcel.map(row => ({
        ...row,
        InventarioID: nombreInventario,
        Auditor: auditorSeleccionado,
      }));

      console.log('Arreglo de objetos a enviar (Inventario Cíclico):', dataToSend);

      // --- PENDIENTE: Aquí iría la llamada a la API para Inventario Cíclico ---
      // const response = await fetch('YOUR_API_ENDPOINT_CYCLIC', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(dataToSend),
      // });
      // if (!response.ok) {
      //   throw new Error(`Error al guardar Inventario Cíclico: ${response.statusText}`);
      // }
      // const result = await response.json();
      // console.log('Inventario Cíclico guardado con éxito:', result);

      alert('Inventario Cíclico guardado con éxito (simulado)!');
      onUploadSuccess();
    } catch (error) {
      console.error('Error al guardar Inventario Cíclico:', error);
      alert('Hubo un error al guardar el inventario cíclico.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizado del componente
  return (
    <div className="subir-inventario-scroll-container"> {/* Contenedor para el scroll */}
      <div className="subir-inventario-container"> {/* Contenedor original del formulario */}
        <h5>Alta de Inventario</h5>

        {errorApi && <div className="error-message">{errorApi}</div>}

        {/* --- Sección de Configuración General --- */}
        <div className="form-section">
          <h3>Configuración General</h3>
          <div className="form-group">
            <label>Tipo de Inventario:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="ciclico"
                  checked={tipoInventario === 'ciclico'}
                  onChange={() => setTipoInventario('ciclico')}
                />
                Inventario Cíclico
              </label>
              <label>
                <input
                  type="radio"
                  value="general"
                  checked={tipoInventario === 'general'}
                  onChange={() => setTipoInventario('general')}
                />
                Inventario General
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="nombreInventario">Nombre del Inventario:</label>
            <input
              type="text"
              id="nombreInventario"
              value={nombreInventario}
              onChange={(e) => setNombreInventario(e.target.value)}
              placeholder="Ej: 062025-1"
              readOnly={loadingNombres}
            />
            {loadingNombres && <span className="loading-inline">Cargando sugerencia...</span>}
            {nombresInventarioExistentes.includes(nombreInventario) && (
                <p className="warning-text">Este nombre ya existe. Por favor, ajústalo.</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="auditor">Auditor Asignado:</label>
            <select
              id="auditor"
              value={auditorSeleccionado}
              onChange={(e) => setAuditorSeleccionado(e.target.value)}
              disabled={loadingAuditores}
            >
              <option value="">-- Seleccione un auditor --</option>
              {loadingAuditores ? (
                <option disabled>Cargando auditores...</option>
              ) : (
                auditores.map((auditor, index) => (
                  <option key={index} value={auditor.Nombre}>
                    {auditor.Nombre}
                  </option>
                ))
              )}
            </select>
            {loadingAuditores && <span className="loading-inline">Cargando auditores...</span>}
          </div>
        </div>

        <hr className="divider" />

        {/* --- Sección Condicional --- */}
        {tipoInventario === 'general' ? (
          // --- Contenido para Inventario General ---
          <div className="form-section">
            <h3>Detalles del Inventario General</h3>
            <div className="form-group">
              <label htmlFor="sucursal">Sucursal:</label>
              <select
                id="sucursal"
                value={sucursalSeleccionada}
                onChange={(e) => setSucursalSeleccionada(e.target.value)}
              >
                <option value="">-- Seleccione una sucursal --</option>
                <option value="Durango">Durango</option>
                <option value="Fresnillo">Fresnillo</option>
                <option value="Mazatlan">Mazatlán</option>
                <option value="Zacatecas">Zacatecas</option>
              </select>
            </div>

            <div className="form-group">
                <label htmlFor="lineasInput">Seleccionar Líneas de Productos:</label>
                <input
                    type="text"
                    id="lineasInput"
                    value={lineasInput}
                    onChange={handleLineasInputChange}
                    placeholder="Empieza a teclear para buscar líneas..."
                    disabled={loadingLineas}
                />
                {loadingLineas && <span className="loading-inline">Cargando líneas...</span>}
                {sugerenciasLineas.length > 0 && lineasInput.length > 0 && (
                    <ul className="suggestions-list">
                        {sugerenciasLineas.map((linea) => (
                            <li key={linea.id} onClick={() => handleSelectLinea(linea)}>
                                {linea.linea}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="selected-lines-tags">
                    {lineasSeleccionadas.map((linea) => (
                        <span key={linea.id} className="line-tag">
                            {linea.linea}
                            <button onClick={() => handleSelectLinea(linea)}>x</button> {/* Botón para remover */}
                        </span>
                    ))}
                    {lineasSeleccionadas.length === 0 && lineasInput.length === 0 && !loadingLineas && (
                        <p className="no-data-message-small">No hay líneas seleccionadas.</p>
                    )}
                </div>
            </div>

            <button
              className="submit-button"
              onClick={handleGuardarInventarioGeneral}
              disabled={isSubmitting || loadingNombres || loadingAuditores || loadingLineas || lineasSeleccionadas.length === 0}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Inventario General'}
            </button>
          </div>
        ) : (
          // --- Contenido para Inventario Cíclico ---
          <div className="form-section">
            <h3>Carga de Archivo de Inventario Cíclico</h3>
            <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
              <input {...getInputProps()} />
              {file ? (
                <p>Archivo seleccionado: <strong>{file.name}</strong></p>
              ) : (
                <p>Arrastra y suelta tu archivo Excel aquí, o haz clic para seleccionar</p>
              )}
            </div>
            <p className="required-fields-info">
              **Campos requeridos en el archivo Excel:** InventarioID, Almacen, Ciudad, Clave, Descripcion, Linea, Existencias, PendientesSurtir, Fecha, LineaDesc, Unidad.
            </p>

            {previewData && (
              <div className="preview-card">
                <h4>Datos Preliminares del Archivo</h4>
                <p><strong>Inventario ID:</strong> {previewData.InventarioID}</p>
                <p><strong>Cantidad de Productos:</strong> {previewData.cantidadProductos}</p>
                <p><strong>Cantidad de Líneas:</strong> {previewData.cantidadLineas}</p>
                <p><strong>Ciudad:</strong> {previewData.ciudad}</p>
                <p><strong>Almacén:</strong> {previewData.almacen}</p>
              </div>
            )}

            <button
              className="submit-button"
              onClick={handleGuardarInventarioCiclico}
              disabled={isSubmitting || !file || dataExcel.length === 0 || loadingNombres || loadingAuditores}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Inventario Cíclico'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubirInventario;