import React, { useEffect, useMemo, useRef, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import CraeteUsersPage from './componets/craeteUser/craeteusers';
import UserList from './componets/userList/UserList';
import { getCurrentDateSAST } from '../../Date/dateUtils'; // Imported date utility
import { clearCurrentUser, setCurrentUser } from '../../utils/currentUser';
import { useApi } from '../../hooks/useApi';

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
  const api = useApi();
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [adminsResp, employeesResp, branchesResp] = await Promise.all([
        api.get('/User/admins'),
        api.get('/User/employees'),
        api.get('/Branch'),
      ]);

      const branches = branchesResp.data ?? [];
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

      const adminUsers = (adminsResp.data ?? []).map((e: any) => makeUser(e, 'Admin'));
      const employeeUsers = (employeesResp.data ?? []).map((e: any) => makeUser(e, 'Employee'));

      setUsers([...adminUsers, ...employeeUsers]);
    } catch (err) {
      console.error('Fetch users failed', err);
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
        const resp = await api.post('/User/employee', payload);
        await fetchUsers();
        const created = resp.data;
        const createdId = created?.employeeId ?? created?.EmployeeId ?? null;
        if (createdId) setSelectedUserId(createdId);
        setCurrentUser({ name: user.name, role: user.role, email: user.email });
        return;
      }

      // Update existing employee
      const existing = users.find((u) => u.id === user.id);
      const originalEmail = existing?.email ?? user.email;

      // If only branch changed, call branch-specific endpoint
      if (existing && existing.branch !== user.branch && existing.name === user.name && existing.email === user.email) {
        await api.patch('/User/employee/branch', null, { params: { EmployeeEmail: originalEmail, BranchId: Number(user.branch) } });
        await fetchUsers();
        setCurrentUser({ name: user.name, role: user.role, email: user.email });
        return;
      }

      // General details update (name/email/password)
      const updatePayload: any = {
        BranchID: Number(user.branch),
        EmployeeEmail: user.email,
        EmployeeName: user.name,
        EmployeePassword: user.password ?? '',
        EmployeeLevel: user.role === 'Admin' ? 'Admin' : 'Employee',
      };

      await api.patch('/User/employee', updatePayload, { params: { EmployeeEmail: originalEmail } });
      await fetchUsers();
      setCurrentUser({ name: user.name, role: user.role, email: user.email });
    } catch (err) {
      console.error('Save user failed', err);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await api.delete('/User/employee', { params: { id } });
      await fetchUsers();
      setSelectedUserId(null);
      clearCurrentUser();
    } catch (err) {
      console.error('Delete user failed', err);
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
  }, [api]);

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
            />
          </div>
          <div className="users-panel">
            <UserList
              users={users}
              selectedUserId={selectedUserId}
              loading={loading}
              onSelectUser={handleSelectUser}
              onCreateNewUser={handleCreateNewUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;