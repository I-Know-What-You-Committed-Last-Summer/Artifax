import React, { useEffect, useMemo, useRef, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import CraeteUsersPage from './componets/craeteUser/craeteusers';
import UserList from './componets/userList/UserList';
import { getCurrentDateSAST } from '../../Date/dateUtils'; // Imported date utility
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

  const handleSaveUser = async (user: Omit<User, 'id'> & { id: number | null } & { password?: string }) => {
    try {
      if (user.id === null) {
        // Creating a new user: construct a payload expected by the backend CreateEmployee route.
        // The backend `UserController.CreateEmployee` expects an EmployeeWriteDto-like object.
        // POST /api/User/employee requires an admin session; if not present the server returns 401.
        const payload = { name: user.name, email: user.email, branch: user.branch, role: user.role, password: user.password ?? 'Password123!' };
        // Send POST to create employee. Response (`resp.data`) should contain the created record.
        const resp = await api.post('/User/employee', payload);
        const created = resp.data ?? payload;
        const newId = created.id ?? Math.max(0, ...users.map((u) => u.id)) + 1;
        setUsers((prev) => [...prev, { ...created, id: newId }]);
        setSelectedUserId(newId);
        return;
      }

      // Updating an existing user: call PATCH /api/User/employee with updated fields.
      // The backend expects identifying information and the updated DTO; the controller authorises by session.
      const payload = { id: user.id, name: user.name, email: user.email, branch: user.branch, role: user.role };
      await api.patch('/User/employee', payload);
      setUsers((prev) => prev.map((existing) => (existing.id === user.id ? { ...existing, ...payload } : existing)));
    } catch (err) {
      console.error('Save user failed', err);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      // Delete calls DELETE /api/User/employee?id={id}
      // The backend will reject this if there is no admin session set.
      await api.delete(`/User/employee?id=${id}`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setSelectedUserId(null);
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
      // Fetch the users list from backend: GET /api/User
      // Response expected: an array of EmployeeReadDto objects.
      // We set `loading` while the request is pending; a timeout will cancel it after 4s.
      setLoading(true);
      try {
        const resp = await api.get('/User');
        if (!mounted) return;
        if (!timedOut) setUsers(resp.data ?? []);
      } catch (err) {
        // On network or server error we log to console. Loading is cleared by finally.
        console.error('Fetch users failed', err);
      } finally {
        clearTimeout(timeoutId);
        if (mounted && !timedOut) {
          setLoading(false);
        }
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