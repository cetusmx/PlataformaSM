import React, { useState, useEffect, useRef, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Axios from "axios";
import "../styles/codigobarras.css";
import { 
  BiXCircle, 
  BiRefresh, 
  BiSearch, 
  BiCheckDouble, 
  BiCheckCircle, 
  BiBarcode, 
  BiCommentDetail 
} from "react-icons/bi";
import Swal from "sweetalert2";

import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Barcode from "react-barcode";
import { useReactToPrint } from "react-to-print";
import CodeBarPrint from "./CodeBarPrint";
import { CiBarcode } from "react-icons/ci";
import { show_alerta } from "../functions";
import { DataContext } from "../contexts/dataContext";
import ModalObservacionPartida from "../components/ModalObservacionPartida";
import ModalFinalizarRecepcion from "../components/ModalFinalizarRecepcion";

const CodigoBarras = () => {
  const { valor } = useContext(DataContext);
  const { contextData } = valor;
  const infoUsuario = contextData;

  const fecha = Date.now();
  const hoy = new Date(fecha).toJSON().slice(0, 10);

  const urlServidorAPI = process.env.REACT_APP_URL_API1;
  const urlServidorAPI2 = process.env.REACT_APP_URL_API2;

  // Estado de la bandeja de facturas asignadas/pendientes
  const [facturasPendientes, setFacturasPendientes] = useState([]);
  const [cargandoPendientes, setCargandoPendientes] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState("TODAS");
  const [facturaResumen, setFacturaResumen] = useState(null);
  const [cargandoResumen, setCargandoResumen] = useState(false);

  // Estado de la recepción física activa
  const [recepcionActiva, setRecepcionActiva] = useState(null);
  const [rfc, setRfc] = useState("");
  const [nombreProveedor, setNombreProveedor] = useState("");
  const [folioFactura, setFolioFactura] = useState("");

  // Partidas por recibir y ya verificadas
  const [clavesunificadas, setClavesunificadas] = useState([]);
  const [productosRecepcionados, setProductosRecepcionados] = useState([]);

  // Modales de incidencias y confirmación de finalización
  const [partidaParaObservacion, setPartidaParaObservacion] = useState(null);
  const [showModalObservacion, setShowModalObservacion] = useState(false);
  const [showModalFinalizar, setShowModalFinalizar] = useState(false);
  const [guardandoFinalizacion, setGuardandoFinalizacion] = useState(false);

  // Registro manual de claves no encontradas
  const [productoIngresadoManualmente, setProductoIngresadoManualmente] = useState("");
  const [claveProveedorIngManualmente, setClaveProveedorIngManualmente] = useState("");
  const [qtyManualmente, setQtyManualmente] = useState("");
  const [value, setValue] = useState("");
  const [catalogoProductos, setCatalogoProductos] = useState([]);

  // Impresión de códigos de barras
  const [partidasPrint, setPartidasPrint] = useState([]);
  const isInitialMount = useRef(true);
  const myinput = useRef();
  const ref = useRef();
  const componentRef = useRef();

  const inputFocus = () => {
    if (myinput.current) {
      myinput.current.focus();
    }
  };

  const renderTooltip = (props) => (
    <Tooltip {...props}>Da clic para generar código de barras</Tooltip>
  );

  const renderTooltip2 = (props) => (
    <Tooltip {...props}>Da clic para registrar clave de producto</Tooltip>
  );

  // 1. Cargar bandeja de facturas pendientes al entrar y restaurar sesión previa si existe
  useEffect(() => {
    cargarFacturasPendientes();

    const recepcionGuardada = localStorage.getItem('codigoBarrasRecepcionActiva');
    const recepcionadosGuardados = localStorage.getItem('productosRecepcionados');
    const unificadasGuardadas = localStorage.getItem('clavesunificadas');

    if (recepcionGuardada) {
      try {
        const parsedRecepcion = JSON.parse(recepcionGuardada);
        setRecepcionActiva(parsedRecepcion);
        setFolioFactura(parsedRecepcion.folio_factura || "");
        setNombreProveedor(parsedRecepcion.nombre_proveedor || "");
        setRfc(parsedRecepcion.rfc_proveedor || "");

        if (recepcionadosGuardados) {
          setProductosRecepcionados(JSON.parse(recepcionadosGuardados));
        }
        if (unificadasGuardadas) {
          setClavesunificadas(JSON.parse(unificadasGuardadas));
        }
      } catch (err) {
        console.error("Error al restaurar sesión previa de recepción:", err);
      }
    }
  }, [infoUsuario?.sucursal]);

  // 2. Persistir sesión activa en localStorage
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (recepcionActiva) {
      localStorage.setItem('codigoBarrasRecepcionActiva', JSON.stringify(recepcionActiva));
      localStorage.setItem('productosRecepcionados', JSON.stringify(productosRecepcionados));
      localStorage.setItem('clavesunificadas', JSON.stringify(clavesunificadas));

      if (recepcionActiva.id) {
        localStorage.setItem(`recepcion_progreso_${recepcionActiva.id}`, JSON.stringify({
          clavesunificadas,
          productosRecepcionados,
          folioFactura,
          nombreProveedor
        }));
      }
    }
  }, [recepcionActiva, productosRecepcionados, clavesunificadas]);

  useEffect(() => {
    getProductosCatalogo();
  }, [rfc]);

  useEffect(() => {
    if (partidasPrint.length !== 0) {
      handlePrint();
    }
  }, [partidasPrint]);

  // Sincronizar progreso parcial con la base de datos
  const guardarProgresoEnBackend = async (recepcionId, recibidos, pendientes) => {
    if (!recepcionId) return;
    try {
      const payloadPartidas = [
        ...(recibidos || []).map((p) => {
          const tieneObs = p.observacion && p.observacion.trim() !== "";
          let estatus = "COMPLETA";
          if (tieneObs) {
            if (p.tipoAnomalia === "Dañado") estatus = "DANADA";
            else if (p.tipoAnomalia === "Faltante") estatus = "INCOMPLETA";
            else if (p.tipoAnomalia === "Incorrecto") estatus = "INCORRECTO";
            else if (p.tipoAnomalia === "Otra") estatus = "OTRA";
            else estatus = "INCIDENCIA";
          }
          const notaCompleta = tieneObs
            ? (p.tipoAnomalia ? `[${p.tipoAnomalia}] ${p.observacion}` : p.observacion)
            : null;
          return {
            id: p.id,
            cantidad_recibida: p.cantidad,
            estatus_partida: estatus,
            observacion: notaCompleta
          };
        }),
        ...(pendientes || []).map((p) => {
          const tieneObs = p.observacion && p.observacion.trim() !== "";
          let estatus = "PENDIENTE";
          if (tieneObs) {
            if (p.tipoAnomalia === "Dañado") estatus = "DANADA";
            else if (p.tipoAnomalia === "Faltante") estatus = "INCOMPLETA";
            else if (p.tipoAnomalia === "Incorrecto") estatus = "INCORRECTO";
            else if (p.tipoAnomalia === "Otra") estatus = "OTRA";
            else estatus = "INCIDENCIA";
          }
          const notaCompleta = tieneObs
            ? (p.tipoAnomalia ? `[${p.tipoAnomalia}] ${p.observacion}` : p.observacion)
            : null;
          return {
            id: p.id,
            cantidad_recibida: 0,
            estatus_partida: estatus,
            observacion: notaCompleta
          };
        })
      ];

      await Axios.put(`${urlServidorAPI}/api/v1/recepcion/${recepcionId}/progreso`, {
        partidas: payloadPartidas
      });
    } catch (e) {
      console.warn("No se pudo sincronizar progreso con el servidor:", e);
    }
  };

  // Cargar facturas asignadas a la sucursal del usuario
  const cargarFacturasPendientes = async () => {
    setCargandoPendientes(true);
    try {
      const sucursalParam = infoUsuario?.sucursal 
        ? `?sucursal=${encodeURIComponent(infoUsuario.sucursal)}` 
        : '';
      const res = await Axios.get(`${urlServidorAPI}/api/v1/recepcion/pendientes${sucursalParam}`);
      setFacturasPendientes(res.data || []);
      setCargandoPendientes(false);
    } catch (err) {
      console.error("Error al consultar facturas pendientes:", err);
      setCargandoPendientes(false);
    }
  };

  // Iniciar o continuar recepción física de una factura seleccionada de la bandeja
  const iniciarRecepcion = async (factura) => {
    try {
      const res = await Axios.get(`${urlServidorAPI}/api/v1/recepcion/${factura.id}/detalle?iniciar=true`);
      const data = res.data;

      if (!data) {
        Swal.fire("Error", "No se pudo obtener el detalle de la factura.", "error");
        return;
      }

      setRecepcionActiva(data);
      setFolioFactura(data.folio_factura || factura.folio_factura);
      setNombreProveedor(data.nombre_proveedor || factura.nombre_proveedor);
      setRfc(data.rfc_proveedor || factura.rfc_proveedor);

      const todasPartidas = (data.partidas || []).map((p) => {
        let obsTexto = p.observacion || "";
        let tipo = "";
        if (obsTexto) {
          const match = obsTexto.match(/^\[(.*?)\]\s*(.*)$/);
          if (match) {
            tipo = match[1];
            obsTexto = match[2];
          } else if (p.estatus_partida === 'DANADA') {
            tipo = 'Dañado';
          } else if (p.estatus_partida === 'INCOMPLETA') {
            tipo = 'Faltante';
          } else if (p.estatus_partida === 'INCORRECTO') {
            tipo = 'Incorrecto';
          } else if (p.estatus_partida === 'OTRA' || p.estatus_partida === 'INCIDENCIA') {
            tipo = 'Otra';
          }
        } else if (p.estatus_partida === 'DANADA') {
          tipo = 'Dañado';
        } else if (p.estatus_partida === 'INCOMPLETA') {
          tipo = 'Faltante';
        } else if (p.estatus_partida === 'INCORRECTO') {
          tipo = 'Incorrecto';
        } else if (p.estatus_partida === 'OTRA' || p.estatus_partida === 'INCIDENCIA') {
          tipo = 'Otra';
        }

        return {
          id: p.id,
          recepcion_id: p.recepcion_id,
          numero_partida: p.numero_partida,
          cantidad: parseFloat(p.cantidad_facturada),
          cantidad_recibida: parseFloat(p.cantidad_recibida || 0),
          producto: p.clave_proveedor,
          clave: p.clave_interna || "No-registrada",
          descripcion: p.descripcion || "",
          observacion: obsTexto,
          tipoAnomalia: tipo,
          estatus_partida: p.estatus_partida
        };
      });

      // 1. Revisar si hay progreso local guardado para esta factura específica
      const keyProgreso = `recepcion_progreso_${data.id || factura.id}`;
      const progresoLocal = localStorage.getItem(keyProgreso);
      let itemsPendientes = [];
      let itemsRecibidos = [];

      if (progresoLocal) {
        try {
          const parsed = JSON.parse(progresoLocal);
          if (parsed && (Array.isArray(parsed.clavesunificadas) || Array.isArray(parsed.productosRecepcionados))) {
            itemsPendientes = parsed.clavesunificadas || [];
            itemsRecibidos = parsed.productosRecepcionados || [];
          }
        } catch (e) {
          console.warn("Error leyendo progreso local guardado:", e);
        }
      }

      // 2. Si no había progreso en localStorage, verificar si en BD ya había partidas con cantidad_recibida > 0 o estatus no pendiente
      if (itemsPendientes.length === 0 && itemsRecibidos.length === 0) {
        itemsRecibidos = todasPartidas.filter(
          (p) => p.cantidad_recibida > 0 || ['COMPLETA', 'DANADA', 'INCOMPLETA', 'NO_RECIBIDA', 'INCORRECTO', 'OTRA', 'INCIDENCIA'].includes(p.estatus_partida)
        );
        const idsRecibidos = new Set(itemsRecibidos.map((r) => r.id));
        itemsPendientes = todasPartidas.filter((p) => !idsRecibidos.has(p.id));

        if (itemsRecibidos.length === 0 && itemsPendientes.length === 0) {
          itemsPendientes = todasPartidas;
        }
      }

      setClavesunificadas(itemsPendientes);
      setProductosRecepcionados(itemsRecibidos);

      localStorage.setItem('codigoBarrasRecepcionActiva', JSON.stringify(data));
      localStorage.setItem('clavesunificadas', JSON.stringify(itemsPendientes));
      localStorage.setItem('productosRecepcionados', JSON.stringify(itemsRecibidos));
      localStorage.setItem(keyProgreso, JSON.stringify({
        clavesunificadas: itemsPendientes,
        productosRecepcionados: itemsRecibidos
      }));

      setTimeout(() => {
        inputFocus();
      }, 300);

    } catch (err) {
      console.error("Error al iniciar recepción:", err);
      Swal.fire("Error", "No se pudo conectar con el servidor para iniciar la recepción.", "error");
    }
  };

  // Salir de la recepción activa y regresar a la bandeja (conservando progreso)
  const cancelarOSalirRecepcion = () => {
    Swal.fire({
      title: "¿Salir a la bandeja de facturas?",
      text: "La factura permanecerá en estatus 'En Recepción' para que pueda continuar su verificación más tarde.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, salir a bandeja",
      cancelButtonText: "Continuar contando"
    }).then(async (res) => {
      if (res.isConfirmed) {
        if (recepcionActiva?.id) {
          // Persistir el progreso actual localmente
          const keyProgreso = `recepcion_progreso_${recepcionActiva.id}`;
          localStorage.setItem(keyProgreso, JSON.stringify({
            clavesunificadas,
            productosRecepcionados,
            folioFactura,
            nombreProveedor
          }));

          // Sincronizar también con la base de datos
          await guardarProgresoEnBackend(recepcionActiva.id, productosRecepcionados, clavesunificadas);
        }

        setRecepcionActiva(null);
        setClavesunificadas([]);
        setProductosRecepcionados([]);
        setFolioFactura("");
        setNombreProveedor("");
        setRfc("");

        localStorage.removeItem('codigoBarrasRecepcionActiva');
        localStorage.removeItem('clavesunificadas');
        localStorage.removeItem('productosRecepcionados');
        localStorage.removeItem('codigoBarrasFileName');
        localStorage.removeItem('codigoBarrasProveedor');
        localStorage.removeItem('codigoBarrasFolio');

        cargarFacturasPendientes();
      }
    });
  };

  // Escaneo físico de código de barras
  const handlerFunction = (e) => {
    e.preventDefault();
    const scannedVal = e.target.value?.trim();
    if (!scannedVal) return;

    // Buscar coincidencia por clave interna o por clave de proveedor
    const foundItem = clavesunificadas.find(
      (p) =>
        (p.clave && p.clave.toUpperCase() === scannedVal.toUpperCase()) ||
        (p.producto && p.producto.toUpperCase() === scannedVal.toUpperCase())
    );

    if (foundItem) {
      Swal.fire({
        html: `
          <div class="text-start p-2">
            <p class="mb-1"><i>Producto: <strong>${foundItem.clave !== "No-registrada" ? foundItem.clave : foundItem.producto}</strong></i></p>
            <p class="mb-1"><i>Clave Proveedor: <strong>${foundItem.producto}</strong></i></p>
            <p class="mb-2"><i>Cantidad Facturada: <strong>${foundItem.cantidad}</strong></i></p>
            ${foundItem.descripcion ? `<p class="mb-2 small text-muted">${foundItem.descripcion}</p>` : ''}
          </div>
          <h5 class="mt-2 text-primary fw-bold">¿Registrar como verificado?</h5>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, registrar",
        cancelButtonText: "Cancelar"
      }).then((res) => {
        if (res.isConfirmed) {
          setClavesunificadas((prev) => prev.filter((it) => it.id !== foundItem.id));
          setProductosRecepcionados((prev) => [...prev, foundItem]);
          inputFocus();
        } else {
          inputFocus();
        }
      });
    } else {
      inputFocus();
      Swal.fire({
        title: "<strong>Producto no encontrado</strong>",
        html: `El código <strong>${scannedVal}</strong> no corresponde a ninguna partida pendiente de esta factura.`,
        icon: "error"
      });
    }
  };

  // Gestión de reporte de anomalías (Discrepancias)
  const abrirModalObservacion = (partida) => {
    setPartidaParaObservacion(partida);
    setShowModalObservacion(true);
  };

  const guardarObservacionPartida = (partidaId, tipoAnomalia, observacion) => {
    setClavesunificadas((prev) =>
      prev.map((item) => {
        if (item.id === partidaId) {
          return {
            ...item,
            tipoAnomalia: tipoAnomalia,
            observacion: observacion
          };
        }
        return item;
      })
    );

    setProductosRecepcionados((prev) =>
      prev.map((item) => {
        if (item.id === partidaId) {
          return {
            ...item,
            tipoAnomalia: tipoAnomalia,
            observacion: observacion
          };
        }
        return item;
      })
    );

    setShowModalObservacion(false);
    setPartidaParaObservacion(null);
  };

  // Apertura y confirmación de finalización de la recepción
  const abrirModalFinalizar = () => {
    setShowModalFinalizar(true);
  };

  const confirmarFinalizacion = async (observacionesGenerales) => {
    if (!recepcionActiva) return;

    setGuardandoFinalizacion(true);

    try {
      const todasPartidas = [...productosRecepcionados, ...clavesunificadas];

      // Regla de Negocio: No alterar cantidades facturadas.
      // Toda anomalía (faltante, daño) viaja en 'observacion' para que Compras gestione reposición o NC.
      const partidasPayload = todasPartidas.map((p) => {
        const tieneObs = p.observacion && p.observacion.trim() !== "";
        let estatus = "COMPLETA";

        if (tieneObs) {
          if (p.tipoAnomalia === "Dañado") {
            estatus = "DANADA";
          } else if (p.tipoAnomalia === "Faltante") {
            estatus = "INCOMPLETA";
          } else if (p.tipoAnomalia === "Incorrecto") {
            estatus = "INCORRECTO";
          } else if (p.tipoAnomalia === "Otra") {
            estatus = "OTRA";
          } else {
            estatus = "INCIDENCIA";
          }
        }

        const notaCompleta = tieneObs
          ? (p.tipoAnomalia ? `[${p.tipoAnomalia}] ${p.observacion}` : p.observacion)
          : null;

        return {
          id: p.id,
          cantidad_facturada: p.cantidad,
          cantidad_recibida: p.cantidad,
          estatus_partida: estatus,
          observacion: notaCompleta
        };
      });

      // Identificar si existen anomalías o incidencias en las partidas
      const partidasConIncidencia = partidasPayload.filter(
        (p) => p.observacion || !['PENDIENTE', 'COMPLETA'].includes(p.estatus_partida)
      );

      // Si hay anomalías en partidas pero el usuario no ingresó observaciones generales en el modal,
      // sintetizamos un resumen de las incidencias para garantizar que la cabecera marque tiene_incidencias = 1
      let obsGeneralesFinal = observacionesGenerales?.trim() || null;
      if (!obsGeneralesFinal && partidasConIncidencia.length > 0) {
        obsGeneralesFinal = partidasConIncidencia
          .map((p) => p.observacion || `Partida ${p.id}: ${p.estatus_partida}`)
          .join(" | ");
      }

      const payloadFinalizar = {
        recibido_por: infoUsuario?.email || "Sin email",
        observaciones_generales: obsGeneralesFinal,
        partidas: partidasPayload
      };

      const res = await Axios.post(
        `${urlServidorAPI}/api/v1/recepcion/${recepcionActiva.id}/finalizar`,
        payloadFinalizar
      );

      // Sincronización secundaria con API2 legado para historial
      if (productosRecepcionados.length > 0) {
        grabaProductosRecepcionadosEnAPI2(productosRecepcionados).catch((err) => {
          console.warn("Advertencia al sincronizar API2 legado:", err);
        });
      }

      setGuardandoFinalizacion(false);
      setShowModalFinalizar(false);

      if (res.data?.success || res.status === 200) {
        const tieneIncidencias =
          partidasPayload.some((p) => p.observacion || !['PENDIENTE', 'COMPLETA'].includes(p.estatus_partida)) ||
          Boolean(observacionesGenerales && observacionesGenerales.trim() !== "");

        Swal.fire({
          title: tieneIncidencias ? "¡Recepción con Incidencia Registrada!" : "¡Recepción Finalizada!",
          html: `
            <p>La factura <strong>${folioFactura}</strong> ha sido registrada como <strong>${
              tieneIncidencias ? "RECIBIDA CON INCIDENCIA" : "RECIBIDA COMPLETA"
            }</strong>.</p>
            <p class="text-muted small">El área de Compras ha sido notificada en su tablero para proceder con la Orden de Compra.</p>
          `,
          icon: tieneIncidencias ? "warning" : "success",
          confirmButtonText: "Entendido"
        });

        setRecepcionActiva(null);
        setClavesunificadas([]);
        setProductosRecepcionados([]);
        setFolioFactura("");
        setNombreProveedor("");
        setRfc("");

        if (recepcionActiva?.id) {
          localStorage.removeItem(`recepcion_progreso_${recepcionActiva.id}`);
        }

        localStorage.removeItem('codigoBarrasRecepcionActiva');
        localStorage.removeItem('clavesunificadas');
        localStorage.removeItem('productosRecepcionados');
        localStorage.removeItem('codigoBarrasFileName');
        localStorage.removeItem('codigoBarrasProveedor');
        localStorage.removeItem('codigoBarrasFolio');

        cargarFacturasPendientes();
      } else {
        Swal.fire("Error", "No se pudo finalizar la recepción en el servidor.", "error");
      }
    } catch (err) {
      setGuardandoFinalizacion(false);
      console.error("Error al finalizar recepción:", err);
      const msg =
        err.response?.data?.details ||
        err.response?.data?.error ||
        "Error al conectar con el servidor.";
      Swal.fire("Error al finalizar", msg, "error");
    }
  };

  // Sincronización en API2 legado
  const grabaProductosRecepcionadosEnAPI2 = async (items) => {
    try {
      const payload = items.map((obj) => ({
        ...obj,
        Cantidad: obj.cantidad,
        Clave: obj.clave,
        ClaveProveedor: obj.producto,
        Proveedor: nombreProveedor,
        rfc: rfc,
        Factura: folioFactura,
        Sucursal: infoUsuario?.sucursal || "Durango"
      }));

      if (payload.length === 1) {
        await Axios.post(`${urlServidorAPI2}/api/v1/productorecepcionado`, payload[0]);
      } else if (payload.length > 1) {
        await Axios.post(`${urlServidorAPI2}/api/v1/productosrecepcionados`, payload);
      }
    } catch (error) {
      console.warn("Error secundario en API2 legado:", error);
    }
  };

  // Impresión de etiqueta de código de barras
  const printCodeBar = (val) => {
    let cla = val.clave;
    const partida = [
      {
        cantidad: "1",
        clave: cla,
        barcode: <Barcode width={1} height={30} ref={ref} value={cla} />
      }
    ];
    setPartidasPrint(partida);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  });

  // Registro de producto no registrado
  const grabaClaveNoEncontrada = (valorItem) => {
    setClaveProveedorIngManualmente(valorItem.producto);
    setQtyManualmente(valorItem.cantidad);
  };

  const getProductosCatalogo = () => {
    if (catalogoProductos.length === 0) {
      Axios.get(`${urlServidorAPI2}/api/v1/productos`)
        .then((response) => {
          setCatalogoProductos(response.data.body || []);
        })
        .catch((err) => console.warn(err));
    }
  };

  const agregarClaveManual = () => {
    const parametros = {
      clave: productoIngresadoManualmente.trim(),
      sucursal: infoUsuario?.sucursal,
      rfc: rfc,
      factura: folioFactura,
      claveProveedor: claveProveedorIngManualmente,
      fecha: hoy,
      estatus: "Pendiente"
    };

    Axios.post(`${urlServidorAPI2}/api/v1/products`, parametros)
      .then((respuesta) => {
        if (respuesta.status === 201) {
          // Mover producto a recepcionados con su nueva clave
          setClavesunificadas((prev) =>
            prev.filter((item) => item.producto !== claveProveedorIngManualmente)
          );
          const actualizado = clavesunificadas
            .filter((item) => item.producto === claveProveedorIngManualmente)
            .map((item) => ({ ...item, clave: productoIngresadoManualmente.trim() }));
          
          if (actualizado.length > 0) {
            setProductosRecepcionados((prev) => [...prev, actualizado[0]]);
          }

          setValue("");
          setProductoIngresadoManualmente("");
          show_alerta("Registrado exitósamente", "success");
          document.getElementById("btnCerrar")?.click();
        } else {
          show_alerta("Hubo un problema", "error");
        }
      })
      .catch((error) => {
        show_alerta("Error en la solicitud de escritura", "error");
      });
  };

  const onSearch = (searchTerm) => {
    setProductoIngresadoManualmente(searchTerm);
    setValue(searchTerm);
  };

  const onChange = (event) => {
    setValue(event.target.value);
    setProductoIngresadoManualmente(event.target.value);
  };

  // Contadores para filtros
  const totalPendientes = facturasPendientes.filter(f => ["PENDIENTE", "EN_RECEPCION"].includes(f.estatus)).length;
  const totalRecibidas = facturasPendientes.filter(f => ["RECIBIDO_COMPLETO", "RECIBIDO_CON_INCIDENCIA", "OC_GENERADA"].includes(f.estatus)).length;

  const renderBadgeEstatus = (estatus, tieneIncidencias) => {
    switch (estatus) {
      case "PENDIENTE":
        return <Badge bg="warning" text="dark">Pendiente</Badge>;
      case "EN_RECEPCION":
        return <Badge bg="info" text="dark">En Conteo</Badge>;
      case "RECIBIDO_COMPLETO":
        return <Badge bg="success">Recibido OK</Badge>;
      case "RECIBIDO_CON_INCIDENCIA":
        return <Badge bg="danger">Con Incidencias</Badge>;
      case "OC_GENERADA":
        if (tieneIncidencias) {
          return (
            <div className="d-flex flex-column align-items-center gap-1">
              <Badge bg="secondary">OC Generada</Badge>
              <Badge bg="danger">Con Incidencias</Badge>
            </div>
          );
        }
        return <Badge bg="secondary">OC Generada</Badge>;
      default:
        return <Badge bg="secondary">{estatus}</Badge>;
    }
  };

  const verResumen = async (factura) => {
    setCargandoResumen(true);
    setFacturaResumen(factura);
    try {
      const res = await Axios.get(`${urlServidorAPI}/api/v1/recepcion/${factura.id}/detalle`);
      if (res.data) {
        setFacturaResumen(res.data);
      }
    } catch (err) {
      console.error("Error al cargar detalle de factura:", err);
    } finally {
      setCargandoResumen(false);
    }
  };

  // Filtrado de la bandeja de facturas pendientes y recibidas
  const facturasFiltradas = facturasPendientes.filter((f) => {
    if (filtroEstatus === "PENDIENTES" && !["PENDIENTE", "EN_RECEPCION"].includes(f.estatus)) return false;
    if (filtroEstatus === "RECIBIDAS" && !["RECIBIDO_COMPLETO", "RECIBIDO_CON_INCIDENCIA", "OC_GENERADA"].includes(f.estatus)) return false;

    if (!busqueda) return true;
    const term = busqueda.toLowerCase();
    return (
      (f.folio_factura && f.folio_factura.toLowerCase().includes(term)) ||
      (f.nombre_proveedor && f.nombre_proveedor.toLowerCase().includes(term)) ||
      (f.rfc_proveedor && f.rfc_proveedor.toLowerCase().includes(term)) ||
      (f.nombre_receptor && f.nombre_receptor.toLowerCase().includes(term)) ||
      (f.rfc_receptor && f.rfc_receptor.toLowerCase().includes(term))
    );
  });

  return (
    <>
      {!recepcionActiva ? (
        /* VISTA 1: BANDEJA DE FACTURAS ASIGNADAS A LA SUCURSAL (PENDIENTES Y RECIBIDAS) */
        <div className="wrapperCB p-3">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <h5 className="mb-0 fw-bold text-dark">
                Recepción de Mercancía
              </h5>
              <Badge bg="primary" className="px-2 py-1">
                Sucursal: {infoUsuario?.sucursal || "General"}
              </Badge>
            </div>

            {/* Filtros rápidos: Todas / Pendientes / Recibidas */}
            <div className="d-flex align-items-center gap-1">
              <button
                className={`btn btn-sm ${filtroEstatus === "TODAS" ? "btn-dark fw-bold" : "btn-outline-secondary"}`}
                onClick={() => setFiltroEstatus("TODAS")}
              >
                Todas ({facturasPendientes.length})
              </button>
              <button
                className={`btn btn-sm ${filtroEstatus === "PENDIENTES" ? "btn-warning text-dark fw-bold shadow-sm" : "btn-outline-warning text-dark"}`}
                onClick={() => setFiltroEstatus("PENDIENTES")}
              >
                Pendientes ({totalPendientes})
              </button>
              <button
                className={`btn btn-sm ${filtroEstatus === "RECIBIDAS" ? "btn-success fw-bold shadow-sm" : "btn-outline-success"}`}
                onClick={() => setFiltroEstatus("RECIBIDAS")}
                title="Facturas recibidas durante el último mes"
              >
                Recibidas (Último mes: {totalRecibidas})
              </button>
            </div>

            <div className="d-flex align-items-center gap-2">
              <div className="input-group input-group-sm" style={{ width: "220px" }}>
                <span className="input-group-text bg-light">
                  <BiSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar folio o prov..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <button
                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                onClick={cargarFacturasPendientes}
                disabled={cargandoPendientes}
                title="Actualizar listado"
              >
                <BiRefresh size={18} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          {cargandoPendientes ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted small">Consultando facturas asignadas a tu sucursal...</p>
            </div>
          ) : facturasFiltradas.length === 0 ? (
            <div className="alert alert-light border text-center py-5 shadow-sm rounded">
              <BiCheckCircle size={48} className="text-success mb-2" />
              <h6 className="fw-bold">No hay facturas con los filtros seleccionados</h6>
              <p className="text-muted small mb-0">
                Las facturas cargadas y asignadas a <strong>{infoUsuario?.sucursal || "esta sucursal"}</strong> por el área de Compras aparecerán aquí para su validación física.
              </p>
            </div>
          ) : (
            <div className="table-responsive shadow-sm border rounded bg-white">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.85rem" }}>
                <thead className="table-light">
                  <tr>
                    <th className="py-2">Folio Factura</th>
                    <th className="py-2">Razón Social (Receptor)</th>
                    <th className="py-2">Proveedor</th>
                    <th className="py-2 text-center">Partidas</th>
                    <th className="py-2 text-center">Fecha Factura</th>
                    <th className="py-2 text-center">Estatus</th>
                    <th className="py-2 text-center">Gestión / Fecha</th>
                    <th className="py-2 text-center" style={{ width: "170px" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {facturasFiltradas.map((f) => {
                    const esEnProceso = f.estatus === "EN_RECEPCION";
                    const esFinalizada = ["RECIBIDO_COMPLETO", "RECIBIDO_CON_INCIDENCIA", "OC_GENERADA"].includes(f.estatus);
                    return (
                      <tr key={f.id} className={esFinalizada ? "bg-light bg-opacity-50" : ""}>
                        <td className="fw-bold text-primary">{f.folio_factura}</td>
                        <td>
                          <div className="fw-bold text-dark text-truncate" style={{ maxWidth: "230px" }} title={f.nombre_receptor}>
                            {f.nombre_receptor || "N/A"}
                          </div>
                          {f.rfc_receptor && (
                            <div className="text-secondary small" style={{ fontSize: "0.72rem" }}>
                              {f.rfc_receptor}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="fw-semibold text-truncate" style={{ maxWidth: "240px" }} title={f.nombre_proveedor}>
                            {f.nombre_proveedor}
                          </div>
                          <div className="text-muted small" style={{ fontSize: "0.75rem" }}>{f.rfc_proveedor}</div>
                        </td>
                        <td className="text-center">{f.total_partidas}</td>
                        <td className="text-center text-muted">
                          {f.fecha_factura ? new Date(f.fecha_factura).toLocaleDateString() : "-"}
                        </td>
                        <td className="text-center">
                          {renderBadgeEstatus(f.estatus, f.tiene_incidencias === 1)}
                        </td>
                        <td className="text-center text-muted small">
                          {esFinalizada && f.fecha_recepcion ? (
                            <div>
                              <span className="text-dark fw-semibold" style={{ fontSize: "0.75rem" }}>
                                {new Date(f.fecha_recepcion).toLocaleDateString()}
                              </span>
                              {f.recibido_por && (
                                <span className="d-block text-secondary text-truncate" style={{ fontSize: "0.70rem", maxWidth: "120px" }} title={f.recibido_por}>
                                  {f.recibido_por.split("@")[0]}
                                </span>
                              )}
                            </div>
                          ) : (
                            f.subido_por || "Compras"
                          )}
                        </td>
                        <td className="text-center">
                          {esFinalizada ? (
                            <button
                              className="btn btn-outline-secondary btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-1"
                              onClick={() => verResumen(f)}
                              title="Ver resumen y partidas de la recepción"
                            >
                              <BiCheckDouble size={16} />
                              <span>Ver Resumen</span>
                            </button>
                          ) : (
                            <button
                              className={`btn btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-1 ${
                                esEnProceso ? "btn-warning text-dark" : "btn-primary"
                              }`}
                              onClick={() => iniciarRecepcion(f)}
                            >
                              <BiBarcode size={16} />
                              <span>{esEnProceso ? "Continuar Conteo" : "Iniciar Recepción"}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* VISTA 2: RECEPCIÓN FÍSICA Y ESCANEO DE LA FACTURA ACTIVA */
        <div className="wrapperCB">
          <div className="encabezadoCB">
            <div className="subencabezado align-items-center justify-content-between px-2 flex-wrap gap-2">
              <div className="proveedor-info">
                <h6 className="mb-0 fw-bold text-primary">
                  Factura: {folioFactura} — {nombreProveedor}
                </h6>
                <div className="small text-muted mt-1">
                  {recepcionActiva?.nombre_receptor && (
                    <span className="me-2 text-dark">
                      Razón Social: <strong>{recepcionActiva.nombre_receptor}</strong> |
                    </span>
                  )}
                  <span>
                    Destino: <strong>{recepcionActiva?.sucursal_destino || infoUsuario?.sucursal}</strong> (Almacén SAE: {recepcionActiva?.almacen_sae || 1})
                  </span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Badge bg={clavesunificadas.length === 0 ? "success" : "secondary"} className="px-3 py-2">
                  Validados: {productosRecepcionados.length} / {clavesunificadas.length + productosRecepcionados.length} partidas
                </Badge>

                <button
                  onClick={abrirModalFinalizar}
                  className="btn btn-success btn-sm fw-bold d-flex align-items-center gap-1 shadow-sm"
                  title="Finalizar el conteo físico y notificar a Compras"
                >
                  <BiCheckDouble size={18} />
                  <span>Finalizar Recepción</span>
                </button>

                <button
                  onClick={cancelarOSalirRecepcion}
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                  title="Salir a la lista de facturas pendientes"
                >
                  <BiXCircle size={16} />
                  <span>Salir a Bandeja</span>
                </button>
              </div>
            </div>
          </div>

          <div className="contenedor-raizCB">
            {/* Columna Izquierda: Por verificar */}
            <div className="columna-izquierdaCB">
              <div className="contenedor-inferior">
                <div className="mensaje">
                  <div className="item-1">
                    Productos facturados <span className="text-muted fs-6">({clavesunificadas.length} pendientes)</span>
                  </div>
                </div>
              </div>

              {clavesunificadas.length > 0 ? (
                <div className="contenedor">
                  <div className="table-scroll">
                    <table className="table table-striped table-hover mb-0">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th style={{ width: "12%", textAlign: "center" }} scope="col">Cant</th>
                          <th style={{ width: "32%" }} scope="col">Clave Proveedor</th>
                          <th style={{ width: "32%" }} scope="col">Clave Interna</th>
                          <th style={{ width: "24%", textAlign: "center" }} scope="col">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clavesunificadas.map((val) => {
                          const tieneObs = val.observacion && val.observacion.trim() !== "";
                          return (
                            <tr key={val.id}>
                              <td className="td-table-cb2 text-center fw-bold">{val.cantidad}</td>
                              <td className="td-table-cb">
                                <div className="fw-semibold">{val.producto}</div>
                                {val.descripcion && (
                                  <div className="text-muted small text-truncate" style={{ maxWidth: "160px" }} title={val.descripcion}>
                                    {val.descripcion}
                                  </div>
                                )}
                                {tieneObs && (
                                  <Badge bg="warning" text="dark" className="d-block mt-1 text-truncate" style={{ maxWidth: "160px" }} title={val.observacion}>
                                    ⚠️ {val.tipoAnomalia ? `[${val.tipoAnomalia}] ` : ""}{val.observacion}
                                  </Badge>
                                )}
                              </td>
                              <td className="td-table-cb">
                                <span className={val.clave === "No-registrada" ? "text-danger fw-bold" : "text-dark"}>
                                  {val.clave}
                                </span>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <div className="d-flex justify-content-center align-items-center gap-1">
                                  {val.clave !== "No-registrada" ? (
                                    <OverlayTrigger placement="top" overlay={renderTooltip}>
                                      <button
                                        onClick={() => printCodeBar(val)}
                                        className="btn btn-outline-secondary boton-tb-cb"
                                      >
                                        <i className="fa-solid fa-barcode"></i>
                                      </button>
                                    </OverlayTrigger>
                                  ) : (
                                    <OverlayTrigger placement="top" overlay={renderTooltip2}>
                                      <button
                                        onClick={() => grabaClaveNoEncontrada(val)}
                                        data-bs-toggle="modal"
                                        data-bs-target="#myModal"
                                        className="btn btn-outline-danger boton-tb-cb2"
                                      >
                                        <i className="fa-solid fa-unlock"></i>
                                      </button>
                                    </OverlayTrigger>
                                  )}

                                  {/* Botón de reporte de anomalía / nota para Compras */}
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Reportar anomalía / nota para Compras</Tooltip>}
                                  >
                                    <button
                                      onClick={() => abrirModalObservacion(val)}
                                      className={`btn btn-sm ${tieneObs ? "btn-warning text-dark" : "btn-outline-secondary"}`}
                                      style={{ padding: "0.25rem 0.5rem" }}
                                    >
                                      <BiCommentDetail size={15} />
                                    </button>
                                  </OverlayTrigger>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="contenedor-completada text-success">
                  <BiCheckCircle className="me-2" size={28} /> ¡Todas las partidas han sido verificadas!
                </div>
              )}
            </div>

            {/* Columna Derecha: Recepcionados */}
            <div className="columna-derechaCB">
              <div className="contenedor-inferior">
                <div className="mensaje">
                  <div className="item-1">
                    Productos recepcionados <span className="text-muted fs-6">({productosRecepcionados.length} verificados)</span>
                  </div>
                </div>
              </div>

              {productosRecepcionados.length > 0 ? (
                <div className="contenedor">
                  <div className="table-scroll">
                    <table className="table table-striped table-hover mb-0">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th style={{ width: "12%", textAlign: "center" }} scope="col">Cant</th>
                          <th style={{ width: "32%" }} scope="col">Clave Proveedor</th>
                          <th style={{ width: "32%" }} scope="col">Clave Interna</th>
                          <th style={{ width: "24%", textAlign: "center" }} scope="col">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosRecepcionados.map((val) => {
                          const tieneObs = val.observacion && val.observacion.trim() !== "";
                          return (
                            <tr key={val.id}>
                              <td className="td-table-cb2 text-center fw-bold text-success">{val.cantidad}</td>
                              <td className="td-table-cb">
                                <div className="fw-semibold">{val.producto}</div>
                                {val.descripcion && (
                                  <div className="text-muted small text-truncate" style={{ maxWidth: "160px" }} title={val.descripcion}>
                                    {val.descripcion}
                                  </div>
                                )}
                                {tieneObs && (
                                  <Badge bg="warning" text="dark" className="d-block mt-1 text-truncate" style={{ maxWidth: "160px" }} title={val.observacion}>
                                    ⚠️ {val.tipoAnomalia ? `[${val.tipoAnomalia}] ` : ""}{val.observacion}
                                  </Badge>
                                )}
                              </td>
                              <td className="td-table-cb">{val.clave}</td>
                              <td style={{ textAlign: "center" }}>
                                <div className="d-flex justify-content-center align-items-center gap-1">
                                  <OverlayTrigger placement="top" overlay={renderTooltip}>
                                    <button
                                      onClick={() => printCodeBar(val)}
                                      className="btn btn-outline-secondary boton-tb-cb"
                                    >
                                      <i className="fa-solid fa-barcode"></i>
                                    </button>
                                  </OverlayTrigger>

                                  <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Reportar o editar anomalía / nota para Compras</Tooltip>}
                                  >
                                    <button
                                      onClick={() => abrirModalObservacion(val)}
                                      className={`btn btn-sm ${tieneObs ? "btn-warning text-dark" : "btn-outline-secondary"}`}
                                      style={{ padding: "0.25rem 0.5rem" }}
                                    >
                                      <BiCommentDetail size={15} />
                                    </button>
                                  </OverlayTrigger>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="contenedor d-flex align-items-center justify-content-center text-muted p-4">
                  <div className="text-center">
                    <CiBarcode size={42} className="mb-2 text-secondary" />
                    <p className="mb-0">Aún no se han escaneado productos.</p>
                    <small>Utilice el lector de código de barras para verificar partidas.</small>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lector de código de barras */}
          {clavesunificadas.length > 0 && (
            <div className="captura-lector mt-2">
              <div style={{ width: "65%", paddingRight: "1%" }} className="input-group">
                <span className="input-group-text bg-primary text-white fw-bold">
                  <BiBarcode className="me-1" size={18} /> Escanee el producto
                </span>
                <input
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handlerFunction(e);
                    }
                  }}
                  type="text"
                  className="form-control"
                  id="producto"
                  placeholder="Escanee código de barras o teclee clave y Enter..."
                  onFocus={(e) => (e.target.value = "")}
                  ref={myinput}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Impresión de códigos de barras (oculto en pantalla) */}
      <div style={{ maxHeight: "40px" }} className="printContent" ref={componentRef}>
        <CodeBarPrint partidas={partidasPrint} />
      </div>

      {/* Modal para reportar anomalía u observación en partida */}
      <ModalObservacionPartida
        show={showModalObservacion}
        onHide={() => {
          setShowModalObservacion(false);
          setPartidaParaObservacion(null);
        }}
        partida={partidaParaObservacion}
        onGuardar={guardarObservacionPartida}
      />

      {/* Modal para finalizar la recepción y notificar al Comprador */}
      <ModalFinalizarRecepcion
        show={showModalFinalizar}
        onHide={() => setShowModalFinalizar(false)}
        factura={recepcionActiva}
        totalPartidas={clavesunificadas.length + productosRecepcionados.length}
        validadas={productosRecepcionados.length}
        anomalias={
          [...productosRecepcionados, ...clavesunificadas].filter(
            (p) => p.observacion && p.observacion.trim() !== ""
          ).length
        }
        onConfirmar={confirmarFinalizacion}
        guardando={guardandoFinalizacion}
      />

      {/* Modal para registrar clave de producto no registrado en BD */}
      <div className="modal" id="myModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Recepcionar producto sin clave registrada</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body modal-display-col">
              <div className="indicaciones-en-modal mb-2">
                <p className="small text-muted mb-0">
                  Si el producto cuenta con código de barras en su almacén, escanéelo para asegurar una correcta captura.
                </p>
              </div>
              <div className="modal-display-row">
                <div className="mb-3" style={{ width: "48%", paddingRight: "2%" }}>
                  <label htmlFor="exampleFormControlInput12" className="form-label small fw-bold">
                    Clave interna
                  </label>
                  <input
                    value={value}
                    type="text"
                    className="form-control form-control-sm"
                    id="exampleFormControlInput12"
                    onChange={onChange}
                  />
                  <div className="dropdown">
                    {catalogoProductos
                      .filter((item) => {
                        const searchTerm = value.toLowerCase();
                        const clave = item.clave.toLowerCase();
                        return searchTerm && clave.startsWith(searchTerm) && clave !== searchTerm;
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
                <div className="item-scan">
                  <i style={{ fontSize: "2.2rem", textAlign: "center" }}>
                    <CiBarcode />
                  </i>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => agregarClaveManual()}
                type="button"
                className="btn btn-primary btn-sm"
                data-bs-dismiss="modal"
              >
                Agregar
              </button>
              <button
                id="btnCerrar"
                type="button"
                className="btn btn-secondary btn-sm"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Consulta / Resumen de Factura Recibida */}
      <Modal 
        show={facturaResumen !== null} 
        onHide={() => setFacturaResumen(null)} 
        size="xl" 
        centered
      >
        <Modal.Header closeButton className="py-2 bg-light">
          <Modal.Title style={{ fontSize: "1rem" }} className="fw-bold d-flex align-items-center gap-2">
            <BiCheckDouble size={20} className="text-success" />
            Resumen de Recepción — Factura {facturaResumen?.folio_factura}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          {cargandoResumen ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted small">Cargando partidas recepcionadas...</p>
            </div>
          ) : facturaResumen && (
            <div>
              {/* Ficha cabecera */}
              <div className="bg-light p-3 rounded border mb-3">
                <div className="row g-2">
                  <div className="col-md-6">
                    <span className="text-muted small d-block">PROVEEDOR</span>
                    <strong>{facturaResumen.nombre_proveedor}</strong>
                    <div className="text-secondary small">{facturaResumen.rfc_proveedor}</div>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">RAZÓN SOCIAL RECEPTORA</span>
                    <strong className="text-dark">{facturaResumen.nombre_receptor || "No especificada"}</strong>
                    {facturaResumen.rfc_receptor && (
                      <div className="text-secondary small">{facturaResumen.rfc_receptor}</div>
                    )}
                  </div>
                  <div className="col-md mt-2">
                    <span className="text-muted small d-block">ESTATUS</span>
                    {renderBadgeEstatus(facturaResumen.estatus, facturaResumen.tiene_incidencias === 1)}
                  </div>
                  <div className="col-md mt-2">
                    <span className="text-muted small d-block">FECHA SUBIDA</span>
                    <span className="fw-semibold text-dark">
                      {facturaResumen.fecha_subida ? new Date(facturaResumen.fecha_subida).toLocaleString() : "-"}
                    </span>
                  </div>
                  <div className="col-md mt-2">
                    <span className="text-muted small d-block">SUBIDO POR</span>
                    <span className="text-dark">{facturaResumen.subido_por || "Compras"}</span>
                  </div>
                  <div className="col-md mt-2">
                    <span className="text-muted small d-block">FECHA RECEPCIÓN</span>
                    <span className="fw-semibold text-dark">
                      {facturaResumen.fecha_recepcion ? new Date(facturaResumen.fecha_recepcion).toLocaleString() : "-"}
                    </span>
                  </div>
                  <div className="col-md mt-2">
                    <span className="text-muted small d-block">RECIBIDO POR</span>
                    <span className="text-dark">{facturaResumen.recibido_por || "Operador"}</span>
                  </div>
                </div>

                {facturaResumen.observaciones_generales && (
                  <div className="mt-2 pt-2 border-top text-danger small">
                    <strong>Observaciones generales:</strong> {facturaResumen.observaciones_generales}
                  </div>
                )}
              </div>

              {/* Tabla de Partidas */}
              <h6 className="fw-bold mb-2 text-secondary" style={{ fontSize: "0.85rem" }}>
                Partidas Verificadas ({facturaResumen.partidas?.length || facturaResumen.total_partidas || 0})
              </h6>
              <div className="table-responsive border rounded" style={{ maxHeight: "300px" }}>
                <table className="table table-sm table-striped align-middle mb-0" style={{ fontSize: "0.8rem" }}>
                  <thead className="table-light sticky-top">
                    <tr>
                      <th style={{ width: "35px" }}>#</th>
                      <th>Clave Prov.</th>
                      <th>Nuestra Clave</th>
                      <th>Descripción</th>
                      <th className="text-center">Facturado</th>
                      <th className="text-center">Recibido</th>
                      <th className="text-center">Estatus</th>
                      <th>Obs.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(facturaResumen.partidas || []).map((p, idx) => {
                      const tieneAnomalia = p.observacion || p.estatus_partida !== "COMPLETA";
                      return (
                        <tr key={p.id || idx} className={tieneAnomalia ? "table-warning" : ""}>
                          <td>{p.numero_partida || idx + 1}</td>
                          <td className="fw-bold">{p.clave_proveedor}</td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {p.clave_interna || "N/A"}
                            </span>
                          </td>
                          <td className="text-truncate" style={{ maxWidth: "200px" }} title={p.descripcion}>
                            {p.descripcion || "-"}
                          </td>
                          <td className="text-center fw-bold">{p.cantidad_facturada}</td>
                          <td className="text-center fw-bold text-primary">{p.cantidad_recibida}</td>
                          <td className="text-center">
                            {p.estatus_partida === "DANADA" ? (
                              <span className="badge bg-danger">Dañado</span>
                            ) : p.estatus_partida === "INCOMPLETA" ? (
                              <span className="badge bg-warning text-dark">Faltante</span>
                            ) : p.estatus_partida === "INCORRECTO" ? (
                              <span className="badge bg-danger">Incorrecto</span>
                            ) : (p.estatus_partida === "OTRA" || p.estatus_partida === "INCIDENCIA" || p.observacion) ? (
                              <span className="badge bg-warning text-dark">Incidencia</span>
                            ) : (
                              <span className="badge bg-success">Completa</span>
                            )}
                          </td>
                          <td className="small text-danger">{p.observacion || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="py-1">
          <Button variant="secondary" size="sm" onClick={() => setFacturaResumen(null)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CodigoBarras;
