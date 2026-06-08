import React, { useEffect, useMemo, useRef, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import CraeteUsersPage from './componets/craeteUser/craeteusers';
import UserList from './componets/userList/UserList';
import { getCurrentDateSAST } from '../../Date/dateUtils'; // Imported date utility


type User = {
  id: number;
  name: string;
  email: string;
  branch: string;
  role: string;
  status: string;
};

const Users: React.FC = () => {
  const currentDate = getCurrentDateSAST();
  // api instance not used here; we use localFetch for temporary local backend calls
  // Temporary: use local backend for users operations to avoid remote 401 during development
  const LOCAL_BASE = 'http://localhost:5253/api';

  const localFetch = (path: string, init?: RequestInit) => {
    const url = `${LOCAL_BASE}${path}`;
    const opts: RequestInit = {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...init,
    };
    return fetch(url, opts);
  };
  // `api` is an axios instance configured in `src/hooks/useApi.ts`.
  // All backend HTTP calls in this file use `api` and the base URL `http://localhost:5253/api`.
  // Backend endpoints used:
  //  - GET  /User             -> fetch all users (used in useEffect)
  //  - POST /User/employee    -> create a new employee (used in handleSaveUser)
  //  - PATCH /User/employee   -> update existing employee details (used in handleSaveUser)
  //  - DELETE /User/employee  -> delete an employee by id (used in handleDeleteUser)
  const [users, setUsers] = useState<User[]>([]);
  const [branchMap, setBranchMap] = useState<Record<number, string>>({});
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  // ensure we only try fetching users once per page load
  const usersFetchedRef = useRef(false);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? undefined,
    [users, selectedUserId]
  );

  const handleSelectUser = (id: number) => {
    setSelectedUserId(id);
  };

  const handleCreateNewUser = () => {
    setSelectedUserId(null);
  };

  const fetchUsers = async (): Promise<User[]> => {
    setLoading(true);
    try {
      const [adminsResp, employeesResp, branchesResp] = await Promise.all([
        localFetch('/User/admins'),
        localFetch('/User/employees'),
        localFetch('/Branch'),
      ]);

      const branches = (await branchesResp.json()) ?? [];
      const map: Record<number, string> = {};
      branches.forEach((b: any) => {
        const id = b.branchID ?? b.BranchID ?? b.branchId ?? b.BranchId ?? 0;
        const name = b.branchName ?? b.BranchName ?? b.name ?? '';
        if (id) map[id] = name;
      });
      setBranchMap(map);

      const makeUser = (e: any, role: 'Admin' | 'Employee') => {
        const id = e.employeeId ?? e.EmployeeId ?? e.EmployeeID ?? 0;
        const name = e.employeeName ?? e.EmployeeName ?? e.employeeName ?? '';
        const email = e.employeeEmail ?? e.EmployeeEmail ?? '';
        const branchId = e.branchId ?? e.BranchId ?? e.BranchID ?? 0;
        return {
          id,
          name,
          email,
          branch: String(branchId),
          role,
          status: 'Active',
        } as User;
      };

      const adminUsers = (await adminsResp.json() ?? []).map((e: any) => makeUser(e, 'Admin'));
      const employeeUsers = (await employeesResp.json() ?? []).map((e: any) => makeUser(e, 'Employee'));
      const combinedUsers = [...adminUsers, ...employeeUsers];

      setUsers(combinedUsers);
      return combinedUsers;
    } catch (err) {
      console.error('Fetch users failed', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (user: Omit<User, 'id'> & { id: number | null; password?: string }) => {
    try {
      if (user.id === null) {
        // Create new employee
        const payload = {
          BranchID: Number(user.branch),
          EmployeeEmail: user.email,
          EmployeeName: user.name,
          EmployeePassword: user.password ?? '',
          EmployeeLevel: user.role === 'Admin' ? 'Admin' : 'Employee',
        };
        // Verify current session is authorized (admin) before attempting create
        const meResp = await localFetch('/User/me');
        if (!meResp.ok) {
          const msg = await meResp.text().catch(() => 'No active session');
          throw new Error(`Not authorized: ${msg}`);
        }

        const resp = await localFetch('/User/employee', { method: 'POST', body: JSON.stringify(payload) });
        if (!resp.ok) {
          // try to show server-provided message when available
          const text = await resp.text().catch(() => '');
          throw new Error(`Create failed ${resp.status}${text ? `: ${text}` : ''}`);
        }
        const created = await resp.json();
        const createdId = created?.employeeId ?? created?.EmployeeId ?? created?.EmployeeID ?? null;
        const updatedUsers = await fetchUsers();
        if (createdId) {
          setSelectedUserId(createdId);
        } else {
          const matched = updatedUsers.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
          if (matched) setSelectedUserId(matched.id);
        }
        return;
      }

      // Update existing employee
      const existing = users.find((u) => u.id === user.id);
      const originalEmail = existing?.email ?? user.email;

      // If only branch changed, call branch-specific endpoint
      if (existing && existing.branch !== user.branch && existing.name === user.name && existing.email === user.email) {
        const branchUrl = `/User/employee/branch?EmployeeEmail=${encodeURIComponent(originalEmail)}&BranchId=${Number(
          user.branch
        )}`;
        const branchResp = await localFetch(branchUrl, { method: 'PATCH' });
        if (!branchResp.ok) throw new Error(`Branch update failed ${branchResp.status}`);
        await fetchUsers();
        setSelectedUserId(user.id);
        return;
      }

      // General details update (name/email/password)
      const updatePayload: any = {
        BranchID: Number(user.branch),
        EmployeeEmail: user.email,
        EmployeeName: user.name,
        EmployeeLevel: user.role === 'Admin' ? 'Admin' : 'Employee',
      };

      if (typeof user.password === 'string' && user.password.length > 0) {
        updatePayload.EmployeePassword = user.password;
      }

      const updUrl = `/User/employee?EmployeeEmail=${encodeURIComponent(originalEmail)}`;
      const updResp = await localFetch(updUrl, { method: 'PATCH', body: JSON.stringify(updatePayload) });
      if (!updResp.ok) throw new Error(`Update failed ${updResp.status}`);
      await fetchUsers();
      setSelectedUserId(user.id);
    } catch (err) {
      console.error('Save user failed', err);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const delResp = await localFetch(`/User/employee?id=${encodeURIComponent(String(id))}`, { method: 'DELETE' });
      if (!delResp.ok) throw new Error(`Delete failed ${delResp.status}`);
      await fetchUsers();
      setSelectedUserId(null);
      // do not clear or change current session when deleting a user
    } catch (err) {
      console.error('Delete user failed', err);
    }
  };

  const handleRequestEdit = async (id: number) => {
    try {
      // Refresh users/branches from backend to ensure latest state before editing.
      await fetchUsers();
      return true;
    } catch (err) {
      console.error('Request edit failed', err);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    if (usersFetchedRef.current) return; // already attempted fetch
    usersFetchedRef.current = true;
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      if (!mounted) return;
      console.error('Fetch users timed out');
      timedOut = true;
      setLoading(false);
    }, 4000);

    (async () => {
      setLoading(true);
      try {
        await fetchUsers();
      } catch (err) {
        console.error('Fetch users failed', err);
      } finally {
        // noop
      }
    })();

    return () => { mounted = false; clearTimeout(timeoutId); };
  }, []);

  return (
    <div className="page-content">
      <div className="space-y-4 sm:space-y-5">
        <PageHeader 
          title="User Management" 
          subtitle={`Manage users and add new accounts · ${currentDate}`} 
        />

        <div className="users-page grid gap-4 xl:grid-cols-[2fr,1fr]">
          <div className="users-panel">
            <CraeteUsersPage
              user={selectedUser}
              onSave={handleSaveUser}
              onDelete={handleDeleteUser}
              onRequestEdit={handleRequestEdit}
            />
          </div>
          <div className="users-panel">
            <UserList
              users={users}
              selectedUserId={selectedUserId}
              loading={loading}
              onSelectUser={handleSelectUser}
              onCreateNewUser={handleCreateNewUser}
              branchMap={branchMap}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;