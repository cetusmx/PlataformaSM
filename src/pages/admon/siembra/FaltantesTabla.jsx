import React, { useEffect, useState } from "react";
import Axios from "axios";
import Table from "../siembra/table"
import * as XLSX from "xlsx";

import { BiDownload } from "react-icons/bi";
import TablaFaltantes from "../../TablaFaltantes";

const FaltantesTabla = () => {

  const [data, setData] = useState([]);
  const urlServidorAPI = "http://18.224.118.226:3001";

  useEffect(() => {
    // Agrega opciones al Select cuando carga la página por primera vez
    getSolicitudes();
    console.log("Dentro UseEffect");
  }, []);

  const getSolicitudes = () => {
    Axios.get(urlServidorAPI + "/getSolSiembra").then((response) => {
      setData(response.data);
    });
  };

  const descargar = () => {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "faltantes");
      XLSX.writeFile(wb, "faltantes.xlsx");
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
          {/* <Table data={data} rowsPerPage={9} /> */}
          <TablaFaltantes rows={data} />
        </div>
      </div>
    );
};

export default FaltantesTabla;
