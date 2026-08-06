import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Modal from '../../ui/Modal';
import RecordModal from './RecordModal';
import ConfirmDialog from './ConfirmDialog';
import { useCollectionTable } from '../../../hooks/admin/useCollectionTable';
import { useToast } from '../../../context/ToastContext';
import { schemas } from '../../../data/admin/schemas';
import { PLACEHOLDER_IMG, statusStyleFor } from '../../../data/admin/theme';
import { imgUrl } from '../../../data/catalogue';
import { exportCSV, exportExcel } from '../../../lib/adminExport';
import {
  activeToggleBtnClass,
  cardClass,
  dangerBtnSmallClass,
  ghostBtnClass,
  ghostBtnSmallClass,
  inactiveToggleBtnClass,
  inputClass,
  pagerBtnClass,
  primaryBtnClass,
  rowBtnClass,
  rowBtnDangerClass,
} from '../adminStyles';

function buildCalendar(rows) {
  const byDay = {};
  rows.forEach((r) => {
    const d = new Date(r.date + 'T00:00:00');
    if (!Number.isNaN(d.getTime())) byDay[d.getDate()] = (byDay[d.getDate()] || 0) + 1;
  });
  const days = [];
  for (let i = 1; i <= 31; i++) days.push({ day: i, count: byDay[i] || 0, has: !!byDay[i] });
  return days;
}

function Cell({ row, col }) {
  if (col.type === 'status') {
    return <span style={statusStyleFor(row[col.key])}>{String(row[col.key] ?? '')}</span>;
  }
  if (col.type === 'image') {
    const raw = (Array.isArray(row.gallery) ? row.gallery[0] : null) || row[col.key];
    const url = raw ? imgUrl(raw, 100) : PLACEHOLDER_IMG;
    return <img src={url} alt="" loading="lazy" decoding="async" className="block h-10 w-10 rounded-lg object-cover" />;
  }
  return <>{String(row[col.key] ?? '')}</>;
}

/**
 * Schema-driven table used by all generic collection routes (12 simple
 * pages via /admin/:page, plus Appointments/Products which pass explicit
 * `page`/`schema` props). Transcribed from source's buildActiveTable() +
 * the `hasActiveTable` template block: search, status filter, category
 * filter (products), archived toggle, tri-state sortable columns,
 * pagination, row checkboxes + bulk actions, row actions (view/edit/
 * duplicate/archive/delete, appointments get "send reminder"), CSV/Excel
 * export, and (schema.hasCalendar) a List/Calendar toggle.
 */
