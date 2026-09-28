// src/components/InventariosCiclicos.js
import React, { useState, useEffect } from "react";
import { BiBox, BiTargetLock, BiTrendingDown, BiDollarCircle, BiTimeFive, BiBarChart, BiLoaderAlt, BiArrowBack, BiCheck, BiCheckDouble } from "react-icons/bi";
import "./InventariosActivos.css"; // Specific styles for this section

const InventarioCard = ({ inventario, onViewDetails }) => {
  const {
    InventarioID,
    Fecha,
    qtyProductos,
    Almacen, // This will now represent 'Ubicación' from the new API
    Ciudad,
    Auditor,
  } = inventario;

  const [productosContados, setProductosContados] = useState("...");

  useEffect(() => {
    let isMounted = true;
    const fetchProductos = async () => {
      try {
        if (!InventarioID || !Auditor) {
          if (isMounted) setProductosContados(0);
          return;
        }
        
        const url = `${process.env.REACT_APP_URL_API2}/api/v1/productoscontados/inventario/${InventarioID}/auditor/${encodeURIComponent(Auditor)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (!isMounted) return;

        if (response.ok && data.ok) {
          const uniqueKeys = new Set((data.body || []).map(p => p.Clave)).size;
          setProductosContados(uniqueKeys);
        } else if (response.status === 404) {
          setProductosContados(0);
        } else {
          setProductosContados("Error");
        }
      } catch (err) {
        if (isMounted) setProductosContados("Error");
      }
    };
    
    fetchProductos();
    
    return () => { isMounted = false; };
  }, [InventarioID, Auditor]);

  // Format the date
  const formattedDate = Fecha ? new Date(Fecha).toLocaleDateString() : "N/A";

  return (
    <button
      className="inventario-card"
      onClick={() => onViewDetails(InventarioID)}
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
          <strong>Almacén:</strong> {Almacen}
        </p>
        <p>
          <strong>Productos Contados:</strong> {productosContados}
        </p>
        <p>
          <strong>Ciudad:</strong> {Ciudad}
        </p>
        <p>
          <strong>Auditor:</strong> {Auditor || "N/A"}
        </p>
      </div>
      {/* <div className="card-progress">
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${ProgressPorcentage}%` }}
          ></div>
        </div>
        <span className="progress-text">{ProgressPorcentage}% Completado</span>
      </div> */}
    </button>
  );
};

const MetricCard = ({ label, value, icon, colorClass, onClick, isActive, loading, style }) => (
  <div 
    className={`metric-card ${onClick ? 'interactive' : ''} ${isActive ? 'active-filter' : ''} ${loading ? 'disabled' : ''}`} 
    onClick={loading || !onClick ? undefined : onClick}
    style={style}
  >
    <div className={`metric-icon-container ${colorClass}`}>
      {icon}
    </div>
    <div className="metric-content">
      <span className="metric-label">{label}</span>
      {loading ? (
        <div className="metric-spinner-wrapper">
          <BiLoaderAlt className="metric-spinner" />
          <span className="metric-spinner-text">Cargando...</span>
        </div>
      ) : (
        <span className="metric-value">{value}</span>
      )}
    </div>
  </div>
);

