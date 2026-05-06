import { useState, useContext, useEffect, useRef } from "react";
import Barcode from "react-barcode";
import Axios from "axios";
import { DataContext } from "../../contexts/dataContext";
import { show_alerta } from "../../functions";

const API_URL = "http://75.119.150.222:3010";
const SUGERENCIAS_API = "https://sistemahidraulico.mx/api-externa/clavesalternas/buscar";
const SUGERENCIAS_API_KEY = "sm_ecommerce_x2ve9yFf0aiDxh1HelezpVeyRAcngGwgEg3ZnSZwhGg2SaZrd2gQiysiVo86R3LcUZFFxZDSMADepof1jMLSumIbiqBRcbjyhvA78haaxnLrrbOuU3zqCi0kQXJf1gSc";

const useCodigoBarras = () => {
  const { valor } = useContext(DataContext);
  const { contextData } = valor;
  const infoUsuario = contextData;

  const [partidas, setPartidas] = useState([]);
  const [partidasPrint, setPartidasPrint] = useState([]);
  const [qty, setQty] = useState("1");
  const [value, setValue] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [totalCab, setTotalCab] = useState("0");
  const [price, setPrice] = useState("0");
  const [preciosList, setPreciosList] = useState([]);
  const [clavesxLote, setClavesxLote] = useState("");
  const [showLogisticaModal, setShowLogisticaModal] = useState(false);
  const [logisticaImported, setLogisticaImported] = useState(false);

  const componentRef = useRef();
  const barcodeRef = useRef();

  useEffect(() => {
    const cerrarDropdown = () => setSugerencias([]);
    window.addEventListener('click', cerrarDropdown);
    return () => window.removeEventListener('click', cerrarDropdown);
  }, []);

  const getPrecios = () => {
    Axios.get(`${API_URL}/precios/getprecios/`, {
      params: { sucursal: infoUsuario.sucursal }
    }).then((response) => {
      setPreciosList(response.data);
    });
  };

  const handleChange = async (e) => {
    const texto = e.target.value;
    setValue(texto);

    if (texto.length > 4) {
      try {
        const res = await Axios.get(SUGERENCIAS_API, {
          params: { q: texto },
          headers: { 'x-api-key': SUGERENCIAS_API_KEY }
        });
        setSugerencias(res.data);
      } catch (err) {
        console.error("Error buscando sugerencias", err);
      }
    } else {
      setSugerencias([]);
    }
  };

  const onSearch = (searchTerm) => {
    if (preciosList.length > 0) {
      const filtrado = preciosList.find((item) =>
        item.clave.toUpperCase().includes(searchTerm.toUpperCase())
      );
      if (filtrado) {
        setTotalCab(parseInt(qty) * filtrado.precio);
        setPrice(filtrado.precio);
      }
    }
  };

  const crearBarcode = (clave) => (
    <Barcode
      options={{ fontSize: 10, font: "monospace", displayValue: true }}
      width={1} height={33} ref={barcodeRef} value={clave}
    />
  );

  const agregarPartida = (activeTab) => {
    const modoSoloTexto = activeTab === "text";
    const uniqueId = Date.now();
    const clave = value;
    const cantidadInt = parseInt(qty) || 1;

    const nuevaPartida = {
      id: uniqueId,
      cantidad: qty,
      clave,
      descripcion,
      soloTexto: modoSoloTexto,
      barcode: !modoSoloTexto ? crearBarcode(clave) : null
    };

    setPartidas((prev) => [...prev, nuevaPartida]);

    const partidasImpre = [];
    for (let j = 0; j < cantidadInt; j++) {
      partidasImpre.push({
        ...nuevaPartida,
        id: `${uniqueId}-${j}`,
        barcode: !modoSoloTexto ? crearBarcode(clave) : null
      });
    }
    setPartidasPrint((prev) => [...prev, ...partidasImpre]);

    setQty("1");
    setValue("");
    setDescripcion("");
  };

  const borrar = (item) => {
    const idStr = item.id.toString();
    const parts = idStr.split('-');

    if (parts.length >= 2 && isNaN(item.id)) {
      setPartidas((prev) => prev.filter((p) => p.id !== item.id));
      setPartidasPrint((prev) => prev.filter((p) => p.id !== `${idStr}-0`));
    } else {
      setPartidas((prev) => prev.filter((p) => p.id !== item.id));
      setPartidasPrint((prev) => prev.filter((p) => p.id.toString().split('-')[0] !== idStr));
    }
  };

  const agregarLote = () => {
    const lines = clavesxLote.split("\n");
    const loteTemp = [];

    for (let i = 0; i < lines.length; i++) {
      const clave = lines[i];
      if (clave.trim()) {
        loteTemp.push({
          id: `lote-${Date.now()}-${i}`,
          cantidad: "1",
          clave,
          barcode: <Barcode width={1} height={35} ref={barcodeRef} value={clave} />,
        });
      }
    }

    setPartidas(loteTemp);
    setPartidasPrint(loteTemp);
    setClavesxLote("");
  };

  const handleImportLogistica = (nuevasPartidas) => {
    const uniqueId = Date.now();
    const procesadas = nuevasPartidas.map((item, i) => ({
      ...item,
      id: `${uniqueId}-${i}`
    }));

    const procesadasPrint = nuevasPartidas.map((item, i) => ({
      ...item,
      id: `${uniqueId}-${i}-0`
    }));

    setPartidas((prev) => [...prev, ...procesadas]);
    setPartidasPrint((prev) => [...prev, ...procesadasPrint]);
    setLogisticaImported(true);
    show_alerta(`Se procesaron ${nuevasPartidas.length} registros`, "success");
  };

  const limpiarTodo = () => {
    setPartidas([]);
    setPartidasPrint([]);
    setLogisticaImported(false);
  };

  return {
    partidas,
    partidasPrint,
    qty,
    value,
    sugerencias,
    descripcion,
    totalCab,
    price,
    clavesxLote,
    showLogisticaModal,
    logisticaImported,
    infoUsuario,
    setQty,
    setValue,
    setDescripcion,
    setClavesxLote,
    setShowLogisticaModal,
    getPrecios,
    handleChange,
    onSearch,
    agregarPartida,
    borrar,
    agregarLote,
    handleImportLogistica,
    limpiarTodo,
    componentRef,
  };
};

export default useCodigoBarras;
