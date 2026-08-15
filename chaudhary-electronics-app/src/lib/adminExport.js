// Shared CSV / fake-Excel export helpers — transcribed from source's
// exportCSV()/exportExcel(). Used by CollectionTable and Reports (Reports'
// "Export leads/orders/projects CSV" buttons call the exact same routine
// source does: `this.exportCSV('leads')` etc., against the full
// non-archived, unfiltered collection since Reports has no table filters).

// 'avatar' columns hold an { url, publicId } object (see Cell() in CollectionTable), which
// would stringify to the useless literal "[object Object]" in a spreadsheet export — leave
// them out. ('image' columns hold a plain string reference and export fine as-is.)
function exportableColumns(schema) {
  return schema.columns.filter((c) => c.type !== 'avatar');
}

export function exportCSV(page, schema, rows, showToast) {
  const columns = exportableColumns(schema);
  const headers = columns.map((c) => c.label);
  const lines = [headers.join(',')].concat(
    rows.map((r) => columns.map((c) => `"${String(r[c.key] || '').replace(/"/g, '""')}"`).join(',')),
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
  const columns = exportableColumns(schema);
  const headers = columns.map((c) => c.label);
  const rowsHtml = rows.map((r) => `<tr>${columns.map((c) => `<td>${String(r[c.key] || '')}</td>`).join('')}</tr>`).join('');
  const html = `<table><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>${rowsHtml}</table>`;
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${page}.xls`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Excel exported.');
}
