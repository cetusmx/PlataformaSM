import React, { useState } from "react";
import StocksEnAlmacenes from "./StocksEnAlmacenes";
import "../../../styles/reposicioninventarios.css";

const SUBMODULOS = [
  { id: "stocks", label: "Stocks en Almacenes" },
];

const ReposicionInventarios = () => {
  const [active, setActive] = useState(SUBMODULOS[0].id);

  return (
    <div className="reposicion-inventarios">
      <div className="ri-bienvenida">
        <p>
          Bienvenido al módulo de Reposición de Inventarios. Aquí podrá gestionar
          las herramientas de control y abastecimiento de mercancía por almacén.
        </p>
      </div>

      <div className="ri-subnav">
        {SUBMODULOS.map((sub) => (
          <button
            key={sub.id}
            className={`ri-subnav-btn ${active === sub.id ? "active" : ""}`}
            onClick={() => setActive(sub.id)}
          >
            {sub.label}
          </button>
        ))}
      </div>

      <div className="ri-contenido">
        {active === "stocks" && <StocksEnAlmacenes />}
      </div>
    </div>
  );
};

export default ReposicionInventarios;
