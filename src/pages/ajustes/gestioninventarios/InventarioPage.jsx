// src/pages/InventariosPage.js
import React, { useState } from 'react';
import InventarioNavBar from './InventarioNavBar';
import InventariosActivos from './InventariosActivos'; // Importa el nuevo componente
import "./InventarioPage.css";
// import InventariosEnConteo from '../components/InventariosEnConteo';
// import SubirInventario from '../components/SubirInventario';
// import DetalleInventario from '../components/DetalleInventario';

const InventariosPage = () => {
  const [currentView, setCurrentView] = useState('activos'); // Estado para la vista actual
  const [selectedInventarioId, setSelectedInventarioId] = useState(null); // Para ver detalles

  const handleTabChange = (tabName) => {
    setCurrentView(tabName);
    setSelectedInventarioId(null); // Resetea el ID al cambiar de pestaña
  };

  const handleViewDetails = (inventarioId) => {
    setSelectedInventarioId(inventarioId);
    setCurrentView('detalle'); // Cambia a la vista de detalle
  };

  const renderContent = () => {
    switch (currentView) {
      case 'activos':
        return <InventariosActivos onViewDetails={handleViewDetails} />; // Pasa la función onViewDetails
      case 'en-conteo':
        // return <InventariosEnConteo onViewDetails={handleViewDetails} />;
        return <div>Contenido de Inventarios en Conteo</div>; // Placeholder
      case 'subir':
        // return <SubirInventario />;
        return <div>Contenido para Subir Inventario</div>; // Placeholder
      case 'detalle':
        // return <DetalleInventario inventarioId={selectedInventarioId} onBack={() => setCurrentView('activos')} />;
        return (
          <div>
            <h2>Detalle del Inventario: {selectedInventarioId}</h2>
            <button onClick={() => setCurrentView('activos')}>Volver a Inventarios Activos</button>
            {/* Aquí iría el contenido detallado del inventario */}
          </div>
        );
      default:
        return <InventariosActivos onViewDetails={handleViewDetails} />;
    }
  };

  return (
    <div className="inventarios-management-container">
      <InventarioNavBar onSelectTab={handleTabChange} />
      <div className="inventarios-content-area">
        {renderContent()}
      </div>
    </div>
  );
};

export default InventariosPage;