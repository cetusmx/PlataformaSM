// src/components/InventariosActivos.js
import React, { useState, useEffect } from "react";
import { BiBox } from "react-icons/bi"; // Importa el icono
import "./InventariosActivos.css"; // Estilos específicos para esta sección

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
  console.log(inventario);
  // Formatear la fecha
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

//Inventarios Cíclicos
const InventariosActivos = ({ onViewDetails }) => {
  const [inventarios, setInventarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setError("La solicitud ha tardado demasiado y ha sido cancelada.");
      setLoading(false);
    }, 8000); // 8 segundos de tiempo de espera

    const fetchInventarios = async () => {
      try {
        const response = await fetch(
          "http://75.119.150.222:3001/getresumeninventariosweb",
          { signal: controller.signal }
        );

        clearTimeout(timeoutId); // Cancelar el temporizador si la respuesta llega a tiempo

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
        if (e.name === 'AbortError') {
          console.log('Fetch abortado');
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
      controller.abort(); // Abortar la solicitud si el componente se desmonta
    };
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  if (loading) {
    return <div className="loading-message">Cargando inventarios...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
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
              key={inventario.InventarioID} // Asegúrate de que el 'id' es único
              inventario={inventario}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventariosActivos;
