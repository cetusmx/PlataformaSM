import React from "react";

const BarcodeTab = ({
  qty,
  value,
  sugerencias,
  setDescripcion,
  onQtyChange,
  onValueChange,
  onSearch,
  onAgregar,
  onLimpiar,
}) => {
  return (
    <div className="formulario">
      <div className="cantidad">
        <label className="form-label ec-field-label mb-1" htmlFor="inputCantidadBarcode">
          Cantidad etiquetas
        </label>
        <input
          value={qty}
          onChange={(event) => onQtyChange(event.target.value)}
          type="text"
          className="form-control form-control-sm ec-control-sm"
          id="inputCantidadBarcode"
          placeholder="Ingrese cantidad"
          style={{ width: "135px" }}
        />
      </div>
      <div className="claveProd">
        <label className="form-label ec-field-label mb-1" htmlFor="inputClaveBarcode">
          Clave producto
        </label>
        <input
          value={value}
          onChange={onValueChange}
          type="text"
          className="form-control form-control-sm ec-control-sm"
          id="inputClaveBarcode"
          placeholder="Ingrese clave producto"
          style={{ width: "185px" }}
        />
        {sugerencias.length > 0 && (
          <div className="dropdown">
            {sugerencias.map((item) => (
              <div
                key={item.CLAVE}
                className="dropdown-row"
                onClick={() => {
                  onValueChange({ target: { value: item.CLAVE } });
                  setDescripcion(item.DESCRIPCION || "");
                  onSearch(item.CLAVE);
                }}
              >
                <div className="suggestion-clave">{item.CLAVE}</div>
                <div className="suggestion-descr">{item.DESCRIPCION}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="div-boton">
        <button
          style={{ width: "95px", marginRight: "8px" }}
          type="button"
          className="btn btn-sm btn-primary ec-control-sm"
          onClick={onAgregar}
        >
          Agregar
        </button>
        <button
          style={{ width: "95px" }}
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

export default BarcodeTab;
