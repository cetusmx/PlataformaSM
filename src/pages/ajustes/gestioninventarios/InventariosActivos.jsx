// src/components/InventariosActivos.js
import React, { useState, useEffect } from "react";
// Importa BiCheckDouble junto con los otros íconos
import { BiBox, BiCheck, BiArrowBack, BiCheckDouble, BiDownload } from "react-icons/bi"; 
import "./InventariosActivos.css";

// Componente mejorado para mostrar productos en una tabla
const ProductTable = ({
  products,
  onBack,
  viewTitle,
  columns,
  onAdjustLineClick,
  showAdjustButton,
  onDownload, // Nueva prop
}) => (
  <div className="product-table-container">
    <div className="product-table-header">
      <div className="header-left">
        <button onClick={onBack} className="back-button-table">
          <BiArrowBack /> Volver
        </button>
      </div>
      <div className="header-center">
        <h3>{viewTitle}</h3>
      </div>
      <div className="header-right">
        {showAdjustButton && (
          <button
            className="adjust-line-table-button"
            onClick={onAdjustLineClick}
            title="Marcar línea como ajustada en sistema"
          >
            Línea Ajustada
          </button>
        )}
        {viewTitle === "Todos los Productos Contados" ? (
          <button onClick={onDownload} className="download-button" title="Descargar"> <BiDownload style={{fontSize: "1.3em"}}/> Descargar</button>
        ) : null}
      </div>
    </div>
    {products.length > 0 ? (
      <div className="table-scroll-wrapper">
        {" "}
        {/* Contenedor para el scroll */}
        <table className="product-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>{product[col.accessor]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="no-data-message">No hay productos para mostrar.</div>
    )}
  </div>
);

// Definición de columnas
const BASIC_PRODUCT_COLUMNS = [
  { header: 'Clave', accessor: 'Clave' },
  { header: 'Descripción', accessor: 'Descripcion' },
  { header: 'Unidad', accessor: 'Unidad' },
];

const COUNTED_LINE_PRODUCT_COLUMNS = [
  { header: 'Clave', accessor: 'Clave' },
  { header: 'Descripción', accessor: 'Descripcion' },
  { header: 'Unidad', accessor: 'Unidad' },
  { header: 'Existencia', accessor: 'qtyConteo' },
];

const ALL_COUNTED_PRODUCTS_COLUMNS = [
  { header: 'Clave', accessor: 'Clave' },
  { header: 'Descripción', accessor: 'Descripcion' },
  { header: 'Existencia', accessor: 'qtyConteo' }, // Corrected accessor
  { header: 'Unidad', accessor: 'Unidad' },
  { header: 'Observaciones', accessor: 'Observaciones' },
];

const LineaCard = ({ linea, onClick }) => {
  const { Linea, NombreLinea, qtyProductosLinea, isCounted, isAdjusted } = linea; 
  
  // Lógica para aplicar la clase CSS correctamente
  let cardClassName = "linea-card";
  if (isAdjusted) {
      cardClassName += " adjusted"; // Si está ajustada, solo aplica la clase 'adjusted'
  } else if (isCounted) { 
      cardClassName += " counted"; // Si no está ajustada pero sí contada, aplica la clase 'counted'
  }

  // Lógica para definir el texto del tooltip
  let tooltipText = "";
  if (isAdjusted) {
    tooltipText = "Línea ajustada en sistema";
  } else if (isCounted) {
    tooltipText = "Línea cuantificada";
  } else {
    tooltipText = "Línea pendiente de cuantificar";
  }

  return (
    // Condicionamos el onClick: si isAdjusted es true, no se asigna la función onClick.
    <div 
      className={cardClassName} 
      onClick={isAdjusted ? null : () => onClick(linea)} // La tarjeta no es clickeable si está ajustada
      title={tooltipText} // Añadimos el tooltip
    >
      <div className="linea-info">
        <h4>{Linea}</h4>
        <p>{NombreLinea}</p>
        <p>Productos: {qtyProductosLinea}</p>
      </div>
      {/* Lógica para mostrar los íconos */}
      {isAdjusted ? (
        <BiCheckDouble className="icon-check" size={30} /> // Ícono BiCheckDouble si está ajustada
      ) : isCounted ? (
        <BiCheck className="icon-check" size={30} /> // Ícono BiCheck si está contada pero no ajustada
      ) : null}
    </div>
  );
};

