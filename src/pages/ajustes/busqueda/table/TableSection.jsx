import React from "react";
import TableRow from "./TableRow";
import ExpendableButton from "./ExpendableButton";
import useOpenController from "./hooks/useOpenController";

const TableSection = ({ producto, index }) => {
  const { isOpenNew, toggle } = useOpenController(false);
  return (
    <tbody style={{ paddingTop: "20px" }}>
      <tr>
        <td className="td-center-buscadorUI">
          <ExpendableButton isOpenNew={isOpenNew} toggle={toggle} />
        </td>
        <td className="td-center-buscadorUI">
          <img
            src={`${process.env.PUBLIC_URL}/Perfiles/${producto.linea}.jpg`}
            alt="logo"
            className="img-fluid rounded-start imagen-busqueda-ui"
          />
        </td>
        <td className="td-center-buscadorUI">{producto.clave}</td>
        <td className="td-center-buscadorUI">{producto.linea}</td>
        <td className="td-center-buscadorUI">{producto.diametrointerior}</td>
        <td className="td-center-buscadorUI">{producto.diametroexterior}</td>
        <td className="td-center-buscadorUI">{producto.altura}</td>
        <td className="td-center-buscadorUI">{producto.marca}</td>
        <td className="td-center-buscadorUI">{producto.perfil}</td>
      </tr>
      {isOpenNew && <TableRow producto={producto} />}
    </tbody>
  );
};

export default TableSection;
