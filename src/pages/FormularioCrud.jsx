import { useState } from "react"
import Axios from "axios"
import 'bootstrap/dist/css/bootstrap.min.css';

import Swal from 'sweetalert2'
import {Navbar} from '../Navbar';

export const FormularioCrud = () => {

  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState();
  const [pais, setPais] = useState("");
  const [cargo, setCargo] = useState("");
  const [anios, setAnios] = useState();
  const [id, setId] = useState(0);

  const [editar, setEditar] = useState(false);

  const [empleadosList, setEmpleados] = useState([]);

  const add = () => {
    Axios.post("http://localhost:3001/create", {
      nombre: nombre,
      edad: edad,
      pais: pais,
      cargo: cargo,
      anios: anios,
    }).then(() => {
      getEmpleados();
      limpiarCampos();
      Swal.fire({
        title: "<strong>Registro exitoso</strong>",
        html:
          "<i>El empleado <strong>" +
          nombre +
          "</strong> fue guardado exitósamente</i>",
        icon: "success",
        timer: 3000,
      });
    });
  };

  const update = () => {
    Axios.put("http://localhost:3001/update", {
      id: id,
      nombre: nombre,
      edad: edad,
      pais: pais,
      cargo: cargo,
      anios: anios,
    }).then(() => {
      getEmpleados();
      limpiarCampos();
      Swal.fire({
        title: "<strong>Actualización exitosa</strong>",
        html:
          "<i>El empleado <strong>" +
          nombre +
          "</strong> fue actualizado exitósamente</i>",
        icon: "success",
        timer: 3000,
      });
    });
  };

  const deleteEmpleado = (val) => {
    Swal.fire({
      title: "<strong>Confirmar eliminación</strong>",
      html:
        "<i>Realmente desea eliminar al empleado <strong>" +
        val.nombre +
        "</strong>?</i>",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminarlo",
    }).then((res) => {
      if (res.isConfirmed) {
        Axios.delete(`http://localhost:3001/delete/${val.id}`)
          .then(() => {
            getEmpleados();
            limpiarCampos();
            Swal.fire("Eliminado!", val.nombre + " fue eliminado.", "success");
          })
          .catch(function (error) {
            Swal.fire({
              title: "<strong>Oops...</strong>",
              html:
                "<i>No se pudo eliminar al empleado <strong>" +
                nombre +
                "</strong></i>",
              footer:
                JSON.parse(JSON.stringify(error)).message === "Network Error"
                  ? "Intente más tarde"
                  : JSON.parse(JSON.stringify(error)).message,
              icon: "error",
            });
          });
      }
    });
  };

  const editarEmpleado = (val) => {
    setEditar(true);

    setNombre(val.nombre);
    setEdad(val.edad);
    setPais(val.pais);
    setCargo(val.cargo);
    setAnios(val.anios);
    setId(val.id);
  };

  const getEmpleados = () => {
    Axios.get("http://localhost:3001/empleados").then((response) => {
      setEmpleados(response.data);
    });
  };

  const limpiarCampos = () => {
    setAnios("");
    setNombre("");
    setEdad("");
    setPais("");
    setCargo("");
    setEditar(false);
  };

  //getEmpleados();

  return (
    <div className="container">
      <div>
        <Navbar />
      </div>
      <div className="App">
        <div className="lista">
          {/* <button onClick={getEmpleados}>Listar</button> */}
        </div>
      </div>
      <div className="card text-center">
        <div className="card-header">Gestión de empleados</div>
        <div className="card-body">
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text" id="basic-addon1">
                Nombre:
              </span>
            </div>
            <input
              onChange={(event) => {
                setNombre(event.target.value);
              }}
              type="text"
              className="form-control"
              value={nombre}
              placeholder="Ingrese nombre"
              aria-label="Username"
              aria-describedby="basic-addon1"
            />
          </div>

          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text" id="basic-addon1">
                Edad:
              </span>
            </div>
            <input
              value={edad}
              onChange={(event) => {
                setEdad(event.target.value);
              }}
              type="number"
              className="form-control"
              placeholder="Ingrese edad"
              aria-label="Username"
              aria-describedby="basic-addon1"
            />
          </div>

          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text" id="basic-addon1">
                País:
              </span>
            </div>
            <input
              value={pais}
              onChange={(event) => {
                setPais(event.target.value);
              }}
              type="text"
              className="form-control"
              placeholder="Ingrese país"
              aria-label="Username"
              aria-describedby="basic-addon1"
            />
          </div>

          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text" id="basic-addon1">
                Cargo:
              </span>
            </div>
            <input
              value={cargo}
              onChange={(event) => {
                setCargo(event.target.value);
              }}
              type="text"
              className="form-control"
              placeholder="Ingrese cargo"
              aria-label="Username"
              aria-describedby="basic-addon1"
            />
          </div>

          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text" id="basic-addon1">
                Años:
              </span>
            </div>
            <input
              value={anios}
              onChange={(event) => {
                setAnios(event.target.value);
              }}
              type="number"
              className="form-control"
              placeholder="Ingrese antigüedad"
              aria-label="Username"
              aria-describedby="basic-addon1"
            />
          </div>
        </div>
        <div className="card-footer text-muted">
          {editar ? (
            <div>
              <button className="btn btn-warning m-2" onClick={update}>
                Actualizar
              </button>
              <button className="btn btn-info m-2" onClick={limpiarCampos}>
                Cancelar
              </button>
            </div>
          ) : (
            <button className="btn btn-success" onClick={add}>
              Registrar
            </button>
          )}
        </div>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Nombre</th>
            <th scope="col">Edad</th>
            <th scope="col">País</th>
            <th scope="col">Cargo</th>
            <th scope="col">Años</th>
          </tr>
        </thead>
        <tbody>
          {empleadosList.map((val, key) => {
            return (
              <tr key={val.id}>
                <th scope="row">{val.id}</th>
                <td>{val.nombre}</td>
                <td>{val.edad}</td>
                <td>{val.pais}</td>
                <td>{val.cargo}</td>
                <td>{val.anios}</td>
                <td>
                  <div
                    className="btn-group"
                    role="group"
                    aria-label="Basic example"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        editarEmpleado(val);
                      }}
                      className="btn btn-info"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteEmpleado(val);
                      }}
                      className="btn btn-danger"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
