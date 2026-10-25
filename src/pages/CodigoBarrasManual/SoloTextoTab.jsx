import React from "react";

const SoloTextoTab = ({
  qty, value, sugerencias, descripcion,
  onQtyChange, onValueChange, onDescripcionChange,
  onSearch, onAgregar, onLimpiar
}) => {
  const handleSelectSugerencia = (item) => {
    onValueChange(item.CLAVE);
    onDescripcionChange(item.DESCRIPCION || "");
    onSearch(item.CLAVE);
  };

  return (
    <div className="formulario">
      <div className="cantidad" style={{ marginRight: "10px" }}>
        <label className="form-label ec-field-label mb-1"># Etiq.</label>
        <input
          value={qty}
          onChange={(e) => onQtyChange(e.target.value)}
          type="text"
          className="form-control form-control-sm ec-control-sm"
          style={{ width: "65px" }}
        />
      </div>
      <div className="claveProd" style={{ marginRight: "10px" }}>
        <label className="form-label ec-field-label mb-1">Clave</label>
        <input
          value={value}
          onChange={onValueChange}
          type="text"
          className="form-control form-control-sm ec-control-sm"
          placeholder="Ingrese clave"
          style={{ width: "155px" }}
        />
        {sugerencias.length > 0 && (
          <div className="dropdown" style={{ width: "360px" }}>
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
        <label className="form-label ec-field-label mb-1">Descripción</label>
        <input
          value={descripcion}
          onChange={(e) => onDescripcionChange(e.target.value)}
          type="text"
          className="form-control form-control-sm ec-control-sm"
          placeholder="Descripción"
          style={{ width: "200px" }}
        />
      </div>
      <div className="div-boton">
        <button
          style={{ width: "90px", marginRight: "8px" }}
          type="button"
          className="btn btn-sm btn-primary ec-control-sm"
          onClick={onAgregar}
        >
          Agregar
        </button>
        <button
          style={{ width: "90px" }}
          type="button"
          className="btn btn-sm btn-danger ec-control-sm"
          onClick={onLimpiar}
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default SoloTextoTab;
