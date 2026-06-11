import React, { useState, useEffect, useCallback } from 'react';
import { BiX, BiLineChart, BiCategory, BiUser, BiRefresh, BiErrorCircle } from 'react-icons/bi';

const InventoryAnalytics = ({ inventario, onClose }) => {
  const [selectedDimension, setSelectedDimension] = useState('linea');
  const [activeMetric, setActiveMetric] = useState('exactitud');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Sustitución especial solicitada por el usuario
      const invId = inventario.InventarioID === "052026-1" ? "INVMAY" : inventario.InventarioID;

      const response = await fetch(
        `${process.env.REACT_APP_URL_API1}/dashboard/asertividad?inventarioId=${invId}`
      );
      
      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Error al cargar analíticas:", err);
      setError("No se pudieron cargar los datos de asertividad.");
    } finally {
      setLoading(false);
    }
  }, [inventario.InventarioID]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const dimensions = [
    { id: 'linea', label: 'Línea', icon: <BiLineChart /> },
    { id: 'familia', label: 'Familia', icon: <BiCategory /> },
    { id: 'genero', label: 'Género', icon: <BiUser /> },
    { id: 'rotacion', label: 'Rotación', icon: <BiRefresh /> },
  ];

  // Función para determinar el color según el valor (Semáforo)
  const getBarColor = (value) => {
    if (value >= 95) return '#28a745'; // Verde
    if (value >= 85) return '#fd7e14'; // Naranja
    return '#dc3545'; // Rojo
  };

  const renderContent = () => {
    if (loading) return (
      <div className="loading-analytics" style={{padding: '40px', textAlign: 'center'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p style={{marginTop: '10px', color: '#666'}}>Consultando indicadores reales...</p>
      </div>
    );

    if (error) return (
      <div className="error-analytics" style={{padding: '40px', textAlign: 'center', color: '#dc3545'}}>
        <BiErrorCircle size={40} />
        <p style={{marginTop: '10px'}}>{error}</p>
        <button className="btn btn-outline-danger btn-sm" onClick={fetchAnalytics}>Reintentar</button>
      </div>
    );

    const currentData = data && data[selectedDimension] ? data[selectedDimension] : [];

    if (currentData.length === 0) {
      return (
        <div style={{padding: '40px', textAlign: 'center', color: '#888'}}>
          No hay datos disponibles para la segmentación por {selectedDimension}.
        </div>
      );
    }

    return (
      <div className="segmented-results-grid">
        {currentData.map((item, index) => (
          <div key={index} className="segment-item">
            <div className="segment-name">{item.name || item.Nombre || item.Clave}</div>
            <div className="segment-bar-container">
              <div 
                className="segment-bar-fill" 
                style={{ 
                  width: `${item.value || item.Asertividad || 0}%`, 
                  backgroundColor: getBarColor(item.value || item.Asertividad || 0) 
                }}
              ></div>
            </div>
            <div className="segment-value">{Math.round(item.value || item.Asertividad || 0)}%</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="analytics-dashboard">
      <div className="analytics-nav">
        <div className="analytics-title">
          <h4>Análisis de Asertividad</h4>
          <span className="text-muted" style={{fontSize: '0.8rem'}}>Desglose por {selectedDimension}</span>
        </div>
        
        <div className="dimension-selector">
          {dimensions.map(dim => (
            <button
              key={dim.id}
              className={`pill-button ${selectedDimension === dim.id ? 'active' : ''}`}
              onClick={() => setSelectedDimension(dim.id)}
            >
              <span style={{marginRight: '6px'}}>{dim.icon}</span>
              {dim.label}
            </button>
          ))}
        </div>

        <button className="back-button-table" onClick={onClose} style={{marginLeft: '20px'}}>
          <BiX size={20} /> Cerrar Análisis
        </button>
      </div>

      {renderContent()}

      <div className="analytics-footer" style={{marginTop: '25px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee'}}>
        <p style={{margin: 0, fontSize: '0.8rem', color: '#666'}}>
          <strong>Fuente:</strong> Datos obtenidos en tiempo real desde el servidor de analítica (Puerto 3001). 
          Los colores representan niveles de cumplimiento: <span style={{color: '#28a745'}}>●</span> &gt;95% | <span style={{color: '#fd7e14'}}>●</span> &gt;85% | <span style={{color: '#dc3545'}}>●</span> &lt;85%
        </p>
      </div>
    </div>
  );
};

export default InventoryAnalytics;
