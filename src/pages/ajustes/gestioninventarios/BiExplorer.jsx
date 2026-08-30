import React, { useState, useMemo } from 'react';
import { Select } from 'antd';
import { BiArrowBack } from 'react-icons/bi';

const DIM = [
  { id: 'linea', key: 'LINEA', label: 'Línea' },
  { id: 'familia', key: 'FAMILIA', label: 'Familia' },
  { id: 'genero', key: 'GENERO', label: 'Género' },
  { id: 'rotacion', key: 'ROTACION', label: 'Rotación' },
];

const SIN_CLASIFICAR = 'SIN CLASIFICAR';

const norm = (v) =>
  v === null || v === undefined || v === '' ? SIN_CLASIFICAR : String(v);

const getResultado = (p) =>
  p.RESULTADO === 'SIN CAMBIO'
    ? 'SIN CAMBIO'
    : p.RESULTADO === 'AJUSTE'
    ? 'AJUSTE'
    : p.RESULTADO === 'MERMA'
    ? 'MERMA'
    : null;

const RESULTADO_COLOR = {
  'SIN CAMBIO': '#28a745',
  AJUSTE: '#fd7e14',
  MERMA: '#dc3545',
};

// Explorador tipo "cubo": filtros multi-dimensión combinables (AND) sobre
// rawProducts, con KPIs, distribución de RESULTADO y desglose por dimensión.
const BiExplorer = ({ rawProducts = [], loading = false, onBack }) => {
  const [filtros, setFiltros] = useState({
    linea: [],
    familia: [],
    genero: [],
    rotacion: [],
  });
  const [grupoPor, setGrupoPor] = useState('rotacion');

  const opciones = useMemo(() => {
    const res = {};
    for (const d of DIM) {
      const set = new Set();
      for (const p of rawProducts || []) set.add(norm(p[d.key]));
      res[d.id] = Array.from(set).sort();
    }
    return res;
  }, [rawProducts]);

  const filtrados = useMemo(
    () =>
      (rawProducts || []).filter((p) =>
        DIM.every((d) => {
          const sel = filtros[d.id];
          if (!sel || sel.length === 0) return true;
          return sel.includes(norm(p[d.key]));
        })
      ),
    [rawProducts, filtros]
  );

  const metricas = useMemo(() => {
    let total = 0,
      sinCambio = 0,
      ajuste = 0,
      merma = 0;
    for (const p of filtrados) {
      total++;
      const r = getResultado(p);
      if (r === 'SIN CAMBIO') sinCambio++;
      else if (r === 'AJUSTE') ajuste++;
      else if (r === 'MERMA') merma++;
    }
    return {
      total,
      sinCambio,
      ajuste,
      merma,
      exactitud: total > 0 ? +((sinCambio / total) * 100).toFixed(1) : 0,
    };
  }, [filtrados]);

  const desglose = useMemo(() => {
    const d = DIM.find((x) => x.id === grupoPor);
    const map = {};
    for (const p of filtrados) {
      const name = norm(p[d.key]);
      if (!map[name])
        map[name] = { name, total: 0, sinCambio: 0, ajuste: 0, merma: 0 };
      map[name].total++;
      const r = getResultado(p);
      if (r === 'SIN CAMBIO') map[name].sinCambio++;
      else if (r === 'AJUSTE') map[name].ajuste++;
      else if (r === 'MERMA') map[name].merma++;
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filtrados, grupoPor]);

  const limpiar = () =>
    setFiltros({ linea: [], familia: [], genero: [], rotacion: [] });
  const hayFiltros = DIM.some((d) => filtros[d.id].length > 0);
  const totalResultado = metricas.sinCambio + metricas.ajuste + metricas.merma;

  const barColor = (v) =>
    v >= 95 ? '#28a745' : v >= 85 ? '#fd7e14' : '#dc3545';

  return (
    <div className="analytics-dashboard">
      <div className="analytics-nav">
        <div className="analytics-title">
          <h4>Explorador BI</h4>
          <span
            className="text-muted"
            style={{ fontSize: '0.85rem', marginTop: '2px' }}
          >
            Filtra y combina dimensiones para analizar el inventario
          </span>
        </div>
        <button
          className="back-button-table"
          onClick={onBack}
          style={{ marginLeft: '20px' }}
        >
          <BiArrowBack size={18} /> Volver al Análisis
        </button>
      </div>

      {/* Filtros combinables */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          margin: '12px 0',
        }}
      >
        {DIM.map((d) => (
          <div key={d.id} style={{ minWidth: '180px', flex: '1 1 180px' }}>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#666',
                marginBottom: '4px',
              }}
            >
              {d.label}
            </div>
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder={`Selecciona ${d.label.toLowerCase()}...`}
              value={filtros[d.id]}
              onChange={(vals) =>
                setFiltros((prev) => ({ ...prev, [d.id]: vals }))
              }
              options={opciones[d.id].map((o) => ({ label: o, value: o }))}
              maxTagCount="responsive"
            />
          </div>
        ))}
        {hayFiltros && (
          <button
            className="pill-button"
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            onClick={limpiar}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
          Cargando...
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '4px 0',
              flexWrap: 'wrap',
            }}
          >
            {[
              {
                label: 'Total productos',
                value: metricas.total,
                color: '#27374d',
              },
              {
                label: 'Exactitud',
                value: `${metricas.exactitud}%`,
                color: barColor(metricas.exactitud),
              },
              { label: 'Ajustes', value: metricas.ajuste, color: '#fd7e14' },
              { label: 'Mermas', value: metricas.merma, color: '#dc3545' },
            ].map((k, i) => (
              <div
                key={i}
                style={{
                  flex: '1 1 130px',
                  minWidth: '130px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: '#fcfcfc',
                  border: '1px solid #eee',
                }}
              >
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: '#666',
                    marginBottom: '1px',
                  }}
                >
                  {k.label}
                </div>
                <div
                  style={{
                    fontSize: '1rem',
                    color: k.color,
                    fontWeight: 700,
                  }}
                >
                  {k.value}
                </div>
              </div>
            ))}
          </div>

          {/* Distribución RESULTADO del slice */}
          <div className="segmented-results-grid bi-result-dist">
            <div className="segment-item">
              <div className="segment-name">
                Conjunto filtrado ({totalResultado})
              </div>
              <div
                className="segment-bar-container"
                style={{ display: 'flex' }}
              >
                <div
                  style={{
                    width: `${
                      (metricas.sinCambio / (totalResultado || 1)) * 100
                    }%`,
                    height: '100%',
                    background: RESULTADO_COLOR['SIN CAMBIO'],
                  }}
                />
                <div
                  style={{
                    width: `${(metricas.ajuste / (totalResultado || 1)) * 100}%`,
                    height: '100%',
                    background: RESULTADO_COLOR['AJUSTE'],
                  }}
                />
                <div
                  style={{
                    width: `${(metricas.merma / (totalResultado || 1)) * 100}%`,
                    height: '100%',
                    background: RESULTADO_COLOR['MERMA'],
                  }}
                />
              </div>
              <div className="segment-value" style={{ fontSize: '0.8rem' }}>
                🟢{metricas.sinCambio} 🟠{metricas.ajuste} 🔴{metricas.merma}
              </div>
            </div>
          </div>

          {/* Desglose por dimensión (cubo) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '16px 0 8px',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                color: '#666',
                fontWeight: 600,
              }}
            >
              Agrupar por:
            </span>
            <Select
              style={{ width: 160 }}
              value={grupoPor}
              onChange={setGrupoPor}
              options={DIM.map((d) => ({ label: d.label, value: d.id }))}
            />
          </div>
          <div className="segmented-results-grid">
            {desglose.length === 0 ? (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#888',
                }}
              >
                Sin datos para el filtro actual.
              </div>
            ) : (
              desglose.map((s) => {
                const tot = s.sinCambio + s.ajuste + s.merma;
                const exact = tot > 0 ? +((s.sinCambio / tot) * 100).toFixed(1) : 0;
                return (
                  <div key={s.name} className="segment-item">
                    <div className="segment-name">
                      {s.name} ({tot})
                    </div>
                    <div className="segment-bar-container">
                      <div
                        className="segment-bar-fill"
                        style={{
                          width: `${exact}%`,
                          backgroundColor: barColor(exact),
                        }}
                      />
                    </div>
                    <div className="segment-value">{exact}%</div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#777',
                        marginTop: '2px',
                      }}
                    >
                      🟢{s.sinCambio} 🟠{s.ajuste} 🔴{s.merma}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      <div
        className="analytics-footer"
        style={{
          marginTop: '25px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #eee',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
          <strong>Explorador BI:</strong> combina filtros por{' '}
          {DIM.map((d) => d.label).join(', ')}. Las barras del desglose muestran
          el % de exactitud por valor de la dimensión seleccionada en
          "Agrupar por".
        </p>
      </div>
    </div>
  );
};

export default BiExplorer;
