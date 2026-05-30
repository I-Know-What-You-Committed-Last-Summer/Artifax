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

  const handleSaveUser = (user: Omit<User, 'id'> & { id: number | null }) => {
    if (user.id === null) {
      const nextId = Math.max(0, ...users.map((item) => item.id)) + 1;
      setUsers((prev) => [...prev, { ...user, id: nextId }]);
      setSelectedUserId(nextId);
      setCurrentUser({ name: user.name, role: user.role, email: user.email });
      return;
    }

    setUsers((prev) => prev.map((existing) => (existing.id === user.id ? { ...existing, ...user } : existing)));
    setCurrentUser({ name: user.name, role: user.role, email: user.email });
  };

  const handleDeleteUser = (id: number) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
    setSelectedUserId(null);
    clearCurrentUser();
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