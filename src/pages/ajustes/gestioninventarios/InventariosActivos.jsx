// src/components/InventariosActivos.js
import React, { useState, useEffect } from "react";
import { BiBox, BiCheckCircle, BiArrowBack } from "react-icons/bi";
import "./InventariosActivos.css";

// Componente mejorado para mostrar productos en una tabla
const ProductTable = ({ products, onBack, viewTitle, columns }) => (
  <div className="product-table-container">
    <div className="product-table-header">
      <button onClick={onBack} className="back-button-table">
        <BiArrowBack /> Volver
      </button>
      <h3>{viewTitle}</h3>
    </div>
    {products.length > 0 ? (
      <div className="table-scroll-wrapper"> {/* Contenedor para el scroll */}
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
  { header: 'Existencia', accessor: 'qtyConteo' },
  { header: 'Unidad', accessor: 'Unidad' },
  { header: 'Observaciones', accessor: 'Observaciones' },
];

const LineaCard = ({ linea, onClick }) => {
  const { Linea, NombreLinea, qtyProductosLinea, isCounted } = linea;
  const cardClassName = `linea-card ${isCounted ? "counted" : ""}`;

  return (
    <div className={cardClassName} onClick={() => onClick(linea)}>
      <div className="linea-info">
        <h4>{Linea}</h4>
        <p>{NombreLinea}</p>
        <p>Productos: {qtyProductosLinea}</p>
      </div>
      {isCounted ? <BiCheckCircle className="icon-check" size={30} /> : null}
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

  // Fetch inicial para las líneas del inventario
  useEffect(() => {
    const fetchLineas = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://75.119.150.222:3001/getlineasinvresumen?InventarioID=${inventario.InventarioID}&auditor=${inventario.Auditor}`
        );
        if (!response.ok) throw new Error('Error al cargar líneas');
        const data = await response.json();
        setLineas(Array.isArray(data) ? data : []);
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
        url = `http://75.119.150.222:3001/getproductoscontadosporauditoreinv?InventarioID=${inventario.InventarioID}&Auditor=${inventario.Auditor}`;
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

  const renderContent = () => {
    if (loading) return <div className="loading-message">Cargando...</div>;
    if (error) return <div className="error-message">{error}</div>;

    switch (viewMode) {
      case 'lineProducts':
        const currentColumns = selectedLinea?.isCounted ? COUNTED_LINE_PRODUCT_COLUMNS : BASIC_PRODUCT_COLUMNS;
        return <ProductTable products={products} onBack={resetView} viewTitle={`Productos de la línea: ${selectedLinea?.Linea}`} columns={currentColumns} />;
      case 'allProducts':
        return <ProductTable products={products} onBack={resetView} viewTitle="Todos los Productos Contados" columns={ALL_COUNTED_PRODUCTS_COLUMNS} />;
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
          <p><strong>Ciudad:</strong> {inventario.Ciudad}</p>
          <p><strong>Auditor:</strong> {inventario.Auditor}</p>
          <p><strong>No. de Líneas:</strong> {lineas.length}</p>
          <p><strong>Productos:</strong> {inventario.qtyProductos}</p>
        </div>
      </div>
      
      {viewMode === 'lines' && (
        <div className="navigation-buttons">
          <button className="nav-button" onClick={handleViewAllProducts}>
            Ver Todos los Productos Contados
          </button>
        </div>
      )}

      {viewMode === 'lineProducts' ? (
        <div style={{ display: 'flex', width: '100%' }}>
          <div className="lineas-scroll-container" style={{ width: '70%' }}>
            {renderContent()}
          </div>
          <div style={{ width: '30%', padding: '20px', boxSizing: 'border-box', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            {selectedLinea && (
              <img
                src={`${process.env.PUBLIC_URL}/Perfiles/${selectedLinea.Linea}.jpg`}
                alt={`Imagen de la línea ${selectedLinea.Linea}`}
                style={{
                  width: '80%',
                  maxHeight: '300px',
                  height: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '5px',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="lineas-scroll-container">
          {renderContent()}
        </div>
      )}

      <button onClick={onBack} className="back-button">
        <BiArrowBack /> Regresar a Inventarios
      </button>
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
        <BiBox size={40} color="#007bff" />
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


