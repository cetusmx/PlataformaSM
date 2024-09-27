import { useState, useEffect } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { show_alerta } from "../functions";
import { Nav } from "../components/Nav";

 const Editamars = () => {
  const url = "https://servcotiza.onrender.com/actualiza";
  //const url = "http://localhost:3001/actualiza";
  const [family, setFamily] = useState("");
  const [margenes, setMargenes] = useState([]);
  const [margenesPivote, setMargenesPivote] = useState([]);
  const [margenDurango, setMargenDurango] = useState("");
  const [margenDurangoOld, setMargenDurangoOld] = useState("");
  const [margenFresnillo, setMargenFresnillo] = useState("");
  const [margenFresnilloOld, setMargenFresnilloOld] = useState("");
  const [margenMazatlan, setMargenMazatlan] = useState("");
  const [margenMazatlanOld, setMargenMazatlanOld] = useState("");
  const [margenZacatecas, setMargenZacatecas] = useState("");
  const [margenZacatecasOld, setMargenZacatecasOld] = useState("");
  const [margenTecmin, setMargenTecmin] = useState("");
  const [margenTecminOld, setMargenTecminOld] = useState("");
  const [title, setTitle] = useState("1");
  const [operation, setOperation] = useState("");

  useEffect(() => {
    // Agrega opciones al Select cuando carga la página por primera vez
    getMargenes();
    console.log("Dentro UseEffect");
  }, []);

  const getMargenes = () => {
    Axios.get("https://servcotiza.onrender.com/margenes").then((response) => {
      setMargenes(response.data);
      let hashMap = new Map();
      response.data.map((val) => {
        if (!hashMap.has(val.familia)) {
          let arr = [val.sucursal + "-" + val.margen];
          hashMap.set(val.familia, arr);
        } else {
          let arre = hashMap.get(val.familia);
          arre.push(val.sucursal + "-" + val.margen);
          hashMap.set(val.familia, arre);
        }
        /* fin conversion hashmap */
        return hashMap;
      });

      /* console.log("Contenido hashMap ");
      hashMap.forEach((value,key)=>{
        console.log(key+"->"+value);
      }); */

      let arreglo = new Array([]);

      hashMap.forEach((value, key) => {
        let family = { familia: key };

        value.forEach((numero) => {
          //sucursales con margen
          if (typeof numero === "string") {
            let arri = numero.split("-");
            let sucu = arri[0];
            let margi = arri[1];

            if (sucu === "Durango") {
              const temp = { Durango: margi };
              family = Object.assign({}, family, temp);
            }
            if (sucu === "Fresnillo") {
              const temp = { Fresnillo: margi };
              family = Object.assign({}, family, temp);
            }
            if (sucu === "Mazatlán") {
              const temp = { Mazatlán: margi };
              family = Object.assign({}, family, temp);
            }
            if (sucu === "Zacatecas") {
              const temp = { Zacatecas: margi };
              family = Object.assign({}, family, temp);
            }
            if (sucu === "Tecmin") {
              const temp = { Tecmin: margi };
              family = Object.assign({}, family, temp);
            }
          }
        });
        if (Object.keys(family).length !== 0) {
          arreglo.push(family);
        }
      });
      arreglo.shift();
      //console.log(arreglo);
      setMargenesPivote(arreglo);
    });
  };

  const openModal = (op, familia, dur, fres, maza, zaca, tecm) => {
    setFamily("");
    setMargenDurango("");
    setMargenDurangoOld("");
    setMargenFresnillo("");
    setMargenFresnilloOld("");
    setMargenMazatlan("");
    setMargenMazatlanOld("");
    setMargenZacatecas("");
    setMargenZacatecasOld("");
    setMargenTecmin("");
    setMargenTecminOld("");
    setOperation(op);
    if (op === 1) {
      setTitle("Editar Margen");
      setFamily(familia);
      setMargenDurango(dur);
      setMargenDurangoOld(dur);
      setMargenFresnillo(fres);
      setMargenFresnilloOld(fres);
      setMargenMazatlan(maza);
      setMargenMazatlanOld(maza);
      setMargenZacatecas(zaca);
      setMargenZacatecasOld(zaca);
      setMargenTecmin(tecm);
      setMargenTecminOld(tecm);
    }
    window.setTimeout(function () {
      document.getElementById("dgo").focus();
    }, 500);
  };

  const validar = () => {
    var parametros;
    var metodo;
    if (margenDurango.trim() === "") {
      show_alerta("Escribe un margen para Durango", "warning");
    } else if (margenFresnillo.trim() === "") {
      show_alerta("Escribe un margen para Fresnillo", "warning");
    } else if (margenMazatlan.trim() === "") {
      show_alerta("Escribe un margen para Mazatlán", "warning");
    } else if (margenZacatecas.trim() === "") {
      show_alerta("Escribe un margen para Zacatecas", "warning");
    } else if (margenTecmin.trim() === "") {
      show_alerta("Escribe un margen para Tecmin", "warning");
    } else {
      if (operation === 1) {
        let cambiaron = new Array([]);
        if (margenDurango !== margenDurangoOld) {
          cambiaron.push("Durango");
        }
        if (margenFresnillo !== margenFresnilloOld) {
          cambiaron.push("Fresnillo");
        }
        if (margenMazatlan !== margenMazatlanOld) {
          cambiaron.push("Mazatlán");
        }
        if (margenZacatecas !== margenZacatecasOld) {
          cambiaron.push("Zacatecas");
        }
        if (margenTecmin !== margenTecminOld) {
          cambiaron.push("Tecmin");
        }
        cambiaron.shift();

        parametros = {
          fa: family.trim(),
          du: margenDurango.trim(),
          fr: margenFresnillo.trim(),
          ma: margenMazatlan.trim(),
          za: margenZacatecas.trim(),
          te: margenTecmin.trim(),
          cambios: cambiaron,
        };
        metodo = "PUT";
      }
      enviarSolicitud(metodo, parametros);
      document.getElementById("btnCerrar").click();
      getMargenes();
    }
  };

  const enviarSolicitud = async (metodo, parametros) => {
    await Axios({ method: metodo, url: url, data: parametros })
      .then(function (respuesta) {
        var tipo = respuesta.status;
        console.log(tipo);
        if (tipo === 200) {
          show_alerta("Actualizado exitósamente", "success");
        } else {
          show_alerta("Hubo un problema", "error");
        }
        
        if (tipo === 200) {
          document.getElementById("btnCerrar").click();
          getMargenes();
          console.log("despues de getMargenes");
        }
      })
      .catch(function (error) {
        show_alerta("Error en la solicitud de escritura", "error");
        //console.log(error);
      });
  };

  return (
    <>
      <div className="row">
        </div>
      <div className="container-fluid">
        <div className="row mt-3">
          <div className="col-12 col-lg-10 offset-0 offset-lg-1">
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Familia</th>
                    <th>Durango</th>
                    <th>Fresnillo</th>
                    <th>Mazatlán</th>
                    <th>Zacatecas</th>
                    <th>Tecmin</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="=table-group-divider">
                  {margenesPivote.map((margenes, i) => (
                    <tr key={margenes.familia}>
                      <td>{i + 1}</td>
                      <td>{margenes.familia}</td>
                      <td>{margenes.Durango}</td>
                      <td>{margenes.Fresnillo}</td>
                      <td>{margenes.Mazatlán}</td>
                      <td>{margenes.Zacatecas}</td>
                      <td>{margenes.Tecmin}</td>
                      <td>
                        <button
                          onClick={() =>
                            openModal(
                              1,
                              margenes.familia,
                              margenes.Durango,
                              margenes.Fresnillo,
                              margenes.Mazatlán,
                              margenes.Zacatecas,
                              margenes.Tecmin
                            )
                          }
                          className="btn btn-warning"
                          data-bs-toggle="modal"
                          data-bs-target="#modalEdicion"
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                        &nbsp;
                        <button className="btn btn-danger">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div id="modalEdicion" className="modal fade" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <div className="container-fluid">
                <div className="row pb-2">
                  <label className="h5">{title}</label>
                </div>
                <div className="row">
                  <div className="col-md-8 offset-md-4">
                    <label className="h6">Familia: {family}</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <input type="hidden" id="id"></input>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-map-marker me-2"></i>
                  <div style={{ width: "100px" }}>Durango</div>
                </span>
                <input
                  type="text"
                  id="dgo"
                  className="form-control"
                  placeholder="Margen"
                  value={margenDurango}
                  onChange={(e) => setMargenDurango(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-map-marker me-2"></i>
                  <div style={{ width: "100px" }}>Fresnillo</div>
                </span>
                <input
                  type="text"
                  id="fllo"
                  className="form-control"
                  placeholder="Margen"
                  value={margenFresnillo}
                  onChange={(e) => setMargenFresnillo(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-map-marker me-2"></i>
                  <div style={{ width: "100px" }}>Mazatlán</div>
                </span>
                <input
                  type="text"
                  id="mzt"
                  className="form-control"
                  placeholder="Margen"
                  value={margenMazatlan}
                  onChange={(e) => setMargenMazatlan(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-map-marker me-2"></i>
                  <div style={{ width: "100px" }}>Zacatecas</div>
                </span>
                <input
                  type="text"
                  id="zac"
                  className="form-control"
                  placeholder="Margen"
                  value={margenZacatecas}
                  onChange={(e) => setMargenZacatecas(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-industry me-2"></i>
                  <div style={{ width: "100px" }}>Tecmin</div>
                </span>
                <input
                  type="text"
                  id="tecmin"
                  className="form-control"
                  placeholder="Margen"
                  value={margenTecmin}
                  onChange={(e) => setMargenTecmin(e.target.value)}
                ></input>
              </div>
              <div className="d-grid col-6 mx-auto">
                <button onClick={() => validar()} className="btn btn-success">
                  <i className="fa-solid fa-floppy-disk mx-2"></i>Guardar
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button
                id="btnCerrar"
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Editamars
