import React, { useEffect, useState } from "react";
import Axios from "axios";
import * as XLSX from "xlsx";
import "../styles/clavesnoregistradas.css";
import { BiDownload } from "react-icons/bi";
import Table from "../components/Table";

const ClavesNoRegistradas = () => {
  const urlServidorAPI = process.env.REACT_APP_URL_API1;
  const urlServidorAPI2 = `${process.env.REACT_APP_URL_API2}/api/v1`;
  const [clavesNoRegistradas, setClavesNoRegistradas] = useState([]);

  const encabezados = [
    { id: "clave", label: "Clave", minWidth: "17%" },
    { id: "claveProveedor", label: "Clave proveedor", minWidth: "18%" },
    { id: "nombre", label: "Proveedor", minWidth: "15%", align: "right" },
    { id: "sucursal", label: "Sucursal", minWidth: "12%", align: "right" },
    { id: "factura", label: "Factura", minWidth: "12%", align: "right" },
    { id: "fecha", label: "Fecha", minWidth: "12%", align: "right" },
    { id: "accion", label: "Marcar", minWidth: "14%", align: "center" },
  ];

  useEffect(() => {
    getClavesNoRegistradas();
  }, []);

  const getClavesNoRegistradas = async () => {
    try {
      const response = await Axios.get(urlServidorAPI + `/getclavesnoreg`);
      // Ordena los datos por la fecha de manera descendente (más reciente primero)
      const sortedData = response.data.sort((a, b) => {
        // Corrección: parsea la fecha manualmente para el formato dd-mm-yyyy
        const [dayA, monthA, yearA] = a.fecha.split('-');
        const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
        
        const [dayB, monthB, yearB] = b.fecha.split('-');
        const dateB = new Date(`${yearB}-${monthB}-${dayB}`);

        return dateB - dateA;
      });
      setClavesNoRegistradas(sortedData);
      console.log(sortedData);
    } catch (error) {
      console.error("Error al obtener las claves no registradas:", error);
    }
  };

  const handleActualizar = async (clave) => {
    const confirmacion = window.confirm(`¿Estás seguro de que deseas actualizar la clave ${clave}?`);
    if (confirmacion) {
      try {
        /* await Axios.put(urlServidorAPI2 + `/products/${encodeURIComponent(clave)}`, { */
        await Axios.put(urlServidorAPI2 + `/products`, {
          estatus: "Actualizado",
          clave: clave,
        });
        setClavesNoRegistradas((prevClaves) =>
          prevClaves.filter((row) => row.clave !== clave)
        );
        alert(`Clave ${clave} actualizada correctamente.`);
      } catch (error) {
        console.error("Error al actualizar el estatus:", error);
        alert("Hubo un error al actualizar el estatus.");
      }
    }
  };

  const descargar = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(clavesNoRegistradas);
    XLSX.utils.book_append_sheet(wb, ws, "clavesNoRegistradas");
    XLSX.writeFile(wb, "clavesnoregistradas.xlsx");
  };

  return (
    <div className="wrapper-noregistradas">
      <div className="encabezado-noregistradas">
        <div className="control-botones-clavesnoreg">
          <div className="borrar">
            <BiDownload className="icon2" onClick={() => descargar()} />
            <h7 id="descargarF" onClick={() => descargar()}>
              Descargar
            </h7>
          </div>
        </div>
      </div>
      <div className="tabla-noregistrada">
        <p>
          La columna Clave fue capturada manualmente durante la recepción de
          mercancía.
        </p>
        <Table data={clavesNoRegistradas} headers={encabezados} onActualizar={handleActualizar} />
      </div>
    </div>
  );
};

export default ClavesNoRegistradas;