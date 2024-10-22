import React, { useState, useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import Axios from "axios";
import { Spinner } from "react-bootstrap";

const TablaPrecios = (props) => {
  const url = "http://18.224.118.226:3001";
  const [searchList, setSearchList] = useState("");
  const [listaPrecios, setListaPrecios] = useState("");
  console.log("Sucursal:- " + props.sucursal);
  let sucursalConsulta = props.sucursal;

  const [claveBuscada, setClaveBuscada] = useState("");
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (sucursalConsulta === "Todas") {
      getPreciosTodos();
    } else {
      getPrecios(sucursalConsulta);
    }
    setClaveBuscada("");
    console.log("useEffect TablaPrecios");
    setIsFetching(true);
    console.log(isFetching);
    setSearchList([]);
  }, [sucursalConsulta]);

  /* useEffect(() => {
    console.log("UseEffect actualiza búsqueda");
    onChange(claveBuscada);
  },[claveBuscada]) */

  let getPrecios = () => {
    Axios.get(url + `/getprecios`, {
      params: {
        sucursal: props.sucursal,
      },
    }).then((response) => {
      setListaPrecios(response.data);
      setSearchList(response.data);
      console.log(response.data);
      setIsFetching(false);
    });
  };

  let getPreciosTodos = () => {
    Axios.get(url + `/getpreciosall`, {
      params: {
        sucursal: props.sucursal,
      },
    }).then((response) => {
      setListaPrecios(response.data);
      setSearchList(response.data);
      console.log(response.data);
      setIsFetching(false);
    });
  };

  const onChange = (event) => {
    setClaveBuscada(event.target.value);
    // Filter data based on search term
    setSearchList(
      listaPrecios
        .filter((item) =>
          item.clave.toUpperCase().includes(event.target.value.toUpperCase())
        )
        .slice(0, 10)
    );
  };

  return (
    <>
      <div className="header--activity">
        <div className="search-box">
          <input
            value={claveBuscada}
            onChange={onChange}
            type="text"
            placeholder="Buscar"
          />
          <BiSearch style={{ color: "#969393", fontSize: "1.4rem" }} />
        </div>
      </div>
      <div className="tablaDatos">
        {isFetching && (
          <div sx={{ display: "flex", justifyContent: "center" }} 
          style={{width: "50%", margin: "18vh 0 0 44vh"}}>
            <Spinner animation="border" role="status">
              {" "}
              <span className="visually-hidden">Cargando...</span>{" "}
            </Spinner>
          </div>
        )}
        {listaPrecios?.length > 0 && !isFetching && (
          <table
            className="table table-striped"
            style={{ padding: "3px", autoHeight: true, fontSize: "0.8rem" }}
          >
            <thead>
              <tr style={{ padding: "3px" }}>
                <th scope="col">Clave</th>
                <th scope="col">Precio</th>
                <th scope="col">Precio c/IVA</th>
              </tr>
            </thead>
            <tbody>
              {searchList.map((val, key) => {
                return (
                  <tr key={val.id}>
                    <td>{val.clave}</td>
                    <td>{val.precio}</td>
                    <td>{val.precioIVA}</td>
                  </tr>
                );
              }).slice(0,10)}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default TablaPrecios;
