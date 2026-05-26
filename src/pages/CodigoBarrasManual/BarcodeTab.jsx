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
        <label for="exampleFormControlInput1">Cantidad etiquetas</label>
        <input
          value={qty}
          onChange={(event) => onQtyChange(event.target.value)}
          type="text"
          className="form-control"
          id="exampleFormControlInput1"
          placeholder="Ingrese cantidad"
          style={{ width: "160px" }}
        ></input>
      </div>
      <div className="claveProd">
        <label for="exampleFormControlInput1">Clave producto</label>
        <input
          value={value}
          onChange={onValueChange}
          type="text"
          className="form-control"
          id="exampleFormControlInput1"
          placeholder="Ingrese clave producto"
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
          style={{ width: "130px", marginRight: "10px" }}
          type="button"
          className="btn btn-primary"
          onClick={onAgregar}
        >
          Agregar
        </button>
        <button
          style={{ width: "130px" }}
          type="button"
          className="btn btn-danger"
          onClick={onLimpiar}
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default BarcodeTab;
