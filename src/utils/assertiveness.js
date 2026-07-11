export function computeAssertiveness(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return {
      global: { exactitud: 0, diferencias: 0, totalProductos: 0, magnitud: null },
      byLinea: [],
      byFamilia: [],
      byGenero: []
    };
  }

  const groups = {
    linea: { key: 'LINEA', map: {} },
    familia: { key: 'FAMILIA', map: {} },
    genero: { key: 'GENERO', map: {} },
  };

  let total = 0;
  let correctos = 0;

  const magnitud = {
    ajuste: { count: 0, piezas: 0, monto: 0 },
    merma: { count: 0, piezas: 0, monto: 0 }
  };

  for (const p of products) {
    total++;
    const esCorrecto = p.RESULTADO === 'SIN CAMBIO';
    if (esCorrecto) correctos++;

    if (p.RESULTADO === 'AJUSTE') {
      const cant = Number(p.CANT || 0);
      const costo = Number(p.COSTO || 0);
      magnitud.ajuste.count++;
      magnitud.ajuste.piezas += cant;
      magnitud.ajuste.monto += cant * costo;
    } else if (p.RESULTADO === 'MERMA') {
      const cant = Number(p.CANT || 0);
      const costo = Number(p.COSTO || 0);
      magnitud.merma.count++;
      magnitud.merma.piezas += cant;
      magnitud.merma.monto += cant * costo;
    }

    for (const [, g] of Object.entries(groups)) {
      const segment = p[g.key] || 'SIN CLASIFICAR';
      if (!g.map[segment]) g.map[segment] = { total: 0, correctos: 0 };
      g.map[segment].total++;
      if (esCorrecto) g.map[segment].correctos++;
    }
  }

  magnitud.balance = {
    piezas: magnitud.ajuste.piezas - magnitud.merma.piezas,
    monto: magnitud.ajuste.monto - magnitud.merma.monto
  };

  const toArray = (map) => Object.entries(map)
    .map(([name, d]) => ({
      name,
      value: d.total > 0 ? +((d.correctos / d.total) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.value - a.value);

  return {
    global: {
      exactitud: total > 0 ? +((correctos / total) * 100).toFixed(1) : 0,
      diferencias: total - correctos,
      totalProductos: total,
      magnitud
    },
    byLinea: toArray(groups.linea.map),
    byFamilia: toArray(groups.familia.map),
    byGenero: toArray(groups.genero.map)
  };
}
