import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import Modal from '../../ui/Modal';
import ConfirmDialog from '../table/ConfirmDialog';
import { cardClass, dangerBtnSmallClass, ghostBtnClass, ghostBtnSmallClass, inputClass, primaryBtnClass } from '../adminStyles';
import { statusStyleFor } from '../../../data/admin/theme';

const STATUS_LABEL = { unread: 'Unread', read: 'Read', replied: 'Replied' };

/**
 * /admin/messages — real contact-form inbox (server's Message model). Bespoke page rather
 * than the generic CollectionTable so it can expose the backend's actual reply flow
 * (PATCH /messages/:id/reply) instead of just editing a status field.
 */
export default function Messages() {
  const showToast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewRow, setViewRow] = useState(null);
  const [replyRow, setReplyRow] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/messages?limit=200&sort=-createdAt');
      setMessages(res.data);
    } catch (err) {
      showToast(err.message || 'Could not load messages.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        (m.subject || '').toLowerCase().includes(q) ||
        (m.body || '').toLowerCase().includes(q)
      );
    });
  }, [messages, search, statusFilter]);

  async function markRead(message) {
    try {
      const res = await api.patch(`/messages/${message._id}/read`);
      setMessages((prev) => prev.map((m) => (m._id === message._id ? res.data : m)));
    } catch (err) {
      showToast(err.message || 'Could not update this message.');
    }
  }

  function openReply(message) {
    setReplyRow(message);
    setReplyText(message.reply || '');
  }

  async function submitReply() {
    if (!replyRow || !replyText.trim() || replying) return;
    setReplying(true);
    try {
      const res = await api.patch(`/messages/${replyRow._id}/reply`, { reply: replyText.trim() });
      setMessages((prev) => prev.map((m) => (m._id === replyRow._id ? res.data : m)));
      showToast('Reply sent.');
      setReplyRow(null);
      setReplyText('');
    } catch (err) {
      showToast(err.message || 'Could not send reply.');
    } finally {
      setReplying(false);
    }
  }

  function confirmDelete(message) {
    setConfirm({
      message: `Delete this message from ${message.name}? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await api.delete(`/messages/${message._id}`);
          setMessages((prev) => prev.filter((m) => m._id !== message._id));
          showToast('Message deleted.');
        } catch (err) {
          showToast(err.message || 'Could not delete message.');
        } finally {
          setConfirm(null);
        }
      },
    });
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search messages…"
          className={`${inputClass} min-w-[220px]`}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputClass} px-2.5`}>
          <option value="all">All statuses</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
        <span className="text-[12.5px] text-[var(--a-mut)]">{filtered.length} message(s)</span>
      </div>

      <div className="overflow-hidden overflow-x-auto rounded-[20px] border border-[var(--a-line)] bg-[var(--a-white)]">
        <table className="w-full min-w-[680px] border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-[var(--a-paper)] text-left text-[11.5px] text-[var(--a-mut)]">
              <th className="p-3">From</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Message</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 4 }, (_, i) => (
                <tr key={i} className="border-t border-[var(--a-line)]" aria-hidden="true">
                  <td className="p-3" colSpan={6}>
                    <span className="block h-4 w-2/3 animate-pulse rounded-full bg-[var(--a-line)]" />
                  </td>
                </tr>
              ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-[var(--a-mut)]">
                  No messages match your filters.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((m) => (
                <tr key={m._id} className="border-t border-[var(--a-line)]">
                  <td className="p-3">
                    <div className="font-semibold text-[var(--a-ink)]">{m.name}</div>
                    <div className="text-[12px] text-[var(--a-mut)]">{m.email || m.phone || '—'}</div>
                  </td>
                  <td className="max-w-[160px] truncate p-3">{m.subject || 'General inquiry'}</td>
                  <td className="max-w-[240px] truncate p-3 text-[var(--a-mut)]">{m.body}</td>
                  <td className="p-3 whitespace-nowrap">{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="p-3">
                    <span style={statusStyleFor(STATUS_LABEL[m.status] || 'Unread')}>{STATUS_LABEL[m.status] || 'Unread'}</span>
                  </td>
                  <td className="whitespace-nowrap p-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button type="button" className={ghostBtnSmallClass} onClick={() => setViewRow(m)}>
                        View
                      </button>
                      <button type="button" className={ghostBtnSmallClass} onClick={() => openReply(m)}>
                        Reply
                      </button>
                      {m.status === 'unread' && (
                        <button type="button" className={ghostBtnSmallClass} onClick={() => markRead(m)}>
                          Mark read
                        </button>
                      )}
                      <button type="button" className={dangerBtnSmallClass} onClick={() => confirmDelete(m)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className={cardClass}>
        <div className="text-[13px] text-[var(--a-mut)]">
          Messages arrive from the storefront's contact form. Replying here saves your response
          on the message (visible to the sender if they check back) and marks it "Replied".
        </div>
      </div>

      {viewRow && (
        <Modal open onClose={() => setViewRow(null)} align="center">
          <div className="flex w-full max-w-[460px] flex-col gap-3 rounded-[20px] bg-[var(--a-white)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
            <div className="text-base font-bold">{viewRow.subject || 'General inquiry'}</div>
            <div className="text-[12.5px] text-[var(--a-mut)]">
              From {viewRow.name} ({viewRow.email || viewRow.phone || 'no contact given'}) ·{' '}
              {viewRow.createdAt ? new Date(viewRow.createdAt).toLocaleString() : ''}
            </div>
            <p className="rounded-[12px] bg-[var(--a-paper)] p-3.5 text-[13.5px] leading-[1.6] whitespace-pre-wrap">{viewRow.body}</p>
            {viewRow.reply && (
              <div className="rounded-[12px] border border-[var(--a-acc)] bg-[var(--a-acc-soft)] p-3.5">
                <div className="mb-1 text-[11.5px] font-bold text-[var(--a-mut)]">Your reply</div>
                <p className="text-[13.5px] leading-[1.6] whitespace-pre-wrap">{viewRow.reply}</p>
              </div>
            )}
            <button type="button" className={`self-end ${ghostBtnClass}`} onClick={() => setViewRow(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {replyRow && (
        <Modal open onClose={() => setReplyRow(null)} align="center" labelledBy="reply-modal-title">
          <div className="flex w-full max-w-[460px] flex-col gap-3 rounded-[20px] bg-[var(--a-white)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
            <div id="reply-modal-title" className="text-base font-bold">
              Reply to {replyRow.name}
            </div>
            <p className="rounded-[12px] bg-[var(--a-paper)] p-3 text-[12.5px] text-[var(--a-mut)] italic">"{replyRow.body}"</p>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
              Your reply
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                placeholder="Type your reply…"
                className="resize-y rounded-[10px] border border-[var(--a-line)] bg-[var(--a-paper)] px-3 py-2.5 text-sm text-[var(--a-ink)] outline-none"
              />
            </label>
            <div className="flex justify-end gap-2.5">
              <button type="button" className={ghostBtnClass} onClick={() => setReplyRow(null)}>
                Cancel
              </button>
              <button type="button" className={primaryBtnClass} disabled={replying || !replyText.trim()} onClick={submitReply}>
                {replying ? 'Sending…' : 'Send reply'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog open={!!confirm} message={confirm?.message} onCancel={() => setConfirm(null)} onConfirm={() => confirm.onConfirm()} />
    </div>
  );
}
