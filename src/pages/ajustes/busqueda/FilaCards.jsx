import React from "react";
import Card from "./Card";

const FilaCards = ({ filaProds }) => {
  return (
    <>
      <ul
        class="list-group list-group-horizontal"
        style={{ width: "100%", padding: "5px 0 5px 0" }}
      >
        {filaProds.map((product) => (
          <li
            key={product.clave}
            /*  className="list-group-item" */
            style={{ width: "100%" }}
          >
            <Card producto={product} />
          </li>
        ))}
      </ul>
    </>
  );
};

export default FilaCards;
