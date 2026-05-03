import React from 'react';
import FacturaXMLReutilizable from '../components/FacturaXMLReutilizable';

const PedidosEspeciales = () => {
    return (
        <div className="container-fluid p-0">
            <FacturaXMLReutilizable storageKey="pedidos_especiales_progress" />
        </div>
    );
};

export default PedidosEspeciales;
