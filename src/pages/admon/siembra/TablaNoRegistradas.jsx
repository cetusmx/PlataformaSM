import React from "react";
import Table from "../../../components/Table";

const TablaNoRegistradas = ({ rows, onActualizar }) => {
  const encabezados = [
    { id: "clave", label: "Clave", minWidth: "17%" },
    { id: "claveProveedor", label: "Clave proveedor", minWidth: "18%" },
    { id: "nombre", label: "Proveedor", minWidth: "15%", align: "right" },
    { id: "sucursal", label: "Sucursal", minWidth: "12%", align: "right" },
    { id: "factura", label: "Factura", minWidth: "12%", align: "right" },
    { id: "fecha", label: "Fecha", minWidth: "12%", align: "right" },
    { id: "accion", label: "Marcar", minWidth: "14%", align: "center" },
  ];

  return (
    <>
      <Table data={rows} headers={encabezados} onActualizar={onActualizar} />
    </>
  );
};

export default TablaNoRegistradas;