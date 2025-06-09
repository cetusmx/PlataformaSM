// src/components/InventarioNavBar.js
import React, { useState } from 'react';
import './InventarioNavBar.css'; // Archivo CSS para los estilos

const InventarioNavBar = ({ onSelectTab }) => {
  const [activeTab, setActiveTab] = useState('activos'); // Estado para la pestaña activa

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    onSelectTab(tabName); // Llama a la función prop para comunicar el cambio al componente padre
  };

  return (
    <div className="inventario-nav-bar">
      <button
        className={`nav-tab ${activeTab === 'activos' ? 'active' : ''}`}
        onClick={() => handleTabClick('activos')}
      >
        Inventarios Activos
      </button>
      <button
        className={`nav-tab ${activeTab === 'en-conteo' ? 'active' : ''}`}
        onClick={() => handleTabClick('en-conteo')}
      >
        Inventarios en Conteo
      </button>
      <button
        className={`nav-tab ${activeTab === 'subir' ? 'active' : ''}`}
        onClick={() => handleTabClick('subir')}
      >
        Subir Inventario
      </button>
      {/* La pestaña de "Detalle de Inventarios" no es un tab fijo. 
        Se accederá a ella desde las vistas de "Activos" o "En Conteo".
        Podrías considerar un botón "Volver" dentro del componente DetalleInventario.
      */}
    </div>
  );
};

export default InventarioNavBar;