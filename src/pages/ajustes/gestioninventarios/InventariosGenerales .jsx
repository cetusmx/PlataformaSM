// src/components/InventariosCiclicos.js
import React, { useState, useEffect } from "react";
import { BiBox } from "react-icons/bi"; // Import the icon
import "./InventariosActivos.css"; // Specific styles for this section

const InventarioCard = ({ inventario, onViewDetails }) => {
  const {
    InventarioID,
    Fecha,
    // Removed 'qtyProductos' as it's not needed for cyclic inventories in this context
    qtyLineas,
    Almacen, // This will now represent 'Ubicación' from the new API
    Ubicacion,
    Ciudad,
    // Assuming the API for cyclic inventories might return an 'Ubicacion' field
    // If not, 'Almacen' will be used as the 'Ubicación' value as per your existing data structure.
  } = inventario;

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
        {/* Changed from 'Productos a Contar' to 'Ubicación(es)' */}
        <p>
          <strong>Almacén:</strong> {Almacen}
        </p>
        <p>
          <strong>Ubicación(es):</strong> {Ubicacion}
        </p>
        <p>
          <strong>Líneas a Contar:</strong> {qtyLineas}
        </p>
        <p>
          <strong>Ciudad:</strong> {Ciudad}
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

const InventariosGenerales = ({ onViewDetails }) => {
  const [inventarios, setInventarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventarios = async () => {
      try {
        const response = await fetch(
          "https://sealmarket.net/api1/getresumeninventariosgenerales"
        ); // Changed API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setInventarios(data);
      } catch (e) {
        console.error("Error fetching inventarios cíclicos:", e);
        setError(
          "No se pudieron cargar los inventarios cíclicos. Inténtalo de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInventarios();
  }, []); // The empty array ensures this runs only once on mount

  if (loading) {
    return <div className="loading-message">Cargando inventarios cíclicos...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
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
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventariosGenerales;