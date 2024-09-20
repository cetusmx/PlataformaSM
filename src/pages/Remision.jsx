import React, { useState, useContext, useEffect } from "react";
import Axios from "axios";
import { DataContext } from "../contexts/dataContext";
import "../styles/precios.css";
import { BiTrash } from "react-icons/bi";

const Remision = () => {
  useEffect(() => {
    // Agrega opciones al Select cuando carga la página por primera vez
    getPrecios();
    console.log("Dentro UseEffect Precios");
  }, []);

  /* const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]); */
  const [value, setValue] = useState("");

  const [preciosList, setPreciosList] = useState([]);
  const [partidas, setPartidas] = useState([]);
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("0");
  const [totalCab, setTotalCab] = useState("0");
  const [subtotal, setSubtotal] = useState(0);
  const [totalCIva, setTotalCIva] = useState("0");

  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;
  const { contextsideBarNav, setContextSidebarNav } = valor2;
  const infoUsuario = contextData;

  let getPrecios = () => {
    Axios.get(`https://servcotiza.onrender.com/getprecios`, {
      params: {
        sucursal: infoUsuario.sucursal,
      },
    }).then((response) => {
      setPreciosList(response.data);
      console.log(response.data);
    });
  };

  const onChange = (event) => {
    setValue(event.target.value);
  };

  const onSearch = (searchTerm) => {
    setValue(searchTerm);
    const filtrado = preciosList.filter((item) =>
      item.clave.toUpperCase().includes(searchTerm.toUpperCase())
    );
    const precio_ = filtrado.map((item) => item.precio);
    const totalInp = qty * precio_;
    setTotalCab(totalInp);
    setPrice(precio_);
  };

  const agregarPartida = () => {
    const partida = [{
      cantidad: qty,
      clave: value,
      precio: price[0],
      total: totalCab,
    }];
    //console.log("Partida => " + partida);
    const partidasTemp = partidas.concat(partida);
    console.log(partidasTemp);
    setPartidas(partidasTemp);

    let sumaSubtotal = 0;
    sumaSubtotal = partidasTemp.reduce((previo, actual)=> {
      return previo + actual.total;
    }, 0);

    let totalTabla = 0;
    totalTabla= (sumaSubtotal*1.16).toFixed(2);
    setTotalCIva(new Intl.NumberFormat("es-MX", {style: "currency", currency: "MXN"}).format(totalTabla));

    setSubtotal("0");
    setSubtotal(new Intl.NumberFormat("es-MX", {style: "currency", currency: "MXN"}).format(sumaSubtotal.toFixed(2)));
    console.log(sumaSubtotal.toFixed(2));

    setQty("1");
    setValue("");
    setPrice("");
    setTotalCab("");
  };

  const borrar = (item) => {
    const resultado = partidas.filter(partida => partida.clave !== item.clave);
    setPartidas(resultado);
    console.log(resultado);


    let sumaSubtotal = 0;
    sumaSubtotal = resultado.reduce((previo, actual)=> {
      return previo + actual.total;
    }, 0);

    setSubtotal("0");
    setSubtotal(new Intl.NumberFormat("es-MX", {style: "currency", currency: "MXN"}).format(sumaSubtotal.toFixed(2)));

    let totalTabla = 0;
    totalTabla= (sumaSubtotal*1.16).toFixed(2);
    setTotalCIva(new Intl.NumberFormat("es-MX", {style: "currency", currency: "MXN"}).format(totalTabla));
  }

  return (
    <>
      {/* <div>Precios</div> */}
      <div className="preciosDiv">
        <div className="row posicion">
          <div className="col-2"></div>
          <div className="col-8">
            {/* <h6>Consulta precios</h6> */}
            <div
              className="row"
              style={{
                fontSize: "0.8rem",
                padding: "5px 0 5px 0",
                borderTop: "2px solid #dde6ed",
                borderBottom: "1px solid #dde6ed",
              }}
            >
              <div className="col-2">
                <h7>Cant</h7>
                <input
                  value={qty}
                  onChange={(event) => {
                    setQty(event.target.value);
                    setTotalCab(event.target.value * price);
                  }}
                  type="text"
                  className="form-control"
                  id="cantidad"
                />
              </div>
              <div className="col-4">
                <h7>Clave prod</h7>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar clave"
                  value={value}
                  onChange={onChange}
                />
                <div className="dropdown">
                  {preciosList
                    .filter((item) => {
                      const searchTerm = value.toLowerCase();
                      const clave = item.clave.toLowerCase();

                      return (
                        searchTerm &&
                        clave.startsWith(searchTerm) &&
                        clave !== searchTerm
                      );
                    })
                    .slice(0, 10)
                    .map((item) => (
                      <div
                        onClick={() => onSearch(item.clave)}
                        className="dropdown-row"
                        key={item.clave}
                      >
                        {item.clave}
                      </div>
                    ))}
                </div>
              </div>
              <div className="col-2">
                <h7>Precio</h7>
                <input
                  value={price}
                  type="text"
                  className="form-control"
                  readOnly="true"
                  id="precio"
                />
              </div>
              <div className="col-2">
                <h7>Total</h7>
                <input
                  value={totalCab}
                  type="text"
                  className="form-control"
                  readOnly="true"
                  id="total"
                />
              </div>
              <div className="col-2">
                <div>Acción</div>
                <button
                  type="button"
                  onClick={()=> {
                    agregarPartida();
                  }}
                  className="btn btn-info"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
          <div className="col-2"></div>
        </div>
        <div className="row tablaRemision">
          {/*********  Partidas ************** */}
          
          <div className="col-2"></div>
          <div className="col-8">
            <div
              className="row"
              style={{
                fontSize: "0.8rem",
                padding: "0px 0 10px 0",
                height: "50vh",
                overflowY: "scroll",
                /* borderTop: "2px solid #dde6ed", */
              }}
            >
              {(partidas?.length>0) &&
          
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Cant</th>
                    <th scope="col">Clave</th>
                    <th scope="col">P Unit</th>
                    <th scope="col">Total</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  {partidas.map((val) => {
                    return (
                      <tr>
                        <td>{val.cantidad}</td>
                        <td>{val.clave}</td>
                        <td>{val.precio}</td>
                        <td>{val.total}</td>
                        <td>
                          <div
                            className="btn-group"
                            role="group"
                            aria-label="Basic example"
                          >
                            <BiTrash className="icon" onClick={()=>borrar(val)}/>
                            {/* <button
                              type="button"
                              onClick={() => {
                                
                              }}
                              className="btn btn-danger"
                            >
                              Eliminar
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
                }
            </div>
          </div>
        <div className="col-2"></div>
        </div>
        <div className="row">
          <div className="col-2"></div>
          <div className="col-2"></div>
          <div className="col-1"></div>
          <div className="col-3 subtotales">
            <div style={{textAlign: "right"}}>
            <table>
              <tr>
                <td style={{fontWeight: "600", textAlign: "right", paddingRight: "7px"}}>Subtotal</td>
                <td style={{textAlign: "right", paddingLeft: "7px"}}>{subtotal}</td>
              </tr>
              <tr>
                <td style={{fontWeight: "600", textAlign: "right", paddingRight: "7px"}}>Total</td>
                <td style={{textAlign: "right", paddingLeft: "7px"}}>{totalCIva}</td>
              </tr>
            </table>
          </div>
          </div>
          <div className="col-2"></div>
          </div>  
      </div>
    </>
  );
};

export default Remision;
