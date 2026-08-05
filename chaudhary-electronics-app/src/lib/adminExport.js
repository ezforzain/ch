// Shared CSV / fake-Excel export helpers — transcribed from source's
// exportCSV()/exportExcel(). Used by CollectionTable and Reports (Reports'
// "Export leads/orders/projects CSV" buttons call the exact same routine
// source does: `this.exportCSV('leads')` etc., against the full
// non-archived, unfiltered collection since Reports has no table filters).

export function exportCSV(page, schema, rows, showToast) {
  const headers = schema.columns.map((c) => c.label);
  const lines = [headers.join(',')].concat(
    rows.map((r) => schema.columns.map((c) => `"${String(r[c.key] || '').replace(/"/g, '""')}"`).join(',')),
  );
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${page}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('CSV exported.');
}

export function exportExcel(page, schema, rows, showToast) {
  const headers = schema.columns.map((c) => c.label);
  const rowsHtml = rows.map((r) => `<tr>${schema.columns.map((c) => `<td>${String(r[c.key] || '')}</td>`).join('')}</tr>`).join('');
  const html = `<table><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>${rowsHtml}</table>`;
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${page}.xls`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Excel exported.');
}
