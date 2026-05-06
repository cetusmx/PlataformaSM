import React from "react";

const SoloTextoTab = ({
  qty, value, sugerencias, descripcion,
  onQtyChange, onValueChange, onDescripcionChange,
  onSearch, onAgregar
}) => {
  const handleSelectSugerencia = (item) => {
    onValueChange(item.CLAVE);
    onDescripcionChange(item.DESCRIPCION || "");
    onSearch(item.CLAVE);
  };

  return (
    <div className="formulario">
      <div className="cantidad" style={{ marginRight: "10px" }}>
        <label style={{ fontSize: "1rem" }}># Etiq.</label>
        <input
          value={qty}
          onChange={(e) => onQtyChange(e.target.value)}
          type="text"
          className="form-control"
          style={{ width: "60px" }}
        />
      </div>
      <div className="claveProd" style={{ marginRight: "10px" }}>
        <label style={{ fontSize: "1rem" }}>Clave</label>
        <input
          value={value}
          onChange={onValueChange}
          type="text"
          className="form-control"
          style={{ width: "170px" }}
        />
        {sugerencias.length > 0 && (
          <div className="dropdown" style={{ width: "400px" }}>
            {sugerencias.map((item) => (
              <div
                key={item.CLAVE}
                className="dropdown-row"
                onClick={() => handleSelectSugerencia(item)}
              >
                <div className="suggestion-clave">{item.CLAVE}</div>
                <div className="suggestion-descr">{item.DESCRIPCION}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="descripcion" style={{ marginRight: "10px" }}>
        <label style={{ fontSize: "0.8rem" }}>Descripción</label>
        <input
          value={descripcion}
          onChange={(e) => onDescripcionChange(e.target.value)}
          type="text"
          className="form-control"
          style={{ width: "220px" }}
        />
      </div>
      <div className="div-boton">
        <button type="button" className="btn btn-primary" onClick={onAgregar}>
          Agregar
        </button>
      </div>
    </div>
  );
};

export default SoloTextoTab;