const InventarioDetails = ({ inventario, onBack }) => {
  const [viewMode, setViewMode] = useState('lines'); // 'lines', 'lineProducts', 'allProducts'
  const [lineas, setLineas] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedLinea, setSelectedLinea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // State for modal visibility

  // Fetch inicial para las líneas del inventario
  useEffect(() => {
    const fetchLineas = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://75.119.150.222:3001/getlineasinvresumen?InventarioID=${inventario.InventarioID}&auditor=${inventario.Auditor}`
        );
        if (!response.ok) throw new Error('Error al cargar líneas');
        let data = await response.json();
        
        // Ensure data is an array and sort it alphabetically by NombreLinea
        if (Array.isArray(data)) {
          data.sort((a, b) => {
            const nameA = a.NombreLinea ? a.NombreLinea.toUpperCase() : '';
            const nameB = b.NombreLinea ? b.NombreLinea.toUpperCase() : '';
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
          });
          setLineas(data);
        } else {
          setLineas([]);
        }
      } catch (e) {
        setError("No se pudieron cargar las líneas.");
      } finally {
        setLoading(false);
      }
    };
    fetchLineas();
  }, [inventario.InventarioID, inventario.Auditor]);

  // Handler para ver todos los productos
  const handleViewAllProducts = async () => {
    setViewMode('allProducts');
    setLoading(true);
    setError(null);
    try {
      //Obtiene todo el universo de productos contados de un inventario
      const response = await fetch(
        `http://75.119.150.222:3001/getproductoscontadosporauditoreinv?InventarioID=${inventario.InventarioID}&Auditor=${inventario.Auditor}`
      );
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();
      const mappedProducts = Array.isArray(data) ? data.map(p => ({
        Clave: p.Clave,
        Descripcion: p.Descripcion,
        qtyConteo: p.Existencia, // Mapeado a Existencia
        Unidad: p.Unidad,
        Observaciones: p.Observaciones // Nueva columna
      })) : [];
      console.log(mappedProducts);
      setProducts(mappedProducts);
    } catch (e) {
      setError("No se pudieron cargar todos los productos contados.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handler para ver productos de una línea específica
  const handleLineaClick = async (linea) => {
    setSelectedLinea(linea);
    setViewMode('lineProducts');
    setLoading(true);
    setError(null);
    try {
      let url;
      let mappedProducts;
      if (linea.isCounted) {
        //url = `http://75.119.150.222:3001/getproductoscontadosporauditoreinv?InventarioID=${inventario.InventarioID}&Auditor=${inventario.Auditor}`;
        url = `http://75.119.150.222:3001/getproductoscontadosporauditorporlineaeinv?InventarioID=${inventario.InventarioID}&Auditor=${inventario.Auditor}&Linea=${linea.Linea}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al cargar productos de la línea');
        const data = await response.json();
        mappedProducts = Array.isArray(data) ? data.map(p => ({
          Clave: p.Clave,
          Descripcion: p.Descripcion,
          qtyConteo: p.Existencia,
          Unidad: p.Unidad,
        })) : [];
      } else {
        url = `http://75.119.150.222:3001/getproductosporlineaeinv?InventarioID=${inventario.InventarioID}&Linea=${linea.Linea}&Auditor=${inventario.Auditor}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al cargar productos de la línea');
        const data = await response.json();
        mappedProducts = Array.isArray(data) ? data.map(p => ({
          Clave: p.Clave,
          Descripcion: p.Descripcion,
          Unidad: p.Unidad,
        })) : [];
      }

      setProducts(mappedProducts);
    } catch (e) {
      setError("No se pudieron cargar los productos de la línea.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const resetView = () => {
    setViewMode('lines');
    setSelectedLinea(null);
    setProducts([]);
    setError(null);
  };

  // Handler para mostrar el modal de confirmación
  const handleLineaAjustada = () => {
    setShowConfirmModal(true);
  };

  // Handler para cancelar en el modal
  const handleCancelAdjustment = () => {
    setShowConfirmModal(false);
    // No navigation or other actions here, just close the modal.
  };

  // Handler para aceptar en el modal y descargar la tabla + llamar a la API
  const handleConfirmAdjustment = async () => {
    setShowConfirmModal(false); // Close the modal
    
    // 1. Descargar el contenido de la tabla
    exportTableDataToCsv();

    // 2. Llamar a la API para marcar la línea como ajustada
    if (selectedLinea) {
      const payload = {
        InventarioID: inventario.InventarioID,
        Linea: selectedLinea.Linea,
        NombreLinea: selectedLinea.NombreLinea, // Assuming NombreLinea is available on selectedLinea
        isAdjusted: true,
        Auditor: inventario.Auditor,
      };

      try {
        const response = await fetch('http://75.119.150.222:3002/lineaajustada', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Error al ajustar la línea: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Línea ajustada con éxito en el sistema:', result);
        
        // Actualizar el estado de la línea localmente, incluyendo isAdjusted
        setLineas(prevLineas => prevLineas.map(line =>
          line.Linea === selectedLinea.Linea ? { ...line, isCounted: true, isAdjusted: true } : line
        ));


      } catch (apiError) {
        console.error('Error al llamar a la API de ajuste de línea:', apiError);
        alert(`Error al ajustar la línea: ${apiError.message}. Por favor, inténtalo de nuevo.`);
      }
    } else {
      console.warn("No hay línea seleccionada para ajustar.");
    }
    console.log(`Línea ${selectedLinea?.Linea} marcada para ajuste y datos descargados.`);
    
    resetView(); // Navigate back to the previous view after actions
  };

  // Function to export table data to CSV
  const exportTableDataToCsv = () => {
    if (!products || products.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    // Determine columns based on selectedLinea context
    const exportColumns = selectedLinea?.isCounted ? COUNTED_LINE_PRODUCT_COLUMNS : BASIC_PRODUCT_COLUMNS;
    if (viewMode === 'allProducts') {
      // Use ALL_COUNTED_PRODUCTS_COLUMNS if viewing all products
      const allCountedProductsView = products.every(p => p.Observaciones !== undefined);
      if (allCountedProductsView) {
        exportColumns.splice(0, exportColumns.length, ...ALL_COUNTED_PRODUCTS_COLUMNS); // Efficiently replace array content
      }
    }

    const header = exportColumns.map(col => col.header).join(',');
    const rows = products.map(row =>
      exportColumns.map(col => {
        const value = row[col.accessor];
        // Enclose values with commas or newlines in quotes
        return typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"` // Escape double quotes
          : value;
      }).join(',')
    );

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `Linea_${selectedLinea?.Linea || 'TodosProductos'}_${inventario.InventarioID}.csv`;

    // Create a temporary link element to trigger the download
    const link = document.createElement("a");
    if (link.download !== undefined) { // Feature detection for download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden'; // Hide the link
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up the URL object
    } else {
      alert("Su navegador no soporta la descarga directa. Por favor, copie el contenido.");
      console.log(csvContent);
    }
    console.log("Datos de la tabla descargados como CSV.");
  };

  const renderContent = () => {
    if (loading) return <div className="loading-message">Cargando...</div>;
    if (error) return <div className="error-message">{error}</div>;

    switch (viewMode) {
      case 'lineProducts':
        const currentColumns = selectedLinea?.isCounted ? COUNTED_LINE_PRODUCT_COLUMNS : BASIC_PRODUCT_COLUMNS;
        return (
          <ProductTable
            products={products}
            onBack={resetView}
            viewTitle={`Productos de la línea: ${selectedLinea?.Linea}`}
            columns={currentColumns}
            onAdjustLineClick={handleLineaAjustada}
            showAdjustButton={selectedLinea?.isCounted}
          />
        );
      case 'allProducts':
        return (
          <ProductTable
            products={products}
            onBack={resetView}
            viewTitle="Todos los Productos Contados"
            columns={ALL_COUNTED_PRODUCTS_COLUMNS}
            onAdjustLineClick={handleLineaAjustada}
            showAdjustButton={false}
            onDownload={exportTableDataToCsv} // Pasar la función de descarga
          />
        );
      case 'lines':
      default:
        return (
          <div className="lineas-grid">
            {lineas.map((linea, index) => (
              <LineaCard key={index} linea={linea} onClick={handleLineaClick} />
            ))}
          </div>
        );
    }
  };

  return (
    <div className="inventario-details-container">
      <div className="inventario-header">
        <h3>Inventario ID: {inventario.InventarioID}</h3>
        <div className="inventario-header-details">
          <p>
            <strong>Ciudad:</strong> {inventario.Ciudad}
          </p>
          <p>
            <strong>Auditor:</strong> {inventario.Auditor}
          </p>
          <p>
            <strong>No. de Líneas:</strong> {lineas.length}
          </p>
          <p>
            <strong>Productos:</strong> {inventario.qtyProductos}
          </p>
        </div>
      </div>

      {viewMode === "lines" && (
        <div className="navigation-buttons">
          <button className="nav-button" onClick={handleViewAllProducts}>
            Ver Todos Productos Contados
          </button>
          <h4>Líneas</h4>
          <button style={{width: "100%"}} onClick={onBack} className="back-button">
            <BiArrowBack /> Regresar a Inventarios
          </button>
        </div>
      )}

      {viewMode === "lineProducts" ? (
        <div style={{ display: "flex", width: "100%" }}>
          <div className="lineas-scroll-container" style={{ width: "70%" }}>
            {renderContent()}
          </div>
          <div
            style={{
              width: "30%",
              padding: "20px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            {selectedLinea && (
              <img
                src={`${process.env.PUBLIC_URL}/Perfiles/${selectedLinea.Linea}.jpg`}
                alt={`Imagen de la línea ${selectedLinea.Linea}`}
                style={{
                  width: "80%",
                  maxHeight: "300px",
                  height: "auto",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "5px",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="lineas-scroll-container">{renderContent()}</div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Confirmación de Ajuste de Línea</h4>
            <p>
              Estás seguro de que deseas ajustar el estatus de esta línea y
              descargar sus datos?
            </p>
            <div className="modal-actions">
              <button
                onClick={handleCancelAdjustment}
                className="modal-button cancel-button"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAdjustment}
                className="modal-button confirm-button"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const InventarioCard = ({ inventario, onViewDetails }) => {
  const {
    InventarioID,
    Fecha,
    qtyProductos,
    qtyLineas,
    Almacen,
    Ciudad,
    ProgressPorcentage,
    Auditor,
  } = inventario;
  const formattedDate = Fecha ? new Date(Fecha).toLocaleDateString() : "N/A";

  return (
    <button
      className="inventario-card"
      onClick={() => onViewDetails(inventario)}
    >
      <div className="card-icon">
        <BiBox size={24} color="#007bff" />
      </div>
      <div className="card-info">
        <h3>Inventario ID: {InventarioID}</h3>
        <p>
          <strong>Fecha de Alta:</strong> {formattedDate}
        </p>
        <p>
          <strong>Productos a Contar:</strong> {qtyProductos}
        </p>
        <p>
          <strong>Líneas a Contar:</strong> {qtyLineas}
        </p>
        <p>
          <strong>Almacén:</strong> {Almacen}
        </p>
        <p>
          <strong>Ciudad:</strong> {Ciudad}
        </p>
        <p>
          <strong>Auditor:</strong> {Auditor}
        </p>
      </div>
      <div className="card-progress">
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${ProgressPorcentage}%` }}
          ></div>
        </div>
        <span className="progress-text">{ProgressPorcentage}% Completado</span>
      </div>
    </button>
  );
};

const InventariosActivos = () => {
  const [inventarios, setInventarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInventario, setSelectedInventario] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setError("La solicitud ha tardado demasiado y ha sido cancelada.");
      setLoading(false);
    }, 8000);

    const fetchInventarios = async () => {
      try {
        const response = await fetch(
          "http://75.119.150.222:3001/getresumeninventariosweb",
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setInventarios(data);
        } else {
          setInventarios([]);
        }
      } catch (e) {
        if (e.name === "AbortError") {
          console.log("Fetch abortado");
        } else {
          console.error("Error fetching inventarios:", e);
          setError(
            "No se pudieron cargar los inventarios. Inténtalo de nuevo más tarde."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchInventarios();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const handleViewDetails = (inventario) => {
    setSelectedInventario(inventario);
  };

  const handleBack = () => {
    setSelectedInventario(null);
  };

  if (loading) {
    return <div className="loading-message">Cargando inventarios...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (selectedInventario) {
    return (
      <InventarioDetails
        inventario={selectedInventario}
        onBack={handleBack}
      />
    );
  }

  if (inventarios.length === 0) {
    return (
      <div className="no-data-message">
        No hay inventarios registrados
      </div>
    );
  }

  return (
    <div className="inventarios-activos-container">
      <div className="inventario-scroll-container">
        <div className="inventario-cards-grid">
          {inventarios.map((inventario) => (
            <InventarioCard
              key={inventario.InventarioID}
              inventario={inventario}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventariosActivos;