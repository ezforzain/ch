// Transcribed exactly from source `palettes` / `statusColors` objects in
// Admin Panel.dc.html (class Component extends DCLogic). These are the ONLY
// values that differ between the admin panel's light/dark themes — accent,
// danger and success colors are constant across both themes in the source.

export const palettes = {
  light: {
    paper: '#F5F2EC',
    ink: '#17150F',
    mut: '#6E675C',
    white: '#FBFAF7',
    line: 'rgba(23,21,15,0.10)',
    dark: '#0F0E0B',
  },
  dark: {
    paper: '#15130F',
    ink: '#F1EEE7',
    mut: '#A79E8E',
    white: '#1C1A15',
    line: 'rgba(255,255,255,0.08)',
    dark: '#0B0A08',
  },
};

// Constant across themes (source: --acc, --acc-soft, --danger, --danger-soft, --success, --success-soft)
export const staticColors = {
  acc: '#E2A347',
  accSoft: '#F7ECD9',
  danger: '#C1442A',
  dangerSoft: '#F6E2DC',
  success: '#3E7C4A',
  successSoft: '#E3EEDF',
};

export const statusColors = {
  New: ['#F7ECD9', '#7A5C24'],
  Contacted: ['#DCE6F2', '#2A4E7A'],
  Quoted: ['#DCE6F2', '#2A4E7A'],
  Completed: ['#E3EEDF', '#2F5E38'],
  'In progress': ['#DCE6F2', '#2A4E7A'],
  Paid: ['#E3EEDF', '#2F5E38'],
  Pending: ['#F7ECD9', '#7A5C24'],
  Refunded: ['#F6E2DC', '#8A3B22'],
  Scheduled: ['#DCE6F2', '#2A4E7A'],
  Cancelled: ['#F6E2DC', '#8A3B22'],
  Published: ['#E3EEDF', '#2F5E38'],
  Draft: ['#F7ECD9', '#7A5C24'],
  Active: ['#E3EEDF', '#2F5E38'],
  Suspended: ['#F6E2DC', '#8A3B22'],
  Read: ['#E3EEDF', '#2F5E38'],
  Unread: ['#F7ECD9', '#7A5C24'],
  Admin: ['#F7ECD9', '#7A5C24'],
  Editor: ['#DCE6F2', '#2A4E7A'],
  Viewer: ['rgba(23,21,15,0.08)', '#6E675C'],
};

export function statusStyleFor(status) {
  const c = statusColors[status] || ['rgba(23,21,15,0.08)', '#6E675C'];
  return {
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '11.5px',
    fontWeight: 700,
    background: c[0],
    color: c[1],
    display: 'inline-block',
  };
}

export const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=200&q=70';

export const ADMIN_DATA_KEY = 'chaudhary_admin_data_v1';
