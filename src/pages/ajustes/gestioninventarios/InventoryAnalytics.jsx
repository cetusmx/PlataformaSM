import React, { useState, useMemo, useEffect } from 'react';
import { BiX, BiLineChart, BiCategory, BiUser, BiArrowBack, BiSortUp, BiSortDown } from 'react-icons/bi';

const DIMENSION_KEY_MAP = { linea: 'LINEA', familia: 'FAMILIA', genero: 'GENERO' };

const DRILL_COLUMNS = [
  { header: 'Clave', accessor: 'CVE_ART' },
  { header: 'Descripción', accessor: 'DESCRIPCION_LOCAL' },
  { header: 'Resultado', accessor: 'RESULTADO' },
  { header: 'Cant. Contada', accessor: 'CANT_CONTADA' },
  { header: 'Cant. Mov.', accessor: 'CANT' },
  { header: 'Costo', accessor: 'COSTO' },
];

const MAGNITUD_COLUMNS = [
  { header: 'Clave', accessor: 'CVE_ART' },
  { header: 'Descripción', accessor: 'DESCRIPCION_LOCAL' },
  { header: 'Resultado', accessor: 'RESULTADO' },
  { header: 'Cant. Mov.', accessor: 'CANT' },
  { header: 'Cant. Contada', accessor: 'CANT_CONTADA' },
  { header: 'Exist. SAE', accessor: '_diferencia' },
  { header: 'Costo', accessor: 'COSTO' },
  { header: 'Impacto', accessor: '_impacto' },
];

const formatCurrency = (val) => {
  if (val === null || val === undefined) return '—';
  return Number(val).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });
};

const formatValue = (row, col) => {
  const val = row[col.accessor];
  if (val === null || val === undefined) return '—';
  if (col.accessor === 'COSTO') return formatCurrency(val);
  if (col.accessor === '_impacto') {
    const abs = Math.abs(val).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });
    return val >= 0 ? `+${abs}` : `-${abs}`;
  }
  if (col.accessor === '_diferencia') return val >= 0 ? `+${val}` : `${val}`;
  return String(val);
};

const Spinner = ({ text = 'Consultando indicadores reales...' }) => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Cargando...</span>
    </div>
    <p style={{ marginTop: '10px', color: '#666' }}>{text}</p>
  </div>
);

