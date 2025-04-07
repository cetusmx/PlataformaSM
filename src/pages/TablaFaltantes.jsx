import React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

const columns = [
    { id: "cantidad", label: "Cantidad", minWidth: 100, align: "center" },
    { id: "clave", label: "Clave", minWidth: 120, align: "center" },
    { id: "observaciones", label: "Observaciones", minWidth: 120, align: "left" },
    {
      id: "sucursal",
      label: "Sucursal",
      minWidth: 100,
      align: "center",
      /* format: (value) => value.toLocaleString("en-US"), */
    },
    {
      id: "fecha",
      label: "Fecha",
      minWidth: 120,
      align: "left",
      /* format: (value) => value.toFixed(2), */
    },
  ];

const TablaFaltantes = ({ rows }) => {

    const [page, setPage] = React.useState(0);
      const [rowsPerPage, setRowsPerPage] = React.useState(6);
    
      const handleChangePage = (event, newPage) => {
        setPage(newPage);
      };
    
      const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
      };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", fontSize: "0.7rem" }}>
      <TableContainer sx={{ maxHeight: "66vh" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead sx={{fontSize: "1rem", fontWeight: 500}}>
            <TableRow sx={{marginTop: "-3px", paddingTop: "-3px"}}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format && typeof value === "number"
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[6]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={"Filas por página"}
        labelDisplayedRows={ (from=page) => `${from.from}-${from.to === -1 ? from.count : from.to} de ${from.count}` }
      />
    </Paper>
  )
}

export default TablaFaltantes