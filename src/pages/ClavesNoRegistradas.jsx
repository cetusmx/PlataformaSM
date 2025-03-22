import React, { useEffect, useState } from "react";
import Axios from "axios";
import Table from "../components/table";
import * as XLSX from "xlsx";
import "../styles/clavesnoregistradas.css";
import { BiDownload } from "react-icons/bi";

const ClavesNoRegistradas = () => {
  const urlServidorAPI = "http://18.224.118.226:3001";
  const [clavesNoRegistradas, setClavesNoRegistradas] = useState([]);

  useEffect(() => {
    getClavesNoRegistradas();
  }, []);

  const getClavesNoRegistradas = async () => {
    await Axios.get(urlServidorAPI + `/getclavesnoreg`).then((response) => {
      setClavesNoRegistradas(response.data);
      console.log(response.data);
    });
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
              <h7 id="descargarF" onClick={()=>descargar()} >Descargar</h7>
          </div>
        </div>
      </div>
      <div className="tabla-noregistrada">
        <Table data={clavesNoRegistradas} rowsPerPage={9} />
      </div>
    </div>
  );
};

export default ClavesNoRegistradas;