const InventoryAnalytics = ({
  mode = 'assertiveness',
  onClose,
  byLinea = [],
  byFamilia = [],
  byGenero = [],
  globalExactitud = null,
  rawProducts = [],
  magnitud = null,
  loading = false,
  efficiencyData = [],
  efficiencyLoading = false
}) => {
  const [selectedDimension, setSelectedDimension] = useState('linea');
  const [drillDown, setDrillDown] = useState(null);
  const [resultadoFilter, setResultadoFilter] = useState('all');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    setDrillDown(null);
  }, [mode]);

  useEffect(() => {
    setResultadoFilter('all');
    setSortAsc(false);
  }, [mode]);

  const discrepantProducts = useMemo(() => {
    if (mode !== 'magnitud') return [];
    return (rawProducts || [])
      .filter(p => p.RESULTADO === 'AJUSTE' || p.RESULTADO === 'MERMA')
      .map(p => {
        const cantContada = Number(p.CANT_CONTADA || 0);
        const cantSistema = Number(p.CANT || 0);
        const costo = Number(p.COSTO || 0);
        const costoAjustado = p.LINEA === 'GIMBF' ? costo / 1000 : costo;
        const isAjuste = p.RESULTADO === 'AJUSTE';
        const diff = cantContada - cantSistema;
        return { ...p, _diferencia: diff, _impacto: isAjuste ? cantSistema * costoAjustado : -(cantSistema * costoAjustado) };
      })
      .sort((a, b) => Math.abs(b._impacto) - Math.abs(a._impacto));
  }, [rawProducts, mode]);

  const filteredSortedProducts = useMemo(() => {
    let list = discrepantProducts;
    if (resultadoFilter !== 'all') {
      list = list.filter(p => p.RESULTADO === resultadoFilter);
    }
    return [...list].sort((a, b) => sortAsc ? a._impacto - b._impacto : b._impacto - a._impacto);
  }, [discrepantProducts, resultadoFilter, sortAsc]);

  const dimensions = [
    { id: 'linea', label: 'Línea', icon: <BiLineChart /> },
    { id: 'familia', label: 'Familia', icon: <BiCategory /> },
    { id: 'genero', label: 'Género', icon: <BiUser /> },
  ];

  const getBarColor = (value) => {
    if (value >= 95) return '#28a745';
    if (value >= 85) return '#fd7e14';
    return '#dc3545';
  };

  const handleSegmentClick = (segmentName) => {
    const dimensionKey = DIMENSION_KEY_MAP[selectedDimension];
    const filteredProducts = (rawProducts || []).filter(p => p[dimensionKey] === segmentName);
    setDrillDown({ dimension: selectedDimension, name: segmentName, products: filteredProducts });
  };

  const handleBackToOverview = () => {
    setDrillDown(null);
  };

  // === Vista de drill-down: tabla de productos filtrados ===
  if (drillDown) {
    const labelMap = { linea: 'Línea', familia: 'Familia', genero: 'Género' };
    return (
      <div className="analytics-dashboard">
        <div className="analytics-nav">
          <div className="analytics-title">
            <h4>Productos de {labelMap[drillDown.dimension]}: {drillDown.name}</h4>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>
              {drillDown.products.length} artículos
            </span>
            <button className="back-button-table" onClick={handleBackToOverview}>
              <BiArrowBack size={18} /> Volver
            </button>
          </div>
        </div>

        <div className="table-scroll-wrapper" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
          <table className="product-table">
            <thead>
              <tr>
                {DRILL_COLUMNS.map((col, i) => (
                  <th key={i} style={{
                    width: col.accessor === 'CVE_ART' ? '20%' : ['COSTO', 'RESULTADO'].includes(col.accessor) ? '10%' : ['CANT_CONTADA', 'CANT'].includes(col.accessor) ? '13%' : undefined,
                    textAlign: ['RESULTADO', 'CANT_CONTADA', 'CANT', 'COSTO'].includes(col.accessor) ? 'center' : 'left'
                  }}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drillDown.products.length === 0 ? (
                <tr>
                  <td colSpan={DRILL_COLUMNS.length} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                    No hay productos para este segmento.
                  </td>
                </tr>
              ) : (
                drillDown.products.map((row, idx) => (
                  <tr key={idx}>
                    {DRILL_COLUMNS.map((col, ci) => (
                      <td key={ci} style={{
                        textAlign: col.accessor === 'COSTO' || col.accessor === 'CANT_CONTADA' ? 'right' : 'left',
                        width: col.accessor === 'CVE_ART' ? '20%' : ['COSTO', 'RESULTADO'].includes(col.accessor) ? '10%' : ['CANT_CONTADA', 'CANT'].includes(col.accessor) ? '13%' : undefined
                      }}>
                        {formatValue(row, col)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="analytics-footer" style={{ marginTop: '15px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
            <strong>Total:</strong> {drillDown.products.length} artículos | <strong>Segmento:</strong> {drillDown.name}
          </p>
        </div>
      </div>
    );
  }

  // === Vista de magnitud ===
  if (mode === 'magnitud') {
    const m = magnitud || { ajuste: { count: 0, piezas: 0, monto: 0 }, merma: { count: 0, piezas: 0, monto: 0 }, balance: { piezas: 0, monto: 0 } };

    const summaryRows = [
      { label: 'AJUSTE', count: m.ajuste.count, piezas: `+${m.ajuste.piezas}`, monto: `+${formatCurrency(m.ajuste.monto)}`, color: '#28a745' },
      { label: 'MERMA', count: m.merma.count, piezas: `-${m.merma.piezas}`, monto: `-${formatCurrency(m.merma.monto)}`, color: '#dc3545' },
      { label: 'BALANCE', count: m.ajuste.count + m.merma.count, piezas: `${m.balance.piezas >= 0 ? '+' : ''}${m.balance.piezas}`, monto: `${m.balance.monto >= 0 ? '+' : ''}${formatCurrency(Math.abs(m.balance.monto))}`, color: m.balance.monto >= 0 ? '#28a745' : '#dc3545', bold: true },
    ];

    return (
      <div className="analytics-dashboard">
          <div className="analytics-nav" style={{ marginBottom: '10px', paddingBottom: '8px' }}>
            <div className="analytics-title">
              <h4 style={{ margin: 0 }}>Magnitud del Inventario</h4>
            </div>
          <button className="back-button-table" onClick={onClose}>
            <BiArrowBack size={18} /> Volver
          </button>
        </div>

        {loading ? <Spinner /> : (<>
          <div style={{ display: 'flex', gap: '12px', padding: '8px 0', flexWrap: 'wrap' }}>
            {summaryRows.map((row, i) => (
              <div key={i} style={{
                flex: 1, minWidth: '160px', padding: '8px 12px', borderRadius: '6px',
                background: row.bold ? '#f8f9fa' : '#fcfcfc',
                border: row.bold ? `2px solid ${row.color}` : '1px solid #eee',
                fontWeight: row.bold ? 700 : 400
              }}>
                <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '2px' }}>{row.label}</div>
                <div style={{ fontSize: '0.9rem', color: row.color, fontWeight: 700 }}>{row.monto}</div>
                <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '1px' }}>
                  {row.count} art. | {row.piezas} pz.
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
            <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600 }}>Filtrar:</span>
            {['all', 'AJUSTE', 'MERMA'].map(f => (
              <button key={f} className={`pill-button ${resultadoFilter === f ? 'active' : ''}`} style={{ fontSize: '0.75rem', padding: '4px 12px' }} onClick={() => setResultadoFilter(f)}>
                {f === 'all' ? 'Todos' : f}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#888' }}>
              {filteredSortedProducts.length} artículos
            </span>
          </div>

          <div className="table-scroll-wrapper" style={{ maxHeight: '52vh', overflowY: 'auto' }}>
            <table className="product-table" style={{ fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  {MAGNITUD_COLUMNS.map((col, i) => (
                    <th key={i} style={{
                      cursor: col.accessor === '_impacto' ? 'pointer' : undefined,
                      userSelect: col.accessor === '_impacto' ? 'none' : undefined,
                      textAlign: col.accessor === '_impacto' || col.accessor === 'COSTO' || col.accessor === '_diferencia' || col.accessor === 'CANT_CONTADA' || col.accessor === 'CANT' ? 'center' : 'left',
                      width: col.accessor === 'CVE_ART' ? '16%' : col.accessor === 'DESCRIPCION_LOCAL' ? '30%' : col.accessor === 'CANT_CONTADA' ? '10%' : col.accessor === '_diferencia' ? '10%' : ['RESULTADO', 'CANT', 'COSTO'].includes(col.accessor) ? '8%' : col.accessor === '_impacto' ? '10%' : undefined
                    }} onClick={col.accessor === '_impacto' ? () => setSortAsc(p => !p) : undefined}>
                      {col.accessor === '_impacto' ? (<><span>Impacto </span>{sortAsc ? <BiSortUp style={{ verticalAlign: 'middle' }} /> : <BiSortDown style={{ verticalAlign: 'middle' }} />}</>) : col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSortedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={MAGNITUD_COLUMNS.length} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                      No hay productos con discrepancia.
                    </td>
                  </tr>
                ) : (
                  filteredSortedProducts.map((row, idx) => (
                    <tr key={idx}>
                      {MAGNITUD_COLUMNS.map((col, ci) => (
                        <td key={ci} style={{
                          textAlign: col.accessor === '_impacto' || col.accessor === 'COSTO' || col.accessor === 'CANT' || col.accessor === 'CANT_CONTADA' ? 'right' : 'left',
                          color: col.accessor === '_impacto' ? (row._impacto >= 0 ? '#28a745' : '#dc3545') : undefined,
                          fontWeight: col.accessor === '_impacto' ? 600 : undefined,
                          width: col.accessor === 'CVE_ART' ? '16%' : col.accessor === 'DESCRIPCION_LOCAL' ? '30%' : col.accessor === 'CANT_CONTADA' ? '10%' : col.accessor === '_diferencia' ? '10%' : ['RESULTADO', 'CANT', 'COSTO'].includes(col.accessor) ? '8%' : col.accessor === '_impacto' ? '10%' : undefined
                        }}>
                          {formatValue(row, col)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="analytics-footer" style={{ marginTop: '15px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
              <strong>Total:</strong> {filteredSortedProducts.length} artículos con discrepancia |
              <span style={{ color: '#28a745' }}> AJUSTE ({m.ajuste.count})</span> |
              <span style={{ color: '#dc3545' }}> MERMA ({m.merma.count})</span>
            </p>
          </div>
        </>)}
      </div>
    );
  }

  // === Vista de eficiencia ===
  if (mode === 'eficiencia') {
    const aggregated = (efficiencyData || []).reduce((acc, row) => {
      if (!row.linea) return acc;
      if (!acc[row.linea]) acc[row.linea] = { linea: row.linea, productos: 0, horasActivas: 0, skuHr: null };
      acc[row.linea].productos += Number(row.productos || 0);
      acc[row.linea].horasActivas += Number(row.horasActivas || 0);
      return acc;
    }, {});
    const rows = Object.values(aggregated).map(r => {
      r.skuHr = r.horasActivas > 0 ? (r.productos / r.horasActivas) : null;
      return r;
    }).sort((a, b) => b.productos - a.productos);
    const totalProductos = rows.reduce((s, r) => s + r.productos, 0);
    const totalHoras = rows.reduce((s, r) => s + r.horasActivas, 0);

    return (
      <div className="analytics-dashboard">
        <div className="analytics-nav" style={{ marginBottom: '10px', paddingBottom: '8px' }}>
          <div className="analytics-title">
            <h4 style={{ margin: 0 }}>Eficiencia por Línea</h4>
            <span className="text-muted" style={{ fontSize: '0.85rem', marginTop: '2px' }}>
              Total: {totalProductos} artículos en {totalHoras.toFixed(2)} hrs — 
              Promedio: <strong>{totalHoras > 0 ? (totalProductos / totalHoras).toFixed(1) : '—'} SKU/hr</strong>
            </span>
          </div>
          <button className="back-button-table" onClick={onClose}>
            <BiArrowBack size={18} /> Volver
          </button>
        </div>

        {efficiencyLoading ? <Spinner text="Consultando eficiencia..." /> : rows.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Sin datos de eficiencia.</div>
        ) : (
          <>
          <div className="table-scroll-wrapper" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <table className="product-table" style={{ fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '20%', textAlign: 'left' }}>Línea</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>Productos</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>Horas Activas</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>SKU/Hr</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.linea}</td>
                    <td style={{ textAlign: 'right' }}>{r.productos}</td>
                    <td style={{ textAlign: 'right' }}>{r.horasActivas.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{r.skuHr != null ? r.skuHr.toFixed(1) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="analytics-footer" style={{ marginTop: '15px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
              <strong>{rows.length}</strong> líneas | <strong>{totalProductos}</strong> artículos | <strong>{totalHoras.toFixed(2)}</strong> horas activas
            </p>
          </div>
          </>
        )}
      </div>
    );
  }

  // === Vista de overview: barras de asertividad por segmento ===
  const dimensionMap = { linea: byLinea, familia: byFamilia, genero: byGenero };
  const currentData = dimensionMap[selectedDimension] || [];

  return (
    <div className="analytics-dashboard">
      <div className="analytics-nav">
        <div className="analytics-title">
          <h4>Análisis de Asertividad</h4>
          {globalExactitud !== null && (
            <span className="text-muted" style={{ fontSize: '0.85rem', marginTop: '2px' }}>
              Exactitud global: <strong>{globalExactitud.toFixed(1)}%</strong>
            </span>
          )}
        </div>

        <div className="dimension-selector">
          {dimensions.map(dim => (
            <button
              key={dim.id}
              className={`pill-button ${selectedDimension === dim.id ? 'active' : ''}`}
              onClick={() => { setSelectedDimension(dim.id); setDrillDown(null); }}
            >
              <span style={{ marginRight: '6px' }}>{dim.icon}</span>
              {dim.label}
            </button>
          ))}
        </div>

        <button className="back-button-table" onClick={onClose} style={{ marginLeft: '20px' }}>
          <BiX size={20} /> Cerrar Análisis
        </button>
      </div>

      {loading ? <Spinner /> : currentData.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
          No hay datos disponibles para la segmentación por {selectedDimension}.
        </div>
      ) : (
        <div className="segmented-results-grid">
          {currentData.map((item, index) => (
            <div
              key={index}
              className="segment-item segment-clickable"
              onClick={() => handleSegmentClick(item.name)}
              title={`Ver productos de ${item.name}`}
            >
              <div className="segment-name">{item.name}</div>
              <div className="segment-bar-container">
                <div
                  className="segment-bar-fill"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: getBarColor(item.value)
                  }}
                ></div>
              </div>
              <div className="segment-value">{Math.round(item.value)}%</div>
            </div>
          ))}
        </div>
      )}

      <div className="analytics-footer" style={{ marginTop: '25px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
          <strong>Fuente:</strong> Datos obtenidos en tiempo real desde el servidor de analítica (Puerto 3001).
          Los colores representan niveles de cumplimiento: <span style={{ color: '#28a745' }}>●</span> &gt;95% | <span style={{ color: '#fd7e14' }}>●</span> &gt;85% | <span style={{ color: '#dc3545' }}>●</span> &lt;85%
        </p>
      </div>
    </div>
  );
};

export default InventoryAnalytics;
