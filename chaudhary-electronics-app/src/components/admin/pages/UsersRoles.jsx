import { useMemo, useState } from 'react';
import CollectionTable from '../table/CollectionTable';
import { cardClass } from '../adminStyles';
import { schemas } from '../../../data/admin/schemas';
import { defaultPermissions, permModules } from '../../../data/admin/navDefs';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';
import { useAuth } from '../../../context/AuthContext';
import { titleCase, toLowerKey } from '../../../lib/adminMappers';

function mapFromApi(doc) {
  return {
    id: doc._id,
    name: doc.name,
    avatar: doc.avatar,
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
  const { user: me } = useAuth();
  const isSuperadmin = me?.role === 'superadmin';
  const adapter = useApiCollection({
    page: 'users',
    endpoint: '/users',
    mapFromApi,
    mapToApi,
    statusToApi: (status) => ({ isActive: status === 'Active' }),
  });

  // DELETE /users/:id and granting admin/superadmin are both superadmin-only on the backend
  // (server/src/controllers/user.controller.js) — don't show a plain admin an action they'd
  // just get a 403 back for.
  const liveSchema = useMemo(() => {
    if (isSuperadmin) return schemas.users;
    return {
      ...schemas.users,
      fields: schemas.users.fields.map((f) =>
        f.key === 'role' ? { ...f, options: f.options.filter((o) => o !== 'Admin' && o !== 'Superadmin') } : f,
      ),
    };
  }, [isSuperadmin]);

  function togglePermission(role, mod) {
    setPermissions((p) => {
      const list = p[role];
      const has = list.includes(mod);
      return { ...p, [role]: has ? list.filter((m) => m !== mod) : [...list, mod] };
    });
  }

  return (
    <div className="flex flex-col gap-3.5">
      <CollectionTable
        admin={adapter}
        page="users"
        schema={liveSchema}
        canDelete={(row) => isSuperadmin && row.id !== me?._id}
        canBulkDelete={isSuperadmin}
      />

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
