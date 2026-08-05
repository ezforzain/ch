// Small shared helpers for the useApiCollection mapFromApi/mapToApi pairs — the backend
// stores enums lowercase (e.g. "confirmed"), the admin schema's <select> options are
// Title Case for readability, these just convert between the two consistently.

export function titleCase(str) {
  if (!str) return '';
  return str
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function toLowerKey(str) {
  return (str || '').toLowerCase();
}
