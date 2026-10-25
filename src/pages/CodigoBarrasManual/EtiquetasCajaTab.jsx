import React, { useState, useEffect, useMemo, useRef } from "react";
import Axios from "axios";
import Barcode from "react-barcode";
import { useReactToPrint } from "react-to-print";
import {
  BiPackage,
  BiSortAlt2,
  BiPlus,
  BiTrash,
  BiPrinter,
  BiRefresh,
  BiCheckCircle,
  BiLayer,
  BiSliderAlt,
  BiTransferAlt,
} from "react-icons/bi";
import { show_alerta } from "../../functions";
import Logo from "../../assets/Logo20.jpeg";

const URL_API1 = process.env.REACT_APP_URL_API1;
const URL_API2 = `${process.env.REACT_APP_URL_API2}/api/v1`;
const RAW_API3 = process.env.REACT_APP_URL_API3 || "";
// Si el servidor de desarrollo de React se inició antes de cambiar el .env y aún conserva localhost:3005,
// apuntamos directamente a https://sistemahidraulico.mx/api-externa
const URL_API3 =
  !RAW_API3 || RAW_API3.includes("localhost:3005")
    ? "https://sistemahidraulico.mx/api-externa"
    : RAW_API3;
const API3_KEY =
  "sm_ecommerce_x2ve9yFf0aiDxh1HelezpVeyRAcngGwgEg3ZnSZwhGg2SaZrd2gQiysiVo86R3LcUZFFxZDSMADepof1jMLSumIbiqBRcbjyhvA78haaxnLrrbOuU3zqCi0kQXJf1gSc";

const API3_HEADERS = {
  "x-api-key": API3_KEY,
};

const inferirMarcaDesdeDescripcion = (descr = "") => {
  const txt = String(descr || "").toUpperCase();
  if (!txt) return "";
  if (txt.includes("SEALMARKET") || txt.includes("SEALMAR") || /\bSEALM\b/.test(txt)) {
    return "SEALMARKET";
  }
  const marcasConocidas = [
    "CATERPILLAR",
    "HERCULES",
    "HALLITE",
    "KASTAS",
    "MERKEL",
    "PARKER",
    "GARLOCK",
    "DICHTOMATIK",
    "FREUDENBERG",
    "TRELLEBORG",
    "NATIONAL",
    "CORTECO",
    "SKF",
    "NOK",
  ];
  for (const m of marcasConocidas) {
    if (txt.includes(m)) return m;
  }
  if (/\bHE$/.test(txt.trim())) return "HERCULES";
  return "";
};

// Mapa de respaldo por si el catálogo de nombres de almacén tarda o no responde
const ALMACENES_FALLBACK = {
  "1": "Durango",
  "3": "Fresnillo",
  "4": "Torreón",
  "5": "Mazatlán",
  "6": "Zacatecas",
  "7": "Querétaro",
  "10": "Fresnillo",
};

const normalizarTexto = (txt) =>
  String(txt || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

/**
 * Extrae la existencia numérica correspondiente al almacén seleccionado
 * a partir del objeto EXISTENCIA devuelto por /inventario/productos-etiquetas-caja
 * (ej. { Durango: 67, Mazatlán: 29, Zacatecas: 77, Querétaro: 47, Fresnillo: 42 })
 */
const obtenerExistenciaEnAlmacen = (existenciaObj, almacenId, mapaNombres) => {
  if (!existenciaObj || typeof existenciaObj !== "object") return 0;
  const nombreAlmacen =
    mapaNombres?.[String(almacenId).trim()] ||
    ALMACENES_FALLBACK[String(almacenId).trim()] ||
    "";
  if (!nombreAlmacen) return 0;

  const targetNorm = normalizarTexto(nombreAlmacen);
  for (const [key, val] of Object.entries(existenciaObj)) {
    if (normalizarTexto(key) === targetNorm) {
      const num = parseFloat(val);
      return Number.isNaN(num) ? 0 : num;
    }
  }
  return 0;
};

/**
 * Consulta el endpoint POST /inventario/productos-etiquetas-caja
 * enviando { linea: ["..."] } como arreglo no vacío
 */
const consultarProductosEtiquetasCajaPorLinea = async (linea) => {
  const lineaLimpia = String(linea || "").trim().toUpperCase();
  if (!lineaLimpia) return [];

  const payload = { linea: [lineaLimpia] };

  const res = await Axios.post(
    `${URL_API1}/inventario/productos-etiquetas-caja`,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return Array.isArray(res.data) ? res.data : res.data?.data || res.data?.body || [];
};

/**
 * Convierte una medida (ej. "30", "12.5", "1-3/4", "3/8") a número flotante
 * para garantizar un ordenamiento estrictamente numérico de menor a mayor.
 */
const parseMedidaNumerica = (val) => {
  if (val === null || val === undefined) return Number.POSITIVE_INFINITY;
  const str = String(val).trim();
  if (!str) return Number.POSITIVE_INFINITY;

  // Caso fracción mixta tipo "1-3/4" o "1 3/4"
  const mixtaMatch = str.match(/^(\d+)[\s-]+(\d+)\/(\d+)$/);
  if (mixtaMatch) {
    const entero = parseFloat(mixtaMatch[1]);
    const num = parseFloat(mixtaMatch[2]);
    const den = parseFloat(mixtaMatch[3]);
    if (den !== 0) return entero + num / den;
  }

  // Caso fracción simple tipo "3/4"
  const fracMatch = str.match(/^(\d+)\/(\d+)$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1]);
    const den = parseFloat(fracMatch[2]);
    if (den !== 0) return num / den;
  }

  // Limpiar caracteres no numéricos excepto punto y signo
  const limpio = str.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(limpio);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
};

/**
 * Construye la cadena de medida que se muestra debajo de la clave en la etiqueta:
 * Ej. "30x40x12.5"
 */
const construirMedidaEtiqueta = (prod, ordenDiametro) => {
  const di = String(prod.diametrointerior ?? "").trim();
  const de = String(prod.diametroexterior ?? "").trim();
  const alt = String(prod.altura ?? "").trim();
  const sec = String(prod.seccion ?? "").trim();

  const diametros =
    ordenDiametro === "exterior_interior" ? [de, di] : [di, de];

  // Si tiene altura usamos [D1, D2, Altura]; si no tiene altura pero sí sección (ej. O-rings), usamos sección
  const terceraMedida = alt || sec;
  const partes = [...diametros, terceraMedida].filter((p) => p !== "");

  return partes.length > 0 ? partes.join("x") : "-";
};