const InventarioGeneralDetails = ({ inventario, onBack }) => {
  const [productosContados, setProductosContados] = useState([]);
  const [ubicacionesEstados, setUbicacionesEstados] = useState([]);
  const [loadingBitacora, setLoadingBitacora] = useState(true);
  const [errorBitacora, setErrorBitacora] = useState(null);

  useEffect(() => {
    const fetchDatos = async () => {
      setLoadingBitacora(true);
      setErrorBitacora(null);
      try {
        const inventarioID = inventario.InventarioID;
        const auditor = inventario.Auditor;
        
        // 1. Fetch de productos contados
        const urlProds = `${process.env.REACT_APP_URL_API2}/api/v1/productoscontados/inventario/${inventarioID}/auditor/${encodeURIComponent(auditor)}`;
        const respProds = await fetch(urlProds);
        const dataProds = await respProds.json();
        
        if (respProds.ok && dataProds.ok) {
          setProductosContados(dataProds.body || []);
        } else if (respProds.status === 404) {
          setProductosContados([]); 
        } else {
          throw new Error(dataProds.msg || "Error al obtener datos");
        }

        // 2. Fetch de estados de ubicación
        // Se intenta ubicacionesactivas, si no, ubicacionestado
        const urlEstados = `${process.env.REACT_APP_URL_API2}/api/v1/ubicacionesactivas/${inventarioID}`;
        const respEstados = await fetch(urlEstados);
        if (respEstados.ok) {
          const dataEstados = await respEstados.json();
          setUbicacionesEstados(Array.isArray(dataEstados) ? dataEstados : []);
        } else {
           // fallback just in case the name was ubicacionestado
           const urlFallback = `${process.env.REACT_APP_URL_API2}/api/v1/ubicacionestado/${inventarioID}`;
           const respFallback = await fetch(urlFallback);
           if (respFallback.ok) {
             const dataFallback = await respFallback.json();
             setUbicacionesEstados(Array.isArray(dataFallback) ? dataFallback : []);
           }
        }

      } catch (err) {
        console.error("Error al cargar datos del inventario:", err);
        setErrorBitacora("No se pudieron cargar los datos en vivo.");
      } finally {
        setLoadingBitacora(false);
      }
    };
    
    if (inventario.InventarioID && inventario.Auditor) {
      fetchDatos();
    } else {
      setLoadingBitacora(false);
    }
  }, [inventario.InventarioID, inventario.Auditor]);

  // Estadísticas globales (para Progreso y Grid)
  const totalUniqueSKUs = new Set(productosContados.map(p => p.Clave)).size;
  
  let ultimaHoraEscaneo = "N/A";
  let maxTime = 0;
  if (productosContados.length > 0) {
    maxTime = Math.max(...productosContados.map(p => new Date(p.updatedAt).getTime()));
    ultimaHoraEscaneo = new Date(maxTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Estadísticas de "Bitácora en Vivo" (Última Hora de Actividad)
  const oneHourAgo = maxTime - (60 * 60 * 1000);
  const recentProducts = productosContados.filter(p => new Date(p.updatedAt).getTime() >= oneHourAgo);
  
  const recentTotalUnidades = recentProducts.reduce((sum, prod) => sum + (Number(prod.Existencia) || 0), 0);
  const recentUniqueSKUs = new Set(recentProducts.map(p => p.Clave)).size;

  // Agrupar por Ubicaciones (Global)
  const ubicacionesMap = productosContados.reduce((acc, prod) => {
    const ubicacion = prod.Ubicacion || "Sin Ubicación Especificada";
    if (!acc[ubicacion]) acc[ubicacion] = { productos: [], totalUnidades: 0, uniqueSKUs: new Set() };
    acc[ubicacion].productos.push(prod);
    acc[ubicacion].totalUnidades += Number(prod.Existencia) || 0;
    acc[ubicacion].uniqueSKUs.add(prod.Clave);
    return acc;
  }, {});

  const ubicacionesArray = Object.keys(ubicacionesMap).map(key => {
    const estado = ubicacionesEstados.find(u => u.Ubicacion === key) || {};
    return {
      Ubicacion: key,
      totalUnidades: ubicacionesMap[key].totalUnidades,
      uniqueSKUs: ubicacionesMap[key].uniqueSKUs.size,
      productos: ubicacionesMap[key].productos,
      isCounted: estado.isCounted || false,
      isAdjusted: estado.isAdjusted || false
    };
  });

  return (
    <div className="inventario-details-container">
      <div className="inventario-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <h3>Inventario ID: {inventario.InventarioID}</h3>
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: '#666' }}>
            <span><strong>Auditor:</strong> {inventario.Auditor}</span>
            <span><strong>Ciudad:</strong> {inventario.Ciudad}</span>
          </div>
        </div>
        
        <div className="metrics-grid">
          <MetricCard 
            label="Progreso" 
            value={loadingBitacora ? "..." : totalUniqueSKUs} 
            icon={<BiBarChart />} 
            colorClass="metric-blue"
          />
          <MetricCard 
            label="Asertividad" 
            value="..."
            icon={<BiTargetLock />} 
            colorClass="metric-green"
          />
          <MetricCard 
            label="Diferencias" 
            value="..."
            icon={<BiTrendingDown />} 
            colorClass="metric-red"
          />
          <MetricCard 
            label="COSTO INV." 
            value="..."
            icon={<BiDollarCircle />} 
            colorClass="metric-red"
          />
        </div>
      </div>

      {/* FRANJA COMPACTA DE BITÁCORA */}
      <div style={{ backgroundColor: '#f0f7ff', border: '1px solid #cce5ff', padding: '10px 15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#004085' }}>
          <BiBox size={20} />
          <strong>{loadingBitacora ? "..." : recentUniqueSKUs}</strong> Claves Contadas (Última hr)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#004085' }}>
          <BiBarChart size={20} />
          <strong>{loadingBitacora ? "..." : recentTotalUnidades}</strong> Unidades Físicas (Última hr)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#856404' }}>
          <BiTimeFive size={20} />
          <span>Último escaneo: <strong>{loadingBitacora ? "..." : ultimaHoraEscaneo}</strong></span>
        </div>
      </div>

      <div className="navigation-buttons">
        <button className="nav-button">
          Ver Todos Productos Contados
        </button>
        <h4 style={{ textAlign: 'center', margin: '0' }}>Ubicaciones</h4>
        <button style={{ width: "100%" }} onClick={onBack} className="back-button">
          <BiArrowBack /> Regresar a Inventarios
        </button>
      </div>

      <div className="lineas-scroll-container">
        {loadingBitacora ? (
          <div className="loading-message">Procesando ubicaciones...</div>
        ) : errorBitacora ? (
          <div className="error-message">{errorBitacora}</div>
        ) : ubicacionesArray.length === 0 ? (
          <div className="no-data-message">Aún no se han registrado productos.</div>
        ) : (
          <div className="lineas-grid">
            {ubicacionesArray.map((ubi, index) => {
              let cardClass = "linea-card interactive";
              let tooltip = "Ubicación pendiente";
              if (ubi.isAdjusted) {
                cardClass += " adjusted";
                tooltip = "Procesada en ERP";
              } else if (ubi.isCounted) {
                cardClass += " counted";
                tooltip = "Auditoría Terminada";
              }

              // Import BiCheck and BiCheckDouble at the top of the file if needed. 
              // Oh wait, I need to make sure BiCheck and BiCheckDouble are imported.
              return (
                <div key={index} className={cardClass} title={tooltip} onClick={ubi.isAdjusted ? undefined : () => {}} style={ubi.isAdjusted ? { cursor: 'not-allowed' } : {}}>
                  <div className="linea-info">
                    <h4>📍 {ubi.Ubicacion}</h4>
                    <p style={{ marginTop: '5px' }}>Claves Únicas: <strong>{ubi.uniqueSKUs}</strong></p>
                    <p>Unidades Físicas: <strong>{ubi.totalUnidades}</strong></p>
                  </div>
                  {/* Iconos de estado idénticos a los inventarios cíclicos */}
                  {ubi.isAdjusted ? (
                    <BiCheckDouble className="icon-check" size={30} color="#28a745" />
                  ) : ubi.isCounted ? (
                    <BiCheck className="icon-check" size={30} color="#ffc107" />
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const InventariosGenerales = () => {
  const [inventarios, setInventarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInventario, setSelectedInventario] = useState(null);

  useEffect(() => {
    const fetchInventarios = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_URL_API1}/getresumeninventariosgenerales`
        ); // Changed API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setInventarios(data);
      } catch (e) {
        console.error("Error fetching inventarios cíclicos:", e);
        setError(
          "No se pudieron cargar los inventarios generales. Inténtalo de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInventarios();
  }, []); // The empty array ensures this runs only once on mount

  if (loading) {
    return <div className="loading-message">Cargando inventarios generales...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (selectedInventario) {
    return <InventarioGeneralDetails inventario={selectedInventario} onBack={() => setSelectedInventario(null)} />;
  }

  if (inventarios.length === 0) {
    return (
      <div className="no-data-message">
        No hay inventarios generales activos disponibles en este momento.
      </div>
    );
  }

  return (
    <div className="inventarios-activos-container">
      <div className="inventario-scroll-container">
        <div className="inventario-cards-grid">
          {inventarios.map((inventario) => (
            <InventarioCard
              key={inventario.InventarioID} // Ensure 'InventarioID' is unique
              inventario={inventario}
              onViewDetails={() => setSelectedInventario(inventario)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventariosGenerales;