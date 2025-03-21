import React, { useState } from "react";

import useTable from "../../hooks/useTable";
import styles from "./tablefooter/table.module.css"
import TableFooter from "./tablefooter";

const Table = ({ data, rowsPerPage }) => {

    const [page, setPage] = useState(1);
  const { slice, range } = useTable(data, page, rowsPerPage);

  return (
    <>
      <table className={styles.table}>
        <thead className={styles.tableRowHeader}>
          <tr>
            <th className={styles.tableHeader}>Clave</th>
            <th className={styles.tableHeader}>Clave proveedor</th>
            <th className={styles.tableHeader}>Proveedor</th>
            <th className={styles.tableHeader}>Sucursal</th>
            <th className={styles.tableHeader}>Factura</th>
            <th className={styles.tableHeader}>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {slice.map((el) => (
            <tr className={styles.tableRowItems} key={el.factura}>
              <td className={styles.tableCell}>{el.clave}</td>
              <td className={styles.tableCell}>{el.claveProveedor}</td>
              <td className={styles.tableCell}>{el.nombre}</td>
              <td className={styles.tableCell}>{el.sucursal}</td>
              <td className={styles.tableCell}>{el.factura}</td>
              <td className={styles.tableCell}>{el.fecha}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <TableFooter range={range} slice={slice} setPage={setPage} page={page} />
    </>
  );
};

export default Table;