// Constantes fijas de tamaño para código de barras y textos (calibradas para albergar hasta 6 productos)
const MAX_PRODUCTOS_POR_CAJA = 6;
const BARCODE_FIXED_WIDTH = 1.0;
const BARCODE_FIXED_HEIGHT = 34;

const BoxBarcode = ({ value, width, height }) => {
  const wrapRef = useRef(null);

  useEffect(() => {
    if (wrapRef.current) {
      const svg = wrapRef.current.querySelector("svg");
      if (svg) {
        svg.setAttribute("preserveAspectRatio", "none");
        svg.style.height = `${height}px`;
      }
    }
  }, [value, width, height]);

  return (
    <div ref={wrapRef} className="ec-barcode-svg-wrap">
      <Barcode
        value={value}
        width={width}
        height={height}
        margin={0}
        displayValue={false}
      />
    </div>
  );
};

const EtiquetasCajaTab = () => {
  // Catálogos base
  const [catalogoProductosApi3, setCatalogoProductosApi3] = useState([]);
  const [stocksAlmacen, setStocksAlmacen] = useState([]);
  const [nombresAlmacenes, setNombresAlmacenes] = useState(ALMACENES_FALLBACK);
  const [almacenesDisponibles, setAlmacenesDisponibles] = useState([]);

  // Estados de carga
  const [cargandoInicial, setCargandoInicial] = useState(false);
  const [cargandoStocks, setCargandoStocks] = useState(false);
  const [cargandoFamilia, setCargandoFamilia] = useState(false);

  // Paso 1: Selección de Origen
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState("");
  const [lineaSeleccionada, setLineaSeleccionada] = useState("");
  const [busquedaLinea, setBusquedaLinea] = useState("");
  const [familiaTexto, setFamiliaTexto] = useState("");
  const [seccionManualHeader, setSeccionManualHeader] = useState("");

  // Paso 2: Ordenamiento Jerárquico
  const [incluirSeccion, setIncluirSeccion] = useState(false);
  const [ordenDiametro, setOrdenDiametro] = useState("interior_exterior"); // 'interior_exterior' | 'exterior_interior'

  // Paso 3: Reglas dinámicas de capacidad en cascada
  const [reglasCapacidad, setReglasCapacidad] = useState([
    { id: "base-1", desdeCaja: 1, productosPorCaja: 4 },
  ]);
  const [nuevaReglaCaja, setNuevaReglaCaja] = useState("");
  const [nuevaReglaCantidad, setNuevaReglaCantidad] = useState(4);

  // Rango opcional de impresión de cajas
  const [cajaInicioPrint, setCajaInicioPrint] = useState(1);
  const [cajaFinPrint, setCajaFinPrint] = useState(9999);

  // Popover rápido en etiqueta de vista previa
  const [cajaEditandoInline, setCajaEditandoInline] = useState(null);

  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Etiquetas_Caja_${lineaSeleccionada || "Linea"}_Alm${almacenSeleccionado}`,
  });

  // 1. Carga inicial: Catálogo ligero para mapear clave -> línea en el selector de Paso 1,
  // almacenes registrados en stocks_almacenes y catálogo de nombres de almacenes
  useEffect(() => {
    let cancelado = false;
    const cargarBase = async () => {
      setCargandoInicial(true);
      try {
        const [resProdsFirebird, resStocksAll, resAlmCat] =
          await Promise.allSettled([
            Axios.get(`${URL_API1}/compras/getcatalogo-firebird`).catch(() =>
              Axios.get(`${URL_API3}/productos-detallado`, {
                headers: API3_HEADERS,
              })
            ),
            Axios.get(`${URL_API2}/stocks-almacenes`),
            Axios.get(`${URL_API1}/compras/getalmacenes`),
          ]);

        if (cancelado) return;

        if (
          resProdsFirebird.status === "fulfilled" &&
          Array.isArray(resProdsFirebird.value.data)
        ) {
          setCatalogoProductosApi3(resProdsFirebird.value.data);
        } else {
          show_alerta("No se pudo cargar el catálogo de líneas desde SAE.", "error");
        }

        if (resAlmCat.status === "fulfilled" && Array.isArray(resAlmCat.value.data)) {
          const mapa = { ...ALMACENES_FALLBACK };
          resAlmCat.value.data.forEach((a) => {
            if (a.id !== undefined && a.nombre) {
              mapa[String(a.id).trim()] = String(a.nombre).trim();
            }
          });
          setNombresAlmacenes(mapa);
        }

        if (resStocksAll.status === "fulfilled") {
          const todos = resStocksAll.value.data?.body || [];
          const setAlm = new Set(
            todos
              .filter((r) => parseFloat(r.max) > 0)
              .map((r) => String(r.almacen ?? "").trim())
              .filter(Boolean)
          );
          const listaAlm = Array.from(setAlm).sort(
            (a, b) => parseFloat(a) - parseFloat(b)
          );
          setAlmacenesDisponibles(listaAlm);
          if (listaAlm.length > 0 && !almacenSeleccionado) {
            setAlmacenSeleccionado(listaAlm[0]);
          }
        }
      } catch (err) {
        console.error("Error cargando datos base para etiquetas de caja:", err);
      } finally {
        if (!cancelado) setCargandoInicial(false);
      }
    };

    cargarBase();
    return () => {
      cancelado = true;
    };
  }, []);

  // 2. Cuando cambia el almacén seleccionado, consultamos únicamente sus stocks (max > 0)
  useEffect(() => {
    if (!almacenSeleccionado) {
      setStocksAlmacen([]);
      return;
    }

    let cancelado = false;
    const cargarStocksDeAlmacen = async () => {
      setCargandoStocks(true);
      try {
        const res = await Axios.get(
          `${URL_API2}/stocks-almacenes?almacen=${encodeURIComponent(almacenSeleccionado)}`
        );
        if (cancelado) return;
        const lista = res.data?.body || [];
        // Regla de negocio base: productos cuyo max sea mayor a 0
        const conPresencia = lista.filter((r) => {
          const maxNum = parseFloat(r.max);
          return !Number.isNaN(maxNum) && maxNum > 0;
        });
        setStocksAlmacen(conPresencia);
      } catch (err) {
        if (!cancelado) {
          console.error("Error al consultar stocks del almacén:", err);
          show_alerta("Error al cargar los productos del almacén seleccionado.", "error");
        }
      } finally {
        if (!cancelado) setCargandoStocks(false);
      }
    };

    cargarStocksDeAlmacen();
    return () => {
      cancelado = true;
    };
  }, [almacenSeleccionado]);

  // Mapa de catálogo de productos por clave enriquecido desde POST /inventario/productos-etiquetas-caja
  const mapaProductosPorClave = useMemo(() => {
    const map = new Map();

    catalogoProductosApi3.forEach((p) => {
      const cve = String(p.CVE_ART ?? p.clave ?? "").trim().toUpperCase();
      if (!cve) return;
      const descr = String(p.DESCR ?? p.descripcion ?? "").trim();
      const lin = String(p.LIN_PROD ?? p.linea ?? "").trim().toUpperCase();
      const marcaDirecta = String(p.MARCA ?? p.marca ?? "").trim();

      map.set(cve, {
        clave: String(p.CVE_ART ?? p.clave ?? cve).trim(),
        descripcion: descr,
        linea: lin,
        diametrointerior: String(
          p.DIAM_INT ?? p["Diámetro Interior"] ?? p.diametrointerior ?? ""
        ).trim(),
        diametroexterior: String(
          p.DIAM_EXT ?? p["Diámetro Exterior"] ?? p.diametroexterior ?? ""
        ).trim(),
        altura: String(p.ALTURA ?? p.Altura ?? p.altura ?? "").trim(),
        seccion: String(p.SECCION ?? p.Seccion ?? p.seccion ?? "").trim(),
        perfil: String(p.PERFIL ?? p.Perfil ?? p.perfil ?? "").trim(),
        marca: marcaDirecta || inferirMarcaDesdeDescripcion(descr),
        familia: String(p.FAMILIA ?? p.Familia ?? p.CAT_ECOMM ?? p.familia ?? "").trim(),
        existenciasPorAlmacen:
          p.EXISTENCIA && typeof p.EXISTENCIA === "object" ? p.EXISTENCIA : null,
      });
    });

    return map;
  }, [catalogoProductosApi3]);

  // Productos del almacén seleccionado (desde stocks_almacenes con max > 0) enriquecidos con /inventario/productos-etiquetas-caja
  const productosEnAlmacen = useMemo(() => {
    const resultado = [];
    const clavesVistas = new Set();

    stocksAlmacen.forEach((st) => {
      const cve = String(st.clave ?? "").trim().toUpperCase();
      if (!cve || clavesVistas.has(cve)) return;
      const prodCat = mapaProductosPorClave.get(cve);
      if (!prodCat) return;

      clavesVistas.add(cve);
      resultado.push({
        ...prodCat,
        clave: String(prodCat.clave || st.clave).trim(),
        linea: String(prodCat.linea || "").trim().toUpperCase(),
        maxStock: st.max,
        minStock: st.min,
        rotacion: st.rotacion,
      });
    });

    return resultado;
  }, [stocksAlmacen, mapaProductosPorClave]);

  // Líneas disponibles en el almacén seleccionado (con conteo de productos con max > 0)
  const lineasDisponibles = useMemo(() => {
    const conteoPorLinea = new Map();
    productosEnAlmacen.forEach((p) => {
      if (!p.linea) return;
      conteoPorLinea.set(p.linea, (conteoPorLinea.get(p.linea) || 0) + 1);
    });

    return Array.from(conteoPorLinea.entries())
      .map(([linea, total]) => ({ linea, total }))
      .sort((a, b) => a.linea.localeCompare(b.linea));
  }, [productosEnAlmacen]);

  const lineasFiltradasSelector = useMemo(() => {
    const q = busquedaLinea.trim().toUpperCase();
    if (!q) return lineasDisponibles;
    return lineasDisponibles.filter((item) => item.linea.includes(q));
  }, [lineasDisponibles, busquedaLinea]);

  // Productos de la línea y almacén seleccionados:
  // 1) Todos los productos de la línea que están en stocks_almacenes (max > 0)
  // 2) Más cualquier producto adicional de la misma línea que no esté en stocks_almacenes pero tenga EXISTENCIA > 0 en este almacén
  const productosLineaCrudos = useMemo(() => {
    if (!lineaSeleccionada) return [];
    const base = productosEnAlmacen.filter((p) => p.linea === lineaSeleccionada);
    const clavesEnBase = new Set(
      base.map((p) => String(p.clave || "").trim().toUpperCase())
    );

    const extrasConExistencia = [];
    mapaProductosPorClave.forEach((prodCat, cve) => {
      if (prodCat.linea !== lineaSeleccionada || clavesEnBase.has(cve)) return;
      const existEnAlmacen = obtenerExistenciaEnAlmacen(
        prodCat.existenciasPorAlmacen,
        almacenSeleccionado,
        nombresAlmacenes
      );
      if (existEnAlmacen > 0) {
        clavesEnBase.add(cve);
        extrasConExistencia.push({
          ...prodCat,
          existenciaActual: existEnAlmacen,
        });
      }
    });

    console.log(
      `[EXCEPCIONES - Línea ${lineaSeleccionada} | Almacén ${almacenSeleccionado}] Productos con existencia fuera de stocks_almacenes (${extrasConExistencia.length}):`,
      extrasConExistencia
    );

    return [...base, ...extrasConExistencia];
  }, [
    productosEnAlmacen,
    lineaSeleccionada,
    mapaProductosPorClave,
    almacenSeleccionado,
    nombresAlmacenes,
  ]);

  // Detectar automáticamente si la línea seleccionada maneja la dimensión "sección"
  const infoSeccionLinea = useMemo(() => {
    if (productosLineaCrudos.length === 0) {
      return { tieneSeccion: false, cantidadConSeccion: 0 };
    }
    const conSeccion = productosLineaCrudos.filter(
      (p) => String(p.seccion ?? "").trim() !== ""
    );
    return {
      tieneSeccion: conSeccion.length > 0,
      cantidadConSeccion: conSeccion.length,
    };
  }, [productosLineaCrudos]);

  // Al cambiar de línea:
  // Consultar en POST /inventario/productos-etiquetas-caja enviando exclusivamente { linea: lineaSeleccionada }
  // para recibir el universo completo de productos de esa línea (con medidas, familia, perfil, marca y existencias por almacén)
  useEffect(() => {
    if (!lineaSeleccionada) {
      setFamiliaTexto("");
      setIncluirSeccion(false);
      return;
    }

    setReglasCapacidad([{ id: "base-1", desdeCaja: 1, productosPorCaja: 4 }]);
    setCajaEditandoInline(null);

    let cancelado = false;

    const cargarUniversoDeLinea = async () => {
      setCargandoFamilia(true);
      try {
        const universoLinea = await consultarProductosEtiquetasCajaPorLinea(
          lineaSeleccionada
        );
        if (cancelado || universoLinea.length === 0) return;

        const tieneSec = universoLinea.some(
          (item) => String(item.SECCION ?? item.Seccion ?? item.seccion ?? "").trim() !== ""
        );
        setIncluirSeccion(tieneSec);

        const famDetectada =
          universoLinea.find(
            (item) => String(item.FAMILIA ?? item.Familia ?? item.familia ?? "").trim() !== ""
          )?.FAMILIA || lineaSeleccionada;
        setFamiliaTexto(String(famDetectada).trim().toUpperCase());

        setCatalogoProductosApi3((prev) => {
          const mapaPrev = new Map();
          prev.forEach((item) => {
            const c = String(item.CVE_ART ?? item.clave ?? "").trim().toUpperCase();
            if (c) mapaPrev.set(c, item);
          });
          universoLinea.forEach((item) => {
            const c = String(item.CVE_ART ?? item.clave ?? "").trim().toUpperCase();
            if (c) mapaPrev.set(c, { ...(mapaPrev.get(c) || {}), ...item });
          });
          return Array.from(mapaPrev.values());
        });
      } catch (err) {
        console.warn(
          "Aviso al consultar universo de la línea en /inventario/productos-etiquetas-caja:",
          err.message
        );
      } finally {
        if (!cancelado) setCargandoFamilia(false);
      }
    };

    cargarUniversoDeLinea();

    return () => {
      cancelado = true;
    };
  }, [lineaSeleccionada]);

  // Paso 2: Ordenar jerárquicamente de menor a mayor los productos de la línea
  const productosOrdenados = useMemo(() => {
    if (productosLineaCrudos.length === 0) return [];

    const copia = [...productosLineaCrudos];
    copia.sort((a, b) => {
      // 1. Nivel: Sección (si está habilitado)
      if (incluirSeccion) {
        const secA = parseMedidaNumerica(a.seccion);
        const secB = parseMedidaNumerica(b.seccion);
        if (secA !== secB) return secA - secB;
      }

      // 2. Nivel: Diámetro prioritario y secundario
      const diA = parseMedidaNumerica(a.diametrointerior);
      const diB = parseMedidaNumerica(b.diametrointerior);
      const deA = parseMedidaNumerica(a.diametroexterior);
      const deB = parseMedidaNumerica(b.diametroexterior);

      if (ordenDiametro === "interior_exterior") {
        if (diA !== diB) return diA - diB;
        if (deA !== deB) return deA - deB;
      } else {
        if (deA !== deB) return deA - deB;
        if (diA !== diB) return diA - diB;
      }

      // 3. Nivel fijo: Altura
      const altA = parseMedidaNumerica(a.altura);
      const altB = parseMedidaNumerica(b.altura);
      if (altA !== altB) return altA - altB;

      // Desempate alfabético por clave
      return String(a.clave).localeCompare(String(b.clave));
    });

    return copia;
  }, [productosLineaCrudos, incluirSeccion, ordenDiametro]);

  // Normalizar y ordenar reglas de capacidad por desdeCaja ascendente
  const reglasOrdenadas = useMemo(() => {
    const copia = [...reglasCapacidad]
      .map((r) => ({
        ...r,
        desdeCaja: Math.max(1, parseInt(r.desdeCaja, 10) || 1),
        productosPorCaja: Math.max(
          1,
          Math.min(MAX_PRODUCTOS_POR_CAJA, parseInt(r.productosPorCaja, 10) || 4)
        ),
      }))
      .sort((a, b) => a.desdeCaja - b.desdeCaja);

    // Asegurar que siempre exista la regla desdeCaja = 1
    if (copia.length === 0 || copia[0].desdeCaja !== 1) {
      copia.unshift({ id: "base-1", desdeCaja: 1, productosPorCaja: 4 });
    }
    return copia;
  }, [reglasCapacidad]);

  // Paso 3: Construir las cajas aplicando las reglas en cascada
  const { cajasGeneradas, resumenTramos } = useMemo(() => {
    if (productosOrdenados.length === 0) {
      return { cajasGeneradas: [], resumenTramos: [] };
    }

    const cajas = [];
    let cursorProducto = 0;
    let numeroCaja = 1;

    while (cursorProducto < productosOrdenados.length) {
      // Buscar la regla activa para este número de caja (la última con desdeCaja <= numeroCaja)
      let reglaActiva = reglasOrdenadas[0];
      for (let i = 0; i < reglasOrdenadas.length; i++) {
        if (reglasOrdenadas[i].desdeCaja <= numeroCaja) {
          reglaActiva = reglasOrdenadas[i];
        } else {
          break;
        }
      }

      const capacidad = Math.max(1, reglaActiva.productosPorCaja);
      const lote = productosOrdenados.slice(cursorProducto, cursorProducto + capacidad);

      // Marcas y perfiles únicos (sin repetir palabras) presentes en la caja
      const marcasUnicas = Array.from(
        new Set(
          lote
            .map((p) => String(p.marca ?? "").trim().toUpperCase())
            .filter(Boolean)
        )
      );
      const perfilesUnicos = Array.from(
        new Set(
          lote
            .map((p) => String(p.perfil ?? "").trim().toUpperCase())
            .filter(Boolean)
        )
      );

      // Secciones presentes en la caja
      const seccionesUnicas = Array.from(
        new Set(
          lote
            .map((p) => String(p.seccion ?? "").trim())
            .filter(Boolean)
        )
      );

      const esInicioDeTramo = reglasOrdenadas.some(
        (r) => r.desdeCaja === numeroCaja
      );

      cajas.push({
        numeroCaja,
        capacidadAplicada: capacidad,
        esInicioDeTramo,
        productos: lote,
        marcasTexto: marcasUnicas.join(", "),
        perfilesTexto: perfilesUnicos.join(", "),
        seccionAuto: seccionesUnicas.join(", "),
      });

      cursorProducto += lote.length;
      numeroCaja += 1;
    }

    const totalCajas = cajas.length;

    // Calcular el rango resultante para cada regla en el panel constructor
    const tramos = reglasOrdenadas.map((regla, idx) => {
      const siguienteRegla = reglasOrdenadas[idx + 1];
      const hastaCaja = siguienteRegla
        ? Math.min(totalCajas, siguienteRegla.desdeCaja - 1)
        : totalCajas;
      const cajasEnTramo = cajas.filter(
        (c) =>
          c.numeroCaja >= regla.desdeCaja &&
          (siguienteRegla ? c.numeroCaja < siguienteRegla.desdeCaja : true)
      );
      const totalProdsTramo = cajasEnTramo.reduce(
        (acc, c) => acc + c.productos.length,
        0
      );

      return {
        ...regla,
        hastaCaja,
        activa: regla.desdeCaja <= totalCajas,
        totalCajasTramo: cajasEnTramo.length,
        totalProdsTramo,
      };
    });

    return { cajasGeneradas: cajas, resumenTramos: tramos };
  }, [productosOrdenados, reglasOrdenadas]);

  // Ajustar el rango de impresión cuando cambia el total de cajas
  useEffect(() => {
    setCajaInicioPrint(1);
    setCajaFinPrint(cajasGeneradas.length || 1);
  }, [cajasGeneradas.length, lineaSeleccionada]);

  // Filtrar cajas por rango de impresión elegido y agrupar de 4 en 4 por hoja tamaño carta
  const cajasParaImprimir = useMemo(() => {
    const ini = Math.max(1, parseInt(cajaInicioPrint, 10) || 1);
    const fin = Math.max(ini, parseInt(cajaFinPrint, 10) || cajasGeneradas.length);
    return cajasGeneradas.filter(
      (c) => c.numeroCaja >= ini && c.numeroCaja <= fin
    );
  }, [cajasGeneradas, cajaInicioPrint, cajaFinPrint]);

  const hojasCarta = useMemo(() => {
    const hojas = [];
    for (let i = 0; i < cajasParaImprimir.length; i += 4) {
      hojas.push(cajasParaImprimir.slice(i, i + 4));
    }
    return hojas;
  }, [cajasParaImprimir]);

  // Funciones para gestionar reglas de capacidad en cascada
  const definirCapacidadDesdeCaja = (numCaja, cantidadProductos) => {
    const cajaInt = Math.max(1, parseInt(numCaja, 10) || 1);
    const cantInt = Math.max(
      1,
      Math.min(MAX_PRODUCTOS_POR_CAJA, parseInt(cantidadProductos, 10) || 4)
    );

    setReglasCapacidad((prev) => {
      const existe = prev.find((r) => parseInt(r.desdeCaja, 10) === cajaInt);
      if (existe) {
        return prev.map((r) =>
          parseInt(r.desdeCaja, 10) === cajaInt
            ? { ...r, productosPorCaja: cantInt }
            : r
        );
      }
      return [
        ...prev,
        {
          id: `tramo-${Date.now()}-${cajaInt}`,
          desdeCaja: cajaInt,
          productosPorCaja: cantInt,
        },
      ];
    });
    setCajaEditandoInline(null);
  };

  const cambiarDesdeCajaEnRegla = (idRegla, nuevoDesdeCaja) => {
    const val = Math.max(2, parseInt(nuevoDesdeCaja, 10) || 2);
    setReglasCapacidad((prev) =>
      prev.map((r) => (r.id === idRegla ? { ...r, desdeCaja: val } : r))
    );
  };

  const eliminarRegla = (idRegla) => {
    setReglasCapacidad((prev) => prev.filter((r) => r.id !== idRegla));
  };

  const handleAgregarNuevaReglaManual = (e) => {
    e.preventDefault();
    const numCaja = parseInt(nuevaReglaCaja, 10);
    if (!numCaja || numCaja < 1) {
      show_alerta("Indique un número de caja válido (mayor o igual a 1).", "warning");
      return;
    }
    definirCapacidadDesdeCaja(numCaja, nuevaReglaCantidad);
    setNuevaReglaCaja("");
  };

  const reiniciarReglas = () => {
    setReglasCapacidad([{ id: "base-1", desdeCaja: 1, productosPorCaja: 4 }]);
    setCajaEditandoInline(null);
  };

  return (
    <div className="etiquetas-caja-workspace">
      {/* BARRA SUPERIOR DE PASOS 1 Y 2 */}
      <div className="ec-config-grid">
        {/* PASO 1: ORIGEN (ALMACÉN Y LÍNEA EN COLUMNA VERTICAL) */}
        <div className="ec-card ec-step1-card">
          <div className="ec-card-header">
            <span className="ec-step-badge">Paso 1</span>
            <span className="ec-card-title">
              <BiPackage className="me-1" />
              Selección de Almacén y Línea
            </span>
          </div>
          <div className="ec-card-body">
            <div className="d-flex flex-column gap-2">
              {/* Select Almacén */}
              <div>
                <label className="form-label ec-field-label mb-1">
                  Almacén
                </label>
                <select
                  className="form-select form-select-sm ec-control-sm"
                  value={almacenSeleccionado}
                  onChange={(e) => {
                    setAlmacenSeleccionado(e.target.value);
                    setLineaSeleccionada("");
                  }}
                  disabled={cargandoInicial}
                >
                  <option value="">-- Seleccionar --</option>
                  {almacenesDisponibles.map((alm) => (
                    <option key={alm} value={alm}>
                      Almacén {alm}
                      {nombresAlmacenes[alm] ? ` - ${nombresAlmacenes[alm]}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buscador + Select de Línea */}
              <div>
                <label className="form-label ec-field-label mb-1 d-flex align-items-center justify-content-between">
                  <span>Línea a imprimir</span>
                  {(cargandoInicial || cargandoStocks) && almacenSeleccionado && (
                    <span className="ec-inline-loader text-primary">
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                      />
                      Cargando líneas...
                    </span>
                  )}
                </label>
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control ec-control-sm"
                    placeholder="Filtrar línea..."
                    value={busquedaLinea}
                    onChange={(e) => setBusquedaLinea(e.target.value)}
                    style={{ maxWidth: "105px" }}
                    disabled={!almacenSeleccionado || cargandoInicial || cargandoStocks}
                  />
                  <select
                    className="form-select ec-control-sm"
                    value={lineaSeleccionada}
                    onChange={(e) => setLineaSeleccionada(e.target.value)}
                    disabled={!almacenSeleccionado || cargandoInicial || cargandoStocks}
                  >
                    <option value="">
                      {cargandoInicial || cargandoStocks
                        ? "Obteniendo líneas del almacén..."
                        : "-- Elegir Línea --"}
                    </option>
                    {lineasFiltradasSelector.map((item) => (
                      <option key={item.linea} value={item.linea}>
                        {item.linea} ({item.total} prods)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PASO 2: JERARQUÍA DE ORDENAMIENTO DIMENSIONAL */}
        <div className="ec-card ec-step2-card">
          <div className="ec-card-header">
            <span className="ec-step-badge">Paso 2</span>
            <span className="ec-card-title">
              <BiSortAlt2 className="me-1" />
              Jerarquía de Ordenamiento (Menor a Mayor)
            </span>
          </div>
          <div className="ec-card-body d-flex flex-column justify-content-center">
            <div className="ec-step2-controls">
              {/* 1er Nivel: Sección */}
              <div className="ec-seccion-box">
                <div className="form-check form-switch mb-0 d-flex align-items-center gap-2">
                  <input
                    className="form-check-input mt-0"
                    type="checkbox"
                    id="switchIncluirSeccion"
                    checked={incluirSeccion}
                    onChange={(e) => setIncluirSeccion(e.target.checked)}
                    disabled={!lineaSeleccionada}
                  />
                  <label
                    className="form-check-label ec-field-label mb-0"
                    htmlFor="switchIncluirSeccion"
                  >
                    Incluir Sección como 1er criterio
                  </label>
                </div>
                {lineaSeleccionada && !cargandoFamilia && (
                  <span
                    className={`ec-sec-status ${
                      infoSeccionLinea.tieneSeccion ? "ec-sec-detected" : "ec-sec-empty"
                    }`}
                  >
                    {infoSeccionLinea.tieneSeccion ? (
                      <>
                        <BiCheckCircle className="me-1" />
                        {infoSeccionLinea.cantidadConSeccion} productos con sección
                      </>
                    ) : (
                      "Sin sección en esta línea"
                    )}
                  </span>
                )}
              </div>

              {/* 2do Nivel: Prioridad Diámetro Interior vs Exterior (Segmented Control Neutro) */}
              <div className="ec-diam-selector">
                <span className="ec-diam-label">Prioridad de diámetros:</span>
                <div className="ec-segmented-control" role="group">
                  <button
                    type="button"
                    className={`ec-segmented-item ${
                      ordenDiametro === "interior_exterior" ? "active" : ""
                    }`}
                    onClick={() => setOrdenDiametro("interior_exterior")}
                    disabled={!lineaSeleccionada}
                  >
                    Diám. Interior → Exterior
                  </button>
                  <button
                    type="button"
                    className={`ec-segmented-item ${
                      ordenDiametro === "exterior_interior" ? "active" : ""
                    }`}
                    onClick={() => setOrdenDiametro("exterior_interior")}
                    disabled={!lineaSeleccionada}
                  >
                    Diám. Exterior → Interior
                  </button>
                </div>
              </div>

              {/* 3er Nivel: Resumen visual de la jerarquía activa */}
              <div className="ec-pipeline-row">
                <span className="ec-diam-label">Secuencia activa:</span>
                <div className="ec-pipeline-pills">
                  {incluirSeccion && (
                    <>
                      <span className="ec-order-chip ec-chip-sec">1° Sección</span>
                      <span className="ec-chip-arrow">→</span>
                    </>
                  )}
                  <span className="ec-order-chip ec-chip-main">
                    {incluirSeccion ? "2°" : "1°"}{" "}
                    {ordenDiametro === "interior_exterior" ? "Diám. Interior" : "Diám. Exterior"}
                  </span>
                  <span className="ec-chip-arrow">→</span>
                  <span className="ec-order-chip ec-chip-main">
                    {incluirSeccion ? "3°" : "2°"}{" "}
                    {ordenDiametro === "interior_exterior" ? "Diám. Exterior" : "Diám. Interior"}
                  </span>
                  <span className="ec-chip-arrow">→</span>
                  <span className="ec-order-chip ec-chip-fixed">
                    {incluirSeccion ? "4°" : "3°"} Altura
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: PASO 3 (REGLAS EN CASCADA + VISTA PREVIA HOJA CARTA 2x2) */}
      {!lineaSeleccionada ? (
        <div className="ec-empty-state">
          <BiLayer size={36} className="text-secondary mb-2" />
          <div className="ec-empty-title">
            Seleccione un Almacén y una Línea para generar las etiquetas de caja
          </div>
          <p className="ec-helper-text text-muted mb-0">
            Se cargarán automáticamente los productos con stock máximo &gt; 0 en ese almacén,
            ordenados de menor a mayor y agrupados inicialmente de 4 productos por caja.
          </p>
        </div>
      ) : (
        <div className="ec-main-split">
          {/* COLUMNA IZQUIERDA: CONSTRUCTOR DE TRAMOS DINÁMICOS */}
          <div className="ec-rules-panel">
            <div className="ec-card h-100">
              <div className="ec-card-header d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <span className="ec-step-badge">Paso 3</span>
                  <span className="ec-card-title">
                    <BiSliderAlt className="me-1" />
                    Capacidad por Caja
                  </span>
                </div>
                {reglasCapacidad.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-decoration-none p-0"
                    onClick={reiniciarReglas}
                    title="Restablecer a 4 productos por caja en toda la línea"
                  >
                    <BiRefresh /> Resetear
                  </button>
                )}
              </div>

              <div className="ec-card-body">
                {/* Resumen rápido de métricas */}
                <div className="ec-metrics-strip mb-3">
                  <div className="ec-metric-pill">
                    <span className="ec-metric-num">{productosOrdenados.length}</span>
                    <span className="ec-metric-lbl">Productos</span>
                  </div>
                  <div className="ec-metric-pill">
                    <span className="ec-metric-num">{cajasGeneradas.length}</span>
                    <span className="ec-metric-lbl">Cajas</span>
                  </div>
                  <div className="ec-metric-pill">
                    <span className="ec-metric-num">{hojasCarta.length}</span>
                    <span className="ec-metric-lbl">Hojas Carta</span>
                  </div>
                </div>

                <p className="text-muted small mb-2" style={{ fontSize: "0.76rem" }}>
                  Defina cuántos productos caben a partir de cada caja. También puede hacer
                  clic en el botón <strong>⚙️</strong> de cualquier etiqueta en la vista previa.
                </p>

                {/* Tabla / Lista de Tramos en Cascada */}
                <div className="ec-tramos-list mb-3">
                  {resumenTramos.map((tramo, index) => {
                    const esBase = tramo.desdeCaja === 1;
                    return (
                      <div
                        key={tramo.id}
                        className={`ec-tramo-item ${!tramo.activa ? "ec-tramo-inactivo" : ""}`}
                      >
                        <div className="ec-tramo-top">
                          <span className="ec-tramo-tag">Tramo #{index + 1}</span>
                          {tramo.activa ? (
                            <span className="ec-tramo-range">
                              Cajas <strong>{tramo.desdeCaja}</strong> a{" "}
                              <strong>{tramo.hastaCaja}</strong> ({tramo.totalProdsTramo} prods)
                            </span>
                          ) : (
                            <span className="badge bg-warning text-dark" style={{ fontSize: "0.68rem" }}>
                              Fuera de rango (máx caja {cajasGeneradas.length})
                            </span>
                          )}
                          {!esBase && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger ec-btn-del-tramo"
                              onClick={() => eliminarRegla(tramo.id)}
                              title="Eliminar este corte"
                            >
                              <BiTrash />
                            </button>
                          )}
                        </div>

                        <div className="ec-tramo-controls mt-2">
                          <div className="d-flex align-items-center gap-1">
                            <span className="small text-secondary">Desde caja:</span>
                            {esBase ? (
                              <span className="badge bg-secondary">Caja 1</span>
                            ) : (
                              <input
                                type="number"
                                min={2}
                                max={Math.max(2, cajasGeneradas.length)}
                                className="form-control form-control-sm ec-input-num"
                                value={tramo.desdeCaja}
                                onChange={(e) =>
                                  cambiarDesdeCajaEnRegla(tramo.id, e.target.value)
                                }
                              />
                            )}
                          </div>

                          <div className="d-flex align-items-center gap-1">
                            <span className="small text-secondary">Prods/caja:</span>
                            <div className="btn-group btn-group-sm">
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                disabled={tramo.productosPorCaja <= 1}
                                onClick={() =>
                                  definirCapacidadDesdeCaja(
                                    tramo.desdeCaja,
                                    Math.max(1, tramo.productosPorCaja - 1)
                                  )
                                }
                              >
                                -
                              </button>
                              <span className="btn btn-light fw-bold px-2 disabled text-dark border-secondary">
                                {tramo.productosPorCaja}
                              </span>
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                disabled={tramo.productosPorCaja >= MAX_PRODUCTOS_POR_CAJA}
                                onClick={() =>
                                  definirCapacidadDesdeCaja(
                                    tramo.desdeCaja,
                                    Math.min(
                                      MAX_PRODUCTOS_POR_CAJA,
                                      tramo.productosPorCaja + 1
                                    )
                                  )
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Formulario para insertar un nuevo punto de corte */}
                <form onSubmit={handleAgregarNuevaReglaManual} className="ec-add-rule-box">
                  <div className="ec-field-label mb-2 text-primary">
                    <BiPlus className="me-1" />
                    Agregar cambio a partir de otra caja
                  </div>
                  <div className="row g-2 align-items-end">
                    <div className="col-5">
                      <label className="form-label small mb-1" style={{ fontSize: "0.72rem" }}>
                        A partir de Caja #
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={Math.max(2, cajasGeneradas.length)}
                        className="form-control form-control-sm ec-control-sm"
                        placeholder={`Ej. ${Math.min(22, Math.max(2, cajasGeneradas.length))}`}
                        value={nuevaReglaCaja}
                        onChange={(e) => setNuevaReglaCaja(e.target.value)}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small mb-1" style={{ fontSize: "0.72rem" }}>
                        Prods / Caja
                      </label>
                      <select
                        className="form-select form-select-sm ec-control-sm"
                        value={nuevaReglaCantidad}
                        onChange={(e) => setNuevaReglaCantidad(Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "prod" : "prods"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-3">
                      <button type="submit" className="btn btn-primary btn-sm ec-control-sm w-100">
                        Aplicar
                      </button>
                    </div>
                  </div>
                </form>

                {/* Opciones adicionales de impresión */}
                <hr className="my-3" />
                <div className="ec-print-options">
                  <label className="form-label ec-field-label mb-1">
                    Rango de cajas a imprimir:
                  </label>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="ec-helper-text text-muted">De caja</span>
                    <input
                      type="number"
                      min={1}
                      max={cajasGeneradas.length}
                      className="form-control form-control-sm ec-input-num ec-control-sm"
                      value={cajaInicioPrint}
                      onChange={(e) => setCajaInicioPrint(e.target.value)}
                    />
                    <span className="ec-helper-text text-muted">a</span>
                    <input
                      type="number"
                      min={1}
                      max={cajasGeneradas.length}
                      className="form-control form-control-sm ec-input-num ec-control-sm"
                      value={cajaFinPrint}
                      onChange={(e) => setCajaFinPrint(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label ec-field-label mb-1">
                      Sección en encabezado (Opcional, sobreescribe auto):
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm ec-control-sm"
                      placeholder="Auto según productos de la caja"
                      value={seccionManualHeader}
                      onChange={(e) => setSeccionManualHeader(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: PREVISUALIZACIÓN EN VIVO DE HOJAS TAMAÑO CARTA (2x2) */}
          <div className="ec-preview-panel">
            <div className="ec-preview-toolbar">
              <div className="d-flex align-items-center flex-wrap gap-2">
                <span className="ec-card-title">
                  Vista Previa Tamaño Carta (4 etiquetas por hoja)
                </span>
                {!cargandoFamilia && (
                  <span className="text-muted ec-helper-text">
                    Mostrando {cajasParaImprimir.length} cajas en {hojasCarta.length}{" "}
                    {hojasCarta.length === 1 ? "hoja" : "hojas"}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-primary ec-control-sm d-flex align-items-center gap-1"
                onClick={handlePrint}
                disabled={cargandoFamilia || cajasParaImprimir.length === 0}
              >
                <BiPrinter /> Imprimir ahora
              </button>
            </div>

            <div className="ec-sheets-scroll">
              {cargandoFamilia ? (
                /* SKELETON DE HOJA CARTA 2x2 MIENTRAS RESPONDE /inventario/productos-etiquetas-caja */
                <div className="ec-letter-sheet ec-skeleton-sheet">
                  <div className="ec-skeleton-banner">
                    <span
                      className="spinner-border spinner-border-sm text-primary me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    <span>
                      Preparando etiquetas de la línea <strong>{lineaSeleccionada}</strong> (obteniendo medidas, familia, perfil y existencias)...
                    </span>
                  </div>
                  <div className="ec-sheet-grid-2x2">
                    {[1, 2, 3, 4].map((numSkeleton) => (
                      <div key={`skel-box-${numSkeleton}`} className="ec-box-label ec-skeleton-card">
                        {/* Header Skeleton */}
                        <div className="ec-label-header">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="ec-skel-line ec-skel-w45 ec-skel-h18" />
                            <div className="ec-skel-line ec-skel-w30 ec-skel-h14" />
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="ec-skel-line ec-skel-w60 ec-skel-h12" />
                            <div className="ec-skel-badge" />
                          </div>
                        </div>

                        {/* Body Skeleton (4 filas de productos simuladas) */}
                        <div className="ec-label-body">
                          {[1, 2, 3, 4].map((rowIdx) => (
                            <div key={`skel-row-${rowIdx}`} className="ec-product-row">
                              <div className="ec-skel-barcode" />
                              <div className="ec-info-col">
                                <div className="ec-skel-line ec-skel-w85 ec-skel-h14 mb-1" />
                                <div className="ec-skel-line ec-skel-w60 ec-skel-h12" />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Footer Skeleton */}
                        <div className="ec-label-footer">
                          <div className="ec-skel-logo" />
                          <div className="flex-grow-1">
                            <div className="ec-skel-line ec-skel-w70 ec-skel-h10 mb-1" />
                            <div className="ec-skel-line ec-skel-w50 ec-skel-h10" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* CONTENEDOR IMPRIMIBLE REAL */
                <div ref={printRef} className="ec-print-root">
                {hojasCarta.map((cajasEnHoja, hojaIdx) => (
                  <div key={`hoja-${hojaIdx}`} className="ec-letter-sheet">
                    {/* Indicador de número de hoja (solo en pantalla) */}
                    <div className="ec-sheet-badge no-print">
                      Hoja {hojaIdx + 1} de {hojasCarta.length} (Cajas{" "}
                      {cajasEnHoja[0]?.numeroCaja} -{" "}
                      {cajasEnHoja[cajasEnHoja.length - 1]?.numeroCaja})
                    </div>

                    <div className="ec-sheet-grid-2x2">
                      {cajasEnHoja.map((caja) => {
                        const textoSeccionHeader =
                          seccionManualHeader.trim() !== ""
                            ? seccionManualHeader.trim()
                            : incluirSeccion
                            ? caja.seccionAuto
                            : "";

                        return (
                          <div
                            key={`caja-${caja.numeroCaja}`}
                            className={`ec-box-label ${
                              caja.esInicioDeTramo ? "ec-box-tramo-start" : ""
                            }`}
                          >
                            {/* Controles flotantes solo en pantalla para cambiar capacidad desde esta caja */}
                            <div className="ec-inline-rule-trigger no-print">
                              {caja.esInicioDeTramo && (
                                <span className="ec-tramo-pill">
                                  {caja.capacidadAplicada} prod/caja
                                </span>
                              )}
                              <button
                                type="button"
                                className="ec-gear-btn"
                                title={`Cambiar cantidad de productos a partir de la caja ${caja.numeroCaja}`}
                                onClick={() =>
                                  setCajaEditandoInline(
                                    cajaEditandoInline === caja.numeroCaja
                                      ? null
                                      : caja.numeroCaja
                                  )
                                }
                              >
                                ⚙️ Capacidad
                              </button>

                              {cajaEditandoInline === caja.numeroCaja && (
                                <div className="ec-inline-popover">
                                  <div className="ec-popover-title">
                                    A partir de <strong>caja {caja.numeroCaja}</strong> guardar:
                                  </div>
                                  <div className="ec-popover-btns">
                                    {[1, 2, 3, 4, 5, 6].map((cant) => (
                                      <button
                                        key={cant}
                                        type="button"
                                        className={`btn btn-sm ${
                                          caja.capacidadAplicada === cant
                                            ? "btn-primary"
                                            : "btn-outline-secondary"
                                        }`}
                                        onClick={() =>
                                          definirCapacidadDesdeCaja(
                                            caja.numeroCaja,
                                            cant
                                          )
                                        }
                                      >
                                        {cant}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* ENCABEZADO DE LA ETIQUETA */}
                            <div className="ec-label-header">
                              <div className="ec-header-row-1">
                                <div className="ec-linea-block">
                                  <span className="ec-lbl">LINEA:</span>{" "}
                                  <span className="ec-linea-val">
                                    {lineaSeleccionada}
                                  </span>
                                </div>
                                <div className="ec-seccion-block">
                                  <span className="ec-lbl">SECCION:</span>{" "}
                                  <span className="ec-seccion-val">
                                    {textoSeccionHeader}
                                  </span>
                                </div>
                              </div>

                              <div className="ec-header-row-2">
                                <div className="ec-familia-block">
                                  <span className="ec-lbl">FAMILIA:</span>{" "}
                                  <span className="ec-familia-val">
                                    {familiaTexto}
                                  </span>
                                </div>
                                <div className="ec-caja-num">
                                  caja {caja.numeroCaja}
                                </div>
                              </div>
                            </div>

                            {/* CUERPO: LISTA DE PRODUCTOS DE LA CAJA */}
                            <div className="ec-label-body">
                              {caja.productos.map((prod) => (
                                <div
                                  key={prod.clave}
                                  className="ec-product-row"
                                >
                                  <div className="ec-barcode-col">
                                    <BoxBarcode
                                      value={prod.clave}
                                      width={BARCODE_FIXED_WIDTH}
                                      height={BARCODE_FIXED_HEIGHT}
                                    />
                                  </div>

                                  <div className="ec-info-col">
                                    <div className="ec-prod-clave">
                                      {prod.clave}
                                    </div>
                                    <div className="ec-prod-medida">
                                      {construirMedidaEtiqueta(
                                        prod,
                                        ordenDiametro
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* PIE DE LA ETIQUETA: LOGO + MARCA Y PERFIL SIN REPETICIÓN */}
                            <div className="ec-label-footer">
                              <img
                                src={Logo}
                                alt="Logo SM"
                                className="ec-footer-logo"
                              />
                              <div className="ec-footer-meta">
                                <div className="ec-footer-line">
                                  <strong>MARCA:</strong>{" "}
                                  <span>{caja.marcasTexto}</span>
                                </div>
                                <div className="ec-footer-line">
                                  <strong>PERFIL:</strong>{" "}
                                  <span>{caja.perfilesTexto}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EtiquetasCajaTab;