export default function CollectionTable({ admin, page: pageProp, schema: schemaProp }) {
  const params = useParams();
  const page = pageProp || params.page;
  const schema = schemaProp || schemas[page];

  const showToast = useToast();
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit', row }
  const [viewRow, setViewRow] = useState(null);
  const [confirm, setConfirm] = useState(null); // { message, onConfirm }
  const [apptView, setApptView] = useState('list');

  const allRows = schema ? admin.data[page] || [] : [];
  const t = useCollectionTable(schema || { columns: [] }, allRows);

  if (!schema) {
    return <div className={cardClass}>No matching page found.</div>;
  }

  const readonly = !!schema.readonly;
  const showingCalendar = !!schema.hasCalendar && apptView === 'calendar';

  function closeConfirm() {
    setConfirm(null);
  }
  function runConfirm() {
    if (confirm) confirm.onConfirm();
    setConfirm(null);
  }

  // Returns whether the save actually succeeded — RecordModal only closes itself and
  // clears its "saving" state once this resolves true; on failure it stays open (with an
  // inline error) so the admin can fix the fields and retry, instead of silently discarding
  // their edits. The underlying admin.addRecord/editRecord already toast the specific
  // server error on failure (see useApiCollection.js / ProductsContext.jsx).
  async function handleSubmitModal(draft) {
    if (modal.mode === 'add') {
      const result = await admin.addRecord(page, draft);
      if (result) showToast('Record added.');
      return !!result;
    }
    const result = await admin.editRecord(page, draft);
    if (result) showToast('Record updated.');
    return !!result;
  }

  function onDelete(row) {
    setConfirm({
      message: 'Delete this record? This cannot be undone.',
      onConfirm: () => {
        admin.deleteRecord(page, row.id);
        t.patch({ selected: t.state.selected.filter((x) => x !== row.id) });
        showToast('Record deleted.');
        setConfirm(null);
      },
    });
  }

  function onBulkDelete() {
    const sel = t.state.selected;
    setConfirm({
      message: `Delete ${sel.length} selected record(s)?`,
      onConfirm: () => {
        admin.bulkDelete(page, sel);
        t.clearSelection();
        showToast(`${sel.length} record(s) deleted.`);
        setConfirm(null);
      },
    });
  }

  function onBulkArchive(archived) {
    admin.bulkArchive(page, t.state.selected, archived);
    t.clearSelection();
    showToast(archived ? 'Archived.' : 'Unarchived.');
  }

  function onDuplicate(row) {
    admin.duplicateRecord(page, row);
    showToast('Duplicated.');
  }

  function onArchive(row) {
    admin.archiveRecord(page, row);
    showToast(row.archived ? 'Unarchived.' : 'Archived.');
  }

  function onBulkStatus(e) {
    const status = e.target.value;
    if (!status) return;
    const sel = t.state.selected;
    admin.bulkSetStatus(page, sel, status);
    t.clearSelection();
    showToast(`${sel.length} record(s) set to ${status}.`);
    e.target.value = '';
  }

  const bulkStatusOptions = t.statusCol
    ? allRows.reduce((acc, r) => (acc.includes(r[t.statusCol.key]) ? acc : [...acc, r[t.statusCol.key]]), []).filter(Boolean)
    : [];

  const emptyMessage = allRows.length === 0 ? 'No records yet. Click "Add" to create one.' : 'No records match your filters.';

  const viewSchemaColumns = viewRow ? schema.columns.filter((c) => c.type !== 'image') : [];
  const viewImageRaw = viewRow ? (Array.isArray(viewRow.gallery) ? viewRow.gallery[0] : null) || viewRow.image : null;
  const viewImage = viewRow ? (viewImageRaw ? imgUrl(viewImageRaw, 400) : PLACEHOLDER_IMG) : null;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <input value={t.state.search} onChange={t.onSearch} placeholder="Search…" className={`${inputClass} min-w-[180px]`} />
        {t.statusOptions && (
          <select value={t.state.statusFilter} onChange={t.onStatusFilter} className={`${inputClass} px-2.5`}>
            {t.statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
        {t.categoryOptions && (
          <select value={t.state.categoryFilter} onChange={t.onCategoryFilter} title="Filter by category" className={`${inputClass} px-2.5`}>
            {t.categoryOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
        <label className="flex cursor-pointer items-center gap-1.5 text-[13px] text-[var(--a-mut)]">
          <input type="checkbox" checked={t.state.showArchived} onChange={t.toggleArchived} />
          Show archived
        </label>
        {schema.hasCalendar && (
          <div className="ml-1 flex gap-1.5">
            <button type="button" onClick={() => setApptView('list')} className={apptView === 'list' ? activeToggleBtnClass : inactiveToggleBtnClass}>
              List
            </button>
            <button type="button" onClick={() => setApptView('calendar')} className={apptView === 'calendar' ? activeToggleBtnClass : inactiveToggleBtnClass}>
              Calendar
            </button>
          </div>
        )}
        <div className="ml-auto flex gap-2">
          <button type="button" className={ghostBtnClass} onClick={() => exportCSV(page, schema, t.filteredRows, showToast)}>
            Export CSV
          </button>
          <button type="button" className={ghostBtnClass} onClick={() => exportExcel(page, schema, t.filteredRows, showToast)}>
            Export Excel
          </button>
          {!readonly && !schema.hideAdd && (
            <button type="button" className={primaryBtnClass} onClick={() => setModal({ mode: 'add', row: null })}>
              + Add {schema.singular}
            </button>
          )}
        </div>
      </div>

      {t.state.selected.length > 0 && (
        <div className="flex items-center gap-2.5 rounded-xl bg-[var(--a-acc-soft)] px-3.5 py-2.5">
          <span className="text-[13px] font-semibold">{t.state.selected.length} selected</span>
          {t.statusCol && (
            <select
              defaultValue=""
              onChange={onBulkStatus}
              className="h-8 rounded-lg border border-[rgba(23,21,15,0.2)] bg-[var(--a-white)] text-xs text-[var(--a-ink)]"
            >
              <option value="">Set status…</option>
              {bulkStatusOptions.map((bs) => (
                <option key={bs} value={bs}>
                  {bs}
                </option>
              ))}
            </select>
          )}
          <button type="button" className={ghostBtnSmallClass} onClick={() => onBulkArchive(true)}>
            Archive
          </button>
          <button type="button" className={ghostBtnSmallClass} onClick={() => onBulkArchive(false)}>
            Unarchive
          </button>
          <button type="button" className={dangerBtnSmallClass} onClick={onBulkDelete}>
            Delete
          </button>
          <button type="button" className={`ml-auto ${ghostBtnSmallClass}`} onClick={t.clearSelection}>
            Clear
          </button>
        </div>
      )}

      {showingCalendar ? (
        <div className={cardClass} style={{ padding: 16 }}>
          <div className="mb-2.5 text-sm font-bold">August 2026</div>
          <div className="grid grid-cols-7 gap-1.5">
            {buildCalendar(allRows).map((d) => (
              <div
                key={d.day}
                className="rounded-[10px] p-2 text-center"
                style={{ background: d.has ? 'var(--a-acc-soft)' : 'var(--a-paper)' }}
              >
                <div className="text-[11.5px] font-semibold">{d.day}</div>
                {d.has && <div className="mt-0.5 text-[10px] text-[var(--a-acc)]">● {d.count}</div>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-hidden overflow-x-auto rounded-[20px] border border-[var(--a-line)] bg-[var(--a-white)]">
            <table className="w-full min-w-[600px] border-collapse text-[13.5px]">
              <thead>
                <tr className="bg-[var(--a-paper)] text-left text-[11.5px] text-[var(--a-mut)]">
                  {!readonly && (
                    <th className="w-[30px] p-3">
                      <input type="checkbox" checked={t.allSelected} onChange={t.toggleSelectAll} />
                    </th>
                  )}
                  {schema.columns.map((col) => (
                    <th key={col.key} onClick={() => t.setSort(col.key)} className="cursor-pointer whitespace-nowrap p-3">
                      {col.label}
                      {t.state.sortKey === col.key ? (t.state.sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                    </th>
                  ))}
                  {!readonly && <th className="p-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {admin.loading &&
                  Array.from({ length: 5 }, (_, i) => (
                    <tr key={`skeleton-${i}`} className="border-t border-[var(--a-line)]" aria-hidden="true">
                      {!readonly && (
                        <td className="p-3">
                          <span className="block h-4 w-4 animate-pulse rounded bg-[var(--a-line)]" />
                        </td>
                      )}
                      {schema.columns.map((col) => (
                        <td key={col.key} className="p-3">
                          <span
                            className="block h-4 animate-pulse rounded-full bg-[var(--a-line)]"
                            style={{ width: col.type === 'image' ? 40 : `${60 + ((i * 13) % 40)}%` }}
                          />
                        </td>
                      ))}
                      {!readonly && (
                        <td className="p-3">
                          <span className="block h-4 w-16 animate-pulse rounded-full bg-[var(--a-line)]" />
                        </td>
                      )}
                    </tr>
                  ))}
                {!admin.loading && t.pageRows.length === 0 && (
                  <tr>
                    <td colSpan={schema.columns.length + 2} className="p-10 text-center text-[var(--a-mut)]">
                      {emptyMessage}
                    </td>
                  </tr>
                )}
                {!admin.loading &&
                  t.pageRows.map((r) => (
                  <tr key={r.id} className="border-t border-[var(--a-line)]" style={{ opacity: r.archived ? 0.5 : 1 }}>
                    {!readonly && (
                      <td className="p-3">
                        <input type="checkbox" checked={t.state.selected.includes(r.id)} onChange={() => t.toggleSelect(r.id)} />
                      </td>
                    )}
                    {schema.columns.map((col) => (
                      <td key={col.key} className="max-w-[280px] overflow-hidden text-ellipsis p-3 text-[var(--a-ink)]">
                        <Cell row={r} col={col} />
                      </td>
                    ))}
                    {!readonly && (
                      <td className="whitespace-nowrap p-2.5">
                        <div className="flex gap-1.5">
                          <button type="button" title="View" className={rowBtnClass} onClick={() => setViewRow(r)}>
                            ◉
                          </button>
                          <button type="button" title="Edit" className={rowBtnClass} onClick={() => setModal({ mode: 'edit', row: r })}>
                            ✎
                          </button>
                          {!schema.hideDuplicateArchive && (
                            <>
                              <button type="button" title="Duplicate" className={rowBtnClass} onClick={() => onDuplicate(r)}>
                                ⧉
                              </button>
                              <button type="button" title="Archive/Unarchive" className={rowBtnClass} onClick={() => onArchive(r)}>
                                ▤
                              </button>
                            </>
                          )}
                          {page === 'appointments' && (
                            <button type="button" title="Send reminder" className={rowBtnClass} onClick={() => showToast(`Reminder sent to ${r.name}.`)}>
                              ⏰
                            </button>
                          )}
                          <button type="button" title="Delete" className={rowBtnDangerClass} onClick={() => onDelete(r)}>
                            ✕
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center gap-3.5">
            <button type="button" className={pagerBtnClass} disabled={t.pageNum <= 1} onClick={t.onPrev}>
              ← Prev
            </button>
            <span className="text-[12.5px] text-[var(--a-mut)]">
              Page {t.pageNum} of {t.totalPages}
            </span>
            <button type="button" className={pagerBtnClass} disabled={t.pageNum >= t.totalPages} onClick={t.onNext}>
              Next →
            </button>
          </div>
        </>
      )}

      {modal && (
        <RecordModal schema={schema} mode={modal.mode} row={modal.row} onClose={() => setModal(null)} onSubmit={handleSubmitModal} />
      )}

      {viewRow && (
        <Modal
          open
          onClose={() => setViewRow(null)}
          align="center"
          overlayClassName="bg-[rgba(15,14,11,0.28)] backdrop-blur-md"
        >
          <div className="animate-admin-modal-in flex w-full max-w-[440px] flex-col gap-3 rounded-[20px] bg-[var(--a-white)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
            {viewImage && <img src={viewImage} alt="" className="h-[180px] w-full rounded-[14px] object-cover" />}
            {viewSchemaColumns.map((c) => (
              <div key={c.key} className="flex justify-between border-t border-[var(--a-line)] py-1.5 text-[13px]">
                <span className="text-[var(--a-mut)]">{c.label}</span>
                <span className="font-semibold">{String(viewRow[c.key] ?? '')}</span>
              </div>
            ))}
            <button type="button" className={`self-end ${ghostBtnClass}`} onClick={() => setViewRow(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      <ConfirmDialog open={!!confirm} message={confirm?.message} onCancel={closeConfirm} onConfirm={runConfirm} />
    </div>
  );
}
