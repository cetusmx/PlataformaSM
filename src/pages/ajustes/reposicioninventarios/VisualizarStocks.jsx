import React, { useState, useEffect, useMemo } from "react";
import Axios from "axios";
import { show_alerta } from "../../../functions";
import StocksTabla from "./StocksTabla";

// Contrato del endpoint (API2):
// GET {REACT_APP_URL_API2}/api/v1/stocks-almacenes?almacen=..&rotacion=..
//   - almacen/rotacion son coincidencia exacta (campos STRING, case-insensitive).
//   - Cualquier combinación (o ninguno) devuelve los registros filtrados.
// Respuesta: { ok, status, body: [ { almacen, clave, max, min, rotacion }, ... ] }
// Nota: almacen/rotacion se filtran en el servidor vía query params; la clave
// se filtra en el cliente (búsqueda parcial) para una mejor experiencia.
const URL_API2 = `${process.env.REACT_APP_URL_API2}/api/v1`;

const VisualizarStocks = () => {
  const [datos, setDatos] = useState([]); // Subconjunto devuelto por el backend
  const [todosDatos, setTodosDatos] = useState([]); // Snapshot completo para opciones de los selects
  const [cargando, setCargando] = useState(false);
  const [busquedaClave, setBusquedaClave] = useState("");
  const [filtroAlmacen, setFiltroAlmacen] = useState("");
  const [filtroRotacion, setFiltroRotacion] = useState("");
  const [refresh, setRefresh] = useState(0);

  // Carga los datos cada vez que cambian los filtros de servidor o se refresca.
  useEffect(() => {
    let cancelado = false;
    const params = new URLSearchParams();
    if (filtroAlmacen) params.append("almacen", filtroAlmacen);
    if (filtroRotacion) params.append("rotacion", filtroRotacion);
    const qs = params.toString();

    (async () => {
      setCargando(true);
      try {
        const res = await Axios.get(
          `${URL_API2}/stocks-almacenes${qs ? `?${qs}` : ""}`
        );
        if (cancelado) return;
        const lista = res.data?.body || [];
        setDatos(lista);
        // Solo actualizamos el snapshot de opciones en la carga completa
        if (!filtroAlmacen && !filtroRotacion) setTodosDatos(lista);
      } catch (err) {
        if (cancelado) return;
        console.error("Error al cargar stocks:", err);
        show_alerta(
          err.response?.data?.message ||
            "Ocurrió un error al cargar los datos del servidor.",
          "error"
        );
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [filtroAlmacen, filtroRotacion, refresh]);

  // La clave se filtra en el cliente (búsqueda parcial)
  const datosTabla = useMemo(() => {
    const b = busquedaClave.trim().toLowerCase();
    if (!b) return datos;
    return datos.filter((r) =>
      String(r.clave ?? "").toLowerCase().includes(b)
    );
  }, [datos, busquedaClave]);

  const opcionesAlmacen = useMemo(
    () =>
      Array.from(
        new Set(
          todosDatos
            .map((r) => String(r.almacen ?? "").trim())
            .filter(Boolean)
        )
      ).sort(),
    [todosDatos]
  );

  const opcionesRotacion = useMemo(
    () =>
      Array.from(
        new Set(
          todosDatos
            .map((r) => String(r.rotacion ?? "").trim())
            .filter(Boolean)
        )
      ).sort(),
    [todosDatos]
  );

  const limpiarFiltros = () => {
    setBusquedaClave("");
    setFiltroAlmacen("");
    setFiltroRotacion("");
  };

  return (
    <div className="ri-visualizar">
      <p className="ri-stocks-descripcion">
        Consulte los stocks de almacén previamente guardados. Utilice los filtros
        para localizar registros por almacén, rotación o clave de producto.
      </p>

      <div className="ri-preview-header">
        <div className="ri-preview-titulo">
          <h5>Stocks guardados ({datosTabla.length} registros)</h5>
          {cargando && (
            <span className="ri-cargando ri-cargando-inline">
              Cargando stocks...
            </span>
          )}
        </div>
        <div className="ri-preview-acciones">
          <button
            className="ri-btn ri-btn-ghost ri-btn-sm"
            onClick={() => setRefresh((r) => r + 1)}
            disabled={cargando}
          >
            Refrescar
          </button>
          {(busquedaClave || filtroAlmacen || filtroRotacion) && (
            <button
              className="ri-btn ri-btn-ghost ri-btn-sm"
              onClick={limpiarFiltros}
              disabled={cargando}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      <StocksTabla
        datos={datosTabla}
        opcionesAlmacen={opcionesAlmacen}
        opcionesRotacion={opcionesRotacion}
        busquedaClave={busquedaClave}
        setBusquedaClave={setBusquedaClave}
        filtroAlmacen={filtroAlmacen}
        setFiltroAlmacen={setFiltroAlmacen}
        filtroRotacion={filtroRotacion}
        setFiltroRotacion={setFiltroRotacion}
      />
    </div>
  );
};

export default VisualizarStocks;
