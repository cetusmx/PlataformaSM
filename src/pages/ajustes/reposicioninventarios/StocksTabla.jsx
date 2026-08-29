import React, { useState, useEffect, useMemo } from "react";

const CANONICAL = ["almacen", "clave", "max", "min", "rotacion"];

// Tabla reutilizable para Stocks en Almacenes: muestra los datos ya filtrados
// (prop `datos`) con filtros inline en el encabezado (clave = búsqueda de texto,
// almacen/rotacion = selects DISTINCT) y paginación de 10. Los filtros y sus
// opciones son controlados por el padre; la paginación es interna.
const StocksTabla = ({
  datos,
  opcionesAlmacen,
  opcionesRotacion,
  busquedaClave,
  setBusquedaClave,
  filtroAlmacen,
  setFiltroAlmacen,
  filtroRotacion,
  setFiltroRotacion,
}) => {
  const [pagina, setPagina] = useState(1);

  // Reinicia la página cada vez que cambian los datos (nuevo filtro aplicado)
  useEffect(() => {
    setPagina(1);
  }, [datos]);

  const registrosPagina = useMemo(() => {
    const inicio = (pagina - 1) * 10;
    return datos.slice(inicio, inicio + 10);
  }, [datos, pagina]);

  const totalPaginas = Math.max(1, Math.ceil(datos.length / 10));

  return (
    <>
      <div className="ri-tabla-scroll">
        <table className="ri-tabla">
          <thead>
            <tr>
              {CANONICAL.map((col) => (
                <th key={col}>
                  <div className="ri-th-head">
                    <span className="ri-th-label">{col}</span>
                    {col === "clave" && (
                      <input
                        className="ri-th-input"
                        type="text"
                        placeholder="Buscar..."
                        value={busquedaClave}
                        onChange={(e) => setBusquedaClave(e.target.value)}
                      />
                    )}
                    {col === "almacen" && (
                      <select
                        className="ri-th-select ri-th-select-alm"
                        value={filtroAlmacen}
                        onChange={(e) => setFiltroAlmacen(e.target.value)}
                      >
                        <option value="">Todos</option>
                        {opcionesAlmacen.map((op) => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                    )}
                    {col === "rotacion" && (
                      <select
                        className="ri-th-select"
                        value={filtroRotacion}
                        onChange={(e) => setFiltroRotacion(e.target.value)}
                      >
                        <option value="">Todos</option>
                        {opcionesRotacion.map((op) => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {registrosPagina.map((row, i) => (
              <tr key={i}>
                {CANONICAL.map((col) => (
                  <td key={col}>{row[col] ?? ""}</td>
                ))}
              </tr>
            ))}
            {registrosPagina.length === 0 && (
              <tr>
                <td colSpan={CANONICAL.length} className="ri-sin-resultados">
                  No hay registros que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="ri-paginacion">
        <button
          className="ri-btn ri-btn-ghost"
          onClick={() => setPagina((p) => Math.max(1, p - 1))}
          disabled={pagina === 1}
        >
          Anterior
        </button>
        <span className="ri-pagina-info">
          Página {pagina} de {totalPaginas}
        </span>
        <button
          className="ri-btn ri-btn-ghost"
          onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          disabled={pagina === totalPaginas}
        >
          Siguiente
        </button>
      </div>
    </>
  );
};

export default StocksTabla;
