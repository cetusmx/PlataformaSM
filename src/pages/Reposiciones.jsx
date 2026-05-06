import React, { useState } from 'react';
import FacturaXMLReutilizable from '../components/FacturaXMLReutilizable';
import OrdenCompraInicial from '../components/OrdenCompraInicial';
import { BiSpreadsheet, BiFile } from 'react-icons/bi';

const Reposiciones = () => {
    const [flujoSeleccionado, setFlujoSeleccionado] = useState(null);

    if (flujoSeleccionado === 'factura') {
        return <FacturaXMLReutilizable storageKey="reposiciones_progress" />;
    }

    if (flujoSeleccionado === 'inicial') {
        return <OrdenCompraInicial onVolver={() => setFlujoSeleccionado(null)} />;
    }

    return (
        <div className="container-fluid p-0">
            <div className="selector-cards-container">
                <h4 className="text-center mb-4">Seleccione el tipo de orden de compra</h4>
                
                <div className="selector-cards">
                    <div 
                        className="selector-card" 
                        onClick={() => setFlujoSeleccionado('inicial')}
                    >
                        <div className="selector-card-icon">
                            <BiSpreadsheet />
                        </div>
                        <h5>Generar OC Inicial</h5>
                        <p className="text-muted">
                            Importe datos desde Excel (Cantidad, Clave, Almacén) para crear una orden de compra inicial. Ideal para reposición de stock inicial.
                        </p>
                        <button className="btn btn-primary w-100">
                            Seleccionar
                        </button>
                    </div>
                    
                    <div 
                        className="selector-card" 
                        onClick={() => setFlujoSeleccionado('factura')}
                    >
                        <div className="selector-card-icon">
                            <BiFile />
                        </div>
                        <h5>Generar modelo de OC a partir de factura</h5>
                        <p className="text-muted">
                            Genere un modelo de documento de orden de compra a partir de una factura XML de proveedor. Processa automáticamente las claves del sistema.
                        </p>
                        <button className="btn btn-primary w-100">
                            Seleccionar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reposiciones;