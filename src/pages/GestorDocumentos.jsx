import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BiBuilding, BiUser, BiSpreadsheet, BiFile, BiArrowBack, BiStar } from 'react-icons/bi';
import FacturaXMLEditable from '../components/FacturaXMLEditable';
import OrdenCompraInicial from '../components/OrdenCompraInicial';
import FacturaXMLReutilizable from '../components/FacturaXMLReutilizable';
import GeneradorPedidos from '../components/GeneradorPedidos';
import { DataContext } from '../contexts/dataContext';

const GestorDocumentos = () => {
    const { seccion } = useParams();
    const navigate = useNavigate();
    const activeTab = seccion === 'ventas' ? 'ventas' : 'compras';
    
    const [flujoSeleccionado, setFlujoSeleccionado] = useState(null);

    const { valor2 } = useContext(DataContext);
    const { setContextSidebarNav } = valor2;

    useEffect(() => {
        setContextSidebarNav("Gestor de Documentos");
    }, [setContextSidebarNav, seccion]);

    useEffect(() => {
        setFlujoSeleccionado(null);
    }, [activeTab]);

    const renderContenidoProveedores = () => {
        if (flujoSeleccionado === 'factura') {
            return <FacturaXMLEditable storageKey="reposiciones_progress" />;
        }

        if (flujoSeleccionado === 'inicial') {
            return <OrdenCompraInicial onVolver={() => setFlujoSeleccionado(null)} />;
        }

        if (flujoSeleccionado === 'especial') {
            return <FacturaXMLReutilizable storageKey="pedidos_especiales_progress" />;
        }

        return (
            <div>
                <h4 className="mb-4 text-secondary text-center">
                    Seleccione el tipo de orden de compra
                </h4>
                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="card h-100 shadow-sm interactive-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => setFlujoSeleccionado('factura')} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div className="card-body text-center p-4">
                                <BiSpreadsheet size={50} className="text-primary mb-3" />
                                <h5>Reposición por Factura</h5>
                                <p className="text-muted small">Genera el Layout OC a partir de una factura existente editable.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 shadow-sm interactive-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => setFlujoSeleccionado('inicial')} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div className="card-body text-center p-4">
                                <BiFile size={50} className="text-success mb-3" />
                                <h5>Orden de Compra Inicial</h5>
                                <p className="text-muted small">Genera el Layout OC manualmente desde cero.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 shadow-sm interactive-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => setFlujoSeleccionado('especial')} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div className="card-body text-center p-4">
                                <BiStar size={50} className="text-warning mb-3" />
                                <h5>Pedidos Especiales</h5>
                                <p className="text-muted small">Genera el Layout OC a partir de un XML reutilizable.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderContenidoClientes = () => {
        return (
            <div>
                <GeneradorPedidos />
            </div>
        );
    };

    return (
        <div className="container-fluid p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h2 className="text-dark mb-0" style={{ fontWeight: '600' }}>
                    {activeTab === 'compras' ? 'Compras' : 'Ventas'}
                </h2>
                {activeTab === 'compras' && flujoSeleccionado && (
                    <button className="btn btn-outline-secondary btn-sm px-3 shadow-sm" onClick={() => setFlujoSeleccionado(null)}>
                        <BiArrowBack className="me-2" /> Volver a Opciones
                    </button>
                )}
            </div>
            
            <div className="bg-white p-3 rounded shadow-sm border-0">
                {activeTab === 'compras' && renderContenidoProveedores()}
                {activeTab === 'ventas' && renderContenidoClientes()}
            </div>
        </div>
    );
};

export default GestorDocumentos;



