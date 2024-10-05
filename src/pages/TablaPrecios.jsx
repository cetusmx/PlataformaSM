import React, { useState, useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import Axios from "axios";

const TablaPrecios = (props) => {

  const url = "http://18.224.118.226:3001";
  const [search, setSearch] = useState("");
  const [listaPrecios, setListaPrecios] = useState("");
  console.log("Sucursal:- " + props.sucursal);
  let sucursalConsulta = props.sucursal;

  useEffect(() => {
    if(sucursalConsulta==="Todas"){
      getPreciosTodos();
    }else{
      getPrecios(sucursalConsulta);
    }
    
    console.log("useEffect TablaPrecios");
  }, []);

  let getPrecios = () => {
    Axios.get(url + `/getprecios`, {
      params: {
        sucursal: props.sucursal,
      },
    }).then((response) => {
      setListaPrecios(response.data);
      console.log(response.data);
    });
  };

  let getPreciosTodos = () => {
    Axios.get(url + `/getpreciosall`, {
      params: {
        sucursal: props.sucursal,
      },
    }).then((response) => {
      setListaPrecios(response.data);
      console.log(response.data);
    });
  };

  const buscar = (e) => {
    setSearch(e.target.value);
    console.log(e.target.value);
  };

  //getPrecios();

  return (
    <>
      {/* <div className="content--header--editamars">
        <div className="header--activity">
          <div className="search-box-editmars">
            <input
              type="text"
              placeholder="Buscar"
              onChange={buscar}
              value={search}
            />
            <BiSearch className="icon-1" />
          </div>
        </div>
        {/* <div className="header--activity-file">
                Carga masiva:
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                />
              </div> }
      </div> */}
      <div className="tablaDatos">
      {listaPrecios?.length > 0 && (
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
            {listaPrecios.map((val, key) => {
              return (
                <tr key={val.id}>
                  {/* <th scope="col">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="allSelect"
                      onChange = {handleChange} 
                    />
                  </th> */}
                  <td>{val.clave}</td>
                  <td>{val.precio}</td>
                  <td>{val.precioIVA}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      </div>
    </>
  );
};

export default TablaPrecios;
