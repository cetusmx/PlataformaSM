import React, { useState } from 'react';
import '../styles/table.css';

const Table = ({ data, headers, onActualizar }) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 10; // Puedes ajustar el número de filas por página aquí

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const visibleRows = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const buttonStyle = {
    minWidth: 0,
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    margin: '3px 10px',
    padding: '8px 12px',
    border: '1px solid #ccc',
    backgroundColor: '#f9f9f9',
    fontSize: '0.7em',
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    cursor: 'not-allowed',
    opacity: 0.5
  };

  const actionButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '4px 10px',
    fontSize: '1em',
    border: 'none',
  };

  return (
    <div className="table-container" style={{ height: '68vh', overflowY: 'auto' }}>
      <table style={{ marginBottom: '10px' }}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header.id} style={{ paddingTop: '5px', paddingBottom: '5px', fontSize: '0.8em', width: header.minWidth }}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header.id} style={{ textAlign: header.align, fontSize: '0.75em', width: header.minWidth }}>
                  {header.id === "accion" ? (
                    <button style={actionButtonStyle} onClick={() => onActualizar(row.clave)}>
                      Actualizado
                    </button>
                  ) : (
                    row[header.id]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-controls">
        <button
          onClick={() => handleChangePage(page - 1)}
          disabled={page === 0}
          style={page === 0 ? disabledButtonStyle : buttonStyle}
        >
          Anterior
        </button>
        <span style={{fontSize: '0.7em'}}>
          Página {page + 1} de {totalPages}
        </span>
        <button
          onClick={() => handleChangePage(page + 1)}
          disabled={page >= totalPages - 1}
          style={page >= totalPages - 1 ? disabledButtonStyle : buttonStyle}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Table;