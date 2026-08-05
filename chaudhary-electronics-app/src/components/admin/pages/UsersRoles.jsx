import { useState } from 'react';
import CollectionTable from '../table/CollectionTable';
import { cardClass } from '../adminStyles';
import { schemas } from '../../../data/admin/schemas';
import { defaultPermissions, permModules } from '../../../data/admin/navDefs';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';
import { titleCase, toLowerKey } from '../../../lib/adminMappers';

function mapFromApi(doc) {
  return {
    id: doc._id,
    name: doc.name,
    role: titleCase(doc.role),
    email: doc.email,
    status: doc.isActive ? 'Active' : 'Suspended',
    archived: !doc.isActive,
  };
}

function mapToApi(draft) {
  return {
    name: draft.name,
    role: draft.role ? toLowerKey(draft.role) : undefined,
    isActive: draft.status !== undefined ? draft.status === 'Active' : undefined,
  };
}

/** /admin/users — the real Users & Roles table (accounts + role/status from the backend)
 * plus a client-side-only role-permissions matrix demo below it (not wired to the
 * backend — real authorization is enforced server-side by the 4-role RBAC in
 * server/src/middleware/auth.middleware.js; this matrix is a UI preview of a more granular
 * per-module permission scheme, not a functional gate). */
export default function UsersRoles() {
  const [permissions, setPermissions] = useState(defaultPermissions);
  const adapter = useApiCollection({ page: 'users', endpoint: '/users', mapFromApi, mapToApi });

  function togglePermission(role, mod) {
    setPermissions((p) => {
      const list = p[role];
      const has = list.includes(mod);
      return { ...p, [role]: has ? list.filter((m) => m !== mod) : [...list, mod] };
    });
  }

  return (
    <div className="flex flex-col gap-3.5">
      <CollectionTable admin={adapter} page="users" schema={schemas.users} />

      <div className={cardClass}>
        <div className="mb-1 text-[14.5px] font-bold">Role permissions (preview)</div>
        <p className="mb-2 text-[12px] text-[var(--a-mut)]">
          Illustrative only — actual access is enforced by the backend's role checks, not by this matrix.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] text-[var(--a-mut)]">
                <th className="p-2">Role</th>
                {permModules.map((pm) => (
                  <th key={pm} className="p-2">
                    {pm}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(permissions).map((role) => (
                <tr key={role} className="border-t border-[var(--a-line)]">
                  <td className="p-2 font-semibold">{role}</td>
                  {permModules.map((mod) => (
                    <td key={mod} className="p-2">
                      <input
                        type="checkbox"
                        checked={permissions[role].includes(mod)}
                        onChange={() => togglePermission(role, mod)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
